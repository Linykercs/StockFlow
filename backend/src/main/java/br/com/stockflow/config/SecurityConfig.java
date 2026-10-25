package br.com.stockflow.config;

import br.com.stockflow.dto.response.ErroResponse;
import br.com.stockflow.security.JwtFiltro;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.util.List;

// @EnableMethodSecurity liga o @PreAuthorize nos controllers, usado para as permissões por perfil
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFiltro jwtFiltro;
    private final ObjectMapper objectMapper;

    public SecurityConfig(JwtFiltro jwtFiltro, ObjectMapper objectMapper) {
        this.jwtFiltro = jwtFiltro;
        this.objectMapper = objectMapper;
    }

    @Bean
    public SecurityFilterChain filtros(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> {})
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(rotas -> rotas
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/docs", "/docs/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(erros -> erros
                        .authenticationEntryPoint((req, res, e) ->
                                escreverErro(res, HttpServletResponse.SC_UNAUTHORIZED, "Faça login para continuar."))
                        .accessDeniedHandler((req, res, e) ->
                                escreverErro(res, HttpServletResponse.SC_FORBIDDEN, "Seu perfil não tem permissão para esta ação.")))
                .addFilterBefore(jwtFiltro, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // libera o front do Vite (localhost:5173) para chamar a API
    @Bean
    public CorsConfigurationSource corsConfigurationSource(@Value("${stockflow.cors.origens}") List<String> origens) {
        var config = new CorsConfiguration();
        config.setAllowedOrigins(origens);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    private void escreverErro(HttpServletResponse response, int status, String mensagem) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(), new ErroResponse(status, mensagem));
    }
}
