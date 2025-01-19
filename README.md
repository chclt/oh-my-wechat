# OhMyWeChat

这是一个为微信设计的备份阅读器，总体上还原了微信，但经过了无数的重新设计，看起来焕然一新~  
以及，刚刚糊完（不是）做完的微信年度数据报告

[关注我的 Telegram 频道](https://t.me/chclt_hi) | [关注我的 Twitter](https://twitter.com/realChclt)

![Oh My WeChat Components](https://github.com/user-attachments/assets/e46e4db9-5cd3-4a5a-952e-320044b8630e)

![WeChat Wrapped 2024](https://github.com/user-attachments/assets/76b31eca-c671-43a9-8aa4-cb77e396e41c)


## 注意

- 所有数据均在本地处理。
- 部分图片资源（如头像等）通过网址从微信自己的服务器获取，如果你介意这一部分请求可能造成的隐私泄露，你可以在页面加载完成后断开网络，所有功能依然能够正常使用。
- Safari 和 Arc 浏览器因为一些技术原因暂无法适配，软件在最新版 Chrome 以及 FireFox 下测试可用。
- 为了防止可能发生的浏览器插件造成的隐私泄露，建议在无痕模式下打开本产品。

## 使用说明

1. 连接你的 iPhone / iPad 到电脑，第一步是通过苹果官方的 iTunes 备份你的设备到电脑上。如果你使用 Mac，备份的功能已经交给访达，你不需要安装任何额外软件。备份的时候记得勾选“不加密”。

> 注：并不是使用微信自带的“迁移聊天记录到电脑”的功能，而是使用 Windows 下的 iTunes 或 Mac 下的访达，所以使用 OhMyWeChat 需要一台 iPhone/iPad 和一台 Windows/Mac 电脑。

<img width="376" alt="Backup iOS device with Finder on Mac" src="https://github.com/user-attachments/assets/6ea81d05-3cdc-4752-9f16-c4b1caa87379" />

2. 等待备份完成后，你的备份文件应该位于 Windows 下的 `C:\用户\(用户名)\AppData\Roaming\Apple Computer\MobileSync\Backup\` 或 Mac 下的 `~/Library/Application Support/MobileSync/Backup`（在访达中你可以使用快捷键 <kbd>Command</kbd> + <kbd>Shift</kbd> + <kbd>G</kbd> 快速打开这个文件夹），我们需要的文件夹是其中名如 `xxxxxxxx-xxxxxxxxxxxxxxxx` 的那一个。
3. 出于安全考虑，浏览器应该不会允许你在网页中直接打开上面这两个文件夹，所以你需要把所需的 `xxxxxxxx-xxxxxxxxxxxxxxxx` 文件夹移动到系统目录以外的地方。
4. 在 OhMyWeChat 中打开刚才准备好的文件夹，出于不同浏览器中不同的接口调用，Chrome 浏览器会询问你是否允许网页访问该文件夹，而 FireFox 会询问你是否要上传整个文件夹，请选择允许。事实上 OhMyWeChat 并不会“上传”任何数据，所有数据不会离开本地，这里的“上传”只是浏览器对于网页操作文件的一种广义描述，请放心~
