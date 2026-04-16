package Zyphora.Luxury.Web.Application.Backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
public class ZyphoraApplication {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(ZyphoraApplication.class);
        
        // Get the PORT from environment (Render sets this)
        String port = System.getenv("PORT");
        if (port != null) {
            Properties props = new Properties();
            props.setProperty("server.port", port);
            app.setDefaultProperties(props);
        }
        
        app.run(args);
    }
}
