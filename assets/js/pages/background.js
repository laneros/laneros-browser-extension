/**
 * function set_create_notification
 *
 * Create a Chrome Notification
 *
 * @param objRNotificationID
 * @param objROptions
 * @param objRListener
 * @param bolRIsNew
 */
function set_create_notification(objRNotificationID, objROptions, objRListener, bolRIsNew) {
    if (bolRIsNew) {
        chrome.notifications.clear(objRNotificationID, function(bolRWasCleared) {
            return bolRWasCleared;
        });
    }

    chrome.notifications.create(objRNotificationID, objROptions,
        function(objRNotificationID) {
            return objRNotificationID;
    });
    chrome.notifications.onButtonClicked.addListener(objRListener);
}
/**
 * function set_create_alarm
 *
 * Create a Chrome Alarm
 *
 * @param objRAlarmID
 * @param objROptions
 * @param objRListener
 */
function set_create_alarm(objRAlarmID, objROptions, objRListener) {
    chrome.alarms.get(objRAlarmID, function (objRAlarm) {
        if (typeof objRAlarm == 'undefined') {
            console.log(Date.now() + ' - Create Alarm ...');

            chrome.alarms.create(objRAlarmID, objROptions);
            chrome.alarms.onAlarm.addListener(function(theAlarm) {
                if (theAlarm.name == objRAlarmID) {
                    objRListener();
                }
            });
        }
    });
}
/**
 * function set_background
 *
 * Create Alarm to fire Base Function
 */
function set_background() {
    console.log(Date.now() + ' - Background Started up ...');

    get_storage({ dtRTimeRev : objRGlobalOptions.dtRTimeRev }, function(objROptions) {
        set_parser();
        var dtLTimeRev = objROptions.dtRTimeRev / 1000 / 60;

        set_create_alarm('LanerosAlarm', {
            when : Date.now() + 1,
            periodInMinutes : dtLTimeRev
        }, set_parser);
    });
}
/**
 * function set_create_notification
 *
 * Show Notification Popup
 *
 * @param inRConversations
 * @param inRAlerts
 * @param inRSubscriptions
 */
function set_notification(inRConversations, inRAlerts, inRSubscriptions) {
    var objLItems = new Array();
    var objLConversation = {
        title: get_message('labelMessages'),
        message: get_message('zeroInbox')
    };
    var objLAlert = {
        title: get_message('labelAlerts'),
        message: get_message('zeroAlerts')
    };
    var objLSubscription = {
        title: get_message('labelSubscriptions'),
        message: get_message('zeroSubs')
    };

    console.log(Date.now() + ' - Show Notification ...');

    if (inRConversations > 0) {
        objLConversation.message = inRConversations + ' ' + get_message('labelNew');
    }
    if (inRAlerts > 0) {
        objLAlert.message = inRAlerts + ' ' + get_message('labelNew');
    }
    if (inRSubscriptions > 0) {
        objLSubscription.message = inRSubscriptions + ' ' + get_message('labelNew');
    }

    objLItems.push(objLConversation);
    objLItems.push(objLAlert);
    objLItems.push(objLSubscription);

    set_create_notification('LanerosNotification', {
        type: 'list',
        title: get_message('extName'),
        message: get_message('extDesc'),
        iconUrl: '../assets/img/icon.png',
        items: objLItems,
        buttons: [{
                title: get_message('goTo')
            }, {
                title: get_message('goToAccount'),
        }]
    }, function(objRNotificationId, inRButtonIndex) {
        switch (inRButtonIndex) {
            case 0:
                chrome.tabs.create({url: stRURL}, function(objRTab) {});
                break;
            default:
                chrome.tabs.create({url: stRURL + 'account'}, function(objRTab) {});
                break;
        }
    }, true);
}
/**
 * Run on Startup
 */
get_storage({ isRunning : false }, set_background);