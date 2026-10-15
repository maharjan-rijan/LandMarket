<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Inquiry extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'inquiries';

    protected $fillable = [
        'land_id', 'store_id', 'buyer_id', 'buyer_name', 'buyer_email', 'buyer_phone', 'message', 'status', 'seeded',
    ];
}
