<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ApiHelpers;
use App\Http\Controllers\Controller;
use App\Models\Demand;
use App\Models\Inquiry;
use App\Models\Land;
use App\Models\OwnershipTransfer;
use App\Models\SavedLand;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Everything a seller does (routes are behind role:seller). A seller can only touch their own
 * store, lands and inquiries: anything else is refused with 403.
 *
 *   summary
 *   lands, createLand, showLand, updateLand, setLandStatus, deleteLand
 *   inquiries, updateInquiry, demands
 *   showStore, updateStore
 */
class SellController extends Controller
{
    use ApiHelpers;

    private const DISTRICTS = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan'];
    private const FACINGS = ['East', 'West', 'North', 'South', 'North-East', 'South-East'];
    private const DOCUMENTS = ['Lalpurja', 'Trace map', 'Tax receipt', 'Land revenue clearance'];

    // ---------------------------------------------------------------- dashboard

    /** GET /seller/summary */
    public function summary(Request $request): JsonResponse
    {
        $storeId = (string) $this->ownStore($request)->getKey();
        $lands = Land::where('store_id', $storeId)->get();

        return response()->json([
            'listings'      => $lands->count(),
            'active'        => $lands->where('status', 'active')->count(),
            'sold'          => $lands->where('status', 'sold')->count(),
            'views'         => (int) $lands->sum('views'),
            'new_inquiries' => Inquiry::where('store_id', $storeId)->where('status', 'new')->count(),
        ]);
    }

    // ---------------------------------------------------------------- listings

    /** GET /seller/lands  (every status, newest first) */
    public function lands(Request $request): JsonResponse
    {
        $lands = Land::where('store_id', (string) $this->ownStore($request)->getKey())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($this->shapeAll($lands));
    }

    /** POST /seller/lands  (the listing goes live straight away) */
    public function createLand(Request $request): JsonResponse
    {
        $data = $request->validate($this->landRules());

        if (! in_array('Lalpurja', $data['documents'], true)) {
            throw ValidationException::withMessages(['documents' => 'A lalpurja is required for every listing.']);
        }

        $user = $request->user();

        $land = Land::create(array_merge($data, [
            'description' => $data['description'] ?? '',
            'store_id'    => (string) $this->ownStore($request)->getKey(),
            'owner_id'    => (string) $user->getKey(),
            'status'      => 'active',
            'featured'    => false,
            'views'       => 0,
        ]));

        OwnershipTransfer::create([
            'land_id'    => (string) $land->getKey(),
            'from_owner' => null,
            'to_owner'   => $user->name,
            'date'       => now()->toDateString(),
            'note'       => 'Current owner',
        ]);

        return response()->json($this->landPayload($land, true), 201);
    }

    /** GET /seller/lands/{land} */
    public function showLand(Request $request, Land $land): JsonResponse
    {
        $this->authorizeLand($request, $land);

        return response()->json($this->landPayload($land, true));
    }

    /** PUT /seller/lands/{land} */
    public function updateLand(Request $request, Land $land): JsonResponse
    {
        $this->authorizeLand($request, $land);
        abort_if($land->status === 'sold', 422, 'A sold listing cannot be edited.');

        $land->fill($request->validate($this->landRules(partial: true)));
        $land->save();

        return response()->json($this->landPayload($land, true));
    }

    /** PATCH /seller/lands/{land}/status  { status, buyer_name?, buyer_email? } */
    public function setLandStatus(Request $request, Land $land): JsonResponse
    {
        $this->authorizeLand($request, $land);

        $data = $request->validate([
            'status'      => ['required', Rule::in(['active', 'sold', 'closed'])],
            'buyer_name'  => ['nullable', 'string', 'max:255'],
            'buyer_email' => ['nullable', 'email', 'max:255'],
        ]);

        // What a seller may do from each status.
        $allowed = [
            'active' => ['sold', 'closed'],
            'closed' => ['active'],
        ];

        abort_unless(
            in_array($data['status'], $allowed[$land->status] ?? [], true),
            422,
            "A {$land->status} listing cannot be changed to {$data['status']}."
        );

        if ($data['status'] === 'sold') {
            $buyer = ! empty($data['buyer_email']) ? User::where('email', $data['buyer_email'])->first() : null;
            $buyerName = ($data['buyer_name'] ?? null) ?: $buyer?->name;

            $land->sold_at = now()->toDateString();
            if ($buyer) {
                $land->sold_to = (string) $buyer->getKey(); // shows up in the buyer's Purchases
            }

            if ($buyerName) {
                OwnershipTransfer::create([
                    'land_id'    => (string) $land->getKey(),
                    'from_owner' => $request->user()->name,
                    'to_owner'   => $buyerName,
                    'date'       => now()->toDateString(),
                    'note'       => 'Sold through LandMarket',
                ]);
            }
        }

        $land->status = $data['status'];
        $land->save();

        return response()->json($this->landPayload($land, true));
    }

    /** DELETE /seller/lands/{land} */
    public function deleteLand(Request $request, Land $land): Response
    {
        $this->authorizeLand($request, $land);

        $id = (string) $land->getKey();
        OwnershipTransfer::where('land_id', $id)->delete();
        SavedLand::where('land_id', $id)->delete();
        $land->delete();

        return response()->noContent();
    }

    // ---------------------------------------------------------------- inbox

    /** GET /seller/inquiries */
    public function inquiries(Request $request): JsonResponse
    {
        $inquiries = Inquiry::where('store_id', (string) $this->ownStore($request)->getKey())
            ->orderBy('created_at', 'desc')
            ->get();

        $lands = $this->landsById($inquiries->pluck('land_id'));

        return response()->json($inquiries->map(function ($i) use ($lands) {
            $row = $this->shape($i);
            $row['land'] = isset($lands[$i->land_id]) ? $this->landPayload($lands[$i->land_id]) : null;

            return $row;
        })->values()->all());
    }

    /** PATCH /seller/inquiries/{inquiry}  { status: replied|closed } */
    public function updateInquiry(Request $request, Inquiry $inquiry): JsonResponse
    {
        abort_unless(
            $inquiry->store_id === (string) $this->ownStore($request)->getKey(),
            403,
            'This inquiry belongs to another seller.'
        );

        $data = $request->validate(['status' => ['required', Rule::in(['replied', 'closed'])]]);

        $inquiry->status = $data['status'];
        $inquiry->save();

        return response()->json($this->shape($inquiry));
    }

    /** GET /seller/demands  (open demands from every buyer; the app works out which lands match) */
    public function demands(): JsonResponse
    {
        $demands = Demand::where('status', 'open')->orderBy('created_at', 'desc')->limit(200)->get();

        return response()->json($this->shapeAll($demands));
    }

    // ---------------------------------------------------------------- store profile

    /** GET /seller/store */
    public function showStore(Request $request): JsonResponse
    {
        return response()->json($this->shape($this->ownStore($request)));
    }

    /** PUT /seller/store */
    public function updateStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => ['required', 'string', 'min:2', 'max:255'],
            'type'     => ['required', Rule::in(['Owner', 'Agency'])],
            'district' => ['required', Rule::in(self::DISTRICTS)],
            'phone'    => ['nullable', 'string', 'max:20'],
            'email'    => ['nullable', 'email', 'max:255'],
            'about'    => ['nullable', 'string', 'max:1000'],
        ]);

        $store = $this->ownStore($request);
        $store->fill($data);
        $store->save();

        return response()->json($this->shape($store));
    }

    // ---------------------------------------------------------------- helpers

    private function ownStore(Request $request): Store
    {
        return $this->storeFor($request->user());
    }

    private function authorizeLand(Request $request, Land $land): void
    {
        abort_unless(
            $land->store_id === (string) $this->ownStore($request)->getKey(),
            403,
            'This land belongs to another seller.'
        );
    }

    private function landRules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';

        return [
            'title'          => [$req, 'string', 'min:5', 'max:150'],
            'district'       => [$req, Rule::in(self::DISTRICTS)],
            'municipality'   => [$req, 'string', 'max:100'],
            'ward'           => [$req, 'integer', 'between:1,35'],
            'area_aana'      => [$req, 'numeric', 'gt:0'],
            'price_per_aana' => [$req, 'numeric', 'gt:0'],
            'road_ft'        => [$req, 'integer', 'min:4'],
            'facing'         => [$req, Rule::in(self::FACINGS)],
            'description'    => ['nullable', 'string', 'max:2000'],
            'documents'      => [$req, 'array'],
            'documents.*'    => [Rule::in(self::DOCUMENTS)],
        ];
    }
}
