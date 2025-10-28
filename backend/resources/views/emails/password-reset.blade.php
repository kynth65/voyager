<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4F46E5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
            border-radius: 0 0 5px 5px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #4F46E5;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
        }
        .token-box {
            background-color: #e8e8e8;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            font-family: monospace;
            word-break: break-all;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Reset Your Password</h1>
    </div>
    <div class="content">
        <p>Hello {{ $user->name }},</p>

        <p>You are receiving this email because we received a password reset request for your account.</p>

        <p>Click the button below to reset your password:</p>

        <a href="{{ config('app.frontend_url', 'http://localhost:5173') }}/reset-password?token={{ $token }}&email={{ urlencode($email) }}" class="button">
            Reset Password
        </a>

        <p>Or copy and paste this link into your browser:</p>
        <div class="token-box">
            {{ config('app.frontend_url', 'http://localhost:5173') }}/reset-password?token={{ $token }}&email={{ urlencode($email) }}
        </div>

        <p>This password reset link will expire in 60 minutes.</p>

        <p>If you did not request a password reset, no further action is required.</p>

        <p>Regards,<br>{{ config('app.name', 'Voyager') }}</p>
    </div>
    <div class="footer">
        <p>&copy; {{ date('Y') }} {{ config('app.name', 'Voyager') }}. All rights reserved.</p>
    </div>
</body>
</html>
