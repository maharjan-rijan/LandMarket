<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class EmailOtp extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'email_otps';

    // user_id is the User's ObjectId as a string. Fields: code_hash, attempts, expires_at, sent_at.
    protected $fillable = ['user_id', 'code_hash', 'attempts', 'expires_at', 'sent_at'];

    protected $casts = [
        'attempts' => 'integer',
        'expires_at' => 'datetime',
        'sent_at' => 'datetime',
    ];
}
