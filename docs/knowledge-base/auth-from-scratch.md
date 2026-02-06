# Knowledge Base: Authentication from First Principles

This document explains how email and password authentication works "under the hood." Understanding these steps manually helps clarify why we use tools like **Better Auth** and what they are doing for us.

---

## 1. The Core Architecture

Authentication is the process of verifying **who** a user is. For email/password auth, this involves four main stages:

1. **Registration:** Storing credentials securely.
2. **Verification (Sign In):** Checking provided credentials against stored ones.
3. **Session Issuance:** Giving the user a "ticket" (token) to stay logged in.
4. **Authorization (Middleware):** Checking that ticket on every subsequent request.

---

## 2. Step 1: Secure Registration (Hashing)

**Rule #1: Never store passwords in plain text.** If your database is leaked, every user's password is exposed.

### How Hashing Works:

Instead of storing "password123", we run it through a "One-Way" cryptographic function.

- **Input:** `password123` + `random_salt`
- **Algorithm:** Argon2id or bcrypt (Slow algorithms that resist brute force).
- **Output:** `$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17LHWy`

**The Salt:** A unique random string added to each password before hashing. This prevents "Rainbow Table" attacks where hackers use pre-calculated hashes of common passwords.

---

## 3. Step 2: Session Management

Once a user is verified, we don't want them to send their password with every single click. Instead, we use **Sessions**.

### The Database Session Flow:

1. **Create:** Generate a long, cryptographically secure random string (e.g., `sess_507f1f...`).
2. **Store:** Save this string in a `sessions` table linked to the `userId`, along with an `expiresAt` timestamp.
3. **Deliver:** Send this string back to the browser in a **Cookie**.

### Why Cookies?

Cookies have special security flags that prevent common attacks:

- `HttpOnly`: Prevents JavaScript from reading the cookie (stops XSS).
- `Secure`: Ensures the cookie is only sent over HTTPS.
- `SameSite=Lax/Strict`: Prevents the browser from sending the cookie on cross-site requests (stops CSRF).

---

## 4. Step 3: The Verification (Sign In)

When a user tries to log in:

1. **Lookup:** Find the user in the database by their email.
2. **Compare:** Use a specialized library (like `bcrypt.compare`) to hash the incoming password with the stored salt and see if it matches the stored hash.
   - _Note: You cannot "decrypt" a hash. You can only hash the new input and see if the result is identical._
3. **Success:** If they match, proceed to **Step 2** to issue a new session.

---

## 5. Step 4: Authorization (The Middleware)

On every request to a "Protected Route" (e.g., `/dashboard`):

1. **Extract:** The server reads the session ID from the incoming Cookie.
2. **Validate:** The server looks up that ID in the `sessions` table.
   - Does it exist?
   - Is it expired?
   - Who is the `userId` attached to it?
3. **Inject:** The user's information is added to the "Request Context" so the app knows exactly who is making the request.

---

## 6. What Better Auth Does for Us

Implementing the above correctly is difficult and error-prone. **Better Auth** automates the "First Principles":

- **Security:** It uses **Argon2** (the industry gold standard) for hashing automatically.
- **Database Logic:** It manages the `user`, `session`, and `account` tables and the complex SQL queries to link them.
- **Session Handling:** It manages cookie rotation, expiration, and secure headers without you having to touch `res.setHeader`.
- **CSRF Protection:** It includes built-in defenses against Cross-Site Request Forgery.
- **Edge Cases:** It handles things like "Password Reset" flows, "Email Verification," and "Rate Limiting" which are often forgotten in manual builds.

By using Better Auth, we follow these "First Principles" perfectly while writing 90% less code.
