"use strict";
// Class to manage Events
class EventManager {
    constructor() {
        this.name = document.querySelector('#project-name');
        this.project_id = document.querySelector('#id');
        this.people_count = document.querySelector('#people-num');
        this.description = document.querySelector('#description');
        this.status = document.querySelector('#status');
        this.submit = document.querySelector('#user-input');
        this.activeTableBody = document.querySelector('.active tbody');
        this.finishedTableBody = document.querySelector('.finished tbody');
        this.tableRow = document.querySelectorAll('tbody tr');
        this.tables = document.querySelectorAll('table tbody');
        this.eventListeners();
        UIInteractions.displayOnLoad();
    }
    eventListeners() {
        this.submit.addEventListener("submit", this.getUserInput.bind(this));
        this.activeTableBody.addEventListener("click", UIInteractions.removeRow);
        this.finishedTableBody.addEventListener("click", UIInteractions.removeRow);
        for (let row of this.tableRow) {
            row.addEventListener("dragstart", DragDrop.dragStart);
            row.addEventListener("dragend", DragDrop.dragEnd);
        }
        for (let body of this.tables) {
            body.addEventListener("dragover", DragDrop.dragOver);
            body.addEventListener("dragenter", DragDrop.dragEnter);
            body.addEventListener("dragleave", DragDrop.dragLeave);
            body.addEventListener("drop", DragDrop.drop);
        }
    }
    getUserInput(event) {
        event.preventDefault();
        let name = this.name.value.trim(), id = this.project_id.value.trim(), people = this.people_count.value.trim(), description = this.description.value.trim(), status = this.status.value.trim();
        UIInteractions.displayData(id, name, description, people, status);
        UIInteractions.clearForm(this.project_id, this.name, this.description, this.people_count, this.status);
    }
}
// Class to handle UI interactions
class UIInteractions {
    static displayOnLoad() {
        let projects = Store.getProjects();
        for (let project of projects) {
            this.createRow(project);
        }
    }
    static displayData(...args) {
        let checker = UIInteractions.failureValidation(args);
        let idChecker = UIInteractions.IdValidation(args[0]);
        if (checker && idChecker) {
            this.createRow(args);
            UIInteractions.success();
            Store.addProjectToStore(args);
        }
    }
    static createRow(args) {
        let row = document.createElement("tr");
        row.draggable = true;
        row.innerHTML = `<td class="id">${args[0]}</td ><td class="name">${args[1]}</td><td class="description">${args[2]}</td><td class="people">${args[3]}</td><td class="delete"><i class="fas fa-trash"></i></td>`;
        row.addEventListener('dragstart', DragDrop.dragStart);
        row.addEventListener('dragend', DragDrop.dragEnd);
        if (args[4] === 'active') {
            row.className = 'active-row';
            let activeTable = document.querySelector('.active tbody');
            activeTable.insertBefore(row, activeTable.lastElementChild);
        }
        else {
            row.className = 'finished-row';
            let finishedTable = document.querySelector('.finished tbody');
            finishedTable.insertBefore(row, finishedTable.lastElementChild);
        }
    }
    static clearForm(...args) {
        args.forEach((element, index) => {
            if (!(index === 4)) {
                element.value = '';
            }
        });
    }
    static failureValidation(args) {
        let checker = true;
        args.forEach((element) => {
            if (!(element)) {
                let fail = document.querySelector('.not-filled');
                fail.style.display = 'block';
                checker = false;
                setTimeout(() => fail.style.display = 'none', 2000);
            }
        });
        return checker;
    }
    static IdValidation(id) {
        let activeId = document.querySelectorAll('.id');
        let idDiv = document.querySelector('.id-exists');
        let idChecker = true;
        activeId.forEach(element => {
            if (element.textContent === id) {
                idDiv.style.display = 'block';
                idChecker = false;
                setTimeout(() => idDiv.style.display = 'none', 2000);
            }
        });
        return idChecker;
    }
    static success() {
        let successDiv = document.querySelector('.success');
        successDiv.style.display = 'block';
        setTimeout(() => successDiv.style.display = 'none', 2000);
    }
    static removeRow(event) {
        let target = event.target;
        if (target.className === 'fas fa-trash') {
            let element = target.parentNode.parentNode;
            let node = target.parentNode;
            let id = node.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.textContent;
            Store.removeProjectFromStore(id);
            element.remove();
        }
    }
}
// Class to handle local storage
class Store {
    static getProjects() {
        let projects;
        if (localStorage.getItem('projects') === null) {
            projects = [];
        }
        else {
            projects = JSON.parse(localStorage.getItem('projects'));
        }
        return projects;
    }
    static addProjectToStore(args) {
        let projects = this.getProjects();
        projects.push(args);
        localStorage.setItem('projects', JSON.stringify(projects));
    }
    static removeProjectFromStore(id) {
        let projects = this.getProjects();
        for (let project of projects) {
            if (project[0] === id) {
                projects.splice(projects.indexOf(project), 1);
            }
        }
        localStorage.setItem('projects', JSON.stringify(projects));
    }
}
// Class to handle drag and drop events
class DragDrop {
    static dragStart(event) {
        let element = event.target;
        element.className += ' dragging';
    }
    static dragEnd(event) {
        let element = event.target;
        let id = element.firstElementChild.textContent;
        let table = element.parentElement.parentElement;
        let rowElements = element.children;
        console.log(element);
        setTimeout(() => {
            element.classList.remove('dragging');
        }, 10);
        let bodies = document.querySelectorAll('tbody');
        for (let body of bodies) {
            body.classList.remove('dragOver');
        }
        Store.removeProjectFromStore(id);
        if (table.classList.contains('active')) {
            let values = [];
            for (let element of rowElements) {
                values.push(element.textContent);
            }
            values[4] = 'active';
            Store.addProjectToStore(values);
        }
        else if (table.classList.contains('finished')) {
            let values = [];
            for (let element of rowElements) {
                values.push(element.textContent);
            }
            values[4] = 'finished';
            Store.addProjectToStore(values);
        }
    }
    static dragOver(event) {
        event.preventDefault();
    }
    static dragEnter(event) {
        let element = event.target;
        let body = element.parentNode.parentNode;
        if (body.tagName === 'TBODY') {
            body.className = 'dragOver';
        }
    }
    static dragLeave(event) {
        let element = event.target;
        let body = element.parentElement.parentElement;
        if (body.tagName === 'TBODY') {
            body.classList.remove('dragOver');
        }
    }
    static drop(event) {
        let element = event.target;
        let body = element.parentElement.parentElement;
        let row = document.querySelector('.dragging');
        body.insertBefore(row, body.lastElementChild);
    }
}

const e = new EventManager();