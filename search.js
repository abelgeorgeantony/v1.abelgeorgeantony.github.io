document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  let posts = [];

  // Only run the search logic if the search input exists on the page
  if (searchInput) {
    fetch("/search.json")
      .then((response) => response.json())
      .then((data) => {
        posts = data;
      });

    searchInput.addEventListener("input", function () {
      const query = this.value.toLowerCase();
      searchResults.innerHTML = "";

      if (query.length === 0) {
        return;
      }

      const results = posts.filter((post) => {
        return (
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query)
        );
      });

      results.forEach((post) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = post.url;
        a.textContent = post.title;
        li.appendChild(a);
        searchResults.appendChild(li);
      });
    });
  }
});
