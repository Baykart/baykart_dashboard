-- Rename articles table to news_articles
ALTER TABLE IF EXISTS articles RENAME TO news_articles;

-- Add missing columns to match the news_articles schema
ALTER TABLE news_articles 
  ADD COLUMN IF NOT EXISTS brief TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'Unknown',
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Uncategorized';

-- Rename published_at to publish_date if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'published_at'
  ) THEN
    ALTER TABLE news_articles RENAME COLUMN published_at TO publish_date;
  END IF;
END $$;

-- Create a trigger to update the updated_at timestamp
CREATE TRIGGER update_news_articles_updated_at
  BEFORE UPDATE ON news_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create an index on category and publish_date for better performance
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_publish_date ON news_articles(publish_date);

-- Update the storage bucket name if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM storage.buckets WHERE name = 'news_images'
  ) AND EXISTS (
    SELECT FROM storage.buckets WHERE name = 'article_images'
  ) THEN
    UPDATE storage.objects 
    SET bucket_id = 'news_images' 
    WHERE bucket_id = 'article_images';
    
    ALTER TABLE storage.buckets 
    UPDATE name = 'news_images' 
    WHERE name = 'article_images';
  END IF;
END $$; 