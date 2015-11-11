// ng-tools demo page scenario
function keyRepeat(key, multiplier, seq) {
    seq = seq || [];
    var cx;
    cx=multiplier;
    while(cx--) {
      seq.push(protractor.Key.ARROW_LEFT);
    }
    return seq;
}


var input, form;
describe('arthCursor directive testing', function() {
  beforeEach(function(){
    browser.get('');
    expect(browser.getTitle()).toEqual('Ng-tools');
    $('nav>ul>li').click();
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

      var sequence = [];
      keyRepeat(protractor.Key.ARROW_LEFT, 7, sequence);
      sequence.push(protractor.Key.SHIFT);
      keyRepeat(protractor.Key.ARROW_LEFT, 10, sequence);
      sequence.push(protractor.Key.NULL);
      input.sendKeys.apply(input, sequence);

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
      input.sendKeys('0123456789abcdefghij');
      form.start.click();
      form.start.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));
      form.start.sendKeys('6');

      // @todo: investigate how-to
      // expect(actual selection range).is({start: 6, end: 20});
    });
  });
});
