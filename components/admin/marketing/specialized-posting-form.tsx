"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, UploadCloud, Video } from "lucide-react";
import type { InstagramConnectionSummary } from "@/lib/marketing/marketing-page-config";

type PublisherActionValue =
  | "publish_now"
  | "create_draft"
  | "list_drafts"
  | "approve_draft"
  | "publish_draft"
  | "run_scheduler"
  | "create_post"
  | "schedule_post";

type MediaType = "image" | "video" | null;

type SpecializedPostingFormProps = {
  headline: string;
  description: string;
  selectedAccountLabel: string;
  selectedAccountConnected: boolean;
  supportsApiPublishing: boolean;
  actionOptions: Array<{ value: PublisherActionValue; label: string }>;
  action: PublisherActionValue;
  onActionChange: (value: PublisherActionValue) => void;
  isInstagramSelected: boolean;
  connectionId: string;
  onConnectionIdChange: (value: string) => void;
  connections: InstagramConnectionSummary[];
  connectionsLoading: boolean;
  draftId: string;
  onDraftIdChange: (value: string) => void;
  limit: string;
  onLimitChange: (value: string) => void;
  title: string;
  onTitleChange: (value: string) => void;
  scheduleTime: string;
  onScheduleTimeChange: (value: string) => void;
  caption: string;
  onCaptionChange: (value: string) => void;
  hashtags: string;
  onHashtagsChange: (value: string) => void;
  contentPlaceholder: string;
  secondaryPlaceholder: string;
  titlePlaceholder: string;
  mediaUrl: string;
  mediaType: MediaType;
  mediaName: string;
  mediaUploadLoading: boolean;
  mediaUploadError: string | null;
  onMediaUrlChange: (value: string) => void;
  onMediaFileUpload: (file: File) => Promise<void>;
  onMediaClear: () => void;
  loading: boolean;
  onRun: () => void;
  result: string | null;
  error: string | null;
};

function formatConnectionLabel(connection: InstagramConnectionSummary): string {
  if (connection.accountName && connection.accountId) {
    return `${connection.accountName} (${connection.accountId})`;
  }
  return connection.accountName || connection.accountId || connection.id;
}

function inferMediaTypeFromUrl(url: string): MediaType {
  const value = url.trim().toLowerCase();
  if (!value) {
    return null;
  }

  if (/\.(mp4|mov|m4v|webm)(\?|$)/.test(value)) {
    return "video";
  }

  if (/\.(png|jpe?g|webp|gif)(\?|$)/.test(value)) {
    return "image";
  }

  return null;
}

export function SpecializedPostingForm(props: SpecializedPostingFormProps) {
  const {
    headline,
    description,
    selectedAccountLabel,
    selectedAccountConnected,
    supportsApiPublishing,
    actionOptions,
    action,
    onActionChange,
    isInstagramSelected,
    connectionId,
    onConnectionIdChange,
    connections,
    connectionsLoading,
    draftId,
    onDraftIdChange,
    limit,
    onLimitChange,
    title,
    onTitleChange,
    scheduleTime,
    onScheduleTimeChange,
    caption,
    onCaptionChange,
    hashtags,
    onHashtagsChange,
    contentPlaceholder,
    secondaryPlaceholder,
    titlePlaceholder,
    mediaUrl,
    mediaType,
    mediaName,
    mediaUploadLoading,
    mediaUploadError,
    onMediaUrlChange,
    onMediaFileUpload,
    onMediaClear,
    loading,
    onRun,
    result,
    error,
  } = props;

  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const previewType = mediaType ?? inferMediaTypeFromUrl(mediaUrl);

  async function handleFile(file: File | null) {
    if (!file) {
      return;
    }

    await onMediaFileUpload(file);
  }

  return (
    <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{headline}</h3>
          <p className="text-xs text-zinc-400">{description}</p>
        </div>
        <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-wide text-zinc-200">
          {selectedAccountLabel} {selectedAccountConnected ? "Connected" : "Not Connected"}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <select
          value={action}
          onChange={(event) => onActionChange(event.target.value as PublisherActionValue)}
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-500"
        >
          {actionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {isInstagramSelected ? (
          connectionsLoading ? (
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Detecting account…
            </div>
          ) : connections.length === 0 ? (
            <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              No Instagram account connected
            </div>
          ) : connections.length === 1 ? (
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm">
              <span className="truncate text-zinc-100">
                {formatConnectionLabel(connections[0])}
              </span>
              <span className="ml-2 shrink-0 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-emerald-300">
                Connected
              </span>
            </div>
          ) : (
            <select
              value={connectionId}
              onChange={(event) => onConnectionIdChange(event.target.value)}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-500"
            >
              {connections.map((connection) => (
                <option key={connection.id} value={connection.id}>
                  {formatConnectionLabel(connection)}
                </option>
              ))}
            </select>
          )
        ) : (
          <input
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder={titlePlaceholder}
            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-500"
          />
        )}

        <input
          value={draftId}
          onChange={(event) => onDraftIdChange(event.target.value)}
          placeholder={isInstagramSelected ? "Draft ID" : secondaryPlaceholder}
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-500"
        />

        <input
          value={limit}
          onChange={(event) => onLimitChange(event.target.value)}
          placeholder={isInstagramSelected ? "Limit" : "Priority (1-100)"}
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-500"
        />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <input
          value={isInstagramSelected ? title : connectionId}
          onChange={(event) =>
            isInstagramSelected
              ? onTitleChange(event.target.value)
              : onConnectionIdChange(event.target.value)
          }
          placeholder={isInstagramSelected ? titlePlaceholder : "Audience / page segment"}
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-500"
        />

        <input
          type="datetime-local"
          value={scheduleTime}
          onChange={(event) => onScheduleTimeChange(event.target.value)}
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-500"
        />
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-100">
            <UploadCloud className="h-4 w-4 text-cyan-300" />
            Media Upload
          </div>
          <div className="text-[11px] text-zinc-500">Image and video support</div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(event) => {
            void handleFile(event.target.files?.[0] ?? null);
          }}
        />

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDraggingFile(true);
          }}
          onDragLeave={() => setIsDraggingFile(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDraggingFile(false);
            void handleFile(event.dataTransfer.files?.[0] ?? null);
          }}
          className={`rounded-2xl border border-dashed px-4 py-6 text-center transition ${
            isDraggingFile
              ? "border-cyan-400 bg-cyan-500/10"
              : "border-white/15 bg-black/30"
          }`}
        >
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <ImagePlus className="h-5 w-5 text-cyan-200" />
          </div>
          <p className="text-sm text-zinc-200">Drop media here or select from device</p>
          <p className="mt-1 text-xs text-zinc-500">Recommended: 1080px minimum width, MP4 for video</p>

          <div className="mt-3 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={mediaUploadLoading}
              className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-black hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {mediaUploadLoading ? "Uploading..." : "Select File"}
            </button>
            <button
              type="button"
              onClick={onMediaClear}
              disabled={mediaUploadLoading || !mediaUrl.trim()}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-zinc-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear
            </button>
          </div>

          {mediaUploadLoading && (
            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-cyan-200">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Upload in progress
            </div>
          )}
        </div>

        <input
          value={mediaUrl}
          onChange={(event) => onMediaUrlChange(event.target.value)}
          placeholder="Media URL (https://...)"
          className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-500"
        />

        {mediaUploadError && (
          <p className="mt-2 text-xs text-amber-300">{mediaUploadError}</p>
        )}

        {mediaUrl.trim() && (
          <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-black/40">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-[11px] text-zinc-400">
              <span className="truncate">{mediaName || mediaUrl}</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-300">
                {previewType === "video" ? (
                  <Video className="h-3 w-3" />
                ) : (
                  <ImagePlus className="h-3 w-3" />
                )}
                {previewType || "media"}
              </span>
            </div>

            {previewType === "video" ? (
              <video src={mediaUrl} controls className="max-h-72 w-full bg-black" />
            ) : (
              <img
                src={mediaUrl}
                alt="Uploaded media preview"
                className="max-h-72 w-full object-contain bg-black"
              />
            )}
          </div>
        )}
      </div>

      <textarea
        value={caption}
        onChange={(event) => onCaptionChange(event.target.value)}
        placeholder={contentPlaceholder}
        rows={4}
        className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-500"
      />

      <input
        value={hashtags}
        onChange={(event) => onHashtagsChange(event.target.value)}
        placeholder={secondaryPlaceholder}
        className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-500"
      />

      {!supportsApiPublishing && (
        <div className="mt-3 rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          API publishing for {selectedAccountLabel} is not wired yet. This panel captures media-enabled briefs and scheduling intents.
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={onRun}
          disabled={loading || mediaUploadLoading}
          className="rounded-xl bg-pink-500 px-4 py-2 text-sm font-semibold text-black hover:bg-pink-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading
            ? "Running..."
            : supportsApiPublishing
              ? "Run Publisher Action"
              : "Save Platform Brief"}
        </button>

        {result && <p className="text-xs text-emerald-300">{result}</p>}
        {error && <p className="text-xs text-amber-300">{error}</p>}
      </div>
    </div>
  );
}
