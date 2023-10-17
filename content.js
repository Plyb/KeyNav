function getSelectables() {
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

    const labels = [...document.getElementsByTagName('label')].reduce((prev, curr) => ({...prev, [curr.htmlFor]: curr}), {})

    function getLabelCommand(element)
    {
        const label = labels[element.id];

        if (!label || label.id === label.htmlFor) return undefined;

        return getCommand(label);
    }

    return [...document.querySelectorAll('a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])')]
        .filter(isVisible)
        .map((el, index) => ({
            command: getCommand(el),
            el,
            index,
        }));
}

let selectables = getSelectables();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log(msg)
    const type = msg.type;
    if (type === 'get-selectables') {
        console.log(selectables);
        sendResponse(selectables);
    } else if (type === 'go') {
        selectables[msg.index].el.focus();
    }
})

const observer = new MutationObserver(() => selectables = getSelectables())

observer.observe(document.body, { attributes: true, childList: true, subtree: true });