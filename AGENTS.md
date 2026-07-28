# 🤖 AI Agent Orientation & Project Roadmap (agent.md)

> **IMPORTANT:** This is the primary orientation file for any AI Agent working on this repository. Before generating code or suggesting architectural changes, read this file to understand the project's identity, constraints, and domain logic.

## 🎯 Project Identity: Hospital Management System (HMS)

This is a **Platform-Agnostic Hospital Management System** designed to automate clinical and administrative workflows. The system must ensure high performance (response < 1s) and handle up to 1000 concurrent users.

## 🗺️ Project "Map" (Folder Structure)

Use this structure to locate files and maintain architectural integrity:

- `src/app/`: **STRICTLY** routing and page entry points. No business logic here.
- `src/features/`: **DOMAIN-SPECIFIC** logic. If you are working on "Patients" or "Billing", look here. Each feature has its own components, hooks, and types.
- `src/services/`: Centralized API calls and backend route definitions.
- `src/components/`: Global, reusable UI elements (ShadcnUI, etc.).
- `src/db/` & `src/lib/`: Database schemas (Drizzle) and third-party configs.

## 🛠️ Technical Context (The Stack)

- **Framework:** Next.js (App Router) + Hono (API Layer).
- **Database:** PostgreSQL with Drizzle ORM (Type-safe).
- **Logic Language:** TypeScript (for Web).
- **Auth:** BetterAuth implementing Role-Based Access Control (RBAC).

## 🎨 Design System: Clinical Precision

All UI work must follow the **Clinical Precision** design system. Colors are already configured in `src/app/globals.css` via Shadcn/UI + Tailwind CSS theme tokens — **always use semantic classes, never hard-code hex values in components.**

### Color Tokens (Design → Tailwind)

| Design role | Reference hex | Tailwind / CSS token             | Typical usage                     |
| ----------- | ------------- | -------------------------------- | --------------------------------- |
| Primary     | `#10B981`     | `primary`, `primary-foreground`  | Main actions, success, active nav |
| Secondary   | `#6B7280`     | `secondary`, `muted-foreground`  | Secondary text, muted UI          |
| Tertiary    | `#3B82F6`     | `chart-3`, `ring`                | Info highlights, links, charts    |
| Neutral     | `#F9FAFB`     | `background`, `muted`, `sidebar` | Page/card backgrounds             |

Each palette includes a 10-step tonal scale in the design spec. In code, rely on the existing `:root` / `.dark` variables in `globals.css` and their `@theme inline` mappings (e.g. `bg-primary`, `text-muted-foreground`, `border-border`).

### Typography

Use the `--font-sans` variable (wired in `src/app/layout.tsx`) via `font-sans`:

| Style    | Tailwind guidance                                                  |
| -------- | ------------------------------------------------------------------ |
| Headline | `text-2xl font-bold` or `text-3xl font-bold` — page/section titles |
| Body     | `text-sm` or `text-base font-medium` — default content             |
| Label    | `text-xs text-muted-foreground` — captions, form labels            |

### UI Components (Design → Shadcn)

Reuse components from `src/components/ui/`. Map design patterns to existing variants:

| Design pattern       | Implementation                                                                        |
| -------------------- | ------------------------------------------------------------------------------------- |
| Primary button       | `<Button variant="default">` — `bg-primary text-primary-foreground`                   |
| Secondary button     | `<Button variant="secondary">`                                                        |
| Outlined button      | `<Button variant="outline">`                                                          |
| Inverted button      | `bg-foreground text-background` (or extend `Button` if reused often)                  |
| Search bar           | `<Input>` with search icon, placeholder `"Search"`, rounded                           |
| Progress bars        | Green → `bg-primary`; gray → `bg-muted-foreground`; blue → `bg-chart-3`               |
| Navigation pill      | Light `bg-muted` bar; active item → `bg-primary` circle + white icon                  |
| Edit action          | Small icon button — `<Button variant="outline" size="icon-sm">`                       |
| Delete / destructive | `<Button variant="destructive">` or red icon — **must** pair with confirmation dialog |

### Agent Rules for UI

1. Use Shadcn components and Tailwind semantic tokens from `globals.css` — do not add new color palettes or duplicate CSS variables.
2. Merge classes with `cn()` from `@/lib/utils`.
3. Destructive actions require a confirmation prompt (see Safety First below).
4. Keep layouts on neutral backgrounds with rounded cards; respect `--radius` for border radius.

## 🔑 Core Domain Logic (Do Not Deviate)

When the AI is asked to build features, it must follow these rules from the **SRS/Design Document**:

1.  **Identity:** Every patient **must** have a Personal Health Number (PHN) and a unique System ID.
2.  **Role Boundaries (RBAC):**
    - **Admin:** Full control + Database Sync.
    - **Doctor:** Clinical tasks (Update Case Papers, Prescribe medicine) [1.2 Sequence Diagram].
    - **Receptionist:** Administrative only (Add patients, Billing). **CANNOT** modify clinical data.
3.  **Safety First:** Any data deletion (like deleting a Patient ID) **must** trigger a confirmation prompt.
4.  **Data Mandatory Fields:** First Name, Last Name, Phone, PHN, Address.

## 🚀 AI Mission Goals

- **Maintain Clean Architecture:** Keep features isolated.
- **Performance:** Ensure Drizzle queries are optimized for < 1s response times.
- **Consistency:** Use the global `utils` for date formatting and Tailwind merging (`cn()`).

---

# AI Development Rules

## Workflow

For every task:

1. Read this file before making changes.
2. Analyze the existing codebase.
3. Search before creating new files.
4. Reuse existing components, hooks, utilities, and services.
5. Follow the current folder structure.
6. Never duplicate business logic.
7. Prefer composition over inheritance.
8. Maintain strict TypeScript safety.
9. Ensure accessibility.
10. Review all changes before finishing.

## Architecture

- Follow Feature First Architecture.
- Keep components small and reusable.

## Rules

- Never create duplicate components.
- Never introduce unnecessary dependencies.
- Never assume something doesn't exist without searching the repository.
- Prefer existing design system components.
- Follow existing naming conventions.
