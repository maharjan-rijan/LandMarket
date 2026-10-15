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

/**
 * The admin tools (routes are behind role:admin).
 * There is no review step: listings go live when a seller adds them.
 *
 *   summary                      GET    /admin/summary
 *   users, setUserStatus         GET    /admin/users,  PATCH /admin/users/{user}/status
 *   lands, deleteLand            GET    /admin/lands,  DELETE /admin/lands/{land}
 */
class AdminController extends Controller
{
    use ApiHelpers;

    /** GET /admin/summary */
    public function summary(): JsonResponse
    {
        $byStatus = [];
        foreach (['active', 'sold', 'closed'] as $status) {
            $byStatus[$status] = Land::where('status', $status)->count();
        }

        return response()->json([
            'users'        => User::count(),
            'sellers'      => Store::count(),
            'lands'        => $byStatus,
            'inquiries'    => Inquiry::count(),
            'open_demands' => Demand::where('status', 'open')->count(),
        ]);
    }

    // ---------------------------------------------------------------- users

    /** GET /admin/users?role=&q=  (passwords are never included) */
    public function users(Request $request): JsonResponse
    {
        $query = User::query();

        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }

        if ($term = trim((string) $request->query('q', ''))) {
            $re = '/' . preg_quote($term, '/') . '/i';
            $query->where(fn ($w) => $w->where('name', 'regexp', $re)->orWhere('email', 'regexp', $re));
        }

        return response()->json($this->shapeAll($query->orderBy('created_at', 'desc')->limit(500)->get()));
    }

    /** PATCH /admin/users/{user}/status  { status: active|suspended } */
    public function setUserStatus(Request $request, User $user): JsonResponse
    {
        $data = $request->validate(['status' => ['required', Rule::in(['active', 'suspended'])]]);

        abort_if($user->role === 'admin', 422, 'Admin accounts cannot be suspended.');

        $user->status = $data['status'];
        $user->save();

        if ($data['status'] === 'suspended') {
            $user->tokens()->delete(); // log them out everywhere
        }

        return response()->json($this->shape($user));
    }

    // ---------------------------------------------------------------- listings

    /** GET /admin/lands?status=active  (omit status for everything) */
    public function lands(Request $request): JsonResponse
    {
        $query = Land::query();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return response()->json($this->shapeAll($query->orderBy('created_at', 'desc')->limit(500)->get()));
    }

    /** DELETE /admin/lands/{land} */
    public function deleteLand(Land $land): Response
    {
        $id = (string) $land->getKey();
        OwnershipTransfer::where('land_id', $id)->delete();
        SavedLand::where('land_id', $id)->delete();
        $land->delete();

        return response()->noContent();
    }
}
