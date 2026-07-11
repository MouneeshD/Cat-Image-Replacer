let observer = null;
let isReplacing = false;

const API_KEY = "YOUR_API_KEY";

let catImages = [];

/* ---------------- LOAD 50 CAT IMAGES ---------------- */

async function loadCatImages() {

    if (catImages.length > 0) return;

    try {

        const response = await fetch(
            "https://api.thecatapi.com/v1/images/search?limit=50",
            {
                headers: {
                    "x-api-key": "live_CFFsaqPP7NmAFJyPGm0I1WlxxJ3bIZgkXxdtYxdl0nudf82163dDGvqS8onINelG"
                }
            }
        );

        const data = await response.json();

        catImages = data.map(cat => cat.url);

    }

    catch (error) {

        console.error("Unable to fetch cat images.", error);

        catImages = [
            "https://cataas.com/cat"
        ];

    }

}

/* ---------------- MESSAGE LISTENER ---------------- */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action === "countImages") {

        sendResponse({
            count: document.querySelectorAll("img").length
        });

    }

    else if (request.action === "replaceImages") {

        replaceAllImages().then(count => {

            startObserver();

            sendResponse({
                count: count
            });

        });

        return true;

    }

    else if (request.action === "restoreImages") {

        stopObserver();

        const count = restoreImages();

        sendResponse({
            count: count
        });

    }

});

/* ---------------- REPLACE ALL ---------------- */

async function replaceAllImages() {

    isReplacing = true;

    await loadCatImages();

    const images = document.querySelectorAll("img");

    let replaced = 0;

    images.forEach(img => {

        if (replaceImage(img)) {

            replaced++;

        }

    });

    isReplacing = false;

    return replaced;

}

/* ---------------- REPLACE SINGLE IMAGE ---------------- */

function replaceImage(img) {

    if (!img) return false;

    if (img.dataset.catReplaced === "true") return false;

    if (!img.src) return false;

    if (!img.complete) return false;

    // Save originals
    img.dataset.originalSrc = img.src;
    img.dataset.originalSrcset = img.srcset || "";
    img.dataset.originalSizes = img.sizes || "";

    img.dataset.originalObjectFit = img.style.objectFit || "";
    img.dataset.originalWidth = img.style.width || "";
    img.dataset.originalHeight = img.style.height || "";
    img.dataset.originalMaxWidth = img.style.maxWidth || "";
    img.dataset.originalMaxHeight = img.style.maxHeight || "";

    img.removeAttribute("srcset");
    img.removeAttribute("sizes");

    const randomCat =
        catImages[Math.floor(Math.random() * catImages.length)];

    img.src = randomCat;

    /* Keep image inside its original box */

    img.style.objectFit = "cover";
    img.style.width = img.width + "px";
    img.style.height = img.height + "px";
    img.style.maxWidth = "100%";
    img.style.maxHeight = "100%";
    img.style.borderRadius = "6px";

    img.dataset.catReplaced = "true";

    return true;

}

/* ---------------- RESTORE ---------------- */

function restoreImages() {

    const images = document.querySelectorAll("img");

    let restored = 0;

    images.forEach(img => {

        if (!img.dataset.originalSrc) return;

        img.src = img.dataset.originalSrc;
        img.srcset = img.dataset.originalSrcset;
        img.sizes = img.dataset.originalSizes;

        img.style.objectFit = img.dataset.originalObjectFit;
        img.style.width = img.dataset.originalWidth;
        img.style.height = img.dataset.originalHeight;
        img.style.maxWidth = img.dataset.originalMaxWidth;
        img.style.maxHeight = img.dataset.originalMaxHeight;
        img.style.borderRadius = "";

        delete img.dataset.originalSrc;
        delete img.dataset.originalSrcset;
        delete img.dataset.originalSizes;
        delete img.dataset.originalObjectFit;
        delete img.dataset.originalWidth;
        delete img.dataset.originalHeight;
        delete img.dataset.originalMaxWidth;
        delete img.dataset.originalMaxHeight;
        delete img.dataset.catReplaced;

        restored++;

    });

    return restored;

}

/* ---------------- OBSERVER ---------------- */

function startObserver() {

    if (observer) return;

    observer = new MutationObserver(mutations => {

        if (isReplacing) return;

        mutations.forEach(mutation => {

            mutation.addedNodes.forEach(node => {

                if (node.nodeType !== 1) return;

                if (node.tagName === "IMG") {

                    replaceImage(node);

                }

                else if (node.querySelectorAll) {

                    node.querySelectorAll("img").forEach(img => {

                        replaceImage(img);

                    });

                }

            });

        });

    });

    observer.observe(document.body, {

        childList: true,
        subtree: true

    });

}

function stopObserver() {

    if (!observer) return;

    observer.disconnect();

    observer = null;

}

/* ---------------- AUTO START ---------------- */

window.addEventListener("load", async () => {

    await replaceAllImages();

    startObserver();

});