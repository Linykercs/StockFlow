package br.com.stockflow.service;

import br.com.stockflow.domain.entity.Recebimento;
import br.com.stockflow.domain.entity.RecebimentoItem;
import br.com.stockflow.domain.entity.Usuario;
import br.com.stockflow.domain.enums.MotivoMovimentacao;
import br.com.stockflow.domain.enums.StatusRecebimento;
import br.com.stockflow.domain.enums.UnidadeMedida;
import br.com.stockflow.dto.request.ConferenciaItemRequest;
import br.com.stockflow.dto.request.RecebimentoRequest;
import br.com.stockflow.dto.response.RecebimentoResponse;
import br.com.stockflow.exception.ConflitoException;
import br.com.stockflow.exception.NaoEncontradoException;
import br.com.stockflow.exception.RegraNegocioException;
import br.com.stockflow.repository.FornecedorRepository;
import br.com.stockflow.repository.ProdutoRepository;
import br.com.stockflow.repository.RecebimentoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// Recebimento de mercadoria pela nota (telas 11 a 14): lê a nota, confere item por item e conclui
@Service
public class RecebimentoService {

    private final RecebimentoRepository recebimentoRepository;
    private final ProdutoRepository produtoRepository;
    private final FornecedorRepository fornecedorRepository;
    private final MovimentacaoService movimentacaoService;

    public RecebimentoService(RecebimentoRepository recebimentoRepository, ProdutoRepository produtoRepository,
                              FornecedorRepository fornecedorRepository, MovimentacaoService movimentacaoService) {
        this.recebimentoRepository = recebimentoRepository;
        this.produtoRepository = produtoRepository;
        this.fornecedorRepository = fornecedorRepository;
        this.movimentacaoService = movimentacaoService;
    }

    @Transactional
    public RecebimentoResponse criar(RecebimentoRequest dados, Usuario usuario) {
        String chave = dados.chaveAcesso() == null || dados.chaveAcesso().isBlank() ? null : dados.chaveAcesso();
        if (chave != null && recebimentoRepository.existsByChaveAcesso(chave)) {
            throw new ConflitoException("A nota com essa chave de acesso já foi lançada.");
        }

        var recebimento = new Recebimento();
        recebimento.setUsuario(usuario);
        recebimento.setNumeroNota(dados.numeroNota().trim());
        recebimento.setSerieNota(dados.serieNota());
        recebimento.setChaveAcesso(chave);
        recebimento.setDataEmissao(dados.dataEmissao());
        if (dados.fornecedorId() != null) {
            recebimento.setFornecedor(fornecedorRepository.findById(dados.fornecedorId())
                    .orElseThrow(() -> new NaoEncontradoException("Fornecedor " + dados.fornecedorId() + " não encontrado.")));
        }

        for (RecebimentoRequest.Item itemNota : dados.itens()) {
            var item = new RecebimentoItem();
            item.setRecebimento(recebimento);
            item.setProduto(produtoRepository.buscarAtivo(itemNota.produtoId())
                    .orElseThrow(() -> new NaoEncontradoException("Produto " + itemNota.produtoId() + " não encontrado.")));
            item.setQuantidadeNota(itemNota.quantidadeNota());
            item.setValorUnitario(itemNota.valorUnitario());
            recebimento.getItens().add(item);
        }
        return RecebimentoResponse.de(recebimentoRepository.save(recebimento));
    }

    @Transactional(readOnly = true)
    public List<RecebimentoResponse> listar(StatusRecebimento status) {
        return recebimentoRepository.buscar(status).stream().map(RecebimentoResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public RecebimentoResponse buscar(Long id) {
        return RecebimentoResponse.de(buscarEntidade(id));
    }

    @Transactional(readOnly = true)
    public RecebimentoResponse buscarPorChave(String chave) {
        return recebimentoRepository.findByChaveAcesso(chave)
                .map(RecebimentoResponse::de)
                .orElseThrow(() -> new NaoEncontradoException("Nenhuma nota lançada com essa chave de acesso."));
    }

    @Transactional
    public RecebimentoResponse conferirItem(Long id, Long itemId, ConferenciaItemRequest dados) {
        var recebimento = buscarEntidade(id);
        exigirEmAberto(recebimento);
        var item = recebimento.getItens().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new NaoEncontradoException("Item " + itemId + " não é desta nota."));

        boolean temQuantidade = dados.quantidadeConferida().signum() > 0;
        boolean divergente = dados.quantidadeConferida().compareTo(item.getQuantidadeNota()) != 0;
        String observacao = dados.observacao() == null || dados.observacao().isBlank() ? null : dados.observacao().trim();

        if (item.getProduto().getUnidadeMedida() == UnidadeMedida.UNIDADE
                && dados.quantidadeConferida().stripTrailingZeros().scale() > 0) {
            throw new RegraNegocioException(item.getProduto().getNome() + " é contado por unidade e não aceita quantidade com fração.");
        }
        if (temQuantidade && (dados.codigoLote() == null || dados.codigoLote().isBlank())) {
            throw new RegraNegocioException("Informe o código do lote do item conferido.");
        }
        if (temQuantidade && dados.dataValidade() != null && dados.dataValidade().isBefore(LocalDate.now())) {
            throw new RegraNegocioException("A validade informada já passou. Produto vencido não entra no estoque.");
        }
        if (divergente && observacao == null) {
            throw new RegraNegocioException("A quantidade conferida é diferente da nota. Explique a divergência na observação.");
        }

        item.setQuantidadeConferida(dados.quantidadeConferida());
        item.setCodigoLote(temQuantidade ? dados.codigoLote().trim() : null);
        item.setDataValidade(temQuantidade ? dados.dataValidade() : null);
        item.setObservacao(observacao);

        boolean algumDivergente = recebimento.getItens().stream().anyMatch(RecebimentoResponse::divergente);
        recebimento.setStatus(algumDivergente ? StatusRecebimento.COM_DIVERGENCIA : StatusRecebimento.EM_CONFERENCIA);
        return RecebimentoResponse.de(recebimento);
    }

    // Numa transação só: cria ou completa o lote de cada item e lança a entrada com a quantidade conferida
    @Transactional
    public RecebimentoResponse concluir(Long id, Usuario usuario) {
        var recebimento = buscarEntidade(id);
        exigirEmAberto(recebimento);

        long faltam = recebimento.getItens().stream().filter(i -> i.getQuantidadeConferida() == null).count();
        if (faltam > 0) {
            throw new RegraNegocioException("Ainda falta conferir " + faltam + " item(ns) da nota.");
        }

        for (RecebimentoItem item : recebimento.getItens()) {
            if (item.getQuantidadeConferida().signum() == 0) {
                continue;
            }
            movimentacaoService.entrarNoLote(item.getProduto(), item.getCodigoLote(), item.getDataValidade(),
                    item.getQuantidadeConferida(), item.getValorUnitario(), MotivoMovimentacao.RECEBIMENTO,
                    usuario, recebimento, "Nota " + recebimento.getNumeroNota());
        }

        recebimento.setStatus(StatusRecebimento.CONCLUIDO);
        recebimento.setConcluidoEm(LocalDateTime.now());
        return RecebimentoResponse.de(recebimento);
    }

    @Transactional
    public RecebimentoResponse cancelar(Long id) {
        var recebimento = buscarEntidade(id);
        exigirEmAberto(recebimento);
        recebimento.setStatus(StatusRecebimento.CANCELADO);
        return RecebimentoResponse.de(recebimento);
    }

    private void exigirEmAberto(Recebimento recebimento) {
        if (recebimento.getStatus() == StatusRecebimento.CONCLUIDO) {
            throw new RegraNegocioException("Esta nota já foi concluída.");
        }
        if (recebimento.getStatus() == StatusRecebimento.CANCELADO) {
            throw new RegraNegocioException("Esta nota foi cancelada.");
        }
    }

    private Recebimento buscarEntidade(Long id) {
        return recebimentoRepository.findById(id)
                .orElseThrow(() -> new NaoEncontradoException("Recebimento " + id + " não encontrado."));
    }
}
