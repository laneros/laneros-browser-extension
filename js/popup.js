/*
 * Ejecutar al Cargar el Documento
 */
$(document).ready(parseLANeros);
/*
 * Actualizar Icono
 */
function updateBadge() {
    if (counter > 0) {
        chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255]});
        chrome.browserAction.setBadgeText({ text: '' + counter});
    }
    else {
        chrome.browserAction.setBadgeText({ text: ''});
    }
}
/*
 * Obtener los Datos de Conversaciones, Alertas y Suscripciones
 */
function parseLANeros() {
    var jqxhr = $.get(url + "watched/threads/all", function(data, textStatus, jqXHR) {
        var subscriptions = $(data).find(".discussionList .discussionListItems li");

        counter = getConversations(data, textStatus, jqXHR);
        counter += getAlerts(data, textStatus, jqXHR);
        counter += parseInt($(subscriptions).size());

        getSubscriptions(data, textStatus, jqXHR);
        showLinks(data, textStatus, jqXHR);
    }).complete(function() {
        updateBadge();
    }).error(function (xhr, ajaxOptions, thrownError) {
        var login = $(xhr.responseText).find("form[action='login/login']");
        doLogin(login);
    });

    return jqxhr;
}
/*
 * Obtener Conversaciones
 */
function getConversations(data, textStatus, jqXHR) {
    var div = document.createElement("div");
    var ShowInbox = getLocalValue("ShowInbox");
    var conversations = parseInt($(data).find("ul.visitorTabs .inbox strong.itemCount .Total").text());

    if (ShowInbox == "true") {
        var ShowAlerts = getLocalValue("ShowAlerts");
        var ShowSubs = getLocalValue("ShowSubs");
        var ShowLinks = getLocalValue("ShowLinks");

        $(div).attr("id", "conversations").appendTo(".conversations");
        $(".conversations h2").html(getMessage("conversation"));

        if (conversations == 0) {
            $("#conversations").addClass("none").html(getMessage("zeroInbox"));
        }
        else {
            var token = $(data).find("input[name=_xfToken]:eq(0)").val();
            var title;

            $("#conversations").html("");
            $.get(url + "conversations/popup?&_xfRequestUri=/watched/threads&_xfNoRedirect=1&_xfToken="+token+"&_xfResponseType=json", function(json, textStatus, jqXHR) {
                var div = document.createElement("div");
                $(div).html(json.templateHtml);

                $(div).find("div.listItemText").each(function(index) {
                    if (index < conversations && index < 5) {
                        var div = document.createElement("div");
                        var p = document.createElement("p");

                        $(p).html($(this).find("h3").html());
                        $(this).find("h3").replaceWith(p);
                        $(this).find("a").each(function() {
                            var href = $(this).attr("href");

                            $(this).attr("href", url + href)
                                .attr("target", "_blank");
                        });

                        $(div).addClass("result both").append($(this).html())

                        $("#conversations").append(div);

                    }
                });
            });
        }
        if (ShowAlerts == "true" || ShowSubs == "true" || ShowLinks == "true") {
            $("#showResponse .clear:eq(0)").show();
        }
    }

    return conversations;
}
/*
 * Obtener Alertas
 */
function getAlerts(data, textStatus, jqXHR) {
    var div = document.createElement("div");
    var ShowAlerts = getLocalValue("ShowAlerts");
    var alerts = parseInt($(data).find("ul.visitorTabs .alerts strong.itemCount .Total").text());

    if (ShowAlerts == "true") {
        var ShowSubs = getLocalValue("ShowSubs");
        var ShowLinks = getLocalValue("ShowLinks");

        $(div).attr("id", "alerts").appendTo(".alerts");
        $(".alerts h2").html(getMessage("alert"));

        if (alerts == 0) {
            $("#alerts").addClass("none").html(getMessage("zeroAlerts"));
        }
        else {
            var token = $(data).find("input[name=_xfToken]:eq(0)").val();

            $("#alerts").html("");

            $.get(url + "account/alerts-popup?&_xfRequestUri=/watched/threads&_xfNoRedirect=1&_xfToken="+token+"&_xfResponseType=json", function(json, textStatus, jqXHR) {
                var div = document.createElement("div");
                $(div).html(json.templateHtml);

                $(div).find("div.listItemText").each(function(index) {
                    if (index < alerts && index < 5) {
                        var div = document.createElement("div");
                        var p = document.createElement("p");

                        $(p).html($(this).find("h3").html());
                        $(this).find("h3").replaceWith(p);
                        $(this).find("a").each(function() {
                            var href = $(this).attr("href");

                            $(this).attr("href", url + href)
                                .attr("target", "_blank");
                        });
                        $(div).addClass("result both").append($(this).html())

                        $("#alerts").append(div);
                    }
                });
            });
        }
        if (ShowSubs == "true" || ShowLinks == "true") {
            $("#showResponse .clear:eq(1)").show();
        }
    }

    return alerts;
}
/*
 * Obtener Suscripciones
 */
function getSubscriptions(data, textStatus, jqXHR) {
    var div = document.createElement("div");

    var subscriptions = $(data).find(".discussionList .discussionListItems li");
    var ShowSubs = getLocalValue("ShowSubs");
    var ShowLinks = getLocalValue("ShowLinks");

    if (ShowSubs == "true") {
        $(div).attr("id", "subscriptions").appendTo(".subscriptions");
        $(".subscriptions h2").html(getMessage("subscription"));

        if ($(subscriptions).size() == 0) {
            $("#subscriptions").addClass("none").html(getMessage("zeroSubs"));
        }
        else {
            var ul = document.createElement("ul");

            $("#subscriptions").html("");

            $(subscriptions).each(function(index) {
                var div = document.createElement("div");
                var names = document.createElement("li");
                var br = document.createElement("br");

                $(this).find("a").each(function() {
                    var href = $(this).attr("href");

                    $(this).attr("href", url + href)
                        .attr("target", "_blank");

                    if ($(this).attr("title") == "") {
                        $(this).attr("title", $(this).html());
                    }
                });

                $(this).find("h3.title a").appendTo(div);
                $(br).appendTo(div);
                $(div).append($(this).find(".lastPostInfo dd").html());

                $(div).addClass("result both").appendTo(names);

                $(names).addClass("name").appendTo(ul);
            });

            $(ul).appendTo("#subscriptions");
        }
        if (ShowLinks == "true") {
            $("#showResponse .clear:eq(2)").show();
        }
    }
}
/*
 * Mostrar Accesos directos
 */
function showLinks(data, textStatus, jqXHR) {
    var ShowLinks = getLocalValue("ShowLinks");

    if (ShowLinks == "true") {
        var div = document.createElement("div");
        var a = document.createElement("a");

        var clear = $(div).clone().addClass("both");

        var logout = $(data).find("#AccountMenu .secondaryContent:eq(1) ul.col2 li").html();

        $(div).attr("id", "links").appendTo(".link");
        $(".link h2").html(getMessage("link"));

        $(a).addClass("name half").attr("target", "_blank");

        $(a).clone().attr("title", getMessage("cp"))
            .attr("href", url + "account/").html(getMessage("cp"))
            .appendTo(div);
        $(a).clone().attr("title", getMessage("subscription"))
            .attr("href", url + "watched/threads/all").html(getMessage("subscription"))
            .appendTo(div);
        $(clear).clone().appendTo("#links");
        $(a).clone().attr("title", getMessage("conversation"))
            .attr("href", url + "conversations").html(getMessage("conversation"))
            .appendTo(div);
        $(a).clone().attr("title", getMessage("alert"))
            .attr("href", url + "account/alerts").html(getMessage("alert"))
            .appendTo(div);
        $(clear).clone().appendTo("#links");

        $(a).clone().attr("title", getMessage("mail"))
            .attr("href", "https://www.google.com/a/laneros.com/ServiceLogin?service=mail&passive=true&rm=false&continue=http%3A%2F%2Fmail.google.com%2Fa%2Flaneros.com%2F&ltmpl=default&ltmplcache=2")
            .attr("target", "_blank").html(getMessage("mail"))
            .appendTo(div);
        $(logout).attr("target", "_blank").attr("title", getMessage("logout"))
            .attr("href", url + $(logout).attr("href")).html(getMessage("logout"))
            .addClass("logout").appendTo(div);
    }
}
/*
 * Obtener el formulario de login
 */
function doLogin(login) {
    var action = $(login).parent().find("form").attr("action");

    $(login).find("a").each(function() {
        aURL = url + $(this).attr("href");
        $(this).attr("href", aURL).attr("target", "_blank");
    });
    $(login).parent().find("form").attr("action", url + action)
        .attr("target", "_blank");

    $("#showResponse").html(login);
}