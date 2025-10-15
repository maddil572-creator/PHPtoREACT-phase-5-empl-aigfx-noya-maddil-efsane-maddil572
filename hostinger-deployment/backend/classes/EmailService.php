<?php
/**
 * Email Service Class
 * Handles email sending and template management
 */

require_once __DIR__ . '/../config/database.php';

class EmailService {
    private $db;
    private $smtpHost;
    private $smtpPort;
    private $smtpUsername;
    private $smtpPassword;
    private $fromEmail;
    private $fromName;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        
        // Load SMTP settings from environment or database
        $this->smtpHost = $_ENV['SMTP_HOST'] ?? SMTP_HOST;
        $this->smtpPort = $_ENV['SMTP_PORT'] ?? SMTP_PORT;
        $this->smtpUsername = $_ENV['SMTP_USERNAME'] ?? SMTP_USERNAME;
        $this->smtpPassword = $_ENV['SMTP_PASSWORD'] ?? SMTP_PASSWORD;
        $this->fromEmail = $_ENV['FROM_EMAIL'] ?? FROM_EMAIL;
        $this->fromName = $_ENV['FROM_NAME'] ?? FROM_NAME;
    }
    
    /**
     * Send email using PHP's mail function or SMTP
     */
    public function sendEmail($to, $subject, $body, $isHtml = true, $attachments = []) {
        try {
            // If SMTP is configured, use PHPMailer (would need to be installed)
            if ($this->smtpHost && $this->smtpUsername) {
                return $this->sendSMTPEmail($to, $subject, $body, $isHtml, $attachments);
            } else {
                return $this->sendSimpleEmail($to, $subject, $body, $isHtml);
            }
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to send email: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Send email using PHP's mail function
     */
    private function sendSimpleEmail($to, $subject, $body, $isHtml = true) {
        $headers = [];
        $headers[] = "From: {$this->fromName} <{$this->fromEmail}>";
        $headers[] = "Reply-To: {$this->fromEmail}";
        $headers[] = "X-Mailer: PHP/" . phpversion();
        
        if ($isHtml) {
            $headers[] = "MIME-Version: 1.0";
            $headers[] = "Content-Type: text/html; charset=UTF-8";
        } else {
            $headers[] = "Content-Type: text/plain; charset=UTF-8";
        }
        
        $headerString = implode("\r\n", $headers);
        
        if (mail($to, $subject, $body, $headerString)) {
            return [
                'success' => true,
                'message' => 'Email sent successfully'
            ];
        } else {
            return [
                'success' => false,
                'error' => 'Failed to send email'
            ];
        }
    }
    
    /**
     * Send email using SMTP (basic implementation)
     */
    private function sendSMTPEmail($to, $subject, $body, $isHtml = true, $attachments = []) {
        // This is a basic SMTP implementation
        // In production, you should use PHPMailer or similar library
        
        $socket = fsockopen($this->smtpHost, $this->smtpPort, $errno, $errstr, 30);
        
        if (!$socket) {
            return [
                'success' => false,
                'error' => "SMTP connection failed: $errstr ($errno)"
            ];
        }
        
        // Read server response
        $response = fgets($socket, 515);
        if (substr($response, 0, 3) != '220') {
            return [
                'success' => false,
                'error' => 'SMTP server not ready'
            ];
        }
        
        // SMTP commands
        $commands = [
            "EHLO {$_SERVER['SERVER_NAME']}\r\n",
            "STARTTLS\r\n",
            "AUTH LOGIN\r\n",
            base64_encode($this->smtpUsername) . "\r\n",
            base64_encode($this->smtpPassword) . "\r\n",
            "MAIL FROM: <{$this->fromEmail}>\r\n",
            "RCPT TO: <$to>\r\n",
            "DATA\r\n"
        ];
        
        foreach ($commands as $command) {
            fputs($socket, $command);
            $response = fgets($socket, 515);
            
            // Check for errors (basic check)
            if (substr($response, 0, 1) == '5') {
                fclose($socket);
                return [
                    'success' => false,
                    'error' => 'SMTP error: ' . trim($response)
                ];
            }
        }
        
        // Send email content
        $content = "Subject: $subject\r\n";
        $content .= "From: {$this->fromName} <{$this->fromEmail}>\r\n";
        $content .= "To: $to\r\n";
        
        if ($isHtml) {
            $content .= "Content-Type: text/html; charset=UTF-8\r\n";
        }
        
        $content .= "\r\n$body\r\n.\r\n";
        
        fputs($socket, $content);
        $response = fgets($socket, 515);
        
        // Quit
        fputs($socket, "QUIT\r\n");
        fclose($socket);
        
        if (substr($response, 0, 3) == '250') {
            return [
                'success' => true,
                'message' => 'Email sent successfully'
            ];
        } else {
            return [
                'success' => false,
                'error' => 'Failed to send email: ' . trim($response)
            ];
        }
    }
    
    /**
     * Send contact form notification
     */
    public function sendContactNotification($contactData) {
        $subject = "New Contact Form Submission - {$contactData['subject']}";
        
        $body = $this->getContactEmailTemplate($contactData);
        
        // Send to admin
        $adminEmail = $_ENV['ADMIN_EMAIL'] ?? 'admin@adilgfx.com';
        
        return $this->sendEmail($adminEmail, $subject, $body, true);
    }
    
    /**
     * Send contact form confirmation to user
     */
    public function sendContactConfirmation($contactData) {
        $subject = "Thank you for contacting Adil GFX";
        
        $body = $this->getContactConfirmationTemplate($contactData);
        
        return $this->sendEmail($contactData['email'], $subject, $body, true);
    }
    
    /**
     * Send newsletter confirmation
     */
    public function sendNewsletterConfirmation($email, $name = '') {
        $subject = "Welcome to Adil GFX Newsletter";
        
        $body = $this->getNewsletterWelcomeTemplate($name);
        
        return $this->sendEmail($email, $subject, $body, true);
    }
    
    /**
     * Send password reset email
     */
    public function sendPasswordResetEmail($email, $name, $resetToken) {
        $subject = "Password Reset Request - Adil GFX";
        
        $resetUrl = $_ENV['FRONTEND_URL'] . "/reset-password?token=" . $resetToken;
        $body = $this->getPasswordResetTemplate($name, $resetUrl);
        
        return $this->sendEmail($email, $subject, $body, true);
    }
    
    /**
     * Get contact form email template
     */
    private function getContactEmailTemplate($data) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>New Contact Form Submission</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
                .content { background: white; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #555; }
                .value { margin-top: 5px; }
                .message { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 15px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>New Contact Form Submission</h2>
                    <p>You have received a new message from your website contact form.</p>
                </div>
                
                <div class='content'>
                    <div class='field'>
                        <div class='label'>Name:</div>
                        <div class='value'>{$data['name']}</div>
                    </div>
                    
                    <div class='field'>
                        <div class='label'>Email:</div>
                        <div class='value'>{$data['email']}</div>
                    </div>
                    
                    " . (isset($data['phone']) ? "
                    <div class='field'>
                        <div class='label'>Phone:</div>
                        <div class='value'>{$data['phone']}</div>
                    </div>
                    " : "") . "
                    
                    <div class='field'>
                        <div class='label'>Subject:</div>
                        <div class='value'>{$data['subject']}</div>
                    </div>
                    
                    " . (isset($data['service']) ? "
                    <div class='field'>
                        <div class='label'>Service:</div>
                        <div class='value'>{$data['service']}</div>
                    </div>
                    " : "") . "
                    
                    " . (isset($data['budget']) ? "
                    <div class='field'>
                        <div class='label'>Budget:</div>
                        <div class='value'>{$data['budget']}</div>
                    </div>
                    " : "") . "
                    
                    <div class='field'>
                        <div class='label'>Message:</div>
                        <div class='message'>" . nl2br(htmlspecialchars($data['message'])) . "</div>
                    </div>
                </div>
                
                <p><small>This email was sent from your website contact form.</small></p>
            </div>
        </body>
        </html>
        ";
    }
    
    /**
     * Get contact confirmation template
     */
    private function getContactConfirmationTemplate($data) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>Thank you for contacting us</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4F46E5; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
                .content { background: white; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>Thank You, {$data['name']}!</h2>
                    <p>We've received your message and will get back to you soon.</p>
                </div>
                
                <div class='content'>
                    <p>Dear {$data['name']},</p>
                    
                    <p>Thank you for reaching out to Adil GFX. We have received your message regarding <strong>{$data['subject']}</strong> and will respond within 24 hours.</p>
                    
                    <p>Here's a copy of your message:</p>
                    <blockquote style='background: #f8f9fa; padding: 15px; border-left: 4px solid #4F46E5; margin: 20px 0;'>
                        " . nl2br(htmlspecialchars($data['message'])) . "
                    </blockquote>
                    
                    <p>If you have any urgent questions, feel free to call us at <strong>+1 (555) 123-4567</strong>.</p>
                    
                    <p>Best regards,<br>
                    The Adil GFX Team</p>
                </div>
            </div>
        </body>
        </html>
        ";
    }
    
    /**
     * Get newsletter welcome template
     */
    private function getNewsletterWelcomeTemplate($name) {
        $greeting = $name ? "Hi $name," : "Hello,";
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>Welcome to Adil GFX Newsletter</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4F46E5; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
                .content { background: white; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>Welcome to Adil GFX Newsletter! 🎨</h2>
                </div>
                
                <div class='content'>
                    <p>$greeting</p>
                    
                    <p>Welcome to the Adil GFX newsletter! You're now part of our creative community and will receive:</p>
                    
                    <ul>
                        <li>🎨 Design tips and tutorials</li>
                        <li>📈 Industry insights and trends</li>
                        <li>🎁 Exclusive offers and discounts</li>
                        <li>📱 Latest portfolio updates</li>
                        <li>💡 Creative inspiration</li>
                    </ul>
                    
                    <p>We promise to only send valuable content and never spam your inbox.</p>
                    
                    <p>Follow us on social media for daily inspiration:</p>
                    <p>
                        <a href='https://instagram.com/adilgfx'>Instagram</a> | 
                        <a href='https://facebook.com/adilgfx'>Facebook</a> | 
                        <a href='https://twitter.com/adilgfx'>Twitter</a>
                    </p>
                    
                    <p>Best regards,<br>
                    The Adil GFX Team</p>
                </div>
            </div>
        </body>
        </html>
        ";
    }
    
    /**
     * Get password reset template
     */
    private function getPasswordResetTemplate($name, $resetUrl) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>Password Reset Request</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #DC2626; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
                .content { background: white; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
                .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .warning { background: #FEF3C7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>Password Reset Request</h2>
                </div>
                
                <div class='content'>
                    <p>Hi $name,</p>
                    
                    <p>We received a request to reset your password for your Adil GFX account. If you made this request, click the button below to reset your password:</p>
                    
                    <p><a href='$resetUrl' class='button'>Reset Password</a></p>
                    
                    <p>Or copy and paste this link into your browser:</p>
                    <p><a href='$resetUrl'>$resetUrl</a></p>
                    
                    <div class='warning'>
                        <strong>Security Notice:</strong>
                        <ul>
                            <li>This link will expire in 1 hour</li>
                            <li>If you didn't request this reset, please ignore this email</li>
                            <li>Never share this link with anyone</li>
                        </ul>
                    </div>
                    
                    <p>If you're having trouble with the link, please contact our support team.</p>
                    
                    <p>Best regards,<br>
                    The Adil GFX Team</p>
                </div>
            </div>
        </body>
        </html>
        ";
    }
}