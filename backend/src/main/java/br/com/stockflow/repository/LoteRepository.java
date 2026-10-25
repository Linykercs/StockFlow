package br.com.stockflow.repository;

import br.com.stockflow.domain.entity.Lote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoteRepository extends JpaRepository<Lote, Long> {
}
