package br.com.stockflow.dto.response;

import br.com.stockflow.domain.entity.Fornecedor;

public record FornecedorResponse(Long id, String nome, String cnpj, String telefone, String email) {

    public static FornecedorResponse de(Fornecedor fornecedor) {
        return new FornecedorResponse(fornecedor.getId(), fornecedor.getNome(), fornecedor.getCnpj(),
                fornecedor.getTelefone(), fornecedor.getEmail());
    }
}
