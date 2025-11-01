<x-mail::message>
# Refund Completed

Dear {{ $refund->booking->user->name }},

Your refund has been successfully processed! The funds have been returned to your original payment method.

<x-mail::panel>
**Refund Details:**
- **Booking Reference:** {{ $refund->booking->reference_number }}
- **Refund Amount:** ${{ number_format($refund->amount, 2) }}
- **Status:** {{ ucfirst($refund->status) }}
- **Requested Date:** {{ $refund->created_at->format('F j, Y \a\t g:i A') }}
- **Processed Date:** {{ $refund->processed_at ? $refund->processed_at->format('F j, Y \a\t g:i A') : 'Just now' }}

**Original Booking Information:**
- **Route:** {{ $refund->booking->route->origin }} → {{ $refund->booking->route->destination }}
- **Departure Date:** {{ \Carbon\Carbon::parse($refund->booking->booking_date . ' ' . $refund->booking->departure_time)->format('F j, Y \a\t g:i A') }}
- **Passengers:** {{ $refund->booking->number_of_passengers }}
- **Original Payment Amount:** ${{ number_format($refund->booking->total_price, 2) }}
</x-mail::panel>

**Please Note:** Depending on your financial institution, it may take 3-5 business days for the refund to appear in your account.

<x-mail::button :url="config('app.frontend_url') . '/my-refunds'">
View Refund Receipt
</x-mail::button>

Thank you for your patience. We hope to serve you again in the future!

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
