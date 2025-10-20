const imageViewer = {
  viewer: null,
  fullImage: null,
  caption: null,
  closeButton: null,
  prevButton: null,
  nextButton: null,
  images: [],
  currentIndex: 0,

  init: function () {
    this.viewer = document.getElementById("image-viewer");
    this.fullImage = document.getElementById("full-image");
    this.caption = document.getElementById("caption");
    this.closeButton = document.querySelector(".close-viewer");

    if (!this.viewer || !this.fullImage || !this.caption || !this.closeButton) {
      console.error("Image viewer elements not found");
      return;
    }

    this.closeButton.addEventListener("click", () => {
      this.fullImage.style.transform = `scale(1)`;
      this.close();
    });
    this.viewer.addEventListener("click", (e) => {
      if (e.target === this.viewer) {
        this.fullImage.style.transform = `scale(1)`;
        this.close();
      }
    });
  },

  addImages: function (selector, withNavigation) {
    const imageElements = document.querySelectorAll(selector);
    const imageSources = Array.from(imageElements).map((img) => ({
      src: img.src,
      alt: img.alt,
      withNavigation: withNavigation,
    }));

    imageElements.forEach((img, index) => {
      img.addEventListener("click", () => {
        const overallIndex = this.images.findIndex(
          (image) => image.src === img.src,
        );
        this.open(overallIndex);
      });
    });

    this.images = this.images.concat(imageSources);
  },

  open: function (index) {
    this.currentIndex = index;
    const image = this.images[this.currentIndex];

    this.fullImage.src = image.src;
    this.caption.textContent = image.alt;

    if (image.withNavigation) {
      this.createNavigation();
    } else {
      this.removeNavigation();
    }

    this.viewer.classList.remove("image-viewer-hidden");
    this.viewer.classList.add("image-viewer");
  },

  close: function () {
    this.viewer.classList.add("image-viewer-hidden");
    this.viewer.classList.remove("image-viewer");
    this.removeNavigation();
  },

  createNavigation: function () {
    if (!this.prevButton) {
      this.prevButton = document.createElement("a");
      this.prevButton.classList.add("prev");
      this.prevButton.innerHTML = "&#10094;";
      this.viewer.appendChild(this.prevButton);
      this.prevButton.addEventListener("click", () => this.navigate(-1));
    }

    if (!this.nextButton) {
      this.nextButton = document.createElement("a");
      this.nextButton.classList.add("next");
      this.nextButton.innerHTML = "&#10095;";
      this.viewer.appendChild(this.nextButton);
      this.nextButton.addEventListener("click", () => this.navigate(1));
    }
  },

  removeNavigation: function () {
    if (this.prevButton) {
      this.prevButton.remove();
      this.prevButton = null;
    }
    if (this.nextButton) {
      this.nextButton.remove();
      this.nextButton = null;
    }
  },

  navigate: function (direction) {
    const currentImageSet = this.images.filter((img) => img.withNavigation);
    const currentImageInSetIndex = currentImageSet.findIndex(
      (img) => img.src === this.images[this.currentIndex].src,
    );
    const nextImageInSetIndex =
      (currentImageInSetIndex + direction + currentImageSet.length) %
      currentImageSet.length;
    const nextImageSrc = currentImageSet[nextImageInSetIndex].src;
    const nextOverallIndex = this.images.findIndex(
      (img) => img.src === nextImageSrc,
    );

    this.open(nextOverallIndex);
  },
};

document.addEventListener("DOMContentLoaded", () => {
  imageViewer.init();
});

function setupImageViewer(selector, withNavigation) {
  imageViewer.addImages(selector, withNavigation);
}

/**
 * Gets the current scale of an element.
 * @param {HTMLElement} element The element to check.
 * @returns {number} The current scale value, defaults to 1.
 */
function getCurrentScale(element) {
  // getComputedStyle is more robust as it gets the actual rendered style
  const transform = window.getComputedStyle(element).transform;

  // If there's no transform or it's 'none', the scale is 1
  if (transform === "none") {
    return 1;
  }

  // The transform value is a matrix, e.g., "matrix(1.1, 0, 0, 1.1, 0, 0)"
  // The first value is the scaleX, which is what we need.
  const matrixValues = transform.match(/matrix.*\((.+)\)/)[1].split(", ");
  return parseFloat(matrixValues[0]);
}

/**
 * Incrementally zooms in on an element by 0.1.
 * @param {string} elementId The ID of the HTML element to zoom.
 */
function zoomIn(elementId = "full-image") {
  const element = document.getElementById(elementId);
  let currentScale = getCurrentScale(element);

  // Add 0.1 to the current scale
  let newScale = currentScale + 0.1;

  // Apply the new scale. .toFixed(2) prevents floating point rounding errors.
  element.style.transform = `scale(${newScale.toFixed(2)})`;
}

/**
 * Incrementally zooms out an element by 0.1.
 * @param {string} elementId The ID of the HTML element to zoom.
 */
function zoomOut(elementId = "full-image") {
  const element = document.getElementById(elementId);
  let currentScale = getCurrentScale(element);

  // Subtract 0.1 from the current scale
  let newScale = currentScale - 0.1;

  // Optional: Prevent the image from becoming too small or inverted
  if (newScale < 0.2) {
    newScale = 0.2;
  }

  // Apply the new scale.
  element.style.transform = `scale(${newScale.toFixed(2)})`;
}
