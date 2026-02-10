from fastapi import FastAPI
from pydantic import BaseModel
from core.forecaster import predict_budget

app = FastAPI()

class ExpenseData(BaseModel):
    daily_totals: list[float]

@app.get("/")
def home():
    return {"status": "ML Service is Online"}

@app.post("/predict")
def get_prediction(data: ExpenseData):
    result = predict_budget(data.daily_totals)
    return result

# To run: uvicorn main:app --reload --port 8000