var JSDOM = require('jsdom').JSDOM;
var win = (new JSDOM('<!doctype html><html><body></body></html>')).window;

// use global window
global.window = win;
global.document = win.document;
var KeywordLinker = require('./keyword-linker');

// use parameter window
var KeywordLinker = require('./keyword-linker')(win);

var keywords = [ { text: '盘古大帝', priority: 10, max: 3 }, { text: '盘古', priority: 1, max: 3 } ];
var config = { replacement: '<a class="hot-keyword" href="#KEYWORD">KEYWORD</a>', placeholder: 'KEYWORD' };
var kl = new KeywordLinker(keywords, config);

var content = '<!--这是一段注释，来自长相思 盘古大帝 盘古--><p data-tips="盘古大帝">宇宙混沌，鸿蒙初开，<a title="盘古大帝" href="#盘古大帝">盘古大帝劈开了天地</a>。</p><p class="盘古">盘古大帝、盘古大帝、盘古、盘古大帝、盘古、盘古大帝、盘古</p><p><img src="about:blank" alt="长相思、盘古、三皇五帝时期的故事" title="盘古大帝"></p>';
var newContent = kl.addLink2String(content); // Render for a string (替换字符串)
console.log(newContent);
