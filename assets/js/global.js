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
    objRGlobalOptions: {
        dtRTimeRev: 120000,
        bolRShowInbox: true,
        bolRShowAlerts: true,
        bolRShowSubs: true,
        bolRShowNotification: true,
        bolRShowLinks: true,
        bolRShowInfo: true
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

        //noinspection JSUnresolvedVariable
        chrome.notifications.create(stRNotificationID, objROptions, function (objRNotificationID) {
            return objRNotificationID;
        });

        //noinspection JSUnresolvedVariable
        chrome.notifications.onButtonClicked.addListener(objRListener);
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
     * function setOptions
     *
     * Get Extension Options and set in HTML
     *
     * @param objROptions
     */
    setOptions: function (objROptions) {
        "use strict";

        try {
            var objLReviewTime = Laneros.getTime(objROptions.dtRTimeRev);

            $(".loading-overlay").hide();

            //noinspection JSUnresolvedFunction
            $(".btn-group input").change(function () {
                var bolRStatus = $(this).is(":checked");

                if ($(this).attr("type") === "radio") {
                    $(this).closest(".btn-group").find(".btn").removeClass("btn-success active")
                        .addClass("btn-secondary");
                    $(this).closest(".btn-group-vertical").find(".btn").removeClass("btn-success active")
                        .addClass("btn-secondary");

                    if (bolRStatus) {
                        $(this).closest(".btn").addClass("btn-success active");
                    }
                }
            });

            $("#form_options").validate({
                errorLabelContainer: $(".form-validation"),
                submitHandler: Laneros.saveOptions
            });

            $("input[name=extension_radio_inbox][value=" + objROptions.bolRShowInbox + "]").attr("checked", true)
                .closest("label").button("toggle");
            $("input[name=extension_radio_alerts][value=" + objROptions.bolRShowAlerts + "]").attr("checked", true)
                .closest("label").button("toggle");
            $("input[name=extension_radio_subscriptions][value=" + objROptions.bolRShowSubs + "]").attr("checked", true)
                .closest("label").button("toggle");
            $("input[name=extension_radio_notifications][value=" + objROptions.bolRShowNotification + "]").attr("checked", true)
                .closest("label").button("toggle");
            $("input[name=extension_radio_links][value=" + objROptions.bolRShowLinks + "]").attr("checked", true)
                .closest("label").button("toggle");
            $("input[name=extension_radio_info][value=" + objROptions.bolRShowInfo + "]").attr("checked", true)
                .closest("label").button("toggle");

            $("#extension_number_hours").val(objLReviewTime.inRHours);
            $("#extension_number_minutes").val(objLReviewTime.inRMinutes);
            $("#extension_number_seconds").val(objLReviewTime.inRSeconds);
            $("#extension_number_milliseconds").val(objLReviewTime.inRMilliseconds);
        } catch (objRException) {
            Laneros.logMessage("setOptions", objRException.message);
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
                bolRShowNotification: $("input[name=extension_radio_notifications]:checked").val() === "true",
                bolRShowLinks: $("input[name=extension_radio_links]:checked").val() === "true",
                bolRShowInfo: $("input[name=extension_radio_info]:checked").val() === "true",
                dtRTimeRev: dtLTimeRev > 0 ? dtLTimeRev : 0
            };

            var objLCallBack = function () {
                try {
                    $(".alert-response").removeClass("alert-success").addClass("hidden-xs-up");

                    $(".alert-response h4").html(Laneros.getMessage("text_label_saved_header"));
                    $(".alert-response span").html(Laneros.getMessage("text_label_saved_text"));

                    $(".alert-processing").removeClass("hidden-xs-up").hide().slideDown(function () {
                        $(".alert-response").addClass("alert-success").removeClass("hidden-xs-up").hide().slideDown();
                    });

                    Laneros.setBackground();
                } catch (objRException) {
                    Laneros.logMessage("objLCallBack", objRException.message);

                    $(".alert-response").addClass("alert-danger").removeClass("hidden-xs-up").hide().slideDown();
                    $(".alert-response h4").html(Laneros.getMessage("text_error_saved_header"));
                    $(".alert-response span").html(Laneros.getMessage("text_error_saved_text"));
                }
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

        Laneros.getStorage({dtRTimeRev: Laneros.getOptions('dtRTimeRev')}, objLBackground);
    },

    /**
     * function createNotification
     *
     * Show Notification Popup
     *
     * @param inRConversations
     * @param inRAlerts
     * @param inRSubscriptions
     */
    createNotification: function (inRConversations, inRAlerts, inRSubscriptions) {
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
            if (objRjqXHR.status == 403) {
                try {
                    Laneros.showLogin();

                    Laneros.getStorage({bolRShowNotification: Laneros.getOptions('bolRShowNotification')},
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

                                        if (objRTabResult.length == 0) {
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
                    Laneros.logMessage('ajax-fail', objRException.message);
                }
            }
            else {
                try {
                    $(".section-error").removeClass("hidden-xs-up");

                    Laneros.getStorage({bolRShowNotification: Laneros.getOptions('bolRShowNotification')},
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

                                            if (objRTabResult.length == 0) {
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
                    Laneros.logMessage('ajax-error', objRException.message);
                }
            }
        };

        var objLSuccess = function(objRData, stRTextStatus, objRjqXHR) {
            try {
                inRConversations = parseInt($("#VisitorExtraMenu_ConversationsCounter:first .Total", objRData).text());
                inRAlerts = parseInt($("#VisitorExtraMenu_AlertsCounter:first .Total", objRData).text());
                inRSubscriptions = parseInt($(".discussionListItems li.unread", objRData).length);
                $('.section-user .tabs').removeClass('hidden-xs-up');

                inLCounter = inRConversations + inRAlerts + inRSubscriptions;

                Laneros.getBadge(function (inRBadgeCounter) {
                    Laneros.setBadge(inLCounter);

                    if (parseInt(inRBadgeCounter) < inLCounter) {
                        Laneros.getStorage({bolRShowNotification: Laneros.getOptions('bolRShowNotification')},
                            function (objROptions) {
                                if (objROptions.bolRShowNotification) {
                                    Laneros.createNotification(inRConversations, inRAlerts, inRSubscriptions);
                                }
                            });
                    }
                });
            }
            catch(objRException) {
                Laneros.logMessage('ajax-success', objRException.message);
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
     * @param stRToken
     */
    getAccount: function (objRAccount, stRToken) {
        var inLUserID = stRToken.split(',').shift();
        var stLUsername = $('.primaryContent h3 a', objRAccount).html();
        var stLUserTitle = $('.primaryContent .muted', objRAccount).html();

        Laneros.getStorage({bolRShowInfo: Laneros.getOptions('bolRShowInfo') }, function (objROptions) {
            if (objROptions.bolRShowInfo) {
                var objLShowInfo = $('.section-user .list-group-item-user-info');

                $.get(Laneros.getURL() + 'forums/ .visitorPanel', function(objRData) {
                    $(objLShowInfo).removeClass('hidden-xs-up');

                    if (objRData) {
                        var objLInfo = $(objLShowInfo).find('dl');
                        var objLUser = $(objLShowInfo).find('.media-body h5');

                        var stLAvatar = $('.secondaryContent .avatar img', objRData).attr('src');
                        var inLMessages = $('.visitorText dl:first dd', objRData).html();
                        var inLRatingPositive = $('.visitorText dl:eq(1) dd', objRData).html();
                        var inLPoints = $('.visitorText dl:eq(2) dd', objRData).html();
                        var inLFeedbackPositive = $('.feedbackStats .Positive:first', objRData).text();
                        var inLFeedbackNeutral = $('.feedbackStats .Neutral:first', objRData).text();
                        var inLFeedbackNegative = $('.feedbackStats .Negative:first', objRData).text();

                        if (stLAvatar.indexOf('data/avatars') !== -1) {
                            stLAvatar = stLAvatar.replace('data/avatars/m', 'data/avatars/l');
                            stLAvatar = Laneros.getURL() + stLAvatar;
                        }
                        if (stLAvatar.indexOf('xenforo/avatars') !== -1) {
                            stLAvatar = Laneros.getURL() + stLAvatar;
                        }

                        $(objLUser).find('a').html(stLUsername);
                        $(objLUser).find('small').html(stLUserTitle);

                        $(objLShowInfo).find('a').each(function () {
                            if ($(this).attr('href').indexOf('members/') !== -1) {
                                $(this).attr('href', $(this).attr('href') + inLUserID);
                            }
                        });

                        $(objLShowInfo).find('img').attr('src', stLAvatar);
                        $(objLInfo).find('dd:first').html(inLMessages);
                        $(objLInfo).find('dd:eq(1)').html(inLRatingPositive);
                        $(objLInfo).find('dd:eq(2)').html(inLPoints);
                        $(objLInfo).find('.feedbackStats .positive').html(parseInt(inLFeedbackPositive));
                        $(objLInfo).find('.feedbackStats .neutral').html(parseInt(inLFeedbackNeutral));
                        $(objLInfo).find('.feedbackStats .negative').html(parseInt(inLFeedbackNegative));
                    }
                });
            }
            else {
                $('.section-user .list-group-item-user-info').addClass("hidden-xs-up");
            }
        });

        Laneros.getStorage({bolRShowLinks: Laneros.getOptions('bolRShowLinks')}, function(objROptions) {
            if (objROptions.bolRShowLinks) {
                $('#home').find('.row').removeClass('hidden-xs-up');
            }
            else {
                $("a[href='#home']").addClass('hidden-xs-up');
                $('#home').find('.list-group-item-danger').removeClass('hidden-xs-up');
            }
        });

        Laneros.getStorage({bolRShowInbox: Laneros.getOptions('bolRShowInbox')},
            function (objROptions) {
                if (!objROptions.bolRShowInbox) {
                    $("a[href='#inbox']").addClass("hidden-xs-up");
                }
            });

        Laneros.getStorage({bolRShowAlerts: Laneros.getOptions('bolRShowAlerts')},
            function (objROptions) {
                if (!objROptions.bolRShowAlerts) {
                    $("a[href='#alerts']").addClass("hidden-xs-up");
                }
            });

        Laneros.getStorage({bolRShowSubs: Laneros.getOptions('bolRShowSubs')},
            function (objROptions) {
                if (!objROptions.bolRShowSubs) {
                    $("a[href='#subscriptions']").addClass("hidden-xs-up");
                }
            });
    },

    /**
     * function getConversations
     *
     * Get Conversations
     *
     * @param stRToken
     */
    getConversations: function(stRToken) {
        $.getJSON(Laneros.getURL() + 'conversations/popup?_xfResponseType=json&_xfNoRedirect=1&_xfToken=' + stRToken, function(objRResponse) {
            var objLConversations = document.createElement('div');

            //noinspection JSUnresolvedVariable
            $(objLConversations).html(objRResponse.templateHtml);
            $('#inbox').find('.media:gt(0)').remove();

            if ($(objLConversations).find('.noItems').length == 0) {
                $(objLConversations).find('.listItem').each(function () {
                    var objLConversation = $('#inbox').find('.media:first').clone();

                    $(this).find('a').each(function () {
                        $(this).attr('target', '_blank').attr('href', Laneros.getURL() + $(this).attr('href'));
                    });

                    $(this).find('img').each(function () {
                        if ($(this).attr('src').indexOf('data/avatars') !== -1) {
                            $(this).attr('src', Laneros.getURL() + $(this).attr('src'));
                        }
                        if ($(this).attr('src').indexOf('xenforo/avatars') !== -1) {
                            $(this).attr('src', Laneros.getURL() + $(this).attr('src'));
                        }
                    });

                    if ($(this).hasClass('unread')) {
                        $(objLConversation).addClass('list-group-item-warning');
                    }

                    $(objLConversation).find('a:first').attr('href', $(this).find('a.avatar').attr('href'));
                    $(objLConversation).find('a:first > img').attr('src', $(this).find('a.avatar img').attr('src'))
                        .attr('alt', $(this).find('a.avatar img').attr('alt'));

                    $(objLConversation).find('.media-body > a')
                        .attr('href', $(this).find('h3.title a').attr('href'))
                    $(objLConversation).find('.media-body > a > h5').html($(this).find('h3.title a').html());
                    $(objLConversation).find('.media-body > div:first').html($(this).find('.posterDate').html());
                    $(objLConversation).find('.media-body > div:last').html($(this).find('.muted:last').html());

                    $(objLConversation).removeClass('hidden-xs-up').appendTo('#inbox .list-unstyled');
                    $('#inbox').find('.list-unstyled').removeClass('hidden-xs-up');
                });
            }
            else {
                $('#inbox').find('.list-group-item-danger').removeClass('hidden-xs-up');
            }
        });
    },

    /**
     * function getAlerts
     *
     * Get Alerts
     *
     * @param stRToken
     */
    getAlerts: function(stRToken) {
        $.getJSON(Laneros.getURL() + 'account/alerts-popup?_xfResponseType=json&_xfNoRedirect=1&_xfToken=' + stRToken, function(objRResponse) {
            var objLAlerts = document.createElement('div');

            //noinspection JSUnresolvedVariable
            $(objLAlerts).html(objRResponse.templateHtml);
            $('#alerts').find('.media:gt(0)').remove();

            if ($(objLAlerts).find('.noItems').length == 0) {
                $(objLAlerts).find('.listItem').each(function () {
                    var objLAlert = $('#alerts').find('.media:first').clone();
                    var objLDate = $(this).find('.DateTime');

                    $(this).find('a').each(function () {
                        $(this).attr('target', '_blank').attr('href', Laneros.getURL() + $(this).attr('href'));
                    });

                    $(this).find('img').each(function () {
                        if ($(this).attr('src').indexOf('data/avatars') !== -1) {
                            $(this).attr('src', Laneros.getURL() + $(this).attr('src'));
                        }
                        if ($(this).attr('src').indexOf('xenforo/avatars') !== -1) {
                            $(this).attr('src', Laneros.getURL() + $(this).attr('src'));
                        }
                    });

                    if ($(this).hasClass('new')) {
                        $(objLAlert).addClass('list-group-item-warning');
                    }

                    $(this).find('.listItemText abbr, .listItemText .newIcon').remove();

                    $(objLAlert).find('a:first').attr('href', $(this).find('a.avatar').attr('href'));
                    $(objLAlert).find('a:first > img').attr('src', $(this).find('a.avatar img').attr('src'))
                        .attr('alt', $(this).find('a.avatar img').attr('alt'));

                    $(objLAlert).find('.media-body > a')
                        .attr('href', $(this).find('h3 a').attr('href'));
                    $(objLAlert).find('.media-body > p').html($(this).find('h3').html());
                    $(objLAlert).find('.media-body > div').html(objLDate);

                    $(objLAlert).removeClass('hidden-xs-up').appendTo('#alerts .list-unstyled');
                    $('#alerts').find('.list-unstyled').removeClass('hidden-xs-up');
                });
            }
            else {
                $('#alerts').find('.list-group-item-danger').removeClass('hidden-xs-up');
            }
        });
    },

    /**
     * function getSubscriptions
     *
     * Get Subscriptions
     *
     * @param objRWatchedThreads
     */
    getSubscriptions: function(objRWatchedThreads) {
        var bolLNew = false;

        $('#subscriptions').find('.media:gt(0)').remove();

        $(objRWatchedThreads).find('.discussionListItem').each(function () {
            var objLThread = $('#subscriptions').find('.media:first').clone();

            $(this).find('input, .itemPageNav, .controls, .stats, .iconKey').remove();

            $(this).find('a').each(function () {
                $(this).attr('target', '_blank').attr('href', Laneros.getURL() + $(this).attr('href'));
            });

            $(this).find('img').each(function () {
                if ($(this).attr('src').indexOf('data/avatars') !== -1) {
                    $(this).attr('src', Laneros.getURL() + $(this).attr('src'));
                }
                if ($(this).attr('src').indexOf('xenforo/avatars') !== -1) {
                    $(this).attr('src', Laneros.getURL() + $(this).attr('src'));
                }
            });

            if ($(this).hasClass('unread')) {
                $(objLThread).addClass('list-group-item-warning');
                bolLNew = true;
            }

            $(objLThread).find('a:first').attr('href', $(this).find('a.avatar:first').attr('href'));
            $(objLThread).find('a:first > img').attr('src', $(this).find('a.avatar:first img').attr('src'))
                .attr('alt', $(this).find('a.avatar:first img').attr('alt'));

            if ($(this).find('a.miniMe').length > 0) {
                $(objLThread).find('a.miniMe').attr('href', $(this).find('a.miniMe').attr('href'));
                $(objLThread).find('a.miniMe img').attr('src', $(this).find('a.miniMe img').attr('src'))
                    .attr('alt', $(this).find('a.miniMe img').attr('alt'));
                (objLThread).find('a.miniMe').removeClass('hidden-xs-up');
            }

            $(objLThread).find('.media-body > a')
                .attr('href', $(this).find('h3.title a').attr('href'));
            $(objLThread).find('.media-body > a > h5').html($(this).find('h3.title a').html());
            $(objLThread).find('.media-body > div:first').html($(this).find('.posterDate').html());
            $(objLThread).find('.media-body .subscription-who span:last')
                .html($(this).find('.lastPost dt').html());
            $(objLThread).find('.media-body .subscription-when')
                .html($(this).find('.lastPost dd').html());

            $(objLThread).removeClass('hidden-xs-up').appendTo('#subscriptions .list-unstyled');
            $('#subscriptions').find('.list-unstyled').removeClass('hidden-xs-up');
        });

        if (!bolLNew) {
            $('#subscriptions').find('.list-group-item-danger').removeClass('hidden-xs-up').show();
        }
    },
    /**
     * function showLogin
     *
     * Show login form
     */
    showLogin: function () {
        Laneros.setBadge(0);

        var onBeforeSubmit = function(objRResponse, stRStatus) {
            $(".list-group-item-processing").removeClass("hidden-xs-up");
            $(".list-group-item-message").addClass("hidden-xs-up");
        };

        var onSuccess = function(objRResponse, stRStatus) {
            $(".list-group-item-processing").addClass("hidden-xs-up");

            //noinspection JSUnresolvedVariable
            if (objRResponse._redirectStatus == "ok") {
                $(".section-login").fadeOut("fast", Laneros.showPopup);
            }
            else {
                $(".list-group-item-message").removeClass("hidden-xs-up").show();
                $(".section-login .list-group-item-danger p").html(Laneros.getMessage("text_error_login"));
                $(".section-login .list-group-item-danger").hide().fadeIn();
            }
        };

        var objLSubmitHandler = function (form) {
            $(form).ajaxSubmit({
                beforeSubmit: onBeforeSubmit,
                success: onSuccess
            });

            return false;
        };

        var objLChange = function() {
            $(".section-login #ctrl_pageLogin_password, .section-login #ctrl_pageLogin_remember").closest(".form-group").slideUp();

            if ($(".section-login #ctrl_pageLogin_not_registered").is(":checked")) {
                $(".section-login button[type=submit]").html(Laneros.getMessage("text_button_register"));
            }

            if ($(".section-login #ctrl_pageLogin_registered").is(":checked")) {
                $(".section-login #ctrl_pageLogin_password, .section-login #ctrl_pageLogin_remember").closest(".form-group").slideDown();
                $(".section-login button[type=submit]").html(Laneros.getMessage("text_button_login"));
            }
        };

        $(".section-login").removeClass("hidden-xs-up");
        $(".loading-overlay").hide();
        //noinspection JSUnresolvedFunction
        $(".section-login #ctrl_pageLogin_not_registered, .section-login #ctrl_pageLogin_registered").change(objLChange);

        $("#pageLogin").validate({
            errorLabelContainer: $(".form-validation"),
            submitHandler: objLSubmitHandler
        });

        $(".list-group-item-processing").fadeOut(function() {
            $(".section-login").removeClass("hidden-xs-up").hide().fadeIn("fast");
            $(".section-login #ctrl_pageLogin_login").focus();
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
            var stLToken = $('input[name=_xfToken]:first', objRData).val();

            switch (stRActiveTab) {
                case 'home':
                    $('#statusPoster').find('.status-length').removeClass('text-warning text-danger').addClass('text-success').html(140);

                    $('#message').focus(function() {
                        $('#statusPoster').find('.hidden-xs-up').removeClass('hidden-xs-up');
                    }).on('keyup', function() {
                        var inLTextChars = $(this).val().length;

                        if (inLTextChars <= 140) {
                            $('#statusPoster').find('.status-length').html(140 - inLTextChars);
                        }
                        else {
                            $(this).val($(this).val().substr(0, 140));
                            $('#statusPoster').find('.status-length').html(0);
                        }

                        if (inLTextChars > 100) {
                            $('#statusPoster').find('.status-length').removeClass('text-success').addClass('text-warning');
                        }
                        if (inLTextChars > 120) {
                            $('#statusPoster').find('.status-length').removeClass('text-success text-warning').addClass('text-danger');
                        }
                    });
                    break;
                case 'inbox':
                    Laneros.getConversations(stLToken);
                    break;
                case 'alerts':
                    Laneros.getAlerts(stLToken);
                    break;
                case 'subscriptions':
                    Laneros.getSubscriptions($('.discussionList .discussionListItems', objRData));
                    break;
            }
        };

        //noinspection JSUnresolvedFunction
        objLResult.done(function(objRData, stRStatus, jqXHR) {
            var objLAccount = $('#AccountMenu', objRData);
            var stLToken = $('input[name=_xfToken]:first', objRData).val();
            var stLActiveTab = Laneros.getActiveTab();

            var inLConversations = parseInt($("#VisitorExtraMenu_ConversationsCounter:first .Total", objRData).text());
            var inLAlerts = parseInt($("#VisitorExtraMenu_AlertsCounter:first .Total", objRData).text());
            var inLSubscriptions = parseInt($(".discussionListItems li.unread", objRData).length);

            $(".loading-overlay").addClass("hidden-xs-up");

            if (inLConversations > 0) {
                $('.external-inbox').html(inLConversations);
            }
            if (inLAlerts > 0) {
                $('.external-alerts').html(inLAlerts);
            }
            if (inLSubscriptions > 0) {
                $('.external-subscriptions').html(inLSubscriptions);
            }

            Laneros.getAccount(objLAccount, stLToken);

            Laneros.getStorage({stRActiveTab: Laneros.getActiveTab()}, function(objROptions) {
                stLActiveTab = objROptions.stRActiveTab;

                if (!$('.nav-pills').find('a[href="#' + stLActiveTab + '"]').hasClass('hidden-xs-up')) {
                    $('.nav-pills').find('a[href="#' + stLActiveTab + '"]').tab('show');
                }
                else {
                    $('.nav-pills').find('a:first').tab('show');
                }
            });

            $('a[data-toggle=tab]').on('show.bs.tab', function (objREvent) {
                var stLNewActiveTab = $(objREvent.target).attr('href');

                stLActiveTab = stLNewActiveTab.replace('#', '');

                var objLTabOptions = { stRActiveTab: stLActiveTab };

                Laneros.setStorage(objLTabOptions, objLActiveTab(stLActiveTab, objRData));
            });

            $('.external-options').click(function () {
                //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                chrome.tabs.create({'url': "views/options.html" } );

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
        if (jQuery.validator) {
            jQuery.validator.setDefaults({
                errorElement: "li",
                highlight: function (element, errorClass, validClass) {
                    $(element).addClass("form-control-danger")
                        .closest(".form-group").addClass("has-danger").removeClass("has-success")
                        .find(".form-control-feedback").removeClass("invisible");
                },
                unhighlight: function (element, errorClass, validClass) {
                    $(element).addClass("form-control-success").closest(".form-group")
                        .removeClass("has-danger").addClass("has-success")
                        .find(".form-control-feedback").addClass("invisible");
                },
                errorClass : "form-control-feedback ml-3"
            });
        }

        $("[data-message]").each(function() {
            var stLTarget = $(this).attr("data-target");
            var stLMessage = $(this).attr("data-message");

            if (stLTarget != "html") {
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

        //noinspection JSUnresolvedFunction
        $(document).ajaxStart(function () {
            $(".list-group-item-processing").removeClass("hidden-xs-up");
        }).ajaxComplete(function () {
            $(".list-group-item-processing").addClass("hidden-xs-up");
        });
    });
} catch (objRException) {
    Laneros.logMessage('background', objRException.message);
}