package br.com.stockflow.service;

import br.com.stockflow.domain.entity.Fornecedor;
import br.com.stockflow.dto.request.FornecedorRequest;
import br.com.stockflow.dto.response.FornecedorResponse;
import br.com.stockflow.exception.ConflitoException;
import br.com.stockflow.exception.NaoEncontradoException;
import br.com.stockflow.repository.FornecedorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FornecedorService {

    private final FornecedorRepository fornecedorRepository;

    public FornecedorService(FornecedorRepository fornecedorRepository) {
        this.fornecedorRepository = fornecedorRepository;
    }

    @Transactional(readOnly = true)
    public List<FornecedorResponse> listar() {
        return fornecedorRepository.findByAtivoTrueOrderByNome().stream().map(FornecedorResponse::de).toList();
    }

    @Transactional
    public FornecedorResponse criar(FornecedorRequest dados) {
        String cnpj = vazioParaNulo(dados.cnpj());
        if (cnpj != null && fornecedorRepository.existsByCnpj(cnpj)) {
            throw new ConflitoException("Já existe um fornecedor com o CNPJ " + cnpj + ".");
        }
        var fornecedor = new Fornecedor();
        preencher(fornecedor, dados);
        return FornecedorResponse.de(fornecedorRepository.save(fornecedor));
    }

    @Transactional
    public FornecedorResponse editar(Long id, FornecedorRequest dados) {
        var fornecedor = fornecedorRepository.findById(id)
                .filter(Fornecedor::isAtivo)
                .orElseThrow(() -> new NaoEncontradoException("Fornecedor " + id + " não encontrado."));
        String cnpj = vazioParaNulo(dados.cnpj());
        if (cnpj != null && fornecedorRepository.existsByCnpjAndIdNot(cnpj, id)) {
            throw new ConflitoException("Já existe um fornecedor com o CNPJ " + cnpj + ".");
        }
        preencher(fornecedor, dados);
        return FornecedorResponse.de(fornecedor);
    }

    private void preencher(Fornecedor fornecedor, FornecedorRequest dados) {
        fornecedor.setNome(dados.nome().trim());
        fornecedor.setCnpj(vazioParaNulo(dados.cnpj()));
        fornecedor.setTelefone(vazioParaNulo(dados.telefone()));
        fornecedor.setEmail(vazioParaNulo(dados.email()));
    }

    private String vazioParaNulo(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}
