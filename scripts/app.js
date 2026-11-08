const dialog = document.getElementById("camera-dialog");
const openButton = document.getElementById("open-camera");
const closeButton = document.getElementById("close-camera");
const video = document.getElementById("camera-video");
const canvas = document.getElementById("photo-canvas");
const placeholder = document.getElementById("camera-placeholder");
const status = document.getElementById("camera-status");
const takeButton = document.getElementById("take-photo");
const flipButton = document.getElementById("switch-camera");
const retakeButton = document.getElementById("retake-photo");
const downloadLink = document.getElementById("download-photo");

function showLiveCamera() {
  video.hidden = false;
  canvas.hidden = true;
  placeholder.hidden = true;
  takeButton.hidden = false;
  takeButton.disabled = false;
  retakeButton.hidden = true;
  downloadLink.hidden = true;
}
function showCapturedPhoto(dataUrl) {
  video.hidden = true;
  canvas.hidden = false;
  placeholder.hidden = true;
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  const image = new Image();
  image.onload = () => canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
  image.src = dataUrl;
  takeButton.hidden = true;
  retakeButton.hidden = false;
  downloadLink.href = dataUrl;
  downloadLink.hidden = false;
}

openButton.addEventListener("click", async () => {
  dialog.showModal();
  status.textContent = "Waking up the camera…";
  try {
    await Camera.start(video);
    showLiveCamera();
    flipButton.disabled = false;
    status.textContent = "Ready when you are ♡";
  } catch (error) {
    status.textContent = error.name === "NotAllowedError"
      ? "Camera permission was not granted. You can enable it in iPhone Settings → Safari → Camera."
      : error.message || "Couldn't start the camera. Please try again.";
    placeholder.hidden = false;
  }
});

closeButton.addEventListener("click", () => {
  Camera.stop();
  dialog.close();
  status.textContent = "";
  video.srcObject = null;
  video.hidden = true;
  canvas.hidden = true;
  placeholder.hidden = false;
  takeButton.disabled = true;
  flipButton.disabled = true;
});

flipButton.addEventListener("click", async () => {
  flipButton.disabled = true;
  status.textContent = "Switching camera…";
  try {
    await Camera.flip(video);
    showLiveCamera();
    status.textContent = "Looking good ♡";
  } catch (error) {
    status.textContent = error.message || "Couldn't switch cameras.";
  } finally {
    flipButton.disabled = false;
  }
});

takeButton.addEventListener("click", () => {
  try {
    const photo = PhotoBooth.capture(video, canvas);
    showCapturedPhoto(photo);
    status.textContent = "A little memory, captured ♡";
  } catch (error) {
    status.textContent = error.message;
  }
});

retakeButton.addEventListener("click", () => {
  showLiveCamera();
  status.textContent = "Ready for another one ♡";
});

dialog.addEventListener("close", () => Camera.stop());
