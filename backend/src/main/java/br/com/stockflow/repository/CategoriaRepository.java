package br.com.stockflow.repository;

import br.com.stockflow.domain.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    List<Categoria> findByAtivoTrueOrderByNome();

    boolean existsByNomeIgnoreCase(String nome);
}
