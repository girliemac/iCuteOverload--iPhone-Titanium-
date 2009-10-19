var list = [];
	
function init(feedUrl,html,barColor){
	var thisWin = Titanium.UI.currentWindow;	
	thisWin.setBarColor(barColor);
	
	// Add a Refresh button
	var refreshBtn = Titanium.UI.createButton({
		    systemButton:Titanium.UI.iPhone.SystemButton.REFRESH
		});
	thisWin.setRightNavButton(refreshBtn);		
	refreshBtn.addEventListener('click', function(e){
		fetchFeed(feedUrl,html);
	});
	
	fetchFeed(feedUrl,html);	
	
}
	
function fetchFeed(feedUrl,html){
	var xhr = Titanium.Network.createHTTPClient();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4) {
			var xml = this.responseXML;
			createList(xml,html);
			ind.hide();
		}
	};
	// open the client
	xhr.open('GET',feedUrl);
	
	// create an initial spinner
	var ind = Titanium.UI.createActivityIndicator({
		id:'spinner',
		style:Titanium.UI.iPhone.ActivityIndicatorStyle.DARK
	});
	
	ind.show();
	
	// send the data
	xhr.send();
}

function createList(xml,html) {
	var rssItems = xml.getElementsByTagName("item");
	for (i = 0; i < rssItems.length; i++) {
		list.push ({
			title: unescape(rssItems[i].getElementsByTagName("title").item(0).textContent),
			date: rssItems[i].getElementsByTagName("pubDate").item(0).textContent,
			content: rssItems[i].getElementsByTagNameNS("http://purl.org/rss/1.0/modules/content/","encoded").item(0).textContent,
			url: rssItems[i].getElementsByTagName("link").item(0).textContent,
			hasChild:true,
			image: 'images/duckie.png'
		});
	}
	
	// display the data
	displayList(html);
}

function displayList(html){
	// re-write the fetched feed content
	tweakContent();
	
	//Titanium.API.log('>>>>>>>>>>>>>>>>>>>>>>>>>> final content of the 1st feed= ' + list[0].content);
	
	// Tableview object and event
	var tableView = Titanium.UI.createTableView({data: list}, function(e){
	
		var idx = e.index;
		
		var prop = Titanium.App.Properties;
		prop.setList('list', list);
		prop.setInt('index', idx);
		
		//Titanium.API.log('>>>>>>>>>>>>>>>>>>>>>>>>>> Click Event on index= ' + idx);
	
		// create a spinner to be displayed on nav title
		var ind2 = Titanium.UI.createActivityIndicator({});
		Titanium.UI.currentWindow.setTitleControl(ind2);
		ind2.show();
		
		// prepare the next window
		var win = Titanium.UI.createWindow({url: html});
				
		// pre-define the barcolor to avoid showing a default color
		win.setBarColor(barColor);
		
		// when we lose focus, change the title back to an image 
		Titanium.UI.currentWindow.addEventListener('unfocused',function() { 
			Titanium.UI.currentWindow.setTitleControl(null); 
			if (html == 'content.html') {
				Titanium.UI.currentWindow.setTitleImage('images/co_header_logo.png');
			}
		})
		
	
		// preload the image to be displayed at new window
		var contentDiv = document.createElement('div');
		contentDiv.innerHTML = list[idx].content;
		
		if (contentDiv.getElementsByTagName("img")[0]) {
			var imgTags = contentDiv.getElementsByTagName("img");
			var j=0;
			
			for(var i=0; i<imgTags.length; i++) {
				var img = new Image();
    			img.src = imgTags[i].src;
				
				Titanium.API.log('>>>>>>>>>>>>>>>>>>>>>>>>>> opening img.src= ' + img.src);
				
				img.onload = function(){
					j++;
					if(j == imgTags.length){
					ind2.hide();
					win.open({
						animated: true
						});
					}
				};
			}
			
		}else{
			ind2.hide();
			win.open({
					animated: true
				});
		}
		
	});

	Titanium.UI.currentWindow.addView(tableView);
	Titanium.UI.currentWindow.showView(tableView);
}

function tweakContent(){

	for (var j = 0; j < list.length; j++) {
		
		str = list[j].content;
		// *** Remove links from images ***
		
		var linkedImage = /<a[^>]*>(<img [^>]* \/>)<\/a>/ig;
		if (str.match(linkedImage)) {
			str = str.replace(linkedImage, '$1');
		}
		
		// *** Remove Digg links etc. ***

		var junk = /Posted in (Uncategorized|Top 4) [\S\s]*/;
		if (str.match(junk)) {
			str = str.replace(junk, '');
		}
		
		// *** Find a video embed ***
		
		var youtubeThumb = /<img[\S\s]+?http:\/\/img\.youtube\.com\/vi\/([\w\-]+)\/2.jpg"[\S\s]+?\/>/i;
		var youtubeEmbed = /<object[\S\s]+?http:\/\/www\.youtube\.com\/v\/([\w\-]+)[\S\s]+?<\/object>/i;
		
		var youtubeButton = '<a href="http://www.youtube.com/watch?v=$1"><img src="images/watch_youtube.png" alt="watch!" class="$1" id="youtubeBtn" /></a>';
		
		if (str.match(youtubeThumb)) {
			str = str.replace(youtubeThumb, youtubeButton);
		}
		if (str.match(youtubeEmbed)) {
			str = str.replace(youtubeEmbed, youtubeButton);
		}
		
		// If there's non-Youtube video:
		var videoEmbed = /<object[\S\s]*<\/object>/i;
		var message = '<img src="images/not_supported.png" alt="Not supported" class="video" />';
		
		if (str.match(videoEmbed)) {
			console.log(videoEmbed);
			str = str.replace(videoEmbed, message);
		}
		
		// *** Image size hack on WordPress
		// [A-Za-z]{3,4} = jpg, png, jpeg etc.
		
		var imgQuery = /src="(http:\/\/cuteoverload.files.wordpress.com[\S\s]+?\.[A-Za-z]{3,4})\?[\S\s]+?"/ig;
		
		if(imgQuery.test(str)){
			var newImg = 'src="$1?w=300"';
			str = str.replace(imgQuery,newImg);
		}
		
		var imgSrc = /src="(http:\/\/cuteoverload.files.wordpress.com[\S\s]+?\.[A-Za-z]{3,4})"/ig;
		
		if(imgSrc.test(str)){
			var newImg2 = 'src="$1?w=300"';
			str = str.replace(imgSrc,newImg2);
		}
		
		list[j].content = str;
	}
}

