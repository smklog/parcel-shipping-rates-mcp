// Drives the stdio bridge like an MCP client would: initialize, the
// initialized notification, tools/list, ping and one read-only tool call.
// The online block talks to the real endpoint (discovery calls and
// get_price_index spend no quote allowance); the offline block points the
// bridge at a closed port and checks the snapshot answers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BIN = join(dirname(fileURLToPath(import.meta.url)), '..', 'bin', 'smklog-parcel-shipping-rates-mcp.mjs');
const EXPECTED_TOOLS = ['get_parcel_quote', 'create_checkout_link', 'track_parcel', 'get_price_index', 'get_checkout_status'];

function client(env = {}) {
  const child = spawn(process.execPath, [BIN], { stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, ...env } });
  let buffer = '';
  const waiters = new Map();
  const unrouted = [];
  child.stdout.on('data', chunk => {
    buffer += chunk.toString();
    let index;
    while ((index = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, index); buffer = buffer.slice(index + 1);
      if (!line.trim()) continue;
      const message = JSON.parse(line);
      const waiter = waiters.get(message.id);
      if (waiter) { waiters.delete(message.id); waiter(message); } else unrouted.push(message);
    }
  });
  let nextId = 1;
  return {
    request(method, params = {}, timeoutMs = 60000) {
      const id = nextId++;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => { waiters.delete(id); reject(new Error(`${method}: no answer in ${timeoutMs} ms`)); }, timeoutMs);
        waiters.set(id, message => { clearTimeout(timer); resolve(message); });
        child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
      });
    },
    notify(method, params = {}) { child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n'); },
    raw(line) { child.stdin.write(line + '\n'); },
    unrouted,
    close() { child.stdin.end(); child.kill(); }
  };
}

test('online: handshake, tool catalog and a read-only tool call reach the endpoint', { skip: process.env.SMKLOG_MCP_OFFLINE === '1' }, async () => {
  const c = client();
  try {
    const init = await c.request('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'bridge-test', version: '0.0.0' } });
    assert.equal(init.result.protocolVersion, '2025-06-18');
    assert.equal(init.result.serverInfo.name, 'smklog-quotes');
    assert.ok(init.result._meta, 'live answers carry the server _meta block');
    c.notify('notifications/initialized');
    const list = await c.request('tools/list');
    assert.deepEqual(list.result.tools.map(t => t.name).sort(), [...EXPECTED_TOOLS].sort());
    const ping = await c.request('ping');
    assert.ok(ping.result && !ping.error);
    const index = await c.request('tools/call', { name: 'get_price_index', arguments: {} }, 90000);
    assert.ok(index.result, `get_price_index answered: ${JSON.stringify(index.error || '')}`);
    assert.ok(Array.isArray(index.result.content) && index.result.content.length > 0);
  } finally { c.close(); }
});

test('offline: discovery is answered from the snapshots, tool calls say why they cannot run', async () => {
  const c = client({ SMKLOG_MCP_URL: 'http://127.0.0.1:9/mcp', SMKLOG_MCP_TIMEOUT_MS: '3000' });
  try {
    const init = await c.request('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'bridge-test', version: '0.0.0' } }, 15000);
    assert.equal(init.result.protocolVersion, '2025-03-26', 'a supported legacy version is echoed');
    assert.equal(init.result.serverInfo.version, '1.4.0');
    const list = await c.request('tools/list', {}, 15000);
    assert.deepEqual(list.result.tools.map(t => t.name).sort(), [...EXPECTED_TOOLS].sort());
    const resources = await c.request('resources/list', {}, 15000);
    assert.deepEqual(resources.result.resources, []);
    const call = await c.request('tools/call', { name: 'get_price_index', arguments: {} }, 15000);
    assert.equal(call.error.code, -32000);
    assert.match(call.error.message, /could not be reached/);
  } finally { c.close(); }
});

test('malformed input gets a JSON-RPC error instead of killing the bridge', async () => {
  const c = client({ SMKLOG_MCP_URL: 'http://127.0.0.1:9/mcp', SMKLOG_MCP_TIMEOUT_MS: '3000' });
  try {
    c.raw('{not json');
    c.raw('[{"jsonrpc":"2.0","id":7,"method":"ping"}]');
    const ping = await c.request('ping', {}, 15000);
    assert.ok(ping.result, 'the bridge keeps answering after bad lines');
    const codes = c.unrouted.map(m => m.error && m.error.code);
    assert.deepEqual(codes, [-32700, -32600]);
  } finally { c.close(); }
});
