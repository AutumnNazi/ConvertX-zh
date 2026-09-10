![ConvertX](images/logo.png)

# ConvertX 中文版（ConvertX-zh）

[![上游项目](https://img.shields.io/badge/ConvertX-C4illin%2FConvertX-blue?logo=github)](https://github.com/C4illin/ConvertX)
[![Docker](https://github.com/C4illin/ConvertX/actions/workflows/docker-publish.yml/badge.svg?branch=main)](https://github.com/C4illin/ConvertX/actions/workflows/docker-publish.yml)
[![GitHub Release](https://img.shields.io/github/v/release/C4illin/ConvertX)](https://github.com/C4illin/ConvertX/releases)

自托管在线文件转换服务，支持超过一千种格式。基于 TypeScript、Bun 与 Elysia 构建。

本仓库是 [ConvertX](https://github.com/C4illin/ConvertX) 的中文界面版本，在上游能力基础上增加了 **英文 / 简体中文** 多语言切换。

## 特性

- 文件格式互转
- 支持一次处理多个文件
- 密码保护
- 多账户
- 多语言界面（English / 简体中文），可在页头切换

## 支持的转换器

| 转换器                                                     | 用途           | 可输入格式数 | 可输出格式数 |
| ---------------------------------------------------------- | -------------- | ------------ | ------------ |
| [Inkscape](https://inkscape.org/)                          | 矢量图         | 7            | 17           |
| [libjxl](https://github.com/libjxl/libjxl)                 | JPEG XL        | 11           | 11           |
| [resvg](https://github.com/RazrFalcon/resvg)               | SVG            | 1            | 1            |
| [Vips](https://github.com/libvips/libvips)                 | 图片           | 45           | 23           |
| [libheif](https://github.com/strukturag/libheif)           | HEIF           | 2            | 4            |
| [XeLaTeX](https://tug.org/xetex/)                          | LaTeX          | 1            | 1            |
| [Calibre](https://calibre-ebook.com/)                      | 电子书         | 26           | 19           |
| [LibreOffice](https://www.libreoffice.org/)                | 文档           | 41           | 22           |
| [Dasel](https://github.com/TomWright/dasel)                | 数据文件       | 5            | 4            |
| [Pandoc](https://pandoc.org/)                              | 文档           | 43           | 65           |
| [msgconvert](https://github.com/mvz/email-outlook-message-perl) | Outlook 邮件 | 1            | 1            |
| VCF 转 CSV                                                 | 通讯录         | 1            | 1            |
| [dvisvgm](https://dvisvgm.de/)                             | 矢量图         | 4            | 2            |
| [ImageMagick](https://imagemagick.org/)                    | 图片           | 245          | 183          |
| [GraphicsMagick](http://www.graphicsmagick.org/)           | 图片           | 167          | 130          |
| [Assimp](https://github.com/assimp/assimp)                 | 3D 资源        | 77           | 23           |
| [FFmpeg](https://ffmpeg.org/)                              | 视频           | ~472         | ~199         |
| [Potrace](https://potrace.sourceforge.net/)                | 位图转矢量     | 4            | 11           |
| [VTracer](https://github.com/visioncortex/vtracer)         | 位图转矢量     | 8            | 1            |
| [Markitdown](https://github.com/microsoft/markitdown)      | 文档           | 6            | 1            |
| [pdftops](https://poppler.freedesktop.org/)                | 文档           | 1            | 2            |

<!-- many ffmpeg fileformats are duplicates -->

缺少某个转换器？欢迎提 Issue 或 PR！

## 部署

> [!WARNING]
> 若无法登录，请确认通过 localhost 或 HTTPS 访问；否则请将 `HTTP_ALLOWED=true`。

```yml
# docker-compose.yml
services:
  convertx:
    image: ghcr.io/c4illin/convertx
    container_name: convertx
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - JWT_SECRET=aLongAndSecretStringUsedToSignTheJSONWebToken1234 # 未设置时会使用 randomUUID()
      # - HTTP_ALLOWED=true # 非 HTTPS 访问时取消注释
      # - LANGUAGE=zh-CN # 默认界面语言（也可用页头切换）
    volumes:
      - ./data:/app/data
```

或：

```bash
docker run -p 3000:3000 -v ./data:/app/data ghcr.io/c4illin/convertx
```

然后在浏览器打开 `http://localhost:3000` 创建账户。请勿在未配置的情况下暴露到公网，否则任何人都能注册第一个账户。

若提示无法打开数据库文件，请对数据目录执行 `chown -R $USER:$USER path`。

### 环境变量

以下均为可选，建议设置 `JWT_SECRET`。

| 变量名 | 默认值 | 说明 |
| ------ | ------ | ---- |
| JWT_SECRET | 未设置时使用 randomUUID() | 用于签名 JWT 的长随机字符串 |
| ACCOUNT_REGISTRATION | false | 是否允许用户注册账户 |
| HTTP_ALLOWED | false | 是否允许 HTTP 连接，仅建议本地开启 |
| ALLOW_UNAUTHENTICATED | false | 是否允许未登录使用，仅建议本地开启 |
| AUTO_DELETE_EVERY_N_HOURS | 24 | 每隔 n 小时清理超过 n 小时的文件，设为 0 禁用 |
| WEBROOT | | 根路径前缀，设为 `/convert` 时站点位于 `example.com/convert/` |
| FFMPEG_ARGS | | 传给 ffmpeg 输入的参数，如 `-hwaccel vaapi`，硬件加速见 [issue #190](https://github.com/C4illin/ConvertX/issues/190) |
| FFMPEG_OUTPUT_ARGS | | 传给 ffmpeg 输出的参数，如 `-preset veryfast` |
| HIDE_HISTORY | false | 隐藏历史记录页 |
| LANGUAGE | en | 默认界面/日期语言（[BCP 47](https://en.wikipedia.org/wiki/IETF_language_tag)），如 `en`、`zh-CN`；浏览器 `Accept-Language` 与页头语言切换优先 |
| UNAUTHENTICATED_USER_SHARING | false | 未登录用户共享转换历史 |
| MAX_CONVERT_PROCESS | 0 | 最大并发转换进程数，0 表示不限制 |
| PORT | 3000 | 监听端口 |

### Docker 镜像

`:latest` 随每次发布更新，`:main` 随 main 分支推送更新；日常使用推荐 `:latest`。

镜像可在 [GitHub Container Registry](https://github.com/C4illin/ConvertX/pkgs/container/ConvertX) 与 [Docker Hub](https://hub.docker.com/r/c4illin/convertx) 获取。

| 镜像 | 说明 |
| ---- | ---- |
| `image: ghcr.io/c4illin/convertx` | ghcr 最新 release |
| `image: ghcr.io/c4illin/convertx:main` | ghcr main 最新提交 |
| `image: c4illin/convertx` | Docker Hub 最新 release |
| `image: c4illin/convertx:main` | Docker Hub main 最新提交 |

### 部署教程

> [!NOTE]
> 以下教程来自第三方，可能过时或不准确。

- 中文教程：<https://xzllll.com/24092901/>
- 法语教程：<https://belginux.com/installer-convertx-avec-docker/>
- 波兰语教程：<https://www.kreatywnyprogramista.pl/convertx-lokalny-konwerter-plikow>

## 界面预览

![ConvertX Preview](images/preview.png)

## 本地开发

0. 安装 [Bun](https://bun.sh/) 与 Git
1. 克隆仓库
2. `bun install`
3. `bun run dev`

欢迎提交 PR。Issue 中标记 “converter request” 的通常较易实现；文档与 issue 整理同样欢迎。

提交信息请使用 [Conventional Commits](https://www.conventionalcommits.org/zh/v1.0.0/)。

## 致谢

本项目基于上游 [C4illin/ConvertX](https://github.com/C4illin/ConvertX) 汉化与维护。若你只需要英文原版，请优先使用上游仓库。
