package br.com.stockflow.exception;

import br.com.stockflow.dto.response.ErroResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

// Todo erro da API sai daqui no formato { "status": ..., "mensagem": ... } do docs/api.md
@RestControllerAdvice
public class TratadorDeErros {

    private static final Logger log = LoggerFactory.getLogger(TratadorDeErros.class);

    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<ErroResponse> regraNegocio(RegraNegocioException e) {
        return responder(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler(NaoEncontradoException.class)
    public ResponseEntity<ErroResponse> naoEncontrado(NaoEncontradoException e) {
        return responder(HttpStatus.NOT_FOUND, e.getMessage());
    }

    @ExceptionHandler(ConflitoException.class)
    public ResponseEntity<ErroResponse> conflito(ConflitoException e) {
        return responder(HttpStatus.CONFLICT, e.getMessage());
    }

    @ExceptionHandler(NaoAutorizadoException.class)
    public ResponseEntity<ErroResponse> naoAutorizado(NaoAutorizadoException e) {
        return responder(HttpStatus.UNAUTHORIZED, e.getMessage());
    }

    // erro das anotações @NotBlank, @Positive etc. dos DTOs
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResponse> validacao(MethodArgumentNotValidException e) {
        var campo = e.getBindingResult().getFieldErrors().getFirst();
        return responder(HttpStatus.BAD_REQUEST, campo.getField() + ": " + campo.getDefaultMessage());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErroResponse> corpoInvalido(HttpMessageNotReadableException e) {
        return responder(HttpStatus.BAD_REQUEST, "Corpo da requisição inválido. Confira o JSON e os valores dos campos.");
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErroResponse> parametroInvalido(MethodArgumentTypeMismatchException e) {
        return responder(HttpStatus.BAD_REQUEST, "Valor inválido para o parâmetro " + e.getName() + ".");
    }

    // @PreAuthorize negou o acesso pelo perfil (RN04, RN05)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErroResponse> acessoNegado(AccessDeniedException e) {
        return responder(HttpStatus.FORBIDDEN, "Seu perfil não tem permissão para esta ação.");
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErroResponse> integridade(DataIntegrityViolationException e) {
        log.warn("Banco recusou a gravação: {}", e.getMostSpecificCause().getMessage());
        return responder(HttpStatus.CONFLICT, "O banco recusou a gravação. Confira se o registro já existe ou se os valores são válidos.");
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErroResponse> rotaInexistente(NoResourceFoundException e) {
        return responder(HttpStatus.NOT_FOUND, "Rota não encontrada.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResponse> erroInesperado(Exception e) {
        log.error("Erro inesperado", e);
        return responder(HttpStatus.INTERNAL_SERVER_ERROR, "Erro inesperado no servidor.");
    }

    private ResponseEntity<ErroResponse> responder(HttpStatus status, String mensagem) {
        return ResponseEntity.status(status).body(new ErroResponse(status.value(), mensagem));
    }
}
