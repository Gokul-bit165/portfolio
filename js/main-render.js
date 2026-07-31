/**
 * Dynamic Client-side DOM Hydration Layer for Public Portfolio
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[PortfolioHydrator] Initializing dynamic DOM hydration...');

  try {
    await hydrateSiteSettings();
    
    const pagePath = window.location.pathname.toLowerCase();

    if (pagePath.includes('work')) {
      await hydrateWorkPage();
    } else if (pagePath.includes('team')) {
      await hydrateTeamPage();
    } else if (pagePath.includes('contact')) {
      await hydrateContactPage();
    } else if (pagePath.includes('project-detail')) {
      await hydrateProjectDetailPage();
    } else {
      // Default to home page
      await hydrateHomePage();
    }
  } catch (err) {
    console.error('[PortfolioHydrator] Hydration warning/error:', err);
  }
});

const DEFAULT_FALLBACK_IMAGE = 'assets/robot_skectch/robot_smileandtypeonlaptop.png';

/**
 * URL Resolvers & Formatters
 */
function resolveMediaUrl(url) {
  if (!url) return DEFAULT_FALLBACK_IMAGE;
  let str = String(url).trim();
  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:')) {
    return str;
  }
  if (str.startsWith('/')) {
    return str.substring(1);
  }
  return str;
}

function getYouTubeThumbnail(url) {
  if (!url) return null;
  let videoId = '';
  let str = String(url).trim();
  if (str.includes('youtube.com/watch?v=')) {
    videoId = str.split('v=')[1]?.split('&')[0];
  } else if (str.includes('youtu.be/')) {
    videoId = str.split('youtu.be/')[1]?.split('?')[0];
  } else if (str.includes('youtube.com/embed/')) {
    videoId = str.split('youtube.com/embed/')[1]?.split('?')[0];
  }
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return null;
}

function formatEmbedUrl(url) {
  if (!url) return 'https://www.youtube-nocookie.com/embed/LXb3EKWsInQ?rel=0';
  let str = String(url).trim();
  
  let videoId = '';
  if (str.includes('youtube.com/watch?v=')) {
    videoId = str.split('v=')[1]?.split('&')[0];
  } else if (str.includes('youtu.be/')) {
    videoId = str.split('youtu.be/')[1]?.split('?')[0];
  } else if (str.includes('youtube.com/embed/')) {
    videoId = str.split('youtube.com/embed/')[1]?.split('?')[0];
  }

  if (videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
  }

  if (str.includes('loom.com/share/')) {
    const loomId = str.split('loom.com/share/')[1]?.split('?')[0];
    return `https://www.loom.com/embed/${loomId}`;
  }

  return str;
}

/**
 * 1. Global Site Settings
 */
async function hydrateSiteSettings() {
  const settings = await window.PortfolioData.getSiteSettings();
  if (!settings) return;

  if (settings.availability_status) {
    const statusTextEls = document.querySelectorAll('.header__status span:not(.status-dot), .status-pill span:not(.status-dot), [data-availability-status]');
    statusTextEls.forEach(el => {
      el.textContent = settings.availability_status;
    });
  }

  if (settings.hero_headline) {
    const heroTitleEl = document.querySelector('[data-hero-headline]');
    if (heroTitleEl) heroTitleEl.textContent = settings.hero_headline;
  }

  if (settings.contact_email) {
    const emailEls = document.querySelectorAll('[data-contact-email], .footer-contact__email, .footer-email');
    emailEls.forEach(el => {
      el.textContent = settings.contact_email;
      if (el.tagName === 'A' || el.classList.contains('footer-contact__email')) {
        el.setAttribute('onclick', `location.href='mailto:${settings.contact_email}'`);
      }
    });
  }
}

/**
 * 2. Home Page Hydration (index.html or /)
 */
async function hydrateHomePage() {
  const settings = await window.PortfolioData.getSiteSettings();
  if (settings && settings.hero_subhead) {
    const subheadEl = document.querySelector('[data-hero-subhead]');
    if (subheadEl) subheadEl.textContent = settings.hero_subhead;
  }

  const projects = await window.PortfolioData.getProjects();
  if (projects) {
    const homeProjectGrid = document.querySelector('[data-home-projects-grid]');
    if (homeProjectGrid) {
      renderMarqueeCards(homeProjectGrid, projects);
    }
  }
}

function renderMarqueeCards(container, projects) {
  if (!container) return;

  if (!projects || projects.length === 0) {
    container.innerHTML = `
      <div style="padding: 2em; color: #fff; font-family: monospace;">No published projects available.</div>
    `;
    return;
  }

  // Duplicate project list to ensure seamless looping marquee
  const loopList = [...projects, ...projects, ...projects];
  const gradients = [
    'linear-gradient(135deg, #1E40AF 0%, #38BDF8 100%)',
    'linear-gradient(135deg, #EF4444 0%, #F59E0B 100%)',
    'linear-gradient(135deg, #7C3AED 0%, #C084FC 100%)',
    'linear-gradient(135deg, #059669 0%, #34D399 100%)',
  ];

  container.innerHTML = loopList.map((proj, idx) => {
    const projectKey = (proj.slug && String(proj.slug).trim() !== '') ? String(proj.slug).trim() : proj.id;
    const detailUrl = `project-detail.html?slug=${encodeURIComponent(projectKey)}`;
    const tagsHtml = (proj.stack_tags || []).slice(0, 3)
      .map(tag => `<span>${escapeHtml(tag)}</span>`)
      .join('');

    const bgGradient = gradients[idx % gradients.length];
    const coverImgSrc = proj.cover_image ? resolveMediaUrl(proj.cover_image) : DEFAULT_FALLBACK_IMAGE;

    return `
      <a href="${detailUrl}" class="work-card" style="display:block;text-decoration:none;color:inherit;width:360px;flex-shrink:0;">
        <div class="work-card__image-wrap">
          <div class="work-card__gradient" style="background:${bgGradient};position:relative;overflow:hidden;">
            <img src="${coverImgSrc}" alt="${escapeHtml(proj.title)}" style="width:100%;height:100%;object-fit:cover;" onError="this.style.display='none';"/>
          </div>
          <div class="work-card__overlay">
            <span class="work-card__tag">${escapeHtml((proj.category || 'Case Study').toUpperCase())}</span>
          </div>
        </div>
        <div class="work-card__content">
          <div>
            <h3 class="work-card__title">${escapeHtml(proj.title)}</h3>
            <p class="work-card__desc">${escapeHtml(proj.tagline || proj.description || '')}</p>
          </div>
          <div class="work-card__footer">
            <div class="work-card__tech">
              ${tagsHtml}
            </div>
            <span class="c-button">
              <span class="c-link">
                <span class="c-link__inner">
                  <span>View Project &rarr;</span>
                  <span class="c-link__animated">View Project &rarr;</span>
                </span>
              </span>
            </span>
          </div>
        </div>
      </a>
    `;
  }).join('');
}

/**
 * 3. Work Page Hydration (work.html or /work)
 */
async function hydrateWorkPage() {
  console.log('[PortfolioHydrator] Hydrating Work Page...');
  const projects = await window.PortfolioData.getProjects();
  const workGrid = document.querySelector('[data-work-projects-grid]') || document.querySelector('.stagger-grid');
  
  if (workGrid) {
    renderProjectCards(workGrid, projects || []);
  }

  if (projects) {
    setupProjectFilters(projects);
  }
}

function renderProjectCards(container, projects) {
  if (!container) return;

  if (!projects || projects.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 4em 2em; text-align: center; background: #fff; border: 2px solid #111; border-radius: 8px; box-shadow: 4px 4px 0px #111;">
        <h3 style="font-family: var(--font-display, 'Syne', sans-serif); font-size: 1.5rem; font-weight: 800; text-transform: uppercase;">No Published Projects Found</h3>
        <p style="font-family: var(--font-mono, monospace); font-size: 0.85rem; color: #666; margin-top: 0.5em;">Use your Admin CMS (http://localhost:5173/projects) to publish case studies.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = projects.map((proj, idx) => {
    const projectKey = (proj.slug && String(proj.slug).trim() !== '') ? String(proj.slug).trim() : proj.id;
    const detailUrl = `project-detail.html?slug=${encodeURIComponent(projectKey)}`;
    const allTags = proj.stack_tags || [];
    const visibleTags = allTags.slice(0, 6);
    const extraCount = allTags.length - visibleTags.length;
    const tagsHtml = visibleTags
      .map(tag => `<span class="folder__tag" style="font-family:var(--font-mono, monospace);font-size:0.68rem;padding:0.25em 0.6em;background:rgba(0,0,0,0.06);border:1px solid rgba(0,0,0,0.1);border-radius:3px;margin-right:0.3em;margin-bottom:0.3em;display:inline-block;white-space:nowrap;">${escapeHtml(tag)}</span>`)
      .join('')
      + (extraCount > 0 ? `<span style="font-family:var(--font-mono,monospace);font-size:0.68rem;padding:0.25em 0.6em;background:rgba(255,92,0,0.1);border:1px solid rgba(255,92,0,0.3);color:#FF5C00;border-radius:3px;margin-right:0.3em;margin-bottom:0.3em;display:inline-block;font-weight:700;">+${extraCount}</span>` : '');

    const coverImgSrc = proj.cover_image
      ? resolveMediaUrl(proj.cover_image)
      : DEFAULT_FALLBACK_IMAGE;

    return `
      <a href="${detailUrl}" class="folder card-hover" style="display:block;text-decoration:none;color:inherit;cursor:pointer;">
        <div class="folder__blueprint">
          <div style="font-size:0.6rem;opacity:0.7;">SPEC // FLOW</div>
          <div style="font-size:0.85rem;margin:0.3em 0;color:#93C5FD;">${escapeHtml((proj.category || 'SOFTWARE').toUpperCase())}</div>
          <div style="font-size:0.55rem;color:#60A5FA;">[BUILD_${(idx + 1).toString().padStart(2, '0')}]</div>
        </div>
        <div class="folder__metrics">
          <div style="font-size:0.55rem;color:var(--text-muted, #777);">CLIENT // YEAR</div>
          <div style="font-size:1rem;color:var(--accent-orange, #FF6B35);font-weight:700;">${escapeHtml(proj.year || '2026')}</div>
          <div style="font-size:0.55rem;">${escapeHtml(proj.client || 'AGENCY BUILD')}</div>
        </div>
        <div class="folder__cover">
          <div class="flex flex-col h-full justify-between">
            <div>
              <div style="font-size:0.55rem;color:var(--text-muted, #777);text-transform:uppercase;letter-spacing:0.05em;">${escapeHtml(proj.category || 'Software')}</div>
              <div style="font-size:1.3rem;line-height:1.1;margin-top:0.3em;font-weight:800;">${escapeHtml(proj.title)}</div>
            </div>
            <!-- Showcase Image (square aspect ratio) -->
            <div style="margin:0.5em 0;aspect-ratio:1/1;width:100%;overflow:hidden;border:2px solid #1d1b1b;border-radius:2px;box-shadow:inset 0 2px 4px rgba(0,0,0,0.08);background:#f5f5f5;flex-shrink:0;">
              <img style="width:100%;height:100%;object-fit:cover;display:block;" src="${coverImgSrc}" alt="${escapeHtml(proj.title)}" onError="this.onerror=null;this.src='${DEFAULT_FALLBACK_IMAGE}';"/>
            </div>
            <div>
              <div style="font-family:var(--font-script,sans-serif);font-size:0.8rem;opacity:0.8;margin-bottom:0.5em;line-height:1.4;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">${escapeHtml(proj.tagline || proj.description || '')}</div>
              <div class="folder__tags flex flex-wrap">
                ${tagsHtml}
              </div>
            </div>
          </div>
        </div>
      </a>
    `;
  }).join('');
}

function setupProjectFilters(projects) {
  const filterBtns = document.querySelectorAll('section button');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-accent-orange', 'text-white');
        b.classList.add('bg-white', 'text-primary');
      });
      e.currentTarget.classList.remove('bg-white', 'text-primary');
      e.currentTarget.classList.add('bg-accent-orange', 'text-white');

      const catText = e.currentTarget.textContent.trim().toLowerCase();
      let filtered = projects;
      if (catText !== 'all projects') {
        filtered = projects.filter(p => (p.category || '').toLowerCase().includes(catText));
      }
      const workGrid = document.querySelector('[data-work-projects-grid]') || document.querySelector('.stagger-grid');
      renderProjectCards(workGrid, filtered);
    });
  });
}

/**
 * 4. Team Page Hydration (team.html or /team)
 */
async function hydrateTeamPage() {
  console.log('[PortfolioHydrator] Hydrating Team Page...');
  const members = await window.PortfolioData.getTeamMembers();
  if (!members || members.length === 0) return;

  const teamContainer = document.querySelector('[data-team-container]');
  if (!teamContainer) return;

  const colors = ['var(--accent-green)', 'var(--accent-lilac)', 'var(--accent-orange)'];

  teamContainer.innerHTML = members.map((m, idx) => {
    const commits = Array.isArray(m.recent_commits) ? m.recent_commits : [];
    const commitsHtml = commits.map(c => `
      <div style="color:${idx % 2 === 0 ? 'var(--accent-green)' : 'var(--accent-orange)'};">${escapeHtml(c.hash || 'a1b2c3')} ${escapeHtml(c.msg || 'update')}</div>
    `).join('');

    const bg = colors[idx % colors.length];
    const avatarSrc = m.avatar_url
      ? resolveMediaUrl(m.avatar_url)
      : DEFAULT_FALLBACK_IMAGE;

    return `
      <div class="workstation" data-workstation style="margin-bottom:2em;">
        <div class="workstation__photo" style="background:${bg};display:flex;align-items:center;justify-content:center;">
          <img src="${avatarSrc}" alt="${escapeHtml(m.name)}" style="width:85%;height:85%;object-fit:contain;" onError="this.onerror=null;this.src='${DEFAULT_FALLBACK_IMAGE}';"/>
        </div>
        <div>
          <div style="font-family:var(--font-display);font-size:1.3rem;text-transform:uppercase;font-weight:800;">${escapeHtml(m.name)}</div>
          <div style="font-family:var(--font-mono);font-size:0.6rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:1em;">${escapeHtml(m.role)} / ${escapeHtml(m.specialty || '')}</div>
          <div class="workstation__console">
            <div class="console-header">~/${escapeHtml(m.name.toLowerCase())} $ </div>
            <div>$ git log --oneline -3</div>
            ${commitsHtml}
          </div>
        </div>
        <div>
          <div class="sticky-note sticky-note--orange" style="font-size:0.75rem;transform:rotate(${idx % 2 === 0 ? 3 : -2}deg);">
            <div style="font-weight:700;">Bio / Focus:</div>
            ${escapeHtml(m.bio || 'Building real software under deadline pressure.')}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 5. Contact Page Hydration (contact.html or /contact)
 */
async function hydrateContactPage() {
  const settings = await window.PortfolioData.getSiteSettings();
  if (!settings) return;

  if (settings.contact_email) {
    const emailEls = document.querySelectorAll('.footer-contact__email, [data-contact-email]');
    emailEls.forEach(el => {
      el.textContent = settings.contact_email;
      el.setAttribute('onclick', `location.href='mailto:${settings.contact_email}'`);
    });
  }
}

/**
 * 6. Project Detail Page Hydration (project-detail.html or /project-detail)
 */
async function hydrateProjectDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const slugOrId = params.get('slug') || params.get('id');

  let proj = null;
  if (slugOrId) {
    proj = await window.PortfolioData.getProjectBySlugOrId(slugOrId);
  }

  // If no param in URL, default to first published project
  if (!proj && !slugOrId) {
    const allProjs = await window.PortfolioData.getProjects();
    if (allProjs && allProjs.length > 0) {
      proj = await window.PortfolioData.getProjectBySlugOrId(allProjs[0].slug || allProjs[0].id);
    }
  }

  if (!proj) {
    console.warn('[ProjectDetail] No matching project found in Supabase database for target key:', slugOrId);
    return;
  }

  // Update address bar to reflect current project slug
  const targetSlug = proj.slug || proj.id;
  if (targetSlug && window.history && window.history.replaceState) {
    const cleanUrl = `project-detail.html?slug=${encodeURIComponent(targetSlug)}`;
    window.history.replaceState(null, '', cleanUrl);
  }

  // Title Strip
  const titleEl = document.querySelector('.title-main');
  if (titleEl) {
    titleEl.innerHTML = `${escapeHtml(proj.title)} <em>${escapeHtml(proj.tagline || '')}</em>`;
  }

  const categoryBadge = document.querySelector('.title-badge');
  if (categoryBadge) {
    categoryBadge.textContent = proj.category || 'FEATURED BUILD';
  }

  const eyebrowEl = document.querySelector('.title-eyebrow');
  if (eyebrowEl) {
    eyebrowEl.textContent = `${escapeHtml(proj.client || 'AGENCY BUILD')} // ${escapeHtml(proj.year || '2026')}`;
  }

  // Render Media Hero (Image, Native Video, or Embedded YouTube/Vimeo/Loom)
  renderProjectMediaHero(proj.media || [], proj.cover_image);

  // Render Condensed Info Bar
  renderProjectInfoBar(proj);

  // Render Description Overview Manifest
  renderProjectManifest(proj);
}

/**
 * Render Info Bar with dynamic metrics, links, and stack tags
 */
function renderProjectInfoBar(proj) {
  const infoBar = document.querySelector('.info-bar');
  if (!infoBar) return;

  const stackTagsHtml = (proj.stack_tags || []).join(', ') || 'Custom Architecture';
  const githubHtml = proj.github_url
    ? `<a href="${escapeHtml(proj.github_url)}" target="_blank" style="color:var(--orange);">GitHub &rarr;</a>`
    : 'Private Repo';

  const liveDemoHtml = proj.live_url
    ? `<a href="${escapeHtml(proj.live_url)}" target="_blank" style="color:var(--teal);">Live Demo &rarr;</a>`
    : 'Production Active';

  let statsItemsHtml = '';
  if (Array.isArray(proj.stats) && proj.stats.length > 0) {
    statsItemsHtml = proj.stats.map(s => `
      <div class="info-item">
        <div class="info-label">${escapeHtml(s.label || 'METRIC')}</div>
        <div class="info-value orange">${escapeHtml(s.value || '')}</div>
      </div>
    `).join('');
  }

  infoBar.innerHTML = `
    <div class="info-item"><div class="info-label">Stack</div><div class="info-value">${escapeHtml(stackTagsHtml)}</div></div>
    <div class="info-item"><div class="info-label">Category</div><div class="info-value">${escapeHtml(proj.category || 'Software')}</div></div>
    <div class="info-item"><div class="info-label">Client</div><div class="info-value">${escapeHtml(proj.client || 'Agency')}</div></div>
    <div class="info-item"><div class="info-label">Year</div><div class="info-value orange">${escapeHtml(proj.year || '2026')}</div></div>
    <div class="info-item"><div class="info-label">Source</div><div class="info-value orange">${githubHtml}</div></div>
    <div class="info-item"><div class="info-label">Deployment</div><div class="info-value">${liveDemoHtml}</div></div>
    ${statsItemsHtml}
    ${proj.tagline ? `<div class="info-desc" style="flex: 1 1 100%; margin-top: 1em; padding-top: 1em; border-top: 1px dashed var(--line); font-style: italic; color: var(--ink-soft);">${escapeHtml(proj.tagline)}</div>` : ''}
  `;
}

/**
 * Render Project Overview Manifest
 */
function renderProjectManifest(proj) {
  const manifestContainer = document.querySelector('[data-project-manifest]') || document.querySelector('.manifest');
  if (!manifestContainer) return;

  manifestContainer.innerHTML = `
    <div class="manifest-head"><span class="manifest-idx">01</span><span class="manifest-title">System Overview</span></div>
    <div class="m-row">
      <div class="m-row-label">Case Study</div>
      <div class="m-row-text markdown-body">${renderMarkdown(proj.description || proj.tagline || 'Production software system engineered under deadline pressure.')}</div>
    </div>
    <div class="m-row">
      <div class="m-row-label">Technologies</div>
      <div class="m-row-text">${escapeHtml((proj.stack_tags || []).join(' • ') || 'Custom Stack')}</div>
    </div>
    <div class="insight-line"><strong>Key Spec —</strong> Built and verified by the agency software collective. Sub-second performance benchmarks in production environment.</div>
  `;
}

/**
 * Markdown Renderer with fallback
 */
function renderMarkdown(text) {
  if (!text) return '';
  const str = String(text);
  if (typeof window.marked !== 'undefined' && typeof window.marked.parse === 'function') {
    try {
      return window.marked.parse(str);
    } catch (err) {
      console.warn('[MarkdownParser] marked library error, fallback used:', err);
    }
  }

  // Fallback simple markdown renderer
  let html = escapeHtml(str)
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
  return `<p>${html}</p>`;
}

/**
 * Render Media Hero (Image, Native Video, or Embedded YouTube/Vimeo/Loom)
 */
function renderProjectMediaHero(mediaItems, fallbackCover) {
  const mediaHeroContainer = document.querySelector('.media-hero');
  if (!mediaHeroContainer) return;

  const defaultItem = {
    url: fallbackCover || DEFAULT_FALLBACK_IMAGE,
    media_type: 'image',
    caption: 'Primary Showcase Cover'
  };

  const list = (mediaItems && mediaItems.length > 0) ? mediaItems : [defaultItem];

  function getMediaElement(item) {
    const embedUrl = formatEmbedUrl(item.url);
    const itemUrl = resolveMediaUrl(item.url || fallbackCover);

    if (item.media_type === 'video_embed') {
      return `
        <iframe
          src="${escapeHtml(embedUrl)}"
          title="${escapeHtml(item.caption || 'Video Showcase')}"
          style="width:100%;height:100%;border:0;"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="no-referrer-when-downgrade"
          allowfullscreen>
        </iframe>
      `;
    } else if (item.media_type === 'video') {
      return `
        <video src="${escapeHtml(itemUrl)}" controls autoplay loop muted style="width:100%;height:100%;object-fit:cover;"></video>
      `;
    } else {
      return `
        <img src="${escapeHtml(itemUrl)}" alt="${escapeHtml(item.caption || 'Project Showcase')}" style="width:100%;height:100%;object-fit:cover;" onError="this.onerror=null;this.src='${DEFAULT_FALLBACK_IMAGE}';"/>
      `;
    }
  }

  const thumbsHtml = list.map((item, idx) => {
    let thumbSrc = DEFAULT_FALLBACK_IMAGE;
    if (item.media_type === 'video_embed') {
      const ytThumb = getYouTubeThumbnail(item.url);
      thumbSrc = ytThumb || (fallbackCover ? resolveMediaUrl(fallbackCover) : DEFAULT_FALLBACK_IMAGE);
    } else {
      thumbSrc = resolveMediaUrl(item.url);
    }
    
    return `
      <div class="thumb ${idx === 0 ? 'active' : ''}" data-media-index="${idx}">
        <img src="${escapeHtml(thumbSrc)}" style="width:100%;height:100%;object-fit:cover;" alt="thumb" onError="this.onerror=null;this.src='${DEFAULT_FALLBACK_IMAGE}';"/>
        ${item.media_type !== 'image' ? `<span class="thumb-play">${item.media_type === 'video_embed' ? '▶' : 'PLAY'}</span>` : ''}
      </div>
    `;
  }).join('');

  mediaHeroContainer.innerHTML = `
    <div class="media-main" id="active-media-stage" style="position:relative;width:100%;aspect-ratio:16/9;border-radius:6px;overflow:hidden;background:#000;">
      ${getMediaElement(list[0])}
    </div>
    <div class="thumb-row" id="media-thumbs-row" style="display:flex;gap:0.7em;margin-top:0.8em;overflow-x:auto;">
      ${thumbsHtml}
    </div>
  `;

  const thumbs = mediaHeroContainer.querySelectorAll('.thumb');
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const idx = parseInt(thumb.getAttribute('data-media-index'), 10);
      const stage = document.getElementById('active-media-stage');
      if (stage && list[idx]) {
        stage.innerHTML = getMediaElement(list[idx]);
      }
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
