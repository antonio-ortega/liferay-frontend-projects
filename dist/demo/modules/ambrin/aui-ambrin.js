define("ambrin/aui-ambrin", ["exports", "aui-core"], function (exports, _auiCore) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    "use strict";

    var logCore = _auiCore.log;

    function log(text) {
        logCore("module aui-chemaps says via aui-core", text);
    }

    exports.log = log;
});