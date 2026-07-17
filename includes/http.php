<?php

declare(strict_types=1);

function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');

    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $payload = json_decode($raw, true);

    if (!is_array($payload)) {
        json_response(['error' => 'JSON 형식이 올바르지 않습니다.'], 400);
    }

    return $payload;
}

function method_not_allowed(): void
{
    json_response(['error' => 'Method not allowed'], 405);
}

function handle_api_error(Throwable $error): void
{
    $status = $error->getCode();
    if ($status < 400 || $status > 599) {
        $status = 500;
    }

    json_response(['error' => $error->getMessage() ?: '처리 중 문제가 발생했습니다.'], $status);
}
