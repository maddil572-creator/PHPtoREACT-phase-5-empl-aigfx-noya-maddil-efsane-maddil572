<?php
/**
 * Funnel Tester Engine
 * Simulates complete user journey from traffic source to conversion
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/SendGridIntegration.php';
require_once __DIR__ . '/WhatsAppIntegration.php';
require_once __DIR__ . '/TelegramIntegration.php';
require_once __DIR__ . '/StripeIntegration.php';
require_once __DIR__ . '/CoinbaseIntegration.php';

class FunnelTester {
    private $db;
    private $conn;
    private $simulationId;
    private $trafficSource;
    private $mockUserId;
    private $currentStep;
    private $startTime;

    private $sendGrid;
    private $whatsApp;
    private $telegram;
    private $stripe;
    private $coinbase;

    private $validSources = ['google', 'linkedin', 'email', 'direct', 'social'];

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();

        $this->sendGrid = new SendGridIntegration();
        $this->whatsApp = new WhatsAppIntegration();
        $this->telegram = new TelegramIntegration();
        $this->stripe = new StripeIntegration();
        $this->coinbase = new CoinbaseIntegration();
    }

    public function startSimulation($trafficSource, $options = []) {
        if (!in_array($trafficSource, $this->validSources)) {
            return [
                'success' => false,
                'error' => 'Invalid traffic source. Valid sources: ' . implode(', ', $this->validSources)
            ];
        }

        $this->trafficSource = $trafficSource;
        $this->startTime = microtime(true);

        try {
            $stmt = $this->conn->prepare("
                CALL start_funnel_simulation(?, @simulation_id)
            ");
            $stmt->execute([$trafficSource]);

            $result = $this->conn->query("SELECT @simulation_id as id")->fetch();
            $this->simulationId = $result['id'];

            $this->telegram->notifyFunnelTestStarted($this->simulationId, $trafficSource);

            return [
                'success' => true,
                'simulation_id' => $this->simulationId,
                'traffic_source' => $trafficSource,
                'started_at' => date('Y-m-d H:i:s')
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to start simulation: ' . $e->getMessage()
            ];
        }
    }

    public function runFullFunnel($trafficSource, $testOptions = []) {
        $startResult = $this->startSimulation($trafficSource, $testOptions);

        if (!$startResult['success']) {
            return $startResult;
        }

        $results = [
            'simulation_id' => $this->simulationId,
            'traffic_source' => $trafficSource,
            'steps' => []
        ];

        $results['steps'][] = $this->stepLanding();

        $results['steps'][] = $this->stepSignup();

        $results['steps'][] = $this->stepEngagement();

        $results['steps'][] = $this->stepServiceSelection();

        $paymentMethod = $testOptions['payment_method'] ?? 'stripe';
        $results['steps'][] = $this->stepCheckout($paymentMethod);

        $results['steps'][] = $this->stepPostPurchase();

        $completionResult = $this->completeSimulation();
        $results['completion'] = $completionResult;

        return $results;
    }

    private function stepLanding() {
        $this->currentStep = 'landing';
        $stepStart = microtime(true);

        $this->logStep('Landing Page View', 'pending', 1);

        sleep(1);

        $apiCalls = [
            'analytics' => ['event' => 'page_view', 'source' => $this->trafficSource]
        ];

        $duration = round((microtime(true) - $stepStart) * 1000);

        $this->logStep('Landing Page View', 'success', 1, $apiCalls, null, null, $duration);

        return [
            'step' => 'landing',
            'status' => 'success',
            'duration_ms' => $duration
        ];
    }

    private function stepSignup() {
        $this->currentStep = 'signup';
        $stepStart = microtime(true);

        $this->logStep('User Signup', 'pending', 2);

        $mockUser = $this->createMockUser();

        if (!$mockUser['success']) {
            $duration = round((microtime(true) - $stepStart) * 1000);
            $this->logStep('User Signup', 'failed', 2, null, null, $mockUser['error'], $duration);

            return [
                'step' => 'signup',
                'status' => 'failed',
                'error' => $mockUser['error'],
                'duration_ms' => $duration
            ];
        }

        $this->mockUserId = $mockUser['user_id'];

        $this->updateSimulationUser($this->mockUserId);

        $apiCalls = [
            'database' => ['action' => 'create_user', 'user_id' => $this->mockUserId],
            'tokens' => ['action' => 'assign_tokens', 'amount' => 100]
        ];

        $duration = round((microtime(true) - $stepStart) * 1000);

        $this->logStep('User Signup', 'success', 2, $apiCalls, ['user_id' => $this->mockUserId], null, $duration);

        return [
            'step' => 'signup',
            'status' => 'success',
            'user_id' => $this->mockUserId,
            'tokens_assigned' => 100,
            'duration_ms' => $duration
        ];
    }

    private function stepEngagement() {
        $this->currentStep = 'engagement';
        $stepStart = microtime(true);

        $this->logStep('User Engagement', 'pending', 3);

        $mockUser = $this->getMockUser($this->mockUserId);
        $apiCalls = [];
        $errors = [];

        if ($this->sendGrid->isEnabled()) {
            $emailResult = $this->sendGrid->sendWelcomeEmail(
                $mockUser['email'],
                $mockUser['full_name'],
                100
            );
            $apiCalls['sendgrid'] = $emailResult;
            if (!$emailResult['success']) {
                $errors[] = 'SendGrid: ' . ($emailResult['error'] ?? 'Unknown error');
            }
        }

        if ($this->whatsApp->isEnabled() && !empty($mockUser['phone'])) {
            $whatsappResult = $this->whatsApp->sendWelcomeMessage(
                $mockUser['phone'],
                $mockUser['full_name']
            );
            $apiCalls['whatsapp'] = $whatsappResult;
            if (!$whatsappResult['success']) {
                $errors[] = 'WhatsApp: ' . ($whatsappResult['error'] ?? 'Unknown error');
            }
        }

        if ($this->telegram->isEnabled()) {
            $telegramResult = $this->telegram->notifyNewLead([
                'name' => $mockUser['full_name'],
                'email' => $mockUser['email'],
                'phone' => $mockUser['phone'] ?? 'N/A',
                'source' => $this->trafficSource,
                'message' => 'Funnel test simulation'
            ]);
            $apiCalls['telegram'] = $telegramResult;
            if (!$telegramResult['success']) {
                $errors[] = 'Telegram: ' . ($telegramResult['error'] ?? 'Unknown error');
            }
        }

        $duration = round((microtime(true) - $stepStart) * 1000);
        $status = empty($errors) ? 'success' : 'failed';
        $errorMsg = empty($errors) ? null : implode('; ', $errors);

        $this->logStep('User Engagement', $status, 3, $apiCalls, null, $errorMsg, $duration);

        return [
            'step' => 'engagement',
            'status' => $status,
            'apis_triggered' => count($apiCalls),
            'errors' => $errors,
            'duration_ms' => $duration
        ];
    }

    private function stepServiceSelection() {
        $this->currentStep = 'service_selection';
        $stepStart = microtime(true);

        $this->logStep('Service Selection', 'pending', 4);

        sleep(1);

        $selectedService = [
            'name' => 'Premium Logo Design',
            'price' => 299.00,
            'currency' => 'USD'
        ];

        $apiCalls = [
            'cart' => ['action' => 'add_to_cart', 'service' => $selectedService['name']]
        ];

        $duration = round((microtime(true) - $stepStart) * 1000);

        $this->logStep('Service Selection', 'success', 4, $apiCalls, $selectedService, null, $duration);

        return [
            'step' => 'service_selection',
            'status' => 'success',
            'service' => $selectedService,
            'duration_ms' => $duration
        ];
    }

    private function stepCheckout($paymentMethod = 'stripe') {
        $this->currentStep = 'checkout';
        $stepStart = microtime(true);

        $this->logStep('Checkout & Payment', 'pending', 5);

        $mockUser = $this->getMockUser($this->mockUserId);
        $amount = 299.00;
        $apiCalls = [];
        $errors = [];

        if ($paymentMethod === 'stripe' && $this->stripe->isEnabled()) {
            $stripeResult = $this->stripe->createPaymentIntent($amount, 'usd', [
                'customer_email' => $mockUser['email'],
                'customer_name' => $mockUser['full_name'],
                'test_mode' => 'true'
            ]);
            $apiCalls['stripe'] = $stripeResult;

            if (!$stripeResult['success']) {
                $errors[] = 'Stripe: ' . ($stripeResult['error'] ?? 'Unknown error');
            }
        } elseif ($paymentMethod === 'coinbase' && $this->coinbase->isEnabled()) {
            $coinbaseResult = $this->coinbase->createCharge(
                'Premium Logo Design',
                'Funnel test payment',
                $amount,
                'USD',
                ['customer_email' => $mockUser['email']]
            );
            $apiCalls['coinbase'] = $coinbaseResult;

            if (!$coinbaseResult['success']) {
                $errors[] = 'Coinbase: ' . ($coinbaseResult['error'] ?? 'Unknown error');
            }
        } else {
            $errors[] = 'Payment provider not enabled or invalid method';
        }

        $duration = round((microtime(true) - $stepStart) * 1000);
        $status = empty($errors) ? 'success' : 'failed';
        $errorMsg = empty($errors) ? null : implode('; ', $errors);

        $this->logStep('Checkout & Payment', $status, 5, $apiCalls, ['amount' => $amount], $errorMsg, $duration);

        if ($status === 'success') {
            $this->updateSimulationConversionValue($amount);
        }

        return [
            'step' => 'checkout',
            'status' => $status,
            'payment_method' => $paymentMethod,
            'amount' => $amount,
            'errors' => $errors,
            'duration_ms' => $duration
        ];
    }

    private function stepPostPurchase() {
        $this->currentStep = 'post_purchase';
        $stepStart = microtime(true);

        $this->logStep('Post-Purchase Communication', 'pending', 6);

        $mockUser = $this->getMockUser($this->mockUserId);
        $orderDetails = [
            'order_number' => 'ORD-' . strtoupper(substr(md5(uniqid()), 0, 8)),
            'service' => 'Premium Logo Design',
            'amount' => '299.00'
        ];

        $apiCalls = [];
        $errors = [];

        if ($this->sendGrid->isEnabled()) {
            $emailResult = $this->sendGrid->sendOrderConfirmation(
                $mockUser['email'],
                $mockUser['full_name'],
                $orderDetails
            );
            $apiCalls['sendgrid'] = $emailResult;
            if (!$emailResult['success']) {
                $errors[] = 'SendGrid: ' . ($emailResult['error'] ?? 'Unknown error');
            }
        }

        if ($this->whatsApp->isEnabled() && !empty($mockUser['phone'])) {
            $whatsappResult = $this->whatsApp->sendOrderConfirmation(
                $mockUser['phone'],
                $mockUser['full_name'],
                $orderDetails
            );
            $apiCalls['whatsapp'] = $whatsappResult;
            if (!$whatsappResult['success']) {
                $errors[] = 'WhatsApp: ' . ($whatsappResult['error'] ?? 'Unknown error');
            }
        }

        if ($this->telegram->isEnabled()) {
            $telegramResult = $this->telegram->notifyNewOrder([
                'order_number' => $orderDetails['order_number'],
                'user_name' => $mockUser['full_name'],
                'service' => $orderDetails['service'],
                'amount' => $orderDetails['amount'],
                'payment_method' => 'Test Mode'
            ]);
            $apiCalls['telegram'] = $telegramResult;
            if (!$telegramResult['success']) {
                $errors[] = 'Telegram: ' . ($telegramResult['error'] ?? 'Unknown error');
            }
        }

        $duration = round((microtime(true) - $stepStart) * 1000);
        $status = empty($errors) ? 'success' : 'failed';
        $errorMsg = empty($errors) ? null : implode('; ', $errors);

        $this->logStep('Post-Purchase Communication', $status, 6, $apiCalls, $orderDetails, $errorMsg, $duration);

        return [
            'step' => 'post_purchase',
            'status' => $status,
            'order_number' => $orderDetails['order_number'],
            'apis_triggered' => count($apiCalls),
            'errors' => $errors,
            'duration_ms' => $duration
        ];
    }

    private function completeSimulation() {
        try {
            $totalDuration = round((microtime(true) - $this->startTime) * 1000);

            $stmt = $this->conn->prepare("
                CALL complete_funnel_simulation(?, ?)
            ");
            $stmt->execute([$this->simulationId, $totalDuration]);

            $stmt = $this->conn->prepare("
                SELECT * FROM funnel_simulations WHERE id = ?
            ");
            $stmt->execute([$this->simulationId]);
            $simulation = $stmt->fetch();

            $stmt = $this->conn->prepare("
                SELECT * FROM funnel_steps WHERE simulation_id = ? ORDER BY step_order
            ");
            $stmt->execute([$this->simulationId]);
            $steps = $stmt->fetchAll();

            $successfulSteps = 0;
            foreach ($steps as $step) {
                if ($step['status'] === 'success') {
                    $successfulSteps++;
                }
            }

            $this->telegram->notifyFunnelTestCompleted($this->simulationId, [
                'success' => $simulation['status'] === 'completed',
                'steps_completed' => $successfulSteps,
                'total_steps' => count($steps),
                'duration' => round($totalDuration / 1000, 2)
            ]);

            return [
                'success' => true,
                'simulation' => $simulation,
                'steps' => $steps,
                'summary' => [
                    'total_steps' => count($steps),
                    'successful_steps' => $successfulSteps,
                    'failed_steps' => count($steps) - $successfulSteps,
                    'total_duration_ms' => $totalDuration,
                    'conversion_value' => $simulation['conversion_value']
                ]
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to complete simulation: ' . $e->getMessage()
            ];
        }
    }

    private function createMockUser() {
        try {
            $firstName = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Alex', 'Lisa'][rand(0, 7)];
            $lastName = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'][rand(0, 7)];
            $fullName = $firstName . ' ' . $lastName;
            $email = strtolower($firstName . '.' . $lastName . rand(100, 999)) . '@testuser.com';
            $phone = '+1' . rand(2000000000, 9999999999);

            $stmt = $this->conn->prepare("
                INSERT INTO users (email, full_name, phone, role, token_balance, created_at)
                VALUES (?, ?, ?, 'user', 100, NOW())
            ");

            $stmt->execute([$email, $fullName, $phone]);
            $userId = $this->conn->lastInsertId();

            return [
                'success' => true,
                'user_id' => $userId,
                'email' => $email,
                'full_name' => $fullName,
                'phone' => $phone
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to create mock user: ' . $e->getMessage()
            ];
        }
    }

    private function getMockUser($userId) {
        try {
            $stmt = $this->conn->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            return $stmt->fetch();
        } catch (Exception $e) {
            return null;
        }
    }

    private function logStep($stepName, $status, $order, $apiCalls = null, $responseData = null, $error = null, $duration = 0) {
        try {
            $stmt = $this->conn->prepare("
                CALL log_funnel_step(?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $this->simulationId,
                $stepName,
                $order,
                $status,
                json_encode($apiCalls),
                json_encode($responseData),
                $error,
                $duration
            ]);

        } catch (Exception $e) {
            error_log("Failed to log funnel step: " . $e->getMessage());
        }
    }

    private function updateSimulationUser($userId) {
        try {
            $stmt = $this->conn->prepare("
                UPDATE funnel_simulations SET mock_user_id = ? WHERE id = ?
            ");
            $stmt->execute([$userId, $this->simulationId]);
        } catch (Exception $e) {
            error_log("Failed to update simulation user: " . $e->getMessage());
        }
    }

    private function updateSimulationConversionValue($amount) {
        try {
            $stmt = $this->conn->prepare("
                UPDATE funnel_simulations SET conversion_value = ? WHERE id = ?
            ");
            $stmt->execute([$amount, $this->simulationId]);
        } catch (Exception $e) {
            error_log("Failed to update conversion value: " . $e->getMessage());
        }
    }

    public function getSimulationById($simulationId) {
        try {
            $stmt = $this->conn->prepare("
                SELECT * FROM funnel_simulations WHERE id = ?
            ");
            $stmt->execute([$simulationId]);
            $simulation = $stmt->fetch();

            if (!$simulation) {
                return ['success' => false, 'error' => 'Simulation not found'];
            }

            $stmt = $this->conn->prepare("
                SELECT * FROM funnel_steps WHERE simulation_id = ? ORDER BY step_order
            ");
            $stmt->execute([$simulationId]);
            $steps = $stmt->fetchAll();

            return [
                'success' => true,
                'simulation' => $simulation,
                'steps' => $steps
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to retrieve simulation: ' . $e->getMessage()
            ];
        }
    }

    public function listSimulations($limit = 20, $offset = 0) {
        try {
            $stmt = $this->conn->prepare("
                SELECT * FROM funnel_simulations
                ORDER BY started_at DESC
                LIMIT ? OFFSET ?
            ");
            $stmt->execute([$limit, $offset]);
            $simulations = $stmt->fetchAll();

            return [
                'success' => true,
                'count' => count($simulations),
                'simulations' => $simulations
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to list simulations: ' . $e->getMessage()
            ];
        }
    }
}
