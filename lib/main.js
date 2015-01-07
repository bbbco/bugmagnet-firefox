
var config = JSON.parse(require('sdk/self').data.load('config.json'));
var cm = require('sdk/context-menu');
var elements = "input,textarea";

//console.log(config);


var newMenu = function (title) {
    return cm.Menu({
        label: title,
        context: cm.SelectorContext(elements),
        items: []
    });
}

var newItem = function (title, value) {
    return cm.Item({
        label: title,
        context: cm.SelectorContext(elements),
        contentScript: 'self.on("click", function(node, data) {' +
            'node.value = ' + value + ';' +
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
cm.Item({
      label: "TESTING",
      contentScript: 'self.on("click", function (node, data) {' +
                     '  console.log(\'clicked: \' + node);' +
                     '  node.value = "TESTING";' +
                     '});'
});
