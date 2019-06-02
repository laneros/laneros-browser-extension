/*
 * Objeto con los Datos Basicos
 */
objLANeros = new Object();
objLANeros.TimeRev = 120000;
objLANeros.TimeShow = 15000;
objLANeros.TimePopup = 300000;
objLANeros.ShowNot = "true";
objLANeros.ShowSubs = "true";
objLANeros.ShowPopup = "true";
objLANeros.isRunning = "false";
/*
 * Variables
 */
var intervalPopup, intervalBG, notification, globalCounter = 0, counter = 0;
/*
 * Ejecutar al Cargar el Documento
 */
$(document).ready(function() {
    $("#showLoading").ajaxStart(function() {
        $(this).show();
        $("#showResponse").hide();
        $(this).find("h3").html(getMessage("loading"));
    })
    .ajaxStop(function() {
        $(this).hide();
        $("#showResponse").show();
    })
    .ajaxError(function() {
        $(this).addClass("error").html(getMessage("error"));
    });
});
/*
 * Obtener un valor Guardado
 */
function getLocalValue(value) {
    if(localStorage[value] == undefined) {
        return(objLANeros[value]);
    }
    else {
        return(localStorage[value]);
    }
}
/*
 * Cambiar un valor Guardado
 */
function setLocalValue(key, value) {
    localStorage[key] = value;
}
/*
 * Obtener un mensaje de acuerdo a la localizacion
 */
function getMessage(string) {
    return chrome.i18n.getMessage(string);
}
/*
 * Actualizar Icono
 */
function updateIcon() {
    if (counter > 0) {
        chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255]});
        chrome.browserAction.setBadgeText({ text: '' + counter});
    }
}
/*
 * Obtener los Datos de Notificaciones y Suscripciones
 */
function parseLANeros() {
    var jqxhr = $.get("http://www.laneros.com/subscription.php", function(data, textStatus, jqXHR) {
        var subscriptions = $(data).find("[id^='thread_gotonew_']");

        counter = getNotifications(data, textStatus, jqXHR);
        counter += parseInt($(subscriptions).size());

        getSubscriptions(data, textStatus, jqXHR);
    }).complete(function() {
        updateIcon();
    });

    return jqxhr;
}
/*
 * Obtener Notificaciones
 */
function getNotifications(data, textStatus, jqXHR) {
    var div = document.createElement("div");

    var notifications = $(data).find("#notifications_menu");
    var ShowNot = getLocalValue("ShowNot");
    var counter = 0;

    if (ShowNot == "true") {
        var ShowSubs = getLocalValue("ShowSubs");

        $(div).attr("id", "notifications").appendTo(".notification");
        $(".notification h2").html(getMessage("notification"));

        if ($(notifications).size() == 0) {
            $("#notifications").addClass("none").html(getMessage("zeroNots"));
        }
        else {
            var title;
            $("#notifications").html("");

            $(notifications).find("td a").each(function(index) {
                var div = document.createElement("div");
                var a = document.createElement("a");

                var unreads = $(div).clone();
                var names = $(div).clone();
                var clear = $(div).clone();

                var unread = 0;
                var url = "http://www.laneros.com/" + $(this).attr("href");

                if (index % 2 == 0) {
                    title = $(this).html();
                }
                else {
                    unread = parseInt($(this).html());

                    if (unread > 0) {
                        counter += unread;
                        $(a).attr("target", "_blank").attr("title", title)
                            .attr("href", url).html(title).appendTo(names);
                        $(names).addClass("name").appendTo(div);

                        $(div).appendTo("#notifications");
                        $(unreads).addClass("value unread").html(unread).appendTo(div);
                        $(clear).addClass("both").appendTo("#notifications");
                    }
                }
            });
        }
        if (ShowSubs == "true") {
            $("#showResponse .clear").show();
        }
    }

    return counter;
}
/*
 * Obtener Suscripciones
 */
function getSubscriptions(data, textStatus, jqXHR) {
    var div = document.createElement("div");

    var subscriptions = $(data).find("[id^='thread_gotonew_']");
    var ShowSubs = getLocalValue("ShowSubs");

    if (ShowSubs == "true") {
        $(div).attr("id", "subscriptions").appendTo(".subscription");
        $(".subscription h2").html(getMessage("subscription"));

        if ($(subscriptions).size() == 0) {
            $("#subscriptions").addClass("none").html(getMessage("zeroSubs"));
        }
        else {
            $("#subscriptions").html("");

            $(subscriptions).each(function(index) {
                var div = document.createElement("div");
                var p = document.createElement("p");
                var a = document.createElement("a");

                var clear = $(div).clone();

                var container = $(this).parent();
                var url = "http://www.laneros.com/" + $(this).attr("href");
                var title = $(container).find("a:eq(2)").html();

                $(a).attr("target", "_blank").attr("title", title)
                    .attr("href", url).html(title).appendTo(p);
                $(p).addClass("name").appendTo(div);
                $(div).appendTo("#subscriptions");
                $(clear).addClass("both").appendTo("#subscriptions");
            });
        }
    }
}
function bgFunction() {
    var TimeRev = parseInt(getLocalValue("TimeRev"));
    var TimePopup =  parseInt(etLocalValue("TimePopup"));
    var jqxhr = parseLANeros();

    jqxhr.complete(function() {
        setInterval("parseLANeros()", TimeRev);

        if (getLocalValue("isRunning") == "false") {
            showNotifications();
            setInterval("showNotifications()", TimePopup);
        }
       else {
            closeNotification();
            showNotifications();
            setInterval("showNotifications()", TimePopup);
        }
    });
}
/*
 * Mostrar Notificacion Popup Inferior
 */
function showNotifications() {
    if (globalCounter < counter) {
        var ShowPopup = getLocalValue("ShowPopup");
        var TimeShow = parseInt(getLocalValue("TimeShow"));

        globalCounter = counter;

        if (ShowPopup == "true" && TimeShow > 0) {
            notification = webkitNotifications.createHTMLNotification(
                'notification.html'
            );
            notification.show();
            setTimeout("closeNotification()", TimeShow);
            setLocalValue("isRunning", true);
        }
    }
    if (counter == 0) {
        globalCounter = 0;
    }
}
/*
 * Cerrar Notificacion Popup Inferior
 */
function closeNotification() {
    setLocalValue("isRunning", false);
    notification.cancel();
    notification = null;
}/*
 * Reiniciar Intervalos
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

        intervalPopup = setInterval("showNotifications()", TimePopup);
        intervalBG = setInterval("parseLANeros()", TimeRev);
    });
}
/*
 * Guardra Opciones
 */
function setOptions() {
    span = document.createElement("span");

    var TimeShow  = parseInt(getLocalValue("TimeShow"));
    var TimeRev   = parseInt(getLocalValue("TimeRev"));
    var TimePopup = parseInt(getLocalValue("TimePopup"));
    var ShowNot   = getLocalValue("ShowNot");
    var ShowSubs  = getLocalValue("ShowSubs");
    var ShowPopup = getLocalValue("ShowPopup");

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

    $(span).clone().html(" " + getMessage("showNot")).insertAfter("#ShowNot");
    $(span).clone().html(" " + getMessage("showSubs")).insertAfter("#ShowSubs");
    $(span).clone().html(" " + getMessage("showPopup")).insertAfter("#ShowPopup");

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

    if (ShowNot == "true") {
        $("#ShowNot").attr("checked", true);
    }

    if (ShowSubs == "true") {
        $("#ShowSubs").attr("checked", true);
    }

    if (ShowPopup == "true") {
        $("#ShowPopup").attr("checked", true);
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

        if ($("#ShowNot").is(":checked")) {
            setLocalValue("ShowNot", true);
        }
        else {
            setLocalValue("ShowNot", false);
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

        $("#status").html(getMessage("success"));
        reboot();
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