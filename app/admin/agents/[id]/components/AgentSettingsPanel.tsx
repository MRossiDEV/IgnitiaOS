"use client";

import EditAgentPage from "../edit/page";

type AgentSettingsPanelProps = {
  agentName?: string | null;
  category?: string | null;
  status?: string | null;
  personalityPreset?: string | null;
};

export default function AgentSettingsPanel({
  agentName: _agentName,
  category: _category,
  status: _status,
  personalityPreset: _personalityPreset,
}: AgentSettingsPanelProps) {
  return <EditAgentPage mode="embedded" />;
}
