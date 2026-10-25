package br.com.stockflow.domain.entity;

import br.com.stockflow.domain.enums.MotivoMovimentacao;
import br.com.stockflow.domain.enums.TipoMovimentacao;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Generated;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// RN03: toda movimentação guarda lote, usuário, data e hora
@Entity
@Table(name = "movimentacoes")
@Getter
@Setter
public class Movimentacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lote_id")
    private Lote lote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recebimento_id")
    private Recebimento recebimento;

    @Enumerated(EnumType.STRING)
    private TipoMovimentacao tipo;

    @Enumerated(EnumType.STRING)
    private MotivoMovimentacao motivo;

    private BigDecimal quantidade;

    @Column(name = "valor_unitario")
    private BigDecimal valorUnitario;

    // o banco calcula (quantidade * valor_unitario) e o Hibernate lê de volta depois de salvar
    @Generated
    @Column(name = "valor_total", insertable = false, updatable = false)
    private BigDecimal valorTotal;

    private String observacao;

    @CreationTimestamp
    @Column(name = "data_hora", updatable = false)
    private LocalDateTime dataHora;
}
