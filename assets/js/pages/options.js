/**
 * Run on Document Load
 */
try {
    Laneros.getStorage(Laneros.getOptions(), Laneros.setOptions);
} catch (objRException) {
    Laneros.logMessage('options', objRException.message);
}
