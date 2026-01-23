
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

export interface Reminder {
  id: string;
  text: string;
  date: string;
  completed: boolean;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'new' | 'contacted' | 'meeting' | 'closed';
  tags: string[];
  desc: string;
  reminders?: Reminder[];
  lastContactDate?: string;
  assignedTo?: string;
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

export interface CampaignRelease {
  id: string;
  tag: string;
  name: string;
  notes: string;
  createdAt: string;
  leadCount: number;
  sequenceCount: number;
  githubUrl?: string;
}

export interface Agency {
  id: string;
  name: string;
  ownerId: string;
  members: Profile[];
}
