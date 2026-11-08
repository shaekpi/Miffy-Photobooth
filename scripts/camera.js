// Camera access is requested only after the visitor taps the photo booth button.
const Camera = (() => {
  let stream = null;
  let facingMode = "user";

  async function start(videoElement) {
    stop();
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera access is unavailable. Open this page in Safari using its HTTPS link.");
    }
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 1600 } }
    });
    videoElement.srcObject = stream;
    await videoElement.play();
    return stream;
  }

  function stop() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
  }

  async function flip(videoElement) {
    facingMode = facingMode === "user" ? "environment" : "user";
    return start(videoElement);
  }

  function currentStream() { return stream; }
  return { start, stop, flip, currentStream };
})();
