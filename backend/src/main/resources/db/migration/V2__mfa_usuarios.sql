-- Autenticação em duas etapas (TOTP) obrigatória pra todo usuário.
-- mfa_secret fica vazio até o primeiro login, quando o backend gera um novo segredo.
ALTER TABLE usuarios ADD COLUMN mfa_secret VARCHAR(64);
ALTER TABLE usuarios ADD COLUMN mfa_ativo BOOLEAN NOT NULL DEFAULT FALSE;
