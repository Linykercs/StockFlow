package br.com.stockflow.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "recebimento_itens")
@Getter
@Setter
public class RecebimentoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recebimento_id")
    private Recebimento recebimento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id")
    private Produto produto;

    @Column(name = "quantidade_nota")
    private BigDecimal quantidadeNota;

    @Column(name = "quantidade_conferida")
    private BigDecimal quantidadeConferida;

    @Column(name = "valor_unitario")
    private BigDecimal valorUnitario;

    @Column(name = "codigo_lote")
    private String codigoLote;

    @Column(name = "data_validade")
    private LocalDate dataValidade;

    private String observacao;
}
