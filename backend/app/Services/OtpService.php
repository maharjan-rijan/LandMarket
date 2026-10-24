<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OtpService
{
    public const LENGTH = 6;
    public const MINUTES = 10;        // how long a code lives
    public const RESEND_SECONDS = 60; // minimum gap between two codes for the same $id
    public const MAX_ATTEMPTS = 5;    // wrong guesses before the code is burned
    public const TOKEN_MINUTES = 15;  // how long a "code was accepted" token lives

    private function key(string $part, string $scope, string $id): string
    {
        return "otp:{$scope}:{$part}:".sha1($id);
    }

    /**
     * Make a new code. Returns the plain code to email, or null when one was sent
     * less than RESEND_SECONDS ago.
     */
    public function issue(string $scope, string $id): ?string
    {
        // Cache::add only succeeds while the key is free, so it is also the resend limit.
        if (! Cache::add($this->key('sent', $scope, $id), true, now()->addSeconds(self::RESEND_SECONDS))) {
            return null;
        }

        // random_int, not rand(): the code is a secret
        $code = str_pad((string) random_int(0, 10 ** self::LENGTH - 1), self::LENGTH, '0', STR_PAD_LEFT);
        $ttl = now()->addMinutes(self::MINUTES);

        Cache::put($this->key('code', $scope, $id), Hash::make($code), $ttl); // hashed, never the plain code
        Cache::put($this->key('tries', $scope, $id), 0, $ttl);

        return $code;
    }

    /**
     * Check a code. Returns normally when it matches; otherwise throws a 422 with
     * errors.code[0], the shape the React forms already show.
     */
    public function check(string $scope, string $id, string $code): void
    {
        $hash = Cache::get($this->key('code', $scope, $id));

        if (! $hash) {
            $this->fail('This code has expired. Request a new one.');
        }

        if ((int) Cache::get($this->key('tries', $scope, $id), 0) >= self::MAX_ATTEMPTS) {
            $this->forget($scope, $id);
            $this->fail('Too many wrong attempts. Request a new code.');
        }

        if (! Hash::check($code, $hash)) {
            Cache::increment($this->key('tries', $scope, $id));
            $this->fail('That code is not correct.');
        }
    }

    /**
     * After a code is accepted, hand out a one-time token. The next step (for example the
     * new password form) sends the token back instead of the code, so the code is not reused.
     */
    public function issueToken(string $scope, string $id): string
    {
        $token = Str::random(48);
        Cache::put($this->key('token', $scope, $id), hash('sha256', $token), now()->addMinutes(self::TOKEN_MINUTES));

        return $token;
    }

    // Throws the same 422 shape when the token is missing, wrong or expired.
    public function checkToken(string $scope, string $id, string $token): void
    {
        $hash = Cache::get($this->key('token', $scope, $id));

        if (! $hash || ! hash_equals($hash, hash('sha256', $token))) {
            throw ValidationException::withMessages(['token' => ['This reset link expired. Start again.']]);
        }
    }

    public function forgetToken(string $scope, string $id): void
    {
        Cache::forget($this->key('token', $scope, $id));
    }

    // Call after a successful use so the code cannot be used twice.
    public function forget(string $scope, string $id): void
    {
        Cache::forget($this->key('code', $scope, $id));
        Cache::forget($this->key('tries', $scope, $id));
    }

    public function fail(string $message): never
    {
        throw ValidationException::withMessages(['code' => [$message]]);
    }
}
