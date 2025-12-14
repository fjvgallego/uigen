# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in a chat interface, and Claude generates the code which renders in real-time in an iframe preview.

## Commands

```bash
# Initial setup (install deps, generate Prisma client, run migrations)
npm run setup

# Development server with Turbopack
npm run dev

# Run tests
npm test

# Run a single test file
npx vitest src/lib/__tests__/file-system.test.ts

# Lint
npm run lint

# Reset database
npm run db:reset
```

## Architecture

### Core Flow
1. User sends message via chat interface → `src/app/api/chat/route.ts`
2. Claude (or MockLanguageModel if no API key) generates components using AI SDK tools
3. Tool calls modify the VirtualFileSystem (in-memory, no disk writes)
4. FileSystemContext propagates changes to UI
5. PreviewFrame transforms JSX with Babel and renders in sandboxed iframe

### Key Components

**Virtual File System** (`src/lib/file-system.ts`)
- `VirtualFileSystem` class manages all files in-memory
- Supports CRUD operations, serialize/deserialize for persistence
- Used by both server (in API route) and client (via context)

**AI Tools** (`src/lib/tools/`)
- `str_replace_editor`: Create files, string replace, insert lines
- `file_manager`: Rename and delete files

**Preview System** (`src/lib/transform/jsx-transformer.ts`)
- Transforms JSX/TSX using Babel standalone
- Creates import maps with blob URLs for local files
- Third-party packages loaded from esm.sh
- CSS files collected and injected as style tags

**Contexts** (`src/lib/contexts/`)
- `FileSystemProvider`: Wraps VirtualFileSystem, handles tool call side effects
- `ChatProvider`: Manages chat state, streaming responses

### Data Model
- SQLite database via Prisma
- Users have Projects, each Project stores serialized messages and file system data

### Import Aliases
- `@/*` maps to `./src/*` (configured in tsconfig.json)
- Generated components use `@/` imports (e.g., `import Foo from '@/components/Foo'`)

### UI Components
- shadcn/ui components in `src/components/ui/` (new-york style)
- Tailwind CSS v4 for styling
