import fastf1
import json
import os
import sys

# Disable logging for cleaner output
fastf1.Cache.enable_cache(os.path.join(os.path.dirname(__file__), 'cache'))

def get_track_map():
    try:
        import datetime
        now = datetime.datetime.now()
        schedule = fastf1.get_event_schedule(now.year)
        
        # Get past events up to now
        past_events = schedule[schedule['EventDate'] <= now]
        if len(past_events) == 0:
            past_events = fastf1.get_event_schedule(now.year - 1)
            event = past_events.iloc[-1]
        else:
            event = past_events.iloc[-1]
            
        try:
            # Always get track map from 2023 or 2024 to ensure data is available
            # since track layouts don't change often.
            session = fastf1.get_session(2023, event['EventName'], 'Q')
            session.load(telemetry=True, weather=False, messages=False)
            fastest_lap = session.laps.pick_fastest()
            telemetry = fastest_lap.telemetry
        except Exception:
            session = fastf1.get_session(2023, 1, 'Q')
            session.load(telemetry=True, weather=False, messages=False)
            fastest_lap = session.laps.pick_fastest()
            telemetry = fastest_lap.telemetry

        x = telemetry['X'].tolist()
        y = telemetry['Y'].tolist()
        
        step = 10
        downsampled_x = x[::step]
        downsampled_y = y[::step]

        data = {
            "track_name": event['EventName'],
            "coordinates": {
                "x": downsampled_x,
                "y": downsampled_y
            }
        }
        
        print(json.dumps(data))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    get_track_map()
