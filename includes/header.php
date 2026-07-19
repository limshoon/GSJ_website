<?php
declare(strict_types=1);

require_once __DIR__ . '/functions.php';

function render_document_head(string $title, string $description = ''): void
{
    $description = $description ?: '과수정 교원노동조합 공식 홈페이지';
    ?>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="<?= e($description) ?>" />
    <meta name="robots" content="index, follow" />
    <meta name="theme-color" content="#1346FF" />
    <title><?= e($title) ?></title>
    <link rel="icon" href="/assets/images/gsj-thumbnail.png" />
    <link rel="apple-touch-icon" href="/assets/images/gsj-thumbnail.png" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
    <link rel="stylesheet" href="/assets/css/style.css?v=20260717-mobileui2" />
    <?php
}
