document.addEventListener("DOMContentLoaded", () => {
  // Delay initialization to ensure header is loaded
  setTimeout(init, 100);
});

function init() {
  const headerPageName = document.getElementById("header-page-name");
  const headerMyName = document.getElementById("header-my-name");

  if (!headerPageName || !headerMyName) {
    console.error("Required header elements not found. Retrying...");
    setTimeout(init, 500); // Retry after a delay
    return;
  }

  const separator = document.querySelector(".nav-left-container .separator");
  const sections = document.querySelectorAll("section[id]");
  const navBar = document.querySelector("header");

  if (!navBar || !separator) {
    console.error("Header or separator element not found.");
    return;
  }

  const navBarHeight = navBar.offsetHeight;

  function updateHeader() {
    const isMobile = window.innerWidth <= 768;
    let activeSectionFound = false;
    let currentSectionTitle = "";

    sections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top;
      const sectionTitleElement = section.querySelector("h1");

      if (sectionTop <= navBarHeight && sectionTitleElement) {
        const title = sectionTitleElement.textContent.trim();
        if (section.getBoundingClientRect().bottom > navBarHeight) {
          currentSectionTitle = title;
          activeSectionFound = true;
        }
      }
    });

    headerPageName.textContent = currentSectionTitle;

    if (headerPageName.textContent && !isMobile) {
      separator.style.display = "inline";
    } else {
      separator.style.display = "none";
    }

    if (activeSectionFound) {
      if (isMobile) {
        headerMyName.style.display = "none";
      } else {
        headerMyName.style.display = "inline-block";
      }
    } else {
      headerMyName.style.display = "inline-block";
    }
  }

  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("resize", updateHeader);

  // Initial check after a short delay to ensure layout is stable
  setTimeout(updateHeader, 100);

  // --- Mobile Menu Toggle ---
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const closeBtn = document.getElementById("close-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const body = document.body;

  if (hamburgerBtn && mobileMenu && closeBtn) {
    hamburgerBtn.addEventListener("click", () => {
      mobileMenu.classList.add("is-active");
      body.classList.add("menu-open");
    });

    closeBtn.addEventListener("click", () => {
      mobileMenu.classList.remove("is-active");
      body.classList.remove("menu-open");
    });
  } else {
    console.error("Mobile menu elements not found.");
  }
}
