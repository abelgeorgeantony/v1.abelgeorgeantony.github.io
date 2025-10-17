document.addEventListener("DOMContentLoaded", function() {
    setupImageViewer(".main-image", false);

    if (window.location.pathname.endsWith("/gallery.html")) {
        setupImageViewer(".image-grid-item img", true);
    }
});
