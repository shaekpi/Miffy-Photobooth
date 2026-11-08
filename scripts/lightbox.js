(() => {
    const memoryCards = Array.from(
    document.querySelectorAll(".polaroid")
    );

    const lightbox = document.getElementById("memory-lightbox");
    const lightboxImage = document.getElementById("lightbox-image");
    const lightboxCaption = document.getElementById("lightbox-caption");
    const lightboxCounter = document.getElementById("lightbox-counter");

    const closeButton = document.getElementById("lightbox-close");
    const previousButton = document.getElementById("lightbox-prev");
    const nextButton = document.getElementById("lightbox-next");

    let currentIndex = 0;

    // Display a selected photograph
    function showMemory(index) {
    currentIndex = (index + memoryCards.length) % memoryCards.length;

    const card = memoryCards[currentIndex];
    const image = card.querySelector(".memory-photo img");
    const caption = card.querySelector(".memory-caption");

    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = caption.textContent;
    lightboxCounter.textContent =
        `${currentIndex + 1} / ${memoryCards.length}`;
    }

    // Open the lightbox when a photograph is clicked
    memoryCards.forEach((card, index) => {
    card.addEventListener("click", () => {
        showMemory(index);
        lightbox.showModal();
    });
    });

    // Navigate between photographs
    previousButton.addEventListener("click", () => {
    showMemory(currentIndex - 1);
    });

    nextButton.addEventListener("click", () => {
    showMemory(currentIndex + 1);
    });

    // Close the lightbox
    closeButton.addEventListener("click", () => {
    lightbox.close();
    });

    // Close when clicking outside the photo viewer
    lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
        lightbox.close();
    }
    });

    // Keyboard navigation
    document.addEventListener("keydown", (event) => {
    if (!lightbox.open) return;

    if (event.key === "ArrowLeft") {
        showMemory(currentIndex - 1);
    } else if (event.key === "ArrowRight") {
        showMemory(currentIndex + 1);
    }
    });
})();