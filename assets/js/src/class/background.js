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
                let stRToken = $('input[name=_xfToken]:first', objRData).val();
                let inRUserId = $('.p-account .avatar', objRData).data('user-id');
                let inRConversations = parseInt($('.p-account .js-badge--conversations', objRData).data('badge'));
                let inRAlerts = parseInt($('.p-account .js-badge--alerts', objRData).data('badge'));
                let inRSubscriptions = parseInt($('.structItemContainer .is-unread', objRData).length);
                let inLCounter = inRConversations + inRAlerts + inRSubscriptions;

                objRLaneros.setUserData({
                    stRToken: stRToken,
                    inRUserId: inRUserId
                });

                Chrome.getBadge(function(inRBadgeCounter) {
                    inRBadgeCounter = parseInt(inRBadgeCounter);
                    Chrome.setBadge(inLCounter);

                    if (isNaN(inRBadgeCounter) || inRBadgeCounter < inLCounter) {
                        Chrome.getStorage({bolRNotificationConsolidated: objRLaneros.getDefaults('bolRNotificationConsolidated')},
                            function (objROptions) {
                                if (objROptions.bolRNotificationConsolidated) {
                                    objRLaneros.createListNotification(inRConversations, inRAlerts, inRSubscriptions);
                                }
                            });
                    }
                });

                //objRLaneros.getData(true);
            }
            catch(objRException) {
                new Log('ajax-success').error(objRException);
            }
        };

        $.get(objRLaneros.getPageURL() + 'watched/threads').done(objLSuccess);
    }
}