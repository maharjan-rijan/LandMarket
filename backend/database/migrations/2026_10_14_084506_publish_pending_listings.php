<?php

use App\Models\Land;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    protected $connection = 'mongodb';

    /** Admin review no longer exists, so anything still waiting for it goes live. */
    public function up(): void
    {
        Land::whereIn('status', ['pending', 'rejected'])->update(['status' => 'active']);
    }

    public function down(): void
    {
        // Nothing to undo: we cannot know which listings were pending before.
    }
};
