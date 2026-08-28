# BlockCertify — Verified QA Defect Log & Error Analysis (Top 6 Errors)

**Target System**: BlockCertify Protocol (Web, Mobile App, Backend API & Smart Contract)  
**Evaluation Scope**: Error Handling, Edge Cases, Stress Failures & Security Vulnerabilities  
**Total Documented Defects**: `6 Critical to Low Defects`  

---

## 🐞 Summary Defect Matrix for Developers

| Defect ID | Layer / Component | Defect Summary | Severity | Status |
| :--- | :--- | :--- | :---: | :---: |
| **`BUG-CRIT-001`** | Mobile Appium / QR Camera | Camera Permission Crash on Android 14 During QR Scan | **P0 - Critical** | **FAIL** |
| **`BUG-HIGH-002`** | Backend API / PostgreSQL | Connection Pool Timeout Under 250 Concurrent CSV Uploads | **P1 - High** | **FAIL** |
| **`BUG-HIGH-003`** | Web Frontend / Safari | window.print() Diploma PDF Clipping on WebKit | **P1 - High** | **FAIL** |
| **`BUG-MED-004`** | Blockchain / Polygon RPC | Ethers.js CALL_EXCEPTION Revert on Unindexed Hash | **P2 - Medium** | **FAIL** |
| **`BUG-MED-005`** | Security / Form Input | Unsanitized Holder Name Stored XSS Script Injection | **P2 - Medium** | **FAIL** |
| **`BUG-LOW-006`** | Mobile Offline / Queue | Duplicate Record Insertion on Rapid Sync Button Taps | **P3 - Low** | **FAIL** |

---

## 🔍 Detailed Error Descriptions & Reproduction Steps

### 1. `BUG-CRIT-001` — Camera Permission Crash on Android 14 During QR Scan
* **Severity**: `P0 - Critical` (Blocks core mobile verification feature)
* **Component**: `Mobile App (App.tsx / QRScannerActivity)`
* **Steps to Reproduce**:
  1. Install mobile APK on Android 14 emulator with clean permissions.
  2. Tap `🔍 Verify` tab in bottom navigation bar.
  3. Tap `📷 Scan QR Code` button without granting camera permission.
* **Error Stack Trace**:
  ```text
  java.lang.SecurityException: Permission Denial: startCamera requires android.permission.CAMERA
      at com.blockcertify.mobile.camera.QRScannerActivity.startCamera(QRScannerActivity.java:48)
      at com.blockcertify.mobile.camera.QRScannerActivity.onCreate(QRScannerActivity.java:24)
  ```
* **Expected**: App prompts user with standard Android permission rationale modal before launching camera.
* **Actual**: App throws fatal `SecurityException` and crashes immediately.
* **Fix for Devs**: Wrap camera launch in `PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA)`.

---

### 2. `BUG-HIGH-002` — PostgreSQL Connection Pool Timeout Under 250 Concurrent CSV Uploads
* **Severity**: `P1 - High` (Affects high-concurrency institution operations)
* **Component**: `Express Backend API (POST /api/certificates/issue/batch)`
* **Steps to Reproduce**:
  1. Run 50 concurrent institution issuers uploading 100-record CSV spreadsheets (5,000 total records).
  2. Database connection pool max is set to default `20`.
* **Error Stack Trace**:
  ```text
  Error: Timeout: Connection pool exhausted (max 20 connections in use)
      at Pool.connect (/app/node_modules/pg-pool/index.js:184:11)
      at async issueBatchCertificates (/app/controllers/certificateController.js:92:18)
  ```
* **Expected**: Database transactions are queued asynchronously; requests complete under 3.5s.
* **Actual**: Backend hangs for 30s and responds with `HTTP 504 Gateway Timeout`.
* **Fix for Devs**: Increase PostgreSQL pool size (`max: 100`) and use BullMQ background job worker.

---

### 3. `BUG-HIGH-003` — window.print() Diploma PDF Clipping on Safari & iOS WebKit
* **Severity**: `P1 - High` (Impairs physical certificate printing for students)
* **Component**: `Web Frontend (CertificateCard.tsx / CSS Print Rules)`
* **Steps to Reproduce**:
  1. Open verified certificate on Safari desktop or iOS Safari.
  2. Click `Download PDF / Print Diploma` button.
* **Error Description**: `@media print` CSS rules fail to scale fixed-width elements on WebKit engines, truncating the right border, seal badge, and verification QR code.
* **Fix for Devs**: Add `@page { size: A4 landscape; margin: 10mm; }` and `#certificate-diploma-canvas { max-width: 100% !important; }`.

---

### 4. `BUG-MED-004` — Ethers.js CALL_EXCEPTION Revert on Unindexed Hash
* **Severity**: `P2 - Medium` (UI state lock on invalid search)
* **Component**: `Web3 Client (ethers.js / Polygon RPC Gateway)`
* **Steps to Reproduce**:
  1. Search 64-character zero-hash `0x0000000000000000000000000000000000000000000000000000000000000000` on `/verify/`.
* **Error Stack Trace**:
  ```text
  CALL_EXCEPTION: execution reverted (action="call", data="0x", code=CALL_EXCEPTION, version=6.17.0)
  ```
* **Expected**: Frontend displays 'Certificate Not Found' alert within 200ms.
* **Actual**: Unhandled promise rejection leaves the loading spinner active permanently.
* **Fix for Devs**: Catch `CALL_EXCEPTION` specifically in `try/catch` and set `searchResult = null`.

---

### 5. `BUG-MED-005` — Unsanitized Holder Name Allows Stored XSS in Badge
* **Severity**: `P2 - Medium` (Security Vulnerability)
* **Component**: `Certificate Issuance Form (Student Name TextInput)`
* **Steps to Reproduce**:
  1. In Issuer Portal, enter Student Name: `<img src=x onerror=alert(document.cookie)>`.
  2. Issue certificate and open Dashboard.
* **Error Description**: Script executes in the victim's browser session due to lack of HTML entity encoding.
* **Fix for Devs**: Sanitize and escape all input strings with `validator.escape()` before database write and JSX interpolation.

---

### 6. `BUG-LOW-006` — Duplicate Certificate Insertion on Rapid Re-Sync Taps
* **Severity**: `P3 - Low` (Data duplication edge case)
* **Component**: `Mobile Offline Storage (AsyncStorage / Sync Queue)`
* **Steps to Reproduce**:
  1. Save certificate in offline mode.
  2. Reconnect internet and tap `Sync Offline Records` 3 times rapidly.
* **Error Description**: Lack of client-side button debouncing sends 3 identical POST requests, creating 3 duplicate database rows.
* **Fix for Devs**: Add `disabled={isSyncing}` lock on button and add `UNIQUE(reg_number)` database constraint in PostgreSQL.
