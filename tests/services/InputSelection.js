describe('InputSelection service', function() {

    beforeEach(module('arth.svc.InputSelection'));

    var svc, element;
    beforeEach(inject(function(InputSelection) {
      svc = InputSelection;

      element = [{
        selectionStart: 0,
        selectionEnd: 0,
        selectionDirection: 'forward',
        setSelectionRange: function(start, end, dir) {
            this.selectionStart = Math.min(start, end),
            this.selectionEnd = Math.max(start, end),
            this.selectionDirection = start == end ? 'forward' : dir
        }
      }]
    }));


    describe('When selectionData required', function() {
        it('should return correct object', function() {
            element[0].setSelectionRange(3, 6, 'backward');
            expect(svc.getSelection(element)).toEqual({
                start: 3,
                end: 6,
                dir: false,
                pos: 3
            });
        });
    });

    describe('When partial data required', function() {
        it('should return correct data', function() {
            element[0].setSelectionRange(3, 6, 'backward');
            expect(svc.getSelectionStart(element)).toEqual(3);
            expect(svc.getSelectionEnd(element)).toEqual(6);
            expect(svc.getSelectionDirection(element)).toEqual(false);
        });
    });

    describe('When need to override current selection', function() {
        it('should call setSelectionRange method', function() {
            svc.setSelection(element, 3, 10, false);
            expect(element[0].selectionStart).toEqual(3);
            expect(element[0].selectionEnd).toEqual(10);
            expect(element[0].selectionDirection).toEqual('backward');
        });
        it('should provide start less than end ', function() {
            svc.setSelection(element, 10, 3, false);
            expect(element[0].selectionStart).toEqual(3);
            expect(element[0].selectionEnd).toEqual(10);
            expect(element[0].selectionDirection).toEqual('backward');
        });
        it('should transform bool direction to none/backward/forward ', function() {
            svc.setSelection(element, 10, 3);
            expect(element[0].selectionDirection).toEqual('none');
            svc.setSelection(element, 10, 3, true);
            expect(element[0].selectionDirection).toEqual('forward');
            svc.setSelection(element, 10, 3, false);
            expect(element[0].selectionDirection).toEqual('backward');
        });
    });
});

