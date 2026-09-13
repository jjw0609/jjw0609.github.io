// 데이터 (projects.json에서 로드)
let projects = [];

// DOM 요소
const projectGrid = document.getElementById('project-grid');
const detailContent = document.getElementById('detail-content');
const listView = document.getElementById('list-view');
const detailView = document.getElementById('detail-view');
const backBtn = document.getElementById('back-btn');
const homeBtn = document.getElementById('home-btn');

// techStack 카테고리 표시명
const STACK_LABELS = {
    frontend: 'Frontend',
    backend: 'Backend',
    database: 'Database',
    infra: 'Infra'
};

// 이미지가 없을 때 쓰는 플레이스홀더 SVG
const PLACEHOLDER_SVG = `<svg class="image-placeholder" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;

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
        // 대문자(예: J, W)에 포인트 컬러 적용
        homeBtn.innerHTML = esc(meta.name).replace(/[A-Z]/g, m => `<span class="point-color">${m}</span>`);
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
            <h3>${esc(project.title)}</h3>
            <p>${esc(project.summary)}</p>
            <div class="tag-list">${tagsHtml}</div>
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
    if (links.demo) btns.push(`<a class="link-btn primary" href="${esc(links.demo)}" target="_blank" rel="noopener">Live Demo</a>`);
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

    const imageHtml = project.thumbnail
        ? `<img src="${esc(project.thumbnail)}" alt="${esc(project.title)}" class="detail-image">`
        : PLACEHOLDER_SVG;

    detailContent.innerHTML = `
        <div class="detail-hero">
            <div class="detail-image-wrapper">${imageHtml}</div>
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

// 이벤트 리스너
backBtn.addEventListener('click', () => showList());
homeBtn.addEventListener('click', () => showList());
window.addEventListener('hashchange', routeFromHash);

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
