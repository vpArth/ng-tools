(function (module, directiveName) {
    'use strict';

    module.directive(directiveName, Directive);

    Directive.$inject = ['InputSelection'];
    function Directive($svc) {
        var directive = {
            restrict: 'A',
            controller: SelectionController,
            compile: compile
        };
        SelectionController.$inject = ['$scope', '$element', '$parse', '$attrs', 'InputSelection', '$rootScope'];

        return directive;

        /** Implementation ************/
        function SelectionController ($scope, el, $parse, $attrs, $svc, $rootScope) {
            var sc = this
              , getter = $parse($attrs[directiveName])
              , setter = getter.assign
              ;
            sc.$setModelValue = setModelValue;
            sc.$setViewValue = setViewValue;
            sc.$viewValue = $svc.getSelection(el);
            sc.$render = render;
            sc.$middleware = [];

            // initialize
            sc.$setModelValue({start: 0, end: 0, pos: 0, dir: undefined});

            // model to view
            $scope.$watch($attrs[directiveName], selectionWatch, true);

            // view to model
            var eventList = ['click', 'keyup', 'keydown', 'keypress', 'mousedown', 'mouseup', 'focus', 'blur'];
            switchOnListeners();
            $scope.$on('$destroy', switchOffListeners);

            // export
            $scope.debug = 'Debug!';
            $scope[directiveName] = sc;

            /***Implementation ********/

            function render() {
                $svc.setSelection(
                    el,
                    sc.$viewValue.start,
                    sc.$viewValue.end,
                    sc.$viewValue.dir
                );
                return sc;
            }
            function setViewValue(data) {
                if (compare(data, sc.$viewValue)) return sc;
                if (!data) data = {};
                sc.$viewValue = {
                    start: data.start || 0,
                    end: data.end || 0,
                    dir: data.dir,
                    pos: data.dir ? data.end || 0 : data.start || 0
                };
                return sc;
            }
            var lastModelValue;
            function setModelValue(data) {
                if (!data) data = {};
                if (!sc.$modelValue) sc.$modelValue = getter($scope);
                if (lastModelValue && compare(lastModelValue, sc.$modelValue)) return sc;
                sc.$modelValue.start = data.start || 0;
                sc.$modelValue.end = data.end || 0;
                sc.$modelValue.dir = data.dir;
                sc.$modelValue.pos = data.dir ? data.end || 0 : data.start || 0;

                setter($scope, sc.$modelValue);
                return sc;
            }
            function compare(o1, o2) {
                if (!o1 || !o2) return false;
                var res = true;
                res = res && o1.start === o2.start;
                res = res && o1.end === o2.end;
                res = res && o1.dir === o2.dir;
                res = res && o1.pos === o2.pos;
                return res;
            }
            function selectionWatch() {
                var middle = sc.$middleware
                  , idx = middle.length
                  , modelVal = getter($scope)
                  , viewValue
                  ;
                sc.$modelValue = modelVal;
                viewValue = sc.$modelValue;

                sc.$setViewValue(viewValue).$render();
                sc.$modelValue.pos = sc.$viewValue.pos;
                if (!$rootScope.$$phase) $scope.$apply();
                return modelVal;
            }
            function switchOnListeners() {
                eventList.forEach(function(ev){
                    el.on(ev, updateModelView);
                });
            }
            function switchOffListeners() {
                eventList.forEach(function(ev){
                    el.off(ev, updateModelView);
                });
            }
            function updateModelView(ev) {
                sc.$viewValue = $svc.getSelection(el);
                if (!$rootScope.$$phase) {
                    $scope.$apply(function(){
                        sc.$setModelValue(sc.$viewValue);
                    });
                }
            }
        }

        function compile (el) {
            if (el.prop("tagName") !== 'INPUT' || el.prop("type")&&el.prop("type")!=='text') {
                throw 'This directive should be applied to input[type=text] element.';
            }
            return linker;
        }
        function linker (scope, el, attrs, ctrl) {
        }
    }

})(angular.module('arth.cursor', [
    'arth.svc.InputSelection'
]), 'arthCursor');

(function (module, directiveName) {
    'use strict';

    module.directive(directiveName, Directive);

    Directive.$inject = ['InputSelection'];
    function Directive($svc) {
        var directive = {
            restrict: 'A',
            scope: {},
            require: ['ngModel'],
            compile: compile
        };
        directive.scope[directiveName] = '=';

        return directive;

        /**************/

        function compile (el) {
            if (el.prop("tagName") !== 'INPUT' || el.prop("type")&&el.prop("type")!=='text') {
                throw 'This directive should be applied to input[type=text] element.';
            }
            return linker;
        }
        function linker (scope, el, attrs, ctrls) {
            var ngModel = ctrls[0];
            // ngModel.$formatters.push(formatter);
            ngModel.$parsers.push(parser);
            var model = scope[directiveName];
            var tokens = [];
            model.tokens = tokens;
            model.addToken = addToken;

            function parser (value) {
                var old = tokens.join('');
                // allow add to tokens only
                if (value.substr(0, old.length) === old && value.length > old.length) {
                    tokens.push(value.substr(old.length));
                    return value;
                }
                return old;
            }

            function addToken(token) {
                tokens.push(token);
                ngModel.$setViewValue((ngModel.$viewValue||'')+token);
                ngModel.$render();
            }
        }
    }

})(angular.module('arth.tokenized', [
    'arth.svc.InputSelection'
]), 'arthTokenized');

(function (module) {
    'use strict';

    module.factory('InputSelection', InputSelection);

    function InputSelection () {
        return {
            getSelection: getSelection,
            getSelectionStart: getSelectionStart,
            getSelectionEnd: getSelectionEnd,
            getSelectionDirection: getSelectionDirection,
            setSelection: setSelection
        };
        function getSelection (el) {
            var res = {
                start: getSelectionStart(el),
                end: getSelectionEnd(el),
                dir: getSelectionDirection(el)
            };
            res.pos = res.dir ? res.end : res.start;
            return res;
        }
        function getSelectionStart (el) {
            return el[0].selectionStart;
        }
        function getSelectionEnd (el) {
            return el[0].selectionEnd;
        }
        function getSelectionDirection (el) {
            var map = {'none': undefined, 'forward': true, 'backward': false };
            return map[el[0].selectionDirection];
        }
        function setSelection(el, start, end, direction) {
            start = start || 0;
            end = end || 0;
            el[0].setSelectionRange(
                Math.min(start, end),
                Math.max(start, end),
                (typeof direction === 'undefined') ? 'none' : direction ? 'forward' : 'backward'
            );
        }
    }

})(angular.module('arth.svc.InputSelection', []));
