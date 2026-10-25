package br.com.stockflow.repository;

import br.com.stockflow.domain.entity.Lote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LoteRepository extends JpaRepository<Lote, Long> {

    @Query("""
            select l from Lote l join fetch l.produto
            where l.produto.id = :produtoId and l.situacao = br.com.stockflow.domain.enums.SituacaoLote.ATIVO
            order by l.dataValidade nulls last
            """)
    List<Lote> buscarAtivosDoProduto(Long produtoId);

    // relatório de vencimentos: lotes ativos com saldo, do que vence antes para o que vence depois
    @Query("""
            select l from Lote l
            join fetch l.produto p
            left join fetch p.categoria c
            where l.situacao = br.com.stockflow.domain.enums.SituacaoLote.ATIVO
              and l.quantidadeAtual > 0
              and l.dataValidade is not null
              and p.ativo = true
              and (:categoriaId is null or c.id = :categoriaId)
            order by l.dataValidade
            """)
    List<Lote> buscarParaRelatorioDeVencimentos(Long categoriaId);
}
