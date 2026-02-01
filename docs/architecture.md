# MicroMentor Architecture

## System Components

1. **Data Ingestion Layer**
   - GRID API Client (GraphQL for series metadata, REST for match details)
   - Data Validators
   - ETL Pipeline

2. **Data Storage**
   - PostgreSQL (match data, player stats)
   - File Storage (processed datasets)

3. **Analytics Engine**
   - Micro-Skill Calculators
   - Benchmark Comparators
   - ML Models (performance prediction)

4. **API Layer**
   - Flask REST API
   - Authentication
   - Rate Limiting

5. **Frontend**
   - React Dashboard
   - Interactive Visualizations (Plotly)
   - Player Profile Pages

## Data Flow
User Request → API → Analytics Engine → Database Query → ML Processing → Response → Frontend Visualization
