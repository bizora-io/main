import fs from 'fs';

let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');

// Replace INITIAL_USERS
content = content.replace(/const INITIAL_USERS = \[[\s\S]*?\];/, 'const INITIAL_USERS: any[] = [];');

// Replace INITIAL_ADMINS
content = content.replace(/const INITIAL_ADMINS = \[[\s\S]*?\];/, 'const INITIAL_ADMINS: any[] = [];');

// Replace INITIAL_LOGS
content = content.replace(/const INITIAL_LOGS = \[[\s\S]*?\];/, 'const INITIAL_LOGS: any[] = [];');

fs.writeFileSync('src/components/AdminPanel.tsx', content);
console.log("Successfully removed mock data from AdminPanel.tsx");
