# Cheatsheet Generator

A React-based application for creating and exporting cheatsheets as PDF documents using Markdown.

<img width="1889" height="999" alt="image" src="https://github.com/user-attachments/assets/0e47ec77-42c0-4cd2-a951-99bab3550476" />




## Features

- Real-time Markdown editing
- Live preview of formatted Markdown content
- PDF export via browser print functionality
- Customizable multi-column layout settings
- Mathematical expressions with KaTeX (lazy-loaded for performance)
- HTML support in Markdown 
- Diagrams with Mermaid
- drag and drop images directly into the editor (images are stored in IndexedDB, F12 clear site data to remove)

- Automatic saving settings using localStorage
- Create, rename, delete, and switch between multiple files
- Push and pull files to/from GitHub repositories for backup and synchronization

## Tech Stack

- React
- Vite
- Monaco Editor for code editing
- KaTeX for mathematical expressions


## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

