<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Laravel\Sanctum\HasApiTokens;
use MongoDB\Laravel\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $connection = 'mongodb';
    protected $collection = 'users';

    protected $fillable = ['name', 'email', 'password', 'role', 'phone'];

    // avatar_path is the file's place on disk. The app only needs avatar_url.
    protected $hidden = ['password', 'remember_token', 'avatar_path'];

    // sent with every user: the full address of the profile picture, or null
    protected $appends = ['avatar_url'];

    protected function casts(): array
    {
        return ['password' => 'hashed'];
    }

    /**
     * Built from the address of the current request, so it is right whether the API is at
     * 127.0.0.1:8000, a Herd site or a real domain. The file is served through the
     * public/storage link (php artisan storage:link).
     */
    protected function avatarUrl(): Attribute
    {
        return Attribute::get(fn () => $this->avatar_path ? asset('storage/' . $this->avatar_path) : null);
    }
}
