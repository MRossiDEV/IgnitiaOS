-- ============================================================================
-- AI TEMPLATES RLS POLICIES
-- ============================================================================
-- Add Row Level Security policies for ai_templates table

-- Allow users to view templates in their organization
CREATE POLICY "Users can view templates in their organization"
  ON ai_templates FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

-- Allow users to insert templates in their organization
CREATE POLICY "Users can create templates in their organization"
  ON ai_templates FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

-- Allow users to update templates in their organization
CREATE POLICY "Users can update templates in their organization"
  ON ai_templates FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));

-- Allow users to delete templates in their organization
CREATE POLICY "Users can delete templates in their organization"
  ON ai_templates FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
  ));
