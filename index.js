const gemini = require('gemini-server').default;
const fs = require('fs');
var uuid = require('uuid').v5;
const config = require('./config.json');

const app = gemini({
    cert: fs.readFileSync(config.cert),
    key: fs.readFileSync(config.key),
    titanEnabled: false
});

const GEM_SPACE = process.env.GEM_SPACE || '/var/gem/editor/gmi/';

var appNamespace = config.appNamespace;//'f489d911-5e0c-4450-826f-1690baf5a246';

app.on('/atom.xml', (req, res) => {

	let files = fs.readdirSync(GEM_SPACE)
		.map(file => {
			return {
				name: file,
				createdAt: new Date(fs.statSync(`${GEM_SPACE}/logs/${file}`).birthtime),
				path: `${GEM_SPACE}/${file}`
			};
		})
		.sort((a, b) => b.createdAt - a.createdAt);

	let updatedAt = files[0].createdAt;

	let xml = [`<?xml version="1.0" encoding="utf-8"?>`];
	xml.push(`<feed xmlns="http://www.w3.org/2005/Atom">`);
	xml.push(`<title>${config.title}</title>`);
	xml.push(`<link href="gemini://${config.host}" />`);
	xml.push(`<updated>${ISODateString(updatedAt)}</updated>`);
	xml.push(`<author>`);
	xml.push(`  <name>${config.author}</name>`);
	xml.push(`</author>`);
	xml.push(`<id>urn:uuid:${config.appNamespace}</id>`);
	xml.push(``);
	files.forEach(file => {
		var title = file.name
			.split("-")
			.map(word => word[0].toUpperCase() + word.substring(1))
			.map(word => word.replaceAll(".gmi", ""))
			.join(' ');

		let id = uuid(file.name, appNamespace);
		
		xml.push(`<entry>`);
		xml.push(`  <title>${title}</title>`);
		xml.push(`  <link rel="alternate" href="gemini://${config.host}/logs/${file.name}" />`);
		xml.push(`  <updated>${ISODateString(file.createdAt)}</updated>`);
		xml.push(`  <id>urn:uuid:${id}</id>`);
		xml.push(`</entry>`);
	});
	xml.push(`</feed>`);
    
    res.set({'content-type': 'application/atom+xml'});
	res.send(xml.join("\n"));
});

app.use("/", gemini.serveStatic(config.gemSpace));

app.listen(() => {
    console.log(`Listening on host [${config.host}]`);
});
