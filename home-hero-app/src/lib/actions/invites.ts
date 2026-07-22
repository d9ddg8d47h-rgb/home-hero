"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requirePhysio, getCurrentProfile } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function currentOrigin() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export type InviteState = { error: string } | { success: true; email: string } | undefined;

const inviteSchema = z.object({
  fullName: z.string().min(1, "Enter the client's name."),
  email: z.string().email("Enter a valid email address."),
});

// Sends a real invite email via Supabase Auth. This creates the auth user
// (and, via the handle_new_user trigger, their profiles row — so they show
// up in "My clients" immediately) but leaves them without a password until
// they click the emailed link and set one on /invite/set-password.
export async function inviteClientByEmail(
  _prevState: InviteState,
  formData: FormData
): Promise<InviteState> {
  const physio = await requirePhysio();
  const parsed = inviteSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const origin = await currentOrigin();
  const admin = createAdminClient();

  const { error } = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
    data: {
      role: "client",
      full_name: parsed.data.fullName,
      physio_id: physio.id,
    },
    redirectTo: `${origin}/invite/set-password`,
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      return { error: "A user with that email already exists." };
    }
    return { error: error.message };
  }

  return { success: true, email: parsed.data.email };
}

export type SetPasswordState = { error?: string } | undefined;

const passwordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

// Called from /invite/set-password once the user already has a session
// (established by /auth/confirm's verifyOtp call from the email link).
export async function completeInviteSetup(
  _prevState: SetPasswordState,
  formData: FormData
): Promise<SetPasswordState> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { error: "That invite link has expired. Ask your physio to resend it." };
  }

  const parsed = passwordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };

  redirect("/client");
}
