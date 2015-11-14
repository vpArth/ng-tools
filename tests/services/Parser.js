describe('Parser', function() {

    beforeEach(module('arth.parser.svc'));

    var Factory, CSV;
    beforeEach(inject(function(ParserFactory, CSVParser) {
      Factory = ParserFactory;
      CSV = CSVParser;
    }));

    describe('CSV parser', function() {
        it('should parse simple csv', function() {
            var row = CSV.parse('Joe,Smith,32\nJane,Doe,26\nMike,Bowel,54');
            expect(row).toEqual([['Joe','Smith','32'],['Jane','Doe','26'],['Mike','Bowel','54']]);
            // row = _csv.parse('"Joe","John,\n""Smith""",32\nJane,Doe,26\nMike,Bowel,54');
            // console.log(row);
        });
    });

    describe('Templates', function () {
        it('should substitute params', function(){
            var template = '<%name%> $surname is $age years old.';
            var res = Factory.getReplacer([/<%(\w+)%>/, /\$(\w+)/])({name: 'Alex', surname: 'Deider', age: 28}).parse(template).join('');
            expect(res).toEqual('Alex Deider is 28 years old.');
        });
    });
    describe('Formula test type', function () {
        it('should tokenize formatted view', function(){
            var viewRegexps = [
                /\d/, /[\*\/\+\-\^\(\)\.]/,
                /\[Рез: ([^\[\]]+?)\]/
            ];
            var modelRegexps = [
                /\d/, /[\*\/\+\-\^\(\)\.]/,
                /result\((\d+)\)/
            ];
            var views = [
                ['[Рез: Билирубин общий]-[Рез: Билирубин прямой]excess',['[Рез: Билирубин общий]','-','[Рез: Билирубин прямой]']],
                ['1+2*3^0.5', ['1','+','2','*','3','^','0','.','5']]
            ];
            var models = [
                ['result(94)-result(95)excess',['result(94)','-','result(95)']],
                ['1+2*3^0.5', ['1','+','2','*','3','^','0','.','5']]
            ];
            var view2model = {
                'Билирубин общий': '94',
                'Билирубин прямой': '95',
            };
            var model2view = {
                '94': 'Билирубин общий',
                '95': 'Билирубин прямой',
            };

            var View = Factory.getRepeater(viewRegexps, true);
            var Model = Factory.getRepeater(modelRegexps, true);
            var ViewToModel = new Factory(viewRegexps, function(token, b, regexp){
                if(token == '\0') return;
                return b ? token.replace(regexp, function(all, val) {
                    return regexp.toString()==='/\\[Рез: ([^\\[\\]]+?)\\]/' ? 'result('+view2model[val]+')' : token;
                }) : undefined;
            });
            var ModelToView = new Factory(modelRegexps, function(token, b, regexp){
                if(token == '\0') return;
                return b ? token.replace(regexp, function(all, val) {
                    return regexp.toString() === '/result\\((\\d+)\\)/' ? '[Рез: '+model2view[val]+']' : token;
                }) : undefined;
            });

            views.forEach(function(view){
                expect(View.parse(view[0])).toEqual(view[1]);
            });
            models.forEach(function(model){
                expect(Model.parse(model[0])).toEqual(model[1]);
            });
            views.forEach(function(view, index){
                expect(ViewToModel.parse(view[0])).toEqual(models[index][1]);
            });
            models.forEach(function(model, index){
                expect(ModelToView.parse(model[0])).toEqual(views[index][1]);
            });
        });
    });

});

