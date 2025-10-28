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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_reference')->unique();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Customer who made the booking
            $table->foreignId('vessel_id')->constrained('vessels')->onDelete('cascade'); // Vessel being booked
            $table->foreignId('route_id')->constrained('routes')->onDelete('cascade'); // Ferry route (required)
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled'])->default('pending');
            $table->date('booking_date'); // Date of travel
            $table->time('departure_time'); // Scheduled departure time
            $table->integer('passengers')->default(1); // Number of passengers
            $table->decimal('total_amount', 10, 2)->default(0); // Calculated as route.price × passengers
            $table->text('special_requirements')->nullable(); // Customer notes/requests
            $table->text('admin_notes')->nullable(); // Internal admin notes
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
