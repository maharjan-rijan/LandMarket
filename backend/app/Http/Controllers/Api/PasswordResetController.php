<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

// Forgot password for people who are not logged in, in three steps:
//   1. POST /auth/forgot-password    { email }                  emails a code
//   2. POST /auth/verify-reset-code  { email, code }            checks the code, returns a token
//   3. POST /auth/reset-password     { email, token, password, password_confirmation }
class PasswordResetController extends Controller
{
    private const SCOPE = 'password-reset';

    public function __construct(private OtpService $otp) {}

    // Step 1. Always answers 200 with the same text, so nobody can learn which emails have accounts.
    public function forgot(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        $email = Str::lower($request->input('email'));
        $user = User::where('email', $email)->first();

        if ($user && ($user->status ?? 'active') === 'active') {
            $code = $this->otp->issue(self::SCOPE, $email); // null = asked again too soon: stay quiet

            if ($code !== null) {
                Mail::to($user->email)->send(OtpMail::passwordReset($user->name, $code, OtpService::MINUTES));
            }
        }

        return response()->json(['message' => 'If that email has an account, a code is on its way.']);
    }

    // Step 2. A right code returns a one-time token; the code itself is used up.
    public function verifyCode(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'digits:'.OtpService::LENGTH],
        ]);

        $email = Str::lower($data['email']);
        $this->otp->check(self::SCOPE, $email, $data['code']); // throws errors.code on a bad code
        $this->otp->forget(self::SCOPE, $email);

        return response()->json(['token' => $this->otp->issueToken(self::SCOPE, $email)]);
    }

    // Step 3. Needs the token from step 2, so the password form cannot be reached with a guessed code.
    public function reset(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $email = Str::lower($data['email']);
        $this->otp->checkToken(self::SCOPE, $email, $data['token']);

        $user = User::where('email', $email)->first();
        if (! $user) {
            $this->otp->forgetToken(self::SCOPE, $email);
            $this->otp->fail('This reset link expired. Start again.');
        }

        $user->forceFill(['password' => Hash::make($data['password'])])->save();
        $user->tokens()->delete(); // log out every device
        $this->otp->forgetToken(self::SCOPE, $email);

        return response()->json(['message' => 'Your password was changed.']);
    }
}
