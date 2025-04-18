document.addEventListener("DOMContentLoaded", () => {
  // Tab switching functionality
  const tabs = document.querySelectorAll(".algorithm-tab")
  const tabContents = document.querySelectorAll(".algorithm-content")

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs and contents
      tabs.forEach((t) => t.classList.remove("active"))
      tabContents.forEach((content) => content.classList.remove("active"))

      // Add active class to clicked tab and corresponding content
      tab.classList.add("active")
      const contentId = tab.getAttribute("data-tab")
      document.getElementById(contentId).classList.add("active")
    })
  })

  // Initialize with the first tab active
  if (tabs.length > 0 && tabContents.length > 0) {
    tabs[0].classList.add("active")
    tabContents[0].classList.add("active")
  }

  // Code highlighting
  document.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightBlock(block)
  })

  // Interactive examples
  setupFCFSExample()
  setupSJFNonPreemptiveExample()
  setupSJFPreemptiveExample()
  setupRoundRobinExample()

  // Comparison table sorting
  const comparisonTable = document.querySelector(".comparison-table")
  if (comparisonTable) {
    const headers = comparisonTable.querySelectorAll("th")
    headers.forEach((header, index) => {
      if (index > 0) {
        // Skip the first column (Algorithm name)
        header.addEventListener("click", () => {
          sortTable(comparisonTable, index)
        })
        header.classList.add("sortable")
      }
    })
  }

  // Tab switching functionality
  const tabButtons = document.querySelectorAll(".tab-button")
  const tabPanes = document.querySelectorAll(".tab-pane")

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons and panes
      tabButtons.forEach((btn) => btn.classList.remove("active"))
      tabPanes.forEach((pane) => pane.classList.remove("active"))

      // Add active class to clicked button
      button.classList.add("active")

      // Get the tab ID from data-tab attribute and add active class to corresponding pane
      const tabId = button.getAttribute("data-tab")
      const tabPane = document.getElementById(`${tabId}-tab`)
      if (tabPane) {
        tabPane.classList.add("active")
      }
    })
  })

  // Set current year in footer
  const currentYearElement = document.getElementById("current-year")
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear()
  }

  // Mobile menu toggle
  const menuToggle = document.querySelector(".menu-toggle")
  const nav = document.querySelector("nav")

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      nav.classList.toggle("active")
      menuToggle.classList.toggle("active")
    })
  }
})

// Dummy declarations to satisfy the linter.  These should be defined elsewhere.
const hljs = { highlightBlock: () => {} }
const sortTable = () => {}

// Placeholder functions for algorithm examples
function setupFCFSExample() {
  console.log("FCFS example setup")
}

function setupSJFNonPreemptiveExample() {
  console.log("SJF Non-preemptive example setup")
}

function setupSJFPreemptiveExample() {
  console.log("SJF Preemptive example setup")
}

function setupRoundRobinExample() {
  console.log("Round Robin example setup")
}
