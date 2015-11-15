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

    TokenizedController.$inject = ['$scope', '$element', '$attrs', '$parse', '$timeout',
    'ParseFormatService', 'InputSelection', 'ParserFactory', 'MappingParser'];
    function TokenizedController($scope, el, $attrs, $parse, $timeout, svc, sel, Parser, Mapping) {
      var ngModel = el.controller('ngModel')
        , ctrl = this
        , tokens = []
        , model = $parse($attrs.ngModel)
        , options = $parse($attrs[directiveName])($scope)
        , parsers = [], formatters = []
        ;
      // export interface
      angular.extend(options, {
          addToken: addToken
      });

      setupModelView(options.modelviews);

      function setupModelView(cfg) {
        var rc = angular.isArray(cfg.commonExp) ? cfg.commonExp : [cfg.commonExp];
        var rv = rc.slice();
        var rm = rc.slice();

        cfg.maps.forEach(function(map){
          var viewReg = map.reg[0];
          viewReg.type = map.type || 'param_mapping';
          viewReg.template = map.tpl[1];
          viewReg.mapping = map.vm;
          rv.push(viewReg);

          var modelReg = map.reg[1];
          modelReg.type = map.type || 'param_mapping';
          modelReg.template = map.tpl[0];
          modelReg.mapping = map.mv;
          rm.push(modelReg);
        });

        var View = Parser.getRepeater(rv, true);
        var Model = Parser.getRepeater(rm, true);
        View.toModel = Parser.getMapping(rv, true);
        Model.toView = Parser.getMapping(rm, true);

        var pList = [parser, tokenize];
        var fList = [formatter];
        svc.fillListProcesser(pList, ngModel.$parsers);
        svc.fillListProcesser(pList, parsers);
        svc.fillListProcesser(fList, ngModel.$formatters);
        svc.fillListProcesser(fList, formatters);
        window.vm = parser;
        window.mv = formatter;
        function parser(val) {
          var tokens = View.toModel.parse(val||'');
          return tokens;
        }
        function formatter(val) {
          var tokens = Model.toView.parse(val||'');
          return tokens.join('');
        }
        function tokenize(toks, local) {
          if (local) return toks.join('');
          var curIndex = -1;
          var len = tokens.length;
          toks.forEach(function(token, index){
            var old = tokens[index];
            if (old !== token) {
              // many of assumptions here
              if (index >= len ) {
                save(index+1, 'New Token, set cursor after it');
              } else {
                if (token===tokens[index+1]) {
                  save(index, 'Removed Token, set cursor before next');
                } else {
                  save(index+1, 'Inserted Token, set cursor after next');
                }
              }
              tokens[index] = token;
            }
          });
          if (len > toks.length) {
            save(toks.length, 'Was truncated: set after last new token');
            tokens.splice(toks.length);
          }
          var result = toks.join('');
          updateView(result, curIndex);
          return result;

          // Store token position (0-n), where cursor should be
          function save(index) {
            if (~curIndex) return; //already set
            curIndex = index;
          }
        }
      }
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
      function updateView (val, index) {
          var view = format(val);
          if (view !== ngModel.$viewValue) {
              ngModel.$setViewValue(view);
              ngModel.$render();
              setPos(index);
          }
      }
      // @depends: $timeout, el, tokens, format, InputSelection
      var cursorPosition = 0;
      function setPos (index) {
          if (!~index || typeof index == 'undefined') return;
          var pos = tokens.map(format).slice(0, index).join('').length;
          $timeout(function(){
              sel.setSelection(el, pos, pos, true);
              cursorPosition = pos;
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
        model.assign($scope, tokens.join(''));
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

})(angular.module('arth.tokenized', [
    'arth.parser.svc',
    'arth.svc.InputSelection'
]), 'arthTokenized');



