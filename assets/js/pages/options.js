/**
 * function getOptions
 *
 * Get Extension Options
 *
 * @param theOptions
 */
function getOptions(theOptions) {
    var theReviewTime  = getTime(theOptions.TimeRev);

    $("#FormOptions").validate();
    $("#TxtShowInbox").val(theOptions.ShowInbox);
    $("#TxtShowAlerts").val(theOptions.ShowAlerts);
    $("#TxtShowSubs").val(theOptions.ShowSubs);
    $("#TxtShowNotification").val(theOptions.ShowNotification);
    $("#TxtShowLinks").val(theOptions.ShowLinks);

    $("input[type=checkbox]").each(function() {
        if ($(this).val() == "true") {
            $(this).attr("checked", true);
        }
    }).on("switchChange", function() {
        var theValue = $(this).val() == "true";

        $(this).val(!theValue);
    }).bootstrapSwitch({"onColor" : "success", "offColor" : "danger"});

    $("#TxtReviewHours").val(theReviewTime.theHours);
    $("#TxtReviewMins").val(theReviewTime.theMinutes);
    $("#TxtReviewSecs").val(theReviewTime.theSeconds);
    $("#TxtReviewMillisecs").val(theReviewTime.theMilliseconds);

    $("#TxtSave").click(setOptions);
}
/**
 * function setOptions
 *
 * Set Extension Options
 */
function setOptions() {
    var TimeRev = parseInt($("#TxtReviewMillisecs").val())
        + (parseInt($("#TxtReviewSecs").val()) * 1000)
        + (parseInt($("#TxtReviewMins").val()) * 60 * 1000)
        + (parseInt($("#TxtReviewHours").val()) * 60 * 60 * 1000);
    var theOptions = {};

    if (TimeRev > 0) {
        theOptions.TimeRev = TimeRev;
    }

    theOptions.ShowInbox  = ($("#TxtShowInbox").val() == "true");
    theOptions.ShowAlerts = ($("#TxtShowAlerts").val() == "true");
    theOptions.ShowSubs = ($("#TxtShowSubs").val() == "true");
    theOptions.ShowNotification = ($("#TxtShowNotification").val() == "true");
    theOptions.ShowLinks = ($("#TxtShowLinks").val() == "true");

    setStorageValue(theOptions, function() {
        $("#responseContainer").removeClass("hide");
        runLANerosBg();
    });
}
/**
 * function getTime
 *
 * Convert Milliseconds to Object
 *
 * @param theMilliseconds
 */
function getTime(theMilliseconds) {
    var theTime = new Object();

    var theSeconds = Math.floor(theMilliseconds / 1000);
    var theMinutes = Math.floor(theSeconds / 60);
    var theHours = Math.floor(theMinutes / 60);
    var theDays = Math.floor(theHours / 60);

    theTime.theMilliseconds = parseInt(theMilliseconds % 1000);
    theTime.theSeconds = parseInt(theSeconds % 60);
    theTime.theMinutes = parseInt(theMinutes % 60);
    theTime.theHours = parseInt(theHours % 60);

    return theTime;
}
/**
 * Run on Document Load
 */
getStorageValue(theGlobalOptions, getOptions);