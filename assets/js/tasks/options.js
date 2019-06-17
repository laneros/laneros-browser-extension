/**
 * Run on Document Load
 */
try {
    new Laneros($(document)).setOptionsPage();
} catch (objRException) {
    new Log('Options Task').error(objRException);
}