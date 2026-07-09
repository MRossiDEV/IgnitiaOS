"use client";

import { useState } from "react";
import { MarketingHeader } from "@/components/admin/marketing/marketing-header";
import { MarketingSidebar } from "@/components/admin/marketing/marketing-sidebar";
import { MarketingDirectorHero } from "@/components/admin/marketing/marketing-director-hero";
import { CalendarSection } from "@/components/admin/marketing/calendar-section";
import { PublisherSection } from "@/components/admin/marketing/publisher-section";

import { useSocialAccounts } from "./hooks/use-social-accounts";
import { usePublisher } from "./hooks/use-publisher";
import { useCalendarBoard } from "./hooks/use-calendar-board";
import { useMarketingAgents } from "./hooks/use-marketing-agents";

export default function MarketingPage() {
  const [prompt, setPrompt] = useState("");

  const accounts = useSocialAccounts();
  const publisher = usePublisher(accounts.selectedAccount);
  const calendar = useCalendarBoard();
  const agents = useMarketingAgents();

  return (
    <div className="min-h-screen bg-[rgb(5,5,5)] text-white">
      <MarketingHeader />

      <div className="grid grid-cols-12 gap-6 p-6">
        <MarketingSidebar
          accounts={accounts}
          activeJobs={agents.activeJobs}
          onReconnect={(platformName) => {
            publisher.setPublisherResult(`${platformName} reconnect flow queued.`);
            publisher.setPublisherError(null);
          }}
        />

        <main className="col-span-9 space-y-6">
          <MarketingDirectorHero prompt={prompt} onPromptChange={setPrompt} />

          <CalendarSection
            calendarBoard={calendar.calendarBoard}
            onDragStart={calendar.handleCalendarDragStart}
            onDrop={calendar.handleCalendarDrop}
          />

          <PublisherSection
            publisher={publisher}
            agents={agents}
            selectedAccount={accounts.selectedAccount}
          />
        </main>
      </div>
    </div>
  );
}
