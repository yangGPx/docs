# 引入的文件

```js
<script src="https://cdn.bootcdn.net/ajax/libs/react/17.0.2/umd/react.production.min.js"></script>
  <script src="https://cdn.bootcdn.net/ajax/libs/react-dom/17.0.2/umd/react-dom.production.min.js"></script>
<script src="https://cdn.bootcdn.net/ajax/libs/redux/4.0.0/redux.min.js"></script>
```

1.  一个最基本的组件 js  

```
let App = React.createElement('div', {
   className: 'red'
}, 1)

ReactDOM.render(App, document.querySelector('#root'))
```

1.  一个最基本的class的组件		jsx  

```
class App extends React.Component{
  constructor(){
    super()
  }
  render(){
    return (
      <div>
        1
      </div>
    )	
  }
}

ReactDOM.render(<App />, document.querySelector('#root'))
```

1.  一个最基本的function组件   jsx 



```
function App(){
  return (
    <div> 1</div>
  )
}

ReactDOM.render(<App />, document.querySelector('#root'))
```



1. 父子组件，以及怎么向组件内传值（props）



```
class Box extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      number: 0
    }
  }
  add() {
    this.setState({
      number: this.state.number+1
    })
  }
  sub() {
    this.setState({
      number: this.state.number-1
    })
   }
  render() {
    return(
      <div>
        <h1>{this.props.title || '计数器'}</h1>
        <span className="red">{this.state.number}</span>
        <button onClick={this.add.bind(this)}>+</button>
        <button onClick={this.sub.bind(this)}>-</button>
      </div>
    )
  }
}

class App extends React.Component{
  constructor(){
    super()
  }
  render() {
    return(
      <div>
        <Box title="计数器一"/>
        <Box />
      </div>
    )
  }
}

ReactDOM.render(<App />, document.querySelector('#root'))
```

1. 龟兔赛跑例子

```
function Timer(props) {
  return (<div> 
    {props.name}:
    <span style={{padding: '10px'}}>{props.time}</span>
  </div>)
}


class App extends React.Component{
  constructor() {
    super()
    let t0 = new Date();
    this.state = {
      startTime: t0.getTime(),
      time1: 0,
      time2: 0
    }
  }
  success1() {
    let endTime = new Date();
    this.setState({
      time1: endTime.getTime() - this.state.startTime
    })
  }
  success2() {
    let endTime = new Date();
    this.setState({
      time2:endTime.getTime() - this.state.startTime
    })
  }
  render() {
    return (
      <div>
        <div className="title">
          <Timer name="兔" time={this.state.time1}/> VS <Timer name="龟" time={this.state.time2}/>
        </div>
        <Progress name="兔" speed={10} success={this.success1.bind(this)}/>
        <Progress name="龟" speed={5} success={this.success2.bind(this)}/>
      </div>
    )
  }
}

class Progress extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      progress: 0
    }
    let timeId = window.setInterval(() => {
       let speed = this.props.speed || 10;
      this.setState({
        progress: speed + this.state.progress
      })
      if(this.state.progress >= 100) {
        window.clearInterval(timeId);
       
        if (typeof this.props.success === 'function') {
          this.props.success();
        }
        console.log(`${this.props.name}已经完成`)
      }
    }, 1000)
  }
  get pStyle() {
    return {
      transform: `translateX(${this.state.progress}%)`
    }
  }
  render() {
    return (
      <div className="progress">
        <h2 style={this.pStyle}>{this.props.name}</h2>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.querySelector('#root'))
```

## eventHub

```js
var money = {
  amount: 100000
}

const eventList = {}

const x = {
  init() {
    eventHub.on('我想花钱', (data) => {
      money.amount -= data;
      render();
    })
  }
}


let eventHub = {
  trigger(eventName, data) {
    if(eventList[eventName] instanceof Array) {
      eventList[eventName].forEach((fn) => {
        if(typeof fn === 'function') {
          fn(data);
        }
      })
    }
  },
  on(eventName, fn) {
    if(!(eventList[eventName] instanceof Array)) {
      eventList[eventName] = []
    }
    eventList[eventName].push(fn);
  }
}

class App extends React.Component{
  constructor() {
    super();
    this.state = {
      money: money
    };
    x.init()
  }
  render() {
    return(
      <div className="app">
        <BigPapa money={ this.state.money }/>
        <YoungPapa money={ this.state.money }/>
      </div>
    )
  }
}


class BigPapa extends React.Component {
  constructor() {
    super()
  }
  render() {
    return(
      <div className="papa">
        <div className="title">BigPapa {this.props.money.amount}</div>
        <Son1 money={ this.props.money }/>
        <Son2 money={ this.props.money }/>
      </div>
    )
  }
}

class YoungPapa extends React.Component {
  constructor() {
    super()
    this.state = {
      money: money
    }
  }
  render() {
    return(
      <div className="papa">
        <div className="title">YoungPapa {this.props.money.amount}</div>
        <Son3 money={ this.props.money }/>
        <Son4 money={ this.props.money }/>
      </div>
    )
  }
}


class Son1 extends React.Component {
  constructor() {
    super()
  }
  render() {
    return (
      <div> Son1 {this.props.money.amount}</div>
    )
  }
}
class Son2 extends React.Component {
  constructor() {
    super()
  }
  render() {
    return (
      <div> Son2 {this.props.money.amount}</div>
    )
  }
}
class Son3 extends React.Component {
  constructor() {
    super()
  }
  test() {
    eventHub.trigger('我想花钱', 100)
  }
  render() {
    return (
      <div> Son3 {this.props.money.amount} 
        <button onClick={this.test.bind(this)}>花钱</button>
      </div>
    )
  }
}
class Son4 extends React.Component {
  constructor() {
    super()
  }
  render() {
    return (
      <div> Son4 {this.props.money.amount}</div>
    )
  }
}

function render() {
  ReactDOM.render(<App />, document.querySelector('#root'))
}
render()


```

# 各组件通信示例 - 结合Redux版本

```js
const reducer = (state, action) => {
  state = state || {money: { amount: 100000 }}
  switch(action.type) {
    case '我想花钱':
    return {
      money: {
        amount: state.money.amount - action.payload
      }
    };
    default: return state;
  }
}

const store = Redux.createStore(reducer)

class App extends React.Component{
  constructor(props) {
    super(props);
  }
  render() {
    return(
      <div className="app">
        <BigPapa money={ this.props.money }/>
        <YoungPapa money={ this.props.money }/>
      </div>
    )
  }
}


class BigPapa extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return(
      <div className="papa">
        <div className="title">BigPapa {this.props.money.amount}</div>
        <Son1 money={ this.props.money }/>
        <Son2 money={ this.props.money }/>
      </div>
    )
  }
}

class YoungPapa extends React.Component {
  constructor() {
    super()
  }
  render() {
    return(
      <div className="papa">
        <div className="title">YoungPapa {this.props.money.amount}</div>
        <Son3 money={ this.props.money }/>
        <Son4 money={ this.props.money }/>
      </div>
    )
  }
}


class Son1 extends React.Component {
  constructor() {
    super()
  }
  render() {
    return (
      <div> Son1 {this.props.money.amount}</div>
    )
  }
}
class Son2 extends React.Component {
  constructor() {
    super()
  }
  render() {
    return (
      <div> Son2 {this.props.money.amount}</div>
    )
  }
}
class Son3 extends React.Component {
  constructor() {
    super()
  }
  test() {
     store.dispatch({type: '我想花钱', payload: 100})
  }
  render() {
    return (
      <div> Son3 {this.props.money.amount} 
        <button onClick={() => {this.test()}}>花钱</button>
      </div>
    )
  }
}
class Son4 extends React.Component {
  constructor() {
    super()
  }
  render() {
    return (
      <div> Son4 {this.props.money.amount}</div>
    )
  }
}

function render() {
  ReactDOM.render(<App money={store.getState().money}/>, document.querySelector('#root'))
}

render()
store.subscribe(render);

```

# valina.js + redux

```js
var reduer = (state, action = {},data) => {
  console.log('收到data', data)
  state = state || 1;
  switch(action.type) {
    case 'add1': 
      console.log('add1')
      return state + ( action.payload || 0)
    default: 
      return state;
  }
}

const store = Redux.createStore((state, action,data=5)=> {
    console.log(data)
    return reduer(state, action,data)
})

function add() {
  store.dispatch({
    type: 'add1',
    payload: 1
  },1)
}

function render() {
  let html = `<div>结果显示：${store.getState()}</div>
      <div>
        <button onClick="add()">+1</button>
        <button>-1</button>
        <button>如果是奇数就加</button>
      </div>`

    document.querySelector('#root').innerHTML = html;
}

store.subscribe(render)

render()
```

