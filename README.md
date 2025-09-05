# ALX Polly: A Modern Polling Application

ALX Polly is a full-stack polling application designed to showcase modern web development practices. It allows users to register, create polls, share them with a unique link or QR code, and vote on them. This project emphasizes security, scalability, and a clean user experience, built on a foundation of Next.js, TypeScript, and Supabase.

## Project Overview

This application serves as both a functional polling tool and a learning platform for developers. It demonstrates core concepts such as user authentication, data management, server-side rendering, and API-less architecture using Server Actions. The codebase is intentionally structured to be easy to navigate, with a focus on clear, maintainable, and well-documented code.

A key aspect of this project was a comprehensive security audit, which identified and remediated several common web vulnerabilities. The findings and fixes are documented in the "Security Audit Report" section below.

## Tech Stack

ALX Polly is built with a modern, robust, and scalable technology stack:

-   **Framework**: [Next.js](https://nextjs.org/) (App Router) - For building a server-rendered React application.
-   **Language**: [TypeScript](https://www.typescriptlang.org/) - For type safety and improved developer experience.
-   **Backend & Database**: [Supabase](https://supabase.io/) - Provides a PostgreSQL database, authentication, and auto-generated APIs.
-   **UI Components**: [shadcn/ui](https://ui.shadcn.com/) - A collection of beautifully designed, accessible, and customizable components.
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development.
-   **Validation**: [Zod](https://zod.dev/) - For robust, schema-based validation on both the client and server.
-   **QR Code Generation**: [qrcode.react](https://www.npmjs.com/package/qrcode.react) - For generating shareable QR codes for polls.

## Features

-   **Secure User Authentication**: Users can sign up and log in securely. Passwords are required to meet a strong policy.
-   **Poll Management**: Authenticated users can create, view, update, and delete their own polls from a personal dashboard.
-   **Public & Anonymous Voting**: Polls can be shared via a unique link, allowing anyone to vote, even without an account.
-   **Real-time Results**: (Future implementation) Poll results can be viewed in real-time.
-   **Easy Sharing**: Share polls via a direct link, QR code, or social media buttons.
-   **Responsive Design**: The application is fully responsive and works seamlessly on desktops, tablets, and mobile devices.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v20.x or higher)
-   [npm](https://www.npmjs.com/) (comes with Node.js)
-   A free [Supabase](https://supabase.io/) account.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/alx-polly.git
    cd alx-polly
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add your Supabase project URL and anon key. You can find these in your Supabase project's API settings.

    ```
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
    ```

### Running the Application Locally

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage Examples

1.  **Register for an Account**: Navigate to `/register` and create a new account.
2.  **Create a Poll**: Once logged in, go to the dashboard and click "Create Poll." Fill in the question and at least two options.
3.  **Share Your Poll**: After creating a poll, you can share it using the provided link, QR code, or social media buttons.
4.  **Vote**: Open the shared link in a new tab (or incognito window to simulate another user) and cast your vote.

---

## Security Audit Report

This report outlines the findings and remediation steps taken during a comprehensive security audit of the ALX Polly application.

### 1. Insecure Direct Object Reference (IDOR) in Poll Deletion

-   **Vulnerability**: Any authenticated user could delete any poll by knowing its ID, even if they were not the owner.
-   **Impact**: Unauthorized data deletion and disruption of service for other users.
-   **File Affected**: `app/lib/actions/poll-actions.ts`
-   **Remediation**: The `deletePoll` function was updated to include a `user_id` check in the Supabase query, ensuring that only the poll's creator can delete it. This is enforced by Supabase's Row-Level Security (RLS) policies.

### 2. Cross-Site Scripting (XSS) in Poll Sharing

-   **Vulnerability**: The poll sharing component was vulnerable to XSS attacks, as it directly rendered content from props without sanitization.
-   **Impact**: Malicious scripts could be injected into the page, potentially stealing user data or performing unauthorized actions on behalf of the user.
-   **File Affected**: `app/(dashboard)/polls/PollShare.tsx`
-   **Remediation**: The component was refactored to ensure all dynamic content is properly handled by React's rendering engine, which inherently protects against XSS. Input validation was also strengthened.

### 3. Insufficient Input Validation and Weak Password Policy

-   **Vulnerability**: The authentication actions lacked robust server-side input validation and did not enforce a strong password policy.
-   **Impact**: Increased risk of account compromise through credential stuffing, brute-force attacks, and the use of weak passwords.
-   **File Affected**: `app/lib/actions/auth-actions.ts`
-   **Remediation**: `zod` was implemented to enforce strict server-side validation for registration and login data. A strong password policy requiring a mix of character types and a minimum length was also enforced.

### 4. Improper Access Control in Middleware

-   **Vulnerability**: Authenticated users were not prevented from accessing the `/login` and `/register` pages.
-   **Impact**: While low-risk, this represented a logic flaw in the application's access control, leading to a confusing user experience.
-   **File Affected**: `middleware.ts`
-   **Remediation**: The middleware was updated to check the user's authentication status and redirect them to the dashboard if they attempt to access authentication pages while already logged in.