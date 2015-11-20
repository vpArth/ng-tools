var help = new (require('./helper.js').Helper)(browser, protractor);
var log4js = require('log4js');
var logger = log4js.getLogger();

var input, form, menu, buttons, actionButtons, actionInput;
describe('Tokenized', function() {
    beforeEach(function(){
        browser.get('');
        expect(browser.getTitle()).toEqual('Ng-tools');
        menu = element.all(by.repeater('m in ctrl.modules'));
        buttons = element.all(by.repeater('button in tok.buttons'));
        menu.get(0).click();

        input = element(by.model('tok.str'));
        input.click();
        actionButtons = element.all(by.css('.actionBtn'));
        actionInput = element(by.model('tok.demostr'));
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
    describe('Exported actions', function(){
        beforeEach(function(){
            input.sendKeys('12+');
            buttons.get(0).click();
            expect(input.getAttribute('value')).toEqual('12+[Year]');
        });
        describe('clear() method', function(){
            it('should clear model and view', function(){
                actionButtons.get(2).click();
                expect(input.getAttribute('value')).toEqual('');
                input.sendKeys('12+');
                buttons.get(0).click();
                expect(input.getAttribute('value')).toEqual('12+[Year]');
            });
        });
        describe('setViewValue() method', function(){
            it('should parse and setup provided view value', function(){
                actionInput.sendKeys('[Year]-2000');
                actionButtons.get(0).click();
                expect(input.getAttribute('value')).toEqual('[Year]-2000');
                input.sendKeys('+1*');
                buttons.get(0).click();
                expect(input.getAttribute('value')).toEqual('[Year]-2000+1*[Year]');
            });
        })
        describe('setModelValue() method', function(){
            it('should format and setup provided model value', function(){
                actionInput.sendKeys('param(1)-2000');
                actionButtons.get(1).click();
                expect(input.getAttribute('value')).toEqual('[Year]-2000');
                input.sendKeys('+1*');
                buttons.get(0).click();
                expect(input.getAttribute('value')).toEqual('[Year]-2000+1*[Year]');
            });
        })
    });
});

