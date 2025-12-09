import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fuspabizgooicdceehum.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1c3BhYml6Z29vaWNkY2VlaHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTM0MTQsImV4cCI6MjA4MDc4OTQxNH0.1XS4FOEMzOPpJwX9vtygTHN9XhivZPTYe5neh_CFi5w';

// Client principal (persistant)
export const supabase = createClient(supabaseUrl, supabaseKey);

export type UserRole = 'ADMIN' | 'CONSULTANT' | 'MENTOR' | 'VALIDATION';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  balance?: number;
  created_at?: string;
}

/**
 * Astuce technique pour créer un utilisateur sans déconnecter l'admin :
 * On crée une instance client temporaire qui ne sauvegarde pas la session.
 */
export const adminCreateUser = async (email: string, password: string, fullName: string, role: UserRole) => {
  const tempClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // Important : ne pas écraser la session de l'admin
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  // 1. Créer le compte Auth
  const { data: authData, error: authError } = await tempClient.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName } // Sera utilisé par le trigger SQL pour remplir 'profiles'
    }
  });

  if (authError) throw authError;

  if (authData.user) {
    // 2. Mettre à jour le rôle immédiatement (car le trigger met 'CONSULTANT' par défaut)
    // On utilise le client principal (Admin) pour avoir les droits d'écriture RLS
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: role })
      .eq('id', authData.user.id);

    if (profileError) {
      console.warn("User created but role update failed:", profileError);
    }
  }

  return authData;
};
