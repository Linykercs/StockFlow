package br.com.stockflow.exception;

import java.time.LocalDateTime;
import java.util.List;

public record ErroResposta(
        LocalDateTime timestamp,
        int status,
        String mensagem,
        List<String> detalhes
) {
    public static ErroResposta de(int status, String mensagem) {
        return new ErroResposta(LocalDateTime.now(), status, mensagem, List.of());
    }

    public static ErroResposta de(int status, String mensagem, List<String> detalhes) {
        return new ErroResposta(LocalDateTime.now(), status, mensagem, detalhes);
    }
}
