
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fuspabizgooicdceehum.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1c3BhYml6Z29vaWNkY2VlaHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTM0MTQsImV4cCI6MjA4MDc4OTQxNH0.1XS4FOEMzOPpJwX9vtygTHN9XhivZPTYe5neh_CFi5w';

// 1. Client PRINCIPAL (Singleton)
// Utilisé pour la session active de l'admin.
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

// Implementation d'un stockage mémoire vide pour isoler totalement le client secondaire
// Cela supprime définitivement le warning "Multiple GoTrueClient" et les conflits de session
const memoryStorage = {
  getItem: (key: string) => null,
  setItem: (key: string, value: string) => {},
  removeItem: (key: string) => {},
};

// 2. Client SECONDAIRE (Singleton)
// Dédié uniquement à la création de comptes sans perturber la session admin.
const adminCreatorClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, 
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storage: memoryStorage // Isolation parfaite: n'utilise PAS le localStorage du navigateur
  }
});

/**
 * Fonction robuste pour créer un utilisateur sans déconnecter l'admin.
 */
export const adminCreateUser = async (email: string, password: string, fullName: string, role: UserRole) => {
  // On s'assure que le client secondaire est propre
  await adminCreatorClient.auth.signOut();

  // On crée le compte avec un maximum de métadonnées pour satisfaire les triggers DB stricts.
  const { data, error } = await adminCreatorClient.auth.signUp({
    email,
    password,
    options: {
      data: { 
        full_name: fullName,
        name: fullName, // Doublon de sécurité pour les triggers qui cherchent "name"
        role: role,
        balance: 0,
        avatar_url: '',
        phone: '' // Champ vide pour éviter les erreurs si la DB l'attend
      }
    }
  });

  if (error) throw error;
  
  // Nettoyage final par sécurité
  await adminCreatorClient.auth.signOut();

  return data;
};
