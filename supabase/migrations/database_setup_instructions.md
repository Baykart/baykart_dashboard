# Database Setup Instructions for Administrators

To enable the crops feature, you need to create the database table and set up appropriate Row Level Security (RLS) policies. These operations require administrator privileges in Supabase.

## Option 1: Using SQL in the Supabase Dashboard

1. Log in to your Supabase dashboard
2. Navigate to SQL Editor in the left sidebar
3. Create a new query
4. Paste and run the following SQL:

```sql
-- Create crops table
CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES public.crop_categories(id) ON DELETE CASCADE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies for crops table
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to select crops
CREATE POLICY "Allow anyone to select crops"
ON public.crops
FOR SELECT
USING (true);

-- Create policy to allow authenticated users to insert crops
CREATE POLICY "Allow authenticated users to insert crops"
ON public.crops
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update crops
CREATE POLICY "Allow authenticated users to update crops"
ON public.crops
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete crops
CREATE POLICY "Allow authenticated users to delete crops"
ON public.crops
FOR DELETE
USING (auth.role() = 'authenticated');

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update the updated_at timestamp
CREATE TRIGGER update_crops_updated_at
BEFORE UPDATE ON public.crops
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

## Option 2: Using the Supabase Dashboard UI

If you prefer using the UI:

1. Go to the "Table Editor" in the Supabase dashboard
2. Click "Create a new table"
3. Set the table name to "crops"
4. Add the following columns:
   - id: UUID (Primary Key, Default: gen_random_uuid())
   - name: Text (Not Null)
   - category_id: UUID (Foreign Key to crop_categories.id, Not Null)
   - image_url: Text
   - created_at: Timestamp with timezone (Default: now(), Not Null)
   - updated_at: Timestamp with timezone (Default: now(), Not Null)

5. After creating the table, go to "Authentication" > "Policies"
6. Find the "crops" table and add the following policies:
   - Policy for SELECT: Allow anyone to select crops
     - Policy name: "Allow anyone to select crops"
     - Target roles: public
     - Using expression: `true`

   - Policy for INSERT: Allow authenticated users to insert crops
     - Policy name: "Allow authenticated users to insert crops"
     - Target roles: authenticated
     - Using expression: `auth.role() = 'authenticated'`

   - Policy for UPDATE: Allow authenticated users to update crops
     - Policy name: "Allow authenticated users to update crops"
     - Target roles: authenticated
     - Using expression: `auth.role() = 'authenticated'`

   - Policy for DELETE: Allow authenticated users to delete crops
     - Policy name: "Allow authenticated users to delete crops"
     - Target roles: authenticated
     - Using expression: `auth.role() = 'authenticated'`

## Troubleshooting RLS Issues

If you're seeing errors like "new row violates row-level security policy for table 'crops'", it means:

1. RLS is enabled on the table (which is good for security)
2. The current user doesn't have permission to perform the action

To fix this:
1. Make sure you're authenticated (signed in) when using the app
2. Check that the RLS policies are correctly set up as described above
3. If you're still having issues, you can temporarily disable RLS for testing:
   ```sql
   ALTER TABLE public.crops DISABLE ROW LEVEL SECURITY;
   ```
   (Remember to re-enable it for production!) 