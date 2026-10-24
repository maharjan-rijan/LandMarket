<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
    public function send(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Your email is already verified.'], 409);
        }

        $code = $this->otp->issue(self::SCOPE, (string) $user->getKey());

        if ($code === null) {
            return response()->json(['message' => 'Please wait a minute before asking for another code.'], 429);
        }

        Mail::to($user->email)->send(OtpMail::verifyEmail($user->name, $code, OtpService::MINUTES));

        return response()->json(['message' => 'Verification code sent.']);
    }

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
}
