describe('Test TplLoader provider', function () {

    var TplLoaderProvider;

    beforeEach(function () {
        var m = angular.module('test.arth.tplloader', ['arth.tplloader']);
        m.config(TestModule);
        TestModule.$inject = ['TplLoaderProvider'];
        function TestModule (provider) {
            TplLoaderProvider = provider;
        }

        module('arth.tplloader', 'test.arth.tplloader');
        inject(function () {});
    });
    describe('with default configuration', function () {
        it('should generate correct uris', function () {
            // check sanity
            expect(TplLoaderProvider).not.toBeUndefined();

            expect(TplLoaderProvider.uri('controls.module')).toBe('/modules/controls.module/templates/index.html');
            expect(TplLoaderProvider.uri('controls.module', 'index.tpl.html')).toBe('/modules/controls.module/templates/index.tpl.html');
            expect(TplLoaderProvider.$get().uri('controls.module')).toBe('/modules/controls.module/templates/index.html');
            expect(TplLoaderProvider.$get().uri('controls.module', 'index.tpl.html')).toBe('/modules/controls.module/templates/index.tpl.html');
        });
    });
    describe('with custom configuration', function () {
        it('should generate correct uris', function () {
            // check sanity
            expect(TplLoaderProvider).not.toBeUndefined();
            // configure the provider
            TplLoaderProvider.setBaseUri('/src/modules/');
            TplLoaderProvider.setTplDir('/tpls/');
            TplLoaderProvider.setDefaultTplName('index.tpl');

            expect(TplLoaderProvider.uri('controls.module')).toBe('/src/modules/controls.module/tpls/index.tpl');
            expect(TplLoaderProvider.uri('controls.module', 'index.tpl.html')).toBe('/src/modules/controls.module/tpls/index.tpl.html');
            expect(TplLoaderProvider.$get().uri('controls.module')).toBe('/src/modules/controls.module/tpls/index.tpl');
            expect(TplLoaderProvider.$get().uri('controls.module', 'index.tpl.html')).toBe('/src/modules/controls.module/tpls/index.tpl.html');

            TplLoaderProvider.setNoCacheFn(function(module, tpl) {
                return (module+tpl).length;
            });

            expect(TplLoaderProvider.uri('controls.module')).toBe('/src/modules/controls.module/tpls/index.tpl?24');
            expect(TplLoaderProvider.uri('controls.module', 'index.tpl.html')).toBe('/src/modules/controls.module/tpls/index.tpl.html?29');
            expect(TplLoaderProvider.$get().uri('controls.module')).toBe('/src/modules/controls.module/tpls/index.tpl?24');
            expect(TplLoaderProvider.$get().uri('controls.module', 'index.tpl.html')).toBe('/src/modules/controls.module/tpls/index.tpl.html?29');

        });
    });

    describe('load method', function(){
        var compile, scope, backend, http, templateCache;
        beforeEach(function(){
            inject(function($compile, $rootScope, $httpBackend, $http, $templateCache){
                compile = $compile;
                scope = $rootScope.$new();
                backend = $httpBackend;
                http = $http;
                templateCache = $templateCache;
            });
        });

        afterEach(function() {
           backend.verifyNoOutstandingExpectation();
           backend.verifyNoOutstandingRequest();
        });

        it('should download, compile template and apply to innerHTML', function(){
            var tplLoader = TplLoaderProvider.$get(http, templateCache, compile);
            var el = compile('<div>Not loaded yet</div>')(scope);;
            tplLoader.load(el, '/index.tpl', scope);
            backend.expect('GET', '/index.tpl').respond('<h1>Hello, {{name}}!</h1>');
            backend.flush();

            scope.name = 'World';
            scope.$digest();
            expect(el.text()).toBe('Hello, World!');

            scope.name = 'Alice';
            scope.$digest();
            expect(el.prop('tagName')).toBe('DIV');
            expect(el.find('h1').text()).toBe('Hello, Alice!');

            dealoc(scope);
        });

        it('should be able to replace parent element', function(){
            var tplLoader = TplLoaderProvider.$get(http, templateCache, compile);
            var el = compile('<div>Not loaded yet</div>')(scope);
            tplLoader.load(el, '/index.tpl', scope, true).then(function (element) {
                el = element;
            });

            backend.expect('GET', '/index.tpl').respond('<h1>Hello, {{name}}!</h1>');
            backend.flush();

            scope.name = 'World';
            scope.$digest();
            expect(el.text()).toBe('Hello, World!');

            scope.name = 'Alice';
            scope.$digest();
            expect(el.prop('tagName')).toBe('H1');
            expect(el.text()).toBe('Hello, Alice!');

            dealoc(scope);
        });

        it('should works with loadTpl shortcut', function(){
            var tplLoader = TplLoaderProvider.$get(http, templateCache, compile);
            var el = compile('<div>Not loaded yet</div>')(scope);

            tplLoader.loadTpl(el, scope, 'controls.module', 'index.tpl.html', true).then(function (element) {
                el = element;
            });

            backend.expect('GET', '/modules/controls.module/templates/index.tpl.html').respond('<h1>Hello, {{name}}!</h1>');
            backend.flush();

            scope.name = 'World';
            scope.$digest();
            expect(el.text()).toBe('Hello, World!');
        });
    });

});
