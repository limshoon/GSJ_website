<?php

declare(strict_types=1);

function pagination_meta(int $total, int $page = 1, int $limit = 20): array
{
    $limit = max(1, min(100, $limit));
    $totalPages = max(1, (int) ceil($total / $limit));
    $page = max(1, min($page, $totalPages));

    return [
        'page' => $page,
        'limit' => $limit,
        'offset' => ($page - 1) * $limit,
        'total' => $total,
        'totalPages' => $totalPages,
    ];
}
