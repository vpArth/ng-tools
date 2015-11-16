;(function(module){
    'use strict';

module.factory('ParserFactory', ParserFactory);
module.service('CSVParser', CSVParser);
module.service('MappingParser', MappingParser);

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

MappingParser.$inject = ['ParserFactory'];
function MappingParser(Parser) {
    return MappingParserConstructor;
    function MappingParserConstructor(tokenizers, filter) {
        return new Parser(tokenizers, function(token, b, regexp, matches){
            if (token == '\0') return;
            if (!b) return filter ? undefined : token;
            switch (regexp.type) {
                case 'param_mapping':
                    var m = matches.slice(1, -2);
                    var tpl = regexp.template;
                    var success = true;
                    m.forEach(function (match, index) {
                        var val = regexp.mapping[match];
                        if (typeof val == 'undefined') {
                            success = false;
                            return;
                        }
                        tpl = tpl.replace(new RegExp('\\\\\\$'+(index+1), 'g'), val);
                    });
                    return success ? tpl : (filter?undefined:token);
                default:
                    return token;
            }
        });
    }
}

ParserFactory.$inject = [];
function ParserFactory () {
    var parser;

    Parser.getRepeater = getRepeater;
    Parser.getReplacer = getReplacer;
    Parser.getMapping = getMapping;
    return Parser;

    /**
     * @param {string[],RegExp[]} tokenizers
     * @param {function} doBuild
     *
     * string Parser.src
     * string[] Parser.tokens
     * string[] Parser#parse(string)
     * Parser#doBuild
     */
    function Parser( tokenizers, doBuild ){
        var parser = this, source, ended = true;
        var curToken, nextIndex;
        tokenizers = angular.isArray(tokenizers) ? tokenizers : [tokenizers];
        if (doBuild) parser.doBuild = doBuild;
        parser.parse = parse;

        return parser;

        function parse(src) {
            source = src;
            ended = false;
            parser.tokens = [];
            do {
                next();
            } while (!ended);
            return parser.tokens;
        }
        function build(src, real, matches) {
            if (src) {
                var res = parser.doBuild ? parser.doBuild(src, real, curToken, matches) : src;
                if (typeof res !== 'undefined') {
                    parser.tokens.push(res);
                }
            }
        }
        function next() {
            var plain;
            search();
            plain = source.slice(0, nextIndex);
            build(plain, false);
            source = source.slice(nextIndex)
                .replace(curToken, function replace(match) {
                    build(match, true, [].slice.call(arguments, 0));
                    return '';
            });
            if (!source) {
                build('\0', true);
                ended = true;
            }
        }
        function search() {
            var i = 0, tkn, idx;
            nextIndex = -1;
            curToken = '';
            while (typeof (tkn = tokenizers[i++]) != 'undefined') {
                idx = source[tkn.test?'search':'indexOf'](tkn);
                if(idx != -1 && (nextIndex == -1 || idx < nextIndex)) {
                    curToken = tkn;
                    nextIndex = idx;
                }
            }
            if( nextIndex == -1 ) {
                nextIndex = source.length;
            }
        }
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
    function getMapping(tokenizers, filter) {
        var P = new MappingParser(Parser);
        return new P(tokenizers, filter);
    }
}

})(angular.module('arth.parser.svc', []));
