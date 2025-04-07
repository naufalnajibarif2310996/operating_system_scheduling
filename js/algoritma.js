document.addEventListener("DOMContentLoaded", () => {
    // Tab functionality
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabPanes = document.querySelectorAll(".tab-pane");
    const tabNavButtons = document.querySelectorAll(".tab-nav-btn");
  
    // Check if URL has a hash
    const hash = window.location.hash;
    if (hash) {
      const tabId = hash.substring(1); // Remove the # character
      activateTab(tabId);
    }
  
    // Tab button click event
    tabButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const tabId = this.dataset.tab;
        activateTab(tabId);
      });
    });
  
    // Tab navigation button click event
    tabNavButtons.forEach((button) => {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        const tabId = this.dataset.tab;
        activateTab(tabId);
      });
    });
  
    // Function to activate a tab
    function activateTab(tabId) {
      // Update URL hash
      window.location.hash = tabId;
  
      // Deactivate all tabs
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabPanes.forEach((pane) => pane.classList.remove("active"));
  
      // Activate the selected tab
      const selectedButton = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
      const selectedPane = document.getElementById(tabId);
  
      if (selectedButton && selectedPane) {
        selectedButton.classList.add("active");
        selectedPane.classList.add("active");
  
        // Scroll to the tab content
        selectedPane.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });