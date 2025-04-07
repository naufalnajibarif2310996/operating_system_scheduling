document.addEventListener("DOMContentLoaded", () => {
  // Game menu and containers
  const gameMenu = document.getElementById("game-menu")
  const schedulerChallengeGame = document.getElementById("scheduler-challenge-game")
  const algorithmMasterGame = document.getElementById("algorithm-master-game")

  // Start game buttons
  const startGameButtons = document.querySelectorAll(".start-game")

  // Back to menu buttons
  const backToMenuButtons = document.querySelectorAll(".back-to-menu")

  // Colors for processes
  const colors = ["bg-red", "bg-blue", "bg-green", "bg-yellow", "bg-purple", "bg-pink", "bg-indigo", "bg-orange"]

  // Start game event listeners
  startGameButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const gameType = this.dataset.game

      // Hide game menu
      gameMenu.style.display = "none"

      // Show selected game
      if (gameType === "scheduler-challenge") {
        schedulerChallengeGame.style.display = "block"
        initSchedulerChallenge()
      } else if (gameType === "algorithm-master") {
        algorithmMasterGame.style.display = "block"
        initAlgorithmMaster()
      }
    })
  })

  // Back to menu event listeners
  backToMenuButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Hide all games
      schedulerChallengeGame.style.display = "none"
      algorithmMasterGame.style.display = "none"

      // Show game menu
      gameMenu.style.display = "block"
    })
  })

  // ==================== SCHEDULER CHALLENGE GAME ====================

  // Scheduler Challenge Game variables
  let scLevel = 1
  let scScore = 0
  let scTimeLeft = 60
  let scTimer = null
  let scProcesses = []
  let scAlgorithm = "fcfs"
  let scUserOrder = []
  let scGameState = "playing" // playing, correct, wrong

  // Scheduler Challenge Game elements
  const scLevelDisplay = document.getElementById("sc-level")
  const scLevelDisplaySmall = document.getElementById("sc-level-display")
  const scScoreDisplay = document.getElementById("sc-score")
  const scTimeLeftDisplay = document.getElementById("sc-time-left")
  // Progress bar element is removed from HTML, but we'll keep the variable to avoid errors
  const scProgressBar = { style: { width: "100%" } } // Dummy object
  const scAlgorithmDisplay = document.getElementById("sc-algorithm")
  const scAvailableProcesses = document.getElementById("sc-available-processes")
  const scExecutionOrder = document.getElementById("sc-execution-order")
  const scCheckButton = document.getElementById("sc-check")
  const scResetButton = document.getElementById("sc-reset")
  const scGameArea = document.getElementById("sc-game-area")
  const scResult = document.getElementById("sc-result")
  const scInstructions = document.getElementById("sc-instructions")

  // Initialize Scheduler Challenge Game
  function initSchedulerChallenge() {
    // Reset game state
    scLevel = 1
    scScore = 0
    scGameState = "playing"

    // Update displays
    scLevelDisplay.textContent = `Level ${scLevel}`
    scLevelDisplaySmall.textContent = scLevel
    scScoreDisplay.textContent = scScore

    // Generate level
    generateSchedulerChallengeLevel(scLevel)
  }

  // Generate Scheduler Challenge level
  function generateSchedulerChallengeLevel(level) {
    // Reset game state
    scGameState = "playing"
    scUserOrder = []
    scTimeLeft = 60 + level * 10
    // Progress bar is removed, but we'll keep the line to avoid errors
    scProgressBar.style.width = "100%"

    // Update displays
    scTimeLeftDisplay.textContent = scTimeLeft

    // Clear timers
    if (scTimer) clearInterval(scTimer)

    // Choose algorithm based on level
    if (level <= 2) {
      scAlgorithm = "fcfs"
      scAlgorithmDisplay.textContent = "First-Come, First-Served"
    } else if (level <= 4) {
      scAlgorithm = Math.random() > 0.5 ? "fcfs" : "sjf"
      scAlgorithmDisplay.textContent = scAlgorithm === "fcfs" ? "First-Come, First-Served" : "Shortest Job First"
    } else {
      const algos = ["fcfs", "sjf", "priority"]
      scAlgorithm = algos[Math.floor(Math.random() * algos.length)]
      scAlgorithmDisplay.textContent =
        scAlgorithm === "fcfs"
          ? "First-Come, First-Served"
          : scAlgorithm === "sjf"
            ? "Shortest Job First"
            : "Priority Scheduling"
    }

    // Generate processes
    const numProcesses = Math.min(3 + level, 8)
    scProcesses = []

    for (let i = 0; i < numProcesses; i++) {
      scProcesses.push({
        id: `P${i + 1}`,
        arrivalTime: Math.floor(Math.random() * 10),
        burstTime: Math.floor(Math.random() * 10) + 1,
        priority: Math.floor(Math.random() * 5) + 1,
        color: colors[i % colors.length],
      })
    }

    // Render processes
    renderSchedulerChallengeProcesses()

    // Update instructions
    updateSchedulerChallengeInstructions()

    // Start timer
    startSchedulerChallengeTimer()

    // Show game area, hide result
    scGameArea.style.display = "block"
    scResult.style.display = "none"

    // Disable check button
    scCheckButton.disabled = true
  }

  // Render Scheduler Challenge processes
  function renderSchedulerChallengeProcesses() {
    // Clear containers
    scAvailableProcesses.innerHTML = ""
    scExecutionOrder.innerHTML = ""

    // Add empty message to execution order if empty
    if (scUserOrder.length === 0) {
      const emptyMessage = document.createElement("div")
      emptyMessage.className = "empty-message"
      emptyMessage.textContent = "Drag proses ke sini untuk mengurutkan"
      scExecutionOrder.appendChild(emptyMessage)
    }

    // Add available processes
    // Perbaikan: Filter proses yang tersedia berdasarkan ID, bukan objek proses
    const availableProcesses = scProcesses.filter((p) => !scUserOrder.includes(p.id))

    availableProcesses.forEach((process) => {
      const processItem = document.createElement("div")
      processItem.className = "process-item"
      processItem.draggable = true
      processItem.dataset.id = process.id

      processItem.innerHTML = `
      <div class="process-item-header">
        <span class="process-color ${process.color}"></span>
        <span class="process-id">${process.id}</span>
      </div>
      <div class="process-details">
        <div>Arrival Time: ${process.arrivalTime}</div>
        <div>Burst Time: ${process.burstTime}</div>
        ${scAlgorithm === "priority" ? `<div>Priority: ${process.priority}</div>` : ""}
      </div>
    `

      // Add drag event listeners
      processItem.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", process.id)
      })

      scAvailableProcesses.appendChild(processItem)
    })

    // Add ordered processes
    scUserOrder.forEach((processId) => {
      const process = scProcesses.find((p) => p.id === processId)
      if (!process) return // Skip if process not found

      const orderedProcess = document.createElement("div")
      orderedProcess.className = "ordered-process"

      orderedProcess.innerHTML = `
      <div class="ordered-process-info">
        <span class="process-color ${process.color}"></span>
        <span class="process-id">${process.id}</span>
        <span class="process-details-small">
          (Arrival: ${process.arrivalTime}, Burst: ${process.burstTime}${scAlgorithm === "priority" ? `, Priority: ${process.priority}` : ""})
        </span>
      </div>
      <button class="process-remove" data-id="${process.id}">✕</button>
    `

      scExecutionOrder.appendChild(orderedProcess)
    })

    // Add event listeners to remove buttons
    document.querySelectorAll(".process-remove").forEach((button) => {
      button.addEventListener("click", function () {
        const processId = this.dataset.id
        scUserOrder = scUserOrder.filter((id) => id !== processId)
        renderSchedulerChallengeProcesses()
        scCheckButton.disabled = scUserOrder.length !== scProcesses.length
      })
    })

    // Add drop event listener to execution order
    scExecutionOrder.addEventListener("dragover", (e) => {
      e.preventDefault()
    })

    scExecutionOrder.addEventListener("drop", (e) => {
      e.preventDefault()
      const processId = e.dataTransfer.getData("text/plain")

      // Add to user order if not already added
      if (!scUserOrder.includes(processId)) {
        scUserOrder.push(processId)
        renderSchedulerChallengeProcesses()

        // Enable check button if all processes are ordered
        scCheckButton.disabled = scUserOrder.length !== scProcesses.length
      }
    })
  }

  // Update Scheduler Challenge instructions
  function updateSchedulerChallengeInstructions() {
    scInstructions.innerHTML = ""

    if (scAlgorithm === "fcfs") {
      const li = document.createElement("li")
      li.textContent = "First-Come, First-Served (FCFS): Proses diurutkan berdasarkan waktu kedatangan (arrival time)"
      scInstructions.appendChild(li)
    } else if (scAlgorithm === "sjf") {
      const li = document.createElement("li")
      li.textContent = "Shortest Job First (SJF): Proses diurutkan berdasarkan waktu eksekusi terpendek (burst time)"
      scInstructions.appendChild(li)
    } else if (scAlgorithm === "priority") {
      const li = document.createElement("li")
      li.textContent = "Priority Scheduling: Proses diurutkan berdasarkan prioritas (angka kecil = prioritas tinggi)"
      scInstructions.appendChild(li)
    }
  }

  // Start Scheduler Challenge timer
  function startSchedulerChallengeTimer() {
    if (scTimer) clearInterval(scTimer)

    scTimer = setInterval(() => {
      scTimeLeft--
      scTimeLeftDisplay.textContent = scTimeLeft

      // Progress bar update is removed
      // const maxTime = 60 + scLevel * 10
      // const progress = (scTimeLeft / maxTime) * 100
      // scProgressBar.style.width = `${progress}%`

      if (scTimeLeft <= 0) {
        clearInterval(scTimer)
        checkSchedulerChallengeAnswer()
      }
    }, 1000)
  }

  // Check Scheduler Challenge answer
  function checkSchedulerChallengeAnswer() {
    // Stop timer
    if (scTimer) clearInterval(scTimer)

    // Get correct order
    let correctOrder = []

    if (scAlgorithm === "fcfs") {
      // Sort by arrival time
      correctOrder = [...scProcesses].sort((a, b) => a.arrivalTime - b.arrivalTime).map((p) => p.id)
    } else if (scAlgorithm === "sjf") {
      // Sort by burst time
      correctOrder = [...scProcesses].sort((a, b) => a.burstTime - b.burstTime).map((p) => p.id)
    } else if (scAlgorithm === "priority") {
      // Sort by priority (lower number = higher priority)
      correctOrder = [...scProcesses].sort((a, b) => a.priority - b.priority).map((p) => p.id)
    }

    // Check if user order matches correct order
    const isCorrect = JSON.stringify(scUserOrder) === JSON.stringify(correctOrder)

    // Update game state
    scGameState = isCorrect ? "correct" : "wrong"

    // Update score
    if (isCorrect) {
      scScore += scLevel * 100
      scScoreDisplay.textContent = scScore
    }

    // Show result
    showSchedulerChallengeResult(isCorrect, correctOrder)
  }

  // Show Scheduler Challenge result
  function showSchedulerChallengeResult(isCorrect, correctOrder) {
    // Hide game area
    scGameArea.style.display = "none"

    // Show result
    scResult.style.display = "block"

    if (isCorrect) {
      scResult.innerHTML = `
              <div class="result-success">
                  <div class="result-title">
                      <i class="fas fa-trophy"></i>
                      <span>Jawaban Benar!</span>
                  </div>
                  <p class="result-message">
                      Selamat! Anda berhasil mengurutkan proses dengan benar sesuai algoritma 
                      ${
                        scAlgorithm === "fcfs"
                          ? "First-Come, First-Served"
                          : scAlgorithm === "sjf"
                            ? "Shortest Job First"
                            : "Priority Scheduling"
                      }.
                  </p>
                  <div class="result-actions">
                      <button class="btn btn-outline back-to-menu">Kembali ke Menu</button>
                      <button class="btn btn-primary" id="sc-next-level">Level Selanjutnya</button>
                  </div>
              </div>
          `

      // Add event listener to next level button
      document.getElementById("sc-next-level").addEventListener("click", () => {
        scLevel++
        scLevelDisplay.textContent = `Level ${scLevel}`
        scLevelDisplaySmall.textContent = scLevel
        generateSchedulerChallengeLevel(scLevel)
      })

      // Add event listener to back to menu button
      scResult.querySelector(".back-to-menu").addEventListener("click", () => {
        schedulerChallengeGame.style.display = "none"
        gameMenu.style.display = "block"
      })
    } else {
      scResult.innerHTML = `
              <div class="result-error">
                  <div class="result-title">
                      <i class="fas fa-times-circle"></i>
                      <span>Jawaban Salah</span>
                  </div>
                  <p class="result-message">
                      Urutan proses yang Anda berikan tidak sesuai dengan algoritma 
                      ${
                        scAlgorithm === "fcfs"
                          ? "First-Come, First-Served"
                          : scAlgorithm === "sjf"
                            ? "Shortest Job First"
                            : "Priority Scheduling"
                      }.
                  </p>
                  <div class="result-actions">
                      <button class="btn btn-outline back-to-menu">Kembali ke Menu</button>
                      <button class="btn btn-primary" id="sc-try-again">Coba Lagi</button>
                  </div>
              </div>
          `

      // Add event listener to try again button
      document.getElementById("sc-try-again").addEventListener("click", () => {
        generateSchedulerChallengeLevel(scLevel)
      })

      // Add event listener to back to menu button
      scResult.querySelector(".back-to-menu").addEventListener("click", () => {
        schedulerChallengeGame.style.display = "none"
        gameMenu.style.display = "block"
      })
    }
  }

  // Reset Scheduler Challenge level
  scResetButton.addEventListener("click", () => {
    generateSchedulerChallengeLevel(scLevel)
  })

  // Check Scheduler Challenge answer
  scCheckButton.addEventListener("click", () => {
    checkSchedulerChallengeAnswer()
  })

  // ==================== ALGORITHM MASTER GAME ====================

  // Algorithm Master Game variables
  let amLevel = 1
  let amScore = 0
  let amTimeLeft = 30
  let amTimer = null
  let amQuestions = []
  let amCurrentQuestion = 0
  let amSelectedAnswer = null
  let amGameState = "playing" // playing, correct, wrong, completed

  // Algorithm Master Game elements
  const amLevelDisplay = document.getElementById("am-level")
  const amLevelDisplaySmall = document.getElementById("am-level-display")
  const amScoreDisplay = document.getElementById("am-score")
  const amTimeLeftDisplay = document.getElementById("am-time-left")
  // Progress bar element is removed from HTML, but we'll keep the variable to avoid errors
  const amProgressBar = { style: { width: "100%" } } // Dummy object
  const amQuestionDisplay = document.getElementById("am-question")
  const amTotalQuestionsDisplay = document.getElementById("am-total-questions")
  const amProcessTable = document.getElementById("am-process-table").querySelector("tbody")
  const amGanttChart = document.getElementById("am-gantt-chart")
  const amOptions = document.getElementById("am-options")
  const amAnswerButton = document.getElementById("am-answer")
  const amGameArea = document.getElementById("am-game-area")
  const amResult = document.getElementById("am-result")

  // Initialize Algorithm Master Game
  function initAlgorithmMaster() {
    // Reset game state
    amLevel = 1
    amScore = 0
    amGameState = "playing"
    amCurrentQuestion = 0

    // Update displays
    amLevelDisplay.textContent = `Level ${amLevel}`
    amLevelDisplaySmall.textContent = amLevel
    amScoreDisplay.textContent = amScore

    // Generate questions
    generateAlgorithmMasterQuestions(amLevel)
  }

  // Generate Algorithm Master questions
  function generateAlgorithmMasterQuestions(level) {
    // Reset game state
    amGameState = "playing"
    amSelectedAnswer = null
    amTimeLeft = 30
    // Progress bar is removed, but we'll keep the line to avoid errors
    amProgressBar.style.width = "100%"

    // Update displays
    amTimeLeftDisplay.textContent = amTimeLeft

    // Clear timers
    if (amTimer) clearInterval(amTimer)

    // Generate questions based on level
    const numQuestions = Math.min(3 + level, 10)
    amQuestions = []

    for (let i = 0; i < numQuestions; i++) {
      // Generate processes
      const numProcesses = Math.floor(Math.random() * 2) + 3 // 3-4 processes
      const processes = []

      for (let j = 0; j < numProcesses; j++) {
        processes.push({
          id: `P${j + 1}`,
          arrivalTime: Math.floor(Math.random() * 5),
          burstTime: Math.floor(Math.random() * 8) + 2,
          priority: Math.floor(Math.random() * 5) + 1,
          color: colors[j % colors.length],
        })
      }

      // Choose algorithm
      const algorithms = ["fcfs", "sjf", "rr", "priority"]
      const correctAlgorithm = algorithms[Math.floor(Math.random() * algorithms.length)]

      // Generate Gantt chart based on algorithm
      const ganttChart = generateAlgorithmMasterGanttChart(processes, correctAlgorithm)

      // Generate options (including the correct one)
      const options = [
        "First-Come, First-Served (FCFS)",
        "Shortest Job First (SJF)",
        "Round Robin (RR)",
        "Priority Scheduling",
      ]

      amQuestions.push({
        id: i,
        processes,
        ganttChart,
        correctAlgorithm,
        options,
      })
    }

    // Update question count
    amTotalQuestionsDisplay.textContent = amQuestions.length

    // Show first question
    showAlgorithmMasterQuestion(0)
  }

  // Generate Algorithm Master Gantt chart
  function generateAlgorithmMasterGanttChart(processes, algorithm) {
    const ganttChart = []
    let currentTime = 0

    if (algorithm === "fcfs") {
      // Sort by arrival time
      const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime)

      sortedProcesses.forEach((process) => {
        if (currentTime < process.arrivalTime) {
          currentTime = process.arrivalTime
        }

        ganttChart.push({
          processId: process.id,
          startTime: currentTime,
          endTime: currentTime + process.burstTime,
        })

        currentTime += process.burstTime
      })
    } else if (algorithm === "sjf") {
      // Non-preemptive SJF
      const remainingProcesses = [...processes]
      const completedProcesses = []

      while (completedProcesses.length < processes.length) {
        // Find available processes
        const availableProcesses = remainingProcesses.filter(
          (p) => p.arrivalTime <= currentTime && !completedProcesses.includes(p.id),
        )

        if (availableProcesses.length === 0) {
          // No process available, jump to next arrival
          const nextArrival = remainingProcesses
            .filter((p) => !completedProcesses.includes(p.id))
            .reduce((min, p) => Math.min(min, p.arrivalTime), Number.POSITIVE_INFINITY)

          currentTime = nextArrival
          continue
        }

        // Find shortest job
        const shortestJob = availableProcesses.reduce((prev, curr) => (prev.burstTime < curr.burstTime ? prev : curr))

        ganttChart.push({
          processId: shortestJob.id,
          startTime: currentTime,
          endTime: currentTime + shortestJob.burstTime,
        })

        currentTime += shortestJob.burstTime
        completedProcesses.push(shortestJob.id)
      }
    } else if (algorithm === "rr") {
      // Round Robin with quantum = 2
      const quantum = 2
      const remainingProcesses = processes.map((p) => ({ ...p, remainingTime: p.burstTime }))
      const completedProcesses = []
      const readyQueue = []

      // Add initial processes to ready queue
      remainingProcesses
        .filter((p) => p.arrivalTime <= currentTime)
        .sort((a, b) => a.arrivalTime - b.arrivalTime)
        .forEach((p) => readyQueue.push(p))

      while (completedProcesses.length < processes.length) {
        if (readyQueue.length === 0) {
          // No process in ready queue, jump to next arrival
          if (remainingProcesses.some((p) => !completedProcesses.includes(p.id))) {
            const nextArrival = remainingProcesses
              .filter((p) => !completedProcesses.includes(p.id) && p.arrivalTime > currentTime)
              .reduce((min, p) => Math.min(min, p.arrivalTime), Number.POSITIVE_INFINITY)

            currentTime = nextArrival

            // Add newly arrived processes to ready queue
            remainingProcesses
              .filter((p) => !completedProcesses.includes(p.id) && p.arrivalTime <= currentTime)
              .sort((a, b) => a.arrivalTime - b.arrivalTime)
              .forEach((p) => readyQueue.push(p))

            continue
          } else {
            break // All processes completed
          }
        }

        // Get next process from ready queue
        const currentProcess = readyQueue.shift()

        // Calculate execution time for this quantum
        const executionTime = Math.min(quantum, currentProcess.remainingTime)

        ganttChart.push({
          processId: currentProcess.id,
          startTime: currentTime,
          endTime: currentTime + executionTime,
        })

        currentTime += executionTime
        currentProcess.remainingTime -= executionTime

        // Add newly arrived processes to ready queue
        remainingProcesses
          .filter(
            (p) =>
              !completedProcesses.includes(p.id) &&
              !readyQueue.some((rp) => rp.id === p.id) &&
              p.id !== currentProcess.id &&
              p.arrivalTime <= currentTime,
          )
          .sort((a, b) => a.arrivalTime - b.arrivalTime)
          .forEach((p) => readyQueue.push(p))

        // Check if current process is completed
        if (currentProcess.remainingTime === 0) {
          completedProcesses.push(currentProcess.id)
        } else {
          // Put back in ready queue
          readyQueue.push(currentProcess)
        }
      }
    } else if (algorithm === "priority") {
      // Non-preemptive Priority Scheduling
      const remainingProcesses = [...processes]
      const completedProcesses = []

      while (completedProcesses.length < processes.length) {
        // Find available processes
        const availableProcesses = remainingProcesses.filter(
          (p) => p.arrivalTime <= currentTime && !completedProcesses.includes(p.id),
        )

        if (availableProcesses.length === 0) {
          // No process available, jump to next arrival
          const nextArrival = remainingProcesses
            .filter((p) => !completedProcesses.includes(p.id))
            .reduce((min, p) => Math.min(min, p.arrivalTime), Number.POSITIVE_INFINITY)

          currentTime = nextArrival
          continue
        }

        // Find highest priority process (lower number = higher priority)
        const highestPriorityProcess = availableProcesses.reduce((prev, curr) =>
          prev.priority < curr.priority ? prev : curr,
        )

        ganttChart.push({
          processId: highestPriorityProcess.id,
          startTime: currentTime,
          endTime: currentTime + highestPriorityProcess.burstTime,
        })

        currentTime += highestPriorityProcess.burstTime
        completedProcesses.push(highestPriorityProcess.id)
      }
    }

    return ganttChart
  }

  // Show Algorithm Master question
  function showAlgorithmMasterQuestion(questionIndex) {
    // Reset game state for this question
    amSelectedAnswer = null
    amTimeLeft = 30
    // Progress bar is removed, but we'll keep the line to avoid errors
    amProgressBar.style.width = "100%"

    // Update displays
    amTimeLeftDisplay.textContent = amTimeLeft
    amQuestionDisplay.textContent = questionIndex + 1

    // Get current question
    const question = amQuestions[questionIndex]
    if (!question) {
      console.error("Question not found at index:", questionIndex)
      return
    }

    // Update process table
    amProcessTable.innerHTML = ""

    question.processes.forEach((process) => {
      const row = document.createElement("tr")

      row.innerHTML = `
      <td>${process.id}</td>
      <td>${process.arrivalTime}</td>
      <td>${process.burstTime}</td>
      <td>${process.priority}</td>
    `

      amProcessTable.appendChild(row)
    })

    // Update Gantt chart
    amGanttChart.innerHTML = ""

    question.ganttChart.forEach((item, index) => {
      const process = question.processes.find((p) => p.id === item.processId)
      if (!process) {
        console.error("Process not found:", item.processId)
        return
      }

      const ganttBlock = document.createElement("div")
      ganttBlock.className = "am-gantt-block"

      ganttBlock.innerHTML = `
      <div class="am-gantt-process ${process.color}" style="width: ${(item.endTime - item.startTime) * 40}px; min-width: 40px;">
        ${item.processId}
      </div>
      <div class="am-gantt-time">
        ${index === 0 ? `<span>${item.startTime}</span>` : ""}
        <span style="margin-left: auto;">${item.endTime}</span>
      </div>
    `

      amGanttChart.appendChild(ganttBlock)
    })

    // Update options
    amOptions.innerHTML = ""

    question.options.forEach((option) => {
      const optionElement = document.createElement("div")
      optionElement.className = "algorithm-option"
      optionElement.textContent = option

      // Add click event listener
      optionElement.addEventListener("click", function () {
        // Remove selected class from all options
        document.querySelectorAll(".algorithm-option").forEach((opt) => {
          opt.classList.remove("selected")
        })

        // Add selected class to clicked option
        this.classList.add("selected")

        // Update selected answer
        amSelectedAnswer = option

        // Enable answer button
        amAnswerButton.disabled = false
      })

      amOptions.appendChild(optionElement)
    })

    // Disable answer button
    amAnswerButton.disabled = true

    // Show game area, hide result
    amGameArea.style.display = "block"
    amResult.style.display = "none"

    // Start timer
    startAlgorithmMasterTimer()
  }

  // Start Algorithm Master timer
  function startAlgorithmMasterTimer() {
    if (amTimer) clearInterval(amTimer)

    amTimer = setInterval(() => {
      amTimeLeft--
      amTimeLeftDisplay.textContent = amTimeLeft

      // Progress bar update is removed
      // const progress = (amTimeLeft / 30) * 100
      // amProgressBar.style.width = `${progress}%`

      if (amTimeLeft <= 0) {
        clearInterval(amTimer)
        checkAlgorithmMasterAnswer()
      }
    }, 1000)
  }

  // Check Algorithm Master answer
  function checkAlgorithmMasterAnswer() {
    // Stop timer
    if (amTimer) clearInterval(amTimer)

    // Get current question
    const question = amQuestions[amCurrentQuestion]

    // Get correct answer
    const correctAnswer =
      question.correctAlgorithm === "fcfs"
        ? "First-Come, First-Served (FCFS)"
        : question.correctAlgorithm === "sjf"
          ? "Shortest Job First (SJF)"
          : question.correctAlgorithm === "rr"
            ? "Round Robin (RR)"
            : "Priority Scheduling"

    // Check if answer is correct
    const isCorrect = amSelectedAnswer === correctAnswer

    // Update game state
    amGameState = isCorrect ? "correct" : "wrong"

    // Update score
    if (isCorrect) {
      amScore += amLevel * 50
      amScoreDisplay.textContent = amScore
    }

    // Show result
    showAlgorithmMasterResult(isCorrect, correctAnswer)
  }

  // Show Algorithm Master result
  function showAlgorithmMasterResult(isCorrect, correctAnswer) {
    // Hide game area
    amGameArea.style.display = "none"

    // Show result
    amResult.style.display = "block"

    if (isCorrect) {
      amResult.innerHTML = `
              <div class="result-success">
                  <div class="result-title">
                      <i class="fas fa-trophy"></i>
                      <span>Jawaban Benar!</span>
                  </div>
                  <p class="result-message">
                      Selamat! Anda berhasil menebak algoritma penjadwalan dengan benar.
                  </p>
                  <div class="result-actions">
                      ${
                        amCurrentQuestion < amQuestions.length - 1
                          ? `
                          <button class="btn btn-primary" id="am-next-question">Pertanyaan Selanjutnya</button>
                      `
                          : `
                          <button class="btn btn-outline back-to-menu">Kembali ke Menu</button>
                          <button class="btn btn-primary" id="am-next-level">Level Selanjutnya</button>
                      `
                      }
                  </div>
              </div>
          `

      if (amCurrentQuestion < amQuestions.length - 1) {
        // Add event listener to next question button
        document.getElementById("am-next-question").addEventListener("click", () => {
          amCurrentQuestion++
          showAlgorithmMasterQuestion(amCurrentQuestion)
        })
      } else {
        // Add event listener to next level button
        document.getElementById("am-next-level").addEventListener("click", () => {
          amLevel++
          amLevelDisplay.textContent = `Level ${amLevel}`
          amLevelDisplaySmall.textContent = amLevel
          amCurrentQuestion = 0
          generateAlgorithmMasterQuestions(amLevel)
        })

        // Add event listener to back to menu button
        amResult.querySelector(".back-to-menu").addEventListener("click", () => {
          algorithmMasterGame.style.display = "none"
          gameMenu.style.display = "block"
        })
      }
    } else {
      amResult.innerHTML = `
              <div class="result-error">
                  <div class="result-title">
                      <i class="fas fa-times-circle"></i>
                      <span>Jawaban Salah</span>
                  </div>
                  <p class="result-message">
                      Jawaban yang benar adalah: ${correctAnswer}
                  </p>
                  <div class="result-actions">
                      ${
                        amCurrentQuestion < amQuestions.length - 1
                          ? `
                          <button class="btn btn-primary" id="am-next-question">Pertanyaan Selanjutnya</button>
                      `
                          : `
                          <button class="btn btn-outline back-to-menu">Kembali ke Menu</button>
                          <button class="btn btn-primary" id="am-restart">Mulai Ulang</button>
                      `
                      }
                  </div>
              </div>
          `

      if (amCurrentQuestion < amQuestions.length - 1) {
        // Add event listener to next question button
        document.getElementById("am-next-question").addEventListener("click", () => {
          amCurrentQuestion++
          showAlgorithmMasterQuestion(amCurrentQuestion)
        })
      } else {
        // Add event listener to restart button
        document.getElementById("am-restart").addEventListener("click", () => {
          amCurrentQuestion = 0
          generateAlgorithmMasterQuestions(amLevel)
        })

        // Add event listener to back to menu button
        amResult.querySelector(".back-to-menu").addEventListener("click", () => {
          algorithmMasterGame.style.display = "none"
          gameMenu.style.display = "block"
        })
      }
    }
  }

  // Answer button
  amAnswerButton.addEventListener("click", () => {
    checkAlgorithmMasterAnswer()
  })
})

