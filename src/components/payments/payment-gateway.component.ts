
import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-gateway',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-5xl mx-auto space-y-8 animate-fade-in">
      
      <!-- Header -->
      <div class="flex justify-between items-end">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Factures & Règlements</h2>
          <p class="text-slate-500">Gestion financière centralisée.</p>
        </div>
        <button (click)="loadData()" class="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition">
          <span class="material-icons">refresh</span>
        </button>
      </div>

      <!-- Invoices Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th class="px-6 py-4">Référence</th>
              <th class="px-6 py-4">Date</th>
              <th class="px-6 py-4">Bénéficiaire</th>
              <th class="px-6 py-4">Montant</th>
              <th class="px-6 py-4">Statut</th>
              <th class="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @if (loading()) {
              <tr><td colspan="6" class="p-8 text-center text-slate-400">Chargement...</td></tr>
            } @else if (invoices().length === 0) {
              <tr><td colspan="6" class="p-8 text-center text-slate-400">Aucune facture trouvée.</td></tr>
            }
            
            @for (inv of invoices(); track inv.id) {
              <tr class="hover:bg-slate-50 transition group">
                <td class="px-6 py-4 font-medium text-slate-700">{{ inv.number || 'N/A' }}</td>
                <td class="px-6 py-4 text-slate-500">{{ inv.issued_at | date:'shortDate' }}</td>
                <td class="px-6 py-4 text-slate-600">{{ inv.recipient }}</td>
                <td class="px-6 py-4 font-semibold text-slate-800">{{ inv.amount | currency:'XOF':'symbol':'1.0-0' }}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-green-100 text-green-800': inv.status === 'PAID',
                      'bg-yellow-100 text-yellow-800': inv.status === 'UNPAID',
                      'bg-blue-100 text-blue-800': inv.status === 'PROCESSING'
                    }">
                    {{ inv.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  @if (inv.status === 'UNPAID' && isAdmin()) {
                    <button (click)="openPaymentModal(inv)" class="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition">
                      Payer
                    </button>
                  } @else {
                    <span class="text-xs text-slate-400 italic">Aucune action</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Payment Modal -->
    @if (selectedInvoice()) {
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
          <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 class="font-bold text-lg text-slate-800">Initier le paiement</h3>
            <button (click)="closeModal()" class="text-slate-400 hover:text-red-500">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <div class="p-6 space-y-6">
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div class="text-sm text-blue-600 mb-1">Montant à régler</div>
              <div class="text-2xl font-bold text-blue-800">{{ selectedInvoice()?.amount | currency:'XOF':'symbol':'1.0-0' }}</div>
            </div>

            <!-- Payment Method Selection -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-3">Moyen de paiement</label>
              <div class="grid grid-cols-3 gap-3">
                <button (click)="method = 'WAVE'" [class.ring-2]="method === 'WAVE'" class="p-3 border rounded-xl hover:bg-slate-50 flex flex-col items-center gap-2">
                  <div class="font-bold text-blue-500">Wave</div>
                </button>
                <button (click)="method = 'OM'" [class.ring-2]="method === 'OM'" class="p-3 border rounded-xl hover:bg-slate-50 flex flex-col items-center gap-2">
                  <div class="font-bold text-orange-500">OM</div>
                </button>
                <button (click)="method = 'VISA'" [class.ring-2]="method === 'VISA'" class="p-3 border rounded-xl hover:bg-slate-50 flex flex-col items-center gap-2">
                  <div class="font-bold text-purple-600">VISA</div>
                </button>
              </div>
            </div>
            
            @if (processing()) {
              <div class="text-center text-blue-600 py-2">
                <span class="material-icons animate-spin">refresh</span> Traitement en cours...
              </div>
            }
          </div>

          <div class="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
             <button (click)="closeModal()" class="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition">Annuler</button>
             <button (click)="confirmPayment()" [disabled]="processing()" class="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition shadow-lg shadow-blue-200">
               Confirmer
             </button>
          </div>
        </div>
      </div>
    }
  `
})
export class PaymentGatewayComponent {
  supabase = inject(SupabaseService);
  
  invoices = signal<any[]>([]);
  loading = signal(true);
  processing = signal(false);
  selectedInvoice = signal<any>(null);
  method = 'WAVE';

  isAdmin = signal(false);

  constructor() {
    effect(() => {
      this.isAdmin.set(this.supabase.userRole() === 'ADMIN');
      if (this.supabase.currentUser()) {
        this.loadData();
      }
    });
  }

  async loadData() {
    this.loading.set(true);
    const data = await this.supabase.getInvoices();
    this.invoices.set(data);
    this.loading.set(false);
  }

  openPaymentModal(inv: any) {
    this.selectedInvoice.set(inv);
  }

  closeModal() {
    this.selectedInvoice.set(null);
    this.processing.set(false);
  }

  async confirmPayment() {
    if (!this.selectedInvoice()) return;
    
    this.processing.set(true);
    try {
      await this.supabase.initiatePayment(
        this.selectedInvoice().id,
        this.selectedInvoice().amount,
        this.method
      );
      alert('Paiement initié avec succès !');
      this.closeModal();
      this.loadData(); // Refresh list
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      this.processing.set(false);
    }
  }
}
