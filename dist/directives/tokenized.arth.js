!function(e,r){"use strict";function t(){return{require:[r,"ngModel"],restrict:"A",controller:n}}function n(e,t,n,i,s,o,l,a){function c(e){for(var r=m.length,t=e;r--;)t=m[r](t,!0);return t}function u(e){var r=c(e);r!==d.$viewValue&&(d.$setViewValue(r),d.$render())}function f(e){var r=c(v.map(c).slice(0,e).join("")).length;o(function(){a.setSelection(n,r,r,!0)})}function h(e){var r=a.getSelection(n),t=v.map(c);"undefined"==typeof r.start&&(r.end=r.start=t.join("").length);for(var i=null,s=null,l=0,u=0,f=v.length;f>=l&&(u==r.start&&null===i||u>r.start&&null===i&&(i=l-1),u>=r.end&&null===s&&(s=l),l!=f);l++){var h=v[l];u+=c(h).length}null===i&&(i=s),v.splice(i,s-i,e),t.splice(i,s-i,e),o(function(){var r=t.slice(0,i).join("").length+c(e).length;a.setSelection(n,r,r,!0)})}var d=n.controller("ngModel"),v=[],p=(s(i.ngModel),s(i[r])(e)),g=[],m=[];angular.extend(p.svc,{format:c,updateView:u,tokens:v,setPos:f,addToken:h}),l.fillListProcesser(p.parsers,d.$parsers),l.fillListProcesser(p.parsers,g),l.fillListProcesser(p.formatters,d.$formatters),l.fillListProcesser(p.formatters,m)}function i(){function e(e,n){return Array.isArray(e)?(e.forEach(r(n)),t):t}function r(e){function r(r){var s="push";if(Array.isArray(r)){if(s=r[i],!~["push","unshift"].indexOf(s))throw new Error(t.name+": Wrong method ["+s+"] - push|unshift expected");r=r[n]}e[s](r)}var n=0,i=1;return r}var t=this;t.$name="ParseFormatService",this.getListProcesser=r,this.fillListProcesser=e}e.directive(r,t),e.service("ParseFormatService",i),t.$inject=[],n.$inject=["$scope","$rootScope","$element","$attrs","$parse","$timeout","ParseFormatService","InputSelection"],i.$inject=[]}(angular.module("arth.tokenized",[]),"arthTokenized");