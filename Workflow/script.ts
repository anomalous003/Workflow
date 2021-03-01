// Class to manage Events
class EventManager {
    readonly name: HTMLInputElement;
    readonly project_id: HTMLInputElement;
    readonly people_count: HTMLInputElement;
    readonly description: HTMLInputElement;
    readonly status: HTMLInputElement;
    readonly submit: HTMLElement;
    readonly activeTableBody: HTMLTableElement;
    readonly finishedTableBody: HTMLTableElement;
    readonly tableRow: any
    readonly tables: any;

    constructor() {
        this.name = document.querySelector('#project-name')! as HTMLInputElement;
        this.project_id = document.querySelector('#id')! as HTMLInputElement;
        this.people_count = document.querySelector('#people-num')! as HTMLInputElement;
        this.description = document.querySelector('#description')! as HTMLInputElement;
        this.status = document.querySelector('#status')! as HTMLInputElement;
        this.submit = document.querySelector('#user-input')! as HTMLElement;
        this.activeTableBody = document.querySelector('.active tbody')! as HTMLTableElement;
        this.finishedTableBody = document.querySelector('.finished tbody')! as HTMLTableElement;
        this.tableRow = document.querySelectorAll('tbody tr')!
        this.tables = document.querySelectorAll('table tbody')!;
        this.eventListeners()
        UIInteractions.displayOnLoad()
    }

    private eventListeners() {
        this.submit.addEventListener("submit", this.getUserInput.bind(this));
        this.activeTableBody.addEventListener("click", UIInteractions.removeRow)
        this.finishedTableBody.addEventListener("click", UIInteractions.removeRow)
        
        for (let row of this.tableRow) {
            row.addEventListener("dragstart", DragDrop.dragStart)
            row.addEventListener("dragend", DragDrop.dragEnd)
        }

        for (let body of this.tables) {
            body.addEventListener("dragover", DragDrop.dragOver);
            body.addEventListener("dragenter", DragDrop.dragEnter);
            body.addEventListener("dragleave", DragDrop.dragLeave);
            body.addEventListener("drop", DragDrop.drop);
        }
    }

    private getUserInput(event: Event) {
        event.preventDefault();
        let name = this.name.value.trim()! as string,
            id = this.project_id.value.trim()! as string,
            people = this.people_count.value.trim()! as string,
            description = this.description.value.trim()! as string,
            status = this.status.value.trim()! as 'active' | 'finished';

        UIInteractions.displayData(id, name, description, people, status)
        UIInteractions.clearForm(this.project_id, this.name, this.description, this.people_count, this.status)
    }
}

// Class to handle UI interactions
class UIInteractions {
    static displayOnLoad() {
        let projects = Store.getProjects();

        for (let project of projects) {
            this.createRow(project)
        }
    }

    static displayData(...args: string[]) {
        let checker = UIInteractions.failureValidation(args)
        let idChecker = UIInteractions.IdValidation(args[0])

        if (checker && idChecker) {
            this.createRow(args)
            UIInteractions.success()
            Store.addProjectToStore(args)
        }
    }

    static createRow(args: string[]) {
        let row = document.createElement("tr")
        row.draggable = true;
        row.innerHTML = `<td class="id">${args[0]}</td ><td class="name">${args[1]}</td><td class="description">${args[2]}</td><td class="people">${args[3]}</td><td class="delete"><i class="fas fa-trash"></i></td>`

        row.addEventListener('dragstart', DragDrop.dragStart);
        row.addEventListener('dragend', DragDrop.dragEnd);

        if (args[4] === 'active') {
            row.className = 'active-row';
            let activeTable = document.querySelector('.active tbody')! as HTMLTableElement;
            activeTable.insertBefore(row, activeTable.lastElementChild)
        } else {
            row.className = 'finished-row';
            let finishedTable = document.querySelector('.finished tbody')! as HTMLTableElement;
            finishedTable.insertBefore(row, finishedTable.lastElementChild)
        }
    }

    static clearForm(...args: HTMLInputElement[]) {
        args.forEach((element, index) => {
            if (!(index === 4)) {
                element.value = ''
            }
        });
    }

    static failureValidation(args: string[]) {
        let checker = true;

        args.forEach((element) => {
            if (!(element)) {
                let fail = document.querySelector('.not-filled')! as HTMLDivElement;
                fail.style.display = 'block';
                checker = false;
                setTimeout(() => fail.style.display = 'none', 2000);
            }
        })
        return checker!
    }

    static IdValidation(id: string) {
        let activeId = document.querySelectorAll('.id')
        let idDiv = document.querySelector('.id-exists')! as HTMLDivElement;
        let idChecker = true;

        activeId.forEach(element => {
            if (element.textContent === id) {
                idDiv.style.display = 'block';
                idChecker = false;
                setTimeout(() => idDiv.style.display = 'none', 2000);
            }
        })

        return idChecker!
    }

    static success() {
        let successDiv = document.querySelector('.success')! as HTMLDivElement;
        successDiv.style.display = 'block'
        setTimeout(() => successDiv.style.display = 'none', 2000);
    }

    static removeRow(event: Event) {
        let target = event.target! as HTMLElement
        if (target.className === 'fas fa-trash') {
            let element = target.parentNode!.parentNode! as HTMLElement;
            let node = target.parentNode! as HTMLElement
            let id = node.previousElementSibling!.previousElementSibling!.previousElementSibling!.previousElementSibling!.textContent as string
            Store.removeProjectFromStore(id)
            element.remove()
        }
    }
}

// Class to handle local storage
class Store {
    static getProjects() {
        let projects;
        if (localStorage.getItem('projects') === null) {
            projects = []
        }
        else {
            projects = JSON.parse(localStorage.getItem('projects')!)
        }
        return projects
    }

    static addProjectToStore(args: string[]) {
        let projects = this.getProjects();
        projects.push(args)
        localStorage.setItem('projects', JSON.stringify(projects))
    }

    static removeProjectFromStore(id: string) {
        let projects = this.getProjects()
        for (let project of projects) {
            if (project[0] === id) {
                projects.splice(projects.indexOf(project), 1)
            }
        }
        localStorage.setItem('projects', JSON.stringify(projects))
    }
}

// Class to handle drag and drop events
class DragDrop{
    static dragStart(event: Event) {
        let element = event.target! as HTMLElement;
        element.className += ' dragging'
    }
    
    static dragEnd(event: Event) {
        let element = event.target! as HTMLElement;
        let id = element.firstElementChild!.textContent as string;
        let table = element.parentElement!.parentElement! as HTMLElement;
        let rowElements = element.children
        console.log(element)
        setTimeout(() => {
            element.classList.remove('dragging')
        }, 10);
        let bodies = document.querySelectorAll<HTMLElement>('tbody')!;
        
        for (let body of bodies) {
            body.classList.remove('dragOver')
        }

        Store.removeProjectFromStore(id)

        if (table.classList.contains('active')) {
            let values = []
            for (let element of rowElements) {
                values.push(element.textContent!);
            }
            values[4] = 'active'
            Store.addProjectToStore(values);
        }
        else if (table.classList.contains('finished')) {
            let values = []
            for (let element of rowElements) {
                values.push(element.textContent!);
            }
            values[4] = 'finished'
            Store.addProjectToStore(values);
        }
    }
    
    static dragOver(event: Event) {
        event.preventDefault();
    }

    static dragEnter(event: Event) {
        let element = event.target! as HTMLElement;
        let body = element.parentNode!.parentNode! as HTMLElement;
        if (body.tagName === 'TBODY') {
            body.className = 'dragOver'
        }
    }

    static dragLeave(event: Event) {
        let element = event.target! as HTMLElement;
        let body = element.parentElement!.parentElement as HTMLElement
        if (body.tagName === 'TBODY') {
            body.classList.remove('dragOver')
        }
    }

    static drop(event: Event) {
        let element = event.target! as HTMLElement;
        let body = element.parentElement!.parentElement as HTMLElement;
        let row = document.querySelector('.dragging')! as HTMLElement;
        body.insertBefore(row, body.lastElementChild)
    }

}

const e = new EventManager() 