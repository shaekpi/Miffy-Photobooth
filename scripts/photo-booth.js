const PhotoBooth = (() => {
  function capture(video, canvas) {
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) throw new Error("The camera is still starting. Please try again in a moment.");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    // Mirror the front-camera preview so the saved selfie feels natural.
    const isFrontCamera = Camera.currentStream()?.getVideoTracks()[0]?.getSettings().facingMode === "user";
    if (isFrontCamera) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, width, height);
    return canvas.toDataURL("image/png");
  }
  return { capture };
})();
