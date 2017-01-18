'use strict';

(function () {
    function Utils()
    {
    }

    Utils.prototype.clamp = function(x, min, max) {
        return Math.max(Math.min(x, max), min);
    };

    Utils.prototype.get = function(url) {
        return this.later(Math.random() * 2000)
            .then(() => "TODO: " + url)
    };

    Utils.prototype.later = function(ms) {
        return new Promise((resolve, reject) => {
            window.setTimeout(() => resolve(), ms);
        });
    };

    /////////////////////////////////////////////////////

    function Bootloader(elBootloader)
    {
        this.elBootloader = elBootloader;
        this.elProgress = elBootloader.querySelector(".progress");
        this.utils = new Utils();
        this.config = {
            tiddlersList: "./tiddlers.list",
            kernelPrefix: "$:/boot/bootprefix.js",
            kernel: "$:/boot/boot.js",
        };
    }

    Bootloader.prototype.reportError = function (err, stage) {
        console.error(stage);
        throw Error(err);
    };

    Bootloader.prototype.errorReporter = function (stage) {
        return err => {
            this.reportError(err, stage);
        };
    };

    Bootloader.prototype.boot = function () {
        this.loadTiddlersList()
            .then(list => this.loadTiddlers(list), this.errorReporter("load tiddlers list"))
            .then(tiddlers => this.bootKernelPrefix(tiddlers), this.errorReporter("load tiddlers"))
            .then(tiddlers => this.bootTiddlers(tiddlers), this.errorReporter("boot kernel prefix"))
            .then(kernelTiddler => this.bootKernel(kernelTiddler), this.errorReporter("boot tiddlers"))
            .then(() => this.done(), this.errorReporter("boot kernel"))
        ;
    };

    Bootloader.prototype.loadTiddlersList = function () {
        this.setProgressInit();
        return this.utils.get(this.config.tiddlersList)
            .then(titles => titles.split(/\n+/).filter(x => x.length));
    };

    Bootloader.prototype.loadTiddlers = function (titleList) {
        this.setProgressLoading(0, 1);
        return this.utils.later(1000)
            .then(() => this.setProgressLoading(1, 1))
            .then(() => titleList)
    };

    Bootloader.prototype.bootKernelPrefix = function (tiddlers) {
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
        var percent = this.utils.clamp(parseInt(frac * 100), 0, 100);
        this.elProgress.style.width = percent + "%";
    };

    Bootloader.prototype.setBootloaderOpacity = function (opacity) {
        this.elBootloader.style.opacity = opacity;
    };

    Bootloader.prototype.hideBootloader = function () {
        this.elBootloader.style.display = "none";
    };

    window.onload = ev => {
        var el = document.querySelector("#bootloader");
        var bl = new Bootloader(el);
        bl.boot();
    };
}).call(this);

