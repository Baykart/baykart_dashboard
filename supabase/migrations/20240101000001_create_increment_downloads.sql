-- Create function to increment downloads
CREATE OR REPLACE FUNCTION increment_downloads()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE app_stats
  SET downloads = downloads + 1
  WHERE id = (SELECT id FROM app_stats ORDER BY created_at ASC LIMIT 1);
END;
$$; 