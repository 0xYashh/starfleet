-- Add new orbital parameters for true 3D orbital mechanics
ALTER TABLE ships ADD COLUMN IF NOT EXISTS ascending_node DOUBLE PRECISION DEFAULT 0;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS eccentricity DOUBLE PRECISION DEFAULT 0.1;

-- Update existing ships with default values
UPDATE ships SET 
  ascending_node = 0,
  eccentricity = 0.1 + (RANDOM() * 0.2)
WHERE ascending_node IS NULL OR eccentricity IS NULL; 