# ALX Polly: A Polling Application

Welcome to ALX Polly, a full-stack polling application built with Next.js, TypeScript, and Supabase. This project serves as a practical learning ground for modern web development concepts, with a special focus on identifying and fixing common security vulnerabilities.

## About the Application

ALX Polly allows authenticated users to create, share, and vote on polls. It's a simple yet powerful application that demonstrates key features of modern web development:

-   **Authentication**: Secure user sign-up and login.
-   **Poll Management**: Users can create, view, and delete their own polls.
-   **Voting System**: A straightforward system for casting and viewing votes.
-   **User Dashboard**: A personalized space for users to manage their polls.

The application is built with a modern tech stack:

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Backend & Database**: [Supabase](https://supabase.io/)
-   **UI**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
-   **State Management**: React Server Components and Client Components

---

## 🚀 The Challenge: Security Audit & Remediation

As a developer, writing functional code is only half the battle. Ensuring that the code is secure, robust, and free of vulnerabilities is just as critical. This version of ALX Polly has been intentionally built with several security flaws, providing a real-world scenario for you to practice your security auditing skills.

**Your mission is to act as a security engineer tasked with auditing this codebase.**

### Your Objectives:

1.  **Identify Vulnerabilities**:
    -   Thoroughly review the codebase to find security weaknesses.
    -   Pay close attention to user authentication, data access, and business logic.
    -   Think about how a malicious actor could misuse the application's features.

2.  **Understand the Impact**:
    -   For each vulnerability you find, determine the potential impact.Query your AI assistant about it. What data could be exposed? What unauthorized actions could be performed?

3.  **Propose and Implement Fixes**:
    -   Once a vulnerability is identified, ask your AI assistant to fix it.
    -   Write secure, efficient, and clean code to patch the security holes.
    -   Ensure that your fixes do not break existing functionality for legitimate users.

### Where to Start?

A good security audit involves both static code analysis and dynamic testing. Here’s a suggested approach:

1.  **Familiarize Yourself with the Code**:
    -   Start with `app/lib/actions/` to understand how the application interacts with the database.
    -   Explore the page routes in the `app/(dashboard)/` directory. How is data displayed and managed?
    -   Look for hidden or undocumented features. Are there any pages not linked in the main UI?

2.  **Use Your AI Assistant**:
    -   This is an open-book test. You are encouraged to use AI tools to help you.
    -   Ask your AI assistant to review snippets of code for security issues.
    -   Describe a feature's behavior to your AI and ask it to identify potential attack vectors.
    -   When you find a vulnerability, ask your AI for the best way to patch it.

---

## Getting Started

To begin your security audit, you'll need to get the application running on your local machine.

### 1. Prerequisites

-   [Node.js](https://nodejs.org/) (v20.x or higher recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   A [Supabase](https://supabase.io/) account (the project is pre-configured, but you may need your own for a clean slate).

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd alx-polly
npm install
```

### 3. Environment Variables

The project uses Supabase for its backend. An environment file `.env.local` is needed.Use the keys you created during the Supabase setup process.

### 4. Running the Development Server

Start the application in development mode:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

Good luck, engineer! This is your chance to step into the shoes of a security professional and make a real impact on the quality and safety of this application. Happy hunting!

---

## Security Audit Report

This report outlines the findings and remediation steps taken during a comprehensive security audit of the ALX Polly application.

### 1. Insecure Direct Object Reference (IDOR) in Poll Deletion

-   **Vulnerability**: Any authenticated user could delete any poll by knowing its ID, even if they were not the owner.
-   **Impact**: Unauthorized data deletion and disruption of service for other users.
-   **File Affected**: `app/lib/actions/poll-actions.ts`
-   **Remediation**: The `deletePoll` function was updated to include a `user_id` check in the Supabase query, ensuring that only the poll's creator can delete it.

### 2. Cross-Site Scripting (XSS) in Poll Sharing

-   **Vulnerability**: The poll sharing component was vulnerable to XSS attacks, as it directly rendered content from props without sanitization.
-   **Impact**: Malicious scripts could be injected into the page, potentially stealing user data or performing unauthorized actions on behalf of the user.
-   **File Affected**: `app/(dashboard)/polls/vulnerable-share.tsx` (renamed to `PollShare.tsx`)
-   **Remediation**: The component was refactored to sanitize the `pollId` and `title` props. Additionally, QR code functionality was added for secure sharing.

### 3. Insufficient Input Validation and Weak Password Policy

-   **Vulnerability**: The authentication actions lacked server-side input validation and did not enforce a strong password policy.
-   **Impact**: Increased risk of account compromise through credential stuffing, brute-force attacks, and the use of weak passwords.
-   **File Affected**: `app/lib/actions/auth-actions.ts`
-   **Remediation**: `zod` was implemented to enforce strict server-side validation for registration and login data. A stronger password policy requiring a mix of character types and a minimum length was also enforced.

### 4. Improper Access Control in Middleware

-   **Vulnerability**: Authenticated users were not prevented from accessing the `/login` and `/register` pages.
-   **Impact**: While low-risk, this represented a logic flaw in the application's access control.
-   **File Affected**: `lib/supabase/middleware.ts`
-   **Remediation**: The middleware was updated to check the user's authentication status and redirect them to the dashboard if they attempt to access the login or register pages while already logged in.