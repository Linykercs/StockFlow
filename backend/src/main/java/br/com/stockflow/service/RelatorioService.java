package br.com.stockflow.service;

import br.com.stockflow.domain.entity.EstoqueProduto;
import br.com.stockflow.domain.entity.HistoricoPreco;
import br.com.stockflow.domain.entity.Movimentacao;
import br.com.stockflow.domain.entity.Produto;
import br.com.stockflow.domain.enums.MotivoMovimentacao;
import br.com.stockflow.domain.enums.TipoMovimentacao;
import br.com.stockflow.dto.response.*;
import br.com.stockflow.exception.RegraNegocioException;
import br.com.stockflow.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

// RF06: relatórios gerenciais. Só administrador e gerente chegam aqui (RN05, ver RelatorioController).
@Service
public class RelatorioService {

    private static final Set<MotivoMovimentacao> MOTIVOS_DE_PERDA = Set.of(MotivoMovimentacao.PERDA, MotivoMovimentacao.VENCIMENTO);

    private final ProdutoRepository produtoRepository;
    private final EstoqueProdutoRepository estoqueRepository;
    private final MovimentacaoRepository movimentacaoRepository;
    private final LoteRepository loteRepository;
    private final HistoricoPrecoRepository historicoPrecoRepository;
    private final ConfiguracaoService configuracaoService;

    public RelatorioService(ProdutoRepository produtoRepository, EstoqueProdutoRepository estoqueRepository,
                            MovimentacaoRepository movimentacaoRepository, LoteRepository loteRepository,
                            HistoricoPrecoRepository historicoPrecoRepository, ConfiguracaoService configuracaoService) {
        this.produtoRepository = produtoRepository;
        this.estoqueRepository = estoqueRepository;
        this.movimentacaoRepository = movimentacaoRepository;
        this.loteRepository = loteRepository;
        this.historicoPrecoRepository = historicoPrecoRepository;
        this.configuracaoService = configuracaoService;
    }

    // valor de custo = quantidade total x preço de entrada; valor de venda = disponível x preço de saída
    @Transactional(readOnly = true)
    public RelatorioEstoqueResponse estoque(Long categoriaId) {
        List<Produto> produtos = produtoRepository.buscar(null, categoriaId, null);
        Map<Long, EstoqueProduto> estoques = estoqueRepository
                .findAllById(produtos.stream().map(Produto::getId).toList()).stream()
                .collect(Collectors.toMap(EstoqueProduto::getProdutoId, Function.identity()));

        List<RelatorioEstoqueResponse.Item> itens = new ArrayList<>();
        BigDecimal totalCusto = BigDecimal.ZERO;
        BigDecimal totalVenda = BigDecimal.ZERO;

        for (Produto p : produtos) {
            EstoqueProduto e = estoques.get(p.getId());
            BigDecimal total = e == null ? BigDecimal.ZERO : e.getQuantidadeTotal();
            BigDecimal disponivel = e == null ? BigDecimal.ZERO : e.getQuantidadeDisponivel();
            BigDecimal custo = dinheiro(total.multiply(p.getPrecoEntrada()));
            BigDecimal venda = dinheiro(disponivel.multiply(p.getPrecoSaida()));

            itens.add(new RelatorioEstoqueResponse.Item(p.getId(), p.getCodigo(), p.getNome(),
                    p.getCategoria() == null ? null : p.getCategoria().getNome(), p.getUnidadeMedida(),
                    p.getEstoqueMinimo(), total, disponivel, custo, venda));
            totalCusto = totalCusto.add(custo);
            totalVenda = totalVenda.add(venda);
        }
        return new RelatorioEstoqueResponse(itens, totalCusto, totalVenda);
    }

    @Transactional(readOnly = true)
    public RelatorioMovimentacoesResponse movimentacoes(LocalDate inicio, LocalDate fim, Long categoriaId) {
        var periodo = Periodo.de(inicio, fim);
        List<Movimentacao> lista = buscarMovimentacoes(periodo, categoriaId);

        // agrupa por tipo e motivo, mantendo a ordem dos enums (ENTRADA antes de SAIDA)
        Map<TipoMovimentacao, Map<MotivoMovimentacao, List<Movimentacao>>> grupos = lista.stream()
                .collect(Collectors.groupingBy(Movimentacao::getTipo, () -> new EnumMap<>(TipoMovimentacao.class),
                        Collectors.groupingBy(Movimentacao::getMotivo, () -> new EnumMap<>(MotivoMovimentacao.class),
                                Collectors.toList())));

        List<RelatorioMovimentacoesResponse.Total> totais = new ArrayList<>();
        grupos.forEach((tipo, porMotivo) -> porMotivo.forEach((motivo, movs) ->
                totais.add(new RelatorioMovimentacoesResponse.Total(tipo, motivo, movs.size(),
                        somar(movs, Movimentacao::getQuantidade), somar(movs, Movimentacao::getValorTotal)))));

        BigDecimal entradas = somar(filtrar(lista, TipoMovimentacao.ENTRADA), Movimentacao::getValorTotal);
        BigDecimal saidas = somar(filtrar(lista, TipoMovimentacao.SAIDA), Movimentacao::getValorTotal);
        return new RelatorioMovimentacoesResponse(periodo.inicio(), periodo.fim(), entradas, saidas, totais);
    }

    // saídas por perda ou vencimento
    @Transactional(readOnly = true)
    public RelatorioPerdasResponse perdas(LocalDate inicio, LocalDate fim, Long categoriaId) {
        var periodo = Periodo.de(inicio, fim);
        List<Movimentacao> perdas = buscarMovimentacoes(periodo, categoriaId).stream()
                .filter(m -> m.getTipo() == TipoMovimentacao.SAIDA && MOTIVOS_DE_PERDA.contains(m.getMotivo()))
                .toList();

        // um registro por mês do período, mesmo os meses sem perda, para o gráfico não pular mês
        Map<String, BigDecimal> porMes = new LinkedHashMap<>();
        for (var mes = periodo.inicio().withDayOfMonth(1); !mes.isAfter(periodo.fim()); mes = mes.plusMonths(1)) {
            porMes.put(mes.toString().substring(0, 7), BigDecimal.ZERO);
        }
        for (Movimentacao m : perdas) {
            porMes.merge(m.getDataHora().toLocalDate().toString().substring(0, 7), m.getValorTotal(), BigDecimal::add);
        }

        List<RelatorioPerdasResponse.Item> itens = perdas.stream()
                .map(m -> new RelatorioPerdasResponse.Item(m.getDataHora(),
                        new ReferenciaResponse(m.getLote().getProduto().getId(), m.getLote().getProduto().getNome()),
                        m.getLote().getCodigo(), m.getMotivo(), m.getQuantidade(), m.getValorTotal(), m.getObservacao()))
                .toList();

        return new RelatorioPerdasResponse(periodo.inicio(), periodo.fim(), somar(perdas, Movimentacao::getValorTotal),
                porMes.entrySet().stream().map(e -> new RelatorioPerdasResponse.Mes(e.getKey(), e.getValue())).toList(),
                itens);
    }

    @Transactional(readOnly = true)
    public List<LoteResponse> vencimentos(Long categoriaId) {
        int diasAlerta = configuracaoService.diasAlertaVencimento();
        return loteRepository.buscarParaRelatorioDeVencimentos(categoriaId).stream()
                .map(l -> LoteResponse.de(l, diasAlerta))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VariacaoPrecoResponse> precos(LocalDate inicio, LocalDate fim, Long categoriaId) {
        var periodo = Periodo.de(inicio, fim);
        List<HistoricoPreco> historico = historicoPrecoRepository.buscarParaRelatorio(
                periodo.inicio().atStartOfDay(), periodo.fim().plusDays(1).atStartOfDay(), categoriaId);

        return historico.stream()
                .map(h -> new VariacaoPrecoResponse(h.getAlteradoEm(),
                        new ReferenciaResponse(h.getProduto().getId(), h.getProduto().getNome()),
                        h.getUsuario().getNome(),
                        h.getPrecoEntradaAnterior(), h.getPrecoEntradaNovo(),
                        h.getPrecoSaidaAnterior(), h.getPrecoSaidaNovo(),
                        margem(h.getPrecoEntradaAnterior(), h.getPrecoSaidaAnterior()),
                        margem(h.getPrecoEntradaNovo(), h.getPrecoSaidaNovo())))
                .toList();
    }

    private List<Movimentacao> buscarMovimentacoes(Periodo periodo, Long categoriaId) {
        // fim + 1 dia à meia-noite para incluir o dia final inteiro
        LocalDateTime de = periodo.inicio().atStartOfDay();
        LocalDateTime ate = periodo.fim().plusDays(1).atStartOfDay();
        return movimentacaoRepository.buscarParaRelatorio(de, ate, categoriaId);
    }

    private List<Movimentacao> filtrar(List<Movimentacao> lista, TipoMovimentacao tipo) {
        return lista.stream().filter(m -> m.getTipo() == tipo).toList();
    }

    private BigDecimal somar(List<Movimentacao> lista, Function<Movimentacao, BigDecimal> campo) {
        return lista.stream().map(campo).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal dinheiro(BigDecimal valor) {
        return valor.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal margem(BigDecimal entrada, BigDecimal saida) {
        if (entrada.signum() == 0) {
            return null;
        }
        return saida.divide(entrada, 4, RoundingMode.HALF_UP)
                .subtract(BigDecimal.ONE)
                .multiply(BigDecimal.valueOf(100))
                .setScale(1, RoundingMode.HALF_UP);
    }

    // sem datas, o relatório pega os últimos 6 meses (do dia 1 de cinco meses atrás até hoje)
    private record Periodo(LocalDate inicio, LocalDate fim) {

        static Periodo de(LocalDate inicio, LocalDate fim) {
            LocalDate ate = fim == null ? LocalDate.now() : fim;
            LocalDate de = inicio == null ? ate.minusMonths(5).withDayOfMonth(1) : inicio;
            if (de.isAfter(ate)) {
                throw new RegraNegocioException("A data inicial não pode ser depois da data final.");
            }
            return new Periodo(de, ate);
        }
    }
}
