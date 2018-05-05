/* Simple JavaScript Inheritance
 * By John Resig https://johnresig.com/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
var EventEmitter = require('events').EventEmitter;
var Util = require('./EsUtils');

if(!global.ES){
    global.ES = {};//挂载到全局变量
}

Array.prototype.esInsertItem = function (idx,item) {
    if(idx<0 || idx > this.length){
        return 0;
    }
    this.splice(idx,0,item);
    return 1;;
};

var ES = global.ES;

var ESClassManager = {
    id:1,
    instanceId:1,
    getNewID:function () {
        return this.id++;
    },
    getNewInstanceID:function () {
        return this.instanceId++;
    }
};

(function(){
    var fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
    //fnTest的作用在于，检测函数里面是否调用了_super这个函数，/xyz/.test(function(){xyz;})作用是测试这个功能是否有用（肯定是有用得啦）

    // The base Class implementation (does nothing)
    ES.Object = function(){};//这里的Class是基类
    ES.Object.prototype._init = function () {

    };
    function defEmitterIfNotExist(obj) {
        if(!obj.___emitter){Util.esDefPri(obj,'___emitter',new EventEmitter());}
    }
    ES.Object.prototype.on = function () {
        defEmitterIfNotExist(this);
        this.___emitter.on.apply(this.___emitter,Array.prototype.slice.call(arguments));
    };
    ES.Object.prototype.once = function () {
        defEmitterIfNotExist(this);
        this.___emitter.once.apply(this.___emitter,Array.prototype.slice.call(arguments));
    };
    ES.Object.prototype.off = function () {
        defEmitterIfNotExist(this);
        this.___emitter.removeListener.apply(this.___emitter,Array.prototype.slice.call(arguments));
    };
    ES.Object.prototype.emit = function () {
        defEmitterIfNotExist(this);
        var args = Array.prototype.slice.call(arguments);
        if(!!this.__interceptor){
            this.__interceptor.emit.apply(this.__interceptor,args);
        }
        this.___emitter.emit.apply(this.___emitter,args);
        args.esInsertItem(0,"*");
        this.___emitter.emit.apply(this.___emitter,args);
    };
    ES.Object.prototype.interceptEmit = function (intercept) {
        this.__interceptor = intercept;
    };
    //创建一个新的函数对象,作为构造函数，也就是创建新类
    ES.Object.extend = function(prop) {
        var _super = this.prototype;
        //这里的this,如果是Class的直接子类，那么this指向的是ES.Class，
        //比如var Person = ES.Class.extend({});//这个时候extend函数执行的时候这里的this其实是ES.Class
        //如果var BlackPerson = Person.extend({});//这个时候extend函数执行的时候这里的this其实是Person

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        var prototype = Object.create(_super);//new this();这里John Resig的原版本是new this()，所有会有initializing来做开关变量，让prototype对象新建的时候不调用init函数
        //原型链转接，实现新类对父类的继承
        // Object.create等价于
        // var F = function () {};//定义一个函数对象
        // F.prototype = _super;
        // return new F();

        // The dummy class constructor
        var NewClass = function() {
            Object.defineProperty(prototype,'__instanceId',{
                configurable: true,
                enumerable: false,
                value: ESClassManager.getNewInstanceID(),
                writable: true
            });

            // All construction is actually done in the init method
            if (!!this._init )//新类的构造函数默认调用init成员函数,也就是new 一个对象的时候会调用init函数
                this._init.apply(this, arguments);
        };
        var classId = ESClassManager.getNewID();
        NewClass.id = classId;
        Object.defineProperty(prototype,'__pid',{
            configurable: true,
            enumerable: false,
            value: classId,
            writable: true
        });
        // Populate our constructed prototype object
        NewClass.prototype = prototype;

        // Enforce the constructor to be what we expect
        NewClass.prototype.constructor = NewClass;

        // And make this class extendable
        NewClass.extend = arguments.callee;//让新类也可以继承


        //var abstractFunc = [];

        // Copy the properties over onto the new prototype
        for (var name in prop) {//遍历prop的属性
            // Check if we're overwriting an existing function
            var isFunction = (typeof prop[name] == "function");
            var isOverride = (typeof _super[name] == "function");
            //var isOverrideAbs = (typeof _super["abc_"+name] == "function");
            var isSuperCalled = fnTest.test(prop[name]);
            //console.log("prop name:"+name+" "+isFunction+" "+isOverride+" "+isSuperCalled);
            if(isFunction && isOverride && isSuperCalled){
                var overrideCalledFn = (function(name, fn){
                        return function() {
                            //如果prop[name]属性是函数，并且，父类的原型上这个同名属性也是函数，并且prop[name]函数体里面调用了_super
                            //那么就将prototype[name]等于这个函数
                            var tmp = this._super;
                            //这里的this是新类的对象

                            // Add a new ._super() method that is the same method
                            // but on the super-class
                            this._super = _super[name];//把父类的同名函数添加为对象的_super属性
                            //console.log(">>>override func:"+name);
                            // The method only need to be bound temporarily, so we
                            // remove it when we're done executing
                            var ret = fn.apply(this, arguments);//调用prop[name],这样，在prop[name]函数体里面调用_super函数，其实调用的是父类的原型链上函数

                            this._super = tmp;//恢复this._super为调用函数之前的值

                            return ret;
                        };
                    })(name, prop[name]);
                prototype[name] = overrideCalledFn;
            }else{
                prototype[name] = prop[name];
            }

            // if(isFunction && name.indexOf('abs_') === 0){
            //     abstractFunc.push(name);
            // }
        }
        return NewClass;//返回这个函数对象作为新类
    };
})();

module.exports = ES;