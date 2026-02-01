from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import pandas as pd
import joblib
import numpy as np
from typing import Tuple, List


class PerformancePredictor:
    """Predict future performance based on recent trends"""
    
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.is_trained = False
    
    def prepare_features(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare features for training"""
        feature_cols = [
            'cs_at_10', 'gold_diff_at_10', 'vision_score_per_min',
            'kill_participation', 'damage_per_gold'
        ]
        
        # Create rolling averages as features
        for col in feature_cols:
            if col in df.columns:
                df[f'{col}_rolling_3'] = df.groupby('player_id')[col].transform(
                    lambda x: x.rolling(3, min_periods=1).mean()
                )
                df[f'{col}_rolling_5'] = df.groupby('player_id')[col].transform(
                    lambda x: x.rolling(5, min_periods=1).mean()
                )
        
        # Target: next game performance (overall score)
        if 'kda' in df.columns:
            df['next_game_kda'] = df.groupby('player_id')['kda'].shift(-1)
            # Drop rows without target
            df = df.dropna(subset=['next_game_kda'])
            y = df['next_game_kda'].values
        else:
            y = np.array([])
        
        feature_columns = [c for c in df.columns if '_rolling_' in c]
        X = df[feature_columns].values
        
        return X, y
    
    def train(self, df: pd.DataFrame):
        """Train the prediction model"""
        X, y = self.prepare_features(df)
        
        if len(X) < 10:
            print("Not enough data to train")
            return

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        self.model.fit(X_train, y_train)
        self.is_trained = True
        
        # Evaluate
        train_score = self.model.score(X_train, y_train)
        test_score = self.model.score(X_test, y_test)
        
        print(f"Train R²: {train_score:.3f}")
        print(f"Test R²: {test_score:.3f}")
    
    def predict_next_performance(self, player_recent_stats: pd.DataFrame) -> float:
        """Predict next game performance"""
        if not self.is_trained:
            # Try to load model if not trained
            try:
                self.load_model()
            except Exception:
                return 0.0
        
        X, _ = self.prepare_features(player_recent_stats)
        if len(X) == 0:
            return 0.0
            
        prediction = self.model.predict(X[-1:])
        
        return float(prediction[0])
    
    def save_model(self, path: str = 'models/performance_predictor.joblib'):
        """Save trained model"""
        joblib.dump(self.model, path)
    
    def load_model(self, path: str = 'models/performance_predictor.joblib'):
        """Load trained model"""
        if os.path.exists(path):
            self.model = joblib.load(path)
            self.is_trained = True
        else:
            raise FileNotFoundError(f"No model found at {path}")

import os
