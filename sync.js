#!/usr/bin/env node
/**
 * EZ4X4 Dashboard Sync
 * Exports data from intel system and pushes to GitHub Pages
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const INTEL_DIR = '/Users/robin/clawd/ez4x4-intel';
const DASHBOARD_DIR = '/Users/robin/clawd/ez4x4-dashboard';
const DATA_DIR = path.join(DASHBOARD_DIR, 'data');

async function syncData() {
  console.log('🔄 Syncing EZ4X4 Dashboard data...\n');
  
  const today = new Date().toISOString().split('T')[0];
  
  // 1. Export engagement data
  console.log('1️⃣ Loading engagement data...');
  try {
    // Run the scanner and capture output
    const { scanForEngagement } = require(path.join(INTEL_DIR, 'scrapers/forum-engagement.js'));
    const engagement = await scanForEngagement();
    
    await fs.writeFile(
      path.join(DATA_DIR, 'engagement.json'),
      JSON.stringify({
        generatedAt: new Date().toISOString(),
        date: today,
        opportunities: engagement.opportunities
      }, null, 2)
    );
    console.log(`   ✅ Saved ${engagement.opportunities.length} opportunities`);
  } catch (e) {
    console.log(`   ⚠️ Error loading engagement: ${e.message}`);
  }
  
  // 2. Export intel data
  console.log('2️⃣ Loading intel data...');
  try {
    const intelFile = path.join(INTEL_DIR, 'data', `${today}.json`);
    const intelData = JSON.parse(await fs.readFile(intelFile, 'utf8'));
    
    // Combine all opportunities
    const allOpps = [];
    
    // Reddit
    for (const opp of intelData.reddit?.opportunities || []) {
      allOpps.push({
        source: `Reddit r/${opp.subreddit}`,
        title: opp.title,
        url: opp.url,
        matches: opp.matches,
        score: opp.opportunityScore
      });
    }
    
    // Forums
    for (const forum of intelData.forums?.results || []) {
      for (const opp of forum.opportunities || []) {
        allOpps.push({
          source: forum.forum,
          title: opp.title,
          url: opp.link,
          matches: opp.matches,
          score: opp.opportunityScore
        });
      }
    }
    
    await fs.writeFile(
      path.join(DATA_DIR, 'intel.json'),
      JSON.stringify({
        generatedAt: new Date().toISOString(),
        date: today,
        opportunities: allOpps
      }, null, 2)
    );
    console.log(`   ✅ Saved ${allOpps.length} intel opportunities`);
  } catch (e) {
    console.log(`   ⚠️ Error loading intel: ${e.message}`);
  }
  
  // 3. Sync documents
  console.log('3️⃣ Syncing documents...');
  try {
    const docsDir = path.join(INTEL_DIR, 'docs');
    const manifestPath = path.join(docsDir, 'manifest.json');
    
    if (await fs.access(manifestPath).then(() => true).catch(() => false)) {
      const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
      
      // Copy manifest to dashboard
      await fs.writeFile(
        path.join(DATA_DIR, 'docs.json'),
        JSON.stringify(manifest, null, 2)
      );
      
      // Copy doc files
      const docsOutDir = path.join(DATA_DIR, 'docs');
      await fs.mkdir(docsOutDir, { recursive: true });
      
      for (const doc of manifest.documents) {
        const srcPath = path.join(docsDir, doc.file);
        const destPath = path.join(docsOutDir, doc.file);
        try {
          await fs.copyFile(srcPath, destPath);
        } catch (e) {
          console.log(`   ⚠️ Could not copy ${doc.file}`);
        }
      }
      
      console.log(`   ✅ Synced ${manifest.documents.length} documents`);
    } else {
      console.log('   ℹ️ No docs manifest found');
    }
  } catch (e) {
    console.log(`   ⚠️ Error syncing docs: ${e.message}`);
  }
  
  // 4. Git push to GitHub Pages
  console.log('4️⃣ Pushing to GitHub...');
  try {
    process.chdir(DASHBOARD_DIR);
    
    execSync('git add -A', { stdio: 'pipe' });
    execSync(`git commit -m "Update data ${today}" --allow-empty`, { stdio: 'pipe' });
    execSync('git push origin main', { stdio: 'pipe' });
    
    console.log('   ✅ Pushed to GitHub');
  } catch (e) {
    if (e.message.includes('nothing to commit')) {
      console.log('   ℹ️ No changes to push');
    } else {
      console.log(`   ⚠️ Git error: ${e.message}`);
    }
  }
  
  console.log('\n✅ Sync complete!');
}

if (require.main === module) {
  syncData().catch(console.error);
}

module.exports = { syncData };
