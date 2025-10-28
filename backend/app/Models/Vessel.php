<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vessel extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'type',
        'capacity',
        'description',
        'image',
        'status',
    ];

    protected $casts = [
        'capacity' => 'integer',
    ];

    protected $appends = ['image_url'];

    /**
     * Get the full URL for the vessel's image.
     */
    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image) {
            return null;
        }

        // If image is already a full URL, return it as is
        if (str_starts_with($this->image, 'http')) {
            return $this->image;
        }

        // Convert storage path to full URL
        return url('storage/' . $this->image);
    }

    /**
     * Get all routes for this vessel (ferry routes).
     */
    public function routes()
    {
        return $this->hasMany(Route::class);
    }

    /**
     * Get all bookings for this vessel.
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Check if vessel is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if vessel is inactive.
     */
    public function isInactive(): bool
    {
        return $this->status === 'inactive';
    }

    /**
     * Check if vessel is under maintenance.
     */
    public function isUnderMaintenance(): bool
    {
        return $this->status === 'maintenance';
    }

    /**
     * Check if vessel has available capacity for a route on a given date/time.
     */
    public function hasAvailableCapacity(int $routeId, string $date, string $time, int $requestedPassengers): bool
    {
        if (!$this->isActive()) {
            return false;
        }

        // Get total passengers already booked for this route, date, and time
        $bookedPassengers = $this->bookings()
            ->where('route_id', $routeId)
            ->where('booking_date', $date)
            ->where('departure_time', $time)
            ->whereIn('status', ['pending', 'confirmed'])
            ->sum('passengers');

        // Check if adding requested passengers would exceed vessel capacity
        return ($bookedPassengers + $requestedPassengers) <= $this->capacity;
    }
}
