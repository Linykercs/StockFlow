package br.com.stockflow.repository;

import br.com.stockflow.domain.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    boolean existsByCodigoBarras(String codigoBarras);
}
