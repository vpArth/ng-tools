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



