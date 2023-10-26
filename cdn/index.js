const url = require("url");
const path = require("path");
const Rx = require("rx");
const https = require("https");
const http = require("http");

const exists = function (remote) {
  const base = path.join(remote, this.mainFile);
  const location = new URL(url.resolve(this.root, base));
  const httpModule = location.protocol === "https:" ? https : http;

  this.logger.info(`Checking if file at ${location} exists`);
  return Rx.Observable.create(function (observer) {
    httpModule
      .request(location, { method: "HEAD" }, (res) => {
        observer.onNext(response.statusCode == 200);
      })
      .on("error", () => observer.onNext(false))
      .on("close", () => observer.onCompleted());
  });
};

module.exports = function (options) {
  this.logger = options.logger;
  this.root = options.cdn;
  this.mainFile = options.mainBundleFile;
  this.exists = exists;
};
