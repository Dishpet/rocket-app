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
        single: async (): Promise<TableData<T>> => {
          try {
            const { data, error } = await supabase
              .from(table)
              .select(query || '*')
              .single();
            
            if (error) {
              return { data: null, error: new Error(error.message) };
            }
            
            return { data: data as T, error: null };
          } catch (error) {
            return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
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
              
              if (error) {
                return { data: null, error: new Error(error.message) };
              }
              
              return { data: data as T, error: null };
            } catch (error) {
              return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
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
          
          if (error) {
            return { data: null, error: new Error(error.message) };
          }
          
          return { data: result as T, error: null };
        } catch (error) {
          return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
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
          
          if (error) {
            return { data: null, error: new Error(error.message) };
          }
          
          return { data: result as T, error: null };
        } catch (error) {
          return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
        }
      },
      delete: async (): Promise<TableData<void>> => {
        try {
          const { error } = await supabase.from(table).delete();
          return { data: null, error: error ? new Error(error.message) : null };
        } catch (error) {
          return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
        }
      }
    })
  };
};

export const db: DatabaseClient = USE_LOCAL_STORAGE ? mockDb : wrapSupabase();