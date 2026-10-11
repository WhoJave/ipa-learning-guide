# IPA Learning Guide · Sound Atlas

在线学习：https://WhoJave.github.io/ipa-learning-guide/

静态 HTML / CSS / JavaScript 学习网站。英式采用传统 RP 教学转写，美式采用 General American；并非完整 IPA 总表。

## 运行

```bash
cd dist
python3 -m http.server 8000
```

访问 http://localhost:8000 。不需要 Node 依赖或编译。

## 发音

- 英式音素示范：Oxford Dictionary 教学录音，来源链见 SOURCES.md；如下载失败则显示真实失败，不使用 TTS。
- 英美例词：Google 字典公开词语录音，保存在 dist/audio。美式音素通过例词定位，明确标注为整词录音，绝不把英式录音冒充美式。
- 本地优先，外链仅在本地录音未取得时使用。所有示范保持原速；不通过调 playbackRate 改变音高。
- assets-report.json 记录每项下载状态。HTTP/解码检查不等于专家听审，所有未听审状态保持明确。
- 没有 speechSynthesis、语音识别评分或自动准确率承诺。

## 内容范围

44 项传统英式音素、通用美式映射与 R 音化、拼读规则和例外、重音/弱读/连读、易混音、浏览器本地学习记录。

## 验证

`node --check dist/app.js`；44 音素与分类完整性、HTML 引用与交互目标检查；音频通过 ffprobe 解码检查；当前环境无浏览器 QA 能力，因此未做浏览器播放与专家听审。

## GitHub Pages

静态根目录：`dist`。`.github/workflows/pages.yml` 在每次推送 `main` 时校验代码和音频文件，然后部署整个 `dist`。仓库 Settings → Pages → Source 选择 GitHub Actions。所有 CSS、JS 和音频引用采用相对路径，支持 `/ipa-learning-guide/` 子目录。

IPA 是跨语言的记音工具。本项目目前聚焦英语英美口音；声调、其他语言的完整 IPA 总表和带答案的转写训练仍属于后续扩展范围。
