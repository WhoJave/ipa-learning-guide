# 新增语言发音导读

新增页面独立于英语页面。原有 `dist/index.html`、英语 CSS/JavaScript、209 项英语录音、数据与工作流保持原样；没有部署操作。

| 页面 | 路径 | 内容 |
| --- | --- | --- |
| 新增语言入口 | `dist/languages.html` | 英语、日语、韩语导航 |
| 日语 | `dist/japanese/index.html` | 46 基础假名、25 浊/半浊音、33 拗音；平片切换与对照；104 个本地录音；长音、促音、拨音、助词、清化、声调边界和扩展片假名说明 |
| 韩语 | `dist/korean/index.html` | 21 元音字母、19 辅音字母；40 个本地示范录音；初中终声拼字器；七类代表收音及连音、鼻音化、流音化、送气化、腭化、紧音化、双收音说明 |

搜索、卡片详情、停止/重播、按语言隔离的本地学习记录、先认字再揭示读音的记忆练习都位于新页面。显示的罗马字用于索引，不能按英语或中文读法套用。

## 本地查看

```bash
python3 -m http.server 8000 --directory dist
```

打开 `http://localhost:8000/languages.html`。原英语入口仍为 `http://localhost:8000/`。网站运行无需安装 Node 依赖。

## 音频与资料

- 日语假名教学及录音：https://www.tofugu.com/japanese/learn-hiragana/
- 片假名教学：https://www.tofugu.com/japanese/learn-katakana/
- 韩语字母对应的示范音频：https://hangul.fun/
- 字母、罗马字及音值环境：https://www.korean.go.kr/front_eng/roman/roman_01.do
- 韩国标准发音法：https://www.korean.go.kr/kornorms/m/m_regltn.do?regltn_code=0002

韩语辅音按钮按原音源的字母对应关系播放示范。字母名称与加元音的拼字示例另列为文字，不把它们声称为当前录音内容。`ㅇ` 在初声无音，按钮明确标记为收音示范。韩语辅音和日语拨音的实际音值都受语境影响。

144 项新增录音单独保存在 `dist/language-audio/`，对应来源、字母、解码状态、时长和未专家听审标记见 `dist/language-audio-report.json`。音频保持原速，没有 TTS 回退。音源中的 ㅉ 仅有 OGG，下载脚本将其转码成 MP3，没有改变播放速度。下载、完整解码和 DOM 播放路由检查不能代替真实设备试听或专家逐音听审。

中文说明原创整理；音频权利归原权利人。本页为入门导读，不覆盖完整语法、词汇、方言、日语词汇声调或全部韩语音变。扩展片假名只列文字说明，未配置独立录音。

## 生成与验证

```bash
python3 create_language_content.py
python3 download_language_audio.py  # 需要联网和 ffmpeg/ffprobe
npm ci
npm test
```

数据与音频脚本只操作新增语言文件。自动化覆盖全部新增卡片/详情的本地录音路由、平片切换、分类数量、搜索、记录隔离、记忆练习、停止/重播、播放失败、异步竞争、已知韩语音节与拼字边界、相对资源引用；同时运行原有英语回归测试。没有执行真实浏览器或设备试听。
