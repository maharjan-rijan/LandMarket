<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use MongoDB\Laravel\Schema\Blueprint;

// MongoDB creates collections on first write, so this migration only sets up indexes.
return new class extends Migration
{
    protected $connection = 'mongodb';

    public function up(): void
    {
        Schema::connection('mongodb')->create('email_otps', function (Blueprint $collection) {
            $collection->unique('user_id');       // one live code per user
            $collection->expire('expires_at', 0); // Mongo deletes the document once expires_at passes
        });
    }

    public function down(): void
    {
        Schema::connection('mongodb')->dropIfExists('email_otps');
    }
};
