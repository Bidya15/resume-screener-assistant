-- Database creation script for Resume Screener Assistant
-- Execute with postgres superuser via psql or pgAdmin:
-- psql -U postgres -f init-db.sql

CREATE DATABASE resume_screener_db;
CREATE DATABASE resume_screener_test_db;

-- If you wish to use a dedicated database user instead of 'postgres':
-- CREATE USER resume_user WITH ENCRYPTED PASSWORD 'your_secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE resume_screener_db TO resume_user;
-- GRANT ALL PRIVILEGES ON DATABASE resume_screener_test_db TO resume_user;
-- \c resume_screener_db
-- GRANT ALL ON SCHEMA public TO resume_user;
-- \c resume_screener_test_db
-- GRANT ALL ON SCHEMA public TO resume_user;

