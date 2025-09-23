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
      const container = document.getElementById("blog-content-container");
      if (container) {
        container.innerHTML = `
                    <div class="page-header">
                        <h1>No Post Specified</h1>
                        <p>Please select a post from the <a href="blogs.html">blog list</a>.</p>
                    </div>
                `;
      }
    }
  }
});

async function fetchPostMetadata(file) {
  const response = await fetch(`blogs/${file.name.replace(".md", ".html")}`);
  if (!response.ok) return null;

  const htmlText = await response.text();
  const doc = new DOMParser().parseFromString(htmlText, "text/html");

  const title =
    doc.querySelector('meta[name="title"]')?.getAttribute("content") ||
    "Untitled Post";
  const date =
    doc.querySelector('meta[name="date"]')?.getAttribute("content") || "";
  const summary =
    doc.querySelector('meta[name="summary"]')?.getAttribute("content") || "";

  return {
    filename: file.name,
    title,
    date,
    summary,
  };
}

async function renderBlogList() {
  const container = document.getElementById("blog-posts-container");
  if (!container) return;

  container.innerHTML = "<p>Loading posts...</p>";

  try {
    const repoUrl =
      "https://api.github.com/repos/abelgeorgeantony/abelgeorgeantony.github.io/contents/blogs";
    const response = await fetch(repoUrl);
    if (!response.ok)
      throw new Error("Failed to fetch blog files from GitHub API");

    const files = await response.json();
    const mdFiles = files.filter((file) => file.name.endsWith(".md"));

    const posts = (await Promise.all(mdFiles.map(fetchPostMetadata))).filter(
      Boolean,
    );

    posts.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending

    container.innerHTML = ""; // Clear loading message

    if (posts.length === 0) {
      container.innerHTML = "<p>No blog posts found.</p>";
      return;
    }

    posts.forEach((post) => {
      const postElement = document.createElement("article");
      postElement.className = "blog-list-item";
      postElement.innerHTML = `
                <h2><a href="blog.html?post=${post.filename.replace(".md", "")}">${post.title}</a></h2>
                <p><em>${post.date}</em></p>
                <p>${post.summary}</p>
                <a href="blog.html?post=${post.filename.replace(".md", "")}" class="read-more">Read More &rarr;</a>
            `;
      container.appendChild(postElement);
    });
  } catch (error) {
    console.error("Error building blog list:", error);
    container.innerHTML =
      "<p>Could not load blog posts. Please check the console for more details.</p>";
  }
}

async function renderSinglePost(postName) {
  const container = document.getElementById("blog-content-container");
  if (!container) return;

  try {
    const response = await fetch(`blogs/${postName}.html`);
    if (!response.ok) throw new Error("Post not found");

    const htmlText = await response.text();
    const doc = new DOMParser().parseFromString(htmlText, "text/html");

    const title =
      doc.querySelector('meta[name="title"]')?.getAttribute("content") ||
      "Untitled Post";
    const author =
      doc.querySelector('meta[name="author"]')?.getAttribute("content") ||
      "Unknown";
    const date =
      doc.querySelector('meta[name="date"]')?.getAttribute("content") || "";
    const content = doc.body.innerHTML;

    document.title = `${title} - Abel George Antony`;

    container.innerHTML = `
            <div class="page-header">
                <h1>${title}</h1>
                <p>By ${author} on ${date}</p>
            </div>
            <div class="post-content">
                ${content}
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
