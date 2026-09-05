package br.com.stockflow.service;

import br.com.stockflow.domain.entity.Categoria;
import br.com.stockflow.domain.entity.Fornecedor;
import br.com.stockflow.domain.entity.Produto;
import br.com.stockflow.dto.request.ProdutoRequest;
import br.com.stockflow.dto.response.ProdutoResponse;
import br.com.stockflow.exception.BusinessException;
import br.com.stockflow.exception.RecursoNaoEncontradoException;
import br.com.stockflow.repository.CategoriaRepository;
import br.com.stockflow.repository.FornecedorRepository;
import br.com.stockflow.repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;
    private final FornecedorRepository fornecedorRepository;

    public ProdutoService(
            ProdutoRepository produtoRepository,
            CategoriaRepository categoriaRepository,
            FornecedorRepository fornecedorRepository
    ) {
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
        this.fornecedorRepository = fornecedorRepository;
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponse> listar() {
        return produtoRepository.findAll().stream().map(ProdutoResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public ProdutoResponse buscarPorId(Long id) {
        return ProdutoResponse.de(buscarEntidade(id));
    }

    public ProdutoResponse criar(ProdutoRequest request) {
        if (request.codigoBarras() != null && produtoRepository.existsByCodigoBarras(request.codigoBarras())) {
            throw new BusinessException("Ja existe um produto com este codigo de barras");
        }

        Produto produto = Produto.builder()
                .nome(request.nome())
                .codigoBarras(request.codigoBarras())
                .unidadeMedida(request.unidadeMedida())
                .estoqueMinimo(request.estoqueMinimo())
                .categoria(buscarCategoria(request.categoriaId()))
                .fornecedor(buscarFornecedor(request.fornecedorId()))
                .build();

        return ProdutoResponse.de(produtoRepository.save(produto));
    }

    public ProdutoResponse atualizar(Long id, ProdutoRequest request) {
        Produto produto = buscarEntidade(id);
        produto.setNome(request.nome());
        produto.setCodigoBarras(request.codigoBarras());
        produto.setUnidadeMedida(request.unidadeMedida());
        produto.setEstoqueMinimo(request.estoqueMinimo());
        produto.setCategoria(buscarCategoria(request.categoriaId()));
        produto.setFornecedor(buscarFornecedor(request.fornecedorId()));
        return ProdutoResponse.de(produto);
    }

    public void inativar(Long id) {
        Produto produto = buscarEntidade(id);
        produto.setAtivo(false);
    }

    private Produto buscarEntidade(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto nao encontrado: " + id));
    }

    private Categoria buscarCategoria(Long categoriaId) {
        if (categoriaId == null) {
            return null;
        }
        return categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria nao encontrada: " + categoriaId));
    }

    private Fornecedor buscarFornecedor(Long fornecedorId) {
        if (fornecedorId == null) {
            return null;
        }
        return fornecedorRepository.findById(fornecedorId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Fornecedor nao encontrado: " + fornecedorId));
    }
}
