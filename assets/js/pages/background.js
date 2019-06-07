/**
 * Self-Executing Anonymous Function
 */
(function(laneros_extension) {
    /**
     * function set_background
     *
     * Create Alarm to fire Base Function
     */
    laneros_extension.set_background = function() {
        laneros_extension.get_storage({dtRTimeRev: laneros_extension.objRGlobalOptions.dtRTimeRev}, function (objROptions) {
            try {
                var dtLTimeRev = objROptions.dtRTimeRev / 1000 / 60;

                laneros_extension.set_parser();
                laneros_extension.set_create_alarm('laneros_alarm', {
                    delayInMinutes: 1,
                    periodInMinutes: dtLTimeRev
                }, laneros_extension.set_parser);
            }
            catch(objRException) {
                var dtLDate = new Date();

                console.log(dtLDate.toLocaleString() + ' - ' + laneros_extension.get_message('extension_short_name') + ': ' +  objRException.message);
            }
        });
    };
    /**
     * function set_create_alarm
     *
     * Create a Chrome Alarm
     *
     * @param stRAlarmID
     * @param objROptions
     * @param stRListener
     */
    laneros_extension.set_create_alarm = function(stRAlarmID, objROptions, stRListener) {
        try {
            chrome.alarms.clear(stRAlarmID);
            chrome.alarms.onAlarm.addListener(function(objRAlarm) {
                if (objRAlarm.name == stRAlarmID) {
                    stRListener();
                }
            });
            chrome.alarms.get(stRAlarmID, function(objRAlarm) {
                if (typeof objRAlarm == 'undefined') {
                    chrome.alarms.create(stRAlarmID, objROptions);
                }
            });
        }
        catch(objRException) {
            var dtLDate = new Date();

            console.log(dtLDate.toLocaleString() + ' - ' + laneros_extension.get_message('extension_short_name') + ': ' +  objRException.message);
        }
    };
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
    laneros_extension.set_create_notification = function(stRNotificationID, objROptions, objRListener, bolRIsNew) {
        if (bolRIsNew) {
            chrome.notifications.clear(stRNotificationID, function(bolRWasCleared) {
                return bolRWasCleared;
            });
        }

        chrome.notifications.create(stRNotificationID, objROptions,
            function(objRNotificationID) {
                return objRNotificationID;
            });

        chrome.notifications.onButtonClicked.addListener(objRListener);
    };
    /**
     * function set_create_notification
     *
     * Show Notification Popup
     *
     * @param inRConversations
     * @param inRAlerts
     * @param inRSubscriptions
     */
    laneros_extension.set_notification = function(inRConversations, inRAlerts, inRSubscriptions) {
        var objLItems = [];
        var objLConversation = {
            title: laneros_extension.get_message('text_messages'),
            message: laneros_extension.get_message('text_zero_inbox')
        };
        var objLAlert = {
            title: laneros_extension.get_message('text_label_alerts'),
            message: laneros_extension.get_message('text_zero_alerts')
        };
        var objLSubscription = {
            title: laneros_extension.get_message('text_label_subscriptions'),
            message: laneros_extension.get_message('text_zero_subscriptions')
        };

        if (inRConversations > 0) {
            objLConversation.message = inRConversations + ' ' + laneros_extension.get_message('text_new');
        }
        if (inRAlerts > 0) {
            objLAlert.message = inRAlerts + ' ' + laneros_extension.get_message('text_new');
        }
        if (inRSubscriptions > 0) {
            objLSubscription.message = inRSubscriptions + ' ' + laneros_extension.get_message('text_new');
        }

        objLItems.push(objLConversation);
        objLItems.push(objLAlert);
        objLItems.push(objLSubscription);

        laneros_extension.set_create_notification('laneros_notification', {
            type: 'list',
            title: laneros_extension.get_message('extension_name'),
            message: laneros_extension.get_message('extension_description'),
            iconUrl: '../assets/img/icon.png',
            items: objLItems,
            buttons: [{
                title: laneros_extension.get_message('text_go_to')
            }, {
                title: laneros_extension.get_message('text_go_account'),
            }]
        }, function(stRNotificationID, inRButtonIndex) {
            switch (inRButtonIndex) {
                case 0:
                    chrome.tabs.query({ url: laneros_extension.stRURL }, function(objRTabResult) {
                        var arrLResult = objRTabResult.shift();

                        if (objRTabResult.length == 0) {
                            chrome.tabs.create({url: laneros_extension.stRURL}, function(objRTab) {});
                        }
                        else {
                            chrome.tabs.highlight({windowId : arrLResult.windowId, tabs : arrLResult.index});
                        }
                    });
                    break;
                default:
                    chrome.tabs.query({ url: laneros_extension.stRURL  + 'account'}, function(objRTabResult) {
                        var arrLResult = objRTabResult.shift();

                        if (objRTabResult.length == 0) {
                            chrome.tabs.create({url: laneros_extension.stRURL + 'account'}, function(objRTab) {});
                        }
                        else {
                            chrome.tabs.highlight({windowId : arrLResult.windowId, tabs : arrLResult.index});
                        }
                    });
                    break;
            }
        }, true);
    }
}( window.laneros_extension = window.laneros_extension || {} ));
/**
 * Run on Startup
 */
try {
    laneros_extension.get_storage({ isRunning : false }, function() {
        chrome.runtime.onInstalled.addListener(laneros_extension.set_background);
        laneros_extension.set_background();
    });
}
catch(objRException) {
    var dtLDate = new Date();

    console.log(dtLDate.toLocaleString() + ' - ' + laneros_extension.get_message('extension_short_name') + ': ' +  objRException.message);
}