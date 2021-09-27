# vue简易框架总结

## 1. 前言
​	为了更好的理解vue，打算自己写一个vue的简易框架出来。主要是实现数据双向绑定功能。




## 2. 用法
​	写组件库或者框架之前，需要确定 要让用户怎么用，配置项怎么传入。当然这里是完全抄vue的。

```vue
<div id="App">
	{{text}}
	<p>{{text}}</p>
</div>

<script>
new Vue2({
	el: '#App',
	data: {
		text: '这是一段文字'
	}, // 暂时只能是对象
	methods: {
		xxx() {
			
		}
	}
})
</script>
```


## 3. 大概分为几部分，各部分分别做什么

![vue简易框架示意图](C:\Users\yang\Desktop\vue简易框架示意图.PNG)

​	主要是围绕上图来进行代码书写的。

1. observer： 主要是对传入的data对象进行数据劫持，利用Object.defineProperty语法。
2. compiler:    主要负责模板编译，比如 {{}}，v-html等等以及利用watcher传入视图更新函数。
3. watcher：    比较新旧值有没有变化, 触发传入的更新函数，更新视图,每一次调用data.attr就是一个watcher。
4. Dep
   1.  如果模板一复杂，watcher就会很多，如果不进行分类管理，每次改变一个属性的值，就全部触发，会消耗没必要的性能。所以需要一个Dep类，在每个值被调用的时候，就将对应的watcher添加进该key值对应的Dep。 
   2. 每一个data对象的key就对应一个Dep，只要该key对应的value改变就会触发对应的Dep,Dep就会触发管理的watcher队列。

## 4. 每一个部分怎么写？核心代码

​	要根据上面那个图来写具体代码逻辑，每一部分要负责什么内容

### 4.1  observer  监听数据变化，通知观察者

​	该部分主要是对数据进行劫持，利用Object.definedProperty 对传入的data进行监听。

```js
class Observer{
    construtor(data) {
        this.$data = data;
        this.defineRFetive(data);
    }
    defineRetive(data) {
        Object.entries(data).forEach(([key, value]) => {
            // 每一个可以对应一个Dep对象，不做值得详细校验了
            const dep = new Dep()
            Object.defineProperty(data, key, {
                get() {
                    // 在解析模板获取值的时候，创建对应的Dep
                    return value;
                },
                set(newVal) {
                    if(newVal !== value) {
                        // 触发对应的Dep 通知函数
                        console.log('数据改变了')
                    }
                }
            }
        })
    }
}


```

### 4.2  Compiler 编译模板，绑定更新函数

​	这个部分主要分两步来做

1. 编译模板，主要先把 `{{ xxx}}` 中间的内容编译出来
   1. 对根元素内的子节点进行循环遍历，判断他是文字节点或者元素节点；
   2. 如果是文字节点，直接取textContent，对内容进行正则匹配替换；
   3. 如果是元素节点，就对子节点再次遍历 一直把所有的文字节点的 `{{}} `替换完毕。
2. 编译的时候，怎么绑定更新函数，在data的值改变的时候，触发更新函数，更新模板



### 4.3  Watcher 订阅者 订阅数据变化， 触发更新函数

### 4.4  Dep  订阅器  管理data的key值对应的订阅者



## 5. 怎么把各个部分串起来










## 6. 遇到的问题



## 7. 后续优化的想法


