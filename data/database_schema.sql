-- Players table
CREATE TABLE IF NOT EXISTS players (
    player_id VARCHAR(100) PRIMARY KEY,
    player_name VARCHAR(255) NOT NULL,
    team_id VARCHAR(100),
    role VARCHAR(50),
    region VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
    match_id VARCHAR(100) PRIMARY KEY,
    tournament_id VARCHAR(100),
    game_date TIMESTAMP,
    duration_seconds INT,
    winning_team VARCHAR(100),
    patch_version VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player micro skills table
CREATE TABLE IF NOT EXISTS player_micro_skills (
    id SERIAL PRIMARY KEY,
    match_id VARCHAR(100) REFERENCES matches(match_id),
    player_id VARCHAR(100) REFERENCES players(player_id),
    
    -- Laning phase
    cs_at_10 FLOAT,
    gold_diff_at_10 FLOAT,
    xp_diff_at_10 FLOAT,
    
    -- Vision control
    vision_score_per_min FLOAT,
    control_wards_purchased INT,
    wards_cleared INT,
    
    -- Combat efficiency
    damage_per_gold FLOAT,
    kill_participation FLOAT,
    death_share FLOAT,
    kda FLOAT,
    
    -- Objective control
    objective_damage_share FLOAT,
    first_blood_participation BOOLEAN,
    
    -- Meta
    champion VARCHAR(100),
    role VARCHAR(50),
    game_result VARCHAR(10),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(match_id, player_id)
);

-- Aggregated player stats (for quick lookup)
CREATE TABLE IF NOT EXISTS player_aggregated_stats (
    player_id VARCHAR(100) PRIMARY KEY,
    total_games INT DEFAULT 0,
    
    -- Averages
    avg_cs_at_10 FLOAT,
    avg_vision_score_per_min FLOAT,
    avg_kill_participation FLOAT,
    avg_kda FLOAT,
    
    -- Percentile ranks (compared to role)
    cs_at_10_percentile FLOAT,
    vision_percentile FLOAT,
    combat_percentile FLOAT,
    
    -- Overall score
    micro_skill_score FLOAT,
    
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Benchmark data (role-specific)
CREATE TABLE IF NOT EXISTS role_benchmarks (
    role VARCHAR(50) PRIMARY KEY,
    cs_at_10_p50 FLOAT,
    cs_at_10_p75 FLOAT,
    cs_at_10_p90 FLOAT,
    vision_score_p50 FLOAT,
    vision_score_p75 FLOAT,
    vision_score_p90 FLOAT,
    kill_participation_p50 FLOAT,
    kill_participation_p75 FLOAT,
    kill_participation_p90 FLOAT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
