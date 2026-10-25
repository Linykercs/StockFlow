package br.com.stockflow.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// Adiciona o botão "Authorize" no Swagger (/docs) para colar o token do login
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openApi() {
        var bearer = new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT");
        return new OpenAPI()
                .info(new Info().title("StockFlow API").version("0.1.0"))
                .components(new Components().addSecuritySchemes("bearer", bearer))
                .addSecurityItem(new SecurityRequirement().addList("bearer"));
    }
}
