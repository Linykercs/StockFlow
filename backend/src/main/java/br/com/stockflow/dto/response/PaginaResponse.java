package br.com.stockflow.dto.response;

import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

// Formato das listas paginadas do docs/api.md (?pagina=0&tamanho=20)
public record PaginaResponse<T>(List<T> itens, int pagina, int tamanho, long totalItens, int totalPaginas) {

    public static <E, T> PaginaResponse<T> de(Page<E> pagina, Function<E, T> conversor) {
        return new PaginaResponse<>(
                pagina.getContent().stream().map(conversor).toList(),
                pagina.getNumber(),
                pagina.getSize(),
                pagina.getTotalElements(),
                pagina.getTotalPages());
    }
}
