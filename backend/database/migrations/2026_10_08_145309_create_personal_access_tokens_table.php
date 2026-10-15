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
        Schema::connection('mongodb')->create('personal_access_tokens', function (Blueprint $collection) {
            $collection->id();
            $collection->morphs('tokenable');
            $collection->text('name');
            $collection->string('token', 64)->unique();
            $collection->index(['tokenable_type', 'tokenable_id']); // tokens of one user
            $collection->text('abilities')->nullable();
            $collection->timestamp('last_used_at')->nullable();
            $collection->timestamp('expires_at')->nullable()->index();
            $collection->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mongodb')->dropIfExists('personal_access_tokens');
    }
};
