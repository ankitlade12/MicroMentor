import pandas as pd
import numpy as np
from typing import Dict, List
from sklearn.preprocessing import StandardScaler
import json
import os


class MicroSkillScorer:
    """Calculate weighted micro-skill scores for players"""
    
    def __init__(self, taxonomy_path: str = None):
        if taxonomy_path is None:
            taxonomy_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'micro_skills_taxonomy.json')
        
        with open(taxonomy_path, 'r') as f:
            self.taxonomy = json.load(f)
        self.scaler = StandardScaler()
        self.weights = self._extract_weights()
    
    def _extract_weights(self) -> Dict[str, float]:
        """Extract skill weights from taxonomy"""
        weights = {}
        for category in self.taxonomy.values():
            for skill_name, skill_info in category.items():
                weights[skill_name] = skill_info.get('weight', 0.05)
        return weights
    
    def calculate_percentile_ranks(self, df: pd.DataFrame, role: str) -> pd.DataFrame:
        """Calculate percentile ranks for each skill within a role"""
        role_df = df[df['role'] == role].copy()
        
        for skill in self.weights.keys():
            if skill in role_df.columns:
                role_df[f'{skill}_percentile'] = role_df[skill].rank(pct=True) * 100
        
        return role_df
    
    def calculate_overall_score(self, player_stats: Dict) -> float:
        """Calculate weighted overall micro-skill score"""
        total_score = 0
        total_weight = 0
        
        for skill, weight in self.weights.items():
            if skill in player_stats and player_stats[skill] is not None:
                # Normalize to 0-100 scale based on percentile
                percentile_key = f'{skill}_percentile'
                if percentile_key in player_stats:
                    score = player_stats[percentile_key]
                    total_score += score * weight
                    total_weight += weight
        
        if total_weight == 0:
            return 0
        
        return total_score / total_weight
    
    def get_skill_breakdown(self, player_stats: Dict) -> Dict[str, Dict]:
        """Get detailed breakdown of player's skill ratings"""
        breakdown = {}
        
        for category_name, category in self.taxonomy.items():
            category_scores = {}
            for skill_name, skill_info in category.items():
                if skill_name in player_stats:
                    percentile_key = f'{skill_name}_percentile'
                    category_scores[skill_name] = {
                        'value': player_stats[skill_name],
                        'percentile': player_stats.get(percentile_key, 0),
                        'weight': skill_info['weight'],
                        'name': skill_info['name']
                    }
            breakdown[category_name] = category_scores
        
        return breakdown
