// Command Center - Main App

// State
let currentWorkspace = localStorage.getItem('currentWorkspace') || 'robin';
let engagementData = [];
let intelData = [];
let threadData = [];
let docsData = [];
let completedItems = JSON.parse(localStorage.getItem('ez4x4_completed') || '{}');

// Workspace configs
const workspaces = {
  ez4x4: {
    icon: '🚙',
    name: 'EZ4X4',
    type: 'Forum & Marketing Intel',
    dataPath: 'data',
    navItems: [
      { id: 'engagement', icon: '💬', label: 'Forum Engagement' },
      { id: 'intel', icon: '📊', label: 'Daily Intel' },
      { id: 'threads', icon: '📝', label: 'Thread Ideas' },
      { id: 'docs', icon: '📁', label: 'Documents' },
      { id: 'strategy', icon: '🎯', label: 'Strategy' }
    ]
  },
  founderchat: {
    icon: '💬',
    name: 'Founder Chat',
    type: 'Community & Alerts',
    dataPath: 'data/founderchat',
    navItems: [
      { id: 'fc-docs', icon: '📁', label: 'Documents' }
    ]
  },
  robin: {
    icon: '🦅',
    name: 'Robin',
    type: 'General Assistant',
    dataPath: 'data/robin',
    navItems: [
      { id: 'robin-dashboard', icon: '🏠', label: 'Dashboard' },
      { id: 'robin-history', icon: '📜', label: 'Full History' }
    ]
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  loadStatus(); // Load status even before auth
  if (!checkAuth()) return;
  setupNavigation();
  
  // Load default workspace
  const workspace = workspaces[currentWorkspace];
  
  // Update sidebar for current workspace
  updateSidebarNav(workspace, currentWorkspace);
  
  // Update header
  document.getElementById('currentWorkspaceIcon').textContent = workspace.icon;
  document.getElementById('currentWorkspaceName').textContent = workspace.name;
  document.querySelector('.workspace-current .workspace-type').textContent = workspace.type;
  
  // Update dropdown active state
  document.querySelectorAll('.workspace-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.workspace === currentWorkspace);
  });
  
  if (currentWorkspace === 'robin' || currentWorkspace === 'founderchat') {
    showWorkspaceContent(workspace, currentWorkspace);
  } else {
    await loadData();
    renderAll();
    updateProgress();
  }
});

// Simple auth gate
function checkAuth() {
  const stored = localStorage.getItem('ez4x4_auth');
  if (stored === 'granted') {
    document.body.classList.add('authenticated');
    return true;
  }
  showAuthPrompt();
  return false;
}

function showAuthPrompt() {
  const overlay = document.createElement('div');
  overlay.className = 'auth-overlay';
  overlay.innerHTML = `
    <div class="auth-box">
      <h2>🔒 EZ4X4 Command Center</h2>
      <p>Enter password to continue</p>
      <input type="password" id="authPassword" placeholder="Password" autofocus>
      <button onclick="submitAuth()">Enter</button>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.classList.add('locked');
  
  document.getElementById('authPassword').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitAuth();
  });
}

function submitAuth() {
  const input = document.getElementById('authPassword');
  const pw = input.value;
  
  // Hash check (obfuscated slightly)
  if (btoa(pw) === 'MTIzMzIx') {
    localStorage.setItem('ez4x4_auth', 'granted');
    document.querySelector('.auth-overlay').remove();
    document.body.classList.remove('locked');
    document.body.classList.add('authenticated');
    location.reload();
  } else {
    input.value = '';
    input.placeholder = 'Wrong password';
    input.classList.add('error');
  }
}

// Navigation
function setupNavigation() {
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      
      // Update active states
      document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(section).classList.add('active');
    });
  });
  
  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterEngagement(btn.dataset.forum);
    });
  });
}

// Load data from JSON files
async function loadData() {
  try {
    // Try to load engagement data
    const engagementRes = await fetch('data/engagement.json');
    if (engagementRes.ok) {
      const data = await engagementRes.json();
      engagementData = data.opportunities || [];
      document.getElementById('lastUpdated').textContent = `Updated: ${new Date(data.generatedAt).toLocaleString()}`;
    }
  } catch (e) {
    console.log('No engagement data yet');
  }
  
  try {
    // Try to load intel data
    const intelRes = await fetch('data/intel.json');
    if (intelRes.ok) {
      const data = await intelRes.json();
      intelData = data.opportunities || [];
    }
  } catch (e) {
    console.log('No intel data yet');
  }
  
  try {
    // Try to load thread ideas
    const threadsRes = await fetch('data/threads.json');
    if (threadsRes.ok) {
      threadData = await threadsRes.json();
    }
  } catch (e) {
    console.log('No thread data yet');
  }
  
  // Load strategy content
  try {
    const strategyRes = await fetch('data/strategy.md');
    if (strategyRes.ok) {
      const strategyText = await strategyRes.text();
      document.getElementById('strategyContent').innerHTML = marked.parse ? marked.parse(strategyText) : `<pre>${strategyText}</pre>`;
    }
  } catch (e) {
    console.log('No strategy doc yet');
  }
  
  // Load documents
  try {
    const docsRes = await fetch('data/docs.json');
    if (docsRes.ok) {
      const data = await docsRes.json();
      docsData = data.documents || [];
    }
  } catch (e) {
    console.log('No docs data yet');
  }
}

// Render all sections
function renderAll() {
  renderEngagement();
  renderIntel();
  renderThreads();
  renderDocs();
}

// Render engagement opportunities
function renderEngagement(filter = 'all') {
  const container = document.getElementById('engagementList');
  
  let items = engagementData;
  if (filter !== 'all') {
    items = items.filter(item => item.forumSlug === filter || item.forum.toLowerCase().includes(filter));
  }
  
  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No engagement opportunities loaded yet.</p>
        <p>Data will appear here after the daily report runs at 9 AM.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = items.map((item, index) => {
    const id = `eng_${item.url}`;
    const isCompleted = completedItems[id];
    const forumClass = item.forum.toLowerCase().includes('bronco') ? 'bronco6g' : 
                       item.forum.toLowerCase().includes('gladiator') ? 'gladiator' : 'jlwrangler';
    
    return `
      <div class="response-card ${isCompleted ? 'completed' : ''}" data-id="${id}">
        <div class="card-header">
          <h3>${escapeHtml(item.title.substring(0, 80))}${item.title.length > 80 ? '...' : ''}</h3>
          <span class="forum-badge ${forumClass}">${item.forum}</span>
        </div>
        ${item.suggestedResponse?.productMention ? `<span class="product-tag">🎯 ${item.suggestedResponse.productMention}</span>` : ''}
        <div class="response-text">${escapeHtml(item.suggestedResponse?.draft || 'No draft available')}</div>
        <div class="card-actions">
          <button class="btn btn-primary" onclick="copyResponse('${id}', this)">📋 Copy Response</button>
          <a href="${item.url}" target="_blank" class="btn btn-secondary">🔗 Open Thread</a>
          <button class="btn ${isCompleted ? 'btn-secondary' : 'btn-success'}" onclick="toggleComplete('${id}')">
            ${isCompleted ? '↩️ Undo' : '✅ Done'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function filterEngagement(forum) {
  renderEngagement(forum);
}

// Render intel opportunities
function renderIntel() {
  const container = document.getElementById('intelList');
  
  if (intelData.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No intel data loaded yet.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = intelData.map(item => `
    <div class="response-card">
      <div class="card-header">
        <h3>${escapeHtml(item.title)}</h3>
        <span class="forum-badge">${item.source}</span>
      </div>
      <p style="color: var(--text-muted); margin-bottom: 12px;">
        Matches: ${item.matches?.join(', ') || 'N/A'}
      </p>
      <div class="card-actions">
        <a href="${item.url}" target="_blank" class="btn btn-primary">🔗 View</a>
      </div>
    </div>
  `).join('');
}

// Render thread ideas
function renderThreads() {
  const container = document.getElementById('threadsList');
  
  const ideas = [
    {
      forum: 'Bronco6g',
      section: 'General Discussion',
      title: 'Freedom Panel Friday - Who\'s going topless this weekend?',
      content: `Weather's looking good in a lot of places this weekend. Who's planning to pop those freedom panels off?

Share your setup:
- 2 door or 4 door?
- Freedom panels or full top removal?
- Any tips for quick removal/storage?

Bonus points for pics of your open-air adventures! 📸`,
      images: ['Open Bronco with panels off', 'Freedom panel storage solution']
    },
    {
      forum: 'Jeep Gladiator Forum',
      section: 'Accessories & Modifications',
      title: 'Bed organization - how do you keep gear secure?',
      content: `The Gladiator bed is awesome but keeping things organized and secure can be a challenge.

What's your system?
- DIY solutions?
- Aftermarket products that actually work?
- Bed covers - worth it or not?

Show us your setup! 📸`,
      images: ['Organized truck bed', 'Tie-down setup']
    },
    {
      forum: 'JL Wrangler Forums',
      section: 'General Discussion',
      title: 'Hard top vs soft top - which team are you on?',
      content: `The eternal debate...

Hard top crew: Better insulation, security, quieter
Soft top crew: Easier to remove, lighter, more open-air options

Which do you run and why? Anyone switch from one to the other?

And for the "both" crowd - when do you swap?`,
      images: ['Hard top Wrangler', 'Soft top Wrangler']
    }
  ];
  
  container.innerHTML = ideas.map(idea => `
    <div class="thread-card">
      <span class="forum-badge">${idea.forum}</span>
      <h3 style="margin-top: 12px;">${idea.title}</h3>
      <div class="thread-meta">📍 Post to: ${idea.section}</div>
      <div class="thread-content">${escapeHtml(idea.content)}</div>
      <div class="thread-images">
        <strong>Images:</strong>
        ${idea.images.map(img => `<span>📷 ${img}</span>`).join('')}
      </div>
      <div class="card-actions" style="margin-top: 16px;">
        <button class="btn btn-primary" onclick="copyThread(this, \`${escapeJs(idea.content)}\`)">📋 Copy Content</button>
      </div>
    </div>
  `).join('');
}

// Render documents
function renderDocs() {
  // Categorize documents
  const categories = {
    strategy: [],
    marketing: [],
    influencers: [],
    content: [],
    products: [],
    reports: [],
    technical: [],
    other: []
  };
  
  // Sort docs into categories
  for (const doc of docsData) {
    const cat = categories[doc.category] || categories.other;
    cat.push(doc);
  }
  
  // Render each category
  const renderList = (docs, icon) => {
    if (docs.length === 0) {
      return '<li class="empty">No documents yet</li>';
    }
    return docs.map(d => 
      `<li>
        <a href="#" onclick="openDoc('${d.file}'); return false;">${icon} ${d.title}</a>
      </li>`
    ).join('');
  };
  
  document.getElementById('strategyList').innerHTML = renderList(categories.strategy, '📄');
  document.getElementById('marketingList').innerHTML = renderList(categories.marketing, '📄');
  document.getElementById('influencersList').innerHTML = renderList(categories.influencers, '📄');
  document.getElementById('contentList').innerHTML = renderList(categories.content, '📄');
  document.getElementById('productsList').innerHTML = renderList(categories.products, '📄');
  document.getElementById('reportsList').innerHTML = renderList(categories.reports, '📄');
  document.getElementById('technicalList').innerHTML = renderList(categories.technical, '📄');
}

// Actions
function copyResponse(id, btn) {
  const card = document.querySelector(`[data-id="${id}"]`);
  const text = card.querySelector('.response-text').textContent;
  
  navigator.clipboard.writeText(text).then(() => {
    showToast('Response copied!');
    btn.textContent = '✅ Copied!';
    setTimeout(() => btn.textContent = '📋 Copy Response', 2000);
  });
}

function copyThread(btn, content) {
  navigator.clipboard.writeText(content).then(() => {
    showToast('Thread content copied!');
    btn.textContent = '✅ Copied!';
    setTimeout(() => btn.textContent = '📋 Copy Content', 2000);
  });
}

function toggleComplete(id) {
  completedItems[id] = !completedItems[id];
  localStorage.setItem('ez4x4_completed', JSON.stringify(completedItems));
  renderEngagement(document.querySelector('.filter-btn.active').dataset.forum);
  updateProgress();
}

function updateProgress() {
  const total = engagementData.length || 30;
  const completed = Object.values(completedItems).filter(Boolean).length;
  const percent = Math.round((completed / total) * 100);
  
  document.getElementById('engagementProgress').style.width = `${percent}%`;
  document.getElementById('engagementCount').textContent = `${completed}/${total} completed`;
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// Open and display a document
async function openDoc(filename) {
  try {
    const res = await fetch(`data/docs/${filename}`);
    if (res.ok) {
      const text = await res.text();
      
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'doc-modal';
      modal.innerHTML = `
        <div class="doc-modal-content">
          <button class="doc-modal-close" onclick="this.parentElement.parentElement.remove()">✕</button>
          <div class="doc-modal-body">${simpleMarkdown(text)}</div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Close on backdrop click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
      });
    }
  } catch (e) {
    console.error('Error loading doc:', e);
  }
}

// Simple markdown parser (headings, lists, bold)
function simpleMarkdown(text) {
  return text
    .replace(/^### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^## (.*$)/gm, '<h3>$1</h3>')
    .replace(/^# (.*$)/gm, '<h2>$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, (match) => {
      if (match.startsWith('<')) return match;
      return match;
    });
}

// Status Widget
async function loadStatus() {
  try {
    const res = await fetch('data/status.json?t=' + Date.now());
    if (res.ok) {
      const data = await res.json();
      updateStatusWidget(data);
    }
  } catch (e) {
    console.log('Could not load status');
  }
}

function updateStatusWidget(data) {
  const widget = document.getElementById('statusWidget');
  if (!widget) return;
  
  // Preserve expanded state
  const isExpanded = widget.classList.contains('expanded');
  
  // Clear all status classes and set new one
  widget.classList.remove('online', 'working', 'idle', 'offline');
  const status = data.status || 'offline';
  widget.classList.add(status);
  if (isExpanded) widget.classList.add('expanded');
  
  const badgeEl = widget.querySelector('.status-badge');
  const taskEl = widget.querySelector('.status-task');
  const timeEl = widget.querySelector('.status-time');
  const detailsEl = widget.querySelector('.status-details-text');
  
  // Set badge text
  const badgeLabels = {
    available: 'Available',
    working: 'Working',
    offline: 'Offline',
    online: 'Available',
    idle: 'Available'
  };
  badgeEl.textContent = badgeLabels[status] || status || 'Unknown';
  
  taskEl.textContent = data.task || 'Idle';
  
  // Set details
  if (data.details) {
    detailsEl.textContent = data.details;
  } else {
    // Default details based on status
    const defaults = {
      working: 'Currently focused on this task. Will update when complete.',
      available: 'Ready and monitoring. Standing by for tasks.',
      offline: 'System offline. Will resume when back online.'
    };
    detailsEl.textContent = defaults[data.status] || 'No additional details.';
  }
  
  if (data.updatedAt) {
    const updated = new Date(data.updatedAt);
    const now = new Date();
    const diffMin = Math.floor((now - updated) / 60000);
    
    if (diffMin < 1) {
      timeEl.textContent = 'just now';
    } else if (diffMin < 60) {
      timeEl.textContent = `${diffMin}m ago`;
    } else if (diffMin < 1440) {
      timeEl.textContent = `${Math.floor(diffMin/60)}h ago`;
    } else {
      timeEl.textContent = updated.toLocaleDateString();
    }
  }
}

function toggleStatusExpand(event) {
  // Don't toggle if clicking the refresh button
  if (event && event.target.classList.contains('status-refresh-btn')) return;
  const widget = document.getElementById('statusWidget');
  widget.classList.toggle('expanded');
}

async function refreshStatus(event) {
  event.stopPropagation();
  const btn = event.target;
  btn.textContent = '↻ Refreshing...';
  btn.disabled = true;
  
  await loadStatus();
  
  btn.textContent = '✓ Updated!';
  setTimeout(() => {
    btn.textContent = '↻ Refresh Status';
    btn.disabled = false;
  }, 1500);
}

// Poll status every 10 seconds
setInterval(loadStatus, 10000);

// Workspace functions
function toggleWorkspaceDropdown() {
  const selector = document.querySelector('.workspace-selector');
  selector.classList.toggle('open');
}

function switchWorkspace(workspaceId, event) {
  if (event) event.stopPropagation();
  
  const workspace = workspaces[workspaceId];
  if (!workspace) return;
  
  currentWorkspace = workspaceId;
  localStorage.setItem('currentWorkspace', workspaceId);
  
  // Update UI
  document.getElementById('currentWorkspaceIcon').textContent = workspace.icon;
  document.getElementById('currentWorkspaceName').textContent = workspace.name;
  document.querySelector('.workspace-current .workspace-type').textContent = workspace.type;
  
  // Update active state
  document.querySelectorAll('.workspace-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.workspace === workspaceId);
  });
  
  // Close dropdown
  document.querySelector('.workspace-selector').classList.remove('open');
  
  // Update sidebar nav
  updateSidebarNav(workspace, workspaceId);
  
  // Load workspace content
  if (workspaceId === 'ez4x4') {
    hideWorkspaceComingSoon();
  } else {
    showWorkspaceContent(workspace, workspaceId);
  }
}

function updateSidebarNav(workspace, workspaceId) {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks || !workspace.navItems) return;
  
  navLinks.innerHTML = workspace.navItems.map((item, i) => `
    <li>
      <a href="#${item.id}" class="${i === 0 ? 'active' : ''}" data-section="${item.id}" onclick="handleNavClick('${item.id}', '${workspaceId}', event)">
        ${item.icon} ${item.label}
      </a>
    </li>
  `).join('');
}

function handleNavClick(sectionId, workspaceId, event) {
  event.preventDefault();
  
  // Update active state
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  event.target.classList.add('active');
  
  if (workspaceId === 'ez4x4') {
    // Show the corresponding section
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById(sectionId);
    if (section) section.classList.add('active');
  } else if (workspaceId === 'robin') {
    if (sectionId === 'robin-history') {
      showRobinHistory();
    } else {
      showWorkspaceContent(workspaces.robin, 'robin');
    }
  }
}

async function showWorkspaceContent(workspace, workspaceId) {
  const content = document.querySelector('.content');
  
  if (workspaceId === 'founderchat') {
    // Load Founder Chat docs
    let fcDocs = [];
    try {
      const res = await fetch('data/founderchat/docs.json?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        fcDocs = data.documents || [];
      }
    } catch (e) {
      console.log('Could not load FC docs');
    }
    
    // Categorize
    const cats = { strategy: [], accelerators: [], content: [] };
    for (const doc of fcDocs) {
      if (cats[doc.category]) cats[doc.category].push(doc);
    }
    
    const renderList = (docs) => docs.length === 0 
      ? '<li class="empty">No documents yet</li>'
      : docs.map(d => `<li><a href="#" onclick="openFCDoc('${d.file}'); return false;">📄 ${d.title}</a></li>`).join('');
    
    content.innerHTML = `
      <section class="section active">
        <header class="section-header">
          <h2>💬 Founder Chat Documents</h2>
          <p>${fcDocs.length} documents available</p>
        </header>
        <div class="docs-grid">
          <div class="doc-category">
            <h3>🎯 Strategy</h3>
            <ul>${renderList(cats.strategy)}</ul>
          </div>
          <div class="doc-category">
            <h3>🚀 Accelerator Guides</h3>
            <ul>${renderList(cats.accelerators)}</ul>
          </div>
          <div class="doc-category">
            <h3>📝 Content</h3>
            <ul>${renderList(cats.content)}</ul>
          </div>
        </div>
      </section>
    `;
  } else if (workspaceId === 'robin') {
    // Load Robin data
    let activity = { timeline: {}, stats: {} };
    let actions = { gabrielQueue: [], robinQueue: [], blockers: [], businessHealth: {} };
    
    try {
      const res = await fetch('data/robin/activity.json?t=' + Date.now());
      if (res.ok) activity = await res.json();
    } catch (e) {}
    
    try {
      const res = await fetch('data/robin/actions.json?t=' + Date.now());
      if (res.ok) actions = await res.json();
    } catch (e) {}
    
    const stats = activity.stats || {};
    const timeline = activity.timeline || {};
    const gabrielQueue = actions.gabrielQueue || [];
    const robinQueue = actions.robinQueue || [];
    const blockers = actions.blockers || [];
    const health = actions.businessHealth || {};
    
    // Generate timeline HTML
    const timelineDates = Object.keys(timeline).sort().reverse().slice(0, 5);
    const timelineHtml = timelineDates.map(date => {
      const items = timeline[date] || [];
      const dateLabel = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `
        <div class="timeline-day">
          <div class="timeline-date">${dateLabel}</div>
          <div class="timeline-items">
            ${items.length === 0 ? '<div class="timeline-empty">No completions</div>' : items.map(item => `
              <div class="timeline-item">
                <span class="timeline-time">${item.time}</span>
                <span class="timeline-task">✓ ${item.task}</span>
                <span class="timeline-duration">${item.duration}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
    
    content.innerHTML = `
      <section class="section active">
        <header class="section-header">
          <h2>🎯 Command Center</h2>
          <p>High-return actions for both of us</p>
          <button class="btn btn-primary" onclick="generateSchedule()" style="margin-top: 12px;">📅 Generate Today's Schedule</button>
        </header>
        
        <!-- BUSINESS HEALTH -->
        <div class="health-grid">
          <div class="health-card">
            <div class="health-header">🚙 EZ4X4</div>
            <div class="health-stat">${health.ez4x4?.revenue || '$6.28M/mo'}</div>
            <div class="health-metrics">
              <span>Affiliates: ${health.ez4x4?.affiliates || 71}/${health.ez4x4?.affiliateGoal || 100}</span>
              <span>Forum: #${health.ez4x4?.forumRank || 18} (goal: #${health.ez4x4?.forumRankGoal || 10})</span>
            </div>
          </div>
          <div class="health-card">
            <div class="health-header">💬 Founder Chat</div>
            <div class="health-stat">${health.founderChat?.price || '$29.99/mo'}</div>
            <div class="health-metrics">
              <span>Programs: ${health.founderChat?.programs || 18}/${health.founderChat?.programsGoal || 50}</span>
              <span>Next: ${health.founderChat?.nextDeadline || 'YC Feb 9'}</span>
            </div>
          </div>
        </div>
        
        <!-- GABRIEL'S QUEUE -->
        <div class="action-section priority">
          <h3>👤 Your Queue (Needs You)</h3>
          <div class="action-list">
            ${gabrielQueue.filter(a => !a.completed).map(a => `
              <div class="action-card gabriel" data-id="${a.id}">
                <div class="action-header">
                  <span class="action-id">${a.id}</span>
                  <span class="action-title">${a.title}</span>
                  <span class="action-effort">${a.effort}</span>
                </div>
                <p class="action-impact">💥 ${a.impact}</p>
                <p class="action-source">📄 ${a.source}</p>
                <button class="btn btn-success" onclick="completeItem('${a.id}')">✅ Complete</button>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- ROBIN'S QUEUE -->
        <div class="action-section">
          <h3>🦅 Robin's Queue (I'll Handle)</h3>
          <div class="action-list">
            ${robinQueue.map(a => `
              <div class="action-card robin ${a.status === 'in_progress' ? 'in-progress' : ''}">
                <div class="action-header">
                  <span class="action-id">${a.id}</span>
                  <span class="action-title">${a.title}</span>
                  ${a.status === 'in_progress' ? '<span class="status-badge working">In Progress</span>' : '<span class="status-badge">Queued</span>'}
                </div>
                ${a.progress ? `<p class="action-progress">📊 ${a.progress}</p>` : ''}
                <p class="action-source">📄 ${a.source}</p>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- BLOCKERS -->
        ${blockers.length > 0 ? `
        <div class="action-section">
          <h3>🚧 Blockers</h3>
          <div class="action-list">
            ${blockers.map(b => `
              <div class="action-card blocker">
                <div class="action-header">
                  <span class="action-title">${b.title}</span>
                  <span class="blocker-status">${b.status}</span>
                </div>
                <p class="action-desc">${b.note}</p>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        <!-- TIMELINE -->
        <div class="timeline-section">
          <h3>📜 Recently Completed</h3>
          <div class="timeline">
            ${timelineHtml || '<p class="empty">No completions yet</p>'}
          </div>
        </div>
      </section>
    `;
  }
}

async function openFCDoc(filename) {
  try {
    const res = await fetch(`data/founderchat/docs/${filename}`);
    if (res.ok) {
      const text = await res.text();
      const modal = document.createElement('div');
      modal.className = 'doc-modal';
      modal.innerHTML = `
        <div class="doc-modal-content">
          <button class="doc-modal-close" onclick="this.parentElement.parentElement.remove()">✕</button>
          <div class="doc-modal-body">${simpleMarkdown(text)}</div>
        </div>
      `;
      document.body.appendChild(modal);
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }
  } catch (e) {
    console.error('Error loading doc:', e);
  }
}

function hideWorkspaceComingSoon() {
  location.reload();
}

async function showRobinHistory() {
  const content = document.querySelector('.content');
  
  let activity = { completed: [] };
  try {
    const res = await fetch('data/robin/activity.json?t=' + Date.now());
    if (res.ok) activity = await res.json();
  } catch (e) {}
  
  const completed = activity.completed || [];
  
  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };
  
  content.innerHTML = `
    <section class="section active">
      <header class="section-header">
        <h2>📜 Full Task History</h2>
        <p>Everything we've done together</p>
      </header>
      <div class="activity-list">
        ${completed.map(task => `
          <div class="activity-item">
            <div class="activity-header">
              <span class="activity-title">${task.task}</span>
              <span class="activity-duration">${task.duration || ''}</span>
            </div>
            <p class="activity-details">${task.details || ''}</p>
            <span class="activity-time">${formatTime(task.completedAt)}</span>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.workspace-selector')) {
    document.querySelector('.workspace-selector')?.classList.remove('open');
  }
});

// Complete an item from Gabriel's queue
async function completeItem(id) {
  const card = document.querySelector(`[data-id="${id}"]`);
  if (card) {
    card.classList.add('completing');
    card.innerHTML = '<div class="completing-msg">✅ Marking complete...</div>';
  }
  
  // Store in localStorage for now (Telegram bot will sync)
  const completed = JSON.parse(localStorage.getItem('command_center_completed') || '[]');
  completed.push({
    id,
    completedAt: new Date().toISOString()
  });
  localStorage.setItem('command_center_completed', JSON.stringify(completed));
  
  // Reload after brief delay
  setTimeout(() => {
    showWorkspaceContent(workspaces.robin, 'robin');
    showToast(`Completed ${id}!`);
  }, 500);
}

// Generate today's schedule
function generateSchedule() {
  const modal = document.createElement('div');
  modal.className = 'doc-modal';
  modal.innerHTML = `
    <div class="doc-modal-content">
      <button class="doc-modal-close" onclick="this.parentElement.parentElement.remove()">✕</button>
      <div class="doc-modal-body">
        <h2>📅 Today's Schedule</h2>
        <p style="color: var(--text-muted);">Based on your queue and priorities</p>
        
        <div class="schedule-block">
          <h3>🌅 Morning (9am - 12pm)</h3>
          <div class="schedule-item">
            <span class="schedule-time">9:00</span>
            <span class="schedule-task"><strong>g1:</strong> Publish Military Discount Page (15 min)</span>
          </div>
          <div class="schedule-item">
            <span class="schedule-time">9:30</span>
            <span class="schedule-task"><strong>g2:</strong> Review Group Buys Program (20 min)</span>
          </div>
          <div class="schedule-item">
            <span class="schedule-time">10:00</span>
            <span class="schedule-task"><strong>g3:</strong> Review FC landing page (10 min)</span>
          </div>
        </div>
        
        <div class="schedule-block">
          <h3>☀️ Afternoon (1pm - 5pm)</h3>
          <div class="schedule-item">
            <span class="schedule-time">1:00</span>
            <span class="schedule-task">Quick decisions: g4 + g5 (10 min total)</span>
          </div>
          <div class="schedule-item">
            <span class="schedule-time">1:30</span>
            <span class="schedule-task"><strong>g6:</strong> Connect Chrome relay (2 min) - unlocks Phase 2!</span>
          </div>
          <div class="schedule-item robin-task">
            <span class="schedule-time">2:00+</span>
            <span class="schedule-task">🦅 Robin handles r2-r7 while you focus on core work</span>
          </div>
        </div>
        
        <div class="schedule-summary">
          <strong>Your time needed:</strong> ~1 hour<br>
          <strong>Robin handles:</strong> 6 background tasks<br>
          <strong>Unblocks:</strong> Content velocity, browser automation, FC launch
        </div>
        
        <button class="btn btn-primary" onclick="this.closest('.doc-modal').remove()" style="margin-top: 16px;">Got it!</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

// Utilities
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeJs(text) {
  return text.replace(/`/g, '\\`').replace(/\$/g, '\\$');
}
