"use client";

import { create } from "zustand";
import { ReportWizardData } from "./types";

interface WizardStore {
  step: number;
  reportId: string;
  accessCode: string;
  data: ReportWizardData;

  next: () => void;

  previous: () => void;

  update: (values: Partial<ReportWizardData>) => void;

  setReport: (
    reportId: string,
    accessCode: string
  ) => void;

  reset: () => void;
}

const initialData: ReportWizardData = {
  reportCode: "",
  accessCode: "",
  status: "new",
  created_at: "",
  updated_at: "",
  viewed_at: null,
  viewed_count: 0,
  expires_at: "30 days",
  businessType: "",
  website: "",
  businessName: "",
  businessSize: "",
  city: "",
  country: "",
  primary_goal: "",
  industry: "",
  biggest_challenge: [],
  marketing_channels: [],
  competitors: "",
  ai_summary: "",
  overall_score: 0,
  google_score: 0,
  social_score: 0,
  conversion_score: 0,
  strengths: [],
  opportunities: [],
  quick_wins: [],
  executive_score: 0,
  executive_preview: [],
  recommended_services: [],
  estimated_growth: "",
  metadata: [],

  // Contact
  fullName: "",
  email: "",
  phone: "",  
  receiveTips: false,
};

export const useReportWizard = create<WizardStore>((set) => ({
  step: 0,
  reportId: "",
  accessCode: "",
  data: initialData,

  next: () =>
    set((state) => ({
      step: state.step + 1,
    })),

  previous: () =>
    set((state) => ({
      step: Math.max(state.step - 1, 0),
    })),

  update: (values) =>
    set((state) => ({
      data: {
        ...state.data,
        ...values,
      },
    })),

  setReport: (reportId, accessCode) =>
    set({
      reportId,
      accessCode,
    }),

  reset: () =>
    set({
      step: 0,
      reportId: "",
      accessCode: "",
      data: initialData,
    }),
}));