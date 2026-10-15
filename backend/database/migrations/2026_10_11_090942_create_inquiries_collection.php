<?php

use Illuminate\Database\Migrations\Migration;
use MongoDB\Laravel\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('mongodb')->table('inquiries', function (Blueprint $collection) {
            $collection->index(['store_id', 'status']);  // seller inbox
            $collection->index('buyer_id');              // buyer's sent inquiries
            $collection->index('land_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mongodb')->dropIfExists('inquiries');
    }
};
