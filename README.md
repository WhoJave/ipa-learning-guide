# IPA Learning Guide · Sound Atlas

代码仓库：https://github.com/WhoJave/ipa-learning-guide

GitHub Pages 暂不部署。

静态 HTML / CSS / JavaScript 学习网站。英式采用传统 RP 教学转写，美式采用 General American；并非完整 IPA 总表。

## 运行

```bash
cd dist
python3 -m http.server 8000
```

访问 http://localhost:8000 。不需要 Node 依赖或编译。

## 发音

- 英式音素示范：Oxford Dictionary 教学录音，来源链见 SOURCES.md；如下载失败则显示真实失败，不使用 TTS。
- 英美例词：Google 字典公开词语录音，保存在 dist/audio。音标卡片播放独立美式音素录音（American IPA Chart）；例词按钮播放整词，两者分开。/ɪr er ʊr/ 为元音与 /ɹ/ 分音示范，明确标注，不当作自然连贯音节。音源合并 /ʌ ə/、/ɝ ɚ/ 的孤立音质示范；重读与弱读请在例词中对照。
- 本地优先，外链仅在本地录音未取得时使用。所有示范保持原速；不通过调 playbackRate 改变音高。
- assets-report.json 记录每项下载状态。HTTP/解码检查不等于专家听审，所有未听审状态保持明确。
- 没有 speechSynthesis、语音识别评分或自动准确率承诺。

## 内容范围

44 项传统英式音素、通用美式映射与 R 音化、拼读规则和例外、重音/弱读/连读、易混音、浏览器本地学习记录。

## 验证

`node --check dist/app.js`；44 音素与分类完整性、HTML 引用与交互目标检查；音频通过 ffprobe 解码检查；`npm ci && npm test` 验证英美全部音标路由、独立例词按钮、切换停止/重播、失败与异步竞争；209 项录音使用 ffmpeg 完整解码。DOM 自动化不等于真实设备试听，未完成专家逐音听审。

## GitHub Pages

静态根目录：`dist`。`.github/workflows/pages.yml` 仅在手动触发时校验代码和音频文件，然后部署整个 `dist`；普通代码推送不触发部署。仓库 Settings → Pages → Source 选择 GitHub Actions。所有 CSS、JS 和音频引用采用相对路径，支持 `/ipa-learning-guide/` 子目录。

IPA 是跨语言的记音工具。本项目目前聚焦英语英美口音；声调、其他语言的完整 IPA 总表和带答案的转写训练仍属于后续扩展范围。
