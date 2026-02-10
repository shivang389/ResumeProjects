from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
import calendar

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # 1. Receive Data: Expecting list of objects: { "date": "2024-01-25", "amount": 500 }
        raw_data = request.json.get('data', [])
        
        # If no data, return empty
        if not raw_data:
            return jsonify({'forecast': [], 'total_forecast': 0, 'msg': 'No data'})

        # 2. Convert to DataFrame & Feature Engineering
        df = pd.DataFrame(raw_data)
        df['date'] = pd.to_datetime(df['date'])
        
        # Aggregate by date (in case multiple expenses on one day)
        df = df.groupby('date')['amount'].sum().reset_index()

        # --- THE SMART AI PART ---
        # We teach the AI about Time, Seasons, and Weekends
        df['day_ordinal'] = df['date'].map(datetime.toordinal) # Linear time
        df['day_of_month'] = df['date'].dt.day
        df['day_of_week'] = df['date'].dt.dayofweek # 0=Mon, 6=Sun
        df['is_weekend'] = df['day_of_week'].apply(lambda x: 1 if x >= 5 else 0) # 1 if Sat/Sun
        df['month'] = df['date'].dt.month # Seasonality Proxy

        # Features (X) and Target (y)
        X = df[['day_ordinal', 'day_of_week', 'is_weekend', 'month']]
        y = df['amount']

        # 3. Train the Model
        # As more users add data, this model gets smarter every time it runs.
        model = LinearRegression()
        model.fit(X, y)

        # 4. Calculate "Remaining Days" of the Current Month
        today = datetime.now()
        last_day_num = calendar.monthrange(today.year, today.month)[1]
        last_day_date = datetime(today.year, today.month, last_day_num)
        
        # If today is the last day, predict next month instead
        if today.day == last_day_num:
            next_month = today.replace(day=28) + timedelta(days=4)
            start_date = next_month.replace(day=1)
            last_day_num = calendar.monthrange(next_month.year, next_month.month)[1]
            end_date = next_month.replace(day=last_day_num)
        else:
            start_date = today + timedelta(days=1)
            end_date = last_day_date

        # Generate Future Dates
        future_dates = pd.date_range(start=start_date, end=end_date)
        
        if len(future_dates) == 0:
             return jsonify({'forecast': [], 'total_forecast': 0})

        # 5. Prepare Future Features for Prediction
        future_df = pd.DataFrame({'date': future_dates})
        future_df['day_ordinal'] = future_df['date'].map(datetime.toordinal)
        future_df['day_of_week'] = future_df['date'].dt.dayofweek
        future_df['is_weekend'] = future_df['day_of_week'].apply(lambda x: 1 if x >= 5 else 0)
        future_df['month'] = future_df['date'].dt.month

        # 6. Predict
        X_future = future_df[['day_ordinal', 'day_of_week', 'is_weekend', 'month']]
        predictions = model.predict(X_future)
        
        # Clean up results (No negative money, round to 2 decimals)
        predictions = [max(0, round(float(p), 2)) for p in predictions]

        return jsonify({
            'forecast': predictions,
            'total_forecast': round(sum(predictions), 2),
            'days_predicted': len(predictions),
            'note': 'Includes weekend and seasonal adjustments'
        })

    except Exception as e:
        print("AI Error:", e)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5002, debug=True)