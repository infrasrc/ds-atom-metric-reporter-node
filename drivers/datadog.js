'use strict';

const log = require('../log'),
      moment = require('moment'),
      request = require('request');

class Datadog {
    constructor() {
        this._timeout = 2 * 60 * 1000; // 2 min
    }

    init(opt) {
        if (opt == null || !(apiKey in opt) || opt.apiKey.length == 0) {
            const errorMsg = 'Datadog: error apiKey empty!';
            log.error(errorMsg);
            throw new Error(errorMsg);
        }

        this._url = "https://app.datadoghq.com/api/v1/series?api_key=" + apiKey;
    }

    send(name, values, tags) {
        let sendData = {
            metric: name,
            points: values
        };

        if (tags != null && Object.keys(tags).length > 0) {
            sendData.tags = tags
        }

        let self = this;
        return new Promise((resolve, reject) => {
            request.post(self._url, {
                json: sendData,
                timeout: self._timeout
            }, function (err, res, body) {
                if (err != null) {
                    reject(err);
                } else if (res != null && res.statusCode != 202) {
                    reject(body.errors ? JSON.stringify(body.errors) : res.statusCode);
                } else {
                    resolve(body);
                }
            });
        });
    }
}

module.exports = Datadog;