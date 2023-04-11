少量代码 大量思考
看 做 练 写 忘
多看几遍

## let -> var
code -> Ast -> code2
1. 初始化模块
```
dependencies
    @babel/core
    @babel/generator
    @babel/parser
    @babel/preset-env
    @babel/traverse
devDe
    @types/babel__core
    @types/babel__traverse
    @types/generator
    @types/preset-env
    @types/node
    ts-node
    typescript
```
```
启动 node -r ts-node/register --inspect-brk let_to_var.ts 
结合Chrome开发者工具的调试 chrome://inspect
```
2. 代码
```js
import { parse } from "@babel/parser"
import traverse from "@babel/traverse"
import generate from "@babel/generator"

const code = "let a = 'let'; let b = 2"
const ast = parse(code, { sourceType: 'module' })
log(ast)

ast.program.body.forEach(item => {
    if(item.type === 'variableDeclaration' && item.kind === 'let') {
        item.kind = 'var'
    }
})


generator(ast, {}, code)
```
2. 用 chrome调试 调试node代码
3. 查看ast, VariableDeclaration

## 将代码转es5 
AST 用正侧不容易匹配替换完
自动转es5,借助插件preset-env

```js
const result = babel.transformFromAstSync(ast, code, {
    presets: ['@babel/preset-env']
})
```
利用node fs模块，读写文件，转义文件内的代码
```js
const code = fs.readFileSync('./test.js').toString()
const ast = parse(code, { sourceType: 'module' })

const result = babel.transformFromAstSync(ast, code, {
    presets: ['@babel/preset-env']
})
fs.writeFileSync('./test.es5.js', result.code)
```
## 依赖分析
例子
```
project_1/index.js
import a from './a.js'
import b from './b.js'
console.log(a.value, b.value)

project_1/a.js
const a = { value: 1 }
export default a

project_1/b.js
const b = { value: 2 }
export default b

执行deps_1.ts,打印出关系
{
    'index.js': {
        deps: ['a.js', 'b.js'],
        code: 文件源码
    }
}
```
主要是fs模块，以及ImportDeclaration 判断是不是引入依赖语句
```
deps_2.ts
import { parse } form '@babel/parser'
import traverse from '@babel/traverse'
import { readFileSync } from 'fs'
import { resolve, relative, dirname } from 'path'

// 设置根目录
const prjRoot = resolve(__dirname, 'project_1')
// 类型声明
type DepRelation = { [key: string]: { deps: string[], code: string } }
// 初始化一个空的 depRelation ,用于收集数据
const depRelation: DepRelation = {}
// 将入口文件的绝对函数传参，
collectCodeAndDeps(resolve(prjRoot, 'index.js'))

log(depRelation)

function collectCodeAndDeps(filePath) {
    // 获取传入路径的文件名
    const key = getProjectPath(filePath) 
    const code = readFileSync(filePath).toString()
    // 初始化
    depRelation[key] = { deps: [], code: code }
    // 传代码 code -> ast
    const ast = parse(code, { sourceType: 'module' })
    traverse(ast, {
        enter: (path) => {
            if(path.node.type === 'ImportDeclaration') {
                // 拼接出依赖的绝对路径
                const depAbsoultePath = resolve(dirname(filepath), path.node.source.value)
                // 转为项目路径
                const depProjectPath = getProjectPath(depAbsoultePath)
                // 把依赖写进 depRelation
                depRelation[key].deps.push(depProjectPath)
                collectCodeAndDeps(depAbsoultePath) // 递归分析嵌套依赖
            }
        }
    })
} 

function getProjectPath() {}


```
### 递归地分析嵌套依赖
一层一层往下找依赖关系，可能存在call stack风险，因为依赖层级超过1w。

### 循环依赖，导致调用栈溢出
要处理这种情况，跟递归差不多，记录已经分析过的文件，分析过的直接return就好，因为目前只是分析文件中的依赖关系，不执行代码。由于分析文件不执行代码，则叫静态分析。

## 总结
1. AST相关
2. 工具 
3. 代码技巧
使用哈希表存数据
检测Key来避免重复

4. 循环依赖
有的循环依赖可以正常执行
有的循环依赖不可以
但都可以做静态分析

最后可以分析出一个文件里面的依赖

```
depRelation: {
	'index.js': {
		deps: ['a.js', 'b.js'],
		code: `import a from './a.js'
		import b from './b.js' ...`
	},
	'a.js': {
		deps:['b.js'],
		code: '...'
	}
}
```

## AST相关

1. parse： 把代码code 变成 AST
2. traverse: 遍历ast 进行修改
3. generate： 把ast变成代码code2

## 打包器 bundler  bundle打包



浏览器不支持直接运行带有import 和 export关键字的代码，报 Uncaught SyntaxError: Cannot use import statement outside a module 错误。** 

现代浏览器可以通过 <script type="module"> 来支持import export ，但IE 8 - 15不支持import export。

```
<script type="module" scr="index.js"></script>
```

**激进的兼容策略：不支持IE,而且直接用import导致文件请求过多。**

**平缓的兼容策略：将关键字转译为普通代码，并把所有文件打包成一个文件。**

1. 转译为es5代码，把import /export变为函数；
2. 打包成一个文件。

import export 转函数，需要了解编译原理，但babel/core帮我们解决了，直接调用对应的函数就可以。

**本质上：ESModule 语法 变成了 CommonJS规则** 

1. 将全部依赖关系文件打包成一个文件
2. 将es6的import export 语法转为 common.js语法， require exports 

### 编译import export 关键字

code -> es5Code -> ast -> code2

过程用到的关键语法

```js
nodeJs 的读写
import { readFileSync } from 'fs'
import { resolve, relative, dirname } from 'path';
const code = readFileSync(filepath).toString()

code -> es5Code  把import转为require，export转为exports
 import * as babel from '@babel/core'
 const { code: es5Code } = babel.transform(code, {
    presets: ['@babel/preset-env']
  })
 
es5Code -> ast
  import { parse } from "@babel/parser"
 // 将代码转为 AST
  const ast = parse(es5Code, { sourceType: 'module' })
  
ast -> code2 
  import traverse from "@babel/traverse"
  traverse(ast, {
    enter: path => {
      if (path.node.type === 'ImportDeclaration') {
        // path.node.source.value 往往是一个相对路径，如 ./a.js，需要先把它转为一个绝对路径
        const depAbsolutePath = resolve(dirname(filepath), path.node.source.value)
        // 然后转为项目路径
        const depProjectPath = getProjectPath(depAbsolutePath)
        // 把依赖写进 depRelation
        depRelation[key].deps.push(depProjectPath)
        collectCodeAndDeps(depAbsolutePath)
      }
    }
  })  
```

1. 从入口文件出发，分析出引用到的文件的依赖；

2. 不仅分析出依赖关系，还将es5Code收集起来；

3. 参考webpack打包后的dist文件，添加一些头尾，生成最终打包出来的代码，将import export module形式改为commonJs形式

   ```js
   gtp:
   esModule 和 CommonJS 都是用于在 JavaScript 中导出和导入模块的机制，但它们的语法和行为有所不同。
   
   ES modules 是 ECMAScript 标准中定义的一种模块系统，使用 import 和 export 关键字来导入和导出模块。这种机制可以在浏览器端和 Node.js 环境下使用，支持静态分析、动态加载和 Tree-shaking 等特性。
   
   CommonJS 是 Node.js 最初采用的一种模块规范，使用 require() 和 module.exports 来导入和导出模块。相比 ES modules，它的语法更加简单直观，但不支持动态导入和 Tree-shaking。
   
   总的来说，如果你要开发运行在现代浏览器中的应用程序或库，建议使用 ES modules；如果你要编写运行在 Node.js 环境下的代码，可以使用 CommonJS 或 ES modules（Node.js 支持两种规范）；如果你需要同时支持浏览器和 Node.js 环境，可以使用打包工具将 ES modules 转换为 CommonJS 或者 AMD 规范。
   ```

   require 一个文件，就是执行一个文件的代码。

   excute 就是把某个文件的代码挂载出来，然后执行

code -> es5Code 把import/export 转为require/ exports函数。

然后转ast,对语法进行降级，因为要重新写code2, 先要转ast才能转code2，

然后转译之后，要考虑怎么把这个代码封装好，符合CommonJs2的规范，保证最后代码能够执行，

所以还需要自己加代码进行处理

#### 最终目标

对于**bunder**来说，这些都是字符串，我们要做的事拼接字符串，满足最后我们的打包目标

1. 转译文件，import/export 转为 require exports
2. 合并成一个文件，拼接字符串**generateCode**，最后写文件

打包出来需要包含

```
var depRelation = [
	{ key: 'index.js', deps: ['a.js', 'b.js'], code: function... },
	{ key: 'a.js', deps: ['b.js'], code: function... }
	{ key: 'b.js', deps: ['a.js'], code: function... }
]
code里面是key文件对应的代码
var modules = {} 缓存所有执行过的模块
excute(depRelation[0].key)
function excute(key) {
	var require = ...
	var module = ...
	var item = depRelation.find...
	item.code(require, module, module.exports) // module是以前要求要的，现在没啥用了，但还是要有
	
}
```

### 待完成

1. bundler1 code -> es5Code

code -> es5Code 的代码

```js
b.js源码
 
import a from './a.js'
const b = {
  value: 'b',
  getA: () => a.value + ' from b.js'
}
export default b

import/export 转译为 require/exports函数
b.js代码
"use strict";
Object.defineProperty(exports, "__esModule", {
  value: true
});                                       
===> const exports = { __esModule: true }
                                      
exports["default"] = void 0; 
===> const exports = { __esModule: true, default: undefined }
                                      
var _a = _interopRequireDefault(require("./a.js"));

function _interopRequireDefault(obj) { 
    return obj && obj.__esModule ? obj : { "default": obj };
}

var b = {
  value: 'b',
  getA: function getA() {
    return _a["default"].value + ' from b.js';
  }
};
                                      
var _default = b;
exports["default"] = _default;



```

已转译，接下来就是怎么打包到一个文件内，需要增加额外代码进行支持。



个人想法： import或者require就是引入并执行一个文件，最后输出export/module.exports上挂载的东西，

所以配套使用。

EsModule 和CommonJs，主要是语法和行为上的差异，语法上ESModule，是ECMAScript定义的一个一个模块系统，用import/export关键字，并支持静态分析、动态导入和TreeShaking

而CommonJs是NodeJs最初定义的一套模块系统，语法用require/module.exports 

现代浏览器支持EsModule,需要script标签内用 type="module"，IE不支持。



## Loader

上节课封装的bundler不支持css

关键： 把css转为js。js文件中共，css文件代码转为字符串，然后在写入的时候，用dom操作，添加到html文件中。

注意：css中会有属性选择器，会有双引号，如果直接用`"${code}"`反引号+双引号进行包裹的话，最后写的文件会出问题，所以用**`${JSON.stringify(code)}`**,JSON.stringify会对双引号进行转义。

```js
if(/\.css$/.test(path)) {
    code = `const str = ${JSON.stringify(code)}
		if(document) {
			const style = document.createElement('style')
			style.innerHTML = str
			document.head.appendChild(style)
}
export default str
	`
}
```

loader可以是一个函数，

css-loader 就是把上面的代码单独封装在一个文件里面，导出方法

```js
css-loader.js
const transform = code => `
	const str = ${JSON.stringify(code)}
	if(document) {
const style = document.createElement('style')
style.innerHTML = str
document.head.appendChild(style)
}
export default str
`

module.exports = transform


bundler.ts
if(/\.css$/.test(path)) {
  code = require('./css-loader.js')(code)   
}

```

 单一职责原则

webpack里每个loader只做一件事，方便组合。

而上面的代码做了两件事，第一是css->js， 第二是添加到head里面。拆分为css-loader、style-loader。但我们无法实现style-loader，因为style-loader是插入代码，需要寻找插入时机和插入位置。

如果是sassLoader,lessLoader -> cssLoader 这样过程一直是转译，但style-loader是接收到css-loader transform后的代码，并添加插入逻辑。 

拆分后的代码

```js
css-loader 
const tranform = (code) => `
	const str = ${JSON.stringify(code)}
	export default str
` 
module.exports = transform

stule-loader
const tranform = (code) => `
${code}
	if(document) {
const style = document.createElement('style')
style.innerHTML = ${JSON.stringify(code)}
document.head.appendChild(style)
}
` 
module.exports = transform

code = require('./css-loader.js')(code)
code = require('./style-loader.js')(code)
但这样的话，最后打包输出的结果

const str = "const str = \"body{color: red}\"\"
...
style.innerHTML = "const str = \"body{color: red}\"..."
输出的了多余的代码，这样就会有问题
```



## 源码 学习

不推荐直接看源码，

先想一次，大胆假设，知道大概原理，带着问题看源码。

style-loader的源码难，没看懂课程。但没必要花很多时间在这里，技术比较小众。



webpack-cli的调试

1. node 命令行窗口直接调试

   ```js
   ./node_modules/.bin/webpack-cli 对src目录进行打包
   去.bin目录看脚本命令
   对应执行的哪个文件
   自己敲的时候要加上 --mode=production
   ./node_modules/.bin/webpack-cli --mode=development
   node ./mode_modules/webpack-cli/bin/cli.js --mode=development
   ```

2. node 执行打包脚本命令对应的js文件，并用chrome进行调试

   ```js
   node --inspect-brk ./node_modules/webpack-cli/bin/cli.js
   ```

3. github下载webpack-cli的源码，用yarn link进行关联

   ```js
   1. 单独一个目录：   clone webpack-cli
   2. 设置版本：      git reset --hard webpack-cli@4.2.0
   3. 安装依赖：      yarn
   4. 到底下目录才行： cd packages/webpack-cli/
   5. 建立关联：      yanr link
   6. 然后到另一个项目用： yran link webpack-cli 进行替换
   7. 可以在下载的源代码底下的 packages/bin 去找cli.js log调试
   ```



### 看源码，带着问题看

1. 折叠所有代码;
2. 声明不看，if不看（旁支），if else 要看，要看那种铁定执行的语句;
3. 看必定会执行的代码

遵循这个规则，

1. webpack-cli怎么用webpack

```js
--- 文件 -- 方法

---cli.js 
runCLI
--- /lib/bootstrap.js
cli.run()
--- webpack-cli.js
-- run
		compiler = this.createCompiler(options, callback);
-- createCompiler
		compiler = webpack(options, callback);
```

2. webpack如何分析index.js的，分析并收集依赖，打包成一个文件

   ```js
   new 了一个 Complier，做了一堆初始化，但并没有找到怎么去分析依赖的代码
   hooks.xxx.call
   
   hooks.xxx.call 是什么？
   Tapable webpack团队为了写webpack而写的一个事件/钩子库 监听和触发事件的一个库，发布订阅系统
   
   用法：
   定义一个事件/钩子
   this.hooks.事件名 = new SyncHook(['arg1', 'arg2'])
   监听一个事件/钩子
   this.hooks.事件名.tap('监听理由', fn)
   button.on('click', fn)
   触发一个事件/钩子
   this.hooks.事件名.call('arg1', 'arg2')
   button.trigger('click', data)
   ```

3. webpack的流程是怎么样的， webpack把打包分为几个阶段（几个钩子）

   ```
   需要不断去找钩子和执行函数
   ```

4. 读取index.js 并分析和收集依赖在哪个阶段

   ```ks
   webpack只是一个架子，主要是创建了各种插件
   
   EntryPlugin
   
   很难找，性价比不高
   ```
   
   
   
   上面看源码的总结，看迷糊了，就是一直在找钩子
   
   1. 使用hooks 把主要阶段固定下来
   2. 插件自己选择阶段做事
   3. 入口是有入口插件 EntryPlugins搞定的
   4. make - compiler - compilation - entry - dep - module
   5. 目前我们分析到 factory.create这一行
   
   看源码技巧
   
   1. 没有技巧，看不懂说明水平不到
   2. 多看几遍，寻找灵感
   
   ```
   _source_ _ast_
   
   doBuild runLoaders
   ```
   
   webpack 用了 acorn第三方库来parse js
   
   
   
   先知道原理 才看得懂 源码
   
   ### webpack 装逼指南
   
   1. 阅读了webpack 源码
   2. webpack 使用 Tapable 作为事件中心，将打包分为 env,compile,make sewal,emit等阶段
   3. 在make阶段借助acorn对源码进行了parse
   
   

chunk 动态引入的模块用chunk单独一个文件，

源码暂时还是不读了，太复杂了。

### 总结

主要还是手写一个简单的打包器 这一块流程 熟悉

