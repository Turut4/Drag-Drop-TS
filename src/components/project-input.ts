import { Components } from "./base-component";
import { Validatable, validate } from "../util/validation";
import { autobind } from "../decorator/autobind";
import { projectState } from "../state/project-state";

export class ProjectInput extends Components<HTMLFormElement, HTMLDivElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");
    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configure();
  }

  private gatherUserInput(): [string, string, number] | undefined {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescripton = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };
    const descriptionValidatable: Validatable = {
      value: enteredDescripton,
      required: true,
      minLength: 5,
      maxLength: 240,
    };
    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 10,
    };

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert("Invalid input, please try again!");
      return;
    } else {
      return [enteredTitle, enteredDescripton, +enteredPeople];
    }
  }
  renderContent() {}

  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  private clearInput() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      projectState.addProject(title, desc, people);
      console.log(title, desc, people);
    }
    this.clearInput();
  }
}
