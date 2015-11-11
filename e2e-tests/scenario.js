// ng-tools demo page scenario
describe('arthCursor directive demo', function() {
  it('User interaction with directive', function() {
    browser.get('');
    expect(browser.getTitle()).toEqual('Ng-tools');
    $('nav>ul>li').click();
    var input = element(by.model('str'));
    var form = {
        start: element(by.model('ctrl.data.start')),
        end: element(by.model('ctrl.data.end')),
        dir: element(by.model('ctrl.data.dir')),
    };

    input.click();
    input.sendKeys('0123456789');
    expect(form.start.getAttribute('value')).toEqual('10');
    expect(form.end.getAttribute('value')).toEqual('10');
    expect(form.dir.getAttribute('checked')).toEqual('true');

    input.sendKeys('abcdefghij');
    expect(form.start.getAttribute('value')).toEqual('20');
    expect(form.end.getAttribute('value')).toEqual('20');
    var seq = [];
    var cx
    cx=7;while(cx--) seq.push(protractor.Key.ARROW_LEFT);
    seq.push(protractor.Key.SHIFT);
    cx=10;while(cx--) seq.push(protractor.Key.ARROW_LEFT);
    seq.push(protractor.Key.NULL);
    input.sendKeys.apply(input, seq);

    expect(form.start.getAttribute('value')).toEqual('3');
    expect(form.end.getAttribute('value')).toEqual('13');
    expect(form.dir.getAttribute('checked')).toEqual(null);

    input.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, 'a'));

    expect(form.start.getAttribute('value')).toEqual('0');
    expect(form.end.getAttribute('value')).toEqual('20');
    expect(form.dir.getAttribute('checked')).toEqual('true');

    // browser.pause();
  });
});
