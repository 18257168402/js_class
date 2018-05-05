

MpUtil = require('util');


MpUtil.esDefPri = function (self,key,value) {
    Object.defineProperty(self,key,{
        configurable: true, // 属性的描述是否可以被改变
        enumerable: false, //是否可枚举
        value: value,//值
        writable:true//值是否可写
    });
};
MpUtil.esModifyProp = function (self,key,enumerable,configurable,wirteable,value) {
    var en = enumerable;
    var conf = configurable;
    var writ = wirteable;
    var va = value;
    var oldProp  =Object.getOwnPropertyDescriptor(self,key);

    if(en===undefined){
        en = (!!oldProp)?oldProp.enumerable:true;
    }
    if(conf===undefined){
        conf = (!!oldProp)?oldProp.configurable:true;
    }
    if(writ===undefined){
        writ = (!!oldProp)?oldProp.writable:true;
    }
    if(va === undefined){
        va = (!!oldProp)?oldProp.value:undefined;
    }
    Object.defineProperty(self,key,{
        configurable: conf, // 属性的描述是否可以被改变
        enumerable: en, //是否可枚举
        value: va,//值
        writable:writ//值是否可写
    });
};

//在 descriptor 中不能同时设置访问器（get 和 set）和 wriable 或 value，否则会错，就是说想用 get 和 set，
// 就不能用 writable 或 value 中的任何一个
MpUtil.esDefGetterSetter = function (self,key,getter,setter,enumerable) {
    var enumable = (enumerable===undefined?false:enumerable);
    //console.log("esDefGetterSetter:"+enumerable);
    Object.defineProperty(self,key,{
        configurable: true, // 属性的描述是否可以被改变
        enumerable: enumable, //是否可枚举
        set: setter,//值
        get: getter//值是否可写
    });
};

/**
 * 定义一个属性propname，具有getter和setter
 * 实际使用的是toPropname属性，这个属性默认名字是propname前面加上下划线,可以配置，默认的是可枚举的
 *
 */
MpUtil.esDefProp = function (self,propname,defaultValue,opt) {
    //toPropname,gettername,settername,emitname,compFn
    if(MpUtil.isString(opt)){//opt是string则默认为是toPropname
        var name = opt;
        opt = {
            toPropname:name,
            enumable:true
        };
    }
    var toPropname = (opt===undefined?undefined:opt.toPropname);//getter setter实际使用的属性
    var gettername = (opt===undefined?undefined:opt.gettername);//getter方法名字
    var settername = (opt===undefined?undefined:opt.settername);//setter方法名字
    var emitname = (opt===undefined?undefined:opt.emitname);//属性变化的时候调用emit提示变化
    var isToPropEnumable = (opt===undefined?true:opt.enumable);
    var comp = (opt===undefined?undefined:opt.compFn);//比较函数

    if(propname === toPropname){
        throw new Error("属性名与实际使用的属性名字不能一致");
    }
    var toProp = toPropname;
    if(toProp === undefined){
        toProp = MpUtil.format('_%s',propname);
    }
    var getter = gettername;
    if(getter === undefined){
        getter = MpUtil.format('get%s%s',propname.substr(0,1).toUpperCase(),propname.substring(1));
    }
    var setter = settername;
    if(setter === undefined){
        setter = MpUtil.format('set%s%s',propname.substr(0,1).toUpperCase(),propname.substring(1));
    }
    if(!self[getter]){
        var getterFn = function () {
            return this[toProp];
        };
        MpUtil.esDefPri(self,getter,getterFn);
    }
    if(!self[setter]){
        var setterFn = function (value) {
            var old = this[toProp];
            this[toProp] = value;
            if(!compare(old,value) && !!this.emit){
                this.emit(emtName,this);
            }
        };
        MpUtil.esDefPri(self,setter,setterFn);
    }
    var compare = comp;
    if(compare === undefined){
        compare = function (a,b) {
            return a === b;
        }
    }
    var emtName = emitname;
    if(emtName === undefined){
        emtName = MpUtil.format('on%s%sChange',propname.substr(0,1).toUpperCase(),propname.substring(1));
    }
    //console.log("getter:"+getter+" setter:"+setter+" emtName:"+emtName+" toProp:"+toProp+" isToPropEnumable "+isToPropEnumable);

    MpUtil.esDefGetterSetter(self,propname,self[getter],self[setter]);
    if(!isToPropEnumable){
        MpUtil.esDefPri(self,toProp,undefined);
    }
    self[toProp] = defaultValue;//默认属性
};

MpUtil.esModifyGetterSetter = function (self,key,getter,settter,enumerable,configurable) {
    var en = enumerable;
    var conf = configurable;
    var get = getter;
    var set = settter;
    var oldProp  =Object.getOwnPropertyDescriptor(self,key);

    if(en===undefined){
        en = (!!oldProp)?oldProp.enumerable:true;
    }
    if(conf===undefined){
        conf = (!!oldProp)?oldProp.configurable:true;
    }
    if(get===undefined){
        get = (!!oldProp)?oldProp.get:undefined;
    }
    if(set === undefined){
        set = (!!oldProp)?oldProp.set:undefined;
    }
    Object.defineProperty(self,key,{
        configurable: conf, // 属性的描述是否可以被改变
        enumerable: en, //是否可枚举
        set: set,//setter
        get: get//getter
    });
};
module.exports = MpUtil;
//console.log(">>>mputil export:"+(typeof MpUtil.esDefPri)+"  "+MpUtil.esDefPri);