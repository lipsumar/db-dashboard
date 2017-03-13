var $ = require('jquery');
var App = require('./views/App');

window.app = new App({
	el: $('#app')
}).render();