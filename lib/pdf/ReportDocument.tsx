// ======================================================
// Report Document
// lib/pdf/ReportDocument.tsx
// ======================================================
// Pure presentation layer — takes ReportPdfData (already
// shaped by prepareReportPdfData.ts) and renders it with
// @react-pdf/renderer. No business logic here.

import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import {
  ReportPdfData,
  SummaryPdfData,
  InsightPdfItem,
  RoadmapPdfItem,
} from "./prepareReportPdfData";

// ------------------------------------------------------
// Palette — same as the reportlab prototype
// ------------------------------------------------------
const NAVY = "#10151F";
const TEAL = "#17B897";
const TEAL_DARK = "#0D7A63";
const CORAL = "#E2574C";
const AMBER = "#C98A1F";
const INK = "#1A1A1A";
const GRAY = "#6B7280";
const LIGHT_GRAY = "#E3E5E8";
const MUTED_ON_DARK = "#9CA3AF";
const WHITE = "#FFFFFF";

function scoreColor(score: number): string {
  if (score >= 70) return TEAL;
  if (score >= 40) return AMBER;
  return CORAL;
}

const styles = StyleSheet.create({
  page: {
    padding: 54,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: INK,
  },
  darkPage: {
    padding: 54,
    fontFamily: "Helvetica",
    backgroundColor: NAVY,
    color: WHITE,
    height: "100%",
  },
  footerRow: {
    position: "absolute",
    bottom: 36,
    left: 54,
    right: 54,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerLabel: { fontSize: 8, fontFamily: "Helvetica-Bold" },
  footerRight: { fontSize: 8, color: GRAY },
  divider: { borderBottomWidth: 1, borderBottomColor: LIGHT_GRAY, marginVertical: 16 },
  badge: {
    borderRadius: 3,
    paddingVertical: 3,
    paddingHorizontal: 6,
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
  },
});

function Footer({ businessName, rightLabel, dark = false }: { businessName: string; rightLabel: string; dark?: boolean }) {
  return (
    <View style={styles.footerRow}>
      <Text style={[styles.footerLabel, { color: dark ? WHITE : NAVY }]}>IGNITIA</Text>
      <Text style={[styles.footerRight, { color: dark ? MUTED_ON_DARK : GRAY }]}>{rightLabel}</Text>
    </View>
  );
}

function NumberedCircle({ number, size = 22 }: { number: number; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: NAVY,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: WHITE, fontSize: size > 22 ? 11 : 9, fontFamily: "Helvetica-Bold" }}>
        {number}
      </Text>
    </View>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
        <Text style={{ fontSize: 9 }}>{label}</Text>
        <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}>{score}</Text>
      </View>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: LIGHT_GRAY }}>
        <View
          style={{
            height: 6,
            borderRadius: 3,
            width: `${Math.max(score, 6)}%`,
            backgroundColor: scoreColor(score),
          }}
        />
      </View>
    </View>
  );
}

// ------------------------------------------------------
// Pages
// ------------------------------------------------------

function CoverPage({ data }: { data: ReportPdfData["cover"] }) {
  return (
    <Page size="LETTER" style={styles.darkPage}>
      <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", letterSpacing: 2 }}>I G N I T I A</Text>
      <Text style={{ fontSize: 9, color: TEAL, marginTop: 4, marginBottom: 60 }}>DIGITAL GROWTH AUDIT</Text>

      <Text style={{ fontSize: 28, fontFamily: "Helvetica-Bold", lineHeight: 1.3, marginBottom: 16 }}>
        {data.hook}
      </Text>
      <Text style={{ fontSize: 12.5, color: "#C7CBD1", marginBottom: 220 }}>{data.subtitle}</Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
        <View>
          <Text style={{ fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 6 }}>
            {data.businessName}
          </Text>
          <Text style={{ fontSize: 9.5, color: MUTED_ON_DARK, marginBottom: 2 }}>{data.industry}</Text>
          <Text style={{ fontSize: 9.5, color: MUTED_ON_DARK, marginBottom: 2 }}>{data.location}</Text>
          <Text style={{ fontSize: 9.5, color: MUTED_ON_DARK, marginBottom: 2 }}>{data.website}</Text>
          <Text style={{ fontSize: 9.5, color: MUTED_ON_DARK }}>{data.date}</Text>
        </View>

        <View
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: TEAL,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 20, fontFamily: "Helvetica-Bold", color: NAVY }}>
            {data.overallScore}
          </Text>
          <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold", color: NAVY }}>
            {data.ratingLabel.toUpperCase()}
          </Text>
        </View>
      </View>
    </Page>
  );
}

function SummaryScorecardPage({
  data,
  businessName,
}: {
  data: SummaryPdfData;
  businessName: string;
}) {
  const half = Math.ceil(data.sections.length / 2);
  const col1 = data.sections.slice(0, half);
  const col2 = data.sections.slice(half);

  return (
    <Page size="LETTER" style={styles.page}>
      <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: TEAL_DARK, marginBottom: 8 }}>
        EXECUTIVE SUMMARY
      </Text>
      <Text style={{ fontSize: 19, fontFamily: "Helvetica-Bold", marginBottom: 10 }}>
        {data.headline}
      </Text>
      <Text style={{ fontSize: 10.2, color: GRAY, lineHeight: 1.5 }}>{data.body}</Text>

      <View style={styles.divider} />

      <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: TEAL_DARK, marginBottom: 4 }}>
        PERFORMANCE SCORECARD
      </Text>
      <Text style={{ fontSize: 8.5, color: GRAY, marginBottom: 18 }}>
        Every area scored 0-100 from our analysis.
      </Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ width: "47%" }}>
          {col1.map((s) => (
            <ScoreBar key={s.label} label={s.label} score={s.score} />
          ))}
        </View>
        <View style={{ width: "47%" }}>
          {col2.map((s) => (
            <ScoreBar key={s.label} label={s.label} score={s.score} />
          ))}
        </View>
      </View>

      <Footer businessName={businessName} rightLabel={`Confidential \u2014 prepared for ${businessName}`} />
    </Page>
  );
}

function InsightsPage({
  pair,
  businessName,
}: {
  pair: InsightPdfItem[];
  businessName: string;
}) {
  return (
    <Page size="LETTER" style={styles.page}>
      {pair.map((item, i) => (
        <View key={item.number} style={{ marginBottom: i === 0 ? 20 : 0 }}>
          <View style={{ flexDirection: "row" }}>
            <View style={{ marginRight: 14, marginTop: 2 }}>
              <NumberedCircle number={item.number} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 5 }}>
                {item.headline}
              </Text>
              <Text style={{ fontSize: 9.3, color: GRAY, lineHeight: 1.5, marginBottom: 8 }}>
                {item.body}
              </Text>
              <Text style={{ fontSize: 7.3, fontFamily: "Helvetica-Bold", color: TEAL_DARK, marginBottom: 5 }}>
                KEY TAKEAWAYS
              </Text>
              {item.takeaways.map((t, idx) => (
                <View key={idx} style={{ flexDirection: "row", marginBottom: 3 }}>
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: TEAL,
                      marginTop: 4,
                      marginRight: 6,
                    }}
                  />
                  <Text style={{ fontSize: 8.8, flex: 1 }}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
          {i === 0 && pair.length > 1 && <View style={styles.divider} />}
        </View>
      ))}

      <Footer businessName={businessName} rightLabel="Confidential" />
    </Page>
  );
}

function RoadmapPage({
  items,
  businessName,
}: {
  items: RoadmapPdfItem[];
  businessName: string;
}) {
  return (
    <Page size="LETTER" style={styles.page}>
      <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: TEAL_DARK, marginBottom: 8 }}>
        RECOMMENDED ROADMAP
      </Text>
      <Text style={{ fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 6 }}>
        Where to focus first
      </Text>
      <View style={{ width: 40, height: 2, backgroundColor: TEAL, marginBottom: 18 }} />

      {items.map((item, i) => (
        <View key={i} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View style={{ marginRight: 10, marginTop: 2 }}>
              <NumberedCircle number={i + 1} size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", marginRight: 8 }}>
                  {item.title}
                </Text>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: item.impact === "high" ? CORAL : AMBER,
                      color: WHITE,
                      marginRight: 6,
                    },
                  ]}
                >
                  <Text style={{ color: WHITE, fontSize: 7.5, fontFamily: "Helvetica-Bold" }}>
                    {item.impact.toUpperCase()} IMPACT
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: LIGHT_GRAY }]}>
                  <Text style={{ color: GRAY, fontSize: 7.5, fontFamily: "Helvetica-Bold" }}>
                    {item.timeframe.toUpperCase()}
                  </Text>
                </View>
              </View>
              {item.body ? (
                <Text style={{ fontSize: 9, color: GRAY, lineHeight: 1.4 }}>{item.body}</Text>
              ) : null}
            </View>
          </View>
          {i !== items.length - 1 && <View style={styles.divider} />}
        </View>
      ))}

      <Footer businessName={businessName} rightLabel={`Prepared for ${businessName}`} />
    </Page>
  );
}

function ClosingPage({ data }: { data: ReportPdfData["closing"] }) {
  return (
    <Page size="LETTER" style={styles.darkPage}>
      <View style={{ marginTop: 260 }}>
        <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: TEAL, marginBottom: 10 }}>
          LET'S BUILD MOMENTUM
        </Text>
        <Text style={{ fontSize: 24, fontFamily: "Helvetica-Bold", marginBottom: 14, lineHeight: 1.3 }}>
          {data.headline}
        </Text>
        <Text style={{ fontSize: 11, color: "#C7CBD1", lineHeight: 1.5, marginBottom: 26, width: 420 }}>
          {data.body}
        </Text>

        <View
          style={{
            backgroundColor: TEAL,
            borderRadius: 4,
            paddingVertical: 12,
            paddingHorizontal: 22,
            alignSelf: "flex-start",
          }}
        >
          <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: NAVY }}>{data.ctaText}</Text>
        </View>
      </View>

      <Footer businessName={data.businessName} rightLabel={`Prepared for ${data.businessName}`} dark />
    </Page>
  );
}

// ------------------------------------------------------
// Document
// ------------------------------------------------------

export function ReportDocument({ data }: { data: ReportPdfData }) {
  const pairs: InsightPdfItem[][] = [];
  for (let i = 0; i < data.insights.length; i += 2) {
    pairs.push(data.insights.slice(i, i + 2));
  }

  return (
    <Document>
      <CoverPage data={data.cover} />
      <SummaryScorecardPage data={data.summary} businessName={data.cover.businessName} />
      {pairs.map((pair, i) => (
        <InsightsPage key={i} pair={pair} businessName={data.cover.businessName} />
      ))}
      <RoadmapPage items={data.roadmap} businessName={data.cover.businessName} />
      <ClosingPage data={data.closing} />
    </Document>
  );
}
