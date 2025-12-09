
import { createClient } from '@supabase/supabase-js';
import { UserRole } from '../types';

const supabaseUrl = 'https://fuspabizgooicdceehum.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1c3BhYml6Z29vaWNkY2VlaHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTM0MTQsImV4cCI6MjA4MDc4OTQxNH0.1XS4FOEMzOPpJwX9vtygTHN9XhivZPTYe5neh_CFi5w';

// 1. Client PRINCIPAL (Singleton)
// Ce client utilisera la session de l'administrateur connecté pour les opérations.
export const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Client SECONDAIRE (Création utilisateurs sans déconnexion)
// Ce client est isolé pour ne pas perturber la session de l'admin.
const adminCreatorClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, 
    autoRefreshToken: false,
    detectSessionInUrl: false,
  }
});

// NOUVELLE LOGIQUE SANS TRIGGER
export const adminCreateUser = async (email: string, password: string, fullName: string, role: UserRole) => {
  // ÉTAPE 1: Créer l'utilisateur dans le système d'authentification de Supabase.
  const { data: authData, error: authError } = await adminCreatorClient.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.error("Auth Error:", authError);
    throw new Error(`Erreur d'authentification : ${authError.message}`);
  }
  if (!authData.user) {
    throw new Error("La création de l'utilisateur a échoué : aucun utilisateur retourné.");
  }
  
  // ÉTAPE 2: Insérer manuellement le profil dans la table `profiles`.
  // On utilise le client `supabase` principal, qui est authentifié en tant qu'admin
  // et a donc les droits d'insertion grâce à la nouvelle policy SQL.
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id, // L'ID vient de l'utilisateur fraîchement créé
      full_name: fullName,
      email: email,
      role: role,
      balance: 0,
    });

  if (profileError) {
    // C'est une erreur critique. L'utilisateur a été créé dans Auth, mais pas son profil.
    // Idéalement, il faudrait ici supprimer l'utilisateur Auth pour nettoyer.
    // Pour l'instant, on remonte une erreur claire.
    console.error("Profile Error:", profileError);
    // On essaie de supprimer l'utilisateur créé pour éviter les "utilisateurs fantômes"
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error(`Erreur de base de données : Le profil n'a pas pu être créé. L'utilisateur a été nettoyé. Détails : ${profileError.message}`);
  }

  // Si tout a réussi, on retourne les données de l'utilisateur
  return authData;
};
