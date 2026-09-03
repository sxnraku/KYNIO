// Servidor estático mínimo para preview do mockup de design.
/* eslint-disable no-undef */
// Aceita --port/--host (ou PORT/HOST) para integração com o preview do Kimi Work.
const http = require("http");
const fs = require("fs");
const path = require("path");

function argValue(flag, fallback) {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  const eq = process.argv.find((a) => a.startsWith(flag + "="));
  if (eq) return eq.split("=")[1];
  return fallback;
}

const port = Number(argValue("--port", process.env.PORT || 7100));
const host = argValue("--host", process.env.HOST || "0.0.0.0");
const root = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json",
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  let filePath = path.join(root, urlPath === "/" ? "index.html" : urlPath);
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(data);
  });
});

server.listen(port, host, () => {
  console.log(`Preview em http://localhost:${port}/`);
});
