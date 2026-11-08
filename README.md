# Miffy Photo Booth — starter

A small, mobile-first photo booth starter built with plain HTML, CSS and JavaScript.

## What's included
- Responsive pastel landing page
- iPhone-friendly camera permission flow
- Front/back camera switching
- Photo capture and local PNG download
- No backend and no photo uploads

## Run locally
Camera access requires HTTPS or localhost.

### Option A: VS Code Live Server
1. Open this folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` and choose **Open with Live Server**.
4. Test the page in a browser.

### Option B: Python local server
From this folder, run:
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000`.

## Publish with GitHub Pages
1. Create a new GitHub repository, e.g. `miffy-photo-booth`.
2. Upload all files and folders in this project to the repository root.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main`, folder `/ (root)`, then Save.
6. Wait for the Pages deployment to finish. Your site will be at:
   `https://YOUR-USERNAME.github.io/miffy-photo-booth/`

## iPhone testing
- Open the HTTPS Pages URL in Safari.
- Tap **enter the photo booth**.
- Allow camera access.
- Take a photo and test the **save** link.
- If camera permission was previously denied, check iPhone Settings → Safari → Camera.

## Before the gift is finished
This is a functional starter, not the final design. Next planned additions:
- Personalised welcome message
- Original decorative sticker/overlay pack
- Polaroid-style photo frames
- More filters and a photo strip layout
- Final NFC tag URL writing and real-device testing
