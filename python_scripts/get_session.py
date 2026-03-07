import fastf1
import json
import os
import sys

# Disable logging for cleaner output
cache_dir = os.path.join(os.path.dirname(__file__), 'cache')
os.makedirs(cache_dir, exist_ok=True)
fastf1.Cache.enable_cache(cache_dir)

def get_latest_session():
    try:
        import datetime
        import pandas as pd
        now = pd.Timestamp.utcnow().tz_localize(None)
        schedule = fastf1.get_event_schedule(now.year)
        
        # Filter out testing events which often lack proper results
        schedule = schedule[schedule['EventFormat'] != 'testing']
        
        # Get events where the weekend has started (Practice 1 has occurred)
        past_events = schedule[schedule['Session1DateUtc'] <= now]
        
        if len(past_events) == 0:
            past_events = fastf1.get_event_schedule(now.year - 1)
            past_events = past_events[past_events['EventFormat'] != 'testing']
            
        event = past_events.iloc[-1]
            
        # Try to load the most recent session in reverse chronological order
        sessions_to_try = ['R', 'Q', 'SQ', 'SS', 'S', 'FP3', 'FP2', 'FP1']
        session = None
        
        for s in sessions_to_try:
            try:
                candidate_session = fastf1.get_session(event['EventDate'].year, event['EventName'], s)
                # Check if this session's date has passed
                session_key = ''
                # FastF1 returns sessions like Session1, Session2, etc. It's tricky.
                # Just try to load it. If it hasn't happened yet, it might raise an exception or return empty results.
                candidate_session.load(telemetry=False, weather=False)
                if hasattr(candidate_session, 'results') and not candidate_session.results.empty:
                    session = candidate_session
                    break
            except Exception:
                continue
                
        if not session:
             raise Exception("No valid session results found for the latest event.")

        results = session.results
        
        top_10 = []
        leader_time = None  # Store leader's time for gap calculation
        
        for index, row in results.head(24).iterrows():
            time_str = "DNF"
            gap_str = ""
            
            # Identify the best time string based on session type
            if 'Time' in row and not pd.isna(row['Time']):
                time_str = str(row['Time'])
            elif 'Q3' in row and not pd.isna(row['Q3']):
                time_str = str(row['Q3'])
            elif 'Q2' in row and not pd.isna(row['Q2']):
                time_str = str(row['Q2'])
            elif 'Q1' in row and not pd.isna(row['Q1']):
                time_str = str(row['Q1'])
            elif 'Status' in row and not pd.isna(row['Status']):
                time_str = str(row['Status'])

            # Clean up the output to look like '01:23.456'
            time_parts = time_str.split()
            if time_parts:
                time_str = time_parts[-1] # Grabs final part after '0 days' if present
                if '.' in time_str and len(time_str.split('.')[1]) > 3:
                    parts = time_str.split('.')
                    time_str = f"{parts[0]}.{parts[1][:3]}"
            else:
                time_str = "DNF"
                
            if time_str == "NaT":
                time_str = str(row.get('Status', 'DNF'))

            # Calculate gap from leader
            try:
                # Try to get the raw timedelta for gap computation
                raw_time = None
                for col in ['Q3', 'Q2', 'Q1', 'Time']:
                    if col in row and not pd.isna(row[col]):
                        raw_time = row[col]
                        break
                        
                if raw_time is not None:
                    total_seconds = raw_time.total_seconds()
                    if leader_time is None:
                        leader_time = total_seconds
                        gap_str = "LEADER"
                    else:
                        diff = total_seconds - leader_time
                        gap_str = f"+{diff:.3f}s" if diff >= 0 else ""
            except Exception:
                pass

            try:
                pos = int(row['Position'])
            except (ValueError, TypeError):
                pos = 99

            top_10.append({
                "position": pos,
                "driver": str(row['BroadcastName']),
                "team": str(row['TeamName']),
                "time": time_str,
                "gap": gap_str,
                "color": f"#{row['TeamColor']}" if row['TeamColor'] else "#ffffff"
            })
            
        data = {
            "session_name": f"{event['EventName']} - {session.name}",
            "session_type": session.session_type if hasattr(session, 'session_type') else s,
            "results": top_10
        }
        
        print(json.dumps(data))
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    import pandas as pd # Ensure pandas is available for isna
    get_latest_session()
