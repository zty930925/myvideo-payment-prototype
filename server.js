const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const { getPlans, searchTitles, getTitles } = require('./services/catalogService');
const { evaluateTitle } = require('./services/entitlementService');
const { answerChat } = require('./services/chatService');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const MAX_BODY_BYTES = 7 * 1024 * 1024;

const allowedOrigins = String(process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function setCors(req, res) {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Request body is too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function parseImage(image) {
  if (!image || typeof image !== 'object') return null;
  const { name = 'image', type = '', dataUrl = '' } = image;
  if (!String(type).startsWith('image/') || !String(dataUrl).startsWith('data:image/')) {
    return null;
  }
  return {
    received: true,
    filename: String(name).slice(0, 180),
    mimeType: String(type).slice(0, 100),
    // Do not persist image data in this MVP.
  };
}

function serveStatic(reqPath, res) {
  let relative = reqPath === '/' ? 'index.html' : reqPath.replace(/^\/+/, '');
  relative = decodeURIComponent(relative);
  const filePath = path.normalize(path.join(ROOT, relative));

  if (!filePath.startsWith(ROOT)) {
    sendJson(res, 403, { error: 'FORBIDDEN' });
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      const indexPath = path.join(ROOT, 'index.html');
      fs.readFile(indexPath, (indexErr, data) => {
        if (indexErr) return sendJson(res, 404, { error: 'NOT_FOUND' });
        res.writeHead(200, { 'Content-Type': MIME['.html'] });
        res.end(data);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    fs.readFile(filePath, (readErr, data) => {
      if (readErr) return sendJson(res, 500, { error: 'READ_ERROR' });
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
}

const server = http.createServer(async (req, res) => {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  try {
    if (req.method === 'GET' && pathname === '/api/health') {
      return sendJson(res, 200, {
        ok: true,
        service: 'myvideo-helper-mvp',
        dataMode: 'mock',
        timestamp: new Date().toISOString(),
      });
    }

    if (req.method === 'GET' && pathname === '/api/plans') {
      return sendJson(res, 200, { data: getPlans(), mock: true });
    }

    if (req.method === 'GET' && pathname === '/api/titles') {
      const q = String(url.searchParams.get('q') || '').trim();
      const data = q ? searchTitles(q) : getTitles();
      return sendJson(res, 200, { data, mock: true });
    }

    const entitlementMatch = pathname.match(/^\/api\/titles\/([^/]+)\/entitlement$/);
    if (req.method === 'GET' && entitlementMatch) {
      const id = decodeURIComponent(entitlementMatch[1]);
      const title = getTitles().find((item) => item.id === id);
      if (!title) return sendJson(res, 404, { error: 'TITLE_NOT_FOUND' });
      const entitlement = String(url.searchParams.get('entitlement') || 'unknown');
      return sendJson(res, 200, {
        title,
        entitlement,
        evaluation: evaluateTitle(title, entitlement),
        mock: true,
      });
    }

    if (req.method === 'POST' && pathname === '/api/chat') {
      const body = await readJsonBody(req);
      const message = String(body.message || '');
      const entitlement = String(body.entitlement || 'unknown');
      const image = parseImage(body.image);

      const result = answerChat({
        message,
        entitlement,
        hasImage: Boolean(image),
      });

      return sendJson(res, 200, { ...result, image });
    }

    if (pathname.startsWith('/api/')) {
      return sendJson(res, 404, { error: 'API_ROUTE_NOT_FOUND' });
    }

    return serveStatic(pathname, res);
  } catch (error) {
    console.error(error);
    return sendJson(res, 400, {
      error: 'REQUEST_ERROR',
      message: error.message || 'Request failed',
    });
  }
});

server.listen(PORT, () => {
  console.log(`MyVideo Helper MVP running at http://localhost:${PORT}`);
});
