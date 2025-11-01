<x-mail::message>
# Refund Approved

Dear {{ $refund->booking->user->name }},

Good news! Your refund request has been approved by our team.

<x-mail::panel>
**Refund Details:**
- **Booking Reference:** {{ $refund->booking->reference_number }}
- **Refund Amount:** ${{ number_format($refund->amount, 2) }}
- **Status:** {{ ucfirst($refund->status) }}
- **Requested Date:** {{ $refund->created_at->format('F j, Y \a\t g:i A') }}
- **Approved Date:** {{ $refund->approved_at ? $refund->approved_at->format('F j, Y \a\t g:i A') : 'Just now' }}

**Original Booking Information:**
- **Route:** {{ $refund->booking->route->origin }} → {{ $refund->booking->route->destination }}
- **Departure Date:** {{ \Carbon\Carbon::parse($refund->booking->booking_date . ' ' . $refund->booking->departure_time)->format('F j, Y \a\t g:i A') }}
- **Passengers:** {{ $refund->booking->number_of_passengers }}

@if($refund->admin_notes)
**Admin Notes:**
{{ $refund->admin_notes }}
@endif
</x-mail::panel>

Your refund will be processed shortly and the amount will be returned to your original payment method.

<x-mail::button :url="config('app.frontend_url') . '/my-refunds'">
View Refund Status
</x-mail::button>

If you have any questions about your refund, please don't hesitate to contact us.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
