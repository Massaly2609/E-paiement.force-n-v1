
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Background Image container (FIXED) -->
    <div class="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
         style="background-image: url('https://raagnale.force-n.sn/resources/13esy/login/keycloak/img/keycloak-bg.png');">
      <!-- Dark overlay for better contrast -->
      <div class="absolute inset-0 bg-black/50"></div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
      
      <!-- Glass Card (Compact & Professional) -->
      <div class="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-[380px] overflow-hidden animate-fade-in-up border-t-4 border-blue-700">
        
        <!-- Header with Logo -->
        <div class="pt-8 pb-6 text-center px-6">
          <img src="https://raagnale.force-n.sn/resources/13esy/login/keycloak/img/keycloak-logo-text.png" 
               alt="FORCE-N" class="h-10 mx-auto mb-5 object-contain">
          
          <h1 class="text-xl font-bold text-slate-800 tracking-tight">Connexion</h1>
          <p class="text-slate-500 text-xs mt-1">Accédez à votre espace sécurisé</p>
        </div>

        <!-- Error Alert -->
        @if (errorMessage()) {
          <div class="mx-6 bg-red-50 border border-red-100 text-red-600 p-3 text-xs rounded-lg flex items-start gap-2 mb-4 animate-fade-in">
            <span class="material-icons text-sm mt-0.5">error_outline</span>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <!-- Form -->
        <form (submit)="onSubmit()" class="px-8 pb-8 space-y-5">
          
          <!-- Email Field -->
          <div>
            <div class="relative group">
               <span class="material-icons absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-600 transition-colors text-xl">email</span>
               <input type="email" [(ngModel)]="email" name="email" required
                   class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 block transition-all outline-none placeholder:text-slate-400"
                   placeholder="Email professionnel">
            </div>
          </div>

          <!-- Password Field -->
          <div>
            <div class="relative group">
               <span class="material-icons absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-600 transition-colors text-xl">lock</span>
               <input [type]="showPassword() ? 'text' : 'password'" [(ngModel)]="password" name="password" required
                   class="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 block transition-all outline-none placeholder:text-slate-400"
                   placeholder="Mot de passe">
               
               <!-- Toggle Password Visibility -->
               <button type="button" (click)="togglePassword()" 
                       class="absolute right-3 top-3 text-slate-400 hover:text-blue-700 transition-colors focus:outline-none">
                 <span class="material-icons text-lg">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
               </button>
            </div>
            <div class="flex justify-end mt-1.5">
               <a href="#" class="text-xs text-blue-700 hover:underline font-medium">Mot de passe oublié ?</a>
            </div>
          </div>

          <button type="submit" [disabled]="loading()"
                  class="w-full text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 focus:ring-4 focus:ring-blue-300 font-bold rounded-lg text-sm px-5 py-2.5 text-center transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-700/20 mt-2">
            @if (loading()) {
              <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            }
            {{ loading() ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>
      </div>
      
      <!-- Footer links (Fixed Style) -->
      <div class="mt-8 flex gap-6 text-white/70 text-[11px] font-medium tracking-wide">
        <span class="cursor-pointer hover:text-white transition-colors">Conditions d'utilisation</span> 
        <span class="cursor-pointer hover:text-white transition-colors">Politique de confidentialité</span>
        <span class="cursor-pointer hover:text-white transition-colors">Aide</span>
      </div>
    </div>
  `
})
export class LoginComponent {
  supabaseService = inject(SupabaseService);
  router = inject(Router);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);

  email = '';
  password = '';

  constructor() {
    // Redirection automatique si déjà connecté
    if (this.supabaseService.currentUser()) {
      this.router.navigate(['/dashboard']);
    }
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  async onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage.set('Veuillez saisir vos identifiants.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      const { error } = await this.supabaseService.signIn(this.email, this.password);
      if (error) throw error;
      
      // La redirection est gérée par le listener d'auth, mais on assure le coup
      this.router.navigate(['/dashboard']);

    } catch (err: any) {
      this.errorMessage.set('Identifiants incorrects ou problème de connexion.');
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }
}
