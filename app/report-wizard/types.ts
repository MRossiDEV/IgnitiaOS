export interface ReportWizardData {
  reportCode: string;
  accessCode: string;
  status: "new" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
  viewed_at: string | null;
  viewed_count: number;
  expires_at: string;
  businessType: string;
  website: string;
  businessName: string;
  businessSize: string;
  city: string;
  country: string;
  primary_goal: string;
  industry: string;
  biggest_challenge: string[];
  marketing_channels: string[];
  competitors: string;
  ai_summary: string | null;
  overall_score: number | null;
  google_score: number | null;
  social_score: number | null;
  conversion_score: number | null;
  strengths: string[] | null;
  opportunities: string[] | null;
  quick_wins: string[] | null;
  executive_score: number | null;
  executive_preview: string[] | null;
  recommended_services: string[] | null;
  estimated_growth: string | null;
  metadata: string[] | null;  

  // Contact
  fullName: string;
  email: string;
  phone: string;  
  receiveTips: boolean;
}