import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-slate-800">Mes Rapports</h2>
        <button (click)="isFormOpen.set(true)" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center shadow-md">
          <span class="material-icons mr-2">upload_file</span>
          Soumettre un rapport
        </button>
      </div>

      <!-- Report List -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th class="px-6 py-4">Période</th>
              <th class="px-6 py-4">Mission</th>
              <th class="px-6 py-4">Date soumission</th>
              <th class="px-6 py-4">Statut</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (report of reports(); track report.id) {
              <tr class="hover:bg-slate-50 transition">
                <td class="px-6 py-4 font-medium text-slate-800">{{ report.period }}</td>
                <td class="px-6 py-4 text-slate-600">{{ report.missionTitle }}</td>
                <td class="px-6 py-4 text-slate-500">{{ report.submittedAt }}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-orange-100 text-orange-800': report.status === 'SUBMITTED',
                      'bg-green-100 text-green-800': report.status === 'APPROVED' || report.status === 'PAID',
                      'bg-red-100 text-red-800': report.status === 'REJECTED'
                    }">
                    {{ report.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button class="text-slate-400 hover:text-blue-600 transition">
                    <span class="material-icons">visibility</span>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Submit Form Modal -->
      @if (isFormOpen()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
             <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 class="font-bold text-lg text-slate-800">Nouveau Rapport</h3>
              <button (click)="isFormOpen.set(false)" class="text-slate-400 hover:text-red-500">
                <span class="material-icons">close</span>
              </button>
            </div>
            
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Mission</label>
                <select class="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  @for (m of missions(); track m.id) {
                    <option [value]="m.id">{{ m.title }}</option>
                  }
                </select>
              </div>

              <div>
                 <label class="block text-sm font-medium text-slate-700 mb-1">Période concernée</label>
                 <input type="month" class="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500">
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Document (PDF)</label>
                <div class="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 cursor-pointer transition">
                  <span class="material-icons text-slate-400 text-4xl mb-2">cloud_upload</span>
                  <p class="text-sm text-slate-600 font-medium">Glissez votre fichier ici ou cliquez</p>
                  <p class="text-xs text-slate-400 mt-1">PDF uniquement, max 5MB</p>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Commentaires</label>
                <textarea rows="3" class="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
            </div>

            <div class="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button (click)="isFormOpen.set(false)" class="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition">Annuler</button>
              <button (click)="submit()" class="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                Soumettre
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ReportListComponent {
  dataService = inject(DataService);
  
  reports = this.dataService.reports;
  missions = this.dataService.missions;
  
  isFormOpen = signal(false);

  submit() {
    // Mock submission logic
    alert('Rapport soumis avec succès ! Il est en attente de validation.');
    this.isFormOpen.set(false);
  }
}