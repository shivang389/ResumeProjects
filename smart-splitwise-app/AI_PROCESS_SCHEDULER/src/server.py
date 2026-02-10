from flask import Flask, render_template, jsonify
import psutil
import random
import time
import os
from src.ml_predictor import predict_best_time_slice

import os
app = Flask(__name__, template_folder=os.path.join(os.path.dirname(__file__), "templates"))

def get_processes():
    processes = []
    for p in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
        try:
            info = p.info
            processes.append({
                'pid': info['pid'],
                'name': info['name'][:25] if info['name'] else 'Unknown',
                'cpu': info['cpu_percent'],
                'memory': round(info['memory_info'].rss / (1024 * 1024), 2)
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    return processes

def ml_driven_scheduler(processes):
    scheduled = []
    for p in processes:
        process_data = {
            'priority': random.randint(1, 10),
            'cpu_burst_est': max(p.get('cpu', 0), 1),
            'io_burst_est': random.randint(50, 300),
            'arrival_time': random.randint(1000, 90000),
            'memory_req': p.get('memory', 0),
            'total_cpu_used': max(p.get('cpu', 0), 1),
            'waiting_time': random.randint(1000, 5000),
            'turnaround_time': random.randint(3000, 8000)
        }
        prediction = predict_best_time_slice(process_data)
        p['predicted_time_slice'] = prediction
        scheduled.append(p)
    return scheduled

def get_algorithm_name(avg_time_slice):
    if avg_time_slice < 100:
        return "SJF"
    elif avg_time_slice < 200:
        return "PRIORITY"
    else:
        return "ROUND ROBIN"

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/processes")
def api_processes():
    processes = get_processes()
    scheduled = ml_driven_scheduler(processes)
    avg_slice = sum(p.get('predicted_time_slice', 0) for p in scheduled) / max(len(scheduled), 1)
    algo_name = get_algorithm_name(avg_slice)
    return jsonify({"algorithm": algo_name, "processes": scheduled})

if __name__ == "__main__":
    print("🚀 Starting AI Process Scheduler Web Server...")
    app.run(debug=True, host="0.0.0.0", port=5000)