/**
 * DA3 Multi-Instance Cluster & Reverse Proxy Simulator
 * Runs 3 independent backend server instances (ports 5001, 5002, 5003)
 * and an Nginx-equivalent round-robin Load Balancer on port 8080.
 *
 * Used for local benchmarking, screenshot evidence, and fault-tolerance verification.
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const BACKEND_DIR = path.join(__dirname, '..', 'backend');
const instances = [
  { id: 'backend-instance-1', port: 5001, process: null, active: true },
  { id: 'backend-instance-2', port: 5002, process: null, active: true },
  { id: 'backend-instance-3', port: 5003, process: null, active: true }
];

let proxyServer = null;
let rrIndex = 0;
let failoverEnabled = true; // Toggle for Question 1c before/after demonstration

function startBackendInstance(inst) {
  return new Promise((resolve) => {
    const env = {
      ...process.env,
      PORT: inst.port,
      INSTANCE_ID: inst.id
    };

    const child = spawn('node', ['src/server.js'], {
      cwd: BACKEND_DIR,
      env,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    child.stdout.on('data', (data) => {
      if (data.toString().includes('Server running on port')) {
        inst.process = child;
        console.log(`[Cluster] Started ${inst.id} on port ${inst.port}`);
        resolve();
      }
    });

    child.stderr.on('data', (data) => {
      // Ignore routine warnings
    });

    child.on('exit', () => {
      console.log(`[Cluster] ${inst.id} on port ${inst.port} exited.`);
      inst.active = false;
    });
  });
}

function startLoadBalancer(port = 8080) {
  proxyServer = http.createServer((req, res) => {
    const available = instances.filter(i => i.active);

    if (available.length === 0) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Bad Gateway: No backend instances available' }));
    }

    let attempts = 0;
    const maxAttempts = failoverEnabled ? instances.length : 1;

    function tryForward() {
      attempts++;
      const target = instances[rrIndex % instances.length];
      rrIndex++;

      const options = {
        hostname: 'localhost',
        port: target.port,
        path: req.url,
        method: req.method,
        headers: {
          ...req.headers,
          'X-Forwarded-For': req.socket.remoteAddress,
          'X-Forwarded-Host': req.headers.host,
          'X-Real-IP': req.socket.remoteAddress
        },
        timeout: 2000
      };

      const proxyReq = http.request(options, (proxyRes) => {
        // Successful response from upstream
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (err) => {
        if (failoverEnabled && attempts < maxAttempts) {
          // Transparent Nginx proxy_next_upstream behavior
          tryForward();
        } else {
          // Unconfigured failover behavior (returns 502 error to client)
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Bad Gateway: Target instance ${target.id} unreachable` }));
        }
      });

      req.pipe(proxyReq);
    }

    tryForward();
  });

  return new Promise((resolve) => {
    proxyServer.listen(port, () => {
      console.log(`\n======================================================`);
      console.log(`[Load Balancer] Listening on http://localhost:${port}`);
      console.log(`[Load Balancer] Proxying across 3 backend instances:`);
      instances.forEach(i => console.log(`   ➜ http://localhost:${i.port} (${i.id})`));
      console.log(`======================================================\n`);
      resolve();
    });
  });
}

async function startCluster() {
  console.log('[Cluster] Launching 3 backend instances...');
  for (const inst of instances) {
    await startBackendInstance(inst);
  }
  await startLoadBalancer(8080);
}

function stopInstance(index) {
  const inst = instances[index];
  if (inst && inst.process) {
    console.log(`\n[Cluster] >>> Intentionally stopping ${inst.id} (port ${inst.port}) <<<`);
    inst.active = false;
    inst.process.kill();
  }
}

function setFailover(enabled) {
  failoverEnabled = enabled;
  console.log(`[Load Balancer] Automatic failover (proxy_next_upstream) set to: ${enabled}`);
}

function shutdownCluster() {
  console.log('\n[Cluster] Shutting down all instances and load balancer...');
  instances.forEach(i => {
    if (i.process) i.process.kill();
  });
  if (proxyServer) proxyServer.close();
  process.exit(0);
}

process.on('SIGINT', shutdownCluster);
process.on('SIGTERM', shutdownCluster);

if (require.main === module) {
  startCluster();
}

module.exports = { startCluster, stopInstance, setFailover, shutdownCluster, instances };
