var help = new (require('./helper.js').Helper)(browser, protractor);
var log4js = require('log4js');
var logger = log4js.getLogger();

var input, form, menu, buttons;
describe('Tokenized', function() {
    beforeEach(function(){
        browser.get('');
        expect(browser.getTitle()).toEqual('Ng-tools');
        menu = element.all(by.repeater('m in ctrl.modules'));
        buttons = element.all(by.repeater('button in tok.buttons'));
        menu.get(0).click();

        input = element(by.model('tok.str'));
        input.click();
    });
    describe('On user input', function() {

        it('should filter incorrect tokens', function() {
            input.sendKeys('test123');
            expect(input.getAttribute('value')).toEqual('123');
        });
    });

    describe('Known bugs', function(){
        it('should not to move cursor on a sequence of same tokens', function(){
            input.sendKeys('-----------------1');
            input.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
            input.sendKeys(protractor.Key.ARROW_LEFT);
            expect(help.getElProperty(input, 'selectionStart')).toBe(0);
            input.sendKeys(protractor.Key.DELETE);
            // expect(help.getElProperty(input, 'selectionStart')).toBe(0).butNowItIs(16);
        });
    });
});

