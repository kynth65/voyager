<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'booking_reference',
        'customer_id',
        'agent_id',
        'company_id',
        'status',
        'travel_start_date',
        'travel_end_date',
        'total_amount',
        'total_cost',
        'commission',
        'currency',
        'payment_status',
        'notes',
        'internal_notes',
        'confirmed_at',
        'cancelled_at',
    ];

    protected $casts = [
        'travel_start_date' => 'date',
        'travel_end_date' => 'date',
        'confirmed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function bookingItems()
    {
        return $this->hasMany(BookingItem::class);
    }

    public function travelers()
    {
        return $this->hasMany(Traveler::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function documents()
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    public function communications()
    {
        return $this->morphMany(Communication::class, 'communicable');
    }

    public function activityLogs()
    {
        return $this->morphMany(ActivityLog::class, 'loggable');
    }
}
