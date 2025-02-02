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