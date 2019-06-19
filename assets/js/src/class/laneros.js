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
            bolRShowBookmarks: true,
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
            $('body').css('height', 'auto');
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

            if ($.validator) {
                $('#form_options').validate({
                    submitHandler: Laneros.saveOptions
                });
            }

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
            if (objROptions.bolRShowBookmarks) {
                $('#checkbox_section_bookmarks').attr('checked', true);
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
            }1

            $('#number_hours').val(objLReviewTime.inRHours);
            $('#number_minutes').val(objLReviewTime.inRMinutes);
            $('#number_seconds').val(objLReviewTime.inRSeconds);
            $('#number_milliseconds').val(objLReviewTime.inRMilliseconds);

            $('.loading-box').fadeOut(function() {
                $('.options-page').fadeIn();
            });

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
            let objRLaneros = this;
            let dtLTimeRev = parseInt($('#number_milliseconds').val())
                + (parseInt($('#number_seconds').val()) * 1000)
                + (parseInt($('#number_minutes').val()) * 60 * 1000)
                + (parseInt($('#number_hours').val()) * 60 * 60 * 1000);

            let objLOptions = {
                bolRDarkMode: $('input[name=checkbox_dark_mode]').is(':checked'),
                bolRShowInbox: $('input[name=checkbox_section_inbox]').is(':checked'),
                bolRShowAlerts: $('input[name=checkbox_section_alerts]').is(':checked'),
                bolRShowSubs: $('input[name=checkbox_section_subscriptions]').is(':checked'),
                bolRShowBookmarks: $('input[name=checkbox_section_bookmarks]').is(':checked'),
                bolRShowLinks: $('input[name=checkbox_section_links]').is(':checked'),
                bolRShowInfo: $('input[name=checkbox_section_info]').is(':checked'),
                bolRNotificationConsolidated: $('input[name=checkbox_notification_consolidated]').is(':checked'),
                bolRNotificationInbox: $('input[name=checkbox_notification_inbox]').is(':checked'),
                bolRNotificationAlerts: $('input[name=checkbox_notification_alerts]').is(':checked'),
                bolRNotificationSubs: $('input[name=checkbox_notification_subscriptions]').is(':checked'),
                dtRTimeRev: dtLTimeRev > 0 ? dtLTimeRev : 0
            };

            let objLCallBack = function () {
                $('.alert-response').removeClass('bg-green-100 border-green-500 text-green-500 bg-red-100 border-red-500 text-red-500')
                    .addClass('hidden');
                $('.alert-processing').removeClass('hidden').hide().slideDown(function () {
                    $('.alert-processing').addClass('hidden');

                    try {
                        Laneros.setAlarm(dtLTimeRev);
                        new Background();

                        $('.alert-response .alert-title').html(Chrome.getMessage('label_saved_success'));
                        $('.alert-response .alert-text').html(Chrome.getMessage('message_saved_success'));
                        $('.alert-response').addClass('bg-green-100 border-green-500 text-green-500').removeClass('hidden')
                            .hide().slideDown();
                    } catch (objRException) {
                        new Log('saveOptions - objLCallBack').error(objRException);

                        $('.alert-response .alert-title').html(Chrome.getMessage('label_saved_error'));
                        $('.alert-response .alert-text').html(Chrome.getMessage('message_saved_error'));
                        $('.alert-response').addClass('bg-red-100 border-red-500 text-red-500').removeClass('hidden').hide()
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
                    $(element).closest('.flex-row').find('label').removeClass('text-green-600').addClass('text-red-500');
                    $(element).removeClass('border-green-600').addClass('border-red-500');

                    if ($(element).closest('.flex-row').hasClass('mb-8')) {
                        $(element).closest('.flex-row').removeClass('mb-8').addClass('mb-4 pb-1');
                    }
                },
                unhighlight: function (element, errorClass, validClass) {
                    $(element).removeClass('border-red-500').addClass('border-green-600');
                    $(element).closest('.flex-row').find('label').removeClass('text-red-500').addClass('text-green-600');

                    if ($(element).closest('.flex-row').hasClass('mb-8')) {
                        $(element).closest('.flex-row').removeClass('mb-4 pb-1').addClass('mb-8');
                    }
                },
                errorClass: 'invalid-feedback text-red-500',
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
                    let stLImgSrc = $('.logo-img').attr('src');

                    stLImgSrc = stLImgSrc.replace('2x', '2x-blanco');

                    $('body').addClass('dark-mode');
                    $('.logo-img').attr('src', stLImgSrc);
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
                    let stLImgSrc = $('.logo-img').attr('src');

                    stLImgSrc = stLImgSrc.replace('2x', '2x-blanco');

                    $('body').addClass('dark-mode');
                    $('.logo-img').attr('src', stLImgSrc).css('opacity', 0.8);
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

        if ($.validator) {
            $('#pageLogin').validate({
                submitHandler: function (form) {
                    let onBeforeSubmit = function (objRResponse, stRStatus) {
                        $('.alert-message').slideUp();
                    };

                    let onSuccess = function (objRResponse, stRStatus) {
                        if (objRResponse.html !== undefined) {
                            $('.alert-message').slideDown();
                            $('.alert-message p').html(Chrome.getMessage('text_error_login'));
                        } else {
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
        }

        $('.loading-box').fadeOut(function() {
            $('.section-login').fadeIn('fast');
            $('header').removeClass('hidden');
        });
    }

    /**
     * Show popup
     *
     * @param objRData
     */
    showPopup(objRData) {
        let objRLaneros = this;
        let onBeforeSubmit = function (objRResponse, stRStatus) {
            $('.alert-home-message').slideUp();
        };

        let onSuccess = function (objRResponse, stRStatus) {
            if (objRResponse.status === 'ok') {
                $('.alert-home-message').slideDown();
                $('.alert-home-message').addClass('bg-green-100 border-green-500 text-green-500')
                    .removeClass('bg-red-100 border-red-500 text-red-500');
                $('.alert-home-message h4').html(Chrome.getMessage('label_success_message'));
                $('.alert-home-message p').html(objRResponse.message);
            }
            else {
                $('.alert-home-message').slideDown();
                $('.alert-home-message').addClass('bg-red-100 border-red-500 text-red-500')
                    .removeClass('bg-green-100 border-green-500 text-green-500');
                $('.alert-home-message h4').html(Chrome.getMessage('label_error_message'));
                $('.alert-home-message p').html(objRResponse.error.message);
            }
        };

        let onError = function (objRResponse, stRStatus) {
            $('.alert-home-message').slideDown();
            $('.alert-home-message h4').html(Chrome.getMessage('label_error_message'));
            $('.alert-home-message p').html(Chrome.getMessage('text_error_message'));
        };

        let objLActiveTab = function(stRActiveTab) {
            switch(stRActiveTab) {
                case 'home':
                    $('html, body').animate({ scrollTop: 0 }, 'fast');

                    $('#statusPoster').find('.status-message').addClass('hidden');
                    $('#statusPoster').find('.status-length').removeClass('text-orange-500 text-red-500')
                        .addClass('text-green-500').html(140);

                    $('.alert-user-message').hide().addClass('hidden').removeClass('bg-green-100 border-green-500 text-green-500')
                        .removeClass('bg-red-100 border-red-500 text-red-500');
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
                case 'bookmarks':
                    objRLaneros.getBookmarks();
                    break;
            }
        };

        $('.loading-box').fadeOut(function() {
            $('.section-user').fadeIn('fast');
            $('header').removeClass('hidden');
        });

        $('.user-id').attr('href', $('.user-id').attr('href') + objRLaneros.getUserData('inRUserId'));
        $('.token-link').attr('href', $('.token-link').attr('href') + objRLaneros.getUserData('stRToken'));
        $('.token-value').val(objRLaneros.getUserData('stRToken'));
        $('.button-options').click(function() {
            Chrome.createTab(1,'views/options.html');

            return false;
        });

        if ($.validator) {
            $('#statusPoster').validate({
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
        }

        $('#ctrl_pageStatus_visible').click(function() {
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
                $('#statusPoster').find('.status-length').removeClass('text-green-500').addClass('text-orange');
            }
            if (inLTextChars > 120) {
                $('#statusPoster').find('.status-length').removeClass('text-green-500 text-orange').addClass('text-red-500');
            }
        });

        $('.tab-list a').click(function() {
            let stLActiveTab = $(this).attr('href').replace('#', '');
            let objLTabOptions = { stRActiveTab: stLActiveTab };

            Chrome.setStorage(objLTabOptions, objLActiveTab(stLActiveTab));

            $('.tab-list a').removeClass('text-white bg-blue-500 hover:bg-blue-600 hover:text-white')
                .addClass('text-blue-500 hover:text-blue-600 hover:bg-gray-400');

            $(this).addClass('text-white bg-blue-500 hover:bg-blue-600 hover:text-white')
                .removeClass('text-blue-500 hover:bg-gray-400 hover:text-blue-600');

            $('#' + stLActiveTab).find('.loading-data').show();
            $('.tab-content .tab').addClass('hidden');
            $('#' + stLActiveTab).removeClass('hidden').hide().fadeIn();
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

        Chrome.getStorage({bolRShowBookmarks: objRLaneros.getDefaults('bolRShowBookmarks')},
            function (objROptions) {
                $('.bookmarks-tab-nav').addClass('hidden');

                if (objROptions.bolRShowBookmarks) {
                    $('.bookmarks-tab-nav').removeClass('hidden');

                }
            });

        Chrome.getStorage({stRActiveTab: objRLaneros.getDefaults('stRActiveTab')},
            function (objROptions) {
                let stLActiveTab = $('a[href="#' + objROptions.stRActiveTab + '"]');
                let stLTabId;

                if (!$(stLActiveTab).closest('li').hasClass('hidden')) {
                    stLTabId = '#' + objROptions.stRActiveTab;
                    $(stLActiveTab).addClass('text-white bg-blue-500 hover:bg-blue-600 hover:text-white')
                        .removeClass('text-blue-500 hover:bg-gray-400 hover:text-blue-600');
                }
                else {
                    stLTabId = $('.tab-list').find('li:first:not(:hidden) a').attr('href');
                    $('.tab-list').find('li:first:not(:hidden) a').addClass('text-white bg-blue-500 hover:bg-blue-600 hover:text-white')
                        .removeClass('text-blue-500 hover:bg-gray-400 hover:text-blue-600');
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
     * Get Extension Data
     */
    getData(bolRAll = false) {
        let objRLaneros = this;
        let objLFail = function(objRjqXHR, stRTextStatus, objRErrorThrown) {
            try {
                if (objRjqXHR.status === 403) {
                    let stLToken = $('input[name=_xfToken]:first', objRjqXHR).val();

                    objRLaneros.showLogin(stLToken);
                }
                else {
                    $('.loading-box').fadeOut(function() {
                        $('.section-error, header').removeClass('hidden');
                    });
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
                    objRLaneros.getBookmarks();
                }

                if (inRConversations > 0) {
                    $('.inbox-counter').removeClass('invisible').html(inRConversations);
                }

                if (inRAlerts > 0) {
                    $('.alert-counter').removeClass('invisible').html(inRAlerts);
                }

                if (inRSubscriptions > 0) {
                    $('.subscription-counter').removeClass('invisible').html(inRSubscriptions);
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
            let objLSectionUser = $('.section-user');
            let objLShowInfo = $(objLSectionUser).find('.user-info-container');

            if (objROptions.bolRShowInfo) {
                let objRData = document.createElement('div');
                let objLResponseFeedback = function(objRResponse, stRTextStatus, objRjqXHR) {
                    let objLUserData = $(objLShowInfo).find('.user-data')

                    objRData = $(objRResponse.html.content);

                    let inLFeedbackPositive = $('.statsList .pairsJustified .formRow:eq(1) dd', objRData).text();
                    let inLFeedbackNeutral = $('.statsList .pairsJustified .formRow:eq(2) dd', objRData).text();
                    let inLFeedbackNegative = $('.statsList .pairsJustified .formRow:eq(3) dd', objRData).text();

                    $(objLUserData).find('.user-feedback-positive').html(inLFeedbackPositive ? inLFeedbackPositive : 0);
                    $(objLUserData).find('.user-feedback-neutral').html(inLFeedbackNeutral ? inLFeedbackNeutral : 0);
                    $(objLUserData).find('.user-feedback-negative').html(inLFeedbackNegative ? inLFeedbackNegative : 0);

                };
                let objLResponseMenu = function(objRResponse, stRTextStatus, objRjqXHR) {
                    let objLUserInfo = $(objLShowInfo).find('.user-info');
                    let objLUserData = $(objLShowInfo).find('.user-data');

                    objRData = $(objRResponse.html.content);

                    let stLAvatar = $('.avatarWrapper .avatar img', objRData).attr('src');
                    let inLMessages = $('.contentRow-minor .fauxBlockLink:first dd a', objRData).html();
                    let inLRatingPositive = $('.contentRow-minor .fauxBlockLink:eq(1) dd a', objRData).html();
                    let inLPoints = $('.contentRow-minor .fauxBlockLink:last dd a', objRData).html();

                    objRLaneros.setUserData({
                        stRUsername: $('.contentRow-header a.username', objRData).text(),
                        stRUserTitle: $('.contentRow-lesser .userTitle', objRData).text(),
                        stRUserFullId: $('.contentRow-header a.username', objRData).text() + '.' +
                            objRLaneros.getUserData('inRUserId')
                    });

                    $(objLSectionUser).find('.user-id-full').each(function() {
                        if($(this).attr('href') !== undefined) {
                            let stLHref = $(this).attr('href').replace('{user-id-full}', objRLaneros.getUserData('stRUserFullId'));

                            $(this).attr('href', stLHref);
                        }
                        if($(this).attr('action') !== undefined) {
                            let stLAction = $(this).attr('action').replace('{user-id-full}', objRLaneros.getUserData('stRUserFullId'));

                            $(this).attr('action', stLAction);
                        }
                    });

                    $(objLUserInfo).find('a').html(objRLaneros.getUserData('stRUsername'));
                    $(objLUserInfo).find('small').html(objRLaneros.getUserData('stRUserTitle'));
                    $(objLShowInfo).find('.avatar').attr('src', stLAvatar);

                    $(objLUserData).find('.user-messages').html(inLMessages);
                    $(objLUserData).find('.user-rating').html(inLRatingPositive);
                    $(objLUserData).find('.user-points').html(inLPoints);

                    $(objLShowInfo).removeClass('invisible').addClass('flex');
                };

                $.getJSON(objRLaneros.getPageURL() + 'account/visitor-menu?_xfResponseType=json&_xfNoRedirect=1&_xfToken=' +
                    objRLaneros.getUserData('stRToken'), objLResponseMenu);

                $.getJSON(objRLaneros.getPageURL() + 'feedback/'+ objRLaneros.getUserData('inRUserId') +
                    '/authors?_xfResponseType=json&_xfNoRedirect=1&_xfToken=' + objRLaneros.getUserData('stRToken'), objLResponseFeedback);
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
            let objLNotifications = {};

            $(objLConversations).html(objRResponse.html.content);
            $('#inbox').find('.conversation-item:gt(0)').remove();
            $('#inbox').find('.loading-data').hide();

            if ($(objLConversations).find('div.menu-row').length === 0) {
                $(objLConversations).find('li.menu-row--separated').each(function () {
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
                        $(objLConversation).addClass('bg-yellow-100');
                    }

                    if ($(objLMessageIcon).length === 1) {
                        $(objLConversation).find('.conversation-avatar > img').attr('src', $(objLMessageIcon).attr('src'))
                            .attr('alt', $(objLMessageIcon).attr('alt'));
                    }
                    else {
                        $(objLConversation).find('.conversation-avatar > img').addClass('bg-gray-600 border border-gray-900');
                    }

                    $(objLMessageWith).find('ul').remove();
                    $(objLConversation).find('.conversation-avatar')
                        .attr('href', $(objLMessageFigure).find('a.avatar').attr('href'));
                    $(objLConversation).find('.conversation-title').replaceWith(objLMessage);
                    $(objLConversation).find('.conversation-with').html($(objLMessageWith).text());
                    $(objLConversation).find('.conversation-time').html(objLMessageTime);

                    $(objLMessageWithList).find('li').each(function(inRIndex) {
                        let objLAnchor = document.createElement('a');

                        let objLWith = $(objLConversation).find('.conversation-with');

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

                    $(objLConversation).find('.conversation-body h6 a').addClass('hover:text-gray-900');
                    $(objLConversation).find('.conversation-with a').addClass('text-blue-500 hover:text-blue-600');

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
                                let arrLMessageID = arrLMessage[2].split('.');
                                let inLMessageID = arrLMessageID.pop();

                                objLNotifications['Laneros.Conversations.' + inLMessageID] = {
                                    stRNotificationURL: objRLaneros.getPageURL() + $(objLMessage).attr('href').substr(1)
                                };

                                Chrome.sendNotification('Laneros.Conversations.' + inLMessageID, {
                                    type: 'basic',
                                    title: Chrome.getMessage('label_new_messages'),
                                    message: $(objLMessage).text(),
                                    iconUrl: $(objLMessageIcon).attr('src')
                                }, true);
                            }
                        });
                });
            }
            if ($(objLConversations).find('div.menu-row').length !== 0 || !bolLUnread) {
                $('#inbox').find('.alert-inbox-message').removeClass('hidden');
            }

            Chrome.addNotificationListener(objLNotifications);
        };

        $('#inbox').find('.conversation-item:gt(0)').remove();
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
            let objLNotifications = {};

            $(objLAlerts).html(objRResponse.html.content);
            $('#alerts').find('.alert-item:gt(0)').remove();
            $('#alerts').find('.loading-data').hide();

            if ($(objLAlerts).find('div.menu-row').length === 0) {
                $(objLAlerts).find('li.menu-row--separated').each(function () {
                    let objLAlert = $('#alerts').find('.alert-item:first').clone();

                    let objLMessage = $(this).find('.contentRow-main');
                    let objLMessageFigure = $(this).find('.contentRow-figure');
                    let objLMessageIcon = $(objLMessageFigure).find('a.avatar img');
                    let objLMessageTime = $(objLMessage).find('.contentRow-minor--smaller time');
                    let bolLIsUnread = $(this).hasClass('new');

                    if (bolLIsUnread) {
                        bolLUnread = true;
                        $(objLAlert).addClass('bg-yellow-100');
                    }

                    if ($(objLMessageIcon).length === 1) {
                        $(objLAlert).find('.alert-avatar > img').attr('src', $(objLMessageIcon).attr('src'))
                            .attr('alt', $(objLMessageIcon).attr('alt'));
                    }
                    else {
                        $(objLAlert).find('.alert-avatar > img').addClass('bg-gray-600 border border-gray-900');
                    }

                    $(objLMessage).find('.contentRow-minor--smaller, i, img').remove();
                    $(objLAlert).find('.alert-avatar').attr('href', $(objLMessageFigure).find('a.avatar').attr('href'));
                    $(objLAlert).find('.alert-content').html($(objLMessage).html());
                    $(objLAlert).find('.alert-time').html(objLMessageTime);

                    $(objLAlert).find('.alert-with a').addClass('text-blue-500 hover:text-blue-600');
                    $(objLAlert).find('bdi').removeClass().addClass('font-bold');

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
                                let inLMessageID = Math.floor((Math.random() * 100) + 1);

                                objLNotifications['Laneros.Alerts.' + inLMessageID] = {
                                    stRNotificationURL: objRLaneros.getPageURL() + 'account/alerts'
                                };
                                Chrome.sendNotification('Laneros.Alerts.' + inLMessageID, {
                                    type: 'basic',
                                    title: Chrome.getMessage('label_new_alerts'),
                                    message: $(objLMessage).text(),
                                    iconUrl: $(objLMessageIcon).attr('src')
                                }, true);
                            }
                        });
                });
            }
            if ($(objLAlerts).find('div.menu-row').length !== 0 || !bolLUnread) {
                $('#alerts').find('.alert-alerts-message').removeClass('hidden');
            }

            Chrome.addNotificationListener(objLNotifications);
        };

        $('#alerts').find('.alert-item:gt(0)').remove();
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
            let objLNotifications = {};

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

                    let objLParts = $(objLThread).find('.thread-starter');
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
                        $(objLThread).addClass('bg-yellow-100');
                    }

                    if ($(this).find('.structItem-secondaryIcon').length > 0) {
                        $(objLThread).addClass('border-l-4 border-blue-500')
                    }

                    if ($(objLMessageIcon).length >= 1) {
                        $(objLThread).find('.thread-avatar > img').attr('src', $(objLMessageIcon).attr('src'))
                            .attr('alt', $(objLMessageIcon).attr('alt'));
                    }
                    else {
                        $(objLThread).find('.thread-avatar > img').addClass('bg-gray-600 border border-gray-900');
                    }

                    $(objLThread).find('.thread-avatar').attr('href', $(objLMessageFigure).find('a.avatar').attr('href'));
                    $(objLThread).find('.thread-title').replaceWith(objLMessage);

                    $(objLAnchorUser).html(stLUsername).attr('href', 'members/' + stLUsername + '.' + inRUserId);
                    $(objLAnchorUser).appendTo(objLParts);
                    $(objLParts).append(' · ');

                    $(objLAnchorTime).html(objLTime.html()).attr('href', objLTime.attr('href'));
                    $(objLAnchorTime).appendTo(objLParts);
                    $(objLParts).append(' · ');

                    $(objLAnchorForum).html(objLForum.html()).attr('href', objLForum.attr('href'));
                    $(objLAnchorForum).appendTo(objLParts);

                    $(objLThread).find('.message-info .message-by').html($(objLMessageLatest).find('.structItem-minor').html());
                    $(objLThread).find('.message-info .message-at').replaceWith($(objLMessageLatest).find('a:first'));

                    $(objLThread).find('.thread-body h6 a').addClass('hover:text-gray-900');
                    $(objLThread).find('.thread-starter a, .message-info a').removeClass()
                        .addClass('text-blue-500 hover:text-blue-600');
                    $(objLThread).find('time').closest('a').removeClass().addClass('text-orange-500 hover:text-orange-600');

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
                                let arrLMessageID = arrLMessage[2].split('.');
                                let inLMessageID = arrLMessageID.pop();

                                objLNotifications['Laneros.Subscriptions.' + inLMessageID] = {
                                    stRNotificationURL: objRLaneros.getPageURL() + $(objLMessage).attr('href').substr(1)
                                };

                                Chrome.sendNotification('Laneros.Subscriptions.' + inLMessageID, {
                                    type: 'basic',
                                    title: Chrome.getMessage('label_new_subscription'),
                                    message: $(objLMessage).text(),
                                    iconUrl: $(objLMessageIcon).attr('src')
                                }, true);
                            }
                        });
                });
            }
            else {
                $('#subscriptions').find('.alert-subscriptions-message').removeClass('hidden');
            }

            Chrome.addNotificationListener(objLNotifications);
        };

        $('#subscriptions').find('.thread-item:gt(0)').remove();
        $.getJSON(objRLaneros.getPageURL() + 'watched/threads?_xfResponseType=json&_xfNoRedirect=1&_xfToken='  +
            objRLaneros.getUserData('stRToken'), objLResponse);
    }

    /**
     * Get Bookmarks
     */
    getBookmarks() {
        let objRLaneros = this;
        let objLResponse = function(objRResponse) {
            let objRBookmarks = document.createElement('div');

            $(objRBookmarks).html(objRResponse.html.content);
            $('#bookmarks').find('.bookmark-item:gt(0)').remove();
            $('#bookmarks').find('.loading-data').hide();

            if ($(objRBookmarks).find('.contentRow-main').length > 0) {
                $(objRBookmarks).find('li.menu-row--separated').each(function () {
                    let objLBookmark = $('#bookmarks').find('.bookmark-item:first').clone();

                    let objLMessage = $(this).find('.contentRow-main .contentRow-title');
                    let objLMessageFigure = $(this).find('.contentRow-figure');
                    let objLMessageIcon = $(objLMessageFigure).find('.avatar img');
                    let objLMessageSnippet = $(this).find('.contentRow-main .contentRow-snippet');
                    let objLMessageMinor = $(this).find('.contentRow-main .contentRow-minor--smaller');
                    let objLMessageTime = $(objLMessageMinor).find('time');
                    let objLMessageTags = $(objLMessageMinor).find('.tagList');
                    let stLUser = $(objLMessageIcon).attr('alt') + '.' + $(objLMessageFigure).find('.avatar').data('user-id');


                    if ($(objLMessageIcon).length === 1) {
                        $(objLBookmark).find('.bookmark-avatar > img').attr('src', $(objLMessageIcon).attr('src'))
                            .attr('alt', $(objLMessageIcon).attr('alt'));
                    }
                    else {
                        $(objLBookmark).find('.bookmark-avatar > img').addClass('bg-gray-600 border border-gray-900');
                    }

                    $(objLMessageTags).find('.u-srOnly').remove();
                    $(objLBookmark).find('.bookmark-avatar').attr('href', objRLaneros.getPageURL() + 'members/' + stLUser);
                    $(objLBookmark).find('.bookmark-title').replaceWith(objLMessage);
                    $(objLBookmark).find('.bookmark-message').html($(objLMessageSnippet).html());
                    $(objLBookmark).find('.bookmark-author').attr('href', objRLaneros.getPageURL() + 'members/' + stLUser)
                        .html($(objLMessageIcon).attr('alt'));
                    $(objLBookmark).find('.bookmark-time').html(objLMessageTime);
                    $(objLBookmark).find('.bookmark-body h6 a').addClass('hover:text-gray-900');

                    if ($(objLMessageTags).find('a').length > 0) {
                        $(objLBookmark).find('.bookmark-labels').removeClass('hidden');

                        $(objLMessageTags).find('a').each(function () {
                            let objLTag = $(objLBookmark).find('.bookmark-labels .bookmark-label:first').clone();

                            $(objLTag).html(this).removeClass('hidden').appendTo($(objLBookmark).find('.bookmark-labels'));
                        });
                    }

                    $(objLBookmark).find('a').each(function () {
                        $(this).attr('target', '_blank');

                        if ($(this).attr('href').indexOf(objRLaneros.getPageURL()) === -1) {
                            $(this).attr('href', objRLaneros.getPageURL() + $(this).attr('href'));
                        }
                    });

                    $(objLBookmark).removeClass('hidden').appendTo('#bookmarks .bookmark-container');
                });
            }
            if ($(objRBookmarks).find('.contentRow-main').length === 0) {
                $('#bookmarks').find('.alert-bookmark-message').removeClass('hidden');
            }
        };

        $('#bookmarks').find('.bookmark-item:gt(0)').remove();
        $.getJSON(objRLaneros.getPageURL() + 'account/bookmarks-popup?_xfResponseType=json&_xfNoRedirect=1&_xfToken='  +
            objRLaneros.getUserData('stRToken'), objLResponse);
    }
}