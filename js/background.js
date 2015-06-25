// ecma 6 future
if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.findIndex called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return i;
      }
    }
    return -1;
  };
}

// json encode/decode
function uaToJSON(ary)
{
  return JSON.stringify(
    ary.map(function(e) {
      return JSON.stringify(e);
    })
  );
}
function uaFromJSON(str)
{
  return JSON.parse(str).map(function(e) {
    return JSON.parse(e);
  });
}

// settings
var tab_settings = {};
localStorage.removeItem("faker");

// set default user-agent
if (!localStorage.hasOwnProperty("faker")) {
  localStorage["faker"] = uaToJSON([
    {
      name: "Default",
      short_name: "",
      ua: ""
    },
    {
      name: "Android 4.4",
      short_name: "and4",
      ua: "Mozilla/5.0 (Linux; Android 4.4.4; SO-02G Build/23.0.B.1.13) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/34.0.0.0 Mobile Safari/537.36"
    },
    {
      name: "iPhone 6",
      short_name: "iph6",
      ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 8_0_2 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12A405 Safari/600.1.4"
    }
  ]);
}

// send-header hook
chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
  var headers = details.requestHeaders;
  var tabId   = details.tabId;

  // tab settings
  console.log(tabId);
  console.log(tab_settings);
  if (!tab_settings.hasOwnProperty(tabId)) {
    return {};
  }
  var settings = tab_settings[tabId];

  // change user-agent
  var index = headers.findIndex(function(header) {
    return header.name == 'User-Agent';
  });
  if (index >= 0) {
    headers[index].value = settings.ua;
  }

  return { requestHeaders: headers };
}, { urls: ["<all_urls>"] }, ['requestHeaders', 'blocking']);

// tab change hook
chrome.tabs.onUpdated.addListener(function(tabId){
  if (tab_settings.hasOwnProperty(tabId)) {
    var ua = tab_settings[tabId];
    chrome.browserAction.setBadgeText({ text: ua.short_name, tabId: tabId});
  }
});
chrome.tabs.onRemoved.addListener(function(tabId){
  if (tab_settings.hasOwnProperty(tabId)) {
    var ua = tab_settings[tabId];
    chrome.browserAction.setBadgeText({ text: "", tabId: tabId});
    delete tab_settings[tabId];
  }
});

// api (for popup page)
function getUserAgents() {
  return uaFromJSON(localStorage["faker"]);
}
function getTabInfo() {
  return tab_settings;
}
function setUserAgent(tabId, ua) {
  if (ua.name === "Default") {
    if (tab_settings.hasOwnProperty(tabId)) {
      delete tab_settings[tabId];
    }
  }
  else {
    tab_settings[tabId] = ua;
  }
}
