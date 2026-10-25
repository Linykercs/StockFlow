package br.com.stockflow.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;

// Lê a view vw_estoque_produto (só leitura). A quantidade disponível não conta lote vencido (RN02).
@Entity
@Immutable
@Table(name = "vw_estoque_produto")
@Getter
public class EstoqueProduto {

    @Id
    @Column(name = "produto_id")
    private Long produtoId;

    @Column(name = "quantidade_total")
    private BigDecimal quantidadeTotal;

    @Column(name = "quantidade_disponivel")
    private BigDecimal quantidadeDisponivel;
}
