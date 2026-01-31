// EZ4X4 Command Center - Main App

// State
let engagementData = [];
let intelData = [];
let threadData = [];
let docsData = [];
let completedItems = JSON.parse(localStorage.getItem('ez4x4_completed') || '{}');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuth()) return;
  setupNavigation();
  await loadData();
  renderAll();
  updateProgress();
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
    reports: { icon: '📄', title: 'Reports', docs: [] },
    strategy: { icon: '🎯', title: 'Strategy', docs: [] },
    competitors: { icon: '📊', title: 'Competitor Intel', docs: [] },
    influencers: { icon: '👤', title: 'Influencers', docs: [] },
    other: { icon: '📁', title: 'Other', docs: [] }
  };
  
  // Sort docs into categories
  for (const doc of docsData) {
    const cat = categories[doc.category] || categories.other;
    cat.docs.push(doc);
  }
  
  // Render each category
  const renderList = (docs, icon) => {
    if (docs.length === 0) {
      return '<li class="empty">No documents yet</li>';
    }
    return docs.map(d => 
      `<li><a href="#" onclick="openDoc('${d.file}'); return false;">${icon} ${d.title}</a>
       <span class="doc-date">${d.createdAt || ''}</span></li>`
    ).join('');
  };
  
  document.getElementById('reportsList').innerHTML = renderList(categories.reports.docs, '📄');
  document.getElementById('competitorList').innerHTML = renderList(categories.competitors.docs, '📊');
  document.getElementById('influencerList').innerHTML = renderList(categories.influencers.docs, '👤');
  
  // Add strategy docs to a section if we have them
  if (categories.strategy.docs.length > 0) {
    const strategyList = document.createElement('div');
    strategyList.className = 'doc-category';
    strategyList.innerHTML = `
      <h3>🎯 Strategy</h3>
      <ul>${renderList(categories.strategy.docs, '🎯')}</ul>
    `;
    const grid = document.querySelector('.docs-grid');
    if (grid && !document.getElementById('strategyList')) {
      strategyList.id = 'strategyListContainer';
      grid.appendChild(strategyList);
    }
  }
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

// Utilities
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeJs(text) {
  return text.replace(/`/g, '\\`').replace(/\$/g, '\\$');
}
