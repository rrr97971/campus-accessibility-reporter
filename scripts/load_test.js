/**
 * DA3 Question 1b & 1c: Automated Load Testing & Benchmark Tool
 * Sends 1,000 requests with controlled concurrency, measures throughput,
 * latency percentiles, errors, and backend instance distribution.
 */

const http = require('http');

async function sendRequest(url) {
  const start = Date.now();
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        const latency = Date.now() - start;
        const servedBy = res.headers['x-served-by'] || 'unknown';
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve({ success: true, latency, servedBy, statusCode: res.statusCode });
        } else {
          resolve({ success: false, latency, servedBy, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (err) => {
      const latency = Date.now() - start;
      resolve({ success: false, latency, servedBy: 'error', error: err.message, statusCode: 0 });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ success: false, latency: 5000, servedBy: 'timeout', statusCode: 504 });
    });
  });
}

async function runLoadTest(options) {
  const { url, totalRequests = 1000, concurrency = 25, label = 'Test Run' } = options;

  console.log(`\n======================================================`);
  console.log(`   LOAD TEST: ${label}`);
  console.log(`   Target URL:       ${url}`);
  console.log(`   Total Requests:   ${totalRequests}`);
  console.log(`   Concurrency:      ${concurrency}`);
  console.log(`======================================================\n`);

  const results = [];
  const instanceCount = {};
  let completed = 0;
  let activeWorkers = 0;
  let requestIndex = 0;

  const startTime = Date.now();

  return new Promise((resolve) => {
    function next() {
      if (requestIndex >= totalRequests) {
        if (activeWorkers === 0) {
          const totalDurationSec = (Date.now() - startTime) / 1000;
          printSummary(results, totalDurationSec, instanceCount, label);
          resolve({ results, totalDurationSec, instanceCount });
        }
        return;
      }

      requestIndex++;
      activeWorkers++;

      sendRequest(url).then((res) => {
        results.push(res);
        instanceCount[res.servedBy] = (instanceCount[res.servedBy] || 0) + 1;
        completed++;
        activeWorkers--;

        if (completed % 250 === 0 || completed === totalRequests) {
          process.stdout.write(` Progress: ${completed}/${totalRequests} (${Math.round(completed / totalRequests * 100)}%)\r`);
        }

        next();
      });
    }

    // Launch worker pool
    for (let i = 0; i < concurrency; i++) {
      next();
    }
  });
}

function printSummary(results, durationSec, instanceCount, label) {
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const latencies = results.map(r => r.latency).sort((a, b) => a - b);

  const avgLatency = (latencies.reduce((sum, val) => sum + val, 0) / latencies.length).toFixed(2);
  const minLatency = latencies[0] || 0;
  const maxLatency = latencies[latencies.length - 1] || 0;
  const p50 = latencies[Math.floor(latencies.length * 0.50)] || 0;
  const p90 = latencies[Math.floor(latencies.length * 0.90)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const rps = (results.length / durationSec).toFixed(2);

  console.log(`\n\n--- RESULTS SUMMARY: ${label} ---`);
  console.log(`✓ Total Requests:      ${results.length}`);
  console.log(`✓ Successful Requests: ${successful}`);
  console.log(`✗ Failed Requests:     ${failed}`);
  console.log(`⏱ Total Duration:     ${durationSec.toFixed(2)} seconds`);
  console.log(`🚀 Requests/sec (RPS): ${rps} req/sec`);
  console.log(`📊 Latency Metrics:`);
  console.log(`   - Min Latency:      ${minLatency} ms`);
  console.log(`   - Avg Latency:      ${avgLatency} ms`);
  console.log(`   - P50 (Median):     ${p50} ms`);
  console.log(`   - P90:              ${p90} ms`);
  console.log(`   - P95:              ${p95} ms`);
  console.log(`   - P99:              ${p99} ms`);
  console.log(`   - Max Latency:      ${maxLatency} ms`);

  console.log(`\n🔄 Request Distribution Across Backend Instances:`);
  for (const [instance, count] of Object.entries(instanceCount)) {
    const pct = ((count / results.length) * 100).toFixed(1);
    console.log(`   • ${instance}: ${count} requests (${pct}%)`);
  }
}

// Self-executing runner if called directly
if (require.main === module) {
  const targetUrl = process.argv[2] || 'http://localhost:5000/api/health';
  const requests = parseInt(process.argv[3], 10) || 1000;
  const concurrency = parseInt(process.argv[4], 10) || 25;
  const label = process.argv[5] || 'Benchmark Run';

  runLoadTest({ url: targetUrl, totalRequests: requests, concurrency, label });
}

module.exports = { runLoadTest };
