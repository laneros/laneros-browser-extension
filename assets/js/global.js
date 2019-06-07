/**
 * Self-Executing Anonymous Function
 */
(function(laneros_extension) {
    laneros_extension.stRURL = 'http://www.laneros.com/';
    laneros_extension.objRGlobalOptions = {
        dtRTimeRev: 120000,
        bolRShowInbox: true,
        bolRShowAlerts: true,
        bolRShowSubs: true,
        bolRShowNotification: true,
        bolRShowLinks: true,
        bolRShowInfo: true,
        stRActiveTab: 'home'
    };
    /**
     * function get_storage
     *
     * Get Chrome Storage Value
     *
     * @param stRValue
     * @param stRCallback
     */
    laneros_extension.get_storage = function(stRValue, stRCallback) {
        chrome.storage.sync.get(stRValue, stRCallback);
    };
    /**
     * function set_storage
     *
     * Sync Chrome Storage Value
     *
     * @param stRValue
     * @param stRCallback
     */
    laneros_extension.set_storage = function(stRValue, stRCallback) {
        chrome.storage.sync.set(stRValue, stRCallback);
    };
    /**
     * function get_message
     *
     * Get Locale Based Message
     *
     * @param stRString
     */
    laneros_extension.get_message = function(stRString) {
        return chrome.i18n.getMessage(stRString);
    };
    /**
     * function set_badge
     *
     * Update Extension Counter
     *
     * @param inRCounter
     */
    laneros_extension.set_badge = function(inRCounter) {
        chrome.browserAction.setBadgeText({ text: ''});

        if (inRCounter > 0) {
            chrome.browserAction.setBadgeBackgroundColor({ color: [0, 177, 235, 255]});
            chrome.browserAction.setBadgeText({ text: '' + inRCounter});
        }
    };
    /**
     * function get_badge
     *
     * Get Extension Counter
     *
     * @param theCounter
     */
    laneros_extension.get_badge = function(stRCallBack) {
        chrome.browserAction.getBadgeText({}, stRCallBack);
    }
    /**
     * function parseLANerosText
     *
     * Get Conversations, Alerts and Subscriptions data in plain text
     *
     * @return Object
     */
    laneros_extension.set_parser = function() {
        var set_success = function(objRData, stRTextStatus, objRjqXHR) {
            try {
                var inLConversations = 0, inLAlerts = 0, inLSubscriptions = 0, inLCounter = 0;

                inLConversations = parseInt($('#VisitorExtraMenu_ConversationsCounter:first .Total', objRData).text());
                inLAlerts = parseInt($('#VisitorExtraMenu_AlertsCounter:first .Total', objRData).text());
                inLSubscriptions = parseInt($('.discussionListItems li.unread', objRData).length);
                inLCounter = inLConversations + inLAlerts + inLSubscriptions;

                objLResult.inRConversations = inLConversations;
                objLResult.inRAlerts = inLAlerts;
                objLResult.inRSubscriptions = inLSubscriptions;

                laneros_extension.get_storage({ bolRShowInfo : laneros_extension.objRGlobalOptions.bolRShowInfo },
                    function(objROptions) {
                        if (!objROptions.bolRShowInfo) {
                            $('.user-info').addClass('hide');
                        }
                });

                laneros_extension.get_storage({ bolRShowInbox : laneros_extension.objRGlobalOptions.bolRShowInbox },
                    function(objROptions) {
                        if (!objROptions.bolRShowInbox) {
                            $('a[href="#inbox"]').addClass('hide');
                        }
                });

                laneros_extension.get_storage({ bolRShowAlerts : laneros_extension.objRGlobalOptions.bolRShowAlerts },
                    function(objROptions) {
                        if (!objROptions.bolRShowAlerts) {
                            $('a[href="#alerts"]').addClass('hide');
                        }
                });

                laneros_extension.get_storage({ bolRShowSubs : laneros_extension.objRGlobalOptions.bolRShowSubs },
                    function(objROptions) {
                        if (!objROptions.bolRShowSubs) {
                            $('a[href="#subscriptions"]').addClass('hide');
                        }
                });

                laneros_extension.get_badge(function(inRBadgeCounter) {
                    laneros_extension.set_badge(inLCounter);

                    if (inRBadgeCounter < inLCounter) {
                        laneros_extension.get_storage({ bolRShowNotification : laneros_extension.objRGlobalOptions.bolRShowNotification },
                            function(objROptions) {
                                if (objROptions.bolRShowNotification) {
                                    laneros_extension.set_notification(inLConversations, inLAlerts, inLSubscriptions);
                                }
                        });
                    }
                });
            }
            catch(objRException) {
                var dtLDate = new Date();

                console.log(dtLDate.toLocaleString() + ' - ' + laneros_extension.get_message('extension_short_name') + ': '
                    +  objRException.message);
            }
        };

        var set_fail = function(objRjqXHR, stRTextStatus, objRErrorThrown) {
            if (objRjqXHR.status == 403) {
                laneros_extension.do_login();

                laneros_extension.get_storage({ bolRShowNotification : laneros_extension.objRGlobalOptions.bolRShowNotification },
                    function(objROptions) {
                        if (objROptions.bolRShowNotification) {
                            laneros_extension.set_create_notification('laneros_not_logged_in', {
                                type: 'basic',
                                title: laneros_extension.get_message('extension_name'),
                                message: laneros_extension.get_message('text_error_not_connected'),
                                iconUrl: '../assets/img/icon.png',
                                buttons: [{
                                    title: laneros_extension.get_message('text_go_to'),
                                    iconUrl: '../assets/img/icon.png'
                                }]
                            }, function(stRNotificationID, inRButtonIndex) {
                                switch (inRButtonIndex) {
                                    default:
                                        chrome.tabs.query({ url: laneros_extension.stRURL }, function(objRTabResult) {
                                            var arrLResult = objRTabResult.shift();

                                            if (objRTabResult.length == 0) {
                                                chrome.tabs.create({url: laneros_extension.stRURL}, function(objRTab) {});
                                            }
                                            else {
                                                chrome.tabs.highlight({windowId : arrLResult.windowId, tabs : arrLResult.index});
                                            }
                                        });
                                        break;
                                }
                            }, true);
                        }
                });
            }
            else {
                $('.section-loading').removeClass('hide').hide().fadeIn().find('h3').addClass('text-danger')
                    .removeClass('text-info').html(laneros_extension.get_message('dataError'));

                laneros_extension.get_storage({ bolRShowNotification : laneros_extension.objRGlobalOptions.bolRShowNotification },
                    function(objROptions) {
                        if (objROptions.bolRShowNotification) {
                            laneros_extension.set_create_notification('laneros_error', {
                                type: 'basic',
                                title: laneros_extension.get_message('extension_name'),
                                message: laneros_extension.get_message('text_error_page'),
                                iconUrl: '../assets/img/icon.png',
                                buttons: [{
                                    title: laneros_extension.get_message('text_go_to'),
                                    iconUrl: '../assets/img/icon.png'
                                }]
                            }, function(stRNotificationID, inRButtonIndex) {
                                switch (inRButtonIndex) {
                                    default:
                                        chrome.tabs.query({ url: laneros_extension.stRURL }, function(objRTabResult) {
                                            var arrLResult = objRTabResult.shift();

                                            if (objRTabResult.length == 0) {
                                                chrome.tabs.create({url: laneros_extension.stRURL});
                                            }
                                            else {
                                                chrome.tabs.highlight({windowId : arrLResult.windowId, tabs : arrLResult.index});
                                            }
                                        });
                                        break;
                                }
                            }, true);
                        }
                });
            }
        };

        var objLResult = {
            objLjqXHR: $.get(laneros_extension.stRURL + 'watched/threads/all', set_success).fail(set_fail)
        };

        return objLResult;
    }
    /**
     * function do_login
     *
     * Show Login Form
     */
    laneros_extension.do_login = function() {
        var objLLink = document.createElement('link');

        laneros_extension.set_badge(0);

        $(objLLink).attr('rel', 'stylesheet')
            .attr('href', laneros_extension.stRURL + 'css.php?css=facebook,nat_public_css,panel_scroller,twitter&style=2&dir=LTR')
            .appendTo('head');

        $('#ctrl_pageLogin_not_registered, #ctrl_pageLogin_registered').change(function() {
            $('#ctrl_pageLogin_password, #ctrl_pageLogin_remember').closest('.form-group').hide();

            if ($('#ctrl_pageLogin_not_registered').is(':checked')) {
                $('button[type=submit]').html(laneros_extension.get_message('text_button_register'));
            }
            if ($('#ctrl_pageLogin_registered').is(':checked')) {

                $('#ctrl_pageLogin_password, #ctrl_pageLogin_remember').closest('.form-group').slideDown(function() {
                    $('button[type=submit]').html(laneros_extension.get_message('text_button_login'));
                });
            }
        });

        $('#pageLogin').validate({
            errorLabelContainer: $('.panel-footer .form-validation'),
            submitHandler: function(form) {
                $(form).ajaxSubmit({
                    beforeSubmit: function(objRResponse, stRStatus) {
                        $('.loading-overlay').removeClass('hide');
                    },
                    success: function(objRResponse, stRStatus) {
                        $('.loading-overlay').addClass('hide');

                        if (objRResponse._redirectStatus == 'ok') {
                            $('.section-login').fadeOut('fast', function() {
                                laneros_extension.get_popup();
                            });
                        }
                        else {
                            $('.section-login .list-group-item-danger p').html(laneros_extension.get_message('text_error_login'));
                            $('.section-login .list-group-item-danger').hide().fadeIn();
                        }
                    }
                });

                return false;
            }
        });

        $('.section-loading').fadeOut(function() {
            $('.section-login').removeClass('hide').hide().fadeIn('fast');
            $('#ctrl_pageLogin_login').focus();
        });
    }
}( window.laneros_extension = window.laneros_extension || {} ));


/**
 * Run on Startup
 */
try {
    laneros_extension.get_storage({ bolRIsRunning : false }, function(objROptions) {
        if (jQuery.validator) {
            jQuery.validator.setDefaults({
                highlight: function(objRElement, stRErrorClass, stRValidClass) {
                    $(objRElement).addClass(stRErrorClass).removeClass(stRValidClass);
                    $(objRElement.form).find('label[for=' + objRElement.id + ']')
                        .closest('.form-group').addClass('has-error');
                },
                unhighlight: function(objRElement, stRErrorClass, stRValidClass) {
                    $(objRElement).removeClass(stRErrorClass).addClass(stRValidClass);
                    $(objRElement.form).find('label[for=' + objRElement.id + ']')
                        .closest('.form-group').removeClass('has-error');
                },
                errorClass: 'text-danger',
            });
        }

        $('[data-message]').each(function() {
            var stLTarget = $(this).attr('data-target');
            var stLMessage = $(this).attr('data-message');

            if (stLTarget != 'html') {
                $(this).attr(stLTarget, laneros_extension.get_message(stLMessage));
            }
            else {
                $(this).html(laneros_extension.get_message(stLMessage));
            }
        });

        $('a.external-link').each(function() {
            $(this).attr('href', laneros_extension.stRURL + $(this).attr('href')).attr('target', '_blank');
        });
        $('form.external-link').each(function() {
            $(this).attr('action', laneros_extension.stRURL + $(this).attr('action'));
        });
        $('img.external-link').each(function() {
            $(this).attr('src', laneros_extension.stRURL + $(this).attr('src'));
        });
    });
}
catch(objRException) {
    var dtLDate = new Date();

    console.log(dtLDate.toLocaleString() + ' - ' + laneros_extension.get_message('extension_short_name') + ': ' +  objRException.message);
}