package br.com.stockflow.exception;

// Registro que não existe ou está inativo. Volta 404.
public class NaoEncontradoException extends RuntimeException {

    public NaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
