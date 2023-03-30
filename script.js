const apiKey = "A95gTKtuahRPkZ0H1K4REZ6i9BTByVtc2QoAa9b5LvF1Dfc9yOIEVxjV";

const searchInput = document.getElementById("search");
const timerSelect = document.getElementById("timer-select");
const previousButton = document.getElementById("previous");
const pauseButton = document.getElementById("pause");
const nextButton = document.getElementById("next");
const remainingTimeText = document.getElementById("remaining-time");
const image = document.getElementById("image");
const pausePlayIcon = document.getElementById("pause-play-icon");

let images = [];
let currentImageIndex = 0;
let timer;
let paused = false;

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchImages(e.target.value);
  }
});

timerSelect.addEventListener("change", () => {
  startTimer();
});

previousButton.addEventListener("click", () => {
  previousImage();
});

pauseButton.addEventListener("click", () => {
  paused = !paused;
  if (paused) {
    pausePlayIcon.textContent = "play_arrow";
  } else {
    pausePlayIcon.textContent = "pause";
  }
});

nextButton.addEventListener("click", () => {
  nextImage();
});

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function searchImages(query) {
  try {
    images = [];

    // Fetch images from 3 random pages
    const totalPages = 125;
    const fetchedPages = new Set();
    while (fetchedPages.size < 3) {
      const randomPage = Math.floor(Math.random() * totalPages) + 1;
      if (!fetchedPages.has(randomPage)) {
        fetchedPages.add(randomPage);

        const response = await fetch(
          `https://api.pexels.com/v1/search?query=${query}&orientation=vertical&per_page=80&page=${randomPage}`,
          {
            headers: {
              Authorization: apiKey,
            },
          }
        );
        const data = await response.json();
        const verticalImages = data.photos.filter(
          (photo) => photo.width < photo.height
        ); // Filter out non-vertical images
        images.push(...verticalImages);
      }
    }

    shuffle(images); // Shuffle the images array
    currentImageIndex = 0;
    displayImage();
    startTimer();

    // Set the image count text
    const imageCountElement = document.getElementById("image-count");
    imageCountElement.textContent = `Results: ${images.length}`;
  } catch (error) {
    console.error("Error fetching images:", error);
  }
}

function displayImage() {
  if (images[currentImageIndex]) {
    image.src = images[currentImageIndex].src.large2x; // Use high-resolution image
    image.classList.remove("hidden");
  }
}

function startTimer() {
  clearInterval(timer);
  let timeLeft = parseInt(timerSelect.value);
  remainingTimeText.textContent = `${timeLeft}s remaining`;

  timer = setInterval(() => {
    if (!paused) {
      timeLeft--;
      remainingTimeText.textContent = `${timeLeft}s remaining`;

      if (timeLeft <= 0) {
        nextImage();
        timeLeft = parseInt(timerSelect.value);
      }
    }
  }, 1000);
}

function nextImage() {
  currentImageIndex = (currentImageIndex + 1) % images.length;
  displayImage();
  startTimer(); // Restart the timer

  // If the timer is paused, unpause it when the next button is pressed
  if (paused) {
    paused = false;
    pausePlayIcon.textContent = "pause";
  }
}

function previousImage() {
  currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
  displayImage();
  startTimer(); // Restart the timer

  // If the timer is paused, unpause it when the previous button is pressed
  if (paused) {
    paused = false;
    pausePlayIcon.textContent = "pause";
  }
}
