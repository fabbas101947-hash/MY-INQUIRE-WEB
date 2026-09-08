<?php
declare(strict_types=1);
session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off']);
session_start();
require_once __DIR__ . '/../config/database.php';

function json(array $data, int $status = 200): never { http_response_code($status); header('Content-Type: application/json; charset=utf-8'); echo json_encode($data); exit; }
function body(): array { $data = json_decode(file_get_contents('php://input'), true); return is_array($data) ? $data : $_POST; }
function csrf(): string { if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32)); return $_SESSION['csrf']; }
function valid_csrf(array $data): bool { return isset($data['csrf']) && hash_equals($_SESSION['csrf'] ?? '', (string)$data['csrf']); }
function clean(string $value): string { return trim(strip_tags($value)); }
function require_admin(): void { if (empty($_SESSION['admin_id'])) { header('Location: login.php'); exit; } }
