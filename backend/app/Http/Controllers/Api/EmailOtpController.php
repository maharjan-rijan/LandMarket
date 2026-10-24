<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
<<<<<<< HEAD
use App\Mail\OtpMail;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

// Verify the logged-in user's email. Routes: POST /account/email/send-otp and /account/email/verify
class EmailOtpController extends Controller
{
    private const SCOPE = 'email-verify';

    public function __construct(private OtpService $otp) {}

    // POST /account/email/send-otp
=======
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
>>>>>>> 28b5ddfd326781e19d70ed92f750195485336fce
    public function send(Request $request): JsonResponse
    {
        $user = $request->user();

<<<<<<< HEAD
        if ($user->email_verified_at) {
            return response()->json(['message' => 'Your email is already verified.'], 409);
        }

        $code = $this->otp->issue(self::SCOPE, (string) $user->getKey());

        if ($code === null) {
            return response()->json(['message' => 'Please wait a minute before asking for another code.'], 429);
        }

        Mail::to($user->email)->send(OtpMail::verifyEmail($user->name, $code, OtpService::MINUTES));
=======
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
>>>>>>> 28b5ddfd326781e19d70ed92f750195485336fce

        return response()->json(['message' => 'Verification code sent.']);
    }

<<<<<<< HEAD
    // POST /account/email/verify  { code }
    public function verify(Request $request): JsonResponse
    {
        $request->validate(['code' => ['required', 'digits:'.OtpService::LENGTH]]);

        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json(['user' => $user]);
        }

        $id = (string) $user->getKey();
        $this->otp->check(self::SCOPE, $id, $request->input('code'));

        $user->forceFill(['email_verified_at' => now()])->save();
        $this->otp->forget(self::SCOPE, $id);

        return response()->json(['user' => $user->fresh()]);
    }
=======
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
>>>>>>> 28b5ddfd326781e19d70ed92f750195485336fce
}
