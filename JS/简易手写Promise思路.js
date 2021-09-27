js

const pending = 'PENDING'
const fulfilled = 'FULFILLED'
const rejected = 'REJECTED'
class MyPromise {


constructor(fn) {
    this.state = pending,


    this.value = undefined,
    this.reason = undefined;


    this.onResolveCallBacks = []
    this.onRejectCallBacks = []


    let resolve = (value) => {
        if (this.state === pending) {
            this.state = fulfilled
            this.value = value
            this.onResolveCallBacks.forEach(fn => fn())
        }
    }


    let reject = (reason) => {
        if (this.state === pending) {
            this.state = rejected
            this.reason = reason
            this.onRejectCallBacks.forEach(fn => fn())
        }
    }

    try {
        fn(resolve, reject)
    } catch (err) {
        reject(err)
    }

    
}

    then = (onResolve, onReject) => {

        if (this.state === fulfilled) {
            onResolve(this.value)
        }

        if (this.state === rejected) {
            onReject(this.reason)
        }

        if (this.state === pending) {
            this.onRejectCallBacks.push(() => onReject(this.reason))
            this.onResolveCallBacks.push(() => onResolve(this.value))
        }
    }
}







const p1 = new MyPromise((resolve, reject) => {
 setTimeout(() => {
 resolve('成功')
    }, 1000)
})
p1.then(res => console.log(res))