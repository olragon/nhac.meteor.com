(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/underscore-string/lib/underscore.string/lib/underscore.string.js                                    //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
// Underscore.string                                                                                            // 1
// (c) 2010 Esa-Matti Suuronen <esa-matti aet suuronen dot org>                                                 // 2
// Underscore.strings is freely distributable under the terms of the MIT license.                               // 3
// Documentation: https://github.com/epeli/underscore.string                                                    // 4
// Some code is borrowed from MooTools and Alexandru Marasteanu.                                                // 5
                                                                                                                // 6
// Version 2.2.0rc                                                                                              // 7
(function(root){                                                                                                // 8
  'use strict';                                                                                                 // 9
                                                                                                                // 10
  // Defining helper functions.                                                                                 // 11
                                                                                                                // 12
  var nativeTrim = String.prototype.trim;                                                                       // 13
  var nativeTrimRight = String.prototype.trimRight;                                                             // 14
  var nativeTrimLeft = String.prototype.trimLeft;                                                               // 15
                                                                                                                // 16
  var parseNumber = function(source) { return source * 1 || 0; };                                               // 17
                                                                                                                // 18
  var strRepeat = function(str, qty, separator){                                                                // 19
    // ~~var — is the fastest available way to convert anything to Integer in javascript.                       // 20
    // We'll use it extensively in this lib.                                                                    // 21
    str += ''; qty = ~~qty;                                                                                     // 22
    for (var repeat = []; qty > 0; repeat[--qty] = str) {}                                                      // 23
    return repeat.join(separator == null ? '' : separator);                                                     // 24
  };                                                                                                            // 25
                                                                                                                // 26
  var slice = function(a){                                                                                      // 27
    return Array.prototype.slice.call(a);                                                                       // 28
  };                                                                                                            // 29
                                                                                                                // 30
  var defaultToWhiteSpace = function(characters){                                                               // 31
    if (characters != null) {                                                                                   // 32
      return '[' + _s.escapeRegExp(''+characters) + ']';                                                        // 33
    }                                                                                                           // 34
    return '\\s';                                                                                               // 35
  };                                                                                                            // 36
                                                                                                                // 37
  var escapeChars = {                                                                                           // 38
    lt: '<',                                                                                                    // 39
    gt: '>',                                                                                                    // 40
    quot: '"',                                                                                                  // 41
    apos: "'",                                                                                                  // 42
    amp: '&'                                                                                                    // 43
  };                                                                                                            // 44
                                                                                                                // 45
  var reversedEscapeChars = {};                                                                                 // 46
  for(var key in escapeChars){ reversedEscapeChars[escapeChars[key]] = key; }                                   // 47
                                                                                                                // 48
  // sprintf() for JavaScript 0.7-beta1                                                                         // 49
  // http://www.diveintojavascript.com/projects/javascript-sprintf                                              // 50
  //                                                                                                            // 51
  // Copyright (c) Alexandru Marasteanu <alexaholic [at) gmail (dot] com>                                       // 52
  // All rights reserved.                                                                                       // 53
                                                                                                                // 54
  var sprintf = (function() {                                                                                   // 55
    function get_type(variable) {                                                                               // 56
      return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();                               // 57
    }                                                                                                           // 58
                                                                                                                // 59
    var str_repeat = strRepeat;                                                                                 // 60
                                                                                                                // 61
    var str_format = function() {                                                                               // 62
      if (!str_format.cache.hasOwnProperty(arguments[0])) {                                                     // 63
        str_format.cache[arguments[0]] = str_format.parse(arguments[0]);                                        // 64
      }                                                                                                         // 65
      return str_format.format.call(null, str_format.cache[arguments[0]], arguments);                           // 66
    };                                                                                                          // 67
                                                                                                                // 68
    str_format.format = function(parse_tree, argv) {                                                            // 69
      var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
      for (i = 0; i < tree_length; i++) {                                                                       // 71
        node_type = get_type(parse_tree[i]);                                                                    // 72
        if (node_type === 'string') {                                                                           // 73
          output.push(parse_tree[i]);                                                                           // 74
        }                                                                                                       // 75
        else if (node_type === 'array') {                                                                       // 76
          match = parse_tree[i]; // convenience purposes only                                                   // 77
          if (match[2]) { // keyword argument                                                                   // 78
            arg = argv[cursor];                                                                                 // 79
            for (k = 0; k < match[2].length; k++) {                                                             // 80
              if (!arg.hasOwnProperty(match[2][k])) {                                                           // 81
                throw new Error(sprintf('[_.sprintf] property "%s" does not exist', match[2][k]));              // 82
              }                                                                                                 // 83
              arg = arg[match[2][k]];                                                                           // 84
            }                                                                                                   // 85
          } else if (match[1]) { // positional argument (explicit)                                              // 86
            arg = argv[match[1]];                                                                               // 87
          }                                                                                                     // 88
          else { // positional argument (implicit)                                                              // 89
            arg = argv[cursor++];                                                                               // 90
          }                                                                                                     // 91
                                                                                                                // 92
          if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {                                           // 93
            throw new Error(sprintf('[_.sprintf] expecting number but found %s', get_type(arg)));               // 94
          }                                                                                                     // 95
          switch (match[8]) {                                                                                   // 96
            case 'b': arg = arg.toString(2); break;                                                             // 97
            case 'c': arg = String.fromCharCode(arg); break;                                                    // 98
            case 'd': arg = parseInt(arg, 10); break;                                                           // 99
            case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;                // 100
            case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;              // 101
            case 'o': arg = arg.toString(8); break;                                                             // 102
            case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;        // 103
            case 'u': arg = Math.abs(arg); break;                                                               // 104
            case 'x': arg = arg.toString(16); break;                                                            // 105
            case 'X': arg = arg.toString(16).toUpperCase(); break;                                              // 106
          }                                                                                                     // 107
          arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);                              // 108
          pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';                          // 109
          pad_length = match[6] - String(arg).length;                                                           // 110
          pad = match[6] ? str_repeat(pad_character, pad_length) : '';                                          // 111
          output.push(match[5] ? arg + pad : pad + arg);                                                        // 112
        }                                                                                                       // 113
      }                                                                                                         // 114
      return output.join('');                                                                                   // 115
    };                                                                                                          // 116
                                                                                                                // 117
    str_format.cache = {};                                                                                      // 118
                                                                                                                // 119
    str_format.parse = function(fmt) {                                                                          // 120
      var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;                                               // 121
      while (_fmt) {                                                                                            // 122
        if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {                                                        // 123
          parse_tree.push(match[0]);                                                                            // 124
        }                                                                                                       // 125
        else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {                                                    // 126
          parse_tree.push('%');                                                                                 // 127
        }                                                                                                       // 128
        else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
          if (match[2]) {                                                                                       // 130
            arg_names |= 1;                                                                                     // 131
            var field_list = [], replacement_field = match[2], field_match = [];                                // 132
            if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {                       // 133
              field_list.push(field_match[1]);                                                                  // 134
              while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {         // 135
                if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {                 // 136
                  field_list.push(field_match[1]);                                                              // 137
                }                                                                                               // 138
                else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {                       // 139
                  field_list.push(field_match[1]);                                                              // 140
                }                                                                                               // 141
                else {                                                                                          // 142
                  throw new Error('[_.sprintf] huh?');                                                          // 143
                }                                                                                               // 144
              }                                                                                                 // 145
            }                                                                                                   // 146
            else {                                                                                              // 147
              throw new Error('[_.sprintf] huh?');                                                              // 148
            }                                                                                                   // 149
            match[2] = field_list;                                                                              // 150
          }                                                                                                     // 151
          else {                                                                                                // 152
            arg_names |= 2;                                                                                     // 153
          }                                                                                                     // 154
          if (arg_names === 3) {                                                                                // 155
            throw new Error('[_.sprintf] mixing positional and named placeholders is not (yet) supported');     // 156
          }                                                                                                     // 157
          parse_tree.push(match);                                                                               // 158
        }                                                                                                       // 159
        else {                                                                                                  // 160
          throw new Error('[_.sprintf] huh?');                                                                  // 161
        }                                                                                                       // 162
        _fmt = _fmt.substring(match[0].length);                                                                 // 163
      }                                                                                                         // 164
      return parse_tree;                                                                                        // 165
    };                                                                                                          // 166
                                                                                                                // 167
    return str_format;                                                                                          // 168
  })();                                                                                                         // 169
                                                                                                                // 170
                                                                                                                // 171
                                                                                                                // 172
  // Defining underscore.string                                                                                 // 173
                                                                                                                // 174
  var _s = {                                                                                                    // 175
                                                                                                                // 176
    VERSION: '2.2.0rc',                                                                                         // 177
                                                                                                                // 178
    isBlank: function(str){                                                                                     // 179
      return (/^\s*$/).test(str);                                                                               // 180
    },                                                                                                          // 181
                                                                                                                // 182
    stripTags: function(str){                                                                                   // 183
      return (''+str).replace(/<\/?[^>]+>/g, '');                                                               // 184
    },                                                                                                          // 185
                                                                                                                // 186
    capitalize : function(str) {                                                                                // 187
      str += '';                                                                                                // 188
      return str.charAt(0).toUpperCase() + str.substring(1);                                                    // 189
    },                                                                                                          // 190
                                                                                                                // 191
    chop: function(str, step){                                                                                  // 192
      str = str+'';                                                                                             // 193
      step = ~~step || str.length;                                                                              // 194
      var arr = [];                                                                                             // 195
      for (var i = 0; i < str.length; i += step)                                                                // 196
        arr.push(str.slice(i,i + step));                                                                        // 197
      return arr;                                                                                               // 198
    },                                                                                                          // 199
                                                                                                                // 200
    clean: function(str){                                                                                       // 201
      return _s.strip(str).replace(/\s+/g, ' ');                                                                // 202
    },                                                                                                          // 203
                                                                                                                // 204
    count: function(str, substr){                                                                               // 205
      str += ''; substr += '';                                                                                  // 206
      return str.split(substr).length - 1;                                                                      // 207
    },                                                                                                          // 208
                                                                                                                // 209
    chars: function(str) {                                                                                      // 210
      return (''+str).split('');                                                                                // 211
    },                                                                                                          // 212
                                                                                                                // 213
    escapeHTML: function(str) {                                                                                 // 214
      return (''+str).replace(/[&<>"']/g, function(match){ return '&' + reversedEscapeChars[match] + ';'; });   // 215
    },                                                                                                          // 216
                                                                                                                // 217
    unescapeHTML: function(str) {                                                                               // 218
      return (''+str).replace(/\&([^;]+);/g, function(entity, entityCode){                                      // 219
        var match;                                                                                              // 220
                                                                                                                // 221
        if (entityCode in escapeChars) {                                                                        // 222
          return escapeChars[entityCode];                                                                       // 223
        } else if (match = entityCode.match(/^#x([\da-fA-F]+)$/)) {                                             // 224
          return String.fromCharCode(parseInt(match[1], 16));                                                   // 225
        } else if (match = entityCode.match(/^#(\d+)$/)) {                                                      // 226
          return String.fromCharCode(~~match[1]);                                                               // 227
        } else {                                                                                                // 228
          return entity;                                                                                        // 229
        }                                                                                                       // 230
      });                                                                                                       // 231
    },                                                                                                          // 232
                                                                                                                // 233
    escapeRegExp: function(str){                                                                                // 234
      // From MooTools core 1.2.4                                                                               // 235
      return str.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');                                                   // 236
    },                                                                                                          // 237
                                                                                                                // 238
    insert: function(str, i, substr){                                                                           // 239
      var arr = _s.chars(str);                                                                                  // 240
      arr.splice(~~i, 0, ''+substr);                                                                            // 241
      return arr.join('');                                                                                      // 242
    },                                                                                                          // 243
                                                                                                                // 244
    include: function(str, needle){                                                                             // 245
      return !!~(''+str).indexOf(needle);                                                                       // 246
    },                                                                                                          // 247
                                                                                                                // 248
    join: function() {                                                                                          // 249
      var args = slice(arguments);                                                                              // 250
      return args.join(args.shift());                                                                           // 251
    },                                                                                                          // 252
                                                                                                                // 253
    lines: function(str) {                                                                                      // 254
      return (''+str).split("\n");                                                                              // 255
    },                                                                                                          // 256
                                                                                                                // 257
    reverse: function(str){                                                                                     // 258
      return _s.chars(str).reverse().join('');                                                                  // 259
    },                                                                                                          // 260
                                                                                                                // 261
    splice: function(str, i, howmany, substr){                                                                  // 262
      var arr = _s.chars(str);                                                                                  // 263
      arr.splice(~~i, ~~howmany, substr);                                                                       // 264
      return arr.join('');                                                                                      // 265
    },                                                                                                          // 266
                                                                                                                // 267
    startsWith: function(str, starts){                                                                          // 268
      str += ''; starts += '';                                                                                  // 269
      return str.length >= starts.length && str.substring(0, starts.length) === starts;                         // 270
    },                                                                                                          // 271
                                                                                                                // 272
    endsWith: function(str, ends){                                                                              // 273
      str += ''; ends += '';                                                                                    // 274
      return str.length >= ends.length && str.substring(str.length - ends.length) === ends;                     // 275
    },                                                                                                          // 276
                                                                                                                // 277
    succ: function(str){                                                                                        // 278
      str += '';                                                                                                // 279
      var arr = _s.chars(str);                                                                                  // 280
      arr.splice(str.length-1, 1, String.fromCharCode(str.charCodeAt(str.length-1) + 1));                       // 281
      return arr.join('');                                                                                      // 282
    },                                                                                                          // 283
                                                                                                                // 284
    titleize: function(str){                                                                                    // 285
      return (''+str).replace(/\b./g, function(ch){ return ch.toUpperCase(); });                                // 286
    },                                                                                                          // 287
                                                                                                                // 288
    camelize: function(str){                                                                                    // 289
      return _s.trim(str).replace(/[-_\s]+(.)?/g, function(match, chr){                                         // 290
        return chr && chr.toUpperCase();                                                                        // 291
      });                                                                                                       // 292
    },                                                                                                          // 293
                                                                                                                // 294
    underscored: function(str){                                                                                 // 295
      return _s.trim(str).replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase();         // 296
    },                                                                                                          // 297
                                                                                                                // 298
    dasherize: function(str){                                                                                   // 299
      return _s.trim(str).replace(/[_\s]+/g, '-').replace(/([A-Z])/g, '-$1').replace(/-+/g, '-').toLowerCase(); // 300
    },                                                                                                          // 301
                                                                                                                // 302
    classify: function(str){                                                                                    // 303
      str += '';                                                                                                // 304
      return _s.titleize(str.replace(/_/g, ' ')).replace(/\s/g, '')                                             // 305
    },                                                                                                          // 306
                                                                                                                // 307
    humanize: function(str){                                                                                    // 308
      return _s.capitalize(this.underscored(str).replace(/_id$/,'').replace(/_/g, ' '));                        // 309
    },                                                                                                          // 310
                                                                                                                // 311
    trim: function(str, characters){                                                                            // 312
      str += '';                                                                                                // 313
      if (!characters && nativeTrim) { return nativeTrim.call(str); }                                           // 314
      characters = defaultToWhiteSpace(characters);                                                             // 315
      return str.replace(new RegExp('\^' + characters + '+|' + characters + '+$', 'g'), '');                    // 316
    },                                                                                                          // 317
                                                                                                                // 318
    ltrim: function(str, characters){                                                                           // 319
      str+='';                                                                                                  // 320
      if (!characters && nativeTrimLeft) {                                                                      // 321
        return nativeTrimLeft.call(str);                                                                        // 322
      }                                                                                                         // 323
      characters = defaultToWhiteSpace(characters);                                                             // 324
      return str.replace(new RegExp('^' + characters + '+'), '');                                               // 325
    },                                                                                                          // 326
                                                                                                                // 327
    rtrim: function(str, characters){                                                                           // 328
      str+='';                                                                                                  // 329
      if (!characters && nativeTrimRight) {                                                                     // 330
        return nativeTrimRight.call(str);                                                                       // 331
      }                                                                                                         // 332
      characters = defaultToWhiteSpace(characters);                                                             // 333
      return str.replace(new RegExp(characters + '+$'), '');                                                    // 334
    },                                                                                                          // 335
                                                                                                                // 336
    truncate: function(str, length, truncateStr){                                                               // 337
      str += ''; truncateStr = truncateStr || '...';                                                            // 338
      length = ~~length;                                                                                        // 339
      return str.length > length ? str.slice(0, length) + truncateStr : str;                                    // 340
    },                                                                                                          // 341
                                                                                                                // 342
    /**                                                                                                         // 343
     * _s.prune: a more elegant version of truncate                                                             // 344
     * prune extra chars, never leaving a half-chopped word.                                                    // 345
     * @author github.com/sergiokas                                                                             // 346
     */                                                                                                         // 347
    prune: function(str, length, pruneStr){                                                                     // 348
      str += ''; length = ~~length;                                                                             // 349
      pruneStr = pruneStr != null ? ''+pruneStr : '...';                                                        // 350
                                                                                                                // 351
      var pruned, borderChar, template = str.replace(/\W/g, function(ch){                                       // 352
        return (ch.toUpperCase() !== ch.toLowerCase()) ? 'A' : ' ';                                             // 353
      });                                                                                                       // 354
                                                                                                                // 355
      borderChar = template.charAt(length);                                                                     // 356
                                                                                                                // 357
      pruned = template.slice(0, length);                                                                       // 358
                                                                                                                // 359
      // Check if we're in the middle of a word                                                                 // 360
      if (borderChar && borderChar.match(/\S/))                                                                 // 361
        pruned = pruned.replace(/\s\S+$/, '');                                                                  // 362
                                                                                                                // 363
      pruned = _s.rtrim(pruned);                                                                                // 364
                                                                                                                // 365
      return (pruned+pruneStr).length > str.length ? str : str.substring(0, pruned.length)+pruneStr;            // 366
    },                                                                                                          // 367
                                                                                                                // 368
    words: function(str, delimiter) {                                                                           // 369
      return _s.trim(str, delimiter).split(delimiter || /\s+/);                                                 // 370
    },                                                                                                          // 371
                                                                                                                // 372
    pad: function(str, length, padStr, type) {                                                                  // 373
      str += '';                                                                                                // 374
                                                                                                                // 375
      var padlen  = 0;                                                                                          // 376
                                                                                                                // 377
      length = ~~length;                                                                                        // 378
                                                                                                                // 379
      if (!padStr) {                                                                                            // 380
        padStr = ' ';                                                                                           // 381
      } else if (padStr.length > 1) {                                                                           // 382
        padStr = padStr.charAt(0);                                                                              // 383
      }                                                                                                         // 384
                                                                                                                // 385
      switch(type) {                                                                                            // 386
        case 'right':                                                                                           // 387
          padlen = (length - str.length);                                                                       // 388
          return str + strRepeat(padStr, padlen);                                                               // 389
        case 'both':                                                                                            // 390
          padlen = (length - str.length);                                                                       // 391
          return strRepeat(padStr, Math.ceil(padlen/2)) +                                                       // 392
                 str +                                                                                          // 393
                 strRepeat(padStr, Math.floor(padlen/2));                                                       // 394
        default: // 'left'                                                                                      // 395
          padlen = (length - str.length);                                                                       // 396
          return strRepeat(padStr, padlen) + str;                                                               // 397
        }                                                                                                       // 398
    },                                                                                                          // 399
                                                                                                                // 400
    lpad: function(str, length, padStr) {                                                                       // 401
      return _s.pad(str, length, padStr);                                                                       // 402
    },                                                                                                          // 403
                                                                                                                // 404
    rpad: function(str, length, padStr) {                                                                       // 405
      return _s.pad(str, length, padStr, 'right');                                                              // 406
    },                                                                                                          // 407
                                                                                                                // 408
    lrpad: function(str, length, padStr) {                                                                      // 409
      return _s.pad(str, length, padStr, 'both');                                                               // 410
    },                                                                                                          // 411
                                                                                                                // 412
    sprintf: sprintf,                                                                                           // 413
                                                                                                                // 414
    vsprintf: function(fmt, argv){                                                                              // 415
      argv.unshift(fmt);                                                                                        // 416
      return sprintf.apply(null, argv);                                                                         // 417
    },                                                                                                          // 418
                                                                                                                // 419
    toNumber: function(str, decimals) {                                                                         // 420
      str += '';                                                                                                // 421
      var num = parseNumber(parseNumber(str).toFixed(~~decimals));                                              // 422
      return num === 0 && !str.match(/^0+$/) ? Number.NaN : num;                                                // 423
    },                                                                                                          // 424
                                                                                                                // 425
    strRight: function(str, sep){                                                                               // 426
      str += ''; sep = sep != null ? ''+sep : sep;                                                              // 427
      var pos = !sep ? -1 : str.indexOf(sep);                                                                   // 428
      return ~pos ? str.slice(pos+sep.length, str.length) : str;                                                // 429
    },                                                                                                          // 430
                                                                                                                // 431
    strRightBack: function(str, sep){                                                                           // 432
      str += ''; sep = sep != null ? ''+sep : sep;                                                              // 433
      var pos = !sep ? -1 : str.lastIndexOf(sep);                                                               // 434
      return ~pos ? str.slice(pos+sep.length, str.length) : str;                                                // 435
    },                                                                                                          // 436
                                                                                                                // 437
    strLeft: function(str, sep){                                                                                // 438
      str += ''; sep = sep != null ? ''+sep : sep;                                                              // 439
      var pos = !sep ? -1 : str.indexOf(sep);                                                                   // 440
      return ~pos ? str.slice(0, pos) : str;                                                                    // 441
    },                                                                                                          // 442
                                                                                                                // 443
    strLeftBack: function(str, sep){                                                                            // 444
      str += ''; sep = sep != null ? ''+sep : sep;                                                              // 445
      var pos = str.lastIndexOf(sep);                                                                           // 446
      return ~pos ? str.slice(0, pos) : str;                                                                    // 447
    },                                                                                                          // 448
                                                                                                                // 449
    toSentence: function(array, separator, lastSeparator) {                                                     // 450
        separator || (separator = ', ');                                                                        // 451
        lastSeparator || (lastSeparator = ' and ');                                                             // 452
        var length = array.length, str = '';                                                                    // 453
                                                                                                                // 454
        for (var i = 0; i < length; i++) {                                                                      // 455
            str += array[i];                                                                                    // 456
            if (i === (length - 2)) { str += lastSeparator; }                                                   // 457
            else if (i < (length - 1)) { str += separator; }                                                    // 458
        }                                                                                                       // 459
                                                                                                                // 460
        return str;                                                                                             // 461
    },                                                                                                          // 462
                                                                                                                // 463
    slugify: function(str) {                                                                                    // 464
      var from  = "ąàáäâãćęèéëêìíïîłńòóöôõùúüûñçżź",                                                            // 465
          to    = "aaaaaaceeeeeiiiilnooooouuuunczz",                                                            // 466
          regex = new RegExp(defaultToWhiteSpace(from), 'g');                                                   // 467
                                                                                                                // 468
      str = (''+str).toLowerCase();                                                                             // 469
                                                                                                                // 470
      str = str.replace(regex, function(ch){                                                                    // 471
        var index = from.indexOf(ch);                                                                           // 472
        return to.charAt(index) || '-';                                                                         // 473
      });                                                                                                       // 474
                                                                                                                // 475
      return _s.trim(str.replace(/[^\w\s-]/g, '').replace(/[-\s]+/g, '-'), '-');                                // 476
    },                                                                                                          // 477
                                                                                                                // 478
    exports: function() {                                                                                       // 479
      var result = {};                                                                                          // 480
                                                                                                                // 481
      for (var prop in this) {                                                                                  // 482
        if (!this.hasOwnProperty(prop) || ~_s.words('include contains reverse').indexOf(prop)) continue;        // 483
        result[prop] = this[prop];                                                                              // 484
      }                                                                                                         // 485
                                                                                                                // 486
      return result;                                                                                            // 487
    },                                                                                                          // 488
                                                                                                                // 489
    repeat: strRepeat                                                                                           // 490
  };                                                                                                            // 491
                                                                                                                // 492
  // Aliases                                                                                                    // 493
                                                                                                                // 494
  _s.strip    = _s.trim;                                                                                        // 495
  _s.lstrip   = _s.ltrim;                                                                                       // 496
  _s.rstrip   = _s.rtrim;                                                                                       // 497
  _s.center   = _s.lrpad;                                                                                       // 498
  _s.rjust    = _s.lpad;                                                                                        // 499
  _s.ljust    = _s.rpad;                                                                                        // 500
  _s.contains = _s.include;                                                                                     // 501
                                                                                                                // 502
  // CommonJS module is defined                                                                                 // 503
  if (typeof exports !== 'undefined') {                                                                         // 504
    if (typeof module !== 'undefined' && module.exports) {                                                      // 505
      // Export module                                                                                          // 506
      module.exports = _s;                                                                                      // 507
    }                                                                                                           // 508
    exports._s = _s;                                                                                            // 509
                                                                                                                // 510
  } else if (typeof define === 'function' && define.amd) {                                                      // 511
    // Register as a named module with AMD.                                                                     // 512
    define('underscore.string', function() {                                                                    // 513
      return _s;                                                                                                // 514
    });                                                                                                         // 515
                                                                                                                // 516
  } else {                                                                                                      // 517
    // Integrate with Underscore.js if defined                                                                  // 518
    // or create our own underscore object.                                                                     // 519
    root._ = root._ || {};                                                                                      // 520
    root._.string = root._.str = _s;                                                                            // 521
  }                                                                                                             // 522
                                                                                                                // 523
  _.str = _s;                                                                                                   // 524
}(this || window));                                                                                             // 525
                                                                                                                // 526
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/underscore-string/common.js                                                                         //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
                                                                                                                // 1
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);
