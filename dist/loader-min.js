(function(){function e(e,t){j[C]=e,j[C+1]=t,C+=2,2===C&&P()}function t(e){return"function"==typeof e}function n(){return function(){process.nextTick(s)}}function o(){var e=0,t=new O(s),n=document.createTextNode("");return t.observe(n,{characterData:!0}),function(){n.data=e=++e%2}}function i(){var e=new MessageChannel;return e.port1.onmessage=s,function(){e.port2.postMessage(0)}}function r(){return function(){setTimeout(s,1)}}function s(){for(var e=0;C>e;e+=2)(0,j[e])(j[e+1]),j[e]=void 0,j[e+1]=void 0;C=0}function u(){}function a(e,t,n,o){try{e.call(t,n,o)}catch(i){return i}}function l(t,n,o){e(function(e){var t=!1,i=a(o,n,function(o){t||(t=!0,n!==o?f(e,o):h(e,o))},function(n){t||(t=!0,p(e,n))});!t&&i&&(t=!0,p(e,i))},t)}function c(e,t){1===t.a?h(e,t.b):2===e.a?p(e,t.b):g(t,void 0,function(t){f(e,t)},function(t){p(e,t)})}function f(e,n){if(e===n)p(e,new TypeError("You cannot resolve a promise with itself"));else if("function"==typeof n||"object"==typeof n&&null!==n)if(n.constructor===e.constructor)c(e,n);else{var o;try{o=n.then}catch(i){k.error=i,o=k}o===k?p(e,k.error):void 0===o?h(e,n):t(o)?l(e,n,o):h(e,n)}else h(e,n)}function d(e){e.f&&e.f(e.b),m(e)}function h(t,n){void 0===t.a&&(t.b=n,t.a=1,0!==t.e.length&&e(m,t))}function p(t,n){void 0===t.a&&(t.a=2,t.b=n,e(d,t))}function g(t,n,o,i){var r=t.e,s=r.length;t.f=null,r[s]=n,r[s+1]=o,r[s+2]=i,0===s&&t.a&&e(m,t)}function m(e){var t=e.e,n=e.a;if(0!==t.length){for(var o,i,r=e.b,s=0;s<t.length;s+=3)o=t[s],i=t[s+n],o?_(n,o,i,r):i(r);e.e.length=0}}function v(){this.error=null}function _(e,n,o,i){var r,s,u,a,l=t(o);if(l){try{r=o(i)}catch(c){q.error=c,r=q}if(r===q?(a=!0,s=r.error,r=null):u=!0,n===r)return void p(n,new TypeError("A promises callback cannot return that same promise."))}else r=i,u=!0;void 0===n.a&&(l&&u?f(n,r):a?p(n,s):1===e?h(n,r):2===e&&p(n,r))}function y(e,t){try{t(function(t){f(e,t)},function(t){p(e,t)})}catch(n){p(e,n)}}function M(e,t,n,o){this.n=e,this.c=new e(u,o),this.i=n,this.o(t)?(this.m=t,this.d=this.length=t.length,this.l(),0===this.length?h(this.c,this.b):(this.length=this.length||0,this.k(),0===this.d&&h(this.c,this.b))):p(this.c,this.p())}function b(e){if(A++,this.b=this.a=void 0,this.e=[],u!==e){if(!t(e))throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");if(!(this instanceof b))throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");y(this,e)}}var P,w=Array.isArray?Array.isArray:function(e){return"[object Array]"===Object.prototype.toString.call(e)},C=0,x="undefined"!=typeof window?window:{},O=x.MutationObserver||x.WebKitMutationObserver,x="undefined"!=typeof Uint8ClampedArray&&"undefined"!=typeof importScripts&&"undefined"!=typeof MessageChannel,j=Array(1e3);P="undefined"!=typeof process&&"[object process]"==={}.toString.call(process)?n():O?o():x?i():r();var k=new v,q=new v;M.prototype.o=function(e){return w(e)},M.prototype.p=function(){return Error("Array Methods must be provided an Array")},M.prototype.l=function(){this.b=Array(this.length)},M.prototype.k=function(){for(var e=this.length,t=this.c,n=this.m,o=0;void 0===t.a&&e>o;o++)this.j(n[o],o)},M.prototype.j=function(e,t){var n=this.n;"object"==typeof e&&null!==e?e.constructor===n&&void 0!==e.a?(e.f=null,this.g(e.a,t,e.b)):this.q(n.resolve(e),t):(this.d--,this.b[t]=this.h(e))},M.prototype.g=function(e,t,n){var o=this.c;void 0===o.a&&(this.d--,this.i&&2===e?p(o,n):this.b[t]=this.h(n)),0===this.d&&h(o,this.b)},M.prototype.h=function(e){return e},M.prototype.q=function(e,t){var n=this;g(e,void 0,function(e){n.g(1,t,e)},function(e){n.g(2,t,e)})};var A=0;b.all=function(e,t){return new M(this,e,!0,t).c},b.race=function(e,t){function n(e){f(i,e)}function o(e){p(i,e)}var i=new this(u,t);if(!w(e))return p(i,new TypeError("You must pass an array to race.")),i;for(var r=e.length,s=0;void 0===i.a&&r>s;s++)g(this.resolve(e[s]),void 0,n,o);return i},b.resolve=function(e,t){if(e&&"object"==typeof e&&e.constructor===this)return e;var n=new this(u,t);return f(n,e),n},b.reject=function(e,t){var n=new this(u,t);return p(n,e),n},b.prototype={constructor:b,then:function(t,n){var o=this.a;if(1===o&&!t||2===o&&!n)return this;var i=new this.constructor(u),r=this.b;if(o){var s=arguments[o-1];e(function(){_(o,i,s,r)})}else g(this,i,t,n);return i},"catch":function(e){return this.then(null,e)}};var D={Promise:b,polyfill:function(){var e;e="undefined"!=typeof global?global:"undefined"!=typeof window&&window.document?window:self,"Promise"in e&&"resolve"in e.Promise&&"reject"in e.Promise&&"all"in e.Promise&&"race"in e.Promise&&function(){var n;return new e.Promise(function(e){n=e}),t(n)}()||(e.Promise=b)}};"function"==typeof define&&define.amd?define(function(){return D}):"undefined"!=typeof module&&module.exports?module.exports=D:"undefined"!=typeof this&&(this.ES6Promise=D)}).call(this),function(){var global={};global.__CONFIG__=window.__CONFIG__,function(e,t){"use strict";var n=t(e);"object"==typeof module&&module&&(module.exports=n),"function"==typeof define&&define.amd&&define(t),e.EventEmitter=n}("undefined"!=typeof global?global:this,function(e){"use strict";function t(){this._events={}}return t.prototype={constructor:t,on:function(e,t){var n=this._events[e]=this._events[e]||[];n.push(t)},off:function(e,t){var n=this._events[e];if(n){var o=n.indexOf(t);o>-1&&n.splice(o,1)}},emit:function(e,t){var n=this._events[e];if(n){n=n.slice(0);for(var o=0;o<n.length;o++){var i=n[o];i.call(i,t)}}}},t}),function(e,t){"use strict";var n=t(e);"object"==typeof module&&module&&(module.exports=n),"function"==typeof define&&define.amd&&define(t),e.ConfigParser=n}("undefined"!=typeof global?global:this,function(e){"use strict";function t(e){this._config={},this._modules={},this._conditionalModules={},this._parseConfig(e)}return t.prototype={constructor:t,addModule:function(e){var t=this._modules[e.name];if(t)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);else this._modules[e.name]=e;return this._registerConditionalModule(e),this._modules[e.name]},getConfig:function(){return this._config},getConditionalModules:function(){return this._conditionalModules},getModules:function(){return this._modules},mapModule:function(e){if(!this._config.maps)return e;var t;t=Array.isArray(e)?e:[e];for(var n=0;n<t.length;n++){var o=t[n],i=!1;for(var r in this._config.maps)if(Object.prototype.hasOwnProperty.call(this._config.maps,r)&&(o===r||0===o.indexOf(r+"/"))){o=this._config.maps[r]+o.substring(r.length),t[n]=o,i=!0;break}i||"function"!=typeof this._config.maps["*"]||(t[n]=this._config.maps["*"](o))}return Array.isArray(e)?t:t[0]},_parseConfig:function(e){for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&("modules"===t?this._parseModules(e[t]):this._config[t]=e[t]);return this._config},_parseModules:function(e){for(var t in e)if(Object.prototype.hasOwnProperty.call(e,t)){var n=e[t];n.name=t,this.addModule(n)}return this._modules},_registerConditionalModule:function(e){if(e.condition){var t=this._conditionalModules[e.condition.trigger];t||(this._conditionalModules[e.condition.trigger]=t=[]),t.push(e.name)}}},t}),function(e,t){"use strict";var n=t(e);"object"==typeof module&&module&&(module.exports=n),"function"==typeof define&&define.amd&&define(t),e.DependencyBuilder=n}("undefined"!=typeof global?global:this,function(global){"use strict";function DependencyBuilder(e){this._configParser=e,this._pathResolver=new global.PathResolver,this._result=[]}var hasOwnProperty=Object.prototype.hasOwnProperty;return DependencyBuilder.prototype={constructor:DependencyBuilder,resolveDependencies:function(e){this._queue=e.slice(0);var t;try{this._resolveDependencies(),t=this._result.reverse().slice(0)}finally{this._cleanup()}return t},_cleanup:function(){var e=this._configParser.getModules();for(var t in e)if(hasOwnProperty.call(e,t)){var n=e[t];n.conditionalMark=!1,n.mark=!1,n.tmpMark=!1}this._queue.length=0,this._result.length=0},_processConditionalModules:function(e){var t=this._configParser.getConditionalModules()[e.name];if(t&&!e.conditionalMark){for(var n=this._configParser.getModules(),o=0;o<t.length;o++){var i=n[t[o]];-1===this._queue.indexOf(i.name)&&this._testConditionalModule(i.condition.test)&&this._queue.push(i.name)}e.conditionalMark=!0}},_resolveDependencies:function(){for(var e=this._configParser.getModules(),t=0;t<this._queue.length;t++){var n=e[this._queue[t]];n||(n=this._configParser.addModule({name:this._queue[t],dependencies:[]})),n.mark||this._visit(n)}},_testConditionalModule:function(testFunction){return"function"==typeof testFunction?testFunction():eval("false || "+testFunction)()},_visit:function(e){if(e.tmpMark)throw new Error("Error processing module: "+e.name+". The provided configuration is not Directed Acyclic Graph.");if(this._processConditionalModules(e),!e.mark){e.tmpMark=!0;for(var t=this._configParser.getModules(),n=0;n<e.dependencies.length;n++){var o=e.dependencies[n];if("exports"!==o&&"module"!==o){o=this._pathResolver.resolvePath(e.name,o);var i=this._configParser.mapModule(o),r=t[i];r||(r=this._configParser.addModule({name:i,dependencies:[]})),this._visit(r)}}e.mark=!0,e.tmpMark=!1,this._result.unshift(e.name)}},_queue:[]},DependencyBuilder}),function(e,t){"use strict";var n=t(e);"object"==typeof module&&module&&(module.exports=n),"function"==typeof define&&define.amd&&define(t),e.URLBuilder=n}("undefined"!=typeof global?global:this,function(e){"use strict";function t(e){this._configParser=e}var n=/^https?:\/\/|\/\/|www\./;return t.prototype={constructor:t,build:function(e){var t=[],o=[],i=[],r=[],s=[],u=this._configParser.getConfig(),a=u.basePath||"",l=this._configParser.getModules();a.length&&"/"!==a.charAt(a.length-1)&&(a+="/");for(var c=0;c<e.length;c++){var f=l[e[c]];if(f.fullPath)s.push({modules:[f.name],url:f.fullPath});else{var d=this._getModulePath(f),h=0===d.indexOf("/");n.test(d)?s.push({modules:[f.name],url:d}):u.combine?h?(t.push(d),i.push(f.name)):(o.push(d),r.push(f.name)):s.push({modules:[f.name],url:u.url+(h?"":a)+d})}f.requested=!0}return o.length&&(s.push({modules:r,url:u.url+a+o.join("&"+a)}),o.length=0),t.length&&(s.push({modules:i,url:u.url+t.join("&")}),t.length=0),s},_getModulePath:function(e){var t=e.path||e.name,o=this._configParser.getConfig().paths;for(var i in o)Object.prototype.hasOwnProperty.call(o,i)&&(t===i||0===t.indexOf(i+"/"))&&(t=o[i]+t.substring(i.length));return n.test(t)||t.indexOf(".js")===t.length-3||(t+=".js"),t}},t}),function(e,t){"use strict";var n=t(e);"object"==typeof module&&module&&(module.exports=n),"function"==typeof define&&define.amd&&define(t),e.PathResolver=n}("undefined"!=typeof global?global:this,function(e){"use strict";function t(){}return t.prototype={constructor:t,resolvePath:function(e,t){if("exports"===t||"module"===t||0!==t.indexOf(".")&&0!==t.indexOf(".."))return t;var n=e.split("/");n.splice(-1,1);for(var o=t.split("/"),i=o.splice(-1,1),r=0;r<o.length;r++){var s=o[r];if("."!==s)if(".."===s){if(!n.length){n=n.concat(o.slice(r));break}n.splice(-1,1)}else n.push(s)}return n.push(i),n.join("/")}},t}),function(e,t){"use strict";var n=t(e);"object"==typeof module&&module&&(module.exports=n),"function"==typeof define&&define.amd&&define(t),e.Loader=new n,e.require=e.Loader.require.bind(e.Loader),e.define=e.Loader.define.bind(e.Loader),e.define.amd={}}("undefined"!=typeof global?global:this,function(e){"use strict";function t(n){t.superclass.constructor.apply(this,arguments),this._config=n||e.__CONFIG__,this._modulesMap={}}t.prototype=Object.create(e.EventEmitter.prototype),t.prototype.constructor=t,t.superclass=e.EventEmitter.prototype;var n={addModule:function(e){return this._getConfigParser().addModule(e)},define:function(e,t,n,o){var i=arguments.length;if(!(2>i)){if(2===i){if("string"!=typeof e)return;n=t,t=["module","exports"]}var r=o||{},s=this._getConfigParser(),u=this._getPathResolver();t=t.map(function(t){return u.resolvePath(e,t)}),r.name=e,r.dependencies=t,r.pendingImplementation=n,s.addModule(r),this._modulesMap[r.name]||(this._modulesMap[r.name]=!0),this.emit("moduleRegister",e)}},getConditionalModules:function(){return this._getConfigParser().getConditionalModules()},getModules:function(){return this._getConfigParser().getModules()},require:function(){var e,t,n,o,i=this;if(Array.isArray(arguments[0]))n=arguments[0],o="function"==typeof arguments[1]?arguments[1]:null,e="function"==typeof arguments[2]?arguments[2]:null;else for(n=[],t=0;t<arguments.length;++t)if("string"==typeof arguments[t])n[t]=arguments[t];else if("function"==typeof arguments[t]){o=arguments[t],e="function"==typeof arguments[++t]?arguments[t]:null;break}var r,s=i._getConfigParser(),u=s.mapModule(n);new Promise(function(e,t){i._resolveDependencies(u).then(function(o){var a=s.getConfig();0!==a.waitTimeout&&(r=setTimeout(function(){var e=s.getModules(),i=new Error("Load timeout for modules: "+n);i.dependecies=o,i.mappedModules=u,i.missingDependencies=o.filter(function(t){return!e[t].implementation}),i.modules=n,t(i)},a.waitTimeout||7e3)),i._loadModules(o).then(e,t)},t)}).then(function(e){if(clearTimeout(r),o){var t=i._getModuleImplementations(u);o.apply(o,t)}},function(t){clearTimeout(r),e&&e.call(e,t)})},_createModulePromise:function(e){var t=this;return new Promise(function(n,o){var i=t._getConfigParser().getModules(),r=i[e];if(r.exports){var s=t._getValueGlobalNS(r.exports);if(s)n(s);else{var u=function(i){if(i.indexOf(e)>=0){t.off("scriptLoaded",u);var s=t._getValueGlobalNS(r.exports);s?n(s):o(new Error("Module "+e+" does not export the specified value: "+r.exports))}};t.on("scriptLoaded",u)}}else{var a=function(o){o===e&&(t.off("moduleRegister",a),t._modulesMap[e]=!0,n(e))};t.on("moduleRegister",a)}})},_getConfigParser:function(){return this._configParser||(this._configParser=new e.ConfigParser(this._config)),this._configParser},_getDependencyBuilder:function(){return this._dependencyBuilder||(this._dependencyBuilder=new e.DependencyBuilder(this._getConfigParser())),this._dependencyBuilder},_getValueGlobalNS:function(e){return(0,eval)("this")[e]},_getMissingDepenencies:function(e){for(var t=this._getConfigParser(),n=t.getModules(),o=Object.create(null),i=0;i<e.length;i++)for(var r=n[e[i]],s=t.mapModule(r.dependencies),u=0;u<s.length;u++){var a=s[u],l=n[a];"exports"===a||"module"===a||l&&l.pendingImplementation||(o[a]=1)}return Object.keys(o)},_getModuleImplementations:function(e){for(var t=[],n=this._getConfigParser().getModules(),o=0;o<e.length;o++){var i=n[e[o]];t.push(i?i.implementation:void 0)}return t},_getPathResolver:function(){return this._pathResolver||(this._pathResolver=new e.PathResolver),this._pathResolver},_getURLBuilder:function(){return this._urlBuilder||(this._urlBuilder=new e.URLBuilder(this._getConfigParser())),this._urlBuilder},_filterNotRequestedModules:function(e){for(var t=[],n=this._getConfigParser().getModules(),o=0;o<e.length;o++){var i=n[e[o]];"exports"===i||"module"===i||i&&i.requested||t.push(e[o])}return t},_loadModules:function(e){var t=this;return new Promise(function(n,o){var i=t._filterNotRequestedModules(e);if(i.length){for(var r=t._getURLBuilder().build(i),s=[],u=0;u<r.length;u++)s.push(t._loadScript(r[u]));Promise.all(s).then(function(n){return t._waitForModules(e)}).then(function(e){n(e)})["catch"](function(e){o(e)})}else t._waitForModules(e).then(function(e){n(e)})["catch"](function(e){o(e)})})},_loadScript:function(e){var t=this;return new Promise(function(n,o){var i=document.createElement("script");i.src=e.url,i.onload=i.onreadystatechange=function(){this.readyState&&"complete"!==this.readyState&&"load"!==this.readyState||(i.onload=i.onreadystatechange=null,n(i),t.emit("scriptLoaded",e.modules))},i.onerror=function(){document.head.removeChild(i),o(i)},document.head.appendChild(i)})},_resolveDependencies:function(e){var t=this;return new Promise(function(n,o){try{var i=t._getDependencyBuilder().resolveDependencies(e);n(i)}catch(r){o(r)}})},_setModuleImplementation:function(e){for(var t=this._getConfigParser().getModules(),n=0;n<e.length;n++){var o=e[n];if(!o.implementation)if(o.exports)o.pendingImplementation=o.implementation=this._getValueGlobalNS(o.exports);else{for(var i,r=[],s=this._getConfigParser(),u=0;u<o.dependencies.length;u++){var a=o.dependencies[u];if("exports"===a)i={},r.push(i);else if("module"===a)i={exports:{}},r.push(i);else{var l=t[s.mapModule(a)],c=l.implementation;r.push(c)}}var f;f="function"==typeof o.pendingImplementation?o.pendingImplementation.apply(o.pendingImplementation,r):o.pendingImplementation,f?o.implementation=f:i&&(o.implementation=i.exports||i)}}},_waitForModule:function(e){var t=this,n=t._modulesMap[e];return n||(n=t._createModulePromise(e),t._modulesMap[e]=n),n},_waitForModules:function(e){var t=this;return new Promise(function(n,o){for(var i=[],r=0;r<e.length;r++)i.push(t._waitForModule(e[r]));Promise.all(i).then(function(i){var r=t._getConfigParser().getModules(),s=function(){for(var o=[],i=0;i<e.length;i++)o.push(r[e[i]]);t._setModuleImplementation(o),n(o)},u=t._getMissingDepenencies(e);u.length?t.require(u,s,o):s()},o)})}};return Object.keys(n).forEach(function(e){t.prototype[e]=n[e]}),t}),window.Loader=global.Loader,window.require=global.require,window.define=global.define}();