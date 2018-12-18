(function(global, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = global.document ? factory(global) : function(win) {
            if (!win || !win.document && !win.load) {
                console.warn('KeywordLinker requires window with document');
            }
            return factory(win);
        };
    } else {
        factory(global);
    }
}(typeof window !== 'undefined' ? window : this, function(win) {
    if (!win || !win.document && !win.load) {
        throw new Error('KeywordLinker requires window with document, or using cheerio');
    }

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
            ignoreTags: ['a', 'img', 'textarea', 'select', 'input', 'button', 'script', 'style', 'link', 'pre', 'video', 'svg', 'canvas', 'audio', 'head', 'iframe', 'frame', 'area', 'meta', 'embed', 'object', 'applet', 'xml', 'xmp', 'plaintext']
        }, config);
        this.keywords = keywords;
    }

    KeywordLinker.prototype = {
        addLink2String: function(content) {
            var dom, doc = win.document;
            if (doc) {
                dom = doc.createElement('div');
                dom.innerHTML = content;
                dom.style.display = 'none';
                doc.documentElement.appendChild(dom);
                this.addLink2Dom(dom);
                content = dom.innerHTML;
                doc.documentElement.removeChild(dom);
            } else if (win.load) { // cheerio environment
                dom = win('<div>' + content + '</div>', undefined, undefined, { decodeEntities: false });
                this.addLink2Dom(dom[0]);
                content = dom.html();
            } else {
                throw new Error('KeywordLinker.addLink2String need a DOM environment');
            }
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
            this.max = this.config.max || 20;
            this.__initRegExp();
            this.__addLink2Dom(dom);
        },
        __initRegExp: function() {
            if (this.max <= 0) {
                this.keywordRegExp = null;
                return;
            }
            var rst = [];
            for (var i = 0; i < this.keywordArr.length; i++) {
                var item = this.keywordArr[i];
                if (item.max > 0 && item.text && rst.indexOf(item.text) < 0) {
                    rst.push(item.text);
                }
            }
            rst = rst.join('|');
            this.keywordRegExp = rst && new RegExp(rst, 'g');
        },
        __addLink2Dom: function(dom) {
            if (!dom || !dom.childNodes || !this.keywordRegExp) {
                return dom;
            }
            var nodes = dom.childNodes;
            for (var i = 0; i < nodes.length; i++) {
                if (!this.keywordRegExp) {
                    return dom;
                }
                var node = nodes[i];
                var nodeName = (node.nodeName || node.tagName || node.name || node.type || '').toLowerCase();
                if (nodeName === '#text' || nodeName === 'text' || node.nodeType == 3) {
                    var text = node.nodeValue || '';
                    if (!text.trim()) {
                        continue;
                    }
                    var newText = this.__replaceText(text);
                    if (newText !== text) {
                        if (win.load) { // cheerio environment
                            win(node).replaceWith('<span class="hot-wrap">' + newText + '</span>');
                        } else if (win.document) {
                            // 文本节点，替换为带超链接的复杂dom
                            var span = win.document.createElement('span');
                            span.className = 'hot-wrap';
                            span.innerHTML = newText;
                            dom.replaceChild(span, node);
                        }
                    }
                } else if (nodeName && this.config.ignoreTags.indexOf(nodeName) < 0 && nodeName.indexOf('#') !== 0) {
                    this.__addLink2Dom(node);
                }
            }
        },
        __replaceText: function(text) {
            if (!this.keywordRegExp || !text || !text.trim()) {
                return text;
            }
            var breaker = 0; // 如果一个关键词被匹配完了，后面的正则表达式要重新计算，不再进行后续替换
            var that = this;
            text = text.replace(this.keywordRegExp, function(s0) {
                var item = that.keywordMap[s0]; // 替换过以后，数量减1
                if (breaker) {
                    breaker++;
                    return s0;
                }
                if (--that.max < 1 || --item.max < 1) {
                    breaker++;
                }
                return that.replacement(s0);
            });
            if (breaker) { // 只要有关键词被用完，就得重新计算正则表达式
                this.__initRegExp();
                if (breaker > 1) { // 当前文本后面还有其他匹配的
                    var lastBracket = text.lastIndexOf('>') + 1;
                    if (lastBracket) {
                        if (this.keywordRegExp) {
                            // 中止的部分，前面的直接返回，后面的需要再次替换
                            text = text.substring(0, lastBracket) + this.__replaceText(text.substring(lastBracket));
                        }
                    }
                }
            }
            return text;
        }
    };

    win.KeywordLinker = KeywordLinker;
    return KeywordLinker;
}));
