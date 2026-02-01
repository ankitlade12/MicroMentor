from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import sys

# Add the project root to sys.path for absolute imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.skill_scorer import MicroSkillScorer
from models.benchmark_comparator import BenchmarkComparator
from data.grid_client import GRIDClient
from data.etl_pipeline import MicroSkillETL
import pandas as pd
from sqlalchemy import create_engine

app = Flask(__name__)
CORS(app)

scorer = MicroSkillScorer()
comparator = BenchmarkComparator()
grid_client = GRIDClient()
etl = MicroSkillETL()

# Database engine
db_url = os.getenv('DATABASE_URL', 'sqlite:///micromentor.db')
engine = create_engine(db_url)


@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'name': 'MicroMentor API',
        'status': 'active',
        'endpoints': {
            'health': '/api/health',
            'player_profile': '/api/players/<player_id>/profile',
            'micro_skills': '/api/players/<player_id>/micro-skills',
            'benchmarks': '/api/players/<player_id>/benchmarks',
            'trends': '/api/players/<player_id>/trends',
            'insights': '/api/players/<player_id>/insights',
            'macro_review': '/api/players/<player_id>/macro-review',
            'hypothetical': '/api/players/<player_id>/hypothetical'
        }
    })


@app.route('/favicon.ico')
def favicon():
    return '', 204


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'version': '1.0.0'})


@app.route('/api/players/<player_id>/profile', methods=['GET'])
def get_player_profile(player_id):
    """Get complete player profile with micro-skills"""
    try:
        # Check if it's the specific requested player
        if player_id.lower() == 'ankit':
            return jsonify({
                'player_id': 'ankit',
                'name': 'Ankit',
                'role': 'MID',
                'team': 'Mock Team',
                'data_source': 'MOCK'
            })

        # Try to get from database first
        query = "SELECT * FROM player_micro_skills WHERE player_id = %s LIMIT 1"
        try:
            # Using parameter substitution to avoid SQL injection
            df = pd.read_sql(query, engine, params=(player_id,))
            if not df.empty:
                row = df.iloc[0]
                player_data = {
                    'player_id': player_id,
                    'name': row.get('player_name', player_id),
                    'role': row.get('role', 'unknown'),
                    'team': 'GRID Pro',
                    'data_source': 'database'
                }
                return jsonify(player_data)
        except Exception as db_err:
            print(f"Database error: {db_err}")

        # Fallback to mock if DB fails or is empty
        player_data = {
            'player_id': player_id,
            'name': player_id,
            'role': 'mid',
            'team': 'Mock Team',
            'data_source': 'mock'
        }
        
        return jsonify(player_data)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/players/<player_id>/micro-skills', methods=['GET'])
def get_micro_skills(player_id):
    """Get detailed micro-skill breakdown"""
    try:
        # Try to get average stats from database
        query = "SELECT * FROM player_micro_skills WHERE player_id = %s"
        try:
            df = pd.read_sql(query, engine, params=(player_id,))
            if not df.empty:
                # Calculate means for the player
                stats = df.mean(numeric_only=True).to_dict()
                
                # Fetch role-specific benchmarks to calculate actual percentiles
                role = df.iloc[0]['role']
                
                benchmarks = comparator.calculate_role_benchmarks(role)
                
                # Import json and os if not already at top, but they are.
                import json
                
                # Full list of metrics from taxonomy
                taxonomy_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'micro_skills_taxonomy.json')
                with open(taxonomy_path, 'r') as f:
                    taxonomy = json.load(f)
                
                # Map metrics to benchmark prefixes
                mapping = {
                    'cs_at_10': 'cs_at_10',
                    'vision_score_per_min': 'vision',
                    'kill_participation': 'kp'
                }
                
                for cat_name, cat_skills in taxonomy.items():
                    for skill_id in cat_skills.keys():
                        if skill_id in stats and stats[skill_id] is not None:
                            prefix = mapping.get(skill_id)
                            if prefix:
                                p50 = benchmarks.get(f"{prefix}_p50", 50)
                                p75 = benchmarks.get(f"{prefix}_p75", 75)
                                p90 = benchmarks.get(f"{prefix}_p90", 90)
                                
                                val = stats[skill_id]
                                if val >= p90: stats[f"{skill_id}_percentile"] = 95
                                elif val >= p75: stats[f"{skill_id}_percentile"] = 80
                                elif val >= p50: stats[f"{skill_id}_percentile"] = 60
                                else: stats[f"{skill_id}_percentile"] = 30
                            elif f"{skill_id}_percentile" not in stats:
                                stats[f"{skill_id}_percentile"] = 70
                
                breakdown = scorer.get_skill_breakdown(stats)
                return jsonify(breakdown)
        except Exception as db_err:
            print(f"Database error: {db_err}")

        # Mock breakdown data for demo if DB is empty
        breakdown = scorer.get_skill_breakdown({
            'cs_at_10': 85,
            'cs_at_10_percentile': 75,
            'gold_diff_at_10': 150,
            'gold_diff_at_10_percentile': 85,
            'vision_score_per_min': 1.2,
            'vision_score_per_min_percentile': 60,
            'kill_participation': 65,
            'kill_participation_percentile': 80,
            'damage_per_gold': 1.5,
            'damage_per_gold_percentile': 70,
            'objective_damage_share': 25,
            'objective_damage_share_percentile': 55
        })
        
        return jsonify(breakdown)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/players/<player_id>/benchmarks', methods=['GET'])
def get_benchmarks(player_id):
    """Compare player to role benchmarks"""
    try:
        role = request.args.get('role', 'mid')
        comparison = comparator.compare_to_role(player_id, role)
        
        return jsonify(comparison)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/players/<player_id>/similar', methods=['GET'])
def get_similar_players(player_id):
    """Find similar players"""
    try:
        top_n = int(request.args.get('top_n', 5))
        similar = comparator.find_similar_players(player_id, top_n)
        
        return jsonify(similar)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/players/<player_id>/trends', methods=['GET'])
def get_player_trends(player_id):
    """Get player performance trends over time with enhanced data"""
    try:
        query = f"""
            SELECT 
                created_at as game_date,
                cs_at_10,
                vision_score_per_min,
                kill_participation,
                kda,
                game_result,
                champion
            FROM player_micro_skills
            WHERE player_id = '{player_id}'
            ORDER BY created_at ASC
            LIMIT 20
        """
        df = pd.read_sql(query, engine)
        
        if df.empty:
            # Enhanced mock trends
            import datetime
            import random
            today = datetime.date.today()
            trends = []
            champions = ['Azir', 'Ahri', 'Syndra', 'Orianna', 'LeBlanc']
            for i in range(10):
                date = (today - datetime.timedelta(days=10-i)).isoformat()
                trends.append({
                    'game_date': date,
                    'cs_at_10': 70 + (i * 2) + random.randint(-3, 3),
                    'vision_score_per_min': 1.0 + (i * 0.05) + random.uniform(-0.1, 0.1),
                    'kill_participation': 50 + (i * 3) + random.randint(-5, 5),
                    'kda': 3.0 + (i * 0.2) + random.uniform(-0.5, 0.5),
                    'game_result': random.choice(['WIN', 'LOSS']),
                    'champion': random.choice(champions)
                })
            return jsonify(trends)
            
        return jsonify(df.to_dict('records'))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/players/<player_id>/insights', methods=['GET'])
def get_player_insights(player_id):
    """Generate automated performance insights with data-backed feedback"""
    try:
        query = """
            SELECT cs_at_10, vision_score_per_min, kill_participation, kda, created_at as game_date, gold_diff_at_10
            FROM player_micro_skills
            WHERE player_id = %s
            ORDER BY created_at DESC
            LIMIT 20
        """
        df = pd.read_sql(query, engine, params=(player_id,))
        
        insights = []
        if df.empty:
            # Data-backed insights inspired by the shared document
            insights = [
                {
                    "data": "C9 loses nearly 4 out of 5 rounds (78%) when OXY dies 'for free' (without a KAST)",
                    "insight": "Player OXY's opening duel success rate heavily impacts the team. Ensure OXY is always in a position to get KAST (Trade, Kill, or Assist).",
                    "confidence": 85,
                    "correlation": 0.78,
                    "sample_size": 47,
                    "time_period": "Last 30 days"
                },
                {
                    "data": "C9 loses both pistol rounds 7/10 times they play 1-3-1 on Split.",
                    "insight": "Review starting composition or pistol round strategies on Split. The 1-3-1 configuration is underperforming in opening rounds.",
                    "confidence": 70,
                    "correlation": 0.70,
                    "sample_size": 10,
                    "time_period": "Season 2024"
                },
                {
                    "data": "When our jungler ganks top lane pre-6 minutes, their success rate is 22%. When ganking bot lane pre-6, the success rate is 68%.",
                    "insight": "Early topside pathing results in low-impact ganks. Recommend prioritizing botside pathing to secure early drake control and play to the higher-success-rate lane.",
                    "confidence": 92,
                    "correlation": 0.46,
                    "sample_size": 50,
                    "time_period": "Last 90 days"
                }
            ]
        else:
            # Real data-backed insights
            avg_cs = df['cs_at_10'].mean()
            if len(df) >= 10:
                last_5 = df.head(5)['cs_at_10'].mean()
                prev_5 = df.iloc[5:10]['cs_at_10'].mean()
                if prev_5 > 0:
                    change = ((last_5 - prev_5) / prev_5) * 100
                    status = "improved" if change > 0 else "declined"
                    insights.append({
                        "data": f"CS@10 {status} by {abs(change):.1f}% over the last 10 games ({last_5:.1f} vs {prev_5:.1f}).",
                        "insight": f"Your early game farming is {'trending up' if change > 0 else 'showing signs of fatigue'}. Practice last-hitting drills to {'maintain' if change > 0 else 'regain'} your competitive edge.",
                        "confidence": 80,
                        "correlation": 0.65,
                        "sample_size": 10,
                        "time_period": "Recent Matches"
                    })
            
            avg_kp = df['kill_participation'].mean()
            insights.append({
                "data": f"Average Kill Participation is {avg_kp:.1f}%.",
                "insight": "Your involvement in team objectives is solid. Continue to play to your higher-success-rate lanes to maximize this impact.",
                "confidence": 75,
                "correlation": 0.40,
                "sample_size": len(df),
                "time_period": "All Matches"
            })

            best_game = df.loc[df['kda'].idxmax()]
            insights.append({
                "data": f"Best performance recorded on {best_game['game_date']} with a {best_game['kda']:.1f} KDA.",
                "insight": "Analyze the VOD of this game to identify the specific pathing and decision-making that led to this peak performance.",
                "confidence": 95,
                "correlation": 0.85,
                "sample_size": 1,
                "time_period": "Historical Peak"
            })

        return jsonify({'insights': insights})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/players/<player_id>/macro-review', methods=['GET'])
def get_macro_review(player_id):
    """Generate an automated Game Review Agenda based on concluded match data"""
    try:
        # Fetch last match data
        query = """
            SELECT match_id, champion, game_result, cs_at_10, gold_diff_at_10, kda, tower_damage_contribution, first_blood_participation
            FROM player_micro_skills
            WHERE player_id = %s
            ORDER BY created_at DESC
            LIMIT 1
        """
        df = pd.read_sql(query, engine, params=(player_id,))
        
        if df.empty:
            # Automated Macro Review from official doc examples
            review = {
                "match": "BO1 Series",
                "opponent": "Cloud9 Academy",
                "map": "Summoner's Rift",
                "agenda_items": [
                    {"title": "First Drake setup", "description": "Inadequate deep vision, teleport wards not swept.", "priority": "HIGH", "timestamp": "08:15"},
                    {"title": "Atakhan setup", "description": "Excessive unspent gold in player inventories, suggest a base timer 45s prior, after 2nd tower down in mid lane.", "priority": "MEDIUM", "timestamp": "22:40"},
                    {"title": "Isolated deaths", "description": "23:20 (Top in Top), 27:15 (Mid in Bot, before drake spawn).", "priority": "HIGH", "timestamp": "23:20"},
                    {"title": "Teleport use", "description": "Poor TP flank at 19:40 led to a lost teamfight.", "priority": "LOW", "timestamp": "19:40"}
                ]
            }
        else:
            last_match = df.iloc[0]
            review = {
                "match": f"Match ID: {last_match['match_id']}",
                "opponent": "Recent Opponent",
                "result": last_match['game_result'],
                "champion": last_match['champion'],
                "agenda_items": []
            }
            
            # Generate items based on stats
            if last_match['cs_at_10'] < 80:
                review["agenda_items"].append({"title": "Early Lane Pressure", "description": f"CS@10 was low ({last_match['cs_at_10']}). Review wave management pre-6 minutes.", "priority": "HIGH", "timestamp": "06:00"})
            
            if last_match['gold_diff_at_10'] < 0:
                review["agenda_items"].append({"title": "Early Trade Efficiency", "description": f"Gold deficit at 10m ({last_match['gold_diff_at_10']}). Review trading patterns and jungle proximity.", "priority": "MEDIUM", "timestamp": "10:00"})
            
            if not last_match['first_blood_participation']:
                review["agenda_items"].append({"title": "First Blood Setup", "description": "Zero involvement in FB. Review jungle pathing and lane priority at 3:15.", "priority": "LOW", "timestamp": "03:15"})
                
            if last_match['tower_damage_contribution'] < 500:
                review["agenda_items"].append({"title": "Macro Objective Focus", "description": "Low tower damage contribution. Review rotations after securing kills or forcing recalls.", "priority": "MEDIUM", "timestamp": "15:45"})

            if not review["agenda_items"]:
                review["agenda_items"].append({"title": "Overall Performance", "description": "Solid fundamentals. Focus on maintaining consistency in next series.", "priority": "LOW", "timestamp": "20:00"})

        return jsonify(review)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/players/<player_id>/hypothetical', methods=['POST'])
def get_hypothetical_prediction(player_id):
    """Answer 'what if' questions about past strategic decisions"""
    try:
        data = request.json
        question = data.get('question', '').lower()
        
        # Simple AI-like reasoning for 'what if' questions based on the document examples
        scenarios = []
        if 'drake' in question or 'dragon' in question:
            prediction = "Analyzing the game state (gold, items, levels, vision, other objectives)... 85% probability of 2 turret kills and +200 XP advantage per player if conceded, versus 22% probability of winning the fight. Saving weapons/HP was the superior strategic choice."
            scenarios = [
                {"label": "Scenario A: Concede & Push", "probability": 85, "outcome": "+200 XP/player, 2 Turrets"},
                {"label": "Scenario B: Force Contest", "probability": 22, "outcome": "High wipe risk, objective coinflip"},
                {"label": "Scenario C: Late Rotate", "probability": 38, "outcome": "May secure objective, likely lose 2-3 players"}
            ]
        elif 'retake' in question or 'save' in question:
            prediction = "The 3v5 retake had a 15% probability of success. Conceding the round and saving 3 rifles would have given the team a 60% chance to win the following gun round, versus the 35% chance they had on a broken buy. Saving was the superior strategic choice."
            scenarios = [
                {"label": "Scenario A: Concede & Save", "probability": 60, "outcome": "Full buy next round"},
                {"label": "Scenario B: Force Retake", "probability": 15, "outcome": "Round win unlikely, broken economy"},
                {"label": "Scenario C: Play for exit kills", "probability": 45, "outcome": "Damage enemy economy, save 1-2 rifles"}
            ]
        elif 'baron' in question or 'nashor' in question:
            if 'bot' in question or 'push' in question:
                prediction = "Pushing bot lane at 25:30 while Baron was up created a cross-map trade opportunity. However, the enemy team secured Baron in 22 seconds, which is faster than your team could take the Tier-2 tower. Contesting would have been 15% successful, but a 4-1 split with better vision would have given a 55% win probability."
                scenarios = [
                    {"label": "Scenario A: 4-1 Split Push", "probability": 55, "outcome": "Tier-2 tower, Mid priority"},
                    {"label": "Scenario B: Direct Contest", "probability": 15, "outcome": "Low steal chance, likely wipe"},
                    {"label": "Scenario C: Pushing Bot (Actual)", "probability": 42, "outcome": "Traded Tier-2 for Baron"}
                ]
            else:
                prediction = "Contesting Baron at that state had a 15% success rate. A 4-1 split push would have guaranteed a Tier-2 tower and mid priority, leading to a 55% win probability in the subsequent teamfight."
                scenarios = [
                    {"label": "Scenario A: 4-1 Split Push", "probability": 55, "outcome": "Tier-2 tower, Mid priority"},
                    {"label": "Scenario B: Direct Contest", "probability": 15, "outcome": "Low steal chance, likely wipe"},
                    {"label": "Scenario C: Bait & Engage", "probability": 42, "outcome": "Possible pick-off before objective"}
                ]
        elif 'cs' in question or 'lane' in question:
            prediction = "If you had focused on the wave instead of the trade at 8:45, you would have entered the first back with +450 gold, enabling a completed core item for the first objective fight."
            scenarios = [
                {"label": "Scenario A: Wave Focus", "probability": 72, "outcome": "+450 gold, Core item power spike"},
                {"label": "Scenario B: Trade/Kill Focus", "probability": 48, "outcome": "Possible kill, high risk of missing 2 waves"},
                {"label": "Scenario C: Freeze & Call Jungle", "probability": 65, "outcome": "Secure XP lead, safe farm"}
            ]
        else:
            prediction = "Based on historical data for this role and matchup, the alternative decision had a 65% higher probability of a positive outcome. Detailed simulation suggests better objective priority was needed."
            scenarios = [
                {"label": "Scenario A: Current Play", "probability": 40, "outcome": "Current result"},
                {"label": "Scenario B: Alternative Path", "probability": 65, "outcome": "Improved objective priority"},
                {"label": "Scenario C: Defensive Reset", "probability": 52, "outcome": "Preserve tempo, reset vision"}
            ]
            
        return jsonify({
            "prediction": prediction,
            "scenarios": scenarios
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/players/<player_id>/improvement-plan', methods=['GET'])
def get_improvement_plan(player_id):
    """Generate personalized improvement plan with priority and success metrics"""
    try:
        plan = {
            'focus_areas': [
                {
                    'skill': 'CS @ 10',
                    'current_percentile': 45,
                    'target_percentile': 75,
                    'priority': 'HIGH',
                    'time_to_improve': '2-3 weeks',
                    'success_metric': 'Average 8.5+ CS/min in 5 consecutive games',
                    'recommendations': [
                        'Practice last-hitting in training mode for 15 min daily',
                        'Watch VODs of pro mid-laners and note their wave management',
                        'Focus on reset timings to minimize CS loss'
                    ]
                },
                {
                    'skill': 'Vision Score',
                    'current_percentile': 52,
                    'target_percentile': 70,
                    'priority': 'MEDIUM',
                    'time_to_improve': '1-2 weeks',
                    'success_metric': 'Vision score per minute consistently above 1.2',
                    'recommendations': [
                        'Buy at least 2 control wards per game',
                        'Study optimal deep ward placements for lane safety',
                        'Track enemy jungler and ward their likely paths'
                    ]
                }
            ],
            'goals': [
                {
                    'title': 'Reach 75th percentile in CS@10',
                    'current': 45,
                    'target': 75,
                    'progress': 30
                },
                {
                    'title': 'Maintain 70%+ Kill Participation',
                    'current': 65,
                    'target': 70,
                    'progress': 80
                }
            ]
        }
        
        return jsonify(plan)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/players/<player_id>/history', methods=['GET'])
def get_match_history(player_id):
    """Get recent match history with detailed stats"""
    try:
        query = """
            SELECT 
                created_at as game_date,
                game_result,
                champion,
                kda,
                cs_at_10
            FROM player_micro_skills
            WHERE player_id = %s
            ORDER BY created_at DESC
            LIMIT 10
        """
        df = pd.read_sql(query, engine, params=(player_id,))
        
        if df.empty:
            # Mock history
            import datetime
            import random
            today = datetime.date.today()
            history = []
            champions = ['Azir', 'Ahri', 'Syndra', 'Orianna', 'LeBlanc']
            for i in range(10):
                date = (today - datetime.timedelta(days=i)).isoformat()
                k, d, a = random.randint(1, 10), random.randint(1, 8), random.randint(1, 15)
                history.append({
                    'game_date': date,
                    'game_result': random.choice(['WIN', 'LOSS']),
                    'champion': random.choice(champions),
                    'kills': k,
                    'deaths': d,
                    'assists': a,
                    'kda': (k + a) / max(d, 1),
                    'cs_at_10': 75 + random.randint(-10, 15)
                })
            return jsonify(history)
            
        return jsonify(df.to_dict('records'))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/players/<player_id>/champions', methods=['GET'])
def get_champion_stats(player_id):
    """Get performance breakdown by champion"""
    try:
        query = """
            SELECT 
                champion,
                COUNT(*) as games,
                AVG(kda) as avg_kda,
                AVG(cs_at_10) as avg_cs_at_10,
                SUM(CASE WHEN game_result = 'WIN' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as win_rate
            FROM player_micro_skills
            WHERE player_id = %s
            GROUP BY champion
            ORDER BY games DESC
        """
        df = pd.read_sql(query, engine, params=(player_id,))
        
        if df.empty:
            # Mock champion stats
            import random
            champions = ['Ahri', 'Syndra', 'Orianna', 'Azir', 'LeBlanc']
            stats = []
            for champ in champions:
                games = random.randint(5, 20)
                stats.append({
                    'champion': champ,
                    'games': games,
                    'avg_kda': random.uniform(2.5, 5.0),
                    'avg_cs_at_10': random.uniform(70, 90),
                    'win_rate': random.uniform(45, 65),
                    'percentile': random.randint(50, 95)
                })
            return jsonify(stats)
            
        # In a real app, we'd calculate percentiles here too
        stats = df.to_dict('records')
        for s in stats:
            s['percentile'] = 60 + (s['win_rate'] / 10) # Simple mock percentile
            
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/sync', methods=['POST'])
def sync_grid_data():
    """Trigger data sync from GRID API to database"""
    try:
        limit = request.json.get('limit', 10) if request.json else 10
        
        # Run the ETL pipeline
        etl.run_ingestion(title_id=3, limit=limit)
        
        return jsonify({
            'status': 'success',
            'message': f'Synced {limit} series from GRID API'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/init-db', methods=['POST'])
def init_database():
    """Initialize database tables"""
    try:
        from sqlalchemy import text
        
        # Read and execute schema
        schema_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'database_schema.sql')
        
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
        
        # Execute each statement separately
        with engine.connect() as conn:
            for statement in schema_sql.split(';'):
                statement = statement.strip()
                if statement:
                    conn.execute(text(statement))
            conn.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Database tables created successfully'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)

