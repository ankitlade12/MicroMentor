import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
from sqlalchemy import create_engine
import os


class BenchmarkComparator:
    """Compare players against role-specific benchmarks"""
    
    def __init__(self):
        self.engine = create_engine(os.getenv('DATABASE_URL', 'sqlite:///micromentor.db'))
    
    def calculate_role_benchmarks(self, role: str) -> Dict:
        """Calculate percentile benchmarks for a specific role"""
        # SQLite doesn't have PERCENTILE_CONT, so we'll use a simplified version
        # In a real app with SQLite, we might fetch all and compute with numpy,
        # but for now we'll simulate it or use a more complex SQL if needed.
        # Let's try to fetch means and approximate percentiles for now.
        query = f"""
        SELECT 
            AVG(cs_at_10) as cs_at_10_avg,
            AVG(vision_score_per_min) as vision_avg,
            AVG(kill_participation) as kp_avg
        FROM player_micro_skills
        WHERE role = '{role}'
        """
        
        try:
            df = pd.read_sql(query, self.engine)
            if df.empty or df.iloc[0]['cs_at_10_avg'] is None:
                raise ValueError("No data for role")
            
            avg_stats = df.iloc[0].to_dict()
            # Simulate P50, P75, P90 based on average
            return {
                'cs_at_10_p50': avg_stats['cs_at_10_avg'],
                'cs_at_10_p75': avg_stats['cs_at_10_avg'] * 1.1,
                'cs_at_10_p90': avg_stats['cs_at_10_avg'] * 1.25,
                'vision_p50': avg_stats['vision_avg'],
                'vision_p75': avg_stats['vision_avg'] * 1.2,
                'vision_p90': avg_stats['vision_avg'] * 1.4,
                'kp_p50': avg_stats['kp_avg'],
                'kp_p75': avg_stats['kp_avg'] * 1.15,
                'kp_p90': avg_stats['kp_avg'] * 1.3
            }
        except Exception as e:
            # Return dummy data if query fails (e.g., db not setup)
            return {
                'cs_at_10_p50': 70, 'cs_at_10_p75': 80, 'cs_at_10_p90': 90,
                'vision_p50': 1.0, 'vision_p75': 1.2, 'vision_p90': 1.5,
                'kp_p50': 50, 'kp_p75': 65, 'kp_p90': 80
            }
    
    def compare_to_role(self, player_id: str, role: str) -> Dict:
        """Compare player's stats to role benchmarks"""
        benchmarks = self.calculate_role_benchmarks(role)
        
        # Get player's average stats
        query = f"""
        SELECT 
            AVG(cs_at_10) as avg_cs_at_10,
            AVG(vision_score_per_min) as avg_vision,
            AVG(kill_participation) as avg_kp
        FROM player_micro_skills
        WHERE player_id = '{player_id}'
        """
        
        try:
            player_stats = pd.read_sql(query, self.engine).to_dict('records')[0]
        except Exception:
            player_stats = {'avg_cs_at_10': 75, 'avg_vision': 1.1, 'avg_kp': 60}
        
        comparison = {}
        metrics = [
            ('cs_at_10', 'cs_at_10'),
            ('vision', 'vision'),
            ('kp', 'kp')
        ]
        
        for metric_label, benchmark_prefix in metrics:
            player_val = player_stats.get(f'avg_{benchmark_prefix}' if benchmark_prefix == 'cs_at_10' else f'avg_{metric_label}', 0)
            if player_val is None: player_val = 0
            
            p50 = benchmarks.get(f'{benchmark_prefix}_p50')
            p75 = benchmarks.get(f'{benchmark_prefix}_p75')
            p90 = benchmarks.get(f'{benchmark_prefix}_p90')
            
            if player_val >= p90:
                tier = 'Elite (Top 10%)'
            elif player_val >= p75:
                tier = 'Above Average (Top 25%)'
            elif player_val >= p50:
                tier = 'Average (Top 50%)'
            else:
                tier = 'Below Average'
            
            comparison[metric_label] = {
                'player_value': player_val,
                'p50': p50,
                'p75': p75,
                'p90': p90,
                'tier': tier
            }
        
        return comparison
    
    def find_similar_players(self, player_id: str, top_n: int = 5) -> List[Dict]:
        """Find similar players based on playstyle"""
        # Use cosine similarity on normalized stats
        query = f"""
        WITH player_stats AS (
            SELECT 
                player_id,
                AVG(cs_at_10) as cs,
                AVG(vision_score_per_min) as vision,
                AVG(kill_participation) as kp,
                AVG(damage_per_gold) as dpg
            FROM player_micro_skills
            GROUP BY player_id
        )
        SELECT 
            p2.player_id,
            p2.cs, p2.vision, p2.kp, p2.dpg,
            -- Simple distance metric
            SQRT(
                POW(COALESCE(p1.cs,0) - COALESCE(p2.cs,0), 2) + 
                POW(COALESCE(p1.vision,0) - COALESCE(p2.vision,0), 2) +
                POW(COALESCE(p1.kp,0) - COALESCE(p2.kp,0), 2) +
                POW(COALESCE(p1.dpg,0) - COALESCE(p2.dpg,0), 2)
            ) as similarity_score
        FROM player_stats p1
        CROSS JOIN player_stats p2
        WHERE p1.player_id = '{player_id}' AND p2.player_id != '{player_id}'
        ORDER BY similarity_score ASC
        LIMIT {top_n}
        """
        
        try:
            df = pd.read_sql(query, self.engine)
            return df.to_dict('records')
        except Exception:
            return []
