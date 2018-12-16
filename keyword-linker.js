(function(global, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = global.document ? factory(global, true) : function(w) {
            if (!w.document) {
                throw new Error('KeywordLinker requires a window with a document');
            }
            return factory(w);
        };
    } else {
        factory(global);
    }
}(typeof window !== 'undefined' ? window : this, function(win, noGlobal) {
    var doc = win.document;

    var KeywordLinker = function(keywords, config) {
        config = config || {};
        var replacement = config.replacement;
        if (!replacement || !keywords || !keywords.length) {
            throw new Error('KeywordLinker requires parameters: keywords(array), replacement(string or function)');
        }
        if (typeof replacement === 'string') {
            var placeholder = config.placeholder;
            if (placeholder && (typeof placeholder === 'string')) {
                placeholder = new RegExp(placeholder, 'g');
            }
            if (!placeholder || !(placeholder instanceof RegExp)) {
                throw new Error('KeywordLinker string replacement parameter must have a peer placeholder(string or regexp)');
            }
            this.replacement = function(s0) {
                return replacement.replace(placeholder, function() {
                    return s0;
                });
            }
        } else if (typeof that.replacement === 'function') {
            this.replacement = replacement;
        } else {
            throw new Error('KeywordLinker replacement parameter must be string or function');
        }
        this.config = Object.assign({
            ignoreTags: ['A', 'IMG', 'TEXTAREA', 'SELECT', 'INPUT', 'BUTTON', 'SCRIPT', 'STYLE', 'LINK', 'PRE', 'VIDEO', 'SVG', 'CANVAS', 'AUDIO']
        }, config);
        this.keywords = keywords;
    }

    KeywordLinker.prototype = {
        addLink2String: function(content) {
            var dom = doc.createElement('div');
            dom.innerHTML = content;
            dom.style.display = 'none';
            doc.documentElement.appendChild(dom);
            this.addLink2Dom(dom);
            content = dom.innerHTML;
            doc.documentElement.removeChild(dom);
            return content;
        },
        addLink2Dom: function(dom) {
            var keywordArr = [];
            var keywordMap = {};
            for (var i = 0; i < this.keywords.length; i++) {
                var item = Object.assign({}, this.keywords[i]);
                keywordArr.push(item);
                keywordMap[item.text] = item;
            }
            keywordArr.sort(function(a, b) {
                return a.priority < b.priority;
            });
            this.keywordArr = keywordArr;
            this.keywordMap = keywordMap;
            this.__initRegExp();
            return this.__addLink2Dom(dom);
        },
        __initRegExp: function() {
            var rst = [];
            for (var i = 0; i < this.keywordArr.length; i++) {
                var item = this.keywordArr[i];
                if (item.max > 0 && rst.indexOf(item.text) < 0) {
                    rst.push(item.text);
                }
            }
            rst = rst.join('|');
            this.keywordRegExp = rst ? new RegExp(rst, 'g') : null;
        },
        __addLink2Dom: function(dom) {
            if (!dom || !dom.innerHTML || !this.keywordRegExp) {
                return dom;
            }
            if (!this.keywordRegExp) {
                return dom;
            }
            var nodes = dom.childNodes;
            for (var i = 0; i < nodes.length; i++) {
                if (!this.keywordRegExp) {
                    return dom;
                }
                var node = nodes[i];
                if (node.nodeName === '#text') {
                    var text = node.nodeValue;
                    if (!text.trim()) {
                        continue;
                    }
                    var newText = this.__replaceText(text);
                    if (newText !== text) {
                        // 文本节点，替换为带超链接的复杂dom
                        var span = doc.createElement('span');
                        span.className = 'hot-wrap';
                        span.innerHTML = newText;
                        dom.replaceChild(span, node);
                    }
                } else if (this.config.ignoreTags.indexOf(node.nodeName) < 0) {
                    this.__addLink2Dom(node);
                }
            }
            return dom;
        },
        __replaceText: function(text) {
            if (!this.keywordRegExp || !text || !text.trim()) {
                return text;
            }
            var isBreak = false; // 如果一个关键词被匹配完了，后面的正则表达式要重新计算，不再进行后续替换
            var that = this;
            text = text.replace(this.keywordRegExp, function(s0) {
                var item = that.keywordMap[s0]; // 替换过以后，数量减1
                if (isBreak) {
                    return s0;
                }
                item.max--;
                if (item.max < 1) {
                    isBreak = true;
                }
                return that.replacement(s0);
            });
            var lastGt = text.lastIndexOf('>') + 1;
            if (isBreak && lastGt) {
                this.__initRegExp();
                // 中止的部分，前面的直接返回，后面的需要再次替换
                text = text.substring(0, lastGt) + this.__replaceText(text.substring(lastGt));
            }
            return text;
        }
    };

    win.KeywordLinker = KeywordLinker;
}));
