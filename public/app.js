function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}

function generate() {
    let uuid = uuidv4();
    if (!document.getElementById("use-hyphens").checked)
        uuid = uuid.replace(/-/g, '');
    if (document.getElementById("use-braces").checked)
        uuid = `{` + uuid + `}`;
    if (document.getElementById("use-upper").checked)
        uuid = uuid.toUpperCase();
    return uuid;
}

function generateAndShow() {
    let uuid = generate();
    document.getElementById('guid').innerText = uuid;
}

document.getElementById("more").addEventListener("click", generateAndShow);


function disableButton(id, clazz) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.disabled = true;
    btn.classList.add("is-disabled");
    btn.classList.remove(clazz);
}
function enableButton(id, clazz) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.disabled = false;
    btn.classList.remove("is-disabled");
    btn.classList.add(clazz);
}


function openDisclaimer() {
    let dialog = document.getElementById('dialog-disclaimer');
    dialogPolyfill.registerDialog(dialog);
    dialog.showModal();
}
function closeDisclaimer() {
    document.getElementById('dialog-disclaimer').close();
}
document.getElementById("disclaimer").addEventListener("click", openDisclaimer);
document.getElementById("close-disclaimer").addEventListener("click", closeDisclaimer);


function openCookies() {
    let dialog = document.getElementById('dialog-cookies');
    dialogPolyfill.registerDialog(dialog);
    dialog.showModal();
}
function closeCookies() {
    document.getElementById('dialog-cookies').close();
}
document.getElementById("cookies").addEventListener("click", openCookies);
document.getElementById("close-cookies").addEventListener("click", closeCookies);



function createFile(csvContent) { 
    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, "guids.csv");
    return;
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, "guids.csv");
    } else {        
        var link = document.createElement("a");
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "guids.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

let worker;
function openBulk() {
    document.getElementById("bulk-input").value = 100;
    document.getElementById('bulk-progress').style.display = 'none';
    const dialog = document.getElementById('dialog-bulk');
    dialogPolyfill.registerDialog(dialog);
    dialog.showModal();
}
function downloadBulk() {
    const input = document.getElementById("bulk-input");
    let num = Number(input.value);
    if (!num || num < 1)
        return;
    input.disabled = true;
    
    disableButton("bulk-btn", "is-primary");

    if (typeof(Worker) !== "undefined") { 
        const progress = document.getElementById('bulk-progress');
        progress.setAttribute('value', 0);
        progress.style.display = 'block';
        if (typeof(worker) == "undefined") { 
            worker = new Worker("worker.js");
        }
        worker.postMessage({
            num: num,
            hyphens: document.getElementById("use-hyphens").checked,
            braces: document.getElementById("use-braces").checked,
            upper: document.getElementById("use-upper").checked
        });
        worker.onmessage = function(event) {
            if (event.data.result) {
                progress.setAttribute('value', 100);
                createFile(event.data.result);
                input.disabled = false;
                enableButton("bulk-btn", "is-primary");
                worker.terminate();
                worker = undefined;
            } else if (event.data.percent) {
                progress.setAttribute('value', event.data.percent);
            } 
        };
    } else {
        let csvContent = "";
        for (let k = 0; k < num; k++) {
            csvContent += generate() + "\r\n";
        }
        createFile(csvContent);
        input.disabled = false;
        enableButton("bulk-btn", "is-primary");
    }
}
function cancelBulk() {
    if (typeof(worker) !== "undefined") { 
        worker.terminate();
        worker = undefined;
        document.getElementById('bulk-progress').style.display = 'none';
        document.getElementById("bulk-input").disabled = false;
        enableButton("bulk-btn", "is-primary");
    } else {
        document.getElementById('dialog-bulk').close();
    }
}
document.getElementById("bulk").addEventListener("click", openBulk);
document.getElementById("bulk-btn").addEventListener("click", downloadBulk);
document.getElementById("close-bulk").addEventListener("click", cancelBulk);



document.getElementById("use-upper").addEventListener("change", function () {
    let uuid = document.getElementById('guid').innerText;
    if (this.checked)
        uuid = uuid.toUpperCase();
    else
        uuid = uuid.toLowerCase();
    document.getElementById('guid').innerText = uuid;
});

document.getElementById("use-hyphens").addEventListener("change", function () {
    const incr = document.getElementById("use-braces").checked ? 1 : 0;
    let uuid = document.getElementById('guid').innerText;
    if (this.checked)
        uuid = uuid.slice(0, 8 + incr) + '-' + uuid.slice(8 + incr, 12 + incr) + '-' + uuid.slice(12 + incr, 16 + incr) + '-' + uuid.slice(16 + incr, 20 + incr) + '-' + uuid.slice(20 + incr);
    else
        uuid = uuid.replace(/-/g, '');
    document.getElementById('guid').innerText = uuid;
});

document.getElementById("use-braces").addEventListener("change", function () {
    let uuid = document.getElementById('guid').innerText;
    if (!this.checked)
        uuid = uuid.replace(/[\{\}]/g, '');
    else
        uuid = `{` + uuid + `}`;
    document.getElementById('guid').innerText = uuid;
});



let timeout;
function copy() {
    if (timeout)
        clearTimeout(timeout);
    const guid = document.getElementById('guid');
    selectText('guid')

    document.execCommand('copy');

    const copied = document.getElementById("copied");
    copied.style.display = "block";
    timeout = setTimeout(function () {
        copied.style.display = "none";
    }, 1000)

    if (document.selection)
        document.selection.empty();
    else if (window.getSelection)
        window.getSelection().removeAllRanges();

    guid.blur();
}

function selectText(containerid) {
    if (document.selection) { // IE
        var range = document.body.createTextRange();
        range.moveToElementText(document.getElementById(containerid));
        range.select();
    } else if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(document.getElementById(containerid));
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    }
}
document.getElementById("copy").addEventListener("click", copy);

generateAndShow();