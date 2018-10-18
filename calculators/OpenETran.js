//function OpenETran() {

// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = (typeof Module !== 'undefined' ? Module : null) || {};

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    window['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (vararg) return 8;
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    var source = Pointer_stringify(code);
    if (source[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (source.indexOf('"', 1) === source.length-1) {
        source = source.substr(1, source.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + source + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    try {
      var evalled = eval('(function(' + args.join(',') + '){ ' + source + ' })'); // new Function does not allow upvars in node
    } catch(e) {
      Module.printErr('error in executing inline EM_ASM code: ' + e + ' on: \n\n' + source + '\n\nwith args |' + args + '| (make sure to use the right one out of EM_ASM, EM_ASM_ARGS, etc.)');
      throw e;
    }
    return Runtime.asmConstCache[code] = evalled;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      /* TODO: use TextEncoder when present,
        var encoder = new TextEncoder();
        encoder['encoding'] = "utf-8";
        var utf8Array = encoder['encode'](aMsg.data);
      */
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*(+4294967296))) : ((+((low>>>0)))+((+((high|0)))*(+4294967296)))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    if (rawList) {
      if (ret) {
        list.push(ret + '?');
      }
      return list;
    } else {
      return ret + flushList();
    }
  }
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===



STATIC_BASE = 8;

STATICTOP = STATIC_BASE + 13392;


/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });























var _stdout;
var _stdout=_stdout=allocate(1, "i32*", ALLOC_STATIC);
var _stderr;
var _stderr=_stderr=allocate(1, "i32*", ALLOC_STATIC);

























































































































































































































































































































































































































































































































































































































































































































































































































/* memory initializer */ allocate([116,114,97,110,115,102,111,114,109,101,114,0,0,0,0,0,116,105,109,101,0,0,0,0,0,0,0,0,0,0,0,0,115,117,114,103,101,0,0,0,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,110,101,119,32,118,111,108,116,109,101,116,101,114,0,0,0,0,10,79,117,116,112,117,116,32,86,97,108,117,101,115,58,0,102,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,111,117,116,112,117,116,32,115,116,111,114,97,103,101,0,0,0,0,0,0,0,102,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,105,110,112,117,116,32,115,116,114,117,99,116,32,115,116,111,114,97,103,101,0,117,115,97,103,101,32,40,105,116,101,114,97,116,105,111,110,41,58,32,111,112,101,110,101,116,114,97,110,32,45,105,99,114,105,116,32,102,105,114,115,116,95,112,111,108,101,32,108,97,115,116,95,112,111,108,101,32,119,105,114,101,95,102,108,97,103,115,32,46,46,46,32,102,105,108,101,110,97,109,101,46,100,97,116,0,0,0,0,117,115,97,103,101,32,40,111,110,101,45,115,104,111,116,41,58,32,111,112,101,110,101,116,114,97,110,32,45,112,108,111,116,32,91,110,111,110,101,124,99,115,118,124,116,97,98,124,101,108,116,93,32,102,105,108,101,110,97,109,101,46,100,97,116,0,0,0,0,0,0,0,115,116,101,101,112,102,114,111,110,116,0,0,0,0,0,0,115,112,97,110,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,123,20,174,71,225,122,132,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,240,63,164,112,61,10,215,163,228,63,63,53,94,186,73,12,230,63,0,0,0,0,0,0,36,64,197,32,176,114,104,145,229,63,139,108,231,251,169,241,230,63,0,0,0,0,0,0,89,64,180,200,118,190,159,26,231,63,254,212,120,233,38,49,232,63,0,0,0,0,0,64,127,64,205,204,204,204,204,204,232,63,25,4,86,14,45,178,233,63,0,0,0,0,0,64,143,64,68,139,108,231,251,169,233,63,229,208,34,219,249,126,234,63,0,0,0,0,0,64,159,64,12,2,43,135,22,217,234,63,176,114,104,145,237,124,235,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,123,20,174,71,225,122,132,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,240,63,94,186,73,12,2,43,227,63,76,55,137,65,96,229,228,63,0,0,0,0,0,0,36,64,82,184,30,133,235,81,228,63,193,202,161,69,182,243,229,63,0,0,0,0,0,0,89,64,236,81,184,30,133,235,229,63,6,129,149,67,139,108,231,63,0,0,0,0,0,64,127,64,45,178,157,239,167,198,231,63,160,26,47,221,36,6,233,63,0,0,0,0,0,64,143,64,162,69,182,243,253,212,232,63,150,67,139,108,231,251,233,63,0,0,0,0,0,64,159,64,190,159,26,47,221,36,234,63,51,51,51,51,51,51,235,63,32,9,10,11,12,13,7,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,114,101,115,105,115,116,111,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,111,108,101,115,0,0,0,108,97,98,101,108,112,111,108,101,0,0,0,0,0,0,0,112,105,112,101,103,97,112,0,108,97,98,101,108,112,104,97,115,101,0,0,0,0,0,0,112,97,105,114,115,0,0,0,110,111,100,101,0,0,0,0,110,101,119,97,114,114,0,0,109,101,116,101,114,0,0,0,108,112,109,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,123,20,174,71,225,122,132,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,240,63,123,20,174,71,225,122,228,63,23,217,206,247,83,227,229,63,0,0,0,0,0,0,36,64,70,182,243,253,212,120,229,63,55,137,65,96,229,208,230,63,0,0,0,0,0,0,89,64,182,243,253,212,120,233,230,63,0,0,0,0,0,0,232,63,0,0,0,0,0,64,127,64,252,169,241,210,77,98,232,63,72,225,122,20,174,71,233,63,0,0,0,0,0,64,143,64,201,118,190,159,26,47,233,63,106,188,116,147,24,4,234,63,0,0,0,0,0,64,159,64,12,2,43,135,22,217,234,63,176,114,104,145,237,124,235,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,123,20,174,71,225,122,132,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,240,63,223,79,141,151,110,18,227,63,205,204,204,204,204,204,228,63,0,0,0,0,0,0,36,64,254,212,120,233,38,49,228,63,152,110,18,131,192,202,229,63,0,0,0,0,0,0,89,64,111,18,131,192,202,161,229,63,180,200,118,190,159,26,231,63,0,0,0,0,0,64,127,64,4,86,14,45,178,157,231,63,119,190,159,26,47,221,232,63,0,0,0,0,0,64,143,64,207,247,83,227,165,155,232,63,195,245,40,92,143,194,233,63,0,0,0,0,0,64,159,64,109,231,251,169,241,210,233,63,182,243,253,212,120,233,234,63,108,105,110,101,0,0,0,0,105,110,115,117,108,97,116,111,114,0,0,0,0,0,0,0,105,110,100,117,99,116,111,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,123,20,174,71,225,122,132,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,240,63,78,98,16,88,57,180,228,63,233,38,49,8,172,28,230,63,0,0,0,0,0,0,36,64,109,231,251,169,241,210,229,63,51,51,51,51,51,51,231,63,0,0,0,0,0,0,89,64,176,114,104,145,237,124,231,63,207,247,83,227,165,155,232,63,0,0,0,0,0,64,127,64,72,225,122,20,174,71,233,63,104,145,237,124,63,53,234,63,0,0,0,0,0,64,143,64,61,10,215,163,112,61,234,63,180,200,118,190,159,26,235,63,0,0,0,0,0,64,159,64,133,235,81,184,30,133,235,63,254,212,120,233,38,49,236,63,0,0,0,0,0,136,179,64,240,167,198,75,55,137,237,63,18,131,192,202,161,69,238,63,0,0,0,0,0,136,195,64,4,86,14,45,178,157,239,63,0,0,0,0,0,0,240,63,0,0,0,0,0,76,205,64,80,141,151,110,18,131,240,63,96,229,208,34,219,249,240,63,0,0,0,0,0,136,211,64,180,200,118,190,159,26,241,63,88,57,180,200,118,190,241,63,0,0,0,0,0,136,227,64,14,45,178,157,239,167,242,63,106,188,116,147,24,4,244,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,123,20,174,71,225,122,132,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,240,63,219,249,126,106,188,116,227,63,158,239,167,198,75,55,229,63,0,0,0,0,0,0,36,64,164,112,61,10,215,163,228,63,18,131,192,202,161,69,230,63,0,0,0,0,0,0,89,64,61,10,215,163,112,61,230,63,45,178,157,239,167,198,231,63,0,0,0,0,0,64,127,64,84,227,165,155,196,32,232,63,156,196,32,176,114,104,233,63,0,0,0,0,0,64,143,64,201,118,190,159,26,47,233,63,145,237,124,63,53,94,234,63,0,0,0,0,0,64,159,64,186,73,12,2,43,135,234,63,4,86,14,45,178,157,235,63,0,0,0,0,0,136,179,64,164,112,61,10,215,163,236,63,150,67,139,108,231,251,237,63,0,0,0,0,0,136,195,64,49,8,172,28,90,100,239,63,0,0,0,0,0,0,240,63,0,0,0,0,0,76,205,64,229,208,34,219,249,126,240,63,180,200,118,190,159,26,241,63,0,0,0,0,0,136,211,64,180,200,118,190,159,26,241,63,43,135,22,217,206,247,241,63,0,0,0,0,0,136,227,64,98,16,88,57,180,200,242,63,207,247,83,227,165,155,244,63,112,10,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,103,114,111,117,110,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,123,20,174,71,225,122,132,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,0,0,0,0,0,64,143,64,68,139,108,231,251,169,237,63,14,45,178,157,239,167,238,63,0,0,0,0,0,64,159,64,180,200,118,190,159,26,239,63,172,28,90,100,59,223,239,63,0,0,0,0,0,136,179,64,78,98,16,88,57,180,240,63,31,133,235,81,184,30,241,63,0,0,0,0,0,136,195,64,172,28,90,100,59,223,241,63,127,106,188,116,147,24,242,63,0,0,0,0,0,76,205,64,121,233,38,49,8,172,242,63,51,51,51,51,51,51,243,63,0,0,0,0,0,136,211,64,242,210,77,98,16,88,243,63,170,241,210,77,98,16,244,63,0,0,0,0,0,136,227,64,74,12,2,43,135,22,245,63,57,180,200,118,190,159,246,63,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,123,20,174,71,225,122,132,63,0,0,0,0,0,0,224,63,0,0,0,0,0,0,224,63,0,0,0,0,0,64,143,64,80,141,151,110,18,131,236,63,66,96,229,208,34,219,237,63,0,0,0,0,0,64,159,64,63,53,94,186,73,12,238,63,221,36,6,129,149,67,239,63,0,0,0,0,0,136,179,64,104,145,237,124,63,53,240,63,96,229,208,34,219,249,240,63,0,0,0,0,0,136,195,64,195,245,40,92,143,194,241,63,233,38,49,8,172,28,242,63,0,0,0,0,0,76,205,64,227,165,155,196,32,176,242,63,92,143,194,245,40,92,243,63,0,0,0,0,0,136,211,64,92,143,194,245,40,92,243,63,188,116,147,24,4,86,244,63,0,0,0,0,0,136,227,64,221,36,6,129,149,67,245,63,135,22,217,206,247,83,247,63,0,0,0,0,0,0,0,0,192,27,0,0,168,27,0,0,80,27,0,0,160,26,0,0,128,26,0,0,184,24,0,0,40,24,0,0,216,23,0,0,128,23,0,0,8,23,0,0,176,22,0,0,96,22,0,0,40,22,0,0,192,21,0,0,112,21,0,0,216,20,0,0,64,20,0,0,176,19,0,0,104,19,0,0,64,19,0,0,248,18,0,0,200,18,0,0,136,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,101,110,100,0,0,0,0,0,10,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,95,112,137,0,255,9,47,15,10,0,0,0,100,0,0,0,232,3,0,0,16,39,0,0,160,134,1,0,64,66,15,0,128,150,152,0,0,225,245,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,99,117,115,116,111,109,101,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,99,111,110,100,117,99,116,111,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,50,100,116,0,0,0,0,0,99,97,112,97,99,105,116,111,114,0,0,0,0,0,0,0,99,97,98,108,101,0,0,0,8,41,0,0,64,0,0,0,2,0,0,0,2,0,0,0,97,114,114,101,115,116,101,114,0,0,0,0,0,0,0,0,97,114,114,98,101,122,0,0,84,105,109,101,37,99,0,0,109,97,116,114,105,120,32,100,105,109,101,110,115,105,111,110,32,110,49,32,109,117,115,116,32,98,101,32,112,111,115,105,116,105,118,101,32,105,110,116,101,103,101,114,0,0,0,0,109,97,116,114,105,120,32,115,105,122,101,115,32,97,114,101,32,100,105,102,102,101,114,101,110,116,0,0,0,0,0,0,101,105,103,101,110,118,101,99,116,111,114,32,109,97,116,114,105,120,32,109,117,115,116,32,109,97,116,99,104,32,109,97,116,114,105,120,32,115,105,122,101,0,0,0,0,0,0,0,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,110,101,119,32,116,114,97,110,115,102,111,114,109,101,114,10,0,115,121,109,109,101,116,114,105,99,32,116,114,105,100,105,97,103,111,110,97,108,32,100,101,99,111,109,112,111,115,105,116,105,111,110,32,114,101,113,117,105,114,101,115,32,115,113,117,97,114,101,32,109,97,116,114,105,120,0,0,0,0,0,0,99,97,110,39,116,32,102,105,110,100,32,109,97,116,99,104,105,110,103,32,97,114,114,98,101,122,32,102,111,114,32,84,104,101,118,101,110,105,110,32,114,101,100,117,99,116,105,111,110,10,0,0,0,0,0,0,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,110,101,119,32,97,109,109,101,116,101,114,10,0,0,0,0,0,46,116,120,116,0,0,0,0,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,110,101,119,32,115,112,97,110,10,0,0,0,0,0,0,0,0,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,110,101,119,32,105,110,100,117,99,116,111,114,10,0,0,0,0,100,105,109,101,110,115,105,111,110,115,32,111,102,32,100,101,115,116,32,109,97,116,114,105,120,32,109,117,115,116,32,98,101,32,116,114,97,110,115,112,111,115,101,32,111,102,32,115,114,99,32,109,97,116,114,105,120,0,0,0,0,0,0,0,108,116,32,105,110,32,115,116,97,110,100,45,97,108,111,110,101,32,109,111,100,101,10,0,73,98,32,37,115,95,37,115,0,0,0,0,0,0,0,0,101,105,103,101,110,118,97,108,117,101,32,118,101,99,116,111,114,32,109,117,115,116,32,109,97,116,99,104,32,109,97,116,114,105,120,32,115,105,122,101,0,0,0,0,0,0,0,0,76,85,32,100,101,99,111,109,112,111,115,105,116,105,111,110,32,114,101,113,117,105,114,101,115,32,115,113,117,97,114,101,32,109,97,116,114,105,120,0,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,110,101,119,32,118,111,108,116,109,101,116,101,114,10,0,0,0,46,99,115,118,0,0,0,0,99,97,110,39,116,32,105,110,105,116,105,97,108,105,122,101,32,115,112,97,110,32,108,105,115,116,10,0,0,0,0,0,99,97,110,39,116,32,105,110,105,116,105,97,108,105,122,101,32,105,110,100,117,99,116,111,114,32,108,105,115,116,10,0,79,112,101,110,69,84,114,97,110,32,49,46,48,48,0,0,108,116,32,105,110,32,108,111,99,97,116,105,111,110,32,99,111,110,116,114,111,108,32,109,111,100,101,10,0,0,0,0,80,68,32,37,115,95,37,115,0,0,0,0,0,0,0,0,109,97,116,114,105,120,32,115,105,122,101,32,109,117,115,116,32,109,97,116,99,104,32,115,111,108,117,116,105,111,110,47,114,104,115,32,115,105,122,101,0,0,0,0,0,0,0,0,109,97,116,114,105,120,32,109,117,115,116,32,98,101,32,115,113,117,97,114,101,32,116,111,32,99,111,109,112,117,116,101,32,101,105,103,101,110,118,97,108,117,101,115,0,0,0,0,99,97,110,39,116,32,105,110,105,116,105,97,108,105,122,101,32,109,101,116,101,114,32,108,105,115,116,10,0,0,0,0,46,111,117,116,0,0,0,0,80,108,101,97,115,101,32,97,100,100,32,82,44,32,111,114,32,99,104,97,110,103,101,32,86,46,10,0,0,0,0,0,103,115,108,58,32,37,115,58,37,100,58,32,37,115,58,32,37,115,10,0,0,0,0,0,69,82,82,79,82,0,0,0,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,110,101,119,32,97,114,114,101,115,116,101,114,10,0,0,0,0,9,69,110,101,114,103,121,58,32,37,108,101,10,0,0,0,117,110,109,97,116,99,104,101,100,32,112,97,105,114,32,102,111,114,32,37,100,10,0,0,77,111,100,97,108,32,84,114,97,110,115,102,111,114,109,97,116,105,111,110,32,40,84,105,41,10,0,0,0,0,0,0,115,105,122,101,32,111,102,32,115,117,98,100,105,97,103,111,110,97,108,32,109,117,115,116,32,98,101,32,40,109,97,116,114,105,120,32,115,105,122,101,32,45,32,49,41,0,0,0,109,97,116,114,105,120,32,100,105,109,101,110,115,105,111,110,32,109,117,115,116,32,98,101,32,112,111,115,105,116,105,118,101,32,105,110,116,101,103,101,114,0,0,0,0,0,0,0,109,97,116,114,105,120,32,105,115,32,115,105,110,103,117,108,97,114,0,0,0,0,0,0,88,50,32,37,115,0,0,0,105,110,102,105,110,105,116,121,0,0,0,0,0,0,0,0,102,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,115,112,97,99,101,32,102,111,114,32,115,105,110,101,115,0,0,0,0,0,0,101,105,103,101,110,118,101,99,116,111,114,32,109,97,116,114,105,120,32,109,117,115,116,32,98,101,32,115,113,117,97,114,101,0,0,0,0,0,0,0,32,61,32,37,108,101,10,0,46,100,97,116,0,0,0,0,98,117,116,32,110,111,32,114,101,115,105,115,116,97,110,99,101,46,10,0,0,0,0,0,99,97,110,39,116,32,105,110,105,116,105,97,108,105,122,101,32,97,114,114,101,115,116,101,114,32,108,105,115,116,10,0,9,67,104,97,114,103,101,58,32,37,108,101,10,0,0,0,115,101,99,111,110,100,32,100,105,109,101,110,115,105,111,110,32,111,118,101,114,102,108,111,119,115,32,109,97,116,114,105,120,0,0,0,0,0,0,0,46,46,47,103,115,108,47,103,115,108,95,109,97,116,114,105,120,95,100,111,117,98,108,101,46,104,0,0,0,0,0,0,10,13,0,0,0,0,0,0,90,45,109,111,100,97,108,10,0,0,0,0,0,0,0,0,115,105,122,101,32,111,102,32,100,105,97,103,111,110,97,108,32,109,117,115,116,32,109,97,116,99,104,32,115,105,122,101,32,111,102,32,65,0,0,0,72,71,32,37,115,0,0,0,105,110,118,97,108,105,100,32,108,101,110,103,116,104,0,0,98,97,100,32,112,111,108,101,58,32,37,100,10,0,0,0,102,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,115,112,97,99,101,32,102,111,114,32,99,111,115,105,110,101,115,0,0,0,0,99,97,110,39,116,32,105,110,105,116,105,97,108,105,122,101,32,115,117,114,103,101,32,108,105,115,116,10,0,0,0,0,32,32,32,109,97,116,99,104,101,100,10,0,0,0,0,0,102,114,111,109,32,37,100,32,116,111,32,37,100,44,32,109,97,120,32,86,32,32,0,0,99,97,110,39,116,32,105,110,105,116,105,97,108,105,122,101,32,115,116,101,101,112,102,114,111,110,116,32,108,105,115,116,10,0,0,0,0,0,0,0,45,105,0,0,0,0,0,0,104,97,115,32,105,110,105,116,105,97,108,32,86,100,99,32,61,32,37,108,101,44,32,0,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,110,101,119,32,99,117,115,116,111,109,101,114,10,0,0,0,0,9,69,110,101,114,103,121,58,32,37,108,101,10,0,0,0,9,84,105,109,101,32,111,102,32,112,101,97,107,58,32,37,108,101,10,0,0,0,0,0,80,111,119,101,114,45,102,114,101,113,117,101,110,99,121,32,115,111,117,114,99,101,32,97,116,32,112,111,108,101,32,37,100,46,10,0,0,0,0,0,102,105,114,115,116,32,100,105,109,101,110,115,105,111,110,32,111,118,101,114,102,108,111,119,115,32,109,97,116,114,105,120,0,0,0,0,0,0,0,0,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,115,111,117,114,99,101,32,99,117,114,114,101,110,116,115,10,0,101,108,116,32,101,114,114,111,114,32,116,114,121,105,110,103,32,116,111,32,114,101,97,100,32,110,117,109,98,101,114,32,111,102,32,112,104,97,115,101,115,10,0,0,0,0,0,0,102,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,115,112,97,99,101,32,102,111,114,32,98,108,111,99,107,0,0,0,0,0,0,115,105,122,101,32,111,102,32,81,32,109,117,115,116,32,109,97,116,99,104,32,115,105,122,101,32,111,102,32,65,0,0,77,105,120,101,100,32,99,111,110,100,117,99,116,111,114,32,97,110,100,32,99,97,98,108,101,32,105,110,112,117,116,32,102,111,114,32,115,97,109,101,32,115,112,97,110,0,0,0,80,71,32,37,115,95,37,115,0,0,0,0,0,0,0,0,78,111,32,97,114,114,101,115,116,101,114,32,100,105,115,99,104,97,114,103,101,32,118,111,108,116,97,103,101,32,100,101,102,105,110,101,100,0,0,0,111,100,100,0,0,0,0,0,83,117,98,115,99,114,105,112,116,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,102,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,115,112,97,99,101,32,102,111,114,32,115,117,98,100,105,97,103,111,110,97,108,0,0,0,0,0,0,0,0,67,97,108,99,117,108,97,116,105,111,110,32,101,114,114,111,114,32,105,110,32,109,97,116,104,32,108,105,98,114,97,114,121,0,0,0,0,0,0,0,67,97,110,39,116,32,97,108,108,111,99,97,116,101,32,109,101,109,111,114,121,32,105,110,32,109,97,116,104,32,108,105,98,114,97,114,121,0,0,0,32,32,99,104,101,99,107,32,109,101,116,101,114,32,97,116,32,37,100,32,37,100,45,37,100,10,0,0,0,0,0,0,65,114,114,101,115,116,101,114,32,101,110,101,114,103,121,32,99,97,108,99,117,108,97,116,105,111,110,32,115,116,111,112,112,101,100,32,40,99,111,110,118,101,114,103,101,110,99,101,32,102,97,105,108,117,114,101,41,0,0,0,0,0,0,0,116,114,97,110,115,102,111,114,109,101,114,32,88,50,32,109,97,120,32,73,0,0,0,0,99,97,110,39,116,32,105,110,105,116,105,97,108,105,122,101,32,112,105,112,101,103,97,112,32,108,105,115,116,10,0,0,112,101,114,45,117,110,105,116,32,83,73,32,61,32,37,108,101,10,0,0,0,0,0,0,84,114,97,110,115,105,101,110,116,32,115,105,109,117,108,97,116,105,111,110,32,115,116,111,112,112,101,100,32,40,99,111,110,118,101,114,103,101,110,99,101,32,102,97,105,108,117,114,101,41,0,0,0,0,0,0,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,110,101,119,32,105,110,115,117,108,97,116,111,114,10,0,0,0,45,112,0,0,0,0,0,0,73,110,100,117,99,116,111,114,32,102,114,111,109,32,37,100,32,116,111,32,37,100,32,0,99,97,110,39,116,32,105,110,105,116,105,97,108,105,122,101,32,99,117,115,116,111,109,101,114,32,108,105,115,116,10,0,66,97,100,32,112,111,108,101,32,110,117,109,98,101,114,32,111,110,32,99,111,109,112,111,110,101,110,116,0,0,0,0,9,67,104,97,114,103,101,58,32,37,108,101,10,0,0,0,9,84,105,109,101,32,111,112,101,114,97,116,101,100,58,32,37,108,101,0,0,0,0,0,115,101,99,111,110,100,32,99,111,108,117,109,110,32,105,110,100,101,120,32,105,115,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,0,0,0,115,101,99,111,110,100,32,100,105,109,101,110,115,105,111,110,32,109,117,115,116,32,98,101,32,110,111,110,45,122,101,114,111,0,0,0,0,0,0,0,66,97,100,32,112,97,105,114,32,110,117,109,98,101,114,32,111,110,32,99,111,109,112,111,110,101,110,116,0,0,0,0,80,97,114,97,109,101,116,101,114,32,37,100,32,116,111,32,114,111,117,116,105,110,101,32,37,115,32,119,97,115,32,105,110,99,111,114,114,101,99,116,10,0,0,0,0,0,0,0,85,110,109,97,116,99,104,101,100,32,112,97,105,114,32,105,110,112,117,116,0,0,0,0,32,37,49,52,46,53,101,0,102,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,115,112,97,99,101,32,102,111,114,32,109,97,116,114,105,120,32,115,116,114,117,99,116,0,0,0,0,0,0,109,97,116,114,105,120,32,65,32,109,117,115,116,32,98,101,32,115,113,117,97,114,101,0,66,97,100,32,99,111,110,100,117,99,116,111,114,32,104,101,105,103,104,116,0,0,0,0,76,85,32,109,97,116,114,105,120,32,109,117,115,116,32,98,101,32,115,113,117,97,114,101,0,0,0,0,0,0,0,0,66,97,100,32,99,111,110,100,117,99,116,111,114,32,114,97,100,105,117,115,0,0,0,0,73,97,32,37,115,95,37,115,0,0,0,0,0,0,0,0,37,100,0,0,0,0,0,0,77,101,116,101,114,32,97,116,32,112,111,108,101,32,37,100,44,32,0,0,0,0,0,0,101,118,101,110,0,0,0,0,77,105,115,115,105,110,103,32,97,32,99,111,110,100,117,99,116,111,114,0,0,0,0,0,102,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,115,112,97,99,101,32,102,111,114,32,100,105,97,103,111,110,97,108,0,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,115,111,114,116,32,116,121,112,101,0,0,66,97,100,32,99,111,110,100,117,99,116,111,114,32,110,117,109,98,101,114,0,0,0,0,99,97,110,39,116,32,105,110,105,116,105,97,108,105,122,101,32,108,112,109,32,108,105,115,116,10,0,0,0,0,0,0,99,97,110,39,116,32,105,110,105,116,105,97,108,105,122,101,32,115,111,117,114,99,101,32,108,105,115,116,10,0,0,0,99,97,110,39,116,32,105,110,105,116,105,97,108,105,122,101,32,114,101,115,105,115,116,111,114,32,108,105,115,116,10,0,84,111,111,32,109,97,110,121,32,99,111,110,100,117,99,116,111,114,115,0,0,0,0,0,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,110,101,119,32,112,105,112,101,103,97,112,10,0,0,0,0,0,102,105,110,100,32,97,32,118,111,108,116,109,101,116,101,114,32,97,116,32,37,100,32,37,100,45,37,100,10,0,0,0,66,97,100,32,110,117,109,98,101,114,32,111,102,32,112,111,108,101,115,0,0,0,0,0,104,111,117,115,101,32,103,114,111,117,110,100,32,109,97,120,32,73,32,32,0,0,0,0,102,108,97,115,104,101,100,32,111,118,101,114,32,97,116,32,37,108,101,32,115,101,99,111,110,100,115,10,0,0,0,0,66,97,100,32,110,117,109,98,101,114,32,111,102,32,112,104,97,115,101,115,0,0,0,0,99,97,110,39,116,32,105,110,105,116,105,97,108,105,122,101,32,105,110,115,117,108,97,116,111,114,32,108,105,115,116,10,0,0,0,0,0,0,0,0,119,0,0,0,0,0,0,0,82,101,115,117,108,116,115,32,109,97,121,32,98,101,32,105,110,118,97,108,105,100,46,10,0,0,0,0,0,0,0,0,102,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,115,112,97,99,101,32,102,111,114,32,98,108,111,99,107,32,100,97,116,97,0,67,97,110,39,116,32,114,101,97,100,32,110,117,109,98,101,114,32,111,102,32,112,104,97,115,101,115,0,0,0,0,0,9,77,97,120,32,73,120,50,32,61,32,37,108,101,32,97,109,112,115,10,0,0,0,0,9,84,105,109,101,32,111,102,32,112,101,97,107,58,32,37,108,101,10,0,0,0,0,0,46,46,47,103,115,108,47,103,115,108,95,118,101,99,116,111,114,95,100,111,117,98,108,101,46,104,0,0,0,0,0,0,115,101,99,111,110,100,32,105,110,100,101,120,32,105,115,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,0,0,102,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,115,112,97,99,101,32,102,111,114,32,98,108,111,99,107,0,0,0,0,0,0,105,110,118,97,108,105,100,32,105,110,116,101,114,118,97,108,32,40,108,111,119,101,114,32,62,32,117,112,112,101,114,41,0,0,0,0,0,0,0,0,108,111,119,101,114,32,98,111,117,110,100,32,108,97,114,103,101,114,32,116,104,97,110,32,117,112,112,101,114,32,98,111,117,110,100,0,0,0,0,0,101,110,100,112,111,105,110,116,115,32,100,111,32,110,111,116,32,115,116,114,97,100,100,108,101,32,121,61,48,0,0,0,100,105,115,99,104,97,114,103,101,100,32,37,108,101,32,65,109,112,101,114,101,115,46,10,0,0,0,0,0,0,0,0,102,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,115,112,97,99,101,32,102,111,114,32,112,101,114,109,117,116,97,116,105,111,110,32,100,97,116,97,0,0,0,102,105,114,115,116,32,99,111,108,117,109,110,32,105,110,100,101,120,32,105,115,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,0,0,0,0,102,105,114,115,116,32,100,105,109,101,110,115,105,111,110,32,109,117,115,116,32,98,101,32,110,111,110,45,122,101,114,111,0,0,0,0,0,0,0,0,73,110,105,116,105,97,108,32,68,67,32,118,111,108,116,97,103,101,32,111,110,32,105,110,100,117,99,116,111,114,0,0,78,111,32,105,110,112,117,116,32,97,118,97,105,108,97,98,108,101,32,102,111,114,32,108,116,32,115,105,109,117,108,97,116,105,111,110,0,0,0,0,90,45,112,104,97,115,101,10,0,0,0,0,0,0,0,0,109,97,116,114,105,120,32,100,105,109,101,110,115,105,111,110,32,110,50,32,109,117,115,116,32,98,101,32,112,111,115,105,116,105,118,101,32,105,110,116,101,103,101,114,0,0,0,0,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,104,105,115,116,111,114,121,32,115,112,97,99,101,10,0,0,0,115,105,122,101,32,111,102,32,116,97,117,32,109,117,115,116,32,98,101,32,40,109,97,116,114,105,120,32,115,105,122,101,32,45,32,49,41,0,0,0,67,97,110,39,116,32,97,108,108,111,99,97,116,101,32,109,101,109,111,114,121,0,0,0,112,101,114,109,117,116,97,116,105,111,110,32,108,101,110,103,116,104,32,109,117,115,116,32,109,97,116,99,104,32,109,97,116,114,105,120,32,115,105,122,101,0,0,0,0,0,0,0,86,32,37,115,95,37,115,37,115,0,0,0,0,0,0,0,79,118,101,114,108,97,112,112,105,110,103,32,99,111,110,100,117,99,116,111,114,115,0,0,78,111,32,101,114,114,111,114,0,0,0,0,0,0,0,0,97,108,108,0,0,0,0,0,73,110,115,117,108,97,116,111,114,32,97,116,32,112,111,108,101,32,37,100,44,32,102,114,111,109,32,37,100,32,116,111,32,37,100,32,0,0,0,0,98,97,100,32,110,117,109,98,101,114,32,111,102,32,110,111,100,101,115,58,32,37,100,10,0,0,0,0,0,0,0,0,102,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,115,112,97,99,101,32,102,111,114,32,119,111,114,107,115,112,97,99,101,0,0,101,105,103,101,110,118,97,108,117,101,115,32,109,117,115,116,32,109,97,116,99,104,32,101,105,103,101,110,118,101,99,116,111,114,32,109,97,116,114,105,120,0,0,0,0,0,0,0,46,47,115,111,117,114,99,101,95,116,114,115,118,95,114,46,104,0,0,0,0,0,0,0,79,112,101,110,69,84,114,97,110,32,69,114,114,111,114,0,109,97,116,114,105,120,32,109,117,115,116,32,98,101,32,115,113,117,97,114,101,0,0,0,37,52,100,37,49,48,46,49,108,102,37,49,48,46,49,108,102,37,49,48,46,49,108,102,10,0,0,0,0,0,0,0,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,110,101,119,32,114,101,115,105,115,116,111,114,10,0,0,0,0,32,119,105,114,101,32,37,50,100,58,32,37,52,101,10,0,100,105,115,99,104,97,114,103,101,100,32,37,108,101,32,65,109,112,101,114,101,115,46,10,0,0,0,0,0,0,0,0,87,97,114,110,105,110,103,33,10,0,0,0,0,0,0,0,10,65,118,101,114,97,103,101,32,67,114,105,116,105,99,97,108,32,67,117,114,114,101,110,116,115,44,32,80,111,108,101,115,32,37,100,32,116,111,32,37,100,10,0,0,0,0,0,112,111,108,101,32,103,114,111,117,110,100,32,109,97,120,32,73,32,32,32,0,0,0,0,105,110,115,117,108,97,116,111,114,32,97,116,32,112,111,108,101,32,37,100,44,32,102,114,111,109,32,37,100,32,116,111,32,37,100,32,0,0,0,0,32,112,105,112,101,103,97,112,58,32,32,37,52,101,10,0,112,101,114,45,117,110,105,116,32,83,73,32,61,32,37,108,101,10,0,0,0,0,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,111,112,101,114,97,116,105,111,110,0,0,111,112,101,110,101,116,114,97,110,46,108,111,103,0,0,0,104,97,115,32,97,110,32,105,110,105,116,105,97,108,32,100,99,32,118,111,108,116,97,103,101,46,10,0,0,0,0,0,46,47,115,111,117,114,99,101,95,115,121,114,50,46,104,0,117,110,114,101,99,111,103,110,105,122,101,100,32,111,112,101,114,97,116,105,111,110,0,0,99,97,110,39,116,32,105,110,105,116,105,97,108,105,122,101,32,103,114,111,117,110,100,32,108,105,115,116,10,0,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,111,112,101,114,97,116,105,111,110,0,0,32,99,104,97,114,103,101,58,32,32,37,52,101,10,0,0,9,77,97,120,32,73,104,103,32,61,32,37,108,101,32,97,109,112,115,10,0,0,0,0,102,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,115,112,97,99,101,32,102,111,114,32,98,108,111,99,107,32,115,116,114,117,99,116,0,0,0,0,0,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,111,112,101,114,97,116,105,111,110,0,0,117,110,114,101,99,111,103,110,105,122,101,100,32,111,112,101,114,97,116,105,111,110,0,0,9,84,105,109,101,32,111,112,101,114,97,116,101,100,58,32,37,108,101,0,0,0,0,0,46,47,115,111,117,114,99,101,95,115,121,109,118,46,104,0,102,105,114,115,116,32,105,110,100,101,120,32,105,115,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,0,0,0,118,105,101,119,32,119,111,117,108,100,32,101,120,116,101,110,100,32,112,97,115,116,32,101,110,100,32,111,102,32,118,101,99,116,111,114,0,0,0,0,46,47,111,112,101,114,95,115,111,117,114,99,101,46,99,0,102,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,115,112,97,99,101,32,102,111,114,32,118,101,99,116,111,114,32,115,116,114,117,99,116,0,0,0,0,0,0,102,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,115,112,97,99,101,32,102,111,114,32,114,111,111,116,32,115,111,108,118,101,114,32,115,116,97,116,101,0,0,97,98,115,111,108,117,116,101,32,116,111,108,101,114,97,110,99,101,32,105,115,32,110,101,103,97,116,105,118,101,0,0,98,114,101,110,116,46,99,0,115,101,99,111,110,100,32,105,110,100,101,120,32,105,115,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,0,0,102,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,115,112,97,99,101,32,102,111,114,32,112,101,114,109,117,116,97,116,105,111,110,32,115,116,114,117,99,116,0,65,114,114,101,115,116,101,114,32,97,116,32,112,111,108,101,32,37,100,44,32,102,114,111,109,32,37,100,32,116,111,32,37,100,32,0,0,0,0,0,115,101,99,111,110,100,32,114,111,119,32,105,110,100,101,120,32,105,115,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,0,0,0,0,0,0,99,111,108,117,109,110,32,105,110,100,101,120,32,105,115,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,0,0,99,111,108,117,109,110,32,105,110,100,101,120,32,105,115,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,0,0,46,47,111,112,101,114,95,115,111,117,114,99,101,46,99,0,115,101,99,111,110,100,32,105,110,100,101,120,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,0,0,0,0,0,32,99,117,114,114,101,110,116,58,32,37,52,101,10,0,0,119,105,114,101,115,32,37,100,32,97,110,100,32,37,100,32,111,118,101,114,108,97,112,10,0,0,0,0,0,0,0,0,32,32,69,110,101,114,103,121,58,32,32,37,52,101,10,0,37,51,100,32,37,54,46,50,102,32,37,46,52,103,32,37,46,52,103,10,0,0,0,0,46,47,105,110,105,116,95,115,111,117,114,99,101,46,99,0,46,47,99,111,112,121,95,115,111,117,114,99,101,46,99,0,115,121,109,109,116,100,46,99,0,0,0,0,0,0,0,0,67,117,115,116,111,109,101,114,32,97,116,32,112,111,108,101,32,37,100,44,32,102,114,111,109,32,37,100,32,116,111,32,37,100,46,10,0,0,0,0,98,97,100,32,104,101,105,103,104,116,58,32,37,108,101,32,111,110,32,99,111,110,100,117,99,116,111,114,32,37,100,10,0,0,0,0,0,0,0,0,32,32,83,73,58,32,32,32,32,32,32,37,52,101,10,0,108,117,46,99,0,0,0,0,69,80,82,73,32,79,112,101,110,69,84,114,97,110,32,84,114,97,110,115,105,101,110,116,32,83,105,109,117,108,97,116,105,111,110,0,0,0,0,0,98,97,100,32,114,97,100,105,117,115,58,32,37,108,101,32,111,110,32,99,111,110,100,117,99,116,111,114,32,37,100,10,0,0,0,0,0,0,0,0,99,97,110,39,116,32,105,110,105,116,105,97,108,105,122,101,32,99,97,112,97,99,105,116,111,114,32,108,105,115,116,10,0,0,0,0,0,0,0,0,98,108,111,99,107,32,108,101,110,103,116,104,32,110,32,109,117,115,116,32,98,101,32,112,111,115,105,116,105,118,101,32,105,110,116,101,103,101,114,0,99,97,110,39,116,32,105,110,105,116,105,97,108,105,122,101,32,108,105,110,101,32,108,105,115,116,10,0,0,0,0,0,68,101,102,97,117,108,116,32,71,83,76,32,101,114,114,111,114,32,104,97,110,100,108,101,114,32,105,110,118,111,107,101,100,46,10,0,0,0,0,0,99,97,110,110,111,116,32,117,115,101,32,112,97,105,114,32,37,100,44,32,37,100,10,0,37,101,0,0,0,0,0,0,37,101,37,99,0,0,0,0,115,121,109,109,118,46,99,0,115,111,114,116,46,99,0,0,46,47,115,111,117,114,99,101,95,103,101,109,118,95,114,46,104,0,0,0,0,0,0,0,105,110,112,117,116,32,102,105,108,101,32,108,116,46,100,97,116,32,104,97,115,32,116,111,111,32,109,97,110,121,32,99,111,110,100,117,99,116,111,114,115,10,0,0,0,0,0,0,46,47,115,111,117,114,99,101,95,103,101,109,109,95,114,46,104,0,0,0,0,0,0,0,98,97,100,32,110,117,109,98,101,114,32,111,102,32,112,111,108,101,115,58,32,37,100,10,0,0,0,0,0,0,0,0,80,37,100,58,37,100,45,73,80,73,80,69,0,0,0,0,98,108,97,115,46,99,0,0,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,110,101,119,32,115,117,114,103,101,10,0,0,0,0,0,0,0,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,110,101,119,32,115,116,101,101,112,102,114,111,110,116,10,0,0,105,110,112,117,116,32,102,105,108,101,32,108,116,46,100,97,116,32,109,105,115,115,105,110,103,32,99,111,110,100,117,99,116,111,114,115,10,0,0,0,32,32,32,35,32,32,32,32,32,32,32,32,118,112,32,32,32,32,32,32,32,32,118,109,32,32,32,32,32,32,32,32,32,105,10,0,0,0,0,0,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,110,101,119,32,115,111,117,114,99,101,10,0,0,0,0,0,0,102,97,105,108,101,100,32,116,111,32,111,112,101,110,32,112,108,111,116,32,102,105,108,101,32,37,115,10,0,0,0,0,80,37,100,58,37,100,45,73,88,50,0,0,0,0,0,0,112,105,112,101,103,97,112,32,97,116,32,112,111,108,101,32,37,100,44,32,102,114,111,109,32,37,100,32,116,111,32,37,100,32,0,0,0,0,0,0,119,98,0,0,0,0,0,0,98,97,100,32,110,111,100,101,32,110,117,109,98,101,114,32,37,100,10,0,0,0,0,0,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,110,101,119,32,110,101,119,97,114,114,10,0,0,0,0,0,0,99,97,115,101,32,37,100,44,32,112,111,108,101,32,37,100,44,32,119,105,114,101,32,37,100,44,32,105,95,112,107,32,61,32,37,71,44,32,102,116,102,32,61,32,37,71,44,32,102,116,116,32,61,32,37,71,44,32,83,73,32,61,32,37,71,44,32,69,110,101,114,103,121,32,61,32,37,71,44,32,105,116,101,114,32,61,32,37,100,44,32,115,116,97,116,117,115,32,61,32,37,100,10,0,80,37,100,58,37,100,45,73,72,71,0,0,0,0,0,0,97,114,114,101,115,116,101,114,32,109,97,120,32,73,32,32,32,32,32,32,0,0,0,0,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,110,101,119,32,108,112,109,10,0,99,97,110,39,116,32,105,110,105,116,105,97,108,105,122,101,32,112,111,108,101,32,108,105,115,116,10,0,0,0,0,0,65,114,114,101,115,116,101,114,32,97,116,32,112,111,108,101,32,37,100,44,32,102,114,111,109,32,37,100,32,116,111,32,37,100,32,0,0,0,0,0,102,97,105,108,101,100,32,116,111,32,111,112,101,110,32,111,117,116,112,117,116,32,102,105,108,101,32,37,115,10,0,0,98,97,100,32,99,111,110,100,117,99,116,111,114,32,110,117,109,98,101,114,32,37,100,10,0,0,0,0,0,0,0,0,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,110,101,119,32,108,105,110,101,10,0,0,0,0,0,0,0,0,104,97,115,95,97,114,114,101,115,116,101,114,115,32,61,32,37,100,10,0,0,0,0,0,118,101,99,116,111,114,32,108,101,110,103,116,104,32,110,32,109,117,115,116,32,98,101,32,112,111,115,105,116,105,118,101,32,105,110,116,101,103,101,114,0,0,0,0,0,0,0,0,80,37,100,58,37,100,45,73,80,71,0,0,0,0,0,0,105,110,100,101,120,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,0,0,0,0,102,108,97,115,104,101,100,32,111,118,101,114,32,97,116,32,37,108,101,32,115,101,99,111,110,100,115,10,0,0,0,0,118,101,99,116,111,114,32,108,101,110,103,116,104,32,110,32,109,117,115,116,32,98,101,32,112,111,115,105,116,105,118,101,32,105,110,116,101,103,101,114,0,0,0,0,0,0,0,0,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,110,101,119,32,115,111,117,114,99,101,10,0,0,0,0,0,0,76,111,115,115,121,32,105,110,100,117,99,116,111,114,32,102,114,111,109,32,37,100,32,116,111,32,37,100,32,0,0,0,118,101,99,116,111,114,115,32,109,117,115,116,32,104,97,118,101,32,115,97,109,101,32,108,101,110,103,116,104,0,0,0,102,97,105,108,101,100,32,116,111,32,111,112,101,110,32,105,110,112,117,116,32,102,105,108,101,32,37,115,10,0,0,0,99,97,110,39,116,32,109,105,120,32,99,97,98,108,101,32,97,110,100,32,99,111,110,100,117,99,116,111,114,32,105,110,112,117,116,32,105,110,32,116,104,101,32,115,97,109,101,32,115,112,97,110,10,0,0,0,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,110,101,119,32,103,114,111,117,110,100,10,0,0,0,0,0,0,118,101,99,116,111,114,32,108,101,110,103,116,104,32,110,32,109,117,115,116,32,98,101,32], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
/* memory initializer */ allocate([112,111,115,105,116,105,118,101,32,105,110,116,101,103,101,114,0,0,0,0,0,0,0,0,118,101,99,116,111,114,32,108,101,110,103,116,104,115,32,97,114,101,32,110,111,116,32,101,113,117,97,108,0,0,0,0,110,114,95,105,116,101,114,32,61,32,37,108,100,44,32,110,114,95,109,97,120,32,61,32,37,100,10,0,0,0,0,0,9,77,97,120,32,86,112,32,32,61,32,37,108,101,32,118,111,108,116,115,10,0,0,0,80,37,100,58,37,100,45,73,65,82,82,0,0,0,0,0,46,47,105,110,105,116,95,115,111,117,114,99,101,46,99,0,102,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,115,112,97,99,101,32,102,111,114,32,114,111,111,116,32,115,111,108,118,101,114,32,115,116,114,117,99,116,0,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,110,101,119,32,99,97,112,97,99,105,116,111,114,10,0,0,0,114,101,108,97,116,105,118,101,32,116,111,108,101,114,97,110,99,101,32,105,115,32,110,101,103,97,116,105,118,101,0,0,98,114,101,110,116,0,0,0,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,115,111,117,114,99,101,32,99,117,114,114,101,110,116,115,10,0,118,101,99,116,111,114,32,97,110,100,32,112,101,114,109,117,116,97,116,105,111,110,32,109,117,115,116,32,98,101,32,116,104,101,32,115,97,109,101,32,108,101,110,103,116,104,0,0,102,105,114,115,116,32,105,110,100,101,120,32,105,115,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,0,0,0,100,105,115,99,104,97,114,103,101,100,32,37,108,101,32,65,109,112,101,114,101,115,46,10,0,0,0,0,0,0,0,0,114,0,0,0,0,0,0,0,98,97,100,32,110,32,61,32,37,100,32,105,110,32,114,101,97,100,95,99,111,110,100,117,99,116,111,114,115,10,0,0,46,47,118,105,101,119,95,115,111,117,114,99,101,46,99,0,46,47,115,119,97,112,95,115,111,117,114,99,101,46,99,0,46,47,115,117,98,118,101,99,116,111,114,95,115,111,117,114,99,101,46,99,0,0,0,0,112,101,114,109,117,116,97,116,105,111,110,32,108,101,110,103,116,104,32,110,32,109,117,115,116,32,98,101,32,112,111,115,105,116,105,118,101,32,105,110,116,101,103,101,114,0,0,0,46,47,105,110,105,116,95,115,111,117,114,99,101,46,99,0,46,47,99,111,112,121,95,115,111,117,114,99,101,46,99,0,102,115,111,108,118,101,114,46,99,0,0,0,0,0,0,0,99,111,110,118,101,114,103,101,110,99,101,46,99,0,0,0,102,117,110,99,116,105,111,110,32,118,97,108,117,101,32,105,115,32,110,111,116,32,102,105,110,105,116,101,0,0,0,0,46,47,112,101,114,109,117,116,101,95,115,111,117,114,99,101,46,99,0,0,0,0,0,0,112,101,114,109,117,116,97,116,105,111,110,46,99,0,0,0,105,110,105,116,46,99,0,0,99,97,110,39,116,32,97,108,108,111,99,97,116,101,32,110,101,119,32,97,114,114,98,101,122,10,0,0,0,0,0,0,46,46,47,103,115,108,47,103,115,108,95,109,97,116,114,105,120,95,105,110,116,46,104,0,46,47,115,119,97,112,95,115,111,117,114,99,101,46,99,0,46,47,115,117,98,109,97,116,114,105,120,95,115,111,117,114,99,101,46,99,0,0,0,0,46,47,114,111,119,99,111,108,95,115,111,117,114,99,101,46,99,0,0,0,0,0,0,0,99,97,110,39,116,32,105,110,105,116,105,97,108,105,122,101,32,97,114,114,98,101,122,32,108,105,115,116,10,0,0,0,119,105,114,101,32,37,50,100,58,32,37,52,101,10,0,0,102,105,114,115,116,32,114,111,119,32,105,110,100,101,120,32,105,115,32,111,117,116,32,111,102,32,114,97,110,103,101,0,80,37,100,58,37,100,45,37,100,0,0,0,0,0,0,0,114,111,119,32,105,110,100,101,120,32,105,115,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,0,0,0,0,0,99,97,110,39,116,32,98,117,105,108,100,32,112,111,108,101,32,97,116,32,37,100,10,0,109,97,116,114,105,99,101,115,32,109,117,115,116,32,104,97,118,101,32,115,97,109,101,32,100,105,109,101,110,115,105,111,110,115,0,0,0,0,0,0,46,101,108,116,0,0,0,0,98,97,100,32,99,97,98,108,101,32,110,117,109,98,101,114,32,37,100,10,0,0,0,0,46,46,47,103,115,108,47,103,115,108,95,118,101,99,116,111,114,95,105,110,116,46,104,0,102,105,114,115,116,32,105,110,100,101,120,32,111,117,116,32,111,102,32,114,97,110,103,101,0,0,0,0,0,0,0,0,10,65,118,101,114,97,103,101,32,67,114,105,116,105,99,97,108,32,67,117,114,114,101,110,116,115,44,32,80,111,108,101,115,32,37,100,32,116,111,32,37,100,10,0,0,0,0,0,32,32,78,32,32,32,115,112,97,110,32,32,32,32,32,100,84,32,32,32,84,109,97,120,10,0,0,0,0,0,0,0,78,111,32,105,110,112,117,116,32,97,118,97,105,108,97,98,108,101,32,102,111,114,32,108,116,32,115,105,109,117,108,97,116,105,111,110,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+10240);



var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        // clone it, so we can return an instance of FSStream
        var newStream = new FS.FSStream();
        for (var p in stream) {
          newStream[p] = stream[p];
        }
        stream = newStream;
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = Math.floor(idx / this.chunkSize);
          return this.getter(chunkNum)[chunkOffset];
        }
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        }
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
            // Find length
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, false);
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            var datalength = Number(xhr.getResponseHeader("Content-length"));
            var header;
            var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
            var chunkSize = 1024*1024; // Chunk size in bytes
  
            if (!hasByteServing) chunkSize = datalength;
  
            // Function to get a range from the remote URL.
            var doXHR = (function(from, to) {
              if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
              if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
              // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, false);
              if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
              // Some hints to the browser that we want binary data.
              if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
              if (xhr.overrideMimeType) {
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
              }
  
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              if (xhr.response !== undefined) {
                return new Uint8Array(xhr.response || []);
              } else {
                return intArrayFromString(xhr.responseText || '', true);
              }
            });
            var lazyArray = this;
            lazyArray.setDataGetter(function(chunkNum) {
              var start = chunkNum * chunkSize;
              var end = (chunkNum+1) * chunkSize - 1; // including this byte
              end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                lazyArray.chunks[chunkNum] = doXHR(start, end);
              }
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
              return lazyArray.chunks[chunkNum];
            });
  
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true;
        }
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  
  
  
  
  function _mkport() { throw 'TODO' }var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              // runtimeConfig gets set to true if WebSocket runtime configuration is available.
              var runtimeConfig = (Module['websocket'] && ('object' === typeof Module['websocket']));
  
              // The default value is 'ws://' the replace is needed because the compiler replaces "//" comments with '#'
              // comments without checking context, so we'd end up with ws:#, the replace swaps the "#" for "//" again.
              var url = 'ws:#'.replace('#', '//');
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['url']) {
                  url = Module['websocket']['url']; // Fetch runtime WebSocket URL config.
                }
              }
  
              if (url === 'ws://' || url === 'wss://') { // Is the supplied URL config just a prefix, if so complete it.
                url = url + addr + ':' + port;
              }
  
              // Make the WebSocket subprotocol (Sec-WebSocket-Protocol) default to binary if no configuration is set.
              var subProtocols = 'binary'; // The default value is 'binary'
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['subprotocol']) {
                  subProtocols = Module['websocket']['subprotocol']; // Fetch runtime WebSocket subprotocol config.
                }
              }
  
              // The regex trims the string (removes spaces at the beginning and end, then splits the string by
              // <any space>,<any space> into an Array. Whitespace removal is important for Websockify and ws.
              subProtocols = subProtocols.replace(/^ +| +$/g,"").split(/ *, */);
  
              // The node ws library API for specifying optional subprotocol is slightly different than the browser's.
              var opts = ENVIRONMENT_IS_NODE ? {'protocol': subProtocols.toString()} : subProtocols;
  
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _recv(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _read(fd, buf, len);
    }
  
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) {
        return 0;
      }
      var bytesRead = 0;
      var streamObj = FS.getStreamFromPtr(stream);
      if (!streamObj) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      }
      while (streamObj.ungotten.length && bytesToRead > 0) {
        HEAP8[((ptr++)|0)]=streamObj.ungotten.pop();
        bytesToRead--;
        bytesRead++;
      }
      var err = _read(streamObj.fd, ptr, bytesToRead);
      if (err == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      }
      bytesRead += err;
      if (bytesRead < bytesToRead) streamObj.eof = true;
      return Math.floor(bytesRead / size);
    }

  
  
  
  function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) return -1;
      return stream.fd;
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var fd = _fileno(stream);
      var bytesWritten = _write(fd, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  
  
   
  Module["_strlen"] = _strlen;
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }



  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr;
      var fd = _fileno(stream);
      var ret = _write(fd, _fputc.ret, 1);
      if (ret == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return -1;
      } else {
        return chr;
      }
    }

  
   
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;

  
  function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }

  function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }

  
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }

  
  function _open(path, oflag, varargs) {
      // int open(const char *path, int oflag, ...);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/open.html
      var mode = HEAP32[((varargs)>>2)];
      path = Pointer_stringify(path);
      try {
        var stream = FS.open(path, oflag, mode);
        return stream.fd;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fopen(filename, mode) {
      // FILE *fopen(const char *restrict filename, const char *restrict mode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fopen.html
      var flags;
      mode = Pointer_stringify(mode);
      if (mode[0] == 'r') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 0;
        }
      } else if (mode[0] == 'w') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 64;
        flags |= 512;
      } else if (mode[0] == 'a') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 64;
        flags |= 1024;
      } else {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return 0;
      }
      var fd = _open(filename, flags, allocate([0x1FF, 0, 0, 0], 'i32', ALLOC_STACK));  // All creation permissions.
      return fd === -1 ? 0 : FS.getPtrForStream(FS.getStream(fd));
    }

   
  Module["_strcpy"] = _strcpy;

   
  Module["_tolower"] = _tolower;

  
  function _close(fildes) {
      // int close(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/close.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        FS.close(stream);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _fsync(fildes) {
      // int fsync(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fsync.html
      var stream = FS.getStream(fildes);
      if (stream) {
        // We write directly to the file system, so there's nothing to do here.
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fclose(stream) {
      // int fclose(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fclose.html
      var fd = _fileno(stream);
      _fsync(fd);
      return _close(fd);
    }

  function _MessageBox() {
  Module['printErr']('missing function: MessageBox'); abort(-1);
  }


  
  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;

  
  function _fputs(s, stream) {
      // int fputs(const char *restrict s, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputs.html
      var fd = _fileno(stream);
      return _write(fd, s, _strlen(s));
    }function _puts(s) {
      // int puts(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/puts.html
      // NOTE: puts() always writes an extra newline.
      var stdout = HEAP32[((_stdout)>>2)];
      var ret = _fputs(s, stdout);
      if (ret < 0) {
        return ret;
      } else {
        var newlineRet = _fputc(10, stdout);
        return (newlineRet < 0) ? -1 : ret + 1;
      }
    }

  function _isspace(chr) {
      return (chr == 32) || (chr >= 9 && chr <= 13);
    }

   
  Module["_strncpy"] = _strncpy;

  
  
  function _lseek(fildes, offset, whence) {
      // off_t lseek(int fildes, off_t offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/lseek.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        return FS.llseek(stream, offset, whence);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fseek(stream, offset, whence) {
      // int fseek(FILE *stream, long offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fseek.html
      var fd = _fileno(stream);
      var ret = _lseek(fd, offset, whence);
      if (ret == -1) {
        return -1;
      }
      stream = FS.getStreamFromPtr(stream);
      stream.eof = false;
      return 0;
    }function _rewind(stream) {
      // void rewind(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/rewind.html
      _fseek(stream, 0, 0);  // SEEK_SET.
      var streamObj = FS.getStreamFromPtr(stream);
      if (streamObj) streamObj.error = false;
    }

  var _fabs=Math_abs;

  var _llvm_memset_p0i8_i64=_memset;

  function _llvm_lifetime_start() {}

  var _exp=Math_exp;

  function _llvm_lifetime_end() {}

  var _log=Math_log;

  var _sqrt=Math_sqrt;

  var _llvm_pow_f64=Math_pow;

  var _cos=Math_cos;

  var _llvm_va_start=undefined;

  function _vfprintf(s, f, va_arg) {
      return _fprintf(s, f, HEAP32[((va_arg)>>2)]);
    }

  function _llvm_va_end() {}

  function _abort() {
      Module['abort']();
    }

  function _hypot(a, b) {
       return Math.sqrt(a*a + b*b);
    }

  
  function ___fpclassify(x) {
      if (isNaN(x)) return 0;
      if (!isFinite(x)) return 1;
      if (x == 0) return 2;
      // FP_SUBNORMAL..?
      return 4;
    }var ___fpclassifyl=___fpclassify;

  function ___errno_location() {
      return ___errno_state;
    }

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

  
  function _copysign(a, b) {
      return __reallyNegative(a) === __reallyNegative(b) ? a : -a;
    }var _copysignl=_copysign;

  
  function _fmod(x, y) {
      return x % y;
    }var _fmodl=_fmod;






  var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        
        // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
        // Module['forcedAspectRatio'] = 4 / 3;
        
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'] ||
                                    canvas['msRequestPointerLock'] ||
                                    function(){};
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 document['msExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvasContainer.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        return Math.max(-1, Math.min(1, event.type === 'DOMMouseScroll' ? event.detail : -event.wheelDelta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
  
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
  
          if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
            var touch = event.touch;
            if (touch === undefined) {
              return; // the "touch" property is only defined in SDL
  
            }
            var adjustedX = touch.pageX - (scrollX + rect.left);
            var adjustedY = touch.pageY - (scrollY + rect.top);
  
            adjustedX = adjustedX * (cw / rect.width);
            adjustedY = adjustedY * (ch / rect.height);
  
            var coords = { x: adjustedX, y: adjustedY };
            
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (event.type === 'touchend' || event.type === 'touchmove') {
              Browser.lastTouches[touch.identifier] = Browser.touches[touch.identifier];
              Browser.touches[touch.identifier] = { x: adjustedX, y: adjustedY };
            } 
            return;
          }
  
          var x = event.pageX - (scrollX + rect.left);
          var y = event.pageY - (scrollY + rect.top);
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      }};
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");

 var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);

var Math_min = Math.min;
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiidd(index,a1,a2,a3,a4,a5) {
  try {
    return Module["dynCall_iiiidd"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return Module["dynCall_iiiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_ddi(index,a1,a2) {
  try {
    return Module["dynCall_ddi"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm = (function(global, env, buffer) {
  'use asm';
  var HEAP8 = new global.Int8Array(buffer);
  var HEAP16 = new global.Int16Array(buffer);
  var HEAP32 = new global.Int32Array(buffer);
  var HEAPU8 = new global.Uint8Array(buffer);
  var HEAPU16 = new global.Uint16Array(buffer);
  var HEAPU32 = new global.Uint32Array(buffer);
  var HEAPF32 = new global.Float32Array(buffer);
  var HEAPF64 = new global.Float64Array(buffer);

  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;
  var cttz_i8=env.cttz_i8|0;
  var ctlz_i8=env.ctlz_i8|0;
  var _stderr=env._stderr|0;
  var _stdout=env._stdout|0;
  var NaN=+env.NaN;
  var Infinity=+env.Infinity;

  var __THREW__ = 0;
  var threwValue = 0;
  var setjmpId = 0;
  var undef = 0;
  var tempInt = 0, tempBigInt = 0, tempBigIntP = 0, tempBigIntS = 0, tempBigIntR = 0.0, tempBigIntI = 0, tempBigIntD = 0, tempValue = 0, tempDouble = 0.0;

  var tempRet0 = 0;
  var tempRet1 = 0;
  var tempRet2 = 0;
  var tempRet3 = 0;
  var tempRet4 = 0;
  var tempRet5 = 0;
  var tempRet6 = 0;
  var tempRet7 = 0;
  var tempRet8 = 0;
  var tempRet9 = 0;
  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var abort=env.abort;
  var assert=env.assert;
  var asmPrintInt=env.asmPrintInt;
  var asmPrintFloat=env.asmPrintFloat;
  var Math_min=env.min;
  var invoke_ii=env.invoke_ii;
  var invoke_vi=env.invoke_vi;
  var invoke_iiiidd=env.invoke_iiiidd;
  var invoke_iiiiii=env.invoke_iiiiii;
  var invoke_ddi=env.invoke_ddi;
  var invoke_iiii=env.invoke_iiii;
  var invoke_v=env.invoke_v;
  var invoke_iii=env.invoke_iii;
  var invoke_viiii=env.invoke_viiii;
  var _llvm_lifetime_end=env._llvm_lifetime_end;
  var _lseek=env._lseek;
  var _snprintf=env._snprintf;
  var _llvm_va_end=env._llvm_va_end;
  var _fread=env._fread;
  var _fclose=env._fclose;
  var _abort=env._abort;
  var _fprintf=env._fprintf;
  var _sqrt=env._sqrt;
  var _printf=env._printf;
  var _close=env._close;
  var _pread=env._pread;
  var _fflush=env._fflush;
  var _fopen=env._fopen;
  var __reallyNegative=env.__reallyNegative;
  var _fputc=env._fputc;
  var _MessageBox=env._MessageBox;
  var _log=env._log;
  var _open=env._open;
  var ___setErrNo=env.___setErrNo;
  var _fwrite=env._fwrite;
  var ___fpclassify=env.___fpclassify;
  var _fseek=env._fseek;
  var _send=env._send;
  var _write=env._write;
  var _fputs=env._fputs;
  var _exit=env._exit;
  var _sprintf=env._sprintf;
  var _rewind=env._rewind;
  var _isspace=env._isspace;
  var _sysconf=env._sysconf;
  var _read=env._read;
  var _copysign=env._copysign;
  var __formatString=env.__formatString;
  var _vfprintf=env._vfprintf;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var _recv=env._recv;
  var _llvm_pow_f64=env._llvm_pow_f64;
  var _fileno=env._fileno;
  var _cos=env._cos;
  var _pwrite=env._pwrite;
  var _puts=env._puts;
  var _fsync=env._fsync;
  var _fabs=env._fabs;
  var ___errno_location=env.___errno_location;
  var _fmod=env._fmod;
  var _llvm_lifetime_start=env._llvm_lifetime_start;
  var _mkport=env._mkport;
  var _hypot=env._hypot;
  var _sbrk=env._sbrk;
  var _exp=env._exp;
  var _time=env._time;
  var __exit=env.__exit;
  var tempFloat = 0.0;

// EMSCRIPTEN_START_FUNCS
function _malloc($bytes) {
 $bytes = $bytes | 0;
 var $8 = 0, $9 = 0, $10 = 0, $11 = 0, $17 = 0, $18 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $35 = 0, $40 = 0, $45 = 0, $56 = 0, $59 = 0, $62 = 0, $64 = 0, $65 = 0, $67 = 0, $69 = 0, $71 = 0, $73 = 0, $75 = 0, $77 = 0, $79 = 0, $82 = 0, $83 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $100 = 0, $105 = 0, $106 = 0, $109 = 0, $111 = 0, $117 = 0, $120 = 0, $121 = 0, $122 = 0, $124 = 0, $125 = 0, $126 = 0, $132 = 0, $133 = 0, $_pre_phi = 0, $F4_0 = 0, $145 = 0, $150 = 0, $152 = 0, $153 = 0, $155 = 0, $157 = 0, $159 = 0, $161 = 0, $163 = 0, $165 = 0, $167 = 0, $172 = 0, $rsize_0_i = 0, $v_0_i = 0, $t_0_i = 0, $179 = 0, $183 = 0, $185 = 0, $189 = 0, $190 = 0, $192 = 0, $193 = 0, $196 = 0, $197 = 0, $201 = 0, $203 = 0, $207 = 0, $211 = 0, $215 = 0, $220 = 0, $221 = 0, $224 = 0, $225 = 0, $RP_0_i = 0, $R_0_i = 0, $227 = 0, $228 = 0, $231 = 0, $232 = 0, $R_1_i = 0, $243 = 0, $244 = 0, $257 = 0, $273 = 0, $285 = 0, $299 = 0, $303 = 0, $314 = 0, $317 = 0, $318 = 0, $319 = 0, $321 = 0, $322 = 0, $323 = 0, $329 = 0, $330 = 0, $_pre_phi_i = 0, $F1_0_i = 0, $341 = 0, $347 = 0, $348 = 0, $349 = 0, $352 = 0, $353 = 0, $360 = 0, $361 = 0, $364 = 0, $366 = 0, $369 = 0, $374 = 0, $idx_0_i = 0, $382 = 0, $390 = 0, $rst_0_i = 0, $sizebits_0_i = 0, $t_0_i116 = 0, $rsize_0_i117 = 0, $v_0_i118 = 0, $395 = 0, $396 = 0, $rsize_1_i = 0, $v_1_i = 0, $402 = 0, $405 = 0, $rst_1_i = 0, $t_1_i = 0, $rsize_2_i = 0, $v_2_i = 0, $413 = 0, $416 = 0, $421 = 0, $423 = 0, $424 = 0, $426 = 0, $428 = 0, $430 = 0, $432 = 0, $434 = 0, $436 = 0, $438 = 0, $t_2_ph_i = 0, $v_330_i = 0, $rsize_329_i = 0, $t_228_i = 0, $448 = 0, $449 = 0, $_rsize_3_i = 0, $t_2_v_3_i = 0, $451 = 0, $454 = 0, $v_3_lcssa_i = 0, $rsize_3_lcssa_i = 0, $462 = 0, $463 = 0, $466 = 0, $467 = 0, $471 = 0, $473 = 0, $477 = 0, $481 = 0, $485 = 0, $490 = 0, $491 = 0, $494 = 0, $495 = 0, $RP_0_i119 = 0, $R_0_i120 = 0, $497 = 0, $498 = 0, $501 = 0, $502 = 0, $R_1_i122 = 0, $513 = 0, $514 = 0, $527 = 0, $543 = 0, $555 = 0, $569 = 0, $573 = 0, $584 = 0, $587 = 0, $589 = 0, $590 = 0, $591 = 0, $597 = 0, $598 = 0, $_pre_phi_i128 = 0, $F5_0_i = 0, $610 = 0, $611 = 0, $618 = 0, $619 = 0, $622 = 0, $624 = 0, $627 = 0, $632 = 0, $I7_0_i = 0, $639 = 0, $646 = 0, $647 = 0, $666 = 0, $T_0_i = 0, $K12_0_i = 0, $675 = 0, $676 = 0, $692 = 0, $693 = 0, $695 = 0, $709 = 0, $nb_0 = 0, $712 = 0, $715 = 0, $716 = 0, $719 = 0, $734 = 0, $741 = 0, $744 = 0, $745 = 0, $746 = 0, $760 = 0, $769 = 0, $770 = 0, $771 = 0, $772 = 0, $773 = 0, $774 = 0, $777 = 0, $780 = 0, $781 = 0, $789 = 0, $792 = 0, $sp_0_i_i = 0, $794 = 0, $795 = 0, $798 = 0, $804 = 0, $807 = 0, $810 = 0, $811 = 0, $812 = 0, $ssize_0_i = 0, $822 = 0, $823 = 0, $827 = 0, $833 = 0, $834 = 0, $838 = 0, $841 = 0, $845 = 0, $ssize_1_i = 0, $br_0_i = 0, $tsize_0_i = 0, $tbase_0_i = 0, $847 = 0, $854 = 0, $858 = 0, $ssize_2_i = 0, $tsize_0303639_i = 0, $tsize_1_i = 0, $874 = 0, $875 = 0, $879 = 0, $881 = 0, $_tbase_1_i = 0, $tbase_245_i = 0, $tsize_244_i = 0, $884 = 0, $888 = 0, $891 = 0, $i_02_i_i = 0, $897 = 0, $899 = 0, $906 = 0, $912 = 0, $915 = 0, $sp_067_i = 0, $923 = 0, $924 = 0, $925 = 0, $930 = 0, $937 = 0, $943 = 0, $945 = 0, $951 = 0, $954 = 0, $964 = 0, $sp_160_i = 0, $966 = 0, $971 = 0, $978 = 0, $982 = 0, $989 = 0, $992 = 0, $999 = 0, $1000 = 0, $1001 = 0, $_sum_i21_i = 0, $1005 = 0, $1006 = 0, $1007 = 0, $1015 = 0, $1024 = 0, $_sum2_i23_i = 0, $1033 = 0, $1037 = 0, $1038 = 0, $1043 = 0, $1046 = 0, $1049 = 0, $1072 = 0, $_pre_phi57_i_i = 0, $1077 = 0, $1080 = 0, $1083 = 0, $1088 = 0, $1093 = 0, $1097 = 0, $_sum67_i_i = 0, $1103 = 0, $1104 = 0, $1108 = 0, $1109 = 0, $RP_0_i_i = 0, $R_0_i_i = 0, $1111 = 0, $1112 = 0, $1115 = 0, $1116 = 0, $R_1_i_i = 0, $1129 = 0, $1130 = 0, $1143 = 0, $_sum3233_i_i = 0, $1160 = 0, $1173 = 0, $qsize_0_i_i = 0, $oldfirst_0_i_i = 0, $1189 = 0, $1197 = 0, $1200 = 0, $1202 = 0, $1203 = 0, $1204 = 0, $1210 = 0, $1211 = 0, $_pre_phi_i25_i = 0, $F4_0_i_i = 0, $1223 = 0, $1224 = 0, $1231 = 0, $1232 = 0, $1235 = 0, $1237 = 0, $1240 = 0, $1245 = 0, $I7_0_i_i = 0, $1252 = 0, $1259 = 0, $1260 = 0, $1279 = 0, $T_0_i27_i = 0, $K8_0_i_i = 0, $1288 = 0, $1289 = 0, $1305 = 0, $1306 = 0, $1308 = 0, $1322 = 0, $sp_0_i_i_i = 0, $1325 = 0, $1329 = 0, $1330 = 0, $1336 = 0, $1343 = 0, $1344 = 0, $1348 = 0, $1349 = 0, $1353 = 0, $1359 = 0, $1362 = 0, $1372 = 0, $1375 = 0, $1376 = 0, $1384 = 0, $1387 = 0, $1393 = 0, $1396 = 0, $1398 = 0, $1399 = 0, $1400 = 0, $1406 = 0, $1407 = 0, $_pre_phi_i_i = 0, $F_0_i_i = 0, $1417 = 0, $1418 = 0, $1425 = 0, $1426 = 0, $1429 = 0, $1431 = 0, $1434 = 0, $1439 = 0, $I1_0_i_i = 0, $1446 = 0, $1450 = 0, $1451 = 0, $1466 = 0, $T_0_i_i = 0, $K2_0_i_i = 0, $1475 = 0, $1476 = 0, $1489 = 0, $1490 = 0, $1492 = 0, $1502 = 0, $1505 = 0, $1506 = 0, $1507 = 0, $mem_0 = 0, label = 0;
 do {
  if ($bytes >>> 0 < 245 >>> 0) {
   if ($bytes >>> 0 < 11 >>> 0) {
    $8 = 16;
   } else {
    $8 = $bytes + 11 & -8;
   }
   $9 = $8 >>> 3;
   $10 = HEAP32[3232] | 0;
   $11 = $10 >>> ($9 >>> 0);
   if (($11 & 3 | 0) != 0) {
    $17 = ($11 & 1 ^ 1) + $9 | 0;
    $18 = $17 << 1;
    $20 = 12968 + ($18 << 2) | 0;
    $21 = 12968 + ($18 + 2 << 2) | 0;
    $22 = HEAP32[$21 >> 2] | 0;
    $23 = $22 + 8 | 0;
    $24 = HEAP32[$23 >> 2] | 0;
    do {
     if (($20 | 0) == ($24 | 0)) {
      HEAP32[3232] = $10 & ~(1 << $17);
     } else {
      if ($24 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
       _abort();
       return 0;
      }
      $35 = $24 + 12 | 0;
      if ((HEAP32[$35 >> 2] | 0) == ($22 | 0)) {
       HEAP32[$35 >> 2] = $20;
       HEAP32[$21 >> 2] = $24;
       break;
      } else {
       _abort();
       return 0;
      }
     }
    } while (0);
    $40 = $17 << 3;
    HEAP32[$22 + 4 >> 2] = $40 | 3;
    $45 = $22 + ($40 | 4) | 0;
    HEAP32[$45 >> 2] = HEAP32[$45 >> 2] | 1;
    $mem_0 = $23;
    return $mem_0 | 0;
   }
   if ($8 >>> 0 > (HEAP32[3234] | 0) >>> 0) {
    if (($11 | 0) != 0) {
     $56 = 2 << $9;
     $59 = $11 << $9 & ($56 | -$56);
     $62 = ($59 & -$59) - 1 | 0;
     $64 = $62 >>> 12 & 16;
     $65 = $62 >>> ($64 >>> 0);
     $67 = $65 >>> 5 & 8;
     $69 = $65 >>> ($67 >>> 0);
     $71 = $69 >>> 2 & 4;
     $73 = $69 >>> ($71 >>> 0);
     $75 = $73 >>> 1 & 2;
     $77 = $73 >>> ($75 >>> 0);
     $79 = $77 >>> 1 & 1;
     $82 = ($67 | $64 | $71 | $75 | $79) + ($77 >>> ($79 >>> 0)) | 0;
     $83 = $82 << 1;
     $85 = 12968 + ($83 << 2) | 0;
     $86 = 12968 + ($83 + 2 << 2) | 0;
     $87 = HEAP32[$86 >> 2] | 0;
     $88 = $87 + 8 | 0;
     $89 = HEAP32[$88 >> 2] | 0;
     do {
      if (($85 | 0) == ($89 | 0)) {
       HEAP32[3232] = $10 & ~(1 << $82);
      } else {
       if ($89 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
        _abort();
        return 0;
       }
       $100 = $89 + 12 | 0;
       if ((HEAP32[$100 >> 2] | 0) == ($87 | 0)) {
        HEAP32[$100 >> 2] = $85;
        HEAP32[$86 >> 2] = $89;
        break;
       } else {
        _abort();
        return 0;
       }
      }
     } while (0);
     $105 = $82 << 3;
     $106 = $105 - $8 | 0;
     HEAP32[$87 + 4 >> 2] = $8 | 3;
     $109 = $87;
     $111 = $109 + $8 | 0;
     HEAP32[$109 + ($8 | 4) >> 2] = $106 | 1;
     HEAP32[$109 + $105 >> 2] = $106;
     $117 = HEAP32[3234] | 0;
     if (($117 | 0) != 0) {
      $120 = HEAP32[3237] | 0;
      $121 = $117 >>> 3;
      $122 = $121 << 1;
      $124 = 12968 + ($122 << 2) | 0;
      $125 = HEAP32[3232] | 0;
      $126 = 1 << $121;
      if (($125 & $126 | 0) == 0) {
       HEAP32[3232] = $125 | $126;
       $F4_0 = $124;
       $_pre_phi = 12968 + ($122 + 2 << 2) | 0;
      } else {
       $132 = 12968 + ($122 + 2 << 2) | 0;
       $133 = HEAP32[$132 >> 2] | 0;
       if ($133 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
        _abort();
        return 0;
       } else {
        $F4_0 = $133;
        $_pre_phi = $132;
       }
      }
      HEAP32[$_pre_phi >> 2] = $120;
      HEAP32[$F4_0 + 12 >> 2] = $120;
      HEAP32[$120 + 8 >> 2] = $F4_0;
      HEAP32[$120 + 12 >> 2] = $124;
     }
     HEAP32[3234] = $106;
     HEAP32[3237] = $111;
     $mem_0 = $88;
     return $mem_0 | 0;
    }
    $145 = HEAP32[3233] | 0;
    if (($145 | 0) == 0) {
     $nb_0 = $8;
    } else {
     $150 = ($145 & -$145) - 1 | 0;
     $152 = $150 >>> 12 & 16;
     $153 = $150 >>> ($152 >>> 0);
     $155 = $153 >>> 5 & 8;
     $157 = $153 >>> ($155 >>> 0);
     $159 = $157 >>> 2 & 4;
     $161 = $157 >>> ($159 >>> 0);
     $163 = $161 >>> 1 & 2;
     $165 = $161 >>> ($163 >>> 0);
     $167 = $165 >>> 1 & 1;
     $172 = HEAP32[13232 + (($155 | $152 | $159 | $163 | $167) + ($165 >>> ($167 >>> 0)) << 2) >> 2] | 0;
     $t_0_i = $172;
     $v_0_i = $172;
     $rsize_0_i = (HEAP32[$172 + 4 >> 2] & -8) - $8 | 0;
     while (1) {
      $179 = HEAP32[$t_0_i + 16 >> 2] | 0;
      if (($179 | 0) == 0) {
       $183 = HEAP32[$t_0_i + 20 >> 2] | 0;
       if (($183 | 0) == 0) {
        break;
       } else {
        $185 = $183;
       }
      } else {
       $185 = $179;
      }
      $189 = (HEAP32[$185 + 4 >> 2] & -8) - $8 | 0;
      $190 = $189 >>> 0 < $rsize_0_i >>> 0;
      $t_0_i = $185;
      $v_0_i = $190 ? $185 : $v_0_i;
      $rsize_0_i = $190 ? $189 : $rsize_0_i;
     }
     $192 = $v_0_i;
     $193 = HEAP32[3236] | 0;
     if ($192 >>> 0 < $193 >>> 0) {
      _abort();
      return 0;
     }
     $196 = $192 + $8 | 0;
     $197 = $196;
     if (!($192 >>> 0 < $196 >>> 0)) {
      _abort();
      return 0;
     }
     $201 = HEAP32[$v_0_i + 24 >> 2] | 0;
     $203 = HEAP32[$v_0_i + 12 >> 2] | 0;
     do {
      if (($203 | 0) == ($v_0_i | 0)) {
       $220 = $v_0_i + 20 | 0;
       $221 = HEAP32[$220 >> 2] | 0;
       if (($221 | 0) == 0) {
        $224 = $v_0_i + 16 | 0;
        $225 = HEAP32[$224 >> 2] | 0;
        if (($225 | 0) == 0) {
         $R_1_i = 0;
         break;
        } else {
         $R_0_i = $225;
         $RP_0_i = $224;
        }
       } else {
        $R_0_i = $221;
        $RP_0_i = $220;
       }
       while (1) {
        $227 = $R_0_i + 20 | 0;
        $228 = HEAP32[$227 >> 2] | 0;
        if (($228 | 0) != 0) {
         $R_0_i = $228;
         $RP_0_i = $227;
         continue;
        }
        $231 = $R_0_i + 16 | 0;
        $232 = HEAP32[$231 >> 2] | 0;
        if (($232 | 0) == 0) {
         break;
        } else {
         $R_0_i = $232;
         $RP_0_i = $231;
        }
       }
       if ($RP_0_i >>> 0 < $193 >>> 0) {
        _abort();
        return 0;
       } else {
        HEAP32[$RP_0_i >> 2] = 0;
        $R_1_i = $R_0_i;
        break;
       }
      } else {
       $207 = HEAP32[$v_0_i + 8 >> 2] | 0;
       if ($207 >>> 0 < $193 >>> 0) {
        _abort();
        return 0;
       }
       $211 = $207 + 12 | 0;
       if ((HEAP32[$211 >> 2] | 0) != ($v_0_i | 0)) {
        _abort();
        return 0;
       }
       $215 = $203 + 8 | 0;
       if ((HEAP32[$215 >> 2] | 0) == ($v_0_i | 0)) {
        HEAP32[$211 >> 2] = $203;
        HEAP32[$215 >> 2] = $207;
        $R_1_i = $203;
        break;
       } else {
        _abort();
        return 0;
       }
      }
     } while (0);
     do {
      if (($201 | 0) != 0) {
       $243 = HEAP32[$v_0_i + 28 >> 2] | 0;
       $244 = 13232 + ($243 << 2) | 0;
       if (($v_0_i | 0) == (HEAP32[$244 >> 2] | 0)) {
        HEAP32[$244 >> 2] = $R_1_i;
        if (($R_1_i | 0) == 0) {
         HEAP32[3233] = HEAP32[3233] & ~(1 << $243);
         break;
        }
       } else {
        if ($201 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
         _abort();
         return 0;
        }
        $257 = $201 + 16 | 0;
        if ((HEAP32[$257 >> 2] | 0) == ($v_0_i | 0)) {
         HEAP32[$257 >> 2] = $R_1_i;
        } else {
         HEAP32[$201 + 20 >> 2] = $R_1_i;
        }
        if (($R_1_i | 0) == 0) {
         break;
        }
       }
       if ($R_1_i >>> 0 < (HEAP32[3236] | 0) >>> 0) {
        _abort();
        return 0;
       }
       HEAP32[$R_1_i + 24 >> 2] = $201;
       $273 = HEAP32[$v_0_i + 16 >> 2] | 0;
       do {
        if (($273 | 0) != 0) {
         if ($273 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
          _abort();
          return 0;
         } else {
          HEAP32[$R_1_i + 16 >> 2] = $273;
          HEAP32[$273 + 24 >> 2] = $R_1_i;
          break;
         }
        }
       } while (0);
       $285 = HEAP32[$v_0_i + 20 >> 2] | 0;
       if (($285 | 0) != 0) {
        if ($285 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
         _abort();
         return 0;
        } else {
         HEAP32[$R_1_i + 20 >> 2] = $285;
         HEAP32[$285 + 24 >> 2] = $R_1_i;
         break;
        }
       }
      }
     } while (0);
     if ($rsize_0_i >>> 0 < 16 >>> 0) {
      $299 = $rsize_0_i + $8 | 0;
      HEAP32[$v_0_i + 4 >> 2] = $299 | 3;
      $303 = $192 + ($299 + 4) | 0;
      HEAP32[$303 >> 2] = HEAP32[$303 >> 2] | 1;
     } else {
      HEAP32[$v_0_i + 4 >> 2] = $8 | 3;
      HEAP32[$192 + ($8 | 4) >> 2] = $rsize_0_i | 1;
      HEAP32[$192 + ($rsize_0_i + $8) >> 2] = $rsize_0_i;
      $314 = HEAP32[3234] | 0;
      if (($314 | 0) != 0) {
       $317 = HEAP32[3237] | 0;
       $318 = $314 >>> 3;
       $319 = $318 << 1;
       $321 = 12968 + ($319 << 2) | 0;
       $322 = HEAP32[3232] | 0;
       $323 = 1 << $318;
       if (($322 & $323 | 0) == 0) {
        HEAP32[3232] = $322 | $323;
        $F1_0_i = $321;
        $_pre_phi_i = 12968 + ($319 + 2 << 2) | 0;
       } else {
        $329 = 12968 + ($319 + 2 << 2) | 0;
        $330 = HEAP32[$329 >> 2] | 0;
        if ($330 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
         _abort();
         return 0;
        } else {
         $F1_0_i = $330;
         $_pre_phi_i = $329;
        }
       }
       HEAP32[$_pre_phi_i >> 2] = $317;
       HEAP32[$F1_0_i + 12 >> 2] = $317;
       HEAP32[$317 + 8 >> 2] = $F1_0_i;
       HEAP32[$317 + 12 >> 2] = $321;
      }
      HEAP32[3234] = $rsize_0_i;
      HEAP32[3237] = $197;
     }
     $341 = $v_0_i + 8 | 0;
     if (($341 | 0) == 0) {
      $nb_0 = $8;
     } else {
      $mem_0 = $341;
      return $mem_0 | 0;
     }
    }
   } else {
    $nb_0 = $8;
   }
  } else {
   if ($bytes >>> 0 > 4294967231 >>> 0) {
    $nb_0 = -1;
   } else {
    $347 = $bytes + 11 | 0;
    $348 = $347 & -8;
    $349 = HEAP32[3233] | 0;
    if (($349 | 0) == 0) {
     $nb_0 = $348;
    } else {
     $352 = -$348 | 0;
     $353 = $347 >>> 8;
     if (($353 | 0) == 0) {
      $idx_0_i = 0;
     } else {
      if ($348 >>> 0 > 16777215 >>> 0) {
       $idx_0_i = 31;
      } else {
       $360 = ($353 + 1048320 | 0) >>> 16 & 8;
       $361 = $353 << $360;
       $364 = ($361 + 520192 | 0) >>> 16 & 4;
       $366 = $361 << $364;
       $369 = ($366 + 245760 | 0) >>> 16 & 2;
       $374 = 14 - ($364 | $360 | $369) + ($366 << $369 >>> 15) | 0;
       $idx_0_i = $348 >>> (($374 + 7 | 0) >>> 0) & 1 | $374 << 1;
      }
     }
     $382 = HEAP32[13232 + ($idx_0_i << 2) >> 2] | 0;
     L126 : do {
      if (($382 | 0) == 0) {
       $v_2_i = 0;
       $rsize_2_i = $352;
       $t_1_i = 0;
      } else {
       if (($idx_0_i | 0) == 31) {
        $390 = 0;
       } else {
        $390 = 25 - ($idx_0_i >>> 1) | 0;
       }
       $v_0_i118 = 0;
       $rsize_0_i117 = $352;
       $t_0_i116 = $382;
       $sizebits_0_i = $348 << $390;
       $rst_0_i = 0;
       while (1) {
        $395 = HEAP32[$t_0_i116 + 4 >> 2] & -8;
        $396 = $395 - $348 | 0;
        if ($396 >>> 0 < $rsize_0_i117 >>> 0) {
         if (($395 | 0) == ($348 | 0)) {
          $v_2_i = $t_0_i116;
          $rsize_2_i = $396;
          $t_1_i = $t_0_i116;
          break L126;
         } else {
          $v_1_i = $t_0_i116;
          $rsize_1_i = $396;
         }
        } else {
         $v_1_i = $v_0_i118;
         $rsize_1_i = $rsize_0_i117;
        }
        $402 = HEAP32[$t_0_i116 + 20 >> 2] | 0;
        $405 = HEAP32[$t_0_i116 + 16 + ($sizebits_0_i >>> 31 << 2) >> 2] | 0;
        $rst_1_i = ($402 | 0) == 0 | ($402 | 0) == ($405 | 0) ? $rst_0_i : $402;
        if (($405 | 0) == 0) {
         $v_2_i = $v_1_i;
         $rsize_2_i = $rsize_1_i;
         $t_1_i = $rst_1_i;
         break;
        } else {
         $v_0_i118 = $v_1_i;
         $rsize_0_i117 = $rsize_1_i;
         $t_0_i116 = $405;
         $sizebits_0_i = $sizebits_0_i << 1;
         $rst_0_i = $rst_1_i;
        }
       }
      }
     } while (0);
     if (($t_1_i | 0) == 0 & ($v_2_i | 0) == 0) {
      $413 = 2 << $idx_0_i;
      $416 = $349 & ($413 | -$413);
      if (($416 | 0) == 0) {
       $nb_0 = $348;
       break;
      }
      $421 = ($416 & -$416) - 1 | 0;
      $423 = $421 >>> 12 & 16;
      $424 = $421 >>> ($423 >>> 0);
      $426 = $424 >>> 5 & 8;
      $428 = $424 >>> ($426 >>> 0);
      $430 = $428 >>> 2 & 4;
      $432 = $428 >>> ($430 >>> 0);
      $434 = $432 >>> 1 & 2;
      $436 = $432 >>> ($434 >>> 0);
      $438 = $436 >>> 1 & 1;
      $t_2_ph_i = HEAP32[13232 + (($426 | $423 | $430 | $434 | $438) + ($436 >>> ($438 >>> 0)) << 2) >> 2] | 0;
     } else {
      $t_2_ph_i = $t_1_i;
     }
     if (($t_2_ph_i | 0) == 0) {
      $rsize_3_lcssa_i = $rsize_2_i;
      $v_3_lcssa_i = $v_2_i;
     } else {
      $t_228_i = $t_2_ph_i;
      $rsize_329_i = $rsize_2_i;
      $v_330_i = $v_2_i;
      while (1) {
       $448 = (HEAP32[$t_228_i + 4 >> 2] & -8) - $348 | 0;
       $449 = $448 >>> 0 < $rsize_329_i >>> 0;
       $_rsize_3_i = $449 ? $448 : $rsize_329_i;
       $t_2_v_3_i = $449 ? $t_228_i : $v_330_i;
       $451 = HEAP32[$t_228_i + 16 >> 2] | 0;
       if (($451 | 0) != 0) {
        $t_228_i = $451;
        $rsize_329_i = $_rsize_3_i;
        $v_330_i = $t_2_v_3_i;
        continue;
       }
       $454 = HEAP32[$t_228_i + 20 >> 2] | 0;
       if (($454 | 0) == 0) {
        $rsize_3_lcssa_i = $_rsize_3_i;
        $v_3_lcssa_i = $t_2_v_3_i;
        break;
       } else {
        $t_228_i = $454;
        $rsize_329_i = $_rsize_3_i;
        $v_330_i = $t_2_v_3_i;
       }
      }
     }
     if (($v_3_lcssa_i | 0) == 0) {
      $nb_0 = $348;
     } else {
      if ($rsize_3_lcssa_i >>> 0 < ((HEAP32[3234] | 0) - $348 | 0) >>> 0) {
       $462 = $v_3_lcssa_i;
       $463 = HEAP32[3236] | 0;
       if ($462 >>> 0 < $463 >>> 0) {
        _abort();
        return 0;
       }
       $466 = $462 + $348 | 0;
       $467 = $466;
       if (!($462 >>> 0 < $466 >>> 0)) {
        _abort();
        return 0;
       }
       $471 = HEAP32[$v_3_lcssa_i + 24 >> 2] | 0;
       $473 = HEAP32[$v_3_lcssa_i + 12 >> 2] | 0;
       do {
        if (($473 | 0) == ($v_3_lcssa_i | 0)) {
         $490 = $v_3_lcssa_i + 20 | 0;
         $491 = HEAP32[$490 >> 2] | 0;
         if (($491 | 0) == 0) {
          $494 = $v_3_lcssa_i + 16 | 0;
          $495 = HEAP32[$494 >> 2] | 0;
          if (($495 | 0) == 0) {
           $R_1_i122 = 0;
           break;
          } else {
           $R_0_i120 = $495;
           $RP_0_i119 = $494;
          }
         } else {
          $R_0_i120 = $491;
          $RP_0_i119 = $490;
         }
         while (1) {
          $497 = $R_0_i120 + 20 | 0;
          $498 = HEAP32[$497 >> 2] | 0;
          if (($498 | 0) != 0) {
           $R_0_i120 = $498;
           $RP_0_i119 = $497;
           continue;
          }
          $501 = $R_0_i120 + 16 | 0;
          $502 = HEAP32[$501 >> 2] | 0;
          if (($502 | 0) == 0) {
           break;
          } else {
           $R_0_i120 = $502;
           $RP_0_i119 = $501;
          }
         }
         if ($RP_0_i119 >>> 0 < $463 >>> 0) {
          _abort();
          return 0;
         } else {
          HEAP32[$RP_0_i119 >> 2] = 0;
          $R_1_i122 = $R_0_i120;
          break;
         }
        } else {
         $477 = HEAP32[$v_3_lcssa_i + 8 >> 2] | 0;
         if ($477 >>> 0 < $463 >>> 0) {
          _abort();
          return 0;
         }
         $481 = $477 + 12 | 0;
         if ((HEAP32[$481 >> 2] | 0) != ($v_3_lcssa_i | 0)) {
          _abort();
          return 0;
         }
         $485 = $473 + 8 | 0;
         if ((HEAP32[$485 >> 2] | 0) == ($v_3_lcssa_i | 0)) {
          HEAP32[$481 >> 2] = $473;
          HEAP32[$485 >> 2] = $477;
          $R_1_i122 = $473;
          break;
         } else {
          _abort();
          return 0;
         }
        }
       } while (0);
       do {
        if (($471 | 0) != 0) {
         $513 = HEAP32[$v_3_lcssa_i + 28 >> 2] | 0;
         $514 = 13232 + ($513 << 2) | 0;
         if (($v_3_lcssa_i | 0) == (HEAP32[$514 >> 2] | 0)) {
          HEAP32[$514 >> 2] = $R_1_i122;
          if (($R_1_i122 | 0) == 0) {
           HEAP32[3233] = HEAP32[3233] & ~(1 << $513);
           break;
          }
         } else {
          if ($471 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
           _abort();
           return 0;
          }
          $527 = $471 + 16 | 0;
          if ((HEAP32[$527 >> 2] | 0) == ($v_3_lcssa_i | 0)) {
           HEAP32[$527 >> 2] = $R_1_i122;
          } else {
           HEAP32[$471 + 20 >> 2] = $R_1_i122;
          }
          if (($R_1_i122 | 0) == 0) {
           break;
          }
         }
         if ($R_1_i122 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
          _abort();
          return 0;
         }
         HEAP32[$R_1_i122 + 24 >> 2] = $471;
         $543 = HEAP32[$v_3_lcssa_i + 16 >> 2] | 0;
         do {
          if (($543 | 0) != 0) {
           if ($543 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
            _abort();
            return 0;
           } else {
            HEAP32[$R_1_i122 + 16 >> 2] = $543;
            HEAP32[$543 + 24 >> 2] = $R_1_i122;
            break;
           }
          }
         } while (0);
         $555 = HEAP32[$v_3_lcssa_i + 20 >> 2] | 0;
         if (($555 | 0) != 0) {
          if ($555 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
           _abort();
           return 0;
          } else {
           HEAP32[$R_1_i122 + 20 >> 2] = $555;
           HEAP32[$555 + 24 >> 2] = $R_1_i122;
           break;
          }
         }
        }
       } while (0);
       do {
        if ($rsize_3_lcssa_i >>> 0 < 16 >>> 0) {
         $569 = $rsize_3_lcssa_i + $348 | 0;
         HEAP32[$v_3_lcssa_i + 4 >> 2] = $569 | 3;
         $573 = $462 + ($569 + 4) | 0;
         HEAP32[$573 >> 2] = HEAP32[$573 >> 2] | 1;
        } else {
         HEAP32[$v_3_lcssa_i + 4 >> 2] = $348 | 3;
         HEAP32[$462 + ($348 | 4) >> 2] = $rsize_3_lcssa_i | 1;
         HEAP32[$462 + ($rsize_3_lcssa_i + $348) >> 2] = $rsize_3_lcssa_i;
         $584 = $rsize_3_lcssa_i >>> 3;
         if ($rsize_3_lcssa_i >>> 0 < 256 >>> 0) {
          $587 = $584 << 1;
          $589 = 12968 + ($587 << 2) | 0;
          $590 = HEAP32[3232] | 0;
          $591 = 1 << $584;
          if (($590 & $591 | 0) == 0) {
           HEAP32[3232] = $590 | $591;
           $F5_0_i = $589;
           $_pre_phi_i128 = 12968 + ($587 + 2 << 2) | 0;
          } else {
           $597 = 12968 + ($587 + 2 << 2) | 0;
           $598 = HEAP32[$597 >> 2] | 0;
           if ($598 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
            _abort();
            return 0;
           } else {
            $F5_0_i = $598;
            $_pre_phi_i128 = $597;
           }
          }
          HEAP32[$_pre_phi_i128 >> 2] = $467;
          HEAP32[$F5_0_i + 12 >> 2] = $467;
          HEAP32[$462 + ($348 + 8) >> 2] = $F5_0_i;
          HEAP32[$462 + ($348 + 12) >> 2] = $589;
          break;
         }
         $610 = $466;
         $611 = $rsize_3_lcssa_i >>> 8;
         if (($611 | 0) == 0) {
          $I7_0_i = 0;
         } else {
          if ($rsize_3_lcssa_i >>> 0 > 16777215 >>> 0) {
           $I7_0_i = 31;
          } else {
           $618 = ($611 + 1048320 | 0) >>> 16 & 8;
           $619 = $611 << $618;
           $622 = ($619 + 520192 | 0) >>> 16 & 4;
           $624 = $619 << $622;
           $627 = ($624 + 245760 | 0) >>> 16 & 2;
           $632 = 14 - ($622 | $618 | $627) + ($624 << $627 >>> 15) | 0;
           $I7_0_i = $rsize_3_lcssa_i >>> (($632 + 7 | 0) >>> 0) & 1 | $632 << 1;
          }
         }
         $639 = 13232 + ($I7_0_i << 2) | 0;
         HEAP32[$462 + ($348 + 28) >> 2] = $I7_0_i;
         HEAP32[$462 + ($348 + 20) >> 2] = 0;
         HEAP32[$462 + ($348 + 16) >> 2] = 0;
         $646 = HEAP32[3233] | 0;
         $647 = 1 << $I7_0_i;
         if (($646 & $647 | 0) == 0) {
          HEAP32[3233] = $646 | $647;
          HEAP32[$639 >> 2] = $610;
          HEAP32[$462 + ($348 + 24) >> 2] = $639;
          HEAP32[$462 + ($348 + 12) >> 2] = $610;
          HEAP32[$462 + ($348 + 8) >> 2] = $610;
          break;
         }
         if (($I7_0_i | 0) == 31) {
          $666 = 0;
         } else {
          $666 = 25 - ($I7_0_i >>> 1) | 0;
         }
         $K12_0_i = $rsize_3_lcssa_i << $666;
         $T_0_i = HEAP32[$639 >> 2] | 0;
         while (1) {
          if ((HEAP32[$T_0_i + 4 >> 2] & -8 | 0) == ($rsize_3_lcssa_i | 0)) {
           break;
          }
          $675 = $T_0_i + 16 + ($K12_0_i >>> 31 << 2) | 0;
          $676 = HEAP32[$675 >> 2] | 0;
          if (($676 | 0) == 0) {
           label = 151;
           break;
          } else {
           $K12_0_i = $K12_0_i << 1;
           $T_0_i = $676;
          }
         }
         if ((label | 0) == 151) {
          if ($675 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
           _abort();
           return 0;
          } else {
           HEAP32[$675 >> 2] = $610;
           HEAP32[$462 + ($348 + 24) >> 2] = $T_0_i;
           HEAP32[$462 + ($348 + 12) >> 2] = $610;
           HEAP32[$462 + ($348 + 8) >> 2] = $610;
           break;
          }
         }
         $692 = $T_0_i + 8 | 0;
         $693 = HEAP32[$692 >> 2] | 0;
         $695 = HEAP32[3236] | 0;
         if ($T_0_i >>> 0 < $695 >>> 0) {
          _abort();
          return 0;
         }
         if ($693 >>> 0 < $695 >>> 0) {
          _abort();
          return 0;
         } else {
          HEAP32[$693 + 12 >> 2] = $610;
          HEAP32[$692 >> 2] = $610;
          HEAP32[$462 + ($348 + 8) >> 2] = $693;
          HEAP32[$462 + ($348 + 12) >> 2] = $T_0_i;
          HEAP32[$462 + ($348 + 24) >> 2] = 0;
          break;
         }
        }
       } while (0);
       $709 = $v_3_lcssa_i + 8 | 0;
       if (($709 | 0) == 0) {
        $nb_0 = $348;
       } else {
        $mem_0 = $709;
        return $mem_0 | 0;
       }
      } else {
       $nb_0 = $348;
      }
     }
    }
   }
  }
 } while (0);
 $712 = HEAP32[3234] | 0;
 if (!($nb_0 >>> 0 > $712 >>> 0)) {
  $715 = $712 - $nb_0 | 0;
  $716 = HEAP32[3237] | 0;
  if ($715 >>> 0 > 15 >>> 0) {
   $719 = $716;
   HEAP32[3237] = $719 + $nb_0;
   HEAP32[3234] = $715;
   HEAP32[$719 + ($nb_0 + 4) >> 2] = $715 | 1;
   HEAP32[$719 + $712 >> 2] = $715;
   HEAP32[$716 + 4 >> 2] = $nb_0 | 3;
  } else {
   HEAP32[3234] = 0;
   HEAP32[3237] = 0;
   HEAP32[$716 + 4 >> 2] = $712 | 3;
   $734 = $716 + ($712 + 4) | 0;
   HEAP32[$734 >> 2] = HEAP32[$734 >> 2] | 1;
  }
  $mem_0 = $716 + 8 | 0;
  return $mem_0 | 0;
 }
 $741 = HEAP32[3235] | 0;
 if ($nb_0 >>> 0 < $741 >>> 0) {
  $744 = $741 - $nb_0 | 0;
  HEAP32[3235] = $744;
  $745 = HEAP32[3238] | 0;
  $746 = $745;
  HEAP32[3238] = $746 + $nb_0;
  HEAP32[$746 + ($nb_0 + 4) >> 2] = $744 | 1;
  HEAP32[$745 + 4 >> 2] = $nb_0 | 3;
  $mem_0 = $745 + 8 | 0;
  return $mem_0 | 0;
 }
 do {
  if ((HEAP32[3148] | 0) == 0) {
   $760 = _sysconf(30) | 0;
   if (($760 - 1 & $760 | 0) == 0) {
    HEAP32[3150] = $760;
    HEAP32[3149] = $760;
    HEAP32[3151] = -1;
    HEAP32[3152] = -1;
    HEAP32[3153] = 0;
    HEAP32[3343] = 0;
    HEAP32[3148] = (_time(0) | 0) & -16 ^ 1431655768;
    break;
   } else {
    _abort();
    return 0;
   }
  }
 } while (0);
 $769 = $nb_0 + 48 | 0;
 $770 = HEAP32[3150] | 0;
 $771 = $nb_0 + 47 | 0;
 $772 = $770 + $771 | 0;
 $773 = -$770 | 0;
 $774 = $772 & $773;
 if (!($774 >>> 0 > $nb_0 >>> 0)) {
  $mem_0 = 0;
  return $mem_0 | 0;
 }
 $777 = HEAP32[3342] | 0;
 if (($777 | 0) != 0) {
  $780 = HEAP32[3340] | 0;
  $781 = $780 + $774 | 0;
  if ($781 >>> 0 <= $780 >>> 0 | $781 >>> 0 > $777 >>> 0) {
   $mem_0 = 0;
   return $mem_0 | 0;
  }
 }
 L268 : do {
  if ((HEAP32[3343] & 4 | 0) == 0) {
   $789 = HEAP32[3238] | 0;
   L270 : do {
    if (($789 | 0) == 0) {
     label = 181;
    } else {
     $792 = $789;
     $sp_0_i_i = 13376;
     while (1) {
      $794 = $sp_0_i_i | 0;
      $795 = HEAP32[$794 >> 2] | 0;
      if (!($795 >>> 0 > $792 >>> 0)) {
       $798 = $sp_0_i_i + 4 | 0;
       if (($795 + (HEAP32[$798 >> 2] | 0) | 0) >>> 0 > $792 >>> 0) {
        break;
       }
      }
      $804 = HEAP32[$sp_0_i_i + 8 >> 2] | 0;
      if (($804 | 0) == 0) {
       label = 181;
       break L270;
      } else {
       $sp_0_i_i = $804;
      }
     }
     if (($sp_0_i_i | 0) == 0) {
      label = 181;
     } else {
      $838 = $772 - (HEAP32[3235] | 0) & $773;
      if ($838 >>> 0 < 2147483647 >>> 0) {
       $841 = _sbrk($838 | 0) | 0;
       $845 = ($841 | 0) == ((HEAP32[$794 >> 2] | 0) + (HEAP32[$798 >> 2] | 0) | 0);
       $tbase_0_i = $845 ? $841 : -1;
       $tsize_0_i = $845 ? $838 : 0;
       $br_0_i = $841;
       $ssize_1_i = $838;
       label = 190;
      } else {
       $tsize_0303639_i = 0;
      }
     }
    }
   } while (0);
   do {
    if ((label | 0) == 181) {
     $807 = _sbrk(0) | 0;
     if (($807 | 0) == -1) {
      $tsize_0303639_i = 0;
     } else {
      $810 = $807;
      $811 = HEAP32[3149] | 0;
      $812 = $811 - 1 | 0;
      if (($812 & $810 | 0) == 0) {
       $ssize_0_i = $774;
      } else {
       $ssize_0_i = $774 - $810 + ($812 + $810 & -$811) | 0;
      }
      $822 = HEAP32[3340] | 0;
      $823 = $822 + $ssize_0_i | 0;
      if ($ssize_0_i >>> 0 > $nb_0 >>> 0 & $ssize_0_i >>> 0 < 2147483647 >>> 0) {
       $827 = HEAP32[3342] | 0;
       if (($827 | 0) != 0) {
        if ($823 >>> 0 <= $822 >>> 0 | $823 >>> 0 > $827 >>> 0) {
         $tsize_0303639_i = 0;
         break;
        }
       }
       $833 = _sbrk($ssize_0_i | 0) | 0;
       $834 = ($833 | 0) == ($807 | 0);
       $tbase_0_i = $834 ? $807 : -1;
       $tsize_0_i = $834 ? $ssize_0_i : 0;
       $br_0_i = $833;
       $ssize_1_i = $ssize_0_i;
       label = 190;
      } else {
       $tsize_0303639_i = 0;
      }
     }
    }
   } while (0);
   L290 : do {
    if ((label | 0) == 190) {
     $847 = -$ssize_1_i | 0;
     if (!(($tbase_0_i | 0) == -1)) {
      $tsize_244_i = $tsize_0_i;
      $tbase_245_i = $tbase_0_i;
      label = 201;
      break L268;
     }
     do {
      if (($br_0_i | 0) != -1 & $ssize_1_i >>> 0 < 2147483647 >>> 0 & $ssize_1_i >>> 0 < $769 >>> 0) {
       $854 = HEAP32[3150] | 0;
       $858 = $771 - $ssize_1_i + $854 & -$854;
       if ($858 >>> 0 < 2147483647 >>> 0) {
        if ((_sbrk($858 | 0) | 0) == -1) {
         _sbrk($847 | 0) | 0;
         $tsize_0303639_i = $tsize_0_i;
         break L290;
        } else {
         $ssize_2_i = $858 + $ssize_1_i | 0;
         break;
        }
       } else {
        $ssize_2_i = $ssize_1_i;
       }
      } else {
       $ssize_2_i = $ssize_1_i;
      }
     } while (0);
     if (($br_0_i | 0) == -1) {
      $tsize_0303639_i = $tsize_0_i;
     } else {
      $tsize_244_i = $ssize_2_i;
      $tbase_245_i = $br_0_i;
      label = 201;
      break L268;
     }
    }
   } while (0);
   HEAP32[3343] = HEAP32[3343] | 4;
   $tsize_1_i = $tsize_0303639_i;
   label = 198;
  } else {
   $tsize_1_i = 0;
   label = 198;
  }
 } while (0);
 if ((label | 0) == 198) {
  if ($774 >>> 0 < 2147483647 >>> 0) {
   $874 = _sbrk($774 | 0) | 0;
   $875 = _sbrk(0) | 0;
   if (($875 | 0) != -1 & ($874 | 0) != -1 & $874 >>> 0 < $875 >>> 0) {
    $879 = $875 - $874 | 0;
    $881 = $879 >>> 0 > ($nb_0 + 40 | 0) >>> 0;
    $_tbase_1_i = $881 ? $874 : -1;
    if (!(($_tbase_1_i | 0) == -1)) {
     $tsize_244_i = $881 ? $879 : $tsize_1_i;
     $tbase_245_i = $_tbase_1_i;
     label = 201;
    }
   }
  }
 }
 if ((label | 0) == 201) {
  $884 = (HEAP32[3340] | 0) + $tsize_244_i | 0;
  HEAP32[3340] = $884;
  if ($884 >>> 0 > (HEAP32[3341] | 0) >>> 0) {
   HEAP32[3341] = $884;
  }
  $888 = HEAP32[3238] | 0;
  do {
   if (($888 | 0) == 0) {
    $891 = HEAP32[3236] | 0;
    if (($891 | 0) == 0 | $tbase_245_i >>> 0 < $891 >>> 0) {
     HEAP32[3236] = $tbase_245_i;
    }
    HEAP32[3344] = $tbase_245_i;
    HEAP32[3345] = $tsize_244_i;
    HEAP32[3347] = 0;
    HEAP32[3241] = HEAP32[3148];
    HEAP32[3240] = -1;
    $i_02_i_i = 0;
    do {
     $897 = $i_02_i_i << 1;
     $899 = 12968 + ($897 << 2) | 0;
     HEAP32[12968 + ($897 + 3 << 2) >> 2] = $899;
     HEAP32[12968 + ($897 + 2 << 2) >> 2] = $899;
     $i_02_i_i = $i_02_i_i + 1 | 0;
    } while ($i_02_i_i >>> 0 < 32 >>> 0);
    $906 = $tbase_245_i + 8 | 0;
    if (($906 & 7 | 0) == 0) {
     $912 = 0;
    } else {
     $912 = -$906 & 7;
    }
    $915 = $tsize_244_i - 40 - $912 | 0;
    HEAP32[3238] = $tbase_245_i + $912;
    HEAP32[3235] = $915;
    HEAP32[$tbase_245_i + ($912 + 4) >> 2] = $915 | 1;
    HEAP32[$tbase_245_i + ($tsize_244_i - 36) >> 2] = 40;
    HEAP32[3239] = HEAP32[3152];
   } else {
    $sp_067_i = 13376;
    while (1) {
     $923 = HEAP32[$sp_067_i >> 2] | 0;
     $924 = $sp_067_i + 4 | 0;
     $925 = HEAP32[$924 >> 2] | 0;
     if (($tbase_245_i | 0) == ($923 + $925 | 0)) {
      label = 213;
      break;
     }
     $930 = HEAP32[$sp_067_i + 8 >> 2] | 0;
     if (($930 | 0) == 0) {
      break;
     } else {
      $sp_067_i = $930;
     }
    }
    if ((label | 0) == 213) {
     if ((HEAP32[$sp_067_i + 12 >> 2] & 8 | 0) == 0) {
      $937 = $888;
      if ($937 >>> 0 >= $923 >>> 0 & $937 >>> 0 < $tbase_245_i >>> 0) {
       HEAP32[$924 >> 2] = $925 + $tsize_244_i;
       $943 = (HEAP32[3235] | 0) + $tsize_244_i | 0;
       $945 = $888 + 8 | 0;
       if (($945 & 7 | 0) == 0) {
        $951 = 0;
       } else {
        $951 = -$945 & 7;
       }
       $954 = $943 - $951 | 0;
       HEAP32[3238] = $937 + $951;
       HEAP32[3235] = $954;
       HEAP32[$937 + ($951 + 4) >> 2] = $954 | 1;
       HEAP32[$937 + ($943 + 4) >> 2] = 40;
       HEAP32[3239] = HEAP32[3152];
       break;
      }
     }
    }
    if ($tbase_245_i >>> 0 < (HEAP32[3236] | 0) >>> 0) {
     HEAP32[3236] = $tbase_245_i;
    }
    $964 = $tbase_245_i + $tsize_244_i | 0;
    $sp_160_i = 13376;
    while (1) {
     $966 = $sp_160_i | 0;
     if ((HEAP32[$966 >> 2] | 0) == ($964 | 0)) {
      label = 223;
      break;
     }
     $971 = HEAP32[$sp_160_i + 8 >> 2] | 0;
     if (($971 | 0) == 0) {
      break;
     } else {
      $sp_160_i = $971;
     }
    }
    if ((label | 0) == 223) {
     if ((HEAP32[$sp_160_i + 12 >> 2] & 8 | 0) == 0) {
      HEAP32[$966 >> 2] = $tbase_245_i;
      $978 = $sp_160_i + 4 | 0;
      HEAP32[$978 >> 2] = (HEAP32[$978 >> 2] | 0) + $tsize_244_i;
      $982 = $tbase_245_i + 8 | 0;
      if (($982 & 7 | 0) == 0) {
       $989 = 0;
      } else {
       $989 = -$982 & 7;
      }
      $992 = $tbase_245_i + ($tsize_244_i + 8) | 0;
      if (($992 & 7 | 0) == 0) {
       $999 = 0;
      } else {
       $999 = -$992 & 7;
      }
      $1000 = $tbase_245_i + ($999 + $tsize_244_i) | 0;
      $1001 = $1000;
      $_sum_i21_i = $989 + $nb_0 | 0;
      $1005 = $tbase_245_i + $_sum_i21_i | 0;
      $1006 = $1005;
      $1007 = $1000 - ($tbase_245_i + $989) - $nb_0 | 0;
      HEAP32[$tbase_245_i + ($989 + 4) >> 2] = $nb_0 | 3;
      do {
       if (($1001 | 0) == (HEAP32[3238] | 0)) {
        $1015 = (HEAP32[3235] | 0) + $1007 | 0;
        HEAP32[3235] = $1015;
        HEAP32[3238] = $1006;
        HEAP32[$tbase_245_i + ($_sum_i21_i + 4) >> 2] = $1015 | 1;
       } else {
        if (($1001 | 0) == (HEAP32[3237] | 0)) {
         $1024 = (HEAP32[3234] | 0) + $1007 | 0;
         HEAP32[3234] = $1024;
         HEAP32[3237] = $1006;
         HEAP32[$tbase_245_i + ($_sum_i21_i + 4) >> 2] = $1024 | 1;
         HEAP32[$tbase_245_i + ($1024 + $_sum_i21_i) >> 2] = $1024;
         break;
        }
        $_sum2_i23_i = $tsize_244_i + 4 | 0;
        $1033 = HEAP32[$tbase_245_i + ($_sum2_i23_i + $999) >> 2] | 0;
        if (($1033 & 3 | 0) == 1) {
         $1037 = $1033 & -8;
         $1038 = $1033 >>> 3;
         do {
          if ($1033 >>> 0 < 256 >>> 0) {
           $1043 = HEAP32[$tbase_245_i + (($999 | 8) + $tsize_244_i) >> 2] | 0;
           $1046 = HEAP32[$tbase_245_i + ($tsize_244_i + 12 + $999) >> 2] | 0;
           $1049 = 12968 + ($1038 << 1 << 2) | 0;
           if (($1043 | 0) != ($1049 | 0)) {
            if ($1043 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
             _abort();
             return 0;
            }
            if ((HEAP32[$1043 + 12 >> 2] | 0) != ($1001 | 0)) {
             _abort();
             return 0;
            }
           }
           if (($1046 | 0) == ($1043 | 0)) {
            HEAP32[3232] = HEAP32[3232] & ~(1 << $1038);
            break;
           }
           if (($1046 | 0) == ($1049 | 0)) {
            $_pre_phi57_i_i = $1046 + 8 | 0;
           } else {
            if ($1046 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
             _abort();
             return 0;
            }
            $1072 = $1046 + 8 | 0;
            if ((HEAP32[$1072 >> 2] | 0) == ($1001 | 0)) {
             $_pre_phi57_i_i = $1072;
            } else {
             _abort();
             return 0;
            }
           }
           HEAP32[$1043 + 12 >> 2] = $1046;
           HEAP32[$_pre_phi57_i_i >> 2] = $1043;
          } else {
           $1077 = $1000;
           $1080 = HEAP32[$tbase_245_i + (($999 | 24) + $tsize_244_i) >> 2] | 0;
           $1083 = HEAP32[$tbase_245_i + ($tsize_244_i + 12 + $999) >> 2] | 0;
           do {
            if (($1083 | 0) == ($1077 | 0)) {
             $_sum67_i_i = $999 | 16;
             $1103 = $tbase_245_i + ($_sum2_i23_i + $_sum67_i_i) | 0;
             $1104 = HEAP32[$1103 >> 2] | 0;
             if (($1104 | 0) == 0) {
              $1108 = $tbase_245_i + ($_sum67_i_i + $tsize_244_i) | 0;
              $1109 = HEAP32[$1108 >> 2] | 0;
              if (($1109 | 0) == 0) {
               $R_1_i_i = 0;
               break;
              } else {
               $R_0_i_i = $1109;
               $RP_0_i_i = $1108;
              }
             } else {
              $R_0_i_i = $1104;
              $RP_0_i_i = $1103;
             }
             while (1) {
              $1111 = $R_0_i_i + 20 | 0;
              $1112 = HEAP32[$1111 >> 2] | 0;
              if (($1112 | 0) != 0) {
               $R_0_i_i = $1112;
               $RP_0_i_i = $1111;
               continue;
              }
              $1115 = $R_0_i_i + 16 | 0;
              $1116 = HEAP32[$1115 >> 2] | 0;
              if (($1116 | 0) == 0) {
               break;
              } else {
               $R_0_i_i = $1116;
               $RP_0_i_i = $1115;
              }
             }
             if ($RP_0_i_i >>> 0 < (HEAP32[3236] | 0) >>> 0) {
              _abort();
              return 0;
             } else {
              HEAP32[$RP_0_i_i >> 2] = 0;
              $R_1_i_i = $R_0_i_i;
              break;
             }
            } else {
             $1088 = HEAP32[$tbase_245_i + (($999 | 8) + $tsize_244_i) >> 2] | 0;
             if ($1088 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
              _abort();
              return 0;
             }
             $1093 = $1088 + 12 | 0;
             if ((HEAP32[$1093 >> 2] | 0) != ($1077 | 0)) {
              _abort();
              return 0;
             }
             $1097 = $1083 + 8 | 0;
             if ((HEAP32[$1097 >> 2] | 0) == ($1077 | 0)) {
              HEAP32[$1093 >> 2] = $1083;
              HEAP32[$1097 >> 2] = $1088;
              $R_1_i_i = $1083;
              break;
             } else {
              _abort();
              return 0;
             }
            }
           } while (0);
           if (($1080 | 0) != 0) {
            $1129 = HEAP32[$tbase_245_i + ($tsize_244_i + 28 + $999) >> 2] | 0;
            $1130 = 13232 + ($1129 << 2) | 0;
            if (($1077 | 0) == (HEAP32[$1130 >> 2] | 0)) {
             HEAP32[$1130 >> 2] = $R_1_i_i;
             if (($R_1_i_i | 0) == 0) {
              HEAP32[3233] = HEAP32[3233] & ~(1 << $1129);
              break;
             }
            } else {
             if ($1080 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
              _abort();
              return 0;
             }
             $1143 = $1080 + 16 | 0;
             if ((HEAP32[$1143 >> 2] | 0) == ($1077 | 0)) {
              HEAP32[$1143 >> 2] = $R_1_i_i;
             } else {
              HEAP32[$1080 + 20 >> 2] = $R_1_i_i;
             }
             if (($R_1_i_i | 0) == 0) {
              break;
             }
            }
            if ($R_1_i_i >>> 0 < (HEAP32[3236] | 0) >>> 0) {
             _abort();
             return 0;
            }
            HEAP32[$R_1_i_i + 24 >> 2] = $1080;
            $_sum3233_i_i = $999 | 16;
            $1160 = HEAP32[$tbase_245_i + ($_sum3233_i_i + $tsize_244_i) >> 2] | 0;
            do {
             if (($1160 | 0) != 0) {
              if ($1160 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
               _abort();
               return 0;
              } else {
               HEAP32[$R_1_i_i + 16 >> 2] = $1160;
               HEAP32[$1160 + 24 >> 2] = $R_1_i_i;
               break;
              }
             }
            } while (0);
            $1173 = HEAP32[$tbase_245_i + ($_sum2_i23_i + $_sum3233_i_i) >> 2] | 0;
            if (($1173 | 0) != 0) {
             if ($1173 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
              _abort();
              return 0;
             } else {
              HEAP32[$R_1_i_i + 20 >> 2] = $1173;
              HEAP32[$1173 + 24 >> 2] = $R_1_i_i;
              break;
             }
            }
           }
          }
         } while (0);
         $oldfirst_0_i_i = $tbase_245_i + (($1037 | $999) + $tsize_244_i) | 0;
         $qsize_0_i_i = $1037 + $1007 | 0;
        } else {
         $oldfirst_0_i_i = $1001;
         $qsize_0_i_i = $1007;
        }
        $1189 = $oldfirst_0_i_i + 4 | 0;
        HEAP32[$1189 >> 2] = HEAP32[$1189 >> 2] & -2;
        HEAP32[$tbase_245_i + ($_sum_i21_i + 4) >> 2] = $qsize_0_i_i | 1;
        HEAP32[$tbase_245_i + ($qsize_0_i_i + $_sum_i21_i) >> 2] = $qsize_0_i_i;
        $1197 = $qsize_0_i_i >>> 3;
        if ($qsize_0_i_i >>> 0 < 256 >>> 0) {
         $1200 = $1197 << 1;
         $1202 = 12968 + ($1200 << 2) | 0;
         $1203 = HEAP32[3232] | 0;
         $1204 = 1 << $1197;
         if (($1203 & $1204 | 0) == 0) {
          HEAP32[3232] = $1203 | $1204;
          $F4_0_i_i = $1202;
          $_pre_phi_i25_i = 12968 + ($1200 + 2 << 2) | 0;
         } else {
          $1210 = 12968 + ($1200 + 2 << 2) | 0;
          $1211 = HEAP32[$1210 >> 2] | 0;
          if ($1211 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
           _abort();
           return 0;
          } else {
           $F4_0_i_i = $1211;
           $_pre_phi_i25_i = $1210;
          }
         }
         HEAP32[$_pre_phi_i25_i >> 2] = $1006;
         HEAP32[$F4_0_i_i + 12 >> 2] = $1006;
         HEAP32[$tbase_245_i + ($_sum_i21_i + 8) >> 2] = $F4_0_i_i;
         HEAP32[$tbase_245_i + ($_sum_i21_i + 12) >> 2] = $1202;
         break;
        }
        $1223 = $1005;
        $1224 = $qsize_0_i_i >>> 8;
        if (($1224 | 0) == 0) {
         $I7_0_i_i = 0;
        } else {
         if ($qsize_0_i_i >>> 0 > 16777215 >>> 0) {
          $I7_0_i_i = 31;
         } else {
          $1231 = ($1224 + 1048320 | 0) >>> 16 & 8;
          $1232 = $1224 << $1231;
          $1235 = ($1232 + 520192 | 0) >>> 16 & 4;
          $1237 = $1232 << $1235;
          $1240 = ($1237 + 245760 | 0) >>> 16 & 2;
          $1245 = 14 - ($1235 | $1231 | $1240) + ($1237 << $1240 >>> 15) | 0;
          $I7_0_i_i = $qsize_0_i_i >>> (($1245 + 7 | 0) >>> 0) & 1 | $1245 << 1;
         }
        }
        $1252 = 13232 + ($I7_0_i_i << 2) | 0;
        HEAP32[$tbase_245_i + ($_sum_i21_i + 28) >> 2] = $I7_0_i_i;
        HEAP32[$tbase_245_i + ($_sum_i21_i + 20) >> 2] = 0;
        HEAP32[$tbase_245_i + ($_sum_i21_i + 16) >> 2] = 0;
        $1259 = HEAP32[3233] | 0;
        $1260 = 1 << $I7_0_i_i;
        if (($1259 & $1260 | 0) == 0) {
         HEAP32[3233] = $1259 | $1260;
         HEAP32[$1252 >> 2] = $1223;
         HEAP32[$tbase_245_i + ($_sum_i21_i + 24) >> 2] = $1252;
         HEAP32[$tbase_245_i + ($_sum_i21_i + 12) >> 2] = $1223;
         HEAP32[$tbase_245_i + ($_sum_i21_i + 8) >> 2] = $1223;
         break;
        }
        if (($I7_0_i_i | 0) == 31) {
         $1279 = 0;
        } else {
         $1279 = 25 - ($I7_0_i_i >>> 1) | 0;
        }
        $K8_0_i_i = $qsize_0_i_i << $1279;
        $T_0_i27_i = HEAP32[$1252 >> 2] | 0;
        while (1) {
         if ((HEAP32[$T_0_i27_i + 4 >> 2] & -8 | 0) == ($qsize_0_i_i | 0)) {
          break;
         }
         $1288 = $T_0_i27_i + 16 + ($K8_0_i_i >>> 31 << 2) | 0;
         $1289 = HEAP32[$1288 >> 2] | 0;
         if (($1289 | 0) == 0) {
          label = 296;
          break;
         } else {
          $K8_0_i_i = $K8_0_i_i << 1;
          $T_0_i27_i = $1289;
         }
        }
        if ((label | 0) == 296) {
         if ($1288 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
          _abort();
          return 0;
         } else {
          HEAP32[$1288 >> 2] = $1223;
          HEAP32[$tbase_245_i + ($_sum_i21_i + 24) >> 2] = $T_0_i27_i;
          HEAP32[$tbase_245_i + ($_sum_i21_i + 12) >> 2] = $1223;
          HEAP32[$tbase_245_i + ($_sum_i21_i + 8) >> 2] = $1223;
          break;
         }
        }
        $1305 = $T_0_i27_i + 8 | 0;
        $1306 = HEAP32[$1305 >> 2] | 0;
        $1308 = HEAP32[3236] | 0;
        if ($T_0_i27_i >>> 0 < $1308 >>> 0) {
         _abort();
         return 0;
        }
        if ($1306 >>> 0 < $1308 >>> 0) {
         _abort();
         return 0;
        } else {
         HEAP32[$1306 + 12 >> 2] = $1223;
         HEAP32[$1305 >> 2] = $1223;
         HEAP32[$tbase_245_i + ($_sum_i21_i + 8) >> 2] = $1306;
         HEAP32[$tbase_245_i + ($_sum_i21_i + 12) >> 2] = $T_0_i27_i;
         HEAP32[$tbase_245_i + ($_sum_i21_i + 24) >> 2] = 0;
         break;
        }
       }
      } while (0);
      $mem_0 = $tbase_245_i + ($989 | 8) | 0;
      return $mem_0 | 0;
     }
    }
    $1322 = $888;
    $sp_0_i_i_i = 13376;
    while (1) {
     $1325 = HEAP32[$sp_0_i_i_i >> 2] | 0;
     if (!($1325 >>> 0 > $1322 >>> 0)) {
      $1329 = HEAP32[$sp_0_i_i_i + 4 >> 2] | 0;
      $1330 = $1325 + $1329 | 0;
      if ($1330 >>> 0 > $1322 >>> 0) {
       break;
      }
     }
     $sp_0_i_i_i = HEAP32[$sp_0_i_i_i + 8 >> 2] | 0;
    }
    $1336 = $1325 + ($1329 - 39) | 0;
    if (($1336 & 7 | 0) == 0) {
     $1343 = 0;
    } else {
     $1343 = -$1336 & 7;
    }
    $1344 = $1325 + ($1329 - 47 + $1343) | 0;
    $1348 = $1344 >>> 0 < ($888 + 16 | 0) >>> 0 ? $1322 : $1344;
    $1349 = $1348 + 8 | 0;
    $1353 = $tbase_245_i + 8 | 0;
    if (($1353 & 7 | 0) == 0) {
     $1359 = 0;
    } else {
     $1359 = -$1353 & 7;
    }
    $1362 = $tsize_244_i - 40 - $1359 | 0;
    HEAP32[3238] = $tbase_245_i + $1359;
    HEAP32[3235] = $1362;
    HEAP32[$tbase_245_i + ($1359 + 4) >> 2] = $1362 | 1;
    HEAP32[$tbase_245_i + ($tsize_244_i - 36) >> 2] = 40;
    HEAP32[3239] = HEAP32[3152];
    HEAP32[$1348 + 4 >> 2] = 27;
    HEAP32[$1349 >> 2] = HEAP32[3344];
    HEAP32[$1349 + 4 >> 2] = HEAP32[3345];
    HEAP32[$1349 + 8 >> 2] = HEAP32[3346];
    HEAP32[$1349 + 12 >> 2] = HEAP32[3347];
    HEAP32[3344] = $tbase_245_i;
    HEAP32[3345] = $tsize_244_i;
    HEAP32[3347] = 0;
    HEAP32[3346] = $1349;
    $1372 = $1348 + 28 | 0;
    HEAP32[$1372 >> 2] = 7;
    if (($1348 + 32 | 0) >>> 0 < $1330 >>> 0) {
     $1375 = $1372;
     while (1) {
      $1376 = $1375 + 4 | 0;
      HEAP32[$1376 >> 2] = 7;
      if (($1375 + 8 | 0) >>> 0 < $1330 >>> 0) {
       $1375 = $1376;
      } else {
       break;
      }
     }
    }
    if (($1348 | 0) != ($1322 | 0)) {
     $1384 = $1348 - $888 | 0;
     $1387 = $1322 + ($1384 + 4) | 0;
     HEAP32[$1387 >> 2] = HEAP32[$1387 >> 2] & -2;
     HEAP32[$888 + 4 >> 2] = $1384 | 1;
     HEAP32[$1322 + $1384 >> 2] = $1384;
     $1393 = $1384 >>> 3;
     if ($1384 >>> 0 < 256 >>> 0) {
      $1396 = $1393 << 1;
      $1398 = 12968 + ($1396 << 2) | 0;
      $1399 = HEAP32[3232] | 0;
      $1400 = 1 << $1393;
      if (($1399 & $1400 | 0) == 0) {
       HEAP32[3232] = $1399 | $1400;
       $F_0_i_i = $1398;
       $_pre_phi_i_i = 12968 + ($1396 + 2 << 2) | 0;
      } else {
       $1406 = 12968 + ($1396 + 2 << 2) | 0;
       $1407 = HEAP32[$1406 >> 2] | 0;
       if ($1407 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
        _abort();
        return 0;
       } else {
        $F_0_i_i = $1407;
        $_pre_phi_i_i = $1406;
       }
      }
      HEAP32[$_pre_phi_i_i >> 2] = $888;
      HEAP32[$F_0_i_i + 12 >> 2] = $888;
      HEAP32[$888 + 8 >> 2] = $F_0_i_i;
      HEAP32[$888 + 12 >> 2] = $1398;
      break;
     }
     $1417 = $888;
     $1418 = $1384 >>> 8;
     if (($1418 | 0) == 0) {
      $I1_0_i_i = 0;
     } else {
      if ($1384 >>> 0 > 16777215 >>> 0) {
       $I1_0_i_i = 31;
      } else {
       $1425 = ($1418 + 1048320 | 0) >>> 16 & 8;
       $1426 = $1418 << $1425;
       $1429 = ($1426 + 520192 | 0) >>> 16 & 4;
       $1431 = $1426 << $1429;
       $1434 = ($1431 + 245760 | 0) >>> 16 & 2;
       $1439 = 14 - ($1429 | $1425 | $1434) + ($1431 << $1434 >>> 15) | 0;
       $I1_0_i_i = $1384 >>> (($1439 + 7 | 0) >>> 0) & 1 | $1439 << 1;
      }
     }
     $1446 = 13232 + ($I1_0_i_i << 2) | 0;
     HEAP32[$888 + 28 >> 2] = $I1_0_i_i;
     HEAP32[$888 + 20 >> 2] = 0;
     HEAP32[$888 + 16 >> 2] = 0;
     $1450 = HEAP32[3233] | 0;
     $1451 = 1 << $I1_0_i_i;
     if (($1450 & $1451 | 0) == 0) {
      HEAP32[3233] = $1450 | $1451;
      HEAP32[$1446 >> 2] = $1417;
      HEAP32[$888 + 24 >> 2] = $1446;
      HEAP32[$888 + 12 >> 2] = $888;
      HEAP32[$888 + 8 >> 2] = $888;
      break;
     }
     if (($I1_0_i_i | 0) == 31) {
      $1466 = 0;
     } else {
      $1466 = 25 - ($I1_0_i_i >>> 1) | 0;
     }
     $K2_0_i_i = $1384 << $1466;
     $T_0_i_i = HEAP32[$1446 >> 2] | 0;
     while (1) {
      if ((HEAP32[$T_0_i_i + 4 >> 2] & -8 | 0) == ($1384 | 0)) {
       break;
      }
      $1475 = $T_0_i_i + 16 + ($K2_0_i_i >>> 31 << 2) | 0;
      $1476 = HEAP32[$1475 >> 2] | 0;
      if (($1476 | 0) == 0) {
       label = 331;
       break;
      } else {
       $K2_0_i_i = $K2_0_i_i << 1;
       $T_0_i_i = $1476;
      }
     }
     if ((label | 0) == 331) {
      if ($1475 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
       _abort();
       return 0;
      } else {
       HEAP32[$1475 >> 2] = $1417;
       HEAP32[$888 + 24 >> 2] = $T_0_i_i;
       HEAP32[$888 + 12 >> 2] = $888;
       HEAP32[$888 + 8 >> 2] = $888;
       break;
      }
     }
     $1489 = $T_0_i_i + 8 | 0;
     $1490 = HEAP32[$1489 >> 2] | 0;
     $1492 = HEAP32[3236] | 0;
     if ($T_0_i_i >>> 0 < $1492 >>> 0) {
      _abort();
      return 0;
     }
     if ($1490 >>> 0 < $1492 >>> 0) {
      _abort();
      return 0;
     } else {
      HEAP32[$1490 + 12 >> 2] = $1417;
      HEAP32[$1489 >> 2] = $1417;
      HEAP32[$888 + 8 >> 2] = $1490;
      HEAP32[$888 + 12 >> 2] = $T_0_i_i;
      HEAP32[$888 + 24 >> 2] = 0;
      break;
     }
    }
   }
  } while (0);
  $1502 = HEAP32[3235] | 0;
  if ($1502 >>> 0 > $nb_0 >>> 0) {
   $1505 = $1502 - $nb_0 | 0;
   HEAP32[3235] = $1505;
   $1506 = HEAP32[3238] | 0;
   $1507 = $1506;
   HEAP32[3238] = $1507 + $nb_0;
   HEAP32[$1507 + ($nb_0 + 4) >> 2] = $1505 | 1;
   HEAP32[$1506 + 4 >> 2] = $nb_0 | 3;
   $mem_0 = $1506 + 8 | 0;
   return $mem_0 | 0;
  }
 }
 HEAP32[(___errno_location() | 0) >> 2] = 12;
 $mem_0 = 0;
 return $mem_0 | 0;
}
function ___floatscan($f, $prec, $pok) {
 $f = $f | 0;
 $prec = $prec | 0;
 $pok = $pok | 0;
 var $x_i = 0, $bits_0_ph = 0, $emin_0_ph = 0, $3 = 0, $4 = 0, $6 = 0, $16 = 0, $24 = 0, $25 = 0, $sign_0 = 0, $c_0 = 0, $c_1149 = 0, $i_0148 = 0, $44 = 0, $c_2 = 0, $54 = 0, $c_1_lcssa = 0, $i_0_lcssa = 0, $58 = 0, $62 = 0, $i_1146 = 0, $80 = 0, $c_4 = 0, $92 = 0, $102 = 0, $i_4 = 0, $110 = 0, $120 = 0, $133 = 0, $_in = 0, $141 = 0, $156 = 0, $166 = 0, $170 = 0, $gotdig_0_i = 0, $c_0_i = 0, $180 = 0, $190 = 0, $c_1_ph_i = 0, $rp_0113_i$0 = 0, $rp_0113_i$1 = 0, $200 = 0, $210 = 0, $x_0_i = 0, $y_0_i = 0.0, $scale_0_i = 0.0, $gottail_0_i = 0, $gotrad_0_i = 0, $gotdig_2_i = 0, $rp_1_i$0 = 0, $rp_1_i$1 = 0, $dc_0_i$0 = 0, $dc_0_i$1 = 0, $c_2_i = 0, $212 = 0, $215 = 0, $218 = 0, $d_0_i = 0, $$etemp$1$1 = 0, $$etemp$2$1 = 0, $232 = 0.0, $x_1_i = 0, $y_1_i = 0.0, $scale_1_i = 0.0, $gottail_1_i = 0, $x_2_i = 0, $y_2_i = 0.0, $scale_2_i = 0.0, $gottail_2_i = 0, $gotrad_1_i = 0, $gotdig_3_i = 0, $rp_2_i$0 = 0, $rp_2_i$1 = 0, $dc_1_i$0 = 0, $dc_1_i$1 = 0, $243 = 0, $c_2_lcssa_i = 0, $256 = 0, $263 = 0, $272 = 0, $dc_0_rp_1_i$0 = 0, $dc_0_rp_1_i$1 = 0, $$etemp$4$1 = 0, $dc_2106_i$0 = 0, $dc_2106_i$1 = 0, $x_3105_i = 0, $274 = 0, $$etemp$6$1 = 0, $x_3_lcssa_i = 0, $280$0 = 0, $280$1 = 0, $e2_0_i$0 = 0, $e2_0_i$1 = 0, $306$1 = 0, $314 = 0, $315$1 = 0, $e2_1102_i$0 = 0, $e2_1102_i$1 = 0, $y_3101_i = 0.0, $x_4100_i = 0, $324 = 0, $x_5_i = 0, $_pn_i = 0.0, $y_4_i = 0.0, $e2_1_lcssa_i$0 = 0, $e2_1_lcssa_i$1 = 0, $y_3_lcssa_i = 0.0, $x_4_lcssa_i = 0, $331$1 = 0, $337 = 0, $_094_i = 0, $344 = 0.0, $345 = 0.0, $349 = 0, $_pre_phi_i = 0.0, $bias_099_i = 0.0, $x_6_i = 0, $y_5_i = 0.0, $357 = 0.0, $c_6 = 0, $sum_i = 0, $372 = 0, $gotdig_0_i90 = 0, $_0234_i = 0, $374 = 0, $384 = 0, $_1_ph_i = 0, $lrp_0336_i$0 = 0, $lrp_0336_i$1 = 0, $394 = 0, $_1_be_i = 0, $lrp_1_i$0 = 0, $lrp_1_i$1 = 0, $gotdig_2_i92 = 0, $gotrad_0_i93 = 0, $_2_i = 0, $404 = 0, $405 = 0, $407 = 0, $408 = 0, $409 = 0, $410 = 0, $_3323_i = 0, $j_0322_i = 0, $k_0321_i = 0, $gotrad_1320_i = 0, $gotdig_3319_i = 0, $lnz_0318_i = 0, $dc_0317_i$0 = 0, $dc_0317_i$1 = 0, $lrp_2316_i$0 = 0, $lrp_2316_i$1 = 0, $415 = 0, $419 = 0, $storemerge_i = 0, $426 = 0, $427 = 0, $lrp_3_i$0 = 0, $lrp_3_i$1 = 0, $dc_1_i96$0 = 0, $dc_1_i96$1 = 0, $lnz_2_i = 0, $gotdig_4_i = 0, $gotrad_2_i = 0, $k_2_i = 0, $j_2_i = 0, $433 = 0, $_3_be_i = 0, $442 = 0, $444 = 0, $_3_lcssa_i = 0, $j_0_lcssa_i = 0, $k_0_lcssa_i = 0, $gotrad_1_lcssa_i = 0, $gotdig_3_lcssa_i = 0, $lnz_0_lcssa_i = 0, $dc_0_lcssa_i$0 = 0, $dc_0_lcssa_i$1 = 0, $lrp_2_lcssa_i$0 = 0, $lrp_2_lcssa_i$1 = 0, $445 = 0, $_3314_i = 0, $j_0312_i = 0, $k_0310_i = 0, $gotdig_3307_i = 0, $lnz_0305_i = 0, $dc_0303_i$0 = 0, $dc_0303_i$1 = 0, $lrp_4_i$0 = 0, $lrp_4_i$1 = 0, $446 = 0, $451$0 = 0, $451$1 = 0, $e10_0_i$0 = 0, $e10_0_i$1 = 0, $lrp_5_i$0 = 0, $lrp_5_i$1 = 0, $475 = 0, $$etemp$14$1 = 0, $493 = 0, $494$1 = 0, $502 = 0, $503$1 = 0, $513 = 0, $515 = 0, $j_3297_i = 0, $k_3_i = 0, $522 = 0, $548 = 0, $_pre_i98 = 0, $562 = 0, $567 = 0, $570 = 0, $572 = 0, $carry_0289_i = 0, $k_4288_i = 0, $a_0287_i = 0, $rp_0286_i = 0, $573 = 0, $574 = 0, $577 = 0, $578 = 0, $581 = 0, $rp_1_i99 = 0, $a_1_i = 0, $rp_0_lcssa388_i = 0, $a_0_lcssa387_i = 0, $z_0_i = 0, $rp_2_ph264_i = 0, $e2_0_ph_i = 0, $z_1_ph265_i = 0, $a_2_ph266_i = 0, $593 = 0, $e2_0_us_i = 0, $z_1_us_i = 0, $z_2_us_i = 0, $k_5_in_us_i = 0, $carry1_0_us_i = 0, $k_5_us_i = 0, $597 = 0, $599$0 = 0, $$etemp$15$1 = 0, $_sink_off0_us_i = 0, $carry1_1_us_i = 0, $612 = 0, $z_3_us_i = 0, $618 = 0, $e2_0_us270_i = 0, $z_1_us271_i = 0, $z_2_us273_i = 0, $k_5_in_us274_i = 0, $carry1_0_us275_i = 0, $k_5_us276_i = 0, $624 = 0, $626$0 = 0, $$etemp$18$1 = 0, $_sink_off0_us279_i = 0, $carry1_1_us280_i = 0, $639 = 0, $z_3_us283_i = 0, $645 = 0, $carry1_1_lcssa_lcssa_i = 0, $z_3_lcssa_lcssa_i = 0, $_lcssa269_i = 0, $649 = 0, $653 = 0, $658 = 0, $z_4_i = 0, $e2_1_i = 0, $a_3_i = 0, $i_0_i = 0, $667 = 0, $671 = 0, $673 = 0, $i_1_i = 0, $680 = 0, $683 = 0, $686 = 0, $687 = 0, $carry3_0256_i = 0, $k_6254_i = 0, $a_4253_i = 0, $rp_4252_i = 0, $688 = 0, $689 = 0, $692 = 0, $or_cond241_i = 0, $rp_3_ph259_i = 0, $e2_1_ph_i = 0, $z_5_ph_i = 0, $a_3_ph_i = 0, $706 = 0, $709 = 0, $rp_3_i_ph = 0, $e2_1_i_ph = 0, $a_3_i_ph = 0, $710 = 0, $_240_i = 0, $z_7_i = 0, $721 = 0.0, $723 = 0, $denormal_0_i = 0, $_1236_i = 0, $732 = 0.0, $735 = 0.0, $y_1_i103 = 0.0, $frac_0_i = 0.0, $bias_0_i = 0.0, $740 = 0, $744 = 0, $frac_1_i = 0.0, $frac_2_i = 0.0, $780 = 0.0, $e2_2_i = 0, $denormal_2_i = 0, $y_2_i104 = 0.0, $e2_3_i = 0, $y_3_i = 0.0, $804 = 0, $z_7_1_i = 0, $813 = 0.0, $814 = 0.0, $815 = 0, $816 = 0, $_0 = 0.0, $819 = 0, $c_4_1 = 0, $phitmp_i$0 = 0, $242$0 = 0, $275$0 = 0, $275$1 = 0, $298$0 = 0, $299$0 = 0, $299$1 = 0, $329$0 = 0, $329$1 = 0, $333$0 = 0, $334$0 = 0, $334$1 = 0, $phitmp_i91$0 = 0, $414$0 = 0, $414$1 = 0, $462$0 = 0, $602$0 = 0, $602$1 = 0, $605$0 = 0, $607$0 = 0, $629$0 = 0, $629$1 = 0, $632$0 = 0, $634$0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 512 | 0;
 $x_i = sp | 0;
 if (($prec | 0) == 1) {
  $emin_0_ph = -1074;
  $bits_0_ph = 53;
 } else if (($prec | 0) == 0) {
  $emin_0_ph = -149;
  $bits_0_ph = 24;
 } else if (($prec | 0) == 2) {
  $emin_0_ph = -1074;
  $bits_0_ph = 53;
 } else {
  $_0 = 0.0;
  STACKTOP = sp;
  return +$_0;
 }
 $3 = $f + 4 | 0;
 $4 = $f + 100 | 0;
 do {
  $6 = HEAP32[$3 >> 2] | 0;
  if ($6 >>> 0 < (HEAP32[$4 >> 2] | 0) >>> 0) {
   HEAP32[$3 >> 2] = $6 + 1;
   $16 = HEAPU8[$6] | 0;
  } else {
   $16 = ___shgetc($f) | 0;
  }
 } while ((_isspace($16 | 0) | 0) != 0);
 do {
  if (($16 | 0) == 45 | ($16 | 0) == 43) {
   $24 = 1 - ((($16 | 0) == 45) << 1) | 0;
   $25 = HEAP32[$3 >> 2] | 0;
   if ($25 >>> 0 < (HEAP32[$4 >> 2] | 0) >>> 0) {
    HEAP32[$3 >> 2] = $25 + 1;
    $c_0 = HEAPU8[$25] | 0;
    $sign_0 = $24;
    break;
   } else {
    $c_0 = ___shgetc($f) | 0;
    $sign_0 = $24;
    break;
   }
  } else {
   $c_0 = $16;
   $sign_0 = 1;
  }
 } while (0);
 $i_0148 = 0;
 $c_1149 = $c_0;
 while (1) {
  if (($c_1149 | 32 | 0) != (HEAP8[3896 + $i_0148 | 0] | 0)) {
   $i_0_lcssa = $i_0148;
   $c_1_lcssa = $c_1149;
   break;
  }
  do {
   if ($i_0148 >>> 0 < 7 >>> 0) {
    $44 = HEAP32[$3 >> 2] | 0;
    if ($44 >>> 0 < (HEAP32[$4 >> 2] | 0) >>> 0) {
     HEAP32[$3 >> 2] = $44 + 1;
     $c_2 = HEAPU8[$44] | 0;
     break;
    } else {
     $c_2 = ___shgetc($f) | 0;
     break;
    }
   } else {
    $c_2 = $c_1149;
   }
  } while (0);
  $54 = $i_0148 + 1 | 0;
  if ($54 >>> 0 < 8 >>> 0) {
   $i_0148 = $54;
   $c_1149 = $c_2;
  } else {
   $i_0_lcssa = $54;
   $c_1_lcssa = $c_2;
   break;
  }
 }
 do {
  if (($i_0_lcssa | 0) == 3) {
   label = 23;
  } else if (($i_0_lcssa | 0) != 8) {
   $58 = ($pok | 0) == 0;
   if (!($i_0_lcssa >>> 0 < 4 >>> 0 | $58)) {
    if (($i_0_lcssa | 0) == 8) {
     break;
    } else {
     label = 23;
     break;
    }
   }
   do {
    if (($i_0_lcssa | 0) == 0) {
     if (($c_1_lcssa | 32 | 0) == 110) {
      $80 = HEAP32[$3 >> 2] | 0;
      if ($80 >>> 0 < (HEAP32[$4 >> 2] | 0) >>> 0) {
       HEAP32[$3 >> 2] = $80 + 1;
       $c_4 = HEAPU8[$80] | 0;
      } else {
       $c_4 = ___shgetc($f) | 0;
      }
      if (($c_4 | 32 | 0) != 97) {
       break;
      }
      $819 = HEAP32[$3 >> 2] | 0;
      if ($819 >>> 0 < (HEAP32[$4 >> 2] | 0) >>> 0) {
       HEAP32[$3 >> 2] = $819 + 1;
       $c_4_1 = HEAPU8[$819] | 0;
      } else {
       $c_4_1 = ___shgetc($f) | 0;
      }
      if (($c_4_1 | 32 | 0) != 110) {
       break;
      }
      $92 = HEAP32[$3 >> 2] | 0;
      if ($92 >>> 0 < (HEAP32[$4 >> 2] | 0) >>> 0) {
       HEAP32[$3 >> 2] = $92 + 1;
       $102 = HEAPU8[$92] | 0;
      } else {
       $102 = ___shgetc($f) | 0;
      }
      if (($102 | 0) == 40) {
       $i_4 = 1;
      } else {
       if ((HEAP32[$4 >> 2] | 0) == 0) {
        $_0 = +NaN;
        STACKTOP = sp;
        return +$_0;
       }
       HEAP32[$3 >> 2] = (HEAP32[$3 >> 2] | 0) - 1;
       $_0 = +NaN;
       STACKTOP = sp;
       return +$_0;
      }
      while (1) {
       $110 = HEAP32[$3 >> 2] | 0;
       if ($110 >>> 0 < (HEAP32[$4 >> 2] | 0) >>> 0) {
        HEAP32[$3 >> 2] = $110 + 1;
        $120 = HEAPU8[$110] | 0;
       } else {
        $120 = ___shgetc($f) | 0;
       }
       if (!(($120 - 48 | 0) >>> 0 < 10 >>> 0 | ($120 - 65 | 0) >>> 0 < 26 >>> 0)) {
        if (!(($120 - 97 | 0) >>> 0 < 26 >>> 0 | ($120 | 0) == 95)) {
         break;
        }
       }
       $i_4 = $i_4 + 1 | 0;
      }
      if (($120 | 0) == 41) {
       $_0 = +NaN;
       STACKTOP = sp;
       return +$_0;
      }
      $133 = (HEAP32[$4 >> 2] | 0) == 0;
      if (!$133) {
       HEAP32[$3 >> 2] = (HEAP32[$3 >> 2] | 0) - 1;
      }
      if ($58) {
       HEAP32[(___errno_location() | 0) >> 2] = 22;
       ___shlim($f, 0);
       $_0 = 0.0;
       STACKTOP = sp;
       return +$_0;
      }
      if (($i_4 | 0) == 0 | $133) {
       $_0 = +NaN;
       STACKTOP = sp;
       return +$_0;
      } else {
       $_in = $i_4;
      }
      while (1) {
       $141 = $_in - 1 | 0;
       HEAP32[$3 >> 2] = (HEAP32[$3 >> 2] | 0) - 1;
       if (($141 | 0) == 0) {
        $_0 = +NaN;
        break;
       } else {
        $_in = $141;
       }
      }
      STACKTOP = sp;
      return +$_0;
     }
     do {
      if (($c_1_lcssa | 0) == 48) {
       $156 = HEAP32[$3 >> 2] | 0;
       if ($156 >>> 0 < (HEAP32[$4 >> 2] | 0) >>> 0) {
        HEAP32[$3 >> 2] = $156 + 1;
        $166 = HEAPU8[$156] | 0;
       } else {
        $166 = ___shgetc($f) | 0;
       }
       if (($166 | 32 | 0) != 120) {
        if ((HEAP32[$4 >> 2] | 0) == 0) {
         $c_6 = 48;
         break;
        }
        HEAP32[$3 >> 2] = (HEAP32[$3 >> 2] | 0) - 1;
        $c_6 = 48;
        break;
       }
       $170 = HEAP32[$3 >> 2] | 0;
       if ($170 >>> 0 < (HEAP32[$4 >> 2] | 0) >>> 0) {
        HEAP32[$3 >> 2] = $170 + 1;
        $c_0_i = HEAPU8[$170] | 0;
        $gotdig_0_i = 0;
       } else {
        $c_0_i = ___shgetc($f) | 0;
        $gotdig_0_i = 0;
       }
       while (1) {
        if (($c_0_i | 0) == 46) {
         label = 68;
         break;
        } else if (($c_0_i | 0) != 48) {
         $c_2_i = $c_0_i;
         $dc_0_i$1 = 0;
         $dc_0_i$0 = 0;
         $rp_1_i$1 = 0;
         $rp_1_i$0 = 0;
         $gotdig_2_i = $gotdig_0_i;
         $gotrad_0_i = 0;
         $gottail_0_i = 0;
         $scale_0_i = 1.0;
         $y_0_i = 0.0;
         $x_0_i = 0;
         break;
        }
        $180 = HEAP32[$3 >> 2] | 0;
        if ($180 >>> 0 < (HEAP32[$4 >> 2] | 0) >>> 0) {
         HEAP32[$3 >> 2] = $180 + 1;
         $c_0_i = HEAPU8[$180] | 0;
         $gotdig_0_i = 1;
         continue;
        } else {
         $c_0_i = ___shgetc($f) | 0;
         $gotdig_0_i = 1;
         continue;
        }
       }
       L103 : do {
        if ((label | 0) == 68) {
         $190 = HEAP32[$3 >> 2] | 0;
         if ($190 >>> 0 < (HEAP32[$4 >> 2] | 0) >>> 0) {
          HEAP32[$3 >> 2] = $190 + 1;
          $c_1_ph_i = HEAPU8[$190] | 0;
         } else {
          $c_1_ph_i = ___shgetc($f) | 0;
         }
         if (($c_1_ph_i | 0) == 48) {
          $rp_0113_i$1 = -1;
          $rp_0113_i$0 = -1;
          while (1) {
           $200 = HEAP32[$3 >> 2] | 0;
           if ($200 >>> 0 < (HEAP32[$4 >> 2] | 0) >>> 0) {
            HEAP32[$3 >> 2] = $200 + 1;
            $210 = HEAPU8[$200] | 0;
           } else {
            $210 = ___shgetc($f) | 0;
           }
           if (($210 | 0) != 48) {
            $c_2_i = $210;
            $dc_0_i$1 = 0;
            $dc_0_i$0 = 0;
            $rp_1_i$1 = $rp_0113_i$1;
            $rp_1_i$0 = $rp_0113_i$0;
            $gotdig_2_i = 1;
            $gotrad_0_i = 1;
            $gottail_0_i = 0;
            $scale_0_i = 1.0;
            $y_0_i = 0.0;
            $x_0_i = 0;
            break L103;
           }
           $phitmp_i$0 = _i64Add($rp_0113_i$0, $rp_0113_i$1, -1, -1) | 0;
           $rp_0113_i$1 = tempRet0;
           $rp_0113_i$0 = $phitmp_i$0;
          }
         } else {
          $c_2_i = $c_1_ph_i;
          $dc_0_i$1 = 0;
          $dc_0_i$0 = 0;
          $rp_1_i$1 = 0;
          $rp_1_i$0 = 0;
          $gotdig_2_i = $gotdig_0_i;
          $gotrad_0_i = 1;
          $gottail_0_i = 0;
          $scale_0_i = 1.0;
          $y_0_i = 0.0;
          $x_0_i = 0;
         }
        }
       } while (0);
       L116 : while (1) {
        $212 = $c_2_i - 48 | 0;
        do {
         if ($212 >>> 0 < 10 >>> 0) {
          $d_0_i = $212;
          label = 82;
         } else {
          $215 = $c_2_i | 32;
          $218 = ($c_2_i | 0) == 46;
          if (!(($215 - 97 | 0) >>> 0 < 6 >>> 0 | $218)) {
           $c_2_lcssa_i = $c_2_i;
           break L116;
          }
          if ($218) {
           if (($gotrad_0_i | 0) == 0) {
            $dc_1_i$1 = $dc_0_i$1;
            $dc_1_i$0 = $dc_0_i$0;
            $rp_2_i$1 = $dc_0_i$1;
            $rp_2_i$0 = $dc_0_i$0;
            $gotdig_3_i = $gotdig_2_i;
            $gotrad_1_i = 1;
            $gottail_2_i = $gottail_0_i;
            $scale_2_i = $scale_0_i;
            $y_2_i = $y_0_i;
            $x_2_i = $x_0_i;
            break;
           } else {
            $c_2_lcssa_i = 46;
            break L116;
           }
          } else {
           $d_0_i = ($c_2_i | 0) > 57 ? $215 - 87 | 0 : $212;
           label = 82;
           break;
          }
         }
        } while (0);
        if ((label | 0) == 82) {
         label = 0;
         $$etemp$1$1 = 0;
         do {
          if (($dc_0_i$1 | 0) < ($$etemp$1$1 | 0) | ($dc_0_i$1 | 0) == ($$etemp$1$1 | 0) & $dc_0_i$0 >>> 0 < 8 >>> 0) {
           $gottail_1_i = $gottail_0_i;
           $scale_1_i = $scale_0_i;
           $y_1_i = $y_0_i;
           $x_1_i = $d_0_i + ($x_0_i << 4) | 0;
          } else {
           $$etemp$2$1 = 0;
           if (($dc_0_i$1 | 0) < ($$etemp$2$1 | 0) | ($dc_0_i$1 | 0) == ($$etemp$2$1 | 0) & $dc_0_i$0 >>> 0 < 14 >>> 0) {
            $232 = $scale_0_i * .0625;
            $gottail_1_i = $gottail_0_i;
            $scale_1_i = $232;
            $y_1_i = $y_0_i + $232 * +($d_0_i | 0);
            $x_1_i = $x_0_i;
            break;
           }
           if (($d_0_i | 0) != 0 & ($gottail_0_i | 0) == 0) {
            $gottail_1_i = 1;
            $scale_1_i = $scale_0_i;
            $y_1_i = $y_0_i + $scale_0_i * .5;
            $x_1_i = $x_0_i;
           } else {
            $gottail_1_i = $gottail_0_i;
            $scale_1_i = $scale_0_i;
            $y_1_i = $y_0_i;
            $x_1_i = $x_0_i;
           }
          }
         } while (0);
         $242$0 = _i64Add($dc_0_i$0, $dc_0_i$1, 1, 0) | 0;
         $dc_1_i$1 = tempRet0;
         $dc_1_i$0 = $242$0;
         $rp_2_i$1 = $rp_1_i$1;
         $rp_2_i$0 = $rp_1_i$0;
         $gotdig_3_i = 1;
         $gotrad_1_i = $gotrad_0_i;
         $gottail_2_i = $gottail_1_i;
         $scale_2_i = $scale_1_i;
         $y_2_i = $y_1_i;
         $x_2_i = $x_1_i;
        }
        $243 = HEAP32[$3 >> 2] | 0;
        if ($243 >>> 0 < (HEAP32[$4 >> 2] | 0) >>> 0) {
         HEAP32[$3 >> 2] = $243 + 1;
         $c_2_i = HEAPU8[$243] | 0;
         $dc_0_i$1 = $dc_1_i$1;
         $dc_0_i$0 = $dc_1_i$0;
         $rp_1_i$1 = $rp_2_i$1;
         $rp_1_i$0 = $rp_2_i$0;
         $gotdig_2_i = $gotdig_3_i;
         $gotrad_0_i = $gotrad_1_i;
         $gottail_0_i = $gottail_2_i;
         $scale_0_i = $scale_2_i;
         $y_0_i = $y_2_i;
         $x_0_i = $x_2_i;
         continue;
        } else {
         $c_2_i = ___shgetc($f) | 0;
         $dc_0_i$1 = $dc_1_i$1;
         $dc_0_i$0 = $dc_1_i$0;
         $rp_1_i$1 = $rp_2_i$1;
         $rp_1_i$0 = $rp_2_i$0;
         $gotdig_2_i = $gotdig_3_i;
         $gotrad_0_i = $gotrad_1_i;
         $gottail_0_i = $gottail_2_i;
         $scale_0_i = $scale_2_i;
         $y_0_i = $y_2_i;
         $x_0_i = $x_2_i;
         continue;
        }
       }
       if (($gotdig_2_i | 0) == 0) {
        $256 = (HEAP32[$4 >> 2] | 0) == 0;
        if (!$256) {
         HEAP32[$3 >> 2] = (HEAP32[$3 >> 2] | 0) - 1;
        }
        if ($58) {
         ___shlim($f, 0);
        } else {
         if (!$256) {
          $263 = HEAP32[$3 >> 2] | 0;
          HEAP32[$3 >> 2] = $263 - 1;
          if (($gotrad_0_i | 0) != 0) {
           HEAP32[$3 >> 2] = $263 - 2;
          }
         }
        }
        $_0 = +($sign_0 | 0) * 0.0;
        STACKTOP = sp;
        return +$_0;
       }
       $272 = ($gotrad_0_i | 0) == 0;
       $dc_0_rp_1_i$0 = $272 ? $dc_0_i$0 : $rp_1_i$0;
       $dc_0_rp_1_i$1 = $272 ? $dc_0_i$1 : $rp_1_i$1;
       $$etemp$4$1 = 0;
       if (($dc_0_i$1 | 0) < ($$etemp$4$1 | 0) | ($dc_0_i$1 | 0) == ($$etemp$4$1 | 0) & $dc_0_i$0 >>> 0 < 8 >>> 0) {
        $x_3105_i = $x_0_i;
        $dc_2106_i$1 = $dc_0_i$1;
        $dc_2106_i$0 = $dc_0_i$0;
        while (1) {
         $274 = $x_3105_i << 4;
         $275$0 = _i64Add($dc_2106_i$0, $dc_2106_i$1, 1, 0) | 0;
         $275$1 = tempRet0;
         $$etemp$6$1 = 0;
         if (($275$1 | 0) < ($$etemp$6$1 | 0) | ($275$1 | 0) == ($$etemp$6$1 | 0) & $275$0 >>> 0 < 8 >>> 0) {
          $x_3105_i = $274;
          $dc_2106_i$1 = $275$1;
          $dc_2106_i$0 = $275$0;
         } else {
          $x_3_lcssa_i = $274;
          break;
         }
        }
       } else {
        $x_3_lcssa_i = $x_0_i;
       }
       do {
        if (($c_2_lcssa_i | 32 | 0) == 112) {
         $280$0 = _scanexp($f, $pok) | 0;
         $280$1 = tempRet0;
         if (($280$0 | 0) == 0 & ($280$1 | 0) == (-2147483648 | 0)) {
          if ($58) {
           ___shlim($f, 0);
           $_0 = 0.0;
           STACKTOP = sp;
           return +$_0;
          } else {
           if ((HEAP32[$4 >> 2] | 0) == 0) {
            $e2_0_i$1 = 0;
            $e2_0_i$0 = 0;
            break;
           }
           HEAP32[$3 >> 2] = (HEAP32[$3 >> 2] | 0) - 1;
           $e2_0_i$1 = 0;
           $e2_0_i$0 = 0;
           break;
          }
         } else {
          $e2_0_i$1 = $280$1;
          $e2_0_i$0 = $280$0;
         }
        } else {
         if ((HEAP32[$4 >> 2] | 0) == 0) {
          $e2_0_i$1 = 0;
          $e2_0_i$0 = 0;
         } else {
          HEAP32[$3 >> 2] = (HEAP32[$3 >> 2] | 0) - 1;
          $e2_0_i$1 = 0;
          $e2_0_i$0 = 0;
         }
        }
       } while (0);
       $298$0 = _i64Add($dc_0_rp_1_i$0 << 2 | 0 >>> 30, $dc_0_rp_1_i$1 << 2 | $dc_0_rp_1_i$0 >>> 30, -32, -1) | 0;
       $299$0 = _i64Add($298$0, tempRet0, $e2_0_i$0, $e2_0_i$1) | 0;
       $299$1 = tempRet0;
       if (($x_3_lcssa_i | 0) == 0) {
        $_0 = +($sign_0 | 0) * 0.0;
        STACKTOP = sp;
        return +$_0;
       }
       $306$1 = 0;
       if (($299$1 | 0) > ($306$1 | 0) | ($299$1 | 0) == ($306$1 | 0) & $299$0 >>> 0 > (-$emin_0_ph | 0) >>> 0) {
        HEAP32[(___errno_location() | 0) >> 2] = 34;
        $_0 = +($sign_0 | 0) * 1.7976931348623157e+308 * 1.7976931348623157e+308;
        STACKTOP = sp;
        return +$_0;
       }
       $314 = $emin_0_ph - 106 | 0;
       $315$1 = ($314 | 0) < 0 | 0 ? -1 : 0;
       if (($299$1 | 0) < ($315$1 | 0) | ($299$1 | 0) == ($315$1 | 0) & $299$0 >>> 0 < $314 >>> 0) {
        HEAP32[(___errno_location() | 0) >> 2] = 34;
        $_0 = +($sign_0 | 0) * 2.2250738585072014e-308 * 2.2250738585072014e-308;
        STACKTOP = sp;
        return +$_0;
       }
       if (($x_3_lcssa_i | 0) > -1) {
        $x_4100_i = $x_3_lcssa_i;
        $y_3101_i = $y_0_i;
        $e2_1102_i$1 = $299$1;
        $e2_1102_i$0 = $299$0;
        while (1) {
         $324 = $x_4100_i << 1;
         if ($y_3101_i < .5) {
          $_pn_i = $y_3101_i;
          $x_5_i = $324;
         } else {
          $_pn_i = $y_3101_i + -1.0;
          $x_5_i = $324 | 1;
         }
         $y_4_i = $y_3101_i + $_pn_i;
         $329$0 = _i64Add($e2_1102_i$0, $e2_1102_i$1, -1, -1) | 0;
         $329$1 = tempRet0;
         if (($x_5_i | 0) > -1) {
          $x_4100_i = $x_5_i;
          $y_3101_i = $y_4_i;
          $e2_1102_i$1 = $329$1;
          $e2_1102_i$0 = $329$0;
         } else {
          $x_4_lcssa_i = $x_5_i;
          $y_3_lcssa_i = $y_4_i;
          $e2_1_lcssa_i$1 = $329$1;
          $e2_1_lcssa_i$0 = $329$0;
          break;
         }
        }
       } else {
        $x_4_lcssa_i = $x_3_lcssa_i;
        $y_3_lcssa_i = $y_0_i;
        $e2_1_lcssa_i$1 = $299$1;
        $e2_1_lcssa_i$0 = $299$0;
       }
       $331$1 = 0;
       $333$0 = _i64Subtract(32, 0, $emin_0_ph, ($emin_0_ph | 0) < 0 | 0 ? -1 : 0) | 0;
       $334$0 = _i64Add($e2_1_lcssa_i$0, $e2_1_lcssa_i$1, $333$0, tempRet0) | 0;
       $334$1 = tempRet0;
       if (($331$1 | 0) > ($334$1 | 0) | ($331$1 | 0) == ($334$1 | 0) & $bits_0_ph >>> 0 > $334$0 >>> 0) {
        $337 = $334$0;
        $_094_i = ($337 | 0) < 0 ? 0 : $337;
       } else {
        $_094_i = $bits_0_ph;
       }
       if (($_094_i | 0) < 53) {
        $344 = +($sign_0 | 0);
        $345 = +_copysign(+(+_scalbn(1.0, 84 - $_094_i | 0)), +$344);
        if (($_094_i | 0) < 32 & $y_3_lcssa_i != 0.0) {
         $349 = $x_4_lcssa_i & 1;
         $y_5_i = ($349 | 0) == 0 ? 0.0 : $y_3_lcssa_i;
         $x_6_i = ($349 ^ 1) + $x_4_lcssa_i | 0;
         $bias_099_i = $345;
         $_pre_phi_i = $344;
        } else {
         $y_5_i = $y_3_lcssa_i;
         $x_6_i = $x_4_lcssa_i;
         $bias_099_i = $345;
         $_pre_phi_i = $344;
        }
       } else {
        $y_5_i = $y_3_lcssa_i;
        $x_6_i = $x_4_lcssa_i;
        $bias_099_i = 0.0;
        $_pre_phi_i = +($sign_0 | 0);
       }
       $357 = $_pre_phi_i * $y_5_i + ($bias_099_i + $_pre_phi_i * +($x_6_i >>> 0 >>> 0)) - $bias_099_i;
       if (!($357 != 0.0)) {
        HEAP32[(___errno_location() | 0) >> 2] = 34;
       }
       $_0 = +_scalbnl($357, $e2_1_lcssa_i$0);
       STACKTOP = sp;
       return +$_0;
      } else {
       $c_6 = $c_1_lcssa;
      }
     } while (0);
     $sum_i = $emin_0_ph + $bits_0_ph | 0;
     $372 = 3 - $sum_i | 0;
     $_0234_i = $c_6;
     $gotdig_0_i90 = 0;
     while (1) {
      if (($_0234_i | 0) == 46) {
       label = 137;
       break;
      } else if (($_0234_i | 0) != 48) {
       $_2_i = $_0234_i;
       $gotrad_0_i93 = 0;
       $gotdig_2_i92 = $gotdig_0_i90;
       $lrp_1_i$1 = 0;
       $lrp_1_i$0 = 0;
       break;
      }
      $374 = HEAP32[$3 >> 2] | 0;
      if ($374 >>> 0 < (HEAP32[$4 >> 2] | 0) >>> 0) {
       HEAP32[$3 >> 2] = $374 + 1;
       $_0234_i = HEAPU8[$374] | 0;
       $gotdig_0_i90 = 1;
       continue;
      } else {
       $_0234_i = ___shgetc($f) | 0;
       $gotdig_0_i90 = 1;
       continue;
      }
     }
     L205 : do {
      if ((label | 0) == 137) {
       $384 = HEAP32[$3 >> 2] | 0;
       if ($384 >>> 0 < (HEAP32[$4 >> 2] | 0) >>> 0) {
        HEAP32[$3 >> 2] = $384 + 1;
        $_1_ph_i = HEAPU8[$384] | 0;
       } else {
        $_1_ph_i = ___shgetc($f) | 0;
       }
       if (($_1_ph_i | 0) == 48) {
        $lrp_0336_i$1 = -1;
        $lrp_0336_i$0 = -1;
        while (1) {
         $394 = HEAP32[$3 >> 2] | 0;
         if ($394 >>> 0 < (HEAP32[$4 >> 2] | 0) >>> 0) {
          HEAP32[$3 >> 2] = $394 + 1;
          $_1_be_i = HEAPU8[$394] | 0;
         } else {
          $_1_be_i = ___shgetc($f) | 0;
         }
         if (($_1_be_i | 0) != 48) {
          $_2_i = $_1_be_i;
          $gotrad_0_i93 = 1;
          $gotdig_2_i92 = 1;
          $lrp_1_i$1 = $lrp_0336_i$1;
          $lrp_1_i$0 = $lrp_0336_i$0;
          break L205;
         }
         $phitmp_i91$0 = _i64Add($lrp_0336_i$0, $lrp_0336_i$1, -1, -1) | 0;
         $lrp_0336_i$1 = tempRet0;
         $lrp_0336_i$0 = $phitmp_i91$0;
        }
       } else {
        $_2_i = $_1_ph_i;
        $gotrad_0_i93 = 1;
        $gotdig_2_i92 = $gotdig_0_i90;
        $lrp_1_i$1 = 0;
        $lrp_1_i$0 = 0;
       }
      }
     } while (0);
     $404 = $x_i | 0;
     HEAP32[$404 >> 2] = 0;
     $405 = $_2_i - 48 | 0;
     $407 = ($_2_i | 0) == 46;
     L219 : do {
      if ($405 >>> 0 < 10 >>> 0 | $407) {
       $408 = $x_i + 496 | 0;
       $lrp_2316_i$1 = $lrp_1_i$1;
       $lrp_2316_i$0 = $lrp_1_i$0;
       $dc_0317_i$1 = 0;
       $dc_0317_i$0 = 0;
       $lnz_0318_i = 0;
       $gotdig_3319_i = $gotdig_2_i92;
       $gotrad_1320_i = $gotrad_0_i93;
       $k_0321_i = 0;
       $j_0322_i = 0;
       $_3323_i = $_2_i;
       $410 = $405;
       $409 = $407;
       while (1) {
        do {
         if ($409) {
          if (($gotrad_1320_i | 0) == 0) {
           $j_2_i = $j_0322_i;
           $k_2_i = $k_0321_i;
           $gotrad_2_i = 1;
           $gotdig_4_i = $gotdig_3319_i;
           $lnz_2_i = $lnz_0318_i;
           $dc_1_i96$1 = $dc_0317_i$1;
           $dc_1_i96$0 = $dc_0317_i$0;
           $lrp_3_i$1 = $dc_0317_i$1;
           $lrp_3_i$0 = $dc_0317_i$0;
          } else {
           $lrp_4_i$1 = $lrp_2316_i$1;
           $lrp_4_i$0 = $lrp_2316_i$0;
           $dc_0303_i$1 = $dc_0317_i$1;
           $dc_0303_i$0 = $dc_0317_i$0;
           $lnz_0305_i = $lnz_0318_i;
           $gotdig_3307_i = $gotdig_3319_i;
           $k_0310_i = $k_0321_i;
           $j_0312_i = $j_0322_i;
           $_3314_i = $_3323_i;
           break L219;
          }
         } else {
          $414$0 = _i64Add($dc_0317_i$0, $dc_0317_i$1, 1, 0) | 0;
          $414$1 = tempRet0;
          $415 = ($_3323_i | 0) != 48;
          if (($k_0321_i | 0) >= 125) {
           if (!$415) {
            $j_2_i = $j_0322_i;
            $k_2_i = $k_0321_i;
            $gotrad_2_i = $gotrad_1320_i;
            $gotdig_4_i = $gotdig_3319_i;
            $lnz_2_i = $lnz_0318_i;
            $dc_1_i96$1 = $414$1;
            $dc_1_i96$0 = $414$0;
            $lrp_3_i$1 = $lrp_2316_i$1;
            $lrp_3_i$0 = $lrp_2316_i$0;
            break;
           }
           HEAP32[$408 >> 2] = HEAP32[$408 >> 2] | 1;
           $j_2_i = $j_0322_i;
           $k_2_i = $k_0321_i;
           $gotrad_2_i = $gotrad_1320_i;
           $gotdig_4_i = $gotdig_3319_i;
           $lnz_2_i = $lnz_0318_i;
           $dc_1_i96$1 = $414$1;
           $dc_1_i96$0 = $414$0;
           $lrp_3_i$1 = $lrp_2316_i$1;
           $lrp_3_i$0 = $lrp_2316_i$0;
           break;
          }
          $419 = $x_i + ($k_0321_i << 2) | 0;
          if (($j_0322_i | 0) == 0) {
           $storemerge_i = $410;
          } else {
           $storemerge_i = $_3323_i - 48 + ((HEAP32[$419 >> 2] | 0) * 10 | 0) | 0;
          }
          HEAP32[$419 >> 2] = $storemerge_i;
          $426 = $j_0322_i + 1 | 0;
          $427 = ($426 | 0) == 9;
          $j_2_i = $427 ? 0 : $426;
          $k_2_i = ($427 & 1) + $k_0321_i | 0;
          $gotrad_2_i = $gotrad_1320_i;
          $gotdig_4_i = 1;
          $lnz_2_i = $415 ? $414$0 : $lnz_0318_i;
          $dc_1_i96$1 = $414$1;
          $dc_1_i96$0 = $414$0;
          $lrp_3_i$1 = $lrp_2316_i$1;
          $lrp_3_i$0 = $lrp_2316_i$0;
         }
        } while (0);
        $433 = HEAP32[$3 >> 2] | 0;
        if ($433 >>> 0 < (HEAP32[$4 >> 2] | 0) >>> 0) {
         HEAP32[$3 >> 2] = $433 + 1;
         $_3_be_i = HEAPU8[$433] | 0;
        } else {
         $_3_be_i = ___shgetc($f) | 0;
        }
        $442 = $_3_be_i - 48 | 0;
        $444 = ($_3_be_i | 0) == 46;
        if ($442 >>> 0 < 10 >>> 0 | $444) {
         $lrp_2316_i$1 = $lrp_3_i$1;
         $lrp_2316_i$0 = $lrp_3_i$0;
         $dc_0317_i$1 = $dc_1_i96$1;
         $dc_0317_i$0 = $dc_1_i96$0;
         $lnz_0318_i = $lnz_2_i;
         $gotdig_3319_i = $gotdig_4_i;
         $gotrad_1320_i = $gotrad_2_i;
         $k_0321_i = $k_2_i;
         $j_0322_i = $j_2_i;
         $_3323_i = $_3_be_i;
         $410 = $442;
         $409 = $444;
        } else {
         $lrp_2_lcssa_i$1 = $lrp_3_i$1;
         $lrp_2_lcssa_i$0 = $lrp_3_i$0;
         $dc_0_lcssa_i$1 = $dc_1_i96$1;
         $dc_0_lcssa_i$0 = $dc_1_i96$0;
         $lnz_0_lcssa_i = $lnz_2_i;
         $gotdig_3_lcssa_i = $gotdig_4_i;
         $gotrad_1_lcssa_i = $gotrad_2_i;
         $k_0_lcssa_i = $k_2_i;
         $j_0_lcssa_i = $j_2_i;
         $_3_lcssa_i = $_3_be_i;
         label = 160;
         break;
        }
       }
      } else {
       $lrp_2_lcssa_i$1 = $lrp_1_i$1;
       $lrp_2_lcssa_i$0 = $lrp_1_i$0;
       $dc_0_lcssa_i$1 = 0;
       $dc_0_lcssa_i$0 = 0;
       $lnz_0_lcssa_i = 0;
       $gotdig_3_lcssa_i = $gotdig_2_i92;
       $gotrad_1_lcssa_i = $gotrad_0_i93;
       $k_0_lcssa_i = 0;
       $j_0_lcssa_i = 0;
       $_3_lcssa_i = $_2_i;
       label = 160;
      }
     } while (0);
     if ((label | 0) == 160) {
      $445 = ($gotrad_1_lcssa_i | 0) == 0;
      $lrp_4_i$1 = $445 ? $dc_0_lcssa_i$1 : $lrp_2_lcssa_i$1;
      $lrp_4_i$0 = $445 ? $dc_0_lcssa_i$0 : $lrp_2_lcssa_i$0;
      $dc_0303_i$1 = $dc_0_lcssa_i$1;
      $dc_0303_i$0 = $dc_0_lcssa_i$0;
      $lnz_0305_i = $lnz_0_lcssa_i;
      $gotdig_3307_i = $gotdig_3_lcssa_i;
      $k_0310_i = $k_0_lcssa_i;
      $j_0312_i = $j_0_lcssa_i;
      $_3314_i = $_3_lcssa_i;
     }
     $446 = ($gotdig_3307_i | 0) != 0;
     if ($446) {
      if (($_3314_i | 32 | 0) == 101) {
       $451$0 = _scanexp($f, $pok) | 0;
       $451$1 = tempRet0;
       do {
        if (($451$0 | 0) == 0 & ($451$1 | 0) == (-2147483648 | 0)) {
         if ($58) {
          ___shlim($f, 0);
          $_0 = 0.0;
          STACKTOP = sp;
          return +$_0;
         } else {
          if ((HEAP32[$4 >> 2] | 0) == 0) {
           $e10_0_i$1 = 0;
           $e10_0_i$0 = 0;
           break;
          }
          HEAP32[$3 >> 2] = (HEAP32[$3 >> 2] | 0) - 1;
          $e10_0_i$1 = 0;
          $e10_0_i$0 = 0;
          break;
         }
        } else {
         $e10_0_i$1 = $451$1;
         $e10_0_i$0 = $451$0;
        }
       } while (0);
       $462$0 = _i64Add($e10_0_i$0, $e10_0_i$1, $lrp_4_i$0, $lrp_4_i$1) | 0;
       $lrp_5_i$1 = tempRet0;
       $lrp_5_i$0 = $462$0;
      } else {
       label = 169;
      }
     } else {
      label = 169;
     }
     if ((label | 0) == 169) {
      if (($_3314_i | 0) > -1) {
       if ((HEAP32[$4 >> 2] | 0) == 0) {
        $lrp_5_i$1 = $lrp_4_i$1;
        $lrp_5_i$0 = $lrp_4_i$0;
       } else {
        HEAP32[$3 >> 2] = (HEAP32[$3 >> 2] | 0) - 1;
        $lrp_5_i$1 = $lrp_4_i$1;
        $lrp_5_i$0 = $lrp_4_i$0;
       }
      } else {
       $lrp_5_i$1 = $lrp_4_i$1;
       $lrp_5_i$0 = $lrp_4_i$0;
      }
     }
     if (!$446) {
      HEAP32[(___errno_location() | 0) >> 2] = 22;
      ___shlim($f, 0);
      $_0 = 0.0;
      STACKTOP = sp;
      return +$_0;
     }
     $475 = HEAP32[$404 >> 2] | 0;
     if (($475 | 0) == 0) {
      $_0 = +($sign_0 | 0) * 0.0;
      STACKTOP = sp;
      return +$_0;
     }
     $$etemp$14$1 = 0;
     do {
      if (($lrp_5_i$0 | 0) == ($dc_0303_i$0 | 0) & ($lrp_5_i$1 | 0) == ($dc_0303_i$1 | 0) & (($dc_0303_i$1 | 0) < ($$etemp$14$1 | 0) | ($dc_0303_i$1 | 0) == ($$etemp$14$1 | 0) & $dc_0303_i$0 >>> 0 < 10 >>> 0)) {
       if (!($bits_0_ph >>> 0 > 30 >>> 0)) {
        if (($475 >>> ($bits_0_ph >>> 0) | 0) != 0) {
         break;
        }
       }
       $_0 = +($sign_0 | 0) * +($475 >>> 0 >>> 0);
       STACKTOP = sp;
       return +$_0;
      }
     } while (0);
     $493 = ($emin_0_ph | 0) / -2 | 0;
     $494$1 = ($493 | 0) < 0 | 0 ? -1 : 0;
     if (($lrp_5_i$1 | 0) > ($494$1 | 0) | ($lrp_5_i$1 | 0) == ($494$1 | 0) & $lrp_5_i$0 >>> 0 > $493 >>> 0) {
      HEAP32[(___errno_location() | 0) >> 2] = 34;
      $_0 = +($sign_0 | 0) * 1.7976931348623157e+308 * 1.7976931348623157e+308;
      STACKTOP = sp;
      return +$_0;
     }
     $502 = $emin_0_ph - 106 | 0;
     $503$1 = ($502 | 0) < 0 | 0 ? -1 : 0;
     if (($lrp_5_i$1 | 0) < ($503$1 | 0) | ($lrp_5_i$1 | 0) == ($503$1 | 0) & $lrp_5_i$0 >>> 0 < $502 >>> 0) {
      HEAP32[(___errno_location() | 0) >> 2] = 34;
      $_0 = +($sign_0 | 0) * 2.2250738585072014e-308 * 2.2250738585072014e-308;
      STACKTOP = sp;
      return +$_0;
     }
     if (($j_0312_i | 0) == 0) {
      $k_3_i = $k_0310_i;
     } else {
      if (($j_0312_i | 0) < 9) {
       $513 = $x_i + ($k_0310_i << 2) | 0;
       $j_3297_i = $j_0312_i;
       $515 = HEAP32[$513 >> 2] | 0;
       do {
        $515 = $515 * 10 | 0;
        $j_3297_i = $j_3297_i + 1 | 0;
       } while (($j_3297_i | 0) < 9);
       HEAP32[$513 >> 2] = $515;
      }
      $k_3_i = $k_0310_i + 1 | 0;
     }
     $522 = $lrp_5_i$0;
     do {
      if (($lnz_0305_i | 0) < 9) {
       if (($lnz_0305_i | 0) <= ($522 | 0) & ($522 | 0) < 18) {
        if (($522 | 0) == 9) {
         $_0 = +($sign_0 | 0) * +((HEAP32[$404 >> 2] | 0) >>> 0 >>> 0);
         STACKTOP = sp;
         return +$_0;
        }
        if (($522 | 0) < 9) {
         $_0 = +($sign_0 | 0) * +((HEAP32[$404 >> 2] | 0) >>> 0 >>> 0) / +(HEAP32[2544 + (8 - $522 << 2) >> 2] | 0);
         STACKTOP = sp;
         return +$_0;
        }
        $548 = $bits_0_ph + 27 + ($522 * -3 | 0) | 0;
        $_pre_i98 = HEAP32[$404 >> 2] | 0;
        if (($548 | 0) <= 30) {
         if (($_pre_i98 >>> ($548 >>> 0) | 0) != 0) {
          break;
         }
        }
        $_0 = +($sign_0 | 0) * +($_pre_i98 >>> 0 >>> 0) * +(HEAP32[2544 + ($522 - 10 << 2) >> 2] | 0);
        STACKTOP = sp;
        return +$_0;
       }
      }
     } while (0);
     $562 = ($522 | 0) % 9 | 0;
     if (($562 | 0) == 0) {
      $a_2_ph266_i = 0;
      $z_1_ph265_i = $k_3_i;
      $e2_0_ph_i = 0;
      $rp_2_ph264_i = $522;
     } else {
      $567 = ($522 | 0) > -1 ? $562 : $562 + 9 | 0;
      $570 = HEAP32[2544 + (8 - $567 << 2) >> 2] | 0;
      if (($k_3_i | 0) == 0) {
       $z_0_i = 0;
       $a_0_lcssa387_i = 0;
       $rp_0_lcssa388_i = $522;
      } else {
       $572 = 1e9 / ($570 | 0) | 0;
       $rp_0286_i = $522;
       $a_0287_i = 0;
       $k_4288_i = 0;
       $carry_0289_i = 0;
       while (1) {
        $573 = $x_i + ($k_4288_i << 2) | 0;
        $574 = HEAP32[$573 >> 2] | 0;
        $577 = (($574 >>> 0) / ($570 >>> 0) | 0) + $carry_0289_i | 0;
        HEAP32[$573 >> 2] = $577;
        $578 = Math_imul(($574 >>> 0) % ($570 >>> 0) | 0, $572) | 0;
        $581 = $k_4288_i + 1 | 0;
        if (($k_4288_i | 0) == ($a_0287_i | 0) & ($577 | 0) == 0) {
         $a_1_i = $581 & 127;
         $rp_1_i99 = $rp_0286_i - 9 | 0;
        } else {
         $a_1_i = $a_0287_i;
         $rp_1_i99 = $rp_0286_i;
        }
        if (($581 | 0) == ($k_3_i | 0)) {
         break;
        } else {
         $rp_0286_i = $rp_1_i99;
         $a_0287_i = $a_1_i;
         $k_4288_i = $581;
         $carry_0289_i = $578;
        }
       }
       if (($578 | 0) == 0) {
        $z_0_i = $k_3_i;
        $a_0_lcssa387_i = $a_1_i;
        $rp_0_lcssa388_i = $rp_1_i99;
       } else {
        HEAP32[$x_i + ($k_3_i << 2) >> 2] = $578;
        $z_0_i = $k_3_i + 1 | 0;
        $a_0_lcssa387_i = $a_1_i;
        $rp_0_lcssa388_i = $rp_1_i99;
       }
      }
      $a_2_ph266_i = $a_0_lcssa387_i;
      $z_1_ph265_i = $z_0_i;
      $e2_0_ph_i = 0;
      $rp_2_ph264_i = 9 - $567 + $rp_0_lcssa388_i | 0;
     }
     L317 : while (1) {
      $593 = $x_i + ($a_2_ph266_i << 2) | 0;
      if (($rp_2_ph264_i | 0) < 18) {
       $z_1_us_i = $z_1_ph265_i;
       $e2_0_us_i = $e2_0_ph_i;
       while (1) {
        $carry1_0_us_i = 0;
        $k_5_in_us_i = $z_1_us_i + 127 | 0;
        $z_2_us_i = $z_1_us_i;
        while (1) {
         $k_5_us_i = $k_5_in_us_i & 127;
         $597 = $x_i + ($k_5_us_i << 2) | 0;
         $599$0 = HEAP32[$597 >> 2] | 0;
         $602$0 = _i64Add($599$0 << 29 | 0 >>> 3, 0 << 29 | $599$0 >>> 3, $carry1_0_us_i, 0) | 0;
         $602$1 = tempRet0;
         $$etemp$15$1 = 0;
         if ($602$1 >>> 0 > $$etemp$15$1 >>> 0 | $602$1 >>> 0 == $$etemp$15$1 >>> 0 & $602$0 >>> 0 > 1e9 >>> 0) {
          $605$0 = ___udivdi3($602$0, $602$1, 1e9, 0) | 0;
          $607$0 = ___uremdi3($602$0, $602$1, 1e9, 0) | 0;
          $carry1_1_us_i = $605$0;
          $_sink_off0_us_i = $607$0;
         } else {
          $carry1_1_us_i = 0;
          $_sink_off0_us_i = $602$0;
         }
         HEAP32[$597 >> 2] = $_sink_off0_us_i;
         $612 = ($k_5_us_i | 0) == ($a_2_ph266_i | 0);
         if (($k_5_us_i | 0) != ($z_2_us_i + 127 & 127 | 0) | $612) {
          $z_3_us_i = $z_2_us_i;
         } else {
          $z_3_us_i = ($_sink_off0_us_i | 0) == 0 ? $k_5_us_i : $z_2_us_i;
         }
         if ($612) {
          break;
         } else {
          $carry1_0_us_i = $carry1_1_us_i;
          $k_5_in_us_i = $k_5_us_i - 1 | 0;
          $z_2_us_i = $z_3_us_i;
         }
        }
        $618 = $e2_0_us_i - 29 | 0;
        if (($carry1_1_us_i | 0) == 0) {
         $z_1_us_i = $z_3_us_i;
         $e2_0_us_i = $618;
        } else {
         $_lcssa269_i = $618;
         $z_3_lcssa_lcssa_i = $z_3_us_i;
         $carry1_1_lcssa_lcssa_i = $carry1_1_us_i;
         break;
        }
       }
      } else {
       if (($rp_2_ph264_i | 0) == 18) {
        $z_1_us271_i = $z_1_ph265_i;
        $e2_0_us270_i = $e2_0_ph_i;
       } else {
        $a_3_ph_i = $a_2_ph266_i;
        $z_5_ph_i = $z_1_ph265_i;
        $e2_1_ph_i = $e2_0_ph_i;
        $rp_3_ph259_i = $rp_2_ph264_i;
        break;
       }
       while (1) {
        if (!((HEAP32[$593 >> 2] | 0) >>> 0 < 9007199 >>> 0)) {
         $a_3_ph_i = $a_2_ph266_i;
         $z_5_ph_i = $z_1_us271_i;
         $e2_1_ph_i = $e2_0_us270_i;
         $rp_3_ph259_i = 18;
         break L317;
        }
        $carry1_0_us275_i = 0;
        $k_5_in_us274_i = $z_1_us271_i + 127 | 0;
        $z_2_us273_i = $z_1_us271_i;
        while (1) {
         $k_5_us276_i = $k_5_in_us274_i & 127;
         $624 = $x_i + ($k_5_us276_i << 2) | 0;
         $626$0 = HEAP32[$624 >> 2] | 0;
         $629$0 = _i64Add($626$0 << 29 | 0 >>> 3, 0 << 29 | $626$0 >>> 3, $carry1_0_us275_i, 0) | 0;
         $629$1 = tempRet0;
         $$etemp$18$1 = 0;
         if ($629$1 >>> 0 > $$etemp$18$1 >>> 0 | $629$1 >>> 0 == $$etemp$18$1 >>> 0 & $629$0 >>> 0 > 1e9 >>> 0) {
          $632$0 = ___udivdi3($629$0, $629$1, 1e9, 0) | 0;
          $634$0 = ___uremdi3($629$0, $629$1, 1e9, 0) | 0;
          $carry1_1_us280_i = $632$0;
          $_sink_off0_us279_i = $634$0;
         } else {
          $carry1_1_us280_i = 0;
          $_sink_off0_us279_i = $629$0;
         }
         HEAP32[$624 >> 2] = $_sink_off0_us279_i;
         $639 = ($k_5_us276_i | 0) == ($a_2_ph266_i | 0);
         if (($k_5_us276_i | 0) != ($z_2_us273_i + 127 & 127 | 0) | $639) {
          $z_3_us283_i = $z_2_us273_i;
         } else {
          $z_3_us283_i = ($_sink_off0_us279_i | 0) == 0 ? $k_5_us276_i : $z_2_us273_i;
         }
         if ($639) {
          break;
         } else {
          $carry1_0_us275_i = $carry1_1_us280_i;
          $k_5_in_us274_i = $k_5_us276_i - 1 | 0;
          $z_2_us273_i = $z_3_us283_i;
         }
        }
        $645 = $e2_0_us270_i - 29 | 0;
        if (($carry1_1_us280_i | 0) == 0) {
         $z_1_us271_i = $z_3_us283_i;
         $e2_0_us270_i = $645;
        } else {
         $_lcssa269_i = $645;
         $z_3_lcssa_lcssa_i = $z_3_us283_i;
         $carry1_1_lcssa_lcssa_i = $carry1_1_us280_i;
         break;
        }
       }
      }
      $649 = $a_2_ph266_i + 127 & 127;
      if (($649 | 0) == ($z_3_lcssa_lcssa_i | 0)) {
       $653 = $z_3_lcssa_lcssa_i + 127 & 127;
       $658 = $x_i + (($z_3_lcssa_lcssa_i + 126 & 127) << 2) | 0;
       HEAP32[$658 >> 2] = HEAP32[$658 >> 2] | HEAP32[$x_i + ($653 << 2) >> 2];
       $z_4_i = $653;
      } else {
       $z_4_i = $z_3_lcssa_lcssa_i;
      }
      HEAP32[$x_i + ($649 << 2) >> 2] = $carry1_1_lcssa_lcssa_i;
      $a_2_ph266_i = $649;
      $z_1_ph265_i = $z_4_i;
      $e2_0_ph_i = $_lcssa269_i;
      $rp_2_ph264_i = $rp_2_ph264_i + 9 | 0;
     }
     L348 : while (1) {
      $706 = $z_5_ph_i + 1 & 127;
      $709 = $x_i + (($z_5_ph_i + 127 & 127) << 2) | 0;
      $a_3_i_ph = $a_3_ph_i;
      $e2_1_i_ph = $e2_1_ph_i;
      $rp_3_i_ph = $rp_3_ph259_i;
      while (1) {
       $710 = ($rp_3_i_ph | 0) == 18;
       $_240_i = ($rp_3_i_ph | 0) > 27 ? 9 : 1;
       $a_3_i = $a_3_i_ph;
       $e2_1_i = $e2_1_i_ph;
       while (1) {
        $i_0_i = 0;
        while (1) {
         if (($i_0_i | 0) >= 2) {
          $i_1_i = $i_0_i;
          break;
         }
         $667 = $i_0_i + $a_3_i & 127;
         if (($667 | 0) == ($z_5_ph_i | 0)) {
          $i_1_i = 2;
          break;
         }
         $671 = HEAP32[$x_i + ($667 << 2) >> 2] | 0;
         $673 = HEAP32[2536 + ($i_0_i << 2) >> 2] | 0;
         if ($671 >>> 0 < $673 >>> 0) {
          $i_1_i = 2;
          break;
         }
         if ($671 >>> 0 > $673 >>> 0) {
          $i_1_i = $i_0_i;
          break;
         } else {
          $i_0_i = $i_0_i + 1 | 0;
         }
        }
        if (($i_1_i | 0) == 2 & $710) {
         break L348;
        }
        $683 = $_240_i + $e2_1_i | 0;
        if (($a_3_i | 0) == ($z_5_ph_i | 0)) {
         $a_3_i = $z_5_ph_i;
         $e2_1_i = $683;
        } else {
         break;
        }
       }
       $686 = (1 << $_240_i) - 1 | 0;
       $687 = 1e9 >>> ($_240_i >>> 0);
       $rp_4252_i = $rp_3_i_ph;
       $a_4253_i = $a_3_i;
       $k_6254_i = $a_3_i;
       $carry3_0256_i = 0;
       do {
        $688 = $x_i + ($k_6254_i << 2) | 0;
        $689 = HEAP32[$688 >> 2] | 0;
        $692 = ($689 >>> ($_240_i >>> 0)) + $carry3_0256_i | 0;
        HEAP32[$688 >> 2] = $692;
        $carry3_0256_i = Math_imul($689 & $686, $687) | 0;
        $or_cond241_i = ($k_6254_i | 0) == ($a_4253_i | 0) & ($692 | 0) == 0;
        $k_6254_i = $k_6254_i + 1 & 127;
        $rp_4252_i = $or_cond241_i ? $rp_4252_i - 9 | 0 : $rp_4252_i;
        $a_4253_i = $or_cond241_i ? $k_6254_i : $a_4253_i;
       } while (($k_6254_i | 0) != ($z_5_ph_i | 0));
       if (($carry3_0256_i | 0) == 0) {
        $a_3_i_ph = $a_4253_i;
        $e2_1_i_ph = $683;
        $rp_3_i_ph = $rp_4252_i;
        continue;
       }
       if (($706 | 0) != ($a_4253_i | 0)) {
        break;
       }
       HEAP32[$709 >> 2] = HEAP32[$709 >> 2] | 1;
       $a_3_i_ph = $a_4253_i;
       $e2_1_i_ph = $683;
       $rp_3_i_ph = $rp_4252_i;
      }
      HEAP32[$x_i + ($z_5_ph_i << 2) >> 2] = $carry3_0256_i;
      $a_3_ph_i = $a_4253_i;
      $z_5_ph_i = $706;
      $e2_1_ph_i = $683;
      $rp_3_ph259_i = $rp_4252_i;
     }
     $680 = $a_3_i & 127;
     if (($680 | 0) == ($z_5_ph_i | 0)) {
      HEAP32[$x_i + ($706 - 1 << 2) >> 2] = 0;
      $z_7_i = $706;
     } else {
      $z_7_i = $z_5_ph_i;
     }
     $721 = +((HEAP32[$x_i + ($680 << 2) >> 2] | 0) >>> 0 >>> 0);
     $723 = $a_3_i + 1 & 127;
     if (($723 | 0) == ($z_7_i | 0)) {
      $804 = $z_7_i + 1 & 127;
      HEAP32[$x_i + ($804 - 1 << 2) >> 2] = 0;
      $z_7_1_i = $804;
     } else {
      $z_7_1_i = $z_7_i;
     }
     $813 = +($sign_0 | 0);
     $814 = $813 * ($721 * 1.0e9 + +((HEAP32[$x_i + ($723 << 2) >> 2] | 0) >>> 0 >>> 0));
     $815 = $e2_1_i + 53 | 0;
     $816 = $815 - $emin_0_ph | 0;
     if (($816 | 0) < ($bits_0_ph | 0)) {
      $_1236_i = ($816 | 0) < 0 ? 0 : $816;
      $denormal_0_i = 1;
     } else {
      $_1236_i = $bits_0_ph;
      $denormal_0_i = 0;
     }
     if (($_1236_i | 0) < 53) {
      $732 = +_copysign(+(+_scalbn(1.0, 105 - $_1236_i | 0)), +$814);
      $735 = +_fmod(+$814, +(+_scalbn(1.0, 53 - $_1236_i | 0)));
      $bias_0_i = $732;
      $frac_0_i = $735;
      $y_1_i103 = $732 + ($814 - $735);
     } else {
      $bias_0_i = 0.0;
      $frac_0_i = 0.0;
      $y_1_i103 = $814;
     }
     $740 = $a_3_i + 2 & 127;
     if (($740 | 0) == ($z_7_1_i | 0)) {
      $frac_2_i = $frac_0_i;
     } else {
      $744 = HEAP32[$x_i + ($740 << 2) >> 2] | 0;
      do {
       if ($744 >>> 0 < 5e8 >>> 0) {
        if (($744 | 0) == 0) {
         if (($a_3_i + 3 & 127 | 0) == ($z_7_1_i | 0)) {
          $frac_1_i = $frac_0_i;
          break;
         }
        }
        $frac_1_i = $813 * .25 + $frac_0_i;
       } else {
        if ($744 >>> 0 > 5e8 >>> 0) {
         $frac_1_i = $813 * .75 + $frac_0_i;
         break;
        }
        if (($a_3_i + 3 & 127 | 0) == ($z_7_1_i | 0)) {
         $frac_1_i = $813 * .5 + $frac_0_i;
         break;
        } else {
         $frac_1_i = $813 * .75 + $frac_0_i;
         break;
        }
       }
      } while (0);
      if ((53 - $_1236_i | 0) > 1) {
       if (+_fmod(+$frac_1_i, +1.0) != 0.0) {
        $frac_2_i = $frac_1_i;
       } else {
        $frac_2_i = $frac_1_i + 1.0;
       }
      } else {
       $frac_2_i = $frac_1_i;
      }
     }
     $780 = $y_1_i103 + $frac_2_i - $bias_0_i;
     do {
      if (($815 & 2147483647 | 0) > (-2 - $sum_i | 0)) {
       if (+Math_abs(+$780) < 9007199254740992.0) {
        $y_2_i104 = $780;
        $denormal_2_i = $denormal_0_i;
        $e2_2_i = $e2_1_i;
       } else {
        $y_2_i104 = $780 * .5;
        $denormal_2_i = ($denormal_0_i | 0) != 0 & ($_1236_i | 0) == ($816 | 0) ? 0 : $denormal_0_i;
        $e2_2_i = $e2_1_i + 1 | 0;
       }
       if (($e2_2_i + 53 | 0) <= ($372 | 0)) {
        if (!(($denormal_2_i | 0) != 0 & $frac_2_i != 0.0)) {
         $y_3_i = $y_2_i104;
         $e2_3_i = $e2_2_i;
         break;
        }
       }
       HEAP32[(___errno_location() | 0) >> 2] = 34;
       $y_3_i = $y_2_i104;
       $e2_3_i = $e2_2_i;
      } else {
       $y_3_i = $780;
       $e2_3_i = $e2_1_i;
      }
     } while (0);
     $_0 = +_scalbnl($y_3_i, $e2_3_i);
     STACKTOP = sp;
     return +$_0;
    }
   } while (0);
   if ((HEAP32[$4 >> 2] | 0) != 0) {
    HEAP32[$3 >> 2] = (HEAP32[$3 >> 2] | 0) - 1;
   }
   HEAP32[(___errno_location() | 0) >> 2] = 22;
   ___shlim($f, 0);
   $_0 = 0.0;
   STACKTOP = sp;
   return +$_0;
  }
 } while (0);
 if ((label | 0) == 23) {
  $62 = (HEAP32[$4 >> 2] | 0) == 0;
  if (!$62) {
   HEAP32[$3 >> 2] = (HEAP32[$3 >> 2] | 0) - 1;
  }
  if (!($i_0_lcssa >>> 0 < 4 >>> 0 | ($pok | 0) == 0 | $62)) {
   $i_1146 = $i_0_lcssa;
   do {
    HEAP32[$3 >> 2] = (HEAP32[$3 >> 2] | 0) - 1;
    $i_1146 = $i_1146 - 1 | 0;
   } while ($i_1146 >>> 0 > 3 >>> 0);
  }
 }
 $_0 = +($sign_0 | 0) * Infinity;
 STACKTOP = sp;
 return +$_0;
}
function _free($mem) {
 $mem = $mem | 0;
 var $3 = 0, $4 = 0, $5 = 0, $10 = 0, $11 = 0, $14 = 0, $15 = 0, $16 = 0, $21 = 0, $_sum232 = 0, $24 = 0, $25 = 0, $26 = 0, $32 = 0, $37 = 0, $40 = 0, $43 = 0, $64 = 0, $_pre_phi308 = 0, $69 = 0, $72 = 0, $75 = 0, $80 = 0, $84 = 0, $88 = 0, $94 = 0, $95 = 0, $99 = 0, $100 = 0, $RP_0 = 0, $R_0 = 0, $102 = 0, $103 = 0, $106 = 0, $107 = 0, $R_1 = 0, $119 = 0, $120 = 0, $133 = 0, $150 = 0, $163 = 0, $176 = 0, $psize_0 = 0, $p_0 = 0, $188 = 0, $192 = 0, $193 = 0, $203 = 0, $214 = 0, $221 = 0, $222 = 0, $227 = 0, $230 = 0, $233 = 0, $256 = 0, $_pre_phi306 = 0, $261 = 0, $264 = 0, $267 = 0, $272 = 0, $277 = 0, $281 = 0, $287 = 0, $288 = 0, $292 = 0, $293 = 0, $RP9_0 = 0, $R7_0 = 0, $295 = 0, $296 = 0, $299 = 0, $300 = 0, $R7_1 = 0, $313 = 0, $314 = 0, $327 = 0, $344 = 0, $357 = 0, $psize_1 = 0, $382 = 0, $385 = 0, $387 = 0, $388 = 0, $389 = 0, $395 = 0, $396 = 0, $_pre_phi = 0, $F16_0 = 0, $406 = 0, $407 = 0, $414 = 0, $415 = 0, $418 = 0, $420 = 0, $423 = 0, $428 = 0, $I18_0 = 0, $435 = 0, $439 = 0, $440 = 0, $455 = 0, $T_0 = 0, $K19_0 = 0, $464 = 0, $465 = 0, $478 = 0, $479 = 0, $481 = 0, $493 = 0, $sp_0_in_i = 0, $sp_0_i = 0, label = 0;
 if (($mem | 0) == 0) {
  return;
 }
 $3 = $mem - 8 | 0;
 $4 = $3;
 $5 = HEAP32[3236] | 0;
 if ($3 >>> 0 < $5 >>> 0) {
  _abort();
 }
 $10 = HEAP32[$mem - 4 >> 2] | 0;
 $11 = $10 & 3;
 if (($11 | 0) == 1) {
  _abort();
 }
 $14 = $10 & -8;
 $15 = $mem + ($14 - 8) | 0;
 $16 = $15;
 do {
  if (($10 & 1 | 0) == 0) {
   $21 = HEAP32[$3 >> 2] | 0;
   if (($11 | 0) == 0) {
    return;
   }
   $_sum232 = -8 - $21 | 0;
   $24 = $mem + $_sum232 | 0;
   $25 = $24;
   $26 = $21 + $14 | 0;
   if ($24 >>> 0 < $5 >>> 0) {
    _abort();
   }
   if (($25 | 0) == (HEAP32[3237] | 0)) {
    $176 = $mem + ($14 - 4) | 0;
    if ((HEAP32[$176 >> 2] & 3 | 0) != 3) {
     $p_0 = $25;
     $psize_0 = $26;
     break;
    }
    HEAP32[3234] = $26;
    HEAP32[$176 >> 2] = HEAP32[$176 >> 2] & -2;
    HEAP32[$mem + ($_sum232 + 4) >> 2] = $26 | 1;
    HEAP32[$15 >> 2] = $26;
    return;
   }
   $32 = $21 >>> 3;
   if ($21 >>> 0 < 256 >>> 0) {
    $37 = HEAP32[$mem + ($_sum232 + 8) >> 2] | 0;
    $40 = HEAP32[$mem + ($_sum232 + 12) >> 2] | 0;
    $43 = 12968 + ($32 << 1 << 2) | 0;
    if (($37 | 0) != ($43 | 0)) {
     if ($37 >>> 0 < $5 >>> 0) {
      _abort();
     }
     if ((HEAP32[$37 + 12 >> 2] | 0) != ($25 | 0)) {
      _abort();
     }
    }
    if (($40 | 0) == ($37 | 0)) {
     HEAP32[3232] = HEAP32[3232] & ~(1 << $32);
     $p_0 = $25;
     $psize_0 = $26;
     break;
    }
    if (($40 | 0) == ($43 | 0)) {
     $_pre_phi308 = $40 + 8 | 0;
    } else {
     if ($40 >>> 0 < $5 >>> 0) {
      _abort();
     }
     $64 = $40 + 8 | 0;
     if ((HEAP32[$64 >> 2] | 0) == ($25 | 0)) {
      $_pre_phi308 = $64;
     } else {
      _abort();
     }
    }
    HEAP32[$37 + 12 >> 2] = $40;
    HEAP32[$_pre_phi308 >> 2] = $37;
    $p_0 = $25;
    $psize_0 = $26;
    break;
   }
   $69 = $24;
   $72 = HEAP32[$mem + ($_sum232 + 24) >> 2] | 0;
   $75 = HEAP32[$mem + ($_sum232 + 12) >> 2] | 0;
   do {
    if (($75 | 0) == ($69 | 0)) {
     $94 = $mem + ($_sum232 + 20) | 0;
     $95 = HEAP32[$94 >> 2] | 0;
     if (($95 | 0) == 0) {
      $99 = $mem + ($_sum232 + 16) | 0;
      $100 = HEAP32[$99 >> 2] | 0;
      if (($100 | 0) == 0) {
       $R_1 = 0;
       break;
      } else {
       $R_0 = $100;
       $RP_0 = $99;
      }
     } else {
      $R_0 = $95;
      $RP_0 = $94;
     }
     while (1) {
      $102 = $R_0 + 20 | 0;
      $103 = HEAP32[$102 >> 2] | 0;
      if (($103 | 0) != 0) {
       $R_0 = $103;
       $RP_0 = $102;
       continue;
      }
      $106 = $R_0 + 16 | 0;
      $107 = HEAP32[$106 >> 2] | 0;
      if (($107 | 0) == 0) {
       break;
      } else {
       $R_0 = $107;
       $RP_0 = $106;
      }
     }
     if ($RP_0 >>> 0 < $5 >>> 0) {
      _abort();
     } else {
      HEAP32[$RP_0 >> 2] = 0;
      $R_1 = $R_0;
      break;
     }
    } else {
     $80 = HEAP32[$mem + ($_sum232 + 8) >> 2] | 0;
     if ($80 >>> 0 < $5 >>> 0) {
      _abort();
     }
     $84 = $80 + 12 | 0;
     if ((HEAP32[$84 >> 2] | 0) != ($69 | 0)) {
      _abort();
     }
     $88 = $75 + 8 | 0;
     if ((HEAP32[$88 >> 2] | 0) == ($69 | 0)) {
      HEAP32[$84 >> 2] = $75;
      HEAP32[$88 >> 2] = $80;
      $R_1 = $75;
      break;
     } else {
      _abort();
     }
    }
   } while (0);
   if (($72 | 0) == 0) {
    $p_0 = $25;
    $psize_0 = $26;
   } else {
    $119 = HEAP32[$mem + ($_sum232 + 28) >> 2] | 0;
    $120 = 13232 + ($119 << 2) | 0;
    if (($69 | 0) == (HEAP32[$120 >> 2] | 0)) {
     HEAP32[$120 >> 2] = $R_1;
     if (($R_1 | 0) == 0) {
      HEAP32[3233] = HEAP32[3233] & ~(1 << $119);
      $p_0 = $25;
      $psize_0 = $26;
      break;
     }
    } else {
     if ($72 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
      _abort();
     }
     $133 = $72 + 16 | 0;
     if ((HEAP32[$133 >> 2] | 0) == ($69 | 0)) {
      HEAP32[$133 >> 2] = $R_1;
     } else {
      HEAP32[$72 + 20 >> 2] = $R_1;
     }
     if (($R_1 | 0) == 0) {
      $p_0 = $25;
      $psize_0 = $26;
      break;
     }
    }
    if ($R_1 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
     _abort();
    }
    HEAP32[$R_1 + 24 >> 2] = $72;
    $150 = HEAP32[$mem + ($_sum232 + 16) >> 2] | 0;
    do {
     if (($150 | 0) != 0) {
      if ($150 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
       _abort();
      } else {
       HEAP32[$R_1 + 16 >> 2] = $150;
       HEAP32[$150 + 24 >> 2] = $R_1;
       break;
      }
     }
    } while (0);
    $163 = HEAP32[$mem + ($_sum232 + 20) >> 2] | 0;
    if (($163 | 0) == 0) {
     $p_0 = $25;
     $psize_0 = $26;
    } else {
     if ($163 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
      _abort();
     } else {
      HEAP32[$R_1 + 20 >> 2] = $163;
      HEAP32[$163 + 24 >> 2] = $R_1;
      $p_0 = $25;
      $psize_0 = $26;
      break;
     }
    }
   }
  } else {
   $p_0 = $4;
   $psize_0 = $14;
  }
 } while (0);
 $188 = $p_0;
 if (!($188 >>> 0 < $15 >>> 0)) {
  _abort();
 }
 $192 = $mem + ($14 - 4) | 0;
 $193 = HEAP32[$192 >> 2] | 0;
 if (($193 & 1 | 0) == 0) {
  _abort();
 }
 if (($193 & 2 | 0) == 0) {
  if (($16 | 0) == (HEAP32[3238] | 0)) {
   $203 = (HEAP32[3235] | 0) + $psize_0 | 0;
   HEAP32[3235] = $203;
   HEAP32[3238] = $p_0;
   HEAP32[$p_0 + 4 >> 2] = $203 | 1;
   if (($p_0 | 0) != (HEAP32[3237] | 0)) {
    return;
   }
   HEAP32[3237] = 0;
   HEAP32[3234] = 0;
   return;
  }
  if (($16 | 0) == (HEAP32[3237] | 0)) {
   $214 = (HEAP32[3234] | 0) + $psize_0 | 0;
   HEAP32[3234] = $214;
   HEAP32[3237] = $p_0;
   HEAP32[$p_0 + 4 >> 2] = $214 | 1;
   HEAP32[$188 + $214 >> 2] = $214;
   return;
  }
  $221 = ($193 & -8) + $psize_0 | 0;
  $222 = $193 >>> 3;
  do {
   if ($193 >>> 0 < 256 >>> 0) {
    $227 = HEAP32[$mem + $14 >> 2] | 0;
    $230 = HEAP32[$mem + ($14 | 4) >> 2] | 0;
    $233 = 12968 + ($222 << 1 << 2) | 0;
    if (($227 | 0) != ($233 | 0)) {
     if ($227 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
      _abort();
     }
     if ((HEAP32[$227 + 12 >> 2] | 0) != ($16 | 0)) {
      _abort();
     }
    }
    if (($230 | 0) == ($227 | 0)) {
     HEAP32[3232] = HEAP32[3232] & ~(1 << $222);
     break;
    }
    if (($230 | 0) == ($233 | 0)) {
     $_pre_phi306 = $230 + 8 | 0;
    } else {
     if ($230 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
      _abort();
     }
     $256 = $230 + 8 | 0;
     if ((HEAP32[$256 >> 2] | 0) == ($16 | 0)) {
      $_pre_phi306 = $256;
     } else {
      _abort();
     }
    }
    HEAP32[$227 + 12 >> 2] = $230;
    HEAP32[$_pre_phi306 >> 2] = $227;
   } else {
    $261 = $15;
    $264 = HEAP32[$mem + ($14 + 16) >> 2] | 0;
    $267 = HEAP32[$mem + ($14 | 4) >> 2] | 0;
    do {
     if (($267 | 0) == ($261 | 0)) {
      $287 = $mem + ($14 + 12) | 0;
      $288 = HEAP32[$287 >> 2] | 0;
      if (($288 | 0) == 0) {
       $292 = $mem + ($14 + 8) | 0;
       $293 = HEAP32[$292 >> 2] | 0;
       if (($293 | 0) == 0) {
        $R7_1 = 0;
        break;
       } else {
        $R7_0 = $293;
        $RP9_0 = $292;
       }
      } else {
       $R7_0 = $288;
       $RP9_0 = $287;
      }
      while (1) {
       $295 = $R7_0 + 20 | 0;
       $296 = HEAP32[$295 >> 2] | 0;
       if (($296 | 0) != 0) {
        $R7_0 = $296;
        $RP9_0 = $295;
        continue;
       }
       $299 = $R7_0 + 16 | 0;
       $300 = HEAP32[$299 >> 2] | 0;
       if (($300 | 0) == 0) {
        break;
       } else {
        $R7_0 = $300;
        $RP9_0 = $299;
       }
      }
      if ($RP9_0 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
       _abort();
      } else {
       HEAP32[$RP9_0 >> 2] = 0;
       $R7_1 = $R7_0;
       break;
      }
     } else {
      $272 = HEAP32[$mem + $14 >> 2] | 0;
      if ($272 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
       _abort();
      }
      $277 = $272 + 12 | 0;
      if ((HEAP32[$277 >> 2] | 0) != ($261 | 0)) {
       _abort();
      }
      $281 = $267 + 8 | 0;
      if ((HEAP32[$281 >> 2] | 0) == ($261 | 0)) {
       HEAP32[$277 >> 2] = $267;
       HEAP32[$281 >> 2] = $272;
       $R7_1 = $267;
       break;
      } else {
       _abort();
      }
     }
    } while (0);
    if (($264 | 0) != 0) {
     $313 = HEAP32[$mem + ($14 + 20) >> 2] | 0;
     $314 = 13232 + ($313 << 2) | 0;
     if (($261 | 0) == (HEAP32[$314 >> 2] | 0)) {
      HEAP32[$314 >> 2] = $R7_1;
      if (($R7_1 | 0) == 0) {
       HEAP32[3233] = HEAP32[3233] & ~(1 << $313);
       break;
      }
     } else {
      if ($264 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
       _abort();
      }
      $327 = $264 + 16 | 0;
      if ((HEAP32[$327 >> 2] | 0) == ($261 | 0)) {
       HEAP32[$327 >> 2] = $R7_1;
      } else {
       HEAP32[$264 + 20 >> 2] = $R7_1;
      }
      if (($R7_1 | 0) == 0) {
       break;
      }
     }
     if ($R7_1 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
      _abort();
     }
     HEAP32[$R7_1 + 24 >> 2] = $264;
     $344 = HEAP32[$mem + ($14 + 8) >> 2] | 0;
     do {
      if (($344 | 0) != 0) {
       if ($344 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
        _abort();
       } else {
        HEAP32[$R7_1 + 16 >> 2] = $344;
        HEAP32[$344 + 24 >> 2] = $R7_1;
        break;
       }
      }
     } while (0);
     $357 = HEAP32[$mem + ($14 + 12) >> 2] | 0;
     if (($357 | 0) != 0) {
      if ($357 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
       _abort();
      } else {
       HEAP32[$R7_1 + 20 >> 2] = $357;
       HEAP32[$357 + 24 >> 2] = $R7_1;
       break;
      }
     }
    }
   }
  } while (0);
  HEAP32[$p_0 + 4 >> 2] = $221 | 1;
  HEAP32[$188 + $221 >> 2] = $221;
  if (($p_0 | 0) == (HEAP32[3237] | 0)) {
   HEAP32[3234] = $221;
   return;
  } else {
   $psize_1 = $221;
  }
 } else {
  HEAP32[$192 >> 2] = $193 & -2;
  HEAP32[$p_0 + 4 >> 2] = $psize_0 | 1;
  HEAP32[$188 + $psize_0 >> 2] = $psize_0;
  $psize_1 = $psize_0;
 }
 $382 = $psize_1 >>> 3;
 if ($psize_1 >>> 0 < 256 >>> 0) {
  $385 = $382 << 1;
  $387 = 12968 + ($385 << 2) | 0;
  $388 = HEAP32[3232] | 0;
  $389 = 1 << $382;
  if (($388 & $389 | 0) == 0) {
   HEAP32[3232] = $388 | $389;
   $F16_0 = $387;
   $_pre_phi = 12968 + ($385 + 2 << 2) | 0;
  } else {
   $395 = 12968 + ($385 + 2 << 2) | 0;
   $396 = HEAP32[$395 >> 2] | 0;
   if ($396 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
    _abort();
   } else {
    $F16_0 = $396;
    $_pre_phi = $395;
   }
  }
  HEAP32[$_pre_phi >> 2] = $p_0;
  HEAP32[$F16_0 + 12 >> 2] = $p_0;
  HEAP32[$p_0 + 8 >> 2] = $F16_0;
  HEAP32[$p_0 + 12 >> 2] = $387;
  return;
 }
 $406 = $p_0;
 $407 = $psize_1 >>> 8;
 if (($407 | 0) == 0) {
  $I18_0 = 0;
 } else {
  if ($psize_1 >>> 0 > 16777215 >>> 0) {
   $I18_0 = 31;
  } else {
   $414 = ($407 + 1048320 | 0) >>> 16 & 8;
   $415 = $407 << $414;
   $418 = ($415 + 520192 | 0) >>> 16 & 4;
   $420 = $415 << $418;
   $423 = ($420 + 245760 | 0) >>> 16 & 2;
   $428 = 14 - ($418 | $414 | $423) + ($420 << $423 >>> 15) | 0;
   $I18_0 = $psize_1 >>> (($428 + 7 | 0) >>> 0) & 1 | $428 << 1;
  }
 }
 $435 = 13232 + ($I18_0 << 2) | 0;
 HEAP32[$p_0 + 28 >> 2] = $I18_0;
 HEAP32[$p_0 + 20 >> 2] = 0;
 HEAP32[$p_0 + 16 >> 2] = 0;
 $439 = HEAP32[3233] | 0;
 $440 = 1 << $I18_0;
 do {
  if (($439 & $440 | 0) == 0) {
   HEAP32[3233] = $439 | $440;
   HEAP32[$435 >> 2] = $406;
   HEAP32[$p_0 + 24 >> 2] = $435;
   HEAP32[$p_0 + 12 >> 2] = $p_0;
   HEAP32[$p_0 + 8 >> 2] = $p_0;
  } else {
   if (($I18_0 | 0) == 31) {
    $455 = 0;
   } else {
    $455 = 25 - ($I18_0 >>> 1) | 0;
   }
   $K19_0 = $psize_1 << $455;
   $T_0 = HEAP32[$435 >> 2] | 0;
   while (1) {
    if ((HEAP32[$T_0 + 4 >> 2] & -8 | 0) == ($psize_1 | 0)) {
     break;
    }
    $464 = $T_0 + 16 + ($K19_0 >>> 31 << 2) | 0;
    $465 = HEAP32[$464 >> 2] | 0;
    if (($465 | 0) == 0) {
     label = 129;
     break;
    } else {
     $K19_0 = $K19_0 << 1;
     $T_0 = $465;
    }
   }
   if ((label | 0) == 129) {
    if ($464 >>> 0 < (HEAP32[3236] | 0) >>> 0) {
     _abort();
    } else {
     HEAP32[$464 >> 2] = $406;
     HEAP32[$p_0 + 24 >> 2] = $T_0;
     HEAP32[$p_0 + 12 >> 2] = $p_0;
     HEAP32[$p_0 + 8 >> 2] = $p_0;
     break;
    }
   }
   $478 = $T_0 + 8 | 0;
   $479 = HEAP32[$478 >> 2] | 0;
   $481 = HEAP32[3236] | 0;
   if ($T_0 >>> 0 < $481 >>> 0) {
    _abort();
   }
   if ($479 >>> 0 < $481 >>> 0) {
    _abort();
   } else {
    HEAP32[$479 + 12 >> 2] = $406;
    HEAP32[$478 >> 2] = $406;
    HEAP32[$p_0 + 8 >> 2] = $479;
    HEAP32[$p_0 + 12 >> 2] = $T_0;
    HEAP32[$p_0 + 24 >> 2] = 0;
    break;
   }
  }
 } while (0);
 $493 = (HEAP32[3240] | 0) - 1 | 0;
 HEAP32[3240] = $493;
 if (($493 | 0) == 0) {
  $sp_0_in_i = 13384;
 } else {
  return;
 }
 while (1) {
  $sp_0_i = HEAP32[$sp_0_in_i >> 2] | 0;
  if (($sp_0_i | 0) == 0) {
   break;
  } else {
   $sp_0_in_i = $sp_0_i + 8 | 0;
  }
 }
 HEAP32[3240] = -1;
 return;
}
function _read_conductors($defn) {
 $defn = $defn | 0;
 var $signum_i = 0, $i = 0, $1 = 0, $4 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $16 = 0, $n_0_ph68 = 0, $count_conductors_0_ph67 = 0, $using_geometry_0_ph66 = 0, $n_0_ph3451 = 0, $count_conductors_0_ph3349 = 0, $n_037_us = 0, $17 = 0, $23 = 0, $33 = 0, $39 = 0, $44 = 0, $50 = 0, $56 = 0, $61 = 0, $n_037 = 0, $68 = 0, $74 = 0, $_lcssa = 0, $89 = 0, $_lcssa36 = 0, $_lcssa35 = 0, $93 = 0, $112 = 0, $124 = 0, $129 = 0, $count_conductors_0_ph3345 = 0, $137 = 0, $146 = 0, $152 = 0, $158 = 0, $159 = 0, $160 = 0, $165 = 0, $i_0115_i = 0, $169 = 0, $172 = 0.0, $179 = 0, $182 = 0.0, $i_1112_i = 0, $188 = 0.0, $189 = 0.0, $190 = 0.0, $196 = 0, $j_0108_i = 0, $198 = 0.0, $199 = 0.0, $200 = 0.0, $201 = 0.0, $208 = 0, $214 = 0.0, $216 = 0.0, $226 = 0, $i_2106_i = 0, $j_1104_i = 0, $230 = 0, $236 = 0, $239 = 0, $244 = 0, $248 = 0, $252 = 0, $263 = 0, label = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 $signum_i = sp | 0;
 $i = sp + 8 | 0;
 $1 = HEAP32[3122] | 0;
 if (($1 | 0) < 1) {
  $4 = HEAP32[3164] | 0;
  if (($4 | 0) != 0) {
   _fprintf($4 | 0, 10664, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = $1, tempVarArgs) | 0) | 0;
   STACKTOP = tempVarArgs;
  }
  _oe_exit(6);
 }
 $10 = _gsl_vector_calloc($1) | 0;
 $11 = _gsl_vector_calloc($1) | 0;
 $12 = _gsl_vector_calloc($1) | 0;
 $13 = _gsl_vector_calloc($1) | 0;
 do {
  if ((HEAP32[3122] | 0) > 0) {
   $16 = $defn + 16 | 0;
   $using_geometry_0_ph66 = 0;
   $count_conductors_0_ph67 = 0;
   $n_0_ph68 = 0;
   L9 : while (1) {
    $count_conductors_0_ph3349 = $count_conductors_0_ph67;
    $n_0_ph3451 = $n_0_ph68;
    L11 : while (1) {
     L13 : do {
      if ($using_geometry_0_ph66) {
       $n_037_us = $n_0_ph3451;
       while (1) {
        $17 = _first_token() | 0;
        if (($17 | 0) == 0) {
         label = 80;
         break L9;
        }
        if ((_strcmp($17, 2512) | 0) == 0) {
         label = 80;
         break L9;
        }
        $23 = $n_037_us + 1 | 0;
        if ((_strcmp($17, 2664) | 0) == 0) {
         $_lcssa = $23;
         break L11;
        }
        if ((_strcmp($17, 2616) | 0) == 0) {
         $50 = HEAP32[3164] | 0;
         if (($50 | 0) != 0) {
          _fwrite(10136, 53, 1, $50 | 0) | 0;
         }
         _oe_exit(22);
         _next_int($i) | 0;
         $56 = HEAP32[$i >> 2] | 0;
         if (!(($56 | 0) < 1 | ($56 | 0) > (HEAP32[3122] | 0))) {
          $_lcssa35 = $23;
          $_lcssa36 = $56;
          break L13;
         }
         $61 = HEAP32[3164] | 0;
         if (($61 | 0) != 0) {
          _fprintf($61 | 0, 9752, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = $56, tempVarArgs) | 0) | 0;
          STACKTOP = tempVarArgs;
         }
         _oe_exit(9);
        } else {
         if ((_strcmp($17, 856) | 0) == 0) {
          $33 = HEAP32[3164] | 0;
          if (($33 | 0) != 0) {
           _fwrite(10136, 53, 1, $33 | 0) | 0;
          }
          _oe_exit(22);
          _next_int($i) | 0;
          $39 = HEAP32[$i >> 2] | 0;
          if (($39 | 0) < 1 | ($39 | 0) > (HEAP32[3122] | 0)) {
           $44 = HEAP32[3164] | 0;
           if (($44 | 0) != 0) {
            _fprintf($44 | 0, 9424, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = $39, tempVarArgs) | 0) | 0;
            STACKTOP = tempVarArgs;
           }
           _oe_exit(9);
          }
         }
        }
        if (($23 | 0) < (HEAP32[3122] | 0)) {
         $n_037_us = $23;
        } else {
         label = 80;
         break L9;
        }
       }
      } else {
       $n_037 = $n_0_ph3451;
       while (1) {
        $68 = _first_token() | 0;
        if (($68 | 0) == 0) {
         $count_conductors_0_ph3345 = $count_conductors_0_ph3349;
         label = 46;
         break L9;
        }
        if ((_strcmp($68, 2512) | 0) == 0) {
         $count_conductors_0_ph3345 = $count_conductors_0_ph3349;
         label = 46;
         break L9;
        }
        $74 = $n_037 + 1 | 0;
        if ((_strcmp($68, 2664) | 0) == 0) {
         $_lcssa = $74;
         break L11;
        }
        if ((_strcmp($68, 2616) | 0) == 0) {
         _next_int($i) | 0;
         $89 = HEAP32[$i >> 2] | 0;
         if (!(($89 | 0) < 1 | ($89 | 0) > (HEAP32[3122] | 0))) {
          $_lcssa35 = $74;
          $_lcssa36 = $89;
          break L13;
         }
         $112 = HEAP32[3164] | 0;
         if (($112 | 0) != 0) {
          _fprintf($112 | 0, 9752, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = $89, tempVarArgs) | 0) | 0;
          STACKTOP = tempVarArgs;
         }
         _oe_exit(9);
        } else {
         if ((_strcmp($68, 856) | 0) == 0) {
          _next_int($i) | 0;
          $124 = HEAP32[$i >> 2] | 0;
          if (($124 | 0) < 1 | ($124 | 0) > (HEAP32[3122] | 0)) {
           $129 = HEAP32[3164] | 0;
           if (($129 | 0) != 0) {
            _fprintf($129 | 0, 9424, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = $124, tempVarArgs) | 0) | 0;
            STACKTOP = tempVarArgs;
           }
           _oe_exit(9);
          }
         }
        }
        if (($74 | 0) < (HEAP32[3122] | 0)) {
         $n_037 = $74;
        } else {
         $count_conductors_0_ph3345 = $count_conductors_0_ph3349;
         label = 46;
         break L9;
        }
       }
      }
     } while (0);
     $93 = $count_conductors_0_ph3349 + 1 | 0;
     _next_double(_gsl_vector_ptr($10, $_lcssa36 - 1 | 0) | 0) | 0;
     _next_double(_gsl_vector_ptr($12, (HEAP32[$i >> 2] | 0) - 1 | 0) | 0) | 0;
     _next_double(_gsl_vector_ptr($11, (HEAP32[$i >> 2] | 0) - 1 | 0) | 0) | 0;
     _next_double(_gsl_vector_ptr($13, (HEAP32[$i >> 2] | 0) - 1 | 0) | 0) | 0;
     if (($_lcssa35 | 0) < (HEAP32[3122] | 0)) {
      $count_conductors_0_ph3349 = $93;
      $n_0_ph3451 = $_lcssa35;
     } else {
      $count_conductors_0_ph3345 = $93;
      label = 46;
      break L9;
     }
    }
    if ((HEAP32[$16 >> 2] | 0) == 0) {
     _allocate_definition_memory($defn, HEAP32[3122] | 0);
    }
    _read_cables($defn) | 0;
    if (($_lcssa | 0) < (HEAP32[3122] | 0)) {
     $using_geometry_0_ph66 = 1;
     $count_conductors_0_ph67 = $count_conductors_0_ph3349;
     $n_0_ph68 = $_lcssa;
    } else {
     label = 80;
     break;
    }
   }
   if ((label | 0) == 46) {
    if ($using_geometry_0_ph66) {
     _gsl_vector_free($10);
     _gsl_vector_free($11);
     _gsl_vector_free($12);
     _gsl_vector_free($13);
     STACKTOP = sp;
     return 0;
    }
    HEAP32[3124] = $count_conductors_0_ph3345;
    if (($count_conductors_0_ph3345 | 0) < 1) {
     label = 48;
     break;
    }
    if (($count_conductors_0_ph3345 | 0) <= (HEAP32[3122] | 0)) {
     break;
    }
    $146 = HEAP32[3164] | 0;
    if (($146 | 0) != 0) {
     _fwrite(9024, 42, 1, $146 | 0) | 0;
    }
    _oe_exit(8);
    break;
   } else if ((label | 0) == 80) {
    _gsl_vector_free($10);
    _gsl_vector_free($11);
    _gsl_vector_free($12);
    _gsl_vector_free($13);
    STACKTOP = sp;
    return 0;
   }
  } else {
   HEAP32[3124] = 0;
   label = 48;
  }
 } while (0);
 if ((label | 0) == 48) {
  $137 = HEAP32[3164] | 0;
  if (($137 | 0) != 0) {
   _fwrite(9216, 37, 1, $137 | 0) | 0;
  }
  _oe_exit(10);
 }
 $152 = $defn + 16 | 0;
 if ((HEAP32[$152 >> 2] | 0) == 0) {
  _allocate_definition_memory($defn, HEAP32[3124] | 0);
 }
 $158 = HEAP32[3124] | 0;
 $159 = _gsl_matrix_calloc($158, $158) | 0;
 $160 = _gsl_vector_calloc($158) | 0;
 _gsl_vector_memcpy(HEAP32[$defn + 36 >> 2] | 0, $13) | 0;
 if (($158 | 0) > 0) {
  $i_0115_i = 0;
  do {
   if (!(+_gsl_vector_get($11, $i_0115_i) > 0.0)) {
    $169 = HEAP32[3164] | 0;
    if (($169 | 0) != 0) {
     $172 = +_gsl_vector_get($11, $i_0115_i);
     _fprintf($169 | 0, 8752, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAPF64[tempVarArgs >> 3] = $172, HEAP32[tempVarArgs + 8 >> 2] = $i_0115_i, tempVarArgs) | 0) | 0;
     STACKTOP = tempVarArgs;
    }
    _oe_exit(11);
   }
   if (!(+_gsl_vector_get($10, $i_0115_i) > 0.0)) {
    $179 = HEAP32[3164] | 0;
    if (($179 | 0) != 0) {
     $182 = +_gsl_vector_get($10, $i_0115_i);
     _fprintf($179 | 0, 8648, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAPF64[tempVarArgs >> 3] = $182, HEAP32[tempVarArgs + 8 >> 2] = $i_0115_i, tempVarArgs) | 0) | 0;
     STACKTOP = tempVarArgs;
    }
    _oe_exit(12);
   }
   $i_0115_i = $i_0115_i + 1 | 0;
  } while (($i_0115_i | 0) < ($158 | 0));
  $165 = $defn + 8 | 0;
  $i_1112_i = 0;
  L101 : while (1) {
   $188 = +_gsl_vector_get($12, $i_1112_i);
   $189 = +_gsl_vector_get($10, $i_1112_i);
   $190 = +_gsl_vector_get($11, $i_1112_i);
   _gsl_matrix_set(HEAP32[$165 >> 2] | 0, $i_1112_i, $i_1112_i, +Math_log($189 * 2.0 / $190) * 60.0);
   $196 = $i_1112_i + 1 | 0;
   if (($196 | 0) < ($158 | 0)) {
    $j_0108_i = $196;
   } else {
    break;
   }
   while (1) {
    $198 = +_gsl_vector_get($12, $j_0108_i);
    $199 = +_gsl_vector_get($10, $j_0108_i);
    $200 = $188 - $198;
    $201 = $189 - $199;
    if (+Math_abs(+$200) < .001) {
     if (+Math_abs(+$201) < .001) {
      $208 = HEAP32[3164] | 0;
      if (($208 | 0) != 0) {
       _fprintf($208 | 0, 8488, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempVarArgs >> 2] = $i_1112_i, HEAP32[tempVarArgs + 8 >> 2] = $j_0108_i, tempVarArgs) | 0) | 0;
       STACKTOP = tempVarArgs;
      }
      _oe_exit(1);
     }
    }
    $214 = $189 + $199;
    $216 = $200 * $200;
    _gsl_matrix_set(HEAP32[$165 >> 2] | 0, $i_1112_i, $j_0108_i, +Math_log(+Math_sqrt($216 + $214 * $214) / +Math_sqrt($216 + $201 * $201)) * 60.0);
    $226 = $j_0108_i + 1 | 0;
    if (($226 | 0) < ($158 | 0)) {
     $j_0108_i = $226;
    } else {
     $i_1112_i = $196;
     continue L101;
    }
   }
  }
  if (($158 | 0) > 1) {
   $i_2106_i = 1;
   do {
    $j_1104_i = 0;
    do {
     $230 = HEAP32[$165 >> 2] | 0;
     _gsl_matrix_set($230, $i_2106_i, $j_1104_i, +_gsl_matrix_get($230, $j_1104_i, $i_2106_i));
     $j_1104_i = $j_1104_i + 1 | 0;
    } while (($j_1104_i | 0) < ($i_2106_i | 0));
    $i_2106_i = $i_2106_i + 1 | 0;
   } while (($i_2106_i | 0) < ($158 | 0));
  }
 }
 $236 = $defn + 8 | 0;
 _gsl_matrix_memcpy($159, HEAP32[$236 >> 2] | 0) | 0;
 $239 = _gsl_eigen_symmv_alloc($158) | 0;
 _gsl_eigen_symmv($159, $160, HEAP32[$152 >> 2] | 0, $239) | 0;
 _gsl_eigen_symmv_sort($160, HEAP32[$152 >> 2] | 0, 0) | 0;
 _gsl_eigen_symmv_free($239);
 $244 = $defn + 20 | 0;
 _gsl_matrix_transpose_memcpy(HEAP32[$244 >> 2] | 0, HEAP32[$152 >> 2] | 0) | 0;
 $248 = _gsl_permutation_alloc($158) | 0;
 _gsl_matrix_memcpy($159, HEAP32[$152 >> 2] | 0) | 0;
 _gsl_linalg_LU_decomp($159, $248, $signum_i) | 0;
 $252 = $defn + 28 | 0;
 _gsl_linalg_LU_invert($159, $248, HEAP32[$252 >> 2] | 0) | 0;
 _gsl_matrix_transpose_memcpy(HEAP32[$defn + 24 >> 2] | 0, HEAP32[$252 >> 2] | 0) | 0;
 _gsl_blas_dgemm(111, 111, 1.0, HEAP32[$236 >> 2] | 0, HEAP32[$152 >> 2] | 0, 0.0, $159) | 0;
 $263 = $defn | 0;
 _gsl_blas_dgemm(111, 111, 1.0, HEAP32[$244 >> 2] | 0, $159, 0.0, HEAP32[$263 >> 2] | 0) | 0;
 _gsl_matrix_memcpy($159, HEAP32[$236 >> 2] | 0) | 0;
 _gsl_linalg_LU_decomp($159, $248, $signum_i) | 0;
 _gsl_linalg_LU_invert($159, $248, HEAP32[$defn + 12 >> 2] | 0) | 0;
 _gsl_matrix_memcpy($159, HEAP32[$263 >> 2] | 0) | 0;
 _gsl_linalg_LU_decomp($159, $248, $signum_i) | 0;
 _gsl_linalg_LU_invert($159, $248, HEAP32[$defn + 4 >> 2] | 0) | 0;
 _gsl_permutation_free($248);
 _gsl_matrix_free($159);
 _gsl_vector_free($160);
 _gsl_vector_free($10);
 _gsl_vector_free($11);
 _gsl_vector_free($12);
 _gsl_vector_free($13);
 STACKTOP = sp;
 return 0;
}
function _cleanup() {
 var $1 = 0, $5 = 0, $i_059 = 0, $8 = 0, $11 = 0, $_lcssa58 = 0, $14 = 0, $18 = 0, $i_154 = 0, $21 = 0, $24 = 0, $_lcssa = 0, $27 = 0, $31 = 0, $_pr = 0, $35 = 0, $71 = 0, $_pr7 = 0, $76 = 0, $_pr9 = 0, $83 = 0, $87 = 0, $91 = 0, $_pr11 = 0, $96 = 0, $_pr13 = 0, $103 = 0, $_pr15 = 0, $110 = 0, $_pr17 = 0, $117 = 0, $_pr19 = 0, $124 = 0, $_pr21 = 0, $131 = 0, $_pr23 = 0, $138 = 0, $_pr25 = 0, $145 = 0, $_pr27 = 0, $152 = 0, $_pr29 = 0, $159 = 0, $163 = 0, $167 = 0, $169 = 0, $173 = 0, $_pr31 = 0, $178 = 0, $182 = 0, $186 = 0, $188 = 0, $192 = 0, $194 = 0, $198 = 0, $200 = 0, $204 = 0, $206 = 0, $210 = 0, $212 = 0, $216 = 0, $218 = 0, $222 = 0, $224 = 0, $229 = 0, $231 = 0, $235 = 0, $237 = 0, $241 = 0, $243 = 0, $247 = 0, $249 = 0, $253 = 0, $255 = 0, $259 = 0, $261 = 0, $265 = 0, $267 = 0, $271 = 0, $_pr33 = 0, $276 = 0, $280 = 0, $288 = 0, $_pr35 = 0, $293 = 0, $297 = 0, $302 = 0, $_pr37 = 0, $307 = 0, $311 = 0, $319 = 0, $323 = 0;
 $1 = HEAP32[2980] | 0;
 if (($1 | 0) != 0) {
  if ((HEAP32[3120] | 0) < 0) {
   $_lcssa58 = $1;
  } else {
   $i_059 = 0;
   $5 = $1;
   while (1) {
    _free(HEAP32[$5 + ($i_059 << 2) >> 2] | 0);
    $8 = $i_059 + 1 | 0;
    $11 = HEAP32[2980] | 0;
    if (($8 | 0) > (HEAP32[3120] | 0)) {
     $_lcssa58 = $11;
     break;
    } else {
     $i_059 = $8;
     $5 = $11;
    }
   }
  }
  _free($_lcssa58);
 }
 $14 = HEAP32[2990] | 0;
 if (($14 | 0) != 0) {
  if ((HEAP32[3122] | 0) < 0) {
   $_lcssa = $14;
  } else {
   $i_154 = 0;
   $18 = $14;
   while (1) {
    _free(HEAP32[$18 + ($i_154 << 2) >> 2] | 0);
    $21 = $i_154 + 1 | 0;
    $24 = HEAP32[2990] | 0;
    if (($21 | 0) > (HEAP32[3122] | 0)) {
     $_lcssa = $24;
     break;
    } else {
     $i_154 = $21;
     $18 = $24;
    }
   }
  }
  _free($_lcssa);
 }
 $27 = HEAP32[2976] | 0;
 if (($27 | 0) != 0) {
  _gsl_vector_int_free($27);
 }
 $31 = HEAP32[2992] | 0;
 if (($31 | 0) != 0) {
  _gsl_matrix_int_free($31);
 }
 $_pr = HEAP32[2896] | 0;
 if (($_pr | 0) != 0) {
  $35 = $_pr;
  do {
   HEAP32[2894] = HEAP32[$35 + 52 >> 2];
   if ((HEAP32[3124] | 0) > 0) {
    _gsl_matrix_free(HEAP32[$35 + 16 >> 2] | 0);
    _gsl_matrix_free(HEAP32[(HEAP32[2896] | 0) + 20 >> 2] | 0);
    _gsl_matrix_free(HEAP32[(HEAP32[2896] | 0) + 24 >> 2] | 0);
    _gsl_matrix_free(HEAP32[(HEAP32[2896] | 0) + 28 >> 2] | 0);
    _gsl_matrix_free(HEAP32[(HEAP32[2896] | 0) + 8 >> 2] | 0);
    _gsl_matrix_free(HEAP32[HEAP32[2896] >> 2] | 0);
    _gsl_matrix_free(HEAP32[(HEAP32[2896] | 0) + 12 >> 2] | 0);
    _gsl_matrix_free(HEAP32[(HEAP32[2896] | 0) + 4 >> 2] | 0);
    _gsl_vector_free(HEAP32[(HEAP32[2896] | 0) + 32 >> 2] | 0);
    _gsl_vector_free(HEAP32[(HEAP32[2896] | 0) + 36 >> 2] | 0);
    $71 = HEAP32[2896] | 0;
   } else {
    $71 = $35;
   }
   _free($71);
   $35 = HEAP32[2894] | 0;
   HEAP32[2896] = $35;
  } while (($35 | 0) != 0);
 }
 $_pr7 = HEAP32[2884] | 0;
 if (($_pr7 | 0) != 0) {
  $76 = $_pr7;
  do {
   HEAP32[2882] = HEAP32[$76 + 76 >> 2];
   _free($76);
   $76 = HEAP32[2882] | 0;
   HEAP32[2884] = $76;
  } while (($76 | 0) != 0);
 }
 $_pr9 = HEAP32[2902] | 0;
 if (($_pr9 | 0) != 0) {
  $83 = $_pr9;
  do {
   HEAP32[2900] = HEAP32[$83 + 8 >> 2];
   $87 = HEAP32[$83 >> 2] | 0;
   if (($87 | 0) == 0) {
    $91 = $83;
   } else {
    _gsl_vector_free($87);
    $91 = HEAP32[2902] | 0;
   }
   _free($91);
   $83 = HEAP32[2900] | 0;
   HEAP32[2902] = $83;
  } while (($83 | 0) != 0);
 }
 $_pr11 = HEAP32[3188] | 0;
 if (($_pr11 | 0) != 0) {
  $96 = $_pr11;
  do {
   HEAP32[3186] = HEAP32[$96 + 108 >> 2];
   _free($96);
   $96 = HEAP32[3186] | 0;
   HEAP32[3188] = $96;
  } while (($96 | 0) != 0);
 }
 $_pr13 = HEAP32[2972] | 0;
 if (($_pr13 | 0) != 0) {
  $103 = $_pr13;
  do {
   HEAP32[2970] = HEAP32[$103 + 20 >> 2];
   _free($103);
   $103 = HEAP32[2970] | 0;
   HEAP32[2972] = $103;
  } while (($103 | 0) != 0);
 }
 $_pr15 = HEAP32[3178] | 0;
 if (($_pr15 | 0) != 0) {
  $110 = $_pr15;
  do {
   HEAP32[3176] = HEAP32[$110 + 60 >> 2];
   _free($110);
   $110 = HEAP32[3176] | 0;
   HEAP32[3178] = $110;
  } while (($110 | 0) != 0);
 }
 $_pr17 = HEAP32[3204] | 0;
 if (($_pr17 | 0) != 0) {
  $117 = $_pr17;
  do {
   HEAP32[3202] = HEAP32[$117 + 36 >> 2];
   _free($117);
   $117 = HEAP32[3202] | 0;
   HEAP32[3204] = $117;
  } while (($117 | 0) != 0);
 }
 $_pr19 = HEAP32[3200] | 0;
 if (($_pr19 | 0) != 0) {
  $124 = $_pr19;
  do {
   HEAP32[3198] = HEAP32[$124 + 72 >> 2];
   _free($124);
   $124 = HEAP32[3198] | 0;
   HEAP32[3200] = $124;
  } while (($124 | 0) != 0);
 }
 $_pr21 = HEAP32[3174] | 0;
 if (($_pr21 | 0) != 0) {
  $131 = $_pr21;
  do {
   HEAP32[3172] = HEAP32[$131 + 80 >> 2];
   _free($131);
   $131 = HEAP32[3172] | 0;
   HEAP32[3174] = $131;
  } while (($131 | 0) != 0);
 }
 $_pr23 = HEAP32[3216] | 0;
 if (($_pr23 | 0) != 0) {
  $138 = $_pr23;
  do {
   HEAP32[3214] = HEAP32[$138 + 168 >> 2];
   _free($138);
   $138 = HEAP32[3214] | 0;
   HEAP32[3216] = $138;
  } while (($138 | 0) != 0);
 }
 $_pr25 = HEAP32[2988] | 0;
 if (($_pr25 | 0) != 0) {
  $145 = $_pr25;
  do {
   HEAP32[2986] = HEAP32[$145 + 72 >> 2];
   _free($145);
   $145 = HEAP32[2986] | 0;
   HEAP32[2988] = $145;
  } while (($145 | 0) != 0);
 }
 $_pr27 = HEAP32[3158] | 0;
 if (($_pr27 | 0) != 0) {
  $152 = $_pr27;
  do {
   HEAP32[3156] = HEAP32[$152 + 32 >> 2];
   _free($152);
   $152 = HEAP32[3156] | 0;
   HEAP32[3158] = $152;
  } while (($152 | 0) != 0);
 }
 $_pr29 = HEAP32[3168] | 0;
 if (($_pr29 | 0) != 0) {
  $159 = $_pr29;
  do {
   HEAP32[3166] = HEAP32[$159 + 28 >> 2];
   $163 = HEAP32[$159 + 4 >> 2] | 0;
   if (($163 | 0) == 0) {
    $167 = $159;
   } else {
    _gsl_matrix_free($163);
    $167 = HEAP32[3168] | 0;
   }
   $169 = HEAP32[$167 + 8 >> 2] | 0;
   if (($169 | 0) == 0) {
    $173 = $167;
   } else {
    _gsl_matrix_free($169);
    $173 = HEAP32[3168] | 0;
   }
   _free($173);
   $159 = HEAP32[3166] | 0;
   HEAP32[3168] = $159;
  } while (($159 | 0) != 0);
 }
 $_pr31 = HEAP32[2982] | 0;
 if (($_pr31 | 0) != 0) {
  $178 = $_pr31;
  do {
   HEAP32[2978] = HEAP32[$178 + 76 >> 2];
   $182 = HEAP32[$178 + 28 >> 2] | 0;
   if (($182 | 0) == 0) {
    $186 = $178;
   } else {
    _gsl_vector_free($182);
    $186 = HEAP32[2982] | 0;
   }
   $188 = HEAP32[$186 + 32 >> 2] | 0;
   if (($188 | 0) == 0) {
    $192 = $186;
   } else {
    _gsl_vector_free($188);
    $192 = HEAP32[2982] | 0;
   }
   $194 = HEAP32[$192 + 20 >> 2] | 0;
   if (($194 | 0) == 0) {
    $198 = $192;
   } else {
    _gsl_vector_free($194);
    $198 = HEAP32[2982] | 0;
   }
   $200 = HEAP32[$198 + 24 >> 2] | 0;
   if (($200 | 0) == 0) {
    $204 = $198;
   } else {
    _gsl_vector_free($200);
    $204 = HEAP32[2982] | 0;
   }
   $206 = HEAP32[$204 + 40 >> 2] | 0;
   if (($206 | 0) == 0) {
    $210 = $204;
   } else {
    _gsl_matrix_free($206);
    $210 = HEAP32[2982] | 0;
   }
   $212 = HEAP32[$210 + 48 >> 2] | 0;
   if (($212 | 0) == 0) {
    $216 = $210;
   } else {
    _gsl_matrix_free($212);
    $216 = HEAP32[2982] | 0;
   }
   $218 = HEAP32[$216 + 52 >> 2] | 0;
   if (($218 | 0) == 0) {
    $222 = $216;
   } else {
    _gsl_matrix_free($218);
    $222 = HEAP32[2982] | 0;
   }
   $224 = HEAP32[$222 + 16 >> 2] | 0;
   if (($224 | 0) == 0) {
    $229 = $222;
   } else {
    _free($224);
    $229 = HEAP32[2982] | 0;
   }
   $231 = HEAP32[$229 + 60 >> 2] | 0;
   if (($231 | 0) == 0) {
    $235 = $229;
   } else {
    _gsl_vector_free($231);
    $235 = HEAP32[2982] | 0;
   }
   $237 = HEAP32[$235 + 64 >> 2] | 0;
   if (($237 | 0) == 0) {
    $241 = $235;
   } else {
    _gsl_vector_free($237);
    $241 = HEAP32[2982] | 0;
   }
   $243 = HEAP32[$241 + 68 >> 2] | 0;
   if (($243 | 0) == 0) {
    $247 = $241;
   } else {
    _gsl_vector_free($243);
    $247 = HEAP32[2982] | 0;
   }
   $249 = HEAP32[$247 + 56 >> 2] | 0;
   if (($249 | 0) == 0) {
    $253 = $247;
   } else {
    _gsl_permutation_free($249);
    $253 = HEAP32[2982] | 0;
   }
   $255 = HEAP32[$253 + 72 >> 2] | 0;
   if (($255 | 0) == 0) {
    $259 = $253;
   } else {
    _gsl_matrix_free($255);
    $259 = HEAP32[2982] | 0;
   }
   $261 = HEAP32[$259 + 44 >> 2] | 0;
   if (($261 | 0) == 0) {
    $265 = $259;
   } else {
    _gsl_matrix_free($261);
    $265 = HEAP32[2982] | 0;
   }
   $267 = HEAP32[$265 + 36 >> 2] | 0;
   if (($267 | 0) == 0) {
    $271 = $265;
   } else {
    _gsl_permutation_free($267);
    $271 = HEAP32[2982] | 0;
   }
   _free($271);
   $178 = HEAP32[2978] | 0;
   HEAP32[2982] = $178;
  } while (($178 | 0) != 0);
 }
 $_pr33 = HEAP32[3220] | 0;
 if (($_pr33 | 0) != 0) {
  $276 = $_pr33;
  do {
   HEAP32[3218] = HEAP32[$276 + 160 >> 2];
   $280 = HEAP32[$276 + 24 >> 2] | 0;
   if (($280 | 0) == 0) {
    $288 = $276;
   } else {
    _free_bezier_fit($280);
    _free(HEAP32[(HEAP32[3220] | 0) + 24 >> 2] | 0);
    $288 = HEAP32[3220] | 0;
   }
   _free($288);
   $276 = HEAP32[3218] | 0;
   HEAP32[3220] = $276;
  } while (($276 | 0) != 0);
 }
 $_pr35 = HEAP32[3162] | 0;
 if (($_pr35 | 0) != 0) {
  $293 = $_pr35;
  do {
   HEAP32[3160] = HEAP32[$293 + 100 >> 2];
   $297 = HEAP32[$293 + 80 >> 2] | 0;
   if (($297 | 0) == 0) {
    $302 = $293;
   } else {
    _free($297);
    $302 = HEAP32[3162] | 0;
   }
   _free($302);
   $293 = HEAP32[3160] | 0;
   HEAP32[3162] = $293;
  } while (($293 | 0) != 0);
 }
 $_pr37 = HEAP32[2892] | 0;
 if (($_pr37 | 0) != 0) {
  $307 = $_pr37;
  do {
   HEAP32[2890] = HEAP32[$307 + 64 >> 2];
   $311 = HEAP32[$307 + 48 >> 2] | 0;
   if (($311 | 0) == 0) {
    $319 = $307;
   } else {
    _free_bezier_fit($311);
    _free(HEAP32[(HEAP32[2892] | 0) + 48 >> 2] | 0);
    $319 = HEAP32[2892] | 0;
   }
   _free($319);
   $307 = HEAP32[2890] | 0;
   HEAP32[2892] = $307;
  } while (($307 | 0) != 0);
 }
 $323 = HEAP32[2898] | 0;
 if (($323 | 0) == 0) {
  return 0;
 }
 _free($323);
 return 0;
}
function ___udivmoddi4($a$0, $a$1, $b$0, $b$1, $rem) {
 $a$0 = $a$0 | 0;
 $a$1 = $a$1 | 0;
 $b$0 = $b$0 | 0;
 $b$1 = $b$1 | 0;
 $rem = $rem | 0;
 var $n_sroa_0_0_extract_trunc = 0, $n_sroa_1_4_extract_shift$0 = 0, $n_sroa_1_4_extract_trunc = 0, $d_sroa_0_0_extract_trunc = 0, $d_sroa_1_4_extract_shift$0 = 0, $d_sroa_1_4_extract_trunc = 0, $4 = 0, $17 = 0, $37 = 0, $51 = 0, $57 = 0, $58 = 0, $66 = 0, $78 = 0, $88 = 0, $89 = 0, $91 = 0, $92 = 0, $95 = 0, $105 = 0, $119 = 0, $125 = 0, $126 = 0, $130 = 0, $q_sroa_1_1_ph = 0, $q_sroa_0_1_ph = 0, $r_sroa_1_1_ph = 0, $r_sroa_0_1_ph = 0, $sr_1_ph = 0, $d_sroa_0_0_insert_insert99$0 = 0, $d_sroa_0_0_insert_insert99$1 = 0, $137$0 = 0, $137$1 = 0, $carry_0203 = 0, $sr_1202 = 0, $r_sroa_0_1201 = 0, $r_sroa_1_1200 = 0, $q_sroa_0_1199 = 0, $q_sroa_1_1198 = 0, $147 = 0, $149 = 0, $r_sroa_0_0_insert_insert42$0 = 0, $r_sroa_0_0_insert_insert42$1 = 0, $150$1 = 0, $151$0 = 0, $152 = 0, $r_sroa_0_0_extract_trunc = 0, $r_sroa_1_4_extract_trunc = 0, $155 = 0, $carry_0_lcssa$0 = 0, $carry_0_lcssa$1 = 0, $r_sroa_0_1_lcssa = 0, $r_sroa_1_1_lcssa = 0, $q_sroa_0_1_lcssa = 0, $q_sroa_1_1_lcssa = 0, $q_sroa_0_0_insert_ext75$0 = 0, $q_sroa_0_0_insert_ext75$1 = 0, $_0$0 = 0, $_0$1 = 0;
 $n_sroa_0_0_extract_trunc = $a$0;
 $n_sroa_1_4_extract_shift$0 = $a$1;
 $n_sroa_1_4_extract_trunc = $n_sroa_1_4_extract_shift$0;
 $d_sroa_0_0_extract_trunc = $b$0;
 $d_sroa_1_4_extract_shift$0 = $b$1;
 $d_sroa_1_4_extract_trunc = $d_sroa_1_4_extract_shift$0;
 if (($n_sroa_1_4_extract_trunc | 0) == 0) {
  $4 = ($rem | 0) != 0;
  if (($d_sroa_1_4_extract_trunc | 0) == 0) {
   if ($4) {
    HEAP32[$rem >> 2] = ($n_sroa_0_0_extract_trunc >>> 0) % ($d_sroa_0_0_extract_trunc >>> 0);
    HEAP32[$rem + 4 >> 2] = 0;
   }
   $_0$1 = 0;
   $_0$0 = ($n_sroa_0_0_extract_trunc >>> 0) / ($d_sroa_0_0_extract_trunc >>> 0) >>> 0;
   return (tempRet0 = $_0$1, $_0$0) | 0;
  } else {
   if (!$4) {
    $_0$1 = 0;
    $_0$0 = 0;
    return (tempRet0 = $_0$1, $_0$0) | 0;
   }
   HEAP32[$rem >> 2] = $a$0 | 0;
   HEAP32[$rem + 4 >> 2] = $a$1 & 0;
   $_0$1 = 0;
   $_0$0 = 0;
   return (tempRet0 = $_0$1, $_0$0) | 0;
  }
 }
 $17 = ($d_sroa_1_4_extract_trunc | 0) == 0;
 do {
  if (($d_sroa_0_0_extract_trunc | 0) == 0) {
   if ($17) {
    if (($rem | 0) != 0) {
     HEAP32[$rem >> 2] = ($n_sroa_1_4_extract_trunc >>> 0) % ($d_sroa_0_0_extract_trunc >>> 0);
     HEAP32[$rem + 4 >> 2] = 0;
    }
    $_0$1 = 0;
    $_0$0 = ($n_sroa_1_4_extract_trunc >>> 0) / ($d_sroa_0_0_extract_trunc >>> 0) >>> 0;
    return (tempRet0 = $_0$1, $_0$0) | 0;
   }
   if (($n_sroa_0_0_extract_trunc | 0) == 0) {
    if (($rem | 0) != 0) {
     HEAP32[$rem >> 2] = 0;
     HEAP32[$rem + 4 >> 2] = ($n_sroa_1_4_extract_trunc >>> 0) % ($d_sroa_1_4_extract_trunc >>> 0);
    }
    $_0$1 = 0;
    $_0$0 = ($n_sroa_1_4_extract_trunc >>> 0) / ($d_sroa_1_4_extract_trunc >>> 0) >>> 0;
    return (tempRet0 = $_0$1, $_0$0) | 0;
   }
   $37 = $d_sroa_1_4_extract_trunc - 1 | 0;
   if (($37 & $d_sroa_1_4_extract_trunc | 0) == 0) {
    if (($rem | 0) != 0) {
     HEAP32[$rem >> 2] = $a$0 | 0;
     HEAP32[$rem + 4 >> 2] = $37 & $n_sroa_1_4_extract_trunc | $a$1 & 0;
    }
    $_0$1 = 0;
    $_0$0 = $n_sroa_1_4_extract_trunc >>> ((_llvm_cttz_i32($d_sroa_1_4_extract_trunc | 0) | 0) >>> 0);
    return (tempRet0 = $_0$1, $_0$0) | 0;
   }
   $51 = (_llvm_ctlz_i32($d_sroa_1_4_extract_trunc | 0) | 0) - (_llvm_ctlz_i32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
   if ($51 >>> 0 <= 30) {
    $57 = $51 + 1 | 0;
    $58 = 31 - $51 | 0;
    $sr_1_ph = $57;
    $r_sroa_0_1_ph = $n_sroa_1_4_extract_trunc << $58 | $n_sroa_0_0_extract_trunc >>> ($57 >>> 0);
    $r_sroa_1_1_ph = $n_sroa_1_4_extract_trunc >>> ($57 >>> 0);
    $q_sroa_0_1_ph = 0;
    $q_sroa_1_1_ph = $n_sroa_0_0_extract_trunc << $58;
    break;
   }
   if (($rem | 0) == 0) {
    $_0$1 = 0;
    $_0$0 = 0;
    return (tempRet0 = $_0$1, $_0$0) | 0;
   }
   HEAP32[$rem >> 2] = $a$0 | 0;
   HEAP32[$rem + 4 >> 2] = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
   $_0$1 = 0;
   $_0$0 = 0;
   return (tempRet0 = $_0$1, $_0$0) | 0;
  } else {
   if (!$17) {
    $119 = (_llvm_ctlz_i32($d_sroa_1_4_extract_trunc | 0) | 0) - (_llvm_ctlz_i32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
    if ($119 >>> 0 <= 31) {
     $125 = $119 + 1 | 0;
     $126 = 31 - $119 | 0;
     $130 = $119 - 31 >> 31;
     $sr_1_ph = $125;
     $r_sroa_0_1_ph = $n_sroa_0_0_extract_trunc >>> ($125 >>> 0) & $130 | $n_sroa_1_4_extract_trunc << $126;
     $r_sroa_1_1_ph = $n_sroa_1_4_extract_trunc >>> ($125 >>> 0) & $130;
     $q_sroa_0_1_ph = 0;
     $q_sroa_1_1_ph = $n_sroa_0_0_extract_trunc << $126;
     break;
    }
    if (($rem | 0) == 0) {
     $_0$1 = 0;
     $_0$0 = 0;
     return (tempRet0 = $_0$1, $_0$0) | 0;
    }
    HEAP32[$rem >> 2] = $a$0 | 0;
    HEAP32[$rem + 4 >> 2] = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
    $_0$1 = 0;
    $_0$0 = 0;
    return (tempRet0 = $_0$1, $_0$0) | 0;
   }
   $66 = $d_sroa_0_0_extract_trunc - 1 | 0;
   if (($66 & $d_sroa_0_0_extract_trunc | 0) != 0) {
    $88 = (_llvm_ctlz_i32($d_sroa_0_0_extract_trunc | 0) | 0) + 33 - (_llvm_ctlz_i32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
    $89 = 64 - $88 | 0;
    $91 = 32 - $88 | 0;
    $92 = $91 >> 31;
    $95 = $88 - 32 | 0;
    $105 = $95 >> 31;
    $sr_1_ph = $88;
    $r_sroa_0_1_ph = $91 - 1 >> 31 & $n_sroa_1_4_extract_trunc >>> ($95 >>> 0) | ($n_sroa_1_4_extract_trunc << $91 | $n_sroa_0_0_extract_trunc >>> ($88 >>> 0)) & $105;
    $r_sroa_1_1_ph = $105 & $n_sroa_1_4_extract_trunc >>> ($88 >>> 0);
    $q_sroa_0_1_ph = $n_sroa_0_0_extract_trunc << $89 & $92;
    $q_sroa_1_1_ph = ($n_sroa_1_4_extract_trunc << $89 | $n_sroa_0_0_extract_trunc >>> ($95 >>> 0)) & $92 | $n_sroa_0_0_extract_trunc << $91 & $88 - 33 >> 31;
    break;
   }
   if (($rem | 0) != 0) {
    HEAP32[$rem >> 2] = $66 & $n_sroa_0_0_extract_trunc;
    HEAP32[$rem + 4 >> 2] = 0;
   }
   if (($d_sroa_0_0_extract_trunc | 0) == 1) {
    $_0$1 = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
    $_0$0 = $a$0 | 0 | 0;
    return (tempRet0 = $_0$1, $_0$0) | 0;
   } else {
    $78 = _llvm_cttz_i32($d_sroa_0_0_extract_trunc | 0) | 0;
    $_0$1 = $n_sroa_1_4_extract_trunc >>> ($78 >>> 0) | 0;
    $_0$0 = $n_sroa_1_4_extract_trunc << 32 - $78 | $n_sroa_0_0_extract_trunc >>> ($78 >>> 0) | 0;
    return (tempRet0 = $_0$1, $_0$0) | 0;
   }
  }
 } while (0);
 if (($sr_1_ph | 0) == 0) {
  $q_sroa_1_1_lcssa = $q_sroa_1_1_ph;
  $q_sroa_0_1_lcssa = $q_sroa_0_1_ph;
  $r_sroa_1_1_lcssa = $r_sroa_1_1_ph;
  $r_sroa_0_1_lcssa = $r_sroa_0_1_ph;
  $carry_0_lcssa$1 = 0;
  $carry_0_lcssa$0 = 0;
 } else {
  $d_sroa_0_0_insert_insert99$0 = $b$0 | 0 | 0;
  $d_sroa_0_0_insert_insert99$1 = $d_sroa_1_4_extract_shift$0 | $b$1 & 0;
  $137$0 = _i64Add($d_sroa_0_0_insert_insert99$0, $d_sroa_0_0_insert_insert99$1, -1, -1) | 0;
  $137$1 = tempRet0;
  $q_sroa_1_1198 = $q_sroa_1_1_ph;
  $q_sroa_0_1199 = $q_sroa_0_1_ph;
  $r_sroa_1_1200 = $r_sroa_1_1_ph;
  $r_sroa_0_1201 = $r_sroa_0_1_ph;
  $sr_1202 = $sr_1_ph;
  $carry_0203 = 0;
  while (1) {
   $147 = $q_sroa_0_1199 >>> 31 | $q_sroa_1_1198 << 1;
   $149 = $carry_0203 | $q_sroa_0_1199 << 1;
   $r_sroa_0_0_insert_insert42$0 = $r_sroa_0_1201 << 1 | $q_sroa_1_1198 >>> 31 | 0;
   $r_sroa_0_0_insert_insert42$1 = $r_sroa_0_1201 >>> 31 | $r_sroa_1_1200 << 1 | 0;
   _i64Subtract($137$0, $137$1, $r_sroa_0_0_insert_insert42$0, $r_sroa_0_0_insert_insert42$1) | 0;
   $150$1 = tempRet0;
   $151$0 = $150$1 >> 31 | (($150$1 | 0) < 0 ? -1 : 0) << 1;
   $152 = $151$0 & 1;
   $r_sroa_0_0_extract_trunc = _i64Subtract($r_sroa_0_0_insert_insert42$0, $r_sroa_0_0_insert_insert42$1, $151$0 & $d_sroa_0_0_insert_insert99$0, ((($150$1 | 0) < 0 ? -1 : 0) >> 31 | (($150$1 | 0) < 0 ? -1 : 0) << 1) & $d_sroa_0_0_insert_insert99$1) | 0;
   $r_sroa_1_4_extract_trunc = tempRet0;
   $155 = $sr_1202 - 1 | 0;
   if (($155 | 0) == 0) {
    break;
   } else {
    $q_sroa_1_1198 = $147;
    $q_sroa_0_1199 = $149;
    $r_sroa_1_1200 = $r_sroa_1_4_extract_trunc;
    $r_sroa_0_1201 = $r_sroa_0_0_extract_trunc;
    $sr_1202 = $155;
    $carry_0203 = $152;
   }
  }
  $q_sroa_1_1_lcssa = $147;
  $q_sroa_0_1_lcssa = $149;
  $r_sroa_1_1_lcssa = $r_sroa_1_4_extract_trunc;
  $r_sroa_0_1_lcssa = $r_sroa_0_0_extract_trunc;
  $carry_0_lcssa$1 = 0;
  $carry_0_lcssa$0 = $152;
 }
 $q_sroa_0_0_insert_ext75$0 = $q_sroa_0_1_lcssa;
 $q_sroa_0_0_insert_ext75$1 = 0;
 if (($rem | 0) != 0) {
  HEAP32[$rem >> 2] = $r_sroa_0_1_lcssa;
  HEAP32[$rem + 4 >> 2] = $r_sroa_1_1_lcssa;
 }
 $_0$1 = ($q_sroa_0_0_insert_ext75$0 | 0) >>> 31 | ($q_sroa_1_1_lcssa | $q_sroa_0_0_insert_ext75$1) << 1 | ($q_sroa_0_0_insert_ext75$1 << 1 | $q_sroa_0_0_insert_ext75$0 >>> 31) & 0 | $carry_0_lcssa$1;
 $_0$0 = ($q_sroa_0_0_insert_ext75$0 << 1 | 0 >>> 31) & -2 | $carry_0_lcssa$0;
 return (tempRet0 = $_0$1, $_0$0) | 0;
}
function _solve_pole($ptr) {
 $ptr = $ptr | 0;
 var $signum = 0, $rhs = 0, $inj = 0, $2 = 0, $4 = 0, $6 = 0, $8 = 0, $10 = 0, $11 = 0, $14 = 0, $21 = 0, $30 = 0, $33 = 0, $35 = 0, $36 = 0, $i_0162 = 0, $40 = 0, $42 = 0, $44 = 0, $47 = 0, $51 = 0.0, $53 = 0.0, $55 = 0.0, $59 = 0.0, $61 = 0.0, $63 = 0.0, $65 = 0.0, $71 = 0.0, $73 = 0.0, $75 = 0, $_pre_phi169 = 0, $_pre_phi = 0, $i_1159 = 0, $80 = 0, $82 = 0.0, $84 = 0, $k_0154 = 0, $90 = 0.0, $92 = 0.0, $93 = 0, $99 = 0, $100 = 0, $104 = 0, $108 = 0, $113 = 0, $count_0153 = 0, $116 = 0, $i_05_i = 0, $126 = 0.0, $127 = 0, $131 = 0.0, $135 = 0, $137 = 0, $i_13_i = 0, $j_01_i = 0, $140 = 0.0, $143 = 0.0, $144 = 0, $147 = 0, $148 = 0, $150 = 0, $i_2145 = 0, $errf_1144 = 0.0, $156 = 0.0, $157 = 0, $errf_1_lcssa = 0.0, $162 = 0, $i_3148 = 0, $errx_1147 = 0.0, $169 = 0, $170 = 0.0, $171 = 0, $173 = 0.0, $174 = 0, $177 = 0, $178 = 0, $182 = 0, $186 = 0, $i_4141 = 0, $195 = 0.0, $197 = 0, $201 = 0, $i_5140 = 0, $205 = 0, $207 = 0, $209 = 0, $215 = 0.0, $218 = 0.0, $219 = 0, $220 = 0.0, $230 = 0.0, $232 = 0, $238 = 0.0, $240 = 0, $247 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 56 | 0;
 $signum = sp | 0;
 $rhs = sp + 8 | 0;
 $inj = sp + 32 | 0;
 $2 = HEAP32[$ptr + 64 >> 2] | 0;
 $4 = HEAP32[$ptr + 60 >> 2] | 0;
 $6 = HEAP32[$ptr + 68 >> 2] | 0;
 $8 = HEAP32[$ptr + 72 >> 2] | 0;
 $10 = HEAP32[$ptr + 56 >> 2] | 0;
 $11 = $ptr + 20 | 0;
 _gsl_vector_subvector($rhs, HEAP32[$11 >> 2] | 0, 1, HEAP32[3122] | 0);
 $14 = $ptr + 24 | 0;
 _gsl_vector_subvector($inj, HEAP32[$14 >> 2] | 0, 1, HEAP32[3122] | 0);
 if ((HEAP32[$ptr + 8 >> 2] | 0) != 0) {
  $21 = $rhs | 0;
  _gsl_vector_memcpy($21, $inj | 0) | 0;
  _gsl_linalg_LU_svx(HEAP32[$ptr + 44 >> 2] | 0, HEAP32[$ptr + 36 >> 2] | 0, $21) | 0;
 }
 $30 = $ptr + 12 | 0;
 if ((HEAP32[$30 >> 2] | 0) <= 0) {
  STACKTOP = sp;
  return;
 }
 $33 = $ptr + 16 | 0;
 $i_0162 = 0;
 do {
  $40 = HEAP32[(HEAP32[$33 >> 2] | 0) + ($i_0162 << 2) >> 2] | 0;
  $42 = HEAP32[$40 + 144 >> 2] | 0;
  $44 = HEAP32[$40 + 148 >> 2] | 0;
  _gsl_vector_set($2, $i_0162, +HEAPF64[$40 + 128 >> 3]);
  $47 = 11616 + ($i_0162 << 3) | 0;
  HEAPF64[$47 >> 3] = 0.0;
  if (($42 | 0) > 0) {
   $51 = +_gsl_vector_get(HEAP32[$11 >> 2] | 0, $42);
   $53 = $51 + +HEAPF64[$47 >> 3];
   HEAPF64[$47 >> 3] = $53;
   $55 = $53;
  } else {
   $55 = 0.0;
  }
  if (($44 | 0) > 0) {
   $59 = +_gsl_vector_get(HEAP32[$11 >> 2] | 0, $44);
   $61 = +HEAPF64[$47 >> 3] - $59;
   HEAPF64[$47 >> 3] = $61;
   $63 = $61;
  } else {
   $63 = $55;
  }
  $65 = +HEAPF64[$40 + 120 >> 3];
  if ($65 > 0.0) {
   $71 = $63 + $65 * +HEAPF64[$40 + 112 >> 3];
   HEAPF64[$47 >> 3] = $71;
   $73 = $71;
  } else {
   $73 = $63;
  }
  _gsl_vector_set($4, $i_0162, $73);
  $i_0162 = $i_0162 + 1 | 0;
  $75 = HEAP32[$30 >> 2] | 0;
 } while (($i_0162 | 0) < ($75 | 0));
 if (($75 | 0) > 0) {
  $35 = $ptr + 16 | 0;
  $36 = $ptr + 52 | 0;
  $i_1159 = 0;
  while (1) {
   $80 = HEAP32[(HEAP32[$35 >> 2] | 0) + ($i_1159 << 2) >> 2] | 0;
   $82 = +HEAPF64[$80 + 104 >> 3];
   $84 = _gsl_matrix_ptr(HEAP32[$36 >> 2] | 0, $i_1159, $i_1159) | 0;
   HEAPF64[$84 >> 3] = $82 + +HEAPF64[$84 >> 3];
   if ((HEAP32[$30 >> 2] | 0) > 0) {
    $k_0154 = 0;
    do {
     $90 = +_gsl_matrix_get(HEAP32[$36 >> 2] | 0, $i_1159, $k_0154);
     $92 = $90 * +_gsl_vector_get($2, $k_0154);
     $93 = _gsl_vector_ptr($4, $i_1159) | 0;
     HEAPF64[$93 >> 3] = +HEAPF64[$93 >> 3] - $92;
     $k_0154 = $k_0154 + 1 | 0;
    } while (($k_0154 | 0) < (HEAP32[$30 >> 2] | 0));
   }
   $99 = $80 + 24 | 0;
   $100 = HEAP32[$99 >> 2] | 0;
   HEAPF64[11696 + ($i_1159 << 3) >> 3] = +_bez_eval($100, +_gsl_vector_get($4, $i_1159));
   $104 = HEAP32[$99 >> 2] | 0;
   HEAPF64[11776 + ($i_1159 << 3) >> 3] = +_bez_d1($104, +_gsl_vector_get($4, $i_1159));
   $108 = $i_1159 + 1 | 0;
   if (($108 | 0) < (HEAP32[$30 >> 2] | 0)) {
    $i_1159 = $108;
   } else {
    $_pre_phi = $36;
    $_pre_phi169 = $35;
    break;
   }
  }
 } else {
  $_pre_phi = $ptr + 52 | 0;
  $_pre_phi169 = $ptr + 16 | 0;
 }
 $count_0153 = 0;
 while (1) {
  $116 = $count_0153 + 1 | 0;
  HEAP32[3144] = (HEAP32[3144] | 0) + 1;
  _gsl_matrix_memcpy($8, HEAP32[$_pre_phi >> 2] | 0) | 0;
  if ((HEAP32[$30 >> 2] | 0) > 0) {
   $i_05_i = 0;
   do {
    $126 = 1.0 / +HEAPF64[11776 + ($i_05_i << 3) >> 3];
    $127 = _gsl_matrix_ptr($8, $i_05_i, $i_05_i) | 0;
    HEAPF64[$127 >> 3] = $126 + +HEAPF64[$127 >> 3];
    $131 = +HEAPF64[11616 + ($i_05_i << 3) >> 3];
    _gsl_vector_set($6, $i_05_i, $131 - +_gsl_vector_get($4, $i_05_i));
    $i_05_i = $i_05_i + 1 | 0;
    $135 = HEAP32[$30 >> 2] | 0;
   } while (($i_05_i | 0) < ($135 | 0));
   if (($135 | 0) > 0) {
    $i_13_i = 0;
    $137 = $135;
    while (1) {
     if (($137 | 0) > 0) {
      $j_01_i = 0;
      while (1) {
       $140 = +_gsl_matrix_get(HEAP32[$_pre_phi >> 2] | 0, $i_13_i, $j_01_i);
       $143 = $140 * +HEAPF64[11696 + ($j_01_i << 3) >> 3];
       $144 = _gsl_vector_ptr($6, $i_13_i) | 0;
       HEAPF64[$144 >> 3] = +HEAPF64[$144 >> 3] - $143;
       $147 = $j_01_i + 1 | 0;
       $148 = HEAP32[$30 >> 2] | 0;
       if (($147 | 0) < ($148 | 0)) {
        $j_01_i = $147;
       } else {
        $150 = $148;
        break;
       }
      }
     } else {
      $150 = $137;
     }
     $i_13_i = $i_13_i + 1 | 0;
     if (($i_13_i | 0) >= ($150 | 0)) {
      break;
     } else {
      $137 = $150;
     }
    }
    if (($150 | 0) > 0) {
     $errf_1144 = 0.0;
     $i_2145 = 0;
     while (1) {
      $156 = $errf_1144 + +Math_abs(+(+_gsl_vector_get($6, $i_2145)));
      $157 = $i_2145 + 1 | 0;
      if (($157 | 0) < (HEAP32[$30 >> 2] | 0)) {
       $errf_1144 = $156;
       $i_2145 = $157;
      } else {
       $errf_1_lcssa = $156;
       break;
      }
     }
    } else {
     $errf_1_lcssa = 0.0;
    }
   } else {
    $errf_1_lcssa = 0.0;
   }
  } else {
   $errf_1_lcssa = 0.0;
  }
  _gsl_linalg_LU_decomp($8, $10, $signum) | 0;
  _gsl_linalg_LU_svx($8, $10, $6) | 0;
  $162 = HEAP32[$30 >> 2] | 0;
  if (($162 | 0) > 0) {
   $errx_1147 = 0.0;
   $i_3148 = 0;
  } else {
   $113 = $162;
   break;
  }
  do {
   $errx_1147 = $errx_1147 + +Math_abs(+(+_gsl_vector_get($6, $i_3148)));
   $169 = HEAP32[(HEAP32[$_pre_phi169 >> 2] | 0) + ($i_3148 << 2) >> 2] | 0;
   $170 = +_gsl_vector_get($6, $i_3148);
   $171 = 11776 + ($i_3148 << 3) | 0;
   $173 = $170 / +HEAPF64[$171 >> 3];
   $174 = _gsl_vector_ptr($4, $i_3148) | 0;
   HEAPF64[$174 >> 3] = $173 + +HEAPF64[$174 >> 3];
   $177 = $169 + 24 | 0;
   $178 = HEAP32[$177 >> 2] | 0;
   HEAPF64[11696 + ($i_3148 << 3) >> 3] = +_bez_eval($178, +_gsl_vector_get($4, $i_3148));
   $182 = HEAP32[$177 >> 2] | 0;
   HEAPF64[$171 >> 3] = +_bez_d1($182, +_gsl_vector_get($4, $i_3148));
   $i_3148 = $i_3148 + 1 | 0;
   $186 = HEAP32[$30 >> 2] | 0;
  } while (($i_3148 | 0) < ($186 | 0));
  if (($116 | 0) < 100 & $errx_1147 > 1.0e-8 & $errf_1_lcssa > 1.0e-8) {
   $count_0153 = $116;
  } else {
   $113 = $186;
   break;
  }
 }
 if (($113 | 0) > 0) {
  $i_4141 = 0;
  do {
   _gsl_vector_set($2, $i_4141, +HEAPF64[11696 + ($i_4141 << 3) >> 3]);
   $195 = +HEAPF64[(HEAP32[(HEAP32[$_pre_phi169 >> 2] | 0) + ($i_4141 << 2) >> 2] | 0) + 104 >> 3];
   $197 = _gsl_matrix_ptr(HEAP32[$_pre_phi >> 2] | 0, $i_4141, $i_4141) | 0;
   HEAPF64[$197 >> 3] = +HEAPF64[$197 >> 3] - $195;
   $i_4141 = $i_4141 + 1 | 0;
   $201 = HEAP32[$30 >> 2] | 0;
  } while (($i_4141 | 0) < ($201 | 0));
  if (($201 | 0) > 0) {
   $i_5140 = 0;
   do {
    $205 = HEAP32[(HEAP32[$_pre_phi169 >> 2] | 0) + ($i_5140 << 2) >> 2] | 0;
    $207 = HEAP32[$205 + 144 >> 2] | 0;
    $209 = HEAP32[$205 + 148 >> 2] | 0;
    HEAPF64[$205 + 128 >> 3] = +_gsl_vector_get($2, $i_5140);
    HEAPF64[$205 + 136 >> 3] = +_gsl_vector_get($4, $i_5140);
    $215 = +HEAPF64[$205 + 120 >> 3];
    if ($215 > 0.0) {
     $218 = +_gsl_vector_get($2, $i_5140);
     $219 = $205 + 112 | 0;
     $220 = +HEAPF64[$219 >> 3];
     HEAPF64[$219 >> 3] = $220 + +HEAPF64[$205 + 96 >> 3] * $215 * ($218 - $220);
    }
    if (($207 | 0) > 0) {
     $230 = +_gsl_vector_get($2, $i_5140);
     $232 = _gsl_vector_ptr(HEAP32[$14 >> 2] | 0, $207) | 0;
     HEAPF64[$232 >> 3] = +HEAPF64[$232 >> 3] - $230;
    }
    if (($209 | 0) > 0) {
     $238 = +_gsl_vector_get($2, $i_5140);
     $240 = _gsl_vector_ptr(HEAP32[$14 >> 2] | 0, $209) | 0;
     HEAPF64[$240 >> 3] = $238 + +HEAPF64[$240 >> 3];
    }
    $i_5140 = $i_5140 + 1 | 0;
   } while (($i_5140 | 0) < (HEAP32[$30 >> 2] | 0));
  }
 }
 $247 = $rhs | 0;
 _gsl_vector_memcpy($247, $inj | 0) | 0;
 _gsl_linalg_LU_svx(HEAP32[$ptr + 44 >> 2] | 0, HEAP32[$ptr + 36 >> 2] | 0, $247) | 0;
 if (($116 | 0) <= (HEAP32[3142] | 0)) {
  STACKTOP = sp;
  return;
 }
 HEAP32[3142] = $116;
 STACKTOP = sp;
 return;
}
function _cblas_dgemm($Order, $TransA, $TransB, $M, $N, $K, $alpha, $A, $lda, $B, $ldb, $beta, $C, $ldc) {
 $Order = $Order | 0;
 $TransA = $TransA | 0;
 $TransB = $TransB | 0;
 $M = $M | 0;
 $N = $N | 0;
 $K = $K | 0;
 $alpha = +$alpha;
 $A = $A | 0;
 $lda = $lda | 0;
 $B = $B | 0;
 $ldb = $ldb | 0;
 $beta = +$beta;
 $C = $C | 0;
 $ldc = $ldc | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0.0, $8 = 0, $9 = 0, $10 = 0, $11 = 0, $12 = 0.0, $13 = 0, $14 = 0, $i = 0, $j = 0, $k = 0, $n1 = 0, $n2 = 0, $ldf = 0, $ldg = 0, $TransF = 0, $TransG = 0, $F = 0, $G = 0, $pos = 0, $__transF = 0, $__transG = 0, $temp = 0.0, $temp1 = 0.0, $temp2 = 0.0, $temp3 = 0.0, $25 = 0, $32 = 0, $40 = 0, $47 = 0, $101 = 0, $113 = 0, $128 = 0, $140 = 0, $152 = 0, $170 = 0, $182 = 0, $197 = 0, $209 = 0, $221 = 0, $253 = 0, $262 = 0, $274 = 0, $283 = 0, $334 = 0, $394 = 0.0, $401 = 0, $446 = 0.0, $471 = 0, $526 = 0.0, $533 = 0, $578 = 0.0, $603 = 0, label = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 $1 = $Order;
 $2 = $TransA;
 $3 = $TransB;
 $4 = $M;
 $5 = $N;
 $6 = $K;
 $7 = $alpha;
 $8 = $A;
 $9 = $lda;
 $10 = $B;
 $11 = $ldb;
 $12 = $beta;
 $13 = $C;
 $14 = $ldc;
 $pos = 0;
 $__transF = 111;
 $__transG = 111;
 if (($1 | 0) == 101) {
  if (($2 | 0) != 113) {
   $25 = $2;
  } else {
   $25 = 112;
  }
  $__transF = $25;
  if (($3 | 0) != 113) {
   $32 = $3;
  } else {
   $32 = 112;
  }
  $__transG = $32;
 } else {
  if (($3 | 0) != 113) {
   $40 = $3;
  } else {
   $40 = 112;
  }
  $__transF = $40;
  if (($2 | 0) != 113) {
   $47 = $2;
  } else {
   $47 = 112;
  }
  $__transG = $47;
 }
 if (($1 | 0) != 101) {
  if (($1 | 0) != 102) {
   $pos = 1;
  }
 }
 if (($2 | 0) != 111) {
  if (($2 | 0) != 112) {
   if (($2 | 0) != 113) {
    $pos = 2;
   }
  }
 }
 if (($3 | 0) != 111) {
  if (($3 | 0) != 112) {
   if (($3 | 0) != 113) {
    $pos = 3;
   }
  }
 }
 if (($4 | 0) < 0) {
  $pos = 4;
 }
 if (($5 | 0) < 0) {
  $pos = 5;
 }
 if (($6 | 0) < 0) {
  $pos = 6;
 }
 if (($1 | 0) == 101) {
  if (($__transF | 0) == 111) {
   if (1 > ($6 | 0)) {
    $101 = 1;
   } else {
    $101 = $6;
   }
   if (($9 | 0) < ($101 | 0)) {
    $pos = 9;
   }
  } else {
   if (1 > ($4 | 0)) {
    $113 = 1;
   } else {
    $113 = $4;
   }
   if (($9 | 0) < ($113 | 0)) {
    $pos = 9;
   }
  }
  if (($__transG | 0) == 111) {
   if (1 > ($5 | 0)) {
    $128 = 1;
   } else {
    $128 = $5;
   }
   if (($11 | 0) < ($128 | 0)) {
    $pos = 11;
   }
  } else {
   if (1 > ($6 | 0)) {
    $140 = 1;
   } else {
    $140 = $6;
   }
   if (($11 | 0) < ($140 | 0)) {
    $pos = 11;
   }
  }
  if (1 > ($5 | 0)) {
   $152 = 1;
  } else {
   $152 = $5;
  }
  if (($14 | 0) < ($152 | 0)) {
   $pos = 14;
  }
 } else {
  if (($1 | 0) == 102) {
   if (($__transF | 0) == 111) {
    if (1 > ($6 | 0)) {
     $170 = 1;
    } else {
     $170 = $6;
    }
    if (($11 | 0) < ($170 | 0)) {
     $pos = 11;
    }
   } else {
    if (1 > ($5 | 0)) {
     $182 = 1;
    } else {
     $182 = $5;
    }
    if (($11 | 0) < ($182 | 0)) {
     $pos = 11;
    }
   }
   if (($__transG | 0) == 111) {
    if (1 > ($4 | 0)) {
     $197 = 1;
    } else {
     $197 = $4;
    }
    if (($9 | 0) < ($197 | 0)) {
     $pos = 9;
    }
   } else {
    if (1 > ($6 | 0)) {
     $209 = 1;
    } else {
     $209 = $6;
    }
    if (($9 | 0) < ($209 | 0)) {
     $pos = 9;
    }
   }
   if (1 > ($4 | 0)) {
    $221 = 1;
   } else {
    $221 = $4;
   }
   if (($14 | 0) < ($221 | 0)) {
    $pos = 14;
   }
  }
 }
 if (($pos | 0) != 0) {
  _cblas_xerbla($pos, 9072, 12920, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 1 | 0, STACKTOP = STACKTOP + 7 & -8, HEAP32[tempVarArgs >> 2] = 0, tempVarArgs) | 0);
  STACKTOP = tempVarArgs;
 }
 if ($7 == 0.0) {
  if ($12 == 1.0) {
   STACKTOP = sp;
   return;
  }
 }
 if (($1 | 0) == 101) {
  $n1 = $4;
  $n2 = $5;
  $F = $8;
  $ldf = $9;
  if (($2 | 0) == 113) {
   $253 = 112;
  } else {
   $253 = $2;
  }
  $TransF = $253;
  $G = $10;
  $ldg = $11;
  if (($3 | 0) == 113) {
   $262 = 112;
  } else {
   $262 = $3;
  }
  $TransG = $262;
 } else {
  $n1 = $5;
  $n2 = $4;
  $F = $10;
  $ldf = $11;
  if (($3 | 0) == 113) {
   $274 = 112;
  } else {
   $274 = $3;
  }
  $TransF = $274;
  $G = $8;
  $ldg = $9;
  if (($2 | 0) == 113) {
   $283 = 112;
  } else {
   $283 = $2;
  }
  $TransG = $283;
 }
 if ($12 == 0.0) {
  $i = 0;
  while (1) {
   if (($i | 0) >= ($n1 | 0)) {
    break;
   }
   $j = 0;
   while (1) {
    if (($j | 0) >= ($n2 | 0)) {
     break;
    }
    HEAPF64[$13 + ((Math_imul($14, $i) | 0) + $j << 3) >> 3] = 0.0;
    $j = $j + 1 | 0;
   }
   $i = $i + 1 | 0;
  }
 } else {
  if ($12 != 1.0) {
   $i = 0;
   while (1) {
    if (($i | 0) >= ($n1 | 0)) {
     break;
    }
    $j = 0;
    while (1) {
     if (($j | 0) >= ($n2 | 0)) {
      break;
     }
     $334 = $13 + ((Math_imul($14, $i) | 0) + $j << 3) | 0;
     HEAPF64[$334 >> 3] = +HEAPF64[$334 >> 3] * $12;
     $j = $j + 1 | 0;
    }
    $i = $i + 1 | 0;
   }
  }
 }
 if ($7 == 0.0) {
  STACKTOP = sp;
  return;
 }
 if (($TransF | 0) == 111) {
  if (($TransG | 0) == 111) {
   $k = 0;
   while (1) {
    if (($k | 0) >= ($6 | 0)) {
     break;
    }
    $i = 0;
    while (1) {
     if (($i | 0) >= ($n1 | 0)) {
      break;
     }
     $temp = $7 * +HEAPF64[$F + ((Math_imul($ldf, $i) | 0) + $k << 3) >> 3];
     if ($temp != 0.0) {
      $j = 0;
      while (1) {
       if (($j | 0) >= ($n2 | 0)) {
        break;
       }
       $394 = $temp * +HEAPF64[$G + ((Math_imul($ldg, $k) | 0) + $j << 3) >> 3];
       $401 = $13 + ((Math_imul($14, $i) | 0) + $j << 3) | 0;
       HEAPF64[$401 >> 3] = +HEAPF64[$401 >> 3] + $394;
       $j = $j + 1 | 0;
      }
     }
     $i = $i + 1 | 0;
    }
    $k = $k + 1 | 0;
   }
   STACKTOP = sp;
   return;
  }
 }
 if (($TransF | 0) == 111) {
  if (($TransG | 0) == 112) {
   $i = 0;
   while (1) {
    if (($i | 0) >= ($n1 | 0)) {
     break;
    }
    $j = 0;
    while (1) {
     if (($j | 0) >= ($n2 | 0)) {
      break;
     }
     $temp1 = 0.0;
     $k = 0;
     while (1) {
      if (($k | 0) >= ($6 | 0)) {
       break;
      }
      $446 = +HEAPF64[$F + ((Math_imul($ldf, $i) | 0) + $k << 3) >> 3];
      $temp1 = $temp1 + $446 * +HEAPF64[$G + ((Math_imul($ldg, $j) | 0) + $k << 3) >> 3];
      $k = $k + 1 | 0;
     }
     $471 = $13 + ((Math_imul($14, $i) | 0) + $j << 3) | 0;
     HEAPF64[$471 >> 3] = +HEAPF64[$471 >> 3] + $7 * $temp1;
     $j = $j + 1 | 0;
    }
    $i = $i + 1 | 0;
   }
  } else {
   label = 177;
  }
 } else {
  label = 177;
 }
 if ((label | 0) == 177) {
  if (($TransF | 0) == 112) {
   if (($TransG | 0) == 111) {
    $k = 0;
    while (1) {
     if (($k | 0) >= ($6 | 0)) {
      break;
     }
     $i = 0;
     while (1) {
      if (($i | 0) >= ($n1 | 0)) {
       break;
      }
      $temp2 = $7 * +HEAPF64[$F + ((Math_imul($ldf, $k) | 0) + $i << 3) >> 3];
      if ($temp2 != 0.0) {
       $j = 0;
       while (1) {
        if (($j | 0) >= ($n2 | 0)) {
         break;
        }
        $526 = $temp2 * +HEAPF64[$G + ((Math_imul($ldg, $k) | 0) + $j << 3) >> 3];
        $533 = $13 + ((Math_imul($14, $i) | 0) + $j << 3) | 0;
        HEAPF64[$533 >> 3] = +HEAPF64[$533 >> 3] + $526;
        $j = $j + 1 | 0;
       }
      }
      $i = $i + 1 | 0;
     }
     $k = $k + 1 | 0;
    }
   } else {
    label = 194;
   }
  } else {
   label = 194;
  }
  if ((label | 0) == 194) {
   if (($TransF | 0) == 112) {
    if (($TransG | 0) == 112) {
     $i = 0;
     while (1) {
      if (($i | 0) >= ($n1 | 0)) {
       break;
      }
      $j = 0;
      while (1) {
       if (($j | 0) >= ($n2 | 0)) {
        break;
       }
       $temp3 = 0.0;
       $k = 0;
       while (1) {
        if (($k | 0) >= ($6 | 0)) {
         break;
        }
        $578 = +HEAPF64[$F + ((Math_imul($ldf, $k) | 0) + $i << 3) >> 3];
        $temp3 = $temp3 + $578 * +HEAPF64[$G + ((Math_imul($ldg, $j) | 0) + $k << 3) >> 3];
        $k = $k + 1 | 0;
       }
       $603 = $13 + ((Math_imul($14, $i) | 0) + $j << 3) | 0;
       HEAPF64[$603 >> 3] = +HEAPF64[$603 >> 3] + $7 * $temp3;
       $j = $j + 1 | 0;
      }
      $i = $i + 1 | 0;
     }
    } else {
     label = 209;
    }
   } else {
    label = 209;
   }
   if ((label | 0) == 209) {
    _cblas_xerbla(0, 9072, 7912, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 1 | 0, STACKTOP = STACKTOP + 7 & -8, HEAP32[tempVarArgs >> 2] = 0, tempVarArgs) | 0);
    STACKTOP = tempVarArgs;
   }
  }
 }
 STACKTOP = sp;
 return;
}
function _cblas_dtrsv($order, $Uplo, $TransA, $Diag, $N, $A, $lda, $X, $incX) {
 $order = $order | 0;
 $Uplo = $Uplo | 0;
 $TransA = $TransA | 0;
 $Diag = $Diag | 0;
 $N = $N | 0;
 $A = $A | 0;
 $lda = $lda | 0;
 $X = $X | 0;
 $incX = $incX | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $nonunit = 0, $ix = 0, $jx = 0, $i = 0, $j = 0, $Trans = 0, $pos = 0, $tmp = 0.0, $tmp1 = 0.0, $tmp3 = 0.0, $tmp4 = 0.0, $19 = 0, $63 = 0, $109 = 0, $146 = 0, $150 = 0, $174 = 0.0, $244 = 0, $285 = 0, $299 = 0.0, $372 = 0, $413 = 0, $427 = 0.0, $500 = 0, $537 = 0, $541 = 0, $565 = 0.0, label = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 $1 = $order;
 $2 = $Uplo;
 $3 = $TransA;
 $4 = $Diag;
 $5 = $N;
 $6 = $A;
 $7 = $lda;
 $8 = $X;
 $9 = $incX;
 $nonunit = ($4 | 0) == 131 | 0;
 if (($3 | 0) != 113) {
  $19 = $3;
 } else {
  $19 = 112;
 }
 $Trans = $19;
 $pos = 0;
 if (($1 | 0) != 101) {
  if (($1 | 0) != 102) {
   $pos = 1;
  }
 }
 if (($2 | 0) != 121) {
  if (($2 | 0) != 122) {
   $pos = 2;
  }
 }
 if (($3 | 0) != 111) {
  if (($3 | 0) != 112) {
   if (($3 | 0) != 113) {
    $pos = 3;
   }
  }
 }
 if (($4 | 0) != 131) {
  if (($4 | 0) != 132) {
   $pos = 4;
  }
 }
 if (($5 | 0) < 0) {
  $pos = 5;
 }
 if (1 > ($5 | 0)) {
  $63 = 1;
 } else {
  $63 = $5;
 }
 if (($7 | 0) < ($63 | 0)) {
  $pos = 7;
 }
 if (($9 | 0) == 0) {
  $pos = 9;
 }
 if (($pos | 0) != 0) {
  _cblas_xerbla($pos, 7288, 12888, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 1 | 0, STACKTOP = STACKTOP + 7 & -8, HEAP32[tempVarArgs >> 2] = 0, tempVarArgs) | 0);
  STACKTOP = tempVarArgs;
 }
 if (($5 | 0) == 0) {
  STACKTOP = sp;
  return;
 }
 if (($1 | 0) == 101) {
  if (($Trans | 0) == 111) {
   if (($2 | 0) != 121) {
    label = 35;
   }
  } else {
   label = 35;
  }
 } else {
  label = 35;
 }
 do {
  if ((label | 0) == 35) {
   if (($1 | 0) == 102) {
    if (($Trans | 0) == 112) {
     if (($2 | 0) == 122) {
      break;
     }
    }
   }
   if (($1 | 0) == 101) {
    if (($Trans | 0) == 111) {
     if (($2 | 0) == 122) {
      label = 62;
     } else {
      label = 59;
     }
    } else {
     label = 59;
    }
   } else {
    label = 59;
   }
   do {
    if ((label | 0) == 59) {
     if (($1 | 0) == 102) {
      if (($Trans | 0) == 112) {
       if (($2 | 0) == 121) {
        label = 62;
        break;
       }
      }
     }
     if (($1 | 0) == 101) {
      if (($Trans | 0) == 112) {
       if (($2 | 0) == 121) {
        label = 88;
       } else {
        label = 85;
       }
      } else {
       label = 85;
      }
     } else {
      label = 85;
     }
     do {
      if ((label | 0) == 85) {
       if (($1 | 0) == 102) {
        if (($Trans | 0) == 111) {
         if (($2 | 0) == 122) {
          label = 88;
          break;
         }
        }
       }
       if (($1 | 0) == 101) {
        if (($Trans | 0) == 112) {
         if (($2 | 0) == 122) {
          label = 114;
         } else {
          label = 111;
         }
        } else {
         label = 111;
        }
       } else {
        label = 111;
       }
       do {
        if ((label | 0) == 111) {
         if (($1 | 0) == 102) {
          if (($Trans | 0) == 111) {
           if (($2 | 0) == 121) {
            label = 114;
            break;
           }
          }
         }
         _cblas_xerbla(0, 7288, 7632, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 1 | 0, STACKTOP = STACKTOP + 7 & -8, HEAP32[tempVarArgs >> 2] = 0, tempVarArgs) | 0);
         STACKTOP = tempVarArgs;
        }
       } while (0);
       if ((label | 0) == 114) {
        if (($9 | 0) > 0) {
         $500 = 0;
        } else {
         $500 = Math_imul($5 - 1 | 0, -$9 | 0) | 0;
        }
        $ix = $500 + (Math_imul($5 - 1 | 0, $9) | 0) | 0;
        if (($nonunit | 0) != 0) {
         HEAPF64[$8 + ($ix << 3) >> 3] = +HEAPF64[$8 + ($ix << 3) >> 3] / +HEAPF64[$6 + ((Math_imul($7, $5 - 1 | 0) | 0) + ($5 - 1) << 3) >> 3];
        }
        $ix = $ix - $9 | 0;
        $i = $5 - 1 | 0;
        while (1) {
         if (($i | 0) > 0) {
          $537 = $i;
          $i = $537 - 1 | 0;
          $541 = ($537 | 0) != 0;
         } else {
          $541 = 0;
         }
         if (!$541) {
          break;
         }
         $tmp4 = +HEAPF64[$8 + ($ix << 3) >> 3];
         $jx = $ix + $9 | 0;
         $j = $i + 1 | 0;
         while (1) {
          if (($j | 0) >= ($5 | 0)) {
           break;
          }
          $565 = +HEAPF64[$6 + ((Math_imul($7, $j) | 0) + $i << 3) >> 3];
          $tmp4 = $tmp4 - $565 * +HEAPF64[$8 + ($jx << 3) >> 3];
          $jx = $jx + $9 | 0;
          $j = $j + 1 | 0;
         }
         if (($nonunit | 0) != 0) {
          HEAPF64[$8 + ($ix << 3) >> 3] = $tmp4 / +HEAPF64[$6 + ((Math_imul($7, $i) | 0) + $i << 3) >> 3];
         } else {
          HEAPF64[$8 + ($ix << 3) >> 3] = $tmp4;
         }
         $ix = $ix - $9 | 0;
        }
       }
      }
     } while (0);
     if ((label | 0) == 88) {
      if (($9 | 0) > 0) {
       $372 = 0;
      } else {
       $372 = Math_imul($5 - 1 | 0, -$9 | 0) | 0;
      }
      $ix = $372;
      if (($nonunit | 0) != 0) {
       HEAPF64[$8 + ($ix << 3) >> 3] = +HEAPF64[$8 + ($ix << 3) >> 3] / +HEAPF64[$6 + (0 << 3) >> 3];
      }
      $ix = $ix + $9 | 0;
      $i = 1;
      while (1) {
       if (($i | 0) >= ($5 | 0)) {
        break;
       }
       $tmp3 = +HEAPF64[$8 + ($ix << 3) >> 3];
       if (($9 | 0) > 0) {
        $413 = 0;
       } else {
        $413 = Math_imul($5 - 1 | 0, -$9 | 0) | 0;
       }
       $jx = $413;
       $j = 0;
       while (1) {
        if (($j | 0) >= ($i | 0)) {
         break;
        }
        $427 = +HEAPF64[$6 + ((Math_imul($7, $j) | 0) + $i << 3) >> 3];
        $tmp3 = $tmp3 - $427 * +HEAPF64[$8 + ($jx << 3) >> 3];
        $jx = $jx + $9 | 0;
        $j = $j + 1 | 0;
       }
       if (($nonunit | 0) != 0) {
        HEAPF64[$8 + ($ix << 3) >> 3] = $tmp3 / +HEAPF64[$6 + ((Math_imul($7, $i) | 0) + $i << 3) >> 3];
       } else {
        HEAPF64[$8 + ($ix << 3) >> 3] = $tmp3;
       }
       $ix = $ix + $9 | 0;
       $i = $i + 1 | 0;
      }
     }
    }
   } while (0);
   if ((label | 0) == 62) {
    if (($9 | 0) > 0) {
     $244 = 0;
    } else {
     $244 = Math_imul($5 - 1 | 0, -$9 | 0) | 0;
    }
    $ix = $244;
    if (($nonunit | 0) != 0) {
     HEAPF64[$8 + ($ix << 3) >> 3] = +HEAPF64[$8 + ($ix << 3) >> 3] / +HEAPF64[$6 + (0 << 3) >> 3];
    }
    $ix = $ix + $9 | 0;
    $i = 1;
    while (1) {
     if (($i | 0) >= ($5 | 0)) {
      break;
     }
     $tmp1 = +HEAPF64[$8 + ($ix << 3) >> 3];
     if (($9 | 0) > 0) {
      $285 = 0;
     } else {
      $285 = Math_imul($5 - 1 | 0, -$9 | 0) | 0;
     }
     $jx = $285;
     $j = 0;
     while (1) {
      if (($j | 0) >= ($i | 0)) {
       break;
      }
      $299 = +HEAPF64[$6 + ((Math_imul($7, $i) | 0) + $j << 3) >> 3];
      $tmp1 = $tmp1 - $299 * +HEAPF64[$8 + ($jx << 3) >> 3];
      $jx = $jx + $9 | 0;
      $j = $j + 1 | 0;
     }
     if (($nonunit | 0) != 0) {
      HEAPF64[$8 + ($ix << 3) >> 3] = $tmp1 / +HEAPF64[$6 + ((Math_imul($7, $i) | 0) + $i << 3) >> 3];
     } else {
      HEAPF64[$8 + ($ix << 3) >> 3] = $tmp1;
     }
     $ix = $ix + $9 | 0;
     $i = $i + 1 | 0;
    }
   }
   STACKTOP = sp;
   return;
  }
 } while (0);
 if (($9 | 0) > 0) {
  $109 = 0;
 } else {
  $109 = Math_imul($5 - 1 | 0, -$9 | 0) | 0;
 }
 $ix = $109 + (Math_imul($9, $5 - 1 | 0) | 0) | 0;
 if (($nonunit | 0) != 0) {
  HEAPF64[$8 + ($ix << 3) >> 3] = +HEAPF64[$8 + ($ix << 3) >> 3] / +HEAPF64[$6 + ((Math_imul($7, $5 - 1 | 0) | 0) + ($5 - 1) << 3) >> 3];
 }
 $ix = $ix - $9 | 0;
 $i = $5 - 1 | 0;
 while (1) {
  if (($i | 0) > 0) {
   $146 = $i;
   $i = $146 - 1 | 0;
   $150 = ($146 | 0) != 0;
  } else {
   $150 = 0;
  }
  if (!$150) {
   break;
  }
  $tmp = +HEAPF64[$8 + ($ix << 3) >> 3];
  $jx = $ix + $9 | 0;
  $j = $i + 1 | 0;
  while (1) {
   if (($j | 0) >= ($5 | 0)) {
    break;
   }
   $174 = +HEAPF64[$6 + ((Math_imul($7, $i) | 0) + $j << 3) >> 3];
   $tmp = $tmp - $174 * +HEAPF64[$8 + ($jx << 3) >> 3];
   $jx = $jx + $9 | 0;
   $j = $j + 1 | 0;
  }
  if (($nonunit | 0) != 0) {
   HEAPF64[$8 + ($ix << 3) >> 3] = $tmp / +HEAPF64[$6 + ((Math_imul($7, $i) | 0) + $i << 3) >> 3];
  } else {
   HEAPF64[$8 + ($ix << 3) >> 3] = $tmp;
  }
  $ix = $ix - $9 | 0;
 }
 STACKTOP = sp;
 return;
}
function runPostSets() {}
function _lt($lt_input, $answers) {
 $lt_input = $lt_input | 0;
 $answers = $answers | 0;
 var $3 = 0, $7 = 0, $9 = 0, $13 = 0, $43 = 0, $51 = 0.0, $52 = 0.0, $53 = 0.0, $57 = 0, $59 = 0, $i_064 = 0, $61 = 0, $62 = 0, $j_060 = 0, $66 = 0.0, $68 = 0, $71 = 0, $_lcssa59 = 0, $77 = 0, $79 = 0, $i_156 = 0, $81 = 0, $82 = 0, $j_152 = 0, $86 = 0.0, $88 = 0, $91 = 0, $_lcssa51 = 0, $97 = 0, $99 = 0, $i_249 = 0, $101 = 0, $102 = 0, $j_247 = 0, $106 = 0.0, $108 = 0, $111 = 0, $_lcssa = 0, $119 = 0, $130 = 0, $152 = 0, $153 = 0, $166 = 0, $178 = 0, $i_346 = 0, $186 = 0, $188 = 0.0, $_pre_phi = 0, $_pr = 0, $195 = 0, $197 = 0, $201 = 0, $204 = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[3190] = HEAP32[$lt_input + 28 >> 2];
 $3 = $lt_input + 8 | 0;
 if ((HEAP32[$3 >> 2] | 0) == 0) {
  $13 = HEAP32[3164] | 0;
  if (($13 | 0) != 0) {
   _fwrite(11424, 37, 1, $13 | 0) | 0;
  }
  _oe_exit(3);
 } else {
  $7 = _malloc(1e4) | 0;
  HEAP32[2966] = $7;
  HEAP32[2898] = $7;
  $9 = _fread($7 | 0, 1, 9999, HEAP32[$3 >> 2] | 0) | 0;
  HEAP8[(HEAP32[2966] | 0) + $9 | 0] = 0;
 }
 HEAP32[2994] = HEAP32[$lt_input + 12 >> 2];
 HEAP32[3206] = HEAP32[$lt_input + 16 >> 2];
 HEAP32[3192] = (HEAP32[$lt_input + 24 >> 2] | 0) != 0;
 HEAP32[2870] = 1;
 _init_surge_list() | 0;
 _init_source_list() | 0;
 _init_meter_list() | 0;
 _init_pole_list() | 0;
 _init_span_list() | 0;
 _init_line_list() | 0;
 _init_ground_list() | 0;
 _init_resistor_list() | 0;
 _init_inductor_list() | 0;
 _init_capacitor_list() | 0;
 _init_customer_list() | 0;
 _init_insulator_list() | 0;
 _init_arrester_list() | 0;
 _init_pipegap_list() | 0;
 _init_lpm_list() | 0;
 _init_arrbez_list() | 0;
 _init_steepfront_list() | 0;
 _readfile() | 0;
 $43 = HEAP32[2994] | 0;
 if (($43 | 0) != 0 & (HEAP32[3190] | 0) == 0) {
  _fwrite(11392, 25, 1, $43 | 0) | 0;
  $51 = +HEAPF64[45];
  $52 = +HEAPF64[323];
  $53 = +HEAPF64[1433];
  _fprintf(HEAP32[2994] | 0, 8536, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 32 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[3122], HEAPF64[tempVarArgs + 8 >> 3] = $51, HEAPF64[tempVarArgs + 16 >> 3] = $52, HEAPF64[tempVarArgs + 24 >> 3] = $53, tempVarArgs) | 0) | 0;
  STACKTOP = tempVarArgs;
  _fwrite(6856, 8, 1, HEAP32[2994] | 0) | 0;
  $57 = HEAP32[3122] | 0;
  if (($57 | 0) > 0) {
   $i_064 = 0;
   $59 = $57;
   do {
    $61 = HEAP32[2994] | 0;
    if (($59 | 0) > 0) {
     $j_060 = 0;
     $62 = $61;
     while (1) {
      $66 = +_gsl_matrix_get(HEAP32[(HEAP32[2896] | 0) + 8 >> 2] | 0, $i_064, $j_060);
      _fprintf($62 | 0, 5592, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = $66, tempVarArgs) | 0) | 0;
      STACKTOP = tempVarArgs;
      $68 = $j_060 + 1 | 0;
      $71 = HEAP32[2994] | 0;
      if (($68 | 0) < (HEAP32[3122] | 0)) {
       $j_060 = $68;
       $62 = $71;
      } else {
       $_lcssa59 = $71;
       break;
      }
     }
    } else {
     $_lcssa59 = $61;
    }
    _fputc(10, $_lcssa59 | 0) | 0;
    $i_064 = $i_064 + 1 | 0;
    $59 = HEAP32[3122] | 0;
   } while (($i_064 | 0) < ($59 | 0));
  }
  _fwrite(4160, 8, 1, HEAP32[2994] | 0) | 0;
  $77 = HEAP32[3122] | 0;
  if (($77 | 0) > 0) {
   $i_156 = 0;
   $79 = $77;
   do {
    $81 = HEAP32[2994] | 0;
    if (($79 | 0) > 0) {
     $j_152 = 0;
     $82 = $81;
     while (1) {
      $86 = +_gsl_matrix_get(HEAP32[HEAP32[2896] >> 2] | 0, $i_156, $j_152);
      _fprintf($82 | 0, 5592, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = $86, tempVarArgs) | 0) | 0;
      STACKTOP = tempVarArgs;
      $88 = $j_152 + 1 | 0;
      $91 = HEAP32[2994] | 0;
      if (($88 | 0) < (HEAP32[3122] | 0)) {
       $j_152 = $88;
       $82 = $91;
      } else {
       $_lcssa51 = $91;
       break;
      }
     }
    } else {
     $_lcssa51 = $81;
    }
    _fputc(10, $_lcssa51 | 0) | 0;
    $i_156 = $i_156 + 1 | 0;
    $79 = HEAP32[3122] | 0;
   } while (($i_156 | 0) < ($79 | 0));
  }
  _fwrite(3736, 26, 1, HEAP32[2994] | 0) | 0;
  $97 = HEAP32[3122] | 0;
  if (($97 | 0) > 0) {
   $i_249 = 0;
   $99 = $97;
   do {
    $101 = HEAP32[2994] | 0;
    if (($99 | 0) > 0) {
     $j_247 = 0;
     $102 = $101;
     while (1) {
      $106 = +_gsl_matrix_get(HEAP32[(HEAP32[2896] | 0) + 16 >> 2] | 0, $i_249, $j_247);
      _fprintf($102 | 0, 5592, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = $106, tempVarArgs) | 0) | 0;
      STACKTOP = tempVarArgs;
      $108 = $j_247 + 1 | 0;
      $111 = HEAP32[2994] | 0;
      if (($108 | 0) < (HEAP32[3122] | 0)) {
       $j_247 = $108;
       $102 = $111;
      } else {
       $_lcssa = $111;
       break;
      }
     }
    } else {
     $_lcssa = $101;
    }
    _fputc(10, $_lcssa | 0) | 0;
    $i_249 = $i_249 + 1 | 0;
    $99 = HEAP32[3122] | 0;
   } while (($i_249 | 0) < ($99 | 0));
  }
 }
 if ((HEAP32[2874] | 0) == 0) {
  _connect_lines();
 }
 _do_all_lines(102);
 _do_all_inductors(134);
 _do_all_capacitors(92);
 $119 = _find_pole(1) | 0;
 HEAP32[2978] = $119;
 if (($119 | 0) != 0) {
  HEAP32[$119 + 8 >> 2] = 1;
  if ((HEAP32[3170] | 0) != 0) {
   _terminate_pole($119, HEAP32[2896] | 0);
  }
 }
 $130 = _find_pole(HEAP32[3120] | 0) | 0;
 HEAP32[2978] = $130;
 if (($130 | 0) != 0) {
  HEAP32[$130 + 8 >> 2] = 1;
  if ((HEAP32[2968] | 0) != 0) {
   _terminate_pole($130, HEAP32[2896] | 0);
  }
 }
 if ((HEAP32[2994] | 0) != 0 & (HEAP32[3190] | 0) == 0) {
  _do_all_sources(34);
 }
 _do_all_poles(104);
 HEAPF64[1433] = +HEAPF64[1433] + +HEAPF64[323] * .5;
 $152 = HEAP32[3164] | 0;
 $153 = ($152 | 0) != 0;
 if ((HEAP32[3190] | 0) == 1) {
  if ($153) {
   _fwrite(3416, 28, 1, $152 | 0) | 0;
  }
  _loop_control($lt_input, $answers);
 } else {
  if ($153) {
   _fwrite(3168, 23, 1, $152 | 0) | 0;
  }
  _time_step_loops($answers);
 }
 if ((HEAP32[2994] | 0) != 0) {
  $166 = HEAP32[3164] | 0;
  if (($166 | 0) != 0) {
   _fputc(10, $166 | 0) | 0;
  }
  if ((HEAP32[3190] | 0) == 0) {
   _do_all_meters(136);
   _do_all_insulators(80);
   _do_all_lpms(100);
   _do_all_customers(8);
   _do_all_arresters(4);
   _do_all_arrbezs(86);
   _do_all_pipegaps(140);
  } else {
   $178 = HEAP32[$lt_input + 36 >> 2] | 0;
   _fprintf(HEAP32[2994] | 0, 11344, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[$lt_input + 32 >> 2], HEAP32[tempVarArgs + 8 >> 2] = $178, tempVarArgs) | 0) | 0;
   STACKTOP = tempVarArgs;
   $i_346 = 0;
   while (1) {
    if ((HEAP32[$lt_input + 40 + ($i_346 << 2) >> 2] | 0) > 0) {
     $186 = $i_346 + 1 | 0;
     $188 = +HEAPF64[$answers + 40 + ($i_346 << 3) >> 3];
     _fprintf(HEAP32[2994] | 0, 11096, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempVarArgs >> 2] = $186, HEAPF64[tempVarArgs + 8 >> 3] = $188, tempVarArgs) | 0) | 0;
     STACKTOP = tempVarArgs;
     $_pre_phi = $186;
    } else {
     $_pre_phi = $i_346 + 1 | 0;
    }
    if (($_pre_phi | 0) < 15) {
     $i_346 = $_pre_phi;
    } else {
     break;
    }
   }
  }
  $_pr = HEAP32[2994] | 0;
  if (($_pr | 0) != 0) {
   $195 = HEAP32[3142] | 0;
   _fprintf($_pr | 0, 10304, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[3144], HEAP32[tempVarArgs + 8 >> 2] = $195, tempVarArgs) | 0) | 0;
   STACKTOP = tempVarArgs;
   $204 = _cleanup() | 0;
   STACKTOP = sp;
   return 0;
  }
 }
 $197 = HEAP32[3164] | 0;
 if (($197 | 0) == 0) {
  $204 = _cleanup() | 0;
  STACKTOP = sp;
  return 0;
 }
 $201 = HEAP32[3142] | 0;
 _fprintf($197 | 0, 10304, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[3144], HEAP32[tempVarArgs + 8 >> 2] = $201, tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 $204 = _cleanup() | 0;
 STACKTOP = sp;
 return 0;
}
function _loop_control($lt_input, $answers) {
 $lt_input = $lt_input | 0;
 $answers = $answers | 0;
 var $params = 0, $F = 0, $2 = 0, $5 = 0, $6 = 0, $18 = 0, $19 = 0, $21 = 0, $24 = 0.0, $27 = 0, $28 = 0, $29 = 0.0, $30 = 0, $31 = 0, $32 = 0.0, $pole_number_071 = 0, $case_number_070 = 0, $33 = 0, $34 = 0, $35 = 0, $37 = 0, $insulators_at_one_pole_050 = 0, $first_ins_pole_049 = 0, $42 = 0, $_first_ins_pole_049 = 0, $insulators_at_one_pole_0_ = 0, $45 = 0, $insulators_at_one_pole_0_lcssa = 0, $first_ins_pole_0_lcssa = 0, $47 = 0, $49 = 0, $51 = 0, $insulators_at_one_pole_153 = 0, $first_ins_pole_252 = 0, $56 = 0, $_first_ins_pole_252 = 0, $insulators_at_one_pole_1_ = 0, $59 = 0, $insulators_at_one_pole_1_lcssa = 0, $63 = 0, $65 = 0, $71 = 0, $73 = 0, $75 = 0, $78 = 0, $wire_idx_167 = 0, $case_number_166 = 0, $83 = 0, $88 = 0, $95 = 0, $iter_0 = 0, $101 = 0, $103 = 0.0, $104 = 0.0, $106 = 0, $109 = 0, $status_0 = 0, $iter_1 = 0, $113 = 0, $114 = 0, $119 = 0.0, $120 = 0.0, $121 = 0.0, $case_number_2 = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24 | 0;
 $params = sp | 0;
 $F = sp + 16 | 0;
 HEAP32[$F >> 2] = 2;
 $2 = $params;
 HEAP32[$F + 4 >> 2] = $2;
 $5 = _gsl_root_fsolver_alloc(HEAP32[484] | 0) | 0;
 _memset($answers + 40 | 0, 0, 120) | 0;
 $6 = HEAP32[3164] | 0;
 if (($6 | 0) != 0) {
  _fprintf($6 | 0, 9816, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = (HEAP32[(HEAP32[3216] | 0) + 168 >> 2] | 0) == 0 ? (HEAP32[(HEAP32[3220] | 0) + 160 >> 2] | 0) != 0 | 0 : 1, tempVarArgs) | 0) | 0;
  STACKTOP = tempVarArgs;
 }
 $18 = $lt_input + 36 | 0;
 $19 = HEAP32[$18 >> 2] | 0;
 $21 = HEAP32[$lt_input + 32 >> 2] | 0;
 $24 = +($19 - $21 | 0) + 1.0;
 HEAP32[$params + 8 >> 2] = $answers;
 if (($21 | 0) > ($19 | 0)) {
  _gsl_root_fsolver_free($5);
  STACKTOP = sp;
  return;
 }
 $27 = $params | 0;
 $28 = $params + 4 | 0;
 $29 = 5.0e5 / $24;
 $30 = $answers | 0;
 $31 = $answers + 8 | 0;
 $32 = 3.0e3 / $24;
 $case_number_070 = 0;
 $pole_number_071 = $21;
 while (1) {
  HEAP32[$27 >> 2] = $pole_number_071;
  $33 = HEAP32[3174] | 0;
  HEAP32[3172] = $33;
  $34 = $33 + 80 | 0;
  $35 = HEAP32[$34 >> 2] | 0;
  HEAP32[3172] = $35;
  if (($35 | 0) == 0) {
   $first_ins_pole_0_lcssa = 0;
   $insulators_at_one_pole_0_lcssa = 1;
  } else {
   $first_ins_pole_049 = 0;
   $insulators_at_one_pole_050 = 1;
   $37 = $35;
   while (1) {
    $42 = HEAP32[HEAP32[$37 + 76 >> 2] >> 2] | 0;
    $_first_ins_pole_049 = ($first_ins_pole_049 | 0) == 0 ? $42 : $first_ins_pole_049;
    $insulators_at_one_pole_0_ = ($_first_ins_pole_049 | 0) == ($42 | 0) ? $insulators_at_one_pole_050 : 0;
    $45 = HEAP32[$37 + 80 >> 2] | 0;
    HEAP32[3172] = $45;
    if (($45 | 0) == 0) {
     $first_ins_pole_0_lcssa = $_first_ins_pole_049;
     $insulators_at_one_pole_0_lcssa = $insulators_at_one_pole_0_;
     break;
    } else {
     $first_ins_pole_049 = $_first_ins_pole_049;
     $insulators_at_one_pole_050 = $insulators_at_one_pole_0_;
     $37 = $45;
    }
   }
  }
  $47 = HEAP32[3162] | 0;
  HEAP32[3160] = $47;
  $49 = HEAP32[$47 + 100 >> 2] | 0;
  HEAP32[3160] = $49;
  if (($49 | 0) == 0) {
   $insulators_at_one_pole_1_lcssa = $insulators_at_one_pole_0_lcssa;
  } else {
   $first_ins_pole_252 = $first_ins_pole_0_lcssa;
   $insulators_at_one_pole_153 = $insulators_at_one_pole_0_lcssa;
   $51 = $49;
   while (1) {
    $56 = HEAP32[HEAP32[$51 + 96 >> 2] >> 2] | 0;
    $_first_ins_pole_252 = ($first_ins_pole_252 | 0) == 0 ? $56 : $first_ins_pole_252;
    $insulators_at_one_pole_1_ = ($_first_ins_pole_252 | 0) == ($56 | 0) ? $insulators_at_one_pole_153 : 0;
    $59 = HEAP32[$51 + 100 >> 2] | 0;
    HEAP32[3160] = $59;
    if (($59 | 0) == 0) {
     $insulators_at_one_pole_1_lcssa = $insulators_at_one_pole_1_;
     break;
    } else {
     $first_ins_pole_252 = $_first_ins_pole_252;
     $insulators_at_one_pole_153 = $insulators_at_one_pole_1_;
     $51 = $59;
    }
   }
  }
  if (($insulators_at_one_pole_1_lcssa | 0) == 1) {
   HEAP32[3172] = $33;
   $63 = HEAP32[$34 >> 2] | 0;
   HEAP32[3172] = $63;
   if (($63 | 0) == 0) {
    $71 = $47;
   } else {
    $65 = $63;
    do {
     _move_insulator($65, $pole_number_071);
     $65 = HEAP32[(HEAP32[3172] | 0) + 80 >> 2] | 0;
     HEAP32[3172] = $65;
    } while (($65 | 0) != 0);
    $71 = HEAP32[3162] | 0;
   }
   HEAP32[3160] = $71;
   $73 = HEAP32[$71 + 100 >> 2] | 0;
   HEAP32[3160] = $73;
   if (($73 | 0) == 0) {
    $case_number_166 = $case_number_070;
    $wire_idx_167 = 0;
   } else {
    $75 = $73;
    while (1) {
     _move_lpm($75, $pole_number_071);
     $78 = HEAP32[(HEAP32[3160] | 0) + 100 >> 2] | 0;
     HEAP32[3160] = $78;
     if (($78 | 0) == 0) {
      $case_number_166 = $case_number_070;
      $wire_idx_167 = 0;
      break;
     } else {
      $75 = $78;
     }
    }
   }
  } else {
   $case_number_166 = $case_number_070;
   $wire_idx_167 = 0;
  }
  while (1) {
   $83 = $wire_idx_167 + 1 | 0;
   if ((HEAP32[$lt_input + 40 + ($wire_idx_167 << 2) >> 2] | 0) > 0) {
    HEAP32[$28 >> 2] = $83;
    L30 : do {
     if (+_icrit_function(3.0e3, $2) < 0.0) {
      if (!(+_icrit_function(5.0e5, $2) > 0.0)) {
       $95 = $answers + 40 + ($wire_idx_167 << 3) | 0;
       HEAPF64[$95 >> 3] = $29 + +HEAPF64[$95 >> 3];
       $iter_1 = 0;
       $status_0 = 0;
       break;
      }
      _gsl_root_fsolver_set($5, $F, 3.0e3, 5.0e5) | 0;
      $iter_0 = 0;
      while (1) {
       $101 = $iter_0 + 1 | 0;
       _gsl_root_fsolver_iterate($5) | 0;
       $103 = +_gsl_root_fsolver_root($5);
       $104 = +_gsl_root_fsolver_x_lower($5);
       $106 = _gsl_root_test_interval($104, +_gsl_root_fsolver_x_upper($5), 1.0, 0.0) | 0;
       if (($106 | 0) == 0) {
        break;
       } else if (($106 | 0) != (-2 | 0)) {
        $iter_1 = $101;
        $status_0 = $106;
        break L30;
       }
       if (($101 | 0) < 200) {
        $iter_0 = $101;
       } else {
        $iter_1 = $101;
        $status_0 = -2;
        break L30;
       }
      }
      $109 = $answers + 40 + ($wire_idx_167 << 3) | 0;
      HEAPF64[$109 >> 3] = $103 / $24 + +HEAPF64[$109 >> 3];
      $iter_1 = $101;
      $status_0 = 0;
     } else {
      $88 = $answers + 40 + ($wire_idx_167 << 3) | 0;
      HEAPF64[$88 >> 3] = $32 + +HEAPF64[$88 >> 3];
      $iter_1 = 0;
      $status_0 = 0;
     }
    } while (0);
    $113 = $case_number_166 + 1 | 0;
    $114 = HEAP32[3164] | 0;
    if (($114 | 0) == 0) {
     $case_number_2 = $113;
    } else {
     $119 = +HEAPF64[$answers + 40 + ($wire_idx_167 << 3) >> 3] * .001;
     $120 = +HEAPF64[$30 >> 3];
     $121 = +HEAPF64[$31 >> 3];
     _fprintf($114 | 0, 9480, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 80 | 0, HEAP32[tempVarArgs >> 2] = $113, HEAP32[tempVarArgs + 8 >> 2] = $pole_number_071, HEAP32[tempVarArgs + 16 >> 2] = $83, HEAPF64[tempVarArgs + 24 >> 3] = $119, HEAPF64[tempVarArgs + 32 >> 3] = 3.83, HEAPF64[tempVarArgs + 40 >> 3] = 103.63776466090185, HEAPF64[tempVarArgs + 48 >> 3] = $120, HEAPF64[tempVarArgs + 56 >> 3] = $121, HEAP32[tempVarArgs + 64 >> 2] = $iter_1, HEAP32[tempVarArgs + 72 >> 2] = $status_0, tempVarArgs) | 0) | 0;
     STACKTOP = tempVarArgs;
     _fflush(HEAP32[3164] | 0) | 0;
     $case_number_2 = $113;
    }
   } else {
    $case_number_2 = $case_number_166;
   }
   if (($83 | 0) < 15) {
    $case_number_166 = $case_number_2;
    $wire_idx_167 = $83;
   } else {
    break;
   }
  }
  $pole_number_071 = $pole_number_071 + 1 | 0;
  if (($pole_number_071 | 0) > (HEAP32[$18 >> 2] | 0)) {
   break;
  } else {
   $case_number_070 = $case_number_2;
  }
 }
 _gsl_root_fsolver_free($5);
 STACKTOP = sp;
 return;
}
function _main($argc, $argv) {
 $argc = $argc | 0;
 $argv = $argv | 0;
 var $basename = 0, $inputname = 0, $outputname = 0, $plotname = 0, $4 = 0, $16 = 0, $iteration_mode_0 = 0, $26 = 0, $30 = 0, $35 = 0, $37 = 0, $39 = 0, $41 = 0, $endptr = 0, $endptr47 = 0, $endptr53 = 0, $endptr51 = 0, $endptr49 = 0, $50 = 0, $55 = 0, $63 = 0, $68 = 0, $69 = 0, $84 = 0, $scevgep = 0, $97 = 0, $idx_159 = 0, $106 = 0, $140 = 0, $143 = 0, $145 = 0, $idx_257 = 0, $150 = 0, $153 = 0.0, $158 = 0, $163 = 0, $170 = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 1280 | 0;
 $basename = sp | 0;
 $inputname = sp + 256 | 0;
 $outputname = sp + 512 | 0;
 $plotname = sp + 768 | 0;
 HEAP32[3164] = _fopen(7656, 6248) | 0;
 if (($argc | 0) <= 3) {
  _usage();
  return 0;
 }
 $4 = sp + 1024 | 0;
 _strcpy($4 | 0, HEAP32[$argv + 4 >> 2] | 0) | 0;
 do {
  if ((_strncasecmp($4, 5272, 2) | 0) == 0) {
   _strcpy($4 | 0, HEAP32[$argv + 8 >> 2] | 0) | 0;
   $16 = _tolower(HEAP8[$4] | 0) | 0;
   if (($16 | 0) == 99) {
    HEAP32[2984] = 1;
    $iteration_mode_0 = 0;
    break;
   } else if (($16 | 0) == 116) {
    HEAP32[2984] = 2;
    $iteration_mode_0 = 0;
    break;
   } else if (($16 | 0) == 101) {
    HEAP32[2984] = 3;
    $iteration_mode_0 = 0;
    break;
   } else {
    HEAP32[2984] = 0;
    $iteration_mode_0 = 0;
    break;
   }
  } else {
   if ((_strncasecmp($4, 4408, 2) | 0) == 0) {
    $iteration_mode_0 = 1;
   } else {
    _usage();
    return 0;
   }
  }
 } while (0);
 $26 = $argc - 1 | 0;
 _strcpy($4 | 0, HEAP32[$argv + ($26 << 2) >> 2] | 0) | 0;
 $30 = _strrchr($4, 46) | 0;
 if (($30 | 0) != 0) {
  HEAP8[$30] = 0;
 }
 $35 = $basename | 0;
 _strcpy($35 | 0, $4 | 0) | 0;
 $37 = $inputname | 0;
 _strcpy($37 | 0, $35 | 0) | 0;
 $39 = $outputname | 0;
 _strcpy($39 | 0, $35 | 0) | 0;
 $41 = $plotname | 0;
 _strcpy($41 | 0, $35 | 0) | 0;
 $endptr = $inputname + (_strlen($37 | 0) | 0) | 0;
 HEAP8[$endptr] = HEAP8[4e3] | 0;
 HEAP8[$endptr + 1 | 0] = HEAP8[4001] | 0;
 HEAP8[$endptr + 2 | 0] = HEAP8[4002] | 0;
 HEAP8[$endptr + 3 | 0] = HEAP8[4003] | 0;
 HEAP8[$endptr + 4 | 0] = HEAP8[4004] | 0;
 $endptr47 = $outputname + (_strlen($39 | 0) | 0) | 0;
 HEAP8[$endptr47] = HEAP8[3592] | 0;
 HEAP8[$endptr47 + 1 | 0] = HEAP8[3593] | 0;
 HEAP8[$endptr47 + 2 | 0] = HEAP8[3594] | 0;
 HEAP8[$endptr47 + 3 | 0] = HEAP8[3595] | 0;
 HEAP8[$endptr47 + 4 | 0] = HEAP8[3596] | 0;
 switch (HEAP32[2984] | 0) {
 case 1:
  {
   $endptr53 = $plotname + (_strlen($41 | 0) | 0) | 0;
   HEAP8[$endptr53] = HEAP8[3328] | 0;
   HEAP8[$endptr53 + 1 | 0] = HEAP8[3329] | 0;
   HEAP8[$endptr53 + 2 | 0] = HEAP8[3330] | 0;
   HEAP8[$endptr53 + 3 | 0] = HEAP8[3331] | 0;
   HEAP8[$endptr53 + 4 | 0] = HEAP8[3332] | 0;
   break;
  }
 case 2:
  {
   $endptr51 = $plotname + (_strlen($41 | 0) | 0) | 0;
   HEAP8[$endptr51] = HEAP8[3032] | 0;
   HEAP8[$endptr51 + 1 | 0] = HEAP8[3033] | 0;
   HEAP8[$endptr51 + 2 | 0] = HEAP8[3034] | 0;
   HEAP8[$endptr51 + 3 | 0] = HEAP8[3035] | 0;
   HEAP8[$endptr51 + 4 | 0] = HEAP8[3036] | 0;
   break;
  }
 case 3:
  {
   $endptr49 = $plotname + (_strlen($41 | 0) | 0) | 0;
   HEAP8[$endptr49] = HEAP8[11256] | 0;
   HEAP8[$endptr49 + 1 | 0] = HEAP8[11257] | 0;
   HEAP8[$endptr49 + 2 | 0] = HEAP8[11258] | 0;
   HEAP8[$endptr49 + 3 | 0] = HEAP8[11259] | 0;
   HEAP8[$endptr49 + 4 | 0] = HEAP8[11260] | 0;
   break;
  }
 case 4:
  {
   HEAP8[$41] = 0;
   break;
  }
 case 0:
  {
   HEAP8[$41] = 0;
   break;
  }
 default:
  {}
 }
 $50 = _fopen($37 | 0, 10656) | 0;
 if (($50 | 0) == 0) {
  _printf(10104, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = $37, tempVarArgs) | 0) | 0;
  STACKTOP = tempVarArgs;
  _exit(1);
  return 0;
 }
 $55 = _fopen($39 | 0, 6248) | 0;
 HEAP32[2994] = $55;
 if (($55 | 0) == 0) {
  _printf(9720, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = $39, tempVarArgs) | 0) | 0;
  STACKTOP = tempVarArgs;
  _exit(1);
  return 0;
 }
 if ((HEAP8[$41] | 0) != 0) {
  $63 = _fopen($41 | 0, 9416) | 0;
  HEAP32[3206] = $63;
  if (($63 | 0) == 0) {
   _printf(9328, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = $41, tempVarArgs) | 0) | 0;
   STACKTOP = tempVarArgs;
   _exit(1);
   return 0;
  }
 }
 $68 = _malloc(104) | 0;
 $69 = $68;
 if (($68 | 0) == 0) {
  _puts(136) | 0;
  _exit(1);
  return 0;
 }
 HEAP32[$68 + 24 >> 2] = $iteration_mode_0;
 HEAP32[$68 + 28 >> 2] = $iteration_mode_0;
 HEAP32[$68 + 8 >> 2] = $50;
 HEAP32[$68 + 16 >> 2] = HEAP32[3206];
 HEAP32[$68 + 12 >> 2] = HEAP32[2994];
 $84 = ($iteration_mode_0 | 0) == 1;
 if ($84) {
  HEAP32[$68 + 32 >> 2] = _atoi(HEAP32[$argv + 8 >> 2] | 0) | 0;
  HEAP32[$68 + 36 >> 2] = _atoi(HEAP32[$argv + 12 >> 2] | 0) | 0;
  $scevgep = $68 + 40 | 0;
  _memset($scevgep | 0, 0, 60) | 0;
  if (($26 | 0) > 4) {
   $97 = $scevgep;
   $idx_159 = 4;
   do {
    HEAP32[$97 + ($idx_159 - 4 << 2) >> 2] = _atoi(HEAP32[$argv + ($idx_159 << 2) >> 2] | 0) | 0;
    $idx_159 = $idx_159 + 1 | 0;
   } while (($idx_159 | 0) < ($26 | 0));
  }
 }
 $106 = _malloc(160) | 0;
 if (($106 | 0) == 0) {
  _puts(96) | 0;
  _exit(1);
  return 0;
 }
 _lt($69, $106) | 0;
 if (($iteration_mode_0 | 0) == 0) {
  _puts(80) | 0;
  _printf(8688, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = +HEAPF64[$106 >> 3], tempVarArgs) | 0) | 0;
  STACKTOP = tempVarArgs;
  _printf(8520, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = +HEAPF64[$106 + 8 >> 3], tempVarArgs) | 0) | 0;
  STACKTOP = tempVarArgs;
  _printf(8472, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = +HEAPF64[$106 + 16 >> 3], tempVarArgs) | 0) | 0;
  STACKTOP = tempVarArgs;
  _printf(7800, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = +HEAPF64[$106 + 24 >> 3], tempVarArgs) | 0) | 0;
  STACKTOP = tempVarArgs;
  _printf(7592, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = +HEAPF64[$106 + 32 >> 3], tempVarArgs) | 0) | 0;
  STACKTOP = tempVarArgs;
 } else {
  if ($84) {
   $140 = HEAP32[$68 + 36 >> 2] | 0;
   _printf(7480, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[$68 + 32 >> 2], HEAP32[tempVarArgs + 8 >> 2] = $140, tempVarArgs) | 0) | 0;
   STACKTOP = tempVarArgs;
   $143 = $68 + 40 | 0;
   $145 = $106 + 40 | 0;
   $idx_257 = 0;
   while (1) {
    $150 = $idx_257 + 1 | 0;
    if ((HEAP32[$143 + ($idx_257 << 2) >> 2] | 0) > 0) {
     $153 = +HEAPF64[$145 + ($idx_257 << 3) >> 3];
     _printf(7416, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempVarArgs >> 2] = $150, HEAPF64[tempVarArgs + 8 >> 3] = $153, tempVarArgs) | 0) | 0;
     STACKTOP = tempVarArgs;
    }
    if (($150 | 0) < 15) {
     $idx_257 = $150;
    } else {
     break;
    }
   }
  }
 }
 _fclose($50 | 0) | 0;
 $158 = HEAP32[3206] | 0;
 if (($158 | 0) != 0) {
  _fclose($158 | 0) | 0;
 }
 $163 = HEAP32[2994] | 0;
 if (!(($163 | 0) == 0 | ($163 | 0) == (HEAP32[_stdout >> 2] | 0))) {
  _fclose($163 | 0) | 0;
 }
 $170 = HEAP32[3164] | 0;
 if (($170 | 0) == 0) {
  _free($68);
  _free($106);
  STACKTOP = sp;
  return 0;
 }
 _fclose($170 | 0) | 0;
 _free($68);
 _free($106);
 STACKTOP = sp;
 return 0;
}
function _readfile() {
 var $2 = 0, $5 = 0, $19 = 0, $28 = 0, $i_043 = 0, $39 = 0, $53 = 0, $i_147 = 0, $64 = 0, $70 = 0, $75 = 0, $85 = 0, $90 = 0, $99 = 0, $103 = 0, $105 = 0, $i_239 = 0, $112 = 0, $115 = 0, $119 = 0, $121 = 0, $123 = 0, $i_336 = 0, $130 = 0, $133 = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 _init_parser(HEAP32[2966] | 0);
 HEAP32[3122] = 0;
 HEAP32[3124] = 0;
 HEAP32[3120] = 0;
 HEAPF64[322] = 0.0;
 HEAPF64[96] = 0.0;
 HEAPF64[300] = 0.0;
 HEAP32[3196] = 0;
 HEAP32[2872] = 0;
 HEAP32[2876] = 0;
 $2 = _first_token() | 0;
 if (($2 | 0) == 0) {
  $5 = HEAP32[3164] | 0;
  if (($5 | 0) != 0) {
   _fwrite(4624, 42, 1, $5 | 0) | 0;
  }
  _oe_exit(5);
 }
 L7 : do {
  if ((_strcmp($2, 24) | 0) == 0) {
   HEAP32[2874] = 1;
   _next_int(12488) | 0;
   _next_double(2584) | 0;
   _next_double(11464) | 0;
  } else {
   $19 = (_strcmp($2, 2640) | 0) == 0;
   HEAP32[2874] = 0;
   if (!$19) {
    HEAP32[3122] = _atoi($2) | 0;
    _next_int(12480) | 0;
    _next_double(360) | 0;
    _next_int(12680) | 0;
    _next_int(11872) | 0;
    _next_double(2584) | 0;
    _next_double(11464) | 0;
    $53 = HEAP32[3120] | 0;
    if (($53 | 0) > 0) {
     HEAP32[2976] = _gsl_vector_int_calloc($53) | 0;
     if ((HEAP32[3120] | 0) < 1) {
      break;
     } else {
      $i_147 = 1;
     }
     while (1) {
      _new_pole($i_147) | 0;
      $i_147 = $i_147 + 1 | 0;
      if (($i_147 | 0) > (HEAP32[3120] | 0)) {
       break L7;
      }
     }
    }
    $64 = HEAP32[3164] | 0;
    if (($64 | 0) != 0) {
     _fprintf($64 | 0, 9096, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = $53, tempVarArgs) | 0) | 0;
     STACKTOP = tempVarArgs;
    }
    _oe_exit(7);
    break;
   }
   HEAP32[2872] = 1;
   _next_int(12488) | 0;
   _next_int(12480) | 0;
   _next_double(360) | 0;
   _next_int(12680) | 0;
   _next_int(11872) | 0;
   _next_double(2584) | 0;
   _next_double(11464) | 0;
   $28 = HEAP32[3120] | 0;
   if (($28 | 0) > 0) {
    HEAP32[2976] = _gsl_vector_int_calloc($28) | 0;
    if ((HEAP32[3120] | 0) >= 1) {
     $i_043 = 1;
     do {
      _new_pole($i_043) | 0;
      $i_043 = $i_043 + 1 | 0;
     } while (($i_043 | 0) <= (HEAP32[3120] | 0));
    }
   } else {
    $39 = HEAP32[3164] | 0;
    if (($39 | 0) != 0) {
     _fprintf($39 | 0, 9096, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = $28, tempVarArgs) | 0) | 0;
     STACKTOP = tempVarArgs;
    }
    _oe_exit(7);
   }
   _next_double(2576) | 0;
  }
 } while (0);
 HEAPF64[300] = +HEAPF64[323];
 $70 = HEAP32[3122] | 0;
 if (($70 | 0) > 0) {
  HEAP32[2992] = _gsl_matrix_int_calloc($70, $70) | 0;
 } else {
  $75 = HEAP32[3164] | 0;
  if (($75 | 0) != 0) {
   _fprintf($75 | 0, 7168, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = $70, tempVarArgs) | 0) | 0;
   STACKTOP = tempVarArgs;
  }
  _oe_exit(6);
 }
 HEAP32[3124] = HEAP32[3122];
 do {
  if ((HEAP32[2874] | 0) == 0) {
   _read_conductors(HEAP32[2894] | 0) | 0;
  } else {
   _read_spans();
   _read_lines();
   $85 = HEAP32[3120] | 0;
   if (($85 | 0) > 0) {
    HEAP32[2976] = _gsl_vector_int_calloc($85) | 0;
    break;
   }
   $90 = HEAP32[3164] | 0;
   if (($90 | 0) != 0) {
    _fprintf($90 | 0, 9096, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = $85, tempVarArgs) | 0) | 0;
    STACKTOP = tempVarArgs;
   }
   _oe_exit(7);
  }
 } while (0);
 _reset_lines();
 $99 = HEAP32[3120] | 0;
 $103 = _malloc(($99 << 2) + 4 | 0) | 0;
 HEAP32[2980] = $103;
 L48 : do {
  if (($99 | 0) >= 0) {
   $i_239 = 0;
   $105 = $103;
   while (1) {
    HEAP32[$105 + ($i_239 << 2) >> 2] = _malloc(10) | 0;
    _sprintf(HEAP32[(HEAP32[2980] | 0) + ($i_239 << 2) >> 2] | 0, 5768, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = $i_239, tempVarArgs) | 0) | 0;
    STACKTOP = tempVarArgs;
    $112 = $i_239 + 1 | 0;
    if (($112 | 0) > (HEAP32[3120] | 0)) {
     break L48;
    }
    $i_239 = $112;
    $105 = HEAP32[2980] | 0;
   }
  }
 } while (0);
 $115 = HEAP32[3122] | 0;
 $119 = _malloc(($115 << 2) + 4 | 0) | 0;
 HEAP32[2990] = $119;
 L53 : do {
  if (($115 | 0) >= 0) {
   $i_336 = 0;
   $123 = $119;
   while (1) {
    HEAP32[$123 + ($i_336 << 2) >> 2] = _malloc(10) | 0;
    _sprintf(HEAP32[(HEAP32[2990] | 0) + ($i_336 << 2) >> 2] | 0, 5768, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = $i_336, tempVarArgs) | 0) | 0;
    STACKTOP = tempVarArgs;
    $130 = $i_336 + 1 | 0;
    if (($130 | 0) > (HEAP32[3122] | 0)) {
     break L53;
    }
    $i_336 = $130;
    $123 = HEAP32[2990] | 0;
   }
  }
 } while (0);
 $121 = _first_token() | 0;
 if (($121 | 0) == 0) {
  STACKTOP = sp;
  return 0;
 } else {
  $133 = $121;
 }
 do {
  do {
   if ((_strcmp($133, 1960) | 0) == 0) {
    _read_ground() | 0;
   } else {
    if ((_strcmp($133, 2688) | 0) == 0) {
     _read_arrester() | 0;
     break;
    }
    if ((_strcmp($133, 824) | 0) == 0) {
     _read_pipegap() | 0;
     break;
    }
    if ((_strcmp($133, 872) | 0) == 0) {
     _read_meter() | 0;
     break;
    }
    if ((_strcmp($133, 808) | 0) == 0) {
     _read_pole_label() | 0;
     break;
    }
    if ((_strcmp($133, 832) | 0) == 0) {
     _read_phase_label() | 0;
     break;
    }
    if ((_strcmp($133, 40) | 0) == 0) {
     _read_surge() | 0;
     break;
    }
    if ((_strcmp($133, 1280) | 0) == 0) {
     _read_insulator() | 0;
     break;
    }
    if ((_strcmp($133, 776) | 0) == 0) {
     _read_resistor() | 0;
     break;
    }
    if ((_strcmp($133, 1296) | 0) == 0) {
     _read_inductor() | 0;
     break;
    }
    if ((_strcmp($133, 2592) | 0) == 0) {
     _read_customer() | 0;
     break;
    }
    if ((_strcmp($133, 2648) | 0) == 0) {
     _read_capacitor() | 0;
     break;
    }
    if ((_strcmp($133, 2704) | 0) == 0) {
     _read_arrbez() | 0;
     break;
    }
    if ((_strcmp($133, 880) | 0) == 0) {
     _read_lpm() | 0;
     break;
    }
    if ((_strcmp($133, 336) | 0) == 0) {
     _read_steepfront() | 0;
     break;
    }
    if ((_strcmp($133, 864) | 0) == 0) {
     _read_newarr() | 0;
     break;
    }
    if ((_strcmp($133, 8) | 0) == 0) {
     _read_transformer() | 0;
    }
   }
  } while (0);
  $133 = _first_token() | 0;
 } while (($133 | 0) != 0);
 STACKTOP = sp;
 return 0;
}
function _cblas_dsymv($order, $Uplo, $N, $alpha, $A, $lda, $X, $incX, $beta, $Y, $incY) {
 $order = $order | 0;
 $Uplo = $Uplo | 0;
 $N = $N | 0;
 $alpha = +$alpha;
 $A = $A | 0;
 $lda = $lda | 0;
 $X = $X | 0;
 $incX = $incX | 0;
 $beta = +$beta;
 $Y = $Y | 0;
 $incY = $incY | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0.0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0.0, $10 = 0, $11 = 0, $i = 0, $j = 0, $pos = 0, $iy = 0, $iy1 = 0, $ix = 0, $iy2 = 0, $temp1 = 0.0, $temp2 = 0.0, $j_min = 0, $j_max = 0, $jx = 0, $jy = 0, $ix3 = 0, $iy4 = 0, $temp15 = 0.0, $temp26 = 0.0, $j_max8 = 0, $jx9 = 0, $jy10 = 0, $38 = 0, $76 = 0, $106 = 0, $115 = 0, $153 = 0, $164 = 0, $189 = 0, $204 = 0, $218 = 0.0, $221 = 0, $239 = 0.0, $242 = 0, $275 = 0, $311 = 0, $327 = 0, $338 = 0, $342 = 0, $361 = 0, $375 = 0, $388 = 0.0, $391 = 0, $408 = 0.0, $411 = 0, $444 = 0, label = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 $1 = $order;
 $2 = $Uplo;
 $3 = $N;
 $4 = $alpha;
 $5 = $A;
 $6 = $lda;
 $7 = $X;
 $8 = $incX;
 $9 = $beta;
 $10 = $Y;
 $11 = $incY;
 $pos = 0;
 if (($1 | 0) != 101) {
  if (($1 | 0) != 102) {
   $pos = 1;
  }
 }
 if (($2 | 0) != 121) {
  if (($2 | 0) != 122) {
   $pos = 2;
  }
 }
 if (($3 | 0) < 0) {
  $pos = 3;
 }
 if (1 > ($3 | 0)) {
  $38 = 1;
 } else {
  $38 = $3;
 }
 if (($6 | 0) < ($38 | 0)) {
  $pos = 6;
 }
 if (($8 | 0) == 0) {
  $pos = 8;
 }
 if (($11 | 0) == 0) {
  $pos = 11;
 }
 if (($pos | 0) != 0) {
  _cblas_xerbla($pos, 7960, 12904, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 1 | 0, STACKTOP = STACKTOP + 7 & -8, HEAP32[tempVarArgs >> 2] = 0, tempVarArgs) | 0);
  STACKTOP = tempVarArgs;
 }
 if ($4 == 0.0) {
  if ($9 == 1.0) {
   STACKTOP = sp;
   return;
  }
 }
 if ($9 == 0.0) {
  if (($11 | 0) > 0) {
   $76 = 0;
  } else {
   $76 = Math_imul($3 - 1 | 0, -$11 | 0) | 0;
  }
  $iy = $76;
  $i = 0;
  while (1) {
   if (($i | 0) >= ($3 | 0)) {
    break;
   }
   HEAPF64[$10 + ($iy << 3) >> 3] = 0.0;
   $iy = $iy + $11 | 0;
   $i = $i + 1 | 0;
  }
 } else {
  if ($9 != 1.0) {
   if (($11 | 0) > 0) {
    $106 = 0;
   } else {
    $106 = Math_imul($3 - 1 | 0, -$11 | 0) | 0;
   }
   $iy1 = $106;
   $i = 0;
   while (1) {
    if (($i | 0) >= ($3 | 0)) {
     break;
    }
    $115 = $10 + ($iy1 << 3) | 0;
    HEAPF64[$115 >> 3] = +HEAPF64[$115 >> 3] * $9;
    $iy1 = $iy1 + $11 | 0;
    $i = $i + 1 | 0;
   }
  }
 }
 if ($4 == 0.0) {
  STACKTOP = sp;
  return;
 }
 if (($1 | 0) == 101) {
  if (($2 | 0) != 121) {
   label = 48;
  }
 } else {
  label = 48;
 }
 do {
  if ((label | 0) == 48) {
   if (($1 | 0) == 102) {
    if (($2 | 0) == 122) {
     break;
    }
   }
   if (($1 | 0) == 101) {
    if (($2 | 0) == 122) {
     label = 75;
    } else {
     label = 73;
    }
   } else {
    label = 73;
   }
   do {
    if ((label | 0) == 73) {
     if (($1 | 0) == 102) {
      if (($2 | 0) == 121) {
       label = 75;
       break;
      }
     }
     _cblas_xerbla(0, 7960, 7776, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 1 | 0, STACKTOP = STACKTOP + 7 & -8, HEAP32[tempVarArgs >> 2] = 0, tempVarArgs) | 0);
     STACKTOP = tempVarArgs;
    }
   } while (0);
   if ((label | 0) == 75) {
    if (($8 | 0) > 0) {
     $311 = 0;
    } else {
     $311 = Math_imul($3 - 1 | 0, -$8 | 0) | 0;
    }
    $ix3 = $311 + (Math_imul($3 - 1 | 0, $8) | 0) | 0;
    if (($11 | 0) > 0) {
     $327 = 0;
    } else {
     $327 = Math_imul($3 - 1 | 0, -$11 | 0) | 0;
    }
    $iy4 = $327 + (Math_imul($3 - 1 | 0, $11) | 0) | 0;
    $i = $3;
    while (1) {
     if (($i | 0) > 0) {
      $338 = $i;
      $i = $338 - 1 | 0;
      $342 = ($338 | 0) != 0;
     } else {
      $342 = 0;
     }
     if (!$342) {
      break;
     }
     $temp15 = $4 * +HEAPF64[$7 + ($ix3 << 3) >> 3];
     $temp26 = 0.0;
     $j_max8 = $i;
     if (($8 | 0) > 0) {
      $361 = 0;
     } else {
      $361 = Math_imul($3 - 1 | 0, -$8 | 0) | 0;
     }
     $jx9 = $361 + 0 | 0;
     if (($11 | 0) > 0) {
      $375 = 0;
     } else {
      $375 = Math_imul($3 - 1 | 0, -$11 | 0) | 0;
     }
     $jy10 = $375 + 0 | 0;
     $388 = $temp15 * +HEAPF64[$5 + ((Math_imul($6, $i) | 0) + $i << 3) >> 3];
     $391 = $10 + ($iy4 << 3) | 0;
     HEAPF64[$391 >> 3] = +HEAPF64[$391 >> 3] + $388;
     $j = 0;
     while (1) {
      if (($j | 0) >= ($j_max8 | 0)) {
       break;
      }
      $408 = $temp15 * +HEAPF64[$5 + ((Math_imul($6, $i) | 0) + $j << 3) >> 3];
      $411 = $10 + ($jy10 << 3) | 0;
      HEAPF64[$411 >> 3] = +HEAPF64[$411 >> 3] + $408;
      $temp26 = $temp26 + +HEAPF64[$7 + ($jx9 << 3) >> 3] * +HEAPF64[$5 + ((Math_imul($6, $i) | 0) + $j << 3) >> 3];
      $jx9 = $jx9 + $8 | 0;
      $jy10 = $jy10 + $11 | 0;
      $j = $j + 1 | 0;
     }
     $444 = $10 + ($iy4 << 3) | 0;
     HEAPF64[$444 >> 3] = +HEAPF64[$444 >> 3] + $4 * $temp26;
     $ix3 = $ix3 - $8 | 0;
     $iy4 = $iy4 - $11 | 0;
    }
   }
   STACKTOP = sp;
   return;
  }
 } while (0);
 if (($8 | 0) > 0) {
  $153 = 0;
 } else {
  $153 = Math_imul($3 - 1 | 0, -$8 | 0) | 0;
 }
 $ix = $153;
 if (($11 | 0) > 0) {
  $164 = 0;
 } else {
  $164 = Math_imul($3 - 1 | 0, -$11 | 0) | 0;
 }
 $iy2 = $164;
 $i = 0;
 while (1) {
  if (($i | 0) >= ($3 | 0)) {
   break;
  }
  $temp1 = $4 * +HEAPF64[$7 + ($ix << 3) >> 3];
  $temp2 = 0.0;
  $j_min = $i + 1 | 0;
  $j_max = $3;
  if (($8 | 0) > 0) {
   $189 = 0;
  } else {
   $189 = Math_imul($3 - 1 | 0, -$8 | 0) | 0;
  }
  $jx = $189 + (Math_imul($j_min, $8) | 0) | 0;
  if (($11 | 0) > 0) {
   $204 = 0;
  } else {
   $204 = Math_imul($3 - 1 | 0, -$11 | 0) | 0;
  }
  $jy = $204 + (Math_imul($j_min, $11) | 0) | 0;
  $218 = $temp1 * +HEAPF64[$5 + ((Math_imul($6, $i) | 0) + $i << 3) >> 3];
  $221 = $10 + ($iy2 << 3) | 0;
  HEAPF64[$221 >> 3] = +HEAPF64[$221 >> 3] + $218;
  $j = $j_min;
  while (1) {
   if (($j | 0) >= ($j_max | 0)) {
    break;
   }
   $239 = $temp1 * +HEAPF64[$5 + ((Math_imul($6, $i) | 0) + $j << 3) >> 3];
   $242 = $10 + ($jy << 3) | 0;
   HEAPF64[$242 >> 3] = +HEAPF64[$242 >> 3] + $239;
   $temp2 = $temp2 + +HEAPF64[$7 + ($jx << 3) >> 3] * +HEAPF64[$5 + ((Math_imul($6, $i) | 0) + $j << 3) >> 3];
   $jx = $jx + $8 | 0;
   $jy = $jy + $11 | 0;
   $j = $j + 1 | 0;
  }
  $275 = $10 + ($iy2 << 3) | 0;
  HEAPF64[$275 >> 3] = +HEAPF64[$275 >> 3] + $4 * $temp2;
  $ix = $ix + $8 | 0;
  $iy2 = $iy2 + $11 | 0;
  $i = $i + 1 | 0;
 }
 STACKTOP = sp;
 return;
}
function _calculate_lpm_si($ptr) {
 $ptr = $ptr | 0;
 var $2 = 0.0, $5 = 0, $18 = 0.0, $19 = 0, $20 = 0, $21 = 0, $scale_low_059 = 0.0, $sign_0_i = 0, $i_0_i = 0, $x_0_i = 0.0, $xpos_0_i = 0.0, $xneg_0_i = 0.0, $scale_low_058 = 0.0, $30 = 0.0, $sign_1_i = 0, $x_1_i = 0.0, $35 = 0.0, $38 = 0.0, $43 = 0.0, $45 = 0, $xpos_1_i = 0.0, $xneg_1_i = 0.0, $56 = 0.0, $scale_high_055 = 0.0, $sign_0_i20 = 0, $i_0_i21 = 0, $x_0_i22 = 0.0, $xpos_0_i23 = 0.0, $xneg_0_i24 = 0.0, $66 = 0.0, $sign_1_i25 = 0, $x_1_i26 = 0.0, $71 = 0.0, $74 = 0.0, $79 = 0.0, $81 = 0, $xpos_1_i29 = 0.0, $xneg_1_i30 = 0.0, $scale_high_054 = 0.0, $94 = 0.0, $95 = 0.0, $97 = 0.0, $scale_high_151 = 0.0, $scale_low_150 = 0.0, $sign_0_i34 = 0, $i_0_i35 = 0, $x_0_i36 = 0.0, $xpos_0_i37 = 0.0, $xneg_0_i38 = 0.0, $105 = 0.0, $sign_1_i39 = 0, $x_1_i40 = 0.0, $110 = 0.0, $113 = 0.0, $118 = 0.0, $120 = 0, $xpos_1_i43 = 0.0, $xneg_1_i44 = 0.0, $_0_i46 = 0, $_scale_low_1 = 0.0, $scale_high_1_ = 0.0, $133 = 0.0, $_lcssa = 0.0, $_0 = 0.0;
 $2 = +HEAPF64[323];
 $5 = ~~(+HEAPF64[1433] / $2) + 1 | 0;
 if ((HEAP32[$ptr + 84 >> 2] | 0) == 1) {
  $_0 = 1.0;
  return +$_0;
 }
 if (!(+HEAPF64[$ptr + 64 >> 3] > 0.0)) {
  if (!(+HEAPF64[$ptr + 56 >> 3] > 0.0)) {
   $_0 = 0.0;
   return +$_0;
  }
 }
 $18 = +HEAPF64[$ptr + 24 >> 3];
 $19 = $ptr + 80 | 0;
 $20 = $ptr + 16 | 0;
 $21 = $ptr + 8 | 0;
 $scale_low_059 = 1.0;
 L8 : while (1) {
  $xneg_0_i = $18;
  $xpos_0_i = $18;
  $x_0_i = 0.0;
  $i_0_i = 0;
  $sign_0_i = 0;
  while (1) {
   if (($i_0_i | 0) >= ($5 | 0)) {
    $scale_low_058 = $scale_low_059;
    break L8;
   }
   $30 = $scale_low_059 * +HEAPF32[(HEAP32[$19 >> 2] | 0) + ($i_0_i << 2) >> 2];
   if ($30 > 0.0) {
    $x_1_i = $xpos_0_i;
    $sign_1_i = 1;
   } else {
    if ($30 < 0.0) {
     $x_1_i = $xneg_0_i;
     $sign_1_i = -1;
    } else {
     $x_1_i = $x_0_i;
     $sign_1_i = $sign_0_i;
    }
   }
   $35 = +Math_abs(+$30);
   $38 = $2 * $35 * +HEAPF64[$20 >> 3];
   $43 = $35 * $38 / $x_1_i - $38 * +HEAPF64[$21 >> 3];
   $45 = $43 > 0.0;
   if (($sign_1_i | 0) > 0 & $45) {
    $xneg_1_i = $xneg_0_i;
    $xpos_1_i = $xpos_0_i - $43;
   } else {
    if ($45) {
     $xneg_1_i = $xneg_0_i - $43;
     $xpos_1_i = $xpos_0_i;
    } else {
     $xneg_1_i = $xneg_0_i;
     $xpos_1_i = $xpos_0_i;
    }
   }
   if ($xpos_1_i > 0.0 & $xneg_1_i > 0.0) {
    $xneg_0_i = $xneg_1_i;
    $xpos_0_i = $xpos_1_i;
    $x_0_i = $x_1_i;
    $i_0_i = $i_0_i + 1 | 0;
    $sign_0_i = $sign_1_i;
   } else {
    break;
   }
  }
  $56 = $scale_low_059 * .5;
  if ($56 > .01) {
   $scale_low_059 = $56;
  } else {
   $scale_low_058 = $56;
   break;
  }
 }
 $scale_high_055 = 1.0;
 L24 : while (1) {
  $xneg_0_i24 = $18;
  $xpos_0_i23 = $18;
  $x_0_i22 = 0.0;
  $i_0_i21 = 0;
  $sign_0_i20 = 0;
  while (1) {
   if (($i_0_i21 | 0) >= ($5 | 0)) {
    break;
   }
   $66 = $scale_high_055 * +HEAPF32[(HEAP32[$19 >> 2] | 0) + ($i_0_i21 << 2) >> 2];
   if ($66 > 0.0) {
    $x_1_i26 = $xpos_0_i23;
    $sign_1_i25 = 1;
   } else {
    if ($66 < 0.0) {
     $x_1_i26 = $xneg_0_i24;
     $sign_1_i25 = -1;
    } else {
     $x_1_i26 = $x_0_i22;
     $sign_1_i25 = $sign_0_i20;
    }
   }
   $71 = +Math_abs(+$66);
   $74 = $2 * $71 * +HEAPF64[$20 >> 3];
   $79 = $71 * $74 / $x_1_i26 - $74 * +HEAPF64[$21 >> 3];
   $81 = $79 > 0.0;
   if (($sign_1_i25 | 0) > 0 & $81) {
    $xneg_1_i30 = $xneg_0_i24;
    $xpos_1_i29 = $xpos_0_i23 - $79;
   } else {
    if ($81) {
     $xneg_1_i30 = $xneg_0_i24 - $79;
     $xpos_1_i29 = $xpos_0_i23;
    } else {
     $xneg_1_i30 = $xneg_0_i24;
     $xpos_1_i29 = $xpos_0_i23;
    }
   }
   if ($xpos_1_i29 > 0.0 & $xneg_1_i30 > 0.0) {
    $xneg_0_i24 = $xneg_1_i30;
    $xpos_0_i23 = $xpos_1_i29;
    $x_0_i22 = $x_1_i26;
    $i_0_i21 = $i_0_i21 + 1 | 0;
    $sign_0_i20 = $sign_1_i25;
   } else {
    $scale_high_054 = $scale_high_055;
    break L24;
   }
  }
  $95 = $scale_high_055 * 2.0;
  if ($95 < 100.0) {
   $scale_high_055 = $95;
  } else {
   $scale_high_054 = $95;
   break;
  }
 }
 $94 = ($scale_low_058 + $scale_high_054) * .5;
 if ($scale_high_054 - $scale_low_058 > 1.0e-4) {
  $scale_low_150 = $scale_low_058;
  $scale_high_151 = $scale_high_054;
  $97 = $94;
  while (1) {
   $xneg_0_i38 = $18;
   $xpos_0_i37 = $18;
   $x_0_i36 = 0.0;
   $i_0_i35 = 0;
   $sign_0_i34 = 0;
   while (1) {
    if (($i_0_i35 | 0) >= ($5 | 0)) {
     $_0_i46 = 1;
     break;
    }
    $105 = $97 * +HEAPF32[(HEAP32[$19 >> 2] | 0) + ($i_0_i35 << 2) >> 2];
    if ($105 > 0.0) {
     $x_1_i40 = $xpos_0_i37;
     $sign_1_i39 = 1;
    } else {
     if ($105 < 0.0) {
      $x_1_i40 = $xneg_0_i38;
      $sign_1_i39 = -1;
     } else {
      $x_1_i40 = $x_0_i36;
      $sign_1_i39 = $sign_0_i34;
     }
    }
    $110 = +Math_abs(+$105);
    $113 = $2 * $110 * +HEAPF64[$20 >> 3];
    $118 = $110 * $113 / $x_1_i40 - $113 * +HEAPF64[$21 >> 3];
    $120 = $118 > 0.0;
    if (($sign_1_i39 | 0) > 0 & $120) {
     $xneg_1_i44 = $xneg_0_i38;
     $xpos_1_i43 = $xpos_0_i37 - $118;
    } else {
     if ($120) {
      $xneg_1_i44 = $xneg_0_i38 - $118;
      $xpos_1_i43 = $xpos_0_i37;
     } else {
      $xneg_1_i44 = $xneg_0_i38;
      $xpos_1_i43 = $xpos_0_i37;
     }
    }
    if ($xpos_1_i43 > 0.0 & $xneg_1_i44 > 0.0) {
     $xneg_0_i38 = $xneg_1_i44;
     $xpos_0_i37 = $xpos_1_i43;
     $x_0_i36 = $x_1_i40;
     $i_0_i35 = $i_0_i35 + 1 | 0;
     $sign_0_i34 = $sign_1_i39;
    } else {
     $_0_i46 = 0;
     break;
    }
   }
   $_scale_low_1 = $_0_i46 ? $97 : $scale_low_150;
   $scale_high_1_ = $_0_i46 ? $scale_high_151 : $97;
   $133 = ($_scale_low_1 + $scale_high_1_) * .5;
   if ($scale_high_1_ - $_scale_low_1 > 1.0e-4) {
    $scale_low_150 = $_scale_low_1;
    $scale_high_151 = $scale_high_1_;
    $97 = $133;
   } else {
    $_lcssa = $133;
    break;
   }
  }
 } else {
  $_lcssa = $94;
 }
 $_0 = 1.0 / $_lcssa;
 return +$_0;
}
function _read_meter() {
 var $i = 0, $j = 0, $k = 0, $mtype = 0, $21 = 0, $23 = 0, $24 = 0, $26 = 0, $27 = 0, $47 = 0, $54 = 0, $57 = 0, $58 = 0, $59 = 0, $60 = 0, $80 = 0, $89 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $115 = 0, $124 = 0, $127 = 0, $128 = 0, $130 = 0, $131 = 0, $132 = 0, $152 = 0, $161 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $187 = 0, $196 = 0, $199 = 0, $200 = 0, $201 = 0, $202 = 0, $222 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32 | 0;
 $i = sp | 0;
 $j = sp + 8 | 0;
 $k = sp + 16 | 0;
 $mtype = sp + 24 | 0;
 _next_int($mtype) | 0;
 HEAP32[$mtype >> 2] = -(HEAP32[$mtype >> 2] | 0);
 _read_pairs() | 0;
 _read_poles() | 0;
 _reset_assignments() | 0;
 if ((_next_assignment($i, $j, $k) | 0) != 0) {
  STACKTOP = sp;
  return 0;
 }
 do {
  L5 : do {
   switch (HEAP32[$mtype >> 2] | 0) {
   case -2:
    {
     $89 = _find_ground(HEAP32[$i >> 2] | 0, HEAP32[$j >> 2] | 0, HEAP32[$k >> 2] | 0) | 0;
     if (($89 | 0) != 0) {
      $92 = HEAP32[$i >> 2] | 0;
      $93 = HEAP32[$j >> 2] | 0;
      $94 = _malloc(40) | 0;
      $95 = $94;
      if (($94 | 0) != 0) {
       HEAP32[$94 + 24 >> 2] = $89 + 64;
       HEAP32[$94 + 28 >> 2] = 1952;
       HEAP32[$94 + 8 >> 2] = $92;
       HEAP32[$94 >> 2] = $93;
       HEAP32[$94 + 4 >> 2] = -2;
       HEAPF64[$94 + 16 >> 3] = 0.0;
       HEAP32[$94 + 32 >> 2] = 0;
       HEAP32[(HEAP32[3156] | 0) + 32 >> 2] = $95;
       HEAP32[3156] = $95;
       break L5;
      }
      $115 = HEAP32[3164] | 0;
      if (($115 | 0) != 0) {
       _fwrite(3e3, 27, 1, $115 | 0) | 0;
      }
      _oe_exit(2);
     }
     break;
    }
   case -4:
    {
     $161 = _find_customer(HEAP32[$i >> 2] | 0, HEAP32[$j >> 2] | 0, HEAP32[$k >> 2] | 0) | 0;
     if (($161 | 0) != 0) {
      $164 = HEAP32[$i >> 2] | 0;
      $165 = HEAP32[$j >> 2] | 0;
      $166 = _malloc(40) | 0;
      $167 = $166;
      if (($166 | 0) != 0) {
       HEAP32[$166 + 24 >> 2] = $161 + 24;
       HEAP32[$166 + 28 >> 2] = 1952;
       HEAP32[$166 + 8 >> 2] = $164;
       HEAP32[$166 >> 2] = $165;
       HEAP32[$166 + 4 >> 2] = -4;
       HEAPF64[$166 + 16 >> 3] = 0.0;
       HEAP32[$166 + 32 >> 2] = 0;
       HEAP32[(HEAP32[3156] | 0) + 32 >> 2] = $167;
       HEAP32[3156] = $167;
       break L5;
      }
      $187 = HEAP32[3164] | 0;
      if (($187 | 0) != 0) {
       _fwrite(3e3, 27, 1, $187 | 0) | 0;
      }
      _oe_exit(2);
     }
     break;
    }
   case 0:
    {
     _add_voltmeter(HEAP32[$i >> 2] | 0, HEAP32[$j >> 2] | 0, HEAP32[$k >> 2] | 0) | 0;
     break;
    }
   case -1:
    {
     $21 = _find_arrester(HEAP32[$i >> 2] | 0, HEAP32[$j >> 2] | 0, HEAP32[$k >> 2] | 0) | 0;
     $23 = HEAP32[$i >> 2] | 0;
     $24 = HEAP32[$j >> 2] | 0;
     if (($21 | 0) != 0) {
      $26 = _malloc(40) | 0;
      $27 = $26;
      if (($26 | 0) != 0) {
       HEAP32[$26 + 24 >> 2] = $21 + 144;
       HEAP32[$26 + 28 >> 2] = 1952;
       HEAP32[$26 + 8 >> 2] = $23;
       HEAP32[$26 >> 2] = $24;
       HEAP32[$26 + 4 >> 2] = -1;
       HEAPF64[$26 + 16 >> 3] = 0.0;
       HEAP32[$26 + 32 >> 2] = 0;
       HEAP32[(HEAP32[3156] | 0) + 32 >> 2] = $27;
       HEAP32[3156] = $27;
       break L5;
      }
      $47 = HEAP32[3164] | 0;
      if (($47 | 0) != 0) {
       _fwrite(3e3, 27, 1, $47 | 0) | 0;
      }
      _oe_exit(2);
      break L5;
     }
     $54 = _find_arrbez($23, $24, HEAP32[$k >> 2] | 0) | 0;
     if (($54 | 0) != 0) {
      $57 = HEAP32[$i >> 2] | 0;
      $58 = HEAP32[$j >> 2] | 0;
      $59 = _malloc(40) | 0;
      $60 = $59;
      if (($59 | 0) != 0) {
       HEAP32[$59 + 24 >> 2] = $54 + 128;
       HEAP32[$59 + 28 >> 2] = 1952;
       HEAP32[$59 + 8 >> 2] = $57;
       HEAP32[$59 >> 2] = $58;
       HEAP32[$59 + 4 >> 2] = -1;
       HEAPF64[$59 + 16 >> 3] = 0.0;
       HEAP32[$59 + 32 >> 2] = 0;
       HEAP32[(HEAP32[3156] | 0) + 32 >> 2] = $60;
       HEAP32[3156] = $60;
       break L5;
      }
      $80 = HEAP32[3164] | 0;
      if (($80 | 0) != 0) {
       _fwrite(3e3, 27, 1, $80 | 0) | 0;
      }
      _oe_exit(2);
     }
     break;
    }
   case -5:
    {
     $196 = _find_pipegap(HEAP32[$i >> 2] | 0, HEAP32[$j >> 2] | 0, HEAP32[$k >> 2] | 0) | 0;
     if (($196 | 0) != 0) {
      $199 = HEAP32[$i >> 2] | 0;
      $200 = HEAP32[$j >> 2] | 0;
      $201 = _malloc(40) | 0;
      $202 = $201;
      if (($201 | 0) != 0) {
       HEAP32[$201 + 24 >> 2] = $196 + 48;
       HEAP32[$201 + 28 >> 2] = 1952;
       HEAP32[$201 + 8 >> 2] = $199;
       HEAP32[$201 >> 2] = $200;
       HEAP32[$201 + 4 >> 2] = -5;
       HEAPF64[$201 + 16 >> 3] = 0.0;
       HEAP32[$201 + 32 >> 2] = 0;
       HEAP32[(HEAP32[3156] | 0) + 32 >> 2] = $202;
       HEAP32[3156] = $202;
       break L5;
      }
      $222 = HEAP32[3164] | 0;
      if (($222 | 0) != 0) {
       _fwrite(3e3, 27, 1, $222 | 0) | 0;
      }
      _oe_exit(2);
     }
     break;
    }
   case -3:
    {
     $124 = _find_customer(HEAP32[$i >> 2] | 0, HEAP32[$j >> 2] | 0, HEAP32[$k >> 2] | 0) | 0;
     if (($124 | 0) != 0) {
      $127 = HEAP32[$i >> 2] | 0;
      $128 = HEAP32[$j >> 2] | 0;
      $130 = HEAP32[$124 + 68 >> 2] | 0;
      $131 = _malloc(40) | 0;
      $132 = $131;
      if (($131 | 0) != 0) {
       HEAP32[$131 + 24 >> 2] = $130 + 64;
       HEAP32[$131 + 28 >> 2] = 1952;
       HEAP32[$131 + 8 >> 2] = $127;
       HEAP32[$131 >> 2] = $128;
       HEAP32[$131 + 4 >> 2] = -3;
       HEAPF64[$131 + 16 >> 3] = 0.0;
       HEAP32[$131 + 32 >> 2] = 0;
       HEAP32[(HEAP32[3156] | 0) + 32 >> 2] = $132;
       HEAP32[3156] = $132;
       break L5;
      }
      $152 = HEAP32[3164] | 0;
      if (($152 | 0) != 0) {
       _fwrite(3e3, 27, 1, $152 | 0) | 0;
      }
      _oe_exit(2);
     }
     break;
    }
   default:
    {}
   }
  } while (0);
 } while ((_next_assignment($i, $j, $k) | 0) == 0);
 STACKTOP = sp;
 return 0;
}
function _cblas_dgemv($order, $TransA, $M, $N, $alpha, $A, $lda, $X, $incX, $beta, $Y, $incY) {
 $order = $order | 0;
 $TransA = $TransA | 0;
 $M = $M | 0;
 $N = $N | 0;
 $alpha = +$alpha;
 $A = $A | 0;
 $lda = $lda | 0;
 $X = $X | 0;
 $incX = $incX | 0;
 $beta = +$beta;
 $Y = $Y | 0;
 $incY = $incY | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0.0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $10 = 0.0, $11 = 0, $12 = 0, $i = 0, $j = 0, $lenX = 0, $lenY = 0, $Trans = 0, $pos = 0, $iy = 0, $iy1 = 0, $iy2 = 0, $temp = 0.0, $ix = 0, $ix3 = 0, $temp4 = 0.0, $iy5 = 0, $19 = 0, $56 = 0, $71 = 0, $127 = 0, $157 = 0, $166 = 0, $204 = 0, $220 = 0, $253 = 0, $286 = 0, $311 = 0, $326 = 0.0, $329 = 0, label = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 $1 = $order;
 $2 = $TransA;
 $3 = $M;
 $4 = $N;
 $5 = $alpha;
 $6 = $A;
 $7 = $lda;
 $8 = $X;
 $9 = $incX;
 $10 = $beta;
 $11 = $Y;
 $12 = $incY;
 if (($2 | 0) != 113) {
  $19 = $2;
 } else {
  $19 = 112;
 }
 $Trans = $19;
 $pos = 0;
 if (($1 | 0) != 101) {
  if (($1 | 0) != 102) {
   $pos = 1;
  }
 }
 if (($2 | 0) != 111) {
  if (($2 | 0) != 112) {
   if (($2 | 0) != 113) {
    $pos = 2;
   }
  }
 }
 if (($3 | 0) < 0) {
  $pos = 3;
 }
 if (($4 | 0) < 0) {
  $pos = 4;
 }
 if (($1 | 0) == 101) {
  if (1 > ($4 | 0)) {
   $56 = 1;
  } else {
   $56 = $4;
  }
  if (($7 | 0) < ($56 | 0)) {
   $pos = 7;
  }
 } else {
  if (($1 | 0) == 102) {
   if (1 > ($3 | 0)) {
    $71 = 1;
   } else {
    $71 = $3;
   }
   if (($7 | 0) < ($71 | 0)) {
    $pos = 7;
   }
  }
 }
 if (($9 | 0) == 0) {
  $pos = 9;
 }
 if (($12 | 0) == 0) {
  $pos = 12;
 }
 if (($pos | 0) != 0) {
  _cblas_xerbla($pos, 9e3, 12912, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 1 | 0, STACKTOP = STACKTOP + 7 & -8, HEAP32[tempVarArgs >> 2] = 0, tempVarArgs) | 0);
  STACKTOP = tempVarArgs;
 }
 if (($3 | 0) != 0) {
  if (($4 | 0) != 0) {
   if ($5 == 0.0) {
    if ($10 == 1.0) {
     STACKTOP = sp;
     return;
    }
   }
   if (($Trans | 0) == 111) {
    $lenX = $4;
    $lenY = $3;
   } else {
    $lenX = $3;
    $lenY = $4;
   }
   if ($10 == 0.0) {
    if (($12 | 0) > 0) {
     $127 = 0;
    } else {
     $127 = Math_imul($lenY - 1 | 0, -$12 | 0) | 0;
    }
    $iy = $127;
    $i = 0;
    while (1) {
     if (($i | 0) >= ($lenY | 0)) {
      break;
     }
     HEAPF64[$11 + ($iy << 3) >> 3] = 0.0;
     $iy = $iy + $12 | 0;
     $i = $i + 1 | 0;
    }
   } else {
    if ($10 != 1.0) {
     if (($12 | 0) > 0) {
      $157 = 0;
     } else {
      $157 = Math_imul($lenY - 1 | 0, -$12 | 0) | 0;
     }
     $iy1 = $157;
     $i = 0;
     while (1) {
      if (($i | 0) >= ($lenY | 0)) {
       break;
      }
      $166 = $11 + ($iy1 << 3) | 0;
      HEAPF64[$166 >> 3] = +HEAPF64[$166 >> 3] * $10;
      $iy1 = $iy1 + $12 | 0;
      $i = $i + 1 | 0;
     }
    }
   }
   if ($5 == 0.0) {
    STACKTOP = sp;
    return;
   }
   if (($1 | 0) == 101) {
    if (($Trans | 0) != 111) {
     label = 70;
    }
   } else {
    label = 70;
   }
   do {
    if ((label | 0) == 70) {
     if (($1 | 0) == 102) {
      if (($Trans | 0) == 112) {
       break;
      }
     }
     if (($1 | 0) == 101) {
      if (($Trans | 0) == 112) {
       label = 91;
      } else {
       label = 89;
      }
     } else {
      label = 89;
     }
     do {
      if ((label | 0) == 89) {
       if (($1 | 0) == 102) {
        if (($Trans | 0) == 111) {
         label = 91;
         break;
        }
       }
       _cblas_xerbla(0, 9e3, 7888, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 1 | 0, STACKTOP = STACKTOP + 7 & -8, HEAP32[tempVarArgs >> 2] = 0, tempVarArgs) | 0);
       STACKTOP = tempVarArgs;
      }
     } while (0);
     if ((label | 0) == 91) {
      if (($9 | 0) > 0) {
       $286 = 0;
      } else {
       $286 = Math_imul($lenX - 1 | 0, -$9 | 0) | 0;
      }
      $ix3 = $286;
      $j = 0;
      while (1) {
       if (($j | 0) >= ($lenX | 0)) {
        break;
       }
       $temp4 = $5 * +HEAPF64[$8 + ($ix3 << 3) >> 3];
       if ($temp4 != 0.0) {
        if (($12 | 0) > 0) {
         $311 = 0;
        } else {
         $311 = Math_imul($lenY - 1 | 0, -$12 | 0) | 0;
        }
        $iy5 = $311;
        $i = 0;
        while (1) {
         if (($i | 0) >= ($lenY | 0)) {
          break;
         }
         $326 = $temp4 * +HEAPF64[$6 + ((Math_imul($7, $j) | 0) + $i << 3) >> 3];
         $329 = $11 + ($iy5 << 3) | 0;
         HEAPF64[$329 >> 3] = +HEAPF64[$329 >> 3] + $326;
         $iy5 = $iy5 + $12 | 0;
         $i = $i + 1 | 0;
        }
       }
       $ix3 = $ix3 + $9 | 0;
       $j = $j + 1 | 0;
      }
     }
     STACKTOP = sp;
     return;
    }
   } while (0);
   if (($12 | 0) > 0) {
    $204 = 0;
   } else {
    $204 = Math_imul($lenY - 1 | 0, -$12 | 0) | 0;
   }
   $iy2 = $204;
   $i = 0;
   while (1) {
    if (($i | 0) >= ($lenY | 0)) {
     break;
    }
    $temp = 0.0;
    if (($9 | 0) > 0) {
     $220 = 0;
    } else {
     $220 = Math_imul($lenX - 1 | 0, -$9 | 0) | 0;
    }
    $ix = $220;
    $j = 0;
    while (1) {
     if (($j | 0) >= ($lenX | 0)) {
      break;
     }
     $temp = $temp + +HEAPF64[$8 + ($ix << 3) >> 3] * +HEAPF64[$6 + ((Math_imul($7, $i) | 0) + $j << 3) >> 3];
     $ix = $ix + $9 | 0;
     $j = $j + 1 | 0;
    }
    $253 = $11 + ($iy2 << 3) | 0;
    HEAPF64[$253 >> 3] = +HEAPF64[$253 >> 3] + $5 * $temp;
    $iy2 = $iy2 + $12 | 0;
    $i = $i + 1 | 0;
   }
   STACKTOP = sp;
   return;
  }
 }
 STACKTOP = sp;
 return;
}
function _InitializePlotOutput($head, $dT, $Tmax) {
 $head = $head | 0;
 $dT = +$dT;
 $Tmax = +$Tmax;
 var $_ph21_i = 0, $_ph22_i = 0, $ptr_0_ph_i = 0, $ptr_0_i = 0, $5 = 0, $9 = 0, $10 = 0, $__i = 0, $ptr_1_i = 0, $46 = 0, $50 = 0, $51 = 0, $_17_i = 0, $_ph_i = 0, $_ph19_i = 0, $ptr_1_ph_i = 0, $84 = 0, $85 = 0, $ptr_218_i = 0, $88 = 0, $94 = 0, $97 = 0, $99 = 0, $100 = 0, $101 = 0, $106 = 0, $108 = 0, $109 = 0, $110 = 0, $112 = 0, $114 = 0, $115 = 0, $117 = 0, $120 = 0, label = 0;
 $ptr_0_ph_i = $head;
 $_ph22_i = 0;
 $_ph21_i = 0;
 L1 : while (1) {
  $ptr_0_i = $ptr_0_ph_i;
  do {
   $ptr_0_i = HEAP32[$ptr_0_i + 32 >> 2] | 0;
   if (($ptr_0_i | 0) == 0) {
    $ptr_1_ph_i = $head;
    $_ph19_i = $_ph22_i;
    $_ph_i = $_ph21_i;
    break L1;
   }
   $5 = $ptr_0_i + 4 | 0;
  } while (!((HEAP32[$5 >> 2] | 0) > -1));
  $9 = _malloc(40) | 0;
  $10 = $9;
  if (($9 | 0) == 0) {
   label = 6;
   break;
  }
  HEAP32[$9 + 8 >> 2] = HEAP32[$ptr_0_i + 8 >> 2];
  HEAP32[$9 >> 2] = HEAP32[$ptr_0_i >> 2];
  HEAP32[$9 + 4 >> 2] = HEAP32[$5 >> 2];
  HEAPF64[$9 + 16 >> 3] = +HEAPF64[$ptr_0_i + 16 >> 3];
  HEAP32[$9 + 24 >> 2] = HEAP32[$ptr_0_i + 24 >> 2];
  HEAP32[$9 + 28 >> 2] = HEAP32[$ptr_0_i + 28 >> 2];
  HEAP32[$9 + 32 >> 2] = 0;
  $__i = ($_ph21_i | 0) == 0 ? $10 : $_ph21_i;
  if (($_ph22_i | 0) == 0) {
   $ptr_0_ph_i = $ptr_0_i;
   $_ph22_i = $10;
   $_ph21_i = $__i;
   continue;
  }
  HEAP32[$_ph22_i + 32 >> 2] = $10;
  $ptr_0_ph_i = $ptr_0_i;
  $_ph22_i = $10;
  $_ph21_i = $__i;
 }
 if ((label | 0) == 6) {
  _puts(48) | 0;
  _exit(1);
 }
 L11 : while (1) {
  $ptr_1_i = $ptr_1_ph_i;
  do {
   $ptr_1_i = HEAP32[$ptr_1_i + 32 >> 2] | 0;
   if (($ptr_1_i | 0) == 0) {
    break L11;
   }
   $46 = $ptr_1_i + 4 | 0;
  } while ((HEAP32[$46 >> 2] | 0) >= 0);
  $50 = _malloc(40) | 0;
  $51 = $50;
  if (($50 | 0) == 0) {
   label = 12;
   break;
  }
  HEAP32[$50 + 8 >> 2] = HEAP32[$ptr_1_i + 8 >> 2];
  HEAP32[$50 >> 2] = HEAP32[$ptr_1_i >> 2];
  HEAP32[$50 + 4 >> 2] = HEAP32[$46 >> 2];
  HEAPF64[$50 + 16 >> 3] = +HEAPF64[$ptr_1_i + 16 >> 3];
  HEAP32[$50 + 24 >> 2] = HEAP32[$ptr_1_i + 24 >> 2];
  HEAP32[$50 + 28 >> 2] = HEAP32[$ptr_1_i + 28 >> 2];
  HEAP32[$50 + 32 >> 2] = 0;
  $_17_i = ($_ph_i | 0) == 0 ? $51 : $_ph_i;
  if (($_ph19_i | 0) == 0) {
   $ptr_1_ph_i = $ptr_1_i;
   $_ph19_i = $51;
   $_ph_i = $_17_i;
   continue;
  }
  HEAP32[$_ph19_i + 32 >> 2] = $51;
  $ptr_1_ph_i = $ptr_1_i;
  $_ph19_i = $51;
  $_ph_i = $_17_i;
 }
 if ((label | 0) == 12) {
  _puts(48) | 0;
  _exit(1);
 }
 $84 = $head + 32 | 0;
 $85 = HEAP32[$84 >> 2] | 0;
 if (($85 | 0) != 0) {
  $ptr_218_i = $85;
  while (1) {
   $88 = HEAP32[$ptr_218_i + 32 >> 2] | 0;
   _free($ptr_218_i);
   if (($88 | 0) == 0) {
    break;
   } else {
    $ptr_218_i = $88;
   }
  }
 }
 HEAP32[$84 >> 2] = $_ph_i;
 if ((HEAP32[3206] | 0) == 0) {
  return;
 }
 $94 = HEAP32[2984] | 0;
 if (($94 | 0) == 3) {
  HEAP16[5992] = 496;
  _strncpy(11986, 3400, 16) | 0;
  HEAP16[6001] = 2;
  HEAP16[6002] = 0;
  HEAPF64[tempDoublePtr >> 3] = 376.999, tempBigInt = HEAP32[tempDoublePtr >> 2] | 0, HEAP16[6003] = tempBigInt, HEAP16[6004] = tempBigInt >> 16, tempBigInt = HEAP32[tempDoublePtr + 4 >> 2] | 0, HEAP16[6005] = tempBigInt, HEAP16[6006] = tempBigInt >> 16;
  HEAPF64[tempDoublePtr >> 3] = 1.0, tempBigInt = HEAP32[tempDoublePtr >> 2] | 0, HEAP16[6007] = tempBigInt, HEAP16[6008] = tempBigInt >> 16, tempBigInt = HEAP32[tempDoublePtr + 4 >> 2] | 0, HEAP16[6009] = tempBigInt, HEAP16[6010] = tempBigInt >> 16;
  _memset(12022, 0, 16) | 0;
  HEAPF64[tempDoublePtr >> 3] = $Tmax, tempBigInt = HEAP32[tempDoublePtr >> 2] | 0, HEAP16[6019] = tempBigInt, HEAP16[6020] = tempBigInt >> 16, tempBigInt = HEAP32[tempDoublePtr + 4 >> 2] | 0, HEAP16[6021] = tempBigInt, HEAP16[6022] = tempBigInt >> 16;
  HEAPF64[tempDoublePtr >> 3] = $dT, tempBigInt = HEAP32[tempDoublePtr >> 2] | 0, HEAP16[6023] = tempBigInt, HEAP16[6024] = tempBigInt >> 16, tempBigInt = HEAP32[tempDoublePtr + 4 >> 2] | 0, HEAP16[6025] = tempBigInt, HEAP16[6026] = tempBigInt >> 16;
  HEAP16[6027] = 0;
  HEAP16[6028] = 0;
  HEAP16[6029] = 0;
  HEAP16[6030] = 9;
  HEAP16[6031] = 9;
  HEAP8[12160] = 0;
  HEAP8[12240] = 0;
  HEAP8[12320] = 0;
  HEAP8[12400] = 0;
  _memset(12064, 0, 16) | 0;
  _memcpy(12080, 8712, 36) | 0;
  $97 = HEAP32[$84 >> 2] | 0;
  if (($97 | 0) == 0) {
   $115 = 0;
   $114 = 0;
  } else {
   $101 = $97;
   $100 = 0;
   $99 = 0;
   while (1) {
    if ((HEAP32[$101 + 4 >> 2] | 0) > -1) {
     $106 = $100 + 1 & 65535;
     HEAP16[6028] = $106;
     $110 = $106;
     $109 = $99;
    } else {
     $108 = $99 + 1 & 65535;
     HEAP16[6029] = $108;
     $110 = $100;
     $109 = $108;
    }
    $112 = HEAP32[$101 + 32 >> 2] | 0;
    if (($112 | 0) == 0) {
     $115 = $110;
     $114 = $109;
     break;
    } else {
     $101 = $112;
     $100 = $110;
     $99 = $109;
    }
   }
  }
  $117 = HEAPU16[5992] | 0;
  tempBigInt = $117;
  HEAP16[6032] = tempBigInt;
  HEAP16[6033] = tempBigInt >> 16;
  $120 = (($115 & 65535) * 9 | 0) + $117 | 0;
  tempBigInt = $120;
  HEAP16[6034] = tempBigInt;
  HEAP16[6035] = tempBigInt >> 16;
  tempBigInt = $120 + (($114 & 65535) * 9 | 0) | 0;
  HEAP16[6038] = tempBigInt;
  HEAP16[6039] = tempBigInt >> 16;
  _WriteSTOHeader($head);
  return;
 } else if (($94 | 0) == 2) {
  HEAP8[2528] = 1;
 }
 _WriteTextHeader($head);
 return;
}
function _read_arrbez() {
 var $xpts_i = 0, $ypts_i = 0, $i = 0, $j = 0, $k = 0, $f_v10 = 0, $f_vgap = 0, $f_L = 0, $f_length = 0, $f_Uref = 0, $monitor = 0, $7 = 0.0, $use_linear_0 = 0, $22 = 0, $23 = 0, $25 = 0, $26 = 0, $31 = 0, $32 = 0.0, $33 = 0, $37 = 0, $38 = 0.0, $40 = 0.0, $41 = 0.0, $43 = 0, $54 = 0, $56 = 0, $59 = 0, $61 = 0, $63 = 0, $72 = 0.0, $_ = 0, $74 = 0, $166 = 0, $169 = 0.0, $172 = 0.0, $182 = 0.0, $198 = 0.0, $219 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 392 | 0;
 $xpts_i = sp | 0;
 $ypts_i = sp + 160 | 0;
 $i = sp + 320 | 0;
 $j = sp + 328 | 0;
 $k = sp + 336 | 0;
 $f_v10 = sp + 344 | 0;
 $f_vgap = sp + 352 | 0;
 $f_L = sp + 360 | 0;
 $f_length = sp + 368 | 0;
 $f_Uref = sp + 376 | 0;
 $monitor = sp + 384 | 0;
 _next_double($f_vgap) | 0;
 _next_double($f_v10) | 0;
 _next_double($f_Uref) | 0;
 _next_double($f_L) | 0;
 _next_double($f_length) | 0;
 _next_int($monitor) | 0;
 $7 = +HEAPF64[$f_v10 >> 3];
 if ($7 < 0.0) {
  HEAPF64[$f_v10 >> 3] = -0.0 - $7;
  $use_linear_0 = 1;
 } else {
  $use_linear_0 = 0;
 }
 HEAPF64[$f_L >> 3] = +HEAPF64[$f_length >> 3] * +HEAPF64[$f_L >> 3];
 _read_pairs() | 0;
 _read_poles() | 0;
 _reset_assignments() | 0;
 if ((_next_assignment($i, $j, $k) | 0) != 0) {
  STACKTOP = sp;
  return 0;
 }
 $22 = $xpts_i | 0;
 $23 = $ypts_i | 0;
 do {
  $25 = _malloc(168) | 0;
  $26 = $25;
  if (($25 | 0) == 0) {
   $219 = HEAP32[3164] | 0;
   if (($219 | 0) != 0) {
    _fwrite(10944, 26, 1, $219 | 0) | 0;
   }
   _oe_exit(2);
  } else {
   $31 = $25 + 8 | 0;
   HEAPF64[$31 >> 3] = +HEAPF64[$f_vgap >> 3];
   $32 = +HEAPF64[$f_v10 >> 3];
   $33 = $25;
   HEAPF64[$33 >> 3] = $32;
   $37 = $25 + 16 | 0;
   HEAPF64[$37 >> 3] = +HEAPF64[$f_Uref >> 3] * $32;
   $38 = +HEAPF64[$f_L >> 3];
   $40 = +HEAPF64[323];
   $41 = $38 * 2.0 / $40;
   $43 = $25 + 120 | 0;
   HEAPF64[$43 >> 3] = $41;
   if ($41 > 0.0) {
    HEAPF64[$25 + 96 >> 3] = $40 / $38;
   } else {
    HEAPF64[$25 + 96 >> 3] = 0.0;
   }
   $54 = _find_pole(HEAP32[$i >> 2] | 0) | 0;
   $56 = $25 + 156 | 0;
   HEAP32[$56 >> 2] = $54;
   if (($54 | 0) == 0) {
    _oe_exit(15);
    $59 = HEAP32[$56 >> 2] | 0;
   } else {
    $59 = $54;
   }
   HEAP32[$59 + 8 >> 2] = 1;
   $61 = $59 + 12 | 0;
   $63 = (HEAP32[$61 >> 2] | 0) + 1 | 0;
   HEAP32[$61 >> 2] = $63;
   HEAP32[$25 + 152 >> 2] = $63;
   HEAP32[$25 + 144 >> 2] = HEAP32[$j >> 2];
   HEAP32[$25 + 148 >> 2] = HEAP32[$k >> 2];
   $72 = +HEAPF64[$f_v10 >> 3];
   $_ = $72 > 14.0e4 ? 1312 : 1624;
   $74 = _allocate_bezier(13) | 0;
   HEAPF64[$23 >> 3] = +HEAPF64[$_ >> 3];
   HEAPF64[$22 >> 3] = $72 * +HEAPF64[$_ + 16 >> 3];
   HEAPF64[$ypts_i + 8 >> 3] = +HEAPF64[$_ + 24 >> 3];
   HEAPF64[$xpts_i + 8 >> 3] = $72 * +HEAPF64[$_ + 40 >> 3];
   HEAPF64[$ypts_i + 16 >> 3] = +HEAPF64[$_ + 48 >> 3];
   HEAPF64[$xpts_i + 16 >> 3] = $72 * +HEAPF64[$_ + 64 >> 3];
   HEAPF64[$ypts_i + 24 >> 3] = +HEAPF64[$_ + 72 >> 3];
   HEAPF64[$xpts_i + 24 >> 3] = $72 * +HEAPF64[$_ + 88 >> 3];
   HEAPF64[$ypts_i + 32 >> 3] = +HEAPF64[$_ + 96 >> 3];
   HEAPF64[$xpts_i + 32 >> 3] = $72 * +HEAPF64[$_ + 112 >> 3];
   HEAPF64[$ypts_i + 40 >> 3] = +HEAPF64[$_ + 120 >> 3];
   HEAPF64[$xpts_i + 40 >> 3] = $72 * +HEAPF64[$_ + 136 >> 3];
   HEAPF64[$ypts_i + 48 >> 3] = +HEAPF64[$_ + 144 >> 3];
   HEAPF64[$xpts_i + 48 >> 3] = $72 * +HEAPF64[$_ + 160 >> 3];
   HEAPF64[$ypts_i + 56 >> 3] = +HEAPF64[$_ + 168 >> 3];
   HEAPF64[$xpts_i + 56 >> 3] = $72 * +HEAPF64[$_ + 184 >> 3];
   HEAPF64[$ypts_i + 64 >> 3] = +HEAPF64[$_ + 192 >> 3];
   HEAPF64[$xpts_i + 64 >> 3] = $72 * +HEAPF64[$_ + 208 >> 3];
   HEAPF64[$ypts_i + 72 >> 3] = +HEAPF64[$_ + 216 >> 3];
   HEAPF64[$xpts_i + 72 >> 3] = $72 * +HEAPF64[$_ + 232 >> 3];
   HEAPF64[$ypts_i + 80 >> 3] = +HEAPF64[$_ + 240 >> 3];
   HEAPF64[$xpts_i + 80 >> 3] = $72 * +HEAPF64[$_ + 256 >> 3];
   HEAPF64[$ypts_i + 88 >> 3] = +HEAPF64[$_ + 264 >> 3];
   HEAPF64[$xpts_i + 88 >> 3] = $72 * +HEAPF64[$_ + 280 >> 3];
   HEAPF64[$ypts_i + 96 >> 3] = +HEAPF64[$_ + 288 >> 3];
   HEAPF64[$xpts_i + 96 >> 3] = $72 * +HEAPF64[$_ + 304 >> 3];
   _fill_bezier($74, $22, $23, $use_linear_0);
   HEAP32[$25 + 24 >> 2] = $74;
   $166 = $25 + 128 | 0;
   HEAPF64[$25 + 112 >> 3] = 0.0;
   _memset($25 + 32 | 0, 0, 40) | 0;
   _memset($166 | 0, 0, 16) | 0;
   $169 = +HEAPF64[$31 >> 3];
   if ($169 > 0.0) {
    $172 = $169 / .001;
    HEAPF64[$25 + 72 >> 3] = $172;
    $182 = $172;
   } else {
    HEAPF64[$25 + 72 >> 3] = 0.0;
    HEAPF64[$25 + 56 >> 3] = +HEAPF64[323];
    $182 = 0.0;
   }
   if (+HEAPF64[$37 >> 3] > 0.0) {
    HEAPF64[$25 + 80 >> 3] = 34.0 / (+HEAPF64[$33 >> 3] / 1.0e3);
    HEAPF64[$25 + 88 >> 3] = 1.0e-7;
    $198 = 1.0e-7;
   } else {
    HEAPF64[$25 + 80 >> 3] = 0.0;
    HEAPF64[$25 + 88 >> 3] = 1.0e6;
    $198 = 1.0e6;
   }
   HEAPF64[$25 + 104 >> 3] = $182 + +HEAPF64[$43 >> 3] + 1.0 / $198;
   HEAP32[$25 + 160 >> 2] = 0;
   HEAP32[(HEAP32[3218] | 0) + 160 >> 2] = $26;
   HEAP32[3218] = $26;
   if ((HEAP32[$monitor >> 2] | 0) != 0) {
    _add_ammeter(HEAP32[$i >> 2] | 0, HEAP32[$j >> 2] | 0, -1, $166) | 0;
   }
  }
 } while ((_next_assignment($i, $j, $k) | 0) == 0);
 STACKTOP = sp;
 return 0;
}
function _read_arrester() {
 var $i = 0, $j = 0, $k = 0, $f_knee = 0, $f_gap = 0, $f_r = 0, $f_L = 0, $f_length = 0, $6 = 0.0, $9 = 0.0, $11 = 0.0, $monitor_0 = 0, $15 = 0.0, $18 = 0.0, $20 = 0.0, $21 = 0.0, $24 = 0.0, $26 = 0.0, $30 = 0.0, $31 = 0.0, $32 = 0.0, $39 = 0, $40 = 0, $48 = 0.0, $54 = 0, $58 = 0.0, $62 = 0.0, $72 = 0, $74 = 0, $78 = 0.0, $79 = 0, $100 = 0, $107 = 0, $108 = 0, $116 = 0.0, $122 = 0, $126 = 0.0, $130 = 0.0, $140 = 0, $142 = 0, $146 = 0, $148 = 0, $160 = 0, $172 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64 | 0;
 $i = sp | 0;
 $j = sp + 8 | 0;
 $k = sp + 16 | 0;
 $f_knee = sp + 24 | 0;
 $f_gap = sp + 32 | 0;
 $f_r = sp + 40 | 0;
 $f_L = sp + 48 | 0;
 $f_length = sp + 56 | 0;
 _next_double($f_gap) | 0;
 _next_double($f_knee) | 0;
 _next_double($f_r) | 0;
 _next_double($f_L) | 0;
 _next_double($f_length) | 0;
 $6 = +HEAPF64[$f_gap >> 3];
 if ($6 < 0.0) {
  $9 = $6 * -1.0;
  HEAPF64[$f_gap >> 3] = $9;
  $monitor_0 = 1;
  $11 = $9;
 } else {
  $monitor_0 = 0;
  $11 = $6;
 }
 HEAPF64[$f_L >> 3] = +HEAPF64[$f_length >> 3] * +HEAPF64[$f_L >> 3];
 $15 = +HEAPF64[$f_knee >> 3];
 if ($15 < 0.0) {
  $18 = $15 * -1.0;
  HEAPF64[$f_knee >> 3] = $18;
  $20 = $18;
 } else {
  $20 = $15;
 }
 $21 = +HEAPF64[$f_r >> 3];
 if ($21 < 0.0) {
  $24 = $21 * -1.0;
  HEAPF64[$f_r >> 3] = $24;
  $26 = $24;
 } else {
  $26 = $21;
 }
 if ($11 < $20) {
  HEAPF64[$f_gap >> 3] = $20;
  $30 = $20;
 } else {
  $30 = $11;
 }
 $31 = $20 / $26;
 $32 = $30 / $26;
 _read_pairs() | 0;
 _read_poles() | 0;
 _reset_assignments() | 0;
 if ((_next_assignment($i, $j, $k) | 0) != 0) {
  STACKTOP = sp;
  return 0;
 }
 if (($monitor_0 | 0) == 0) {
  do {
   $39 = _malloc(176) | 0;
   $40 = $39;
   if (($39 | 0) == 0) {
    $100 = HEAP32[3164] | 0;
    if (($100 | 0) != 0) {
     _fwrite(3664, 28, 1, $100 | 0) | 0;
    }
    _oe_exit(2);
   } else {
    HEAPF64[$39 >> 3] = +HEAPF64[$f_knee >> 3];
    HEAPF64[$39 + 32 >> 3] = +HEAPF64[$f_gap >> 3];
    $48 = +HEAPF64[$f_r >> 3];
    HEAPF64[$39 + 40 >> 3] = $48;
    HEAPF64[$39 + 16 >> 3] = $31;
    $54 = $39 + 24 | 0;
    HEAPF64[$54 >> 3] = $32;
    $58 = +HEAPF64[$f_L >> 3] * 2.0 / +HEAPF64[323];
    HEAPF64[$39 + 128 >> 3] = $58;
    $62 = 1.0 / ($58 + $48);
    HEAPF64[$39 + 88 >> 3] = $62;
    HEAPF64[$39 + 120 >> 3] = $62 * $48;
    HEAPF64[$39 + 136 >> 3] = $62 * $58;
    $72 = _find_pole(HEAP32[$i >> 2] | 0) | 0;
    $74 = $39 + 164 | 0;
    HEAP32[$74 >> 2] = $72;
    if (($72 | 0) == 0) {
     _oe_exit(15);
     $79 = HEAP32[$74 >> 2] | 0;
     $78 = +HEAPF64[$54 >> 3];
    } else {
     $79 = $72;
     $78 = $32;
    }
    HEAP32[$79 + 8 >> 2] = 1;
    HEAP32[$39 + 156 >> 2] = HEAP32[$j >> 2];
    HEAP32[$39 + 160 >> 2] = HEAP32[$k >> 2];
    HEAPF64[$39 + 8 >> 3] = $78;
    HEAPF64[$39 + 144 >> 3] = 0.0;
    HEAP32[$39 + 152 >> 2] = 0;
    _memset($39 + 48 | 0, 0, 40) | 0;
    _memset($39 + 96 | 0, 0, 24) | 0;
    HEAP32[$39 + 168 >> 2] = 0;
    HEAP32[(HEAP32[3214] | 0) + 168 >> 2] = $40;
    HEAP32[3214] = $40;
   }
  } while ((_next_assignment($i, $j, $k) | 0) == 0);
  STACKTOP = sp;
  return 0;
 } else {
  do {
   $107 = _malloc(176) | 0;
   $108 = $107;
   if (($107 | 0) == 0) {
    $172 = HEAP32[3164] | 0;
    if (($172 | 0) != 0) {
     _fwrite(3664, 28, 1, $172 | 0) | 0;
    }
    _oe_exit(2);
   } else {
    HEAPF64[$107 >> 3] = +HEAPF64[$f_knee >> 3];
    HEAPF64[$107 + 32 >> 3] = +HEAPF64[$f_gap >> 3];
    $116 = +HEAPF64[$f_r >> 3];
    HEAPF64[$107 + 40 >> 3] = $116;
    HEAPF64[$107 + 16 >> 3] = $31;
    $122 = $107 + 24 | 0;
    HEAPF64[$122 >> 3] = $32;
    $126 = +HEAPF64[$f_L >> 3] * 2.0 / +HEAPF64[323];
    HEAPF64[$107 + 128 >> 3] = $126;
    $130 = 1.0 / ($126 + $116);
    HEAPF64[$107 + 88 >> 3] = $130;
    HEAPF64[$107 + 120 >> 3] = $130 * $116;
    HEAPF64[$107 + 136 >> 3] = $130 * $126;
    $140 = _find_pole(HEAP32[$i >> 2] | 0) | 0;
    $142 = $107 + 164 | 0;
    HEAP32[$142 >> 2] = $140;
    if (($140 | 0) == 0) {
     _oe_exit(15);
     $146 = HEAP32[$142 >> 2] | 0;
    } else {
     $146 = $140;
    }
    HEAP32[$146 + 8 >> 2] = 1;
    $148 = HEAP32[$j >> 2] | 0;
    HEAP32[$107 + 156 >> 2] = $148;
    HEAP32[$107 + 160 >> 2] = HEAP32[$k >> 2];
    HEAPF64[$107 + 8 >> 3] = +HEAPF64[$122 >> 3];
    $160 = $107 + 144 | 0;
    HEAPF64[$160 >> 3] = 0.0;
    HEAP32[$107 + 152 >> 2] = 0;
    _memset($107 + 48 | 0, 0, 40) | 0;
    _memset($107 + 96 | 0, 0, 24) | 0;
    HEAP32[$107 + 168 >> 2] = 0;
    HEAP32[(HEAP32[3214] | 0) + 168 >> 2] = $108;
    HEAP32[3214] = $108;
    _add_ammeter(HEAP32[$i >> 2] | 0, $148, -1, $160) | 0;
   }
  } while ((_next_assignment($i, $j, $k) | 0) == 0);
  STACKTOP = sp;
  return 0;
 }
 return 0;
}
function _cblas_dsyr2($order, $Uplo, $N, $alpha, $X, $incX, $Y, $incY, $A, $lda) {
 $order = $order | 0;
 $Uplo = $Uplo | 0;
 $N = $N | 0;
 $alpha = +$alpha;
 $X = $X | 0;
 $incX = $incX | 0;
 $Y = $Y | 0;
 $incY = $incY | 0;
 $A = $A | 0;
 $lda = $lda | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0.0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $10 = 0, $i = 0, $j = 0, $pos = 0, $ix = 0, $iy = 0, $tmp1 = 0.0, $tmp2 = 0.0, $jx = 0, $jy = 0, $ix1 = 0, $iy2 = 0, $tmp13 = 0.0, $tmp24 = 0.0, $jx5 = 0, $jy6 = 0, $45 = 0, $85 = 0, $96 = 0, $141 = 0, $187 = 0, $198 = 0, $226 = 0, $237 = 0, $262 = 0, label = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 $1 = $order;
 $2 = $Uplo;
 $3 = $N;
 $4 = $alpha;
 $5 = $X;
 $6 = $incX;
 $7 = $Y;
 $8 = $incY;
 $9 = $A;
 $10 = $lda;
 $pos = 0;
 if (($1 | 0) != 101) {
  if (($1 | 0) != 102) {
   $pos = 1;
  }
 }
 if (($2 | 0) != 121) {
  if (($2 | 0) != 122) {
   $pos = 2;
  }
 }
 if (($3 | 0) < 0) {
  $pos = 3;
 }
 if (($6 | 0) == 0) {
  $pos = 6;
 }
 if (($8 | 0) == 0) {
  $pos = 8;
 }
 if (1 > ($3 | 0)) {
  $45 = 1;
 } else {
  $45 = $3;
 }
 if (($10 | 0) < ($45 | 0)) {
  $pos = 10;
 }
 if (($pos | 0) != 0) {
  _cblas_xerbla($pos, 7704, 12896, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 1 | 0, STACKTOP = STACKTOP + 7 & -8, HEAP32[tempVarArgs >> 2] = 0, tempVarArgs) | 0);
  STACKTOP = tempVarArgs;
 }
 if (($3 | 0) == 0) {
  STACKTOP = sp;
  return;
 }
 if ($4 == 0.0) {
  STACKTOP = sp;
  return;
 }
 if (($1 | 0) == 101) {
  if (($2 | 0) != 121) {
   label = 28;
  }
 } else {
  label = 28;
 }
 do {
  if ((label | 0) == 28) {
   if (($1 | 0) == 102) {
    if (($2 | 0) == 122) {
     break;
    }
   }
   if (($1 | 0) == 101) {
    if (($2 | 0) == 122) {
     label = 49;
    } else {
     label = 47;
    }
   } else {
    label = 47;
   }
   do {
    if ((label | 0) == 47) {
     if (($1 | 0) == 102) {
      if (($2 | 0) == 121) {
       label = 49;
       break;
      }
     }
     _cblas_xerbla(0, 7704, 7720, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 1 | 0, STACKTOP = STACKTOP + 7 & -8, HEAP32[tempVarArgs >> 2] = 0, tempVarArgs) | 0);
     STACKTOP = tempVarArgs;
    }
   } while (0);
   if ((label | 0) == 49) {
    if (($6 | 0) > 0) {
     $187 = 0;
    } else {
     $187 = Math_imul($3 - 1 | 0, -$6 | 0) | 0;
    }
    $ix1 = $187;
    if (($8 | 0) > 0) {
     $198 = 0;
    } else {
     $198 = Math_imul($3 - 1 | 0, -$8 | 0) | 0;
    }
    $iy2 = $198;
    $i = 0;
    while (1) {
     if (($i | 0) >= ($3 | 0)) {
      break;
     }
     $tmp13 = $4 * +HEAPF64[$5 + ($ix1 << 3) >> 3];
     $tmp24 = $4 * +HEAPF64[$7 + ($iy2 << 3) >> 3];
     if (($6 | 0) > 0) {
      $226 = 0;
     } else {
      $226 = Math_imul($3 - 1 | 0, -$6 | 0) | 0;
     }
     $jx5 = $226;
     if (($8 | 0) > 0) {
      $237 = 0;
     } else {
      $237 = Math_imul($3 - 1 | 0, -$8 | 0) | 0;
     }
     $jy6 = $237;
     $j = 0;
     while (1) {
      if (($j | 0) > ($i | 0)) {
       break;
      }
      $262 = $9 + ((Math_imul($10, $i) | 0) + $j << 3) | 0;
      HEAPF64[$262 >> 3] = +HEAPF64[$262 >> 3] + ($tmp13 * +HEAPF64[$7 + ($jy6 << 3) >> 3] + $tmp24 * +HEAPF64[$5 + ($jx5 << 3) >> 3]);
      $jx5 = $jx5 + $6 | 0;
      $jy6 = $jy6 + $8 | 0;
      $j = $j + 1 | 0;
     }
     $ix1 = $ix1 + $6 | 0;
     $iy2 = $iy2 + $8 | 0;
     $i = $i + 1 | 0;
    }
   }
   STACKTOP = sp;
   return;
  }
 } while (0);
 if (($6 | 0) > 0) {
  $85 = 0;
 } else {
  $85 = Math_imul($3 - 1 | 0, -$6 | 0) | 0;
 }
 $ix = $85;
 if (($8 | 0) > 0) {
  $96 = 0;
 } else {
  $96 = Math_imul($3 - 1 | 0, -$8 | 0) | 0;
 }
 $iy = $96;
 $i = 0;
 while (1) {
  if (($i | 0) >= ($3 | 0)) {
   break;
  }
  $tmp1 = $4 * +HEAPF64[$5 + ($ix << 3) >> 3];
  $tmp2 = $4 * +HEAPF64[$7 + ($iy << 3) >> 3];
  $jx = $ix;
  $jy = $iy;
  $j = $i;
  while (1) {
   if (($j | 0) >= ($3 | 0)) {
    break;
   }
   $141 = $9 + ((Math_imul($10, $i) | 0) + $j << 3) | 0;
   HEAPF64[$141 >> 3] = +HEAPF64[$141 >> 3] + ($tmp1 * +HEAPF64[$7 + ($jy << 3) >> 3] + $tmp2 * +HEAPF64[$5 + ($jx << 3) >> 3]);
   $jx = $jx + $6 | 0;
   $jy = $jy + $8 | 0;
   $j = $j + 1 | 0;
  }
  $ix = $ix + $6 | 0;
  $iy = $iy + $8 | 0;
  $i = $i + 1 | 0;
 }
 STACKTOP = sp;
 return;
}
function _gsl_matrix_submatrix($agg_result, $m, $i, $j, $n1, $n2) {
 $agg_result = $agg_result | 0;
 $m = $m | 0;
 $i = $i | 0;
 $j = $j | 0;
 $n1 = $n1 | 0;
 $n2 = $n2 | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $view = 0, $s = 0, $14 = 0, $15 = 0, $25 = 0, $26 = 0, $33 = 0, $34 = 0, $41 = 0, $42 = 0, $54 = 0, $55 = 0, $67 = 0, $68 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48 | 0;
 $view = sp | 0;
 $s = sp + 24 | 0;
 $1 = $m;
 $2 = $i;
 $3 = $j;
 $4 = $n1;
 $5 = $n2;
 _memset($view | 0, 0, 24) | 0;
 if ($2 >>> 0 >= (HEAP32[$1 >> 2] | 0) >>> 0) {
  _gsl_error(11160, 11016, 29, 4);
  $14 = $agg_result;
  $15 = $view;
  HEAP32[$14 >> 2] = HEAP32[$15 >> 2];
  HEAP32[$14 + 4 >> 2] = HEAP32[$15 + 4 >> 2];
  HEAP32[$14 + 8 >> 2] = HEAP32[$15 + 8 >> 2];
  HEAP32[$14 + 12 >> 2] = HEAP32[$15 + 12 >> 2];
  HEAP32[$14 + 16 >> 2] = HEAP32[$15 + 16 >> 2];
  HEAP32[$14 + 20 >> 2] = HEAP32[$15 + 20 >> 2];
  STACKTOP = sp;
  return;
 }
 if ($3 >>> 0 >= (HEAP32[$1 + 4 >> 2] | 0) >>> 0) {
  _gsl_error(8360, 11016, 33, 4);
  $25 = $agg_result;
  $26 = $view;
  HEAP32[$25 >> 2] = HEAP32[$26 >> 2];
  HEAP32[$25 + 4 >> 2] = HEAP32[$26 + 4 >> 2];
  HEAP32[$25 + 8 >> 2] = HEAP32[$26 + 8 >> 2];
  HEAP32[$25 + 12 >> 2] = HEAP32[$26 + 12 >> 2];
  HEAP32[$25 + 16 >> 2] = HEAP32[$26 + 16 >> 2];
  HEAP32[$25 + 20 >> 2] = HEAP32[$26 + 20 >> 2];
  STACKTOP = sp;
  return;
 }
 if (($4 | 0) == 0) {
  _gsl_error(6744, 11016, 37, 4);
  $33 = $agg_result;
  $34 = $view;
  HEAP32[$33 >> 2] = HEAP32[$34 >> 2];
  HEAP32[$33 + 4 >> 2] = HEAP32[$34 + 4 >> 2];
  HEAP32[$33 + 8 >> 2] = HEAP32[$34 + 8 >> 2];
  HEAP32[$33 + 12 >> 2] = HEAP32[$34 + 12 >> 2];
  HEAP32[$33 + 16 >> 2] = HEAP32[$34 + 16 >> 2];
  HEAP32[$33 + 20 >> 2] = HEAP32[$34 + 20 >> 2];
  STACKTOP = sp;
  return;
 }
 if (($5 | 0) == 0) {
  _gsl_error(5448, 11016, 41, 4);
  $41 = $agg_result;
  $42 = $view;
  HEAP32[$41 >> 2] = HEAP32[$42 >> 2];
  HEAP32[$41 + 4 >> 2] = HEAP32[$42 + 4 >> 2];
  HEAP32[$41 + 8 >> 2] = HEAP32[$42 + 8 >> 2];
  HEAP32[$41 + 12 >> 2] = HEAP32[$42 + 12 >> 2];
  HEAP32[$41 + 16 >> 2] = HEAP32[$42 + 16 >> 2];
  HEAP32[$41 + 20 >> 2] = HEAP32[$42 + 20 >> 2];
  STACKTOP = sp;
  return;
 }
 if (($2 + $4 | 0) >>> 0 > (HEAP32[$1 >> 2] | 0) >>> 0) {
  _gsl_error(4552, 11016, 45, 4);
  $54 = $agg_result;
  $55 = $view;
  HEAP32[$54 >> 2] = HEAP32[$55 >> 2];
  HEAP32[$54 + 4 >> 2] = HEAP32[$55 + 4 >> 2];
  HEAP32[$54 + 8 >> 2] = HEAP32[$55 + 8 >> 2];
  HEAP32[$54 + 12 >> 2] = HEAP32[$55 + 12 >> 2];
  HEAP32[$54 + 16 >> 2] = HEAP32[$55 + 16 >> 2];
  HEAP32[$54 + 20 >> 2] = HEAP32[$55 + 20 >> 2];
  STACKTOP = sp;
  return;
 }
 if (($3 + $5 | 0) >>> 0 > (HEAP32[$1 + 4 >> 2] | 0) >>> 0) {
  _gsl_error(4080, 11016, 49, 4);
  $67 = $agg_result;
  $68 = $view;
  HEAP32[$67 >> 2] = HEAP32[$68 >> 2];
  HEAP32[$67 + 4 >> 2] = HEAP32[$68 + 4 >> 2];
  HEAP32[$67 + 8 >> 2] = HEAP32[$68 + 8 >> 2];
  HEAP32[$67 + 12 >> 2] = HEAP32[$68 + 12 >> 2];
  HEAP32[$67 + 16 >> 2] = HEAP32[$68 + 16 >> 2];
  HEAP32[$67 + 20 >> 2] = HEAP32[$68 + 20 >> 2];
  STACKTOP = sp;
  return;
 }
 _memset($s | 0, 0, 24) | 0;
 HEAP32[$s + 12 >> 2] = (HEAP32[$1 + 12 >> 2] | 0) + ((Math_imul($2, HEAP32[$1 + 8 >> 2] | 0) | 0) + $3 << 3);
 HEAP32[$s >> 2] = $4;
 HEAP32[$s + 4 >> 2] = $5;
 HEAP32[$s + 8 >> 2] = HEAP32[$1 + 8 >> 2];
 HEAP32[$s + 16 >> 2] = HEAP32[$1 + 16 >> 2];
 HEAP32[$s + 20 >> 2] = 0;
 $104 = $view | 0;
 $105 = $s;
 HEAP32[$104 >> 2] = HEAP32[$105 >> 2];
 HEAP32[$104 + 4 >> 2] = HEAP32[$105 + 4 >> 2];
 HEAP32[$104 + 8 >> 2] = HEAP32[$105 + 8 >> 2];
 HEAP32[$104 + 12 >> 2] = HEAP32[$105 + 12 >> 2];
 HEAP32[$104 + 16 >> 2] = HEAP32[$105 + 16 >> 2];
 HEAP32[$104 + 20 >> 2] = HEAP32[$105 + 20 >> 2];
 $106 = $agg_result;
 $107 = $view;
 HEAP32[$106 >> 2] = HEAP32[$107 >> 2];
 HEAP32[$106 + 4 >> 2] = HEAP32[$107 + 4 >> 2];
 HEAP32[$106 + 8 >> 2] = HEAP32[$107 + 8 >> 2];
 HEAP32[$106 + 12 >> 2] = HEAP32[$107 + 12 >> 2];
 HEAP32[$106 + 16 >> 2] = HEAP32[$107 + 16 >> 2];
 HEAP32[$106 + 20 >> 2] = HEAP32[$107 + 20 >> 2];
 STACKTOP = sp;
 return;
}
function _WriteSTOHeader($head) {
 $head = $head | 0;
 var $buf = 0, $4 = 0, $6 = 0, $7 = 0, $9 = 0, $count_021 = 0, $20 = 0, $22 = 0, $26 = 0, $31 = 0, $pc_01_i = 0, $42 = 0, $53 = 0, $65 = 0, $87 = 0, $92 = 0, $101 = 0, $pc_01_i18 = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24 | 0;
 $buf = sp | 0;
 _fwrite(11984, 496, 1, HEAP32[3206] | 0) | 0;
 $4 = HEAP32[$head + 32 >> 2] | 0;
 if (($4 | 0) == 0) {
  STACKTOP = sp;
  return;
 }
 $6 = $buf | 0;
 $7 = $buf + 8 | 0;
 $count_021 = 0;
 $9 = $4;
 while (1) {
  _memset($6 | 0, 32, 18) | 0;
  if (($count_021 & 65535) >>> 0 < (HEAPU16[6028] | 0) >>> 0) {
   $20 = HEAP32[2990] | 0;
   $22 = HEAP32[$20 + (HEAP32[$9 >> 2] << 2) >> 2] | 0;
   $26 = HEAP32[$20 + (HEAP32[$9 + 4 >> 2] << 2) >> 2] | 0;
   _sprintf($6 | 0, 7064, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 24 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[(HEAP32[2980] | 0) + (HEAP32[$9 + 8 >> 2] << 2) >> 2], HEAP32[tempVarArgs + 8 >> 2] = $22, HEAP32[tempVarArgs + 16 >> 2] = $26, tempVarArgs) | 0) | 0;
   STACKTOP = tempVarArgs;
   L8 : do {
    if ((_strlen($6 | 0) | 0) >>> 0 > 8 >>> 0) {
     $31 = _strchr($6, 95) | 0;
     if (($31 | 0) != 0) {
      $pc_01_i = $31;
      do {
       if ((HEAP8[$pc_01_i] | 0) == 0) {
        break L8;
       }
       HEAP8[$pc_01_i] = 32;
       $pc_01_i = $pc_01_i + 1 | 0;
      } while (($pc_01_i | 0) != 0);
     }
    }
   } while (0);
   HEAP8[$7] = 0;
   _fwrite($6 | 0, 9, 1, HEAP32[3206] | 0) | 0;
  } else {
   $42 = HEAP32[$9 + 4 >> 2] | 0;
   do {
    if (($42 | 0) == (-1 | 0)) {
     $53 = HEAP32[(HEAP32[2990] | 0) + (HEAP32[$9 >> 2] << 2) >> 2] | 0;
     _sprintf($6 | 0, 5752, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[(HEAP32[2980] | 0) + (HEAP32[$9 + 8 >> 2] << 2) >> 2], HEAP32[tempVarArgs + 8 >> 2] = $53, tempVarArgs) | 0) | 0;
     STACKTOP = tempVarArgs;
    } else if (($42 | 0) == (-2 | 0)) {
     $65 = HEAP32[(HEAP32[2990] | 0) + (HEAP32[$9 >> 2] << 2) >> 2] | 0;
     _sprintf($6 | 0, 4792, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[(HEAP32[2980] | 0) + (HEAP32[$9 + 8 >> 2] << 2) >> 2], HEAP32[tempVarArgs + 8 >> 2] = $65, tempVarArgs) | 0) | 0;
     STACKTOP = tempVarArgs;
    } else if (($42 | 0) == (-3 | 0)) {
     _sprintf($6 | 0, 4216, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[(HEAP32[2980] | 0) + (HEAP32[$9 + 8 >> 2] << 2) >> 2], tempVarArgs) | 0) | 0;
     STACKTOP = tempVarArgs;
    } else if (($42 | 0) == (-4 | 0)) {
     _sprintf($6 | 0, 3888, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[(HEAP32[2980] | 0) + (HEAP32[$9 + 8 >> 2] << 2) >> 2], tempVarArgs) | 0) | 0;
     STACKTOP = tempVarArgs;
    } else {
     $87 = HEAP32[(HEAP32[2980] | 0) + (HEAP32[$9 + 8 >> 2] << 2) >> 2] | 0;
     $92 = HEAP32[(HEAP32[2990] | 0) + (HEAP32[$9 >> 2] << 2) >> 2] | 0;
     if (($42 | 0) == -5) {
      _sprintf($6 | 0, 3448, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempVarArgs >> 2] = $87, HEAP32[tempVarArgs + 8 >> 2] = $92, tempVarArgs) | 0) | 0;
      STACKTOP = tempVarArgs;
      break;
     } else {
      _sprintf($6 | 0, 3192, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempVarArgs >> 2] = $87, HEAP32[tempVarArgs + 8 >> 2] = $92, tempVarArgs) | 0) | 0;
      STACKTOP = tempVarArgs;
      break;
     }
    }
   } while (0);
   L25 : do {
    if ((_strlen($6 | 0) | 0) >>> 0 > 8 >>> 0) {
     $101 = _strchr($6, 95) | 0;
     if (($101 | 0) != 0) {
      $pc_01_i18 = $101;
      do {
       if ((HEAP8[$pc_01_i18] | 0) == 0) {
        break L25;
       }
       HEAP8[$pc_01_i18] = 32;
       $pc_01_i18 = $pc_01_i18 + 1 | 0;
      } while (($pc_01_i18 | 0) != 0);
     }
    }
   } while (0);
   HEAP8[$7] = 0;
   _fwrite($6 | 0, 9, 1, HEAP32[3206] | 0) | 0;
  }
  $9 = HEAP32[$9 + 32 >> 2] | 0;
  if (($9 | 0) == 0) {
   break;
  } else {
   $count_021 = $count_021 + 1 & 65535;
  }
 }
 STACKTOP = sp;
 return;
}
function _find_monitor_links($ptr) {
 $ptr = $ptr | 0;
 var $2 = 0, $4 = 0, $6 = 0, $9 = 0, $11 = 0, $19 = 0, $28 = 0, $_0_i = 0, $37 = 0, $39 = 0, $47 = 0, $56 = 0, $_0_i17 = 0, $63 = 0, $64 = 0, $69 = 0, $71 = 0, $72 = 0, $_pre_i = 0, $77 = 0, $79 = 0, $85 = 0, $92 = 0, $99 = 0, $106 = 0, $_0_i14 = 0, $110 = 0, label = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 $2 = HEAP32[$ptr + 8 >> 2] | 0;
 $4 = HEAP32[$ptr >> 2] | 0;
 $6 = HEAP32[$ptr + 4 >> 2] | 0;
 $9 = HEAP32[(HEAP32[3162] | 0) + 100 >> 2] | 0;
 L1 : do {
  if (($9 | 0) == 0) {
   $_0_i = 0;
  } else {
   $11 = $9;
   while (1) {
    if ((HEAP32[HEAP32[$11 + 96 >> 2] >> 2] | 0) == ($2 | 0)) {
     $19 = HEAP32[$11 + 88 >> 2] | 0;
     if (($19 | 0) == ($4 | 0)) {
      if ((HEAP32[$11 + 92 >> 2] | 0) == ($6 | 0)) {
       $_0_i = $11;
       break L1;
      }
     }
     if (($19 | 0) == ($6 | 0)) {
      if ((HEAP32[$11 + 92 >> 2] | 0) == ($4 | 0)) {
       $_0_i = $11;
       break L1;
      }
     }
    }
    $28 = HEAP32[$11 + 100 >> 2] | 0;
    if (($28 | 0) == 0) {
     $_0_i = 0;
     break;
    } else {
     $11 = $28;
    }
   }
  }
 } while (0);
 HEAP32[$ptr + 48 >> 2] = $_0_i;
 $37 = HEAP32[(HEAP32[3174] | 0) + 80 >> 2] | 0;
 L12 : do {
  if (($37 | 0) == 0) {
   $_0_i17 = 0;
  } else {
   $39 = $37;
   while (1) {
    if ((HEAP32[HEAP32[$39 + 76 >> 2] >> 2] | 0) == ($2 | 0)) {
     $47 = HEAP32[$39 + 68 >> 2] | 0;
     if (($47 | 0) == ($4 | 0)) {
      if ((HEAP32[$39 + 72 >> 2] | 0) == ($6 | 0)) {
       $_0_i17 = $39;
       break L12;
      }
     }
     if (($47 | 0) == ($6 | 0)) {
      if ((HEAP32[$39 + 72 >> 2] | 0) == ($4 | 0)) {
       $_0_i17 = $39;
       break L12;
      }
     }
    }
    $56 = HEAP32[$39 + 80 >> 2] | 0;
    if (($56 | 0) == 0) {
     $_0_i17 = 0;
     break;
    } else {
     $39 = $56;
    }
   }
  }
 } while (0);
 HEAP32[$ptr + 44 >> 2] = $_0_i17;
 $63 = HEAP32[3158] | 0;
 $64 = HEAP32[3164] | 0;
 if (($64 | 0) != 0) {
  _fprintf($64 | 0, 6072, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 24 | 0, HEAP32[tempVarArgs >> 2] = $2, HEAP32[tempVarArgs + 8 >> 2] = $4, HEAP32[tempVarArgs + 16 >> 2] = $6, tempVarArgs) | 0) | 0;
  STACKTOP = tempVarArgs;
 }
 $69 = HEAP32[$63 + 32 >> 2] | 0;
 if (($69 | 0) == 0) {
  $_0_i14 = 0;
  $110 = $ptr + 40 | 0;
  HEAP32[$110 >> 2] = $_0_i14;
  STACKTOP = sp;
  return;
 } else {
  $71 = $69;
 }
 while (1) {
  $72 = HEAP32[3164] | 0;
  $_pre_i = $71 + 8 | 0;
  if (($72 | 0) != 0) {
   $77 = HEAP32[$71 >> 2] | 0;
   $79 = HEAP32[$71 + 4 >> 2] | 0;
   _fprintf($72 | 0, 5008, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 24 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[$_pre_i >> 2], HEAP32[tempVarArgs + 8 >> 2] = $77, HEAP32[tempVarArgs + 16 >> 2] = $79, tempVarArgs) | 0) | 0;
   STACKTOP = tempVarArgs;
  }
  if ((HEAP32[$_pre_i >> 2] | 0) == ($2 | 0)) {
   $85 = HEAP32[$71 >> 2] | 0;
   if (($85 | 0) == ($4 | 0)) {
    if ((HEAP32[$71 + 4 >> 2] | 0) == ($6 | 0)) {
     label = 23;
     break;
    }
   }
   if (($85 | 0) == ($6 | 0)) {
    if ((HEAP32[$71 + 4 >> 2] | 0) == ($4 | 0)) {
     label = 28;
     break;
    }
   }
  }
  $99 = HEAP32[$71 + 32 >> 2] | 0;
  if (($99 | 0) == 0) {
   $_0_i14 = 0;
   label = 30;
   break;
  } else {
   $71 = $99;
  }
 }
 if ((label | 0) == 23) {
  $92 = HEAP32[3164] | 0;
  if (($92 | 0) == 0) {
   $_0_i14 = $71;
   $110 = $ptr + 40 | 0;
   HEAP32[$110 >> 2] = $_0_i14;
   STACKTOP = sp;
   return;
  }
  _fwrite(4328, 11, 1, $92 | 0) | 0;
  $_0_i14 = $71;
  $110 = $ptr + 40 | 0;
  HEAP32[$110 >> 2] = $_0_i14;
  STACKTOP = sp;
  return;
 } else if ((label | 0) == 28) {
  $106 = HEAP32[3164] | 0;
  if (($106 | 0) == 0) {
   $_0_i14 = $71;
   $110 = $ptr + 40 | 0;
   HEAP32[$110 >> 2] = $_0_i14;
   STACKTOP = sp;
   return;
  }
  _fwrite(4328, 11, 1, $106 | 0) | 0;
  $_0_i14 = $71;
  $110 = $ptr + 40 | 0;
  HEAP32[$110 >> 2] = $_0_i14;
  STACKTOP = sp;
  return;
 } else if ((label | 0) == 30) {
  $110 = $ptr + 40 | 0;
  HEAP32[$110 >> 2] = $_0_i14;
  STACKTOP = sp;
  return;
 }
}
function _gsl_eigen_symmv($A, $eval, $evec, $w) {
 $A = $A | 0;
 $eval = $eval | 0;
 $evec = $evec | 0;
 $w = $w | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $d = 0, $sd = 0, $N = 0, $a = 0, $b = 0, $d_vec = 0, $sd_vec = 0, $tau = 0, $i = 0, $n_block = 0, $gc = 0, $gs = 0, $c = 0.0, $s = 0.0, $k = 0, $qki = 0.0, $qkj = 0.0, $d_vec1 = 0, $115$0 = 0, $116$1 = 0, $$etemp$1$1 = 0, $245 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 96 | 0;
 $d_vec = sp | 0;
 $sd_vec = sp + 24 | 0;
 $tau = sp + 48 | 0;
 $d_vec1 = sp + 72 | 0;
 $2 = $A;
 $3 = $eval;
 $4 = $evec;
 $5 = $w;
 if ((HEAP32[$2 >> 2] | 0) != (HEAP32[$2 + 4 >> 2] | 0)) {
  _gsl_error(3512, 8984, 105, 20);
  $1 = 20;
  $245 = $1;
  STACKTOP = sp;
  return $245 | 0;
 }
 if ((HEAP32[$3 >> 2] | 0) != (HEAP32[$2 >> 2] | 0)) {
  _gsl_error(3208, 8984, 109, 19);
  $1 = 19;
  $245 = $1;
  STACKTOP = sp;
  return $245 | 0;
 }
 if ((HEAP32[$4 >> 2] | 0) == (HEAP32[$2 >> 2] | 0)) {
  if ((HEAP32[$4 + 4 >> 2] | 0) == (HEAP32[$2 >> 2] | 0)) {
   $d = HEAP32[$5 + 4 >> 2] | 0;
   $sd = HEAP32[$5 + 8 >> 2] | 0;
   $N = HEAP32[$2 >> 2] | 0;
   if (($N | 0) == 1) {
    _gsl_vector_set($3, 0, +_gsl_matrix_get($2, 0, 0));
    _gsl_matrix_set($4, 0, 0, 1.0);
    $1 = 0;
    $245 = $1;
    STACKTOP = sp;
    return $245 | 0;
   }
   _gsl_vector_view_array($d_vec, $d, $N);
   _gsl_vector_view_array($sd_vec, $sd, $N - 1 | 0);
   _gsl_vector_view_array($tau, $sd, $N - 1 | 0);
   _gsl_linalg_symmtd_decomp($2, $tau | 0) | 0;
   _gsl_linalg_symmtd_unpack($2, $tau | 0, $4, $d_vec | 0, $sd_vec | 0) | 0;
   _chop_small_elements710($N, $d, $sd);
   $b = $N - 1 | 0;
   L18 : while (1) {
    if (!($b >>> 0 > 0 >>> 0)) {
     break;
    }
    L21 : do {
     if (!(+HEAPF64[$sd + ($b - 1 << 3) >> 3] == 0.0)) {
      do {
       if (0) {
        if (((___FLOAT_BITS711(+HEAPF64[$sd + ($b - 1 << 3) >> 3]) | 0) & 2147483647) >>> 0 > 2139095040 >>> 0) {
         break L21;
        }
       } else {
        if (1) {
         $115$0 = ___DOUBLE_BITS712(+HEAPF64[$sd + ($b - 1 << 3) >> 3]) | 0;
         $116$1 = tempRet0 & 2147483647;
         $$etemp$1$1 = 2146435072;
         if ($116$1 >>> 0 > $$etemp$1$1 >>> 0 | $116$1 >>> 0 == $$etemp$1$1 >>> 0 & ($115$0 | 0) >>> 0 > 0 >>> 0) {
          break L21;
         } else {
          break;
         }
        } else {
         if ((___fpclassify(+(+HEAPF64[$sd + ($b - 1 << 3) >> 3])) | 0) == 0) {
          break L21;
         } else {
          break;
         }
        }
       }
      } while (0);
      $a = $b - 1 | 0;
      while (1) {
       if (!($a >>> 0 > 0 >>> 0)) {
        break;
       }
       if (+HEAPF64[$sd + ($a - 1 << 3) >> 3] == 0.0) {
        label = 25;
        break;
       }
       $a = $a - 1 | 0;
      }
      if ((label | 0) == 25) {
       label = 0;
      }
      $n_block = $b - $a + 1 | 0;
      $gc = HEAP32[$5 + 12 >> 2] | 0;
      $gs = HEAP32[$5 + 16 >> 2] | 0;
      _qrstep713($n_block, $d + ($a << 3) | 0, $sd + ($a << 3) | 0, $gc, $gs);
      $i = 0;
      while (1) {
       if (!($i >>> 0 < ($n_block - 1 | 0) >>> 0)) {
        break;
       }
       $c = +HEAPF64[$gc + ($i << 3) >> 3];
       $s = +HEAPF64[$gs + ($i << 3) >> 3];
       $k = 0;
       while (1) {
        if (!($k >>> 0 < $N >>> 0)) {
         break;
        }
        $qki = +_gsl_matrix_get($4, $k, $a + $i | 0);
        $qkj = +_gsl_matrix_get($4, $k, $a + $i + 1 | 0);
        _gsl_matrix_set($4, $k, $a + $i | 0, $qki * $c - $qkj * $s);
        _gsl_matrix_set($4, $k, $a + $i + 1 | 0, $qki * $s + $qkj * $c);
        $k = $k + 1 | 0;
       }
       $i = $i + 1 | 0;
      }
      _chop_small_elements710($N, $d, $sd);
      continue L18;
     }
    } while (0);
    $b = $b - 1 | 0;
   }
   _gsl_vector_view_array($d_vec1, $d, $N);
   _gsl_vector_memcpy($3, $d_vec1 | 0) | 0;
   $1 = 0;
   $245 = $1;
   STACKTOP = sp;
   return $245 | 0;
  }
 }
 _gsl_error(2800, 8984, 113, 19);
 $1 = 19;
 $245 = $1;
 STACKTOP = sp;
 return $245 | 0;
}
function _read_lines() {
 var $from = 0, $to = 0, $term_left = 0, $term_right = 0, $span_id = 0, $length = 0, $1 = 0, $3 = 0, $13 = 0, $storemerge_in_i = 0, $storemerge_i = 0, $26 = 0, $27 = 0, $28 = 0, $32 = 0, $33 = 0, $37 = 0, $storemerge23 = 0, $left_0 = 0, $50 = 0, $storemerge = 0, $right_0 = 0, $64 = 0, $65 = 0, $78 = 0, $83 = 0, $90 = 0, $95 = 0, $103 = 0, $125 = 0, $130 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48 | 0;
 $from = sp | 0;
 $to = sp + 8 | 0;
 $term_left = sp + 16 | 0;
 $term_right = sp + 24 | 0;
 $span_id = sp + 32 | 0;
 $length = sp + 40 | 0;
 $1 = _first_token() | 0;
 if (($1 | 0) == 0) {
  STACKTOP = sp;
  return;
 } else {
  $3 = $1;
 }
 while (1) {
  if ((_strcmp($3, 1272) | 0) != 0) {
   label = 35;
   break;
  }
  _next_int($from) | 0;
  _next_int($to) | 0;
  _next_int($span_id) | 0;
  _next_double($length) | 0;
  _next_int($term_left) | 0;
  _next_int($term_right) | 0;
  $13 = HEAP32[$span_id >> 2] | 0;
  $storemerge_in_i = 11584;
  while (1) {
   $storemerge_i = HEAP32[$storemerge_in_i >> 2] | 0;
   HEAP32[2894] = $storemerge_i;
   if ((HEAP32[$storemerge_i + 48 >> 2] | 0) == ($13 | 0)) {
    break;
   } else {
    $storemerge_in_i = $storemerge_i + 52 | 0;
   }
  }
  $26 = ~~(+HEAPF64[$length >> 3] / +HEAPF64[$storemerge_i + 40 >> 3] / +HEAPF64[323] + .5);
  $27 = HEAP32[$from >> 2] | 0;
  $28 = HEAP32[3120] | 0;
  if (($27 | 0) > ($28 | 0)) {
   HEAP32[3120] = $27;
   $32 = $27;
  } else {
   $32 = $28;
  }
  $33 = HEAP32[$to >> 2] | 0;
  if (($33 | 0) > ($32 | 0)) {
   HEAP32[3120] = $33;
  }
  $37 = _find_pole($27) | 0;
  if (($37 | 0) == 0) {
   $storemerge23 = HEAP32[2982] | 0;
   do {
    HEAP32[2978] = $storemerge23;
    $storemerge23 = HEAP32[$storemerge23 + 76 >> 2] | 0;
   } while (($storemerge23 | 0) != 0);
   $left_0 = _new_pole(HEAP32[$from >> 2] | 0) | 0;
  } else {
   $left_0 = $37;
  }
  $50 = _find_pole(HEAP32[$to >> 2] | 0) | 0;
  if (($50 | 0) == 0) {
   $storemerge = HEAP32[2982] | 0;
   do {
    HEAP32[2978] = $storemerge;
    $storemerge = HEAP32[$storemerge + 76 >> 2] | 0;
   } while (($storemerge | 0) != 0);
   $right_0 = _new_pole(HEAP32[$to >> 2] | 0) | 0;
  } else {
   $right_0 = $50;
  }
  HEAP32[$left_0 + 8 >> 2] = 1;
  HEAP32[$right_0 + 8 >> 2] = 1;
  $64 = _malloc(32) | 0;
  $65 = $64;
  if (($64 | 0) == 0) {
   $125 = HEAP32[3164] | 0;
   if (($125 | 0) != 0) {
    _fwrite(9784, 24, 1, $125 | 0) | 0;
   }
   _oe_exit(2);
  } else {
   HEAP32[$64 + 20 >> 2] = $left_0;
   HEAP32[$64 + 24 >> 2] = $right_0;
   HEAP32[$64 + 12 >> 2] = $26;
   HEAP32[$64 + 16 >> 2] = $26;
   HEAP32[$64 >> 2] = $storemerge_i;
   $78 = _gsl_matrix_calloc(HEAP32[3124] | 0, $26) | 0;
   HEAP32[$64 + 4 >> 2] = $78;
   if (($78 | 0) == 0) {
    $83 = HEAP32[3164] | 0;
    if (($83 | 0) != 0) {
     _fwrite(6920, 29, 1, $83 | 0) | 0;
    }
    _oe_exit(2);
   }
   $90 = _gsl_matrix_calloc(HEAP32[3124] | 0, $26) | 0;
   HEAP32[$64 + 8 >> 2] = $90;
   if (($90 | 0) == 0) {
    $95 = HEAP32[3164] | 0;
    if (($95 | 0) != 0) {
     _fwrite(6920, 29, 1, $95 | 0) | 0;
    }
    _oe_exit(2);
   }
   $103 = $storemerge_i + 12 | 0;
   _gsl_matrix_add(HEAP32[$left_0 + 40 >> 2] | 0, HEAP32[$103 >> 2] | 0) | 0;
   _gsl_matrix_add(HEAP32[$right_0 + 40 >> 2] | 0, HEAP32[$103 >> 2] | 0) | 0;
   if ((HEAP32[$term_left >> 2] | 0) != 0) {
    _terminate_pole($left_0, $storemerge_i);
   }
   if ((HEAP32[$term_right >> 2] | 0) != 0) {
    _terminate_pole($right_0, $storemerge_i);
   }
   HEAP32[$64 + 28 >> 2] = 0;
   HEAP32[(HEAP32[3166] | 0) + 28 >> 2] = $65;
   HEAP32[3166] = $65;
  }
  $130 = _first_token() | 0;
  if (($130 | 0) == 0) {
   label = 35;
   break;
  } else {
   $3 = $130;
  }
 }
 if ((label | 0) == 35) {
  STACKTOP = sp;
  return;
 }
}
function _brent_iterate($vstate, $f, $root, $x_lower, $x_upper) {
 $vstate = $vstate | 0;
 $f = $f | 0;
 $root = $root | 0;
 $x_lower = $x_lower | 0;
 $x_upper = $x_upper | 0;
 var $1 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $state = 0, $tol = 0.0, $m = 0.0, $ac_equal = 0, $a = 0.0, $b = 0.0, $c = 0.0, $fa = 0.0, $fb = 0.0, $fc = 0.0, $d = 0.0, $e = 0.0, $p = 0.0, $q = 0.0, $r = 0.0, $s = 0.0, $206 = 0.0, $237 = 0.0, $313 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $3 = $f;
 $4 = $root;
 $5 = $x_lower;
 $6 = $x_upper;
 $state = $vstate;
 $ac_equal = 0;
 $a = +HEAPF64[$state >> 3];
 $b = +HEAPF64[$state + 8 >> 3];
 $c = +HEAPF64[$state + 16 >> 3];
 $fa = +HEAPF64[$state + 40 >> 3];
 $fb = +HEAPF64[$state + 48 >> 3];
 $fc = +HEAPF64[$state + 56 >> 3];
 $d = +HEAPF64[$state + 24 >> 3];
 $e = +HEAPF64[$state + 32 >> 3];
 if ($fb < 0.0) {
  if ($fc < 0.0) {
   label = 5;
  } else {
   label = 3;
  }
 } else {
  label = 3;
 }
 if ((label | 0) == 3) {
  if ($fb > 0.0) {
   if ($fc > 0.0) {
    label = 5;
   }
  }
 }
 if ((label | 0) == 5) {
  $ac_equal = 1;
  $c = $a;
  $fc = $fa;
  $d = $b - $a;
  $e = $b - $a;
 }
 if (+Math_abs(+$fc) < +Math_abs(+$fb)) {
  $ac_equal = 1;
  $a = $b;
  $b = $c;
  $c = $a;
  $fa = $fb;
  $fb = $fc;
  $fc = $fa;
 }
 $tol = +Math_abs(+$b) * 1.1102230246251565e-16;
 $m = ($c - $b) * .5;
 if ($fb == 0.0) {
  HEAPF64[$4 >> 3] = $b;
  HEAPF64[$5 >> 3] = $b;
  HEAPF64[$6 >> 3] = $b;
  $1 = 0;
  $313 = $1;
  STACKTOP = sp;
  return $313 | 0;
 }
 if (+Math_abs(+$m) <= $tol) {
  HEAPF64[$4 >> 3] = $b;
  if ($b < $c) {
   HEAPF64[$5 >> 3] = $b;
   HEAPF64[$6 >> 3] = $c;
  } else {
   HEAPF64[$5 >> 3] = $c;
   HEAPF64[$6 >> 3] = $b;
  }
  $1 = 0;
  $313 = $1;
  STACKTOP = sp;
  return $313 | 0;
 }
 if (+Math_abs(+$e) < $tol) {
  label = 17;
 } else {
  if (+Math_abs(+$fa) <= +Math_abs(+$fb)) {
   label = 17;
  } else {
   $s = $fb / $fa;
   if (($ac_equal | 0) != 0) {
    $p = 2.0 * $m * $s;
    $q = 1.0 - $s;
   } else {
    $q = $fa / $fc;
    $r = $fb / $fc;
    $p = $s * (2.0 * $m * $q * ($q - $r) - ($b - $a) * ($r - 1.0));
    $q = ($q - 1.0) * ($r - 1.0) * ($s - 1.0);
   }
   if ($p > 0.0) {
    $q = -0.0 - $q;
   } else {
    $p = -0.0 - $p;
   }
   if (3.0 * $m * $q - +Math_abs(+($tol * $q)) < +Math_abs(+($e * $q))) {
    $206 = 3.0 * $m * $q - +Math_abs(+($tol * $q));
   } else {
    $206 = +Math_abs(+($e * $q));
   }
   if (2.0 * $p < $206) {
    $e = $d;
    $d = $p / $q;
   } else {
    $d = $m;
    $e = $m;
   }
  }
 }
 if ((label | 0) == 17) {
  $d = $m;
  $e = $m;
 }
 $a = $b;
 $fa = $fb;
 if (+Math_abs(+$d) > $tol) {
  $b = $b + $d;
 } else {
  if ($m > 0.0) {
   $237 = $tol;
  } else {
   $237 = -0.0 - $tol;
  }
  $b = $b + $237;
 }
 $fb = +FUNCTION_TABLE_ddi[HEAP32[$3 >> 2] & 3]($b, HEAP32[$3 + 4 >> 2] | 0);
 if ((_gsl_finite($fb) | 0) == 0) {
  _gsl_error(10864, 8192, 202, 9);
  $1 = 9;
  $313 = $1;
  STACKTOP = sp;
  return $313 | 0;
 }
 HEAPF64[$state >> 3] = $a;
 HEAPF64[$state + 8 >> 3] = $b;
 HEAPF64[$state + 16 >> 3] = $c;
 HEAPF64[$state + 24 >> 3] = $d;
 HEAPF64[$state + 32 >> 3] = $e;
 HEAPF64[$state + 40 >> 3] = $fa;
 HEAPF64[$state + 48 >> 3] = $fb;
 HEAPF64[$state + 56 >> 3] = $fc;
 HEAPF64[$4 >> 3] = $b;
 if ($fb < 0.0) {
  if ($fc < 0.0) {
   label = 46;
  } else {
   label = 44;
  }
 } else {
  label = 44;
 }
 if ((label | 0) == 44) {
  if ($fb > 0.0) {
   if ($fc > 0.0) {
    label = 46;
   }
  }
 }
 if ((label | 0) == 46) {
  $c = $a;
 }
 if ($b < $c) {
  HEAPF64[$5 >> 3] = $b;
  HEAPF64[$6 >> 3] = $c;
 } else {
  HEAPF64[$5 >> 3] = $c;
  HEAPF64[$6 >> 3] = $b;
 }
 $1 = 0;
 $313 = $1;
 STACKTOP = sp;
 return $313 | 0;
}
function _scanexp($f, $pok) {
 $f = $f | 0;
 $pok = $pok | 0;
 var $1 = 0, $2 = 0, $3 = 0, $13 = 0, $15 = 0, $16 = 0, $26 = 0, $c_0 = 0, $neg_0 = 0, $x_042 = 0, $c_141 = 0, $46 = 0, $47 = 0, $c_1_be = 0, $phitmp$0 = 0, $phitmp$1 = 0, $y_0_lcssa$0 = 0, $y_0_lcssa$1 = 0, $c_2_lcssa = 0, $y_037$0 = 0, $y_037$1 = 0, $c_236 = 0, $69 = 0, $c_2_be = 0, $$etemp$2$1 = 0, $81 = 0, $c_3_be = 0, $98 = 0, $_0$0 = 0, $_0$1 = 0, $65$0 = 0, $65$1 = 0, $67$0 = 0, $68$0 = 0, $68$1 = 0, $99$0 = 0;
 $1 = $f + 4 | 0;
 $2 = HEAP32[$1 >> 2] | 0;
 $3 = $f + 100 | 0;
 if ($2 >>> 0 < (HEAP32[$3 >> 2] | 0) >>> 0) {
  HEAP32[$1 >> 2] = $2 + 1;
  $13 = HEAPU8[$2] | 0;
 } else {
  $13 = ___shgetc($f) | 0;
 }
 if (($13 | 0) == 45 | ($13 | 0) == 43) {
  $15 = ($13 | 0) == 45 | 0;
  $16 = HEAP32[$1 >> 2] | 0;
  if ($16 >>> 0 < (HEAP32[$3 >> 2] | 0) >>> 0) {
   HEAP32[$1 >> 2] = $16 + 1;
   $26 = HEAPU8[$16] | 0;
  } else {
   $26 = ___shgetc($f) | 0;
  }
  if (($26 - 48 | 0) >>> 0 < 10 >>> 0 | ($pok | 0) == 0) {
   $neg_0 = $15;
   $c_0 = $26;
  } else {
   if ((HEAP32[$3 >> 2] | 0) == 0) {
    $neg_0 = $15;
    $c_0 = $26;
   } else {
    HEAP32[$1 >> 2] = (HEAP32[$1 >> 2] | 0) - 1;
    $neg_0 = $15;
    $c_0 = $26;
   }
  }
 } else {
  $neg_0 = 0;
  $c_0 = $13;
 }
 if (($c_0 - 48 | 0) >>> 0 > 9 >>> 0) {
  if ((HEAP32[$3 >> 2] | 0) == 0) {
   $_0$1 = -2147483648;
   $_0$0 = 0;
   return (tempRet0 = $_0$1, $_0$0) | 0;
  }
  HEAP32[$1 >> 2] = (HEAP32[$1 >> 2] | 0) - 1;
  $_0$1 = -2147483648;
  $_0$0 = 0;
  return (tempRet0 = $_0$1, $_0$0) | 0;
 } else {
  $c_141 = $c_0;
  $x_042 = 0;
 }
 while (1) {
  $46 = $c_141 - 48 + $x_042 | 0;
  $47 = HEAP32[$1 >> 2] | 0;
  if ($47 >>> 0 < (HEAP32[$3 >> 2] | 0) >>> 0) {
   HEAP32[$1 >> 2] = $47 + 1;
   $c_1_be = HEAPU8[$47] | 0;
  } else {
   $c_1_be = ___shgetc($f) | 0;
  }
  if (!(($c_1_be - 48 | 0) >>> 0 < 10 >>> 0 & ($46 | 0) < 214748364)) {
   break;
  }
  $c_141 = $c_1_be;
  $x_042 = $46 * 10 | 0;
 }
 $phitmp$0 = $46;
 $phitmp$1 = ($46 | 0) < 0 | 0 ? -1 : 0;
 if (($c_1_be - 48 | 0) >>> 0 < 10 >>> 0) {
  $c_236 = $c_1_be;
  $y_037$1 = $phitmp$1;
  $y_037$0 = $phitmp$0;
  while (1) {
   $65$0 = ___muldi3($y_037$0, $y_037$1, 10, 0) | 0;
   $65$1 = tempRet0;
   $67$0 = _i64Add($c_236, ($c_236 | 0) < 0 | 0 ? -1 : 0, -48, -1) | 0;
   $68$0 = _i64Add($67$0, tempRet0, $65$0, $65$1) | 0;
   $68$1 = tempRet0;
   $69 = HEAP32[$1 >> 2] | 0;
   if ($69 >>> 0 < (HEAP32[$3 >> 2] | 0) >>> 0) {
    HEAP32[$1 >> 2] = $69 + 1;
    $c_2_be = HEAPU8[$69] | 0;
   } else {
    $c_2_be = ___shgetc($f) | 0;
   }
   $$etemp$2$1 = 21474836;
   if (($c_2_be - 48 | 0) >>> 0 < 10 >>> 0 & (($68$1 | 0) < ($$etemp$2$1 | 0) | ($68$1 | 0) == ($$etemp$2$1 | 0) & $68$0 >>> 0 < 2061584302 >>> 0)) {
    $c_236 = $c_2_be;
    $y_037$1 = $68$1;
    $y_037$0 = $68$0;
   } else {
    $c_2_lcssa = $c_2_be;
    $y_0_lcssa$1 = $68$1;
    $y_0_lcssa$0 = $68$0;
    break;
   }
  }
 } else {
  $c_2_lcssa = $c_1_be;
  $y_0_lcssa$1 = $phitmp$1;
  $y_0_lcssa$0 = $phitmp$0;
 }
 if (($c_2_lcssa - 48 | 0) >>> 0 < 10 >>> 0) {
  do {
   $81 = HEAP32[$1 >> 2] | 0;
   if ($81 >>> 0 < (HEAP32[$3 >> 2] | 0) >>> 0) {
    HEAP32[$1 >> 2] = $81 + 1;
    $c_3_be = HEAPU8[$81] | 0;
   } else {
    $c_3_be = ___shgetc($f) | 0;
   }
  } while (($c_3_be - 48 | 0) >>> 0 < 10 >>> 0);
 }
 if ((HEAP32[$3 >> 2] | 0) != 0) {
  HEAP32[$1 >> 2] = (HEAP32[$1 >> 2] | 0) - 1;
 }
 $98 = ($neg_0 | 0) != 0;
 $99$0 = _i64Subtract(0, 0, $y_0_lcssa$0, $y_0_lcssa$1) | 0;
 $_0$1 = $98 ? tempRet0 : $y_0_lcssa$1;
 $_0$0 = $98 ? $99$0 : $y_0_lcssa$0;
 return (tempRet0 = $_0$1, $_0$0) | 0;
}
function _read_newarr() {
 var $i = 0, $j = 0, $k = 0, $f_v10 = 0, $f_vgap = 0, $f_L = 0, $f_length = 0, $f_Uref = 0, $monitor = 0, $7 = 0.0, $use_linear_0 = 0, $20 = 0, $21 = 0, $26 = 0, $27 = 0.0, $28 = 0, $32 = 0, $33 = 0.0, $35 = 0.0, $36 = 0.0, $38 = 0, $49 = 0, $51 = 0, $55 = 0, $57 = 0, $59 = 0, $68 = 0.0, $75 = 0, $78 = 0.0, $81 = 0.0, $91 = 0.0, $107 = 0.0, $128 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 72 | 0;
 $i = sp | 0;
 $j = sp + 8 | 0;
 $k = sp + 16 | 0;
 $f_v10 = sp + 24 | 0;
 $f_vgap = sp + 32 | 0;
 $f_L = sp + 40 | 0;
 $f_length = sp + 48 | 0;
 $f_Uref = sp + 56 | 0;
 $monitor = sp + 64 | 0;
 _next_double($f_vgap) | 0;
 _next_double($f_v10) | 0;
 _next_double($f_Uref) | 0;
 _next_double($f_L) | 0;
 _next_double($f_length) | 0;
 _next_int($monitor) | 0;
 $7 = +HEAPF64[$f_v10 >> 3];
 if ($7 < 0.0) {
  HEAPF64[$f_v10 >> 3] = -0.0 - $7;
  $use_linear_0 = 1;
 } else {
  $use_linear_0 = 0;
 }
 HEAPF64[$f_L >> 3] = +HEAPF64[$f_length >> 3] * +HEAPF64[$f_L >> 3];
 _read_pairs() | 0;
 _read_poles() | 0;
 _reset_assignments() | 0;
 if ((_next_assignment($i, $j, $k) | 0) != 0) {
  STACKTOP = sp;
  return 0;
 }
 do {
  $20 = _malloc(168) | 0;
  $21 = $20;
  if (($20 | 0) == 0) {
   $128 = HEAP32[3164] | 0;
   if (($128 | 0) != 0) {
    _fwrite(9448, 26, 1, $128 | 0) | 0;
   }
   _oe_exit(2);
  } else {
   $26 = $20 + 8 | 0;
   HEAPF64[$26 >> 3] = +HEAPF64[$f_vgap >> 3];
   $27 = +HEAPF64[$f_v10 >> 3];
   $28 = $20;
   HEAPF64[$28 >> 3] = $27;
   $32 = $20 + 16 | 0;
   HEAPF64[$32 >> 3] = +HEAPF64[$f_Uref >> 3] * $27;
   $33 = +HEAPF64[$f_L >> 3];
   $35 = +HEAPF64[323];
   $36 = $33 * 2.0 / $35;
   $38 = $20 + 120 | 0;
   HEAPF64[$38 >> 3] = $36;
   if ($36 > 0.0) {
    HEAPF64[$20 + 96 >> 3] = $35 / $33;
   } else {
    HEAPF64[$20 + 96 >> 3] = 0.0;
   }
   $49 = _find_pole(HEAP32[$i >> 2] | 0) | 0;
   $51 = $20 + 156 | 0;
   HEAP32[$51 >> 2] = $49;
   if (($49 | 0) == 0) {
    _oe_exit(15);
    $55 = HEAP32[$51 >> 2] | 0;
   } else {
    $55 = $49;
   }
   HEAP32[$55 + 8 >> 2] = 1;
   $57 = $55 + 12 | 0;
   $59 = (HEAP32[$57 >> 2] | 0) + 1 | 0;
   HEAP32[$57 >> 2] = $59;
   HEAP32[$20 + 152 >> 2] = $59;
   HEAP32[$20 + 144 >> 2] = HEAP32[$j >> 2];
   HEAP32[$20 + 148 >> 2] = HEAP32[$k >> 2];
   $68 = +HEAPF64[$f_v10 >> 3];
   HEAP32[$20 + 24 >> 2] = _build_arrester($68, $68 > 14.0e4 | 0, 1, 1, $use_linear_0) | 0;
   $75 = $20 + 128 | 0;
   HEAPF64[$20 + 112 >> 3] = 0.0;
   _memset($20 + 32 | 0, 0, 40) | 0;
   _memset($75 | 0, 0, 16) | 0;
   $78 = +HEAPF64[$26 >> 3];
   if ($78 > 0.0) {
    $81 = $78 / .001;
    HEAPF64[$20 + 72 >> 3] = $81;
    $91 = $81;
   } else {
    HEAPF64[$20 + 72 >> 3] = 0.0;
    HEAPF64[$20 + 56 >> 3] = +HEAPF64[323];
    $91 = 0.0;
   }
   if (+HEAPF64[$32 >> 3] > 0.0) {
    HEAPF64[$20 + 80 >> 3] = 34.0 / (+HEAPF64[$28 >> 3] / 1.0e3);
    HEAPF64[$20 + 88 >> 3] = 1.0e-7;
    $107 = 1.0e-7;
   } else {
    HEAPF64[$20 + 80 >> 3] = 0.0;
    HEAPF64[$20 + 88 >> 3] = 1.0e6;
    $107 = 1.0e6;
   }
   HEAPF64[$20 + 104 >> 3] = $91 + +HEAPF64[$38 >> 3] + 1.0 / $107;
   HEAP32[$20 + 160 >> 2] = 0;
   HEAP32[(HEAP32[3146] | 0) + 160 >> 2] = $21;
   HEAP32[3146] = $21;
   if ((HEAP32[$monitor >> 2] | 0) != 0) {
    _add_ammeter(HEAP32[$i >> 2] | 0, HEAP32[$j >> 2] | 0, -1, $75) | 0;
   }
  }
 } while ((_next_assignment($i, $j, $k) | 0) == 0);
 STACKTOP = sp;
 return 0;
}
function _read_customer() {
 var $i = 0, $j = 0, $k = 0, $Rhg = 0, $rho = 0, $e0 = 0, $Lhg = 0, $Dhg = 0, $N = 0, $Lp = 0, $Ls1 = 0, $Ls2 = 0, $ra = 0, $rn = 0, $Dan = 0, $Daa = 0, $l = 0, $Lcm = 0, $19 = 0.0, $22 = 0.0, $23 = 0.0, $28 = 0.0, $33 = 0.0, $38 = 0.0, $43 = 0.0, $46 = 0.0, $49 = 0.0, $51 = 0.0, $61 = 0.0, $67 = 0.0, $69 = 0.0, $81 = 0.0, $82 = 0.0, $84 = 0, $85 = 0, $89 = 0, $91 = 0, $95 = 0, $107 = 0, $115 = 0, $134 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 144 | 0;
 $i = sp | 0;
 $j = sp + 8 | 0;
 $k = sp + 16 | 0;
 $Rhg = sp + 24 | 0;
 $rho = sp + 32 | 0;
 $e0 = sp + 40 | 0;
 $Lhg = sp + 48 | 0;
 $Dhg = sp + 56 | 0;
 $N = sp + 64 | 0;
 $Lp = sp + 72 | 0;
 $Ls1 = sp + 80 | 0;
 $Ls2 = sp + 88 | 0;
 $ra = sp + 96 | 0;
 $rn = sp + 104 | 0;
 $Dan = sp + 112 | 0;
 $Daa = sp + 120 | 0;
 $l = sp + 128 | 0;
 $Lcm = sp + 136 | 0;
 _next_double($Rhg) | 0;
 _next_double($rho) | 0;
 _next_double($e0) | 0;
 _next_double($Lhg) | 0;
 _next_double($Dhg) | 0;
 HEAPF64[$Lhg >> 3] = +HEAPF64[$Dhg >> 3] * +HEAPF64[$Lhg >> 3];
 _next_double($N) | 0;
 _next_double($Lp) | 0;
 _next_double($Ls1) | 0;
 _next_double($Ls2) | 0;
 _next_double($Lcm) | 0;
 _next_double($ra) | 0;
 _next_double($rn) | 0;
 _next_double($Dan) | 0;
 _next_double($Daa) | 0;
 _next_double($l) | 0;
 $19 = +HEAPF64[$l >> 3];
 HEAPF64[$Lcm >> 3] = $19 * +HEAPF64[$Lcm >> 3];
 $22 = $19 * 2.0e-7;
 $23 = $19 * 2.0;
 $28 = $22 * (+Math_log($23 / +HEAPF64[$ra >> 3]) + -1.0);
 $33 = $22 * (+Math_log($23 / +HEAPF64[$rn >> 3]) + -1.0);
 $38 = $22 * (+Math_log($23 / +HEAPF64[$Daa >> 3]) + -1.0);
 $43 = $22 * (+Math_log($23 / +HEAPF64[$Dan >> 3]) + -1.0);
 $46 = +HEAPF64[$N >> 3];
 $49 = +HEAPF64[$Ls1 >> 3];
 $51 = +HEAPF64[$Ls2 >> 3];
 $61 = $49 - $51;
 $67 = $28 * 2.0 + (+HEAPF64[$Lp >> 3] * 4.0 / $46 / $46 + $49 + $51) - $38 * 2.0;
 $69 = $38 + ($33 * 2.0 + ($28 + ($49 + $51) * .5)) - $43 * 4.0 - $61 * $61 * .5 / $67;
 _read_pairs() | 0;
 _read_poles() | 0;
 _reset_assignments() | 0;
 if ((_next_assignment($i, $j, $k) | 0) != 0) {
  STACKTOP = sp;
  return 0;
 }
 $81 = ($33 - $43) / $69 * 2.0;
 $82 = ($51 - $49) / $46 / $67 / $69 * 2.0;
 do {
  $84 = _malloc(80) | 0;
  $85 = $84;
  if (($84 | 0) == 0) {
   $134 = HEAP32[3164] | 0;
   if (($134 | 0) != 0) {
    _fwrite(4440, 28, 1, $134 | 0) | 0;
   }
   _oe_exit(2);
  } else {
   $89 = _find_pole(HEAP32[$i >> 2] | 0) | 0;
   $91 = $84 + 64 | 0;
   HEAP32[$91 >> 2] = $89;
   if (($89 | 0) == 0) {
    _oe_exit(15);
    $95 = HEAP32[$91 >> 2] | 0;
   } else {
    $95 = $89;
   }
   HEAP32[$95 + 8 >> 2] = 1;
   $107 = $84 + 68 | 0;
   HEAP32[$107 >> 2] = _add_ground(HEAP32[$i >> 2] | 0, HEAP32[$k >> 2] | 0, 0, +HEAPF64[$Rhg >> 3], +HEAPF64[$rho >> 3], +HEAPF64[$e0 >> 3], +HEAPF64[$Lcm >> 3] + +HEAPF64[$Lhg >> 3]) | 0;
   HEAPF64[$84 + 48 >> 3] = $81;
   HEAPF64[$84 + 56 >> 3] = $82 * +HEAPF64[323];
   _memset($84 + 8 | 0, 0, 40) | 0;
   $115 = HEAP32[$j >> 2] | 0;
   HEAP32[$84 >> 2] = $115;
   HEAP32[$84 + 4 >> 2] = HEAP32[$k >> 2];
   HEAP32[$84 + 72 >> 2] = 0;
   HEAP32[(HEAP32[3198] | 0) + 72 >> 2] = $85;
   HEAP32[3198] = $85;
   _add_ammeter(HEAP32[$i >> 2] | 0, $115, -3, (HEAP32[$107 >> 2] | 0) + 64 | 0) | 0;
   _add_ammeter(HEAP32[$i >> 2] | 0, HEAP32[$j >> 2] | 0, -4, $84 + 24 | 0) | 0;
  }
 } while ((_next_assignment($i, $j, $k) | 0) == 0);
 STACKTOP = sp;
 return 0;
}
function _move_steepfront($ptr, $i, $j, $k, $fpeak, $ftf, $ftt, $ftstart, $pu_si) {
 $ptr = $ptr | 0;
 $i = $i | 0;
 $j = $j | 0;
 $k = $k | 0;
 $fpeak = +$fpeak;
 $ftf = +$ftf;
 $ftt = +$ftt;
 $ftstart = +$ftstart;
 $pu_si = +$pu_si;
 var $xpts = 0, $ypts = 0, $1 = 0, $2 = 0, $14 = 0.0, $17 = 0.0, $18 = 0.0, $19 = 0, $20 = 0, $25 = 0.0, $40 = 0.0, $47 = 0.0, $50 = 0.0, $54 = 0.0, $55 = 0.0, $56 = 0.0, $64 = 0.0, $72 = 0.0, $80 = 0.0, $88 = 0.0, $96 = 0.0, $104 = 0.0, $113 = 0, $114 = 0, $118 = 0, $119 = 0, $120 = 0, $121 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 400 | 0;
 $xpts = sp | 0;
 $ypts = sp + 200 | 0;
 $1 = $ptr + 48 | 0;
 $2 = HEAP32[$1 >> 2] | 0;
 if (($2 | 0) != 0) {
  _free_bezier_fit($2);
  _free(HEAP32[$1 >> 2] | 0);
 }
 HEAPF64[$ptr + 8 >> 3] = $ftf;
 HEAPF64[$ptr + 16 >> 3] = $ftt;
 HEAPF64[$ptr + 24 >> 3] = $ftstart;
 HEAPF64[$ptr >> 3] = $fpeak;
 HEAPF64[$ptr + 32 >> 3] = $pu_si;
 $14 = $fpeak * $pu_si / $ftf;
 HEAPF64[$ptr + 40 >> 3] = $14;
 $17 = $ftf * 1.16;
 $18 = $ftf * 1.76;
 $19 = $xpts | 0;
 HEAPF64[$19 >> 3] = 0.0;
 $20 = $ypts | 0;
 HEAPF64[$20 >> 3] = 0.0;
 HEAPF64[$xpts + 8 >> 3] = $ftf * .78;
 HEAPF64[$ypts + 8 >> 3] = $fpeak * .1;
 HEAPF64[$xpts + 16 >> 3] = $17;
 $25 = $fpeak * .3;
 HEAPF64[$ypts + 16 >> 3] = $25;
 HEAPF64[$xpts + 24 >> 3] = $17 * 1.005;
 HEAPF64[$ypts + 24 >> 3] = $25 * 1.005;
 HEAPF64[$xpts + 32 >> 3] = $18 - $25 / $14;
 HEAPF64[$ypts + 32 >> 3] = $fpeak * .6000000000000001;
 HEAPF64[$xpts + 40 >> 3] = $18;
 HEAPF64[$ypts + 40 >> 3] = $fpeak * .9;
 $40 = $fpeak * .005 / $14;
 HEAPF64[$xpts + 48 >> 3] = $18 + $40;
 HEAPF64[$ypts + 48 >> 3] = $fpeak * .905;
 $47 = $18 + $40 * .1 / .005;
 HEAPF64[$xpts + 56 >> 3] = $47;
 HEAPF64[$ypts + 56 >> 3] = $fpeak;
 $50 = $47 * 1.2;
 HEAPF64[$xpts + 64 >> 3] = $50;
 HEAPF64[$ypts + 64 >> 3] = $fpeak;
 $54 = ($ftt - $50) * 1.442695;
 $55 = $54 * .5;
 $56 = $50 + $55;
 HEAPF64[$xpts + 72 >> 3] = $56;
 HEAPF64[$ypts + 72 >> 3] = +Math_exp((-0.0 - ($56 - $50)) / $54) * $fpeak;
 $64 = $55 + $56;
 HEAPF64[$xpts + 80 >> 3] = $64;
 HEAPF64[$ypts + 80 >> 3] = +Math_exp((-0.0 - ($64 - $50)) / $54) * $fpeak;
 $72 = $55 + $64;
 HEAPF64[$xpts + 88 >> 3] = $72;
 HEAPF64[$ypts + 88 >> 3] = +Math_exp((-0.0 - ($72 - $50)) / $54) * $fpeak;
 $80 = $55 + $72;
 HEAPF64[$xpts + 96 >> 3] = $80;
 HEAPF64[$ypts + 96 >> 3] = +Math_exp((-0.0 - ($80 - $50)) / $54) * $fpeak;
 $88 = $55 + $80;
 HEAPF64[$xpts + 104 >> 3] = $88;
 HEAPF64[$ypts + 104 >> 3] = +Math_exp((-0.0 - ($88 - $50)) / $54) * $fpeak;
 $96 = $55 + $88;
 HEAPF64[$xpts + 112 >> 3] = $96;
 HEAPF64[$ypts + 112 >> 3] = +Math_exp((-0.0 - ($96 - $50)) / $54) * $fpeak;
 $104 = $96 * 10.0;
 HEAPF64[$xpts + 120 >> 3] = $104;
 HEAPF64[$ypts + 120 >> 3] = +Math_exp((-0.0 - ($104 - $50)) / $54) * $fpeak;
 HEAP32[$1 >> 2] = _build_bezier($19, $20, 16, 0) | 0;
 $113 = _find_pole($i) | 0;
 $114 = $ptr + 60 | 0;
 HEAP32[$114 >> 2] = $113;
 if (($113 | 0) != 0) {
  $118 = $113;
  $119 = $118 + 8 | 0;
  HEAP32[$119 >> 2] = 1;
  $120 = $ptr + 52 | 0;
  HEAP32[$120 >> 2] = $j;
  $121 = $ptr + 56 | 0;
  HEAP32[$121 >> 2] = $k;
  STACKTOP = sp;
  return;
 }
 _oe_exit(15);
 $118 = HEAP32[$114 >> 2] | 0;
 $119 = $118 + 8 | 0;
 HEAP32[$119 >> 2] = 1;
 $120 = $ptr + 52 | 0;
 HEAP32[$120 >> 2] = $j;
 $121 = $ptr + 56 | 0;
 HEAP32[$121 >> 2] = $k;
 STACKTOP = sp;
 return;
}
function _triang_pole($ptr) {
 $ptr = $ptr | 0;
 var $signum = 0, $1 = 0, $2 = 0, $5 = 0, $12 = 0, $14 = 0, $18 = 0, $30 = 0, $33 = 0, $35 = 0, $j_046 = 0, $36 = 0, $aptr_07_i = 0, $aptr_08_i = 0, $aptr_0_i = 0, $49 = 0, $55 = 0, $_0_i42 = 0, $59 = 0, $67 = 0, $74 = 0, $75 = 0, $i_044 = 0, $82 = 0, $85 = 0, $_lcssa = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $signum = sp | 0;
 $1 = $ptr + 12 | 0;
 $2 = HEAP32[$1 >> 2] | 0;
 if (($2 | 0) > 0) {
  $5 = $ptr + 52 | 0;
  if ((HEAP32[$5 >> 2] | 0) == 0) {
   HEAP32[$ptr + 48 >> 2] = _gsl_matrix_calloc($2, HEAP32[3122] | 0) | 0;
   $12 = HEAP32[$1 >> 2] | 0;
   HEAP32[$5 >> 2] = _gsl_matrix_calloc($12, $12) | 0;
   $14 = HEAP32[$1 >> 2] | 0;
   $18 = $ptr + 16 | 0;
   HEAP32[$18 >> 2] = _malloc($14 << 2) | 0;
   HEAP32[$ptr + 64 >> 2] = _gsl_vector_calloc($14) | 0;
   HEAP32[$ptr + 60 >> 2] = _gsl_vector_calloc(HEAP32[$1 >> 2] | 0) | 0;
   HEAP32[$ptr + 68 >> 2] = _gsl_vector_calloc(HEAP32[$1 >> 2] | 0) | 0;
   HEAP32[$ptr + 56 >> 2] = _gsl_permutation_alloc(HEAP32[$1 >> 2] | 0) | 0;
   $30 = HEAP32[$1 >> 2] | 0;
   HEAP32[$ptr + 72 >> 2] = _gsl_matrix_calloc($30, $30) | 0;
   $33 = HEAP32[$1 >> 2] | 0;
   if (($33 | 0) > 0) {
    $j_046 = 0;
    $35 = $33;
    while (1) {
     $36 = $j_046 + 1 | 0;
     $aptr_07_i = HEAP32[3220] | 0;
     L6 : do {
      if (($aptr_07_i | 0) == 0) {
       label = 9;
      } else {
       $aptr_08_i = $aptr_07_i;
       while (1) {
        if ((HEAP32[$aptr_08_i + 156 >> 2] | 0) == ($ptr | 0)) {
         if ((HEAP32[$aptr_08_i + 152 >> 2] | 0) == ($36 | 0)) {
          break;
         }
        }
        $aptr_0_i = HEAP32[$aptr_08_i + 160 >> 2] | 0;
        if (($aptr_0_i | 0) == 0) {
         label = 9;
         break L6;
        } else {
         $aptr_08_i = $aptr_0_i;
        }
       }
       if (($aptr_08_i | 0) == 0) {
        label = 9;
       } else {
        $_0_i42 = $aptr_08_i;
        $55 = $35;
       }
      }
     } while (0);
     if ((label | 0) == 9) {
      label = 0;
      $49 = HEAP32[3164] | 0;
      if (($49 | 0) != 0) {
       _fwrite(2944, 50, 1, $49 | 0) | 0;
      }
      _oe_exit(16);
      $_0_i42 = 0;
      $55 = HEAP32[$1 >> 2] | 0;
     }
     HEAP32[(HEAP32[$18 >> 2] | 0) + ($j_046 << 2) >> 2] = $_0_i42;
     if (($36 | 0) < ($55 | 0)) {
      $j_046 = $36;
      $35 = $55;
     } else {
      break;
     }
    }
   }
  }
 }
 $59 = $ptr + 4 | 0;
 if ((HEAP32[$59 >> 2] | 0) == 0) {
  STACKTOP = sp;
  return;
 }
 if ((HEAP32[$ptr + 8 >> 2] | 0) == 0) {
  STACKTOP = sp;
  return;
 }
 $67 = $ptr + 44 | 0;
 _gsl_matrix_memcpy(HEAP32[$67 >> 2] | 0, HEAP32[$ptr + 40 >> 2] | 0) | 0;
 $74 = HEAP32[$67 >> 2] | 0;
 if ((HEAP32[3122] | 0) > 0) {
  $i_044 = 0;
  $75 = $74;
  while (1) {
   if (!(+HEAPF64[(_gsl_matrix_ptr($75, $i_044, $i_044) | 0) >> 3] > 0.0)) {
    _gsl_matrix_set(HEAP32[$67 >> 2] | 0, $i_044, $i_044, 1.0e-9);
   }
   $82 = $i_044 + 1 | 0;
   $85 = HEAP32[$67 >> 2] | 0;
   if (($82 | 0) < (HEAP32[3122] | 0)) {
    $i_044 = $82;
    $75 = $85;
   } else {
    $_lcssa = $85;
    break;
   }
  }
 } else {
  $_lcssa = $74;
 }
 _gsl_linalg_LU_decomp($_lcssa, HEAP32[$ptr + 36 >> 2] | 0, $signum) | 0;
 if ((HEAP32[$1 >> 2] | 0) > 0) {
  _build_rthev($ptr);
 }
 HEAP32[$59 >> 2] = 0;
 STACKTOP = sp;
 return;
}
function _qrstep713($n, $d, $sd, $gc, $gs) {
 $n = $n | 0;
 $d = $d | 0;
 $sd = $sd | 0;
 $gc = $gc | 0;
 $gs = $gs | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $x = 0.0, $z = 0.0, $ak = 0.0, $bk = 0.0, $zk = 0.0, $ap = 0.0, $bp = 0.0, $aq = 0.0, $bq = 0.0, $k = 0, $mu = 0.0, $c = 0, $s = 0, $c1 = 0, $s2 = 0, $bk1 = 0.0, $12 = 0.0, $16 = 0.0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32 | 0;
 $c = sp | 0;
 $s = sp + 8 | 0;
 $c1 = sp + 16 | 0;
 $s2 = sp + 24 | 0;
 $1 = $n;
 $2 = $d;
 $3 = $sd;
 $4 = $gc;
 $5 = $gs;
 $mu = +_trailing_eigenvalue714($1, $2, $3);
 $12 = +Math_abs(+$mu) * 2.220446049250313e-16;
 $16 = +Math_abs(+(+HEAPF64[$2 >> 3]));
 if ($12 > $16 + +Math_abs(+(+HEAPF64[$3 >> 3]))) {
  $mu = 0.0;
 }
 $x = +HEAPF64[$2 >> 3] - $mu;
 $z = +HEAPF64[$3 >> 3];
 $ak = 0.0;
 $bk = 0.0;
 $zk = 0.0;
 $ap = +HEAPF64[$2 >> 3];
 $bp = +HEAPF64[$3 >> 3];
 $aq = +HEAPF64[$2 + 8 >> 3];
 if (($1 | 0) == 2) {
  _create_givens715($x, $z, $c, $s);
  if (($4 | 0) != 0) {
   HEAPF64[$4 >> 3] = +HEAPF64[$c >> 3];
  }
  if (($5 | 0) != 0) {
   HEAPF64[$5 >> 3] = +HEAPF64[$s >> 3];
  }
  $ak = +HEAPF64[$c >> 3] * (+HEAPF64[$c >> 3] * $ap - +HEAPF64[$s >> 3] * $bp) + +HEAPF64[$s >> 3] * (+HEAPF64[$s >> 3] * $aq - +HEAPF64[$c >> 3] * $bp);
  $bk = +HEAPF64[$c >> 3] * (+HEAPF64[$s >> 3] * $ap + +HEAPF64[$c >> 3] * $bp) - +HEAPF64[$s >> 3] * (+HEAPF64[$s >> 3] * $bp + +HEAPF64[$c >> 3] * $aq);
  $ap = +HEAPF64[$s >> 3] * (+HEAPF64[$s >> 3] * $ap + +HEAPF64[$c >> 3] * $bp) + +HEAPF64[$c >> 3] * (+HEAPF64[$s >> 3] * $bp + +HEAPF64[$c >> 3] * $aq);
  HEAPF64[$2 >> 3] = $ak;
  HEAPF64[$3 >> 3] = $bk;
  HEAPF64[$2 + 8 >> 3] = $ap;
  STACKTOP = sp;
  return;
 }
 $bq = +HEAPF64[$3 + 8 >> 3];
 $k = 0;
 while (1) {
  if (!($k >>> 0 < ($1 - 1 | 0) >>> 0)) {
   break;
  }
  _create_givens715($x, $z, $c1, $s2);
  if (($4 | 0) != 0) {
   HEAPF64[$4 + ($k << 3) >> 3] = +HEAPF64[$c1 >> 3];
  }
  if (($5 | 0) != 0) {
   HEAPF64[$5 + ($k << 3) >> 3] = +HEAPF64[$s2 >> 3];
  }
  $bk1 = +HEAPF64[$c1 >> 3] * $bk - +HEAPF64[$s2 >> 3] * $zk;
  $ak = +HEAPF64[$c1 >> 3] * (+HEAPF64[$c1 >> 3] * $ap - +HEAPF64[$s2 >> 3] * $bp) + +HEAPF64[$s2 >> 3] * (+HEAPF64[$s2 >> 3] * $aq - +HEAPF64[$c1 >> 3] * $bp);
  $bk = +HEAPF64[$c1 >> 3] * (+HEAPF64[$s2 >> 3] * $ap + +HEAPF64[$c1 >> 3] * $bp) - +HEAPF64[$s2 >> 3] * (+HEAPF64[$s2 >> 3] * $bp + +HEAPF64[$c1 >> 3] * $aq);
  $zk = (-0.0 - +HEAPF64[$s2 >> 3]) * $bq;
  $ap = +HEAPF64[$s2 >> 3] * (+HEAPF64[$s2 >> 3] * $ap + +HEAPF64[$c1 >> 3] * $bp) + +HEAPF64[$c1 >> 3] * (+HEAPF64[$s2 >> 3] * $bp + +HEAPF64[$c1 >> 3] * $aq);
  $bp = +HEAPF64[$c1 >> 3] * $bq;
  if ($k >>> 0 < ($1 - 2 | 0) >>> 0) {
   $aq = +HEAPF64[$2 + ($k + 2 << 3) >> 3];
  }
  if ($k >>> 0 < ($1 - 3 | 0) >>> 0) {
   $bq = +HEAPF64[$3 + ($k + 2 << 3) >> 3];
  }
  HEAPF64[$2 + ($k << 3) >> 3] = $ak;
  if ($k >>> 0 > 0 >>> 0) {
   HEAPF64[$3 + ($k - 1 << 3) >> 3] = $bk1;
  }
  if ($k >>> 0 < ($1 - 2 | 0) >>> 0) {
   HEAPF64[$3 + ($k + 1 << 3) >> 3] = $bp;
  }
  $x = $bk;
  $z = $zk;
  $k = $k + 1 | 0;
 }
 HEAPF64[$2 + ($k << 3) >> 3] = $ap;
 HEAPF64[$3 + ($k - 1 << 3) >> 3] = $bk;
 STACKTOP = sp;
 return;
}
function _read_pipegap() {
 var $i = 0, $j = 0, $k = 0, $f_knee = 0, $f_r = 0, $3 = 0.0, $monitor_0 = 0, $8 = 0.0, $19 = 0, $20 = 0, $23 = 0.0, $25 = 0.0, $35 = 0, $37 = 0, $41 = 0, $57 = 0, $64 = 0, $65 = 0, $68 = 0.0, $70 = 0.0, $80 = 0, $82 = 0, $86 = 0, $88 = 0, $108 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 40 | 0;
 $i = sp | 0;
 $j = sp + 8 | 0;
 $k = sp + 16 | 0;
 $f_knee = sp + 24 | 0;
 $f_r = sp + 32 | 0;
 _next_double($f_knee) | 0;
 _next_double($f_r) | 0;
 $3 = +HEAPF64[$f_knee >> 3];
 if ($3 < 0.0) {
  HEAPF64[$f_knee >> 3] = $3 * -1.0;
  $monitor_0 = 1;
 } else {
  $monitor_0 = 0;
 }
 $8 = +HEAPF64[$f_r >> 3];
 if ($8 < 0.0) {
  HEAPF64[$f_r >> 3] = $8 * -1.0;
 }
 _read_pairs() | 0;
 _read_poles() | 0;
 _reset_assignments() | 0;
 if ((_next_assignment($i, $j, $k) | 0) != 0) {
  STACKTOP = sp;
  return 0;
 }
 if (($monitor_0 | 0) == 0) {
  do {
   $19 = _malloc(80) | 0;
   $20 = $19;
   if (($19 | 0) == 0) {
    $57 = HEAP32[3164] | 0;
    if (($57 | 0) != 0) {
     _fwrite(6040, 27, 1, $57 | 0) | 0;
    }
    _oe_exit(2);
   } else {
    $23 = +HEAPF64[$f_knee >> 3];
    HEAPF64[$19 >> 3] = $23;
    $25 = +HEAPF64[$f_r >> 3];
    HEAPF64[$19 + 16 >> 3] = $25;
    HEAPF64[$19 + 8 >> 3] = $23 / $25;
    HEAPF64[$19 + 32 >> 3] = 1.0 / $25;
    $35 = _find_pole(HEAP32[$i >> 2] | 0) | 0;
    $37 = $19 + 68 | 0;
    HEAP32[$37 >> 2] = $35;
    if (($35 | 0) == 0) {
     _oe_exit(15);
     $41 = HEAP32[$37 >> 2] | 0;
    } else {
     $41 = $35;
    }
    HEAP32[$41 + 8 >> 2] = 1;
    HEAP32[$19 + 60 >> 2] = HEAP32[$j >> 2];
    HEAP32[$19 + 64 >> 2] = HEAP32[$k >> 2];
    HEAPF64[$19 + 24 >> 3] = 0.0;
    _memset($19 + 40 | 0, 0, 20) | 0;
    HEAP32[$19 + 72 >> 2] = 0;
    HEAP32[(HEAP32[2986] | 0) + 72 >> 2] = $20;
    HEAP32[2986] = $20;
   }
  } while ((_next_assignment($i, $j, $k) | 0) == 0);
  STACKTOP = sp;
  return 0;
 } else {
  do {
   $64 = _malloc(80) | 0;
   $65 = $64;
   if (($64 | 0) == 0) {
    $108 = HEAP32[3164] | 0;
    if (($108 | 0) != 0) {
     _fwrite(6040, 27, 1, $108 | 0) | 0;
    }
    _oe_exit(2);
   } else {
    $68 = +HEAPF64[$f_knee >> 3];
    HEAPF64[$64 >> 3] = $68;
    $70 = +HEAPF64[$f_r >> 3];
    HEAPF64[$64 + 16 >> 3] = $70;
    HEAPF64[$64 + 8 >> 3] = $68 / $70;
    HEAPF64[$64 + 32 >> 3] = 1.0 / $70;
    $80 = _find_pole(HEAP32[$i >> 2] | 0) | 0;
    $82 = $64 + 68 | 0;
    HEAP32[$82 >> 2] = $80;
    if (($80 | 0) == 0) {
     _oe_exit(15);
     $86 = HEAP32[$82 >> 2] | 0;
    } else {
     $86 = $80;
    }
    HEAP32[$86 + 8 >> 2] = 1;
    $88 = HEAP32[$j >> 2] | 0;
    HEAP32[$64 + 60 >> 2] = $88;
    HEAP32[$64 + 64 >> 2] = HEAP32[$k >> 2];
    HEAPF64[$64 + 24 >> 3] = 0.0;
    _memset($64 + 40 | 0, 0, 20) | 0;
    HEAP32[$64 + 72 >> 2] = 0;
    HEAP32[(HEAP32[2986] | 0) + 72 >> 2] = $65;
    HEAP32[2986] = $65;
    _add_ammeter(HEAP32[$i >> 2] | 0, $88, -5, $64 + 48 | 0) | 0;
   }
  } while ((_next_assignment($i, $j, $k) | 0) == 0);
  STACKTOP = sp;
  return 0;
 }
 return 0;
}
function _read_resistor() {
 var $i = 0, $j = 0, $k = 0, $r = 0, $2 = 0.0, $y_0 = 0.0, $12 = 0, $13 = 0, $19 = 0, $21 = 0, $25 = 0, $26 = 0, $30 = 0, $33 = 0, $46 = 0.0, $48 = 0, $vdc_0 = 0.0, $vdc_1 = 0.0, $61 = 0, $62 = 0, $66 = 0, $67 = 0, $70 = 0, $76 = 0.0, $77 = 0, $83 = 0, $98 = 0, $104 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32 | 0;
 $i = sp | 0;
 $j = sp + 8 | 0;
 $k = sp + 16 | 0;
 $r = sp + 24 | 0;
 _next_double($r) | 0;
 $2 = +HEAPF64[$r >> 3];
 if ($2 != 0.0) {
  $y_0 = 1.0 / $2;
 } else {
  $y_0 = 1.0e3;
 }
 _read_pairs() | 0;
 _read_poles() | 0;
 _reset_assignments() | 0;
 if ((_next_assignment($i, $j, $k) | 0) != 0) {
  STACKTOP = sp;
  return 0;
 }
 do {
  $12 = _malloc(24) | 0;
  $13 = $12;
  do {
   if (($12 | 0) == 0) {
    $104 = HEAP32[3164] | 0;
    if (($104 | 0) != 0) {
     _fwrite(7384, 28, 1, $104 | 0) | 0;
    }
    _oe_exit(2);
   } else {
    HEAPF64[$12 >> 3] = +HEAPF64[$r >> 3];
    $19 = _find_pole(HEAP32[$i >> 2] | 0) | 0;
    $21 = $12 + 16 | 0;
    HEAP32[$21 >> 2] = $19;
    if (($19 | 0) == 0) {
     _oe_exit(15);
     $25 = HEAP32[$21 >> 2] | 0;
    } else {
     $25 = $19;
    }
    $26 = _find_pole_defn($25) | 0;
    HEAP32[$25 + 8 >> 2] = 1;
    _add_y($25, HEAP32[$j >> 2] | 0, HEAP32[$k >> 2] | 0, $y_0);
    $30 = HEAP32[$j >> 2] | 0;
    HEAP32[$12 + 8 >> 2] = $30;
    $33 = HEAP32[$k >> 2] | 0;
    HEAP32[$12 + 12 >> 2] = $33;
    HEAP32[$12 + 20 >> 2] = 0;
    HEAP32[(HEAP32[2970] | 0) + 20 >> 2] = $13;
    HEAP32[2970] = $13;
    if (($30 | 0) > 0) {
     $46 = +_gsl_vector_get(HEAP32[$26 + 36 >> 2] | 0, $30 - 1 | 0) + 0.0;
     $vdc_0 = $46;
     $48 = HEAP32[$k >> 2] | 0;
    } else {
     $vdc_0 = 0.0;
     $48 = $33;
    }
    if (($48 | 0) > 0) {
     $vdc_1 = $vdc_0 - +_gsl_vector_get(HEAP32[$26 + 36 >> 2] | 0, $48 - 1 | 0);
    } else {
     $vdc_1 = $vdc_0;
    }
    if ($vdc_1 != 0.0) {
     $61 = _malloc(12) | 0;
     $62 = $61;
     if (($61 | 0) == 0) {
      $98 = HEAP32[3164] | 0;
      if (($98 | 0) != 0) {
       _fwrite(9296, 26, 1, $98 | 0) | 0;
      }
      _oe_exit(2);
      break;
     }
     $66 = _gsl_vector_calloc(HEAP32[3122] | 0) | 0;
     $67 = $61;
     HEAP32[$67 >> 2] = $66;
     if (($66 | 0) == 0) {
      $70 = HEAP32[3164] | 0;
      if (($70 | 0) != 0) {
       _fwrite(4592, 31, 1, $70 | 0) | 0;
      }
      _oe_exit(2);
     }
     $76 = $y_0 * $vdc_1;
     $77 = HEAP32[$j >> 2] | 0;
     if (($77 | 0) > 0) {
      _gsl_vector_set(HEAP32[$67 >> 2] | 0, $77 - 1 | 0, $76);
     }
     $83 = HEAP32[$k >> 2] | 0;
     if (($83 | 0) > 0) {
      _gsl_vector_set(HEAP32[$67 >> 2] | 0, $83 - 1 | 0, -0.0 - $76);
     }
     HEAP32[$61 + 4 >> 2] = HEAP32[$21 >> 2];
     HEAP32[$61 + 8 >> 2] = 0;
     HEAP32[(HEAP32[2900] | 0) + 8 >> 2] = $62;
     HEAP32[2900] = $62;
    }
   }
  } while (0);
 } while ((_next_assignment($i, $j, $k) | 0) == 0);
 STACKTOP = sp;
 return 0;
}
function _build_rthev($ptr) {
 $ptr = $ptr | 0;
 var $rhs = 0, $1 = 0, $3 = 0, $5 = 0, $8 = 0, $9 = 0, $10 = 0, $11 = 0, $12 = 0, $14 = 0, $i_054 = 0, $18 = 0, $21 = 0, $29 = 0, $31 = 0, $j_050 = 0, $47 = 0, $49 = 0, $54 = 0, $56 = 0, $i_148 = 0, $j_146 = 0, $60 = 0, $62 = 0, $64 = 0, $70 = 0.0, $72 = 0, $81 = 0.0, $83 = 0, $86 = 0, $87 = 0, $89 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24 | 0;
 $rhs = sp | 0;
 $1 = $ptr + 48 | 0;
 _gsl_matrix_set_zero(HEAP32[$1 >> 2] | 0);
 $3 = $ptr + 52 | 0;
 _gsl_matrix_set_zero(HEAP32[$3 >> 2] | 0);
 $5 = $ptr + 12 | 0;
 if ((HEAP32[$5 >> 2] | 0) <= 0) {
  STACKTOP = sp;
  return;
 }
 $8 = $ptr + 16 | 0;
 $9 = $ptr + 20 | 0;
 $10 = $ptr + 44 | 0;
 $11 = $ptr + 36 | 0;
 $12 = $rhs | 0;
 $i_054 = 0;
 do {
  $18 = HEAP32[(HEAP32[$8 >> 2] | 0) + ($i_054 << 2) >> 2] | 0;
  if (($18 | 0) == 0) {
   $21 = HEAP32[3164] | 0;
   if (($21 | 0) != 0) {
    _fwrite(2944, 50, 1, $21 | 0) | 0;
   }
   _oe_exit(16);
  }
  _gsl_vector_set_zero(HEAP32[$9 >> 2] | 0);
  $29 = HEAP32[$18 + 144 >> 2] | 0;
  $31 = HEAP32[$18 + 148 >> 2] | 0;
  if (($29 | 0) > 0) {
   _gsl_vector_set(HEAP32[$9 >> 2] | 0, $29, 1.0);
  }
  if (($31 | 0) > 0) {
   _gsl_vector_set(HEAP32[$9 >> 2] | 0, $31, -1.0);
  }
  _gsl_vector_subvector($rhs, HEAP32[$9 >> 2] | 0, 1, HEAP32[3122] | 0);
  _gsl_linalg_LU_svx(HEAP32[$10 >> 2] | 0, HEAP32[$11 >> 2] | 0, $12) | 0;
  if ((HEAP32[3122] | 0) > 0) {
   $j_050 = 0;
   while (1) {
    $47 = HEAP32[$1 >> 2] | 0;
    $49 = $j_050 + 1 | 0;
    _gsl_matrix_set($47, $i_054, $j_050, +_gsl_vector_get(HEAP32[$9 >> 2] | 0, $49));
    if (($49 | 0) < (HEAP32[3122] | 0)) {
     $j_050 = $49;
    } else {
     break;
    }
   }
  }
  $i_054 = $i_054 + 1 | 0;
  $54 = HEAP32[$5 >> 2] | 0;
 } while (($i_054 | 0) < ($54 | 0));
 if (($54 | 0) <= 0) {
  STACKTOP = sp;
  return;
 }
 $14 = $ptr + 16 | 0;
 $i_148 = 0;
 $56 = $54;
 while (1) {
  if (($56 | 0) > 0) {
   $j_146 = 0;
   while (1) {
    $60 = HEAP32[(HEAP32[$14 >> 2] | 0) + ($j_146 << 2) >> 2] | 0;
    $62 = HEAP32[$60 + 144 >> 2] | 0;
    $64 = HEAP32[$60 + 148 >> 2] | 0;
    if (($62 | 0) > 0) {
     $70 = +HEAPF64[(_gsl_matrix_ptr(HEAP32[$1 >> 2] | 0, $i_148, $62 - 1 | 0) | 0) >> 3];
     $72 = _gsl_matrix_ptr(HEAP32[$3 >> 2] | 0, $i_148, $j_146) | 0;
     HEAPF64[$72 >> 3] = $70 + +HEAPF64[$72 >> 3];
    }
    if (($64 | 0) > 0) {
     $81 = +HEAPF64[(_gsl_matrix_ptr(HEAP32[$1 >> 2] | 0, $i_148, $64 - 1 | 0) | 0) >> 3];
     $83 = _gsl_matrix_ptr(HEAP32[$3 >> 2] | 0, $i_148, $j_146) | 0;
     HEAPF64[$83 >> 3] = +HEAPF64[$83 >> 3] - $81;
    }
    $86 = $j_146 + 1 | 0;
    $87 = HEAP32[$5 >> 2] | 0;
    if (($86 | 0) < ($87 | 0)) {
     $j_146 = $86;
    } else {
     $89 = $87;
     break;
    }
   }
  } else {
   $89 = $56;
  }
  $i_148 = $i_148 + 1 | 0;
  if (($i_148 | 0) >= ($89 | 0)) {
   break;
  } else {
   $56 = $89;
  }
 }
 STACKTOP = sp;
 return;
}
function _WriteTextHeader($head) {
 $head = $head | 0;
 var $5 = 0, $7 = 0, $9 = 0, $16 = 0, $24 = 0, $31 = 0, $38 = 0, $45 = 0, $52 = 0, $55 = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 _fprintf(HEAP32[3206] | 0, 2712, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = HEAP8[2528] | 0 ? 9 : 44, tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 $5 = HEAP32[$head + 32 >> 2] | 0;
 if (($5 | 0) == 0) {
  STACKTOP = sp;
  return;
 } else {
  $7 = $5;
 }
 do {
  $9 = HEAP32[$7 + 4 >> 2] | 0;
  L5 : do {
   if (($9 | 0) > -1) {
    $16 = HEAP32[$7 >> 2] | 0;
    _fprintf(HEAP32[3206] | 0, 11144, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 24 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[$7 + 8 >> 2], HEAP32[tempVarArgs + 8 >> 2] = $16, HEAP32[tempVarArgs + 16 >> 2] = $9, tempVarArgs) | 0) | 0;
    STACKTOP = tempVarArgs;
   } else {
    switch ($9 | 0) {
    case -1:
     {
      $24 = HEAP32[$7 >> 2] | 0;
      _fprintf(HEAP32[3206] | 0, 10360, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[$7 + 8 >> 2], HEAP32[tempVarArgs + 8 >> 2] = $24, tempVarArgs) | 0) | 0;
      STACKTOP = tempVarArgs;
      break L5;
      break;
     }
    case -2:
     {
      $31 = HEAP32[$7 >> 2] | 0;
      _fprintf(HEAP32[3206] | 0, 9888, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[$7 + 8 >> 2], HEAP32[tempVarArgs + 8 >> 2] = $31, tempVarArgs) | 0) | 0;
      STACKTOP = tempVarArgs;
      break L5;
      break;
     }
    case -3:
     {
      $38 = HEAP32[$7 >> 2] | 0;
      _fprintf(HEAP32[3206] | 0, 9584, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[$7 + 8 >> 2], HEAP32[tempVarArgs + 8 >> 2] = $38, tempVarArgs) | 0) | 0;
      STACKTOP = tempVarArgs;
      break L5;
      break;
     }
    case -4:
     {
      $45 = HEAP32[$7 >> 2] | 0;
      _fprintf(HEAP32[3206] | 0, 9360, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[$7 + 8 >> 2], HEAP32[tempVarArgs + 8 >> 2] = $45, tempVarArgs) | 0) | 0;
      STACKTOP = tempVarArgs;
      break L5;
      break;
     }
    case -5:
     {
      $52 = HEAP32[$7 >> 2] | 0;
      _fprintf(HEAP32[3206] | 0, 9128, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[$7 + 8 >> 2], HEAP32[tempVarArgs + 8 >> 2] = $52, tempVarArgs) | 0) | 0;
      STACKTOP = tempVarArgs;
      break L5;
      break;
     }
    default:
     {
      break L5;
     }
    }
   }
  } while (0);
  $55 = $7 + 32 | 0;
  if ((HEAP32[$55 >> 2] | 0) == 0) {
   _fputc(10, HEAP32[3206] | 0) | 0;
  } else {
   _fputc((HEAP8[2528] | 0 ? 9 : 44) | 0, HEAP32[3206] | 0) | 0;
  }
  $7 = HEAP32[$55 >> 2] | 0;
 } while (($7 | 0) != 0);
 STACKTOP = sp;
 return;
}
function _check_arrester($ptr) {
 $ptr = $ptr | 0;
 var $2 = 0, $4 = 0, $6 = 0, $7 = 0, $9 = 0.0, $12 = 0.0, $13 = 0, $14 = 0, $19 = 0.0, $23 = 0.0, $27 = 0, $28 = 0.0, $_pn = 0.0, $vr_0 = 0.0, $35 = 0.0, $39 = 0, $44 = 0, $48 = 0.0, $53 = 0.0, $56 = 0.0, $60 = 0.0, $61 = 0, $64 = 0.0, $storemerge = 0.0, $70 = 0.0, $71 = 0, $79 = 0.0, $87 = 0.0, $95 = 0.0, $98 = 0.0, $101 = 0.0, $104 = 0.0, $107 = 0.0, $109 = 0;
 $2 = HEAP32[$ptr + 164 >> 2] | 0;
 $4 = HEAP32[$ptr + 156 >> 2] | 0;
 $6 = HEAP32[$ptr + 160 >> 2] | 0;
 $7 = $2 + 20 | 0;
 $9 = +_gsl_vector_get(HEAP32[$7 >> 2] | 0, $4);
 $12 = $9 - +_gsl_vector_get(HEAP32[$7 >> 2] | 0, $6);
 $13 = $12 > 0.0;
 $14 = $ptr + 152 | 0;
 if ((HEAP32[$14 >> 2] | 0) == 0) {
  $87 = +Math_abs(+$12);
  if (!($87 > +HEAPF64[$ptr + 32 >> 3])) {
   return;
  }
  HEAP32[$14 >> 2] = 1;
  _add_y($2, $4, $6, +HEAPF64[$ptr + 88 >> 3]);
  $95 = +HEAPF64[$ptr + 24 >> 3];
  HEAPF64[$ptr + 8 >> 3] = $95;
  $98 = +HEAPF64[$ptr + 120 >> 3];
  if ($13) {
   $101 = $95 * (-0.0 - $98);
   HEAPF64[$ptr + 104 >> 3] = $101;
   $107 = $101;
  } else {
   $104 = $95 * $98;
   HEAPF64[$ptr + 104 >> 3] = $104;
   $107 = $104;
  }
  HEAP32[2964] = 0;
  HEAPF64[$ptr + 112 >> 3] = $107;
  $109 = $ptr + 72 | 0;
  if (!(+HEAPF64[$109 >> 3] < +HEAPF64[323])) {
   return;
  }
  HEAPF64[$109 >> 3] = +HEAPF64[4];
  return;
 }
 $19 = +HEAPF64[$ptr + 88 >> 3];
 $23 = $12 * $19 + +HEAPF64[$ptr + 112 >> 3];
 HEAPF64[$ptr + 144 >> 3] = $23;
 $27 = $ptr + 8 | 0;
 $28 = +HEAPF64[$27 >> 3];
 if ($13) {
  $_pn = $23 + $28;
 } else {
  $_pn = $23 - $28;
 }
 $vr_0 = +HEAPF64[$ptr + 40 >> 3] * $_pn;
 $35 = +HEAPF64[$ptr + 16 >> 3];
 HEAPF64[$27 >> 3] = $35;
 $39 = $ptr + 64 | 0;
 HEAPF64[$39 >> 3] = +HEAPF64[$39 >> 3] + $vr_0 * $23 * +HEAPF64[323];
 $44 = $ptr + 48 | 0;
 HEAPF64[$44 >> 3] = +HEAPF64[$44 >> 3] + $23 * +HEAPF64[323];
 $48 = +HEAPF64[$ptr + 128 >> 3];
 if ($48 > 0.0) {
  $53 = $23 + ($12 - $vr_0) / $48;
  HEAPF64[$ptr + 96 >> 3] = $53;
  $56 = $53;
 } else {
  $56 = +HEAPF64[$ptr + 96 >> 3];
 }
 $60 = $56 * +HEAPF64[$ptr + 136 >> 3];
 $61 = $ptr + 104 | 0;
 HEAPF64[$61 >> 3] = $60;
 $64 = +HEAPF64[$ptr + 120 >> 3] * $35;
 if ($13) {
  $storemerge = $60 - $64;
 } else {
  $storemerge = $60 + $64;
 }
 HEAPF64[$61 >> 3] = $storemerge;
 $70 = +Math_abs(+$23);
 $71 = $ptr + 56 | 0;
 if ($70 > +Math_abs(+(+HEAPF64[$71 >> 3]))) {
  HEAPF64[$71 >> 3] = $23;
  HEAPF64[$ptr + 80 >> 3] = +HEAPF64[4];
 }
 $79 = +Math_abs(+$vr_0);
 if (!($79 < +HEAPF64[$ptr >> 3])) {
  return;
 }
 HEAP32[$14 >> 2] = 0;
 _add_y($2, $4, $6, -0.0 - $19);
 _memset($ptr + 96 | 0, 0, 16) | 0;
 return;
}
function _read_poles() {
 var $i = 0, $6 = 0, $storemerge10 = 0, $storemerge513 = 0, $storemerge617 = 0, $37 = 0, $45 = 0, $52 = 0, $60 = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $i = sp | 0;
 _gsl_vector_int_set_zero(HEAP32[2976] | 0);
 if ((_strcmp(_first_token() | 0, 800) | 0) != 0) {
  STACKTOP = sp;
  return 0;
 }
 $6 = _next_token() | 0;
 if ((_strcmp($6, 7120) | 0) == 0) {
  HEAP32[$i >> 2] = 0;
  if ((HEAP32[3120] | 0) > 0) {
   $storemerge10 = 0;
  } else {
   STACKTOP = sp;
   return 0;
  }
  do {
   _gsl_vector_int_set(HEAP32[2976] | 0, $storemerge10, 1);
   $storemerge10 = (HEAP32[$i >> 2] | 0) + 1 | 0;
   HEAP32[$i >> 2] = $storemerge10;
  } while (($storemerge10 | 0) < (HEAP32[3120] | 0));
  STACKTOP = sp;
  return 0;
 }
 if ((_strcmp($6, 5800) | 0) == 0) {
  HEAP32[$i >> 2] = 1;
  if ((HEAP32[3120] | 0) > 1) {
   $storemerge513 = 1;
  } else {
   STACKTOP = sp;
   return 0;
  }
  do {
   _gsl_vector_int_set(HEAP32[2976] | 0, $storemerge513, 1);
   $storemerge513 = (HEAP32[$i >> 2] | 0) + 2 | 0;
   HEAP32[$i >> 2] = $storemerge513;
  } while (($storemerge513 | 0) < (HEAP32[3120] | 0));
  STACKTOP = sp;
  return 0;
 }
 if ((_strcmp($6, 4848) | 0) == 0) {
  HEAP32[$i >> 2] = 0;
  if ((HEAP32[3120] | 0) > 0) {
   $storemerge617 = 0;
  } else {
   STACKTOP = sp;
   return 0;
  }
  do {
   _gsl_vector_int_set(HEAP32[2976] | 0, $storemerge617, 1);
   $storemerge617 = (HEAP32[$i >> 2] | 0) + 2 | 0;
   HEAP32[$i >> 2] = $storemerge617;
  } while (($storemerge617 | 0) < (HEAP32[3120] | 0));
  STACKTOP = sp;
  return 0;
 }
 $37 = _atoi($6) | 0;
 HEAP32[$i >> 2] = $37;
 if (($37 | 0) < 1 | ($37 | 0) > (HEAP32[3120] | 0)) {
  $45 = HEAP32[3164] | 0;
  if (($45 | 0) != 0) {
   _fprintf($45 | 0, 4240, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = $37, tempVarArgs) | 0) | 0;
   STACKTOP = tempVarArgs;
  }
  _oe_exit(15);
 } else {
  _gsl_vector_int_set(HEAP32[2976] | 0, $37 - 1 | 0, 1);
 }
 if ((_next_int($i) | 0) != 0) {
  STACKTOP = sp;
  return 0;
 }
 do {
  $52 = HEAP32[$i >> 2] | 0;
  if (($52 | 0) < 1 | ($52 | 0) > (HEAP32[3120] | 0)) {
   $60 = HEAP32[3164] | 0;
   if (($60 | 0) != 0) {
    _fprintf($60 | 0, 4240, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = $52, tempVarArgs) | 0) | 0;
    STACKTOP = tempVarArgs;
   }
   _oe_exit(15);
  } else {
   _gsl_vector_int_set(HEAP32[2976] | 0, $52 - 1 | 0, 1);
  }
 } while ((_next_int($i) | 0) == 0);
 STACKTOP = sp;
 return 0;
}
function _gsl_linalg_symmtd_unpack($A, $tau, $Q, $diag, $sdiag) {
 $A = $A | 0;
 $tau = $tau | 0;
 $Q = $Q | 0;
 $diag = $diag | 0;
 $sdiag = $sdiag | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $N = 0, $i = 0, $c = 0, $h = 0, $ti = 0.0, $m = 0, $79 = 0, $152 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 72 | 0;
 $c = sp | 0;
 $h = sp + 24 | 0;
 $m = sp + 48 | 0;
 $2 = $A;
 $3 = $tau;
 $4 = $Q;
 $5 = $diag;
 $6 = $sdiag;
 if ((HEAP32[$2 >> 2] | 0) != (HEAP32[$2 + 4 >> 2] | 0)) {
  _gsl_error(5648, 8592, 132, 20);
  $1 = 20;
  $152 = $1;
  STACKTOP = sp;
  return $152 | 0;
 }
 if (((HEAP32[$3 >> 2] | 0) + 1 | 0) != (HEAP32[$2 >> 2] | 0)) {
  _gsl_error(6952, 8592, 136, 19);
  $1 = 19;
  $152 = $1;
  STACKTOP = sp;
  return $152 | 0;
 }
 if ((HEAP32[$4 >> 2] | 0) == (HEAP32[$2 >> 2] | 0)) {
  if ((HEAP32[$4 + 4 >> 2] | 0) == (HEAP32[$2 >> 2] | 0)) {
   if ((HEAP32[$5 >> 2] | 0) != (HEAP32[$2 >> 2] | 0)) {
    _gsl_error(4176, 8592, 144, 19);
    $1 = 19;
    $152 = $1;
    STACKTOP = sp;
    return $152 | 0;
   }
   if (((HEAP32[$6 >> 2] | 0) + 1 | 0) != (HEAP32[$2 >> 2] | 0)) {
    _gsl_error(3768, 8592, 148, 19);
    $1 = 19;
    $152 = $1;
    STACKTOP = sp;
    return $152 | 0;
   }
   $N = HEAP32[$2 >> 2] | 0;
   _gsl_matrix_set_identity($4);
   $i = $N - 2 | 0;
   while (1) {
    $79 = $i;
    $i = $79 - 1 | 0;
    if (!($79 >>> 0 > 0 >>> 0)) {
     break;
    }
    _gsl_matrix_const_column($c, $2, $i);
    _gsl_vector_const_subvector($h, $c | 0, $i + 1 | 0, $N - ($i + 1) | 0);
    $ti = +_gsl_vector_get($3, $i);
    _gsl_matrix_submatrix($m, $4, $i + 1 | 0, $i + 1 | 0, $N - ($i + 1) | 0, $N - ($i + 1) | 0);
    _gsl_linalg_householder_hm($ti, $h | 0, $m | 0) | 0;
   }
   $i = 0;
   while (1) {
    if (!($i >>> 0 < $N >>> 0)) {
     break;
    }
    _gsl_vector_set($5, $i, +_gsl_matrix_get($2, $i, $i));
    $i = $i + 1 | 0;
   }
   $i = 0;
   while (1) {
    if (!($i >>> 0 < ($N - 1 | 0) >>> 0)) {
     break;
    }
    _gsl_vector_set($6, $i, +_gsl_matrix_get($2, $i + 1 | 0, $i));
    $i = $i + 1 | 0;
   }
   $1 = 0;
   $152 = $1;
   STACKTOP = sp;
   return $152 | 0;
  }
 }
 _gsl_error(4712, 8592, 140, 19);
 $1 = 19;
 $152 = $1;
 STACKTOP = sp;
 return $152 | 0;
}
function _time_step_loops($answers) {
 $answers = $answers | 0;
 var $40 = 0.0, $47 = 0;
 HEAPF64[4] = 0.0;
 HEAP32[2888] = 0;
 HEAP32[3194] = 0;
 if ((HEAP32[3206] | 0) != 0) {
  _InitializePlotOutput(HEAP32[3158] | 0, +HEAPF64[323], +HEAPF64[1433]);
 }
 _do_all_monitors(24);
 do {
  HEAP32[2964] = 0;
  do {
   _do_all_poles(30);
   _do_all_surges(82);
   _do_all_steepfronts(84);
   _do_all_sources(2);
   _do_all_grounds(20);
   if ((HEAP32[2876] | 0) == 0) {
    _do_all_lines(62);
    _do_all_poles(36);
   } else {
    _do_all_lines(6);
   }
   _do_all_arresters(130);
   _do_all_pipegaps(116);
   _do_all_inductors(22);
   _do_all_capacitors(50);
   _do_all_poles(104);
   _do_all_poles(96);
   HEAP32[2964] = 1;
   _do_all_arresters(76);
   _do_all_pipegaps(138);
  } while ((HEAP32[2964] | 0) == 0);
  _do_all_grounds(64);
  _do_all_insulators(54);
  _do_all_lpms(40);
  _do_all_inductors(68);
  _do_all_arresters(14);
  _do_all_arrbezs(44);
  _do_all_capacitors(58);
  _do_all_customers(10);
  if ((HEAP32[2876] | 0) == 0) {
   _do_all_poles(108);
   _do_all_lines(94);
  } else {
   _do_all_lines(114);
  }
  if ((HEAP32[3206] | 0) == 0) {
   _do_all_meters(126);
  } else {
   _WritePlotTimeStep(HEAP32[3158] | 0, +HEAPF64[4]);
  }
  _do_all_monitors(122);
  if (!((HEAP32[2872] | 0) == 0 | (HEAP32[3196] | 0) != 0)) {
   if (!(+HEAPF64[4] < +HEAPF64[322])) {
    _change_time_step();
   }
  }
  $40 = +HEAPF64[323] + +HEAPF64[4];
  HEAPF64[4] = $40;
  HEAP32[2888] = (HEAP32[2888] | 0) + 1;
 } while ($40 <= +HEAPF64[1433] & (HEAP32[3194] | 0) == 0);
 $47 = HEAP32[3164] | 0;
 if (($47 | 0) != 0) {
  _fputc(10, $47 | 0) | 0;
 }
 HEAPF64[99] = 0.0;
 HEAPF64[326] = 0.0;
 HEAPF64[329] = 0.0;
 HEAPF64[313] = 0.0;
 HEAPF64[1434] = 0.0;
 _do_all_arresters(60);
 _do_all_pipegaps(110);
 _do_all_insulators(26);
 _do_all_lpms(88);
 _do_all_arrbezs(56);
 HEAPF64[$answers >> 3] = +HEAPF64[1434];
 HEAPF64[$answers + 8 >> 3] = +HEAPF64[313];
 HEAPF64[$answers + 24 >> 3] = +HEAPF64[329];
 HEAPF64[$answers + 16 >> 3] = +HEAPF64[326];
 HEAPF64[$answers + 32 >> 3] = +HEAPF64[99];
 _do_all_monitors(120);
 if ((HEAP32[3206] | 0) == 0) {
  return;
 }
 _FinalizePlotHeader(+HEAPF64[4], HEAP32[2888] | 0);
 return;
}
function _read_lpm() {
 var $i = 0, $j = 0, $k = 0, $f_cfo = 0, $f_e0 = 0, $f_k = 0, $4 = 0.0, $flash_mode_0 = 0, $14 = 0, $15 = 0, $18 = 0.0, $27 = 0, $29 = 0, $33 = 0, $34 = 0, $35 = 0.0, $47 = 0, $53 = 0, $55 = 0, $58 = 0, $71 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48 | 0;
 $i = sp | 0;
 $j = sp + 8 | 0;
 $k = sp + 16 | 0;
 $f_cfo = sp + 24 | 0;
 $f_e0 = sp + 32 | 0;
 $f_k = sp + 40 | 0;
 _next_double($f_cfo) | 0;
 _next_double($f_e0) | 0;
 _next_double($f_k) | 0;
 $4 = +HEAPF64[$f_cfo >> 3];
 if ($4 < 0.0) {
  HEAPF64[$f_cfo >> 3] = $4 * -1.0;
  $flash_mode_0 = 2;
 } else {
  $flash_mode_0 = 0;
 }
 _read_pairs() | 0;
 _read_poles() | 0;
 _reset_assignments() | 0;
 if ((_next_assignment($i, $j, $k) | 0) != 0) {
  STACKTOP = sp;
  return 0;
 }
 do {
  $14 = _malloc(104) | 0;
  $15 = $14;
  if (($14 | 0) == 0) {
   $71 = HEAP32[3164] | 0;
   if (($71 | 0) != 0) {
    _fwrite(9624, 23, 1, $71 | 0) | 0;
   }
   _oe_exit(2);
  } else {
   $18 = +HEAPF64[$f_cfo >> 3];
   HEAPF64[$14 >> 3] = $18;
   HEAPF64[$14 + 8 >> 3] = +HEAPF64[$f_e0 >> 3];
   HEAPF64[$14 + 16 >> 3] = +HEAPF64[$f_k >> 3];
   $27 = $14 + 80 | 0;
   HEAP32[$27 >> 2] = 0;
   $29 = $14 + 84 | 0;
   HEAP32[$29 >> 2] = $flash_mode_0;
   $33 = ~~(+HEAPF64[1433] / +HEAPF64[323]);
   $34 = $33 + 2 | 0;
   $35 = $18 / 56.0e4;
   HEAPF64[$14 + 24 >> 3] = $35;
   HEAPF64[$14 + 32 >> 3] = $35;
   HEAPF64[$14 + 40 >> 3] = $35;
   _memset($14 + 48 | 0, 0, 32) | 0;
   if (($flash_mode_0 | 0) != 2) {
    HEAP32[$29 >> 2] = 0;
   }
   $47 = _malloc($34 << 2) | 0;
   HEAP32[$27 >> 2] = $47;
   if (($34 | 0) > 0) {
    _memset($47 | 0, 0, ($33 << 2) + 8 | 0) | 0;
   }
   $53 = _find_pole(HEAP32[$i >> 2] | 0) | 0;
   $55 = $14 + 96 | 0;
   HEAP32[$55 >> 2] = $53;
   if (($53 | 0) == 0) {
    _oe_exit(15);
    $58 = HEAP32[$55 >> 2] | 0;
   } else {
    $58 = $53;
   }
   HEAP32[$58 + 8 >> 2] = 1;
   HEAP32[$14 + 88 >> 2] = HEAP32[$j >> 2];
   HEAP32[$14 + 92 >> 2] = HEAP32[$k >> 2];
   HEAP32[$14 + 100 >> 2] = 0;
   HEAP32[(HEAP32[3160] | 0) + 100 >> 2] = $15;
   HEAP32[3160] = $15;
  }
 } while ((_next_assignment($i, $j, $k) | 0) == 0);
 STACKTOP = sp;
 return 0;
}
function _next_assignment($next_i, $next_j, $next_k) {
 $next_i = $next_i | 0;
 $next_j = $next_j | 0;
 $next_k = $next_k | 0;
 var $1 = 0, $k_033 = 0, $j_032 = 0, $i_029 = 0, $11 = 0, $13 = 0, $k_127 = 0, $j_126 = 0, $14 = 0, $15 = 0, $k_2 = 0, $21 = 0, $22 = 0, $23 = 0, $25 = 0, $_08_i = 0, $28 = 0, $32 = 0, $k_3 = 0, $34 = 0, $_0 = 0;
 $1 = HEAP32[3212] | 0;
 L1 : do {
  if (($1 | 0) <= (HEAP32[3120] | 0)) {
   $i_029 = $1;
   $j_032 = HEAP32[3210] | 0;
   $k_033 = HEAP32[3208] | 0;
   L3 : while (1) {
    if ((_gsl_vector_int_get(HEAP32[2976] | 0, $i_029 - 1 | 0) | 0) > 0) {
     $11 = HEAP32[3122] | 0;
     if (($j_032 | 0) > ($11 | 0)) {
      $k_3 = $k_033;
     } else {
      $j_126 = $j_032;
      $k_127 = $k_033;
      $13 = $11;
      while (1) {
       $14 = $j_126 - 1 | 0;
       $k_2 = $k_127;
       $15 = $13;
       while (1) {
        if (($k_2 | 0) > ($15 | 0)) {
         break;
        }
        $21 = (_gsl_matrix_int_get(HEAP32[2992] | 0, $14, $k_2 - 1 | 0) | 0) > 0;
        $22 = $k_2 + 1 | 0;
        $23 = HEAP32[3122] | 0;
        if ($21) {
         break L3;
        } else {
         $k_2 = $22;
         $15 = $23;
        }
       }
       $32 = $j_126 + 1 | 0;
       if (($32 | 0) > ($15 | 0)) {
        $k_3 = 1;
        break;
       } else {
        $j_126 = $32;
        $k_127 = 1;
        $13 = $15;
       }
      }
     }
    } else {
     $k_3 = $k_033;
    }
    $34 = $i_029 + 1 | 0;
    if (($34 | 0) > (HEAP32[3120] | 0)) {
     break L1;
    } else {
     $i_029 = $34;
     $j_032 = 1;
     $k_033 = $k_3;
    }
   }
   $25 = ($23 | 0) > ($k_2 | 0);
   $_08_i = ($25 & 1 ^ 1) + $j_126 | 0;
   $28 = ($_08_i | 0) > ($23 | 0);
   HEAP32[3212] = ($28 & 1) + $i_029;
   HEAP32[3210] = $28 ? 1 : $_08_i;
   HEAP32[3208] = $25 ? $22 : 1;
   HEAP32[$next_i >> 2] = $i_029;
   HEAP32[$next_j >> 2] = $j_126;
   HEAP32[$next_k >> 2] = ($j_126 | 0) == ($k_2 | 0) ? 0 : $k_2;
   $_0 = 0;
   return $_0 | 0;
  }
 } while (0);
 HEAP32[$next_k >> 2] = 0;
 HEAP32[$next_j >> 2] = 0;
 HEAP32[$next_i >> 2] = 0;
 $_0 = 1;
 return $_0 | 0;
}
function _gsl_vector_const_subvector($agg_result, $v, $offset, $n) {
 $agg_result = $agg_result | 0;
 $v = $v | 0;
 $offset = $offset | 0;
 $n = $n | 0;
 var $1 = 0, $2 = 0, $3 = 0, $view = 0, $s = 0, $9 = 0, $10 = 0, $23 = 0, $24 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48 | 0;
 $view = sp | 0;
 $s = sp + 24 | 0;
 $1 = $v;
 $2 = $offset;
 $3 = $n;
 _memset($view | 0, 0, 20) | 0;
 if (($3 | 0) == 0) {
  _gsl_error(9960, 10728, 28, 4);
  $9 = $agg_result;
  $10 = $view;
  HEAP32[$9 >> 2] = HEAP32[$10 >> 2];
  HEAP32[$9 + 4 >> 2] = HEAP32[$10 + 4 >> 2];
  HEAP32[$9 + 8 >> 2] = HEAP32[$10 + 8 >> 2];
  HEAP32[$9 + 12 >> 2] = HEAP32[$10 + 12 >> 2];
  HEAP32[$9 + 16 >> 2] = HEAP32[$10 + 16 >> 2];
  STACKTOP = sp;
  return;
 }
 if (!(($2 + ($3 - 1) | 0) >>> 0 >= (HEAP32[$1 >> 2] | 0) >>> 0)) {
  _memset($s | 0, 0, 20) | 0;
  HEAP32[$s + 8 >> 2] = (HEAP32[$1 + 8 >> 2] | 0) + ((Math_imul(HEAP32[$1 + 4 >> 2] | 0, $2) | 0) << 3);
  HEAP32[$s >> 2] = $3;
  HEAP32[$s + 4 >> 2] = HEAP32[$1 + 4 >> 2];
  HEAP32[$s + 12 >> 2] = HEAP32[$1 + 12 >> 2];
  HEAP32[$s + 16 >> 2] = 0;
  $51 = $view | 0;
  $52 = $s;
  HEAP32[$51 >> 2] = HEAP32[$52 >> 2];
  HEAP32[$51 + 4 >> 2] = HEAP32[$52 + 4 >> 2];
  HEAP32[$51 + 8 >> 2] = HEAP32[$52 + 8 >> 2];
  HEAP32[$51 + 12 >> 2] = HEAP32[$52 + 12 >> 2];
  HEAP32[$51 + 16 >> 2] = HEAP32[$52 + 16 >> 2];
  $53 = $agg_result;
  $54 = $view;
  HEAP32[$53 >> 2] = HEAP32[$54 >> 2];
  HEAP32[$53 + 4 >> 2] = HEAP32[$54 + 4 >> 2];
  HEAP32[$53 + 8 >> 2] = HEAP32[$54 + 8 >> 2];
  HEAP32[$53 + 12 >> 2] = HEAP32[$54 + 12 >> 2];
  HEAP32[$53 + 16 >> 2] = HEAP32[$54 + 16 >> 2];
  STACKTOP = sp;
  return;
 }
 _gsl_error(8008, 10728, 34, 4);
 $23 = $agg_result;
 $24 = $view;
 HEAP32[$23 >> 2] = HEAP32[$24 >> 2];
 HEAP32[$23 + 4 >> 2] = HEAP32[$24 + 4 >> 2];
 HEAP32[$23 + 8 >> 2] = HEAP32[$24 + 8 >> 2];
 HEAP32[$23 + 12 >> 2] = HEAP32[$24 + 12 >> 2];
 HEAP32[$23 + 16 >> 2] = HEAP32[$24 + 16 >> 2];
 STACKTOP = sp;
 return;
}
function _gsl_vector_subvector($agg_result, $v, $offset, $n) {
 $agg_result = $agg_result | 0;
 $v = $v | 0;
 $offset = $offset | 0;
 $n = $n | 0;
 var $1 = 0, $2 = 0, $3 = 0, $view = 0, $s = 0, $9 = 0, $10 = 0, $23 = 0, $24 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48 | 0;
 $view = sp | 0;
 $s = sp + 24 | 0;
 $1 = $v;
 $2 = $offset;
 $3 = $n;
 _memset($view | 0, 0, 20) | 0;
 if (($3 | 0) == 0) {
  _gsl_error(9960, 10728, 28, 4);
  $9 = $agg_result;
  $10 = $view;
  HEAP32[$9 >> 2] = HEAP32[$10 >> 2];
  HEAP32[$9 + 4 >> 2] = HEAP32[$10 + 4 >> 2];
  HEAP32[$9 + 8 >> 2] = HEAP32[$10 + 8 >> 2];
  HEAP32[$9 + 12 >> 2] = HEAP32[$10 + 12 >> 2];
  HEAP32[$9 + 16 >> 2] = HEAP32[$10 + 16 >> 2];
  STACKTOP = sp;
  return;
 }
 if (!(($2 + ($3 - 1) | 0) >>> 0 >= (HEAP32[$1 >> 2] | 0) >>> 0)) {
  _memset($s | 0, 0, 20) | 0;
  HEAP32[$s + 8 >> 2] = (HEAP32[$1 + 8 >> 2] | 0) + ((Math_imul(HEAP32[$1 + 4 >> 2] | 0, $2) | 0) << 3);
  HEAP32[$s >> 2] = $3;
  HEAP32[$s + 4 >> 2] = HEAP32[$1 + 4 >> 2];
  HEAP32[$s + 12 >> 2] = HEAP32[$1 + 12 >> 2];
  HEAP32[$s + 16 >> 2] = 0;
  $51 = $view | 0;
  $52 = $s;
  HEAP32[$51 >> 2] = HEAP32[$52 >> 2];
  HEAP32[$51 + 4 >> 2] = HEAP32[$52 + 4 >> 2];
  HEAP32[$51 + 8 >> 2] = HEAP32[$52 + 8 >> 2];
  HEAP32[$51 + 12 >> 2] = HEAP32[$52 + 12 >> 2];
  HEAP32[$51 + 16 >> 2] = HEAP32[$52 + 16 >> 2];
  $53 = $agg_result;
  $54 = $view;
  HEAP32[$53 >> 2] = HEAP32[$54 >> 2];
  HEAP32[$53 + 4 >> 2] = HEAP32[$54 + 4 >> 2];
  HEAP32[$53 + 8 >> 2] = HEAP32[$54 + 8 >> 2];
  HEAP32[$53 + 12 >> 2] = HEAP32[$54 + 12 >> 2];
  HEAP32[$53 + 16 >> 2] = HEAP32[$54 + 16 >> 2];
  STACKTOP = sp;
  return;
 }
 _gsl_error(8008, 10728, 34, 4);
 $23 = $agg_result;
 $24 = $view;
 HEAP32[$23 >> 2] = HEAP32[$24 >> 2];
 HEAP32[$23 + 4 >> 2] = HEAP32[$24 + 4 >> 2];
 HEAP32[$23 + 8 >> 2] = HEAP32[$24 + 8 >> 2];
 HEAP32[$23 + 12 >> 2] = HEAP32[$24 + 12 >> 2];
 HEAP32[$23 + 16 >> 2] = HEAP32[$24 + 16 >> 2];
 STACKTOP = sp;
 return;
}
function _fill_bezier($p, $xpts, $ypts, $use_linear) {
 $p = $p | 0;
 $xpts = $xpts | 0;
 $ypts = $ypts | 0;
 $use_linear = $use_linear | 0;
 var $2 = 0, $5 = 0, $7 = 0, $ii_063 = 0, $28 = 0, $31 = 0, $44 = 0, $i_061 = 0, $46 = 0, $50 = 0.0, $53 = 0.0, $67 = 0, $69 = 0, $i_160 = 0, $71 = 0, $74 = 0.0, $79 = 0, $84 = 0.0;
 $2 = HEAP32[$p >> 2] | 0;
 if (($2 | 0) > 0) {
  $5 = HEAP32[$p + 24 >> 2] | 0;
  $7 = HEAP32[$p + 28 >> 2] | 0;
  $ii_063 = 0;
  do {
   HEAPF64[$5 + ($ii_063 << 3) >> 3] = +HEAPF64[$xpts + ($ii_063 << 3) >> 3];
   HEAPF64[$7 + (($ii_063 * 3 | 0) << 3) >> 3] = +HEAPF64[$ypts + ($ii_063 << 3) >> 3];
   $ii_063 = $ii_063 + 1 | 0;
  } while (($ii_063 | 0) < ($2 | 0));
 }
 HEAPF64[$p + 8 >> 3] = (+HEAPF64[$ypts + 8 >> 3] - +HEAPF64[$ypts >> 3]) / (+HEAPF64[$xpts + 8 >> 3] - +HEAPF64[$xpts >> 3]);
 $28 = $2 - 1 | 0;
 $31 = $2 - 2 | 0;
 HEAPF64[$p + 16 >> 3] = (+HEAPF64[$ypts + ($28 << 3) >> 3] - +HEAPF64[$ypts + ($31 << 3) >> 3]) / (+HEAPF64[$xpts + ($28 << 3) >> 3] - +HEAPF64[$xpts + ($31 << 3) >> 3]);
 if (($28 | 0) > 0) {
  $44 = HEAP32[$p + 28 >> 2] | 0;
  $i_061 = 0;
  do {
   $46 = $i_061 * 3 | 0;
   $50 = +HEAPF64[$44 + ($46 << 3) >> 3];
   $53 = +HEAPF64[$44 + ($46 + 3 << 3) >> 3];
   HEAPF64[$44 + ($46 + 1 << 3) >> 3] = ($50 * 2.0 + $53) / 3.0;
   HEAPF64[$44 + ($46 + 2 << 3) >> 3] = ($50 + $53 * 2.0) / 3.0;
   $i_061 = $i_061 + 1 | 0;
  } while (($i_061 | 0) < ($28 | 0));
 }
 if (!(($use_linear | 0) == 0 & ($28 | 0) > 1)) {
  return;
 }
 $67 = HEAP32[$p + 28 >> 2] | 0;
 $69 = HEAP32[$p + 24 >> 2] | 0;
 $i_160 = 1;
 while (1) {
  $71 = $i_160 * 3 | 0;
  $74 = +HEAPF64[$67 + ($71 - 1 << 3) >> 3];
  $79 = $i_160 + 1 | 0;
  $84 = +HEAPF64[$69 + ($i_160 - 1 << 3) >> 3];
  HEAPF64[$67 + ($71 << 3) >> 3] = $74 + (+HEAPF64[$67 + ($71 + 1 << 3) >> 3] - $74) / (+HEAPF64[$69 + ($79 << 3) >> 3] - $84) * (+HEAPF64[$69 + ($i_160 << 3) >> 3] - $84);
  if (($79 | 0) < ($28 | 0)) {
   $i_160 = $79;
  } else {
   break;
  }
 }
 return;
}
function _read_insulator() {
 var $i = 0, $j = 0, $k = 0, $f_cfo = 0, $f_vb = 0, $f_de = 0, $f_beta = 0, $5 = 0.0, $8 = 0.0, $10 = 0.0, $11 = 0.0, $15 = 0.0, $23 = 0, $24 = 0, $41 = 0, $43 = 0, $46 = 0, $59 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 56 | 0;
 $i = sp | 0;
 $j = sp + 8 | 0;
 $k = sp + 16 | 0;
 $f_cfo = sp + 24 | 0;
 $f_vb = sp + 32 | 0;
 $f_de = sp + 40 | 0;
 $f_beta = sp + 48 | 0;
 _next_double($f_cfo) | 0;
 _next_double($f_vb) | 0;
 _next_double($f_beta) | 0;
 _next_double($f_de) | 0;
 $5 = +HEAPF64[$f_cfo >> 3];
 if ($5 < 0.0) {
  $8 = $5 * -1.0;
  HEAPF64[$f_cfo >> 3] = $8;
  $10 = $8;
 } else {
  $10 = $5;
 }
 $11 = $10 / 1.0e5;
 HEAPF64[$f_vb >> 3] = $11 * +HEAPF64[$f_vb >> 3];
 $15 = +Math_pow(+$11, +(+HEAPF64[$f_beta >> 3]));
 HEAPF64[$f_de >> 3] = $15 * +HEAPF64[$f_de >> 3];
 _read_pairs() | 0;
 _read_poles() | 0;
 _reset_assignments() | 0;
 if ((_next_assignment($i, $j, $k) | 0) != 0) {
  STACKTOP = sp;
  return 0;
 }
 do {
  $23 = _malloc(88) | 0;
  $24 = $23;
  if (($23 | 0) == 0) {
   $59 = HEAP32[3164] | 0;
   if (($59 | 0) != 0) {
    _fwrite(5240, 29, 1, $59 | 0) | 0;
   }
   _oe_exit(2);
  } else {
   HEAPF64[$23 >> 3] = +HEAPF64[$f_cfo >> 3];
   HEAPF64[$23 + 40 >> 3] = +HEAPF64[$f_de >> 3];
   HEAPF64[$23 + 8 >> 3] = +HEAPF64[$f_vb >> 3];
   HEAPF64[$23 + 16 >> 3] = +HEAPF64[$f_beta >> 3];
   _memset($23 + 24 | 0, 0, 16) | 0;
   _memset($23 + 48 | 0, 0, 20) | 0;
   $41 = _find_pole(HEAP32[$i >> 2] | 0) | 0;
   $43 = $23 + 76 | 0;
   HEAP32[$43 >> 2] = $41;
   if (($41 | 0) == 0) {
    _oe_exit(15);
    $46 = HEAP32[$43 >> 2] | 0;
   } else {
    $46 = $41;
   }
   HEAP32[$46 + 8 >> 2] = 1;
   HEAP32[$23 + 68 >> 2] = HEAP32[$j >> 2];
   HEAP32[$23 + 72 >> 2] = HEAP32[$k >> 2];
   HEAP32[$23 + 80 >> 2] = 0;
   HEAP32[(HEAP32[3172] | 0) + 80 >> 2] = $24;
   HEAP32[3172] = $24;
  }
 } while ((_next_assignment($i, $j, $k) | 0) == 0);
 STACKTOP = sp;
 return 0;
}
function _new_pole($location) {
 $location = $location | 0;
 var $1 = 0, $2 = 0, $15 = 0, $19 = 0, $24 = 0, $29 = 0, $33 = 0, $36 = 0, $37 = 0, $40 = 0, $41 = 0, $63 = 0, $_0 = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 $1 = _malloc(80) | 0;
 $2 = $1;
 if (($1 | 0) != 0) {
  HEAP32[(HEAP32[2978] | 0) + 76 >> 2] = $2;
  HEAP32[2978] = $2;
  HEAP32[$1 >> 2] = $location;
  HEAP32[$1 + 8 >> 2] = 0;
  HEAP32[$1 + 4 >> 2] = 1;
  HEAP32[$1 + 12 >> 2] = 0;
  $15 = _gsl_vector_calloc(HEAP32[3122] | 0) | 0;
  HEAP32[(HEAP32[2978] | 0) + 28 >> 2] = $15;
  $19 = _gsl_vector_calloc(HEAP32[3122] | 0) | 0;
  HEAP32[(HEAP32[2978] | 0) + 32 >> 2] = $19;
  $24 = _gsl_vector_calloc((HEAP32[3122] | 0) + 1 | 0) | 0;
  HEAP32[(HEAP32[2978] | 0) + 20 >> 2] = $24;
  $29 = _gsl_vector_calloc((HEAP32[3122] | 0) + 1 | 0) | 0;
  HEAP32[(HEAP32[2978] | 0) + 24 >> 2] = $29;
  $33 = _gsl_permutation_alloc(HEAP32[3122] | 0) | 0;
  HEAP32[(HEAP32[2978] | 0) + 36 >> 2] = $33;
  $36 = HEAP32[3122] | 0;
  $37 = _gsl_matrix_calloc($36, $36) | 0;
  HEAP32[(HEAP32[2978] | 0) + 40 >> 2] = $37;
  $40 = HEAP32[3122] | 0;
  $41 = _gsl_matrix_calloc($40, $40) | 0;
  HEAP32[(HEAP32[2978] | 0) + 44 >> 2] = $41;
  HEAP32[(HEAP32[2978] | 0) + 48 >> 2] = 0;
  HEAP32[(HEAP32[2978] | 0) + 52 >> 2] = 0;
  HEAP32[(HEAP32[2978] | 0) + 16 >> 2] = 0;
  HEAP32[(HEAP32[2978] | 0) + 60 >> 2] = 0;
  HEAP32[(HEAP32[2978] | 0) + 64 >> 2] = 0;
  HEAP32[(HEAP32[2978] | 0) + 68 >> 2] = 0;
  HEAP32[(HEAP32[2978] | 0) + 56 >> 2] = 0;
  HEAP32[(HEAP32[2978] | 0) + 72 >> 2] = 0;
  HEAP32[(HEAP32[2978] | 0) + 76 >> 2] = 0;
  $_0 = $2;
  STACKTOP = sp;
  return $_0 | 0;
 }
 $63 = HEAP32[3164] | 0;
 if (($63 | 0) != 0) {
  _fprintf($63 | 0, 11192, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = $location, tempVarArgs) | 0) | 0;
  STACKTOP = tempVarArgs;
 }
 _oe_exit(2);
 $_0 = 0;
 STACKTOP = sp;
 return $_0 | 0;
}
function _read_surge() {
 var $i = 0, $j = 0, $k = 0, $fpeak = 0, $ftf = 0, $ftt = 0, $ftstart = 0, $10 = 0, $11 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0.0, $18 = 0.0, $19 = 0.0, $20 = 0.0, $25 = 0.0, $43 = 0, $45 = 0, $48 = 0, $59 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 56 | 0;
 $i = sp | 0;
 $j = sp + 8 | 0;
 $k = sp + 16 | 0;
 $fpeak = sp + 24 | 0;
 $ftf = sp + 32 | 0;
 $ftt = sp + 40 | 0;
 $ftstart = sp + 48 | 0;
 _next_double($fpeak) | 0;
 _next_double($ftf) | 0;
 _next_double($ftt) | 0;
 _next_double($ftstart) | 0;
 _read_pairs() | 0;
 _read_poles() | 0;
 _reset_assignments() | 0;
 if ((_next_assignment($i, $j, $k) | 0) != 0) {
  STACKTOP = sp;
  return 0;
 }
 do {
  $10 = _malloc(80) | 0;
  $11 = $10;
  if (($10 | 0) == 0) {
   $59 = HEAP32[3164] | 0;
   if (($59 | 0) != 0) {
    _fwrite(9152, 25, 1, $59 | 0) | 0;
   }
   _oe_exit(2);
  } else {
   $14 = HEAP32[$i >> 2] | 0;
   $15 = HEAP32[$j >> 2] | 0;
   $16 = HEAP32[$k >> 2] | 0;
   $17 = +HEAPF64[$fpeak >> 3];
   $18 = +HEAPF64[$ftf >> 3];
   $19 = +HEAPF64[$ftt >> 3];
   $20 = +HEAPF64[$ftstart >> 3];
   $25 = $18 * 1.4079315;
   HEAPF64[$10 + 8 >> 3] = $18;
   HEAPF64[$10 + 16 >> 3] = $19;
   HEAPF64[$10 + 24 >> 3] = 6.2831853 / ($18 * 2.815863);
   HEAPF64[$10 + 32 >> 3] = 6.2831853 / ($19 * 4.0);
   HEAPF64[$10 + 40 >> 3] = $25;
   HEAPF64[$10 + 48 >> 3] = $20;
   HEAPF64[$10 + 56 >> 3] = ($19 - $25) * 1.442695;
   HEAPF64[$10 >> 3] = $17;
   $43 = _find_pole($14) | 0;
   $45 = $10 + 72 | 0;
   HEAP32[$45 >> 2] = $43;
   if (($43 | 0) == 0) {
    _oe_exit(15);
    $48 = HEAP32[$45 >> 2] | 0;
   } else {
    $48 = $43;
   }
   HEAP32[$48 + 8 >> 2] = 1;
   HEAP32[$10 + 64 >> 2] = $15;
   HEAP32[$10 + 68 >> 2] = $16;
   HEAP32[$10 + 76 >> 2] = 0;
   HEAP32[(HEAP32[2882] | 0) + 76 >> 2] = $11;
   HEAP32[2882] = $11;
  }
 } while ((_next_assignment($i, $j, $k) | 0) == 0);
 STACKTOP = sp;
 return 0;
}
function _cblas_daxpy($N, $alpha, $X, $incX, $Y, $incY) {
 $N = $N | 0;
 $alpha = +$alpha;
 $X = $X | 0;
 $incX = $incX | 0;
 $Y = $Y | 0;
 $incY = $incY | 0;
 var $1 = 0, $2 = 0.0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $i = 0, $m = 0, $ix = 0, $iy = 0, $32 = 0, $54 = 0, $67 = 0, $80 = 0, $93 = 0, $111 = 0, $122 = 0, $136 = 0, sp = 0;
 sp = STACKTOP;
 $1 = $N;
 $2 = $alpha;
 $3 = $X;
 $4 = $incX;
 $5 = $Y;
 $6 = $incY;
 if ($2 == 0.0) {
  STACKTOP = sp;
  return;
 }
 if (($4 | 0) == 1) {
  if (($6 | 0) == 1) {
   $m = ($1 | 0) % 4 | 0;
   $i = 0;
   while (1) {
    if (($i | 0) >= ($m | 0)) {
     break;
    }
    $32 = $5 + ($i << 3) | 0;
    HEAPF64[$32 >> 3] = +HEAPF64[$32 >> 3] + $2 * +HEAPF64[$3 + ($i << 3) >> 3];
    $i = $i + 1 | 0;
   }
   $i = $m;
   while (1) {
    if (($i + 3 | 0) >= ($1 | 0)) {
     break;
    }
    $54 = $5 + ($i << 3) | 0;
    HEAPF64[$54 >> 3] = +HEAPF64[$54 >> 3] + $2 * +HEAPF64[$3 + ($i << 3) >> 3];
    $67 = $5 + ($i + 1 << 3) | 0;
    HEAPF64[$67 >> 3] = +HEAPF64[$67 >> 3] + $2 * +HEAPF64[$3 + ($i + 1 << 3) >> 3];
    $80 = $5 + ($i + 2 << 3) | 0;
    HEAPF64[$80 >> 3] = +HEAPF64[$80 >> 3] + $2 * +HEAPF64[$3 + ($i + 2 << 3) >> 3];
    $93 = $5 + ($i + 3 << 3) | 0;
    HEAPF64[$93 >> 3] = +HEAPF64[$93 >> 3] + $2 * +HEAPF64[$3 + ($i + 3 << 3) >> 3];
    $i = $i + 4 | 0;
   }
   STACKTOP = sp;
   return;
  }
 }
 if (($4 | 0) > 0) {
  $111 = 0;
 } else {
  $111 = Math_imul($1 - 1 | 0, -$4 | 0) | 0;
 }
 $ix = $111;
 if (($6 | 0) > 0) {
  $122 = 0;
 } else {
  $122 = Math_imul($1 - 1 | 0, -$6 | 0) | 0;
 }
 $iy = $122;
 $i = 0;
 while (1) {
  if (($i | 0) >= ($1 | 0)) {
   break;
  }
  $136 = $5 + ($iy << 3) | 0;
  HEAPF64[$136 >> 3] = +HEAPF64[$136 >> 3] + $2 * +HEAPF64[$3 + ($ix << 3) >> 3];
  $ix = $ix + $4 | 0;
  $iy = $iy + $6 | 0;
  $i = $i + 1 | 0;
 }
 STACKTOP = sp;
 return;
}
function _gsl_linalg_LU_decomp($A, $p, $signum) {
 $A = $A | 0;
 $p = $p | 0;
 $signum = $signum | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $N = 0, $i = 0, $j = 0, $k = 0, $ajj = 0.0, $max = 0.0, $i_pivot = 0, $aij = 0.0, $aij1 = 0.0, $aik = 0.0, $146 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $A;
 $3 = $p;
 $4 = $signum;
 if ((HEAP32[$2 >> 2] | 0) != (HEAP32[$2 + 4 >> 2] | 0)) {
  _gsl_error(3256, 8704, 64, 20);
  $1 = 20;
  $146 = $1;
  STACKTOP = sp;
  return $146 | 0;
 }
 if ((HEAP32[$3 >> 2] | 0) != (HEAP32[$2 >> 2] | 0)) {
  _gsl_error(7016, 8704, 68, 19);
  $1 = 19;
  $146 = $1;
  STACKTOP = sp;
  return $146 | 0;
 }
 $N = HEAP32[$2 >> 2] | 0;
 HEAP32[$4 >> 2] = 1;
 _gsl_permutation_init($3);
 $j = 0;
 while (1) {
  if (!($j >>> 0 < ($N - 1 | 0) >>> 0)) {
   break;
  }
  $max = +Math_abs(+(+_gsl_matrix_get($2, $j, $j)));
  $i_pivot = $j;
  $i = $j + 1 | 0;
  while (1) {
   if (!($i >>> 0 < $N >>> 0)) {
    break;
   }
   $aij = +Math_abs(+(+_gsl_matrix_get($2, $i, $j)));
   if ($aij > $max) {
    $max = $aij;
    $i_pivot = $i;
   }
   $i = $i + 1 | 0;
  }
  if (($i_pivot | 0) != ($j | 0)) {
   _gsl_matrix_swap_rows($2, $j, $i_pivot) | 0;
   _gsl_permutation_swap($3, $j, $i_pivot) | 0;
   HEAP32[$4 >> 2] = -(HEAP32[$4 >> 2] | 0);
  }
  $ajj = +_gsl_matrix_get($2, $j, $j);
  if ($ajj != 0.0) {
   $i = $j + 1 | 0;
   while (1) {
    if (!($i >>> 0 < $N >>> 0)) {
     break;
    }
    $aij1 = +_gsl_matrix_get($2, $i, $j) / $ajj;
    _gsl_matrix_set($2, $i, $j, $aij1);
    $k = $j + 1 | 0;
    while (1) {
     if (!($k >>> 0 < $N >>> 0)) {
      break;
     }
     $aik = +_gsl_matrix_get($2, $i, $k);
     _gsl_matrix_set($2, $i, $k, $aik - $aij1 * +_gsl_matrix_get($2, $j, $k));
     $k = $k + 1 | 0;
    }
    $i = $i + 1 | 0;
   }
  }
  $j = $j + 1 | 0;
 }
 $1 = 0;
 $146 = $1;
 STACKTOP = sp;
 return $146 | 0;
}
function _read_spans() {
 var $span_id = 0, $1 = 0, $3 = 0, $8 = 0, $storemerge_in_i = 0, $storemerge_i = 0, $17 = 0, $18 = 0, $storemerge = 0, $29 = 0, $34 = 0, $ptr_0 = 0, $40 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $span_id = sp | 0;
 $1 = _first_token() | 0;
 if (($1 | 0) == 0) {
  STACKTOP = sp;
  return;
 } else {
  $3 = $1;
 }
 while (1) {
  if ((_strcmp($3, 352) | 0) != 0) {
   label = 14;
   break;
  }
  _next_int($span_id) | 0;
  $8 = HEAP32[$span_id >> 2] | 0;
  $storemerge_in_i = 11584;
  while (1) {
   $storemerge_i = HEAP32[$storemerge_in_i >> 2] | 0;
   HEAP32[2894] = $storemerge_i;
   if (($storemerge_i | 0) == 0) {
    label = 6;
    break;
   }
   if ((HEAP32[$storemerge_i + 48 >> 2] | 0) == ($8 | 0)) {
    $ptr_0 = $storemerge_i;
    break;
   } else {
    $storemerge_in_i = $storemerge_i + 52 | 0;
   }
  }
  do {
   if ((label | 0) == 6) {
    label = 0;
    $17 = _malloc(56) | 0;
    $18 = $17;
    if (($17 | 0) == 0) {
     $34 = HEAP32[3164] | 0;
     if (($34 | 0) != 0) {
      _fwrite(3040, 24, 1, $34 | 0) | 0;
     }
     _oe_exit(2);
     $ptr_0 = $18;
     break;
    } else {
     _memset($17 | 0, 0, 40) | 0;
     HEAPF64[$17 + 40 >> 3] = 3.0e8;
     HEAP32[$17 + 48 >> 2] = $8;
     HEAP32[$17 + 52 >> 2] = 0;
     $storemerge = HEAP32[2896] | 0;
     do {
      HEAP32[2894] = $storemerge;
      $29 = $storemerge + 52 | 0;
      $storemerge = HEAP32[$29 >> 2] | 0;
     } while (($storemerge | 0) != 0);
     HEAP32[$29 >> 2] = $18;
     HEAP32[2894] = $18;
     HEAP32[2876] = 1;
     $ptr_0 = $18;
     break;
    }
   }
  } while (0);
  _read_conductors($ptr_0) | 0;
  $40 = _first_token() | 0;
  if (($40 | 0) == 0) {
   label = 14;
   break;
  } else {
   $3 = $40;
  }
 }
 if ((label | 0) == 14) {
  STACKTOP = sp;
  return;
 }
}
function _init_inductor_history($ptr) {
 $ptr = $ptr | 0;
 var $2 = 0, $4 = 0, $7 = 0, $vdc_0 = 0.0, $vdc_1 = 0.0, $29 = 0.0, $37 = 0, $48 = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 $2 = HEAP32[$ptr + 48 >> 2] | 0;
 $4 = HEAP32[$ptr + 52 >> 2] | 0;
 $7 = _find_pole_defn(HEAP32[$ptr + 56 >> 2] | 0) | 0;
 if (($2 | 0) == 0) {
  $vdc_0 = 0.0;
 } else {
  $vdc_0 = +_gsl_vector_get(HEAP32[$7 + 36 >> 2] | 0, $2 - 1 | 0) + 0.0;
 }
 if (($4 | 0) == 0) {
  $vdc_1 = $vdc_0;
 } else {
  $vdc_1 = $vdc_0 - +_gsl_vector_get(HEAP32[$7 + 36 >> 2] | 0, $4 - 1 | 0);
 }
 if (+Math_abs(+$vdc_1) < .001) {
  STACKTOP = sp;
  return;
 }
 $29 = 1.0 - +HEAPF64[$ptr + 16 >> 3];
 if ($29 != 0.0) {
  HEAPF64[$ptr + 24 >> 3] = $vdc_1 * +HEAPF64[$ptr + 8 >> 3] / $29;
  $37 = HEAP32[3164] | 0;
  if (($37 | 0) == 0) {
   STACKTOP = sp;
   return;
  }
  _fwrite(7464, 9, 1, $37 | 0) | 0;
  _fprintf(HEAP32[3164] | 0, 10040, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempVarArgs >> 2] = $2, HEAP32[tempVarArgs + 8 >> 2] = $4, tempVarArgs) | 0) | 0;
  STACKTOP = tempVarArgs;
  _fwrite(7672, 27, 1, HEAP32[3164] | 0) | 0;
  _fwrite(6256, 24, 1, HEAP32[3164] | 0) | 0;
  STACKTOP = sp;
  return;
 } else {
  $48 = HEAP32[3164] | 0;
  if (($48 | 0) != 0) {
   _fprintf($48 | 0, 5280, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempVarArgs >> 2] = $2, HEAP32[tempVarArgs + 8 >> 2] = $4, tempVarArgs) | 0) | 0;
   STACKTOP = tempVarArgs;
   _fprintf(HEAP32[3164] | 0, 4416, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = $vdc_1, tempVarArgs) | 0) | 0;
   STACKTOP = tempVarArgs;
   _fwrite(4008, 19, 1, HEAP32[3164] | 0) | 0;
   _fwrite(3600, 27, 1, HEAP32[3164] | 0) | 0;
  }
  _oe_exit(4);
  STACKTOP = sp;
  return;
 }
}
function _read_cables($defn) {
 $defn = $defn | 0;
 var $i = 0, $z_surge = 0, $v_prop = 0, $vpf = 0, $2 = 0, $7 = 0, $19 = 0, $24 = 0, $27 = 0, $30 = 0, $33 = 0, $37 = 0, $41 = 0, $46 = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32 | 0;
 $i = sp | 0;
 $z_surge = sp + 8 | 0;
 $v_prop = sp + 16 | 0;
 $vpf = sp + 24 | 0;
 _next_int($i) | 0;
 $2 = HEAP32[$i >> 2] | 0;
 if (($2 | 0) > (HEAP32[3122] | 0) | ($2 | 0) < 0) {
  $7 = HEAP32[3164] | 0;
  if (($7 | 0) != 0) {
   _fprintf($7 | 0, 11264, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = $2, tempVarArgs) | 0) | 0;
   STACKTOP = tempVarArgs;
  }
  _oe_exit(9);
 }
 _next_double($z_surge) | 0;
 _next_double($v_prop) | 0;
 _next_double($vpf) | 0;
 HEAPF64[$defn + 40 >> 3] = +HEAPF64[$v_prop >> 3];
 $19 = (HEAP32[$i >> 2] | 0) - 1 | 0;
 HEAP32[$i >> 2] = $19;
 _gsl_matrix_set(HEAP32[$defn + 16 >> 2] | 0, $19, $19, 1.0);
 $24 = HEAP32[$i >> 2] | 0;
 _gsl_matrix_set(HEAP32[$defn + 20 >> 2] | 0, $24, $24, 1.0);
 $27 = HEAP32[$i >> 2] | 0;
 _gsl_matrix_set(HEAP32[$defn + 24 >> 2] | 0, $27, $27, 1.0);
 $30 = HEAP32[$i >> 2] | 0;
 _gsl_matrix_set(HEAP32[$defn + 28 >> 2] | 0, $30, $30, 1.0);
 $33 = HEAP32[$i >> 2] | 0;
 _gsl_matrix_set(HEAP32[$defn + 8 >> 2] | 0, $33, $33, +HEAPF64[$z_surge >> 3]);
 $37 = HEAP32[$i >> 2] | 0;
 _gsl_matrix_set(HEAP32[$defn >> 2] | 0, $37, $37, +HEAPF64[$z_surge >> 3]);
 $41 = HEAP32[$i >> 2] | 0;
 _gsl_matrix_set(HEAP32[$defn + 12 >> 2] | 0, $41, $41, 1.0 / +HEAPF64[$z_surge >> 3]);
 $46 = HEAP32[$i >> 2] | 0;
 _gsl_matrix_set(HEAP32[$defn + 4 >> 2] | 0, $46, $46, 1.0 / +HEAPF64[$z_surge >> 3]);
 _gsl_vector_set(HEAP32[$defn + 36 >> 2] | 0, HEAP32[$i >> 2] | 0, +HEAPF64[$vpf >> 3]);
 STACKTOP = sp;
 return 0;
}
function _change_arrester_time_step($ptr) {
 $ptr = $ptr | 0;
 var $1 = 0, $2 = 0.0, $6 = 0, $8 = 0.0, $9 = 0, $10 = 0.0, $12 = 0.0, $14 = 0, $16 = 0, $21 = 0, $23 = 0, $25 = 0, $32 = 0.0, $38 = 0.0, $42 = 0.0, $44 = 0.0, $_sink = 0.0, $pos_now_0 = 0, $50 = 0.0, $56 = 0.0, $59 = 0.0, $61 = 0.0, $62 = 0, $65 = 0.0, $storemerge = 0.0;
 $1 = $ptr + 88 | 0;
 $2 = +HEAPF64[$1 >> 3];
 $6 = $ptr + 128 | 0;
 $8 = +HEAPF64[300] / +HEAPF64[96] * +HEAPF64[$6 >> 3];
 HEAPF64[$6 >> 3] = $8;
 $9 = $ptr + 40 | 0;
 $10 = +HEAPF64[$9 >> 3];
 $12 = 1.0 / ($10 + $8);
 HEAPF64[$1 >> 3] = $12;
 $14 = $ptr + 120 | 0;
 HEAPF64[$14 >> 3] = $12 * $10;
 $16 = $ptr + 136 | 0;
 HEAPF64[$16 >> 3] = $12 * $8;
 if ((HEAP32[$ptr + 152 >> 2] | 0) == 0) {
  return;
 }
 $21 = $ptr + 164 | 0;
 $23 = $ptr + 156 | 0;
 $25 = $ptr + 160 | 0;
 _add_y(HEAP32[$21 >> 2] | 0, HEAP32[$23 >> 2] | 0, HEAP32[$25 >> 2] | 0, $12 - $2);
 $32 = +_gsl_vector_get(HEAP32[(HEAP32[$21 >> 2] | 0) + 20 >> 2] | 0, HEAP32[$23 >> 2] | 0);
 $38 = $32 - +_gsl_vector_get(HEAP32[(HEAP32[$21 >> 2] | 0) + 20 >> 2] | 0, HEAP32[$25 >> 2] | 0);
 $42 = +HEAPF64[$ptr + 144 >> 3];
 $44 = +HEAPF64[$ptr + 8 >> 3];
 if ($38 > 0.0) {
  $pos_now_0 = 1;
  $_sink = $42 + $44;
 } else {
  $pos_now_0 = 0;
  $_sink = $42 - $44;
 }
 $50 = +HEAPF64[$6 >> 3];
 if ($50 > 0.0) {
  $56 = $42 + ($38 - +HEAPF64[$9 >> 3] * $_sink) / $50;
  HEAPF64[$ptr + 96 >> 3] = $56;
  $59 = $56;
 } else {
  $59 = +HEAPF64[$ptr + 96 >> 3];
 }
 $61 = $59 * +HEAPF64[$16 >> 3];
 $62 = $ptr + 104 | 0;
 HEAPF64[$62 >> 3] = $61;
 $65 = +HEAPF64[$14 >> 3] * $44;
 if (($pos_now_0 | 0) == 0) {
  $storemerge = $61 + $65;
 } else {
  $storemerge = $61 - $65;
 }
 HEAPF64[$62 >> 3] = $storemerge;
 HEAPF64[$ptr + 112 >> 3] = $storemerge;
 return;
}
function _first_token() {
 var $2 = 0, $ts_0 = 0, $4 = 0, $12 = 0, $14 = 0, $15 = 0, $17 = 0, $23 = 0, $26 = 0, $29 = 0, $32 = 0, $35 = 0, $37 = 0, $i_010 = 0, $40 = 0, $43 = 0, $45 = 0, label = 0;
 HEAP32[2880] = 0;
 $2 = _strtok(HEAP32[2974] | 0, 4152) | 0;
 if (($2 | 0) == 0) {
  $45 = HEAP32[2880] | 0;
  return $45 | 0;
 } else {
  $ts_0 = $2;
 }
 while (1) {
  $4 = HEAP8[$ts_0] | 0;
  if (!($4 << 24 >> 24 == 0)) {
   if ((_isspace($4 << 24 >> 24 | 0) | 0) != 0) {
    $ts_0 = $ts_0 + 1 | 0;
    continue;
   }
  }
  $12 = (_strlen($ts_0 | 0) | 0) + 1 | 0;
  $14 = (HEAP32[2974] | 0) + $12 | 0;
  HEAP32[2974] = $14;
  $15 = HEAP8[$14] | 0;
  L8 : do {
   if (!($15 << 24 >> 24 == 0)) {
    $17 = $15;
    do {
     if ((_isspace($17 << 24 >> 24 | 0) | 0) == 0) {
      break L8;
     }
     $23 = (HEAP32[2974] | 0) + 1 | 0;
     HEAP32[2974] = $23;
     $17 = HEAP8[$23] | 0;
    } while (!($17 << 24 >> 24 == 0));
   }
  } while (0);
  $26 = _strtok($ts_0, 752) | 0;
  HEAP32[2880] = $26;
  if (($26 | 0) != 0) {
   $29 = HEAP8[$26] | 0;
   if (!($29 << 24 >> 24 == 42)) {
    break;
   }
  }
  HEAP32[2880] = 0;
  $32 = _strtok(HEAP32[2974] | 0, 4152) | 0;
  if (($32 | 0) == 0) {
   label = 13;
   break;
  } else {
   $ts_0 = $32;
  }
 }
 if ((label | 0) == 13) {
  $45 = HEAP32[2880] | 0;
  return $45 | 0;
 }
 $35 = _strlen($26 | 0) | 0;
 if (($35 | 0) > 0) {
  $i_010 = 0;
  $37 = $29;
 } else {
  $45 = HEAP32[2880] | 0;
  return $45 | 0;
 }
 while (1) {
  $40 = (_tolower($37 << 24 >> 24 | 0) | 0) & 255;
  HEAP8[(HEAP32[2880] | 0) + $i_010 | 0] = $40;
  $43 = $i_010 + 1 | 0;
  if (($43 | 0) >= ($35 | 0)) {
   break;
  }
  $i_010 = $43;
  $37 = HEAP8[(HEAP32[2880] | 0) + $43 | 0] | 0;
 }
 $45 = HEAP32[2880] | 0;
 return $45 | 0;
}
function _update_arrbez_history($ptr) {
 $ptr = $ptr | 0;
 var $6 = 0, $7 = 0, $9 = 0.0, $12 = 0.0, $13 = 0, $14 = 0.0, $17 = 0.0, $35 = 0.0, $38 = 0, $39 = 0.0, $44 = 0.0, $46 = 0.0, $48 = 0.0, $49 = 0.0, $58 = 0.0, $61 = 0.0, $70 = 0.0, $71 = 0.0, $72 = 0, $78 = 0, $81 = 0.0, $82 = 0;
 $6 = HEAP32[$ptr + 148 >> 2] | 0;
 $7 = (HEAP32[$ptr + 156 >> 2] | 0) + 20 | 0;
 $9 = +_gsl_vector_get(HEAP32[$7 >> 2] | 0, HEAP32[$ptr + 144 >> 2] | 0);
 $12 = $9 - +_gsl_vector_get(HEAP32[$7 >> 2] | 0, $6);
 $13 = $ptr + 72 | 0;
 $14 = +HEAPF64[$13 >> 3];
 if ($14 > 0.0) {
  $17 = +Math_abs(+$12);
  if (!($17 > +Math_abs(+(+HEAPF64[$ptr + 8 >> 3])))) {
   return;
  }
  HEAPF64[$13 >> 3] = 0.0;
  HEAPF64[$ptr + 56 >> 3] = +HEAPF64[4];
  HEAPF64[$ptr + 104 >> 3] = +HEAPF64[$ptr + 120 >> 3] + 0.0 + 1.0 / +HEAPF64[$ptr + 88 >> 3];
  return;
 }
 $35 = +HEAPF64[$ptr + 16 >> 3];
 if ($35 > 0.0) {
  $38 = $ptr + 88 | 0;
  $39 = +HEAPF64[$38 >> 3];
  if ($39 < 1.0e6) {
   $44 = +HEAPF64[$ptr + 128 >> 3] / 5400.0;
   $46 = +Math_abs(+$12) / $35;
   $48 = +HEAPF64[$ptr + 80 >> 3];
   $49 = $39 / $48;
   $58 = +Math_exp($46) * $48 / 80.0 * ($49 + 1.0) * ($44 * $44 * $49 + 1.0);
   $61 = $39 + +HEAPF64[323] * $58;
   HEAPF64[$38 >> 3] = $61;
   HEAPF64[$ptr + 104 >> 3] = +HEAPF64[$ptr + 120 >> 3] + $14 + 1.0 / $61;
  }
 }
 $70 = +HEAPF64[$ptr + 128 >> 3];
 $71 = +HEAPF64[323] * $70;
 $72 = $ptr + 32 | 0;
 HEAPF64[$72 >> 3] = +HEAPF64[$72 >> 3] + $71;
 $78 = $ptr + 48 | 0;
 HEAPF64[$78 >> 3] = +HEAPF64[$78 >> 3] + $71 * +HEAPF64[$ptr + 136 >> 3];
 $81 = +Math_abs(+$70);
 $82 = $ptr + 40 | 0;
 if (!($81 > +Math_abs(+(+HEAPF64[$82 >> 3])))) {
  return;
 }
 HEAPF64[$82 >> 3] = $70;
 HEAPF64[$ptr + 64 >> 3] = +HEAPF64[4];
 return;
}
function _check_lpm($ptr) {
 $ptr = $ptr | 0;
 var $4 = 0, $9 = 0, $11 = 0, $13 = 0, $14 = 0, $16 = 0.0, $19 = 0.0, $x_0_in = 0, $sign_0 = 0, $33 = 0.0, $38 = 0.0, $44 = 0.0, $45 = 0, $48 = 0, $52 = 0, $58 = 0, $62 = 0;
 if ((HEAP32[3196] | 0) != 0) {
  return;
 }
 $4 = $ptr + 84 | 0;
 if ((HEAP32[$4 >> 2] | 0) == 1) {
  return;
 }
 $9 = HEAP32[$ptr + 96 >> 2] | 0;
 $11 = HEAP32[$ptr + 88 >> 2] | 0;
 $13 = HEAP32[$ptr + 92 >> 2] | 0;
 $14 = $9 + 20 | 0;
 $16 = +_gsl_vector_get(HEAP32[$14 >> 2] | 0, $11);
 $19 = $16 - +_gsl_vector_get(HEAP32[$14 >> 2] | 0, $13);
 HEAPF32[(HEAP32[$ptr + 80 >> 2] | 0) + (HEAP32[2888] << 2) >> 2] = $19;
 do {
  if ($19 > 0.0) {
   $sign_0 = 1;
   $x_0_in = $ptr + 32 | 0;
  } else {
   if ($19 < 0.0) {
    $sign_0 = 0;
    $x_0_in = $ptr + 40 | 0;
    break;
   } else {
    return;
   }
  }
 } while (0);
 $33 = +Math_abs(+$19);
 $38 = $33 * +HEAPF64[$ptr + 16 >> 3] * +HEAPF64[323];
 $44 = $33 * $38 / +HEAPF64[$x_0_in >> 3] - $38 * +HEAPF64[$ptr + 8 >> 3];
 $45 = $44 > 0.0;
 if ($sign_0) {
  if ($45) {
   $48 = $ptr + 32 | 0;
   HEAPF64[$48 >> 3] = +HEAPF64[$48 >> 3] - $44;
  }
  $52 = $ptr + 64 | 0;
  if ($33 > +HEAPF64[$52 >> 3]) {
   HEAPF64[$52 >> 3] = $33;
  }
 } else {
  if ($45) {
   $58 = $ptr + 40 | 0;
   HEAPF64[$58 >> 3] = +HEAPF64[$58 >> 3] - $44;
  }
  $62 = $ptr + 56 | 0;
  if ($33 > +HEAPF64[$62 >> 3]) {
   HEAPF64[$62 >> 3] = $33;
  }
 }
 if ((HEAP32[$4 >> 2] | 0) == 2) {
  return;
 }
 if (+HEAPF64[$ptr + 32 >> 3] > 0.0) {
  if (+HEAPF64[$ptr + 40 >> 3] > 0.0) {
   return;
  }
 }
 HEAP32[$4 >> 2] = 1;
 if ((HEAP32[3192] | 0) != 0) {
  HEAP32[3194] = 1;
 }
 HEAPF64[$ptr + 48 >> 3] = +HEAPF64[4];
 _add_y($9, $11, $13, 1.0e3);
 return;
}
function _change_ground_time_step($ptr) {
 $ptr = $ptr | 0;
 var $1 = 0, $2 = 0.0, $6 = 0, $8 = 0.0, $10 = 0.0, $12 = 0.0, $14 = 0, $16 = 0, $17 = 0, $19 = 0, $21 = 0, $28 = 0.0, $33 = 0.0, $35 = 0.0, $36 = 0.0, $45 = 0.0, $50 = 0.0, $51 = 0.0, $52 = 0.0, $53 = 0, $54 = 0.0, $55 = 0.0, $56 = 0.0, $57 = 0.0, $58 = 0;
 $1 = $ptr + 32 | 0;
 $2 = +HEAPF64[$1 >> 3];
 $6 = $ptr + 80 | 0;
 $8 = +HEAPF64[300] / +HEAPF64[96] * +HEAPF64[$6 >> 3];
 HEAPF64[$6 >> 3] = $8;
 $10 = +HEAPF64[$ptr >> 3];
 $12 = 1.0 / ($10 + $8);
 HEAPF64[$1 >> 3] = $12;
 $14 = $ptr + 72 | 0;
 HEAPF64[$14 >> 3] = $12 * $10;
 $16 = $ptr + 88 | 0;
 HEAPF64[$16 >> 3] = $12 * $8;
 $17 = $ptr + 104 | 0;
 $19 = $ptr + 96 | 0;
 $21 = $ptr + 100 | 0;
 _add_y(HEAP32[$17 >> 2] | 0, HEAP32[$19 >> 2] | 0, HEAP32[$21 >> 2] | 0, $12 - $2);
 $28 = +_gsl_vector_get(HEAP32[(HEAP32[$17 >> 2] | 0) + 20 >> 2] | 0, HEAP32[$19 >> 2] | 0);
 $33 = +_gsl_vector_get(HEAP32[(HEAP32[$17 >> 2] | 0) + 20 >> 2] | 0, HEAP32[$21 >> 2] | 0);
 $35 = +HEAPF64[$ptr + 64 >> 3];
 $36 = +HEAPF64[$6 >> 3];
 if ($36 > 0.0) {
  $45 = $35 + ($28 - $33 - $35 * +HEAPF64[$ptr + 16 >> 3]) / $36;
  HEAPF64[$ptr + 40 >> 3] = $45;
  $50 = $45;
  $51 = +HEAPF64[$16 >> 3];
  $52 = $50 * $51;
  $53 = $ptr + 56 | 0;
  $54 = +HEAPF64[$53 >> 3];
  $55 = +HEAPF64[$14 >> 3];
  $56 = $54 * $55;
  $57 = $52 + $56;
  $58 = $ptr + 48 | 0;
  HEAPF64[$58 >> 3] = $57;
  return;
 } else {
  HEAPF64[$ptr + 40 >> 3] = 0.0;
  $50 = 0.0;
  $51 = +HEAPF64[$16 >> 3];
  $52 = $50 * $51;
  $53 = $ptr + 56 | 0;
  $54 = +HEAPF64[$53 >> 3];
  $55 = +HEAPF64[$14 >> 3];
  $56 = $54 * $55;
  $57 = $52 + $56;
  $58 = $ptr + 48 | 0;
  HEAPF64[$58 >> 3] = $57;
  return;
 }
}
function _inject_line_iphase($ptr) {
 $ptr = $ptr | 0;
 var $ip = 0, $1 = 0, $5 = 0, $9 = 0, $11 = 0, $13 = 0, $17 = 0, $19 = 0, $i_022 = 0, $27 = 0, $30 = 0, $32 = 0, $36 = 0, $38 = 0, $i_121 = 0, $46 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48 | 0;
 $ip = sp | 0;
 $1 = sp + 24 | 0;
 $5 = (HEAP32[2888] | 0) % (HEAP32[$ptr + 16 >> 2] | 0) | 0;
 $9 = HEAP32[(HEAP32[$ptr >> 2] | 0) + 16 >> 2] | 0;
 $11 = HEAP32[$ptr + 20 >> 2] | 0;
 $13 = HEAP32[$11 + 32 >> 2] | 0;
 _gsl_vector_subvector($ip, HEAP32[$11 + 24 >> 2] | 0, 1, HEAP32[3122] | 0);
 $17 = $ip;
 $19 = HEAP32[$ptr + 4 >> 2] | 0;
 if ((HEAP32[3124] | 0) > 0) {
  $i_022 = 0;
  do {
   _gsl_vector_set($13, $i_022, -0.0 - +_gsl_matrix_get($19, $i_022, $5));
   $i_022 = $i_022 + 1 | 0;
  } while (($i_022 | 0) < (HEAP32[3124] | 0));
 }
 $27 = $ip | 0;
 _gsl_blas_dgemv(111, 1.0, $9, $13, 1.0, $27) | 0;
 $30 = HEAP32[$ptr + 24 >> 2] | 0;
 $32 = HEAP32[$30 + 32 >> 2] | 0;
 _gsl_vector_subvector($1, HEAP32[$30 + 24 >> 2] | 0, 1, HEAP32[3122] | 0);
 $36 = $1;
 HEAP32[$17 >> 2] = HEAP32[$36 >> 2];
 HEAP32[$17 + 4 >> 2] = HEAP32[$36 + 4 >> 2];
 HEAP32[$17 + 8 >> 2] = HEAP32[$36 + 8 >> 2];
 HEAP32[$17 + 12 >> 2] = HEAP32[$36 + 12 >> 2];
 HEAP32[$17 + 16 >> 2] = HEAP32[$36 + 16 >> 2];
 $38 = HEAP32[$ptr + 8 >> 2] | 0;
 if ((HEAP32[3124] | 0) > 0) {
  $i_121 = 0;
 } else {
  $46 = _gsl_blas_dgemv(111, 1.0, $9, $32, 1.0, $27) | 0;
  STACKTOP = sp;
  return;
 }
 do {
  _gsl_vector_set($32, $i_121, -0.0 - +_gsl_matrix_get($38, $i_121, $5));
  $i_121 = $i_121 + 1 | 0;
 } while (($i_121 | 0) < (HEAP32[3124] | 0));
 $46 = _gsl_blas_dgemv(111, 1.0, $9, $32, 1.0, $27) | 0;
 STACKTOP = sp;
 return;
}
function _gsl_eigen_symmv_sort($eval, $evec, $sort_type) {
 $eval = $eval | 0;
 $evec = $evec | 0;
 $sort_type = $sort_type | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $N = 0, $i = 0, $j = 0, $k = 0, $ek = 0.0, $test = 0, $ej = 0.0, $50 = 0, $108 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $2 = $eval;
 $3 = $evec;
 $4 = $sort_type;
 if ((HEAP32[$3 >> 2] | 0) != (HEAP32[$3 + 4 >> 2] | 0)) {
  _gsl_error(3952, 8992, 38, 20);
  $1 = 20;
  $108 = $1;
  STACKTOP = sp;
  return $108 | 0;
 }
 if ((HEAP32[$2 >> 2] | 0) != (HEAP32[$3 >> 2] | 0)) {
  _gsl_error(7240, 8992, 42, 19);
  $1 = 19;
  $108 = $1;
  STACKTOP = sp;
  return $108 | 0;
 }
 $N = HEAP32[$2 >> 2] | 0;
 $i = 0;
 L11 : while (1) {
  if (!($i >>> 0 < ($N - 1 | 0) >>> 0)) {
   label = 26;
   break;
  }
  $k = $i;
  $ek = +_gsl_vector_get($2, $i);
  $j = $i + 1 | 0;
  while (1) {
   if (!($j >>> 0 < $N >>> 0)) {
    break;
   }
   $ej = +_gsl_vector_get($2, $j);
   $50 = $4;
   if (($50 | 0) == 0) {
    $test = $ej < $ek | 0;
   } else if (($50 | 0) == 1) {
    $test = $ej > $ek | 0;
   } else if (($50 | 0) == 2) {
    $test = +Math_abs(+$ej) < +Math_abs(+$ek) | 0;
   } else if (($50 | 0) == 3) {
    $test = +Math_abs(+$ej) > +Math_abs(+$ek) | 0;
   } else {
    break L11;
   }
   if (($test | 0) != 0) {
    $k = $j;
    $ek = $ej;
   }
   $j = $j + 1 | 0;
  }
  if (($k | 0) != ($i | 0)) {
   _gsl_vector_swap_elements($2, $i, $k) | 0;
   _gsl_matrix_swap_columns($3, $i, $k) | 0;
  }
  $i = $i + 1 | 0;
 }
 if ((label | 0) == 26) {
  $1 = 0;
  $108 = $1;
  STACKTOP = sp;
  return $108 | 0;
 }
 _gsl_error(5872, 8992, 77, 4);
 $1 = 4;
 $108 = $1;
 STACKTOP = sp;
 return $108 | 0;
}
function _read_transformer() {
 var $i = 0, $j = 0, $k = 0, $res = 0, $ind = 0, $3 = 0.0, $9 = 0.0, $12 = 0.0, $16 = 0.0, $22 = 0, $23 = 0, $40 = 0, $42 = 0, $46 = 0, $61 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 40 | 0;
 $i = sp | 0;
 $j = sp + 8 | 0;
 $k = sp + 16 | 0;
 $res = sp + 24 | 0;
 $ind = sp + 32 | 0;
 _next_double($res) | 0;
 _next_double($ind) | 0;
 $3 = +HEAPF64[$res >> 3];
 $9 = 1.0 / ($3 + +HEAPF64[$ind >> 3] * 2.0 / +HEAPF64[323]);
 $12 = 1.0 - $3 * 2.0 * $9;
 $16 = $9 * 2.0 * (1.0 - $3 * $9);
 _read_pairs() | 0;
 _read_poles() | 0;
 _reset_assignments() | 0;
 if ((_next_assignment($i, $j, $k) | 0) != 0) {
  STACKTOP = sp;
  return 0;
 }
 do {
  $22 = _malloc(64) | 0;
  $23 = $22;
  if (($22 | 0) == 0) {
   $61 = HEAP32[3164] | 0;
   if (($61 | 0) != 0) {
    _fwrite(2848, 31, 1, $61 | 0) | 0;
   }
   _oe_exit(2);
  } else {
   HEAPF64[$22 + 40 >> 3] = +HEAPF64[$res >> 3];
   HEAPF64[$22 + 32 >> 3] = +HEAPF64[$ind >> 3];
   HEAPF64[$22 >> 3] = $9;
   HEAPF64[$22 + 16 >> 3] = $12;
   HEAPF64[$22 + 8 >> 3] = $16;
   HEAPF64[$22 + 24 >> 3] = 0.0;
   $40 = _find_pole(HEAP32[$i >> 2] | 0) | 0;
   $42 = $22 + 56 | 0;
   HEAP32[$42 >> 2] = $40;
   if (($40 | 0) == 0) {
    _oe_exit(15);
    $46 = HEAP32[$42 >> 2] | 0;
   } else {
    $46 = $40;
   }
   HEAP32[$46 + 8 >> 2] = 1;
   _add_y($46, HEAP32[$j >> 2] | 0, HEAP32[$k >> 2] | 0, $9);
   HEAP32[$22 + 48 >> 2] = HEAP32[$j >> 2];
   HEAP32[$22 + 52 >> 2] = HEAP32[$k >> 2];
   HEAP32[$22 + 60 >> 2] = 0;
   HEAP32[(HEAP32[2878] | 0) + 60 >> 2] = $23;
   HEAP32[2878] = $23;
  }
 } while ((_next_assignment($i, $j, $k) | 0) == 0);
 STACKTOP = sp;
 return 0;
}
function _read_inductor() {
 var $i = 0, $j = 0, $k = 0, $res = 0, $ind = 0, $3 = 0.0, $9 = 0.0, $12 = 0.0, $16 = 0.0, $22 = 0, $23 = 0, $40 = 0, $42 = 0, $46 = 0, $61 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 40 | 0;
 $i = sp | 0;
 $j = sp + 8 | 0;
 $k = sp + 16 | 0;
 $res = sp + 24 | 0;
 $ind = sp + 32 | 0;
 _next_double($res) | 0;
 _next_double($ind) | 0;
 $3 = +HEAPF64[$res >> 3];
 $9 = 1.0 / ($3 + +HEAPF64[$ind >> 3] * 2.0 / +HEAPF64[323]);
 $12 = 1.0 - $3 * 2.0 * $9;
 $16 = $9 * 2.0 * (1.0 - $3 * $9);
 _read_pairs() | 0;
 _read_poles() | 0;
 _reset_assignments() | 0;
 if ((_next_assignment($i, $j, $k) | 0) != 0) {
  STACKTOP = sp;
  return 0;
 }
 do {
  $22 = _malloc(64) | 0;
  $23 = $22;
  if (($22 | 0) == 0) {
   $61 = HEAP32[3164] | 0;
   if (($61 | 0) != 0) {
    _fwrite(3072, 28, 1, $61 | 0) | 0;
   }
   _oe_exit(2);
  } else {
   HEAPF64[$22 + 40 >> 3] = +HEAPF64[$res >> 3];
   HEAPF64[$22 + 32 >> 3] = +HEAPF64[$ind >> 3];
   HEAPF64[$22 >> 3] = $9;
   HEAPF64[$22 + 16 >> 3] = $12;
   HEAPF64[$22 + 8 >> 3] = $16;
   HEAPF64[$22 + 24 >> 3] = 0.0;
   $40 = _find_pole(HEAP32[$i >> 2] | 0) | 0;
   $42 = $22 + 56 | 0;
   HEAP32[$42 >> 2] = $40;
   if (($40 | 0) == 0) {
    _oe_exit(15);
    $46 = HEAP32[$42 >> 2] | 0;
   } else {
    $46 = $40;
   }
   HEAP32[$46 + 8 >> 2] = 1;
   _add_y($46, HEAP32[$j >> 2] | 0, HEAP32[$k >> 2] | 0, $9);
   HEAP32[$22 + 48 >> 2] = HEAP32[$j >> 2];
   HEAP32[$22 + 52 >> 2] = HEAP32[$k >> 2];
   HEAP32[$22 + 60 >> 2] = 0;
   HEAP32[(HEAP32[3176] | 0) + 60 >> 2] = $23;
   HEAP32[3176] = $23;
  }
 } while ((_next_assignment($i, $j, $k) | 0) == 0);
 STACKTOP = sp;
 return 0;
}
function _update_vmode_and_history($ptr) {
 $ptr = $ptr | 0;
 var $vp_left = 0, $vp_right = 0, $4 = 0, $5 = 0, $8 = 0, $9 = 0, $16 = 0, $18 = 0, $19 = 0, $26 = 0, $28 = 0, $i_033 = 0, $38 = 0.0, $40 = 0.0, $42 = 0.0, $44 = 0.0, $46 = 0.0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48 | 0;
 $vp_left = sp | 0;
 $vp_right = sp + 24 | 0;
 $4 = (HEAP32[2888] | 0) % (HEAP32[$ptr + 16 >> 2] | 0) | 0;
 $5 = $ptr | 0;
 $8 = HEAP32[(HEAP32[$5 >> 2] | 0) + 28 >> 2] | 0;
 $9 = $ptr + 20 | 0;
 _gsl_vector_subvector($vp_left, HEAP32[(HEAP32[$9 >> 2] | 0) + 20 >> 2] | 0, 1, HEAP32[3124] | 0);
 $16 = HEAP32[(HEAP32[$9 >> 2] | 0) + 28 >> 2] | 0;
 $18 = HEAP32[$ptr + 4 >> 2] | 0;
 $19 = $ptr + 24 | 0;
 _gsl_vector_subvector($vp_right, HEAP32[(HEAP32[$19 >> 2] | 0) + 20 >> 2] | 0, 1, HEAP32[3124] | 0);
 $26 = HEAP32[(HEAP32[$19 >> 2] | 0) + 28 >> 2] | 0;
 $28 = HEAP32[$ptr + 8 >> 2] | 0;
 _gsl_blas_dgemv(111, 1.0, $8, $vp_left | 0, 0.0, $16) | 0;
 _gsl_blas_dgemv(111, 1.0, $8, $vp_right | 0, 0.0, $26) | 0;
 if ((HEAP32[3124] | 0) > 0) {
  $i_033 = 0;
 } else {
  STACKTOP = sp;
  return;
 }
 do {
  $38 = +_gsl_matrix_get(HEAP32[(HEAP32[$5 >> 2] | 0) + 4 >> 2] | 0, $i_033, $i_033);
  $40 = $38 * +_gsl_vector_get($16, $i_033);
  $42 = $40 + +_gsl_matrix_get($18, $i_033, $4);
  $44 = $38 * +_gsl_vector_get($26, $i_033);
  $46 = $44 + +_gsl_matrix_get($28, $i_033, $4);
  _gsl_matrix_set($18, $i_033, $4, $38 * (-0.0 - +_gsl_vector_get($26, $i_033)) - $46);
  _gsl_matrix_set($28, $i_033, $4, $38 * (-0.0 - +_gsl_vector_get($16, $i_033)) - $42);
  $i_033 = $i_033 + 1 | 0;
 } while (($i_033 | 0) < (HEAP32[3124] | 0));
 STACKTOP = sp;
 return;
}
function _build_arrester($v10, $arr_size, $arr_char, $arr_minmax, $use_linear) {
 $v10 = +$v10;
 $arr_size = $arr_size | 0;
 $arr_char = $arr_char | 0;
 $arr_minmax = $arr_minmax | 0;
 $use_linear = $use_linear | 0;
 var $xpts = 0, $ypts = 0, $_ = 0, $3 = 0, $npts_0 = 0, $pts_0 = 0, $13 = 0, $pts_118 = 0, $i_017 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 320 | 0;
 $xpts = sp | 0;
 $ypts = sp + 160 | 0;
 $_ = ($arr_minmax | 0) == 0 ? 1 : 2;
 $3 = ($arr_char | 0) == 0;
 do {
  if (($arr_size | 0) == 0) {
   if ($3) {
    $pts_0 = 2184;
    $npts_0 = 9;
   } else {
    if (($arr_char | 0) == 1) {
     $pts_0 = 1624;
     $npts_0 = 13;
     break;
    } else if (($arr_char | 0) == 2) {
     $pts_0 = 560;
     $npts_0 = 8;
     break;
    } else {
     $pts_0 = 1080;
     $npts_0 = 8;
     break;
    }
   }
  } else {
   if ($3) {
    $pts_0 = 1968;
    $npts_0 = 9;
   } else {
    if (($arr_char | 0) == 1) {
     $pts_0 = 1312;
     $npts_0 = 13;
     break;
    } else if (($arr_char | 0) == 2) {
     $pts_0 = 368;
     $npts_0 = 8;
     break;
    } else {
     $pts_0 = 888;
     $npts_0 = 8;
     break;
    }
   }
  }
 } while (0);
 $13 = _allocate_bezier($npts_0) | 0;
 $i_017 = 0;
 $pts_118 = $pts_0;
 while (1) {
  HEAPF64[$ypts + ($i_017 << 3) >> 3] = +HEAPF64[$pts_118 >> 3];
  HEAPF64[$xpts + ($i_017 << 3) >> 3] = +HEAPF64[$pts_118 + ($_ << 3) >> 3] * $v10;
  $i_017 = $i_017 + 1 | 0;
  if (($i_017 | 0) >= ($npts_0 | 0)) {
   break;
  } else {
   $pts_118 = $pts_118 + 24 | 0;
  }
 }
 _fill_bezier($13, $xpts | 0, $ypts | 0, $use_linear);
 STACKTOP = sp;
 return $13 | 0;
}
function _gsl_linalg_symmtd_decomp($A, $tau) {
 $A = $A | 0;
 $tau = $tau | 0;
 var $1 = 0, $2 = 0, $3 = 0, $N = 0, $i = 0, $c = 0, $v = 0, $tau_i = 0.0, $m = 0, $ei = 0.0, $x = 0, $xv = 0, $105 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 104 | 0;
 $c = sp | 0;
 $v = sp + 24 | 0;
 $m = sp + 48 | 0;
 $x = sp + 72 | 0;
 $xv = sp + 96 | 0;
 $2 = $A;
 $3 = $tau;
 if ((HEAP32[$2 >> 2] | 0) != (HEAP32[$2 + 4 >> 2] | 0)) {
  _gsl_error(2880, 8592, 69, 20);
  $1 = 20;
  $105 = $1;
  STACKTOP = sp;
  return $105 | 0;
 }
 if (((HEAP32[$3 >> 2] | 0) + 1 | 0) != (HEAP32[$2 >> 2] | 0)) {
  _gsl_error(6952, 8592, 73, 19);
  $1 = 19;
  $105 = $1;
  STACKTOP = sp;
  return $105 | 0;
 }
 $N = HEAP32[$2 >> 2] | 0;
 $i = 0;
 while (1) {
  if (!($i >>> 0 < ($N - 2 | 0) >>> 0)) {
   break;
  }
  _gsl_matrix_column($c, $2, $i);
  _gsl_vector_subvector($v, $c | 0, $i + 1 | 0, $N - ($i + 1) | 0);
  $tau_i = +_gsl_linalg_householder_transform($v | 0);
  if ($tau_i != 0.0) {
   _gsl_matrix_submatrix($m, $2, $i + 1 | 0, $i + 1 | 0, $N - ($i + 1) | 0, $N - ($i + 1) | 0);
   $ei = +_gsl_vector_get($v | 0, 0);
   _gsl_vector_subvector($x, $3, $i, $N - ($i + 1) | 0);
   _gsl_vector_set($v | 0, 0, 1.0);
   _gsl_blas_dsymv(122, $tau_i, $m | 0, $v | 0, 0.0, $x | 0) | 0;
   _gsl_blas_ddot($x | 0, $v | 0, $xv) | 0;
   _gsl_blas_daxpy((-0.0 - $tau_i / 2.0) * +HEAPF64[$xv >> 3], $v | 0, $x | 0) | 0;
   _gsl_blas_dsyr2(122, -1.0, $v | 0, $x | 0, $m | 0) | 0;
   _gsl_vector_set($v | 0, 0, $ei);
  }
  _gsl_vector_set($3, $i, $tau_i);
  $i = $i + 1 | 0;
 }
 $1 = 0;
 $105 = $1;
 STACKTOP = sp;
 return $105 | 0;
}
function _insert_line($left_pole, $right_pole, $defn, $travel_steps) {
 $left_pole = $left_pole | 0;
 $right_pole = $right_pole | 0;
 $defn = $defn | 0;
 $travel_steps = $travel_steps | 0;
 var $1 = 0, $2 = 0, $5 = 0, $7 = 0, $11 = 0, $13 = 0, $23 = 0, $28 = 0, $35 = 0, $40 = 0, $48 = 0, $61 = 0;
 $1 = _malloc(32) | 0;
 $2 = $1;
 if (($1 | 0) == 0) {
  $61 = HEAP32[3164] | 0;
  if (($61 | 0) != 0) {
   _fwrite(9784, 24, 1, $61 | 0) | 0;
  }
  _oe_exit(2);
  return;
 }
 $5 = _find_pole($left_pole) | 0;
 $7 = $1 + 20 | 0;
 HEAP32[$7 >> 2] = $5;
 if (($5 | 0) == 0) {
  _oe_exit(15);
 }
 $11 = _find_pole($right_pole) | 0;
 $13 = $1 + 24 | 0;
 HEAP32[$13 >> 2] = $11;
 if (($11 | 0) == 0) {
  _oe_exit(15);
 }
 HEAP32[$1 + 12 >> 2] = $travel_steps;
 HEAP32[$1 + 16 >> 2] = $travel_steps;
 HEAP32[$1 >> 2] = $defn;
 $23 = _gsl_matrix_calloc(HEAP32[3124] | 0, $travel_steps) | 0;
 HEAP32[$1 + 4 >> 2] = $23;
 if (($23 | 0) == 0) {
  $28 = HEAP32[3164] | 0;
  if (($28 | 0) != 0) {
   _fwrite(6920, 29, 1, $28 | 0) | 0;
  }
  _oe_exit(2);
 }
 $35 = _gsl_matrix_calloc(HEAP32[3124] | 0, $travel_steps) | 0;
 HEAP32[$1 + 8 >> 2] = $35;
 if (($35 | 0) == 0) {
  $40 = HEAP32[3164] | 0;
  if (($40 | 0) != 0) {
   _fwrite(6920, 29, 1, $40 | 0) | 0;
  }
  _oe_exit(2);
 }
 $48 = $defn + 12 | 0;
 _gsl_matrix_add(HEAP32[(HEAP32[$7 >> 2] | 0) + 40 >> 2] | 0, HEAP32[$48 >> 2] | 0) | 0;
 _gsl_matrix_add(HEAP32[(HEAP32[$13 >> 2] | 0) + 40 >> 2] | 0, HEAP32[$48 >> 2] | 0) | 0;
 HEAP32[$1 + 28 >> 2] = 0;
 HEAP32[(HEAP32[3166] | 0) + 28 >> 2] = $2;
 HEAP32[3166] = $2;
 return;
}
function _gsl_matrix_const_column($agg_result, $m, $j) {
 $agg_result = $agg_result | 0;
 $m = $m | 0;
 $j = $j | 0;
 var $1 = 0, $2 = 0, $view = 0, $v = 0, $11 = 0, $12 = 0, $37 = 0, $38 = 0, $39 = 0, $40 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48 | 0;
 $view = sp | 0;
 $v = sp + 24 | 0;
 $1 = $m;
 $2 = $j;
 _memset($view | 0, 0, 20) | 0;
 if (!($2 >>> 0 >= (HEAP32[$1 + 4 >> 2] | 0) >>> 0)) {
  _memset($v | 0, 0, 20) | 0;
  HEAP32[$v + 8 >> 2] = (HEAP32[$1 + 12 >> 2] | 0) + ($2 << 3);
  HEAP32[$v >> 2] = HEAP32[$1 >> 2];
  HEAP32[$v + 4 >> 2] = HEAP32[$1 + 8 >> 2];
  HEAP32[$v + 12 >> 2] = HEAP32[$1 + 16 >> 2];
  HEAP32[$v + 16 >> 2] = 0;
  $37 = $view | 0;
  $38 = $v;
  HEAP32[$37 >> 2] = HEAP32[$38 >> 2];
  HEAP32[$37 + 4 >> 2] = HEAP32[$38 + 4 >> 2];
  HEAP32[$37 + 8 >> 2] = HEAP32[$38 + 8 >> 2];
  HEAP32[$37 + 12 >> 2] = HEAP32[$38 + 12 >> 2];
  HEAP32[$37 + 16 >> 2] = HEAP32[$38 + 16 >> 2];
  $39 = $agg_result;
  $40 = $view;
  HEAP32[$39 >> 2] = HEAP32[$40 >> 2];
  HEAP32[$39 + 4 >> 2] = HEAP32[$40 + 4 >> 2];
  HEAP32[$39 + 8 >> 2] = HEAP32[$40 + 8 >> 2];
  HEAP32[$39 + 12 >> 2] = HEAP32[$40 + 12 >> 2];
  HEAP32[$39 + 16 >> 2] = HEAP32[$40 + 16 >> 2];
  STACKTOP = sp;
  return;
 }
 _gsl_error(8392, 11040, 51, 4);
 $11 = $agg_result;
 $12 = $view;
 HEAP32[$11 >> 2] = HEAP32[$12 >> 2];
 HEAP32[$11 + 4 >> 2] = HEAP32[$12 + 4 >> 2];
 HEAP32[$11 + 8 >> 2] = HEAP32[$12 + 8 >> 2];
 HEAP32[$11 + 12 >> 2] = HEAP32[$12 + 12 >> 2];
 HEAP32[$11 + 16 >> 2] = HEAP32[$12 + 16 >> 2];
 STACKTOP = sp;
 return;
}
function _gsl_matrix_column($agg_result, $m, $j) {
 $agg_result = $agg_result | 0;
 $m = $m | 0;
 $j = $j | 0;
 var $1 = 0, $2 = 0, $view = 0, $v = 0, $11 = 0, $12 = 0, $37 = 0, $38 = 0, $39 = 0, $40 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48 | 0;
 $view = sp | 0;
 $v = sp + 24 | 0;
 $1 = $m;
 $2 = $j;
 _memset($view | 0, 0, 20) | 0;
 if (!($2 >>> 0 >= (HEAP32[$1 + 4 >> 2] | 0) >>> 0)) {
  _memset($v | 0, 0, 20) | 0;
  HEAP32[$v + 8 >> 2] = (HEAP32[$1 + 12 >> 2] | 0) + ($2 << 3);
  HEAP32[$v >> 2] = HEAP32[$1 >> 2];
  HEAP32[$v + 4 >> 2] = HEAP32[$1 + 8 >> 2];
  HEAP32[$v + 12 >> 2] = HEAP32[$1 + 16 >> 2];
  HEAP32[$v + 16 >> 2] = 0;
  $37 = $view | 0;
  $38 = $v;
  HEAP32[$37 >> 2] = HEAP32[$38 >> 2];
  HEAP32[$37 + 4 >> 2] = HEAP32[$38 + 4 >> 2];
  HEAP32[$37 + 8 >> 2] = HEAP32[$38 + 8 >> 2];
  HEAP32[$37 + 12 >> 2] = HEAP32[$38 + 12 >> 2];
  HEAP32[$37 + 16 >> 2] = HEAP32[$38 + 16 >> 2];
  $39 = $agg_result;
  $40 = $view;
  HEAP32[$39 >> 2] = HEAP32[$40 >> 2];
  HEAP32[$39 + 4 >> 2] = HEAP32[$40 + 4 >> 2];
  HEAP32[$39 + 8 >> 2] = HEAP32[$40 + 8 >> 2];
  HEAP32[$39 + 12 >> 2] = HEAP32[$40 + 12 >> 2];
  HEAP32[$39 + 16 >> 2] = HEAP32[$40 + 16 >> 2];
  STACKTOP = sp;
  return;
 }
 _gsl_error(8392, 11040, 51, 4);
 $11 = $agg_result;
 $12 = $view;
 HEAP32[$11 >> 2] = HEAP32[$12 >> 2];
 HEAP32[$11 + 4 >> 2] = HEAP32[$12 + 4 >> 2];
 HEAP32[$11 + 8 >> 2] = HEAP32[$12 + 8 >> 2];
 HEAP32[$11 + 12 >> 2] = HEAP32[$12 + 12 >> 2];
 HEAP32[$11 + 16 >> 2] = HEAP32[$12 + 16 >> 2];
 STACKTOP = sp;
 return;
}
function _print_arrester_data($ptr) {
 $ptr = $ptr | 0;
 var $1 = 0, $11 = 0, $13 = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 $1 = $ptr + 72 | 0;
 if (!(+HEAPF64[$1 >> 3] > 0.0)) {
  STACKTOP = sp;
  return;
 }
 $11 = HEAP32[$ptr + 156 >> 2] | 0;
 $13 = HEAP32[$ptr + 160 >> 2] | 0;
 _fprintf(HEAP32[2994] | 0, 9680, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 24 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[HEAP32[$ptr + 164 >> 2] >> 2], HEAP32[tempVarArgs + 8 >> 2] = $11, HEAP32[tempVarArgs + 16 >> 2] = $13, tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 _fprintf(HEAP32[2994] | 0, 10624, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = +HEAPF64[$ptr + 56 >> 3], tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 _fprintf(HEAP32[2994] | 0, 7936, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = +HEAPF64[$1 >> 3], tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 _fprintf(HEAP32[2994] | 0, 6384, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = +HEAPF64[$ptr + 80 >> 3], tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 _fprintf(HEAP32[2994] | 0, 5368, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = +HEAPF64[$ptr + 48 >> 3], tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 _fprintf(HEAP32[2994] | 0, 4472, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = +HEAPF64[$ptr + 64 >> 3], tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 STACKTOP = sp;
 return;
}
function _print_arrbez_data($ptr) {
 $ptr = $ptr | 0;
 var $1 = 0, $11 = 0, $13 = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 $1 = $ptr + 56 | 0;
 if (!(+HEAPF64[$1 >> 3] > 0.0)) {
  STACKTOP = sp;
  return;
 }
 $11 = HEAP32[$ptr + 144 >> 2] | 0;
 $13 = HEAP32[$ptr + 148 >> 2] | 0;
 _fprintf(HEAP32[2994] | 0, 8280, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 24 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[HEAP32[$ptr + 156 >> 2] >> 2], HEAP32[tempVarArgs + 8 >> 2] = $11, HEAP32[tempVarArgs + 16 >> 2] = $13, tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 _fprintf(HEAP32[2994] | 0, 6624, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = +HEAPF64[$ptr + 40 >> 3], tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 _fprintf(HEAP32[2994] | 0, 5384, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = +HEAPF64[$1 >> 3], tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 _fprintf(HEAP32[2994] | 0, 4488, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = +HEAPF64[$ptr + 64 >> 3], tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 _fprintf(HEAP32[2994] | 0, 4064, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = +HEAPF64[$ptr + 32 >> 3], tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 _fprintf(HEAP32[2994] | 0, 3696, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = +HEAPF64[$ptr + 48 >> 3], tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 STACKTOP = sp;
 return;
}
function _gsl_permute($p, $data, $stride, $n) {
 $p = $p | 0;
 $data = $data | 0;
 $stride = $stride | 0;
 $n = $n | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $i = 0, $k = 0, $pk = 0, $a = 0, $t = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $t = sp | 0;
 $1 = $p;
 $2 = $data;
 $3 = $stride;
 $4 = $n;
 $i = 0;
 while (1) {
  if (!($i >>> 0 < $4 >>> 0)) {
   break;
  }
  $k = HEAP32[$1 + ($i << 2) >> 2] | 0;
  while (1) {
   if (!($k >>> 0 > $i >>> 0)) {
    break;
   }
   $k = HEAP32[$1 + ($k << 2) >> 2] | 0;
  }
  do {
   if ($k >>> 0 < $i >>> 0) {} else {
    $pk = HEAP32[$1 + ($k << 2) >> 2] | 0;
    if (($pk | 0) == ($i | 0)) {
     break;
    }
    $a = 0;
    while (1) {
     if (!($a >>> 0 < 1 >>> 0)) {
      break;
     }
     HEAPF64[$t + ($a << 3) >> 3] = +HEAPF64[$2 + ((Math_imul($i, $3) | 0) + $a << 3) >> 3];
     $a = $a + 1 | 0;
    }
    while (1) {
     if (($pk | 0) == ($i | 0)) {
      break;
     }
     $a = 0;
     while (1) {
      if (!($a >>> 0 < 1 >>> 0)) {
       break;
      }
      HEAPF64[$2 + ((Math_imul($k, $3) | 0) + $a << 3) >> 3] = +HEAPF64[$2 + ((Math_imul($pk, $3) | 0) + $a << 3) >> 3];
      $a = $a + 1 | 0;
     }
     $k = $pk;
     $pk = HEAP32[$1 + ($k << 2) >> 2] | 0;
    }
    $a = 0;
    while (1) {
     if (!($a >>> 0 < 1 >>> 0)) {
      break;
     }
     HEAPF64[$2 + ((Math_imul($k, $3) | 0) + $a << 3) >> 3] = +HEAPF64[$t + ($a << 3) >> 3];
     $a = $a + 1 | 0;
    }
   }
  } while (0);
  $i = $i + 1 | 0;
 }
 STACKTOP = sp;
 return 0;
}
function _bez_eval($p, $xx) {
 $p = $p | 0;
 $xx = +$xx;
 var $2 = 0, $3 = 0.0, $_052 = 0.0, $sign_0 = 0.0, $23 = 0, $25 = 0.0, $41 = 0.0, $i_0 = 0, $44 = 0, $46 = 0.0, $50 = 0, $52 = 0, $54 = 0.0, $57 = 0.0, $65 = 0.0, $67 = 0.0, $69 = 0.0, $_0 = 0.0, label = 0;
 $2 = HEAP32[$p + 24 >> 2] | 0;
 $3 = +HEAPF64[$2 >> 3];
 if ($3 > $xx) {
  $sign_0 = -1.0;
  $_052 = $3 * 2.0 - $xx;
 } else {
  $sign_0 = 1.0;
  $_052 = $xx;
 }
 if (!($_052 > $3)) {
  $_0 = $sign_0 * (+HEAPF64[HEAP32[$p + 28 >> 2] >> 3] + ($_052 - $3) * +HEAPF64[$p + 8 >> 3]);
  return +$_0;
 }
 $23 = (HEAP32[$p >> 2] | 0) - 1 | 0;
 $25 = +HEAPF64[$2 + ($23 << 3) >> 3];
 if ($_052 < $25) {
  $i_0 = 0;
  $41 = $3;
 } else {
  $_0 = $sign_0 * (+HEAPF64[(HEAP32[$p + 28 >> 2] | 0) + ((HEAP32[$p + 4 >> 2] | 0) - 1 << 3) >> 3] + ($_052 - $25) * +HEAPF64[$p + 16 >> 3]);
  return +$_0;
 }
 while (1) {
  if (($i_0 | 0) >= ($23 | 0)) {
   $_0 = 0.0;
   label = 10;
   break;
  }
  $44 = $i_0 + 1 | 0;
  $46 = +HEAPF64[$2 + ($44 << 3) >> 3];
  if ($_052 > $46) {
   $i_0 = $44;
   $41 = $46;
  } else {
   break;
  }
 }
 if ((label | 0) == 10) {
  return +$_0;
 }
 $50 = $i_0 * 3 | 0;
 $52 = HEAP32[$p + 28 >> 2] | 0;
 $54 = +HEAPF64[$52 + ($50 << 3) >> 3];
 $57 = +HEAPF64[$52 + ($50 + 1 << 3) >> 3];
 $65 = ($_052 - $41) / ($46 - $41);
 $67 = ($57 - $54) * 3.0;
 $69 = (+HEAPF64[$52 + ($50 + 2 << 3) >> 3] - $57) * 3.0;
 $_0 = $sign_0 * ($54 + $65 * ($67 + $65 * ($69 - $67 + $65 * (+HEAPF64[$52 + ($50 + 3 << 3) >> 3] - $54 - $69))));
 return +$_0;
}
function _brent_init($vstate, $f, $root, $x_lower, $x_upper) {
 $vstate = $vstate | 0;
 $f = $f | 0;
 $root = $root | 0;
 $x_lower = +$x_lower;
 $x_upper = +$x_upper;
 var $1 = 0, $3 = 0, $5 = 0.0, $6 = 0.0, $state = 0, $f_lower = 0.0, $f_upper = 0.0, $92 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $3 = $f;
 $5 = $x_lower;
 $6 = $x_upper;
 $state = $vstate;
 HEAPF64[$root >> 3] = ($5 + $6) * .5;
 $f_lower = +FUNCTION_TABLE_ddi[HEAP32[$3 >> 2] & 3]($5, HEAP32[$3 + 4 >> 2] | 0);
 if ((_gsl_finite($f_lower) | 0) == 0) {
  _gsl_error(10864, 8192, 57, 9);
  $1 = 9;
  $92 = $1;
  STACKTOP = sp;
  return $92 | 0;
 }
 $f_upper = +FUNCTION_TABLE_ddi[HEAP32[$3 >> 2] & 3]($6, HEAP32[$3 + 4 >> 2] | 0);
 if ((_gsl_finite($f_upper) | 0) == 0) {
  _gsl_error(10864, 8192, 58, 9);
  $1 = 9;
  $92 = $1;
  STACKTOP = sp;
  return $92 | 0;
 }
 HEAPF64[$state >> 3] = $5;
 HEAPF64[$state + 40 >> 3] = $f_lower;
 HEAPF64[$state + 8 >> 3] = $6;
 HEAPF64[$state + 48 >> 3] = $f_upper;
 HEAPF64[$state + 16 >> 3] = $6;
 HEAPF64[$state + 56 >> 3] = $f_upper;
 HEAPF64[$state + 24 >> 3] = $6 - $5;
 HEAPF64[$state + 32 >> 3] = $6 - $5;
 if ($f_lower < 0.0) {
  if (!($f_upper < 0.0)) {
   label = 13;
  }
 } else {
  label = 13;
 }
 do {
  if ((label | 0) == 13) {
   if ($f_lower > 0.0) {
    if ($f_upper > 0.0) {
     break;
    }
   }
   $1 = 0;
   $92 = $1;
   STACKTOP = sp;
   return $92 | 0;
  }
 } while (0);
 _gsl_error(6592, 8192, 74, 4);
 $1 = 4;
 $92 = $1;
 STACKTOP = sp;
 return $92 | 0;
}
function _read_ground() {
 var $i = 0, $j = 0, $k = 0, $R60 = 0, $Rho = 0, $e0 = 0, $L = 0, $length = 0, $2 = 0.0, $monitor_0 = 0, $38 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64 | 0;
 $i = sp | 0;
 $j = sp + 8 | 0;
 $k = sp + 16 | 0;
 $R60 = sp + 24 | 0;
 $Rho = sp + 32 | 0;
 $e0 = sp + 40 | 0;
 $L = sp + 48 | 0;
 $length = sp + 56 | 0;
 _next_double($R60) | 0;
 $2 = +HEAPF64[$R60 >> 3];
 if ($2 < 0.0) {
  HEAPF64[$R60 >> 3] = $2 * -1.0;
  $monitor_0 = 1;
 } else {
  $monitor_0 = 0;
 }
 _next_double($Rho) | 0;
 _next_double($e0) | 0;
 _next_double($L) | 0;
 _next_double($length) | 0;
 HEAPF64[$L >> 3] = +HEAPF64[$length >> 3] * +HEAPF64[$L >> 3];
 _read_pairs() | 0;
 _read_poles() | 0;
 _reset_assignments() | 0;
 if ((_next_assignment($i, $j, $k) | 0) != 0) {
  STACKTOP = sp;
  return 0;
 }
 if (($monitor_0 | 0) == 0) {
  do {
   _add_ground(HEAP32[$i >> 2] | 0, HEAP32[$j >> 2] | 0, HEAP32[$k >> 2] | 0, +HEAPF64[$R60 >> 3], +HEAPF64[$Rho >> 3], +HEAPF64[$e0 >> 3], +HEAPF64[$L >> 3]) | 0;
  } while ((_next_assignment($i, $j, $k) | 0) == 0);
  STACKTOP = sp;
  return 0;
 } else {
  do {
   $38 = (_add_ground(HEAP32[$i >> 2] | 0, HEAP32[$j >> 2] | 0, HEAP32[$k >> 2] | 0, +HEAPF64[$R60 >> 3], +HEAPF64[$Rho >> 3], +HEAPF64[$e0 >> 3], +HEAPF64[$L >> 3]) | 0) + 64 | 0;
   _add_ammeter(HEAP32[$i >> 2] | 0, HEAP32[$j >> 2] | 0, -2, $38) | 0;
  } while ((_next_assignment($i, $j, $k) | 0) == 0);
  STACKTOP = sp;
  return 0;
 }
 return 0;
}
function _gsl_blas_dgemm($TransA, $TransB, $alpha, $A, $B, $beta, $C) {
 $TransA = $TransA | 0;
 $TransB = $TransB | 0;
 $alpha = +$alpha;
 $A = $A | 0;
 $B = $B | 0;
 $beta = +$beta;
 $C = $C | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0.0, $5 = 0, $6 = 0, $7 = 0.0, $8 = 0, $M = 0, $N = 0, $NA = 0, $MB = 0, $26 = 0, $38 = 0, $50 = 0, $62 = 0, $104 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $TransA;
 $3 = $TransB;
 $4 = $alpha;
 $5 = $A;
 $6 = $B;
 $7 = $beta;
 $8 = $C;
 $M = HEAP32[$8 >> 2] | 0;
 $N = HEAP32[$8 + 4 >> 2] | 0;
 if (($2 | 0) == 111) {
  $26 = HEAP32[$5 >> 2] | 0;
 } else {
  $26 = HEAP32[$5 + 4 >> 2] | 0;
 }
 if (($2 | 0) == 111) {
  $38 = HEAP32[$5 + 4 >> 2] | 0;
 } else {
  $38 = HEAP32[$5 >> 2] | 0;
 }
 $NA = $38;
 if (($3 | 0) == 111) {
  $50 = HEAP32[$6 >> 2] | 0;
 } else {
  $50 = HEAP32[$6 + 4 >> 2] | 0;
 }
 $MB = $50;
 if (($3 | 0) == 111) {
  $62 = HEAP32[$6 + 4 >> 2] | 0;
 } else {
  $62 = HEAP32[$6 >> 2] | 0;
 }
 if (($M | 0) == ($26 | 0)) {
  if (($N | 0) == ($62 | 0)) {
   if (($NA | 0) == ($MB | 0)) {
    _cblas_dgemm(101, $2, $3, $M, $N, $NA, $4, HEAP32[$5 + 12 >> 2] | 0, HEAP32[$5 + 8 >> 2] | 0, HEAP32[$6 + 12 >> 2] | 0, HEAP32[$6 + 8 >> 2] | 0, $7, HEAP32[$8 + 12 >> 2] | 0, HEAP32[$8 + 8 >> 2] | 0);
    $1 = 0;
    $104 = $1;
    STACKTOP = sp;
    return $104 | 0;
   }
  }
 }
 _gsl_error(4224, 9144, 1354, 19);
 $1 = 19;
 $104 = $1;
 STACKTOP = sp;
 return $104 | 0;
}
function _gsl_vector_view_array($agg_result, $base, $n) {
 $agg_result = $agg_result | 0;
 $base = $base | 0;
 $n = $n | 0;
 var $2 = 0, $view = 0, $v = 0, $8 = 0, $9 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48 | 0;
 $view = sp | 0;
 $v = sp + 24 | 0;
 $2 = $n;
 _memset($view | 0, 0, 20) | 0;
 if (($2 | 0) != 0) {
  _memset($v | 0, 0, 20) | 0;
  HEAP32[$v + 8 >> 2] = $base;
  HEAP32[$v >> 2] = $2;
  HEAP32[$v + 4 >> 2] = 1;
  HEAP32[$v + 12 >> 2] = 0;
  HEAP32[$v + 16 >> 2] = 0;
  $21 = $view | 0;
  $22 = $v;
  HEAP32[$21 >> 2] = HEAP32[$22 >> 2];
  HEAP32[$21 + 4 >> 2] = HEAP32[$22 + 4 >> 2];
  HEAP32[$21 + 8 >> 2] = HEAP32[$22 + 8 >> 2];
  HEAP32[$21 + 12 >> 2] = HEAP32[$22 + 12 >> 2];
  HEAP32[$21 + 16 >> 2] = HEAP32[$22 + 16 >> 2];
  $23 = $agg_result;
  $24 = $view;
  HEAP32[$23 >> 2] = HEAP32[$24 >> 2];
  HEAP32[$23 + 4 >> 2] = HEAP32[$24 + 4 >> 2];
  HEAP32[$23 + 8 >> 2] = HEAP32[$24 + 8 >> 2];
  HEAP32[$23 + 12 >> 2] = HEAP32[$24 + 12 >> 2];
  HEAP32[$23 + 16 >> 2] = HEAP32[$24 + 16 >> 2];
  STACKTOP = sp;
  return;
 }
 _gsl_error(9840, 10696, 28, 4);
 $8 = $agg_result;
 $9 = $view;
 HEAP32[$8 >> 2] = HEAP32[$9 >> 2];
 HEAP32[$8 + 4 >> 2] = HEAP32[$9 + 4 >> 2];
 HEAP32[$8 + 8 >> 2] = HEAP32[$9 + 8 >> 2];
 HEAP32[$8 + 12 >> 2] = HEAP32[$9 + 12 >> 2];
 HEAP32[$8 + 16 >> 2] = HEAP32[$9 + 16 >> 2];
 STACKTOP = sp;
 return;
}
function _check_ground($ptr) {
 $ptr = $ptr | 0;
 var $1 = 0, $7 = 0.0, $14 = 0.0, $18 = 0, $20 = 0.0, $22 = 0.0, $30 = 0.0, $32 = 0.0, $37 = 0.0, $40 = 0.0, $45 = 0.0, $48 = 0.0, $49 = 0, $50 = 0.0, $51 = 0.0, $52 = 0, $53 = 0.0, $54 = 0.0, $55 = 0.0;
 $1 = $ptr + 104 | 0;
 $7 = +_gsl_vector_get(HEAP32[(HEAP32[$1 >> 2] | 0) + 20 >> 2] | 0, HEAP32[$ptr + 96 >> 2] | 0);
 $14 = $7 - +_gsl_vector_get(HEAP32[(HEAP32[$1 >> 2] | 0) + 20 >> 2] | 0, HEAP32[$ptr + 100 >> 2] | 0);
 $18 = $ptr + 48 | 0;
 $20 = $14 * +HEAPF64[$ptr + 32 >> 3] + +HEAPF64[$18 >> 3];
 HEAPF64[$ptr + 64 >> 3] = $20;
 $22 = +Math_abs(+$20);
 $30 = +HEAPF64[$ptr >> 3] / +Math_sqrt($22 / +HEAPF64[$ptr + 24 >> 3] + 1.0);
 HEAPF64[$ptr + 16 >> 3] = $30;
 $32 = $20 * $30;
 $37 = $32 * (1.0 / $30 - +HEAPF64[$ptr + 8 >> 3]);
 HEAPF64[$ptr + 56 >> 3] = $37;
 $40 = +HEAPF64[$ptr + 80 >> 3];
 if ($40 > 0.0) {
  $45 = $20 + ($14 - $32) / $40;
  HEAPF64[$ptr + 40 >> 3] = $45;
  $48 = $45;
  $49 = $ptr + 88 | 0;
  $50 = +HEAPF64[$49 >> 3];
  $51 = $48 * $50;
  $52 = $ptr + 72 | 0;
  $53 = +HEAPF64[$52 >> 3];
  $54 = $37 * $53;
  $55 = $51 + $54;
  HEAPF64[$18 >> 3] = $55;
  return;
 } else {
  $48 = +HEAPF64[$ptr + 40 >> 3];
  $49 = $ptr + 88 | 0;
  $50 = +HEAPF64[$49 >> 3];
  $51 = $48 * $50;
  $52 = $ptr + 72 | 0;
  $53 = +HEAPF64[$52 >> 3];
  $54 = $37 * $53;
  $55 = $51 + $54;
  HEAPF64[$18 >> 3] = $55;
  return;
 }
}
function _read_capacitor() {
 var $i = 0, $j = 0, $k = 0, $cap = 0, $5 = 0.0, $6 = 0.0, $12 = 0, $13 = 0, $22 = 0, $24 = 0, $28 = 0, $43 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32 | 0;
 $i = sp | 0;
 $j = sp + 8 | 0;
 $k = sp + 16 | 0;
 $cap = sp + 24 | 0;
 _next_double($cap) | 0;
 $5 = +HEAPF64[$cap >> 3] * 2.0 / +HEAPF64[323];
 $6 = $5 + $5;
 _read_pairs() | 0;
 _read_poles() | 0;
 _reset_assignments() | 0;
 if ((_next_assignment($i, $j, $k) | 0) != 0) {
  STACKTOP = sp;
  return 0;
 }
 do {
  $12 = _malloc(40) | 0;
  $13 = $12;
  if (($12 | 0) == 0) {
   $43 = HEAP32[3164] | 0;
   if (($43 | 0) != 0) {
    _fwrite(10440, 29, 1, $43 | 0) | 0;
   }
   _oe_exit(2);
  } else {
   HEAPF64[$12 >> 3] = $5;
   HEAPF64[$12 + 8 >> 3] = $6;
   HEAPF64[$12 + 16 >> 3] = 0.0;
   $22 = _find_pole(HEAP32[$i >> 2] | 0) | 0;
   $24 = $12 + 32 | 0;
   HEAP32[$24 >> 2] = $22;
   if (($22 | 0) == 0) {
    _oe_exit(15);
    $28 = HEAP32[$24 >> 2] | 0;
   } else {
    $28 = $22;
   }
   HEAP32[$28 + 8 >> 2] = 1;
   _add_y($28, HEAP32[$j >> 2] | 0, HEAP32[$k >> 2] | 0, $5);
   HEAP32[$12 + 24 >> 2] = HEAP32[$j >> 2];
   HEAP32[$12 + 28 >> 2] = HEAP32[$k >> 2];
   HEAP32[$12 + 36 >> 2] = 0;
   HEAP32[(HEAP32[3202] | 0) + 36 >> 2] = $13;
   HEAP32[3202] = $13;
  }
 } while ((_next_assignment($i, $j, $k) | 0) == 0);
 STACKTOP = sp;
 return 0;
}
function _add_ground($i, $j, $k, $R60, $Rho, $e0, $L) {
 $i = $i | 0;
 $j = $j | 0;
 $k = $k | 0;
 $R60 = +$R60;
 $Rho = +$Rho;
 $e0 = +$e0;
 $L = +$L;
 var $1 = 0, $2 = 0, $5 = 0, $15 = 0, $17 = 0, $21 = 0, $25 = 0.0, $29 = 0.0, $51 = 0, $_0 = 0;
 $1 = _malloc(112) | 0;
 $2 = $1;
 if (($1 | 0) == 0) {
  $51 = HEAP32[3164] | 0;
  if (($51 | 0) != 0) {
   _fwrite(10192, 26, 1, $51 | 0) | 0;
  }
  _oe_exit(2);
  $_0 = 0;
  return $_0 | 0;
 } else {
  $5 = $1;
  HEAPF64[$5 >> 3] = $R60;
  HEAPF64[$1 + 8 >> 3] = 1.0 / $R60;
  HEAPF64[$1 + 24 >> 3] = $Rho * $e0 / $R60 / $R60 / 6.283185;
  $15 = _find_pole($i) | 0;
  $17 = $1 + 104 | 0;
  HEAP32[$17 >> 2] = $15;
  if (($15 | 0) == 0) {
   _oe_exit(15);
   $21 = HEAP32[$17 >> 2] | 0;
  } else {
   $21 = $15;
  }
  HEAP32[$21 + 8 >> 2] = 1;
  $25 = $L * 2.0 / +HEAPF64[323];
  HEAPF64[$1 + 80 >> 3] = $25;
  $29 = 1.0 / ($25 + $R60);
  HEAPF64[$1 + 32 >> 3] = $29;
  HEAPF64[$1 + 72 >> 3] = $29 * $R60;
  HEAPF64[$1 + 88 >> 3] = $29 * $25;
  _add_y($21, $j, $k, $29);
  HEAP32[$1 + 96 >> 2] = $j;
  HEAP32[$1 + 100 >> 2] = $k;
  HEAP32[$1 + 108 >> 2] = 0;
  _memset($1 + 40 | 0, 0, 32) | 0;
  HEAPF64[$1 + 16 >> 3] = +HEAPF64[$5 >> 3];
  HEAP32[(HEAP32[3186] | 0) + 108 >> 2] = $2;
  HEAP32[3186] = $2;
  $_0 = $2;
  return $_0 | 0;
 }
 return 0;
}
function _gsl_root_test_interval($x_lower, $x_upper, $epsabs, $epsrel) {
 $x_lower = +$x_lower;
 $x_upper = +$x_upper;
 $epsabs = +$epsabs;
 $epsrel = +$epsrel;
 var $1 = 0, $2 = 0.0, $3 = 0.0, $4 = 0.0, $5 = 0.0, $abs_lower = 0.0, $abs_upper = 0.0, $min_abs = 0.0, $60 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $2 = $x_lower;
 $3 = $x_upper;
 $4 = $epsabs;
 $5 = $epsrel;
 $abs_lower = +Math_abs(+$2);
 $abs_upper = +Math_abs(+$3);
 if ($5 < 0.0) {
  _gsl_error(10472, 10848, 34, 13);
  $1 = 13;
  $60 = $1;
  STACKTOP = sp;
  return $60 | 0;
 }
 if ($4 < 0.0) {
  _gsl_error(8160, 10848, 37, 13);
  $1 = 13;
  $60 = $1;
  STACKTOP = sp;
  return $60 | 0;
 }
 if ($2 > $3) {
  _gsl_error(6552, 10848, 40, 4);
  $1 = 4;
  $60 = $1;
  STACKTOP = sp;
  return $60 | 0;
 }
 if ($2 > 0.0) {
  if ($3 > 0.0) {
   label = 14;
  } else {
   label = 12;
  }
 } else {
  label = 12;
 }
 do {
  if ((label | 0) == 12) {
   if ($2 < 0.0) {
    if ($3 < 0.0) {
     label = 14;
     break;
    }
   }
   $min_abs = 0.0;
  }
 } while (0);
 if ((label | 0) == 14) {
  $min_abs = +_GSL_MIN_DBL($abs_lower, $abs_upper);
 }
 if (+Math_abs(+($3 - $2)) < $4 + $5 * $min_abs) {
  $1 = 0;
  $60 = $1;
  STACKTOP = sp;
  return $60 | 0;
 } else {
  $1 = -2;
  $60 = $1;
  STACKTOP = sp;
  return $60 | 0;
 }
 return 0;
}
function _strncasecmp($_l, $_r, $n) {
 $_l = $_l | 0;
 $_r = $_r | 0;
 $n = $n | 0;
 var $2 = 0, $_in = 0, $_021_in = 0, $r_020 = 0, $l_019 = 0, $_021 = 0, $5 = 0, $11 = 0, $16 = 0, $17 = 0, $18 = 0, $20 = 0, $r_0_lcssa = 0, $22 = 0, $_017 = 0;
 if (($n | 0) == 0) {
  $_017 = 0;
  return $_017 | 0;
 }
 $2 = HEAP8[$_l] | 0;
 L4 : do {
  if ($2 << 24 >> 24 == 0) {
   $r_0_lcssa = $_r;
   $20 = 0;
  } else {
   $l_019 = $_l;
   $r_020 = $_r;
   $_021_in = $n;
   $_in = $2;
   while (1) {
    $_021 = $_021_in - 1 | 0;
    $5 = HEAP8[$r_020] | 0;
    if ($5 << 24 >> 24 == 0 | ($_021 | 0) == 0) {
     $r_0_lcssa = $r_020;
     $20 = $_in;
     break L4;
    }
    if (!($_in << 24 >> 24 == $5 << 24 >> 24)) {
     $11 = _tolower($_in & 255 | 0) | 0;
     if (($11 | 0) != (_tolower(HEAPU8[$r_020] | 0 | 0) | 0)) {
      break;
     }
    }
    $16 = $l_019 + 1 | 0;
    $17 = $r_020 + 1 | 0;
    $18 = HEAP8[$16] | 0;
    if ($18 << 24 >> 24 == 0) {
     $r_0_lcssa = $17;
     $20 = 0;
     break L4;
    } else {
     $l_019 = $16;
     $r_020 = $17;
     $_021_in = $_021;
     $_in = $18;
    }
   }
   $r_0_lcssa = $r_020;
   $20 = HEAP8[$l_019] | 0;
  }
 } while (0);
 $22 = _tolower($20 & 255 | 0) | 0;
 $_017 = $22 - (_tolower(HEAPU8[$r_0_lcssa] | 0 | 0) | 0) | 0;
 return $_017 | 0;
}
function ___strchrnul($s, $c) {
 $s = $s | 0;
 $c = $c | 0;
 var $1 = 0, $3 = 0, $_025 = 0, $12 = 0, $18 = 0, $w_0 = 0, $21 = 0, $27 = 0, $29 = 0, $38 = 0, $_1 = 0, $41 = 0, $_0 = 0, label = 0;
 $1 = $c & 255;
 if (($1 | 0) == 0) {
  $_0 = $s + (_strlen($s | 0) | 0) | 0;
  return $_0 | 0;
 }
 $3 = $c & 255;
 $_025 = $s;
 while (1) {
  if (($_025 & 3 | 0) == 0) {
   label = 7;
   break;
  }
  $12 = HEAP8[$_025] | 0;
  if ($12 << 24 >> 24 == 0) {
   $_0 = $_025;
   label = 13;
   break;
  }
  if ($12 << 24 >> 24 == $3 << 24 >> 24) {
   $_0 = $_025;
   label = 13;
   break;
  } else {
   $_025 = $_025 + 1 | 0;
  }
 }
 if ((label | 0) == 7) {
  $18 = Math_imul($1, 16843009) | 0;
  $w_0 = $_025;
  while (1) {
   $21 = HEAP32[$w_0 >> 2] | 0;
   $27 = $21 & 255;
   if ((($21 & -2139062144 ^ -2139062144) & $21 - 16843009 | 0) != 0) {
    break;
   }
   $29 = $21 ^ $18;
   if ((($29 & -2139062144 ^ -2139062144) & $29 - 16843009 | 0) == 0) {
    $w_0 = $w_0 + 4 | 0;
   } else {
    break;
   }
  }
  $_1 = $w_0;
  $38 = $27;
  while (1) {
   $41 = $_1 + 1 | 0;
   if ($38 << 24 >> 24 == 0 | $38 << 24 >> 24 == $3 << 24 >> 24) {
    $_0 = $_1;
    break;
   }
   $_1 = $41;
   $38 = HEAP8[$41] | 0;
  }
  return $_0 | 0;
 } else if ((label | 0) == 13) {
  return $_0 | 0;
 }
 return 0;
}
function _bez_d1($p, $xx) {
 $p = $p | 0;
 $xx = +$xx;
 var $2 = 0, $3 = 0.0, $_038 = 0.0, $16 = 0, $23 = 0.0, $i_0 = 0, $26 = 0, $28 = 0.0, $31 = 0.0, $33 = 0, $35 = 0, $37 = 0.0, $40 = 0.0, $48 = 0.0, $50 = 0.0, $52 = 0.0, $_0 = 0.0, label = 0;
 $2 = HEAP32[$p + 24 >> 2] | 0;
 $3 = +HEAPF64[$2 >> 3];
 if ($3 > $xx) {
  $_038 = $3 * 2.0 - $xx;
 } else {
  $_038 = $xx;
 }
 if (!($_038 > $3)) {
  $_0 = +HEAPF64[$p + 8 >> 3];
  return +$_0;
 }
 $16 = (HEAP32[$p >> 2] | 0) - 1 | 0;
 if ($_038 < +HEAPF64[$2 + ($16 << 3) >> 3]) {
  $i_0 = 0;
  $23 = $3;
 } else {
  $_0 = +HEAPF64[$p + 16 >> 3];
  return +$_0;
 }
 while (1) {
  if (($i_0 | 0) >= ($16 | 0)) {
   $_0 = 0.0;
   label = 10;
   break;
  }
  $26 = $i_0 + 1 | 0;
  $28 = +HEAPF64[$2 + ($26 << 3) >> 3];
  if ($_038 > $28) {
   $i_0 = $26;
   $23 = $28;
  } else {
   break;
  }
 }
 if ((label | 0) == 10) {
  return +$_0;
 }
 $31 = $28 - $23;
 $33 = $i_0 * 3 | 0;
 $35 = HEAP32[$p + 28 >> 2] | 0;
 $37 = +HEAPF64[$35 + ($33 << 3) >> 3];
 $40 = +HEAPF64[$35 + ($33 + 1 << 3) >> 3];
 $48 = ($_038 - $23) / $31;
 $50 = ($40 - $37) * 3.0;
 $52 = (+HEAPF64[$35 + ($33 + 2 << 3) >> 3] - $40) * 3.0;
 $_0 = 1.0 / $31 * ($50 + $48 * (($52 - $50) * 2.0 + $48 * (+HEAPF64[$35 + ($33 + 3 << 3) >> 3] - $37 - $52) * 3.0));
 return +$_0;
}
function _atoi($s) {
 $s = $s | 0;
 var $_0 = 0, $6 = 0, $8 = 0, $9 = 0, $neg_0 = 0, $12 = 0, $_1_ph = 0, $neg_1_ph = 0, $14 = 0, $n_010 = 0, $_19 = 0, $16 = 0, $18 = 0, $19 = 0, $n_0_lcssa = 0, $21 = 0, $22 = 0, $23 = 0, label = 0;
 $_0 = $s;
 while (1) {
  $6 = $_0 + 1 | 0;
  if ((_isspace(HEAP8[$_0] | 0) | 0) == 0) {
   break;
  } else {
   $_0 = $6;
  }
 }
 $8 = HEAP8[$_0] | 0;
 $9 = $8 << 24 >> 24;
 if (($9 | 0) == 43) {
  $neg_0 = 0;
  label = 5;
 } else if (($9 | 0) == 45) {
  $neg_0 = 1;
  label = 5;
 } else {
  $neg_1_ph = 0;
  $_1_ph = $_0;
  $12 = $8;
 }
 if ((label | 0) == 5) {
  $neg_1_ph = $neg_0;
  $_1_ph = $6;
  $12 = HEAP8[$6] | 0;
 }
 if ((($12 << 24 >> 24) - 48 | 0) >>> 0 < 10 >>> 0) {
  $_19 = $_1_ph;
  $n_010 = 0;
  $14 = $12;
 } else {
  $n_0_lcssa = 0;
  $21 = ($neg_1_ph | 0) != 0;
  $22 = -$n_0_lcssa | 0;
  $23 = $21 ? $n_0_lcssa : $22;
  return $23 | 0;
 }
 while (1) {
  $16 = $_19 + 1 | 0;
  $18 = ($n_010 * 10 | 0) + 48 - ($14 << 24 >> 24) | 0;
  $19 = HEAP8[$16] | 0;
  if ((($19 << 24 >> 24) - 48 | 0) >>> 0 < 10 >>> 0) {
   $_19 = $16;
   $n_010 = $18;
   $14 = $19;
  } else {
   $n_0_lcssa = $18;
   break;
  }
 }
 $21 = ($neg_1_ph | 0) != 0;
 $22 = -$n_0_lcssa | 0;
 $23 = $21 ? $n_0_lcssa : $22;
 return $23 | 0;
}
function _lpm_answers_cleanup($ptr) {
 $ptr = $ptr | 0;
 var $5 = 0, $16 = 0.0, $22 = 0.0, $26 = 0.0, $si_pos_0_i = 0.0, $38 = 0.0, $si_neg_0_i = 0.0, $45 = 0.0, $48 = 0.0;
 do {
  if ((HEAP32[$ptr + 84 >> 2] | 0) == 1) {
   $5 = $ptr + 72 | 0;
   HEAPF64[$5 >> 3] = 1.0;
   _add_y(HEAP32[$ptr + 96 >> 2] | 0, HEAP32[$ptr + 88 >> 2] | 0, HEAP32[$ptr + 92 >> 2] | 0, -1.0e3);
   $48 = +HEAPF64[$5 >> 3];
  } else {
   if ((HEAP32[2870] | 0) != 0) {
    $16 = +_calculate_lpm_si($ptr);
    HEAPF64[$ptr + 72 >> 3] = $16;
    $48 = $16;
    break;
   }
   $22 = +HEAPF64[$ptr + 24 >> 3];
   if (+HEAPF64[$ptr + 32 >> 3] < $22) {
    $si_pos_0_i = .9999;
   } else {
    $26 = +HEAPF64[$ptr + 64 >> 3];
    if ($26 > 0.0) {
     $si_pos_0_i = $26 / +HEAPF64[$ptr >> 3];
    } else {
     $si_pos_0_i = 0.0;
    }
   }
   if (+HEAPF64[$ptr + 40 >> 3] < $22) {
    $si_neg_0_i = .9999;
   } else {
    $38 = +HEAPF64[$ptr + 56 >> 3];
    if ($38 > 0.0) {
     $si_neg_0_i = $38 / +HEAPF64[$ptr >> 3];
    } else {
     $si_neg_0_i = 0.0;
    }
   }
   $45 = $si_pos_0_i > $si_neg_0_i ? $si_pos_0_i : $si_neg_0_i;
   HEAPF64[$ptr + 72 >> 3] = $45;
   $48 = $45;
  }
 } while (0);
 if (!($48 > +HEAPF64[1434])) {
  return;
 }
 HEAPF64[1434] = $48;
 return;
}
function _check_pipegap($ptr) {
 $ptr = $ptr | 0;
 var $2 = 0, $4 = 0, $6 = 0, $7 = 0, $9 = 0.0, $12 = 0.0, $13 = 0, $14 = 0, $19 = 0.0, $21 = 0, $23 = 0.0, $25 = 0.0, $26 = 0, $32 = 0.0, $39 = 0.0, $47 = 0.0;
 $2 = HEAP32[$ptr + 68 >> 2] | 0;
 $4 = HEAP32[$ptr + 60 >> 2] | 0;
 $6 = HEAP32[$ptr + 64 >> 2] | 0;
 $7 = $2 + 20 | 0;
 $9 = +_gsl_vector_get(HEAP32[$7 >> 2] | 0, $4);
 $12 = $9 - +_gsl_vector_get(HEAP32[$7 >> 2] | 0, $6);
 $13 = $12 > 0.0;
 $14 = $ptr + 56 | 0;
 if ((HEAP32[$14 >> 2] | 0) != 0) {
  $19 = +HEAPF64[$ptr + 32 >> 3];
  $21 = $ptr + 40 | 0;
  $23 = $12 * $19 + +HEAPF64[$21 >> 3];
  HEAPF64[$ptr + 48 >> 3] = $23;
  $25 = +Math_abs(+$23);
  $26 = $ptr + 24 | 0;
  if ($25 > +Math_abs(+(+HEAPF64[$26 >> 3]))) {
   HEAPF64[$26 >> 3] = $23;
  }
  $32 = +Math_abs(+$12);
  if (!($32 < +HEAPF64[$ptr >> 3])) {
   return;
  }
  HEAP32[$14 >> 2] = 0;
  _add_y($2, $4, $6, -0.0 - $19);
  HEAPF64[$21 >> 3] = 0.0;
  return;
 }
 $39 = +Math_abs(+$12);
 if (!($39 > +HEAPF64[$ptr >> 3])) {
  return;
 }
 HEAP32[$14 >> 2] = 1;
 _add_y($2, $4, $6, +HEAPF64[$ptr + 32 >> 3]);
 $47 = +HEAPF64[$ptr + 8 >> 3];
 if ($13) {
  HEAPF64[$ptr + 40 >> 3] = -0.0 - $47;
 } else {
  HEAPF64[$ptr + 40 >> 3] = $47;
 }
 HEAP32[2964] = 0;
 return;
}
function _read_steepfront() {
 var $i = 0, $j = 0, $k = 0, $fpeak = 0, $ftf = 0, $ftt = 0, $ftstart = 0, $fsi = 0, $11 = 0, $12 = 0, $30 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64 | 0;
 $i = sp | 0;
 $j = sp + 8 | 0;
 $k = sp + 16 | 0;
 $fpeak = sp + 24 | 0;
 $ftf = sp + 32 | 0;
 $ftt = sp + 40 | 0;
 $ftstart = sp + 48 | 0;
 $fsi = sp + 56 | 0;
 _next_double($fpeak) | 0;
 _next_double($ftf) | 0;
 _next_double($ftt) | 0;
 _next_double($ftstart) | 0;
 _next_double($fsi) | 0;
 _read_pairs() | 0;
 _read_poles() | 0;
 _reset_assignments() | 0;
 if ((_next_assignment($i, $j, $k) | 0) != 0) {
  STACKTOP = sp;
  return 0;
 }
 do {
  $11 = _malloc(72) | 0;
  $12 = $11;
  if (($11 | 0) == 0) {
   $30 = HEAP32[3164] | 0;
   if (($30 | 0) != 0) {
    _fwrite(9184, 30, 1, $30 | 0) | 0;
   }
   _oe_exit(2);
  } else {
   HEAP32[$11 + 48 >> 2] = 0;
   _move_steepfront($12, HEAP32[$i >> 2] | 0, HEAP32[$j >> 2] | 0, HEAP32[$k >> 2] | 0, +HEAPF64[$fpeak >> 3], +HEAPF64[$ftf >> 3], +HEAPF64[$ftt >> 3], +HEAPF64[$ftstart >> 3], +HEAPF64[$fsi >> 3]);
   HEAP32[$11 + 64 >> 2] = 0;
   HEAP32[(HEAP32[2890] | 0) + 64 >> 2] = $12;
   HEAP32[2890] = $12;
  }
 } while ((_next_assignment($i, $j, $k) | 0) == 0);
 STACKTOP = sp;
 return 0;
}
function _print_meter_data($ptr) {
 $ptr = $ptr | 0;
 var $1 = 0, $2 = 0, $18 = 0, $24 = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 $1 = $ptr + 4 | 0;
 $2 = HEAP32[$1 >> 2] | 0;
 _fprintf(HEAP32[2994] | 0, 5776, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[$ptr + 8 >> 2], tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 do {
  if (($2 | 0) == (-2 | 0)) {
   _fwrite(7528, 20, 1, HEAP32[2994] | 0) | 0;
  } else if (($2 | 0) == (-1 | 0)) {
   _fwrite(9600, 20, 1, HEAP32[2994] | 0) | 0;
  } else if (($2 | 0) == (-3 | 0)) {
   _fwrite(6128, 20, 1, HEAP32[2994] | 0) | 0;
  } else {
   $18 = HEAP32[2994] | 0;
   if (($2 | 0) == -4) {
    _fwrite(5104, 20, 1, $18 | 0) | 0;
    break;
   } else {
    $24 = HEAP32[$1 >> 2] | 0;
    _fprintf($18 | 0, 4344, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[$ptr >> 2], HEAP32[tempVarArgs + 8 >> 2] = $24, tempVarArgs) | 0) | 0;
    STACKTOP = tempVarArgs;
    break;
   }
  }
 } while (0);
 _fprintf(HEAP32[2994] | 0, 3992, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = +HEAPF64[$ptr + 16 >> 3], tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 STACKTOP = sp;
 return;
}
function _strspn($s, $c) {
 $s = $s | 0;
 $c = $c | 0;
 var $byteset = 0, $2 = 0, $_019 = 0, $15 = 0, $_01821 = 0, $16 = 0, $20 = 0, $23 = 0, $24 = 0, $_1 = 0, $26 = 0, $29 = 0, $_0 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32 | 0;
 $byteset = sp | 0;
 _memset($byteset | 0, 0, 32) | 0;
 $2 = HEAP8[$c] | 0;
 if ($2 << 24 >> 24 == 0) {
  $_0 = 0;
  STACKTOP = sp;
  return $_0 | 0;
 }
 if ((HEAP8[$c + 1 | 0] | 0) == 0) {
  $_019 = $s;
  while (1) {
   if ((HEAP8[$_019] | 0) == $2 << 24 >> 24) {
    $_019 = $_019 + 1 | 0;
   } else {
    break;
   }
  }
  $_0 = $_019 - $s | 0;
  STACKTOP = sp;
  return $_0 | 0;
 } else {
  $_01821 = $c;
  $15 = $2;
 }
 while (1) {
  $16 = $15 & 255;
  $20 = $byteset + ($16 >>> 5 << 2) | 0;
  HEAP32[$20 >> 2] = HEAP32[$20 >> 2] | 1 << ($16 & 31);
  $23 = $_01821 + 1 | 0;
  $24 = HEAP8[$23] | 0;
  if ($24 << 24 >> 24 == 0) {
   $_1 = $s;
   break;
  } else {
   $_01821 = $23;
   $15 = $24;
  }
 }
 while (1) {
  $26 = HEAP8[$_1] | 0;
  if ($26 << 24 >> 24 == 0) {
   break;
  }
  $29 = $26 & 255;
  if ((HEAP32[$byteset + ($29 >>> 5 << 2) >> 2] & 1 << ($29 & 31) | 0) == 0) {
   break;
  } else {
   $_1 = $_1 + 1 | 0;
  }
 }
 $_0 = $_1 - $s | 0;
 STACKTOP = sp;
 return $_0 | 0;
}
function _gsl_matrix_swap_columns($m, $i, $j) {
 $m = $m | 0;
 $i = $i | 0;
 $j = $j | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $size1 = 0, $size2 = 0, $col1 = 0, $col2 = 0, $p = 0, $k = 0, $n = 0, $tmp = 0.0, $89 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $m;
 $3 = $i;
 $4 = $j;
 $size1 = HEAP32[$2 >> 2] | 0;
 $size2 = HEAP32[$2 + 4 >> 2] | 0;
 if ($3 >>> 0 >= $size2 >>> 0) {
  _gsl_error(6704, 11e3, 64, 4);
  $1 = 4;
  $89 = $1;
  STACKTOP = sp;
  return $89 | 0;
 }
 if ($4 >>> 0 >= $size2 >>> 0) {
  _gsl_error(5408, 11e3, 69, 4);
  $1 = 4;
  $89 = $1;
  STACKTOP = sp;
  return $89 | 0;
 }
 if (($3 | 0) != ($4 | 0)) {
  $col1 = (HEAP32[$2 + 12 >> 2] | 0) + ($3 << 3) | 0;
  $col2 = (HEAP32[$2 + 12 >> 2] | 0) + ($4 << 3) | 0;
  $p = 0;
  while (1) {
   if (!($p >>> 0 < $size1 >>> 0)) {
    break;
   }
   $n = Math_imul($p, HEAP32[$2 + 8 >> 2] | 0) | 0;
   $k = 0;
   while (1) {
    if (!($k >>> 0 < 1 >>> 0)) {
     break;
    }
    $tmp = +HEAPF64[$col1 + ($n + $k << 3) >> 3];
    HEAPF64[$col1 + ($n + $k << 3) >> 3] = +HEAPF64[$col2 + ($n + $k << 3) >> 3];
    HEAPF64[$col2 + ($n + $k << 3) >> 3] = $tmp;
    $k = $k + 1 | 0;
   }
   $p = $p + 1 | 0;
  }
 }
 $1 = 0;
 $89 = $1;
 STACKTOP = sp;
 return $89 | 0;
}
function _print_source_data($ptr) {
 $ptr = $ptr | 0;
 var $2 = 0, $10 = 0, $13 = 0, $14 = 0, $15 = 0, $i_09 = 0, $17 = 0, $19 = 0.0, $21 = 0.0, $23 = 0.0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 $2 = $ptr + 4 | 0;
 _fprintf(HEAP32[2994] | 0, 4512, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[HEAP32[$2 >> 2] >> 2], tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 _fwrite(9256, 35, 1, HEAP32[2994] | 0) | 0;
 $10 = _find_pole_defn(HEAP32[$2 >> 2] | 0) | 0;
 if ((HEAP32[3122] | 0) <= 0) {
  STACKTOP = sp;
  return;
 }
 $13 = $10 + 36 | 0;
 $14 = $10 + 32 | 0;
 $15 = $ptr | 0;
 $i_09 = 0;
 do {
  $17 = HEAP32[2994] | 0;
  $19 = +_gsl_vector_get(HEAP32[$13 >> 2] | 0, $i_09);
  $21 = +_gsl_vector_get(HEAP32[$14 >> 2] | 0, $i_09);
  $23 = +_gsl_vector_get(HEAP32[$15 >> 2] | 0, $i_09);
  _fprintf($17 | 0, 7352, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 32 | 0, HEAP32[tempVarArgs >> 2] = $i_09, HEAPF64[tempVarArgs + 8 >> 3] = $19, HEAPF64[tempVarArgs + 16 >> 3] = $21, HEAPF64[tempVarArgs + 24 >> 3] = $23, tempVarArgs) | 0) | 0;
  STACKTOP = tempVarArgs;
  $i_09 = $i_09 + 1 | 0;
 } while (($i_09 | 0) < (HEAP32[3122] | 0));
 STACKTOP = sp;
 return;
}
function _gsl_matrix_transpose_memcpy($dest, $src) {
 $dest = $dest | 0;
 $src = $src | 0;
 var $1 = 0, $2 = 0, $3 = 0, $dest_size1 = 0, $dest_size2 = 0, $i = 0, $j = 0, $k = 0, $e1 = 0, $61 = 0, $85 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $dest;
 $3 = $src;
 $dest_size1 = HEAP32[$2 >> 2] | 0;
 $dest_size2 = HEAP32[$2 + 4 >> 2] | 0;
 if (($dest_size2 | 0) == (HEAP32[$3 >> 2] | 0)) {
  if (($dest_size1 | 0) == (HEAP32[$3 + 4 >> 2] | 0)) {
   $i = 0;
   while (1) {
    if (!($i >>> 0 < $dest_size1 >>> 0)) {
     break;
    }
    $j = 0;
    while (1) {
     if (!($j >>> 0 < $dest_size2 >>> 0)) {
      break;
     }
     $k = 0;
     while (1) {
      if (!($k >>> 0 < 1 >>> 0)) {
       break;
      }
      $e1 = (Math_imul($i, HEAP32[$2 + 8 >> 2] | 0) | 0) + $j + $k | 0;
      $61 = (Math_imul($j, HEAP32[$3 + 8 >> 2] | 0) | 0) + $i + $k | 0;
      HEAPF64[(HEAP32[$2 + 12 >> 2] | 0) + ($e1 << 3) >> 3] = +HEAPF64[(HEAP32[$3 + 12 >> 2] | 0) + ($61 << 3) >> 3];
      $k = $k + 1 | 0;
     }
     $j = $j + 1 | 0;
    }
    $i = $i + 1 | 0;
   }
   $1 = 0;
   $85 = $1;
   STACKTOP = sp;
   return $85 | 0;
  }
 }
 _gsl_error(3104, 11e3, 192, 19);
 $1 = 19;
 $85 = $1;
 STACKTOP = sp;
 return $85 | 0;
}
function _check_insulator($ptr) {
 $ptr = $ptr | 0;
 var $1 = 0, $8 = 0, $10 = 0, $12 = 0, $13 = 0, $15 = 0.0, $18 = 0.0, $19 = 0.0, $22 = 0.0, $27 = 0.0, $29 = 0.0, $32 = 0, $36 = 0, $42 = 0.0;
 $1 = $ptr + 64 | 0;
 if ((HEAP32[3196] | HEAP32[$1 >> 2] | 0) != 0) {
  return;
 }
 $8 = HEAP32[$ptr + 76 >> 2] | 0;
 $10 = HEAP32[$ptr + 68 >> 2] | 0;
 $12 = HEAP32[$ptr + 72 >> 2] | 0;
 $13 = $8 + 20 | 0;
 $15 = +_gsl_vector_get(HEAP32[$13 >> 2] | 0, $10);
 $18 = $15 - +_gsl_vector_get(HEAP32[$13 >> 2] | 0, $12);
 $19 = +Math_abs(+$18);
 $22 = $19 - +HEAPF64[$ptr + 8 >> 3];
 do {
  if ($22 > 0.0) {
   $27 = +Math_pow(+$22, +(+HEAPF64[$ptr + 16 >> 3]));
   $29 = $27 * +HEAPF64[323];
   if ($18 < 0.0) {
    $36 = $ptr + 32 | 0;
    HEAPF64[$36 >> 3] = $29 + +HEAPF64[$36 >> 3];
    break;
   } else {
    $32 = $ptr + 24 | 0;
    HEAPF64[$32 >> 3] = $29 + +HEAPF64[$32 >> 3];
    break;
   }
  }
 } while (0);
 $42 = +HEAPF64[$ptr + 40 >> 3];
 if (+HEAPF64[$ptr + 24 >> 3] < $42) {
  if (+HEAPF64[$ptr + 32 >> 3] < $42) {
   return;
  }
 }
 HEAP32[$1 >> 2] = 1;
 if ((HEAP32[3192] | 0) != 0) {
  HEAP32[3194] = 1;
 }
 HEAPF64[$ptr + 48 >> 3] = +HEAPF64[4];
 _add_y($8, $10, $12, 1.0e3);
 return;
}
function _read_pairs() {
 var $j = 0, $k = 0, $7 = 0, $14 = 0, $28 = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 $j = sp | 0;
 $k = sp + 8 | 0;
 _gsl_matrix_int_set_zero(HEAP32[2992] | 0);
 if ((_strcmp(_first_token() | 0, 848) | 0) != 0) {
  STACKTOP = sp;
  return 0;
 }
 $7 = _atoi(_next_token() | 0) | 0;
 HEAP32[$j >> 2] = $7;
 if ((_next_int($k) | 0) == 0) {
  _mark_pair($7, HEAP32[$k >> 2] | 0) | 0;
 } else {
  $14 = HEAP32[3164] | 0;
  if (($14 | 0) != 0) {
   _fprintf($14 | 0, 3712, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = $7, tempVarArgs) | 0) | 0;
   STACKTOP = tempVarArgs;
  }
  _oe_exit(13);
 }
 if ((_next_int($j) | 0) != 0) {
  STACKTOP = sp;
  return 0;
 }
 do {
  if ((_next_int($k) | 0) == 0) {
   _mark_pair(HEAP32[$j >> 2] | 0, HEAP32[$k >> 2] | 0) | 0;
  } else {
   $28 = HEAP32[3164] | 0;
   if (($28 | 0) != 0) {
    _fprintf($28 | 0, 3712, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[$j >> 2], tempVarArgs) | 0) | 0;
    STACKTOP = tempVarArgs;
   }
   _oe_exit(13);
  }
 } while ((_next_int($j) | 0) == 0);
 STACKTOP = sp;
 return 0;
}
function ___shgetc($f) {
 $f = $f | 0;
 var $1 = 0, $2 = 0, $9 = 0, $14 = 0, $_pre = 0, $18 = 0, $25 = 0, $_pre27 = 0, $36 = 0, $41 = 0, $_0 = 0, label = 0;
 $1 = $f + 104 | 0;
 $2 = HEAP32[$1 >> 2] | 0;
 if (($2 | 0) == 0) {
  label = 3;
 } else {
  if ((HEAP32[$f + 108 >> 2] | 0) < ($2 | 0)) {
   label = 3;
  }
 }
 if ((label | 0) == 3) {
  $9 = ___uflow($f) | 0;
  if (($9 | 0) >= 0) {
   $14 = HEAP32[$1 >> 2] | 0;
   $_pre = HEAP32[$f + 8 >> 2] | 0;
   if (($14 | 0) == 0) {
    label = 8;
   } else {
    $18 = HEAP32[$f + 4 >> 2] | 0;
    $25 = $14 - (HEAP32[$f + 108 >> 2] | 0) - 1 | 0;
    if (($_pre - $18 | 0) > ($25 | 0)) {
     HEAP32[$f + 100 >> 2] = $18 + $25;
    } else {
     label = 8;
    }
   }
   if ((label | 0) == 8) {
    HEAP32[$f + 100 >> 2] = $_pre;
   }
   $_pre27 = HEAP32[$f + 4 >> 2] | 0;
   if (($_pre | 0) != 0) {
    $36 = $f + 108 | 0;
    HEAP32[$36 >> 2] = $_pre + 1 - $_pre27 + (HEAP32[$36 >> 2] | 0);
   }
   $41 = $_pre27 - 1 | 0;
   if ((HEAPU8[$41] | 0 | 0) == ($9 | 0)) {
    $_0 = $9;
    return $_0 | 0;
   }
   HEAP8[$41] = $9;
   $_0 = $9;
   return $_0 | 0;
  }
 }
 HEAP32[$f + 100 >> 2] = 0;
 $_0 = -1;
 return $_0 | 0;
}
function _WriteTextTimeStep($head, $t) {
 $head = $head | 0;
 $t = +$t;
 var $2 = 0, $5 = 0, $7 = 0, $14 = 0.0, $15 = 0.0, $16 = 0, $24 = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 $2 = HEAP8[2528] | 0 ? 9 : 44;
 _fprintf(HEAP32[3206] | 0, 8976, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAPF64[tempVarArgs >> 3] = $t, HEAP32[tempVarArgs + 8 >> 2] = $2, tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 $5 = HEAP32[$head + 32 >> 2] | 0;
 if (($5 | 0) == 0) {
  STACKTOP = sp;
  return;
 } else {
  $7 = $5;
 }
 do {
  $14 = +HEAPF64[HEAP32[$7 + 24 >> 2] >> 3] - +HEAPF64[HEAP32[$7 + 28 >> 2] >> 3];
  $15 = +Math_abs(+$14);
  $16 = $7 + 16 | 0;
  if ($15 > +Math_abs(+(+HEAPF64[$16 >> 3]))) {
   HEAPF64[$16 >> 3] = $14;
  }
  _fprintf(HEAP32[3206] | 0, 8968, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = $14, tempVarArgs) | 0) | 0;
  STACKTOP = tempVarArgs;
  $24 = $7 + 32 | 0;
  if ((HEAP32[$24 >> 2] | 0) == 0) {
   _fputc(10, HEAP32[3206] | 0) | 0;
  } else {
   _fputc((HEAP8[2528] | 0 ? 9 : 44) | 0, HEAP32[3206] | 0) | 0;
  }
  $7 = HEAP32[$24 >> 2] | 0;
 } while (($7 | 0) != 0);
 STACKTOP = sp;
 return;
}
function _gsl_eigen_symmv_alloc($n) {
 $n = $n | 0;
 var $1 = 0, $2 = 0, $w = 0, $78 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $n;
 if (($2 | 0) == 0) {
  _gsl_error(3816, 8984, 44, 4);
  $1 = 0;
  $78 = $1;
  STACKTOP = sp;
  return $78 | 0;
 }
 $w = _malloc(20) | 0;
 if (($w | 0) == 0) {
  _gsl_error(7200, 8984, 51, 8);
  $1 = 0;
  $78 = $1;
  STACKTOP = sp;
  return $78 | 0;
 }
 HEAP32[$w + 4 >> 2] = _malloc($2 << 3) | 0;
 if ((HEAP32[$w + 4 >> 2] | 0) == 0) {
  _gsl_error(5832, 8984, 58, 8);
  $1 = 0;
  $78 = $1;
  STACKTOP = sp;
  return $78 | 0;
 }
 HEAP32[$w + 8 >> 2] = _malloc($2 << 3) | 0;
 if ((HEAP32[$w + 8 >> 2] | 0) == 0) {
  _gsl_error(4880, 8984, 65, 8);
  $1 = 0;
  $78 = $1;
  STACKTOP = sp;
  return $78 | 0;
 }
 HEAP32[$w + 12 >> 2] = _malloc($2 << 3) | 0;
 if ((HEAP32[$w + 12 >> 2] | 0) == 0) {
  _gsl_error(4256, 8984, 72, 8);
  $1 = 0;
  $78 = $1;
  STACKTOP = sp;
  return $78 | 0;
 }
 HEAP32[$w + 16 >> 2] = _malloc($2 << 3) | 0;
 if ((HEAP32[$w + 16 >> 2] | 0) != 0) {
  HEAP32[$w >> 2] = $2;
  $1 = $w;
  $78 = $1;
  STACKTOP = sp;
  return $78 | 0;
 }
 _gsl_error(3912, 8984, 79, 8);
 $1 = 0;
 $78 = $1;
 STACKTOP = sp;
 return $78 | 0;
}
function _print_insulator_data($ptr) {
 $ptr = $ptr | 0;
 var $2 = 0.0, $4 = 0.0, $11 = 0, $13 = 0, $18 = 0, $31 = 0.0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 $2 = +HEAPF64[$ptr + 24 >> 3];
 $4 = +HEAPF64[$ptr + 32 >> 3];
 $11 = HEAP32[$ptr + 68 >> 2] | 0;
 $13 = HEAP32[$ptr + 72 >> 2] | 0;
 _fprintf(HEAP32[2994] | 0, 7128, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 24 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[HEAP32[$ptr + 76 >> 2] >> 2], HEAP32[tempVarArgs + 8 >> 2] = $11, HEAP32[tempVarArgs + 16 >> 2] = $13, tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 $18 = HEAP32[2994] | 0;
 if ((HEAP32[$ptr + 64 >> 2] | 0) == 1) {
  _fprintf($18 | 0, 9928, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = +HEAPF64[$ptr + 48 >> 3], tempVarArgs) | 0) | 0;
  STACKTOP = tempVarArgs;
  STACKTOP = sp;
  return;
 } else {
  $31 = +Math_pow(+(($4 > $2 ? $4 : $2) / +HEAPF64[$ptr + 40 >> 3]), +(1.0 / +HEAPF64[$ptr + 16 >> 3]));
  _fprintf($18 | 0, 7608, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = $31, tempVarArgs) | 0) | 0;
  STACKTOP = tempVarArgs;
  STACKTOP = sp;
  return;
 }
}
function _gsl_blas_dgemv($TransA, $alpha, $A, $X, $beta, $Y) {
 $TransA = $TransA | 0;
 $alpha = +$alpha;
 $A = $A | 0;
 $X = $X | 0;
 $beta = +$beta;
 $Y = $Y | 0;
 var $1 = 0, $2 = 0, $3 = 0.0, $4 = 0, $5 = 0, $6 = 0.0, $7 = 0, $M = 0, $N = 0, $71 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $2 = $TransA;
 $3 = $alpha;
 $4 = $A;
 $5 = $X;
 $6 = $beta;
 $7 = $Y;
 $M = HEAP32[$4 >> 2] | 0;
 $N = HEAP32[$4 + 4 >> 2] | 0;
 if (($2 | 0) == 111) {
  if (($N | 0) == (HEAP32[$5 >> 2] | 0)) {
   if (($M | 0) != (HEAP32[$7 >> 2] | 0)) {
    label = 4;
   }
  } else {
   label = 4;
  }
 } else {
  label = 4;
 }
 do {
  if ((label | 0) == 4) {
   if (($2 | 0) == 112) {
    if (($M | 0) == (HEAP32[$5 >> 2] | 0)) {
     if (($N | 0) == (HEAP32[$7 >> 2] | 0)) {
      break;
     }
    }
   }
   _gsl_error(4224, 9144, 636, 19);
   $1 = 19;
   $71 = $1;
   STACKTOP = sp;
   return $71 | 0;
  }
 } while (0);
 _cblas_dgemv(101, $2, $M, $N, $3, HEAP32[$4 + 12 >> 2] | 0, HEAP32[$4 + 8 >> 2] | 0, HEAP32[$5 + 8 >> 2] | 0, HEAP32[$5 + 4 >> 2] | 0, $6, HEAP32[$7 + 8 >> 2] | 0, HEAP32[$7 + 4 >> 2] | 0);
 $1 = 0;
 $71 = $1;
 STACKTOP = sp;
 return $71 | 0;
}
function _strcspn($s, $c) {
 $s = $s | 0;
 $c = $c | 0;
 var $byteset = 0, $1 = 0, $15 = 0, $_01719 = 0, $16 = 0, $20 = 0, $23 = 0, $24 = 0, $_018 = 0, $26 = 0, $29 = 0, $_0 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32 | 0;
 $byteset = sp | 0;
 $1 = HEAP8[$c] | 0;
 if (!($1 << 24 >> 24 == 0)) {
  if ((HEAP8[$c + 1 | 0] | 0) != 0) {
   _memset($byteset | 0, 0, 32) | 0;
   $_01719 = $c;
   $15 = $1;
   while (1) {
    $16 = $15 & 255;
    $20 = $byteset + ($16 >>> 5 << 2) | 0;
    HEAP32[$20 >> 2] = HEAP32[$20 >> 2] | 1 << ($16 & 31);
    $23 = $_01719 + 1 | 0;
    $24 = HEAP8[$23] | 0;
    if ($24 << 24 >> 24 == 0) {
     $_018 = $s;
     break;
    } else {
     $_01719 = $23;
     $15 = $24;
    }
   }
   while (1) {
    $26 = HEAP8[$_018] | 0;
    if ($26 << 24 >> 24 == 0) {
     break;
    }
    $29 = $26 & 255;
    if ((HEAP32[$byteset + ($29 >>> 5 << 2) >> 2] & 1 << ($29 & 31) | 0) == 0) {
     $_018 = $_018 + 1 | 0;
    } else {
     break;
    }
   }
   $_0 = $_018 - $s | 0;
   STACKTOP = sp;
   return $_0 | 0;
  }
 }
 $_0 = (___strchrnul($s, $1 << 24 >> 24) | 0) - $s | 0;
 STACKTOP = sp;
 return $_0 | 0;
}
function _gsl_matrix_memcpy($dest, $src) {
 $dest = $dest | 0;
 $src = $src | 0;
 var $1 = 0, $2 = 0, $3 = 0, $src_size1 = 0, $src_size2 = 0, $src_tda = 0, $dest_tda = 0, $i = 0, $j = 0, $49 = 0, $60 = 0, $74 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $dest;
 $3 = $src;
 $src_size1 = HEAP32[$3 >> 2] | 0;
 $src_size2 = HEAP32[$3 + 4 >> 2] | 0;
 if (($src_size1 | 0) == (HEAP32[$2 >> 2] | 0)) {
  if (($src_size2 | 0) == (HEAP32[$2 + 4 >> 2] | 0)) {
   $src_tda = HEAP32[$3 + 8 >> 2] | 0;
   $dest_tda = HEAP32[$2 + 8 >> 2] | 0;
   $i = 0;
   while (1) {
    if (!($i >>> 0 < $src_size1 >>> 0)) {
     break;
    }
    $j = 0;
    while (1) {
     if (!($j >>> 0 < $src_size2 >>> 0)) {
      break;
     }
     $49 = (Math_imul($src_tda, $i) | 0) + $j | 0;
     $60 = (Math_imul($dest_tda, $i) | 0) + $j | 0;
     HEAPF64[(HEAP32[$2 + 12 >> 2] | 0) + ($60 << 3) >> 3] = +HEAPF64[(HEAP32[$3 + 12 >> 2] | 0) + ($49 << 3) >> 3];
     $j = $j + 1 | 0;
    }
    $i = $i + 1 | 0;
   }
   $1 = 0;
   $74 = $1;
   STACKTOP = sp;
   return $74 | 0;
  }
 }
 _gsl_error(2768, 8576, 31, 19);
 $1 = 19;
 $74 = $1;
 STACKTOP = sp;
 return $74 | 0;
}
function _update_customer_history($ptr) {
 $ptr = $ptr | 0;
 var $1 = 0, $7 = 0.0, $14 = 0.0, $18 = 0.0, $22 = 0, $24 = 0.0, $28 = 0.0, $29 = 0.0, $30 = 0, $36 = 0.0, $37 = 0, $43 = 0.0, $44 = 0, $50 = 0;
 $1 = $ptr + 64 | 0;
 $7 = +_gsl_vector_get(HEAP32[(HEAP32[$1 >> 2] | 0) + 20 >> 2] | 0, HEAP32[$ptr >> 2] | 0);
 $14 = $7 - +_gsl_vector_get(HEAP32[(HEAP32[$1 >> 2] | 0) + 20 >> 2] | 0, HEAP32[$ptr + 4 >> 2] | 0);
 $18 = +HEAPF64[(HEAP32[$ptr + 68 >> 2] | 0) + 64 >> 3];
 $22 = $ptr + 40 | 0;
 $24 = +HEAPF64[$22 >> 3] + $14 * +HEAPF64[$ptr + 56 >> 3];
 HEAPF64[$22 >> 3] = $24;
 $28 = $24 + $18 * +HEAPF64[$ptr + 48 >> 3];
 $29 = +Math_abs(+$18);
 $30 = $ptr + 16 | 0;
 if ($29 > +Math_abs(+(+HEAPF64[$30 >> 3]))) {
  HEAPF64[$30 >> 3] = $18;
 }
 $36 = +Math_abs(+$14);
 $37 = $ptr + 8 | 0;
 if ($36 > +Math_abs(+(+HEAPF64[$37 >> 3]))) {
  HEAPF64[$37 >> 3] = $14;
 }
 $43 = +Math_abs(+$28);
 $44 = $ptr + 32 | 0;
 if (!($43 > +Math_abs(+(+HEAPF64[$44 >> 3])))) {
  $50 = $ptr + 24 | 0;
  HEAPF64[$50 >> 3] = $28;
  return;
 }
 HEAPF64[$44 >> 3] = $28;
 $50 = $ptr + 24 | 0;
 HEAPF64[$50 >> 3] = $28;
 return;
}
function _inject_line_imode($ptr) {
 $ptr = $ptr | 0;
 var $4 = 0, $8 = 0, $10 = 0, $11 = 0, $i_016 = 0, $13 = 0.0, $14 = 0, $17 = 0, $18 = 0, $20 = 0, $24 = 0, $26 = 0, $i_115 = 0, $28 = 0.0, $29 = 0;
 $4 = (HEAP32[2888] | 0) % (HEAP32[$ptr + 16 >> 2] | 0) | 0;
 $8 = HEAP32[(HEAP32[$ptr + 20 >> 2] | 0) + 32 >> 2] | 0;
 $10 = HEAP32[$ptr + 4 >> 2] | 0;
 $11 = HEAP32[3124] | 0;
 if (($11 | 0) > 0) {
  $i_016 = 0;
  while (1) {
   $13 = +_gsl_matrix_get($10, $i_016, $4);
   $14 = _gsl_vector_ptr($8, $i_016) | 0;
   HEAPF64[$14 >> 3] = +HEAPF64[$14 >> 3] - $13;
   $17 = $i_016 + 1 | 0;
   $18 = HEAP32[3124] | 0;
   if (($17 | 0) < ($18 | 0)) {
    $i_016 = $17;
   } else {
    $20 = $18;
    break;
   }
  }
 } else {
  $20 = $11;
 }
 $24 = HEAP32[(HEAP32[$ptr + 24 >> 2] | 0) + 32 >> 2] | 0;
 $26 = HEAP32[$ptr + 8 >> 2] | 0;
 if (($20 | 0) > 0) {
  $i_115 = 0;
 } else {
  return;
 }
 do {
  $28 = +_gsl_matrix_get($26, $i_115, $4);
  $29 = _gsl_vector_ptr($24, $i_115) | 0;
  HEAPF64[$29 >> 3] = +HEAPF64[$29 >> 3] - $28;
  $i_115 = $i_115 + 1 | 0;
 } while (($i_115 | 0) < (HEAP32[3124] | 0));
 return;
}
function _gsl_matrix_swap_rows($m, $i, $j) {
 $m = $m | 0;
 $i = $i | 0;
 $j = $j | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $size1 = 0, $size2 = 0, $row1 = 0, $row2 = 0, $k = 0, $tmp = 0.0, $76 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $m;
 $3 = $i;
 $4 = $j;
 $size1 = HEAP32[$2 >> 2] | 0;
 $size2 = HEAP32[$2 + 4 >> 2] | 0;
 if ($3 >>> 0 >= $size1 >>> 0) {
  _gsl_error(11112, 11e3, 29, 4);
  $1 = 4;
  $76 = $1;
  STACKTOP = sp;
  return $76 | 0;
 }
 if ($4 >>> 0 >= $size1 >>> 0) {
  _gsl_error(8320, 11e3, 34, 4);
  $1 = 4;
  $76 = $1;
  STACKTOP = sp;
  return $76 | 0;
 }
 if (($3 | 0) != ($4 | 0)) {
  $row1 = (HEAP32[$2 + 12 >> 2] | 0) + ((Math_imul($3, HEAP32[$2 + 8 >> 2] | 0) | 0) << 3) | 0;
  $row2 = (HEAP32[$2 + 12 >> 2] | 0) + ((Math_imul($4, HEAP32[$2 + 8 >> 2] | 0) | 0) << 3) | 0;
  $k = 0;
  while (1) {
   if (!($k >>> 0 < $size2 >>> 0)) {
    break;
   }
   $tmp = +HEAPF64[$row1 + ($k << 3) >> 3];
   HEAPF64[$row1 + ($k << 3) >> 3] = +HEAPF64[$row2 + ($k << 3) >> 3];
   HEAPF64[$row2 + ($k << 3) >> 3] = $tmp;
   $k = $k + 1 | 0;
  }
 }
 $1 = 0;
 $76 = $1;
 STACKTOP = sp;
 return $76 | 0;
}
function _gsl_matrix_add($a, $b) {
 $a = $a | 0;
 $b = $b | 0;
 var $1 = 0, $2 = 0, $3 = 0, $M = 0, $N = 0, $tda_a = 0, $tda_b = 0, $i = 0, $j = 0, $45 = 0, $55 = 0, $59 = 0, $71 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $a;
 $3 = $b;
 $M = HEAP32[$2 >> 2] | 0;
 $N = HEAP32[$2 + 4 >> 2] | 0;
 if ((HEAP32[$3 >> 2] | 0) == ($M | 0)) {
  if ((HEAP32[$3 + 4 >> 2] | 0) == ($N | 0)) {
   $tda_a = HEAP32[$2 + 8 >> 2] | 0;
   $tda_b = HEAP32[$3 + 8 >> 2] | 0;
   $i = 0;
   while (1) {
    if (!($i >>> 0 < $M >>> 0)) {
     break;
    }
    $j = 0;
    while (1) {
     if (!($j >>> 0 < $N >>> 0)) {
      break;
     }
     $45 = (Math_imul($i, $tda_b) | 0) + $j | 0;
     $55 = (Math_imul($i, $tda_a) | 0) + $j | 0;
     $59 = (HEAP32[$2 + 12 >> 2] | 0) + ($55 << 3) | 0;
     HEAPF64[$59 >> 3] = +HEAPF64[$59 >> 3] + +HEAPF64[(HEAP32[$3 + 12 >> 2] | 0) + ($45 << 3) >> 3];
     $j = $j + 1 | 0;
    }
    $i = $i + 1 | 0;
   }
   $1 = 0;
   $71 = $1;
   STACKTOP = sp;
   return $71 | 0;
  }
 }
 _gsl_error(11216, 8424, 28, 19);
 $1 = 19;
 $71 = $1;
 STACKTOP = sp;
 return $71 | 0;
}
function _reset_arrbez($ptr) {
 $ptr = $ptr | 0;
 var $7 = 0.0, $10 = 0.0, $17 = 0.0, $32 = 0.0, $33 = 0, $34 = 0.0, $35 = 0.0, $36 = 0.0, $37 = 0.0, $38 = 0;
 HEAPF64[$ptr + 112 >> 3] = 0.0;
 _memset($ptr + 32 | 0, 0, 40) | 0;
 _memset($ptr + 128 | 0, 0, 16) | 0;
 $7 = +HEAPF64[$ptr + 8 >> 3];
 if ($7 > 0.0) {
  $10 = $7 / .001;
  HEAPF64[$ptr + 72 >> 3] = $10;
  $17 = $10;
 } else {
  HEAPF64[$ptr + 72 >> 3] = 0.0;
  HEAPF64[$ptr + 56 >> 3] = +HEAPF64[323];
  $17 = 0.0;
 }
 if (+HEAPF64[$ptr + 16 >> 3] > 0.0) {
  HEAPF64[$ptr + 80 >> 3] = 34.0 / (+HEAPF64[$ptr >> 3] / 1.0e3);
  HEAPF64[$ptr + 88 >> 3] = 1.0e-7;
  $32 = 1.0e-7;
  $33 = $ptr + 120 | 0;
  $34 = +HEAPF64[$33 >> 3];
  $35 = $34 + $17;
  $36 = 1.0 / $32;
  $37 = $35 + $36;
  $38 = $ptr + 104 | 0;
  HEAPF64[$38 >> 3] = $37;
  return;
 } else {
  HEAPF64[$ptr + 80 >> 3] = 0.0;
  HEAPF64[$ptr + 88 >> 3] = 1.0e6;
  $32 = 1.0e6;
  $33 = $ptr + 120 | 0;
  $34 = +HEAPF64[$33 >> 3];
  $35 = $34 + $17;
  $36 = 1.0 / $32;
  $37 = $35 + $36;
  $38 = $ptr + 104 | 0;
  HEAPF64[$38 >> 3] = $37;
  return;
 }
}
function _move_surge($ptr, $i, $j, $k, $fpeak, $ftf, $ftt, $ftstart) {
 $ptr = $ptr | 0;
 $i = $i | 0;
 $j = $j | 0;
 $k = $k | 0;
 $fpeak = +$fpeak;
 $ftf = +$ftf;
 $ftt = +$ftt;
 $ftstart = +$ftstart;
 var $5 = 0.0, $16 = 0, $17 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0;
 $5 = $ftf * 1.4079315;
 HEAPF64[$ptr + 8 >> 3] = $ftf;
 HEAPF64[$ptr + 16 >> 3] = $ftt;
 HEAPF64[$ptr + 24 >> 3] = 6.2831853 / ($ftf * 2.815863);
 HEAPF64[$ptr + 32 >> 3] = 6.2831853 / ($ftt * 4.0);
 HEAPF64[$ptr + 40 >> 3] = $5;
 HEAPF64[$ptr + 48 >> 3] = $ftstart;
 HEAPF64[$ptr + 56 >> 3] = ($ftt - $5) * 1.442695;
 HEAPF64[$ptr >> 3] = $fpeak;
 $16 = _find_pole($i) | 0;
 $17 = $ptr + 72 | 0;
 HEAP32[$17 >> 2] = $16;
 if (($16 | 0) != 0) {
  $21 = $16;
  $22 = $21 + 8 | 0;
  HEAP32[$22 >> 2] = 1;
  $23 = $ptr + 64 | 0;
  HEAP32[$23 >> 2] = $j;
  $24 = $ptr + 68 | 0;
  HEAP32[$24 >> 2] = $k;
  return;
 }
 _oe_exit(15);
 $21 = HEAP32[$17 >> 2] | 0;
 $22 = $21 + 8 | 0;
 HEAP32[$22 >> 2] = 1;
 $23 = $ptr + 64 | 0;
 HEAP32[$23 >> 2] = $j;
 $24 = $ptr + 68 | 0;
 HEAP32[$24 >> 2] = $k;
 return;
}
function _gsl_vector_swap_elements($v, $i, $j) {
 $v = $v | 0;
 $i = $i | 0;
 $j = $j | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $data = 0, $size = 0, $stride = 0, $s = 0, $k = 0, $tmp = 0.0, $75 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $v;
 $3 = $i;
 $4 = $j;
 $data = HEAP32[$2 + 8 >> 2] | 0;
 $size = HEAP32[$2 >> 2] | 0;
 $stride = HEAP32[$2 + 4 >> 2] | 0;
 if ($3 >>> 0 >= $size >>> 0) {
  _gsl_error(7976, 10712, 57, 4);
  $1 = 4;
  $75 = $1;
  STACKTOP = sp;
  return $75 | 0;
 }
 if ($4 >>> 0 >= $size >>> 0) {
  _gsl_error(6440, 10712, 62, 4);
  $1 = 4;
  $75 = $1;
  STACKTOP = sp;
  return $75 | 0;
 }
 if (($3 | 0) != ($4 | 0)) {
  $s = $stride;
  $k = 0;
  while (1) {
   if (!($k >>> 0 < 1 >>> 0)) {
    break;
   }
   $tmp = +HEAPF64[$data + ((Math_imul($4, $s) | 0) + $k << 3) >> 3];
   HEAPF64[$data + ((Math_imul($4, $s) | 0) + $k << 3) >> 3] = +HEAPF64[$data + ((Math_imul($3, $s) | 0) + $k << 3) >> 3];
   HEAPF64[$data + ((Math_imul($3, $s) | 0) + $k << 3) >> 3] = $tmp;
   $k = $k + 1 | 0;
  }
 }
 $1 = 0;
 $75 = $1;
 STACKTOP = sp;
 return $75 | 0;
}
function _print_customer_data($ptr) {
 $ptr = $ptr | 0;
 var $7 = 0, $9 = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 $7 = HEAP32[$ptr >> 2] | 0;
 $9 = HEAP32[$ptr + 4 >> 2] | 0;
 _fprintf(HEAP32[2994] | 0, 8608, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 24 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[HEAP32[$ptr + 64 >> 2] >> 2], HEAP32[tempVarArgs + 8 >> 2] = $7, HEAP32[tempVarArgs + 16 >> 2] = $9, tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 _fprintf(HEAP32[2994] | 0, 10336, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = +HEAPF64[$ptr + 8 >> 3], tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 _fprintf(HEAP32[2994] | 0, 7816, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = +HEAPF64[$ptr + 16 >> 3], tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 _fprintf(HEAP32[2994] | 0, 6360, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = +HEAPF64[$ptr + 32 >> 3], tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 STACKTOP = sp;
 return;
}
function _update_line_history($ptr) {
 $ptr = $ptr | 0;
 var $4 = 0, $8 = 0, $12 = 0, $14 = 0, $16 = 0, $19 = 0, $i_027 = 0, $24 = 0.0, $26 = 0.0, $28 = 0.0, $30 = 0.0, $32 = 0.0;
 $4 = (HEAP32[2888] | 0) % (HEAP32[$ptr + 16 >> 2] | 0) | 0;
 $8 = HEAP32[(HEAP32[$ptr + 20 >> 2] | 0) + 28 >> 2] | 0;
 $12 = HEAP32[(HEAP32[$ptr + 24 >> 2] | 0) + 28 >> 2] | 0;
 $14 = HEAP32[$ptr + 4 >> 2] | 0;
 $16 = HEAP32[$ptr + 8 >> 2] | 0;
 if ((HEAP32[3124] | 0) <= 0) {
  return;
 }
 $19 = $ptr | 0;
 $i_027 = 0;
 do {
  $24 = +_gsl_matrix_get(HEAP32[(HEAP32[$19 >> 2] | 0) + 4 >> 2] | 0, $i_027, $i_027);
  $26 = $24 * +_gsl_vector_get($8, $i_027);
  $28 = $26 + +_gsl_matrix_get($14, $i_027, $4);
  $30 = $24 * +_gsl_vector_get($12, $i_027);
  $32 = $30 + +_gsl_matrix_get($16, $i_027, $4);
  _gsl_matrix_set($14, $i_027, $4, $24 * (-0.0 - +_gsl_vector_get($12, $i_027)) - $32);
  _gsl_matrix_set($16, $i_027, $4, $24 * (-0.0 - +_gsl_vector_get($8, $i_027)) - $28);
  $i_027 = $i_027 + 1 | 0;
 } while (($i_027 | 0) < (HEAP32[3124] | 0));
 return;
}
function _gsl_linalg_householder_hm($tau, $v, $A) {
 $tau = +$tau;
 $v = $v | 0;
 $A = $A | 0;
 var $1 = 0, $2 = 0.0, $3 = 0, $4 = 0, $i = 0, $j = 0, $wj = 0.0, $Aij = 0.0, $29 = 0.0, $83 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $tau;
 $3 = $v;
 $4 = $A;
 if ($2 == 0.0) {
  $1 = 0;
  $83 = $1;
  STACKTOP = sp;
  return $83 | 0;
 }
 $j = 0;
 while (1) {
  if (!($j >>> 0 < (HEAP32[$4 + 4 >> 2] | 0) >>> 0)) {
   break;
  }
  $wj = +_gsl_matrix_get($4, 0, $j);
  $i = 1;
  while (1) {
   if (!($i >>> 0 < (HEAP32[$4 >> 2] | 0) >>> 0)) {
    break;
   }
   $29 = +_gsl_matrix_get($4, $i, $j);
   $wj = $wj + $29 * +_gsl_vector_get($3, $i);
   $i = $i + 1 | 0;
  }
  _gsl_matrix_set($4, 0, $j, +_gsl_matrix_get($4, 0, $j) - $2 * $wj);
  $i = 1;
  while (1) {
   if (!($i >>> 0 < (HEAP32[$4 >> 2] | 0) >>> 0)) {
    break;
   }
   $Aij = +_gsl_matrix_get($4, $i, $j);
   _gsl_matrix_set($4, $i, $j, $Aij - $2 * +_gsl_vector_get($3, $i) * $wj);
   $i = $i + 1 | 0;
  }
  $j = $j + 1 | 0;
 }
 $1 = 0;
 $83 = $1;
 STACKTOP = sp;
 return $83 | 0;
}
function _change_inductor_time_step($ptr) {
 $ptr = $ptr | 0;
 var $1 = 0, $2 = 0.0, $3 = 0, $7 = 0, $9 = 0.0, $13 = 0, $16 = 0.0, $18 = 0, $20 = 0.0, $21 = 0, $22 = 0.0, $23 = 0, $29 = 0.0;
 $1 = $ptr | 0;
 $2 = +HEAPF64[$1 >> 3];
 $3 = $ptr + 56 | 0;
 $7 = $ptr + 48 | 0;
 $9 = +_gsl_vector_get(HEAP32[(HEAP32[$3 >> 2] | 0) + 20 >> 2] | 0, HEAP32[$7 >> 2] | 0);
 $13 = $ptr + 52 | 0;
 $16 = $9 - +_gsl_vector_get(HEAP32[(HEAP32[$3 >> 2] | 0) + 20 >> 2] | 0, HEAP32[$13 >> 2] | 0);
 $18 = $ptr + 24 | 0;
 $20 = +HEAPF64[$18 >> 3] + $2 * $16;
 $21 = $ptr + 40 | 0;
 $22 = +HEAPF64[$21 >> 3];
 $23 = $ptr + 32 | 0;
 $29 = 1.0 / ($22 + +HEAPF64[$23 >> 3] * 2.0 / +HEAPF64[323]);
 HEAPF64[$1 >> 3] = $29;
 HEAPF64[$ptr + 8 >> 3] = $29 * 2.0 * (1.0 - $29 * $22);
 HEAPF64[$ptr + 16 >> 3] = 1.0 - $22 * 2.0 * $29;
 _add_y(HEAP32[$3 >> 2] | 0, HEAP32[$7 >> 2] | 0, HEAP32[$13 >> 2] | 0, $29 - $2);
 HEAPF64[$18 >> 3] = +HEAPF64[$1 >> 3] * ($16 + $20 * (+HEAPF64[$23 >> 3] * 2.0 / +HEAPF64[323] - +HEAPF64[$21 >> 3]));
 return;
}
function _mark_pair($j, $k) {
 $j = $j | 0;
 $k = $k | 0;
 var $2 = 0, $3 = 0, $4 = 0, $7 = 0, $10 = 0, $11 = 0, $14 = 0, $21 = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 $2 = ($k | 0) > 0;
 $3 = HEAP32[3122] | 0;
 $4 = ($3 | 0) < ($k | 0);
 if (!($4 | ($j | 0) == 0 & $2 ^ 1)) {
  $7 = $k - 1 | 0;
  _gsl_matrix_int_set(HEAP32[2992] | 0, $7, $7, 1);
  STACKTOP = sp;
  return 0;
 }
 $10 = ($j | 0) > 0;
 $11 = ($3 | 0) < ($j | 0);
 if (!($11 | ($k | 0) == 0 & $10 ^ 1)) {
  $14 = $j - 1 | 0;
  _gsl_matrix_int_set(HEAP32[2992] | 0, $14, $14, 1);
  STACKTOP = sp;
  return 0;
 }
 if (!($11 | $4 | $10 & $2 ^ 1)) {
  _gsl_matrix_int_set(HEAP32[2992] | 0, $j - 1 | 0, $k - 1 | 0, 1);
  STACKTOP = sp;
  return 0;
 }
 $21 = HEAP32[3164] | 0;
 if (($21 | 0) != 0) {
  _fprintf($21 | 0, 8944, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempVarArgs >> 2] = $j, HEAP32[tempVarArgs + 8 >> 2] = $k, tempVarArgs) | 0) | 0;
  STACKTOP = tempVarArgs;
 }
 _oe_exit(14);
 STACKTOP = sp;
 return 0;
}
function _WritePlotTimeStep($head, $t) {
 $head = $head | 0;
 $t = +$t;
 var $1 = 0, $volts_i = 0, $2 = 0, $9 = 0, $12 = 0, $14 = 0, $21 = 0.0, $22 = 0.0, $23 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 $1 = sp | 0;
 $volts_i = sp + 8 | 0;
 $2 = HEAP32[3206] | 0;
 if (($2 | 0) == 0) {
  STACKTOP = sp;
  return;
 }
 if ((HEAP32[2984] | 0) != 3) {
  _WriteTextTimeStep($head, $t);
  STACKTOP = sp;
  return;
 }
 $9 = $volts_i;
 HEAPF64[$1 >> 3] = $t;
 _fwrite($1 | 0, 8, 1, $2 | 0) | 0;
 $12 = HEAP32[$head + 32 >> 2] | 0;
 if (($12 | 0) == 0) {
  STACKTOP = sp;
  return;
 } else {
  $14 = $12;
 }
 do {
  $21 = +HEAPF64[HEAP32[$14 + 24 >> 2] >> 3] - +HEAPF64[HEAP32[$14 + 28 >> 2] >> 3];
  HEAPF64[$volts_i >> 3] = $21;
  $22 = +Math_abs(+$21);
  $23 = $14 + 16 | 0;
  if ($22 > +Math_abs(+(+HEAPF64[$23 >> 3]))) {
   HEAPF64[$23 >> 3] = $21;
  }
  _fwrite($9 | 0, 8, 1, HEAP32[3206] | 0) | 0;
  $14 = HEAP32[$14 + 32 >> 2] | 0;
 } while (($14 | 0) != 0);
 STACKTOP = sp;
 return;
}
function _cblas_dnrm2($N, $X, $incX) {
 $N = $N | 0;
 $X = $X | 0;
 $incX = $incX | 0;
 var $1 = 0.0, $2 = 0, $3 = 0, $4 = 0, $scale = 0.0, $ssq = 0.0, $i = 0, $ix = 0, $x = 0.0, $ax = 0.0, $74 = 0.0, sp = 0;
 sp = STACKTOP;
 $2 = $N;
 $3 = $X;
 $4 = $incX;
 $scale = 0.0;
 $ssq = 1.0;
 $ix = 0;
 if (($2 | 0) > 0) {
  if (($4 | 0) > 0) {
   if (($2 | 0) == 1) {
    $1 = +Math_abs(+(+HEAPF64[$3 >> 3]));
    $74 = $1;
    STACKTOP = sp;
    return +$74;
   }
   $i = 0;
   while (1) {
    if (($i | 0) >= ($2 | 0)) {
     break;
    }
    $x = +HEAPF64[$3 + ($ix << 3) >> 3];
    if ($x != 0.0) {
     $ax = +Math_abs(+$x);
     if ($scale < $ax) {
      $ssq = $ssq * ($scale / $ax) * ($scale / $ax) + 1.0;
      $scale = $ax;
     } else {
      $ssq = $ssq + $ax / $scale * ($ax / $scale);
     }
    }
    $ix = $ix + $4 | 0;
    $i = $i + 1 | 0;
   }
   $1 = $scale * +Math_sqrt($ssq);
   $74 = $1;
   STACKTOP = sp;
   return +$74;
  }
 }
 $1 = 0.0;
 $74 = $1;
 STACKTOP = sp;
 return +$74;
}
function _gsl_linalg_householder_transform($v) {
 $v = $v | 0;
 var $1 = 0.0, $2 = 0, $n = 0, $alpha = 0.0, $beta = 0.0, $x = 0, $xnorm = 0.0, $s = 0.0, $56 = 0.0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24 | 0;
 $x = sp | 0;
 $2 = $v;
 $n = HEAP32[$2 >> 2] | 0;
 if (($n | 0) == 1) {
  $1 = 0.0;
  $56 = $1;
  STACKTOP = sp;
  return +$56;
 }
 _gsl_vector_subvector($x, $2, 1, $n - 1 | 0);
 $xnorm = +_gsl_blas_dnrm2($x | 0);
 if ($xnorm == 0.0) {
  $1 = 0.0;
  $56 = $1;
  STACKTOP = sp;
  return +$56;
 }
 $alpha = +_gsl_vector_get($2, 0);
 $beta = (-0.0 - ($alpha >= 0.0 ? 1.0 : -1.0)) * +_hypot(+$alpha, +$xnorm);
 $s = $alpha - $beta;
 if (+Math_abs(+$s) > 2.2250738585072014e-308) {
  _gsl_blas_dscal(1.0 / $s, $x | 0);
  _gsl_vector_set($2, 0, $beta);
 } else {
  _gsl_blas_dscal(2.220446049250313e-16 / $s, $x | 0);
  _gsl_blas_dscal(4503599627370496.0, $x | 0);
  _gsl_vector_set($2, 0, $beta);
 }
 $1 = ($beta - $alpha) / $beta;
 $56 = $1;
 STACKTOP = sp;
 return +$56;
}
function _print_lpm_data($ptr) {
 $ptr = $ptr | 0;
 var $7 = 0, $9 = 0, $14 = 0, $20 = 0.0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 $7 = HEAP32[$ptr + 88 >> 2] | 0;
 $9 = HEAP32[$ptr + 92 >> 2] | 0;
 _fprintf(HEAP32[2994] | 0, 7552, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 24 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[HEAP32[$ptr + 96 >> 2] >> 2], HEAP32[tempVarArgs + 8 >> 2] = $7, HEAP32[tempVarArgs + 16 >> 2] = $9, tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 $14 = HEAP32[2994] | 0;
 if ((HEAP32[$ptr + 84 >> 2] | 0) == 1) {
  _fprintf($14 | 0, 6152, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = +HEAPF64[$ptr + 48 >> 3], tempVarArgs) | 0) | 0;
  STACKTOP = tempVarArgs;
  STACKTOP = sp;
  return;
 } else {
  $20 = +_calculate_lpm_si($ptr);
  _fprintf($14 | 0, 5160, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = $20, tempVarArgs) | 0) | 0;
  STACKTOP = tempVarArgs;
  STACKTOP = sp;
  return;
 }
}
function _gsl_vector_memcpy($dest, $src) {
 $dest = $dest | 0;
 $src = $src | 0;
 var $1 = 0, $2 = 0, $3 = 0, $src_size = 0, $src_stride = 0, $dest_stride = 0, $j = 0, $k = 0, $37 = 0, $48 = 0, $62 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $dest;
 $3 = $src;
 $src_size = HEAP32[$3 >> 2] | 0;
 if (($src_size | 0) != (HEAP32[$2 >> 2] | 0)) {
  _gsl_error(10272, 10816, 29, 19);
  $1 = 19;
  $62 = $1;
  STACKTOP = sp;
  return $62 | 0;
 }
 $src_stride = HEAP32[$3 + 4 >> 2] | 0;
 $dest_stride = HEAP32[$2 + 4 >> 2] | 0;
 $j = 0;
 while (1) {
  if (!($j >>> 0 < $src_size >>> 0)) {
   break;
  }
  $k = 0;
  while (1) {
   if (!($k >>> 0 < 1 >>> 0)) {
    break;
   }
   $37 = (Math_imul($src_stride, $j) | 0) + $k | 0;
   $48 = (Math_imul($dest_stride, $j) | 0) + $k | 0;
   HEAPF64[(HEAP32[$2 + 8 >> 2] | 0) + ($48 << 3) >> 3] = +HEAPF64[(HEAP32[$3 + 8 >> 2] | 0) + ($37 << 3) >> 3];
   $k = $k + 1 | 0;
  }
  $j = $j + 1 | 0;
 }
 $1 = 0;
 $62 = $1;
 STACKTOP = sp;
 return $62 | 0;
}
function _gsl_matrix_int_alloc($n1, $n2) {
 $n1 = $n1 | 0;
 $n2 = $n2 | 0;
 var $1 = 0, $2 = 0, $3 = 0, $block = 0, $m = 0, $56 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $n1;
 $3 = $n2;
 if (($2 | 0) == 0) {
  _gsl_error(2720, 8560, 29, 4);
  $1 = 0;
  $56 = $1;
  STACKTOP = sp;
  return $56 | 0;
 }
 if (($3 | 0) == 0) {
  _gsl_error(6872, 8560, 34, 4);
  $1 = 0;
  $56 = $1;
  STACKTOP = sp;
  return $56 | 0;
 }
 $m = _malloc(24) | 0;
 if (($m | 0) == 0) {
  _gsl_error(5600, 8560, 42, 8);
  $1 = 0;
  $56 = $1;
  STACKTOP = sp;
  return $56 | 0;
 }
 $block = _gsl_block_int_alloc(Math_imul($2, $3) | 0) | 0;
 if (($block | 0) != 0) {
  HEAP32[$m + 12 >> 2] = HEAP32[$block + 4 >> 2];
  HEAP32[$m >> 2] = $2;
  HEAP32[$m + 4 >> 2] = $3;
  HEAP32[$m + 8 >> 2] = $3;
  HEAP32[$m + 16 >> 2] = $block;
  HEAP32[$m + 20 >> 2] = 1;
  $1 = $m;
  $56 = $1;
  STACKTOP = sp;
  return $56 | 0;
 }
 _gsl_error(4672, 8560, 52, 8);
 $1 = 0;
 $56 = $1;
 STACKTOP = sp;
 return $56 | 0;
}
function _gsl_matrix_alloc($n1, $n2) {
 $n1 = $n1 | 0;
 $n2 = $n2 | 0;
 var $1 = 0, $2 = 0, $3 = 0, $block = 0, $m = 0, $56 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $n1;
 $3 = $n2;
 if (($2 | 0) == 0) {
  _gsl_error(2720, 8560, 29, 4);
  $1 = 0;
  $56 = $1;
  STACKTOP = sp;
  return $56 | 0;
 }
 if (($3 | 0) == 0) {
  _gsl_error(6872, 8560, 34, 4);
  $1 = 0;
  $56 = $1;
  STACKTOP = sp;
  return $56 | 0;
 }
 $m = _malloc(24) | 0;
 if (($m | 0) == 0) {
  _gsl_error(5600, 8560, 42, 8);
  $1 = 0;
  $56 = $1;
  STACKTOP = sp;
  return $56 | 0;
 }
 $block = _gsl_block_alloc(Math_imul($2, $3) | 0) | 0;
 if (($block | 0) != 0) {
  HEAP32[$m + 12 >> 2] = HEAP32[$block + 4 >> 2];
  HEAP32[$m >> 2] = $2;
  HEAP32[$m + 4 >> 2] = $3;
  HEAP32[$m + 8 >> 2] = $3;
  HEAP32[$m + 16 >> 2] = $block;
  HEAP32[$m + 20 >> 2] = 1;
  $1 = $m;
  $56 = $1;
  STACKTOP = sp;
  return $56 | 0;
 }
 _gsl_error(4672, 8560, 52, 8);
 $1 = 0;
 $56 = $1;
 STACKTOP = sp;
 return $56 | 0;
}
function _gsl_linalg_LU_svx($LU, $p, $x) {
 $LU = $LU | 0;
 $p = $p | 0;
 $x = $x | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $58 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $LU;
 $3 = $p;
 $4 = $x;
 if ((HEAP32[$2 >> 2] | 0) != (HEAP32[$2 + 4 >> 2] | 0)) {
  _gsl_error(5696, 8704, 171, 20);
  $1 = 20;
  $58 = $1;
  STACKTOP = sp;
  return $58 | 0;
 }
 if ((HEAP32[$2 >> 2] | 0) != (HEAP32[$3 >> 2] | 0)) {
  _gsl_error(7016, 8704, 175, 19);
  $1 = 19;
  $58 = $1;
  STACKTOP = sp;
  return $58 | 0;
 }
 if ((HEAP32[$2 >> 2] | 0) != (HEAP32[$4 >> 2] | 0)) {
  _gsl_error(3464, 8704, 179, 19);
  $1 = 19;
  $58 = $1;
  STACKTOP = sp;
  return $58 | 0;
 }
 if ((_singular867($2) | 0) == 0) {
  _gsl_permute_vector($3, $4) | 0;
  _gsl_blas_dtrsv(122, 111, 132, $2, $4) | 0;
  _gsl_blas_dtrsv(121, 111, 131, $2, $4) | 0;
  $1 = 0;
  $58 = $1;
  STACKTOP = sp;
  return $58 | 0;
 }
 _gsl_error(3864, 8704, 183, 1);
 $1 = 1;
 $58 = $1;
 STACKTOP = sp;
 return $58 | 0;
}
function _next_double($value) {
 $value = $value | 0;
 var $1 = 0, $4 = 0, $6 = 0, $i_04_i = 0, $11 = 0, $18 = 0, $storemerge = 0.0, $_0 = 0;
 $1 = _strtok(0, 752) | 0;
 HEAP32[2880] = $1;
 if (($1 | 0) == 0) {
  HEAP32[2880] = 0;
  $_0 = 1;
  $storemerge = 0.0;
  HEAPF64[$value >> 3] = $storemerge;
  return $_0 | 0;
 }
 $4 = _strlen($1 | 0) | 0;
 if (($4 | 0) > 0) {
  $i_04_i = 0;
  $6 = $1;
  do {
   $11 = (_tolower(HEAP8[$6 + $i_04_i | 0] | 0) | 0) & 255;
   HEAP8[(HEAP32[2880] | 0) + $i_04_i | 0] = $11;
   $i_04_i = $i_04_i + 1 | 0;
   $6 = HEAP32[2880] | 0;
  } while (($i_04_i | 0) < ($4 | 0));
  HEAP32[2880] = $6;
  if (($6 | 0) == 0) {
   $_0 = 1;
   $storemerge = 0.0;
   HEAPF64[$value >> 3] = $storemerge;
   return $_0 | 0;
  } else {
   $18 = $6;
  }
 } else {
  HEAP32[2880] = $1;
  $18 = $1;
 }
 _strcpy(12504, $18 | 0) | 0;
 $_0 = 0;
 $storemerge = +_atof(12504);
 HEAPF64[$value >> 3] = $storemerge;
 return $_0 | 0;
}
function ___remdi3($a$0, $a$1, $b$0, $b$1) {
 $a$0 = $a$0 | 0;
 $a$1 = $a$1 | 0;
 $b$0 = $b$0 | 0;
 $b$1 = $b$1 | 0;
 var $rem = 0, $1$0 = 0, $1$1 = 0, $2$0 = 0, $2$1 = 0, $4$0 = 0, $4$1 = 0, $10$0 = 0, $10$1 = 0, __stackBase__ = 0;
 __stackBase__ = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $rem = __stackBase__ | 0;
 $1$0 = $a$1 >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
 $1$1 = (($a$1 | 0) < 0 ? -1 : 0) >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
 $2$0 = $b$1 >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
 $2$1 = (($b$1 | 0) < 0 ? -1 : 0) >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
 $4$0 = _i64Subtract($1$0 ^ $a$0, $1$1 ^ $a$1, $1$0, $1$1) | 0;
 $4$1 = tempRet0;
 ___udivmoddi4($4$0, $4$1, _i64Subtract($2$0 ^ $b$0, $2$1 ^ $b$1, $2$0, $2$1) | 0, tempRet0, $rem) | 0;
 $10$0 = _i64Subtract(HEAP32[$rem >> 2] ^ $1$0, HEAP32[$rem + 4 >> 2] ^ $1$1, $1$0, $1$1) | 0;
 $10$1 = tempRet0;
 STACKTOP = __stackBase__;
 return (tempRet0 = $10$1, $10$0) | 0;
}
function _gsl_blas_dsymv($Uplo, $alpha, $A, $X, $beta, $Y) {
 $Uplo = $Uplo | 0;
 $alpha = +$alpha;
 $A = $A | 0;
 $X = $X | 0;
 $beta = +$beta;
 $Y = $Y | 0;
 var $1 = 0, $2 = 0, $3 = 0.0, $4 = 0, $5 = 0, $6 = 0.0, $7 = 0, $N = 0, $60 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $Uplo;
 $3 = $alpha;
 $4 = $A;
 $5 = $X;
 $6 = $beta;
 $7 = $Y;
 $N = HEAP32[$4 + 4 >> 2] | 0;
 if ((HEAP32[$4 >> 2] | 0) != ($N | 0)) {
  _gsl_error(7328, 9144, 775, 20);
  $1 = 20;
  $60 = $1;
  STACKTOP = sp;
  return $60 | 0;
 }
 if (($N | 0) == (HEAP32[$5 >> 2] | 0)) {
  if (($N | 0) == (HEAP32[$7 >> 2] | 0)) {
   _cblas_dsymv(101, $2, $N, $3, HEAP32[$4 + 12 >> 2] | 0, HEAP32[$4 + 8 >> 2] | 0, HEAP32[$5 + 8 >> 2] | 0, HEAP32[$5 + 4 >> 2] | 0, $6, HEAP32[$7 + 8 >> 2] | 0, HEAP32[$7 + 4 >> 2] | 0);
   $1 = 0;
   $60 = $1;
   STACKTOP = sp;
   return $60 | 0;
  }
 }
 _gsl_error(4224, 9144, 779, 19);
 $1 = 19;
 $60 = $1;
 STACKTOP = sp;
 return $60 | 0;
}
function _next_int($value) {
 $value = $value | 0;
 var $1 = 0, $4 = 0, $6 = 0, $i_04_i = 0, $11 = 0, $18 = 0, $storemerge = 0, $_0 = 0;
 $1 = _strtok(0, 752) | 0;
 HEAP32[2880] = $1;
 if (($1 | 0) == 0) {
  HEAP32[2880] = 0;
  $_0 = 1;
  $storemerge = 0;
  HEAP32[$value >> 2] = $storemerge;
  return $_0 | 0;
 }
 $4 = _strlen($1 | 0) | 0;
 if (($4 | 0) > 0) {
  $i_04_i = 0;
  $6 = $1;
  do {
   $11 = (_tolower(HEAP8[$6 + $i_04_i | 0] | 0) | 0) & 255;
   HEAP8[(HEAP32[2880] | 0) + $i_04_i | 0] = $11;
   $i_04_i = $i_04_i + 1 | 0;
   $6 = HEAP32[2880] | 0;
  } while (($i_04_i | 0) < ($4 | 0));
  HEAP32[2880] = $6;
  if (($6 | 0) == 0) {
   $_0 = 1;
   $storemerge = 0;
   HEAP32[$value >> 2] = $storemerge;
   return $_0 | 0;
  } else {
   $18 = $6;
  }
 } else {
  HEAP32[2880] = $1;
  $18 = $1;
 }
 _strcpy(12504, $18 | 0) | 0;
 $_0 = 0;
 $storemerge = _atoi(12504) | 0;
 HEAP32[$value >> 2] = $storemerge;
 return $_0 | 0;
}
function _add_y($ptr, $j, $k, $y) {
 $ptr = $ptr | 0;
 $j = $j | 0;
 $k = $k | 0;
 $y = +$y;
 var $1 = 0, $5 = 0, $6 = 0, $12 = 0, $14 = 0, $15 = 0, $20 = 0, $21 = 0, $25 = 0, $28 = 0;
 $1 = ($j | 0) != 0;
 if ($1) {
  $5 = $j - 1 | 0;
  $6 = _gsl_matrix_ptr(HEAP32[$ptr + 40 >> 2] | 0, $5, $5) | 0;
  HEAPF64[$6 >> 3] = +HEAPF64[$6 >> 3] + $y;
 }
 if (($k | 0) == 0) {
  $28 = $ptr + 4 | 0;
  HEAP32[$28 >> 2] = 1;
  return;
 }
 $12 = $ptr + 40 | 0;
 $14 = $k - 1 | 0;
 $15 = _gsl_matrix_ptr(HEAP32[$12 >> 2] | 0, $14, $14) | 0;
 HEAPF64[$15 >> 3] = +HEAPF64[$15 >> 3] + $y;
 if (!$1) {
  $28 = $ptr + 4 | 0;
  HEAP32[$28 >> 2] = 1;
  return;
 }
 $20 = $j - 1 | 0;
 $21 = _gsl_matrix_ptr(HEAP32[$12 >> 2] | 0, $20, $14) | 0;
 HEAPF64[$21 >> 3] = +HEAPF64[$21 >> 3] - $y;
 $25 = _gsl_matrix_ptr(HEAP32[$12 >> 2] | 0, $14, $20) | 0;
 HEAPF64[$25 >> 3] = +HEAPF64[$25 >> 3] - $y;
 $28 = $ptr + 4 | 0;
 HEAP32[$28 >> 2] = 1;
 return;
}
function _terminate_pole($ptr, $defn) {
 $ptr = $ptr | 0;
 $defn = $defn | 0;
 var $3 = 0, $6 = 0, $7 = 0, $11 = 0, $12 = 0, $15 = 0, $21 = 0, $33 = 0;
 $3 = $defn + 12 | 0;
 _gsl_matrix_add(HEAP32[$ptr + 40 >> 2] | 0, HEAP32[$3 >> 2] | 0) | 0;
 $6 = _malloc(12) | 0;
 $7 = $6;
 if (($6 | 0) == 0) {
  $33 = HEAP32[3164] | 0;
  if (($33 | 0) != 0) {
   _fwrite(10008, 26, 1, $33 | 0) | 0;
  }
  _oe_exit(2);
  return;
 }
 $11 = _gsl_vector_calloc(HEAP32[3122] | 0) | 0;
 $12 = $6;
 HEAP32[$12 >> 2] = $11;
 if (($11 | 0) == 0) {
  $15 = HEAP32[3164] | 0;
  if (($15 | 0) != 0) {
   _fwrite(10512, 31, 1, $15 | 0) | 0;
  }
  _oe_exit(2);
  $21 = HEAP32[$12 >> 2] | 0;
 } else {
  $21 = $11;
 }
 _gsl_blas_dgemv(111, 1.0, HEAP32[$3 >> 2] | 0, HEAP32[$defn + 36 >> 2] | 0, 0.0, $21) | 0;
 HEAP32[$6 + 4 >> 2] = $ptr;
 HEAP32[$6 + 8 >> 2] = 0;
 HEAP32[(HEAP32[2900] | 0) + 8 >> 2] = $7;
 HEAP32[2900] = $7;
 return;
}
function _gsl_blas_dsyr2($Uplo, $alpha, $X, $Y, $A) {
 $Uplo = $Uplo | 0;
 $alpha = +$alpha;
 $X = $X | 0;
 $Y = $Y | 0;
 $A = $A | 0;
 var $1 = 0, $2 = 0, $3 = 0.0, $4 = 0, $5 = 0, $6 = 0, $N = 0, $58 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $Uplo;
 $3 = $alpha;
 $4 = $X;
 $5 = $Y;
 $6 = $A;
 $N = HEAP32[$6 + 4 >> 2] | 0;
 if ((HEAP32[$6 >> 2] | 0) != ($N | 0)) {
  _gsl_error(7328, 9144, 1285, 20);
  $1 = 20;
  $58 = $1;
  STACKTOP = sp;
  return $58 | 0;
 }
 if ((HEAP32[$4 >> 2] | 0) == ($N | 0)) {
  if ((HEAP32[$5 >> 2] | 0) == ($N | 0)) {
   _cblas_dsyr2(101, $2, $N, $3, HEAP32[$4 + 8 >> 2] | 0, HEAP32[$4 + 4 >> 2] | 0, HEAP32[$5 + 8 >> 2] | 0, HEAP32[$5 + 4 >> 2] | 0, HEAP32[$6 + 12 >> 2] | 0, HEAP32[$6 + 8 >> 2] | 0);
   $1 = 0;
   $58 = $1;
   STACKTOP = sp;
   return $58 | 0;
  }
 }
 _gsl_error(4224, 9144, 1289, 19);
 $1 = 19;
 $58 = $1;
 STACKTOP = sp;
 return $58 | 0;
}
function _icrit_function($i_pk, $params) {
 $i_pk = +$i_pk;
 $params = $params | 0;
 var $2 = 0, $5 = 0, $7 = 0, $8 = 0, $11 = 0, $14 = 0, $25 = 0.0, $ret_0 = 0.0;
 $2 = HEAP32[$params >> 2] | 0;
 $5 = HEAP32[$params + 4 >> 2] | 0;
 $7 = $params + 8 | 0;
 $8 = HEAP32[$7 >> 2] | 0;
 _reset_system();
 $11 = HEAP32[(HEAP32[2884] | 0) + 76 >> 2] | 0;
 HEAP32[2882] = $11;
 $14 = HEAP32[(HEAP32[2892] | 0) + 64 >> 2] | 0;
 HEAP32[2890] = $14;
 if (($11 | 0) == 0) {
  if (($14 | 0) != 0) {
   _move_steepfront($14, $2, $5, 0, $i_pk, 383.0e-8, .00010363776466090186, 0.0, +HEAPF64[$14 + 32 >> 3]);
  }
 } else {
  _move_surge($11, $2, $5, 0, $i_pk, 383.0e-8, .00010363776466090186, 0.0);
 }
 _time_step_loops($8);
 $25 = +HEAPF64[HEAP32[$7 >> 2] >> 3] + -1.0;
 if ($25 < 0.0) {
  $ret_0 = $25;
  return +$ret_0;
 }
 $ret_0 = $25 + (+HEAPF64[1433] - +HEAPF64[4]) * 1.0e5;
 return +$ret_0;
}
function _scalbn($x, $n) {
 $x = +$x;
 $n = $n | 0;
 var $3 = 0.0, $4 = 0, $8 = 0, $13 = 0.0, $14 = 0, $18 = 0, $_0 = 0, $y_0 = 0.0;
 if (($n | 0) > 1023) {
  $3 = $x * 8.98846567431158e+307;
  $4 = $n - 1023 | 0;
  if (($4 | 0) > 1023) {
   $8 = $n - 2046 | 0;
   $y_0 = $3 * 8.98846567431158e+307;
   $_0 = ($8 | 0) > 1023 ? 1023 : $8;
  } else {
   $y_0 = $3;
   $_0 = $4;
  }
 } else {
  if (($n | 0) < -1022) {
   $13 = $x * 2.2250738585072014e-308;
   $14 = $n + 1022 | 0;
   if (($14 | 0) < -1022) {
    $18 = $n + 2044 | 0;
    $y_0 = $13 * 2.2250738585072014e-308;
    $_0 = ($18 | 0) < -1022 ? -1022 : $18;
   } else {
    $y_0 = $13;
    $_0 = $14;
   }
  } else {
   $y_0 = $x;
   $_0 = $n;
  }
 }
 return +($y_0 * (HEAP32[tempDoublePtr >> 2] = 0 << 20 | 0 >>> 12, HEAP32[tempDoublePtr + 4 >> 2] = $_0 + 1023 << 20 | 0 >>> 12, +HEAPF64[tempDoublePtr >> 3]));
}
function _calc_pole_vmode($ptr) {
 $ptr = $ptr | 0;
 var $rhs = 0, $6 = 0, $7 = 0, $i_010 = 0, $20 = 0, $22 = 0.0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24 | 0;
 $rhs = sp | 0;
 if ((HEAP32[$ptr + 8 >> 2] | 0) != 0) {
  _gsl_vector_subvector($rhs, HEAP32[$ptr + 20 >> 2] | 0, 1, HEAP32[3122] | 0);
  _gsl_blas_dgemv(111, 1.0, HEAP32[(HEAP32[2896] | 0) + 28 >> 2] | 0, $rhs | 0, 0.0, HEAP32[$ptr + 28 >> 2] | 0) | 0;
  STACKTOP = sp;
  return;
 }
 if ((HEAP32[3124] | 0) <= 0) {
  STACKTOP = sp;
  return;
 }
 $6 = $ptr + 28 | 0;
 $7 = $ptr + 32 | 0;
 $i_010 = 0;
 do {
  $20 = HEAP32[$6 >> 2] | 0;
  $22 = +_gsl_vector_get(HEAP32[$7 >> 2] | 0, $i_010);
  _gsl_vector_set($20, $i_010, $22 * +_gsl_matrix_get(HEAP32[HEAP32[2896] >> 2] | 0, $i_010, $i_010) * .5);
  $i_010 = $i_010 + 1 | 0;
 } while (($i_010 | 0) < (HEAP32[3124] | 0));
 STACKTOP = sp;
 return;
}
function _strcmp($l, $r) {
 $l = $l | 0;
 $r = $r | 0;
 var $1 = 0, $2 = 0, $_015 = 0, $_0914 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $_lcssa11 = 0, $_lcssa = 0, $13 = 0, $14 = 0, $15 = 0;
 $1 = HEAP8[$l] | 0;
 $2 = HEAP8[$r] | 0;
 if ($1 << 24 >> 24 != $2 << 24 >> 24 | $1 << 24 >> 24 == 0 | $2 << 24 >> 24 == 0) {
  $_lcssa = $1;
  $_lcssa11 = $2;
  $13 = $_lcssa & 255;
  $14 = $_lcssa11 & 255;
  $15 = $13 - $14 | 0;
  return $15 | 0;
 } else {
  $_0914 = $l;
  $_015 = $r;
 }
 while (1) {
  $6 = $_0914 + 1 | 0;
  $7 = $_015 + 1 | 0;
  $8 = HEAP8[$6] | 0;
  $9 = HEAP8[$7] | 0;
  if ($8 << 24 >> 24 != $9 << 24 >> 24 | $8 << 24 >> 24 == 0 | $9 << 24 >> 24 == 0) {
   $_lcssa = $8;
   $_lcssa11 = $9;
   break;
  } else {
   $_0914 = $6;
   $_015 = $7;
  }
 }
 $13 = $_lcssa & 255;
 $14 = $_lcssa11 & 255;
 $15 = $13 - $14 | 0;
 return $15 | 0;
}
function _add_voltmeter($i, $j, $k) {
 $i = $i | 0;
 $j = $j | 0;
 $k = $k | 0;
 var $1 = 0, $2 = 0, $5 = 0, $9 = 0, $31 = 0, $_0 = 0;
 $1 = _malloc(40) | 0;
 $2 = $1;
 if (($1 | 0) == 0) {
  $31 = HEAP32[3164] | 0;
  if (($31 | 0) != 0) {
   _fwrite(3296, 29, 1, $31 | 0) | 0;
  }
  _oe_exit(2);
  $_0 = 0;
  return $_0 | 0;
 } else {
  $5 = _find_pole($i) | 0;
  if (($5 | 0) == 0) {
   _oe_exit(15);
  }
  $9 = $5 + 20 | 0;
  HEAP32[$1 + 24 >> 2] = _gsl_vector_ptr(HEAP32[$9 >> 2] | 0, $j) | 0;
  HEAP32[$1 + 28 >> 2] = _gsl_vector_ptr(HEAP32[$9 >> 2] | 0, $k) | 0;
  HEAP32[$5 + 8 >> 2] = 1;
  HEAP32[$1 + 8 >> 2] = $i;
  HEAP32[$1 >> 2] = $j;
  HEAP32[$1 + 4 >> 2] = $k;
  HEAPF64[$1 + 16 >> 3] = 0.0;
  HEAP32[$1 + 32 >> 2] = 0;
  HEAP32[(HEAP32[3156] | 0) + 32 >> 2] = $2;
  HEAP32[3156] = $2;
  $_0 = $2;
  return $_0 | 0;
 }
 return 0;
}
function _gsl_vector_add($a, $b) {
 $a = $a | 0;
 $b = $b | 0;
 var $1 = 0, $2 = 0, $3 = 0, $N = 0, $stride_a = 0, $stride_b = 0, $i = 0, $29 = 0, $37 = 0, $41 = 0, $49 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $a;
 $3 = $b;
 $N = HEAP32[$2 >> 2] | 0;
 if ((HEAP32[$3 >> 2] | 0) != ($N | 0)) {
  _gsl_error(10072, 8048, 27, 19);
  $1 = 19;
  $49 = $1;
  STACKTOP = sp;
  return $49 | 0;
 }
 $stride_a = HEAP32[$2 + 4 >> 2] | 0;
 $stride_b = HEAP32[$3 + 4 >> 2] | 0;
 $i = 0;
 while (1) {
  if (!($i >>> 0 < $N >>> 0)) {
   break;
  }
  $29 = Math_imul($i, $stride_b) | 0;
  $37 = Math_imul($i, $stride_a) | 0;
  $41 = (HEAP32[$2 + 8 >> 2] | 0) + ($37 << 3) | 0;
  HEAPF64[$41 >> 3] = +HEAPF64[$41 >> 3] + +HEAPF64[(HEAP32[$3 + 8 >> 2] | 0) + ($29 << 3) >> 3];
  $i = $i + 1 | 0;
 }
 $1 = 0;
 $49 = $1;
 STACKTOP = sp;
 return $49 | 0;
}
function _gsl_permutation_swap($p, $i, $j) {
 $p = $p | 0;
 $i = $i | 0;
 $j = $j | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $size = 0, $tmp = 0, $51 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $p;
 $3 = $i;
 $4 = $j;
 $size = HEAP32[$2 >> 2] | 0;
 if ($3 >>> 0 >= $size >>> 0) {
  _gsl_error(10592, 10920, 43, 4);
  $1 = 4;
  $51 = $1;
  STACKTOP = sp;
  return $51 | 0;
 }
 if ($4 >>> 0 >= $size >>> 0) {
  _gsl_error(8200, 10920, 48, 4);
  $1 = 4;
  $51 = $1;
  STACKTOP = sp;
  return $51 | 0;
 }
 if (($3 | 0) != ($4 | 0)) {
  $tmp = HEAP32[(HEAP32[$2 + 4 >> 2] | 0) + ($3 << 2) >> 2] | 0;
  HEAP32[(HEAP32[$2 + 4 >> 2] | 0) + ($3 << 2) >> 2] = HEAP32[(HEAP32[$2 + 4 >> 2] | 0) + ($4 << 2) >> 2];
  HEAP32[(HEAP32[$2 + 4 >> 2] | 0) + ($4 << 2) >> 2] = $tmp;
 }
 $1 = 0;
 $51 = $1;
 STACKTOP = sp;
 return $51 | 0;
}
function _gsl_linalg_LU_invert($LU, $p, $inverse) {
 $LU = $LU | 0;
 $p = $p | 0;
 $inverse = $inverse | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $i = 0, $n = 0, $status = 0, $c = 0, $status_i = 0, $38 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24 | 0;
 $c = sp | 0;
 $2 = $LU;
 $3 = $p;
 $4 = $inverse;
 $n = HEAP32[$2 >> 2] | 0;
 $status = 0;
 if ((_singular867($2) | 0) != 0) {
  _gsl_error(3864, 8704, 262, 1);
  $1 = 1;
  $38 = $1;
  STACKTOP = sp;
  return $38 | 0;
 }
 _gsl_matrix_set_identity($4);
 $i = 0;
 while (1) {
  if (!($i >>> 0 < $n >>> 0)) {
   break;
  }
  _gsl_matrix_column($c, $4, $i);
  $status_i = _gsl_linalg_LU_svx($2, $3, $c | 0) | 0;
  if (($status_i | 0) != 0) {
   $status = $status_i;
  }
  $i = $i + 1 | 0;
 }
 $1 = $status;
 $38 = $1;
 STACKTOP = sp;
 return $38 | 0;
}
function _init_line_history($ptr) {
 $ptr = $ptr | 0;
 var $3 = 0, $4 = 0, $5 = 0, $6 = 0, $i_016 = 0, $12 = 0.0, $17 = 0.0, $j_015 = 0;
 if ((HEAP32[3124] | 0) <= 0) {
  return;
 }
 $3 = $ptr | 0;
 $4 = $ptr + 16 | 0;
 $5 = $ptr + 4 | 0;
 $6 = $ptr + 8 | 0;
 $i_016 = 0;
 do {
  $12 = -0.0 - +_gsl_matrix_get(HEAP32[(HEAP32[$3 >> 2] | 0) + 4 >> 2] | 0, $i_016, $i_016);
  $17 = +_gsl_vector_get(HEAP32[(HEAP32[$3 >> 2] | 0) + 32 >> 2] | 0, $i_016) * $12;
  if ((HEAP32[$4 >> 2] | 0) > 0) {
   $j_015 = 0;
   do {
    _gsl_matrix_set(HEAP32[$5 >> 2] | 0, $i_016, $j_015, $17);
    _gsl_matrix_set(HEAP32[$6 >> 2] | 0, $i_016, $j_015, $17);
    $j_015 = $j_015 + 1 | 0;
   } while (($j_015 | 0) < (HEAP32[$4 >> 2] | 0));
  }
  $i_016 = $i_016 + 1 | 0;
 } while (($i_016 | 0) < (HEAP32[3124] | 0));
 return;
}
function _gsl_stream_printf($label, $file, $line, $reason) {
 $label = $label | 0;
 $file = $file | 0;
 $line = $line | 0;
 $reason = $reason | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 $1 = $label;
 $2 = $file;
 $3 = $line;
 $4 = $reason;
 if ((HEAP32[3182] | 0) == 0) {
  HEAP32[3182] = HEAP32[_stderr >> 2];
 }
 if ((HEAP32[3180] | 0) != 0) {
  FUNCTION_TABLE_viiii[HEAP32[3180] & 1]($1, $2, $3, $4);
  STACKTOP = sp;
  return;
 } else {
  _fprintf(HEAP32[3182] | 0, 3632, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 32 | 0, HEAP32[tempVarArgs >> 2] = $2, HEAP32[tempVarArgs + 8 >> 2] = $3, HEAP32[tempVarArgs + 16 >> 2] = $1, HEAP32[tempVarArgs + 24 >> 2] = $4, tempVarArgs) | 0) | 0;
  STACKTOP = tempVarArgs;
  STACKTOP = sp;
  return;
 }
}
function _gsl_vector_int_alloc($n) {
 $n = $n | 0;
 var $1 = 0, $2 = 0, $block = 0, $v = 0, $44 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $n;
 if (($2 | 0) == 0) {
  _gsl_error(10224, 10800, 29, 4);
  $1 = 0;
  $44 = $1;
  STACKTOP = sp;
  return $44 | 0;
 }
 $v = _malloc(20) | 0;
 if (($v | 0) == 0) {
  _gsl_error(8064, 10800, 37, 8);
  $1 = 0;
  $44 = $1;
  STACKTOP = sp;
  return $44 | 0;
 }
 $block = _gsl_block_int_alloc($2) | 0;
 if (($block | 0) != 0) {
  HEAP32[$v + 8 >> 2] = HEAP32[$block + 4 >> 2];
  HEAP32[$v >> 2] = $2;
  HEAP32[$v + 4 >> 2] = 1;
  HEAP32[$v + 12 >> 2] = $block;
  HEAP32[$v + 16 >> 2] = 1;
  $1 = $v;
  $44 = $1;
  STACKTOP = sp;
  return $44 | 0;
 }
 _free($v);
 _gsl_error(6472, 10800, 47, 8);
 $1 = 0;
 $44 = $1;
 STACKTOP = sp;
 return $44 | 0;
}
function ___divdi3($a$0, $a$1, $b$0, $b$1) {
 $a$0 = $a$0 | 0;
 $a$1 = $a$1 | 0;
 $b$0 = $b$0 | 0;
 $b$1 = $b$1 | 0;
 var $1$0 = 0, $1$1 = 0, $2$0 = 0, $2$1 = 0, $4$0 = 0, $4$1 = 0, $7$0 = 0, $7$1 = 0, $10$0 = 0;
 $1$0 = $a$1 >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
 $1$1 = (($a$1 | 0) < 0 ? -1 : 0) >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
 $2$0 = $b$1 >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
 $2$1 = (($b$1 | 0) < 0 ? -1 : 0) >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
 $4$0 = _i64Subtract($1$0 ^ $a$0, $1$1 ^ $a$1, $1$0, $1$1) | 0;
 $4$1 = tempRet0;
 $7$0 = $2$0 ^ $1$0;
 $7$1 = $2$1 ^ $1$1;
 $10$0 = _i64Subtract((___udivmoddi4($4$0, $4$1, _i64Subtract($2$0 ^ $b$0, $2$1 ^ $b$1, $2$0, $2$1) | 0, tempRet0, 0) | 0) ^ $7$0, tempRet0 ^ $7$1, $7$0, $7$1) | 0;
 return $10$0 | 0;
}
function _gsl_blas_dtrsv($Uplo, $TransA, $Diag, $A, $X) {
 $Uplo = $Uplo | 0;
 $TransA = $TransA | 0;
 $Diag = $Diag | 0;
 $A = $A | 0;
 $X = $X | 0;
 var $1 = 0, $5 = 0, $6 = 0, $N = 0, $47 = 0, sp = 0;
 sp = STACKTOP;
 $5 = $A;
 $6 = $X;
 $N = HEAP32[$5 + 4 >> 2] | 0;
 if ((HEAP32[$5 >> 2] | 0) != ($N | 0)) {
  _gsl_error(7328, 9144, 915, 20);
  $1 = 20;
  $47 = $1;
  STACKTOP = sp;
  return $47 | 0;
 }
 if (($N | 0) != (HEAP32[$6 >> 2] | 0)) {
  _gsl_error(4224, 9144, 919, 19);
  $1 = 19;
  $47 = $1;
  STACKTOP = sp;
  return $47 | 0;
 } else {
  _cblas_dtrsv(101, $Uplo, $TransA, $Diag, $N, HEAP32[$5 + 12 >> 2] | 0, HEAP32[$5 + 8 >> 2] | 0, HEAP32[$6 + 8 >> 2] | 0, HEAP32[$6 + 4 >> 2] | 0);
  $1 = 0;
  $47 = $1;
  STACKTOP = sp;
  return $47 | 0;
 }
 return 0;
}
function _gsl_vector_alloc($n) {
 $n = $n | 0;
 var $1 = 0, $2 = 0, $block = 0, $v = 0, $44 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $n;
 if (($2 | 0) == 0) {
  _gsl_error(10224, 10800, 29, 4);
  $1 = 0;
  $44 = $1;
  STACKTOP = sp;
  return $44 | 0;
 }
 $v = _malloc(20) | 0;
 if (($v | 0) == 0) {
  _gsl_error(8064, 10800, 37, 8);
  $1 = 0;
  $44 = $1;
  STACKTOP = sp;
  return $44 | 0;
 }
 $block = _gsl_block_alloc($2) | 0;
 if (($block | 0) != 0) {
  HEAP32[$v + 8 >> 2] = HEAP32[$block + 4 >> 2];
  HEAP32[$v >> 2] = $2;
  HEAP32[$v + 4 >> 2] = 1;
  HEAP32[$v + 12 >> 2] = $block;
  HEAP32[$v + 16 >> 2] = 1;
  $1 = $v;
  $44 = $1;
  STACKTOP = sp;
  return $44 | 0;
 }
 _free($v);
 _gsl_error(6472, 10800, 47, 8);
 $1 = 0;
 $44 = $1;
 STACKTOP = sp;
 return $44 | 0;
}
function _print_pipegap_data($ptr) {
 $ptr = $ptr | 0;
 var $1 = 0, $11 = 0, $13 = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 $1 = $ptr + 24 | 0;
 if (!(+HEAPF64[$1 >> 3] > 0.0)) {
  STACKTOP = sp;
  return;
 }
 $11 = HEAP32[$ptr + 60 >> 2] | 0;
 $13 = HEAP32[$ptr + 64 >> 2] | 0;
 _fprintf(HEAP32[2994] | 0, 9376, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 24 | 0, HEAP32[tempVarArgs >> 2] = HEAP32[HEAP32[$ptr + 68 >> 2] >> 2], HEAP32[tempVarArgs + 8 >> 2] = $11, HEAP32[tempVarArgs + 16 >> 2] = $13, tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 _fprintf(HEAP32[2994] | 0, 7432, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 8 | 0, HEAPF64[tempVarArgs >> 3] = +HEAPF64[$1 >> 3], tempVarArgs) | 0) | 0;
 STACKTOP = tempVarArgs;
 STACKTOP = sp;
 return;
}
function _cblas_ddot($N, $X, $incX, $Y, $incY) {
 $N = $N | 0;
 $X = $X | 0;
 $incX = $incX | 0;
 $Y = $Y | 0;
 $incY = $incY | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $r = 0.0, $i = 0, $ix = 0, $iy = 0, $16 = 0, $27 = 0, sp = 0;
 sp = STACKTOP;
 $1 = $N;
 $2 = $X;
 $3 = $incX;
 $4 = $Y;
 $5 = $incY;
 $r = 0.0;
 if (($3 | 0) > 0) {
  $16 = 0;
 } else {
  $16 = Math_imul($1 - 1 | 0, -$3 | 0) | 0;
 }
 $ix = $16;
 if (($5 | 0) > 0) {
  $27 = 0;
 } else {
  $27 = Math_imul($1 - 1 | 0, -$5 | 0) | 0;
 }
 $iy = $27;
 $i = 0;
 while (1) {
  if (($i | 0) >= ($1 | 0)) {
   break;
  }
  $r = $r + +HEAPF64[$2 + ($ix << 3) >> 3] * +HEAPF64[$4 + ($iy << 3) >> 3];
  $ix = $ix + $3 | 0;
  $iy = $iy + $5 | 0;
  $i = $i + 1 | 0;
 }
 STACKTOP = sp;
 return +$r;
}
function _inject_surge($ptr) {
 $ptr = $ptr | 0;
 var $4 = 0.0, $8 = 0.0, $i_0 = 0.0, $31 = 0, $37 = 0, $45 = 0;
 $4 = +HEAPF64[4] - +HEAPF64[$ptr + 48 >> 3];
 if (!($4 > 0.0)) {
  return;
 }
 $8 = +HEAPF64[$ptr + 40 >> 3];
 if ($4 > $8) {
  $i_0 = +HEAPF64[$ptr >> 3] * +Math_exp((-0.0 - ($4 - $8)) / +HEAPF64[$ptr + 56 >> 3]);
 } else {
  $i_0 = +HEAPF64[$ptr >> 3] * .5 * (1.0 - +Math_cos($4 * +HEAPF64[$ptr + 24 >> 3]));
 }
 $31 = $ptr + 72 | 0;
 $37 = _gsl_vector_ptr(HEAP32[(HEAP32[$31 >> 2] | 0) + 24 >> 2] | 0, HEAP32[$ptr + 64 >> 2] | 0) | 0;
 HEAPF64[$37 >> 3] = $i_0 + +HEAPF64[$37 >> 3];
 $45 = _gsl_vector_ptr(HEAP32[(HEAP32[$31 >> 2] | 0) + 24 >> 2] | 0, HEAP32[$ptr + 68 >> 2] | 0) | 0;
 HEAPF64[$45 >> 3] = +HEAPF64[$45 >> 3] - $i_0;
 return;
}
function _gsl_matrix_int_get($m, $i, $j) {
 $m = $m | 0;
 $i = $i | 0;
 $j = $j | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $34 = 0, $41 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $m;
 $3 = $i;
 $4 = $j;
 do {
  if ((HEAP32[486] | 0) != 0) {
   if ($3 >>> 0 >= (HEAP32[$2 >> 2] | 0) >>> 0) {
    _gsl_error(11312, 10976, 275, 4);
    $1 = 0;
    $41 = $1;
    STACKTOP = sp;
    return $41 | 0;
   }
   if (!($4 >>> 0 >= (HEAP32[$2 + 4 >> 2] | 0) >>> 0)) {
    break;
   }
   _gsl_error(8440, 10976, 279, 4);
   $1 = 0;
   $41 = $1;
   STACKTOP = sp;
   return $41 | 0;
  }
 } while (0);
 $34 = (Math_imul($3, HEAP32[$2 + 8 >> 2] | 0) | 0) + $4 | 0;
 $1 = HEAP32[(HEAP32[$2 + 12 >> 2] | 0) + ($34 << 2) >> 2] | 0;
 $41 = $1;
 STACKTOP = sp;
 return $41 | 0;
}
function _gsl_error($reason, $file, $line, $gsl_errno) {
 $reason = $reason | 0;
 $file = $file | 0;
 $line = $line | 0;
 $gsl_errno = $gsl_errno | 0;
 var $1 = 0, $2 = 0, $3 = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 $1 = $reason;
 $2 = $file;
 $3 = $line;
 if ((HEAP32[3184] | 0) != 0) {
  FUNCTION_TABLE_viiii[HEAP32[3184] & 1]($1, $2, $3, $gsl_errno);
  STACKTOP = sp;
  return;
 } else {
  _gsl_stream_printf(3656, $2, $3, $1);
  _fflush(HEAP32[_stdout >> 2] | 0) | 0;
  _fprintf(HEAP32[_stderr >> 2] | 0, 8904, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 1 | 0, STACKTOP = STACKTOP + 7 & -8, HEAP32[tempVarArgs >> 2] = 0, tempVarArgs) | 0) | 0;
  STACKTOP = tempVarArgs;
  _fflush(HEAP32[_stderr >> 2] | 0) | 0;
  _abort();
 }
}
function _gsl_matrix_get($m, $i, $j) {
 $m = $m | 0;
 $i = $i | 0;
 $j = $j | 0;
 var $1 = 0.0, $2 = 0, $3 = 0, $4 = 0, $34 = 0, $41 = 0.0, sp = 0;
 sp = STACKTOP;
 $2 = $m;
 $3 = $i;
 $4 = $j;
 do {
  if ((HEAP32[486] | 0) != 0) {
   if ($3 >>> 0 >= (HEAP32[$2 >> 2] | 0) >>> 0) {
    _gsl_error(11312, 4120, 275, 4);
    $1 = 0.0;
    $41 = $1;
    STACKTOP = sp;
    return +$41;
   }
   if (!($4 >>> 0 >= (HEAP32[$2 + 4 >> 2] | 0) >>> 0)) {
    break;
   }
   _gsl_error(8440, 4120, 279, 4);
   $1 = 0.0;
   $41 = $1;
   STACKTOP = sp;
   return +$41;
  }
 } while (0);
 $34 = (Math_imul($3, HEAP32[$2 + 8 >> 2] | 0) | 0) + $4 | 0;
 $1 = +HEAPF64[(HEAP32[$2 + 12 >> 2] | 0) + ($34 << 3) >> 3];
 $41 = $1;
 STACKTOP = sp;
 return +$41;
}
function ___toread($f) {
 $f = $f | 0;
 var $1 = 0, $2 = 0, $5 = 0, $7 = 0, $17 = 0, $18 = 0, $27 = 0, $_0 = 0;
 $1 = $f + 74 | 0;
 $2 = HEAP8[$1] | 0;
 HEAP8[$1] = $2 - 1 & 255 | $2;
 $5 = $f + 20 | 0;
 $7 = $f + 44 | 0;
 if ((HEAP32[$5 >> 2] | 0) >>> 0 > (HEAP32[$7 >> 2] | 0) >>> 0) {
  FUNCTION_TABLE_iiii[HEAP32[$f + 36 >> 2] & 1]($f, 0, 0) | 0;
 }
 HEAP32[$f + 16 >> 2] = 0;
 HEAP32[$f + 28 >> 2] = 0;
 HEAP32[$5 >> 2] = 0;
 $17 = $f | 0;
 $18 = HEAP32[$17 >> 2] | 0;
 if (($18 & 20 | 0) == 0) {
  $27 = HEAP32[$7 >> 2] | 0;
  HEAP32[$f + 8 >> 2] = $27;
  HEAP32[$f + 4 >> 2] = $27;
  $_0 = 0;
  return $_0 | 0;
 }
 if (($18 & 4 | 0) == 0) {
  $_0 = -1;
  return $_0 | 0;
 }
 HEAP32[$17 >> 2] = $18 | 32;
 $_0 = -1;
 return $_0 | 0;
}
function _find_arrester($at, $from, $to) {
 $at = $at | 0;
 $from = $from | 0;
 $to = $to | 0;
 var $1 = 0, $3 = 0, $5 = 0, $16 = 0, $_0 = 0, label = 0;
 $1 = HEAP32[3216] | 0;
 HEAP32[3214] = $1;
 $3 = HEAP32[$1 + 168 >> 2] | 0;
 HEAP32[3214] = $3;
 if (($3 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 } else {
  $5 = $3;
 }
 while (1) {
  if ((HEAP32[HEAP32[$5 + 164 >> 2] >> 2] | 0) == ($at | 0)) {
   if ((HEAP32[$5 + 156 >> 2] | 0) == ($from | 0)) {
    $_0 = $5;
    label = 5;
    break;
   }
  }
  $16 = HEAP32[$5 + 168 >> 2] | 0;
  HEAP32[3214] = $16;
  if (($16 | 0) == 0) {
   $_0 = 0;
   label = 5;
   break;
  } else {
   $5 = $16;
  }
 }
 if ((label | 0) == 5) {
  return $_0 | 0;
 }
 return 0;
}
function _find_arrbez($at, $from, $to) {
 $at = $at | 0;
 $from = $from | 0;
 $to = $to | 0;
 var $1 = 0, $3 = 0, $5 = 0, $16 = 0, $_0 = 0, label = 0;
 $1 = HEAP32[3220] | 0;
 HEAP32[3218] = $1;
 $3 = HEAP32[$1 + 160 >> 2] | 0;
 HEAP32[3218] = $3;
 if (($3 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 } else {
  $5 = $3;
 }
 while (1) {
  if ((HEAP32[HEAP32[$5 + 156 >> 2] >> 2] | 0) == ($at | 0)) {
   if ((HEAP32[$5 + 144 >> 2] | 0) == ($from | 0)) {
    $_0 = $5;
    label = 5;
    break;
   }
  }
  $16 = HEAP32[$5 + 160 >> 2] | 0;
  HEAP32[3218] = $16;
  if (($16 | 0) == 0) {
   $_0 = 0;
   label = 5;
   break;
  } else {
   $5 = $16;
  }
 }
 if ((label | 0) == 5) {
  return $_0 | 0;
 }
 return 0;
}
function _find_ground($at, $from, $to) {
 $at = $at | 0;
 $from = $from | 0;
 $to = $to | 0;
 var $1 = 0, $3 = 0, $5 = 0, $16 = 0, $_0 = 0, label = 0;
 $1 = HEAP32[3188] | 0;
 HEAP32[3186] = $1;
 $3 = HEAP32[$1 + 108 >> 2] | 0;
 HEAP32[3186] = $3;
 if (($3 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 } else {
  $5 = $3;
 }
 while (1) {
  if ((HEAP32[HEAP32[$5 + 104 >> 2] >> 2] | 0) == ($at | 0)) {
   if ((HEAP32[$5 + 96 >> 2] | 0) == ($from | 0)) {
    $_0 = $5;
    label = 5;
    break;
   }
  }
  $16 = HEAP32[$5 + 108 >> 2] | 0;
  HEAP32[3186] = $16;
  if (($16 | 0) == 0) {
   $_0 = 0;
   label = 5;
   break;
  } else {
   $5 = $16;
  }
 }
 if ((label | 0) == 5) {
  return $_0 | 0;
 }
 return 0;
}
function _strtok($s, $sep) {
 $s = $s | 0;
 $sep = $sep | 0;
 var $3 = 0, $_010 = 0, $6 = 0, $7 = 0, $_sum = 0, $13 = 0, $_0 = 0;
 if (($s | 0) == 0) {
  $3 = HEAP32[2886] | 0;
  if (($3 | 0) == 0) {
   $_0 = 0;
   return $_0 | 0;
  } else {
   $_010 = $3;
  }
 } else {
  $_010 = $s;
 }
 $6 = _strspn($_010, $sep) | 0;
 $7 = $_010 + $6 | 0;
 if ((HEAP8[$7] | 0) == 0) {
  HEAP32[2886] = 0;
  $_0 = 0;
  return $_0 | 0;
 }
 $_sum = (_strcspn($7, $sep) | 0) + $6 | 0;
 $13 = $_010 + $_sum | 0;
 HEAP32[2886] = $13;
 if ((HEAP8[$13] | 0) == 0) {
  HEAP32[2886] = 0;
  $_0 = $7;
  return $_0 | 0;
 } else {
  HEAP32[2886] = $_010 + ($_sum + 1);
  HEAP8[$13] = 0;
  $_0 = $7;
  return $_0 | 0;
 }
 return 0;
}
function _gsl_matrix_ptr($m, $i, $j) {
 $m = $m | 0;
 $i = $i | 0;
 $j = $j | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $40 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $m;
 $3 = $i;
 $4 = $j;
 do {
  if ((HEAP32[486] | 0) != 0) {
   if ($3 >>> 0 >= (HEAP32[$2 >> 2] | 0) >>> 0) {
    _gsl_error(11312, 4120, 315, 4);
    $1 = 0;
    $40 = $1;
    STACKTOP = sp;
    return $40 | 0;
   }
   if (!($4 >>> 0 >= (HEAP32[$2 + 4 >> 2] | 0) >>> 0)) {
    break;
   }
   _gsl_error(8440, 4120, 319, 4);
   $1 = 0;
   $40 = $1;
   STACKTOP = sp;
   return $40 | 0;
  }
 } while (0);
 $1 = (HEAP32[$2 + 12 >> 2] | 0) + ((Math_imul($3, HEAP32[$2 + 8 >> 2] | 0) | 0) + $4 << 3) | 0;
 $40 = $1;
 STACKTOP = sp;
 return $40 | 0;
}
function _find_pipegap($at, $from, $to) {
 $at = $at | 0;
 $from = $from | 0;
 $to = $to | 0;
 var $1 = 0, $3 = 0, $5 = 0, $16 = 0, $_0 = 0, label = 0;
 $1 = HEAP32[2988] | 0;
 HEAP32[2986] = $1;
 $3 = HEAP32[$1 + 72 >> 2] | 0;
 HEAP32[2986] = $3;
 if (($3 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 } else {
  $5 = $3;
 }
 while (1) {
  if ((HEAP32[HEAP32[$5 + 68 >> 2] >> 2] | 0) == ($at | 0)) {
   if ((HEAP32[$5 + 60 >> 2] | 0) == ($from | 0)) {
    $_0 = $5;
    label = 5;
    break;
   }
  }
  $16 = HEAP32[$5 + 72 >> 2] | 0;
  HEAP32[2986] = $16;
  if (($16 | 0) == 0) {
   $_0 = 0;
   label = 5;
   break;
  } else {
   $5 = $16;
  }
 }
 if ((label | 0) == 5) {
  return $_0 | 0;
 }
 return 0;
}
function _allocate_definition_memory($defn, $n) {
 $defn = $defn | 0;
 $n = $n | 0;
 HEAP32[$defn + 16 >> 2] = _gsl_matrix_calloc($n, $n) | 0;
 HEAP32[$defn + 20 >> 2] = _gsl_matrix_calloc($n, $n) | 0;
 HEAP32[$defn + 24 >> 2] = _gsl_matrix_calloc($n, $n) | 0;
 HEAP32[$defn + 28 >> 2] = _gsl_matrix_calloc($n, $n) | 0;
 HEAP32[$defn >> 2] = _gsl_matrix_calloc($n, $n) | 0;
 HEAP32[$defn + 4 >> 2] = _gsl_matrix_calloc($n, $n) | 0;
 HEAP32[$defn + 8 >> 2] = _gsl_matrix_calloc($n, $n) | 0;
 HEAP32[$defn + 12 >> 2] = _gsl_matrix_calloc($n, $n) | 0;
 HEAP32[$defn + 32 >> 2] = _gsl_vector_calloc($n) | 0;
 HEAP32[$defn + 36 >> 2] = _gsl_vector_calloc($n) | 0;
 HEAPF64[$defn + 40 >> 3] = 3.0e8;
 return;
}
function _find_customer($at, $from, $to) {
 $at = $at | 0;
 $from = $from | 0;
 $to = $to | 0;
 var $1 = 0, $3 = 0, $5 = 0, $16 = 0, $_0 = 0, label = 0;
 $1 = HEAP32[3200] | 0;
 HEAP32[3198] = $1;
 $3 = HEAP32[$1 + 72 >> 2] | 0;
 HEAP32[3198] = $3;
 if (($3 | 0) == 0) {
  $_0 = 0;
  return $_0 | 0;
 } else {
  $5 = $3;
 }
 while (1) {
  if ((HEAP32[HEAP32[$5 + 64 >> 2] >> 2] | 0) == ($at | 0)) {
   if ((HEAP32[$5 >> 2] | 0) == ($from | 0)) {
    $_0 = $5;
    label = 5;
    break;
   }
  }
  $16 = HEAP32[$5 + 72 >> 2] | 0;
  HEAP32[3198] = $16;
  if (($16 | 0) == 0) {
   $_0 = 0;
   label = 5;
   break;
  } else {
   $5 = $16;
  }
 }
 if ((label | 0) == 5) {
  return $_0 | 0;
 }
 return 0;
}
function _insulator_answers_cleanup($ptr) {
 $ptr = $ptr | 0;
 var $2 = 0.0, $4 = 0.0, $9 = 0, $24 = 0.0, $27 = 0.0, $28 = 0.0;
 $2 = +HEAPF64[$ptr + 24 >> 3];
 $4 = +HEAPF64[$ptr + 32 >> 3];
 if ((HEAP32[$ptr + 64 >> 2] | 0) == 1) {
  $9 = $ptr + 56 | 0;
  HEAPF64[$9 >> 3] = 1.0;
  _add_y(HEAP32[$ptr + 76 >> 2] | 0, HEAP32[$ptr + 68 >> 2] | 0, HEAP32[$ptr + 72 >> 2] | 0, -1.0e3);
  $27 = +HEAPF64[$9 >> 3];
 } else {
  $24 = +Math_pow(+(($4 > $2 ? $4 : $2) / +HEAPF64[$ptr + 40 >> 3]), +(1.0 / +HEAPF64[$ptr + 16 >> 3]));
  HEAPF64[$ptr + 56 >> 3] = $24;
  $27 = $24;
 }
 $28 = +Math_abs(+$27);
 if (!($28 > +Math_abs(+(+HEAPF64[1434])))) {
  return;
 }
 HEAPF64[1434] = $27;
 return;
}
function _strtod($s, $p) {
 $s = $s | 0;
 $p = $p | 0;
 var $f_i = 0, $2 = 0, $3 = 0, $6 = 0.0, $14 = 0, $21 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 112 | 0;
 $f_i = sp | 0;
 _memset($f_i | 0, 0, 112) | 0;
 $2 = $f_i + 4 | 0;
 HEAP32[$2 >> 2] = $s;
 $3 = $f_i + 8 | 0;
 HEAP32[$3 >> 2] = -1;
 HEAP32[$f_i + 44 >> 2] = $s;
 HEAP32[$f_i + 76 >> 2] = -1;
 ___shlim($f_i, 0);
 $6 = +___floatscan($f_i, 1, 1);
 $14 = (HEAP32[$2 >> 2] | 0) - (HEAP32[$3 >> 2] | 0) + (HEAP32[$f_i + 108 >> 2] | 0) | 0;
 if (($p | 0) == 0) {
  STACKTOP = sp;
  return +$6;
 }
 if (($14 | 0) == 0) {
  $21 = $s;
 } else {
  $21 = $s + $14 | 0;
 }
 HEAP32[$p >> 2] = $21;
 STACKTOP = sp;
 return +$6;
}
function _memcpy(dest, src, num) {
 dest = dest | 0;
 src = src | 0;
 num = num | 0;
 var ret = 0;
 if ((num | 0) >= 4096) return _emscripten_memcpy_big(dest | 0, src | 0, num | 0) | 0;
 ret = dest | 0;
 if ((dest & 3) == (src & 3)) {
  while (dest & 3) {
   if ((num | 0) == 0) return ret | 0;
   HEAP8[dest] = HEAP8[src] | 0;
   dest = dest + 1 | 0;
   src = src + 1 | 0;
   num = num - 1 | 0;
  }
  while ((num | 0) >= 4) {
   HEAP32[dest >> 2] = HEAP32[src >> 2];
   dest = dest + 4 | 0;
   src = src + 4 | 0;
   num = num - 4 | 0;
  }
 }
 while ((num | 0) > 0) {
  HEAP8[dest] = HEAP8[src] | 0;
  dest = dest + 1 | 0;
  src = src + 1 | 0;
  num = num - 1 | 0;
 }
 return ret | 0;
}
function _gsl_root_fsolver_set($s, $f, $x_lower, $x_upper) {
 $s = $s | 0;
 $f = $f | 0;
 $x_lower = +$x_lower;
 $x_upper = +$x_upper;
 var $1 = 0, $2 = 0, $4 = 0.0, $5 = 0.0, $45 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $s;
 $4 = $x_lower;
 $5 = $x_upper;
 if (!($4 > $5)) {
  HEAP32[$2 + 4 >> 2] = $f;
  HEAPF64[$2 + 8 >> 3] = ($4 + $5) * .5;
  HEAPF64[$2 + 16 >> 3] = $4;
  HEAPF64[$2 + 24 >> 3] = $5;
  $1 = FUNCTION_TABLE_iiiidd[HEAP32[(HEAP32[$2 >> 2] | 0) + 8 >> 2] & 3](HEAP32[$2 + 32 >> 2] | 0, HEAP32[$2 + 4 >> 2] | 0, $2 + 8 | 0, $4, $5) | 0;
  $45 = $1;
  STACKTOP = sp;
  return $45 | 0;
 }
 _gsl_error(6512, 10832, 58, 4);
 $1 = 4;
 $45 = $1;
 STACKTOP = sp;
 return $45 | 0;
}
function _reset_lpm($ptr) {
 $ptr = $ptr | 0;
 var $4 = 0, $5 = 0, $8 = 0.0, $13 = 0, $19 = 0, $20 = 0, $26 = 0;
 $4 = ~~(+HEAPF64[1433] / +HEAPF64[323]);
 $5 = $4 + 2 | 0;
 $8 = +HEAPF64[$ptr >> 3] / 56.0e4;
 HEAPF64[$ptr + 24 >> 3] = $8;
 HEAPF64[$ptr + 32 >> 3] = $8;
 HEAPF64[$ptr + 40 >> 3] = $8;
 $13 = $ptr + 84 | 0;
 _memset($ptr + 48 | 0, 0, 32) | 0;
 if ((HEAP32[$13 >> 2] | 0) != 2) {
  HEAP32[$13 >> 2] = 0;
 }
 $19 = $ptr + 80 | 0;
 $20 = HEAP32[$19 >> 2] | 0;
 if (($20 | 0) != 0) {
  _free($20);
  HEAP32[$19 >> 2] = 0;
 }
 $26 = _malloc($5 << 2) | 0;
 HEAP32[$19 >> 2] = $26;
 if (($5 | 0) <= 0) {
  return;
 }
 _memset($26 | 0, 0, ($4 << 2) + 8 | 0) | 0;
 return;
}
function _gsl_matrix_int_set($m, $i, $j, $x) {
 $m = $m | 0;
 $i = $i | 0;
 $j = $j | 0;
 $x = $x | 0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $35 = 0, sp = 0;
 sp = STACKTOP;
 $1 = $m;
 $2 = $i;
 $3 = $j;
 $4 = $x;
 do {
  if ((HEAP32[486] | 0) != 0) {
   if ($2 >>> 0 >= (HEAP32[$1 >> 2] | 0) >>> 0) {
    _gsl_error(11312, 10976, 295, 4);
    STACKTOP = sp;
    return;
   }
   if (!($3 >>> 0 >= (HEAP32[$1 + 4 >> 2] | 0) >>> 0)) {
    break;
   }
   _gsl_error(8440, 10976, 299, 4);
   STACKTOP = sp;
   return;
  }
 } while (0);
 $35 = (Math_imul($2, HEAP32[$1 + 8 >> 2] | 0) | 0) + $3 | 0;
 HEAP32[(HEAP32[$1 + 12 >> 2] | 0) + ($35 << 2) >> 2] = $4;
 STACKTOP = sp;
 return;
}
function _gsl_matrix_set($m, $i, $j, $x) {
 $m = $m | 0;
 $i = $i | 0;
 $j = $j | 0;
 $x = +$x;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0.0, $35 = 0, sp = 0;
 sp = STACKTOP;
 $1 = $m;
 $2 = $i;
 $3 = $j;
 $4 = $x;
 do {
  if ((HEAP32[486] | 0) != 0) {
   if ($2 >>> 0 >= (HEAP32[$1 >> 2] | 0) >>> 0) {
    _gsl_error(11312, 4120, 295, 4);
    STACKTOP = sp;
    return;
   }
   if (!($3 >>> 0 >= (HEAP32[$1 + 4 >> 2] | 0) >>> 0)) {
    break;
   }
   _gsl_error(8440, 4120, 299, 4);
   STACKTOP = sp;
   return;
  }
 } while (0);
 $35 = (Math_imul($2, HEAP32[$1 + 8 >> 2] | 0) | 0) + $3 | 0;
 HEAPF64[(HEAP32[$1 + 12 >> 2] | 0) + ($35 << 3) >> 3] = $4;
 STACKTOP = sp;
 return;
}
function _create_givens715($a, $b, $c, $s) {
 $a = +$a;
 $b = +$b;
 $c = $c | 0;
 $s = $s | 0;
 var $1 = 0.0, $2 = 0.0, $3 = 0, $4 = 0, $t = 0.0, $s1 = 0.0, $t1 = 0.0, $c1 = 0.0, sp = 0;
 sp = STACKTOP;
 $1 = $a;
 $2 = $b;
 $3 = $c;
 $4 = $s;
 if ($2 == 0.0) {
  HEAPF64[$3 >> 3] = 1.0;
  HEAPF64[$4 >> 3] = 0.0;
  STACKTOP = sp;
  return;
 }
 if (+Math_abs(+$2) > +Math_abs(+$1)) {
  $t = (-0.0 - $1) / $2;
  $s1 = 1.0 / +Math_sqrt($t * $t + 1.0);
  HEAPF64[$4 >> 3] = $s1;
  HEAPF64[$3 >> 3] = $s1 * $t;
 } else {
  $t1 = (-0.0 - $2) / $1;
  $c1 = 1.0 / +Math_sqrt($t1 * $t1 + 1.0);
  HEAPF64[$3 >> 3] = $c1;
  HEAPF64[$4 >> 3] = $c1 * $t1;
 }
 STACKTOP = sp;
 return;
}
function _memset(ptr, value, num) {
 ptr = ptr | 0;
 value = value | 0;
 num = num | 0;
 var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
 stop = ptr + num | 0;
 if ((num | 0) >= 20) {
  value = value & 255;
  unaligned = ptr & 3;
  value4 = value | value << 8 | value << 16 | value << 24;
  stop4 = stop & ~3;
  if (unaligned) {
   unaligned = ptr + 4 - unaligned | 0;
   while ((ptr | 0) < (unaligned | 0)) {
    HEAP8[ptr] = value;
    ptr = ptr + 1 | 0;
   }
  }
  while ((ptr | 0) < (stop4 | 0)) {
   HEAP32[ptr >> 2] = value4;
   ptr = ptr + 4 | 0;
  }
 }
 while ((ptr | 0) < (stop | 0)) {
  HEAP8[ptr] = value;
  ptr = ptr + 1 | 0;
 }
 return ptr - num | 0;
}
function _cblas_xerbla($p, $rout, $form, varrp) {
 $p = $p | 0;
 $rout = $rout | 0;
 $form = $form | 0;
 varrp = varrp | 0;
 var $1 = 0, $ap = 0, $5 = 0, tempVarArgs = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16 | 0;
 $ap = sp | 0;
 $1 = $p;
 $5 = $ap | 0;
 HEAP32[$5 >> 2] = varrp;
 HEAP32[$5 + 4 >> 2] = 0;
 if (($1 | 0) != 0) {
  _fprintf(HEAP32[_stderr >> 2] | 0, 5520, (tempVarArgs = STACKTOP, STACKTOP = STACKTOP + 16 | 0, HEAP32[tempVarArgs >> 2] = $1, HEAP32[tempVarArgs + 8 >> 2] = $rout, tempVarArgs) | 0) | 0;
  STACKTOP = tempVarArgs;
 }
 _vfprintf(HEAP32[_stderr >> 2] | 0, $form | 0, $ap | 0) | 0;
 _abort();
 STACKTOP = sp;
 return;
}
function _trailing_eigenvalue714($n, $d, $sd) {
 $n = $n | 0;
 $d = $d | 0;
 $sd = $sd | 0;
 var $1 = 0, $2 = 0, $tb = 0.0, $tab = 0.0, $dt = 0.0, $mu = 0.0, $60 = 0.0, sp = 0;
 sp = STACKTOP;
 $1 = $n;
 $2 = $d;
 $tb = +HEAPF64[$2 + ($1 - 1 << 3) >> 3];
 $tab = +HEAPF64[$sd + ($1 - 2 << 3) >> 3];
 $dt = (+HEAPF64[$2 + ($1 - 2 << 3) >> 3] - $tb) / 2.0;
 if ($dt > 0.0) {
  $mu = $tb - $tab * ($tab / ($dt + +_hypot(+$dt, +$tab)));
  $60 = $mu;
  STACKTOP = sp;
  return +$60;
 }
 if ($dt == 0.0) {
  $mu = $tb - +Math_abs(+$tab);
 } else {
  $mu = $tb + $tab * ($tab / (-0.0 - $dt + +_hypot(+$dt, +$tab)));
 }
 $60 = $mu;
 STACKTOP = sp;
 return +$60;
}
function _arrester_answers_cleanup($ptr) {
 $ptr = $ptr | 0;
 var $16 = 0.0, $22 = 0.0, $23 = 0.0, $30 = 0.0, $31 = 0.0;
 if ((HEAP32[$ptr + 152 >> 2] | 0) != 0) {
  _add_y(HEAP32[$ptr + 164 >> 2] | 0, HEAP32[$ptr + 156 >> 2] | 0, HEAP32[$ptr + 160 >> 2] | 0, -0.0 - +HEAPF64[$ptr + 88 >> 3]);
 }
 $16 = +HEAPF64[$ptr + 64 >> 3];
 if ($16 > +HEAPF64[313]) {
  HEAPF64[313] = $16;
 }
 $22 = +HEAPF64[$ptr + 56 >> 3];
 $23 = +Math_abs(+$22);
 if ($23 > +Math_abs(+(+HEAPF64[326]))) {
  HEAPF64[326] = $22;
 }
 $30 = +HEAPF64[$ptr + 48 >> 3];
 $31 = +Math_abs(+$30);
 if (!($31 > +Math_abs(+(+HEAPF64[329])))) {
  return;
 }
 HEAPF64[329] = $30;
 return;
}
function _read_phase_label() {
 var $at = 0, $2 = 0, $3 = 0, $8 = 0, $10 = 0, $14 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $at = sp | 0;
 _next_int($at) | 0;
 $2 = _rest_of_line() | 0;
 $3 = HEAP32[$at >> 2] | 0;
 if (($3 | 0) < 0 | (HEAP32[3122] | 0) < ($3 | 0)) {
  STACKTOP = sp;
  return 0;
 }
 $8 = HEAP32[2990] | 0;
 $10 = HEAP32[$8 + ($3 << 2) >> 2] | 0;
 if (($10 | 0) == 0) {
  $14 = $8;
 } else {
  _free($10);
  $14 = HEAP32[2990] | 0;
 }
 HEAP32[$14 + ($3 << 2) >> 2] = _malloc((_strlen($2 | 0) | 0) + 1 | 0) | 0;
 _strcpy(HEAP32[(HEAP32[2990] | 0) + ($3 << 2) >> 2] | 0, $2 | 0) | 0;
 STACKTOP = sp;
 return 0;
}
function _read_pole_label() {
 var $at = 0, $2 = 0, $3 = 0, $8 = 0, $10 = 0, $14 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $at = sp | 0;
 _next_int($at) | 0;
 $2 = _rest_of_line() | 0;
 $3 = HEAP32[$at >> 2] | 0;
 if (($3 | 0) < 0 | (HEAP32[3120] | 0) < ($3 | 0)) {
  STACKTOP = sp;
  return 0;
 }
 $8 = HEAP32[2980] | 0;
 $10 = HEAP32[$8 + ($3 << 2) >> 2] | 0;
 if (($10 | 0) == 0) {
  $14 = $8;
 } else {
  _free($10);
  $14 = HEAP32[2980] | 0;
 }
 HEAP32[$14 + ($3 << 2) >> 2] = _malloc((_strlen($2 | 0) | 0) + 1 | 0) | 0;
 _strcpy(HEAP32[(HEAP32[2980] | 0) + ($3 << 2) >> 2] | 0, $2 | 0) | 0;
 STACKTOP = sp;
 return 0;
}
function _add_ammeter($i, $j, $k, $target) {
 $i = $i | 0;
 $j = $j | 0;
 $k = $k | 0;
 $target = $target | 0;
 var $1 = 0, $2 = 0, $21 = 0, $_0 = 0;
 $1 = _malloc(40) | 0;
 $2 = $1;
 if (($1 | 0) != 0) {
  HEAP32[$1 + 24 >> 2] = $target;
  HEAP32[$1 + 28 >> 2] = 1952;
  HEAP32[$1 + 8 >> 2] = $i;
  HEAP32[$1 >> 2] = $j;
  HEAP32[$1 + 4 >> 2] = $k;
  HEAPF64[$1 + 16 >> 3] = 0.0;
  HEAP32[$1 + 32 >> 2] = 0;
  HEAP32[(HEAP32[3156] | 0) + 32 >> 2] = $2;
  HEAP32[3156] = $2;
  $_0 = $2;
  return $_0 | 0;
 }
 $21 = HEAP32[3164] | 0;
 if (($21 | 0) != 0) {
  _fwrite(3e3, 27, 1, $21 | 0) | 0;
 }
 _oe_exit(2);
 $_0 = 0;
 return $_0 | 0;
}
function _FinalizePlotHeader($t, $step) {
 $t = +$t;
 $step = $step | 0;
 var $1 = 0;
 $1 = HEAP32[3206] | 0;
 if (!(($1 | 0) != 0 & (HEAP32[2984] | 0) == 3)) {
  return;
 }
 tempBigInt = 0;
 HEAP16[6013] = tempBigInt;
 HEAP16[6014] = tempBigInt >> 16;
 HEAPF64[tempDoublePtr >> 3] = $t, tempBigInt = HEAP32[tempDoublePtr >> 2] | 0, HEAP16[6019] = tempBigInt, HEAP16[6020] = tempBigInt >> 16, tempBigInt = HEAP32[tempDoublePtr + 4 >> 2] | 0, HEAP16[6021] = tempBigInt, HEAP16[6022] = tempBigInt >> 16;
 HEAP16[6027] = ($step | 0) > 65535 ? -1 : $step & 65535;
 _rewind($1 | 0);
 _fwrite(11984, 496, 1, HEAP32[3206] | 0) | 0;
 return;
}
function _change_line_time_step($ptr) {
 $ptr = $ptr | 0;
 var $2 = 0, $4 = 0, $7 = 0, $8 = 0, $i_011 = 0, $10 = 0, $12 = 0;
 $2 = $ptr + 16 | 0;
 $4 = (HEAP32[2888] | 0) % (HEAP32[$2 >> 2] | 0) | 0;
 if ((HEAP32[3124] | 0) <= 0) {
  HEAP32[$2 >> 2] = 1;
  return;
 }
 $7 = $ptr + 4 | 0;
 $8 = $ptr + 8 | 0;
 $i_011 = 0;
 do {
  $10 = HEAP32[$7 >> 2] | 0;
  _gsl_matrix_set($10, $i_011, 0, +_gsl_matrix_get($10, $i_011, $4));
  $12 = HEAP32[$8 >> 2] | 0;
  _gsl_matrix_set($12, $i_011, 0, +_gsl_matrix_get($12, $i_011, $4));
  $i_011 = $i_011 + 1 | 0;
 } while (($i_011 | 0) < (HEAP32[3124] | 0));
 HEAP32[$2 >> 2] = 1;
 return;
}
function _next_token() {
 var $1 = 0, $4 = 0, $6 = 0, $i_04 = 0, $11 = 0, $14 = 0, $_pre6 = 0, $16 = 0;
 $1 = _strtok(0, 752) | 0;
 HEAP32[2880] = $1;
 if (($1 | 0) == 0) {
  $16 = 0;
  return $16 | 0;
 }
 $4 = _strlen($1 | 0) | 0;
 if (($4 | 0) > 0) {
  $i_04 = 0;
  $6 = $1;
 } else {
  $16 = $1;
  return $16 | 0;
 }
 while (1) {
  $11 = (_tolower(HEAP8[$6 + $i_04 | 0] | 0) | 0) & 255;
  HEAP8[(HEAP32[2880] | 0) + $i_04 | 0] = $11;
  $14 = $i_04 + 1 | 0;
  $_pre6 = HEAP32[2880] | 0;
  if (($14 | 0) < ($4 | 0)) {
   $i_04 = $14;
   $6 = $_pre6;
  } else {
   $16 = $_pre6;
   break;
  }
 }
 return $16 | 0;
}
function _init_capacitor_history($ptr) {
 $ptr = $ptr | 0;
 var $2 = 0, $4 = 0, $7 = 0, $vdc_0 = 0.0, $vdc_1 = 0.0;
 $2 = HEAP32[$ptr + 24 >> 2] | 0;
 $4 = HEAP32[$ptr + 28 >> 2] | 0;
 $7 = _find_pole_defn(HEAP32[$ptr + 32 >> 2] | 0) | 0;
 if (($2 | 0) == 0) {
  $vdc_0 = 0.0;
 } else {
  $vdc_0 = +_gsl_vector_get(HEAP32[$7 + 36 >> 2] | 0, $2 - 1 | 0) + 0.0;
 }
 if (($4 | 0) == 0) {
  $vdc_1 = $vdc_0;
 } else {
  $vdc_1 = $vdc_0 - +_gsl_vector_get(HEAP32[$7 + 36 >> 2] | 0, $4 - 1 | 0);
 }
 if (!($vdc_1 != 0.0)) {
  return;
 }
 HEAPF64[$ptr + 16 >> 3] = +HEAPF64[$ptr >> 3] * (-0.0 - $vdc_1);
 return;
}
function _change_arrbez_time_step($ptr) {
 $ptr = $ptr | 0;
 var $1 = 0, $2 = 0.0, $4 = 0.0, $5 = 0, $8 = 0.0, $12 = 0.0, $16 = 0, $18 = 0.0;
 $1 = $ptr + 120 | 0;
 $2 = +HEAPF64[$1 >> 3];
 $4 = +HEAPF64[$ptr + 128 >> 3];
 $5 = $ptr + 112 | 0;
 $8 = $2 * ($4 - +HEAPF64[$5 >> 3]);
 $12 = $2 * (+HEAPF64[300] / +HEAPF64[96]);
 HEAPF64[$1 >> 3] = $12;
 $16 = $ptr + 96 | 0;
 $18 = +HEAPF64[96] / +HEAPF64[300] * +HEAPF64[$16 >> 3];
 HEAPF64[$16 >> 3] = $18;
 HEAPF64[$ptr + 104 >> 3] = $12 + +HEAPF64[$ptr + 72 >> 3] + 1.0 / +HEAPF64[$ptr + 88 >> 3];
 HEAPF64[$5 >> 3] = $4 - $8 * $18 * .5;
 return;
}
function _gsl_matrix_set_identity($m) {
 $m = $m | 0;
 var $1 = 0, $i = 0, $j = 0, $data = 0, $p = 0, $q = 0, $tda = 0, sp = 0;
 sp = STACKTOP;
 $1 = $m;
 $data = HEAP32[$1 + 12 >> 2] | 0;
 $p = HEAP32[$1 >> 2] | 0;
 $q = HEAP32[$1 + 4 >> 2] | 0;
 $tda = HEAP32[$1 + 8 >> 2] | 0;
 $i = 0;
 while (1) {
  if (!($i >>> 0 < $p >>> 0)) {
   break;
  }
  $j = 0;
  while (1) {
   if (!($j >>> 0 < $q >>> 0)) {
    break;
   }
   HEAPF64[$data + ((Math_imul($i, $tda) | 0) + $j << 3) >> 3] = ($i | 0) == ($j | 0) ? 1.0 : 0.0;
   $j = $j + 1 | 0;
  }
  $i = $i + 1 | 0;
 }
 STACKTOP = sp;
 return;
}
function _chop_small_elements710($N, $d, $sd) {
 $N = $N | 0;
 $d = $d | 0;
 $sd = $sd | 0;
 var $1 = 0, $2 = 0, $3 = 0, $d_i = 0.0, $i = 0, $d_ip1 = 0.0, sp = 0;
 sp = STACKTOP;
 $1 = $N;
 $2 = $d;
 $3 = $sd;
 $d_i = +HEAPF64[$2 >> 3];
 $i = 0;
 while (1) {
  if (!($i >>> 0 < ($1 - 1 | 0) >>> 0)) {
   break;
  }
  $d_ip1 = +HEAPF64[$2 + ($i + 1 << 3) >> 3];
  if (+Math_abs(+(+HEAPF64[$3 + ($i << 3) >> 3])) < (+Math_abs(+$d_i) + +Math_abs(+$d_ip1)) * 2.220446049250313e-16) {
   HEAPF64[$3 + ($i << 3) >> 3] = 0.0;
  }
  $d_i = $d_ip1;
  $i = $i + 1 | 0;
 }
 STACKTOP = sp;
 return;
}
function _gsl_root_fsolver_alloc($T) {
 $T = $T | 0;
 var $1 = 0, $2 = 0, $s = 0, $34 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $T;
 $s = _malloc(40) | 0;
 if (($s | 0) == 0) {
  _gsl_error(10392, 10832, 34, 8);
  $1 = 0;
  $34 = $1;
  STACKTOP = sp;
  return $34 | 0;
 }
 HEAP32[$s + 32 >> 2] = _malloc(HEAP32[$2 + 4 >> 2] | 0) | 0;
 if ((HEAP32[$s + 32 >> 2] | 0) != 0) {
  HEAP32[$s >> 2] = $2;
  HEAP32[$s + 4 >> 2] = 0;
  $1 = $s;
  $34 = $1;
  STACKTOP = sp;
  return $34 | 0;
 }
 _free($s);
 _gsl_error(8112, 10832, 44, 8);
 $1 = 0;
 $34 = $1;
 STACKTOP = sp;
 return $34 | 0;
}
function _gsl_permutation_alloc($n) {
 $n = $n | 0;
 var $1 = 0, $2 = 0, $p = 0, sp = 0;
 sp = STACKTOP;
 $2 = $n;
 do {
  if (($2 | 0) == 0) {
   _gsl_error(10752, 10936, 33, 1);
   $1 = 0;
  } else {
   $p = _malloc(8) | 0;
   if (($p | 0) == 0) {
    _gsl_error(8232, 10936, 41, 8);
    $1 = 0;
    break;
   }
   HEAP32[$p + 4 >> 2] = _malloc($2 << 2) | 0;
   if ((HEAP32[$p + 4 >> 2] | 0) != 0) {
    HEAP32[$p >> 2] = $2;
    $1 = $p;
    break;
   }
   _free($p);
   _gsl_error(6656, 10936, 51, 8);
   $1 = 0;
  }
 } while (0);
 STACKTOP = sp;
 return $1 | 0;
}
function _gsl_block_int_alloc($n) {
 $n = $n | 0;
 var $1 = 0, $2 = 0, $b = 0, sp = 0;
 sp = STACKTOP;
 $2 = $n;
 do {
  if (($2 | 0) == 0) {
   _gsl_error(8832, 10376, 28, 4);
   $1 = 0;
  } else {
   $b = _malloc(8) | 0;
   if (($b | 0) == 0) {
    _gsl_error(7840, 10376, 36, 8);
    $1 = 0;
    break;
   }
   HEAP32[$b + 4 >> 2] = _malloc($2 << 2) | 0;
   if ((HEAP32[$b + 4 >> 2] | 0) != 0) {
    HEAP32[$b >> 2] = $2;
    $1 = $b;
    break;
   }
   _free($b);
   _gsl_error(6288, 10376, 46, 8);
   $1 = 0;
  }
 } while (0);
 STACKTOP = sp;
 return $1 | 0;
}
function _gsl_block_alloc($n) {
 $n = $n | 0;
 var $1 = 0, $2 = 0, $b = 0, sp = 0;
 sp = STACKTOP;
 $2 = $n;
 do {
  if (($2 | 0) == 0) {
   _gsl_error(8832, 10376, 28, 4);
   $1 = 0;
  } else {
   $b = _malloc(8) | 0;
   if (($b | 0) == 0) {
    _gsl_error(7840, 10376, 36, 8);
    $1 = 0;
    break;
   }
   HEAP32[$b + 4 >> 2] = _malloc($2 << 3) | 0;
   if ((HEAP32[$b + 4 >> 2] | 0) != 0) {
    HEAP32[$b >> 2] = $2;
    $1 = $b;
    break;
   }
   _free($b);
   _gsl_error(6288, 10376, 46, 8);
   $1 = 0;
  }
 } while (0);
 STACKTOP = sp;
 return $1 | 0;
}
function _gsl_matrix_int_set_zero($m) {
 $m = $m | 0;
 var $1 = 0, $i = 0, $j = 0, $data = 0, $p = 0, $q = 0, $tda = 0, sp = 0;
 sp = STACKTOP;
 $1 = $m;
 $data = HEAP32[$1 + 12 >> 2] | 0;
 $p = HEAP32[$1 >> 2] | 0;
 $q = HEAP32[$1 + 4 >> 2] | 0;
 $tda = HEAP32[$1 + 8 >> 2] | 0;
 $i = 0;
 while (1) {
  if (!($i >>> 0 < $p >>> 0)) {
   break;
  }
  $j = 0;
  while (1) {
   if (!($j >>> 0 < $q >>> 0)) {
    break;
   }
   HEAP32[$data + ((Math_imul($i, $tda) | 0) + $j << 2) >> 2] = 0;
   $j = $j + 1 | 0;
  }
  $i = $i + 1 | 0;
 }
 STACKTOP = sp;
 return;
}
function _connect_lines() {
 var $2 = 0, $6 = 0.0, $9 = 0, $17 = 0, $left_pole_05 = 0, $18 = 0;
 $2 = HEAP32[2896] | 0;
 $6 = +HEAPF64[323];
 $9 = ~~(+HEAPF64[45] / +HEAPF64[$2 + 40 >> 3] / $6 + .5);
 if ((HEAP32[2872] | 0) != 0) {
  HEAPF64[96] = $6 * +($9 | 0);
 }
 if ((HEAP32[3120] | 0) > 1) {
  $left_pole_05 = 1;
  $17 = $2;
 } else {
  return;
 }
 while (1) {
  $18 = $left_pole_05 + 1 | 0;
  _insert_line($left_pole_05, $18, $17, $9);
  if (($18 | 0) >= (HEAP32[3120] | 0)) {
   break;
  }
  $left_pole_05 = $18;
  $17 = HEAP32[2896] | 0;
 }
 return;
}
function _gsl_matrix_set_zero($m) {
 $m = $m | 0;
 var $1 = 0, $i = 0, $j = 0, $data = 0, $p = 0, $q = 0, $tda = 0, sp = 0;
 sp = STACKTOP;
 $1 = $m;
 $data = HEAP32[$1 + 12 >> 2] | 0;
 $p = HEAP32[$1 >> 2] | 0;
 $q = HEAP32[$1 + 4 >> 2] | 0;
 $tda = HEAP32[$1 + 8 >> 2] | 0;
 $i = 0;
 while (1) {
  if (!($i >>> 0 < $p >>> 0)) {
   break;
  }
  $j = 0;
  while (1) {
   if (!($j >>> 0 < $q >>> 0)) {
    break;
   }
   HEAPF64[$data + ((Math_imul($i, $tda) | 0) + $j << 3) >> 3] = 0.0;
   $j = $j + 1 | 0;
  }
  $i = $i + 1 | 0;
 }
 STACKTOP = sp;
 return;
}
function _gsl_blas_ddot($X, $Y, $result) {
 $X = $X | 0;
 $Y = $Y | 0;
 $result = $result | 0;
 var $1 = 0, $2 = 0, $3 = 0, $34 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $X;
 $3 = $Y;
 if ((HEAP32[$2 >> 2] | 0) == (HEAP32[$3 >> 2] | 0)) {
  HEAPF64[$result >> 3] = +_cblas_ddot(HEAP32[$2 >> 2] | 0, HEAP32[$2 + 8 >> 2] | 0, HEAP32[$2 + 4 >> 2] | 0, HEAP32[$3 + 8 >> 2] | 0, HEAP32[$3 + 4 >> 2] | 0);
  $1 = 0;
  $34 = $1;
  STACKTOP = sp;
  return $34 | 0;
 }
 _gsl_error(4224, 9144, 107, 19);
 $1 = 19;
 $34 = $1;
 STACKTOP = sp;
 return $34 | 0;
}
function _restore_ground_time_step($ptr) {
 $ptr = $ptr | 0;
 var $1 = 0, $2 = 0.0, $6 = 0, $8 = 0.0, $10 = 0.0, $12 = 0.0;
 $1 = $ptr + 32 | 0;
 $2 = +HEAPF64[$1 >> 3];
 $6 = $ptr + 80 | 0;
 $8 = +HEAPF64[96] / +HEAPF64[300] * +HEAPF64[$6 >> 3];
 HEAPF64[$6 >> 3] = $8;
 $10 = +HEAPF64[$ptr >> 3];
 $12 = 1.0 / ($10 + $8);
 HEAPF64[$1 >> 3] = $12;
 HEAPF64[$ptr + 72 >> 3] = $12 * $10;
 HEAPF64[$ptr + 88 >> 3] = $12 * $8;
 _add_y(HEAP32[$ptr + 104 >> 2] | 0, HEAP32[$ptr + 96 >> 2] | 0, HEAP32[$ptr + 100 >> 2] | 0, $12 - $2);
 return;
}
function _reset_lines() {
 var $storemerge1_i = 0, $storemerge2_i = 0;
 $storemerge1_i = HEAP32[2896] | 0;
 HEAP32[2894] = $storemerge1_i;
 if (($storemerge1_i | 0) == 0) {
  return;
 } else {
  $storemerge2_i = $storemerge1_i;
 }
 do {
  _gsl_blas_dgemv(111, 1.0, HEAP32[$storemerge2_i + 28 >> 2] | 0, HEAP32[$storemerge2_i + 36 >> 2] | 0, 0.0, HEAP32[$storemerge2_i + 32 >> 2] | 0) | 0;
  $storemerge2_i = HEAP32[(HEAP32[2894] | 0) + 52 >> 2] | 0;
  HEAP32[2894] = $storemerge2_i;
 } while (($storemerge2_i | 0) != 0);
 return;
}
function ___muldi3($a$0, $a$1, $b$0, $b$1) {
 $a$0 = $a$0 | 0;
 $a$1 = $a$1 | 0;
 $b$0 = $b$0 | 0;
 $b$1 = $b$1 | 0;
 var $x_sroa_0_0_extract_trunc = 0, $y_sroa_0_0_extract_trunc = 0, $1$0 = 0, $1$1 = 0;
 $x_sroa_0_0_extract_trunc = $a$0;
 $y_sroa_0_0_extract_trunc = $b$0;
 $1$0 = ___muldsi3($x_sroa_0_0_extract_trunc, $y_sroa_0_0_extract_trunc) | 0;
 $1$1 = tempRet0;
 return (tempRet0 = (Math_imul($a$1, $y_sroa_0_0_extract_trunc) | 0) + (Math_imul($b$1, $x_sroa_0_0_extract_trunc) | 0) + $1$1 | $1$1 & 0, $1$0 | 0 | 0) | 0;
}
function _singular867($LU) {
 $LU = $LU | 0;
 var $1 = 0, $2 = 0, $i = 0, $n = 0, $24 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $2 = $LU;
 $n = HEAP32[$2 >> 2] | 0;
 $i = 0;
 while (1) {
  if (!($i >>> 0 < $n >>> 0)) {
   label = 7;
   break;
  }
  if (+_gsl_matrix_get($2, $i, $i) == 0.0) {
   label = 4;
   break;
  }
  $i = $i + 1 | 0;
 }
 if ((label | 0) == 4) {
  $1 = 1;
  $24 = $1;
  STACKTOP = sp;
  return $24 | 0;
 } else if ((label | 0) == 7) {
  $1 = 0;
  $24 = $1;
  STACKTOP = sp;
  return $24 | 0;
 }
 return 0;
}
function _gsl_matrix_int_calloc($n1, $n2) {
 $n1 = $n1 | 0;
 $n2 = $n2 | 0;
 var $1 = 0, $2 = 0, $3 = 0, $i = 0, $m = 0, $30 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $n1;
 $3 = $n2;
 $m = _gsl_matrix_int_alloc($2, $3) | 0;
 if (($m | 0) == 0) {
  $1 = 0;
  $30 = $1;
  STACKTOP = sp;
  return $30 | 0;
 }
 $i = 0;
 while (1) {
  if (!($i >>> 0 < (Math_imul($2, $3) | 0) >>> 0)) {
   break;
  }
  HEAP32[(HEAP32[$m + 12 >> 2] | 0) + ($i << 2) >> 2] = 0;
  $i = $i + 1 | 0;
 }
 $1 = $m;
 $30 = $1;
 STACKTOP = sp;
 return $30 | 0;
}
function _cblas_dscal($N, $alpha, $X, $incX) {
 $N = $N | 0;
 $alpha = +$alpha;
 $X = $X | 0;
 $incX = $incX | 0;
 var $1 = 0, $2 = 0.0, $3 = 0, $4 = 0, $i = 0, $ix = 0, $17 = 0, sp = 0;
 sp = STACKTOP;
 $1 = $N;
 $2 = $alpha;
 $3 = $X;
 $4 = $incX;
 $ix = 0;
 if (($4 | 0) <= 0) {
  STACKTOP = sp;
  return;
 }
 $i = 0;
 while (1) {
  if (($i | 0) >= ($1 | 0)) {
   break;
  }
  $17 = $3 + ($ix << 3) | 0;
  HEAPF64[$17 >> 3] = +HEAPF64[$17 >> 3] * $2;
  $ix = $ix + $4 | 0;
  $i = $i + 1 | 0;
 }
 STACKTOP = sp;
 return;
}
function _gsl_blas_daxpy($alpha, $X, $Y) {
 $alpha = +$alpha;
 $X = $X | 0;
 $Y = $Y | 0;
 var $1 = 0, $3 = 0, $4 = 0, $33 = 0, sp = 0;
 sp = STACKTOP;
 $3 = $X;
 $4 = $Y;
 if ((HEAP32[$3 >> 2] | 0) == (HEAP32[$4 >> 2] | 0)) {
  _cblas_daxpy(HEAP32[$3 >> 2] | 0, $alpha, HEAP32[$3 + 8 >> 2] | 0, HEAP32[$3 + 4 >> 2] | 0, HEAP32[$4 + 8 >> 2] | 0, HEAP32[$4 + 4 >> 2] | 0);
  $1 = 0;
  $33 = $1;
  STACKTOP = sp;
  return $33 | 0;
 }
 _gsl_error(4224, 9144, 413, 19);
 $1 = 19;
 $33 = $1;
 STACKTOP = sp;
 return $33 | 0;
}
function _gsl_matrix_calloc($n1, $n2) {
 $n1 = $n1 | 0;
 $n2 = $n2 | 0;
 var $1 = 0, $2 = 0, $3 = 0, $i = 0, $m = 0, $30 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $n1;
 $3 = $n2;
 $m = _gsl_matrix_alloc($2, $3) | 0;
 if (($m | 0) == 0) {
  $1 = 0;
  $30 = $1;
  STACKTOP = sp;
  return $30 | 0;
 }
 $i = 0;
 while (1) {
  if (!($i >>> 0 < (Math_imul($2, $3) | 0) >>> 0)) {
   break;
  }
  HEAPF64[(HEAP32[$m + 12 >> 2] | 0) + ($i << 3) >> 3] = 0.0;
  $i = $i + 1 | 0;
 }
 $1 = $m;
 $30 = $1;
 STACKTOP = sp;
 return $30 | 0;
}
function _find_pole_defn($ptr) {
 $ptr = $ptr | 0;
 var $ln_0 = 0, $_0_in = 0;
 L1 : do {
  if ((HEAP32[2874] | 0) == 0) {
   $_0_in = 11584;
  } else {
   $ln_0 = HEAP32[3168] | 0;
   do {
    $ln_0 = HEAP32[$ln_0 + 28 >> 2] | 0;
    if (($ln_0 | 0) == 0) {
     $_0_in = 11584;
     break L1;
    }
    if ((HEAP32[$ln_0 + 20 >> 2] | 0) == ($ptr | 0)) {
     break;
    }
   } while ((HEAP32[$ln_0 + 24 >> 2] | 0) != ($ptr | 0));
   $_0_in = $ln_0 | 0;
  }
 } while (0);
 return HEAP32[$_0_in >> 2] | 0;
}
function _gsl_vector_int_get($v, $i) {
 $v = $v | 0;
 $i = $i | 0;
 var $1 = 0, $2 = 0, $3 = 0, $20 = 0, $27 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $v;
 $3 = $i;
 if ((HEAP32[486] | 0) != 0) {
  if ($3 >>> 0 >= (HEAP32[$2 >> 2] | 0) >>> 0) {
   _gsl_error(9904, 11288, 180, 4);
   $1 = 0;
   $27 = $1;
   STACKTOP = sp;
   return $27 | 0;
  }
 }
 $20 = Math_imul($3, HEAP32[$2 + 4 >> 2] | 0) | 0;
 $1 = HEAP32[(HEAP32[$2 + 8 >> 2] | 0) + ($20 << 2) >> 2] | 0;
 $27 = $1;
 STACKTOP = sp;
 return $27 | 0;
}
function _inject_steepfront($ptr) {
 $ptr = $ptr | 0;
 var $4 = 0, $8 = 0.0, $13 = 0.0, $15 = 0, $19 = 0;
 $4 = HEAP32[(HEAP32[$ptr + 60 >> 2] | 0) + 24 >> 2] | 0;
 $8 = +HEAPF64[4] - +HEAPF64[$ptr + 24 >> 3];
 if (!($8 > 0.0)) {
  return;
 }
 $13 = +_bez_eval(HEAP32[$ptr + 48 >> 2] | 0, $8);
 $15 = HEAP32[$ptr + 52 >> 2] | 0;
 _gsl_vector_set($4, $15, $13 + +_gsl_vector_get($4, $15));
 $19 = HEAP32[$ptr + 56 >> 2] | 0;
 _gsl_vector_set($4, $19, +_gsl_vector_get($4, $19) - $13);
 return;
}
function _gsl_vector_get($v, $i) {
 $v = $v | 0;
 $i = $i | 0;
 var $1 = 0.0, $2 = 0, $3 = 0, $20 = 0, $27 = 0.0, sp = 0;
 sp = STACKTOP;
 $2 = $v;
 $3 = $i;
 if ((HEAP32[486] | 0) != 0) {
  if ($3 >>> 0 >= (HEAP32[$2 >> 2] | 0) >>> 0) {
   _gsl_error(9904, 6408, 180, 4);
   $1 = 0.0;
   $27 = $1;
   STACKTOP = sp;
   return +$27;
  }
 }
 $20 = Math_imul($3, HEAP32[$2 + 4 >> 2] | 0) | 0;
 $1 = +HEAPF64[(HEAP32[$2 + 8 >> 2] | 0) + ($20 << 3) >> 3];
 $27 = $1;
 STACKTOP = sp;
 return +$27;
}
function _init_parser($sn) {
 $sn = $sn | 0;
 var $1 = 0, $3 = 0, $9 = 0, $10 = 0, label = 0;
 HEAP32[2974] = $sn;
 $1 = HEAP8[$sn] | 0;
 if ($1 << 24 >> 24 == 0) {
  return;
 } else {
  $3 = $1;
 }
 while (1) {
  if ((_isspace($3 << 24 >> 24 | 0) | 0) == 0) {
   label = 4;
   break;
  }
  $9 = (HEAP32[2974] | 0) + 1 | 0;
  HEAP32[2974] = $9;
  $10 = HEAP8[$9] | 0;
  if ($10 << 24 >> 24 == 0) {
   label = 4;
   break;
  } else {
   $3 = $10;
  }
 }
 if ((label | 0) == 4) {
  return;
 }
}
function _restore_inductor_time_step($ptr) {
 $ptr = $ptr | 0;
 var $1 = 0, $2 = 0.0, $4 = 0.0, $11 = 0.0;
 $1 = $ptr | 0;
 $2 = +HEAPF64[$1 >> 3];
 $4 = +HEAPF64[$ptr + 40 >> 3];
 $11 = 1.0 / ($4 + +HEAPF64[$ptr + 32 >> 3] * 2.0 / +HEAPF64[323]);
 HEAPF64[$1 >> 3] = $11;
 HEAPF64[$ptr + 8 >> 3] = $11 * 2.0 * (1.0 - $11 * $4);
 HEAPF64[$ptr + 16 >> 3] = 1.0 - $4 * 2.0 * $11;
 _add_y(HEAP32[$ptr + 56 >> 2] | 0, HEAP32[$ptr + 48 >> 2] | 0, HEAP32[$ptr + 52 >> 2] | 0, $11 - $2);
 return;
}
function _build_bezier($xpts, $ypts, $npts, $use_linear) {
 $xpts = $xpts | 0;
 $ypts = $ypts | 0;
 $npts = $npts | 0;
 $use_linear = $use_linear | 0;
 var $1 = 0, $2 = 0, $5 = 0;
 $1 = _malloc(40) | 0;
 $2 = $1;
 HEAP32[$1 >> 2] = $npts;
 $5 = ($npts * 3 | 0) - 2 | 0;
 HEAP32[$1 + 4 >> 2] = $5;
 HEAP32[$1 + 24 >> 2] = _malloc($npts << 3) | 0;
 HEAP32[$1 + 28 >> 2] = _malloc($5 << 3) | 0;
 HEAP32[$1 + 32 >> 2] = 0;
 _fill_bezier($2, $xpts, $ypts, $use_linear);
 return $2 | 0;
}
function ___uflow($f) {
 $f = $f | 0;
 var $c = 0, $_0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $c = sp | 0;
 if ((HEAP32[$f + 8 >> 2] | 0) == 0) {
  if ((___toread($f) | 0) == 0) {
   label = 3;
  } else {
   $_0 = -1;
  }
 } else {
  label = 3;
 }
 if ((label | 0) == 3) {
  if ((FUNCTION_TABLE_iiii[HEAP32[$f + 32 >> 2] & 1]($f, $c, 1) | 0) == 1) {
   $_0 = HEAPU8[$c] | 0;
  } else {
   $_0 = -1;
  }
 }
 STACKTOP = sp;
 return $_0 | 0;
}
function _gsl_permute_vector($p, $v) {
 $p = $p | 0;
 $v = $v | 0;
 var $1 = 0, $2 = 0, $3 = 0, $29 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $p;
 $3 = $v;
 if ((HEAP32[$3 >> 2] | 0) == (HEAP32[$2 >> 2] | 0)) {
  _gsl_permute(HEAP32[$2 + 4 >> 2] | 0, HEAP32[$3 + 8 >> 2] | 0, HEAP32[$3 + 4 >> 2] | 0, HEAP32[$3 >> 2] | 0) | 0;
  $1 = 0;
  $29 = $1;
  STACKTOP = sp;
  return $29 | 0;
 }
 _gsl_error(10544, 10896, 144, 19);
 $1 = 19;
 $29 = $1;
 STACKTOP = sp;
 return $29 | 0;
}
function _inject_capacitor_history($ptr) {
 $ptr = $ptr | 0;
 var $4 = 0, $5 = 0, $6 = 0.0, $9 = 0, $12 = 0.0, $15 = 0;
 $4 = HEAP32[(HEAP32[$ptr + 32 >> 2] | 0) + 24 >> 2] | 0;
 $5 = $ptr + 16 | 0;
 $6 = +HEAPF64[$5 >> 3];
 $9 = _gsl_vector_ptr($4, HEAP32[$ptr + 24 >> 2] | 0) | 0;
 HEAPF64[$9 >> 3] = +HEAPF64[$9 >> 3] - $6;
 $12 = +HEAPF64[$5 >> 3];
 $15 = _gsl_vector_ptr($4, HEAP32[$ptr + 28 >> 2] | 0) | 0;
 HEAPF64[$15 >> 3] = $12 + +HEAPF64[$15 >> 3];
 return;
}
function _inject_inductor_history($ptr) {
 $ptr = $ptr | 0;
 var $4 = 0, $5 = 0, $6 = 0.0, $9 = 0, $12 = 0.0, $15 = 0;
 $4 = HEAP32[(HEAP32[$ptr + 56 >> 2] | 0) + 24 >> 2] | 0;
 $5 = $ptr + 24 | 0;
 $6 = +HEAPF64[$5 >> 3];
 $9 = _gsl_vector_ptr($4, HEAP32[$ptr + 48 >> 2] | 0) | 0;
 HEAPF64[$9 >> 3] = +HEAPF64[$9 >> 3] - $6;
 $12 = +HEAPF64[$5 >> 3];
 $15 = _gsl_vector_ptr($4, HEAP32[$ptr + 52 >> 2] | 0) | 0;
 HEAPF64[$15 >> 3] = $12 + +HEAPF64[$15 >> 3];
 return;
}
function _inject_arrester($ptr) {
 $ptr = $ptr | 0;
 var $8 = 0, $10 = 0.0, $13 = 0, $18 = 0;
 if ((HEAP32[$ptr + 152 >> 2] | 0) == 0) {
  return;
 }
 $8 = HEAP32[(HEAP32[$ptr + 164 >> 2] | 0) + 24 >> 2] | 0;
 $10 = +HEAPF64[$ptr + 112 >> 3];
 $13 = _gsl_vector_ptr($8, HEAP32[$ptr + 156 >> 2] | 0) | 0;
 HEAPF64[$13 >> 3] = +HEAPF64[$13 >> 3] - $10;
 $18 = _gsl_vector_ptr($8, HEAP32[$ptr + 160 >> 2] | 0) | 0;
 HEAPF64[$18 >> 3] = $10 + +HEAPF64[$18 >> 3];
 return;
}
function _find_pole($location) {
 $location = $location | 0;
 var $1 = 0, $3 = 0, $5 = 0, $_0 = 0, label = 0;
 $1 = HEAP32[2982] | 0;
 HEAP32[2978] = $1;
 $3 = $1;
 while (1) {
  $5 = HEAP32[$3 + 76 >> 2] | 0;
  HEAP32[2978] = $5;
  if (($5 | 0) == 0) {
   $_0 = 0;
   label = 4;
   break;
  }
  if ((HEAP32[$5 >> 2] | 0) == ($location | 0)) {
   $_0 = $5;
   label = 4;
   break;
  } else {
   $3 = $5;
  }
 }
 if ((label | 0) == 4) {
  return $_0 | 0;
 }
 return 0;
}
function _gsl_vector_int_set($v, $i, $x) {
 $v = $v | 0;
 $i = $i | 0;
 $x = $x | 0;
 var $1 = 0, $2 = 0, $3 = 0, $21 = 0, sp = 0;
 sp = STACKTOP;
 $1 = $v;
 $2 = $i;
 $3 = $x;
 if ((HEAP32[486] | 0) != 0) {
  if ($2 >>> 0 >= (HEAP32[$1 >> 2] | 0) >>> 0) {
   _gsl_error(9904, 11288, 193, 4);
   STACKTOP = sp;
   return;
  }
 }
 $21 = Math_imul($2, HEAP32[$1 + 4 >> 2] | 0) | 0;
 HEAP32[(HEAP32[$1 + 8 >> 2] | 0) + ($21 << 2) >> 2] = $3;
 STACKTOP = sp;
 return;
}
function _gsl_vector_ptr($v, $i) {
 $v = $v | 0;
 $i = $i | 0;
 var $1 = 0, $2 = 0, $3 = 0, $26 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $v;
 $3 = $i;
 if ((HEAP32[486] | 0) != 0) {
  if ($3 >>> 0 >= (HEAP32[$2 >> 2] | 0) >>> 0) {
   _gsl_error(9904, 6408, 206, 4);
   $1 = 0;
   $26 = $1;
   STACKTOP = sp;
   return $26 | 0;
  }
 }
 $1 = (HEAP32[$2 + 8 >> 2] | 0) + ((Math_imul($3, HEAP32[$2 + 4 >> 2] | 0) | 0) << 3) | 0;
 $26 = $1;
 STACKTOP = sp;
 return $26 | 0;
}
function _arrbez_answers_cleanup($ptr) {
 $ptr = $ptr | 0;
 var $2 = 0.0, $8 = 0.0, $9 = 0.0, $16 = 0.0, $17 = 0.0;
 $2 = +HEAPF64[$ptr + 48 >> 3];
 if ($2 > +HEAPF64[313]) {
  HEAPF64[313] = $2;
 }
 $8 = +HEAPF64[$ptr + 40 >> 3];
 $9 = +Math_abs(+$8);
 if ($9 > +Math_abs(+(+HEAPF64[326]))) {
  HEAPF64[326] = $8;
 }
 $16 = +HEAPF64[$ptr + 32 >> 3];
 $17 = +Math_abs(+$16);
 if (!($17 > +Math_abs(+(+HEAPF64[329])))) {
  return;
 }
 HEAPF64[329] = $16;
 return;
}
function _gsl_vector_set($v, $i, $x) {
 $v = $v | 0;
 $i = $i | 0;
 $x = +$x;
 var $1 = 0, $2 = 0, $3 = 0.0, $21 = 0, sp = 0;
 sp = STACKTOP;
 $1 = $v;
 $2 = $i;
 $3 = $x;
 if ((HEAP32[486] | 0) != 0) {
  if ($2 >>> 0 >= (HEAP32[$1 >> 2] | 0) >>> 0) {
   _gsl_error(9904, 6408, 193, 4);
   STACKTOP = sp;
   return;
  }
 }
 $21 = Math_imul($2, HEAP32[$1 + 4 >> 2] | 0) | 0;
 HEAPF64[(HEAP32[$1 + 8 >> 2] | 0) + ($21 << 3) >> 3] = $3;
 STACKTOP = sp;
 return;
}
function _gsl_vector_int_calloc($n) {
 $n = $n | 0;
 var $1 = 0, $2 = 0, $i = 0, $v = 0, $26 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $n;
 $v = _gsl_vector_int_alloc($2) | 0;
 if (($v | 0) == 0) {
  $1 = 0;
  $26 = $1;
  STACKTOP = sp;
  return $26 | 0;
 }
 $i = 0;
 while (1) {
  if (!($i >>> 0 < $2 >>> 0)) {
   break;
  }
  HEAP32[(HEAP32[$v + 8 >> 2] | 0) + ($i << 2) >> 2] = 0;
  $i = $i + 1 | 0;
 }
 $1 = $v;
 $26 = $1;
 STACKTOP = sp;
 return $26 | 0;
}
function _change_capacitor_time_step($ptr) {
 $ptr = $ptr | 0;
 var $1 = 0, $2 = 0.0, $6 = 0.0, $19 = 0;
 $1 = $ptr | 0;
 $2 = +HEAPF64[$1 >> 3];
 $6 = $2 * (+HEAPF64[300] / +HEAPF64[96]);
 HEAPF64[$1 >> 3] = $6;
 HEAPF64[$ptr + 8 >> 3] = $6 + $6;
 _add_y(HEAP32[$ptr + 32 >> 2] | 0, HEAP32[$ptr + 24 >> 2] | 0, HEAP32[$ptr + 28 >> 2] | 0, $6 - $2);
 $19 = $ptr + 16 | 0;
 HEAPF64[$19 >> 3] = +HEAPF64[300] / +HEAPF64[96] * +HEAPF64[$19 >> 3];
 return;
}
function ___memrchr($m, $c, $n) {
 $m = $m | 0;
 $c = $c | 0;
 $n = $n | 0;
 var $1 = 0, $_08 = 0, $3 = 0, $6 = 0, $_0 = 0, label = 0;
 $1 = $c & 255;
 $_08 = $n;
 while (1) {
  $3 = $_08 - 1 | 0;
  if (($_08 | 0) == 0) {
   $_0 = 0;
   label = 4;
   break;
  }
  $6 = $m + $3 | 0;
  if ((HEAP8[$6] | 0) == $1 << 24 >> 24) {
   $_0 = $6;
   label = 4;
   break;
  } else {
   $_08 = $3;
  }
 }
 if ((label | 0) == 4) {
  return $_0 | 0;
 }
 return 0;
}
function _gsl_vector_calloc($n) {
 $n = $n | 0;
 var $1 = 0, $2 = 0, $i = 0, $v = 0, $26 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $n;
 $v = _gsl_vector_alloc($2) | 0;
 if (($v | 0) == 0) {
  $1 = 0;
  $26 = $1;
  STACKTOP = sp;
  return $26 | 0;
 }
 $i = 0;
 while (1) {
  if (!($i >>> 0 < $2 >>> 0)) {
   break;
  }
  HEAPF64[(HEAP32[$v + 8 >> 2] | 0) + ($i << 3) >> 3] = 0.0;
  $i = $i + 1 | 0;
 }
 $1 = $v;
 $26 = $1;
 STACKTOP = sp;
 return $26 | 0;
}
function copyTempDouble(ptr) {
 ptr = ptr | 0;
 HEAP8[tempDoublePtr] = HEAP8[ptr];
 HEAP8[tempDoublePtr + 1 | 0] = HEAP8[ptr + 1 | 0];
 HEAP8[tempDoublePtr + 2 | 0] = HEAP8[ptr + 2 | 0];
 HEAP8[tempDoublePtr + 3 | 0] = HEAP8[ptr + 3 | 0];
 HEAP8[tempDoublePtr + 4 | 0] = HEAP8[ptr + 4 | 0];
 HEAP8[tempDoublePtr + 5 | 0] = HEAP8[ptr + 5 | 0];
 HEAP8[tempDoublePtr + 6 | 0] = HEAP8[ptr + 6 | 0];
 HEAP8[tempDoublePtr + 7 | 0] = HEAP8[ptr + 7 | 0];
}
function _init_span_list() {
 var $1 = 0, $2 = 0, $12 = 0, $_0 = 0;
 $1 = _malloc(56) | 0;
 $2 = $1;
 HEAP32[2896] = $2;
 if (($1 | 0) != 0) {
  HEAP32[$1 + 52 >> 2] = 0;
  _memset($1 | 0, 0, 36) | 0;
  HEAPF64[$1 + 40 >> 3] = 3.0e8;
  HEAP32[$1 + 48 >> 2] = 1;
  HEAP32[2894] = $2;
  $_0 = 0;
  return $_0 | 0;
 }
 $12 = HEAP32[3164] | 0;
 if (($12 | 0) != 0) {
  _fwrite(3336, 27, 1, $12 | 0) | 0;
 }
 _oe_exit(2);
 $_0 = 1;
 return $_0 | 0;
}
function ___muldsi3($a, $b) {
 $a = $a | 0;
 $b = $b | 0;
 var $1 = 0, $2 = 0, $3 = 0, $6 = 0, $8 = 0, $11 = 0, $12 = 0;
 $1 = $a & 65535;
 $2 = $b & 65535;
 $3 = Math_imul($2, $1) | 0;
 $6 = $a >>> 16;
 $8 = ($3 >>> 16) + (Math_imul($2, $6) | 0) | 0;
 $11 = $b >>> 16;
 $12 = Math_imul($11, $1) | 0;
 return (tempRet0 = ($8 >>> 16) + (Math_imul($11, $6) | 0) + ((($8 & 65535) + $12 | 0) >>> 16) | 0, $8 + $12 << 16 | $3 & 65535 | 0) | 0;
}
function _inject_pipegap($ptr) {
 $ptr = $ptr | 0;
 var $8 = 0, $10 = 0.0, $12 = 0, $16 = 0;
 if ((HEAP32[$ptr + 56 >> 2] | 0) == 0) {
  return;
 }
 $8 = HEAP32[(HEAP32[$ptr + 68 >> 2] | 0) + 24 >> 2] | 0;
 $10 = +HEAPF64[$ptr + 40 >> 3];
 $12 = HEAP32[$ptr + 60 >> 2] | 0;
 _gsl_vector_set($8, $12, +_gsl_vector_get($8, $12) - $10);
 $16 = HEAP32[$ptr + 64 >> 2] | 0;
 _gsl_vector_set($8, $16, $10 + +_gsl_vector_get($8, $16));
 return;
}
function _inject_pole_imode($ptr) {
 $ptr = $ptr | 0;
 var $rhs = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24 | 0;
 $rhs = sp | 0;
 if ((HEAP32[$ptr + 8 >> 2] | 0) == 0) {
  STACKTOP = sp;
  return;
 }
 _gsl_vector_subvector($rhs, HEAP32[$ptr + 24 >> 2] | 0, 1, HEAP32[3122] | 0);
 _gsl_blas_dgemv(111, 1.0, HEAP32[(HEAP32[2896] | 0) + 16 >> 2] | 0, HEAP32[$ptr + 32 >> 2] | 0, 1.0, $rhs | 0) | 0;
 STACKTOP = sp;
 return;
}
function _update_inductor_history($ptr) {
 $ptr = $ptr | 0;
 var $4 = 0, $7 = 0, $9 = 0.0, $11 = 0.0, $14 = 0.0;
 $4 = HEAP32[(HEAP32[$ptr + 56 >> 2] | 0) + 20 >> 2] | 0;
 $7 = $ptr + 24 | 0;
 $9 = +HEAPF64[$ptr + 16 >> 3] * +HEAPF64[$7 >> 3];
 $11 = +HEAPF64[$ptr + 8 >> 3];
 $14 = +_gsl_vector_get($4, HEAP32[$ptr + 48 >> 2] | 0);
 HEAPF64[$7 >> 3] = $9 + $11 * ($14 - +_gsl_vector_get($4, HEAP32[$ptr + 52 >> 2] | 0));
 return;
}
function _init_line_list() {
 var $1 = 0, $2 = 0, $13 = 0, $_0 = 0;
 $1 = _malloc(32) | 0;
 $2 = $1;
 HEAP32[3168] = $2;
 if (($1 | 0) != 0) {
  HEAP32[$1 + 28 >> 2] = 0;
  HEAP32[$1 >> 2] = 0;
  HEAP32[$1 + 4 >> 2] = 0;
  HEAP32[$1 + 8 >> 2] = 0;
  HEAP32[3166] = $2;
  $_0 = 0;
  return $_0 | 0;
 }
 $13 = HEAP32[3164] | 0;
 if (($13 | 0) != 0) {
  _fwrite(8872, 27, 1, $13 | 0) | 0;
 }
 _oe_exit(2);
 $_0 = 1;
 return $_0 | 0;
}
function _update_monitor_pts($ptr) {
 $ptr = $ptr | 0;
 var $2 = 0, $6 = 0, $9 = 0;
 $2 = HEAP32[$ptr + 40 >> 2] | 0;
 if (($2 | 0) == 0) {
  return;
 }
 $6 = HEAP32[$ptr + 36 >> 2] | 0;
 if (($6 | 0) == 0) {
  return;
 }
 $9 = HEAP32[2888] | 0;
 if (($9 | 0) >= (HEAP32[$ptr + 32 >> 2] | 0)) {
  return;
 }
 HEAPF64[$6 + ($9 << 3) >> 3] = +HEAPF64[HEAP32[$2 + 24 >> 2] >> 3] - +HEAPF64[HEAP32[$2 + 28 >> 2] >> 3];
 return;
}
function _update_monitor_summary($ptr) {
 $ptr = $ptr | 0;
 var $2 = 0, $10 = 0;
 $2 = HEAP32[$ptr + 40 >> 2] | 0;
 if (($2 | 0) != 0) {
  HEAPF64[$ptr + 16 >> 3] = +HEAPF64[$2 + 16 >> 3];
 }
 $10 = HEAP32[$ptr + 48 >> 2] | 0;
 if (($10 | 0) != 0) {
  HEAPF64[$ptr + 24 >> 3] = +HEAPF64[$10 + 72 >> 3];
  return;
 }
 if ((HEAP32[$ptr + 44 >> 2] | 0) == 0) {
  return;
 }
 HEAPF64[$ptr + 24 >> 3] = +abort(72);
 return;
}
function _gsl_vector_int_set_zero($v) {
 $v = $v | 0;
 var $1 = 0, $data = 0, $n = 0, $stride = 0, $i = 0, sp = 0;
 sp = STACKTOP;
 $1 = $v;
 $data = HEAP32[$1 + 8 >> 2] | 0;
 $n = HEAP32[$1 >> 2] | 0;
 $stride = HEAP32[$1 + 4 >> 2] | 0;
 $i = 0;
 while (1) {
  if (!($i >>> 0 < $n >>> 0)) {
   break;
  }
  HEAP32[$data + ((Math_imul($i, $stride) | 0) << 2) >> 2] = 0;
  $i = $i + 1 | 0;
 }
 STACKTOP = sp;
 return;
}
function _gsl_vector_set_zero($v) {
 $v = $v | 0;
 var $1 = 0, $data = 0, $n = 0, $stride = 0, $i = 0, sp = 0;
 sp = STACKTOP;
 $1 = $v;
 $data = HEAP32[$1 + 8 >> 2] | 0;
 $n = HEAP32[$1 >> 2] | 0;
 $stride = HEAP32[$1 + 4 >> 2] | 0;
 $i = 0;
 while (1) {
  if (!($i >>> 0 < $n >>> 0)) {
   break;
  }
  HEAPF64[$data + ((Math_imul($i, $stride) | 0) << 3) >> 3] = 0.0;
  $i = $i + 1 | 0;
 }
 STACKTOP = sp;
 return;
}
function _update_capacitor_history($ptr) {
 $ptr = $ptr | 0;
 var $4 = 0, $6 = 0.0, $9 = 0.0, $14 = 0.0, $15 = 0;
 $4 = HEAP32[(HEAP32[$ptr + 32 >> 2] | 0) + 20 >> 2] | 0;
 $6 = +HEAPF64[$ptr + 8 >> 3];
 $9 = +_gsl_vector_get($4, HEAP32[$ptr + 28 >> 2] | 0);
 $14 = $6 * ($9 - +_gsl_vector_get($4, HEAP32[$ptr + 24 >> 2] | 0));
 $15 = $ptr + 16 | 0;
 HEAPF64[$15 >> 3] = $14 - +HEAPF64[$15 >> 3];
 return;
}
function _pipegap_answers_cleanup($ptr) {
 $ptr = $ptr | 0;
 var $16 = 0.0, $17 = 0.0;
 if ((HEAP32[$ptr + 56 >> 2] | 0) != 0) {
  _add_y(HEAP32[$ptr + 68 >> 2] | 0, HEAP32[$ptr + 60 >> 2] | 0, HEAP32[$ptr + 64 >> 2] | 0, -0.0 - +HEAPF64[$ptr + 32 >> 3]);
 }
 $16 = +HEAPF64[$ptr + 24 >> 3];
 $17 = +Math_abs(+$16);
 if (!($17 > +Math_abs(+(+HEAPF64[99])))) {
  return;
 }
 HEAPF64[99] = $16;
 return;
}
function _inject_ground($ptr) {
 $ptr = $ptr | 0;
 var $4 = 0, $6 = 0.0, $9 = 0, $14 = 0;
 $4 = HEAP32[(HEAP32[$ptr + 104 >> 2] | 0) + 24 >> 2] | 0;
 $6 = +HEAPF64[$ptr + 48 >> 3];
 $9 = _gsl_vector_ptr($4, HEAP32[$ptr + 96 >> 2] | 0) | 0;
 HEAPF64[$9 >> 3] = +HEAPF64[$9 >> 3] - $6;
 $14 = _gsl_vector_ptr($4, HEAP32[$ptr + 100 >> 2] | 0) | 0;
 HEAPF64[$14 >> 3] = $6 + +HEAPF64[$14 >> 3];
 return;
}
function _restore_arrbez_time_step($ptr) {
 $ptr = $ptr | 0;
 var $4 = 0, $6 = 0.0, $10 = 0;
 $4 = $ptr + 120 | 0;
 $6 = +HEAPF64[96] / +HEAPF64[300] * +HEAPF64[$4 >> 3];
 HEAPF64[$4 >> 3] = $6;
 $10 = $ptr + 96 | 0;
 HEAPF64[$10 >> 3] = +HEAPF64[300] / +HEAPF64[96] * +HEAPF64[$10 >> 3];
 HEAPF64[$ptr + 104 >> 3] = $6 + +HEAPF64[$ptr + 72 >> 3] + 1.0 / +HEAPF64[$ptr + 88 >> 3];
 return;
}
function _do_all_steepfronts($verb) {
 $verb = $verb | 0;
 var $1 = 0, $3 = 0, $5 = 0;
 $1 = HEAP32[2892] | 0;
 HEAP32[2890] = $1;
 $3 = HEAP32[$1 + 64 >> 2] | 0;
 HEAP32[2890] = $3;
 if (($3 | 0) == 0) {
  return;
 } else {
  $5 = $3;
 }
 do {
  FUNCTION_TABLE_vi[$verb & 255]($5);
  $5 = HEAP32[(HEAP32[2890] | 0) + 64 >> 2] | 0;
  HEAP32[2890] = $5;
 } while (($5 | 0) != 0);
 return;
}
function _do_all_arresters($verb) {
 $verb = $verb | 0;
 var $1 = 0, $3 = 0, $5 = 0;
 $1 = HEAP32[3216] | 0;
 HEAP32[3214] = $1;
 $3 = HEAP32[$1 + 168 >> 2] | 0;
 HEAP32[3214] = $3;
 if (($3 | 0) == 0) {
  return;
 } else {
  $5 = $3;
 }
 do {
  FUNCTION_TABLE_vi[$verb & 255]($5);
  $5 = HEAP32[(HEAP32[3214] | 0) + 168 >> 2] | 0;
  HEAP32[3214] = $5;
 } while (($5 | 0) != 0);
 return;
}
function ___uremdi3($a$0, $a$1, $b$0, $b$1) {
 $a$0 = $a$0 | 0;
 $a$1 = $a$1 | 0;
 $b$0 = $b$0 | 0;
 $b$1 = $b$1 | 0;
 var $rem = 0, __stackBase__ = 0;
 __stackBase__ = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $rem = __stackBase__ | 0;
 ___udivmoddi4($a$0, $a$1, $b$0, $b$1, $rem) | 0;
 STACKTOP = __stackBase__;
 return (tempRet0 = HEAP32[$rem + 4 >> 2] | 0, HEAP32[$rem >> 2] | 0) | 0;
}
function _init_steepfront_list() {
 var $1 = 0, $2 = 0, $10 = 0, $_0 = 0;
 $1 = _malloc(72) | 0;
 $2 = $1;
 HEAP32[2892] = $2;
 if (($1 | 0) != 0) {
  HEAP32[$1 + 64 >> 2] = 0;
  HEAP32[$1 + 48 >> 2] = 0;
  HEAP32[2890] = $2;
  $_0 = 0;
  return $_0 | 0;
 }
 $10 = HEAP32[3164] | 0;
 if (($10 | 0) != 0) {
  _fwrite(4368, 33, 1, $10 | 0) | 0;
 }
 _oe_exit(2);
 $_0 = 1;
 return $_0 | 0;
}
function _do_all_insulators($verb) {
 $verb = $verb | 0;
 var $1 = 0, $3 = 0, $5 = 0;
 $1 = HEAP32[3174] | 0;
 HEAP32[3172] = $1;
 $3 = HEAP32[$1 + 80 >> 2] | 0;
 HEAP32[3172] = $3;
 if (($3 | 0) == 0) {
  return;
 } else {
  $5 = $3;
 }
 do {
  FUNCTION_TABLE_vi[$verb & 255]($5);
  $5 = HEAP32[(HEAP32[3172] | 0) + 80 >> 2] | 0;
  HEAP32[3172] = $5;
 } while (($5 | 0) != 0);
 return;
}
function _do_all_capacitors($verb) {
 $verb = $verb | 0;
 var $1 = 0, $3 = 0, $5 = 0;
 $1 = HEAP32[3204] | 0;
 HEAP32[3202] = $1;
 $3 = HEAP32[$1 + 36 >> 2] | 0;
 HEAP32[3202] = $3;
 if (($3 | 0) == 0) {
  return;
 } else {
  $5 = $3;
 }
 do {
  FUNCTION_TABLE_vi[$verb & 255]($5);
  $5 = HEAP32[(HEAP32[3202] | 0) + 36 >> 2] | 0;
  HEAP32[3202] = $5;
 } while (($5 | 0) != 0);
 return;
}
function _init_arrbez_list() {
 var $1 = 0, $2 = 0, $10 = 0, $_0 = 0;
 $1 = _malloc(168) | 0;
 $2 = $1;
 HEAP32[3220] = $2;
 if (($1 | 0) != 0) {
  HEAP32[$1 + 160 >> 2] = 0;
  HEAP32[$1 + 24 >> 2] = 0;
  HEAP32[3218] = $2;
  $_0 = 0;
  return $_0 | 0;
 }
 $10 = HEAP32[3164] | 0;
 if (($10 | 0) != 0) {
  _fwrite(11064, 29, 1, $10 | 0) | 0;
 }
 _oe_exit(2);
 $_0 = 1;
 return $_0 | 0;
}
function _do_all_inductors($verb) {
 $verb = $verb | 0;
 var $1 = 0, $3 = 0, $5 = 0;
 $1 = HEAP32[3178] | 0;
 HEAP32[3176] = $1;
 $3 = HEAP32[$1 + 60 >> 2] | 0;
 HEAP32[3176] = $3;
 if (($3 | 0) == 0) {
  return;
 } else {
  $5 = $3;
 }
 do {
  FUNCTION_TABLE_vi[$verb & 255]($5);
  $5 = HEAP32[(HEAP32[3176] | 0) + 60 >> 2] | 0;
  HEAP32[3176] = $5;
 } while (($5 | 0) != 0);
 return;
}
function _do_all_grounds($verb) {
 $verb = $verb | 0;
 var $1 = 0, $3 = 0, $5 = 0;
 $1 = HEAP32[3188] | 0;
 HEAP32[3186] = $1;
 $3 = HEAP32[$1 + 108 >> 2] | 0;
 HEAP32[3186] = $3;
 if (($3 | 0) == 0) {
  return;
 } else {
  $5 = $3;
 }
 do {
  FUNCTION_TABLE_vi[$verb & 255]($5);
  $5 = HEAP32[(HEAP32[3186] | 0) + 108 >> 2] | 0;
  HEAP32[3186] = $5;
 } while (($5 | 0) != 0);
 return;
}
function _do_all_customers($verb) {
 $verb = $verb | 0;
 var $1 = 0, $3 = 0, $5 = 0;
 $1 = HEAP32[3200] | 0;
 HEAP32[3198] = $1;
 $3 = HEAP32[$1 + 72 >> 2] | 0;
 HEAP32[3198] = $3;
 if (($3 | 0) == 0) {
  return;
 } else {
  $5 = $3;
 }
 do {
  FUNCTION_TABLE_vi[$verb & 255]($5);
  $5 = HEAP32[(HEAP32[3198] | 0) + 72 >> 2] | 0;
  HEAP32[3198] = $5;
 } while (($5 | 0) != 0);
 return;
}
function _do_all_arrbezs($verb) {
 $verb = $verb | 0;
 var $1 = 0, $3 = 0, $5 = 0;
 $1 = HEAP32[3220] | 0;
 HEAP32[3218] = $1;
 $3 = HEAP32[$1 + 160 >> 2] | 0;
 HEAP32[3218] = $3;
 if (($3 | 0) == 0) {
  return;
 } else {
  $5 = $3;
 }
 do {
  FUNCTION_TABLE_vi[$verb & 255]($5);
  $5 = HEAP32[(HEAP32[3218] | 0) + 160 >> 2] | 0;
  HEAP32[3218] = $5;
 } while (($5 | 0) != 0);
 return;
}
function _do_all_pipegaps($verb) {
 $verb = $verb | 0;
 var $1 = 0, $3 = 0, $5 = 0;
 $1 = HEAP32[2988] | 0;
 HEAP32[2986] = $1;
 $3 = HEAP32[$1 + 72 >> 2] | 0;
 HEAP32[2986] = $3;
 if (($3 | 0) == 0) {
  return;
 } else {
  $5 = $3;
 }
 do {
  FUNCTION_TABLE_vi[$verb & 255]($5);
  $5 = HEAP32[(HEAP32[2986] | 0) + 72 >> 2] | 0;
  HEAP32[2986] = $5;
 } while (($5 | 0) != 0);
 return;
}
function _init_pole_list() {
 var $1 = 0, $2 = 0, $9 = 0, $_0 = 0;
 $1 = _malloc(80) | 0;
 $2 = $1;
 HEAP32[2982] = $2;
 if (($1 | 0) != 0) {
  HEAP32[$1 + 76 >> 2] = 0;
  _memset($1 + 16 | 0, 0, 60) | 0;
  HEAP32[2978] = $2;
  $_0 = 0;
  return $_0 | 0;
 }
 $9 = HEAP32[3164] | 0;
 if (($9 | 0) != 0) {
  _fwrite(9648, 27, 1, $9 | 0) | 0;
 }
 _oe_exit(2);
 $_0 = 1;
 return $_0 | 0;
}
function _do_all_surges($verb) {
 $verb = $verb | 0;
 var $1 = 0, $3 = 0, $5 = 0;
 $1 = HEAP32[2884] | 0;
 HEAP32[2882] = $1;
 $3 = HEAP32[$1 + 76 >> 2] | 0;
 HEAP32[2882] = $3;
 if (($3 | 0) == 0) {
  return;
 } else {
  $5 = $3;
 }
 do {
  FUNCTION_TABLE_vi[$verb & 255]($5);
  $5 = HEAP32[(HEAP32[2882] | 0) + 76 >> 2] | 0;
  HEAP32[2882] = $5;
 } while (($5 | 0) != 0);
 return;
}
function _do_all_meters($verb) {
 $verb = $verb | 0;
 var $1 = 0, $3 = 0, $5 = 0;
 $1 = HEAP32[3158] | 0;
 HEAP32[3156] = $1;
 $3 = HEAP32[$1 + 32 >> 2] | 0;
 HEAP32[3156] = $3;
 if (($3 | 0) == 0) {
  return;
 } else {
  $5 = $3;
 }
 do {
  FUNCTION_TABLE_vi[$verb & 255]($5);
  $5 = HEAP32[(HEAP32[3156] | 0) + 32 >> 2] | 0;
  HEAP32[3156] = $5;
 } while (($5 | 0) != 0);
 return;
}
function _do_all_lpms($verb) {
 $verb = $verb | 0;
 var $1 = 0, $3 = 0, $5 = 0;
 $1 = HEAP32[3162] | 0;
 HEAP32[3160] = $1;
 $3 = HEAP32[$1 + 100 >> 2] | 0;
 HEAP32[3160] = $3;
 if (($3 | 0) == 0) {
  return;
 } else {
  $5 = $3;
 }
 do {
  FUNCTION_TABLE_vi[$verb & 255]($5);
  $5 = HEAP32[(HEAP32[3160] | 0) + 100 >> 2] | 0;
  HEAP32[3160] = $5;
 } while (($5 | 0) != 0);
 return;
}
function _restore_arrester_time_step($ptr) {
 $ptr = $ptr | 0;
 var $5 = 0, $7 = 0.0, $9 = 0.0, $11 = 0.0;
 $5 = $ptr + 128 | 0;
 $7 = +HEAPF64[96] / +HEAPF64[300] * +HEAPF64[$5 >> 3];
 HEAPF64[$5 >> 3] = $7;
 $9 = +HEAPF64[$ptr + 40 >> 3];
 $11 = 1.0 / ($9 + $7);
 HEAPF64[$ptr + 88 >> 3] = $11;
 HEAPF64[$ptr + 120 >> 3] = $11 * $9;
 HEAPF64[$ptr + 136 >> 3] = $11 * $7;
 return;
}
function _init_lpm_list() {
 var $1 = 0, $2 = 0, $10 = 0, $_0 = 0;
 $1 = _malloc(104) | 0;
 $2 = $1;
 HEAP32[3162] = $2;
 if (($1 | 0) != 0) {
  HEAP32[$1 + 100 >> 2] = 0;
  HEAP32[$1 + 80 >> 2] = 0;
  HEAP32[3160] = $2;
  $_0 = 0;
  return $_0 | 0;
 }
 $10 = HEAP32[3164] | 0;
 if (($10 | 0) != 0) {
  _fwrite(5920, 26, 1, $10 | 0) | 0;
 }
 _oe_exit(2);
 $_0 = 1;
 return $_0 | 0;
}
function _do_all_sources($verb) {
 $verb = $verb | 0;
 var $1 = 0, $3 = 0, $5 = 0;
 $1 = HEAP32[2902] | 0;
 HEAP32[2900] = $1;
 $3 = HEAP32[$1 + 8 >> 2] | 0;
 HEAP32[2900] = $3;
 if (($3 | 0) == 0) {
  return;
 } else {
  $5 = $3;
 }
 do {
  FUNCTION_TABLE_vi[$verb & 255]($5);
  $5 = HEAP32[(HEAP32[2900] | 0) + 8 >> 2] | 0;
  HEAP32[2900] = $5;
 } while (($5 | 0) != 0);
 return;
}
function _do_all_poles($verb) {
 $verb = $verb | 0;
 var $1 = 0, $3 = 0, $5 = 0;
 $1 = HEAP32[2982] | 0;
 HEAP32[2978] = $1;
 $3 = HEAP32[$1 + 76 >> 2] | 0;
 HEAP32[2978] = $3;
 if (($3 | 0) == 0) {
  return;
 } else {
  $5 = $3;
 }
 do {
  FUNCTION_TABLE_vi[$verb & 255]($5);
  $5 = HEAP32[(HEAP32[2978] | 0) + 76 >> 2] | 0;
  HEAP32[2978] = $5;
 } while (($5 | 0) != 0);
 return;
}
function _do_all_lines($verb) {
 $verb = $verb | 0;
 var $1 = 0, $3 = 0, $5 = 0;
 $1 = HEAP32[3168] | 0;
 HEAP32[3166] = $1;
 $3 = HEAP32[$1 + 28 >> 2] | 0;
 HEAP32[3166] = $3;
 if (($3 | 0) == 0) {
  return;
 } else {
  $5 = $3;
 }
 do {
  FUNCTION_TABLE_vi[$verb & 255]($5);
  $5 = HEAP32[(HEAP32[3166] | 0) + 28 >> 2] | 0;
  HEAP32[3166] = $5;
 } while (($5 | 0) != 0);
 return;
}
function ___shlim($f, $lim) {
 $f = $f | 0;
 $lim = $lim | 0;
 var $3 = 0, $5 = 0, $8 = 0;
 HEAP32[$f + 104 >> 2] = $lim;
 $3 = HEAP32[$f + 8 >> 2] | 0;
 $5 = HEAP32[$f + 4 >> 2] | 0;
 $8 = $3 - $5 | 0;
 HEAP32[$f + 108 >> 2] = $8;
 if (($lim | 0) != 0 & ($8 | 0) > ($lim | 0)) {
  HEAP32[$f + 100 >> 2] = $5 + $lim;
  return;
 } else {
  HEAP32[$f + 100 >> 2] = $3;
  return;
 }
}
function _reset_system() {
 _restore_time_step();
 _do_all_grounds(12);
 _do_all_arresters(48);
 _do_all_arrbezs(28);
 _do_all_meters(52);
 _do_all_insulators(78);
 _do_all_lpms(38);
 _do_all_inductors(112);
 _do_all_customers(74);
 _do_all_capacitors(46);
 _reset_lines();
 _do_all_lines(102);
 _do_all_inductors(134);
 _do_all_capacitors(92);
 _do_all_poles(104);
 return;
}
function _init_source_list() {
 var $1 = 0, $2 = 0, $9 = 0, $_0 = 0;
 $1 = _malloc(12) | 0;
 $2 = $1;
 HEAP32[2902] = $2;
 if (($1 | 0) != 0) {
  HEAP32[$1 + 8 >> 2] = 0;
  HEAP32[$1 >> 2] = 0;
  HEAP32[2900] = $2;
  $_0 = 0;
  return $_0 | 0;
 }
 $9 = HEAP32[3164] | 0;
 if (($9 | 0) != 0) {
  _fwrite(5952, 29, 1, $9 | 0) | 0;
 }
 _oe_exit(2);
 $_0 = 1;
 return $_0 | 0;
}
function _llvm_cttz_i32(x) {
 x = x | 0;
 var ret = 0;
 ret = HEAP8[cttz_i8 + (x & 255) | 0] | 0;
 if ((ret | 0) < 8) return ret | 0;
 ret = HEAP8[cttz_i8 + (x >> 8 & 255) | 0] | 0;
 if ((ret | 0) < 8) return ret + 8 | 0;
 ret = HEAP8[cttz_i8 + (x >> 16 & 255) | 0] | 0;
 if ((ret | 0) < 8) return ret + 16 | 0;
 return (HEAP8[cttz_i8 + (x >>> 24) | 0] | 0) + 24 | 0;
}
function _llvm_ctlz_i32(x) {
 x = x | 0;
 var ret = 0;
 ret = HEAP8[ctlz_i8 + (x >>> 24) | 0] | 0;
 if ((ret | 0) < 8) return ret | 0;
 ret = HEAP8[ctlz_i8 + (x >> 16 & 255) | 0] | 0;
 if ((ret | 0) < 8) return ret + 8 | 0;
 ret = HEAP8[ctlz_i8 + (x >> 8 & 255) | 0] | 0;
 if ((ret | 0) < 8) return ret + 16 | 0;
 return (HEAP8[ctlz_i8 + (x & 255) | 0] | 0) + 24 | 0;
}
function _init_arrester_list() {
 var $1 = 0, $2 = 0, $8 = 0, $_0 = 0;
 $1 = _malloc(176) | 0;
 $2 = $1;
 HEAP32[3216] = $2;
 if (($1 | 0) != 0) {
  HEAP32[$1 + 168 >> 2] = 0;
  HEAP32[3214] = $2;
  $_0 = 0;
  return $_0 | 0;
 }
 $8 = HEAP32[3164] | 0;
 if (($8 | 0) != 0) {
  _fwrite(4032, 31, 1, $8 | 0) | 0;
 }
 _oe_exit(2);
 $_0 = 1;
 return $_0 | 0;
}
function _init_insulator_list() {
 var $1 = 0, $2 = 0, $8 = 0, $_0 = 0;
 $1 = _malloc(88) | 0;
 $2 = $1;
 HEAP32[3174] = $2;
 if (($1 | 0) != 0) {
  HEAP32[$1 + 80 >> 2] = 0;
  HEAP32[3172] = $2;
  $_0 = 0;
  return $_0 | 0;
 }
 $8 = HEAP32[3164] | 0;
 if (($8 | 0) != 0) {
  _fwrite(6208, 32, 1, $8 | 0) | 0;
 }
 _oe_exit(2);
 $_0 = 1;
 return $_0 | 0;
}
function _init_capacitor_list() {
 var $1 = 0, $2 = 0, $8 = 0, $_0 = 0;
 $1 = _malloc(40) | 0;
 $2 = $1;
 HEAP32[3204] = $2;
 if (($1 | 0) != 0) {
  HEAP32[$1 + 36 >> 2] = 0;
  HEAP32[3202] = $2;
  $_0 = 0;
  return $_0 | 0;
 }
 $8 = HEAP32[3164] | 0;
 if (($8 | 0) != 0) {
  _fwrite(8792, 32, 1, $8 | 0) | 0;
 }
 _oe_exit(2);
 $_0 = 1;
 return $_0 | 0;
}
function _init_resistor_list() {
 var $1 = 0, $2 = 0, $8 = 0, $_0 = 0;
 $1 = _malloc(24) | 0;
 $2 = $1;
 HEAP32[2972] = $2;
 if (($1 | 0) != 0) {
  HEAP32[$1 + 20 >> 2] = 0;
  HEAP32[2970] = $2;
  $_0 = 0;
  return $_0 | 0;
 }
 $8 = HEAP32[3164] | 0;
 if (($8 | 0) != 0) {
  _fwrite(5984, 31, 1, $8 | 0) | 0;
 }
 _oe_exit(2);
 $_0 = 1;
 return $_0 | 0;
}
function _init_inductor_list() {
 var $1 = 0, $2 = 0, $8 = 0, $_0 = 0;
 $1 = _malloc(64) | 0;
 $2 = $1;
 HEAP32[3178] = $2;
 if (($1 | 0) != 0) {
  HEAP32[$1 + 60 >> 2] = 0;
  HEAP32[3176] = $2;
  $_0 = 0;
  return $_0 | 0;
 }
 $8 = HEAP32[3164] | 0;
 if (($8 | 0) != 0) {
  _fwrite(3368, 31, 1, $8 | 0) | 0;
 }
 _oe_exit(2);
 $_0 = 1;
 return $_0 | 0;
}
function _init_ground_list() {
 var $1 = 0, $2 = 0, $8 = 0, $_0 = 0;
 $1 = _malloc(112) | 0;
 $2 = $1;
 HEAP32[3188] = $2;
 if (($1 | 0) != 0) {
  HEAP32[$1 + 108 >> 2] = 0;
  HEAP32[3186] = $2;
  $_0 = 0;
  return $_0 | 0;
 }
 $8 = HEAP32[3164] | 0;
 if (($8 | 0) != 0) {
  _fwrite(7744, 29, 1, $8 | 0) | 0;
 }
 _oe_exit(2);
 $_0 = 1;
 return $_0 | 0;
}
function _init_customer_list() {
 var $1 = 0, $2 = 0, $8 = 0, $_0 = 0;
 $1 = _malloc(80) | 0;
 $2 = $1;
 HEAP32[3200] = $2;
 if (($1 | 0) != 0) {
  HEAP32[$1 + 72 >> 2] = 0;
  HEAP32[3198] = $2;
  $_0 = 0;
  return $_0 | 0;
 }
 $8 = HEAP32[3164] | 0;
 if (($8 | 0) != 0) {
  _fwrite(5304, 31, 1, $8 | 0) | 0;
 }
 _oe_exit(2);
 $_0 = 1;
 return $_0 | 0;
}
function _init_pipegap_list() {
 var $1 = 0, $2 = 0, $8 = 0, $_0 = 0;
 $1 = _malloc(80) | 0;
 $2 = $1;
 HEAP32[2988] = $2;
 if (($1 | 0) != 0) {
  HEAP32[$1 + 72 >> 2] = 0;
  HEAP32[2986] = $2;
  $_0 = 0;
  return $_0 | 0;
 }
 $8 = HEAP32[3164] | 0;
 if (($8 | 0) != 0) {
  _fwrite(5128, 30, 1, $8 | 0) | 0;
 }
 _oe_exit(2);
 $_0 = 1;
 return $_0 | 0;
}
function _restore_capacitor_time_step($ptr) {
 $ptr = $ptr | 0;
 var $1 = 0, $2 = 0.0, $6 = 0.0;
 $1 = $ptr | 0;
 $2 = +HEAPF64[$1 >> 3];
 $6 = $2 * (+HEAPF64[96] / +HEAPF64[300]);
 HEAPF64[$1 >> 3] = $6;
 HEAPF64[$ptr + 8 >> 3] = $6 + $6;
 _add_y(HEAP32[$ptr + 32 >> 2] | 0, HEAP32[$ptr + 24 >> 2] | 0, HEAP32[$ptr + 28 >> 2] | 0, $6 - $2);
 return;
}
function _init_surge_list() {
 var $1 = 0, $2 = 0, $8 = 0, $_0 = 0;
 $1 = _malloc(80) | 0;
 $2 = $1;
 HEAP32[2884] = $2;
 if (($1 | 0) != 0) {
  HEAP32[$1 + 76 >> 2] = 0;
  HEAP32[2882] = $2;
  $_0 = 0;
  return $_0 | 0;
 }
 $8 = HEAP32[3164] | 0;
 if (($8 | 0) != 0) {
  _fwrite(4296, 28, 1, $8 | 0) | 0;
 }
 _oe_exit(2);
 $_0 = 1;
 return $_0 | 0;
}
function _init_meter_list() {
 var $1 = 0, $2 = 0, $8 = 0, $_0 = 0;
 $1 = _malloc(40) | 0;
 $2 = $1;
 HEAP32[3158] = $2;
 if (($1 | 0) != 0) {
  HEAP32[$1 + 32 >> 2] = 0;
  HEAP32[3156] = $2;
  $_0 = 0;
  return $_0 | 0;
 }
 $8 = HEAP32[3164] | 0;
 if (($8 | 0) != 0) {
  _fwrite(3560, 28, 1, $8 | 0) | 0;
 }
 _oe_exit(2);
 $_0 = 1;
 return $_0 | 0;
}
function _do_all_monitors($verb) {
 $verb = $verb | 0;
 var $1 = 0, $4 = 0, $6 = 0;
 $1 = HEAP32[3154] | 0;
 if (($1 | 0) == 0) {
  return;
 }
 $4 = HEAP32[$1 + 52 >> 2] | 0;
 if (($4 | 0) == 0) {
  return;
 } else {
  $6 = $4;
 }
 do {
  FUNCTION_TABLE_vi[$verb & 255]($6);
  $6 = HEAP32[$6 + 52 >> 2] | 0;
 } while (($6 | 0) != 0);
 return;
}
function _gsl_eigen_symmv_free($w) {
 $w = $w | 0;
 var $1 = 0, sp = 0;
 sp = STACKTOP;
 $1 = $w;
 if (($1 | 0) != 0) {
  _free(HEAP32[$1 + 16 >> 2] | 0);
  _free(HEAP32[$1 + 12 >> 2] | 0);
  _free(HEAP32[$1 + 8 >> 2] | 0);
  _free(HEAP32[$1 + 4 >> 2] | 0);
  _free($1);
  STACKTOP = sp;
  return;
 } else {
  STACKTOP = sp;
  return;
 }
}
function _gsl_finite($x) {
 $x = +$x;
 var $3$0 = 0, $4$1 = 0, $$etemp$1$1 = 0, sp = 0;
 sp = STACKTOP;
 $3$0 = ___DOUBLE_BITS1205($x) | 0;
 $4$1 = tempRet0 & 2147483647;
 $$etemp$1$1 = 2146435072;
 STACKTOP = sp;
 return ($4$1 >>> 0 < $$etemp$1$1 >>> 0 | $4$1 >>> 0 == $$etemp$1$1 >>> 0 & ($3$0 | 0) >>> 0 < 0 >>> 0) & 1 | 0;
}
function _allocate_bezier($npts) {
 $npts = $npts | 0;
 var $1 = 0, $5 = 0;
 $1 = _malloc(40) | 0;
 HEAP32[$1 >> 2] = $npts;
 $5 = ($npts * 3 | 0) - 2 | 0;
 HEAP32[$1 + 4 >> 2] = $5;
 HEAP32[$1 + 24 >> 2] = _malloc($npts << 3) | 0;
 HEAP32[$1 + 28 >> 2] = _malloc($5 << 3) | 0;
 HEAP32[$1 + 32 >> 2] = 0;
 return $1 | 0;
}
function _inject_source($ptr) {
 $ptr = $ptr | 0;
 var $rhs = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24 | 0;
 $rhs = sp | 0;
 _gsl_vector_subvector($rhs, HEAP32[(HEAP32[$ptr + 4 >> 2] | 0) + 24 >> 2] | 0, 1, HEAP32[3122] | 0);
 _gsl_vector_add($rhs | 0, HEAP32[$ptr >> 2] | 0) | 0;
 STACKTOP = sp;
 return;
}
function _gsl_permutation_init($p) {
 $p = $p | 0;
 var $1 = 0, $n = 0, $i = 0, sp = 0;
 sp = STACKTOP;
 $1 = $p;
 $n = HEAP32[$1 >> 2] | 0;
 $i = 0;
 while (1) {
  if (!($i >>> 0 < $n >>> 0)) {
   break;
  }
  HEAP32[(HEAP32[$1 + 4 >> 2] | 0) + ($i << 2) >> 2] = $i;
  $i = $i + 1 | 0;
 }
 STACKTOP = sp;
 return;
}
function _gsl_root_fsolver_iterate($s) {
 $s = $s | 0;
 var $1 = 0, $19 = 0, sp = 0;
 sp = STACKTOP;
 $1 = $s;
 $19 = FUNCTION_TABLE_iiiiii[HEAP32[(HEAP32[$1 >> 2] | 0) + 12 >> 2] & 3](HEAP32[$1 + 32 >> 2] | 0, HEAP32[$1 + 4 >> 2] | 0, $1 + 8 | 0, $1 + 16 | 0, $1 + 24 | 0) | 0;
 STACKTOP = sp;
 return $19 | 0;
}
function _update_meter_peaks($ptr) {
 $ptr = $ptr | 0;
 var $7 = 0.0, $8 = 0.0, $9 = 0;
 $7 = +HEAPF64[HEAP32[$ptr + 24 >> 2] >> 3] - +HEAPF64[HEAP32[$ptr + 28 >> 2] >> 3];
 $8 = +Math_abs(+$7);
 $9 = $ptr + 16 | 0;
 if (!($8 > +Math_abs(+(+HEAPF64[$9 >> 3])))) {
  return;
 }
 HEAPF64[$9 >> 3] = $7;
 return;
}
function _strncpy(pdest, psrc, num) {
 pdest = pdest | 0;
 psrc = psrc | 0;
 num = num | 0;
 var padding = 0, i = 0;
 while ((i | 0) < (num | 0)) {
  HEAP8[pdest + i | 0] = padding ? 0 : HEAP8[psrc + i | 0] | 0;
  padding = padding ? 1 : (HEAP8[psrc + i | 0] | 0) == 0;
  i = i + 1 | 0;
 }
 return pdest | 0;
}
function _restore_time_step() {
 if ((HEAP32[3196] | 0) == 0) {
  return;
 }
 HEAPF64[323] = +HEAPF64[300];
 _do_all_arrbezs(32);
 _do_all_arresters(42);
 _do_all_capacitors(18);
 _do_all_customers(132);
 _do_all_grounds(106);
 _do_all_inductors(128);
 _do_all_lines(90);
 HEAP32[3196] = 0;
 return;
}
function _move_insulator($ptr, $i) {
 $ptr = $ptr | 0;
 $i = $i | 0;
 var $1 = 0, $2 = 0, $6 = 0;
 $1 = _find_pole($i) | 0;
 $2 = $ptr + 76 | 0;
 HEAP32[$2 >> 2] = $1;
 if (($1 | 0) == 0) {
  _oe_exit(15);
  $6 = HEAP32[$2 >> 2] | 0;
 } else {
  $6 = $1;
 }
 HEAP32[$6 + 8 >> 2] = 1;
 return;
}
function _move_lpm($ptr, $i) {
 $ptr = $ptr | 0;
 $i = $i | 0;
 var $1 = 0, $2 = 0, $6 = 0;
 $1 = _find_pole($i) | 0;
 $2 = $ptr + 96 | 0;
 HEAP32[$2 >> 2] = $1;
 if (($1 | 0) == 0) {
  _oe_exit(15);
  $6 = HEAP32[$2 >> 2] | 0;
 } else {
  $6 = $1;
 }
 HEAP32[$6 + 8 >> 2] = 1;
 return;
}
function _bitshift64Ashr(low, high, bits) {
 low = low | 0;
 high = high | 0;
 bits = bits | 0;
 if ((bits | 0) < 32) {
  tempRet0 = high >> bits;
  return low >>> bits | (high & (1 << bits) - 1) << 32 - bits;
 }
 tempRet0 = (high | 0) < 0 ? -1 : 0;
 return high >> bits - 32 | 0;
}
function _gsl_vector_int_free($v) {
 $v = $v | 0;
 var $1 = 0, sp = 0;
 sp = STACKTOP;
 $1 = $v;
 if (($1 | 0) == 0) {
  STACKTOP = sp;
  return;
 }
 if ((HEAP32[$1 + 16 >> 2] | 0) != 0) {
  _gsl_block_int_free(HEAP32[$1 + 12 >> 2] | 0);
 }
 _free($1);
 STACKTOP = sp;
 return;
}
function _gsl_matrix_int_free($m) {
 $m = $m | 0;
 var $1 = 0, sp = 0;
 sp = STACKTOP;
 $1 = $m;
 if (($1 | 0) == 0) {
  STACKTOP = sp;
  return;
 }
 if ((HEAP32[$1 + 20 >> 2] | 0) != 0) {
  _gsl_block_int_free(HEAP32[$1 + 16 >> 2] | 0);
 }
 _free($1);
 STACKTOP = sp;
 return;
}
function _change_time_step() {
 HEAPF64[323] = +HEAPF64[96];
 _do_all_arrbezs(98);
 _do_all_arresters(118);
 _do_all_capacitors(70);
 _do_all_customers(66);
 _do_all_grounds(16);
 _do_all_inductors(72);
 _do_all_lines(124);
 _do_all_poles(104);
 HEAP32[3196] = 1;
 return;
}
function ___DOUBLE_BITS1205($__f) {
 $__f = +$__f;
 var $__u = 0, $4 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $__u = sp | 0;
 HEAPF64[$__u >> 3] = $__f;
 $4 = $__u;
 STACKTOP = sp;
 return (tempRet0 = HEAP32[$4 + 4 >> 2] | 0, HEAP32[$4 >> 2] | 0) | 0;
}
function _gsl_vector_free($v) {
 $v = $v | 0;
 var $1 = 0, sp = 0;
 sp = STACKTOP;
 $1 = $v;
 if (($1 | 0) == 0) {
  STACKTOP = sp;
  return;
 }
 if ((HEAP32[$1 + 16 >> 2] | 0) != 0) {
  _gsl_block_free(HEAP32[$1 + 12 >> 2] | 0);
 }
 _free($1);
 STACKTOP = sp;
 return;
}
function _gsl_matrix_free($m) {
 $m = $m | 0;
 var $1 = 0, sp = 0;
 sp = STACKTOP;
 $1 = $m;
 if (($1 | 0) == 0) {
  STACKTOP = sp;
  return;
 }
 if ((HEAP32[$1 + 20 >> 2] | 0) != 0) {
  _gsl_block_free(HEAP32[$1 + 16 >> 2] | 0);
 }
 _free($1);
 STACKTOP = sp;
 return;
}
function ___DOUBLE_BITS712($__f) {
 $__f = +$__f;
 var $__u = 0, $4 = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $__u = sp | 0;
 HEAPF64[$__u >> 3] = $__f;
 $4 = $__u;
 STACKTOP = sp;
 return (tempRet0 = HEAP32[$4 + 4 >> 2] | 0, HEAP32[$4 >> 2] | 0) | 0;
}
function _oe_exit($i) {
 $i = $i | 0;
 var $1 = 0;
 $1 = HEAP32[3164] | 0;
 if (($1 | 0) != 0) {
  _fclose($1 | 0) | 0;
  HEAP32[3164] = 0;
 }
 if (($i | 0) == 0) {
  _exit($i | 0);
 }
 _MessageBox(0, HEAP32[2408 + ($i << 2) >> 2] | 0, 7312, 0) | 0;
 _exit($i | 0);
}
function _bitshift64Shl(low, high, bits) {
 low = low | 0;
 high = high | 0;
 bits = bits | 0;
 if ((bits | 0) < 32) {
  tempRet0 = high << bits | (low & (1 << bits) - 1 << 32 - bits) >>> 32 - bits;
  return low << bits;
 }
 tempRet0 = low << bits - 32;
 return 0;
}
function _bitshift64Lshr(low, high, bits) {
 low = low | 0;
 high = high | 0;
 bits = bits | 0;
 if ((bits | 0) < 32) {
  tempRet0 = high >>> bits;
  return low >>> bits | (high & (1 << bits) - 1) << 32 - bits;
 }
 tempRet0 = 0;
 return high >>> bits - 32 | 0;
}
function _reset_arrester($ptr) {
 $ptr = $ptr | 0;
 HEAPF64[$ptr + 8 >> 3] = +HEAPF64[$ptr + 24 >> 3];
 HEAPF64[$ptr + 144 >> 3] = 0.0;
 HEAP32[$ptr + 152 >> 2] = 0;
 _memset($ptr + 48 | 0, 0, 40) | 0;
 _memset($ptr + 96 | 0, 0, 24) | 0;
 return;
}
function copyTempFloat(ptr) {
 ptr = ptr | 0;
 HEAP8[tempDoublePtr] = HEAP8[ptr];
 HEAP8[tempDoublePtr + 1 | 0] = HEAP8[ptr + 1 | 0];
 HEAP8[tempDoublePtr + 2 | 0] = HEAP8[ptr + 2 | 0];
 HEAP8[tempDoublePtr + 3 | 0] = HEAP8[ptr + 3 | 0];
}
function _gsl_blas_dscal($alpha, $X) {
 $alpha = +$alpha;
 $X = $X | 0;
 var $2 = 0, sp = 0;
 sp = STACKTOP;
 $2 = $X;
 _cblas_dscal(HEAP32[$2 >> 2] | 0, $alpha, HEAP32[$2 + 8 >> 2] | 0, HEAP32[$2 + 4 >> 2] | 0);
 STACKTOP = sp;
 return;
}
function _gsl_root_fsolver_free($s) {
 $s = $s | 0;
 var $1 = 0, sp = 0;
 sp = STACKTOP;
 $1 = $s;
 if (($1 | 0) != 0) {
  _free(HEAP32[$1 + 32 >> 2] | 0);
  _free($1);
  STACKTOP = sp;
  return;
 } else {
  STACKTOP = sp;
  return;
 }
}
function _gsl_permutation_free($p) {
 $p = $p | 0;
 var $1 = 0, sp = 0;
 sp = STACKTOP;
 $1 = $p;
 if (($1 | 0) != 0) {
  _free(HEAP32[$1 + 4 >> 2] | 0);
  _free($1);
  STACKTOP = sp;
  return;
 } else {
  STACKTOP = sp;
  return;
 }
}
function _gsl_block_int_free($b) {
 $b = $b | 0;
 var $1 = 0, sp = 0;
 sp = STACKTOP;
 $1 = $b;
 if (($1 | 0) != 0) {
  _free(HEAP32[$1 + 4 >> 2] | 0);
  _free($1);
  STACKTOP = sp;
  return;
 } else {
  STACKTOP = sp;
  return;
 }
}
function dynCall_iiiiii(index, a1, a2, a3, a4, a5) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 a3 = a3 | 0;
 a4 = a4 | 0;
 a5 = a5 | 0;
 return FUNCTION_TABLE_iiiiii[index & 3](a1 | 0, a2 | 0, a3 | 0, a4 | 0, a5 | 0) | 0;
}
function _gsl_block_free($b) {
 $b = $b | 0;
 var $1 = 0, sp = 0;
 sp = STACKTOP;
 $1 = $b;
 if (($1 | 0) != 0) {
  _free(HEAP32[$1 + 4 >> 2] | 0);
  _free($1);
  STACKTOP = sp;
  return;
 } else {
  STACKTOP = sp;
  return;
 }
}
function _gsl_blas_dnrm2($X) {
 $X = $X | 0;
 var $1 = 0, $11 = 0.0, sp = 0;
 sp = STACKTOP;
 $1 = $X;
 $11 = +_cblas_dnrm2(HEAP32[$1 >> 2] | 0, HEAP32[$1 + 8 >> 2] | 0, HEAP32[$1 + 4 >> 2] | 0);
 STACKTOP = sp;
 return +$11;
}
function _free_bezier_fit($b) {
 $b = $b | 0;
 var $2 = 0, $8 = 0;
 $2 = HEAP32[$b + 24 >> 2] | 0;
 if (($2 | 0) != 0) {
  _free($2);
 }
 $8 = HEAP32[$b + 28 >> 2] | 0;
 if (($8 | 0) == 0) {
  return;
 }
 _free($8);
 return;
}
function dynCall_iiiidd(index, a1, a2, a3, a4, a5) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 a3 = a3 | 0;
 a4 = +a4;
 a5 = +a5;
 return FUNCTION_TABLE_iiiidd[index & 3](a1 | 0, a2 | 0, a3 | 0, +a4, +a5) | 0;
}
function _strcpy(pdest, psrc) {
 pdest = pdest | 0;
 psrc = psrc | 0;
 var i = 0;
 do {
  HEAP8[pdest + i | 0] = HEAP8[psrc + i | 0];
  i = i + 1 | 0;
 } while (HEAP8[psrc + (i - 1) | 0] | 0);
 return pdest | 0;
}
function ___FLOAT_BITS711($__f) {
 $__f = +$__f;
 var $__u = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8 | 0;
 $__u = sp | 0;
 HEAPF32[$__u >> 2] = $__f;
 STACKTOP = sp;
 return HEAP32[$__u >> 2] | 0;
}
function ___udivdi3($a$0, $a$1, $b$0, $b$1) {
 $a$0 = $a$0 | 0;
 $a$1 = $a$1 | 0;
 $b$0 = $b$0 | 0;
 $b$1 = $b$1 | 0;
 var $1$0 = 0;
 $1$0 = ___udivmoddi4($a$0, $a$1, $b$0, $b$1, 0) | 0;
 return $1$0 | 0;
}
function _i64Subtract(a, b, c, d) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 d = d | 0;
 var h = 0;
 h = b - d >>> 0;
 h = b - d - (c >>> 0 > a >>> 0 | 0) >>> 0;
 return (tempRet0 = h, a - c >>> 0 | 0) | 0;
}
function dynCall_viiii(index, a1, a2, a3, a4) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 a3 = a3 | 0;
 a4 = a4 | 0;
 FUNCTION_TABLE_viiii[index & 1](a1 | 0, a2 | 0, a3 | 0, a4 | 0);
}
function _i64Add(a, b, c, d) {
 a = a | 0;
 b = b | 0;
 c = c | 0;
 d = d | 0;
 var l = 0;
 l = a + c >>> 0;
 return (tempRet0 = b + d + (l >>> 0 < a >>> 0 | 0) >>> 0, l | 0) | 0;
}
function _GSL_MIN_DBL($a, $b) {
 $a = +$a;
 $b = +$b;
 var $1 = 0.0, $2 = 0.0, $11 = 0.0;
 $1 = $a;
 $2 = $b;
 if ($1 < $2) {
  $11 = $1;
 } else {
  $11 = $2;
 }
 return +$11;
}
function _restore_customer_time_step($ptr) {
 $ptr = $ptr | 0;
 var $4 = 0;
 $4 = $ptr + 56 | 0;
 HEAPF64[$4 >> 3] = +HEAPF64[300] / +HEAPF64[96] * +HEAPF64[$4 >> 3];
 return;
}
function _change_customer_time_step($ptr) {
 $ptr = $ptr | 0;
 var $4 = 0;
 $4 = $ptr + 56 | 0;
 HEAPF64[$4 >> 3] = +HEAPF64[96] / +HEAPF64[300] * +HEAPF64[$4 >> 3];
 return;
}
function dynCall_iiii(index, a1, a2, a3) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 a3 = a3 | 0;
 return FUNCTION_TABLE_iiii[index & 1](a1 | 0, a2 | 0, a3 | 0) | 0;
}
function _zero_pole_injection($ptr) {
 $ptr = $ptr | 0;
 _gsl_vector_set_zero(HEAP32[$ptr + 24 >> 2] | 0);
 _gsl_vector_set_zero(HEAP32[$ptr + 32 >> 2] | 0);
 return;
}
function _strchr($s, $c) {
 $s = $s | 0;
 $c = $c | 0;
 var $1 = 0;
 $1 = ___strchrnul($s, $c) | 0;
 return ((HEAP8[$1] | 0) == ($c & 255) << 24 >> 24 ? $1 : 0) | 0;
}
function stackAlloc(size) {
 size = size | 0;
 var ret = 0;
 ret = STACKTOP;
 STACKTOP = STACKTOP + size | 0;
 STACKTOP = STACKTOP + 7 & -8;
 return ret | 0;
}
function setThrew(threw, value) {
 threw = threw | 0;
 value = value | 0;
 if ((__THREW__ | 0) == 0) {
  __THREW__ = threw;
  threwValue = value;
 }
}
function dynCall_iii(index, a1, a2) {
 index = index | 0;
 a1 = a1 | 0;
 a2 = a2 | 0;
 return FUNCTION_TABLE_iii[index & 1](a1 | 0, a2 | 0) | 0;
}
function _strlen(ptr) {
 ptr = ptr | 0;
 var curr = 0;
 curr = ptr;
 while (HEAP8[curr] | 0) {
  curr = curr + 1 | 0;
 }
 return curr - ptr | 0;
}
function _tolower(chr) {
 chr = chr | 0;
 if ((chr | 0) < 65) return chr | 0;
 if ((chr | 0) > 90) return chr | 0;
 return chr - 65 + 97 | 0;
}
function _reset_ground($ptr) {
 $ptr = $ptr | 0;
 _memset($ptr + 40 | 0, 0, 32) | 0;
 HEAPF64[$ptr + 16 >> 3] = +HEAPF64[$ptr >> 3];
 return;
}
function dynCall_ddi(index, a1, a2) {
 index = index | 0;
 a1 = +a1;
 a2 = a2 | 0;
 return +FUNCTION_TABLE_ddi[index & 3](+a1, a2 | 0);
}
function _reset_insulator($ptr) {
 $ptr = $ptr | 0;
 _memset($ptr + 24 | 0, 0, 16) | 0;
 _memset($ptr + 48 | 0, 0, 20) | 0;
 return;
}
function b3(p0, p1, p2, p3, p4) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 p4 = p4 | 0;
 abort(3);
 return 0;
}
function _update_arrester_history($ptr) {
 $ptr = $ptr | 0;
 HEAPF64[$ptr + 112 >> 3] = +HEAPF64[$ptr + 104 >> 3];
 return;
}
function b2(p0, p1, p2, p3, p4) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = +p3;
 p4 = +p4;
 abort(2);
 return 0;
}
function _strrchr($s, $c) {
 $s = $s | 0;
 $c = $c | 0;
 return ___memrchr($s, $c, (_strlen($s | 0) | 0) + 1 | 0) | 0;
}
function _restore_line_time_step($ptr) {
 $ptr = $ptr | 0;
 HEAP32[$ptr + 16 >> 2] = HEAP32[$ptr + 12 >> 2];
 return;
}
function dynCall_ii(index, a1) {
 index = index | 0;
 a1 = a1 | 0;
 return FUNCTION_TABLE_ii[index & 1](a1 | 0) | 0;
}
function dynCall_vi(index, a1) {
 index = index | 0;
 a1 = a1 | 0;
 FUNCTION_TABLE_vi[index & 255](a1 | 0);
}
function _rest_of_line() {
 var $1 = 0;
 $1 = _strtok(0, 2520) | 0;
 HEAP32[2880] = $1;
 return $1 | 0;
}
function _reset_assignments() {
 HEAP32[3208] = 1;
 HEAP32[3210] = 1;
 HEAP32[3212] = 1;
 return 0;
}
function b8(p0, p1, p2, p3) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 p3 = p3 | 0;
 abort(8);
}
function _reset_customer($ptr) {
 $ptr = $ptr | 0;
 _memset($ptr + 8 | 0, 0, 40) | 0;
 return;
}
function _reset_capacitor($ptr) {
 $ptr = $ptr | 0;
 HEAPF64[$ptr + 16 >> 3] = 0.0;
 return;
}
function _reset_inductor($ptr) {
 $ptr = $ptr | 0;
 HEAPF64[$ptr + 24 >> 3] = 0.0;
 return;
}
function b5(p0, p1, p2) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 p2 = p2 | 0;
 abort(5);
 return 0;
}
function _gsl_root_fsolver_x_upper($s) {
 $s = $s | 0;
 return +(+HEAPF64[$s + 24 >> 3]);
}
function _gsl_root_fsolver_x_lower($s) {
 $s = $s | 0;
 return +(+HEAPF64[$s + 16 >> 3]);
}
function _reset_meter($ptr) {
 $ptr = $ptr | 0;
 HEAPF64[$ptr + 16 >> 3] = 0.0;
 return;
}
function _gsl_root_fsolver_root($s) {
 $s = $s | 0;
 return +(+HEAPF64[$s + 8 >> 3]);
}
function _scalbnl($x, $n) {
 $x = +$x;
 $n = $n | 0;
 return +(+_scalbn($x, $n));
}
function dynCall_v(index) {
 index = index | 0;
 FUNCTION_TABLE_v[index & 1]();
}
function b7(p0, p1) {
 p0 = p0 | 0;
 p1 = p1 | 0;
 abort(7);
 return 0;
}
function b4(p0, p1) {
 p0 = +p0;
 p1 = p1 | 0;
 abort(4);
 return 0.0;
}
function setTempRet9(value) {
 value = value | 0;
 tempRet9 = value;
}
function setTempRet8(value) {
 value = value | 0;
 tempRet8 = value;
}
function setTempRet7(value) {
 value = value | 0;
 tempRet7 = value;
}
function setTempRet6(value) {
 value = value | 0;
 tempRet6 = value;
}
function setTempRet5(value) {
 value = value | 0;
 tempRet5 = value;
}
function setTempRet4(value) {
 value = value | 0;
 tempRet4 = value;
}
function setTempRet3(value) {
 value = value | 0;
 tempRet3 = value;
}
function setTempRet2(value) {
 value = value | 0;
 tempRet2 = value;
}
function setTempRet1(value) {
 value = value | 0;
 tempRet1 = value;
}
function setTempRet0(value) {
 value = value | 0;
 tempRet0 = value;
}
function _usage() {
 _puts(264) | 0;
 _puts(176) | 0;
 _exit(1);
}
function _atof($s) {
 $s = $s | 0;
 return +(+_strtod($s, 0));
}
function stackRestore(top) {
 top = top | 0;
 STACKTOP = top;
}
function b0(p0) {
 p0 = p0 | 0;
 abort(0);
 return 0;
}
function stackSave() {
 return STACKTOP | 0;
}
function b1(p0) {
 p0 = p0 | 0;
 abort(1);
}
function b6() {
 abort(6);
}

// EMSCRIPTEN_END_FUNCS
  var FUNCTION_TABLE_ii = [b0,b0];
  
  var FUNCTION_TABLE_vi = [b1,b1,_inject_source,b1,_print_arrester_data,b1,_inject_line_iphase,b1,_print_customer_data,b1,_update_customer_history,b1,_reset_ground,b1,_update_arrester_history,b1,_change_ground_time_step,b1,_restore_capacitor_time_step,b1,_inject_ground,b1,_inject_inductor_history,b1,_find_monitor_links,b1,_insulator_answers_cleanup,b1,_reset_arrbez
  ,b1,_zero_pole_injection,b1,_restore_arrbez_time_step,b1,_print_source_data,b1,_inject_pole_imode,b1,_reset_lpm,b1,_check_lpm,b1,_restore_arrester_time_step,b1,_update_arrbez_history,b1,_reset_capacitor,b1,_reset_arrester,b1,_inject_capacitor_history,b1,_reset_meter,b1,_check_insulator,b1,_arrbez_answers_cleanup,b1,_update_capacitor_history
  ,b1,_arrester_answers_cleanup,b1,_inject_line_imode,b1,_check_ground,b1,_change_customer_time_step,b1,_update_inductor_history,b1,_change_capacitor_time_step,b1,_change_inductor_time_step,b1,_reset_customer,b1,_check_arrester,b1,_reset_insulator,b1,_print_insulator_data,b1,_inject_surge,b1,_inject_steepfront,b1,_print_arrbez_data,b1,_lpm_answers_cleanup
  ,b1,_restore_line_time_step,b1,_init_capacitor_history,b1,_update_line_history,b1,_solve_pole,b1,_change_arrbez_time_step,b1,_print_lpm_data,b1,_init_line_history,b1,_triang_pole,b1,_restore_ground_time_step,b1,_calc_pole_vmode,b1,_pipegap_answers_cleanup,b1,_reset_inductor,b1,_update_vmode_and_history,b1,_inject_pipegap,b1,_change_arrester_time_step
  ,b1,_update_monitor_summary,b1,_update_monitor_pts,b1,_change_line_time_step,b1,_update_meter_peaks,b1,_restore_inductor_time_step,b1,_inject_arrester,b1,_restore_customer_time_step,b1,_init_inductor_history,b1,_print_meter_data,b1,_check_pipegap,b1,_print_pipegap_data,b1,b1,b1,b1,b1,b1,b1,b1
  ,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1
  ,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1
  ,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1
  ,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1,b1];
  
  var FUNCTION_TABLE_iiiidd = [b2,b2,_brent_init,b2];
  
  var FUNCTION_TABLE_iiiiii = [b3,b3,_brent_iterate,b3];
  
  var FUNCTION_TABLE_ddi = [b4,b4,_icrit_function,b4];
  
  var FUNCTION_TABLE_iiii = [b5,b5];
  
  var FUNCTION_TABLE_v = [b6,b6];
  
  var FUNCTION_TABLE_iii = [b7,b7];
  
  var FUNCTION_TABLE_viiii = [b8,b8];
  

  return { _strlen: _strlen, _free: _free, _main: _main, _strncpy: _strncpy, _tolower: _tolower, _memset: _memset, _malloc: _malloc, _memcpy: _memcpy, _strcpy: _strcpy, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, setThrew: setThrew, setTempRet0: setTempRet0, setTempRet1: setTempRet1, setTempRet2: setTempRet2, setTempRet3: setTempRet3, setTempRet4: setTempRet4, setTempRet5: setTempRet5, setTempRet6: setTempRet6, setTempRet7: setTempRet7, setTempRet8: setTempRet8, setTempRet9: setTempRet9, dynCall_ii: dynCall_ii, dynCall_vi: dynCall_vi, dynCall_iiiidd: dynCall_iiiidd, dynCall_iiiiii: dynCall_iiiiii, dynCall_ddi: dynCall_ddi, dynCall_iiii: dynCall_iiii, dynCall_v: dynCall_v, dynCall_iii: dynCall_iii, dynCall_viiii: dynCall_viiii };
})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_ii": invoke_ii, "invoke_vi": invoke_vi, "invoke_iiiidd": invoke_iiiidd, "invoke_iiiiii": invoke_iiiiii, "invoke_ddi": invoke_ddi, "invoke_iiii": invoke_iiii, "invoke_v": invoke_v, "invoke_iii": invoke_iii, "invoke_viiii": invoke_viiii, "_llvm_lifetime_end": _llvm_lifetime_end, "_lseek": _lseek, "_snprintf": _snprintf, "_llvm_va_end": _llvm_va_end, "_fread": _fread, "_fclose": _fclose, "_abort": _abort, "_fprintf": _fprintf, "_sqrt": _sqrt, "_printf": _printf, "_close": _close, "_pread": _pread, "_fflush": _fflush, "_fopen": _fopen, "__reallyNegative": __reallyNegative, "_fputc": _fputc, "_MessageBox": _MessageBox, "_log": _log, "_open": _open, "___setErrNo": ___setErrNo, "_fwrite": _fwrite, "___fpclassify": ___fpclassify, "_fseek": _fseek, "_send": _send, "_write": _write, "_fputs": _fputs, "_exit": _exit, "_sprintf": _sprintf, "_rewind": _rewind, "_isspace": _isspace, "_sysconf": _sysconf, "_read": _read, "_copysign": _copysign, "__formatString": __formatString, "_vfprintf": _vfprintf, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_recv": _recv, "_llvm_pow_f64": _llvm_pow_f64, "_fileno": _fileno, "_cos": _cos, "_pwrite": _pwrite, "_puts": _puts, "_fsync": _fsync, "_fabs": _fabs, "___errno_location": ___errno_location, "_fmod": _fmod, "_llvm_lifetime_start": _llvm_lifetime_start, "_mkport": _mkport, "_hypot": _hypot, "_sbrk": _sbrk, "_exp": _exp, "_time": _time, "__exit": __exit, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "_stderr": _stderr, "_stdout": _stdout }, buffer);
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var _strncpy = Module["_strncpy"] = asm["_strncpy"];
var _tolower = Module["_tolower"] = asm["_tolower"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _strcpy = Module["_strcpy"] = asm["_strcpy"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_iiiidd = Module["dynCall_iiiidd"] = asm["dynCall_iiiidd"];
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
var dynCall_ddi = Module["dynCall_ddi"] = asm["dynCall_ddi"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];

Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };

// TODO: strip out parts of this we do not need

//======= begin closure i64 code =======

// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */

var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };


  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.

    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };


  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.


  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};


  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }

    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };


  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };


  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };


  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }

    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }

    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));

    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };


  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.


  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;


  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);


  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);


  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);


  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);


  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);


  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);


  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };


  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };


  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (this.isZero()) {
      return '0';
    }

    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }

    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));

    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);

      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };


  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };


  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };


  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };


  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };


  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };


  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };


  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };


  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }

    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }

    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };


  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };


  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };


  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }

    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }

    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }

    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));

      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);

      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }

      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }

      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };


  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };


  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };


  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };


  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };


  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };


  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };

  //======= begin jsbn =======

  var navigator = { appName: 'Modern Browser' }; // polyfill a little

  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/

  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */

  // Basic JavaScript BN library - subset useful for RSA encryption.

  // Bits per digit
  var dbits;

  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);

  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }

  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }

  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.

  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }

  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);

  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;

  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }

  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }

  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }

  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }

  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }

  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }

  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }

  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }

  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }

  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }

  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }

  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }

  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }

  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }

  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }

  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }

  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }

  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }

  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;

  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }

  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }

  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }

  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }

  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }

  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;

  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }

  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }

  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;

  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;

  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);

  // jsbn2 stuff

  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }

  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }

  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }

  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }

  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }

  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }

  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;

  //======= end jsbn =======

  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();

//======= end closure i64 code =======



// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
      Module.printErr('pre-main prep time: ' + (Date.now() - preloadStartTime) + ' ms');
    }

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.';

  throw 'abort() at ' + stackTrace() + extra;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


// run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}

//  Module.FS = FS;  
//  return Module;
//}



