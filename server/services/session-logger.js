/**
 * Session Logger — tracks API usage and feedback sessions
 */

const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, '../kb/sections/learning/sessions_log.json');

function logSession(data) {
  let log = { sessions: [] };
  try { log = JSON.parse(fs.readFileSync(LOG_PATH, 'utf-8')); } catch {}
  log.sessions.push({ ...data, timestamp: new Date().toISOString() });
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
}

function getSessionLog() {
  try { return JSON.parse(fs.readFileSync(LOG_PATH, 'utf-8')); }
  catch { return { sessions: [] }; }
}

module.exports = { logSession, getSessionLog };
