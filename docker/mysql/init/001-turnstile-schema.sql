CREATE TABLE
    IF NOT EXISTS admission_history (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        admission_no VARCHAR(191) NOT NULL,
        type VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        status VARCHAR(50) NOT NULL,
        origin VARCHAR(50) NOT NULL,
        syncStatus VARCHAR(20) NOT NULL,
        RideCode VARCHAR(100) NOT NULL,
        expiration_date DATETIME NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_admission_history_admission_no (admission_no),
        KEY idx_admission_history_status (status),
        KEY idx_admission_history_admission_status (admission_no, status)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE
    IF NOT EXISTS tablebarcode (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        barcode_number VARCHAR(191) NOT NULL,
        status TINYINT (1) NOT NULL DEFAULT 1,
        isSnowWorld TINYINT (1) NOT NULL DEFAULT 0,
        PRIMARY KEY (id),
        UNIQUE KEY uq_tablebarcode_barcode_number (barcode_number)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;