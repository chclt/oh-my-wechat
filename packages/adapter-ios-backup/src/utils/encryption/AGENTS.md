# 解密代码维护约束

先读 [README.md](./README.md)：其中记录了参考库的固定版本、兼容选择及已知边界。

## 依据与范围

- 旧版 iOS 的真实备份样本不足。无法确认的格式细节，优先核对现成库源码；库之间有差异时，记录采用哪种行为及理由，不凭推测“纠正”格式。
- 参考实现主要是 `iphone_backup_decrypt`、`iOSbackup`，必要时交叉核对 `itunes-backup-explorer`。新增兼容判断应留下固定版本的源码链接和验证范围。
- 合成样本和跨库结果一致只能证明对应行为，不能据此宣称某个 iOS 版本已获真实备份验证。不要顺带扩展到 Manifest.mbdb、iCloud 或设备密钥解锁。
- 标准算法与 plist 编解码使用现成实现。当前采用 Web Crypto、CryptoJS、rork-plist；不手写密码学原语。

## 容易回退的兼容决策

- 普通文件完整读取密文，优先采用经过校验的 PKCS#7 长度；`MBFile.Size` 可能过期，仅作为无有效填充时的兼容回退。CryptoJS 的 `Pkcs7.unpad` 不负责完整填充校验。无填充内容恰好以合法填充序列结束存在歧义，不能声称已消除。
- `Manifest.db` 保留单独的 SQLite 校验路径。只有缺少 `ManifestKey` 时才尝试明文；字段损坏、密钥解包或解密失败不能触发明文回退。明文 manifest 不代表账号文件未加密，也不免除密码验证。
- `WRAP` 按位检查密码标志 `2`，并保留 AES-KW 完整性校验。合成 `WRAP=3` 成功不代表能恢复真实设备绑定密钥。
- 保留取消、释放密钥及错误分类行为。错误的 `name` 会跨 worker 边界被前端消费。不要持久化或记录密码、解密密钥与用户明文。

## 集成与风格

- 沿用现有适配器入口 `LoadDirectoryMutationOptions`、`LoadAccountDatabaseMutationOptions`。目录和可选密码通过 mutation variables 传入；首次不传密码，收到需要密码的错误后在原流程输入并重试。各步骤在自己的 JSX 中消费对应 mutation 的 error。
- 解密逻辑留在本目录。沿用现有代码风格；不要为本功能再抽 hook、组件、`BackupFileContext`，也不要自行重做导入 UI。不确定产品行为时问用户。
- 通用适配器错误定义在 `../../errors.ts`；微信业务判断留在业务层。外部备份数据在解析边界校验，内部调用信任已建立的约束，不重复防御。
- 没有伸缩需求的布局使用 grid；不要为了排列或对齐默认使用 flex。

## 验证

- 不因修复实现错误就自动增加永久测试；临时验证完成后删除。删除仅复述调用流程、内部状态或条件分支的测试。保留有独立预期结果的格式向量和有参考依据的兼容案例，避免生产代码自证。
- 合成 fixture 位于 `./test/`，由其中的 `generate.py` 使用 Python plistlib/sqlite3 和 Node OpenSSL 生成。不要加入用户备份或真实凭据。
- 从仓库根目录运行适配器测试与类型检查：
  - `packages/adapter-ios-backup/node_modules/.bin/vitest run --root packages/adapter-ios-backup`
  - `node_modules/.bin/tsc --noEmit -p packages/adapter-ios-backup/tsconfig.json`
- 运行相关格式、lint 检查；涉及浏览器或 worker 运行代码时验证 Web 构建。纯文档修改无需重复运行测试。
