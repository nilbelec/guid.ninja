function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}

function generate(hyphens, braces, upper) {
    let uuid = uuidv4();
    if (!hyphens)
        uuid = uuid.replace(/-/g, '');
    if (braces)
        uuid = `{` + uuid + `}`;
    if (upper)
        uuid = uuid.toUpperCase();
    return uuid;
}

onmessage = function(e) {
    const num = e.data.num;
    const hyphens = e.data.hyphens;
    const braces = e.data.braces;
    const upper = e.data.upper;

    let step = Math.floor(num/100);
    let percent = 1;

    let csvContent = "";
    for (let k = 0; k < num; k++) {
        csvContent += generate(hyphens, braces, upper) + "\r\n";
        if (k > (step * percent)) {
            this.postMessage({ percent: percent});
            percent++;
        }
    }
    this.postMessage({ result: csvContent});
}