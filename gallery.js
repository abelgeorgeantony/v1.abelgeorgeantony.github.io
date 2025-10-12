document.addEventListener("DOMContentLoaded", function() {
    const images = document.querySelectorAll('.image-grid-item img');
    const imageViewer = document.getElementById('image-viewer');
    const fullImage = document.getElementById('full-image');
    const closeViewer = document.querySelector('.close-viewer');
    const prev = document.querySelector('.prev');
    const next = document.querySelector('.next');

    let currentIndex = 0;
    const imageSources = Array.from(images).map(img => img.src);

    images.forEach((img, index) => {
        img.addEventListener('click', function() {
            currentIndex = index;
            openViewer(this.src);
        });
    });

    function openViewer(src) {
        imageViewer.classList.remove('image-viewer-hidden');
        imageViewer.classList.add('image-viewer');
        fullImage.src = src;
    }

    function closeViewerFunc() {
        imageViewer.classList.add('image-viewer-hidden');
        imageViewer.classList.remove('image-viewer');
    }

    closeViewer.addEventListener('click', closeViewerFunc);

    prev.addEventListener('click', function() {
        currentIndex = (currentIndex - 1 + imageSources.length) % imageSources.length;
        fullImage.src = imageSources[currentIndex];
    });

    next.addEventListener('click', function() {
        currentIndex = (currentIndex + 1) % imageSources.length;
        fullImage.src = imageSources[currentIndex];
    });

    // Close viewer when clicking outside the image
    imageViewer.addEventListener('click', function(e) {
        if (e.target === imageViewer) {
            closeViewerFunc();
        }
    });
});
