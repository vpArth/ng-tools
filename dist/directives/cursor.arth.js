!function(e,t){"use strict";function n(e){function n(e,n,r,o,u,i){function a(){return u.setSelection(n,h.$viewValue.start,h.$viewValue.end,h.$viewValue.dir),h}function l(e){return V(e,h.$viewValue)?h:(e||(e={}),f(h.$viewValue,e.start,e.end,e.dir),h)}function s(t){return t||(t={}),h.$modelValue||(h.$modelValue=m(e)),g&&V(g,h.$modelValue)?h:(f(h.$modelValue,t.start,t.end,t.dir),w(e,h.$modelValue),h)}function c(){var t,n=m(e);return v(n,h.$viewValue)?(f(n,n.pos,n.pos,!0),w(e,n),n):(h.$modelValue=n,t=h.$modelValue,h.$setViewValue(t).$render(),h.$modelValue.pos=h.$viewValue.pos,i.$$phase||e.$apply(),n)}function $(){S.forEach(function(e){n.on(e,p)})}function d(){S.forEach(function(e){n.off(e,p)})}function p(t){h.$viewValue=u.getSelection(n),y&&!i.$$phase&&e.$apply(function(){h.$setModelValue(h.$viewValue)})}function f(e,t,n,r){var o=Math.min(t,n),u=Math.max(t,n),i=r,a=i?u:o;return e.start=o,e.end=u,e.dir=i,e.pos=a,e}function V(e,t){if(!e||!t)return!1;var n=!0;return n=n&&e.start===t.start,n=n&&e.end===t.end,n=n&&e.dir===t.dir,n=n&&e.pos===t.pos}function v(e,t){if(!e||!t)return!1;var n=!0;return n=n&&e.start===t.start,n=n&&e.end===t.end,n=n&&e.dir===t.dir,n=n&&e.pos!==t.pos}var m,w,h=this,y=!!o[t];h.$setModelValue=s,h.$setViewValue=l,h.$viewValue=u.getSelection(n),h.$render=a,y&&(m=r(o[t]),w=m.assign,e.$watch(o[t],c,!0),h.$setModelValue({start:0,end:0,pos:0,dir:void 0}));var S=["click","keyup","keydown","keypress","mousedown","mouseup","focus","blur"];$(),e.$on("$destroy",d);var g}function r(e){if("INPUT"!==e.prop("tagName")||e.prop("type")&&"text"!==e.prop("type"))throw"This directive should be applied to input[type=text] element.";return o}function o(e,t,n,r){}var u={restrict:"A",controller:n,compile:r};return n.$inject=["$scope","$element","$parse","$attrs","InputSelection","$rootScope"],u}e.directive(t,n),n.$inject=["InputSelection"]}(angular.module("arth.cursor",["arth.svc.InputSelection"]),"arthCursor");