# src/ml_predictor.py
import joblib
import pandas as pd
import os
import warnings

# Suppress scikit-learn version warnings
warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", category=FutureWarning)

# Dynamically locate your trained ML model file
model_path = os.path.join(os.path.dirname(__file__), "..", "models", "Random_Forest.pkl")

# Load the model safely
try:
    model = joblib.load(model_path)
    print(f"[INFO] Loaded model from: {model_path}")
except FileNotFoundError:
    raise FileNotFoundError(f"[ERROR] Model not found at: {model_path}. Please ensure Random_Forest.pkl exists.")
except Exception as e:
    raise RuntimeError(f"[ERROR] Failed to load model: {e}")

# Define features (must match those used during model training)
FEATURES = [
    'priority',
    'cpu_burst_est',
    'io_burst_est',
    'arrival_time',
    'memory_req',
    'total_cpu_used',
    'waiting_time',
    'turnaround_time'
]

def predict_best_time_slice(process_data: dict) -> float:
    """
    Predicts the best CPU time slice (in milliseconds) for a process
    using the trained Random Forest model.

    Parameters:
        process_data (dict): Dictionary containing all feature values.
            Example:
                {
                    'priority': 5,
                    'cpu_burst_est': 300,
                    'io_burst_est': 100,
                    'arrival_time': 50000,
                    'memory_req': 200,
                    'total_cpu_used': 320,
                    'waiting_time': 2500,
                    'turnaround_time': 4000
                }

    Returns:
        float: Predicted best time slice.
    """
    try:
        # Convert single dictionary into a DataFrame row
        df = pd.DataFrame([process_data], columns=FEATURES)

        # Predict with model
        prediction = model.predict(df)[0]

        return float(prediction)

    except Exception as e:
        print(f"[ERROR] Prediction failed: {e}")
        return 0.0


# Optional: Run quick test when executed directly
if __name__ == "__main__":
    sample = {
        'priority': 5,
        'cpu_burst_est': 300,
        'io_burst_est': 100,
        'arrival_time': 50000,
        'memory_req': 200,
        'total_cpu_used': 320,
        'waiting_time': 2500,
        'turnaround_time': 4000
    }
    print("[TEST] Sample Prediction:", predict_best_time_slice(sample))