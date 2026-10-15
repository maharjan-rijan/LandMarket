<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Store extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'stores';

    protected $fillable = [
        'owner_id', 'name', 'type', 'district', 'phone', 'email', 'about', 'verified', 'since', 'seeded',
    ];

    protected function casts(): array
    {
        return [
            'verified' => 'boolean',
            'since' => 'integer',
        ];
    }
}
