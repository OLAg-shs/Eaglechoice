const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['app', 'components', 'lib'];

const replaceRules = [
  // 1. Convert old /client -> /agent
  { from: /href="\/client"/g, to: 'href="/agent"' },
  { from: /href="\/client\//g, to: 'href="/agent/' },
  { from: /redirect\("\/client"\)/g, to: 'redirect("/agent")' },
  { from: /redirect\("\/client\//g, to: 'redirect("/agent/' },
  { from: /router\.push\("\/client"\)/g, to: 'router.push("/agent")' },
  { from: /router\.push\("\/client\//g, to: 'router.push("/agent/' },
  { from: /revalidatePath\("\/client"\)/g, to: 'revalidatePath("/agent")' },
  { from: /revalidatePath\("\/client\//g, to: 'revalidatePath("/agent/' },
  { from: /`\/client\//g, to: '`/agent/' },
  { from: /New URL\("\/client/g, to: 'New URL("/agent' },
  { from: /new URL\("\/client/g, to: 'new URL("/agent' },

  // 2. Convert old /user -> /client
  { from: /href="\/user"/g, to: 'href="/client"' },
  { from: /href="\/user\//g, to: 'href="/client/' },
  { from: /redirect\("\/user"\)/g, to: 'redirect("/client")' },
  { from: /redirect\("\/user\//g, to: 'redirect("/client/' },
  { from: /router\.push\("\/user"\)/g, to: 'router.push("/client")' },
  { from: /router\.push\("\/user\//g, to: 'router.push("/client/' },
  { from: /revalidatePath\("\/user"\)/g, to: 'revalidatePath("/client")' },
  { from: /revalidatePath\("\/user\//g, to: 'revalidatePath("/client/' },
  { from: /`\/user\//g, to: '`/client/' },
  { from: /New URL\("\/user/g, to: 'New URL("/client' },
  { from: /new URL\("\/user/g, to: 'new URL("/client' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Don't modify auth webhook redirects or OG routes unless strictly matching
  for (const rule of replaceRules) {
    content = content.replace(rule.from, rule.to);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function traverseDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

DIRECTORIES.forEach(traverseDir);
console.log('Done refactoring string paths.');
