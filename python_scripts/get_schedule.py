import fastf1
import json
import os
import sys

# Disable logging for cleaner output
fastf1.Cache.enable_cache(os.path.join(os.path.dirname(__file__), 'cache'))

def get_schedule():
    try:
        # Get current year
        event = fastf1.get_event_schedule(2024).iloc[-2]  # Get a recent race for now as fallback if current is empty
        
        # In a real app we'd get the actual next/current event, but for simplicity of demo we'll use a reliable past one
        # or attempt to get the latest.
        # Let's try to get the current season's next event:
        import datetime
        now = datetime.datetime.now()
        schedule = fastf1.get_event_schedule(now.year)
        
        # Find the next event
        next_event = schedule[schedule['EventDate'] > now].iloc[0] if len(schedule[schedule['EventDate'] > now]) > 0 else schedule.iloc[-1]
        
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
