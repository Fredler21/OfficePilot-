<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/SQLite-WAL-003B57?logo=sqlite" alt="SQLite" />
  <img src="https://img.shields.io/badge/OpenAI-GPT--4o-412991?logo=openai" alt="OpenAI" />
  <img src="https://img.shields.io/badge/Tests-119%20Passing-brightgreen" alt="Tests" />
</p>

# 🚀 OfficePilot v1

> **Your AI-powered productivity copilot for Microsoft Office** — helping you write, analyze, format, and build smarter workflows across **Word**, **Excel**, **PowerPoint**, and **Access**.

OfficePilot is a full-stack AI assistant that **exclusively** focuses on Microsoft Office. It doesn't do general chat. It doesn't browse the web. It helps you get things done in Office — faster and smarter.

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [📦 Supported Office Apps](#-supported-office-apps)
- [🏗️ Architecture](#️-architecture)
- [📂 Project Structure](#-project-structure)
- [⚡ Quick Start](#-quick-start)
- [🔧 Environment Variables](#-environment-variables)
- [🌐 API Reference](#-api-reference)
- [🧪 Testing](#-testing)
- [🌍 Internationalization](#-internationalization)
- [🛠️ Tool Inventory](#️-tool-inventory)
- [📚 Template Library](#-template-library)
- [🔒 Security](#-security)
- [📄 License](#-license)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Agent Runtime** | ReAct-style reasoning loop with GPT-4o — the agent thinks, calls tools, and responds intelligently |
| 📄 **Document Understanding** | Upload `.docx`, `.xlsx`, `.pptx` files and get instant context-aware help |
| 🔧 **23 Specialized Tools** | Purpose-built tools for Word, Excel, PowerPoint, Access, and general tasks |
| 🎯 **App Mode Switching** | Switch between Word, Excel, PowerPoint, Access, or General mode for targeted help |
| 🔄 **Streaming Responses** | Real-time SSE streaming for natural, responsive conversations |
| 🧠 **Memory & Preferences** | Remembers your style, preferences, and past context across sessions |
| 📋 **Template Library** | 11 ready-to-use templates across all four Office apps |
| 👀 **Action Previews** | Destructive changes require approval before execution — never lose your work |
| 🌍 **Multilingual** | Full support for 🇺🇸 English, 🇫🇷 French, and 🇭🇹 Haitian Creole |
| 📊 **Learning Modes** | "Do For Me", "Walk Me Through", "Beginner Explain", or "Show Both" |
| 🗄️ **SQLite Database** | WAL-mode SQLite with full migration system and audit logging |
| 🔒 **Secure by Design** | Timing-safe admin auth, input validation, XSS prevention, audit trails |

---

## 📦 Supported Office Apps

> ⚠️ **OfficePilot ONLY helps with Microsoft Office.** Non-Office requests are politely redirected.

### 📝 Microsoft Word
- ✍️ Writing, editing, rewriting text
- 📐 Document structure, headings, formatting
- 📖 Citation formatting (APA, MLA, Chicago, Harvard)
- 📄 Resumes, reports, memos, proposals, cover letters
- 📋 Summaries, outlines, table of contents
- ✅ Grammar, tone, clarity improvements

### 📊 Microsoft Excel
- 🧮 Formula generation from plain English
- 🔍 Formula explanation and debugging
- 📈 Chart recommendations and data visualization
- 🧹 Data cleaning and organization
- 📊 Pivot tables, conditional formatting, VLOOKUP, XLOOKUP, INDEX/MATCH
- 💰 Budgets, dashboards, trackers, grade sheets

### 📽️ Microsoft PowerPoint
- 🎯 Turn notes into structured slide outlines
- ✂️ Compress verbose slides into concise content
- 🗣️ Generate tailored speaker notes
- 🎨 Visual and layout suggestions
- 📖 Improve storytelling and flow

### 🗃️ Microsoft Access
- 🏗️ Database schema design from requirements
- 🔗 Relationship mapping and explanation
- 📝 Query help (SELECT, JOIN, aggregate, subquery)
- 📋 Form and report suggestions
- 🔄 Normalization advice

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                    🖥️ Frontend (React)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  Header   │  │ Sidebar  │  │ChatPanel │  │FileUp  │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
└───────────────────────┬────────────────────────────────┘
                        │ HTTP / SSE
┌───────────────────────▼────────────────────────────────┐
│                  🌐 API Routes (Next.js)               │
│  /chat  /chat/stream  /files/parse  /sessions  /admin  │
│  /templates  /actions/preview  /actions/apply  /health  │
└───────────────────────┬────────────────────────────────┘
                        │
┌───────────────────────▼────────────────────────────────┐
│              🤖 Agent Runtime (ReAct Loop)             │
│  System Prompt → AI Complete → Tool Calls → Response   │
│            Max 8 reasoning rounds per turn             │
└───┬───────────────────┬────────────────────────────┬───┘
    │                   │                            │
┌───▼──────┐    ┌───────▼──────┐             ┌───────▼──────┐
│🔧 Tools  │    │📄 Parsers    │             │🗄️ Database   │
│  (23)    │    │ Word/Excel/  │             │  SQLite WAL  │
│          │    │ PPT/Access   │             │  11 tables   │
└──────────┘    └──────────────┘             └──────────────┘
```

---

## 📂 Project Structure

```
OfficePilot/
├── 📄 package.json              # Dependencies & scripts
├── 📄 tsconfig.json             # TypeScript config
├── 📄 next.config.js            # Next.js config
├── 📄 tailwind.config.js        # Tailwind CSS config
├── 📄 vitest.config.ts          # Unit test config
├── 📄 vitest.e2e.config.ts      # E2E test config
├── 📄 .env.example              # Environment template
├── 📄 .env.local                # Local environment (gitignored)
│
├── 📁 src/
│   ├── 📁 app/                  # Next.js App Router
│   │   ├── 📄 layout.tsx        # Root layout
│   │   ├── 📄 page.tsx          # Main page
│   │   ├── 📄 globals.css       # Global styles
│   │   └── 📁 api/              # API routes
│   │       ├── 📁 chat/         # POST /chat, POST /chat/stream
│   │       ├── 📁 files/        # POST /files/parse
│   │       ├── 📁 sessions/     # GET /sessions/:id
│   │       ├── 📁 templates/    # GET /templates
│   │       ├── 📁 actions/      # POST /actions/preview, /actions/apply
│   │       ├── 📁 health/       # GET /health
│   │       ├── 📁 apps/         # GET /apps/support
│   │       └── 📁 admin/        # GET /admin/logs, /admin/tools
│   │
│   ├── 📁 components/           # React components
│   │   ├── 📁 layout/           # Header, Sidebar
│   │   └── 📁 chat/             # ChatPanel, ChatMessage, ChatInput,
│   │                            # FileUpload, WelcomeScreen
│   │
│   └── 📁 lib/                  # Core library
│       ├── 📁 agents/           # 🤖 OfficePilotAgent, prompts, types
│       ├── 📁 ai/               # 🧠 AI provider abstraction (OpenAI)
│       ├── 📁 api/              # 🌐 API helpers & response envelopes
│       ├── 📁 config/           # ⚙️ Zod-validated environment config
│       ├── 📁 context/          # 📄 File parsers (Word, Excel, PPT, Access)
│       ├── 📁 db/               # 🗄️ SQLite connection & migrations
│       ├── 📁 errors/           # ❌ Typed error hierarchy
│       ├── 📁 i18n/             # 🌍 Internationalization (en/fr/ht)
│       ├── 📁 logging/          # 📋 Structured JSON logger
│       ├── 📁 memory/           # 🧠 Memory store
│       ├── 📁 retrieval/        # 🔍 Knowledge retrieval engine
│       ├── 📁 session/          # 💬 Session store
│       ├── 📁 templates/        # 📚 Template library (11 templates)
│       ├── 📁 tools/            # 🔧 Tool registry + all 23 tools
│       │   ├── 📁 word/         # 5 Word tools
│       │   ├── 📁 excel/        # 5 Excel tools
│       │   ├── 📁 powerpoint/   # 4 PowerPoint tools
│       │   ├── 📁 access/       # 4 Access tools
│       │   └── 📁 general/      # 5 General tools
│       └── 📄 types.ts          # Shared TypeScript types
│
└── 📁 data/                     # SQLite database (gitignored)
```

---

## ⚡ Quick Start

### 📋 Prerequisites

- 🟢 **Node.js** ≥ 18
- 🔑 **OpenAI API Key** with GPT-4o access

### 🔄 Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/Fredler21/OfficePilot-.git
cd OfficePilot-

# 2️⃣ Install dependencies
npm install

# 3️⃣ Configure environment
cp .env.example .env.local
# Edit .env.local and add your OPENAI_API_KEY

# 4️⃣ Start the development server
npm run dev
```

### 🌐 Open in Browser

Navigate to **http://localhost:3000** and start chatting with OfficePilot!

---

## 🔧 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | ✅ Yes | — | Your OpenAI API key |
| `DATABASE_PATH` | ❌ No | `./data/officepilot.db` | SQLite database file path |
| `NEXT_PUBLIC_APP_NAME` | ❌ No | `OfficePilot` | App display name |
| `NEXT_PUBLIC_DEFAULT_LANGUAGE` | ❌ No | `en` | Default language (`en`, `fr`, `ht`) |
| `MAX_FILE_SIZE_MB` | ❌ No | `25` | Maximum upload file size in MB |
| `SESSION_TTL_HOURS` | ❌ No | `72` | Session time-to-live in hours |
| `ADMIN_API_KEY` | ❌ No | `change-me-in-production` | Admin API key for protected endpoints |
| `LOG_LEVEL` | ❌ No | `info` | Logging level (`debug`, `info`, `warn`, `error`) |

---

## 🌐 API Reference

### 💬 Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | 💬 Send a message and receive a full response |
| `POST` | `/api/chat/stream` | 🔄 Send a message and receive SSE stream |

**Request Body:**
```json
{
  "message": "How do I create a VLOOKUP formula?",
  "sessionId": "optional-session-id",
  "appMode": "excel",
  "language": "en",
  "learningMode": "walkthrough"
}
```

### 📄 Files

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/files/parse` | 📤 Upload and parse an Office file |

**Supported formats:** `.docx`, `.xlsx`, `.pptx`

### 💾 Sessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/sessions/:id` | 📋 Get session details and messages |

### 📚 Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/templates` | 📋 List templates (filter by `appType`, `category`) |

### 🎬 Actions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/actions/preview` | 👀 Create an action preview for approval |
| `POST` | `/api/actions/apply` | ✅ Apply an approved action |

### 🔧 System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | 💚 Health check |
| `GET` | `/api/apps/support` | 📋 Supported apps, languages, and modes |

### 🔐 Admin (requires `x-admin-key` header)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/logs` | 📋 View audit logs |
| `GET` | `/api/admin/tools` | 🔧 View registered tools inventory |

### 📦 Response Envelope

All API responses follow a consistent envelope format:

```json
{
  "success": true,
  "data": { ... },
  "meta": { "sessionId": "...", "appMode": "excel" },
  "warnings": [],
  "errors": []
}
```

---

## 🧪 Testing

OfficePilot has comprehensive test coverage with **119 tests** across **13 test suites**.

```bash
# 🧪 Run all unit tests
npm test

# 📊 Run with coverage
npm run test:coverage

# 👀 Run in watch mode
npm run test:watch
```

### ✅ Test Coverage

| Module | Tests | Status |
|--------|-------|--------|
| ⚙️ Config (Zod validation) | 2 | ✅ |
| 📋 Logger | 3 | ✅ |
| ❌ Error hierarchy | 8 | ✅ |
| 🌍 i18n (en/fr/ht) | 10 | ✅ |
| 🔧 Tool registry | 7 | ✅ |
| 🔧 All 23 tools (structure) | 31 | ✅ |
| 🤖 Agent prompts | 8 | ✅ |
| 🤖 Agent runtime | 4 | ✅ |
| 🗃️ Access parser | 6 | ✅ |
| 📂 File type mapping | 8 | ✅ |
| 🗄️ Session store (DB) | 8 | ✅ |
| 🧠 Memory store (DB) | 7 | ✅ |
| 📚 Template library (DB) | 8 | ✅ |
| 🌐 API helpers | 8 | ✅ |
| **Total** | **119** | ✅ **All passing** |

---

## 🌍 Internationalization

OfficePilot supports three languages out of the box:

| Flag | Language | Code | Status |
|------|----------|------|--------|
| 🇺🇸 | English | `en` | ✅ Full support |
| 🇫🇷 | French | `fr` | ✅ Full support |
| 🇭🇹 | Haitian Creole | `ht` | ✅ Full support |

The AI agent adapts its language output based on:
- 🎛️ User's language selection in the sidebar
- 🔍 Automatic language detection from input text
- 💾 Saved language preferences

---

## 🛠️ Tool Inventory

### 📝 Word Tools (5)

| Tool | Description |
|------|-------------|
| `analyze_word_document` | 📊 Analyze document structure, headings, word count |
| `rewrite_selection` | ✍️ Rewrite text with tone/style adjustments (requires preview) |
| `format_citation` | 📖 Format citations in APA, MLA, Chicago, or Harvard |
| `generate_outline` | 📋 Create a structured document outline |
| `summarize_text` | 📝 Summarize text to a target length |

### 📊 Excel Tools (5)

| Tool | Description |
|------|-------------|
| `build_excel_formula` | 🧮 Generate Excel formulas from plain English |
| `explain_excel_formula` | 🔍 Explain what a formula does step by step |
| `analyze_spreadsheet_errors` | 🐛 Find and fix spreadsheet errors |
| `recommend_chart` | 📈 Suggest the best chart type for your data |
| `analyze_spreadsheet` | 📊 Full spreadsheet analysis and insights |

### 📽️ PowerPoint Tools (4)

| Tool | Description |
|------|-------------|
| `generate_presentation_outline` | 🎯 Create a slide outline from topic or notes |
| `compress_slide_text` | ✂️ Make verbose slides concise and punchy |
| `generate_speaker_notes` | 🗣️ Write speaker notes for slides |
| `suggest_slide_visuals` | 🎨 Recommend visuals and layout improvements |

### 🗃️ Access Tools (4)

| Tool | Description |
|------|-------------|
| `design_access_schema` | 🏗️ Design normalized database schemas |
| `generate_access_query_help` | 📝 Help write SQL/Access queries |
| `explain_relationship_map` | 🔗 Explain table relationships |
| `suggest_form_report` | 📋 Suggest forms and reports |

### ⚙️ General Tools (5)

| Tool | Description |
|------|-------------|
| `translate_output` | 🌐 Translate text between supported languages |
| `load_user_memory` | 🧠 Load user's saved context and preferences |
| `save_user_preference` | 💾 Save a user preference |
| `preview_file_changes` | 👀 Preview file changes before applying (requires approval) |
| `load_template` | 📚 Load a template from the library |

---

## 📚 Template Library

OfficePilot comes with **11 pre-built templates** ready to use:

### 📝 Word Templates
| Template | Category |
|----------|----------|
| 📄 Professional Resume | Resume |
| 📊 Business Report | Report |
| ✉️ Cover Letter | Letter |

### 📊 Excel Templates
| Template | Category |
|----------|----------|
| 💰 Monthly Budget | Budget |
| 🎓 Grade Tracker | Education |
| 📈 Sales Dashboard | Business |

### 📽️ PowerPoint Templates
| Template | Category |
|----------|----------|
| 💼 Business Presentation | Business |
| 🏫 Class Presentation | Education |

### 🗃️ Access Templates
| Template | Category |
|----------|----------|
| 👥 Customer Database | Business |
| 📦 Inventory Tracker | Business |
| 👔 Employee Tracker | HR |

---

## 🔒 Security

OfficePilot follows security best practices:

- 🔐 **Timing-safe admin key comparison** — prevents timing attacks on the admin API
- ✅ **Input validation** — Zod schemas validate all configuration and request data
- 🛡️ **XSS prevention** — React's built-in escaping + no `dangerouslySetInnerHTML`
- 📋 **Audit logging** — all administrative actions are logged with timestamps
- 🔒 **Action previews** — destructive file changes require explicit user approval
- 🚫 **Office-only scope** — the agent refuses non-Microsoft Office requests
- 📝 **Structured error handling** — typed error hierarchy with proper HTTP status codes
- 🗄️ **Database safety** — WAL mode, foreign keys, parameterized queries (no SQL injection)

---

## 🗄️ Database Schema

OfficePilot uses **SQLite** with **11 tables**:

| Table | Purpose |
|-------|---------|
| `users` | 👤 User profiles and preferences |
| `sessions` | 💬 Chat sessions per user/app mode |
| `messages` | 📨 Chat messages (user, assistant, tool) |
| `user_preferences` | ⚙️ Key-value user settings |
| `memory_entries` | 🧠 Long-term user memory |
| `file_records` | 📄 Uploaded file metadata |
| `tool_calls` | 🔧 Tool invocation history |
| `action_previews` | 👀 Pending/applied file actions |
| `audit_logs` | 📋 Admin audit trail |
| `template_library` | 📚 Template definitions |
| `indexed_knowledge` | 🔍 Searchable knowledge base |

---

## 🧑‍💻 Scripts

```bash
npm run dev          # 🚀 Start development server
npm run build        # 📦 Build for production
npm run start        # 🌐 Start production server
npm run lint         # 🔍 Lint the codebase
npm test             # 🧪 Run all tests
npm run test:watch   # 👀 Run tests in watch mode
npm run test:coverage # 📊 Run tests with coverage report
npm run type-check   # ✅ TypeScript type checking
```

---

## 📄 License

This project is for educational and productivity purposes. Built with ❤️ for Microsoft Office users.

---

<p align="center">
  <strong>🚀 OfficePilot v1</strong> — Your AI copilot for Microsoft Office<br/>
  📝 Word &nbsp;|&nbsp; 📊 Excel &nbsp;|&nbsp; 📽️ PowerPoint &nbsp;|&nbsp; 🗃️ Access<br/>
  🇺🇸 English &nbsp;|&nbsp; 🇫🇷 Français &nbsp;|&nbsp; 🇭🇹 Kreyòl Ayisyen
</p>
