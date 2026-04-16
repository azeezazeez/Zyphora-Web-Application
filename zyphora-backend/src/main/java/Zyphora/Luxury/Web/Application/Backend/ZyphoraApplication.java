package Zyphora.Luxury.Web.Application.Backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ZyphoraApplication {
	public static void main(String[] args) {
		SpringApplication.run(ZyphoraApplication.class, args);
	}
}