<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('routes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vessel_id')->constrained('vessels')->onDelete('cascade');
            $table->string('origin'); // Starting point (e.g., "Cebu")
            $table->string('destination'); // End point (e.g., "Bohol")
            $table->decimal('price', 10, 2); // Price per passenger (varies by distance)
            $table->integer('duration'); // Duration in minutes
            $table->json('schedule')->nullable(); // Schedule info (departure times, days of week, etc.)
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('routes');
    }
};
