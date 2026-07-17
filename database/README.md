# Database

## Import 순서

1. `schema.sql`
2. `seed.sql`

기존 DB에 인증 기능만 보강할 때는 `migration_admin_auth.sql`을 추가 실행합니다.
회원가입/로그인 기능을 추가하는 기존 DB에는 `migration_members.sql`도 추가 실행합니다.

## 주요 테이블

- `users`: 관리자 계정
- `members`: 일반 회원 가입 신청, 승인 상태, 로그인 정보
- `notices`: 공지사항
- `activities`: 활동
- `resources`: 자료실
- `contacts`: 문의 정보
- `settings`: 사이트 설정, 홈 문구, 조합소개
- `admin_logs`: 로그인, 저장, 삭제 등 관리자 로그

관리자 비밀번호는 반드시 PHP `password_hash()`로 생성한 값을 `users.password_hash`에 저장합니다.

## 최초 관리자

`seed.sql`에는 최초 최고관리자 계정이 포함되어 있습니다.

- 이메일: `admin@example.com`
- 비밀번호: `admin1234`

`force_password_change`가 `1`로 저장되므로 첫 로그인 후 비밀번호 변경이 필요합니다.

## 인증 관련 컬럼

- `remember_token`, `remember_expires_at`: 로그인 상태 유지 쿠키 검증용 해시와 만료 시각
- `failed_login_count`, `locked_until`: 로그인 실패 5회 후 10분 잠금
- `last_login_at`, `last_login`: 마지막 로그인 시각
- `profile`: 관리자 프로필/메모
