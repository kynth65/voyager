<x-mail::message>
# Your Ferry Ticket is Ready!

Dear {{ $booking->user->name }},

Your ferry ticket has been generated and is ready for your journey!

<x-mail::panel>
**Ticket Information:**

**Booking Reference:** {{ $booking->reference_number }}

**Journey Details:**
- **From:** {{ $booking->route->origin }}
- **To:** {{ $booking->route->destination }}
- **Departure Date:** {{ \Carbon\Carbon::parse($booking->booking_date)->format('F j, Y') }}
- **Departure Time:** {{ \Carbon\Carbon::parse($booking->departure_time)->format('g:i A') }}

**Vessel Information:**
- **Vessel Name:** {{ $booking->vessel->name }}
- **Type:** {{ ucfirst($booking->vessel->type) }}
- **Capacity:** {{ $booking->vessel->capacity }} passengers

**Passenger Details:**
- **Number of Passengers:** {{ $booking->number_of_passengers }}
- **Total Amount:** ${{ number_format($booking->total_amount, 2) }}
</x-mail::panel>

@if($ticketPath)
**Important:** Your ticket is attached to this email as a PDF file. Please download and either print it or save it to your mobile device.
@endif

**Check-in Instructions:**
- Arrive at the departure point at least 30 minutes before departure
- Present your ticket (printed or digital) at the check-in counter
- Bring a valid ID for verification
- Passengers should board 15 minutes before departure

<x-mail::button :url="config('app.frontend_url') . '/bookings/' . $booking->id">
View Booking Details
</x-mail::button>

Have a safe and pleasant journey!

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
