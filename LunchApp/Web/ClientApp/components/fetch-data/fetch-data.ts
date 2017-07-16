
import * as ko from 'knockout';
import 'isomorphic-fetch';


interface IMenu {
    title: string;
    menuId: number;
    number: number;
    lunchDate: string;
}

class FetchDataViewModel {
    public menu = ko.observable<IMenu>();

    constructor() {
        fetch('/api/SampleData/Menu')
            .then(response => response.json() as Promise<IMenu>)
            .then(data => {
                debugger;
                this.menu(data);
            });
    }
}

export default { viewModel: FetchDataViewModel, template: require('./fetch-data.html') };
