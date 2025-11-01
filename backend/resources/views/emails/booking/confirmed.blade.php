<x-mail::message>
# Booking Confirmed!

Dear {{ $booking->user->name }},

Your ferry booking has been confirmed! Here are your booking details:

<x-mail::panel>
**Booking Reference:** {{ $booking->reference_number }}

**Route Information:**
- **From:** {{ $booking->route->origin }}
- **To:** {{ $booking->route->destination }}
- **Departure:** {{ $booking->booking_date->format('F j, Y') }} at {{ \Carbon\Carbon::parse($booking->departure_time)->format('g:i A') }}

**Vessel Details:**
- **Vessel Name:** {{ $booking->vessel->name }}
- **Type:** {{ ucfirst($booking->vessel->type) }}

**Passenger Information:**
- **Number of Passengers:** {{ $booking->number_of_passengers }}
- **Total Amount:** ${{ number_format($booking->total_amount, 2) }}

**Status:** {{ ucfirst($booking->status) }}
</x-mail::panel>

@if($booking->special_requests)
**Special Requests:** {{ $booking->special_requests }}
@endif

Please arrive at the departure point at least 30 minutes before the scheduled departure time.

<x-mail::button :url="config('app.frontend_url') . '/bookings/' . $booking->id">
View Booking Details
</x-mail::button>

If you have any questions, please don't hesitate to contact us.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
