'use strict';

const log = require('../log'),
      moment = require('moment'),
      request = require('superagent');

class Datadog {
    constructor() {
    }

    init(opt) {
        if (opt == null || !(apiKey in opt) || opt.apiKey.length == 0) {
            const errorMsg = 'Datadog: error apiKey empty!';
            log.error(errorMsg);
            throw new Error(errorMsg);
        }

        this._url = "https://app.datadoghq.com/api/v1/series?api_key=" + apiKey;
    }

    async send(name, values, tags) {
        const sendData = {
            metric: name,
            points: values
        };

        if (tags != null && Object.keys(tags).length > 0) {
            sendData.tags = tags
        }

        const res = await request.post(this._url)
            .set("Content-Type", "application/json")
            .send(sendData);
        if (res.statusCode && res.statusCode != 202)
            throw `Got error ${res.statusCode}`;
    }
}

module.exports = Datadog;