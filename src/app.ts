//Drag & Drop Intefarce
interface Draggable{
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event:DragTarget): void;
}

interface DragTarget{
    dragOverHandler(event:DragEvent):void;
    dropHandler(event:DragEvent):void;
    dragLeaveHandler(event:DragEvent):void;

}

//Project types
enum ProjectStatus {Active = 'Active', Finished = 'Finished'}

class Project{
    constructor(public id:string, public title:string, public description:string, public people: number, public status: ProjectStatus){}
}

type Listeners<T> = (item: T[])=> void;

//State class
class State<T>{
    protected listeners:Listeners<T>[] = [];

    addListener(listenerFn: Listeners<T>){
        this.listeners.push(listenerFn)
    }
}

//Porject state managment
class ProjectState extends State<Project>{

    private projects: Project[] = [];
    private static instance:ProjectState;

    private constructor(){
        super()
    }

    static getInstance():ProjectState{
        if(!this.instance){
            this.instance = new ProjectState()
            return this.instance
        }
        return this.instance
    }
    
    addProject(title:string, desciption:string, numOfPeople: number){
        const newProject = new Project(Math.random().toString(), title, desciption, numOfPeople, ProjectStatus.Active)
        this.projects.push(newProject);
        this.updateListeners()
    }

    moveProject(projectId: string, newStatus: ProjectStatus){
        const project = this.projects.find(prj => prj.id === projectId);
        if(project && project.status !== newStatus){
            project.status = newStatus
            this.updateListeners()
        }
    }

    private updateListeners(){        
        for(const listenerFn of this.listeners){
        listenerFn(this.projects.slice());
        }
    }
}
    
const projectState = ProjectState.getInstance()

//Validation Logic
interface Validatable{
    value:string|number;
    required?:boolean;
    minLength?:number;
    maxLength?:number;
    min?: number;
    max?:number;
}

function validate(validatableInput:Validatable){
    let isValid = true;
    if(validatableInput.required){
        isValid = isValid && validatableInput.value.toString().trim().length !==0;
    }
    if(validatableInput.minLength!= null && typeof validatableInput.value === 'string'){
        isValid = isValid && validatableInput.value.length  >= validatableInput.minLength;
    }
    if(validatableInput.maxLength!= null && typeof validatableInput.value === 'string'){
        isValid = isValid && validatableInput.value.length  <= validatableInput.maxLength;
    }
    if(validatableInput.min != null && typeof validatableInput.value === 'number'){
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if(validatableInput.max != null && typeof validatableInput.value === 'number'){
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }
    return isValid

}

//Autobind decorator
function autobind(
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

//Base class components
abstract class Components<T extends HTMLElement, U extends HTMLElement>{
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
//ProjectItem class
class ProjectItem extends Components<HTMLUListElement, HTMLLIElement> implements Draggable{
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
//Project list generator
class ProjectList extends Components<HTMLElement, HTMLDivElement> implements DragTarget{
    assignedProjects:Project[];

    constructor(private type:ProjectStatus){
        super('project-list', 'app', false,`${type}-projects`);
        this.assignedProjects = []
        this.renderContent();
        this.renderProjects();

        this.configure()
        this.renderContent()
    }

    @autobind
    dragOverHandler(event: DragEvent): void {
        if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain'){
            event.preventDefault();
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.add('droppable')
        }
        
    }
    @autobind
    dropHandler(event: DragEvent): void {
        const prjId = event.dataTransfer!.getData('text/plain');
        projectState.moveProject(prjId, this.type === ProjectStatus.Active ? ProjectStatus.Active : ProjectStatus.Finished)
    }

    @autobind
    dragLeaveHandler(_: DragEvent): void {
        const listEl = this.element.querySelector('ul')!;
        listEl.classList.remove('droppable')
    }

    configure(): void {
        this.element.addEventListener('dragover', this.dragOverHandler)
        this.element.addEventListener('dragleave', this.dragLeaveHandler)
        this.element.addEventListener('drop', this.dropHandler)
        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(prj => prj.status === this.type);
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        })
    
    }

    renderContent(){
        const listId = `${this.type}-project-list`
        this.element.querySelector('ul')!.id = listId
        this.element.querySelector('h2')!.textContent = this.type + ' Projects'
    }

    private renderProjects(){
        const listEl = document.getElementById(`${this.type}-project-list`)! as HTMLUListElement
        listEl.innerHTML = ''
        for(const prjItem of this.assignedProjects){
            new ProjectItem(this.element.querySelector('ul')!.id, prjItem)

        }

        
    }

    
}


class ProjectInput extends Components<HTMLFormElement, HTMLDivElement>{

    titleInputElement: HTMLInputElement;
    descriptionInputElement:HTMLInputElement;
    peopleInputElement:HTMLInputElement;
    
    constructor(){
        super('project-input', 'app',true ,'user-input')
        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

        this.configure()
    }

    private gatherUserInput():[string,string,number] | undefined{
        const enteredTitle = this.titleInputElement.value;
        const enteredDescripton = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true

        }
        const descriptionValidatable:Validatable = {
            value: enteredDescripton,
            required: true,
            minLength: 5,
            maxLength: 240
        }
        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 10
        }


        if(
            !validate(titleValidatable)||
            !validate(descriptionValidatable)||
            !validate(peopleValidatable)
        ){
            alert('Invalid input, please try again!')
            return
        }else{
            return [enteredTitle, enteredDescripton, +enteredPeople]
        }
    }
    renderContent(){}

    configure(){
        this.element.addEventListener('submit', this.submitHandler)
    }

    private clearInput(){
        this.titleInputElement.value = ''
        this.descriptionInputElement.value = ''
        this.peopleInputElement.value = ''
    }

    @autobind
    private submitHandler(event: Event){
        event.preventDefault()
        const userInput = this.gatherUserInput()
        if(Array.isArray(userInput)){
            const [title, desc, people] = userInput
            projectState.addProject(title, desc, people)
            console.log(title,desc,people)
        }
        this.clearInput();
    }


}
const prjInput = new ProjectInput();
const activePrjList = new ProjectList(ProjectStatus.Active);
const finishedPrjList = new ProjectList(ProjectStatus.Finished);
