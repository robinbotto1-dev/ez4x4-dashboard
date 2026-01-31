// EZ4X4 Command Center - Main App

// State
let engagementData = [];
let intelData = [];
let threadData = [];
let completedItems = JSON.parse(localStorage.getItem('ez4x4_completed') || '{}');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  await loadData();
  renderAll();
  updateProgress();
});

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
  // This would list actual documents - placeholder for now
  const reports = [
    { name: 'Daily Intel - Jan 31', url: '#' },
    { name: 'Forum Engagement - Jan 31', url: '#' }
  ];
  
  const competitors = [
    { name: 'Competitor Ad Analysis', url: '#' },
    { name: 'Bestop Strategy', url: '#' },
    { name: 'Quadratec Watch', url: '#' }
  ];
  
  const influencers = [
    { name: 'Micro-Influencer List', url: '#' },
    { name: 'Bronco Creators', url: '#' }
  ];
  
  document.getElementById('reportsList').innerHTML = reports.map(d => 
    `<li><a href="${d.url}">📄 ${d.name}</a></li>`
  ).join('');
  
  document.getElementById('competitorList').innerHTML = competitors.map(d => 
    `<li><a href="${d.url}">📊 ${d.name}</a></li>`
  ).join('');
  
  document.getElementById('influencerList').innerHTML = influencers.map(d => 
    `<li><a href="${d.url}">👤 ${d.name}</a></li>`
  ).join('');
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

// Utilities
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeJs(text) {
  return text.replace(/`/g, '\\`').replace(/\$/g, '\\$');
}
