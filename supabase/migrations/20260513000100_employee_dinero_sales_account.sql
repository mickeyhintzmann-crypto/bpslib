ALTER TABLE employee_dinero_connections
  ADD COLUMN IF NOT EXISTS sales_account_number integer DEFAULT NULL;
