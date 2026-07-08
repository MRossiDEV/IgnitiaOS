export interface ReportPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export interface Report {
  id?: string;
  report_id?: string;
  slug?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  version?: number;
  accepted?: boolean;
  accepted_at?: string | null;
  viewed_at?: string | null;
  viewed_count?: number;

  company_name?: string;
  business_name?: string;
  business_website?: string;
  website?: string;
  industry?: string;
  city?: string;
  state?: string;
  country?: string;
  report_code?: string;
  pdf_url?: string;
  thumbnail_url?: string;
  screenshots?: string[];
  tags?: string[];
  metadata?: Record<string, any>;

  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;

  executive_summary?: string;
  ai_summary?: string;
  audit_date?: string;
  ai_score?: number;
  branding_score?: number;
  google_score?: number;
  social_score?: number;
  automation_score?: number;
  ads_score?: number;
  crm_score?: number;
  seo_score?: number;
  website_score?: number;
  overall_score?: number;
  proposal_value?: number;
  proposal_sent?: boolean;
  proposal_sent_at?: string;

  estimated_conversion_rate?: number;
  estimated_monthly_leads?: number;
  estimated_monthly_revenue?: number;
  estimated_roi?: number;
  opportunities?: string[];
  quick_wins?: string[];
  recommended_services?: string[];
  strengths?: string[];
  weaknesses?: string[];
  threats?: string[];

  website_analysis?: Record<string, any>;
  conversion_analysis?: Record<string, any>;
  seo_analysis?: Record<string, any>;
  google_business_analysis?: Record<string, any>;
  social_analysis?: Record<string, any>;
  lead_generation_analysis?: Record<string, any>;
  funnel_analysis?: Record<string, any>;
  roadmap?: Record<string, any>;
  [key: string]: any;
}
