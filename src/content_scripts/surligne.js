/*
 * Define function to get stored data.
 * If a urlKey in stored data correspond to the current url then diplay the highlights
*/
function initializeStorage(url) {
	chrome.storage.local.get(url,function(results) {
		if(chrome.runtime.lastError) {
			console.log(chrome.runtime.lastError);
		} 			
		else
		{
			var urlKey = Object.keys(results);
			if (urlKey[0] === url) {
				hltr.deserializeHighlights(results[urlKey[0]]);
			}
		}
	});
}

/*
 * Define a fonction to store the highlight corresponding to the current url
*/
function storeData(url, serializedData) {
	chrome.storage.local.set({ [url] : serializedData }, function() {
		if(chrome.runtime.lastError) {
			console.log(chrome.runtime.lastError);
		}
	});

}

/* 
 * Define function to check whether an object is empty
*/
function isEmpty(object){
   for(var i in object){ return false;}
  return true;
}


/*
 * Initialize the textHighlighter on the page
*/
var hltr = new TextHighlighter(document.body, {
		onAfterHighlight:  function (range, hlts) { 
			for (var i = 0; i < hlts.length; i++) { // for each highlight in highlights array check the highlight color
				if (hlts[i].style.backgroundColor === "") { // if highlight color is empty, remove the corresponding highlight (see eventListener for key r)
					hltr.removeHighlights(hlts[i]);
					var remainingHighlights = hltr.getHighlights();
					if (isEmpty(remainingHighlights)) { // Clear the storage if no remaining highlights on the page
						chrome.storage.local.remove(window.location.href, function() {
							if(chrome.runtime.lastError) {
								console.log(chrome.runtime.lastError);
							}
						});
					}					
				}
			}
			/* 
			 * Storage : ask the background script whether the current tab is a private one and do not store data if it is.
			*/
			chrome.runtime.sendMessage({askPrivate: true}, function(message) {
				if (message.isPrivate === false) {
					var serializedData = hltr.serializeHighlights();
					var url = window.location.href;
					storeData(url, serializedData);
				}
			});
		}
	});
/*
 * Deserialize and display existing HighlightInfos corresponding to the current url
*/
initializeStorage(window.location.href);

/* 
 * At loading : get the current color and set it in the hltr object
*/
chrome.storage.local.get("currentColor", function(results){
		if(chrome.runtime.lastError) {
			console.log(chrome.runtime.lastError);
		} 			
		else {
			if (typeof results["currentColor"] !== 'undefined' && results["currentColor"] !== hltr.getColor()) {
				hltr.setColor(results["currentColor"]);
			}
		}
});


/*
 * Add eventListener to highlight when key h is pressed
 */
document.addEventListener("keyup", function(e) {
	if (e.keyCode === 72 && document.getSelection().toString() !== "") {
		hltr.doHighlight();
	}
});

/*
 * Add eventListener to remove highlight when key r is pressed
 * When pressed, check whether there is a text selected, save the previous color, set the new color to empty, do the highlight in empty color and come back to the original color
 */
document.addEventListener("keyup", function(e) {
	if (e.keyCode === 82 && document.getSelection() !== "") {
		var originalColor = hltr.getColor();
		hltr.setColor("");
		var range = document.getSelection().getRangeAt(0);
		hltr.doHighlight();
		hltr.setColor(originalColor);
	}
});

/* 
 * removeColor():
 * listen the messages coming from the popup and remove all highlights if asked
*/
function removeColor(request, sender, sendResponse) {
		if (typeof request.remove != "undefined") {
			hltr.removeHighlights();
			var url = window.location.href;
			chrome.storage.local.remove(url, function() {
				if(chrome.runtime.lastError) {
					console.log(chrome.runtime.lastError);
				}
			});
		}
		else if (request.highlight === true) {
			hltr.doHighlight();
		}
		else if (request.removeSelection === true) {
			var originalColor = hltr.getColor();
			hltr.setColor("");
			hltr.doHighlight();
			hltr.setColor(originalColor);
		}
		return;
	}

/*
 * @changeCurrentColor(changes, area)
 * on onChanged event on colors object, changes the highlighting color in the hltr object
*/
function changeCurrentColor(changes, area) {
	if (typeof changes["currentColor"] != "undefined" && area === "local") {
		hltr.setColor(changes["currentColor"].newValue); 
	}
	return
}



/* 
 * Assign listeners
*/
chrome.runtime.onMessage.addListener(removeColor);
chrome.storage.onChanged.addListener(changeCurrentColor);

