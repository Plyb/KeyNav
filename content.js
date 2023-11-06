function getSelectables(root) {
    function isVisible(element) {
        return element.offsetWidth > 0
            || element.offsetHeight > 0
            || element.getClientRects().length > 0;
    }

    function getCommand(element) {
        if (!element) {
            return 'root';
        }

        return element.ariaLabel
            || element.title
            || getLabelCommand(element)
            || element.innerText?.trim()
            || element.id
            || ('child of ' + getCommand(element.parentElement));
    }

    const labels = [...root.querySelectorAll('label')].reduce((prev, curr) => ({...prev, [curr.htmlFor]: curr}), {})

    function getLabelCommand(element)
    {
        const label = labels[element.id];

        if (!label || label.id === label.htmlFor) return undefined;

        return getCommand(label);
    }

    const nodes = [...root.querySelectorAll('a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])')]
        .filter(isVisible)
        .map(el => ({
            command: getCommand(el),
            el,
        }));
    const shadowNodes = [...root.querySelectorAll(':empty')].filter(node => node.shadowRoot);

    return [...nodes, ...shadowNodes.map(shadowNode => getSelectables(shadowNode.shadowRoot)).flat()].sort((a, b) => a.command.length - b.command.length);
}

let selectables = getSelectables(document);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    const type = msg.type;
    if (type === 'get-selectables') {
        sendResponse(selectables.map((selectable, index) => ({...selectable, index})));
    } else if (type === 'go') {
        selectables[msg.index].el.focus();
    }
})

const observer = new MutationObserver(() => selectables = getSelectables(document))

observer.observe(document.body, { attributes: true, childList: true, subtree: true });