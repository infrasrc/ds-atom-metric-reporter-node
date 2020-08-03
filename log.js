var log;

function init(localLog) {
    log = localLog
}

function info(message) {
    if (log.info != null) {
        log.info(message);
    }
}

function error(message) {
    if (log.error != null) {
        log.error(message);
    }
}

module.exports.init = init;
module.exports.info = info;
module.exports.error = error;