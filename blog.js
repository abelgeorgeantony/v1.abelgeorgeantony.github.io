document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.split("/").pop();

  if (path === "blogs.html") {
    renderBlogList();
  } else if (path === "blog.html") {
    const params = new URLSearchParams(window.location.search);
    const postName = params.get("post");
    if (postName) {
      renderSinglePost(postName);
    } else {
      renderSearch();
    }
  }
});

function parseFrontmatter(text) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = text.match(frontmatterRegex);
  const frontmatter = {};
  if (match) {
    const yaml = match[1];
    yaml.split("\n").forEach((line) => {
      const [key, ...value] = line.split(":");
      if (key && value.length > 0) {
        frontmatter[key.trim()] = value.join(":").trim().replace(/['|"]/g, "");
      }
    });
  }
  return frontmatter;
}

async function renderBlogList() {
  const container = document.getElementById("blog-posts-container");
  if (!container) return;

  try {
    const manifestResponse = await fetch("blogs/manifest.json");
    if (!manifestResponse.ok) throw new Error("Manifest not found");
    const manifest = await manifestResponse.json();

    container.innerHTML = ""; // Clear existing content

    for (const postFile of manifest) {
      const postResponse = await fetch(`blogs/${postFile}`);
      const postText = await postResponse.text();
      const frontmatter = parseFrontmatter(postText);

      const postElement = document.createElement("article");
      postElement.className = "blog-list-item";
      postElement.innerHTML = `
                <h2><a href="blog.html?post=${postFile.replace(".md", "")}">${frontmatter.title || "Untitled Post"}</a></h2>
                <p><em>${frontmatter.date || ""}</em></p>
                <p>${frontmatter.summary || ""}</p>
                <a href="blog.html?post=${postFile.replace(".md", "")}" class="read-more">Read More &rarr;</a>
            `;
      container.appendChild(postElement);
    }
  } catch (error) {
    console.error("Error building blog list:", error);
    container.innerHTML = "<p>Could not load blog posts.</p>";
  }
}

async function renderSinglePost(postName) {
  const container = document.getElementById("blog-content-container");
  if (!container) return;

  try {
    const postResponse = await fetch(`blogs/${postName}.md`);
    if (!postResponse.ok) throw new Error("Post not found");
    const postText = await postResponse.text();

    const frontmatter = parseFrontmatter(postText);
    const content = postText.replace(/^---\n[\s\S]*?\n---\n/, "").trim();

    document.title = `${frontmatter.title || "Blog Post"} - Abel George Antony`;

    container.innerHTML = `
            <div class="page-header">
                <h1>${frontmatter.title || "Untitled Post"}</h1>
                <p>By ${frontmatter.author || "Unknown"} on ${frontmatter.date || ""}</p>
            </div>
            <div class="post-content">
                ${marked.parse(content)}
            </div>
        `;
  } catch (error) {
    console.error("Error rendering post:", error);
    container.innerHTML = `
            <div class="page-header">
                <h1>Post Not Found</h1>
                <p>Sorry, we couldn't find the post you were looking for.</p>
            </div>
        `;
  }
}

function renderSearch() {
  const container = document.getElementById("blog-content-container");
  if (!container) return;

  container.innerHTML = `
        <div class="page-header">
            <h1>Search Blog</h1>
            <p>Find a post by title, summary, or content.</p>
        </div>
        <div class="search-bar-container">
            <input type="text" id="blog-search-bar" placeholder="Search posts...">
        </div>
        <div id="search-results-container"></div>
    `;

  const searchBar = document.getElementById("blog-search-bar");
  const resultsContainer = document.getElementById("search-results-container");

  let allPostsData = [];

  // Pre-fetch all posts and their data for searching
  fetch("blogs/manifest.json")
    .then((res) => res.json())
    .then((manifest) => {
      const fetchPromises = manifest.map((filename) =>
        fetch(`blogs/${filename}`)
          .then((res) => res.text())
          .then((text) => ({
            filename: filename,
            content: text.toLowerCase(),
            frontmatter: parseFrontmatter(text),
          })),
      );
      return Promise.all(fetchPromises);
    })
    .then((postsData) => {
      allPostsData = postsData;
    });

  searchBar.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    resultsContainer.innerHTML = "";

    if (searchTerm.length < 2) {
      return;
    }

    const filteredPosts = allPostsData.filter((post) =>
      post.content.includes(searchTerm),
    );

    if (filteredPosts.length > 0) {
      filteredPosts.forEach((post) => {
        const postElement = document.createElement("article");
        postElement.className = "blog-list-item";
        postElement.innerHTML = `
                    <h2><a href="blog.html?post=${post.filename.replace(".md", "")}">${post.frontmatter.title || "Untitled Post"}</a></h2>
                    <p><em>${post.frontmatter.date || ""}</em></p>
                    <p>${post.frontmatter.summary || ""}</p>
                `;
        resultsContainer.appendChild(postElement);
      });
    } else {
      resultsContainer.innerHTML =
        "<p>No posts found matching your search.</p>";
    }
  });
}
