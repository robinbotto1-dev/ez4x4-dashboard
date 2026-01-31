#!/usr/bin/env node
/**
 * Log Robin's activity to the dashboard
 * Usage: node log-activity.js "Task name" "Details" "Duration"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const activityFile = path.join(__dirname, 'data/robin/activity.json');

const task = process.argv[2];
const details = process.argv[3] || '';
const duration = process.argv[4] || '';

if (!task) {
  console.log('Usage: node log-activity.js "Task name" "Details" "Duration"');
  process.exit(1);
}

// Load existing data
let data = { completed: [], stats: { totalTasks: 0, tasksToday: 0, docsCreated: 0 } };
try {
  data = JSON.parse(fs.readFileSync(activityFile, 'utf8'));
} catch (e) {
  console.log('Creating new activity file');
}

// Get next ID
const maxId = data.completed.reduce((max, t) => Math.max(max, t.id || 0), 0);

// Add new task
const newTask = {
  id: maxId + 1,
  task,
  details,
  duration,
  completedAt: new Date().toISOString()
};

data.completed.unshift(newTask);
data.stats.totalTasks = (data.stats.totalTasks || 0) + 1;
data.stats.tasksToday = (data.stats.tasksToday || 0) + 1;
data.updatedAt = new Date().toISOString();

// Keep last 100 tasks
if (data.completed.length > 100) {
  data.completed = data.completed.slice(0, 100);
}

fs.writeFileSync(activityFile, JSON.stringify(data, null, 2));

// Push to GitHub
try {
  process.chdir(__dirname);
  execSync('git add data/robin/activity.json', { stdio: 'pipe' });
  execSync(`git commit -m "Activity: ${task.substring(0, 50)}" --allow-empty`, { stdio: 'pipe' });
  execSync('git push origin main', { stdio: 'pipe' });
  console.log(`✅ Logged: "${task}"`);
} catch (e) {
  console.log('⚠️ Could not push:', e.message);
}
