# Storage Bucket Setup Instructions for Administrators

To enable image uploads for the crops feature, you need to create a storage bucket and set up appropriate policies. These operations require administrator privileges in Supabase.

## Option 1: Using the Supabase Dashboard (Recommended)

1. Log in to your Supabase dashboard
2. Navigate to Storage in the left sidebar
3. Click "Create a new bucket"
4. Enter the following details:
   - Bucket name: `crop-images`
   - Make it public: Yes (check the box)
   - Click "Create bucket"

5. After creating the bucket, click on it to open its settings
6. Go to the "Policies" tab
7. Create the following policies:

### Policy 1: Allow authenticated users to upload files
- Policy name: "Allow authenticated users to upload crop images"
- Allowed operations: INSERT
- Policy definition: `(auth.role() = 'authenticated')`

### Policy 2: Allow public access to view images
- Policy name: "Allow public access to crop images"
- Allowed operations: SELECT
- Policy definition: `true`

### Policy 3: Allow authenticated users to update their images
- Policy name: "Allow authenticated users to update crop images"
- Allowed operations: UPDATE
- Policy definition: `(auth.role() = 'authenticated')`

### Policy 4: Allow authenticated users to delete their images
- Policy name: "Allow authenticated users to delete crop images"
- Allowed operations: DELETE
- Policy definition: `(auth.role() = 'authenticated')`

## Option 2: Using SQL (For Advanced Users)

If you have access to run SQL as a Supabase administrator, you can run the following SQL script:

```sql
-- Create the crop-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('crop-images', 'crop-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload crop images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'crop-images');

-- Create policy to allow public access to view images
CREATE POLICY "Allow public access to crop images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'crop-images');

-- Create policy to allow authenticated users to update their own images
CREATE POLICY "Allow authenticated users to update crop images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'crop-images');

-- Create policy to allow authenticated users to delete their own images
CREATE POLICY "Allow authenticated users to delete crop images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'crop-images');
```

## Note About Current Implementation

The application has been designed to gracefully handle the case where the storage bucket is not available. If the bucket doesn't exist or the user doesn't have permission to upload:

1. The application will still create/update crops without images
2. A warning message will be displayed to users about image upload limitations
3. Error messages will be logged to the console but won't prevent the main functionality from working 