#!/usr/bin/env node
/**
 * Update Robin's status on the dashboard
 * Usage: node update-status.js "Task" "status" ["Details"] ["Duration"]
 * 
 * When status changes to "available", automatically logs the task to activity history!
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const statusFile = path.join(__dirname, 'data/status.json');
const activityFile = path.join(__dirname, 'data/robin/activity.json');

const task = process.argv[2] || 'Idle';
const status = process.argv[3] || 'available';
const details = process.argv[4] || null;
const duration = process.argv[5] || null;

// Load previous status to detect "working" -> "available" transition
let previousStatus = null;
let previousTask = null;
try {
  const prev = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
  previousStatus = prev.status;
  previousTask = prev.task;
} catch (e) {}

// Update status.json
const statusData = {
  status,
  task,
  updatedAt: new Date().toISOString(),
  details
};
fs.writeFileSync(statusFile, JSON.stringify(statusData, null, 2));

// Auto-log to activity when completing a task (working -> available)
let logged = false;
if (previousStatus === 'working' && status === 'available') {
  try {
    // Load activity data
    let activity = { completed: [], stats: { totalTasks: 0, tasksToday: 0, docsCreated: 0 } };
    try {
      activity = JSON.parse(fs.readFileSync(activityFile, 'utf8'));
    } catch (e) {}
    
    // Get next ID
    const maxId = activity.completed.reduce((max, t) => Math.max(max, t.id || 0), 0);
    
    // Add task (use previous task name since that's what we were working on)
    const newTask = {
      id: maxId + 1,
      task: previousTask || task,
      details: details || '',
      duration: duration || '',
      completedAt: new Date().toISOString()
    };
    
    activity.completed.unshift(newTask);
    activity.stats.totalTasks = (activity.stats.totalTasks || 0) + 1;
    
    // Check if same day for tasksToday
    const today = new Date().toISOString().split('T')[0];
    const lastUpdate = activity.updatedAt ? activity.updatedAt.split('T')[0] : null;
    if (lastUpdate !== today) {
      activity.stats.tasksToday = 1;
    } else {
      activity.stats.tasksToday = (activity.stats.tasksToday || 0) + 1;
    }
    
    activity.updatedAt = new Date().toISOString();
    
    // Keep last 100 tasks
    if (activity.completed.length > 100) {
      activity.completed = activity.completed.slice(0, 100);
    }
    
    fs.writeFileSync(activityFile, JSON.stringify(activity, null, 2));
    logged = true;
  } catch (e) {
    console.log('⚠️ Could not log activity:', e.message);
  }
}

// Git push
try {
  process.chdir(__dirname);
  execSync('git add data/status.json data/robin/activity.json', { stdio: 'pipe' });
  execSync(`git commit -m "Status: ${task.substring(0, 50)}" --allow-empty`, { stdio: 'pipe' });
  execSync('git push origin main', { stdio: 'pipe' });
  console.log(`✅ Status updated: "${task}" (${status})`);
  if (logged) {
    console.log(`📝 Auto-logged to activity history`);
  }
} catch (e) {
  console.log('⚠️ Could not push:', e.message);
}
