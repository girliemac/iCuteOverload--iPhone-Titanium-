// default
var listIndex = 0;
var list = [];

if (Titanium.App.Properties.getInt('index') != null) {
	listIndex = Titanium.App.Properties.getInt('index');
}
if (Titanium.App.Properties.getList('list') != null) {
	list = Titanium.App.Properties.getList('list');
}


function initContent (barColor,html,isFave){
	
// *** Set up UI
	
	var win = Titanium.UI.currentWindow;
	//win.setBarColor(barColor);
	
	// Set System Bar button at Right
	if (listIndex < list.length - 1) {
		var nextBtn = Titanium.UI.createButton({
			systemButton: Titanium.UI.iPhone.SystemButton.PLAY
		});
		win.setRightNavButton(nextBtn);
		nextBtn.addEventListener('click', function(e){
			geNextContent(html,barColor,isFave);
		});
	}
	
	// Set Button Bar
	setButtonBar(barColor,isFave);
	
	// Set Button Bar again when we lose focus
	Titanium.UI.currentWindow.addEventListener('unfocused',function() { 
		Titanium.UI.currentWindow.setTitleControl(null); 
		setButtonBar(barColor,isFave);
	})
	
// *** Display Main Contents
	displayContent();
}

function setButtonBar(barColor, isFave){
	var inst;
	// Syetem Bar buttons - Center
	if (isFave) {
		inst = Titanium.UI.createButtonBar({
			labels:['Share', 'Delete'], backgroundColor:barColor
		});
		inst.addEventListener('click', function(e){
			if(e.index==0){
				emailUrl();
			}else{
				deleteFavorites();
			}
		});
	}else{
		inst = Titanium.UI.createButtonBar({
			labels:['Share', 'Save'], backgroundColor:barColor
		});
		inst.addEventListener('click', function(e){
			if(e.index==0){
				emailUrl();
			}else{
				addToFavorites();
			}
		});
	}
	Titanium.UI.currentWindow.setTitleControl(inst);
}

function displayContent(){
	// Remove hard-coded width and height attr 
	var div = document.createElement('div');
	div.innerHTML = list[listIndex].content;

	var imgs = div.getElementsByTagName("img");
	for (var i = 0; i < imgs.length; i++) {
		imgs[i].removeAttribute("width");
		imgs[i].removeAttribute("height");
		
		//if (/img\.youtube\.com/.test(imgs[i].src)) {
		//	imgs[i].width = '200';
		//}
	}
	
	document.getElementById('title').innerHTML = list[listIndex].title;
	document.getElementById('date').innerHTML = list[listIndex].date;
	document.getElementById('content').appendChild(div);
	//Titanium.API.log('>>>>>>>>>>>>>>>>>>>>>>>>>> Final html= ' + document.getElementById('content').innerHTML);
}

function geNextContent(html,barColor,isFave){
	var nextIndex = listIndex + 1;
	Titanium.App.Properties.setInt('index', nextIndex);
	
	// create a spinner
	var ind = Titanium.UI.createActivityIndicator();
	Titanium.UI.currentWindow.setTitleControl(ind);
	ind.show();
	
	// prepare the next window
	var win = Titanium.UI.createWindow({
				url: html
			});
	win.setBarColor(barColor);
	
	// preload next image
	var contentDiv = document.createElement('div');
	contentDiv.innerHTML = list[nextIndex].content;
	
	if (contentDiv.getElementsByTagName("img")[0]) {
		var imgTags = contentDiv.getElementsByTagName("img");
		var j=0;
		
		for(var i=0; i<imgTags.length; i++) {
			var img = new Image();
			img.src = imgTags[i].src;
			
			Titanium.API.log('>>>>>>>>>>>>>>>>>>>>>>>>>> next img.src= ' + img.src);
			
			img.onload = function(){
				j++;
				if(j == imgTags.length){
				ind.hide();
				win.open({
					animated: true
					});
				}
			};
		}
	}else{
		ind.hide();
		win.open({
				animated: true
			});
	}
	
	if (html == 'content.html') {
		Titanium.UI.currentWindow.setTitleImage('images/co_header_logo.png');
	}
	
}
function addToFavorites() {
	// Save to DB
	var db = Titanium.Database.open('cuteDB');
	db.execute('INSERT INTO myFavorites (title, date, content) VALUES (?,?,?)', list[listIndex].title, list[listIndex].date, list[listIndex].content);
	Titanium.API.log('>>>>>>>>>>>>>>>>>>>>>>>>>> One data added');
	
	var msg = Titanium.UI.createAlertDialog();
	msg.setTitle('Added to Favorites!');
	msg.setButtonNames(['OK']);
	//msg.setMessage('You have added this to Favorites!'); 
	msg.show();	
	
	db.close();
}

function deleteFavorites() {	
	Titanium.API.log('>>>>>>>>>>>>>>>>>>>>>>>>>> DB id to be deleted= '+ list[listIndex].id);

	// create a dialog
	var dialog = Titanium.UI.createOptionDialog();
	
	// set button titles
	dialog.setOptions(["Delete Favorite","Cancel"]);
	
	// set title
	dialog.setTitle('This action cannot be undone. Are you sure?');

	dialog.setDestructive(0); //red button
	dialog.setCancel(1);
	
	
	dialog.addEventListener('click',function(e){
		if (e.index == 0){ // Delete is pressed
			// Delete from DB
			var db = Titanium.Database.open('cuteDB');
			db.execute('DELETE FROM myFavorites WHERE id=?', list[listIndex].id);
			Titanium.API.log('>>>>>>>>>>>>>>>>>>>>>>>>>> One data deleted');
			db.close();

			Titanium.UI.currentWindow.close();
		}
	});
	
	dialog.show();
}

function emailUrl() {
	var subject = 'A Cute Found on CuteOverload!';
	var link = list[listIndex].url;
	var message = 'Check out this link that I found using iCuteOverload App for iPhone! '+link;
	
	var emailDialog = Titanium.UI.createEmailDialog();
	emailDialog.setSubject(subject);
	emailDialog.setMessageBody(message);
	emailDialog.open();
}


/*
function showOptions() {
	// create a dialog
	var dialog = Titanium.UI.createOptionDialog();
	
	// set button titles
	dialog.setOptions(["Add to My Favorites","Share via Email","Cancel"]);
	
	// set title
	//dialog.setTitle('Options:');

	// set index for cancel
	dialog.setCancel(2);
	
	//dialog.setDestructive(1); -- red button
	
	// add event listener
	dialog.addEventListener('click',function(e)
	{
		switch (e.index) {
			case 0:{
				addToFavorites();
				break;
			}
			case 1:{
				emailUrl();
				break;
			}
		}
	});
	
	// show dialog
	dialog.show();			
}
*/