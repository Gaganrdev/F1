import fastf1
import json
import os
import sys

# Disable logging for cleaner output
cache_dir = os.path.join(os.path.dirname(__file__), 'cache')
os.makedirs(cache_dir, exist_ok=True)
fastf1.Cache.enable_cache(cache_dir)

def get_schedule():
    try:
        # In a real app we'd get the actual next/current event, but for simplicity of demo we'll use a reliable past one
        # or attempt to get the latest.
        # Let's try to get the current season's next event:
        import pandas as pd
        now = pd.Timestamp.utcnow().tz_localize(None)
        schedule = fastf1.get_event_schedule(now.year)
        
        # Filter out testing events
        schedule = schedule[schedule['EventFormat'] != 'testing']
        
        # Find the next event
        # Add a 1-day buffer to EventDate so the scheduled race stays visible throughout the race day
        future_events = schedule[schedule['EventDate'] >= now - pd.Timedelta(days=1)]
        next_event = future_events.iloc[0] if len(future_events) > 0 else schedule.iloc[-1]
        
        event_dict = {
            "name": str(next_event['EventName']),
            "country": str(next_event['Country']),
            "location": str(next_event['Location']),
            "date": str(next_event['EventDate'].date()),
            "sessions": {
                "fp1": str(next_event['Session1Date']),
                "fp2": str(next_event['Session2Date']),
                "fp3": str(next_event['Session3Date']),
                "qualifying": str(next_event['Session4Date']),
                "race": str(next_event['Session5Date'])
            }
        }
        print(json.dumps(event_dict))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    get_schedule()
