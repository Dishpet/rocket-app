import { supabase } from "@/integrations/supabase/client";
import { mockDb } from "@/lib/mockDb";
import { DatabaseClient, TableName, Tables, TableData } from "./types";

// Set this to true to use local storage instead of Supabase
const USE_LOCAL_STORAGE = true;

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
    from: <T extends Tables[TableName]["Row"]>(table: TableName) => ({
      select: (query?: string) => ({
        single: async () => {
          try {
            const { data, error } = await supabase
              .from(table)
              .select(query || '*')
              .single();
            
            if (error) {
              const result: TableData<T> = {
                data: null,
                error: new Error(error.message)
              };
              return result;
            }
            
            const result: TableData<T> = {
              data: data as T,
              error: null
            };
            return result;
          } catch (error) {
            const result: TableData<T> = {
              data: null,
              error: error instanceof Error ? error : new Error('Unknown error')
            };
            return result;
          }
        },
        eq: (column: string, value: any) => ({
          single: async () => {
            try {
              const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq(column, value)
                .single();
              
              if (error) {
                const result: TableData<T> = {
                  data: null,
                  error: new Error(error.message)
                };
                return result;
              }
              
              const result: TableData<T> = {
                data: data as T,
                error: null
              };
              return result;
            } catch (error) {
              const result: TableData<T> = {
                data: null,
                error: error instanceof Error ? error : new Error('Unknown error')
              };
              return result;
            }
          }
        })
      }),
      insert: async (data: Partial<T>) => {
        try {
          const { data: result, error } = await supabase
            .from(table)
            .insert(data as any)
            .select()
            .single();
          
          if (error) {
            const errorResult: TableData<T> = {
              data: null,
              error: new Error(error.message)
            };
            return errorResult;
          }
          
          const successResult: TableData<T> = {
            data: result as T,
            error: null
          };
          return successResult;
        } catch (error) {
          const errorResult: TableData<T> = {
            data: null,
            error: error instanceof Error ? error : new Error('Unknown error')
          };
          return errorResult;
        }
      },
      update: async (data: Partial<T>) => {
        try {
          const { data: result, error } = await supabase
            .from(table)
            .update(data as any)
            .eq('id', (data as any).id)
            .select()
            .single();
          
          if (error) {
            const errorResult: TableData<T> = {
              data: null,
              error: new Error(error.message)
            };
            return errorResult;
          }
          
          const successResult: TableData<T> = {
            data: result as T,
            error: null
          };
          return successResult;
        } catch (error) {
          const errorResult: TableData<T> = {
            data: null,
            error: error instanceof Error ? error : new Error('Unknown error')
          };
          return errorResult;
        }
      },
      delete: async () => {
        try {
          const { error } = await supabase.from(table).delete();
          const result: TableData<void> = {
            data: null,
            error: error ? new Error(error.message) : null
          };
          return result;
        } catch (error) {
          const result: TableData<void> = {
            data: null,
            error: error instanceof Error ? error : new Error('Unknown error')
          };
          return result;
        }
      }
    })
  };
};

export const db: DatabaseClient = USE_LOCAL_STORAGE ? mockDb : wrapSupabase();