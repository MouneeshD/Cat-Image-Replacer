const images = document.querySelectorAll("img");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action === "countImages") {

        sendResponse({
            count: images.length
        });

    }

    if (request.action === "replaceImages") {

        let replacedCount = 0;

        images.forEach((img, index) => {

            if (!img.dataset.originalSrc) {
                img.dataset.originalSrc = img.src;
            }

            img.src = `https://cataas.com/cat?${Date.now()}=${index}`;

            replacedCount++;

        });

        sendResponse({
            count: replacedCount
        });

    }

    if (request.action === "restoreImages") {

        let restoredCount = 0;

        images.forEach(img => {

            if (img.dataset.originalSrc) {

                img.src = img.dataset.originalSrc;

                restoredCount++;

            }

        });

        sendResponse({
            count: restoredCount
        });

    }

    return true;

});