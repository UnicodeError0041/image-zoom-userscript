# 🔍 Image Zoom Userscript

[![Add to tampermonkey](https://img.shields.io/badge/add%20to-tampermonkey-green)](https://github.com/UnicodeError0041/image-zoom-userscript/raw/main/image-zoom.user.js)

## Overview

Ever wanted to zoom into images on any website? This userscript lets you do just that! Just hover over an image, hold down the "z" key, and scroll to zoom in and out.

## Installation

To get started, you need a userscript manager. Here are some good options:

- **Tampermonkey**: [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) | [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- **Greasemonkey**: [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
- **Violentmonkey**: [Chrome Web Store](https://chrome.google.com/webstore/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag) | [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/)

After that, just click [here](https://github.com/UnicodeError0041/image-zoom-userscript/raw/main/image-zoom.user.js), or follow these steps:

- Install one of the userscript managers from the links above.
- Open your userscript manager's dashboard.
- Create a new script and paste in the script from this repository.
- Save it.

## How to Use

1. Make sure the userscript is turned on in your userscript manager.
2. Go to any webpage with images.
3. Hover over an image, hold down the "z" key, and scroll to zoom in and out.

## Settings and Configuration

You can tweak the script by changing some settings at the top of the script.

```javascript
// == Setting constants start here ==
const ZOOM_KEY = "z"; // The key to press in order to initiate zoom

const ZOOM_FACTOR = 0.0025; // Determines how much zoom is applied per scroll
const MAX_ZOOM = 30; // The maximum zoom level allowed
const JUMP_TO_TOP_OF_STACKING_CONTEXT_ON_ZOOM = true; // Brings the zoomed element to the top of the stacking context
const ZOOM_TRANSITION_DURATION = 0.2; // The time in seconds for the zoom transition effect

const CLIP_IF_NOT_CLIPPED = false; // If true, keeps the image size the same while zooming in; if false, the image grows in size
const ALLOW_IMAGE_MOVEMENT = true; // If true, allows zoomed images to be grabbed and moved around
const RESET_ZOOM_ON_CLICK_AWAY = true; // If true, resets zoom when clicking away from the zoomed image

const TARGET_ELEMENTS_SELECTOR = "img, video"; // CSS selector for elements that can be zoomed
const ENABLE_ZOOM_ON_SELECTED_ELEMENT = true; // If true, allows zooming on elements containing a text selection
// == Setting constants end here ==
```

## Try it Out

Check out these sample images from Lorem Picsum to see the script in action:

1. ![Lorem Picsum Image 1](https://picsum.photos/id/237/300/200)
2. ![Lorem Picsum Image 2](https://picsum.photos/id/238/300/200)
3. ![Lorem Picsum Image 3](https://picsum.photos/id/239/300/200)
4. ![Lorem Picsum Image 4](https://picsum.photos/id/240/300/200)
5. ![Lorem Picsum Image 5](https://picsum.photos/id/241/300/200)

## License

This script is under the MIT License.
