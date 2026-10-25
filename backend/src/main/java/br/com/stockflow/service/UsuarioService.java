package br.com.stockflow.service;

import br.com.stockflow.domain.entity.Usuario;
import br.com.stockflow.dto.request.UsuarioRequest;
import br.com.stockflow.dto.response.UsuarioResponse;
import br.com.stockflow.exception.ConflitoException;
import br.com.stockflow.exception.NaoEncontradoException;
import br.com.stockflow.exception.RegraNegocioException;
import br.com.stockflow.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// RF07: contas de usuário. Só o administrador chega aqui (ver UsuarioController).
@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAllByOrderByNome().stream().map(UsuarioResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponse buscar(Long id) {
        return UsuarioResponse.de(buscarEntidade(id));
    }

    @Transactional
    public UsuarioResponse criar(UsuarioRequest dados) {
        if (dados.senha() == null || dados.senha().isBlank()) {
            throw new RegraNegocioException("Informe a senha do novo usuário.");
        }
        if (usuarioRepository.existsByEmailIgnoreCase(dados.email().trim())) {
            throw new ConflitoException("Já existe um usuário com o e-mail " + dados.email() + ".");
        }

        var usuario = new Usuario();
        preencher(usuario, dados);
        usuario.setSenhaHash(passwordEncoder.encode(dados.senha()));
        return UsuarioResponse.de(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponse editar(Long id, UsuarioRequest dados, Usuario logado) {
        var usuario = buscarEntidade(id);
        if (usuarioRepository.existsByEmailIgnoreCaseAndIdNot(dados.email().trim(), id)) {
            throw new ConflitoException("Já existe um usuário com o e-mail " + dados.email() + ".");
        }
        if (usuario.getId().equals(logado.getId()) && Boolean.FALSE.equals(dados.ativo())) {
            throw new RegraNegocioException("Você não pode inativar o seu próprio usuário.");
        }

        preencher(usuario, dados);
        if (dados.senha() != null && !dados.senha().isBlank()) {
            usuario.setSenhaHash(passwordEncoder.encode(dados.senha()));
        }
        return UsuarioResponse.de(usuario);
    }

    // exclusão lógica: o usuário continua nas movimentações que fez
    @Transactional
    public void inativar(Long id, Usuario logado) {
        if (id.equals(logado.getId())) {
            throw new RegraNegocioException("Você não pode inativar o seu próprio usuário.");
        }
        buscarEntidade(id).setAtivo(false);
    }

    private void preencher(Usuario usuario, UsuarioRequest dados) {
        usuario.setNome(dados.nome().trim());
        usuario.setEmail(dados.email().trim().toLowerCase());
        usuario.setPerfil(dados.perfil());
        usuario.setSetor(dados.setor() == null || dados.setor().isBlank() ? null : dados.setor().trim());
        if (dados.ativo() != null) {
            usuario.setAtivo(dados.ativo());
        }
    }

    private Usuario buscarEntidade(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NaoEncontradoException("Usuário " + id + " não encontrado."));
    }
}
