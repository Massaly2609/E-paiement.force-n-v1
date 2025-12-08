
import { Component, inject, signal, computed, effect } from '@angular/core';
import { RouterOutlet, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SupabaseService } from './services/supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="flex h-screen bg-[#F1F5F9] overflow-hidden font-sans text-slate-800">

      @if (user()) {
        <!-- Sidebar (Brand Premium Theme) -->
        <aside 
          class="bg-gradient-to-b from-[#003366] to-[#0f172a] flex flex-col transition-all duration-300 ease-in-out shadow-xl z-30 relative text-white"
          [class.w-72]="!isSidebarCollapsed()"
          [class.w-20]="isSidebarCollapsed()"
        >
          <!-- Logo Area -->
          <div class="h-16 flex items-center justify-center relative px-4 border-b border-white/10 bg-[#003366]/50 backdrop-blur-sm">
            @if (!isSidebarCollapsed()) {
              <div class="bg-white px-3 py-1.5 rounded-lg flex items-center justify-center shadow-sm w-full max-w-[180px]">
                 <img src="https://raagnale.force-n.sn/resources/13esy/login/keycloak/img/keycloak-logo-text.png" 
                   alt="FORCE-N" class="h-6 object-contain">
              </div>
            } @else {
              <div class="w-10 h-10 bg-white text-[#003366] rounded-lg flex items-center justify-center font-bold text-xl shadow-lg">
                F
              </div>
            }
          </div>

          <!-- Toggle Button (Absolute) -->
          <button (click)="toggleSidebar()" class="absolute -right-3 top-20 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 rounded-full p-1 shadow-md transition hover:scale-110 z-40">
              <span class="material-icons text-sm font-bold">{{ isSidebarCollapsed() ? 'chevron_right' : 'chevron_left' }}</span>
          </button>

          <!-- Navigation -->
          <nav class="flex-1 overflow-y-auto py-6 space-y-1 px-3 scrollbar-hide">
            
            <div class="mb-2 px-3 text-[10px] font-bold text-blue-200/60 uppercase tracking-widest" [class.hidden]="isSidebarCollapsed()">
              Menu Principal
            </div>

            @for (item of menuItems(); track item.label) {
              <a [routerLink]="item.route" 
                 routerLinkActive="bg-white/10 text-white shadow-lg border-l-4 border-orange-500" 
                 [routerLinkActiveOptions]="{exact: false}"
                 class="flex items-center px-3 py-3 text-blue-100/70 rounded-r-lg hover:bg-white/5 hover:text-white transition-all group relative mb-1 border-l-4 border-transparent">
                
                <span class="material-icons-outlined group-hover:text-white transition-colors duration-200 text-xl"
                      [class.text-orange-400]="router.isActive(item.route, {exact: false})">
                  {{ item.icon }}
                </span>
                
                @if (!isSidebarCollapsed()) {
                  <span class="ml-3 text-sm font-medium tracking-wide">{{ item.label }}</span>
                }
                
                <!-- Tooltip for collapsed state -->
                @if (isSidebarCollapsed()) {
                  <div class="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    {{ item.label }}
                  </div>
                }
              </a>
            }
          </nav>

          <!-- User Profile Snippet (Bottom Sidebar) -->
          <div class="p-4 border-t border-white/10 bg-[#002244]/50 backdrop-blur-sm">
            <div class="flex items-center gap-3 mb-4" [class.justify-center]="isSidebarCollapsed()">
              <div class="relative flex-shrink-0 group cursor-pointer">
                <img [src]="user()?.avatar_url || 'https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=U'" class="w-10 h-10 rounded-full border-2 border-orange-500 shadow-md object-cover">
                <span class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#002244] rounded-full"></span>
              </div>
              @if (!isSidebarCollapsed()) {
                <div class="flex-1 min-w-0 animate-fade-in">
                  <p class="text-sm font-bold text-white truncate">{{ user()?.full_name }}</p>
                  <p class="text-[10px] text-blue-200 truncate uppercase font-bold tracking-wider">{{ user()?.role }}</p>
                </div>
              }
            </div>
            <button (click)="logout()" class="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-red-600/90 hover:text-white text-blue-200 py-2.5 rounded-lg transition-all text-xs font-bold uppercase tracking-wide border border-white/5 hover:border-red-500/50">
              <span class="material-icons-outlined text-sm">logout</span>
              @if (!isSidebarCollapsed()) {
                <span>Déconnexion</span>
              }
            </button>
          </div>
        </aside>
      }

      <!-- Main Content -->
      <main class="flex-1 flex flex-col h-full overflow-hidden relative bg-[#F8FAFC]">
        
        @if (user()) {
          <!-- Top Header -->
          <header class="h-16 bg-white border-b border-slate-200/60 flex items-center justify-between px-6 z-20 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] sticky top-0">
            
            <!-- Breadcrumb / Search -->
            <div class="flex items-center gap-4">
              <div class="flex items-center text-slate-400 text-sm font-medium">
                 <span class="material-icons-outlined mr-2 text-slate-400 text-lg">grid_view</span> 
                 <span class="text-slate-800 font-bold tracking-tight">Espace {{ user()?.role === 'ADMIN' ? 'Administrateur' : 'Consultant' }}</span>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <!-- Notification Bell -->
              <button class="relative p-2 text-slate-400 hover:bg-slate-50 hover:text-blue-600 rounded-full transition-colors group">
                <span class="material-icons-outlined text-xl group-hover:animate-swing">notifications</span>
                <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 border border-white rounded-full animate-pulse"></span>
              </button>
              
              <!-- Help -->
              <button class="p-2 text-slate-400 hover:bg-slate-50 hover:text-blue-600 rounded-full transition-colors">
                <span class="material-icons-outlined text-xl">settings</span>
              </button>
            </div>
          </header>
        }

        <!-- Router Content -->
        <div class="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth relative">
          <div class="max-w-[1600px] mx-auto w-full pb-20">
            <router-outlet></router-outlet>
          </div>
        </div>

      </main>
    </div>
  `,
  styleUrls: []
})
export class AppComponent {
  supabase = inject(SupabaseService);
  router = inject(Router);
  
  isSidebarCollapsed = signal(false);
  
  user = this.supabase.currentUser;
  
  // Computed menu items based on role
  menuItems = computed(() => {
    const role = this.supabase.userRole();
    const base = [
      { label: 'Tableau de bord', icon: 'dashboard', route: '/dashboard' },
    ];
    
    if (!role) return [];

    if (role === 'ADMIN') {
      return [
        ...base,
        { label: 'Validation', icon: 'verified', route: '/validation' },
        { label: 'Paiements', icon: 'payments', route: '/payments' },
        { label: 'Rapports', icon: 'description', route: '/reports' },
        { label: 'Utilisateurs', icon: 'group', route: '/users' },
        { label: 'Paramètres', icon: 'settings', route: '/settings' }
      ];
    } else if (role === 'VALIDATION') {
      return [
        ...base,
        { label: 'File de validation', icon: 'fact_check', route: '/validation' },
        { label: 'Historique', icon: 'history', route: '/history' }
      ];
    } else { // Consultant or Mentor
      return [
        ...base,
        { label: 'Mes Missions', icon: 'business_center', route: '/missions' },
        { label: 'Mes Rapports', icon: 'topic', route: '/reports' },
        { label: 'Factures', icon: 'account_balance_wallet', route: '/payments' }
      ];
    }
  });

  toggleSidebar() {
    this.isSidebarCollapsed.update(v => !v);
  }

  async logout() {
    await this.supabase.signOut();
  }
}
