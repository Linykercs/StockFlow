package br.com.stockflow.service;

import br.com.stockflow.domain.entity.EstoqueProduto;
import br.com.stockflow.domain.entity.HistoricoPreco;
import br.com.stockflow.domain.entity.Produto;
import br.com.stockflow.domain.entity.Usuario;
import br.com.stockflow.dto.request.ProdutoRequest;
import br.com.stockflow.dto.response.HistoricoPrecoResponse;
import br.com.stockflow.dto.response.LoteResponse;
import br.com.stockflow.dto.response.ProdutoResponse;
import br.com.stockflow.exception.ConflitoException;
import br.com.stockflow.exception.NaoEncontradoException;
import br.com.stockflow.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

// RF01 (cadastro), RF08 e RN04 (preços) e RF09 (busca)
@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final EstoqueProdutoRepository estoqueRepository;
    private final LoteRepository loteRepository;
    private final HistoricoPrecoRepository historicoPrecoRepository;
    private final CategoriaRepository categoriaRepository;
    private final FornecedorRepository fornecedorRepository;
    private final ConfiguracaoService configuracaoService;

    public ProdutoService(ProdutoRepository produtoRepository, EstoqueProdutoRepository estoqueRepository,
                          LoteRepository loteRepository, HistoricoPrecoRepository historicoPrecoRepository,
                          CategoriaRepository categoriaRepository, FornecedorRepository fornecedorRepository,
                          ConfiguracaoService configuracaoService) {
        this.produtoRepository = produtoRepository;
        this.estoqueRepository = estoqueRepository;
        this.loteRepository = loteRepository;
        this.historicoPrecoRepository = historicoPrecoRepository;
        this.categoriaRepository = categoriaRepository;
        this.fornecedorRepository = fornecedorRepository;
        this.configuracaoService = configuracaoService;
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponse> listar(String busca, Long categoriaId, String lote) {
        List<Produto> produtos = produtoRepository.buscar(vazioParaNulo(busca), categoriaId, vazioParaNulo(lote));

        // busca o estoque de todos de uma vez, em vez de uma consulta por produto
        Map<Long, EstoqueProduto> estoques = estoqueRepository
                .findAllById(produtos.stream().map(Produto::getId).toList()).stream()
                .collect(Collectors.toMap(EstoqueProduto::getProdutoId, Function.identity()));

        return produtos.stream()
                .map(p -> ProdutoResponse.de(p, estoques.get(p.getId()), null))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProdutoResponse buscar(Long id) {
        return comLotes(buscarEntidade(id));
    }

    @Transactional
    public ProdutoResponse criar(ProdutoRequest dados) {
        validarDuplicados(dados, null);
        var produto = new Produto();
        preencher(produto, dados);
        produto.setPrecoEntrada(dados.precoEntrada());
        produto.setPrecoSaida(dados.precoSaida());
        // o produto nasce sem estoque; o primeiro lote entra pela entrada ou pelo recebimento
        return comLotes(produtoRepository.save(produto));
    }

    @Transactional
    public ProdutoResponse editar(Long id, ProdutoRequest dados, Usuario logado) {
        var produto = buscarEntidade(id);
        validarDuplicados(dados, id);
        preencher(produto, dados);

        // RN04: preço alterado fica registrado com quem alterou, na mesma transação
        boolean mudouEntrada = produto.getPrecoEntrada().compareTo(dados.precoEntrada()) != 0;
        boolean mudouSaida = produto.getPrecoSaida().compareTo(dados.precoSaida()) != 0;
        if (mudouEntrada || mudouSaida) {
            var historico = new HistoricoPreco();
            historico.setProduto(produto);
            historico.setUsuario(logado);
            historico.setPrecoEntradaAnterior(produto.getPrecoEntrada());
            historico.setPrecoEntradaNovo(dados.precoEntrada());
            historico.setPrecoSaidaAnterior(produto.getPrecoSaida());
            historico.setPrecoSaidaNovo(dados.precoSaida());
            historicoPrecoRepository.save(historico);

            produto.setPrecoEntrada(dados.precoEntrada());
            produto.setPrecoSaida(dados.precoSaida());
        }
        return comLotes(produto);
    }

    // exclusão lógica: lotes e movimentações continuam no histórico e nos relatórios
    @Transactional
    public void excluir(Long id) {
        buscarEntidade(id).setAtivo(false);
    }

    @Transactional(readOnly = true)
    public List<HistoricoPrecoResponse> historicoDePrecos(Long id) {
        buscarEntidade(id);
        return historicoPrecoRepository.buscarPorProduto(id).stream().map(HistoricoPrecoResponse::de).toList();
    }

    private ProdutoResponse comLotes(Produto produto) {
        int diasAlerta = configuracaoService.diasAlertaVencimento();
        List<LoteResponse> lotes = loteRepository.buscarAtivosDoProduto(produto.getId()).stream()
                .map(l -> LoteResponse.de(l, diasAlerta))
                .toList();
        EstoqueProduto estoque = estoqueRepository.findById(produto.getId()).orElse(null);
        return ProdutoResponse.de(produto, estoque, lotes);
    }

    private void preencher(Produto produto, ProdutoRequest dados) {
        produto.setCodigo(dados.codigo().trim());
        produto.setCodigoBarras(vazioParaNulo(dados.codigoBarras()));
        produto.setNome(dados.nome().trim());
        produto.setUnidadeMedida(dados.unidadeMedida());
        produto.setEstoqueMinimo(dados.estoqueMinimo());

        produto.setCategoria(dados.categoriaId() == null ? null : categoriaRepository.findById(dados.categoriaId())
                .orElseThrow(() -> new NaoEncontradoException("Categoria " + dados.categoriaId() + " não encontrada.")));
        produto.setFornecedor(dados.fornecedorId() == null ? null : fornecedorRepository.findById(dados.fornecedorId())
                .orElseThrow(() -> new NaoEncontradoException("Fornecedor " + dados.fornecedorId() + " não encontrado.")));
    }

    private void validarDuplicados(ProdutoRequest dados, Long id) {
        String codigo = dados.codigo().trim();
        String codigoBarras = vazioParaNulo(dados.codigoBarras());

        boolean codigoExiste = id == null
                ? produtoRepository.existsByCodigoIgnoreCase(codigo)
                : produtoRepository.existsByCodigoIgnoreCaseAndIdNot(codigo, id);
        if (codigoExiste) {
            throw new ConflitoException("Já existe um produto com o código " + codigo + ".");
        }

        if (codigoBarras != null) {
            boolean barrasExiste = id == null
                    ? produtoRepository.existsByCodigoBarras(codigoBarras)
                    : produtoRepository.existsByCodigoBarrasAndIdNot(codigoBarras, id);
            if (barrasExiste) {
                throw new ConflitoException("Já existe um produto com o código de barras " + codigoBarras + ".");
            }
        }
    }

    private Produto buscarEntidade(Long id) {
        return produtoRepository.buscarAtivo(id)
                .orElseThrow(() -> new NaoEncontradoException("Produto " + id + " não encontrado."));
    }

    private String vazioParaNulo(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}
