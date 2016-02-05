(function (global, factory) {
    'use strict';

    var built = factory(global);

    /* istanbul ignore else */
    if (typeof module === 'object' && module) {
        module.exports = built;
    }

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(factory);
    }

    /* jshint newcap:false */
    global.Loader = new built();
    global.require = global.Loader.require.bind(global.Loader);
    global.define = global.Loader.define.bind(global.Loader);
    global.define.amd = {};
}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this, function (global) {

    'use strict';

/**
 * Creates an instance of Loader class.
 *
 * @namespace Loader
 * @extends EventEmitter
 * @constructor
 */

function Loader(config) {
    Loader.superclass.constructor.apply(this, arguments);

    this._config = config || global.__CONFIG__;

    this._modulesMap = {};
}

Loader.prototype = Object.create(global.EventEmitter.prototype);
Loader.prototype.constructor = Loader;
Loader.superclass = global.EventEmitter.prototype;

var LoaderProtoMethods = {
    /**
     * Adds a module to the configuration. See {@link ConfigParser#addModule} for more details.
     *
     * @memberof! Loader#
     * @param {Object} module The module which should be added to the configuration. See {@link ConfigParser#addModule} for more details.
     * @return {Object} Returns the added module to the configuration.
     */
    addModule: function(module) {
        return this._getConfigParser().addModule(module);
    },

    /**
     * Defines a module in the system and fires {@link Loader#event:moduleRegister} event with the registered module as param.
     *
     * @memberof! Loader#
     * @param {string} name The name of the module.
     * @param {array} dependencies List of module dependencies.
     * @param {function} implementation The implementation of the module.
     * @param {object=} config Object configuration:
     * <ul>
     *         <strong>Optional properties</strong>:
     *         <li>path (String) - Explicitly set path of the module. If omitted, module name will be used as path</li>
     *         <li>condition (Object) Object which represents if the module should be added automatically after another
     *             module.
     *         It should have the following properties:</li>
     *             <ul>
     *                 <li>trigger - the module, which should trigger the loading of the current module</li>
     *                 <li>test - function, which should return true if module should be loaded</li>
     *             </ul>
     *          <li>exports - If the module does not expose a "define" function, then you can specify an "exports" property.
     *              The value of this property should be a string, which represents the value, which this module exports to
     *              the global namespace. For example: exports: '_'. This will mean the module exports an underscore to the
     *              global namespace. In this way you can load legacy modules.
     *          </li>
     *     </ul>
     * @return {Object} The constructed module.
     */
    define: function(name, dependencies, implementation, config) {
        console.log('DEFINE', name, dependencies);

        var passedArgsCount = arguments.length;

        if (passedArgsCount < 2) {
            console.log('DEFINE, module with one param only, returning');
            // we don't support modules with implementation only
            return;
        } else if (passedArgsCount === 2) {
            if (typeof name === 'string') {
                console.log('DEFINE, module with two params only, name and implementation', name);
                // there are two parameters, but the first one is not an array with dependencies,
                // this is a module name
                implementation = dependencies;
                dependencies = ['module', 'exports'];
            } else {
                // anonymous module, we don't support this
                return;
            }
        }

        // Create a new module by merging the provided config with the passed name,
        // dependencies and implementation.
        var module = config || {};
        var configParser = this._getConfigParser();

        var pathResolver = this._getPathResolver();

        // Resolve the path according to the parent module. Example:
        // define('metal/src/component/component', ['../array/array']) will become:
        // define('metal/src/component/component', ['metal/src/array/array'])
        dependencies = dependencies.map(function(dependency) {
            return pathResolver.resolvePath(name, dependency);
        });

        module.name = name;
        module.dependencies = dependencies;
        module.pendingImplementation = implementation;

        configParser.addModule(module);

        if (!this._modulesMap[module.name]) {
            this._modulesMap[module.name] = true;
        }

        this.emit('moduleRegister', name);
    },

    /**
     * Returns list of currently registered conditional modules.
     *
     * @memberof! Loader#
     * @return {array} List of currently registered conditional modules.
     */
    getConditionalModules: function() {
        return this._getConfigParser().getConditionalModules();
    },

    /**
     * Returns list of currently registered modules.
     *
     * @memberof! Loader#
     * @return {array} List of currently registered modules.
     */
    getModules: function() {
        return this._getConfigParser().getModules();
    },

    /**
     * Requires list of modules. If a module is not yet registered, it will be ignored and its implementation
     * in the provided success callback will be left undefined.<br>
     *
     * @memberof! Loader#
     * @param {array|string[]} modules Modules can be specified as an array of strings or provided as
     *     multiple string parameters.
     * @param {function} success Callback, which will be invoked in case of success. The provided parameters will
     *     be implementations of all required modules.
     * @param {function} failure Callback, which will be invoked in case of failure. One parameter with
     *     information about the error will be provided.
     */
    require: function() {
        var self = this;

        console.log('REQUIRE CALLED');

        var failureCallback;
        var i;
        var modules;
        var successCallback;

        // Modules can be specified by as an array, or just as parameters to the function
        // We do not slice or leak arguments to not cause V8 performance penalties
        // TODO: This could be extracted as an inline function (hint)
        if (Array.isArray(arguments[0])) {
            modules = arguments[0];
            successCallback = typeof arguments[1] === 'function' ? arguments[1] : null;
            failureCallback = typeof arguments[2] === 'function' ? arguments[2] : null;

        } else {
            modules = [];

            for (i = 0; i < arguments.length; ++i) {
                if (typeof arguments[i] === 'string') {
                    modules[i] = arguments[i];

                /* istanbul ignore else */
                } else if (typeof arguments[i] === 'function') {
                    successCallback = arguments[i];
                    failureCallback = typeof arguments[++i] === 'function' ? arguments[i] : /* istanbul ignore next */ null;

                    break;
                }
            }
        }

        console.log('REQUIRE called with', modules);

        var configParser = self._getConfigParser();

        // Map the required modules so we start with clean idea what the hell we should load.
        var mappedModules = configParser.mapModule(modules);

        console.log('REQUIRE modules mapped to', mappedModules);

        var rejectTimeout;

        new Promise(function(resolve, reject) {
            // Resolve the dependencies of the requested modules,
            // then load them and resolve the Promise
            self._resolveDependencies(mappedModules).then(function(dependencies) {
                console.log('REQUIRE dependencies resolved to', dependencies);

                var config = configParser.getConfig();

                // Establish a load timeout and reject the Promise in case of Error
                if (config.waitTimeout !== 0) {
                    rejectTimeout = setTimeout(function() {
                        var registeredModules = configParser.getModules();

                        var error = new Error('Load timeout for modules: ' + modules);
                        error.dependecies = dependencies;
                        error.mappedModules = mappedModules;
                        error.missingDependencies = dependencies.filter(function(dep) {
                            return !registeredModules[dep].implementation;
                        });
                        error.modules = modules;

                        console.log('REQUIRE timeout', error);
                        reject(error);
                    }, config.waitTimeout || 7000);
                }

                // Load the dependencies, then resolve the Promise
                self._loadModules(dependencies).then(resolve, reject);
            }, reject);
        }).then(function(loadedModules) {
            console.log('REQUIRE promise success');
            clearTimeout(rejectTimeout);

            /* istanbul ignore else */
            if (successCallback) {
                var moduleImplementations = self._getModuleImplementations(mappedModules);
                successCallback.apply(successCallback, moduleImplementations);
            }
        }, function(error) {
            console.log('REQUIRE promise failure');
            clearTimeout(rejectTimeout);

            /* istanbul ignore else */
            if (failureCallback) {
                failureCallback.call(failureCallback, error);
            }
        });
    },

    /**
     * Creates Promise for module. It will be resolved as soon as module is being loaded from server.
     *
     * @memberof! Loader#
     * @protected
     * @param {string} moduleName The name of module for which Promise should be created.
     * @return {Promise} Promise, which will be resolved as soon as the requested module is being loaded.
     */
    _createModulePromise: function(moduleName) {
        var self = this;

        return new Promise(function(resolve, reject) {
            var registeredModules = self._getConfigParser().getModules();

            // Check if this is a module, which exports something
            // If so, check if the exported value is available
            var module = registeredModules[moduleName];

            if (module.exports) {
                var exportedValue = self._getValueGlobalNS(module.exports);

                if (!!exportedValue) {
                    resolve(exportedValue);
                } else {
                    var onScriptLoaded = function(loadedModules) {
                        if (loadedModules.indexOf(moduleName) >= 0) {
                            self.off('scriptLoaded', onScriptLoaded);

                            var exportedValue = self._getValueGlobalNS(module.exports);

                            if (!!exportedValue) {
                                resolve(exportedValue);
                            } else {
                                reject(new Error('Module ' + moduleName + ' does not export the specified value: ' + module.exports));
                            }
                        }
                    };

                    self.on('scriptLoaded', onScriptLoaded);
                }
            } else {
                var onModuleRegister = function(registeredModuleName) {
                    if (registeredModuleName === moduleName) {
                        self.off('moduleRegister', onModuleRegister);

                        // Overwrite the promise entry in the modules map with a simple `true` value.
                        // Hopefully GC will remove this promise from the memory.
                        self._modulesMap[moduleName] = true;

                        resolve(moduleName);
                    }
                };

                self.on('moduleRegister', onModuleRegister);
            }
        });
    },

    /**
     * Returns instance of {@link ConfigParser} class.
     *
     * @memberof! Loader#
     * @protected
     * @return {ConfigParser} Instance of {@link ConfigParser} class.
     */
    _getConfigParser: function() { /* istanbul ignore else */
        if (!this._configParser) {
            this._configParser = new global.ConfigParser(this._config);
        }

        return this._configParser;
    },

    /**
     * Returns instance of {@link DependencyBuilder} class.
     *
     * @memberof! Loader#
     * @protected
     * @return {DependencyBuilder} Instance of {@link DependencyBuilder} class.
     */
    _getDependencyBuilder: function() {
        if (!this._dependencyBuilder) {
            this._dependencyBuilder = new global.DependencyBuilder(this._getConfigParser());
        }

        return this._dependencyBuilder;
    },

    /**
     * Retrieves a value from the global namespace.
     *
     * @memberof! Loader#
     * @protected
     * @param {String} exports The key which should be used to retrieve the value.
     * @return {Any} The retrieved value.
     */
    _getValueGlobalNS: function(exports) {
        return (0, eval)('this')[exports];
    },

    /**
     * Returns an array of all missing dependencies of the passed modules.
     * A missing dependency is a dependency, which does not have pending implementation yet.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} moduleNames List of module names to be checked for missing dependencies.
     * @return {Array<string>} A list with all missing dependencies.
     */
    _getMissingDepenencies: function(moduleNames) {
        var configParser = this._getConfigParser();
        var registeredModules = configParser.getModules();

        var missingDependencies = Object.create(null);

        for (var i = 0; i < moduleNames.length; i++) {
            var module = registeredModules[moduleNames[i]];

            var mappedDependencies = configParser.mapModule(module.dependencies);

            for (var j = 0; j < mappedDependencies.length; j++) {
                var dependency = mappedDependencies[j];

                var dependencyModule = registeredModules[dependency];

                if (dependency !== 'exports' && dependency !== 'module' && (!dependencyModule || !dependencyModule.pendingImplementation)) {
                    missingDependencies[dependency] = 1;
                }
            }
        }

        return Object.keys(missingDependencies);
    },

    /**
     * Retrieves module implementations to an array.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} requiredModules Lit of modules, which implementations will be added to an array.
     * @return {array} List of modules implementations.
     */
    _getModuleImplementations: function(requiredModules) {
        var moduleImplementations = [];

        var modules = this._getConfigParser().getModules();

        for (var i = 0; i < requiredModules.length; i++) {
            var requiredModule = modules[requiredModules[i]];

            moduleImplementations.push(requiredModule ? requiredModule.implementation : undefined);
        }

        return moduleImplementations;
    },

    /**
     * Returns an instance of {@link PathResolver} class.
     *
     * @memberof! Loader#
     * @protected
     * @return {PathResolver} Instance of {@link PathResolver} class.
     */
    _getPathResolver: function() {
        if (!this._pathResolver) {
            this._pathResolver = new global.PathResolver();
        }

        return this._pathResolver;
    },

    /**
     * Returns instance of {@link URLBuilder} class.
     *
     * @memberof! Loader#
     * @protected
     * @return {URLBuilder} Instance of {@link URLBuilder} class.
     */
    _getURLBuilder: function() { /* istanbul ignore else */
        if (!this._urlBuilder) {
            this._urlBuilder = new global.URLBuilder(this._getConfigParser());
        }

        return this._urlBuilder;
    },

    /**
     * Filters a list of modules and returns only these which have been not yet requested for delivery via network.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} modules List of modules which which will be filtered.
     * @return {array} List of modules not yet requested for delivery via network.
     */
    _filterNotRequestedModules: function(modules) {
        var missingModules = [];

        var registeredModules = this._getConfigParser().getModules();

        for (var i = 0; i < modules.length; i++) {
            var registeredModule = registeredModules[modules[i]];

            // Get all modules which are not yet requested from the server.
            // We exclude "exports" and "module" modules, which are part of AMD spec.
            if ((registeredModule !== 'exports' && registeredModule !== 'module') && (!registeredModule || !registeredModule.requested)) {
                missingModules.push(modules[i]);
            }
        }

        return missingModules;
    },

    /**
     * Loads list of modules.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} modules List of modules to be loaded.
     * @return {Promise} Promise, which will be resolved as soon as all module a being loaded.
     */
    _loadModules: function(moduleNames) {
        var self = this;

        return new Promise(function(resolve, reject) {
            // First, detect any not yet requested modules
            var notRequestedModules = self._filterNotRequestedModules(moduleNames);

            if (notRequestedModules.length) {
                // If there are not yet requested modules, construct their URLs
                var modulesURL = self._getURLBuilder().build(notRequestedModules);

                var pendingScripts = [];

                // Create promises for each of the scripts, which should be loaded
                for (var i = 0; i < modulesURL.length; i++) {
                    pendingScripts.push(self._loadScript(modulesURL[i]));
                }

                // Wait for resolving all script Promises
                // As soon as that happens, wait for each module to define itself

                console.log('SCRIPTS', modulesURL);
                Promise.all(pendingScripts).then(function(loadedScripts) {
                    return self._waitForModules(moduleNames);
                })
                // As soon as all scripts were loaded and all dependencies have been resolved,
                // resolve the main Promise
                .then(function(loadedModules) {
                    resolve(loadedModules);
                })
                // If any script fails to load or other error happens,
                // reject the main Promise
                .catch(function(error) {
                    reject(error);
                });
            } else {
                // If there are no any missing modules, just wait for modules dependencies
                // to be resolved and then resolve the main promise
                self._waitForModules(moduleNames).then(function(loadedModules) {
                    resolve(loadedModules);
                })
                // If some error happens, for example if some module implementation
                // throws error, reject the main Promise
                .catch(function(error) {
                    reject(error);
                });
            }
        });
    },

    /**
     * Loads a &ltscript&gt element on the page.
     *
     * @memberof! Loader#
     * @protected
     * @param {object} modulesURL An Object with two properties:
     * - modules - List of the modules which should be loaded
     * - url - The URL from which the modules should be loaded
     * @return {Promise} Promise which will be resolved as soon as the script is being loaded.
     */
    _loadScript: function(modulesURL) {
        var self = this;

        return new Promise(function(resolve, reject) {
            var script = document.createElement('script');

            script.src = modulesURL.url;

            // On ready state change is needed for IE < 9, not sure if that is needed anymore,
            // it depends which browsers will we support at the end
            script.onload = script.onreadystatechange = function() { /* istanbul ignore else */
                if (!this.readyState || /* istanbul ignore next */ this.readyState === 'complete' || /* istanbul ignore next */ this.readyState === 'load') {

                    script.onload = script.onreadystatechange = null;

                    resolve(script);

                    self.emit('scriptLoaded', modulesURL.modules);
                }
            };

            // If some script fails to load, reject the main Promise
            script.onerror = function() {
                document.head.removeChild(script);

                reject(script);
            };

            document.head.appendChild(script);
        });
    },

    /**
     * Resolves modules dependencies.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} modules List of modules which dependencies should be resolved.
     * @return {Promise} Promise which will be resolved as soon as all dependencies are being resolved.
     */
    _resolveDependencies: function(modules) {
        var self = this;

        return new Promise(function(resolve, reject) {
            try {
                var dependencies = self._getDependencyBuilder().resolveDependencies(modules);

                resolve(dependencies);
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Invokes the implementation method of list of modules passing the implementations of its dependencies.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} modules List of modules to which implementation should be set.
     */
    _setModuleImplementation: function(modules) {
        var registeredModules = this._getConfigParser().getModules();

        for (var i = 0; i < modules.length; i++) {
            var module = modules[i];

            if (module.implementation) {
                continue;
            } else if (module.exports) {
                module.pendingImplementation = module.implementation = this._getValueGlobalNS(module.exports);
                continue;
            }

            var dependencyImplementations = [];

            // Leave exports implementation undefined by default
            var exportsImpl;
            var configParser = this._getConfigParser();

            for (var j = 0; j < module.dependencies.length; j++) {
                var dependency = module.dependencies[j];

                // If the current dependency of this module is 'exports',
                // create an empty object and pass it as implementation of
                // 'exports' module
                if (dependency === 'exports') {
                    exportsImpl = {};

                    dependencyImplementations.push(exportsImpl);
                } else if (dependency === 'module') {
                    exportsImpl = {exports: {}};

                    dependencyImplementations.push(exportsImpl);
                } else {
                    // otherwise set as value the implementation of the registered module
                    var dependencyModule = registeredModules[configParser.mapModule(dependency)];

                    var impl = dependencyModule.implementation;

                    dependencyImplementations.push(impl);
                }
            }

            var result;

            if (typeof module.pendingImplementation === 'function') {
                result = module.pendingImplementation.apply(module.pendingImplementation, dependencyImplementations);
            } else {
                result = module.pendingImplementation;
            }

            // Store as implementation either the returned value from the function's invocation,
            // or one of these:
            // 1. If the passed object has 'exports' property (in case of 'module' dependency), get this one.
            // 2. Otherwise, get the passed object itself (in case of 'exports' dependency)
            //
            // The final implementation of this module may be undefined if there is no
            // returned value, or the object does not have 'exports' or 'module' dependency.
            if (result) {
                module.implementation = result;
            } else if (exportsImpl) {
                module.implementation = exportsImpl.exports || exportsImpl;
            }
        }
    },

    /**
     * Resolves a Promise as soon as all module dependencies are being resolved or it has implementation already.
     *
     * @memberof! Loader#
     * @protected
     * @param {Object} module The module for which this function should wait.
     * @return {Promise}
     */
    _waitForModule: function(moduleName) {
        var self = this;

        // Check if there is already a promise for this module.
        // If there is not - create one and store it to module promises map.
        var modulePromise = self._modulesMap[moduleName];

        if (!modulePromise) {
            modulePromise = self._createModulePromise(moduleName);

            self._modulesMap[moduleName] = modulePromise;
        }

        return modulePromise;
    },

    /**
     * Resolves a Promise as soon as all dependencies of all provided modules are being resolved and modules have
     * implementations.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} modules List of modules for which implementations this function should wait.
     * @return {Promise}
     */
    _waitForModules: function(moduleNames) {
        var self = this;

        return new Promise(function(resolve, reject) {
            var modulesPromises = [];

            for (var i = 0; i < moduleNames.length; i++) {
                modulesPromises.push(self._waitForModule(moduleNames[i]));
            }

            // Wait until all modules were loaded and their Promises resolved
            Promise.all(modulesPromises).then(function(uselessPromises) {
                // The modules were loaded. However, we have to check their dependencies
                // one more time, because some dependencies might have not been registered in the configuration.
                // In this case we have to load them too, otherwise we won't be able to properly
                // get the implementation from the module.
                var registeredModules = self._getConfigParser().getModules();

                var defineModules = function () {
                    var definedModules = [];

                    for (var i = 0; i < moduleNames.length; i++) {
                        definedModules.push(registeredModules[moduleNames[i]]);
                    }

                    self._setModuleImplementation(definedModules);

                    resolve(definedModules);
                };

                var missingDependencies = self._getMissingDepenencies(moduleNames);

                if (missingDependencies.length) {
                    console.log('MISSING DEPENDENCIES', 'requested', moduleNames, 'missing', missingDependencies);
                    self.require(missingDependencies, defineModules, reject);
                } else {
                    defineModules();
                }
            }, reject);
        });
    }

    /**
     * Indicates that a module has been registered.
     *
     * @event Loader#moduleRegister
     * @param {Object} module - The registered module.
     */
};

Object.keys(LoaderProtoMethods).forEach(function(key) {
    Loader.prototype[key] = LoaderProtoMethods[key];
});

    return Loader;
}));