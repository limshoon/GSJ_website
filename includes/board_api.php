<?php

declare(strict_types=1);

require_once __DIR__ . '/http.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/content.php';

function handle_board_api(string $table): void
{
    assert_post_table($table);
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        $id = trim((string) ($_GET['id'] ?? ''));
        $includePrivate = current_admin() !== null;

        if ($id !== '') {
            $post = find_post($table, $id, $includePrivate);
            if (!$post) {
                json_response(['error' => '게시물을 찾을 수 없습니다.'], 404);
            }
            json_response(['post' => $post]);
        }

        json_response(list_posts_for_api($table, $includePrivate));
    }

    if ($method === 'POST' || $method === 'PUT') {
        $admin = require_password_ready();
        require_csrf();
        $body = read_json_body();
        $post = is_array($body['post'] ?? null) ? $body['post'] : $body;
        $post = normalize_post($post, $table, 0);
        upsert_post($table, $post, 0);
        write_admin_log((int) $admin['id'], $method === 'POST' ? 'create_post' : 'update_post', $table, $post['id']);
        json_response(['ok' => true, 'post' => find_post($table, $post['id'], true)]);
    }

    if ($method === 'DELETE') {
        $admin = require_password_ready();
        require_csrf();
        $body = read_json_body();
        $id = trim((string) ($_GET['id'] ?? ($body['id'] ?? '')));
        if ($id === '') {
            json_response(['error' => '삭제할 게시물 ID가 필요합니다.'], 400);
        }

        $stmt = db()->prepare("DELETE FROM {$table} WHERE id = :id");
        $stmt->execute([':id' => $id]);
        write_admin_log((int) $admin['id'], 'delete_post', $table, $id);
        json_response(['ok' => true]);
    }

    method_not_allowed();
}

function list_posts_for_api(string $table, bool $includePrivate): array
{
    $page = max(1, (int) ($_GET['page'] ?? 1));
    $limit = min(100, max(1, (int) ($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;
    $query = trim((string) ($_GET['q'] ?? $_GET['query'] ?? ''));
    $status = trim((string) ($_GET['status'] ?? ''));

    $where = [];
    $params = [];

    if (!$includePrivate) {
        $where[] = "status = 'published'";
    } elseif ($status !== '' && $status !== 'all') {
        $where[] = 'status = :status';
        $params[':status'] = $status;
    }

    if ($query !== '') {
        $where[] = '(title LIKE :query OR summary LIKE :query OR body LIKE :query OR category LIKE :query)';
        $params[':query'] = '%' . $query . '%';
    }

    $whereSql = $where ? ' WHERE ' . implode(' AND ', $where) : '';
    $countStmt = db()->prepare("SELECT COUNT(*) FROM {$table}{$whereSql}");
    $countStmt->execute($params);
    $total = (int) $countStmt->fetchColumn();

    $stmt = db()->prepare("SELECT * FROM {$table}{$whereSql} ORDER BY post_date DESC, created_at DESC, id DESC LIMIT :limit OFFSET :offset");
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    return [
        'posts' => array_map(fn (array $row): array => db_row_to_post($row), $stmt->fetchAll()),
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'totalPages' => max(1, (int) ceil($total / $limit)),
        ],
    ];
}

function find_post(string $table, string $id, bool $includePrivate): ?array
{
    $sql = "SELECT * FROM {$table} WHERE id = :id";
    if (!$includePrivate) {
        $sql .= " AND status = 'published'";
    }
    $sql .= ' LIMIT 1';
    $stmt = db()->prepare($sql);
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    return $row ? db_row_to_post($row) : null;
}
