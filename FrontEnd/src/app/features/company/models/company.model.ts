// TEMPORARY: replace with the shared type once the team agrees on one
export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'pending', 'reviewed', 'shortlisted', 'rejected', 'hired',
];

export interface RequiredSkill {
  id: number;
  name: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  employerProfileId: number;
  companyName: string;
  createdAt: string;
  requiredSkills: RequiredSkill[];
}

export interface JobInput {
  title: string;
  description: string;
  skills: string[];
}

export interface Applicant {
  id: number;
  jobId: number;
  name: string;
  email: string;
  skills: string[];
  matchScore: number;
  status: ApplicationStatus;
  appliedAt: string;
  experience: string;
  bio: string;
}

export interface CompanyStats {
  activeJobs: number;
  totalApplicants: number;
  shortlisted: number;
  recent: Applicant[];
}