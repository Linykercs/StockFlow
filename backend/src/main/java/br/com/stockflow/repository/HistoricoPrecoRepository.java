package br.com.stockflow.repository;

import br.com.stockflow.domain.entity.HistoricoPreco;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HistoricoPrecoRepository extends JpaRepository<HistoricoPreco, Long> {
}
