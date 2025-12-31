# src/algorithm.py
import random

# ============================================================
# 1️⃣ Shortest Job First (SJF)
# ============================================================
def sjf_schedule(processes):
    """
    Shortest Job First Scheduling:
    Sorts processes based on estimated CPU burst time.
    Lower CPU burst = higher priority.
    """
    sorted_processes = sorted(processes, key=lambda x: x.get('cpu_burst', x.get('cpu', 0)))
    for i, p in enumerate(sorted_processes):
        p['waiting_time'] = sum(q.get('cpu_burst', q.get('cpu', 0)) for q in sorted_processes[:i])
        p['turnaround_time'] = p['waiting_time'] + p.get('cpu_burst', p.get('cpu', 0))
    return sorted_processes


# ============================================================
# 2️⃣ First Come First Serve (FCFS)
# ============================================================
def fcfs_schedule(processes):
    """
    FCFS Scheduling:
    Processes are scheduled in the order they arrived.
    """
    sorted_processes = sorted(processes, key=lambda x: x.get('arrival_time', 0))
    total_time = 0
    for p in sorted_processes:
        p['waiting_time'] = total_time - p.get('arrival_time', 0)
        if p['waiting_time'] < 0:
            p['waiting_time'] = 0
        total_time += p.get('cpu_burst', p.get('cpu', 0))
        p['turnaround_time'] = p['waiting_time'] + p.get('cpu_burst', p.get('cpu', 0))
    return sorted_processes


# ============================================================
# 3️⃣ Priority Scheduling
# ============================================================
def priority_schedule(processes):
    """
    Priority Scheduling:
    Higher priority (smaller number) = executed earlier.
    """
    sorted_processes = sorted(processes, key=lambda x: x.get('priority', random.randint(1, 10)))
    total_time = 0
    for p in sorted_processes:
        p['waiting_time'] = total_time
        total_time += p.get('cpu_burst', p.get('cpu', 0))
        p['turnaround_time'] = p['waiting_time'] + p.get('cpu_burst', p.get('cpu', 0))
    return sorted_processes


# ============================================================
# 4️⃣ Round Robin Scheduling
# ============================================================
def round_robin_schedule(processes, time_quantum=100):
    """
    Round Robin Scheduling:
    Each process gets an equal share of CPU time (time_quantum).
    """
    queue = processes.copy()
    time = 0
    while any(p.get('cpu_burst', p.get('cpu', 0)) > 0 for p in queue):
        for p in queue:
            if p.get('cpu_burst', p.get('cpu', 0)) > 0:
                if p['cpu_burst'] > time_quantum:
                    p['cpu_burst'] -= time_quantum
                    time += time_quantum
                else:
                    time += p['cpu_burst']
                    p['cpu_burst'] = 0
                    p['turnaround_time'] = time
                    p['waiting_time'] = p['turnaround_time'] - p.get('original_burst', time)
    return queue


# ============================================================
# 5️⃣ AI / ML-Based Scheduling (integrated from model)
# ============================================================
def ai_schedule(processes, model=None):
    """
    AI-Based Scheduling:
    Uses ML model to predict burst time and prioritize accordingly.
    If no model is passed, defaults to SJF.
    """
    if model:
        for p in processes:
            p['predicted_burst'] = model.predict([[p.get('cpu', 0), p.get('memory', 0)]])[0]
        sorted_processes = sorted(processes, key=lambda x: x['predicted_burst'])
    else:
        sorted_processes = sjf_schedule(processes)

    # compute wait and turnaround
    total = 0
    for p in sorted_processes:
        p['waiting_time'] = total
        total += p.get('predicted_burst', p.get('cpu', 0))
        p['turnaround_time'] = total
    return sorted_processes
