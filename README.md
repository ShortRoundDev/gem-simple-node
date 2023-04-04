# Simple Gemini Node.JS server

I see a lot of "simple, static gem server" implementations out there that aren't actually that simple, and aren't actually that static. I wrote this server so that you can make an ACTUAL, super simple, file-based, static gemini server. This is based on the [gemini-server](https://www.npmjs.com/package/gemini-server) package.

It serves a configured directory as a static repository, then reads information about the files in that directory to generate an atom.xml feed at `gemini://{your_host_name}/atom.xml`

# Set up
Clone the repo, then run `npm install`. Run with `node ./index.js` You'll need to configure the server by editing `config.json`. The default config is

```json
{
    "title": "Shortround's Space",
    "host": "localhost",
    "author": "Shortround",
    "appNamespace": "f489d911-5e0c-4450-826f-1690baf5b246",
    "cert": "cert.pem",
    "key": "key.pem",
    "gemSpace": "gmi"
}
```

Here's what each value means:

* `title` - The title of your site. This will appear at the top of the atom feed in the `<title>` attribute.
* `host` - The host of your site. This is used to generate the links to your logs in the atom feed (e.g: `<link href="gemini://${config.host}/logs/${log_file} />`) 
* `author` - The name you want to go in the `<author>` field of your atom feed
* `appNamespace` - A harcoded, randomly generated UUID. This is used as the namespace to generate other UUIDs in your atom feed, along with the filename of your log. This way your `<entry>` IDs are static across page loads.
* `cert` - The path to your certificate file. By default this is a file local to your directory
* `key` - The path to your private key file. By default this is a file local to your directory
* `gemSpace` - The path your gmi files. There must be a directory called `logs` within, and an `index.gmi` at the root. By default, this is the `gmi` directory in your server directory

You can generate your cer and key with 

```
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj '/CN=localhost'
```

(replacing "localhost" with your domain)

# Logs
Put your logs in your `{gemSpace}/logs` folder. The name of the files should be the title of the post, separated with hyphens (`-`) where you would otherwise puts spaces. For example, a post titled "The Man, The Myth, The Legend. John Romero" should be titled `the-man-the-myth-the-legend.-John-Romero.gmi` (removing the punctuation marks which are not valid in gemini links). The Atom feed will replace all hyphens with spaces when generating the title of file, and capitalize the first letter of each word. The above example becomes

```xml
<title>The Man The Myth The Legend. John Romero</title>
```
# Atom Feed
The atom feed is available at `{config.host}/atom.xml`. It gets a list of all the files in your `{gemSpace}/logs` directory and sorts them by their [birthtime](https://nodejs.org/api/fs.html#statsbirthtime), descending.

## `<title>`
The title of each entry is calculated by replacing all hyphens in the file name with spaces,  capitalizing the first letter of each word in the title, then dropping the `.gmi` off the end. Thus:

```
the-man-the-myth-the-legend.-John-Romero.gmi
```

Becomes "The Man The Myth The Legend. John Romero"
## `<link>`
Links are generated with an absolute URI in the form `gemini://${config.host}/logs/${fileName}`, using `rel="alternate"`. See above for configuring the `config.host` property.

## `<updated>`
The updated property is generated from the birthtime of the file, in RFC 3339 format

## `<id>`
IDs are UUIDs generated with the filename and the `config.appNamespace` property as the seed.