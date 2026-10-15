<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ApiHelpers;
use App\Http\Controllers\Controller;
use App\Models\Land;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * What anyone can see, logged in or not:
 *   index, show                      GET /lands, /lands/{land}
 *   stores, showStore, storeLands    GET /stores, /stores/{store}, /stores/{store}/lands
 */
class LandController extends Controller
{
    use ApiHelpers;

    /** GET /lands  (active lands only; every filter is optional) */
    public function index(Request $request): JsonResponse
    {
        $query = Land::where('status', 'active');

        if ($district = $request->query('district')) {
            $query->where('district', $district);
        }

        if ($term = trim((string) $request->query('q', ''))) {
            $re = '/' . preg_quote($term, '/') . '/i';
            $query->where(fn ($w) => $w
                ->where('title', 'regexp', $re)
                ->orWhere('municipality', 'regexp', $re)
                ->orWhere('district', 'regexp', $re));
        }

        if ($v = $request->query('max_price')) {
            $query->where('price_per_aana', '<=', (int) $v);
        }
        if ($v = $request->query('min_area')) {
            $query->where('area_aana', '>=', (float) $v);
        }
        if ($v = $request->query('min_road')) {
            $query->where('road_ft', '>=', (int) $v);
        }

        switch ($request->query('sort')) {
            case 'price-asc':
                $query->orderBy('price_per_aana');
                break;
            case 'price-desc':
                $query->orderBy('price_per_aana', 'desc');
                break;
            case 'area-desc':
                $query->orderBy('area_aana', 'desc');
                break;
            case 'area-asc':
                $query->orderBy('area_aana');
                break;
            default:
                $query->orderBy('featured', 'desc')->orderBy('created_at', 'desc');
        }

        return response()->json($this->shapeAll($query->limit(500)->get()));
    }

    /** GET /lands/{land}  (with the ownership record) */
    public function show(Land $land): JsonResponse
    {
        if ($land->status === 'active') {
            $land->increment('views');
        }

        return response()->json($this->landPayload($land, true));
    }

    /** GET /stores */
    public function stores(): JsonResponse
    {
        return response()->json($this->shapeAll(Store::orderBy('name')->get()));
    }

    /** GET /stores/{store} */
    public function showStore(Store $store): JsonResponse
    {
        return response()->json($this->shape($store));
    }

    /** GET /stores/{store}/lands  (active and sold) */
    public function storeLands(Store $store): JsonResponse
    {
        $lands = Land::where('store_id', (string) $store->getKey())
            ->whereIn('status', ['active', 'sold'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($this->shapeAll($lands));
    }
}
