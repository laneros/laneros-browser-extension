/**
 * Log class
 */
class Log {
    /**
     * Class constructor
     */
    constructor(stRName) {
        console.log(new Date().toLocaleString() + ' | ' + Chrome.getMessage('extension_short_name') + ' - ' + stRName);
    }

    /**
     * Log error
     *
     * @param objRError
     */
    error(objRError) {
        console.error(objRError);
    }

    /**
     * Log text
     *
     * @param objRError
     */
    log(objRError) {
        console.log(objRError);
    }

    /**
     * Log trace
     */
    withTrace() {
        console.trace();
    }
}