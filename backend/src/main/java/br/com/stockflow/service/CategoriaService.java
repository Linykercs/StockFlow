package br.com.stockflow.service;

import br.com.stockflow.domain.entity.Categoria;
import br.com.stockflow.dto.request.CategoriaRequest;
import br.com.stockflow.dto.response.ReferenciaResponse;
import br.com.stockflow.exception.ConflitoException;
import br.com.stockflow.repository.CategoriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<ReferenciaResponse> listar() {
        return categoriaRepository.findByAtivoTrueOrderByNome().stream()
                .map(c -> new ReferenciaResponse(c.getId(), c.getNome()))
                .toList();
    }

    @Transactional
    public ReferenciaResponse criar(CategoriaRequest dados) {
        String nome = dados.nome().trim();
        if (categoriaRepository.existsByNomeIgnoreCase(nome)) {
            throw new ConflitoException("A categoria " + nome + " já existe.");
        }
        var categoria = new Categoria();
        categoria.setNome(nome);
        categoria = categoriaRepository.save(categoria);
        return new ReferenciaResponse(categoria.getId(), categoria.getNome());
    }
}
