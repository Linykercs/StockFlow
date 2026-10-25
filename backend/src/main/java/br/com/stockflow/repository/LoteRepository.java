package br.com.stockflow.repository;

import br.com.stockflow.domain.entity.Lote;
import br.com.stockflow.domain.enums.SituacaoLote;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

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

    @Query("""
            select l from Lote l
            join fetch l.produto p
            where p.ativo = true
              and l.situacao = :situacao
              and (:produtoId is null or p.id = :produtoId)
            order by l.dataValidade nulls last, p.nome
            """)
    List<Lote> buscar(SituacaoLote situacao, Long produtoId);

    // Os métodos "ParaAtualizar" travam a linha do lote até o fim da transação (SELECT ... FOR UPDATE).
    // Assim duas saídas ao mesmo tempo não conseguem tirar do mesmo saldo (RN01).

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select l from Lote l where l.id = :id")
    Optional<Lote> buscarParaAtualizar(Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select l from Lote l where l.produto.id = :produtoId and l.codigo = :codigo")
    Optional<Lote> buscarPorCodigoParaAtualizar(Long produtoId, String codigo);

    // lotes de onde a saída pode tirar, do que vence antes para o que vence depois
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select l from Lote l
            where l.produto.id = :produtoId
              and l.situacao = br.com.stockflow.domain.enums.SituacaoLote.ATIVO
              and l.quantidadeAtual > 0
            order by l.dataValidade nulls last, l.id
            """)
    List<Lote> buscarComSaldoParaAtualizar(Long produtoId);

    // valor do estoque no painel: saldo de cada lote ativo vezes o custo do lote
    @Query("""
            select coalesce(sum(l.quantidadeAtual * coalesce(l.precoCusto, p.precoEntrada)), 0)
            from Lote l join l.produto p
            where l.situacao = br.com.stockflow.domain.enums.SituacaoLote.ATIVO and p.ativo = true
            """)
    BigDecimal somarValorDoEstoque();

    // RF05: lê a view vw_alertas com o nome do produto e o código do lote
    @Query(nativeQuery = true, value = """
            select a.tipo as "tipo", a.produto_id as "produtoId", p.nome as "produtoNome",
                   a.lote_id as "loteId", l.codigo as "loteCodigo",
                   a.data_validade as "dataValidade", a.quantidade as "quantidade"
            from vw_alertas a
            join produtos p on p.id = a.produto_id
            left join lotes l on l.id = a.lote_id
            order by case a.tipo when 'LOTE_VENCIDO' then 1 when 'LOTE_VENCENDO' then 2 else 3 end,
                     a.data_validade, p.nome
            """)
    List<AlertaView> buscarAlertas();
}
