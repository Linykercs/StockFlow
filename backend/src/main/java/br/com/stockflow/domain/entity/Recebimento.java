package br.com.stockflow.domain.entity;

import br.com.stockflow.domain.enums.StatusRecebimento;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recebimentos")
@Getter
@Setter
public class Recebimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fornecedor_id")
    private Fornecedor fornecedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "numero_nota")
    private String numeroNota;

    @Column(name = "serie_nota")
    private String serieNota;

    // CHAR(44) no banco, a chave da NF-e tem sempre 44 dígitos
    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "chave_acesso", length = 44)
    private String chaveAcesso;

    @Column(name = "data_emissao")
    private LocalDate dataEmissao;

    @Enumerated(EnumType.STRING)
    private StatusRecebimento status = StatusRecebimento.EM_CONFERENCIA;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "concluido_em")
    private LocalDateTime concluidoEm;

    @OneToMany(mappedBy = "recebimento", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecebimentoItem> itens = new ArrayList<>();
}
