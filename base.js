document.addEventListener("DOMContentLoaded", async function () {
  await loadAndReplaceHTML("header.html", "header-placeholder");
  await loadAndReplaceHTML("footer.html", "footer-placeholder");
  console.log("DOMContentLoaded event fired");

  // Get the filename of the current page (e.g., "index.html" or "blog.html")
  const path = window.location.pathname;
  const currentPage = path.split("/").pop();
  // If on the root domain, the filename might be empty, so default to "index.html"
  const activePage = currentPage === "" ? "index.html" : currentPage;
  // Get all the links in the navigation bar
  const navLinks = document.querySelectorAll("nav ul li a");
  // Loop through each navigation link
  navLinks.forEach((link) => {
    const linkPage = link.getAttribute("href");
    // If a link's href matches the current active page, hide its parent list item
    if (linkPage === activePage) {
      link.parentElement.style.display = "none";
    }
  });

  document.getElementById("hamburger-btn").addEventListener("click", () => {
    document.getElementById("mobile-menu").classList.add("is-active");
    document.body.classList.add("menu-open");
    const mobNavLinks = document
      .getElementById("mobile-menu")
      .querySelectorAll("ul li a");
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
});

/*// Function to load and REPLACE HTML partials
const loadAndReplaceHTML = async (url, elementId) => {
  const response = await fetch(url);
  const text = await response.text();

  // Create a temporary container to parse the fetched HTML string
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = text;

  // Get the actual element from the parsed HTML (e.g., the <header> or <footer> tag)
  const elementToInsert = tempDiv.firstElementChild;

  // Find the placeholder on the page
  const placeholder = document.getElementById(elementId);

  // Replace the placeholder with the new element
  if (placeholder && elementToInsert) {
    placeholder.replaceWith(elementToInsert);
  }
};*/

// Function to load and REPLACE HTML partials, now explicitly returning a Promise.
async function loadAndReplaceHTML(url, elementId) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => {
        // Check if the request was successful
        if (!response.ok) {
          throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        return response.text();
      })
      .then((text) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = text;
        const elementToInsert = tempDiv.firstElementChild;
        const placeholder = document.getElementById(elementId);

        if (placeholder && elementToInsert) {
          placeholder.replaceWith(elementToInsert);
          resolve(); // Promise resolved successfully
        } else {
          // Reject the promise if the placeholder or element is missing
          reject(
            new Error(
              `Placeholder #${elementId} or content from ${url} not found.`,
            ),
          );
        }
      })
      .catch((error) => {
        console.error("Error loading partial HTML:", error);
        reject(error); // Promise rejected on error
      });
  });
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

// --- NEW: Hashtag Drag and Drop Logic ---
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

// --- NEW: Hashtag Toggle Logic ---
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
