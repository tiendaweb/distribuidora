-- Add overrides field to price_lists for custom prices per product
ALTER TABLE price_lists ADD COLUMN overrides TEXT DEFAULT '{}';
