#!/usr/bin/env node
/**
 * Quick status updater for Robin's dashboard
 * Usage: node update-status.js "Working on X" [online|working|offline]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const statusFile = path.join(__dirname, 'data/status.json');

const task = process.argv[2] || 'Idle';
const status = process.argv[3] || 'online';

const data = {
  status,
  task,
  updatedAt: new Date().toISOString(),
  details: null
};

fs.writeFileSync(statusFile, JSON.stringify(data, null, 2));

// Quick push
try {
  process.chdir(__dirname);
  execSync('git add data/status.json', { stdio: 'pipe' });
  execSync(`git commit -m "Status: ${task.substring(0, 50)}" --allow-empty`, { stdio: 'pipe' });
  execSync('git push origin main', { stdio: 'pipe' });
  console.log(`✅ Status updated: "${task}" (${status})`);
} catch (e) {
  console.log('⚠️ Could not push:', e.message);
}
