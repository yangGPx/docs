# 如何在项目中直接使用svg图片

1. 直接引入svg图片，只会直接输出 图片在页面上的路径

   ```js
   import pets from '@/assets/pets.svg'
   
   console.log(pets);
   
   =================
   控制台
   /img/pets.67de299a.svg
   ```

2. 在 shims-vue.d.ts 添加svg 的文件声明

   ```js
   declarce module '*.svg' {
       const content: 'string',
       export default content;
   }
   ```

   

3. 使用svg-sprite-loader 插件，成功识别svg图片。结合vue/cli如何添加一个loader的文档、

   ```js
   vue.config.js
   
   
   const path = require('path')
   
   module.exports = {
       chainWebpack: config => {
         const dir = path.resolve(__dirname, 'src/assets/icons')
         config.module
           .rule('svg-sprite')
           .test(/\.svg$/)
           .include.add(dir).end() //规则只包含icons目录
           .use('svg-sprite-loader')
           .loader('svg-sprite-loader')
           .options({ extract: false }/*不要解析出文件*/)
           .end()
   
           config.plugin('svg-sprite').use(require('svg-sprite-loader/plugin')), [{ pluginSprite: true }]//配置插件
           config.module.rule('svg').exclude.add(dir)//其他svg loader排除 icons目录
       }
   
     }
   ```

4. 使用svg图片

   ```js
   <svg>
     <use xlink:href="#pets"/>
   </svg>
   ```

5. 为了不用将svg图片一个一个引入，将目录整个引入，并抽离出一个ICON组件

   ```js
   <script>  
   
   let importAll = (requireContext) =>
       requireContext.keys().forEach(requireContext); 
     try {
       importAll(require.context("../assets/icons", true, /\.svg$/));
     } catch (err) {
       console.log(err);
     }
   
   </script>
   
   如果在typescript中使用
     let importAll = (requireContext: __WebpackModuleApi.RequireContext) =>
       requireContext.keys().forEach(requireContext); //这里ts语言不认识requireContext，需要明确其类型
     try {
       importAll(require.context("../assets/icons", true, /\.svg$/));
     } catch (err) {
       console.log(err);
     }
   
   requireContext: __WebpackModuleApi.RequireContext  函数参数的类型为这个
   ```

6. ICon组件

   ```js
   <template>
       <div>
           <svg>
               <use :xlink:href="`#${name}`"/>
           </svg>
       </div>
   </template>
   
   <script>
       expore default{
   		props: {
               name: {
                   type: String,
                   require: true    
               }
           }
   	}
   </script>
   ```

   