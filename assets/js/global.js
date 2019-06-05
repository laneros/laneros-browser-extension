/**
 * Basic Object
 */
var objRGlobalOptions = new Object({
    dtRTimeRev: 120000,
    bolRShowInbox: true,
    bolRShowAlerts: true,
    bolRShowSubs: true,
    bolRShowNotification: true,
    bolRShowLinks: true,
    bolRShowInfo: true,
    stRActiveTab: 'home'
});
/**
 * Vars
 */
var stRURL = 'http://www.laneros.com/';
/**
 * function get_storage
 *
 * Get Chrome Storage Value
 *
 * @param stRValue
 * @param stRCallback
 */
function get_storage(stRValue, stRCallback) {
    chrome.storage.sync.get(stRValue, stRCallback);
}
/**
 * function set_storage
 *
 * Sync Chrome Storage Value
 *
 * @param stRValue
 * @param stRCallback
 */
function set_storage(stRValue, stRCallback) {
    chrome.storage.sync.set(stRValue, stRCallback);
}
/**
 * function get_message
 *
 * Get Locale Based Message
 *
 * @param stRString
 */
function get_message(stRString) {
    return chrome.i18n.getMessage(stRString);
}
/**
 * function set_badge
 *
 * Update Extension Counter
 *
 * @param inRCounter
 */
function set_badge(inRCounter) {
    var dtLDate = new Date();
    console.log(dtLDate.toLocaleString() + ' - Setting badge ...');
    chrome.browserAction.setBadgeText({ text: ''});

    if (inRCounter > 0) {
        chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255]});
        chrome.browserAction.setBadgeText({ text: '' + inRCounter});
    }
}
/**
 * function get_badge
 *
 * Get Extension Counter
 *
 * @param theCounter
 */
function get_badge(stRCallBack) {
    chrome.browserAction.getBadgeText({}, stRCallBack);
}
/**
 * function parseLANerosText
 *
 * Get Conversations, Alerts and Subscriptions data in plain text
 *
 * @return Object
 */
function set_parser() {
    var objLResult = {};
    var dtLDate = new Date();
    console.log(dtLDate.toLocaleString() + ' - Started parser ...');

    var objLjqXHR = $.get(stRURL + 'watched/threads/all', function(objRData) {
        var inLConversations = 0, inLAlerts = 0, inLSubscriptions = 0, inLCounter = 0;

        inLConversations = parseInt($(objRData).find('#VisitorExtraMenu_ConversationsCounter:first .Total').text());
        inLAlerts = parseInt($(objRData).find('#VisitorExtraMenu_AlertsCounter:first .Total').text());
        inLSubscriptions = parseInt($(objRData).find('.discussionList .discussionListItems li.unread').size());
        inLCounter = inLConversations + inLAlerts + inLSubscriptions;

        objLResult.inRConversations = inLConversations;
        objLResult.inRAlerts = inLAlerts;
        objLResult.inRSubscriptions = inLSubscriptions;

        get_storage({ bolRShowInfo : objRGlobalOptions.bolRShowInfo }, function(objROptions) {
            if (!objROptions.bolRShowInfo) {
                $('.user-info').addClass('hide');
            }
        });

        get_storage({ bolRShowInbox : objRGlobalOptions.bolRShowInbox }, function(objROptions) {
            if (!objROptions.bolRShowInbox) {
                $('a[href=#inbox]').addClass('hide');
            }
        });

        get_storage({ bolRShowAlerts : objRGlobalOptions.bolRShowAlerts }, function(objROptions) {
            if (!objROptions.bolRShowAlerts) {
                $('a[href=#alerts]').addClass('hide');
            }
        });

        get_storage({ bolRShowSubs : objRGlobalOptions.bolRShowSubs }, function(objROptions) {
            if (!objROptions.bolRShowSubs) {
                $('a[href=#subscriptions]').addClass('hide');
            }
        });

        get_badge(function(inRBadgeCounter) {
            set_badge(inLCounter);

            if (inRBadgeCounter < inLCounter) {
                get_storage({ bolRShowNotification : objRGlobalOptions.bolRShowNotification }, function(objROptions) {
                    if (objROptions.bolRShowNotification) {
                        set_notification(inLConversations, inLAlerts, inLSubscriptions);
                    }
                });
            }
        });
    }).always(function() {
        var dtLDate = new Date();
        console.log(dtLDate.toLocaleString() + ' - Finished parser ...');
    }).fail(function(jqXHR) {
        var dtLDate = new Date();
        console.log(dtLDate.toLocaleString() + ' - parser fail ...');

        if (jqXHR.status == 403) {
            do_login();

            get_storage({ bolRShowNotification : objRGlobalOptions.bolRShowNotification }, function(objROptions) {
                if (objROptions.bolRShowNotification) {
                    set_create_notification('LanerosNotLoggedIn', {
                        type: 'basic',
                        title: get_message('extName'),
                        message: get_message('notConnected'),
                        iconUrl: '../assets/img/icon.png',
                        buttons: [{
                            title: get_message('goTo'),
                            iconUrl: '../assets/img/icon.png'
                        }]
                    }, function() {}, false);
                }
            });
        }
        else {
            $('.section-loading').removeClass('hide').hide().fadeIn().find('h3').addClass('text-danger')
                .removeClass('text-info').html(get_message('dataError'));

            get_storage({ bolRShowNotification : objRGlobalOptions.bolRShowNotification }, function(objROptions) {
                if (objROptions.bolRShowNotification) {
                    set_create_notification('LanerosError', {
                        type: 'basic',
                        title: get_message('extName'),
                        message: get_message('pageError'),
                        iconUrl: '../assets/img/laneros.png',
                        buttons: [{
                            title: get_message('goTo'),
                            iconUrl: '../assets/img/icon.png'
                        }]
                    }, function() {}, true);
                }
            });
        }
    });

    objLResult.jqXHR = objLjqXHR;

    return objLResult;
}
/**
 * function do_login
 *
 * Show Login Form
 */
function do_login() {
    var objLLink = document.createElement('link');
    var dtLDate = new Date();
    console.log(dtLDate.toLocaleString() + ' - Show login ...');

    $(objLLink).attr('rel', 'stylesheet')
        .attr('href', stRURL + 'css.php?css=facebook,nat_public_css,panel_scroller,twitter&style=2&dir=LTR')
        .appendTo('head');

    $('#ctrl_pageLogin_not_registered, #ctrl_pageLogin_registered').change(function() {
        $('#ctrl_pageLogin_password, #ctrl_pageLogin_remember').closest('.form-group').hide();

        if ($('#ctrl_pageLogin_not_registered').is(':checked')) {
            $('button[type=submit]').html(get_message('registerButton'));
        }
        if ($('#ctrl_pageLogin_registered').is(':checked')) {

            $('#ctrl_pageLogin_password, #ctrl_pageLogin_remember').closest('.form-group').slideDown(function() {
                $('button[type=submit]').html(get_message('loginButton'));
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
                            get_popup();
                        });
                    }
                    else {
                        $('.section-login .list-group-item-danger p').html(get_message('loginError'));
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
/**
 * Run on Startup
 */
get_storage({ bolRIsRunning : false }, function(objROptions) {
    var dtLDate = new Date();
    console.log(dtLDate.toLocaleString() + ' - Global started up ...');

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
            $(this).attr(stLTarget, get_message(stLMessage));
        }
        else {
            $(this).html(get_message(stLMessage));
        }
    });

    $('a.external-link').each(function() {
        $(this).attr('href', stRURL + $(this).attr('href')).attr('target', '_blank');
    });
    $('form.external-link').each(function() {
        $(this).attr('action', stRURL + $(this).attr('action'));
    });
    $('img.external-link').each(function() {
        $(this).attr('src', stRURL + $(this).attr('src'));
    });
});