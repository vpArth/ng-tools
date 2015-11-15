!function(e,t){"use strict";function r(){return{require:[t,"ngModel"],restrict:"A",controller:n}}function n(e,r,n,i,o,a,s,l,c){function u(e){function t(e){var t=c.toModel.parse(e||"");return t}function r(e){var t=u.toView.parse(e||"");return t.join("")}function n(e,t){function r(e){~n||(n=e)}if(t)return e.join("");var n=-1,i=h.length;e.forEach(function(e,t){var n=h[t];n!==e&&(t>=i?r(t+1,"New Token, set cursor after it"):e===h[t+1]?r(t,"Removed Token, set cursor before next"):r(t+1,"Inserted Token, set cursor after next"),h[t]=e)}),i>e.length&&(r(e.length,"Was truncated: set after last new token"),h.splice(e.length));var o=e.join("");return f(o,n),o}var i=angular.isArray(e.commonExp)?e.commonExp:[e.commonExp],o=i.slice(),s=i.slice();e.maps.forEach(function(e){var t=e.reg[0];t.type=e.type||"param_mapping",t.template=e.tpl[1],t.mapping=e.vm,o.push(t);var r=e.reg[1];r.type=e.type||"param_mapping",r.template=e.tpl[0],r.mapping=e.mv,s.push(r)});var c=l.getRepeater(o,!0),u=l.getRepeater(s,!0);c.toModel=l.getMapping(o,!0),u.toView=l.getMapping(s,!0);var p=[t,n],v=[r];a.fillListProcesser(p,m.$parsers),a.fillListProcesser(p,w),a.fillListProcesser(v,m.$formatters),a.fillListProcesser(v,y),window.vm=t,window.mv=r}function p(e){for(var t=y.length,r=e;t--;)r=y[t](r,!0);return r}function f(e,t){var r=p(e);r!==m.$viewValue&&(m.$setViewValue(r),m.$render(),v(t))}function v(e){if(~e&&"undefined"!=typeof e){var t=h.map(p).slice(0,e).join("").length;o(function(){s.setSelection(r,t,t,!0),P=t})}}function g(t){var n=s.getSelection(r),i=h.map(p);"undefined"==typeof n.start&&(n.end=n.start=i.join("").length);for(var a=null,l=null,c=0,u=0,f=h.length;f>=c&&(u==n.start&&null===a||u>n.start&&null===a&&(a=c-1),u>=n.end&&null===l&&(l=c),c!=f);c++){var v=h[c];u+=p(v).length}null===a&&(a=l),h.splice(a,l-a,t),i.splice(a,l-a,t),d.assign(e,h.join("")),o(function(){var e=i.slice(0,a).join("").length+p(t).length;s.setSelection(r,e,e,!0)})}var m=r.controller("ngModel"),h=[],d=i(n.ngModel),$=i(n[t])(e),w=[],y=[];angular.extend($,{addToken:g}),u($.modelviews);var P=0}function i(){function e(e,n){return Array.isArray(e)?(e.forEach(t(n)),r):r}function t(e){function t(t){var o="push";if(Array.isArray(t)){if(o=t[i],!~["push","unshift"].indexOf(o))throw new Error(r.name+": Wrong method ["+o+"] - push|unshift expected");t=t[n]}e[o](t)}var n=0,i=1;return t}var r=this;r.$name="ParseFormatService",this.getListProcesser=t,this.fillListProcesser=e}e.directive(t,r),e.service("ParseFormatService",i),r.$inject=[],n.$inject=["$scope","$element","$attrs","$parse","$timeout","ParseFormatService","InputSelection","ParserFactory","MappingParser"],i.$inject=[]}(angular.module("arth.tokenized",["arth.parser.svc","arth.svc.InputSelection"]),"arthTokenized");