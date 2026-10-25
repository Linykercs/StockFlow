package br.com.stockflow.dto.response;

// Forma curta de mostrar um registro ligado a outro, por exemplo a categoria dentro do produto
public record ReferenciaResponse(Long id, String nome) {
}
