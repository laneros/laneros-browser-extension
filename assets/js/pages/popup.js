/**
 * Self-Executing Anonymous Function
 */
(function(laneros_extension) {
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

        laneros_extension.get_badge(function(inRBadgeCounter) {
            laneros_extension.set_badge(inLCounter);

            if (inRBadgeCounter < inLCounter) {
                laneros_extension.get_storage({ bolRShowNotification : laneros_extension.objRGlobalOptions.bolRShowNotification }, function(objROptions) {
                    if (objROptions.bolRShowNotification) {
                        laneros_extension.set_notification(objRResponse._visitor_conversationsUnread, objRResponse._visitor_alertsUnread, 0);
                    }
                });
            }
        });
    }
    /**
     * function get_popup
     *
     * Get Popup Data
     */
    laneros_extension.get_popup = function() {
        var objLResult = laneros_extension.set_parser();

        objLResult.objLjqXHR.done(function(objRData, stRStatus, jqXHR) {
            var objLAccount = $('#AccountMenu', objRData);
            var stLToken = $('input[name=_xfToken]:first', objRData).val();

            $('.section-loading').fadeOut(function() {
                get_account(objLAccount, stLToken, objLResult);

                $('.section-user').removeClass('hide').hide().fadeIn('fast');
                $('.external-options').click(function () {
                    chrome.tabs.create({'url': "views/options.html" } )

                    return false;
                });
            });

            laneros_extension.get_storage({ stRActiveTab : laneros_extension.objRGlobalOptions.stRActiveTab }, function(objROptions) {
                var stLActiveTab = objROptions.stRActiveTab;

                stLActiveTab = stLActiveTab.replace(laneros_extension.stRURL, '');

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
                        get_subscriptions($('.discussionList .discussionListItems', objRData));
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
                            get_subscriptions($('.discussionList .discussionListItems', objRData));
                            break;
                    }

                    laneros_extension.set_storage(objLTabOptions, function() {});
                });
            });
        });
    };
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
        laneros_extension.get_storage({ bolRShowLinks : laneros_extension.objRGlobalOptions.bolRShowLinks }, function(objROptions) {
            var stLUserID = $('.primaryContent a.avatar', objRAccount).attr('href');
            var stLAvatar = $('.primaryContent a.avatar span.img', objRAccount).attr('style');
            var stLUsername = $('.primaryContent h3 a', objRAccount).html();
            var stLUserTitle = $('.primaryContent .muted', objRAccount).html();
            var bolLStatus = $('input[name=visible]', objRAccount).is(':checked');
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
            $('#statusPoster').attr('action', laneros_extension.stRURL + 'members' + stLUserID + 'post');

            $('.user-avatar, .user-name a').attr('href', laneros_extension.stRURL + 'members' + stLUserID);
            $('.user-avatar img').attr('src', laneros_extension.stRURL + arrLAvatar[1]);
            $('.user-name a').html(stLUsername);
            $('.user-name small').html(stLUserTitle);

            $('.loading-overlay').removeClass('hide');

            $('#visibilityForm, #statusPoster').validate({
                submitHandler: function(form) {
                    $(form).ajaxSubmit({
                        success: function(objRResponse, stRStatus) {
                            if (stRStatus == 'success') {
                                laneros_extension.set_response(objRResponse);
                            }
                        }
                    });

                    return false;
                }
            });

            laneros_extension.get_storage({ bolRShowInfo : laneros_extension.objRGlobalOptions.bolRShowInfo }, function(objROptions) {
                if (objROptions.bolRShowInfo) {
                    $.get(laneros_extension.stRURL + 'forums/ .visitorPanel', function(objRData) {
                        if (objRData) {
                            var inLMessages = $('.stats dl:first dd', objRData).html();
                            var inLRatingPositive = $('.stats dl:eq(1) dd', objRData).html();
                            var inLPoints = $('.stats dl:eq(2) dd', objRData).html();
                            var inLFeedbackPositive = $('.traderRatingChart .positive', objRData).css('width');
                            var inLFeedbackNeutral = $('.traderRatingChart .neutral', objRData).css('width');
                            var inLFeedbackNegative = $('.traderRatingChart .negative', objRData).css('width');
                            var stLTurkoins = $('.visitorText dl:last dd a', objRData).html();

                            $('.loading-overlay').addClass('hide');
                            $('.user-info').removeClass('hide');
                            $('.user-info .user-messages').html(inLMessages);
                            $('.user-info .user-ratings').html(inLRatingPositive);
                            $('.user-info .user-points').html(inLPoints)
                            $('.user-info .traderRatingChart .positive').css('width', inLFeedbackPositive);
                            $('.user-info .traderRatingChart .neutral').css('width', inLFeedbackNeutral);
                            $('.user-info .traderRatingChart .negative').css('width', inLFeedbackNegative);
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
                $('#home .list-group-item-danger').removeClass('hide').hide().slideDown();
            }
            else {
                $('.section-user').removeClass('hide').hide().fadeIn('fast');
            }
        });
    };
    /**
     * function get_conversations
     *
     * Get Conversations
     *
     * @param stRToken
     */
    function get_conversations(stRToken) {
        $('#inbox .list-group-inbox').html('');
        $('#inbox .list-group-item-danger').addClass('hide');
        $('#inbox .list-group-item-info').removeClass('hide').show();

        $.getJSON(laneros_extension.stRURL + 'conversations/popup?_xfResponseType=json&_xfNoRedirect=1&_xfToken=' + stRToken, function(objRResponse) {
            var objLConversations = document.createElement('div');

            set_response(objRResponse);

            $('#inbox .list-group-item-info').slideUp(function() {
                $(objLConversations).html(objRResponse.templateHtml);

                if ($(objLConversations).find('.noItems').size() == 0) {
                    $(objLConversations).find('.listItem').each(function () {
                        var objLConversation = $('.list-group-inbox-sample').clone();

                        $(this).find('a').each(function () {
                            $(this).attr('target', '_blank').attr('href', laneros_extension.stRURL + $(this).attr('href'));
                        });
                        $(this).find('img').each(function () {
                            if ($(this).attr('src').indexOf('data/avatars') !== -1) {
                                $(this).attr('src', laneros_extension.stRURL + $(this).attr('src'));
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

        $('#alerts .list-group-alerts').html('');
        $('#alerts .list-group-item-danger').addClass('hide');
        $('#alerts .list-group-item-info').removeClass('hide').show();

        $.getJSON(laneros_extension.stRURL + 'account/alerts-popup?_xfResponseType=json&_xfNoRedirect=1&_xfToken=' + stRToken, function(objRResponse) {
            var objLAlerts = document.createElement('div');

            set_response(objRResponse);

            $('#alerts .list-group-item-info').slideUp(function() {
                $(objLAlerts).html(objRResponse.templateHtml);

                if ($(objLAlerts).find('.noItems').size() == 0) {
                    $(objLAlerts).find('.listItem').each(function () {
                        var objLAlert = $('.list-group-alert-sample').clone();
                        var objLDate = $(this).find('abbr');

                        $(this).find('a').each(function () {
                            $(this).attr('target', '_blank').attr('href', laneros_extension.stRURL + $(this).attr('href'));
                        });

                        $(this).find('img').each(function () {
                            if ($(this).attr('src').indexOf('data/avatars') !== -1) {
                                $(this).attr('src', laneros_extension.stRURL + $(this).attr('src'));
                            }
                            if ($(this).attr('src').indexOf('xenforo/avatars') !== -1) {
                                $(this).attr('src', laneros_extension.stRURL + $(this).attr('src'));
                            }
                        });

                        $(this).find('.listItemText abbr, .listItemText .newIcon').remove();
                        $(this).find('h3:first').addClass('list-group-item-heading');

                        $(objLAlert).find('.col-xs-2 a').attr('href', $(this).find('a.avatar').attr('href'));
                        $(objLAlert).find('.col-xs-2 img').attr('src', $(this).find('a.avatar img').attr('src'))
                            .attr('alt', $(this).find('a.avatar img').attr('alt'));

                        $(objLAlert).find('.col-xs-10 .alert-data').html($(this).find('.listItemText h3').html());
                        $(objLAlert).find('.col-xs-10 .alert-date').html(objLDate);

                        $(objLAlert).removeClass('list-group-alert-sample hide').appendTo('#alerts .list-group-alerts');
                        $(objLAlert).removeClass('list-group-item-warning');

                        if ($(this).hasClass('new')) {
                            $(objLAlert).addClass('list-group-item-warning');
                        }
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
        var bolLNew = false;;

        $('#subscriptions .list-group-subscriptions').html('');
        $('#subscriptions .list-group-item-danger').addClass('hide');
        $('#subscriptions .list-group-item-info').removeClass('hide').show();

        $('#subscriptions .list-group-item-info').slideUp(function() {
            $(objRWatchedThreads).find('.discussionListItem').each(function () {
                var objLThread = $('.list-group-subscription-sample').clone();

                $(this).find('input, .itemPageNav, .controls, .stats, .iconKey').remove();
                $(this).find('a').each(function () {
                    $(this).attr('target', '_blank').attr('href', laneros_extension.stRURL + $(this).attr('href'));
                });
                $(this).find('img').each(function () {
                    if ($(this).attr('src').indexOf('data/avatars') !== -1) {
                        $(this).attr('src', laneros_extension.stRURL + $(this).attr('src'));
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
}( window.laneros_extension = window.laneros_extension || {}, jQuery ));
/**
 * Run on Document Load
 */
try {
    laneros_extension.get_storage({ bolRIsRunning : false }, laneros_extension.get_popup);
}
catch(objRException) {
    var dtLDate = new Date();

    console.log(dtLDate.toLocaleString() + ' - ' + laneros_extension.get_message('extension_short_name') + ': ' +  objRException.message);
}