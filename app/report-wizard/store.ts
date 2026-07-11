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
  businessType: "",
  website: "",
  businessName: "",
  category: "",
  city: "",
  country: "",
  goal: "",
  industry: "",
  problems: [],
  revenue: "",
  teamSize: "",

  fullName: "",
  email: "",
  phone: "",
  company: "",
  receiveTips: false,

  marketing: [],
  competitor: "",
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