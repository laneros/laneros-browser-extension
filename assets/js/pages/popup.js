/**
 * function set_response
 *
 * Set Ajax Response
 *
 * @param objRResponse
 */
function set_response(objRResponse) {
    var inLCounter = parseInt(objRResponse._visitor_conversationsUnread) + parseInt(objRResponse._visitor_alertsUnread);

    if (objRResponse._visitor_conversationsUnread > 0) {
        $('.external-inbox').html(objRResponse._visitor_conversationsUnread);
    }
    if (objRResponse._visitor_alertsUnread > 0) {
        $('.external-alerts').html(objRResponse._visitor_alertsUnread);
    }

    get_badge(function(inRBadgeCounter) {
        set_badge(inLCounter);

        if (inRBadgeCounter < inLCounter) {
            get_storage({ bolRShowNotification : objRGlobalOptions.bolRShowNotification }, function(objROptions) {
                if (objROptions.bolRShowNotification) {
                    set_notification(objRResponse._visitor_conversationsUnread, objRResponse._visitor_alertsUnread, 0);
                }
            });
        }
    });
}
/**
 * function get_account
 *
 * Get Account Data
 *
 * @param objRAccount
 * @param stRToken
 * @param objRResult
 */
function get_account(objRAccount, stRToken, objRResult) {
    var dtLDate = new Date();

    console.log(dtLDate.toLocaleString() + ' - Getting account ...');

    get_storage({ bolRShowLinks : objRGlobalOptions.bolRShowLinks }, function(objROptions) {
        var stLUserID = $(objRAccount).find('.primaryContent a.avatar').attr('href');
        var stLAvatar = $(objRAccount).find('.primaryContent a.avatar span.img').attr('style');
        var stLUsername = $(objRAccount).find('.primaryContent h3 a').html();
        var stLUserTitle = $(objRAccount).find('.primaryContent .muted').html();
        var bolLStatus = $(objRAccount).find('input[name=visible]').is(':checked');
        var arrLAvatar = stLAvatar.split('\'');
        var inLUserID = stRToken.split(',').shift();

        stLUserID = stLUserID.replace('miembros', '');

        if (objRResult.inRConversations > 0) {
            $('.external-inbox').html(objRResult.inRConversations);
        }
        if (objRResult.inRAlerts > 0) {
            $('.external-alerts').html(objRResult.inRAlerts);
        }
        if (objRResult.inRSubscriptions > 0) {
            $('.external-subscriptions').html(objRResult.inRSubscriptions);
        }

        $('input[name=_xfToken]').val(stRToken);
        $('#statusPoster').attr('action', stRURL + 'members' + stLUserID + 'post');

        $('.user-avatar, .user-name a').attr('href', stRURL + 'members' + stLUserID);
        $('.user-avatar img').attr('src', stRURL + arrLAvatar[1]);
        $('.user-name a').html(stLUsername);
        $('.user-name small').html(stLUserTitle);

        $('.loading-overlay').removeClass('hide');

        $('#visibilityForm, #statusPoster').validate({
            submitHandler: function(form) {
                $(form).ajaxSubmit({
                    success: function(objRResponse, stRStatus) {
                        if (stRStatus == 'success') {
                            set_response(objRResponse);
                        }
                    }
                });

                return false;
            }
        });

        get_storage({ bolRShowInfo : objRGlobalOptions.bolRShowInfo }, function(objROptions) {
            if (objROptions.bolRShowInfo) {
                $.get(stRURL + 'forums/ .visitorPanel', function(objRData) {
                    if (objRData) {
                        var inLMessages = $(objRData).find('.stats dl:first dd').html();
                        var inLRatingPositive = $(objRData).find('.stats dl:eq(1) dd').html();
                        var inLPoints = $(objRData).find('.stats dl:eq(2) dd').html();
                        var inLFeedbackPositive = $(objRData).find('.feedbackStats dd .Positive').html();
                        var inLFeedbackNeutral = $(objRData).find('.feedbackStats dd .Neutral').html();
                        var inLFeedbackNegative = $(objRData).find('.feedbackStats dd .Negative').html();
                        var stLTurkoins = $(objRData).find('.visitorText dl:last dd a').html();

                        $('.loading-overlay').addClass('hide');
                        $('.user-info').removeClass('hide');
                        $('.user-info .user-messages').html(inLMessages);
                        $('.user-info .user-ratings').html(inLRatingPositive);
                        $('.user-info .user-points').html(inLPoints)
                        $('.user-info .feedbackStats .Positive').html(inLFeedbackPositive);
                        $('.user-info .feedbackStats .Neutral').html(inLFeedbackNeutral);
                        $('.user-info .feedbackStats .Negative').html(inLFeedbackNegative);
                        $('.user-info .user-turkoins').html(stLTurkoins)
                    }
                });
            }
            else {
                $('.loading-overlay').addClass('hide');
            }
        });

        $('input[name=visible]').attr('checked', bolLStatus).change(function() {
            $('#visibilityForm').submit();
        });

        $('a.external-id').each(function() {
            var stLHref = $(this).attr('href');

            $(this).attr('href', stLHref + inLUserID);
        });

        $('a.external-token').each(function() {
            var stLHref = $(this).attr('href');

            $(this).attr('href', stLHref + stRToken);
        });

        if (!objROptions.bolRShowLinks) {
            $('#home').find('.clearfix:first').hide();
        }
        else {
            $('.section-user').removeClass('hide').hide().fadeIn('fast');
        }
    });
}
/**
 * function get_conversations
 *
 * Get Conversations
 *
 * @param stRToken
 */
function get_conversations(stRToken) {
    var dtLDate = new Date();

    console.log(dtLDate.toLocaleString() + ' - Getting conversations ...');

    $('#inbox .list-group-inbox').html('');
    $('#inbox .list-group-item-danger').addClass('hide');
    $('#inbox .list-group-item-info').removeClass('hide').show();

    $.getJSON(stRURL + 'conversations/popup?_xfResponseType=json&_xfNoRedirect=1&_xfToken=' + stRToken, function(objRResponse) {
        var objLConversations = document.createElement('div');

        set_response(objRResponse);

        $('#inbox .list-group-item-info').slideUp(function() {
            $(objLConversations).html(objRResponse.templateHtml);

            if ($(objLConversations).find('.noItems').size() == 0) {
                $(objLConversations).find('.listItem').each(function () {
                    var objLConversation = $('.list-group-inbox-sample').clone();

                    $(this).find('a').each(function () {
                        $(this).attr('target', '_blank').attr('href', stRURL + $(this).attr('href'));
                    });
                    $(this).find('img').each(function () {
                        if ($(this).attr('src').indexOf('data/avatars') !== -1) {
                            $(this).attr('src', stRURL + $(this).attr('src'));
                        }
                    });

                    if ($(this).hasClass('unread')) {
                        $(objLConversation).addClass('list-group-item-warning');
                    }

                    $(objLConversation).find('.col-xs-2 a').attr('href', $(this).find('a.avatar').attr('href'));
                    $(objLConversation).find('.col-xs-2 img').attr('src', $(this).find('a.avatar img').attr('src'))
                        .attr('alt', $(this).find('a.avatar img').attr('alt'));

                    $(objLConversation).find('.col-xs-10 .list-group-item-heading a')
                        .attr('href', $(this).find('h3.title a').attr('href'))
                        .html($(this).find('h3.title a').html());
                    $(objLConversation).find('.col-xs-10 .conversation-participants')
                        .html($(this).find('.posterDate').html());
                    $(objLConversation).find('.col-xs-10 .conversation-last-reply')
                        .html($(this).find('abbr').closest('.muted').html());

                    $(objLConversation).removeClass('list-group-inbox-sample hide').appendTo('#inbox .list-group-inbox');
                });
            }
            else {
                $('#inbox .list-group-item-danger').removeClass('hide').hide().slideDown();
            }
        });
    });
}
/**
 * function get_alerts
 *
 * Get Alerts
 *
 * @param theToken
 */
function get_alerts(stRToken) {
    var dtLDate = new Date();

    console.log(dtLDate.toLocaleString() + ' - Getting alerts ...');

    $('#alerts .list-group-alerts').html('');
    $('#alerts .list-group-item-danger').addClass('hide');
    $('#alerts .list-group-item-info').removeClass('hide').show();

    $.getJSON(stRURL + 'account/alerts-popup?_xfResponseType=json&_xfNoRedirect=1&_xfToken=' + stRToken, function(objRResponse) {
        var objLAlerts = document.createElement('div');

        set_response(objRResponse);

        $('#alerts .list-group-item-info').slideUp(function() {
            $(objLAlerts).html(objRResponse.templateHtml);

            if ($(objLAlerts).find('.noItems').size() == 0) {
                $(objLAlerts).find('.listItem').each(function () {
                    var objLAlert = $('.list-group-alert-sample').clone();
                    var objLDate = $(this).find('abbr');

                    $(this).find('a').each(function () {
                        $(this).attr('target', '_blank').attr('href', stRURL + $(this).attr('href'));
                    });
                    $(this).find('img').each(function () {
                        if ($(this).attr('src').indexOf('data/avatars') !== -1) {
                            $(this).attr('src', stRURL + $(this).attr('src'));
                        }
                    });

                    if ($(this).hasClass('new')) {
                        $(objLAlert).addClass('list-group-item-warning');
                    }

                    $(this).find('.listItemText abbr, .listItemText .newIcon').remove();
                    $(this).find('h3:first').addClass('list-group-item-heading');

                    $(objLAlert).find('.col-xs-2 a').attr('href', $(this).find('a.avatar').attr('href'));
                    $(objLAlert).find('.col-xs-2 img').attr('src', $(this).find('a.avatar img').attr('src'))
                        .attr('alt', $(this).find('a.avatar img').attr('alt'));

                    $(objLAlert).find('.col-xs-10 .alert-data').html($(this).find('.listItemText h3').html());
                    $(objLAlert).find('.col-xs-10 .alert-date').html(objLDate);

                    $(objLAlert).removeClass('list-group-alert-sample hide').appendTo('#alerts .list-group-alerts');
                });
            }
            else {
                $('#alerts .list-group-item-danger').removeClass('hide').hide().slideDown();
            }
        });
    });
}
/**
 * function get_subscriptions
 *
 * Get Subscriptions
 *
 * @param numSubscriptions
 * @param theSubscriptions
 */
function get_subscriptions(objRWatchedThreads) {
    var bolLNew = false;
    var dtLDate = new Date();

    console.log(dtLDate.toLocaleString() + ' - Getting subscriptions ...');

    $('#subscriptions .list-group-subscriptions').html('');
    $('#subscriptions .list-group-item-danger').addClass('hide');
    $('#subscriptions .list-group-item-info').removeClass('hide').show();

    $('#subscriptions .list-group-item-info').slideUp(function() {
        $(objRWatchedThreads).find('.discussionListItem').each(function () {
            var objLThread = $('.list-group-subscription-sample').clone();

            $(this).find('input, .itemPageNav, .controls, .stats, .iconKey').remove();
            $(this).find('a').each(function () {
                $(this).attr('target', '_blank').attr('href', stRURL + $(this).attr('href'));
            });
            $(this).find('img').each(function () {
                if ($(this).attr('src').indexOf('data/avatars') !== -1) {
                    $(this).attr('src', stRURL + $(this).attr('src'));
                }
            });

            if ($(this).hasClass('unread')) {
                $(objLThread).addClass('list-group-item-warning');
                bolLNew = true;
            }

            $(objLThread).find('.col-xs-2 a:first').attr('href', $(this).find('a.avatar:first').attr('href'));
            $(objLThread).find('.col-xs-2 a:first img').attr('src', $(this).find('a.avatar:first img').attr('src'))
                .attr('alt', $(this).find('a.avatar:first img').attr('alt'));

            $(objLThread).find('.col-xs-2 a.miniMe').attr('href', $(this).find('a.miniMe').attr('href'));

            if ($(this).find('a.miniMe').size() > 0) {
                $(objLThread).find('.col-xs-2 a.miniMe img').attr('src', $(this).find('a.miniMe img').attr('src'))
                    .attr('alt', $(this).find('a.miniMe img').attr('alt'));
                (objLThread).find('.col-xs-2 a.miniMe').removeClass('hide');
            }

            $(objLThread).find('.col-xs-10 .list-group-item-heading')
                .html($(this).find('h3').html());
            $(objLThread).find('.col-xs-10 .prefixOrange').removeClass('prefixOrange')
                .addClass('label label-orange');
            $(objLThread).find('.col-xs-10 .prefixAzul').removeClass('prefixAzul')
                .addClass('label label-blue');

            $(objLThread).find('.col-xs-10 .subscription-data')
                .html($(this).find('.secondRow .posterDate').html());
            $(objLThread).find('.col-xs-10 .subscription-last-reply .subscription-who span:last')
                .html($(this).find('.lastPost dt').html());
            $(objLThread).find('.col-xs-10 .subscription-last-reply .subscription-when')
                .html($(this).find('.lastPost dd').html());

            $(objLThread).removeClass('list-group-subscription-sample hide')
                .appendTo('#subscriptions .list-group-subscriptions');
        });

        if (!bolLNew) {
            $('#subscriptions .list-group-item-danger').removeClass('hide').show();
        }
    });
}
/**
 * function get_popup
 *
 * Get Popup Data
 */
function get_popup() {
    var objLResult = set_parser();
    var dtLDate = new Date();

    console.log(dtLDate.toLocaleString() + ' - Popup started up ...');

    objLResult.jqXHR.done(function(objRData, stRStatus, jqXHR) {
        var objLAccount = $(objRData).find('#AccountMenu');
        var stLToken = $(objRData).find('input[name=_xfToken]:first').val();

        $('.section-loading').fadeOut(function() {
            get_account(objLAccount, stLToken, objLResult);

            $('.section-user').removeClass('hide').hide().fadeIn('fast');
            $('.external-options').click(function () {
                chrome.tabs.create({'url': "views/options.html" } )

                return false;
            });
        });

        get_storage({ stRActiveTab : objRGlobalOptions.stRActiveTab }, function(objROptions) {
            var stLActiveTab = objROptions.stRActiveTab;

            stLActiveTab = stLActiveTab.replace(stRURL, '');

            if (!$('.nav-pills').find('a[href=#' + stLActiveTab + ']').hasClass('hidden')) {
                $('.nav-pills').find('a[href=#' + stLActiveTab + ']').tab('show');
            }
            else {
                $('.nav-pills').find('a[href=#home]').tab('show');
            }

            switch (stLActiveTab) {
                case 'home':
                    $('#statusPoster').find('.label').removeClass('label-warning label-danger').addClass('label-success').html(140);

                    $('#message').focus(function() {
                        $('#statusPoster').find('.col-xs-12').removeClass('hide');
                    }).on('keyup', function() {
                        var inLTextChars = $(this).val().length;

                        if (inLTextChars <= 140) {
                            $('#statusPoster').find('.label').html(140 - inLTextChars);
                        }
                        else {
                            $(this).val($(this).val().substr(0, 140));
                            $('#statusPoster').find('.label').html(0);
                        }

                        if (inLTextChars > 100) {
                            $('#statusPoster').find('.label').removeClass('label-success').addClass('label-warning');
                        }
                        if (inLTextChars > 120) {
                            $('#statusPoster').find('.label').removeClass('label-success label-warning').addClass('label-danger');
                        }
                    });
                    break;
                case 'inbox':
                    get_conversations(stLToken);
                    break;
                case 'alerts':
                    get_alerts(stLToken);
                    break;
                case 'subscriptions':
                    get_subscriptions($(objRData).find('.discussionList .discussionListItems'));
                    break;
            }

            $('a[data-toggle=tab]').on('show.bs.tab', function (objREvent) {
                var stLNewActiveTab = $(objREvent.target).attr('href');
                stLNewActiveTab = stLNewActiveTab.replace('#', '');

                var objLTabOptions = { stRActiveTab: stLNewActiveTab };

                switch (stLNewActiveTab) {
                    case 'inbox':
                        get_conversations(stLToken);
                        break;
                    case 'alerts':
                        get_alerts(stLToken);
                        break;
                    case 'subscriptions':
                        get_subscriptions($(objRData).find('.discussionList .discussionListItems'));
                        break;
                }

                set_storage(objLTabOptions, function() {});
            });
        });
    });
}
/**
 * Run on Document Load
 */
get_storage({ bolRIsRunning : false }, get_popup);