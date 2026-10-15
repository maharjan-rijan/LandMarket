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
         Schema::connection('mongodb')->table('lands', function (Blueprint $collection) {
            $collection->index(['store_id', 'status']);        // seller dashboard
            $collection->index(['status', 'district']);        // public search by district
            $collection->index(['status', 'price_per_aana']);
            $collection->index(['status', 'featured']);
            $collection->index('owner_id');
            $collection->index('sold_to');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mongodb')->dropIfExists('lands');
    }
};
