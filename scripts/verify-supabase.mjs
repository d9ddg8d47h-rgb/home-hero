import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// tiny .env.local parser (avoid adding a dependency just for this script)
const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(URL_, SERVICE, { auth: { persistSession: false } });

const stamp = Math.random().toString(36).slice(2, 8);
const physioEmail = `test-physio-${stamp}@example.com`;
const clientEmail = `test-client-${stamp}@example.com`;
const password = "TestPass123!";

let physioUserId, clientUserId;
const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}${detail ? ": " + detail : ""}`);
}

try {
  // 1. Create physio user (no role metadata -> trigger defaults to 'physio')
  const { data: physioUser, error: physioErr } = await admin.auth.admin.createUser({
    email: physioEmail,
    password,
    email_confirm: true,
    user_metadata: { role: "physio", full_name: "Test Physio" },
  });
  check("create physio auth user", !physioErr, physioErr?.message);
  physioUserId = physioUser?.user?.id;

  // 2. Trigger created a profiles row
  const { data: physioProfile, error: physioProfileErr } = await admin
    .from("profiles")
    .select("*")
    .eq("id", physioUserId)
    .single();
  check(
    "trigger auto-created physio profile",
    physioProfile?.role === "physio",
    physioProfileErr?.message ?? JSON.stringify(physioProfile)
  );

  // 3. Sign in as physio with anon client (mirrors what the app does)
  const physioClient = createClient(URL_, ANON, { auth: { persistSession: false } });
  const { data: physioSession, error: signInErr } =
    await physioClient.auth.signInWithPassword({ email: physioEmail, password });
  check("physio can sign in", !signInErr, signInErr?.message);

  // 4. RLS: physio can read own profile via anon+session client
  const { data: selfRow, error: selfErr } = await physioClient
    .from("profiles")
    .select("*")
    .eq("id", physioUserId)
    .single();
  check("RLS: physio can read own profile", !!selfRow && !selfErr, selfErr?.message);

  // 5. Create client user owned by this physio
  const { data: clientUser, error: clientErr } = await admin.auth.admin.createUser({
    email: clientEmail,
    password,
    email_confirm: true,
    user_metadata: {
      role: "client",
      full_name: "Test Kiddo",
      physio_id: physioUserId,
    },
  });
  check("create client auth user", !clientErr, clientErr?.message);
  clientUserId = clientUser?.user?.id;

  const { data: clientProfile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", clientUserId)
    .single();
  check(
    "trigger auto-created client profile with physio_id",
    clientProfile?.role === "client" && clientProfile?.physio_id === physioUserId,
    JSON.stringify(clientProfile)
  );

  // 6. RLS: physio can see their client in profiles list
  const { data: myClients, error: myClientsErr } = await physioClient
    .from("profiles")
    .select("*")
    .eq("role", "client");
  check(
    "RLS: physio sees their own client",
    !!myClients?.find((c) => c.id === clientUserId),
    myClientsErr?.message
  );

  // 7. Physio creates an exercise (RLS: exercises full access to own library)
  const { data: exercise, error: exerciseErr } = await physioClient
    .from("exercises")
    .insert({
      physio_id: physioUserId,
      name: "Bear crawl",
      description: "Crawl across the room.",
      video_url: "https://youtu.be/dQw4w9WgXcQ",
    })
    .select()
    .single();
  check("RLS: physio can create exercise", !!exercise && !exerciseErr, exerciseErr?.message);

  // 8. Physio prescribes it to the client (RLS: prescriptions physio full access for own clients)
  const { data: prescription, error: prescribeErr } = await physioClient
    .from("prescriptions")
    .insert({
      client_id: clientUserId,
      exercise_id: exercise?.id,
      sets: 3,
      reps: 10,
      note: "Slow tempo",
    })
    .select()
    .single();
  check(
    "RLS: physio can prescribe exercise to own client",
    !!prescription && !prescribeErr,
    prescribeErr?.message
  );

  // 9. Sign in as the client and confirm they can see their own prescription + exercise
  const clientAnon = createClient(URL_, ANON, { auth: { persistSession: false } });
  const { error: clientSignInErr } = await clientAnon.auth.signInWithPassword({
    email: clientEmail,
    password,
  });
  check("client can sign in", !clientSignInErr, clientSignInErr?.message);

  const { data: clientView, error: clientViewErr } = await clientAnon
    .from("prescriptions")
    .select("*, exercise:exercises(id, name, video_url)")
    .eq("client_id", clientUserId);
  check(
    "RLS: client can view their own prescribed exercise",
    clientView?.length === 1 && clientView[0]?.exercise?.name === "Bear crawl",
    clientViewErr?.message ?? JSON.stringify(clientView)
  );

  // 10. Negative test: client should NOT see the physio's other data / can't write
  const { data: otherProfiles } = await clientAnon.from("profiles").select("*");
  check(
    "RLS: client cannot see physio's full profile list",
    otherProfiles?.length === 1 && otherProfiles[0].id === clientUserId,
    JSON.stringify(otherProfiles?.map((p) => p.role))
  );

  const { error: clientWriteErr } = await clientAnon.from("exercises").insert({
    physio_id: physioUserId,
    name: "Should not be allowed",
  });
  check("RLS: client cannot create exercises", !!clientWriteErr, "correctly blocked");
} finally {
  // Clean up test users (cascades delete their profiles/exercises/prescriptions)
  if (clientUserId) await admin.auth.admin.deleteUser(clientUserId);
  if (physioUserId) await admin.auth.admin.deleteUser(physioUserId);
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
