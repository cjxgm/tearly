'use strict';

(function () {
    function Util()
    {
    }

    Util.prototype.clamp = function(x, min, max) {
        return Math.max(Math.min(x, max), min);
    };

    Util.prototype.get = function(url) {
    };

    /////////////////////////////////////////////////////

    function Bootloader(elBootloader)
    {
        this.elBootloader = elBootloader;
        this.elProgress = elBootloader.querySelector(".progress");
        this.util = new Util();
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
            .then(list => this.loadTiddlers(list), this.errorReporter("load tiddlers list"));
            .then(tiddlers => this.bootKernelPrefix(tiddlers), this.errorReporter("load tiddlers"));
            .then(tiddlers => this.bootTiddlers(tiddlers), this.errorReporter("boot kernel prefix"));
            .then(kernelTiddler => this.bootKernel(kernelTiddler), this.errorReporter("boot tiddlers"));
            .then(() => this.done(), this.errorReporter("boot kernel"));
    };

    Bootloader.prototype.loadTiddlersList = function () {
    };

    Bootloader.prototype.loadTiddlers = function (titleList) {
    };

    Bootloader.prototype.bootKernelPrefix = function (tiddlers) {
    };

    Bootloader.prototype.bootTiddlers = function (tiddlers) {
    };

    Bootloader.prototype.bootKernel = function (kernelTiddler) {
    };

    Bootloader.prototype.done = function () {
        console.log("bootloader done.");
        this.hideBootloader();
    };

    // initial progress is 5%
    Bootloader.prototype.setProgressInit = function () {
        this.setProgress(i / total * 0.9 + 0.1);
    };

    // initial progress is 10%
    Bootloader.prototype.setProgressLoading = function (i, total) {
        this.setProgress(i / total * 0.9 + 0.1);
    };

    Bootloader.prototype.setProgress = function (frac) {
        var percent = this.util.clamp(parseInt(frac * 100), 0, 100);
        this.elProgress.style.width = percent + "%";
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

