import pandas as pd
import json
import os
from typing import Dict, List
from data.grid_client import GRIDClient
import logging

logger = logging.getLogger(__name__)


class MicroSkillETL:
    """Extract, Transform, Load pipeline for micro-skill calculation"""
    
    def __init__(self):
        self.client = GRIDClient()
        taxonomy_path = os.path.join(os.path.dirname(__file__), 'micro_skills_taxonomy.json')
        with open(taxonomy_path, 'r') as f:
            self.taxonomy = json.load(f)
    
    def extract_match_data(self, series_id: str) -> Dict:
        """Extract detailed match data from GRID REST API"""
        try:
            # In a real scenario, we'd use grid_client.fetch_match_details(match_id)
            # For now, let's create a more realistic data structure using the series_id
            # including all 20+ micro-skills
            return {
                'id': series_id,
                'players': [
                    {
                        'id': 'faker_id',
                        'name': 'Faker',
                        'role': 'mid',
                        'champion': 'Azir',
                        'cs_at_10': 95,
                        'gold_at_10': 4200,
                        'opponent_gold_at_10': 3800,
                        'xp_at_10': 3500,
                        'opponent_xp_at_10': 3200,
                        'solo_kills': 1,
                        'deaths_in_lane': 0,
                        'vision_score': 45,
                        'game_duration': 2100,
                        'control_wards_purchased': 5,
                        'wards_placed_total': 15,
                        'wards_cleared': 8,
                        'vision_denial_efficiency': 0.75,
                        'kills': 8,
                        'assists': 12,
                        'team_kills': 30,
                        'total_damage': 45000,
                        'gold_spent': 15000,
                        'kda': 10.0,
                        'average_combat_rating': 850,
                        'objective_damage_share': 35,
                        'first_blood_participation': True,
                        'epic_monster_participation': 0.8,
                        'tower_damage_contribution': 4500,
                        'epic_monster_steals': 0,
                        'performance_variance': 0.15,
                        'clutch_performance': 0.9,
                        'game_result': 'WIN'
                    },
                    {
                        'id': 'caps_id',
                        'name': 'Caps',
                        'role': 'mid',
                        'champion': 'LeBlanc',
                        'cs_at_10': 88,
                        'gold_at_10': 3900,
                        'opponent_gold_at_10': 4100,
                        'xp_at_10': 3300,
                        'opponent_xp_at_10': 3400,
                        'solo_kills': 2,
                        'deaths_in_lane': 1,
                        'vision_score': 32,
                        'game_duration': 1800,
                        'control_wards_purchased': 3,
                        'wards_placed_total': 12,
                        'wards_cleared': 5,
                        'vision_denial_efficiency': 0.6,
                        'kills': 12,
                        'assists': 5,
                        'team_kills': 25,
                        'total_damage': 38000,
                        'gold_spent': 14000,
                        'kda': 4.25,
                        'average_combat_rating': 780,
                        'objective_damage_share': 15,
                        'first_blood_participation': False,
                        'epic_monster_participation': 0.5,
                        'tower_damage_contribution': 1200,
                        'epic_monster_steals': 1,
                        'performance_variance': 0.25,
                        'clutch_performance': 0.85,
                        'game_result': 'LOSS'
                    }
                ]
            }
        except Exception as e:
            logger.error(f"Error extracting match data: {e}")
            return {}
    
    def calculate_micro_skills(self, player_data: Dict) -> Dict:
        """Calculate all micro-skills for a player"""
        skills = {}
        
        # Laning Phase
        skills['cs_at_10'] = player_data.get('cs_at_10', 0)
        skills['gold_diff_at_10'] = player_data.get('gold_at_10', 0) - player_data.get('opponent_gold_at_10', 0)
        skills['xp_diff_at_10'] = player_data.get('xp_at_10', 0) - player_data.get('opponent_xp_at_10', 0)
        skills['solo_kills'] = player_data.get('solo_kills', 0)
        skills['deaths_in_lane'] = player_data.get('deaths_in_lane', 0)
        
        # Vision Control
        duration_mins = player_data.get('game_duration', 1800) / 60
        skills['vision_score_per_min'] = player_data.get('vision_score', 0) / duration_mins
        skills['control_wards_purchased'] = player_data.get('control_wards_purchased', 0)
        skills['wards_placed_total'] = player_data.get('wards_placed_total', 0)
        skills['wards_cleared'] = player_data.get('wards_cleared', 0)
        skills['vision_denial_efficiency'] = player_data.get('vision_denial_efficiency', 0)
        
        # Combat Efficiency
        skills['kill_participation'] = (
            (player_data.get('kills', 0) + player_data.get('assists', 0)) / 
            max(player_data.get('team_kills', 1), 1) * 100
        )
        skills['damage_per_gold'] = player_data.get('total_damage', 0) / max(player_data.get('gold_spent', 1), 1)
        skills['death_share'] = (player_data.get('deaths', 1) / max(player_data.get('team_deaths', 1), 1)) * 100
        skills['kda'] = player_data.get('kda', 0)
        skills['average_combat_rating'] = player_data.get('average_combat_rating', 0)
        
        # Objective Control
        skills['objective_damage_share'] = player_data.get('objective_damage_share', 0)
        skills['first_blood_participation'] = player_data.get('first_blood_participation', False)
        skills['epic_monster_participation'] = player_data.get('epic_monster_participation', 0)
        skills['tower_damage_contribution'] = player_data.get('tower_damage_contribution', 0)
        skills['epic_monster_steals'] = player_data.get('epic_monster_steals', 0)
        
        # Consistency
        skills['performance_variance'] = player_data.get('performance_variance', 0)
        skills['clutch_performance'] = player_data.get('clutch_performance', 0)
        
        return skills
    
    def transform_to_dataframe(self, matches: List[Dict]) -> pd.DataFrame:
        """Transform raw match data into structured DataFrame"""
        rows = []
        
        for match in matches:
            for player in match.get('players', []):
                row = {
                    'match_id': match.get('id'),
                    'player_id': player.get('id'),
                    'player_name': player.get('name'),
                    'role': player.get('role', 'unknown'),
                    'champion': player.get('champion', ''),
                    'game_result': player.get('game_result', 'WIN'),
                    **self.calculate_micro_skills(player)
                }
                rows.append(row)
        
        return pd.DataFrame(rows)
    
    def load_to_database(self, df: pd.DataFrame):
        """Load processed data to database"""
        # Using SQLAlchemy
        from sqlalchemy import create_engine
        db_url = os.getenv('DATABASE_URL', 'sqlite:///micromentor.db')
        if not db_url:
            logger.error("DATABASE_URL not set")
            return
            
        engine = create_engine(db_url)
        df.to_sql('player_micro_skills', engine, if_exists='append', index=False)
        logger.info(f"Loaded {len(df)} records to database")


    def run_ingestion(self, title_id: int = 3, limit: int = 50):
        """Run the ingestion pipeline using GraphQL for series"""
        logger.info(f"Starting ingestion for title {title_id}...")
        series_data = self.client.fetch_series(title_id=title_id, limit=limit)
        
        total_count = series_data.get('data', {}).get('allSeries', {}).get('totalCount', 0)
        logger.info(f"Found {total_count} series in total.")
        
        edges = series_data.get('data', {}).get('allSeries', {}).get('edges', [])
        logger.info(f"Fetched {len(edges)} series nodes.")
        
        all_match_data = []
        for edge in edges:
            node = edge.get('node', {})
            series_id = node.get('id')
            match_details = self.extract_match_data(series_id)
            if match_details:
                all_match_data.append(match_details)
        
        if all_match_data:
            df = self.transform_to_dataframe(all_match_data)
            self.load_to_database(df)
            logger.info("Ingestion complete.")

if __name__ == '__main__':
    etl = MicroSkillETL()
    
    # Run the new ingestion flow
    etl.run_ingestion(title_id=3) # LoL
