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
            bolRDarkMode: false,
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

        $(document).ajaxStop(function(objLData1, objLData2, objLData3) {
            $('.loading-box').fadeOut();
            $('body').css('height', 'auto');
            $('html, body').animate({ scrollTop: 0 }, 'fast');
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
            new Log('getTime').error(objRException);
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

            if (objROptions.bolRDarkMode) {
                $('#checkbox_dark_mode').attr('checked', true);
            }

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
            new Log('setOptions').error(objRException);
        }
    }

    static saveOptions() {
        try {
            let dtLTimeRev = parseInt($('#number_milliseconds').val())
                + (parseInt($('#number_seconds').val()) * 1000)
                + (parseInt($('#number_minutes').val()) * 60 * 1000)
                + (parseInt($('#number_hours').val()) * 60 * 60 * 1000);

            let objLOptions = {
                bolRDarkMode: $('input[name=checkbox_dark_mode]').is(':checked'),
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
                        new Log('saveOptions - objLCallBack').error(objRException);

                        $('.alert-response h4').html(Chrome.getMessage('label_saved_error'));
                        $('.alert-response p').html(Chrome.getMessage('message_saved_error'));
                        $('.alert-response').addClass('bg-red-lightest border-red text-red').removeClass('hidden').hide()
                            .slideDown();
                    }
                });
            };

            Chrome.setStorage(objLOptions, objLCallBack);
        } catch (objRException) {
            new Log('saveOptions').error(objRException);
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
        let objRLaneros = this;
        this.setValidator();

        Chrome.getStorage({bolRDarkMode: objRLaneros.getDefaults('bolRDarkMode') },
            function (objROptions) {
                if (objROptions.bolRDarkMode) {
                    $('body').addClass('dark-mode');
                }
            });

        Chrome.getStorage(this.getDefaults(), this.setOptions);
    }

    /**
     * Set popup page
     */
    setPopupPage() {
        let objRLaneros = this;
        $('body').css('height', 575);

        Chrome.getStorage({bolRDarkMode: objRLaneros.getDefaults('bolRDarkMode') },
            function (objROptions) {
                if (objROptions.bolRDarkMode) {
                    $('body').addClass('dark-mode');
                }
            });

        this.setValidator();
        this.getData();
    }

    /**
     * Show login form
     *
     * @param stRToken
     */
    showLogin(stRToken) {
        let objRLaneros = this;
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
        $('.section-login input[name=_xfToken]').val(stRToken);
        $('#pageLogin').validate({
            submitHandler: function (form) {
                let onBeforeSubmit = function(objRResponse, stRStatus) {
                    $('.alert-message').slideUp();
                };

                let onSuccess = function(objRResponse, stRStatus) {
                    if (objRResponse.html !== undefined) {
                        $('.alert-message').slideDown();
                        $('.alert-message p').html(Chrome.getMessage('text_error_login'));
                    }
                    else {
                        $('.section-login').fadeOut('fast', objRLaneros.getData(false));
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
        $('.section-login').removeClass('hidden').hide().fadeIn('fast', function() {
            $('.section-login #ctrl_pageLogin_login').focus();
        });
    }

    /**
     * Show popup
     *
     * @param objRData
     */
    showPopup(objRData) {
        let objRLaneros = this;
        let objLActiveTab = function(stRActiveTab) {
            switch(stRActiveTab) {
                case 'home':
                    $('html, body').animate({ scrollTop: 0 }, 'fast');

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

        $('.section-user').removeClass('hidden').hide().fadeIn('fast');
        $('.user-id').attr('href', $('.user-id').attr('href') + objRLaneros.getUserData('inRUserId'));
        $('.token-link').attr('href', $('.token-link').attr('href') + objRLaneros.getUserData('stRToken'));
        $('.token-value').val(objRLaneros.getUserData('stRToken'));

        if ($.validator) {
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
        }

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

                Chrome.setStorage(objLTabOptions, objLActiveTab(stLActiveTab));

                $('.tab-list a').removeClass('text-white bg-blue hover:bg-blue-dark')
                    .addClass('text-blue hover:bg-grey-lightest');

                $(this).addClass('text-white bg-blue hover:bg-blue-dark')
                    .removeClass('text-blue hover:bg-grey-lightest');

                $('#' + stLActiveTab).find('.loading-data').show();
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
                $('.subscriptions-tab-nav').addClass('hidden');

                if (objROptions.bolRShowSubs) {
                    $('.subscriptions-tab-nav').removeClass('hidden');

                }
            });

        Chrome.getStorage({stRActiveTab: objRLaneros.getDefaults('stRActiveTab')},
            function (objROptions) {
                let stLActiveTab = $('a[href="#' + objROptions.stRActiveTab + '"]');
                let stLTabId;

                if (!$(stLActiveTab).closest('li').hasClass('hidden')) {
                    stLTabId = '#' + objROptions.stRActiveTab;
                    $(stLActiveTab).addClass('text-white bg-blue hover:bg-blue-dark')
                        .removeClass('text-blue hover:bg-grey-lightest');
                }
                else {
                    stLTabId = $('.tab-list').find('li:first:not(:hidden) a').attr('href');
                    $('.tab-list').find('li:first:not(:hidden) a').addClass('text-white bg-blue hover:bg-blue-dark')
                        .removeClass('text-blue hover:bg-grey-lightest');
                }

                $(stLTabId).find('.loading-data').show();
                $(stLTabId).removeClass('hidden');
                objLActiveTab((stLTabId).replace('#', ''))
            });
    }

    /**
     * Set user data
     *
     * @param objRUserData
     */
    setUserData(objRUserData) {
        if (typeof this._userData !== 'undefined') {
            this._userData = Object.assign(this._userData, objRUserData);
        }
        else {
            this._userData = objRUserData;
        }
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
        let objRLaneros = this;
        let objLListener = function (stRNotificationID, inRButtonIndex) {
            let objLCallBack;

            switch (inRButtonIndex) {
                case 0:
                    objLCallBack = function (objRTabResult) {
                        let arrLResult = objRTabResult.shift();

                        if (objRTabResult.length === 0) {
                            Chrome.createTab(2, objRLaneros.getPageURL(), function (objRTab) {});
                        } else {
                            Chrome.highlightTab(arrLResult.windowId, arrLResult.index);
                        }
                    };

                    Chrome.queryTab(objRLaneros.getPageURL(), objLCallBack);
                    break;
                default:
                    objLCallBack = function (objRTabResult) {
                        let arrLResult = objRTabResult.shift();

                        if (objRTabResult.length === 0) {
                            Chrome.createTab(2, objRLaneros.getPageURL() + 'account', function (objRTab) {});
                        } else {
                            Chrome.highlightTab(arrLResult.windowId, arrLResult.index);
                        }
                    };

                    Chrome.queryTab(objRLaneros.getPageURL() + 'account', objLCallBack);
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
        let objRLaneros = this;
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
                                    Chrome.createTab(2, objRLaneros.getPageURL(), function (objRTab) {});
                                } else {
                                    Chrome.highlightTab(arrLResult.windowId, arrLResult.index);
                                }
                            };

                            Chrome.queryTab(objRLaneros.getPageURL() + 'watched/threads/all', objLCallBack);
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
     * Get Extension Data
     */
    getData(bolRAll = false) {
        let objRLaneros = this;
        let objLFail = function(objRjqXHR, stRTextStatus, objRErrorThrown) {
            try {
                if (objRjqXHR.status === 403) {
                    let stLToken = $('input[name=_xfToken]:first', objRjqXHR).val();

                    objRLaneros.showLogin(stLToken);
                } else {
                    $('.section-error').removeClass('hidden');
                }
            }
            catch(objRException) {
                new Log('getData ajax-error').error(objRException);
            }
        };

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

                objRLaneros.getAccount();

                if (bolRAll) {
                    objRLaneros.getConversations();
                    objRLaneros.getAlerts();
                    objRLaneros.getSubscriptions();
                }

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

        $.get(objRLaneros.getPageURL() + 'watched/threads').done(objLSuccess).fail(objLFail);
    }

    /**
     * Get Account Data
     */
    getAccount() {
        let objRLaneros = this;

        Chrome.getStorage({bolRShowInfo: objRLaneros.getDefaults('bolRShowInfo') }, function (objROptions) {
            let objLShowInfo = $('.section-user .user-info-container');

            if (objROptions.bolRShowInfo) {
                let objRData = document.createElement('div');
                let objLResponse = function(objRResponse, stRTextStatus, objRjqXHR) {
                    let objLUserInfo = $(objLShowInfo).find('.user-info');
                    let objLUserData = $(objLShowInfo).find('.user-data');

                    objRData = $(objRResponse.html.content);

                    let stLAvatar = $('.avatarWrapper .avatar img', objRData).attr('src');
                    let inLMessages = $('.contentRow-minor .fauxBlockLink:first dd a', objRData).html();
                    let inLRatingPositive = $('.contentRow-minor .fauxBlockLink:eq(1) dd a', objRData).html();
                    let inLPoints = $('.contentRow-minor .fauxBlockLink:last dd a', objRData).html();
                    let inLFeedbackPositive = $('.feedbackStats .Positive:first', objRData).text();
                    let inLFeedbackNeutral = $('.feedbackStats .Neutral:first', objRData).text();
                    let inLFeedbackNegative = $('.feedbackStats .Negative:first', objRData).text();

                    objRLaneros.setUserData({
                        stRUsername: $('.contentRow-header a.username', objRData).text(),
                        stRUserTitle: $('.contentRow-lesser .userTitle', objRData).text()
                    });

                    $(objLUserInfo).find('a').html(objRLaneros.getUserData('stRUsername'));
                    $(objLUserInfo).find('small').html(objRLaneros.getUserData('stRUserTitle'));

                    $(objLShowInfo).find('a').each(function () {
                        if ($(this).attr('href').indexOf('members/') !== -1) {
                            $(this).attr('href', $(this).attr('href') +
                                objRLaneros.getUserData('stRUsername') + '.' +
                                objRLaneros.getUserData('inRUserId'));
                        }
                    });

                    $('#statusPoster').attr('action', $('#statusPoster').attr('action') +
                        objRLaneros.getUserData('stRUsername') + '.' +
                        objRLaneros.getUserData('inRUserId') + '/post');

                    $(objLShowInfo).find('img').attr('src', stLAvatar);
                    $(objLUserData).find('.user-messages').html(inLMessages);
                    $(objLUserData).find('.user-rating').html(inLRatingPositive);
                    $(objLUserData).find('.user-points').html(inLPoints);
                    $(objLUserData).find('.user-feedback-positive').html(inLFeedbackPositive ? inLFeedbackPositive : 0);
                    $(objLUserData).find('.user-feedback-neutral').html(inLFeedbackNeutral ? inLFeedbackNeutral : 0);
                    $(objLUserData).find('.user-feedback-negative').html(inLFeedbackNegative ? inLFeedbackNegative : 0);

                    $(objLShowInfo).removeClass('invisible').addClass('flex');
                };

                $.getJSON(objRLaneros.getPageURL() + 'account/visitor-menu?_xfResponseType=json&_xfNoRedirect=1&_xfToken=' +
                    objRLaneros.getUserData('stRToken'), objLResponse);
            }
            else {
                $(objLShowInfo).addClass('hidden').removeClass('flex');
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
        let objRLaneros = this;
        let objLResponse = function(objRResponse) {
            let objLConversations = document.createElement('div');
            let bolLUnread = false;

            $(objLConversations).html(objRResponse.html.content);
            $('#inbox').find('.conversation-item:gt(0)').remove();
            $('#inbox').find('.loading-data').hide();

            if ($(objLConversations).find('div.menu-row').length === 0) {
                $(objLConversations).find('li.menu-row').each(function () {
                    let objLConversation = $('#inbox').find('.conversation-item:first').clone();

                    let objLMessage = $(this).find('.contentRow-main a.fauxBlockLink-blockLink');
                    let objLMessageFigure = $(this).find('.contentRow-figure');
                    let objLMessageIcon = $(objLMessageFigure).find('a.avatar img');
                    let objLMessageWith = $(this).find('.contentRow-main .contentRow-minor--hideLinks');
                    let objLMessageWithList = $(objLMessageWith).find('ul');
                    let objLMessageTime = $(this).find('.contentRow-main .contentRow-minor--smaller time');
                    let bolLIsUnread = $(this).hasClass('menu-row--highlighted');

                    if (bolLIsUnread) {
                        bolLUnread = true;
                        $(objLConversation).find('div:first').removeClass('bg-white').addClass('bg-yellow-lightest');
                    }

                    $(objLMessageWith).find('ul').remove();

                    $(objLConversation).find('a:first').attr('href', $(objLMessageFigure).find('a.avatar').attr('href'));
                    $(objLConversation).find('a:first > img').attr('src', $(objLMessageIcon).attr('src'))
                        .attr('alt', $(objLMessageIcon).attr('alt'));

                    $(objLConversation).find('.conversation-body > h6 > a').replaceWith(objLMessage);
                    $(objLConversation).find('.conversation-body > p:first span:first').html($(objLMessageWith).text());
                    $(objLConversation).find('.conversation-body > p:last small').html(objLMessageTime);

                    $(objLMessageWithList).find('li').each(function(inRIndex) {
                        let objLAnchor = document.createElement('a');

                        let objLWith = $(objLConversation).find('.conversation-body > p:first');

                        let objLUser = $(this).find('span:first');
                        let stLUsername = $(objLUser).text();
                        let inRUserId = $(objLUser).data('user-id');
                        let stRTitle = $(objLUser).attr('title');

                        $(objLAnchor).html(stLUsername).attr('title', stRTitle).attr('href', 'members/' + stLUsername
                            + '.' + inRUserId);
                        $(objLAnchor).appendTo(objLWith);

                        if (inRIndex < $(objLMessageWithList).find('li').length - 1) {
                            $(objLWith).append(', ');
                        }
                    });

                    $(objLConversation).find('a').removeClass().addClass('no-underline text-blue hover:text-blue-dark');
                    $(objLConversation).find('h6 a').removeClass('text-blue hover:text-blue-dark')
                        .addClass('text-grey-darker hover:text-grey-darkest');
                    $(objLConversation).find('time').removeClass().addClass('text-orange');

                    $(objLConversation).find('a').each(function () {
                        $(this).attr('target', '_blank');

                        if ($(this).attr('href').indexOf(objRLaneros.getPageURL()) === -1) {
                            $(this).attr('href', objRLaneros.getPageURL() + $(this).attr('href'));
                        }
                    });

                    $(objLConversation).removeClass('hidden').appendTo('#inbox .conversation-container');

                    Chrome.getStorage({bolRNotificationInbox: objRLaneros.getDefaults('bolRNotificationInbox') },
                        function (objROptions) {
                            if (objROptions.bolRNotificationInbox && bolLUnread) {
                                let arrLMessage = $(objLMessage).attr('href').split('/');
                                let arrLMessageID = arrLMessage[1].split('.');
                                let inLMessageID = arrLMessageID.pop();

                                let objLOptions = {
                                    stRMessageTitle: $(objLMessage).html(),
                                    stRMessage: Chrome.getMessage('label_new_messages'),
                                    stRMessageIcon: objRLaneros.getPageURL() + $(objLMessageIcon).attr('src'),
                                    stRMessageURL: objRLaneros.getPageURL() + $(objLMessage).attr('href'),
                                    inRMessageID: inLMessageID,
                                };

                                objRLaneros.createBasicNotification('messages', objLOptions);
                            }
                        });
                });
            }
            if ($(objLConversations).find('div.menu-row').length !== 0 || !bolLUnread) {
                $('#inbox').find('.alert-inbox-message').removeClass('hidden');
            }
        };

        $.getJSON(objRLaneros.getPageURL() + 'conversations/popup?_xfResponseType=json&_xfNoRedirect=1&_xfToken='  +
            objRLaneros.getUserData('stRToken'), objLResponse);
    }

    /**
     * Get Alerts
     */
    getAlerts() {
        let objRLaneros = this;
        let objLResponse = function(objRResponse) {
            let objLAlerts = document.createElement('div');
            let bolLUnread = false;

            $(objLAlerts).html(objRResponse.html.content);
            $('#alerts').find('.alert-item:gt(0)').remove();
            $('#alerts').find('.loading-data').hide();

            if ($(objLAlerts).find('div.menu-row').length === 0) {
                $(objLAlerts).find('li.menu-row').each(function () {
                    let objLAlert = $('#alerts').find('.alert-item:first').clone();

                    let objLMessage = $(this).find('.contentRow-main');
                    let objLMessageFigure = $(this).find('.contentRow-figure');
                    let objLMessageIcon = $(objLMessageFigure).find('a.avatar img');
                    let objLMessageTime = $(this).find('.contentRow-main .contentRow-minor--smaller time');
                    let bolLIsUnread = $(this).hasClass('new');

                    if (bolLIsUnread) {
                        bolLUnread = true;
                        $(objLAlert).find('div:first').removeClass('bg-white').addClass('bg-yellow-lightest');
                    }

                    $(objLMessage).find('.contentRow-minor--smaller').remove();

                    $(objLAlert).find('a:first').attr('href', $(objLMessageFigure).find('a.avatar').attr('href'));
                    $(objLAlert).find('a:first > img').attr('src', $(objLMessageIcon).attr('src'))
                        .attr('alt', $(objLMessageIcon).attr('alt'));

                    $(objLAlert).find('.alert-body > p:first').html($(objLMessage).html());
                    $(objLAlert).find('.alert-body > p:last').html(objLMessageTime);

                    $(objLAlert).find('a').removeClass().addClass('no-underline text-blue hover:text-blue-dark');
                    $(objLAlert).find('time').removeClass().addClass('text-orange');

                    $(objLAlert).find('a').each(function () {
                        $(this).attr('target', '_blank');

                        if ($(this).attr('href').indexOf(objRLaneros.getPageURL()) === -1) {
                            $(this).attr('href', objRLaneros.getPageURL() + $(this).attr('href'));
                        }
                    });

                    $(objLAlert).removeClass('hidden').appendTo('#alerts .alert-container');

                    Chrome.getStorage({bolRNotificationAlerts: objRLaneros.getDefaults('bolRNotificationAlerts') },
                        function (objROptions) {
                            if (objROptions.bolRNotificationAlerts && bolLUnread) {
                                let arrLMessage = $(objLMessage).attr('href').split('/');
                                let arrLMessageID = arrLMessage[1].split('.');
                                let inLMessageID = arrLMessageID.pop();

                                let objLOptions = {
                                    stRMessageTitle: Chrome.getMessage('label_new_alerts'),
                                    stRMessage: $(objLMessage).text(),
                                    stRMessageIcon: objRLaneros.getPageURL() + $(objLMessageIcon).attr('src'),
                                    stRMessageURL: objRLaneros.getPageURL() + 'account/alerts',
                                    inRMessageID: inLMessageID,
                                };

                                objRLaneros.createBasicNotification('alerts', objLOptions);
                            }
                        });
                });
            }
            if ($(objLAlerts).find('div.menu-row').length !== 0 || !bolLUnread) {
                $('#alerts').find('.alert-alerts-message').removeClass('hidden');
            }
        };

        $.getJSON(objRLaneros.getPageURL() + 'account/alerts-popup?_xfResponseType=json&_xfNoRedirect=1&_xfToken='  +
            objRLaneros.getUserData('stRToken'), objLResponse);
    }

    /**
     * Get Subscriptions
     */
    getSubscriptions() {
        let objRLaneros = this;
        let objLResponse = function(objRResponse) {
            let objRThreads = document.createElement('div');
            let bolLUnread = false;

            $(objRThreads).html(objRResponse.html.content);
            $('#subscriptions').find('.thread-item:gt(0)').remove();
            $('#subscriptions').find('.loading-data').hide();

            if ($(objRThreads).find('.structItem--thread').length > 0) {
                $(objRThreads).find('.structItem--thread').each(function () {
                    let objLAnchorUser = document.createElement('a');
                    let objLAnchorTime = document.createElement('a');
                    let objLAnchorForum = document.createElement('a');

                    let objLThread = $('#subscriptions').find('.thread-item:first').clone();

                    let objLMessage = $(this).find('.structItem-cell--main .structItem-title a');
                    let objLMessageFigure = $(this).find('.structItem-cell--icon');
                    let objLMessageIcon = $(objLMessageFigure).find('a.avatar img');

                    let objLParts = $(objLThread).find('.thread-body > p:first');
                    let objLMessagePartsList = $(this).find('.structItem-cell--main .structItem-parts');
                    let objLUser = $(objLMessagePartsList).find('li:first a.username');
                    let objLTime = $(objLMessagePartsList).find('li:eq(1) a');
                    let objLForum = $(objLMessagePartsList).find('li:last a');
                    let stLUsername = $(objLUser).text();
                    let inRUserId = $(objLUser).data('user-id');

                    let objLMessageLatest = $(this).find('.structItem-cell--latest');
                    let bolLIsUnread = $(this).hasClass('is-unread');

                    if (bolLIsUnread) {
                        bolLUnread = true;
                        $(objLThread).find('div:first').removeClass('bg-white').addClass('bg-yellow-lightest');
                    }

                    if ($(this).find('.structItem-secondaryIcon').length > 0) {
                        $(objLThread).addClass('border-l-4 border-blue')
                    }

                    $(objLThread).find('a:first').attr('href', $(objLMessageFigure).find('a.avatar').attr('href'));
                    $(objLThread).find('a:first > img').attr('src', $(objLMessageIcon).attr('src'))
                        .attr('alt', $(objLMessageIcon).attr('alt'));

                    $(objLThread).find('.thread-body > h6 a').replaceWith(objLMessage);

                    $(objLAnchorUser).html(stLUsername).attr('href', 'members/' + stLUsername + '.' + inRUserId);
                    $(objLAnchorUser).appendTo(objLParts);
                    $(objLParts).append(' · ');

                    $(objLAnchorTime).html(objLTime.html()).attr('href', objLTime.attr('href'));
                    $(objLAnchorTime).appendTo(objLParts);
                    $(objLParts).append(' · ');

                    $(objLAnchorForum).html(objLForum.html()).attr('href', objLForum.attr('href'));
                    $(objLAnchorForum).appendTo(objLParts);

                    $(objLThread).find('.thread-body .message-info .message-by').html($(objLMessageLatest).find('.structItem-minor').html());
                    $(objLThread).find('.thread-body .message-info .message-at').replaceWith($(objLMessageLatest).find('a:first'));

                    $(objLThread).find('a').removeClass().addClass('no-underline text-blue hover:text-blue-dark');
                    $(objLThread).find('h6 a').removeClass('text-blue hover:text-blue-dark')
                        .addClass('text-grey-darker hover:text-grey-darkest');
                    $(objLThread).find('time').removeClass().addClass('text-orange hover:text-orange-dark');

                    $(objLThread).find('a').each(function () {
                        $(this).attr('target', '_blank');

                        if ($(this).attr('href').indexOf(objRLaneros.getPageURL()) === -1) {
                            $(this).attr('href', objRLaneros.getPageURL() + $(this).attr('href'));
                        }
                    });

                    $(objLThread).removeClass('hidden').appendTo('#subscriptions .thread-container');

                    Chrome.getStorage({bolRNotificationSubs: objRLaneros.getDefaults('bolRNotificationSubs') },
                        function (objROptions) {
                            if (objROptions.bolRNotificationSubs && bolLIsUnread) {
                                let arrLMessage = $(objLMessage).attr('href').split('/');
                                let arrLMessageID = arrLMessage[1].split('.');
                                let inLMessageID = arrLMessageID.pop();

                                let objLOptions = {
                                    stRMessageTitle: Chrome.getMessage('label_new_subscription'),
                                    stRMessage: $(objLMessage).text(),
                                    stRMessageIcon: objRLaneros.getPageURL() + $(objLMessageIcon).attr('src'),
                                    stRMessageURL: objRLaneros.getPageURL() + $(objLMessage).attr('href'),
                                    inRMessageID: inLMessageID,
                                };

                                objRLaneros.createBasicNotification('subscriptions', objLOptions);
                            }
                        });
                });
            }

            if ($(objRThreads).find('.is-unread').length === 0 || !bolLUnread) {
                $('#subscriptions').find('.alert-subscriptions-message').removeClass('hidden');
            }
        };

        $.getJSON(objRLaneros.getPageURL() + 'watched/threads?_xfResponseType=json&_xfNoRedirect=1&_xfToken='  +
            objRLaneros.getUserData('stRToken'), objLResponse);
    }
}