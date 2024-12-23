class LiveFilteringElement extends HTMLElement {
    names;
    filters;
    filtersList;
    names;
    namesHeading;
    liveFiltersList;
    statusElement;
    activeFiltersElement;
    allFilters = [];
    activeFilters = [];
    activeFilterValues;
    searchParams;

    constructor() {
        super();

        const self = this;

        self.filters = document.querySelector('#section--filters');
        self.filtersList = self.filters.querySelector(':scope > ul'),
        self.names = document.querySelector('#section--names'),
        self.namesHeading = self.names.querySelector(`#${self.names.getAttribute('aria-labelledby')}`);

        self.liveFiltersList = CustomElementHelpers.createElementFromString(`
            <ul class="live-filters">
                <li class="filter">
                    <input
                        type="checkbox"
                        id="checkbox--a"
                        name="filters[]"
                        value="a"
                        data-associated-section-id="section--a"
                        data-associated-deactivate-filter-control-id="deactivate-filter-control--a"
                    >

                    <label for="checkbox--a">Names starting with "A"</label>
                </li>

                <li class="filter">
                    <input
                        type="checkbox"
                        id="checkbox--b"
                        name="filters[]"
                        value="b"
                        data-associated-section-id="section--b"
                        data-associated-deactivate-filter-control-id="deactivate-filter-control--b"
                    >

                    <label for="checkbox--b">Names starting with "B"</label>
                </li>

                <li class="filter">
                    <input
                        type="checkbox"
                        id="checkbox--c"
                        name="filters[]"
                        value="c"
                        data-associated-section-id="section--c"
                        data-associated-deactivate-filter-control-id="deactivate-filter-control--c"
                    >

                    <label for="checkbox--c">Names starting with "C"</label>
                </li>
            </ul>
        `);

        self.statusElement = CustomElementHelpers.createElementFromString(`
            <p
                role="status"
                class="visually-hidden"
            ></p>
        `);

        self.activeFiltersElement = CustomElementHelpers.createElementFromString(`
            <dl class="active-filters" hidden>
                <dt>Active filters:</dt>

                <dd>
                    <ul>
                        <li hidden>
                            <button
                                type="button"
                                id="deactivate-filter-control--a"
                                data-associated-checkbox-control-id="checkbox--a"
                            >Names starting with "A" (Deactivate Filter)</button>
                        </li>

                        <li hidden>
                            <button
                                type="button"
                                id="deactivate-filter-control--b"
                                data-associated-checkbox-control-id="checkbox--b"
                            >Names starting with "B" (Deactivate Filter)</button>
                        </li>

                        <li hidden>
                            <button
                                type="button"
                                id="deactivate-filter-control--c"
                                data-associated-checkbox-control-id="checkbox--c"
                            >Names starting with "C" (Deactivate Filter)</button>
                        </li>
                    </ul>
                </dd>
            </dl>
        `);

        self.filters.replaceChild(self.liveFiltersList, self.filtersList);
        
        self.liveFiltersList = self.filters.querySelector('ul.live-filters');
        self.liveFiltersList.insertAdjacentElement('afterend', self.statusElement.children[0]);

        self.statusElement = self.filters.querySelector('[role="status"]');

        self.namesHeading.insertAdjacentElement('afterend', self.activeFiltersElement.children[0]);

        self.activeFiltersElement = self.names.querySelector('dl.active-filters');

        self.liveFilters = self.liveFiltersList.querySelectorAll('input[type="checkbox"]');

        self.liveFilters.forEach(filter => {
            self.allFilters.push(filter);

            filter.addEventListener('change', e => {
                let filter = e.currentTarget;

                if (filter.checked) {
                    self.activateFilter(filter, self);
                } else {
                    self.deactivateFilter(filter, self);
                }

                while (self.statusElement.childNodes[0]) {
                    self.statusElement.removeChild(self.statusElement.childNodes[0]);
                }

                setTimeout(
                    () => {
                        self.statusElement.appendChild(document.createTextNode('Content updated.'));
                    },
                    200
                );
            });

            self.activeFiltersElement.querySelector(`#${filter.dataset.associatedDeactivateFilterControlId}`).addEventListener('click', e => {
                let activeFiltersIndex = self.activeFilters.indexOf(filter),
                    focusTarget;

                switch (self.activeFilters.length) {
                    case null:
                    case 1:
                        focusTarget = self.namesHeading;

                        break;
                    default:
                        if (0 === activeFiltersIndex) {
                            focusTarget = self.activeFiltersElement.querySelector(`#${self.activeFilters[1].dataset.associatedDeactivateFilterControlId}`);
                        } else {
                            focusTarget = self.activeFiltersElement.querySelector(`#${self.activeFilters[activeFiltersIndex - 1].dataset.associatedDeactivateFilterControlId}`);
                        }
                }

                filter.click();

                focusTarget.focus();
            });
        });

        self.searchParams = new URLSearchParams(window.location.search);

        if (self.searchParams.has('filters[]')) {
            let filtersOnLoad = self.searchParams.get('filters[]');

            filtersOnLoad.split(',').forEach(filterValue => {
                let filter = self.liveFiltersList.querySelector(`input[type="checkbox"][name="filters[]"][value="${filterValue}"]`);

                if (!filter) return;

                self.activateFilter(filter, self);
            });
        }
    }
    
    activateFilter(filter, self) {
        if (!self.activeFilters.length) {
            self.allFilters.forEach(filter => {
                self.names.querySelector(`#${filter.dataset.associatedSectionId}`).hidden = true;
            });

            self.activeFilters.forEach(filter => {
                self.names.querySelector(`#${filter.dataset.associatedSectionId}`).hidden = false;
            });
        }

        filter.checked = true;
        
        let deactivateFilterControl = self.names.querySelector(`#${filter.dataset.associatedDeactivateFilterControlId}`);

        let listItem = deactivateFilterControl.closest('li');

        let section = self.names.querySelector(`#${filter.dataset.associatedSectionId}`);

        if (true === self.activeFiltersElement.hidden) {
            self.activeFiltersElement.hidden = false;
        }

        if (true === listItem.hidden) {
            listItem.hidden = false;
        }

        if (true === section.hidden) {
            section.hidden = false;
        }

        self.activeFilters = Array.from(self.liveFiltersList.querySelectorAll('input[type="checkbox"]:checked'));

        self.activeFilterValues = [];

        self.activeFilters.forEach(filter => {
            self.activeFilterValues.push(filter.value);
        });

        let url = new URL(window.location.href);

        url.searchParams.set('filters[]', self.activeFilterValues.join(','));

        window.history.replaceState(null, '', url.toString());
    }

    deactivateFilter(filter, self) {
        let deactivateFilterControl = self.names.querySelector(`#${filter.dataset.associatedDeactivateFilterControlId}`);

        let listItem = deactivateFilterControl.closest('li');

        let section = self.names.querySelector(`#${filter.dataset.associatedSectionId}`);

        if (false === listItem.hidden) {
            listItem.hidden = true;
        }

        if (false === section.hidden) {
            section.hidden = true;
        }

        if (self.activeFilters.includes(filter)) {
            this.activeFilters.filter((value, index, array) => {
                if (filter === value) {
                    array.splice(index, 1);

                    return true;
                }

                return false;
            });
        }

        if (self.activeFilters.length) {
            self.allFilters.forEach(filter => {
                self.names.querySelector(`#${filter.dataset.associatedSectionId}`).hidden = true;
            });

            self.activeFilters.forEach(filter => {
                self.names.querySelector(`#${filter.dataset.associatedSectionId}`).hidden = false;
            });
        } else {
            self.allFilters.forEach(filter => {
                self.names.querySelector(`#${filter.dataset.associatedSectionId}`).hidden = false;
            });

            self.activeFiltersElement.hidden = true;
        }

        filter.checked = false;
        
        self.activeFilters = Array.from(self.liveFiltersList.querySelectorAll('input[type="checkbox"]:checked'));

        self.activeFilterValues = [];

        self.activeFilters.forEach(filter => {
            self.activeFilterValues.push(filter.value);
        });

        let url = new URL(window.location.href);

        if (!self.activeFilterValues.length) {
            url.searchParams.delete('filters[]');
        } else {
            url.searchParams.set('filters[]', self.activeFilterValues.join(','));
        }

        window.history.replaceState(null, '', url.toString());
    }
}

customElements.define(
    'live-filtering-element',
    LiveFilteringElement,
    {
        extends: 'section'
    }
);