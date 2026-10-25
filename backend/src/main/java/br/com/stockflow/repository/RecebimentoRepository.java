package br.com.stockflow.repository;

import br.com.stockflow.domain.entity.Recebimento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecebimentoRepository extends JpaRepository<Recebimento, Long> {
}
