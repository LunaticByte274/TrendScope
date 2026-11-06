import duckdb
import threading
from app.config import SNAPSHOTS_PARQUET, UNIQUE_VIDEOS_PARQUET

class Database:
    _instance = None
    _con = None
    _lock = threading.Lock()

    @classmethod
    def get_connection(cls):
        with cls._lock:
            if cls._con is None:
                cls._con = duckdb.connect(database=":memory:")
                # Create views over the clean parquet files
                cls._con.execute(f"CREATE VIEW snapshots AS SELECT * FROM read_parquet('{SNAPSHOTS_PARQUET}')")
                cls._con.execute(f"CREATE VIEW unique_videos AS SELECT * FROM read_parquet('{UNIQUE_VIDEOS_PARQUET}')")
        return cls._con.cursor()

db = Database()

