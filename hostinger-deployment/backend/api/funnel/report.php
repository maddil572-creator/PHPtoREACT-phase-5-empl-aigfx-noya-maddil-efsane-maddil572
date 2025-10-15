<?php
/**
 * Funnel Reports Endpoint
 * GET /api/funnel/report.php?simulation_id=123 - Get simulation report
 * GET /api/funnel/report.php?list=true - List all simulations
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
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

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'error' => 'Method not allowed'
        ]);
        exit();
    }

    $tester = new FunnelTester();

    if (isset($_GET['list']) && $_GET['list'] === 'true') {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

        $result = $tester->listSimulations($limit, $offset);

    } elseif (isset($_GET['simulation_id'])) {
        $simulationId = (int)$_GET['simulation_id'];
        $result = $tester->getSimulationById($simulationId);

    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'simulation_id or list parameter required'
        ]);
        exit();
    }

    if ($result['success']) {
        http_response_code(200);
    } else {
        http_response_code(404);
    }

    echo json_encode($result);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
