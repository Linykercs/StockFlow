package br.com.stockflow.security;

import org.apache.commons.codec.binary.Base32;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;

/**
 * TOTP (RFC 6238): o mesmo algoritmo do Google Authenticator, Microsoft Authenticator etc.
 * Gera um código de 6 dígitos que muda a cada 30 segundos, a partir de um segredo e do horário atual.
 */
@Service
public class TotpService {

    private static final String ALGORITMO_HMAC = "HmacSHA1";
    private static final int PASSO_SEGUNDOS = 30;
    private static final int DIGITOS = 6;
    // tolera 1 passo de 30s pra trás ou pra frente, pro caso do relógio do celular estar levemente adiantado/atrasado
    private static final int TOLERANCIA_PASSOS = 1;

    public String gerarSegredo() {
        byte[] aleatorio = new byte[20];
        new SecureRandom().nextBytes(aleatorio);
        return new Base32().encodeToString(aleatorio).replace("=", "");
    }

    /** URI padrão otpauth://, que o app autenticador lê a partir do QR Code. */
    public String gerarUriOtpAuth(String segredo, String email) {
        String rotulo = URLEncoder.encode("StockFlow:" + email, StandardCharsets.UTF_8);
        String emissor = URLEncoder.encode("StockFlow", StandardCharsets.UTF_8);
        return "otpauth://totp/" + rotulo + "?secret=" + segredo + "&issuer=" + emissor
                + "&digits=" + DIGITOS + "&period=" + PASSO_SEGUNDOS;
    }

    public boolean codigoValido(String segredo, String codigo) {
        if (codigo == null || !codigo.matches("\\d{" + DIGITOS + "}")) return false;
        long passoAtual = System.currentTimeMillis() / 1000 / PASSO_SEGUNDOS;
        for (long passo = passoAtual - TOLERANCIA_PASSOS; passo <= passoAtual + TOLERANCIA_PASSOS; passo++) {
            if (codigo.equals(gerarCodigo(segredo, passo))) return true;
        }
        return false;
    }

    private String gerarCodigo(String segredo, long passo) {
        try {
            byte[] chave = new Base32().decode(segredo);
            byte[] dadosDoPasso = java.nio.ByteBuffer.allocate(8).putLong(passo).array();

            Mac mac = Mac.getInstance(ALGORITMO_HMAC);
            mac.init(new SecretKeySpec(chave, ALGORITMO_HMAC));
            byte[] hash = mac.doFinal(dadosDoPasso);

            int offset = hash[hash.length - 1] & 0x0F;
            int binario = ((hash[offset] & 0x7F) << 24)
                    | ((hash[offset + 1] & 0xFF) << 16)
                    | ((hash[offset + 2] & 0xFF) << 8)
                    | (hash[offset + 3] & 0xFF);

            int codigo = binario % (int) Math.pow(10, DIGITOS);
            return String.format("%0" + DIGITOS + "d", codigo);
        } catch (Exception e) {
            throw new IllegalStateException("Não foi possível gerar o código TOTP", e);
        }
    }
}
