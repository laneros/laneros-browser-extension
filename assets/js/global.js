/**
 * Basic Object
 */
var theGlobalOptions = new Object({
    TimeRev: 120000,
    ShowInbox: true,
    ShowAlerts: true,
    ShowSubs: true,
    ShowNotification: true,
    ShowLinks: true
});
/**
 * Vars
 */
var theURL = "http://www.laneros.com/";
/**
 * function getStorageValue
 *
 * Get Chrome Storage Value
 *
 * @param theValue
 * @param theCallback
 */
function getStorageValue(theValue, theCallback) {
    chrome.storage.sync.get(theValue, theCallback);
}
/**
 * function setStorageValue
 *
 * Sync Chrome Storage Value
 *
 * @param theValue
 */
function setStorageValue(theValue, theCallback) {
    chrome.storage.sync.set(theValue, theCallback);
}
/**
 * function getMessage
 *
 * Get Locale Based Message
 *
 * @param theString
 */
function getMessage(theString) {
    return chrome.i18n.getMessage(theString);
}
/**
 * function setBadge
 *
 * Update Extension Counter
 *
 * @param theCounter
 */
function setBadge(theCounter) {
    console.log(Date.now() + " - Setting Badge ...");
    chrome.browserAction.setBadgeText({ text: ''});

    if (theCounter > 0) {
        chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255]});
        chrome.browserAction.setBadgeText({ text: '' + theCounter});
    }
}
/**
 * function getBadge
 *
 * Get Extension Counter
 *
 * @param theCounter
 */
function getBadge(theCallBack) {
    chrome.browserAction.getBadgeText({}, theCallBack);
}
/**
 * function doLogin
 *
 * Show Login Form
 */
function doLogin() {
    var theAction = $("main").find("form").attr("action");
    console.log(Date.now() + " - Show Login ...");

    if (typeof theAction != "undefined") {
        if (theAction.indexOf(theURL) == -1) {
            var theLink = document.createElement("link");

            $(theLink).attr("rel", "stylesheet")
                .attr("href", theURL + "css.php?css=facebook,nat_public_css,panel_scroller,twitter&style=2&dir=LTR")
                .appendTo("head");

            $("main").find("form").attr("action", theURL + theAction)
                .attr("target", "_blank")
                .find("a").each(function() {
                    var theNewURL = theURL + $(this).attr("href");
                    $(this).attr("href", theNewURL).attr("target", "_blank");
            });

            $("#ctrl_pageLogin_not_registered, #ctrl_pageLogin_registered").change(function() {
                $(".password, .remember").toggle();
                $("button[type=submit]").html(getMessage("loginButton"));

                if ($("#ctrl_pageLogin_not_registered").is(":checked")) {
                    $("button[type=submit]").html(getMessage("registerButton"));
                }
            });

            $("section.login").removeClass("hide");
            $("#ctrl_pageLogin_login").focus();
        }
    }
}
/**
 * function parseLANerosText
 *
 * Get Conversations, Alerts and Subscriptions data in plain text
 *
 * @return Object
 */
function parseLANeros() {
    var numConversations = 0, numAlerts = 0, numSubscriptions = 0;
    var theResult = {};

    console.log(Date.now() + " - Started parser ...");
    var jqXHR = $.get(theURL + "watched/threads/all", function(theData, textStatus, jqXHR) {
        numConversations = parseInt($(theData).find("#VisitorExtraMenu_ConversationsCounter .Total").text());
        numAlerts = parseInt($(theData).find("#VisitorExtraMenu_AlertsCounter .Total").text());
        numSubscriptions = parseInt($(theData).find(".discussionList .discussionListItems li.unread").size());

        theResult.numConversations = numConversations;
        theResult.numAlerts = numAlerts;
        theResult.numSubscriptions = numSubscriptions;
    }).always(function() {
        var theCounter = numConversations + numAlerts + numSubscriptions;

        console.log(Date.now() + " - Finished parser ...");
        getStorageValue({ ShowNotification : theGlobalOptions.ShowNotification }, function(theOptions) {
            if (theOptions.ShowNotification) {
                showNotification(numConversations, numAlerts, numSubscriptions);
            }
        });
        getBadge(function(theBadgeCounter) {
            if (theBadgeCounter != theCounter) {
                setBadge(theCounter);
            }
        });
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.log(Date.now() + " - Parser Fail ...");
        if (jqXHR.status == 403) {
            doLogin();
            getStorageValue({ ShowNotification : theGlobalOptions.ShowNotification }, function(theOptions) {
                if (theOptions.ShowNotification) {
                    createNotification("LanerosNotLoggedIn", {
                        type: "basic",
                        title: getMessage("extName"),
                        message: getMessage("notConnected"),
                        iconUrl: "../assets/img/laneros.png",
                        buttons: [{
                            title: getMessage("goTo"),
                            iconUrl: "../assets/img/laneros.png"
                        }]
                    }, function() {}, false);
                }
            });
        }
        else {
            getStorageValue({ ShowNotification : theGlobalOptions.ShowNotification }, function(theOptions) {
                if (theOptions.ShowNotification) {
                    createNotification("LanerosError", {
                        type: "basic",
                        title: getMessage("extName"),
                        message: getMessage("pageError"),
                        iconUrl: "../assets/img/laneros.png",
                        buttons: [{
                            title: getMessage("goTo"),
                            iconUrl: "../assets/img/laneros.png"
                        }]
                    }, function() {}, true);
                }
            });
        }
    });

    theResult.jqXHR = jqXHR;

//    setBadge(theCounter);
    return theResult;
}
/**
 * Run on Startup
 */
getStorageValue({ isRunning : false }, function(theOptions) {
    console.log(Date.now() + " - Global Started up ...");

    if (jQuery.validator) {
        jQuery.validator.setDefaults({
            highlight: function(element, errorClass, validClass) {
                $(element).addClass(errorClass).removeClass(validClass);
                $(element.form).find("label[for=" + element.id + "]")
                    .closest(".form-group").addClass("has-error");
            },
            unhighlight: function(element, errorClass, validClass) {
                $(element).removeClass(errorClass).addClass(validClass);
                $(element.form).find("label[for=" + element.id + "]")
                    .closest(".form-group").removeClass("has-error");
            },
            errorContainer: "#errorContainer",
            errorLabelContainer: "#errorContainer ul",
            wrapper: "li",
            errorClass: "text-danger",
        });
    }

    $(document).ajaxStart(function() {
        $("#showResponse").hide();
        $("#showLoading").show().find("h3").addClass("text-info");
        $(".none").hide();
    }).ajaxStop(function() {
        $("#showLoading").hide();
        $("#showResponse").show();
        $("html, body").css("overflow-y", "auto");
    }).ajaxError(function() {
        $("#showLoading").show().find("h3").addClass("text-error")
            .html(getMessage("dataError"));
    });

    $("[data-message]").each(function() {
        var theTarget = $(this).attr("data-target");
        var theMessage = $(this).attr("data-message");

        if (theTarget != "html") {
            $(this).attr(theTarget, getMessage(theMessage));
        }
        else {
            $(this).html(getMessage(theMessage));
        }
    });
});