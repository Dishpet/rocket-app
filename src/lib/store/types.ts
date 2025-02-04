import { Database } from "@/integrations/supabase/types";
import { PostgrestError, User } from "@supabase/supabase-js";

export type Tables = Database['public']['Tables'];
export type TableName = keyof Tables;

// Re-export table types
export type Profile = Tables['profiles']['Row'];
export type Post = Tables['posts']['Row'];
export type Like = Tables['likes']['Row'];
export type Comment = Tables['comments']['Row'];
export type Message = Tables['messages']['Row'];
export type Notification = Tables['notifications']['Row'];
export type UserRole = Tables['user_roles']['Row'];

export type LocalUser = {
  id: string;
  email: string;
  created_at: string;
};

export type TableData<T> = {
  data: T | null;
  error: Error | PostgrestError | null;
};

export interface DatabaseClient {
  auth: {
    getSession: () => Promise<{ data: { session: { user: User | LocalUser } | null }; error: Error | null }>;
    signInWithPassword: (credentials: { email: string; password: string }) => Promise<{ data: { user: User | LocalUser } | null; error: Error | null }>;
    signOut: () => Promise<{ error: Error | null }>;
    onAuthStateChange: (callback: (event: string, session: { user: User | LocalUser } | null) => void) => {
      data: { subscription: { unsubscribe: () => void } }
    };
  };
  from: <T extends Tables[TableName]["Row"]>(table: TableName) => {
    select: (query?: string) => {
      single: () => Promise<TableData<T>>;
      eq: (column: string, value: any) => {
        single: () => Promise<TableData<T>>;
      };
    };
    insert: (data: Partial<T>) => Promise<TableData<T>>;
    update: (data: Partial<T>) => Promise<TableData<T>>;
    delete: () => Promise<TableData<void>>;
  };
}