<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

// One email for both jobs. Build it with OtpMail::verifyEmail(...) or OtpMail::passwordReset(...).
class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $name,
        public string $code,
        public int $minutes,
        public string $heading,
        public string $intro,
        public string $ignoreNote,
    ) {}

    public static function verifyEmail(string $name, string $code, int $minutes): self
    {
        return new self(
            $name, $code, $minutes,
            'Verify your email',
            'Use this code to verify your email address on LandMarket:',
            'If you did not create an account, ignore this email.',
        );
    }

    public static function passwordReset(string $name, string $code, int $minutes): self
    {
        return new self(
            $name, $code, $minutes,
            'Reset your password',
            'Use this code to choose a new password on LandMarket:',
            'If you did not ask for this, ignore this email. Your password stays the same.',
        );
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: "{$this->heading}: your LandMarket code");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.otp');
    }
}
