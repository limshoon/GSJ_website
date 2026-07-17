<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';

const POST_TABLES = ['notices', 'activities', 'resources'];

function default_content(): array
{
    return [
        'site' => [
            'name' => '과수정 교원노동조합',
            'description' => '과학, 수학, 정보 교과의 교육 환경 개선과 조합원의 권익 보호를 위한 과수정 교원노동조합 공식 웹사이트',
            'officeName' => '과수정 교원노동조합 사무실',
            'addressLines' => ['서울특별시 00구 00로 00 0000빌딩 000호'],
            'phone' => '02-000-0000',
            'email' => 'smi.union@example.com',
            'copyright' => '© 2024 과수정 교원노동조합. ALL RIGHTS RESERVED.',
            'sns' => [
                ['label' => 'Instagram', 'url' => '#'],
                ['label' => 'Facebook', 'url' => '#'],
                ['label' => 'YouTube', 'url' => '#'],
            ],
        ],
        'home' => [
            'titleLines' => ['과학.', '수학.', '정보.'],
            'subtitle' => '우리의 권리, 우리의 연대.',
            'copy' => '과학, 수학, 정보 교과의 교육 환경 개선과 조합원의 권익 보호를 위해 함께 행동합니다.',
            'visualWords' => ['SCI', 'MATH', 'INFO'],
        ],
        'aboutItems' => [],
        'contactItems' => [],
        'notices' => [],
        'activities' => [],
        'resources' => [],
    ];
}

function load_site_content(bool $includePrivate = false): array
{
    $defaults = default_content();

    return [
        'site' => load_setting('site', $defaults['site']),
        'home' => load_setting('home', $defaults['home']),
        'aboutItems' => load_setting('aboutItems', $defaults['aboutItems']),
        'contactItems' => load_contacts($defaults['contactItems']),
        'notices' => load_posts('notices', $includePrivate),
        'activities' => load_posts('activities', $includePrivate),
        'resources' => load_posts('resources', $includePrivate),
    ];
}

function save_site_content(array $content): array
{
    $content = normalize_content_payload($content);
    apply_managed_uploads($content);

    $pdo = db();
    $pdo->beginTransaction();

    try {
        save_setting('site', $content['site']);
        save_setting('home', $content['home']);
        save_setting('aboutItems', $content['aboutItems']);
        sync_contacts($content['contactItems']);

        foreach (POST_TABLES as $table) {
            sync_posts($table, $content[$table]);
        }

        $pdo->commit();
    } catch (Throwable $error) {
        $pdo->rollBack();
        throw $error;
    }

    return load_site_content(true);
}

function load_contacts(array $fallback = []): array
{
    try {
        $rows = db()->query('SELECT * FROM contacts ORDER BY sort_order ASC, id ASC')->fetchAll();
    } catch (Throwable $error) {
        return load_setting('contactItems', $fallback);
    }

    if (!$rows) {
        return $fallback;
    }

    return array_map(fn (array $row): array => [
        'id' => (string) ($row['id'] ?? ''),
        'title' => (string) ($row['title'] ?? ''),
        'main' => (string) ($row['main_value'] ?? ''),
        'sub' => (string) ($row['sub_value'] ?? ''),
        'icon' => (string) ($row['icon'] ?? 'phone'),
        'mapProvider' => (string) ($row['map_provider'] ?? ''),
        'mapLat' => (string) ($row['map_lat'] ?? ''),
        'mapLng' => (string) ($row['map_lng'] ?? ''),
    ], $rows);
}

function sync_contacts(array $contacts): void
{
    $pdo = db();
    $ids = [];

    foreach ($contacts as $index => $contact) {
        $contact = normalize_contact($contact, $index);
        $ids[] = $contact['id'];
        $stmt = $pdo->prepare(
            'INSERT INTO contacts
              (id, title, main_value, sub_value, icon, map_provider, map_lat, map_lng, sort_order, updated_at)
             VALUES
              (:id, :title, :main_value, :sub_value, :icon, :map_provider, :map_lat, :map_lng, :sort_order, NOW())
             ON DUPLICATE KEY UPDATE
              title = VALUES(title),
              main_value = VALUES(main_value),
              sub_value = VALUES(sub_value),
              icon = VALUES(icon),
              map_provider = VALUES(map_provider),
              map_lat = VALUES(map_lat),
              map_lng = VALUES(map_lng),
              sort_order = VALUES(sort_order),
              updated_at = NOW()'
        );
        $stmt->execute([
            ':id' => $contact['id'],
            ':title' => $contact['title'],
            ':main_value' => $contact['main'],
            ':sub_value' => $contact['sub'],
            ':icon' => $contact['icon'],
            ':map_provider' => $contact['mapProvider'],
            ':map_lat' => $contact['mapLat'] !== '' ? $contact['mapLat'] : null,
            ':map_lng' => $contact['mapLng'] !== '' ? $contact['mapLng'] : null,
            ':sort_order' => $index,
        ]);
    }

    if ($ids) {
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $stmt = $pdo->prepare("DELETE FROM contacts WHERE id NOT IN ({$placeholders})");
        $stmt->execute($ids);
    } else {
        $pdo->exec('DELETE FROM contacts');
    }
}

function normalize_contact(array $contact, int $index): array
{
    return [
        'id' => trim((string) ($contact['id'] ?? '')) ?: 'contact-' . ($index + 1),
        'title' => (string) ($contact['title'] ?? ''),
        'main' => (string) ($contact['main'] ?? ''),
        'sub' => (string) ($contact['sub'] ?? ''),
        'icon' => (string) ($contact['icon'] ?? 'phone'),
        'mapProvider' => (string) ($contact['mapProvider'] ?? ''),
        'mapLat' => (string) ($contact['mapLat'] ?? ''),
        'mapLng' => (string) ($contact['mapLng'] ?? ''),
    ];
}

function load_setting(string $key, mixed $fallback): mixed
{
    $stmt = db()->prepare('SELECT setting_value FROM settings WHERE setting_key = :setting_key LIMIT 1');
    $stmt->execute([':setting_key' => $key]);
    $value = $stmt->fetchColumn();

    if ($value === false || $value === null || $value === '') {
        return $fallback;
    }

    $decoded = json_decode((string) $value, true);

    return $decoded === null && json_last_error() !== JSON_ERROR_NONE ? $fallback : $decoded;
}

function save_setting(string $key, mixed $value): void
{
    $stmt = db()->prepare(
        'INSERT INTO settings (setting_key, setting_value, updated_at)
         VALUES (:setting_key, :setting_value, NOW())
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()'
    );
    $stmt->execute([
        ':setting_key' => $key,
        ':setting_value' => json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    ]);
}

function load_posts(string $table, bool $includePrivate): array
{
    assert_post_table($table);

    $sql = "SELECT * FROM {$table}";
    if (!$includePrivate) {
        $sql .= " WHERE status = 'published'";
    }
    $sql .= " ORDER BY post_date DESC, created_at DESC, id DESC";

    $rows = db()->query($sql)->fetchAll();
    $posts = array_map(fn (array $row): array => db_row_to_post($row), $rows);

    usort($posts, fn (array $a, array $b): int => post_timestamp($b) <=> post_timestamp($a));

    return $posts;
}

function sync_posts(string $table, array $posts): void
{
    assert_post_table($table);
    $pdo = db();
    $ids = [];

    foreach ($posts as $index => $post) {
        $post = normalize_post($post, $table, $index);
        $ids[] = $post['id'];
        upsert_post($table, $post, $index);
    }

    if ($ids) {
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $stmt = $pdo->prepare("DELETE FROM {$table} WHERE id NOT IN ({$placeholders})");
        $stmt->execute($ids);
    } else {
        $pdo->exec("DELETE FROM {$table}");
    }
}

function upsert_post(string $table, array $post, int $sortOrder): void
{
    $stmt = db()->prepare(
        "INSERT INTO {$table}
          (id, post_date, published_at, title, summary, content, body, thumbnail, image, attachment_label, attachment_url, attachment_file, icon, category, status, author, views, is_notice, is_pinned, pinned, important, sort_order, created_at, updated_at)
         VALUES
          (:id, :post_date, :published_at, :title, :summary, :content, :body, :thumbnail, :image, :attachment_label, :attachment_url, :attachment_file, :icon, :category, :status, :author, :views, :is_notice, :is_pinned, :pinned, :important, :sort_order, :created_at, :updated_at)
         ON DUPLICATE KEY UPDATE
          post_date = VALUES(post_date),
          published_at = VALUES(published_at),
          title = VALUES(title),
          summary = VALUES(summary),
          content = VALUES(content),
          body = VALUES(body),
          thumbnail = VALUES(thumbnail),
          image = VALUES(image),
          attachment_label = VALUES(attachment_label),
          attachment_url = VALUES(attachment_url),
          attachment_file = VALUES(attachment_file),
          icon = VALUES(icon),
          category = VALUES(category),
          status = VALUES(status),
          author = VALUES(author),
          views = VALUES(views),
          is_notice = VALUES(is_notice),
          is_pinned = VALUES(is_pinned),
          pinned = VALUES(pinned),
          important = VALUES(important),
          sort_order = VALUES(sort_order),
          updated_at = VALUES(updated_at)"
    );

    $stmt->execute([
        ':id' => $post['id'],
        ':post_date' => normalize_date_for_db($post['date']),
        ':published_at' => normalize_datetime_for_db($post['publishedAt'] ?: $post['date']),
        ':title' => $post['title'],
        ':summary' => $post['summary'],
        ':content' => $post['body'],
        ':body' => $post['body'],
        ':thumbnail' => $post['image'],
        ':image' => $post['image'],
        ':attachment_label' => $post['attachmentLabel'],
        ':attachment_url' => $post['attachmentUrl'],
        ':attachment_file' => $post['attachmentUrl'],
        ':icon' => $post['icon'],
        ':category' => $post['category'],
        ':status' => $post['status'],
        ':author' => $post['author'],
        ':views' => (int) $post['views'],
        ':is_notice' => !empty($post['important']) ? 1 : 0,
        ':is_pinned' => !empty($post['pinned']) ? 1 : 0,
        ':pinned' => !empty($post['pinned']) ? 1 : 0,
        ':important' => !empty($post['important']) ? 1 : 0,
        ':sort_order' => $sortOrder,
        ':created_at' => normalize_datetime_for_db($post['createdAt']),
        ':updated_at' => normalize_datetime_for_db($post['updatedAt']),
    ]);
}

function db_row_to_post(array $row): array
{
    return [
        'id' => $row['id'],
        'createdAt' => datetime_to_iso($row['created_at'] ?? ''),
        'updatedAt' => datetime_to_iso($row['updated_at'] ?? ''),
        'publishedAt' => datetime_to_iso($row['published_at'] ?? ''),
        'date' => date_to_text($row['post_date'] ?? ''),
        'title' => $row['title'] ?? '',
        'summary' => $row['summary'] ?? '',
        'body' => $row['body'] ?? ($row['content'] ?? ''),
        'image' => $row['image'] ?: ($row['thumbnail'] ?? ''),
        'attachmentLabel' => $row['attachment_label'] ?? '',
        'attachmentUrl' => $row['attachment_url'] ?: ($row['attachment_file'] ?? ''),
        'icon' => $row['icon'] ?? 'document',
        'category' => $row['category'] ?? '',
        'status' => $row['status'] ?? 'published',
        'author' => $row['author'] ?? '',
        'views' => (int) ($row['views'] ?? 0),
        'pinned' => (bool) (($row['pinned'] ?? false) || ($row['is_pinned'] ?? false)),
        'important' => (bool) ($row['important'] ?? false),
    ];
}

function normalize_content_payload(array $content): array
{
    $defaults = default_content();
    $next = array_merge($defaults, $content);
    $next['site'] = array_merge($defaults['site'], is_array($content['site'] ?? null) ? $content['site'] : []);
    $next['home'] = array_merge($defaults['home'], is_array($content['home'] ?? null) ? $content['home'] : []);

    foreach (['aboutItems', 'contactItems', 'notices', 'activities', 'resources'] as $key) {
        if (!isset($next[$key]) || !is_array($next[$key])) {
            $next[$key] = [];
        }
    }

    return $next;
}

function normalize_post(array $post, string $table, int $index): array
{
    $defaults = [
        'notices' => ['category' => '공지', 'attachmentLabel' => '첨부 자료 보기'],
        'activities' => ['category' => '활동', 'attachmentLabel' => '첨부 자료 보기'],
        'resources' => ['category' => '자료', 'attachmentLabel' => '자료 보기'],
    ];
    $default = $defaults[$table];
    $now = gmdate('c');

    return [
        'id' => trim((string) ($post['id'] ?? '')) ?: create_post_id($table, $index),
        'createdAt' => (string) ($post['createdAt'] ?? $now),
        'updatedAt' => (string) ($post['updatedAt'] ?? $now),
        'date' => (string) ($post['date'] ?? date('Y.m.d')),
        'publishedAt' => (string) ($post['publishedAt'] ?? ($post['published_at'] ?? '')),
        'title' => (string) ($post['title'] ?? ''),
        'summary' => (string) ($post['summary'] ?? ($post['description'] ?? '')),
        'body' => (string) ($post['body'] ?? ($post['content'] ?? '')),
        'image' => (string) ($post['image'] ?? ($post['thumbnail'] ?? '')),
        'attachmentLabel' => (string) ($post['attachmentLabel'] ?? $default['attachmentLabel']),
        'attachmentUrl' => (string) ($post['attachmentUrl'] ?? ($post['attachment_file'] ?? '')),
        'icon' => (string) ($post['icon'] ?? 'document'),
        'category' => (string) ($post['category'] ?? $default['category']),
        'status' => in_array(($post['status'] ?? 'published'), ['published', 'private', 'draft'], true) ? $post['status'] : 'published',
        'author' => (string) ($post['author'] ?? ''),
        'views' => (int) ($post['views'] ?? 0),
        'pinned' => !empty($post['pinned']) || !empty($post['is_pinned']),
        'important' => !empty($post['important']) || !empty($post['is_notice']),
        '_uploads' => $post['_uploads'] ?? null,
    ];
}

function apply_managed_uploads(array &$content): void
{
    foreach (POST_TABLES as $table) {
        foreach ($content[$table] as &$post) {
            if (empty($post['_uploads']) || !is_array($post['_uploads'])) {
                continue;
            }

            foreach ($post['_uploads'] as $field => $upload) {
                if (!is_array($upload) || empty($upload['content'])) {
                    continue;
                }
                $post[$field] = save_upload($upload);
            }

            unset($post['_uploads']);
        }
        unset($post);
    }
}

function save_upload(array $upload): string
{
    $config = app_config()['uploads'];
    $originalName = (string) ($upload['name'] ?? 'upload');
    $kind = (string) ($upload['kind'] ?? 'file');
    $content = (string) $upload['content'];
    $binary = base64_decode(preg_replace('/^data:[^;]+;base64,/', '', $content), true);

    if ($binary === false) {
        throw new RuntimeException('업로드 파일을 처리할 수 없습니다.', 400);
    }

    if (strlen($binary) > (int) $config['max_size']) {
        throw new RuntimeException('업로드 가능한 파일 크기를 초과했습니다.', 400);
    }

    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    $fileExtensions = array_merge($imageExtensions, ['pdf', 'hwp', 'hwpx', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx']);
    $allowed = $kind === 'image' ? $imageExtensions : $fileExtensions;

    if (!in_array($extension, $allowed, true)) {
        throw new RuntimeException('허용되지 않는 파일 형식입니다.', 400);
    }

    assert_upload_mime($binary, $extension, $kind);

    $subDirectory = $kind === 'image' ? 'images' : 'files';
    $directory = rtrim((string) $config['directory'], '/') . '/' . $subDirectory;

    if (!is_dir($directory) && !mkdir($directory, 0755, true)) {
        throw new RuntimeException('업로드 폴더를 만들 수 없습니다.', 500);
    }

    $safeBase = preg_replace('/[^a-zA-Z0-9_-]+/', '-', pathinfo($originalName, PATHINFO_FILENAME));
    $safeBase = trim((string) $safeBase, '-') ?: 'upload';
    $fileName = $safeBase . '-' . date('YmdHis') . '-' . bin2hex(random_bytes(4)) . '.' . $extension;
    $path = $directory . '/' . $fileName;

    if (file_put_contents($path, $binary) === false) {
        throw new RuntimeException('파일을 저장하지 못했습니다.', 500);
    }

    if ($kind === 'image') {
        create_image_derivatives($path, $directory, $safeBase);
    }

    return rtrim((string) $config['url'], '/') . '/' . $subDirectory . '/' . $fileName;
}

function assert_upload_mime(string $binary, string $extension, string $kind): void
{
    if (!function_exists('finfo_open')) {
        return;
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = $finfo ? finfo_buffer($finfo, $binary) : '';
    if ($finfo) {
        finfo_close($finfo);
    }

    $allowedMimes = [
        'jpg' => ['image/jpeg'],
        'jpeg' => ['image/jpeg'],
        'png' => ['image/png'],
        'gif' => ['image/gif'],
        'webp' => ['image/webp'],
        'pdf' => ['application/pdf'],
        'hwp' => ['application/x-hwp', 'application/octet-stream'],
        'hwpx' => ['application/zip', 'application/octet-stream'],
        'doc' => ['application/msword', 'application/octet-stream'],
        'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/octet-stream'],
        'ppt' => ['application/vnd.ms-powerpoint', 'application/octet-stream'],
        'pptx' => ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/zip', 'application/octet-stream'],
        'xls' => ['application/vnd.ms-excel', 'application/octet-stream'],
        'xlsx' => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip', 'application/octet-stream'],
    ];

    if ($mime && !in_array($mime, $allowedMimes[$extension] ?? [], true)) {
        throw new RuntimeException('파일 MIME 형식이 허용되지 않습니다.', 400);
    }

    if ($kind === 'image' && (!str_starts_with((string) $mime, 'image/'))) {
        throw new RuntimeException('이미지 파일만 업로드할 수 있습니다.', 400);
    }
}

function create_image_derivatives(string $sourcePath, string $directory, string $safeBase): void
{
    if (!function_exists('imagecreatefromstring') || !function_exists('imagewebp')) {
        return;
    }

    $binary = file_get_contents($sourcePath);
    if ($binary === false) {
        return;
    }

    $image = @imagecreatefromstring($binary);
    if (!$image) {
        return;
    }

    $webpPath = $directory . '/' . $safeBase . '-' . date('YmdHis') . '-webp.webp';
    @imagewebp($image, $webpPath, 82);

    $width = imagesx($image);
    $height = imagesy($image);
    $targetWidth = 640;
    if ($width > $targetWidth && function_exists('imagescale')) {
        $thumb = imagescale($image, $targetWidth);
        if ($thumb) {
            $thumbPath = $directory . '/' . $safeBase . '-' . date('YmdHis') . '-thumb.webp';
            @imagewebp($thumb, $thumbPath, 78);
            imagedestroy($thumb);
        }
    }

    imagedestroy($image);
}

function assert_post_table(string $table): void
{
    if (!in_array($table, POST_TABLES, true)) {
        throw new InvalidArgumentException('알 수 없는 게시판입니다.');
    }
}

function normalize_date_for_db(string $value): ?string
{
    $time = strtotime(str_replace('.', '-', trim($value)));

    return $time ? date('Y-m-d', $time) : null;
}

function normalize_datetime_for_db(string $value): string
{
    $time = strtotime(str_replace('.', '-', trim($value)));

    return $time ? date('Y-m-d H:i:s', $time) : date('Y-m-d H:i:s');
}

function date_to_text(?string $value): string
{
    if (!$value) {
        return '';
    }

    $time = strtotime($value);

    return $time ? date('Y.m.d', $time) : (string) $value;
}

function datetime_to_iso(?string $value): string
{
    if (!$value) {
        return '';
    }

    $time = strtotime($value);

    return $time ? date('c', $time) : (string) $value;
}

function post_timestamp(array $post): int
{
    $time = strtotime(str_replace('.', '-', (string) ($post['date'] ?? '')));
    if ($time) {
        return $time;
    }

    $time = strtotime((string) ($post['createdAt'] ?? ''));

    return $time ?: 0;
}

function create_post_id(string $table, int $index): string
{
    return rtrim($table, 's') . '-' . time() . '-' . ($index + 1);
}
