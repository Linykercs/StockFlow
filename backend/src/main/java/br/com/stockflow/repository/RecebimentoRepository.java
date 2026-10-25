package br.com.stockflow.repository;

import br.com.stockflow.domain.entity.Recebimento;
import br.com.stockflow.domain.enums.StatusRecebimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RecebimentoRepository extends JpaRepository<Recebimento, Long> {

    @Query("""
            select r from Recebimento r
            left join fetch r.fornecedor
            join fetch r.usuario
            where (:status is null or r.status = :status)
            order by r.criadoEm desc
            """)
    List<Recebimento> buscar(StatusRecebimento status);

    Optional<Recebimento> findByChaveAcesso(String chaveAcesso);

    boolean existsByChaveAcesso(String chaveAcesso);
}
