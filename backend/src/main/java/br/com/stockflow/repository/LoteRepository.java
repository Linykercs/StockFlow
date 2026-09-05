package br.com.stockflow.repository;

import br.com.stockflow.domain.entity.Lote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface LoteRepository extends JpaRepository<Lote, Long> {

    List<Lote> findByProdutoId(Long produtoId);

    List<Lote> findByDataValidadeLessThanEqualAndQuantidadeGreaterThan(LocalDate data, Integer quantidade);
}
