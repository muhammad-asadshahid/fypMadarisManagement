import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const url =
  Constants.expoConfig?.extra?.SUPABASEgit init_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL;
const key =
  Constants.expoConfig?.extra?.SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const SUPABASE_CONFIGURED = Boolean(url && key);

// Do not initialize Supabase on the server during SSR — it accesses `window`.
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_CONFIGURED) return null;
  if (typeof window === "undefined") return null;

  if (_supabase) return _supabase;

  // Import the URL polyfill only on the client at runtime.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("react-native-url-polyfill/auto");
  } catch {
    // ignore if not available
  }

  _supabase = createClient(String(url), String(key), {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return _supabase;
}

export default getSupabase;
