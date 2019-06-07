/**
 * Run on Document Load
 */
try {
    Laneros.getStorage({ bolRIsRunning : false }, function() {
        //noinspection JSUnresolvedVariable
        chrome.runtime.onInstalled.addListener(Laneros.setBackground);
        Laneros.setBackground();
    });
} catch (objRException) {
    Laneros.logMessage('background', objRException.message);
}