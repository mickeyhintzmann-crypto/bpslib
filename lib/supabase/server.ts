import { createClient } from "@supabase/supabase-js";

const getEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Mangler miljøvariabel: ${key}`);
  }
  return value;
};

export const createSupabaseServiceClient = () => {
  const url = getEnv("SUPABASE_URL");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
};

export const createSupabaseAnonClient = () => {
  const url = getEnv("SUPABASE_URL");
  const anonKey = getEnv("SUPABASE_ANON_KEY");

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
};

export const createServerSupabaseClient = createSupabaseServiceClient;
