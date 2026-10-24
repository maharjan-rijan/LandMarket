<?php

namespace Tests\Feature;

use App\Mail\PasswordResetOtpMail;
use Illuminate\Support\Facades\Cache;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    // RefreshDatabase does not work with MongoDB: empty the users and the cache by hand.
    protected function setUp(): void
    {
        parent::setUp();
        User::truncate();
        Cache::flush();
    }

    private function codeFromMail(): string
    {
        $code = null;
        Mail::assertSent(PasswordResetOtpMail::class, function ($m) use (&$code) {
            $code = $m->code;

            return true;
        });

        return $code;
    }

    public function test_code_resets_the_password(): void
    {
        Mail::fake();
        $user = User::factory()->create(['email' => 'anil@landmarket.test']);

        $this->postJson('/api/auth/forgot-password', ['email' => 'anil@landmarket.test'])->assertOk();

        $this->postJson('/api/auth/reset-password', [
            'email' => 'anil@landmarket.test',
            'code' => $this->codeFromMail(),
            'password' => 'new-password-1',
            'password_confirmation' => 'new-password-1',
        ])->assertOk();

        $this->assertTrue(Hash::check('new-password-1', $user->fresh()->password));
    }

    public function test_unknown_email_gets_the_same_answer_and_no_mail(): void
    {
        Mail::fake();

        $this->postJson('/api/auth/forgot-password', ['email' => 'nobody@landmarket.test'])
            ->assertOk()
            ->assertJsonPath('message', 'If that email has an account, a code is on its way.');

        Mail::assertNothingSent();
    }

    public function test_wrong_code_is_rejected_and_password_is_unchanged(): void
    {
        Mail::fake();
        $user = User::factory()->create(['email' => 'anil@landmarket.test']);
        $old = $user->password;

        $this->postJson('/api/auth/forgot-password', ['email' => 'anil@landmarket.test'])->assertOk();

        $this->postJson('/api/auth/reset-password', [
            'email' => 'anil@landmarket.test',
            'code' => '000000',
            'password' => 'new-password-1',
            'password_confirmation' => 'new-password-1',
        ])->assertStatus(422)->assertJsonValidationErrors('code');

        $this->assertSame($old, $user->fresh()->password);
    }

    public function test_password_must_be_confirmed(): void
    {
        $this->postJson('/api/auth/reset-password', [
            'email' => 'anil@landmarket.test',
            'code' => '123456',
            'password' => 'new-password-1',
            'password_confirmation' => 'different',
        ])->assertStatus(422)->assertJsonValidationErrors('password');
    }
}
