package br.com.stockflow.config;

import br.com.stockflow.domain.entity.Usuario;
import br.com.stockflow.domain.enums.PerfilUsuario;
import br.com.stockflow.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

/** Garante um usuario de cada perfil para acesso inicial em ambiente de desenvolvimento. */
@Configuration
@Profile("!test")
public class DataSeeder {

    @Bean
    CommandLineRunner seedUsuarios(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            criarSeNaoExistir(usuarioRepository, passwordEncoder, "admin@stockflow.com.br", "Administrador StockFlow", PerfilUsuario.ADMINISTRADOR);
            criarSeNaoExistir(usuarioRepository, passwordEncoder, "gerente@stockflow.com.br", "Gerente StockFlow", PerfilUsuario.GERENTE);
            criarSeNaoExistir(usuarioRepository, passwordEncoder, "operador@stockflow.com.br", "Operador StockFlow", PerfilUsuario.OPERADOR);
        };
    }

    private void criarSeNaoExistir(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            String email,
            String nome,
            PerfilUsuario perfil
    ) {
        if (usuarioRepository.existsByEmail(email)) {
            return;
        }
        usuarioRepository.save(Usuario.builder()
                .nome(nome)
                .email(email)
                .senhaHash(passwordEncoder.encode("stockflow123"))
                .perfil(perfil)
                .ativo(true)
                .build());
    }
}
