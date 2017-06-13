const fs = require("fs");
const os = require("os");
const path = require("path");

let unsprayrc = {};
try {
    unsprayrc = JSON.parse(
        fs.readFileSync(path.join(os.homedir(), ".unsprayrc"), "utf8")
    );
} catch (e) {
    if (e.code === "ENOENT") {
        unsprayrc.error = e.code;
    }
}

module.exports = {
    applicationID: unsprayrc.applicationID || "",
    searchUrl: "https://api.unsplash.com/search/photos",
    photoUrl: "https://api.unsplash.com/photos",
    randomUrl: "https://api.unsplash.com/photos/random",
    homeDir: os.homedir(),
    errorCode: unsprayrc.error
};
