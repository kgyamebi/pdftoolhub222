# PDF Tools Hub

A document productivity platform: discover a tool, process a file in the browser, download the result, then take a sensible next step. The session workspace keeps the latest PDF so you are not forced to start over.

**Positioning:** Everything you need to work with PDFs.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- `pdf-lib` / `@cantoo/pdf-lib` for PDF mutation and AES-256 encryption
- `pdfjs-dist` for preview, text extraction and rasterization
- IndexedDB workspace with automatic expiry
- Optional remote AI and payments behind provider interfaces

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://127.0.0.1:43127](http://127.0.0.1:43127).

Press **⌘K** (or **Ctrl+K**) anywhere for the command palette — natural language like “make PDF smaller” or “need a signature” jumps to a live tool.

```bash
npm test
npm run build
```

## Product identity

Files stay on the device. No account is required for core tools. Processing is local whenever the engine allows it. The workspace keeps the latest PDF for about two hours so you can chain compress → sign → protect without starting over.

## Interface

The UI is a design layer on top of the existing processors. Routes, workers, IndexedDB, SEO metadata and PDF engines are unchanged.

- **Homepage:** privacy-first hero, workflow ribbon, clustered tool galaxy
- **Tool pages:** three-column workspace (session · canvas · next actions) with a mobile thumb dock
- **Categories:** product stories, then every live tool
- **Workspace:** continue last task, streak, activity and local files
- **Trust chrome:** local / no-upload / no-account / auto-delete pills on every key surface
- **Motion:** Framer Motion with a reduced-motion cutout and a high-contrast mode

## Environment variables

See `.env.example`. Core tools run without any keys. AI translation and live payments stay disabled until keys exist — they will not fake success.

## Privacy default

Organization, compression (raster path), conversion, watermarks, signatures and encryption run **in the browser**. Files are not uploaded for those tools. Temporary workspace copies live on the device for about two hours.

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [SECURITY.md](SECURITY.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
