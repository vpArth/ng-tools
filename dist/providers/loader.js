;(function(module){
    "use strict";

    module.provider('TplLoader', TplLoaderProvider);

    /**
     * @ngdoc provider
     * @name $TplLoaderProvider
     * @description
     *
     * This provider allows directives to simple load their templates asynchronous.
     *
     */
    TplLoaderProvider.$inject = [];
    function TplLoaderProvider() {
        var that = this;
        var custom = {
            base_uri: '/modules/',
            tpl_dir: '/templates/',
            default_tplname: 'index.html',
            noCacheFn: preventCacheKey
        };

        that.setBaseUri = setBaseUri;
        that.setTplDir = setTplDir;
        that.setDefaultTplName = setDefaultTplName;
        that.setNoCacheFn = setNoCacheFn;

        that.uri = uri;
        that.$get = TplLoader;

        TplLoader.$inject = ['$http', '$templateCache', '$compile'];
        function TplLoader($http, $cache, $compile) {
            return {
                uri: uri,
                load: load,
                loadTpl: loadTpl
            };

            /**
             * @ngdoc method
             * @name $TplLoader#load
             * @param {$element}
             * @param {string} - full tpl uri, can be fetched by TplLoader#uri method
             * @param {Scope} - scope for template compile
             * @return {Promise} - $http.promise, for implement actions, when tpl loaded
             *        Example:
             *              tplLoader.load(el, tplLoader.uri('controls', 'custom.html'), scope).then(cb);
             */
            function load(outerEl, tpl, scope, replace) {
                return $http.get(tpl, {cache: $cache}).then(function (response) {
                    var html = response.data;
                    outerEl.html(html);
                    var innerEl = $compile(outerEl.contents())(scope);
                    if (replace) {
                        outerEl.replaceWith(innerEl);
                        return innerEl;
                    } else {
                        return outerEl;
                    }
                });
            }

            function loadTpl(el, scope, module, tpl, replace) {
                return load(el, uri(module, tpl), scope, replace);
            }
        }

        /**
         * @ngdoc method
         * @name $TplLoaderProvider#setNoCacheFn
         * @param {function} rewrites the method to calculate a query key to disallow browser to cache templates
         *        It ignored, while provided method return false
         *        Example:
         *              provider.setNoCacheFn(function(){ return 'v='+$rootScope.version; });
         */
        function setNoCacheFn(fn) {
            custom.noCacheFn = fn;
        }
        /**
         * @ngdoc method
         * @name $TplLoaderProvider#setBaseUri
         * @param {string} base part of generated uri
         *      Example:
         *      provider.setBaseUri('/MODULES/'); // -> /MODULES/moduleName/templates/index.html
         */
        function setBaseUri(base) {
            custom.base_uri = base;
        }
        /**
         * @ngdoc method
         * @name $TplLoaderProvider#setTplDir
         * @param {string} base part of generated uri
         *      Example:
         *      provider.setTplDir('/TEMPLATES/'); // -> /modules/moduleName/TEMPLATES/index.html
         */
        function setTplDir(dir) {
            custom.tpl_dir = dir;
        }

        /**
         * @ngdoc method
         * @name $TplLoaderProvider#setDefaultTplName
         * @param {string} base part of generated uri
         *      Example:
         *      provider.setDefaultTplName('INDEX.tpl'); // -> /modules/moduleName/templates/INDEX.tpl
         */
        function setDefaultTplName(tplname) {
            custom.default_tplname = tplname;
        }

        /**
         * @ngdoc method
         * @name $TplLoaderProvider#uri
         * @param {string} Uri part that represents module name
         * @param {string?} Uri part that represents template name
         *
         * Behaviour of this method should be configurated in config module section.
         * Can be set followed provider's setters:
         *  setBaseUri('/modules/')
         *  setTplDir('templates')
         *  setDefaultTplName('index.html')
         *
         *        Example:
         *              var tpl = tplLoader.uri('controls', 'custom.html')
         */
        function uri(module, tpl) {
            var noCache = custom.noCacheFn(module, tpl);
            noCache = (noCache === false) ? '' : '?'+noCache;
            return custom.base_uri + module + custom.tpl_dir + (tpl || custom.default_tplname) + noCache;
        }
        // default implementation for noCacheFn
        function preventCacheKey() {
            return false;
        }
    }

})(angular.module('arth.tplloader', []));

/**
 * This module written for step-by-step refactore my old-old code
 * #load functionality can be fully replaced with `templateUrl`/`replace` directive options
 */
