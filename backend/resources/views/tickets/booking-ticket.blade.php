<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ferry Ticket - {{ $booking->booking_reference }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.6;
        }

        .ticket-container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 30px 20px;
            margin-bottom: 30px;
            border-radius: 8px;
        }

        .header h1 {
            font-size: 32px;
            margin-bottom: 5px;
            font-weight: bold;
            letter-spacing: 1px;
        }

        .header p {
            font-size: 14px;
            opacity: 0.9;
        }

        .ticket-info {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }

        .booking-reference {
            text-align: center;
            background: #fef3c7;
            border: 2px dashed #f59e0b;
            padding: 15px;
            margin-bottom: 25px;
            border-radius: 6px;
        }

        .booking-reference h2 {
            font-size: 14px;
            color: #92400e;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .booking-reference .ref-number {
            font-size: 24px;
            font-weight: bold;
            color: #b45309;
            letter-spacing: 2px;
        }

        .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 15px;
        }

        .info-row {
            display: table-row;
        }

        .info-label {
            display: table-cell;
            font-weight: bold;
            color: #475569;
            padding: 8px 0;
            width: 35%;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.5px;
        }

        .info-value {
            display: table-cell;
            color: #1e293b;
            padding: 8px 0;
            font-size: 13px;
        }

        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #1e40af;
            margin: 25px 0 15px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #3b82f6;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .route-details {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 15px 20px;
            margin-bottom: 20px;
        }

        .route-path {
            display: table;
            width: 100%;
            margin: 15px 0;
        }

        .route-point {
            display: table-cell;
            text-align: center;
            vertical-align: middle;
            width: 40%;
        }

        .route-arrow {
            display: table-cell;
            text-align: center;
            vertical-align: middle;
            width: 20%;
            color: #3b82f6;
            font-size: 20px;
            font-weight: bold;
        }

        .location-name {
            font-size: 18px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
        }

        .location-label {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .qr-section {
            text-align: center;
            background: white;
            border: 2px solid #e2e8f0;
            padding: 20px;
            margin-top: 30px;
            border-radius: 8px;
        }

        .qr-section h3 {
            font-size: 14px;
            color: #475569;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .qr-code {
            display: inline-block;
            border: 3px solid #1e40af;
            padding: 10px;
            background: white;
            border-radius: 8px;
        }

        .qr-code img {
            display: block;
        }

        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            color: #64748b;
            font-size: 10px;
        }

        .footer p {
            margin: 5px 0;
        }

        .important-notice {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin-top: 20px;
            border-radius: 4px;
        }

        .important-notice h4 {
            color: #991b1b;
            font-size: 12px;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .important-notice ul {
            margin-left: 20px;
            color: #7f1d1d;
            font-size: 11px;
        }

        .important-notice li {
            margin: 5px 0;
        }

        .status-badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-confirmed {
            background: #d1fae5;
            color: #065f46;
        }

        .amount-box {
            background: #f0fdf4;
            border: 2px solid #86efac;
            padding: 12px 15px;
            margin: 15px 0;
            border-radius: 6px;
            text-align: center;
        }

        .amount-label {
            font-size: 10px;
            color: #166534;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .amount-value {
            font-size: 20px;
            font-weight: bold;
            color: #15803d;
        }
    </style>
</head>
<body>
    <div class="ticket-container">
        <!-- Header -->
        <div class="header">
            <h1>VOYAGER FERRY SERVICES</h1>
            <p>Your Journey, Our Priority</p>
        </div>

        <!-- Booking Reference -->
        <div class="booking-reference">
            <h2>Booking Reference</h2>
            <div class="ref-number">{{ $booking->booking_reference }}</div>
        </div>

        <!-- Passenger Information -->
        <div class="section-title">Passenger Information</div>
        <div class="ticket-info">
            <div class="info-grid">
                <div class="info-row">
                    <div class="info-label">Passenger Name:</div>
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
                    <div class="info-label">Number of Passengers:</div>
                    <div class="info-value">{{ $booking->passengers }} {{ Str::plural('Passenger', $booking->passengers) }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Booking Status:</div>
                    <div class="info-value">
                        <span class="status-badge status-confirmed">{{ strtoupper($booking->status) }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Journey Details -->
        <div class="section-title">Journey Details</div>
        <div class="route-details">
            <div class="route-path">
                <div class="route-point">
                    <div class="location-label">Departure From</div>
                    <div class="location-name">{{ $booking->route->origin }}</div>
                </div>
                <div class="route-arrow">→</div>
                <div class="route-point">
                    <div class="location-label">Arrival At</div>
                    <div class="location-name">{{ $booking->route->destination }}</div>
                </div>
            </div>

            <div class="info-grid" style="margin-top: 20px;">
                <div class="info-row">
                    <div class="info-label">Travel Date:</div>
                    <div class="info-value">{{ $booking->booking_date->format('l, F j, Y') }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Departure Time:</div>
                    <div class="info-value">{{ $booking->departure_time }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Estimated Duration:</div>
                    <div class="info-value">{{ $booking->route->duration }} {{ Str::plural('Hour', $booking->route->duration) }}</div>
                </div>
            </div>
        </div>

        <!-- Vessel Information -->
        <div class="section-title">Vessel Information</div>
        <div class="ticket-info">
            <div class="info-grid">
                <div class="info-row">
                    <div class="info-label">Vessel Name:</div>
                    <div class="info-value">{{ $booking->vessel->name }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Vessel Type:</div>
                    <div class="info-value">{{ ucfirst($booking->vessel->type) }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Capacity:</div>
                    <div class="info-value">{{ $booking->vessel->capacity }} Passengers</div>
                </div>
            </div>
        </div>

        <!-- Payment Information -->
        <div class="section-title">Payment Information</div>
        <div class="amount-box">
            <div class="amount-label">Total Amount Paid</div>
            <div class="amount-value">${{ number_format($booking->total_amount, 2) }}</div>
        </div>
        <div class="ticket-info">
            <div class="info-grid">
                <div class="info-row">
                    <div class="info-label">Payment Method:</div>
                    <div class="info-value">{{ ucwords(str_replace('_', ' ', $booking->payment->payment_method)) }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Transaction ID:</div>
                    <div class="info-value">{{ $booking->payment->transaction_id }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Payment Date:</div>
                    <div class="info-value">{{ $booking->payment->payment_date->format('F j, Y - g:i A') }}</div>
                </div>
            </div>
        </div>

        @if($booking->special_requirements)
        <!-- Special Requirements -->
        <div class="section-title">Special Requirements</div>
        <div class="ticket-info">
            <p style="padding: 5px 0;">{{ $booking->special_requirements }}</p>
        </div>
        @endif

        <!-- QR Code Section -->
        <div class="qr-section">
            <h3>Scan for Verification</h3>
            <div class="qr-code">
                <img src="data:image/png;base64,{{ $qrCode }}" alt="Booking QR Code" width="200" height="200">
            </div>
            <p style="margin-top: 15px; font-size: 11px; color: #64748b;">
                Present this QR code at the boarding gate for verification
            </p>
        </div>

        <!-- Important Notice -->
        <div class="important-notice">
            <h4>Important Information</h4>
            <ul>
                <li>Please arrive at the departure terminal at least 30 minutes before scheduled departure time.</li>
                <li>Valid photo identification is required for all passengers during check-in.</li>
                <li>This ticket is non-transferable and valid only for the date and time specified above.</li>
                <li>Cancellations must be made at least 24 hours before departure for a full refund.</li>
                <li>Keep this ticket safe and present it (printed or digital) at the boarding gate.</li>
                <li>For any changes or inquiries, please contact our customer service with your booking reference.</li>
            </ul>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>Voyager Ferry Services</strong></p>
            <p>Email: support@voyager.com | Phone: 1-800-VOYAGER</p>
            <p>Website: www.voyager.com</p>
            <p style="margin-top: 10px; font-size: 9px;">
                This is an electronic ticket. Printed on {{ now()->format('F j, Y \a\t g:i A') }}
            </p>
        </div>
    </div>
</body>
</html>
