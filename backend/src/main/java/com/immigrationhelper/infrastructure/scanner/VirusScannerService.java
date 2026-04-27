package com.immigrationhelper.infrastructure.scanner;

import java.io.InputStream;

public interface VirusScannerService {

    ScanResult scan(InputStream content);
}
