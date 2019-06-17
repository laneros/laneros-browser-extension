/**
 * Laneros class
 */
class Laneros {
    /**
     * Class constructor
     */
    constructor(objRHtml) {
        this.setPageUrl('https://www.laneros.com/');
        this.setUILanguage();
        this.parseHTML(objRHtml);
        this.setDefaults({
            stRActiveTab: 'home',
            dtRTimeRev: 120000,
            bolRShowInbox: true,
            bolRShowAlerts: true,
            bolRShowSubs: true,
            bolRShowLinks: true,
            bolRShowInfo: true,
            bolRNotificationConsolidated: true,
            bolRNotificationInbox: false,
            bolRNotificationAlerts: false,
            bolRNotificationSubs: false
        });
    }

    /**
     * Get Page URL
     *
     * @returns {string}
     */
    getPageURL() {
        return this._pageUrl;
    }

    /**
     * Set Page URL
     *
     * @param stRURL
     */
    setPageUrl(stRURL) {
        this._pageUrl = stRURL;
    }

    /**
     * Parse given HTML to set view messages
     *
     * @param objRHtml
     */
    parseHTML(objRHtml) {
        let stLUrl = this.getPageURL();

        $(objRHtml).find('[data-i18n]').each(function () {
            let [stRTarget, stRMessage] = $(this).data('i18n').split(',');
            let arrLTargets = stRTarget.split('|');
            let arrLMessages = stRMessage.split('|');

            for (let i = 0; i < arrLTargets.length; i++) {
                let stLTarget = arrLTargets[i];
                let stLMessage = Chrome.getMessage(arrLMessages[i]);

                switch (stLTarget) {
                    case 'html':
                        $(this).html(stLMessage);
                        break;
                    default:
                        $(this).attr(stLTarget, stLMessage);
                        break;
                }
            }

            $(this).removeAttr('data-i18n');
        });

        $(objRHtml).find('.external-link').each(function() {
            if($(this).is('a')) {
                $(this).attr('href', stLUrl + $(this).attr('href')).attr('target', '_blank');
            }
            if($(this).is('form')) {
                $(this).attr('action', stLUrl + $(this).attr('action'));
            }
            if($(this).is('img')) {
                $(this).attr('src', stLUrl + $(this).attr('src'));
            }
        });
    }

    /**
     * Set UI Language
     */
    setUILanguage() {
        let arrLLanguage = Chrome.getUILanguage().split('-');

        $('html').attr('lang', arrLLanguage[0]);
    }

    /**
     * Set default options
     *
     * @param objROptions
     */
    setDefaults(objROptions) {
        this._extensionOptions = objROptions;
    }

    /**
     * Load default extension options
     *
     * @param stROption
     * @returns {*}
     */
    getDefaults(stROption) {
        if (stROption !== undefined) {
            return this._extensionOptions[stROption];
        }

        return this._extensionOptions;
    }

    /**
     * Convert Milliseconds to Object
     *
     * @param inRMilliseconds
     * @returns {{inRMilliseconds: Number, inRSeconds: Number, inRMinutes: Number, inRHours: Number}}
     */
    static getTime(inRMilliseconds) {
        try {
            let inLSeconds = Math.floor(inRMilliseconds / 1000);
            let inLMinutes = Math.floor(inLSeconds / 60);
            let inLHours = Math.floor(inLMinutes / 60);

            return {
                inRMilliseconds: parseInt(inRMilliseconds % 1000),
                inRSeconds: parseInt(inLSeconds % 60),
                inRMinutes: parseInt(inLMinutes % 60),
                inRHours: parseInt(inLHours % 60)
            };
        } catch (objRException) {
            new Log('Laneros getTime').error(objRException);
        }
    }

    /**
     * Set user options in Options page
     *
     * @param objROptions
     */
    setOptions(objROptions) {
        try {
            let objLReviewTime = Laneros.getTime(objROptions.dtRTimeRev);

            $('#form_options').validate({
                submitHandler: Laneros.saveOptions
            });

            if (objROptions.bolRShowInbox) {
                $('#checkbox_section_inbox').attr('checked', true);
            }
            if (objROptions.bolRShowAlerts) {
                $('#checkbox_section_alerts').attr('checked', true);
            }
            if (objROptions.bolRShowSubs) {
                $('#checkbox_section_subscriptions').attr('checked', true);
            }
            if (objROptions.bolRShowLinks) {
                $('#checkbox_section_links').attr('checked', true);
            }
            if (objROptions.bolRShowInfo) {
                $('#checkbox_section_info').attr('checked', true);
            }

            if (objROptions.bolRNotificationConsolidated) {
                $('#checkbox_notification_consolidated').attr('checked', true);

                $('#checkbox_notification_inbox').attr('checked', false).attr('disabled', true);
                $('#checkbox_notification_alerts').attr('checked', false).attr('disabled', true);
                $('#checkbox_notification_subscriptions').attr('checked', false).attr('disabled', true);
            }
            if (objROptions.bolRNotificationInbox) {
                $('#checkbox_notification_inbox').attr('checked', true);

                $('#checkbox_notification_consolidated').attr('checked', false).attr('disabled', true);
            }
            if (objROptions.bolRNotificationAlerts) {
                $('#checkbox_notification_alerts').attr('checked', true);

                $('#checkbox_notification_consolidated').attr('checked', false).attr('disabled', true);
            }
            if (objROptions.bolRNotificationSubs) {
                $('#checkbox_notification_subscriptions').attr('checked', true);

                $('#checkbox_notification_consolidated').attr('checked', false).attr('disabled', true);
            }

            $('#number_hours').val(objLReviewTime.inRHours);
            $('#number_minutes').val(objLReviewTime.inRMinutes);
            $('#number_seconds').val(objLReviewTime.inRSeconds);
            $('#number_milliseconds').val(objLReviewTime.inRMilliseconds);

            $('.loading-box').fadeOut();

            $('input[name=checkbox_notification_consolidated]').change(function () {
                $('input[name=checkbox_notification_inbox]').attr('checked', false).attr('disabled', false);
                $('input[name=checkbox_notification_alerts]').attr('checked', false).attr('disabled', false);
                $('input[name=checkbox_notification_subscriptions]').attr('checked', false).attr('disabled', false);

                if ($(this).is(':checked')) {
                    $('input[name=checkbox_notification_inbox]').attr('disabled', true).attr('checked', false);
                    $('input[name=checkbox_notification_alerts]').attr('checked', false).attr('disabled', true);
                    $('input[name=checkbox_notification_subscriptions]').attr('checked', false).attr('disabled', true);
                }
            });

            $('input[name=checkbox_notification_inbox]').change(function () {
                $('input[name=checkbox_notification_consolidated]').attr('disabled', false).attr('checked', false);

                if ($(this).is(':checked')) {
                    $('input[name=checkbox_notification_consolidated]').attr('disabled', true).attr('checked', false);
                }
            });

            $('input[name=checkbox_notification_alerts]').change(function () {
                $('input[name=checkbox_notification_consolidated]').attr('disabled', false).attr('checked', false);

                if ($(this).is(':checked')) {
                    $('input[name=checkbox_notification_consolidated]').attr('disabled', true).attr('checked', false);
                }
            });

            $('input[name=checkbox_notification_subscriptions]').change(function () {
                $('input[name=checkbox_notification_consolidated]').attr('disabled', false).attr('checked', false);

                if ($(this).is(':checked')) {
                    $('input[name=checkbox_notification_consolidated]').attr('disabled', true).attr('checked', false);
                }
            });
        }
         catch (objRException) {
            new Log('Laneros setOptions').error(objRException);
        }
    }

    static saveOptions() {
        try {
            let dtLTimeRev = parseInt($('#number_milliseconds').val())
                + (parseInt($('#number_seconds').val()) * 1000)
                + (parseInt($('#number_minutes').val()) * 60 * 1000)
                + (parseInt($('#number_hours').val()) * 60 * 60 * 1000);

            let objLOptions = {
                bolRShowInbox: $('input[name=checkbox_section_inbox]').is(':checked'),
                bolRShowAlerts: $('input[name=checkbox_section_alerts]').is(':checked'),
                bolRShowSubs: $('input[name=checkbox_section_subscriptions]').is(':checked'),
                bolRShowLinks: $('input[name=checkbox_section_links]').is(':checked'),
                bolRShowInfo: $('input[name=checkbox_section_info]').is(':checked'),
                bolRNotificationConsolidated: $('input[name=checkbox_notification_consolidated]').is(':checked'),
                bolRNotificationInbox: $('input[name=checkbox_notification_inbox]').is(':checked'),
                bolRNotificationAlerts: $('input[name=checkbox_notification_alerts]').is(':checked'),
                bolRNotificationSubs: $('input[name=checkbox_notification_subscriptions]').is(':checked'),
                dtRTimeRev: dtLTimeRev > 0 ? dtLTimeRev : 0
            };

            let objLCallBack = function () {
                $('.alert-response').removeClass('bg-green-lightest border-green text-green bg-red-lightest border-red text-red')
                    .addClass('hidden');
                $('.alert-processing').removeClass('hidden').hide().slideDown(function () {
                    $('.alert-processing').addClass('hidden');

                    try {
                        Laneros.setAlarm(dtLTimeRev);
                        new Background();

                        $('.alert-response h4').html(Chrome.getMessage('label_saved_success'));
                        $('.alert-response p').html(Chrome.getMessage('message_saved_success'));
                        $('.alert-response').addClass('bg-green-lightest border-green text-green').removeClass('hidden')
                            .hide().slideDown();
                    } catch (objRException) {
                        new Log('Laneros saveOptions - objLCallBack').error(objRException);

                        $('.alert-response h4').html(Chrome.getMessage('label_saved_error'));
                        $('.alert-response p').html(Chrome.getMessage('message_saved_error'));
                        $('.alert-response').addClass('bg-red-lightest border-red text-red').removeClass('hidden').hide()
                            .slideDown();
                    }
                });
            };

            Chrome.setStorage(objLOptions, objLCallBack);
        } catch (objRException) {
            new Log('Laneros saveOptions').error(objRException);
        }

        return false;
    }

    /**
     * Set new alarm for checking data
     *
     * @param dtRTimeRev
     */
    static setAlarm(dtRTimeRev) {
        let dtLTimeRev = Laneros.getTime(dtRTimeRev);
        let alarmData = {
            name: 'Laneros',
            options: {
                delayInMinutes: 1,
                periodInMinutes: dtLTimeRev.inRMinutes
            }
        };

        Chrome.createAlarm(alarmData.name, alarmData.options);
    }

    setValidator() {
        if ($.validator) {
            $.validator.setDefaults({
                errorElement: 'div',
                highlight: function (element, errorClass, validClass) {
                    $(element).closest('.flex-row').find('label').removeClass('text-green-dark').addClass('text-red');
                    $(element).removeClass('border-green-dark').addClass('border-red');

                    if ($(element).closest('.flex-row').hasClass('mb-8')) {
                        $(element).closest('.flex-row').removeClass('mb-8').addClass('mb-4 pb-1');
                    }
                },
                unhighlight: function (element, errorClass, validClass) {
                    $(element).removeClass('border-red').addClass('border-green-dark');
                    $(element).closest('.flex-row').find('label').removeClass('text-red').addClass('text-green-dark');

                    if ($(element).closest('.flex-row').hasClass('mb-8')) {
                        $(element).closest('.flex-row').removeClass('mb-4 pb-1').addClass('mb-8');
                    }
                },
                errorClass: 'invalid-feedback text-red',
                errorPlacement: function(error, element) {
                    error.appendTo(element.closest('.flex-row'));
                }
            });
        }
    }

    /**
     * Set option page
     */
    setOptionsPage() {
        this.setValidator();

        Chrome.getStorage(this.getDefaults(), this.setOptions);
    }

    /**
     * Set popup page
     */
    setPopupPage() {
        $('body').css('height', 575);

        this.setValidator();
        this.getData();
    }

    /**
     * Show login form
     */
    showLogin() {
        let objLChange = function() {
            $('.section-login #ctrl_pageLogin_password').closest('.flex-row').slideUp();
            $('.section-login #ctrl_pageLogin_remember').attr('checked', false).closest('div').hide();

            if ($('.section-login #ctrl_pageLogin_not_registered').is(':checked')) {
                $('.section-login button[type=submit]').html(Chrome.getMessage('button_register'));
            }

            if ($('.section-login #ctrl_pageLogin_registered').is(':checked')) {
                $('.section-login #ctrl_pageLogin_password').closest('.flex-row').slideDown();
                $('.section-login #ctrl_pageLogin_remember').closest('div').show();
                $('.section-login button[type=submit]').html(Chrome.getMessage('button_login'));
            }
        };

        Chrome.setBadge(0);

        $('.section-login input[name=register]').change(objLChange);
        $('#pageLogin').validate({
            submitHandler: function (form) {
                let onBeforeSubmit = function(objRResponse, stRStatus) {
                    $('.alert-message').slideUp();
                };

                let onSuccess = function(objRResponse, stRStatus) {
                    if (objRResponse._redirectStatus === 'ok') {
                        $('.section-login').fadeOut('fast', Laneros.showPopup);
                    }
                    if (objRResponse.title === 'Error') {
                        $('.alert-message').slideDown();
                        $('.alert-message p').html(Chrome.getMessage('text_error_login'));
                    }
                };

                let onError = function (objRResponse, stRStatus) {
                    $('.alert-message').slideDown();
                    $('.alert-message p').html(Chrome.getMessage('text_error_message'));
                };

                $(form).ajaxSubmit({
                    beforeSubmit: onBeforeSubmit,
                    success: onSuccess,
                    error: onError,
                    dataType: 'json'
                });

                return false;
            }
        });

        $('.loading-box').fadeOut(function() {
            $('body').css('height', 'auto');
            $('.section-login').removeClass('hidden').hide().fadeIn('fast', function() {
                $('.section-login #ctrl_pageLogin_login').focus();
            });
        });
    }

    /**
     * Show popup
     *
     * @param objRData
     */
    showPopup(objRData) {
        let objRLaneros = this;

        $('.loading-box').fadeOut('slow', function() {
            $('body').css('height', 'auto');
            $('.section-user').removeClass('hidden').hide().fadeIn('fast');
            $('html, body').animate({ scrollTop: 0 }, 'slow');

            $('.user-id').attr('href', $('.user-id').attr('href') + objRLaneros.getUserData('inRUserId'));

            $('.token-link').attr('href', $('.token-link').attr('href') + objRLaneros.getUserData('stRToken'));
            $('.token-value').val(objRLaneros.getUserData('stRToken'));

            $('#statusPoster').attr('action', $('#statusPoster').attr('action') +
                objRLaneros.getUserData('stRUsername') + '.' +
                objRLaneros.getUserData('inRUserId') + '/post');
            $('#statusPoster').validate({
                submitHandler: function (form) {
                    let onBeforeSubmit = function (objRResponse, stRStatus) {
                        $('.alert-user-message').slideUp();
                    };

                    let onSuccess = function (objRResponse, stRStatus) {
                        if (objRResponse._redirectStatus === 'ok') {
                            $('.alert-user-message').slideDown();
                            $('.alert-user-message').addClass('bg-green-lightest border-green text-green')
                                .removeClass('bg-red-lightest border-red text-red');
                            $('.alert-user-message h4').html(Chrome.getMessage('label_success_message'));
                            $('.alert-user-message p').html(objRResponse._redirectMessage);
                        } else {
                            $('.alert-user-message').slideDown();
                            $('.alert-user-message').addClass('bg-red-lightest border-red text-red')
                                .removeClass('bg-green-lightest border-green text-green');
                            $('.alert-user-message h4').html(Chrome.getMessage('label_error_message'));
                            $('.alert-user-message p').html(objRResponse.error.message);
                        }
                    };

                    let onError = function (objRResponse, stRStatus) {
                        $('.alert-user-message').slideDown();
                        $('.alert-user-message hj4').html(Chrome.getMessage('label_error_message'));
                        $('.alert-user-message p').html(Chrome.getMessage('text_error_message'));
                    };

                    $(form).ajaxSubmit({
                        beforeSubmit: onBeforeSubmit,
                        success: onSuccess,
                        error: onError,
                        dataType: 'json'
                    });

                    return false;
                }
            });

            $('#ctrl_pageStatus_visible').click(function() {
                let onBeforeSubmit = function(objRResponse, stRStatus) {
                    $('.alert-home-message').slideUp();
                };
                let onSuccess = function(objRResponse, stRStatus) {
                    if (objRResponse._redirectStatus === 'ok') {
                        $('.alert-home-message').slideDown();
                        $('.alert-home-message').addClass('bg-green-lightest border-green text-green')
                            .removeClass('bg-red-lightest border-red text-red');
                        $('.alert-home-message h4').html(Chrome.getMessage('label_success_message'));
                        $('.alert-home-message p').html(objRResponse._redirectMessage);
                    }
                    else {
                        $('.alert-home-message').slideDown();
                        $('.alert-home-message').addClass('bg-red-lightest border-red text-red')
                            .removeClass('bg-green-lightest border-green text-green');
                        $('.alert-home-message h4').html(Chrome.getMessage('label_error_message'));
                        $('.alert-home-message p').html(objRResponse._redirectMessage);
                    }
                };

                let onError = function (objRResponse, stRStatus) {
                    $('.alert-home-message').slideDown();
                    $('.alert-home-message h4').html(Chrome.getMessage('label_error_message'));
                    $('.alert-home-message p').html(Chrome.getMessage('text_error_message'));
                };

                $('#visibilityForm').ajaxSubmit({
                    beforeSubmit: onBeforeSubmit,
                    success: onSuccess,
                    error: onError,
                    dataType: 'json'
                });
            });

            if ($('input[name=visible]', objRData).is(':checked')) {
                $('#ctrl_pageStatus_visible').attr('checked', true);
            }

            $('#message').on('focus', function() {
                $('#statusPoster').find('.status-message').removeClass('hidden');
                $('html, body').animate({ scrollTop: $(document).height() }, 'slow');
            }).on('keyup', function() {
                let inLTextChars = $(this).val().length;

                if (inLTextChars <= 140) {
                    $('#statusPoster').find('.status-length').html(140 - inLTextChars);
                }
                else {
                    $(this).val($(this).val().substr(0, 140));
                    $('#statusPoster').find('.status-length').html(0);
                }

                if (inLTextChars > 100) {
                    $('#statusPoster').find('.status-length').removeClass('text-green').addClass('text-orange');
                }
                if (inLTextChars > 120) {
                    $('#statusPoster').find('.status-length').removeClass('text-green text-orange').addClass('text-red');
                }
            });

            $('.tab-list a').click(function() {
                if ($(this).hasClass('button-options')) {
                    Chrome.createTab(1,'views/options.html');

                    return false;
                }
                else {
                    let stLActiveTab = $(this).attr('href').replace('#', '');
                    let objLTabOptions = { stRActiveTab: stLActiveTab };
                    let objLActiveTab = function(stRActiveTab) {
                        switch(stRActiveTab) {
                            case 'home':
                                $('html, body').animate({ scrollTop: 0 }, 'slow');

                                $('#statusPoster').find('.status-message').addClass('hidden');
                                $('#statusPoster').find('.status-length').removeClass('text-orange text-red')
                                    .addClass('text-green').html(140);

                                $('.alert-user-message').hide().addClass('hidden').removeClass('bg-green-lightest border-green text-green')
                                    .removeClass('bg-red-lightest border-red text-red');
                                break;
                            case 'inbox':
                                objRLaneros.getConversations();
                                break;
                            case 'alerts':
                                objRLaneros.getAlerts();
                                break;
                            case 'subscriptions':
                                objRLaneros.getSubscriptions();
                                break;
                        }
                    };

                    Chrome.setStorage(objLTabOptions, objLActiveTab(stLActiveTab));

                    $('.tab-list a').removeClass('text-white bg-blue hover:bg-blue-dark')
                        .addClass('text-blue hover:bg-grey-lightest');

                    $(this).addClass('text-white bg-blue hover:bg-blue-dark')
                        .removeClass('text-blue hover:bg-grey-lightest');

                    $('.tab-content .tab').addClass('hidden');
                    $('#' + stLActiveTab).removeClass('hidden').hide().fadeIn();
                }
            });

            Chrome.getStorage({bolRShowLinks: objRLaneros.getDefaults('bolRShowLinks')},
                function(objROptions) {
                    $('.home-tab-nav').addClass('hidden');
                    $('.inbox-tab-nav').removeClass('hidden');

                    if (objROptions.bolRShowLinks) {
                        $('.home-tab-nav').removeClass('hidden');
                    }
                });

            Chrome.getStorage({bolRShowInbox: objRLaneros.getDefaults('bolRShowInbox')},
                function (objROptions) {
                    $('.inbox-tab-nav').addClass('hidden');
                    $('.alerts-tab-nav').removeClass('hidden');

                    if (objROptions.bolRShowInbox) {
                        $('.inbox-tab-nav').removeClass('hidden');

                    }
                });

            Chrome.getStorage({bolRShowAlerts: objRLaneros.getDefaults('bolRShowAlerts')},
                function (objROptions) {
                    $('.alerts-tab-nav').addClass('hidden');
                    $('.subscriptions-tab-nav').removeClass('hidden');

                    if (objROptions.bolRShowAlerts) {
                        $('.alerts-tab-nav').removeClass('hidden');

                    }
                });

            Chrome.getStorage({bolRShowSubs: objRLaneros.getDefaults('bolRShowSubs')},
                function (objROptions) {
                    $('.subscriptions-tab-nav-nav').addClass('hidden');

                    if (objROptions.bolRShowSubs) {
                        $('.subscriptions-tab-nav').removeClass('hidden');

                    }
                });

            Chrome.getStorage({stRActiveTab: objRLaneros.getDefaults('stRActiveTab')},
                function (objROptions) {
                    let stLActiveTab = $('a[href="#' + objROptions.stRActiveTab + '"]');

                    if (!$(stLActiveTab).closest('li').hasClass('hidden')) {
                        $(stLActiveTab).addClass('text-white bg-blue hover:bg-blue-dark')
                            .removeClass('text-blue hover:bg-grey-lightest');
                        $('#' + objROptions.stRActiveTab).removeClass('hidden');
                    }
                    else {
                        let stLTabId = $('.tab-list').find('li:first:not(:hidden) a').attr('href');
                        $('.tab-list').find('li:first:not(:hidden) a').addClass('text-white bg-blue hover:bg-blue-dark')
                            .removeClass('text-blue hover:bg-grey-lightest');
                        $(stLTabId).removeClass('hidden');
                    }
                });
        });
    }

    /**
     * Get Extension Data
     */
    getData() {
        let objRLaneros = this;
        let objLFail = function(objRjqXHR, stRTextStatus, objRErrorThrown) {
            $('.loading-box').hide();

            try {
                if (objRjqXHR.status === 403) {
                    objRLaneros.showLogin();
                } else {
                    $('.loading-box').fadeOut(function () {
                        $('body').css('height', 'auto');
                        $('.section-error').removeClass('hidden');
                    });
                }
            }
            catch(objRException) {
                new Log('ajax-success').error(objRException);
            }
        };

        let objLSuccess = function(objRData, stRTextStatus, objRjqXHR) {
            try {
                let stLToken = $('input[name=_xfToken]:first', objRData).val();
                let inRConversations = parseInt($('#VisitorExtraMenu_ConversationsCounter:first .Total', objRData).text());
                let inRAlerts = parseInt($('#VisitorExtraMenu_AlertsCounter:first .Total', objRData).text());
                let inRSubscriptions = parseInt($('.discussionListItems li.unread', objRData).length);
                let inLCounter = inRConversations + inRAlerts + inRSubscriptions;

                objRLaneros.setUserData({
                    stRToken: stLToken,
                    inRUserId: stLToken.split(',').shift(),
                    stRUsername: $('#AccountMenu .primaryContent h3 a', objRData).html(),
                    stRUserTitle: $('#AccountMenu .primaryContent .muted', objRData).html(),
                    inRConversations: inRConversations,
                    inRAlerts: inRAlerts,
                    inRSubscriptions: inRSubscriptions,
                    inRCounter: inLCounter
                });

                Chrome.getBadge(function (inRBadgeCounter) {
                    Chrome.setBadge(inLCounter);

                    if (parseInt(inRBadgeCounter) < inLCounter) {
                        Chrome.getStorage({bolRNotificationConsolidated: objRLaneros.getDefaults('bolRNotificationConsolidated')},
                            function (objROptions) {
                                if (objROptions.bolRNotificationConsolidated) {
                                    objRLaneros.createListNotification(inRConversations, inRAlerts, inRSubscriptions);
                                }
                            });
                    }
                });

                objRLaneros.getAccount($('#AccountMenu', objRData));
                objRLaneros.getConversations();
                objRLaneros.getAlerts();
                objRLaneros.getSubscriptions();

                if (inRConversations > 0) {
                    $('.inbox-counter').removeClass('hidden').html(inRConversations);
                }

                if (inRAlerts > 0) {
                    $('.alert-counter').removeClass('hidden').html(inRAlerts);
                }

                if (inRSubscriptions > 0) {
                    $('.subscription-counter').removeClass('hidden').html(inRSubscriptions);
                }

                objRLaneros.showPopup(objRData);
            }
            catch(objRException) {
                new Log('ajax-success').error(objRException);
            }
        };

        $.get(this.getPageURL() + 'watched/threads/all').done(objLSuccess).fail(objLFail);
    }

    /**
     * Set user data
     *
     * @param objRUserData
     */
    setUserData(objRUserData) {
        this._userData = objRUserData;
    }

    /**
     * Load user data
     *
     * @param stROption
     * @returns {*}
     */
    getUserData(stROption) {
        if (stROption !== undefined) {
            return this._userData[stROption];
        }

        return this._userData;
    }


    /**
     * Show List Notification Popup
     *
     * @param inRConversations
     * @param inRAlerts
     * @param inRSubscriptions
     */
     createListNotification(inRConversations, inRAlerts, inRSubscriptions) {
        let objLLaneros = this;
        let objLListener = function (stRNotificationID, inRButtonIndex) {
            let objLCallBack;

            switch (inRButtonIndex) {
                case 0:
                    objLCallBack = function (objRTabResult) {
                        let arrLResult = objRTabResult.shift();

                        if (objRTabResult.length === 0) {
                            Chrome.createTab(2, objLLaneros.getPageURL(), function (objRTab) {});
                        } else {
                            Chrome.highlightTab(arrLResult.windowId, arrLResult.index);
                        }
                    };

                    Chrome.queryTab(objLLaneros.getPageURL(), objLCallBack);
                    break;
                default:
                    objLCallBack = function (objRTabResult) {
                        let arrLResult = objRTabResult.shift();

                        if (objRTabResult.length === 0) {
                            Chrome.createTab(2, objLLaneros.getPageURL() + 'account', function (objRTab) {});
                        } else {
                            Chrome.highlightTab(arrLResult.windowId, arrLResult.index);
                        }
                    };

                    Chrome.queryTab(objLLaneros.getPageURL() + 'account', objLCallBack);
                    break;
            }
        };
        let objLListListener = function(objRNotificationID) {
            chrome.notifications.onButtonClicked.addListener(objLListener);
        };

        let objLItems = [];
        let objLConversation = {
            title: Chrome.getMessage('label_conversations'),
            message: Chrome.getMessage('message_zero_inbox')
        };
        let objLAlert = {
            title: Chrome.getMessage('label_alerts'),
            message: Chrome.getMessage('message_zero_alerts')
        };
        let objLSubscription = {
            title: Chrome.getMessage('label_subscriptions'),
            message: Chrome.getMessage('message_zero_subscriptions')
        };

        if (inRConversations > 0) {
            objLConversation.message = inRConversations + ' ' + Chrome.getMessage('text_new_conversation');
        }
        if (inRAlerts > 0) {
            objLAlert.message = inRAlerts + ' ' + Chrome.getMessage('text_new_alert');
        }
        if (inRSubscriptions > 0) {
            objLSubscription.message = inRSubscriptions + ' ' + Chrome.getMessage('text_new_subscription');
        }

        objLItems.push(objLConversation);
        objLItems.push(objLAlert);
        objLItems.push(objLSubscription);

        Chrome.sendNotification('Laneros', {
            type: 'list',
            title: Chrome.getMessage('extension_name'),
            message: Chrome.getMessage('extension_description'),
            iconUrl: '../assets/img/icon.png',
            items: objLItems,
            buttons: [{title: Chrome.getMessage('button_homepage')},
                {title: Chrome.getMessage('button_account')}]
        }, objLListListener, true);
    }
    /**
     * Show Basic Notification Popup
     *
     * @param stRTarget
     * @param objROptions
     */
    createBasicNotification(stRTarget, objROptions) {
        let objLLaneros = this;
        let stLTarget = stRTarget.charAt(0).toUpperCase() + stRTarget.slice(1);

        let objLClickedListener = function (stRNotificationID, inRButtonIndex) {
            let objLCallBack = function (objRTabResult) {
                let arrLResult = objRTabResult.shift();

                if (objRTabResult.length === 0) {
                    Chrome.createTab(2, objROptions.stRMessageURL);
                } else {
                    Chrome.highlightTab(arrLResult.windowId, arrLResult.index);
                }
            };

            Chrome.queryTab(objROptions.stRMessageURL, objLCallBack);
        };

        switch (stRTarget) {
            case 'messages':
                let objLMessagesListener = function(objRNotificationID) {
                    chrome.notifications.onClicked.addListener(objLClickedListener);
                    chrome.notifications.onButtonClicked.addListener(objLClickedListener);
                };

                Chrome.sendNotification('Laneros' + stLTarget + objROptions.inRMessageID, {
                    type: 'basic',
                    title: objROptions.stRMessageTitle,
                    message: objROptions.stRMessage,
                    iconUrl: objROptions.stRMessageIcon,
                    buttons: [{title: Chrome.getMessage('button_open_message')}]
                }, objLMessagesListener, true);
                break;
            case 'alerts':
                let objLAlertsListener = function(objRNotificationID) {
                    chrome.notifications.onClicked.addListener(objLClickedListener);
                };

                Chrome.sendNotification('Laneros' + stLTarget + objROptions.inRMessageID, {
                    type: 'basic',
                    title: objROptions.stRMessageTitle,
                    message: objROptions.stRMessage,
                    iconUrl: objROptions.stRMessageIcon
                }, objLAlertsListener, true);
                break;
            case 'subscriptions':
                let objLSubsButtonListener = function (stRNotificationID, inRButtonIndex) {
                    let objLCallBack;

                    switch (inRButtonIndex) {
                        case 0:
                            objLCallBack = function (objRTabResult) {
                                let arrLResult = objRTabResult.shift();

                                if (objRTabResult.length === 0) {
                                    Chrome.createTab(2, objLLaneros.getPageURL(), function (objRTab) {});
                                } else {
                                    Chrome.highlightTab(arrLResult.windowId, arrLResult.index);
                                }
                            };

                            Chrome.queryTab(objLLaneros.getPageURL() + 'watched/threads/all', objLCallBack);
                            break;
                        default:
                            objLClickedListener();
                            break;
                    }
                };
                let objLSubsListener = function(objRNotificationID) {
                    chrome.notifications.onClicked.addListener(objLClickedListener);
                    chrome.notifications.onButtonClicked.addListener(objLSubsButtonListener);
                };

                Chrome.sendNotification('Laneros' + stLTarget + objROptions.inRMessageID, {
                    type: 'basic',
                    title: objROptions.stRMessageTitle,
                    message: objROptions.stRMessage,
                    iconUrl: objROptions.stRMessageIcon,
                    buttons: [{title: Chrome.getMessage('button_open_subscriptions')},
                        {title: Chrome.getMessage('button_open_subscription')}]
                }, objLSubsListener, true);
                break;
        }
    }

    /**
     * Get Account Data
     *
     * @param objRAccount
     */
    getAccount(objRAccount) {
        let objRLaneros = this;

        Chrome.getStorage({bolRShowInfo: objRLaneros.getDefaults('bolRShowInfo') }, function (objROptions) {
            if (objROptions.bolRShowInfo) {
                let objLShowInfo = $('.section-user .user-info-container');
                let objLAccount = document.createElement('div');

                $(objLAccount).load(objRLaneros.getPageURL() + 'forums/.visitorPanel', function(objRData) {
                    if (objRData) {
                        let objLUserInfo = $(objLShowInfo).find('.user-info');
                        let objLUserData = $(objLShowInfo).find('.user-data');

                        let stLAvatar = $('.secondaryContent .avatar img', objRData).attr('src');
                        let inLMessages = $('.visitorText dl:first dd', objRData).html();
                        let inLRatingPositive = $('.visitorText dl:eq(1) dd', objRData).html();
                        let inLPoints = $('.visitorText dl:eq(2) dd', objRData).html();
                        let inLFeedbackPositive = $('.feedbackStats .Positive:first', objRData).text();
                        let inLFeedbackNeutral = $('.feedbackStats .Neutral:first', objRData).text();
                        let inLFeedbackNegative = $('.feedbackStats .Negative:first', objRData).text();

                        if (stLAvatar.indexOf('data/avatars') !== -1 || stLAvatar.indexOf('xenforo/avatars') !== -1) {
                            stLAvatar = objRLaneros.getPageURL() + stLAvatar;
                        }

                        $(objLUserInfo).find('a').html(objRLaneros.getUserData('stRUsername'));
                        $(objLUserInfo).find('small').html(objRLaneros.getUserData('stRUserTitle'));

                        $(objLShowInfo).find('a').each(function () {
                            if ($(this).attr('href').indexOf('members/') !== -1) {
                                $(this).attr('href', $(this).attr('href') +
                                    objRLaneros.getUserData('stRUsername') + '.' +
                                    objRLaneros.getUserData('inRUserId'));
                            }
                        });

                        $(objLShowInfo).find('img').attr('src', stLAvatar);
                        $(objLUserData).find('.user-messages').html(inLMessages);
                        $(objLUserData).find('.user-rating').html(inLRatingPositive);
                        $(objLUserData).find('.user-points').html(inLPoints);
                        $(objLUserData).find('.user-feedback-positive').html(parseInt(inLFeedbackPositive));
                        $(objLUserData).find('.user-feedback-neutral').html(parseInt(inLFeedbackNeutral));
                        $(objLUserData).find('.user-feedback-negative').html(parseInt(inLFeedbackNegative));

                        $('html, body').animate({ scrollTop: 0 }, 'slow');
                        $(objLShowInfo).removeClass('hidden').addClass('flex');
                    }
                });
            }
        });

        Chrome.getStorage({bolRShowLinks: objRLaneros.getDefaults('bolRShowLinks') }, function (objROptions) {
            if (objROptions.bolRShowLinks) {
                $('.user-links').removeClass('hidden');
            }
            else {
                $('.alert-home-message').removeClass('hidden');
            }
        });
    }

    /**
     * Get Conversations
     */
    getConversations() {
        let objLLaneros = this;
        let objLResponse = function(objRResponse) {
            let objLConversations = document.createElement('div');
            let bolLUnread = false;

            $(objLConversations).html(objRResponse.templateHtml);
            $('#inbox').find('.conversation-item:gt(0)').remove();

            if ($(objLConversations).find('.noItems').length === 0) {
                $(objLConversations).find('.listItem').each(function () {
                    let objLConversation = $('#inbox').find('.conversation-item:first').clone();
                    let stLMessageTitle = $(this).find('.listItemText h3.title').html();
                    let objLMessageURL = $(this).find('.listItemText h3.title a');
                    let objLMessageIcon = $(this).find('a.avatar img');
                    let bolLIsUnread = $(this).hasClass('unread');

                    if (bolLIsUnread) {
                        bolLUnread = true;
                        $(objLConversation).find('div:first').removeClass('bg-white').addClass('bg-yellow-lightest');
                    }

                    $(objLConversation).find('a:first').attr('href', $(this).find('a.avatar').attr('href'));
                    $(objLConversation).find('a:first > img').attr('src', $(objLMessageIcon).attr('src'))
                        .attr('alt', $(objLMessageIcon).attr('alt'));

                    $(objLConversation).find('.conversation-body > h6').html(stLMessageTitle);
                    $(objLConversation).find('.conversation-body > h6 > a').html($(objLMessageURL).html());
                    $(objLConversation).find('.conversation-body > p:first').html($(this).find('.posterDate').html());
                    $(objLConversation).find('.conversation-body > p:last small').html($(this).find('.muted:last').html());

                    $(objLConversation).find('a').removeClass().addClass('no-underline text-blue');
                    $(objLConversation).find('h6 a').removeClass('text-blue').addClass('text-grey-darker');
                    $(objLConversation).find('.DateTime').removeClass().addClass('text-orange');

                    $(objLConversation).find('a').each(function () {
                        $(this).attr('target', '_blank');

                        if ($(this).attr('href').indexOf(objLLaneros.getPageURL()) === -1) {
                            $(this).attr('href', objLLaneros.getPageURL() + $(this).attr('href'));
                        }
                    });

                    $(objLConversation).find('img').each(function () {
                        if ($(this).attr('src').indexOf('data/avatars') !== -1 ||
                            $(this).attr('src').indexOf('xenforo/avatars') !== -1) {
                            $(this).attr('src', objLLaneros.getPageURL() + $(this).attr('src'));
                        }
                    });

                    $('html, body').animate({ scrollTop: 0 }, 'slow');
                    $(objLConversation).removeClass('hidden').appendTo('#inbox .conversation-container');

                    Chrome.getStorage({bolRNotificationInbox: objLLaneros.getDefaults('bolRNotificationInbox') },
                        function (objROptions) {
                            if (objROptions.bolRNotificationInbox && bolLUnread) {
                                let arrLMessage = $(objLMessageURL).attr('href').split('/');
                                let arrLMessageID = arrLMessage[1].split('.');
                                let inLMessageID = arrLMessageID.pop();

                                let objLOptions = {
                                    stRMessageTitle: $(objLMessageURL).html(),
                                    stRMessage: Chrome.getMessage('label_new_messages'),
                                    stRMessageIcon: objLLaneros.getPageURL() + $(objLMessageIcon).attr('src'),
                                    stRMessageURL: objLLaneros.getPageURL() + $(objLMessageURL).attr('href'),
                                    inRMessageID: inLMessageID,
                                };

                                objLLaneros.createBasicNotification('messages', objLOptions);
                            }
                        });
                });
            }
            if ($(objLConversations).find('.noItems').length !== 0 || !bolLUnread) {
                $('#inbox').find('.alert-inbox-message').removeClass('hidden');
            }
        };

        $.getJSON(objLLaneros.getPageURL() + 'conversations/popup?_xfResponseType=json&_xfNoRedirect=1&_xfToken='  +
            objLLaneros.getUserData('stRToken'), objLResponse);
    }

    /**
     * Get Alerts
     */
    getAlerts() {
        let objLLaneros = this;
        let objLResponse = function(objRResponse) {
            let objLAlerts = document.createElement('div');
            let bolLUnread = false;

            $(objLAlerts).html(objRResponse.templateHtml);
            $('#alerts').find('.alert-item:gt(0)').remove();

            if ($(objLAlerts).find('.noItems').length === 0) {
                $(objLAlerts).find('.listItem').each(function () {
                    $(this).find(".listItemText abbr, .listItemText .newIcon").remove();

                    let objLAlert = $('#alerts').find('.alert-item:first').clone();
                    let stLMessageTitle = $(this).find('.listItemText h3').html();
                    let objLMessageURL = $(this).find('.listItemText h3 a');
                    let objLMessageIcon = $(this).find('a.avatar img');
                    let bolLIsUnread = $(this).hasClass('new');

                    if (bolLIsUnread) {
                        bolLUnread = true;
                        $(objLAlert).find('div:first').removeClass('bg-white').addClass('bg-yellow-lightest');
                    }

                    $(objLAlert).find('a:first').attr('href', $(this).find('a.avatar').attr('href'));
                    $(objLAlert).find('a:first > img').attr('src', $(objLMessageIcon).attr('src'))
                        .attr('alt', $(objLMessageIcon).attr('alt'));

                    $(objLAlert).find('.alert-body > p').html(stLMessageTitle);

                    $(objLAlert).find('a').removeClass().addClass('no-underline text-blue');
                    $(objLAlert).find('h6 a').removeClass('text-blue').addClass('text-grey-darker');
                    $(objLAlert).find('.DateTime').removeClass().addClass('text-orange');

                    $(objLAlert).find('a').each(function () {
                        $(this).attr('target', '_blank');

                        if ($(this).attr('href').indexOf(objLLaneros.getPageURL()) === -1) {
                            $(this).attr('href', objLLaneros.getPageURL() + $(this).attr('href'));
                        }
                    });

                    $(objLAlert).find('img').each(function () {
                        if ($(this).attr('src').indexOf('data/avatars') !== -1 ||
                            $(this).attr('src').indexOf('xenforo/avatars') !== -1) {
                            $(this).attr('src', objLLaneros.getPageURL() + $(this).attr('src'));
                        }
                    });

                    $('html, body').animate({ scrollTop: 0 }, 'slow');
                    $(objLAlert).removeClass('hidden').appendTo('#alerts .alert-container');

                    Chrome.getStorage({bolRNotificationAlerts: objLLaneros.getDefaults('bolRNotificationAlerts') },
                        function (objROptions) {
                            if (objROptions.bolRNotificationAlerts && bolLUnread) {
                                let arrLMessage = $(objLMessageURL).attr('href').split('/');
                                let arrLMessageID = arrLMessage[1].split('.');
                                let inLMessageID = arrLMessageID.pop();

                                let objLOptions = {
                                    stRMessageTitle: Chrome.getMessage('label_new_alerts'),
                                    stRMessage: $(objLMessageURL).text(),
                                    stRMessageIcon: objLLaneros.getPageURL() + $(objLMessageIcon).attr('src'),
                                    stRMessageURL: objLLaneros.getPageURL() + 'account/alerts',
                                    inRMessageID: inLMessageID,
                                };

                                objLLaneros.createBasicNotification('alerts', objLOptions);
                            }
                        });
                });
            }
            if ($(objLAlerts).find('.noItems').length !== 0 || !bolLUnread) {
                $('#alerts').find('.alert-alerts-message').removeClass('hidden');
            }
        };

        $.getJSON(objLLaneros.getPageURL() + 'account/alerts-popup?_xfResponseType=json&_xfNoRedirect=1&_xfToken='  +
            objLLaneros.getUserData('stRToken'), objLResponse);
    }

    /**
     * Get Subscriptions
     */
    getSubscriptions() {
        let objLLaneros = this;
        let objLResponse = function(objRResponse) {
            let objRThreads = document.createElement('div');
            let bolLUnread = false;

            $(objRThreads).html(objRResponse.templateHtml);
            $('#subscriptions').find('.thread-item:gt(0)').remove();

            if ($(objRThreads).find('.noItems').length === 0) {
                $(objRThreads).find('.discussionListItem').each(function () {
                    $(this).find("input, .itemPageNav, .controls, .stats, .iconKey").remove();

                    let objLThread = $('#subscriptions').find('.thread-item:first').clone();
                    let stLMessageTitle = $(this).find('.titleText h3.title').html();
                    let objLMessageURL = $(this).find('.titleText h3.title a');
                    let objLMessageIcon = $(this).find('a.avatar img');
                    let bolLIsUnread = $(this).hasClass('unread');

                    if (bolLIsUnread) {
                        bolLUnread = true;
                        $(objLThread).find('div:first').removeClass('bg-white').addClass('bg-yellow-lightest');
                    }

                    $(objLThread).find('a:first').attr('href', $(this).find('a.avatar').attr('href'));
                    $(objLThread).find('a:first > img').attr('src', $(objLMessageIcon).attr('src'))
                        .attr('alt', $(objLMessageIcon).attr('alt'));

                    $(objLThread).find('.thread-body > h6').html(stLMessageTitle);
                    $(objLThread).find('.thread-body > h6 > a').html($(objLMessageURL).html());
                    $(objLThread).find('.thread-body > p:first').html($(this).find('.posterDate').html());
                    $(objLThread).find('.thread-body .message-info .message-by').html($(this).find('.lastPostInfo dt:first').html());
                    $(objLThread).find('.thread-body .message-info .message-at').html($(this).find('.lastPostInfo dd.muted').html());

                    $(objLThread).find('a').removeClass().addClass('no-underline text-blue');
                    $(objLThread).find('h6 a').removeClass('text-blue').addClass('text-grey-darker');
                    $(objLThread).find('.DateTime').removeClass().addClass('text-orange');

                    $(objLThread).find('a').each(function () {
                        $(this).attr('target', '_blank');

                        if ($(this).attr('href').indexOf(objLLaneros.getPageURL()) === -1) {
                            $(this).attr('href', objLLaneros.getPageURL() + $(this).attr('href'));
                        }
                    });

                    $(objLThread).find('img').each(function () {
                        if ($(this).attr('src').indexOf('data/avatars') !== -1 ||
                            $(this).attr('src').indexOf('xenforo/avatars') !== -1) {
                            $(this).attr('src', objLLaneros.getPageURL() + $(this).attr('src'));
                        }
                    });

                    $('html, body').animate({ scrollTop: 0 }, 'slow');
                    $(objLThread).removeClass('hidden').appendTo('#subscriptions .thread-container');

                    Chrome.getStorage({bolRNotificationSubs: objLLaneros.getDefaults('bolRNotificationSubs') },
                        function (objROptions) {
                            if (objROptions.bolRNotificationSubs && bolLisUnread) {
                                let arrLMessage = $(objLMessageURL).attr('href').split('/');
                                let arrLMessageID = arrLMessage[1].split('.');
                                let inLMessageID = arrLMessageID.pop();

                                let objLOptions = {
                                    stRMessageTitle: Chrome.getMessage('label_new_subscription'),
                                    stRMessage: $(objLMessageURL).text(),
                                    stRMessageIcon: objLLaneros.getPageURL() + $(objLMessageIcon).attr('src'),
                                    stRMessageURL: objLLaneros.getPageURL() + $(objLMessageURL).attr('href'),
                                    inRMessageID: inLMessageID,
                                };

                                objLLaneros.createBasicNotification('subscriptions', objLOptions);
                            }
                        });
                });
            }
            if ($(objRThreads).find('.noItems').length !== 0 || !bolLUnread) {
                $('#subscriptions').find('.alert-subscriptions-message').removeClass('hidden');
            }
        };

        $.getJSON(objLLaneros.getPageURL() + 'watched/threads/all?_xfResponseType=json&_xfNoRedirect=1&_xfToken='  +
            objLLaneros.getUserData('stRToken'), objLResponse);

    }
}