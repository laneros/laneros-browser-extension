/**
 * Run on Document Load
 */
try {
    Laneros.getStorage({ bolRIsRunning : false },Laneros.showPopup);
} catch (objRException) {
    Laneros.logMessage('popup', objRException.message);
}