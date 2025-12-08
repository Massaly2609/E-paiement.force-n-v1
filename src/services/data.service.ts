import { Injectable, signal } from '@angular/core';
import { User, Mission, Report, Invoice, Notification } from '../models';

@Injectable({ providedIn: 'root' })
export class DataService {
  // Mock Data Store using Signals for reactivity
  
  currentUser = signal<User | null>(null);

  missions = signal<Mission[]>([
    { id: 'm1', title: 'Transformation Digitale - PME A', consultantName: 'Jean Diop', status: 'ACTIVE', startDate: '2023-01-10', endDate: '2023-06-30' },
    { id: 'm2', title: 'Coaching Agile - Startup B', consultantName: 'Amina Sow', status: 'PENDING', startDate: '2023-05-01', endDate: '2023-12-31' },
    { id: 'm3', title: 'Audit Sécurité - Banque C', consultantName: 'Moussa Ndiaye', status: 'COMPLETED', startDate: '2022-11-01', endDate: '2023-02-28' },
  ]);

  reports = signal<Report[]>([
    { id: 'r1', missionId: 'm1', missionTitle: 'Transformation Digitale', consultantId: 'u2', consultantName: 'Jean Diop', period: 'Mars 2023', status: 'SUBMITTED', submittedAt: '2023-04-02', amount: 450000 },
    { id: 'r2', missionId: 'm1', missionTitle: 'Transformation Digitale', consultantId: 'u2', consultantName: 'Jean Diop', period: 'Fevrier 2023', status: 'APPROVED', submittedAt: '2023-03-01', amount: 450000 },
    { id: 'r3', missionId: 'm3', missionTitle: 'Audit Sécurité', consultantId: 'u4', consultantName: 'Moussa Ndiaye', period: 'Fevrier 2023', status: 'PAID', submittedAt: '2023-03-05', amount: 800000 },
  ]);

  invoices = signal<Invoice[]>([
    { id: 'inv1', number: 'INV-2023-001', recipient: 'Jean Diop', amount: 450000, status: 'UNPAID', date: '2023-04-05' },
    { id: 'inv2', number: 'INV-2023-002', recipient: 'Moussa Ndiaye', amount: 800000, status: 'PAID', date: '2023-03-10' },
  ]);

  notifications = signal<Notification[]>([
    { id: 'n1', title: 'Nouveau rapport', message: 'Jean Diop a soumis son rapport de Mars.', type: 'info', read: false, timestamp: '10 min' },
    { id: 'n2', title: 'Paiement échoué', message: 'Echec virement vers Orange Money (Solde insuffisant).', type: 'error', read: false, timestamp: '2h' },
    { id: 'n3', title: 'Validation requise', message: '3 rapports en attente de validation.', type: 'warning', read: true, timestamp: '1j' },
  ]);

  login(role: string) {
    // Simulate login based on role selection
    const mockUser: User = {
      id: 'u1',
      name: role === 'ADMIN' ? 'Admin Principal' : (role === 'CONSULTANT' ? 'Jean Diop' : 'Fatou Fall'),
      email: 'user@forcen.sn',
      role: role as any,
      avatarUrl: `https://i.pravatar.cc/150?u=${role}`,
      balance: role === 'CONSULTANT' ? 1200000 : 0
    };
    this.currentUser.set(mockUser);
    localStorage.setItem('user_role', role);
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('user_role');
  }

  addReport(report: Report) {
    this.reports.update(current => [report, ...current]);
  }

  updateReportStatus(id: string, status: any) {
    this.reports.update(current => 
      current.map(r => r.id === id ? { ...r, status } : r)
    );
  }
}