"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePhysio } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generatePassword } from "@/lib/utils";

export type CreateClientState =
  | { error: string }
  | { success: true; email: string; password: string; fullName: string }
  | undefined;

const newClientSchema = z.object({
  fullName: z.string().min(1, "Enter the client's name."),
  email: z.string().email("Enter a valid email address."),
});

export async function createClientAccount(
  _prevState: CreateClientState,
  formData: FormData
): Promise<CreateClientState> {
  const physio = await requirePhysio();

  const parsed = newClientSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { fullName, email } = parsed.data;
  const password = generatePassword();
  const admin = createAdminClient();

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: "client",
      full_name: fullName,
      physio_id: physio.id,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      return { error: "A user with that email already exists." };
    }
    return { error: error.message };
  }

  revalidatePath("/physio");
  return { success: true, email, password, fullName };
}

export async function deleteClient(clientId: string) {
  await requirePhysio();
  const admin = createAdminClient();
  // Deleting the auth user cascades to the profiles row (and their
  // prescriptions) via the foreign key ON DELETE CASCADE in the schema.
  // RLS on profiles/exercises/prescriptions still scopes everything else.
  await admin.auth.admin.deleteUser(clientId);
  revalidatePath("/physio");
}

export async function getMyClients() {
  await requirePhysio();
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "client")
    .order("created_at", { ascending: false });
  return data ?? [];
}
