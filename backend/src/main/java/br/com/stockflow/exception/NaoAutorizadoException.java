package br.com.stockflow.exception;

// Login inválido. Volta 401.
public class NaoAutorizadoException extends RuntimeException {

    public NaoAutorizadoException(String mensagem) {
        super(mensagem);
    }
}
