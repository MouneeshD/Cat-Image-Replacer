let observer = null;
let isReplacing = false;

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

async function replaceAllImages() {

    isReplacing = true;

    const images = [...document.querySelectorAll("img")];

    let replaced = 0;

    for (const img of images) {

        const success = await replaceImage(img);

        if (success) {
            replaced++;
        }

    }

    isReplacing = false;

    return replaced;

}

async function replaceImage(img) {

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

    try {

        img.removeAttribute("srcset");
        img.removeAttribute("sizes");
        img.removeAttribute("loading");

        img.src =
            `https://cataas.com/cat?width=400&height=400&random=${Date.now()}-${Math.random()}`;

        img.dataset.catReplaced = "true";

        return true;

    } catch (error) {

        console.error(error);

        return false;

    }

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

            mutation.addedNodes.forEach(async node => {

                if (node.nodeType !== 1) return;

                if (node.tagName === "IMG") {

                    await replaceImage(node);

                }

                const imgs = node.querySelectorAll
                    ? node.querySelectorAll("img")
                    : [];

                for (const img of imgs) {

                    await replaceImage(img);

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