import { Database } from "@/integrations/supabase/types";

export type Tables = Database['public']['Tables'];
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

export type QueryResult<T> = {
  data: T | null;
  error: Error | null;
};

export type QueryOptions = {
  eq?: Record<string, any>;
  order?: Record<string, 'asc' | 'desc'>;
};

export interface DatabaseClient {
  auth: {
    getSession: () => Promise<{ data: { session: { user: LocalUser } | null }, error: Error | null }>;
    signUp: (credentials: { email: string; password: string; options?: any }) => Promise<QueryResult<{ user: LocalUser }>>;
    signInWithPassword: (credentials: { email: string; password: string }) => Promise<QueryResult<{ user: LocalUser }>>;
    signOut: () => Promise<{ error: Error | null }>;
    onAuthStateChange: (callback: (event: string, session: { user: LocalUser } | null) => void) => { 
      data: { subscription: { unsubscribe: () => void } }
    };
  };
  from: <T = any>(table: string) => {
    select: (query?: string) => Promise<QueryResult<T[]>>;
    single: () => Promise<QueryResult<T>>;
    insert: (data: Partial<T>) => Promise<QueryResult<T>>;
    update: (data: Partial<T>) => Promise<QueryResult<T>>;
    delete: () => Promise<QueryResult<void>>;
    eq: (column: string, value: any) => any;
    order: (column: string, options: { ascending: boolean }) => any;
  };
}