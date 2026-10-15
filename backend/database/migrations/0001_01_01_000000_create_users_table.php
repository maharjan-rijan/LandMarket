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
        Schema::connection('mongodb')->create('users', function (Blueprint $collection) {
            $collection->id();
            $collection->string('name');
            $collection->string('email')->unique();
            $collection->index('role');
            $collection->timestamp('email_verified_at')->nullable();
            $collection->string('password');
            $collection->rememberToken();
            $collection->timestamps();
        });

        Schema::connection('mongodb')->create('password_reset_tokens', function (Blueprint $collection) {
            $collection->string('email')->primary();
            $collection->string('token');
            $collection->timestamp('created_at')->nullable();
        });

        Schema::connection('mongodb')->create('sessions', function (Blueprint $collection) {
            $collection->string('id')->primary();
            $collection->foreignId('user_id')->nullable()->index();
            $collection->string('ip_address', 45)->nullable();
            $collection->text('user_agent')->nullable();
            $collection->longText('payload');
            $collection->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mongodb')->dropIfExists('users');
        Schema::connection('mongodb')->dropIfExists('password_reset_tokens');
        Schema::connection('mongodb')->dropIfExists('sessions');
    }
};
