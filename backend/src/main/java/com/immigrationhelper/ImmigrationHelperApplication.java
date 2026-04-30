package com.immigrationhelper;

import com.immigrationhelper.infrastructure.config.FeatureFlags;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan(basePackageClasses = FeatureFlags.class)
public class ImmigrationHelperApplication {
    public static void main(String[] args) {
        SpringApplication.run(ImmigrationHelperApplication.class, args);
    }
}
