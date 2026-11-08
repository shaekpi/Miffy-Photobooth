
(() => {
  // ========================================
  // PHOTO BOOTH ELEMENTS
  // ========================================

  const welcome = document.getElementById("booth-welcome");
  const session = document.getElementById("booth-session");
  const result = document.getElementById("booth-result");

  const startButton = document.getElementById("start-booth");
  const captureButton = document.getElementById("booth-capture");
  const flipButton = document.getElementById("booth-flip");
  const cancelButton = document.getElementById("booth-cancel");

  const video = document.getElementById("booth-video");
  const countdown = document.getElementById("booth-countdown");
  const flash = document.getElementById("booth-flash");

  const progress = document.getElementById("booth-progress");
  const status = document.getElementById("booth-status");
  const thumbnails = document.getElementById("booth-thumbnails");

  const canvas = document.createElement("canvas");

  // ========================================
  // STATE
  // ========================================

  let photos = [];
  let cameraReady = false;
  let isRunning = false;

  let preparedStripFile = null;
  let preparedStripUrl = null;

  const wait = milliseconds =>
    new Promise(resolve => setTimeout(resolve, milliseconds));

  function resetPreparedStrip() {
    preparedStripFile = null;

    if (preparedStripUrl) {
      URL.revokeObjectURL(preparedStripUrl);
      preparedStripUrl = null;
    }
  }

  // ========================================
  // CAMERA SESSION
  // ========================================

  async function startSession() {
    resetPreparedStrip();

    welcome.hidden = true;
    result.hidden = true;
    session.hidden = false;

    status.textContent = "Waking up the camera…";

    captureButton.disabled = true;
    flipButton.disabled = true;

    try {
      await Camera.start(video);

      cameraReady = true;
      captureButton.disabled = false;
      flipButton.disabled = false;

      status.textContent = "Looking good! Ready when you are ♡";
    } catch (error) {
      cameraReady = false;

      status.textContent =
        error.name === "NotAllowedError"
          ? "Camera permission wasn't granted. Please allow camera access in your browser settings."
          : error.message || "Couldn't start the camera. Please try again.";

      captureButton.disabled = true;
      flipButton.disabled = true;
    }
  }

  // ========================================
  // COUNTDOWN
  // ========================================

  async function runCountdown() {
    countdown.hidden = false;

    for (let number = 3; number >= 1; number--) {
      countdown.textContent = number;
      await wait(800);
    }

    countdown.textContent = "♡";
    await wait(350);

    countdown.hidden = true;
  }

  // ========================================
  // CAMERA FLASH
  // ========================================

  async function triggerFlash() {
    flash.classList.remove("is-active");

    // Restart the flash animation.
    void flash.offsetWidth;

    flash.classList.add("is-active");

    await wait(180);

    flash.classList.remove("is-active");
  }

  // ========================================
  // CAPTURE PHOTO
  // ========================================

  function takeSnapshot() {
    const photo = PhotoBooth.capture(video, canvas);

    photos.push(photo);

    const thumbnail = document.createElement("img");
    thumbnail.src = photo;
    thumbnail.alt = `Photo ${photos.length}`;
    thumbnail.className = "booth-thumbnail";

    thumbnails.appendChild(thumbnail);
  }

  // ========================================
  // FOUR-PHOTO SESSION
  // ========================================

  async function runPhotoSession() {
    if (!cameraReady || isRunning) return;

    isRunning = true;

    photos = [];
    thumbnails.replaceChildren();

    captureButton.disabled = true;
    flipButton.disabled = true;
    cancelButton.disabled = true;

    try {
      for (let i = 0; i < 4; i++) {
        progress.textContent = `PHOTO ${i + 1} OF 4`;
        status.textContent = "Get ready…";

        await runCountdown();

        takeSnapshot();

        await triggerFlash();

        if (i < 3) {
          status.textContent =
            "Lovely! Get ready for the next one ♡";

          await wait(900);
        }
      }

      status.textContent = "Your little photo strip is ready!";

      Camera.stop();
      video.srcObject = null;
      cameraReady = false;

      showResult();

    } catch (error) {
      console.error("Photo session error:", error);

      status.textContent =
        error.message || "Something went wrong. Please try again.";

      photos = [];
      thumbnails.replaceChildren();

      captureButton.disabled = false;
      flipButton.disabled = false;

    } finally {
      isRunning = false;
      cancelButton.disabled = false;
    }
  }

  // ========================================
  // IMAGE LOADING
  // ========================================

  function loadStripImage(src) {
    return new Promise(resolve => {
      const image = new Image();

      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);

      image.src = src;
    });
  }

  // ========================================
  // CREATE DECORATED PHOTO STRIP
  // ========================================

  async function createStripBlob() {
    const images = await Promise.all(
      photos.map(photo => loadStripImage(photo))
    );

    if (images.length !== 4 || images.some(image => !image)) {
      throw new Error("Couldn't prepare all four photos.");
    }

    const miffy = await loadStripImage(
      "assets/images/miffy.png"
    );

    const output = document.createElement("canvas");
    const ctx = output.getContext("2d");

    if (!ctx) {
      throw new Error("Your browser couldn't create the photo strip.");
    }

    const width = 900;
    const photoWidth = 760;
    const photoX = 70;

    // Preserve the original proportions of every photograph.
    const photoHeights = images.map(image =>
      Math.round(photoWidth * image.height / image.width)
    );

    const gap = 26;
    const headerHeight = 250;
    const footerHeight = 190;

    const height =
      headerHeight +
      photoHeights.reduce((sum, value) => sum + value, 0) +
      gap * (images.length - 1) +
      footerHeight;

    output.width = width;
    output.height = height;

    // Background.
    ctx.fillStyle = "#fffaf4";
    ctx.fillRect(0, 0, width, height);

    // Outer pink frame.
    ctx.strokeStyle = "#eac6cd";
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Header decorations.
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    ctx.fillStyle = "#d99ba8";
    ctx.font = "38px Georgia";
    ctx.fillText("✿     ♡     ✿", width / 2, 75);

    // Miffy illustration.
    if (miffy) {
      ctx.drawImage(
        miffy,
        width / 2 - 65,
        85,
        130,
        130
      );
    }

    ctx.fillStyle = "#80636a";
    ctx.font = "italic 38px Georgia";
    ctx.fillText(
      "our little moments",
      width / 2,
      235
    );

    // Four photographs.
    let y = headerHeight + 10;

    images.forEach((image, index) => {
      const photoHeight = photoHeights[index];

      // White photograph border.
      ctx.fillStyle = "#ffffff";

      ctx.fillRect(
        photoX - 12,
        y - 12,
        photoWidth + 24,
        photoHeight + 24
      );

      // Full photograph, without cropping.
      ctx.drawImage(
        image,
        photoX,
        y,
        photoWidth,
        photoHeight
      );

      y += photoHeight + gap;
    });

    // Footer decorations.
    ctx.fillStyle = "#d99ba8";
    ctx.font = "42px Georgia";

    ctx.fillText(
      "🌷   ✿   ♡   ✿   🌷",
      width / 2,
      y + 65
    );

    ctx.fillStyle = "#947e75";
    ctx.font = "italic 30px Georgia";

    ctx.fillText(
      "little memories, kept forever",
      width / 2,
      y + 115
    );

    ctx.font = "22px Arial";

    ctx.fillText(
      new Date().toLocaleDateString("en-SG", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }),
      width / 2,
      y + 155
    );

    // Export as PNG.
    return new Promise((resolve, reject) => {
      output.toBlob(blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(
            new Error("Couldn't export your photo strip.")
          );
        }
      }, "image/png");
    });
  }

  // ========================================
  // DOWNLOAD / SHARE
  // ========================================

  
async function savePhotoStrip(button) {
  // First click: generate the PNG.
  if (!preparedStripUrl) {
    button.disabled = true;
    button.textContent = "preparing your strip…";

    try {
      const blob = await createStripBlob();

      preparedStripFile = new File(
        [blob],
        "our-little-photo-strip.png",
        { type: "image/png" }
      );

      preparedStripUrl = URL.createObjectURL(blob);

      button.textContent = "♡ download my photo strip";
    } catch (error) {
      console.error("Photo strip preparation failed:", error);
      button.textContent = "couldn't prepare, try again";
    } finally {
      button.disabled = false;
    }

    return;
  }

  // Second click: download directly.
  const link = document.createElement("a");

  link.href = preparedStripUrl;
  link.download = "our-little-photo-strip.png";
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  link.remove();

  button.textContent = "♡ download my photo strip";
}


  // ========================================
  // DISPLAY COMPLETED PHOTO STRIP
  // ========================================

  function showResult() {
    session.hidden = true;
    result.hidden = false;

    result.replaceChildren();

    resetPreparedStrip();

    const wrapper = document.createElement("div");
    wrapper.className = "booth-result-content";

    const heading = document.createElement("h3");
    heading.textContent = "our little photo strip ♡";

    // Main strip.
    const strip = document.createElement("div");
    strip.className = "completed-strip";

    // Header.
    const header = document.createElement("div");
    header.className = "strip-header";

    const decoration = document.createElement("p");
    decoration.className = "strip-decoration";
    decoration.textContent = "✿  ♡  ✿";

    const miffy = document.createElement("img");
    miffy.src = "assets/images/miffy.png";
    miffy.alt = "Miffy";
    miffy.className = "strip-miffy";

    const stripTitle = document.createElement("p");
    stripTitle.className = "strip-title";
    stripTitle.textContent = "our little moments";

    header.append(
      decoration,
      miffy,
      stripTitle
    );

    // Photographs.
    const photoContainer = document.createElement("div");
    photoContainer.className = "strip-photos";

    photos.forEach((photo, index) => {
      const image = document.createElement("img");

      image.src = photo;
      image.alt = `Photo ${index + 1}`;
      image.className = "completed-strip-photo";

      photoContainer.appendChild(image);
    });

    // Footer.
    const footer = document.createElement("div");
    footer.className = "strip-footer";

    const flowers = document.createElement("p");
    flowers.className = "strip-decoration";
    flowers.textContent = "🌷  ✿  ♡  ✿  🌷";

    const caption = document.createElement("p");
    caption.textContent = "little memories, kept forever";

    const date = document.createElement("p");
    date.className = "strip-date";

    date.textContent = new Date().toLocaleDateString(
      "en-SG",
      {
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    );

    footer.append(
      flowers,
      caption,
      date
    );

    strip.append(
      header,
      photoContainer,
      footer
    );

    // Save button.
    const saveButton = document.createElement("button");

    saveButton.type = "button";
    saveButton.className = "primary-button";
    saveButton.textContent = "♡ save my photo strip";

    saveButton.addEventListener("click", () => {
      savePhotoStrip(saveButton);
    });

    // Retake button.
    const retakeButton = document.createElement("button");

    retakeButton.type = "button";
    retakeButton.className = "secondary-button";
    retakeButton.textContent = "take another strip ↻";

    retakeButton.addEventListener("click", startSession);

    wrapper.append(
      heading,
      strip,
      saveButton,
      retakeButton
    );

    result.appendChild(wrapper);
  }

  // ========================================
  // SWITCH CAMERA
  // ========================================

  flipButton.addEventListener("click", async () => {
    if (!cameraReady || isRunning) return;

    flipButton.disabled = true;
    status.textContent = "Switching camera…";

    try {
      await Camera.flip(video);

      status.textContent = "Ready for your photos ♡";

    } catch (error) {
      status.textContent =
        error.message || "Couldn't switch cameras.";

    } finally {
      flipButton.disabled = false;
    }
  });

  // ========================================
  // EVENT LISTENERS
  // ========================================

  startButton.addEventListener("click", startSession);

  captureButton.addEventListener(
    "click",
    runPhotoSession
  );

  cancelButton.addEventListener("click", () => {
    if (isRunning) return;

    Camera.stop();

    video.srcObject = null;

    cameraReady = false;
    photos = [];

    thumbnails.replaceChildren();

    session.hidden = true;
    result.hidden = true;
    welcome.hidden = false;

    resetPreparedStrip();
  });

  // ========================================
  // INITIAL STATE
  // ========================================

  captureButton.disabled = true;
  flipButton.disabled = true;

  captureButton.textContent = "start 4-photo session ♡";

})();
