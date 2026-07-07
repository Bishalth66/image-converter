# Image Converter

A browser-based image conversion and resizing tool built with Next.js, React, and TypeScript. The app lets users upload an image, preview it, resize it, choose an output format, tune quality where supported, and download the converted file.

## Features

- Drag-and-drop image upload with file picker support
- Live preview of the selected or converted image
- Export to JPG, PNG, WEBP, or AVIF
- Quality control for lossy formats
- Width and height resizing with optional aspect-ratio lock
- Output summary with dimensions, file size, and size change
- Fully client-side conversion using the browser canvas API

## Supported Input Files

The app accepts common browser-readable image formats, including:

- JPG / JPEG
- PNG
- WEBP
- AVIF
- GIF
- BMP
- SVG
- TIFF
- HEIC / HEIF, when supported by the browser

Browser support can vary by format. If a browser cannot decode a selected file, the app will show an error message.

## Tech Stack

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [react-dropzone](https://react-dropzone.js.org/)

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
```

### Start Production Server

```bash
npm run start
```

### Lint

```bash
npm run lint
```

## Project Structure

```text
src/
  app/
    layout.tsx
    page.tsx
    globals.css
  components/
    ImageConverter.tsx
    image-converter/
      ExportPanel.tsx
      FormatPanel.tsx
      ImageDropzone.tsx
      ResizePanel.tsx
      config.ts
      types.ts
      useImageConverter.ts
      utils.ts
```

## How It Works

1. The user selects an image with drag-and-drop or the file picker.
2. The browser decodes the image and shows a preview.
3. The user chooses an output format and optional resize settings.
4. The app draws the image to a canvas and exports it as a new Blob.
5. The converted image is made available for download.

Image processing happens locally in the browser. Files are not uploaded to a server by this application.

## Deployment

This project can be deployed to any platform that supports Next.js applications, such as Vercel, Netlify, or a Node.js server.

For Vercel, connect the repository and use the default Next.js build settings:

- Build command: `npm run build`
- Output: handled automatically by Next.js

