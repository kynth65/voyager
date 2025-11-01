<?php

namespace App\Services;

use App\Mail\BookingCancelled;
use App\Mail\BookingConfirmed;
use App\Mail\PaymentReceipt;
use App\Mail\RefundApproved;
use App\Mail\RefundRejected;
use App\Mail\RefundProcessed;
use App\Mail\TicketGenerated;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Refund;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class EmailNotificationService
{
    /**
     * Send booking confirmation email
     */
    public function sendBookingConfirmation(Booking $booking): void
    {
        try {
            // Load necessary relationships
            $booking->load(['user', 'route', 'vessel']);

            Mail::to($booking->user->email)
                ->send(new BookingConfirmed($booking));

            Log::info('Booking confirmation email sent', [
                'booking_id' => $booking->id,
                'reference' => $booking->reference_number,
                'user_email' => $booking->user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send booking confirmation email', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send payment receipt email
     */
    public function sendPaymentReceipt(Payment $payment): void
    {
        try {
            // Load necessary relationships
            $payment->load(['booking.user', 'booking.route', 'booking.vessel']);

            Mail::to($payment->booking->user->email)
                ->send(new PaymentReceipt($payment));

            Log::info('Payment receipt email sent', [
                'payment_id' => $payment->id,
                'transaction_id' => $payment->transaction_id,
                'user_email' => $payment->booking->user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send payment receipt email', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send booking cancellation email
     */
    public function sendBookingCancellation(Booking $booking): void
    {
        try {
            // Load necessary relationships
            $booking->load(['user', 'route', 'vessel', 'payment']);

            Mail::to($booking->user->email)
                ->send(new BookingCancelled($booking));

            Log::info('Booking cancellation email sent', [
                'booking_id' => $booking->id,
                'reference' => $booking->reference_number,
                'user_email' => $booking->user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send booking cancellation email', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send ticket email (with optional PDF attachment)
     */
    public function sendTicket(Booking $booking, ?string $ticketPath = null): void
    {
        try {
            // Load necessary relationships
            $booking->load(['user', 'route', 'vessel']);

            Mail::to($booking->user->email)
                ->send(new TicketGenerated($booking, $ticketPath));

            Log::info('Ticket email sent', [
                'booking_id' => $booking->id,
                'reference' => $booking->reference_number,
                'user_email' => $booking->user->email,
                'has_attachment' => !is_null($ticketPath),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send ticket email', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send refund approved email
     */
    public function sendRefundApproved(Refund $refund): void
    {
        try {
            // Load necessary relationships
            $refund->load(['booking.user', 'booking.route', 'booking.vessel']);

            Mail::to($refund->booking->user->email)
                ->send(new RefundApproved($refund));

            Log::info('Refund approved email sent', [
                'refund_id' => $refund->id,
                'booking_reference' => $refund->booking->reference_number,
                'user_email' => $refund->booking->user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send refund approved email', [
                'refund_id' => $refund->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send refund rejected email
     */
    public function sendRefundRejected(Refund $refund): void
    {
        try {
            // Load necessary relationships
            $refund->load(['booking.user', 'booking.route', 'booking.vessel']);

            Mail::to($refund->booking->user->email)
                ->send(new RefundRejected($refund));

            Log::info('Refund rejected email sent', [
                'refund_id' => $refund->id,
                'booking_reference' => $refund->booking->reference_number,
                'user_email' => $refund->booking->user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send refund rejected email', [
                'refund_id' => $refund->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send refund processed email
     */
    public function sendRefundProcessed(Refund $refund): void
    {
        try {
            // Load necessary relationships
            $refund->load(['booking.user', 'booking.route', 'booking.vessel']);

            Mail::to($refund->booking->user->email)
                ->send(new RefundProcessed($refund));

            Log::info('Refund processed email sent', [
                'refund_id' => $refund->id,
                'booking_reference' => $refund->booking->reference_number,
                'user_email' => $refund->booking->user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send refund processed email', [
                'refund_id' => $refund->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
