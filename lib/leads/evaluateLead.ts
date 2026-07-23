// ======================================================
// Lead Evaluation
// lib/leads/evaluateLead.ts
// ======================================================
// Shared by app/api/v1/leads/evaluate/route.ts and the
// CRM "Lead Score" workflow node — heuristic (no AI) scoring
// based on value, status, recency, and contact history.

export interface LeadEvaluationMetrics {
  estimatedValue: number;
  seriousnessScore: number; // 0-100
  actionScore: number; // 0-100 (likelihood to take action)
  overallRank: number; // 0-100
  insights: string[];
  recommendation: "high-priority" | "medium-priority" | "low-priority";
}

export function evaluateLead(lead: any): LeadEvaluationMetrics {
  const insights: string[] = [];
  let seriousnessScore = 50; // baseline

  // 1. Value Assessment (0-40 points)
  const estimatedValue = lead.estimated_value || 0;
  let valueScore = 0;
  if (estimatedValue >= 10000) valueScore = 40;
  else if (estimatedValue >= 5000) valueScore = 30;
  else if (estimatedValue >= 2000) valueScore = 20;
  else if (estimatedValue > 0) valueScore = 10;

  // 2. Status Assessment (0-30 points)
  const statusMap: Record<string, number> = {
    qualified: 30,
    contacted: 20,
    new: 10,
    converted: 0, // Already converted, not useful for ranking
    lost: 0,
  };
  const statusScore = statusMap[lead.status] || 10;

  // 3. Recency Assessment (0-20 points)
  let recencyScore = 0;
  const now = new Date().getTime();
  const createdTime = new Date(lead.created_at).getTime();
  const ageInDays = (now - createdTime) / (1000 * 60 * 60 * 24);

  if (ageInDays <= 1) recencyScore = 20;
  else if (ageInDays <= 7) recencyScore = 15;
  else if (ageInDays <= 30) recencyScore = 10;
  else if (ageInDays <= 90) recencyScore = 5;

  // 4. Contact History (0-10 points)
  let contactScore = 0;
  if (lead.last_contacted_at) {
    const lastContactTime = new Date(lead.last_contacted_at).getTime();
    const daysSinceContact = (now - lastContactTime) / (1000 * 60 * 60 * 24);
    if (daysSinceContact <= 1) contactScore = 10;
    else if (daysSinceContact <= 7) contactScore = 8;
    else if (daysSinceContact <= 30) contactScore = 5;
  } else if (lead.status === "new") {
    contactScore = 3; // New leads haven't been contacted yet
  }

  // Calculate seriousness score
  const totalEngagementScore = statusScore + recencyScore + contactScore;
  seriousnessScore = Math.min(100, 40 + totalEngagementScore);

  // Calculate action score (likelihood to take action)
  let actionScore = 50; // baseline
  if (lead.priority === "hot") actionScore = 85;
  else if (lead.priority === "warm") actionScore = 65;
  else if (lead.priority === "cold") actionScore = 40;

  // Adjust action score based on status
  if (lead.status === "qualified") actionScore = Math.min(100, actionScore + 20);
  if (lead.status === "converted") actionScore = 100;
  if (lead.status === "lost") actionScore = Math.max(0, actionScore - 30);

  // Overall rank (weighted average)
  const overallRank = Math.round(valueScore * 0.4 + seriousnessScore * 0.3 + actionScore * 0.3);

  // Generate insights
  if (estimatedValue >= 5000) {
    insights.push(`High-value opportunity ($${estimatedValue.toLocaleString()})`);
  }
  if (lead.priority === "hot") {
    insights.push("Hot lead - high priority");
  }
  if (lead.status === "qualified") {
    insights.push("Qualified and ready to close");
  }
  if (!lead.last_contacted_at && lead.status !== "converted") {
    insights.push("No contact yet - reach out immediately");
  }
  if (lead.last_contacted_at) {
    const lastContactTime = new Date(lead.last_contacted_at).getTime();
    const daysSinceContact = (now - lastContactTime) / (1000 * 60 * 60 * 24);
    if (daysSinceContact > 30) {
      insights.push("Not contacted in 30+ days - follow up needed");
    }
  }
  if (ageInDays <= 1) {
    insights.push("Fresh lead from today");
  }
  if (lead.company) {
    insights.push(`From ${lead.company}`);
  }

  // Determine recommendation
  let recommendation: "high-priority" | "medium-priority" | "low-priority" = "low-priority";
  if (overallRank >= 70) recommendation = "high-priority";
  else if (overallRank >= 40) recommendation = "medium-priority";

  return {
    estimatedValue,
    seriousnessScore: Math.round(seriousnessScore),
    actionScore: Math.round(actionScore),
    overallRank,
    insights,
    recommendation,
  };
}
