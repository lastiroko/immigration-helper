package com.immigrationhelper.infrastructure.scanner;

import org.springframework.stereotype.Service;

import java.io.InputStream;

/**
 * Default scanner that always returns clean. Real ClamAV/cloud scanner integration is a follow-up;
 * this exists so the upload pipeline always runs through a scan() call regardless of profile.
 */
@Service
public class NoOpVirusScanner implements VirusScannerService {

    @Override
    public ScanResult scan(InputStream content) {
        return new ScanResult(true, "scan skipped");
    }
}
