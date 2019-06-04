/**
 * function showRequest
 *
 * Run process before form send
 *
 * @param formData
 * @param jqForm
 * @param options
 */
function showRequest(formData, jqForm, options) {
    $("#responseContainer").hide();
    $("section.login").hide();
    $("#showLoading").find("h3").html(getMessage("dataLoading"));
}
/**
 * function showResponse
 *
 * Run process after form send
 *
 * @param responseText
 * @param statusText
 * @param xhr
 * @param $form
 */
function showResponse(responseText, statusText, xhr, $form) {
    window.location.reload();
}
/**
 * function getAccount
 *
 * Get Account Data
 *
 * @param theAccount
 * @param theToken
 * @param theResult
 */
function getAccount(theAccount, theToken, theResult) {
    console.log(Date.now() + " - Get Account ...");
    getStorageValue({ ShowLinks : theGlobalOptions.ShowLinks }, function(theOptions) {
        var theLink = document.createElement("link");
        var theAvatar = $(theAccount).find(".avatar span.s").attr("style");
        var theUserID = theToken.split(",").shift();
        var theMember = $(theAccount).find(".avatar").attr("href");

        $(theLink).attr("rel", "stylesheet")
            .attr("href", theURL + "css.php?css=xenforo,form,public&style=4&dir=LTR")
            .appendTo("head");
        theAvatar = theAvatar.replace("url('", "url('" + theURL);
        theAvatar = theAvatar.replace("avatars/s", "avatars/m");

        $("input[name=_xfToken]").val(theToken);
        $("form.statusPoster").attr("action", theMember + "/post");
        $(".primaryContent a").attr("href", theMember);
        $("a.avatar span.m").attr("style", theAvatar);
        $(".MenuCloser").val(getMessage("homePost"));
        $(".StatusEditor").on("focus", function() {
            $(".submitUnit").show();
        }).on("focusout", function() {
            $(".submitUnit").hide();
        });

        $.get(theURL + "account/privacy", function(theData, textStatus, jqXHR) {
            var isVisible = $(theData).find("label[for=ctrl_visible] input").is(":checked");
            $("input[name=visible]").attr("checked", isVisible).change(function() {
                $(this).closest("form").submit();
            });
        });
        $.get(theURL + theMember, function(theData, textStatus, jqXHR) {
            var theUsername = $(theData).find("h1.username").html();
            var userTitle = $(theData).find("span.userTitle").html();

            $("a.concealed, a[href=#home]").html(theUsername);
            $(".primaryContent .muted").html(userTitle);
        });
        $("#home").find("form").each(function() {
            var theAction = $(this).attr("action");
            $(this).attr("action", theURL + theAction).attr("target", "_blank");
        });
        $("#home").find("a").each(function() {
            var theNewURL = theURL + $(this).attr("href");

            if ($(this).attr("href").indexOf("user_id") != -1) {
                theNewURL += theUserID;
            }
            if ($(this).attr("href").indexOf("_xfToken") != -1) {
                theNewURL += theToken;
            }

            $(this).attr("href", theNewURL).attr("target", "_blank");
        });

        if (theOptions.ShowLinks) {
            if (theResult.numConversations > 0) {
                $("#VisitorExtraMenu_ConversationsCounter").removeClass("Zero")
                    .find(".Total").html(theResult.numConversations);
            }
            if (theResult.numAlerts > 0) {
                $("#VisitorExtraMenu_AlertsCounter").removeClass("Zero")
                    .find(".Total").html(theResult.numAlerts);
            }
        }
        else {
            $("#home").find(".secondaryContent").remove();
        }
    });
}
/**
 * function getConversations
 *
 * Get Conversations
 *
 * @param numConversations
 * @param theToken
 */
function getConversations(numConversations, theToken) {
    console.log(Date.now() + " - Get Conversations ...");
    getStorageValue({ ShowInbox : theGlobalOptions.ShowInbox }, function(theOptions) {
        if (theOptions.ShowInbox) {
            $("a[href=#inbox]").closest("li").removeClass("hide");
            $("a[href=#inbox] span:last").html(numConversations).show();
            $("#inbox div.tab-inbox.none").removeClass("hide").hide();

            $("a[href=#inbox]").on("show.bs.tab", function(theEvent) {
                $.getJSON(theURL + "conversations/popup?&_xfResponseType=json&_xfNoRedirect=1&_xfToken=" + theToken, function(theData, textStatus, jqXHR) {
                    var theConversations = document.createElement("div");
                    $(theConversations).html(theData.templateHtml);

                    if($(theConversations).find(".listItemText").size() > 0) {
                        $(theConversations).find("a").each(function() {
                            var theNewURL = theURL + $(this).attr("href");
                            $(this).attr("href", theNewURL).attr("target", "_blank");
                        });
                        $(theConversations).find("img").each(function() {
                            var theNewURL = theURL + $(this).attr("src");

                            if ($(this).attr("src").indexOf("http://") == -1) {
                                $(this).attr("src", theNewURL);
                            }
                        });

                        $("#inbox div.tab-inbox:last").html(theConversations);
                    }
                });
            });
            if (numConversations == 0) {
                $("#inbox div.tab-inbox.none").show();
                $("a[href=#inbox] span:last").hide();
            }
        }
    });
}
/**
 * function getAlerts
 *
 * Get Alerts
 *
 * @param numAlerts
 * @param theToken
 */
function getAlerts(numAlerts, theToken) {
    console.log(Date.now() + " - Get Alerts ...");
    getStorageValue({ ShowAlerts : theGlobalOptions.ShowAlerts }, function(theOptions) {
        if (theOptions.ShowAlerts) {
            $("a[href=#alerts]").closest("li").removeClass("hide");
            $("a[href=#alerts] span:last").html(numAlerts).show();
            $("#alerts div.tab-alerts.none").removeClass("hide").hide();

            $("a[href=#alerts]").on("show.bs.tab", function(theEvent) {
                $.getJSON(theURL + "account/alerts-popup?&_xfResponseType=json&_xfNoRedirect=1&_xfToken=" + theToken, function(theData, textStatus, jqXHR) {
                    var theAlerts = document.createElement("div");
                    $(theAlerts).html(theData.templateHtml);

                    if($(theAlerts).find("ol.Unread").size() == 0) {
                        $("#alerts div.tab-alerts.none").show();
                    }
                    if($(theAlerts).find(".listItemText").size() > 0) {
                        $(theAlerts).find("a").each(function() {
                            var theNewURL = theURL + $(this).attr("href");
                            $(this).attr("href", theNewURL).attr("target", "_blank");
                        });
                        $(theAlerts).find("img").each(function() {
                            var theNewURL = theURL + $(this).attr("src");

                            if ($(this).attr("src").indexOf("http://") == -1) {
                                $(this).attr("src", theNewURL);
                            }
                        });

                        $("#alerts div.tab-alerts:last").html($(theAlerts).find(".alertsPopup").html());
                    }
                });
            });
            if (numAlerts == 0) {
                $("#alerts div.tab-alerts.none").show();
                $("a[href=#alerts] span:last").hide();
            }
        }
    });
}
/**
 * function getSubscriptions
 *
 * Get Subscriptions
 *
 * @param numSubscriptions
 * @param theSubscriptions
 */
function getSubscriptions(numSubscriptions, theSubscriptions) {
    console.log(Date.now() + " - Get Subscriptions ...");
    getStorageValue({ ShowSubs : theGlobalOptions.ShowSubs }, function(theOptions) {
        if (theOptions.ShowSubs) {
            $("a[href=#subscriptions]").closest("li").removeClass("hide");
            $("a[href=#subscriptions] span:last").html(numSubscriptions).show();
            $("#div.tab-subscriptions.none").removeClass("hide");

            $(theSubscriptions).find("a").each(function() {
                var theNewURL = theURL + $(this).attr("href");
                $(this).attr("href", theNewURL).attr("target", "_blank");
            });
            $(theSubscriptions).find("img").each(function() {
                var theNewURL = theURL + $(this).attr("src");

                if ($(this).attr("src").indexOf("http://") == -1) {
                    $(this).attr("src", theNewURL);
                }
            });
            $(theSubscriptions).find("li").each(function() {
                $(this).find(".secondRow").clone().insertAfter($(this)
                    .find(".secondRow")).html($(this).find(".lastPost").html());
            });

            $(theSubscriptions).find(".itemPageNav, .miniMe, .iconKey, .stats, .lastPost, input").remove();

            $("#subscriptions div.tab-subscriptions.none").hide();
            $("#subscriptions div.tab-subscriptions:last").html(theSubscriptions);

            if (numSubscriptions == 0) {
                $("#subscriptions div.tab-subscriptions.none").show();
                $("a[href=#subscriptions] span:last").hide();
            }
        }
    });
}
/**
 * function getPopup
 *
 * Get Popup Data
 */
function getPopup() {
    theResult = parseLANeros();
    console.log(Date.now() + " - Get Popup ...");

    $("a[href=#inbox] span:first").html(getMessage("labelInbox"));
    $("a[href=#alerts] span:first").html(getMessage("labelAlerts"));
    $("a[href=#subscriptions] span:first").html(getMessage("labelSubscriptions"));

    theResult.jqXHR.done(function(theData, textStatus, jqXHR) {
        var theAccount = $(theData).find("li.menuUsuario");
        var theToken = $(theData).find("input[name=_xfToken]:first").val();

        $("section.user, nav.user").removeClass("hide");

        getAccount(theAccount, theToken, theResult);
        getConversations(theResult.numConversations, theToken);
        getAlerts(theResult.numAlerts, theToken);
        getSubscriptions(theResult.numSubscriptions, $(theData).find(".discussionList .discussionListItems"));

        $(".tab-footer").find("a").each(function() {
            var theNewURL = theURL + $(this).attr("href");
            $(this).attr("href", theNewURL).attr("target", "_blank");
        });
    });
}
/**
 * Run on Document Load
 */
getStorageValue({ isRunning : false }, function(theOptions) {
    console.log(Date.now() + " - Popup Started up ...");
    $(document).ready(function() {
        $("#pageLogin").validate({
            rules: {
                login: {
                    required: true
                },
                password: {
                    required: true
                }
            },
            submitHandler: function(form) {
                $(form).ajaxSubmit({
                    beforeSubmit: showRequest,
                    success: showResponse
                });
                return false;
            }
        });
        $(".visibilityForm, .statusPoster").validate({
            submitHandler: function(form) {
                $(form).ajaxSubmit();
                return false;
            }
        });

        getPopup();
    });
});