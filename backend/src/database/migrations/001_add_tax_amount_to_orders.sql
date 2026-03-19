-- Add tax_amount column to orders table
ALTER TABLE orders ADD COLUMN tax_amount DECIMAL(10, 2) DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN orders.tax_amount IS 'Tax amount charged (5% of subtotal)';
