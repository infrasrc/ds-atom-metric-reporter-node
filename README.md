# metric-reporter-node   

[![License][license-image]][license-url]
[![Docs][docs-image]][docs-url]

metric-reporter-node is SDK for Node.JS Javascript to send reports for applications monitoring like: [Datadog](https://www.datadoghq.com/), 
[Appoptics](https://www.appoptics.com) etc.

- [Documentation][docs-url]
- [Installation](#installation)
- [Usage](#usage)
- [Change Log](#change-log)
- [Example](#example)

## Installation
### Installation using npm
```sh
$ npm install metric-reporter-node --save
```

## Usage
Create metric reporter for specific driver (datadog or appoptics)
```js
 // constructor args: <driver_name>, <driver_config>, <flush_interval>, <max_metrics>, <metric_prefix>, <logger_instance>
 let reporter = new MetricReporter("appoptics", {token: "test_token"}, 2, 140, "", logger);
```

Send report
```js
// send args: <metric_name>, <metric_value>, <tags>
reporter.send("test_metric", 1, { test: "" });
```

Save shutdown reporter:
```js
['exit', 'SIGINT', 'SIGHUP', 'SIGQUIT', 'SIGABRT', 'SIGTERM'].map(function (event) {
    process.on(event, () => {
        console.info('SIGTERM signal received: ' + event);
        reporter.stop();
    });
});
```

## Example
You can use our [example][example-url] for sending reports.

## License
[MIT](LICENSE)

[example-url]: metric_reporter_test.js

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg?style=square
[license-url]: LICENSE

[docs-url]: https://ironsource.github.io/metric-reporter-node/
[docs-image]: https://img.shields.io/badge/docs-latest-blue.svg

