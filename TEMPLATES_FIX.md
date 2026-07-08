# Fix Templates API 500 Error

## Issue
The templates API returns 500 errors because RLS (Row Level Security) policies are missing on the `ai_templates` table.

## Solution
Run the following SQL in your Supabase SQL Editor to add the required RLS policies:

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Create a new query
4. Copy and paste the SQL from `ai-templates-rls.sql`
5. Run the query

## SQL to Execute

```sql
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
```

## Verification

After running the SQL:
1. Refresh your browser
2. The templates page should now load without errors
3. You should be able to create, edit, and delete templates

## Why This Happened

The database schema has RLS (Row Level Security) enabled on `ai_templates`, but no policies were defined. Without policies, all queries are denied by default (this is the secure default).

The RLS policies above ensure that:
- Users can only see templates from their own organization
- Users can only create templates in their organization
- Users can only modify/delete their own organization's templates
