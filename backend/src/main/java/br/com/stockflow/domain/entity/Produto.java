package br.com.stockflow.domain.entity;

import br.com.stockflow.domain.enums.UnidadeMedida;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "produtos")
@Getter
@Setter
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String codigo;

    @Column(name = "codigo_barras")
    private String codigoBarras;

    private String nome;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fornecedor_id")
    private Fornecedor fornecedor;

    @Enumerated(EnumType.STRING)
    @Column(name = "unidade_medida")
    private UnidadeMedida unidadeMedida;

    @Column(name = "estoque_minimo")
    private BigDecimal estoqueMinimo = BigDecimal.ZERO;

    @Column(name = "preco_entrada")
    private BigDecimal precoEntrada = BigDecimal.ZERO;

    @Column(name = "preco_saida")
    private BigDecimal precoSaida = BigDecimal.ZERO;

    private boolean ativo = true;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;
}
