<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class OwnershipTransfer extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'ownership_transfers';

    protected $fillable = [
        'land_id', 'from_owner', 'to_owner', 'date', 'note', 'seeded',
    ];
}
