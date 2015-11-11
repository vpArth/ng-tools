module.exports = {
    Helper: Helper
};


function KeySequenceSender(el) {
    var seq = [];
    this.add = add;
    this.addN = addN;
    this.send = send;

    function add(key) {
        seq.push(key);
        return this;
    }
    function addN(key, n) {
        while(n--) this.add(key);
        return this;
    }
    function send() {
        el.sendKeys.apply(el, seq);
        seq.length = 0;
        return this;
    }
}

function Helper(browser, protractor) {
    this.getKeySender = getKeySender;
    this.getElProperty = getElProperty;
    this.setElProperty = setElProperty;

    function getKeySender(el) {
        return new KeySequenceSender(el);
    }

    /**
     * @param {string} prop - 'style.top'
     */
    function getElProperty(el, prop) {
        return browser.executeScript(function (el, prop) {
            prop.split('.').forEach(function (field){
                el = el[field];
            });
            return el;
        }, el.getWebElement(), prop);
    }
    /**
     * @param {string} prop - 'style.top'
     */
    function setElProperty(el, prop, val) {
        return browser.executeScript(function (el, prop, val) {
            var prop = prop.split('.');
            var last = prop.pop();
            prop.forEach(function (field, i){
                el = el[field];
            });
            el[last] = val;
        }, el.getWebElement(), prop, val);
    }
}
