import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (session) {
    navigate('/dashboard');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Identifiants incorrects.");
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-slate-900 overflow-hidden">
      {/* Background Image - Plus visible (opacité augmentée, overlay réduit) */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://raagnale.force-n.sn/resources/13esy/login/keycloak/img/keycloak-bg.png')" }}
      />
      
      {/* Overlay très léger pour garder la lisibilité sans cacher l'image */}
      <div className="absolute inset-0 z-0 bg-black/30"></div>

      {/* Login Card Compacte */}
      <div className="relative z-10 w-full max-w-[360px] bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden animate-[fadeInUp_0.5s_ease-out] border-t-4 border-blue-700 mx-4">
        
        <div className="pt-8 pb-4 text-center px-6">
          <img 
            src="https://raagnale.force-n.sn/resources/13esy/login/keycloak/img/keycloak-logo-text.png" 
            alt="FORCE-N" 
            className="h-8 mx-auto mb-4 object-contain"
          />
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Connexion</h1>
        </div>

        {error && (
          <div className="mx-6 mb-4 p-2.5 bg-red-50 border border-red-100 rounded flex items-center gap-2 text-red-600 text-xs font-bold animate-[fadeIn_0.3s]">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="px-6 pb-6 space-y-4">
          <div className="space-y-1">
            <div className="relative group">
              <Mail className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-600 block transition-all outline-none placeholder:text-slate-400"
                placeholder="Email professionnel"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative group">
              <Lock className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-600 block transition-all outline-none placeholder:text-slate-400"
                placeholder="Mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2.5 text-slate-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex justify-end pt-1">
              <a href="#" className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold hover:underline">Mot de passe oublié ?</a>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 focus:ring-4 focus:ring-blue-300 font-bold rounded text-sm px-5 py-2.5 text-center transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-700/20 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Se connecter'}
          </button>
        </form>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-center gap-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
            <a href="#" className="hover:text-blue-600 transition-colors">Aide</a>
            <span className="text-slate-300">|</span>
            <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
        </div>
      </div>
      
      {/* Footer Branding Discret */}
      <div className="absolute bottom-4 text-white/50 text-[10px] font-medium tracking-widest uppercase">
        Plateforme Force-N &copy; 2024
      </div>
    </div>
  );
}