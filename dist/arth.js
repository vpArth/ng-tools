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

        return directive;

        function compile (el) {
            if (el.prop("tagName") !== 'INPUT' || el.prop("type")&&el.prop("type")!=='text') {
                throw 'This directive should be applied to input[type=text] element.';
            }
            return linker;
        }
        function linker (scope, el, attrs, ctrl) {
        }
    }

    SelectionController.$inject = ['$scope', '$element', '$parse', '$attrs', 'InputSelection', '$rootScope'];
    function SelectionController ($scope, el, $parse, $attrs, $svc, $rootScope) {
        var sc = this, getter, setter;
        var twoWay = !!$attrs[directiveName];
        sc.$setModelValue = setModelValue;
        sc.$setViewValue = setViewValue;
        sc.$viewValue = $svc.getSelection(el);
        sc.$render = render;

        if (twoWay) {
            getter = $parse($attrs[directiveName]);
            setter = getter.assign;
            // model to view
            $scope.$watch($attrs[directiveName], selectionWatch, true);
            // initialize
            sc.$setModelValue({start: 0, end: 0, pos: 0, dir: undefined});
        }

        // view to model
        var eventList = ['click', 'keyup', 'keydown', 'keypress', 'mousedown', 'mouseup', 'focus', 'blur'];
        switchOnListeners();
        $scope.$on('$destroy', switchOffListeners);

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
            var modelVal = getter($scope)
              , viewValue
              ;
            if (posChangedOnly(modelVal, sc.$viewValue)) {
                setObj(modelVal, modelVal.pos, modelVal.pos, true);
                setter($scope, modelVal);
                // scope updated, wait next $watch trigger
                return modelVal;
            }
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
            if (twoWay && !$rootScope.$$phase) {
                $scope.$apply(function(){
                    sc.$setModelValue(sc.$viewValue);
                });
            }
        }
        // Helper functions
        function setObj(o, start, end, dir) {
            var s = Math.min(start, end)
              , e = Math.max(start, end)
              , d = dir
              , p = d ? e : s
              ;
            o.start = s;
            o.end   = e;
            o.dir   = d;
            o.pos  = p;
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
        function posChangedOnly(o1, o2) {
            if (!o1 || !o2) return false;
            var res = true;
            res = res && o1.start === o2.start;
            res = res && o1.end === o2.end;
            res = res && o1.dir === o2.dir;
            res = res && o1.pos !== o2.pos;
            return res;
        }
    }


})(angular.module('arth.cursor', [
    'arth.svc.InputSelection'
]), 'arthCursor');

;(function(module, directiveName){
    'use strict';
    module.directive(directiveName, Directive);
    module.service('ParseFormatService', Service);


    Directive.$inject = [];
    function Directive() {
        return {
            require: [directiveName, 'ngModel'],
            restrict: 'A',
            controller: TokenizedController
        };
    }

    TokenizedController.$inject = ['$scope', '$rootScope', '$element', '$attrs', '$parse', '$timeout',
    'ParseFormatService', 'InputSelection'];
    function TokenizedController($scope, $rootScope, el, $attrs, $parse, $timeout, svc, sel) {
        var ngModel = el.controller('ngModel')
          , ctrl = this
          , tokens = []
          , model = $parse($attrs.ngModel)
          , options = $parse($attrs[directiveName])($scope)
          , parsers = [], formatters = []
          ;
        // export interface
        angular.extend(options.svc, {
            format: format,
            updateView: updateView,
            tokens: tokens,
            setPos: setPos,
            addToken: addToken
        });

        svc.fillListProcesser(options.parsers, ngModel.$parsers);
        svc.fillListProcesser(options.parsers, parsers);
        svc.fillListProcesser(options.formatters, ngModel.$formatters);
        svc.fillListProcesser(options.formatters, formatters);

        // @depends: formatters
        function format(val) {
          var idx = formatters.length;
          var result = val;
          while (idx--) {
            result = formatters[idx](result, true);
          }
          return result;
        }
        // @depends: parsers
        function parse(val) {
          var idx = parsers.length;
          var result = val;
          while (idx--) {
            result = parsers[idx](result, true);
          }
          return result;
        }
        // @depends: ngModel, format
        function updateView (val) {
            var view = format(val);
            if (view !== ngModel.$viewValue) {
                ngModel.$setViewValue(view);
                ngModel.$render();
            }
        }
        // @depends: $timeout, el, tokens, format, InputSelection
        function setPos (index) {
            var pos = format(tokens.map(format).slice(0, index).join('')).length;
            $timeout(function(){
                sel.setSelection(el, pos, pos, true);
            });
        }
        // @depends: el, tokens, format, $timeout, InputSelection
        function addToken (token) {
            var pos = sel.getSelection(el);
            var viewTokens = tokens.map(format);
            if (typeof pos.start == 'undefined') {
                pos.end = pos.start = viewTokens.join('').length;
            }
            var start = null, end = null;
            for (var i = 0, c=0, n = tokens.length; i<=n; i++) {
                if (c == pos.start && start === null) {
                    // start = i;
                } else if (c > pos.start && start === null) {
                    start = i-1;
                }
                if (c >= pos.end && end === null) {
                    end = i;
                }
                if (i == n) break;
                var tok = tokens[i];
                c += format(tok).length;
            }
            if (start === null) {
                start = end;
            }
            tokens.splice(start, end-start, token);
            viewTokens.splice(start, end-start, token);
            $timeout(function(){
                var pos = viewTokens.slice(0, start).join('').length + format(token).length;
                sel.setSelection(el, pos, pos, true);
            });
        }
    }

    Service.$inject = [];
    function Service () {
        var svc = this;
        svc.$name = 'ParseFormatService';
        this.getListProcesser = getListProcesser;
        this.fillListProcesser = fillListProcesser;
        function fillListProcesser(list, container) {
            if (!Array.isArray(list)) return svc;
            list.forEach(getListProcesser(container));
            return svc;
        }
        function getListProcesser(list) {
            var KEY_PROCESSER = 0
              , KEY_METHOD = 1
              ;
            return pushProcesser;
            /**
             * @param {function|array} processer - f(v)
             * @param {string} processer[KEY_METHOD] - 'push'|'unshift'
             * @param {function} processer[KEY_METHOD] - f(v)
             */
            function pushProcesser(processer) {
                var method = 'push';
                if (Array.isArray(processer)) {
                    method = processer[KEY_METHOD];
                    if (!~['push', 'unshift'].indexOf(method)) {
                        throw new Error(svc.name+': Wrong method ['+method+'] - push|unshift expected');
                    }
                    processer = processer[KEY_PROCESSER];
                }
                list[method](processer);
            }
        }
    }

    function Tokenizer(tokenizers, doBuild) {

    }
})(angular.module('arth.tokenized', [
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

;(function(module){

module.factory('ParserFactory', ParserFactory);
module.service('CSVParser', CSVParser);

CSVParser.$inject = ['ParserFactory'];
// @todo: implement quoted part of CSV parsing
function CSVParser(Parser) {
    var rows = [], row = rows[0] = [], resrow;
    return new Parser([',', '\n'], function(text, isSeparator) {
        if (isSeparator){
            if (text == '\n' || text == '\0') { // EOL/EOF
                this.tokens.push(row);
                row = [];
            }
        } else {
            row.push(text);
        }
    });
}

ParserFactory.$inject = [];
function ParserFactory () {
    angular.extend(Parser.prototype, {
        parse: parse,
        build: build,
        next: next,
        search: search
    });
    Parser.getRepeater = getRepeater;
    Parser.getReplacer = getReplacer;
    return Parser;

    function Parser( tokenizers, doBuild ){
        this.tokenizers = Array.isArray(tokenizers) ? tokenizers : [tokenizers];
        if (doBuild) this.doBuild = doBuild;
    }

    function getRepeater(tokenizers, filter) {
        return new Parser(tokenizers, BuildRepeater);
        function BuildRepeater(src, real) {
            if (src === '\0') return;
            return real ? src : (filter?undefined:src);
        }
    }
    function getReplacer(tokenizers, filter) {
        return function(values) {
            return new Parser(tokenizers, BuildReplacer);
            function BuildReplacer(src, real, regexp) {
                if (src === '\0') return;
                return real ? src.replace(regexp, function(all, name) {
                   return values[name];
                }) : (filter?undefined:src);
            }
        };
    }

    function parse(src) {
        this.src = src;
        this.ended = false;
        this.tokens = [];
        do {
            this.next();
        } while (!this.ended);
        return this.tokens;
    }
    function build(src, real) {
        if (src) {
            var res = this.doBuild ? this.doBuild(src, real, this.tkn) : src;
            if (typeof res !== 'undefined') {
                this.tokens.push(res);
            }
        }
    }
    function next() {
        var self = this, plain;
        self.search();
        plain = self.src.slice(0, self.min);
        self.build(plain, false);
        self.src = self.src.slice(self.min)
            .replace(self.tkn, function replace(match) {
                self.build(match, true);
                return '';
        });
        if (!self.src) {
            self.build('\0', true);
            self.ended = true;
        }
    }
    function search() {
        var self = this, i = 0, tkn, idx;
        self.min = -1;
        self.tkn = '';
        while (typeof (tkn = self.tokenizers[i++]) != 'undefined') {
            idx = self.src[tkn.test?'search':'indexOf'](tkn);
            if(idx != -1 && (self.min == -1 || idx < self.min)) {
                self.tkn = tkn;
                self.min = idx;
            }
        }
        if( self.min == -1 ) {
            self.min = self.src.length;
        }
    }

}

})(angular.module('arth.parser.svc', []));
