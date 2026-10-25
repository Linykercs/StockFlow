package br.com.stockflow.service;

import br.com.stockflow.domain.entity.*;
import br.com.stockflow.domain.enums.MotivoMovimentacao;
import br.com.stockflow.domain.enums.SituacaoLote;
import br.com.stockflow.domain.enums.TipoMovimentacao;
import br.com.stockflow.domain.enums.UnidadeMedida;
import br.com.stockflow.dto.request.EntradaRequest;
import br.com.stockflow.dto.request.SaidaRequest;
import br.com.stockflow.dto.response.MovimentacaoResponse;
import br.com.stockflow.dto.response.PaginaResponse;
import br.com.stockflow.exception.NaoEncontradoException;
import br.com.stockflow.exception.RegraNegocioException;
import br.com.stockflow.repository.LoteRepository;
import br.com.stockflow.repository.MovimentacaoRepository;
import br.com.stockflow.repository.ProdutoRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

// RF02 (entrada), RF04 (saída), RN01 (saldo), RN02 (lote vencido) e RN03 (usuário, data e hora)
@Service
public class MovimentacaoService {

    private static final Set<MotivoMovimentacao> MOTIVOS_DE_ENTRADA =
            Set.of(MotivoMovimentacao.RECEBIMENTO, MotivoMovimentacao.DEVOLUCAO, MotivoMovimentacao.AJUSTE);
    private static final Set<MotivoMovimentacao> MOTIVOS_DE_SAIDA =
            Set.of(MotivoMovimentacao.VENDA, MotivoMovimentacao.PERDA, MotivoMovimentacao.VENCIMENTO, MotivoMovimentacao.AJUSTE);
    private static final DateTimeFormatter DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final MovimentacaoRepository movimentacaoRepository;
    private final LoteRepository loteRepository;
    private final ProdutoRepository produtoRepository;

    public MovimentacaoService(MovimentacaoRepository movimentacaoRepository, LoteRepository loteRepository,
                               ProdutoRepository produtoRepository) {
        this.movimentacaoRepository = movimentacaoRepository;
        this.loteRepository = loteRepository;
        this.produtoRepository = produtoRepository;
    }

    @Transactional
    public MovimentacaoResponse entrada(EntradaRequest dados, Usuario usuario) {
        if (!MOTIVOS_DE_ENTRADA.contains(dados.motivo())) {
            throw new RegraNegocioException("Motivo inválido para entrada. Use RECEBIMENTO, DEVOLUCAO ou AJUSTE.");
        }
        Produto produto = buscarProduto(dados.produtoId());
        Movimentacao movimentacao = entrarNoLote(produto, dados.codigoLote().trim(), dados.dataValidade(),
                dados.quantidade(), dados.valorUnitario(), dados.motivo(), usuario, null, dados.observacao());
        return MovimentacaoResponse.de(movimentacao);
    }

    // Usado pela entrada e pelo recebimento: soma no lote se o código já existe, senão cria o lote
    @Transactional
    public Movimentacao entrarNoLote(Produto produto, String codigoLote, LocalDate dataValidade, BigDecimal quantidade,
                                     BigDecimal valorUnitario, MotivoMovimentacao motivo, Usuario usuario,
                                     Recebimento recebimento, String observacao) {
        validarQuantidade(produto, quantidade);

        Lote lote = loteRepository.buscarPorCodigoParaAtualizar(produto.getId(), codigoLote).orElse(null);
        if (lote == null) {
            if (dataValidade != null && dataValidade.isBefore(LocalDate.now())) {
                throw new RegraNegocioException("O lote " + codigoLote + " já está vencido ("
                        + dataValidade.format(DATA) + "). Confira a validade antes de dar entrada.");
            }
            lote = new Lote();
            lote.setProduto(produto);
            lote.setCodigo(codigoLote);
            lote.setDataValidade(dataValidade);
            lote.setPrecoCusto(valorUnitario);
            lote.setRecebimento(recebimento);
            lote = loteRepository.save(lote);
        } else {
            if (lote.getSituacao() != SituacaoLote.ATIVO) {
                throw new RegraNegocioException("O lote " + codigoLote + " já foi baixado. Use outro código de lote.");
            }
            if (dataValidade != null && !dataValidade.equals(lote.getDataValidade())) {
                throw new RegraNegocioException("O lote " + codigoLote + " já existe com outra validade. Confira o código do lote.");
            }
        }

        return registrar(lote, TipoMovimentacao.ENTRADA, motivo, quantidade, valorUnitario, usuario, recebimento, observacao);
    }

    @Transactional
    public List<MovimentacaoResponse> saida(SaidaRequest dados, Usuario usuario) {
        if (!MOTIVOS_DE_SAIDA.contains(dados.motivo())) {
            throw new RegraNegocioException("Motivo inválido para saída. Use VENDA, PERDA, VENCIMENTO ou AJUSTE.");
        }
        Produto produto = buscarProduto(dados.produtoId());
        validarQuantidade(produto, dados.quantidade());

        List<Lote> lotes = lotesDaSaida(produto, dados);
        BigDecimal disponivel = lotes.stream().map(Lote::getQuantidadeAtual).reduce(BigDecimal.ZERO, BigDecimal::add);

        // RN01: não deixa sair mais do que tem
        if (disponivel.compareTo(dados.quantidade()) < 0) {
            throw new RegraNegocioException("Estoque insuficiente de " + produto.getNome() + ". Disponível: "
                    + disponivel.stripTrailingZeros().toPlainString() + ", pedido: "
                    + dados.quantidade().stripTrailingZeros().toPlainString() + ".");
        }

        // tira de cada lote o que der, na ordem de validade, até completar a quantidade
        List<MovimentacaoResponse> resultado = new ArrayList<>();
        BigDecimal falta = dados.quantidade();
        for (Lote lote : lotes) {
            if (falta.signum() == 0) {
                break;
            }
            BigDecimal tirar = lote.getQuantidadeAtual().min(falta);
            if (tirar.signum() == 0) {
                continue;
            }
            Movimentacao m = registrar(lote, TipoMovimentacao.SAIDA, dados.motivo(), tirar,
                    valorDaSaida(produto, lote, dados.motivo()), usuario, null, dados.observacao());
            resultado.add(MovimentacaoResponse.de(m));
            falta = falta.subtract(tirar);
        }
        return resultado;
    }

    @Transactional(readOnly = true)
    public PaginaResponse<MovimentacaoResponse> listar(LocalDate inicio, LocalDate fim, TipoMovimentacao tipo,
                                                       MotivoMovimentacao motivo, Long produtoId, Long usuarioId,
                                                       int pagina, int tamanho) {
        if (pagina < 0 || tamanho < 1 || tamanho > 100) {
            throw new RegraNegocioException("Use pagina a partir de 0 e tamanho entre 1 e 100.");
        }
        var resultado = movimentacaoRepository.buscar(
                inicio == null ? null : inicio.atStartOfDay(),
                fim == null ? null : fim.plusDays(1).atStartOfDay(),
                tipo, motivo, produtoId, usuarioId, PageRequest.of(pagina, tamanho));
        return PaginaResponse.de(resultado, MovimentacaoResponse::de);
    }

    // O banco não atualiza o saldo sozinho: toda movimentação muda o lote e grava o registro
    // na mesma transação. Se uma parte falhar, nenhuma fica gravada.
    @Transactional
    public Movimentacao registrar(Lote lote, TipoMovimentacao tipo, MotivoMovimentacao motivo, BigDecimal quantidade,
                                  BigDecimal valorUnitario, Usuario usuario, Recebimento recebimento, String observacao) {
        if (tipo == TipoMovimentacao.ENTRADA) {
            lote.setQuantidadeAtual(lote.getQuantidadeAtual().add(quantidade));
        } else {
            lote.setQuantidadeAtual(lote.getQuantidadeAtual().subtract(quantidade));
        }

        var movimentacao = new Movimentacao();
        movimentacao.setLote(lote);
        movimentacao.setUsuario(usuario);
        movimentacao.setRecebimento(recebimento);
        movimentacao.setTipo(tipo);
        movimentacao.setMotivo(motivo);
        movimentacao.setQuantidade(quantidade);
        movimentacao.setValorUnitario(valorUnitario);
        movimentacao.setObservacao(observacao == null || observacao.isBlank() ? null : observacao.trim());
        return movimentacaoRepository.saveAndFlush(movimentacao);
    }

    private List<Lote> lotesDaSaida(Produto produto, SaidaRequest dados) {
        boolean motivoVencimento = dados.motivo() == MotivoMovimentacao.VENCIMENTO;

        if (dados.loteIds() == null || dados.loteIds().isEmpty()) {
            // RN02: lote vencido só sai por VENCIMENTO, e VENCIMENTO só tira de lote vencido
            return loteRepository.buscarComSaldoParaAtualizar(produto.getId()).stream()
                    .filter(l -> l.isVencido() == motivoVencimento)
                    .toList();
        }

        List<Lote> escolhidos = new ArrayList<>();
        for (Long id : dados.loteIds()) {
            Lote lote = loteRepository.buscarParaAtualizar(id)
                    .orElseThrow(() -> new NaoEncontradoException("Lote " + id + " não encontrado."));
            if (!lote.getProduto().getId().equals(produto.getId())) {
                throw new RegraNegocioException("O lote " + lote.getCodigo() + " não é do produto " + produto.getNome() + ".");
            }
            if (lote.getSituacao() != SituacaoLote.ATIVO) {
                throw new RegraNegocioException("O lote " + lote.getCodigo() + " já foi baixado.");
            }
            if (lote.isVencido() && !motivoVencimento) {
                throw new RegraNegocioException("O lote " + lote.getCodigo() + " venceu em "
                        + lote.getDataValidade().format(DATA) + " e só pode sair com motivo VENCIMENTO (RN02).");
            }
            if (!lote.isVencido() && motivoVencimento) {
                throw new RegraNegocioException("O lote " + lote.getCodigo() + " ainda não venceu. Use outro motivo.");
            }
            escolhidos.add(lote);
        }
        escolhidos.sort(Comparator.comparing(Lote::getDataValidade, Comparator.nullsLast(Comparator.naturalOrder())));
        return escolhidos;
    }

    // venda sai pelo preço de venda; perda, vencimento e ajuste saem pelo custo do lote
    private BigDecimal valorDaSaida(Produto produto, Lote lote, MotivoMovimentacao motivo) {
        if (motivo == MotivoMovimentacao.VENDA) {
            return produto.getPrecoSaida();
        }
        return lote.getPrecoCusto() != null ? lote.getPrecoCusto() : produto.getPrecoEntrada();
    }

    private void validarQuantidade(Produto produto, BigDecimal quantidade) {
        if (produto.getUnidadeMedida() == UnidadeMedida.UNIDADE && quantidade.stripTrailingZeros().scale() > 0) {
            throw new RegraNegocioException(produto.getNome() + " é contado por unidade e não aceita quantidade com fração.");
        }
    }

    private Produto buscarProduto(Long id) {
        return produtoRepository.buscarAtivo(id)
                .orElseThrow(() -> new NaoEncontradoException("Produto " + id + " não encontrado."));
    }
}
