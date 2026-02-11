/**
 * Servidor local para rodar a API em desenvolvimento (sem Vercel CLI).
 * Uso: npm run dev:api (em um terminal) e npm run dev (em outro). No .env: VITE_API_URL=http://localhost:3000
 */
import 'dotenv/config';
import http from 'http';
import { route } from './_lib/router.js';

const PORT = Number(process.env.PORT) || 3000;

function getBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function createRes(res) {
  let statusCode = 200;
  const headers = {};
  return {
    setHeader(key, value) {
      headers[key] = value;
      res.setHeader(key, value);
    },
    status(code) {
      statusCode = code;
      return {
        json(data) {
          res.writeHead(statusCode, { ...headers, 'Content-Type': 'application/json' });
          res.end(JSON.stringify(data));
        },
        end(data) {
          res.writeHead(statusCode, headers);
          res.end(data);
        },
      };
    },
    writeHead(code, h) {
      statusCode = code;
      Object.entries(h || {}).forEach(([k, v]) => res.setHeader(k, v));
    },
    end(data) {
      if (!res.headersSent) res.writeHead(statusCode, headers);
      res.end(data);
    },
  };
}

const server = http.createServer(async (req, res) => {
  const url = req.url || '/';
  const body = ['POST', 'PUT', 'PATCH'].includes(req.method) ? await getBody(req) : {};
  const headers = {};
  for (let i = 0; i < req.rawHeaders.length; i += 2) {
    headers[req.rawHeaders[i].toLowerCase()] = req.rawHeaders[i + 1];
  }
  const nodeReq = {
    method: req.method,
    url,
    headers,
    body,
  };
  const nodeRes = createRes(res);
  try {
    await route(nodeReq, nodeRes);
    if (!res.writableEnded) res.end();
  } catch (err) {
    console.error('[server-local]', err);
    if (!res.writableEnded) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Erro interno do servidor.' }));
    }
  }
});

server.listen(PORT, () => {
  console.log(`API local: http://localhost:${PORT}`);
  console.log(`Configure no .env: VITE_API_URL=http://localhost:${PORT}`);
});
