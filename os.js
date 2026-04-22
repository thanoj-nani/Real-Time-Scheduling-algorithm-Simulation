 let currentAlgorithm = 'RM';
        let simTime = 80;
        let taskCount = 4;
        let timeQuantum = 3;

        const taskTemplates = [
            { id: 'T1', period: 12, deadline: 12, execution: 3, color: '#667eea' },
            { id: 'T2', period: 16, deadline: 16, execution: 4, color: '#f5576c' },
            { id: 'T3', period: 20, deadline: 20, execution: 5, color: '#00f2fe' },
            { id: 'T4', period: 24, deadline: 24, execution: 4, color: '#38f9d7' },
            { id: 'T5', period: 30, deadline: 30, execution: 3, color: '#fee140' },
        ];

        function setAlgorithm(algo) {
            currentAlgorithm = algo;
            document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
            event.target.classList.add('active');
            updateSimulation();
        }

        function updateSimulation() {
            simTime = parseInt(document.getElementById('simTime').value);
            taskCount = parseInt(document.getElementById('taskCount').value);
            timeQuantum = parseInt(document.getElementById('timeQuantum').value);
            
            document.getElementById('simTimeVal').textContent = simTime + ' time units';
            document.getElementById('quantumVal').textContent = timeQuantum + ' units';
            
            const tasks = taskTemplates.slice(0, taskCount);
            const schedule = generateSchedule(tasks);
            visualizeSchedule(tasks, schedule);
            updateMetrics(tasks, schedule);
            updateTasksTable(tasks, schedule);
        }

        function generateSchedule(tasks) {
            const schedule = [];
            const readyQueue = [];
            const taskInstances = [];
            
            tasks.forEach(task => {
                for (let time = 0; time < simTime; time += task.period) {
                    taskInstances.push({
                        taskId: task.id,
                        arrivalTime: time,
                        deadline: time + task.deadline,
                        executionTime: task.execution,
                        executed: 0,
                        startTime: null,
                        endTime: null,
                        quantumUsed: 0
                    });
                }
            });
            
            taskInstances.sort((a, b) => a.arrivalTime - b.arrivalTime);
            
            let currentTime = 0;
            let completed = new Set();
            
            while (currentTime < simTime) {
                const newArrivals = taskInstances.filter(t => 
                    t.arrivalTime === currentTime && !completed.has(t)
                );
                readyQueue.push(...newArrivals);
                
                let nextTask = null;
                
                if (readyQueue.length > 0) {
                    switch(currentAlgorithm) {
                        case 'RM':
                            nextTask = readyQueue.reduce((a, b) => {
                                const taskA = tasks.find(t => t.id === a.taskId);
                                const taskB = tasks.find(t => t.id === b.taskId);
                                return taskA.period <= taskB.period ? a : b;
                            });
                            break;
                        case 'EDF':
                            nextTask = readyQueue.reduce((a, b) => a.deadline <= b.deadline ? a : b);
                            break;
                        case 'RR':
                            nextTask = readyQueue[0];
                            if (nextTask.quantumUsed >= timeQuantum && nextTask.executed < nextTask.executionTime) {
                                readyQueue.shift();
                                readyQueue.push(nextTask);
                                nextTask = readyQueue[0];
                                nextTask.quantumUsed = 0;
                            }
                            break;
                        case 'FCFS':
                            nextTask = readyQueue[0];
                            break;
                    }
                    
                    if (nextTask && nextTask.startTime === null) {
                        nextTask.startTime = currentTime;
                    }
                    
                    if (nextTask) {
                        nextTask.executed += 1;
                        nextTask.quantumUsed += 1;
                        
                        if (nextTask.executed >= nextTask.executionTime) {
                            nextTask.endTime = currentTime + 1;
                            const idx = readyQueue.indexOf(nextTask);
                            readyQueue.splice(idx, 1);
                            completed.add(nextTask);
                        }
                        
                        schedule.push({
                            time: currentTime,
                            task: nextTask.taskId,
                            duration: 1
                        });
                    } else {
                        schedule.push({ time: currentTime, task: null, duration: 1 });
                    }
                } else {
                    schedule.push({ time: currentTime, task: null, duration: 1 });
                }
                
                currentTime += 1;
            }
            
            return { schedule, taskInstances };
        }

        function visualizeSchedule(tasks, { schedule, taskInstances }) {
            const timeline = document.getElementById('timeline');
            const existingBars = timeline.querySelectorAll('.task-bar, .deadline-marker');
            existingBars.forEach(el => el.remove());
            
            const gridLines = document.getElementById('gridLines');
            gridLines.innerHTML = '';
            
            const scale = 800 / simTime;
            
            for (let i = 0; i <= simTime; i += 10) {
                const line = document.createElement('div');
                line.className = 'grid-line';
                line.style.left = (i * scale) + 'px';
                gridLines.appendChild(line);
            }
            
            const timeAxis = document.getElementById('timeAxis');
            timeAxis.innerHTML = '';
            for (let i = 0; i <= simTime; i += 10) {
                const label = document.createElement('span');
                label.textContent = i;
                label.style.position = 'absolute';
                label.style.left = (i * scale) + 'px';
                timeAxis.appendChild(label);
            }
            
            const taskMap = {};
            schedule.forEach(item => {
                if (item.task) {
                    if (!taskMap[item.task]) taskMap[item.task] = [];
                    taskMap[item.task].push({ start: item.time, duration: 1 });
                }
            });
            
            let rowIndex = 0;
            Object.entries(taskMap).forEach(([taskId, intervals]) => {
                const task = tasks.find(t => t.id === taskId);
                
                const merged = [];
                let current = null;
                intervals.forEach(interval => {
                    if (current && current.start + current.duration === interval.start) {
                        current.duration += 1;
                    } else {
                        if (current) merged.push(current);
                        current = { ...interval };
                    }
                });
                if (current) merged.push(current);
                
                merged.forEach(interval => {
                    const bar = document.createElement('div');
                    bar.className = `task-bar ${taskId}`;
                    bar.style.left = (interval.start * scale + 50) + 'px';
                    bar.style.width = Math.max(interval.duration * scale - 2, 20) + 'px';
                    bar.style.top = (rowIndex * 50 + 5) + 'px';
                    bar.textContent = taskId;
                    bar.title = `${taskId}: ${interval.duration} units`;
                    timeline.appendChild(bar);
                });
                
                rowIndex++;
            });
            
            const uniqueDeadlines = new Set();
            taskInstances.forEach(instance => {
                if (instance.deadline <= simTime && !uniqueDeadlines.has(instance.deadline)) {
                    uniqueDeadlines.add(instance.deadline);
                    const marker = document.createElement('div');
                    marker.className = 'deadline-marker';
                    marker.style.left = (instance.deadline * scale) + 'px';
                    marker.title = `Deadline at ${instance.deadline}`;
                    timeline.appendChild(marker);
                }
            });
        }

        function updateMetrics(tasks, { schedule, taskInstances }) {
            let busyTime = schedule.filter(s => s.task !== null).length;
            let utilization = Math.round((busyTime / simTime) * 100);
            
            let missedCount = taskInstances.filter(t => t.endTime && t.endTime > t.deadline).length;
            
            let waitTimes = taskInstances
                .filter(t => t.startTime !== null)
                .map(t => t.startTime - t.arrivalTime);
            let avgWait = waitTimes.length > 0 
                ? (waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length).toFixed(1)
                : 0;
            
            let switches = 0;
            for (let i = 1; i < schedule.length; i++) {
                if (schedule[i].task !== schedule[i-1].task && schedule[i].task !== null) switches++;
            }
            
            document.getElementById('utilization').textContent = utilization;
            document.getElementById('missedDeadlines').textContent = missedCount;
            document.getElementById('avgWait').textContent = avgWait;
            document.getElementById('contextSwitches').textContent = switches;
        }

        function updateTasksTable(tasks, { taskInstances }) {
            const tbody = document.getElementById('tasksTable');
            tbody.innerHTML = '';
            
            tasks.forEach(task => {
                const utilization = ((task.execution / task.period) * 100).toFixed(1);
                const priority = currentAlgorithm === 'RM' ? Math.round(1000 / task.period) : '-';
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><span class="task-id">${task.id}</span></td>
                    <td>${task.period}</td>
                    <td>${task.deadline}</td>
                    <td>${task.execution}</td>
                    <td>${utilization}%</td>
                    <td>${priority}</td>
                    <td><span class="status-badge ready">Ready</span></td>
                `;
                tbody.appendChild(row);
            });
        }

        // Initialize on page load
        window.addEventListener('DOMContentLoaded', function() {
            updateSimulation();
        });