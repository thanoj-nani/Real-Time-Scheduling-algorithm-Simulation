# Real-Time-Scheduling-algorithm-Simulation
A real-time system is one where tasks must be completed within a specific time constraint (deadline).  Hard real-time: Missing a deadline = system failure (e.g., airbag system) Soft real-time: Missing a deadline reduces performance (e.g., video streaming) 
### 🔄 Overview

This simulator models how a CPU schedules and executes tasks in a real-time system. It follows a time-driven approach, where the system clock advances step-by-step and decisions are made at each time unit based on the selected scheduling algorithm.

---

### 📥 Step 1: Task Input

Each task is defined with the following parameters:

* **Arrival Time** – when the task enters the system
* **Execution Time (Burst Time)** – CPU time required
* **Deadline** – time by which the task must complete
* **Period (optional)** – for periodic tasks

Example:

```
T1: arrival=0, execution=2, deadline=4  
T2: arrival=1, execution=1, deadline=3  
T3: arrival=2, execution=2, deadline=6  
```

---

### 🧠 Step 2: Scheduling Algorithm Selection

The simulator supports multiple scheduling strategies:

* **Earliest Deadline First (EDF)** – selects task with nearest deadline
* **Rate Monotonic Scheduling (RMS)** – prioritizes tasks with shorter periods
* **First Come First Serve (FCFS)** – executes tasks in arrival order
* **Round Robin (RR)** – assigns equal time slices to each task

---

### ⏱️ Step 3: Time-Based Simulation Loop

The system simulates CPU execution using a timeline:

```
time = 0 → 1 → 2 → 3 → ...
```

At each time step:

1. **Check Arrivals**
   Add tasks that have arrived to the ready queue

2. **Select Task**
   Choose a task based on the scheduling algorithm

3. **Execute Task**
   Run the task for one time unit (or until completion)

4. **Update State**

   * Reduce remaining execution time
   * Mark task complete if finished

---

### ⚠️ Step 4: Deadline Monitoring

During execution, the simulator continuously checks:

* If `current time > deadline` and task is incomplete → **Deadline Miss**

This is a key metric in real-time systems.

---

### 📊 Step 5: Execution Tracking

The simulator records execution intervals:

```
T1 → 0 to 2  
T2 → 2 to 3  
T3 → 3 to 5  
```

These intervals are used to generate a **Gantt Chart** for visualization.

---

### 📈 Step 6: Performance Metrics

After completing the simulation, the following metrics are calculated:

* **Waiting Time**
* **Turnaround Time**
* **CPU Utilization**
* **Deadline Miss Ratio**

---

### 🧩 Workflow Summary

```
Input Tasks
     ↓
Select Algorithm
     ↓
Start Time Loop
     ↓
Add Arrived Tasks to Queue
     ↓
Select Task (based on algorithm)
     ↓
Execute Task
     ↓
Update System State
     ↓
Repeat Until All Tasks Complete
```

---

### 🎯 Key Concept

This simulation replicates how a real CPU scheduler works by dynamically selecting tasks based on timing constraints, helping analyze the efficiency and reliability of different scheduling algorithms.
