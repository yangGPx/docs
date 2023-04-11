# webpack 源码课总结

babel官网 [@babel/parser模块](https://www.babeljs.cn/docs/babel-parser) 也是很大程度上依赖了[acorn](https://github.com/acornjs/acorn)

>  Heavily based on [acorn](https://github.com/marijnh/acorn) and [acorn-jsx](https://github.com/RReverser/acorn-jsx) 

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
   
   


