"use client";

import { useEffect, useMemo, useState } from "react";
import {
  parseHashtagsText,
  publisherProfileByPlatform,
  type InstagramConnectionSummary,
  type InstagramDraftSummary,
  type PublisherAction,
  type PublisherMediaType,
  type SocialAccount,
} from "@/lib/marketing/marketing-page-config";

export function usePublisher(selectedAccount: SocialAccount | undefined) {
  const [publisherAction, setPublisherAction] =
    useState<PublisherAction>("publish_now");
  const [publisherConnectionId, setPublisherConnectionId] = useState("");
  const [publisherDraftId, setPublisherDraftId] = useState("");
  const [publisherCaption, setPublisherCaption] = useState("");
  const [publisherHashtags, setPublisherHashtags] = useState("");
  const [publisherTitle, setPublisherTitle] = useState("");
  const [publisherScheduleTime, setPublisherScheduleTime] = useState("");
  const [publisherLimit, setPublisherLimit] = useState("20");
  const [publisherMediaUrl, setPublisherMediaUrl] = useState("");
  const [publisherMediaType, setPublisherMediaType] =
    useState<PublisherMediaType>(null);
  const [publisherMediaName, setPublisherMediaName] = useState("");
  const [publisherMediaUploading, setPublisherMediaUploading] = useState(false);
  const [publisherMediaUploadError, setPublisherMediaUploadError] = useState<
    string | null
  >(null);
  const [publisherLoading, setPublisherLoading] = useState(false);
  const [publisherError, setPublisherError] = useState<string | null>(null);
  const [publisherResult, setPublisherResult] = useState<string | null>(null);
  const [publisherDrafts, setPublisherDrafts] = useState<
    InstagramDraftSummary[]
  >([]);
  const [instagramConnections, setInstagramConnections] = useState<
    InstagramConnectionSummary[]
  >([]);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [connectionsError, setConnectionsError] = useState<string | null>(null);

  const publisherProfile = selectedAccount
    ? publisherProfileByPlatform[selectedAccount.id]
    : publisherProfileByPlatform.instagram;

  const isInstagramSelected = selectedAccount?.id === "instagram";

  const selectedConnection = useMemo(
    () =>
      instagramConnections.find((item) => item.id === publisherConnectionId) ??
      null,
    [instagramConnections, publisherConnectionId]
  );

  useEffect(() => {
    if (!selectedAccount) {
      return;
    }

    if (
      !publisherProfile.actionOptions.some(
        (option) => option.value === publisherAction
      )
    ) {
      setPublisherAction(publisherProfile.actionOptions[0]?.value ?? "create_post");
      setPublisherError(null);
      setPublisherResult(null);
      setPublisherDrafts([]);
    }
  }, [selectedAccount, publisherAction, publisherProfile.actionOptions]);

  // Auto-discover the active Instagram connection so the user never has to
  // paste a connection UUID. The most recently validated account is selected.
  useEffect(() => {
    let active = true;

    const fetchConnections = async () => {
      try {
        setConnectionsLoading(true);
        setConnectionsError(null);

        const response = await fetch("/api/v1/social/instagram/connections", {
          cache: "no-store",
        });

        const payload = await response.json();
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.message || "Failed to load connections");
        }

        const connections: InstagramConnectionSummary[] = Array.isArray(
          payload.connections
        )
          ? payload.connections
          : [];

        if (!active) {
          return;
        }

        setInstagramConnections(connections);
        setPublisherConnectionId((current) => {
          const stillValid = connections.some((item) => item.id === current);
          if (current && stillValid) {
            return current;
          }
          return connections[0]?.id ?? "";
        });
      } catch (error) {
        if (active) {
          setConnectionsError(
            error instanceof Error
              ? error.message
              : "Failed to load Instagram connections"
          );
        }
      } finally {
        if (active) {
          setConnectionsLoading(false);
        }
      }
    };

    fetchConnections();

    return () => {
      active = false;
    };
  }, []);

  async function runPublisherAction() {
    setPublisherLoading(true);
    setPublisherError(null);
    setPublisherResult(null);

    try {
      if (!selectedAccount) {
        throw new Error("Select an account to run publisher actions");
      }

      if (!isInstagramSelected) {
        if (publisherAction === "create_post") {
          setPublisherResult(
            `${selectedAccount.name} brief captured with ${publisherMediaUrl.trim() ? "media attached" : "no media attached"}. API publishing endpoint for this platform is not enabled yet.`
          );
          return;
        }

        if (publisherAction === "schedule_post") {
          setPublisherResult(
            `${selectedAccount.name} scheduled brief captured for ${publisherScheduleTime || "next available window"} with ${publisherMediaUrl.trim() ? "media attached" : "no media attached"}.`
          );
          return;
        }

        throw new Error(
          `${selectedAccount.name} does not support this action in the current API layer`
        );
      }

      if (publisherAction === "publish_now") {
        if (!publisherConnectionId.trim()) {
          throw new Error(
            "No active Instagram account is connected. Connect an account before publishing"
          );
        }

        if (!publisherCaption.trim()) {
          throw new Error("Caption is required to publish");
        }

        if (!publisherMediaUrl.trim()) {
          throw new Error(
            "Upload an image or provide a public media URL before publishing"
          );
        }

        if (publisherMediaUrl.startsWith("blob:")) {
          throw new Error(
            "Media is still a local preview. Wait for the upload to finish before publishing"
          );
        }

        if (publisherMediaType === "video") {
          throw new Error(
            "Instagram API publishing in this flow currently supports image posts only"
          );
        }

        const response = await fetch("/api/v1/social/instagram/publish", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            connectionId: publisherConnectionId.trim(),
            title: publisherTitle.trim() || null,
            caption: publisherCaption.trim(),
            hashtags: parseHashtagsText(publisherHashtags),
            imageUrl: publisherMediaUrl.trim(),
            scheduleTime: publisherScheduleTime
              ? new Date(publisherScheduleTime).toISOString()
              : null,
          }),
        });

        const payload = await response.json();
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.message || "Failed to publish post");
        }

        if (payload.status === "scheduled") {
          setPublisherResult(
            `Post scheduled for ${payload.scheduledFor || publisherScheduleTime}`
          );
        } else {
          const permalink = payload.draft?.external_post_url;
          setPublisherResult(
            permalink
              ? `Published to Instagram: ${permalink}`
              : "Published to Instagram"
          );
        }
      }

      if (publisherAction === "create_draft") {
        if (!publisherConnectionId.trim()) {
          throw new Error(
            "No active Instagram account is connected. Connect an account before creating a draft"
          );
        }

        if (!publisherCaption.trim()) {
          throw new Error("Caption is required to create a draft");
        }

        if (!publisherMediaUrl.trim()) {
          throw new Error(
            "Upload an image/video or provide a media URL before creating a draft"
          );
        }

        if (publisherMediaUrl.startsWith("blob:")) {
          throw new Error(
            "Media is still a local preview. Wait for the upload to finish before creating a draft"
          );
        }

        if (publisherMediaType === "video") {
          throw new Error(
            "Instagram API publishing in this flow currently supports image posts only"
          );
        }

        const response = await fetch("/api/v1/social/instagram/drafts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            connectionId: publisherConnectionId.trim(),
            title: publisherTitle.trim() || null,
            caption: publisherCaption.trim(),
            hashtags: parseHashtagsText(publisherHashtags),
            imageUrl: publisherMediaUrl.trim(),
            scheduleTime: publisherScheduleTime
              ? new Date(publisherScheduleTime).toISOString()
              : null,
            mode: "manual_approval",
          }),
        });

        const payload = await response.json();
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.message || "Failed to create draft");
        }

        setPublisherResult(`Draft created: ${payload.draft?.id || "unknown"}`);
      }

      if (publisherAction === "list_drafts") {
        const params = new URLSearchParams();
        if (publisherConnectionId.trim()) {
          params.set("connectionId", publisherConnectionId.trim());
        }
        params.set("limit", publisherLimit || "20");

        const response = await fetch(
          `/api/v1/social/instagram/drafts?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const payload = await response.json();
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.message || "Failed to load drafts");
        }

        const drafts = Array.isArray(payload?.drafts)
          ? payload.drafts.map((item: any) => ({
              id: String(item.id || ""),
              status: String(item.status || "unknown"),
              caption: typeof item.caption === "string" ? item.caption : null,
              scheduled_for:
                typeof item.scheduled_for === "string"
                  ? item.scheduled_for
                  : typeof item.schedule_time === "string"
                    ? item.schedule_time
                    : null,
            }))
          : [];

        setPublisherDrafts(drafts);
        setPublisherResult(`Loaded ${drafts.length} draft(s)`);
      }

      if (publisherAction === "approve_draft") {
        if (!publisherDraftId.trim()) {
          throw new Error("Draft ID is required to approve a draft");
        }

        const response = await fetch(
          `/api/v1/social/instagram/drafts/${publisherDraftId.trim()}/approve`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              publishNow: false,
            }),
          }
        );

        const payload = await response.json();
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.message || "Failed to approve draft");
        }

        setPublisherResult(`Draft approved: ${publisherDraftId.trim()}`);
      }

      if (publisherAction === "publish_draft") {
        if (!publisherDraftId.trim()) {
          throw new Error("Draft ID is required to publish a draft");
        }

        const response = await fetch(
          `/api/v1/social/instagram/drafts/${publisherDraftId.trim()}/publish`,
          {
            method: "POST",
          }
        );

        const payload = await response.json();
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.message || "Failed to publish draft");
        }

        setPublisherResult(`Draft published: ${publisherDraftId.trim()}`);
      }

      if (publisherAction === "run_scheduler") {
        const response = await fetch("/api/v1/social/instagram/scheduler", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            limit: Number(publisherLimit || "20"),
          }),
        });

        const payload = await response.json();
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.message || "Failed to run scheduler");
        }

        const published = Number(payload?.publishedCount ?? 0);
        const failed = Number(payload?.failedCount ?? 0);
        setPublisherResult(
          `Scheduler completed. Published: ${published}, Failed: ${failed}`
        );
      }
    } catch (error) {
      setPublisherError(
        error instanceof Error ? error.message : "Failed to execute publishing action"
      );
    } finally {
      setPublisherLoading(false);
    }
  }

  // Show an instant local preview, then upload the file to the public storage
  // bucket so publishing has a real HTTPS URL (Instagram fetches the image from
  // that URL — a local blob URL cannot be published). Once the upload
  // succeeds, the blob preview is swapped for the public URL.
  async function handlePublisherMediaUpload(file: File) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setPublisherMediaUploadError("Only image and video files are supported");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPublisherMediaUrl((prev) => {
      if (prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }
      return previewUrl;
    });
    setPublisherMediaType(file.type.startsWith("video/") ? "video" : "image");
    setPublisherMediaName(file.name || "Selected media");
    setPublisherMediaUploadError(null);
    setPublisherMediaUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/v1/social/media/upload", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to upload media");
      }

      const publicUrl = String(payload.url || "");
      if (!publicUrl) {
        throw new Error("Upload succeeded but no public URL was returned");
      }

      // Swap the temporary blob preview for the publishable public URL.
      URL.revokeObjectURL(previewUrl);
      setPublisherMediaUrl(publicUrl);
      setPublisherMediaType(
        payload.mediaType === "image" || payload.mediaType === "video"
          ? payload.mediaType
          : null
      );
      setPublisherMediaName(
        String(payload.fileName || file.name || "Uploaded media")
      );
      setPublisherResult("Media uploaded and ready to publish");
      setPublisherError(null);
    } catch (error) {
      // Drop the unpublishable local preview so the user can't try to publish
      // a blob URL that Instagram cannot fetch.
      URL.revokeObjectURL(previewUrl);
      setPublisherMediaUrl((prev) => (prev === previewUrl ? "" : prev));
      setPublisherMediaType(null);
      setPublisherMediaUploadError(
        error instanceof Error ? error.message : "Failed to upload media"
      );
    } finally {
      setPublisherMediaUploading(false);
    }
  }

  function clearPublisherMedia() {
    setPublisherMediaUrl((prev) => {
      if (prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }
      return "";
    });
    setPublisherMediaType(null);
    setPublisherMediaName("");
    setPublisherMediaUploadError(null);
  }

  return {
    publisherProfile,
    isInstagramSelected,
    publisherAction,
    setPublisherAction,
    publisherConnectionId,
    setPublisherConnectionId,
    instagramConnections,
    selectedConnection,
    connectionsLoading,
    connectionsError,
    publisherDraftId,
    setPublisherDraftId,
    publisherCaption,
    setPublisherCaption,
    publisherHashtags,
    setPublisherHashtags,
    publisherTitle,
    setPublisherTitle,
    publisherScheduleTime,
    setPublisherScheduleTime,
    publisherLimit,
    setPublisherLimit,
    publisherMediaUrl,
    setPublisherMediaUrl,
    publisherMediaType,
    publisherMediaName,
    publisherMediaUploading,
    publisherMediaUploadError,
    publisherLoading,
    publisherError,
    setPublisherError,
    publisherResult,
    setPublisherResult,
    publisherDrafts,
    runPublisherAction,
    handlePublisherMediaUpload,
    clearPublisherMedia,
  };
}
