//SETUP GLOBAL VARS
const 	fs = require('fs'),
		http = require('http'),
		https = require('https'),
		path = './index.html',
		subsFile = 'subscriptions.csv',
		urlString = 'https://www.youtube.com/feeds/videos.xml?channel_id=',
		subscriptionsFile = fs.readFileSync('./subscriptions.csv',{encoding:'utf8', flag:'r'}),
		everyLine = subscriptionsFile.split(/\r?\n/),
		everyEntry = String(everyLine).split(',');

const { XMLParser, XMLBuilder, XMLValidator} = require("./node_modules/fast-xml-parser/src/fxp");
const xmlParserOptions = {
	removeNSPrefix: true,
	ignoreAttributes: false
};
const parser = new XMLParser(xmlParserOptions);


//APPEND TO FILE FUNCTION
function write(text) {
	var stream = fs.createWriteStream(path, {flags:'a'})
	stream.write(text);
	stream.end();
}

//DELETE OLD FILE - THIS IS NOT SYNC BECAUSE I NEED ERR CATCH IF NO INDEX.HTML FILE
fs.unlink(path, (err) => {
	if (err) {
		console.log('No index.html file. Creating new one ;)')
		return
	}
})

//START NEW INDEX.HTML FILE
write('<!DOCTYPE html> <html id="html"> <head> <title>☛ ☈☉☊☌☡ ☚</title> <link rel="shortcut icon" href="favicon.ico" /> <link type="text/css" rel="stylesheet" href="themes/default.css" /> <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/lozad/dist/lozad.min.js"></script> </head> <body id="body">');
write('<div class="category"><p class="section-title" id="Subscriptions"><span>Subscriptions</span></p>')

//GENERATE SUBS
var numberOfChannels = 1;
everyLine.forEach(function (value, index) {
	var urlID = value.split(',', 1)[0],
		urlReq = urlString + urlID;

	if (index < 1) {
		return;
	}

	if (urlID) {
		https.get(urlReq, (response) => {
			let data = '';
			response.on('data', (chunk) => { data += chunk; });

			response.on('end', () => {
				//ASIGN GLOBAL VARS VALUE FOR EACH CHANNEL
				const 	objectified = parser.parse(data),
						entries = objectified.feed.entry;

				channelTitle = objectified.feed.title;
				channelURL = objectified.feed.author.uri;
				authorName = objectified.feed.author.name;
               
				write('<section><title>' + authorName + '</title>')

				var numberOfVideos = 0;
				entries.forEach(function (value, index) {
					numberOfVideos++;
					const 	entryInfo = value,
							videoID = entryInfo.id.slice(9),
							videoTitle = entryInfo.title,
							videoImg = entryInfo.group.thumbnail["@_url"],
							videoDescription = entryInfo.group.description

					write('<item><a class="iframe-source" href="https://www.youtube.com/embed/' + videoID + '?rel=0"></a><title>' + videoTitle + '</title><img src="' + videoImg + '" width="480" height="360" /></item>');
					
					if(numberOfVideos == entries.length) {
						write('</section>')
					}
				})


				numberOfChannels++;
				if(numberOfChannels == everyLine.length) {
					endLine();
				}

				function endLine() {
					write('</section>');
				}

			});
		})
	}

})



function endFile() {
	//FINISH INDEX.HTML FILE
	write('</div><!-- IFRAME --> <iframe id="iframe-popup"src=""frameborder="0"allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"allowfullscreen> </iframe> <a href="#" id="iframe-minimize">-</a><a href="#" id="iframe-close">✕</a> </body> <script src="themes/logic.js"></script> </html>');
}
