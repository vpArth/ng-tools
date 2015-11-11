// @todo: make model.pos settable too

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
                setObj(sc.$viewValue, data.start, data.end, data.dir);
                return sc;
            }
            var lastModelValue;
            function setModelValue(data) {
                if (!data) data = {};
                if (!sc.$modelValue) sc.$modelValue = getter($scope);
                if (lastModelValue && compare(lastModelValue, sc.$modelValue)) return sc;
                setObj(sc.$modelValue, data.start, data.end, data.dir);
                setter($scope, sc.$modelValue);
                return sc;
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
            // Helper functions
            function setObj(o, start, end, dir) {
                var d, p
                  , s = Math.min(start, end)
                  , e = Math.max(start, end)
                  , d = dir
                  , p = d ? e : s
                  ;
                o.start = s;
                o.end   = e;
                o.dir   = d;
                o.post  = p;
                return o;
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
