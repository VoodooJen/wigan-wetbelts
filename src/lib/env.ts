const requiredPublic = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
] as const;

export function getPublicEnv() {
  const values = Object.fromEntries(
    requiredPublic.map((key) => [key, process.env[key]])
  ) as Record<(typeof requiredPublic)[number], string | undefined>;

  return values;
}

export function getServerEnv() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    appUrl: process.env.NEXT_PUBLIC_APP_URL!
  };
}
