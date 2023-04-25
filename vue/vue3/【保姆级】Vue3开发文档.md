# [保姆级] Vue3 开发文档
本文来源于 https://juejin.cn/post/7220220100384407610 ，主要是为了能够尽快掌握vue3与vue2的对比，能够熟悉vue3的开发。

## hooks这个概念

hook: 系统在执行到某个阶段时，会调用该阶段注册的函数

比如声明周期函数

之前的vue2是

```js
mounted() {
    
}
```

而Vue3

```js
import { onMounted } from 'vue'
onMounted(fn)

onMounted是执行到这个阶段提供的钩子函数
而 fn就是注册的函数
```



## 写法上的不同

```html
<template>
    <div></div>
    <div></div>
</template>

<script setup>

</script>

<style></style>
```

## data
vue3没有this，像在函数里面写代码一样，有什么直接写，如果该data需要响应式，看情况用ref 或者 reactive



## 获取Dom 、组件实例 ref

1. 如果是组件的话，有什么方法想暴露给外界使用的，需要用 defineExpose 导出

   ```html
   Name.vue
   <script setup>
   	const name = ref('')
       
       function setName(name) {
           name.value = name
       }
       
       definedExpose({
           setName
       })
   </script>
   
   index.vue
   <template>
   	<Name ref="name1"/>
   </template>
   <script setup>
       import Name from 'Name.vue'
       
       const name1 = ref('') // 变量名和 ref的值要一致
       
       name.value.setName('new name')
       
   </script>
   注意： 1.接收的变量名 和 ref的值要一样；
   2. 调用时是 xxx.value.fn
   ```

   