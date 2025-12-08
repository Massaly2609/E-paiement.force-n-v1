
import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { StatsCardComponent } from './stats-card.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatsCardComponent, RouterLink],
  template: `
    <div class="space-y-8 animate-fade-in">
      
      <!-- Welcome Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Tableau de bord</span>
            @if(role() === 'ADMIN') {
              <span class="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full uppercase tracking-wide border border-blue-200">Admin</span>
            }
          </h1>
          <p class="text-slate-500 mt-1 font-medium">
            @if (role() === 'ADMIN') {
              Vue d'ensemble de la performance et des validations.
            } @else {
              Suivez vos missions et vos paiements en temps réel.
            }
          </p>
        </div>
        
        <div class="flex items-center gap-3">
          <span class="text-sm text-slate-400 bg-white px-3 py-1 rounded-md border border-slate-200 shadow-sm flex items-center">
            <span class="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            En ligne
          </span>
          <button class="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 flex items-center">
            <span class="material-icons text-base mr-2">download</span>
            Exporter
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        @if (loading()) {
           <div class="col-span-full h-32 bg-white rounded-xl animate-pulse"></div>
        } @else {
          @if (role() === 'ADMIN') {
            <app-stats-card title="Chiffre d'affaires" [value]="(stats().balance || 24500000) | currency:'XOF':'symbol':'1.0-0'" icon="account_balance" color="blue" [trend]="12"></app-stats-card>
            <app-stats-card title="En attente Paiement" [value]="stats().pendingPayments" icon="payments" color="orange" [trend]="-5"></app-stats-card>
            <app-stats-card title="Rapports à Valider" [value]="stats().reportsToValidate" icon="fact_check" color="purple"></app-stats-card>
            <app-stats-card title="Utilisateurs Actifs" [value]="stats().activeMissions + 12" icon="group" color="green" [trend]="8"></app-stats-card>
          } @else {
            <app-stats-card title="Mon Solde" [value]="(stats().balance | currency:'XOF':'symbol':'1.0-0')" icon="account_balance_wallet" color="green" [trend]="5"></app-stats-card>
            <app-stats-card title="Missions Actives" [value]="stats().activeMissions" icon="business_center" color="blue"></app-stats-card>
            <app-stats-card title="Rapports Soumis" [value]="stats().reportsToValidate" icon="description" color="purple"></app-stats-card>
            <app-stats-card title="Taux de validation" value="98%" icon="verified" color="orange"></app-stats-card>
          }
        }
      </div>

      <!-- Content Area -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <!-- Main Panel: Recent Transactions / List -->
        <div class="xl:col-span-2 space-y-8">
          
          <!-- Chart Placeholder (CSS Only) -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div class="flex justify-between items-center mb-6">
              <h3 class="font-bold text-lg text-slate-800">Flux Financiers</h3>
              <select class="text-sm border-slate-200 rounded-md text-slate-500 bg-slate-50">
                <option>Cette année</option>
                <option>Ce mois</option>
              </select>
            </div>
            
            <!-- Simple CSS Bar Chart -->
            <div class="h-64 flex items-end justify-between gap-2 px-2">
              @for (bar of [40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95]; track $index) {
                <div class="w-full bg-blue-50 rounded-t-sm relative group transition-all hover:bg-blue-100 cursor-pointer">
                  <div [style.height.%]="bar" class="absolute bottom-0 w-full bg-blue-600 rounded-t-sm transition-all duration-500 group-hover:bg-blue-700"></div>
                  <!-- Tooltip -->
                  <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {{ bar }}%
                  </div>
                </div>
              }
            </div>
            <div class="flex justify-between mt-2 text-xs text-slate-400 uppercase font-bold">
              <span>Jan</span><span>Fev</span><span>Mar</span><span>Avr</span><span>Mai</span><span>Juin</span>
              <span>Juil</span><span>Aou</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
          </div>

          <!-- Recent Transactions Table -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 class="font-bold text-lg text-slate-800">Dernières opérations</h3>
              <button class="text-blue-600 text-sm font-bold hover:underline">Voir tout</button>
            </div>
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th class="px-6 py-3">Référence</th>
                  <th class="px-6 py-3">Utilisateur</th>
                  <th class="px-6 py-3">Date</th>
                  <th class="px-6 py-3">Montant</th>
                  <th class="px-6 py-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr class="hover:bg-slate-50 transition">
                  <td class="px-6 py-3 font-mono text-slate-600">INV-2024-001</td>
                  <td class="px-6 py-3 font-medium text-slate-800">Moussa Diop</td>
                  <td class="px-6 py-3 text-slate-500">12 Oct 2024</td>
                  <td class="px-6 py-3 font-bold text-slate-800">450 000 F</td>
                  <td class="px-6 py-3 text-right">
                    <span class="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">PAYÉ</span>
                  </td>
                </tr>
                <tr class="hover:bg-slate-50 transition">
                  <td class="px-6 py-3 font-mono text-slate-600">REP-2024-089</td>
                  <td class="px-6 py-3 font-medium text-slate-800">Aminata Sow</td>
                  <td class="px-6 py-3 text-slate-500">11 Oct 2024</td>
                  <td class="px-6 py-3 font-bold text-slate-800">1 200 000 F</td>
                  <td class="px-6 py-3 text-right">
                    <span class="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold">EN ATTENTE</span>
                  </td>
                </tr>
                <tr class="hover:bg-slate-50 transition">
                  <td class="px-6 py-3 font-mono text-slate-600">INV-2024-002</td>
                  <td class="px-6 py-3 font-medium text-slate-800">Jean Ndiaye</td>
                  <td class="px-6 py-3 text-slate-500">10 Oct 2024</td>
                  <td class="px-6 py-3 font-bold text-slate-800">850 000 F</td>
                  <td class="px-6 py-3 text-right">
                    <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">TRAITEMENT</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Side Panel: Notifications & Quick Actions -->
        <div class="space-y-6">
          
          <!-- Quick Actions -->
          <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
            <div class="absolute top-0 right-0 p-4 opacity-10">
              <span class="material-icons text-9xl">bolt</span>
            </div>
            <h3 class="font-bold text-lg mb-4 relative z-10">Actions Rapides</h3>
            <div class="grid grid-cols-2 gap-3 relative z-10">
              <button class="bg-white/10 hover:bg-white/20 border border-white/10 p-3 rounded-lg text-center transition backdrop-blur-sm">
                <span class="material-icons block mb-1 text-blue-400">add_task</span>
                <span class="text-xs font-bold">Nv. Mission</span>
              </button>
              <button class="bg-white/10 hover:bg-white/20 border border-white/10 p-3 rounded-lg text-center transition backdrop-blur-sm">
                <span class="material-icons block mb-1 text-green-400">person_add</span>
                <span class="text-xs font-bold">Inviter</span>
              </button>
              <button routerLink="/payments" class="col-span-2 bg-blue-600 hover:bg-blue-500 p-3 rounded-lg text-center font-bold text-sm shadow-lg shadow-blue-900/50 transition">
                Gérer les Paiements
              </button>
            </div>
          </div>

          <!-- Recent Activity Feed -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 class="font-bold text-lg text-slate-800 mb-4">Fil d'actualité</h3>
            <div class="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              
              <div class="relative pl-10">
                <div class="absolute left-2 top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></div>
                <p class="text-sm text-slate-800 font-medium">Nouveau rapport soumis</p>
                <p class="text-xs text-slate-500">Par <span class="text-slate-700 font-bold">Jean Diop</span> pour la mission Transformation Digitale.</p>
                <span class="text-[10px] text-slate-400 mt-1 block">Il y a 10 min</span>
              </div>

              <div class="relative pl-10">
                <div class="absolute left-2 top-1 w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm"></div>
                <p class="text-sm text-slate-800 font-medium">Paiement effectué</p>
                <p class="text-xs text-slate-500">Virement Wave de <span class="font-mono">450.000F</span> vers Amina Sow.</p>
                <span class="text-[10px] text-slate-400 mt-1 block">Il y a 2h</span>
              </div>

              <div class="relative pl-10">
                <div class="absolute left-2 top-1 w-4 h-4 rounded-full bg-orange-400 border-4 border-white shadow-sm"></div>
                <p class="text-sm text-slate-800 font-medium">Validation requise</p>
                <p class="text-xs text-slate-500">3 feuilles de présence en attente.</p>
                <span class="text-[10px] text-slate-400 mt-1 block">Hier</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  supabase = inject(SupabaseService);
  user = this.supabase.currentUser;
  role = this.supabase.userRole;
  
  loading = signal(true);
  stats = signal<any>({});

  constructor() {
    effect(async () => {
      if (this.user()) {
        const data = await this.supabase.getDashboardStats();
        this.stats.set(data);
        this.loading.set(false);
      }
    });
  }
}
