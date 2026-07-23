"use client";

import { SpecializedPostingForm } from "@/components/admin/marketing/specialized-posting-form";
import { PublisherDraftsTable } from "@/components/admin/marketing/publisher-drafts-table";
import { MarketingAgentsSection } from "@/components/admin/marketing/marketing-agents-section";
import type { usePublisher } from "@/app/admin/marketing/hooks/use-publisher";
import type { useMarketingAgents } from "@/app/admin/marketing/hooks/use-marketing-agents";
import type { SocialAccount } from "@/lib/ai/tools/marketing/marketing-page-config";

type PublisherSectionProps = {
  publisher: ReturnType<typeof usePublisher>;
  agents: ReturnType<typeof useMarketingAgents>;
  selectedAccount: SocialAccount | undefined;
};

export function PublisherSection({
  publisher,
  agents,
  selectedAccount,
}: PublisherSectionProps) {
  const { publisherProfile } = publisher;

  return (
    <section>
      <SpecializedPostingForm
        headline={publisherProfile.headline}
        description={publisherProfile.description}
        selectedAccountLabel={selectedAccount?.name || "Account"}
        selectedAccountConnected={Boolean(selectedAccount?.connected)}
        supportsApiPublishing={publisherProfile.supportsApiPublishing}
        actionOptions={publisherProfile.actionOptions}
        action={publisher.publisherAction}
        onActionChange={publisher.setPublisherAction}
        isInstagramSelected={publisher.isInstagramSelected}
        connectionId={publisher.publisherConnectionId}
        onConnectionIdChange={publisher.setPublisherConnectionId}
        connections={publisher.instagramConnections}
        connectionsLoading={publisher.connectionsLoading}
        draftId={publisher.publisherDraftId}
        onDraftIdChange={publisher.setPublisherDraftId}
        limit={publisher.publisherLimit}
        onLimitChange={publisher.setPublisherLimit}
        title={publisher.publisherTitle}
        onTitleChange={publisher.setPublisherTitle}
        scheduleTime={publisher.publisherScheduleTime}
        onScheduleTimeChange={publisher.setPublisherScheduleTime}
        caption={publisher.publisherCaption}
        onCaptionChange={publisher.setPublisherCaption}
        hashtags={publisher.publisherHashtags}
        onHashtagsChange={publisher.setPublisherHashtags}
        contentPlaceholder={publisherProfile.contentPlaceholder}
        secondaryPlaceholder={publisherProfile.secondaryPlaceholder}
        titlePlaceholder={publisherProfile.titlePlaceholder}
        mediaUrl={publisher.publisherMediaUrl}
        mediaType={publisher.publisherMediaType}
        mediaName={publisher.publisherMediaName}
        mediaUploadLoading={publisher.publisherMediaUploading}
        mediaUploadError={publisher.publisherMediaUploadError}
        onMediaUrlChange={publisher.setPublisherMediaUrl}
        onMediaFileUpload={publisher.handlePublisherMediaUpload}
        onMediaClear={publisher.clearPublisherMedia}
        loading={publisher.publisherLoading}
        onRun={publisher.runPublisherAction}
        result={publisher.publisherResult}
        error={publisher.publisherError}
      />

      <PublisherDraftsTable drafts={publisher.publisherDrafts} />

      <MarketingAgentsSection
        loadingAgents={agents.loadingAgents}
        agentError={agents.agentError}
        marketingAgents={agents.marketingAgents}
      />
    </section>
  );
}
