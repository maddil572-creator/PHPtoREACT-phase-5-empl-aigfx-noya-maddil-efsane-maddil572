<?php
/**
 * Funnel Simulation Endpoint
 * POST /api/funnel/simulate.php - Run a funnel simulation
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../classes/FunnelTester.php';
require_once __DIR__ . '/../../classes/Auth.php';

try {
    $auth = new Auth();
    $user = $auth->getCurrentUser();

    if (!$user || $user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'Admin access required'
        ]);
        exit();
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'error' => 'Method not allowed'
        ]);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['traffic_source'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'traffic_source is required'
        ]);
        exit();
    }

    $trafficSource = $input['traffic_source'];
    $paymentMethod = $input['payment_method'] ?? 'stripe';

    $tester = new FunnelTester();
    $result = $tester->runFullFunnel($trafficSource, [
        'payment_method' => $paymentMethod
    ]);

    if ($result['success'] ?? false) {
        http_response_code(200);
    } else {
        http_response_code(500);
    }

    echo json_encode($result);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
