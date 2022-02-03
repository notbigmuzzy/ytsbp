//SETUP GLOBAL VARS
const 	fs = require('fs'),
		http = require('http'),
		https = require('https'),
		indexFile = './index.html',
		tempDirectory = './tmp',
		subsFile = './subscriptions.csv';
const { XMLParser, XMLBuilder, XMLValidator} = require("./node_modules/fast-xml-parser/src/fxp");
const xmlParserOptions = {
	removeNSPrefix: true,
	ignoreAttributes: false
};
const parser = new XMLParser(xmlParserOptions);

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
						if (files.length % 20 == 0) {
							console.log( 'Downloading files - ' + (files.length / (everyEntryInCSV.length-1)).toFixed(4)*100 + '%' )			
						}

						if(files.length == everyEntryInCSV.length -1) {
							console.log('Downloading files done! Generating INDEX.html')
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
	generateLatest();
	generateFooter();
}

//OG - CHANNEL VIEW
function generateLatest() {
	fs.readdir(tempDirectory, (err, filesLatest) => {
		var noOfFilesLatest = 1,
			todayClass = 'first-today',
			yesterdayClass = 'first-yesterday',
			beforeClass = 'first-before';

		filesLatest.forEach(function(file, index)  {
			if (index == 0) {
				write('<div class="category" id="latest"><p class="section-title"><span></span></p><section class="whole-section" id="latestSection" data-section="latestSection">')
			}

			const 	thisFile = fs.readFileSync(tempDirectory + '/' + file,{encoding:'utf8', flag:'r'}),
					objectified = parser.parse(thisFile),
					entries = objectified.feed.entry,
					channelColor = Math.floor(Math.random()*16777215).toString(16);

				channelTitle = objectified.feed.title;
				channelURL = objectified.feed.author.uri;
				authorName = objectified.feed.author.name;

				entries.forEach(function (value, index) {
					if (index == 0) {
						const 	entryInfo = value,
								videoID = entryInfo.id.slice(9),
								videoTitle = entryInfo.title,
								videoImg = entryInfo.group.thumbnail["@_url"],
								videoDescription = entryInfo.group.description,
								itemOrdering = entryInfo.published.substring(0,10).replace(/\-/g, ''),
								itemYear = itemOrdering.substring(0,4),
								itemMonth = itemOrdering.substring(4,6),
								itemDay = itemOrdering.substring(6,8),
								today = new Date(),
								todayYear = today.getFullYear(),
								todayMonth = '0' + (today.getMonth()+1),
								todayDay = '0' + today.getDate();
								
						var itemDateClass = '';
						if (itemYear == todayYear) {
							if (itemMonth == todayMonth) {
								if (itemDay == todayDay) {
									itemDateClass = 'today ' + todayClass;
									todayClass = '';
								} else if (itemDay == todayDay - 1) {
									itemDateClass = 'yesterday ' + yesterdayClass;
									yesterdayClass = '';
								} else {
									itemDateClass = 'before ' + beforeClass;
									beforeClass = '';
								}
							} else {
								itemDateClass = 'before prev-month';
							}
						} else {
							itemDateClass = 'before prev-year';
						}

						write('<item class="' + itemDateClass + '" style="order:-' + itemOrdering + '"><a class="iframe-source" href="https://www.youtube.com/embed/' + videoID + '?rel=0"></a><title>' + videoTitle + '</title><img class="lozad" data-toggle-class="loaded" data-src="' + videoImg + '" width="480" height="360" /><p>"' + videoDescription + '"</p></item>');
					}
				})

			if (noOfFilesLatest == filesLatest.length) {
				write('</section></div>');
				generatePinned();
			}
			noOfFilesLatest++;
		});	
	});
}

//OG - CHANNEL VIEW
function generateChannelView() {
	fs.readdir(tempDirectory, (err, files) => {
		var noOfFiles = 1;
		files.forEach(function(file, index)  {
			if (index == 0) {
				write('<div class="category" id="subscriptions"><p class="section-title"><span>All Subscriptions</span></p>')
			}

			const 	thisFile = fs.readFileSync(tempDirectory + '/' + file,{encoding:'utf8', flag:'r'}),
					objectified = parser.parse(thisFile),
					entries = objectified.feed.entry,
					channelColor = Math.floor(Math.random()*16777215).toString(16);

				channelTitle = objectified.feed.title;
				channelURL = objectified.feed.author.uri;
				authorName = objectified.feed.author.name;

				var noOfEntries = 1;
				entries.forEach(function (value, index) {
					if (index == 0) {
						write('<section class="whole-section" id="' + channelTitle + '" data-section="' + channelTitle + '"><div class="section-title" style="background-color:#' + channelColor + ';"><a class="pin-section section-title-link" href="#pinned"><h3>' + authorName + '</h3></a></div>')
					}

					const 	entryInfo = value,
							videoID = entryInfo.id.slice(9),
							videoTitle = entryInfo.title,
							videoImg = entryInfo.group.thumbnail["@_url"];

					write('<item><a class="iframe-source" href="https://www.youtube.com/embed/' + videoID + '?rel=0"></a><title>' + videoTitle + '</title><img class="lozad" data-toggle-class="loaded" data-src="' + videoImg + '" width="480" height="360" /></item>');

					if (noOfEntries == entries.length) {
						write('</section>')
					}
					noOfEntries++;
				})

			if (noOfFiles == files.length) {
				write('</div>');
				console.log('FINISHED!')
			}
			noOfFiles++;
		});	
	});
}

//OG - HEADER
function generateHeader() {
	write('<!DOCTYPE html> <html id="html"> <head> <title>☛ ☈☉☊☌☡ ☚</title> <link rel="shortcut icon" href="favicon.ico" /> <link type="text/css" rel="stylesheet" href="themes/default.css" /> <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/lozad/dist/lozad.min.js"></script> </head> <body id="body">');
}

//OG - SIDEBAR
function generateSidebar() {
	write('<nav> <div class="back"></div> <a href="index.html" class="icon logo"> <span>⍾</span> </a> <div class="links"> <a href="#latest"><span>Latest</span></a> <a class="sidebar-pinned" href="#pinned"><span>Pinned</span></a> <a href="#subscriptions"><span>All</span></a> </div> <div class="links"> <p class="icon" id="input-toggle"> <span> <i class="search">☌</i> <input id="search-input" type="text" placeholder="Filter.." /> </span> </p> </div> </nav>')
}

//OG - PINNED
function generatePinned() {
	write('<div class="category" id="pinned"><p class="section-title"><span>Pinned</span></p></div>')
	generateChannelView();
}

//OG - FOOTER
function generateFooter() {
	write('</div><!-- IFRAME --> <iframe id="iframe-popup"src=""frameborder="0"allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"allowfullscreen> </iframe> <a href="#" id="iframe-minimize">-</a><a href="#" id="iframe-close">✕</a> </body> <script src="themes/logic.js"></script> </html>');
}