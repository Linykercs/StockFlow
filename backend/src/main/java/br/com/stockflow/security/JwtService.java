package br.com.stockflow.security;

import br.com.stockflow.domain.entity.Usuario;
import io.jsonwebtoken.Claims;
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

    // token temporário emitido depois da senha certa, antes do código do autenticador (RF?? MFA)
    private static final String CLAIM_ETAPA = "etapa";
    private static final String ETAPA_MFA_PENDENTE = "MFA_PENDENTE";
    private static final long VALIDADE_MFA_MINUTOS = 5;

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

    // devolve o id do usuário, ou null se o token for inválido, vencido, ou for um token de login pendente de MFA
    public Long lerUsuarioId(String token) {
        Claims claims = lerClaims(token);
        if (claims == null || claims.get(CLAIM_ETAPA) != null) return null;
        return idDoSubject(claims);
    }

    public String gerarTokenMfaPendente(Usuario usuario) {
        Instant agora = Instant.now();
        return Jwts.builder()
                .subject(usuario.getId().toString())
                .claim(CLAIM_ETAPA, ETAPA_MFA_PENDENTE)
                .issuedAt(Date.from(agora))
                .expiration(Date.from(agora.plus(VALIDADE_MFA_MINUTOS, ChronoUnit.MINUTES)))
                .signWith(chave)
                .compact();
    }

    // só aceita um token gerado por gerarTokenMfaPendente; devolve null se não for esse caso, se for inválido ou vencido
    public Long lerUsuarioIdMfaPendente(String token) {
        Claims claims = lerClaims(token);
        if (claims == null || !ETAPA_MFA_PENDENTE.equals(claims.get(CLAIM_ETAPA))) return null;
        return idDoSubject(claims);
    }

    private Claims lerClaims(String token) {
        try {
            return Jwts.parser().verifyWith(chave).build().parseSignedClaims(token).getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }

    private Long idDoSubject(Claims claims) {
        try {
            return Long.valueOf(claims.getSubject());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
