"use client";

import { ConnectedAccountsPanel } from "@/components/admin/marketing/connected-accounts-panel";
import { MarketingAiStatusCard } from "@/components/admin/marketing/marketing-ai-status-card";
import type { useSocialAccounts } from "@/app/admin/marketing/hooks/use-social-accounts";

type SidebarProps = {
  accounts: ReturnType<typeof useSocialAccounts>;
  activeJobs: number;
  onReconnect: (platformName: string) => void;
};

export function MarketingSidebar({
  accounts,
  activeJobs,
  onReconnect,
}: SidebarProps) {
  return (
    <aside className="col-span-3 space-y-6">
      <ConnectedAccountsPanel
        socialAccounts={accounts.socialAccounts}
        loadingAccounts={accounts.loadingAccounts}
        accountSaveError={accounts.accountSaveError}
        selectedAccountId={accounts.selectedAccountId}
        setSelectedAccountId={accounts.setSelectedAccountId}
        editingAccountId={accounts.editingAccountId}
        accountDraft={accounts.accountDraft}
        setAccountDraft={accounts.setAccountDraft}
        savingAccountId={accounts.savingAccountId}
        onSaveAccount={accounts.saveEditingAccount}
        onCancelEdit={accounts.cancelEditingAccount}
        onStartEdit={accounts.startEditingAccount}
        onReconnect={onReconnect}
      />

      <MarketingAiStatusCard activeJobs={activeJobs} />
    </aside>
  );
}
