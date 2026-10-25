package br.com.stockflow.domain.entity;

import br.com.stockflow.domain.enums.SituacaoLote;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "lotes")
@Getter
@Setter
public class Lote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id")
    private Produto produto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recebimento_id")
    private Recebimento recebimento;

    private String codigo;

    @Column(name = "data_recebimento")
    private LocalDate dataRecebimento = LocalDate.now();

    @Column(name = "data_validade")
    private LocalDate dataValidade;

    // RN01: o banco não deixa ficar negativo, mas o service precisa conferir antes
    @Column(name = "quantidade_atual")
    private BigDecimal quantidadeAtual = BigDecimal.ZERO;

    @Column(name = "preco_custo")
    private BigDecimal precoCusto;

    @Enumerated(EnumType.STRING)
    private SituacaoLote situacao = SituacaoLote.ATIVO;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    public boolean isVencido() {
        return dataValidade != null && dataValidade.isBefore(LocalDate.now());
    }
}
