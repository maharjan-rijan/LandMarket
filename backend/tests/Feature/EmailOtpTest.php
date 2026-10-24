<?php

namespace Tests\Feature;

use App\Mail\EmailOtpMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EmailOtpTest extends TestCase
{
    use RefreshDatabase;

    private function otpFrom(): string
    {
        $code = null;
        Mail::assertSent(EmailOtpMail::class, function ($m) use (&$code) {
            $code = $m->code;

            return true;
        });

        return $code;
    }

    public function test_code_is_emailed_and_verifies_the_user(): void
    {
        Mail::fake();
        $user = User::factory()->create(['email_verified_at' => null]);
        Sanctum::actingAs($user);

        $this->postJson('/api/auth/email/send-otp')->assertOk();
        $this->postJson('/api/auth/email/verify', ['code' => $this->otpFrom()])->assertOk();

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_wrong_code_is_rejected(): void
    {
        Mail::fake();
        $user = User::factory()->create(['email_verified_at' => null]);
        Sanctum::actingAs($user);

        $this->postJson('/api/auth/email/send-otp')->assertOk();
        $this->postJson('/api/auth/email/verify', ['code' => '000000'])
            ->assertStatus(422)->assertJsonValidationErrors('code');

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_resend_is_throttled(): void
    {
        Mail::fake();
        Sanctum::actingAs(User::factory()->create(['email_verified_at' => null]));

        $this->postJson('/api/auth/email/send-otp')->assertOk();
        $this->postJson('/api/auth/email/send-otp')->assertStatus(429);
    }
}
