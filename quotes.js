document.addEventListener("DOMContentLoaded", function () {
  const quotesGrid = document.getElementById("quotes-grid");

  if (quotesGrid) {
    fetch("/quotes/manifest.json")
      .then((response) => response.json())
      .then((manifest) => {
        manifest.forEach((quoteFile) => {
          fetch(`/quotes/${quoteFile}`)
            .then((response) => response.json())
            .then((quoteData) => {
              const quoteCard = createQuoteCard(quoteData);
              quotesGrid.appendChild(quoteCard);
            });
        });
      });
  }

  function createQuoteCard(quoteData) {
    const card = document.createElement("div");
    card.className = "quote-card";

    const preview = document.createElement("div");
    preview.className = "quote-preview";

    const text = document.createElement("p");
    text.className = "quote-text";
    text.textContent = `"${quoteData.quote}"`;

    const author = document.createElement("span");
    author.className = "quote-author";
    author.textContent = `– ${quoteData.author}`;

    const expandIcon = document.createElement("span");
    expandIcon.className = "material-icons quote-expand-icon";
    expandIcon.textContent = "expand_more";

    preview.appendChild(text);
    preview.appendChild(author);
    preview.appendChild(expandIcon);

    const details = document.createElement("div");
    details.className = "quote-details";

    if (quoteData.interpretation) {
      const interpretationHeader = document.createElement("h3");
      interpretationHeader.textContent = "Interpretation";
      const interpretationText = document.createElement("p");
      interpretationText.textContent = quoteData.interpretation;
      details.appendChild(interpretationHeader);
      details.appendChild(interpretationText);
    }

    if (quoteData.what_it_means_for_me) {
      const meaningHeader = document.createElement("h3");
      meaningHeader.textContent = "What it Means for Me";
      const meaningText = document.createElement("p");
      meaningText.textContent = quoteData.what_it_means_for_me;
      details.appendChild(meaningHeader);
      details.appendChild(meaningText);
    }

    if (quoteData.context) {
      const contextHeader = document.createElement("h3");
      contextHeader.textContent = "Context";
      const contextText = document.createElement("p");
      contextText.textContent = quoteData.context;
      details.appendChild(contextHeader);
      details.appendChild(contextText);
    }

    card.appendChild(preview);
    card.appendChild(details);

    card.addEventListener("click", () => {
      card.classList.toggle("expanded");
    });

    return card;
  }
});
