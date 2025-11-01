<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Ferry Ticket - {{ $booking->booking_reference }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            color: #333;
            line-height: 1.5;
        }

        .ticket-container {
            width: 100%;
            max-width: 500px;
            margin: 0 auto;
            padding: 17px 23px;
        }

        /* Compact Header */
        .header {
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 17px;
            margin-bottom: 9px;
            border-radius: 7px;
        }

        .header h1 {
            font-size: 21px;
            margin-bottom: 2px;
        }

        .header p {
            font-size: 10px;
            opacity: 0.9;
        }

        /* Booking info compact */
        .booking-ref {
            background: #f8f9fa;
            padding: 9px 14px;
            border-radius: 6px;
            margin-bottom: 9px;
            text-align: center;
        }

        .booking-ref-number {
            font-size: 18px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 3px;
        }

        .status-badge {
            display: inline-block;
            padding: 3px 12px;
            border-radius: 14px;
            font-size: 9px;
            font-weight: bold;
        }

        .status-confirmed {
            background: #d4edda;
            color: #155724;
        }

        .status-pending {
            background: #fff3cd;
            color: #856404;
        }

        /* Vertical sections */
        .section {
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 9px 14px;
            margin-bottom: 9px;
        }

        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 7px;
            padding-bottom: 3px;
            border-bottom: 1px solid #667eea;
        }

        .info-row {
            display: table;
            width: 100%;
            margin-bottom: 4px;
        }

        .info-row:last-child {
            margin-bottom: 0;
        }

        .info-label {
            display: table-cell;
            font-weight: bold;
            color: #495057;
            width: 40%;
            font-size: 10px;
        }

        .info-value {
            display: table-cell;
            color: #212529;
            text-align: right;
            width: 60%;
            font-size: 10px;
        }

        /* Route header vertical */
        .route-header {
            display: table;
            width: 100%;
            margin-bottom: 7px;
            text-align: center;
        }

        .location {
            display: table-cell;
            width: 45%;
        }

        .arrow-cell {
            display: table-cell;
            width: 10%;
            text-align: center;
        }

        .location-name {
            font-size: 14px;
            font-weight: bold;
            color: #667eea;
        }

        .arrow {
            font-size: 16px;
            color: #667eea;
        }

        /* Price summary compact */
        .price-summary {
            background: #e7f3ff;
            padding: 9px 14px;
            border-radius: 6px;
            margin-bottom: 9px;
        }

        .price-row {
            display: table;
            width: 100%;
            margin-bottom: 4px;
            font-size: 10px;
        }

        .price-label {
            display: table-cell;
        }

        .price-value {
            display: table-cell;
            text-align: right;
        }

        .total-row {
            font-size: 12px;
            font-weight: bold;
            padding-top: 5px;
            border-top: 1px solid #667eea;
            margin-top: 4px;
        }

        /* QR Code Section - Center aligned vertical */
        .qr-section {
            text-align: center;
            padding: 12px 14px;
            background: white;
            border: 2px dashed #667eea;
            border-radius: 6px;
            margin-bottom: 9px;
        }

        .qr-title {
            font-size: 12px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 6px;
        }

        .qr-code {
            margin: 0 auto 6px;
        }

        .qr-code svg {
            max-width: 127px;
            max-height: 127px;
        }

        .qr-instructions {
            font-size: 9px;
            color: #6c757d;
            font-style: italic;
        }

        /* Footer compact */
        .footer {
            text-align: center;
            padding: 7px 12px;
            background: #f8f9fa;
            border-radius: 6px;
            font-size: 8px;
            color: #6c757d;
        }

        .footer p {
            margin: 2px 0;
        }

        .footer hr {
            margin: 5px 0;
            border: none;
            border-top: 1px solid #dee2e6;
        }
    </style>
</head>
<body>
    <div class="ticket-container">
        <!-- Compact Header -->
        <div class="header">
            <h1>VOYAGER FERRY TICKET</h1>
            <p>Your Journey Begins Here</p>
        </div>

        <!-- Booking Reference -->
        <div class="booking-ref">
            <div class="booking-ref-number">{{ $booking->booking_reference }}</div>
            <span class="status-badge status-{{ strtolower($booking->status) }}">
                {{ strtoupper($booking->status) }}
            </span>
        </div>

        <!-- Journey Details -->
        <div class="section">
            <div class="section-title">Journey Details</div>

            <div class="route-header">
                <div class="location">
                    <div class="location-name">{{ $booking->route->origin }}</div>
                </div>
                <div class="arrow-cell">
                    <div class="arrow">→</div>
                </div>
                <div class="location">
                    <div class="location-name">{{ $booking->route->destination }}</div>
                </div>
            </div>

            <div class="info-row">
                <div class="info-label">Vessel:</div>
                <div class="info-value">{{ $booking->vessel->name }} ({{ $booking->vessel->type }})</div>
            </div>
            <div class="info-row">
                <div class="info-label">Departure Date:</div>
                <div class="info-value">{{ \Carbon\Carbon::parse($booking->booking_date)->format('M d, Y') }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Departure Time:</div>
                <div class="info-value">{{ \Carbon\Carbon::parse($booking->departure_time)->format('h:i A') }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Duration:</div>
                <div class="info-value">{{ $booking->route->duration }} mins</div>
            </div>
        </div>

        <!-- Passenger Details -->
        <div class="section">
            <div class="section-title">Passenger Information</div>
            <div class="info-row">
                <div class="info-label">Booked By:</div>
                <div class="info-value">{{ $booking->user->name }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Email:</div>
                <div class="info-value">{{ $booking->user->email }}</div>
            </div>
            @if($booking->user->phone)
            <div class="info-row">
                <div class="info-label">Phone:</div>
                <div class="info-value">{{ $booking->user->phone }}</div>
            </div>
            @endif
            <div class="info-row">
                <div class="info-label">Passengers:</div>
                <div class="info-value"><strong>{{ $booking->passengers }}</strong></div>
            </div>
        </div>

        <!-- Price Summary -->
        <div class="price-summary">
            <div class="section-title">Payment Summary</div>
            <div class="price-row">
                <div class="price-label">Price per Passenger:</div>
                <div class="price-value">₱{{ number_format($booking->route->price, 2) }}</div>
            </div>
            <div class="price-row">
                <div class="price-label">Passengers:</div>
                <div class="price-value">{{ $booking->passengers }}</div>
            </div>
            <div class="price-row total-row">
                <div class="price-label">Total Amount:</div>
                <div class="price-value">₱{{ number_format($booking->total_amount, 2) }}</div>
            </div>
        </div>

        <!-- QR Code Boarding Pass -->
        <div class="qr-section">
            <div class="qr-title">Boarding Pass</div>
            <div class="qr-code">
                {!! $qrCode !!}
            </div>
            <div class="qr-instructions">
                Present this QR code at boarding gate for verification
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>IMPORTANT:</strong> Arrive 30 min before departure. Valid ID required. Non-transferable.</p>
            <p>Inquiries: support@voyager.com | Generated: {{ \Carbon\Carbon::now()->format('M d, Y h:i A') }}</p>
            <hr>
            <p>&copy; {{ date('Y') }} Voyager Boat Booking System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
