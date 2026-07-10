let observer = null;
let isReplacing = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action === "countImages") {

        sendResponse({
            count: document.querySelectorAll("img").length
        });

    }

    else if (request.action === "replaceImages") {

        const count = replaceAllImages();

        startObserver();

        sendResponse({
            count: count
        });

    }

    else if (request.action === "restoreImages") {

        stopObserver();

        const count = restoreImages();

        sendResponse({
            count: count
        });

    }

});

function replaceAllImages() {

    isReplacing = true;

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

function replaceImage(img) {

    if (!img) return false;

    if (img.dataset.catReplaced === "true") return false;

    if (!img.dataset.originalSrc) {
        img.dataset.originalSrc = img.src;
    }

    if (!img.dataset.originalSrcset) {
        img.dataset.originalSrcset = img.srcset || "";
    }

    if (!img.dataset.originalSizes) {
        img.dataset.originalSizes = img.sizes || "";
    }

    img.removeAttribute("srcset");
    img.removeAttribute("sizes");
    img.removeAttribute("loading");

    img.src =
        `https://cataas.com/cat?width=400&height=400&random=${Math.random()}`;

    img.dataset.catReplaced = "true";

    return true;

}

function restoreImages() {

    const images = document.querySelectorAll("img");

    let restored = 0;

    images.forEach(img => {

        if (!img.dataset.originalSrc) return;

        img.src = img.dataset.originalSrc;

        if (img.dataset.originalSrcset) {
            img.srcset = img.dataset.originalSrcset;
        }

        if (img.dataset.originalSizes) {
            img.sizes = img.dataset.originalSizes;
        }

        delete img.dataset.catReplaced;
        delete img.dataset.originalSrc;
        delete img.dataset.originalSrcset;
        delete img.dataset.originalSizes;

        restored++;

    });

    return restored;

}

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