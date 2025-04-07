document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const algorithmRadios = document.querySelectorAll('input[name="algorithm"]')
  const rrTimeQuantumContainer = document.querySelector(".rr-time-quantum")
  const timeQuantumSlider = document.getElementById("time-quantum")
  const timeQuantumValue = document.getElementById("time-quantum-value")
  const priorityColumns = document.querySelectorAll(".priority-column")
  const addProcessButton = document.getElementById("add-process")
  const resetProcessesButton = document.getElementById("reset-processes")
  const processTable = document.getElementById("process-table").querySelector("tbody")
  const runSimulationButton = document.getElementById("run-simulation")
  const stepSimulationButton = document.getElementById("step-simulation")
  const pauseSimulationButton = document.getElementById("pause-simulation")
  const simulationSpeedSlider = document.getElementById("simulation-speed")
  const ganttChart = document.getElementById("gantt-chart")
  const processStates = document.getElementById("process-states")
  const timeMarkers = document.getElementById("time-markers")
  const avgWaitingTime = document.getElementById("avg-waiting-time")
  const avgTurnaroundTime = document.getElementById("avg-turnaround-time")
  const cpuUtilization = document.getElementById("cpu-utilization")
  const throughput = document.getElementById("throughput")
  const resultTable = document.getElementById("result-table").querySelector("tbody")
  const algorithmExplanation = document.getElementById("algorithm-explanation")

  // Simulation variables
  let processes = []
  let simulationRunning = false
  let simulationPaused = false
  let simulationInterval = null
  let currentTime = 0
  let timeQuantum = 2
  let simulationSpeed = 3
  let simulationStep = 0
  let simulationSteps = []
  let selectedAlgorithm = "fcfs"

  // Initialize
  updateAlgorithmExplanation("fcfs")

  // Event Listeners
  algorithmRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      selectedAlgorithm = this.value

      // Show/hide time quantum for Round Robin
      if (selectedAlgorithm === "rr") {
        rrTimeQuantumContainer.style.display = "block"
      } else {
        rrTimeQuantumContainer.style.display = "none"
      }

      // Show/hide priority column for Priority Scheduling
      if (selectedAlgorithm === "priority") {
        priorityColumns.forEach((col) => (col.style.display = "table-cell"))
      } else {
        priorityColumns.forEach((col) => (col.style.display = "none"))
      }

      updateAlgorithmExplanation(selectedAlgorithm)
    })
  })

  timeQuantumSlider.addEventListener("input", function () {
    timeQuantum = Number.parseInt(this.value)
    timeQuantumValue.textContent = timeQuantum
  })

  simulationSpeedSlider.addEventListener("input", function () {
    simulationSpeed = Number.parseInt(this.value)
    if (simulationRunning && !simulationPaused) {
      clearInterval(simulationInterval)
      startSimulationInterval()
    }
  })

  addProcessButton.addEventListener("click", () => {
    const processCount = processTable.querySelectorAll("tr").length
    const newRow = document.createElement("tr")

    newRow.innerHTML = `
            <td>P${processCount + 1}</td>
            <td><input type="number" min="0" value="${Math.floor(Math.random() * 10)}" class="arrival-time"></td>
            <td><input type="number" min="1" value="${Math.floor(Math.random() * 10) + 1}" class="burst-time"></td>
            <td class="priority-column" style="${selectedAlgorithm === "priority" ? "" : "display: none;"}"><input type="number" min="1" value="${Math.floor(Math.random() * 5) + 1}" class="priority"></td>
            <td><button class="delete-process"><i class="fas fa-trash"></i></button></td>
        `

    processTable.appendChild(newRow)

    // Add event listener to new delete button
    newRow.querySelector(".delete-process").addEventListener("click", () => {
      if (processTable.querySelectorAll("tr").length > 1) {
        newRow.remove()
        renumberProcesses()
      }
    })
  })

  resetProcessesButton.addEventListener("click", () => {
    // Clear all processes except the first one
    while (processTable.querySelectorAll("tr").length > 1) {
      processTable.removeChild(processTable.lastChild)
    }

    // Reset the first process
    const firstRow = processTable.querySelector("tr")
    firstRow.querySelector(".arrival-time").value = "0"
    firstRow.querySelector(".burst-time").value = "6"
    firstRow.querySelector(".priority").value = "2"

    // Add two more default processes
    for (let i = 0; i < 2; i++) {
      addProcessButton.click()
    }
  })

  // Add event listeners to existing delete buttons
  document.querySelectorAll(".delete-process").forEach((button) => {
    button.addEventListener("click", function () {
      if (processTable.querySelectorAll("tr").length > 1) {
        this.closest("tr").remove()
        renumberProcesses()
      }
    })
  })

  runSimulationButton.addEventListener("click", function () {
    if (simulationRunning) {
      stopSimulation()
      this.innerHTML = '<i class="fas fa-play"></i> Jalankan Simulasi'
    } else {
      startSimulation()
      this.innerHTML = '<i class="fas fa-stop"></i> Hentikan Simulasi'
    }
  })

  stepSimulationButton.addEventListener("click", () => {
    if (!simulationRunning) {
      prepareSimulation()
      simulationRunning = true
      simulationPaused = true
      runSimulationButton.innerHTML = '<i class="fas fa-stop"></i> Hentikan Simulasi'
      pauseSimulationButton.disabled = false
      pauseSimulationButton.innerHTML = '<i class="fas fa-play"></i> Resume'
    }

    if (simulationStep < simulationSteps.length) {
      renderSimulationStep(simulationStep)
      simulationStep++
    } else {
      finishSimulation()
    }
  })

  pauseSimulationButton.addEventListener("click", function () {
    if (simulationRunning) {
      if (simulationPaused) {
        // Resume simulation
        simulationPaused = false
        this.innerHTML = '<i class="fas fa-pause"></i> Pause'
        startSimulationInterval()
      } else {
        // Pause simulation
        simulationPaused = true
        this.innerHTML = '<i class="fas fa-play"></i> Resume'
        clearInterval(simulationInterval)
      }
    }
  })

  // Functions
  function renumberProcesses() {
    const rows = processTable.querySelectorAll("tr")
    rows.forEach((row, index) => {
      row.cells[0].textContent = `P${index + 1}`
    })
  }

  function startSimulation() {
    prepareSimulation()
    simulationRunning = true
    simulationPaused = false
    pauseSimulationButton.disabled = false
    startSimulationInterval()
  }

  function prepareSimulation() {
    // Reset simulation state
    currentTime = 0
    simulationStep = 0

    // Get processes from the table
    processes = []
    const rows = processTable.querySelectorAll("tr")

    rows.forEach((row, index) => {
      const arrivalTime = Number.parseInt(row.querySelector(".arrival-time").value)
      const burstTime = Number.parseInt(row.querySelector(".burst-time").value)
      const priority = row.querySelector(".priority") ? Number.parseInt(row.querySelector(".priority").value) : 1

      processes.push({
        id: `P${index + 1}`,
        arrivalTime: arrivalTime,
        burstTime: burstTime,
        priority: priority,
        remainingTime: burstTime,
        color: `process-color-${(index % 8) + 1}`,
        startTime: -1,
        finishTime: -1,
        waitingTime: 0,
        turnaroundTime: 0,
        executed: 0,
        state: "waiting", // waiting, ready, running, completed
      })
    })

    // Generate simulation steps based on selected algorithm
    simulationSteps = generateSimulationSteps(processes, selectedAlgorithm, timeQuantum)

    // Clear visualization
    ganttChart.innerHTML = ""
    processStates.innerHTML = ""
    timeMarkers.innerHTML = ""
    resultTable.innerHTML = ""

    // Initialize visualization
    initializeVisualization()
  }

  function startSimulationInterval() {
    const speedMap = {
      1: 1000, // Slow
      2: 750,
      3: 500, // Medium
      4: 250,
      5: 100, // Fast
    }

    simulationInterval = setInterval(() => {
      if (simulationStep < simulationSteps.length) {
        renderSimulationStep(simulationStep)
        simulationStep++
      } else {
        finishSimulation()
      }
    }, speedMap[simulationSpeed])
  }

  function stopSimulation() {
    simulationRunning = false
    simulationPaused = false
    clearInterval(simulationInterval)
    pauseSimulationButton.disabled = true
    pauseSimulationButton.innerHTML = '<i class="fas fa-pause"></i> Pause'
  }

  function finishSimulation() {
    stopSimulation()
    runSimulationButton.innerHTML = '<i class="fas fa-play"></i> Jalankan Simulasi'
    calculateAndDisplayResults()
  }

  function initializeVisualization() {
    // Create process rows in Gantt chart
    processes.forEach((process) => {
      const ganttRow = document.createElement("div")
      ganttRow.className = "gantt-row"
      ganttRow.innerHTML = `
                <div class="gantt-label">${process.id}</div>
                <div class="gantt-bars" data-process="${process.id}"></div>
            `
      ganttChart.appendChild(ganttRow)

      // Create process state rows
      const stateRow = document.createElement("div")
      stateRow.className = "process-state"
      stateRow.innerHTML = `
                <div class="process-name">${process.id}</div>
                <div class="state-timeline" data-process-state="${process.id}"></div>
            `
      processStates.appendChild(stateRow)
    })

    // Create time markers
    const maxTime = simulationSteps[simulationSteps.length - 1].time + 1
    for (let i = 0; i <= maxTime; i += Math.max(1, Math.floor(maxTime / 20))) {
      const marker = document.createElement("div")
      marker.className = "time-marker"
      marker.style.left = `${(i / maxTime) * 100}%`
      marker.innerHTML = `<span class="time-marker-label">${i}</span>`
      timeMarkers.appendChild(marker)
    }
  }

  function renderSimulationStep(stepIndex) {
    const step = simulationSteps[stepIndex]
    currentTime = step.time

    // Update process states
    processes.forEach((process) => {
      // Update process state based on simulation step
      if (step.completedProcesses.includes(process.id)) {
        process.state = "completed"
        if (process.finishTime === -1) {
          process.finishTime = currentTime
          process.turnaroundTime = process.finishTime - process.arrivalTime
          process.waitingTime = process.turnaroundTime - process.burstTime
        }
      } else if (step.activeProcess === process.id) {
        process.state = "running"
        if (process.startTime === -1) {
          process.startTime = currentTime
        }
        process.executed++
      } else if (step.readyProcesses.includes(process.id)) {
        process.state = "ready"
      } else {
        process.state = "waiting"
      }

      // Render process state
      const stateTimeline = document.querySelector(`[data-process-state="${process.id}"]`)
      const stateSegment = document.createElement("div")
      stateSegment.className = `state-segment state-${process.state}`
      stateSegment.style.left = `${(step.time / simulationSteps[simulationSteps.length - 1].time) * 100}%`
      stateSegment.style.width = `${(1 / simulationSteps[simulationSteps.length - 1].time) * 100}%`
      stateTimeline.appendChild(stateSegment)

      // Render Gantt chart bar for running process
      if (process.state === "running") {
        const ganttBars = document.querySelector(`[data-process="${process.id}"]`)
        const ganttBar = document.createElement("div")
        ganttBar.className = `gantt-bar ${process.color}`
        ganttBar.style.left = `${(step.time / simulationSteps[simulationSteps.length - 1].time) * 100}%`
        ganttBar.style.width = `${(1 / simulationSteps[simulationSteps.length - 1].time) * 100}%`
        ganttBar.textContent = process.id
        ganttBars.appendChild(ganttBar)
      }
    })
  }

  function calculateAndDisplayResults() {
    let totalWaitingTime = 0
    let totalTurnaroundTime = 0
    let totalBurstTime = 0
    let maxCompletionTime = 0

    // Calculate metrics and populate result table
    resultTable.innerHTML = ""

    processes.forEach((process) => {
      // Calculate final metrics if not already calculated
      if (process.finishTime === -1) {
        process.finishTime = currentTime
      }
      process.turnaroundTime = process.finishTime - process.arrivalTime
      process.waitingTime = process.turnaroundTime - process.burstTime

      totalWaitingTime += process.waitingTime
      totalTurnaroundTime += process.turnaroundTime
      totalBurstTime += process.burstTime
      maxCompletionTime = Math.max(maxCompletionTime, process.finishTime)

      // Add to result table
      const row = document.createElement("tr")
      row.innerHTML = `
                <td>${process.id}</td>
                <td>${process.arrivalTime}</td>
                <td>${process.burstTime}</td>
                <td>${process.finishTime}</td>
                <td>${process.turnaroundTime}</td>
                <td>${process.waitingTime}</td>
            `
      resultTable.appendChild(row)
    })

    // Update metrics
    const avgWT = totalWaitingTime / processes.length
    const avgTAT = totalTurnaroundTime / processes.length
    const cpuUtil = (totalBurstTime / maxCompletionTime) * 100
    const throughputValue = processes.length / maxCompletionTime

    avgWaitingTime.textContent = avgWT.toFixed(2)
    avgTurnaroundTime.textContent = avgTAT.toFixed(2)
    cpuUtilization.textContent = `${cpuUtil.toFixed(2)}%`
    throughput.textContent = `${throughputValue.toFixed(2)} proses/unit waktu`
  }

  function generateSimulationSteps(processes, algorithm, quantum) {
    const steps = []
    let currentTime = 0
    const processQueue = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime)
    const completedProcesses = []
    const readyQueue = []

    // Deep copy processes to avoid modifying the original
    const remainingProcesses = processQueue.map((p) => ({ ...p, remainingTime: p.burstTime }))

    // Continue until all processes are completed
    while (completedProcesses.length < processes.length) {
      // Add newly arrived processes to ready queue
      const newArrivals = remainingProcesses.filter(
        (p) => p.arrivalTime <= currentTime && !completedProcesses.includes(p.id) && !readyQueue.includes(p),
      )

      readyQueue.push(...newArrivals)

      // If ready queue is empty, jump to next arrival
      if (readyQueue.length === 0) {
        const nextArrival = remainingProcesses.find(
          (p) => p.arrivalTime > currentTime && !completedProcesses.includes(p.id),
        )

        if (nextArrival) {
          currentTime = nextArrival.arrivalTime
          continue
        } else {
          break // No more processes to execute
        }
      }

      // Select next process based on algorithm
      let selectedProcess

      if (algorithm === "fcfs") {
        // First-Come, First-Served
        readyQueue.sort((a, b) => a.arrivalTime - b.arrivalTime)
        selectedProcess = readyQueue.shift()

        // Execute the entire burst
        for (let i = 0; i < selectedProcess.remainingTime; i++) {
          steps.push({
            time: currentTime + i,
            activeProcess: selectedProcess.id,
            readyProcesses: readyQueue.map((p) => p.id),
            completedProcesses: [...completedProcesses],
          })
        }

        currentTime += selectedProcess.remainingTime
        selectedProcess.remainingTime = 0
        completedProcesses.push(selectedProcess.id)
      } else if (algorithm === "sjf") {
        // Shortest Job First (non-preemptive)
        readyQueue.sort((a, b) => a.burstTime - b.burstTime)
        selectedProcess = readyQueue.shift()

        // Execute the entire burst
        for (let i = 0; i < selectedProcess.remainingTime; i++) {
          steps.push({
            time: currentTime + i,
            activeProcess: selectedProcess.id,
            readyProcesses: readyQueue.map((p) => p.id),
            completedProcesses: [...completedProcesses],
          })
        }

        currentTime += selectedProcess.remainingTime
        selectedProcess.remainingTime = 0
        completedProcesses.push(selectedProcess.id)
      } else if (algorithm === "srtf") {
        // Shortest Remaining Time First (preemptive)
        readyQueue.sort((a, b) => a.remainingTime - b.remainingTime)
        selectedProcess = readyQueue.shift()

        // Execute for 1 time unit
        steps.push({
          time: currentTime,
          activeProcess: selectedProcess.id,
          readyProcesses: readyQueue.map((p) => p.id),
          completedProcesses: [...completedProcesses],
        })

        selectedProcess.remainingTime--
        currentTime++

        // Check if process is completed
        if (selectedProcess.remainingTime === 0) {
          completedProcesses.push(selectedProcess.id)
        } else {
          readyQueue.push(selectedProcess)
        }
      } else if (algorithm === "rr") {
        // Round Robin
        selectedProcess = readyQueue.shift()

        // Execute for quantum or remaining time, whichever is smaller
        const executionTime = Math.min(quantum, selectedProcess.remainingTime)

        for (let i = 0; i < executionTime; i++) {
          steps.push({
            time: currentTime + i,
            activeProcess: selectedProcess.id,
            readyProcesses: readyQueue.map((p) => p.id),
            completedProcesses: [...completedProcesses],
          })
        }

        currentTime += executionTime
        selectedProcess.remainingTime -= executionTime

        // Check if process is completed
        if (selectedProcess.remainingTime === 0) {
          completedProcesses.push(selectedProcess.id)
        } else {
          // Add newly arrived processes before putting current process back
          const newArrivals = remainingProcesses.filter(
            (p) =>
              p.arrivalTime <= currentTime &&
              !completedProcesses.includes(p.id) &&
              !readyQueue.includes(p) &&
              p.id !== selectedProcess.id,
          )

          readyQueue.push(...newArrivals)
          readyQueue.push(selectedProcess)
        }
      } else if (algorithm === "priority") {
        // Priority Scheduling (non-preemptive)
        readyQueue.sort((a, b) => a.priority - b.priority) // Lower number = higher priority
        selectedProcess = readyQueue.shift()

        // Execute the entire burst
        for (let i = 0; i < selectedProcess.remainingTime; i++) {
          steps.push({
            time: currentTime + i,
            activeProcess: selectedProcess.id,
            readyProcesses: readyQueue.map((p) => p.id),
            completedProcesses: [...completedProcesses],
          })
        }

        currentTime += selectedProcess.remainingTime
        selectedProcess.remainingTime = 0
        completedProcesses.push(selectedProcess.id)
      }
    }

    return steps
  }

  function updateAlgorithmExplanation(algorithm) {
    let explanationHTML = ""

    switch (algorithm) {
      case "fcfs":
        explanationHTML = `
                    <h3>First-Come, First-Served (FCFS)</h3>
                    <p>
                        First-Come, First-Served (FCFS) adalah algoritma penjadwalan CPU paling sederhana. Dalam algoritma ini, proses yang pertama kali meminta CPU akan dilayani terlebih dahulu. Implementasinya menggunakan struktur data antrian FIFO (First-In, First-Out).
                    </p>
                    <h4>Karakteristik FCFS:</h4>
                    <ul>
                        <li>Non-preemptive: Setelah CPU dialokasikan ke suatu proses, proses tersebut akan terus menggunakan CPU hingga selesai</li>
                        <li>Sederhana dan mudah diimplementasikan</li>
                        <li>Dapat menyebabkan convoy effect (proses pendek menunggu proses panjang)</li>
                        <li>Waktu tunggu rata-rata tinggi</li>
                    </ul>
                `
        break

      case "sjf":
        explanationHTML = `
                    <h3>Shortest Job First (SJF)</h3>
                    <p>
                        Shortest Job First (SJF) adalah algoritma penjadwalan yang mengeksekusi proses dengan waktu burst terpendek terlebih dahulu. Algoritma ini optimal untuk meminimalkan waktu tunggu rata-rata.
                    </p>
                    <h4>Karakteristik SJF:</h4>
                    <ul>
                        <li>Non-preemptive: Setelah CPU dialokasikan ke suatu proses, proses tersebut akan terus menggunakan CPU hingga selesai</li>
                        <li>Optimal untuk meminimalkan waktu tunggu rata-rata</li>
                        <li>Sulit diimplementasikan karena membutuhkan prediksi burst time</li>
                        <li>Dapat menyebabkan starvation untuk proses dengan burst time panjang</li>
                    </ul>
                `
        break

      case "srtf":
        explanationHTML = `
                    <h3>Shortest Remaining Time First (SRTF)</h3>
                    <p>
                        Shortest Remaining Time First (SRTF) adalah versi preemptive dari algoritma SJF. Dalam SRTF, CPU selalu dialokasikan ke proses dengan sisa waktu eksekusi terpendek. Jika proses baru tiba dengan burst time lebih pendek dari sisa waktu proses yang sedang berjalan, proses yang sedang berjalan akan dipreemsi.
                    </p>
                    <h4>Karakteristik SRTF:</h4>
                    <ul>
                        <li>Preemptive: Proses yang sedang berjalan dapat diinterupsi jika proses dengan sisa waktu lebih pendek tiba</li>
                        <li>Optimal untuk meminimalkan waktu tunggu rata-rata</li>
                        <li>Overhead context switching yang lebih tinggi</li>
                        <li>Sulit diimplementasikan karena membutuhkan prediksi sisa waktu eksekusi</li>
                    </ul>
                `
        break

      case "rr":
        explanationHTML = `
                    <h3>Round Robin (RR)</h3>
                    <p>
                        Round Robin (RR) adalah algoritma penjadwalan yang dirancang khusus untuk sistem time-sharing. Setiap proses diberi jatah waktu CPU yang tetap yang disebut time quantum. Setelah time quantum habis, proses dipreemsi dan ditambahkan ke akhir antrian ready.
                    </p>
                    <h4>Karakteristik Round Robin:</h4>
                    <ul>
                        <li>Preemptive: Proses diinterupsi setelah time quantum habis</li>
                        <li>Adil untuk semua proses (setiap proses mendapat jatah CPU yang sama)</li>
                        <li>Responsif untuk sistem interaktif</li>
                        <li>Kinerja sangat bergantung pada ukuran time quantum</li>
                        <li>Overhead context switching yang tinggi</li>
                    </ul>
                `
        break

      case "priority":
        explanationHTML = `
                    <h3>Priority Scheduling</h3>
                    <p>
                        Priority Scheduling adalah algoritma penjadwalan di mana setiap proses diberi prioritas, dan CPU dialokasikan ke proses dengan prioritas tertinggi. Prioritas dapat ditentukan berdasarkan kebutuhan memori, waktu, atau faktor lainnya.
                    </p>
                    <h4>Karakteristik Priority Scheduling:</h4>
                    <ul>
                        <li>Dapat bersifat preemptive atau non-preemptive</li>
                        <li>Mendukung prioritas proses yang berbeda</li>
                        <li>Dapat menyebabkan starvation untuk proses dengan prioritas rendah</li>
                        <li>Membutuhkan mekanisme aging untuk mencegah starvation</li>
                    </ul>
                    <p>
                        Dalam simulasi ini, kita menggunakan versi non-preemptive dari Priority Scheduling, di mana angka prioritas yang lebih kecil menunjukkan prioritas yang lebih tinggi.
                    </p>
                `
        break
    }

    algorithmExplanation.innerHTML = explanationHTML
  }
})

