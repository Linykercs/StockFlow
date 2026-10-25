package br.com.stockflow.exception;

// Registro duplicado (e-mail, código, chave da nota). Volta 409.
public class ConflitoException extends RuntimeException {

    public ConflitoException(String mensagem) {
        super(mensagem);
    }
}
