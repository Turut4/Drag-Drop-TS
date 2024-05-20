namespace App{
    //Autobind decorator
    export function autobind(
        _:any, 
        _2: string, 
        descriptor: PropertyDescriptor
    ){
        const originalMethod = descriptor.value;
        const adjDescriptior:PropertyDescriptor = {
            configurable:true,
            get(){
                const boundFn = originalMethod.bind(this)
                return boundFn
            }
        };
        return adjDescriptior
    }

}
    