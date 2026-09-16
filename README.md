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

```bash
npm test
npm run build
```

## Environment variables

See `.env.example`. Core tools run without any keys. AI translation and live payments stay disabled until keys exist — they will not fake success.

## Privacy default

Organization, compression (raster path), conversion, watermarks, signatures and encryption run **in the browser**. Files are not uploaded for those tools. Temporary workspace copies live on the device for about two hours.

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [SECURITY.md](SECURITY.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
