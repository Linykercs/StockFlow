package br.com.stockflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

// O login é feito pelo AuthService com os usuários do banco, então o usuário padrão do Spring não é criado
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class StockflowApplication {

    public static void main(String[] args) {
        SpringApplication.run(StockflowApplication.class, args);
    }
}
