import os
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv
load_dotenv()
db_url = os.getenv('DATABASE_URL')
if not db_url:
    print('DATABASE_URL not set')
    exit(1)
try:
    engine = create_engine(db_url)
    df = pd.read_sql('SELECT COUNT(*) FROM player_micro_skills', engine)
    print(f'Count: {df.iloc[0,0]}')
    
    df_preview = pd.read_sql('SELECT * FROM player_micro_skills LIMIT 5', engine)
    print("Preview:")
    print(df_preview)
except Exception as e:
    print(f'Error: {e}')
