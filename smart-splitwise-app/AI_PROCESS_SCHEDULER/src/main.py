# src/main.py
import psutil
import time
import random
import subprocess
from rich.console import Console
from rich.table import Table
from rich.live import Live
from src.ml_predictor import predict_best_time_slice

console = Console()

# ===============================
# SYSTEM PROCESS COLLECTION
# ===============================
def get_processes():
    """Fetch live system processes and return as list of dictionaries."""
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


# ===============================
# REAL OS CONTROL (NEW FUNCTION)
# ===============================
def apply_os_scheduling(pid, predicted_slice):
    """
    Apply OS-level scheduling based on the ML-predicted time slice.
    Smaller predicted_slice -> higher priority (lower nice value).
    Uses psutil and chrt to modify real scheduling parameters.
    """
    try:
        # Determine action from predicted time slice
        if predicted_slice < 100:
            # High priority (SJF-like) -> Real-time FIFO
            subprocess.run(['sudo', 'chrt', '-f', '-p', '50', str(pid)],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        elif predicted_slice < 200:
            # Medium priority (Priority Scheduling) -> RR Policy
            subprocess.run(['sudo', 'chrt', '-r', '-p', '30', str(pid)],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            # Low priority (Round Robin-like) -> normal policy + nice
            p = psutil.Process(pid)
            p.nice(10)

    except psutil.NoSuchProcess:
        pass
    except psutil.AccessDenied:
        console.print(f"[yellow][WARN][/yellow] Permission denied for PID {pid}")
    except Exception as e:
        console.print(f"[red][ERROR][/red] Failed to change PID {pid}: {e}")


# ===============================
# ML-DRIVEN SCHEDULER
# ===============================
def ml_driven_scheduler(processes):
    """Use trained ML model to predict best time slice for each process."""
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

        # Predict best time slice using ML model
        prediction = predict_best_time_slice(process_data)
        p['predicted_time_slice'] = prediction

        # 🧩 Apply actual OS-level scheduling
        apply_os_scheduling(p['pid'], prediction)

        scheduled.append(p)
    return scheduled


# ===============================
# ALGORITHM NAME DECIDER
# ===============================
def get_algorithm_name(avg_time_slice):
    if avg_time_slice < 100:
        return "SJF"
    elif avg_time_slice < 200:
        return "PRIORITY"
    else:
        return "ROUND ROBIN"


# ===============================
# RICH TABLE DISPLAY
# ===============================
def display_table(processes):
    """Display live process data and AI-predicted scheduling decisions."""
    avg_slice = sum(p.get('predicted_time_slice', 0) for p in processes) / max(len(processes), 1)
    algo_name = get_algorithm_name(avg_slice)

    table = Table(
        title=f"🤖 AI-Based Process Scheduler  |  Active Algorithm: [bold cyan]{algo_name}[/bold cyan]"
    )
    table.add_column("PID", justify="right", style="cyan")
    table.add_column("Process Name", style="magenta")
    table.add_column("CPU %", justify="right", style="green")
    table.add_column("Memory (MB)", justify="right", style="yellow")
    table.add_column("Predicted Slice (ms)", justify="right", style="red")

    for p in processes[:10]:
        slice_val = p.get('predicted_time_slice', 0)
        color = "green" if slice_val < 100 else "yellow" if slice_val < 200 else "red"
        table.add_row(
            str(p['pid']),
            p['name'],
            f"{p['cpu']:.2f}",
            f"{p['memory']:.2f}",
            f"[{color}]{slice_val:.2f}[/{color}]"
        )

    return table


# ===============================
# MAIN FUNCTION
# ===============================
def main():
    console.print("[bold blue]AI Process Scheduler Running...[/bold blue]")
    for proc in psutil.process_iter():
        proc.cpu_percent(None)
    time.sleep(1)

    with Live(console=console, refresh_per_second=1) as live:
        while True:
            processes = get_processes()
            if not processes:
                live.update("[red]No processes found![/red]")
                time.sleep(2)
                continue

            scheduled = ml_driven_scheduler(processes)
            table = display_table(scheduled)
            live.update(table)

            time.sleep(3)


# ===============================
# ENTRY POINT
# ===============================
if __name__ == "__main__":
    main()
