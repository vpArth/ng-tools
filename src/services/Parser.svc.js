;(function(module){

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
                        tpl = tpl.replace(new RegExp('\\\\\\\$'+(index+1), 'g'), val);
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
    angular.extend(Parser.prototype, {
        parse: parse,
        build: build,
        next: next,
        search: search
    });
    Parser.getRepeater = getRepeater;
    Parser.getReplacer = getReplacer;
    Parser.getMapping = getMapping;
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
    function getMapping(tokenizers, filter) {
        return new (MappingParser(Parser))(tokenizers, filter);
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
    function build(src, real, matches) {
        if (src) {
            var res = this.doBuild ? this.doBuild(src, real, this.tkn, matches) : src;
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
                self.build(match, true, [].slice.call(arguments, 0));
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
