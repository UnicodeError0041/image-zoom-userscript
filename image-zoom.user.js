// ==UserScript==
// @name         Image Zoom
// @namespace    http://tampermonkey.net/
// @version      2024-05-31
// @description  Zoom into images by hovering and scrolling with the "z" key pressed
// @downloadURL  https://github.com/UnicodeError0041/image-zoom-userscript/raw/main/image-zoom.user.js
// @updateURL    https://github.com/UnicodeError0041/image-zoom-userscript/raw/main/image-zoom.user.js
// @icon         https://raw.githubusercontent.com/UnicodeError0041/image-zoom-userscript/main/icon.png
// @author       UnicodeError0041
// @match        *://*/*
// @grant        none
// ==/UserScript==

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

const MIN_ZOOM = 1;
const ZOOMABLE_ATTRIBUTE = "__imageZoomSetup";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function isZoomedIn(element) {
  return element.style.scale !== "1" && element.style.scale != "";
}

(function () {
  "use strict";

  let isZoomKeyPressed = false;
  let isMousePressed = false;

  document.addEventListener("keydown", (event) => {
    if (event.key === ZOOM_KEY) {
      isZoomKeyPressed = true;
    }
  });

  document.addEventListener("keyup", (event) => {
    if (event.key === ZOOM_KEY) {
      isZoomKeyPressed = false;
    }
  });

  document.addEventListener("mousedown", (event) => {
    if (event.button === 0) {
      isMousePressed = true;
    }
  });

  document.addEventListener("mouseup", (event) => {
    if (event.button === 0) {
      isMousePressed = false;
    }
  });

  const setupZoomForElement = (element) => {
    if (element.hasAttribute(ZOOMABLE_ATTRIBUTE)) {
      return;
    }

    const zoomOverlay = document.createElement("div");
    zoomOverlay.style =
      "display:none; position: absolute; z-index: 999999999; opacity: 1";
    document.body.appendChild(zoomOverlay);

    const updateZoomOverlayPosition = () => {
      if (!ALLOW_IMAGE_MOVEMENT) {
        return;
      }

      setTimeout(() => {
        const bounds = element.getBoundingClientRect();
        zoomOverlay.style.left = `${bounds.left + window.scrollX}px`;
        zoomOverlay.style.top = `${bounds.top + window.scrollY}px`;
        zoomOverlay.style.width = `${bounds.width}px`;
        zoomOverlay.style.height = `${bounds.height}px`;

        zoomOverlay.style.cursor = element.style.cursor;
      }, ZOOM_TRANSITION_DURATION * 1000);
    };

    let scale = 1;
    let translateX = 0;
    let translateY = 0;

    const hasClipPath =
      window.getComputedStyle(element).getPropertyValue("clip-path") !== "none";

    let originalLeft;
    let originalTop;
    let originalWidth;
    let originalHeight;

    const calculateOriginalPosition = () => {
      const bounds = element.getBoundingClientRect();
      originalLeft = bounds.left + window.scrollX - translateX;
      originalTop = bounds.top + window.scrollY - translateY;
      originalWidth = bounds.width;
      originalHeight = bounds.height;
    };

    const constrainPosition = () => {
      translateX = clamp(translateX, originalWidth * (1 - scale), 0);
      translateY = clamp(translateY, originalHeight * (1 - scale), 0);

      if (!hasClipPath && CLIP_IF_NOT_CLIPPED) {
        element.style.clipPath = `xywh(${-translateX / scale}px ${
          -translateY / scale
        }px ${originalWidth / scale}px ${originalHeight / scale}px)`;
      }
    };

    const resetZoom = () => {
      scale = 1;
      translateX = 0;
      translateY = 0;

      setTimeout(() => {
        element.transition = "";
        element.style.transformOrigin = "";

        if (JUMP_TO_TOP_OF_STACKING_CONTEXT_ON_ZOOM) {
          element.style.zIndex = "";
        }
      }, ZOOM_TRANSITION_DURATION * 1000);

      element.style.translate = "";
      element.style.scale = "";
      element.style.clipPath = "";

      if (ALLOW_IMAGE_MOVEMENT) {
        zoomOverlay.style.display = "none";
        element.removeAttribute("draggable");
        element.style.pointerEvents = "";
      }
    };

    calculateOriginalPosition();

    const handleZoom = (event) => {
      // Thanks to: https://jsfiddle.net/rfpe0mhq/

      if (!isZoomKeyPressed || !element.hasAttribute(ZOOMABLE_ATTRIBUTE)) {
        return;
      }

      event.preventDefault();

      if (scale === 1) {
        calculateOriginalPosition();
      }

      const mouseX = event.pageX - originalLeft;
      const mouseY = event.pageY - originalTop;

      const previousScale = scale;
      const delta = -event.deltaY * ZOOM_FACTOR;
      scale = clamp(scale * (1 + delta), MIN_ZOOM, MAX_ZOOM);

      const ratio = 1 - scale / previousScale;

      translateX += (mouseX - translateX) * ratio;
      translateY += (mouseY - translateY) * ratio;

      constrainPosition();

      if (scale !== 1) {
        element.style.transformOrigin = "0 0";
        element.style.translate = `${translateX}px ${translateY}px`;
        element.style.scale = `${scale}`;

        if (ALLOW_IMAGE_MOVEMENT) {
          zoomOverlay.style.display = "";
          element.setAttribute("draggable", false);
          element.style.pointerEvents = "none";
        }
      } else {
        resetZoom();
      }

      if (JUMP_TO_TOP_OF_STACKING_CONTEXT_ON_ZOOM && scale > 1) {
        element.style.zIndex = "999999999";
      } else if (JUMP_TO_TOP_OF_STACKING_CONTEXT_ON_ZOOM) {
        element.style.zIndex = "";
      }

      if (scale != 1 && ZOOM_TRANSITION_DURATION !== 0) {
        element.style.transition = `scale ${ZOOM_TRANSITION_DURATION}s ease-out, translate ${ZOOM_TRANSITION_DURATION}s ease-out, clip-path ${ZOOM_TRANSITION_DURATION}s ease-out`;
      } else if (ZOOM_TRANSITION_DURATION !== 0) {
        element.style.transition = "";
      }

      updateZoomOverlayPosition();
    };

    const handleMouseEnter = (event) => {
      if (!element.hasAttribute(ZOOMABLE_ATTRIBUTE)) {
        return;
      }

      element.__isHovering = true;
    };

    const handleMouseExit = (event) => {
      if (!element.hasAttribute(ZOOMABLE_ATTRIBUTE)) {
        return;
      }

      element.__isHovering = false;
    };

    const handleClick = (event) => {
      if (scale !== 1) {
        event.preventDefault();
      }
    };

    element.addEventListener("wheel", handleZoom, { passive: false });
    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseExit);

    zoomOverlay.addEventListener("wheel", handleZoom, { passive: false });
    zoomOverlay.addEventListener("mouseenter", handleMouseEnter);
    zoomOverlay.addEventListener("mouseleave", handleMouseExit);
    zoomOverlay.addEventListener("mousedown", handleClick);

    let handleMouseMove;

    if (ALLOW_IMAGE_MOVEMENT) {
      let previousPageX;
      let previousPageY;

      handleMouseMove = (event) => {
        if (!element.hasAttribute(ZOOMABLE_ATTRIBUTE)) {
          return;
        }

        if (isMousePressed && ALLOW_IMAGE_MOVEMENT) {
          translateX += event.pageX - previousPageX;
          translateY += event.pageY - previousPageY;

          constrainPosition();
          element.style.translate = `${translateX}px ${translateY}px`;
          updateZoomOverlayPosition();
        }

        previousPageX = event.pageX;
        previousPageY = event.pageY;
        element.__isHovering = true;
      };

      zoomOverlay.addEventListener("mousemove", handleMouseMove);
    }

    updateZoomOverlayPosition();

    let handleZoomReset;

    if (RESET_ZOOM_ON_CLICK_AWAY) {
      handleZoomReset = (event) => {
        if (!element.hasAttribute(ZOOMABLE_ATTRIBUTE)) {
          return;
        }

        if (!element.__isHovering) {
          resetZoom();
        }
      };
      document.addEventListener("click", handleZoomReset);
    }

    element.__setCursor = (cursor) => {
      element.style.cursor = cursor;
      zoomOverlay.style.cursor = cursor;
    };

    element.__disable = () => {
      resetZoom();

      element.removeEventListener("wheel", handleZoom, { passive: false });
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseExit);

      zoomOverlay.removeEventListener("wheel", handleZoom, { passive: false });
      zoomOverlay.removeEventListener("mouseenter", handleMouseEnter);
      zoomOverlay.removeEventListener("mouseleave", handleMouseExit);
      zoomOverlay.removeEventListener("mousedown", handleClick);

      if (ALLOW_IMAGE_MOVEMENT) {
        zoomOverlay.removeEventListener("mousemove", handleMouseMove);
      }

      if (RESET_ZOOM_ON_CLICK_AWAY) {
        document.removeEventListener("click", handleZoomReset);
      }
    };

    element.setAttribute(ZOOMABLE_ATTRIBUTE, true);
    element.__isHovering = false;
  };

  let elements = [];
  let selectedElement = null;

  const initializeZoom = () => {
    elements = Array.from(document.querySelectorAll(TARGET_ELEMENTS_SELECTOR));
    addZoomToElements();
  };

  const removeZoomFromElement = (element) => {
    elements = elements.filter((elm) => elm !== element);
    element.removeAttribute(ZOOMABLE_ATTRIBUTE);
    element.__disable();
  };

  const addZoomToElement = (element) => {
    elements.push(element);
    setupZoomForElement(element);
  };

  const addZoomToElements = () => {
    elements.forEach(setupZoomForElement);
    if (selectedElement !== null) {
      addZoomToElement(selectedElement);
    }
  };

  setInterval(() => {
    elements.forEach((element) => {
      if (element.__isHovering && isZoomKeyPressed) {
        element.__setCursor("zoom-in");
      } else if (
        element.__isHovering &&
        ALLOW_IMAGE_MOVEMENT &&
        isZoomedIn(element) &&
        !isMousePressed
      ) {
        element.__setCursor("grab");
      } else if (
        element.__isHovering &&
        ALLOW_IMAGE_MOVEMENT &&
        isZoomedIn(element)
      ) {
        element.__setCursor("grabbing");
      } else {
        element.__setCursor("");
      }
    });
  }, 200);

  initializeZoom();

  if (ENABLE_ZOOM_ON_SELECTED_ELEMENT) {
    document.addEventListener("selectionchange", (event) => {
      const selection = document.getSelection();

      if (selection.rangeCount === 0 && selectedElement !== null) {
        removeZoomFromElement(selectedElement);
        selectedElement = null;
        return;
      }

      const range = selection.getRangeAt(0);
      let commonAncestor = range.commonAncestorContainer;

      while (commonAncestor.nodeType !== Node.ELEMENT_NODE) {
        commonAncestor = commonAncestor.parentNode;
      }

      if (selectedElement === commonAncestor) {
        return;
      }

      if (selectedElement !== null) {
        removeZoomFromElement(selectedElement);
      }

      if (range.collapsed) {
        selectedElement = null;
        return;
      }

      selectedElement = commonAncestor;

      addZoomToElement(selectedElement);
      selectedElement.dispatchEvent(new Event("mouseenter"));
    });
  }

  new MutationObserver(initializeZoom).observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
