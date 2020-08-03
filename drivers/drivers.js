'use strict';

const log = require('../log'),
      appOptics = require('./appoptics'),
      datadog = require('./datadog');

class Drivers {
    constructor() {
        this._instances = {
            'datadog': new datadog(),
            'appoptics': new appOptics(),
        };
    }

    getDriver(name) {
        if (name in this._instances) {
            return this._instances[name];
        }

        log.error("Drivers: error can't find driver: " + name);
        return null;
    }
}

module.exports = Drivers;