/* 
 * At initialization :
 * If first initialization, store the color object which includes both the byDefault color and the current color
 * If not the first initialization : set the currentColor to the byDefault color
 * Add the badge corresponding to the byDefault color at the popup icon
*/
chrome.storage.local.get(["defaultColor", "currentColor"],function(results) {
		if(chrome.runtime.lastError) {
			console.log(chrome.runtime.lastError);
		} 			
		else {
			if (typeof results["defaultColor"] === "undefined" && typeof results["currentColor"] === "undefined") {
				chrome.storage.local.set({"defaultColor": "rgb(255, 255, 0)", "currentColor": "rgb(255, 255, 0)"}, function() {
					if(chrome.runtime.lastError) {
						console.log(chrome.runtime.lastError);
					}
				});
			(chrome.action || chrome.browserAction).setBadgeText({text: " "});
			(chrome.action || chrome.browserAction).setBadgeBackgroundColor({color: "rgb(255, 255, 0)"});
			}
			else {
				chrome.storage.local.set({"currentColor": results["defaultColor"]}, function() {
					if(chrome.runtime.lastError) {
						console.log(chrome.runtime.lastError);
					}
				});
			(chrome.action || chrome.browserAction).setBadgeText({text: " "});
			(chrome.action || chrome.browserAction).setBadgeBackgroundColor({color: results["defaultColor"]});
			}

		}
});


/*
 * Define a listener function to answer the content script whether the current tab is a private one
 */

function onMessage(request, sender, sendResponse) {
	// If message is sent to know whether the current window is incognito
	if (request.askPrivate === true) {
		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
			sendResponse({isPrivate: tabs[0].incognito});
		});	
	return true; // return true to keep the message channel open until sendResponse is sent.
	}
}

function onNewWindow(window) {
	chrome.storage.local.get(["currentColor"],function(results) {
		if(chrome.runtime.lastError) {
			console.log(chrome.runtime.lastError);
		} 			
		else {
			(chrome.action || chrome.browserAction).setBadgeBackgroundColor({color: results["currentColor"]});
		}
	});
}

chrome.runtime.onMessage.addListener(onMessage);
chrome.windows.onCreated.addListener(onNewWindow);
