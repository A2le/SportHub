-- Add Division column to Registrations table (teams don't need division)
ALTER TABLE registrations 
ADD COLUMN Division VARCHAR(50) DEFAULT '';

-- Update existing records to have empty division (they'll be auto-assigned during fixture generation)
UPDATE registrations SET Division = '' WHERE Division IS NULL;