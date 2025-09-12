document.addEventListener("DOMContentLoaded", () => {
  const quotesGrid = document.getElementById("quotes-grid");

  if (quotesGrid) {
    fetch("quotes/manifest.json")
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((manifest) => {
        const fetchPromises = manifest.map((quoteFile) =>
          fetch(`quotes/${quoteFile}`).then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch ${quoteFile}`);
            return res.json();
          }),
        );

        Promise.all(fetchPromises)
          .then((quotes) => {
            if (quotes.length === 0) {
              quotesGrid.innerHTML =
                "<p>No quotes found. Add some to the quotes folder and update the manifest!</p>";
              return;
            }
            quotes.forEach((quoteData) => {
              const quoteCard = createQuoteCard(quoteData);
              quotesGrid.appendChild(quoteCard);
            });
          })
          .catch((error) => {
            console.error("Error fetching quotes:", error);
            quotesGrid.innerHTML =
              "<p>Could not load one or more quotes. Please check the file names in the manifest.</p>";
          });
      })
      .catch((error) => {
        console.error("Error fetching manifest:", error);
        quotesGrid.innerHTML =
          "<p>Could not load the quotes manifest. Make sure 'quotes/manifest.json' exists and is correctly formatted.</p>";
      });
  }
});

function createQuoteCard(data) {
  const card = document.createElement("div");
  card.className = "quote-card";

  card.innerHTML = `
        <div class="quote-preview">
            <blockquote class="quote-text">“${data.quote}”</blockquote>
            <cite class="quote-author">— ${data.author}</cite>
            <span class="material-icons quote-expand-icon">keyboard_arrow_down</span>
        </div>
        <div class="quote-details">
            <h3>Context</h3>
            <p>${data.context}</p>
            <h3>Interpretation</h3>
            <p>${data.interpretation}</p>
            <h3>What it means for me</h3>
            <p>${data.what_it_means_for_me}</p>
        </div>
    `;

  const preview = card.querySelector(".quote-preview");
  preview.addEventListener("click", () => {
    card.classList.toggle("expanded");
    const icon = card.querySelector(".quote-expand-icon");
    icon.textContent = card.classList.contains("expanded")
      ? "keyboard_arrow_up"
      : "keyboard_arrow_down";
  });

  return card;
}
