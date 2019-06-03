/*
 * Ejecutar al Cargar el Documento
 */
$(document).ready(setOptions);
/*
 * Guardar Opciones
 */
function setOptions() {
    span = document.createElement("span");

    var TimeShow   = parseInt(getLocalValue("TimeShow"));
    var TimeRev    = parseInt(getLocalValue("TimeRev"));
    var TimePopup  = parseInt(getLocalValue("TimePopup"));
    var ShowInbox  = getLocalValue("ShowInbox");
    var ShowAlerts = getLocalValue("ShowAlerts");
    var ShowSubs   = getLocalValue("ShowSubs");
    var ShowPopup  = getLocalValue("ShowPopup");
    var ShowLinks  = getLocalValue("ShowLinks");

    var showTime = getTime(TimeShow);
    var revTime  = getTime(TimeRev);
    var popTime  = getTime(TimePopup);

    $("#revision").html(getMessage("revision"));
    $("#duration").html(getMessage("duration"));
    $("#popup").html(getMessage("popup"));
    $("#others").html(getMessage("others"));

    $(span).clone().html(" " + getMessage("hours")).insertAfter("#hours_rev");
    $(span).clone().html(" " + getMessage("minutes")).insertAfter("#minutes_rev");
    $(span).clone().html(" " + getMessage("seconds")).insertAfter("#seconds_rev");
    $(span).clone().html(" " + getMessage("miliseconds")).insertAfter("#miliseconds_rev");

    $(span).clone().html(" " + getMessage("hours")).insertAfter("#hours_show");
    $(span).clone().html(" " + getMessage("minutes")).insertAfter("#minutes_show");
    $(span).clone().html(" " + getMessage("seconds")).insertAfter("#seconds_show");
    $(span).clone().html(" " + getMessage("miliseconds")).insertAfter("#miliseconds_show");

    $(span).clone().html(" " + getMessage("hours")).insertAfter("#hours_popup");
    $(span).clone().html(" " + getMessage("minutes")).insertAfter("#minutes_popup");
    $(span).clone().html(" " + getMessage("seconds")).insertAfter("#seconds_popup");
    $(span).clone().html(" " + getMessage("miliseconds")).insertAfter("#miliseconds_popup");

    $(span).clone().html(" " + getMessage("showInbox")).insertAfter("#ShowInbox");
    $(span).clone().html(" " + getMessage("showAlerts")).insertAfter("#ShowAlerts");
    $(span).clone().html(" " + getMessage("showSubs")).insertAfter("#ShowSubs");
    $(span).clone().html(" " + getMessage("showPopup")).insertAfter("#ShowPopup");
    $(span).clone().html(" " + getMessage("showLinks")).insertAfter("#ShowLinks");

    $("#save").val(getMessage("save"));

    arrTime = revTime.split(":");

    $("#miliseconds_rev").val(parseInt(arrTime[4]));
    $("#seconds_rev").val(parseInt(arrTime[3]));
    $("#minutes_rev").val(parseInt(arrTime[2]));
    $("#hours_rev").val(parseInt(arrTime[1]));

    arrTime = showTime.split(":");

    $("#miliseconds_show").val(parseInt(arrTime[4]));
    $("#seconds_show").val(parseInt(arrTime[3]));
    $("#minutes_show").val(parseInt(arrTime[2]));
    $("#hours_show").val(parseInt(arrTime[1]));


    arrTime = popTime.split(":");

    $("#miliseconds_popup").val(parseInt(arrTime[4]));
    $("#seconds_popup").val(parseInt(arrTime[3]));
    $("#minutes_popup").val(parseInt(arrTime[2]));
    $("#hours_popup").val(parseInt(arrTime[1]));

    if (ShowInbox == "true") {
        $("#ShowInbox").attr("checked", true);
    }

    if (ShowAlerts == "true") {
        $("#ShowAlerts").attr("checked", true);
    }

    if (ShowSubs == "true") {
        $("#ShowSubs").attr("checked", true);
    }

    if (ShowPopup == "true") {
        $("#ShowPopup").attr("checked", true);
    }

    if (ShowLinks == "true") {
        $("#ShowLinks").attr("checked", true);
    }

    $("#save").click(function() {
        TimeShow = parseInt($("#miliseconds_show").val()) + (parseInt($("#seconds_show").val()) * 1000)
            + (parseInt($("#minutes_show").val()) * 60 * 1000) + (parseInt($("#hours_show").val()) * 60 * 60 * 1000);
        TimeRev = parseInt($("#miliseconds_rev").val()) + (parseInt($("#seconds_rev").val()) * 1000)
            + (parseInt($("#minutes_rev").val()) * 60 * 1000) + (parseInt($("#hours_rev").val()) * 60 * 60 * 1000);
        TimePopup = parseInt($("#miliseconds_popup").val()) + (parseInt($("#seconds_popup").val()) * 1000)
            + (parseInt($("#minutes_popup").val()) * 60 * 1000) + (parseInt($("#hours_popup").val()) * 60 * 60 * 1000);

        if (TimeShow >= 0) {
            setLocalValue("TimeShow", TimeShow);
        }
        if (TimeRev >= 0) {
            setLocalValue("TimeRev", TimeRev);
        }
        if (TimePopup >= 0) {
            setLocalValue("TimePopup", TimePopup);
        }

        if ($("#ShowInbox").is(":checked")) {
            setLocalValue("ShowInbox", true);
        }
        else {
            setLocalValue("ShowInbox", false);
        }

        if ($("#ShowAlerts").is(":checked")) {
            setLocalValue("ShowAlerts", true);
        }
        else {
            setLocalValue("ShowAlerts", false);
        }

        if ($("#ShowSubs").is(":checked")) {
            setLocalValue("ShowSubs", true);
        }
        else {
            setLocalValue("ShowSubs", false);
        }

        if ($("#ShowPopup").is(":checked")) {
            setLocalValue("ShowPopup", true);
        }
        else {
            setLocalValue("ShowPopup", false);
        }

        if ($("#ShowLinks").is(":checked")) {
            setLocalValue("ShowLinks", true);
        }
        else {
            setLocalValue("ShowLinks", false);
        }

        $("#status").html(getMessage("success"));
        reboot();
    });
}
/*
 * Reiniciar Intervalos de Tiempo
 */
function reboot() {
    var TimeRev = parseInt(getLocalValue("TimeRev"));
    var TimePopup = parseInt(etLocalValue("TimePopup"));

    clearInterval(intervalPopup);
    clearInterval(intervalBG);

    var jqxhr = parseLANeros();

    jqxhr.complete(function() {
        closeNotification();
        showNotifications();

        intervalPopup = setInterval(function() { showNotifications(); }, TimePopup);
        intervalBG = setInterval(function() { parseLANeros(); }, TimeRev);
    });
}
/*
 * Funcion de Conversion de MS a d:hh:mm:ss:ms
 */
function getTime(ms) {
    var sec = Math.floor(ms/1000)
    ms = ms % 1000
    t = ms;

    var min = Math.floor(sec/60)
    sec = sec % 60
    t = sec + ":" + t

    var hr = Math.floor(min/60)
    min = min % 60
    t = min + ":" + t

    var day = Math.floor(hr/60)
    hr = hr % 60
    t = hr + ":" + t
    t = day + ":" + t

    return t;
}