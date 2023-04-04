var express = require('express');
var app = express();

var fs = require('fs');
var uuid = require('uuid').v5;

var appNamespace = 'f489d911-5e0c-4450-826f-1690baf5a246';

app.get('/', (req, res) => {

	let files = fs.readdirSync('/var/gem/editor/gmi/logs')
		.map(file => {
			return {
				name: file,
				createdAt: new Date(fs.statSync(`/var/gem/editor/gmi/logs/${file}`).birthtime),
				path: `/var/gem/editor/gmi/logs/${file}`
			};
		})
		.sort((a, b) => b.createdAt - a.createdAt);

	let updatedAt = files[0].createdAt;

	let xml = [`<?xml version="1.0" encoding="utf-8"?>`];
	xml.push(`<feed xmlns="http://www.w3.org/2005/Atom">`);
	xml.push(`<title>Shortround's Capsule</title>`);
	xml.push(`<link href="gemini://shortround.space" />`);
	xml.push(`<updated>${ISODateString(updatedAt)}</updated>`);
	xml.push(`<author>`);
	xml.push(`  <name>Shortround</name>`);
	xml.push(`</author>`);
	xml.push(`<id>urn:uuid:${appNamespace}</id>`);
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
		xml.push(`  <link rel="alternate" href="gemini://shortround.space/logs/${file.name}" />`);
		xml.push(`  <updated>${ISODateString(file.createdAt)}</updated>`);
		xml.push(`  <id>urn:uuid:${id}</id>`);
		xml.push(`</entry>`);
	});
	res.set({'content-type': 'application/atom+xml'});
	xml.push(`</feed>`);
	res.send(xml.join("\n"));
});

function ISODateString(d){
	function pad(n){
		return n<10 ? '0'+n : n
	}
	return d.getUTCFullYear()+'-'
	+ pad(d.getUTCMonth()+1)+'-'
	+ pad(d.getUTCDate())+'T'
	+ pad(d.getUTCHours())+':'
	+ pad(d.getUTCMinutes())+':'
	+ pad(d.getUTCSeconds())+'Z'
}


app.listen(3000);
