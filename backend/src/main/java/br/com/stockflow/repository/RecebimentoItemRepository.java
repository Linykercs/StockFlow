package br.com.stockflow.repository;

import br.com.stockflow.domain.entity.RecebimentoItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecebimentoItemRepository extends JpaRepository<RecebimentoItem, Long> {
}
