
const PhotoBooth = (() => {
  function capture(video, canvas) {
    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      throw new Error("The camera is still starting. Please try again.");
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    // IMPORTANT: Reset the canvas transformation before every shot.
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const isFrontCamera =
      Camera.currentStream()
        ?.getVideoTracks()[0]
        ?.getSettings().facingMode === "user";

    // Mirror front-camera photos without cropping either side.
    if (isFrontCamera) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    return canvas.toDataURL("image/png");
  }

  return { capture };
})();
