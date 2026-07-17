# Cafe24 설치 안내

이 프로젝트는 외부 정적 호스팅 의존 없이 Cafe24 + PHP 8.x + MySQL/MariaDB로 동작합니다.

## 1. 업로드할 파일

Cafe24 웹 루트에 아래 항목을 그대로 업로드합니다.

```text
index.php
notice.php
activity.php
resource.php
about.php
contact.php
post.php
admin/
api/
assets/
config/
includes/
uploads/
database/
install/
.htaccess
robots.txt
sitemap.xml
```

`uploads/images`, `uploads/files`는 관리자 업로드 저장소입니다. Cafe24 FTP 또는 파일매니저에서 쓰기 권한을 허용해 주세요.

## 2. DB Import

SSH나 mysql 명령어를 쓰지 않는 경우에는 브라우저에서 아래 주소로 접속해 설치할 수 있습니다.

```text
https://도메인/install/index.php
```

웹 설치 화면에서 DB Host, DB Name, DB User, DB Password와 최초 관리자 계정을 입력하면 `schema.sql`, `seed.sql`, 필요한 경우 `migration_admin_auth.sql`을 자동 실행합니다.

수동으로 phpMyAdmin을 사용할 경우에는 다음 순서로 실행합니다.

1. `database/schema.sql`
2. `database/seed.sql`

`schema.sql`은 테이블 생성, `seed.sql`은 샘플 공지/활동/자료/문의/설정 데이터입니다.

이미 이전 버전의 Cafe24 DB를 만든 상태라면 `database/migration_admin_auth.sql`을 추가로 실행해 `users` 테이블에 로그인 유지, 잠금, 강제 비밀번호 변경 컬럼을 추가합니다. 회원가입/로그인 기능을 기존 DB에 추가할 때는 `database/migration_members.sql`도 함께 실행합니다.

## 3. config.php 설정

웹 설치 페이지를 사용했다면 이 단계는 자동 처리됩니다. 수동 설치라면 `config/config.php`의 DB 값을 Cafe24 DB 정보로 수정합니다.

```php
'host' => 'localhost',
'name' => 'DB명',
'user' => 'DB아이디',
'password' => 'DB비밀번호',
```

최초 관리자 계정도 같은 파일에서 수정합니다.

```php
'bootstrap_admin' => [
    'email' => 'admin@example.com',
    'password' => 'admin1234',
    'name' => '최고관리자',
],
```

`users` 테이블이 비어 있을 때 첫 로그인 시 위 계정이 자동 생성됩니다.

## 4. 관리자 접속

- 사이트: `https://도메인/`
- 회원가입: `https://도메인/signup.php`
- 회원 로그인: `https://도메인/login.php`
- 관리자 로그인: `https://도메인/admin/login.php`
- 관리자 대시보드: `https://도메인/admin/dashboard.php`

웹 설치를 완료했다면 보안을 위해 FTP 또는 Cafe24 파일매니저에서 `/install` 폴더 전체를 삭제하세요.

## 5. 관리자 추가

1. `/admin/login.php`에서 최초 관리자 계정으로 로그인합니다.
2. 웹 설치에서 만든 계정은 설치 화면에 입력한 비밀번호로 바로 로그인합니다.
3. 수동 seed 기본 계정(`admin@example.com / admin1234`)으로 로그인한 경우에는 먼저 비밀번호를 변경합니다.
4. 좌측 하단 `관리자 계정` 메뉴에서 새 관리자 이메일, 이름, 임시 비밀번호를 입력해 추가합니다.
5. 추가된 관리자는 첫 로그인 후 비밀번호 변경이 요구됩니다.

최고관리자 계정은 삭제할 수 없으며, 일반 관리자 계정은 관리자 화면에서 비활성화 방식으로 삭제됩니다.

## 6. 회원 승인

1. 방문자가 `/signup.php`에서 회원가입을 신청합니다.
2. 관리자는 `/admin/dashboard.php#members`의 `회원 관리`에서 신청자를 확인합니다.
3. 상태를 `승인 완료`로 바꾸면 해당 회원이 `/login.php`에서 로그인할 수 있습니다.
4. 승인 전 계정은 로그인할 수 없고, 로그인 화면에 승인 대기 안내가 표시됩니다.

## 7. 보안 설정

- 관리자 비밀번호는 PHP `password_hash()` 결과로만 저장됩니다.
- 회원 비밀번호도 PHP `password_hash()` 결과로만 저장됩니다.
- 로그인 실패가 5회 누적되면 해당 계정은 10분 동안 잠깁니다.
- 관리자 저장/삭제 요청은 CSRF 토큰과 PHP Session으로 보호됩니다.
- `config/`, `includes/`, `database/` 폴더에는 `.htaccess`가 포함되어 직접 접근을 차단합니다.

## 8. 이전 방법

다른 Cafe24 계정으로 옮길 때는 아래를 함께 옮깁니다.

1. 전체 파일
2. MySQL DB 백업 SQL
3. `uploads/` 폴더
4. 새 계정의 DB 정보로 수정한 `config/config.php`

## 9. 백업

- DB: Cafe24 phpMyAdmin에서 전체 export
- 파일: FTP로 전체 다운로드
- 업로드 파일: `uploads/` 폴더 별도 보관

## 10. 복원

1. Cafe24 웹 루트에 파일 업로드
2. phpMyAdmin에서 백업 SQL import
3. `uploads/` 폴더 업로드
4. `config/config.php` DB 정보 확인
5. `/admin/login.php` 접속 테스트

## 11. GitHub 자동 배포

GitHub Actions로 `main` 브랜치에 push할 때마다 Cafe24 FTP에 자동 업로드할 수 있습니다.

1. GitHub 저장소 `Settings` → `Secrets and variables` → `Actions`로 이동합니다.
2. 아래 Secrets를 추가합니다.
   - `CAFE24_FTP_HOST`: Cafe24 FTP 서버 주소
   - `CAFE24_FTP_USERNAME`: Cafe24 FTP 아이디
   - `CAFE24_FTP_PASSWORD`: Cafe24 FTP 비밀번호
   - `CAFE24_SERVER_DIR`: 보통 `/www/`
3. 이후 `main` 브랜치에 push하면 `.github/workflows/deploy-cafe24.yml`이 자동 업로드합니다.

실제 DB 비밀번호 파일인 `config/config.php`, `config/database.php`와 운영 중 생성되는 `uploads/` 파일은 배포에서 제외됩니다. DB 마이그레이션 SQL은 자동 실행되지 않으므로, 새 테이블이 필요한 변경은 phpMyAdmin에서 직접 실행해야 합니다.
