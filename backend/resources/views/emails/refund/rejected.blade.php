<x-mail::message>
# Refund Request Rejected

Dear {{ $refund->booking->user->name }},

We regret to inform you that your refund request has been rejected.

<x-mail::panel>
**Refund Details:**
- **Booking Reference:** {{ $refund->booking->reference_number }}
- **Requested Amount:** ${{ number_format($refund->amount, 2) }}
- **Status:** {{ ucfirst($refund->status) }}
- **Requested Date:** {{ $refund->created_at->format('F j, Y \a\t g:i A') }}
- **Rejected Date:** {{ $refund->rejected_at ? $refund->rejected_at->format('F j, Y \a\t g:i A') : 'Just now' }}

**Original Booking Information:**
- **Route:** {{ $refund->booking->route->origin }} → {{ $refund->booking->route->destination }}
- **Departure Date:** {{ \Carbon\Carbon::parse($refund->booking->booking_date . ' ' . $refund->booking->departure_time)->format('F j, Y \a\t g:i A') }}
- **Passengers:** {{ $refund->booking->number_of_passengers }}

@if($refund->admin_notes)
**Reason for Rejection:**
{{ $refund->admin_notes }}
@endif
</x-mail::panel>

@if(!$refund->admin_notes)
For more information about why your refund request was rejected, please contact our customer support team.
@endif

<x-mail::button :url="config('app.frontend_url') . '/my-refunds'">
View Refund Details
</x-mail::button>

If you have any questions or believe this decision was made in error, please don't hesitate to reach out to us.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
