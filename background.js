let color = '#3aa757';
let tabCount = 0;
let lastActivatedTimes = {};
const MAX_TAB_COUNT = 6;
const TAB_EXPIRATION_TIME_MINS = 1
const MS_PER_MINUTE = 60 * 1000;

// on launch count tabs --- seems glitchy? idk
// on launch set the currently open tabs to 0 on last activated
chrome.tabs.query({currentWindow: true}, (tabs) => { 
  tabs.forEach((tab) => {
    tabCount++;
    lastActivatedTimes[tab.id] = 0;
  });
});

function onTabOpenedHandler(tab) {
  tabCount++;
  console.log(tabCount)
  if (tabCount > MAX_TAB_COUNT) {
    // for now just auto delete.  In future add options to confirm (probably a modal?) to delete
    closeTabs();
  }
}

function onTabActivatedHandler(activeTabInfo) {
  lastActivatedTimes[activeTabInfo.tabId] = new Date();
  console.log('switched tabs')
}

function closeTabs() {
  chrome.tabs.query({currentWindow: true}, (tabs) => {
    const now = new Date();
    // maybe using for/while loop is cleaner?
    tabs.every((tab) => {
      if (tabCount < 6) { return false }
      if (lastActivatedTimes[tab.id] && timeDiffSinceLastActivationInMins(lastActivatedTimes[tab.id], now) > TAB_EXPIRATION_TIME_MINS ) {
        chrome.tabs.remove(tab.id) // might need emmpty func
        console.log(tab.id)
        tabCount--;
      }
      return true
    });
  });

}


function timeDiffSinceLastActivationInMins(lastActivated, now) {
  // utc to avoid dst issues
  const utc1 = Date.UTC(
    lastActivated.getUTCFullYear(), lastActivated.getUTCMonth(),
    lastActivated.getUTCDate(), lastActivated.getUTCHours(),
    lastActivated.getUTCMinutes()
  );
  const utc2 = Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(),
    now.getUTCDate(), now.getUTCHours(),
    now.getUTCMinutes()
  );

  return Math.floor((utc2 - utc1) / MS_PER_MINUTE);


}

chrome.tabs.onActivated.addListener(onTabActivatedHandler)
chrome.tabs.onCreated.addListener(onTabOpenedHandler)