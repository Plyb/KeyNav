let selectables = [];

const optionsElement = document.getElementById('options');

function onInput(event) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'get-selectables' }, (pageSelectables) => {
            selectables = pageSelectables
                .filter(selectable => selectable.command.toLowerCase().includes(event.target.value.toLowerCase()))
                .sort((a, b) => a.length < b.length);

            while (optionsElement.lastElementChild) {
                optionsElement.removeChild(optionsElement.lastElementChild);
            }

            const topOptions = selectables.slice(0, 10);
            for (const option of topOptions) {
                const aElement = document.createElement('a', { tabIndex: 0 });
                aElement.tabIndex = 0;
                aElement.appendChild(document.createTextNode(option.command));
                optionsElement.appendChild(aElement);

                const goToElement = () => {
                    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                        chrome.tabs.sendMessage(tabs[0].id, { type: 'go', index: option.index });
                    });
                    window.close();
                };
                aElement.addEventListener('click', goToElement);
                aElement.addEventListener('keydown', (event) => event.code === 'Enter' && goToElement());
            }
        });
    })
}

document.getElementById('nav-search').addEventListener('input', onInput);