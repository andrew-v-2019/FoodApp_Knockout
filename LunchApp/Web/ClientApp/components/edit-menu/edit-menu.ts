

import * as ko from 'knockout';
import 'isomorphic-fetch';

class Section {
    constructor(item: any) {
        this.menuSectionId = ko.observable<number>(item.menuSectionId);
        this.menuId = ko.observable<number>(item.menuId);
        this.number = ko.observable<number>(item.number);
        this.name = ko.observable<string>(item.name);
        this.items = ko.observableArray<MenuItem>([]);
    }

    public lastItemNotEmpty(): boolean {
        var res = true;
        ko.utils.arrayForEach<any>(this.items(),
            menuItem => {
                if (menuItem.isLast()) {
                    res = menuItem.name().length > 0;
                }
            });
        return res;
    }

    public recount() {
        ko.utils.arrayForEach<any>(this.items(),
            (menuItem, i) => {
                menuItem.number(i+1);
            });
    }

    public allItemsFilled(): boolean {
        var res = true;
        ko.utils.arrayForEach<any>(this.items(),
            menuItem => {
                if (menuItem.name().length === 0) {
                    menuItem.error(true);
                    res = false;
                }
            });
        return res;
    }

    public push(item: MenuItem) {
        ko.utils.arrayForEach<MenuItem>(this.items(),
            menuItem => {
                menuItem.isLast(false);
            });
        item.name.subscribe(newValue => {
            if (newValue.length > 0) {
                item.error(false);
            } else {
                item.error(true);
            }
        });
        item.isLast(true);
        this.items.push(item);
        this.recount();
    }

    public remove(item: MenuItem) {
        const items = this.items();
        items.splice(item.number()-1,1);
        this.items(items);
        this.recount();
    }

    public removeLast() {
        if (this.items().length <= 1) return;
        const last = this.items()[this.items().length - 1];
        this.remove(last);
    }

    menuSectionId: KnockoutObservable<number>;
    menuId: KnockoutObservable<number>;
    number: KnockoutObservable<number>;
    name: KnockoutObservable<string>;
    items: KnockoutObservableArray<MenuItem>;
}

class MenuItem {
    constructor(sectionId: number) {
        this.menuItemId = ko.observable<number>(0);
        this.number = ko.observable<number>(1);
        this.name = ko.observable<string>('');
        this.menuSectionId = ko.observable<number>(sectionId);
        this.isLast = ko.observable<boolean>(true);
        this.error = ko.observable<boolean>(false);   
    }
    public static fromJs(menuItem: any) {
        const observableItem = new MenuItem(menuItem.sectionId);
        observableItem.number = ko.observable<number>(menuItem.number);
        observableItem.menuItemId = ko.observable<number>(menuItem.menuItemId);
        observableItem.name = ko.observable<string>(menuItem.name);
        observableItem.menuSectionId = ko.observable<number>(menuItem.menuSectionId);
        observableItem.isLast = ko.observable<boolean>(true);
        observableItem.error = ko.observable<boolean>(false);
        return observableItem;
    }
    menuItemId: KnockoutObservable<number>;
    number: KnockoutObservable<number>;
    name: KnockoutObservable<string>;
    menuSectionId: KnockoutObservable<number>;
    isLast: KnockoutObservable<boolean>;
    error: KnockoutObservable<boolean>;
}

class EditMenuViewModel {
    sections = ko.observableArray<Section>();
    menuId: KnockoutObservable<number>;
    lunchDate: KnockoutObservable<string>;
    price: KnockoutObservable<number>;
    editable: KnockoutObservable<boolean>;
    errors: KnockoutObservableArray<string>;
    success: KnockoutObservable<string>;
   
    checkBeforeSave(data): boolean {
        var res = true;
        ko.utils.arrayForEach<any>(data.sections(),
            section => {
                if (!section.lastItemNotEmpty()) {
                    section.removeLast();
                }
                if (!section.allItemsFilled()) {
                    res = false;
                }
            });
        return res;
    }

    save(data) {      
        if (!this.checkBeforeSave(data)) return;
        const jsModel = ko.toJS(data);
        const model = {
            price: data.price(),
            menuId: data.menuId(),
            sections: jsModel.sections,
            lunchDate: jsModel.lunchDate
        };
        var viewModel = this;
        viewModel.errors([]);
        viewModel.success('');
        fetch('/api/menus/update',
                {
                    headers: {
                        credentials: 'include',
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: 'post',
                    body: JSON.stringify(model)
                }).then(response => {
                if (response.status >= 400) {
                    throw new Error("Bad response from server");
                }
                return response.json();
            })
            .then((data: any) => {
                this.menuId(data.menuId);
                this.success('Меню успешно сохранено');
            }).catch(error => {
                viewModel.errors([error.message]);
            });
    }

    loadTemplate(model) {
        model.load('template');
    }

    loadEmpty(model) {
        model.load('empty');
    }

    load(type) {
        var model = this;
        const baseUrl = '/api/menus/' + type;
        model.price = ko.observable<number>(0);
        model.errors([]);
        model.success('');    
        fetch(baseUrl)
            .then(response => response.json())
            .then((data: any) => {
                this.menuId = ko.observable<number>(data.menuId);
                this.lunchDate(this.formatDate(new Date(data.lunchDate)));              
                this.price = ko.observable<number>(data.price);
                this.editable(data.editable);              
                var sections = ko.observableArray<Section>();
                ko.utils.arrayForEach<any>(data.sections,
                    item => {
                        var section = new Section(item);
                        ko.utils.arrayForEach<any>(item.items,
                            menuItem => {
                                const observableItem = MenuItem.fromJs(menuItem);
                                section.push(observableItem);
                            });
                        if (!section.items().length) {
                            const emptyItem = new MenuItem(section.menuSectionId());
                            section.push(emptyItem);
                        }
                        sections.push(section);
                    });
                this.sections(sections());
            });
    }

    formatDate(d: Date) {
        //'2017-06-12'
        const s = d.toISOString().substring(0, 10);
        return s;
    }

    constructor() {
        this.lunchDate = ko.observable<string>(this.formatDate(new Date())); 
        this.editable = ko.observable<boolean>(false);
        this.success = ko.observable<string>('');
        this.errors = ko.observableArray<string>([]);
        this.load('last');
    }

    addEmptyItem(section, event) {
        if (!section.lastItemNotEmpty()) return;
        const item = new MenuItem(section.menuSectionId());
        section.push(item);
    };

    removeItem(item, sec) {
        if (sec.items().length <= 1) return;
        sec.remove(item);
    }
}
export default { viewModel: EditMenuViewModel, template: require('./edit-menu.html') };
