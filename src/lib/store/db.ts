import { supabase } from "@/integrations/supabase/client";
import useLocalStore from "./localStore";
import { DatabaseClient } from "./types";

// Set this to false to use Supabase instead of local storage
const USE_LOCAL_STORAGE = true;

const wrapSupabase = (): DatabaseClient => {
  return {
    ...supabase,
    from: (table: string) => ({
      select: (query?: string) => ({
        single: async () => {
          const { data, error } = await supabase.from(table).select(query || '*').single();
          return { data, error };
        },
        eq: (column: string, value: any) => ({
          single: async () => {
            const { data, error } = await supabase
              .from(table)
              .select(query || '*')
              .eq(column, value)
              .single();
            return { data, error };
          }
        })
      }),
      insert: async (data) => {
        const { data: result, error } = await supabase.from(table).insert(data).select().single();
        return { data: result, error };
      },
      update: async (data) => {
        const { data: result, error } = await supabase.from(table).update(data).select().single();
        return { data: result, error };
      },
      delete: async () => {
        const { error } = await supabase.from(table).delete();
        return { data: null, error };
      }
    })
  };
};

export const db: DatabaseClient = USE_LOCAL_STORAGE ? useLocalStore() : wrapSupabase();