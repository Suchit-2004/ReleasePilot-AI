import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeLog } from "./analyzer.js";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const PUBLIC = path.join(ROOT, "public");
const PORT = Number(process.env.PORT) || 3000;
const MAX_BODY = 1024 * 1024;

const FILES = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/style.css": ["style.css", "text/css; charset=utf-8"],
  "/app.js": ["app.js", "text/javascript; charset=utf-8"]
};

const server = http.createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");

  const pathname = new URL(
    req.url,
    `http://${req.headers.host || "localhost"}`
  ).pathname;

  if (req.method === "POST" && pathname === "/api/analyze") {
    try {
      let body = "";
      let size = 0;

      for await (const chunk of req) {
        size += chunk.length;

        if (size > MAX_BODY) {
          res.writeHead(413, {
            "Content-Type": "application/json"
          });
          res.end(JSON.stringify({ error: "Log exceeds the 1 MB limit." }));
          return;
        }

        body += chunk.toString("utf8");
      }

      const payload = JSON.parse(body);

      if (typeof payload.content !== "string") {
        throw new Error("Provide log content as a string.");
      }

      const report = analyzeLog(payload.content);

      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      });
      res.end(JSON.stringify(report));
    } catch (error) {
      res.writeHead(400, {
        "Content-Type": "application/json; charset=utf-8"
      });
      res.end(JSON.stringify({ error: error.message }));
    }

    return;
  }

  if (req.method !== "GET" || !FILES[pathname]) {
    res.writeHead(404, {
      "Content-Type": "text/plain; charset=utf-8"
    });
    res.end("Not found");
    return;
  }

  const [filename, contentType] = FILES[pathname];

  try {
    const content = await fs.promises.readFile(
      path.join(PUBLIC, filename)
    );

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-cache"
    });
    res.end(content);
  } catch {
    res.writeHead(500, {
      "Content-Type": "text/plain; charset=utf-8"
    });
    res.end("Dashboard files are missing. Check the public folder.");
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`ReleasePilot AI dashboard: http://127.0.0.1:${PORT}`);
  console.log("Local diagnostic mode; no live Copado connection configured.");
});