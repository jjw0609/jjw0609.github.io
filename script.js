// 데이터 (projects.json에서 로드)
let projects = [];

// DOM 요소
const projectGrid = document.getElementById('project-grid');
const detailContent = document.getElementById('detail-content');
const listView = document.getElementById('list-view');
const detailView = document.getElementById('detail-view');
const backBtn = document.getElementById('back-btn');
const homeBtn = document.getElementById('home-btn');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');

// techStack 카테고리 표시명
const STACK_LABELS = {
    frontend: 'Frontend',
    backend: 'Backend',
    database: 'Database',
    infra: 'Infra'
};

// 이미지가 없을 때 쓰는 플레이스홀더 SVG
const PLACEHOLDER_SVG = `<svg class="image-placeholder" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;

// 썸네일이 없으면 데모 URL로 자동 스크린샷(WordPress mshots, 무료·키 불필요) 생성
function thumbnailUrl(project) {
    if (project.thumbnail) return project.thumbnail;
    const demo = project.links && project.links.demo;
    if (demo) return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(demo)}?w=1200`;
    return '';
}

// 썸네일 영역 HTML (이미지 로드 실패 시 플레이스홀더로 자동 대체)
function thumbHtml(project, imgClass) {
    const url = thumbnailUrl(project);
    if (!url) return PLACEHOLDER_SVG;
    return `<img src="${esc(url)}" alt="${esc(project.title)}" class="${imgClass}" loading="lazy" onerror="this.outerHTML = PLACEHOLDER_SVG">`;
}

// 돋보기(확대보기) 아이콘
const ZOOM_ICON_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;

// 썸네일 확대보기 버튼 (실제 이미지가 있을 때만 노출)
function zoomBtnHtml(project) {
    const url = thumbnailUrl(project);
    if (!url) return '';
    return `<button type="button" class="zoom-btn" aria-label="이미지 확대보기" data-zoom-url="${esc(url)}" data-zoom-alt="${esc(project.title)}">${ZOOM_ICON_SVG}</button>`;
}

// HTML 이스케이프 (사용자 데이터 안전 렌더링)
function esc(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

// 메타 정보 적용
function applyMeta(meta = {}) {
    if (!meta) return;
    if (meta.name) {
        // "Woong" 부분에 포인트 컬러 적용
        homeBtn.innerHTML = esc(meta.name).replace('Woong', '<span class="point-color">Woong</span>');
    }
    const titleEl = document.getElementById('list-title');
    const subtitleEl = document.getElementById('list-subtitle');
    if (titleEl && meta.title) titleEl.textContent = meta.title;
    if (subtitleEl && meta.subtitle) subtitleEl.textContent = meta.subtitle;
    if (meta.title) document.title = `${meta.name || ''} - ${meta.title}`.trim();
}

// 리스트 렌더링
function renderList() {
    projectGrid.innerHTML = '';
    // featured 우선 정렬 (원래 순서 유지)
    const sorted = [...projects].sort((a, b) => (b.featured === true) - (a.featured === true));

    sorted.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.onclick = () => showDetail(project.id);

        const tagsHtml = (project.tags || [])
            .map(tag => `<span class="tag">${esc(tag)}</span>`).join('');

        card.innerHTML = `
            <div class="card-thumb">
                ${thumbHtml(project, 'card-thumb-img')}
                ${zoomBtnHtml(project)}
            </div>
            <div class="card-body">
                <h3>${esc(project.title)}</h3>
                <p>${esc(project.summary)}</p>
                <div class="tag-list">${tagsHtml}</div>
            </div>
        `;
        projectGrid.appendChild(card);
    });
}

// techStack 블록 HTML
function renderTechStack(techStack) {
    if (!techStack) return '';
    const rows = Object.keys(STACK_LABELS)
        .filter(key => Array.isArray(techStack[key]) && techStack[key].length > 0)
        .map(key => {
            const items = techStack[key]
                .map(t => `<span class="tag">${esc(t)}</span>`).join('');
            return `
                <div class="stack-row">
                    <span class="stack-label">${STACK_LABELS[key]}</span>
                    <div class="tag-list">${items}</div>
                </div>`;
        }).join('');
    if (!rows) return '';
    return `<div class="tech-stack">${rows}</div>`;
}

// 기능 목록 HTML
function renderFeatures(features) {
    if (!Array.isArray(features) || !features.length) return '';
    const items = features.map(f => `<li>${esc(f)}</li>`).join('');
    return `<div class="detail-block">
        <h3 class="block-title">주요 기능</h3>
        <ul class="feature-list">${items}</ul>
    </div>`;
}

// 설명 HTML (문자열 또는 배열 모두 지원)
function renderDescription(description) {
    if (!description) return '';
    const paras = Array.isArray(description) ? description : [description];
    return paras.map(p => `<p>${esc(p)}</p>`).join('');
}

// 링크 버튼 HTML
function renderLinks(links) {
    if (!links) return '';
    const btns = [];
    if (links.demo) btns.push(`<a class="link-btn primary" href="${esc(links.demo)}" target="_blank" rel="noopener">사이트 보러가기</a>`);
    if (links.github) btns.push(`<a class="link-btn" href="${esc(links.github)}" target="_blank" rel="noopener">GitHub</a>`);
    if (!btns.length) return '';
    return `<div class="link-btns">${btns.join('')}</div>`;
}

// 스크린샷 갤러리 HTML
function renderScreenshots(screenshots, title) {
    if (!Array.isArray(screenshots) || !screenshots.length) return '';
    const imgs = screenshots.map((src, i) =>
        `<img src="${esc(src)}" alt="${esc(title)} 스크린샷 ${i + 1}" class="screenshot" loading="lazy">`
    ).join('');
    return `<div class="detail-block">
        <h3 class="block-title">스크린샷</h3>
        <div class="screenshot-grid">${imgs}</div>
    </div>`;
}

// 상세 렌더링
function showDetail(id, updateHash = true) {
    const project = projects.find(p => p.id === id);
    if (!project) { showList(); return; }

    const imageHtml = thumbHtml(project, 'detail-image');

    detailContent.innerHTML = `
        <div class="detail-hero">
            <div class="detail-image-wrapper">
                ${imageHtml}
                ${zoomBtnHtml(project)}
            </div>
            <div class="detail-info">
                <h2>${esc(project.title)}</h2>
                <p class="detail-summary">${esc(project.summary)}</p>
                ${renderLinks(project.links)}
            </div>
        </div>
        <div class="detail-body">
            ${renderTechStack(project.techStack)}
            <div class="detail-block">
                <h3 class="block-title">소개</h3>
                <div class="description">${renderDescription(project.description)}</div>
            </div>
            ${renderFeatures(project.features)}
            ${renderScreenshots(project.screenshots, project.title)}
        </div>
    `;

    listView.classList.remove('active');
    detailView.classList.add('active');
    if (updateHash) location.hash = encodeURIComponent(id);
    window.scrollTo(0, 0);
}

// 목록으로 돌아가기
function showList(updateHash = true) {
    detailView.classList.remove('active');
    listView.classList.add('active');
    if (updateHash && location.hash) {
        history.pushState('', document.title, location.pathname + location.search);
    }
}

// 현재 해시에 맞는 뷰 표시 (딥링크 / 뒤로가기 지원)
function routeFromHash() {
    const id = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (id && projects.some(p => p.id === id)) {
        showDetail(id, false);
    } else {
        showList(false);
    }
}

// 라이트박스 열기/닫기
function openLightbox(url, alt) {
    lightboxImg.src = url;
    lightboxImg.alt = alt;
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxImg.src = '';
}

// 이벤트 리스너
backBtn.addEventListener('click', () => showList());
homeBtn.addEventListener('click', () => showList());
window.addEventListener('hashchange', routeFromHash);

// 확대보기 버튼 클릭 (카드의 onclick은 버블 단계라, 캡처 단계에서 먼저 가로채 전파를 막음)
document.addEventListener('click', (e) => {
    const zoomBtn = e.target.closest('.zoom-btn');
    if (zoomBtn) {
        e.stopPropagation();
        openLightbox(zoomBtn.dataset.zoomUrl, zoomBtn.dataset.zoomAlt);
    }
}, true);

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
});

// 초기화: 데이터 로드
fetch('./projects.json')
    .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    })
    .then(data => {
        projects = Array.isArray(data.projects) ? data.projects : [];
        applyMeta(data.meta);
        renderList();
        routeFromHash();
    })
    .catch(err => {
        console.error('projects.json 로드 실패:', err);
        projectGrid.innerHTML = `<p class="load-error">데이터를 불러오지 못했습니다. 로컬에서 확인 중이라면 <code>file://</code>가 아닌 로컬 서버(예: <code>python -m http.server</code>)로 열어주세요.</p>`;
    });
