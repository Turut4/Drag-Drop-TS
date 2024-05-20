namespace App{
    //Base class components
    export abstract class Components<T extends HTMLElement, U extends HTMLElement>{
        templateElement: HTMLTemplateElement;
        hostElement: U;
        element: T;

        constructor(tempelateId:string, hostElementId:string, insertAtSart:boolean, newElementId?: string  ){
            this.templateElement = document.getElementById(tempelateId)! as HTMLTemplateElement;
            this.hostElement = document.getElementById(hostElementId)! as U;
            const importedNode = document.importNode(this.templateElement.content, true);;
            this.element = importedNode.firstElementChild as T;
            if(newElementId){
                this.element.id = newElementId;
            } 
            this.attach(insertAtSart);
            
        }
        private attach(insertAtSart:Boolean){
            this.hostElement.insertAdjacentElement(insertAtSart === true ? 'afterbegin':'beforeend', this.element);
        }

        abstract configure():void;
        abstract renderContent():void;
    }
}
    