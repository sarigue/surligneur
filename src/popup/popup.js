/*
 *  Function to get the id given a css colour
*/
function setColorToId(cssColor) {
  switch (cssColor) {
    case "rgb(192, 192, 192)" :
      return "rose";
    case "rgb(0, 255, 0)":
      return "vert";
    case "rgb(0, 204, 255)":
      return "bleu";
    case "rgb(255, 255, 0)":
	  return "jaune";
  }
}

/*
 * Set the classes "current" and "default" to the corresponding button according to the data stored
*/
chrome.storage.local.get(["currentColor", "defaultColor"], function(results) {
	var currentId = setColorToId(results["currentColor"]);
	var defaultId = setColorToId(results["defaultColor"]);
	
	document.getElementById(currentId).classList.add("current");
	document.getElementById(defaultId).classList.add("default");
});


/*
Listen for clicks in the popup.

If the click is not on a button, return early.

If the click is on a colour button, the background color is stored as new currentColor, the badge color is changed and the current class is applied to the corresponding button

If the click is on the clear all button, a bolean value set to true is sent  to the the surligne.js script
*/

document.addEventListener("click", function(e) {
  if (!e.target.classList.contains("bouton")) {
    return;
  }
	
	if (e.target.classList.contains("couleur")) {
		var element = e.target;
		var chosenColor = window.getComputedStyle(element).getPropertyValue("background-color");
		
		//Store the new currentColor
		chrome.storage.local.set({ "currentColor": chosenColor }, function() {
			if(chrome.runtime.lastError) {
				console.log(chrome.runtime.lastError);
			}
			else {
				// Set the badge color
				(chrome.action || chrome.browserAction).setBadgeBackgroundColor({color: chosenColor});
		
				//Set and remove the "current" class to the corresponding buttons
				var oldCurrent = document.getElementsByClassName("current");
				oldCurrent[0].classList.remove("current");
				element.classList.add("current");
			}	
		});	

	}
	else if (e.target.classList.contains("clear")) {
		var removeIt = true;
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {remove: removeIt});
		});
	
	}
  

});


/*
 * On dblclick event, if the dblclick is on the current color button, set this color as defaultColor in storage
 * Apply also the corresponding class
*/
document.addEventListener("dblclick", function(e) {
	if (!e.target.classList.contains("bouton") || !e.target.classList.contains("current")) {
		return;
	}
	var element = e.target;
	var newDefaultColor = window.getComputedStyle(element).getPropertyValue("background-color");
	chrome.storage.local.set({"defaultColor": newDefaultColor}, function() {
		if(chrome.runtime.lastError) {
			console.log(chrome.runtime.lastError);
		}	
	});
	var oldDefault = document.getElementsByClassName("default");
	oldDefault[0].classList.remove("default");
	element.classList.add("default");
});
