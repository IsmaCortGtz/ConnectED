<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - ConnectED</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
            background-color: #0b0d0e;
            color: #d6d9dc;
            line-height: 1.6;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #0b0d0e;
        }

        .email-wrapper {
            background-color: #0f1214;
            border: 1px solid #1a1e22;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        }

        .header {
            background: linear-gradient(135deg, #0c2340 0%, #1a3a52 100%);
            padding: 30px 20px;
            text-align: center;
            border-bottom: 1px solid #1a1e22;
        }

        .header-title {
            font-size: 28px;
            font-weight: 700;
            color: #55d0ff;
            text-decoration: none;
            display: inline-block;
            margin-bottom: 10px;
        }

        .header-subtitle {
            font-size: 14px;
            color: #8fa3af;
            margin-top: 8px;
        }

        .content {
            padding: 40px 30px;
        }

        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #d6d9dc;
            margin-bottom: 20px;
        }

        .body-text {
            font-size: 14px;
            color: #a0aab4;
            margin-bottom: 20px;
            line-height: 1.8;
        }

        .cta-container {
            margin: 40px 0;
            text-align: center;
        }

        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #0099ff 0%, #0077cc 100%);
            color: white;
            padding: 14px 40px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 12px rgba(0, 153, 255, 0.3);
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0, 153, 255, 0.4);
        }

        .alternative-link {
            margin: 30px 0;
            padding: 20px;
            background-color: #0b0d0e;
            border: 1px solid #1a1e22;
            border-radius: 6px;
            text-align: center;
        }

        .alternative-text {
            font-size: 12px;
            color: #6b7680;
            margin-bottom: 10px;
        }

        .alternative-link-text {
            word-break: break-all;
            font-size: 12px;
            color: #0099ff;
            font-family: monospace;
            padding: 10px;
            background-color: #0f1214;
            border-radius: 4px;
            display: block;
        }

        .warning {
            background-color: #3f0d12;
            border: 1px solid #d7424e;
            border-radius: 6px;
            padding: 15px;
            margin: 30px 0;
            font-size: 13px;
            color: #f2c0c4;
        }

        .warning-title {
            font-weight: 600;
            margin-bottom: 5px;
            color: #d7424e;
        }

        .footer {
            background-color: #0b0d0e;
            border-top: 1px solid #1a1e22;
            padding: 30px 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7680;
        }

        .footer-text {
            margin-bottom: 15px;
            line-height: 1.6;
        }

        .social-links {
            margin-top: 20px;
        }

        .social-links a {
            color: #0099ff;
            text-decoration: none;
            margin: 0 10px;
            font-size: 12px;
        }

        .divider {
            height: 1px;
            background-color: #1a1e22;
            margin: 20px 0;
        }

        @media (max-width: 600px) {
            .container {
                padding: 10px;
            }

            .content {
                padding: 20px 15px;
            }

            .header {
                padding: 20px 15px;
            }

            .header-title {
                font-size: 24px;
            }

            .cta-button {
                padding: 12px 30px;
                font-size: 14px;
                color: #d7f4ff;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-wrapper">
            <!-- Header -->
            <div class="header">
                <div class="header-title">ConnectED</div>
                <div class="header-subtitle">Learn. Connect. Grow.</div>
            </div>

            <!-- Content -->
            <div class="content">
                <div class="greeting">Hello {{ $user->name }},</div>

                <p class="body-text">
                    We have received a request to reset your password. If you did not make this request, please ignore this email.
                </p>

                <p class="body-text">
                    Click the button below to set a new password. This link will expire in 1 hour.
                </p>

                <div class="cta-container">
                    <a href="{{ $resetUrl }}" class="cta-button">Reset Password</a>
                </div>

                <div class="alternative-link">
                    <div class="alternative-text">Or copy and paste this link in your browser:</div>
                    <span class="alternative-link-text">{{ $resetUrl }}</span>
                </div>

                <div class="warning">
                    <div class="warning-title">⚠️ Security</div>
                    <p>
                        This link is valid for 1 hour only. If it expires, you can request a new reset link.
                        Never share this link with anyone.
                    </p>
                </div>

                <p class="body-text">
                    If you have trouble resetting your password, contact our support team.
                </p>
            </div>

            <!-- Footer -->
            <div class="footer">
                <div class="footer-text">
                    © {{ date('Y') }} ConnectED. All rights reserved.
                </div>
                <div class="divider"></div>
                <div class="footer-text">
                    This is an automated message, please do not reply to this email.
                </div>
            </div>
        </div>
    </div>
</body>
</html>
