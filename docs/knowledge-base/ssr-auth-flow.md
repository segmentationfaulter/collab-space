# Knowledge Base: Request Lifecycle, SSR, and Components

This document details the request lifecycle in Next.js, explaining the interaction between Server Components (RSC) and Client Components, specifically within the context of authentication.

---

## 1. The Core Concept: Hybrid Rendering

Next.js uses a hybrid model. It is not just "Server-Side Rendering" (SSR) vs. "Client-Side Rendering" (CSR). It is a mix of both, structured as a tree.

### Server Components (The Default)

- **What:** Components that run **only** on the server.
- **Output:** They output the **RSC Payload** (a JSON description of the UI), NOT HTML directly.
- **Capabilities:** Can access database, env vars. Cannot use hooks (`useState`) or event listeners (`onClick`).

### Client Components (`"use client"`)

- **What:** Components that are pre-rendered on the server (SSR) AND hydrated on the client.
- **Output:** They output HTML on the server, and then "wake up" (hydrate) in the browser.
- **Capabilities:** Can use hooks and listeners. Cannot access database directly.

---

## 2. The Request Flow: Visiting `/sign-in`

**Scenario:** User types `http://localhost:3000/sign-in` (Hard Navigation).

### Step 1: The Server Bundle (RSC Payload)

Next.js starts at the root `layout.tsx` (Server Component). It renders the tree.

- When it hits a **Server Component**: It runs the function and adds the result to the payload.
- When it hits a **Client Component** (like our `SignIn` page): It does **not** run the client-side JavaScript yet. It adds a "placeholder" (reference) to the payload, saying _"Render the Client Component Bundle here with these props."_

### Step 2: HTML Generation (SSR)

Next.js takes that RSC Payload and converts it into a static HTML string.

- **Crucial Detail:** Even your Client Component (`SignIn`) is executed on the server to generate this initial HTML. This is why you see the form inputs immediately.
- **Hook Behavior on Server:**
  - `useState`: Returns initial state (e.g., `""`).
  - `useEffect`: **Skipped entirely**.

### Step 3: The Browser Receives HTML

The user sees the page. It looks complete but is **inert**. Clicking "Sign In" does nothing yet because the event listeners aren't attached.

### Step 4: Hydration

The browser loads the JavaScript bundle.

1.  **Reconciliation:** React reads the RSC Payload and matches it with the HTML.
2.  **Attachment:** It attaches event listeners to the DOM nodes produced by your Client Components.
3.  **Activation:** The page becomes interactive. `useEffect` runs now.

---

## 3. The Interaction: Submitting the Form

**Scenario:** User fills the form and clicks "Sign In".

1.  **Event:** `onClick` fires in the browser.
2.  **API Call:** `authClient.signIn.email()` sends a POST request to your API Route.
3.  **Server Action:** The API verifies credentials and sets a `Set-Cookie` header.
4.  **Response:** Client receives `200 OK`.

---

## 4. The Navigation: `router.push('/')` (Soft Navigation)

**Scenario:** The login is successful, and we redirect to the Dashboard.

This is where Next.js shines. It does **not** do a full browser refresh.

### Step 1: The Request (RSC Payload)

The client requests the data for the new route: `/`.

- **URL:** `GET /?_rsc=...` (This is the "Partial Fetch").
- **Response:** The server returns the **RSC Payload** (JSON) for the Dashboard page.
  - It does **not** return HTML.
  - It does **not** re-send the Layout (Navbar/Sidebar) if it hasn't changed.

### Step 2: Client-Side Rendering

The React Client Router receives this JSON and updates the Virtual DOM.

- **State Preservation:** Because the page didn't refresh, any state in the Navbar (like a "Notification Count") is preserved.
- **Diffing:** React only updates the parts of the DOM that changed (swapping the Login Form for the Dashboard content).

### Why "Partial"?

The server only computes the _new_ segments. If your Layout is static, the server doesn't waste time re-generating it, and the browser doesn't waste bandwidth downloading it.

---

## Summary of Terms

| Term                | Definition                                                                                                                         |
| :------------------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| **RSC Payload**     | The JSON format Next.js uses to represent the UI tree. It allows the server to pass data to the client without sending raw HTML.   |
| **SSR**             | Generating static HTML from the RSC Payload. Happens on the server for _both_ Server and Client components (for the initial load). |
| **Hydration**       | Attaching event listeners to the static HTML in the browser. Happens _only_ for Client Components.                                 |
| **Soft Navigation** | Changing the URL and view without destroying the full page state. Uses RSC Payload to update just the content area.                |
