-- ============================================================================
-- IGNITIA AI - MOCK DATA SEED SCRIPT
-- ============================================================================
-- This script populates the database with realistic test data
-- Run this AFTER running supabase-complete-schema.sql
-- All UUIDs use proper hexadecimal format (0-9, a-f only)
-- ============================================================================

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================

INSERT INTO organizations (id, name, slug, plan, status, settings, created_at, updated_at)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Ignitia AI Demo', 'ignitia-demo', 'enterprise', 'active', '{"features": ["ai_reports", "partner_management", "analytics"]}', NOW() - INTERVAL '90 days', NOW()),
  ('20000000-0000-0000-0000-000000000002', 'Test Startup Inc', 'test-startup', 'starter', 'active', '{"features": ["ai_reports"]}', NOW() - INTERVAL '30 days', NOW()),
  ('30000000-0000-0000-0000-000000000003', 'Enterprise Corp', 'enterprise-corp', 'professional', 'active', '{"features": ["ai_reports", "partner_management"]}', NOW() - INTERVAL '60 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PLATFORM SETTINGS
-- ============================================================================

INSERT INTO platform_settings (organization_id, platform_name, default_currency, timezone, business_verticals, email_sender, report_footer_text)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Ignitia AI', 'USD', 'America/New_York', ARRAY['Hospitality', 'Tourism', 'Services', 'Retail'], 'no-reply@ignitia.ai', 'Powered by Ignitia AI'),
  ('20000000-0000-0000-0000-000000000002', 'Test Platform', 'USD', 'UTC', ARRAY['Technology', 'SaaS'], 'hello@test.com', 'Test Platform'),
  ('30000000-0000-0000-0000-000000000003', 'Enterprise Platform', 'EUR', 'Europe/London', ARRAY['Finance', 'Consulting'], 'info@enterprise.com', 'Enterprise Solutions')
ON CONFLICT (organization_id) DO NOTHING;

-- ============================================================================
-- PAYMENT SETTINGS
-- ============================================================================

INSERT INTO payment_settings (organization_id, default_report_price, default_commission_type, default_commission_value, tax_rate, vat_rate, enable_discounts)
VALUES
  ('10000000-0000-0000-0000-000000000001', 500.00, 'percentage', 20.00, 0.00, 0.00, true),
  ('20000000-0000-0000-0000-000000000002', 299.00, 'percentage', 15.00, 8.50, 0.00, false),
  ('30000000-0000-0000-0000-000000000003', 750.00, 'fixed', 100.00, 0.00, 20.00, true)
ON CONFLICT (organization_id) DO NOTHING;

-- ============================================================================
-- REPORT CONFIGURATIONS
-- ============================================================================

INSERT INTO report_configurations (organization_id, free_report_sections, paid_report_sections, enable_redemption_tracking, pdf_font_family, pdf_primary_color, pdf_secondary_color, enable_upsell, upsell_message, upsell_price)
VALUES
  ('10000000-0000-0000-0000-000000000001',
   ARRAY['revenue_snapshot', 'quick_wins', 'basic_analysis'],
   ARRAY['revenue_snapshot', 'quick_wins', 'deep_analysis', 'competitor_analysis', 'growth_roadmap', 'implementation_plan'],
   true, 'Inter', '#7C3AED', '#1F2937', true, 'Unlock your complete Growth Blueprint for $500', 500.00),
  ('20000000-0000-0000-0000-000000000002',
   ARRAY['revenue_snapshot', 'quick_wins'],
   ARRAY['revenue_snapshot', 'quick_wins', 'deep_analysis', 'growth_roadmap'],
   true, 'Arial', '#3B82F6', '#111827', true, 'Upgrade to full report for $299', 299.00),
  ('30000000-0000-0000-0000-000000000003',
   ARRAY['revenue_snapshot'],
   ARRAY['revenue_snapshot', 'quick_wins', 'deep_analysis', 'competitor_analysis', 'growth_roadmap', 'implementation_plan', 'executive_summary'],
   true, 'Helvetica', '#8B5CF6', '#0F172A', true, 'Get the complete enterprise report for $750', 750.00)
ON CONFLICT (organization_id) DO NOTHING;

-- ============================================================================
-- SYSTEM SETTINGS
-- ============================================================================

INSERT INTO system_settings (organization_id, enable_logging, enable_audit, data_retention_days, system_alerts, backup_frequency)
VALUES
  ('10000000-0000-0000-0000-000000000001', true, true, 365, ARRAY['errors', 'api_failures', 'payment_failures'], 'daily'),
  ('20000000-0000-0000-0000-000000000002', true, false, 90, ARRAY['errors'], 'weekly'),
  ('30000000-0000-0000-0000-000000000003', true, true, 730, ARRAY['errors', 'api_failures', 'payment_failures', 'security_alerts'], 'daily')
ON CONFLICT (organization_id) DO NOTHING;

-- ============================================================================
-- PARTNERS
-- ============================================================================

INSERT INTO partners (id, organization_id, name, company_name, email, phone, website, industry, country, city, status, notes, created_at, updated_at)
VALUES
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Hideaway Waterfront Resort', 'Hideaway Florida LLC', 'info@hideawayflorida.com', '+1 239 555 0101', 'https://www.hideawayflorida.com', 'Hospitality', 'USA', 'Cape Coral', 'active', 'Primary pilot partner', NOW() - INTERVAL '60 days', NOW() - INTERVAL '5 days'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Sunset Fishing Charters', 'Sunset Fishing LLC', 'bookings@sunsetfishing.com', '+1 239 555 0202', 'https://www.sunsetfishing.com', 'Tourism', 'USA', 'Cape Coral', 'active', 'Fishing charter partner', NOW() - INTERVAL '45 days', NOW() - INTERVAL '10 days'),
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Paradise Spa & Wellness', 'Paradise Wellness Inc', 'contact@paradisespa.com', '+1 239 555 0303', 'https://www.paradisespa.com', 'Wellness', 'USA', 'Naples', 'active', 'Spa and wellness services', NOW() - INTERVAL '30 days', NOW() - INTERVAL '2 days'),
  ('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Coastal Adventures Tours', 'Coastal Adventures LLC', 'info@coastaladventures.com', '+1 239 555 0404', 'https://www.coastaladventures.com', 'Tourism', 'USA', 'Fort Myers', 'paused', 'Currently paused for season', NOW() - INTERVAL '20 days', NOW() - INTERVAL '1 day'),
  ('40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 'Tech Solutions Pro', 'Tech Solutions Inc', 'hello@techsolutions.com', '+1 555 123 4567', 'https://www.techsolutions.com', 'Technology', 'USA', 'San Francisco', 'active', 'SaaS partner', NOW() - INTERVAL '15 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- DEALS
-- ============================================================================

INSERT INTO deals (id, partner_id, organization_id, name, description, commission_type, commission_value, price, payout_trigger, redemptions, max_redemptions, status, start_date, end_date, notes, created_at, updated_at)
VALUES
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Direct Booking 10% Commission', '10% commission for all direct bookings through Ignitia AI', 'percentage', 10.00, 350.00, 'sale', 10, NULL, 'active', '2025-01-01', '2025-12-31', 'Primary deal for Hideaway Waterfront Resort', NOW() - INTERVAL '60 days', NOW()),
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Half-Day Fishing Trip', 'Fixed commission per booking for half-day trips', 'fixed', 50.00, 1500.00, 'lead', 5, 20, 'active', '2025-01-05', NULL, 'High-demand half-day package', NOW() - INTERVAL '45 days', NOW()),
  ('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Full-Day Fishing Adventure', 'Fixed $100 per full-day booking', 'fixed', 100.00, 2500.00, 'lead', 3, 15, 'active', '2025-01-10', NULL, 'Popular for tourists staying multiple days', NOW() - INTERVAL '40 days', NOW()),
  ('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Luxury Suite Upgrade', '5% commission for suite upgrades', 'percentage', 5.00, 1200.00, 'sale', 2, 10, 'paused', '2025-02-01', '2025-12-31', 'Currently paused for low season', NOW() - INTERVAL '30 days', NOW()),
  ('50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Spa Package Deal', '15% commission on spa packages', 'percentage', 15.00, 450.00, 'sale', 8, NULL, 'active', '2025-01-15', '2025-06-30', 'Seasonal spa promotion', NOW() - INTERVAL '25 days', NOW()),
  ('50000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 'SaaS Referral Program', 'Fixed $200 per qualified lead', 'fixed', 200.00, 999.00, 'lead', 0, 50, 'active', '2025-01-20', NULL, 'Tech startup referral program', NOW() - INTERVAL '10 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- LEADS
-- ============================================================================

INSERT INTO leads (id, organization_id, partner_id, deal_id, name, email, phone, company, website, industry, status, source, priority, estimated_value, actual_value, notes, created_at, updated_at, last_contacted_at, next_follow_up_at)
VALUES
  ('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Acme Corporation', 'contact@acmecorp.com', '+1 555-0101', 'Acme Corporation', 'https://acmecorp.com', 'Technology', 'new', 'audit', 'hot', 15000.00, NULL, 'Interested in full audit. High potential client.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NULL, NOW() + INTERVAL '1 day'),
  ('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', 'TechStart Inc', 'hello@techstart.io', '+1 555-0102', 'TechStart Inc', 'https://techstart.io', 'SaaS', 'contacted', 'referral', 'warm', 8000.00, NULL, 'Had initial call. Waiting for decision from CEO.', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() + INTERVAL '2 days'),
  ('60000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000005', 'Wellness Retreat Center', 'info@wellnessretreat.com', '+1 555-0103', 'Wellness Retreat LLC', 'https://wellnessretreat.com', 'Wellness', 'qualified', 'campaign', 'hot', 12000.00, NULL, 'Very interested in automation. Ready to move forward.', NOW() - INTERVAL '7 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days', NOW() + INTERVAL '3 days'),
  ('60000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', NULL, NULL, 'Coastal Hotel Group', 'reservations@coastalhotels.com', '+1 555-0104', 'Coastal Hotels Inc', 'https://coastalhotels.com', 'Hospitality', 'qualified', 'manual', 'warm', 20000.00, NULL, 'Sent proposal for multi-location implementation.', NOW() - INTERVAL '10 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() + INTERVAL '5 days'),
  ('60000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Boutique Resort & Spa', 'contact@boutiqueresort.com', '+1 555-0105', 'Boutique Resort LLC', 'https://boutiqueresort.com', 'Hospitality', 'converted', 'referral', 'hot', 18000.00, 17500.00, 'Successfully converted! Implementation in progress.', NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NULL),
  ('60000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', NULL, NULL, 'Adventure Tours Co', 'info@adventuretours.com', '+1 555-0106', 'Adventure Tours Inc', 'https://adventuretours.com', 'Tourism', 'lost', 'campaign', 'cold', 5000.00, NULL, 'Lost to competitor. Budget constraints.', NOW() - INTERVAL '20 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '15 days', NULL),
  ('60000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000003', 'Marina Services Plus', 'hello@marinaservices.com', '+1 555-0107', 'Marina Services LLC', 'https://marinaservices.com', 'Services', 'new', 'audit', 'warm', 9500.00, NULL, 'Completed free audit. Reviewing results.', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NULL, NOW() + INTERVAL '2 days'),
  ('60000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000006', 'Digital Marketing Pro', 'contact@digitalmarketing.com', '+1 555-0108', 'Digital Marketing Inc', 'https://digitalmarketing.com', 'Marketing', 'contacted', 'manual', 'hot', 11000.00, NULL, 'Scheduled demo for next week.', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() + INTERVAL '4 days'),
  ('60000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001', NULL, NULL, 'Luxury Yacht Rentals', 'bookings@luxuryyachts.com', '+1 555-0109', 'Luxury Yacht Co', 'https://luxuryyachts.com', 'Tourism', 'qualified', 'referral', 'hot', 25000.00, NULL, 'High-value lead. Very interested in premium package.', NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() + INTERVAL '1 day'),
  ('6000000a-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000005', 'Fitness & Wellness Hub', 'info@fitnesshub.com', '+1 555-0110', 'Fitness Hub LLC', 'https://fitnesshub.com', 'Wellness', 'new', 'campaign', 'cold', 6000.00, NULL, 'Initial inquiry. Need to qualify further.', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NULL, NOW() + INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Mock data successfully created with:
-- - 3 Organizations (Ignitia AI Demo, Test Startup Inc, Enterprise Corp)
-- - 5 Partners (Hideaway Resort, Sunset Fishing, Paradise Spa, Coastal Adventures, Tech Solutions)
-- - 6 Deals (various commission structures and payout triggers)
-- - 10 Leads (various statuses: new, contacted, qualified, converted, lost)
-- - Platform settings, payment settings, report configurations, and system settings for each org
--
-- Valid lead statuses: 'new', 'contacted', 'qualified', 'converted', 'lost'
-- Valid lead sources: 'audit', 'manual', 'referral', 'campaign'
-- Valid lead priorities: 'hot', 'warm', 'cold'
--
-- All UUIDs use proper hexadecimal format (0-9, a-f only) for PostgreSQL compatibility
-- Run this script in your Supabase SQL Editor to populate test data
-- ============================================================================

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Mock data successfully created with:
-- - 3 Organizations (Ignitia AI Demo, Test Startup Inc, Enterprise Corp)
-- - 5 Partners (Hideaway Resort, Sunset Fishing, Paradise Spa, Coastal Adventures, Tech Solutions)
-- - 6 Deals (various commission structures and payout triggers)
-- - 10 Leads (various statuses: new, contacted, qualified, proposal, converted, lost)
-- - Platform settings, payment settings, report configurations, and system settings for each org
--
-- All UUIDs use proper hexadecimal format for PostgreSQL compatibility
-- Run this script in your Supabase SQL Editor to populate test data
-- ============================================================================
