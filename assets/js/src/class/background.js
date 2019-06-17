/**
 * Background Class
 */
class Background {
    /**
     * Class constructor
     */
    constructor() {
        Chrome.onInstalledListener(this.onInstalled);
        Background.checkData();
    }

    /**
     * Run on installed
     */
    onInstalled(details) {
        let alarmData = {
            name: 'Laneros',
            options: {
                delayInMinutes: 1,
                periodInMinutes: 2
            }
        };

        if (details !== undefined) {
            if (Chrome.onInstalledReason('install') === details.reason) {
                Chrome.createTab(1, 'views/options.html');
            }

            Chrome.createAlarm(alarmData.name, alarmData.options, Background.checkData);
        }
    }

    static checkData() {
        let objRLaneros = new Laneros();
        let objLSuccess = function(objRData, stRTextStatus, objRjqXHR) {
            try {
                let inRConversations = parseInt($("#VisitorExtraMenu_ConversationsCounter:first .Total", objRData).text());
                let inRAlerts = parseInt($("#VisitorExtraMenu_AlertsCounter:first .Total", objRData).text());
                let inRSubscriptions = parseInt($(".discussionListItems li.unread", objRData).length);
                let inLCounter = inRConversations + inRAlerts + inRSubscriptions;

                Chrome.getBadge(function(inRBadgeCounter) {
                    Chrome.setBadge(inLCounter);

                    if (isNaN(parseInt(inRBadgeCounter)) || (parseInt(inRBadgeCounter) < inLCounter)) {
                        Chrome.getStorage({bolRNotificationConsolidated: objRLaneros.getDefaults("bolRNotificationConsolidated")},
                            function (objROptions) {
                                if (objROptions.bolRNotificationConsolidated) {
                                    objRLaneros.createListNotification(inRConversations, inRAlerts, inRSubscriptions);
                                }
                            });
                    }
                });

                objRLaneros.getData(true);
            }
            catch(objRException) {
                new Log('ajax-success').error(objRException);
            }
        };

        $.get(objRLaneros.getPageURL() + "watched/threads/all").done(objLSuccess);
    }
}