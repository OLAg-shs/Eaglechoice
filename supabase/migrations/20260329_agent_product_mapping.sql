-- Add agent assignment to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES profiles(id);

-- Default existing products to their store's owner if a store exists
UPDATE products p
SET agent_id = s.owner_id
FROM stores s
WHERE p.store_id = s.id AND p.agent_id IS NULL;

-- Security: Only store members can be agents for a store's products
CREATE OR REPLACE FUNCTION check_product_agent_validity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.agent_id IS NOT NULL AND NEW.store_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM store_members 
      WHERE store_id = NEW.store_id AND user_id = NEW.agent_id
    ) THEN
      RAISE EXCEPTION 'User % is not a member of store %', NEW.agent_id, NEW.store_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_check_product_agent ON products;
CREATE TRIGGER tr_check_product_agent
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION check_product_agent_validity();
