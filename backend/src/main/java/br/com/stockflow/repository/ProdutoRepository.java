package br.com.stockflow.repository;

import br.com.stockflow.domain.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    // RF09: busca por nome, código, código de barras ou código do lote
    @Query("""
            select p from Produto p
            left join fetch p.categoria c
            left join fetch p.fornecedor
            where p.ativo = true
              and (:categoriaId is null or c.id = :categoriaId)
              and (:busca is null
                   or lower(p.nome) like lower(concat('%', :busca, '%'))
                   or p.codigo = :busca
                   or p.codigoBarras = :busca)
              and (:lote is null or exists (
                   select 1 from Lote l where l.produto = p and l.codigo = :lote))
            order by p.nome
            """)
    List<Produto> buscar(String busca, Long categoriaId, String lote);

    @Query("select p from Produto p left join fetch p.categoria left join fetch p.fornecedor where p.id = :id and p.ativo = true")
    Optional<Produto> buscarAtivo(Long id);

    long countByAtivoTrue();

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, Long id);

    boolean existsByCodigoBarras(String codigoBarras);

    boolean existsByCodigoBarrasAndIdNot(String codigoBarras, Long id);
}
