
import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Router } from '@angular/router';
import { UserRole, Invoice, Report, Mission } from '../models';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabaseUrl = 'https://fuspabizgooicdceehum.supabase.co';
  private supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1c3BhYml6Z29vaWNkY2VlaHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTM0MTQsImV4cCI6MjA4MDc4OTQxNH0.1XS4FOEMzOPpJwX9vtygTHN9XhivZPTYe5neh_CFi5w';
  
  private supabase: SupabaseClient;
  
  // États réactifs (Signals)
  currentUser = signal<any | null>(null);
  userRole = signal<UserRole | null>(null);
  loading = signal(true);

  constructor(private router: Router) {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    this.initSession();
  }

  get client() {
    return this.supabase;
  }

  // --- Authentification & Session ---

  async initSession() {
    this.loading.set(true);
    const { data: { session } } = await this.supabase.auth.getSession();
    
    if (session?.user) {
      await this.loadProfile(session.user.id);
    } else {
      this.resetState();
    }
    this.loading.set(false);

    this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await this.loadProfile(session.user.id);
      } else {
        this.resetState();
        if (event === 'SIGNED_OUT') this.router.navigate(['/login']);
      }
    });
  }

  private resetState() {
    this.currentUser.set(null);
    this.userRole.set(null);
  }

  async loadProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      this.currentUser.set(data);
      this.userRole.set(data.role as UserRole);
    }
  }

  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signUp(email: string, password: string, fullName: string) {
    return this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  // --- Données Métier (Missions, Rapports, Factures) ---

  // Dashboard Stats
  async getDashboardStats() {
    const userId = this.currentUser()?.id;
    const role = this.userRole();
    
    let stats = {
      pendingPayments: 0,
      activeMissions: 0,
      reportsToValidate: 0,
      balance: this.currentUser()?.balance || 0
    };

    if (role === 'ADMIN') {
      const { count: paymentsCount } = await this.supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('status', 'UNPAID');
      const { count: reportsCount } = await this.supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'SUBMITTED');
      const { count: missionsCount } = await this.supabase.from('missions').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE');
      
      stats.pendingPayments = paymentsCount || 0;
      stats.reportsToValidate = reportsCount || 0;
      stats.activeMissions = missionsCount || 0;
    } else {
      const { count: missionsCount } = await this.supabase.from('missions').select('*', { count: 'exact', head: true }).eq('consultant_id', userId).eq('status', 'ACTIVE');
      const { count: reportsCount } = await this.supabase.from('reports').select('*', { count: 'exact', head: true }).eq('consultant_id', userId).eq('status', 'SUBMITTED');
      
      stats.activeMissions = missionsCount || 0;
      stats.reportsToValidate = reportsCount || 0; // Rapports en attente
    }

    return stats;
  }

  // Factures
  async getInvoices() {
    const query = this.supabase.from('invoices').select('*, profiles(full_name)');
    
    // Si pas admin, voir seulement ses propres factures
    if (this.userRole() !== 'ADMIN') {
      query.eq('owner_id', this.currentUser()?.id);
    }
    
    const { data, error } = await query;
    // Map pour avoir le nom du destinataire à plat
    return (data || []).map((inv: any) => ({
      ...inv,
      recipient: inv.profiles?.full_name || 'Inconnu'
    }));
  }

  // Paiements (Création)
  async initiatePayment(invoiceId: string, amount: number, method: string) {
    // 1. Créer l'entrée dans la table payments
    const { data, error } = await this.supabase.from('payments').insert({
      invoice_id: invoiceId,
      amount: amount,
      method: method,
      status: 'PENDING',
      provider_ref: `REF-${Math.floor(Math.random() * 100000)}` // Simulation réf provider
    }).select().single();

    if (error) throw error;

    // 2. Mettre à jour le statut de la facture
    await this.supabase.from('invoices').update({ status: 'PROCESSING' }).eq('id', invoiceId);

    return data;
  }

  // Missions
  async getMissions() {
    const query = this.supabase.from('missions').select('*');
    if (this.userRole() !== 'ADMIN') {
      query.eq('consultant_id', this.currentUser()?.id);
    }
    const { data } = await query;
    return data || [];
  }
}
