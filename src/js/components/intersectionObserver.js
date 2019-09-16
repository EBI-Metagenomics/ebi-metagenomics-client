require('intersectionObserver');

const config = {
    // If the image gets within 50px in the Y axis, start the download.
    rootMargin: '50px 0px',
    threshold: 0.01
};

function preloadImage(img) {
    const src = img.getAttribute('data-src');
    if (src) {
        img.src = src;
    }
}

module.exports = function setupObserver() {
    function onIntersection(entries) {
        // Loop through the entries
        entries.forEach((entry) => {
            // Are we in viewport?
            if (entry.intersectionRatio > 0) {
                // Stop watching and load the image
                observer.unobserve(entry.target);
                preloadImage(entry.target);
            }
        });
    }

    let observer = new IntersectionObserver(onIntersection, config);

    const images = $('.js-lazy-image');

// The observer for the images on the page
    images.forEach((image) => {
        observer.observe(image);
    });
};
