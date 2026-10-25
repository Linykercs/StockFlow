package br.com.stockflow.repository;

import br.com.stockflow.domain.entity.Movimentacao;
import br.com.stockflow.domain.enums.MotivoMovimentacao;
import br.com.stockflow.domain.enums.TipoMovimentacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    // histórico paginado. O countQuery conta o total sem os "join fetch", que não funcionam no count.
    // O cast nas datas avisa o PostgreSQL do tipo do parâmetro quando ele vem nulo.
    @Query(value = """
            select m from Movimentacao m
            join fetch m.lote l
            join fetch l.produto p
            join fetch m.usuario u
            where (cast(:inicio as LocalDateTime) is null or m.dataHora >= :inicio)
              and (cast(:fim as LocalDateTime) is null or m.dataHora < :fim)
              and (:tipo is null or m.tipo = :tipo)
              and (:motivo is null or m.motivo = :motivo)
              and (:produtoId is null or p.id = :produtoId)
              and (:usuarioId is null or u.id = :usuarioId)
            order by m.dataHora desc, m.id desc
            """,
            countQuery = """
            select count(m) from Movimentacao m
            where (cast(:inicio as LocalDateTime) is null or m.dataHora >= :inicio)
              and (cast(:fim as LocalDateTime) is null or m.dataHora < :fim)
              and (:tipo is null or m.tipo = :tipo)
              and (:motivo is null or m.motivo = :motivo)
              and (:produtoId is null or m.lote.produto.id = :produtoId)
              and (:usuarioId is null or m.usuario.id = :usuarioId)
            """)
    Page<Movimentacao> buscar(LocalDateTime inicio, LocalDateTime fim, TipoMovimentacao tipo,
                              MotivoMovimentacao motivo, Long produtoId, Long usuarioId, Pageable pagina);

    @Query("""
            select m from Movimentacao m
            join fetch m.lote l
            join fetch l.produto
            where m.dataHora >= :desde
            order by m.dataHora desc, m.id desc
            """)
    List<Movimentacao> buscarDesde(LocalDateTime desde);
}
