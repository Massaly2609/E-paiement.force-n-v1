import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Report } from '../../models';

@Component({
  selector: 'app-validation-queue',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">File de Validation</h2>
          <p class="text-slate-500">Gérez les rapports et feuilles de présence en attente.</p>
        </div>
        <div class="flex gap-2">
          <button (click)="filter.set('ALL')" [class.bg-slate-800]="filter() === 'ALL'" [class.text-white]="filter() === 'ALL'" class="px-4 py-2 rounded-full text-sm font-medium border border-slate-200 hover:bg-slate-100 transition">Tout</button>
          <button (click)="filter.set('SUBMITTED')" [class.bg-orange-500]="filter() === 'SUBMITTED'" [class.text-white]="filter() === 'SUBMITTED'" class="px-4 py-2 rounded-full text-sm font-medium border border-slate-200 hover:bg-orange-50 transition">En attente</button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- List Panel -->
        <div class="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div class="p-4 border-b border-slate-100 bg-slate-50 font-semibold text-slate-700">
            Demandes ({{ filteredReports().length }})
          </div>
          <div class="flex-1 overflow-y-auto">
            @for (report of filteredReports(); track report.id) {
              <div 
                (click)="selectReport(report)"
                [class.bg-blue-50]="selectedReport()?.id === report.id"
                [class.border-l-4]="selectedReport()?.id === report.id"
                [class.border-blue-500]="selectedReport()?.id === report.id"
                class="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition border-l-4 border-transparent"
              >
                <div class="flex justify-between items-start mb-1">
                  <span class="font-bold text-slate-800">{{ report.consultantName }}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full" 
                    [ngClass]="{
                      'bg-orange-100 text-orange-700': report.status === 'SUBMITTED',
                      'bg-green-100 text-green-700': report.status === 'APPROVED',
                      'bg-red-100 text-red-700': report.status === 'REJECTED'
                    }">
                    {{ report.status }}
                  </span>
                </div>
                <p class="text-sm text-slate-600 mb-1">{{ report.missionTitle }}</p>
                <p class="text-xs text-slate-400">{{ report.period }} • {{ report.amount | currency:'XOF':'symbol':'1.0-0' }}</p>
              </div>
            }
          </div>
        </div>

        <!-- Detail Panel -->
        <div class="lg:col-span-2">
          @if (selectedReport(); as report) {
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 h-full">
              <div class="flex justify-between items-start mb-6">
                <div>
                  <h3 class="text-2xl font-bold text-slate-800">Détails du rapport</h3>
                  <p class="text-slate-500">Référence: #{{ report.id }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-slate-400">Soumis le</p>
                  <p class="font-medium text-slate-800">{{ report.submittedAt }}</p>
                </div>
              </div>

              <!-- Document Preview Placeholder -->
              <div class="bg-slate-100 rounded-xl h-64 flex items-center justify-center border-2 border-dashed border-slate-300 mb-6">
                <div class="text-center">
                  <span class="material-icons text-4xl text-slate-400 mb-2">picture_as_pdf</span>
                  <p class="text-slate-500 font-medium">Aperçu du document PDF</p>
                  <button class="mt-2 text-blue-600 hover:underline text-sm">Télécharger</button>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-8">
                <div class="p-4 rounded-lg bg-slate-50">
                  <p class="text-xs text-slate-500 uppercase font-bold">Consultant</p>
                  <p class="text-slate-800 font-medium">{{ report.consultantName }}</p>
                </div>
                <div class="p-4 rounded-lg bg-slate-50">
                  <p class="text-xs text-slate-500 uppercase font-bold">Montant à payer</p>
                  <p class="text-slate-800 font-medium text-xl">{{ report.amount | currency:'XOF':'symbol':'1.0-0' }}</p>
                </div>
              </div>

              @if (report.status === 'SUBMITTED') {
                <div class="flex gap-4 border-t border-slate-100 pt-6">
                  <button (click)="approve(report.id)" class="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-green-200 transition flex items-center justify-center gap-2">
                    <span class="material-icons">check_circle</span>
                    Valider le rapport
                  </button>
                  <button (click)="reject(report.id)" class="flex-1 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2">
                    <span class="material-icons">cancel</span>
                    Rejeter
                  </button>
                </div>
              } @else {
                 <div class="bg-slate-50 p-4 rounded-lg text-center border border-slate-200">
                    Ce rapport a déjà été traité. Statut: <strong>{{ report.status }}</strong>
                 </div>
              }
            </div>
          } @else {
            <div class="h-full bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 flex-col">
              <span class="material-icons text-6xl mb-4 text-slate-300">topic</span>
              <p>Sélectionnez un rapport pour voir les détails</p>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ValidationQueueComponent {
  dataService = inject(DataService);
  
  filter = signal<'ALL' | 'SUBMITTED'>('SUBMITTED');
  selectedReport = signal<Report | null>(null);

  filteredReports = computed(() => {
    const all = this.dataService.reports();
    if (this.filter() === 'ALL') return all;
    return all.filter(r => r.status === 'SUBMITTED');
  });

  selectReport(r: Report) {
    this.selectedReport.set(r);
  }

  approve(id: string) {
    if (confirm('Êtes-vous sûr de vouloir valider ce rapport ? Cela déclenchera la génération de la facture.')) {
      this.dataService.updateReportStatus(id, 'APPROVED');
      // In a real app, generate invoice here
      this.selectedReport.set(null);
    }
  }

  reject(id: string) {
    const reason = prompt('Motif du rejet :');
    if (reason) {
      this.dataService.updateReportStatus(id, 'REJECTED');
      this.selectedReport.set(null);
    }
  }
}