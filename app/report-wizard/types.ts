export interface ReportWizardData {
  businessType: string;
  website: string;
  businessName: string;
  category: string;
  city: string;
  country: string;
  goal: string;
  industry: string;
  problems: string[];
  marketing: string[];
  competitor: string;
  revenue: string;
  teamSize: string;

  // Contact
  fullName: string;
  email: string;
  phone: string;
  company: string;
  receiveTips: boolean;
}