const gemini = require('gemini-server').default;
const fs = require('fs');

const app = gemini({
    cert: fs.readFileSync("cert.pem"),
    key: fs.readFileSync("key.pem"),
    titanEnabled: false
});

app.use("/", gemini.serveStatic("/var/gem/editor/gmi"));

app.listen(() => {
    console.log("Listening...");
});
