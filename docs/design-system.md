# Design System – CollabSpace

## Philosophy: "Refined Utility"

We prioritize speed, consistency, and accessibility. We rely on **Shadcn UI** for primitives and strict **Tailwind CSS** utility usage for layout. We avoid custom CSS classes unless absolutely necessary.

## 1. Color Palette (Tailwind Semantic Colors)

We map these to CSS variables in `globals.css` to support dark mode (future proofing), though MVP can be light-only if preferred.

| Semantic Name | Purpose | Value (Light) | Value (Dark) |
| :--- | :--- | :--- | :--- |
| `background` | Page background | `white` | `zinc-950` |
| `foreground` | Main text | `zinc-950` | `zinc-50` |
| `card` | Card background | `white` | `zinc-950` |
| `card-foreground` | Card text | `zinc-950` | `zinc-50` |
| `popover` | Modals/Dropdowns | `white` | `zinc-950` |
| `primary` | Primary action (buttons) | `zinc-900` | `zinc-50` |
| `primary-foreground`| Text on primary | `zinc-50` | `zinc-900` |
| `secondary` | Secondary action | `zinc-100` | `zinc-800` |
| `muted` | Backgrounds (sidebar) | `zinc-100` | `zinc-800` |
| `muted-foreground` | Secondary text | `zinc-500` | `zinc-400` |
| `accent` | Hover states | `zinc-100` | `zinc-800` |
| `destructive` | Errors/Delete | `red-500` | `red-900` |
| `border` | Borders | `zinc-200` | `zinc-800` |

## 2. Typography

**Font Family:** Inter (via `next/font/google`)

| Scale | Tailwind Class | Size / Line-Height | Usage |
| :--- | :--- | :--- | :--- |
| **H1** | `text-2xl font-semibold tracking-tight` | 24px / 32px | Page Titles |
| **H2** | `text-xl font-semibold tracking-tight` | 20px / 28px | Section Headers |
| **H3** | `text-lg font-semibold tracking-tight` | 18px / 28px | Card Titles |
| **Body** | `text-sm` | 14px / 20px | Standard Text |
| **Small** | `text-xs font-medium` | 12px / 16px | Metadata, Labels |
| **Muted** | `text-sm text-muted-foreground` | 14px / 20px | Helper text |

## 3. Core Layouts

### 3.1 The App Shell (Dashboard)
Used for all authenticated pages.
- **Sidebar (Left, Fixed):** `w-64 h-screen border-r bg-muted/40`
- **Header (Top, Sticky):** `h-14 border-b bg-background/95 backdrop-blur`
- **Main:** `flex-1 overflow-auto p-4`

### 3.2 The Auth Card
Used for Login/Signup.
- **Container:** `min-h-screen flex items-center justify-center bg-muted/40`
- **Card:** `w-full max-w-sm p-6 bg-background border shadow-sm rounded-lg`

### 3.3 The Board Canvas
Used specifically for the Kanban view.
- **Container:** `h-[calc(100vh-3.5rem)] overflow-x-auto overflow-y-hidden` (Full height minus header)
- **Columns Wrapper:** `flex h-full gap-4 p-4`
- **Column:** `w-80 shrink-0 flex flex-col bg-muted/50 rounded-lg max-h-full`
