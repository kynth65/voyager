<x-mail::message>
# Booking Cancelled

Dear {{ $booking->user->name }},

Your ferry booking has been cancelled as requested.

<x-mail::panel>
**Cancelled Booking Details:**

**Booking Reference:** {{ $booking->reference_number }}

**Route Information:**
- **From:** {{ $booking->route->origin }}
- **To:** {{ $booking->route->destination }}
- **Departure:** {{ $booking->booking_date->format('F j, Y') }} at {{ \Carbon\Carbon::parse($booking->departure_time)->format('g:i A') }}

**Vessel:** {{ $booking->vessel->name }}
**Passengers:** {{ $booking->number_of_passengers }}
**Amount Paid:** ${{ number_format($booking->total_amount, 2) }}

**Cancellation Date:** {{ now()->format('F j, Y \a\t g:i A') }}
</x-mail::panel>

@if($booking->payment && $booking->payment->status === 'completed')
A refund request has been initiated for your payment. The refund will be processed within 5-7 business days to your original payment method.

**Refund Amount:** ${{ number_format($booking->total_amount, 2) }}
@endif

@if($booking->cancellation_reason)
**Cancellation Reason:** {{ $booking->cancellation_reason }}
@endif

If you have any questions about this cancellation or the refund process, please contact our customer support team.

<x-mail::button :url="config('app.frontend_url') . '/bookings'">
View My Bookings
</x-mail::button>

We hope to serve you again in the future.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
