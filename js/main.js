// Set current year in footer and initialize UI functionality
document.addEventListener("DOMContentLoaded", () => {
  // Set current year in footer
  const currentYearElements = document.querySelectorAll("#current-year")
  const currentYear = new Date().getFullYear()

  currentYearElements.forEach((element) => {
    element.textContent = currentYear
  })

  // Mobile menu toggle
  const menuToggle = document.querySelector(".menu-toggle")
  const nav = document.querySelector("nav")
  const navUl = document.querySelector("nav ul")

  if (menuToggle && nav && navUl) {
    menuToggle.addEventListener("click", () => {
      nav.classList.toggle("active")
      navUl.classList.toggle("active")
      menuToggle.classList.toggle("active")
    })
  }

  // Animasi untuk ilustrasi penjadwalan proses
  animateSchedulerIllustration()
})

// Animate the scheduler illustration on the homepage
function animateSchedulerIllustration() {
  // Check if the element exists (only on homepage)
  const progressFill = document.querySelector(".progress-fill")
  if (!progressFill) return

  // Animate CPU progress
  setInterval(() => {
    progressFill.style.width = "0%"
    setTimeout(() => {
      progressFill.style.transition = "width 1.8s ease-in-out"
      progressFill.style.width = "75%"
    }, 200)

    setTimeout(() => {
      progressFill.style.transition = "none"
    }, 2000)
  }, 2000)

  // Animate process in ready queue and CPU
  const queueProcesses = document.querySelectorAll(".queue-processes .process")
  const processIndicator = document.querySelector(".process-indicator")

  if (queueProcesses.length > 0 && processIndicator) {
    let currentProcessIndex = 0

    // Set initial process
    updateCurrentProcess(currentProcessIndex)

    setInterval(() => {
      // Move to next process
      currentProcessIndex = (currentProcessIndex + 1) % queueProcesses.length

      // Update current process in CPU
      updateCurrentProcess(currentProcessIndex)

      // Rotate processes in queue
      const firstProcess = queueProcesses[0].cloneNode(true)
      queueProcesses[0].parentNode.appendChild(firstProcess)
      queueProcesses[0].parentNode.removeChild(queueProcesses[0])
    }, 4000)
  }

  // Update the current process in the CPU visualization
  function updateCurrentProcess(index) {
    if (!processIndicator) return

    // Get class from process
    const processClass = queueProcesses[index].className.match(/\bp\d+\b/)[0]

    // Update process indicator
    processIndicator.className = "process-indicator " + processClass
    processIndicator.textContent = queueProcesses[index].textContent
  }
}

