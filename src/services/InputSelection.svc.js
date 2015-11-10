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
