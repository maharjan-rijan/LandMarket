<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use MongoDB\Laravel\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $connection = 'mongodb';
    protected $collection = 'users';

    protected $fillable = ['name', 'email', 'password', 'role', 'phone'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['password' => 'hashed'];
    }
}
