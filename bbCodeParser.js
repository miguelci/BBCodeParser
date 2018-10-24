"use strict";
/// <reference path="bbCodeParseTree.ts" />
/// <reference path="bbTag.ts" />
exports.__esModule = true;
var bbCodeParseTree_1 = require("./bbCodeParseTree");
var bbTag_1 = require("./bbTag");
//Indicates if the first string ends with the second str
function endsWith(str, endStr) {
    if (str.length == 0) {
        return false;
    }
    if (endStr.length > str.length) {
        return false;
    }
    var inStrEnd = str.substr(str.length - endStr.length, endStr.length);
    return endStr == inStrEnd;
}
//Indicates if the first string starts with the second string
function startsWith(str, startStr) {
    if (str.length == 0) {
        return false;
    }
    if (startStr.length > str.length) {
        return false;
    }
    var inStrStart = str.substr(0, startStr.length);
    return startStr == inStrStart;
}
var tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};
//Escapes the given html
function escapeHTML(html) {
    return html.replace(/[&<>]/g, function (tag) {
        return tagsToReplace[tag] || tag;
    });
}
//Represents a BB code parser
var BBCodeParser = /** @class */ (function () {
    //Creates a new parser with the given tags
    function BBCodeParser(bbTags, options) {
        if (options === void 0) { options = { escapeHTML: false }; }
        this.bbTags = bbTags;
        this.options = options;
    }
    //Parses the given string
    BBCodeParser.prototype.parseString = function (content, stripTags, insertLineBreak, escapingHtml) {
        if (stripTags === void 0) { stripTags = false; }
        if (insertLineBreak === void 0) { insertLineBreak = true; }
        if (escapingHtml === void 0) { escapingHtml = true; }
        //Create the parse tree
        var parseTree = bbCodeParseTree_1.BBCodeParseTree.buildTree(content, this.bbTags);
        //If the tree is invalid, return the input as text
        if (parseTree == null || !parseTree.isValid()) {
            return content;
        }
        //Convert it to HTML
        return this.treeToHtml(parseTree.subTrees, insertLineBreak, escapingHtml, stripTags);
    };
    //Converts the given subtrees into html
    BBCodeParser.prototype.treeToHtml = function (subTrees, insertLineBreak, escapingHtml, stripTags) {
        var _this = this;
        if (stripTags === void 0) { stripTags = false; }
        var htmlString = "";
        var suppressLineBreak = false;
        subTrees.forEach(function (currentTree) {
            if (currentTree.treeType == bbCodeParseTree_1.TreeType.Text) {
                var textContent = currentTree.content;
                if (escapingHtml) {
                    textContent = (_this.options.escapeHTML) ? escapeHTML(textContent) : textContent;
                }
                if (insertLineBreak && !suppressLineBreak) {
                    textContent = textContent.replace(/(\r\n|\n|\r)/gm, "<br>");
                    suppressLineBreak = false;
                }
                htmlString += textContent;
            }
            else {
                //Get the tag
                var bbTag = _this.bbTags[currentTree.content];
                var content = _this.treeToHtml(currentTree.subTrees, bbTag.insertLineBreaks, escapingHtml, stripTags);
                //Check if to strip the tags
                if (!stripTags) {
                    htmlString += bbTag.markupGenerator(bbTag, content, currentTree.attributes);
                }
                else {
                    htmlString += content;
                }
                suppressLineBreak = bbTag.suppressLineBreaks;
            }
        });
        return htmlString;
    };
    //Returns the default tags
    BBCodeParser.defaultTags = function () {
        var bbTags = new Array();
        //Simple tags
        bbTags["b"] = new bbTag_1["default"]("b", true, false, false);
        bbTags["i"] = new bbTag_1["default"]("i", true, false, false);
        bbTags["u"] = new bbTag_1["default"]("u", true, false, false);
        bbTags["text"] = new bbTag_1["default"]("text", true, false, true, function (tag, content, attr) {
            return content;
        });
        bbTags["img"] = new bbTag_1["default"]("img", true, false, false, function (tag, content, attr) {
            return "<img src=\"" + content + "\" />";
        });
        bbTags["url"] = new bbTag_1["default"]("url", true, false, false, function (tag, content, attr) {
            var link = content;
            if (attr["url"] != undefined) {
                link = escapeHTML(attr["url"]);
            }
            if (!startsWith(link, "http://") && !startsWith(link, "https://")) {
                link = "http://" + link;
            }
            return "<a href=\"" + link + "\" target=\"_blank\">" + content + "</a>";
        });
        bbTags["code"] = new bbTag_1["default"]("code", true, false, true, function (tag, content, attr) {
            var lang = attr["lang"];
            if (lang !== undefined) {
                return "<code class=\"" + escapeHTML(lang) + "\">" + content + "</code>";
            }
            else {
                return "<code>" + content + "</code>";
            }
        });
        return bbTags;
    };
    BBCodeParser.escapeHTML = function (content) {
        return escapeHTML(content);
    };
    BBCodeParser.startsWith = function (str, startStr) {
        return startsWith(str, startStr);
    };
    BBCodeParser.endsWith = function (str, endStr) {
        return endsWith(str, endStr);
    };
    return BBCodeParser;
}());
module.exports = BBCodeParser;
