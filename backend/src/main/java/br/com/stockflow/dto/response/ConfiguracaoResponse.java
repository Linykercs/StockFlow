package br.com.stockflow.dto.response;

import br.com.stockflow.domain.entity.Configuracao;

public record ConfiguracaoResponse(String chave, String valor, String descricao) {

    public static ConfiguracaoResponse de(Configuracao configuracao) {
        return new ConfiguracaoResponse(configuracao.getChave(), configuracao.getValor(), configuracao.getDescricao());
    }
}
