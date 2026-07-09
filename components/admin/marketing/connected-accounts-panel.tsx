import { CheckCircle2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import {
  DEFAULT_ACCOUNT_SETTINGS,
  formatLastSync,
  hashtagsToText,
  platformCardMeta,
  type EditableAccountDraft,
  type SocialAccount,
} from "@/lib/marketing/marketing-page-config";

type ConnectedAccountsPanelProps = {
  socialAccounts: SocialAccount[];
  loadingAccounts: boolean;
  accountSaveError: string | null;
  selectedAccountId: SocialAccount["id"];
  setSelectedAccountId: (id: SocialAccount["id"]) => void;
  editingAccountId: string | null;
  accountDraft: EditableAccountDraft | null;
  setAccountDraft: React.Dispatch<React.SetStateAction<EditableAccountDraft | null>>;
  savingAccountId: string | null;
  onSaveAccount: (accountId: string) => void;
  onCancelEdit: () => void;
  onStartEdit: (account: SocialAccount) => void;
  onReconnect: (platformName: string) => void;
};

export function ConnectedAccountsPanel(props: ConnectedAccountsPanelProps) {
  const {
    socialAccounts,
    loadingAccounts,
    accountSaveError,
    selectedAccountId,
    setSelectedAccountId,
    editingAccountId,
    accountDraft,
    setAccountDraft,
    savingAccountId,
    onSaveAccount,
    onCancelEdit,
    onStartEdit,
    onReconnect,
  } = props;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-semibold">Connected Accounts</h2>

        <button className="rounded-lg bg-cyan-500 p-2 hover:bg-cyan-400">
          <Plus size={16} />
        </button>
      </div>

      {loadingAccounts && (
        <div className="mb-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-400">
          Loading account settings...
        </div>
      )}

      {accountSaveError && (
        <div className="mb-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          {accountSaveError}
        </div>
      )}

      <div className="space-y-4">
        {socialAccounts.map((item) => {
          const Icon = item.icon;
          const isEditing = editingAccountId === item.id;
          const isSelected = selectedAccountId === item.id;
          const meta = platformCardMeta[item.id];
          const tokenValid = item.auth.hasSecret ? "Valid" : "Missing";
          const syncLabel = formatLastSync(item.auth.updatedAt);

          return (
            <motion.div
              whileHover={{ scale: 1.02 }}
              key={item.id}
              onClick={() => setSelectedAccountId(item.id)}
              className={`cursor-pointer rounded-2xl border bg-black/20 p-4 transition ${
                isSelected
                  ? "border-cyan-400/60 shadow-[0_0_0_1px_rgba(34,211,238,0.25)]"
                  : "border-white/10"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-xl bg-gradient-to-br ${item.color} p-3`}>
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>

                  {isEditing && accountDraft ? (
                    <div className="mt-2 space-y-2">
                      <input
                        value={accountDraft.account}
                        onChange={(event) =>
                          setAccountDraft((prev) => ({
                            account: event.target.value,
                            connected: prev?.connected ?? false,
                            settings: prev?.settings ?? DEFAULT_ACCOUNT_SETTINGS,
                            hashtagsText: prev?.hashtagsText ?? "",
                            authType: prev?.authType ?? "token",
                            authUsername: prev?.authUsername ?? "",
                            authSecret: prev?.authSecret ?? "",
                            hasStoredSecret: prev?.hasStoredSecret ?? false,
                            error: null,
                          }))
                        }
                        placeholder={`${item.name} handle or page name`}
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-cyan-500"
                      />

                      <button
                        onClick={() =>
                          setAccountDraft((prev) => ({
                            account: prev?.account ?? "",
                            connected: !(prev?.connected ?? false),
                            settings: prev?.settings ?? DEFAULT_ACCOUNT_SETTINGS,
                            hashtagsText:
                              prev?.hashtagsText ??
                              hashtagsToText(DEFAULT_ACCOUNT_SETTINGS.defaultHashtags),
                            authType: prev?.authType ?? "token",
                            authUsername: prev?.authUsername ?? "",
                            authSecret: prev?.authSecret ?? "",
                            hasStoredSecret: prev?.hasStoredSecret ?? false,
                            error: null,
                          }))
                        }
                        className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-wide text-zinc-300 hover:bg-white/10"
                      >
                        {accountDraft.connected ? "Connected" : "Disconnected"}
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={accountDraft.settings.timezone}
                          onChange={(event) =>
                            setAccountDraft((prev) => ({
                              account: prev?.account ?? "",
                              connected: prev?.connected ?? false,
                              settings: {
                                ...(prev?.settings ?? DEFAULT_ACCOUNT_SETTINGS),
                                timezone: event.target.value,
                              },
                              hashtagsText: prev?.hashtagsText ?? "",
                              authType: prev?.authType ?? "token",
                              authUsername: prev?.authUsername ?? "",
                              authSecret: prev?.authSecret ?? "",
                              hasStoredSecret: prev?.hasStoredSecret ?? false,
                              error: null,
                            }))
                          }
                          placeholder="Timezone"
                          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-cyan-500"
                        />

                        <input
                          value={accountDraft.settings.postingWindow}
                          onChange={(event) =>
                            setAccountDraft((prev) => ({
                              account: prev?.account ?? "",
                              connected: prev?.connected ?? false,
                              settings: {
                                ...(prev?.settings ?? DEFAULT_ACCOUNT_SETTINGS),
                                postingWindow: event.target.value,
                              },
                              hashtagsText: prev?.hashtagsText ?? "",
                              authType: prev?.authType ?? "token",
                              authUsername: prev?.authUsername ?? "",
                              authSecret: prev?.authSecret ?? "",
                              hasStoredSecret: prev?.hasStoredSecret ?? false,
                              error: null,
                            }))
                          }
                          placeholder="Posting window"
                          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-cyan-500"
                        />
                      </div>

                      <input
                        value={accountDraft.settings.brandVoice}
                        onChange={(event) =>
                          setAccountDraft((prev) => ({
                            account: prev?.account ?? "",
                            connected: prev?.connected ?? false,
                            settings: {
                              ...(prev?.settings ?? DEFAULT_ACCOUNT_SETTINGS),
                              brandVoice: event.target.value,
                            },
                            hashtagsText: prev?.hashtagsText ?? "",
                            authType: prev?.authType ?? "token",
                            authUsername: prev?.authUsername ?? "",
                            authSecret: prev?.authSecret ?? "",
                            hasStoredSecret: prev?.hasStoredSecret ?? false,
                            error: null,
                          }))
                        }
                        placeholder="Brand voice"
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-cyan-500"
                      />

                      <input
                        value={accountDraft.hashtagsText}
                        onChange={(event) =>
                          setAccountDraft((prev) => ({
                            account: prev?.account ?? "",
                            connected: prev?.connected ?? false,
                            settings: prev?.settings ?? DEFAULT_ACCOUNT_SETTINGS,
                            hashtagsText: event.target.value,
                            authType: prev?.authType ?? "token",
                            authUsername: prev?.authUsername ?? "",
                            authSecret: prev?.authSecret ?? "",
                            hasStoredSecret: prev?.hasStoredSecret ?? false,
                            error: null,
                          }))
                        }
                        placeholder="Hashtags (comma-separated)"
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-cyan-500"
                      />

                      <button
                        onClick={() =>
                          setAccountDraft((prev) => ({
                            account: prev?.account ?? "",
                            connected: prev?.connected ?? false,
                            settings: {
                              ...(prev?.settings ?? DEFAULT_ACCOUNT_SETTINGS),
                              autoPublish: !(prev?.settings?.autoPublish ?? false),
                            },
                            hashtagsText: prev?.hashtagsText ?? "",
                            authType: prev?.authType ?? "token",
                            authUsername: prev?.authUsername ?? "",
                            authSecret: prev?.authSecret ?? "",
                            hasStoredSecret: prev?.hasStoredSecret ?? false,
                            error: null,
                          }))
                        }
                        className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-wide text-zinc-300 hover:bg-white/10"
                      >
                        Auto Publish: {accountDraft.settings.autoPublish ? "On" : "Off"}
                      </button>

                      <div className="space-y-2 rounded-lg border border-white/10 bg-black/25 p-2">
                        <p className="text-[10px] uppercase tracking-wide text-zinc-400">Posting Credentials</p>

                        <select
                          value={accountDraft.authType}
                          onChange={(event) =>
                            setAccountDraft((prev) => ({
                              account: prev?.account ?? "",
                              connected: prev?.connected ?? false,
                              settings: prev?.settings ?? DEFAULT_ACCOUNT_SETTINGS,
                              hashtagsText: prev?.hashtagsText ?? "",
                              authType: event.target.value as "oauth" | "token" | "password",
                              authUsername: prev?.authUsername ?? "",
                              authSecret: prev?.authSecret ?? "",
                              hasStoredSecret: prev?.hasStoredSecret ?? false,
                              error: null,
                            }))
                          }
                          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-cyan-500"
                        >
                          <option value="token">API Token</option>
                          <option value="oauth">OAuth</option>
                          <option value="password">User + Password</option>
                        </select>

                        <input
                          value={accountDraft.authUsername}
                          onChange={(event) =>
                            setAccountDraft((prev) => ({
                              account: prev?.account ?? "",
                              connected: prev?.connected ?? false,
                              settings: prev?.settings ?? DEFAULT_ACCOUNT_SETTINGS,
                              hashtagsText: prev?.hashtagsText ?? "",
                              authType: prev?.authType ?? "token",
                              authUsername: event.target.value,
                              authSecret: prev?.authSecret ?? "",
                              hasStoredSecret: prev?.hasStoredSecret ?? false,
                              error: null,
                            }))
                          }
                          placeholder="Username / account ID"
                          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-cyan-500"
                        />

                        <input
                          type="password"
                          value={accountDraft.authSecret}
                          onChange={(event) =>
                            setAccountDraft((prev) => ({
                              account: prev?.account ?? "",
                              connected: prev?.connected ?? false,
                              settings: prev?.settings ?? DEFAULT_ACCOUNT_SETTINGS,
                              hashtagsText: prev?.hashtagsText ?? "",
                              authType: prev?.authType ?? "token",
                              authUsername: prev?.authUsername ?? "",
                              authSecret: event.target.value,
                              hasStoredSecret: prev?.hasStoredSecret ?? false,
                              error: null,
                            }))
                          }
                          placeholder={
                            accountDraft.hasStoredSecret
                              ? "Leave blank to keep saved secret"
                              : "Token / password"
                          }
                          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-cyan-500"
                        />

                        {accountDraft.hasStoredSecret && accountDraft.authSecret.trim().length === 0 && (
                          <p className="text-[10px] text-zinc-400">Stored secret available. Saving will keep it unchanged.</p>
                        )}
                      </div>

                      {accountDraft.error && (
                        <p className="text-[10px] text-amber-300">{accountDraft.error}</p>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => onSaveAccount(item.id)}
                          disabled={savingAccountId === item.id}
                          className="rounded-md bg-cyan-500 px-2 py-1 text-[10px] font-medium text-black hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingAccountId === item.id ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={onCancelEdit}
                          className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[10px] text-zinc-300 hover:bg-white/10"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-2 text-[11px] text-zinc-300">
                      <p className="text-xs text-zinc-400">{item.account}</p>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <span className="text-zinc-500">Type</span>
                        <span>{meta.accountType}</span>

                        <span className="text-zinc-500">Status</span>
                        <span className={item.connected ? "text-emerald-300" : "text-zinc-300"}>
                          {item.connected ? "Connected" : "Disconnected"}
                        </span>

                        <span className="text-zinc-500">Token</span>
                        <span className={item.auth.hasSecret ? "text-emerald-300" : "text-amber-300"}>
                          {tokenValid}
                        </span>

                        <span className="text-zinc-500">Followers</span>
                        <span>{meta.followers}</span>

                        <span className="text-zinc-500">Last Sync</span>
                        <span className="truncate" title={syncLabel}>
                          {syncLabel}
                        </span>

                        <span className="text-zinc-500">Permissions</span>
                        <span className="truncate" title={meta.permissions}>
                          {meta.permissions}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {item.connected && !isEditing ? (
                  <div className="flex flex-col items-end gap-2">
                    <CheckCircle2 className="text-green-400" size={20} />
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onReconnect(item.name);
                      }}
                      className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[10px] text-cyan-200 hover:bg-cyan-500/20"
                    >
                      Reconnect
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onStartEdit(item);
                      }}
                      className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-[10px] text-zinc-300 hover:bg-white/10"
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  !isEditing && (
                    <div className="flex flex-col gap-1">
                      <button className="rounded-lg bg-cyan-500 px-3 py-1 text-xs text-black">
                        Connect
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onReconnect(item.name);
                        }}
                        className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-[10px] text-cyan-200 hover:bg-cyan-500/20"
                      >
                        Reconnect
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onStartEdit(item);
                        }}
                        className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-[10px] text-zinc-300 hover:bg-white/10"
                      >
                        Edit
                      </button>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
