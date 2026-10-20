# Mastershot Studio — 网站源码（GitHub Pages）

李嘉伟 / Mastershot Studio 作品集网站的完整静态源码。没有构建步骤，改完直接提交，GitHub Pages 自动更新。

- **GitHub Pages 地址（建好后）**：<https://jasonjoingithub.github.io/mastershot/>
- **自定义域名**：`mastershot.cc`（已注册并绑定）

---

## 一、一次性发布（5 步，网页操作，不用装软件）

1. 登录 GitHub，打开 <https://github.com/new>
2. 仓库名填 `mastershot`，选 **Public**，点 **Create repository**
3. 在空仓库页点 **uploading an existing file**；把本文件夹里的**所有内容**拖进去  
   （要看到 `index.html` 在仓库最外层，不要把它套在子文件夹里）
4. 点 **Commit changes**
5. 进入 **Settings → Pages**：
   - Source 选 **Deploy from a branch**
   - Branch 选 **main**，目录选 **/ (root)**
   - 点 **Save**

等 1–2 分钟，打开：

**https://jasonjoingithub.github.io/mastershot/**

手机和电脑用同一个网址，不需要另外做手机版。

---

## 二、以后怎么改

### 改文字 / 项目 / 预告片

1. 在 GitHub 仓库点开 `content.js`
2. 点右上角铅笔图标
3. 改完点 **Commit changes**
4. 约 1 分钟后线上自动更新

`content.js` 已经排成多行，每个项目一段，直接改引号里的中文即可。

### 换海报 / 加图片

1. 把图片放进 `assets/opt/`，文件名用英文或数字（例如 `poster-new-01.webp`）
2. 在 `content.js` 里把 `poster`、`still` 或 `stills` 改成对应路径
3. Commit

### 改样式 / 交互

改 `fixes.css` 或 `script.js` 后，把 `index.html` 末尾的版本号改一下，例如：

`fixes.css?v=20261019-2330` → `fixes.css?v=20261019-2400`

这样浏览器不会继续用旧缓存。

---

## 三、自定义域名

`Mastershot.com` 已被注册（1998 年起），无法直接注册。当前可注册、适合这个站的有：

- **mastershot.cc**（当前使用）
- **mastershotfilm.com**（想要 .com 的话）
- mastershot.design / mastershot.tv

购买后：

1. GitHub 仓库 **Settings → Pages → Custom domain** 填域名，保存
2. 在域名商 DNS 里加记录：
   - `www` → CNAME → `jasonjoingithub.github.io`
   - 根域名（`@`）→ A 记录：
     `185.199.108.153`、`185.199.109.153`、`185.199.110.153`、`185.199.111.153`
3. 回到 Pages 勾选 **Enforce HTTPS**

GitHub Pages 服务器在美国，不需要 ICP 备案；域名本身需要实名认证。

---

## 四、文件说明

- `index.html`：页面结构
- `content.js`：全部内容（项目、简介、预告片、三部曲），主要改这个
- `styles.css` / `blur.css` / `fixes.css`：样式
- `script.js`：交互
- `assets/opt/`：压缩后的图片（文件名都是英文/数字，手机上不会乱码）
- `assets/favicon/`：图标
- `404.html`：404 页面
- `.nojekyll`：告诉 GitHub Pages 不要用 Jekyll 处理
- `_headers`：Netlify / Cloudflare 的缓存配置，GitHub Pages 会忽略，不影响

---

## 五、手机适配

- 已在 320 / 360 / 390 宽度测试：无横向滚动，标题不截断
- 作品集两列、详情海报两列、三部曲单列
- 手机和电脑使用同一个链接
- 页面 UTF-8，图片路径全部英文/数字，不会乱码

---

## 六、版权说明

海报、剧照版权归原片方所有，仅用于李嘉伟个人作品集展示。公开仓库如不希望展示原图，可改为私有仓库 + 付费 Pages，或只保留个人工作照。
