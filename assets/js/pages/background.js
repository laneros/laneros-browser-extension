/**
 * function set_create_notification
 *
 * Create a Chrome Notification
 *
 * @param stRNotificationID
 * @param objROptions
 * @param objRListener
 * @param bolRIsNew
 */
function set_create_notification(stRNotificationID, objROptions, objRListener, bolRIsNew) {
    if (bolRIsNew) {
        var dtLDate = new Date();

        console.log(dtLDate.toLocaleString() + ' - Clear notification ...');

        chrome.notifications.clear(stRNotificationID, function(bolRWasCleared) {
            return bolRWasCleared;
        });
    }

    chrome.notifications.create(stRNotificationID, objROptions,
        function(objRNotificationID) {
            var dtLDate = new Date();

            console.log(dtLDate.toLocaleString() + ' - Create notification ...');

            return objRNotificationID;
    });

    chrome.notifications.onButtonClicked.addListener(objRListener);
}
/**
 * function set_create_alarm
 *
 * Create a Chrome Alarm
 *
 * @param stRAlarmID
 * @param objROptions
 * @param stRListener
 */
function set_create_alarm(stRAlarmID, objROptions, stRListener) {
    chrome.alarms.clear(stRAlarmID);
    chrome.alarms.onAlarm.addListener(function(objRAlarm) {
        if (objRAlarm.name == stRAlarmID) {
            stRListener();
        }
    });
    chrome.alarms.get(stRAlarmID, function(objRAlarm) {
        if (typeof objRAlarm == 'undefined') {
            var dtLDate = new Date();

            console.log(dtLDate.toLocaleString() + ' - Create alarm ...');

            chrome.alarms.create(stRAlarmID, objROptions);
        }
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
    var dtLDate = new Date();
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

    console.log(dtLDate.toLocaleString() + ' - Show notification ...');

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
    }, function(stRNotificationID, inRButtonIndex) {
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
 * function set_background
 *
 * Create Alarm to fire Base Function
 */
function set_background() {
    var dtLDate = new Date();

    console.log(dtLDate.toLocaleString() + ' - Background started up ...');

    get_storage({ dtRTimeRev : objRGlobalOptions.dtRTimeRev }, function(objROptions) {
        var dtLTimeRev = objROptions.dtRTimeRev / 1000 / 60;

        set_parser();
        set_create_alarm('LanerosAlarm', {
            delayInMinutes: 1,
            periodInMinutes: dtLTimeRev
        }, set_parser);
    });
}
/**
 * Run on Startup
 */
get_storage({ isRunning : false }, function() {
    chrome.runtime.onInstalled.addListener(set_background);
    set_background();
});