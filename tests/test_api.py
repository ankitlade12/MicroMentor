import pytest
import os
import sys

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.app import app


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_health_check(client):
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.json['status'] == 'healthy'


def test_player_profile(client):
    response = client.get('/api/players/test_player/profile')
    assert response.status_code == 200
    assert response.json['player_id'] == 'test_player'


def test_micro_skills(client):
    response = client.get('/api/players/test_player/micro-skills')
    assert response.status_code == 200
    assert 'laning_phase' in response.json


def test_benchmarks(client):
    response = client.get('/api/players/test_player/benchmarks?role=mid')
    assert response.status_code == 200
    assert 'cs_at_10' in response.json
