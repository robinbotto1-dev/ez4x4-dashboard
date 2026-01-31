#!/usr/bin/env node
/**
 * Complete a task - updates status to available AND logs to activity history
 * Usage: node task-complete.js "Task name" "Details" "Duration"
 */

const { execSync } = require('child_process');
const path = require('path');

const task = process.argv[2];
const details = process.argv[3] || '';
const duration = process.argv[4] || '';

if (!task) {
  console.log('Usage: node task-complete.js "Task name" "Details" "Duration"');
  process.exit(1);
}

const dir = __dirname;

// Update status to available
try {
  execSync(`node "${path.join(dir, 'update-status.js')}" "${task}" "available" "Just completed: ${details}"`, { stdio: 'inherit' });
} catch (e) {}

// Log to activity history
try {
  execSync(`node "${path.join(dir, 'log-activity.js')}" "${task}" "${details}" "${duration}"`, { stdio: 'inherit' });
} catch (e) {}

console.log(`\n🎉 Task complete: "${task}"`);
