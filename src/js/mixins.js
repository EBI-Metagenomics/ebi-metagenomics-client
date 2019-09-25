const _ = require('underscore');

/**
 * Tabs Manager.
 * Common methods to manage tabs.
 */
export const TabsManagerMixin = {
    tabs: {},
    router: undefined,
    /**
     * Boot and hook the Tabs properties and methods.
     * @param {string} elementId DOM element id for the containter.
     */
    hookTabs(elementId) {
        this.$tabsTitleContainer = this.$(elementId);
        this.$tabsTitleContainer.attr({
            'role': 'tablist'
        });
        this.$tabTitles = this.$(elementId + ' .tabs-title');
        _.each(this.$tabTitles, (title) => {
            const $title = $(title);
            const $link = $title.children(':first');
            $title.attr({
                'role': 'tab',
                'aria-controls': $link.attr('href').slice(1), // TODO CHECK!
                'aria-selected': false,
                'tabindex': '-1'
            });
            $link.attr({
                'role': 'presentation'
            });
        });

        this.$tabTitles.on('click', this.selectTabHandler.bind(this));

        const cont = this.$('[data-tabs-content="' + elementId.slice(1) + '"]');
        this.$tabsContainterEls = cont.children('.tabs-panel');
        _.each(this.$tabsContainterEls, (el) => {
            const $el = $(el);
            $el.attr({
                'role': 'tabpanel',
                'aria-labelledby': $el.attr('id')
            });
        });
    },
    /**
     * Add a tab with the corresponding tab isntance and route.
     * Provide a routingHandler if you want to customize the callback.
     * This is used for inner tabs at the moment:
     * For example for FnTab view inner tabs:
     *  FnTab inner tabs are url are #functional/interpro, interpro is the actual
     *  tabId so for FnTab the routing handler the app has to:
     *      - route to FnTab
     *      - FnTab has to route to interpro
     * so the routingHandler for FnTab would be:
     * ```js
     * routingHandler(tabId) {
     *  // tabId is interpro
     *  // this is Fn inner changeTab
     *  this.changeTab(subTabId);
     *}
     * ```
     * @param {string} tabId the tab id
     * @param {TabView} tab the tab instance
     * @param {string} route backbone-type route (for example "/tabs/:name")
     * @param {function} routingHandler route navigate handler
     */
    registerTab({tabId, tab, route, routingHandler, baseRoute}) {
        this.tabs = this.tabs || {};
        this.tabs[tabId] = {
            tab: tab,
            route: route,
            baseRoute: baseRoute
        };

        this.router.route(route, tabId, (args) => {
            this.changeTab(tabId);
            if (_.isFunction(routingHandler)) {
                routingHandler.apply(tab, [args]); /* route parameters */
            }
        });
    },
    /**
    * Switch to the selected tabId.
    * This method will:
    * - call the renderTab method on the selected tab
    * - update the DOM elements with the is-active and other visual changes required
    * @param {string} tabId the tab Id selector
    * @param {[string]} routes the routes
    * @return {Object} view This view.
    */
    changeTab(tabId) {
        const tabData = this.tabs[tabId];
        if (!tabData) {
            // TODO: show error banner!
            return this;
        }
        const tab = tabData.tab;
        tab.renderTab.apply(tab);
        _.each(this.$tabsContainterEls, (el) => {
            const $el = $(el);
            const isActive = $el.attr('id') === tabId;
            $el.attr('aria-hidden', !isActive);
            $el.toggleClass('is-active', isActive);
        });
        _.each(this.$tabTitles, (el) => {
            const $el = $(el).children(':first');
            const isActive = $el.data('tab-id') === tabId;
            $el.toggleClass('is-active', isActive);
            $el.attr({
                'aria-selected': isActive,
                'tabindex': isActive ? '0' : '-1'
            });
        });
        return this;
    },
    /**
     * Tab selection Handler.
     * This will trigger the router to change, that will
     * then trigger the changeTab as a callback
     * @param {Event} event click event
    */
    selectTabHandler(event) {
        event.preventDefault();
        const $tabAnchor = $(event.currentTarget);
        const tabId = $tabAnchor.children(':first').data('tab-id');

        const tabData = this.tabs[tabId];

        this.router.navigate(tabData.baseRoute || tabData.route, {trigger: true});
    },
    /**
     * Enable tab by id
     * @param {string} tabId of tab
     */
    enableTab(tabId) {
        this.$('[data-tab-id="' + tabId + '"]').parent('li').removeClass('disabled');
    },
    /**
     * Disable tab by id
     * @param {string} tabId of tab
     */
    removeTab(tabId) {
        this.$('[data-tab-id="' + tabId + '"]').parent('li').remove();
    }
};

/**
 * Tab mixin.
 * Provides the common view methods and properties.
 */
export const TabMixin = {
    route: undefined, // The route that should trigger this view
    rendered: false,
    /**
     * Cached render fn.
     * @return {Object} This view
     */
    renderTab() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
        return this;
    }
};
