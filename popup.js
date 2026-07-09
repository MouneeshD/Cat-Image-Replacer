const websiteName = document.getElementById("websiteName");
const imageCount = document.getElementById("imageCount");
const status = document.getElementById("status");

const replaceBtn = document.getElementById("replaceBtn");
const restoreBtn = document.getElementById("restoreBtn");

function updateStatus(message, type = "") {

    status.textContent = message;

    status.classList.remove("loading", "success", "error");

    if (type !== "") {
        status.classList.add(type);
    }

}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

    const currentTab = tabs[0];

    try {

        const url = new URL(currentTab.url);

        websiteName.textContent = url.hostname;

    } catch {

        websiteName.textContent = "Unknown Website";

    }

    chrome.tabs.sendMessage(
        currentTab.id,
        { action: "countImages" },
        (response) => {

            if (chrome.runtime.lastError) {

                imageCount.textContent = "0";
                updateStatus("Open a webpage first", "error");
                return;

            }

            imageCount.textContent = response.count;

        }
    );

});

replaceBtn.addEventListener("click", () => {

    updateStatus("Replacing images...", "loading");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

        chrome.tabs.sendMessage(
            tabs[0].id,
            { action: "replaceImages" },
            (response) => {

                if (chrome.runtime.lastError) {

                    updateStatus("Unable to replace images", "error");
                    return;

                }

                imageCount.textContent = response.count;

                updateStatus(
                    `Successfully replaced ${response.count} image(s)!`,
                    "success"
                );

            }
        );

    });

});

restoreBtn.addEventListener("click", () => {

    updateStatus("Restoring images...", "loading");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

        chrome.tabs.sendMessage(
            tabs[0].id,
            { action: "restoreImages" },
            (response) => {

                if (chrome.runtime.lastError) {

                    updateStatus("Unable to restore images", "error");
                    return;

                }

                updateStatus(
                    `Restored ${response.count} image(s)!`,
                    "success"
                );

            }
        );

    });

});