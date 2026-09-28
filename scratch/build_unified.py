import os

se_path = r'Database/PetNexus_Database.sql'
ddd_path = r'c:/Users/Avinash/Documents/SLIIT/Y2S1/DDD/Project/PetNexus_DDD_Part02.sql'
out_se = r'Database/PetNexus_Unified_Master.sql'
out_ddd = r'c:/Users/Avinash/Documents/SLIIT/Y2S1/DDD/Project/PetNexus_Unified_Master.sql'

with open(se_path, 'r', encoding='utf-16le', errors='ignore') as f:
    se_text = f.read()

with open(ddd_path, 'r', encoding='utf-8') as f:
    ddd_text = f.read()

# Filter out initial db creation from ddd_text so it attaches cleanly to PetNexus
clean_ddd = ddd_text
# replace "USE PetNexus_DDD;" with "USE PetNexus;"
clean_ddd = clean_ddd.replace('USE PetNexus_DDD;', 'USE PetNexus;')
clean_ddd = clean_ddd.replace('DROP DATABASE IF EXISTS PetNexus_DDD;', '-- Unified Database Mode')
clean_ddd = clean_ddd.replace('CREATE DATABASE PetNexus_DDD;', '-- Database PetNexus is already created')

# Build master header
header = """-- ==============================================================================
-- SLIIT - Faculty of Computing (Year 2 Semester 1 - 2026)
-- PROJECT: PetNexus - Web-based Pet Care System (Group: 2026-Y2-S1-MTR-20)
-- UNIFIED MASTER DATABASE SCRIPT: SE Web Application + IT2140 DDD Assignment 02
--
-- This script unifies:
--   1. The full Spring Boot + React Web Application Database Schema & Seed Data (Preserves Website!)
--   2. The complete IT2140 Database Design & Development (DDD) Parts B to F Implementation
--      (Matches EER Diagram Image 1 & Relational Schema Mapping Image 2 100%)
--   3. Integration Bridges & Cross-Module Synchronization
--
-- Instructions: Run in SQL Server Management Studio (SSMS) from top to bottom.
-- ==============================================================================

USE master;
GO

IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = 'PetNexus')
BEGIN
    CREATE DATABASE [PetNexus];
END;
GO

USE [PetNexus];
GO

"""

print('Header prepared. SE text len:', len(se_text), 'DDD text len:', len(clean_ddd))
