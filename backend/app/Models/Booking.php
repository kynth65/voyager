<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'booking_reference',
        'user_id',
        'vessel_id',
        'route_id',
        'status',
        'booking_date',
        'departure_time',
        'passengers',
        'total_amount',
        'special_requirements',
        'admin_notes',
        'confirmed_at',
        'cancelled_at',
    ];

    protected $casts = [
        'booking_date' => 'date',
        'departure_time' => 'datetime:H:i',
        'confirmed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'total_amount' => 'decimal:2',
    ];

    /**
     * Get the user (customer) who made this booking.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the vessel for this booking.
     */
    public function vessel()
    {
        return $this->belongsTo(Vessel::class);
    }

    /**
     * Get the route for this booking.
     */
    public function route()
    {
        return $this->belongsTo(Route::class);
    }

    /**
     * Get the payment for this booking.
     */
    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    /**
     * Get the refund for this booking (if any).
     */
    public function refund()
    {
        return $this->hasOne(Refund::class);
    }

    /**
     * Check if booking is confirmed.
     */
    public function isConfirmed(): bool
    {
        return $this->status === 'confirmed';
    }

    /**
     * Check if booking is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Confirm the booking.
     */
    public function confirm(): bool
    {
        $this->status = 'confirmed';
        $this->confirmed_at = now();
        return $this->save();
    }

    /**
     * Cancel the booking.
     */
    public function cancel(): bool
    {
        $this->status = 'cancelled';
        $this->cancelled_at = now();
        return $this->save();
    }
}
