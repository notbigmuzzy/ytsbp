//SETUP GLOBAL VARS
const 	fs = require('fs'),
		http = require('http'),
		https = require('https'),
		indexFile = './index.html',
		tempDirectory = './tmp',
		subsFile = './subscriptions.csv';

//APPEND TO FILE FUNCTION
function write(text) {
	fs.appendFileSync(indexFile, text);
}

//DELETE OLD INDEX FILE AND RECREATE TMP FOLDER
fs.unlink(indexFile, (err) => {
	if (err) {
		console.log('No index.html file. Creating new one ;)')
		getXMLFilesFromYT()	
		return
	} else {
		console.log('Index.html deleted! Lets create new one ;)')
		getXMLFilesFromYT()	
	}
})
fs.rmSync(tempDirectory, { recursive: true, force: true });
if (!fs.existsSync(tempDirectory)){ fs.mkdirSync(tempDirectory) }

//GET XML FILES AND CREATE LOCAL COPY IN TMP FOLDER
function getXMLFilesFromYT() {
	const 	subscriptionsFile = fs.readFileSync(subsFile,{encoding:'utf8', flag:'r'}),
			everyEntryInCSV = subscriptionsFile.split(/\r?\n/);

	var numberOfChannels = 1;
	everyEntryInCSV.forEach(function (value, index) {
		if (index < 1) { return }

		var urlID = value.split(',', 1)[0],
			urlString = 'https://www.youtube.com/feeds/videos.xml?channel_id=',
			urlReq = urlString + urlID;

		if (urlID) {
			https.get(urlReq, (response) => {
				let data = '';
				response.on('data', (chunk) => { data += chunk; });
				response.on('end', () => {
					fs.writeFileSync('./tmp/' + index + '.xml', data)

					fs.readdir(tempDirectory, (err, files) => {
						if(files.length == everyEntryInCSV.length -1) {
							generateIndexHTMLFile();
						}						
					})
				});
			})
		}
	})
}	

//GENERATE INDEX.HTML FILE
function generateIndexHTMLFile() {
	generateHeader();
	generateSidebar();
	generateChannelView();
	generateFooter();
}

//OG - CHANNEL VIEW
function generateChannelView() {
	const { XMLParser, XMLBuilder, XMLValidator} = require("./node_modules/fast-xml-parser/src/fxp");
	const xmlParserOptions = {
		removeNSPrefix: true,
		ignoreAttributes: false
	};
	const parser = new XMLParser(xmlParserOptions);

	write('<div class="category"><p class="section-title" id="subscriptions"><span>All Subscriptions</span></p>')

	fs.readdir(tempDirectory, (err, files) => {
		files.forEach(file => {
			const 	thisFile = fs.readFileSync(tempDirectory + '/' + file,{encoding:'utf8', flag:'r'}),
					objectified = parser.parse(thisFile),
					entries = objectified.feed.entry,
					channelColor = Math.floor(Math.random()*16777215).toString(16);

			channelTitle = objectified.feed.title;
			channelURL = objectified.feed.author.uri;
			authorName = objectified.feed.author.name;

			write('<section><div class="section-title" style="background-color:#' + channelColor + ';"><a target="_blank" class="section-title-link" href="' + channelURL + '"><h3>' + authorName + '</h3></a></div>')

			entries.forEach(function (value, index) {
				const 	entryInfo = value,
						videoID = entryInfo.id.slice(9),
						videoTitle = entryInfo.title,
						videoImg = entryInfo.group.thumbnail["@_url"],
						videoDescription = entryInfo.group.description

				write('<item><a class="iframe-source" href="https://www.youtube.com/embed/' + videoID + '?rel=0"></a><title>' + videoTitle + '</title><img class="lozad" data-toggle-class="loaded" data-src="' + videoImg + '" width="480" height="360" /></item>');
			})

			write('</section>')
		});
	});

	write('</category>');
}

//OG - HEADER
function generateHeader() {
	write('<!DOCTYPE html> <html id="html"> <head> <title>☛ ☈☉☊☌☡ ☚</title> <link rel="shortcut icon" href="favicon.ico" /> <link type="text/css" rel="stylesheet" href="themes/default.css" /> <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/lozad/dist/lozad.min.js"></script> </head> <body id="body">');
}

//OG - SIDEBAR
function generateSidebar() {
	write('<nav> <div class="back"></div> <a href="index.html" class="icon logo"> <span>⍾</span> </a> <div class="links"> <a href="#latest"><span>Latest</span></a> <a href="#subscriptions"><span>Subs</span></a> </div> <div class="links"> <p class="icon" id="input-toggle"> <span> <i class="search">☌</i> <input id="search-input" type="text" placeholder="Filter.." /> </span> </p> </div> </nav>')
}

//OG - FOOTER
function generateFooter() {
	write('</div><!-- IFRAME --> <iframe id="iframe-popup"src=""frameborder="0"allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"allowfullscreen> </iframe> <a href="#" id="iframe-minimize">-</a><a href="#" id="iframe-close">✕</a> </body> <script src="themes/logic.js"></script> </html>');
}