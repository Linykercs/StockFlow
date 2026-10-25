package br.com.stockflow.repository;

import br.com.stockflow.domain.entity.Movimentacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface MovimentacaoRepository extends JpaRepository<Movimentacao, Long> {

    @Query("""
            select m from Movimentacao m
            join fetch m.lote l
            join fetch l.produto p
            left join fetch p.categoria c
            where m.dataHora >= :inicio and m.dataHora < :fim
              and (:categoriaId is null or c.id = :categoriaId)
            order by m.dataHora desc
            """)
    List<Movimentacao> buscarParaRelatorio(LocalDateTime inicio, LocalDateTime fim, Long categoriaId);
}
