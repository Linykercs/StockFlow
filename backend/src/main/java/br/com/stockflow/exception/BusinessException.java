package br.com.stockflow.exception;

/** Violacao de uma regra de negocio (ex: RN01 - saida maior que o estoque disponivel). */
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
