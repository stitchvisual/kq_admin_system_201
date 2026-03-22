-- Add travel_km column to appointments table for tracking provider travel distance
ALTER TABLE "appointments" ADD COLUMN "travel_km" numeric(10,2);