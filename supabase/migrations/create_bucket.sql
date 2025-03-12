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