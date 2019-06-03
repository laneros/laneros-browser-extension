/*
 * Ejecutar al Cargar el Documento
 */
$(document).ready(bgFunction);
/*
 * Funcion que ejecuta las actualizaciones en segundo plano
 */
function bgFunction() {
    var TimeRev = parseInt(getLocalValue("TimeRev"));
    var TimePopup =  parseInt(getLocalValue("TimePopup"));
    var jqxhr = parseLANeros();

    jqxhr.complete(function() {
        setInterval(function() { parseLANeros(); }, TimeRev);

        if (getLocalValue("isRunning") == "true") {
            closeNotification();
        }

        showNotifications();
        setInterval(function() { showNotifications(); }, TimePopup);
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
            if (typeof webkitNotifications.createHTMLNotification == "function") {
                notification = webkitNotifications.createHTMLNotification(
                    'notification.html'
                );

                notification.show();
                setTimeout(function() { closeNotification(); }, TimeShow);
                setLocalValue("isRunning", true);
            }
            else {
                setLocalValue("isRunning", true);
                parseLANerosText();
            }
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

    if (typeof webkitNotifications.createHTMLNotification == "function") {
        notification.cancel();
        notification = null;
    }
    else {
        chrome.notifications.clear('notification',
            function(wasCleared) {
               return wasCleared;
            });
    }
}
/*
 * Obtener los Datos de Conversaciones, Alertas y Suscripciones
 * en texto plano para las notificaciones
 */
function parseLANerosText() {
    var items = new Array();
    var jqxhr = $.get(url + "watched/threads", function(data, textStatus, jqXHR) {
        var conversations = parseInt($(data).find("ul.visitorTabs .inbox strong.itemCount .Total").text());
        var alerts = parseInt($(data).find("ul.visitorTabs .alerts strong.itemCount .Total").text());
        var subscriptions = parseInt($(data).find(".discussionList .discussionListItems li").size());

        var conversation = {
            title: getMessage("conversation")
        }
        var alert = {
            title: getMessage("alert")
        }
        var subscription = {
            title: getMessage("subscription")
        }

        if (conversations == 0) {
            conversation.message = getMessage("zeroInbox");
        }
        else {
            conversation.message = conversations + " " + getMessage("new");
        }
        if (alerts == 0) {
            alert.message = getMessage("zeroAlerts");
        }
        else {
            alert.message = alerts + " " + getMessage("new");
        }
        if (subscriptions == 0) {
            subscription.message = getMessage("zeroSubs");
        }
        else {
            subscription.message = subscriptions + " " + getMessage("new");
        }

        items.push(conversation);
        items.push(alert);
        items.push(subscription);

        notification = chrome.notifications.create(
            'notification', {
                type: "basic",
                title: getMessage("extName"),
                message: getMessage("extDesc"),
                iconUrl: '../images/laneros.png',
                items: items,
                buttons: [
                    { title: getMessage("goTo"), iconUrl: '../images/laneros.png'}
                ]},
                function(notificationId) {
                    return notificationId;
                }
        );
        chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
            chrome.tabs.create({url: "http://www.laneros.com"}, function(tab) {});
        });
    });
}