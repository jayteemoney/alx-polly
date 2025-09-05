'use server';

import { createClient } from '@/lib/supabase/server';
import { LoginFormData, RegisterFormData } from '../types';
import { z } from 'zod';

// This schema defines a strong password policy to enhance security.
// It is reused in the registration logic to ensure consistency.
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");


/**
 * Handles user login by authenticating credentials against the Supabase auth service.
 * This function is a server action, designed to be called directly from a form,
 * which centralizes authentication logic on the server and reduces client-side exposure.
 * @param data - The user's login credentials, containing an email and password.
 * @returns An object with a descriptive error message if login fails, or null on success.
 *          Returning specific error details is avoided to prevent leaking information
 *          about user accounts (e.g., whether an email exists).
 */
export async function login(data: LoginFormData) {
  const supabase = await createClient();

  // Server-side validation is crucial as a second line of defense
  // in case client-side checks are bypassed.
  const schema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  });

  const validated = schema.safeParse(data);
  if (!validated.success) {
    // Join errors into a single string for straightforward display.
    return { error: validated.error.errors.map((e) => e.message).join('\n') };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    // A generic error message is returned to prevent attackers from guessing valid emails.
    return { error: "Invalid email or password." };
  }

  // A null error indicates a successful login.
  return { error: null };
}

/**
 * Registers a new user with the Supabase auth service.
 * As a server action, it securely handles user creation, including password validation
 * and data insertion, without exposing sensitive logic to the client.
 * @param data - The user's registration details (name, email, password).
 * @returns An object with a descriptive error message if registration fails, or null on success.
 *          This provides clear feedback to the user, such as when an email is already taken.
 */
export async function register(data: RegisterFormData) {
  const supabase = await createClient();

  // This schema ensures that user-provided data meets application requirements
  // before attempting to create an account, preventing invalid data from reaching the database.
  const schema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().email("Invalid email address"),
    password: passwordSchema, // Reuse the strong password policy.
  });

  const validated = schema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors.map((e) => e.message).join('\n') };
  }

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      // Additional user metadata, like 'name', is stored here.
      data: {
        name: data.name,
      },
    },
  });

  if (error) {
    // Provide user-friendly feedback for common errors.
    if (error.message.includes("User already registered")) {
      return { error: "A user with this email already exists." };
    }
    // Fallback for other potential issues during sign-up.
    return { error: "Failed to register user. Please try again." };
  }

  // A null error indicates successful registration.
  return { error: null };
}

/**
 * Logs out the currently authenticated user by invalidating their session.
 * This server action ensures the session is terminated securely on the server side.
 * @returns An object with an error message if logout fails, or null on success.
 */
export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    // This helps debug issues with the logout process if they arise.
    return { error: "Failed to log out. Please try again." };
  }

  return { error: null };
}

/**
 * Retrieves the data for the currently authenticated user.
 * This is a secure way to access user details on the server, as it relies on the
 * server-side Supabase client, which can read the session from cookies.
 * @returns The user object if a session is active, otherwise null.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Retrieves the current user session, including the access token and user data.
 * This is essential for server-side logic that needs to verify authentication status
 * or perform actions on behalf of the user.
 * @returns The session object if a user is logged in, otherwise null.
 */
export async function getSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}