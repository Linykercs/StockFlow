package br.com.stockflow.security;

import br.com.stockflow.domain.entity.Usuario;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey chave;
    private final long validadeMinutos;

    public JwtService(@Value("${stockflow.jwt.segredo}") String segredo,
                      @Value("${stockflow.jwt.validade-minutos}") long validadeMinutos) {
        this.chave = Keys.hmacShaKeyFor(segredo.getBytes(StandardCharsets.UTF_8));
        this.validadeMinutos = validadeMinutos;
    }

    public String gerarToken(Usuario usuario) {
        Instant agora = Instant.now();
        return Jwts.builder()
                .subject(usuario.getId().toString())
                .claim("perfil", usuario.getPerfil().name())
                .issuedAt(Date.from(agora))
                .expiration(Date.from(agora.plus(validadeMinutos, ChronoUnit.MINUTES)))
                .signWith(chave)
                .compact();
    }

    // devolve o id do usuário, ou null se o token for inválido ou estiver vencido
    public Long lerUsuarioId(String token) {
        try {
            String subject = Jwts.parser().verifyWith(chave).build()
                    .parseSignedClaims(token).getPayload().getSubject();
            return Long.valueOf(subject);
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }
}
