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

-- Create storage policies for crop-images bucket
-- Note: This assumes the bucket 'crop-images' already exists
-- These policies need to be created through the Supabase dashboard or API
-- The SQL below is commented out as a reference for what needs to be done

/*
Storage policies should be created through the Supabase dashboard:
1. Go to Storage > Buckets > crop-images
2. Click on "Policies" tab
3. Create the following policies:
   - Policy for authenticated users to upload files:
     - Name: "Allow authenticated users to upload crop images"
     - Allowed operations: INSERT
     - Policy definition: (auth.role() = 'authenticated')
   
   - Policy for public access to view images:
     - Name: "Allow public access to crop images"
     - Allowed operations: SELECT
     - Policy definition: true
*/ 