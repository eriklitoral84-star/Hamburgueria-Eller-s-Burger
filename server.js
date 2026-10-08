(async () => {
  const http = await import("node:http");
  const fs = await import("node:fs/promises");
  const path = await import("node:path");

  const distDir = path.resolve(process.cwd(), "dist");
  const indexFile = path.join(distDir, "index.html");

  const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2"
  };

  await fs.access(indexFile);

  const server = http.createServer(async (req, res) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Método não permitido");
      return;
    }

    let pathname;

    try {
      pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname
      );
    } catch {
      res.writeHead(400);
      res.end("Caminho inválido");
      return;
    }

    let filePath = path.resolve(distDir, `.${pathname}`);

    if (
      filePath !== distDir &&
      !filePath.startsWith(distDir + path.sep)
    ) {
      res.writeHead(403);
      res.end("Acesso negado");
      return;
    }

    const sendFile = async (target) => {
      const content = await fs.readFile(target);
      let type =
        mimeTypes[path.extname(target).toLowerCase()] ||
        "application/octet-stream";

      // Detect true image mime type by magic bytes if applicable
      if (content.length > 4) {
        if (content[0] === 0x89 && content[1] === 0x50 && content[2] === 0x4e && content[3] === 0x47) {
          type = "image/png";
        } else if (content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff) {
          type = "image/jpeg";
        }
      }

      res.writeHead(200, { "Content-Type": type });
      res.end(req.method === "HEAD" ? undefined : content);
    };

    try {
      const stats = await fs.stat(filePath);

      if (stats.isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }

      await sendFile(filePath);
    } catch {
      if (!path.extname(pathname)) {
        try {
          await sendFile(indexFile);
          return;
        } catch {
          // Continua para a resposta 404.
        }
      }

      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Arquivo não encontrado");
    }
  });

  const port = Number(process.env.PORT) || 3000;
  server.listen(port, "0.0.0.0", () => {
    console.log(`Servidor iniciado na porta ${port}`);
  });
})().catch((error) => {
  console.error("Falha ao iniciar o servidor:", error);
  process.exit(1);
});
