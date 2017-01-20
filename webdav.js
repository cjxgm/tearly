'use strict';
/*\
title: $:/plugins/cjxgm/tearly/webdav.js
type: application/javascript
module-type: library
\*/

(function (tiddlersList) {
    function WebDAV() {}

    WebDAV.prototype.put = function(path, text) {
        console.log("DAV-PUT", path, { text: text });

        return new Promise((resolve, reject) => {
            var req = this.xhr(reject,
                    req => resolve(),
                    req => {
                        reject(new Error(req.statusText + "\n" + req.responseText));
                    });
            req.open("PUT", path);
            req.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
            req.send(text);
        });
    };

    WebDAV.prototype.delete = function(path) {
        console.log("DAV-DELETE", path);

        return new Promise((resolve, reject) => {
            var req = this.xhr(reject,
                    req => resolve(true),
                    req => {
                        if (req.status === 404) {     // file not found
                            resolve(false);
                        } else {
                            reject(new Error(req.statusText + "\n" + req.responseText));
                        }
                    });
            req.open("DELETE", path);
            req.send();
        });
    };

    WebDAV.prototype.mkcol = function(path) {
        console.log("DAV-MKCOL", path);
        if (!path.endsWith("/")) throw new Error("Path for MKCOL must end with a slash: " + path);

        return new Promise((resolve, reject) => {
            var req = this.xhr(reject,
                    req => resolve(true),
                    req => {
                        if (req.status === 405) {     // maybe collection exists already
                            resolve(false);
                        } else {
                            reject(new Error(req.statusText + "\n" + req.responseText));
                        }
                    });
            req.open("MKCOL", path);
            req.send();
        });
    };

    WebDAV.prototype.xhr = function(reject, ok, fail) {
        var req = new XMLHttpRequest();
        req.onload = function() {
            if (this.status >= 200 && this.status < 300) {
                ok(this);
            } else {
                fail(this);
            }
        };
        req.onerror = function (ev) {
            console.error(ev);
            reject(new Error("interrupted"));
        };
        req.onabort = function (ev) {
            console.error(ev);
            reject(new Error("abort"));
        };
        return req;
    }

    this.WebDAV = WebDAV;
}).call(exports);

