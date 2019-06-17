/**
 * Chrome class
 */
class Chrome {
    /**
     * Class constructor
     */
    constructor() { }

    /**
     * On installed listener
     *
     * @param objRCallback
     */
    static onInstalledListener(objRCallback) {
        chrome.runtime.onInstalled.addListener(objRCallback);
    }

    /**
     * On installed reason
     * @param stRType
     * @returns {*}
     */
    static onInstalledReason(stRType) {
        let reason;

        switch (stRType) {
            case 'install':
                reason = chrome.runtime.OnInstalledReason.INSTALL;
                break;
            case 'update':
                reason = chrome.runtime.OnInstalledReason.UPDATE;
                break;
            default:
                reason = null;
                break;
        }

        return reason;
    }

    /**
     * On message listener
     *
     * @param objRCallback
     */
    static onMessageListener(objRCallback) {
        chrome.runtime.onMessage.addListener(objRCallback);
    }

    /**
     * Create new Alarm
     *
     * @param stRAlarmName
     * @param objROptions
     * @param objRCallback
     */
    static createAlarm(stRAlarmName, objROptions, objRCallback) {
        try {
            chrome.alarms.clear(stRAlarmName);
            chrome.alarms.onAlarm.addListener(function (wasCleared) {
                if (wasCleared.name === stRAlarmName) {
                    if (objRCallback !== undefined)
                        objRCallback();
                }
            });

            chrome.alarms.get(stRAlarmName, function (alarm) {
                if (alarm === undefined) {
                    chrome.alarms.create(stRAlarmName, objROptions);
                }
            });
        } catch (objRException) {
            new Log('Chrome setAlarm').error(objRException);
        }
    }

    /**
     * Get extension resource URL
     *
     * @param stRURL
     * @returns {*}
     */
    static getResourceURL(stRURL) {
        if (stRURL) {
            return chrome.runtime.getURL(stRURL);
        }
    }

    /**
     * Get extension UI language
     *
     * @returns {*}
     */
    static getUILanguage() {
        return chrome.i18n.getUILanguage();
    }

    /**
     * Create browser tab
     *
     * @param inRType
     * @param stRURL
     * @param objRCallback
     */
    static createTab(inRType, stRURL, objRCallback) {
        if (typeof  objRCallback === 'undefined') {
            objRCallback = function (objRTab) {};
        }

        switch (inRType) {
            case 1:
                chrome.tabs.create({url: this.getResourceURL(stRURL)}, objRCallback);
                break;
            case 2:
                chrome.tabs.create({url: stRURL}, objRCallback);
                break;
            default:
                break;
        }
    }

    /**
     * Highlight browser tab
     *
     * @param inRWindowId
     * @param inRTab
     */
    static highlightTab(inRWindowId, inRTab) {
        chrome.tabs.highlight({windowId: inRWindowId, tabs: inRTab});
    }

    /**
     * Query for browser tab
     *
     * @param stRURL
     * @param objLCallBack
     */
    static queryTab(stRURL, objLCallBack) {
        chrome.tabs.query({url: stRURL}, objLCallBack);
    }

    /**
     * Get locale based message
     *
     * @param stRMessage
     * @returns {*}
     */
    static getMessage(stRMessage) {
        return chrome.i18n.getMessage(stRMessage);
    }

    /**
     * Get Chrome Storage Value

     * @param stRValue
     * @param stRCallback
     */
    static getStorage(stRValue, stRCallback) {
        chrome.storage.sync.get(stRValue, stRCallback);
    }

    /**
     * Sync Chrome Storage Value
     *
     * @param stRValue
     * @param objRCallback
     */
    static setStorage(stRValue, objRCallback) {
        chrome.storage.sync.set(stRValue, objRCallback);
    }

    /**
     * Update Extension Counter
     *
     * @param inRCounter
     */
    static setBadge(inRCounter) {
        chrome.browserAction.setBadgeText({text: ''});

        if (inRCounter > 0) {
            chrome.browserAction.setBadgeBackgroundColor({color: [0, 177, 235, 255]});
            chrome.browserAction.setBadgeText({text: '' + inRCounter});
        }
    }

    /**
     * Get Extension Counter
     *
     * @param stRCallBack
     */
    static getBadge(stRCallBack) {
        chrome.browserAction.getBadgeText({}, stRCallBack);
    }

    /**
     * Create a Chrome Notification
     *
     * @param stRNotificationID
     * @param objROptions
     * @param objRListener
     * @param bolRIsNew
     */
    static sendNotification(stRNotificationID, objROptions, objRListener, bolRIsNew) {
        if (bolRIsNew) {
            chrome.notifications.clear(stRNotificationID, function (bolRWasCleared) {
                chrome.notifications.create(stRNotificationID, objROptions, objRListener);
            });
        }
        else {
            chrome.notifications.update(stRNotificationID, objROptions, objRListener);
        }
    }
}