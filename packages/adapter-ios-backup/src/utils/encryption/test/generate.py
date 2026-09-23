"""Synthetic fixture, independent of the production JS parsers and crypto.

Run with Python 3 and Node.js. Uses plistlib, sqlite3 and Node's OpenSSL-backed
crypto. Password/keys are public test data. Iterations are reduced for fast tests.
"""
import base64
import json
import hashlib
import pathlib
import plistlib
import sqlite3
import subprocess
import tempfile


def b64(value):
    return base64.b64encode(value).decode()


def crypto(operation, payload):
    script = r"""
const {createCipheriv,pbkdf2Sync} = require('node:crypto');
const input = JSON.parse(require('node:fs').readFileSync(0,'utf8'));
const raw = s => Buffer.from(s,'base64');
function encrypt(name,key,iv,bytes,padding=false) {
  const cipher=createCipheriv(name,key,iv); cipher.setAutoPadding(padding);
  return Buffer.concat([cipher.update(bytes),cipher.final()]).toString('base64');
}
if (input.operation==='keys') {
  const first=input.legacy ? Buffer.from(input.password) : pbkdf2Sync(Buffer.from(input.password),raw(input.dpsl),1000,32,'sha256');
  const kek=pbkdf2Sync(first,raw(input.salt),100,32,'sha1');
  const wrap=(key,bytes)=>encrypt('id-aes256-wrap',key,Buffer.alloc(8,0xa6),bytes);
  console.log(JSON.stringify({classKey:wrap(kek,raw(input.classKey)),
    manifestKey:wrap(raw(input.classKey),raw(input.manifestKey)),
    fileKey:wrap(raw(input.classKey),raw(input.fileKey))}));
} else {
  console.log(JSON.stringify(encrypt('aes-256-cbc',raw(input.key),Buffer.alloc(16),raw(input.bytes),input.padding)));
}
"""
    return json.loads(subprocess.check_output(["node", "-e", script], input=json.dumps({"operation": operation, **payload}).encode()))


def tlv(tag, value):
    if isinstance(value, int):
        value = value.to_bytes(4, "big")
    return tag.encode() + len(value).to_bytes(4, "big") + value


password = " 测试🔑 backup "
class_key, manifest_key, file_key = (bytes([n]) * 32 for n in (11, 22, 33))
dpsl, salt = bytes(range(20)), bytes(range(20, 40))
wrapped = crypto("keys", dict(password=password, dpsl=b64(dpsl), salt=b64(salt),
                            classKey=b64(class_key), manifestKey=b64(manifest_key), fileKey=b64(file_key)))
keybag_fields = [
    ("VERS", 3), ("TYPE", 1), ("UUID", b"h" * 16), ("WRAP", 2),
    ("SALT", salt), ("ITER", 100), ("DPIC", 1000), ("DPSL", dpsl),
    ("UUID", b"c" * 16), ("CLAS", 4), ("WRAP", 2), ("KTYP", 0),
    ("WPKY", base64.b64decode(wrapped["classKey"])),
]
keybag = b"".join(tlv(tag, value) for tag, value in keybag_fields)
legacy_wrapped = crypto("keys", dict(password=password, salt=b64(salt), legacy=True,
                                   classKey=b64(class_key), manifestKey=b64(manifest_key), fileKey=b64(file_key)))
legacy_keybag = b"".join(tlv(tag, base64.b64decode(legacy_wrapped["classKey"]) if tag == "WPKY" else value)
                         for tag, value in keybag_fields if tag not in ("DPIC", "DPSL"))
manifest = dict(IsEncrypted=True, BackupKeyBag=keybag,
                ManifestKey=(4).to_bytes(4, "little") + base64.b64decode(wrapped["manifestKey"]))
plaintext = bytes(range(249)) + b"\x02\x02"
metadata = {
    "$archiver": "NSKeyedArchiver", "$version": 100000,
    "$top": {"root": plistlib.UID(2)},
    "$objects": ["$null", {"$classname": "MBFile"},
                 {"Size": len(plaintext), "ProtectionClass": 4, "EncryptionKey": plistlib.UID(3)},
                 {"NS.data": (4).to_bytes(4, "little") + base64.b64decode(wrapped["fileKey"])}],
}
file_plist = plistlib.dumps(metadata, fmt=plistlib.FMT_BINARY)
files = []
def add_file(relative_path, plain):
    file_metadata = {**metadata, "$objects": list(metadata["$objects"])}
    file_metadata["$objects"][2] = {**metadata["$objects"][2], "Size": len(plain)}
    files.append(dict(
        fileID=hashlib.sha1(("AppDomain-com.tencent.xin-" + relative_path).encode()).hexdigest(),
        relativePath=relative_path, plain=b64(plain),
        metadata=b64(plistlib.dumps(file_metadata, fmt=plistlib.FMT_BINARY)),
        encrypted=crypto("encrypt", dict(key=b64(file_key), bytes=b64(plain), padding=True)),
    ))

account_id = b"wxid_synthetic_a"
add_file("Documents/LocalInfo.data", b"\x0a" + bytes([len(account_id)]) + account_id)
for suffix in ("a", "b"):
    mmsetting = bytes(8)
    for field, value in [("86", "wxid_synthetic_" + suffix), ("88", "Test account " + suffix)]:
        encoded = b"\x00" + value.encode()
        mmsetting += bytes([len(field)]) + field.encode() + bytes([len(encoded)]) + encoded
    add_file("Documents/MMappedKV/mmsetting.archive." + suffix, mmsetting)

with tempfile.TemporaryDirectory() as temp:
    path = pathlib.Path(temp) / "Manifest.db"
    db = sqlite3.connect(path)
    db.execute("CREATE TABLE Files(fileID TEXT PRIMARY KEY, domain TEXT, relativePath TEXT, flags INTEGER, file BLOB)")
    db.execute("INSERT INTO Files VALUES(?,?,?,?,?)", ("a" * 40, "AppDomain-com.tencent.xin", "Documents/test.bin", 1, file_plist))
    for entry in files:
        db.execute("INSERT INTO Files VALUES(?,?,?,?,?)", (entry["fileID"], "AppDomain-com.tencent.xin", entry["relativePath"], 1, base64.b64decode(entry["metadata"])))
    db.commit()
    db.close()
    manifest_bytes = path.read_bytes()
fixture = {
    "files": files,
    "password": password,
    "manifestXml": b64(plistlib.dumps(manifest)),
    "manifestBinary": b64(plistlib.dumps(manifest, fmt=plistlib.FMT_BINARY)),
    # Synthetic legacy combination, not a captured backup from an old device.
    "manifestLegacy": b64(plistlib.dumps(dict(IsEncrypted=True, BackupKeyBag=legacy_keybag), fmt=plistlib.FMT_BINARY)),
    "manifestPlain": b64(manifest_bytes),
    "manifestEncrypted": crypto("encrypt", dict(key=b64(manifest_key), bytes=b64(manifest_bytes), padding=True)),
    "manifestUnpadded": crypto("encrypt", dict(key=b64(manifest_key), bytes=b64(manifest_bytes), padding=False)),
    "fileMetadata": b64(file_plist),
    "fileEncrypted": crypto("encrypt", dict(key=b64(file_key), bytes=b64(plaintext), padding=True)),
    "filePlain": b64(plaintext),
    "fileKey": b64(file_key),
}
pathlib.Path(__file__).with_name("fixture.json").write_text(json.dumps(fixture, indent=2) + "\n")
