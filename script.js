const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function createCard(project) {
  const card = document.createElement("article");
  card.className = "work-card";
  card.dataset.tags = project.tags.join(" ");
  card.dataset.id = project.id;
  card.innerHTML = `<img src="${project.poster}" alt="${project.title} 海报" loading="lazy" decoding="async"><div class="card-preview" aria-hidden="true"><div class="card-preview-media"><img src="${project.poster}" alt=""></div><button class="card-preview-play" type="button" aria-label="播放 ${project.title}">▶</button><span class="card-preview-label">PREVIEW / 预览</span></div><button class="play-hint" type="button">${project.trailer ? "▶ 预告片" : "项目详情"}</button><div class="work-card-content"><span class="type">${project.type}</span><h3>${project.title}</h3><p>${project.director ? `导演：${project.director}` : ""}${project.director && project.year ? " · " : ""}${project.year}</p><p class="role">${project.role}</p></div>`;
  card.querySelector(".play-hint")?.addEventListener("click", event => {
    event.stopPropagation();
    project.trailer ? openPlayback(project, card) : openProject(project, card);
  });
  card.querySelector(".card-preview-play")?.addEventListener("click", event => {
    event.stopPropagation();
    project.trailer ? openPlayback(project, card) : openProject(project, card);
  });
  let previewTimer;
  card.addEventListener("pointerenter", () => {
    if (!project.trailer) return;
    window.clearTimeout(previewTimer);
    previewTimer = window.setTimeout(() => showCardPreview(card, project), 2000);
  });
  card.addEventListener("pointerleave", () => {
    window.clearTimeout(previewTimer);
    hideCardPreview(card);
  });
  card.addEventListener("click", () => openProject(project, card));
  return card;
}

function showCardPreview(card, project) {
  const media = card.querySelector(".card-preview-media");
  if (!media) return;
  const embed = youtubeEmbed(project.trailer, { autoplay:1, mute:1, controls:0 });
  if (embed) {
    media.innerHTML = `<iframe src="${embed}" title="${project.title} 预览" allow="autoplay; encrypted-media; picture-in-picture; web-share" allowfullscreen referrerpolicy="origin"></iframe>`;
  } else if (project.trailer && /\.(mp4|webm|ogg)(\?|$)/i.test(project.trailer)) {
    media.innerHTML = `<video src="${project.trailer}" muted loop autoplay playsinline poster="${project.poster}"></video>`;
  }
  card.classList.add("is-previewing");
}

function hideCardPreview(card) {
  const media = card.querySelector(".card-preview-media");
  if (!media) return;
  card.classList.remove("is-previewing");
  window.setTimeout(() => {
    if (!card.matches(":hover")) media.innerHTML = `<img src="${card.querySelector("img")?.src || ""}" alt="">`;
  }, 260);
}

let playbackState = { scrollY:0, activeElement:null, projects:[], index:0, projectViewOpen:false, projectViewScroll:0 };
let projectReturnFocus = null;
let projectScrollBefore = 0;

function openPlayback(project, returnCard = null) {
  const modal = $("#trailer-modal");
  playbackState = {
    scrollY:window.scrollY,
    activeElement:returnCard || document.activeElement,
    projects:SITE.projects.filter(item => item.trailer),
    index:0,
    projectViewOpen:$("#project-view").classList.contains("is-open"),
    projectViewScroll:$("#project-view-scroll").scrollTop
  };
  playbackState.index = Math.max(0, playbackState.projects.findIndex(item => item.id === project.id));
  renderPlayback(project);
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("trailer-open");
}

function renderPlayback(project) {
  const frame = $("#trailer-modal-frame");
  const embed = youtubeEmbed(project.trailer, { autoplay:1, controls:1 });
  const youtubeSource = /(?:youtube\.com|youtu\.be)/i.test(project.trailer || "");
  frame.innerHTML = embed
    ? `<iframe class="player-frame" src="${embed}" title="${project.title} 预告片" allow="autoplay; encrypted-media; picture-in-picture; web-share" allowfullscreen referrerpolicy="origin"></iframe>${externalPlayerLink(project)}`
    : youtubeSource
      ? externalPlaybackMarkup(project)
    : project.trailer && /\.(mp4|webm|ogg)(\?|$)/i.test(project.trailer)
      ? `<video src="${project.trailer}" controls autoplay playsinline poster="${project.poster}"></video>`
      : `<div class="playback-poster"><img src="${project.poster}" alt="${project.title} 海报"><span>该项目暂无可播放片段</span></div>`;
  primePlayerSurface(frame, project);
  addPlayerCover(frame, project);
  $("#trailer-modal-title").textContent = project.title;
  $("#trailer-modal-meta").textContent = `${project.type}${project.year ? ` / ${project.year}` : ""}`;
}

function isBilibili(url = "") {
  return /bilibili\.com\/video\//i.test(url);
}

function externalPlayerLink(project) {
  return isBilibili(project.trailer)
    ? `<a class="player-external-link" href="${project.trailer}" target="_blank" rel="noopener noreferrer">在 B 站打开 ↗</a>`
    : "";
}

function externalPlaybackMarkup(project) {
  return `<div class="playback-external"><img src="${project.poster}" alt="${project.title} 预告片封面"><div class="playback-external-copy"><span>LOCAL FILE PREVIEW / 本地预览模式</span><p>浏览器以 file:// 打开时，YouTube 不允许嵌入播放。</p><a href="${project.trailer}" target="_blank" rel="noopener noreferrer">在 YouTube 播放 ↗</a></div></div>`;
}

function inlineTrailerMarkup(project) {
  const embed = youtubeEmbed(project.trailer, { autoplay:1, controls:1 });
  if (embed) return `<iframe class="player-frame" src="${embed}" title="${project.title} 预告片" allow="autoplay; encrypted-media; picture-in-picture; web-share" allowfullscreen referrerpolicy="origin"></iframe>${externalPlayerLink(project)}<button class="project-trailer-close" type="button" aria-label="关闭播放并返回作品">X</button>`;
  if (project.trailer && /\.(mp4|webm|ogg)(\?|$)/i.test(project.trailer)) return `<video src="${project.trailer}" controls autoplay playsinline poster="${project.poster}"></video>`;
  if (/(?:youtube\.com|youtu\.be)/i.test(project.trailer || "")) return externalPlaybackMarkup(project);
  return `<div class="playback-poster"><img src="${project.poster}" alt="${project.title} 海报"><span>该项目暂无可播放片段</span></div>`;
}

function addPlayerCover(container, project) {
  if (!container) return;
  const poster = project?.trailerPoster || project?.still || project?.poster;
  const iframe = $("iframe.player-frame", container);
  if (!poster || !iframe) return;
  const cover = document.createElement("div");
  cover.className = "player-poster-cover";
  cover.style.backgroundImage = `url("${poster}")`;
  container.appendChild(cover);
  const hide = () => {
    if (!cover.isConnected) return;
    cover.classList.add("is-hidden");
    window.setTimeout(() => cover.remove(), 450);
  };
  iframe.addEventListener("load", () => window.setTimeout(hide, 400), { once:true });
  window.setTimeout(hide, 1500);
}

function playProjectTrailerInline(project, container) {
  if (!container) return;
  container.classList.add("is-playing");
  container.innerHTML = inlineTrailerMarkup(project);
  primePlayerSurface(container, project);
  addPlayerCover(container, project);
  container.querySelector(".project-trailer-close")?.addEventListener("click", event => {
    event.stopPropagation();
    closeProject();
  });
}

function primePlayerSurface(container, project) {
  if (!container) return;
  const poster = project?.trailerPoster || project?.still || project?.poster;
  if (poster) container.style.setProperty("--player-poster", `url("${poster}")`);
  container.classList.add("player-loading");
  const iframe = $("iframe.player-frame", container);
  if (!iframe) {
    container.classList.remove("player-loading");
    return;
  }
  const reveal = () => container.classList.remove("player-loading");
  iframe.addEventListener("load", () => window.setTimeout(reveal, 180), { once:true });
  window.setTimeout(reveal, 900);
}

function closePlayback() {
  const modal = $("#trailer-modal");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  $("#trailer-modal-frame").innerHTML = "";
  document.body.classList.remove("trailer-open");
  if (playbackState.projectViewOpen) {
    $("#project-view-scroll").scrollTop = playbackState.projectViewScroll;
  } else {
    window.scrollTo({ top:playbackState.scrollY, behavior:"instant" });
  }
  if (playbackState.activeElement && typeof playbackState.activeElement.focus === "function") playbackState.activeElement.focus({ preventScroll:true });
}

function stepPlayback(direction) {
  if (!playbackState.projects.length) return;
  playbackState.index = (playbackState.index + direction + playbackState.projects.length) % playbackState.projects.length;
  renderPlayback(playbackState.projects[playbackState.index]);
}

function renderProjects(filter = "all") {
  const grid = $("#work-grid");
  grid.innerHTML = "";
  SITE.projects.filter(project => filter === "all" || project.tags.includes(filter)).forEach(project => grid.appendChild(createCard(project)));
}

function youtubeEmbed(url, options = {}) {
  if (!url) return "";
  const autoplay = options.autoplay ? 1 : 0;
  const mute = options.mute ? 1 : 0;
  const controls = options.controls === 0 ? 0 : 1;
  const localFile = window.location.protocol === "file:";
  // Local file previews do not send an HTTP referrer, which can trigger
  // YouTube error 153. A stable origin keeps the iframe configuration valid.
  const origin = window.location.protocol === "file:" ? "https://www.youtube.com" : window.location.origin;
  const params = new URLSearchParams({ autoplay, mute, controls, rel:0, modestbranding:1, playsinline:1, origin, enablejsapi:1 });
  const youtube = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/i);
  if (youtube) return localFile ? "" : `https://www.youtube.com/embed/${youtube[1]}?${params.toString()}`;
  const playlist = url.match(/[?&]list=([\w-]+)/i);
  if (playlist) return localFile ? "" : `https://www.youtube.com/embed/videoseries?list=${playlist[1]}&${params.toString()}`;
  const bilibili = url.match(/bilibili\.com\/video\/(BV[\w]+)/i);
  if (bilibili) {
    // 画质策略：先请求 1080P 高码率（qn=112）。B 站对未登录用户会自动回退到
    // 该视频可用的最高画质（实测为 720P），不会从 360P 开始。
    // 注意：player.bilibili.com 的旧外链播放器会忽略 qn，默认 360P；
    // 这里使用 B 站移动端 HTML5 播放器，才能拿到 720P/1080P 的直出流。
    const params = new URLSearchParams({
      bvid: bilibili[1],
      page: 1,
      qn: SITE.biliQn?.[bilibili[1]] || 112,
      high_quality: 1,
      autoplay: autoplay || 0,
      danmaku: 0,
      as_wide: 1
    });
    if (mute) params.set("muted", 1);
    return `https://www.bilibili.com/blackboard/html5mobileplayer.html?${params.toString()}`;
  }
  return "";
}

function playTriangle() {
  return `<svg class="play-triangle" viewBox="0 0 100 120" aria-hidden="true"><path d="M12 10 L90 60 L12 110 Z" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}

function projectTrailer(project) {
  // Start with a visible trailer frame; the player is created only after click.
  // This prevents the black loading state while keeping playback in this page.
  const embed = youtubeEmbed(project.trailer, { controls:1 });
  if (embed) {
    const poster = project.trailerPoster || project.still || project.poster;
    return `<div class="project-trailer project-trailer-poster"><img class="trailer-poster-image" src="${poster}" alt="${project.title} 预告片画面" loading="eager"><button type="button" class="trailer-play triangle-play detail-play" data-playback="${encodeURIComponent(project.id)}" aria-label="播放 ${project.title}">${playTriangle()}</button></div>`;
  }
  if (project.trailer && /\.(mp4|webm|ogg)(\?|$)/i.test(project.trailer)) return `<div class="project-trailer"><video src="${project.trailer}" controls playsinline poster="${project.poster}"></video><span class="trailer-caption">PLAY TRAILER / 预告片</span></div>`;
  if (project.trailer && /(?:youtube\.com|youtu\.be)/i.test(project.trailer)) return `<div class="project-trailer project-trailer-poster"><img src="${project.poster}" alt="${project.title} 预告片封面"><button type="button" class="trailer-play triangle-play detail-play" data-playback="${encodeURIComponent(project.id)}" aria-label="播放 ${project.title}">${playTriangle()}</button><span class="trailer-caption">PLAY TRAILER / 播放预告片</span></div>`;
  if (project.trailerPage && !project.trailer) return `<div class="project-trailer project-trailer-poster"><img src="${project.poster}" alt="${project.title} 官方页面封面"><a class="trailer-play detail-external-link official-link" href="${project.trailerPage}" target="_blank" rel="noopener noreferrer" aria-label="打开 ${project.title} 官方页面">↗</a><span class="trailer-caption">OPEN OFFICIAL PAGE / 打开官方页面</span></div>`;
  if (project.trailerPage) return `<div class="project-trailer project-trailer-poster"><img src="${project.poster}" alt="${project.title} 预告片封面"><button type="button" class="trailer-play triangle-play detail-play" data-playback="${encodeURIComponent(project.id)}" aria-label="播放 ${project.title}">${playTriangle()}</button><span class="trailer-caption">PLAY TRAILER / 播放预告片</span></div>`;
  return `<div class="project-trailer project-trailer-poster"><img src="${project.poster}" alt="${project.title} 海报"><span class="trailer-wait">预告片链接待补充</span></div>`;
}

function openProject(project, returnCard = null, pushHistory = true) {
  if (pushHistory) projectScrollBefore = window.scrollY;
  const view = $("#project-view");
  const shots = project.stills?.length ? project.stills : [project.still || project.poster];
  const gallery = shots.map((src, index) => `<figure><img src="${src}" alt="${project.title} 剧照 ${index + 1}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${project.poster}'"></figure>`).join("");
  projectReturnFocus = returnCard || document.activeElement;
  $("#project-view-content").innerHTML = `<article class="project-detail"><div class="project-detail-hero"><div class="project-detail-media">${projectTrailer(project)}</div><div class="project-detail-title"><span class="eyebrow">${project.type}${project.year ? ` / ${project.year}` : ""}</span><h1>${project.title}</h1><p>${project.director ? `导演 / ${project.director}` : ""}</p><p class="project-detail-role">${project.role}</p></div></div><div class="project-detail-copy"><div class="project-detail-description"><p>${project.description}</p><div class="project-detail-meta"><span>${project.role}</span>${project.year ? `<span>${project.year}</span>` : ""}<span>Mastershot Studio</span></div></div></div><div class="project-gallery">${gallery}</div></article>`;
  const detailPlay = $(".detail-play", $("#project-view-content"));
  detailPlay?.addEventListener("click", event => { event.stopPropagation(); playProjectTrailerInline(project, detailPlay.closest(".project-trailer")); });
  view.classList.add("is-open");
  view.setAttribute("aria-hidden", "false");
  $("#project-view-scroll").scrollTop = 0;
  document.body.classList.add("project-open");
  if (pushHistory) history.pushState({ project: project.id }, "", `#project-${encodeURIComponent(project.id)}`);
  requestProgressUpdate();
  $("#project-view-scroll").focus({ preventScroll:true });
}

function closeProject(updateHistory = true) {
  const view = $("#project-view");
  // Destroy the inline player as well: a hidden iframe can keep playing audio.
  const content = $("#project-view-content");
  content.querySelectorAll("iframe, video, audio").forEach(el => {
    if (el.tagName === "VIDEO" || el.tagName === "AUDIO") {
      try { el.pause(); el.removeAttribute("src"); el.load(); } catch (error) {}
    }
    if (el.tagName === "IFRAME") {
      try { el.src = "about:blank"; } catch (error) {}
    }
    el.remove();
  });
  content.innerHTML = "";
  view.classList.remove("is-open");
  view.setAttribute("aria-hidden", "true");
  document.body.classList.remove("project-open");
  if (updateHistory && location.hash.startsWith("#project-")) history.replaceState({}, "", "#work");
  window.scrollTo({ top: projectScrollBefore, behavior: "instant" });
  requestProgressUpdate();
  if (projectReturnFocus && typeof projectReturnFocus.focus === "function") projectReturnFocus.focus({ preventScroll:true });
}

function projectFromHash() {
  if (!location.hash.startsWith("#project-")) return null;
  const id = decodeURIComponent(location.hash.slice("#project-".length));
  return SITE.projects.find(item => item.id === id) || SITE.otherProjects.find(item => item.id === id) || null;
}

function syncFromHash() {
  const project = projectFromHash();
  const open = $("#project-view").classList.contains("is-open");
  if (project) {
    if (!open) openProject(project, null, false);
  } else if (open) {
    closeProject(false);
  }
}

const progressBar = $("#page-progress-bar");
let progressFrame = 0;
function updatePageProgress() {
  if (!progressBar) return;
  const projectView = $("#project-view");
  const projectScroller = $("#project-view-scroll");
  const detailOpen = projectView?.classList.contains("is-open");
  const top = detailOpen ? projectScroller.scrollTop : window.scrollY;
  const max = detailOpen ? projectScroller.scrollHeight - projectScroller.clientHeight : document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.transform = `scaleX(${max > 0 ? Math.min(1, top / max) : 0})`;
  progressFrame = 0;
}
function requestProgressUpdate() {
  if (!progressBar || progressFrame) return;
  progressFrame = window.requestAnimationFrame(updatePageProgress);
}

$("#hero-backdrop").style.backgroundImage = `url("${SITE.heroImage}")`;
document.documentElement.style.setProperty("--wordmark-image", `url("${SITE.heroImage}")`);
if (SITE.heroVideo) {
  const heroVideo = $("#hero-motion");
  heroVideo.src = SITE.heroVideo;
  heroVideo.classList.add("is-active");
  heroVideo.play().catch(() => {});
}
renderProjects();
SITE.otherProjects.forEach(project => $("#other-grid").appendChild(createCard(project)));
$("#trilogy-grid").innerHTML = SITE.trilogy.map(item => `<article class="trilogy-card" data-id="${item.id}" role="link" tabindex="0" style="--image:url('${item.image}')"><div><span class="card-no">${item.number}</span><h3>${item.title}</h3></div><div><p>${item.text}</p><span class="text-link">VIEW PROJECT <span>↘</span></span></div></article>`).join("");
$$('.trilogy-card').forEach(card => {
  const open = () => {
    const project = SITE.projects.find(item => item.id === card.dataset.id);
    if (project) openProject(project, card);
  };
  card.addEventListener('click', open);
  card.addEventListener('keydown', event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); } });
});

$$('.filter').forEach(button => button.addEventListener('click', () => { $$('.filter').forEach(item => item.classList.remove('is-active')); button.classList.add('is-active'); renderProjects(button.dataset.filter); }));
$("#project-home").addEventListener("click", () => { closeProject(); window.scrollTo({ top: 0, behavior: "smooth" }); });
$("#project-close-x")?.addEventListener("click", () => { closeProject(); });
$(".project-logo").addEventListener("click", event => { event.preventDefault(); closeProject(); window.scrollTo({ top: 0, behavior: "smooth" }); });
window.addEventListener("scroll", requestProgressUpdate, { passive:true });
window.addEventListener("resize", requestProgressUpdate);
$("#project-view-scroll").addEventListener("scroll", requestProgressUpdate, { passive:true });
requestProgressUpdate();
$("#trailer-modal-close").addEventListener("click", closePlayback);
$("#trailer-modal-prev").addEventListener("click", () => stepPlayback(-1));
$("#trailer-modal-next").addEventListener("click", () => stepPlayback(1));
$("#trailer-modal").addEventListener("click", event => { if (event.target.id === "trailer-modal") closePlayback(); });
window.addEventListener("popstate", syncFromHash);
window.addEventListener("hashchange", syncFromHash);
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if (document.body.classList.contains("nav-open")) { setMenu(false); return; }
    if ($("#trailer-modal").classList.contains("is-open")) { closePlayback(); return; }
    if ($("#project-view").classList.contains("is-open")) closeProject();
  }
  if ($("#trailer-modal").classList.contains("is-open")) {
    if (event.key === "ArrowLeft") stepPlayback(-1);
    if (event.key === "ArrowRight") stepPlayback(1);
  }
});
$("#year").textContent = new Date().getFullYear();
const introGallery = $("#intro-gallery");
if (introGallery) {
  const galleryPrev = $("#gallery-prev");
  const galleryNext = $("#gallery-next");
  const galleryStep = () => Math.max(260, introGallery.clientWidth * 0.9);
  const updateGallery = () => {
    if (galleryPrev) galleryPrev.disabled = introGallery.scrollLeft <= 4;
    if (galleryNext) galleryNext.disabled = introGallery.scrollLeft + introGallery.clientWidth >= introGallery.scrollWidth - 4;
  };
  galleryPrev?.addEventListener("click", () => introGallery.scrollBy({ left: -galleryStep(), behavior: "smooth" }));
  galleryNext?.addEventListener("click", () => introGallery.scrollBy({ left: galleryStep(), behavior: "smooth" }));
  introGallery.addEventListener("scroll", updateGallery, { passive: true });
  window.addEventListener("resize", updateGallery);
  updateGallery();
}

const heroIndex = $(".hero-index");
if (heroIndex) heroIndex.textContent = `001 / ${String(SITE.projects.length).padStart(3, "0")}`;
syncFromHash();

const toggle = $(".menu-toggle");
let menuReturnFocus = null;
function setMenu(open) {
  document.body.classList.toggle("nav-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
  if (open) {
    menuReturnFocus = document.activeElement;
  } else if (menuReturnFocus && typeof menuReturnFocus.focus === "function") {
    menuReturnFocus.focus({ preventScroll:true });
    menuReturnFocus = null;
  }
}
toggle.addEventListener("click", () => setMenu(!document.body.classList.contains("nav-open")));
$(".brand").addEventListener("click", event => { event.preventDefault(); setMenu(false); window.scrollTo({ top: 0, behavior: "smooth" }); });
$$(".main-nav a").forEach(link => link.addEventListener("click", () => setMenu(false)));
const navPreviewImage = $("#nav-preview-image");
const navPreviewLabel = $("#nav-preview-label");
const navPreviewNames = { HOME:"MASTER SHOT / 首页", DIRECTING:"DIRECTING / 导演", WORK:"SELECTED WORK / 代表作品", APPROACH:"EDITORIAL APPROACH / 创作方法", ABOUT:"LI JIAWEI / 关于李嘉伟", CONTACT:"CONTACT / 合作联系" };
$$('.nav-links a').forEach(link => {
  const preview = () => {
    navPreviewImage.src = link.dataset.preview;
    navPreviewImage.alt = navPreviewNames[link.textContent.trim()] || link.textContent.trim();
    navPreviewLabel.textContent = navPreviewNames[link.textContent.trim()] || "SELECTED WORK";
  };
  link.addEventListener("pointerenter", preview);
  link.addEventListener("focus", preview);
});

// Reveal only the poster texture underneath the letters closest to the pointer.
const heroWordmark = $(".hero-wordmark");
if (heroWordmark) {
  heroWordmark.addEventListener("pointermove", event => {
    const rect = heroWordmark.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
    heroWordmark.style.setProperty("--mx", `${x}%`);
    heroWordmark.style.setProperty("--my", `${y}%`);
    heroWordmark.classList.add("is-revealing");
  });
  heroWordmark.addEventListener("pointerleave", () => heroWordmark.classList.remove("is-revealing"));
}

const splash = $("#splash-screen");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (splash) {
  if (reduceMotion) {
    splash.remove();
    document.body.classList.remove("splash-lock");
  } else {
    document.body.classList.add("splash-lock");
    window.setTimeout(() => {
      splash.classList.add("is-done");
      document.body.classList.remove("splash-lock");
      window.setTimeout(() => splash.remove(), 950);
    }, 1900);
  }
}

