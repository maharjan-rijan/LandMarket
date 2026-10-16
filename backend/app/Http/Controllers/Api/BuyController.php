<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ApiHelpers;
use App\Http\Controllers\Controller;
use App\Models\Demand;
use App\Models\Inquiry;
use App\Models\Land;
use App\Models\OwnershipTransfer;
use App\Models\SavedLand;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Everything a buyer does (routes are behind role:buyer):
 *   inquiries, sendInquiry            GET /buyer/inquiries, POST /lands/{land}/inquiries
 *   saved, saveLand, unsaveLand       GET /buyer/saved, POST|DELETE /buyer/saved/{land}
 *   demands, createDemand, updateDemand
 *   purchases, resellLand             GET /buyer/purchases, POST /buyer/purchases/{land}/resell
 */
class BuyController extends Controller
{
    use ApiHelpers;

    // ---------------------------------------------------------------- inquiries

    /** GET /buyer/inquiries */
    public function inquiries(): JsonResponse
    {
        $inquiries = Inquiry::where('buyer_id', $this->userId())->orderBy('created_at', 'desc')->get();
        $lands = $this->landsById($inquiries->pluck('land_id'));

        return response()->json($inquiries->map(function ($i) use ($lands) {
            $row = $this->shape($i);
            $row['land'] = isset($lands[$i->land_id]) ? $this->landPayload($lands[$i->land_id]) : null;

            return $row;
        })->values()->all());
    }

    /** POST /lands/{land}/inquiries */
    public function sendInquiry(Request $request, Land $land): JsonResponse
    {
        abort_unless($land->status === 'active', 422, 'This land is no longer available.');

        $data = $request->validate([
            'message' => ['required', 'string', 'min:10', 'max:2000'],
            'phone'   => ['nullable', 'string', 'max:20'],
        ]);

        $user = $request->user();

        $inquiry = Inquiry::create([
            'land_id'     => (string) $land->getKey(),
            'store_id'    => $land->store_id,
            'buyer_id'    => (string) $user->getKey(),
            'buyer_name'  => $user->name,
            'buyer_email' => $user->email,
            'buyer_phone' => $data['phone'] ?? $user->phone,
            'message'     => $data['message'],
            'status'      => 'new',
        ]);

        return response()->json($this->shape($inquiry), 201);
    }

    // ---------------------------------------------------------------- saved lands

    /** GET /buyer/saved  -> { ids: [...], lands: [...] } */
    public function saved(): JsonResponse
    {
        $ids = SavedLand::where('user_id', $this->userId())->pluck('land_id')->values()->all();

        return response()->json([
            'ids'   => $ids,
            'lands' => $this->shapeAll($this->landsById($ids)->values()),
        ]);
    }

    /** POST /buyer/saved/{land} */
    public function saveLand(Land $land): JsonResponse
    {
        SavedLand::firstOrCreate([
            'user_id' => $this->userId(),
            'land_id' => (string) $land->getKey(),
        ]);

        return response()->json(['saved' => true], 201);
    }

    /** DELETE /buyer/saved/{land} */
    public function unsaveLand(Land $land): JsonResponse
    {
        SavedLand::where('user_id', $this->userId())
            ->where('land_id', (string) $land->getKey())
            ->delete();

        return response()->json(['saved' => false]);
    }

    // ---------------------------------------------------------------- demands ("post demand")

    /** GET /buyer/demands */
    public function demands(): JsonResponse
    {
        $demands = Demand::where('buyer_id', $this->userId())->orderBy('created_at', 'desc')->get();

        return response()->json($this->shapeAll($demands));
    }

    /** POST /buyer/demands */
    public function createDemand(Request $request): JsonResponse
    {
        $data = $request->validate([
            'district'           => ['required', 'string', 'max:100'],
            'min_aana'           => ['required', 'numeric', 'gt:0'],
            'max_price_per_aana' => ['required', 'numeric', 'gt:0'],
            'phone'              => ['nullable', 'string', 'max:20'],
            'note'               => ['nullable', 'string', 'max:500'],
        ]);

        $user = $request->user();

        $demand = Demand::create([
            'buyer_id'           => (string) $user->getKey(),
            'buyer_name'         => $user->name,
            'phone'              => $data['phone'] ?? $user->phone,
            'district'           => $data['district'],
            'min_aana'           => $data['min_aana'],
            'max_price_per_aana' => $data['max_price_per_aana'],
            'note'               => $data['note'] ?? '',
            'status'             => 'open',
        ]);

        return response()->json($this->shape($demand), 201);
    }

    /** PATCH /buyer/demands/{demand}  { status: open|closed } */
    public function updateDemand(Request $request, Demand $demand): JsonResponse
    {
        abort_unless($demand->buyer_id === $this->userId(), 403, 'This demand belongs to another buyer.');

        $data = $request->validate(['status' => ['required', Rule::in(['open', 'closed'])]]);

        $demand->status = $data['status'];
        $demand->save();

        return response()->json($this->shape($demand));
    }

    // ---------------------------------------------------------------- purchases

    /**
     * GET /buyer/purchases
     * Lands this buyer owns now, plus lands they bought and have since sold on (kept as a record).
     */
    public function purchases(): JsonResponse
    {
        $uid = $this->userId();

        $byId = [];
        foreach (Land::where('sold_to', $uid)->get() as $land) {
            $byId[(string) $land->getKey()] = $land;
        }

        // lands that passed through this buyer's hands: bought by them, or sold on by them
        $pastIds = OwnershipTransfer::where(fn($q) => $q->where('to_user_id', $uid)->orWhere('from_user_id', $uid))
            ->pluck('land_id')
            ->unique()
            ->values()
            ->all();

        foreach ($this->landsById($pastIds) as $id => $land) {
            $byId[$id] ??= $land;
        }

        $items = array_map(fn($land) => $this->purchaseItem($land, $uid), array_values($byId));
        usort($items, fn($a, $b) => strcmp((string) $b['date'], (string) $a['date'])); // newest first

        return response()->json($items);
    }

    /**
     * POST /buyer/purchases/{land}/resell  { buyer_name, buyer_email? }
     *
     * The buyer sells the land on. The new owner is added to the ownership record. If the
     * email belongs to a LandMarket account, the land moves to that person's Purchases.
     * The land stays in this buyer's table, marked as sold on.
     */
    public function resellLand(Request $request, Land $land): JsonResponse
    {
        $uid = $this->userId();

        abort_unless($land->sold_to === $uid, 403, 'You do not own this land.');

        $data = $request->validate([
            'buyer_name'  => ['required', 'string', 'min:2', 'max:255'],
            'buyer_email' => ['nullable', 'email', 'max:255'],
        ]);

        $newOwner = ! empty($data['buyer_email']) ? User::where('email', $data['buyer_email'])->first() : null;

        abort_if($newOwner && (string) $newOwner->getKey() === $uid, 422, 'This land is already yours.');

        OwnershipTransfer::create([
            'land_id'      => (string) $land->getKey(),
            'from_owner'   => $request->user()->name,
            'from_user_id' => $uid,
            'to_owner'     => trim($data['buyer_name']),
            'to_user_id'   => $newOwner ? (string) $newOwner->getKey() : null,
            'date'         => now()->toDateString(),
            'note'         => 'Sold on through LandMarket',
        ]);

        $land->sold_to = $newOwner ? (string) $newOwner->getKey() : null;
        $land->sold_at = now()->toDateString();
        $land->save();

        return response()->json($this->purchaseItem($land, $uid));
    }

    /** One row of the buyer's Purchases table. */
    private function purchaseItem(Land $land, string $uid): array
    {
        $rows = $this->chainRows($land);
        $owned = $land->sold_to === $uid;
        $name = request()->user()->name;

        // The transfer that gave this buyer the land. Records made before transfers stored a
        // user id are matched by name instead.
        $acquired = null;
        $resale = null;
        foreach ($rows as $t) {
            if ($t->to_user_id === $uid || ($t->to_user_id === null && $t->to_owner === $name)) {
                $acquired = $t;
            }
            if ($t->from_user_id === $uid) {
                $resale = $t;
            }
        }

        $data = $this->shape($land);
        $data['chain'] = $this->formatChain($rows);

        return [
            'id'           => (string) $land->getKey(),
            'land'         => $data,
            'price'        => (int) round($land->area_aana * $land->price_per_aana),
            'date'         => $acquired?->date ?? $land->sold_at,
            'owned'        => $owned,
            'sold_to_name' => (! $owned && $resale) ? $resale->to_owner : null,
            'resold_at'    => (! $owned && $resale) ? $resale->date : null,
        ];
    }
}
