'use strict';

const request = require('superagent'),
      log = require('../log');

class AppOptics {
    constructor() {
        this._url = 'https://api.appoptics.com/v1/measurements';
    }

    init(opt) {
        if (opt == null || !('token' in opt) || opt.token.length == 0) {
            const errorMsg = 'AppOptics: error token empty!';
            log.error(errorMsg);
            throw new Error(errorMsg);
        }

        const buff = new Buffer(opt.token + ':');
        this._token = 'Basic ' + buff.toString('base64');
    }

    _collectValues(name, values) {
        const valuesMap = {};
        for (const index in values) {
            const value = values[index];
            const key = value[0] - value[0] % 60;
            if (key in valuesMap) {
                const valueObj = valuesMap[key];
                valueObj.count += 1;
                valueObj.sum += value[1];

                if (value[1] < valueObj.min) {
                    valueObj.min = value[1];
                }

                if (value[1] > valueObj.max) {
                    valueObj.max = value[1];
                }
            } else {
                // init value
                const valueObj = {
                    name: name,
                    period: 60,
                    time: key,
                    count: 1,
                    sum: value[1],
                    min: value[1],
                    max: value[1],
                    last: value[1],
                };
                valuesMap[key] = valueObj;
            }
        }

        return Array.from(Object.values(valuesMap));
    }

    async send(name, values, tags) {
        if (tags == null || Object.keys(tags).length == 0) {
            tags = {
                general: "general"
            }
        }

        const newTags = {};
        for (const key in tags) {
            const tag = tags[key];
            if (tag.length > 0) {
                newTags[key] = tag.replace(" ", "_");
            } else {
                log.error("Metric reporter: tag key: " + key + " - is empty!")
            }
        }

        const sendData = {
            tags: newTags,
            measurements: this._collectValues(name, values)
        };

        const res = await request.post(this._url)
            .set("Authorization", this._token)
            .set("Content-Type", "application/json")
            .send(sendData);
        if (res.statusCode && res.statusCode != 202)
            throw `Got error ${res.statusCode}`;
    }
}

module.exports = AppOptics;