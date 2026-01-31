#!/usr/bin/env node
/**
 * Quick status updater for Robin's dashboard
 * Usage: node update-status.js "Task" [status] ["Details"]
 * Status: online | working | idle | offline
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const statusFile = path.join(__dirname, 'data/status.json');

const task = process.argv[2] || 'Idle';
const status = process.argv[3] || 'online';
const details = process.argv[4] || null;

const data = {
  status,
  task,
  updatedAt: new Date().toISOString(),
  details
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
