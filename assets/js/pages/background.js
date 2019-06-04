/**
 * function createNotification
 *
 * Create a Chrome Notification
 *
 * @param theNotificationID
 * @param theOptions
 * @param theListener
 */
function createNotification(theNotificationID, theOptions, theListener, isClear) {
    if (isClear) {
        chrome.notifications.clear(theNotificationID, function(wasCleared) {
            return wasCleared;
        });
    }

    chrome.notifications.create(theNotificationID, theOptions,
        function(notificationID) {
            return notificationID;
    });
    chrome.notifications.onButtonClicked.addListener(theListener);
}
/**
 * function createAlarm
 *
 * Create a Chrome Alarm
 *
 * @param theAlarmID
 * @param theOptions
 * @param theListener
 */
function createAlarm(theAlarmID, theOptions, theListener) {
    chrome.alarms.clear(theAlarmID);
    chrome.alarms.create(theAlarmID, theOptions);
    chrome.alarms.onAlarm.addListener(function(theAlarm) {
        if (theAlarm.name == theAlarmID) {
            theListener();
        }
    });
}
/**
 * function runLANerosBg
 *
 * Create Alarm to fire Base Function
 */
function runLANerosBg() {
    console.log(Date.now() + " - Background Started up ...");
    getStorageValue({ TimeRev : theGlobalOptions.TimeRev }, function(theOptions) {
        console.log(Date.now() + " - Create Alarm ...");
        parseLANeros();
        TimeRev = theOptions.TimeRev / 1000 / 60;

        createAlarm("LanerosAlarm", {
            when : Date.now() + 1,
            periodInMinutes : TimeRev
        }, parseLANeros);
    });
}
/**
 * function showNotification
 *
 * Show Notification Popup
 *
 * @param numConversations
 * @param numAlerts
 * @param numSubscriptions
 */
function showNotification(numConversations, numAlerts, numSubscriptions) {
    var theCounter = numConversations + numAlerts + numSubscriptions;

    console.log(Date.now() + " - Show Notification ...");
    getBadge(function(theBadgeCounter) {
        if (theCounter > theBadgeCounter) {
            var theItems = new Array();
            var conversationItem = {
                title: getMessage("labelMessages"),
                message: getMessage("zeroInbox")
            };
            var alertItem = {
                title: getMessage("labelAlerts"),
                message: getMessage("zeroAlerts")
            };
            var subscriptionItem = {
                title: getMessage("labelSubscriptions"),
                message: getMessage("zeroSubs")
            };

            if (numConversations > 0) {
                conversationItem.message = numConversations + " " + getMessage("labelNew");
            }
            if (numAlerts > 0) {
                alertItem.message = numAlerts + " " + getMessage("labelNew");
            }
            if (numSubscriptions > 0) {
                subscriptionItem.message = numSubscriptions + " " + getMessage("labelNew");
            }

            theItems.push(conversationItem);
            theItems.push(alertItem);
            theItems.push(subscriptionItem);

            createNotification("LanerosNotification", {
                type: "list",
                title: getMessage("extName"),
                message: getMessage("extDesc"),
                iconUrl: "../assets/img/laneros.png",
                items: theItems,
                buttons: [{
                        title: getMessage("goTo")
                    }, {
                        title: getMessage("goToAccount"),
                }]
            }, function(notificationId, buttonIndex) {
                switch (buttonIndex) {
                    case 0:
                        chrome.tabs.create({url: "http://www.laneros.com"}, function(theTab) {});
                        break;
                    default:
                        chrome.tabs.create({url: theURL + "account"}, function(theTab) {});
                        break;
                }
            }, true);
        }
    });
}
/**
 * Run on Startup
 */
getStorageValue({ isRunning : false }, runLANerosBg);