
export type UserRole = 'freelancer' | 'agency_owner' | 'agency_va';
export type UserPlan = 'starter' | 'pro' | 'agency';

export interface Profile {
  id: string;
  fullName: string;
  role: UserRole;
  plan: UserPlan;
  isVerified: boolean;
  agencyId?: string;
  serviceType: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  status: 'new' | 'contacted' | 'negotiating' | 'closed' | 'lost';
  source: string;
  assignedTo?: string;
  lastContactDate?: string;
  notes?: string;
}

export interface OutreachSequence {
  id: string;
  name: string;
  steps: OutreachStep[];
}

export interface OutreachStep {
  id: string;
  day: number;
  subject: string;
  content: string;
}

export interface Agency {
  id: string;
  name: string;
  ownerId: string;
  members: Profile[];
}
