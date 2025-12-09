
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ session: null, user: null, loading: true, isAdmin: false, signOut: async () => {} });

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const handleAuthChange = async (session: Session | null) => {
      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error || !data) {
          const errorMessage = error ? JSON.stringify(error, null, 2) : 'Aucun profil correspondant trouvé dans la base de données.';
          console.error('Erreur de configuration : profil introuvable pour l\'utilisateur authentifié.', error);
          alert(`Votre session est invalide car votre profil est introuvable. Vous allez être déconnecté.\n\nDétails techniques: ${errorMessage}\n\nVeuillez vérifier que les permissions (RLS) sont correctes et que le profil existe.`);
          
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
        } else {
          setUser(data);
          setSession(session);
        }
      } else {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        handleAuthChange(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        handleAuthChange(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, loading, isAdmin: user?.role === 'ADMIN', signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
