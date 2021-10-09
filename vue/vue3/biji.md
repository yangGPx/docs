# Vue3学习

1. 使用Vite 创建项目

   ```js
   文档： https://vitejs.cn/
   
   命令： yarn create @vitejs/app
   ```

   

2. 新创建的项目 vue2 和 vue3的区别

   1. Vue3 的Template支持多个根标签，Vue2只能一个

   2. Vue3  实例化为createApp() ，而Vue2是new Vue({})

      ```js
      === Vue3 ===
      import { createApp } from 'vue'
      import App from './App.vue'
      
      createApp(App).moute('#app')
      
      === Vue2 ===
      import Vue from 'vue'
      import App from './App.vue'
      
      new Vue({
          render: h => h(App)
      }).$moute('#app')
      ```

3. vue-router的使用

   1. vue3需要使用vue-router4以上的版本，首先先查一下vue-router最新版本

   ```js
   npm info vue-router versions 查看所有版本 目前最新是4.0.7
   ```

   2. 安装最新版本

   ```js
   yarn add vue-router@4.0.7
   ```

   3. 将main.js 改为main.ts ，这样可以IDE可以检查我们初始化是否正确，但会报错，因为TypeScript不能识别vue文件。我们可以在src目录下创建一个shims-vue.d.ts文件，声明Vue文件。

   ```js
   参考问答： https://github.com/vuejs/vue-next-webpack-preview/issues/5
   
   
   ```

   4. 初始化vue-router ,

   ```js
   import { createWebHistory, creawteRouter } from 'vue-router'
   1. 创建一个history
   	const history = createWebHistory(); 也可以用hash模式， createWebHashHistory
   2. 创建一个router
       const router = createRouter({
           history,
        routes: [
               { path: '/x1', component: Test1 },
               { path: '/x2', component: Test2 },
           ]
       })
   3. app.use(router)
   4. router-view 和 router-link 
     <div>
      <router-link to="x1">Test1</router-link> | 
      <router-link to="x2">Test2</router-link>
     </div>
     <router-view />
          
          
   用Ts的好处： Vscode会提示你有什么参数，以及按住ctrl点击函数 可以跳转到源文件，查看参数以及类型
   ```
   
   5. 创建Home.vue 和 Doc.vue
   
   6. 同级子组件之间通信，可以将值放在父组件，然后用provide 和 inject 来通信,
   
      provide标记某值可以被子组件接收，inject接受父组件通过Provide传出来的值
   
   7. ref: **接一个内部值**并返回一个**响应式且可变的 ref 对象**。ref 对象具有指向内部值的单个 property `.value`。
   
      ```js
      ====父组件===
      import { provide }     from 'vue'
          
      export default{
      	name: 'father'，
          setup() {
              const a = Ref(false);
              
              provide('key', a)
          }
      }
      
      === 子组件 ===
      import { inject } from 'vue'
      export default{
          name: 'son',
          setup() {
              const a = inject('key'); 这里注意a是Ref对象，并不是一个boolean
              
              const value = a.value a.value才取到值
              
              const setA = () => {
                  a.value = ! a.value;
              }
              
              return {setA, a} template要用的就导出
          }
      }
      
      ```
   
8. 创建Switch组件，用到两个Vue3的知识点

   1. vue3的新v-model 代替 之前的v-model 和  .sync，

      ```js
      <Switch :value="switchValue" @update:value="switchValue = $event"/>
      
      ====== vue3 ======
      <Switch v-model:value="switchValue"/>
          
      ====== vue2 ======
      <Switch :value.sync="switchValue"/>
      ```

   2. 新增 context.emit， 与this.$emit （在setup不能用，在methods用，但methods基本在vue3几乎不用）相同

      ```js
      Switch.vue内
      
      setup(props, context) {
          const toggle = () => {
          	context.emit('update:value', !props.value)    
          }
          return { toggle }
      }
      ```

5. 区别: vue3组件调用时，会默认将组件上的属性绑定到组件内部的根元素上

   ```js
   ======vue3======
   <s-button @click="xxx" @hover="xxx" theme="default">按钮</s-button>
   
   s-button组件内部 不需要自己绑定，vue3会默认绑定所有的传入的属性在根元素上
   <button><slot /></button>
       
   
   ====== vue2 =====
   <s-button @click="xxx">按钮</s-button>
   
   s-button组件内部  需要自己绑定
   <button @click="$emit('click')" @click="$emit('hover')"><slot /></button>
   ```

   1. 如果不想vue3默认绑定，可以用inheriAttrs: false

      ```js
      export default{
          inheriAttrs: false
      }
      ```

   2. 如果想其他地方也全部绑定属性，可以用$attrs

      ```js
      <template>
          <div>
          	<button v-bind="$attrs"> </button>
          </div>
      </template>
      ```

   3. 如果想在函数中调用，可以用context.attrs

      ```js
      setup(props, context) {
          const { click, ...xxx } = context.attrs; // es6语法
      }
      
      
      ```

6. Es6语法,对象的key可以用变量

   ```js
   { [`${key}-xxx`]: 123 }
   
   例子
   var a = '123'
   var b = { ['x-'+a]: 123 }
   
   log(b) === > {'x-123': 123}
   ```

7. 组件 css 最小影响原则：UI库组件内的css独立，不依赖外界的css, 不能影响使用者的css

   1. 需要单独去除浏览器默认样式
   2. 起名的时候加上前缀
   3. 不适用scoped，因为[v-xxx]的hash码的约束

8. Teleport

9. 具名插槽

10. createApp , h ,mount , unmount jsx

11. watchEffect:  为了根据响应式状态*自动应用*和*重新应用*副作用，我们可以使用 `watchEffect` 方法。 ref包裹的值变化，该函数就执行。在onMounted执行前就执行了，所以为了能够访问到根据数据变化执行的Doc结构，可以在onMounted执行watchEffect

12. vue3中为了v-for中的ref更加灵活，用函数获取ref

