
var config = JSON.parse(require('sdk/self').data.load('config.json'));
var cm = require('sdk/context-menu');
var elements = "input[type=text],textarea,div[contenteditable=true],span[contenteditable=true]";

//console.log(config);
var dataGenerators = {
    literal: function(request) {
        return request.value;
    },
    size: function(request) {
        var size = parseInt(request.size, 10),
            value = request.template;
        while (value.length < size) {
            value += request.template;
        }
        return value.substring(0, request.size);
    }
}
var getValue = function(request) {
    if (!request) {
        return false;
    }
    var dataGenerator = dataGenerators[request['_type']];
    if (!dataGenerator) {
        return false;
    }
    return dataGenerator(request);
}


var newMenu = function (title) {
    return cm.Menu({
        label: title,
        context: cm.SelectorContext(elements),
        items: []
    });
}

var newItem = function (title, item) {
    if (typeof(item) === 'string') {
        item = { _type: 'literal', value: item };
    }
    console.log(item);
    var actualValue = getValue(item);
    return cm.Item({
        label: title,
        context: cm.SelectorContext(elements),
        contentScript: 'self.on("click", function(node, data) {' +
            'console.log(node);' +
            'if (node.tagName === "TEXTAREA" || node.tagName === "INPUT") {' +
                'node.value = "' + actualValue + '";' +
            '} else if (node.hasAttribute("contenteditable")) {' +
                'node.innerText = "' + actualValue + '";' +
            '}' +
        '});'
    });
}

var processMenu = function(configObject, parentMenu){

    var getTitle = function (key) {
        if (config instanceof Array) {
            return config[key];
        }
        return key;
    };
    if (!configObject) {
        return;
    }

    Object.keys(configObject).forEach(function(key) {
        var value = configObject[key], title = getTitle(key);
        if (typeof(value) === 'string' || (typeof(value) === 'object' && value.hasOwnProperty('_type'))) {
            var item = newItem(title, value);
            parentMenu.addItem(item);
            console.log('item: ' + item);
        } else if (typeof(value) === 'object') {
            var menu = newMenu(title);
            parentMenu.addItem(menu);
            processMenu(value, menu);
            console.log('menu: ' + menu);
        }
    });

}
var rootMenu = newMenu("Bug Magnet");
processMenu(config, rootMenu);
