var extension;
var tabId;

function init() {
  extension = chrome.extension.getBackgroundPage();

  buildMenuItems();
}

function buildMenuItems() {
  var agents = extension.getUserAgents();
  var tabInfo = extension.getTabInfo();
  var template = $("#menu .templateItem");
  var menu = $("#menu");

  for (var i = 0; i < agents.length; ++i) {
    var agent = agents[i];
    console.log(agent);

    var item = template.clone().attr({
      "id": agent.short_name,
      "class": "item"
    });
    $("span", item).text(agent.name);

    // tab id check
    if (tabId in tabInfo) {
      item.addClass("checked");
    }

    item.click(onSelectItem);
    item[0].agent = agent;

    menu.append(item);
  }
}

function onSelectItem() {
  var item = this;
  var ua = item.agent;

  extension.setUserAgent(tabId, ua);

  $("#menu .item").removeClass("checked");
  $(item).addClass("checked");

  closePopup();
  refreshTab();
}

function closePopup() {
  window.close();
}

function refreshTab() {
  chrome.tabs.executeScript(null, { code: "history.go(0);" });
}

$(document).ready(function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0].hasOwnProperty('id')) {
      tabId = tabs[0].id;
      init();
    }
  });
});
