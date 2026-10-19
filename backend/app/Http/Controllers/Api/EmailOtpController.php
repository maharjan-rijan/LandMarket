<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\EmailOtpMail;
use App\Models\EmailOtp;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class EmailOtpController extends Controller
{
    private const LENGTH = 6;
    private const MINUTES = 10;       // how long a code lives
    private const RESEND_SECONDS = 60; // minimum gap between emails
    private const MAX_ATTEMPTS = 5;    // wrong guesses before the code is burned

    // POST /auth/email/send-otp
    public function send(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Your email is already verified.'], 409);
        }

        $existing = EmailOtp::where('user_id', $user->id)->first();
        if ($existing && $existing->sent_at->diffInSeconds(now(), true) < self::RESEND_SECONDS) {
            $wait = self::RESEND_SECONDS - (int) $existing->sent_at->diffInSeconds(now(), true);

            return response()->json(['message' => "Please wait {$wait} seconds before asking for another code."], 429);
        }

        // random_int, not rand(): the code is a secret
        $code = str_pad((string) random_int(0, 10 ** self::LENGTH - 1), self::LENGTH, '0', STR_PAD_LEFT);

        EmailOtp::updateOrCreate(
            ['user_id' => $user->id],
            [
                'code_hash' => Hash::make($code),
                'attempts' => 0,
                'expires_at' => now()->addMinutes(self::MINUTES),
                'sent_at' => now(),
            ],
        );

        Mail::to($user->email)->send(new EmailOtpMail($user->name, $code, self::MINUTES));

        return response()->json(['message' => 'Verification code sent.']);
    }

    // POST /auth/email/verify  { code }
    public function verify(Request $request): JsonResponse
    {
        $request->validate(['code' => ['required', 'digits:'.self::LENGTH]]);

        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['user' => $user]);
        }

        $otp = EmailOtp::where('user_id', $user->id)->first();

        if (! $otp || $otp->expires_at->isPast()) {
            $otp?->delete();
            $this->fail('This code has expired. Request a new one.');
        }

        if ($otp->attempts >= self::MAX_ATTEMPTS) {
            $otp->delete();
            $this->fail('Too many wrong attempts. Request a new code.');
        }

        if (! Hash::check($request->input('code'), $otp->code_hash)) {
            $otp->increment('attempts');
            $this->fail('That code is not correct.');
        }

        $user->markEmailAsVerified();
        $otp->delete();

        return response()->json(['user' => $user->fresh()]);
    }

    // Same shape the React app already reads: errors.code[0]
    private function fail(string $message): never
    {
        throw ValidationException::withMessages(['code' => [$message]]);
    }
}
