/**
 * Self-Executing Anonymous Function
 */
(function(laneros_extension) {
    /**
     * function get_time
     *
     * Convert Milliseconds to Object
     *
     * @param inRMilliseconds
     * @returns {{inRMilliseconds: Number, inRSeconds: Number, inRMinutes: Number, inRHours: Number}}
     */
    function get_time(inRMilliseconds) {
        try {
            var inLSeconds = Math.floor(inRMilliseconds / 1000);
            var inLMinutes = Math.floor(inLSeconds / 60);
            var inLHours = Math.floor(inLMinutes / 60);

            return {
                inRMilliseconds : parseInt(inRMilliseconds % 1000),
                inRSeconds : parseInt(inLSeconds % 60),
                inRMinutes : parseInt(inLMinutes % 60),
                inRHours : parseInt(inLHours % 60)
            };
        }
        catch(objRException) {
            var dtLDate = new Date();

            console.log(dtLDate.toLocaleString() + ' - ' + laneros_extension.get_message('extension_short_name') + ': ' +  objRException.message);
        }
    };
    /**
     * function set_options
     *
     * Set Extension Options
     */
    function set_options() {
        try {
            var dtLTimeRev = parseInt($('#extension_number_milliseconds').val())
                + (parseInt($('#extension_number_seconds').val()) * 1000)
                + (parseInt($('#extension_number_minutes').val()) * 60 * 1000)
                + (parseInt($('#extension_number_hours').val()) * 60 * 60 * 1000);

            var objLOptions = {
                bolRShowInbox : ($('input[name=extension_radio_inbox]:checked').val() === 'true'),
                bolRShowAlerts : ($('input[name=extension_radio_alerts]:checked').val() === 'true'),
                bolRShowSubs :  ($('input[name=extension_radio_subscriptions]:checked').val() === 'true'),
                bolRShowNotification : ($('input[name=extension_radio_notifications]:checked').val() === 'true'),
                bolRShowLinks : ($('input[name=extension_radio_links]:checked').val() === 'true'),
                bolRShowInfo : ($('input[name=extension_radio_info]:checked').val() === 'true')
            };

            if (dtLTimeRev > 0) {
                objLOptions.dtRTimeRev = dtLTimeRev;
            }

            laneros_extension.set_storage(objLOptions, function() {
                try {
                    laneros_extension.set_background();

                    $('.panel-footer div.alert').addClass('alert-success').removeClass('hide').hide().slideDown();
                    $('.panel-footer div.alert h4').html(laneros_extension.get_message('text_label_saved_header'));
                    $('.panel-footer div.alert span').html(laneros_extension.get_message('text_label_saved_text'));
                }
                catch(objRException) {
                    var dtLDate = new Date();

                    console.log(dtLDate.toLocaleString() + ' - ' + laneros_extension.get_message('extension_short_name') + ': ' +  objRException.message);

                    $('.panel-footer div.alert').addClass('alert-danger').removeClass('hide').hide().slideDown();
                    $('.panel-footer div.alert h4').html(laneros_extension.get_message('text_error_saved_header'));
                    $('.panel-footer div.alert span').html(laneros_extension.get_message('text_error_saved_text'));
                }
            });
        }
        catch(objRException) {
            var dtLDate = new Date();

            console.log(dtLDate.toLocaleString() + ' - ' + laneros_extension.get_message('extension_short_name') + ': ' +  objRException.message);
        }

        return false;
    }

    /**
     * function get_options
     *
     * Get Extension Options
     *
     * @param objROptions
     */
    laneros_extension.get_options = function (objROptions) {
        try {
            var objLReviewTime  = get_time(objROptions.dtRTimeRev);

            $('#form_options').validate({
                errorLabelContainer: $('.panel-footer .form-validation'),
                submitHandler: set_options
            });

            $('input[name=extension_radio_inbox][value=' + objROptions.bolRShowInbox + ']').attr('checked', true)
                .closest('label').button('toggle');
            $('input[name=extension_radio_alerts][value=' + objROptions.bolRShowAlerts + ']').attr('checked', true)
                .closest('label').button('toggle');
            $('input[name=extension_radio_subscriptions][value=' + objROptions.bolRShowSubs + ']').attr('checked', true)
                .closest('label').button('toggle');
            $('input[name=extension_radio_notifications][value=' + objROptions.bolRShowNotification + ']').attr('checked', true)
                .closest('label').button('toggle');
            $('input[name=extension_radio_links][value=' + objROptions.bolRShowLinks + ']').attr('checked', true)
                .closest('label').button('toggle');
            $('input[name=extension_radio_info][value=' + objROptions.bolRShowInfo + ']').attr('checked', true)
                .closest('label').button('toggle');

            $('#extension_number_hours').val(objLReviewTime.inRHours);
            $('#extension_number_minutes').val(objLReviewTime.inRMinutes);
            $('#extension_number_seconds').val(objLReviewTime.inRSeconds);
            $('#extension_number_milliseconds').val(objLReviewTime.inRMilliseconds);
        }
        catch(objRException) {
            var dtLDate = new Date();

            console.log(dtLDate.toLocaleString() + ' - ' + laneros_extension.get_message('extension_short_name') + ': ' +  objRException.message);
        }
    }
}( window.laneros_extension = window.laneros_extension || {}, jQuery ));
/**
 * Run on Document Load
 */
try {
    laneros_extension.get_storage(laneros_extension.objRGlobalOptions, laneros_extension.get_options);
}
catch(objRException) {
    var dtLDate = new Date();

    console.log(dtLDate.toLocaleString() + ' - ' + laneros_extension.get_message('extension_short_name') + ': ' +  objRException.message);
}