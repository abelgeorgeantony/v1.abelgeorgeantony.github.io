async function loaderScrStart() {}
function loaderScrStop() {
  document.getElementById("loader").classList.add("hidden");
}
document.addEventListener("DOMContentLoaded", async function () {
  loaderScrStart();
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
  document
    .getElementById("context-theme-toggle")
    .addEventListener("click", () => {
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
  initLineScrollbar();
  initAsideContent();
  initCustomContextMenu(); // Initialize the custom context menu
});

window.addEventListener("load", () => {
  console.log("load event fired");
  loaderScrStop();
});

// --- Custom Context Menu Logic ---
function initCustomContextMenu() {
  const customContextMenu = document.getElementById("custom-context-menu");
  const showBrowserMenuOption = document.getElementById(
    "context-show-browser-menu",
  );
  let nativeContextMenuRequested = false;
  let lastContextMenuEvent = null;

  // Helper function to trigger a contextmenu event (now internal)
  const triggerContextMenu = function (targetElement, clientX, clientY) {
    nativeContextMenuRequested = true; // Set flag to allow native menu for the *next* contextmenu event

    // Dispatch mousedown event
    targetElement.dispatchEvent(
      new MouseEvent("mousedown", {
        bubbles: true,
        cancelable: true,
        clientX: clientX,
        clientY: clientY,
        button: 2, // Right mouse button
        buttons: 2,
      }),
    );

    // Dispatch mouseup event (this is what often triggers the native contextmenu)
    targetElement.dispatchEvent(
      new MouseEvent("mouseup", {
        bubbles: true,
        cancelable: true,
        clientX: clientX,
        clientY: clientY,
        button: 2, // Right mouse button
        buttons: 2,
      }),
    );
  };

  // Define the main contextmenu handler directly
  const handleDocumentContextMenu = function (e) {
    if (nativeContextMenuRequested) {
      nativeContextMenuRequested = false; // Reset the flag after allowing native menu to show
      return; // Allow native context menu to show
    }
    if (window.getSelection().type === "Range") {
      nativeContextMenuRequested = false; // Reset the flag after allowing native menu to show
      return; // Allow native context menu to show
    }
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      nativeContextMenuRequested = false; // Reset the flag after allowing native menu to show
      return; // Allow native context menu to show
    }
    if (e.target.tagName === "A" || e.target.parentElement.tagName === "A") {
      nativeContextMenuRequested = false; // Reset the flag after allowing native menu to show
      return; // Allow native context menu to show
    }
    if (e.target.tagName === "IMG") {
      nativeContextMenuRequested = false; // Reset the flag after allowing native menu to show
      return; // Allow native context menu to show
    }
    if (
      e.target === document.getElementById("custom-scrollbar-container") ||
      e.target.classList.contains("scrollbar-line")
    ) {
      e.preventDefault();
      return;
    }
    console.log(e);
    e.preventDefault(); // Prevent default browser context menu

    lastContextMenuEvent = e; // Store the event

    customContextMenu.style.display = "block";

    // Position the menu
    let left = e.clientX;
    let top = e.clientY;

    // Ensure menu stays within viewport
    const menuWidth = customContextMenu.offsetWidth;
    const menuHeight = customContextMenu.offsetHeight;
    console.log("Width: " + menuWidth + ", Height: " + menuHeight);
    const customScrollbar = document.getElementById(
      "custom-scrollbar-container",
    );
    const scrollbarWidth = customScrollbar ? customScrollbar.offsetWidth : 0;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left + menuWidth > viewportWidth) {
      left = viewportWidth - menuWidth;
    }
    if (top + menuHeight > viewportHeight) {
      top = viewportHeight - menuHeight;
    }

    customContextMenu.style.left = `${left}px`;
    customContextMenu.style.top = `${top}px`;
  };

  const handleScrollBtnsVisibility = function () {
    const scrollY = Number(window.scrollY);
    const documentHeight =
      Number(document.documentElement.scrollHeight) -
      Number(window.innerHeight);
    if (scrollY === 0) {
      document.getElementById("context-page-scroll-up").classList.add("hidden");
      document
        .getElementById("context-page-scroll-down")
        .classList.remove("hidden");
    } else if (scrollY >= documentHeight) {
      document
        .getElementById("context-page-scroll-down")
        .classList.add("hidden");
      document
        .getElementById("context-page-scroll-up")
        .classList.remove("hidden");
    } else {
      document
        .getElementById("context-page-scroll-up")
        .classList.remove("hidden");
      document
        .getElementById("context-page-scroll-down")
        .classList.remove("hidden");
    }
    const menuHeight = customContextMenu.offsetHeight;
    const viewportHeight = window.innerHeight;
    const oldTop = parseFloat(customContextMenu.style.top.replace("px", ""));
    if (oldTop + menuHeight > viewportHeight) {
      const newTop = viewportHeight - menuHeight;
      customContextMenu.style.top = `${newTop}px`;
    }
  };

  // Add the main contextmenu handler
  document.addEventListener("contextmenu", handleDocumentContextMenu);

  window.onscroll = () => {
    handleScrollBtnsVisibility();
  };

  document.addEventListener("click", function (e) {
    // Hide the custom context menu if clicking outside of it
    if (
      customContextMenu.style.display === "block" &&
      !customContextMenu.contains(e.target)
    ) {
      customContextMenu.style.display = "none";
    }
  });

  // Option to show the browser's default context menu
  if (showBrowserMenuOption) {
    showBrowserMenuOption.addEventListener("click", function () {
      // console.log("Show Browser Menu clicked."); // Debugging
      customContextMenu.style.display = "none"; // Hide custom menu
      if (lastContextMenuEvent) {
        // Set flag and trigger the context menu event using the helper
        triggerContextMenu(
          lastContextMenuEvent.target,
          lastContextMenuEvent.clientX,
          lastContextMenuEvent.clientY,
        );
        // The flag will be reset in handleDocumentContextMenu
      }
    });
  }

  // Generic click handlers for other custom options (for now)
  const customOptions = customContextMenu.querySelectorAll(
    ".custom-context-menu-item:not(#context-show-browser-menu)",
  );
  customOptions.forEach((option) => {
    option.addEventListener("click", function () {
      console.log(`Custom Option Clicked: ${this.textContent}`);
      customContextMenu.style.display = "none";
      // Add specific functionality for each option later
    });
  });

  handleScrollBtnsVisibility();
}

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
    document
      .getElementById("context-theme-toggle")
      .querySelector("span").textContent = "light_mode";
    document
      .getElementById("context-theme-toggle")
      .querySelector("p").textContent = "Light theme";
    document.cookie = "theme=dark; path=/; max-age=31536000";
  } else {
    document.documentElement.removeAttribute("data-theme");
    document
      .getElementById("context-theme-toggle")
      .querySelector("span").textContent = "bedtime";
    document
      .getElementById("context-theme-toggle")
      .querySelector("p").textContent = "Dark theme";
    document.cookie = "theme=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  }
}

// --- Hashtag Drag and Drop Logic ---
function initHashtagDragAndDrop() {
  const containers = document.querySelectorAll(".hashtag-container");

  containers.forEach((container) => {
    const draggables = container.querySelectorAll(".hashtag");

    draggables.forEach((draggable) => {
      draggable.addEventListener("dragstart", (e) => {
        console.log(e.dataTransfer);
        document.body.style.cursor =
          "url('/images/icons/cursors/grabbing.cur'), grabbing !important";
        console.log(document.body.style.cursor);
        draggable.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move"; // Indicate a move operation
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
      element.dispatchEvent(
        new MouseEvent("mousemove", {
          clientX: e.clientX,
          clientY: e.clientY,
        }),
      );
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

function initLineScrollbar() {
  const container = document.getElementById("custom-scrollbar-container");
  const header = document.querySelector("header");

  // Ensure the header is loaded before getting its height
  setTimeout(() => {
    const headerHeight = header.offsetHeight;
    container.style.top = `${headerHeight}px`;
    container.style.height = `calc(100% - ${headerHeight}px)`;
  }, 100);

  const numLines = 70; // Earlier satisfied value = 50
  const peakSize = 3; // Number of lines to include in the peak on each side
  let lines = [];
  let isDraggingScrollbar = false;
  let startY = 0;
  let startScrollTop = 0;

  for (let i = 0; i < numLines; i++) {
    const line = document.createElement("div");
    line.className = "scrollbar-line";
    container.appendChild(line);
    lines.push(line);

    line.addEventListener("click", (e) => {
      // Prevent drag-start from triggering a click scroll if it was a drag
      if (isDraggingScrollbar) {
        isDraggingScrollbar = false;
        return;
      }
      const scrollPercentage = i / (numLines - 1);
      const scrollHeight = document.body.scrollHeight - window.innerHeight;
      const scrollTop = scrollPercentage * scrollHeight;
      window.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });
      line.style.cursor = "url(/images/icons/cursors/grab.cur), grab";
    });

    line.addEventListener("mousedown", (e) => {
      // Only initiate drag if the active line is clicked
      //START: do {
      if (line.classList.contains("active")) {
        isDraggingScrollbar = true;
        startY = e.clientY;
        startScrollTop = window.scrollY;

        // Prevent text selection during drag
        e.preventDefault();

        const onMouseMove = (moveEvent) => {
          if (!isDraggingScrollbar) return;

          const deltaY = moveEvent.clientY - startY;
          const scrollHeight = document.body.scrollHeight - window.innerHeight;
          const scrollbarHeight = container.offsetHeight; // Height of the visual scrollbar area

          // Calculate the scroll percentage based on mouse movement relative to scrollbar height
          // This factor scales the mouse movement to the full page scroll height
          const scrollFactor = scrollHeight / scrollbarHeight;
          const newScrollTop = startScrollTop + deltaY * scrollFactor;

          // Clamp newScrollTop to valid range
          const clampedScrollTop = Math.max(
            0,
            Math.min(scrollHeight, newScrollTop),
          );

          document.querySelectorAll(".scrollbar-line").forEach((line) => {
            line.style.cursor =
              "url(/images/icons/cursors/grabbing.cur), grabbing";
          });

          window.scrollTo({
            top: clampedScrollTop,
          });
        };

        const onMouseUp = () => {
          isDraggingScrollbar = false;
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
          // Restoring cursors
          document.querySelectorAll(".scrollbar-line").forEach((line) => {
            if (line.classList.contains("active")) {
              line.style.cursor = "url(images/icons/cursors/grab.cur), grab";
            } else {
              line.style.cursor =
                "url(images/icons/cursors/pointer.cur), pointer";
            }
          });
          document.body.removeAttribute("style");
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        // Change cursor to indicate dragging
        document.body.style.cursor =
          "url(/images/icons/cursors/grabbing.cur), grabbing";
        //break START;
      } else {
        line.click();
        console.log(line);
        //continue START;
        //line.dispatchEvent(new Event("mousedown"));
      }
      //break START;
      //} while (true);
    });
  }

  function updateScrollbar() {
    const scrollTop = window.scrollY;
    const scrollHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercentage = scrollTop / scrollHeight;
    const activateIndex = Math.floor(scrollPercentage * (numLines - 1) + 0.5);

    lines.forEach((line, index) => {
      //console.log(index, activeIndex);
      line.classList.remove("active", "near-1", "near-2", "near-3");

      if (index === activateIndex) {
        line.classList.add("active");
      } else {
        const distance = Math.abs(index - activateIndex);
        if (distance <= peakSize) {
          line.classList.add(`near-${distance}`);
        }
      }
    });
  }

  window.addEventListener("scroll", () => {
    updateScrollbar();
  });
  updateScrollbar();
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function scrollToBottom() {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
}

function initAsideContent() {
  const aside = document.querySelector("aside");
  const header = document.querySelector("header");

  // Ensure the header is loaded before getting its height
  setTimeout(() => {
    const headerHeight = header.offsetHeight;
    aside.style.marginTop = `${headerHeight}px`;
    aside.style.height = `calc(100% - ${headerHeight}px)`;
  }, 100);

  let positionIsUnset = false;
  function updateAsidePosition() {
    const marginTop = header.offsetHeight + window.scrollY;
    if (isFooterInViewport()) {
      if (!positionIsUnset) {
        aside.style.marginTop = `${marginTop}px`;
        aside.style.position = "unset";
        positionIsUnset = true;
      }
    } else {
      aside.removeAttribute("style");
      positionIsUnset = false;
    }
  }
  window.addEventListener(
    "scroll",
    () => {
      if (!isSmallScreen()) {
        updateAsidePosition();
      }
    },
    { passive: true },
  );
  updateAsidePosition();
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

function isFooterInViewport() {
  var rect = document.querySelector("footer").getBoundingClientRect();
  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight)
  );
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const colors = [
  "yellow",
  "red",
  "green",
  "blue",
  "purple",
  "orange",
  "pink",
  "brown",
];

document.addEventListener("selectionchange", () => {
  const selection = window.getSelection();
  console.log(selection.toString());
});

document.addEventListener("copy", () => {
  showToast("Copied!");
});

async function showToast(message, timeout = 2000) {
  const notifier = document.getElementById("toast-notification");
  notifier.innerText = message;
  notifier.classList.remove("hidden");

  setTimeout(() => {
    notifier.innerText = "";
    notifier.classList.add("hidden");
  }, timeout);
}
