namespace App{
    type Listeners<T> = (item: T[])=> void;

    //State class
    class State<T>{
        protected listeners:Listeners<T>[] = [];

        addListener(listenerFn: Listeners<T>){
            this.listeners.push(listenerFn)
        }
    }
    //Porject state managment
    export class ProjectState extends State<Project>{

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
        
    export const projectState = ProjectState.getInstance()
} 
