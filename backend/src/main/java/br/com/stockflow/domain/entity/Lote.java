package br.com.stockflow.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "lotes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantidade = 0;

    @Column(name = "data_validade")
    private LocalDate dataValidade;

    @Column(name = "data_entrada", nullable = false)
    @Builder.Default
    private LocalDate dataEntrada = LocalDate.now();

    @Column(name = "preco_custo", precision = 12, scale = 2)
    private BigDecimal precoCusto;

    @Transient
    public boolean isVencido() {
        return dataValidade != null && dataValidade.isBefore(LocalDate.now());
    }

    @Transient
    public boolean isVencendoEm(int dias) {
        if (dataValidade == null || isVencido()) {
            return false;
        }
        return !dataValidade.isAfter(LocalDate.now().plusDays(dias));
    }
}
