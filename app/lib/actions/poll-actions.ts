"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * Creates a new poll with a question and a set of options.
 * This server action validates the input, ensures the user is authenticated,
 * and inserts the new poll into the database.
 *
 * @param formData - The form data containing the poll's question and options.
 *                   - "question": The poll question (string).
 *                   - "options": The poll options (array of strings).
 * @returns An object with either a success indicator or an error message.
 *          - { error: null } on success.
 *          - { error: "error message" } on failure.
 */
export async function createPoll(formData: FormData) {
  const supabase = await createClient();

  // Define the schema for poll creation for robust server-side validation.
  const pollSchema = z.object({
    question: z.string().min(1, "Question cannot be empty."),
    options: z.array(z.string().min(1)).min(2, "At least two options are required."),
  });

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  const validation = pollSchema.safeParse({ question, options });

  if (!validation.success) {
    // Combine validation error messages into a single string for display.
    return { error: validation.error.errors.map((e) => e.message).join("\\n") };
  }

  // Authenticate the user to ensure only logged-in users can create polls.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    // This check prevents unauthenticated users from proceeding.
    return { error: "You must be logged in to create a poll." };
  }

  // Insert the new poll into the 'polls' table, associating it with the current user.
  const { error } = await supabase.from("polls").insert([
    {
      user_id: user.id,
      question: validation.data.question,
      options: validation.data.options,
    },
  ]);

  if (error) {
    // Return a generic error to avoid exposing database-specific details.
    return { error: "Failed to create the poll. Please try again." };
  }

  // Invalidate the cache for the '/polls' path to ensure the UI is updated with the new poll.
  revalidatePath("/polls");
  return { error: null };
}

/**
 * Retrieves all polls created by the currently authenticated user.
 * It fetches polls from the database and orders them by creation date.
 *
 * @returns An object containing the user's polls or an error message.
 *          - { polls: Poll[], error: null } on success.
 *          - { polls: [], error: "error message" } on failure.
 */
export async function getUserPolls() {
  const supabase = await createClient();

  // Ensure a user is authenticated before fetching their polls.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { polls: [], error: "Not authenticated" };
  }

  // Fetch all polls where 'user_id' matches the authenticated user's ID.
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false }); // Show the newest polls first.

  if (error) {
    return { polls: [], error: "Failed to retrieve polls." };
  }

  return { polls: data ?? [], error: null };
}

/**
 * Retrieves a single poll by its unique ID.
 * This is used to display a specific poll for voting or viewing results.
 *
 * @param id - The unique identifier of the poll to retrieve.
 * @returns An object containing the poll data or an error message.
 *          - { poll: Poll, error: null } on success.
 *          - { poll: null, error: "error message" } on failure.
 */
export async function getPollById(id: string) {
  const supabase = await createClient();

  // Fetch the poll from the database where the 'id' matches.
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("id", id)
    .single(); // Expect only one result.

  if (error) {
    return { poll: null, error: "Poll not found." };
  }

  return { poll: data, error: null };
}

/**
 * Submits a vote for a specific option in a poll.
 * This action records the user's vote in the database.
 *
 * @param pollId - The ID of the poll being voted on.
 * @param optionIndex - The index of the option selected by the user.
 * @returns An object indicating success or failure.
 *          - { error: null } on success.
 *          - { error: "error message" } on failure.
 */
export async function submitVote(pollId: string, optionIndex: number) {
  const supabase = await createClient();

  // Retrieve the user session to associate the vote with a user if they are logged in.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Insert the vote into the 'votes' table.
  // The user_id is nullable to allow anonymous voting.
  const { error } = await supabase.from("votes").insert([
    {
      poll_id: pollId,
      user_id: user?.id ?? null, // Record user ID if available, otherwise null.
      option_index: optionIndex,
    },
  ]);

  if (error) {
    return { error: "Failed to submit your vote. Please try again." };
  }

  return { error: null };
}

/**
 * Deletes a poll from the database.
 * This action is restricted to the poll's owner.
 *
 * @param id - The unique identifier of the poll to be deleted.
 * @returns An object indicating success or failure.
 *          - { error: null } on success.
 *          - { error: "error message" } on failure.
 */
export async function deletePoll(id: string) {
  const supabase = await createClient();

  // The deletion is protected by Row-Level Security (RLS) policies in Supabase,
  // which ensure only the poll's creator can delete it.
  const { error } = await supabase.from("polls").delete().eq("id", id);

  if (error) {
    return { error: "Failed to delete the poll. You may not have permission to perform this action." };
  }

  // Revalidate the path to update the UI after deletion.
  revalidatePath("/polls");
  return { error: null };
}

/**
 * Updates an existing poll's question and options.
 * This action is restricted to the poll's owner and validates the input.
 *
 * @param pollId - The ID of the poll to update.
 * @param formData - The form data with the updated question and options.
 * @returns An object indicating success or failure.
 *          - { error: null } on success.
 *          - { error: "error message" } on failure.
 */
export async function updatePoll(pollId: string, formData: FormData) {
  const supabase = await createClient();

  // Server-side validation to ensure data integrity.
  const pollSchema = z.object({
    question: z.string().min(1, "Question cannot be empty."),
    options: z.array(z.string().min(1)).min(2, "At least two options are required."),
  });

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  const validation = pollSchema.safeParse({ question, options });

  if (!validation.success) {
    return { error: validation.error.errors.map((e) => e.message).join("\\n") };
  }

  // Authenticate the user to ensure they are logged in.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be logged in to update a poll." };
  }

  // The update operation includes a '.eq("user_id", user.id)' clause,
  // which acts as a critical authorization check. It ensures that users can only
  // update polls they own, preventing unauthorized modifications.
  const { error } = await supabase
    .from("polls")
    .update({ question: validation.data.question, options: validation.data.options })
    .eq("id", pollId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Failed to update the poll. You may not have permission." };
  }

  // Revalidate relevant paths to reflect the changes in the UI.
  revalidatePath("/polls");
  revalidatePath(`/polls/${pollId}`);
  return { error: null };
}