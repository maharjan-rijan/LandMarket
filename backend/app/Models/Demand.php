<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Demand extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'demands';

    protected $fillable = [
        'buyer_id', 'buyer_name', 'phone', 'district', 'min_aana', 'max_price_per_aana', 'note', 'status', 'seeded',
    ];

    protected function casts(): array
    {
        return [
            'min_aana' => 'float',
            'max_price_per_aana' => 'integer',
        ];
    }
}
