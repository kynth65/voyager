<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Refund extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'booking_id',
        'amount',
        'reason',
        'status',
        'processed_by',
        'approved_at',
        'processed_at',
        'admin_notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'approved_at' => 'datetime',
        'processed_at' => 'datetime',
    ];

    /**
     * Get the booking this refund is for.
     */
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Get the admin who processed this refund.
     */
    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /**
     * Check if refund is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if refund is approved.
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if refund is rejected.
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Check if refund is processed.
     */
    public function isProcessed(): bool
    {
        return $this->status === 'processed';
    }

    /**
     * Approve the refund.
     */
    public function approve(int $adminId): bool
    {
        $this->status = 'approved';
        $this->approved_at = now();
        $this->processed_by = $adminId;
        return $this->save();
    }

    /**
     * Reject the refund.
     */
    public function reject(int $adminId, ?string $reason = null): bool
    {
        $this->status = 'rejected';
        $this->processed_by = $adminId;
        if ($reason) {
            $this->admin_notes = $reason;
        }
        return $this->save();
    }

    /**
     * Process the refund.
     */
    public function process(int $adminId): bool
    {
        $this->status = 'processed';
        $this->processed_at = now();
        $this->processed_by = $adminId;
        return $this->save();
    }
}
