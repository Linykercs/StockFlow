package br.com.stockflow.dto.response;

/**
 * Resposta do POST /auth/login: a senha já foi conferida, falta o código do autenticador.
 * status = CONFIGURAR_MFA na primeira vez (otpauthUri presente, pro front gerar o QR Code de configuração)
 * status = INFORMAR_CODIGO nas vezes seguintes (otpauthUri null, só pede o código de 6 dígitos)
 */
public record LoginDesafioResponse(String status, String loginToken, String otpauthUri) {

    public static LoginDesafioResponse configurarMfa(String loginToken, String otpauthUri) {
        return new LoginDesafioResponse("CONFIGURAR_MFA", loginToken, otpauthUri);
    }

    public static LoginDesafioResponse informarCodigo(String loginToken) {
        return new LoginDesafioResponse("INFORMAR_CODIGO", loginToken, null);
    }
}
