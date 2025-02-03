import { supabase } from "@/integrations/supabase/client";
import useLocalStore from "./localStore";
import { DatabaseClient, TableName, Tables } from "./types";

// Set this to false to use Supabase instead of local storage
const USE_LOCAL_STORAGE = true;

const wrapSupabase = (): DatabaseClient => {
  return {
    auth: {
      getSession: async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        return {
          data: {
            session: session ? {
              user: {
                id: session.user.id,
                email: session.user.email!,
                created_at: session.user.created_at,
              }
            } : null
          },
          error: error as Error | null
        };
      },
      signInWithPassword: async (credentials) => {
        const { data: { user }, error } = await supabase.auth.signInWithPassword(credentials);
        return {
          data: user ? {
            user: {
              id: user.id,
              email: user.email!,
              created_at: user.created_at,
            }
          } : null,
          error: error as Error | null
        };
      },
      signUp: async (credentials) => {
        const { data: { user }, error } = await supabase.auth.signUp(credentials);
        return {
          data: user ? {
            user: {
              id: user.id,
              email: user.email!,
              created_at: user.created_at,
            }
          } : null,
          error: error as Error | null
        };
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        return { error: error as Error | null };
      },
      onAuthStateChange: (callback) => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            callback(
              _event,
              session ? {
                user: {
                  id: session.user.id,
                  email: session.user.email!,
                  created_at: session.user.created_at,
                }
              } : null
            );
          }
        );
        return { data: { subscription } };
      }
    },
    from: <T>(table: TableName) => ({
      select: (query?: string) => ({
        single: async () => {
          const { data, error } = await supabase
            .from(table)
            .select(query || '*')
            .single();
          return { data: data as T, error };
        },
        eq: (column: string, value: any) => ({
          single: async () => {
            const { data, error } = await supabase
              .from(table)
              .select('*')
              .eq(column, value)
              .single();
            return { data: data as T, error };
          }
        })
      }),
      insert: async (data) => {
        const { data: result, error } = await supabase
          .from(table)
          .insert(data)
          .select()
          .single();
        return { data: result as T, error };
      },
      update: async (data) => {
        const { data: result, error } = await supabase
          .from(table)
          .update(data)
          .eq('id', (data as any).id)
          .select()
          .single();
        return { data: result as T, error };
      },
      delete: async () => {
        const { error } = await supabase.from(table).delete();
        return { data: null, error };
      }
    })
  };
};

export const db: DatabaseClient = USE_LOCAL_STORAGE ? useLocalStore() : wrapSupabase();