'use strict';

(function () {
    function Utils()
    {
    }

    Utils.prototype.clamp = function(x, min, max) {
        return Math.max(Math.min(x, max), min);
    };

    Utils.prototype.get = function(url) {
        return new Promise((resolve, reject) => {
            var req = new XMLHttpRequest();
            req.onload = function() {
                if (this.status >= 200 && this.status < 300) {
                    resolve(this.responseText);
                }
                else {
                    reject(Error(this.statusText + "\n" + this.responseText));
                }
            };
            req.onerror = ev => reject(ev);
            req.onabort = ev => reject(ev);
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

    Utils.prototype.search = function(array, matcher) {
        var idx = -1;
        array.some((elem, i) => {
            if (matcher(elem)) {
                idx = i;
                return true;
            }
        });
        return idx;
    };

    Utils.prototype.extract = function(array, matcher) {
        var idx = this.search(array, matcher);
        if (idx != -1) return array.splice(idx, 1);
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
                alert(err);
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
        var loaded = 0;
        var pending = [];
        var rejected = false;
        pathList.forEach(path => {
            var load = this.utils.get(path)
                .then(text => {
                    if (rejected) return Promise.reject();
                    this.setProgressLoading(++loaded, pathList.length);
                    return text;
                }, err => {
                    rejected = true;
                    throw err;
                });
            pending.push(load);
        });
        return Promise.all(pending)
            .then(tiddlers => tiddlers.map(text => this.utils.decodeTiddlerFields(text)));
    };

    Bootloader.prototype.bootKernelPrefix = function (tiddlers) {
        var tiddler = this.utils.extract(tiddlers,
                x => x.title === this.config.kernelPrefix);
        if (!tiddler) throw Error("kernel prefix not found: " + this.config.kernelPrefix)
        return Promise.resolve(tiddlers);
    };

    Bootloader.prototype.bootTiddlers = function (tiddlers) {
        return Promise.resolve(tiddlers);
    };

    Bootloader.prototype.bootKernel = function (kernelTiddler) {
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
        console.log(frac);
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

