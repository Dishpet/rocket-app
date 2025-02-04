import { supabase } from "@/integrations/supabase/client";
import { mockDb } from "@/lib/mockDb";
import { DatabaseClient, TableName, Tables, TableData } from "./types";

const USE_LOCAL_STORAGE = false;

const wrapSupabase = (): DatabaseClient => {
  return {
    auth: {
      getSession: async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        return { data: { session }, error };
      },
      signInWithPassword: async (credentials) => {
        const { data: { user }, error } = await supabase.auth.signInWithPassword(credentials);
        return { data: { user }, error };
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
      },
      onAuthStateChange: (callback) => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => callback(_event, session)
        );
        return { data: { subscription } };
      }
    },
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, file: File, options?: { upsert: boolean }) => {
          const { error } = await supabase.storage.from(bucket).upload(path, file, options);
          return { error };
        },
        getPublicUrl: (path: string) => {
          const { data } = supabase.storage.from(bucket).getPublicUrl(path);
          return { data };
        }
      })
    },
    from: <T extends Tables[TableName]["Row"]>(table: TableName) => ({
      select: (query = '*') => ({
        single: async (): Promise<TableData<T>> => {
          try {
            const { data, error } = await supabase
              .from(table)
              .select(query)
              .single();
            
            return {
              data: data as T | null,
              error: error
            };
          } catch (error) {
            return {
              data: null,
              error: error instanceof Error ? error : new Error('Unknown error')
            };
          }
        },
        eq: (column: string, value: any) => ({
          single: async (): Promise<TableData<T>> => {
            try {
              const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq(column, value)
                .single();
              
              return {
                data: data as T | null,
                error: error
              };
            } catch (error) {
              return {
                data: null,
                error: error instanceof Error ? error : new Error('Unknown error')
              };
            }
          }
        })
      }),
      insert: async (data: Partial<T>): Promise<TableData<T>> => {
        try {
          const { data: result, error } = await supabase
            .from(table)
            .insert(data as any)
            .select()
            .single();
          
          return {
            data: result as T | null,
            error: error
          };
        } catch (error) {
          return {
            data: null,
            error: error instanceof Error ? error : new Error('Unknown error')
          };
        }
      },
      update: async (data: Partial<T>): Promise<TableData<T>> => {
        try {
          const { data: result, error } = await supabase
            .from(table)
            .update(data as any)
            .eq('id', (data as any).id)
            .select()
            .single();
          
          return {
            data: result as T | null,
            error: error
          };
        } catch (error) {
          return {
            data: null,
            error: error instanceof Error ? error : new Error('Unknown error')
          };
        }
      },
      delete: async (): Promise<TableData<void>> => {
        try {
          const { error } = await supabase.from(table).delete();
          return {
            data: null,
            error: error
          };
        } catch (error) {
          return {
            data: null,
            error: error instanceof Error ? error : new Error('Unknown error')
          };
        }
      }
    })
  };
};

export const db: DatabaseClient = USE_LOCAL_STORAGE ? mockDb : wrapSupabase();