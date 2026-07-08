// app/admin/campaigns/new/layout.tsx

import { ReactNode } from "react";

export const metadata = {
  title: "New Campaign | IgnitiaOS",
  description: "Create a new AI-powered marketing campaign.",
};

export default function NewCampaignLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-[1800px]">
        {children}
      </div>
    </div>
  );
}