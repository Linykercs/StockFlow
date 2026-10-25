package br.com.stockflow.repository;

import br.com.stockflow.domain.entity.EstoqueProduto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstoqueProdutoRepository extends JpaRepository<EstoqueProduto, Long> {
}
