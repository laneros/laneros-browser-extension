/*
 * Cada cuanto se va a revisar por nuevas actualizaciones (milisegundos)
 */
const TIEMPO_REVISADA = 120000;
/*
 * Cuanto dura la notificacion en pantalla (milisegundos)
 */
const TIEMPO_NOTIFICACION = 15000;
/*
 * Tiempos en Array
 */
objLANeros = new Object();
objLANeros.TimeRev = TIEMPO_REVISADA;
objLANeros.TimeShow = TIEMPO_NOTIFICACION;
objLANeros.ShowNot = true;
objLANeros.ShowSubs = true;
objLANeros.ShowPopup = true;
/*
 * Variables
 */
var interval, notification;
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
 * Actualizar Icono
 */
function updateIcon(count) {
    if(count == 0) {
        chrome.browserAction.setIcon({path:"images/laneros.png"});
    }
    else if(count < 9) {
        chrome.browserAction.setIcon({path:"images/laneros" + count + ".png"});
    }
    else {
        chrome.browserAction.setIcon({path:"images/lanerosPlus.png"});
    }
}
/*
 * Reiniciar Intervalos
 */
function reboot() {
    var TimeRev = getLocalValue("TimeRev");

    clearInterval(interval);
    showNotifications();
    interval = setInterval("showNotifications()", TimeRev);
}
/*
 * Guardra Opciones
 */
function setOptions() {
    var TimeShow  = getLocalValue("TimeShow");
    var TimeRev   = getLocalValue("TimeRev");
    var ShowNot   = getLocalValue("ShowNot");
    var ShowSubs  = getLocalValue("ShowSubs");
    var ShowPopup = getLocalValue("ShowPopup");

    var showTime = getTime(TimeShow);
    var revTime  = getTime(TimeRev);

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

        if (TimeShow > 0) {
            setLocalValue("TimeShow", TimeShow);
        }
        if (TimeRev > 0) {
            setLocalValue("TimeRev", TimeRev);
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

        reboot();
    });
}
/*
 * Mostrar Notificacion Popup Inferior
 */
function showNotifications() {
    var counter = 0;

    $.get("http://www.laneros.com/subscription.php?do=viewsubscription", function(data, textStatus, jqXHR) {
        var subscriptions = $(data).find("[id^='thread_gotonew_']");

        counter = getNotifications(data, textStatus, jqXHR);
        counter += parseInt($(subscriptions).size());
    }).error(function() {
        $("#content").removeClass().addClass("error")
            .html("Error al obtener notificaciones de LANeros.com");
        $("#content_suscriptions").removeClass().addClass("error")
            .html("Error al obtener los temas suscritos de LANeros.com");
    }).complete(function() {
        var ShowPopup = getLocalValue("ShowPopup");

        if (ShowPopup == "true") {
            var TimeShow = getLocalValue("TimeShow");

            notification = webkitNotifications.createHTMLNotification(
                'notification.html'
            );
            notification.show();
            setTimeout("closeNotification()", TimeShow);
        }
        updateIcon(counter);
    });
}
/*
 * Cerrar Notificacion Popup Inferior
 */
function closeNotification() {
    notification.cancel();
    notification = null;
}
/*
 * Obtener Notificaciones
 */
function getNotifications(data, textStatus, jqXHR) {
    var ShowNot = getLocalValue("ShowNot");
    var notifications = $(data).find("#notifications_menu");
    var counter = 0;

    if (ShowNot == "true") {
        $("#showNotifications").show();
    }

    if ($(notifications).size() == 0) {
        $("#notifications").addClas("none").html("No hay notificaciones nuevas");
    }
    else {
        $("#notifications").html("");
        var p = document.createElement("p");
        var unreads = $(p).clone();

        $(notifications).find("td a").each(function(index) {
            var title, unread = 0;
            var url = "http://www.laneros.com/" + $(this).attr("href");

            var div = document.createElement("div");
            var a = document.createElement("a");

            var clear = $(div).clone();

            if (index % 2 == 0) {
                title = $(this).html();

                $(a).attr("target", "_blank").attr("title", title)
                    .attr("href", url).html(title).appendTo(p);
                $(p).addClass("name").appendTo(div);
            }
            else {
                unread = parseInt($(this).html());
                $(unreads).addClass("value unread").html(unread).appendTo(div);

                if (unread > 0) {
                    counter += unread;
                    $(p).appendTo("#notifications");
                    $(div).appendTo("#notifications");
                    $(clear).addClass("both").appendTo("#notifications");
                }
                else {
                    $(p).html("");
                }
            }
        });
    }

    return counter;
}
/*
 * Obtener Suscripciones
 */
function getSubscriptions(data, textStatus, jqXHR) {
    var ShowSubs = getLocalValue("ShowSubs");
    var subscriptions = $(data).find("[id^='thread_gotonew_']");

    if (ShowSubs == "true") {
        $("#showSubscriptions").show();
    }

    if ($(subscriptions).size() == 0) {
        $("#subscriptions").addClass("none").html("No hay temas suscritos sin leer");
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
/*
 * Funciones de Conversion de Tiempo (2 digitos)
 */
function two(x) {
    return ((x > 9) ? "" : "0" ) + x;
}
/*
 * Funciones de Conversion de Tiempo (3 digitos)
 */
function three(x) {
    return ((x > 99 ) ? "" : "0" ) + two(x);
}
/*
 * Funcion de Conversion de MS a d:hh:mm:ss:ms
 */
function getTime(ms) {
    var sec = Math.floor(ms/1000)
    ms = ms % 1000
    t = three(ms)

    var min = Math.floor(sec/60)
    sec = sec % 60
    t = two(sec) + ":" + t

    var hr = Math.floor(min/60)
    min = min % 60
    t = two(min) + ":" + t

    var day = Math.floor(hr/60)
    hr = hr % 60
    t = two(hr) + ":" + t
    t = day + ":" + t

    return t;
}