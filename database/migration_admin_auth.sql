ALTER TABLE users
  ADD COLUMN IF NOT EXISTS profile TEXT NULL AFTER name,
  ADD COLUMN IF NOT EXISTS last_login DATETIME NULL AFTER last_login_at,
  ADD COLUMN IF NOT EXISTS remember_token VARCHAR(255) NULL AFTER last_login,
  ADD COLUMN IF NOT EXISTS remember_expires_at DATETIME NULL AFTER remember_token,
  ADD COLUMN IF NOT EXISTS force_password_change TINYINT(1) NOT NULL DEFAULT 0 AFTER remember_expires_at,
  ADD COLUMN IF NOT EXISTS failed_login_count INT UNSIGNED NOT NULL DEFAULT 0 AFTER force_password_change,
  ADD COLUMN IF NOT EXISTS locked_until DATETIME NULL AFTER failed_login_count;

CREATE INDEX IF NOT EXISTS users_role_idx ON users (role);
CREATE INDEX IF NOT EXISTS users_remember_idx ON users (remember_token);
CREATE INDEX IF NOT EXISTS users_locked_idx ON users (locked_until);
