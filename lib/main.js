'use strict';

// load dependencies
var config = JSON.parse(require('sdk/self').data.load('config.json'));
var cm = require('sdk/context-menu');
var data = require("sdk/self").data;

// which element selectors on which to enable Bug Magnet context menu
var elements =  "input[type=text]," +
                "input[type=password]," +
                "input[type=email]," +
                "input[type=url]," +
                "input[type=search]," +
                "input[type=tel]," +
                "input[type=number]," +
                "textarea," +
                "div[contenteditable=true]," +
                "span[contenteditable=true]";

// define dynamically generated data from attributes found in config file
var dataGeneratorOptions = {
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

// get the resulting value used to set in the field
var getValue = function(dataObject) {
    if (!dataObject) {
        return false;
    }
    var dataGenerator = dataGeneratorOptions[dataObject['_type']];
    if (!dataGenerator) {
        return false;
    }
    return dataGenerator(dataObject);
}

// construct a new menu
var newMenu = function (title) {
    return cm.Menu({
        label: title,
        context: cm.SelectorContext(elements),
        items: []
    });
}

// construct a new menu item
var newItem = function (title, itemData) {
    if (typeof(itemData) === 'string') {
        itemData = { _type: 'literal', value: itemData };
    }
    return cm.Item({
        label: title,
        context: cm.SelectorContext(elements),
        data: getValue(itemData),
        contentScriptFile: data.url("context-element.js")
    });
}

// build entire context menu
var buildMenu = function(configObject, parentMenu){

    var getTitle = function (key) {
        if (configObject instanceof Array) {
            return configObject[key];
        }
        return key;
    }
    if (!configObject) {
        return;
    }

    Object.keys(configObject).forEach(function(key) {
        var value = configObject[key], title = getTitle(key);
        if (typeof(value) === 'string' || (typeof(value) === 'object' && value.hasOwnProperty('_type'))) {
            var item = newItem(title, value);
            parentMenu.addItem(item);
        } else if (typeof(value) === 'object') {
            var menu = newMenu(title);
            parentMenu.addItem(menu);
            buildMenu(value, menu);
        }
    });

}

var rootMenu = newMenu("Bug Magnet");
buildMenu(config, rootMenu);
