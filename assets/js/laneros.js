/**
 * function Laneros
 *
 * Manage the extension
 *
 * @returns {{getMessage: getMessage, getStorage: getStorage, setStorage: setStorage, logMessage: logMessage, getOptions: getOptions}}
 * @constructor
 */
var Laneros = {
    stRURL: "https://www.laneros.com/",
    stRActiveTab: "home",
    objLRUserData: {
        inRUserId: 0,
        stRUsername: null,
        stRUserTitle: null,
        stRToken: null
    },
    objRGlobalOptions: {
        dtRTimeRev: 120000,
        bolRShowInbox: true,
        bolRShowAlerts: true,
        bolRShowSubs: true,
        bolRShowNotification: true,
        bolRShowLinks: true,
        bolRShowInfo: true,
        bolRShowMessagesNotification: false,
        bolRShowAlertsNotification: false,
        bolRShowSubscriptionNotification: false
    },

    /**
     * function getMessage
     *
     * Get Locale Based Message
     *
     * @param stRString
     * @returns {*}
     */
    getMessage: function (stRString) {
        "use strict";

        //noinspection JSUnresolvedVariable
        return chrome.i18n.getMessage(stRString);
    },

    /**
     * function getStorage
     *
     * Get Chrome Storage Value

     * @param stRValue
     * @param stRCallback
     */
    getStorage: function (stRValue, stRCallback) {
        "use strict";

        //noinspection JSUnresolvedVariable
        chrome.storage.sync.get(stRValue, stRCallback);
    },

    /**
     * function setStorage
     *
     * Sync Chrome Storage Value
     *
     * @param stRValue
     * @param objRCallback
     */
    setStorage: function (stRValue, objRCallback) {
        "use strict";

        //noinspection JSUnresolvedVariable
        chrome.storage.sync.set(stRValue, objRCallback);
    },

    /**
     * function getBadge
     *
     * Get Extension Counter
     *
     * @param stRCallBack
     */
    getBadge: function(stRCallBack) {
        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
        chrome.browserAction.getBadgeText({}, stRCallBack);
    },

    /**
     * function setBadge
     *
     * Update Extension Counter
     *
     * @param inRCounter
     */
    setBadge:  function (inRCounter) {
        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
        chrome.browserAction.setBadgeText({text: ""});

        if (inRCounter > 0) {
            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            chrome.browserAction.setBadgeBackgroundColor({color: [0, 177, 235, 255]});
            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            chrome.browserAction.setBadgeText({text: "" + inRCounter});
        }
    },

    /**
     * function setAlarm
     *
     * Set Extension Alarm
     * @param stRAlarmID
     * @param objROptions
     * @param stRListener
     */
    createAlarm: function (stRAlarmID, objROptions, stRListener) {
        "use strict";

        try {
            //noinspection JSUnresolvedVariable
            chrome.alarms.clear(stRAlarmID);
            //noinspection JSUnresolvedVariable
            chrome.alarms.onAlarm.addListener(function (objRAlarm) {
                if (objRAlarm.name === stRAlarmID) {
                    stRListener();
                }
            });

            //noinspection JSUnresolvedVariable
            chrome.alarms.get(stRAlarmID, function (objRAlarm) {
                if (objRAlarm === undefined) {
                    //noinspection JSUnresolvedVariable
                    chrome.alarms.create(stRAlarmID, objROptions);
                }
            });
        } catch (objRException) {
            Laneros.logMessage("setAlarm", objRException.message);
        }
    },

    /**
     * function sendNotification
     *
     * Create a Chrome Notification
     *
     * @param stRNotificationID
     * @param objROptions
     * @param objRListener
     * @param bolRIsNew
     */
    sendNotification: function (stRNotificationID, objROptions, objRListener, bolRIsNew) {
        "use strict";

        if (bolRIsNew) {
            //noinspection JSUnresolvedVariable
            chrome.notifications.clear(stRNotificationID, function (bolRWasCleared) {
                return bolRWasCleared;
            });
        }

        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
        chrome.notifications.create(stRNotificationID, objROptions, function (objRNotificationID) {
            //noinspection JSUnresolvedVariable
            chrome.notifications.onButtonClicked.addListener(objRListener);

            return objRNotificationID;
        });
    },

    /**
     * function setUILanguage
     *
     * Set UI Language
     */
    setUILanguage: function() {
        //noinspection JSUnresolvedVariable, JSUnresolvedFunction
        var stLLanguage = chrome.i18n.getUILanguage();
        var arrLLanguage = stLLanguage.split("-");

        $("html").attr("lang", arrLLanguage[0]);
    },


    /**
     * function logMessage
     *
     * Send message to console log for debug
     *
     * @param stRFunction
     * @param stRMessage
     */
    logMessage: function (stRFunction, stRMessage) {
        "use strict";

        console.log(new Date().toLocaleString() + " - " + Laneros.getMessage("extension_short_name") + " - " + stRFunction);
        console.log(stRMessage);
    },

    /**
     * function getOptions
     *
     * Get Extension Options object
     *
     * @param stROption
     * @returns {*}
     */
    getOptions: function (stROption) {
        "use strict";

        if (stROption === undefined) {
            return Laneros.objRGlobalOptions;
        } else {
            return Laneros.objRGlobalOptions[stROption];
        }
    },

    /**
     * function getUserData
     *
     * Get Extension User Data
     *
     * @param stRData
     */
    getUserData: function(stRData) {
        "use strict";

        if (stRData === undefined) {
            return Laneros.objLRUserData;
        } else {
            return Laneros.objLRUserData[stRData];
        }
    },

    /**
     * function setUserData
     *
     * Update Extension User Data
     *
     * @param stRKey
     * @param stRValue
     */
    setUserData:  function (stRKey, stRValue) {
        "use strict";

        if (Laneros.objLRUserData[stRKey] !== undefined) {
            Laneros.objLRUserData[stRKey] = stRValue;
        }
    },

    /**
     * function getURL
     *
     * Get Extension URL
     * @returns {string}
     */
    getURL: function () {
        "use strict";

        return Laneros.stRURL;
    },

    /**
     * function getActiveTab
     *
     * Get Active Tab
     * @returns {string}
     */
    getActiveTab: function () {
        "use strict";

        return Laneros.stRActiveTab;
    },

    /**
     * function getTime
     *
     * Convert Milliseconds to Object
     *
     * @param inRMilliseconds
     * @returns {{inRMilliseconds: Number, inRSeconds: Number, inRMinutes: Number, inRHours: Number}}
     */
    getTime: function (inRMilliseconds) {
        "use strict";

        try {
            var inLSeconds = Math.floor(inRMilliseconds / 1000);
            var inLMinutes = Math.floor(inLSeconds / 60);
            var inLHours = Math.floor(inLMinutes / 60);

            return {
                inRMilliseconds: parseInt(inRMilliseconds % 1000),
                inRSeconds: parseInt(inLSeconds % 60),
                inRMinutes: parseInt(inLMinutes % 60),
                inRHours: parseInt(inLHours % 60)
            };
        } catch (objRException) {
            Laneros.logMessage("getTime", objRException.message);
        }
    },

    /**
     * function showOptions
     *
     * Get Extension Options and set in HTML
     *
     * @param objROptions
     */
    showOptions: function (objROptions) {
        "use strict";

        try {
            var objLReviewTime = Laneros.getTime(objROptions.dtRTimeRev);

            $("#form_options").validate({
                errorLabelContainer: $(".form-validation"),
                submitHandler: Laneros.saveOptions
            });

            $("input[name=extension_radio_inbox][value=" + objROptions.bolRShowInbox + "]").attr("checked", true);
            $("input[name=extension_radio_alerts][value=" + objROptions.bolRShowAlerts + "]").attr("checked", true);
            $("input[name=extension_radio_subscriptions][value=" + objROptions.bolRShowSubs + "]").attr("checked", true);
            $("input[name=extension_radio_links][value=" + objROptions.bolRShowLinks + "]").attr("checked", true);
            $("input[name=extension_radio_info][value=" + objROptions.bolRShowInfo + "]").attr("checked", true);

            $("input[name=extension_radio_notifications][value=" + objROptions.bolRShowNotification + "]")
                .attr("checked", true);
            $("input[name=extension_radio_notification_inbox][value=" + objROptions.bolRShowMessagesNotification + "]")
                .attr("checked", true);
            $("input[name=extension_radio_notification_alerts][value=" + objROptions.bolRShowAlertsNotification+ "]")
                .attr("checked", true);
            $("input[name=extension_radio_notification_subscriptions][value=" + objROptions.bolRShowSubscriptionNotification + "]")
                .attr("checked", true);

            $("#extension_number_hours").val(objLReviewTime.inRHours);
            $("#extension_number_minutes").val(objLReviewTime.inRMinutes);
            $("#extension_number_seconds").val(objLReviewTime.inRSeconds);
            $("#extension_number_milliseconds").val(objLReviewTime.inRMilliseconds);
            $(".loading-overlay").fadeOut();
        } catch (objRException) {
            Laneros.logMessage("showOptions", objRException.message);
        }
    },

    /**
     * function saveOptions
     *
     * Save Extension Options
     *
     * @returns {boolean}
     */
    saveOptions: function () {
        "use strict";

        try {
            var dtLTimeRev = parseInt($("#extension_number_milliseconds").val())
                    + (parseInt($("#extension_number_seconds").val()) * 1000)
                    + (parseInt($("#extension_number_minutes").val()) * 60 * 1000)
                    + (parseInt($("#extension_number_hours").val()) * 60 * 60 * 1000);

            var objLOptions = {
                bolRShowInbox: $("input[name=extension_radio_inbox]:checked").val() === "true",
                bolRShowAlerts: $("input[name=extension_radio_alerts]:checked").val() === "true",
                bolRShowSubs: $("input[name=extension_radio_subscriptions]:checked").val() === "true",
                bolRShowLinks: $("input[name=extension_radio_links]:checked").val() === "true",
                bolRShowInfo: $("input[name=extension_radio_info]:checked").val() === "true",
                bolRShowNotification: $("input[name=extension_radio_notifications]:checked").val() === "true",
                bolRShowMessagesNotification: $("input[name=extension_radio_notification_inbox]:checked").val() === "true",
                bolRShowAlertsNotification: $("input[name=extension_radio_notification_alerts]:checked").val() === "true",
                bolRShowSubscriptionNotification: $("input[name=extension_radio_notification_subscriptions]:checked").val() === "true",
                dtRTimeRev: dtLTimeRev > 0 ? dtLTimeRev : 0
            };

            var objLCallBack = function () {
                $(".alert-response").removeClass("alert-success bl-success alert-danger bl-danger").addClass("d-none");
                $(".alert-processing").removeClass("d-none").hide().slideDown(function () {
                    $(".alert-processing").addClass("d-none");

                    try {
                        Laneros.setBackground();

                        $(".alert-response h4").html(Laneros.getMessage("text_label_saved_header"));
                        $(".alert-response span").html(Laneros.getMessage("text_label_saved_text"));
                        $(".alert-response").addClass("alert-success bl-success").removeClass("d-none").hide()
                            .slideDown();
                    } catch (objRException) {
                        Laneros.logMessage("objLCallBack", objRException.message);

                        $(".alert-response h4").html(Laneros.getMessage("text_error_saved_header"));
                        $(".alert-response span").html(Laneros.getMessage("text_error_saved_text"));
                        $(".alert-response").addClass("alert-danger bl-danger").removeClass("d-none").hide()
                            .slideDown();
                    }
                });
            };

            Laneros.setStorage(objLOptions, objLCallBack);
        } catch (objRException) {
            Laneros.logMessage("saveOptions", objRException.message);
        }

        return false;
    },

    /**
     * function setBackground
     *
     * Set Extension Background task
     */
    setBackground: function () {
        "use strict";

        var objLBackground = function (objROptions) {
            try {
                var dtLTimeRev = objROptions.dtRTimeRev / 1000 / 60;

                Laneros.createAlarm("Laneros", {
                    delayInMinutes: 1,
                    periodInMinutes: dtLTimeRev
                }, Laneros.getData);

                Laneros.getData();
            } catch (objRException) {
                Laneros.logMessage("setBackground", objRException.message);
            }
        };

        Laneros.getStorage({dtRTimeRev: Laneros.getOptions("dtRTimeRev")}, objLBackground);
    },

    /**
     * function createBasicNotification
     *
     * Show Basic Notification Popup
     *
     * @param stRTarget
     * @param objROptions
     */
    createBasicNotification: function (stRTarget, objROptions) {
        "use strict";
        var objLListener;

        switch (stRTarget) {
            case "messages":
                objLListener = function (stRNotificationID, inRButtonIndex) {
                    var objLCallBack = function (objRTabResult) {
                        var arrLResult = objRTabResult.shift();

                        if (objRTabResult.length === 0) {
                            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                            chrome.tabs.create({url: objROptions.stRMessageURL}, function (objRTab) {});
                        } else {
                            //noinspection JSUnresolvedVariable
                            chrome.tabs.highlight({windowId: arrLResult.windowId, tabs: arrLResult.index});
                        }
                    };

                    //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                    if ("LanerosMessages" + objROptions.inRMessageID === stRNotificationID) {
                        chrome.tabs.query({url: objROptions.stRMessageURL}, objLCallBack);
                    }
                };

                //noinspection JSUnresolvedVariable
                Laneros.sendNotification("LanerosMessages" + objROptions.inRMessageID, {
                    type: "basic",
                    title: objROptions.stRMessageTitle,
                    message: objROptions.stRMessage,
                    iconUrl: objROptions.stRMessageIcon,
                    buttons: [{title: Laneros.getMessage("text_label_conversations")}]
                }, objLListener, true);
                break;
            case "alerts":
                objLListener = function (stRNotificationID, inRButtonIndex) {
                    var objLCallBack = function (objRTabResult) {
                        var arrLResult = objRTabResult.shift();

                        if (objRTabResult.length === 0) {
                            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                            chrome.tabs.create({url: objROptions.stRMessageURL}, function (objRTab) {});
                        } else {
                            //noinspection JSUnresolvedVariable
                            chrome.tabs.highlight({windowId: arrLResult.windowId, tabs: arrLResult.index});
                        }
                    };

                    //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                    if ("LanerosAlerts" + objROptions.inRMessageID === stRNotificationID) {
                        chrome.tabs.query({url: objROptions.stRMessageURL}, objLCallBack);
                    }
                };

                //noinspection JSUnresolvedVariable
                Laneros.sendNotification("LanerosAlerts" + objROptions.inRMessageID, {
                    type: "basic",
                    title: objROptions.stRMessageTitle,
                    message: objROptions.stRMessage,
                    iconUrl: objROptions.stRMessageIcon
                }, objLListener, true);
                break;
            case "subscriptions":
                objLListener = function (stRNotificationID, inRButtonIndex) {
                    var objLCallBack = function (objRTabResult) {
                        var arrLResult = objRTabResult.shift();

                        if (objRTabResult.length === 0) {
                            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                            chrome.tabs.create({url: objROptions.stRMessageURL}, function (objRTab) {});
                        } else {
                            //noinspection JSUnresolvedVariable
                            chrome.tabs.highlight({windowId: arrLResult.windowId, tabs: arrLResult.index});
                        }
                    };

                    //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                    if ("LanerosSubscriptions" + objROptions.inRMessageID === stRNotificationID) {
                        chrome.tabs.query({url: objROptions.stRMessageURL}, objLCallBack);
                    }
                };

                //noinspection JSUnresolvedVariable
                Laneros.sendNotification("LanerosSubscriptions" + objROptions.inRMessageID, {
                    type: "basic",
                    title: objROptions.stRMessageTitle,
                    message: objROptions.stRMessage,
                    iconUrl: objROptions.stRMessageIcon,
                    buttons: [{title: Laneros.getMessage("text_go_subscription")}]
                }, objLListener, true);
                break;
        }
    },

    /**
     * function createListNotification
     *
     * Show List Notification Popup
     *
     * @param inRConversations
     * @param inRAlerts
     * @param inRSubscriptions
     */
    createListNotification: function (inRConversations, inRAlerts, inRSubscriptions) {
        "use strict";

        var objLListener = function (stRNotificationID, inRButtonIndex) {
            var objLCallBack;

            switch (inRButtonIndex) {
                case 0:
                    objLCallBack = function (objRTabResult) {
                        var arrLResult = objRTabResult.shift();

                        if (objRTabResult.length === 0) {
                            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                            chrome.tabs.create({url: Laneros.getURL()}, function (objRTab) {});
                        } else {
                            //noinspection JSUnresolvedVariable
                            chrome.tabs.highlight({windowId: arrLResult.windowId, tabs: arrLResult.index});
                        }
                    };

                    //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                    chrome.tabs.query({url: Laneros.getURL() }, objLCallBack);
                    break;
                default:
                    objLCallBack = function (objRTabResult) {
                        var arrLResult = objRTabResult.shift();

                        if (objRTabResult.length === 0) {
                            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                            chrome.tabs.create({url: Laneros.getURL() + "account"}, function (objRTab) {});
                        } else {
                            //noinspection JSUnresolvedVariable
                            chrome.tabs.highlight({windowId: arrLResult.windowId, tabs: arrLResult.index});
                        }
                    };

                    //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                    chrome.tabs.query({url: Laneros.getURL() + "account"}, objLCallBack);
                    break;
            }
        };

        var objLItems = [];
        var objLConversation = {
            title: Laneros.getMessage("text_messages"),
            message: Laneros.getMessage("text_zero_inbox")
        };
        var objLAlert = {
            title: Laneros.getMessage("text_label_alerts"),
            message: Laneros.getMessage("text_zero_alerts")
        };
        var objLSubscription = {
            title: Laneros.getMessage("text_label_subscriptions"),
            message: Laneros.getMessage("text_zero_subscriptions")
        };

        if (inRConversations > 0) {
            objLConversation.message = inRConversations + " " + Laneros.getMessage("text_new");
        }
        if (inRAlerts > 0) {
            objLAlert.message = inRAlerts + " " + Laneros.getMessage("text_new");
        }
        if (inRSubscriptions > 0) {
            objLSubscription.message = inRSubscriptions + " " + Laneros.getMessage("text_new");
        }

        objLItems.push(objLConversation);
        objLItems.push(objLAlert);
        objLItems.push(objLSubscription);

        Laneros.sendNotification("Laneros", {
            type: "list",
            title: Laneros.getMessage("extension_name"),
            message: Laneros.getMessage("extension_description"),
            iconUrl: "../assets/img/icon.png",
            items: objLItems,
            buttons: [{title: Laneros.getMessage("text_go_to")},
                    {title: Laneros.getMessage("text_go_account")}]
        }, objLListener, true);
    },

    /**
     * function getData
     *
     * Get Extension Data
     *
     * @returns {{objRResponse: *}}
     */
    getData: function () {
        var inRConversations = 0, inRAlerts = 0, inRSubscriptions = 0, inLCounter = 0;

        var objLFail = function(objRjqXHR, stRTextStatus, objRErrorThrown) {
            $(".loading-overlay").hide();

            if (objRjqXHR.status === 403) {
                try {
                    Laneros.showLogin();

                    Laneros.getStorage({bolRShowNotification: Laneros.getOptions("bolRShowNotification")},
                        function (objROptions) {
                            if (objROptions.bolRShowNotification) {
                                Laneros.sendNotification("LanerosNotLoggedIn", {
                                    type: "basic",
                                    title: Laneros.getMessage("extension_name"),
                                    message: Laneros.getMessage("text_error_not_connected"),
                                    iconUrl: "../assets/img/icon.png",
                                    buttons: [{
                                        title: Laneros.getMessage("text_go_to"),
                                        iconUrl: "../assets/img/icon.png"
                                    }]
                                }, function(stRNotificationID, inRButtonIndex) {
                                    //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                                    chrome.tabs.query({url: Laneros.getURL()}, function(objRTabResult) {
                                        var arrLResult = objRTabResult.shift();

                                        if (objRTabResult.length === 0) {
                                            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                                            chrome.tabs.create({url: Laneros.getURL()});
                                        } else {
                                            //noinspection JSUnresolvedVariable
                                            chrome.tabs.highlight({windowId : arrLResult.windowId, tabs : arrLResult.index});
                                        }
                                    });
                                }, true);
                            }
                        });
                }
                catch(objRException) {
                    Laneros.logMessage("ajax-fail", objRException.message);
                }
            }
            else {
                try {
                    $(".section-error").removeClass("d-none");
                    $("body").removeAttr("style");

                    Laneros.getStorage({bolRShowNotification: Laneros.getOptions("bolRShowNotification")},
                        function (objROptions) {
                            if (objROptions.bolRShowNotification) {
                                Laneros.sendNotification("LanerosError", {
                                    type: "basic",
                                    title: Laneros.getMessage("extension_name"),
                                    message: Laneros.getMessage("text_error_page"),
                                    iconUrl: "../assets/img/icon.png",
                                    buttons: [{
                                        title: Laneros.getMessage("text_go_to"),
                                        iconUrl: "../assets/img/icon.png"
                                    }]
                                }, function(stRNotificationID, inRButtonIndex) {
                                    //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                                    chrome.tabs.query({url: Laneros.getURL()}, function(objRTabResult) {
                                        var arrLResult = objRTabResult.shift();

                                        if (objRTabResult.length === 0) {
                                            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                                            chrome.tabs.create({url: Laneros.getURL()});
                                        } else {
                                            //noinspection JSUnresolvedVariable
                                            chrome.tabs.highlight({windowId: arrLResult.windowId, tabs: arrLResult.index});
                                        }
                                    });
                                }, true);
                            }
                        });
                }
                catch(objRException) {
                    Laneros.logMessage("ajax-error", objRException.message);
                }
            }
        };

        var objLSuccess = function(objRData, stRTextStatus, objRjqXHR) {
            try {
                var stLToken = $("input[name=_xfToken]:first", objRData).val();
                var inLUserId = stLToken.split(",").shift();

                inRConversations = parseInt($("#VisitorExtraMenu_ConversationsCounter:first .Total", objRData).text());
                inRAlerts = parseInt($("#VisitorExtraMenu_AlertsCounter:first .Total", objRData).text());
                inRSubscriptions = parseInt($(".discussionListItems li.unread", objRData).length);

                inLCounter = inRConversations + inRAlerts + inRSubscriptions;

                Laneros.setUserData("stRToken", stLToken);
                Laneros.setUserData("inRUserId", inLUserId);

                if (inRConversations > 0) {
                    Laneros.getConversations(false);
                }

                if (inRAlerts > 0) {
                    Laneros.getAlerts(false);
                }

                if (inRSubscriptions > 0) {
                    Laneros.getSubscriptions($(".discussionList .discussionListItems", objRData), false);
                }

                Laneros.getBadge(function (inRBadgeCounter) {
                    Laneros.setBadge(inLCounter);

                    if (parseInt(inRBadgeCounter) < inLCounter) {
                        Laneros.getStorage({bolRShowNotification: Laneros.getOptions("bolRShowNotification")},
                            function (objROptions) {
                                if (objROptions.bolRShowNotification) {
                                    Laneros.createListNotification(inRConversations, inRAlerts, inRSubscriptions);
                                }
                            });
                    }
                });
            }
            catch(objRException) {
                Laneros.logMessage("ajax-success", objRException.message);
            }
        };

        //noinspection JSUnresolvedFunction
        return $.get(Laneros.getURL() + "watched/threads/all", objLSuccess).fail(objLFail);
    },

    /**
     * function getAccount
     *
     * Get Account Data
     *
     * @param objRAccount
     */
    getAccount: function (objRAccount) {
        var stLUsername = $(".primaryContent h3 a", objRAccount).html();
        var stLUserTitle = $(".primaryContent .muted", objRAccount).html();

        Laneros.setUserData("stRUsername", stLUsername);
        Laneros.setUserData("stRUserTitle", stLUserTitle);

        Laneros.getStorage({bolRShowInfo: Laneros.getOptions("bolRShowInfo") }, function (objROptions) {
            if (objROptions.bolRShowInfo) {
                var objLShowInfo = $(".section-user .media-user-info");
                var objLAccount = document.createElement("div");

                $(objLAccount).load(Laneros.getURL() + "forums/.visitorPanel", function(objRData) {
                    if (objRData) {
                        var objLInfo = $(objLShowInfo).find("dl");
                        var objLUser = $(objLShowInfo).find(".media-body");

                        var stLAvatar = $(".secondaryContent .avatar img", objRData).attr("src");
                        var inLMessages = $(".visitorText dl:first dd", objRData).html();
                        var inLRatingPositive = $(".visitorText dl:eq(1) dd", objRData).html();
                        var inLPoints = $(".visitorText dl:eq(2) dd", objRData).html();
                        var inLFeedbackPositive = $(".feedbackStats .Positive:first", objRData).text();
                        var inLFeedbackNeutral = $(".feedbackStats .Neutral:first", objRData).text();
                        var inLFeedbackNegative = $(".feedbackStats .Negative:first", objRData).text();

                        if (stLAvatar.indexOf("data/avatars") !== -1) {
                            stLAvatar = stLAvatar.replace("data/avatars/m", "data/avatars/l");
                            stLAvatar = Laneros.getURL() + stLAvatar;
                        }
                        if (stLAvatar.indexOf("xenforo/avatars") !== -1) {
                            stLAvatar = Laneros.getURL() + stLAvatar;
                        }

                        $(objLUser).find("a").html(stLUsername);
                        $(objLUser).find("small").html(stLUserTitle);

                        $(objLShowInfo).find("a").each(function () {
                            if ($(this).attr("href").indexOf("members/") !== -1) {
                                var inLUserID = Laneros.getUserData("inRUserId");

                                $(this).attr("href", $(this).attr("href") + stLUsername + "." + inLUserID).attr("target", "_blank");
                            }
                        });

                        $(objLShowInfo).find("img").attr("src", stLAvatar);
                        $(objLInfo).find("dd:first").html(inLMessages);
                        $(objLInfo).find("dd:eq(1)").html(inLRatingPositive);
                        $(objLInfo).find("dd:eq(2)").html(inLPoints);
                        $(objLInfo).find(".feedbackStats .positive").html(parseInt(inLFeedbackPositive));
                        $(objLInfo).find(".feedbackStats .neutral").html(parseInt(inLFeedbackNeutral));
                        $(objLInfo).find(".feedbackStats .negative").html(parseInt(inLFeedbackNegative));
                        $(objLShowInfo).removeClass("d-none");
                    }
                });
            }
        });

        Laneros.getStorage({bolRShowLinks: Laneros.getOptions("bolRShowLinks")}, function(objROptions) {
            if (objROptions.bolRShowLinks) {
                $("#home").find(".row").removeClass("d-none");
            }
            else {
                $("a[href='#home']").closest("li").addClass("d-none");
                $("#home").find(".alert-links").removeClass("d-none");
            }
        });

        Laneros.getStorage({bolRShowInbox: Laneros.getOptions("bolRShowInbox")},
            function (objROptions) {
                if (!objROptions.bolRShowInbox) {
                    $("a[href='#inbox']").closest("li").addClass("d-none");
                }
            });

        Laneros.getStorage({bolRShowAlerts: Laneros.getOptions("bolRShowAlerts")},
            function (objROptions) {
                if (!objROptions.bolRShowAlerts) {
                    $("a[href='#alerts']").closest("li").addClass("d-none");
                }
            });

        Laneros.getStorage({bolRShowSubs: Laneros.getOptions("bolRShowSubs")},
            function (objROptions) {
                if (!objROptions.bolRShowSubs) {
                    $("a[href='#subscriptions']").closest("li").addClass("d-none");
                }
            });
    },

    /**
     * function getConversations
     *
     * Get Conversations
     */
    getConversations: function(bolRIsTab) {
        var stLToken = Laneros.getUserData("stRToken");
        var objLResponseTab = function(objRResponse) {
            var objLConversations = document.createElement("div");

            //noinspection JSUnresolvedVariable
            $(objLConversations).html(objRResponse.templateHtml);
            $("#inbox").find(".list-group-item:gt(0)").remove();

            if ($(objLConversations).find(".noItems").length === 0) {
                $(objLConversations).find(".listItem").each(function () {
                    var objLConversation = $("#inbox").find(".list-group-item:first").clone();

                    $(this).find("a").each(function () {
                        $(this).attr("target", "_blank").attr("href", Laneros.getURL() + $(this).attr("href"));
                    });

                    $(this).find("img").each(function () {
                        if ($(this).attr("src").indexOf("data/avatars") !== -1) {
                            $(this).attr("src", Laneros.getURL() + $(this).attr("src"));
                        }
                        if ($(this).attr("src").indexOf("xenforo/avatars") !== -1) {
                            $(this).attr("src", Laneros.getURL() + $(this).attr("src"));
                        }
                    });

                    if ($(this).hasClass("unread")) {
                        $(objLConversation).addClass("list-group-item-warning");
                    }

                    $(objLConversation).find("a:first").attr("href", $(this).find("a.avatar").attr("href"));
                    $(objLConversation).find("a:first > img").attr("src", $(this).find("a.avatar img").attr("src"))
                        .attr("alt", $(this).find("a.avatar img").attr("alt"));

                    $(objLConversation).find(".media-body > h6 > a")
                        .attr("href", $(this).find("h3.title a").attr("href"));
                    $(objLConversation).find(".media-body > h6 > a").html($(this).find("h3.title a").html());
                    $(objLConversation).find(".media-body > p:first").html($(this).find(".posterDate").html());
                    $(objLConversation).find(".media-body > p:last > small").html($(this).find(".muted:last").html());

                    $(objLConversation).removeClass("d-none").appendTo("#inbox .list-group");
                    $("#inbox").find(".list-group").removeClass("d-none");
                });
            }
            else {
                $("#inbox").find(".alert-inbox").removeClass("d-none");
            }
        };
        var objLResponse = function(objRResponse) {
            var objLConversations = document.createElement("div");

            //noinspection JSUnresolvedVariable
            $(objLConversations).html(objRResponse.templateHtml);

            if ($(objLConversations).find(".noItems").length === 0) {
                $(objLConversations).find(".listItem").each(function (inRIndex) {
                    if ($(this).hasClass("unread")) {
                        var objLOptions = {};
                        var arrLMessageID = $(this).find("h3.title a").attr("href").split(".");
                        var inLMessageID = arrLMessageID[arrLMessageID.length - 1].replace("/", "");

                        $(this).find("a").each(function () {
                            $(this).attr("target", "_blank").attr("href", Laneros.getURL() + $(this).attr("href"));
                        });

                        $(this).find("img").each(function () {
                            if ($(this).attr("src").indexOf("data/avatars") !== -1) {
                                $(this).attr("src", Laneros.getURL() + $(this).attr("src"));
                            }
                            if ($(this).attr("src").indexOf("xenforo/avatars") !== -1) {
                                $(this).attr("src", Laneros.getURL() + $(this).attr("src"));
                            }
                        });

                        objLOptions.stRMessageTitle = $(this).find("h3.title a").html();
                        objLOptions.stRMessage = Laneros.getMessage("label_title_messages");
                        objLOptions.stRMessageIcon = $(this).find("a.avatar img").attr("src");
                        objLOptions.stRMessageURL = $(this).find("h3.title a").attr("href");
                        objLOptions.inRMessageID = inLMessageID;

                        Laneros.createBasicNotification("messages", objLOptions);
                    }
                });
            }
        };

        if (bolRIsTab) {
            $.getJSON(Laneros.getURL() + "conversations/popup?_xfResponseType=json&_xfNoRedirect=1&_xfToken=" + stLToken, objLResponseTab);
        }
        else {
            Laneros.getStorage({bolRShowMessagesNotification: Laneros.getOptions("bolRShowMessagesNotification") }, function (objROptions) {
                if (objROptions.bolRShowMessagesNotification) {
                    $.getJSON(Laneros.getURL() + "conversations/popup?_xfResponseType=json&_xfNoRedirect=1&_xfToken=" + stLToken, objLResponse);
                }
            });
        }
    },

    /**
     * function getAlerts
     *
     * Get Alerts
     */
    getAlerts: function(bolRIsTab) {
        var stLToken = Laneros.getUserData("stRToken");
        var objLResponseTab = function(objRResponse) {
            var objLAlerts = document.createElement("div");

            //noinspection JSUnresolvedVariable
            $(objLAlerts).html(objRResponse.templateHtml);
            $("#alerts").find(".list-group-item:gt(0)").remove();

            if ($(objLAlerts).find(".noItems").length === 0) {
                $(objLAlerts).find(".listItem").each(function () {
                    var objLAlert = $("#alerts").find(".list-group-item:first").clone();
                    var objLDate = $(this).find(".DateTime");

                    $(this).find("a").each(function () {
                        $(this).attr("target", "_blank").attr("href", Laneros.getURL() + $(this).attr("href"));
                    });

                    $(this).find("img").each(function () {
                        if ($(this).attr("src").indexOf("data/avatars") !== -1) {
                            $(this).attr("src", Laneros.getURL() + $(this).attr("src"));
                        }
                        if ($(this).attr("src").indexOf("xenforo/avatars") !== -1) {
                            $(this).attr("src", Laneros.getURL() + $(this).attr("src"));
                        }
                    });

                    if ($(this).hasClass("new")) {
                        $(objLAlert).addClass("list-group-item-warning");
                    }

                    $(this).find(".listItemText abbr, .listItemText .newIcon").remove();

                    $(objLAlert).find("a:first").attr("href", $(this).find("a.avatar").attr("href"));
                    $(objLAlert).find("a:first > img").attr("src", $(this).find("a.avatar img").attr("src"))
                        .attr("alt", $(this).find("a.avatar img").attr("alt"));

                    $(objLAlert).find(".media-body > a")
                        .attr("href", $(this).find("h3 a").attr("href"));
                    $(objLAlert).find(".media-body > p:first").html($(this).find("h3").html());
                    $(objLAlert).find(".media-body > p:last > small").html(objLDate);

                    $(objLAlert).removeClass("d-none").appendTo("#alerts .list-group");
                    $("#alerts").find(".list-group").removeClass("d-none");
                });
            }
            else {
                $("#alerts").find(".alert-alerts").removeClass("d-none");
            }
        };
        var objLResponse = function(objRResponse) {
            var objLAlerts = document.createElement("div");

            //noinspection JSUnresolvedVariable
            $(objLAlerts).html(objRResponse.templateHtml);

            if ($(objLAlerts).find(".noItems").length === 0) {
                $(objLAlerts).find(".listItem").each(function (inRIndex) {
                    if ($(this).hasClass("new")) {
                        var objLOptions = {};

                        $(this).find("a").each(function () {
                            $(this).attr("target", "_blank").attr("href", Laneros.getURL() + $(this).attr("href"));
                        });

                        $(this).find("img").each(function () {
                            if ($(this).attr("src").indexOf("data/avatars") !== -1) {
                                $(this).attr("src", Laneros.getURL() + $(this).attr("src"));
                            }
                            if ($(this).attr("src").indexOf("xenforo/avatars") !== -1) {
                                $(this).attr("src", Laneros.getURL() + $(this).attr("src"));
                            }
                        });

                        objLOptions.stRMessageTitle = Laneros.getMessage("label_title_alerts");
                        objLOptions.stRMessage = $(this).find("h3").text();
                        objLOptions.stRMessageIcon = $(this).find("a.avatar img").attr("src");
                        objLOptions.stRMessageURL = Laneros.getURL() + 'account/alerts';
                        objLOptions.inRMessageID = $(this).attr("id");

                        Laneros.createBasicNotification("alerts", objLOptions);
                    }
                });
            }
        };

        if (bolRIsTab) {
            $.getJSON(Laneros.getURL() + "account/alerts-popup?_xfResponseType=json&_xfNoRedirect=1&_xfToken=" + stLToken, objLResponseTab);
        }
        else {
            Laneros.getStorage({bolRShowAlertsNotification: Laneros.getOptions("bolRShowAlertsNotification") }, function (objROptions) {
                if (objROptions.bolRShowAlertsNotification) {
                    $.getJSON(Laneros.getURL() + "account/alerts-popup?_xfResponseType=json&_xfNoRedirect=1&_xfToken=" + stLToken, objLResponse);
                }
            });
        }
    },

    /**
     * function getSubscriptions
     *
     * Get Subscriptions
     *
     * @param objRWatchedThreads
     * @param bolRIsTab
     */
    getSubscriptions: function(objRWatchedThreads, bolRIsTab) {
        if (bolRIsTab) {
            var bolLNew = false;

            $("#subscriptions").find(".list-group-item:gt(0)").remove();

            $(objRWatchedThreads).find(".discussionListItem").each(function () {
                var objLThread = $("#subscriptions").find(".list-group-item:first").clone();

                $(this).find("input, .itemPageNav, .controls, .stats, .iconKey").remove();

                $(this).find("a").each(function () {
                    $(this).attr("target", "_blank").attr("href", Laneros.getURL() + $(this).attr("href"));
                });

                $(this).find("img").each(function () {
                    if ($(this).attr("src").indexOf("data/avatars") !== -1) {
                        $(this).attr("src", Laneros.getURL() + $(this).attr("src"));
                    }
                    if ($(this).attr("src").indexOf("xenforo/avatars") !== -1) {
                        $(this).attr("src", Laneros.getURL() + $(this).attr("src"));
                    }
                });

                if ($(this).hasClass("unread")) {
                    $(objLThread).addClass("list-group-item-warning");
                    bolLNew = true;
                }

                $(objLThread).find("a:first").attr("href", $(this).find("a.avatar:first").attr("href"));
                $(objLThread).find("a:first > img").attr("src", $(this).find("a.avatar:first img").attr("src"))
                    .attr("alt", $(this).find("a.avatar:first img").attr("alt"));

                if ($(this).find("a.miniMe").length > 0) {
                    $(objLThread).find("a.miniMe").attr("href", $(this).find("a.miniMe").attr("href"));
                    $(objLThread).find("a.miniMe img").attr("src", $(this).find("a.miniMe img").attr("src"))
                        .attr("alt", $(this).find("a.miniMe img").attr("alt"));
                    (objLThread).find("a.miniMe").removeClass("hidden-xs-up");
                }

                $(objLThread).find(".media-body > h6 > a")
                    .attr("href", $(this).find("h3.title a").attr("href"))
                    .html($(this).find("h3.title a").html());
                $(objLThread).find(".media-body > p:first").html($(this).find(".posterDate").html());
                $(objLThread).find(".media-body .subscription-who span:last")
                    .html($(this).find(".lastPost dt").html());
                $(objLThread).find(".media-body .subscription-when")
                    .html($(this).find(".lastPost dd").html());

                $(objLThread).removeClass("d-none").appendTo("#subscriptions .list-group");
                $("#subscriptions").find(".list-group").removeClass("d-none");
            });

            if (!bolLNew) {
                $("#subscriptions").find(".alert-subscriptions").removeClass("d-none");
            }
        }
        else {
            Laneros.getStorage({bolRShowSubscriptionNotification: Laneros.getOptions("bolRShowSubscriptionNotification")}, function (objROptions) {
                if (objROptions.bolRShowSubscriptionNotification) {
                    $(objRWatchedThreads).find(".discussionListItem").each(function () {
                        if ($(this).hasClass("unread")) {
                            var objLOptions = {};

                            $(this).find("a").each(function () {
                                $(this).attr("target", "_blank").attr("href", Laneros.getURL() + $(this).attr("href"));
                            });

                            $(this).find("img").each(function () {
                                if ($(this).attr("src").indexOf("data/avatars") !== -1) {
                                    $(this).attr("src", Laneros.getURL() + $(this).attr("src"));
                                }
                                if ($(this).attr("src").indexOf("xenforo/avatars") !== -1) {
                                    $(this).attr("src", Laneros.getURL() + $(this).attr("src"));
                                }
                            });

                            objLOptions.stRMessageTitle = Laneros.getMessage("label_title_subscription");
                            objLOptions.stRMessage = $(this).find("h3.title a").html();
                            objLOptions.stRMessageIcon = $(this).find("a.avatar:first img").attr("src");
                            objLOptions.stRMessageURL = $(this).find("h3.title a").attr("href");
                            objLOptions.inRMessageID = $(this).attr("id");

                            Laneros.createBasicNotification("subscriptions", objLOptions);
                        }
                    });
                }
            });
        }
    },

    /**
     * function showLogin
     *
     * Show login form
     */
    showLogin: function () {
        var objLChange = function() {
            $("#ctrl_pageLogin_password").closest("div").slideUp();
            $("#ctrl_pageLogin_remember").attr("checked", false).closest("label").hide();

            if ($(".section-login #ctrl_pageLogin_not_registered").is(":checked")) {
                $(".section-login button[type=submit]").html(Laneros.getMessage("text_button_register"));
            }

            if ($(".section-login #ctrl_pageLogin_registered").is(":checked")) {
                $("#ctrl_pageLogin_password").closest("div").slideDown();
                $("#ctrl_pageLogin_remember").closest("label").show();
                $(".section-login button[type=submit]").html(Laneros.getMessage("text_button_login"));
            }
        };

        var onBeforeSubmit = function(objRResponse, stRStatus) {
            $(".alert-error").slideUp();
            $(".loading-overlay").show();
        };

        var onSuccess = function(objRResponse, stRStatus) {
            $(".loading-overlay").hide();

            //noinspection JSUnresolvedVariable
            if (objRResponse._redirectStatus === "ok") {
                $(".section-login").fadeOut("fast", Laneros.showPopup);
            }
            if (objRResponse.title === "Error") {
                $(".alert-error").slideDown();
                $(".alert-error p").html(Laneros.getMessage("text_error_login"));
            }
        };

        var onError = function (objRResponse, stRStatus) {
            $(".loading-overlay").hide();
            $(".alert-error").slideDown();
            $(".alert-error p").html(Laneros.getMessage("text_error_page"));
        };

        Laneros.setBadge(0);

        //noinspection JSUnresolvedFunction
        $(".section-login input[name=register]").change(objLChange);
        $("#pageLogin").validate({
            submitHandler: function (form) {
                $(form).ajaxSubmit({
                    beforeSubmit: onBeforeSubmit,
                    success: onSuccess,
                    error: onError,
                    dataType: 'json'
                });

                return false;
            }
        });

        $(".loading-overlay").fadeOut(function() {
            $("body").removeAttr("style");
            $(".section-login").removeClass("d-none").hide().fadeIn("fast", function() {
                $(".section-login #ctrl_pageLogin_login").focus();
            });
        });
    },

    /**
     * function showPopup
     *
     * Show main popup data
     */
    showPopup: function () {
        var objLResult = Laneros.getData();
        var objLActiveTab = function(stRActiveTab, objRData) {
            switch (stRActiveTab) {
                case "home":
                    $("#statusPoster").find(".status-length").removeClass("text-warning text-danger").addClass("text-success").html(140);

                    $("#message").on("focus", function() {
                        $("#statusPoster").find(".status-message").removeClass("d-none");
                        $("html, body").animate({ scrollTop: $(document).height() }, "slow");
                    }).on("focusout", function() {
                        $("#statusPoster").find(".status-message").addClass("d-none");
                    }).on("keyup", function() {
                        var inLTextChars = $(this).val().length;

                        if (inLTextChars <= 140) {
                            $("#statusPoster").find(".status-length").html(140 - inLTextChars);
                        }
                        else {
                            $(this).val($(this).val().substr(0, 140));
                            $("#statusPoster").find(".status-length").html(0);
                        }

                        if (inLTextChars > 100) {
                            $("#statusPoster").find(".status-length").removeClass("text-success").addClass("text-warning");
                        }
                        if (inLTextChars > 120) {
                            $("#statusPoster").find(".status-length").removeClass("text-success text-warning").addClass("text-danger");
                        }
                    });

                    $(".external-user-id").each(function() {
                        var inLUserID = Laneros.getUserData("inRUserId");

                        $(this).attr("href", Laneros.getURL() + $(this).attr("href") + inLUserID).attr("target", "_blank");
                    });
                    $(".external-token").each(function() {
                        var stLToken = Laneros.getUserData("stRToken");

                        $(this).attr("href", Laneros.getURL() + $(this).attr("href") + stLToken).attr("target", "_blank");
                    });
                    break;
                case "inbox":
                    Laneros.getConversations(true);
                    break;
                case "alerts":
                    Laneros.getAlerts(true);
                    break;
                case "subscriptions":
                    Laneros.getSubscriptions($(".discussionList .discussionListItems", objRData), true);
                    break;
            }
        };

        Laneros.setUILanguage();
        $("body").css("min-height", 600);

        //noinspection JSUnresolvedFunction
        objLResult.done(function(objRData, stRStatus, jqXHR) {
            var objLAccount = $("#AccountMenu", objRData);
            var stLActiveTab = Laneros.getActiveTab();

            var inLConversations = parseInt($("#VisitorExtraMenu_ConversationsCounter:first .Total", objRData).text());
            var inLAlerts = parseInt($("#VisitorExtraMenu_AlertsCounter:first .Total", objRData).text());
            var inLSubscriptions = parseInt($(".discussionListItems li.unread", objRData).length);

            $(".loading-overlay").hide();
            $("body").removeAttr("style");
            $(".section-user").removeClass("d-none");

            if (inLConversations > 0) {
                $(".external-inbox").html(inLConversations);
            }
            if (inLAlerts > 0) {
                $(".external-alerts").html(inLAlerts);
            }
            if (inLSubscriptions > 0) {
                $(".external-subscriptions").html(inLSubscriptions);
            }

            Laneros.getAccount(objLAccount);

            Laneros.getStorage({stRActiveTab: Laneros.getActiveTab()}, function(objROptions) {
                stLActiveTab = objROptions.stRActiveTab;

                if (!$(".nav-pills").find("a[href='#" + stLActiveTab + "']").hasClass("d-none")) {
                    $(".nav-pills").find("a[href='#" + stLActiveTab + "']").tab("show");
                }
                else {
                    $(".nav-pills").find("a:first").tab("show");
                }
            });

            $("a[data-toggle=tab]").on("show.bs.tab", function (objREvent) {
                var stLNewActiveTab = $(objREvent.target).attr("href");

                stLActiveTab = stLNewActiveTab.replace("#", "");

                var objLTabOptions = { stRActiveTab: stLActiveTab };

                Laneros.setStorage(objLTabOptions, objLActiveTab(stLActiveTab, objRData));
            });

            $(".external-options").click(function () {
                //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                chrome.tabs.create({"url": "views/options.html" } );

                return false;
            });
        });
    }
};
/**
 * Run on Document Load
 */
try {
    Laneros.getStorage({ bolRIsRunning : false }, function() {
        Laneros.setUILanguage();

        if ($.validator) {
            $.validator.setDefaults({
                errorElement: "span",
                highlight: function (element, errorClass, validClass) {
                    $(".form-validation").removeClass("d-none");
                    $(element).closest(".form-group").find(".form-control-label").removeClass("text-success")
                        .addClass("text-danger");

                    if ($(element).is(":radio")) {
                        $(element).closest(".col-7").find("input").removeClass("is-valid")
                            .addClass("is-invalid");
                    }
                    else {
                        $(element).removeClass("is-valid").addClass("is-invalid mb-0");
                    }
                },
                unhighlight: function (element, errorClass, validClass) {
                    if ($(element).is(":radio")) {
                        $(element).closest(".col-7").find("input").removeClass("is-invalid")
                    }
                    else {
                        $(element).removeClass("is-invalid");
                    }

                    $(element).closest(".form-group").find(".form-control-label").removeClass("text-danger");
                },
                errorClass: "invalid-feedback",
                errorPlacement: function(error, element) {
                    error.appendTo(element.closest(".form-row").find("div:last"));
                }
            });
        }

        $("[data-message]").each(function() {
            var stLTarget = $(this).attr("data-target");
            var stLMessage = $(this).attr("data-message");

            if (stLTarget !== "html") {
                $(this).attr(stLTarget, Laneros.getMessage(stLMessage));
            } else {
                $(this).html(Laneros.getMessage(stLMessage));
            }
        });

        $("a.external-link").each(function() {
            $(this).attr("href", Laneros.getURL() + $(this).attr("href")).attr("target", "_blank");
        });
        $("form.external-link").each(function() {
            $(this).attr("action", Laneros.getURL() + $(this).attr("action"));
        });
        $("img.external-link").each(function() {
            $(this).attr("src", Laneros.getURL() + $(this).attr("src"));
        });
    });
} catch (objRException) {
    Laneros.logMessage("background", objRException.message);
}