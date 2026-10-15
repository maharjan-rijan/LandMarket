<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ApiHelpers;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * Everything about the person themselves:
 *   register, login, me, logout            POST /auth/register ...
 *   updateProfile, updatePassword          PUT  /account/profile, /account/password
 *   updateRole                             PATCH /account/role  (a "user" chooses buyer or seller, once)
 */
class AuthController extends Controller
{
    use ApiHelpers;

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'       => ['required', 'string', 'max:255'],
            'email'      => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'   => ['required', 'string', 'min:8', 'confirmed'],
            'role'       => ['required', 'in:user,buyer,seller'], // admin is never created here
            'phone'      => ['nullable', 'string', 'max:20'],
            'store_name' => ['nullable', 'string', 'max:255'],
        ]);

        $user = new User([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => $data['password'], // the "hashed" cast hashes it
            'role'     => $data['role'],
            'phone'    => $data['phone'] ?? null,
        ]);
        $user->status = 'active';
        $user->save();

        if ($user->role === 'seller') {
            $this->storeFor($user, $data['store_name'] ?? null);
        }

        return response()->json([
            'user'  => $user,
            'token' => $user->createToken('auth_token')->plainTextToken,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Invalid email or password.'], 422);
        }

        if (($user->status ?? 'active') === 'suspended') {
            return response()->json(['message' => 'Your account is suspended. Contact support.'], 403);
        }

        return response()->json([
            'user'  => $user,
            'token' => $user->createToken('auth_token')->plainTextToken,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    // ---------------------------------------------------------------- account

    public function updateProfile(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        $user = $request->user();
        $user->update($data);

        return response()->json($user->fresh());
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password'         => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        if (! Hash::check($data['current_password'], $user->password)) {
            return response()->json([
                'message' => 'The current password is incorrect.',
                'errors'  => ['current_password' => ['The current password is incorrect.']],
            ], 422);
        }

        $user->update(['password' => $data['password']]); // the "hashed" cast hashes it

        return response()->json(['message' => 'Password updated.']);
    }

    public function updateRole(Request $request): JsonResponse
    {
        $data = $request->validate(['role' => ['required', 'in:buyer,seller']]);

        $user = $request->user();

        // Only plain members can choose. Buyers, sellers and admins keep their role.
        if ($user->role !== 'user') {
            return response()->json(['message' => 'Your role is already set.'], 422);
        }

        $user->update(['role' => $data['role']]);

        if ($data['role'] === 'seller') {
            $this->storeFor($user);
        }

        return response()->json($user->fresh());
    }
}
