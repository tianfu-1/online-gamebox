class OSVersion {
    constructor(os, major, minner, patch) {
        this.os = os;
        this.major = major;
        this.minner = minner;
        this.patch = patch;
    }

    toString() {
        return `${this.os}_${this.major}_${this.minner}_${this.patch}`;
    }
}

function isIOS() {
    const ua = navigator.userAgent;
    return ua.indexOf("iPhone") > 0 || ua.indexOf("iPad") > 0;
}

function getOS() {
    if (isIOS()) {
        const extract = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
        return new OSVersion(
            "iOS",
            parseInt(extract[1] || 0, 10),
            parseInt(extract[2] || 0, 10),
            parseInt(extract[3] || 0, 10)
        );
    } else {
        return null;
    }
}