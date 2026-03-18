<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/SQLite-WAL-003B57?logo=sqlite" alt="SQLite" />
  <img src="https://img.shields.io/badge/OpenAI-GPT--4o-412991?logo=openai" alt="OpenAI" />
</p>

# 📐 OfficePilot v2

> **Your Grammarly-style AI formatting assistant for Microsoft Office** — helping you format, structure, and optimize documents across **Word**, **Excel**, **PowerPoint**, and **Access**. OfficePilot does **NOT** write content for you — it helps you format your own work correctly.

OfficePilot is a full-stack AI assistant that **exclusively** focuses on Microsoft Office formatting and structure. Think of it as Grammarly, but instead of checking grammar, it checks your document formatting against style guides (APA, MLA, Chicago, Harvard, IEEE, Turabian) and teaches you exactly where to click in Office to fix things.

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [📦 Supported Office Apps](#-supported-office-apps)
- [📚 PDF Knowledge Ingestion](#-pdf-knowledge-ingestion)
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
| 📐 **Formatting Assistant** | Checks documents against APA, MLA, Chicago, Harvard, IEEE, and Turabian style guides |
| 📚 **PDF Knowledge Ingestion** | Upload PDFs about Word, Excel, PowerPoint, and Access to build the AI's own reference knowledge |
| 🤖 **AI Agent Runtime** | ReAct-style reasoning loop with GPT-4o — the agent thinks, calls tools, and responds intelligently |
| 📄 **Document Understanding** | Upload `.docx`, `.xlsx`, `.pptx` files and get instant formatting analysis |
| 🔧 **24 Specialized Tools** | Purpose-built tools for formatting checks, citation formatting, structure validation, and more |
| 🎯 **App Mode Switching** | Switch between Word, Excel, PowerPoint, Access, or General mode for targeted help |
| 🔄 **Streaming Responses** | Real-time SSE streaming for natural, responsive conversations |
| 🧠 **Memory & Preferences** | Remembers your style preferences and past context across sessions |
| 📋 **Template Library** | Ready-to-use correctly-formatted templates across all four Office apps |
| 👀 **Action Previews** | Destructive changes require approval before execution |
| 🌍 **Multilingual** | Full support for 🇺🇸 English, 🇫🇷 French, and 🇭🇹 Haitian Creole |
| 📊 **Learning Modes** | "Do For Me", "Walk Me Through", "Beginner Explain", or "Show Both" |
| ❌ **Not a Content Writer** | OfficePilot does NOT write essays, letters, or paragraphs — it helps you format YOUR work |

---

## 📦 Supported Office Apps

> ⚠️ **OfficePilot ONLY helps with Microsoft Office formatting and structure.** It does NOT write content for users. Non-Office requests are politely redirected.

### 📝 Microsoft Word — Formatting & Structure
- 📐 Document formatting compliance (APA 7th ed., MLA 9th ed., Chicago, Harvard, IEEE, Turabian)
- 📏 Heading hierarchy validation (H1 → H2 → H3 proper nesting)
- 📖 Citation and bibliography formatting (in-text, reference list, footnotes, endnotes)
- 📄 Margin, spacing, and font specifications per style guide
- 📋 Title page, abstract, body, and references section ordering
- 📑 Table of Contents, List of Figures, List of Tables generation
- 🔢 Page numbering, headers/footers per format requirements
- 📐 Document structure templates (research paper, essay, thesis, report)
- 🖱️ Exact instructions for WHERE to click in Word to apply formatting

### 📊 Microsoft Excel
- 🧮 Formula generation from plain English
- 🔍 Formula explanation and debugging
- 📈 Chart recommendations and data visualization
- 🧹 Data cleaning and organization
- 📊 Pivot tables, conditional formatting, VLOOKUP, XLOOKUP, INDEX/MATCH

### 📽️ Microsoft PowerPoint
- 🎯 Slide master and layout formatting
- 🎨 Color theme and font consistency
- 📐 Slide layout principles and alignment
- 🖼️ Image and visual formatting
- 📖 Presentation structure and flow

### 🗃️ Microsoft Access
- 🏗️ Database schema design and normalization
- 🔗 Relationship mapping and explanation
- 📝 Query help (SELECT, JOIN, aggregate, subquery)
- 📋 Form and report design
- 🔄 Normalization advice

---

## 📚 PDF Knowledge Ingestion

OfficePilot builds its own knowledge base by ingesting PDF reference materials. Upload official style guides, Office manuals, or formatting references to enhance the AI's expertise.

### How It Works

1. **Upload** a PDF through the Knowledge Base panel in the sidebar or via the API
2. **Parse** — the PDF text is extracted and split into overlapping chunks (2000 chars, 200 overlap)
3. **Store** — chunks are indexed in the `indexed_knowledge` table by category
4. **Retrieve** — when a user asks a question, relevant chunks are searched and injected into the AI's context

### Categories

| Category | Description |
|----------|-------------|
| `word` | Microsoft Word formatting, style guides, document structure |
| `excel` | Excel formulas, functions, data analysis |
| `powerpoint` | PowerPoint design, layouts, presentations |
| `access` | Access database design, queries, forms |
| `general` | General Office knowledge |

### API Usage

```bash
# Upload a PDF (requires admin key)
curl -X POST http://localhost:3000/api/knowledge/ingest \
  -H "x-admin-key: your-admin-key" \
  -F "file=@apa-7th-edition-guide.pdf" \
  -F "category=word"

# List all ingested sources
curl http://localhost:3000/api/knowledge \
  -H "x-admin-key: your-admin-key"

# Search knowledge base
curl "http://localhost:3000/api/knowledge?q=apa+margins&category=word" \
  -H "x-admin-key: your-admin-key"

# Delete a source
curl -X DELETE "http://localhost:3000/api/knowledge?source=apa-7th-edition-guide.pdf" \
  -H "x-admin-key: your-admin-key"
```

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                    🖥️ Frontend (React)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  Header   │  │ Sidebar  │  │ChatPanel │  │FileUp  │ │
│  │          │  │+Knowledge│  │          │  │        │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
└───────────────────────┬────────────────────────────────┘
                        │ HTTP / SSE
┌───────────────────────▼────────────────────────────────┐
│                  🌐 API Routes (Next.js)               │
│  /chat  /chat/stream  /files/parse  /sessions  /admin  │
│  /templates  /actions/preview  /actions/apply           │
│  /knowledge/ingest  /knowledge                          │
└───────────────────────┬────────────────────────────────┘
                        │
┌───────────────────────▼────────────────────────────────┐
│              🤖 Agent Runtime (ReAct Loop)             │
│  Knowledge Context → System Prompt → AI → Tools → Resp │
│            Max 8 reasoning rounds per turn             │
└───┬───────────┬───────────────────────┬────────────┬───┘
    │           │                       │            │
┌───▼──────┐ ┌──▼──────────┐  ┌────────▼─────┐ ┌───▼──────┐
│🔧 Tools  │ │📄 Parsers   │  │🗄️ Database   │ │📚 Know-  │
│  (24)    │ │ Word/Excel/ │  │  SQLite WAL  │ │  ledge   │
│          │ │ PPT/Access  │  │  11 tables   │ │  Base    │
└──────────┘ └─────────────┘  └──────────────┘ └──────────┘
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
│   │       ├── 📁 knowledge/    # POST /knowledge/ingest, GET/DELETE /knowledge
│   │       ├── 📁 apps/         # GET /apps/support
│   │       └── 📁 admin/        # GET /admin/logs, /admin/tools
│   │
│   ├── 📁 components/           # React components
│   │   ├── 📁 layout/           # Header, Sidebar
│   │   ├── 📁 chat/             # ChatPanel, ChatMessage, ChatInput,
│   │   │                        # FileUpload, WelcomeScreen
│   │   └── 📁 knowledge/        # KnowledgePanel (PDF upload & management)
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
│       ├── 📁 knowledge/        # 📚 PDF ingestion, chunking, search
│       ├── 📁 logging/          # 📋 Structured JSON logger
│       ├── 📁 memory/           # 🧠 Memory store
│       ├── 📁 retrieval/        # 🔍 Knowledge retrieval engine
│       ├── 📁 session/          # 💬 Session store
│       ├── 📁 templates/        # 📚 Template library (11 templates)
│       ├── 📁 tools/            # 🔧 Tool registry + all 24 tools
│       │   ├── 📁 word/         # 6 Word formatting tools
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
| `GET` | `/api/apps/support` | 📋 Supported apps, languages, and modes |

### 📚 Knowledge (requires `x-admin-key` header)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/knowledge/ingest` | 📤 Upload and ingest a PDF into the knowledge base |
| `GET` | `/api/knowledge` | 📋 List knowledge sources or search (`?q=query&category=word`) |
| `DELETE` | `/api/knowledge` | 🗑️ Delete a knowledge source (`?source=filename.pdf`) |

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

### 📝 Word Tools (6) — Formatting & Structure

| Tool | Description |
|------|-------------|
| `analyze_document_format` | 📐 Check document formatting compliance against APA, MLA, Chicago, Harvard, IEEE, Turabian |
| `format_citation` | 📖 Format citations in any major style (in-text, reference list, footnotes, endnotes) |
| `check_document_structure` | 📋 Validate heading hierarchy, section ordering, and document structure |
| `suggest_formatting_fixes` | 🔧 Suggest fixes for spacing, fonts, margins, and formatting issues (requires preview) |
| `generate_document_template` | 📄 Generate a correctly-formatted document skeleton per style guide |
| `format_table_of_contents` | 📑 Generate TOC, List of Figures, or List of Tables |

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
  <strong>� OfficePilot v2</strong> — Your AI formatting assistant for Microsoft Office<br/>
  📝 Word &nbsp;|&nbsp; 📊 Excel &nbsp;|&nbsp; 📽️ PowerPoint &nbsp;|&nbsp; 🗃️ Access<br/>
  🇺🇸 English &nbsp;|&nbsp; 🇫🇷 Français &nbsp;|&nbsp; 🇭🇹 Kreyòl Ayisyen
</p>
