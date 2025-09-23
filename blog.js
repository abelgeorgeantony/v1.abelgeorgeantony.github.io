document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname.split("/").pop();

    if (path === 'blogs.html') {
        renderBlogList();
    } else if (path === 'blog.html') {
        const params = new URLSearchParams(window.location.search);
        const postName = params.get('post');
        if (postName) {
            renderSinglePost(postName);
        } else {
            renderSearch(); // This will now be the search UI
        }
    }
});

function parseFrontmatter(text) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
    const match = text.match(frontmatterRegex);
    const frontmatter = {};
    if (match) {
        const yaml = match[1];
        yaml.split('\n').forEach(line => {
            const [key, ...value] = line.split(':');
            if (key && value.length > 0) {
                frontmatter[key.trim()] = value.join(':').trim().replace(/['|"]/g, '');
            }
        });
    }
    return frontmatter;
}

async function renderBlogList() {
    const container = document.getElementById('blog-posts-container');
    if (!container) return;

    container.innerHTML = '<p>Loading posts...</p>';

    try {
        const repoUrl = 'https://api.github.com/repos/abelgeorgeantony/abelgeorgeantony.github.io/contents/blogs';
        const response = await fetch(repoUrl);
        if (!response.ok) throw new Error('Failed to fetch blog files from GitHub API');

        const files = await response.json();
        const mdFiles = files.filter(file => file.name.endsWith('.md'));

        const postPromises = mdFiles.map(async (file) => {
            const postResponse = await fetch(file.download_url);
            const postText = await postResponse.text();
            return { ...frontmatter, filename: file.name };
        });

        const posts = (await Promise.all(postPromises)).filter(Boolean);

        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        container.innerHTML = '';

        if (posts.length === 0) {
            container.innerHTML = '<p>No blog posts found.</p>';
            return;
        }

        posts.forEach(post => {
            const postElement = document.createElement('article');
            postElement.className = 'blog-list-item';
            postElement.innerHTML = `
                <h2><a href="blog.html?post=${post.filename.replace('.md', '')}">${post.title}</a></h2>
                <p><em>${post.date}</em></p>
                <p>${post.summary}</p>
                <a href="blog.html?post=${post.filename.replace('.md', '')}" class="read-more">Read More &rarr;</a>
            `;
            container.appendChild(postElement);
        });

    } catch (error) {
        console.error('Error building blog list:', error);
        container.innerHTML = '<p>Could not load blog posts.</p>';
    }
}

async function renderSinglePost(postName) {
    const container = document.getElementById('blog-content-container');
    if (!container) return;

    try {
        // Fetch both the rendered HTML and the raw markdown simultaneously
        const [htmlResponse, mdResponse] = await Promise.all([
            fetch(`blogs/${postName}.html`),
            fetch(`https://api.github.com/repos/abelgeorgeantony/abelgeorgeantony.github.io/contents/blogs/${postName}.md`)
        ]);

        if (!htmlResponse.ok) throw new Error('Post HTML not found');
        if (!mdResponse.ok) throw new Error('Post Markdown not found on GitHub');

        const htmlText = await htmlResponse.text();
        const mdData = await mdResponse.json();

        // Decode the Base64 content from GitHub API
        const mdText = atob(mdData.content);

        const frontmatter = parseFrontmatter(mdText);

        // Parse the fetched HTML to extract the body content
        const doc = new DOMParser().parseFromString(htmlText, 'text/html');
        const content = doc.body.innerHTML;

        document.title = `${frontmatter.title || 'Blog Post'} - Abel George Antony`;

        container.innerHTML = "\n            <div class=\"page-header\">\n                <h1>${frontmatter.title || 'Untitled Post'}</h1>\n                <p>By ${frontmatter.author || 'Unknown'} on ${frontmatter.date || ''}</p>\n            </div>\n            <div class=\"post-content\">\n                ${content}\n            </div>\n        ";
    } catch (error) {
        console.error('Error rendering post:', error);
        container.innerHTML = "\n            <div class=\"page-header\">\n                <h1>Post Not Found</h1>\n                <p>Sorry, we couldn't find the post you were looking for.</p>\n            </div>\n        ";
    }
}

async function renderSearch() {
    const container = document.getElementById('blog-content-container');
    if (!container) return;

    container.innerHTML = "\n        <div class=\"page-header\">\n            <h1>Search Blog</h1>\n            <p>Find a post by title, summary, or content.</p>\n        </div>\n        <div class=\"search-bar-container\">\n            <input type=\"text\" id=\"blog-search-bar\" placeholder=\"Search posts...">\n        </div>\n        <div id=\"search-results-container\"></div>\n    ";

    const searchBar = document.getElementById('blog-search-bar');
    const resultsContainer = document.getElementById('search-results-container');

    let allPostsData = [];

    try {
        const repoUrl = 'https://api.github.com/repos/abelgeorgeantony/abelgeorgeantony.github.io/contents/blogs';
        const response = await fetch(repoUrl);
        if (!response.ok) throw new Error('Failed to fetch blog files from GitHub API');

        const files = await response.json();
        const mdFiles = files.filter(file => file.name.endsWith('.md'));

        const postPromises = mdFiles.map(async (file) => {
            const postResponse = await fetch(file.download_url);
            const postText = await postResponse.text();
            return {
                filename: file.name,
                content: postText.toLowerCase(),
                frontmatter: parseFrontmatter(postText)
            };
        });

        allPostsData = await Promise.all(postPromises);

        searchBar.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            resultsContainer.innerHTML = '';

            if (searchTerm.length < 2) {
                return;
            }

            const filteredPosts = allPostsData.filter(post => post.content.includes(searchTerm));

            if (filteredPosts.length > 0) {
                filteredPosts.forEach(post => {
                    const postElement = document.createElement('article');
                    postElement.className = 'blog-list-item';
                    postElement.innerHTML = "\n                        <h2><a href=\"blog.html?post=".concat(post.filename.replace('.md', ''), "\">${post.frontmatter.title || 'Untitled Post'}</a></h2>\n                        <p><em>${post.frontmatter.date || ''}</em></p>\n                        <p>${post.frontmatter.summary || ''}</p>\n                    ";
                    resultsContainer.appendChild(postElement);
                });
            } else {
                resultsContainer.innerHTML = '<p>No posts found matching your search.</p>';
            }
        });
    } catch (error) {
        console.error('Error initializing search:', error);
        resultsContainer.innerHTML = '<p>Could not load search.</p>';
    }
}
