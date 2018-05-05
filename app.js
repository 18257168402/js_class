var ES = require('./class/EsClass');

var SuperClass = ES.Object.extend({
    _init:function (name) {
        this.name = name;
    },
    testFunc:function () {
        console.log("SuperClass.testFunc name:"+this.name);
    }
});

var SubClass = SuperClass.extend({
    _init:function (name,age) {
        this._super(name);
        this.age = age;
    },
    testFunc:function () {
        this._super();
        console.log("SubClass.testFunc name:"+this.name+" age:"+this.age);
    }
});

var obj = new SubClass("xx",18);
obj.testFunc();

obj.on('onMessage',function (msg) {
   console.log(">>>>onMessage:"+msg);
});

var sec = 0;
setInterval(function () {
    obj.emit("onMessage","sec:"+(++sec));
},1000);