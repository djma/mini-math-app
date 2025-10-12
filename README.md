# p5 + TypeScript + Bun

This repository contains a minimal p5.js sketch written in TypeScript and managed with Bun.

## Getting started

Install dependencies:

```bash
bun install
```

Start the development server (bundler + static file server):

```bash
bun run dev
```

The sketch is available at [http://localhost:5173](http://localhost:5173). Set the `PORT` environment variable if you need a different port.

## Useful scripts

- `bun run build` – produce an optimized bundle at `public/sketch.js`.
- `bun run check` – run the TypeScript compiler in no-emit mode for quick type checking.

## Project layout

- `src/main.ts` – entry point for the p5 sketch.
- `public/index.html` – HTML shell served during development.
- `dev.ts` – small helper that runs the Bun bundler in watch mode and serves the files from `public/`.
