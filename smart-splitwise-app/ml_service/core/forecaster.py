import numpy as np
from sklearn.linear_model import LinearRegression

def predict_budget(daily_totals, days_to_predict=7):
    # If not enough data, return 0 prediction
    if len(daily_totals) < 2:
        return {"projected": [], "total_forecast": 0}

    # Prepare Data
    # X = Day 0, Day 1, Day 2...
    X = np.array(range(len(daily_totals))).reshape(-1, 1)
    # y = Amount spent
    y = np.array(daily_totals)

    # Train Model
    model = LinearRegression()
    model.fit(X, y)

    # Predict Future
    last_day = len(daily_totals)
    future_X = np.array(range(last_day, last_day + days_to_predict)).reshape(-1, 1)
    predictions = model.predict(future_X)

    # Clean results (no negative spending)
    predictions = [max(0, round(p, 2)) for p in predictions]

    return {
        "projected": predictions,
        "total_forecast": sum(predictions)
    }