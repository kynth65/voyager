<x-mail::message>
# Payment Received

Dear {{ $payment->booking->user->name }},

Thank you for your payment! Your transaction has been successfully processed.

<x-mail::panel>
**Payment Details:**
- **Transaction ID:** {{ $payment->transaction_id }}
- **Amount Paid:** ${{ number_format($payment->amount, 2) }}
- **Payment Method:** {{ ucfirst($payment->payment_method) }}
- **Payment Date:** {{ $payment->payment_date->format('F j, Y \a\t g:i A') }}
- **Status:** {{ ucfirst($payment->status) }}

**Booking Reference:** {{ $payment->booking->reference_number }}

**Route Information:**
- **From:** {{ $payment->booking->route->origin }}
- **To:** {{ $payment->booking->route->destination }}
- **Departure:** {{ \Carbon\Carbon::parse($payment->booking->booking_date . ' ' . $payment->booking->departure_time)->format('F j, Y \a\t g:i A') }}
- **Passengers:** {{ $payment->booking->number_of_passengers }}
</x-mail::panel>

Your ferry booking is now confirmed and ready for your journey.

<x-mail::button :url="config('app.frontend_url') . '/bookings/' . $payment->booking_id">
View Booking & Download Ticket
</x-mail::button>

This is your official payment receipt. Please keep it for your records.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
