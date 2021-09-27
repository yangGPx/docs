# Vue项目中使用TypeScript

## 前提

​		还是需要基本掌握Vue的知识，能用Vue完成需求。Vue结合TypeScript，主要是为了能够使用TypeScript的类型约束，保证代码质量。

​		TypeScript帮助IDE更好的识别错误，在编译之前IDE就会对TypeScript的问题进行警告报错，但依然编译成功。

## 使用

1. 使用@vue/cli 创建项目时，记得选上TypeScript

2. 项目的一些相关配置文件

   ```JS
   |-- tsconfig.json
   |-- src
   	|-- shims-tsx.d.ts 
   	|-- shims-vue.d.ts ts 默认只识别 .d.ts、.ts、.tsx 后缀的文件, 定义该文件主要为项目内所有的 vue 文件做模块声明，以及一些ts识别不了的文件做模块声明。（但ts引用vue文件时，依旧需要加上.vue 的文件结尾，该文件删了也能正常编译）
   ```

3. vue结合TS，用到的module

   1. vue-class-component:  是一个能够让你的vue组件使用class形式的一个库。

      文档： https://class-component.vuejs.org/

   2. vue-property-decorator:  完全依赖于vue-class-component的一个库，用法和vue-class-component基本相似，但一些用法上更加方便，能让我们更加方便使用TypeScript。

      文档： https://www.npmjs.com/package/vue-property-decorator

   ```js
   比较
   Props
   ====== vue-class-component ======  还是用vue内部的props,没有办法使用ts
   import Vue from 'Vue'
   import { Component } from 'vue-class-component'
   
   const GreetingProps = Vue.extend({
     props: {
       name: String
     }
   })
   
   // Use defined props by extending GreetingProps.
   @Component
   export default class Greeting extends GreetingProps {
       
   }
       
       
   ======== vue-property-decorator ======= 用了Prop装饰器
   import { Prop, Component } from 'vue-property-decorator'
   
   @Component
   export default class Greeting extends Vue{
       @Prop({ type: String }) name: string;
   }
   
   @Prop({options: 就是vue的props配置项}) prop名字: typeScript能够规定的类型。
   前面的options是给vue识别的, 在编译阶段检查是否出错
   后面的类型是給ts 帮助IDE识别的，这里IDE报错，也会编译成功
   ```

   所以主要都是使用vue-property-decorator。

   

4. vue + typescript的vue文件基本模板。

   ```js
   <template>
     <div>
   	不支持Ts类型检查
     </div>
   </template>
   
   <script lang="ts"> 这里注意 一定要加 lang="ts"
     import Vue from 'vue'  小知识： 项目里面多次引用Vue ，最后编译也只会引用一次，不用担心重复问题
     import { Component } from 'vue-properety-decorator'
   	
   // 也可以 import { Componet, Vue } from "vue-property-decorator"
   
     @Component	
     export default class Icon extends Vue{
         
     }
   </script>
   
   <style lang="scss" scoped>
   
   </style>
       
   
   建议: 用vscode或者webstorm，可以用snippets功能写一个快捷方式，方便以后引用。
   
   ```
5. 使用TypeScript,很重要的一个概念就是**类型** ,约束变量值的数据类型 

   文档： https://www.tslang.cn/docs/handbook/basic-types.html 

   ```js
   <script lang="ts">
     import { Componet, Vue } from "vue-property-decorator"
     ===  自定义类型 ===
     type grade = {
         '语文': number,
         '数学': number,
     }    
     type User = {
         name: string,
         age: number,
         grades: grade[]
     }
     @Component	
     export default class Icon extends Vue{
         name: string = '';
   	  age: number = 15
   	  nameList: string[] = [];
   	  types: 'success' | 'error' = 'error' 规定只能是某些值
         
         ===  自定义类型 使用 ===
         currentUser: User = {
             name: '', age: 0, graders: []
         };    
   	  userList: User[] = []
   
     }
   </script>  
   ```

   ​		有时候，一些类型是全局通用的，比如记账软件里面，记录类型是全局通用的，如果在多个文件定义，会造成类型不同意 。所以可以在**src目录**下创建 **x.ts** ,存放**全局类型**。**取x是为了说明** 该文件的名字是没有意义的，可以随便取，但一般默认将存放自定义全局类型的文件命名为 **custom.d.ts** 。



6. **vue-property-decorator** 的应用， （decorator ：装饰器）。 其他更多装饰器 可以查文档 

   1. **Prop**,在父子组件间通信时，基本都会用到props

      ```js
      注意： 是Prop，没有s
      <script lang="ts">
      	import { Prop } from 'vue-property-decorator'
      	
      	export default class Test extends Vue {
              @Prop({ default: '', require: true }) name: string; // 这里注意 不能赋值，这里赋值了，vscode是检查不出来的，但是在编译的时候，就会报错 因为Vue的props不能赋值。
          }
      </script>
      
      @Prop({这里就是vue props的options}) prop的名字: 类型；
      前面Prop内的选项配置是给Vue识别的  后面的类型 是给TypeScript识别的。
      ```

   2. **Watch** , 

      ```js
      <script lang="ts">
          import { Watch } from 'vue-property-decorator'
      	export default class Test extends Vue{
              value: string = '';
      		@Watch('value', { immediate: true}) 括号内的就是要监听的属性, 配置
      		x(newVal, oldVal) {
                  
              }
          }
      </script>
      ```

7. computed 怎么写

   ```js
   
   ```

   

8. 事件怎么写

9. 报错阶段