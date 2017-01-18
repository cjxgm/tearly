'use strict';

(function () {
    function Aborted() {}

    /////////////////////////////////////////////////////

    function Utils() {}

    Utils.prototype.clamp = function(x, min, max) {
        return Math.max(Math.min(x, max), min);
    };

    Utils.prototype.get = function(url, progress) {
        progress = progress || (frac => {});
        return new Promise((resolve, reject) => {
            progress(0);
            var req = new XMLHttpRequest();
            req.onload = function() {
                if (this.status >= 200 && this.status < 300) {
                    progress(1);
                    resolve(this.responseText);
                }
                else {
                    reject(new Error(this.statusText + "\n" + this.responseText));
                }
            };
            req.onerror = function (ev) {
                console.error(ev);
                if (ev.type === 'error') {
                    reject(new Error("interrupted"));
                } else {
                    reject(new Error("unknown error"));
                }
            };
            req.onabort = function (ev) {
                console.error(ev);
                reject(new Aborted());
            };
            req.onprogress = function (ev) {
                if (ev.lengthComputable) progress(ev.loaded / ev.total);
            };
            req.open("GET", url);
            req.overrideMimeType("text/plain");
            req.send();
        });
    };

    Utils.prototype.later = function(ms) {
        return new Promise((resolve, reject) => {
            window.setTimeout(() => resolve(), ms);
        });
    };

    Utils.prototype.decodeTiddlerFields = function(text) {
        text = text.split("\n");

        var title = text.splice(0, 1)[0];
        var fields = JSON.parse(text.splice(0, 1)[0]);
        text = text.join("\n");

        fields.title = title;
        fields.text = text;

        return fields;
    };

    /////////////////////////////////////////////////////

    function Bootloader(elBootloader)
    {
        this.elBootloader = elBootloader;
        this.elProgress = elBootloader.querySelector(".progress");
        this.elError = elBootloader.querySelector(".error");
        this.utils = new Utils();
        this.config = {
            tiddlersList: "./tiddlers.list",
            kernelPrefix: "$:/boot/bootprefix.js",
            kernel: "$:/boot/boot.js",
        };
    }

    Bootloader.prototype.boot = function () {
        this.loadTiddlersList()
            .then(list => this.loadTiddlers(list))
            .then(tiddlers => this.bootKernelPrefix(tiddlers))
            .then(tiddlers => this.bootTiddlers(tiddlers))
            .then(kernelTiddler => this.bootKernel(kernelTiddler))
            .then(() => this.done())
            .catch(err => {
                console.error(err);
                this.showError("ABORTED");
                if (!(err instanceof Aborted)) alert(err);
                window.setTimeout(() => {
                    debugger;
                    throw err;     // stop the rest of script from execution
                });
            })
        ;
    };

    Bootloader.prototype.loadTiddlersList = function () {
        this.setProgressInit();
        return this.utils.get(this.config.tiddlersList)
            .then(titles => titles.split(/\n+/).filter(x => x.length));
    };

    Bootloader.prototype.loadTiddlers = function (pathList) {
        this.setProgressLoading(0, 1);
        var progresses = [];
        var pending = [];
        var rejected = false;
        pathList.forEach((path, i) => {
            var load = this.utils.get(path, frac => {
                if (rejected) return;
                progresses[i] = frac;
                var progress = progresses.reduce((x, y) => x + y, 0);
                this.setProgressLoading(progress, pathList.length);
            }).catch(err => {
                rejected = true;
                throw err;
            });
            pending.push(load);
        });
        return Promise.all(pending)
            .then(tiddlers => tiddlers.map(text => this.utils.decodeTiddlerFields(text)));
    };

    Bootloader.prototype.bootKernelPrefix = function (tiddlers) {
        var tiddler = tiddlers.find(x => x.title === this.config.kernelPrefix);
        if (!tiddler) throw new Error("kernel prefix not found: " + this.config.kernelPrefix);
        try {
            eval.call(window, tiddler.text);
        } catch (e) {
            return Promise.reject(e);
        }
        return Promise.resolve(tiddlers);
    };

    Bootloader.prototype.bootTiddlers = function (tiddlers) {
        var kernel = tiddlers.find(x => x.title === this.config.kernel);
        window.$tw.preloadTiddlerArray(tiddlers);
        return Promise.resolve(kernel);
    };

    Bootloader.prototype.bootKernel = function (kernelTiddler) {
        if (!kernelTiddler) throw new Error("kernel not found: " + this.config.kernel)
        try {
            eval.call(window, kernelTiddler.text);
        } catch (e) {
            return Promise.reject(e);
        }
        return Promise.resolve();
    };

    Bootloader.prototype.done = function () {
        console.log("bootloader done.");
        this.setProgress(1);
        this.utils.later(200)
            .then(() => this.setBootloaderOpacity(0))
            .then(() => this.utils.later(400))
            .then(() => this.hideBootloader());
        ;
    };

    Bootloader.prototype.setProgressInit = function () {
        this.setProgress(0.05);
    };

    // initial progress is 10%, last progress is 95%
    Bootloader.prototype.setProgressLoading = function (i, total) {
        this.setProgress(i / total * 0.85 + 0.10);
    };

    Bootloader.prototype.setProgress = function (frac) {
        var percent = this.utils.clamp(parseInt(frac * 100), 0, 100);
        this.elProgress.style.width = percent + "%";
    };

    Bootloader.prototype.setBootloaderOpacity = function (opacity) {
        this.elBootloader.style.opacity = opacity;
    };

    Bootloader.prototype.hideBootloader = function () {
        this.elBootloader.style.display = "none";
    };

    Bootloader.prototype.showError = function (err) {
        this.elError.textContent = err;
    };

    window.onload = ev => {
        var el = document.querySelector("#bootloader");
        var bl = new Bootloader(el);
        bl.boot();
    };
}).call(this);

