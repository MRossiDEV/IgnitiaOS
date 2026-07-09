"use client";

import { useEffect, useMemo, useState } from "react";
import {
  defaultSocialAccounts,
  hashtagsToText,
  mergeAccountSettings,
  normalizeAccountSettings,
  parseHashtagsText,
  type EditableAccountDraft,
  type SocialAccount,
  type SocialAccountSettings,
} from "@/lib/marketing/marketing-page-config";

export function useSocialAccounts() {
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>(
    defaultSocialAccounts
  );
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [selectedAccountId, setSelectedAccountId] =
    useState<SocialAccount["id"]>("instagram");
  const [accountSaveError, setAccountSaveError] = useState<string | null>(null);
  const [savingAccountId, setSavingAccountId] = useState<string | null>(null);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [accountDraft, setAccountDraft] = useState<EditableAccountDraft | null>(
    null
  );

  const selectedAccount = useMemo(
    () =>
      socialAccounts.find((item) => item.id === selectedAccountId) ??
      socialAccounts[0],
    [socialAccounts, selectedAccountId]
  );

  useEffect(() => {
    let active = true;

    const fetchAccountSettings = async () => {
      try {
        setLoadingAccounts(true);
        setAccountSaveError(null);

        const response = await fetch("/api/v1/social/accounts", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load social account settings");
        }

        const payload = await response.json();
        const rows = Array.isArray(payload?.accounts) ? payload.accounts : [];

        if (active) {
          setSocialAccounts(mergeAccountSettings(rows));
        }
      } catch (error) {
        if (active) {
          setAccountSaveError(
            error instanceof Error
              ? error.message
              : "Unable to load social account settings"
          );
        }
      } finally {
        if (active) {
          setLoadingAccounts(false);
        }
      }
    };

    fetchAccountSettings();

    return () => {
      active = false;
    };
  }, []);

  function startEditingAccount(account: SocialAccount) {
    const normalized = normalizeAccountSettings(account.settings);

    setEditingAccountId(account.id);
    setAccountDraft({
      account: account.connected ? account.account : "",
      connected: account.connected,
      settings: normalized,
      hashtagsText: hashtagsToText(normalized.defaultHashtags),
      authType: account.auth.type,
      authUsername: account.auth.username,
      authSecret: "",
      hasStoredSecret: account.auth.hasSecret,
      error: null,
    });
  }

  function cancelEditingAccount() {
    setEditingAccountId(null);
    setAccountDraft(null);
  }

  async function saveEditingAccount(accountId: string) {
    if (!accountDraft) {
      return;
    }

    const parsedSettings: SocialAccountSettings = {
      ...accountDraft.settings,
      defaultHashtags: parseHashtagsText(accountDraft.hashtagsText),
    };

    const accountValue = accountDraft.account.trim();

    setSavingAccountId(accountId);
    setAccountSaveError(null);

    try {
      const response = await fetch("/api/v1/social/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform: accountId,
          connected: accountDraft.connected,
          accountLabel: accountDraft.connected
            ? accountValue || "Account Connected"
            : "Not Connected",
          settings: parsedSettings,
          auth: {
            type: accountDraft.authType,
            username: accountDraft.authUsername.trim() || null,
            secret: accountDraft.authSecret.trim() || null,
          },
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to save account settings");
      }

      const nextConnected = accountDraft.connected;

      setSocialAccounts((prev) =>
        prev.map((item) => {
          if (item.id !== accountId) {
            return item;
          }

          return {
            ...item,
            connected: nextConnected,
            account: nextConnected
              ? accountValue || item.account || "Account Connected"
              : "Not Connected",
            settings: parsedSettings,
            auth: {
              type: accountDraft.authType,
              username: accountDraft.authUsername.trim(),
              hasSecret:
                accountDraft.authSecret.trim().length > 0 ||
                accountDraft.hasStoredSecret,
              updatedAt: new Date().toISOString(),
            },
          };
        })
      );

      cancelEditingAccount();
    } catch (error) {
      setAccountSaveError(
        error instanceof Error ? error.message : "Failed to save account settings"
      );
    } finally {
      setSavingAccountId(null);
    }
  }

  return {
    socialAccounts,
    loadingAccounts,
    accountSaveError,
    selectedAccountId,
    setSelectedAccountId,
    selectedAccount,
    savingAccountId,
    editingAccountId,
    accountDraft,
    setAccountDraft,
    startEditingAccount,
    cancelEditingAccount,
    saveEditingAccount,
  };
}
