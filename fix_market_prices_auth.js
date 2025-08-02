#!/usr/bin/env node
/**
 * Script to fix Market Prices authentication
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/marketPricesService.ts');

// Read the current file
let content = fs.readFileSync(filePath, 'utf8');

// Add the import for supabase
content = content.replace(
  'const API_BASE = `${import.meta.env.VITE_API_URL}/api/v1/`;',
  `import { supabase } from './supabase';

const API_BASE = \`\${import.meta.env.VITE_API_URL}/api/v1/\`;

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  return { Authorization: \`Bearer \${token}\` };
}`
);

// Replace the old authentication method
content = content.replace(
  /const token = localStorage\.getItem\('supabase\.auth\.token'\);/g,
  'const headers = await getAuthHeaders();'
);

// Update the headers in the fetch calls
content = content.replace(
  /headers: \{\s*'Content-Type': 'application\/json',\s*'Authorization': `Bearer \${token}`,\s*\}/g,
  'headers: {\n        ...headers,\n        \'Content-Type\': \'application/json\',\n      }'
);

// Update the DELETE method headers
content = content.replace(
  /headers: \{\s*'Authorization': `Bearer \${token}`,\s*\}/g,
  'headers: headers'
);

// Write the updated content back
fs.writeFileSync(filePath, content);

console.log('✅ Fixed Market Prices authentication');
console.log('📝 Updated marketPricesService.ts with proper Supabase auth'); 