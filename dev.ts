const port = Number(process.env.PORT ?? 5173);
const publicDir = "public";
const bundlePath = `${publicDir}/sketch.js`;

const bundler = Bun.spawn(
  [
    "bun",
    "build",
    "--watch",
    "--target=browser",
    `--outfile=${bundlePath}`,
    "src/main.ts"
  ],
  {
    stdout: "inherit",
    stderr: "inherit"
  }
);

const server = Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname.replace(/(\.\.\/?)/g, "");
    const resolvedPath =
      pathname === "/" ? "/index.html" : pathname;
    const filePath = `${publicDir}${resolvedPath}`;
    const file = Bun.file(filePath);

    if (await file.exists()) {
      const type = file.type || "application/octet-stream";
      return new Response(file, {
        headers: {
          "Content-Type": type
        }
      });
    }

    const fallback = Bun.file(`${publicDir}/index.html`);
    if (await fallback.exists()) {
      return new Response(fallback, {
        headers: {
          "Content-Type": "text/html; charset=utf-8"
        }
      });
    }

    return new Response("Not Found", { status: 404 });
  }
});

console.log(`🚀 Dev server running at http://localhost:${port}`);

let closed = false;
const cleanup = () => {
  if (closed) {
    return;
  }
  closed = true;
  server.stop(true);
  bundler.kill();
};

const terminate = () => {
  cleanup();
  process.exit(0);
};

process.on("SIGINT", terminate);
process.on("SIGTERM", terminate);

const exitCode = await bundler.exited;
cleanup();
process.exit(typeof exitCode === "number" ? exitCode : 0);
