/// <reference path="base-component.ts"/>
namespace App{
        //ProjectItem class
    export class ProjectItem extends Components<HTMLUListElement, HTMLLIElement> implements Draggable{
        private project: Project;

        get persons(){
            if(this.project.people === 1){
                return '1 Person'
            }else{
                return `${this.project.people} Persons`
            }
        }

        constructor(hostId:string, project:Project){
            super('single-project', hostId, false, project.id)
            this.project = project

            this.configure();
            this.renderContent();
        }

        @autobind
        dragStartHandler(event: DragEvent): void {
            event.dataTransfer!.setData('text/plain', this.project.id);
            event.dataTransfer!.effectAllowed = 'move';
            
        }

        dragEndHandler(_: DragTarget): void {

        }
        configure() {
            this.element.addEventListener('dragstart', this.dragStartHandler)
        }
        renderContent() {
            this.element.querySelector('h2')!.textContent = this.project.title;
            this.element.querySelector('h3')!.textContent = this.persons +' assinged';
            this.element.querySelector('p')!.textContent = this.project.description;
        }

    }
}
