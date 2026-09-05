package br.com.stockflow.repository;

import br.com.stockflow.domain.entity.MovimentacaoEstoque;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimentacaoEstoqueRepository extends JpaRepository<MovimentacaoEstoque, Long> {
    List<MovimentacaoEstoque> findTop50ByOrderByDataHoraDesc();
    List<MovimentacaoEstoque> findByLoteProdutoIdOrderByDataHoraDesc(Long produtoId);
}
