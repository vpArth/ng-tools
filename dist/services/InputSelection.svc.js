!function(t){"use strict";function n(){function t(t){var o={start:n(t),end:e(t),dir:r(t)};return o.pos=o.dir?o.end:o.start,o}function n(t){return t[0].selectionStart}function e(t){return t[0].selectionEnd}function r(t){var n={none:void 0,forward:!0,backward:!1};return n[t[0].selectionDirection]}function o(t,n,e,r){n=n||0,e=e||0,t[0].setSelectionRange(Math.min(n,e),Math.max(n,e),"undefined"==typeof r?"none":r?"forward":"backward")}return{getSelection:t,getSelectionStart:n,getSelectionEnd:e,getSelectionDirection:r,setSelection:o}}t.factory("InputSelection",n)}(angular.module("arth.svc.InputSelection",[]));