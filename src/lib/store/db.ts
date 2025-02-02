import { supabase } from "@/integrations/supabase/client";
import useLocalStore from "./localStore";
import { Database } from "@/integrations/supabase/types";
import { SupabaseClient } from "@supabase/supabase-js";

// Set this to false to use Supabase instead of local storage
const USE_LOCAL_STORAGE = true;

type DatabaseClient = SupabaseClient<Database> | ReturnType<typeof useLocalStore>;

export const db: DatabaseClient = USE_LOCAL_STORAGE ? useLocalStore : supabase;