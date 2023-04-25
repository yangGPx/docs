# webpack 源码课总结

## 基础知识

1. node_modules的**.bin**目录是做啥的？

> #### Executables
>
> When in global mode, executables are linked into `{prefix}/bin` on Unix, or directly into `{prefix}` on Windows. Ensure that path is in your terminal's `PATH` environment to run them.
>
> When in local mode, executables are linked into `./node_modules/.bin` so that they can be made available to scripts run through npm. (For example, so that a test runner will be in the path when you run `npm test`.)

如果直接在命令行中使用webpack-cli，得

```js
node_modules/.bin/webpack
或
npx webpack

npx 会在当前目录下的./node_modules/.bin里去查找是否有可执行的命令，没有找到的话再从全局里查找是否有安装对应的模块，全局也没有的话就会自动下载对应的模块，如上面的 create-react-app，npx 会将 create-react-app 下载到一个临时目录，用完即删，不会占用本地资源。
```

而在package.json中scripts可以直接写 webpack, 这就是.bin的作用。

babel官网 [@babel/parser模块](https://www.babeljs.cn/docs/babel-parser) 也是很大程度上依赖了[acorn](https://github.com/acornjs/acorn)

>  Heavily based on [acorn](https://github.com/marijnh/acorn) and [acorn-jsx](https://github.com/RReverser/acorn-jsx) 

直接使用webpack、webpack-cli进行打包

```
1. yarn add webpack webpack-cli
2. Common-Line 
./node_modules/.bin/webpack-cli --mode=development ./project_1/index.js
```

### bundler 打包器

实现目标：

1. 转译，将一些不兼容的js语法转译为兼容性更好的语法，比如 import/export 转译为 require/module.exports ，ESModule 转为 CommonJs的语法；
2. 打包， 将多个文件打包成一个文件。

过程： code -> es5Code -> AST->  code2

利用babel一些模块，实现各个过程，在将code转为AST后, 收集文件的依赖，以及文件的es5Code，并在收集过程中，处理循环依赖这种情况（记住收集过的依赖，收集过的就不再收集）。

注意：打包器 和 打包器最后输出的文件是两个东西。

前提： 读写文件利用了nodeJs的fs,path,

1. code -> es5Code  [@babel/core](https://www.babeljs.cn/docs/babel-core)

   ```js
   babel.transformFromAstSync(ast, code, {
       presets: ['@babel/preset-env']
   })
   ```

2. code -> AST  [@babel/parser](https://www.babeljs.cn/docs/babel-parser)

   ```js
   const ast = require("@babel/parser").parse(code, {sourceType: "module"});
   ```

3. 对AST进行遍历，生成依赖列表 [@babel/traverse](https://www.babeljs.cn/docs/babel-traverse)

   ```js
   TS 依赖列表的值
   依赖列表是数组的原因： 为了可以知道顺序，入口文件放在第一个
   type DepsRelation = { key: string, deps: string[], code: string }[]
   
   import traverse from "@babel/traverse";
   
   traverse(ast, {
     enter(path) {
        // 如果该语法是 import
       if(path.node.type === 'ImportDeclaration') {
        	console.log(path.node.source.value, 'from的路径')
           // 按照设计好的依赖列表类型，收集好每一个文件
       }
     },
   });
   ```

4. 设计最后输出的文件，根据CommonJS2标准，拼接出打包后的 **dist.js**

   ```js
   require 引入并执行这个文件
   最后输出的文件格式：
   var depRelation = [
       {
           key: 'index.js',
           deps: ['a.js', 'b.js'],
           code: function (require, module, exports) {}
       }
   ]
   var modules = {} // 收集已经require过的依赖
   execute(depRelation[0].key)
function execute(key) {} //  根据key，在depRelation中找到对应项，执行它的code
   ```
   

技巧：

1. 用hash记录已打包过的文件



## 源码解析，带着问题看源码

看必定执行的代码，定义不看，只有if不看。

1. webpack-cli 是如何调用 wepack 的

   ```js
   执行这句话，webpack-cli怎么调用webpack的
   node_modules/.bin/webpack-cli --mode=development project_1/index.js
   先看.bin/webpack-cli命令 用的哪个文件，然后入口进去找，
   
   webpack = require('webpack')
   compiler = webpack(options, callback)
   ```

2. webpack 是如何分析 index.js 的

   ```js
   验证我们bundler的猜想
   
   1. 从问题1中知道了，webpack-cli如何调用webpack的，于是我们就去node_modules的webpack folder,然后看package.json的main对应的入口文件是哪一个？
   --package.json
   "main": "lib/index.js",
   
   -- lib/index.js
   const fn = lazyFunction(() => require("./webpack"));
   
   -- lib/webpack.js
   const compilers = childOptions.map(options => createCompiler(options));
   const compiler = new MultiCompiler(compilers);
   
   createCompiler()
   
   并没有找到index.js,如何执行 code - es5Code - ast - code2 这个流程
   
   发现定义了很多
   this.hooks = {
       [eventName]: new SyncHook([]),
   }
   this.hooks.eventName.xxx.call()
   
   tapable 这是 webpack 团队为了写 webpack 而写的一个事件/钩子库
   用法
   
   定义一个事件/钩子
   this.hooks.eventName = new SyncHook(["arg1", "arg2"]);
   监听一个事件/钩子
   this.hooks.eventName.tap('监听理由', fn)
   触发一个事件/钩子
   this.hooks.eventName.call('arg1', 'arg2')
   
   ```

3. webpack 的流程是怎样的？（无法直接找到webpack如何去分析打包index.js文件，转而去看webpack的流程）

   ```js
   重新回到 webpack/lib/index.js 进行分析，主要是收集触发了哪些hook（钩子）,以及主要事件
   environment
   afterEnvironment
   initialize
   beforeRun
   run
   --this.readRecords
   --this.compile(onCompiled)
   beforeCompile
   compile
   make
   finishMake
   --process.nextTick
   ----compilation.finish
   
   finishModules
   ------compilation.seal()
   seal
   beforeChunks
   ---this.addChunk
   -- buildChunkGraph(this, chunkGraphInit);
   afterChunks
   shouldRecord
   reviveModules
   beforeModuleIds
   moduleIds
   reviveChunks
   beforeChunkIds
   chunkIds
   beforeModuleHash
   -- 	this.createModuleHashes();
   afterModuleHash
   beforeCodeGeneration
   --this.codeGeneration
   afterCodeGeneration
   beforeRuntimeRequirements
   ...
   -- this.createChunkAssets
   -- cont()
   processAssets
   -- this.summarizeDependencies();
   afterSeal
   -- this.fileSystemInfo.logStatistics();
   
   afterCompile 执行传进来的callback（onCompiled）函数
   
   -- process.nextTick
   -- this.emitAssets
   -- this.emitRecords
   
   done
   ---- this.cache.storeBuildDependencies
   ------finalCallback
   afterDone
   
   收集了webpack的大概hook,以及一些流程中的主要函数，但并没有我们想要的答案
   
   我们想要的是
   code - ast - code2 的在哪里执行的，根据目前我们收集到的钩子函数，
   猜测在compile - afterCompile阶段进行了这些操作，所以我们去看他的钩子监听 xxx.tap
   ```

4. 读取 index.js 并分析和收集依赖是在哪个阶段？

   ```js
   上面收集的hooks以及主要函数，让我们大概了解了webpack的结构以及阶段，
   根据猜测，主要去查看 compile - afterCompile的钩子的tap，主要是传了callback函数的，这样才能持续完成后续的操作；
   compile
   make
   -- EntryPlugin.createDependency(entry, options); 收集依赖
   finishMake
   afterCompile
   
   我们发现 make - finishMake 之间什么代码都没有啊！只有一个类似收集依赖的函数
   
   ```

5. make - finishMake 之间，做了什么 Optimize 优化

   ```js
   compile
   --this.newCompilation(params);
   thisCompilation
   compilation
   ---- compilation.addEntry
   entryData = { 
   				dependencies: [],
   				includeDependencies: [],
   				options: {
   					name: undefined,
   					...options
   				}
   			};  // 依赖，很像我们自己定义的收集依赖函数
   
   
   -- addEntry
   -- this._addEntryItem
   addEntry
   -- this.addModuleChain
   -- this.dependencyFactories.get(Dep)
   -- this.handleModuleCreation
   -- this.factorizeModule
   ---- this.factorizeQueue.add
   ---- factory.create 找到 this.factorizeQueue的创建，发现
   ---- _factorizeModule factory  ---> this.dependencyFactories.get(Dep) tip1
   -- this.addModule
   ---- this.addModuleQueue.add
   -- this.buildModule
   ---- this.buildQueue.add
   -- this.processModuleDependencies
   ---- this.processDependenciesQueue.add
   succeedEntry
   
   任务队列知识，任务队列发现有任务会自动执行
   
   tip1
   this.dependencyFactories.get(Dep) 是个啥？
   你搜 compilation.tap 就知道，它是 normalModuleFactory，简称 nmf
   结论：factory 就是 nmf，所以 factory.create 就是 nmf.craete
   
   ```

6. nmf.create 做了什么？

```js
来到 NormalModuleFactory.js，可以看到 create 的代码
```





## Loader  和 Plugin

### Loader



### Plugin



## webpack高级配置

babel永远不要自己写，而是找文档复制

1. package.json , webpack.config.js

   ```js
   package.json 
   "scaripts": {
       "build": "webpack"
   }
   
   webpack.config.js
   module.exports = {
       mode: 'development'
   }
   ```

   

2. babel-loader  打包js, webpack5已经可以了，但babel-loader支持打包ts

   ```js
   preset pre预先 set配置 
   module: {
     rules: [
       {
         test: /\.jsx?$/,
         exclude: /(node_modules|bower_components)/,
         use: {
           loader: 'babel-loader',
           options: {
             presets: ['@babel/preset-env']
           }
         }
       }
     ]
   }
   ```

3. babel-loader 打包jsx, vue/react

   ```js
   @babel/preset-react
   
   jsDemo.jsx
   export const jsxDemo = () => <div>jsDemo</div>
   
   module: {
     rules: [
       {
         test: /\.jsx?$/,
         exclude: /(node_modules|bower_components)/,
         use: {
           loader: 'babel-loader',
           options: {
             presets: [
                 ['@babel/preset-env'],
                 ['@babel/preset-react']
             ]
           }
         }
       }
     ]
   }
   没有安装react 也没有提示
   ```

4. eslint插件 jsx插件要引入React，不引入就报错提示

   ```js
   支持 eslint，jsx里面必须引入react
   1. webstorm支持eslint检查
   2. webpack也支持eslint检查
   
   1. 创建 .eslintrx.js 文件， 初始化配置， 开启webstrome 的eslint功能
   
   2. webpack 用 EslintPlugin, google webpack 使用eslint
   在 ["@babel/preset-react", {runtime: 'classic'}]
   ```

5. babel-loader 打包 ts文件

   ```js
   改 babel-loader的正则检查
   
   加presets @babel/preset-typescript
   ```

6. ESlint支持TS

   ```
   为啥不用TSlint, 作者不想维护了，让大家用ESlint
   
   .eslintrc.js  单独对ts, tsx制定规则
   ```

   