package br.com.stockflow.service;

import br.com.stockflow.domain.entity.Lote;
import br.com.stockflow.domain.entity.MovimentacaoEstoque;
import br.com.stockflow.domain.entity.Usuario;
import br.com.stockflow.domain.enums.TipoMovimentacao;
import br.com.stockflow.dto.request.MovimentacaoRequest;
import br.com.stockflow.dto.response.MovimentacaoResponse;
import br.com.stockflow.exception.BusinessException;
import br.com.stockflow.exception.RecursoNaoEncontradoException;
import br.com.stockflow.repository.LoteRepository;
import br.com.stockflow.repository.MovimentacaoEstoqueRepository;
import br.com.stockflow.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * RN01: uma saida nao pode ultrapassar a quantidade disponivel no lote.
 * RN02: um lote vencido nao aceita novas movimentacoes (entrada ou saida).
 */
@Service
@Transactional
public class MovimentacaoService {

    private final MovimentacaoEstoqueRepository movimentacaoRepository;
    private final LoteRepository loteRepository;
    private final UsuarioRepository usuarioRepository;

    public MovimentacaoService(
            MovimentacaoEstoqueRepository movimentacaoRepository,
            LoteRepository loteRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.movimentacaoRepository = movimentacaoRepository;
        this.loteRepository = loteRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoResponse> listarRecentes() {
        return movimentacaoRepository.findTop50ByOrderByDataHoraDesc().stream()
                .map(MovimentacaoResponse::de)
                .toList();
    }

    public MovimentacaoResponse registrar(MovimentacaoRequest request, String emailUsuario) {
        Lote lote = loteRepository.findById(request.loteId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Lote nao encontrado: " + request.loteId()));

        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario nao encontrado: " + emailUsuario));

        if (lote.isVencido()) {
            throw new BusinessException("Lote vencido em " + lote.getDataValidade() + " nao aceita movimentacoes (RN02)");
        }

        if (request.tipo() == TipoMovimentacao.SAIDA) {
            if (request.quantidade() > lote.getQuantidade()) {
                throw new BusinessException(
                        "Estoque disponivel: " + lote.getQuantidade() + " un. (RN01)"
                );
            }
            lote.setQuantidade(lote.getQuantidade() - request.quantidade());
        } else {
            lote.setQuantidade(lote.getQuantidade() + request.quantidade());
        }

        MovimentacaoEstoque movimentacao = MovimentacaoEstoque.builder()
                .lote(lote)
                .usuario(usuario)
                .tipo(request.tipo())
                .quantidade(request.quantidade())
                .observacao(request.observacao())
                .build();

        return MovimentacaoResponse.de(movimentacaoRepository.save(movimentacao));
    }
}
