-- Initialize the supply chain database
CREATE DATABASE IF NOT EXISTS supply_chain_db;
CREATE DATABASE IF NOT EXISTS supply_chain_test_db;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE supply_chain_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE supply_chain_test_db TO postgres;