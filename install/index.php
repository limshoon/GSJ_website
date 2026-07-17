<?php

declare(strict_types=1);

session_name('smitu_install_session');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

const ROOT_PATH = __DIR__ . '/..';
const LOCK_FILE = __DIR__ . '/install.lock';

$isLocked = is_file(LOCK_FILE);
$steps = [];
$form = [
    'db_host' => 'localhost',
    'db_name' => '',
    'db_user' => '',
    'admin_email' => '',
    'admin_name' => '최고관리자',
];
$installComplete = false;

if (empty($_SESSION['install_csrf'])) {
    $_SESSION['install_csrf'] = bin2hex(random_bytes(32));
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST' && !$isLocked) {
    try {
        verify_csrf();
        $form = read_install_form();
        validate_install_form($form);

        $pdo = run_install_step($steps, 'DB 연결', function () use ($form): PDO {
            return connect_database($form);
        }, 'Cafe24 MariaDB 연결에 성공했습니다.');

        run_install_step($steps, '설정 파일 저장', function () use ($form): void {
            write_database_config($form);
        }, 'config/config.php와 config/database.php에 DB 정보를 저장했습니다.');

        run_install_step($steps, 'schema.sql 실행', function () use ($pdo): int {
            return execute_sql_file($pdo, ROOT_PATH . '/database/schema.sql');
        }, '기본 테이블을 준비했습니다.');

        run_install_step($steps, 'seed.sql 실행', function () use ($pdo): int {
            return execute_sql_file($pdo, ROOT_PATH . '/database/seed.sql');
        }, '초기 콘텐츠와 기본 설정을 입력했습니다.');

        run_install_step($steps, '관리자 인증 마이그레이션 확인', function () use ($pdo, $form): string {
            if (!admin_auth_migration_needed($pdo, $form['db_name'])) {
                return '이미 최신 users 테이블 구조입니다. migration_admin_auth.sql 실행을 건너뜁니다.';
            }

            $count = execute_sql_file($pdo, ROOT_PATH . '/database/migration_admin_auth.sql');
            return sprintf('누락된 인증 컬럼을 보강했습니다. 실행된 SQL: %d개', $count);
        });

        run_install_step($steps, '관리자 계정 저장', function () use ($pdo, $form): void {
            save_installer_admin($pdo, $form);
        }, '입력한 관리자 계정을 password_hash()로 저장했습니다.');

        run_install_step($steps, 'install.lock 생성', function (): void {
            $lockBody = 'installed_at=' . date('c') . PHP_EOL;
            if (file_put_contents(LOCK_FILE, $lockBody, LOCK_EX) === false) {
                throw new RuntimeException('install.lock 파일을 생성하지 못했습니다. install 폴더 쓰기 권한을 확인해 주세요.');
            }
        }, '설치 잠금 파일을 생성했습니다.');

        $installComplete = true;
        $isLocked = true;
        $_SESSION['install_csrf'] = bin2hex(random_bytes(32));
    } catch (Throwable $error) {
        $steps[] = [
            'label' => '설치 중단',
            'status' => 'error',
            'message' => $error->getMessage(),
        ];
    }
}

function verify_csrf(): void
{
    $token = (string) ($_POST['_csrf'] ?? '');
    if ($token === '' || !hash_equals((string) ($_SESSION['install_csrf'] ?? ''), $token)) {
        throw new RuntimeException('보안 토큰이 올바르지 않습니다. 새로고침 후 다시 시도해 주세요.');
    }
}

function read_install_form(): array
{
    return [
        'db_host' => trim((string) ($_POST['db_host'] ?? 'localhost')),
        'db_name' => trim((string) ($_POST['db_name'] ?? '')),
        'db_user' => trim((string) ($_POST['db_user'] ?? '')),
        'db_password' => (string) ($_POST['db_password'] ?? ''),
        'admin_email' => strtolower(trim((string) ($_POST['admin_email'] ?? ''))),
        'admin_name' => trim((string) ($_POST['admin_name'] ?? '최고관리자')),
        'admin_password' => (string) ($_POST['admin_password'] ?? ''),
        'admin_password_confirm' => (string) ($_POST['admin_password_confirm'] ?? ''),
    ];
}

function validate_install_form(array $form): void
{
    foreach (['db_host' => 'DB Host', 'db_name' => 'DB Name', 'db_user' => 'DB User'] as $key => $label) {
        if ($form[$key] === '') {
            throw new RuntimeException($label . ' 값을 입력해 주세요.');
        }
    }

    if (!filter_var($form['admin_email'], FILTER_VALIDATE_EMAIL)) {
        throw new RuntimeException('관리자 이메일 형식이 올바르지 않습니다.');
    }

    if ($form['admin_name'] === '') {
        throw new RuntimeException('관리자 이름을 입력해 주세요.');
    }

    if (strlen($form['admin_password']) < 8) {
        throw new RuntimeException('관리자 비밀번호는 8자 이상 입력해 주세요.');
    }

    if ($form['admin_password'] !== $form['admin_password_confirm']) {
        throw new RuntimeException('관리자 비밀번호 확인이 일치하지 않습니다.');
    }
}

function connect_database(array $form): PDO
{
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=utf8mb4',
        $form['db_host'],
        $form['db_name']
    );

    try {
        return new PDO($dsn, $form['db_user'], $form['db_password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $error) {
        throw new RuntimeException('DB 연결 실패: ' . $error->getMessage());
    }
}

function run_install_step(array &$steps, string $label, callable $callback, string $defaultMessage = ''): mixed
{
    try {
        $result = $callback();
        $message = is_string($result) && $result !== ''
            ? $result
            : ($defaultMessage !== '' ? $defaultMessage : '완료');
        $steps[] = [
            'label' => $label,
            'status' => 'success',
            'message' => $message,
        ];

        return $result;
    } catch (Throwable $error) {
        $steps[] = [
            'label' => $label,
            'status' => 'error',
            'message' => $error->getMessage(),
        ];
        throw $error;
    }
}

function execute_sql_file(PDO $pdo, string $path): int
{
    if (!is_readable($path)) {
        throw new RuntimeException(basename($path) . ' 파일을 읽을 수 없습니다.');
    }

    $sql = file_get_contents($path);
    if ($sql === false) {
        throw new RuntimeException(basename($path) . ' 파일 읽기에 실패했습니다.');
    }

    $sql = preg_replace('/^\xEF\xBB\xBF/', '', $sql) ?? $sql;
    $statements = split_sql_statements($sql);
    $count = 0;

    foreach ($statements as $statement) {
        $statement = trim($statement);
        if ($statement === '') {
            continue;
        }
        $pdo->exec($statement);
        $count++;
    }

    return $count;
}

function split_sql_statements(string $sql): array
{
    $statements = [];
    $buffer = '';
    $quote = null;
    $lineComment = false;
    $blockComment = false;
    $length = strlen($sql);

    for ($i = 0; $i < $length; $i++) {
        $char = $sql[$i];
        $next = $i + 1 < $length ? $sql[$i + 1] : '';

        if ($lineComment) {
            $buffer .= $char;
            if ($char === "\n") {
                $lineComment = false;
            }
            continue;
        }

        if ($blockComment) {
            $buffer .= $char;
            if ($char === '*' && $next === '/') {
                $buffer .= $next;
                $i++;
                $blockComment = false;
            }
            continue;
        }

        if ($quote !== null) {
            $buffer .= $char;
            if ($char === '\\' && $quote !== '`' && $next !== '') {
                $buffer .= $next;
                $i++;
                continue;
            }
            if ($char === $quote) {
                $quote = null;
            }
            continue;
        }

        if ($char === '-' && $next === '-' && ($i + 2 >= $length || ctype_space($sql[$i + 2]))) {
            $buffer .= $char . $next;
            $i++;
            $lineComment = true;
            continue;
        }

        if ($char === '#') {
            $buffer .= $char;
            $lineComment = true;
            continue;
        }

        if ($char === '/' && $next === '*') {
            $buffer .= $char . $next;
            $i++;
            $blockComment = true;
            continue;
        }

        if ($char === '\'' || $char === '"' || $char === '`') {
            $quote = $char;
            $buffer .= $char;
            continue;
        }

        if ($char === ';') {
            $statements[] = $buffer;
            $buffer = '';
            continue;
        }

        $buffer .= $char;
    }

    if (trim($buffer) !== '') {
        $statements[] = $buffer;
    }

    return $statements;
}

function admin_auth_migration_needed(PDO $pdo, string $dbName): bool
{
    $requiredColumns = [
        'profile',
        'last_login',
        'remember_token',
        'remember_expires_at',
        'force_password_change',
        'failed_login_count',
        'locked_until',
    ];
    $stmt = $pdo->prepare(
        'SELECT COLUMN_NAME
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = :schema_name AND TABLE_NAME = \'users\''
    );
    $stmt->execute([':schema_name' => $dbName]);
    $columns = array_map('strtolower', array_column($stmt->fetchAll(), 'COLUMN_NAME'));

    foreach ($requiredColumns as $column) {
        if (!in_array($column, $columns, true)) {
            return true;
        }
    }

    $requiredIndexes = ['users_role_idx', 'users_remember_idx', 'users_locked_idx'];
    $indexStmt = $pdo->prepare(
        'SELECT INDEX_NAME
         FROM information_schema.STATISTICS
         WHERE TABLE_SCHEMA = :schema_name AND TABLE_NAME = \'users\''
    );
    $indexStmt->execute([':schema_name' => $dbName]);
    $indexes = array_map('strtolower', array_column($indexStmt->fetchAll(), 'INDEX_NAME'));

    foreach ($requiredIndexes as $index) {
        if (!in_array(strtolower($index), $indexes, true)) {
            return true;
        }
    }

    return false;
}

function save_installer_admin(PDO $pdo, array $form): void
{
    $hash = password_hash($form['admin_password'], PASSWORD_DEFAULT);
    $pdo->beginTransaction();

    try {
        $emailStmt = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
        $emailStmt->execute([':email' => $form['admin_email']]);
        $targetId = (int) ($emailStmt->fetchColumn() ?: 0);

        if ($targetId <= 0) {
            $ownerStmt = $pdo->query("SELECT id FROM users WHERE role = 'owner' ORDER BY id ASC LIMIT 1");
            $targetId = (int) ($ownerStmt->fetchColumn() ?: 0);
        }

        if ($targetId > 0) {
            $stmt = $pdo->prepare(
                'UPDATE users
                 SET email = :email,
                     name = :name,
                     password_hash = :password_hash,
                     role = \'owner\',
                     is_active = 1,
                     force_password_change = 0,
                     failed_login_count = 0,
                     locked_until = NULL,
                     remember_token = NULL,
                     remember_expires_at = NULL,
                     updated_at = NOW()
                 WHERE id = :id'
            );
            $stmt->execute([
                ':email' => $form['admin_email'],
                ':name' => $form['admin_name'],
                ':password_hash' => $hash,
                ':id' => $targetId,
            ]);
        } else {
            $stmt = $pdo->prepare(
                'INSERT INTO users
                  (email, name, password_hash, role, is_active, force_password_change, failed_login_count, created_at, updated_at)
                 VALUES
                  (:email, :name, :password_hash, \'owner\', 1, 0, 0, NOW(), NOW())'
            );
            $stmt->execute([
                ':email' => $form['admin_email'],
                ':name' => $form['admin_name'],
                ':password_hash' => $hash,
            ]);
        }

        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $error;
    }
}

function write_database_config(array $form): void
{
    $configDir = ROOT_PATH . '/config';
    if (!is_dir($configDir)) {
        throw new RuntimeException('config 폴더를 찾을 수 없습니다.');
    }

    $appConfig = [
        'db' => [
            'host' => $form['db_host'],
            'name' => $form['db_name'],
            'user' => $form['db_user'],
            'password' => $form['db_password'],
            'charset' => 'utf8mb4',
        ],
        'session' => [
            'name' => 'smitu_admin_session',
            'lifetime' => 28800,
            'timeout' => 28800,
        ],
        'uploads' => [
            'directory' => "__DIR__ . '/../uploads'",
            'url' => '/uploads',
            'max_size' => 10485760,
        ],
        'bootstrap_admin' => [
            'email' => $form['admin_email'],
            'password' => '',
            'name' => $form['admin_name'],
        ],
    ];

    write_config_php($configDir . '/config.php', render_app_config($appConfig));

    $dbConfig = [
        'host' => $form['db_host'],
        'dbname' => $form['db_name'],
        'username' => $form['db_user'],
        'password' => $form['db_password'],
        'charset' => 'utf8mb4',
    ];
    write_config_php($configDir . '/database.php', "<?php\n\nreturn " . var_export($dbConfig, true) . ";\n");
}

function render_app_config(array $config): string
{
    $db = var_export($config['db'], true);
    $session = var_export($config['session'], true);
    $bootstrap = var_export($config['bootstrap_admin'], true);
    $url = var_export($config['uploads']['url'], true);
    $maxSize = (int) $config['uploads']['max_size'];

    return <<<PHP
<?php

return [
    'db' => {$db},

    'session' => {$session},

    'uploads' => [
        'directory' => __DIR__ . '/../uploads',
        'url' => {$url},
        'max_size' => {$maxSize},
    ],

    'bootstrap_admin' => {$bootstrap},
];
PHP;
}

function write_config_php(string $path, string $contents): void
{
    $tmp = $path . '.tmp';
    if (file_put_contents($tmp, $contents, LOCK_EX) === false) {
        throw new RuntimeException(basename($path) . ' 파일을 저장하지 못했습니다. config 폴더 쓰기 권한을 확인해 주세요.');
    }
    if (!rename($tmp, $path)) {
        @unlink($tmp);
        throw new RuntimeException(basename($path) . ' 파일 교체에 실패했습니다.');
    }
    @chmod($path, 0640);
}

function h(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

?>
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>SMITU CMS 설치</title>
    <style>
      :root {
        --primary: #1346ff;
        --text: #090c14;
        --muted: #6b7280;
        --border: rgba(20, 40, 80, 0.1);
        --panel: rgba(255, 255, 255, 0.9);
        --bg: #ffffff;
        --success: #067647;
        --error: #b42318;
      }

      * {
        box-sizing: border-box;
      }

      body {
        min-width: 320px;
        margin: 0;
        color: var(--text);
        background:
          radial-gradient(circle at 74% 82%, rgba(147, 197, 253, 0.34), transparent 32%),
          linear-gradient(90deg, rgba(19, 70, 255, 0.045) 0 1px, transparent 1px 100%),
          var(--bg);
        background-size: auto, 160px 100%, auto;
        font-family: Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        letter-spacing: 0;
        word-break: keep-all;
      }

      main {
        display: grid;
        width: min(100%, 1120px);
        min-height: 100vh;
        margin: 0 auto;
        padding: 64px 24px;
        align-content: center;
        gap: 28px;
      }

      .hero,
      .panel,
      .locked {
        border: 1px solid var(--border);
        border-radius: 28px;
        background: var(--panel);
        box-shadow: 0 20px 58px rgba(59, 130, 246, 0.08);
        backdrop-filter: blur(18px);
      }

      .hero {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 24px;
        padding: 34px;
      }

      .eyebrow {
        margin: 0 0 10px;
        color: var(--primary);
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      h1,
      h2,
      p {
        margin-top: 0;
      }

      h1 {
        margin-bottom: 12px;
        font-size: clamp(34px, 6vw, 64px);
        line-height: 0.95;
      }

      .hero p:not(.eyebrow),
      .panel p,
      .locked p {
        color: var(--muted);
        font-weight: 750;
        line-height: 1.7;
      }

      .install-mark {
        display: grid;
        width: 72px;
        height: 72px;
        border-radius: 24px;
        background: linear-gradient(135deg, rgba(224, 242, 254, 0.98), rgba(96, 165, 250, 0.84));
        box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.9), 0 16px 36px rgba(59, 130, 246, 0.24);
        color: #fff;
        font-size: 28px;
        font-weight: 900;
        place-items: center;
      }

      .panel,
      .locked {
        padding: 30px;
      }

      form {
        display: grid;
        gap: 26px;
      }

      fieldset {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
        margin: 0;
        padding: 0;
        border: 0;
      }

      legend {
        grid-column: 1 / -1;
        margin-bottom: 2px;
        font-size: 20px;
        font-weight: 900;
      }

      label {
        display: grid;
        gap: 8px;
        color: var(--text);
        font-size: 13px;
        font-weight: 850;
      }

      input {
        width: 100%;
        height: 48px;
        border: 1px solid rgba(59, 130, 246, 0.18);
        border-radius: 12px;
        background: #fff;
        color: var(--text);
        font: inherit;
        padding: 0 14px;
      }

      input:focus {
        border-color: rgba(19, 70, 255, 0.6);
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.13);
        outline: 0;
      }

      .wide {
        grid-column: 1 / -1;
      }

      button {
        width: fit-content;
        min-height: 48px;
        padding: 0 22px;
        border: 0;
        border-radius: 12px;
        background: var(--primary);
        color: #fff;
        font: inherit;
        font-weight: 900;
        cursor: pointer;
        box-shadow: 0 14px 28px rgba(19, 70, 255, 0.2);
      }

      .steps {
        display: grid;
        gap: 12px;
        padding: 0;
        margin: 0;
        list-style: none;
      }

      .step {
        display: grid;
        grid-template-columns: 112px minmax(0, 1fr);
        gap: 14px;
        padding: 16px;
        border: 1px solid var(--border);
        border-radius: 16px;
        background: #fff;
      }

      .badge {
        display: inline-grid;
        min-height: 30px;
        align-self: start;
        padding: 0 10px;
        border-radius: 999px;
        color: #fff;
        font-size: 12px;
        font-weight: 900;
        place-items: center;
      }

      .badge.success {
        background: var(--success);
      }

      .badge.error {
        background: var(--error);
      }

      .step strong {
        display: block;
        margin-bottom: 5px;
      }

      .step p {
        margin: 0;
        overflow-wrap: anywhere;
      }

      .notice {
        margin: 18px 0 0;
        padding: 16px;
        border: 1px solid rgba(19, 70, 255, 0.12);
        border-radius: 16px;
        background: rgba(19, 70, 255, 0.045);
        color: var(--muted);
        font-weight: 800;
        line-height: 1.7;
      }

      code {
        padding: 2px 6px;
        border-radius: 6px;
        background: rgba(19, 70, 255, 0.07);
        color: var(--primary);
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      }

      @media (max-width: 760px) {
        main {
          padding: 28px 16px;
        }

        .hero,
        fieldset {
          grid-template-columns: 1fr;
        }

        .wide {
          grid-column: auto;
        }

        button {
          width: 100%;
        }

        .step {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <div>
          <p class="eyebrow">SMITU CMS Installer</p>
          <h1>웹 설치</h1>
          <p>SSH와 mysql 명령어 없이 Cafe24 브라우저 환경에서 DB 설정, 테이블 생성, 초기 데이터 입력, 관리자 계정 생성을 진행합니다.</p>
        </div>
        <div class="install-mark" aria-hidden="true">S</div>
      </section>

      <?php if ($isLocked && !$installComplete): ?>
        <section class="locked">
          <p class="eyebrow">Locked</p>
          <h2>이미 설치가 완료되었습니다.</h2>
          <p><code>/install/install.lock</code> 파일이 있어 설치 페이지를 다시 실행할 수 없습니다. 보안을 위해 서버에서 <code>/install</code> 폴더 전체를 삭제해 주세요.</p>
        </section>
      <?php else: ?>
        <section class="panel">
          <?php if ($steps): ?>
            <h2>설치 결과</h2>
            <ul class="steps" aria-live="polite">
              <?php foreach ($steps as $step): ?>
                <li class="step">
                  <span class="badge <?= h($step['status']) ?>"><?= $step['status'] === 'success' ? '성공' : '오류' ?></span>
                  <div>
                    <strong><?= h($step['label']) ?></strong>
                    <p><?= h($step['message']) ?></p>
                  </div>
                </li>
              <?php endforeach; ?>
            </ul>
            <?php if ($installComplete): ?>
              <div class="notice">
                설치가 완료되었습니다. 이제 <code>/admin/login.php</code>로 접속해 입력한 관리자 계정으로 로그인하세요. 완료 후에는 반드시 FTP 또는 파일매니저에서 <code>/install</code> 폴더 전체를 삭제해 주세요.
              </div>
            <?php else: ?>
              <div class="notice">
                설치가 중단되었습니다. <code>install.lock</code>은 생성되지 않았으므로 값을 수정한 뒤 다시 실행할 수 있습니다. 이미 실행된 SQL은 재실행 가능하도록 구성되어 있습니다.
              </div>
            <?php endif; ?>
          <?php endif; ?>

          <?php if (!$installComplete): ?>
            <form method="post" autocomplete="off">
              <input type="hidden" name="_csrf" value="<?= h((string) $_SESSION['install_csrf']) ?>" />
              <fieldset>
                <legend>Database</legend>
                <label>
                  <span>DB Host</span>
                  <input name="db_host" value="<?= h($form['db_host']) ?>" required />
                </label>
                <label>
                  <span>DB Name</span>
                  <input name="db_name" value="<?= h($form['db_name']) ?>" required />
                </label>
                <label>
                  <span>DB User</span>
                  <input name="db_user" value="<?= h($form['db_user']) ?>" required />
                </label>
                <label>
                  <span>DB Password</span>
                  <input name="db_password" type="password" required />
                </label>
              </fieldset>

              <fieldset>
                <legend>Administrator</legend>
                <label>
                  <span>관리자 이메일 / 아이디</span>
                  <input name="admin_email" type="email" value="<?= h($form['admin_email']) ?>" required />
                </label>
                <label>
                  <span>관리자 이름</span>
                  <input name="admin_name" value="<?= h($form['admin_name']) ?>" required />
                </label>
                <label>
                  <span>관리자 비밀번호</span>
                  <input name="admin_password" type="password" minlength="8" required />
                </label>
                <label>
                  <span>비밀번호 확인</span>
                  <input name="admin_password_confirm" type="password" minlength="8" required />
                </label>
              </fieldset>

              <button type="submit">설치 시작</button>
            </form>
          <?php endif; ?>
        </section>
      <?php endif; ?>
    </main>
  </body>
</html>
