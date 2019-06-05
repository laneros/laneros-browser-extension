/**
 * function get_options
 *
 * Get Extension Options
 *
 * @param objROptions
 */
function get_options(objROptions) {
    var objLReviewTime  = get_time(objROptions.dtRTimeRev);

    $('#form_options').validate({
        errorLabelContainer: $('.panel-footer .form-validation'),
        submitHandler: function() {
            set_options();
            return false;
        }
    });

    $('input[name=extension_checkbox_inbox][value=' + objROptions.bolRShowInbox + ']').attr('checked', true)
        .closest('label').button('toggle');
    $('input[name=extension_checkbox_alerts][value=' + objROptions.bolRShowAlerts + ']').attr('checked', true)
        .closest('label').button('toggle');
    $('input[name=extension_checkbox_subscriptions][value=' + objROptions.bolRShowSubs + ']').attr('checked', true)
        .closest('label').button('toggle');
    $('input[name=extension_checkbox_notifications][value=' + objROptions.bolRShowNotification + ']').attr('checked', true)
        .closest('label').button('toggle');
    $('input[name=extension_checkbox_links][value=' + objROptions.bolRShowLinks + ']').attr('checked', true)
        .closest('label').button('toggle');
    $('input[name=extension_checkbox_info][value=' + objROptions.bolRShowInfo + ']').attr('checked', true)
        .closest('label').button('toggle');

    $('#extension_number_hours').val(objLReviewTime.inRHours);
    $('#extension_number_minutes').val(objLReviewTime.inRMinutes);
    $('#extension_number_seconds').val(objLReviewTime.inRSeconds);
    $('#extension_number_milliseconds').val(objLReviewTime.inRMilliseconds);
}
/**
 * function set_options
 *
 * Set Extension Options
 */
function set_options() {
    var dtLTimeRev = parseInt($('#extension_number_milliseconds').val())
        + (parseInt($('#extension_number_seconds').val()) * 1000)
        + (parseInt($('#extension_number_minutes').val()) * 60 * 1000)
        + (parseInt($('#extension_number_hours').val()) * 60 * 60 * 1000);
    var objLOptions = {};

    if (dtLTimeRev > 0) {
        objLOptions.dtRTimeRev = dtLTimeRev;
    }

    objLOptions.bolRShowInbox  = ($('input[name=extension_checkbox_inbox]:checked').val() === 'true');
    objLOptions.bolRShowAlerts = ($('input[name=extension_checkbox_alerts]:checked').val() === 'true');
    objLOptions.bolRShowSubs = ($('input[name=extension_checkbox_subscriptions]:checked').val() === 'true');
    objLOptions.bolRShowNotification = ($('input[name=extension_checkbox_notifications]:checked').val() === 'true');
    objLOptions.bolRShowLinks = ($('input[name=extension_checkbox_links]:checked').val() === 'true');
    objLOptions.bolRShowInfo = ($('input[name=extension_checkbox_info]:checked').val() === 'true');

    set_storage(objLOptions, function() {
        $('#responseContainer').removeClass('hide');
        set_background();
    });
}
/**
 * function get_time
 *
 * Convert Milliseconds to Object
 *
 * @param inRMilliseconds
 */
function get_time(inRMilliseconds) {
    var objLTime = new Object();

    var inLSeconds = Math.floor(inRMilliseconds / 1000);
    var inLMinutes = Math.floor(inLSeconds / 60);
    var inLHours = Math.floor(inLMinutes / 60);

    objLTime.inRMilliseconds = parseInt(inRMilliseconds % 1000);
    objLTime.inRSeconds = parseInt(inLSeconds % 60);
    objLTime.inRMinutes = parseInt(inLMinutes % 60);
    objLTime.inRHours = parseInt(inLHours % 60);

    return objLTime;
}
/**
 * Run on Document Load
 */
get_storage(objRGlobalOptions, get_options);