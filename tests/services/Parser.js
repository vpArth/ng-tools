describe('Parser', function() {

    beforeEach(module('arth.parser.svc'));

    var Factory, CSV, Mapping;
    beforeEach(inject(function(ParserFactory, CSVParser, MappingParser) {
      Factory = ParserFactory;
      CSV = CSVParser;
      Mapping = MappingParser;
    }));

    describe('CSV parser', function() {
        it('should parse simple csv', function() {
            var row = CSV.parse('Joe,Smith,32\nJane,Doe,26\nMike,Bowel,54');
            expect(row).toEqual([['Joe','Smith','32'],['Jane','Doe','26'],['Mike','Bowel','54']]);
        });
    });

    describe('Templates', function () {
        it('should substitute params', function(){
            var template = '<%name%> $surname is $age years old.';
            var res = Factory.getReplacer([/<%(\w+)%>/, /\$(\w+)/])({name: 'Alex', surname: 'Deider', age: 28}).parse(template).join('');
            expect(res).toEqual('Alex Deider is 28 years old.');
        });
    });
    describe('Mapping parser', function () {
        it('should tokenize formatted view', function(){
            var view2model = {'Age': '94', 'Year': '95', };
            var model2view = {'94': 'Age', '95': 'Year', };

            var vR = /\[([^\[\]]+?)\]/;
            vR.type = 'param_mapping';
            vR.mapping = view2model;
            vR.template = 'param(\\$1)';

            var mR = /param\((\d+)\)/;
            mR.type = 'param_mapping';
            mR.mapping = model2view;
            mR.template = '[\\$1]';

            var viewRegexps = [/\d/, /[\*\/\+\-\^\(\)\.]/,  vR];
            var modelRegexps = [/\d/, /[\*\/\+\-\^\(\)\.]/, mR];
            var views = [
                ['[Age]-[Year]excess',['[Age]','-','[Year]']],
                ['[Age]-[Year2',['[Age]','-','2']],
                ['1+2*3^0.5', ['1','+','2','*','3','^','0','.','5']]
            ];
            var models = [
                ['param(94)-param(95)excess',['param(94)','-','param(95)']],
                ['param(94)-2',['param(94)','-','2']],
                ['1+2*3^0.5', ['1','+','2','*','3','^','0','.','5']]
            ];

            var View = Factory.getRepeater(viewRegexps, true);
            var Model = Factory.getRepeater(modelRegexps, true);
            var ViewToModel = new Mapping(viewRegexps, true);
            var ModelToView = new Mapping(modelRegexps, true);

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

