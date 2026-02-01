-- Players table
CREATE TABLE IF NOT EXISTS players (
    player_id TEXT PRIMARY KEY,
    player_name TEXT NOT NULL,
    team_id TEXT,
    role TEXT,
    region TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
    match_id TEXT PRIMARY KEY,
    tournament_id TEXT,
    game_date TIMESTAMP,
    duration_seconds INTEGER,
    winning_team TEXT,
    patch_version TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player micro skills table
CREATE TABLE IF NOT EXISTS player_micro_skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id TEXT REFERENCES matches(match_id),
    player_id TEXT REFERENCES players(player_id),
    
    -- Laning phase
    cs_at_10 REAL,
    gold_diff_at_10 REAL,
    xp_diff_at_10 REAL,
    solo_kills REAL,
    deaths_in_lane REAL,
    
    -- Vision control
    vision_score_per_min REAL,
    control_wards_purchased INTEGER,
    wards_placed_total INTEGER,
    wards_cleared INTEGER,
    vision_denial_efficiency REAL,
    
    -- Combat efficiency
    kill_participation REAL,
    damage_per_gold REAL,
    death_share REAL,
    kda REAL,
    average_combat_rating REAL,
    
    -- Objective control
    objective_damage_share REAL,
    first_blood_participation BOOLEAN,
    epic_monster_participation REAL,
    tower_damage_contribution REAL,
    epic_monster_steals INTEGER,
    
    -- Meta
    champion TEXT,
    role TEXT,
    player_name TEXT,
    game_result TEXT,
    
    -- Consistency Metrics
    performance_variance REAL,
    clutch_performance REAL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(match_id, player_id)
);

-- Aggregated player stats (for quick lookup)
CREATE TABLE IF NOT EXISTS player_aggregated_stats (
    player_id TEXT PRIMARY KEY,
    total_games INTEGER DEFAULT 0,
    
    -- Averages
    avg_cs_at_10 REAL,
    avg_vision_score_per_min REAL,
    avg_kill_participation REAL,
    avg_kda REAL,
    
    -- Percentile ranks (compared to role)
    cs_at_10_percentile REAL,
    vision_percentile REAL,
    combat_percentile REAL,
    
    -- Overall score
    micro_skill_score REAL,
    
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Benchmark data (role-specific)
CREATE TABLE IF NOT EXISTS role_benchmarks (
    role TEXT PRIMARY KEY,
    cs_at_10_p50 REAL,
    cs_at_10_p75 REAL,
    cs_at_10_p90 REAL,
    vision_score_p50 REAL,
    vision_score_p75 REAL,
    vision_score_p90 REAL,
    kill_participation_p50 REAL,
    kill_participation_p75 REAL,
    kill_participation_p90 REAL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
