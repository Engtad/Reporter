// src/utils/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL!;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE!;
const useSupabase = (process.env.USE_SUPABASE || '').toLowerCase() === 'true';

// Real admin client only when enabled.
export const supabaseAdmin: SupabaseClient = useSupabase
  ? createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } })
  : ({} as any);

// Backward-compatible export; safe no-ops when disabled.
function localShim() {
  const ok = { data: null, error: null };
  return {
    from() {
      return {
        insert: async () => ok,
        select: async () => ({ data: [], error: null }),
        delete: () => ({ in: async () => ok }),
        update: async () => ok,
        eq: () => ({ select: async () => ({ data: [], error: null }) })
      };
    },
    storage: {
      from() {
        return {
          upload: async (_path: string, _buf: any, _opts?: any) => ({ data: { path: _path }, error: null }),
          getPublicUrl: (_path: string) => ({ data: { publicUrl: '' }, error: null })
        };
      }
    }
  };
}

export const supabase: any = useSupabase ? supabaseAdmin : localShim();
