import { supabase } from "@/integrations/supabase/client";
import useLocalStore from "./localStore";

// Set this to false to use Supabase instead of local storage
const USE_LOCAL_STORAGE = true;

export const db = USE_LOCAL_STORAGE ? useLocalStore : supabase;