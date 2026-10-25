package br.com.stockflow.exception;

// Regra de negócio quebrada ou dado inválido. Volta 400.
public class RegraNegocioException extends RuntimeException {

    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
