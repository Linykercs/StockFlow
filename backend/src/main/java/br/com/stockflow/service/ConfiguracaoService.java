package br.com.stockflow.service;

import br.com.stockflow.dto.request.ConfiguracaoRequest;
import br.com.stockflow.dto.response.ConfiguracaoResponse;
import br.com.stockflow.exception.NaoEncontradoException;
import br.com.stockflow.exception.RegraNegocioException;
import br.com.stockflow.repository.ConfiguracaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ConfiguracaoService {

    public static final String DIAS_ALERTA_VENCIMENTO = "dias_alerta_vencimento";

    private final ConfiguracaoRepository configuracaoRepository;

    public ConfiguracaoService(ConfiguracaoRepository configuracaoRepository) {
        this.configuracaoRepository = configuracaoRepository;
    }

    @Transactional(readOnly = true)
    public List<ConfiguracaoResponse> listar() {
        return configuracaoRepository.findAll().stream().map(ConfiguracaoResponse::de).toList();
    }

    @Transactional
    public ConfiguracaoResponse alterar(String chave, ConfiguracaoRequest dados) {
        var configuracao = configuracaoRepository.findById(chave)
                .orElseThrow(() -> new NaoEncontradoException("Configuração " + chave + " não existe."));
        String valor = dados.valor().trim();

        if (DIAS_ALERTA_VENCIMENTO.equals(chave)) {
            validarDias(valor);
        }
        configuracao.setValor(valor);
        return ConfiguracaoResponse.de(configuracao);
    }

    // RF05: prazo em dias para um lote entrar no alerta de "vencendo". Usado também pelo Cauã nos alertas.
    @Transactional(readOnly = true)
    public int diasAlertaVencimento() {
        return configuracaoRepository.findById(DIAS_ALERTA_VENCIMENTO)
                .map(c -> Integer.parseInt(c.getValor()))
                .orElse(7);
    }

    private void validarDias(String valor) {
        try {
            int dias = Integer.parseInt(valor);
            if (dias < 0 || dias > 365) {
                throw new RegraNegocioException("O prazo de alerta precisa ficar entre 0 e 365 dias.");
            }
        } catch (NumberFormatException e) {
            throw new RegraNegocioException("O prazo de alerta precisa ser um número inteiro de dias.");
        }
    }
}
