<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Land extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'lands';

    protected $fillable = [
        'store_id', 'owner_id', 'title', 'district', 'municipality', 'ward', 'area_aana', 'price_per_aana',
        'road_ft', 'facing', 'description', 'documents', 'status', 'featured', 'views',
        'sold_to', 'sold_at', 'seeded',
    ];

    protected function casts(): array
    {
        return [
            'ward' => 'integer',
            'area_aana' => 'float',
            'price_per_aana' => 'integer',
            'road_ft' => 'integer',
            'documents' => 'array',
            'featured' => 'boolean',
            'views' => 'integer',
        ];
    }
}
