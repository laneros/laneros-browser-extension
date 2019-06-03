/*
 * Objeto con los Datos Basicos
 */
objLANeros = new Object();
objLANeros.TimeRev = 120000;
objLANeros.TimeShow = 15000;
objLANeros.TimePopup = 300000;
objLANeros.ShowInbox = "true";
objLANeros.ShowAlerts = "true";
objLANeros.ShowSubs = "true";
objLANeros.ShowPopup = "true";
objLANeros.ShowLinks = "true";
objLANeros.isRunning = "false";
/*
 * Variables
 */
var intervalPopup, intervalBG, notification, globalCounter = 0, counter = 0;
var url = "http://www.laneros.com/";
/*
 * Ejecutar al Cargar el Documento
 */
$(document).ready(function() {
    $("#showLoading").ajaxStart(function() {
        $(this).show();
        $("#showResponse").hide();
        $(this).find(".info").html(getMessage("loading"));
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