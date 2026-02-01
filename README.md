# MicroMentor - AI-Powered Individual Player Development Platform

[![Python 3.13+](https://img.shields.io/badge/python-3.13+-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/flask-3.1+-green.svg)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/react-18+-61DAFB.svg)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hackathon](https://img.shields.io/badge/Cloud9%20x%20JetBrains-Hackathon-purple.svg)]()

**The first AI-powered platform that transforms micro-level esports analytics into actionable coaching insights.**

## Quick Highlights

- **20+ Micro-Skill Metrics**: Deep analysis of individual player performance
- **Role-Specific Benchmarking**: Compare against top players in your position
- **ML-Powered Predictions**: RandomForest & XGBoost models predict performance trends
- **Data-Backed Insights**: Automated "Data + Insight" feedback loops with correlation scores
- **Macro Review Agendas**: Concluded match reviews with priority-based discussion items
- **Strategic Predictor**: "What If" hypothetical scenario analysis with probability outcomes
- **Interactive Dashboard**: Beautiful visualizations with React, Plotly & Recharts

## Architecture Overview

### High-Level Workflow

```mermaid
graph LR
    subgraph "STEP 1: DATA INGESTION"
        G["GRID API<br/>Match Data"] --> E["ETL Pipeline<br/>Data Processing"]
        E --> D["SQLite Database<br/>Player Stats"]
    end
    
    subgraph "STEP 2: ANALYSIS ENGINE"
        D --> S["Skill Scorer<br/>Percentile Calculation"]
        D --> B["Benchmark Comparator<br/>Role-Based Ranking"]
        D --> P["Performance Predictor<br/>ML Models"]
    end
    
    subgraph "STEP 3: INSIGHT GENERATION"
        S --> I["Automated Insights<br/>Data + Correlation"]
        B --> I
        P --> I
        I --> M["Macro Review<br/>Priority Agenda"]
        I --> H["Hypothetical Engine<br/>Probability Analysis"]
    end
    
    subgraph "STEP 4: VISUALIZATION"
        M --> UI["React Dashboard<br/>Radar Charts + Trends"]
        H --> UI
    end

    style G fill:#e1f5ff
    style I fill:#fff4e1
    style UI fill:#c8e6c9
```

### System Architecture

```mermaid
graph TB
    UI["REACT DASHBOARD<br/>Radar | Benchmarks | Trends | Insights"]
    
    subgraph "API LAYER"
        API["Flask REST API<br/>CORS Enabled"]
    end
    
    subgraph "CORE SERVICES"
        SS["Skill Scorer<br/>Percentile Engine"]
        BC["Benchmark Comparator<br/>Role Rankings"]
        PP["Performance Predictor<br/>RandomForest ML"]
    end
    
    subgraph "DATA LAYER"
        ETL["ETL Pipeline<br/>Data Transformation"]
        GC["GRID Client<br/>Match Fetching"]
        DB["SQLite<br/>Player Stats"]
    end
    
    EXT["GRID API<br/>Official Esports Data"]

    UI --> API
    API --> SS
    API --> BC
    API --> PP
    SS --> DB
    BC --> DB
    PP --> DB
    ETL --> GC
    GC --> EXT
    ETL --> DB

    style UI fill:#e1f5ff,stroke:#0288d1,stroke-width:2px
    style API fill:#c8e6c9,stroke:#388e3c,stroke-width:2px
    style SS fill:#fff4e1,stroke:#f57c00,stroke-width:2px
    style EXT fill:#ffe0b2,stroke:#e64a19,stroke-width:2px
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18+ | Interactive dashboard with visualizations |
| **Visualization** | Plotly, Recharts | Radar charts, trend lines, benchmarks |
| **Backend** | Flask 3.1+ | REST API with CORS support |
| **ML Engine** | Scikit-learn, XGBoost | Performance prediction models |
| **Database** | SQLite (SQLAlchemy) | Portable player statistics storage |
| **Data Source** | GRID API | Official esports match data |
| **Package Manager** | uv | Fast dependency management |

## The Problem

Current esports analytics tools are **stats-heavy but insight-poor**:

- Show raw numbers without context
- No personalized improvement recommendations
- Require manual VOD review for macro insights
- No "what if" scenario analysis capability
- No automated data-to-insight correlation

## The Solution

MicroMentor creates a platform where:

- **Raw stats become insights** with confidence scores and correlation
- **Benchmarks are role-specific** with percentile rankings
- **Trends reveal trajectory** with visual performance over time
- **Macro reviews are automated** with priority-based agendas
- **What-if questions** get probabilistic answers

## The Mathematical Core

### Percentile Calculation

Each micro-skill is scored against role-specific benchmarks:

| Percentile | Value Range | Classification |
|------------|-------------|----------------|
| **P90+** | Top 10% | Elite Performance |
| **P75-P89** | Top 25% | Strong Performance |
| **P50-P74** | Top 50% | Average Performance |
| **< P50** | Below Median | Needs Improvement |

### Insight Confidence Formula

Each automated insight includes:
- **Data Point**: Specific statistic or correlation
- **Confidence Score**: 0-100% based on sample size and correlation strength
- **Correlation**: Statistical relationship between variables
- **Sample Size**: Number of games analyzed

## Features

### Micro-Skills Analyzed

#### Laning Phase
- CS @ 10 Minutes
- Gold Difference @ 10
- XP Difference @ 10
- Solo Kills
- Deaths in Lane

#### Vision Control
- Vision Score per Minute
- Control Wards Purchased
- Wards Placed/Cleared
- Vision Denial Efficiency

#### Combat Efficiency
- Damage per Gold
- Kill Participation %
- Death Share %
- Average Combat Rating
- KDA

#### Objective Control
- Objective Damage Share
- First Blood Participation
- Epic Monster Participation
- Tower Damage Contribution

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/players/<id>/profile` | GET | Player profile and metadata |
| `/api/players/<id>/micro-skills` | GET | Detailed skill breakdown |
| `/api/players/<id>/benchmarks` | GET | Role-based comparison |
| `/api/players/<id>/trends` | GET | Performance over time |
| `/api/players/<id>/insights` | GET | Data-backed recommendations |
| `/api/players/<id>/macro-review` | GET | Match review agenda |
| `/api/players/<id>/hypothetical` | POST | What-if scenario analysis |

## Quick Start

### Prerequisites

- Python 3.13+
- Node.js 18+
- (Optional) GRID API Key for live data

### Installation

```bash
# Clone and navigate
git clone https://github.com/your-repo/micromentor.git
cd micromentor

# Install backend dependencies with uv
uv sync

# Configure environment
cp .env.example .env
# Add your GRID API key (optional)

# Initialize database
sqlite3 micromentor.db < data/sqlite_schema.sql

# Start backend
uv run api/app.py

# In a new terminal, setup frontend
cd frontend
npm install
npm start
```

### Environment Variables

```bash
# .env file
GRID_API_KEY=your_grid_api_key      # Optional: for live data
DATABASE_URL=sqlite:///micromentor.db
```

## Example Insights

```mermaid
sequenceDiagram
    participant Player
    participant MicroMentor
    participant GRID
    
    Player->>MicroMentor: Request insights for player_id
    
    MicroMentor->>GRID: Fetch recent match data
    GRID-->>MicroMentor: Return 20 matches
    
    MicroMentor->>MicroMentor: Calculate micro-skills<br/>Run ML predictions<br/>Generate correlations
    
    MicroMentor-->>Player: Insight: "CS@10 improved by 12%"<br/>Confidence: 80%<br/>Correlation: 0.65
    
    Note over Player,MicroMentor: Data-backed recommendations<br/>with statistical backing
```

### Sample Insight Output

```json
{
  "data": "CS@10 improved by 12% over last 10 games (85 vs 76)",
  "insight": "Your early farming is trending up. Maintain focus on wave management.",
  "confidence": 80,
  "correlation": 0.65,
  "sample_size": 10,
  "time_period": "Recent Matches"
}
```

## Project Structure

```
micromentor/
├── api/
│   └── app.py                # Flask REST API
├── models/
│   ├── skill_scorer.py       # Micro-skill percentile engine
│   ├── benchmark_comparator.py # Role-based comparison
│   └── performance_predictor.py # ML prediction model
├── data/
│   ├── grid_client.py        # GRID API client
│   ├── etl_pipeline.py       # Data transformation
│   ├── sqlite_schema.sql     # Database schema
│   └── micro_skills_taxonomy.json # Skill definitions
├── frontend/
│   ├── src/
│   │   └── ...               # React components
│   └── package.json
├── tests/
│   └── ...                   # Test suite
├── .env                      # Environment config
├── pyproject.toml            # Python dependencies
└── README.md                 # This file
```

## Hackathon Innovation

### Why MicroMentor Stands Out

1. **Data-Backed Insights**
   - Every recommendation includes confidence score and correlation
   - Transparent statistical backing for all suggestions

2. **Automated Macro Reviews**
   - No more manual VOD review for identifying issues
   - Priority-based agenda items with timestamps

3. **What-If Scenario Engine**
   - Answer hypothetical questions about past decisions
   - Multi-scenario probability analysis

4. **Role-Specific Benchmarks**
   - Compare against your position, not all players
   - Percentile rankings within your role

5. **JetBrains Junie AI Integration**
   - End-to-end development with AI assistance
   - Rapid prototyping and iteration

### The Gap We Fill

| Feature | Traditional Tools | MicroMentor |
|---------|-------------------|-------------|
| Stats | Raw numbers | Percentile rankings |
| Context | None | Role-specific benchmarks |
| Insights | Manual interpretation | Automated with confidence |
| Reviews | Manual VOD analysis | Automated priority agendas |
| What-If | Not available | Probabilistic scenarios |

## Future Roadmap

- [ ] Video clip extraction for key moments
- [ ] Real-time performance tracking
- [ ] Team synergy analysis
- [ ] Mobile application
- [ ] Integration with streaming platforms
- [ ] Multi-game support (VALORANT, CS2)

## License

MIT License - See [LICENSE](LICENSE) file

## Acknowledgments

- Cloud9 for the hackathon opportunity
- JetBrains for Junie AI and amazing IDEs
- GRID for providing official esports data

---

**Built with ❤️ for Cloud9 x JetBrains Hackathon using JetBrains IDEs and Junie AI**

*"MicroMentor transforms raw esports data into actionable coaching intelligence."*
