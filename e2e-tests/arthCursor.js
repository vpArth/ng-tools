// ng-tools demo page scenario

var help = new (require('./helper.js').Helper)(browser, protractor);

var input, form;
describe('arthCursor directive testing', function() {
  beforeEach(function(){
    browser.get('');
    expect(browser.getTitle()).toEqual('Ng-tools');
    var menu = element.all(by.repeater('m in ctrl.modules'));
    menu.get(1).click();

    input = element(by.model('str'));

    form = {
        start: element(by.model('ctrl.data.start')),
        end: element(by.model('ctrl.data.end')),
        dir: element(by.model('ctrl.data.dir')),
        pos: element(by.model('ctrl.data.pos')),
    };

    input.click();
  });
  describe('User interaction with directive', function() {
    it('should updates while user inputs', function(){
      input.sendKeys('0123456789');
      expect(form.start.getAttribute('value')).toEqual('10');
      expect(form.end.getAttribute('value')).toEqual('10');
      expect(form.dir.getAttribute('checked')).toEqual('true');

      input.sendKeys('abcdefghij');
      expect(form.start.getAttribute('value')).toEqual('20');
      expect(form.end.getAttribute('value')).toEqual('20');

    })
    it('should follow user selection', function() {
      input.sendKeys('0123456789abcdefghij');

      var s = help.getKeySender(input);
      s.addN(protractor.Key.ARROW_LEFT, 7)
       .add(protractor.Key.SHIFT)
       .addN(protractor.Key.ARROW_LEFT, 10)
       .add(protractor.Key.NULL)
       .send();

      expect(form.start.getAttribute('value')).toEqual('3');
      expect(form.end.getAttribute('value')).toEqual('13');
      expect(form.dir.getAttribute('checked')).toEqual(null);


    });
    it('should follow ^A chord', function(){
      input.sendKeys('0123456789abcdefghij');
      input.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));

      expect(form.start.getAttribute('value')).toEqual('0');
      expect(form.end.getAttribute('value')).toEqual('20');
      expect(form.dir.getAttribute('checked')).toEqual('true');
    });
  });

  describe('Input selection/cursor position', function(){
    it('should follow scope position changes', function(){
      input.sendKeys('0123456789abcdefghij');

      form.pos.click();
      // form.pos.sendKeys.apply(form.pos, keyRepeat('\uE015', 8));
      form.pos.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
      form.pos.sendKeys('5');

      expect(form.start.getAttribute('value')).toEqual('5');
      expect(form.end.getAttribute('value')).toEqual('5');
      expect(form.dir.getAttribute('checked')).toEqual('true');
    });
    it('should follow scope start/end changes', function(){
      help.setElProperty(input, 'value', '0123456789abcdefghij');
      form.start.click();
      form.start.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
      form.start.sendKeys('6');
      form.end.click();
      form.end.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
      form.end.sendKeys('8');

      expect(help.getElProperty(input, 'selectionStart')).toEqual(6);
      expect(help.getElProperty(input, 'selectionEnd')).toEqual(8);
    });
  });
});
