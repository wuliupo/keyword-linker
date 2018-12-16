# Add hyperlinks for keywords (关键词加超链接)

demo: <http://pauli.cn/keyword-linker>

## Usage（使用方法）

```js
// Prepare（准备参数）
var keywords = [ { text: '盘古大帝', priority: 10, max: 3 }, { text: '盘古', priority: 1, max: 3 } ];
var config = { replacement: '<a class="hot-keyword" href="#KEYWORD">KEYWORD</a>', placeholder: 'KEYWORD' };
new kl = new KeywordLinker(keywords, replacement);

// Render for a DOM (直接渲染网页内容)
kl.addLink2Dom(aDom);

// Render for a string (替换字符串)
var newContent = kl.addLink2String(content);
```
