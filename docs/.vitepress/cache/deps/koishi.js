import {
  __commonJS,
  __export,
  __privateAdd,
  __privateGet,
  __publicField,
  __toESM
} from "./chunk-6PRBTMBS.js";

// node_modules/supports-color/browser.js
var require_browser = __commonJS({
  "node_modules/supports-color/browser.js"(exports, module) {
    "use strict";
    function getChromeVersion() {
      const matches = /(Chrome|Chromium)\/(?<chromeVersion>\d+)\./.exec(navigator.userAgent);
      if (!matches) {
        return;
      }
      return Number.parseInt(matches.groups.chromeVersion, 10);
    }
    var colorSupport = getChromeVersion() >= 69 ? {
      level: 1,
      hasBasic: true,
      has256: false,
      has16m: false
    } : false;
    module.exports = {
      stdout: colorSupport,
      stderr: colorSupport
    };
  }
});

// (disabled):node_modules/object-inspect/util.inspect
var require_util = __commonJS({
  "(disabled):node_modules/object-inspect/util.inspect"() {
  }
});

// node_modules/object-inspect/index.js
var require_object_inspect = __commonJS({
  "node_modules/object-inspect/index.js"(exports, module) {
    var hasMap = typeof Map === "function" && Map.prototype;
    var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, "size") : null;
    var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === "function" ? mapSizeDescriptor.get : null;
    var mapForEach = hasMap && Map.prototype.forEach;
    var hasSet = typeof Set === "function" && Set.prototype;
    var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, "size") : null;
    var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === "function" ? setSizeDescriptor.get : null;
    var setForEach = hasSet && Set.prototype.forEach;
    var hasWeakMap = typeof WeakMap === "function" && WeakMap.prototype;
    var weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
    var hasWeakSet = typeof WeakSet === "function" && WeakSet.prototype;
    var weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;
    var hasWeakRef = typeof WeakRef === "function" && WeakRef.prototype;
    var weakRefDeref = hasWeakRef ? WeakRef.prototype.deref : null;
    var booleanValueOf = Boolean.prototype.valueOf;
    var objectToString = Object.prototype.toString;
    var functionToString = Function.prototype.toString;
    var $match = String.prototype.match;
    var $slice = String.prototype.slice;
    var $replace = String.prototype.replace;
    var $toUpperCase = String.prototype.toUpperCase;
    var $toLowerCase = String.prototype.toLowerCase;
    var $test = RegExp.prototype.test;
    var $concat = Array.prototype.concat;
    var $join = Array.prototype.join;
    var $arrSlice = Array.prototype.slice;
    var $floor = Math.floor;
    var bigIntValueOf = typeof BigInt === "function" ? BigInt.prototype.valueOf : null;
    var gOPS = Object.getOwnPropertySymbols;
    var symToString = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol.prototype.toString : null;
    var hasShammedSymbols = typeof Symbol === "function" && typeof Symbol.iterator === "object";
    var toStringTag = typeof Symbol === "function" && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? "object" : "symbol") ? Symbol.toStringTag : null;
    var isEnumerable = Object.prototype.propertyIsEnumerable;
    var gPO = (typeof Reflect === "function" ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype ? function(O) {
      return O.__proto__;
    } : null);
    function addNumericSeparator(num, str) {
      if (num === Infinity || num === -Infinity || num !== num || num && num > -1e3 && num < 1e3 || $test.call(/e/, str)) {
        return str;
      }
      var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
      if (typeof num === "number") {
        var int = num < 0 ? -$floor(-num) : $floor(num);
        if (int !== num) {
          var intStr = String(int);
          var dec = $slice.call(str, intStr.length + 1);
          return $replace.call(intStr, sepRegex, "$&_") + "." + $replace.call($replace.call(dec, /([0-9]{3})/g, "$&_"), /_$/, "");
        }
      }
      return $replace.call(str, sepRegex, "$&_");
    }
    var utilInspect = require_util();
    var inspectCustom = utilInspect.custom;
    var inspectSymbol = isSymbol(inspectCustom) ? inspectCustom : null;
    var quotes = {
      __proto__: null,
      "double": '"',
      single: "'"
    };
    var quoteREs = {
      __proto__: null,
      "double": /(["\\])/g,
      single: /(['\\])/g
    };
    module.exports = function inspect_(obj, options, depth, seen) {
      var opts = options || {};
      if (has(opts, "quoteStyle") && !has(quotes, opts.quoteStyle)) {
        throw new TypeError('option "quoteStyle" must be "single" or "double"');
      }
      if (has(opts, "maxStringLength") && (typeof opts.maxStringLength === "number" ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity : opts.maxStringLength !== null)) {
        throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
      }
      var customInspect = has(opts, "customInspect") ? opts.customInspect : true;
      if (typeof customInspect !== "boolean" && customInspect !== "symbol") {
        throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");
      }
      if (has(opts, "indent") && opts.indent !== null && opts.indent !== "	" && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)) {
        throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
      }
      if (has(opts, "numericSeparator") && typeof opts.numericSeparator !== "boolean") {
        throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
      }
      var numericSeparator = opts.numericSeparator;
      if (typeof obj === "undefined") {
        return "undefined";
      }
      if (obj === null) {
        return "null";
      }
      if (typeof obj === "boolean") {
        return obj ? "true" : "false";
      }
      if (typeof obj === "string") {
        return inspectString(obj, opts);
      }
      if (typeof obj === "number") {
        if (obj === 0) {
          return Infinity / obj > 0 ? "0" : "-0";
        }
        var str = String(obj);
        return numericSeparator ? addNumericSeparator(obj, str) : str;
      }
      if (typeof obj === "bigint") {
        var bigIntStr = String(obj) + "n";
        return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
      }
      var maxDepth = typeof opts.depth === "undefined" ? 5 : opts.depth;
      if (typeof depth === "undefined") {
        depth = 0;
      }
      if (depth >= maxDepth && maxDepth > 0 && typeof obj === "object") {
        return isArray2(obj) ? "[Array]" : "[Object]";
      }
      var indent = getIndent(opts, depth);
      if (typeof seen === "undefined") {
        seen = [];
      } else if (indexOf(seen, obj) >= 0) {
        return "[Circular]";
      }
      function inspect2(value, from, noIndent) {
        if (from) {
          seen = $arrSlice.call(seen);
          seen.push(from);
        }
        if (noIndent) {
          var newOpts = {
            depth: opts.depth
          };
          if (has(opts, "quoteStyle")) {
            newOpts.quoteStyle = opts.quoteStyle;
          }
          return inspect_(value, newOpts, depth + 1, seen);
        }
        return inspect_(value, opts, depth + 1, seen);
      }
      if (typeof obj === "function" && !isRegExp(obj)) {
        var name = nameOf(obj);
        var keys = arrObjKeys(obj, inspect2);
        return "[Function" + (name ? ": " + name : " (anonymous)") + "]" + (keys.length > 0 ? " { " + $join.call(keys, ", ") + " }" : "");
      }
      if (isSymbol(obj)) {
        var symString = hasShammedSymbols ? $replace.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, "$1") : symToString.call(obj);
        return typeof obj === "object" && !hasShammedSymbols ? markBoxed(symString) : symString;
      }
      if (isElement(obj)) {
        var s = "<" + $toLowerCase.call(String(obj.nodeName));
        var attrs = obj.attributes || [];
        for (var i = 0; i < attrs.length; i++) {
          s += " " + attrs[i].name + "=" + wrapQuotes(quote(attrs[i].value), "double", opts);
        }
        s += ">";
        if (obj.childNodes && obj.childNodes.length) {
          s += "...";
        }
        s += "</" + $toLowerCase.call(String(obj.nodeName)) + ">";
        return s;
      }
      if (isArray2(obj)) {
        if (obj.length === 0) {
          return "[]";
        }
        var xs = arrObjKeys(obj, inspect2);
        if (indent && !singleLineValues(xs)) {
          return "[" + indentedJoin(xs, indent) + "]";
        }
        return "[ " + $join.call(xs, ", ") + " ]";
      }
      if (isError(obj)) {
        var parts = arrObjKeys(obj, inspect2);
        if (!("cause" in Error.prototype) && "cause" in obj && !isEnumerable.call(obj, "cause")) {
          return "{ [" + String(obj) + "] " + $join.call($concat.call("[cause]: " + inspect2(obj.cause), parts), ", ") + " }";
        }
        if (parts.length === 0) {
          return "[" + String(obj) + "]";
        }
        return "{ [" + String(obj) + "] " + $join.call(parts, ", ") + " }";
      }
      if (typeof obj === "object" && customInspect) {
        if (inspectSymbol && typeof obj[inspectSymbol] === "function" && utilInspect) {
          return utilInspect(obj, { depth: maxDepth - depth });
        } else if (customInspect !== "symbol" && typeof obj.inspect === "function") {
          return obj.inspect();
        }
      }
      if (isMap(obj)) {
        var mapParts = [];
        if (mapForEach) {
          mapForEach.call(obj, function(value, key) {
            mapParts.push(inspect2(key, obj, true) + " => " + inspect2(value, obj));
          });
        }
        return collectionOf("Map", mapSize.call(obj), mapParts, indent);
      }
      if (isSet(obj)) {
        var setParts = [];
        if (setForEach) {
          setForEach.call(obj, function(value) {
            setParts.push(inspect2(value, obj));
          });
        }
        return collectionOf("Set", setSize.call(obj), setParts, indent);
      }
      if (isWeakMap(obj)) {
        return weakCollectionOf("WeakMap");
      }
      if (isWeakSet(obj)) {
        return weakCollectionOf("WeakSet");
      }
      if (isWeakRef(obj)) {
        return weakCollectionOf("WeakRef");
      }
      if (isNumber(obj)) {
        return markBoxed(inspect2(Number(obj)));
      }
      if (isBigInt(obj)) {
        return markBoxed(inspect2(bigIntValueOf.call(obj)));
      }
      if (isBoolean(obj)) {
        return markBoxed(booleanValueOf.call(obj));
      }
      if (isString(obj)) {
        return markBoxed(inspect2(String(obj)));
      }
      if (typeof window !== "undefined" && obj === window) {
        return "{ [object Window] }";
      }
      if (typeof globalThis !== "undefined" && obj === globalThis || typeof global !== "undefined" && obj === global) {
        return "{ [object globalThis] }";
      }
      if (!isDate(obj) && !isRegExp(obj)) {
        var ys = arrObjKeys(obj, inspect2);
        var isPlainObject2 = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
        var protoTag = obj instanceof Object ? "" : "null prototype";
        var stringTag = !isPlainObject2 && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? "Object" : "";
        var constructorTag = isPlainObject2 || typeof obj.constructor !== "function" ? "" : obj.constructor.name ? obj.constructor.name + " " : "";
        var tag = constructorTag + (stringTag || protoTag ? "[" + $join.call($concat.call([], stringTag || [], protoTag || []), ": ") + "] " : "");
        if (ys.length === 0) {
          return tag + "{}";
        }
        if (indent) {
          return tag + "{" + indentedJoin(ys, indent) + "}";
        }
        return tag + "{ " + $join.call(ys, ", ") + " }";
      }
      return String(obj);
    };
    function wrapQuotes(s, defaultStyle, opts) {
      var style = opts.quoteStyle || defaultStyle;
      var quoteChar = quotes[style];
      return quoteChar + s + quoteChar;
    }
    function quote(s) {
      return $replace.call(String(s), /"/g, "&quot;");
    }
    function isArray2(obj) {
      return toStr(obj) === "[object Array]" && (!toStringTag || !(typeof obj === "object" && toStringTag in obj));
    }
    function isDate(obj) {
      return toStr(obj) === "[object Date]" && (!toStringTag || !(typeof obj === "object" && toStringTag in obj));
    }
    function isRegExp(obj) {
      return toStr(obj) === "[object RegExp]" && (!toStringTag || !(typeof obj === "object" && toStringTag in obj));
    }
    function isError(obj) {
      return toStr(obj) === "[object Error]" && (!toStringTag || !(typeof obj === "object" && toStringTag in obj));
    }
    function isString(obj) {
      return toStr(obj) === "[object String]" && (!toStringTag || !(typeof obj === "object" && toStringTag in obj));
    }
    function isNumber(obj) {
      return toStr(obj) === "[object Number]" && (!toStringTag || !(typeof obj === "object" && toStringTag in obj));
    }
    function isBoolean(obj) {
      return toStr(obj) === "[object Boolean]" && (!toStringTag || !(typeof obj === "object" && toStringTag in obj));
    }
    function isSymbol(obj) {
      if (hasShammedSymbols) {
        return obj && typeof obj === "object" && obj instanceof Symbol;
      }
      if (typeof obj === "symbol") {
        return true;
      }
      if (!obj || typeof obj !== "object" || !symToString) {
        return false;
      }
      try {
        symToString.call(obj);
        return true;
      } catch (e) {
      }
      return false;
    }
    function isBigInt(obj) {
      if (!obj || typeof obj !== "object" || !bigIntValueOf) {
        return false;
      }
      try {
        bigIntValueOf.call(obj);
        return true;
      } catch (e) {
      }
      return false;
    }
    var hasOwn = Object.prototype.hasOwnProperty || function(key) {
      return key in this;
    };
    function has(obj, key) {
      return hasOwn.call(obj, key);
    }
    function toStr(obj) {
      return objectToString.call(obj);
    }
    function nameOf(f) {
      if (f.name) {
        return f.name;
      }
      var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
      if (m) {
        return m[1];
      }
      return null;
    }
    function indexOf(xs, x) {
      if (xs.indexOf) {
        return xs.indexOf(x);
      }
      for (var i = 0, l = xs.length; i < l; i++) {
        if (xs[i] === x) {
          return i;
        }
      }
      return -1;
    }
    function isMap(x) {
      if (!mapSize || !x || typeof x !== "object") {
        return false;
      }
      try {
        mapSize.call(x);
        try {
          setSize.call(x);
        } catch (s) {
          return true;
        }
        return x instanceof Map;
      } catch (e) {
      }
      return false;
    }
    function isWeakMap(x) {
      if (!weakMapHas || !x || typeof x !== "object") {
        return false;
      }
      try {
        weakMapHas.call(x, weakMapHas);
        try {
          weakSetHas.call(x, weakSetHas);
        } catch (s) {
          return true;
        }
        return x instanceof WeakMap;
      } catch (e) {
      }
      return false;
    }
    function isWeakRef(x) {
      if (!weakRefDeref || !x || typeof x !== "object") {
        return false;
      }
      try {
        weakRefDeref.call(x);
        return true;
      } catch (e) {
      }
      return false;
    }
    function isSet(x) {
      if (!setSize || !x || typeof x !== "object") {
        return false;
      }
      try {
        setSize.call(x);
        try {
          mapSize.call(x);
        } catch (m) {
          return true;
        }
        return x instanceof Set;
      } catch (e) {
      }
      return false;
    }
    function isWeakSet(x) {
      if (!weakSetHas || !x || typeof x !== "object") {
        return false;
      }
      try {
        weakSetHas.call(x, weakSetHas);
        try {
          weakMapHas.call(x, weakMapHas);
        } catch (s) {
          return true;
        }
        return x instanceof WeakSet;
      } catch (e) {
      }
      return false;
    }
    function isElement(x) {
      if (!x || typeof x !== "object") {
        return false;
      }
      if (typeof HTMLElement !== "undefined" && x instanceof HTMLElement) {
        return true;
      }
      return typeof x.nodeName === "string" && typeof x.getAttribute === "function";
    }
    function inspectString(str, opts) {
      if (str.length > opts.maxStringLength) {
        var remaining = str.length - opts.maxStringLength;
        var trailer = "... " + remaining + " more character" + (remaining > 1 ? "s" : "");
        return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
      }
      var quoteRE = quoteREs[opts.quoteStyle || "single"];
      quoteRE.lastIndex = 0;
      var s = $replace.call($replace.call(str, quoteRE, "\\$1"), /[\x00-\x1f]/g, lowbyte);
      return wrapQuotes(s, "single", opts);
    }
    function lowbyte(c) {
      var n = c.charCodeAt(0);
      var x = {
        8: "b",
        9: "t",
        10: "n",
        12: "f",
        13: "r"
      }[n];
      if (x) {
        return "\\" + x;
      }
      return "\\x" + (n < 16 ? "0" : "") + $toUpperCase.call(n.toString(16));
    }
    function markBoxed(str) {
      return "Object(" + str + ")";
    }
    function weakCollectionOf(type) {
      return type + " { ? }";
    }
    function collectionOf(type, size, entries, indent) {
      var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ", ");
      return type + " (" + size + ") {" + joinedEntries + "}";
    }
    function singleLineValues(xs) {
      for (var i = 0; i < xs.length; i++) {
        if (indexOf(xs[i], "\n") >= 0) {
          return false;
        }
      }
      return true;
    }
    function getIndent(opts, depth) {
      var baseIndent;
      if (opts.indent === "	") {
        baseIndent = "	";
      } else if (typeof opts.indent === "number" && opts.indent > 0) {
        baseIndent = $join.call(Array(opts.indent + 1), " ");
      } else {
        return null;
      }
      return {
        base: baseIndent,
        prev: $join.call(Array(depth + 1), baseIndent)
      };
    }
    function indentedJoin(xs, indent) {
      if (xs.length === 0) {
        return "";
      }
      var lineJoiner = "\n" + indent.prev + indent.base;
      return lineJoiner + $join.call(xs, "," + lineJoiner) + "\n" + indent.prev;
    }
    function arrObjKeys(obj, inspect2) {
      var isArr = isArray2(obj);
      var xs = [];
      if (isArr) {
        xs.length = obj.length;
        for (var i = 0; i < obj.length; i++) {
          xs[i] = has(obj, i) ? inspect2(obj[i], obj) : "";
        }
      }
      var syms = typeof gOPS === "function" ? gOPS(obj) : [];
      var symMap;
      if (hasShammedSymbols) {
        symMap = {};
        for (var k = 0; k < syms.length; k++) {
          symMap["$" + syms[k]] = syms[k];
        }
      }
      for (var key in obj) {
        if (!has(obj, key)) {
          continue;
        }
        if (isArr && String(Number(key)) === key && key < obj.length) {
          continue;
        }
        if (hasShammedSymbols && symMap["$" + key] instanceof Symbol) {
          continue;
        } else if ($test.call(/[^\w$]/, key)) {
          xs.push(inspect2(key, obj) + ": " + inspect2(obj[key], obj));
        } else {
          xs.push(key + ": " + inspect2(obj[key], obj));
        }
      }
      if (typeof gOPS === "function") {
        for (var j = 0; j < syms.length; j++) {
          if (isEnumerable.call(obj, syms[j])) {
            xs.push("[" + inspect2(syms[j]) + "]: " + inspect2(obj[syms[j]], obj));
          }
        }
      }
      return xs;
    }
  }
});

// node_modules/@satorijs/core/node_modules/path-to-regexp/dist/index.js
var require_dist = __commonJS({
  "node_modules/@satorijs/core/node_modules/path-to-regexp/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TokenData = void 0;
    exports.parse = parse;
    exports.compile = compile;
    exports.match = match;
    exports.pathToRegexp = pathToRegexp2;
    exports.stringify = stringify;
    var DEFAULT_DELIMITER = "/";
    var NOOP_VALUE = (value) => value;
    var ID_START = /^[$_\p{ID_Start}]$/u;
    var ID_CONTINUE = /^[$\u200c\u200d\p{ID_Continue}]$/u;
    var DEBUG_URL = "https://git.new/pathToRegexpError";
    var SIMPLE_TOKENS = {
      // Groups.
      "{": "{",
      "}": "}",
      // Reserved.
      "(": "(",
      ")": ")",
      "[": "[",
      "]": "]",
      "+": "+",
      "?": "?",
      "!": "!"
    };
    function escapeText(str) {
      return str.replace(/[{}()\[\]+?!:*]/g, "\\$&");
    }
    function escape(str) {
      return str.replace(/[.+*?^${}()[\]|/\\]/g, "\\$&");
    }
    function* lexer(str) {
      const chars = [...str];
      let i = 0;
      function name() {
        let value = "";
        if (ID_START.test(chars[++i])) {
          value += chars[i];
          while (ID_CONTINUE.test(chars[++i])) {
            value += chars[i];
          }
        } else if (chars[i] === '"') {
          let pos = i;
          while (i < chars.length) {
            if (chars[++i] === '"') {
              i++;
              pos = 0;
              break;
            }
            if (chars[i] === "\\") {
              value += chars[++i];
            } else {
              value += chars[i];
            }
          }
          if (pos) {
            throw new TypeError(`Unterminated quote at ${pos}: ${DEBUG_URL}`);
          }
        }
        if (!value) {
          throw new TypeError(`Missing parameter name at ${i}: ${DEBUG_URL}`);
        }
        return value;
      }
      while (i < chars.length) {
        const value = chars[i];
        const type = SIMPLE_TOKENS[value];
        if (type) {
          yield { type, index: i++, value };
        } else if (value === "\\") {
          yield { type: "ESCAPED", index: i++, value: chars[i++] };
        } else if (value === ":") {
          const value2 = name();
          yield { type: "PARAM", index: i, value: value2 };
        } else if (value === "*") {
          const value2 = name();
          yield { type: "WILDCARD", index: i, value: value2 };
        } else {
          yield { type: "CHAR", index: i, value: chars[i++] };
        }
      }
      return { type: "END", index: i, value: "" };
    }
    var Iter = class {
      constructor(tokens) {
        this.tokens = tokens;
      }
      peek() {
        if (!this._peek) {
          const next = this.tokens.next();
          this._peek = next.value;
        }
        return this._peek;
      }
      tryConsume(type) {
        const token = this.peek();
        if (token.type !== type)
          return;
        this._peek = void 0;
        return token.value;
      }
      consume(type) {
        const value = this.tryConsume(type);
        if (value !== void 0)
          return value;
        const { type: nextType, index } = this.peek();
        throw new TypeError(`Unexpected ${nextType} at ${index}, expected ${type}: ${DEBUG_URL}`);
      }
      text() {
        let result = "";
        let value;
        while (value = this.tryConsume("CHAR") || this.tryConsume("ESCAPED")) {
          result += value;
        }
        return result;
      }
    };
    var TokenData = class {
      constructor(tokens) {
        this.tokens = tokens;
      }
    };
    exports.TokenData = TokenData;
    function parse(str, options = {}) {
      const { encodePath = NOOP_VALUE } = options;
      const it = new Iter(lexer(str));
      function consume(endType) {
        const tokens2 = [];
        while (true) {
          const path2 = it.text();
          if (path2)
            tokens2.push({ type: "text", value: encodePath(path2) });
          const param = it.tryConsume("PARAM");
          if (param) {
            tokens2.push({
              type: "param",
              name: param
            });
            continue;
          }
          const wildcard = it.tryConsume("WILDCARD");
          if (wildcard) {
            tokens2.push({
              type: "wildcard",
              name: wildcard
            });
            continue;
          }
          const open = it.tryConsume("{");
          if (open) {
            tokens2.push({
              type: "group",
              tokens: consume("}")
            });
            continue;
          }
          it.consume(endType);
          return tokens2;
        }
      }
      const tokens = consume("END");
      return new TokenData(tokens);
    }
    function compile(path2, options = {}) {
      const { encode = encodeURIComponent, delimiter = DEFAULT_DELIMITER } = options;
      const data = path2 instanceof TokenData ? path2 : parse(path2, options);
      const fn = tokensToFunction(data.tokens, delimiter, encode);
      return function path3(data2 = {}) {
        const [path4, ...missing] = fn(data2);
        if (missing.length) {
          throw new TypeError(`Missing parameters: ${missing.join(", ")}`);
        }
        return path4;
      };
    }
    function tokensToFunction(tokens, delimiter, encode) {
      const encoders = tokens.map((token) => tokenToFunction(token, delimiter, encode));
      return (data) => {
        const result = [""];
        for (const encoder of encoders) {
          const [value, ...extras] = encoder(data);
          result[0] += value;
          result.push(...extras);
        }
        return result;
      };
    }
    function tokenToFunction(token, delimiter, encode) {
      if (token.type === "text")
        return () => [token.value];
      if (token.type === "group") {
        const fn = tokensToFunction(token.tokens, delimiter, encode);
        return (data) => {
          const [value, ...missing] = fn(data);
          if (!missing.length)
            return [value];
          return [""];
        };
      }
      const encodeValue = encode || NOOP_VALUE;
      if (token.type === "wildcard" && encode !== false) {
        return (data) => {
          const value = data[token.name];
          if (value == null)
            return ["", token.name];
          if (!Array.isArray(value) || value.length === 0) {
            throw new TypeError(`Expected "${token.name}" to be a non-empty array`);
          }
          return [
            value.map((value2, index) => {
              if (typeof value2 !== "string") {
                throw new TypeError(`Expected "${token.name}/${index}" to be a string`);
              }
              return encodeValue(value2);
            }).join(delimiter)
          ];
        };
      }
      return (data) => {
        const value = data[token.name];
        if (value == null)
          return ["", token.name];
        if (typeof value !== "string") {
          throw new TypeError(`Expected "${token.name}" to be a string`);
        }
        return [encodeValue(value)];
      };
    }
    function match(path2, options = {}) {
      const { decode = decodeURIComponent, delimiter = DEFAULT_DELIMITER } = options;
      const { regexp, keys } = pathToRegexp2(path2, options);
      const decoders = keys.map((key) => {
        if (decode === false)
          return NOOP_VALUE;
        if (key.type === "param")
          return decode;
        return (value) => value.split(delimiter).map(decode);
      });
      return function match2(input) {
        const m = regexp.exec(input);
        if (!m)
          return false;
        const path3 = m[0];
        const params = /* @__PURE__ */ Object.create(null);
        for (let i = 1; i < m.length; i++) {
          if (m[i] === void 0)
            continue;
          const key = keys[i - 1];
          const decoder = decoders[i - 1];
          params[key.name] = decoder(m[i]);
        }
        return { path: path3, params };
      };
    }
    function pathToRegexp2(path2, options = {}) {
      const { delimiter = DEFAULT_DELIMITER, end = true, sensitive = false, trailing = true } = options;
      const keys = [];
      const sources = [];
      const flags = sensitive ? "" : "i";
      const paths = Array.isArray(path2) ? path2 : [path2];
      const items = paths.map((path3) => path3 instanceof TokenData ? path3 : parse(path3, options));
      for (const { tokens } of items) {
        for (const seq of flatten2(tokens, 0, [])) {
          const regexp2 = sequenceToRegExp(seq, delimiter, keys);
          sources.push(regexp2);
        }
      }
      let pattern = `^(?:${sources.join("|")})`;
      if (trailing)
        pattern += `(?:${escape(delimiter)}$)?`;
      pattern += end ? "$" : `(?=${escape(delimiter)}|$)`;
      const regexp = new RegExp(pattern, flags);
      return { regexp, keys };
    }
    function* flatten2(tokens, index, init) {
      if (index === tokens.length) {
        return yield init;
      }
      const token = tokens[index];
      if (token.type === "group") {
        const fork = init.slice();
        for (const seq of flatten2(token.tokens, 0, fork)) {
          yield* flatten2(tokens, index + 1, seq);
        }
      } else {
        init.push(token);
      }
      yield* flatten2(tokens, index + 1, init);
    }
    function sequenceToRegExp(tokens, delimiter, keys) {
      let result = "";
      let backtrack = "";
      let isSafeSegmentParam = true;
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === "text") {
          result += escape(token.value);
          backtrack += token.value;
          isSafeSegmentParam || (isSafeSegmentParam = token.value.includes(delimiter));
          continue;
        }
        if (token.type === "param" || token.type === "wildcard") {
          if (!isSafeSegmentParam && !backtrack) {
            throw new TypeError(`Missing text after "${token.name}": ${DEBUG_URL}`);
          }
          if (token.type === "param") {
            result += `(${negate(delimiter, isSafeSegmentParam ? "" : backtrack)}+)`;
          } else {
            result += `([\\s\\S]+)`;
          }
          keys.push(token);
          backtrack = "";
          isSafeSegmentParam = false;
          continue;
        }
      }
      return result;
    }
    function negate(delimiter, backtrack) {
      if (backtrack.length < 2) {
        if (delimiter.length < 2)
          return `[^${escape(delimiter + backtrack)}]`;
        return `(?:(?!${escape(delimiter)})[^${escape(backtrack)}])`;
      }
      if (delimiter.length < 2) {
        return `(?:(?!${escape(backtrack)})[^${escape(delimiter)}])`;
      }
      return `(?:(?!${escape(backtrack)}|${escape(delimiter)})[\\s\\S])`;
    }
    function stringify(data) {
      return data.tokens.map(function stringifyToken(token, index, tokens) {
        if (token.type === "text")
          return escapeText(token.value);
        if (token.type === "group") {
          return `{${token.tokens.map(stringifyToken).join("")}}`;
        }
        const isSafe = isNameSafe(token.name) && isNextNameSafe(tokens[index + 1]);
        const key = isSafe ? token.name : JSON.stringify(token.name);
        if (token.type === "param")
          return `:${key}`;
        if (token.type === "wildcard")
          return `*${key}`;
        throw new TypeError(`Unexpected token: ${token}`);
      }).join("");
    }
    function isNameSafe(name) {
      const [first, ...rest] = name;
      if (!ID_START.test(first))
        return false;
      return rest.every((char) => ID_CONTINUE.test(char));
    }
    function isNextNameSafe(token) {
      if ((token === null || token === void 0 ? void 0 : token.type) !== "text")
        return true;
      return !ID_CONTINUE.test(token.value[0]);
    }
  }
});

// node_modules/mime-db/db.json
var require_db = __commonJS({
  "node_modules/mime-db/db.json"(exports, module) {
    module.exports = {
      "application/1d-interleaved-parityfec": {
        source: "iana"
      },
      "application/3gpdash-qoe-report+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/3gpp-ims+xml": {
        source: "iana",
        compressible: true
      },
      "application/3gpphal+json": {
        source: "iana",
        compressible: true
      },
      "application/3gpphalforms+json": {
        source: "iana",
        compressible: true
      },
      "application/a2l": {
        source: "iana"
      },
      "application/ace+cbor": {
        source: "iana"
      },
      "application/ace+json": {
        source: "iana",
        compressible: true
      },
      "application/ace-groupcomm+cbor": {
        source: "iana"
      },
      "application/activemessage": {
        source: "iana"
      },
      "application/activity+json": {
        source: "iana",
        compressible: true
      },
      "application/aif+cbor": {
        source: "iana"
      },
      "application/aif+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-cdni+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-cdnifilter+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-costmap+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-costmapfilter+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-directory+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-endpointcost+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-endpointcostparams+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-endpointprop+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-endpointpropparams+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-error+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-networkmap+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-networkmapfilter+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-propmap+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-propmapparams+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-tips+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-tipsparams+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-updatestreamcontrol+json": {
        source: "iana",
        compressible: true
      },
      "application/alto-updatestreamparams+json": {
        source: "iana",
        compressible: true
      },
      "application/aml": {
        source: "iana"
      },
      "application/andrew-inset": {
        source: "iana",
        extensions: ["ez"]
      },
      "application/appinstaller": {
        compressible: false,
        extensions: ["appinstaller"]
      },
      "application/applefile": {
        source: "iana"
      },
      "application/applixware": {
        source: "apache",
        extensions: ["aw"]
      },
      "application/appx": {
        compressible: false,
        extensions: ["appx"]
      },
      "application/appxbundle": {
        compressible: false,
        extensions: ["appxbundle"]
      },
      "application/at+jwt": {
        source: "iana"
      },
      "application/atf": {
        source: "iana"
      },
      "application/atfx": {
        source: "iana"
      },
      "application/atom+xml": {
        source: "iana",
        compressible: true,
        extensions: ["atom"]
      },
      "application/atomcat+xml": {
        source: "iana",
        compressible: true,
        extensions: ["atomcat"]
      },
      "application/atomdeleted+xml": {
        source: "iana",
        compressible: true,
        extensions: ["atomdeleted"]
      },
      "application/atomicmail": {
        source: "iana"
      },
      "application/atomsvc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["atomsvc"]
      },
      "application/atsc-dwd+xml": {
        source: "iana",
        compressible: true,
        extensions: ["dwd"]
      },
      "application/atsc-dynamic-event-message": {
        source: "iana"
      },
      "application/atsc-held+xml": {
        source: "iana",
        compressible: true,
        extensions: ["held"]
      },
      "application/atsc-rdt+json": {
        source: "iana",
        compressible: true
      },
      "application/atsc-rsat+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rsat"]
      },
      "application/atxml": {
        source: "iana"
      },
      "application/auth-policy+xml": {
        source: "iana",
        compressible: true
      },
      "application/automationml-aml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["aml"]
      },
      "application/automationml-amlx+zip": {
        source: "iana",
        compressible: false,
        extensions: ["amlx"]
      },
      "application/bacnet-xdd+zip": {
        source: "iana",
        compressible: false
      },
      "application/batch-smtp": {
        source: "iana"
      },
      "application/bdoc": {
        compressible: false,
        extensions: ["bdoc"]
      },
      "application/beep+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/bufr": {
        source: "iana"
      },
      "application/c2pa": {
        source: "iana"
      },
      "application/calendar+json": {
        source: "iana",
        compressible: true
      },
      "application/calendar+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xcs"]
      },
      "application/call-completion": {
        source: "iana"
      },
      "application/cals-1840": {
        source: "iana"
      },
      "application/captive+json": {
        source: "iana",
        compressible: true
      },
      "application/cbor": {
        source: "iana"
      },
      "application/cbor-seq": {
        source: "iana"
      },
      "application/cccex": {
        source: "iana"
      },
      "application/ccmp+xml": {
        source: "iana",
        compressible: true
      },
      "application/ccxml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ccxml"]
      },
      "application/cda+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/cdfx+xml": {
        source: "iana",
        compressible: true,
        extensions: ["cdfx"]
      },
      "application/cdmi-capability": {
        source: "iana",
        extensions: ["cdmia"]
      },
      "application/cdmi-container": {
        source: "iana",
        extensions: ["cdmic"]
      },
      "application/cdmi-domain": {
        source: "iana",
        extensions: ["cdmid"]
      },
      "application/cdmi-object": {
        source: "iana",
        extensions: ["cdmio"]
      },
      "application/cdmi-queue": {
        source: "iana",
        extensions: ["cdmiq"]
      },
      "application/cdni": {
        source: "iana"
      },
      "application/cea": {
        source: "iana"
      },
      "application/cea-2018+xml": {
        source: "iana",
        compressible: true
      },
      "application/cellml+xml": {
        source: "iana",
        compressible: true
      },
      "application/cfw": {
        source: "iana"
      },
      "application/cid-edhoc+cbor-seq": {
        source: "iana"
      },
      "application/city+json": {
        source: "iana",
        compressible: true
      },
      "application/clr": {
        source: "iana"
      },
      "application/clue+xml": {
        source: "iana",
        compressible: true
      },
      "application/clue_info+xml": {
        source: "iana",
        compressible: true
      },
      "application/cms": {
        source: "iana"
      },
      "application/cnrp+xml": {
        source: "iana",
        compressible: true
      },
      "application/coap-group+json": {
        source: "iana",
        compressible: true
      },
      "application/coap-payload": {
        source: "iana"
      },
      "application/commonground": {
        source: "iana"
      },
      "application/concise-problem-details+cbor": {
        source: "iana"
      },
      "application/conference-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/cose": {
        source: "iana"
      },
      "application/cose-key": {
        source: "iana"
      },
      "application/cose-key-set": {
        source: "iana"
      },
      "application/cose-x509": {
        source: "iana"
      },
      "application/cpl+xml": {
        source: "iana",
        compressible: true,
        extensions: ["cpl"]
      },
      "application/csrattrs": {
        source: "iana"
      },
      "application/csta+xml": {
        source: "iana",
        compressible: true
      },
      "application/cstadata+xml": {
        source: "iana",
        compressible: true
      },
      "application/csvm+json": {
        source: "iana",
        compressible: true
      },
      "application/cu-seeme": {
        source: "apache",
        extensions: ["cu"]
      },
      "application/cwl": {
        source: "iana",
        extensions: ["cwl"]
      },
      "application/cwl+json": {
        source: "iana",
        compressible: true
      },
      "application/cwl+yaml": {
        source: "iana"
      },
      "application/cwt": {
        source: "iana"
      },
      "application/cybercash": {
        source: "iana"
      },
      "application/dart": {
        compressible: true
      },
      "application/dash+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mpd"]
      },
      "application/dash-patch+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mpp"]
      },
      "application/dashdelta": {
        source: "iana"
      },
      "application/davmount+xml": {
        source: "iana",
        compressible: true,
        extensions: ["davmount"]
      },
      "application/dca-rft": {
        source: "iana"
      },
      "application/dcd": {
        source: "iana"
      },
      "application/dec-dx": {
        source: "iana"
      },
      "application/dialog-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/dicom": {
        source: "iana"
      },
      "application/dicom+json": {
        source: "iana",
        compressible: true
      },
      "application/dicom+xml": {
        source: "iana",
        compressible: true
      },
      "application/dii": {
        source: "iana"
      },
      "application/dit": {
        source: "iana"
      },
      "application/dns": {
        source: "iana"
      },
      "application/dns+json": {
        source: "iana",
        compressible: true
      },
      "application/dns-message": {
        source: "iana"
      },
      "application/docbook+xml": {
        source: "apache",
        compressible: true,
        extensions: ["dbk"]
      },
      "application/dots+cbor": {
        source: "iana"
      },
      "application/dpop+jwt": {
        source: "iana"
      },
      "application/dskpp+xml": {
        source: "iana",
        compressible: true
      },
      "application/dssc+der": {
        source: "iana",
        extensions: ["dssc"]
      },
      "application/dssc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xdssc"]
      },
      "application/dvcs": {
        source: "iana"
      },
      "application/ecmascript": {
        source: "apache",
        compressible: true,
        extensions: ["ecma"]
      },
      "application/edhoc+cbor-seq": {
        source: "iana"
      },
      "application/edi-consent": {
        source: "iana"
      },
      "application/edi-x12": {
        source: "iana",
        compressible: false
      },
      "application/edifact": {
        source: "iana",
        compressible: false
      },
      "application/efi": {
        source: "iana"
      },
      "application/elm+json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/elm+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.cap+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/emergencycalldata.comment+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.control+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.deviceinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.ecall.msd": {
        source: "iana"
      },
      "application/emergencycalldata.legacyesn+json": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.providerinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.serviceinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.subscriberinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/emergencycalldata.veds+xml": {
        source: "iana",
        compressible: true
      },
      "application/emma+xml": {
        source: "iana",
        compressible: true,
        extensions: ["emma"]
      },
      "application/emotionml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["emotionml"]
      },
      "application/encaprtp": {
        source: "iana"
      },
      "application/epp+xml": {
        source: "iana",
        compressible: true
      },
      "application/epub+zip": {
        source: "iana",
        compressible: false,
        extensions: ["epub"]
      },
      "application/eshop": {
        source: "iana"
      },
      "application/exi": {
        source: "iana",
        extensions: ["exi"]
      },
      "application/expect-ct-report+json": {
        source: "iana",
        compressible: true
      },
      "application/express": {
        source: "iana",
        extensions: ["exp"]
      },
      "application/fastinfoset": {
        source: "iana"
      },
      "application/fastsoap": {
        source: "iana"
      },
      "application/fdf": {
        source: "iana",
        extensions: ["fdf"]
      },
      "application/fdt+xml": {
        source: "iana",
        compressible: true,
        extensions: ["fdt"]
      },
      "application/fhir+json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/fhir+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/fido.trusted-apps+json": {
        compressible: true
      },
      "application/fits": {
        source: "iana"
      },
      "application/flexfec": {
        source: "iana"
      },
      "application/font-sfnt": {
        source: "iana"
      },
      "application/font-tdpfr": {
        source: "iana",
        extensions: ["pfr"]
      },
      "application/font-woff": {
        source: "iana",
        compressible: false
      },
      "application/framework-attributes+xml": {
        source: "iana",
        compressible: true
      },
      "application/geo+json": {
        source: "iana",
        compressible: true,
        extensions: ["geojson"]
      },
      "application/geo+json-seq": {
        source: "iana"
      },
      "application/geopackage+sqlite3": {
        source: "iana"
      },
      "application/geoxacml+json": {
        source: "iana",
        compressible: true
      },
      "application/geoxacml+xml": {
        source: "iana",
        compressible: true
      },
      "application/gltf-buffer": {
        source: "iana"
      },
      "application/gml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["gml"]
      },
      "application/gnap-binding-jws": {
        source: "iana"
      },
      "application/gnap-binding-jwsd": {
        source: "iana"
      },
      "application/gnap-binding-rotation-jws": {
        source: "iana"
      },
      "application/gnap-binding-rotation-jwsd": {
        source: "iana"
      },
      "application/gpx+xml": {
        source: "apache",
        compressible: true,
        extensions: ["gpx"]
      },
      "application/grib": {
        source: "iana"
      },
      "application/gxf": {
        source: "apache",
        extensions: ["gxf"]
      },
      "application/gzip": {
        source: "iana",
        compressible: false,
        extensions: ["gz"]
      },
      "application/h224": {
        source: "iana"
      },
      "application/held+xml": {
        source: "iana",
        compressible: true
      },
      "application/hjson": {
        extensions: ["hjson"]
      },
      "application/hl7v2+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/http": {
        source: "iana"
      },
      "application/hyperstudio": {
        source: "iana",
        extensions: ["stk"]
      },
      "application/ibe-key-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/ibe-pkg-reply+xml": {
        source: "iana",
        compressible: true
      },
      "application/ibe-pp-data": {
        source: "iana"
      },
      "application/iges": {
        source: "iana"
      },
      "application/im-iscomposing+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/index": {
        source: "iana"
      },
      "application/index.cmd": {
        source: "iana"
      },
      "application/index.obj": {
        source: "iana"
      },
      "application/index.response": {
        source: "iana"
      },
      "application/index.vnd": {
        source: "iana"
      },
      "application/inkml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ink", "inkml"]
      },
      "application/iotp": {
        source: "iana"
      },
      "application/ipfix": {
        source: "iana",
        extensions: ["ipfix"]
      },
      "application/ipp": {
        source: "iana"
      },
      "application/isup": {
        source: "iana"
      },
      "application/its+xml": {
        source: "iana",
        compressible: true,
        extensions: ["its"]
      },
      "application/java-archive": {
        source: "iana",
        compressible: false,
        extensions: ["jar", "war", "ear"]
      },
      "application/java-serialized-object": {
        source: "apache",
        compressible: false,
        extensions: ["ser"]
      },
      "application/java-vm": {
        source: "apache",
        compressible: false,
        extensions: ["class"]
      },
      "application/javascript": {
        source: "apache",
        charset: "UTF-8",
        compressible: true,
        extensions: ["js"]
      },
      "application/jf2feed+json": {
        source: "iana",
        compressible: true
      },
      "application/jose": {
        source: "iana"
      },
      "application/jose+json": {
        source: "iana",
        compressible: true
      },
      "application/jrd+json": {
        source: "iana",
        compressible: true
      },
      "application/jscalendar+json": {
        source: "iana",
        compressible: true
      },
      "application/jscontact+json": {
        source: "iana",
        compressible: true
      },
      "application/json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["json", "map"]
      },
      "application/json-patch+json": {
        source: "iana",
        compressible: true
      },
      "application/json-seq": {
        source: "iana"
      },
      "application/json5": {
        extensions: ["json5"]
      },
      "application/jsonml+json": {
        source: "apache",
        compressible: true,
        extensions: ["jsonml"]
      },
      "application/jsonpath": {
        source: "iana"
      },
      "application/jwk+json": {
        source: "iana",
        compressible: true
      },
      "application/jwk-set+json": {
        source: "iana",
        compressible: true
      },
      "application/jwt": {
        source: "iana"
      },
      "application/kpml-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/kpml-response+xml": {
        source: "iana",
        compressible: true
      },
      "application/ld+json": {
        source: "iana",
        compressible: true,
        extensions: ["jsonld"]
      },
      "application/lgr+xml": {
        source: "iana",
        compressible: true,
        extensions: ["lgr"]
      },
      "application/link-format": {
        source: "iana"
      },
      "application/linkset": {
        source: "iana"
      },
      "application/linkset+json": {
        source: "iana",
        compressible: true
      },
      "application/load-control+xml": {
        source: "iana",
        compressible: true
      },
      "application/logout+jwt": {
        source: "iana"
      },
      "application/lost+xml": {
        source: "iana",
        compressible: true,
        extensions: ["lostxml"]
      },
      "application/lostsync+xml": {
        source: "iana",
        compressible: true
      },
      "application/lpf+zip": {
        source: "iana",
        compressible: false
      },
      "application/lxf": {
        source: "iana"
      },
      "application/mac-binhex40": {
        source: "iana",
        extensions: ["hqx"]
      },
      "application/mac-compactpro": {
        source: "apache",
        extensions: ["cpt"]
      },
      "application/macwriteii": {
        source: "iana"
      },
      "application/mads+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mads"]
      },
      "application/manifest+json": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["webmanifest"]
      },
      "application/marc": {
        source: "iana",
        extensions: ["mrc"]
      },
      "application/marcxml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mrcx"]
      },
      "application/mathematica": {
        source: "iana",
        extensions: ["ma", "nb", "mb"]
      },
      "application/mathml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mathml"]
      },
      "application/mathml-content+xml": {
        source: "iana",
        compressible: true
      },
      "application/mathml-presentation+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-associated-procedure-description+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-deregister+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-envelope+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-msk+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-msk-response+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-protection-description+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-reception-report+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-register+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-register-response+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-schedule+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbms-user-service-description+xml": {
        source: "iana",
        compressible: true
      },
      "application/mbox": {
        source: "iana",
        extensions: ["mbox"]
      },
      "application/media-policy-dataset+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mpf"]
      },
      "application/media_control+xml": {
        source: "iana",
        compressible: true
      },
      "application/mediaservercontrol+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mscml"]
      },
      "application/merge-patch+json": {
        source: "iana",
        compressible: true
      },
      "application/metalink+xml": {
        source: "apache",
        compressible: true,
        extensions: ["metalink"]
      },
      "application/metalink4+xml": {
        source: "iana",
        compressible: true,
        extensions: ["meta4"]
      },
      "application/mets+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mets"]
      },
      "application/mf4": {
        source: "iana"
      },
      "application/mikey": {
        source: "iana"
      },
      "application/mipc": {
        source: "iana"
      },
      "application/missing-blocks+cbor-seq": {
        source: "iana"
      },
      "application/mmt-aei+xml": {
        source: "iana",
        compressible: true,
        extensions: ["maei"]
      },
      "application/mmt-usd+xml": {
        source: "iana",
        compressible: true,
        extensions: ["musd"]
      },
      "application/mods+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mods"]
      },
      "application/moss-keys": {
        source: "iana"
      },
      "application/moss-signature": {
        source: "iana"
      },
      "application/mosskey-data": {
        source: "iana"
      },
      "application/mosskey-request": {
        source: "iana"
      },
      "application/mp21": {
        source: "iana",
        extensions: ["m21", "mp21"]
      },
      "application/mp4": {
        source: "iana",
        extensions: ["mp4", "mpg4", "mp4s", "m4p"]
      },
      "application/mpeg4-generic": {
        source: "iana"
      },
      "application/mpeg4-iod": {
        source: "iana"
      },
      "application/mpeg4-iod-xmt": {
        source: "iana"
      },
      "application/mrb-consumer+xml": {
        source: "iana",
        compressible: true
      },
      "application/mrb-publish+xml": {
        source: "iana",
        compressible: true
      },
      "application/msc-ivr+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/msc-mixer+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/msix": {
        compressible: false,
        extensions: ["msix"]
      },
      "application/msixbundle": {
        compressible: false,
        extensions: ["msixbundle"]
      },
      "application/msword": {
        source: "iana",
        compressible: false,
        extensions: ["doc", "dot"]
      },
      "application/mud+json": {
        source: "iana",
        compressible: true
      },
      "application/multipart-core": {
        source: "iana"
      },
      "application/mxf": {
        source: "iana",
        extensions: ["mxf"]
      },
      "application/n-quads": {
        source: "iana",
        extensions: ["nq"]
      },
      "application/n-triples": {
        source: "iana",
        extensions: ["nt"]
      },
      "application/nasdata": {
        source: "iana"
      },
      "application/news-checkgroups": {
        source: "iana",
        charset: "US-ASCII"
      },
      "application/news-groupinfo": {
        source: "iana",
        charset: "US-ASCII"
      },
      "application/news-transmission": {
        source: "iana"
      },
      "application/nlsml+xml": {
        source: "iana",
        compressible: true
      },
      "application/node": {
        source: "iana",
        extensions: ["cjs"]
      },
      "application/nss": {
        source: "iana"
      },
      "application/oauth-authz-req+jwt": {
        source: "iana"
      },
      "application/oblivious-dns-message": {
        source: "iana"
      },
      "application/ocsp-request": {
        source: "iana"
      },
      "application/ocsp-response": {
        source: "iana"
      },
      "application/octet-stream": {
        source: "iana",
        compressible: false,
        extensions: ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"]
      },
      "application/oda": {
        source: "iana",
        extensions: ["oda"]
      },
      "application/odm+xml": {
        source: "iana",
        compressible: true
      },
      "application/odx": {
        source: "iana"
      },
      "application/oebps-package+xml": {
        source: "iana",
        compressible: true,
        extensions: ["opf"]
      },
      "application/ogg": {
        source: "iana",
        compressible: false,
        extensions: ["ogx"]
      },
      "application/ohttp-keys": {
        source: "iana"
      },
      "application/omdoc+xml": {
        source: "apache",
        compressible: true,
        extensions: ["omdoc"]
      },
      "application/onenote": {
        source: "apache",
        extensions: ["onetoc", "onetoc2", "onetmp", "onepkg"]
      },
      "application/opc-nodeset+xml": {
        source: "iana",
        compressible: true
      },
      "application/oscore": {
        source: "iana"
      },
      "application/oxps": {
        source: "iana",
        extensions: ["oxps"]
      },
      "application/p21": {
        source: "iana"
      },
      "application/p21+zip": {
        source: "iana",
        compressible: false
      },
      "application/p2p-overlay+xml": {
        source: "iana",
        compressible: true,
        extensions: ["relo"]
      },
      "application/parityfec": {
        source: "iana"
      },
      "application/passport": {
        source: "iana"
      },
      "application/patch-ops-error+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xer"]
      },
      "application/pdf": {
        source: "iana",
        compressible: false,
        extensions: ["pdf"]
      },
      "application/pdx": {
        source: "iana"
      },
      "application/pem-certificate-chain": {
        source: "iana"
      },
      "application/pgp-encrypted": {
        source: "iana",
        compressible: false,
        extensions: ["pgp"]
      },
      "application/pgp-keys": {
        source: "iana",
        extensions: ["asc"]
      },
      "application/pgp-signature": {
        source: "iana",
        extensions: ["sig", "asc"]
      },
      "application/pics-rules": {
        source: "apache",
        extensions: ["prf"]
      },
      "application/pidf+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/pidf-diff+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/pkcs10": {
        source: "iana",
        extensions: ["p10"]
      },
      "application/pkcs12": {
        source: "iana"
      },
      "application/pkcs7-mime": {
        source: "iana",
        extensions: ["p7m", "p7c"]
      },
      "application/pkcs7-signature": {
        source: "iana",
        extensions: ["p7s"]
      },
      "application/pkcs8": {
        source: "iana",
        extensions: ["p8"]
      },
      "application/pkcs8-encrypted": {
        source: "iana"
      },
      "application/pkix-attr-cert": {
        source: "iana",
        extensions: ["ac"]
      },
      "application/pkix-cert": {
        source: "iana",
        extensions: ["cer"]
      },
      "application/pkix-crl": {
        source: "iana",
        extensions: ["crl"]
      },
      "application/pkix-pkipath": {
        source: "iana",
        extensions: ["pkipath"]
      },
      "application/pkixcmp": {
        source: "iana",
        extensions: ["pki"]
      },
      "application/pls+xml": {
        source: "iana",
        compressible: true,
        extensions: ["pls"]
      },
      "application/poc-settings+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/postscript": {
        source: "iana",
        compressible: true,
        extensions: ["ai", "eps", "ps"]
      },
      "application/ppsp-tracker+json": {
        source: "iana",
        compressible: true
      },
      "application/private-token-issuer-directory": {
        source: "iana"
      },
      "application/private-token-request": {
        source: "iana"
      },
      "application/private-token-response": {
        source: "iana"
      },
      "application/problem+json": {
        source: "iana",
        compressible: true
      },
      "application/problem+xml": {
        source: "iana",
        compressible: true
      },
      "application/provenance+xml": {
        source: "iana",
        compressible: true,
        extensions: ["provx"]
      },
      "application/prs.alvestrand.titrax-sheet": {
        source: "iana"
      },
      "application/prs.cww": {
        source: "iana",
        extensions: ["cww"]
      },
      "application/prs.cyn": {
        source: "iana",
        charset: "7-BIT"
      },
      "application/prs.hpub+zip": {
        source: "iana",
        compressible: false
      },
      "application/prs.implied-document+xml": {
        source: "iana",
        compressible: true
      },
      "application/prs.implied-executable": {
        source: "iana"
      },
      "application/prs.implied-object+json": {
        source: "iana",
        compressible: true
      },
      "application/prs.implied-object+json-seq": {
        source: "iana"
      },
      "application/prs.implied-object+yaml": {
        source: "iana"
      },
      "application/prs.implied-structure": {
        source: "iana"
      },
      "application/prs.nprend": {
        source: "iana"
      },
      "application/prs.plucker": {
        source: "iana"
      },
      "application/prs.rdf-xml-crypt": {
        source: "iana"
      },
      "application/prs.vcfbzip2": {
        source: "iana"
      },
      "application/prs.xsf+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xsf"]
      },
      "application/pskc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["pskcxml"]
      },
      "application/pvd+json": {
        source: "iana",
        compressible: true
      },
      "application/qsig": {
        source: "iana"
      },
      "application/raml+yaml": {
        compressible: true,
        extensions: ["raml"]
      },
      "application/raptorfec": {
        source: "iana"
      },
      "application/rdap+json": {
        source: "iana",
        compressible: true
      },
      "application/rdf+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rdf", "owl"]
      },
      "application/reginfo+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rif"]
      },
      "application/relax-ng-compact-syntax": {
        source: "iana",
        extensions: ["rnc"]
      },
      "application/remote-printing": {
        source: "apache"
      },
      "application/reputon+json": {
        source: "iana",
        compressible: true
      },
      "application/resource-lists+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rl"]
      },
      "application/resource-lists-diff+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rld"]
      },
      "application/rfc+xml": {
        source: "iana",
        compressible: true
      },
      "application/riscos": {
        source: "iana"
      },
      "application/rlmi+xml": {
        source: "iana",
        compressible: true
      },
      "application/rls-services+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rs"]
      },
      "application/route-apd+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rapd"]
      },
      "application/route-s-tsid+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sls"]
      },
      "application/route-usd+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rusd"]
      },
      "application/rpki-checklist": {
        source: "iana"
      },
      "application/rpki-ghostbusters": {
        source: "iana",
        extensions: ["gbr"]
      },
      "application/rpki-manifest": {
        source: "iana",
        extensions: ["mft"]
      },
      "application/rpki-publication": {
        source: "iana"
      },
      "application/rpki-roa": {
        source: "iana",
        extensions: ["roa"]
      },
      "application/rpki-signed-tal": {
        source: "iana"
      },
      "application/rpki-updown": {
        source: "iana"
      },
      "application/rsd+xml": {
        source: "apache",
        compressible: true,
        extensions: ["rsd"]
      },
      "application/rss+xml": {
        source: "apache",
        compressible: true,
        extensions: ["rss"]
      },
      "application/rtf": {
        source: "iana",
        compressible: true,
        extensions: ["rtf"]
      },
      "application/rtploopback": {
        source: "iana"
      },
      "application/rtx": {
        source: "iana"
      },
      "application/samlassertion+xml": {
        source: "iana",
        compressible: true
      },
      "application/samlmetadata+xml": {
        source: "iana",
        compressible: true
      },
      "application/sarif+json": {
        source: "iana",
        compressible: true
      },
      "application/sarif-external-properties+json": {
        source: "iana",
        compressible: true
      },
      "application/sbe": {
        source: "iana"
      },
      "application/sbml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sbml"]
      },
      "application/scaip+xml": {
        source: "iana",
        compressible: true
      },
      "application/scim+json": {
        source: "iana",
        compressible: true
      },
      "application/scvp-cv-request": {
        source: "iana",
        extensions: ["scq"]
      },
      "application/scvp-cv-response": {
        source: "iana",
        extensions: ["scs"]
      },
      "application/scvp-vp-request": {
        source: "iana",
        extensions: ["spq"]
      },
      "application/scvp-vp-response": {
        source: "iana",
        extensions: ["spp"]
      },
      "application/sdp": {
        source: "iana",
        extensions: ["sdp"]
      },
      "application/secevent+jwt": {
        source: "iana"
      },
      "application/senml+cbor": {
        source: "iana"
      },
      "application/senml+json": {
        source: "iana",
        compressible: true
      },
      "application/senml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["senmlx"]
      },
      "application/senml-etch+cbor": {
        source: "iana"
      },
      "application/senml-etch+json": {
        source: "iana",
        compressible: true
      },
      "application/senml-exi": {
        source: "iana"
      },
      "application/sensml+cbor": {
        source: "iana"
      },
      "application/sensml+json": {
        source: "iana",
        compressible: true
      },
      "application/sensml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sensmlx"]
      },
      "application/sensml-exi": {
        source: "iana"
      },
      "application/sep+xml": {
        source: "iana",
        compressible: true
      },
      "application/sep-exi": {
        source: "iana"
      },
      "application/session-info": {
        source: "iana"
      },
      "application/set-payment": {
        source: "iana"
      },
      "application/set-payment-initiation": {
        source: "iana",
        extensions: ["setpay"]
      },
      "application/set-registration": {
        source: "iana"
      },
      "application/set-registration-initiation": {
        source: "iana",
        extensions: ["setreg"]
      },
      "application/sgml": {
        source: "iana"
      },
      "application/sgml-open-catalog": {
        source: "iana"
      },
      "application/shf+xml": {
        source: "iana",
        compressible: true,
        extensions: ["shf"]
      },
      "application/sieve": {
        source: "iana",
        extensions: ["siv", "sieve"]
      },
      "application/simple-filter+xml": {
        source: "iana",
        compressible: true
      },
      "application/simple-message-summary": {
        source: "iana"
      },
      "application/simplesymbolcontainer": {
        source: "iana"
      },
      "application/sipc": {
        source: "iana"
      },
      "application/slate": {
        source: "iana"
      },
      "application/smil": {
        source: "apache"
      },
      "application/smil+xml": {
        source: "iana",
        compressible: true,
        extensions: ["smi", "smil"]
      },
      "application/smpte336m": {
        source: "iana"
      },
      "application/soap+fastinfoset": {
        source: "iana"
      },
      "application/soap+xml": {
        source: "iana",
        compressible: true
      },
      "application/sparql-query": {
        source: "iana",
        extensions: ["rq"]
      },
      "application/sparql-results+xml": {
        source: "iana",
        compressible: true,
        extensions: ["srx"]
      },
      "application/spdx+json": {
        source: "iana",
        compressible: true
      },
      "application/spirits-event+xml": {
        source: "iana",
        compressible: true
      },
      "application/sql": {
        source: "iana",
        extensions: ["sql"]
      },
      "application/srgs": {
        source: "iana",
        extensions: ["gram"]
      },
      "application/srgs+xml": {
        source: "iana",
        compressible: true,
        extensions: ["grxml"]
      },
      "application/sru+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sru"]
      },
      "application/ssdl+xml": {
        source: "apache",
        compressible: true,
        extensions: ["ssdl"]
      },
      "application/ssml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ssml"]
      },
      "application/st2110-41": {
        source: "iana"
      },
      "application/stix+json": {
        source: "iana",
        compressible: true
      },
      "application/stratum": {
        source: "iana"
      },
      "application/swid+cbor": {
        source: "iana"
      },
      "application/swid+xml": {
        source: "iana",
        compressible: true,
        extensions: ["swidtag"]
      },
      "application/tamp-apex-update": {
        source: "iana"
      },
      "application/tamp-apex-update-confirm": {
        source: "iana"
      },
      "application/tamp-community-update": {
        source: "iana"
      },
      "application/tamp-community-update-confirm": {
        source: "iana"
      },
      "application/tamp-error": {
        source: "iana"
      },
      "application/tamp-sequence-adjust": {
        source: "iana"
      },
      "application/tamp-sequence-adjust-confirm": {
        source: "iana"
      },
      "application/tamp-status-query": {
        source: "iana"
      },
      "application/tamp-status-response": {
        source: "iana"
      },
      "application/tamp-update": {
        source: "iana"
      },
      "application/tamp-update-confirm": {
        source: "iana"
      },
      "application/tar": {
        compressible: true
      },
      "application/taxii+json": {
        source: "iana",
        compressible: true
      },
      "application/td+json": {
        source: "iana",
        compressible: true
      },
      "application/tei+xml": {
        source: "iana",
        compressible: true,
        extensions: ["tei", "teicorpus"]
      },
      "application/tetra_isi": {
        source: "iana"
      },
      "application/thraud+xml": {
        source: "iana",
        compressible: true,
        extensions: ["tfi"]
      },
      "application/timestamp-query": {
        source: "iana"
      },
      "application/timestamp-reply": {
        source: "iana"
      },
      "application/timestamped-data": {
        source: "iana",
        extensions: ["tsd"]
      },
      "application/tlsrpt+gzip": {
        source: "iana"
      },
      "application/tlsrpt+json": {
        source: "iana",
        compressible: true
      },
      "application/tm+json": {
        source: "iana",
        compressible: true
      },
      "application/tnauthlist": {
        source: "iana"
      },
      "application/token-introspection+jwt": {
        source: "iana"
      },
      "application/toml": {
        compressible: true,
        extensions: ["toml"]
      },
      "application/trickle-ice-sdpfrag": {
        source: "iana"
      },
      "application/trig": {
        source: "iana",
        extensions: ["trig"]
      },
      "application/ttml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ttml"]
      },
      "application/tve-trigger": {
        source: "iana"
      },
      "application/tzif": {
        source: "iana"
      },
      "application/tzif-leap": {
        source: "iana"
      },
      "application/ubjson": {
        compressible: false,
        extensions: ["ubj"]
      },
      "application/ulpfec": {
        source: "iana"
      },
      "application/urc-grpsheet+xml": {
        source: "iana",
        compressible: true
      },
      "application/urc-ressheet+xml": {
        source: "iana",
        compressible: true,
        extensions: ["rsheet"]
      },
      "application/urc-targetdesc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["td"]
      },
      "application/urc-uisocketdesc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vc": {
        source: "iana"
      },
      "application/vcard+json": {
        source: "iana",
        compressible: true
      },
      "application/vcard+xml": {
        source: "iana",
        compressible: true
      },
      "application/vemmi": {
        source: "iana"
      },
      "application/vividence.scriptfile": {
        source: "apache"
      },
      "application/vnd.1000minds.decision-model+xml": {
        source: "iana",
        compressible: true,
        extensions: ["1km"]
      },
      "application/vnd.1ob": {
        source: "iana"
      },
      "application/vnd.3gpp-prose+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp-prose-pc3a+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp-prose-pc3ach+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp-prose-pc3ch+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp-prose-pc8+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp-v2x-local-service-information": {
        source: "iana"
      },
      "application/vnd.3gpp.5gnas": {
        source: "iana"
      },
      "application/vnd.3gpp.5gsa2x": {
        source: "iana"
      },
      "application/vnd.3gpp.5gsa2x-local-service-information": {
        source: "iana"
      },
      "application/vnd.3gpp.access-transfer-events+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.bsf+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.crs+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.current-location-discovery+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.gmop+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.gtpc": {
        source: "iana"
      },
      "application/vnd.3gpp.interworking-data": {
        source: "iana"
      },
      "application/vnd.3gpp.lpp": {
        source: "iana"
      },
      "application/vnd.3gpp.mc-signalling-ear": {
        source: "iana"
      },
      "application/vnd.3gpp.mcdata-affiliation-command+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-msgstore-ctrl-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-payload": {
        source: "iana"
      },
      "application/vnd.3gpp.mcdata-regroup+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-service-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-signalling": {
        source: "iana"
      },
      "application/vnd.3gpp.mcdata-ue-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcdata-user-profile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-affiliation-command+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-floor-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-location-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-regroup+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-service-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-signed+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-ue-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-ue-init-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcptt-user-profile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-affiliation-command+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-location-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-regroup+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-service-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-transmission-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-ue-config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mcvideo-user-profile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.mid-call+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.ngap": {
        source: "iana"
      },
      "application/vnd.3gpp.pfcp": {
        source: "iana"
      },
      "application/vnd.3gpp.pic-bw-large": {
        source: "iana",
        extensions: ["plb"]
      },
      "application/vnd.3gpp.pic-bw-small": {
        source: "iana",
        extensions: ["psb"]
      },
      "application/vnd.3gpp.pic-bw-var": {
        source: "iana",
        extensions: ["pvb"]
      },
      "application/vnd.3gpp.pinapp-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.s1ap": {
        source: "iana"
      },
      "application/vnd.3gpp.seal-group-doc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.seal-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.seal-location-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.seal-mbms-usage-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.seal-network-qos-management-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.seal-ue-config-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.seal-unicast-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.seal-user-profile-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.sms": {
        source: "iana"
      },
      "application/vnd.3gpp.sms+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.srvcc-ext+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.srvcc-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.state-and-event-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.ussd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp.v2x": {
        source: "iana"
      },
      "application/vnd.3gpp.vae-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp2.bcmcsinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.3gpp2.sms": {
        source: "iana"
      },
      "application/vnd.3gpp2.tcap": {
        source: "iana",
        extensions: ["tcap"]
      },
      "application/vnd.3lightssoftware.imagescal": {
        source: "iana"
      },
      "application/vnd.3m.post-it-notes": {
        source: "iana",
        extensions: ["pwn"]
      },
      "application/vnd.accpac.simply.aso": {
        source: "iana",
        extensions: ["aso"]
      },
      "application/vnd.accpac.simply.imp": {
        source: "iana",
        extensions: ["imp"]
      },
      "application/vnd.acm.addressxfer+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.acm.chatbot+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.acucobol": {
        source: "iana",
        extensions: ["acu"]
      },
      "application/vnd.acucorp": {
        source: "iana",
        extensions: ["atc", "acutc"]
      },
      "application/vnd.adobe.air-application-installer-package+zip": {
        source: "apache",
        compressible: false,
        extensions: ["air"]
      },
      "application/vnd.adobe.flash.movie": {
        source: "iana"
      },
      "application/vnd.adobe.formscentral.fcdt": {
        source: "iana",
        extensions: ["fcdt"]
      },
      "application/vnd.adobe.fxp": {
        source: "iana",
        extensions: ["fxp", "fxpl"]
      },
      "application/vnd.adobe.partial-upload": {
        source: "iana"
      },
      "application/vnd.adobe.xdp+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xdp"]
      },
      "application/vnd.adobe.xfdf": {
        source: "apache",
        extensions: ["xfdf"]
      },
      "application/vnd.aether.imp": {
        source: "iana"
      },
      "application/vnd.afpc.afplinedata": {
        source: "iana"
      },
      "application/vnd.afpc.afplinedata-pagedef": {
        source: "iana"
      },
      "application/vnd.afpc.cmoca-cmresource": {
        source: "iana"
      },
      "application/vnd.afpc.foca-charset": {
        source: "iana"
      },
      "application/vnd.afpc.foca-codedfont": {
        source: "iana"
      },
      "application/vnd.afpc.foca-codepage": {
        source: "iana"
      },
      "application/vnd.afpc.modca": {
        source: "iana"
      },
      "application/vnd.afpc.modca-cmtable": {
        source: "iana"
      },
      "application/vnd.afpc.modca-formdef": {
        source: "iana"
      },
      "application/vnd.afpc.modca-mediummap": {
        source: "iana"
      },
      "application/vnd.afpc.modca-objectcontainer": {
        source: "iana"
      },
      "application/vnd.afpc.modca-overlay": {
        source: "iana"
      },
      "application/vnd.afpc.modca-pagesegment": {
        source: "iana"
      },
      "application/vnd.age": {
        source: "iana",
        extensions: ["age"]
      },
      "application/vnd.ah-barcode": {
        source: "apache"
      },
      "application/vnd.ahead.space": {
        source: "iana",
        extensions: ["ahead"]
      },
      "application/vnd.airzip.filesecure.azf": {
        source: "iana",
        extensions: ["azf"]
      },
      "application/vnd.airzip.filesecure.azs": {
        source: "iana",
        extensions: ["azs"]
      },
      "application/vnd.amadeus+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.amazon.ebook": {
        source: "apache",
        extensions: ["azw"]
      },
      "application/vnd.amazon.mobi8-ebook": {
        source: "iana"
      },
      "application/vnd.americandynamics.acc": {
        source: "iana",
        extensions: ["acc"]
      },
      "application/vnd.amiga.ami": {
        source: "iana",
        extensions: ["ami"]
      },
      "application/vnd.amundsen.maze+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.android.ota": {
        source: "iana"
      },
      "application/vnd.android.package-archive": {
        source: "apache",
        compressible: false,
        extensions: ["apk"]
      },
      "application/vnd.anki": {
        source: "iana"
      },
      "application/vnd.anser-web-certificate-issue-initiation": {
        source: "iana",
        extensions: ["cii"]
      },
      "application/vnd.anser-web-funds-transfer-initiation": {
        source: "apache",
        extensions: ["fti"]
      },
      "application/vnd.antix.game-component": {
        source: "iana",
        extensions: ["atx"]
      },
      "application/vnd.apache.arrow.file": {
        source: "iana"
      },
      "application/vnd.apache.arrow.stream": {
        source: "iana"
      },
      "application/vnd.apache.parquet": {
        source: "iana"
      },
      "application/vnd.apache.thrift.binary": {
        source: "iana"
      },
      "application/vnd.apache.thrift.compact": {
        source: "iana"
      },
      "application/vnd.apache.thrift.json": {
        source: "iana"
      },
      "application/vnd.apexlang": {
        source: "iana"
      },
      "application/vnd.api+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.aplextor.warrp+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.apothekende.reservation+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.apple.installer+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mpkg"]
      },
      "application/vnd.apple.keynote": {
        source: "iana",
        extensions: ["key"]
      },
      "application/vnd.apple.mpegurl": {
        source: "iana",
        extensions: ["m3u8"]
      },
      "application/vnd.apple.numbers": {
        source: "iana",
        extensions: ["numbers"]
      },
      "application/vnd.apple.pages": {
        source: "iana",
        extensions: ["pages"]
      },
      "application/vnd.apple.pkpass": {
        compressible: false,
        extensions: ["pkpass"]
      },
      "application/vnd.arastra.swi": {
        source: "apache"
      },
      "application/vnd.aristanetworks.swi": {
        source: "iana",
        extensions: ["swi"]
      },
      "application/vnd.artisan+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.artsquare": {
        source: "iana"
      },
      "application/vnd.astraea-software.iota": {
        source: "iana",
        extensions: ["iota"]
      },
      "application/vnd.audiograph": {
        source: "iana",
        extensions: ["aep"]
      },
      "application/vnd.autopackage": {
        source: "iana"
      },
      "application/vnd.avalon+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.avistar+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.balsamiq.bmml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["bmml"]
      },
      "application/vnd.balsamiq.bmpr": {
        source: "iana"
      },
      "application/vnd.banana-accounting": {
        source: "iana"
      },
      "application/vnd.bbf.usp.error": {
        source: "iana"
      },
      "application/vnd.bbf.usp.msg": {
        source: "iana"
      },
      "application/vnd.bbf.usp.msg+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.bekitzur-stech+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.belightsoft.lhzd+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.belightsoft.lhzl+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.bint.med-content": {
        source: "iana"
      },
      "application/vnd.biopax.rdf+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.blink-idb-value-wrapper": {
        source: "iana"
      },
      "application/vnd.blueice.multipass": {
        source: "iana",
        extensions: ["mpm"]
      },
      "application/vnd.bluetooth.ep.oob": {
        source: "iana"
      },
      "application/vnd.bluetooth.le.oob": {
        source: "iana"
      },
      "application/vnd.bmi": {
        source: "iana",
        extensions: ["bmi"]
      },
      "application/vnd.bpf": {
        source: "iana"
      },
      "application/vnd.bpf3": {
        source: "iana"
      },
      "application/vnd.businessobjects": {
        source: "iana",
        extensions: ["rep"]
      },
      "application/vnd.byu.uapi+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.bzip3": {
        source: "iana"
      },
      "application/vnd.c3voc.schedule+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cab-jscript": {
        source: "iana"
      },
      "application/vnd.canon-cpdl": {
        source: "iana"
      },
      "application/vnd.canon-lips": {
        source: "iana"
      },
      "application/vnd.capasystems-pg+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cendio.thinlinc.clientconf": {
        source: "iana"
      },
      "application/vnd.century-systems.tcp_stream": {
        source: "iana"
      },
      "application/vnd.chemdraw+xml": {
        source: "iana",
        compressible: true,
        extensions: ["cdxml"]
      },
      "application/vnd.chess-pgn": {
        source: "iana"
      },
      "application/vnd.chipnuts.karaoke-mmd": {
        source: "iana",
        extensions: ["mmd"]
      },
      "application/vnd.ciedi": {
        source: "iana"
      },
      "application/vnd.cinderella": {
        source: "iana",
        extensions: ["cdy"]
      },
      "application/vnd.cirpack.isdn-ext": {
        source: "iana"
      },
      "application/vnd.citationstyles.style+xml": {
        source: "iana",
        compressible: true,
        extensions: ["csl"]
      },
      "application/vnd.claymore": {
        source: "iana",
        extensions: ["cla"]
      },
      "application/vnd.cloanto.rp9": {
        source: "iana",
        extensions: ["rp9"]
      },
      "application/vnd.clonk.c4group": {
        source: "iana",
        extensions: ["c4g", "c4d", "c4f", "c4p", "c4u"]
      },
      "application/vnd.cluetrust.cartomobile-config": {
        source: "iana",
        extensions: ["c11amc"]
      },
      "application/vnd.cluetrust.cartomobile-config-pkg": {
        source: "iana",
        extensions: ["c11amz"]
      },
      "application/vnd.cncf.helm.chart.content.v1.tar+gzip": {
        source: "iana"
      },
      "application/vnd.cncf.helm.chart.provenance.v1.prov": {
        source: "iana"
      },
      "application/vnd.cncf.helm.config.v1+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.coffeescript": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.document": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.document-template": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.presentation": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.presentation-template": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.spreadsheet": {
        source: "iana"
      },
      "application/vnd.collabio.xodocuments.spreadsheet-template": {
        source: "iana"
      },
      "application/vnd.collection+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.collection.doc+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.collection.next+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.comicbook+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.comicbook-rar": {
        source: "iana"
      },
      "application/vnd.commerce-battelle": {
        source: "iana"
      },
      "application/vnd.commonspace": {
        source: "iana",
        extensions: ["csp"]
      },
      "application/vnd.contact.cmsg": {
        source: "iana",
        extensions: ["cdbcmsg"]
      },
      "application/vnd.coreos.ignition+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cosmocaller": {
        source: "iana",
        extensions: ["cmc"]
      },
      "application/vnd.crick.clicker": {
        source: "iana",
        extensions: ["clkx"]
      },
      "application/vnd.crick.clicker.keyboard": {
        source: "iana",
        extensions: ["clkk"]
      },
      "application/vnd.crick.clicker.palette": {
        source: "iana",
        extensions: ["clkp"]
      },
      "application/vnd.crick.clicker.template": {
        source: "iana",
        extensions: ["clkt"]
      },
      "application/vnd.crick.clicker.wordbank": {
        source: "iana",
        extensions: ["clkw"]
      },
      "application/vnd.criticaltools.wbs+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wbs"]
      },
      "application/vnd.cryptii.pipe+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.crypto-shade-file": {
        source: "iana"
      },
      "application/vnd.cryptomator.encrypted": {
        source: "iana"
      },
      "application/vnd.cryptomator.vault": {
        source: "iana"
      },
      "application/vnd.ctc-posml": {
        source: "iana",
        extensions: ["pml"]
      },
      "application/vnd.ctct.ws+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cups-pdf": {
        source: "iana"
      },
      "application/vnd.cups-postscript": {
        source: "iana"
      },
      "application/vnd.cups-ppd": {
        source: "iana",
        extensions: ["ppd"]
      },
      "application/vnd.cups-raster": {
        source: "iana"
      },
      "application/vnd.cups-raw": {
        source: "iana"
      },
      "application/vnd.curl": {
        source: "iana"
      },
      "application/vnd.curl.car": {
        source: "apache",
        extensions: ["car"]
      },
      "application/vnd.curl.pcurl": {
        source: "apache",
        extensions: ["pcurl"]
      },
      "application/vnd.cyan.dean.root+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cybank": {
        source: "iana"
      },
      "application/vnd.cyclonedx+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.cyclonedx+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.d2l.coursepackage1p0+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.d3m-dataset": {
        source: "iana"
      },
      "application/vnd.d3m-problem": {
        source: "iana"
      },
      "application/vnd.dart": {
        source: "iana",
        compressible: true,
        extensions: ["dart"]
      },
      "application/vnd.data-vision.rdz": {
        source: "iana",
        extensions: ["rdz"]
      },
      "application/vnd.datalog": {
        source: "iana"
      },
      "application/vnd.datapackage+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dataresource+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dbf": {
        source: "iana",
        extensions: ["dbf"]
      },
      "application/vnd.debian.binary-package": {
        source: "iana"
      },
      "application/vnd.dece.data": {
        source: "iana",
        extensions: ["uvf", "uvvf", "uvd", "uvvd"]
      },
      "application/vnd.dece.ttml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["uvt", "uvvt"]
      },
      "application/vnd.dece.unspecified": {
        source: "iana",
        extensions: ["uvx", "uvvx"]
      },
      "application/vnd.dece.zip": {
        source: "iana",
        extensions: ["uvz", "uvvz"]
      },
      "application/vnd.denovo.fcselayout-link": {
        source: "iana",
        extensions: ["fe_launch"]
      },
      "application/vnd.desmume.movie": {
        source: "iana"
      },
      "application/vnd.dir-bi.plate-dl-nosuffix": {
        source: "iana"
      },
      "application/vnd.dm.delegation+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dna": {
        source: "iana",
        extensions: ["dna"]
      },
      "application/vnd.document+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dolby.mlp": {
        source: "apache",
        extensions: ["mlp"]
      },
      "application/vnd.dolby.mobile.1": {
        source: "iana"
      },
      "application/vnd.dolby.mobile.2": {
        source: "iana"
      },
      "application/vnd.doremir.scorecloud-binary-document": {
        source: "iana"
      },
      "application/vnd.dpgraph": {
        source: "iana",
        extensions: ["dpg"]
      },
      "application/vnd.dreamfactory": {
        source: "iana",
        extensions: ["dfac"]
      },
      "application/vnd.drive+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ds-keypoint": {
        source: "apache",
        extensions: ["kpxx"]
      },
      "application/vnd.dtg.local": {
        source: "iana"
      },
      "application/vnd.dtg.local.flash": {
        source: "iana"
      },
      "application/vnd.dtg.local.html": {
        source: "iana"
      },
      "application/vnd.dvb.ait": {
        source: "iana",
        extensions: ["ait"]
      },
      "application/vnd.dvb.dvbisl+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.dvbj": {
        source: "iana"
      },
      "application/vnd.dvb.esgcontainer": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcdftnotifaccess": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcesgaccess": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcesgaccess2": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcesgpdd": {
        source: "iana"
      },
      "application/vnd.dvb.ipdcroaming": {
        source: "iana"
      },
      "application/vnd.dvb.iptv.alfec-base": {
        source: "iana"
      },
      "application/vnd.dvb.iptv.alfec-enhancement": {
        source: "iana"
      },
      "application/vnd.dvb.notif-aggregate-root+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-container+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-generic+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-ia-msglist+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-ia-registration-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-ia-registration-response+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.notif-init+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.dvb.pfr": {
        source: "iana"
      },
      "application/vnd.dvb.service": {
        source: "iana",
        extensions: ["svc"]
      },
      "application/vnd.dxr": {
        source: "iana"
      },
      "application/vnd.dynageo": {
        source: "iana",
        extensions: ["geo"]
      },
      "application/vnd.dzr": {
        source: "iana"
      },
      "application/vnd.easykaraoke.cdgdownload": {
        source: "iana"
      },
      "application/vnd.ecdis-update": {
        source: "iana"
      },
      "application/vnd.ecip.rlp": {
        source: "iana"
      },
      "application/vnd.eclipse.ditto+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ecowin.chart": {
        source: "iana",
        extensions: ["mag"]
      },
      "application/vnd.ecowin.filerequest": {
        source: "iana"
      },
      "application/vnd.ecowin.fileupdate": {
        source: "iana"
      },
      "application/vnd.ecowin.series": {
        source: "iana"
      },
      "application/vnd.ecowin.seriesrequest": {
        source: "iana"
      },
      "application/vnd.ecowin.seriesupdate": {
        source: "iana"
      },
      "application/vnd.efi.img": {
        source: "iana"
      },
      "application/vnd.efi.iso": {
        source: "iana"
      },
      "application/vnd.eln+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.emclient.accessrequest+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.enliven": {
        source: "iana",
        extensions: ["nml"]
      },
      "application/vnd.enphase.envoy": {
        source: "iana"
      },
      "application/vnd.eprints.data+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.epson.esf": {
        source: "iana",
        extensions: ["esf"]
      },
      "application/vnd.epson.msf": {
        source: "iana",
        extensions: ["msf"]
      },
      "application/vnd.epson.quickanime": {
        source: "iana",
        extensions: ["qam"]
      },
      "application/vnd.epson.salt": {
        source: "iana",
        extensions: ["slt"]
      },
      "application/vnd.epson.ssf": {
        source: "iana",
        extensions: ["ssf"]
      },
      "application/vnd.ericsson.quickcall": {
        source: "iana"
      },
      "application/vnd.erofs": {
        source: "iana"
      },
      "application/vnd.espass-espass+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.eszigno3+xml": {
        source: "iana",
        compressible: true,
        extensions: ["es3", "et3"]
      },
      "application/vnd.etsi.aoc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.asic-e+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.etsi.asic-s+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.etsi.cug+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvcommand+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvdiscovery+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvprofile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvsad-bc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvsad-cod+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvsad-npvr+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvservice+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvsync+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.iptvueprofile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.mcid+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.mheg5": {
        source: "iana"
      },
      "application/vnd.etsi.overload-control-policy-dataset+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.pstn+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.sci+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.simservs+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.timestamp-token": {
        source: "iana"
      },
      "application/vnd.etsi.tsl+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.etsi.tsl.der": {
        source: "iana"
      },
      "application/vnd.eu.kasparian.car+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.eudora.data": {
        source: "iana"
      },
      "application/vnd.evolv.ecig.profile": {
        source: "iana"
      },
      "application/vnd.evolv.ecig.settings": {
        source: "iana"
      },
      "application/vnd.evolv.ecig.theme": {
        source: "iana"
      },
      "application/vnd.exstream-empower+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.exstream-package": {
        source: "iana"
      },
      "application/vnd.ezpix-album": {
        source: "iana",
        extensions: ["ez2"]
      },
      "application/vnd.ezpix-package": {
        source: "iana",
        extensions: ["ez3"]
      },
      "application/vnd.f-secure.mobile": {
        source: "iana"
      },
      "application/vnd.familysearch.gedcom+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.fastcopy-disk-image": {
        source: "iana"
      },
      "application/vnd.fdf": {
        source: "apache",
        extensions: ["fdf"]
      },
      "application/vnd.fdsn.mseed": {
        source: "iana",
        extensions: ["mseed"]
      },
      "application/vnd.fdsn.seed": {
        source: "iana",
        extensions: ["seed", "dataless"]
      },
      "application/vnd.ffsns": {
        source: "iana"
      },
      "application/vnd.ficlab.flb+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.filmit.zfc": {
        source: "iana"
      },
      "application/vnd.fints": {
        source: "iana"
      },
      "application/vnd.firemonkeys.cloudcell": {
        source: "iana"
      },
      "application/vnd.flographit": {
        source: "iana",
        extensions: ["gph"]
      },
      "application/vnd.fluxtime.clip": {
        source: "iana",
        extensions: ["ftc"]
      },
      "application/vnd.font-fontforge-sfd": {
        source: "iana"
      },
      "application/vnd.framemaker": {
        source: "iana",
        extensions: ["fm", "frame", "maker", "book"]
      },
      "application/vnd.freelog.comic": {
        source: "iana"
      },
      "application/vnd.frogans.fnc": {
        source: "apache",
        extensions: ["fnc"]
      },
      "application/vnd.frogans.ltf": {
        source: "apache",
        extensions: ["ltf"]
      },
      "application/vnd.fsc.weblaunch": {
        source: "iana",
        extensions: ["fsc"]
      },
      "application/vnd.fujifilm.fb.docuworks": {
        source: "iana"
      },
      "application/vnd.fujifilm.fb.docuworks.binder": {
        source: "iana"
      },
      "application/vnd.fujifilm.fb.docuworks.container": {
        source: "iana"
      },
      "application/vnd.fujifilm.fb.jfi+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.fujitsu.oasys": {
        source: "iana",
        extensions: ["oas"]
      },
      "application/vnd.fujitsu.oasys2": {
        source: "iana",
        extensions: ["oa2"]
      },
      "application/vnd.fujitsu.oasys3": {
        source: "iana",
        extensions: ["oa3"]
      },
      "application/vnd.fujitsu.oasysgp": {
        source: "iana",
        extensions: ["fg5"]
      },
      "application/vnd.fujitsu.oasysprs": {
        source: "iana",
        extensions: ["bh2"]
      },
      "application/vnd.fujixerox.art-ex": {
        source: "iana"
      },
      "application/vnd.fujixerox.art4": {
        source: "iana"
      },
      "application/vnd.fujixerox.ddd": {
        source: "iana",
        extensions: ["ddd"]
      },
      "application/vnd.fujixerox.docuworks": {
        source: "iana",
        extensions: ["xdw"]
      },
      "application/vnd.fujixerox.docuworks.binder": {
        source: "iana",
        extensions: ["xbd"]
      },
      "application/vnd.fujixerox.docuworks.container": {
        source: "iana"
      },
      "application/vnd.fujixerox.hbpl": {
        source: "iana"
      },
      "application/vnd.fut-misnet": {
        source: "iana"
      },
      "application/vnd.futoin+cbor": {
        source: "iana"
      },
      "application/vnd.futoin+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.fuzzysheet": {
        source: "iana",
        extensions: ["fzs"]
      },
      "application/vnd.ga4gh.passport+jwt": {
        source: "iana"
      },
      "application/vnd.genomatix.tuxedo": {
        source: "iana",
        extensions: ["txd"]
      },
      "application/vnd.genozip": {
        source: "iana"
      },
      "application/vnd.gentics.grd+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.gentoo.catmetadata+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.gentoo.ebuild": {
        source: "iana"
      },
      "application/vnd.gentoo.eclass": {
        source: "iana"
      },
      "application/vnd.gentoo.gpkg": {
        source: "iana"
      },
      "application/vnd.gentoo.manifest": {
        source: "iana"
      },
      "application/vnd.gentoo.pkgmetadata+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.gentoo.xpak": {
        source: "iana"
      },
      "application/vnd.geo+json": {
        source: "apache",
        compressible: true
      },
      "application/vnd.geocube+xml": {
        source: "apache",
        compressible: true
      },
      "application/vnd.geogebra.file": {
        source: "iana",
        extensions: ["ggb"]
      },
      "application/vnd.geogebra.slides": {
        source: "iana",
        extensions: ["ggs"]
      },
      "application/vnd.geogebra.tool": {
        source: "iana",
        extensions: ["ggt"]
      },
      "application/vnd.geometry-explorer": {
        source: "iana",
        extensions: ["gex", "gre"]
      },
      "application/vnd.geonext": {
        source: "iana",
        extensions: ["gxt"]
      },
      "application/vnd.geoplan": {
        source: "iana",
        extensions: ["g2w"]
      },
      "application/vnd.geospace": {
        source: "iana",
        extensions: ["g3w"]
      },
      "application/vnd.gerber": {
        source: "iana"
      },
      "application/vnd.globalplatform.card-content-mgt": {
        source: "iana"
      },
      "application/vnd.globalplatform.card-content-mgt-response": {
        source: "iana"
      },
      "application/vnd.gmx": {
        source: "iana",
        extensions: ["gmx"]
      },
      "application/vnd.gnu.taler.exchange+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.gnu.taler.merchant+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.google-apps.document": {
        compressible: false,
        extensions: ["gdoc"]
      },
      "application/vnd.google-apps.presentation": {
        compressible: false,
        extensions: ["gslides"]
      },
      "application/vnd.google-apps.spreadsheet": {
        compressible: false,
        extensions: ["gsheet"]
      },
      "application/vnd.google-earth.kml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["kml"]
      },
      "application/vnd.google-earth.kmz": {
        source: "iana",
        compressible: false,
        extensions: ["kmz"]
      },
      "application/vnd.gov.sk.e-form+xml": {
        source: "apache",
        compressible: true
      },
      "application/vnd.gov.sk.e-form+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.gov.sk.xmldatacontainer+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xdcf"]
      },
      "application/vnd.gpxsee.map+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.grafeq": {
        source: "iana",
        extensions: ["gqf", "gqs"]
      },
      "application/vnd.gridmp": {
        source: "iana"
      },
      "application/vnd.groove-account": {
        source: "iana",
        extensions: ["gac"]
      },
      "application/vnd.groove-help": {
        source: "iana",
        extensions: ["ghf"]
      },
      "application/vnd.groove-identity-message": {
        source: "iana",
        extensions: ["gim"]
      },
      "application/vnd.groove-injector": {
        source: "iana",
        extensions: ["grv"]
      },
      "application/vnd.groove-tool-message": {
        source: "iana",
        extensions: ["gtm"]
      },
      "application/vnd.groove-tool-template": {
        source: "iana",
        extensions: ["tpl"]
      },
      "application/vnd.groove-vcard": {
        source: "iana",
        extensions: ["vcg"]
      },
      "application/vnd.hal+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hal+xml": {
        source: "iana",
        compressible: true,
        extensions: ["hal"]
      },
      "application/vnd.handheld-entertainment+xml": {
        source: "iana",
        compressible: true,
        extensions: ["zmm"]
      },
      "application/vnd.hbci": {
        source: "iana",
        extensions: ["hbci"]
      },
      "application/vnd.hc+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hcl-bireports": {
        source: "iana"
      },
      "application/vnd.hdt": {
        source: "iana"
      },
      "application/vnd.heroku+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hhe.lesson-player": {
        source: "iana",
        extensions: ["les"]
      },
      "application/vnd.hp-hpgl": {
        source: "iana",
        extensions: ["hpgl"]
      },
      "application/vnd.hp-hpid": {
        source: "iana",
        extensions: ["hpid"]
      },
      "application/vnd.hp-hps": {
        source: "iana",
        extensions: ["hps"]
      },
      "application/vnd.hp-jlyt": {
        source: "iana",
        extensions: ["jlt"]
      },
      "application/vnd.hp-pcl": {
        source: "iana",
        extensions: ["pcl"]
      },
      "application/vnd.hp-pclxl": {
        source: "iana",
        extensions: ["pclxl"]
      },
      "application/vnd.hsl": {
        source: "iana"
      },
      "application/vnd.httphone": {
        source: "iana"
      },
      "application/vnd.hydrostatix.sof-data": {
        source: "iana",
        extensions: ["sfd-hdstx"]
      },
      "application/vnd.hyper+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hyper-item+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hyperdrive+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.hzn-3d-crossword": {
        source: "iana"
      },
      "application/vnd.ibm.afplinedata": {
        source: "apache"
      },
      "application/vnd.ibm.electronic-media": {
        source: "iana"
      },
      "application/vnd.ibm.minipay": {
        source: "iana",
        extensions: ["mpy"]
      },
      "application/vnd.ibm.modcap": {
        source: "apache",
        extensions: ["afp", "listafp", "list3820"]
      },
      "application/vnd.ibm.rights-management": {
        source: "iana",
        extensions: ["irm"]
      },
      "application/vnd.ibm.secure-container": {
        source: "iana",
        extensions: ["sc"]
      },
      "application/vnd.iccprofile": {
        source: "iana",
        extensions: ["icc", "icm"]
      },
      "application/vnd.ieee.1905": {
        source: "iana"
      },
      "application/vnd.igloader": {
        source: "iana",
        extensions: ["igl"]
      },
      "application/vnd.imagemeter.folder+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.imagemeter.image+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.immervision-ivp": {
        source: "iana",
        extensions: ["ivp"]
      },
      "application/vnd.immervision-ivu": {
        source: "iana",
        extensions: ["ivu"]
      },
      "application/vnd.ims.imsccv1p1": {
        source: "iana"
      },
      "application/vnd.ims.imsccv1p2": {
        source: "iana"
      },
      "application/vnd.ims.imsccv1p3": {
        source: "iana"
      },
      "application/vnd.ims.lis.v2.result+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolconsumerprofile+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolproxy+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolproxy.id+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolsettings+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ims.lti.v2.toolsettings.simple+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.informedcontrol.rms+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.informix-visionary": {
        source: "apache"
      },
      "application/vnd.infotech.project": {
        source: "iana"
      },
      "application/vnd.infotech.project+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.innopath.wamp.notification": {
        source: "iana"
      },
      "application/vnd.insors.igm": {
        source: "iana",
        extensions: ["igm"]
      },
      "application/vnd.intercon.formnet": {
        source: "iana",
        extensions: ["xpw", "xpx"]
      },
      "application/vnd.intergeo": {
        source: "iana",
        extensions: ["i2g"]
      },
      "application/vnd.intertrust.digibox": {
        source: "iana"
      },
      "application/vnd.intertrust.nncp": {
        source: "iana"
      },
      "application/vnd.intu.qbo": {
        source: "iana",
        extensions: ["qbo"]
      },
      "application/vnd.intu.qfx": {
        source: "iana",
        extensions: ["qfx"]
      },
      "application/vnd.ipfs.ipns-record": {
        source: "iana"
      },
      "application/vnd.ipld.car": {
        source: "iana"
      },
      "application/vnd.ipld.dag-cbor": {
        source: "iana"
      },
      "application/vnd.ipld.dag-json": {
        source: "iana"
      },
      "application/vnd.ipld.raw": {
        source: "iana"
      },
      "application/vnd.iptc.g2.catalogitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.conceptitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.knowledgeitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.newsitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.newsmessage+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.packageitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.iptc.g2.planningitem+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ipunplugged.rcprofile": {
        source: "iana",
        extensions: ["rcprofile"]
      },
      "application/vnd.irepository.package+xml": {
        source: "iana",
        compressible: true,
        extensions: ["irp"]
      },
      "application/vnd.is-xpr": {
        source: "iana",
        extensions: ["xpr"]
      },
      "application/vnd.isac.fcs": {
        source: "iana",
        extensions: ["fcs"]
      },
      "application/vnd.iso11783-10+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.jam": {
        source: "iana",
        extensions: ["jam"]
      },
      "application/vnd.japannet-directory-service": {
        source: "iana"
      },
      "application/vnd.japannet-jpnstore-wakeup": {
        source: "iana"
      },
      "application/vnd.japannet-payment-wakeup": {
        source: "iana"
      },
      "application/vnd.japannet-registration": {
        source: "iana"
      },
      "application/vnd.japannet-registration-wakeup": {
        source: "iana"
      },
      "application/vnd.japannet-setstore-wakeup": {
        source: "iana"
      },
      "application/vnd.japannet-verification": {
        source: "iana"
      },
      "application/vnd.japannet-verification-wakeup": {
        source: "iana"
      },
      "application/vnd.jcp.javame.midlet-rms": {
        source: "iana",
        extensions: ["rms"]
      },
      "application/vnd.jisp": {
        source: "iana",
        extensions: ["jisp"]
      },
      "application/vnd.joost.joda-archive": {
        source: "iana",
        extensions: ["joda"]
      },
      "application/vnd.jsk.isdn-ngn": {
        source: "iana"
      },
      "application/vnd.kahootz": {
        source: "iana",
        extensions: ["ktz", "ktr"]
      },
      "application/vnd.kde.karbon": {
        source: "iana",
        extensions: ["karbon"]
      },
      "application/vnd.kde.kchart": {
        source: "iana",
        extensions: ["chrt"]
      },
      "application/vnd.kde.kformula": {
        source: "iana",
        extensions: ["kfo"]
      },
      "application/vnd.kde.kivio": {
        source: "iana",
        extensions: ["flw"]
      },
      "application/vnd.kde.kontour": {
        source: "iana",
        extensions: ["kon"]
      },
      "application/vnd.kde.kpresenter": {
        source: "iana",
        extensions: ["kpr", "kpt"]
      },
      "application/vnd.kde.kspread": {
        source: "iana",
        extensions: ["ksp"]
      },
      "application/vnd.kde.kword": {
        source: "iana",
        extensions: ["kwd", "kwt"]
      },
      "application/vnd.kenameaapp": {
        source: "iana",
        extensions: ["htke"]
      },
      "application/vnd.kidspiration": {
        source: "iana",
        extensions: ["kia"]
      },
      "application/vnd.kinar": {
        source: "iana",
        extensions: ["kne", "knp"]
      },
      "application/vnd.koan": {
        source: "iana",
        extensions: ["skp", "skd", "skt", "skm"]
      },
      "application/vnd.kodak-descriptor": {
        source: "iana",
        extensions: ["sse"]
      },
      "application/vnd.las": {
        source: "iana"
      },
      "application/vnd.las.las+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.las.las+xml": {
        source: "iana",
        compressible: true,
        extensions: ["lasxml"]
      },
      "application/vnd.laszip": {
        source: "iana"
      },
      "application/vnd.ldev.productlicensing": {
        source: "iana"
      },
      "application/vnd.leap+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.liberty-request+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.llamagraphics.life-balance.desktop": {
        source: "iana",
        extensions: ["lbd"]
      },
      "application/vnd.llamagraphics.life-balance.exchange+xml": {
        source: "iana",
        compressible: true,
        extensions: ["lbe"]
      },
      "application/vnd.logipipe.circuit+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.loom": {
        source: "iana"
      },
      "application/vnd.lotus-1-2-3": {
        source: "iana",
        extensions: ["123"]
      },
      "application/vnd.lotus-approach": {
        source: "iana",
        extensions: ["apr"]
      },
      "application/vnd.lotus-freelance": {
        source: "iana",
        extensions: ["pre"]
      },
      "application/vnd.lotus-notes": {
        source: "iana",
        extensions: ["nsf"]
      },
      "application/vnd.lotus-organizer": {
        source: "iana",
        extensions: ["org"]
      },
      "application/vnd.lotus-screencam": {
        source: "iana",
        extensions: ["scm"]
      },
      "application/vnd.lotus-wordpro": {
        source: "iana",
        extensions: ["lwp"]
      },
      "application/vnd.macports.portpkg": {
        source: "iana",
        extensions: ["portpkg"]
      },
      "application/vnd.mapbox-vector-tile": {
        source: "iana",
        extensions: ["mvt"]
      },
      "application/vnd.marlin.drm.actiontoken+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.marlin.drm.conftoken+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.marlin.drm.license+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.marlin.drm.mdcf": {
        source: "iana"
      },
      "application/vnd.mason+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.maxar.archive.3tz+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.maxmind.maxmind-db": {
        source: "iana"
      },
      "application/vnd.mcd": {
        source: "iana",
        extensions: ["mcd"]
      },
      "application/vnd.mdl": {
        source: "iana"
      },
      "application/vnd.mdl-mbsdf": {
        source: "iana"
      },
      "application/vnd.medcalcdata": {
        source: "iana",
        extensions: ["mc1"]
      },
      "application/vnd.mediastation.cdkey": {
        source: "iana",
        extensions: ["cdkey"]
      },
      "application/vnd.medicalholodeck.recordxr": {
        source: "iana"
      },
      "application/vnd.meridian-slingshot": {
        source: "iana"
      },
      "application/vnd.mermaid": {
        source: "iana"
      },
      "application/vnd.mfer": {
        source: "iana",
        extensions: ["mwf"]
      },
      "application/vnd.mfmp": {
        source: "iana",
        extensions: ["mfm"]
      },
      "application/vnd.micro+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.micrografx.flo": {
        source: "iana",
        extensions: ["flo"]
      },
      "application/vnd.micrografx.igx": {
        source: "iana",
        extensions: ["igx"]
      },
      "application/vnd.microsoft.portable-executable": {
        source: "iana"
      },
      "application/vnd.microsoft.windows.thumbnail-cache": {
        source: "iana"
      },
      "application/vnd.miele+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.mif": {
        source: "iana",
        extensions: ["mif"]
      },
      "application/vnd.minisoft-hp3000-save": {
        source: "iana"
      },
      "application/vnd.mitsubishi.misty-guard.trustweb": {
        source: "iana"
      },
      "application/vnd.mobius.daf": {
        source: "iana",
        extensions: ["daf"]
      },
      "application/vnd.mobius.dis": {
        source: "iana",
        extensions: ["dis"]
      },
      "application/vnd.mobius.mbk": {
        source: "iana",
        extensions: ["mbk"]
      },
      "application/vnd.mobius.mqy": {
        source: "iana",
        extensions: ["mqy"]
      },
      "application/vnd.mobius.msl": {
        source: "iana",
        extensions: ["msl"]
      },
      "application/vnd.mobius.plc": {
        source: "iana",
        extensions: ["plc"]
      },
      "application/vnd.mobius.txf": {
        source: "iana",
        extensions: ["txf"]
      },
      "application/vnd.modl": {
        source: "iana"
      },
      "application/vnd.mophun.application": {
        source: "iana",
        extensions: ["mpn"]
      },
      "application/vnd.mophun.certificate": {
        source: "iana",
        extensions: ["mpc"]
      },
      "application/vnd.motorola.flexsuite": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.adsi": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.fis": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.gotap": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.kmr": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.ttc": {
        source: "iana"
      },
      "application/vnd.motorola.flexsuite.wem": {
        source: "iana"
      },
      "application/vnd.motorola.iprm": {
        source: "iana"
      },
      "application/vnd.mozilla.xul+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xul"]
      },
      "application/vnd.ms-3mfdocument": {
        source: "iana"
      },
      "application/vnd.ms-artgalry": {
        source: "iana",
        extensions: ["cil"]
      },
      "application/vnd.ms-asf": {
        source: "iana"
      },
      "application/vnd.ms-cab-compressed": {
        source: "iana",
        extensions: ["cab"]
      },
      "application/vnd.ms-color.iccprofile": {
        source: "apache"
      },
      "application/vnd.ms-excel": {
        source: "iana",
        compressible: false,
        extensions: ["xls", "xlm", "xla", "xlc", "xlt", "xlw"]
      },
      "application/vnd.ms-excel.addin.macroenabled.12": {
        source: "iana",
        extensions: ["xlam"]
      },
      "application/vnd.ms-excel.sheet.binary.macroenabled.12": {
        source: "iana",
        extensions: ["xlsb"]
      },
      "application/vnd.ms-excel.sheet.macroenabled.12": {
        source: "iana",
        extensions: ["xlsm"]
      },
      "application/vnd.ms-excel.template.macroenabled.12": {
        source: "iana",
        extensions: ["xltm"]
      },
      "application/vnd.ms-fontobject": {
        source: "iana",
        compressible: true,
        extensions: ["eot"]
      },
      "application/vnd.ms-htmlhelp": {
        source: "iana",
        extensions: ["chm"]
      },
      "application/vnd.ms-ims": {
        source: "iana",
        extensions: ["ims"]
      },
      "application/vnd.ms-lrm": {
        source: "iana",
        extensions: ["lrm"]
      },
      "application/vnd.ms-office.activex+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ms-officetheme": {
        source: "iana",
        extensions: ["thmx"]
      },
      "application/vnd.ms-opentype": {
        source: "apache",
        compressible: true
      },
      "application/vnd.ms-outlook": {
        compressible: false,
        extensions: ["msg"]
      },
      "application/vnd.ms-package.obfuscated-opentype": {
        source: "apache"
      },
      "application/vnd.ms-pki.seccat": {
        source: "apache",
        extensions: ["cat"]
      },
      "application/vnd.ms-pki.stl": {
        source: "apache",
        extensions: ["stl"]
      },
      "application/vnd.ms-playready.initiator+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ms-powerpoint": {
        source: "iana",
        compressible: false,
        extensions: ["ppt", "pps", "pot"]
      },
      "application/vnd.ms-powerpoint.addin.macroenabled.12": {
        source: "iana",
        extensions: ["ppam"]
      },
      "application/vnd.ms-powerpoint.presentation.macroenabled.12": {
        source: "iana",
        extensions: ["pptm"]
      },
      "application/vnd.ms-powerpoint.slide.macroenabled.12": {
        source: "iana",
        extensions: ["sldm"]
      },
      "application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
        source: "iana",
        extensions: ["ppsm"]
      },
      "application/vnd.ms-powerpoint.template.macroenabled.12": {
        source: "iana",
        extensions: ["potm"]
      },
      "application/vnd.ms-printdevicecapabilities+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ms-printing.printticket+xml": {
        source: "apache",
        compressible: true
      },
      "application/vnd.ms-printschematicket+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.ms-project": {
        source: "iana",
        extensions: ["mpp", "mpt"]
      },
      "application/vnd.ms-tnef": {
        source: "iana"
      },
      "application/vnd.ms-windows.devicepairing": {
        source: "iana"
      },
      "application/vnd.ms-windows.nwprinting.oob": {
        source: "iana"
      },
      "application/vnd.ms-windows.printerpairing": {
        source: "iana"
      },
      "application/vnd.ms-windows.wsd.oob": {
        source: "iana"
      },
      "application/vnd.ms-wmdrm.lic-chlg-req": {
        source: "iana"
      },
      "application/vnd.ms-wmdrm.lic-resp": {
        source: "iana"
      },
      "application/vnd.ms-wmdrm.meter-chlg-req": {
        source: "iana"
      },
      "application/vnd.ms-wmdrm.meter-resp": {
        source: "iana"
      },
      "application/vnd.ms-word.document.macroenabled.12": {
        source: "iana",
        extensions: ["docm"]
      },
      "application/vnd.ms-word.template.macroenabled.12": {
        source: "iana",
        extensions: ["dotm"]
      },
      "application/vnd.ms-works": {
        source: "iana",
        extensions: ["wps", "wks", "wcm", "wdb"]
      },
      "application/vnd.ms-wpl": {
        source: "iana",
        extensions: ["wpl"]
      },
      "application/vnd.ms-xpsdocument": {
        source: "iana",
        compressible: false,
        extensions: ["xps"]
      },
      "application/vnd.msa-disk-image": {
        source: "iana"
      },
      "application/vnd.mseq": {
        source: "iana",
        extensions: ["mseq"]
      },
      "application/vnd.msgpack": {
        source: "iana"
      },
      "application/vnd.msign": {
        source: "iana"
      },
      "application/vnd.multiad.creator": {
        source: "iana"
      },
      "application/vnd.multiad.creator.cif": {
        source: "iana"
      },
      "application/vnd.music-niff": {
        source: "iana"
      },
      "application/vnd.musician": {
        source: "iana",
        extensions: ["mus"]
      },
      "application/vnd.muvee.style": {
        source: "iana",
        extensions: ["msty"]
      },
      "application/vnd.mynfc": {
        source: "iana",
        extensions: ["taglet"]
      },
      "application/vnd.nacamar.ybrid+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nato.bindingdataobject+cbor": {
        source: "iana"
      },
      "application/vnd.nato.bindingdataobject+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nato.bindingdataobject+xml": {
        source: "iana",
        compressible: true,
        extensions: ["bdo"]
      },
      "application/vnd.nato.openxmlformats-package.iepd+zip": {
        source: "iana",
        compressible: false
      },
      "application/vnd.ncd.control": {
        source: "iana"
      },
      "application/vnd.ncd.reference": {
        source: "iana"
      },
      "application/vnd.nearst.inv+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nebumind.line": {
        source: "iana"
      },
      "application/vnd.nervana": {
        source: "iana"
      },
      "application/vnd.netfpx": {
        source: "iana"
      },
      "application/vnd.neurolanguage.nlu": {
        source: "iana",
        extensions: ["nlu"]
      },
      "application/vnd.nimn": {
        source: "iana"
      },
      "application/vnd.nintendo.nitro.rom": {
        source: "iana"
      },
      "application/vnd.nintendo.snes.rom": {
        source: "iana"
      },
      "application/vnd.nitf": {
        source: "iana",
        extensions: ["ntf", "nitf"]
      },
      "application/vnd.noblenet-directory": {
        source: "iana",
        extensions: ["nnd"]
      },
      "application/vnd.noblenet-sealer": {
        source: "iana",
        extensions: ["nns"]
      },
      "application/vnd.noblenet-web": {
        source: "iana",
        extensions: ["nnw"]
      },
      "application/vnd.nokia.catalogs": {
        source: "iana"
      },
      "application/vnd.nokia.conml+wbxml": {
        source: "iana"
      },
      "application/vnd.nokia.conml+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.iptv.config+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.isds-radio-presets": {
        source: "iana"
      },
      "application/vnd.nokia.landmark+wbxml": {
        source: "iana"
      },
      "application/vnd.nokia.landmark+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.landmarkcollection+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.n-gage.ac+xml": {
        source: "iana",
        compressible: true,
        extensions: ["ac"]
      },
      "application/vnd.nokia.n-gage.data": {
        source: "iana",
        extensions: ["ngdat"]
      },
      "application/vnd.nokia.n-gage.symbian.install": {
        source: "apache",
        extensions: ["n-gage"]
      },
      "application/vnd.nokia.ncd": {
        source: "iana"
      },
      "application/vnd.nokia.pcd+wbxml": {
        source: "iana"
      },
      "application/vnd.nokia.pcd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.nokia.radio-preset": {
        source: "iana",
        extensions: ["rpst"]
      },
      "application/vnd.nokia.radio-presets": {
        source: "iana",
        extensions: ["rpss"]
      },
      "application/vnd.novadigm.edm": {
        source: "iana",
        extensions: ["edm"]
      },
      "application/vnd.novadigm.edx": {
        source: "iana",
        extensions: ["edx"]
      },
      "application/vnd.novadigm.ext": {
        source: "iana",
        extensions: ["ext"]
      },
      "application/vnd.ntt-local.content-share": {
        source: "iana"
      },
      "application/vnd.ntt-local.file-transfer": {
        source: "iana"
      },
      "application/vnd.ntt-local.ogw_remote-access": {
        source: "iana"
      },
      "application/vnd.ntt-local.sip-ta_remote": {
        source: "iana"
      },
      "application/vnd.ntt-local.sip-ta_tcp_stream": {
        source: "iana"
      },
      "application/vnd.oai.workflows": {
        source: "iana"
      },
      "application/vnd.oai.workflows+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oai.workflows+yaml": {
        source: "iana"
      },
      "application/vnd.oasis.opendocument.base": {
        source: "iana"
      },
      "application/vnd.oasis.opendocument.chart": {
        source: "iana",
        extensions: ["odc"]
      },
      "application/vnd.oasis.opendocument.chart-template": {
        source: "iana",
        extensions: ["otc"]
      },
      "application/vnd.oasis.opendocument.database": {
        source: "apache",
        extensions: ["odb"]
      },
      "application/vnd.oasis.opendocument.formula": {
        source: "iana",
        extensions: ["odf"]
      },
      "application/vnd.oasis.opendocument.formula-template": {
        source: "iana",
        extensions: ["odft"]
      },
      "application/vnd.oasis.opendocument.graphics": {
        source: "iana",
        compressible: false,
        extensions: ["odg"]
      },
      "application/vnd.oasis.opendocument.graphics-template": {
        source: "iana",
        extensions: ["otg"]
      },
      "application/vnd.oasis.opendocument.image": {
        source: "iana",
        extensions: ["odi"]
      },
      "application/vnd.oasis.opendocument.image-template": {
        source: "iana",
        extensions: ["oti"]
      },
      "application/vnd.oasis.opendocument.presentation": {
        source: "iana",
        compressible: false,
        extensions: ["odp"]
      },
      "application/vnd.oasis.opendocument.presentation-template": {
        source: "iana",
        extensions: ["otp"]
      },
      "application/vnd.oasis.opendocument.spreadsheet": {
        source: "iana",
        compressible: false,
        extensions: ["ods"]
      },
      "application/vnd.oasis.opendocument.spreadsheet-template": {
        source: "iana",
        extensions: ["ots"]
      },
      "application/vnd.oasis.opendocument.text": {
        source: "iana",
        compressible: false,
        extensions: ["odt"]
      },
      "application/vnd.oasis.opendocument.text-master": {
        source: "iana",
        extensions: ["odm"]
      },
      "application/vnd.oasis.opendocument.text-master-template": {
        source: "iana"
      },
      "application/vnd.oasis.opendocument.text-template": {
        source: "iana",
        extensions: ["ott"]
      },
      "application/vnd.oasis.opendocument.text-web": {
        source: "iana",
        extensions: ["oth"]
      },
      "application/vnd.obn": {
        source: "iana"
      },
      "application/vnd.ocf+cbor": {
        source: "iana"
      },
      "application/vnd.oci.image.manifest.v1+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oftn.l10n+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.contentaccessdownload+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.contentaccessstreaming+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.cspg-hexbinary": {
        source: "iana"
      },
      "application/vnd.oipf.dae.svg+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.dae.xhtml+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.mippvcontrolmessage+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.pae.gem": {
        source: "iana"
      },
      "application/vnd.oipf.spdiscovery+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.spdlist+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.ueprofile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oipf.userprofile+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.olpc-sugar": {
        source: "iana",
        extensions: ["xo"]
      },
      "application/vnd.oma-scws-config": {
        source: "iana"
      },
      "application/vnd.oma-scws-http-request": {
        source: "iana"
      },
      "application/vnd.oma-scws-http-response": {
        source: "iana"
      },
      "application/vnd.oma.bcast.associated-procedure-parameter+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.drm-trigger+xml": {
        source: "apache",
        compressible: true
      },
      "application/vnd.oma.bcast.imd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.ltkm": {
        source: "iana"
      },
      "application/vnd.oma.bcast.notification+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.provisioningtrigger": {
        source: "iana"
      },
      "application/vnd.oma.bcast.sgboot": {
        source: "iana"
      },
      "application/vnd.oma.bcast.sgdd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.sgdu": {
        source: "iana"
      },
      "application/vnd.oma.bcast.simple-symbol-container": {
        source: "iana"
      },
      "application/vnd.oma.bcast.smartcard-trigger+xml": {
        source: "apache",
        compressible: true
      },
      "application/vnd.oma.bcast.sprov+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.bcast.stkm": {
        source: "iana"
      },
      "application/vnd.oma.cab-address-book+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.cab-feature-handler+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.cab-pcc+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.cab-subs-invite+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.cab-user-prefs+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.dcd": {
        source: "iana"
      },
      "application/vnd.oma.dcdc": {
        source: "iana"
      },
      "application/vnd.oma.dd2+xml": {
        source: "iana",
        compressible: true,
        extensions: ["dd2"]
      },
      "application/vnd.oma.drm.risd+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.group-usage-list+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.lwm2m+cbor": {
        source: "iana"
      },
      "application/vnd.oma.lwm2m+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.lwm2m+tlv": {
        source: "iana"
      },
      "application/vnd.oma.pal+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.detailed-progress-report+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.final-report+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.groups+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.invocation-descriptor+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.poc.optimized-progress-report+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.push": {
        source: "iana"
      },
      "application/vnd.oma.scidm.messages+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oma.xcap-directory+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.omads-email+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.omads-file+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.omads-folder+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.omaloc-supl-init": {
        source: "iana"
      },
      "application/vnd.onepager": {
        source: "iana"
      },
      "application/vnd.onepagertamp": {
        source: "iana"
      },
      "application/vnd.onepagertamx": {
        source: "iana"
      },
      "application/vnd.onepagertat": {
        source: "iana"
      },
      "application/vnd.onepagertatp": {
        source: "iana"
      },
      "application/vnd.onepagertatx": {
        source: "iana"
      },
      "application/vnd.onvif.metadata": {
        source: "iana"
      },
      "application/vnd.openblox.game+xml": {
        source: "iana",
        compressible: true,
        extensions: ["obgx"]
      },
      "application/vnd.openblox.game-binary": {
        source: "iana"
      },
      "application/vnd.openeye.oeb": {
        source: "iana"
      },
      "application/vnd.openofficeorg.extension": {
        source: "apache",
        extensions: ["oxt"]
      },
      "application/vnd.openstreetmap.data+xml": {
        source: "iana",
        compressible: true,
        extensions: ["osm"]
      },
      "application/vnd.opentimestamps.ots": {
        source: "iana"
      },
      "application/vnd.openxmlformats-officedocument.custom-properties+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawing+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.extended-properties+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
        source: "iana",
        compressible: false,
        extensions: ["pptx"]
      },
      "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slide": {
        source: "iana",
        extensions: ["sldx"]
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
        source: "iana",
        extensions: ["ppsx"]
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.template": {
        source: "iana",
        extensions: ["potx"]
      },
      "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
        source: "iana",
        compressible: false,
        extensions: ["xlsx"]
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
        source: "iana",
        extensions: ["xltx"]
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.theme+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.themeoverride+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.vmldrawing": {
        source: "iana"
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
        source: "iana",
        compressible: false,
        extensions: ["docx"]
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
        source: "iana",
        extensions: ["dotx"]
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-package.core-properties+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.openxmlformats-package.relationships+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oracle.resource+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.orange.indata": {
        source: "iana"
      },
      "application/vnd.osa.netdeploy": {
        source: "iana"
      },
      "application/vnd.osgeo.mapguide.package": {
        source: "iana",
        extensions: ["mgp"]
      },
      "application/vnd.osgi.bundle": {
        source: "iana"
      },
      "application/vnd.osgi.dp": {
        source: "iana",
        extensions: ["dp"]
      },
      "application/vnd.osgi.subsystem": {
        source: "iana",
        extensions: ["esa"]
      },
      "application/vnd.otps.ct-kip+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.oxli.countgraph": {
        source: "iana"
      },
      "application/vnd.pagerduty+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.palm": {
        source: "iana",
        extensions: ["pdb", "pqa", "oprc"]
      },
      "application/vnd.panoply": {
        source: "iana"
      },
      "application/vnd.paos.xml": {
        source: "iana"
      },
      "application/vnd.patentdive": {
        source: "iana"
      },
      "application/vnd.patientecommsdoc": {
        source: "iana"
      },
      "application/vnd.pawaafile": {
        source: "iana",
        extensions: ["paw"]
      },
      "application/vnd.pcos": {
        source: "iana"
      },
      "application/vnd.pg.format": {
        source: "iana",
        extensions: ["str"]
      },
      "application/vnd.pg.osasli": {
        source: "iana",
        extensions: ["ei6"]
      },
      "application/vnd.piaccess.application-licence": {
        source: "iana"
      },
      "application/vnd.picsel": {
        source: "iana",
        extensions: ["efif"]
      },
      "application/vnd.pmi.widget": {
        source: "iana",
        extensions: ["wg"]
      },
      "application/vnd.poc.group-advertisement+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.pocketlearn": {
        source: "iana",
        extensions: ["plf"]
      },
      "application/vnd.powerbuilder6": {
        source: "iana",
        extensions: ["pbd"]
      },
      "application/vnd.powerbuilder6-s": {
        source: "iana"
      },
      "application/vnd.powerbuilder7": {
        source: "iana"
      },
      "application/vnd.powerbuilder7-s": {
        source: "iana"
      },
      "application/vnd.powerbuilder75": {
        source: "iana"
      },
      "application/vnd.powerbuilder75-s": {
        source: "iana"
      },
      "application/vnd.preminet": {
        source: "iana"
      },
      "application/vnd.previewsystems.box": {
        source: "iana",
        extensions: ["box"]
      },
      "application/vnd.proteus.magazine": {
        source: "iana",
        extensions: ["mgz"]
      },
      "application/vnd.psfs": {
        source: "iana"
      },
      "application/vnd.pt.mundusmundi": {
        source: "iana"
      },
      "application/vnd.publishare-delta-tree": {
        source: "iana",
        extensions: ["qps"]
      },
      "application/vnd.pvi.ptid1": {
        source: "iana",
        extensions: ["ptid"]
      },
      "application/vnd.pwg-multiplexed": {
        source: "iana"
      },
      "application/vnd.pwg-xhtml-print+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xhtm"]
      },
      "application/vnd.qualcomm.brew-app-res": {
        source: "iana"
      },
      "application/vnd.quarantainenet": {
        source: "iana"
      },
      "application/vnd.quark.quarkxpress": {
        source: "iana",
        extensions: ["qxd", "qxt", "qwd", "qwt", "qxl", "qxb"]
      },
      "application/vnd.quobject-quoxdocument": {
        source: "iana"
      },
      "application/vnd.radisys.moml+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit-conf+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit-conn+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit-dialog+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-audit-stream+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-conf+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-base+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-fax-detect+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-group+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-speech+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.radisys.msml-dialog-transform+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.rainstor.data": {
        source: "iana"
      },
      "application/vnd.rapid": {
        source: "iana"
      },
      "application/vnd.rar": {
        source: "iana",
        extensions: ["rar"]
      },
      "application/vnd.realvnc.bed": {
        source: "iana",
        extensions: ["bed"]
      },
      "application/vnd.recordare.musicxml": {
        source: "iana",
        extensions: ["mxl"]
      },
      "application/vnd.recordare.musicxml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["musicxml"]
      },
      "application/vnd.relpipe": {
        source: "iana"
      },
      "application/vnd.renlearn.rlprint": {
        source: "iana"
      },
      "application/vnd.resilient.logic": {
        source: "iana"
      },
      "application/vnd.restful+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.rig.cryptonote": {
        source: "iana",
        extensions: ["cryptonote"]
      },
      "application/vnd.rim.cod": {
        source: "apache",
        extensions: ["cod"]
      },
      "application/vnd.rn-realmedia": {
        source: "apache",
        extensions: ["rm"]
      },
      "application/vnd.rn-realmedia-vbr": {
        source: "apache",
        extensions: ["rmvb"]
      },
      "application/vnd.route66.link66+xml": {
        source: "iana",
        compressible: true,
        extensions: ["link66"]
      },
      "application/vnd.rs-274x": {
        source: "iana"
      },
      "application/vnd.ruckus.download": {
        source: "iana"
      },
      "application/vnd.s3sms": {
        source: "iana"
      },
      "application/vnd.sailingtracker.track": {
        source: "iana",
        extensions: ["st"]
      },
      "application/vnd.sar": {
        source: "iana"
      },
      "application/vnd.sbm.cid": {
        source: "iana"
      },
      "application/vnd.sbm.mid2": {
        source: "iana"
      },
      "application/vnd.scribus": {
        source: "iana"
      },
      "application/vnd.sealed.3df": {
        source: "iana"
      },
      "application/vnd.sealed.csf": {
        source: "iana"
      },
      "application/vnd.sealed.doc": {
        source: "iana"
      },
      "application/vnd.sealed.eml": {
        source: "iana"
      },
      "application/vnd.sealed.mht": {
        source: "iana"
      },
      "application/vnd.sealed.net": {
        source: "iana"
      },
      "application/vnd.sealed.ppt": {
        source: "iana"
      },
      "application/vnd.sealed.tiff": {
        source: "iana"
      },
      "application/vnd.sealed.xls": {
        source: "iana"
      },
      "application/vnd.sealedmedia.softseal.html": {
        source: "iana"
      },
      "application/vnd.sealedmedia.softseal.pdf": {
        source: "iana"
      },
      "application/vnd.seemail": {
        source: "iana",
        extensions: ["see"]
      },
      "application/vnd.seis+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.sema": {
        source: "iana",
        extensions: ["sema"]
      },
      "application/vnd.semd": {
        source: "iana",
        extensions: ["semd"]
      },
      "application/vnd.semf": {
        source: "iana",
        extensions: ["semf"]
      },
      "application/vnd.shade-save-file": {
        source: "iana"
      },
      "application/vnd.shana.informed.formdata": {
        source: "iana",
        extensions: ["ifm"]
      },
      "application/vnd.shana.informed.formtemplate": {
        source: "iana",
        extensions: ["itp"]
      },
      "application/vnd.shana.informed.interchange": {
        source: "iana",
        extensions: ["iif"]
      },
      "application/vnd.shana.informed.package": {
        source: "iana",
        extensions: ["ipk"]
      },
      "application/vnd.shootproof+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.shopkick+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.shp": {
        source: "iana"
      },
      "application/vnd.shx": {
        source: "iana"
      },
      "application/vnd.sigrok.session": {
        source: "iana"
      },
      "application/vnd.simtech-mindmapper": {
        source: "iana",
        extensions: ["twd", "twds"]
      },
      "application/vnd.siren+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.smaf": {
        source: "iana",
        extensions: ["mmf"]
      },
      "application/vnd.smart.notebook": {
        source: "iana"
      },
      "application/vnd.smart.teacher": {
        source: "iana",
        extensions: ["teacher"]
      },
      "application/vnd.smintio.portals.archive": {
        source: "iana"
      },
      "application/vnd.snesdev-page-table": {
        source: "iana"
      },
      "application/vnd.software602.filler.form+xml": {
        source: "iana",
        compressible: true,
        extensions: ["fo"]
      },
      "application/vnd.software602.filler.form-xml-zip": {
        source: "iana"
      },
      "application/vnd.solent.sdkm+xml": {
        source: "iana",
        compressible: true,
        extensions: ["sdkm", "sdkd"]
      },
      "application/vnd.spotfire.dxp": {
        source: "iana",
        extensions: ["dxp"]
      },
      "application/vnd.spotfire.sfs": {
        source: "iana",
        extensions: ["sfs"]
      },
      "application/vnd.sqlite3": {
        source: "iana"
      },
      "application/vnd.sss-cod": {
        source: "iana"
      },
      "application/vnd.sss-dtf": {
        source: "iana"
      },
      "application/vnd.sss-ntf": {
        source: "iana"
      },
      "application/vnd.stardivision.calc": {
        source: "apache",
        extensions: ["sdc"]
      },
      "application/vnd.stardivision.draw": {
        source: "apache",
        extensions: ["sda"]
      },
      "application/vnd.stardivision.impress": {
        source: "apache",
        extensions: ["sdd"]
      },
      "application/vnd.stardivision.math": {
        source: "apache",
        extensions: ["smf"]
      },
      "application/vnd.stardivision.writer": {
        source: "apache",
        extensions: ["sdw", "vor"]
      },
      "application/vnd.stardivision.writer-global": {
        source: "apache",
        extensions: ["sgl"]
      },
      "application/vnd.stepmania.package": {
        source: "iana",
        extensions: ["smzip"]
      },
      "application/vnd.stepmania.stepchart": {
        source: "iana",
        extensions: ["sm"]
      },
      "application/vnd.street-stream": {
        source: "iana"
      },
      "application/vnd.sun.wadl+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wadl"]
      },
      "application/vnd.sun.xml.calc": {
        source: "apache",
        extensions: ["sxc"]
      },
      "application/vnd.sun.xml.calc.template": {
        source: "apache",
        extensions: ["stc"]
      },
      "application/vnd.sun.xml.draw": {
        source: "apache",
        extensions: ["sxd"]
      },
      "application/vnd.sun.xml.draw.template": {
        source: "apache",
        extensions: ["std"]
      },
      "application/vnd.sun.xml.impress": {
        source: "apache",
        extensions: ["sxi"]
      },
      "application/vnd.sun.xml.impress.template": {
        source: "apache",
        extensions: ["sti"]
      },
      "application/vnd.sun.xml.math": {
        source: "apache",
        extensions: ["sxm"]
      },
      "application/vnd.sun.xml.writer": {
        source: "apache",
        extensions: ["sxw"]
      },
      "application/vnd.sun.xml.writer.global": {
        source: "apache",
        extensions: ["sxg"]
      },
      "application/vnd.sun.xml.writer.template": {
        source: "apache",
        extensions: ["stw"]
      },
      "application/vnd.sus-calendar": {
        source: "iana",
        extensions: ["sus", "susp"]
      },
      "application/vnd.svd": {
        source: "iana",
        extensions: ["svd"]
      },
      "application/vnd.swiftview-ics": {
        source: "iana"
      },
      "application/vnd.sybyl.mol2": {
        source: "iana"
      },
      "application/vnd.sycle+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.syft+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.symbian.install": {
        source: "apache",
        extensions: ["sis", "sisx"]
      },
      "application/vnd.syncml+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["xsm"]
      },
      "application/vnd.syncml.dm+wbxml": {
        source: "iana",
        charset: "UTF-8",
        extensions: ["bdm"]
      },
      "application/vnd.syncml.dm+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["xdm"]
      },
      "application/vnd.syncml.dm.notification": {
        source: "iana"
      },
      "application/vnd.syncml.dmddf+wbxml": {
        source: "iana"
      },
      "application/vnd.syncml.dmddf+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["ddf"]
      },
      "application/vnd.syncml.dmtnds+wbxml": {
        source: "iana"
      },
      "application/vnd.syncml.dmtnds+xml": {
        source: "iana",
        charset: "UTF-8",
        compressible: true
      },
      "application/vnd.syncml.ds.notification": {
        source: "iana"
      },
      "application/vnd.tableschema+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.tao.intent-module-archive": {
        source: "iana",
        extensions: ["tao"]
      },
      "application/vnd.tcpdump.pcap": {
        source: "iana",
        extensions: ["pcap", "cap", "dmp"]
      },
      "application/vnd.think-cell.ppttc+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.tmd.mediaflex.api+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.tml": {
        source: "iana"
      },
      "application/vnd.tmobile-livetv": {
        source: "iana",
        extensions: ["tmo"]
      },
      "application/vnd.tri.onesource": {
        source: "iana"
      },
      "application/vnd.trid.tpt": {
        source: "iana",
        extensions: ["tpt"]
      },
      "application/vnd.triscape.mxs": {
        source: "iana",
        extensions: ["mxs"]
      },
      "application/vnd.trueapp": {
        source: "iana",
        extensions: ["tra"]
      },
      "application/vnd.truedoc": {
        source: "iana"
      },
      "application/vnd.ubisoft.webplayer": {
        source: "iana"
      },
      "application/vnd.ufdl": {
        source: "iana",
        extensions: ["ufd", "ufdl"]
      },
      "application/vnd.uiq.theme": {
        source: "iana",
        extensions: ["utz"]
      },
      "application/vnd.umajin": {
        source: "iana",
        extensions: ["umj"]
      },
      "application/vnd.unity": {
        source: "iana",
        extensions: ["unityweb"]
      },
      "application/vnd.uoml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["uoml", "uo"]
      },
      "application/vnd.uplanet.alert": {
        source: "iana"
      },
      "application/vnd.uplanet.alert-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.bearer-choice": {
        source: "iana"
      },
      "application/vnd.uplanet.bearer-choice-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.cacheop": {
        source: "iana"
      },
      "application/vnd.uplanet.cacheop-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.channel": {
        source: "iana"
      },
      "application/vnd.uplanet.channel-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.list": {
        source: "iana"
      },
      "application/vnd.uplanet.list-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.listcmd": {
        source: "iana"
      },
      "application/vnd.uplanet.listcmd-wbxml": {
        source: "iana"
      },
      "application/vnd.uplanet.signal": {
        source: "iana"
      },
      "application/vnd.uri-map": {
        source: "iana"
      },
      "application/vnd.valve.source.material": {
        source: "iana"
      },
      "application/vnd.vcx": {
        source: "iana",
        extensions: ["vcx"]
      },
      "application/vnd.vd-study": {
        source: "iana"
      },
      "application/vnd.vectorworks": {
        source: "iana"
      },
      "application/vnd.vel+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.verimatrix.vcas": {
        source: "iana"
      },
      "application/vnd.veritone.aion+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.veryant.thin": {
        source: "iana"
      },
      "application/vnd.ves.encrypted": {
        source: "iana"
      },
      "application/vnd.vidsoft.vidconference": {
        source: "iana"
      },
      "application/vnd.visio": {
        source: "iana",
        extensions: ["vsd", "vst", "vss", "vsw"]
      },
      "application/vnd.visionary": {
        source: "iana",
        extensions: ["vis"]
      },
      "application/vnd.vividence.scriptfile": {
        source: "iana"
      },
      "application/vnd.vsf": {
        source: "iana",
        extensions: ["vsf"]
      },
      "application/vnd.wap.sic": {
        source: "iana"
      },
      "application/vnd.wap.slc": {
        source: "iana"
      },
      "application/vnd.wap.wbxml": {
        source: "iana",
        charset: "UTF-8",
        extensions: ["wbxml"]
      },
      "application/vnd.wap.wmlc": {
        source: "iana",
        extensions: ["wmlc"]
      },
      "application/vnd.wap.wmlscriptc": {
        source: "iana",
        extensions: ["wmlsc"]
      },
      "application/vnd.wasmflow.wafl": {
        source: "iana"
      },
      "application/vnd.webturbo": {
        source: "iana",
        extensions: ["wtb"]
      },
      "application/vnd.wfa.dpp": {
        source: "iana"
      },
      "application/vnd.wfa.p2p": {
        source: "iana"
      },
      "application/vnd.wfa.wsc": {
        source: "iana"
      },
      "application/vnd.windows.devicepairing": {
        source: "iana"
      },
      "application/vnd.wmc": {
        source: "iana"
      },
      "application/vnd.wmf.bootstrap": {
        source: "iana"
      },
      "application/vnd.wolfram.mathematica": {
        source: "iana"
      },
      "application/vnd.wolfram.mathematica.package": {
        source: "iana"
      },
      "application/vnd.wolfram.player": {
        source: "iana",
        extensions: ["nbp"]
      },
      "application/vnd.wordlift": {
        source: "iana"
      },
      "application/vnd.wordperfect": {
        source: "iana",
        extensions: ["wpd"]
      },
      "application/vnd.wqd": {
        source: "iana",
        extensions: ["wqd"]
      },
      "application/vnd.wrq-hp3000-labelled": {
        source: "iana"
      },
      "application/vnd.wt.stf": {
        source: "iana",
        extensions: ["stf"]
      },
      "application/vnd.wv.csp+wbxml": {
        source: "iana"
      },
      "application/vnd.wv.csp+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.wv.ssp+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.xacml+json": {
        source: "iana",
        compressible: true
      },
      "application/vnd.xara": {
        source: "iana",
        extensions: ["xar"]
      },
      "application/vnd.xecrets-encrypted": {
        source: "iana"
      },
      "application/vnd.xfdl": {
        source: "iana",
        extensions: ["xfdl"]
      },
      "application/vnd.xfdl.webform": {
        source: "iana"
      },
      "application/vnd.xmi+xml": {
        source: "iana",
        compressible: true
      },
      "application/vnd.xmpie.cpkg": {
        source: "iana"
      },
      "application/vnd.xmpie.dpkg": {
        source: "iana"
      },
      "application/vnd.xmpie.plan": {
        source: "iana"
      },
      "application/vnd.xmpie.ppkg": {
        source: "iana"
      },
      "application/vnd.xmpie.xlim": {
        source: "iana"
      },
      "application/vnd.yamaha.hv-dic": {
        source: "iana",
        extensions: ["hvd"]
      },
      "application/vnd.yamaha.hv-script": {
        source: "iana",
        extensions: ["hvs"]
      },
      "application/vnd.yamaha.hv-voice": {
        source: "iana",
        extensions: ["hvp"]
      },
      "application/vnd.yamaha.openscoreformat": {
        source: "iana",
        extensions: ["osf"]
      },
      "application/vnd.yamaha.openscoreformat.osfpvg+xml": {
        source: "iana",
        compressible: true,
        extensions: ["osfpvg"]
      },
      "application/vnd.yamaha.remote-setup": {
        source: "iana"
      },
      "application/vnd.yamaha.smaf-audio": {
        source: "iana",
        extensions: ["saf"]
      },
      "application/vnd.yamaha.smaf-phrase": {
        source: "iana",
        extensions: ["spf"]
      },
      "application/vnd.yamaha.through-ngn": {
        source: "iana"
      },
      "application/vnd.yamaha.tunnel-udpencap": {
        source: "iana"
      },
      "application/vnd.yaoweme": {
        source: "iana"
      },
      "application/vnd.yellowriver-custom-menu": {
        source: "iana",
        extensions: ["cmp"]
      },
      "application/vnd.zul": {
        source: "iana",
        extensions: ["zir", "zirz"]
      },
      "application/vnd.zzazz.deck+xml": {
        source: "iana",
        compressible: true,
        extensions: ["zaz"]
      },
      "application/voicexml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["vxml"]
      },
      "application/voucher-cms+json": {
        source: "iana",
        compressible: true
      },
      "application/vp": {
        source: "iana"
      },
      "application/vq-rtcpxr": {
        source: "iana"
      },
      "application/wasm": {
        source: "iana",
        compressible: true,
        extensions: ["wasm"]
      },
      "application/watcherinfo+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wif"]
      },
      "application/webpush-options+json": {
        source: "iana",
        compressible: true
      },
      "application/whoispp-query": {
        source: "iana"
      },
      "application/whoispp-response": {
        source: "iana"
      },
      "application/widget": {
        source: "iana",
        extensions: ["wgt"]
      },
      "application/winhlp": {
        source: "apache",
        extensions: ["hlp"]
      },
      "application/wita": {
        source: "iana"
      },
      "application/wordperfect5.1": {
        source: "iana"
      },
      "application/wsdl+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wsdl"]
      },
      "application/wspolicy+xml": {
        source: "iana",
        compressible: true,
        extensions: ["wspolicy"]
      },
      "application/x-7z-compressed": {
        source: "apache",
        compressible: false,
        extensions: ["7z"]
      },
      "application/x-abiword": {
        source: "apache",
        extensions: ["abw"]
      },
      "application/x-ace-compressed": {
        source: "apache",
        extensions: ["ace"]
      },
      "application/x-amf": {
        source: "apache"
      },
      "application/x-apple-diskimage": {
        source: "apache",
        extensions: ["dmg"]
      },
      "application/x-arj": {
        compressible: false,
        extensions: ["arj"]
      },
      "application/x-authorware-bin": {
        source: "apache",
        extensions: ["aab", "x32", "u32", "vox"]
      },
      "application/x-authorware-map": {
        source: "apache",
        extensions: ["aam"]
      },
      "application/x-authorware-seg": {
        source: "apache",
        extensions: ["aas"]
      },
      "application/x-bcpio": {
        source: "apache",
        extensions: ["bcpio"]
      },
      "application/x-bdoc": {
        compressible: false,
        extensions: ["bdoc"]
      },
      "application/x-bittorrent": {
        source: "apache",
        extensions: ["torrent"]
      },
      "application/x-blorb": {
        source: "apache",
        extensions: ["blb", "blorb"]
      },
      "application/x-bzip": {
        source: "apache",
        compressible: false,
        extensions: ["bz"]
      },
      "application/x-bzip2": {
        source: "apache",
        compressible: false,
        extensions: ["bz2", "boz"]
      },
      "application/x-cbr": {
        source: "apache",
        extensions: ["cbr", "cba", "cbt", "cbz", "cb7"]
      },
      "application/x-cdlink": {
        source: "apache",
        extensions: ["vcd"]
      },
      "application/x-cfs-compressed": {
        source: "apache",
        extensions: ["cfs"]
      },
      "application/x-chat": {
        source: "apache",
        extensions: ["chat"]
      },
      "application/x-chess-pgn": {
        source: "apache",
        extensions: ["pgn"]
      },
      "application/x-chrome-extension": {
        extensions: ["crx"]
      },
      "application/x-cocoa": {
        source: "nginx",
        extensions: ["cco"]
      },
      "application/x-compress": {
        source: "apache"
      },
      "application/x-conference": {
        source: "apache",
        extensions: ["nsc"]
      },
      "application/x-cpio": {
        source: "apache",
        extensions: ["cpio"]
      },
      "application/x-csh": {
        source: "apache",
        extensions: ["csh"]
      },
      "application/x-deb": {
        compressible: false
      },
      "application/x-debian-package": {
        source: "apache",
        extensions: ["deb", "udeb"]
      },
      "application/x-dgc-compressed": {
        source: "apache",
        extensions: ["dgc"]
      },
      "application/x-director": {
        source: "apache",
        extensions: ["dir", "dcr", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa"]
      },
      "application/x-doom": {
        source: "apache",
        extensions: ["wad"]
      },
      "application/x-dtbncx+xml": {
        source: "apache",
        compressible: true,
        extensions: ["ncx"]
      },
      "application/x-dtbook+xml": {
        source: "apache",
        compressible: true,
        extensions: ["dtb"]
      },
      "application/x-dtbresource+xml": {
        source: "apache",
        compressible: true,
        extensions: ["res"]
      },
      "application/x-dvi": {
        source: "apache",
        compressible: false,
        extensions: ["dvi"]
      },
      "application/x-envoy": {
        source: "apache",
        extensions: ["evy"]
      },
      "application/x-eva": {
        source: "apache",
        extensions: ["eva"]
      },
      "application/x-font-bdf": {
        source: "apache",
        extensions: ["bdf"]
      },
      "application/x-font-dos": {
        source: "apache"
      },
      "application/x-font-framemaker": {
        source: "apache"
      },
      "application/x-font-ghostscript": {
        source: "apache",
        extensions: ["gsf"]
      },
      "application/x-font-libgrx": {
        source: "apache"
      },
      "application/x-font-linux-psf": {
        source: "apache",
        extensions: ["psf"]
      },
      "application/x-font-pcf": {
        source: "apache",
        extensions: ["pcf"]
      },
      "application/x-font-snf": {
        source: "apache",
        extensions: ["snf"]
      },
      "application/x-font-speedo": {
        source: "apache"
      },
      "application/x-font-sunos-news": {
        source: "apache"
      },
      "application/x-font-type1": {
        source: "apache",
        extensions: ["pfa", "pfb", "pfm", "afm"]
      },
      "application/x-font-vfont": {
        source: "apache"
      },
      "application/x-freearc": {
        source: "apache",
        extensions: ["arc"]
      },
      "application/x-futuresplash": {
        source: "apache",
        extensions: ["spl"]
      },
      "application/x-gca-compressed": {
        source: "apache",
        extensions: ["gca"]
      },
      "application/x-glulx": {
        source: "apache",
        extensions: ["ulx"]
      },
      "application/x-gnumeric": {
        source: "apache",
        extensions: ["gnumeric"]
      },
      "application/x-gramps-xml": {
        source: "apache",
        extensions: ["gramps"]
      },
      "application/x-gtar": {
        source: "apache",
        extensions: ["gtar"]
      },
      "application/x-gzip": {
        source: "apache"
      },
      "application/x-hdf": {
        source: "apache",
        extensions: ["hdf"]
      },
      "application/x-httpd-php": {
        compressible: true,
        extensions: ["php"]
      },
      "application/x-install-instructions": {
        source: "apache",
        extensions: ["install"]
      },
      "application/x-iso9660-image": {
        source: "apache",
        extensions: ["iso"]
      },
      "application/x-iwork-keynote-sffkey": {
        extensions: ["key"]
      },
      "application/x-iwork-numbers-sffnumbers": {
        extensions: ["numbers"]
      },
      "application/x-iwork-pages-sffpages": {
        extensions: ["pages"]
      },
      "application/x-java-archive-diff": {
        source: "nginx",
        extensions: ["jardiff"]
      },
      "application/x-java-jnlp-file": {
        source: "apache",
        compressible: false,
        extensions: ["jnlp"]
      },
      "application/x-javascript": {
        compressible: true
      },
      "application/x-keepass2": {
        extensions: ["kdbx"]
      },
      "application/x-latex": {
        source: "apache",
        compressible: false,
        extensions: ["latex"]
      },
      "application/x-lua-bytecode": {
        extensions: ["luac"]
      },
      "application/x-lzh-compressed": {
        source: "apache",
        extensions: ["lzh", "lha"]
      },
      "application/x-makeself": {
        source: "nginx",
        extensions: ["run"]
      },
      "application/x-mie": {
        source: "apache",
        extensions: ["mie"]
      },
      "application/x-mobipocket-ebook": {
        source: "apache",
        extensions: ["prc", "mobi"]
      },
      "application/x-mpegurl": {
        compressible: false
      },
      "application/x-ms-application": {
        source: "apache",
        extensions: ["application"]
      },
      "application/x-ms-shortcut": {
        source: "apache",
        extensions: ["lnk"]
      },
      "application/x-ms-wmd": {
        source: "apache",
        extensions: ["wmd"]
      },
      "application/x-ms-wmz": {
        source: "apache",
        extensions: ["wmz"]
      },
      "application/x-ms-xbap": {
        source: "apache",
        extensions: ["xbap"]
      },
      "application/x-msaccess": {
        source: "apache",
        extensions: ["mdb"]
      },
      "application/x-msbinder": {
        source: "apache",
        extensions: ["obd"]
      },
      "application/x-mscardfile": {
        source: "apache",
        extensions: ["crd"]
      },
      "application/x-msclip": {
        source: "apache",
        extensions: ["clp"]
      },
      "application/x-msdos-program": {
        extensions: ["exe"]
      },
      "application/x-msdownload": {
        source: "apache",
        extensions: ["exe", "dll", "com", "bat", "msi"]
      },
      "application/x-msmediaview": {
        source: "apache",
        extensions: ["mvb", "m13", "m14"]
      },
      "application/x-msmetafile": {
        source: "apache",
        extensions: ["wmf", "wmz", "emf", "emz"]
      },
      "application/x-msmoney": {
        source: "apache",
        extensions: ["mny"]
      },
      "application/x-mspublisher": {
        source: "apache",
        extensions: ["pub"]
      },
      "application/x-msschedule": {
        source: "apache",
        extensions: ["scd"]
      },
      "application/x-msterminal": {
        source: "apache",
        extensions: ["trm"]
      },
      "application/x-mswrite": {
        source: "apache",
        extensions: ["wri"]
      },
      "application/x-netcdf": {
        source: "apache",
        extensions: ["nc", "cdf"]
      },
      "application/x-ns-proxy-autoconfig": {
        compressible: true,
        extensions: ["pac"]
      },
      "application/x-nzb": {
        source: "apache",
        extensions: ["nzb"]
      },
      "application/x-perl": {
        source: "nginx",
        extensions: ["pl", "pm"]
      },
      "application/x-pilot": {
        source: "nginx",
        extensions: ["prc", "pdb"]
      },
      "application/x-pkcs12": {
        source: "apache",
        compressible: false,
        extensions: ["p12", "pfx"]
      },
      "application/x-pkcs7-certificates": {
        source: "apache",
        extensions: ["p7b", "spc"]
      },
      "application/x-pkcs7-certreqresp": {
        source: "apache",
        extensions: ["p7r"]
      },
      "application/x-pki-message": {
        source: "iana"
      },
      "application/x-rar-compressed": {
        source: "apache",
        compressible: false,
        extensions: ["rar"]
      },
      "application/x-redhat-package-manager": {
        source: "nginx",
        extensions: ["rpm"]
      },
      "application/x-research-info-systems": {
        source: "apache",
        extensions: ["ris"]
      },
      "application/x-sea": {
        source: "nginx",
        extensions: ["sea"]
      },
      "application/x-sh": {
        source: "apache",
        compressible: true,
        extensions: ["sh"]
      },
      "application/x-shar": {
        source: "apache",
        extensions: ["shar"]
      },
      "application/x-shockwave-flash": {
        source: "apache",
        compressible: false,
        extensions: ["swf"]
      },
      "application/x-silverlight-app": {
        source: "apache",
        extensions: ["xap"]
      },
      "application/x-sql": {
        source: "apache",
        extensions: ["sql"]
      },
      "application/x-stuffit": {
        source: "apache",
        compressible: false,
        extensions: ["sit"]
      },
      "application/x-stuffitx": {
        source: "apache",
        extensions: ["sitx"]
      },
      "application/x-subrip": {
        source: "apache",
        extensions: ["srt"]
      },
      "application/x-sv4cpio": {
        source: "apache",
        extensions: ["sv4cpio"]
      },
      "application/x-sv4crc": {
        source: "apache",
        extensions: ["sv4crc"]
      },
      "application/x-t3vm-image": {
        source: "apache",
        extensions: ["t3"]
      },
      "application/x-tads": {
        source: "apache",
        extensions: ["gam"]
      },
      "application/x-tar": {
        source: "apache",
        compressible: true,
        extensions: ["tar"]
      },
      "application/x-tcl": {
        source: "apache",
        extensions: ["tcl", "tk"]
      },
      "application/x-tex": {
        source: "apache",
        extensions: ["tex"]
      },
      "application/x-tex-tfm": {
        source: "apache",
        extensions: ["tfm"]
      },
      "application/x-texinfo": {
        source: "apache",
        extensions: ["texinfo", "texi"]
      },
      "application/x-tgif": {
        source: "apache",
        extensions: ["obj"]
      },
      "application/x-ustar": {
        source: "apache",
        extensions: ["ustar"]
      },
      "application/x-virtualbox-hdd": {
        compressible: true,
        extensions: ["hdd"]
      },
      "application/x-virtualbox-ova": {
        compressible: true,
        extensions: ["ova"]
      },
      "application/x-virtualbox-ovf": {
        compressible: true,
        extensions: ["ovf"]
      },
      "application/x-virtualbox-vbox": {
        compressible: true,
        extensions: ["vbox"]
      },
      "application/x-virtualbox-vbox-extpack": {
        compressible: false,
        extensions: ["vbox-extpack"]
      },
      "application/x-virtualbox-vdi": {
        compressible: true,
        extensions: ["vdi"]
      },
      "application/x-virtualbox-vhd": {
        compressible: true,
        extensions: ["vhd"]
      },
      "application/x-virtualbox-vmdk": {
        compressible: true,
        extensions: ["vmdk"]
      },
      "application/x-wais-source": {
        source: "apache",
        extensions: ["src"]
      },
      "application/x-web-app-manifest+json": {
        compressible: true,
        extensions: ["webapp"]
      },
      "application/x-www-form-urlencoded": {
        source: "iana",
        compressible: true
      },
      "application/x-x509-ca-cert": {
        source: "iana",
        extensions: ["der", "crt", "pem"]
      },
      "application/x-x509-ca-ra-cert": {
        source: "iana"
      },
      "application/x-x509-next-ca-cert": {
        source: "iana"
      },
      "application/x-xfig": {
        source: "apache",
        extensions: ["fig"]
      },
      "application/x-xliff+xml": {
        source: "apache",
        compressible: true,
        extensions: ["xlf"]
      },
      "application/x-xpinstall": {
        source: "apache",
        compressible: false,
        extensions: ["xpi"]
      },
      "application/x-xz": {
        source: "apache",
        extensions: ["xz"]
      },
      "application/x-zmachine": {
        source: "apache",
        extensions: ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"]
      },
      "application/x400-bp": {
        source: "iana"
      },
      "application/xacml+xml": {
        source: "iana",
        compressible: true
      },
      "application/xaml+xml": {
        source: "apache",
        compressible: true,
        extensions: ["xaml"]
      },
      "application/xcap-att+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xav"]
      },
      "application/xcap-caps+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xca"]
      },
      "application/xcap-diff+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xdf"]
      },
      "application/xcap-el+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xel"]
      },
      "application/xcap-error+xml": {
        source: "iana",
        compressible: true
      },
      "application/xcap-ns+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xns"]
      },
      "application/xcon-conference-info+xml": {
        source: "iana",
        compressible: true
      },
      "application/xcon-conference-info-diff+xml": {
        source: "iana",
        compressible: true
      },
      "application/xenc+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xenc"]
      },
      "application/xfdf": {
        source: "iana",
        extensions: ["xfdf"]
      },
      "application/xhtml+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xhtml", "xht"]
      },
      "application/xhtml-voice+xml": {
        source: "apache",
        compressible: true
      },
      "application/xliff+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xlf"]
      },
      "application/xml": {
        source: "iana",
        compressible: true,
        extensions: ["xml", "xsl", "xsd", "rng"]
      },
      "application/xml-dtd": {
        source: "iana",
        compressible: true,
        extensions: ["dtd"]
      },
      "application/xml-external-parsed-entity": {
        source: "iana"
      },
      "application/xml-patch+xml": {
        source: "iana",
        compressible: true
      },
      "application/xmpp+xml": {
        source: "iana",
        compressible: true
      },
      "application/xop+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xop"]
      },
      "application/xproc+xml": {
        source: "apache",
        compressible: true,
        extensions: ["xpl"]
      },
      "application/xslt+xml": {
        source: "iana",
        compressible: true,
        extensions: ["xsl", "xslt"]
      },
      "application/xspf+xml": {
        source: "apache",
        compressible: true,
        extensions: ["xspf"]
      },
      "application/xv+xml": {
        source: "iana",
        compressible: true,
        extensions: ["mxml", "xhvml", "xvml", "xvm"]
      },
      "application/yaml": {
        source: "iana"
      },
      "application/yang": {
        source: "iana",
        extensions: ["yang"]
      },
      "application/yang-data+cbor": {
        source: "iana"
      },
      "application/yang-data+json": {
        source: "iana",
        compressible: true
      },
      "application/yang-data+xml": {
        source: "iana",
        compressible: true
      },
      "application/yang-patch+json": {
        source: "iana",
        compressible: true
      },
      "application/yang-patch+xml": {
        source: "iana",
        compressible: true
      },
      "application/yang-sid+json": {
        source: "iana",
        compressible: true
      },
      "application/yin+xml": {
        source: "iana",
        compressible: true,
        extensions: ["yin"]
      },
      "application/zip": {
        source: "iana",
        compressible: false,
        extensions: ["zip"]
      },
      "application/zlib": {
        source: "iana"
      },
      "application/zstd": {
        source: "iana"
      },
      "audio/1d-interleaved-parityfec": {
        source: "iana"
      },
      "audio/32kadpcm": {
        source: "iana"
      },
      "audio/3gpp": {
        source: "iana",
        compressible: false,
        extensions: ["3gpp"]
      },
      "audio/3gpp2": {
        source: "iana"
      },
      "audio/aac": {
        source: "iana",
        extensions: ["adts", "aac"]
      },
      "audio/ac3": {
        source: "iana"
      },
      "audio/adpcm": {
        source: "apache",
        extensions: ["adp"]
      },
      "audio/amr": {
        source: "iana",
        extensions: ["amr"]
      },
      "audio/amr-wb": {
        source: "iana"
      },
      "audio/amr-wb+": {
        source: "iana"
      },
      "audio/aptx": {
        source: "iana"
      },
      "audio/asc": {
        source: "iana"
      },
      "audio/atrac-advanced-lossless": {
        source: "iana"
      },
      "audio/atrac-x": {
        source: "iana"
      },
      "audio/atrac3": {
        source: "iana"
      },
      "audio/basic": {
        source: "iana",
        compressible: false,
        extensions: ["au", "snd"]
      },
      "audio/bv16": {
        source: "iana"
      },
      "audio/bv32": {
        source: "iana"
      },
      "audio/clearmode": {
        source: "iana"
      },
      "audio/cn": {
        source: "iana"
      },
      "audio/dat12": {
        source: "iana"
      },
      "audio/dls": {
        source: "iana"
      },
      "audio/dsr-es201108": {
        source: "iana"
      },
      "audio/dsr-es202050": {
        source: "iana"
      },
      "audio/dsr-es202211": {
        source: "iana"
      },
      "audio/dsr-es202212": {
        source: "iana"
      },
      "audio/dv": {
        source: "iana"
      },
      "audio/dvi4": {
        source: "iana"
      },
      "audio/eac3": {
        source: "iana"
      },
      "audio/encaprtp": {
        source: "iana"
      },
      "audio/evrc": {
        source: "iana"
      },
      "audio/evrc-qcp": {
        source: "iana"
      },
      "audio/evrc0": {
        source: "iana"
      },
      "audio/evrc1": {
        source: "iana"
      },
      "audio/evrcb": {
        source: "iana"
      },
      "audio/evrcb0": {
        source: "iana"
      },
      "audio/evrcb1": {
        source: "iana"
      },
      "audio/evrcnw": {
        source: "iana"
      },
      "audio/evrcnw0": {
        source: "iana"
      },
      "audio/evrcnw1": {
        source: "iana"
      },
      "audio/evrcwb": {
        source: "iana"
      },
      "audio/evrcwb0": {
        source: "iana"
      },
      "audio/evrcwb1": {
        source: "iana"
      },
      "audio/evs": {
        source: "iana"
      },
      "audio/flac": {
        source: "iana"
      },
      "audio/flexfec": {
        source: "iana"
      },
      "audio/fwdred": {
        source: "iana"
      },
      "audio/g711-0": {
        source: "iana"
      },
      "audio/g719": {
        source: "iana"
      },
      "audio/g722": {
        source: "iana"
      },
      "audio/g7221": {
        source: "iana"
      },
      "audio/g723": {
        source: "iana"
      },
      "audio/g726-16": {
        source: "iana"
      },
      "audio/g726-24": {
        source: "iana"
      },
      "audio/g726-32": {
        source: "iana"
      },
      "audio/g726-40": {
        source: "iana"
      },
      "audio/g728": {
        source: "iana"
      },
      "audio/g729": {
        source: "iana"
      },
      "audio/g7291": {
        source: "iana"
      },
      "audio/g729d": {
        source: "iana"
      },
      "audio/g729e": {
        source: "iana"
      },
      "audio/gsm": {
        source: "iana"
      },
      "audio/gsm-efr": {
        source: "iana"
      },
      "audio/gsm-hr-08": {
        source: "iana"
      },
      "audio/ilbc": {
        source: "iana"
      },
      "audio/ip-mr_v2.5": {
        source: "iana"
      },
      "audio/isac": {
        source: "apache"
      },
      "audio/l16": {
        source: "iana"
      },
      "audio/l20": {
        source: "iana"
      },
      "audio/l24": {
        source: "iana",
        compressible: false
      },
      "audio/l8": {
        source: "iana"
      },
      "audio/lpc": {
        source: "iana"
      },
      "audio/matroska": {
        source: "iana"
      },
      "audio/melp": {
        source: "iana"
      },
      "audio/melp1200": {
        source: "iana"
      },
      "audio/melp2400": {
        source: "iana"
      },
      "audio/melp600": {
        source: "iana"
      },
      "audio/mhas": {
        source: "iana"
      },
      "audio/midi": {
        source: "apache",
        extensions: ["mid", "midi", "kar", "rmi"]
      },
      "audio/midi-clip": {
        source: "iana"
      },
      "audio/mobile-xmf": {
        source: "iana",
        extensions: ["mxmf"]
      },
      "audio/mp3": {
        compressible: false,
        extensions: ["mp3"]
      },
      "audio/mp4": {
        source: "iana",
        compressible: false,
        extensions: ["m4a", "mp4a"]
      },
      "audio/mp4a-latm": {
        source: "iana"
      },
      "audio/mpa": {
        source: "iana"
      },
      "audio/mpa-robust": {
        source: "iana"
      },
      "audio/mpeg": {
        source: "iana",
        compressible: false,
        extensions: ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"]
      },
      "audio/mpeg4-generic": {
        source: "iana"
      },
      "audio/musepack": {
        source: "apache"
      },
      "audio/ogg": {
        source: "iana",
        compressible: false,
        extensions: ["oga", "ogg", "spx", "opus"]
      },
      "audio/opus": {
        source: "iana"
      },
      "audio/parityfec": {
        source: "iana"
      },
      "audio/pcma": {
        source: "iana"
      },
      "audio/pcma-wb": {
        source: "iana"
      },
      "audio/pcmu": {
        source: "iana"
      },
      "audio/pcmu-wb": {
        source: "iana"
      },
      "audio/prs.sid": {
        source: "iana"
      },
      "audio/qcelp": {
        source: "iana"
      },
      "audio/raptorfec": {
        source: "iana"
      },
      "audio/red": {
        source: "iana"
      },
      "audio/rtp-enc-aescm128": {
        source: "iana"
      },
      "audio/rtp-midi": {
        source: "iana"
      },
      "audio/rtploopback": {
        source: "iana"
      },
      "audio/rtx": {
        source: "iana"
      },
      "audio/s3m": {
        source: "apache",
        extensions: ["s3m"]
      },
      "audio/scip": {
        source: "iana"
      },
      "audio/silk": {
        source: "apache",
        extensions: ["sil"]
      },
      "audio/smv": {
        source: "iana"
      },
      "audio/smv-qcp": {
        source: "iana"
      },
      "audio/smv0": {
        source: "iana"
      },
      "audio/sofa": {
        source: "iana"
      },
      "audio/sp-midi": {
        source: "iana"
      },
      "audio/speex": {
        source: "iana"
      },
      "audio/t140c": {
        source: "iana"
      },
      "audio/t38": {
        source: "iana"
      },
      "audio/telephone-event": {
        source: "iana"
      },
      "audio/tetra_acelp": {
        source: "iana"
      },
      "audio/tetra_acelp_bb": {
        source: "iana"
      },
      "audio/tone": {
        source: "iana"
      },
      "audio/tsvcis": {
        source: "iana"
      },
      "audio/uemclip": {
        source: "iana"
      },
      "audio/ulpfec": {
        source: "iana"
      },
      "audio/usac": {
        source: "iana"
      },
      "audio/vdvi": {
        source: "iana"
      },
      "audio/vmr-wb": {
        source: "iana"
      },
      "audio/vnd.3gpp.iufp": {
        source: "iana"
      },
      "audio/vnd.4sb": {
        source: "iana"
      },
      "audio/vnd.audiokoz": {
        source: "iana"
      },
      "audio/vnd.celp": {
        source: "iana"
      },
      "audio/vnd.cisco.nse": {
        source: "iana"
      },
      "audio/vnd.cmles.radio-events": {
        source: "iana"
      },
      "audio/vnd.cns.anp1": {
        source: "iana"
      },
      "audio/vnd.cns.inf1": {
        source: "iana"
      },
      "audio/vnd.dece.audio": {
        source: "iana",
        extensions: ["uva", "uvva"]
      },
      "audio/vnd.digital-winds": {
        source: "iana",
        extensions: ["eol"]
      },
      "audio/vnd.dlna.adts": {
        source: "iana"
      },
      "audio/vnd.dolby.heaac.1": {
        source: "iana"
      },
      "audio/vnd.dolby.heaac.2": {
        source: "iana"
      },
      "audio/vnd.dolby.mlp": {
        source: "iana"
      },
      "audio/vnd.dolby.mps": {
        source: "iana"
      },
      "audio/vnd.dolby.pl2": {
        source: "iana"
      },
      "audio/vnd.dolby.pl2x": {
        source: "iana"
      },
      "audio/vnd.dolby.pl2z": {
        source: "iana"
      },
      "audio/vnd.dolby.pulse.1": {
        source: "iana"
      },
      "audio/vnd.dra": {
        source: "iana",
        extensions: ["dra"]
      },
      "audio/vnd.dts": {
        source: "iana",
        extensions: ["dts"]
      },
      "audio/vnd.dts.hd": {
        source: "iana",
        extensions: ["dtshd"]
      },
      "audio/vnd.dts.uhd": {
        source: "iana"
      },
      "audio/vnd.dvb.file": {
        source: "iana"
      },
      "audio/vnd.everad.plj": {
        source: "iana"
      },
      "audio/vnd.hns.audio": {
        source: "iana"
      },
      "audio/vnd.lucent.voice": {
        source: "iana",
        extensions: ["lvp"]
      },
      "audio/vnd.ms-playready.media.pya": {
        source: "iana",
        extensions: ["pya"]
      },
      "audio/vnd.nokia.mobile-xmf": {
        source: "iana"
      },
      "audio/vnd.nortel.vbk": {
        source: "iana"
      },
      "audio/vnd.nuera.ecelp4800": {
        source: "iana",
        extensions: ["ecelp4800"]
      },
      "audio/vnd.nuera.ecelp7470": {
        source: "iana",
        extensions: ["ecelp7470"]
      },
      "audio/vnd.nuera.ecelp9600": {
        source: "iana",
        extensions: ["ecelp9600"]
      },
      "audio/vnd.octel.sbc": {
        source: "iana"
      },
      "audio/vnd.presonus.multitrack": {
        source: "iana"
      },
      "audio/vnd.qcelp": {
        source: "apache"
      },
      "audio/vnd.rhetorex.32kadpcm": {
        source: "iana"
      },
      "audio/vnd.rip": {
        source: "iana",
        extensions: ["rip"]
      },
      "audio/vnd.rn-realaudio": {
        compressible: false
      },
      "audio/vnd.sealedmedia.softseal.mpeg": {
        source: "iana"
      },
      "audio/vnd.vmx.cvsd": {
        source: "iana"
      },
      "audio/vnd.wave": {
        compressible: false
      },
      "audio/vorbis": {
        source: "iana",
        compressible: false
      },
      "audio/vorbis-config": {
        source: "iana"
      },
      "audio/wav": {
        compressible: false,
        extensions: ["wav"]
      },
      "audio/wave": {
        compressible: false,
        extensions: ["wav"]
      },
      "audio/webm": {
        source: "apache",
        compressible: false,
        extensions: ["weba"]
      },
      "audio/x-aac": {
        source: "apache",
        compressible: false,
        extensions: ["aac"]
      },
      "audio/x-aiff": {
        source: "apache",
        extensions: ["aif", "aiff", "aifc"]
      },
      "audio/x-caf": {
        source: "apache",
        compressible: false,
        extensions: ["caf"]
      },
      "audio/x-flac": {
        source: "apache",
        extensions: ["flac"]
      },
      "audio/x-m4a": {
        source: "nginx",
        extensions: ["m4a"]
      },
      "audio/x-matroska": {
        source: "apache",
        extensions: ["mka"]
      },
      "audio/x-mpegurl": {
        source: "apache",
        extensions: ["m3u"]
      },
      "audio/x-ms-wax": {
        source: "apache",
        extensions: ["wax"]
      },
      "audio/x-ms-wma": {
        source: "apache",
        extensions: ["wma"]
      },
      "audio/x-pn-realaudio": {
        source: "apache",
        extensions: ["ram", "ra"]
      },
      "audio/x-pn-realaudio-plugin": {
        source: "apache",
        extensions: ["rmp"]
      },
      "audio/x-realaudio": {
        source: "nginx",
        extensions: ["ra"]
      },
      "audio/x-tta": {
        source: "apache"
      },
      "audio/x-wav": {
        source: "apache",
        extensions: ["wav"]
      },
      "audio/xm": {
        source: "apache",
        extensions: ["xm"]
      },
      "chemical/x-cdx": {
        source: "apache",
        extensions: ["cdx"]
      },
      "chemical/x-cif": {
        source: "apache",
        extensions: ["cif"]
      },
      "chemical/x-cmdf": {
        source: "apache",
        extensions: ["cmdf"]
      },
      "chemical/x-cml": {
        source: "apache",
        extensions: ["cml"]
      },
      "chemical/x-csml": {
        source: "apache",
        extensions: ["csml"]
      },
      "chemical/x-pdb": {
        source: "apache"
      },
      "chemical/x-xyz": {
        source: "apache",
        extensions: ["xyz"]
      },
      "font/collection": {
        source: "iana",
        extensions: ["ttc"]
      },
      "font/otf": {
        source: "iana",
        compressible: true,
        extensions: ["otf"]
      },
      "font/sfnt": {
        source: "iana"
      },
      "font/ttf": {
        source: "iana",
        compressible: true,
        extensions: ["ttf"]
      },
      "font/woff": {
        source: "iana",
        extensions: ["woff"]
      },
      "font/woff2": {
        source: "iana",
        extensions: ["woff2"]
      },
      "image/aces": {
        source: "iana",
        extensions: ["exr"]
      },
      "image/apng": {
        source: "iana",
        compressible: false,
        extensions: ["apng"]
      },
      "image/avci": {
        source: "iana",
        extensions: ["avci"]
      },
      "image/avcs": {
        source: "iana",
        extensions: ["avcs"]
      },
      "image/avif": {
        source: "iana",
        compressible: false,
        extensions: ["avif"]
      },
      "image/bmp": {
        source: "iana",
        compressible: true,
        extensions: ["bmp", "dib"]
      },
      "image/cgm": {
        source: "iana",
        extensions: ["cgm"]
      },
      "image/dicom-rle": {
        source: "iana",
        extensions: ["drle"]
      },
      "image/dpx": {
        source: "iana",
        extensions: ["dpx"]
      },
      "image/emf": {
        source: "iana",
        extensions: ["emf"]
      },
      "image/fits": {
        source: "iana",
        extensions: ["fits"]
      },
      "image/g3fax": {
        source: "iana",
        extensions: ["g3"]
      },
      "image/gif": {
        source: "iana",
        compressible: false,
        extensions: ["gif"]
      },
      "image/heic": {
        source: "iana",
        extensions: ["heic"]
      },
      "image/heic-sequence": {
        source: "iana",
        extensions: ["heics"]
      },
      "image/heif": {
        source: "iana",
        extensions: ["heif"]
      },
      "image/heif-sequence": {
        source: "iana",
        extensions: ["heifs"]
      },
      "image/hej2k": {
        source: "iana",
        extensions: ["hej2"]
      },
      "image/hsj2": {
        source: "iana",
        extensions: ["hsj2"]
      },
      "image/ief": {
        source: "iana",
        extensions: ["ief"]
      },
      "image/j2c": {
        source: "iana"
      },
      "image/jls": {
        source: "iana",
        extensions: ["jls"]
      },
      "image/jp2": {
        source: "iana",
        compressible: false,
        extensions: ["jp2", "jpg2"]
      },
      "image/jpeg": {
        source: "iana",
        compressible: false,
        extensions: ["jpeg", "jpg", "jpe"]
      },
      "image/jph": {
        source: "iana",
        extensions: ["jph"]
      },
      "image/jphc": {
        source: "iana",
        extensions: ["jhc"]
      },
      "image/jpm": {
        source: "iana",
        compressible: false,
        extensions: ["jpm", "jpgm"]
      },
      "image/jpx": {
        source: "iana",
        compressible: false,
        extensions: ["jpx", "jpf"]
      },
      "image/jxl": {
        source: "iana",
        extensions: ["jxl"]
      },
      "image/jxr": {
        source: "iana",
        extensions: ["jxr"]
      },
      "image/jxra": {
        source: "iana",
        extensions: ["jxra"]
      },
      "image/jxrs": {
        source: "iana",
        extensions: ["jxrs"]
      },
      "image/jxs": {
        source: "iana",
        extensions: ["jxs"]
      },
      "image/jxsc": {
        source: "iana",
        extensions: ["jxsc"]
      },
      "image/jxsi": {
        source: "iana",
        extensions: ["jxsi"]
      },
      "image/jxss": {
        source: "iana",
        extensions: ["jxss"]
      },
      "image/ktx": {
        source: "iana",
        extensions: ["ktx"]
      },
      "image/ktx2": {
        source: "iana",
        extensions: ["ktx2"]
      },
      "image/naplps": {
        source: "iana"
      },
      "image/pjpeg": {
        compressible: false
      },
      "image/png": {
        source: "iana",
        compressible: false,
        extensions: ["png"]
      },
      "image/prs.btif": {
        source: "iana",
        extensions: ["btif", "btf"]
      },
      "image/prs.pti": {
        source: "iana",
        extensions: ["pti"]
      },
      "image/pwg-raster": {
        source: "iana"
      },
      "image/sgi": {
        source: "apache",
        extensions: ["sgi"]
      },
      "image/svg+xml": {
        source: "iana",
        compressible: true,
        extensions: ["svg", "svgz"]
      },
      "image/t38": {
        source: "iana",
        extensions: ["t38"]
      },
      "image/tiff": {
        source: "iana",
        compressible: false,
        extensions: ["tif", "tiff"]
      },
      "image/tiff-fx": {
        source: "iana",
        extensions: ["tfx"]
      },
      "image/vnd.adobe.photoshop": {
        source: "iana",
        compressible: true,
        extensions: ["psd"]
      },
      "image/vnd.airzip.accelerator.azv": {
        source: "iana",
        extensions: ["azv"]
      },
      "image/vnd.cns.inf2": {
        source: "iana"
      },
      "image/vnd.dece.graphic": {
        source: "iana",
        extensions: ["uvi", "uvvi", "uvg", "uvvg"]
      },
      "image/vnd.djvu": {
        source: "iana",
        extensions: ["djvu", "djv"]
      },
      "image/vnd.dvb.subtitle": {
        source: "iana",
        extensions: ["sub"]
      },
      "image/vnd.dwg": {
        source: "iana",
        extensions: ["dwg"]
      },
      "image/vnd.dxf": {
        source: "iana",
        extensions: ["dxf"]
      },
      "image/vnd.fastbidsheet": {
        source: "iana",
        extensions: ["fbs"]
      },
      "image/vnd.fpx": {
        source: "iana",
        extensions: ["fpx"]
      },
      "image/vnd.fst": {
        source: "iana",
        extensions: ["fst"]
      },
      "image/vnd.fujixerox.edmics-mmr": {
        source: "iana",
        extensions: ["mmr"]
      },
      "image/vnd.fujixerox.edmics-rlc": {
        source: "iana",
        extensions: ["rlc"]
      },
      "image/vnd.globalgraphics.pgb": {
        source: "iana"
      },
      "image/vnd.microsoft.icon": {
        source: "iana",
        compressible: true,
        extensions: ["ico"]
      },
      "image/vnd.mix": {
        source: "iana"
      },
      "image/vnd.mozilla.apng": {
        source: "iana"
      },
      "image/vnd.ms-dds": {
        compressible: true,
        extensions: ["dds"]
      },
      "image/vnd.ms-modi": {
        source: "iana",
        extensions: ["mdi"]
      },
      "image/vnd.ms-photo": {
        source: "apache",
        extensions: ["wdp"]
      },
      "image/vnd.net-fpx": {
        source: "iana",
        extensions: ["npx"]
      },
      "image/vnd.pco.b16": {
        source: "iana",
        extensions: ["b16"]
      },
      "image/vnd.radiance": {
        source: "iana"
      },
      "image/vnd.sealed.png": {
        source: "iana"
      },
      "image/vnd.sealedmedia.softseal.gif": {
        source: "iana"
      },
      "image/vnd.sealedmedia.softseal.jpg": {
        source: "iana"
      },
      "image/vnd.svf": {
        source: "iana"
      },
      "image/vnd.tencent.tap": {
        source: "iana",
        extensions: ["tap"]
      },
      "image/vnd.valve.source.texture": {
        source: "iana",
        extensions: ["vtf"]
      },
      "image/vnd.wap.wbmp": {
        source: "iana",
        extensions: ["wbmp"]
      },
      "image/vnd.xiff": {
        source: "iana",
        extensions: ["xif"]
      },
      "image/vnd.zbrush.pcx": {
        source: "iana",
        extensions: ["pcx"]
      },
      "image/webp": {
        source: "iana",
        extensions: ["webp"]
      },
      "image/wmf": {
        source: "iana",
        extensions: ["wmf"]
      },
      "image/x-3ds": {
        source: "apache",
        extensions: ["3ds"]
      },
      "image/x-cmu-raster": {
        source: "apache",
        extensions: ["ras"]
      },
      "image/x-cmx": {
        source: "apache",
        extensions: ["cmx"]
      },
      "image/x-freehand": {
        source: "apache",
        extensions: ["fh", "fhc", "fh4", "fh5", "fh7"]
      },
      "image/x-icon": {
        source: "apache",
        compressible: true,
        extensions: ["ico"]
      },
      "image/x-jng": {
        source: "nginx",
        extensions: ["jng"]
      },
      "image/x-mrsid-image": {
        source: "apache",
        extensions: ["sid"]
      },
      "image/x-ms-bmp": {
        source: "nginx",
        compressible: true,
        extensions: ["bmp"]
      },
      "image/x-pcx": {
        source: "apache",
        extensions: ["pcx"]
      },
      "image/x-pict": {
        source: "apache",
        extensions: ["pic", "pct"]
      },
      "image/x-portable-anymap": {
        source: "apache",
        extensions: ["pnm"]
      },
      "image/x-portable-bitmap": {
        source: "apache",
        extensions: ["pbm"]
      },
      "image/x-portable-graymap": {
        source: "apache",
        extensions: ["pgm"]
      },
      "image/x-portable-pixmap": {
        source: "apache",
        extensions: ["ppm"]
      },
      "image/x-rgb": {
        source: "apache",
        extensions: ["rgb"]
      },
      "image/x-tga": {
        source: "apache",
        extensions: ["tga"]
      },
      "image/x-xbitmap": {
        source: "apache",
        extensions: ["xbm"]
      },
      "image/x-xcf": {
        compressible: false
      },
      "image/x-xpixmap": {
        source: "apache",
        extensions: ["xpm"]
      },
      "image/x-xwindowdump": {
        source: "apache",
        extensions: ["xwd"]
      },
      "message/bhttp": {
        source: "iana"
      },
      "message/cpim": {
        source: "iana"
      },
      "message/delivery-status": {
        source: "iana"
      },
      "message/disposition-notification": {
        source: "iana",
        extensions: [
          "disposition-notification"
        ]
      },
      "message/external-body": {
        source: "iana"
      },
      "message/feedback-report": {
        source: "iana"
      },
      "message/global": {
        source: "iana",
        extensions: ["u8msg"]
      },
      "message/global-delivery-status": {
        source: "iana",
        extensions: ["u8dsn"]
      },
      "message/global-disposition-notification": {
        source: "iana",
        extensions: ["u8mdn"]
      },
      "message/global-headers": {
        source: "iana",
        extensions: ["u8hdr"]
      },
      "message/http": {
        source: "iana",
        compressible: false
      },
      "message/imdn+xml": {
        source: "iana",
        compressible: true
      },
      "message/mls": {
        source: "iana"
      },
      "message/news": {
        source: "apache"
      },
      "message/ohttp-req": {
        source: "iana"
      },
      "message/ohttp-res": {
        source: "iana"
      },
      "message/partial": {
        source: "iana",
        compressible: false
      },
      "message/rfc822": {
        source: "iana",
        compressible: true,
        extensions: ["eml", "mime"]
      },
      "message/s-http": {
        source: "apache"
      },
      "message/sip": {
        source: "iana"
      },
      "message/sipfrag": {
        source: "iana"
      },
      "message/tracking-status": {
        source: "iana"
      },
      "message/vnd.si.simp": {
        source: "apache"
      },
      "message/vnd.wfa.wsc": {
        source: "iana",
        extensions: ["wsc"]
      },
      "model/3mf": {
        source: "iana",
        extensions: ["3mf"]
      },
      "model/e57": {
        source: "iana"
      },
      "model/gltf+json": {
        source: "iana",
        compressible: true,
        extensions: ["gltf"]
      },
      "model/gltf-binary": {
        source: "iana",
        compressible: true,
        extensions: ["glb"]
      },
      "model/iges": {
        source: "iana",
        compressible: false,
        extensions: ["igs", "iges"]
      },
      "model/jt": {
        source: "iana",
        extensions: ["jt"]
      },
      "model/mesh": {
        source: "iana",
        compressible: false,
        extensions: ["msh", "mesh", "silo"]
      },
      "model/mtl": {
        source: "iana",
        extensions: ["mtl"]
      },
      "model/obj": {
        source: "iana",
        extensions: ["obj"]
      },
      "model/prc": {
        source: "iana",
        extensions: ["prc"]
      },
      "model/step": {
        source: "iana"
      },
      "model/step+xml": {
        source: "iana",
        compressible: true,
        extensions: ["stpx"]
      },
      "model/step+zip": {
        source: "iana",
        compressible: false,
        extensions: ["stpz"]
      },
      "model/step-xml+zip": {
        source: "iana",
        compressible: false,
        extensions: ["stpxz"]
      },
      "model/stl": {
        source: "iana",
        extensions: ["stl"]
      },
      "model/u3d": {
        source: "iana",
        extensions: ["u3d"]
      },
      "model/vnd.bary": {
        source: "iana",
        extensions: ["bary"]
      },
      "model/vnd.cld": {
        source: "iana",
        extensions: ["cld"]
      },
      "model/vnd.collada+xml": {
        source: "iana",
        compressible: true,
        extensions: ["dae"]
      },
      "model/vnd.dwf": {
        source: "iana",
        extensions: ["dwf"]
      },
      "model/vnd.flatland.3dml": {
        source: "iana"
      },
      "model/vnd.gdl": {
        source: "iana",
        extensions: ["gdl"]
      },
      "model/vnd.gs-gdl": {
        source: "apache"
      },
      "model/vnd.gs.gdl": {
        source: "iana"
      },
      "model/vnd.gtw": {
        source: "iana",
        extensions: ["gtw"]
      },
      "model/vnd.moml+xml": {
        source: "iana",
        compressible: true
      },
      "model/vnd.mts": {
        source: "iana",
        extensions: ["mts"]
      },
      "model/vnd.opengex": {
        source: "iana",
        extensions: ["ogex"]
      },
      "model/vnd.parasolid.transmit.binary": {
        source: "iana",
        extensions: ["x_b"]
      },
      "model/vnd.parasolid.transmit.text": {
        source: "iana",
        extensions: ["x_t"]
      },
      "model/vnd.pytha.pyox": {
        source: "iana",
        extensions: ["pyo", "pyox"]
      },
      "model/vnd.rosette.annotated-data-model": {
        source: "iana"
      },
      "model/vnd.sap.vds": {
        source: "iana",
        extensions: ["vds"]
      },
      "model/vnd.usda": {
        source: "iana",
        extensions: ["usda"]
      },
      "model/vnd.usdz+zip": {
        source: "iana",
        compressible: false,
        extensions: ["usdz"]
      },
      "model/vnd.valve.source.compiled-map": {
        source: "iana",
        extensions: ["bsp"]
      },
      "model/vnd.vtu": {
        source: "iana",
        extensions: ["vtu"]
      },
      "model/vrml": {
        source: "iana",
        compressible: false,
        extensions: ["wrl", "vrml"]
      },
      "model/x3d+binary": {
        source: "apache",
        compressible: false,
        extensions: ["x3db", "x3dbz"]
      },
      "model/x3d+fastinfoset": {
        source: "iana",
        extensions: ["x3db"]
      },
      "model/x3d+vrml": {
        source: "apache",
        compressible: false,
        extensions: ["x3dv", "x3dvz"]
      },
      "model/x3d+xml": {
        source: "iana",
        compressible: true,
        extensions: ["x3d", "x3dz"]
      },
      "model/x3d-vrml": {
        source: "iana",
        extensions: ["x3dv"]
      },
      "multipart/alternative": {
        source: "iana",
        compressible: false
      },
      "multipart/appledouble": {
        source: "iana"
      },
      "multipart/byteranges": {
        source: "iana"
      },
      "multipart/digest": {
        source: "iana"
      },
      "multipart/encrypted": {
        source: "iana",
        compressible: false
      },
      "multipart/form-data": {
        source: "iana",
        compressible: false
      },
      "multipart/header-set": {
        source: "iana"
      },
      "multipart/mixed": {
        source: "iana"
      },
      "multipart/multilingual": {
        source: "iana"
      },
      "multipart/parallel": {
        source: "iana"
      },
      "multipart/related": {
        source: "iana",
        compressible: false
      },
      "multipart/report": {
        source: "iana"
      },
      "multipart/signed": {
        source: "iana",
        compressible: false
      },
      "multipart/vnd.bint.med-plus": {
        source: "iana"
      },
      "multipart/voice-message": {
        source: "iana"
      },
      "multipart/x-mixed-replace": {
        source: "iana"
      },
      "text/1d-interleaved-parityfec": {
        source: "iana"
      },
      "text/cache-manifest": {
        source: "iana",
        compressible: true,
        extensions: ["appcache", "manifest"]
      },
      "text/calendar": {
        source: "iana",
        extensions: ["ics", "ifb"]
      },
      "text/calender": {
        compressible: true
      },
      "text/cmd": {
        compressible: true
      },
      "text/coffeescript": {
        extensions: ["coffee", "litcoffee"]
      },
      "text/cql": {
        source: "iana"
      },
      "text/cql-expression": {
        source: "iana"
      },
      "text/cql-identifier": {
        source: "iana"
      },
      "text/css": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["css"]
      },
      "text/csv": {
        source: "iana",
        compressible: true,
        extensions: ["csv"]
      },
      "text/csv-schema": {
        source: "iana"
      },
      "text/directory": {
        source: "iana"
      },
      "text/dns": {
        source: "iana"
      },
      "text/ecmascript": {
        source: "apache"
      },
      "text/encaprtp": {
        source: "iana"
      },
      "text/enriched": {
        source: "iana"
      },
      "text/fhirpath": {
        source: "iana"
      },
      "text/flexfec": {
        source: "iana"
      },
      "text/fwdred": {
        source: "iana"
      },
      "text/gff3": {
        source: "iana"
      },
      "text/grammar-ref-list": {
        source: "iana"
      },
      "text/hl7v2": {
        source: "iana"
      },
      "text/html": {
        source: "iana",
        compressible: true,
        extensions: ["html", "htm", "shtml"]
      },
      "text/jade": {
        extensions: ["jade"]
      },
      "text/javascript": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["js", "mjs"]
      },
      "text/jcr-cnd": {
        source: "iana"
      },
      "text/jsx": {
        compressible: true,
        extensions: ["jsx"]
      },
      "text/less": {
        compressible: true,
        extensions: ["less"]
      },
      "text/markdown": {
        source: "iana",
        compressible: true,
        extensions: ["md", "markdown"]
      },
      "text/mathml": {
        source: "nginx",
        extensions: ["mml"]
      },
      "text/mdx": {
        compressible: true,
        extensions: ["mdx"]
      },
      "text/mizar": {
        source: "iana"
      },
      "text/n3": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["n3"]
      },
      "text/parameters": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/parityfec": {
        source: "iana"
      },
      "text/plain": {
        source: "iana",
        compressible: true,
        extensions: ["txt", "text", "conf", "def", "list", "log", "in", "ini"]
      },
      "text/provenance-notation": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/prs.fallenstein.rst": {
        source: "iana"
      },
      "text/prs.lines.tag": {
        source: "iana",
        extensions: ["dsc"]
      },
      "text/prs.prop.logic": {
        source: "iana"
      },
      "text/prs.texi": {
        source: "iana"
      },
      "text/raptorfec": {
        source: "iana"
      },
      "text/red": {
        source: "iana"
      },
      "text/rfc822-headers": {
        source: "iana"
      },
      "text/richtext": {
        source: "iana",
        compressible: true,
        extensions: ["rtx"]
      },
      "text/rtf": {
        source: "iana",
        compressible: true,
        extensions: ["rtf"]
      },
      "text/rtp-enc-aescm128": {
        source: "iana"
      },
      "text/rtploopback": {
        source: "iana"
      },
      "text/rtx": {
        source: "iana"
      },
      "text/sgml": {
        source: "iana",
        extensions: ["sgml", "sgm"]
      },
      "text/shaclc": {
        source: "iana"
      },
      "text/shex": {
        source: "iana",
        extensions: ["shex"]
      },
      "text/slim": {
        extensions: ["slim", "slm"]
      },
      "text/spdx": {
        source: "iana",
        extensions: ["spdx"]
      },
      "text/strings": {
        source: "iana"
      },
      "text/stylus": {
        extensions: ["stylus", "styl"]
      },
      "text/t140": {
        source: "iana"
      },
      "text/tab-separated-values": {
        source: "iana",
        compressible: true,
        extensions: ["tsv"]
      },
      "text/troff": {
        source: "iana",
        extensions: ["t", "tr", "roff", "man", "me", "ms"]
      },
      "text/turtle": {
        source: "iana",
        charset: "UTF-8",
        extensions: ["ttl"]
      },
      "text/ulpfec": {
        source: "iana"
      },
      "text/uri-list": {
        source: "iana",
        compressible: true,
        extensions: ["uri", "uris", "urls"]
      },
      "text/vcard": {
        source: "iana",
        compressible: true,
        extensions: ["vcard"]
      },
      "text/vnd.a": {
        source: "iana"
      },
      "text/vnd.abc": {
        source: "iana"
      },
      "text/vnd.ascii-art": {
        source: "iana"
      },
      "text/vnd.curl": {
        source: "iana",
        extensions: ["curl"]
      },
      "text/vnd.curl.dcurl": {
        source: "apache",
        extensions: ["dcurl"]
      },
      "text/vnd.curl.mcurl": {
        source: "apache",
        extensions: ["mcurl"]
      },
      "text/vnd.curl.scurl": {
        source: "apache",
        extensions: ["scurl"]
      },
      "text/vnd.debian.copyright": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/vnd.dmclientscript": {
        source: "iana"
      },
      "text/vnd.dvb.subtitle": {
        source: "iana",
        extensions: ["sub"]
      },
      "text/vnd.esmertec.theme-descriptor": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/vnd.exchangeable": {
        source: "iana"
      },
      "text/vnd.familysearch.gedcom": {
        source: "iana",
        extensions: ["ged"]
      },
      "text/vnd.ficlab.flt": {
        source: "iana"
      },
      "text/vnd.fly": {
        source: "iana",
        extensions: ["fly"]
      },
      "text/vnd.fmi.flexstor": {
        source: "iana",
        extensions: ["flx"]
      },
      "text/vnd.gml": {
        source: "iana"
      },
      "text/vnd.graphviz": {
        source: "iana",
        extensions: ["gv"]
      },
      "text/vnd.hans": {
        source: "iana"
      },
      "text/vnd.hgl": {
        source: "iana"
      },
      "text/vnd.in3d.3dml": {
        source: "iana",
        extensions: ["3dml"]
      },
      "text/vnd.in3d.spot": {
        source: "iana",
        extensions: ["spot"]
      },
      "text/vnd.iptc.newsml": {
        source: "iana"
      },
      "text/vnd.iptc.nitf": {
        source: "iana"
      },
      "text/vnd.latex-z": {
        source: "iana"
      },
      "text/vnd.motorola.reflex": {
        source: "iana"
      },
      "text/vnd.ms-mediapackage": {
        source: "iana"
      },
      "text/vnd.net2phone.commcenter.command": {
        source: "iana"
      },
      "text/vnd.radisys.msml-basic-layout": {
        source: "iana"
      },
      "text/vnd.senx.warpscript": {
        source: "iana"
      },
      "text/vnd.si.uricatalogue": {
        source: "apache"
      },
      "text/vnd.sosi": {
        source: "iana"
      },
      "text/vnd.sun.j2me.app-descriptor": {
        source: "iana",
        charset: "UTF-8",
        extensions: ["jad"]
      },
      "text/vnd.trolltech.linguist": {
        source: "iana",
        charset: "UTF-8"
      },
      "text/vnd.vcf": {
        source: "iana"
      },
      "text/vnd.wap.si": {
        source: "iana"
      },
      "text/vnd.wap.sl": {
        source: "iana"
      },
      "text/vnd.wap.wml": {
        source: "iana",
        extensions: ["wml"]
      },
      "text/vnd.wap.wmlscript": {
        source: "iana",
        extensions: ["wmls"]
      },
      "text/vnd.zoo.kcl": {
        source: "iana"
      },
      "text/vtt": {
        source: "iana",
        charset: "UTF-8",
        compressible: true,
        extensions: ["vtt"]
      },
      "text/wgsl": {
        source: "iana",
        extensions: ["wgsl"]
      },
      "text/x-asm": {
        source: "apache",
        extensions: ["s", "asm"]
      },
      "text/x-c": {
        source: "apache",
        extensions: ["c", "cc", "cxx", "cpp", "h", "hh", "dic"]
      },
      "text/x-component": {
        source: "nginx",
        extensions: ["htc"]
      },
      "text/x-fortran": {
        source: "apache",
        extensions: ["f", "for", "f77", "f90"]
      },
      "text/x-gwt-rpc": {
        compressible: true
      },
      "text/x-handlebars-template": {
        extensions: ["hbs"]
      },
      "text/x-java-source": {
        source: "apache",
        extensions: ["java"]
      },
      "text/x-jquery-tmpl": {
        compressible: true
      },
      "text/x-lua": {
        extensions: ["lua"]
      },
      "text/x-markdown": {
        compressible: true,
        extensions: ["mkd"]
      },
      "text/x-nfo": {
        source: "apache",
        extensions: ["nfo"]
      },
      "text/x-opml": {
        source: "apache",
        extensions: ["opml"]
      },
      "text/x-org": {
        compressible: true,
        extensions: ["org"]
      },
      "text/x-pascal": {
        source: "apache",
        extensions: ["p", "pas"]
      },
      "text/x-processing": {
        compressible: true,
        extensions: ["pde"]
      },
      "text/x-sass": {
        extensions: ["sass"]
      },
      "text/x-scss": {
        extensions: ["scss"]
      },
      "text/x-setext": {
        source: "apache",
        extensions: ["etx"]
      },
      "text/x-sfv": {
        source: "apache",
        extensions: ["sfv"]
      },
      "text/x-suse-ymp": {
        compressible: true,
        extensions: ["ymp"]
      },
      "text/x-uuencode": {
        source: "apache",
        extensions: ["uu"]
      },
      "text/x-vcalendar": {
        source: "apache",
        extensions: ["vcs"]
      },
      "text/x-vcard": {
        source: "apache",
        extensions: ["vcf"]
      },
      "text/xml": {
        source: "iana",
        compressible: true,
        extensions: ["xml"]
      },
      "text/xml-external-parsed-entity": {
        source: "iana"
      },
      "text/yaml": {
        compressible: true,
        extensions: ["yaml", "yml"]
      },
      "video/1d-interleaved-parityfec": {
        source: "iana"
      },
      "video/3gpp": {
        source: "iana",
        extensions: ["3gp", "3gpp"]
      },
      "video/3gpp-tt": {
        source: "iana"
      },
      "video/3gpp2": {
        source: "iana",
        extensions: ["3g2"]
      },
      "video/av1": {
        source: "iana"
      },
      "video/bmpeg": {
        source: "iana"
      },
      "video/bt656": {
        source: "iana"
      },
      "video/celb": {
        source: "iana"
      },
      "video/dv": {
        source: "iana"
      },
      "video/encaprtp": {
        source: "iana"
      },
      "video/evc": {
        source: "iana"
      },
      "video/ffv1": {
        source: "iana"
      },
      "video/flexfec": {
        source: "iana"
      },
      "video/h261": {
        source: "iana",
        extensions: ["h261"]
      },
      "video/h263": {
        source: "iana",
        extensions: ["h263"]
      },
      "video/h263-1998": {
        source: "iana"
      },
      "video/h263-2000": {
        source: "iana"
      },
      "video/h264": {
        source: "iana",
        extensions: ["h264"]
      },
      "video/h264-rcdo": {
        source: "iana"
      },
      "video/h264-svc": {
        source: "iana"
      },
      "video/h265": {
        source: "iana"
      },
      "video/h266": {
        source: "iana"
      },
      "video/iso.segment": {
        source: "iana",
        extensions: ["m4s"]
      },
      "video/jpeg": {
        source: "iana",
        extensions: ["jpgv"]
      },
      "video/jpeg2000": {
        source: "iana"
      },
      "video/jpm": {
        source: "apache",
        extensions: ["jpm", "jpgm"]
      },
      "video/jxsv": {
        source: "iana"
      },
      "video/matroska": {
        source: "iana"
      },
      "video/matroska-3d": {
        source: "iana"
      },
      "video/mj2": {
        source: "iana",
        extensions: ["mj2", "mjp2"]
      },
      "video/mp1s": {
        source: "iana"
      },
      "video/mp2p": {
        source: "iana"
      },
      "video/mp2t": {
        source: "iana",
        extensions: ["ts", "m2t", "m2ts", "mts"]
      },
      "video/mp4": {
        source: "iana",
        compressible: false,
        extensions: ["mp4", "mp4v", "mpg4"]
      },
      "video/mp4v-es": {
        source: "iana"
      },
      "video/mpeg": {
        source: "iana",
        compressible: false,
        extensions: ["mpeg", "mpg", "mpe", "m1v", "m2v"]
      },
      "video/mpeg4-generic": {
        source: "iana"
      },
      "video/mpv": {
        source: "iana"
      },
      "video/nv": {
        source: "iana"
      },
      "video/ogg": {
        source: "iana",
        compressible: false,
        extensions: ["ogv"]
      },
      "video/parityfec": {
        source: "iana"
      },
      "video/pointer": {
        source: "iana"
      },
      "video/quicktime": {
        source: "iana",
        compressible: false,
        extensions: ["qt", "mov"]
      },
      "video/raptorfec": {
        source: "iana"
      },
      "video/raw": {
        source: "iana"
      },
      "video/rtp-enc-aescm128": {
        source: "iana"
      },
      "video/rtploopback": {
        source: "iana"
      },
      "video/rtx": {
        source: "iana"
      },
      "video/scip": {
        source: "iana"
      },
      "video/smpte291": {
        source: "iana"
      },
      "video/smpte292m": {
        source: "iana"
      },
      "video/ulpfec": {
        source: "iana"
      },
      "video/vc1": {
        source: "iana"
      },
      "video/vc2": {
        source: "iana"
      },
      "video/vnd.cctv": {
        source: "iana"
      },
      "video/vnd.dece.hd": {
        source: "iana",
        extensions: ["uvh", "uvvh"]
      },
      "video/vnd.dece.mobile": {
        source: "iana",
        extensions: ["uvm", "uvvm"]
      },
      "video/vnd.dece.mp4": {
        source: "iana"
      },
      "video/vnd.dece.pd": {
        source: "iana",
        extensions: ["uvp", "uvvp"]
      },
      "video/vnd.dece.sd": {
        source: "iana",
        extensions: ["uvs", "uvvs"]
      },
      "video/vnd.dece.video": {
        source: "iana",
        extensions: ["uvv", "uvvv"]
      },
      "video/vnd.directv.mpeg": {
        source: "iana"
      },
      "video/vnd.directv.mpeg-tts": {
        source: "iana"
      },
      "video/vnd.dlna.mpeg-tts": {
        source: "iana"
      },
      "video/vnd.dvb.file": {
        source: "iana",
        extensions: ["dvb"]
      },
      "video/vnd.fvt": {
        source: "iana",
        extensions: ["fvt"]
      },
      "video/vnd.hns.video": {
        source: "iana"
      },
      "video/vnd.iptvforum.1dparityfec-1010": {
        source: "iana"
      },
      "video/vnd.iptvforum.1dparityfec-2005": {
        source: "iana"
      },
      "video/vnd.iptvforum.2dparityfec-1010": {
        source: "iana"
      },
      "video/vnd.iptvforum.2dparityfec-2005": {
        source: "iana"
      },
      "video/vnd.iptvforum.ttsavc": {
        source: "iana"
      },
      "video/vnd.iptvforum.ttsmpeg2": {
        source: "iana"
      },
      "video/vnd.motorola.video": {
        source: "iana"
      },
      "video/vnd.motorola.videop": {
        source: "iana"
      },
      "video/vnd.mpegurl": {
        source: "iana",
        extensions: ["mxu", "m4u"]
      },
      "video/vnd.ms-playready.media.pyv": {
        source: "iana",
        extensions: ["pyv"]
      },
      "video/vnd.nokia.interleaved-multimedia": {
        source: "iana"
      },
      "video/vnd.nokia.mp4vr": {
        source: "iana"
      },
      "video/vnd.nokia.videovoip": {
        source: "iana"
      },
      "video/vnd.objectvideo": {
        source: "iana"
      },
      "video/vnd.radgamettools.bink": {
        source: "iana"
      },
      "video/vnd.radgamettools.smacker": {
        source: "apache"
      },
      "video/vnd.sealed.mpeg1": {
        source: "iana"
      },
      "video/vnd.sealed.mpeg4": {
        source: "iana"
      },
      "video/vnd.sealed.swf": {
        source: "iana"
      },
      "video/vnd.sealedmedia.softseal.mov": {
        source: "iana"
      },
      "video/vnd.uvvu.mp4": {
        source: "iana",
        extensions: ["uvu", "uvvu"]
      },
      "video/vnd.vivo": {
        source: "iana",
        extensions: ["viv"]
      },
      "video/vnd.youtube.yt": {
        source: "iana"
      },
      "video/vp8": {
        source: "iana"
      },
      "video/vp9": {
        source: "iana"
      },
      "video/webm": {
        source: "apache",
        compressible: false,
        extensions: ["webm"]
      },
      "video/x-f4v": {
        source: "apache",
        extensions: ["f4v"]
      },
      "video/x-fli": {
        source: "apache",
        extensions: ["fli"]
      },
      "video/x-flv": {
        source: "apache",
        compressible: false,
        extensions: ["flv"]
      },
      "video/x-m4v": {
        source: "apache",
        extensions: ["m4v"]
      },
      "video/x-matroska": {
        source: "apache",
        compressible: false,
        extensions: ["mkv", "mk3d", "mks"]
      },
      "video/x-mng": {
        source: "apache",
        extensions: ["mng"]
      },
      "video/x-ms-asf": {
        source: "apache",
        extensions: ["asf", "asx"]
      },
      "video/x-ms-vob": {
        source: "apache",
        extensions: ["vob"]
      },
      "video/x-ms-wm": {
        source: "apache",
        extensions: ["wm"]
      },
      "video/x-ms-wmv": {
        source: "apache",
        compressible: false,
        extensions: ["wmv"]
      },
      "video/x-ms-wmx": {
        source: "apache",
        extensions: ["wmx"]
      },
      "video/x-ms-wvx": {
        source: "apache",
        extensions: ["wvx"]
      },
      "video/x-msvideo": {
        source: "apache",
        extensions: ["avi"]
      },
      "video/x-sgi-movie": {
        source: "apache",
        extensions: ["movie"]
      },
      "video/x-smv": {
        source: "apache",
        extensions: ["smv"]
      },
      "x-conference/x-cooltalk": {
        source: "apache",
        extensions: ["ice"]
      },
      "x-shader/x-fragment": {
        compressible: true
      },
      "x-shader/x-vertex": {
        compressible: true
      }
    };
  }
});

// node_modules/mime-db/index.js
var require_mime_db = __commonJS({
  "node_modules/mime-db/index.js"(exports, module) {
    module.exports = require_db();
  }
});

// node_modules/@koishijs/core/package.json
var version = "4.18.4";

// node_modules/inaba/lib/index.mjs
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS2 = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __publicField2 = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var require_src = __commonJS2({
  "packages/inaba/src/index.ts"(exports, module) {
    var _Random = class {
      constructor(get = Math.random) {
        this.get = get;
      }
      id(length = 8, radix = 16) {
        let result = "";
        for (let i = 0; i < length; ++i) {
          result += _Random.chars[Math.floor(Math.random() * radix)];
        }
        return result;
      }
      bool(probability) {
        if (probability >= 1)
          return true;
        if (probability <= 0)
          return false;
        return this.get() < probability;
      }
      real(...args) {
        const lower = args.length > 1 ? args[0] : 0;
        const upper = args[args.length - 1];
        return this.get() * (upper - lower) + lower;
      }
      int(...args) {
        return Math.floor(this.real(...args));
      }
      splice(source) {
        return source.splice(Math.floor(this.get() * source.length), 1)[0];
      }
      pick(source, count) {
        if (count === void 0)
          return this.pick(source, 1)[0];
        const copy = source.slice();
        const result = [];
        count = Math.min(copy.length, count);
        for (let i = 0; i < count; i += 1) {
          result.push(this.splice(copy));
        }
        return result;
      }
      shuffle(source) {
        return this.pick(source, source.length);
      }
      weightedPick(weights) {
        const total = Object.entries(weights).reduce((prev, [, curr]) => prev + curr, 0);
        const pointer = this.get() * total;
        let counter = 0;
        for (const key in weights) {
          counter += weights[key];
          if (pointer < counter)
            return key;
        }
      }
    };
    var Random = _Random;
    __name(Random, "Random");
    __publicField2(Random, "chars", "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
    var instance = new Random();
    for (const key of ["id", "bool", "int", "real", "splice", "pick", "shuffle", "weightedPick"]) {
      Random[key] = instance[key].bind(instance);
    }
    module.exports = Random;
  }
});
var lib_default = require_src();

// node_modules/cosmokit/lib/index.mjs
var __defProp2 = Object.defineProperty;
var __name2 = (target, value) => __defProp2(target, "name", { value, configurable: true });
function noop() {
}
__name2(noop, "noop");
function isNullable(value) {
  return value === null || value === void 0;
}
__name2(isNullable, "isNullable");
function isPlainObject(data) {
  return data && typeof data === "object" && !Array.isArray(data);
}
__name2(isPlainObject, "isPlainObject");
function filterKeys(object, filter2) {
  return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter2(key, value)));
}
__name2(filterKeys, "filterKeys");
function mapValues(object, transform) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
}
__name2(mapValues, "mapValues");
function pick(source, keys, forced) {
  if (!keys) return { ...source };
  const result = {};
  for (const key of keys) {
    if (forced || source[key] !== void 0) result[key] = source[key];
  }
  return result;
}
__name2(pick, "pick");
function omit(source, keys) {
  if (!keys) return { ...source };
  const result = { ...source };
  for (const key of keys) {
    Reflect.deleteProperty(result, key);
  }
  return result;
}
__name2(omit, "omit");
function defineProperty(object, key, value) {
  return Object.defineProperty(object, key, { writable: true, value, enumerable: false });
}
__name2(defineProperty, "defineProperty");
function contain(array1, array2) {
  return array2.every((item) => array1.includes(item));
}
__name2(contain, "contain");
function intersection(array1, array2) {
  return array1.filter((item) => array2.includes(item));
}
__name2(intersection, "intersection");
function difference(array1, array2) {
  return array1.filter((item) => !array2.includes(item));
}
__name2(difference, "difference");
function union(array1, array2) {
  return Array.from(/* @__PURE__ */ new Set([...array1, ...array2]));
}
__name2(union, "union");
function deduplicate(array) {
  return [...new Set(array)];
}
__name2(deduplicate, "deduplicate");
function remove(list, item) {
  const index = list == null ? void 0 : list.indexOf(item);
  if (index >= 0) {
    list.splice(index, 1);
    return true;
  } else {
    return false;
  }
}
__name2(remove, "remove");
function makeArray(source) {
  return Array.isArray(source) ? source : isNullable(source) ? [] : [source];
}
__name2(makeArray, "makeArray");
function is(type, value) {
  if (arguments.length === 1) return (value2) => is(type, value2);
  return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
}
__name2(is, "is");
function isArrayBufferLike(value) {
  return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
}
__name2(isArrayBufferLike, "isArrayBufferLike");
function isArrayBufferSource(value) {
  return isArrayBufferLike(value) || ArrayBuffer.isView(value);
}
__name2(isArrayBufferSource, "isArrayBufferSource");
var Binary;
((Binary2) => {
  Binary2.is = isArrayBufferLike;
  Binary2.isSource = isArrayBufferSource;
  function fromSource(source) {
    if (ArrayBuffer.isView(source)) {
      return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
    } else {
      return source;
    }
  }
  Binary2.fromSource = fromSource;
  __name2(fromSource, "fromSource");
  function toBase64(source) {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(source).toString("base64");
    }
    let binary = "";
    const bytes = new Uint8Array(source);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  Binary2.toBase64 = toBase64;
  __name2(toBase64, "toBase64");
  function fromBase64(source) {
    if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
    return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
  }
  Binary2.fromBase64 = fromBase64;
  __name2(fromBase64, "fromBase64");
  function toHex(source) {
    if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
    return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  Binary2.toHex = toHex;
  __name2(toHex, "toHex");
  function fromHex(source) {
    if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
    const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
    const buffer = [];
    for (let i = 0; i < hex.length; i += 2) {
      buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
    }
    return Uint8Array.from(buffer).buffer;
  }
  Binary2.fromHex = fromHex;
  __name2(fromHex, "fromHex");
})(Binary || (Binary = {}));
var base64ToArrayBuffer = Binary.fromBase64;
var arrayBufferToBase64 = Binary.toBase64;
var hexToArrayBuffer = Binary.fromHex;
var arrayBufferToHex = Binary.toHex;
function clone(source) {
  if (!source || typeof source !== "object") return source;
  if (Array.isArray(source)) return source.map(clone);
  if (is("Date", source)) return new Date(source.valueOf());
  if (is("RegExp", source)) return new RegExp(source.source, source.flags);
  if (isArrayBufferLike(source)) return source.slice(0);
  if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
  return mapValues(source, clone);
}
__name2(clone, "clone");
function deepEqual(a, b, strict) {
  if (a === b) return true;
  if (!strict && isNullable(a) && isNullable(b)) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;
  if (!a || !b) return false;
  function check(test, then) {
    return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
  }
  __name2(check, "check");
  return check(Array.isArray, (a2, b2) => a2.length === b2.length && a2.every((item, index) => deepEqual(item, b2[index]))) ?? check(is("Date"), (a2, b2) => a2.valueOf() === b2.valueOf()) ?? check(is("RegExp"), (a2, b2) => a2.source === b2.source && a2.flags === b2.flags) ?? check(isArrayBufferLike, (a2, b2) => {
    if (a2.byteLength !== b2.byteLength) return false;
    const viewA = new Uint8Array(a2);
    const viewB = new Uint8Array(b2);
    for (let i = 0; i < viewA.length; i++) {
      if (viewA[i] !== viewB[i]) return false;
    }
    return true;
  }) ?? Object.keys({ ...a, ...b }).every((key) => deepEqual(a[key], b[key], strict));
}
__name2(deepEqual, "deepEqual");
function capitalize(source) {
  return source.charAt(0).toUpperCase() + source.slice(1);
}
__name2(capitalize, "capitalize");
function uncapitalize(source) {
  return source.charAt(0).toLowerCase() + source.slice(1);
}
__name2(uncapitalize, "uncapitalize");
function camelCase(source) {
  return source.replace(/[_-][a-z]/g, (str) => str.slice(1).toUpperCase());
}
__name2(camelCase, "camelCase");
function paramCase(source) {
  return uncapitalize(source).replace(/_/g, "-").replace(/.[A-Z]+/g, (str) => str[0] + "-" + str.slice(1).toLowerCase());
}
__name2(paramCase, "paramCase");
function snakeCase(source) {
  return uncapitalize(source).replace(/-/g, "_").replace(/.[A-Z]+/g, (str) => str[0] + "_" + str.slice(1).toLowerCase());
}
__name2(snakeCase, "snakeCase");
var camelize = camelCase;
var hyphenate = paramCase;
function trimSlash(source) {
  return source.replace(/\/$/, "");
}
__name2(trimSlash, "trimSlash");
function sanitize(source) {
  if (!source.startsWith("/")) source = "/" + source;
  return trimSlash(source);
}
__name2(sanitize, "sanitize");
var Time;
((Time2) => {
  Time2.millisecond = 1;
  Time2.second = 1e3;
  Time2.minute = Time2.second * 60;
  Time2.hour = Time2.minute * 60;
  Time2.day = Time2.hour * 24;
  Time2.week = Time2.day * 7;
  let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
  function setTimezoneOffset(offset) {
    timezoneOffset = offset;
  }
  Time2.setTimezoneOffset = setTimezoneOffset;
  __name2(setTimezoneOffset, "setTimezoneOffset");
  function getTimezoneOffset() {
    return timezoneOffset;
  }
  Time2.getTimezoneOffset = getTimezoneOffset;
  __name2(getTimezoneOffset, "getTimezoneOffset");
  function getDateNumber(date = /* @__PURE__ */ new Date(), offset) {
    if (typeof date === "number") date = new Date(date);
    if (offset === void 0) offset = timezoneOffset;
    return Math.floor((date.valueOf() / Time2.minute - offset) / 1440);
  }
  Time2.getDateNumber = getDateNumber;
  __name2(getDateNumber, "getDateNumber");
  function fromDateNumber(value, offset) {
    const date = new Date(value * Time2.day);
    if (offset === void 0) offset = timezoneOffset;
    return new Date(+date + offset * Time2.minute);
  }
  Time2.fromDateNumber = fromDateNumber;
  __name2(fromDateNumber, "fromDateNumber");
  const numeric = /\d+(?:\.\d+)?/.source;
  const timeRegExp = new RegExp(`^${[
    "w(?:eek(?:s)?)?",
    "d(?:ay(?:s)?)?",
    "h(?:our(?:s)?)?",
    "m(?:in(?:ute)?(?:s)?)?",
    "s(?:ec(?:ond)?(?:s)?)?"
  ].map((unit) => `(${numeric}${unit})?`).join("")}$`);
  function parseTime(source) {
    const capture = timeRegExp.exec(source);
    if (!capture) return 0;
    return (parseFloat(capture[1]) * Time2.week || 0) + (parseFloat(capture[2]) * Time2.day || 0) + (parseFloat(capture[3]) * Time2.hour || 0) + (parseFloat(capture[4]) * Time2.minute || 0) + (parseFloat(capture[5]) * Time2.second || 0);
  }
  Time2.parseTime = parseTime;
  __name2(parseTime, "parseTime");
  function parseDate(date) {
    const parsed = parseTime(date);
    if (parsed) {
      date = Date.now() + parsed;
    } else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date)) {
      date = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date}`;
    } else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date)) {
      date = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date}`;
    }
    return date ? new Date(date) : /* @__PURE__ */ new Date();
  }
  Time2.parseDate = parseDate;
  __name2(parseDate, "parseDate");
  function format(ms) {
    const abs = Math.abs(ms);
    if (abs >= Time2.day - Time2.hour / 2) {
      return Math.round(ms / Time2.day) + "d";
    } else if (abs >= Time2.hour - Time2.minute / 2) {
      return Math.round(ms / Time2.hour) + "h";
    } else if (abs >= Time2.minute - Time2.second / 2) {
      return Math.round(ms / Time2.minute) + "m";
    } else if (abs >= Time2.second) {
      return Math.round(ms / Time2.second) + "s";
    }
    return ms + "ms";
  }
  Time2.format = format;
  __name2(format, "format");
  function toDigits(source, length = 2) {
    return source.toString().padStart(length, "0");
  }
  Time2.toDigits = toDigits;
  __name2(toDigits, "toDigits");
  function template(template2, time = /* @__PURE__ */ new Date()) {
    return template2.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
  }
  Time2.template = template;
  __name2(template, "template");
})(Time || (Time = {}));

// node_modules/@koishijs/utils/lib/index.mjs
var __defProp3 = Object.defineProperty;
var __name3 = (target, value) => __defProp3(target, "name", { value, configurable: true });
function isInteger(source) {
  return typeof source === "number" && Math.floor(source) === source;
}
__name3(isInteger, "isInteger");
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
__name3(sleep, "sleep");
function enumKeys(data) {
  return Object.values(data).filter((value) => typeof value === "string");
}
__name3(enumKeys, "enumKeys");
function defineEnumProperty(object, key, value) {
  object[key] = value;
  object[value] = key;
}
__name3(defineEnumProperty, "defineEnumProperty");
function merge(head, base) {
  Object.entries(base).forEach(([key, value]) => {
    if (typeof head[key] === "undefined")
      return head[key] = base[key];
    if (typeof value === "object" && typeof head[key] === "object") {
      head[key] = merge(head[key], value);
    }
  });
  return head;
}
__name3(merge, "merge");
function assertProperty(config, key) {
  if (!config[key])
    throw new Error(`missing configuration "${key}"`);
  return config[key];
}
__name3(assertProperty, "assertProperty");
function coerce(val) {
  const { message, stack } = val instanceof Error && val.stack ? val : new Error(val);
  const lines = stack.split("\n");
  const index = lines.findIndex((line) => line.endsWith(message));
  return lines.slice(index).join("\n");
}
__name3(coerce, "coerce");
function renameProperty(config, key, oldKey) {
  config[key] = Reflect.get(config, oldKey);
  Reflect.deleteProperty(config, oldKey);
}
__name3(renameProperty, "renameProperty");
function extend(prototype, methods) {
  Object.defineProperties(prototype, Object.getOwnPropertyDescriptors(methods));
}
__name3(extend, "extend");
var immutable = ["number", "string", "bigint", "boolean", "symbol", "function"];
var builtin = ["Date", "RegExp", "Set", "Map", "WeakSet", "WeakMap", "Array"];
function observeProperty(value, update) {
  if (is("Date", value)) {
    return observeDate(value, update);
  } else if (Array.isArray(value)) {
    return observeArray(value, update);
  } else {
    return observeObject(value, update);
  }
}
__name3(observeProperty, "observeProperty");
function untracked(key) {
  return typeof key === "symbol" || key.startsWith("$");
}
__name3(untracked, "untracked");
function observeObject(target, notify) {
  const update = notify;
  if (!notify) {
    const diff = /* @__PURE__ */ Object.create(null);
    defineProperty(target, "$diff", diff);
    notify = __name3((key) => {
      if (untracked(key))
        return;
      diff[key] = target[key];
    }, "notify");
  }
  const proxy = new Proxy(target, {
    get(target2, key) {
      const value = Reflect.get(target2, key);
      if (!value || immutable.includes(typeof value) || untracked(key))
        return value;
      return observeProperty(value, update || (() => notify(key)));
    },
    set(target2, key, value) {
      const unchanged = target2[key] === value;
      const result = Reflect.set(target2, key, value);
      if (unchanged || !result)
        return result;
      notify(key);
      return true;
    },
    deleteProperty(target2, key) {
      const unchanged = !(key in target2);
      const result = Reflect.deleteProperty(target2, key);
      if (unchanged || !result)
        return result;
      notify(key);
      return true;
    }
  });
  return proxy;
}
__name3(observeObject, "observeObject");
var arrayProxyMethods = ["pop", "shift", "splice", "sort"];
function observeArray(target, update) {
  const proxy = {};
  for (const method of arrayProxyMethods) {
    defineProperty(target, method, function(...args) {
      update();
      return Array.prototype[method].apply(this, args);
    });
  }
  return new Proxy(target, {
    get(target2, key) {
      if (key in proxy)
        return proxy[key];
      const value = target2[key];
      if (!value || immutable.includes(typeof value) || typeof key === "symbol" || isNaN(key))
        return value;
      return observeProperty(value, update);
    },
    set(target2, key, value) {
      if (typeof key !== "symbol" && !isNaN(key) && target2[key] !== value)
        update();
      return Reflect.set(target2, key, value);
    }
  });
}
__name3(observeArray, "observeArray");
function observeDate(target, update) {
  for (const method of Object.getOwnPropertyNames(Date.prototype)) {
    if (method === "valueOf")
      continue;
    defineProperty(target, method, function(...args) {
      const oldValue = target.valueOf();
      const result = Date.prototype[method].apply(this, args);
      if (target.valueOf() !== oldValue)
        update();
      return result;
    });
  }
  return target;
}
__name3(observeDate, "observeDate");
function observe(target, ...args) {
  if (immutable.includes(typeof target)) {
    throw new Error(`cannot observe immutable type "${typeof target}"`);
  } else if (!target) {
    throw new Error("cannot observe null or undefined");
  }
  const type = Object.prototype.toString.call(target).slice(8, -1);
  if (builtin.includes(type)) {
    throw new Error(`cannot observe instance of type "${type}"`);
  }
  let update = noop;
  if (typeof args[0] === "function")
    update = args.shift();
  const observer = observeObject(target, null);
  defineProperty(observer, "$update", __name3(function $update() {
    const diff = { ...this.$diff };
    const fields = Object.keys(diff);
    if (fields.length) {
      for (const key in this.$diff) {
        delete this.$diff[key];
      }
      return update(diff);
    }
  }, "$update"));
  defineProperty(observer, "$merge", __name3(function $merge(value) {
    for (const key in value) {
      if (key in this.$diff) {
        throw new Error(`unresolved diff key "${key}"`);
      }
      target[key] = value[key];
    }
    return this;
  }, "$merge"));
  return observer;
}
__name3(observe, "observe");
var evaluate = new Function("context", "expr", `
  try {
    with (context) {
      return eval(expr)
    }
  } catch {}
`);
function interpolate(template, context, pattern = /\{\{([\s\S]+?)\}\}/g) {
  let capture;
  let result = "", lastIndex = 0;
  while (capture = pattern.exec(template)) {
    if (capture[0] === template) {
      return evaluate(context, capture[1]);
    }
    result += template.slice(lastIndex, capture.index);
    result += evaluate(context, capture[1]) ?? "";
    lastIndex = capture.index + capture[0].length;
  }
  return result + template.slice(lastIndex);
}
__name3(interpolate, "interpolate");
function escapeRegExp(source) {
  return source.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
__name3(escapeRegExp, "escapeRegExp");

// node_modules/@cordisjs/core/lib/index.mjs
var __defProp4 = Object.defineProperty;
var __name4 = (target, value) => __defProp4(target, "name", { value, configurable: true });
var symbols = {
  // internal symbols
  shadow: Symbol.for("cordis.shadow"),
  receiver: Symbol.for("cordis.receiver"),
  original: Symbol.for("cordis.original"),
  // context symbols
  store: Symbol.for("cordis.store"),
  events: Symbol.for("cordis.events"),
  static: Symbol.for("cordis.static"),
  filter: Symbol.for("cordis.filter"),
  expose: Symbol.for("cordis.expose"),
  isolate: Symbol.for("cordis.isolate"),
  internal: Symbol.for("cordis.internal"),
  intercept: Symbol.for("cordis.intercept"),
  // service symbols
  setup: Symbol.for("cordis.setup"),
  invoke: Symbol.for("cordis.invoke"),
  extend: Symbol.for("cordis.extend"),
  tracker: Symbol.for("cordis.tracker"),
  provide: Symbol.for("cordis.provide"),
  immediate: Symbol.for("cordis.immediate")
};
var GeneratorFunction = (function* () {
}).constructor;
var AsyncGeneratorFunction = (async function* () {
}).constructor;
function isConstructor(func) {
  if (!func.prototype) return false;
  if (func instanceof GeneratorFunction) return false;
  if (AsyncGeneratorFunction !== Function && func instanceof AsyncGeneratorFunction) return false;
  return true;
}
__name4(isConstructor, "isConstructor");
function resolveConfig(plugin, config) {
  const schema = plugin["Config"] || plugin["schema"];
  if (schema && plugin["schema"] !== false) config = schema(config);
  return config ?? {};
}
__name4(resolveConfig, "resolveConfig");
function isUnproxyable(value) {
  return [Map, Set, Date, Promise].some((constructor) => value instanceof constructor);
}
__name4(isUnproxyable, "isUnproxyable");
function joinPrototype(proto1, proto2) {
  if (proto1 === Object.prototype) return proto2;
  const result = Object.create(joinPrototype(Object.getPrototypeOf(proto1), proto2));
  for (const key of Reflect.ownKeys(proto1)) {
    Object.defineProperty(result, key, Object.getOwnPropertyDescriptor(proto1, key));
  }
  return result;
}
__name4(joinPrototype, "joinPrototype");
function isObject(value) {
  return value && (typeof value === "object" || typeof value === "function");
}
__name4(isObject, "isObject");
function getTraceable(ctx, value, noTrap) {
  if (!isObject(value)) return value;
  if (Object.hasOwn(value, symbols.shadow)) {
    return Object.getPrototypeOf(value);
  }
  const tracker = value[symbols.tracker];
  if (!tracker) return value;
  return createTraceable(ctx, value, tracker, noTrap);
}
__name4(getTraceable, "getTraceable");
function withProps(target, props) {
  if (!props) return target;
  return new Proxy(target, {
    get: __name4((target2, prop, receiver) => {
      if (prop in props && prop !== "constructor") return Reflect.get(props, prop, receiver);
      return Reflect.get(target2, prop, receiver);
    }, "get"),
    set: __name4((target2, prop, value, receiver) => {
      if (prop in props && prop !== "constructor") return Reflect.set(props, prop, value, receiver);
      return Reflect.set(target2, prop, value, receiver);
    }, "set")
  });
}
__name4(withProps, "withProps");
function withProp(target, prop, value) {
  return withProps(target, Object.defineProperty(/* @__PURE__ */ Object.create(null), prop, {
    value,
    writable: false
  }));
}
__name4(withProp, "withProp");
function createShadow(ctx, target, property2, receiver) {
  var _a47;
  if (!property2) return receiver;
  const origin = (_a47 = Reflect.getOwnPropertyDescriptor(target, property2)) == null ? void 0 : _a47.value;
  if (!origin) return receiver;
  return withProp(receiver, property2, ctx.extend({ [symbols.shadow]: origin }));
}
__name4(createShadow, "createShadow");
function createShadowMethod(ctx, value, outer, shadow) {
  return new Proxy(value, {
    apply: __name4((target, thisArg, args) => {
      if (thisArg === outer) thisArg = shadow;
      args = args.map((arg) => {
        if (typeof arg !== "function" || arg[symbols.original]) return arg;
        return new Proxy(arg, {
          get: __name4((target2, prop, receiver) => {
            if (prop === symbols.original) return target2;
            const value2 = Reflect.get(target2, prop, receiver);
            if (prop === "toString" && value2 === Function.prototype.toString) {
              return function(...args2) {
                return Reflect.apply(value2, this === receiver ? target2 : this, args2);
              };
            }
            return value2;
          }, "get"),
          apply: __name4((target2, thisArg2, args2) => {
            return Reflect.apply(target2, getTraceable(ctx, thisArg2), args2.map((arg2) => getTraceable(ctx, arg2)));
          }, "apply"),
          construct: __name4((target2, args2, newTarget) => {
            return Reflect.construct(target2, args2.map((arg2) => getTraceable(ctx, arg2)), newTarget);
          }, "construct")
        });
      });
      return getTraceable(ctx, Reflect.apply(target, thisArg, args));
    }, "apply")
  });
}
__name4(createShadowMethod, "createShadowMethod");
function createTraceable(ctx, value, tracker, noTrap) {
  if (ctx[symbols.shadow]) {
    ctx = Object.getPrototypeOf(ctx);
  }
  const proxy = new Proxy(value, {
    get: __name4((target, prop, receiver) => {
      if (prop === symbols.original) return target;
      if (prop === tracker.property) return ctx;
      if (typeof prop === "symbol") {
        return Reflect.get(target, prop, receiver);
      }
      if (tracker.associate && ctx[symbols.internal][`${tracker.associate}.${prop}`]) {
        return Reflect.get(ctx, `${tracker.associate}.${prop}`, withProp(ctx, symbols.receiver, receiver));
      }
      const shadow = createShadow(ctx, target, tracker.property, receiver);
      const innerValue = Reflect.get(target, prop, shadow);
      const innerTracker = innerValue == null ? void 0 : innerValue[symbols.tracker];
      if (innerTracker) {
        return createTraceable(ctx, innerValue, innerTracker);
      } else if (!noTrap && typeof innerValue === "function") {
        return createShadowMethod(ctx, innerValue, receiver, shadow);
      } else {
        return innerValue;
      }
    }, "get"),
    set: __name4((target, prop, value2, receiver) => {
      if (prop === symbols.original) return false;
      if (prop === tracker.property) return false;
      if (typeof prop === "symbol") {
        return Reflect.set(target, prop, value2, receiver);
      }
      if (tracker.associate && ctx[symbols.internal][`${tracker.associate}.${prop}`]) {
        return Reflect.set(ctx, `${tracker.associate}.${prop}`, value2, withProp(ctx, symbols.receiver, receiver));
      }
      const shadow = createShadow(ctx, target, tracker.property, receiver);
      return Reflect.set(target, prop, value2, shadow);
    }, "set"),
    apply: __name4((target, thisArg, args) => {
      return applyTraceable(proxy, target, thisArg, args);
    }, "apply")
  });
  return proxy;
}
__name4(createTraceable, "createTraceable");
function applyTraceable(proxy, value, thisArg, args) {
  if (!value[symbols.invoke]) return Reflect.apply(value, thisArg, args);
  return value[symbols.invoke].apply(proxy, args);
}
__name4(applyTraceable, "applyTraceable");
function createCallable(name, proto, tracker) {
  const self = __name4(function(...args) {
    const proxy = createTraceable(self["ctx"], self, tracker);
    return applyTraceable(proxy, self, this, args);
  }, "self");
  defineProperty(self, "name", name);
  return Object.setPrototypeOf(self, proto);
}
__name4(createCallable, "createCallable");
var _a;
var ReflectService = (_a = class {
  constructor(ctx) {
    this.ctx = ctx;
    defineProperty(this, symbols.tracker, {
      associate: "reflect",
      property: "ctx"
    });
    this._mixin("reflect", ["get", "set", "provide", "accessor", "mixin", "alias"]);
    this._mixin("scope", ["config", "runtime", "effect", "collect", "accept", "decline"]);
    this._mixin("registry", ["using", "inject", "plugin"]);
    this._mixin("lifecycle", ["on", "once", "parallel", "emit", "serial", "bail", "start", "stop"]);
  }
  static resolveInject(ctx, name) {
    let internal = ctx[symbols.internal][name];
    while ((internal == null ? void 0 : internal.type) === "alias") {
      name = internal.name;
      internal = ctx[symbols.internal][name];
    }
    return [name, internal];
  }
  static checkInject(ctx, name, error) {
    ctx = ctx[symbols.shadow] ?? ctx;
    if (["prototype", "then", "registry", "lifecycle"].includes(name)) return;
    if (name[0] === "$" || name[0] === "_") return;
    if (!ctx.runtime.plugin) return;
    if (ctx.bail(ctx, "internal/inject", name)) return;
    const lines = error.stack.split("\n");
    lines.splice(1, 1);
    error.stack = lines.join("\n");
    ctx.emit(ctx, "internal/warning", error);
  }
  get(name) {
    var _a47;
    const internal = this.ctx[symbols.internal][name];
    if ((internal == null ? void 0 : internal.type) !== "service") return;
    const key = this.ctx[symbols.isolate][name];
    const value = (_a47 = this.ctx[symbols.store][key]) == null ? void 0 : _a47.value;
    return getTraceable(this.ctx, value);
  }
  set(name, value) {
    var _a47;
    this.provide(name);
    const key = this.ctx[symbols.isolate][name];
    const oldValue = (_a47 = this.ctx[symbols.store][key]) == null ? void 0 : _a47.value;
    value ?? (value = void 0);
    let dispose = __name4(() => {
    }, "dispose");
    if (oldValue === value) return dispose;
    if (!isNullable(value) && !isNullable(oldValue)) {
      throw new Error(`service ${name} has been registered`);
    }
    const ctx = this.ctx;
    if (!isNullable(value)) {
      dispose = ctx.effect(() => () => {
        ctx.set(name, void 0);
      });
    }
    if (isUnproxyable(value)) {
      ctx.emit(ctx, "internal/warning", new Error(`service ${name} is an unproxyable object, which may lead to unexpected behavior`));
    }
    const self = Object.create(ctx);
    self[symbols.filter] = (ctx2) => {
      return ctx[symbols.isolate][name] === ctx2[symbols.isolate][name];
    };
    ctx.emit(self, "internal/before-service", name, value);
    ctx[symbols.store][key] = { value, source: ctx };
    ctx.emit(self, "internal/service", name, oldValue);
    return dispose;
  }
  provide(name, value, builtin2) {
    const internal = this.ctx.root[symbols.internal];
    if (name in internal) return;
    const key = Symbol(name);
    internal[name] = { type: "service", builtin: builtin2 };
    this.ctx.root[symbols.isolate][name] = key;
    if (!isObject(value)) return;
    this.ctx[symbols.store][key] = { value, source: null };
    defineProperty(value, symbols.tracker, {
      associate: name,
      property: "ctx"
    });
  }
  _accessor(name, options) {
    const internal = this.ctx.root[symbols.internal];
    if (name in internal) return () => {
    };
    internal[name] = { type: "accessor", ...options };
    return () => delete this.ctx.root[symbols.isolate][name];
  }
  accessor(name, options) {
    this.ctx.scope.effect(() => {
      return this._accessor(name, options);
    });
  }
  alias(name, aliases) {
    const internal = this.ctx.root[symbols.internal];
    if (name in internal) return;
    for (const key of aliases) {
      internal[key] || (internal[key] = { type: "alias", name });
    }
  }
  _mixin(source, mixins) {
    const entries = Array.isArray(mixins) ? mixins.map((key) => [key, key]) : Object.entries(mixins);
    const getTarget = typeof source === "string" ? (ctx) => ctx[source] : () => source;
    const disposables = entries.map(([key, value]) => {
      return this._accessor(value, {
        get(receiver) {
          const service = getTarget(this);
          if (isNullable(service)) return service;
          const mixin = receiver ? withProps(receiver, service) : service;
          const value2 = Reflect.get(service, key, mixin);
          if (typeof value2 !== "function") return value2;
          return value2.bind(mixin ?? service);
        },
        set(value2, receiver) {
          const service = getTarget(this);
          const mixin = receiver ? withProps(receiver, service) : service;
          return Reflect.set(service, key, value2, mixin);
        }
      });
    });
    return () => disposables.forEach((dispose) => dispose());
  }
  mixin(source, mixins) {
    this.ctx.scope.effect(() => {
      return this._mixin(source, mixins);
    });
  }
  trace(value) {
    return getTraceable(this.ctx, value);
  }
  bind(callback) {
    return new Proxy(callback, {
      apply: __name4((target, thisArg, args) => {
        return target.apply(this.trace(thisArg), args.map((arg) => this.trace(arg)));
      }, "apply")
    });
  }
}, __name4(_a, "ReflectService"), __publicField(_a, "handler", {
  get: __name4((target, prop, ctx) => {
    if (typeof prop !== "string") return Reflect.get(target, prop, ctx);
    if (Reflect.has(target, prop)) {
      return getTraceable(ctx, Reflect.get(target, prop, ctx), true);
    }
    const [name, internal] = _a.resolveInject(target, prop);
    const error = new Error(`property ${name} is not registered, declare it as \`inject\` to suppress this warning`);
    if (!internal) {
      _a.checkInject(ctx, name, error);
      return Reflect.get(target, name, ctx);
    } else if (internal.type === "accessor") {
      return internal.get.call(ctx, ctx[symbols.receiver]);
    } else {
      if (!internal.builtin) _a.checkInject(ctx, name, error);
      return ctx.reflect.get(name);
    }
  }, "get"),
  set: __name4((target, prop, value, ctx) => {
    if (typeof prop !== "string") return Reflect.set(target, prop, value, ctx);
    const [name, internal] = _a.resolveInject(target, prop);
    if (!internal) {
      return Reflect.set(target, name, value, ctx);
    }
    if (internal.type === "accessor") {
      if (!internal.set) return false;
      return internal.set.call(ctx, value, ctx[symbols.receiver]);
    } else {
      ctx.reflect.set(name, value);
      return true;
    }
  }, "set"),
  has: __name4((target, prop) => {
    if (typeof prop !== "string") return Reflect.has(target, prop);
    if (Reflect.has(target, prop)) return true;
    const [, internal] = _a.resolveInject(target, prop);
    return !!internal;
  }, "has")
}), _a);
var reflect_default = ReflectService;
function isBailed(value) {
  return value !== null && value !== false && value !== void 0;
}
__name4(isBailed, "isBailed");
var _a2;
var Lifecycle = (_a2 = class {
  constructor(ctx) {
    __publicField(this, "isActive", false);
    __publicField(this, "_tasks", /* @__PURE__ */ new Set());
    __publicField(this, "_hooks", {});
    this.ctx = ctx;
    defineProperty(this, symbols.tracker, {
      associate: "lifecycle",
      property: "ctx"
    });
    defineProperty(this.on("internal/listener", function(name, listener, options) {
      const method = options.prepend ? "unshift" : "push";
      if (name === "ready") {
        if (!this.lifecycle.isActive) return;
        this.scope.ensure(async () => listener());
        return () => false;
      } else if (name === "dispose") {
        this.scope.disposables[method](listener);
        defineProperty(listener, "name", "event <dispose>");
        return () => remove(this.scope.disposables, listener);
      } else if (name === "fork") {
        this.scope.runtime.forkables[method](listener);
        return this.scope.collect("event <fork>", () => remove(this.scope.runtime.forkables, listener));
      }
    }), Context.static, ctx.scope);
    for (const level of ["info", "error", "warning"]) {
      defineProperty(this.on(`internal/${level}`, (format, ...param) => {
        if (this._hooks[`internal/${level}`].length > 1) return;
        console.info(format, ...param);
      }), Context.static, ctx.scope);
    }
    defineProperty(this.on("internal/before-service", function(name) {
      var _a47;
      for (const runtime of this.registry.values()) {
        if (!((_a47 = runtime.inject[name]) == null ? void 0 : _a47.required)) continue;
        const scopes = runtime.isReusable ? runtime.children : [runtime];
        for (const scope of scopes) {
          if (!this[symbols.filter](scope.ctx)) continue;
          scope.updateStatus();
          scope.reset();
        }
      }
    }, { global: true }), Context.static, ctx.scope);
    defineProperty(this.on("internal/service", function(name) {
      var _a47;
      for (const runtime of this.registry.values()) {
        if (!((_a47 = runtime.inject[name]) == null ? void 0 : _a47.required)) continue;
        const scopes = runtime.isReusable ? runtime.children : [runtime];
        for (const scope of scopes) {
          if (!this[symbols.filter](scope.ctx)) continue;
          scope.start();
        }
      }
    }, { global: true }), Context.static, ctx.scope);
    const checkInject = __name4((scope, name) => {
      if (!scope.runtime.plugin) return false;
      for (const key in scope.runtime.inject) {
        if (name === reflect_default.resolveInject(scope.ctx, key)[0]) return true;
      }
      return checkInject(scope.parent.scope, name);
    }, "checkInject");
    defineProperty(this.on("internal/inject", function(name) {
      return checkInject(this.scope, name);
    }, { global: true }), Context.static, ctx.scope);
  }
  async flush() {
    while (this._tasks.size) {
      await Promise.all(Array.from(this._tasks));
    }
  }
  filterHooks(hooks, thisArg) {
    thisArg = getTraceable(this.ctx, thisArg);
    return hooks.slice().filter((hook) => {
      const filter2 = thisArg == null ? void 0 : thisArg[Context.filter];
      return hook.global || !filter2 || filter2.call(thisArg, hook.ctx);
    });
  }
  *dispatch(type, args) {
    const thisArg = typeof args[0] === "object" || typeof args[0] === "function" ? args.shift() : null;
    const name = args.shift();
    if (name !== "internal/event") {
      this.emit("internal/event", type, name, args, thisArg);
    }
    for (const hook of this.filterHooks(this._hooks[name] || [], thisArg)) {
      yield hook.callback.apply(thisArg, args);
    }
  }
  async parallel(...args) {
    await Promise.all(this.dispatch("emit", args));
  }
  emit(...args) {
    Array.from(this.dispatch("emit", args));
  }
  async serial(...args) {
    for await (const result of this.dispatch("serial", args)) {
      if (isBailed(result)) return result;
    }
  }
  bail(...args) {
    for (const result of this.dispatch("bail", args)) {
      if (isBailed(result)) return result;
    }
  }
  register(label, hooks, callback, options) {
    const method = options.prepend ? "unshift" : "push";
    hooks[method]({ ctx: this.ctx, callback, ...options });
    return this.ctx.state.collect(label, () => this.unregister(hooks, callback));
  }
  unregister(hooks, callback) {
    const index = hooks.findIndex((hook) => hook.callback === callback);
    if (index >= 0) {
      hooks.splice(index, 1);
      return true;
    }
  }
  on(name, listener, options) {
    var _a47;
    if (typeof options !== "object") {
      options = { prepend: options };
    }
    this.ctx.scope.assertActive();
    listener = this.ctx.reflect.bind(listener);
    const result = this.bail(this.ctx, "internal/listener", name, listener, options);
    if (result) return result;
    const hooks = (_a47 = this._hooks)[name] || (_a47[name] = []);
    const label = typeof name === "string" ? `event <${name}>` : "event (Symbol)";
    return this.register(label, hooks, listener, options);
  }
  once(name, listener, options) {
    const dispose = this.on(name, function(...args) {
      dispose();
      return listener.apply(this, args);
    }, options);
    return dispose;
  }
  async start() {
    this.isActive = true;
    const hooks = this._hooks.ready || [];
    while (hooks.length) {
      const { ctx, callback } = hooks.shift();
      ctx.scope.ensure(async () => callback());
    }
    await this.flush();
  }
  async stop() {
    this.isActive = false;
    this.ctx.scope.reset();
  }
}, __name4(_a2, "Lifecycle"), _a2);
var events_default = Lifecycle;
var ScopeStatus = ((ScopeStatus2) => {
  ScopeStatus2[ScopeStatus2["PENDING"] = 0] = "PENDING";
  ScopeStatus2[ScopeStatus2["LOADING"] = 1] = "LOADING";
  ScopeStatus2[ScopeStatus2["ACTIVE"] = 2] = "ACTIVE";
  ScopeStatus2[ScopeStatus2["FAILED"] = 3] = "FAILED";
  ScopeStatus2[ScopeStatus2["DISPOSED"] = 4] = "DISPOSED";
  return ScopeStatus2;
})(ScopeStatus || {});
var _a3;
var CordisError = (_a3 = class extends Error {
  constructor(code, message) {
    super(message ?? _a3.Code[code]);
    this.code = code;
  }
}, __name4(_a3, "CordisError"), _a3);
((CordisError2) => {
  CordisError2.Code = {
    INACTIVE_EFFECT: "cannot create effect on inactive context"
  };
})(CordisError || (CordisError = {}));
var _a4;
var EffectScope = (_a4 = class {
  constructor(parent, config) {
    __publicField(this, "uid");
    __publicField(this, "ctx");
    __publicField(this, "disposables", []);
    __publicField(this, "error");
    __publicField(this, "status", 0);
    __publicField(this, "isActive", false);
    // Same as `this.ctx`, but with a more specific type.
    __publicField(this, "context");
    __publicField(this, "proxy");
    __publicField(this, "acceptors", []);
    __publicField(this, "tasks", /* @__PURE__ */ new Set());
    __publicField(this, "hasError", false);
    this.parent = parent;
    this.config = config;
    this.uid = parent.registry ? parent.registry.counter : 0;
    this.ctx = this.context = parent.extend({ scope: this });
    this.proxy = new Proxy({}, {
      get: __name4((target, key) => Reflect.get(this.config, key), "get")
    });
  }
  get _config() {
    return this.runtime.isReactive ? this.proxy : this.config;
  }
  assertActive() {
    if (this.uid !== null || this.isActive) return;
    throw new CordisError("INACTIVE_EFFECT");
  }
  effect(callback, config) {
    this.assertActive();
    const result = isConstructor(callback) ? new callback(this.ctx, config) : callback(this.ctx, config);
    let disposed = false;
    const original = typeof result === "function" ? result : result.dispose.bind(result);
    const wrapped = __name4((...args) => {
      if (disposed) return;
      disposed = true;
      remove(this.disposables, wrapped);
      return original(...args);
    }, "wrapped");
    this.disposables.push(wrapped);
    if (typeof result === "function") return wrapped;
    result.dispose = wrapped;
    return result;
  }
  collect(label, callback) {
    const dispose = defineProperty(() => {
      remove(this.disposables, dispose);
      return callback();
    }, "name", label);
    this.disposables.push(dispose);
    return dispose;
  }
  restart() {
    this.reset();
    this.error = null;
    this.hasError = false;
    this.status = 0;
    this.start();
  }
  _getStatus() {
    if (this.uid === null) return 4;
    if (this.hasError) return 3;
    if (this.tasks.size) return 1;
    if (this.ready) return 2;
    return 0;
  }
  updateStatus(callback) {
    const oldValue = this.status;
    callback == null ? void 0 : callback();
    this.status = this._getStatus();
    if (oldValue !== this.status) {
      this.context.emit("internal/status", this, oldValue);
    }
  }
  ensure(callback) {
    const task = callback().catch((reason) => {
      this.context.emit(this.ctx, "internal/error", reason);
      this.cancel(reason);
    }).finally(() => {
      this.updateStatus(() => this.tasks.delete(task));
      this.context.events._tasks.delete(task);
    });
    this.updateStatus(() => this.tasks.add(task));
    this.context.events._tasks.add(task);
  }
  cancel(reason) {
    this.error = reason;
    this.updateStatus(() => this.hasError = true);
    this.reset();
  }
  get ready() {
    return Object.entries(this.runtime.inject).every(([name, inject]) => {
      return !inject.required || !isNullable(this.ctx.get(name));
    });
  }
  reset() {
    this.isActive = false;
    this.disposables = this.disposables.splice(0).filter((dispose) => {
      if (this.uid !== null && dispose[Context.static] === this) return true;
      (async () => dispose())().catch((reason) => {
        this.context.emit(this.ctx, "internal/error", reason);
      });
    });
  }
  init(error) {
    if (!this.config) {
      this.cancel(error);
    } else {
      this.start();
    }
  }
  start() {
    if (!this.ready || this.isActive || this.uid === null) return true;
    this.isActive = true;
    this.updateStatus(() => this.hasError = false);
  }
  accept(...args) {
    const keys = Array.isArray(args[0]) ? args.shift() : null;
    const acceptor = { keys, callback: args[0], ...args[1] };
    return this.effect(() => {
      var _a47;
      this.acceptors.push(acceptor);
      if (acceptor.immediate) (_a47 = acceptor.callback) == null ? void 0 : _a47.call(acceptor, this.config);
      return () => remove(this.acceptors, acceptor);
    });
  }
  decline(keys) {
    return this.accept(keys, () => true);
  }
  checkUpdate(resolved, forced) {
    if (forced || !this.config) return [true, true];
    if (forced === false) return [false, false];
    const modified = /* @__PURE__ */ Object.create(null);
    const checkPropertyUpdate = __name4((key) => {
      const result = modified[key] ?? (modified[key] = !deepEqual(this.config[key], resolved[key]));
      hasUpdate || (hasUpdate = result);
      return result;
    }, "checkPropertyUpdate");
    const ignored = /* @__PURE__ */ new Set();
    let hasUpdate = false, shouldRestart = false;
    let fallback2 = this.runtime.isReactive || null;
    for (const { keys, callback, passive } of this.acceptors) {
      if (!keys) {
        fallback2 || (fallback2 = !passive);
      } else if (passive) {
        keys == null ? void 0 : keys.forEach((key) => ignored.add(key));
      } else {
        let hasUpdate2 = false;
        for (const key of keys) {
          hasUpdate2 || (hasUpdate2 = checkPropertyUpdate(key));
        }
        if (!hasUpdate2) continue;
      }
      const result = callback == null ? void 0 : callback(resolved);
      if (result) shouldRestart = true;
    }
    for (const key in { ...this.config, ...resolved }) {
      if (fallback2 === false) continue;
      if (!(key in modified) && !ignored.has(key)) {
        const hasUpdate2 = checkPropertyUpdate(key);
        if (fallback2 === null) shouldRestart || (shouldRestart = hasUpdate2);
      }
    }
    return [hasUpdate, shouldRestart];
  }
}, __name4(_a4, "EffectScope"), _a4);
var _a5;
var ForkScope = (_a5 = class extends EffectScope {
  constructor(parent, runtime, config, error) {
    super(parent, config);
    __publicField(this, "dispose");
    this.runtime = runtime;
    this.dispose = defineProperty(parent.scope.collect(`fork <${parent.runtime.name}>`, () => {
      this.uid = null;
      this.reset();
      this.context.emit("internal/fork", this);
      const result = remove(runtime.disposables, this.dispose);
      if (remove(runtime.children, this) && !runtime.children.length) {
        parent.registry.delete(runtime.plugin);
      }
      return result;
    }), Context.static, runtime);
    runtime.children.push(this);
    runtime.disposables.push(this.dispose);
    this.context.emit("internal/fork", this);
    this.init(error);
  }
  start() {
    if (super.start()) return true;
    for (const fork of this.runtime.forkables) {
      this.ensure(async () => fork(this.context, this._config));
    }
  }
  update(config, forced) {
    const oldConfig = this.config;
    const state = this.runtime.isForkable ? this : this.runtime;
    if (state.config !== oldConfig) return;
    let resolved;
    try {
      resolved = resolveConfig(this.runtime.plugin, config);
    } catch (error) {
      this.context.emit("internal/error", error);
      return this.cancel(error);
    }
    const [hasUpdate, shouldRestart] = state.checkUpdate(resolved, forced);
    this.context.emit("internal/before-update", this, config);
    this.config = resolved;
    state.config = resolved;
    if (hasUpdate) {
      this.context.emit("internal/update", this, oldConfig);
    }
    if (shouldRestart) state.restart();
  }
}, __name4(_a5, "ForkScope"), _a5);
var _a6;
var MainScope = (_a6 = class extends EffectScope {
  constructor(ctx, plugin, config, error) {
    super(ctx, config);
    __publicField(this, "value");
    __publicField(this, "runtime", this);
    __publicField(this, "schema");
    __publicField(this, "name");
    __publicField(this, "inject", /* @__PURE__ */ Object.create(null));
    __publicField(this, "forkables", []);
    __publicField(this, "children", []);
    __publicField(this, "isReusable", false);
    __publicField(this, "isReactive", false);
    __publicField(this, "apply", __name4((context, config) => {
      if (typeof this.plugin !== "function") {
        return this.plugin.apply(context, config);
      } else if (isConstructor(this.plugin)) {
        const instance = new this.plugin(context, config);
        const name = instance[Context.expose];
        if (name) {
          context.set(name, instance);
        }
        if (instance["fork"]) {
          this.forkables.push(instance["fork"].bind(instance));
        }
        return instance;
      } else {
        return this.plugin(context, config);
      }
    }, "apply"));
    this.plugin = plugin;
    if (!plugin) {
      this.name = "root";
      this.isActive = true;
    } else {
      this.setup();
      this.init(error);
    }
  }
  get isForkable() {
    return this.forkables.length > 0;
  }
  fork(parent, config, error) {
    return new ForkScope(parent, this, config, error);
  }
  dispose() {
    this.uid = null;
    this.reset();
    this.context.emit("internal/runtime", this);
    return true;
  }
  setup() {
    const { name } = this.plugin;
    if (name && name !== "apply") this.name = name;
    this.schema = this.plugin["Config"] || this.plugin["schema"];
    this.inject = Inject.resolve(this.plugin["using"] || this.plugin["inject"]);
    this.isReusable = this.plugin["reusable"];
    this.isReactive = this.plugin["reactive"];
    this.context.emit("internal/runtime", this);
    if (this.isReusable) {
      this.forkables.push(this.apply);
    }
  }
  reset() {
    super.reset();
    for (const fork of this.children) {
      fork.reset();
    }
  }
  start() {
    if (super.start()) return true;
    if (!this.isReusable && this.plugin) {
      this.ensure(async () => this.value = this.apply(this.ctx, this._config));
    }
    for (const fork of this.children) {
      fork.start();
    }
  }
  update(config, forced) {
    if (this.isForkable) {
      const warning = new Error(`attempting to update forkable plugin "${this.plugin.name}", which may lead to unexpected behavior`);
      this.context.emit(this.ctx, "internal/warning", warning);
    }
    const oldConfig = this.config;
    let resolved;
    try {
      resolved = resolveConfig(this.runtime.plugin || this.context.constructor, config);
    } catch (error) {
      this.context.emit("internal/error", error);
      return this.cancel(error);
    }
    const [hasUpdate, shouldRestart] = this.checkUpdate(resolved, forced);
    const state = this.children.find((fork) => fork.config === oldConfig);
    this.config = resolved;
    if (state) {
      this.context.emit("internal/before-update", state, config);
      state.config = resolved;
      if (hasUpdate) {
        this.context.emit("internal/update", state, oldConfig);
      }
    }
    if (shouldRestart) this.restart();
  }
}, __name4(_a6, "MainScope"), _a6);
function isApplicable(object) {
  return object && typeof object === "object" && typeof object.apply === "function";
}
__name4(isApplicable, "isApplicable");
function Inject(inject) {
  return function(value, ctx) {
    if (ctx.kind === "class") {
      value.inject = inject;
    } else if (ctx.kind === "method") {
      ctx.addInitializer(function() {
        var _a47;
        const property2 = (_a47 = this[symbols.tracker]) == null ? void 0 : _a47.property;
        if (!property2) throw new Error("missing context tracker");
        this[property2].inject(inject, (ctx2) => {
          value.call(withProps(this, { [property2]: ctx2 }));
        });
      });
    } else {
      throw new Error("@Inject can only be used on class or class methods");
    }
  };
}
__name4(Inject, "Inject");
((Inject2) => {
  function resolve(inject) {
    if (!inject) return {};
    if (Array.isArray(inject)) {
      return Object.fromEntries(inject.map((name) => [name, { required: true }]));
    }
    const { required, optional, ...rest } = inject;
    if (Array.isArray(required)) {
      Object.assign(rest, Object.fromEntries(required.map((name) => [name, { required: true }])));
    }
    if (Array.isArray(optional)) {
      Object.assign(rest, Object.fromEntries(optional.map((name) => [name, { required: false }])));
    }
    return rest;
  }
  Inject2.resolve = resolve;
  __name4(resolve, "resolve");
})(Inject || (Inject = {}));
var _a7;
var Registry = (_a7 = class {
  constructor(ctx, config) {
    __publicField(this, "_counter", 0);
    __publicField(this, "_internal", /* @__PURE__ */ new Map());
    __publicField(this, "context");
    this.ctx = ctx;
    defineProperty(this, symbols.tracker, {
      associate: "registry",
      property: "ctx"
    });
    this.context = ctx;
    const runtime = new MainScope(ctx, null, config);
    ctx.scope = runtime;
    runtime.ctx = ctx;
    this.set(null, runtime);
  }
  get counter() {
    return ++this._counter;
  }
  get size() {
    return this._internal.size;
  }
  resolve(plugin, assert = false) {
    if (plugin === null) return plugin;
    if (typeof plugin === "function") return plugin;
    if (isApplicable(plugin)) return plugin.apply;
    if (assert) throw new Error('invalid plugin, expect function or object with an "apply" method, received ' + typeof plugin);
  }
  get(plugin) {
    const key = this.resolve(plugin);
    return key && this._internal.get(key);
  }
  has(plugin) {
    const key = this.resolve(plugin);
    return !!key && this._internal.has(key);
  }
  set(plugin, state) {
    const key = this.resolve(plugin);
    this._internal.set(key, state);
  }
  delete(plugin) {
    const key = this.resolve(plugin);
    const runtime = key && this._internal.get(key);
    if (!runtime) return;
    this._internal.delete(key);
    runtime.dispose();
    return runtime;
  }
  keys() {
    return this._internal.keys();
  }
  values() {
    return this._internal.values();
  }
  entries() {
    return this._internal.entries();
  }
  forEach(callback) {
    return this._internal.forEach(callback);
  }
  using(inject, callback) {
    return this.inject(inject, callback);
  }
  inject(inject, callback) {
    return this.plugin({ inject, apply: callback, name: callback.name });
  }
  plugin(plugin, config, error) {
    this.resolve(plugin, true);
    this.ctx.scope.assertActive();
    if (!error) {
      try {
        config = resolveConfig(plugin, config);
      } catch (reason) {
        this.context.emit(this.ctx, "internal/error", reason);
        error = reason;
        config = null;
      }
    }
    let runtime = this.get(plugin);
    if (runtime) {
      if (!runtime.isForkable) {
        this.context.emit(this.ctx, "internal/warning", new Error(`duplicate plugin detected: ${plugin.name}`));
      }
      return runtime.fork(this.ctx, config, error);
    }
    runtime = new MainScope(this.ctx, plugin, config, error);
    this.set(plugin, runtime);
    return runtime.fork(this.ctx, config, error);
  }
}, __name4(_a7, "Registry"), _a7);
var registry_default = Registry;
var _a8;
var Context = (_a8 = class {
  static is(value) {
    return !!(value == null ? void 0 : value[_a8.is]);
  }
  /** @deprecated use `Service.traceable` instead */
  static associate(object, name) {
    return object;
  }
  constructor(config) {
    config = resolveConfig(this.constructor, config);
    this[symbols.store] = /* @__PURE__ */ Object.create(null);
    this[symbols.isolate] = /* @__PURE__ */ Object.create(null);
    this[symbols.internal] = /* @__PURE__ */ Object.create(null);
    this[symbols.intercept] = /* @__PURE__ */ Object.create(null);
    const self = new Proxy(this, reflect_default.handler);
    self.root = self;
    self.reflect = new reflect_default(self);
    self.registry = new registry_default(self, config);
    self.lifecycle = new events_default(self);
    const attach = __name4((internal) => {
      var _a47;
      if (!internal) return;
      attach(Object.getPrototypeOf(internal));
      for (const key of Object.getOwnPropertyNames(internal)) {
        const constructor = (_a47 = internal[key]["prototype"]) == null ? void 0 : _a47.constructor;
        if (!constructor) continue;
        self[internal[key]["key"]] = new constructor(self, config);
        defineProperty(self[internal[key]["key"]], "ctx", self);
      }
    }, "attach");
    attach(this[symbols.internal]);
    return self;
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return `Context <${this.name}>`;
  }
  get name() {
    let runtime = this.runtime;
    while (runtime && !runtime.name) {
      runtime = runtime.parent.runtime;
    }
    return runtime == null ? void 0 : runtime.name;
  }
  get events() {
    return this.lifecycle;
  }
  /** @deprecated */
  get state() {
    return this.scope;
  }
  extend(meta = {}) {
    var _a47;
    const source = (_a47 = Reflect.getOwnPropertyDescriptor(this, symbols.shadow)) == null ? void 0 : _a47.value;
    const self = Object.assign(Object.create(getTraceable(this, this)), meta);
    if (!source) return self;
    return Object.assign(Object.create(self), { [symbols.shadow]: source });
  }
  isolate(name, label) {
    const shadow = Object.create(this[symbols.isolate]);
    shadow[name] = label ?? Symbol(name);
    return this.extend({ [symbols.isolate]: shadow });
  }
  intercept(name, config) {
    const intercept = Object.create(this[symbols.intercept]);
    intercept[name] = config;
    return this.extend({ [symbols.intercept]: intercept });
  }
}, __name4(_a8, "Context"), __publicField(_a8, "store", symbols.store), __publicField(_a8, "events", symbols.events), __publicField(_a8, "static", symbols.static), __publicField(_a8, "filter", symbols.filter), __publicField(_a8, "expose", symbols.expose), __publicField(_a8, "isolate", symbols.isolate), __publicField(_a8, "internal", symbols.internal), __publicField(_a8, "intercept", symbols.intercept), __publicField(_a8, "origin", "ctx"), __publicField(_a8, "current", "ctx"), _a8.is[Symbol.toPrimitive] = () => Symbol.for("cordis.is"), _a8.prototype[_a8.is] = true, _a8);
Context.prototype[Context.internal] = /* @__PURE__ */ Object.create(null);
var _a9;
var Service = (_a9 = class {
  constructor(...args) {
    __publicField(this, "ctx");
    __publicField(this, "name");
    __publicField(this, "config");
    let _ctx, name, immediate, config;
    if (Context.is(args[0])) {
      _ctx = args[0];
      if (typeof args[1] === "string") {
        name = args[1];
        immediate = args[2];
      } else {
        config = args[1];
      }
    } else {
      config = args[0];
    }
    name ?? (name = this.constructor[symbols.provide]);
    immediate ?? (immediate = this.constructor[symbols.immediate]);
    let self = this;
    const tracker = {
      associate: name,
      property: "ctx"
    };
    if (self[symbols.invoke]) {
      self = createCallable(name, joinPrototype(Object.getPrototypeOf(this), Function.prototype), tracker);
    }
    if (_ctx) {
      self.ctx = _ctx;
    } else {
      self[symbols.setup]();
    }
    self.name = name;
    self.config = config;
    defineProperty(self, symbols.tracker, tracker);
    self.ctx.provide(name);
    self.ctx.runtime.name = name;
    if (immediate) {
      if (_ctx) self[symbols.expose] = name;
      else self.ctx.set(name, self);
    }
    self.ctx.on("ready", async () => {
      await Promise.resolve();
      await self.start();
      if (!immediate) self.ctx.set(name, self);
    });
    self.ctx.on("dispose", () => self.stop());
    return self;
  }
  start() {
  }
  stop() {
  }
  [symbols.filter](ctx) {
    return ctx[symbols.isolate][this.name] === this.ctx[symbols.isolate][this.name];
  }
  [symbols.setup]() {
    this.ctx = new Context();
  }
  [symbols.extend](props) {
    let self;
    if (this[_a9.invoke]) {
      self = createCallable(this.name, this, this[symbols.tracker]);
    } else {
      self = Object.create(this);
    }
    return Object.assign(self, props);
  }
  static [Symbol.hasInstance](instance) {
    var _a47;
    let constructor = instance.constructor;
    while (constructor) {
      constructor = (_a47 = constructor.prototype) == null ? void 0 : _a47.constructor;
      if (constructor === this) return true;
      constructor = Object.getPrototypeOf(constructor);
    }
    return false;
  }
}, __name4(_a9, "Service"), __publicField(_a9, "setup", symbols.setup), __publicField(_a9, "invoke", symbols.invoke), __publicField(_a9, "extend", symbols.extend), __publicField(_a9, "tracker", symbols.tracker), __publicField(_a9, "provide", symbols.provide), __publicField(_a9, "immediate", symbols.immediate), _a9);

// node_modules/reggol/lib/browser.mjs
var import_supports_color = __toESM(require_browser(), 1);
var import_object_inspect = __toESM(require_object_inspect(), 1);
var __create = Object.create;
var __defProp5 = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames2 = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name5 = (target, value) => __defProp5(target, "name", { value, configurable: true });
var __commonJS3 = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames2(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames2(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp5(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM2 = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp5(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var require_shared = __commonJS3({
  "src/shared.ts"(exports, module) {
    "use strict";
    var _a47;
    var c16 = [6, 2, 3, 4, 5, 1];
    var c256 = [
      20,
      21,
      26,
      27,
      32,
      33,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      56,
      57,
      62,
      63,
      68,
      69,
      74,
      75,
      76,
      77,
      78,
      79,
      80,
      81,
      92,
      93,
      98,
      99,
      112,
      113,
      129,
      134,
      135,
      148,
      149,
      160,
      161,
      162,
      163,
      164,
      165,
      166,
      167,
      168,
      169,
      170,
      171,
      172,
      173,
      178,
      179,
      184,
      185,
      196,
      197,
      198,
      199,
      200,
      201,
      202,
      203,
      204,
      205,
      206,
      207,
      208,
      209,
      214,
      215,
      220,
      221
    ];
    function isAggregateError(error) {
      return error instanceof Error && Array.isArray(error["errors"]);
    }
    __name5(isAggregateError, "isAggregateError");
    var Logger = (_a47 = class {
      constructor(name, meta) {
        __publicField(this, "extend", __name5((namespace) => {
          return new _a47(`${this.name}:${namespace}`, this.meta);
        }, "extend"));
        __publicField(this, "warning", __name5((format, ...args) => {
          this.warn(format, ...args);
        }, "warning"));
        this.name = name;
        this.meta = meta;
        this.createMethod("success", _a47.SUCCESS);
        this.createMethod("error", _a47.ERROR);
        this.createMethod("info", _a47.INFO);
        this.createMethod("warn", _a47.WARN);
        this.createMethod("debug", _a47.DEBUG);
      }
      static format(name, formatter) {
        this.formatters[name] = formatter;
      }
      static color(target, code, value, decoration = "") {
        if (!target.colors) return "" + value;
        return `\x1B[3${code < 8 ? code : "8;5;" + code}${target.colors >= 2 ? decoration : ""}m${value}\x1B[0m`;
      }
      static code(name, target) {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
          hash = (hash << 3) - hash + name.charCodeAt(i) + 13;
          hash |= 0;
        }
        const colors = !target.colors ? [] : target.colors >= 2 ? c256 : c16;
        return colors[Math.abs(hash) % colors.length];
      }
      static render(target, record) {
        var _a48, _b7, _c3;
        const prefix = `[${record.type[0].toUpperCase()}]`;
        const space = " ".repeat(((_a48 = target.label) == null ? void 0 : _a48.margin) ?? 1);
        let indent = 3 + space.length, output = "";
        if (target.showTime) {
          indent += target.showTime.length + space.length;
          output += _a47.color(target, 8, Time.template(target.showTime)) + space;
        }
        const code = _a47.code(record.name, target);
        const label = _a47.color(target, code, record.name, ";1");
        const padLength = (((_b7 = target.label) == null ? void 0 : _b7.width) ?? 0) + label.length - record.name.length;
        if (((_c3 = target.label) == null ? void 0 : _c3.align) === "right") {
          output += label.padStart(padLength) + space + prefix + space;
          indent += (target.label.width ?? 0) + space.length;
        } else {
          output += prefix + space + label.padEnd(padLength) + space;
        }
        output += record.content.replace(/\n/g, "\n" + " ".repeat(indent));
        if (target.showDiff && target.timestamp) {
          const diff = record.timestamp - target.timestamp;
          output += _a47.color(target, code, " +" + Time.format(diff));
        }
        return output;
      }
      createMethod(type, level) {
        this[type] = (...args) => {
          if (args.length === 1 && args[0] instanceof Error) {
            if (args[0].cause) {
              this[type](args[0].cause);
            } else if (isAggregateError(args[0])) {
              args[0].errors.forEach((error) => this[type](error));
              return;
            }
          }
          const id = ++_a47.id;
          const timestamp = Date.now();
          for (const target of _a47.targets) {
            if (this.getLevel(target) < level) continue;
            const content = this.format(target, ...args);
            const record = { id, type, level, name: this.name, meta: this.meta, content, timestamp };
            if (target.record) {
              target.record(record);
            } else {
              const { print = console.log } = target;
              print(_a47.render(target, record));
            }
            target.timestamp = timestamp;
          }
        };
      }
      format(target, ...args) {
        if (args[0] instanceof Error) {
          args[0] = args[0].stack || args[0].message;
          args.unshift("%s");
        } else if (typeof args[0] !== "string") {
          args.unshift("%o");
        }
        let format = args.shift();
        format = format.replace(/%([a-zA-Z%])/g, (match, char) => {
          if (match === "%%") return "%";
          const formatter = _a47.formatters[char];
          if (typeof formatter === "function") {
            const value = args.shift();
            return formatter(value, target, this);
          }
          return match;
        });
        for (let arg of args) {
          if (typeof arg === "object" && arg) {
            arg = _a47.formatters["o"](arg, target, this);
          }
          format += " " + arg;
        }
        const { maxLength = 10240 } = target;
        return format.split(/\r?\n/g).map((line) => {
          return line.slice(0, maxLength) + (line.length > maxLength ? "..." : "");
        }).join("\n");
      }
      getLevel(target) {
        const paths = this.name.split(":");
        let config = (target == null ? void 0 : target.levels) || _a47.levels;
        do {
          config = config[paths.shift()] ?? config["base"];
        } while (paths.length && typeof config === "object");
        return config;
      }
      get level() {
        return this.getLevel();
      }
      set level(value) {
        const paths = this.name.split(":");
        let config = _a47.levels;
        while (paths.length > 1) {
          const name = paths.shift();
          const value2 = config[name];
          if (typeof value2 === "object") {
            config = value2;
          } else {
            config = config[name] = { base: value2 ?? config.base };
          }
        }
        config[paths[0]] = value;
      }
    }, __name5(_a47, "Logger"), // log levels
    __publicField(_a47, "SILENT", 0), __publicField(_a47, "SUCCESS", 1), __publicField(_a47, "ERROR", 1), __publicField(_a47, "INFO", 2), __publicField(_a47, "WARN", 2), __publicField(_a47, "DEBUG", 3), // global config
    __publicField(_a47, "id", 0), __publicField(_a47, "targets", [{
      colors: import_supports_color.stdout && import_supports_color.stdout.level,
      print(text) {
        console.log(text);
      }
    }]), // global registry
    __publicField(_a47, "formatters", /* @__PURE__ */ Object.create(null)), __publicField(_a47, "levels", {
      base: 2
    }), _a47);
    Logger.format("s", (value) => value);
    Logger.format("d", (value) => +value);
    Logger.format("j", (value) => JSON.stringify(value));
    Logger.format("c", (value, target, logger5) => {
      return Logger.color(target, Logger.code(logger5.name, target), value);
    });
    Logger.format("C", (value, target) => {
      return Logger.color(target, 15, value, ";1");
    });
    module.exports = Logger;
  }
});
var require_browser2 = __commonJS3({
  "src/browser.ts"(exports, module) {
    var import_shared = __toESM2(require_shared());
    import_shared.default.format("o", (value, target) => {
      return (0, import_object_inspect.default)(value, { depth: Infinity }).replace(/\s*\n\s*/g, " ");
    });
    module.exports = import_shared.default;
  }
});
var browser_default = require_browser2();

// node_modules/@cordisjs/logger/lib/index.mjs
var __defProp6 = Object.defineProperty;
var __name6 = (target, value) => __defProp6(target, "name", { value, configurable: true });
var _a10;
var LoggerService = (_a10 = class extends Service {
  constructor(ctx) {
    super(ctx, "logger", true);
    ctx.on("internal/info", function(format, ...args) {
      this.logger("app").info(format, ...args);
    });
    ctx.on("internal/error", function(format, ...args) {
      this.logger("app").error(format, ...args);
    });
    ctx.on("internal/warning", function(format, ...args) {
      this.logger("app").warn(format, ...args);
    });
  }
  [Service.invoke](name) {
    return new browser_default(name, defineProperty({}, "ctx", this.ctx));
  }
}, __name6(_a10, "LoggerService"), (() => {
  for (const type of ["success", "error", "info", "warn", "debug", "extend"]) {
    _a10.prototype[type] = function(...args) {
      return this(this.ctx.name)[type](...args);
    };
  }
})(), _a10);

// node_modules/schemastery/lib/index.mjs
var __defProp7 = Object.defineProperty;
var __getOwnPropNames3 = Object.getOwnPropertyNames;
var __name7 = (target, value) => __defProp7(target, "name", { value, configurable: true });
var __commonJS4 = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames3(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var require_src2 = __commonJS4({
  "src/index.ts"(exports, module) {
    var kSchema = Symbol.for("schemastery");
    globalThis.__schemastery_index__ ?? (globalThis.__schemastery_index__ = 0);
    var Schema = __name7(function(options) {
      const schema = __name7(function(data, options2) {
        return Schema.resolve(data, schema, options2)[0];
      }, "schema");
      if (options.refs) {
        const refs2 = mapValues(options.refs, (options2) => new Schema(options2));
        const getRef = __name7((uid) => refs2[uid], "getRef");
        for (const key in refs2) {
          const options2 = refs2[key];
          options2.sKey = getRef(options2.sKey);
          options2.inner = getRef(options2.inner);
          options2.list = options2.list && options2.list.map(getRef);
          options2.dict = options2.dict && mapValues(options2.dict, getRef);
        }
        return refs2[options.uid];
      }
      Object.assign(schema, options);
      if (typeof schema.callback === "string") {
        try {
          schema.callback = new Function("return " + schema.callback)();
        } catch {
        }
      }
      Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
      Object.setPrototypeOf(schema, Schema.prototype);
      schema.meta || (schema.meta = {});
      schema.toString = schema.toString.bind(schema);
      return schema;
    }, "Schema");
    Schema.prototype = Object.create(Function.prototype);
    Schema.prototype[kSchema] = true;
    var refs;
    Schema.prototype.toJSON = __name7(function toJSON() {
      var _a47;
      if (refs) {
        refs[_a47 = this.uid] ?? (refs[_a47] = JSON.parse(JSON.stringify({ ...this })));
        return this.uid;
      }
      refs = { [this.uid]: { ...this } };
      refs[this.uid] = JSON.parse(JSON.stringify({ ...this }));
      const result = { uid: this.uid, refs };
      refs = void 0;
      return result;
    }, "toJSON");
    Schema.prototype.set = __name7(function set(key, value) {
      this.dict[key] = value;
      return this;
    }, "set");
    Schema.prototype.push = __name7(function push(value) {
      this.list.push(value);
      return this;
    }, "push");
    function mergeDesc(original, messages) {
      const result = typeof original === "string" ? { "": original } : { ...original };
      for (const locale in messages) {
        const value = messages[locale];
        if ((value == null ? void 0 : value.$description) || (value == null ? void 0 : value.$desc)) {
          result[locale] = value.$description || value.$desc;
        } else if (typeof value === "string") {
          result[locale] = value;
        }
      }
      return result;
    }
    __name7(mergeDesc, "mergeDesc");
    function getInner(value) {
      return (value == null ? void 0 : value.$value) ?? (value == null ? void 0 : value.$inner);
    }
    __name7(getInner, "getInner");
    function extractKeys(data) {
      return filterKeys(data ?? {}, (key) => !key.startsWith("$"));
    }
    __name7(extractKeys, "extractKeys");
    Schema.prototype.i18n = __name7(function i18n(messages) {
      const schema = Schema(this);
      schema.meta.description = mergeDesc(schema.meta.description, messages);
      if (schema.dict) {
        schema.dict = mapValues(schema.dict, (inner, key) => {
          return inner.i18n(mapValues(messages, (data) => {
            var _a47;
            return ((_a47 = getInner(data)) == null ? void 0 : _a47[key]) ?? (data == null ? void 0 : data[key]);
          }));
        });
      }
      if (schema.list) {
        schema.list = schema.list.map((inner, index) => {
          return inner.i18n(mapValues(messages, (data = {}) => {
            if (Array.isArray(getInner(data))) return getInner(data)[index];
            if (Array.isArray(data)) return data[index];
            return extractKeys(data);
          }));
        });
      }
      if (schema.inner) {
        schema.inner = schema.inner.i18n(mapValues(messages, (data) => {
          if (getInner(data)) return getInner(data);
          return extractKeys(data);
        }));
      }
      if (schema.sKey) {
        schema.sKey = schema.sKey.i18n(mapValues(messages, (data) => data == null ? void 0 : data.$key));
      }
      return schema;
    }, "i18n");
    Schema.prototype.extra = __name7(function extra(key, value) {
      const schema = Schema(this);
      schema.meta = { ...schema.meta, [key]: value };
      return schema;
    }, "extra");
    for (const key of ["required", "disabled", "collapse", "hidden", "loose"]) {
      Object.assign(Schema.prototype, {
        [key](value = true) {
          const schema = Schema(this);
          schema.meta = { ...schema.meta, [key]: value };
          return schema;
        }
      });
    }
    Schema.prototype.deprecated = __name7(function deprecated() {
      var _a47;
      const schema = Schema(this);
      (_a47 = schema.meta).badges || (_a47.badges = []);
      schema.meta.badges.push({ text: "deprecated", type: "danger" });
      return schema;
    }, "deprecated");
    Schema.prototype.experimental = __name7(function experimental() {
      var _a47;
      const schema = Schema(this);
      (_a47 = schema.meta).badges || (_a47.badges = []);
      schema.meta.badges.push({ text: "experimental", type: "warning" });
      return schema;
    }, "experimental");
    Schema.prototype.pattern = __name7(function pattern(regexp) {
      const schema = Schema(this);
      const pattern2 = pick(regexp, ["source", "flags"]);
      schema.meta = { ...schema.meta, pattern: pattern2 };
      return schema;
    }, "pattern");
    Schema.prototype.simplify = __name7(function simplify(value) {
      if (deepEqual(value, this.meta.default, this.type === "dict")) return null;
      if (isNullable(value)) return value;
      if (this.type === "object" || this.type === "dict") {
        const result = {};
        for (const key in value) {
          const schema = this.type === "object" ? this.dict[key] : this.inner;
          const item = schema == null ? void 0 : schema.simplify(value[key]);
          if (this.type === "dict" || !isNullable(item)) result[key] = item;
        }
        if (deepEqual(result, this.meta.default, this.type === "dict")) return null;
        return result;
      } else if (this.type === "array" || this.type === "tuple") {
        const result = [];
        value.forEach((value2, index) => {
          const schema = this.type === "array" ? this.inner : this.list[index];
          const item = schema ? schema.simplify(value2) : value2;
          result.push(item);
        });
        return result;
      } else if (this.type === "intersect") {
        const result = {};
        for (const item of this.list) {
          Object.assign(result, item.simplify(value));
        }
        return result;
      } else if (this.type === "union") {
        for (const schema of this.list) {
          try {
            Schema.resolve(value, schema);
            return schema.simplify(value);
          } catch {
          }
        }
      }
      return value;
    }, "simplify");
    Schema.prototype.toString = __name7(function toString(inline) {
      var _a47;
      return ((_a47 = formatters[this.type]) == null ? void 0 : _a47.call(formatters, this, inline)) ?? `Schema<${this.type}>`;
    }, "toString");
    Schema.prototype.role = __name7(function role(role, extra) {
      const schema = Schema(this);
      schema.meta = { ...schema.meta, role, extra };
      return schema;
    }, "role");
    for (const key of ["default", "link", "comment", "description", "max", "min", "step"]) {
      Object.assign(Schema.prototype, {
        [key](value) {
          const schema = Schema(this);
          schema.meta = { ...schema.meta, [key]: value };
          return schema;
        }
      });
    }
    var resolvers = {};
    Schema.extend = __name7(function extend2(type, resolve) {
      resolvers[type] = resolve;
    }, "extend");
    Schema.resolve = __name7(function resolve(data, schema, options = {}, strict = false) {
      var _a47;
      if (!schema) return [data];
      if ((_a47 = options.ignore) == null ? void 0 : _a47.call(options, data, schema)) return [data];
      if (isNullable(data)) {
        if (schema.meta.required) throw new TypeError(`missing required value`);
        let current = schema;
        let fallback2 = schema.meta.default;
        while ((current == null ? void 0 : current.type) === "intersect" && isNullable(fallback2)) {
          current = current.list[0];
          fallback2 = current == null ? void 0 : current.meta.default;
        }
        if (isNullable(fallback2)) return [data];
        data = clone(fallback2);
      }
      const callback = resolvers[schema.type];
      if (!callback) throw new TypeError(`unsupported type "${schema.type}"`);
      try {
        return callback(data, schema, options, strict);
      } catch (error) {
        if (!schema.meta.loose) throw error;
        return [schema.meta.default];
      }
    }, "resolve");
    Schema.from = __name7(function from(source) {
      if (isNullable(source)) {
        return Schema.any();
      } else if (["string", "number", "boolean"].includes(typeof source)) {
        return Schema.const(source).required();
      } else if (source[kSchema]) {
        return source;
      } else if (typeof source === "function") {
        switch (source) {
          case String:
            return Schema.string().required();
          case Number:
            return Schema.number().required();
          case Boolean:
            return Schema.boolean().required();
          case Function:
            return Schema.function().required();
          default:
            return Schema.is(source).required();
        }
      } else {
        throw new TypeError(`cannot infer schema from ${source}`);
      }
    }, "from");
    Schema.natural = __name7(function natural() {
      return Schema.number().step(1).min(0);
    }, "natural");
    Schema.percent = __name7(function percent() {
      return Schema.number().step(0.01).min(0).max(1).role("slider");
    }, "percent");
    Schema.date = __name7(function date() {
      return Schema.union([
        Schema.is(Date),
        Schema.transform(Schema.string().role("datetime"), (value) => {
          const date2 = new Date(value);
          if (isNaN(+date2)) throw new TypeError(`invalid date "${value}"`);
          return date2;
        }, true)
      ]);
    }, "date");
    Schema.extend("any", (data) => {
      return [data];
    });
    Schema.extend("never", (data) => {
      throw new TypeError(`expected nullable but got ${data}`);
    });
    Schema.extend("const", (data, { value }) => {
      if (data === value) return [value];
      throw new TypeError(`expected ${value} but got ${data}`);
    });
    function checkWithinRange(data, meta, description, skipMin = false) {
      const { max = Infinity, min = -Infinity } = meta;
      if (data > max) throw new TypeError(`expected ${description} <= ${max} but got ${data}`);
      if (data < min && !skipMin) throw new TypeError(`expected ${description} >= ${min} but got ${data}`);
    }
    __name7(checkWithinRange, "checkWithinRange");
    Schema.extend("string", (data, { meta }) => {
      if (typeof data !== "string") throw new TypeError(`expected string but got ${data}`);
      if (meta.pattern) {
        const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
        if (!regexp.test(data)) throw new TypeError(`expect string to match regexp ${regexp}`);
      }
      checkWithinRange(data.length, meta, "string length");
      return [data];
    });
    function decimalShift(data, digits) {
      const str = data.toString();
      if (str.includes("e")) return data * Math.pow(10, digits);
      const index = str.indexOf(".");
      if (index === -1) return data * Math.pow(10, digits);
      const frac = str.slice(index + 1);
      const integer = str.slice(0, index);
      if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
      return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
    }
    __name7(decimalShift, "decimalShift");
    function isMultipleOf(data, min, step) {
      step = Math.abs(step);
      if (!/^\d+\.\d+$/.test(step.toString())) {
        return (data - min) % step === 0;
      }
      const index = step.toString().indexOf(".");
      const digits = step.toString().slice(index + 1).length;
      return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
    }
    __name7(isMultipleOf, "isMultipleOf");
    Schema.extend("number", (data, { meta }) => {
      if (typeof data !== "number") throw new TypeError(`expected number but got ${data}`);
      checkWithinRange(data, meta, "number");
      const { step } = meta;
      if (step && !isMultipleOf(data, meta.min ?? 0, step)) {
        throw new TypeError(`expected number multiple of ${step} but got ${data}`);
      }
      return [data];
    });
    Schema.extend("boolean", (data) => {
      if (typeof data === "boolean") return [data];
      throw new TypeError(`expected boolean but got ${data}`);
    });
    Schema.extend("bitset", (data, { bits, meta }) => {
      let value = 0, keys = [];
      if (typeof data === "number") {
        value = data;
        for (const key in bits) {
          if (data & bits[key]) {
            keys.push(key);
          }
        }
      } else if (Array.isArray(data)) {
        keys = data;
        for (const key of keys) {
          if (typeof key !== "string") throw new TypeError(`expected string but got ${key}`);
          if (key in bits) value |= bits[key];
        }
      } else {
        throw new TypeError(`expected number or array but got ${data}`);
      }
      if (value === meta.default) return [value];
      return [value, keys];
    });
    Schema.extend("function", (data) => {
      if (typeof data === "function") return [data];
      throw new TypeError(`expected function but got ${data}`);
    });
    Schema.extend("is", (data, { callback }) => {
      if (data instanceof callback) return [data];
      throw new TypeError(`expected ${callback.name} but got ${data}`);
    });
    function property2(data, key, schema, options) {
      try {
        const [value, adapted] = Schema.resolve(data[key], schema, options);
        if (adapted !== void 0) data[key] = adapted;
        return value;
      } catch (e) {
        if (!(options == null ? void 0 : options.autofix)) throw e;
        delete data[key];
        return schema.meta.default;
      }
    }
    __name7(property2, "property");
    Schema.extend("array", (data, { inner, meta }, options) => {
      if (!Array.isArray(data)) throw new TypeError(`expected array but got ${data}`);
      checkWithinRange(data.length, meta, "array length", !isNullable(inner.meta.default));
      return [data.map((_, index) => property2(data, index, inner, options))];
    });
    Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
      if (!isPlainObject(data)) throw new TypeError(`expected object but got ${data}`);
      const result = {};
      for (const key in data) {
        let rKey;
        try {
          rKey = Schema.resolve(key, sKey)[0];
        } catch (error) {
          if (strict) continue;
          throw error;
        }
        result[rKey] = property2(data, key, inner, options);
        data[rKey] = data[key];
        if (key !== rKey) delete data[key];
      }
      return [result];
    });
    Schema.extend("tuple", (data, { list }, options, strict) => {
      if (!Array.isArray(data)) throw new TypeError(`expected array but got ${data}`);
      const result = list.map((inner, index) => property2(data, index, inner, options));
      if (strict) return [result];
      result.push(...data.slice(list.length));
      return [result];
    });
    function merge2(result, data) {
      for (const key in data) {
        if (key in result) continue;
        result[key] = data[key];
      }
    }
    __name7(merge2, "merge");
    Schema.extend("object", (data, { dict }, options, strict) => {
      if (!isPlainObject(data)) throw new TypeError(`expected object but got ${data}`);
      const result = {};
      for (const key in dict) {
        const value = property2(data, key, dict[key], options);
        if (!isNullable(value) || key in data) {
          result[key] = value;
        }
      }
      if (!strict) merge2(result, data);
      return [result];
    });
    Schema.extend("union", (data, { list, toString }, options, strict) => {
      const messages = [];
      for (const inner of list) {
        try {
          return Schema.resolve(data, inner, options, strict);
        } catch (error) {
          messages.push(error);
        }
      }
      throw new TypeError(`expected ${toString()} but got ${JSON.stringify(data)}`);
    });
    Schema.extend("intersect", (data, { list, toString }, options, strict) => {
      let result;
      for (const inner of list) {
        const value = Schema.resolve(data, inner, options, true)[0];
        if (isNullable(value)) continue;
        if (isNullable(result)) {
          result = value;
        } else if (typeof result !== typeof value) {
          throw new TypeError(`expected ${toString()} but got ${JSON.stringify(data)}`);
        } else if (typeof value === "object") {
          merge2(result ?? (result = {}), value);
        } else if (result !== value) {
          throw new TypeError(`expected ${toString()} but got ${JSON.stringify(data)}`);
        }
      }
      if (!strict && isPlainObject(data)) merge2(result, data);
      return [result];
    });
    Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
      const [result, adapted = data] = Schema.resolve(data, inner, options, true);
      if (preserve) {
        return [callback(result)];
      } else {
        return [callback(result), callback(adapted)];
      }
    });
    var formatters = {};
    function defineMethod(name, keys, format) {
      formatters[name] = format;
      Object.assign(Schema, {
        [name](...args) {
          const schema = new Schema({ type: name });
          keys.forEach((key, index) => {
            var _a47;
            switch (key) {
              case "sKey":
                schema.sKey = args[index] ?? Schema.string();
                break;
              case "inner":
                schema.inner = Schema.from(args[index]);
                break;
              case "list":
                schema.list = args[index].map(Schema.from);
                break;
              case "dict":
                schema.dict = mapValues(args[index], Schema.from);
                break;
              case "bits": {
                schema.bits = {};
                for (const key2 in args[index]) {
                  if (typeof args[index][key2] !== "number") continue;
                  schema.bits[key2] = args[index][key2];
                }
                break;
              }
              case "callback": {
                schema.callback = args[index];
                (_a47 = schema.callback)["toJSON"] || (_a47["toJSON"] = () => schema.callback.toString());
                break;
              }
              default:
                schema[key] = args[index];
            }
          });
          if (name === "object" || name === "dict") {
            schema.meta.default = {};
          } else if (name === "array" || name === "tuple") {
            schema.meta.default = [];
          } else if (name === "bitset") {
            schema.meta.default = 0;
          }
          return schema;
        }
      });
    }
    __name7(defineMethod, "defineMethod");
    defineMethod("is", ["callback"], ({ callback }) => callback.name);
    defineMethod("any", [], () => "any");
    defineMethod("never", [], () => "never");
    defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
    defineMethod("string", [], () => "string");
    defineMethod("number", [], () => "number");
    defineMethod("boolean", [], () => "boolean");
    defineMethod("bitset", ["bits"], () => "bitset");
    defineMethod("function", [], () => "function");
    defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
    defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
    defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
    defineMethod("object", ["dict"], ({ dict }) => {
      if (Object.keys(dict).length === 0) return "{}";
      return `{ ${Object.entries(dict).map(([key, inner]) => {
        return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
      }).join(", ")} }`;
    });
    defineMethod("union", ["list"], ({ list }, inline) => {
      const result = list.map(({ toString: format }) => format()).join(" | ");
      return inline ? `(${result})` : result;
    });
    defineMethod("intersect", ["list"], ({ list }) => {
      return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
    });
    defineMethod("transform", ["inner", "callback", "preserve"], ({ inner }, isInner) => inner.toString(isInner));
    module.exports = Schema;
  }
});
var lib_default2 = require_src2();

// node_modules/@cordisjs/schema/lib/index.mjs
var __defProp8 = Object.defineProperty;
var __name8 = (target, value) => __defProp8(target, "name", { value, configurable: true });
var kSchemaOrder = Symbol("cordis.schema.order");
var _a11;
var SchemaService = (_a11 = class {
  constructor(ctx) {
    __publicField(this, "_data", lib_default2.intersect([]));
    this.ctx = ctx;
    defineProperty(this, Service.tracker, {
      property: "ctx"
    });
  }
  extend(schema, order = 0) {
    const index = this._data.list.findIndex((a) => a[kSchemaOrder] < order);
    schema[kSchemaOrder] = order;
    return this.ctx.effect(() => {
      if (index >= 0) {
        this._data.list.splice(index, 0, schema);
      } else {
        this._data.list.push(schema);
      }
      this.ctx.emit("internal/service-schema");
      return () => {
        remove(this._data.list, schema);
        this.ctx.emit("internal/service-schema");
      };
    });
  }
  toJSON() {
    return this._data.toJSON();
  }
}, __name8(_a11, "SchemaService"), _a11);

// node_modules/@cordisjs/timer/lib/index.mjs
var __defProp9 = Object.defineProperty;
var __name9 = (target, value) => __defProp9(target, "name", { value, configurable: true });
var _a12;
var TimerService = (_a12 = class extends Service {
  constructor(ctx) {
    super(ctx, "timer", true);
    ctx.mixin("timer", ["setTimeout", "setInterval", "sleep", "throttle", "debounce"]);
  }
  setTimeout(callback, delay) {
    const dispose = this[Context.current].effect(() => {
      const timer = setTimeout(() => {
        dispose();
        callback();
      }, delay);
      return () => clearTimeout(timer);
    });
    return dispose;
  }
  setInterval(callback, delay) {
    return this[Context.current].effect(() => {
      const timer = setInterval(callback, delay);
      return () => clearInterval(timer);
    });
  }
  sleep(delay) {
    const caller = this[Context.current];
    return new Promise((resolve, reject) => {
      const dispose1 = this.setTimeout(() => {
        dispose1();
        dispose2();
        resolve();
      }, delay);
      const dispose2 = caller.on("dispose", () => {
        dispose1();
        dispose2();
        reject(new Error("Context has been disposed"));
      });
    });
  }
  createWrapper(callback, isDisposed = false) {
    const caller = this[Context.current];
    caller.scope.assertActive();
    let timer;
    const dispose = __name9(() => {
      isDisposed = true;
      remove(caller.scope.disposables, dispose);
      clearTimeout(timer);
    }, "dispose");
    const wrapper = __name9((...args) => {
      clearTimeout(timer);
      timer = callback(args, () => !isDisposed && caller.scope.isActive);
    }, "wrapper");
    wrapper.dispose = dispose;
    caller.scope.disposables.push(dispose);
    return wrapper;
  }
  throttle(callback, delay, noTrailing) {
    let lastCall = -Infinity;
    const execute = __name9((...args) => {
      lastCall = Date.now();
      callback(...args);
    }, "execute");
    return this.createWrapper((args, isActive) => {
      const now = Date.now();
      const remaining = delay - (now - lastCall);
      if (remaining <= 0) {
        execute(...args);
      } else if (isActive()) {
        return setTimeout(execute, remaining, ...args);
      }
    }, noTrailing);
  }
  debounce(callback, delay) {
    return this.createWrapper((args, isActive) => {
      if (!isActive())
        return;
      return setTimeout(callback, delay, ...args);
    });
  }
}, __name9(_a12, "TimerService"), _a12);

// node_modules/cordis/lib/index.mjs
var __defProp10 = Object.defineProperty;
var __name10 = (target, value) => __defProp10(target, "name", { value, configurable: true });
var _a13;
var Context2 = (_a13 = class extends Context {
  constructor(config) {
    var _a47, _b7;
    super(config);
    __publicField(this, "baseDir");
    this.baseDir = ((_b7 = (_a47 = globalThis.process) == null ? void 0 : _a47.cwd) == null ? void 0 : _b7.call(_a47)) || "";
    this.provide("logger", void 0, true);
    this.provide("timer", void 0, true);
    this.plugin(LoggerService);
    this.plugin(TimerService);
  }
}, __name10(_a13, "Context"), _a13);
var _a14;
var Service2 = (_a14 = class extends Service {
  constructor(...args) {
    super(...args);
    /** @deprecated use `this.ctx.logger` instead */
    __publicField(this, "logger");
    __publicField(this, "schema");
    this.logger = this.ctx.logger(this.name);
    this.schema = new SchemaService(this.ctx);
  }
  [Service.setup]() {
    this.ctx = new Context2();
  }
}, __name10(_a14, "Service"), _a14);
function src_default() {
}
__name10(src_default, "default");

// node_modules/minato/lib/index.mjs
var __defProp11 = Object.defineProperty;
var __name11 = (target, value) => __defProp11(target, "name", { value, configurable: true });
var Type;
((Type2) => {
  Type2.kType = Symbol.for("minato.type");
  Type2.Any = fromField("expr");
  Type2.Boolean = fromField("boolean");
  Type2.Number = fromField("double");
  Type2.String = fromField("string");
  Type2.Object = __name11((obj) => defineProperty({
    type: "json",
    inner: globalThis.Object.keys(obj ?? {}).length ? mapValues(obj, (value) => isType(value) ? value : fromField(value)) : void 0
  }, Type2.kType, true), "Object");
  Type2.Array = __name11((type) => defineProperty({
    type: "json",
    inner: type,
    array: true
  }, Type2.kType, true), "Array");
  function fromPrimitive(value) {
    if (isNullable(value)) return fromField("expr");
    else if (typeof value === "number") return Type2.Number;
    else if (typeof value === "string") return Type2.String;
    else if (typeof value === "boolean") return Type2.Boolean;
    else if (typeof value === "bigint") return fromField("bigint");
    else if (value instanceof Date) return fromField("timestamp");
    else if (Binary.is(value)) return fromField("binary");
    else if (globalThis.Array.isArray(value)) return (0, Type2.Array)(value.length ? fromPrimitive(value[0]) : void 0);
    else if (typeof value === "object") return fromField("json");
    throw new TypeError(`invalid primitive: ${value}`);
  }
  Type2.fromPrimitive = fromPrimitive;
  __name11(fromPrimitive, "fromPrimitive");
  function fromField(field) {
    var _a47;
    if (isType(field)) return field;
    else if (field === "array") return (0, Type2.Array)();
    else if (field === "object") return (0, Type2.Object)();
    else if (typeof field === "string") return defineProperty({ type: field }, Type2.kType, true);
    else if (field.type) return field.type;
    else if ((_a47 = field.expr) == null ? void 0 : _a47[Type2.kType]) return field.expr[Type2.kType];
    throw new TypeError(`invalid field: ${field}`);
  }
  Type2.fromField = fromField;
  __name11(fromField, "fromField");
  function fromTerm(value, initial) {
    if (isEvalExpr(value)) return value[Type2.kType] ?? initial ?? fromField("expr");
    else return fromPrimitive(value);
  }
  Type2.fromTerm = fromTerm;
  __name11(fromTerm, "fromTerm");
  function fromTerms(values, initial) {
    return values.map((x) => fromTerm(x)).find((type) => type.type !== "expr") ?? initial ?? fromField("expr");
  }
  Type2.fromTerms = fromTerms;
  __name11(fromTerms, "fromTerms");
  function isType(value) {
    return (value == null ? void 0 : value[Type2.kType]) === true;
  }
  Type2.isType = isType;
  __name11(isType, "isType");
  function isArray2(type) {
    return (type == null ? void 0 : type.type) === "json" && (type == null ? void 0 : type.array);
  }
  Type2.isArray = isArray2;
  __name11(isArray2, "isArray");
  function getInner(type, key) {
    if (!(type == null ? void 0 : type.inner)) return;
    if (isArray2(type)) return type.inner;
    if (isNullable(key)) return;
    if (type.inner[key]) return type.inner[key];
    if (key.includes(".")) return key.split(".").reduce((t, k) => getInner(t, k), type);
    const fields = globalThis.Object.entries(type.inner).filter(([k]) => k.startsWith(`${key}.`)).map(([k, v]) => [k.slice(key.length + 1), v]);
    return fields.length ? (0, Type2.Object)(globalThis.Object.fromEntries(fields)) : void 0;
  }
  Type2.getInner = getInner;
  __name11(getInner, "getInner");
  function transform(value, type, callback) {
    if (!isNullable(value) && (type == null ? void 0 : type.inner)) {
      if (Type2.isArray(type)) {
        return value.map((x) => callback(x, Type2.getInner(type))).filter((x) => !type.ignoreNull || !isEmpty(x));
      } else {
        if (type.ignoreNull && isEmpty(value)) return null;
        return mapValues(value, (x, k) => callback(x, Type2.getInner(type, k)));
      }
    }
    return value;
  }
  Type2.transform = transform;
  __name11(transform, "transform");
})(Type || (Type = {}));
var Primary = Symbol("minato.primary");
var Relation;
((Relation4) => {
  const Marker = Symbol("minato.relation");
  Relation4.Type = ["oneToOne", "oneToMany", "manyToOne", "manyToMany"];
  function buildAssociationTable(...tables) {
    return "_" + tables.sort().join("_");
  }
  Relation4.buildAssociationTable = buildAssociationTable;
  __name11(buildAssociationTable, "buildAssociationTable");
  function buildAssociationKey(key, table) {
    return `${table}.${key}`;
  }
  Relation4.buildAssociationKey = buildAssociationKey;
  __name11(buildAssociationKey, "buildAssociationKey");
  function buildSharedKey(field, reference) {
    return [field, reference].sort().join("_");
  }
  Relation4.buildSharedKey = buildSharedKey;
  __name11(buildSharedKey, "buildSharedKey");
  function parse(def, key, model, relmodel, subprimary) {
    const shared = !def.shared ? {} : typeof def.shared === "string" ? { [def.shared]: def.shared } : Array.isArray(def.shared) ? Object.fromEntries(def.shared.map((x) => [x, x])) : def.shared;
    const fields = def.fields ?? (subprimary || def.type === "manyToOne" || def.type === "oneToOne" && (model.name === relmodel.name || !makeArray(relmodel.primary).every((key2) => {
      var _a47;
      return !((_a47 = relmodel.fields[key2]) == null ? void 0 : _a47.nullable);
    })) ? makeArray(relmodel.primary).map((x) => `${key}.${x}`) : model.primary);
    const relation = {
      type: def.type,
      table: def.table ?? relmodel.name,
      fields: makeArray(fields),
      shared,
      references: makeArray(def.references ?? relmodel.primary),
      required: def.type !== "manyToOne" && model.name !== relmodel.name && makeArray(fields).every((key2) => {
        var _a47;
        return !((_a47 = model.fields[key2]) == null ? void 0 : _a47.nullable) || makeArray(model.primary).includes(key2);
      })
    };
    Object.entries(shared).forEach(([k, v]) => {
      relation.fields = relation.fields.filter((x) => x !== k);
      relation.references = relation.references.filter((x) => x !== v);
    });
    const inverse = {
      type: relation.type === "oneToMany" ? "manyToOne" : relation.type === "manyToOne" ? "oneToMany" : relation.type,
      table: model.name,
      fields: relation.references,
      references: relation.fields,
      shared: Object.fromEntries(Object.entries(shared).map(([k, v]) => [v, k])),
      required: relation.type !== "oneToMany" && relation.references.every((key2) => {
        var _a47;
        return !((_a47 = relmodel.fields[key2]) == null ? void 0 : _a47.nullable) || makeArray(relmodel.primary).includes(key2);
      })
    };
    if (inverse.required) relation.required = false;
    return [relation, inverse];
  }
  Relation4.parse = parse;
  __name11(parse, "parse");
})(Relation || (Relation = {}));
var Field;
((Field22) => {
  Field22.number = ["integer", "unsigned", "float", "double", "decimal"];
  Field22.string = ["char", "string", "text"];
  Field22.boolean = ["boolean"];
  Field22.date = ["timestamp", "date", "time"];
  Field22.object = ["list", "json"];
  const NewType = Symbol("minato.newtype");
  const regexp = /^(\w+)(?:\((.+)\))?$/;
  function parse(source) {
    if (typeof source === "function") throw new TypeError("view field is not supported");
    if (typeof source !== "string") {
      return {
        initial: null,
        deftype: source.type,
        ...source,
        type: Type.fromField(source.type)
      };
    }
    const capture = regexp.exec(source);
    if (!capture) throw new TypeError("invalid field definition");
    const type = capture[1];
    const args = (capture[2] || "").split(",");
    const field = { deftype: type, type: Type.fromField(type) };
    if (field.initial === void 0) field.initial = getInitial(type);
    if (type === "decimal") {
      field.precision = +args[0];
      field.scale = +args[1];
    } else if (args[0]) {
      field.length = +args[0];
    }
    return field;
  }
  Field22.parse = parse;
  __name11(parse, "parse");
  function getInitial(type, initial) {
    if (initial === void 0) {
      if (Field22.number.includes(type)) return 0;
      if (Field22.string.includes(type)) return "";
      if (type === "list") return [];
      if (type === "json") return {};
    }
    return initial;
  }
  Field22.getInitial = getInitial;
  __name11(getInitial, "getInitial");
  function available(field) {
    return !!field && !field.deprecated && !field.relation && field.deftype !== "expr";
  }
  Field22.available = available;
  __name11(available, "available");
})(Field || (Field = {}));
var _a15;
var Model = (_a15 = class {
  constructor(name) {
    __publicField(this, "fields", {});
    __publicField(this, "migrations", /* @__PURE__ */ new Map());
    this.name = name;
    this.autoInc = false;
    this.primary = "id";
    this.unique = [];
    this.indexes = [];
    this.foreign = {};
  }
  extend(fields = {}, config = {}) {
    var _a47;
    const { primary, autoInc, unique = [], indexes = [], foreign, callback } = config;
    this.primary = primary || this.primary;
    this.autoInc = autoInc || this.autoInc;
    unique.forEach((key) => this.unique.includes(key) || this.unique.push(key));
    indexes.map((x) => this.parseIndex(x)).forEach((index) => this.indexes.some((ind) => deepEqual(ind, index)) || this.indexes.push(index));
    Object.assign(this.foreign, foreign);
    if (callback) this.migrations.set(callback, Object.keys(fields));
    for (const key in fields) {
      this.fields[key] = Field.parse(fields[key]);
      this.fields[key].deprecated = !!callback;
    }
    if (typeof this.primary === "string" && ((_a47 = this.fields[this.primary]) == null ? void 0 : _a47.deftype) === "primary") {
      this.autoInc = true;
    }
    this.checkIndex(this.primary);
    this.unique.forEach((index) => this.checkIndex(index));
    this.indexes.forEach((index) => this.checkIndex(index));
  }
  parseIndex(index) {
    if (typeof index === "string" || Array.isArray(index)) {
      return {
        name: `index:${this.name}:` + makeArray(index).join("+"),
        unique: false,
        keys: Object.fromEntries(makeArray(index).map((key) => [key, "asc"]))
      };
    } else {
      return {
        name: index.name ?? `index:${this.name}:` + Object.keys(index.keys).join("+"),
        unique: index.unique ?? false,
        keys: index.keys
      };
    }
  }
  checkIndex(index) {
    for (const key of typeof index === "string" || Array.isArray(index) ? makeArray(index) : Object.keys(index.keys)) {
      if (!this.fields[key]) {
        throw new TypeError(`missing field definition for index key "${key}"`);
      }
    }
  }
  resolveValue(field, value) {
    if (isNullable(value)) return value;
    if (typeof field === "string") field = this.fields[field];
    if (field) field = Type.fromField(field);
    if ((field == null ? void 0 : field.type) === "time") {
      const date = /* @__PURE__ */ new Date(0);
      date.setHours(value.getHours(), value.getMinutes(), value.getSeconds(), value.getMilliseconds());
      return date;
    } else if ((field == null ? void 0 : field.type) === "date") {
      const date = new Date(value);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    return value;
  }
  resolveModel(obj, model) {
    if (!model) model = this.getType();
    if (isNullable(obj) || !model.inner) return obj;
    if (Type.isArray(model) && Array.isArray(obj)) {
      return obj.map((x) => this.resolveModel(x, Type.getInner(model)));
    }
    const result = {};
    for (const key in obj) {
      const type = Type.getInner(model, key);
      if (!type || isNullable(obj[key])) {
        result[key] = obj[key];
      } else if (type.type !== "json") {
        result[key] = this.resolveValue(type, obj[key]);
      } else if (isEvalExpr(obj[key])) {
        result[key] = obj[key];
      } else if (type.inner && Type.isArray(type) && Array.isArray(obj[key])) {
        result[key] = obj[key].map((x) => this.resolveModel(x, Type.getInner(type)));
      } else if (type.inner) {
        result[key] = this.resolveModel(obj[key], type);
      } else {
        result[key] = obj[key];
      }
    }
    return result;
  }
  format(source, strict = true, prefix = "", result = {}) {
    const fields = Object.keys(this.fields).filter((key) => !this.fields[key].relation);
    Object.entries(source).map(([key, value]) => {
      key = prefix + key;
      if (value === void 0) return;
      if (fields.includes(key)) {
        result[key] = value;
        return;
      }
      const field = fields.find((field2) => key.startsWith(field2 + "."));
      if (field) {
        result[key] = value;
      } else if (isFlat(value)) {
        if (strict && (typeof value !== "object" || Object.keys(value).length)) {
          throw new TypeError(`unknown field "${key}" in model ${this.name}`);
        }
      } else {
        this.format(value, strict, key + ".", result);
      }
    });
    return strict && prefix === "" ? this.resolveModel(result) : result;
  }
  parse(source, strict = true, prefix = "", result = {}) {
    var _a47;
    const fields = Object.keys(this.fields).filter((key) => !this.fields[key].relation);
    if (strict && prefix === "") {
      Object.assign(result, unravel(
        Object.fromEntries(fields.filter((key) => key.includes(".")).map((key) => [key.slice(0, key.lastIndexOf(".")), {}]))
      ));
    }
    for (const key in source) {
      let node = result;
      const segments = key.split(".").reverse();
      for (let index = segments.length - 1; index > 0; index--) {
        const segment = segments[index];
        node = node[segment] ?? (node[segment] = {});
      }
      if (key in source) {
        const fullKey = prefix + key, value = source[key];
        const field = fields.find((field2) => fullKey === field2 || fullKey.startsWith(field2 + "."));
        if (field) {
          node[segments[0]] = value;
        } else if (isFlat(value)) {
          if (strict) {
            throw new TypeError(`unknown field "${fullKey}" in model ${this.name}`);
          } else {
            node[segments[0]] = value;
          }
        } else {
          this.parse(value, strict, fullKey + ".", node[_a47 = segments[0]] ?? (node[_a47] = {}));
        }
      }
    }
    return strict && prefix === "" ? this.resolveModel(result) : result;
  }
  create(data) {
    const result = {};
    const keys = makeArray(this.primary);
    for (const key in this.fields) {
      if (!Field.available(this.fields[key])) continue;
      const { initial } = this.fields[key];
      if (!keys.includes(key) && !isNullable(initial)) {
        result[key] = clone(initial);
      }
    }
    return this.parse({ ...result, ...data });
  }
  avaiableFields() {
    return filterKeys(this.fields, (_, field) => Field.available(field));
  }
  getType(key) {
    if (!this.type) defineProperty(this, "type", Type.Object(mapValues(this.fields, (field) => Type.fromField(field))));
    return key ? Type.getInner(this.type, key) : this.type;
  }
}, __name11(_a15, "Model"), _a15);
function isEvalExpr(value) {
  return value && Object.keys(value).some((key) => key.startsWith("$"));
}
__name11(isEvalExpr, "isEvalExpr");
var isUpdateExpr = isEvalExpr;
function isAggrExpr(expr) {
  return expr["$"] || expr["$select"];
}
__name11(isAggrExpr, "isAggrExpr");
function hasSubquery(value) {
  if (!isEvalExpr(value)) return false;
  return Object.entries(value).filter(([k]) => k.startsWith("$")).some(([k, v]) => {
    if (isNullable(v) || isComparable(v)) return false;
    if (k === "$exec") return true;
    if (isEvalExpr(v)) return hasSubquery(v);
    if (Array.isArray(v)) return v.some((x) => hasSubquery(x));
    if (typeof v === "object") return Object.values(v).some((x) => hasSubquery(x));
    return false;
  });
}
__name11(hasSubquery, "hasSubquery");
var kExpr = Symbol("expr");
var kType = Symbol("type");
var kAggr = Symbol("aggr");
var Eval3 = __name11((key, value, type) => defineProperty(defineProperty({ ["$" + key]: value }, kExpr, true), Type.kType, type), "Eval");
var operators = /* @__PURE__ */ Object.create(null);
operators["$"] = getRecursive;
function unary(key, callback, type) {
  operators[`$${key}`] = callback;
  return (value) => Eval3(key, value, typeof type === "function" ? type(value) : type);
}
__name11(unary, "unary");
function multary(key, callback, type) {
  operators[`$${key}`] = callback;
  return (...args) => Eval3(key, args, typeof type === "function" ? type(...args) : type);
}
__name11(multary, "multary");
function comparator(key, callback) {
  operators[`$${key}`] = (args, data) => {
    const left = executeEval(data, args[0]);
    const right = executeEval(data, args[1]);
    if (isNullable(left) || isNullable(right)) return true;
    return callback(left.valueOf(), right.valueOf());
  };
  return (...args) => Eval3(key, args, Type.Boolean);
}
__name11(comparator, "comparator");
Eval3.switch = (branches, vDefault) => Eval3("switch", { branches, default: vDefault }, Type.fromTerm(branches[0]));
operators.$switch = (args, data) => {
  for (const branch of args.branches) {
    if (executeEval(data, branch.case)) return executeEval(data, branch.then);
  }
  return executeEval(data, args.default);
};
Eval3.ignoreNull = (expr) => (expr["$ignoreNull"] = true, expr[Type.kType].ignoreNull = true, expr);
Eval3.select = multary("select", (args, table) => args.map((arg) => executeEval(table, arg)), Type.Array());
Eval3.query = (row, query, expr = true) => ({ $expr: expr, ...query });
Eval3.exec = unary("exec", (expr, data) => expr.driver.executeSelection(expr, data), (expr) => Type.fromTerm(expr.args[0]));
Eval3.if = multary("if", ([cond, vThen, vElse], data) => executeEval(data, cond) ? executeEval(data, vThen) : executeEval(data, vElse), (cond, vThen, vElse) => Type.fromTerm(vThen));
Eval3.ifNull = multary("ifNull", ([value, fallback2], data) => executeEval(data, value) ?? executeEval(data, fallback2), (value) => Type.fromTerm(value));
Eval3.add = multary("add", (args, data) => args.reduce((prev, curr) => prev + executeEval(data, curr), 0), Type.Number);
Eval3.mul = Eval3.multiply = multary("multiply", (args, data) => args.reduce((prev, curr) => prev * executeEval(data, curr), 1), Type.Number);
Eval3.sub = Eval3.subtract = multary("subtract", ([left, right], data) => executeEval(data, left) - executeEval(data, right), Type.Number);
Eval3.div = Eval3.divide = multary("divide", ([left, right], data) => executeEval(data, left) / executeEval(data, right), Type.Number);
Eval3.mod = Eval3.modulo = multary("modulo", ([left, right], data) => executeEval(data, left) % executeEval(data, right), Type.Number);
Eval3.abs = unary("abs", (arg, data) => Math.abs(executeEval(data, arg)), Type.Number);
Eval3.floor = unary("floor", (arg, data) => Math.floor(executeEval(data, arg)), Type.Number);
Eval3.ceil = unary("ceil", (arg, data) => Math.ceil(executeEval(data, arg)), Type.Number);
Eval3.round = unary("round", (arg, data) => Math.round(executeEval(data, arg)), Type.Number);
Eval3.exp = unary("exp", (arg, data) => Math.exp(executeEval(data, arg)), Type.Number);
Eval3.log = multary("log", ([left, right], data) => Math.log(executeEval(data, left)) / Math.log(executeEval(data, right ?? Math.E)), Type.Number);
Eval3.pow = Eval3.power = multary("power", ([left, right], data) => Math.pow(executeEval(data, left), executeEval(data, right)), Type.Number);
Eval3.random = () => Eval3("random", {}, Type.Number);
operators.$random = () => Math.random();
Eval3.eq = comparator("eq", (left, right) => left === right);
Eval3.ne = comparator("ne", (left, right) => left !== right);
Eval3.gt = comparator("gt", (left, right) => left > right);
Eval3.ge = Eval3.gte = comparator("gte", (left, right) => left >= right);
Eval3.lt = comparator("lt", (left, right) => left < right);
Eval3.le = Eval3.lte = comparator("lte", (left, right) => left <= right);
Eval3.in = (value, array) => Eval3("in", [Array.isArray(value) ? Eval3.select(...value) : value, array], Type.Boolean);
operators.$in = ([value, array], data) => {
  const val = executeEval(data, value), arr = executeEval(data, array);
  if (typeof val === "object") return arr.includes(val) || arr.map(JSON.stringify).includes(JSON.stringify(val));
  return arr.includes(val);
};
Eval3.nin = (value, array) => Eval3("nin", [Array.isArray(value) ? Eval3.select(...value) : value, array], Type.Boolean);
operators.$nin = ([value, array], data) => {
  const val = executeEval(data, value), arr = executeEval(data, array);
  if (typeof val === "object") return !arr.includes(val) && !arr.map(JSON.stringify).includes(JSON.stringify(val));
  return !arr.includes(val);
};
Eval3.concat = multary("concat", (args, data) => args.map((arg) => executeEval(data, arg)).join(""), Type.String);
Eval3.regex = multary("regex", ([value, regex, flags], data) => makeRegExp(executeEval(data, regex), flags).test(executeEval(data, value)), Type.Boolean);
Eval3.and = multary("and", (args, data) => {
  const type = Type.fromTerms(args, Type.Boolean);
  if (Field.boolean.includes(type.type)) return args.every((arg) => executeEval(data, arg));
  else if (Field.number.includes(type.type)) return args.map((arg) => executeEval(data, arg)).reduce((prev, curr) => prev & curr);
  else if (type.type === "bigint") return args.map((arg) => BigInt(executeEval(data, arg) ?? 0)).reduce((prev, curr) => prev & curr);
}, (...args) => Type.fromTerms(args, Type.Boolean));
Eval3.or = multary("or", (args, data) => {
  const type = Type.fromTerms(args, Type.Boolean);
  if (Field.boolean.includes(type.type)) return args.some((arg) => executeEval(data, arg));
  else if (Field.number.includes(type.type)) return args.map((arg) => executeEval(data, arg)).reduce((prev, curr) => prev | curr);
  else if (type.type === "bigint") return args.map((arg) => BigInt(executeEval(data, arg) ?? 0)).reduce((prev, curr) => prev | curr);
}, (...args) => Type.fromTerms(args, Type.Boolean));
Eval3.not = unary("not", (value, data) => {
  const type = Type.fromTerms([value], Type.Boolean);
  if (Field.boolean.includes(type.type)) return !executeEval(data, value);
  else if (Field.number.includes(type.type)) return ~executeEval(data, value);
  else if (type.type === "bigint") return ~BigInt(executeEval(data, value) ?? 0);
}, (value) => Type.fromTerms([value], Type.Boolean));
Eval3.xor = multary("xor", (args, data) => {
  const type = Type.fromTerms(args, Type.Boolean);
  if (Field.boolean.includes(type.type)) return args.map((arg) => executeEval(data, arg)).reduce((prev, curr) => prev !== curr);
  else if (Field.number.includes(type.type)) return args.map((arg) => executeEval(data, arg)).reduce((prev, curr) => prev ^ curr);
  else if (type.type === "bigint") return args.map((arg) => BigInt(executeEval(data, arg) ?? 0)).reduce((prev, curr) => prev ^ curr);
}, (...args) => Type.fromTerms(args, Type.Boolean));
Eval3.literal = multary("literal", ([value, type]) => value, (value, type) => type ? Type.fromField(type) : Type.fromTerm(value));
Eval3.number = unary("number", (arg, data) => {
  const value = executeEval(data, arg);
  return value instanceof Date ? Math.floor(value.valueOf() / 1e3) : Number(value);
}, Type.Number);
var unwrapAggr = __name11((expr, def) => {
  let type = Type.fromTerm(expr);
  type = Type.getInner(type) ?? type;
  return def && type.type === "expr" ? def : type;
}, "unwrapAggr");
Eval3.sum = unary("sum", (expr, table) => Array.isArray(table) ? table.reduce((prev, curr) => prev + executeAggr(expr, curr), 0) : Array.from(executeEval(table, expr)).reduce((prev, curr) => prev + curr, 0), Type.Number);
Eval3.avg = unary("avg", (expr, table) => {
  if (Array.isArray(table)) return table.reduce((prev, curr) => prev + executeAggr(expr, curr), 0) / table.length;
  else {
    const array = Array.from(executeEval(table, expr));
    return array.reduce((prev, curr) => prev + curr, 0) / array.length;
  }
}, Type.Number);
Eval3.max = unary("max", (expr, table) => Array.isArray(table) ? table.map((data) => executeAggr(expr, data)).reduce((x, y) => x > y ? x : y, -Infinity) : Array.from(executeEval(table, expr)).reduce((x, y) => x > y ? x : y, -Infinity), (expr) => unwrapAggr(expr, Type.Number));
Eval3.min = unary("min", (expr, table) => Array.isArray(table) ? table.map((data) => executeAggr(expr, data)).reduce((x, y) => x < y ? x : y, Infinity) : Array.from(executeEval(table, expr)).reduce((x, y) => x < y ? x : y, Infinity), (expr) => unwrapAggr(expr, Type.Number));
Eval3.count = unary("count", (expr, table) => new Set(table.map((data) => executeAggr(expr, data))).size, Type.Number);
defineProperty(Eval3, "length", unary("length", (expr, table) => Array.isArray(table) ? table.map((data) => executeAggr(expr, data)).length : Array.from(executeEval(table, expr)).length, Type.Number));
operators.$object = (field, table) => mapValues(field, (value) => executeAggr(value, table));
Eval3.object = (fields) => {
  if (fields.$model) {
    const modelFields = Object.entries(fields.$model.fields);
    const prefix = fields.$prefix;
    fields = Object.fromEntries(modelFields.filter(([, field]) => Field.available(field)).filter(([path2]) => path2.startsWith(prefix)).map(([k]) => [k.slice(prefix.length), fields[k.slice(prefix.length)]]));
    return Eval3("object", fields, Type.Object(mapValues(fields, (value) => Type.fromTerm(value))));
  }
  return Eval3("object", fields, Type.Object(mapValues(fields, (value) => Type.fromTerm(value))));
};
Eval3.array = unary("array", (expr, table) => Array.isArray(table) ? table.map((data) => executeAggr(expr, data)).filter((x) => {
  var _a47;
  return !((_a47 = expr[Type.kType]) == null ? void 0 : _a47.ignoreNull) || !isEmpty(x);
}) : Array.from(executeEval(table, expr)).filter((x) => {
  var _a47;
  return !((_a47 = expr[Type.kType]) == null ? void 0 : _a47.ignoreNull) || !isEmpty(x);
}), (expr) => Type.Array(Type.fromTerm(expr)));
Eval3.get = multary("get", ([x, key], data) => {
  var _a47;
  return (_a47 = executeEval(data, x)) == null ? void 0 : _a47[executeEval(data, key)];
}, (x, key) => Type.getInner(Type.fromTerm(x), key) ?? Type.Any);
function getRecursive(args, data) {
  if (typeof args === "string") {
    return getRecursive(["_", args], data);
  }
  const [ref, path2] = args;
  let value = data[ref];
  if (!value) return value;
  if (path2 in value) return value[path2];
  const prefix = Object.keys(value).find((s) => path2.startsWith(s + ".")) || path2.split(".", 1)[0];
  const rest = path2.slice(prefix.length + 1).split(".").filter(Boolean);
  rest.unshift(prefix);
  for (const key of rest) {
    value = value[key];
    if (!value) return value;
  }
  return value;
}
__name11(getRecursive, "getRecursive");
function executeEvalExpr(expr, data) {
  for (const key in expr) {
    if (key in operators) {
      return operators[key](expr[key], data);
    }
  }
  return expr;
}
__name11(executeEvalExpr, "executeEvalExpr");
function executeAggr(expr, data) {
  if (typeof expr === "string") {
    return getRecursive(expr, data);
  }
  return executeEvalExpr(expr, data);
}
__name11(executeAggr, "executeAggr");
function executeEval(data, expr) {
  if (isComparable(expr) || isNullable(expr)) {
    return expr;
  }
  if (Array.isArray(expr)) {
    return expr.map((item) => executeEval(data, item));
  }
  return executeEvalExpr(expr, data);
}
__name11(executeEval, "executeEval");
function executeUpdate(data, update, ref) {
  for (const key in update) {
    let root = data;
    const path2 = key.split(".");
    const last = path2.pop();
    for (const key2 of path2) {
      root = root[key2] || (root[key2] = {});
    }
    root[last] = executeEval({ [ref]: data, _: data }, update[key]);
  }
  return data;
}
__name11(executeUpdate, "executeUpdate");
function isComparable(value) {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "bigint" || value instanceof Date;
}
__name11(isComparable, "isComparable");
function isFlat(value) {
  return !value || typeof value !== "object" || isEvalExpr(value) || Object.keys(value).length === 0 || Array.isArray(value) || value instanceof Date || value instanceof RegExp || Binary.isSource(value);
}
__name11(isFlat, "isFlat");
var letters = "abcdefghijklmnopqrstuvwxyz";
function randomId() {
  return Array(8).fill(0).map(() => letters[Math.floor(Math.random() * letters.length)]).join("");
}
__name11(randomId, "randomId");
function makeRegExp(source, flags) {
  return source instanceof RegExp && !flags ? source : new RegExp(source.source ?? source, flags ?? source.flags);
}
__name11(makeRegExp, "makeRegExp");
function unravel(source, init) {
  const result = {};
  for (const key in source) {
    let node = result;
    const segments = key.split(".").reverse();
    for (let index = segments.length - 1; index > 0; index--) {
      const segment = segments[index];
      node = node[segment] ?? (node[segment] = {});
      if (init) node = init(node);
    }
    node[segments[0]] = source[key];
  }
  return result;
}
__name11(unravel, "unravel");
function flatten(source, prefix = "", ignore = isFlat) {
  const result = {};
  for (const key in source) {
    const value = source[key];
    if (ignore(value)) {
      result[`${prefix}${key}`] = value;
    } else {
      Object.assign(result, flatten(value, `${prefix}${key}.`, ignore));
    }
  }
  return result;
}
__name11(flatten, "flatten");
function getCell(row, path2) {
  if (path2 in row) return row[path2];
  if (path2.includes(".")) {
    const index = path2.indexOf(".");
    return getCell(row[path2.slice(0, index)] ?? {}, path2.slice(index + 1));
  } else {
    return row[path2];
  }
}
__name11(getCell, "getCell");
function isEmpty(value) {
  if (isNullable(value)) return true;
  if (typeof value !== "object") return false;
  for (const key in value) {
    if (!isEmpty(value[key])) return false;
  }
  return true;
}
__name11(isEmpty, "isEmpty");
var createRow = __name11((ref, expr = {}, prefix = "", model, intermediate) => new Proxy(expr, {
  get(target, key) {
    if (key === "$prefix") return prefix;
    if (key === "$model") return model;
    if (typeof key === "symbol" || key in target || key.startsWith("$")) return Reflect.get(target, key);
    if (intermediate) {
      if (Type.isArray(expr == null ? void 0 : expr[Type.kType]) && Number.isInteger(+key)) {
        return createRow(ref, Eval3.get(expr, +key), "", model, Eval3.get(expr, +key));
      } else {
        return createRow(ref, Eval3.get(intermediate, `${prefix}${key}`), `${prefix}${key}.`, model, intermediate);
      }
    }
    let type;
    const field = model == null ? void 0 : model.fields[prefix + key];
    if (Type.isArray(expr == null ? void 0 : expr[Type.kType]) && Number.isInteger(+key)) {
      type = Type.getInner(expr == null ? void 0 : expr[Type.kType]) ?? Type.fromField("expr");
      return createRow(ref, Eval3.get(expr, +key), "", model, Eval3.get(expr, +key));
    } else if (Type.getInner(expr == null ? void 0 : expr[Type.kType], key)) {
      type = Type.getInner(expr == null ? void 0 : expr[Type.kType], key);
    } else if (field) {
      type = Type.fromField(field);
    } else if (Object.keys(model == null ? void 0 : model.fields).some((k) => k.startsWith(`${prefix}${key}.`))) {
      type = Type.Object(Object.fromEntries(Object.entries(model == null ? void 0 : model.fields).filter(([k]) => k.startsWith(`${prefix}${key}`)).map(([k, field2]) => [k.slice(prefix.length + key.length + 1), Type.fromField(field2)])));
    } else {
      type = (model == null ? void 0 : model.getType(`${prefix}${key}`)) ?? Type.fromField("expr");
    }
    const row = createRow(ref, Eval3("", [ref, `${prefix}${key}`], type), `${prefix}${key}.`, model);
    if (!field && Object.keys(model == null ? void 0 : model.fields).some((k) => k.startsWith(`${prefix}${key}.`))) {
      return createRow(ref, Eval3.object(row), `${prefix}${key}.`, model);
    } else {
      return row;
    }
  }
}), "createRow");
var _a16;
var Executable = (_a16 = class {
  constructor(driver, payload) {
    __publicField(this, "row");
    __publicField(this, "model");
    __publicField(this, "driver");
    Object.assign(this, payload);
    defineProperty(this, "driver", driver);
    defineProperty(this, "model", driver.model(this.table));
    defineProperty(this, "row", createRow(this.ref, {}, "", this.model));
  }
  resolveQuery(query = {}) {
    if (typeof query === "function") {
      const expr = query(this.row);
      return expr["$expr"] ? expr : isEvalExpr(expr) ? { $expr: expr } : expr;
    }
    if (Array.isArray(query) || query instanceof RegExp || ["string", "number", "bigint"].includes(typeof query)) {
      const { primary } = this.model;
      if (Array.isArray(primary)) {
        throw new TypeError("invalid shorthand for composite primary key");
      }
      return { [primary]: query };
    }
    return query;
  }
  resolveField(field) {
    if (typeof field === "string") {
      return this.row[field];
    } else if (typeof field === "function") {
      return field(this.row);
    } else {
      throw new TypeError("invalid field definition");
    }
  }
  resolveFields(fields) {
    if (typeof fields === "string") fields = [fields];
    if (Array.isArray(fields)) {
      const modelFields = Object.keys(this.model.fields);
      const entries = fields.flatMap((key) => {
        if (this.model.fields[key]) return [[key, this.row[key]]];
        else if (modelFields.some((path2) => path2.startsWith(key + "."))) {
          return modelFields.filter((path2) => path2.startsWith(key + ".")).map((path2) => [path2, this.row[path2]]);
        }
        return [[key, key.split(".").reduce((row, k) => row[k], this.row)]];
      });
      return Object.fromEntries(entries);
    } else {
      const entries = Object.entries(fields).flatMap(([key, field]) => {
        const expr = this.resolveField(field);
        if (expr["$object"] && !Type.fromTerm(expr).ignoreNull) {
          return Object.entries(expr["$object"]).map(([key2, expr2]) => [`${key}.${key2}`, expr2]);
        }
        return [[key, expr]];
      });
      return Object.fromEntries(entries);
    }
  }
  async execute() {
    await this.driver.database.prepared();
    await this.driver._ensureSession();
    return this.driver[this.type](this, ...this.args);
  }
}, __name11(_a16, "Executable"), _a16);
var _a17;
var Selection = (_a17 = class extends Executable {
  constructor(driver, table, query) {
    super(driver, {
      type: "get",
      ref: randomId(),
      table,
      query: null,
      args: [{ sort: [], limit: Infinity, offset: 0, group: void 0, having: Eval3.and(), optional: {} }]
    });
    __publicField(this, "tables", {});
    this.tables[this.ref] = this.model;
    this.query = this.resolveQuery(query);
    if (typeof table !== "string") {
      Object.assign(this.tables, table.tables);
    }
  }
  where(query) {
    var _a47;
    (_a47 = this.query).$and || (_a47.$and = []);
    this.query.$and.push(this.resolveQuery(query));
    return this;
  }
  limit(...args) {
    if (args.length > 1) this.offset(args.shift());
    this.args[0].limit = args[0];
    return this;
  }
  offset(offset) {
    this.args[0].offset = offset;
    return this;
  }
  orderBy(field, direction = "asc") {
    this.args[0].sort.push([this.resolveField(field), direction]);
    return this;
  }
  groupBy(fields, ...args) {
    this.args[0].fields = this.resolveFields(fields);
    this.args[0].group = Object.keys(this.args[0].fields);
    const extra = typeof args[0] === "function" ? void 0 : args.shift();
    Object.assign(this.args[0].fields, this.resolveFields(extra || {}));
    if (args[0]) this.having(args[0]);
    return new _a17(this.driver, this);
  }
  having(query) {
    this.args[0].having["$and"].push(this.resolveField(query));
    return this;
  }
  project(fields) {
    this.args[0].fields = this.resolveFields(fields);
    return new _a17(this.driver, this);
  }
  join(name, selection, callback = () => Eval3.and(), optional = false) {
    const fields = Object.fromEntries(Object.entries(this.model.fields).filter(([key, field]) => Field.available(field) && !key.startsWith(name + ".")).map(([key]) => [key, (row) => getCell(row[this.ref], key)]));
    const joinFields = Object.fromEntries(Object.entries(selection.model.fields).filter(([key, field]) => Field.available(field) || Field.available(this.model.fields[`${name}.${key}`])).map(([key]) => [
      key,
      (row) => Field.available(this.model.fields[`${name}.${key}`]) ? getCell(row[this.ref], `${name}.${key}`) : getCell(row[name], key)
    ]));
    if (optional) {
      return this.driver.database.join({ [this.ref]: this, [name]: selection }, (t) => callback(t[this.ref], t[name]), { [this.ref]: false, [name]: true }).project({ ...fields, [name]: (row) => Eval3.ignoreNull(Eval3.object(mapValues(joinFields, (x) => x(row)))) });
    } else {
      return this.driver.database.join({ [this.ref]: this, [name]: selection }, (t) => callback(t[this.ref], t[name])).project({ ...fields, [name]: (row) => Eval3.ignoreNull(Eval3.object(mapValues(joinFields, (x) => x(row)))) });
    }
  }
  _action(type, ...args) {
    return new Executable(this.driver, { ...this, type, args });
  }
  evaluate(callback) {
    const selection = new _a17(this.driver, this);
    if (!callback) callback = __name11((row) => Eval3.array(Eval3.object(row)), "callback");
    const expr = Array.isArray(callback) ? Eval3.select(...callback.map((x) => this.resolveField(x))) : this.resolveField(callback);
    if (isAggrExpr(expr)) defineProperty(expr, Type.kType, Type.Array(Type.fromTerm(expr)));
    return Eval3.exec(selection._action("eval", expr));
  }
  async execute(cursor) {
    if (typeof cursor === "function") {
      const selection = new _a17(this.driver, this);
      return selection._action("eval", this.resolveField(cursor)).execute();
    }
    if (Array.isArray(cursor)) {
      cursor = { fields: cursor };
    } else if (!cursor) {
      cursor = {};
    }
    if (cursor.fields) this.project(cursor.fields);
    if (cursor.limit !== void 0) this.limit(cursor.limit);
    if (cursor.offset !== void 0) this.offset(cursor.offset);
    if (cursor.sort) {
      for (const field in cursor.sort) {
        this.orderBy(field, cursor.sort[field]);
      }
    }
    const rows = await super.execute();
    if (!cursor.fields) return rows;
    return rows.map((row) => {
      return filterKeys(row, (key) => {
        return cursor.fields.some((k) => k === key || k.startsWith(`${key}.`));
      });
    });
  }
}, __name11(_a17, "Selection"), _a17);
((Selection2) => {
  function is2(sel) {
    return sel && !!sel.tables;
  }
  Selection2.is = is2;
  __name11(is2, "is");
})(Selection || (Selection = {}));
function executeSort(data, modifier, name) {
  const { limit, offset, sort } = modifier;
  data.sort((a, b) => {
    for (const [field, direction] of sort) {
      const sign = direction === "asc" ? 1 : -1;
      const x = executeEval({ [name]: a, _: a }, field);
      const y = executeEval({ [name]: b, _: b }, field);
      if (x < y) return -sign;
      if (x > y) return sign;
    }
    return 0;
  });
  return data.slice(offset, offset + limit);
}
__name11(executeSort, "executeSort");
function mergeQuery(base, query) {
  if (typeof query === "function") {
    return (row) => {
      const q = query(row);
      return { $expr: true, ...base, ...q.$expr ? q : { $expr: q } };
    };
  } else {
    return (_) => ({ $expr: true, ...base, ...query });
  }
}
__name11(mergeQuery, "mergeQuery");
var _a18;
var Database = (_a18 = class extends Service2 {
  constructor(ctx) {
    ctx || (ctx = new Context2());
    super(ctx, "model", true);
    __publicField(this, "tables", /* @__PURE__ */ Object.create(null));
    __publicField(this, "drivers", []);
    __publicField(this, "types", /* @__PURE__ */ Object.create(null));
    __publicField(this, "_driver");
    __publicField(this, "stashed", /* @__PURE__ */ new Set());
    __publicField(this, "prepareTasks", /* @__PURE__ */ Object.create(null));
    __publicField(this, "migrateTasks", /* @__PURE__ */ Object.create(null));
  }
  async connect(driver, ...args) {
    this.ctx.plugin(driver, args[0]);
    await this.ctx.start();
  }
  refresh() {
    for (const name in this.tables) {
      this.prepareTasks[name] = this.prepare(name);
    }
  }
  async prepared() {
    if (this[_a18.migrate]) return;
    await Promise.all(Object.values(this.prepareTasks));
  }
  getDriver(table) {
    var _a47, _b7;
    if (Selection.is(table)) return table.driver;
    const model = this.tables[table];
    if (!model) throw new Error(`cannot resolve table "${table}"`);
    return (_b7 = (_a47 = model.ctx) == null ? void 0 : _a47.get("database")) == null ? void 0 : _b7._driver;
  }
  async prepare(name) {
    this.stashed.add(name);
    await this.prepareTasks[name];
    await Promise.resolve();
    if (!this.stashed.delete(name)) return;
    const driver = this.getDriver(name);
    if (!driver) return;
    const { fields } = driver.model(name);
    Object.values(fields).forEach((field) => {
      var _a47;
      return (_a47 = field == null ? void 0 : field.transformers) == null ? void 0 : _a47.forEach((x) => driver.define(x));
    });
    await driver.prepare(name);
    await driver.prepareIndexes(name);
  }
  extend(name, fields, config = {}) {
    let model = this.tables[name];
    if (!model) {
      model = this.tables[name] = new Model(name);
    }
    Object.entries(fields).forEach(([key, field]) => {
      const transformer = [];
      this.parseField(field, transformer, void 0, (value) => field = fields[key] = value);
      if (typeof field === "object") field.transformers = transformer;
    });
    model.extend(fields, config);
    if (makeArray(model.primary).every((key) => key in fields)) {
      defineProperty(model, "ctx", this.ctx);
    }
    Object.entries(fields).forEach(([key, def]) => {
      var _a47, _b7;
      if (!Relation.Type.includes(def.type)) return;
      const subprimary = !def.fields && makeArray(model.primary).includes(key);
      const [relation, inverse] = Relation.parse(def, key, model, this.tables[def.table ?? key], subprimary);
      const relmodel = this.tables[relation.table];
      if (!relmodel) throw new Error(`relation table ${relation.table} does not exist`);
      (model.fields[key] = Field.parse("expr")).relation = relation;
      if (def.target) {
        ((_a47 = relmodel.fields)[_b7 = def.target] ?? (_a47[_b7] = Field.parse("expr"))).relation = inverse;
      }
      if (relation.type === "oneToOne" || relation.type === "manyToOne") {
        relation.fields.forEach((x, i) => {
          var _a48;
          (_a48 = model.fields)[x] ?? (_a48[x] = { ...relmodel.fields[relation.references[i]] });
          if (!relation.required) {
            model.fields[x].nullable = true;
            model.fields[x].initial = null;
          }
        });
      } else if (relation.type === "manyToMany") {
        const assocTable = Relation.buildAssociationTable(relation.table, name);
        if (this.tables[assocTable]) return;
        const shared = Object.entries(relation.shared).map(([x, y]) => [Relation.buildSharedKey(x, y), model.fields[x].deftype]);
        const fields2 = relation.fields.map((x) => [Relation.buildAssociationKey(x, name), model.fields[x].deftype]);
        const references = relation.references.map((x) => {
          var _a48;
          return [Relation.buildAssociationKey(x, relation.table), (_a48 = relmodel.fields[x]) == null ? void 0 : _a48.deftype];
        });
        this.extend(assocTable, {
          ...Object.fromEntries([...shared, ...fields2, ...references]),
          [name]: {
            type: "manyToOne",
            table: name,
            fields: [...shared, ...fields2].map((x) => x[0]),
            references: [...Object.keys(relation.shared), ...relation.fields]
          },
          [relation.table]: {
            type: "manyToOne",
            table: relation.table,
            fields: [...shared, ...references].map((x) => x[0]),
            references: [...Object.values(relation.shared), ...relation.references]
          }
        }, {
          primary: [...shared, ...fields2, ...references].map((x) => x[0])
        });
      }
    });
    if (Array.isArray(model.primary) || model.fields[model.primary].relation) {
      model.primary = deduplicate(makeArray(model.primary).map((key) => {
        var _a47;
        return ((_a47 = model.fields[key].relation) == null ? void 0 : _a47.fields) || key;
      }).flat());
    }
    model.unique = model.unique.map((keys) => {
      var _a47;
      return typeof keys === "string" ? ((_a47 = model.fields[keys].relation) == null ? void 0 : _a47.fields) || keys : keys.map((key) => {
        var _a48;
        return ((_a48 = model.fields[key].relation) == null ? void 0 : _a48.fields) || key;
      }).flat();
    });
    this.prepareTasks[name] = this.prepare(name);
    this.ctx.emit("model", name);
  }
  _parseField(field, transformers = [], setInitial, setField) {
    if (field === "object") {
      setInitial == null ? void 0 : setInitial({});
      setField == null ? void 0 : setField({ initial: {}, deftype: "json", type: Type.Object() });
      return Type.Object();
    } else if (field === "array") {
      setInitial == null ? void 0 : setInitial([]);
      setField == null ? void 0 : setField({ initial: [], deftype: "json", type: Type.Array() });
      return Type.Array();
    } else if (typeof field === "string" && this.types[field]) {
      transformers.push({
        types: [field],
        load: this.types[field].load,
        dump: this.types[field].dump
      }, ...this.types[field].transformers ?? []);
      setInitial == null ? void 0 : setInitial(this.types[field].initial);
      setField == null ? void 0 : setField({ ...this.types[field], type: field });
      return Type.fromField(field);
    } else if (typeof field === "string") {
      setInitial == null ? void 0 : setInitial(Field.getInitial(field.split("(")[0]));
      setField == null ? void 0 : setField(field);
      return Type.fromField(field.split("(")[0]);
    } else if (typeof field === "object" && field.type === "object") {
      const inner = field.inner ? unravel(field.inner, (value) => (value.type = "object", value.inner ?? (value.inner = {}))) : /* @__PURE__ */ Object.create(null);
      const initial = /* @__PURE__ */ Object.create(null);
      const res = Type.Object(mapValues(inner, (x, k) => this.parseField(x, transformers, (value) => initial[k] = value)));
      setInitial == null ? void 0 : setInitial(Field.getInitial("json", initial));
      setField == null ? void 0 : setField({ initial: Field.getInitial("json", initial), ...field, deftype: "json", type: res });
      return res;
    } else if (typeof field === "object" && field.type === "array") {
      const res = field.inner ? Type.Array(this.parseField(field.inner, transformers)) : Type.Array();
      setInitial == null ? void 0 : setInitial([]);
      setField == null ? void 0 : setField({ initial: [], ...field, deftype: "json", type: res });
      return res;
    } else if (typeof field === "object" && this.types[field.type]) {
      transformers.push({
        types: [field.type],
        load: this.types[field.type].load,
        dump: this.types[field.type].dump
      }, ...this.types[field.type].transformers ?? []);
      setInitial == null ? void 0 : setInitial(field.initial === void 0 ? this.types[field.type].initial : field.initial);
      setField == null ? void 0 : setField({ initial: this.types[field.type].initial, ...field });
      return Type.fromField(field.type);
    } else {
      setInitial == null ? void 0 : setInitial(Field.getInitial(field.type, field.initial));
      setField == null ? void 0 : setField(field);
      return Type.fromField(field.type);
    }
  }
  parseField(field, transformers = [], setInitial, setField) {
    var _a47, _b7;
    let midfield;
    let type = this._parseField(field, transformers, setInitial, (value) => (midfield = value, setField == null ? void 0 : setField(value)));
    if (typeof field === "object" && field.load && field.dump) {
      if (type.inner) type = Type.fromField(this.define({ ...omit(midfield, ["load", "dump"]), type }));
      const name = this.define({ ...field, deftype: midfield.deftype, type: type.type });
      transformers.push({
        types: [name],
        load: field.load,
        dump: field.dump
      });
      setInitial == null ? void 0 : setInitial(field.initial);
      setField == null ? void 0 : setField({ ...field, deftype: midfield.deftype ?? ((_a47 = this.types[type.type]) == null ? void 0 : _a47.deftype) ?? type.type, initial: midfield.initial, type: name });
      return Type.fromField(name);
    }
    if (typeof midfield === "object") setField == null ? void 0 : setField({ ...midfield, deftype: midfield.deftype ?? ((_b7 = this.types[type.type]) == null ? void 0 : _b7.deftype) ?? (type == null ? void 0 : type.type) });
    return type;
  }
  define(name, field) {
    if (typeof name === "object") {
      field = name;
      name = void 0;
    }
    if (name && this.types[name]) throw new Error(`type "${name}" already defined`);
    if (!name) while (this.types[name = "_define_" + randomId()]) ;
    const transformers = [];
    const type = this._parseField(field, transformers, void 0, (value) => field = value);
    field.transformers = transformers;
    this.ctx.effect(() => {
      var _a47, _b7;
      this.types[name] = { ...field };
      (_b7 = this.types[name]).deftype ?? (_b7.deftype = ((_a47 = this.types[field.type]) == null ? void 0 : _a47.deftype) ?? type.type);
      return () => delete this.types[name];
    });
    return name;
  }
  migrate(name, fields, callback) {
    this.extend(name, fields, { callback });
  }
  select(table, query, include) {
    var _a47, _b7, _c3, _d2;
    let sel = new Selection(this.getDriver(table), table, query);
    if (typeof table !== "string") return sel;
    const whereOnly = include === null, isAssoc = !!(include == null ? void 0 : include.$assoc);
    const rawquery = typeof query === "function" ? query : () => query;
    const modelFields = this.tables[table].fields;
    if (include) include = filterKeys(include, (key) => {
      var _a48;
      return !!((_a48 = modelFields[key]) == null ? void 0 : _a48.relation);
    });
    for (const key in { ...sel.query, ...sel.query.$not }) {
      if ((_a47 = modelFields[key]) == null ? void 0 : _a47.relation) {
        if (sel.query[key] === null && !modelFields[key].relation.required) {
          sel.query[key] = Object.fromEntries(modelFields[key].relation.references.map((k) => [k, null]));
        }
        if (sel.query[key] && typeof sel.query[key] !== "function" && typeof sel.query[key] === "object" && Object.keys(sel.query[key]).every((x) => modelFields[key].relation.fields.includes(`${key}.${x}`))) {
          Object.entries(sel.query[key]).forEach(([k, v]) => sel.query[`${key}.${k}`] = v);
          delete sel.query[key];
        }
        if (((_b7 = sel.query.$not) == null ? void 0 : _b7[key]) === null && !modelFields[key].relation.required) {
          sel.query.$not[key] = Object.fromEntries(modelFields[key].relation.references.map((k) => [k, null]));
        }
        if (((_c3 = sel.query.$not) == null ? void 0 : _c3[key]) && typeof sel.query.$not[key] !== "function" && typeof sel.query.$not[key] === "object" && Object.keys(sel.query.$not[key]).every((x) => modelFields[key].relation.fields.includes(`${key}.${x}`))) {
          Object.entries(sel.query.$not[key]).forEach(([k, v]) => sel.query.$not[`${key}.${k}`] = v);
          delete sel.query.$not[key];
        }
        if (!include || !Object.getOwnPropertyNames(include).includes(key)) {
          (include ?? (include = {}))[key] = true;
        }
      }
    }
    sel.query = omit(sel.query, Object.keys(include ?? {}));
    if (Object.keys(sel.query.$not ?? {}).length) {
      sel.query.$not = omit(sel.query.$not, Object.keys(include ?? {}));
      if (Object.keys(sel.query.$not).length === 0) Reflect.deleteProperty(sel.query, "$not");
    }
    if (include && typeof include === "object") {
      if (typeof table !== "string") throw new Error("cannot include relations on derived selection");
      const extraFields = [];
      const applyQuery = __name11((sel2, key) => {
        var _a48, _b8;
        const query2 = rawquery(sel2.row);
        const relquery = query2[key] !== void 0 ? query2[key] : ((_a48 = query2.$not) == null ? void 0 : _a48[key]) !== void 0 ? { $not: (_b8 = query2.$not) == null ? void 0 : _b8[key] } : void 0;
        return relquery === void 0 ? sel2 : sel2.where(this.transformRelationQuery(table, sel2.row, key, relquery));
      }, "applyQuery");
      for (const key in include) {
        if (!include[key] || !((_d2 = modelFields[key]) == null ? void 0 : _d2.relation)) continue;
        const relation = modelFields[key].relation;
        const relmodel = this.tables[relation.table];
        if (relation.type === "oneToOne" || relation.type === "manyToOne") {
          sel = whereOnly ? sel : sel.join(key, this.select(
            relation.table,
            typeof include[key] === "object" ? filterKeys(include[key], (k) => {
              var _a48;
              return !((_a48 = relmodel.fields[k]) == null ? void 0 : _a48.relation);
            }) : {},
            typeof include[key] === "object" ? filterKeys(include[key], (k) => {
              var _a48;
              return !!((_a48 = relmodel.fields[k]) == null ? void 0 : _a48.relation);
            }) : include[key]
          ), (self, other) => Eval3.and(
            ...relation.fields.map((k, i) => Eval3.eq(self[k], other[relation.references[i]]))
          ), !isAssoc);
          sel = applyQuery(sel, key);
        } else if (relation.type === "oneToMany") {
          sel = whereOnly ? sel : sel.join(key, this.select(
            relation.table,
            typeof include[key] === "object" ? filterKeys(include[key], (k) => {
              var _a48;
              return !((_a48 = relmodel.fields[k]) == null ? void 0 : _a48.relation);
            }) : {},
            typeof include[key] === "object" ? filterKeys(include[key], (k) => {
              var _a48;
              return !!((_a48 = relmodel.fields[k]) == null ? void 0 : _a48.relation);
            }) : include[key]
          ), (self, other) => Eval3.and(
            ...relation.fields.map((k, i) => Eval3.eq(self[k], other[relation.references[i]]))
          ), true);
          sel = applyQuery(sel, key);
          sel = whereOnly ? sel : sel.groupBy([
            ...Object.entries(modelFields).filter(([k, field]) => !extraFields.some((x) => k.startsWith(`${x}.`)) && Field.available(field)).map(([k]) => k),
            ...extraFields
          ], {
            [key]: (row) => Eval3.ignoreNull(Eval3.array(row[key]))
          });
        } else if (relation.type === "manyToMany") {
          const assocTable = Relation.buildAssociationTable(relation.table, table);
          const references = relation.fields.map((x) => Relation.buildAssociationKey(x, table));
          const shared = Object.entries(relation.shared).map(([x, y]) => [Relation.buildSharedKey(x, y), {
            field: x,
            reference: y
          }]);
          sel = whereOnly ? sel : sel.join(
            key,
            this.select(assocTable, {}, { $assoc: true, [relation.table]: include[key] }),
            (self, other) => Eval3.and(
              ...shared.map(([k, v]) => Eval3.eq(self[v.field], other[k])),
              ...relation.fields.map((k, i) => Eval3.eq(self[k], other[references[i]]))
            ),
            true
          );
          sel = applyQuery(sel, key);
          sel = whereOnly ? sel : sel.groupBy([
            ...Object.entries(modelFields).filter(([k, field]) => !extraFields.some((x) => k.startsWith(`${x}.`)) && Field.available(field)).map(([k]) => k),
            ...extraFields
          ], {
            [key]: (row) => Eval3.ignoreNull(Eval3.array(row[key][relation.table]))
          });
        }
        extraFields.push(key);
      }
    }
    return sel;
  }
  join(tables, query = (...args) => Eval3.and(), optional) {
    const oldTables = tables;
    if (Array.isArray(oldTables)) {
      tables = Object.fromEntries(oldTables.map((name) => [name, this.select(name)]));
    }
    let sels = mapValues(tables, (t) => {
      return typeof t === "string" ? this.select(t) : t;
    });
    if (Object.keys(sels).length === 0) throw new Error("no tables to join");
    const drivers = new Set(Object.values(sels).map((sel2) => sel2.driver[_a18.transact] ?? sel2.driver));
    if (drivers.size !== 1) throw new Error("cannot join tables from different drivers");
    if (Object.keys(sels).length === 2 && ((optional == null ? void 0 : optional[0]) || (optional == null ? void 0 : optional[Object.keys(sels)[0]]))) {
      if (optional[1] || optional[Object.keys(sels)[1]]) throw new Error("full join is not supported");
      sels = Object.fromEntries(Object.entries(sels).reverse());
    }
    const sel = new Selection([...drivers][0], sels);
    if (Array.isArray(oldTables)) {
      sel.args[0].having = Eval3.and(query(...oldTables.map((name) => sel.row[name])));
      sel.args[0].optional = Object.fromEntries(oldTables.map((name, index) => [name, optional == null ? void 0 : optional[index]]));
    } else {
      sel.args[0].having = Eval3.and(query(sel.row));
      sel.args[0].optional = optional;
    }
    return this.select(sel);
  }
  async get(table, query, cursor) {
    let fields = Array.isArray(cursor) ? cursor : cursor == null ? void 0 : cursor.fields;
    fields = fields ? Object.fromEntries(fields.map((x) => [x, true])) : cursor == null ? void 0 : cursor.include;
    return this.select(table, query, fields).execute(cursor);
  }
  async eval(table, expr, query) {
    return this.select(table, query).execute(typeof expr === "function" ? expr : () => expr);
  }
  async set(table, query, update) {
    const rawupdate = typeof update === "function" ? update : () => update;
    let sel = this.select(table, query, null);
    if (typeof update === "function") update = update(sel.row);
    const primary = makeArray(sel.model.primary);
    if (primary.some((key) => key in update)) {
      throw new TypeError(`cannot modify primary key`);
    }
    const relations = Object.entries(sel.model.fields).filter(([key, field]) => key in update && field.relation).map(([key, field]) => [key, field.relation]);
    if (relations.length) {
      return await this.ensureTransaction(async (database) => {
        const rows = await database.get(table, query);
        sel = database.select(table, query, null);
        let baseUpdate = omit(rawupdate(sel.row), relations.map(([key]) => key));
        baseUpdate = sel.model.format(baseUpdate);
        for (const [key] of relations) {
          await Promise.all(rows.map((row) => database.processRelationUpdate(table, row, key, rawupdate(row)[key])));
        }
        return Object.keys(baseUpdate).length === 0 ? {} : await sel._action("set", baseUpdate).execute();
      });
    }
    update = sel.model.format(update);
    if (Object.keys(update).length === 0) return {};
    return sel._action("set", update).execute();
  }
  async remove(table, query) {
    const sel = this.select(table, query, null);
    return sel._action("remove").execute();
  }
  async create(table, data) {
    const sel = this.select(table);
    if (!this.hasRelation(table, data)) {
      const { primary, autoInc } = sel.model;
      if (!autoInc) {
        const keys = makeArray(primary);
        if (keys.some((key) => getCell(data, key) === void 0)) {
          throw new Error("missing primary key");
        }
      }
      return sel._action("create", sel.model.create(data)).execute();
    } else {
      return this.ensureTransaction((database) => database.createOrUpdate(table, data, false));
    }
  }
  async upsert(table, upsert, keys) {
    const sel = this.select(table);
    if (typeof upsert === "function") upsert = upsert(sel.row);
    upsert = upsert.map((item) => sel.model.format(item));
    keys = makeArray(keys || sel.model.primary);
    return sel._action("upsert", upsert, keys).execute();
  }
  makeProxy(marker, getDriver) {
    const drivers = /* @__PURE__ */ new Map();
    const database = new Proxy(this, {
      get: __name11((target, p, receiver) => {
        if (p === marker) return true;
        if (p !== "getDriver") return Reflect.get(target, p, receiver);
        return (name) => {
          const original = this.getDriver(name);
          let driver = drivers.get(original);
          if (!driver) {
            driver = (getDriver == null ? void 0 : getDriver(original, database)) ?? new Proxy(original, {
              get: __name11((target2, p2, receiver2) => {
                if (p2 === "database") return database;
                return Reflect.get(target2, p2, receiver2);
              }, "get")
            });
            drivers.set(original, driver);
          }
          return driver;
        };
      }, "get")
    });
    return database;
  }
  withTransaction(callback) {
    return this.transact(callback);
  }
  async transact(callback) {
    if (this[_a18.transact]) throw new Error("nested transactions are not supported");
    const finalTasks = [];
    const database = this.makeProxy(_a18.transact, (driver) => {
      let initialized = false, session;
      let _resolve;
      const sessionTask = new Promise((resolve) => _resolve = resolve);
      driver = new Proxy(driver, {
        get: __name11((target, p, receiver) => {
          if (p === _a18.transact) return target;
          if (p === "database") return database;
          if (p === "session") return session;
          if (p === "_ensureSession") return () => sessionTask;
          return Reflect.get(target, p, receiver);
        }, "get")
      });
      finalTasks.push(driver.withTransaction((_session) => {
        if (initialized) initialTask = initialTaskFactory();
        initialized = true;
        _resolve(session = _session);
        return initialTask;
      }));
      return driver;
    });
    const initialTaskFactory = __name11(() => Promise.resolve().then(() => callback(database)), "initialTaskFactory");
    let initialTask = initialTaskFactory();
    return initialTask.catch(noop).finally(() => Promise.all(finalTasks));
  }
  async stopAll() {
    await Promise.all(this.drivers.splice(0, Infinity).map((driver) => driver.stop()));
  }
  async drop(table) {
    if (this[_a18.transact]) throw new Error("cannot drop table in transaction");
    await this.getDriver(table).drop(table);
  }
  async dropAll() {
    if (this[_a18.transact]) throw new Error("cannot drop table in transaction");
    await Promise.all(Object.values(this.drivers).map((driver) => driver.dropAll()));
  }
  async stats() {
    await this.prepared();
    const stats = { size: 0, tables: {} };
    await Promise.all(Object.values(this.drivers).map(async (driver) => {
      const { size = 0, tables } = await driver.stats();
      stats.size += size;
      Object.assign(stats.tables, tables);
    }));
    return stats;
  }
  ensureTransaction(callback) {
    if (this[_a18.transact]) {
      return callback(this);
    } else {
      return this.transact(callback);
    }
  }
  transformRelationQuery(table, row, key, query) {
    const relation = this.tables[table].fields[key].relation;
    const results = [];
    if (relation.type === "oneToOne" || relation.type === "manyToOne") {
      if (query === null) {
        results.push(Eval3.nin(
          relation.fields.map((x) => row[x]),
          this.select(relation.table).evaluate(relation.references)
        ));
      } else {
        results.push(Eval3.in(
          relation.fields.map((x) => row[x]),
          this.select(relation.table, query).evaluate(relation.references)
        ));
      }
    } else if (relation.type === "oneToMany") {
      if (query.$or) results.push(Eval3.or(...query.$or.map((q) => this.transformRelationQuery(table, row, key, q).$expr)));
      if (query.$and) results.push(...query.$and.map((q) => this.transformRelationQuery(table, row, key, q).$expr));
      if (query.$not) results.push(Eval3.not(this.transformRelationQuery(table, row, key, query.$not).$expr));
      if (query.$some) {
        results.push(Eval3.in(
          relation.fields.map((x) => row[x]),
          this.select(relation.table, query.$some).evaluate(relation.references)
        ));
      }
      if (query.$none) {
        results.push(Eval3.nin(
          relation.fields.map((x) => row[x]),
          this.select(relation.table, query.$none).evaluate(relation.references)
        ));
      }
      if (query.$every) {
        results.push(Eval3.nin(
          relation.fields.map((x) => row[x]),
          this.select(relation.table, Eval3.not(query.$every)).evaluate(relation.references)
        ));
      }
    } else if (relation.type === "manyToMany") {
      const assocTable = Relation.buildAssociationTable(table, relation.table);
      const fields = relation.fields.map((x) => Relation.buildAssociationKey(x, table));
      const references = relation.references.map((x) => Relation.buildAssociationKey(x, relation.table));
      if (query.$or) results.push(Eval3.or(...query.$or.map((q) => this.transformRelationQuery(table, row, key, q).$expr)));
      if (query.$and) results.push(...query.$and.map((q) => this.transformRelationQuery(table, row, key, q).$expr));
      if (query.$not) results.push(Eval3.not(this.transformRelationQuery(table, row, key, query.$not).$expr));
      if (query.$some) {
        const innerTable = this.select(relation.table, query.$some).evaluate(relation.references);
        const relTable = this.select(assocTable, (r) => Eval3.in(references.map((x) => r[x]), innerTable)).evaluate(fields);
        results.push(Eval3.in(relation.fields.map((x) => row[x]), relTable));
      }
      if (query.$none) {
        const innerTable = this.select(relation.table, query.$none).evaluate(relation.references);
        const relTable = this.select(assocTable, (r) => Eval3.in(references.map((x) => r[x]), innerTable)).evaluate(fields);
        results.push(Eval3.nin(relation.fields.map((x) => row[x]), relTable));
      }
      if (query.$every) {
        const innerTable = this.select(relation.table, Eval3.not(query.$every)).evaluate(relation.references);
        const relTable = this.select(assocTable, (r) => Eval3.in(references.map((x) => r[x]), innerTable)).evaluate(fields);
        results.push(Eval3.nin(relation.fields.map((x) => row[x]), relTable));
      }
    }
    return { $expr: Eval3.and(...results) };
  }
  async createOrUpdate(table, data, upsert = true) {
    var _a47;
    const sel = this.select(table);
    data = { ...data };
    const tasks = [""];
    for (const key in data) {
      if (data[key] !== void 0 && ((_a47 = this.tables[table].fields[key]) == null ? void 0 : _a47.relation)) {
        const relation = this.tables[table].fields[key].relation;
        if (relation.type === "oneToOne" && relation.required) tasks.push(key);
        else if (relation.type === "oneToOne") tasks.unshift(key);
        else if (relation.type === "oneToMany") tasks.push(key);
        else if (relation.type === "manyToOne") tasks.unshift(key);
        else if (relation.type === "manyToMany") tasks.push(key);
      }
    }
    for (const key of [...tasks]) {
      if (!key) {
        const { primary, autoInc } = sel.model;
        const keys = makeArray(primary);
        if (keys.some((key2) => isNullable(getCell(data, key2)))) {
          if (!autoInc) {
            throw new Error("missing primary key");
          } else {
            delete data[primary];
            upsert = false;
          }
        }
        if (upsert) {
          await sel._action("upsert", [sel.model.format(omit(data, tasks))], keys).execute();
        } else {
          Object.assign(data, await sel._action("create", sel.model.create(omit(data, tasks))).execute());
        }
        continue;
      }
      const value = data[key];
      const relation = this.tables[table].fields[key].relation;
      if (relation.type === "oneToOne") {
        if (value.$literal) {
          data[key] = value.$literal;
          remove(tasks, key);
        } else if (value.$create || !isUpdateExpr(value)) {
          const result = await this.createOrUpdate(relation.table, {
            ...Object.fromEntries(relation.references.map((k, i) => [k, getCell(data, relation.fields[i])])),
            ...value.$create ?? value
          });
          if (!relation.required) {
            relation.references.forEach((k, i) => data[relation.fields[i]] = getCell(result, k));
          }
        } else if (value.$upsert) {
          await this.upsert(relation.table, [{
            ...Object.fromEntries(relation.references.map((k, i) => [k, getCell(data, relation.fields[i])])),
            ...value.$upsert
          }]);
          if (!relation.required) {
            relation.references.forEach((k, i) => data[relation.fields[i]] = getCell(value.$upsert, k));
          }
        } else if (value.$connect) {
          if (relation.required) {
            await this.set(
              relation.table,
              value.$connect,
              Object.fromEntries(relation.references.map((k, i) => [k, getCell(data, relation.fields[i])]))
            );
          } else {
            const result = relation.references.every((k) => value.$connect[k] !== void 0) ? [value.$connect] : await this.get(relation.table, value.$connect);
            if (result.length !== 1) throw new Error("related row not found or not unique");
            relation.references.forEach((k, i) => data[relation.fields[i]] = getCell(result[0], k));
          }
        }
      } else if (relation.type === "manyToOne") {
        if (value.$literal) {
          data[key] = value.$literal;
          remove(tasks, key);
        } else if (value.$create || !isUpdateExpr(value)) {
          const result = await this.createOrUpdate(relation.table, value.$create ?? value);
          relation.references.forEach((k, i) => data[relation.fields[i]] = getCell(result, k));
        } else if (value.$upsert) {
          await this.upsert(relation.table, [value.$upsert]);
          relation.references.forEach((k, i) => data[relation.fields[i]] = getCell(value.$upsert, k));
        } else if (value.$connect) {
          const result = relation.references.every((k) => value.$connect[k] !== void 0) ? [value.$connect] : await this.get(relation.table, value.$connect);
          if (result.length !== 1) throw new Error("related row not found or not unique");
          relation.references.forEach((k, i) => data[relation.fields[i]] = getCell(result[0], k));
        }
      } else if (relation.type === "oneToMany") {
        if (value.$create || Array.isArray(value)) {
          for (const item of makeArray(value.$create ?? value)) {
            await this.createOrUpdate(relation.table, {
              ...Object.fromEntries(relation.references.map((k, i) => [k, getCell(data, relation.fields[i])])),
              ...item
            });
          }
        }
        if (value.$upsert) {
          await this.upsert(relation.table, makeArray(value.$upsert).map((r) => ({
            ...Object.fromEntries(relation.references.map((k, i) => [k, getCell(data, relation.fields[i])])),
            ...r
          })));
        }
        if (value.$connect) {
          await this.set(
            relation.table,
            value.$connect,
            Object.fromEntries(relation.references.map((k, i) => [k, getCell(data, relation.fields[i])]))
          );
        }
      } else if (relation.type === "manyToMany") {
        const assocTable = Relation.buildAssociationTable(relation.table, table);
        const fields = relation.fields.map((x) => Relation.buildAssociationKey(x, table));
        const references = relation.references.map((x) => Relation.buildAssociationKey(x, relation.table));
        const shared = Object.entries(relation.shared).map(([x, y]) => [Relation.buildSharedKey(x, y), {
          field: x,
          reference: y
        }]);
        const result = [];
        if (value.$create || Array.isArray(value)) {
          for (const item of makeArray(value.$create ?? value)) {
            result.push(await this.createOrUpdate(relation.table, {
              ...Object.fromEntries(shared.map(([, v]) => [v.reference, getCell(item, v.reference) ?? getCell(data, v.field)])),
              ...item
            }));
          }
        }
        if (value.$upsert) {
          const upsert2 = makeArray(value.$upsert).map((r) => ({
            ...Object.fromEntries(shared.map(([, v]) => [v.reference, getCell(r, v.reference) ?? getCell(data, v.field)])),
            ...r
          }));
          await this.upsert(relation.table, upsert2);
          result.push(...upsert2);
        }
        if (value.$connect) {
          for (const item of makeArray(value.$connect)) {
            if (references.every((k) => item[k] !== void 0)) result.push(item);
            else result.push(...await this.get(relation.table, item));
          }
        }
        await this.upsert(assocTable, result.map((r) => ({
          ...Object.fromEntries(shared.map(([k, v]) => [k, getCell(r, v.reference) ?? getCell(data, v.field)])),
          ...Object.fromEntries(fields.map((k, i) => [k, getCell(data, relation.fields[i])])),
          ...Object.fromEntries(references.map((k, i) => [k, getCell(r, relation.references[i])]))
        })));
      }
    }
    return data;
  }
  async processRelationUpdate(table, row, key, value) {
    const model = this.tables[table], update = /* @__PURE__ */ Object.create(null);
    const relation = this.tables[table].fields[key].relation;
    if (relation.type === "oneToOne") {
      if (value === null) {
        value = relation.required ? { $remove: {} } : { $disconnect: {} };
      }
      if (typeof value === "object" && !isUpdateExpr(value)) {
        value = { $create: value };
      }
      if (value.$remove) {
        await this.remove(relation.table, Object.fromEntries(relation.references.map((k, i) => [k, getCell(row, relation.fields[i])])));
      }
      if (value.$disconnect) {
        if (relation.required) {
          await this.set(
            relation.table,
            mergeQuery(Object.fromEntries(relation.references.map((k, i) => [k, getCell(row, relation.fields[i])])), value.$disconnect),
            Object.fromEntries(relation.references.map((k, i) => [k, null]))
          );
        } else {
          Object.assign(update, Object.fromEntries(relation.fields.map((k, i) => [k, null])));
        }
      }
      if (value.$set || typeof value === "function") {
        await this.set(
          relation.table,
          Object.fromEntries(relation.references.map((k, i) => [k, getCell(row, relation.fields[i])])),
          value.$set ?? value
        );
      }
      if (value.$create) {
        const result = await this.createOrUpdate(relation.table, {
          ...Object.fromEntries(relation.references.map((k, i) => [k, getCell(row, relation.fields[i])])),
          ...value.$create
        });
        if (!relation.required) {
          Object.assign(update, Object.fromEntries(relation.fields.map((k, i) => [k, getCell(result, relation.references[i])])));
        }
      }
      if (value.$upsert) {
        await this.upsert(relation.table, makeArray(value.$upsert).map((r) => ({
          ...Object.fromEntries(relation.references.map((k, i) => [k, getCell(row, relation.fields[i])])),
          ...r
        })));
        if (!relation.required) {
          Object.assign(update, Object.fromEntries(relation.fields.map((k, i) => [k, getCell(value.$upsert, relation.references[i])])));
        }
      }
      if (value.$connect) {
        if (relation.required) {
          await this.set(
            relation.table,
            value.$connect,
            Object.fromEntries(relation.references.map((k, i) => [k, getCell(row, relation.fields[i])]))
          );
        } else {
          const result = await this.get(relation.table, value.$connect);
          if (result.length !== 1) throw new Error("related row not found or not unique");
          Object.assign(update, Object.fromEntries(relation.fields.map((k, i) => [k, getCell(result[0], relation.references[i])])));
        }
      }
    } else if (relation.type === "manyToOne") {
      if (value === null) {
        value = { $disconnect: {} };
      }
      if (typeof value === "object" && !isUpdateExpr(value)) {
        value = { $create: value };
      }
      if (value.$remove) {
        await this.remove(relation.table, Object.fromEntries(relation.references.map((k, i) => [k, getCell(row, relation.fields[i])])));
      }
      if (value.$disconnect) {
        Object.assign(update, Object.fromEntries(relation.fields.map((k, i) => [k, null])));
      }
      if (value.$set || typeof value === "function") {
        await this.set(
          relation.table,
          Object.fromEntries(relation.references.map((k, i) => [k, getCell(row, relation.fields[i])])),
          value.$set ?? value
        );
      }
      if (value.$create) {
        const result = await this.createOrUpdate(relation.table, {
          ...Object.fromEntries(relation.references.map((k, i) => [k, getCell(row, relation.fields[i])])),
          ...value.$create
        });
        Object.assign(update, Object.fromEntries(relation.fields.map((k, i) => [k, getCell(result, relation.references[i])])));
      }
      if (value.$upsert) {
        await this.upsert(relation.table, makeArray(value.$upsert).map((r) => ({
          ...Object.fromEntries(relation.references.map((k, i) => [k, getCell(row, relation.fields[i])])),
          ...r
        })));
        Object.assign(update, Object.fromEntries(relation.fields.map((k, i) => [k, getCell(value.$upsert, relation.references[i])])));
      }
      if (value.$connect) {
        const result = await this.get(relation.table, value.$connect);
        if (result.length !== 1) throw new Error("related row not found or not unique");
        Object.assign(update, Object.fromEntries(relation.fields.map((k, i) => [k, getCell(result[0], relation.references[i])])));
      }
    } else if (relation.type === "oneToMany") {
      if (Array.isArray(value)) {
        const $create = [], $upsert = [];
        value.forEach((item) => this.hasRelation(relation.table, item) ? $create.push(item) : $upsert.push(item));
        value = { $remove: {}, $create, $upsert };
      }
      if (value.$remove) {
        await this.remove(relation.table, mergeQuery(Object.fromEntries(relation.references.map((k, i) => [k, row[relation.fields[i]]])), value.$remove));
      }
      if (value.$disconnect) {
        await this.set(
          relation.table,
          mergeQuery(Object.fromEntries(relation.references.map((k, i) => [k, getCell(row, relation.fields[i])])), value.$disconnect),
          Object.fromEntries(relation.references.map((k, i) => [k, null]))
        );
      }
      if (value.$set || typeof value === "function") {
        for (const setexpr of makeArray(value.$set ?? value)) {
          const [query, update2] = setexpr.update ? [setexpr.where, setexpr.update] : [{}, setexpr];
          await this.set(
            relation.table,
            mergeQuery(Object.fromEntries(relation.references.map((k, i) => [k, row[relation.fields[i]]])), query),
            update2
          );
        }
      }
      if (value.$create) {
        for (const item of makeArray(value.$create)) {
          await this.createOrUpdate(relation.table, {
            ...Object.fromEntries(relation.references.map((k, i) => [k, getCell(row, relation.fields[i])])),
            ...item
          });
        }
      }
      if (value.$upsert) {
        await this.upsert(relation.table, makeArray(value.$upsert).map((r) => ({
          ...Object.fromEntries(relation.references.map((k, i) => [k, getCell(row, relation.fields[i])])),
          ...r
        })));
      }
      if (value.$connect) {
        await this.set(
          relation.table,
          value.$connect,
          Object.fromEntries(relation.references.map((k, i) => [k, row[relation.fields[i]]]))
        );
      }
    } else if (relation.type === "manyToMany") {
      const assocTable = Relation.buildAssociationTable(table, relation.table);
      const fields = relation.fields.map((x) => Relation.buildAssociationKey(x, table));
      const references = relation.references.map((x) => Relation.buildAssociationKey(x, relation.table));
      const shared = Object.entries(relation.shared).map(([x, y]) => [Relation.buildSharedKey(x, y), {
        field: x,
        reference: y
      }]);
      if (Array.isArray(value)) {
        const $create = [], $upsert = [];
        value.forEach((item) => this.hasRelation(relation.table, item) ? $create.push(item) : $upsert.push(item));
        value = { $disconnect: {}, $create, $upsert };
      }
      if (value.$remove) {
        const rows = await this.select(assocTable, {
          ...Object.fromEntries(shared.map(([k, v]) => [k, getCell(row, v.field)])),
          ...Object.fromEntries(fields.map((k, i) => [k, getCell(row, relation.fields[i])])),
          [relation.table]: value.$remove
        }, null).execute();
        await this.remove(assocTable, (r) => Eval3.in(
          [...shared.map(([k, v]) => r[k]), ...fields.map((x) => r[x]), ...references.map((x) => r[x])],
          rows.map((r2) => [...shared.map(([k, v]) => getCell(r2, k)), ...fields.map((x) => getCell(r2, x)), ...references.map((x) => getCell(r2, x))])
        ));
        await this.remove(relation.table, (r) => Eval3.in(
          [...shared.map(([k, v]) => r[v.reference]), ...relation.references.map((x) => r[x])],
          rows.map((r2) => [...shared.map(([k, v]) => getCell(r2, k)), ...references.map((x) => getCell(r2, x))])
        ));
      }
      if (value.$disconnect) {
        const rows = await this.select(assocTable, {
          ...Object.fromEntries(shared.map(([k, v]) => [k, getCell(row, v.field)])),
          ...Object.fromEntries(fields.map((k, i) => [k, getCell(row, relation.fields[i])])),
          [relation.table]: value.$disconnect
        }, null).execute();
        await this.remove(assocTable, (r) => Eval3.in(
          [...shared.map(([k, v]) => r[k]), ...fields.map((x) => r[x]), ...references.map((x) => r[x])],
          rows.map((r2) => [...shared.map(([k, v]) => getCell(r2, k)), ...fields.map((x) => getCell(r2, x)), ...references.map((x) => getCell(r2, x))])
        ));
      }
      if (value.$set) {
        for (const setexpr of makeArray(value.$set)) {
          const [query, update2] = setexpr.update ? [setexpr.where, setexpr.update] : [{}, setexpr];
          const rows = await this.select(assocTable, (r) => ({
            ...Object.fromEntries(shared.map(([k, v]) => [k, getCell(row, v.field)])),
            ...Object.fromEntries(fields.map((k, i) => [k, getCell(row, relation.fields[i])])),
            [relation.table]: query
          }), null).execute();
          await this.set(
            relation.table,
            (r) => Eval3.in(
              [...shared.map(([k, v]) => r[v.reference]), ...relation.references.map((x) => r[x])],
              rows.map((r2) => [...shared.map(([k, v]) => getCell(r2, k)), ...references.map((x) => getCell(r2, x))])
            ),
            update2
          );
        }
      }
      if (value.$create) {
        const result = [];
        for (const item of makeArray(value.$create)) {
          result.push(await this.createOrUpdate(relation.table, {
            ...Object.fromEntries(relation.references.map((k, i) => [k, getCell(row, relation.fields[i])])),
            ...item
          }));
        }
        await this.upsert(assocTable, result.map((r) => ({
          ...Object.fromEntries(shared.map(([k, v]) => [k, getCell(row, v.field)])),
          ...Object.fromEntries(fields.map((k, i) => [k, row[relation.fields[i]]])),
          ...Object.fromEntries(references.map((k, i) => [k, r[relation.references[i]]]))
        })));
      }
      if (value.$upsert) {
        await this.upsert(relation.table, makeArray(value.$upsert).map((r) => ({
          ...Object.fromEntries(relation.references.map((k, i) => [k, getCell(row, relation.fields[i])])),
          ...r
        })));
        await this.upsert(assocTable, makeArray(value.$upsert).map((r) => ({
          ...Object.fromEntries(shared.map(([k, v]) => [k, getCell(row, v.field)])),
          ...Object.fromEntries(fields.map((k, i) => [k, row[relation.fields[i]]])),
          ...Object.fromEntries(references.map((k, i) => [k, r[relation.references[i]]]))
        })));
      }
      if (value.$connect) {
        const rows = await this.get(
          relation.table,
          mergeQuery(Object.fromEntries(shared.map(([k, v]) => [v.reference, getCell(row, v.field)])), value.$connect)
        );
        await this.upsert(assocTable, rows.map((r) => ({
          ...Object.fromEntries(shared.map(([k, v]) => [k, getCell(row, v.field)])),
          ...Object.fromEntries(fields.map((k, i) => [k, row[relation.fields[i]]])),
          ...Object.fromEntries(references.map((k, i) => [k, r[relation.references[i]]]))
        })));
      }
    }
    if (Object.keys(update).length) {
      await this.set(table, pick(model.format(row), makeArray(model.primary)), update);
    }
  }
  hasRelation(table, data) {
    var _a47;
    for (const key in data) {
      if (data[key] !== void 0 && ((_a47 = this.tables[table].fields[key]) == null ? void 0 : _a47.relation)) return true;
    }
    return false;
  }
}, __name11(_a18, "Database"), __publicField(_a18, "transact", Symbol("minato.transact")), __publicField(_a18, "migrate", Symbol("minato.migrate")), _a18);
var _a19;
var Driver = (_a19 = class {
  constructor(ctx, config) {
    __publicField(this, "database");
    __publicField(this, "logger");
    __publicField(this, "types", /* @__PURE__ */ Object.create(null));
    this.ctx = ctx;
    this.config = config;
    this.database = ctx.model;
    this.logger = ctx.logger(this.constructor.name);
    ctx.on("ready", async () => {
      await Promise.resolve();
      await this.start();
      ctx.model.drivers.push(this);
      ctx.model.refresh();
      const database = Object.create(ctx.model);
      defineProperty(database, "ctx", ctx);
      database._driver = this;
      database[Service2.tracker] = {
        associate: "database",
        property: "ctx"
      };
      ctx.set("database", Context2.associate(database, "database"));
    });
    ctx.on("dispose", async () => {
      remove(ctx.model.drivers, this);
      await this.stop();
    });
  }
  model(table) {
    if (typeof table === "string") {
      const model2 = this.database.tables[table];
      if (model2) return model2;
      throw new TypeError(`unknown table name "${table}"`);
    }
    if (Selection.is(table)) {
      if (!table.args[0].fields && (typeof table.table === "string" || Selection.is(table.table))) {
        return table.model;
      }
      const model2 = new Model("temp");
      if (table.args[0].fields) {
        model2.fields = mapValues(table.args[0].fields, (expr) => ({
          type: Type.fromTerm(expr)
        }));
      } else {
        model2.fields = mapValues(table.model.fields, (field) => ({
          type: Type.fromField(field)
        }));
      }
      return model2;
    }
    const model = new Model("temp");
    for (const key in table) {
      const submodel = this.model(table[key]);
      for (const field in submodel.fields) {
        if (!Field.available(submodel.fields[field])) continue;
        model.fields[`${key}.${field}`] = {
          expr: Eval3("", [table[key].ref, field], Type.fromField(submodel.fields[field])),
          type: Type.fromField(submodel.fields[field])
        };
      }
    }
    return model;
  }
  async migrate(name, hooks) {
    const database = this.database.makeProxy(Database.migrate);
    const model = this.model(name);
    await (database.migrateTasks[name] = Promise.resolve(database.migrateTasks[name]).then(() => {
      return Promise.all([...model.migrations].map(async ([migrate, keys]) => {
        try {
          if (!hooks.before(keys)) return;
          await migrate(database);
          hooks.after(keys);
        } catch (reason) {
          hooks.error(reason);
        }
      }));
    }).then(hooks.finalize).catch(hooks.error));
  }
  define(converter) {
    converter.types.forEach((type) => this.types[type] = converter);
  }
  async _ensureSession() {
  }
  async prepareIndexes(table) {
    const oldIndexes = await this.getIndexes(table);
    const { indexes } = this.model(table);
    for (const index of indexes) {
      const oldIndex = oldIndexes.find((info) => info.name === index.name);
      if (!oldIndex) {
        await this.createIndex(table, index);
      } else if (!deepEqual(oldIndex, index)) {
        await this.dropIndex(table, index.name);
        await this.createIndex(table, index);
      }
    }
  }
}, __name11(_a19, "Driver"), __publicField(_a19, "inject", ["model"]), _a19);
var _a20;
var RuntimeError = (_a20 = class extends Error {
  constructor(code, message) {
    super(message || code.replace("-", " "));
    __publicField(this, "name", "RuntimeError");
    this.code = code;
  }
  static check(error, code) {
    if (!(error instanceof _a20)) return false;
    return !code || error.message === code;
  }
}, __name11(_a20, "RuntimeError"), _a20);
var queryOperators = {
  // logical
  $or: __name11((query, data) => query.reduce((prev, query2) => prev || executeFieldQuery(query2, data), false), "$or"),
  $and: __name11((query, data) => query.reduce((prev, query2) => prev && executeFieldQuery(query2, data), true), "$and"),
  $not: __name11((query, data) => !executeFieldQuery(query, data), "$not"),
  // existence
  $exists: __name11((query, data) => query !== isNullable(data), "$exists"),
  // comparison
  $eq: __name11((query, data) => data.valueOf() === query.valueOf(), "$eq"),
  $ne: __name11((query, data) => data.valueOf() !== query.valueOf(), "$ne"),
  $gt: __name11((query, data) => data.valueOf() > query.valueOf(), "$gt"),
  $gte: __name11((query, data) => data.valueOf() >= query.valueOf(), "$gte"),
  $lt: __name11((query, data) => data.valueOf() < query.valueOf(), "$lt"),
  $lte: __name11((query, data) => data.valueOf() <= query.valueOf(), "$lte"),
  // membership
  $in: __name11((query, data) => query.includes(data), "$in"),
  $nin: __name11((query, data) => !query.includes(data), "$nin"),
  // regexp
  $regex: __name11((query, data) => makeRegExp(query).test(data), "$regex"),
  $regexFor: __name11((query, data) => typeof query === "string" ? makeRegExp(data).test(query) : makeRegExp(data, query.flags).test(query.input), "$regexFor"),
  // bitwise
  $bitsAllSet: __name11((query, data) => (query & data) === query, "$bitsAllSet"),
  $bitsAllClear: __name11((query, data) => (query & data) === 0, "$bitsAllClear"),
  $bitsAnySet: __name11((query, data) => (query & data) !== 0, "$bitsAnySet"),
  $bitsAnyClear: __name11((query, data) => (query & data) !== query, "$bitsAnyClear"),
  // list
  $el: __name11((query, data) => data.some((item) => executeFieldQuery(query, item)), "$el"),
  $size: __name11((query, data) => data.length === query, "$size")
};
function executeFieldQuery(query, data) {
  if (Array.isArray(query)) {
    return query.includes(data);
  } else if (query instanceof RegExp) {
    return query.test(data);
  } else if (isComparable(query)) {
    return data.valueOf() === query.valueOf();
  } else if (isNullable(query)) {
    return isNullable(data);
  }
  for (const key in query) {
    if (key in queryOperators) {
      if (!queryOperators[key](query[key], data)) return false;
    }
  }
  return true;
}
__name11(executeFieldQuery, "executeFieldQuery");
function executeQuery(data, query, ref, env = {}) {
  const entries = Object.entries(query);
  return entries.every(([key, value]) => {
    if (key === "$and") {
      return value.reduce((prev, query2) => prev && executeQuery(data, query2, ref, env), true);
    } else if (key === "$or") {
      return value.reduce((prev, query2) => prev || executeQuery(data, query2, ref, env), false);
    } else if (key === "$not") {
      return !executeQuery(data, value, ref, env);
    } else if (key === "$expr") {
      return executeEval({ ...env, [ref]: data, _: data }, value);
    }
    try {
      const flattenQuery = isFlat(query[key]) ? { [key]: query[key] } : flatten(query[key], `${key}.`);
      return Object.entries(flattenQuery).every(([key2, value2]) => executeFieldQuery(value2, getCell(data, key2)));
    } catch {
      return false;
    }
  });
}
__name11(executeQuery, "executeQuery");
var Types = Symbol("minato.types");
var Tables = Symbol("minato.tables");

// node_modules/@satorijs/core/lib/index.mjs
var import_path_to_regexp = __toESM(require_dist(), 1);

// node_modules/@cordisjs/plugin-http/lib/adapter/browser.js
var __defProp12 = Object.defineProperty;
var __name12 = (target, value) => __defProp12(target, "name", { value, configurable: true });
var v4 = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$/;
var v6seg = "[a-fA-F\\d]{1,4}";
var v6core = [
  `(?:${v6seg}:){7}(?:${v6seg}|:)`,
  // 1:2:3:4:5:6:7::  1:2:3:4:5:6:7:8
  `(?:${v6seg}:){6}(?:${v4}|:${v6seg}|:)`,
  // 1:2:3:4:5:6::    1:2:3:4:5:6::8   1:2:3:4:5:6::8  1:2:3:4:5:6::1.2.3.4
  `(?:${v6seg}:){5}(?::${v4}|(?::${v6seg}){1,2}|:)`,
  // 1:2:3:4:5::      1:2:3:4:5::7:8   1:2:3:4:5::8    1:2:3:4:5::7:1.2.3.4
  `(?:${v6seg}:){4}(?:(?::${v6seg}){0,1}:${v4}|(?::${v6seg}){1,3}|:)`,
  // 1:2:3:4::        1:2:3:4::6:7:8   1:2:3:4::8      1:2:3:4::6:7:1.2.3.4
  `(?:${v6seg}:){3}(?:(?::${v6seg}){0,2}:${v4}|(?::${v6seg}){1,4}|:)`,
  // 1:2:3::          1:2:3::5:6:7:8   1:2:3::8        1:2:3::5:6:7:1.2.3.4
  `(?:${v6seg}:){2}(?:(?::${v6seg}){0,3}:${v4}|(?::${v6seg}){1,5}|:)`,
  // 1:2::            1:2::4:5:6:7:8   1:2::8          1:2::4:5:6:7:1.2.3.4
  `(?:${v6seg}:){1}(?:(?::${v6seg}){0,4}:${v4}|(?::${v6seg}){1,6}|:)`,
  // 1::              1::3:4:5:6:7:8   1::8            1::3:4:5:6:7:1.2.3.4
  `(?::(?:(?::${v6seg}){0,5}:${v4}|(?::${v6seg}){1,7}|:))`
  // ::2:3:4:5:6:7:8  ::2:3:4:5:6:7:8  ::8             ::1.2.3.4
];
var v6 = new RegExp(`^(?:${v6core.join("|")})(?:%[0-9a-zA-Z]{1,})?$`);
async function lookup(address) {
  if (v4.test(address)) return { address, family: 4 };
  if (v6.test(address)) return { address, family: 6 };
  throw new Error("Invalid IP address");
}
__name12(lookup, "lookup");
async function loadFile(url) {
  return void 0;
}
__name12(loadFile, "loadFile");
var { WebSocket } = globalThis;

// node_modules/@cordisjs/plugin-http/lib/index.js
var import_mime_db = __toESM(require_mime_db());
var __defProp13 = Object.defineProperty;
var __name13 = (target, value) => __defProp13(target, "name", { value, configurable: true });
var bogonV4 = [
  "0.0.0.0/8",
  // RFC 1122 'this' network
  "10.0.0.0/8",
  // RFC 1918 private space
  "100.64.0.0/10",
  // RFC 6598 Carrier grade nat space
  "127.0.0.0/8",
  // RFC 1122 localhost
  "169.254.0.0/16",
  // RFC 3927 link local
  "172.16.0.0/12",
  // RFC 1918 private space
  "192.0.2.0/24",
  // RFC 5737 TEST-NET-1
  "192.88.99.0/24",
  // RFC 7526 6to4 anycast relay
  "192.168.0.0/16",
  // RFC 1918 private space
  "198.18.0.0/15",
  // RFC 2544 benchmarking
  "198.51.100.0/24",
  // RFC 5737 TEST-NET-2
  "203.0.113.0/24",
  // RFC 5737 TEST-NET-3
  "224.0.0.0/4",
  // multicast
  "240.0.0.0/4"
  // reserved
];
var bogonV6 = [
  "::/8",
  // RFC 4291 IPv4-compatible, loopback, et al
  "0100::/64",
  // RFC 6666 Discard-Only
  "2001:2::/48",
  // RFC 5180 BMWG
  "2001:10::/28",
  // RFC 4843 ORCHID
  "2001:db8::/32",
  // RFC 3849 documentation
  "2002::/16",
  // RFC 7526 6to4 anycast relay
  "3ffe::/16",
  // RFC 3701 old 6bone
  "fc00::/7",
  // RFC 4193 unique local unicast
  "fe80::/10",
  // RFC 4291 link local unicast
  "fec0::/10",
  // RFC 3879 old site local unicast
  "ff00::/8"
  // RFC 4291 multicast
];
function parseIPv4(ip) {
  return ip.split(".").reduce((a, b) => (a << 8n) + BigInt(b), 0n);
}
__name13(parseIPv4, "parseIPv4");
function parseIPv6(ip) {
  const exp = ip.indexOf("::");
  let num = 0n;
  if (exp !== -1 && exp !== 0) {
    ip.slice(0, exp).split(":").forEach((piece, i) => {
      num |= BigInt(`0x${piece}`) << BigInt((7 - i) * 16);
    });
  }
  if (exp === ip.length - 2) {
    return num;
  }
  const rest = exp === -1 ? ip : ip.slice(exp + 2);
  const v42 = rest.includes(".");
  const pieces = rest.split(":");
  let start = 0;
  if (v42) {
    start += 2;
    const [addr] = pieces.splice(-1, 1);
    num |= parseIPv4(addr);
  }
  pieces.reverse().forEach((piece, i) => {
    num |= BigInt(`0x${piece}`) << BigInt((start + i) * 8);
  });
  return num;
}
__name13(parseIPv6, "parseIPv6");
async function isLocalAddress({ address, family }) {
  if (family !== 4 && family !== 6) return false;
  const { bogons, length, parse } = family === 4 ? { bogons: bogonV4, length: 32, parse: parseIPv4 } : { bogons: bogonV6, length: 128, parse: parseIPv6 };
  const num = parse(address);
  for (const bogon of bogons) {
    const [prefix, cidr] = bogon.split("/");
    const mask = (1n << BigInt(cidr)) - 1n << BigInt(length - +cidr);
    if ((num & mask) === parse(prefix)) return true;
  }
  return false;
}
__name13(isLocalAddress, "isLocalAddress");
var kHTTPError = Symbol.for("cordis.http.error");
var _a21, _b, _c;
var HTTPError = (_c = class extends (_b = Error, _a21 = kHTTPError, _b) {
  constructor(message, code) {
    super(message);
    __publicField(this, _a21, true);
    __publicField(this, "response");
    this.code = code;
  }
  static is(error) {
    return !!(error == null ? void 0 : error[kHTTPError]);
  }
}, __name13(_c, "HTTPError"), _c);
function encodeRequest(data) {
  if (data instanceof URLSearchParams) return [null, data];
  if (data instanceof ArrayBuffer) return [null, data];
  if (ArrayBuffer.isView(data)) return [null, data];
  if (data instanceof Blob) return [null, data];
  if (data instanceof FormData) return [null, data];
  return ["application/json", JSON.stringify(data)];
}
__name13(encodeRequest, "encodeRequest");
var _a22, _b2;
var HTTP = (_b2 = class extends Service2 {
  constructor(...args) {
    var _a47;
    let ctx, config;
    if (Context2.is(args[0])) {
      ctx = args[0];
      config = args[1];
    } else {
      ctx = new Context2();
    }
    super(ctx, "http");
    __publicField(this, "isError", HTTPError.is);
    __publicField(this, "_decoders", /* @__PURE__ */ Object.create(null));
    this.config = config ?? {};
    this.decoder("json", (raw) => raw.json());
    this.decoder("text", (raw) => raw.text());
    this.decoder("blob", (raw) => raw.blob());
    this.decoder("arraybuffer", (raw) => raw.arrayBuffer());
    this.decoder("formdata", (raw) => raw.formData());
    this.decoder("stream", (raw) => raw.body);
    this.ctx.on("http/file", (url, options) => loadFile(url));
    (_a47 = this.schema) == null ? void 0 : _a47.extend(_b2.Intercept);
  }
  decoder(type, decoder) {
    return this.ctx.effect(() => {
      this._decoders[type] = decoder;
      return () => delete this._decoders[type];
    });
  }
  extend(config = {}) {
    return this[Service2.extend]({
      config: _b2.mergeConfig(this.config, config)
    });
  }
  resolveConfig(init) {
    let result = { headers: {}, ...this.config };
    this.ctx.emit({ ctx: this.ctx }, "http/config", result);
    let intercept = this.ctx[Context2.intercept];
    while (intercept) {
      result = _b2.mergeConfig(result, intercept.http);
      intercept = Object.getPrototypeOf(intercept);
    }
    result = _b2.mergeConfig(result, init);
    return result;
  }
  resolveURL(url, config, isWebSocket = false) {
    if (config.endpoint) {
      try {
        new URL(url);
      } catch {
        url = trimSlash(config.endpoint) + url;
      }
    }
    try {
      url = new URL(url, config.baseURL);
    } catch (error) {
      throw new TypeError(`Invalid URL: ${url}`);
    }
    if (isWebSocket) url.protocol = url.protocol.replace(/^http/, "ws");
    for (const [key, value] of Object.entries(config.params ?? {})) {
      if (isNullable(value)) continue;
      url.searchParams.append(key, value);
    }
    return url;
  }
  defaultDecoder(response) {
    const type = response.headers.get("Content-Type");
    if (type == null ? void 0 : type.startsWith("application/json")) {
      return response.json();
    } else if (type == null ? void 0 : type.startsWith("text/")) {
      return response.text();
    } else {
      return response.arrayBuffer();
    }
  }
  async [(_a22 = Service2.immediate, Service2.invoke)](...args) {
    let method;
    if (typeof args[1] === "string" || args[1] instanceof URL) {
      method = args.shift();
    }
    const config = this.resolveConfig(args[1]);
    const url = this.resolveURL(args[0], config);
    method ?? (method = config.method ?? "GET");
    const controller = new AbortController();
    if (config.signal) {
      if (config.signal.aborted) {
        throw config.signal.reason;
      }
      config.signal.addEventListener("abort", () => {
        controller.abort(config.signal.reason);
      });
    }
    const dispose = this.ctx.effect(() => {
      const timer = config.timeout && setTimeout(() => {
        controller.abort(new HTTPError("request timeout", "ETIMEDOUT"));
      }, config.timeout);
      return (done) => {
        clearTimeout(timer);
        if (done) return;
        controller.abort(new HTTPError("context disposed", "ETIMEDOUT"));
      };
    });
    controller.signal.addEventListener("abort", () => dispose());
    try {
      const headers = new Headers(config.headers);
      const init = {
        method,
        headers,
        body: config.data,
        keepalive: config.keepAlive,
        redirect: config.redirect,
        signal: controller.signal
      };
      if (config.data && typeof config.data === "object") {
        const [type, body] = encodeRequest(config.data);
        init.body = body;
        if (type && !headers.has("Content-Type")) {
          headers.append("Content-Type", type);
        }
      }
      this.ctx.emit({ ctx: this.ctx }, "http/fetch-init", url, init, config);
      const raw = await fetch(url, init).catch((cause) => {
        if (_b2.Error.is(cause)) throw cause;
        const error = new _b2.Error(`fetch ${url} failed`);
        error.cause = cause;
        throw error;
      });
      const response = {
        data: null,
        url: raw.url,
        status: raw.status,
        statusText: raw.statusText,
        headers: raw.headers
      };
      const validateStatus = config.validateStatus ?? ((status) => status < 400);
      if (!validateStatus(raw.status)) {
        const error = new _b2.Error(raw.statusText);
        error.response = response;
        try {
          response.data = await this.defaultDecoder(raw);
        } catch {
        }
        throw error;
      }
      if (config.responseType) {
        let decoder;
        if (typeof config.responseType === "function") {
          decoder = config.responseType;
        } else {
          decoder = this._decoders[config.responseType];
          if (!decoder) {
            throw new TypeError(`Unknown responseType: ${config.responseType}`);
          }
        }
        response.data = await decoder(raw);
      } else {
        response.data = await this.defaultDecoder(raw);
      }
      return response;
    } finally {
      dispose(true);
    }
  }
  async head(url, config) {
    const response = await this(url, { method: "HEAD", ...config });
    return response.headers;
  }
  axios(...args) {
    this.ctx.emit(this.ctx, "internal/warning", "ctx.http.axios() is deprecated, use ctx.http() instead");
    if (typeof args[0] === "string") {
      return this(args[0], args[1]);
    } else {
      return this(args[0].url, args[0]);
    }
  }
  ws(url, init) {
    const config = this.resolveConfig(init);
    url = this.resolveURL(url, config, true);
    let options;
    if (WebSocket !== globalThis.WebSocket) {
      options = {
        handshakeTimeout: config == null ? void 0 : config.timeout,
        headers: config == null ? void 0 : config.headers
      };
      this.ctx.emit({ ctx: this.ctx }, "http/websocket-init", url, options, config);
    }
    const socket = new WebSocket(url, options);
    const dispose = this.ctx.on("dispose", () => {
      socket.close(1e3, "context disposed");
    });
    socket.addEventListener("close", () => {
      dispose();
    });
    return socket;
  }
  async file(url, options = {}) {
    var _a47, _b7;
    const task = await this.ctx.serial(this, "http/file", url, options);
    if (task) return task;
    const capture = /^data:([\w/.+-]+);base64,(.*)$/.exec(url);
    if (capture) {
      const [, type2, base64] = capture;
      let name2 = "file";
      const ext = type2 && ((_b7 = (_a47 = import_mime_db.default[type2]) == null ? void 0 : _a47.extensions) == null ? void 0 : _b7[0]);
      if (ext) name2 += `.${ext}`;
      return { type: type2, mime: type2, data: Binary.fromBase64(base64), filename: name2 };
    }
    const { headers, data, url: responseUrl } = await this(url, {
      method: "GET",
      responseType: "arraybuffer",
      timeout: +options.timeout || void 0
    });
    const type = headers.get("content-type");
    const [, name] = responseUrl.match(/.+\/([^/?]*)(?=\?)?/);
    return { type, mime: type, filename: name, data };
  }
  async isLocal(url) {
    let { hostname, protocol } = new URL(url);
    if (protocol !== "http:" && protocol !== "https:") return true;
    if (/^\[.+\]$/.test(hostname)) {
      hostname = hostname.slice(1, -1);
    }
    try {
      const address = await lookup(hostname);
      return isLocalAddress(address);
    } catch {
      return false;
    }
  }
}, __name13(_b2, "HTTP"), __publicField(_b2, "Error", HTTPError), /** @deprecated use `http.isError()` instead */
__publicField(_b2, "isAxiosError", HTTPError.is), __publicField(_b2, "provide", "http"), __publicField(_b2, _a22, true), (() => {
  for (const method of ["get", "delete"]) {
    defineProperty(_b2.prototype, method, async function(url, config) {
      const response = await this(url, { method, ...config });
      return response.data;
    });
  }
  for (const method of ["patch", "post", "put"]) {
    defineProperty(_b2.prototype, method, async function(url, data, config) {
      const response = await this(url, { method, data, ...config });
      return response.data;
    });
  }
})(), __publicField(_b2, "Config", lib_default2.object({
  timeout: lib_default2.natural().role("ms").description("等待请求的最长时间。"),
  keepAlive: lib_default2.boolean().description("是否保持连接。")
})), __publicField(_b2, "Intercept", lib_default2.object({
  baseURL: lib_default2.string().description("基础 URL。"),
  timeout: lib_default2.natural().role("ms").description("等待请求的最长时间。"),
  keepAlive: lib_default2.boolean().description("是否保持连接。")
})), __publicField(_b2, "mergeConfig", __name13((target, source) => ({
  ...target,
  ...source,
  headers: {
    ...target == null ? void 0 : target.headers,
    ...source == null ? void 0 : source.headers
  }
}), "mergeConfig")), _b2);

// node_modules/@satorijs/element/lib/index.mjs
var __defProp14 = Object.defineProperty;
var __getOwnPropNames4 = Object.getOwnPropertyNames;
var __name14 = (target, value) => __defProp14(target, "name", { value, configurable: true });
var __commonJS5 = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames4(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var require_src3 = __commonJS5({
  "src/index.ts"(exports, module) {
    var _a47;
    var kElement = Symbol.for("satori.element");
    var ElementConstructor = (_a47 = class {
      get data() {
        return this.attrs;
      }
      getTagName() {
        var _a48;
        if (this.type === "component") {
          return ((_a48 = this.attrs.is) == null ? void 0 : _a48.name) ?? "component";
        } else {
          return this.type;
        }
      }
      toAttrString() {
        return Object.entries(this.attrs).map(([key, value]) => {
          if (isNullable(value))
            return "";
          key = hyphenate(key);
          if (value === true)
            return ` ${key}`;
          if (value === false)
            return ` no-${key}`;
          return ` ${key}="${Element.escape("" + value, true)}"`;
        }).join("");
      }
      toString(strip = false) {
        if (this.type === "text" && "content" in this.attrs) {
          return strip ? this.attrs.content : Element.escape(this.attrs.content);
        }
        const inner = this.children.map((child) => child.toString(strip)).join("");
        if (strip)
          return inner;
        const attrs = this.toAttrString();
        const tag = this.getTagName();
        if (!this.children.length)
          return `<${tag}${attrs}/>`;
        return `<${tag}${attrs}>${inner}</${tag}>`;
      }
    }, __name14(_a47, "ElementConstructor"), _a47);
    defineProperty(ElementConstructor, "name", "Element");
    defineProperty(ElementConstructor.prototype, kElement, true);
    function Element(type, ...args) {
      const el = Object.create(ElementConstructor.prototype);
      const attrs = {}, children = [];
      if (args[0] && typeof args[0] === "object" && !Element.isElement(args[0]) && !Array.isArray(args[0])) {
        const props = args.shift();
        for (const [key, value] of Object.entries(props)) {
          if (isNullable(value))
            continue;
          if (key === "children") {
            args.push(...makeArray(value));
          } else {
            attrs[camelize(key)] = value;
          }
        }
      }
      for (const child of args) {
        children.push(...Element.toElementArray(child));
      }
      if (typeof type === "function") {
        attrs.is = type;
        type = "component";
      }
      return Object.assign(el, { type, attrs, children });
    }
    __name14(Element, "Element");
    var evaluate2 = new Function("expr", "context", `
  try {
    with (context) {
      return eval(expr)
    }
  } catch {}
`);
    ((Element2) => {
      Element2.jsx = Element2;
      Element2.jsxs = Element2;
      Element2.jsxDEV = Element2;
      Element2.Fragment = "template";
      function isElement(source) {
        return source && typeof source === "object" && source[kElement];
      }
      Element2.isElement = isElement;
      __name14(isElement, "isElement");
      function toElement(content) {
        if (typeof content === "string" || typeof content === "number" || typeof content === "boolean") {
          content = "" + content;
          if (content)
            return Element2("text", { content });
        } else if (isElement(content)) {
          return content;
        } else if (!isNullable(content)) {
          throw new TypeError(`Invalid content: ${content}`);
        }
      }
      Element2.toElement = toElement;
      __name14(toElement, "toElement");
      function toElementArray(content) {
        if (Array.isArray(content)) {
          return content.map(toElement).filter((x) => x);
        } else {
          return [toElement(content)].filter((x) => x);
        }
      }
      Element2.toElementArray = toElementArray;
      __name14(toElementArray, "toElementArray");
      function normalize(source, context) {
        return typeof source === "string" ? parse(source, context) : toElementArray(source);
      }
      Element2.normalize = normalize;
      __name14(normalize, "normalize");
      function escape(source, inline = false) {
        const result = (source ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return inline ? result.replace(/"/g, "&quot;") : result;
      }
      Element2.escape = escape;
      __name14(escape, "escape");
      function unescape(source) {
        return source.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, code) => code === "38" ? _ : String.fromCharCode(+code)).replace(/&#x([0-9a-f]+);/gi, (_, code) => code === "26" ? _ : String.fromCharCode(parseInt(code, 16))).replace(/&(amp|#38|#x26);/g, "&");
      }
      Element2.unescape = unescape;
      __name14(unescape, "unescape");
      function from(source, options = {}) {
        var _a48;
        const elements = parse(source);
        if (options.caret) {
          if (options.type && ((_a48 = elements[0]) == null ? void 0 : _a48.type) !== options.type)
            return;
          return elements[0];
        }
        return select(elements, options.type || "*")[0];
      }
      Element2.from = from;
      __name14(from, "from");
      const combRegExp = / *([ >+~]) */g;
      function parseSelector(input) {
        return input.split(",").map((query) => {
          const selectors = [];
          query = query.trim();
          let combCap, combinator = " ";
          while (combCap = combRegExp.exec(query)) {
            selectors.push({ type: query.slice(0, combCap.index), combinator });
            combinator = combCap[1];
            query = query.slice(combCap.index + combCap[0].length);
          }
          selectors.push({ type: query, combinator });
          return selectors;
        });
      }
      Element2.parseSelector = parseSelector;
      __name14(parseSelector, "parseSelector");
      function select(source, query) {
        if (!source || !query)
          return [];
        if (typeof source === "string")
          source = parse(source);
        if (typeof query === "string")
          query = parseSelector(query);
        if (!query.length)
          return [];
        let adjacent = [];
        const results = [];
        for (const [index, element] of source.entries()) {
          const inner = [];
          const local = [...query, ...adjacent];
          adjacent = [];
          let matched = false;
          for (const group of local) {
            const { type, combinator } = group[0];
            if (type === element.type || type === "*") {
              if (group.length === 1) {
                matched = true;
              } else if ([" ", ">"].includes(group[1].combinator)) {
                inner.push(group.slice(1));
              } else if (group[1].combinator === "+") {
                adjacent.push(group.slice(1));
              } else {
                query.push(group.slice(1));
              }
            }
            if (combinator === " ") {
              inner.push(group);
            }
          }
          if (matched)
            results.push(source[index]);
          results.push(...select(element.children, inner));
        }
        return results;
      }
      Element2.select = select;
      __name14(select, "select");
      function interpolate2(expr, context) {
        expr = expr.trim();
        if (!/^[\w.]+$/.test(expr)) {
          return evaluate2(expr, context) ?? "";
        }
        let value = context;
        for (const part of expr.split(".")) {
          value = value[part];
          if (isNullable(value))
            return "";
        }
        return value ?? "";
      }
      Element2.interpolate = interpolate2;
      __name14(interpolate2, "interpolate");
      const tagRegExp1 = /(?<comment><!--[\s\S]*?-->)|(?<tag><(\/?)([^!\s>/]*)([^>]*?)\s*(\/?)>)/;
      const tagRegExp2 = /(?<comment><!--[\s\S]*?-->)|(?<tag><(\/?)([^!\s>/]*)([^>]*?)\s*(\/?)>)|(?<curly>\{(?<derivative>[@:/#][^\s}]*)?[\s\S]*?\})/;
      const attrRegExp1 = /([^\s=]+)(?:="(?<value1>[^"]*)"|='(?<value2>[^']*)')?/g;
      const attrRegExp2 = /([^\s=]+)(?:="(?<value1>[^"]*)"|='(?<value2>[^']*)'|=\{(?<curly>[^}]+)\})?/g;
      let Position;
      ((Position2) => {
        Position2[Position2["OPEN"] = 0] = "OPEN";
        Position2[Position2["CLOSE"] = 1] = "CLOSE";
        Position2[Position2["EMPTY"] = 2] = "EMPTY";
        Position2[Position2["CONTINUE"] = 3] = "CONTINUE";
      })(Position || (Position = {}));
      function parse(source, context) {
        const tokens = [];
        function pushText(content) {
          if (content)
            tokens.push(content);
        }
        __name14(pushText, "pushText");
        const tagRegExp = context ? tagRegExp2 : tagRegExp1;
        let tagCap;
        let trimStart = true;
        while (tagCap = tagRegExp.exec(source)) {
          const trimEnd = !tagCap.groups.curly;
          parseContent(source.slice(0, tagCap.index), trimStart, trimEnd);
          trimStart = trimEnd;
          source = source.slice(tagCap.index + tagCap[0].length);
          const [_, , , close, type, extra, empty] = tagCap;
          if (tagCap.groups.comment)
            continue;
          if (tagCap.groups.curly) {
            let name = "", position = 2;
            if (tagCap.groups.derivative) {
              name = tagCap.groups.derivative.slice(1);
              position = {
                "@": 2,
                "#": 0,
                "/": 1,
                ":": 3
                /* CONTINUE */
              }[tagCap.groups.derivative[0]];
            }
            tokens.push({
              type: "curly",
              name,
              position,
              source: tagCap.groups.curly,
              extra: tagCap.groups.curly.slice(1 + (tagCap.groups.derivative ?? "").length, -1)
            });
            continue;
          }
          tokens.push({
            type: "angle",
            source: _,
            name: type || Element2.Fragment,
            position: close ? 1 : empty ? 2 : 0,
            extra
          });
        }
        parseContent(source, trimStart, true);
        function parseContent(source2, trimStart2, trimEnd) {
          source2 = unescape(source2);
          if (trimStart2)
            source2 = source2.replace(/^\s*\n\s*/, "");
          if (trimEnd)
            source2 = source2.replace(/\s*\n\s*$/, "");
          pushText(source2);
        }
        __name14(parseContent, "parseContent");
        return parseTokens(foldTokens(tokens), context);
      }
      Element2.parse = parse;
      __name14(parse, "parse");
      function foldTokens(tokens) {
        const stack = [[{
          type: "angle",
          name: Element2.Fragment,
          position: 0,
          source: "",
          extra: "",
          children: { default: [] }
        }, "default"]];
        function pushToken(...tokens2) {
          const [token, slot] = stack[0];
          token.children[slot].push(...tokens2);
        }
        __name14(pushToken, "pushToken");
        for (const token of tokens) {
          if (typeof token === "string") {
            pushToken(token);
            continue;
          }
          const { name, position } = token;
          if (position === 1) {
            if (stack[0][0].name === name) {
              stack.shift();
            }
          } else if (position === 3) {
            stack[0][0].children[name] = [];
            stack[0][1] = name;
          } else if (position === 0) {
            pushToken(token);
            token.children = { default: [] };
            stack.unshift([token, "default"]);
          } else {
            pushToken(token);
          }
        }
        return stack[stack.length - 1][0].children.default;
      }
      __name14(foldTokens, "foldTokens");
      function parseTokens(tokens, context) {
        const result = [];
        for (const token of tokens) {
          if (typeof token === "string") {
            result.push(Element2("text", { content: token }));
          } else if (token.type === "angle") {
            const attrs = {};
            const attrRegExp = context ? attrRegExp2 : attrRegExp1;
            let attrCap;
            while (attrCap = attrRegExp.exec(token.extra)) {
              const [, key, v1, v2 = v1, v3] = attrCap;
              if (v3) {
                attrs[key] = interpolate2(v3, context);
              } else if (!isNullable(v2)) {
                attrs[key] = unescape(v2);
              } else if (key.startsWith("no-")) {
                attrs[key.slice(3)] = false;
              } else {
                attrs[key] = true;
              }
            }
            result.push(Element2(token.name, attrs, token.children && parseTokens(token.children.default, context)));
          } else if (!token.name) {
            result.push(...toElementArray(interpolate2(token.extra, context)));
          } else if (token.name === "if") {
            if (evaluate2(token.extra, context)) {
              result.push(...parseTokens(token.children.default, context));
            } else {
              result.push(...parseTokens(token.children.else || [], context));
            }
          } else if (token.name === "each") {
            const [expr, ident] = token.extra.split(/\s+as\s+/);
            const items = interpolate2(expr, context);
            if (!items || !items[Symbol.iterator])
              continue;
            for (const item of items) {
              result.push(...parseTokens(token.children.default, { ...context, [ident]: item }));
            }
          }
        }
        return result;
      }
      __name14(parseTokens, "parseTokens");
      function visit(element, rules, session) {
        const { type, attrs, children } = element;
        if (typeof rules === "function") {
          return rules(element, session);
        } else {
          let result = rules[typeof type === "string" ? type : ""] ?? rules.default ?? true;
          if (typeof result === "function") {
            result = result(attrs, children, session);
          }
          return result;
        }
      }
      __name14(visit, "visit");
      function transform(source, rules, session) {
        const elements = typeof source === "string" ? parse(source) : source;
        const output = [];
        elements.forEach((element) => {
          const { type, attrs, children } = element;
          const result = visit(element, rules, session);
          if (result === true) {
            output.push(Element2(type, attrs, transform(children, rules, session)));
          } else if (result !== false) {
            output.push(...toElementArray(result));
          }
        });
        return typeof source === "string" ? output.join("") : output;
      }
      Element2.transform = transform;
      __name14(transform, "transform");
      async function transformAsync(source, rules, session) {
        const elements = typeof source === "string" ? parse(source) : source;
        const children = (await Promise.all(elements.map(async (element) => {
          const { type, attrs, children: children2 } = element;
          const result = await visit(element, rules, session);
          if (result === true) {
            return [Element2(type, attrs, await transformAsync(children2, rules, session))];
          } else if (result !== false) {
            return toElementArray(result);
          } else {
            return [];
          }
        }))).flat(1);
        return typeof source === "string" ? children.join("") : children;
      }
      Element2.transformAsync = transformAsync;
      __name14(transformAsync, "transformAsync");
      function createFactory(type, ...keys) {
        return (...args) => {
          const element = Element2(type);
          keys.forEach((key, index) => {
            if (!isNullable(args[index])) {
              element.attrs[key] = args[index];
            }
          });
          if (args[keys.length]) {
            Object.assign(element.attrs, args[keys.length]);
          }
          return element;
        };
      }
      __name14(createFactory, "createFactory");
      Element2.warn = __name14(() => {
      }, "warn");
      function createAssetFactory(type) {
        return (src, ...args) => {
          let prefix = "base64://";
          if (typeof args[0] === "string") {
            prefix = `data:${args.shift()};base64,`;
          }
          if (is("Buffer", src)) {
            src = prefix + src.toString("base64");
          } else if (is("ArrayBuffer", src)) {
            src = prefix + arrayBufferToBase64(src);
          } else if (ArrayBuffer.isView(src)) {
            src = prefix + arrayBufferToBase64(src.buffer);
          }
          if (src.startsWith("base64://")) {
            (0, Element2.warn)(`protocol "base64:" is deprecated and will be removed in the future, please use "data:" instead`);
          }
          return Element2(type, { ...args[0], src });
        };
      }
      __name14(createAssetFactory, "createAssetFactory");
      Element2.text = createFactory("text", "content");
      Element2.at = createFactory("at", "id");
      Element2.sharp = createFactory("sharp", "id");
      Element2.quote = createFactory("quote", "id");
      Element2.image = createAssetFactory("img");
      Element2.img = createAssetFactory("img");
      Element2.video = createAssetFactory("video");
      Element2.audio = createAssetFactory("audio");
      Element2.file = createAssetFactory("file");
      function i18n(path2, children) {
        return Element2("i18n", typeof path2 === "string" ? { path: path2 } : path2, children);
      }
      Element2.i18n = i18n;
      __name14(i18n, "i18n");
    })(Element || (Element = {}));
    module.exports = Element;
  }
});
var lib_default3 = require_src3();

// node_modules/@satorijs/protocol/lib/index.mjs
var lib_exports2 = {};
__export(lib_exports2, {
  Channel: () => Channel,
  Methods: () => Methods,
  Opcode: () => Opcode,
  Status: () => Status,
  WebSocket: () => WebSocket2
});
var __defProp15 = Object.defineProperty;
var __name15 = (target, value) => __defProp15(target, "name", { value, configurable: true });
function Field2(name) {
  return { name };
}
__name15(Field2, "Field");
function Method(name, fields, isForm = false) {
  return { name, fields: fields.map(Field2), isForm };
}
__name15(Method, "Method");
var Methods = {
  "channel.get": Method("getChannel", ["channel_id", "guild_id"]),
  "channel.list": Method("getChannelList", ["guild_id", "next"]),
  "channel.create": Method("createChannel", ["guild_id", "data"]),
  "channel.update": Method("updateChannel", ["channel_id", "data"]),
  "channel.delete": Method("deleteChannel", ["channel_id"]),
  "channel.mute": Method("muteChannel", ["channel_id", "guild_id", "enable"]),
  "message.create": Method("createMessage", ["channel_id", "content"]),
  "message.update": Method("editMessage", ["channel_id", "message_id", "content"]),
  "message.delete": Method("deleteMessage", ["channel_id", "message_id"]),
  "message.get": Method("getMessage", ["channel_id", "message_id"]),
  "message.list": Method("getMessageList", ["channel_id", "next", "direction", "limit", "order"]),
  "reaction.create": Method("createReaction", ["channel_id", "message_id", "emoji"]),
  "reaction.delete": Method("deleteReaction", ["channel_id", "message_id", "emoji", "user_id"]),
  "reaction.clear": Method("clearReaction", ["channel_id", "message_id", "emoji"]),
  "reaction.list": Method("getReactionList", ["channel_id", "message_id", "emoji", "next"]),
  "upload.create": Method("createUpload", [], true),
  "guild.get": Method("getGuild", ["guild_id"]),
  "guild.list": Method("getGuildList", ["next"]),
  "guild.member.get": Method("getGuildMember", ["guild_id", "user_id"]),
  "guild.member.list": Method("getGuildMemberList", ["guild_id", "next"]),
  "guild.member.kick": Method("kickGuildMember", ["guild_id", "user_id", "permanent"]),
  "guild.member.mute": Method("muteGuildMember", ["guild_id", "user_id", "duration", "reason"]),
  "guild.member.role.set": Method("setGuildMemberRole", ["guild_id", "user_id", "role_id"]),
  "guild.member.role.unset": Method("unsetGuildMemberRole", ["guild_id", "user_id", "role_id"]),
  "guild.role.list": Method("getGuildRoleList", ["guild_id", "next"]),
  "guild.role.create": Method("createGuildRole", ["guild_id", "data"]),
  "guild.role.update": Method("updateGuildRole", ["guild_id", "role_id", "data"]),
  "guild.role.delete": Method("deleteGuildRole", ["guild_id", "role_id"]),
  "login.get": Method("getLogin", []),
  "user.get": Method("getUser", ["user_id"]),
  "user.channel.create": Method("createDirectChannel", ["user_id", "guild_id"]),
  "friend.list": Method("getFriendList", ["next"]),
  "friend.delete": Method("deleteFriend", ["user_id"]),
  "friend.approve": Method("handleFriendRequest", ["message_id", "approve", "comment"]),
  "guild.approve": Method("handleGuildRequest", ["message_id", "approve", "comment"]),
  "guild.member.approve": Method("handleGuildMemberRequest", ["message_id", "approve", "comment"])
};
var Channel;
((Channel22) => {
  let Type2;
  ((Type22) => {
    Type22[Type22["TEXT"] = 0] = "TEXT";
    Type22[Type22["DIRECT"] = 1] = "DIRECT";
    Type22[Type22["CATEGORY"] = 2] = "CATEGORY";
    Type22[Type22["VOICE"] = 3] = "VOICE";
  })(Type2 = Channel22.Type || (Channel22.Type = {}));
})(Channel || (Channel = {}));
var Status = ((Status2) => {
  Status2[Status2["OFFLINE"] = 0] = "OFFLINE";
  Status2[Status2["ONLINE"] = 1] = "ONLINE";
  Status2[Status2["CONNECT"] = 2] = "CONNECT";
  Status2[Status2["DISCONNECT"] = 3] = "DISCONNECT";
  Status2[Status2["RECONNECT"] = 4] = "RECONNECT";
  return Status2;
})(Status || {});
var Opcode = ((Opcode2) => {
  Opcode2[Opcode2["EVENT"] = 0] = "EVENT";
  Opcode2[Opcode2["PING"] = 1] = "PING";
  Opcode2[Opcode2["PONG"] = 2] = "PONG";
  Opcode2[Opcode2["IDENTIFY"] = 3] = "IDENTIFY";
  Opcode2[Opcode2["READY"] = 4] = "READY";
  Opcode2[Opcode2["META"] = 5] = "META";
  return Opcode2;
})(Opcode || {});
var WebSocket2;
((WebSocket22) => {
  WebSocket22.CONNECTING = 0;
  WebSocket22.OPEN = 1;
  WebSocket22.CLOSING = 2;
  WebSocket22.CLOSED = 3;
})(WebSocket2 || (WebSocket2 = {}));

// node_modules/@satorijs/core/lib/index.mjs
var __defProp16 = Object.defineProperty;
var __name16 = (target, value) => __defProp16(target, "name", { value, configurable: true });
var _a23, _b3;
var InternalRouter = (_a23 = Service2.tracker, _b3 = class {
  constructor(ctx) {
    __publicField(this, _a23, {
      property: "ctx"
    });
    __publicField(this, "routes", []);
    this.ctx = ctx;
  }
  define(path2, callback) {
    return this.ctx.effect(() => {
      const route = {
        ...(0, import_path_to_regexp.pathToRegexp)(path2),
        callback
      };
      this.routes.push(route);
      return () => remove(this.routes, route);
    });
  }
  handle(bot, method, path2, query, headers, body) {
    for (const route of this.routes) {
      const capture = route.regexp.exec(path2);
      if (!capture) continue;
      const params = {};
      route.keys.forEach(({ name }, index) => {
        params[name] = capture[index + 1];
      });
      return route.callback({
        bot,
        method,
        params,
        query,
        body,
        headers: Object.fromEntries(headers.entries())
      });
    }
  }
}, __name16(_b3, "InternalRouter"), _b3);
var _a24, _b4;
var Session = (_a24 = Service2.tracker, _b4 = class {
  constructor(bot, event) {
    __publicField(this, _a24, {
      associate: "session",
      property: "ctx"
    });
    __publicField(this, "id");
    // for backward compatibility
    __publicField(this, "sn");
    __publicField(this, "bot");
    __publicField(this, "app");
    __publicField(this, "event");
    __publicField(this, "locales", []);
    event.selfId ?? (event.selfId = bot.selfId);
    event.platform ?? (event.platform = bot.platform);
    event.timestamp ?? (event.timestamp = Date.now());
    this.event = event;
    this.sn = this.id = ++bot.ctx.satori._sessionSeq;
    defineProperty(this, "bot", bot);
    defineProperty(this, "app", bot.ctx.root);
    defineProperty(this, Context2.current, bot.ctx);
    return Context2.associate(this, "session");
  }
  /** @deprecated */
  get data() {
    return this.event;
  }
  get isDirect() {
    return this.event.channel.type === Channel.Type.DIRECT;
  }
  set isDirect(value) {
    var _a47;
    ((_a47 = this.event).channel ?? (_a47.channel = {})).type = value ? Channel.Type.DIRECT : Channel.Type.TEXT;
  }
  get author() {
    var _a47, _b7, _c3;
    return {
      ...this.event.user,
      ...this.event.member,
      userId: (_a47 = this.event.user) == null ? void 0 : _a47.id,
      username: (_b7 = this.event.user) == null ? void 0 : _b7.name,
      nickname: (_c3 = this.event.member) == null ? void 0 : _c3.name
    };
  }
  get uid() {
    return `${this.platform}:${this.userId}`;
  }
  get gid() {
    return `${this.platform}:${this.guildId}`;
  }
  get cid() {
    return `${this.platform}:${this.channelId}`;
  }
  get fid() {
    return `${this.platform}:${this.channelId}:${this.userId}`;
  }
  get sid() {
    return `${this.platform}:${this.selfId}`;
  }
  get elements() {
    var _a47;
    return (_a47 = this.event.message) == null ? void 0 : _a47.elements;
  }
  set elements(value) {
    var _a47;
    (_a47 = this.event).message ?? (_a47.message = {});
    this.event.message.elements = value;
  }
  get content() {
    var _a47, _b7;
    return (_b7 = (_a47 = this.event.message) == null ? void 0 : _a47.elements) == null ? void 0 : _b7.join("");
  }
  set content(value) {
    var _a47, _b7, _c3;
    (_a47 = this.event).message ?? (_a47.message = {});
    this.event.message.quote = void 0;
    this.event.message.elements = isNullable(value) ? value : lib_default3.parse(value);
    if (((_c3 = (_b7 = this.event.message.elements) == null ? void 0 : _b7[0]) == null ? void 0 : _c3.type) === "quote") {
      const el = this.event.message.elements.shift();
      this.event.message.quote = {
        ...el.attrs,
        content: el.children.join("")
      };
    }
  }
  setInternal(type, data) {
    this.event._type = type;
    this.event._data = data;
    const internal = Object.create(this.bot.internal);
    defineProperty(this, type, Object.assign(internal, data));
  }
  async transform(elements) {
    return await lib_default3.transformAsync(elements, async ({ type, attrs, children }, session) => {
      const render = type === "component" ? attrs.is : this.app.get("component:" + type);
      if (!render) return true;
      children = await render(attrs, children, session);
      return this.transform(lib_default3.toElementArray(children));
    }, this);
  }
  toJSON() {
    var _a47;
    const event = {
      login: {
        platform: this.platform,
        user: { id: this.selfId }
      },
      ...clone(this.event),
      sn: this.sn,
      ["id"]: this.sn
      // for backward compatibility
    };
    if ((_a47 = event.message) == null ? void 0 : _a47.elements) {
      event.message.content = this.content;
      delete event.message.elements;
      if (event.message.quote) {
        event.message.content = `<quote id="${event.message.quote.id}">${event.message.quote.content}</quote> ` + event.message.content;
      }
    }
    return event;
  }
}, __name16(_b4, "Session"), _b4);
function defineAccessor(prototype, name, keys) {
  Object.defineProperty(prototype, name, {
    get() {
      return keys.reduce((data, key) => data == null ? void 0 : data[key], this);
    },
    set(value) {
      if (value === void 0) return;
      const _keys = keys.slice();
      const last = _keys.pop();
      const data = _keys.reduce((data2, key) => data2[key] ?? (data2[key] = {}), this);
      data[last] = value;
    }
  });
}
__name16(defineAccessor, "defineAccessor");
defineAccessor(Session.prototype, "type", ["event", "type"]);
defineAccessor(Session.prototype, "subtype", ["event", "subtype"]);
defineAccessor(Session.prototype, "subsubtype", ["event", "subsubtype"]);
defineAccessor(Session.prototype, "selfId", ["event", "selfId"]);
defineAccessor(Session.prototype, "platform", ["event", "platform"]);
defineAccessor(Session.prototype, "timestamp", ["event", "timestamp"]);
defineAccessor(Session.prototype, "userId", ["event", "user", "id"]);
defineAccessor(Session.prototype, "channelId", ["event", "channel", "id"]);
defineAccessor(Session.prototype, "channelName", ["event", "channel", "name"]);
defineAccessor(Session.prototype, "guildId", ["event", "guild", "id"]);
defineAccessor(Session.prototype, "guildName", ["event", "guild", "name"]);
defineAccessor(Session.prototype, "messageId", ["event", "message", "id"]);
defineAccessor(Session.prototype, "operatorId", ["event", "operator", "id"]);
defineAccessor(Session.prototype, "roleId", ["event", "role", "id"]);
defineAccessor(Session.prototype, "quote", ["event", "message", "quote"]);
var eventAliases = [
  ["message-created", "message"],
  ["guild-removed", "guild-deleted"],
  ["guild-member-removed", "guild-member-deleted"]
];
var _a25, _b5;
var Bot = (_a25 = Service2.tracker, _b5 = class {
  constructor(ctx, config, platform) {
    __publicField(this, _a25, {
      associate: "bot",
      property: "ctx"
    });
    __publicField(this, "sn");
    __publicField(this, "user", {});
    __publicField(this, "isBot", true);
    __publicField(this, "hidden", false);
    __publicField(this, "platform");
    __publicField(this, "features");
    __publicField(this, "adapter");
    __publicField(this, "error");
    __publicField(this, "callbacks", {});
    __publicField(this, "logger");
    __publicField(this, "_internalRouter");
    // Same as `this.ctx`, but with a more specific type.
    __publicField(this, "context");
    __publicField(this, "_status", Status.OFFLINE);
    this.ctx = ctx;
    this.config = config;
    this.sn = ++ctx.satori._loginSeq;
    this.internal = null;
    this._internalRouter = new InternalRouter(ctx);
    this.context = ctx;
    ctx.bots.push(this);
    this.context.emit("bot-added", this);
    if (platform) {
      this.logger = ctx.logger(platform);
      this.platform = platform;
    }
    this.features = Object.entries(Methods).filter(([, value]) => this[value.name]).map(([key]) => key);
    ctx.on("ready", async () => {
      await Promise.resolve();
      this.dispatchLoginEvent("login-added");
      return this.start();
    });
    ctx.on("dispose", () => this.dispose());
    ctx.on("interaction/button", (session) => {
      const cb = this.callbacks[session.event.button.id];
      if (cb) cb(session);
    });
  }
  getInternalUrl(path2, init, slash) {
    let search = new URLSearchParams(init).toString();
    if (search) search = "?" + search;
    return `internal${slash ? "/" : ":"}${this.platform}/${this.selfId}${path2}${search}`;
  }
  defineInternalRoute(path2, callback) {
    return this._internalRouter.define(path2, callback);
  }
  update(login) {
    const { status, ...rest } = login;
    Object.assign(this, rest);
    this.status = status;
  }
  dispose() {
    const index = this.ctx.bots.findIndex((bot) => bot.sid === this.sid);
    if (index >= 0) {
      this.ctx.bots.splice(index, 1);
      this.context.emit("bot-removed", this);
      this.dispatchLoginEvent("login-removed");
    }
    return this.stop();
  }
  dispatchLoginEvent(type) {
    const session = this.session();
    session.type = type;
    session.event.login = this.toJSON();
    this.dispatch(session);
  }
  get status() {
    return this._status;
  }
  set status(value) {
    var _a47;
    if (value === this._status) return;
    this._status = value;
    if ((_a47 = this.ctx.bots) == null ? void 0 : _a47.some((bot) => bot.sid === this.sid)) {
      this.context.emit("bot-status-updated", this);
      this.dispatchLoginEvent("login-updated");
    }
  }
  get isActive() {
    return this._status !== Status.OFFLINE && this._status !== Status.DISCONNECT;
  }
  online() {
    this.status = Status.ONLINE;
    this.error = null;
  }
  offline(error) {
    this.status = Status.OFFLINE;
    this.error = error;
  }
  async start() {
    var _a47;
    if (this.isActive) return;
    this.status = Status.CONNECT;
    try {
      await this.context.parallel("bot-connect", this);
      await ((_a47 = this.adapter) == null ? void 0 : _a47.connect(this));
    } catch (error) {
      this.offline(error);
    }
  }
  async stop() {
    var _a47;
    if (!this.isActive) return;
    this.status = Status.DISCONNECT;
    try {
      await this.context.parallel("bot-disconnect", this);
      await ((_a47 = this.adapter) == null ? void 0 : _a47.disconnect(this));
    } catch (error) {
      this.context.emit(this.ctx, "internal/error", error);
    } finally {
      this.offline();
    }
  }
  get sid() {
    return `${this.platform}:${this.selfId}`;
  }
  session(event = {}) {
    return new Session(this, event);
  }
  dispatch(session) {
    if (!this.ctx.lifecycle.isActive) return;
    let events = [session.type];
    for (const aliases of eventAliases) {
      if (aliases.includes(session.type)) {
        events = aliases;
        session.type = aliases[0];
        break;
      }
    }
    this.context.emit("internal/session", session);
    if (session.type === "internal") {
      this.context.emit(session.event._type, session.event._data, session.bot);
      return;
    }
    for (const event of events) {
      this.context.emit(session, event, session);
    }
  }
  async createMessage(channelId, content, guildId, options) {
    const { MessageEncoder: MessageEncoder2 } = this.constructor;
    return new MessageEncoder2(this, channelId, guildId, options).send(content);
  }
  async sendMessage(channelId, content, guildId, options) {
    const messages = await this.createMessage(channelId, content, guildId, options);
    return messages.map((message) => message.id);
  }
  async sendPrivateMessage(userId, content, guildId, options) {
    var _a47;
    const { id } = await this.createDirectChannel(userId, guildId ?? ((_a47 = options == null ? void 0 : options.session) == null ? void 0 : _a47.guildId));
    return this.sendMessage(id, content, null, options);
  }
  async createUpload(...uploads) {
    const ids = [];
    for (const upload of uploads) {
      const id = Math.random().toString(36).slice(2);
      const headers = new Headers();
      headers.set("content-type", upload.type);
      if (upload.filename) {
        headers.set("content-disposition", `attachment; filename="${upload.filename}"`);
      }
      this.ctx.satori._tempStore[id] = {
        status: 200,
        body: upload.data,
        headers
      };
      ids.push(id);
    }
    const timer = setTimeout(() => dispose(), 6e5);
    const dispose = __name16(() => {
      _dispose();
      clearTimeout(timer);
      for (const id of ids) {
        delete this.ctx.satori._tempStore[id];
      }
    }, "dispose");
    const _dispose = this.ctx.on("dispose", dispose);
    return ids.map((id) => this.getInternalUrl(`/_tmp/${id}`));
  }
  async supports(name, session = {}) {
    var _a47;
    return !!this[(_a47 = Methods[name]) == null ? void 0 : _a47.name];
  }
  async checkPermission(name, session) {
    if (name.startsWith("bot.")) {
      return this.supports(name.slice(4), session);
    }
  }
  toJSON() {
    return clone({
      ...pick(this, ["sn", "platform", "selfId", "status", "hidden", "features"]),
      // make sure `user.id` is present
      user: this.user.id ? this.user : void 0,
      adapter: this.platform
    });
  }
  async getLogin() {
    return this.toJSON();
  }
  /** @deprecated use `bot.getLogin()` instead */
  async getSelf() {
    const { user } = await this.getLogin();
    return user;
  }
}, __name16(_b5, "Bot"), __publicField(_b5, "reusable", true), __publicField(_b5, "MessageEncoder"), _b5);
var iterableMethods = [
  "getMessage",
  "getReaction",
  "getFriend",
  "getGuild",
  "getGuildMember",
  "getGuildRole",
  "getChannel"
];
for (const name of iterableMethods) {
  Bot.prototype[name + "Iter"] = function(...args) {
    let list;
    if (!this[name + "List"]) throw new Error(`not implemented: ${name}List`);
    const getList = __name16(async () => {
      list = await this[name + "List"](...args, list == null ? void 0 : list.next);
      if (name === "getMessage") list.data.reverse();
    }, "getList");
    return {
      async next() {
        if (list == null ? void 0 : list.data.length) return { done: false, value: list.data.shift() };
        if (list && !(list == null ? void 0 : list.next)) return { done: true, value: void 0 };
        await getList();
        return this.next();
      },
      [Symbol.asyncIterator]() {
        return this;
      }
    };
  };
}
defineAccessor(Bot.prototype, "selfId", ["user", "id"]);
defineAccessor(Bot.prototype, "userId", ["user", "id"]);
var _a26;
var Adapter = (_a26 = class {
  constructor(ctx) {
    __publicField(this, "bots", []);
    this.ctx = ctx;
  }
  async connect(bot) {
  }
  async disconnect(bot) {
  }
  fork(ctx, bot) {
    bot.adapter = this;
    this.bots.push(bot);
    ctx.on("dispose", () => {
      remove(this.bots, bot);
    });
  }
}, __name16(_a26, "Adapter"), __publicField(_a26, "schema", false), _a26);
((Adapter2) => {
  Adapter2.WsClientConfig = lib_default2.object({
    retryTimes: lib_default2.natural().description("初次连接时的最大重试次数。").default(6),
    retryInterval: lib_default2.natural().role("ms").description("初次连接时的重试时间间隔。").default(5 * Time.second),
    retryLazy: lib_default2.natural().role("ms").description("连接关闭后的重试时间间隔。").default(Time.minute)
  }).description("连接设置");
  const _WsClientBase = class _WsClientBase extends Adapter2 {
    constructor(ctx, config) {
      super(ctx);
      __publicField(this, "socket");
      __publicField(this, "connectionId", 0);
      this.config = config;
    }
    async start() {
      let retryCount = 0;
      const connectionId = ++this.connectionId;
      const logger5 = this.ctx.logger("adapter");
      const { retryTimes, retryInterval, retryLazy } = this.config;
      const reconnect = __name16((initial, message) => {
        if (!this.getActive() || connectionId !== this.connectionId) return;
        let timeout = retryInterval;
        if (retryCount >= retryTimes) {
          if (initial) {
            return this.setStatus(Status.OFFLINE, new Error(message));
          } else {
            timeout = retryLazy;
          }
        }
        retryCount++;
        this.setStatus(Status.RECONNECT);
        logger5.warn(`${message}, will retry in ${Time.format(timeout)}...`);
        setTimeout(() => {
          if (!this.getActive() || connectionId !== this.connectionId) return;
          connect();
        }, timeout);
      }, "reconnect");
      const connect = __name16(async (initial = false) => {
        logger5.debug("websocket client opening");
        let socket;
        try {
          socket = await this.prepare();
        } catch (error) {
          reconnect(initial, error.toString() || `failed to prepare websocket`);
          return;
        }
        const url = socket.url.replace(/\?.+/, "");
        socket.addEventListener("error", (event) => {
          if (event.message) logger5.warn(event.message);
        });
        socket.addEventListener("close", ({ code, reason }) => {
          if (this.socket === socket) this.socket = null;
          logger5.debug(`websocket closed with ${code}`);
          reconnect(initial, reason.toString() || `failed to connect to ${url}, code: ${code}`);
        });
        socket.addEventListener("open", () => {
          retryCount = 0;
          this.socket = socket;
          logger5.info("connect to server: %c", url);
          this.accept(socket);
        });
      }, "connect");
      connect(true);
    }
    async stop() {
      var _a47;
      (_a47 = this.socket) == null ? void 0 : _a47.close();
    }
  };
  __name16(_WsClientBase, "WsClientBase");
  let WsClientBase = _WsClientBase;
  Adapter2.WsClientBase = WsClientBase;
  const _WsClient = class _WsClient extends WsClientBase {
    constructor(ctx, bot) {
      super(ctx, bot.config);
      this.bot = bot;
      bot.adapter = this;
    }
    getActive() {
      return this.bot.isActive;
    }
    setStatus(status, error = null) {
      this.bot.status = status;
      this.bot.error = error;
    }
    async connect(bot) {
      this.start();
    }
    async disconnect(bot) {
      this.stop();
    }
  };
  __name16(_WsClient, "WsClient");
  __publicField(_WsClient, "reusable", true);
  let WsClient = _WsClient;
  Adapter2.WsClient = WsClient;
})(Adapter || (Adapter = {}));
var _a27;
var AggregateError = (_a27 = class extends Error {
  constructor(errors, message = "") {
    super(message);
    this.errors = errors;
  }
}, __name16(_a27, "AggregateError"), _a27);
var _a28;
var MessageEncoder = (_a28 = class {
  constructor(bot, channelId, guildId, options = {}) {
    __publicField(this, "errors", []);
    __publicField(this, "results", []);
    __publicField(this, "session");
    this.bot = bot;
    this.channelId = channelId;
    this.guildId = guildId;
    this.options = options;
  }
  async prepare() {
  }
  async render(elements, flush) {
    for (const element of elements) {
      await this.visit(element);
    }
    if (flush) {
      await this.flush();
    }
  }
  async send(content) {
    var _a47, _b7, _c3;
    this.session = this.bot.session({
      type: "send",
      channel: { id: this.channelId, ...(_a47 = this.options.session) == null ? void 0 : _a47.event.channel },
      guild: (_b7 = this.options.session) == null ? void 0 : _b7.event.guild
    });
    for (const key in this.options.session || {}) {
      if (key === "id" || key === "event") continue;
      this.session[key] = this.options.session[key];
    }
    await this.prepare();
    const session = this.options.session ?? this.session;
    this.session.elements = await session.transform(lib_default3.normalize(content));
    const btns = lib_default3.select(this.session.elements, "button").filter((v) => v.attrs.type !== "link" && !v.attrs.id);
    for (const btn of btns) {
      const r = Math.random().toString(36).slice(2);
      (_c3 = btn.attrs).id || (_c3.id = r);
      if (typeof btn.attrs.action === "function") this.bot.callbacks[btn.attrs.id] = btn.attrs.action;
    }
    if (await this.session.app.serial(this.session, "before-send", this.session, this.options)) return [];
    await this.render(this.session.elements);
    await this.flush();
    if (this.errors.length) {
      throw new AggregateError(this.errors);
    } else {
      return this.results;
    }
  }
}, __name16(_a28, "MessageEncoder"), _a28);
lib_default3.warn = new browser_default("element").warn;
HTTP.createConfig = __name16(function createConfig(endpoint) {
  return lib_default2.object({
    endpoint: lib_default2.string().role("link").description("要连接的服务器地址。").default(typeof endpoint === "string" ? endpoint : null).required(typeof endpoint === "boolean" ? endpoint : false),
    headers: lib_default2.dict(String).role("table").description("要附加的额外请求头。"),
    ...this.Config.dict
  }).description("请求设置");
}, "createConfig");
var _a29;
var SatoriContext = (_a29 = class extends Context2 {
  constructor(config) {
    super(config);
    this.provide("satori", void 0, true);
    this.plugin(Satori);
  }
}, __name16(_a29, "SatoriContext"), _a29);
var _a30;
var DisposableSet = (_a30 = class {
  constructor(ctx) {
    __publicField(this, "sn", 0);
    __publicField(this, "map1", /* @__PURE__ */ new Map());
    __publicField(this, "map2", /* @__PURE__ */ new Map());
    this.ctx = ctx;
    defineProperty(this, Service2.tracker, {
      property: "ctx"
    });
  }
  add(...values) {
    const sn = ++this.sn;
    return this.ctx.effect(() => {
      let hasUpdate = false;
      for (const value of values) {
        if (!this.map2.has(value)) {
          this.map2.set(value, /* @__PURE__ */ new Set());
          hasUpdate = true;
        }
        this.map2.get(value).add(sn);
      }
      this.map1.set(sn, values);
      if (hasUpdate) this.ctx.emit("satori/meta");
      return () => {
        let hasUpdate2 = false;
        this.map1.delete(sn);
        for (const value of values) {
          this.map2.get(value).delete(sn);
          if (this.map2.get(value).size === 0) {
            this.map2.delete(value);
            hasUpdate2 = true;
          }
        }
        if (hasUpdate2) this.ctx.emit("satori/meta");
      };
    });
  }
  [Symbol.iterator]() {
    return new Set([].concat(...this.map1.values()))[Symbol.iterator]();
  }
}, __name16(_a30, "DisposableSet"), _a30);
var _a31, _b6, _c2, _d;
var Satori = (_d = class extends (_c2 = Service2, _b6 = Service2.provide, _a31 = Service2.immediate, _c2) {
  constructor(ctx) {
    super(ctx);
    __publicField(this, "uid", Math.random().toString(36).slice(2));
    __publicField(this, "proxyUrls", new DisposableSet(this.ctx));
    __publicField(this, "_internalRouter");
    __publicField(this, "_tempStore", /* @__PURE__ */ Object.create(null));
    __publicField(this, "_loginSeq", 0);
    __publicField(this, "_sessionSeq", 0);
    __publicField(this, "bots", new Proxy([], {
      get(target, prop) {
        if (prop in target || typeof prop === "symbol") {
          return Reflect.get(target, prop);
        }
        return target.find((bot) => bot.sid === prop);
      },
      deleteProperty(target, prop) {
        if (prop in target || typeof prop === "symbol") {
          return Reflect.deleteProperty(target, prop);
        }
        const bot = target.findIndex((bot2) => bot2.sid === prop);
        if (bot < 0) return true;
        target.splice(bot, 1);
        return true;
      }
    }));
    ctx.mixin("satori", ["bots", "component"]);
    defineProperty(this.bots, Service2.tracker, {});
    const self = this;
    ctx.on("http/file", async function(_url, options) {
      var _a47;
      const url = new URL(_url);
      if (url.protocol !== "internal:") return;
      const { status, body, headers } = await self.handleInternalRoute("GET", url);
      if (status >= 400) throw new Error(`Failed to fetch ${_url}, status code: ${status}`);
      if (status >= 300) {
        const location = headers == null ? void 0 : headers.get("location");
        return this.file(location, options);
      }
      const type = headers == null ? void 0 : headers.get("content-type");
      const filename = (_a47 = headers == null ? void 0 : headers.get("content-disposition")) == null ? void 0 : _a47.split("filename=")[1];
      return { data: body, filename, type, mime: type };
    });
    this._internalRouter = new InternalRouter(ctx);
    this.defineInternalRoute("/_tmp/:id", async ({ params, method }) => {
      if (method !== "GET") return { status: 405 };
      return this._tempStore[params.id] ?? { status: 404 };
    });
  }
  component(name, component, options = {}) {
    const render = __name16(async (attrs, children, session) => {
      if (options.session && session.type === "send") {
        throw new Error("interactive components is not available outside sessions");
      }
      const result = await component(attrs, children, session);
      return session.transform(lib_default3.normalize(result));
    }, "render");
    return this.ctx.set("component:" + name, render);
  }
  defineInternalRoute(path2, callback) {
    return this._internalRouter.define(path2, callback);
  }
  async handleInternalRoute(method, url, headers = new Headers(), body) {
    const capture = /^([^/]+)\/([^/]+)(\/.+)$/.exec(url.pathname);
    if (!capture) return { status: 400 };
    const [, platform, selfId, path2] = capture;
    const bot = this.bots[`${platform}:${selfId}`];
    if (!bot) return { status: 404 };
    let response = await bot._internalRouter.handle(bot, method, path2, url.searchParams, headers, body);
    response ?? (response = await this._internalRouter.handle(bot, method, path2, url.searchParams, headers, body));
    if (!response) return { status: 404 };
    return response;
  }
  toJSON(meta = false) {
    return {
      logins: meta ? void 0 : this.bots.map((bot) => bot.toJSON()),
      proxyUrls: [...this.proxyUrls]
    };
  }
}, __name16(_d, "Satori"), __publicField(_d, _b6, "satori"), __publicField(_d, _a31, true), _d);

// node_modules/fastest-levenshtein/esm/mod.js
var peq = new Uint32Array(65536);
var myers_32 = (a, b) => {
  const n = a.length;
  const m = b.length;
  const lst = 1 << n - 1;
  let pv = -1;
  let mv = 0;
  let sc = n;
  let i = n;
  while (i--) {
    peq[a.charCodeAt(i)] |= 1 << i;
  }
  for (i = 0; i < m; i++) {
    let eq = peq[b.charCodeAt(i)];
    const xv = eq | mv;
    eq |= (eq & pv) + pv ^ pv;
    mv |= ~(eq | pv);
    pv &= eq;
    if (mv & lst) {
      sc++;
    }
    if (pv & lst) {
      sc--;
    }
    mv = mv << 1 | 1;
    pv = pv << 1 | ~(xv | mv);
    mv &= xv;
  }
  i = n;
  while (i--) {
    peq[a.charCodeAt(i)] = 0;
  }
  return sc;
};
var myers_x = (b, a) => {
  const n = a.length;
  const m = b.length;
  const mhc = [];
  const phc = [];
  const hsize = Math.ceil(n / 32);
  const vsize = Math.ceil(m / 32);
  for (let i = 0; i < hsize; i++) {
    phc[i] = -1;
    mhc[i] = 0;
  }
  let j = 0;
  for (; j < vsize - 1; j++) {
    let mv2 = 0;
    let pv2 = -1;
    const start2 = j * 32;
    const vlen2 = Math.min(32, m) + start2;
    for (let k = start2; k < vlen2; k++) {
      peq[b.charCodeAt(k)] |= 1 << k;
    }
    for (let i = 0; i < n; i++) {
      const eq = peq[a.charCodeAt(i)];
      const pb = phc[i / 32 | 0] >>> i & 1;
      const mb = mhc[i / 32 | 0] >>> i & 1;
      const xv = eq | mv2;
      const xh = ((eq | mb) & pv2) + pv2 ^ pv2 | eq | mb;
      let ph = mv2 | ~(xh | pv2);
      let mh = pv2 & xh;
      if (ph >>> 31 ^ pb) {
        phc[i / 32 | 0] ^= 1 << i;
      }
      if (mh >>> 31 ^ mb) {
        mhc[i / 32 | 0] ^= 1 << i;
      }
      ph = ph << 1 | pb;
      mh = mh << 1 | mb;
      pv2 = mh | ~(xv | ph);
      mv2 = ph & xv;
    }
    for (let k = start2; k < vlen2; k++) {
      peq[b.charCodeAt(k)] = 0;
    }
  }
  let mv = 0;
  let pv = -1;
  const start = j * 32;
  const vlen = Math.min(32, m - start) + start;
  for (let k = start; k < vlen; k++) {
    peq[b.charCodeAt(k)] |= 1 << k;
  }
  let score = m;
  for (let i = 0; i < n; i++) {
    const eq = peq[a.charCodeAt(i)];
    const pb = phc[i / 32 | 0] >>> i & 1;
    const mb = mhc[i / 32 | 0] >>> i & 1;
    const xv = eq | mv;
    const xh = ((eq | mb) & pv) + pv ^ pv | eq | mb;
    let ph = mv | ~(xh | pv);
    let mh = pv & xh;
    score += ph >>> m - 1 & 1;
    score -= mh >>> m - 1 & 1;
    if (ph >>> 31 ^ pb) {
      phc[i / 32 | 0] ^= 1 << i;
    }
    if (mh >>> 31 ^ mb) {
      mhc[i / 32 | 0] ^= 1 << i;
    }
    ph = ph << 1 | pb;
    mh = mh << 1 | mb;
    pv = mh | ~(xv | ph);
    mv = ph & xv;
  }
  for (let k = start; k < vlen; k++) {
    peq[b.charCodeAt(k)] = 0;
  }
  return score;
};
var distance = (a, b) => {
  if (a.length < b.length) {
    const tmp = b;
    b = a;
    a = tmp;
  }
  if (b.length === 0) {
    return a.length;
  }
  if (a.length <= 32) {
    return myers_32(a, b);
  }
  return myers_x(a, b);
};

// node_modules/@koishijs/i18n-utils/lib/index.mjs
var __defProp17 = Object.defineProperty;
var __name17 = (target, value) => __defProp17(target, "name", { value, configurable: true });
var LocaleTree;
((LocaleTree2) => {
  function from(locales) {
    const tree = {};
    for (const locale of locales.filter(Boolean)) {
      const tokens = locale.split("-");
      let current = tree;
      for (let i = 0; i < tokens.length; i++) {
        const locale2 = tokens.slice(0, i + 1).join("-");
        current = current[locale2] = current[locale2] || {};
      }
    }
    return tree;
  }
  LocaleTree2.from = from;
  __name17(from, "from");
})(LocaleTree || (LocaleTree = {}));
function toLocaleEntry(key, tree) {
  return [key, [[key, []], ...Object.entries(tree).map(([key2, value]) => toLocaleEntry(key2, value))]];
}
__name17(toLocaleEntry, "toLocaleEntry");
function* traverse([key, children], ignored) {
  if (!children.length) {
    return yield key;
  }
  for (const child of children) {
    if (ignored.includes(child))
      continue;
    yield* traverse(child, ignored);
  }
}
__name17(traverse, "traverse");
function fallback(tree, locales) {
  const root = toLocaleEntry("", tree);
  const ignored = [];
  for (const locale of deduplicate(locales).filter(Boolean).reverse()) {
    let prefix = "", children = root[1];
    const tokens = locale ? locale.split("-") : [];
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const current = prefix + token;
      const index = children.findIndex(([key]) => key === current);
      if (index < 0)
        break;
      const entry = children[index];
      if (index > 0) {
        children.splice(index, 1);
        children.unshift(entry);
      }
      children = entry[1];
      prefix = current + "-";
      if (current === locale) {
        ignored.unshift(entry);
      }
    }
  }
  ignored.push(root);
  const results = [];
  for (const entry of ignored) {
    results.push(...traverse(entry, ignored));
  }
  return results;
}
__name17(fallback, "fallback");

// node_modules/@koishijs/core/lib/index.mjs
var __defProp18 = Object.defineProperty;
var __name18 = (target, value) => __defProp18(target, "name", { value, configurable: true });
function property(ctx, key, ...values) {
  return ctx.intersect((session) => {
    return values.length ? values.includes(session[key]) : !!session[key];
  });
}
__name18(property, "property");
var _a32;
var FilterService = (_a32 = class {
  constructor(ctx) {
    this.ctx = ctx;
    defineProperty(this, Context3.current, ctx);
    ctx.filter = () => true;
    ctx.on("internal/runtime", (runtime) => {
      if (!runtime.uid) return;
      runtime.ctx.filter = (session) => {
        return runtime.children.some((p) => p.ctx.filter(session));
      };
    });
  }
  any() {
    return this.ctx.extend({ filter: __name18(() => true, "filter") });
  }
  never() {
    return this.ctx.extend({ filter: __name18(() => false, "filter") });
  }
  union(arg) {
    const filter2 = typeof arg === "function" ? arg : arg.filter;
    return this.ctx.extend({ filter: __name18((s) => this.ctx.filter(s) || filter2(s), "filter") });
  }
  intersect(arg) {
    const filter2 = typeof arg === "function" ? arg : arg.filter;
    return this.ctx.extend({ filter: __name18((s) => this.ctx.filter(s) && filter2(s), "filter") });
  }
  exclude(arg) {
    const filter2 = typeof arg === "function" ? arg : arg.filter;
    return this.ctx.extend({ filter: __name18((s) => this.ctx.filter(s) && !filter2(s), "filter") });
  }
  user(...values) {
    return property(this.ctx, "userId", ...values);
  }
  self(...values) {
    return property(this.ctx, "selfId", ...values);
  }
  guild(...values) {
    return property(this.ctx, "guildId", ...values);
  }
  channel(...values) {
    return property(this.ctx, "channelId", ...values);
  }
  platform(...values) {
    return property(this.ctx, "platform", ...values);
  }
  private() {
    return this.ctx.intersect((session) => session.isDirect);
  }
}, __name18(_a32, "FilterService"), _a32);
var leftQuotes = `"'“‘`;
var rightQuotes = `"'”’`;
var Argv;
((Argv2) => {
  const bracs = {};
  function interpolate2(initiator, terminator, parse2) {
    bracs[initiator] = { terminator, parse: parse2 };
  }
  Argv2.interpolate = interpolate2;
  __name18(interpolate2, "interpolate");
  interpolate2("$(", ")");
  let whitespace;
  ((whitespace2) => {
    whitespace2.unescape = __name18((source) => source.replace(/@__KOISHI_SPACE__@/g, " ").replace(/@__KOISHI_NEWLINE__@/g, "\n").replace(/@__KOISHI_RETURN__@/g, "\r").replace(/@__KOISHI_TAB__@/g, "	"), "unescape");
    whitespace2.escape = __name18((source) => source.replace(/ /g, "@__KOISHI_SPACE__@").replace(/\n/g, "@__KOISHI_NEWLINE__@").replace(/\r/g, "@__KOISHI_RETURN__@").replace(/\t/g, "@__KOISHI_TAB__@"), "escape");
  })(whitespace = Argv2.whitespace || (Argv2.whitespace = {}));
  const _Tokenizer = class _Tokenizer {
    constructor() {
      __publicField(this, "bracs");
      this.bracs = Object.create(bracs);
    }
    interpolate(initiator, terminator, parse2) {
      this.bracs[initiator] = { terminator, parse: parse2 };
    }
    parseToken(source, stopReg = "$") {
      const parent = { inters: [] };
      const index = leftQuotes.indexOf(source[0]);
      const quote = rightQuotes[index];
      let content = "";
      if (quote) {
        source = source.slice(1);
        stopReg = `${quote}(?=${stopReg})|$`;
      }
      stopReg += `|${Object.keys({ ...this.bracs, ...bracs }).map(escapeRegExp).join("|")}`;
      const regExp = new RegExp(stopReg);
      while (true) {
        const capture = regExp.exec(source);
        content += whitespace.unescape(source.slice(0, capture.index));
        if (capture[0] in this.bracs) {
          source = source.slice(capture.index + capture[0].length).trimStart();
          const { parse: parse2, terminator } = this.bracs[capture[0]];
          const argv = (parse2 == null ? void 0 : parse2(source)) || this.parse(source, terminator);
          source = argv.rest;
          parent.inters.push({ ...argv, pos: content.length, initiator: capture[0] });
        } else {
          const quoted = capture[0] === quote;
          const rest = source.slice(capture.index + +quoted);
          parent.rest = rest.trimStart();
          parent.quoted = quoted;
          parent.terminator = capture[0];
          if (quoted) {
            parent.terminator += rest.slice(0, -parent.rest.length);
          } else if (quote) {
            content = leftQuotes[index] + content;
            parent.inters.forEach((inter) => inter.pos += 1);
          }
          parent.content = content;
          if (quote === "'") Argv2.revert(parent);
          return parent;
        }
      }
    }
    parse(source, terminator = "") {
      const tokens = [];
      source = lib_default3.parse(source).map((el) => {
        return el.type === "text" ? el.toString() : whitespace.escape(el.toString());
      }).join("");
      let rest = source, term = "";
      const stopReg = `\\s+|[${escapeRegExp(terminator)}]|$`;
      while (rest && !(terminator && rest.startsWith(terminator))) {
        const token = this.parseToken(rest, stopReg);
        tokens.push(token);
        rest = token.rest;
        term = token.terminator;
        delete token.rest;
      }
      if (rest.startsWith(terminator)) rest = rest.slice(1);
      source = source.slice(0, -(rest + term).length);
      rest = whitespace.unescape(rest);
      source = whitespace.unescape(source);
      return { tokens, rest, source };
    }
    stringify(argv) {
      const output = argv.tokens.reduce((prev, token) => {
        if (token.quoted) prev += leftQuotes[rightQuotes.indexOf(token.terminator[0])] || "";
        return prev + token.content + token.terminator;
      }, "");
      if (argv.rest && !rightQuotes.includes(output[output.length - 1]) || argv.initiator) {
        return output.slice(0, -1);
      }
      return output;
    }
  };
  __name18(_Tokenizer, "Tokenizer");
  let Tokenizer = _Tokenizer;
  Argv2.Tokenizer = Tokenizer;
  const defaultTokenizer = new Tokenizer();
  function parse(source, terminator = "") {
    return defaultTokenizer.parse(source, terminator);
  }
  Argv2.parse = parse;
  __name18(parse, "parse");
  function stringify(argv) {
    return defaultTokenizer.stringify(argv);
  }
  Argv2.stringify = stringify;
  __name18(stringify, "stringify");
  function revert(token) {
    while (token.inters.length) {
      const { pos, source, initiator } = token.inters.pop();
      token.content = token.content.slice(0, pos) + initiator + source + bracs[initiator].terminator + token.content.slice(pos);
    }
  }
  Argv2.revert = revert;
  __name18(revert, "revert");
  const SYNTAX = /(?:-[\w\x80-\uffff-]*|[^,\s\w\x80-\uffff]+)/.source;
  const BRACKET = /((?:\s*\[[^\]]+?\]|\s*<[^>]+?>)*)/.source;
  const OPTION_REGEXP = new RegExp(`^(${SYNTAX}(?:,\\s*${SYNTAX})*(?=\\s|$))?${BRACKET}(.*)$`);
  const _CommandBase = class _CommandBase {
    constructor(name, declaration, ctx, config) {
      __publicField(this, "declaration");
      __publicField(this, "_arguments");
      __publicField(this, "_options", {});
      __publicField(this, "_disposables", []);
      __publicField(this, "_namedOptions", {});
      __publicField(this, "_symbolicOptions", {});
      this.name = name;
      this.ctx = ctx;
      this.config = config;
      if (!name) throw new Error("expect a command name");
      const declList = this._arguments = ctx.$commander.parseDecl(declaration);
      this.declaration = declList.stripped;
      for (const decl of declList) {
        this._disposables.push(this.ctx.i18n.define("", `commands.${this.name}.arguments.${decl.name}`, decl.name));
      }
    }
    _createOption(name, def, config) {
      var _a47;
      const cap = OPTION_REGEXP.exec(def);
      const param = paramCase(name);
      let syntax = cap[1] || "--" + param;
      const bracket = cap[2] || "";
      const desc = cap[3].trim();
      const aliases = config.aliases ?? [];
      const symbols2 = config.symbols ?? [];
      for (let param2 of syntax.trim().split(",")) {
        param2 = param2.trimStart();
        const name2 = param2.replace(/^-+/, "");
        if (!name2 || !param2.startsWith("-")) {
          symbols2.push(lib_default3.escape(param2));
        } else {
          aliases.push(name2);
        }
      }
      if (!("value" in config) && !aliases.includes(param)) {
        syntax += ", --" + param;
      }
      const declList = this.ctx.$commander.parseDecl(bracket.trimStart());
      if (declList.stripped) syntax += " " + declList.stripped;
      const option = (_a47 = this._options)[name] || (_a47[name] = {
        ...declList[0],
        ...config,
        name,
        values: {},
        valuesSyntax: {},
        variants: {},
        syntax
      });
      let path2 = `commands.${this.name}.options.${name}`;
      const fallbackType = typeof option.fallback;
      if ("value" in config) {
        path2 += "." + config.value;
        option.variants[config.value] = { ...config, syntax };
        option.valuesSyntax[config.value] = syntax;
        aliases.forEach((name2) => option.values[name2] = config.value);
      } else if (!bracket.trim()) {
        option.type = "boolean";
      } else if (!option.type && (fallbackType === "string" || fallbackType === "number")) {
        option.type = fallbackType;
      }
      this._disposables.push(this.ctx.i18n.define("", path2, desc));
      this._assignOption(option, aliases, this._namedOptions);
      this._assignOption(option, symbols2, this._symbolicOptions);
      if (!this._namedOptions[param]) {
        this._namedOptions[param] = option;
      }
    }
    _assignOption(option, names, optionMap) {
      for (const name of names) {
        if (name in optionMap) {
          throw new Error(`duplicate option name "${name}" for command "${this.name}"`);
        }
        optionMap[name] = option;
      }
    }
    removeOption(name) {
      if (!this._options[name]) return false;
      const option = this._options[name];
      delete this._options[name];
      for (const key in this._namedOptions) {
        if (this._namedOptions[key] === option) {
          delete this._namedOptions[key];
        }
      }
      for (const key in this._symbolicOptions) {
        if (this._symbolicOptions[key] === option) {
          delete this._symbolicOptions[key];
        }
      }
      return true;
    }
    parse(argv, terminator) {
      var _a47, _b7;
      if (typeof argv === "string") {
        argv = Argv2.parse(argv, terminator);
      }
      const args = [...argv.args || []];
      const options = { ...argv.options };
      if (!argv.source && argv.tokens) {
        argv.source = this.name + " " + Argv2.stringify(argv);
      }
      let lastArgDecl;
      while (!argv.error && ((_a47 = argv.tokens) == null ? void 0 : _a47.length)) {
        const token = argv.tokens[0];
        let { content, quoted } = token;
        const argDecl = this._arguments[args.length] || lastArgDecl || {};
        if (args.length === this._arguments.length - 1 && argDecl.variadic) {
          lastArgDecl = argDecl;
        }
        if (content[0] !== "-" && this.ctx.$commander.resolveDomain(argDecl.type).greedy) {
          args.push(this.ctx.$commander.parseValue(Argv2.stringify(argv), "argument", argv, argDecl));
          break;
        }
        argv.tokens.shift();
        let option;
        let names;
        let param;
        if (!quoted && (option = this._symbolicOptions[content])) {
          names = [paramCase(option.name)];
        } else {
          if (content[0] !== "-" || quoted || +content * 0 === 0 && this.ctx.$commander.resolveDomain(argDecl.type).numeric) {
            args.push(this.ctx.$commander.parseValue(content, "argument", argv, argDecl));
            continue;
          }
          let i = 0;
          for (; i < content.length; ++i) {
            if (content.charCodeAt(i) !== 45) break;
          }
          let j = i + 1;
          for (; j < content.length; j++) {
            if (content.charCodeAt(j) === 61) break;
          }
          const name = content.slice(i, j);
          if (this.config.strictOptions && !this._namedOptions[name]) {
            if (this.ctx.$commander.resolveDomain(argDecl.type).greedy) {
              argv.tokens.unshift(token);
              args.push(this.ctx.$commander.parseValue(Argv2.stringify(argv), "argument", argv, argDecl));
              break;
            }
            args.push(this.ctx.$commander.parseValue(content, "argument", argv, argDecl));
            continue;
          }
          if (i > 1 && name.startsWith("no-") && !this._namedOptions[name]) {
            options[camelCase(name.slice(3))] = false;
            continue;
          }
          names = i > 1 ? [name] : name;
          param = content.slice(++j);
          option = this._namedOptions[names[names.length - 1]];
        }
        quoted = false;
        if (!param) {
          const { type, values } = option || {};
          if (this.ctx.$commander.resolveDomain(type).greedy) {
            param = Argv2.stringify(argv);
            quoted = true;
            argv.tokens = [];
          } else {
            const isValued = names[names.length - 1] in (values || {}) || type === "boolean";
            if (!isValued && argv.tokens.length && (type || ((_b7 = argv.tokens[0]) == null ? void 0 : _b7.content) !== "-")) {
              const token2 = argv.tokens.shift();
              param = token2.content;
              quoted = token2.quoted;
            }
          }
        }
        for (let j = 0; j < names.length; j++) {
          const name = names[j];
          const optDecl = this._namedOptions[name];
          const key = optDecl ? optDecl.name : camelCase(name);
          if (optDecl && name in optDecl.values) {
            options[key] = optDecl.values[name];
          } else {
            const source = j + 1 < names.length ? "" : param;
            options[key] = this.ctx.$commander.parseValue(source, "option", argv, optDecl);
          }
          if (argv.error) break;
        }
      }
      for (const { name, fallback: fallback2 } of Object.values(this._options)) {
        if (fallback2 !== void 0 && !(name in options)) {
          options[name] = fallback2;
        }
      }
      delete argv.tokens;
      return { ...argv, options, args, error: argv.error || "", command: this };
    }
    stringifyArg(value) {
      value = "" + value;
      return value.includes(" ") ? `"${value}"` : value;
    }
    stringify(args, options) {
      let output = this.name;
      for (const key in options) {
        const value = options[key];
        if (value === true) {
          output += ` --${key}`;
        } else if (value === false) {
          output += ` --no-${key}`;
        } else {
          output += ` --${key} ${this.stringifyArg(value)}`;
        }
      }
      for (const arg of args) {
        output += " " + this.stringifyArg(arg);
      }
      return output;
    }
  };
  __name18(_CommandBase, "CommandBase");
  let CommandBase = _CommandBase;
  Argv2.CommandBase = CommandBase;
})(Argv || (Argv = {}));
var User;
((User2) => {
  let Flag;
  ((Flag2) => {
    Flag2[Flag2["ignore"] = 1] = "ignore";
  })(Flag = User2.Flag || (User2.Flag = {}));
})(User || (User = {}));
var Channel2;
((Channel22) => {
  let Flag;
  ((Flag2) => {
    Flag2[Flag2["ignore"] = 1] = "ignore";
    Flag2[Flag2["silent"] = 4] = "silent";
  })(Flag = Channel22.Flag || (Channel22.Flag = {}));
})(Channel2 || (Channel2 = {}));
var _a33;
var KoishiDatabase = (_a33 = class {
  constructor(ctx) {
    this.ctx = ctx;
    ctx.mixin(this, {
      getUser: "database.getUser",
      setUser: "database.setUser",
      createUser: "database.createUser",
      getChannel: "database.getChannel",
      getAssignedChannels: "database.getAssignedChannels",
      setChannel: "database.setChannel",
      createChannel: "database.createChannel",
      broadcast: "database.broadcast"
    });
    ctx.mixin("database", ["broadcast"]);
    ctx.model.extend("user", {
      id: "unsigned(8)",
      name: { type: "string", length: 255 },
      flag: "unsigned(8)",
      authority: "unsigned(4)",
      locales: "list(255)",
      permissions: "list",
      createdAt: "timestamp"
    }, {
      autoInc: true
    });
    ctx.model.extend("binding", {
      aid: "unsigned(8)",
      bid: "unsigned(8)",
      pid: "string(255)",
      platform: "string(255)"
    }, {
      primary: ["pid", "platform"]
    });
    ctx.model.extend("channel", {
      id: "string(255)",
      platform: "string(255)",
      flag: "unsigned(8)",
      assignee: "string(255)",
      guildId: "string(255)",
      locales: "list(255)",
      permissions: "list",
      createdAt: "timestamp"
    }, {
      primary: ["id", "platform"]
    });
    ctx.on("login-added", ({ platform }) => {
      if (platform in ctx.model.tables.user.fields) return;
      ctx.model.migrate("user", { [platform]: "string(255)" }, async (db) => {
        const users = await db.get("user", { [platform]: { $exists: true } }, ["id", platform]);
        await db.upsert("binding", users.filter((u) => u[platform]).map((user) => ({
          aid: user.id,
          bid: user.id,
          pid: user[platform],
          platform
        })));
      });
    });
  }
  async getUser(platform, pid, modifier) {
    const [binding] = await this.get("binding", { platform, pid }, ["aid"]);
    if (!binding) return;
    const [user] = await this.get("user", { id: binding.aid }, modifier);
    return user;
  }
  async setUser(platform, pid, data) {
    const [binding] = await this.get("binding", { platform, pid }, ["aid"]);
    if (!binding) throw new Error("user not found");
    return this.set("user", binding.aid, data);
  }
  async createUser(platform, pid, data) {
    const user = await this.create("user", data);
    await this.create("binding", { aid: user.id, bid: user.id, pid, platform });
    return user;
  }
  async getChannel(platform, id, modifier) {
    const data = await this.get("channel", { platform, id }, modifier);
    if (Array.isArray(id)) return data;
    if (data[0]) Object.assign(data[0], { platform, id });
    return data[0];
  }
  getSelfIds(platforms) {
    var _a47;
    const selfIdMap = /* @__PURE__ */ Object.create(null);
    for (const bot of this.ctx.bots) {
      if (platforms && !platforms.includes(bot.platform)) continue;
      (selfIdMap[_a47 = bot.platform] || (selfIdMap[_a47] = [])).push(bot.selfId);
    }
    return selfIdMap;
  }
  async getAssignedChannels(fields, selfIdMap = this.getSelfIds()) {
    return this.get("channel", {
      $or: Object.entries(selfIdMap).map(([platform, assignee]) => ({ platform, assignee }))
    }, fields);
  }
  setChannel(platform, id, data) {
    return this.set("channel", { platform, id }, data);
  }
  createChannel(platform, id, data) {
    return this.create("channel", { platform, id, ...data });
  }
  async broadcast(...args) {
    var _a47;
    let channels, platforms;
    if (Array.isArray(args[0])) {
      channels = args.shift();
      platforms = channels.map((c) => c.split(":")[0]);
    }
    const [content, forced] = args;
    if (!content) return [];
    const selfIdMap = this.getSelfIds(platforms);
    const data = await this.getAssignedChannels(["id", "assignee", "flag", "platform", "guildId", "locales"], selfIdMap);
    const assignMap = {};
    for (const channel of data) {
      const { platform, id, assignee, flag } = channel;
      if (channels) {
        const index = channels == null ? void 0 : channels.indexOf(`${platform}:${id}`);
        if (index < 0) continue;
        channels.splice(index, 1);
      }
      if (!forced && flag & 4) continue;
      ((_a47 = assignMap[platform] || (assignMap[platform] = {}))[assignee] || (_a47[assignee] = [])).push(channel);
    }
    if (channels == null ? void 0 : channels.length) {
      this.ctx.logger("app").warn("broadcast", "channel not found: ", channels.join(", "));
    }
    return (await Promise.all(this.ctx.bots.map((bot) => {
      var _a48;
      const targets = (_a48 = assignMap[bot.platform]) == null ? void 0 : _a48[bot.selfId];
      if (!targets) return Promise.resolve([]);
      const sessions = targets.map(({ id, guildId, locales }) => {
        const session = bot.session({
          type: "message",
          channel: { id, type: lib_exports2.Channel.Type.TEXT },
          guild: { id: guildId }
        });
        session.locales = locales;
        return session;
      });
      return bot.broadcast(sessions, content);
    }))).flat(1);
  }
}, __name18(_a33, "KoishiDatabase"), _a33);
var database_default = KoishiDatabase;
var _a34;
var SessionError = (_a34 = class extends Error {
  constructor(path2, param) {
    super(makeArray(path2)[0]);
    this.path = path2;
    this.param = param;
  }
}, __name18(_a34, "SessionError"), _a34);
var Next;
((Next2) => {
  Next2.MAX_DEPTH = 64;
  async function compose(callback, next) {
    return typeof callback === "function" ? callback(next) : callback;
  }
  Next2.compose = compose;
  __name18(compose, "compose");
})(Next || (Next = {}));
var _a35;
var Processor = (_a35 = class {
  constructor(ctx) {
    __publicField(this, "_hooks", []);
    __publicField(this, "_sessions", /* @__PURE__ */ Object.create(null));
    __publicField(this, "_userCache", new SharedCache());
    __publicField(this, "_channelCache", new SharedCache());
    __publicField(this, "_matchers", /* @__PURE__ */ new Set());
    this.ctx = ctx;
    defineProperty(this, Context3.current, ctx);
    this.middleware(this.attach.bind(this), true);
    ctx.on("message", this._handleMessage.bind(this));
    ctx.before("attach-user", (session, fields) => {
      session.collect("user", session.argv, fields);
    });
    ctx.before("attach-channel", (session, fields) => {
      session.collect("channel", session.argv, fields);
    });
    ctx.component("execute", async (attrs, children, session) => {
      return session.execute(children.join(""), true);
    }, { session: true });
    ctx.component("prompt", async (attrs, children, session) => {
      await session.send(children);
      return session.prompt();
    }, { session: true });
    ctx.component("i18n", async (attrs, children, session) => {
      return session.i18n(attrs.path, children);
    }, { session: true });
    ctx.component("random", async (attrs, children) => {
      return lib_default.pick(children);
    });
    ctx.component("plural", async (attrs, children) => {
      const path2 = attrs.count in children ? attrs.count : children.length - 1;
      return children[path2];
    });
    const units = ["day", "hour", "minute", "second"];
    ctx.component("i18n:time", (attrs, children, session) => {
      let ms = +attrs.value;
      for (let index = 0; index < 3; index++) {
        const major = Time[units[index]];
        const minor = Time[units[index + 1]];
        if (ms >= major - minor / 2) {
          ms += minor / 2;
          let result = Math.floor(ms / major) + " " + session.text("general." + units[index]);
          if (ms % major > minor) {
            result += ` ${Math.floor(ms % major / minor)} ` + session.text("general." + units[index + 1]);
          }
          return result;
        }
      }
      return Math.round(ms / Time.second) + " " + session.text("general.second");
    }, { session: true });
    ctx.before("attach", (session) => {
      for (const matcher of this._matchers) {
        this._executeMatcher(session, matcher);
        if (session.response) return;
      }
    });
  }
  middleware(middleware, options) {
    if (typeof options !== "object") {
      options = { prepend: options };
    }
    return this.ctx.lifecycle.register("middleware", this._hooks, middleware, options);
  }
  match(pattern, response, options) {
    const matcher = { ...options, context: this.ctx, pattern, response };
    this._matchers.add(matcher);
    return this.ctx.collect("shortcut", () => {
      return this._matchers.delete(matcher);
    });
  }
  _executeMatcher(session, matcher) {
    const { stripped, quote } = session;
    const { appel, context, i18n, regex, fuzzy, pattern, response } = matcher;
    if ((appel || stripped.hasAt) && !stripped.appel) return;
    if (!context.filter(session)) return;
    let content = stripped.content;
    if (quote == null ? void 0 : quote.content) content += " " + quote.content;
    let params = null;
    const match = __name18((pattern2) => {
      if (!pattern2) return;
      if (typeof pattern2 === "string") {
        if (!fuzzy && content !== pattern2 || !content.startsWith(pattern2)) return;
        params = [content, content.slice(pattern2.length)];
        if (fuzzy && !stripped.appel && params[1].match(/^\S/)) {
          params = null;
        }
      } else {
        params = pattern2.exec(content);
      }
    }, "match");
    if (!i18n) {
      match(pattern);
    } else {
      for (const locale of this.ctx.i18n.fallback([])) {
        const store = this.ctx.i18n._data[locale];
        let value = store == null ? void 0 : store[pattern];
        if (!value) continue;
        if (regex) {
          const rest = fuzzy ? `(?:${stripped.appel ? "" : "\\s+"}([\\s\\S]*))?` : "";
          value = new RegExp(`^(?:${value})${rest}$`);
        }
        match(value);
        if (!params) continue;
        session.locales = [locale];
        break;
      }
    }
    if (!params) return;
    session.response = async () => {
      const output = await session.resolve(response, params);
      return lib_default3.normalize(output, params.map((source) => source ? lib_default3.parse(source) : ""));
    };
  }
  async attach(session, next) {
    this.ctx.emit(session, "before-attach", session);
    if (this.ctx.database) {
      if (!session.isDirect) {
        const channelFields = /* @__PURE__ */ new Set(["flag", "assignee", "guildId", "permissions", "locales"]);
        this.ctx.emit("before-attach-channel", session, channelFields);
        const channel = await session.observeChannel(channelFields);
        channel.guildId = session.guildId;
        if (await this.ctx.serial(session, "attach-channel", session)) return;
        if (channel.flag & Channel2.Flag.ignore) return;
        if (channel.assignee !== session.selfId && !session.stripped.atSelf) return;
      }
      const userFields = /* @__PURE__ */ new Set(["id", "flag", "authority", "permissions", "locales"]);
      this.ctx.emit("before-attach-user", session, userFields);
      const user = await session.observeUser(userFields);
      if (await this.ctx.serial(session, "attach-user", session)) return;
      if (user.flag & User.Flag.ignore) return;
    }
    this.ctx.emit(session, "attach", session);
    if (session.response) return session.response();
    return next();
  }
  async _handleMessage(session) {
    var _a47, _b7, _c3;
    if (session.selfId === session.userId) return;
    this._sessions[session.id] = session;
    const queue = this.ctx.lifecycle.filterHooks(this._hooks, session).map(({ callback }) => callback.bind(null, session));
    let index = 0;
    const next = __name18(async (callback) => {
      var _a48;
      try {
        if (!this._sessions[session.id]) {
          throw new Error("isolated next function detected");
        }
        if (callback !== void 0) {
          queue.push((next2) => Next.compose(callback, next2));
          if (queue.length > Next.MAX_DEPTH) {
            throw new Error(`middleware stack exceeded ${Next.MAX_DEPTH}`);
          }
        }
        return await ((_a48 = queue[index++]) == null ? void 0 : _a48.call(queue, next));
      } catch (error) {
        if (error instanceof SessionError) {
          return session.text(error.path, error.param);
        }
        const stack = coerce(error);
        this.ctx.logger("session").warn(`${session.content}
${stack}`);
      }
    }, "next");
    try {
      const result = await next();
      if (result) await session.send(result);
    } finally {
      delete this._sessions[session.id];
      this._userCache.delete(session.id);
      this._channelCache.delete(session.id);
      await ((_a47 = session.user) == null ? void 0 : _a47.$update());
      await ((_b7 = session.channel) == null ? void 0 : _b7.$update());
      await ((_c3 = session.guild) == null ? void 0 : _c3.$update());
      this.ctx.emit(session, "middleware", session);
    }
  }
}, __name18(_a35, "Processor"), _a35);
var _keyMap, _a36;
var SharedCache = (_a36 = class {
  constructor() {
    __privateAdd(this, _keyMap, /* @__PURE__ */ new Map());
  }
  get(ref, key) {
    const entry = __privateGet(this, _keyMap).get(key);
    if (!entry) return;
    entry.refs.add(ref);
    return entry.value;
  }
  set(ref, key, value) {
    let entry = __privateGet(this, _keyMap).get(key);
    if (entry) {
      entry.value = value;
    } else {
      entry = { value, key, refs: /* @__PURE__ */ new Set() };
      __privateGet(this, _keyMap).set(key, entry);
    }
    entry.refs.add(ref);
  }
  delete(ref) {
    for (const key of [...__privateGet(this, _keyMap).keys()]) {
      const { refs } = __privateGet(this, _keyMap).get(key);
      refs.delete(ref);
      if (!refs.size) {
        __privateGet(this, _keyMap).delete(key);
      }
    }
  }
}, _keyMap = new WeakMap(), __name18(_a36, "SharedCache"), _a36);
var logger = new browser_default("command");
var _a37;
var Command = (_a37 = class extends Argv.CommandBase {
  constructor(name, decl, ctx, config) {
    var _a47;
    super(name, decl, ctx, {
      showWarning: true,
      handleError: true,
      slash: true,
      ...config
    });
    __publicField(this, "children", []);
    __publicField(this, "_parent", null);
    __publicField(this, "_aliases", /* @__PURE__ */ Object.create(null));
    __publicField(this, "_examples", []);
    __publicField(this, "_usage");
    __publicField(this, "_userFields", [["locales"]]);
    __publicField(this, "_channelFields", [["locales"]]);
    __publicField(this, "_actions", []);
    __publicField(this, "_checkers", [async (argv) => {
      return this.ctx.serial(argv.session, "command/before-execute", argv);
    }]);
    (_a47 = this.config).permissions ?? (_a47.permissions = [`authority:${(config == null ? void 0 : config.authority) ?? 1}`]);
    this._registerAlias(name);
    ctx.$commander._commandList.push(this);
  }
  get caller() {
    return this[Context3.current] || this.ctx;
  }
  get displayName() {
    return Object.keys(this._aliases)[0];
  }
  set displayName(name) {
    this._registerAlias(name, true);
  }
  get parent() {
    return this._parent;
  }
  set parent(parent) {
    if (this._parent === parent) return;
    if (this._parent) {
      remove(this._parent.children, this);
    }
    this._parent = parent;
    if (parent) {
      parent.children.push(this);
    }
  }
  static normalize(name) {
    return name.toLowerCase().replace(/_/g, "-");
  }
  _registerAlias(name, prepend = false, options = {}) {
    name = _a37.normalize(name);
    if (name.startsWith(".")) name = this.parent.name + name;
    const previous = this.ctx.$commander.get(name);
    if (previous && previous !== this) {
      throw new Error(`duplicate command names: "${name}"`);
    }
    const existing = this._aliases[name];
    if (existing) {
      if (prepend) {
        this._aliases = { [name]: existing, ...this._aliases };
      }
    } else if (prepend) {
      this._aliases = { [name]: options, ...this._aliases };
    } else {
      this._aliases[name] = options;
    }
  }
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return `Command <${this.name}>`;
  }
  userFields(fields) {
    this._userFields.push(fields);
    return this;
  }
  channelFields(fields) {
    this._channelFields.push(fields);
    return this;
  }
  alias(...args) {
    if (typeof args[1] === "object") {
      this._registerAlias(args[0], false, args[1]);
    } else {
      for (const name of args) {
        this._registerAlias(name);
      }
    }
    this.caller.emit("command-updated", this);
    return this;
  }
  _escape(source) {
    if (typeof source !== "string") return source;
    return source.replace(/\$\$/g, "@@__PLACEHOLDER__@@").replace(/\$\d/g, (s) => `{${s[1]}}`).replace(/@@__PLACEHOLDER__@@/g, "$");
  }
  shortcut(pattern, config = {}) {
    let content = this.displayName;
    for (const key in config.options || {}) {
      content += ` --${camelize(key)}`;
      const value = config.options[key];
      if (value !== true) {
        content += " " + this._escape(value);
      }
    }
    for (const arg of config.args || []) {
      content += " " + this._escape(arg);
    }
    if (config.fuzzy) content += " {1}";
    const regex = config.i18n;
    if (typeof pattern === "string") {
      if (config.i18n) {
        pattern = `commands.${this.name}.shortcuts.${pattern}`;
      } else {
        config.i18n = true;
        const key = `commands.${this.name}.shortcuts._${Math.random().toString(36).slice(2)}`;
        this.ctx.i18n.define("", key, pattern);
        pattern = key;
      }
    }
    const dispose = this.ctx.match(pattern, `<execute>${content}</execute>`, {
      appel: config.prefix,
      fuzzy: config.fuzzy,
      i18n: config.i18n,
      regex
    });
    this._disposables.push(dispose);
    return this;
  }
  subcommand(def, ...args) {
    def = this.name + (def.charCodeAt(0) === 46 ? "" : "/") + def;
    const desc = typeof args[0] === "string" ? args.shift() : "";
    const config = args[0] || {};
    return this.ctx.command(def, desc, config);
  }
  usage(text) {
    this._usage = text;
    return this;
  }
  example(example) {
    this._examples.push(example);
    return this;
  }
  option(name, ...args) {
    let desc = "";
    if (typeof args[0] === "string") {
      desc = args.shift();
    }
    const config = { ...args[0] };
    config.permissions ?? (config.permissions = [`authority:${config.authority ?? 0}`]);
    this._createOption(name, desc, config);
    this.caller.emit("command-updated", this);
    this.caller.collect("option", () => this.removeOption(name));
    return this;
  }
  match(session) {
    return this.ctx.filter(session);
  }
  check(callback, append = false) {
    return this.before(callback, append);
  }
  before(callback, append = false) {
    var _a47;
    if (append) {
      this._checkers.push(callback);
    } else {
      this._checkers.unshift(callback);
    }
    (_a47 = this.caller.scope.disposables) == null ? void 0 : _a47.push(() => remove(this._checkers, callback));
    return this;
  }
  action(callback, prepend = false) {
    var _a47;
    if (prepend) {
      this._actions.unshift(callback);
    } else {
      this._actions.push(callback);
    }
    (_a47 = this.caller.scope.disposables) == null ? void 0 : _a47.push(() => remove(this._actions, callback));
    return this;
  }
  /** @deprecated */
  use(callback, ...args) {
    return callback(this, ...args);
  }
  async execute(argv, fallback2 = Next.compose) {
    argv.command ?? (argv.command = this);
    argv.args ?? (argv.args = []);
    argv.options ?? (argv.options = {});
    const { args, options, error } = argv;
    if (error) return error;
    if (logger.level >= 3) logger.debug(argv.source || (argv.source = this.stringify(args, options)));
    for (const validator of this._checkers) {
      const result = await validator.call(this, argv, ...args);
      if (!isNullable(result)) return result;
    }
    if (!this._actions.length) return "";
    let index = 0;
    const queue = this._actions.map((action) => async () => {
      return await action.call(this, argv, ...args);
    });
    queue.push(fallback2);
    const length = queue.length;
    argv.next = async (callback) => {
      var _a47;
      if (callback !== void 0) {
        queue.push((next) => Next.compose(callback, next));
        if (queue.length > Next.MAX_DEPTH) {
          throw new Error(`middleware stack exceeded ${Next.MAX_DEPTH}`);
        }
      }
      return (_a47 = queue[index++]) == null ? void 0 : _a47.call(queue, argv.next);
    };
    try {
      const result = await argv.next();
      if (!isNullable(result)) return result;
    } catch (error2) {
      if (index === length) throw error2;
      if (error2 instanceof SessionError) {
        return argv.session.text(error2.path, error2.param);
      }
      const stack = coerce(error2);
      logger.warn(`${argv.source || (argv.source = this.stringify(args, options))}
${stack}`);
      this.ctx.emit(argv.session, "command-error", argv, error2);
      if (typeof this.config.handleError === "function") {
        const result = await this.config.handleError(error2, argv);
        if (!isNullable(result)) return result;
      } else if (this.config.handleError) {
        return argv.session.text("internal.error-encountered");
      }
    }
    return "";
  }
  dispose() {
    this._disposables.splice(0).forEach((dispose) => dispose());
    this.ctx.emit("command-removed", this);
    for (const cmd of this.children.slice()) {
      cmd.dispose();
    }
    remove(this.ctx.$commander._commandList, this);
    this.parent = null;
  }
  toJSON() {
    return {
      name: this.name,
      description: this.ctx.i18n.get(`commands.${this.name}.description`),
      arguments: this._arguments.map((arg) => ({
        name: arg.name,
        type: toStringType(arg.type),
        description: this.ctx.i18n.get(`commands.${this.name}.arguments.${arg.name}`),
        required: arg.required
      })),
      options: Object.entries(this._options).map(([name, option]) => ({
        name,
        type: toStringType(option.type),
        description: this.ctx.i18n.get(`commands.${this.name}.options.${name}`),
        required: option.required
      })),
      children: this.children.filter((child) => child.name.includes(".")).map((child) => child.toJSON())
    };
  }
}, __name18(_a37, "Command"), _a37);
function toStringType(type) {
  return typeof type === "string" ? type : "string";
}
__name18(toStringType, "toStringType");
((Command2) => {
  Command2.Config = lib_default2.object({
    permissions: lib_default2.array(String).role("perms").default(["authority:1"]).description("权限继承。"),
    dependencies: lib_default2.array(String).role("perms").description("权限依赖。"),
    slash: lib_default2.boolean().description("启用斜线指令功能。").default(true),
    captureQuote: lib_default2.boolean().description("是否捕获引用文本。").default(true).hidden(),
    checkUnknown: lib_default2.boolean().description("是否检查未知选项。").default(false).hidden(),
    checkArgCount: lib_default2.boolean().description("是否检查参数数量。").default(false).hidden(),
    showWarning: lib_default2.boolean().description("是否显示警告。").default(true).hidden(),
    handleError: lib_default2.union([lib_default2.boolean(), lib_default2.function()]).description("是否处理错误。").default(true).hidden()
  });
})(Command || (Command = {}));
function validate(ctx) {
  ctx.permissions.define("command:(name)", {
    depends: __name18(({ name }) => {
      const command = ctx.$commander.get(name);
      if (!command) return;
      const depends = [...command.config.dependencies ?? []];
      if (command.parent) depends.push(`command:${command.parent.name}`);
      return depends;
    }, "depends"),
    inherits: __name18(({ name }) => {
      var _a47;
      return (_a47 = ctx.$commander.get(name)) == null ? void 0 : _a47.config.permissions;
    }, "inherits"),
    list: __name18(() => {
      return ctx.$commander._commandList.map((command) => `command:${command.name}`);
    }, "list")
  });
  ctx.permissions.define("command:(name):option:(name2)", {
    depends: __name18(({ name, name2 }) => {
      var _a47, _b7;
      return (_b7 = (_a47 = ctx.$commander.get(name)) == null ? void 0 : _a47._options[name2]) == null ? void 0 : _b7.dependencies;
    }, "depends"),
    inherits: __name18(({ name, name2 }) => {
      var _a47, _b7;
      return (_b7 = (_a47 = ctx.$commander.get(name)) == null ? void 0 : _a47._options[name2]) == null ? void 0 : _b7.permissions;
    }, "inherits"),
    list: __name18(() => {
      return ctx.$commander._commandList.flatMap((command) => {
        return Object.keys(command._options).map((name) => `command:${command.name}:option:${name}`);
      });
    }, "list")
  });
  ctx.before("command/execute", async (argv) => {
    const { session, options, command } = argv;
    if (!session.user) return;
    function sendHint(message, ...param) {
      return command.config.showWarning ? session.text(message, param) : "";
    }
    __name18(sendHint, "sendHint");
    const permissions = [`command:${command.name}`];
    for (const option of Object.values(command._options)) {
      if (option.name in options) {
        permissions.push(`command:${command.name}:option:${option.name}`);
      }
    }
    if (!await ctx.permissions.test(permissions, session)) {
      return sendHint("internal.low-authority");
    }
  }, true);
  ctx.before("command/execute", async (argv) => {
    var _a47;
    const { args, options, command, session } = argv;
    function sendHint(message, ...param) {
      return command.config.showWarning ? session.text(message, param) : "";
    }
    __name18(sendHint, "sendHint");
    if (command.config.checkArgCount) {
      let index = args.length;
      while ((_a47 = command._arguments[index]) == null ? void 0 : _a47.required) {
        const decl = command._arguments[index];
        await session.send(session.text("internal.prompt-argument", [
          session.text(`commands.${command.name}.arguments.${decl.name}`)
        ]));
        const source = await session.prompt();
        if (isNullable(source)) {
          return sendHint("internal.insufficient-arguments", decl.name);
        }
        args.push(ctx.$commander.parseValue(source, "argument", argv, decl));
        index++;
      }
      const finalArg = command._arguments[command._arguments.length - 1] || {};
      if (args.length > command._arguments.length && !finalArg.variadic) {
        return sendHint("internal.redunant-arguments");
      }
    }
    if (command.config.checkUnknown) {
      const unknown = Object.keys(options).filter((key) => !command._options[key]);
      if (unknown.length) {
        return sendHint("internal.unknown-option", unknown.join(", "));
      }
    }
  }, true);
}
__name18(validate, "validate");
var isArray = Array.isArray;
var BRACKET_REGEXP = /<[^>]+>|\[[^\]]+\]/g;
var _a38;
var Commander = (_a38 = class {
  constructor(ctx, config = {}) {
    __publicField(this, "_commandList", []);
    this.ctx = ctx;
    this.config = config;
    defineProperty(this, Context3.current, ctx);
    ctx.plugin(validate);
    ctx.before("parse", (content, session) => {
      const { isDirect, stripped: { prefix, appel } } = session;
      if (!isDirect && typeof prefix !== "string" && !appel) return;
      return Argv.parse(content);
    });
    ctx.on("interaction/command", (session) => {
      var _a47;
      if ((_a47 = session.event) == null ? void 0 : _a47.argv) {
        const { name, options, arguments: args } = session.event.argv;
        session.execute({ name, args, options });
      } else {
        session.stripped.hasAt = true;
        session.stripped.appel = true;
        session.stripped.atSelf = true;
        session.stripped.prefix = "";
        defineProperty(session, "argv", ctx.bail("before-parse", session.content, session));
        if (!session.argv) {
          ctx.logger("command").warn("failed to parse interaction command:", session.content);
          return;
        }
        session.argv.root = true;
        session.argv.session = session;
        session.execute(session.argv);
      }
    });
    ctx.before("attach", (session) => {
      const { hasAt, appel } = session.stripped;
      if (!appel && hasAt) return;
      let content = session.stripped.content;
      for (const prefix of this._resolvePrefixes(session)) {
        if (!content.startsWith(prefix)) continue;
        session.stripped.prefix = prefix;
        content = content.slice(prefix.length);
        break;
      }
      defineProperty(session, "argv", ctx.bail("before-parse", content, session));
      if (!session.argv) return;
      session.argv.root = true;
      session.argv.session = session;
    });
    ctx.middleware((session, next) => {
      if (!this.resolveCommand(session.argv)) return next();
      return session.execute(session.argv, next);
    });
    ctx.middleware((session, next) => {
      const { argv, quote, isDirect, stripped: { prefix, appel } } = session;
      if ((argv == null ? void 0 : argv.command) || !isDirect && !prefix && !appel) return next();
      const content = session.stripped.content.slice((prefix ?? "").length);
      const actual = content.split(/\s/, 1)[0].toLowerCase();
      if (!actual) return next();
      return next(async (next2) => {
        const cache = /* @__PURE__ */ new Map();
        const name = await session.suggest({
          actual,
          expect: this.available(session),
          suffix: session.text("internal.suggest-command"),
          filter: __name18((name2) => {
            name2 = this.resolve(name2).name;
            return ctx.permissions.test(`command:${name2}`, session, cache);
          }, "filter")
        });
        if (!name) return next2();
        const message = name + content.slice(actual.length) + ((quote == null ? void 0 : quote.content) ? " " + quote.content : "");
        return session.execute(message, next2);
      });
    });
    ctx.schema.extend("command", Command.Config, 1e3);
    ctx.schema.extend("command-option", lib_default2.object({
      permissions: lib_default2.array(String).role("perms").default(["authority:0"]).description("权限继承。"),
      dependencies: lib_default2.array(String).role("perms").description("权限依赖。")
    }), 1e3);
    ctx.on("ready", () => {
      const bots = ctx.bots.filter((v) => v.status === lib_exports2.Status.ONLINE && v.updateCommands);
      bots.forEach((bot) => this.updateCommands(bot));
    });
    ctx.on("bot-status-updated", async (bot) => {
      if (bot.status !== lib_exports2.Status.ONLINE || !bot.updateCommands) return;
      this.updateCommands(bot);
    });
    this.domain("el", (source) => lib_default3.parse(source), { greedy: true });
    this.domain("elements", (source) => lib_default3.parse(source), { greedy: true });
    this.domain("string", (source) => lib_default3.unescape(source));
    this.domain("text", (source) => lib_default3.unescape(source), { greedy: true });
    this.domain("rawtext", (source) => lib_default3("", lib_default3.parse(source)).toString(true), { greedy: true });
    this.domain("boolean", () => true);
    this.domain("number", (source, session) => {
      const value = +source.replace(/[,_]/g, "");
      if (Number.isFinite(value)) return value;
      throw new Error("internal.invalid-number");
    }, { numeric: true });
    this.domain("integer", (source, session) => {
      const value = +source.replace(/[,_]/g, "");
      if (value * 0 === 0 && Math.floor(value) === value) return value;
      throw new Error("internal.invalid-integer");
    }, { numeric: true });
    this.domain("posint", (source, session) => {
      const value = +source.replace(/[,_]/g, "");
      if (value * 0 === 0 && Math.floor(value) === value && value > 0) return value;
      throw new Error("internal.invalid-posint");
    }, { numeric: true });
    this.domain("natural", (source, session) => {
      const value = +source.replace(/[,_]/g, "");
      if (value * 0 === 0 && Math.floor(value) === value && value >= 0) return value;
      throw new Error("internal.invalid-natural");
    }, { numeric: true });
    this.domain("bigint", (source, session) => {
      try {
        return BigInt(source.replace(/[,_]/g, ""));
      } catch {
        throw new Error("internal.invalid-integer");
      }
    }, { numeric: true });
    this.domain("date", (source, session) => {
      const timestamp = Time.parseDate(source);
      if (+timestamp) return timestamp;
      throw new Error("internal.invalid-date");
    });
    this.domain("user", (source, session) => {
      if (source.startsWith("@")) {
        source = source.slice(1);
        if (source.includes(":")) return source;
        return `${session.platform}:${source}`;
      }
      const code = lib_default3.from(source);
      if (code && code.type === "at") {
        return `${session.platform}:${code.attrs.id}`;
      }
      throw new Error("internal.invalid-user");
    });
    this.domain("channel", (source, session) => {
      if (source.startsWith("#")) {
        source = source.slice(1);
        if (source.includes(":")) return source;
        return `${session.platform}:${source}`;
      }
      const code = lib_default3.from(source);
      if (code && code.type === "sharp") {
        return `${session.platform}:${code.attrs.id}`;
      }
      throw new Error("internal.invalid-channel");
    });
    this.defineElementDomain("image", "image", "img");
    this.defineElementDomain("img", "image", "img");
    this.defineElementDomain("audio");
    this.defineElementDomain("video");
    this.defineElementDomain("file");
  }
  defineElementDomain(name, key = name, type = name) {
    this.domain(name, (source, session) => {
      const code = lib_default3.from(source, { type });
      if (code && code.type === type) {
        return code.attrs;
      }
      throw new Error(`internal.invalid-${key}`);
    });
  }
  get(name, session) {
    return this._commandList.find((cmd) => {
      const alias = cmd._aliases[name];
      return alias && ((session == null ? void 0 : session.resolve(alias.filter)) ?? true);
    });
  }
  updateCommands(bot) {
    return bot.updateCommands(this._commandList.filter((cmd) => !cmd.name.includes(".") && cmd.config.slash).map((cmd) => cmd.toJSON()));
  }
  _resolvePrefixes(session) {
    const value = session.resolve(this.config.prefix);
    const result = Array.isArray(value) ? value : [value || ""];
    return result.map((source) => lib_default3.escape(source)).sort().reverse();
  }
  available(session) {
    return this._commandList.filter((cmd) => cmd.match(session)).flatMap((cmd) => Object.keys(cmd._aliases));
  }
  resolve(key) {
    return this._resolve(key).command;
  }
  _resolve(key) {
    if (!key) return {};
    const segments = Command.normalize(key).split(".");
    let i = 1, name = segments[0], command;
    while ((command = this.get(name)) && i < segments.length) {
      name = command.name + "." + segments[i++];
    }
    return { command, name };
  }
  inferCommand(argv) {
    var _a47;
    if (!argv) return;
    if (argv.command) return argv.command;
    if (argv.name) return argv.command = this.resolve(argv.name);
    const { stripped, isDirect, quote } = argv.session;
    const isStrict = this.config.prefixMode === "strict" || !isDirect && !stripped.appel;
    if (argv.root && stripped.prefix === null && isStrict) return;
    const segments = [];
    while (argv.tokens.length) {
      const { content } = argv.tokens[0];
      segments.push(content);
      const { name, command } = this._resolve(segments.join("."));
      if (!command) break;
      argv.tokens.shift();
      argv.command = command;
      argv.args = command._aliases[name].args;
      argv.options = command._aliases[name].options;
      if (command._arguments.length) break;
    }
    if (argv.root && ((_a47 = argv.command) == null ? void 0 : _a47.config.captureQuote) !== false && (quote == null ? void 0 : quote.content)) {
      argv.tokens.push({
        content: quote.content,
        quoted: true,
        inters: [],
        terminator: ""
      });
    }
    return argv.command;
  }
  resolveCommand(argv) {
    var _a47;
    if (!this.inferCommand(argv)) return;
    if ((_a47 = argv.tokens) == null ? void 0 : _a47.every((token) => !token.inters.length)) {
      const { options, args, error } = argv.command.parse(argv);
      argv.options = options;
      argv.args = args;
      argv.error = error;
    }
    return argv.command;
  }
  command(def, ...args) {
    const desc = typeof args[0] === "string" ? args.shift() : "";
    const config = args[0];
    const path2 = Command.normalize(def.split(" ", 1)[0]);
    const decl = def.slice(path2.length);
    const segments = path2.split(/(?=[./])/g);
    let parent;
    let root;
    const created = [];
    segments.forEach((segment2, index) => {
      const code = segment2.charCodeAt(0);
      const name = code === 46 ? parent.name + segment2 : code === 47 ? segment2.slice(1) : segment2;
      let command = this.get(name);
      if (command) {
        if (parent) {
          if (command === parent) {
            throw new Error(`cannot set a command (${command.name}) as its own subcommand`);
          }
          if (command.parent) {
            if (command.parent !== parent) {
              throw new Error(`cannot create subcommand ${path2}: ${command.parent.name}/${command.name} already exists`);
            }
          } else {
            command.parent = parent;
          }
        }
        return parent = command;
      }
      const isLast = index === segments.length - 1;
      command = new Command(name, isLast ? decl : "", this.ctx, isLast ? config : {});
      command._disposables.push(this.ctx.i18n.define("", {
        [`commands.${command.name}.$`]: "",
        [`commands.${command.name}.description`]: isLast ? desc : ""
      }));
      created.push(command);
      root || (root = command);
      if (parent) {
        command.parent = parent;
      }
      parent = command;
    });
    Object.assign(parent.config, config);
    created.forEach((command) => this.ctx.emit("command-added", command));
    parent[Context3.current] = this.ctx;
    if (root) this.ctx.collect(`command <${root.name}>`, () => root.dispose());
    return parent;
  }
  domain(name, transform, options) {
    const service = "domain:" + name;
    if (!transform) return this.ctx.get(service);
    return this.ctx.set(service, { transform, ...options });
  }
  resolveDomain(type) {
    if (typeof type === "function") {
      return { transform: type };
    } else if (type instanceof RegExp) {
      const transform = __name18((source) => {
        if (type.test(source)) return source;
        throw new Error();
      }, "transform");
      return { transform };
    } else if (isArray(type)) {
      const transform = __name18((source) => {
        if (type.includes(source)) return source;
        throw new Error();
      }, "transform");
      return { transform };
    } else if (typeof type === "object") {
      return type ?? {};
    }
    return this.ctx.get(`domain:${type}`) ?? {};
  }
  parseValue(source, kind, argv, decl = {}) {
    const { name, type = "string" } = decl;
    const domain = this.resolveDomain(type);
    try {
      return domain.transform(source, argv.session);
    } catch (err) {
      if (!argv.session) {
        argv.error = `internal.invalid-${kind}`;
      } else {
        const message = argv.session.text(err["message"] || "internal.check-syntax");
        argv.error = argv.session.text(`internal.invalid-${kind}`, [name, message]);
      }
    }
  }
  parseDecl(source) {
    let cap;
    const result = [];
    while (cap = BRACKET_REGEXP.exec(source)) {
      let rawName = cap[0].slice(1, -1);
      let variadic = false;
      if (rawName.startsWith("...")) {
        rawName = rawName.slice(3);
        variadic = true;
      }
      const [name, rawType] = rawName.split(":");
      const type = rawType ? rawType.trim() : void 0;
      result.push({
        name,
        variadic,
        type,
        required: cap[0][0] === "<"
      });
    }
    result.stripped = source.replace(/:[\w-]+(?=[>\]])/g, (str) => {
      const domain = this.ctx.get(`domain:${str.slice(1)}`);
      return (domain == null ? void 0 : domain.greedy) ? "..." : "";
    }).trimEnd();
    return result;
  }
}, __name18(_a38, "Commander"), _a38);
var zh_CN_default = { general: { $: "通用设置", name: "中文", paren: "（{0}）", quote: "“{0}”", comma: "，", and: "和", or: "或", day: "天", hour: "小时", minute: "分钟", second: "秒" }, internal: { $: "核心文本", "error-encountered": "发生未知错误。", "low-authority": "权限不足。", "prompt-argument": "请发送{0}。", "insufficient-arguments": "缺少参数，输入帮助以查看用法。", "redunant-arguments": "存在多余参数，输入帮助以查看用法。", "invalid-argument": "参数 {0} 输入无效，{1}", "unknown-option": "存在未知选项 {0}，输入帮助以查看用法。", "invalid-option": "选项 {0} 输入无效，{1}", "check-syntax": "输入帮助以查看用法。", "invalid-number": "请提供一个数字。", "invalid-integer": "请提供一个整数。", "invalid-posint": "请提供一个正整数。", "invalid-natural": "请提供一个非负整数。", "invalid-date": "请输入合法的时间。", "invalid-user": "请指定正确的用户。", "invalid-channel": "请指定正确的频道。", "invalid-image": "请上传图片。", "invalid-audio": "请上传音频。", "invalid-video": "请上传视频。", "invalid-file": "请上传文件。", "suggest-hint": "您要找的是不是{0}？", "suggest-command": "回复句号以使用推测的指令。" }, commands: { $: "指令系统" } };
var en_US_default = { general: { $: "General Settings", name: "English", paren: " ({0}) ", quote: '"{0}"', comma: "，", and: "and", or: "or", day: "day", hour: "hour", minute: "minute", second: "second" }, internal: { $: "Internal Text", "error-encountered": "An unknown error has occurred.", "low-authority": "Low authority.", "prompt-argument": "请发送{0}。", "insufficient-arguments": "Insufficient arguments, type help to see usage.", "redunant-arguments": "Redunant arguments, type help to see usage.", "invalid-argument": "Invalid argument {0}, {1}", "unknown-option": "Unknown option {0}, type help to see usage.", "invalid-option": "Invalid option {0}, {1}", "check-syntax": "Type help to see usage.", "invalid-number": "Expect a number.", "invalid-integer": "Expect an integer.", "invalid-posint": "Expect a positive integer.", "invalid-natural": "Expect a non-negative integer.", "invalid-date": "Expect a valid date.", "invalid-user": "Expect a valid user.", "invalid-channel": "Expect a valid channel.", "invalid-image": "Expect an image.", "invalid-audio": "Expect an audio.", "invalid-video": "Expect a video.", "invalid-file": "Expect a file.", "suggest-hint": "Do you mean {0}?", "suggest-command": "Send a period to apply the suggestion." }, commands: { $: "Command System" } };
var logger2 = new browser_default("i18n");
var kTemplate = Symbol("template");
function createMatch(pattern) {
  const groups = [];
  const source = pattern.replace(/\(([^)]+)\)/g, (_, name) => {
    groups.push(name);
    return "(.+)";
  });
  const regexp = new RegExp(`^${source}$`);
  return (string) => {
    const capture = regexp.exec(string);
    if (!capture) return;
    const data = {};
    for (let i = 0; i < groups.length; i++) {
      data[groups[i]] = capture[i + 1];
    }
    return data;
  };
}
__name18(createMatch, "createMatch");
var _a39;
var I18n = (_a39 = class {
  constructor(ctx, config) {
    __publicField(this, "_data", {});
    __publicField(this, "_presets", {});
    __publicField(this, "locales");
    this.ctx = ctx;
    this.locales = LocaleTree.from(config.locales);
    this.define("", { "": "" });
    this.define("zh-CN", zh_CN_default);
    this.define("en-US", en_US_default);
  }
  fallback(locales) {
    return fallback(this.locales, locales);
  }
  compare(expect, actual, options = {}) {
    const value = 1 - distance(expect, actual) / expect.length;
    const threshold = options.minSimilarity ?? this.ctx.root.config.minSimilarity;
    return value >= threshold ? value : 0;
  }
  get(key, locales = []) {
    var _a47;
    const result = {};
    for (const locale of this.fallback(locales)) {
      const value = (_a47 = this._data[locale]) == null ? void 0 : _a47[key];
      if (value) result[locale] = value;
    }
    return result;
  }
  *set(locale, prefix, value) {
    if (typeof value === "object" && value && !prefix.includes("@")) {
      for (const key in value) {
        if (key.startsWith("_")) continue;
        yield* this.set(locale, prefix + key + ".", value[key]);
      }
    } else if (prefix.includes("@")) {
      throw new Error("preset is deprecated");
    } else if (typeof value === "string") {
      const dict = this._data[locale];
      const path2 = prefix.slice(0, -1);
      if (!isNullable(dict[path2]) && !locale.startsWith("$") && dict[path2] !== value) {
        logger2.warn("override", locale, path2);
      }
      dict[path2] = value;
      yield path2;
    } else {
      delete this._data[locale][prefix.slice(0, -1)];
    }
  }
  define(locale, ...args) {
    var _a47;
    const dict = (_a47 = this._data)[locale] || (_a47[locale] = {});
    const paths = [...typeof args[0] === "string" ? this.set(locale, args[0] + ".", args[1]) : this.set(locale, "", args[0])];
    this.ctx.emit("internal/i18n");
    return this.ctx.collect("i18n", () => {
      for (const path2 of paths) {
        delete dict[path2];
      }
      this.ctx.emit("internal/i18n");
    });
  }
  find(pattern, actual, options = {}) {
    if (!actual) return [];
    const match = createMatch(pattern);
    const results = [];
    for (const locale in this._data) {
      for (const path2 in this._data[locale]) {
        const data = match(path2);
        if (!data) continue;
        const expect = this._data[locale][path2];
        if (typeof expect !== "string") continue;
        const similarity = this.compare(expect, actual, options);
        if (!similarity) continue;
        results.push({ locale, data, similarity });
      }
    }
    return results;
  }
  _render(value, params, locale) {
    if (value === void 0) return;
    if (typeof value !== "string") {
      const preset = value[kTemplate];
      const render = this._presets[preset];
      if (!render) throw new Error(`Preset "${preset}" not found`);
      return [lib_default3.text(render(value, params, locale))];
    }
    return lib_default3.parse(value, params);
  }
  /** @deprecated */
  text(locales, paths, params) {
    return this.render(locales, paths, params).join("");
  }
  render(locales, paths, params) {
    var _a47;
    locales = this.fallback(locales);
    for (const path2 of paths) {
      for (const locale of locales) {
        for (const key of ["$" + locale, locale]) {
          const value = (_a47 = this._data[key]) == null ? void 0 : _a47[path2];
          if (value === void 0 || !value && !locale && path2 !== "") continue;
          return this._render(value, params, locale);
        }
      }
    }
    logger2.warn("missing", paths[0]);
    return [lib_default3.text(paths[0])];
  }
}, __name18(_a39, "I18n"), _a39);
((I18n2) => {
  I18n2.Config = lib_default2.object({
    locales: lib_default2.array(String).role("table").default(["zh-CN", "en-US", "fr-FR", "ja-JP", "de-DE", "ru-RU"]).description("可用的语言列表。按照回退顺序排列。"),
    output: lib_default2.union([
      lib_default2.const("prefer-user").description("优先使用用户语言"),
      lib_default2.const("prefer-channel").description("优先使用频道语言")
    ]).default("prefer-channel").description("输出语言偏好设置。")
  }).description("国际化设置");
})(I18n || (I18n = {}));
var logger3 = new browser_default("session");
function collectFields(argv, collectors, fields) {
  for (const collector of collectors) {
    if (typeof collector === "function") {
      collector(argv, fields);
      continue;
    }
    for (const field of collector) {
      fields.add(field);
    }
  }
  return fields;
}
__name18(collectFields, "collectFields");
var _a40;
var KoishiSession = (_a40 = class {
  constructor(ctx) {
    ctx.mixin(this, {
      resolve: "session.resolve",
      stripped: "session.stripped",
      username: "session.username",
      send: "session.send",
      cancelQueued: "session.cancelQueued",
      sendQueued: "session.sendQueued",
      getChannel: "session.getChannel",
      observeChannel: "session.observeChannel",
      getUser: "session.getUser",
      observeUser: "session.observeUser",
      withScope: "session.withScope",
      resolveScope: "session.resolveScope",
      text: "session.text",
      i18n: "session.i18n",
      collect: "session.collect",
      execute: "session.execute",
      middleware: "session.middleware",
      prompt: "session.prompt",
      suggest: "session.suggest"
    });
  }
  resolve(source, ...params) {
    if (typeof source === "function") {
      return Reflect.apply(source, null, [this, ...params]);
    }
    if (!isEvalExpr(source)) return source;
    return executeEval({ _: this }, source);
  }
  _stripNickname(content) {
    if (content.startsWith("@")) content = content.slice(1);
    for (const nickname of this.resolve(this.app.koishi.config.nickname) ?? []) {
      if (!content.startsWith(nickname)) continue;
      const rest = content.slice(nickname.length);
      const capture = /^([,，]\s*|\s+)/.exec(rest);
      if (!capture) continue;
      return rest.slice(capture[0].length);
    }
  }
  /** @deprecated */
  get parsed() {
    return this.stripped;
  }
  get stripped() {
    var _a47, _b7, _c3, _d2;
    if (this._stripped) return this._stripped;
    if (!this.elements) return {};
    let atSelf = false, appel = false;
    let hasAt = false;
    const elements = this.elements.slice();
    while (((_a47 = elements[0]) == null ? void 0 : _a47.type) === "at") {
      const { attrs } = elements.shift();
      if (attrs.id === this.selfId) {
        atSelf = appel = true;
      }
      if (!((_c3 = (_b7 = this.quote) == null ? void 0 : _b7.user) == null ? void 0 : _c3.id) || this.quote.user.id !== attrs.id) {
        hasAt = true;
      }
      if (((_d2 = elements[0]) == null ? void 0 : _d2.type) === "text" && !elements[0].attrs.content.trim()) {
        elements.shift();
      }
    }
    let content = elements.join("").trim();
    if (!hasAt) {
      const result = this._stripNickname(content);
      if (result) {
        appel = true;
        content = result;
      }
    }
    return this._stripped = { hasAt, content, appel, atSelf, prefix: null };
  }
  get username() {
    return this.user && this.user["name"] ? this.user["name"] : this.author.nick || this.author.name || this.userId;
  }
  async send(fragment, options = {}) {
    if (!fragment) return;
    options.session = this;
    return this.bot.sendMessage(this.channelId, fragment, this.guildId, options).catch((error) => {
      logger3.warn(error);
      return [];
    });
  }
  cancelQueued(delay = this.app.koishi.config.delay.cancel) {
    clearTimeout(this._queuedTimeout);
    this._queuedTasks = [];
    this._queuedTimeout = setTimeout(() => this._next(), delay);
  }
  _next() {
    var _a47;
    const task = (_a47 = this._queuedTasks) == null ? void 0 : _a47.shift();
    if (!task) {
      this._queuedTimeout = null;
      return;
    }
    this.send(task.content).then(task.resolve, task.reject);
    this._queuedTimeout = setTimeout(() => this._next(), task.delay);
  }
  async sendQueued(content, delay) {
    const text = lib_default3.normalize(content).join("");
    if (!text) return;
    if (isNullable(delay)) {
      const { message, character } = this.app.koishi.config.delay;
      delay = Math.max(message, character * text.length);
    }
    return new Promise((resolve, reject) => {
      (this._queuedTasks ?? (this._queuedTasks = [])).push({ content, delay, resolve, reject });
      if (!this._queuedTimeout) this._next();
    });
  }
  async getChannel(id = this.channelId, fields = []) {
    const { app, platform, guildId } = this;
    if (!fields.length) return { platform, id, guildId };
    const channel = await app.database.getChannel(platform, id, fields);
    if (channel) return channel;
    const assignee = this.resolve(app.koishi.config.autoAssign) ? this.selfId : "";
    if (assignee) {
      return app.database.createChannel(platform, id, { assignee, guildId, createdAt: /* @__PURE__ */ new Date() });
    } else {
      const channel2 = app.model.tables.channel.create();
      Object.assign(channel2, { platform, id, guildId, $detached: true });
      return channel2;
    }
  }
  async _observeChannelLike(channelId, fields = []) {
    const fieldSet = new Set(fields);
    const { platform } = this;
    const key = `${platform}:${channelId}`;
    let cache = this.app.$processor._channelCache.get(this.id, key);
    if (cache) {
      for (const key2 in cache) {
        fieldSet.delete(key2);
      }
      if (!fieldSet.size) return cache;
    }
    const data = await this.getChannel(channelId, [...fieldSet]);
    cache = this.app.$processor._channelCache.get(this.id, key);
    if (cache) {
      cache.$merge(data);
    } else {
      cache = observe(data, async (diff) => {
        if (data["$detached"]) return;
        await this.app.database.setChannel(platform, channelId, diff);
      }, `channel ${key}`);
      this.app.$processor._channelCache.set(this.id, key, cache);
    }
    return cache;
  }
  async observeChannel(fields) {
    const tasks = [this._observeChannelLike(this.channelId, fields)];
    if (this.channelId !== this.guildId) {
      tasks.push(this._observeChannelLike(this.guildId, fields));
    }
    const [channel, guild = channel] = await Promise.all(tasks);
    this.guild = guild;
    this.channel = channel;
    return channel;
  }
  async getUser(userId = this.userId, fields = []) {
    const { app, platform } = this;
    if (!fields.length) return {};
    const user = await app.database.getUser(platform, userId, fields);
    if (user) return user;
    const authority = this.resolve(app.koishi.config.autoAuthorize);
    const data = { locales: this.locales, authority, createdAt: /* @__PURE__ */ new Date() };
    if (authority) {
      return app.database.createUser(platform, userId, data);
    } else {
      const user2 = app.model.tables.user.create();
      Object.assign(user2, { ...data, $detached: true });
      return user2;
    }
  }
  async observeUser(fields) {
    var _a47;
    const fieldSet = new Set(fields);
    const { userId } = this;
    let cache = this.user || this.app.$processor._userCache.get(this.id, this.uid);
    if (cache) {
      for (const key in cache) {
        fieldSet.delete(key);
      }
      if (!fieldSet.size) return this.user = cache;
    }
    if ((_a47 = this.author) == null ? void 0 : _a47["anonymous"]) {
      const fallback2 = this.app.model.tables.user.create();
      fallback2.authority = this.resolve(this.app.koishi.config.autoAuthorize);
      const user = observe(fallback2, () => Promise.resolve());
      return this.user = user;
    }
    const data = await this.getUser(userId, [...fieldSet]);
    cache = this.user || this.app.$processor._userCache.get(this.id, this.uid);
    if (cache) {
      cache.$merge(data);
    } else {
      cache = observe(data, async (diff) => {
        if (data["$detached"]) return;
        await this.app.database.setUser(this.platform, userId, diff);
      }, `user ${this.uid}`);
      this.app.$processor._userCache.set(this.id, this.uid, cache);
    }
    return this.user = cache;
  }
  async withScope(scope, callback) {
    const oldScope = this.scope;
    try {
      this.scope = scope;
      const result = await callback();
      return lib_default3.transform(result, {
        i18n: __name18((params, children) => lib_default3.i18n({
          ...params,
          path: this.resolveScope(params.path)
        }, children), "i18n")
      }, this);
    } finally {
      this.scope = oldScope;
    }
  }
  resolveScope(path2) {
    if (!path2.startsWith(".")) return path2;
    if (!this.scope) {
      this.app.logger("i18n").warn(new Error(`missing scope for "${path2}"`));
      return "";
    }
    return this.scope + path2;
  }
  text(path2, params = {}) {
    return this.i18n(path2, params).join("");
  }
  i18n(path2, params = {}) {
    var _a47, _b7, _c3, _d2;
    const locales = [
      ...((_a47 = this.channel) == null ? void 0 : _a47.locales) || [],
      ...((_b7 = this.guild) == null ? void 0 : _b7.locales) || []
    ];
    if (this.app.koishi.config.i18n.output === "prefer-user") {
      locales.unshift(...((_c3 = this.user) == null ? void 0 : _c3.locales) || []);
    } else {
      locales.push(...((_d2 = this.user) == null ? void 0 : _d2.locales) || []);
    }
    locales.unshift(...this.locales || []);
    const paths = makeArray(path2).map((path3) => this.resolveScope(path3));
    return this.app.i18n.render(locales, paths, params);
  }
  collect(key, argv, fields = /* @__PURE__ */ new Set()) {
    const collect = __name18((argv2) => {
      argv2.session = this;
      if (argv2.tokens) {
        for (const { inters } of argv2.tokens) {
          inters.forEach(collect);
        }
      }
      if (!this.app.$commander.resolveCommand(argv2)) return;
      this.app.emit(argv2.session, `command/before-attach-${key}`, argv2, fields);
      collectFields(argv2, argv2.command[`_${key}Fields`], fields);
    }, "collect");
    if (argv) collect(argv);
    return fields;
  }
  async execute(argv, next) {
    if (typeof argv === "string") argv = Argv.parse(argv);
    argv.session = this;
    if (argv.tokens) {
      for (const arg of argv.tokens) {
        const { inters } = arg;
        const output = [];
        for (let i = 0; i < inters.length; ++i) {
          const execution = await this.execute(inters[i], true);
          const transformed = await this.transform(execution);
          output.push(transformed.join(""));
        }
        for (let i = inters.length - 1; i >= 0; --i) {
          const { pos } = inters[i];
          arg.content = arg.content.slice(0, pos) + output[i] + arg.content.slice(pos);
        }
        arg.inters = [];
      }
      if (!this.app.$commander.resolveCommand(argv)) return [];
    } else {
      argv.command || (argv.command = this.app.$commander.get(argv.name));
      if (!argv.command) {
        logger3.warn(new Error(`cannot find command ${argv.name}`));
        return [];
      }
    }
    const { command } = argv;
    if (!command.ctx.filter(this)) return [];
    if (this.app.database) {
      if (!this.isDirect) {
        await this.observeChannel(this.collect("channel", argv, /* @__PURE__ */ new Set(["permissions", "locales"])));
      }
      await this.observeUser(this.collect("user", argv, /* @__PURE__ */ new Set(["authority", "permissions", "locales"])));
    }
    let shouldEmit = true;
    if (next === true) {
      shouldEmit = false;
      next = void 0;
    }
    return this.withScope(`commands.${command.name}.messages`, async () => {
      const result = await command.execute(argv, next);
      if (!shouldEmit) return lib_default3.normalize(result);
      await this.send(result);
      return [];
    });
  }
  middleware(middleware) {
    const id = this.fid;
    return this.app.middleware(async (session, next) => {
      if (id && session.fid !== id) return next();
      return middleware(session, next);
    }, true);
  }
  prompt(...args) {
    const callback = typeof args[0] === "function" ? args.shift() : (session) => {
      var _a47;
      const elements = session.elements.slice();
      if (((_a47 = elements[0]) == null ? void 0 : _a47.type) === "at" && elements[0].attrs.id === session.selfId) {
        elements.shift();
      }
      return elements.join("").trim();
    };
    const options = typeof args[0] === "number" ? { timeout: args[0] } : args[0] ?? {};
    return new Promise((resolve) => {
      const dispose = this.middleware(async (session, next) => {
        clearTimeout(timer);
        dispose();
        const value = await callback(session);
        resolve(value);
        if (isNullable(value)) return next();
      });
      const timer = setTimeout(() => {
        dispose();
        resolve(void 0);
      }, options.timeout ?? this.app.koishi.config.delay.prompt);
    });
  }
  async suggest(options) {
    let { expect, filter: filter2, prefix = "" } = options;
    if (options.actual) {
      expect = expect.filter((name) => {
        return name && this.app.i18n.compare(name, options.actual, options);
      });
      if (filter2) {
        expect = (await Promise.all(expect.map(async (name) => [name, await filter2(name)]))).filter(([, result]) => result).map(([name]) => name);
      }
    }
    if (!expect.length) {
      await this.send(prefix);
      return;
    }
    prefix += this.text("internal.suggest-hint", [expect.map((text) => {
      return this.text("general.quote", [text]);
    }).join(this.text("general.or"))]);
    if (expect.length > 1) {
      await this.send(prefix);
      return;
    }
    await this.send(prefix + options.suffix);
    return this.prompt((session) => {
      const { content, atSelf, hasAt } = session.stripped;
      if (!atSelf && hasAt) return;
      if (content === "." || content === "。") {
        return expect[0];
      }
    }, options);
  }
}, __name18(_a40, "KoishiSession"), _a40);
var session_default = KoishiSession;
var logger4 = new browser_default("app");
var _a41;
var Permissions = (_a41 = class {
  constructor(ctx) {
    __publicField(this, "store", []);
    this.ctx = ctx;
    defineProperty(this, Context3.current, ctx);
    ctx.alias("permissions", ["perms"]);
    this.define("authority:(value)", {
      check: __name18(({ value }, { user }) => {
        return !user || user.authority >= +value;
      }, "check"),
      list: __name18(() => Array(5).fill(0).map((_, i) => `authority:${i}`), "list")
    });
    this.provide("(name)", ({ name }, session) => {
      var _a47;
      return (_a47 = session.bot) == null ? void 0 : _a47.checkPermission(name, session);
    });
    this.provide("(name)", ({ name }, session) => {
      var _a47, _b7, _c3, _d2, _e;
      return ((_a47 = session.permissions) == null ? void 0 : _a47.includes(name)) || ((_c3 = (_b7 = session.user) == null ? void 0 : _b7.permissions) == null ? void 0 : _c3.includes(name)) || ((_e = (_d2 = session.channel) == null ? void 0 : _d2.permissions) == null ? void 0 : _e.includes(name));
    });
  }
  define(pattern, options) {
    const entry = {
      ...options,
      match: createMatch(pattern)
    };
    if (!pattern.includes("(")) entry.list || (entry.list = () => [pattern]);
    return this.ctx.effect(() => {
      this.store.push(entry);
      return () => remove(this.store, entry);
    });
  }
  provide(pattern, check) {
    return this.define(pattern, { check });
  }
  inherit(pattern, inherits) {
    return this.define(pattern, { inherits });
  }
  depend(pattern, depends) {
    return this.define(pattern, { depends });
  }
  list(result = /* @__PURE__ */ new Set()) {
    for (const { list } of this.store) {
      if (!list) continue;
      for (const name of list()) {
        result.add(name);
      }
    }
    return [...result];
  }
  async check(name, session) {
    const results = await Promise.all(this.store.map(async ({ match, check }) => {
      if (!check) return false;
      const data = match(name);
      if (!data) return false;
      try {
        return await check(data, session);
      } catch (error) {
        logger4.warn(error);
        return false;
      }
    }));
    return results.some(Boolean);
  }
  subgraph(type, parents, result = /* @__PURE__ */ new Set()) {
    let name;
    const queue = [...parents];
    while (name = queue.shift()) {
      if (result.has(name)) continue;
      result.add(name);
      for (const entry of this.store) {
        const data = entry.match(name);
        if (!data) continue;
        let links = entry[type];
        if (typeof links === "function") links = links(data);
        if (Array.isArray(links)) queue.push(...links);
      }
    }
    return result;
  }
  async test(names, session = {}, cache = /* @__PURE__ */ new Map()) {
    session = session[Context3.shadow] || session;
    if (typeof names === "string") names = [names];
    for (const name of this.subgraph("depends", names)) {
      const parents = [...this.subgraph("inherits", [name])];
      const results = await Promise.all(parents.map((parent) => {
        let result = cache.get(parent);
        if (!result) {
          result = this.check(parent, session);
          cache.set(parent, result);
        }
        return result;
      }));
      if (results.some((result) => result)) continue;
      return false;
    }
    return true;
  }
}, __name18(_a41, "Permissions"), _a41);
defineProperty(Bot, "filter", false);
defineProperty(Adapter, "filter", false);
var _a42;
var KoishiBot = (_a42 = class {
  constructor(ctx) {
    ctx.mixin(this, {
      getGuildMemberMap: "bot.getGuildMemberMap",
      broadcast: "bot.broadcast"
    });
  }
  async getGuildMemberMap(guildId) {
    const result = {};
    for await (const member of this.getGuildMemberIter(guildId)) {
      result[member.user.id] = member.name || member.user.name;
    }
    return result;
  }
  async broadcast(channels, content, delay = this.ctx.root.config.delay.broadcast) {
    const ids = [];
    for (let index = 0; index < channels.length; index++) {
      if (index && delay) await sleep(delay);
      try {
        const value = channels[index];
        ids.push(...typeof value === "string" ? await this.sendMessage(value, content) : Array.isArray(value) ? await this.sendMessage(value[0], content, value[1]) : await this.sendMessage(value.channelId, content, value.guildId, { session: value }));
      } catch (error) {
        this.ctx.logger("bot").warn(error);
      }
    }
    return ids;
  }
}, __name18(_a42, "KoishiBot"), _a42);
var bot_default = KoishiBot;
lib_default2.dynamic = __name18(function dynamic(name) {
  return lib_default2.any().role("dynamic", { name });
}, "dynamic");
lib_default2.filter = __name18(function filter() {
  return lib_default2.any().role("filter");
}, "filter");
lib_default2.computed = __name18(function computed(inner, options = {}) {
  return lib_default2.union([
    lib_default2.from(inner),
    lib_default2.object({
      $switch: lib_default2.object({
        branches: lib_default2.array(lib_default2.object({
          case: lib_default2.any(),
          then: lib_default2.from(inner)
        })),
        default: lib_default2.from(inner)
      })
    }).hidden(),
    lib_default2.any().hidden()
  ]).role("computed", options);
}, "computed");
lib_default2.path = __name18(function path(options = {}) {
  return lib_default2.string().role("path", options);
}, "path");
lib_default2.prototype.computed = __name18(function computed2(options = {}) {
  return lib_default2.computed(this, options).default(this.meta.default);
}, "computed");
var kSchemaOrder2 = Symbol("schema-order");
var _a43;
var SchemaService2 = (_a43 = class {
  constructor(ctx) {
    __publicField(this, "_data", /* @__PURE__ */ Object.create(null));
    this.ctx = ctx;
    this.extend("intercept.http", lib_default2.object({
      timeout: lib_default2.natural().role("ms").description("等待连接建立的最长时间。"),
      proxyAgent: lib_default2.string().description("使用的代理服务器地址。"),
      keepAlive: lib_default2.boolean().description("是否保持连接。")
    }));
  }
  extend(name, schema, order = 0) {
    const caller = this[Context3.current];
    const target = this.get(name);
    const index = target.list.findIndex((a) => a[kSchemaOrder2] < order);
    schema[kSchemaOrder2] = order;
    if (index >= 0) {
      target.list.splice(index, 0, schema);
    } else {
      target.list.push(schema);
    }
    this.ctx.emit("internal/schema", name);
    caller == null ? void 0 : caller.on("dispose", () => {
      remove(target.list, schema);
      this.ctx.emit("internal/schema", name);
    });
  }
  get(name) {
    var _a47;
    return (_a47 = this._data)[name] || (_a47[name] = lib_default2.intersect([]));
  }
  set(name, schema) {
    const caller = this[Context3.current];
    this._data[name] = schema;
    this.ctx.emit("internal/schema", name);
    caller == null ? void 0 : caller.on("dispose", () => {
      delete this._data[name];
      this.ctx.emit("internal/schema", name);
    });
  }
}, __name18(_a43, "SchemaService"), _a43);
var _a44;
var Context3 = (_a44 = class extends SatoriContext {
  constructor(config = {}) {
    super(config);
    this.mixin("$processor", ["match", "middleware"]);
    this.mixin("$filter", [
      "any",
      "never",
      "union",
      "intersect",
      "exclude",
      "user",
      "self",
      "guild",
      "channel",
      "platform",
      "private"
    ]);
    this.mixin("$commander", ["command"]);
    this.provide("$filter", new FilterService(this), true);
    this.provide("schema", new SchemaService2(this), true);
    this.provide("$processor", new Processor(this), true);
    this.provide("i18n", new I18n(this, this.config.i18n), true);
    this.provide("permissions", new Permissions(this), true);
    this.provide("model", void 0, true);
    this.provide("http", void 0, true);
    this.provide("$commander", new Commander(this, this.config), true);
    this.plugin(Database);
    this.plugin(Koishi, this.config);
  }
  /** @deprecated use `ctx.root` instead */
  get app() {
    return this.root;
  }
  /** @deprecated use `koishi.config` instead */
  get options() {
    return this.root.config;
  }
  async waterfall(...args) {
    const thisArg = typeof args[0] === "object" || typeof args[0] === "function" ? args.shift() : null;
    const name = args.shift();
    for (const hook of this.lifecycle.filterHooks(this.lifecycle._hooks[name] || [], thisArg)) {
      const result = await hook.callback.apply(thisArg, args);
      args[0] = result;
    }
    return args[0];
  }
  chain(...args) {
    const thisArg = typeof args[0] === "object" || typeof args[0] === "function" ? args.shift() : null;
    const name = args.shift();
    for (const hook of this.lifecycle.filterHooks(this.lifecycle._hooks[name] || [], thisArg)) {
      const result = hook.callback.apply(thisArg, args);
      args[0] = result;
    }
    return args[0];
  }
  /* eslint-enable max-len */
  before(name, listener, append = false) {
    const seg = name.split("/");
    seg[seg.length - 1] = "before-" + seg[seg.length - 1];
    return this.on(seg.join("/"), listener, !append);
  }
}, __name18(_a44, "Context"), __publicField(_a44, "shadow", Symbol.for("session.shadow")), _a44);
var _a45;
var Koishi = (_a45 = class extends Service2 {
  constructor(ctx, config) {
    super(ctx, "koishi", true);
    __publicField(this, "bot", new bot_default(this.ctx));
    __publicField(this, "database", new database_default(this.ctx));
    __publicField(this, "session", new session_default(this.ctx));
    this.config = config;
  }
}, __name18(_a45, "Koishi"), _a45);
Session.prototype[Context3.filter] = function(ctx) {
  return ctx.filter(this);
};
((Context32) => {
  Context32.Config = lib_default2.intersect([
    lib_default2.object({})
  ]);
})(Context3 || (Context3 = {}));
defineProperty(Context3.Config, "Basic", lib_default2.object({
  prefix: lib_default2.array(lib_default2.string().default("")).default([""]).role("table").computed().description("指令前缀字符构成的数组。将被用于指令的匹配。"),
  prefixMode: lib_default2.union([
    lib_default2.const("auto").description("默认：当存在称呼时允许无前缀触发。"),
    lib_default2.const("strict").description("严格：只有在指令前缀匹配时才允许触发。")
  ]).experimental().role("radio").default("auto").description("指令前缀匹配模式。"),
  nickname: lib_default2.array(String).role("table").computed().description("机器人昵称构成的数组。将被用于指令的匹配。"),
  autoAssign: lib_default2.boolean().default(true).computed().description("当获取不到频道数据时，是否使用接受者作为受理人。"),
  autoAuthorize: lib_default2.natural().default(1).computed().description("当获取不到用户数据时默认使用的权限等级。"),
  minSimilarity: lib_default2.percent().default(1).description("用于模糊匹配的相似系数，应该是一个 0 到 1 之间的数值。数值越高，模糊匹配越严格。设置为 1 可以完全禁用模糊匹配。")
}).description("基础设置"));
defineProperty(Context3.Config, "I18n", I18n.Config);
defineProperty(Context3.Config, "Delay", lib_default2.object({
  character: lib_default2.natural().role("ms").default(0).description("调用 `session.sendQueued()` 时消息间发送的最小延迟，按前一条消息的字数计算。"),
  message: lib_default2.natural().role("ms").default(0.1 * Time.second).description("调用 `session.sendQueued()` 时消息间发送的最小延迟，按固定值计算。"),
  cancel: lib_default2.natural().role("ms").default(0).description("调用 `session.cancelQueued()` 时默认的延迟。"),
  broadcast: lib_default2.natural().role("ms").default(0.5 * Time.second).description("调用 `bot.broadcast()` 时默认的延迟。"),
  prompt: lib_default2.natural().role("ms").default(Time.minute).description("调用 `session.prompt()` 时默认的等待时间。")
}));
defineProperty(Context3.Config, "Advanced", lib_default2.object({
  maxListeners: lib_default2.natural().default(64).description("每种监听器的最大数量。如果超过这个数量，Koishi 会认定为发生了内存泄漏，将产生一个警告。")
}).description("高级设置"));
Context3.Config.list.push(Context3.Config.Basic);
Context3.Config.list.push(lib_default2.object({
  i18n: I18n.Config
}));
Context3.Config.list.push(lib_default2.object({
  delay: Context3.Config.Delay
}).description("延迟设置"));
Context3.Config.list.push(Context3.Config.Advanced);
Context3.Config.list.push(lib_default2.object({
  request: HTTP.Config
}));
var _a46;
var Service3 = (_a46 = class extends Service2 {
  [Service2.setup]() {
    this.ctx = new Context3();
  }
}, __name18(_a46, "Service"), _a46);
function defineConfig(config) {
  return config;
}
__name18(defineConfig, "defineConfig");
export {
  Eval3 as $,
  Adapter,
  Context3 as App,
  Argv,
  Binary,
  Bot,
  Channel2 as Channel,
  Command,
  Commander,
  Context3 as Context,
  Database,
  Driver,
  lib_default3 as Element,
  Eval3 as Eval,
  Field,
  FilterService,
  HTTP,
  I18n,
  browser_default as Logger,
  MessageEncoder,
  MessageEncoder as Messenger,
  Model,
  Next,
  Permissions,
  Processor,
  HTTP as Quester,
  lib_default as Random,
  Relation,
  RuntimeError,
  lib_default2 as Schema,
  SchemaService2 as SchemaService,
  Selection,
  Service3 as Service,
  SessionError,
  SharedCache,
  Tables,
  Time,
  Type,
  Types,
  lib_exports2 as Universal,
  User,
  arrayBufferToBase64,
  arrayBufferToHex,
  assertProperty,
  base64ToArrayBuffer,
  camelCase,
  camelize,
  capitalize,
  clone,
  coerce,
  contain,
  createMatch,
  deduplicate,
  deepEqual,
  defineConfig,
  defineEnumProperty,
  defineProperty,
  difference,
  enumKeys,
  escapeRegExp,
  executeEval,
  executeQuery,
  executeSort,
  executeUpdate,
  extend,
  filterKeys,
  flatten,
  getCell,
  lib_default3 as h,
  hasSubquery,
  hexToArrayBuffer,
  hyphenate,
  interpolate,
  intersection,
  is,
  isAggrExpr,
  isComparable,
  isEmpty,
  isEvalExpr,
  isFlat,
  isInteger,
  isNullable,
  isPlainObject,
  is as isType,
  isUpdateExpr,
  makeArray,
  makeRegExp,
  mapValues,
  merge,
  noop,
  observe,
  omit,
  paramCase,
  pick,
  randomId,
  remove,
  renameProperty,
  resolveConfig,
  sanitize,
  lib_default3 as segment,
  sleep,
  snakeCase,
  trimSlash,
  uncapitalize,
  union,
  unravel,
  mapValues as valueMap,
  version,
  lib_default2 as z
};
/*! Bundled license information:

mime-db/index.js:
  (*!
   * mime-db
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015-2022 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/
//# sourceMappingURL=koishi.js.map
