document.addEventListener("DOMContentLoaded", async function () {
  console.log("DOMContentLoaded event fired");

  document.getElementById("hamburger-btn").addEventListener("click", () => {
    document.getElementById("mobile-menu").classList.add("is-active");
    document.body.classList.add("menu-open");
    const mobNavLinks = document
      .getElementById("mobile-menu")
      .querySelectorAll("ul li a");
    const activePage = window.location.pathname;
    // Loop through each navigation link
    mobNavLinks.forEach((link) => {
      const linkPage = link.getAttribute("href");
      // If a link's href matches the current active page, hide its parent list item
      if (linkPage === activePage) {
        link.parentElement.style.display = "none";
      }
    });
  });
  document.getElementById("close-btn").addEventListener("click", () => {
    document.getElementById("mobile-menu").classList.remove("is-active");
    document.body.classList.remove("menu-open");
  });

  // Check for saved theme preference in cookie
  const savedTheme = getCookie("theme");
  setTheme(savedTheme);
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    if (currentTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  });

  initHashtagDragAndDrop();
  initHashtagToggle();
  initTooltips();
});

function isSmallScreen() {
  // You can adjust the 768px breakpoint as needed
  return window.matchMedia("(max-width: 768px)").matches;
}

// Function to get a cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// Function to set the theme
function setTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    document.getElementById("theme-toggle").querySelector("span").textContent =
      "bedtime";
    document.cookie = "theme=dark; path=/; max-age=31536000";
  } else {
    document.documentElement.removeAttribute("data-theme");
    document.getElementById("theme-toggle").querySelector("span").textContent =
      "light_mode";
    document.cookie = "theme=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  }
}

// --- Hashtag Drag and Drop Logic ---
function initHashtagDragAndDrop() {
  const containers = document.querySelectorAll(".hashtag-container");

  containers.forEach((container) => {
    const draggables = container.querySelectorAll(".hashtag");

    draggables.forEach((draggable) => {
      draggable.addEventListener("dragstart", () => {
        draggable.classList.add("dragging");
      });

      draggable.addEventListener("dragend", () => {
        draggable.classList.remove("dragging");
      });
    });

    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(container, e.clientX);
      const draggable = document.querySelector(".dragging");
      if (afterElement == null) {
        container.appendChild(draggable);
      } else {
        container.insertBefore(draggable, afterElement);
      }
    });
  });

  function getDragAfterElement(container, x) {
    const draggableElements = [
      ...container.querySelectorAll(".hashtag:not(.dragging)"),
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = x - box.left - box.width / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY },
    ).element;
  }
}

// --- Hashtag Toggle Logic ---
function initHashtagToggle() {
  const hashtagIcons = document.querySelectorAll(".hashtag .close-icon");

  hashtagIcons.forEach((icon) => {
    icon.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent drag and drop from firing
      const hashtag = icon.parentElement;
      hashtag.classList.toggle("inactive");

      if (hashtag.classList.contains("inactive")) {
        icon.textContent = "add";
      } else {
        icon.textContent = "close";
      }
    });
  });
}

// --- Tooltip Logic ---
function initTooltips() {
  const tooltip = document.createElement("div");
  tooltip.className = "cursor-tooltip";
  document.body.appendChild(tooltip);

  const tooltipElements = document.querySelectorAll("[data-tooltip]");

  tooltipElements.forEach((element) => {
    element.addEventListener("mouseenter", (e) => {
      const tooltipText = element.getAttribute("data-tooltip");
      tooltip.textContent = tooltipText;
      tooltip.style.display = "block";
    });

    element.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
    });

    element.addEventListener("mousemove", (e) => {
      const tooltipWidth = tooltip.offsetWidth;
      const tooltipHeight = tooltip.offsetHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const cursorOffset = 15; // A small buffer

      // Default position: above the cursor, horizontally centered
      let newLeft = e.clientX - tooltipWidth / 2;
      let newTop = e.clientY - tooltipHeight - cursorOffset;

      // If it overflows the top, flip it to be below the cursor
      if (newTop < 0) {
        newTop = e.clientY + cursorOffset;
      }

      // If it overflows the left, stick it to the left edge
      if (newLeft < 0) {
        newLeft = 0;
      }

      // If it overflows the right, stick it to the right edge
      if (newLeft + tooltipWidth > viewportWidth) {
        newLeft = viewportWidth - tooltipWidth;
      }

      // This case is less likely with the above logic, but as a fallback
      if (newTop + tooltipHeight > viewportHeight) {
        newTop = viewportHeight - tooltipHeight;
      }

      tooltip.style.left = newLeft + "px";
      tooltip.style.top = newTop + "px";
    });
  });
}

// --- Fortune Logic ---
function getFortune() {
  if (typeof Module === "undefined" || !Module._minifortune) {
    console.error("Minifortune module not loaded or ready.");
    return null;
  }
  try {
    const fortunePtr = Module._minifortune();
    const fortuneString = UTF8ToString(fortunePtr);
    //const fortuneText = document.getElementById("fortune-text");
    //if (fortuneText) {
    //fortuneText.innerText = fortuneString;
    //}
    Module._free(fortunePtr);
    return fortuneString;
  } catch (e) {
    console.error("Error getting fortune:", e);
    return null;
  }
}

function onFortuneModuleReady() {
  const myFortune = getFortune();
  if (myFortune) {
    const fortuneText = document.getElementById("fortune-text");
    if (fortuneText) {
      fortuneText.innerHTML = cowsay(myFortune);
    } else {
      console.error("fortune-text element not found. Retrying...");
      setTimeout(onFortuneModuleReady, 500); // Retry after a delay
      return;
    }
  }
}
