/**
 * Run on Document Load
 */
try {
    Laneros.getStorage(Laneros.getOptions(), Laneros.showOptions);
} catch (objRException) {
    Laneros.logMessage('options', objRException.message);
}
