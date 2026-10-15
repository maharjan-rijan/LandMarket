<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class SavedLand extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'saved_lands';

    protected $fillable = [
        'user_id', 'land_id', 'seeded',
    ];
}
