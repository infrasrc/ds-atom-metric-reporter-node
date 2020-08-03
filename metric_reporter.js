'use strict';

const log = require('./log'),
    drivers = require('./drivers/drivers'),
    Drivers = new drivers(),
    crypto = require('crypto'),
    moment = require('moment');

class MetricReporter {
    constructor(driverName, driverOptions, interval, maxMetrics, prefix, logger) {
        // init driver
        driverName = driverName || "";
        this._driver = Drivers.getDriver(driverName);
        if (this._driver == null) {
            let errMsg = 'Metric Reporter: error driver: ' + driverName + ' not found!';
            log.error(errMsg);
            throw new Error(errMsg);
        }
        this._driver.init(driverOptions);

        // init logger
        log.init(logger || console);

        // check types
        this._interval = interval || 1;
        this._maxMetrics = maxMetrics || 100;
        this._prefix = prefix || "";

        this._metrics = {};

        this._isRunning = true;

        let self = this;
        this._flush_interval = setInterval(function () {
            self._flushAll().then(res => {}).catch(reason => {});
        }, this._interval * 1000);
    }

    async send(name, value, tags) {
        if (this._prefix.length > 0) {
            name = this._prefix + '.' + name;
        }

        this._safeMetric(name, value, tags);
        return Promise.resolve();
    }

    async stop() {
        if (!this._isRunning) {
            return;
        }

        log.info("Metric reporter: flush from stop");
        this._isRunning = false;
        clearInterval(this._flush_interval);

        try {
            await this._flushAll();
        } catch (err) {
            return Promise.reject(err);
        }
        return Promise.resolve();
    }

    _safeMetric(name, value, tags) {
        let hashKey = this._calcHash(name, tags);

        if (hashKey in this._metrics) {
            let metric = this._metrics[hashKey];

            metric.points.push([moment().unix(), value]);

            this._flush(false, metric).then(res => {}).catch(reason => {});
        } else {
            let metric = {
                name: name,
                points: [],
                tags: tags,
                startTime: moment(),
            };

            metric.points.push([moment().unix(), value]);

            this._metrics[hashKey] = metric;
        }
    }

    _calcHash(name, tags) {
        let hashData = name;

        let hashList = [];
        for (let key in tags) {
            let tag = tags[key];

            hashList.push(key);
            hashList.push(tag);
        }
        hashList = hashList.sort();

        for (var index in hashList) {
            hashData += hashList[index];
        }

        return crypto.createHash('md5').update(hashData).digest('hex')
    }

    _clearMetric(metric) {
        metric.startTime = moment();
        metric.points = [];
    };

    async _flush(isForce, metric) {
        let isNeedSend = metric.points.length != 0 && (isForce ||
            (metric.points.length >= this._maxMetrics));

        if (isNeedSend) {
            const metricName = metric.name;
            const metricPoints = metric.points;
            const metricTags = metric.tags;

            this._clearMetric(metric);

            try {
                await this._driver.send(metricName, metricPoints, metricTags);
            } catch (err) {
                log.error("Metric reporter: " + err);
                return Promise.reject(err);
            }
        }

        return Promise.resolve();
    }

    async _flushAll() {
        for (let key in this._metrics) {
            let metric = this._metrics[key];

            try {
                await this._flush(true, metric);
            } catch (err) {
                return Promise.reject(err);
            }
        }

        // clear all metrics
        this._metrics = {};

        return Promise.resolve('Flushed metrics');
    }
}

module.exports = MetricReporter;