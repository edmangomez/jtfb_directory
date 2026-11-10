import { networkInterfaces } from 'os';
import { spawn, exec } from 'child_process';
import { existsSync } from 'fs';

function getLocalIPs() {
  const nets = networkInterfaces();
  const results = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        results.push({ name, address: net.address });
      }
    }
  }
  return results;
}

const ips = getLocalIPs();
const port = 3000;

console.clear();
console.log('==================================================================');
console.log('       JTFB CISCO PHONE DIRECTORY - PWA WEB SYSTEM                ');
console.log('==================================================================');
console.log(`\n  [Local PC / Desktop]:   http://localhost:${port}`);
console.log('\n  [Mobile Phones & Network Devices on same Wi-Fi / Intranet]:');
if (ips.length > 0) {
  ips.forEach((item) => {
    console.log(`    -> http://${item.address}:${port}   (${item.name})`);
  });
} else {
  console.log(`    -> http://<YOUR_LOCAL_IP>:${port}`);
}
console.log('\n==================================================================');
console.log('  Opening in your default browser...');
console.log('  (To stop the server, press Ctrl + C in this window)');
console.log('==================================================================\n');

setTimeout(() => {
  exec(`start http://localhost:${port}`);
}, 1200);

const cmd = existsSync('dist/index.html') ? 'npm run preview' : 'npm run dev';
const child = spawn(cmd, { shell: true, stdio: 'inherit' });

child.on('exit', (code) => {
  process.exit(code || 0);
});
