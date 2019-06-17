/**
 * Run on Document Load
 */
try {
    new Background().onInstalled();
} catch (objRException) {
    new Log('Background Task').error(objRException);
}