# Encrypted local iOS backups

The adapter recognizes `Manifest.plist` (XML or binary), unlocks the backup
keybag with a user-supplied password, decrypts `Manifest.db`, then decrypts
requested files using the `Files.file` NSKeyedArchiver metadata. Unencrypted
exports without a plist remain supported. No source backup files are modified.

Cryptographic primitives are delegated to existing implementations:

- Web Crypto: PBKDF2-SHA256 followed by PBKDF2-SHA1, and RFC 3394 AES-KW.
  Iterations and salts come from the keybag. Legacy single-stage PBKDF2 is
  supported; iteration counts are bounded before derivation. AES-CBC validates
  and removes PKCS#7 padding from the final chunk of ordinary files.
- CryptoJS (existing project dependency): raw AES-CBC with a zero initial IV,
  processed in 1 MiB chunks. Valid PKCS#7 padding determines the plaintext
  length even when `MBFile.Size` is stale. If padding validation fails,
  `MBFile.Size` is used as a fallback for unpadded files. Unpadded content ending
  in a valid padding sequence cannot be distinguished from padded content and
  follows the padded path. Manifest.db accepts
  either page-aligned plaintext or one complete PKCS#7 padding block.
- [rork-plist](https://github.com/rorkai/rork-plist): XML/binary plist parsing,
  including UID references. Only the necessary MBFile fields are resolved.

Format reference: [iphone_backup_decrypt](https://github.com/jsharkey13/iphone_backup_decrypt).
The project implements format integration, not its own AES, key-wrap, PBKDF2,
or plist codec.

Compatibility choices follow existing libraries where real-device samples are
unavailable:

- [iOSbackup.getManifestDB](https://github.com/avibrazil/iOSbackup/blob/76666902d69c1758a673a9142e45cf8d6ed40210/iOSbackup/__init__.py#L1054)
  reads a plaintext manifest for versions before iOS 10.2. We accept an absent
  `ManifestKey` and require the stored database to have a valid SQLite header,
  page size and aligned length; the importer then opens and queries it as SQLite.
  This differs from its version-string check: we use the available fields and
  content, without requiring `Lockdown.ProductVersion`. A present but malformed
  key or failed decryption never falls back to plaintext. Password verification
  and file decryption still use the keybag.
- [iphone_backup_decrypt.unlockWithPassphrase](https://github.com/jsharkey13/iphone_backup_decrypt/blob/35984e59d76478ea4e0bc1086b2c0e2a5ad25ef2/src/iphone_backup_decrypt/google_iphone_dataprotection.py#L78)
  and [iOSbackup.unlockKeys](https://github.com/avibrazil/iOSbackup/blob/76666902d69c1758a673a9142e45cf8d6ed40210/iOSbackup/__init__.py#L1168)
  check `WRAP & 2`, rather than requiring `WRAP == 2`. We follow that check and
  require AES-KW integrity verification for both class and file keys. A synthetic
  `WRAP=3` case verifies this behavior; it does not establish support for actual
  device-bound keys. Keys without the password bit remain unsupported.

The legacy fixture combines single-stage PBKDF2, an absent `ManifestKey`, a
plaintext manifest and encrypted account files. It verifies decryption and
account-list reading, but is generated data, not a captured backup from an old iOS
device. These tests establish the chosen behavior, not coverage of every older
iOS version.

The existing directory mutation accepts `{ directory, password? }` as variables. The UI first loads
without a password and shows the password form only after a
`BackupPasswordRequiredError`, then retries the same directory. Error names cross
the worker boundary. Class keys remain non-extractable Web Crypto keys in the worker.
File controllers receive the encryption session explicitly alongside the directory
and databases; there is no module-level database-to-keybag registry.
Media URL release only uses the URI and the file registry. Shared adapter error
names live in `src/errors.ts`; WeChat account discovery remains in the worker.
Switching/unloading a backup disposes the keybag, closes the manifest database,
and clears direct-media URLs. Decryption buffers and the SQLite database still
consume memory; this is not a streaming database backend.

Scope: Finder/iTunes local backups using Manifest.db and password-wrapped class
keys. iCloud downloads, Manifest.mbdb backups, device-only keys, and sparse files
are unsupported. Non-block-aligned ciphertext, malformed metadata, and raw CBC
content shorter than its declared size fail explicitly. Real-device validation
across iOS versions is still needed.

`encryption.test.ts` compares decryption with independent plaintext fixtures and
covers legacy manifests, WRAP flags, padding/size differences and chunk boundaries.
`worker.test.ts` reads account IDs from modern and legacy synthetic backups using
the actual decryption, SQLite and account parsing code. It does not exercise
account database loading, UI password retries or worker messaging. Fixtures use
only synthetic data and reduced KDF iteration counts. Regenerate them with:

```sh
python3 packages/adapter-ios-backup/src/utils/encryption/test/generate.py
```

Fixture generation uses Python's standard plistlib/sqlite3 and Node's
OpenSSL-backed crypto, independently of the production parser and CryptoJS.
