import requests
import os
from typing import Dict, List, Optional
from dotenv import load_dotenv
import logging

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class GRIDClient:
    """Client for interacting with GRID API"""
    
    def __init__(self):
        self.api_key = os.getenv('GRID_API_KEY')
        if self.api_key == "your_api_key_here":
            self.api_key = None
            
        # Use Open Access URL for Central Data (GraphQL)
        self.graphql_url = "https://api-op.grid.gg/central-data/graphql"
        
        # Use Full Access URL for other services (REST) if API key is provided
        self.base_url = os.getenv('GRID_API_URL', 'https://api.grid.gg').rstrip('/')
        
        self.headers = {
            'Content-Type': 'application/json'
        }
        if self.api_key:
            # Try Open Access first if Full Access gives Permission Denied
            # Actually, let's just stick to Open Access if API key doesn't grant enough perms
            self.headers['x-api-key'] = self.api_key
            # Use Open Access even with key if we aren't sure about Full Access permissions
            # self.graphql_url = "https://api-op.grid.gg/central-data/graphql" 
            # Actually, let's keep it as is but add a fallback in execute_query maybe?
            # For now, let's try to use the key with Open Access URL
            self.graphql_url = "https://api-op.grid.gg/central-data/graphql"
    
    def execute_query(self, query: str, variables: Optional[Dict] = None) -> Dict:
        """Execute a GraphQL query"""
        payload = {'query': query}
        if variables:
            payload['variables'] = variables
            
        try:
            response = requests.post(self.graphql_url, headers=self.headers, json=payload)
            if response.status_code != 200:
                logger.error(f"GraphQL error {response.status_code}: {response.text}")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"GraphQL query failed: {e}")
            return {}

    def fetch_series(self, 
                     title_id: int = 3,  # Default LoL
                     limit: int = 50,
                     types: str = 'ESPORTS') -> Dict:
        """Fetch series from GRID GraphQL API"""
        query = """
        query AllSeries($first: Int, $filter: SeriesFilter, $orderBy: SeriesOrderBy, $orderDirection: OrderDirection) {
            allSeries (
                first: $first,
                filter: $filter,
                orderBy: $orderBy,
                orderDirection: $orderDirection
            ) {
                totalCount
                pageInfo {
                    hasPreviousPage
                    hasNextPage
                    startCursor
                    endCursor
                }
                edges {
                    node {
                        id
                        title {
                            id
                        }
                        tournament {
                            id
                            name
                        }
                    }
                }
            }
        }
        """
        variables = {
            "first": limit,
            "filter": {
                "titleId": title_id,
                "types": types
            },
            "orderBy": "StartTimeScheduled",
            "orderDirection": "DESC"
        }
        return self.execute_query(query, variables)
    
    def fetch_matches(self, 
                     game: str = 'lol',
                     team_id: Optional[str] = None,
                     player_id: Optional[str] = None,
                     limit: int = 100) -> List[Dict]:
        """Fetch match data"""
        endpoint = f'{self.base_url}/matches'
        params = {'game': game, 'limit': limit}
        
        if team_id:
            params['team_id'] = team_id
        if player_id:
            params['player_id'] = player_id
        
        try:
            response = requests.get(endpoint, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {e}")
            return []
    
    def fetch_player_stats(self, player_id: str, season: Optional[str] = None) -> Dict:
        """Fetch detailed player statistics"""
        endpoint = f'{self.base_url}/players/{player_id}/stats'
        params = {}
        if season:
            params['season'] = season
        
        try:
            response = requests.get(endpoint, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch player stats: {e}")
            return {}
    
    def fetch_team_matches(self, team_id: str, limit: int = 50) -> List[Dict]:
        """Fetch all matches for a specific team"""
        return self.fetch_matches(team_id=team_id, limit=limit)


if __name__ == '__main__':
    # Test the client
    client = GRIDClient()
    print(f"Using GraphQL URL: {client.graphql_url}")
    print(f"Using Base URL: {client.base_url}")
    print(f"API Key present: {bool(client.api_key)}")
    
    print("\nTesting GraphQL (Series)...")
    series = client.fetch_series(limit=1)
    if series and series.get('data') and series.get('data').get('allSeries'):
        total = series.get('data').get('allSeries').get('totalCount')
        print(f"GraphQL success: {total} series found.")
    else:
        print("GraphQL failed or returned no data.")
        if series and 'errors' in series:
            print(f"Errors: {series['errors']}")
    
    print("\nTesting REST (Matches)...")
    matches = client.fetch_matches(limit=5)
    print(f"Fetched {len(matches)} matches")
