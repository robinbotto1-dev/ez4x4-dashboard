#!/usr/bin/env node
/**
 * Robin Pulse - Background heartbeat that proves I'm alive
 * Updates pulse.json every 30 seconds with a timestamp
 * Dashboard checks this to verify status accuracy
 */

const fs = require('fs');
const path = require('path');

const pulseFile = path.join(__dirname, 'data/pulse.json');

function updatePulse() {
  const pulse = {
    alive: true,
    timestamp: new Date().toISOString(),
    uptimeMs: process.uptime() * 1000
  };
  fs.writeFileSync(pulseFile, JSON.stringify(pulse, null, 2));
}

// Update immediately on start
updatePulse();
console.log('🫀 Pulse started - updating every 30s');

// Then every 30 seconds
setInterval(updatePulse, 30000);

// Keep alive
process.on('SIGINT', () => {
  console.log('Pulse stopped');
  process.exit(0);
});
