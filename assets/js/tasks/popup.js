/**
 * Run on Document Load
 */
try {
    new Laneros($(document)).setPopupPage();
} catch (objRException) {
    new Log('Popup Task').error(objRException);
}