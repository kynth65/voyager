<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Route extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'vessel_id',
        'origin',
        'destination',
        'price',
        'duration',
        'schedule',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'duration' => 'integer',
        'schedule' => 'json',
    ];

    /**
     * Get the vessel for this route.
     */
    public function vessel()
    {
        return $this->belongsTo(Vessel::class);
    }

    /**
     * Get all bookings for this route.
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Check if route is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if route is inactive.
     */
    public function isInactive(): bool
    {
        return $this->status === 'inactive';
    }

    /**
     * Check if route is suspended.
     */
    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    /**
     * Get formatted route name (origin to destination).
     */
    public function getRouteNameAttribute(): string
    {
        return "{$this->origin} to {$this->destination}";
    }

    /**
     * Get formatted duration (e.g., "2 hours 30 minutes").
     */
    public function getFormattedDurationAttribute(): string
    {
        $hours = floor($this->duration / 60);
        $minutes = $this->duration % 60;

        if ($hours > 0 && $minutes > 0) {
            return "{$hours} hour" . ($hours > 1 ? 's' : '') . " {$minutes} minute" . ($minutes > 1 ? 's' : '');
        } elseif ($hours > 0) {
            return "{$hours} hour" . ($hours > 1 ? 's' : '');
        } else {
            return "{$minutes} minute" . ($minutes > 1 ? 's' : '');
        }
    }
}
