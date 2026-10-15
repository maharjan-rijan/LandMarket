<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ApiHelpers;
use App\Http\Controllers\Controller;
use App\Models\Demand;
use App\Models\Inquiry;
use App\Models\Land;
use App\Models\SavedLand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Everything a buyer does (routes are behind role:buyer):
 *   inquiries, sendInquiry            GET /buyer/inquiries, POST /lands/{land}/inquiries
 *   saved, saveLand, unsaveLand       GET /buyer/saved, POST|DELETE /buyer/saved/{land}
 *   demands, createDemand, updateDemand
 *   purchases
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

    /** GET /buyer/purchases  (lands a seller marked as sold to this buyer, with their ownership record) */
    public function purchases(): JsonResponse
    {
        $lands = Land::where('sold_to', $this->userId())->orderBy('sold_at', 'desc')->get();

        return response()->json($lands->map(fn ($l) => [
            'id'    => (string) $l->getKey(),
            'land'  => $this->landPayload($l, true),
            'price' => (int) round($l->area_aana * $l->price_per_aana),
            'date'  => $l->sold_at,
        ])->values()->all());
    }
}
