<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class OwnershipTransfer extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'ownership_transfers';

    protected $fillable = [
        'land_id',
        'from_owner',
        'from_user_id',
        'to_owner',
        'to_user_id',
        'date',
        'note',
        'seeded',
    ];
}
