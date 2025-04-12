/*
  # Set up storage for product images

  1. Storage
    - Create a public bucket for product images
    - Enable RLS policies for the bucket
    
  2. Security
    - Allow authenticated users to upload images
    - Allow public access to read images
*/

-- Enable storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Set up RLS policies for the bucket
CREATE POLICY "Allow public access to product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated users to upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');