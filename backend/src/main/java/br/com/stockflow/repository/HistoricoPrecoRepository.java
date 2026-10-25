package br.com.stockflow.repository;

import br.com.stockflow.domain.entity.HistoricoPreco;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface HistoricoPrecoRepository extends JpaRepository<HistoricoPreco, Long> {

    @Query("""
            select h from HistoricoPreco h join fetch h.usuario
            where h.produto.id = :produtoId
            order by h.alteradoEm desc
            """)
    List<HistoricoPreco> buscarPorProduto(Long produtoId);

    @Query("""
            select h from HistoricoPreco h
            join fetch h.produto p
            left join fetch p.categoria c
            join fetch h.usuario
            where h.alteradoEm >= :inicio and h.alteradoEm < :fim
              and (:categoriaId is null or c.id = :categoriaId)
            order by h.alteradoEm desc
            """)
    List<HistoricoPreco> buscarParaRelatorio(LocalDateTime inicio, LocalDateTime fim, Long categoriaId);
}
