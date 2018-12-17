# Add hyperlinks from keywords (关键词加超链接)

Generate links for documentation from keywords.

Demo: <http://wuliupo.github.io/keyword-linker>
Code: <http://github.com/wuliupo/keyword-linker>

## Usage（使用方法）

- npm install keyword-linker
- Browser: ```<script src="./keyword-linker.js"></script>```
- Node: ```require('keyword-linker')``` ref: [./demo.js](demo.js)
  - [https://github.com/jsdom/jsdom](jsdom)
  - [https://github.com/cheeriojs/cheerio](cheerio)
- Import: ```import KeywordLinker from './keyword-linker.js'```

```js
// Prepare（准备参数）
var keywords = [ { text: '盘古大帝', priority: 10, max: 3 }, { text: '盘古', priority: 1, max: 3 } ];
var config = { replacement: '<a class="hot-keyword" href="#KEYWORD">KEYWORD</a>', placeholder: 'KEYWORD', max: 10 };
var kl = new KeywordLinker(keywords, config);

// Render for a DOM (直接渲染网页内容)
kl.addLink2Dom(aDom);

// Render for a string (替换字符串)
var newContent = kl.addLink2String(content);
```
