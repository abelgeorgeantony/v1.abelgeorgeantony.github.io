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

    this.closeButton.addEventListener("click", () => this.close());
    this.viewer.addEventListener("click", (e) => {
      if (e.target === this.viewer) {
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
