const themeToggle = document.getElementById("theme-toggle");
const themeIcon = themeToggle.querySelector("span");
const html = document.documentElement;

// Function to get a cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// Function to set the theme
function setTheme(theme) {
  if (theme === "dark") {
    html.setAttribute("data-theme", "dark");
    themeIcon.textContent = "dark_mode";
    document.cookie = "theme=dark; path=/; max-age=31536000";
  } else {
    html.removeAttribute("data-theme");
    themeIcon.textContent = "light_mode";
    document.cookie = "theme=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  }
}

// Check for saved theme preference in cookie
const savedTheme = getCookie("theme");
setTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  const currentTheme = html.getAttribute("data-theme");
  if (currentTheme === "dark") {
    setTheme("light");
  } else {
    setTheme("dark");
  }
});
