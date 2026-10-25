package br.com.stockflow.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// RN04: cada alteração de preço do produto vira uma linha aqui
@Entity
@Table(name = "historico_precos")
@Getter
@Setter
public class HistoricoPreco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id")
    private Produto produto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "preco_entrada_anterior")
    private BigDecimal precoEntradaAnterior;

    @Column(name = "preco_entrada_novo")
    private BigDecimal precoEntradaNovo;

    @Column(name = "preco_saida_anterior")
    private BigDecimal precoSaidaAnterior;

    @Column(name = "preco_saida_novo")
    private BigDecimal precoSaidaNovo;

    @CreationTimestamp
    @Column(name = "alterado_em", updatable = false)
    private LocalDateTime alteradoEm;
}
