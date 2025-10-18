/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/namespace.ts":
/*!**************************!*\
  !*** ./src/namespace.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const npNamespace = window.np || (window.np = {});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (npNamespace.devTools = {});


/***/ }),

/***/ "./src/tools/hierarchy/hierarchy-panel.ts":
/*!************************************************!*\
  !*** ./src/tools/hierarchy/hierarchy-panel.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HierarchyPanel: () => (/* binding */ HierarchyPanel)
/* harmony export */ });
/* harmony import */ var _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @playcanvas/pcui */ "./node_modules/@playcanvas/pcui/dist/module/src/index.mjs");
/* harmony import */ var _utils_pcui_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/pcui-utils */ "./src/utils/pcui-utils.ts");
/* harmony import */ var _views_scene_view__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./views/scene-view */ "./src/tools/hierarchy/views/scene-view.ts");
/* harmony import */ var _views_search_view__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./views/search-view */ "./src/tools/hierarchy/views/search-view.ts");




class HierarchyPanel {
    constructor(layout) {
        this._searchFilterMask = _views_search_view__WEBPACK_IMPORTED_MODULE_3__.SearchFilterId.name;
        this._selectionHandler = layout.selectionHandler;
    }
    init() {
        this.createDomElements();
        this.reset();
    }
    createDomElements() {
        const rootContainer = new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.Container({
            grid: true,
            resizable: "right",
            resizeMax: 1000
        });
        const style = rootContainer.style;
        style.position = "absolute";
        style.left = style.top = "0px";
        style.width = "275px";
        style.height = "100%";
        style.zIndex = "1000";
        document.body.appendChild(rootContainer.dom);
        const rootPanel = new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.Panel({
            flex: true,
            collapsible: true,
            collapsed: false,
            collapseHorizontally: true,
            removable: false,
            headerText: HierarchyPanel.defaultHeaderText.toUpperCase(),
            scrollable: true,
            resizeMax: 1000
        });
        rootPanel.style.width = "100%";
        rootPanel.on(_playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.Panel.EVENT_CLICK, this.onRootPanelClicked.bind(this));
        rootContainer.append(rootPanel);
        _utils_pcui_utils__WEBPACK_IMPORTED_MODULE_1__.ContainerUtils.autoResize(rootContainer, rootPanel);
        this.createSearchOptions(rootPanel);
        const divider = new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.Divider();
        divider.style.flexShrink = "0";
        rootPanel.append(divider);
        // Create the views
        const sceneView = this._sceneView = new _views_scene_view__WEBPACK_IMPORTED_MODULE_2__.SceneView(this._selectionHandler, rootPanel);
        sceneView.onItemSelected.addDelegate(this.onItemSelected, this);
        sceneView.onItemDeselected.addDelegate(this.onItemDeselected, this);
        const searchView = this._searchView = new _views_search_view__WEBPACK_IMPORTED_MODULE_3__.SearchView(this._selectionHandler, rootPanel);
        searchView.onItemSelected.addDelegate(this.onItemSelected, this);
        searchView.onItemDeselected.addDelegate(this.onItemDeselected, this);
    }
    createSearchOptions(rootPanel) {
        const searchContainer = new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.Container();
        searchContainer.on(_playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.LabelGroup.EVENT_CLICK, (event) => {
            // Prevent the event from propagating to the root panel which would cause all entities to be deselected
            event.stopPropagation();
        });
        searchContainer.style.flexShrink = "0";
        rootPanel.append(searchContainer);
        // Input
        const inputContainer = new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.Container({
            flex: true,
            flexDirection: "row",
            height: 36
        });
        const filtersButton = new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.Button({ text: "Filters" });
        const filtersButtonStyle = filtersButton.style;
        filtersButtonStyle.height = "24px";
        filtersButtonStyle.lineHeight = "0px";
        inputContainer.append(filtersButton);
        searchContainer.append(inputContainer);
        const input = this._searchInput = new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.TextInput({ keyChange: true });
        input.placeholder = "Search";
        input.style.flex = "auto";
        input.dom.spellcheck = false;
        input.on("change", this.searchInternal.bind(this));
        inputContainer.append(input);
        const clearButton = this._clearSearchButton = new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.Button({ text: "X" });
        clearButton.hidden = true;
        clearButton.on(_playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.Button.EVENT_CLICK, () => input.value = "");
        const clearButtonStyle = clearButton.style;
        clearButtonStyle.height = "24px";
        clearButtonStyle.lineHeight = "0px";
        inputContainer.append(clearButton);
        // Filters
        const filterContainer = new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.Container();
        const filterContainerStyle = filterContainer.style;
        filterContainerStyle.overflow = "hidden";
        filterContainerStyle.transition = "height 0.2s";
        filterContainerStyle.height = "0px";
        searchContainer.append(filterContainer);
        let isShowingFilters = false;
        filtersButton.on(_playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.Button.EVENT_CLICK, () => {
            isShowingFilters = !isShowingFilters;
            filterContainer.style.height = isShowingFilters ? "90px" : "0px";
        });
        const filters = _views_search_view__WEBPACK_IMPORTED_MODULE_3__.SearchFilter.all;
        for (let length = filters.length, i = 0; i < length; i++) {
            const filter = filters[i];
            this.createSearchFilterElements(filter.id, filter.name, filterContainer);
        }
    }
    reset() {
        this.search("");
        const sceneView = this._sceneView;
        sceneView.reset();
        sceneView.isVisible = true;
        const searchView = this._searchView;
        searchView.reset();
        searchView.isVisible = false;
    }
    onRootPanelClicked() {
        this._selectionHandler.deselectAll();
    }
    // #region Selection
    onItemSelected(item, view) {
        const selectionHandler = this._selectionHandler;
        /*
         * Ignore if the node is already selected. This is very important, because when a path is expanded to reveal
         * several previously selected entities, the onItemSelected-event is fired again for all of these items. The
         * first of these events would automatically deselect the other items (default TreeView behavior), which we
         * don't want.
         */
        const node = view.getNode(item);
        if (!node || selectionHandler.isSelected(node)) {
            return;
        }
        // In case we're searching, deselect entities from the scene view before selecting a search result
        const selectedNodes = selectionHandler.selectedNodes;
        const searchView = this._searchView;
        if (searchView.isVisible) {
            for (let i = selectedNodes.length - 1; i >= 0; i--) {
                const selectedNode = selectedNodes[i];
                if (!searchView.isShowingNode(selectedNode)) {
                    selectionHandler.deselect(selectedNode);
                }
            }
        }
        else {
            /*
             * Deselect entities that are not currently visible (i.e. items that are inside collapsed items). It feels
             * weird to append entities to the current selection of non-visible entities. This only applies to the
             * scene view, because the search view does not expand or collapse items.
             */
            const sceneView = this._sceneView;
            for (let i = selectedNodes.length - 1; i >= 0; i--) {
                const selectedNode = selectedNodes[i];
                const item = sceneView.getItem(selectedNode);
                if (item) {
                    continue;
                }
                selectionHandler.deselect(selectedNode);
            }
        }
        if (node) {
            selectionHandler.select(node);
        }
    }
    onItemDeselected(item, view) {
        // Ignore deselection events for items that are being dragged. TreeView automatically deselects dragged items.
        if (view.treeView.isDragging) {
            return;
        }
        // When the search view is closed, its tree view is cleared which causes all of its items to be deselected.
        // We should ignore these events to avoid unintentionally deselecting entities.
        const searchView = this._searchView;
        if (view === searchView && !searchView.isVisible) {
            return;
        }
        /*
         * Ignore deselection when an item is destroyed. This can happen when a selected item in the search view is
         * removed because the search query is changed, or when an item in the scene view is removed because its parent
         * item is collapsed. The latter case requires a bit more robust checking though (see code below).
         */
        if (item.destroyed) {
            return;
        }
        // Ignore deselection events for items that are being destroyed because their parent items are collapsing
        let current = item;
        while ((current = current.parent)) {
            if (!(current instanceof _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.TreeViewItem)) {
                break;
            }
            if (!current.open) {
                return;
            }
        }
        const node = view.getNode(item);
        if (node) {
            this._selectionHandler.deselect(node);
        }
    }
    // #endregion
    // #region Searching
    search(query) {
        this._searchInput.value = query;
    }
    searchInternal() {
        const searchInput = this._searchInput.value;
        const hasSearchInput = !!searchInput;
        this._sceneView.isVisible = !hasSearchInput;
        const searchView = this._searchView;
        searchView.isVisible = hasSearchInput;
        this._clearSearchButton.hidden = !hasSearchInput;
        if (!hasSearchInput) {
            searchView.reset();
            return;
        }
        const filters = _views_search_view__WEBPACK_IMPORTED_MODULE_3__.SearchFilter.all.filter(searchFilter => this._searchFilterMask & searchFilter.id);
        const searchFunction = () => {
            const mangler = (text) => text.replace(/\s/g, ""); // Remove whitespaces
            const matcher = new RegExp(mangler(searchInput), "i"); // Ignore cases
            const filterArgs = new _views_search_view__WEBPACK_IMPORTED_MODULE_3__.SearchFilterArgs(searchInput, matcher, mangler);
            for (let length = filters.length, i = 0; i < length; i++) {
                const filter = filters[i];
                filter.execute(filterArgs);
            }
            return Array.from(filterArgs.results);
        };
        searchView.search(searchFunction);
    }
    createSearchFilterElements(filter, label, container) {
        const labelGroup = new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.LabelGroup({
            text: label,
            flexShrink: "0",
            flexDirection: "row-reverse",
            height: 15
        });
        labelGroup.label.style.width = "auto";
        labelGroup.style.justifyContent = "flex-end";
        container.append(labelGroup);
        const checkbox = new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.BooleanInput({ value: this._searchFilterMask & filter });
        checkbox.style.margin = "0px 8px 0px 0px";
        labelGroup.append(checkbox);
        checkbox.on(_playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.BooleanInput.EVENT_CLICK, () => {
            const isChecked = checkbox.value;
            if (isChecked) {
                this._searchFilterMask |= filter;
            }
            else {
                this._searchFilterMask &= ~filter;
            }
            this.searchInternal();
        });
    }
}
HierarchyPanel.defaultHeaderText = "Hierarchy";


/***/ }),

/***/ "./src/tools/hierarchy/views/hierarchy-view.ts":
/*!*****************************************************!*\
  !*** ./src/tools/hierarchy/views/hierarchy-view.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HierarchyView: () => (/* binding */ HierarchyView)
/* harmony export */ });
/* harmony import */ var _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @playcanvas/pcui */ "./node_modules/@playcanvas/pcui/dist/module/src/index.mjs");
/* harmony import */ var _utils_delegates_action__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../utils/delegates/action */ "./src/utils/delegates/action.ts");


class HierarchyView {
    get treeView() {
        return this._treeView;
    }
    get isVisible() {
        return !this.treeView.hidden;
    }
    set isVisible(show) {
        this.treeView.hidden = !show;
    }
    constructor(selectionHandler, rootPanel, treeViewArgs) {
        this._itemsByNode = new Map();
        this._nodesByItem = new Map();
        this.onShow = new _utils_delegates_action__WEBPACK_IMPORTED_MODULE_1__.Action();
        this.onItemSelected = new _utils_delegates_action__WEBPACK_IMPORTED_MODULE_1__.Action();
        this.onItemDeselected = new _utils_delegates_action__WEBPACK_IMPORTED_MODULE_1__.Action();
        this.selectionHandler = selectionHandler;
        selectionHandler.onSelected.addDelegate(this.onNodeSelected, this);
        selectionHandler.onDeselected.addDelegate(this.onNodeDeselected, this);
        const treeView = this._treeView = new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.TreeView(treeViewArgs);
        treeView.on(_playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.TreeView.EVENT_SHOW, this.onShowInternal.bind(this));
        treeView.on(_playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.TreeView.EVENT_SELECT, this.onItemSelectedInternal.bind(this));
        treeView.on(_playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.TreeView.EVENT_DESELECT, this.onItemDeselectedInternal.bind(this));
        treeView.on(_playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.TreeView.EVENT_RENAME, this.onItemRenamedInternal.bind(this));
        rootPanel.append(treeView);
        this._updateInterval = setInterval(this.updateItems.bind(this), 250);
    }
    destroy() {
        clearInterval(this._updateInterval);
        this._updateInterval = undefined;
        const treeView = this.treeView;
        treeView.clearTreeItems();
        treeView.destroy();
        const selectionHandler = this.selectionHandler;
        selectionHandler.onSelected.removeDelegate(this.onNodeSelected, this);
        selectionHandler.onDeselected.removeDelegate(this.onNodeDeselected, this);
    }
    reset() {
        this.treeView.clearTreeItems();
    }
    updateItems() {
        if (!this.isVisible) {
            return;
        }
        const itemEntries = this._itemsByNode.entries();
        for (const entry of itemEntries) {
            const node = entry[0];
            const item = entry[1];
            if (item.enabled !== node.enabled) {
                item.enabled = node.enabled;
            }
            if (item.text !== node.name) {
                item.text = node.name;
            }
        }
    }
    onShowInternal() {
        // Ensure item selection is in sync with our node selection
        const selectedNodes = this.selectionHandler.selectedNodes;
        for (let i = 0; i < selectedNodes.length; i++) {
            this.onNodeSelected(selectedNodes[i]);
        }
        // Update items to reflect changes that may have occurred while we were hidden (node renames, toggles etc.)
        this.updateItems();
        this.onShow.safeInvoke();
    }
    // #region Item management
    createItem(node, name) {
        const item = new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.TreeViewItem({
            text: name || node.name,
            enabled: node.enabled
        });
        this._nodesByItem.set(item, node);
        this._itemsByNode.set(node, item);
        item.on(_playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.Element.EVENT_DESTROY, this.onItemDestroyedInternal.bind(this));
        node.on("destroy", this.onNodeDestroyed, this);
        return item;
    }
    getItem(node) {
        return this._itemsByNode.get(node);
    }
    getItemsByNode(output) {
        output.clear();
        for (const [node, item] of this._itemsByNode) {
            output.set(node, item);
        }
    }
    onItemSelectedInternal(item) {
        this.onItemSelected.safeInvoke(item, this);
    }
    onItemDeselectedInternal(item) {
        this.onItemDeselected.safeInvoke(item, this);
    }
    onItemRenamedInternal(item, newName) {
        const node = this._nodesByItem.get(item);
        if (node) {
            node.name = newName;
        }
    }
    onItemDestroyedInternal(_dom, item) {
        const node = this._nodesByItem.get(item);
        if (!node) {
            console.warn(`Failed to find graph node for destroyed item "${item.text}".`);
            return undefined;
        }
        this._itemsByNode.delete(node);
        this._nodesByItem.delete(item);
        node.off("destroy", this.onNodeDestroyed, this);
        return node;
    }
    // #endregion
    // #region Graph node management
    getNode(item) {
        return this._nodesByItem.get(item);
    }
    isShowingNode(node) {
        return this._itemsByNode.has(node);
    }
    onNodeSelected(node) {
        const item = this._itemsByNode.get(node);
        if (item) {
            item.selected = true;
        }
    }
    onNodeDeselected(node) {
        const item = this._itemsByNode.get(node);
        if (item) {
            item.selected = false;
        }
    }
    onNodeDestroyed(node) {
        const item = this._itemsByNode.get(node);
        if (item) {
            item.destroy();
        }
    }
}


/***/ }),

/***/ "./src/tools/hierarchy/views/scene-view.ts":
/*!*************************************************!*\
  !*** ./src/tools/hierarchy/views/scene-view.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SceneView: () => (/* binding */ SceneView)
/* harmony export */ });
/* harmony import */ var _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @playcanvas/pcui */ "./node_modules/@playcanvas/pcui/dist/module/src/index.mjs");
/* harmony import */ var playcanvas__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! playcanvas */ "playcanvas");
/* harmony import */ var playcanvas__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(playcanvas__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _utils_collections_stack__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../utils/collections/stack */ "./src/utils/collections/stack.ts");
/* harmony import */ var _utils_pcui_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../utils/pcui-utils */ "./src/utils/pcui-utils.ts");
/* harmony import */ var _hierarchy_view__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./hierarchy-view */ "./src/tools/hierarchy/views/hierarchy-view.ts");





class SceneView extends _hierarchy_view__WEBPACK_IMPORTED_MODULE_4__.HierarchyView {
    constructor(selectionHandler, rootPanel) {
        super(selectionHandler, rootPanel, {
            readOnly: false,
            allowDrag: true,
            allowRenaming: true,
            allowReordering: true
        });
        this._expandedNodes = new Set();
        this.treeView.on(_playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.TreeView.EVENT_REPARENT, this.onItemReparented.bind(this));
    }
    reset() {
        super.reset();
        const app = playcanvas__WEBPACK_IMPORTED_MODULE_1__.Application.getApplication();
        const appRoot = app.root;
        appRoot.name = "App Root";
        const rootItem = this.createItem(appRoot);
        this.treeView.append(rootItem);
        this.expandItem(rootItem);
    }
    // #region Graph node management
    addNode(newNode, parentItem) {
        // To ensure proper ordering for the new TreeViewItem, we'll need to find the node's child index first. We'll
        // do a reverse search since it's likely the new node was added as the last child.
        const parentNode = newNode.parent;
        const childNodes = parentNode.children;
        let newNodeIndex = -1;
        for (let i = childNodes.length - 1; i >= 0; i--) {
            if (childNodes[i] === newNode) {
                newNodeIndex = i;
                break;
            }
        }
        if (newNodeIndex === -1) {
            console.error(`Failed to insert TreeViewItem "${newNode.name}": failed to determine the graph node's index.`);
            return;
        }
        const newItem = this.createItem(newNode);
        // Insert the item
        if (newNodeIndex === 0) {
            _utils_pcui_utils__WEBPACK_IMPORTED_MODULE_3__.TreeViewUtils.prepend(newItem, parentItem);
        }
        else {
            /*
            To insert the new TreeViewItem, we'll have to determine which child item we should insert before. We'll
            traverse the child items as well as the child entities last-to-first simultaneously. For each child item,
            we'll traverse further down the child entities to find a match. When a match is found, the child item is
            marked as the candidate for insertion, after which we move on to the next child item. We'll traverse
            through both collections in this fashion until the newNode is reached. We can then insert the new item
            before the candidate item. If no candidate item was found, we can safely insert the new item at the end.
            
            Here's an example situation:
            Index   Entities (7)        Tree View Items (3)
            ================================================================
            0       Scene Root          Scene Root
            1       UI Root
            2       Persistent Root     Persistent Root
            3       Game Mode
            4       * Game State *
            5       Client
            6       Player 1            Player1             < insert before
            7       Player 2

            In this example we want to create and insert an item for "Game State" (marked with *). Using this algorithm,
            we'll find that "Player 1" is the best item to insert before to ensure proper ordering. The reason there are
            gaps in the TreeViewItems is because child insertion & removal events aren't always properly ordered.
            */
            let candidateItem;
            let childItems = parentItem.dom.childNodes;
            let nodeIndex = childNodes.length - 1;
            for (let itemIndex = childItems.length - 1; itemIndex >= 0 && nodeIndex > newNodeIndex; itemIndex--) {
                const childItem = childItems[itemIndex].ui;
                if (!(childItem instanceof _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.TreeViewItem)) {
                    continue;
                }
                const childItemNode = this.getNode(childItem);
                while (nodeIndex > newNodeIndex) {
                    const node = childNodes[nodeIndex--];
                    if (node === childItemNode) {
                        // Continue to the next child item
                        candidateItem = childItem;
                        break;
                    }
                }
            }
            if (candidateItem) {
                parentItem.appendBefore(newItem, candidateItem);
            }
            else {
                parentItem.append(newItem);
            }
        }
        // Make sure to select the item if its associated node is selected. This will be the case when an item is
        // expanded to reveal entities that were previously selected.
        if (this.selectionHandler.isSelected(newNode)) {
            newItem.selected = true;
        }
        if (this._expandedNodes.has(newNode)) {
            this.expandItem(newItem);
        }
        else {
            this.onItemCollapsed(newItem);
        }
    }
    revealNode(node, select) {
        let item = this.getItem(node);
        if (!item) {
            const path = new _utils_collections_stack__WEBPACK_IMPORTED_MODULE_2__.Stack();
            let current = node;
            while (current) {
                path.push(current);
                current = current.parent;
            }
            while (path.count > 0 && (current = path.pop())) {
                const item = this.getItem(current);
                if (!item) {
                    console.error(`Failed to reveal graph node "${node.name}": parent item not found.`);
                    break;
                }
                this.expandItem(item);
            }
            if (!(item = this.getItem(node))) {
                console.error(`Failed to reveal graph node "${node.name}": item not found.`);
                return;
            }
        }
        if (select) {
            item.selected = true;
        }
    }
    onNodeChildInsert(child) {
        if (this.getItem(child)) {
            console.warn(`Failed to insert TreeViewItem for graph node "${child.name}": item already exists.`);
            return;
        }
        const parentItem = this.getItem(child.parent);
        if (!parentItem) {
            console.error(`Failed to insert TreeViewItem for graph node "${child.name}": parent item not found.`);
            return;
        }
        if (parentItem.open) {
            this.addNode(child, parentItem);
        }
        else if (parentItem.numChildren === 0) {
            // Add a dummy item so that the expand arrow shows up
            parentItem.append(new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.TreeViewItem());
        }
    }
    onNodeChildRemove(child) {
        // Note that it's fine if no item exists yet for the child. In certain cases, a child remove event may be fired
        // by PlayCanvas before the child insert event, which is why the item may not exist yet.
        const item = this.getItem(child);
        if (item) {
            item.destroy();
        }
    }
    onNodeSelected(node) {
        // To ensure we can select the node's associated item, we must reveal the item first
        if (this.isVisible) {
            this.revealNode(node, false);
        }
        super.onNodeSelected(node);
    }
    // #endregion
    // #region Item management
    createItem(node, name) {
        const item = super.createItem(node, name);
        item.on(_playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.TreeViewItem.EVENT_OPEN, this.expandItem.bind(this));
        item.on(_playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.TreeViewItem.EVENT_CLOSE, this.collapseItem.bind(this));
        node.on("childinsert", this.onNodeChildInsert, this);
        node.on("childremove", this.onNodeChildRemove, this);
        return item;
    }
    onItemDestroyedInternal(dom, item) {
        const node = super.onItemDestroyedInternal(dom, item);
        if (node) {
            node.off("childinsert", this.onNodeChildInsert, this);
            node.off("childremove", this.onNodeChildRemove, this);
        }
        return node;
    }
    expandItem(item) {
        const node = this.getNode(item);
        if (this._expandedNodes.has(node) && item.open) {
            return;
        }
        this.setNodeExpanded(node, true);
        _utils_pcui_utils__WEBPACK_IMPORTED_MODULE_3__.TreeViewUtils.destroyChildren(item); // Destroys the dummy item
        const children = node.children;
        for (let i = 0; i < children.length; i++) {
            this.addNode(children[i], item);
        }
        // A small PCUI quirk: items can only be opened if there are children
        item.open = true;
    }
    collapseItem(item) {
        const node = this.getNode(item);
        this.setNodeExpanded(node, false);
        _utils_pcui_utils__WEBPACK_IMPORTED_MODULE_3__.TreeViewUtils.destroyChildren(item);
        item.open = false;
        this.onItemCollapsed(item);
    }
    setNodeExpanded(node, expanded) {
        const expandedNodes = this._expandedNodes;
        if (expanded === expandedNodes.has(node)) {
            return;
        }
        if (expanded) {
            this._expandedNodes.add(node);
            node.on("destroy", this.onExpandedNodeDestroyed, this);
        }
        else {
            this._expandedNodes.delete(node);
            node.off("destroy", this.onExpandedNodeDestroyed, this);
        }
    }
    onExpandedNodeDestroyed(node) {
        this.setNodeExpanded(node, false);
    }
    onItemCollapsed(item) {
        // Add a dummy item so that the expand arrow shows up
        const node = this.getNode(item);
        if (node.children.length > 0) {
            item.append(new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.TreeViewItem());
        }
    }
    onItemReparented(reparentEvents) {
        for (let i = 0; i < reparentEvents.length; i++) {
            const reparentEvent = reparentEvents[i];
            const item = reparentEvent.item;
            const node = this.getNode(item);
            if (!node) {
                continue;
            }
            const newParentItem = reparentEvent.newParent;
            const newParent = this.getNode(newParentItem);
            if (!newParent) {
                console.warn(`Failed to reparent graph node "${node.name}": parent node "${newParentItem.text}" ` +
                    `not found.`);
                continue;
            }
            let insertionIndex = -1;
            const childNodes = newParentItem.dom.childNodes;
            for (let j = 0, childItemIndex = -1; j < childNodes.length; j++) {
                const childItem = childNodes[j].ui;
                if (!(childItem instanceof _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.TreeViewItem)) {
                    continue;
                }
                childItemIndex++;
                if (childItem === item) {
                    insertionIndex = childItemIndex;
                    break;
                }
            }
            if (insertionIndex === -1) {
                console.warn(`Failed to determine the insertion index whilst reparenting graph node "${node.name}".`);
                node.reparent(newParent);
            }
            else {
                node.reparent(newParent, insertionIndex);
            }
        }
    }
}


/***/ }),

/***/ "./src/tools/hierarchy/views/search-view.ts":
/*!**************************************************!*\
  !*** ./src/tools/hierarchy/views/search-view.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SearchFilter: () => (/* binding */ SearchFilter),
/* harmony export */   SearchFilterArgs: () => (/* binding */ SearchFilterArgs),
/* harmony export */   SearchFilterId: () => (/* binding */ SearchFilterId),
/* harmony export */   SearchView: () => (/* binding */ SearchView)
/* harmony export */ });
/* harmony import */ var playcanvas__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! playcanvas */ "playcanvas");
/* harmony import */ var playcanvas__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(playcanvas__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _hierarchy_view__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./hierarchy-view */ "./src/tools/hierarchy/views/hierarchy-view.ts");


class SearchView extends _hierarchy_view__WEBPACK_IMPORTED_MODULE_1__.HierarchyView {
    constructor(selectionHandler, rootPanel) {
        super(selectionHandler, rootPanel, {
            readOnly: false,
            allowDrag: false,
            allowRenaming: true,
            allowReordering: false
        });
        this._resultUpdateMap = new Map();
        this._lastSearchTime = -1;
        this._tickInterval = setInterval(() => this.update(), 100);
    }
    update() {
        if (!this._searchFunction || performance.now() - this._lastSearchTime < 1000) {
            return;
        }
        this.refreshSearch();
    }
    destroy() {
        super.destroy();
        clearInterval(this._tickInterval);
        this._tickInterval = undefined;
    }
    reset() {
        super.reset();
        this._searchFunction = undefined;
    }
    search(searchFunction) {
        if (searchFunction === this._searchFunction) {
            return;
        }
        this._searchFunction = searchFunction;
        const treeView = this.treeView;
        treeView.hidden = !searchFunction;
        treeView.clearTreeItems();
        if (!searchFunction) {
            return;
        }
        const nodes = searchFunction();
        for (const node of nodes) {
            this.addSearchResult(node);
        }
        this.onSearchCompleted();
    }
    refreshSearch() {
        if (!this.isVisible || !this._searchFunction) {
            return;
        }
        const updateMap = this._resultUpdateMap;
        updateMap.clear();
        this.getItemsByNode(updateMap);
        const resultingNodes = this._searchFunction();
        for (let length = resultingNodes.length, i = 0; i < length; i++) {
            const node = resultingNodes[i];
            if (!updateMap.has(node)) {
                this.addSearchResult(node);
            }
            updateMap.delete(node);
        }
        for (const item of updateMap.values()) {
            this.treeView.remove(item);
        }
        updateMap.clear();
        this.onSearchCompleted();
    }
    addSearchResult(node) {
        const item = this.createItem(node);
        this.treeView.append(item);
        if (this.selectionHandler.isSelected(node)) {
            item.selected = true;
        }
    }
    onSearchCompleted() {
        this._lastSearchTime = performance.now();
    }
}
var SearchFilterId;
(function (SearchFilterId) {
    SearchFilterId[SearchFilterId["name"] = 1] = "name";
    SearchFilterId[SearchFilterId["componentType"] = 2] = "componentType";
    SearchFilterId[SearchFilterId["scriptType"] = 4] = "scriptType";
    SearchFilterId[SearchFilterId["tags"] = 8] = "tags";
})(SearchFilterId || (SearchFilterId = {}));
class SearchFilter {
    constructor(id, name, execute) {
        this.id = id;
        this.name = name;
        this.execute = execute;
    }
}
SearchFilter.all = [
    new SearchFilter(SearchFilterId.name, "Name", args => {
        const matcher = args.matcher;
        const simplifyName = args.simplifyName;
        const results = args.results;
        const app = playcanvas__WEBPACK_IMPORTED_MODULE_0__.Application.getApplication();
        const nodes = app.root.find((node) => {
            return matcher.test(simplifyName(node.name));
        });
        for (let length = nodes.length, i = 0; i < length; i++) {
            results.add(nodes[i]);
        }
    }),
    new SearchFilter(SearchFilterId.componentType, "Component Type", args => {
        const matcher = args.matcher;
        const results = args.results;
        const app = playcanvas__WEBPACK_IMPORTED_MODULE_0__.Application.getApplication();
        const appRoot = app.root;
        const systems = app.systems;
        for (const componentName in systems) {
            if (!systems.hasOwnProperty(componentName)) {
                continue;
            }
            if (matcher.test(componentName)) {
                const system = systems[componentName];
                const store = system.store;
                if (!store) {
                    continue;
                }
                for (const guid in store) {
                    // Ignore templates
                    const item = store[guid];
                    const entity = item.entity;
                    if (entity.root !== appRoot) {
                        continue;
                    }
                    results.add(item.entity);
                }
            }
        }
    }),
    new SearchFilter(SearchFilterId.scriptType, "Script Type", args => {
        const matcher = args.matcher;
        const simplifyName = args.simplifyName;
        const results = args.results;
        const app = playcanvas__WEBPACK_IMPORTED_MODULE_0__.Application.getApplication();
        const appRoot = app.root;
        const scriptComponentSystem = app.systems.script;
        const scriptComponents = scriptComponentSystem._components.items;
        for (let length = scriptComponents.length, i = 0; i < length; i++) {
            const scriptComponent = scriptComponents[i];
            const entity = scriptComponent.entity;
            // Ignore templates
            if (entity.root !== appRoot) {
                continue;
            }
            const scripts = scriptComponent.scripts;
            for (let length = scripts.length, j = 0; j < length; j++) {
                const script = scripts[j];
                if (matcher.test(simplifyName(script.constructor.name))) {
                    results.add(entity);
                }
            }
        }
    }),
    new SearchFilter(SearchFilterId.tags, "Tags", args => {
        const app = playcanvas__WEBPACK_IMPORTED_MODULE_0__.Application.getApplication();
        const nodes = app.root.findByTag(args.input);
        const results = args.results;
        for (let length = nodes.length, i = 0; i < length; i++) {
            const node = nodes[i];
            results.add(node);
        }
    })
];
class SearchFilterArgs {
    constructor(input, matcher, simplifyName) {
        this.input = input;
        this.matcher = matcher;
        this.simplifyName = simplifyName;
        this.results = new Set();
    }
}


/***/ }),

/***/ "./src/tools/inspector/component-inspectors/component-inspector-registry.ts":
/*!**********************************************************************************!*\
  !*** ./src/tools/inspector/component-inspectors/component-inspector-registry.ts ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ComponentInspectorRegistry: () => (/* binding */ ComponentInspectorRegistry)
/* harmony export */ });
/* harmony import */ var playcanvas__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! playcanvas */ "playcanvas");
/* harmony import */ var playcanvas__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(playcanvas__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _rigid_body_component_inspector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rigid-body-component-inspector */ "./src/tools/inspector/component-inspectors/rigid-body-component-inspector.ts");
/* harmony import */ var _script_script_component_inspector__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./script/script-component-inspector */ "./src/tools/inspector/component-inspectors/script/script-component-inspector.ts");
/* harmony import */ var _unsupported_component_inspector__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./unsupported-component-inspector */ "./src/tools/inspector/component-inspectors/unsupported-component-inspector.ts");




class ComponentInspectorRegistry {
    static getInspector(componentType) {
        return this._inspectors.get(componentType) || _unsupported_component_inspector__WEBPACK_IMPORTED_MODULE_3__.UnsupportedComponentInspector;
    }
}
ComponentInspectorRegistry._inspectors = new Map([
    [playcanvas__WEBPACK_IMPORTED_MODULE_0__.RigidBodyComponent, _rigid_body_component_inspector__WEBPACK_IMPORTED_MODULE_1__.RigidBodyComponentInspector],
    [playcanvas__WEBPACK_IMPORTED_MODULE_0__.ScriptComponent, _script_script_component_inspector__WEBPACK_IMPORTED_MODULE_2__.ScriptComponentInspector]
]);


/***/ }),

/***/ "./src/tools/inspector/component-inspectors/component-inspector.ts":
/*!*************************************************************************!*\
  !*** ./src/tools/inspector/component-inspectors/component-inspector.ts ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ComponentInspector: () => (/* binding */ ComponentInspector)
/* harmony export */ });
/* harmony import */ var _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @playcanvas/pcui */ "./node_modules/@playcanvas/pcui/dist/module/src/index.mjs");
/* harmony import */ var _fields__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../fields */ "./src/tools/inspector/fields/index.ts");


const getStateLabel = (enabled) => enabled ? "ON" : "OFF";
class ComponentInspector extends _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.Panel {
    constructor(component, headerText) {
        super({
            flex: true,
            collapsible: true,
            collapsed: false,
            collapseHorizontally: false,
            removable: false,
            headerText: headerText,
            scrollable: false
        });
        this.component = component;
        const headerStyle = this.header.style;
        headerStyle.padding = "0px 5px 0px 10px";
        const contentStyle = this.content.style;
        contentStyle.padding = "3px 10px";
        contentStyle.gap = "6px";
        this.createToggle(component, this.header);
    }
    createToggle(togglable, parent) {
        const toggle = new _fields__WEBPACK_IMPORTED_MODULE_1__.BooleanField({
            type: "toggle",
            label: getStateLabel(togglable.enabled),
            property: {
                target: togglable,
                name: "enabled"
            },
            value: togglable.enabled,
            parent: parent
        });
        toggle.booleanInput.on('change', enabled => label.text = getStateLabel(enabled));
        const label = toggle.labelGroup.label;
        label.width = "auto";
        const labelClass = label.class;
        labelClass.remove("font-regular");
        labelClass.add("font-bold");
    }
}


/***/ }),

/***/ "./src/tools/inspector/component-inspectors/rigid-body-component-inspector.ts":
/*!************************************************************************************!*\
  !*** ./src/tools/inspector/component-inspectors/rigid-body-component-inspector.ts ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RigidBodyComponentInspector: () => (/* binding */ RigidBodyComponentInspector)
/* harmony export */ });
/* harmony import */ var _fields__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../fields */ "./src/tools/inspector/fields/index.ts");
/* harmony import */ var _component_inspector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./component-inspector */ "./src/tools/inspector/component-inspectors/component-inspector.ts");


class RigidBodyComponentInspector extends _component_inspector__WEBPACK_IMPORTED_MODULE_1__.ComponentInspector {
    constructor(component) {
        super(component, "RIGID BODY");
        this.flex = true;
        this.flexDirection = "column";
        const content = this.content;
        const style = content.style;
        // style.padding = "3px 10px";
        style.gap = "6px";
        _fields__WEBPACK_IMPORTED_MODULE_0__["default"].createString({ label: "Type", value: "<< Unsupported >>", readOnly: true, parent: content }); // Soon
        _fields__WEBPACK_IMPORTED_MODULE_0__["default"].createNumber({ property: { target: component, name: "mass" }, min: 0, parent: content });
        _fields__WEBPACK_IMPORTED_MODULE_0__["default"].createNumber({ property: { target: component, name: "linearDamping" }, min: 0, parent: content });
        _fields__WEBPACK_IMPORTED_MODULE_0__["default"].createNumber({ property: { target: component, name: "angularDamping" }, min: 0, parent: content });
        _fields__WEBPACK_IMPORTED_MODULE_0__["default"].createVec3({ property: { target: component, name: "linearFactor" }, parent: content });
        _fields__WEBPACK_IMPORTED_MODULE_0__["default"].createVec3({ property: { target: component, name: "angularFactor" }, parent: content });
        _fields__WEBPACK_IMPORTED_MODULE_0__["default"].createNumber({ property: { target: component, name: "friction" }, min: 0, max: 1, parent: content });
        _fields__WEBPACK_IMPORTED_MODULE_0__["default"].createNumber({ property: { target: component, name: "restitution" }, min: 0, max: 1, parent: content });
    }
}


/***/ }),

/***/ "./src/tools/inspector/component-inspectors/script/attribute-collection-inspector.ts":
/*!*******************************************************************************************!*\
  !*** ./src/tools/inspector/component-inspectors/script/attribute-collection-inspector.ts ***!
  \*******************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AttributeCollectionInspector: () => (/* binding */ AttributeCollectionInspector)
/* harmony export */ });
/* harmony import */ var _property__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../property */ "./src/tools/inspector/property.ts");
/* harmony import */ var _attribute__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./attribute */ "./src/tools/inspector/component-inspectors/script/attribute.ts");
/* harmony import */ var _attribute_inspectors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./attribute-inspectors */ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/index.ts");



class AttributeCollectionInspector {
    constructor(target, attributes) {
        this.target = target;
        this.attributes = attributes;
    }
    build(rootContainer, parentProperty) {
        const style = rootContainer.style;
        style.padding = "3px 0px 3px 10px";
        style.gap = "6px";
        const attributes = this.attributes;
        for (let length = attributes.length, i = 0; i < length; i++) {
            const attribute = attributes[i];
            const inspectorType = attributeInspectorRegistry.get(attribute.type) || _attribute_inspectors__WEBPACK_IMPORTED_MODULE_2__.UnsupportedAttributeInspector;
            const inspector = new inspectorType();
            const property = new _property__WEBPACK_IMPORTED_MODULE_0__.Property({
                target: this.target,
                name: attribute.name,
                parent: parentProperty,
            });
            inspector.build(attribute, property);
            rootContainer.append(inspector);
        }
    }
}
const attributeInspectorRegistry = new Map([
    [_attribute__WEBPACK_IMPORTED_MODULE_1__.AttributeType.boolean, _attribute_inspectors__WEBPACK_IMPORTED_MODULE_2__.BooleanAttributeInspector],
    [_attribute__WEBPACK_IMPORTED_MODULE_1__.AttributeType.number, _attribute_inspectors__WEBPACK_IMPORTED_MODULE_2__.NumberAttributeInspector],
    [_attribute__WEBPACK_IMPORTED_MODULE_1__.AttributeType.string, _attribute_inspectors__WEBPACK_IMPORTED_MODULE_2__.StringAttributeInspector],
    [_attribute__WEBPACK_IMPORTED_MODULE_1__.AttributeType.vec2, _attribute_inspectors__WEBPACK_IMPORTED_MODULE_2__.Vec2AttributeInspector],
    [_attribute__WEBPACK_IMPORTED_MODULE_1__.AttributeType.vec3, _attribute_inspectors__WEBPACK_IMPORTED_MODULE_2__.Vec3AttributeInspector],
    [_attribute__WEBPACK_IMPORTED_MODULE_1__.AttributeType.vec4, _attribute_inspectors__WEBPACK_IMPORTED_MODULE_2__.Vec4AttributeInspector],
    [_attribute__WEBPACK_IMPORTED_MODULE_1__.AttributeType.json, _attribute_inspectors__WEBPACK_IMPORTED_MODULE_2__.JsonAttributeInspector],
    [_attribute__WEBPACK_IMPORTED_MODULE_1__.AttributeType.entity, _attribute_inspectors__WEBPACK_IMPORTED_MODULE_2__.EntityAttributeInspector],
    [_attribute__WEBPACK_IMPORTED_MODULE_1__.AttributeType.asset, _attribute_inspectors__WEBPACK_IMPORTED_MODULE_2__.AssetAttributeInspector]
]);


/***/ }),

/***/ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/asset-attribute-inspector.ts":
/*!***********************************************************************************************************!*\
  !*** ./src/tools/inspector/component-inspectors/script/attribute-inspectors/asset-attribute-inspector.ts ***!
  \***********************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AssetAttributeInspector: () => (/* binding */ AssetAttributeInspector)
/* harmony export */ });
/* harmony import */ var _tools_inspector_fields__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/tools/inspector/fields */ "./src/tools/inspector/fields/index.ts");
/* harmony import */ var _attribute_inspector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./attribute-inspector */ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/attribute-inspector.ts");


class AssetAttributeInspector extends _attribute_inspector__WEBPACK_IMPORTED_MODULE_1__.AttributeInspector {
    buildInternal(_attribute, _property, fieldArgs) {
        _tools_inspector_fields__WEBPACK_IMPORTED_MODULE_0__["default"].createAsset(fieldArgs);
    }
}


/***/ }),

/***/ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/attribute-inspector.ts":
/*!*****************************************************************************************************!*\
  !*** ./src/tools/inspector/component-inspectors/script/attribute-inspectors/attribute-inspector.ts ***!
  \*****************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AttributeInspector: () => (/* binding */ AttributeInspector)
/* harmony export */ });
/* harmony import */ var _tools_inspector_fields__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/tools/inspector/fields */ "./src/tools/inspector/fields/index.ts");
/* harmony import */ var _tools_inspector_property__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/tools/inspector/property */ "./src/tools/inspector/property.ts");
/* harmony import */ var _utils_delegates_action__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/utils/delegates/action */ "./src/utils/delegates/action.ts");
/* harmony import */ var _utils_string_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/string-utils */ "./src/utils/string-utils.ts");
/* harmony import */ var _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @playcanvas/pcui */ "./node_modules/@playcanvas/pcui/dist/module/src/index.mjs");





class AttributeInspector extends _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_4__.Container {
    constructor() {
        super(...arguments);
        this._fields = new Array();
        this.onPropertyUpdated = new _utils_delegates_action__WEBPACK_IMPORTED_MODULE_2__.Action();
    }
    build(attribute, property) {
        if (attribute.array) {
            this.showArray(attribute, property);
        }
        else {
            this.buildInternal(attribute, property, {
                property: property,
                parent: this,
            });
        }
    }
    showArray(attribute, property) {
        const array = property.value;
        if (!Array.isArray(array)) {
            console.warn(`Failed to create attribute inspector: property "${attribute.name}" is not an array.`);
            return undefined;
        }
        const label = attribute.title || _utils_string_utils__WEBPACK_IMPORTED_MODULE_3__.StringUtils.nameToTitle(attribute.name);
        const labelGroup = _tools_inspector_fields__WEBPACK_IMPORTED_MODULE_0__.Field.createLabelGroup(label, !attribute.title);
        labelGroup.labelAlignTop = true;
        // Create the array container
        const arrayContainer = new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_4__.Container({ flex: true, flexDirection: "column" });
        const arrayContainerStyle = arrayContainer.style;
        arrayContainerStyle.margin = "0px";
        arrayContainerStyle.gap = "6px";
        labelGroup.append(arrayContainer);
        // Create array entries
        for (let length = array.length, i = 0; i < length; i++) {
            const entryProperty = new _tools_inspector_property__WEBPACK_IMPORTED_MODULE_1__.Property({
                target: property.target,
                name: property.name,
                index: i,
                parent: property
            });
            this.buildInternal(attribute, entryProperty, {
                property: entryProperty,
                parent: arrayContainer,
            });
            // const style = entryContainer.style;
            // style.display = "flex";
            // style.flexDirection = "column";
        }
        return labelGroup;
    }
    createField(fieldType, args) {
        var _a;
        const field = new fieldType(args);
        (_a = field.property) === null || _a === void 0 ? void 0 : _a.onValueChanged.addDelegate(property => this.onPropertyUpdated.safeInvoke(property));
        this._fields.push(field);
        return field;
    }
}


/***/ }),

/***/ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/boolean-attribute-inspector.ts":
/*!*************************************************************************************************************!*\
  !*** ./src/tools/inspector/component-inspectors/script/attribute-inspectors/boolean-attribute-inspector.ts ***!
  \*************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BooleanAttributeInspector: () => (/* binding */ BooleanAttributeInspector)
/* harmony export */ });
/* harmony import */ var _tools_inspector_fields__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/tools/inspector/fields */ "./src/tools/inspector/fields/index.ts");
/* harmony import */ var _attribute_inspector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./attribute-inspector */ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/attribute-inspector.ts");


class BooleanAttributeInspector extends _attribute_inspector__WEBPACK_IMPORTED_MODULE_1__.AttributeInspector {
    buildInternal(_attribute, _property, fieldArgs) {
        _tools_inspector_fields__WEBPACK_IMPORTED_MODULE_0__["default"].createCheckbox(fieldArgs);
    }
}


/***/ }),

/***/ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/entity-attribute-inspector.ts":
/*!************************************************************************************************************!*\
  !*** ./src/tools/inspector/component-inspectors/script/attribute-inspectors/entity-attribute-inspector.ts ***!
  \************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EntityAttributeInspector: () => (/* binding */ EntityAttributeInspector)
/* harmony export */ });
/* harmony import */ var _tools_inspector_fields__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/tools/inspector/fields */ "./src/tools/inspector/fields/index.ts");
/* harmony import */ var _attribute_inspector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./attribute-inspector */ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/attribute-inspector.ts");


class EntityAttributeInspector extends _attribute_inspector__WEBPACK_IMPORTED_MODULE_1__.AttributeInspector {
    buildInternal(_attribute, _property, fieldArgs) {
        _tools_inspector_fields__WEBPACK_IMPORTED_MODULE_0__["default"].createEntity(fieldArgs);
    }
}


/***/ }),

/***/ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/index.ts":
/*!***************************************************************************************!*\
  !*** ./src/tools/inspector/component-inspectors/script/attribute-inspectors/index.ts ***!
  \***************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AssetAttributeInspector: () => (/* reexport safe */ _asset_attribute_inspector__WEBPACK_IMPORTED_MODULE_0__.AssetAttributeInspector),
/* harmony export */   AttributeInspector: () => (/* reexport safe */ _attribute_inspector__WEBPACK_IMPORTED_MODULE_1__.AttributeInspector),
/* harmony export */   BooleanAttributeInspector: () => (/* reexport safe */ _boolean_attribute_inspector__WEBPACK_IMPORTED_MODULE_2__.BooleanAttributeInspector),
/* harmony export */   EntityAttributeInspector: () => (/* reexport safe */ _entity_attribute_inspector__WEBPACK_IMPORTED_MODULE_3__.EntityAttributeInspector),
/* harmony export */   JsonAttributeInspector: () => (/* reexport safe */ _json_attribute_inspector__WEBPACK_IMPORTED_MODULE_4__.JsonAttributeInspector),
/* harmony export */   NumberAttributeInspector: () => (/* reexport safe */ _number_attribute_inspector__WEBPACK_IMPORTED_MODULE_5__.NumberAttributeInspector),
/* harmony export */   StringAttributeInspector: () => (/* reexport safe */ _string_attribute_inspector__WEBPACK_IMPORTED_MODULE_6__.StringAttributeInspector),
/* harmony export */   UnsupportedAttributeInspector: () => (/* reexport safe */ _unsupported_attribute_inspector__WEBPACK_IMPORTED_MODULE_7__.UnsupportedAttributeInspector),
/* harmony export */   Vec2AttributeInspector: () => (/* reexport safe */ _vector_attribute_inspectors__WEBPACK_IMPORTED_MODULE_8__.Vec2AttributeInspector),
/* harmony export */   Vec3AttributeInspector: () => (/* reexport safe */ _vector_attribute_inspectors__WEBPACK_IMPORTED_MODULE_8__.Vec3AttributeInspector),
/* harmony export */   Vec4AttributeInspector: () => (/* reexport safe */ _vector_attribute_inspectors__WEBPACK_IMPORTED_MODULE_8__.Vec4AttributeInspector)
/* harmony export */ });
/* harmony import */ var _asset_attribute_inspector__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./asset-attribute-inspector */ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/asset-attribute-inspector.ts");
/* harmony import */ var _attribute_inspector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./attribute-inspector */ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/attribute-inspector.ts");
/* harmony import */ var _boolean_attribute_inspector__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./boolean-attribute-inspector */ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/boolean-attribute-inspector.ts");
/* harmony import */ var _entity_attribute_inspector__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./entity-attribute-inspector */ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/entity-attribute-inspector.ts");
/* harmony import */ var _json_attribute_inspector__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./json-attribute-inspector */ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/json-attribute-inspector.ts");
/* harmony import */ var _number_attribute_inspector__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./number-attribute-inspector */ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/number-attribute-inspector.ts");
/* harmony import */ var _string_attribute_inspector__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./string-attribute-inspector */ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/string-attribute-inspector.ts");
/* harmony import */ var _unsupported_attribute_inspector__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./unsupported-attribute-inspector */ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/unsupported-attribute-inspector.ts");
/* harmony import */ var _vector_attribute_inspectors__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./vector-attribute-inspectors */ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/vector-attribute-inspectors.ts");











/***/ }),

/***/ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/json-attribute-inspector.ts":
/*!**********************************************************************************************************!*\
  !*** ./src/tools/inspector/component-inspectors/script/attribute-inspectors/json-attribute-inspector.ts ***!
  \**********************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   JsonAttributeInspector: () => (/* binding */ JsonAttributeInspector)
/* harmony export */ });
/* harmony import */ var _utils_string_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/utils/string-utils */ "./src/utils/string-utils.ts");
/* harmony import */ var _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @playcanvas/pcui */ "./node_modules/@playcanvas/pcui/dist/module/src/index.mjs");
/* harmony import */ var _attribute_collection_inspector__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../attribute-collection-inspector */ "./src/tools/inspector/component-inspectors/script/attribute-collection-inspector.ts");
/* harmony import */ var _attribute_inspector__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./attribute-inspector */ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/attribute-inspector.ts");




class JsonAttributeInspector extends _attribute_inspector__WEBPACK_IMPORTED_MODULE_3__.AttributeInspector {
    buildInternal(attribute, property, _fieldArgs) {
        const panel = new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_1__.Panel({
            flex: true,
            collapsible: true,
            collapsed: false,
            collapseHorizontally: false,
            removable: false,
            headerText: _utils_string_utils__WEBPACK_IMPORTED_MODULE_0__.StringUtils.nameToTitle(attribute.name),
            scrollable: false,
            alignItems: "top",
        });
        const headerStyle = panel.header.style;
        headerStyle.borderRadius = "7px";
        // Some previous attempts at making the header stand off better from the script's panel header
        // headerStyle.padding = "0px 0px 0px 6px";
        // headerStyle.borderColor = "#293538ba";
        // headerStyle.borderWidth = "1px";
        // headerStyle.height = "24px";
        // headerStyle.backgroundColor = "#313c3f";
        // headerStyle.textShadow = "rgba(0, 0, 0, 0.2) 2px 2px 4px";
        const content = panel.content;
        const contentStyle = content.style;
        contentStyle.overflow = "hidden";
        contentStyle.gap = "6px";
        const inspector = new _attribute_collection_inspector__WEBPACK_IMPORTED_MODULE_2__.AttributeCollectionInspector(property.value, attribute.schema);
        inspector.build(content, property);
        this.append(panel);
    }
}


/***/ }),

/***/ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/number-attribute-inspector.ts":
/*!************************************************************************************************************!*\
  !*** ./src/tools/inspector/component-inspectors/script/attribute-inspectors/number-attribute-inspector.ts ***!
  \************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NumberAttributeInspector: () => (/* binding */ NumberAttributeInspector)
/* harmony export */ });
/* harmony import */ var _tools_inspector_fields__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/tools/inspector/fields */ "./src/tools/inspector/fields/index.ts");
/* harmony import */ var _attribute_inspector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./attribute-inspector */ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/attribute-inspector.ts");


class NumberAttributeInspector extends _attribute_inspector__WEBPACK_IMPORTED_MODULE_1__.AttributeInspector {
    buildInternal(attribute, _property, fieldArgs) {
        const placeholder = attribute.placeholder;
        fieldArgs.placeholder = Array.isArray(placeholder) ? placeholder[0] : placeholder;
        fieldArgs.min = attribute.min;
        fieldArgs.max = attribute.max;
        _tools_inspector_fields__WEBPACK_IMPORTED_MODULE_0__["default"].createNumber(fieldArgs);
    }
}


/***/ }),

/***/ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/string-attribute-inspector.ts":
/*!************************************************************************************************************!*\
  !*** ./src/tools/inspector/component-inspectors/script/attribute-inspectors/string-attribute-inspector.ts ***!
  \************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StringAttributeInspector: () => (/* binding */ StringAttributeInspector)
/* harmony export */ });
/* harmony import */ var _tools_inspector_fields__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/tools/inspector/fields */ "./src/tools/inspector/fields/index.ts");
/* harmony import */ var _attribute_inspector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./attribute-inspector */ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/attribute-inspector.ts");


class StringAttributeInspector extends _attribute_inspector__WEBPACK_IMPORTED_MODULE_1__.AttributeInspector {
    buildInternal(_attribute, _property, fieldArgs) {
        _tools_inspector_fields__WEBPACK_IMPORTED_MODULE_0__["default"].createString(fieldArgs);
    }
}


/***/ }),

/***/ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/unsupported-attribute-inspector.ts":
/*!*****************************************************************************************************************!*\
  !*** ./src/tools/inspector/component-inspectors/script/attribute-inspectors/unsupported-attribute-inspector.ts ***!
  \*****************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UnsupportedAttributeInspector: () => (/* binding */ UnsupportedAttributeInspector)
/* harmony export */ });
/* harmony import */ var _tools_inspector_fields__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/tools/inspector/fields */ "./src/tools/inspector/fields/index.ts");
/* harmony import */ var _attribute_inspector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./attribute-inspector */ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/attribute-inspector.ts");


class UnsupportedAttributeInspector extends _attribute_inspector__WEBPACK_IMPORTED_MODULE_1__.AttributeInspector {
    buildInternal(_attribute, _property, fieldArgs) {
        delete fieldArgs.label;
        delete fieldArgs.property;
        fieldArgs.value = "<Unsupported>";
        fieldArgs.readOnly = true;
        _tools_inspector_fields__WEBPACK_IMPORTED_MODULE_0__["default"].createString(fieldArgs);
    }
}


/***/ }),

/***/ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/vector-attribute-inspectors.ts":
/*!*************************************************************************************************************!*\
  !*** ./src/tools/inspector/component-inspectors/script/attribute-inspectors/vector-attribute-inspectors.ts ***!
  \*************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Vec2AttributeInspector: () => (/* binding */ Vec2AttributeInspector),
/* harmony export */   Vec3AttributeInspector: () => (/* binding */ Vec3AttributeInspector),
/* harmony export */   Vec4AttributeInspector: () => (/* binding */ Vec4AttributeInspector)
/* harmony export */ });
/* harmony import */ var _tools_inspector_fields__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/tools/inspector/fields */ "./src/tools/inspector/fields/index.ts");
/* harmony import */ var _attribute_inspector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./attribute-inspector */ "./src/tools/inspector/component-inspectors/script/attribute-inspectors/attribute-inspector.ts");


class Vec2AttributeInspector extends _attribute_inspector__WEBPACK_IMPORTED_MODULE_1__.AttributeInspector {
    buildInternal(attribute, _property, fieldArgs) {
        fieldArgs.min = attribute.min;
        fieldArgs.max = attribute.max;
        _tools_inspector_fields__WEBPACK_IMPORTED_MODULE_0__["default"].createVec2(fieldArgs);
    }
}
class Vec3AttributeInspector extends _attribute_inspector__WEBPACK_IMPORTED_MODULE_1__.AttributeInspector {
    buildInternal(attribute, _property, fieldArgs) {
        fieldArgs.min = attribute.min;
        fieldArgs.max = attribute.max;
        _tools_inspector_fields__WEBPACK_IMPORTED_MODULE_0__["default"].createVec3(fieldArgs);
    }
}
class Vec4AttributeInspector extends _attribute_inspector__WEBPACK_IMPORTED_MODULE_1__.AttributeInspector {
    buildInternal(attribute, _property, fieldArgs) {
        fieldArgs.min = attribute.min;
        fieldArgs.max = attribute.max;
        _tools_inspector_fields__WEBPACK_IMPORTED_MODULE_0__["default"].createVec4(fieldArgs);
    }
}


/***/ }),

/***/ "./src/tools/inspector/component-inspectors/script/attribute.ts":
/*!**********************************************************************!*\
  !*** ./src/tools/inspector/component-inspectors/script/attribute.ts ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AssetType: () => (/* binding */ AssetType),
/* harmony export */   AttributeType: () => (/* binding */ AttributeType)
/* harmony export */ });
var AttributeType;
(function (AttributeType) {
    AttributeType["entity"] = "entity";
    AttributeType["number"] = "number";
    AttributeType["boolean"] = "boolean";
    AttributeType["string"] = "string";
    AttributeType["vec2"] = "vec2";
    AttributeType["vec3"] = "vec3";
    AttributeType["vec4"] = "vec4";
    AttributeType["color"] = "rgba";
    AttributeType["asset"] = "asset";
    AttributeType["curve"] = "curve";
    AttributeType["json"] = "json";
})(AttributeType || (AttributeType = {}));
var AssetType;
(function (AssetType) {
    AssetType["template"] = "template";
    AssetType["texture"] = "texture";
    AssetType["material"] = "material";
    AssetType["sprite"] = "sprite";
    AssetType["json"] = "json";
    AssetType["binary"] = "binary";
    AssetType["audio"] = "audio";
})(AssetType || (AssetType = {}));


/***/ }),

/***/ "./src/tools/inspector/component-inspectors/script/script-component-inspector.ts":
/*!***************************************************************************************!*\
  !*** ./src/tools/inspector/component-inspectors/script/script-component-inspector.ts ***!
  \***************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ScriptComponentInspector: () => (/* binding */ ScriptComponentInspector)
/* harmony export */ });
/* harmony import */ var _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @playcanvas/pcui */ "./node_modules/@playcanvas/pcui/dist/module/src/index.mjs");
/* harmony import */ var _component_inspector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component-inspector */ "./src/tools/inspector/component-inspectors/component-inspector.ts");
/* harmony import */ var _attribute_collection_inspector__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./attribute-collection-inspector */ "./src/tools/inspector/component-inspectors/script/attribute-collection-inspector.ts");



class ScriptComponentInspector extends _component_inspector__WEBPACK_IMPORTED_MODULE_1__.ComponentInspector {
    constructor(component) {
        super(component, "SCRIPT");
        const style = this.content.style;
        style.padding = "6px";
        style.gap = "3px";
        const scripts = component.scripts;
        for (const script of scripts) {
            this.buildScriptLayout(script);
        }
    }
    buildScriptLayout(script) {
        // Create a collapsible panel for the script
        const scriptType = script.constructor;
        const scriptPanel = new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.Panel({
            flex: true,
            flexDirection: "column",
            collapsible: true,
            collapsed: false,
            collapseHorizontally: false,
            removable: false,
            // @ts-ignore, private field
            headerText: scriptType.__name,
            scrollable: false,
        });
        this.createToggle(script, scriptPanel.header);
        this.content.append(scriptPanel);
        const headerStyle = scriptPanel.header.style;
        headerStyle.borderRadius = "7px";
        headerStyle.padding = "0px 5px 0px 10px";
        // Collect the script's attributes
        const indexedAttributes = scriptType.attributes.index;
        const attributes = new Array();
        for (const attributeName in indexedAttributes) {
            /*
             * Note that attributes may not actually contain their own name. PlayCanvas allows declaring attributes
             * separately from their name, i.e. attributes.add("attributeName", { ... }). To ensure we can generate
             * attribute labels correctly, we'll apply the name to the attribute.
             */
            const attribute = indexedAttributes[attributeName];
            attribute.name = attributeName;
            attributes.push(indexedAttributes[attributeName]);
        }
        const inspector = new _attribute_collection_inspector__WEBPACK_IMPORTED_MODULE_2__.AttributeCollectionInspector(script, attributes);
        inspector.build(scriptPanel.content, undefined);
    }
}


/***/ }),

/***/ "./src/tools/inspector/component-inspectors/unsupported-component-inspector.ts":
/*!*************************************************************************************!*\
  !*** ./src/tools/inspector/component-inspectors/unsupported-component-inspector.ts ***!
  \*************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UnsupportedComponentInspector: () => (/* binding */ UnsupportedComponentInspector)
/* harmony export */ });
/* harmony import */ var _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @playcanvas/pcui */ "./node_modules/@playcanvas/pcui/dist/module/src/index.mjs");
/* harmony import */ var _component_inspector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./component-inspector */ "./src/tools/inspector/component-inspectors/component-inspector.ts");


class UnsupportedComponentInspector extends _component_inspector__WEBPACK_IMPORTED_MODULE_1__.ComponentInspector {
    constructor(component) {
        super(component, component.constructor.name);
        const label = new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.Label({ text: "No inspector (yet)." });
        label.style.textAlign = "center";
        this.append(label);
    }
}


/***/ }),

/***/ "./src/tools/inspector/fields/asset-field.ts":
/*!***************************************************!*\
  !*** ./src/tools/inspector/fields/asset-field.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AssetField: () => (/* binding */ AssetField)
/* harmony export */ });
/* harmony import */ var _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @playcanvas/pcui */ "./node_modules/@playcanvas/pcui/dist/module/src/index.mjs");
/* harmony import */ var _field__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./field */ "./src/tools/inspector/fields/field.ts");


class AssetField extends _field__WEBPACK_IMPORTED_MODULE_1__.Field {
    constructor(args) {
        super(args);
        const textField = this._textField = this.createElement(_playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.TextInput, { placeholder: "Asset", readOnly: true });
        textField.dom.spellcheck = false;
        const inputStyle = textField.input.style;
        inputStyle.cursor = "default";
        inputStyle.color = "rgb(128 128 128)";
        this.content.append(textField);
    }
    updateBindings() {
        const asset = this.getPropertyValue();
        const value = asset ? asset.name : "";
        const textField = this._textField;
        if (textField.value !== value) {
            textField.value = value;
        }
    }
}


/***/ }),

/***/ "./src/tools/inspector/fields/boolean-field.ts":
/*!*****************************************************!*\
  !*** ./src/tools/inspector/fields/boolean-field.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BooleanField: () => (/* binding */ BooleanField)
/* harmony export */ });
/* harmony import */ var _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @playcanvas/pcui */ "./node_modules/@playcanvas/pcui/dist/module/src/index.mjs");
/* harmony import */ var _field__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./field */ "./src/tools/inspector/fields/field.ts");


class BooleanField extends _field__WEBPACK_IMPORTED_MODULE_1__.Field {
    constructor(args) {
        super(args);
        const booleanInput = this.booleanInput = this.createElement(_playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.BooleanInput, {
            value: args.value || false,
            readOnly: args.readOnly,
            type: args.type,
        }, false);
        booleanInput.on(_playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.BooleanInput.EVENT_CLICK, () => {
            this.setPropertyValue(booleanInput.value);
        });
        this.content.append(booleanInput);
    }
    updateBindings() {
        const value = this.getPropertyValue();
        if (value !== this.booleanInput.value) {
            this.booleanInput.value = value;
        }
    }
}


/***/ }),

/***/ "./src/tools/inspector/fields/entity-field.ts":
/*!****************************************************!*\
  !*** ./src/tools/inspector/fields/entity-field.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EntityField: () => (/* binding */ EntityField)
/* harmony export */ });
/* harmony import */ var _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @playcanvas/pcui */ "./node_modules/@playcanvas/pcui/dist/module/src/index.mjs");
/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../layout */ "./src/tools/layout.ts");
/* harmony import */ var _field__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./field */ "./src/tools/inspector/fields/field.ts");



class EntityField extends _field__WEBPACK_IMPORTED_MODULE_2__.Field {
    constructor(args) {
        super(args);
        const textField = this._textField = this.createElement(_playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.TextInput, { placeholder: "Entity", readOnly: true });
        textField.dom.spellcheck = false;
        textField.input.style.cursor = "pointer";
        textField.on(_playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.Element.EVENT_CLICK, () => {
            const entity = this.getPropertyValue();
            if (entity) {
                const selectionHandler = _layout__WEBPACK_IMPORTED_MODULE_1__.Layout.instance.selectionHandler;
                selectionHandler.deselectAll();
                selectionHandler.select(entity);
            }
        });
        this.content.append(textField);
    }
    updateBindings() {
        const entity = this.getPropertyValue();
        const value = entity ? entity.name : "";
        const textField = this._textField;
        if (textField.value !== value) {
            textField.value = value;
        }
    }
}


/***/ }),

/***/ "./src/tools/inspector/fields/field.ts":
/*!*********************************************!*\
  !*** ./src/tools/inspector/fields/field.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Field: () => (/* binding */ Field)
/* harmony export */ });
/* harmony import */ var _utils_delegates_action__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/utils/delegates/action */ "./src/utils/delegates/action.ts");
/* harmony import */ var _utils_string_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/utils/string-utils */ "./src/utils/string-utils.ts");
/* harmony import */ var _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @playcanvas/pcui */ "./node_modules/@playcanvas/pcui/dist/module/src/index.mjs");
/* harmony import */ var _property__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../property */ "./src/tools/inspector/property.ts");




class Field extends _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_2__.Container {
    get content() {
        return this._labelGroup || this;
    }
    get labelGroup() {
        return this._labelGroup;
    }
    constructor(args) {
        var _a;
        super();
        this.onDestroyed = new _utils_delegates_action__WEBPACK_IMPORTED_MODULE_0__.Action();
        let property;
        if (args.property) {
            property = this.property = args.property instanceof _property__WEBPACK_IMPORTED_MODULE_3__.Property ? args.property : new _property__WEBPACK_IMPORTED_MODULE_3__.Property(args.property);
        }
        const label = args.label || (property && !property.isArrayEntry ? property.name : undefined);
        if (label) {
            const formatLabel = !!property; // format property names by default
            this.append(this._labelGroup = Field.createLabelGroup(label, formatLabel));
        }
        this.on(_playcanvas_pcui__WEBPACK_IMPORTED_MODULE_2__.Container.EVENT_DESTROY, () => this.onDestroyed.invoke(this));
        (_a = args.parent) === null || _a === void 0 ? void 0 : _a.append(this);
    }
    static createLabelGroup(label, formatName = true) {
        const labelGroup = new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_2__.LabelGroup({ text: label && formatName ? _utils_string_utils__WEBPACK_IMPORTED_MODULE_1__.StringUtils.nameToTitle(label) : label });
        labelGroup.label.width = "30%";
        const style = labelGroup.style;
        style.fontSize = "12px";
        style.margin = "0px";
        style.minHeight = "24px";
        return labelGroup;
    }
    createElement(elementType, args, applyDefaultStyle = true) {
        const element = new elementType(args);
        if (applyDefaultStyle) {
            const style = element.style;
            style.fontSize = "12px";
            style.margin = "0px 0px 0px 6px";
            style.minHeight = "24px";
        }
        return element;
    }
    getPropertyValue() {
        var _a;
        return (_a = this.property) === null || _a === void 0 ? void 0 : _a.value;
    }
    setPropertyValue(value) {
        const property = this.property;
        if (!property) {
            return;
        }
        property.value = value;
    }
}


/***/ }),

/***/ "./src/tools/inspector/fields/index.ts":
/*!*********************************************!*\
  !*** ./src/tools/inspector/fields/index.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AssetField: () => (/* reexport safe */ _asset_field__WEBPACK_IMPORTED_MODULE_0__.AssetField),
/* harmony export */   BooleanField: () => (/* reexport safe */ _boolean_field__WEBPACK_IMPORTED_MODULE_1__.BooleanField),
/* harmony export */   EntityField: () => (/* reexport safe */ _entity_field__WEBPACK_IMPORTED_MODULE_2__.EntityField),
/* harmony export */   Field: () => (/* reexport safe */ _field__WEBPACK_IMPORTED_MODULE_7__.Field),
/* harmony export */   MultiNumericField: () => (/* reexport safe */ _multi_numeric_field__WEBPACK_IMPORTED_MODULE_8__.MultiNumericField),
/* harmony export */   NumberField: () => (/* reexport safe */ _number_field__WEBPACK_IMPORTED_MODULE_3__.NumberField),
/* harmony export */   QuatField: () => (/* reexport safe */ _quat_field__WEBPACK_IMPORTED_MODULE_4__.QuatField),
/* harmony export */   StringField: () => (/* reexport safe */ _string_field__WEBPACK_IMPORTED_MODULE_5__.StringField),
/* harmony export */   Vec2Field: () => (/* reexport safe */ _vector_field__WEBPACK_IMPORTED_MODULE_6__.Vec2Field),
/* harmony export */   Vec3Field: () => (/* reexport safe */ _vector_field__WEBPACK_IMPORTED_MODULE_6__.Vec3Field),
/* harmony export */   Vec4Field: () => (/* reexport safe */ _vector_field__WEBPACK_IMPORTED_MODULE_6__.Vec4Field),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _asset_field__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./asset-field */ "./src/tools/inspector/fields/asset-field.ts");
/* harmony import */ var _boolean_field__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./boolean-field */ "./src/tools/inspector/fields/boolean-field.ts");
/* harmony import */ var _entity_field__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./entity-field */ "./src/tools/inspector/fields/entity-field.ts");
/* harmony import */ var _number_field__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./number-field */ "./src/tools/inspector/fields/number-field.ts");
/* harmony import */ var _quat_field__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./quat-field */ "./src/tools/inspector/fields/quat-field.ts");
/* harmony import */ var _string_field__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./string-field */ "./src/tools/inspector/fields/string-field.ts");
/* harmony import */ var _vector_field__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./vector-field */ "./src/tools/inspector/fields/vector-field.ts");
/* harmony import */ var _field__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./field */ "./src/tools/inspector/fields/field.ts");
/* harmony import */ var _multi_numeric_field__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./multi-numeric-field */ "./src/tools/inspector/fields/multi-numeric-field.ts");
















class Fields {
    static update() {
        const fields = this._fields;
        for (let length = fields.length, i = 0; i < length; i++) {
            const field = fields[i];
            if (!field.property) {
                continue;
            }
            field.updateBindings();
        }
    }
    static createCheckbox(args) {
        return this.createFieldElement(_boolean_field__WEBPACK_IMPORTED_MODULE_1__.BooleanField, args);
    }
    static createNumber(args) {
        return this.createFieldElement(_number_field__WEBPACK_IMPORTED_MODULE_3__.NumberField, args);
    }
    static createString(args) {
        return this.createFieldElement(_string_field__WEBPACK_IMPORTED_MODULE_5__.StringField, args);
    }
    static createVec2(args) {
        return this.createFieldElement(_vector_field__WEBPACK_IMPORTED_MODULE_6__.Vec2Field, args);
    }
    static createVec3(args) {
        return this.createFieldElement(_vector_field__WEBPACK_IMPORTED_MODULE_6__.Vec3Field, args);
    }
    static createVec4(args) {
        return this.createFieldElement(_vector_field__WEBPACK_IMPORTED_MODULE_6__.Vec4Field, args);
    }
    static createQuat(args) {
        return this.createFieldElement(_quat_field__WEBPACK_IMPORTED_MODULE_4__.QuatField, args);
    }
    static createEntity(args) {
        return this.createFieldElement(_entity_field__WEBPACK_IMPORTED_MODULE_2__.EntityField, args);
    }
    static createAsset(args) {
        return this.createFieldElement(_asset_field__WEBPACK_IMPORTED_MODULE_0__.AssetField, args);
    }
    static createFieldElement(fieldType, fieldArgs) {
        const field = new fieldType(fieldArgs);
        if (!field.property) {
            return field;
        }
        field.onDestroyed.addDelegate(this.onFieldElementDestroyed, this);
        this._fields.push(field);
        return field;
    }
    static onFieldElementDestroyed(element) {
        const fields = this._fields;
        const index = fields.indexOf(element);
        if (index !== -1) {
            fields.splice(index, 1);
        }
    }
}
Fields._fields = [];
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Fields);


/***/ }),

/***/ "./src/tools/inspector/fields/multi-numeric-field.ts":
/*!***********************************************************!*\
  !*** ./src/tools/inspector/fields/multi-numeric-field.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MultiNumericField: () => (/* binding */ MultiNumericField)
/* harmony export */ });
/* harmony import */ var _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @playcanvas/pcui */ "./node_modules/@playcanvas/pcui/dist/module/src/index.mjs");
/* harmony import */ var _field__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./field */ "./src/tools/inspector/fields/field.ts");


const cellMargin = "6px";
class MultiNumericField extends _field__WEBPACK_IMPORTED_MODULE_1__.Field {
    constructor(args) {
        super(args);
        this._numericInputs = [];
        this.numericInputs = this._numericInputs;
        this._isUpdatingBindings = false;
        this._fieldNames = [...args.fields];
        const container = this._numericInputContainer = new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.Container();
        container.flex = true;
        container.flexDirection = "row";
        this.content.append(container);
        this.createNumericInputs(args);
    }
    createNumericInputs(args) {
        const numericInputs = this._numericInputs;
        const container = this._numericInputContainer;
        const fieldNames = args.fields;
        const labels = args.labels || args.fields;
        for (let totalFields = fieldNames.length, i = 0; i < totalFields; i++) {
            const numericInput = this.createElement(_playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.NumericInput, {
                placeholder: labels[i],
                precision: 3,
                step: 1,
                min: args.min,
                max: args.max
            });
            const style = numericInput.style;
            style.margin = `0px ${i == 0 ? cellMargin : "0px"} 0px ${i == totalFields - 1 ? cellMargin : "0px"}`;
            const value = args.value;
            if (value) {
                const fieldName = fieldNames[i];
                numericInput.value = value[fieldName];
            }
            numericInput.on("change", () => this.onValueEntered());
            numericInputs.push(numericInput);
            container.append(numericInput);
        }
    }
    updateBindings() {
        // Ignore if a numeric input element is being edited. We don't want to overwrite the user's input.
        const inputElements = this._numericInputs;
        for (let i = 0; i < inputElements.length; i++) {
            const inputElement = inputElements[i];
            // @ts-ignore
            const isUsingSlider = inputElement._sliderUsed;
            if (isUsingSlider || document.activeElement === inputElement.input) {
                return;
            }
        }
        try {
            this._isUpdatingBindings = true;
            const value = this.getPropertyValue();
            const fieldNames = this._fieldNames;
            for (let i = 0; i < fieldNames.length; i++) {
                const fieldName = fieldNames[i];
                const inputElement = inputElements[i];
                inputElement.value = value[fieldName];
            }
        }
        finally {
            this._isUpdatingBindings = false;
        }
    }
    onValueEntered() {
        // Ignore callbacks from binding updates
        if (this._isUpdatingBindings) {
            return;
        }
        const value = this.getPropertyValue();
        const fieldNames = this._fieldNames;
        for (let i = 0; i < fieldNames.length; i++) {
            const fieldName = fieldNames[i];
            value[fieldName] = this._numericInputs[i].value;
        }
        this.setPropertyValue(value);
    }
}


/***/ }),

/***/ "./src/tools/inspector/fields/number-field.ts":
/*!****************************************************!*\
  !*** ./src/tools/inspector/fields/number-field.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NumberField: () => (/* binding */ NumberField)
/* harmony export */ });
/* harmony import */ var _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @playcanvas/pcui */ "./node_modules/@playcanvas/pcui/dist/module/src/index.mjs");
/* harmony import */ var _field__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./field */ "./src/tools/inspector/fields/field.ts");


class NumberField extends _field__WEBPACK_IMPORTED_MODULE_1__.Field {
    constructor(args) {
        super(args);
        this._isUpdatingBindings = false;
        const numericInput = this.numericInput = this.createElement(_playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.NumericInput, {
            placeholder: args.placeholder,
            precision: 3,
            step: 1,
            min: args.min,
            max: args.max
        });
        numericInput.value = args.value || 0;
        numericInput.on("change", () => this.onValueEntered());
        this.content.append(numericInput);
    }
    updateBindings() {
        // Ignore if the value is being edited. We don't want to overwrite the user's input.
        const inputElement = this.numericInput;
        // @ts-ignore
        const isUsingSlider = inputElement._sliderUsed;
        if (isUsingSlider || document.activeElement === inputElement.input) {
            return;
        }
        try {
            this._isUpdatingBindings = true;
            inputElement.value = this.getPropertyValue();
        }
        finally {
            this._isUpdatingBindings = false;
        }
    }
    onValueEntered() {
        if (this._isUpdatingBindings) {
            return;
        }
        this.setPropertyValue(this.numericInput.value);
    }
}


/***/ }),

/***/ "./src/tools/inspector/fields/quat-field.ts":
/*!**************************************************!*\
  !*** ./src/tools/inspector/fields/quat-field.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   QuatField: () => (/* binding */ QuatField)
/* harmony export */ });
/* harmony import */ var _multi_numeric_field__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./multi-numeric-field */ "./src/tools/inspector/fields/multi-numeric-field.ts");

class QuatField extends _multi_numeric_field__WEBPACK_IMPORTED_MODULE_0__.MultiNumericField {
    constructor(args) {
        super(Object.assign(args, { fields: ["x", "y", "z", "w"], labels: ["X", "Y", "Z", "W"] }));
    }
}


/***/ }),

/***/ "./src/tools/inspector/fields/string-field.ts":
/*!****************************************************!*\
  !*** ./src/tools/inspector/fields/string-field.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StringField: () => (/* binding */ StringField)
/* harmony export */ });
/* harmony import */ var _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @playcanvas/pcui */ "./node_modules/@playcanvas/pcui/dist/module/src/index.mjs");
/* harmony import */ var _field__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./field */ "./src/tools/inspector/fields/field.ts");


class StringField extends _field__WEBPACK_IMPORTED_MODULE_1__.Field {
    constructor(args) {
        super(args);
        this._isUpdatingBindings = false;
        const textField = this.textField = this.createElement(_playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.TextInput, {
            value: args.value,
            readOnly: args.readOnly,
        });
        textField.dom.spellcheck = args.spellCheck;
        textField.on("change", this.onTextChanged.bind(this));
        const style = textField.style;
        style.fontSize = "12px";
        style.height = "24px";
        this.content.append(textField);
    }
    updateBindings() {
        // Ignore if the text field is being edited
        if (document.activeElement === this.textField.input) {
            return;
        }
        this._isUpdatingBindings = true;
        try {
            const value = this.getPropertyValue();
            if (value !== this.textField.value) {
                this.textField.value = value;
            }
        }
        finally {
            this._isUpdatingBindings = false;
        }
    }
    onTextChanged() {
        if (this._isUpdatingBindings) {
            return;
        }
        this.setPropertyValue(this.textField.value);
    }
}


/***/ }),

/***/ "./src/tools/inspector/fields/vector-field.ts":
/*!****************************************************!*\
  !*** ./src/tools/inspector/fields/vector-field.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Vec2Field: () => (/* binding */ Vec2Field),
/* harmony export */   Vec3Field: () => (/* binding */ Vec3Field),
/* harmony export */   Vec4Field: () => (/* binding */ Vec4Field)
/* harmony export */ });
/* harmony import */ var _multi_numeric_field__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./multi-numeric-field */ "./src/tools/inspector/fields/multi-numeric-field.ts");

class Vec2Field extends _multi_numeric_field__WEBPACK_IMPORTED_MODULE_0__.MultiNumericField {
    constructor(args) {
        super(Object.assign(args, { fields: ["x", "y"], labels: ["X", "Y"] }));
    }
}
class Vec3Field extends _multi_numeric_field__WEBPACK_IMPORTED_MODULE_0__.MultiNumericField {
    constructor(args) {
        super(Object.assign(args, { fields: ["x", "y", "z"], labels: ["X", "Y", "Z"] }));
    }
}
class Vec4Field extends _multi_numeric_field__WEBPACK_IMPORTED_MODULE_0__.MultiNumericField {
    constructor(args) {
        super(Object.assign(args, { fields: ["x", "y", "z", "w"], labels: ["X", "Y", "Z", "W"] }));
    }
}


/***/ }),

/***/ "./src/tools/inspector/inspector-panel.ts":
/*!************************************************!*\
  !*** ./src/tools/inspector/inspector-panel.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   InspectorPanel: () => (/* binding */ InspectorPanel)
/* harmony export */ });
/* harmony import */ var _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @playcanvas/pcui */ "./node_modules/@playcanvas/pcui/dist/module/src/index.mjs");
/* harmony import */ var playcanvas__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! playcanvas */ "playcanvas");
/* harmony import */ var playcanvas__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(playcanvas__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _utils_pcui_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/pcui-utils */ "./src/utils/pcui-utils.ts");
/* harmony import */ var _component_inspectors_component_inspector_registry__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./component-inspectors/component-inspector-registry */ "./src/tools/inspector/component-inspectors/component-inspector-registry.ts");
/* harmony import */ var _fields__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./fields */ "./src/tools/inspector/fields/index.ts");





class InspectorPanel {
    constructor(layout) {
        const selectionHandler = layout.selectionHandler;
        selectionHandler.onSelectionChanged.addDelegate(this.onNodeSelectionChanged, this);
    }
    init() {
        this.createRootElements();
        this.setNode(null);
        setInterval(() => this.updateUi(), 100);
    }
    createRootElements() {
        const rootContainer = new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.Container({
            grid: true,
            resizable: "left",
            resizeMin: 260,
            resizeMax: 1000
        });
        const style = rootContainer.style;
        style.position = "absolute";
        style.right = style.top = "0px";
        style.width = "375px";
        style.height = "100%";
        style.zIndex = "1000";
        document.body.appendChild(rootContainer.dom);
        const rootPanel = this._rootPanel = new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.Panel({
            flex: true,
            collapsible: true,
            collapsed: false,
            collapseHorizontally: true,
            removable: false,
            scrollable: true,
            resizeMax: 1000
        });
        rootPanel.style.width = "100%";
        rootContainer.append(rootPanel);
        _utils_pcui_utils__WEBPACK_IMPORTED_MODULE_2__.ContainerUtils.autoResize(rootContainer, rootPanel);
        const content = this._content = new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.Container({ flexShrink: "0" });
        rootPanel.append(content);
    }
    setHeaderText(text) {
        if (text === this._headerText) {
            return;
        }
        this._headerText = text;
        this._rootPanel.headerText = text.toUpperCase();
    }
    setNode(node) {
        if (node === this._currentNode) {
            return;
        }
        this._currentNode = node;
        this.setHeaderText(node ? node.name : "Inspector");
        this.rebuildUi();
    }
    rebuildUi() {
        const node = this._currentNode;
        this.destroyUi();
        if (!node) {
            return;
        }
        // Show graph node properties
        const content = this._content;
        const graphNodeInterface = new GraphNodeInterface(node);
        const graphNodeContainer = new _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.Container({ flex: true, flexDirection: "column" });
        const style = graphNodeContainer.style;
        style.padding = "3px 10px";
        style.gap = "6px";
        _fields__WEBPACK_IMPORTED_MODULE_4__["default"].createCheckbox({
            property: { target: node, name: "enabled" },
            parent: graphNodeContainer
        });
        _fields__WEBPACK_IMPORTED_MODULE_4__["default"].createString({
            property: { target: node, name: "name" },
            parent: graphNodeContainer
        });
        _fields__WEBPACK_IMPORTED_MODULE_4__["default"].createVec3({
            property: { target: graphNodeInterface, name: "position" },
            parent: graphNodeContainer
        });
        _fields__WEBPACK_IMPORTED_MODULE_4__["default"].createVec3({
            property: { target: graphNodeInterface, name: "rotation" },
            parent: graphNodeContainer
        });
        _fields__WEBPACK_IMPORTED_MODULE_4__["default"].createVec3({
            property: { target: graphNodeInterface, name: "scale" },
            parent: graphNodeContainer
        });
        content.append(graphNodeContainer);
        if (!(node instanceof playcanvas__WEBPACK_IMPORTED_MODULE_1__.Entity)) {
            return;
        }
        // Show components
        const components = node.c;
        for (const componentName in components) {
            /*
             * Fetch the appropriate component inspector constructor. Note that one is always returned, even if the
             * component is not supported. In the latter case, an inspector constructor is returned that displays an
             * "unsupported component" message.
             */
            const component = components[componentName];
            const componentType = component.constructor;
            const inspectorConstructor = _component_inspectors_component_inspector_registry__WEBPACK_IMPORTED_MODULE_3__.ComponentInspectorRegistry.getInspector(componentType);
            const inspector = new inspectorConstructor(component);
            content.append(inspector);
        }
        this.updateUi();
    }
    destroyUi() {
        this._content.clear();
    }
    updateUi() {
        const currentNode = this._currentNode;
        if (currentNode) {
            this.setHeaderText(currentNode.name);
        }
        _fields__WEBPACK_IMPORTED_MODULE_4__["default"].update();
    }
    onNodeSelectionChanged(selectedNodes) {
        this.setNode(selectedNodes.length > 0 ? selectedNodes[0] : undefined);
    }
}
class GraphNodeInterface {
    get position() {
        return this.node.getLocalPosition();
    }
    set position(value) {
        this.node.setLocalPosition(value);
        if (!(this.node instanceof playcanvas__WEBPACK_IMPORTED_MODULE_1__.Entity)) {
            return;
        }
        const rigidBody = this.node.rigidbody;
        if (rigidBody) {
            rigidBody.teleport(this.node.getPosition());
        }
    }
    get rotation() {
        return this.node.getLocalRotation().getEulerAngles();
    }
    set rotation(value) {
        const rotation = this.node.getLocalRotation();
        rotation.setFromEulerAngles(value);
        this.node.setLocalRotation(rotation);
        if (!(this.node instanceof playcanvas__WEBPACK_IMPORTED_MODULE_1__.Entity)) {
            return;
        }
        const rigidBody = this.node.rigidbody;
        if (rigidBody) {
            rigidBody.teleport(this.position, this.node.getRotation());
        }
    }
    get scale() {
        return this.node.getLocalScale();
    }
    set scale(value) {
        this.node.setLocalScale(value);
    }
    constructor(node) {
        this.node = node;
    }
}


/***/ }),

/***/ "./src/tools/inspector/property.ts":
/*!*****************************************!*\
  !*** ./src/tools/inspector/property.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Property: () => (/* binding */ Property)
/* harmony export */ });
/* harmony import */ var _utils_delegates_event_handler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/utils/delegates/event-handler */ "./src/utils/delegates/event-handler.ts");

class Property {
    get target() {
        const parent = this.parent;
        if (!parent) {
            return this._target;
        }
        /*
         * A regular property points to a field with a specific name on a target. Properties that point to an entry in
         * an array will do exactly the same (i.e. have the same target and field name), but also specify an index.
         * Its common for an array entry property to have an array property as its parent. In this situation, the
         * child (array entry property) will have the same target as its parent (array property).
         *
         * In other situations (i.e. when we're a regular property pointing to a field that's part of our parent's
         * value), we can just use the value of our parent as our target (see note below in the constructor).
         */
        return this.isArrayEntry ? parent.target : parent.value;
    }
    get isArrayEntry() {
        return this.index >= 0;
    }
    get value() {
        const value = this.target[this.name];
        if (!value || this.index < 0) {
            return value;
        }
        return value[this.index];
    }
    set value(value) {
        var _a;
        const previousValue = this.value;
        const target = this.target;
        if (this.isArrayEntry) {
            const array = target[this.name];
            array[this.index] = value;
        }
        else {
            target[this.name] = value;
        }
        this.onValueChanged.safeInvoke(this, new ValueChangedEventArgs(value, previousValue));
        (_a = this.parent) === null || _a === void 0 ? void 0 : _a.onSubPropertyDirty();
    }
    constructor(args) {
        this.index = -1;
        this.onValueChanged = new _utils_delegates_event_handler__WEBPACK_IMPORTED_MODULE_0__.EventHandler();
        /*
         * When a parent is provided, we should fetch our target dynamically via the parent. This is important for
         * situations in which our parent's value (a reference type) is swapped for another. For example, imagine our
         * parent points to a Vec3 and we're pointing to one of its fields. When our parent's Vec3 is swapped out for
         * another Vec3, we want to automatically update our target to the new Vec3 and avoid editing the old one.
         */
        if (!(this.parent = args.parent)) {
            this._target = args.target;
        }
        this.name = args.name;
        if (Number.isFinite(args.index) && args.index >= 0) {
            this.index = args.index;
        }
    }
    onSubPropertyDirty() {
        // Reapply the value to trigger any necessary updates. For scripts, this fires the attr:<name> event.
        this.value = this.value;
    }
}
class ValueChangedEventArgs extends _utils_delegates_event_handler__WEBPACK_IMPORTED_MODULE_0__.EventArgs {
    constructor(newValue, oldValue) {
        super();
        this.newValue = newValue;
        this.oldValue = oldValue;
    }
}


/***/ }),

/***/ "./src/tools/layout.ts":
/*!*****************************!*\
  !*** ./src/tools/layout.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Layout: () => (/* binding */ Layout)
/* harmony export */ });
/* harmony import */ var _namespace__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../namespace */ "./src/namespace.ts");
/* harmony import */ var _hierarchy_hierarchy_panel__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./hierarchy/hierarchy-panel */ "./src/tools/hierarchy/hierarchy-panel.ts");
/* harmony import */ var _inspector_inspector_panel__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./inspector/inspector-panel */ "./src/tools/inspector/inspector-panel.ts");
/* harmony import */ var _selection_handler__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./selection-handler */ "./src/tools/selection-handler.ts");




class Layout {
    static get instance() {
        return this._instance;
    }
    constructor() {
        this.selectionHandler = new _selection_handler__WEBPACK_IMPORTED_MODULE_3__.SelectionHandler();
        this.hierarchy = new _hierarchy_hierarchy_panel__WEBPACK_IMPORTED_MODULE_1__.HierarchyPanel(this);
        this.inspector = new _inspector_inspector_panel__WEBPACK_IMPORTED_MODULE_2__.InspectorPanel(this);
        Layout._instance = this;
        this.applyFonts();
        this.selectionHandler.onSelectionChanged.addDelegate(this.onSelectionChanged, this);
        this.hierarchy.init();
        this.inspector.init();
    }
    applyFonts() {
        // Use the same fonts as the official Editor
        const style = document.createElement('style');
        style.innerHTML = `
            @font-face {
                font-family: "Proxima Nova Regular";
                src: url("https://playcanvas.com/static-assets/fonts/proxima_nova_regular.eot");
                src: url("https://playcanvas.com/static-assets/fonts/proxima_nova_regular.eot?#iefix") format("embedded-opentype"),
                     url("https://playcanvas.com/static-assets/fonts/proxima_nova_regular.woff2") format("woff2"),
                     url("https://playcanvas.com/static-assets/fonts/proxima_nova_regular.woff") format("woff"),
                     url("https://playcanvas.com/static-assets/fonts/proxima_nova_regular.ttf") format("truetype");
                font-weight:normal;
                font-style:normal
            }
            
            @font-face {
                font-family: "Proxima Nova Light";
                src: url("https://playcanvas.com/static-assets/fonts/proxima_nova_light.eot");
                src: url("https://playcanvas.com/static-assets/fonts/proxima_nova_light.eot?#iefix") format("embedded-opentype"),
                     url("https://playcanvas.com/static-assets/fonts/proxima_nova_light.woff2") format("woff2"),
                     url("https://playcanvas.com/static-assets/fonts/proxima_nova_light.woff") format("woff"),
                     url("https://playcanvas.com/static-assets/fonts/proxima_nova_light.ttf") format("truetype");
                font-weight: 200;
                font-style: normal;
            }
            
            @font-face {
                font-family: "Proxima Nova Bold";
                src: url("https://playcanvas.com/static-assets/fonts/proxima_nova_bold.eot");
                src: url("https://playcanvas.com/static-assets/fonts/proxima_nova_bold.eot?#iefix") format("embedded-opentype"),
                     url("https://playcanvas.com/static-assets/fonts/proxima_nova_bold.woff2") format("woff2"),
                     url("https://playcanvas.com/static-assets/fonts/proxima_nova_bold.woff") format("woff"),
                     url("https://playcanvas.com/static-assets/fonts/proxima_nova_bold.ttf") format("truetype");
                font-weight: bold;
                font-style: normal;
            }
            
            @font-face {
                font-family: "Proxima Nova Thin";
                src: url("https://playcanvas.com/static-assets/fonts/proxima_nova_thin_t.eot");
                src: url("https://playcanvas.com/static-assets/fonts/proxima_nova_thin_t.eot?#iefix") format("embedded-opentype"),
                     url("https://playcanvas.com/static-assets/fonts/proxima_nova_thin_t.woff2") format("woff2"),
                     url("https://playcanvas.com/static-assets/fonts/proxima_nova_thin_t.woff") format("woff"),
                     url("https://playcanvas.com/static-assets/fonts/proxima_nova_thin_t.ttf") format("truetype");
                font-weight: 100;
                font-style: normal;
            }

            body {
                font-size: 14px;
                font-family: "Proxima Nova Regular","Helvetica Neue",Arial,Helvetica,sans-serif;
            }

            .font-regular {
                font-family: "Proxima Nova Regular","Helvetica Neue",Arial,Helvetica,sans-serif;
            }

            .font-bold {
                font-family: "Proxima Nova Bold","Helvetica Neue",Arial,Helvetica,sans-serif;
            }
        `;
        document.head.appendChild(style);
    }
    onSelectionChanged(selectedNodes) {
        const selectedNodesExposed = _namespace__WEBPACK_IMPORTED_MODULE_0__["default"].selectedNodes || [];
        selectedNodesExposed.length = 0;
        selectedNodesExposed.push(...selectedNodes);
        // const total = selectedNodes.length
        // let message = `Selected ${total} ${total === 1 ? "node" : "nodes"}${total > 0 ? ":" : "."}`;
        // for(let i = 0; i < total; i++) {
        //     message += `\n- ${selectedNodes[i].name}`;
        // }
        // console.log(message);
    }
}


/***/ }),

/***/ "./src/tools/selection-handler.ts":
/*!****************************************!*\
  !*** ./src/tools/selection-handler.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SelectionHandler: () => (/* binding */ SelectionHandler)
/* harmony export */ });
/* harmony import */ var _utils_delegates_action__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/delegates/action */ "./src/utils/delegates/action.ts");

class SelectionHandler {
    constructor() {
        this._selectedNodesHashed = new Set();
        this._selectedNodes = [];
        this.selectedNodes = this._selectedNodes;
        this.onSelected = new _utils_delegates_action__WEBPACK_IMPORTED_MODULE_0__.Action();
        this.onDeselected = new _utils_delegates_action__WEBPACK_IMPORTED_MODULE_0__.Action();
        this.onSelectionChanged = new _utils_delegates_action__WEBPACK_IMPORTED_MODULE_0__.Action();
    }
    isSelected(node) {
        return this._selectedNodesHashed.has(node);
    }
    select(node) {
        if (!node) {
            throw new Error(`Failed to select graph node: no node provided.`);
        }
        const selectedNodesHashed = this._selectedNodesHashed;
        if (selectedNodesHashed.has(node)) {
            return;
        }
        selectedNodesHashed.add(node);
        this._selectedNodes.push(node);
        node.on("destroy", this.deselect, this);
        this.onSelected.safeInvoke(node);
        this.onSelectionChangedInternal();
    }
    deselect(node) {
        if (!node) {
            throw new Error(`Failed to deselect graph node: no node provided.`);
        }
        if (!this._selectedNodesHashed.delete(node)) {
            return;
        }
        const selectedNodes = this._selectedNodes;
        const index = selectedNodes.indexOf(node);
        if (index !== -1) {
            selectedNodes.splice(index, 1);
        }
        node.off("destroy", this.deselect, this);
        this.onDeselected.safeInvoke(node);
        this.onSelectionChangedInternal();
    }
    deselectAll() {
        const selectedNodes = this._selectedNodes;
        for (let i = selectedNodes.length - 1; i >= 0; i--) {
            this.deselect(selectedNodes[i]);
        }
    }
    onSelectionChangedInternal() {
        this.onSelectionChanged.safeInvoke(this.selectedNodes);
    }
}


/***/ }),

/***/ "./src/utils/collections/queue.ts":
/*!****************************************!*\
  !*** ./src/utils/collections/queue.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Queue: () => (/* binding */ Queue)
/* harmony export */ });
class Queue {
    get length() {
        return this._length;
    }
    constructor(capacity = 4) {
        this._capacity = 0;
        this._length = 0;
        this._tail = 0;
        this._head = 0;
        this.setBuffer(new Array(capacity));
    }
    expandBuffer() {
        // Determine the capacity of the new buffer
        const minimumCapacity = this._capacity + 1;
        let newCapacity = Math.ceil(this._capacity * Queue._growFactor);
        while (newCapacity < minimumCapacity) {
            newCapacity = Math.ceil(newCapacity * Queue._growFactor);
        }
        const newBuffer = new Array(newCapacity);
        // Copy over the data to the new buffer
        const thisBuffer = this._buffer;
        const thisBufferLength = thisBuffer.length;
        for (let i = 0; i < thisBufferLength; i++) {
            const fromIndex = this.getIndex(this._tail, i);
            newBuffer[i] = thisBuffer[fromIndex];
        }
        // Reset the tail & head
        this._tail = 0;
        this._head = thisBufferLength;
        this.setBuffer(newBuffer);
    }
    setBuffer(newBuffer) {
        this._buffer = newBuffer;
        this._capacity = newBuffer.length;
    }
    getIndex(startIndex, length) {
        return (startIndex + length) % this._capacity;
    }
    get(offset) {
        if (offset < 0 || offset >= this._length) {
            throw new Error("Argument out of range.");
        }
        const index = this.getIndex(this._tail, offset);
        return this._buffer[index];
    }
    enqueue(item) {
        if (this._length === this._capacity) {
            this.expandBuffer();
        }
        this._buffer[this._head] = item;
        this._head = this.getIndex(this._head, 1);
        this._length++;
    }
    dequeue() {
        if (this._length === 0) {
            throw new Error("Queue is empty.");
        }
        const item = this._buffer[this._tail];
        this._buffer[this._tail] = null;
        this._length--;
        // Increment the tail
        this._tail = this.getIndex(this._tail, 1);
        return item;
    }
    peek() {
        if (this._length === 0) {
            throw new Error("Queue is empty.");
        }
        return this._buffer[this._tail];
    }
    clear() {
        const length = this._length;
        const tail = this._tail;
        for (let i = 0; i < length; i++) {
            const index = this.getIndex(tail, i);
            this._buffer[index] = null;
        }
        this._length = 0;
        this._tail = 0;
        this._head = 0;
    }
}
Queue._growFactor = 2.5;


/***/ }),

/***/ "./src/utils/collections/stack.ts":
/*!****************************************!*\
  !*** ./src/utils/collections/stack.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Stack: () => (/* binding */ Stack)
/* harmony export */ });
class Stack {
    constructor() {
        this._items = [];
        this.items = this._items;
    }
    get count() {
        return this._items.length;
    }
    push(item) {
        this._items.push(item);
    }
    pop() {
        const items = this._items;
        const count = items.length;
        if (count === 0) {
            throw new Error(Stack._msgStackEmpty);
        }
        const index = count - 1;
        const item = items[index];
        items.splice(index, 1);
        return item;
    }
    peek() {
        const items = this._items;
        const count = items.length;
        if (count === 0) {
            throw new Error(Stack._msgStackEmpty);
        }
        return items[count - 1];
    }
    contains(item) {
        return this._items.indexOf(item) >= 0;
    }
    clear() {
        this._items.splice(0, this._items.length);
    }
}
Stack._msgStackEmpty = "Stack is empty.";


/***/ }),

/***/ "./src/utils/delegates/action.ts":
/*!***************************************!*\
  !*** ./src/utils/delegates/action.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Action: () => (/* binding */ Action)
/* harmony export */ });
/* harmony import */ var _multicast_delegate__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./multicast-delegate */ "./src/utils/delegates/multicast-delegate.ts");

class Action extends _multicast_delegate__WEBPACK_IMPORTED_MODULE_0__.MulticastDelegate {
}


/***/ }),

/***/ "./src/utils/delegates/event-handler.ts":
/*!**********************************************!*\
  !*** ./src/utils/delegates/event-handler.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EventArgs: () => (/* binding */ EventArgs),
/* harmony export */   EventHandler: () => (/* binding */ EventHandler)
/* harmony export */ });
/* harmony import */ var _multicast_delegate__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./multicast-delegate */ "./src/utils/delegates/multicast-delegate.ts");

class EventHandler extends _multicast_delegate__WEBPACK_IMPORTED_MODULE_0__.MulticastDelegate {
    invoke(sender, eventArgs) {
        super.invoke(sender, eventArgs);
    }
    safeInvoke(sender, eventArgs) {
        super.safeInvoke(sender, eventArgs);
    }
}
class EventArgs {
}


/***/ }),

/***/ "./src/utils/delegates/multicast-delegate.ts":
/*!***************************************************!*\
  !*** ./src/utils/delegates/multicast-delegate.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MulticastDelegate: () => (/* binding */ MulticastDelegate)
/* harmony export */ });
/* harmony import */ var _collections_queue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../collections/queue */ "./src/utils/collections/queue.ts");

class MulticastDelegate {
    constructor() {
        this._delegates = [];
        this._delegateIds = new Set();
        this._lastDelegateId = -1;
        this.delegates = this._delegates;
    }
    addDelegate(method, target = null) {
        if (!method) {
            throw new Error(`No method provided.`);
        }
        const delegate = new Delegate(++this._lastDelegateId, method, target);
        this._delegates.push(delegate);
        this._delegateIds.add(delegate.id);
    }
    removeDelegate(method, target = null) {
        if (!method) {
            throw new Error(`No method provided.`);
        }
        const delegates = this._delegates;
        const delegateIds = this._delegateIds;
        for (let i = 0; i < delegates.length; i++) {
            const delegate = delegates[i];
            if (!delegate.equals(method, target)) {
                continue;
            }
            delegates.splice(i--, 1);
            delegateIds.delete(delegate.id);
        }
    }
    clear() {
        const delegates = this._delegates;
        delegates.splice(0, delegates.length);
        this._delegateIds.clear();
    }
    hasDelegate(method, target = null) {
        const delegates = this._delegates;
        const totalDelegates = delegates.length;
        for (let i = 0; i < totalDelegates; i++) {
            const delegate = delegates[i];
            if (delegate.equals(method, target)) {
                return true;
            }
        }
        return false;
    }
    invokeInternal(args, enableSafeMode) {
        let lastInvocationResult = undefined;
        const delegateIds = this._delegateIds;
        const invocationQueue = this.prepareInvocationQueue();
        try {
            while (invocationQueue.length > 0) {
                // Ignore the delegate if it has been removed
                const delegate = invocationQueue.dequeue();
                if (!delegateIds.has(delegate.id)) {
                    continue;
                }
                try {
                    lastInvocationResult = args ? delegate.method.call(delegate.target, ...args)
                        : delegate.method.call(delegate.target);
                }
                catch (e) {
                    if (enableSafeMode) {
                        console.error(e);
                    }
                    else {
                        throw e;
                    }
                }
            }
        }
        finally {
            this.disposeInvocationQueue(invocationQueue);
        }
        return lastInvocationResult;
    }
    invoke(...args) {
        return this.invokeInternal(arguments, false);
    }
    safeInvoke(...args) {
        return this.invokeInternal(arguments, true);
    }
    prepareInvocationQueue() {
        const pool = MulticastDelegate._invocationQueuePool;
        const queue = pool.length > 0 ? pool.pop() : new _collections_queue__WEBPACK_IMPORTED_MODULE_0__.Queue();
        queue.clear();
        const delegates = this._delegates;
        const totalDelegates = delegates.length;
        for (let i = 0; i < totalDelegates; i++) {
            const delegate = delegates[i];
            queue.enqueue(delegate);
        }
        return queue;
    }
    disposeInvocationQueue(queue) {
        queue.clear();
        MulticastDelegate._invocationQueuePool.push(queue);
    }
}
MulticastDelegate._invocationQueuePool = [];
class Delegate {
    constructor(id, method, target) {
        this.id = id;
        this.method = method;
        this.target = target;
    }
    equals(method, target) {
        return method === this.method && target === this.target;
    }
}


/***/ }),

/***/ "./src/utils/pcui-utils.ts":
/*!*********************************!*\
  !*** ./src/utils/pcui-utils.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ContainerUtils: () => (/* binding */ ContainerUtils),
/* harmony export */   TreeViewUtils: () => (/* binding */ TreeViewUtils)
/* harmony export */ });
/* harmony import */ var _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @playcanvas/pcui */ "./node_modules/@playcanvas/pcui/dist/module/src/index.mjs");

class ContainerUtils {
    static autoResize(container, panel) {
        panel.on(_playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.Panel.EVENT_COLLAPSE, () => {
            // @ts-ignore
            container.previousWidth = container.width;
            container.width = 32; // Just enough to show the header
        });
        panel.on(_playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.Panel.EVENT_EXPAND, () => {
            // @ts-ignore
            container.width = container.previousWidth || 300;
            // @ts-ignore
            container.previousWidth = undefined;
        });
    }
}
class TreeViewUtils {
    /**
     * Prepends the child item to the parent item. Contrary to Container.prepend(), this method properly prepends items
     * after DOM elements that are not TreeViewItems (i.e. elements that are part of the parent item itself).
     * @param childItem The item to prepend.
     * @param parentItem The item to prepend to.
     */
    static prepend(childItem, parentItem) {
        let firstChild;
        const children = parentItem.dom.childNodes;
        if (children.length === 0 || !(firstChild = this.getFirstChild(parentItem))) {
            parentItem.append(childItem);
            return;
        }
        parentItem.appendBefore(childItem, firstChild);
    }
    static getChild(index, parentItem) {
        if (index < 0) {
            return undefined;
        }
        const childItems = parentItem.dom.childNodes;
        for (let i = 0; i < childItems.length; i++) {
            const childItem = childItems[i].ui;
            if (!(childItem instanceof _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.TreeViewItem)) {
                continue;
            }
            if (index-- === 0) {
                return childItem;
            }
        }
        return undefined;
    }
    static getFirstChild(item) {
        const childNodes = item.dom.childNodes;
        for (let length = childNodes.length, i = 0; i < length; i++) {
            const childItem = childNodes[i].ui;
            if (childItem instanceof _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.TreeViewItem) {
                return childItem;
            }
        }
        return undefined;
    }
    /**
     * Destroys the children of the item. Contrary to TreeViewItem.clear(), this method preserves the child DOM
     * elements that are part of the item itself.
     * @param item The item whose children to destroy.
     */
    static destroyChildren(item) {
        const childItems = item.dom.childNodes;
        for (let i = childItems.length - 1; i >= 0; i--) {
            const childItem = childItems[i].ui;
            if (!(childItem instanceof _playcanvas_pcui__WEBPACK_IMPORTED_MODULE_0__.TreeViewItem)) {
                continue;
            }
            childItem.destroy();
        }
    }
}


/***/ }),

/***/ "./src/utils/string-utils.ts":
/*!***********************************!*\
  !*** ./src/utils/string-utils.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StringUtils: () => (/* binding */ StringUtils)
/* harmony export */ });
/* harmony import */ var playcanvas__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! playcanvas */ "playcanvas");
/* harmony import */ var playcanvas__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(playcanvas__WEBPACK_IMPORTED_MODULE_0__);

class StringUtils {
    static isString(value) {
        return typeof value === "string";
    }
    static format(value, ...args) {
        let formatted = value;
        for (let arg in args) {
            // Note that we can't rely on string.replaceAll() existing. At the time of writing an estimated 86% of
            // users support this method (2021 Q2).
            // @ts-ignore
            if (formatted.replaceAll) {
                // @ts-ignore
                // noinspection JSUnfilteredForInLoop
                formatted = formatted.replaceAll(`{${arg}}`, args[arg]);
            }
            else {
                // noinspection JSUnfilteredForInLoop
                formatted = formatted.split(`{${arg}}`).join(args[arg]);
            }
        }
        return formatted;
    }
    static trimStart(value, trimCharacters) {
        if (!value)
            throw new Error("No string argument provided.");
        const totalCharacters = value.length;
        if (totalCharacters === 0)
            return value;
        const totalTrimCharacters = trimCharacters.length;
        if (totalTrimCharacters === 0)
            return value;
        let startIndex = 0;
        while (true) {
            let hasTrimmedCharacter = false;
            for (let i = 0; i < totalTrimCharacters; i++) {
                if (!value.startsWith(trimCharacters[i], startIndex))
                    continue;
                hasTrimmedCharacter = true;
                startIndex++;
                break;
            }
            if (!hasTrimmedCharacter)
                break;
        }
        if (startIndex >= totalCharacters)
            return value; // The value consists only of prefixes
        return value.substring(startIndex);
    }
    static splitCamelOrPascalCase(value, output) {
        if (!output) {
            output = [];
        }
        const upperCaseRange = this._upperCaseRange;
        let rangeStart = 0;
        let hasEncounteredLowerCaseChar = false;
        const totalCharacters = value.length;
        for (let i = 0; i < totalCharacters; i++) {
            const charCode = value.charCodeAt(i);
            const isUpperCase = charCode >= upperCaseRange.x && charCode <= upperCaseRange.y;
            if (!isUpperCase) {
                hasEncounteredLowerCaseChar = true;
                continue;
            }
            // In case there are several upper-case chars in a row, we'll treat them as part of the same segment
            if (!hasEncounteredLowerCaseChar)
                continue;
            output.push(value.substring(rangeStart, i));
            rangeStart = i;
            hasEncounteredLowerCaseChar = false;
        }
        // Push the remainder of the string into the output
        output.push(value.substring(rangeStart));
        return output;
    }
    static isCharUpperCase(value, index = 0) {
        if (index < 0 || index > value.length - 1)
            return false;
        const upperCaseRange = this._upperCaseRange;
        const charCode = value.charCodeAt(index);
        return charCode >= upperCaseRange.x && charCode <= upperCaseRange.y;
    }
    static formatBitMask(mask, digits) {
        let output = "";
        const totalBits = Math.min(64, digits);
        for (let i = totalBits - 1; i >= 0; i--) {
            output += (mask & 1 << i) ? `1` : `0`;
            // Add a separator every 8 digits
            if (i > 0 && i % 8 === 0) {
                output += ` `;
            }
        }
        return output;
    }
    static nameToTitle(name) {
        // Trim any prefixes
        const trimmed = StringUtils.trimStart(name, ["_"]);
        if (trimmed.length === 0) {
            return name;
        }
        // Split by camel case
        const stringBuffer = this._stringBuffer;
        stringBuffer.length = 0;
        const words = StringUtils.splitCamelOrPascalCase(trimmed, stringBuffer);
        // Upper-case the first letters of all words
        let output = "";
        const totalWords = words.length;
        for (let i = 0; i < totalWords; i++) {
            if (i > 0) {
                output += " ";
            }
            const word = words[i];
            const length = word.length;
            if (length === 1) {
                output += word;
                continue;
            }
            output += word[0].toUpperCase();
            output += word.substring(1);
        }
        // Clean up
        stringBuffer.length = 0;
        return output;
    }
}
StringUtils._lowerCaseRange = new playcanvas__WEBPACK_IMPORTED_MODULE_0__.Vec2('a'.charCodeAt(0), 'z'.charCodeAt(0));
StringUtils._upperCaseRange = new playcanvas__WEBPACK_IMPORTED_MODULE_0__.Vec2('A'.charCodeAt(0), 'Z'.charCodeAt(0));
StringUtils._stringBuffer = [];


/***/ }),

/***/ "playcanvas":
/*!*********************!*\
  !*** external "pc" ***!
  \*********************/
/***/ ((module) => {

module.exports = pc;

/***/ }),

/***/ "./node_modules/@playcanvas/observer/dist/index.mjs":
/*!**********************************************************!*\
  !*** ./node_modules/@playcanvas/observer/dist/index.mjs ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Events: () => (/* binding */ Events),
/* harmony export */   History: () => (/* binding */ History),
/* harmony export */   Observer: () => (/* binding */ Observer),
/* harmony export */   ObserverHistory: () => (/* binding */ ObserverHistory),
/* harmony export */   ObserverList: () => (/* binding */ ObserverList)
/* harmony export */ });
class EventHandle {
  constructor(owner, name, fn) {
    this.owner = owner;
    this.name = name;
    this.fn = fn;
  }
  unbind() {
    if (!this.owner) return;
    this.owner.unbind(this.name, this.fn);
    this.owner = null;
    this.name = null;
    this.fn = null;
  }
  call() {
    if (!this.fn) return;
    this.fn.call(this.owner, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7]);
  }
  on(name, fn) {
    return this.owner.on(name, fn);
  }
}

class Events {
  constructor() {
    Object.defineProperty(this, '_events', {
      enumerable: false,
      configurable: false,
      writable: true,
      value: {}
    });
    this._suspendEvents = false;
    this._additionalEmitters = [];
  }
  set suspendEvents(value) {
    this._suspendEvents = !!value;
  }
  get suspendEvents() {
    return this._suspendEvents;
  }
  on(name, fn) {
    const events = this._events[name];
    if (events === undefined) {
      this._events[name] = [fn];
    } else {
      if (events.indexOf(fn) === -1) events.push(fn);
    }
    return new EventHandle(this, name, fn);
  }
  once(name, fn) {
    const evt = this.on(name, (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) => {
      fn.call(this, arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7);
      evt.unbind();
    });
    return evt;
  }
  emit(name, arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
    if (this._suspendEvents) return this;
    let events = this._events[name];
    if (events && events.length) {
      events = events.slice(0);
      for (let i = 0; i < events.length; i++) {
        if (!events[i]) continue;
        try {
          events[i].call(this, arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7);
        } catch (ex) {
          console.info('%c%s %c(event error)', 'color: #06f', name, 'color: #f00');
          console.log(ex.stack);
        }
      }
    }
    if (this._additionalEmitters.length) {
      const emitters = this._additionalEmitters.slice();
      emitters.forEach(emitter => {
        emitter.emit(name, arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7);
      });
    }
    return this;
  }
  unbind(name, fn) {
    if (name) {
      const events = this._events[name];
      if (!events) return this;
      if (fn) {
        const i = events.indexOf(fn);
        if (i !== -1) {
          if (events.length === 1) {
            delete this._events[name];
          } else {
            events.splice(i, 1);
          }
        }
      } else {
        delete this._events[name];
      }
    } else {
      this._events = {};
    }
    return this;
  }
  addEmitter(emitter) {
    if (!this._additionalEmitters.includes(emitter)) {
      this._additionalEmitters.push(emitter);
    }
  }
  removeEmitter(emitter) {
    const idx = this._additionalEmitters.indexOf(emitter);
    if (idx !== -1) {
      this._additionalEmitters.splice(idx, 1);
    }
  }
}

const arrayEquals = (a, b) => {
  if (!a || !b) {
    return false;
  }
  const l = a.length;
  if (l !== b.length) {
    return false;
  }
  for (let i = 0; i < l; i++) {
    if (a[i] instanceof Array && b[i] instanceof Array) {
      if (!arrayEquals(a[i], b[i])) {
        return false;
      }
    } else if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
};
class Observer extends Events {
  constructor(data, options = {}) {
    super();
    this._destroyed = false;
    this._path = '';
    this._keys = [];
    this._data = {};
    this._pathsWithDuplicates = null;
    if (options.pathsWithDuplicates) {
      this._pathsWithDuplicates = {};
      for (let i = 0; i < options.pathsWithDuplicates.length; i++) {
        this._pathsWithDuplicates[options.pathsWithDuplicates[i]] = true;
      }
    }
    this.patch(data);
    this._parent = options.parent || null;
    this._parentPath = options.parentPath || '';
    this._parentField = options.parentField || null;
    this._parentKey = options.parentKey || null;
    this._latestFn = options.latestFn || null;
    this._silent = false;
    const propagate = function propagate(evt) {
      return function (path, arg1, arg2, arg3) {
        if (!this._parent) return;
        let key = this._parentKey;
        if (!key && this._parentField instanceof Array) {
          key = this._parentField.indexOf(this);
          if (key === -1) return;
        }
        path = this._parentPath + '.' + key + '.' + path;
        let state;
        if (this._silent) state = this._parent.silence();
        this._parent.emit(path + ':' + evt, arg1, arg2, arg3);
        this._parent.emit('*:' + evt, path, arg1, arg2, arg3);
        if (this._silent) this._parent.silenceRestore(state);
      };
    };
    this.on('*:set', propagate('set'));
    this.on('*:unset', propagate('unset'));
    this.on('*:insert', propagate('insert'));
    this.on('*:remove', propagate('remove'));
    this.on('*:move', propagate('move'));
  }
  static _splitPath(path) {
    const cache = Observer._splitPathsCache;
    let result = cache[path];
    if (!result) {
      result = path.split('.');
      cache[path] = result;
    } else {
      result = result.slice();
    }
    return result;
  }
  silence() {
    this._silent = true;
    const historyState = this.history && this.history.enabled;
    if (historyState) this.history.enabled = false;
    const syncState = this.sync && this.sync.enabled;
    if (syncState) this.sync.enabled = false;
    return [historyState, syncState];
  }
  silenceRestore(state) {
    this._silent = false;
    if (state[0]) this.history.enabled = true;
    if (state[1]) this.sync.enabled = true;
  }
  _prepare(target, key, value, silent, remote) {
    let i;
    let state;
    const path = (target._path ? target._path + '.' : '') + key;
    const type = typeof value;
    target._keys.push(key);
    if (type === 'object' && value instanceof Array) {
      target._data[key] = value.slice(0);
      for (i = 0; i < target._data[key].length; i++) {
        if (typeof target._data[key][i] === 'object' && target._data[key][i] !== null) {
          if (target._data[key][i] instanceof Array) {
            target._data[key][i].slice(0);
          } else {
            target._data[key][i] = new Observer(target._data[key][i], {
              parent: this,
              parentPath: path,
              parentField: target._data[key],
              parentKey: null
            });
          }
        } else {
          state = this.silence();
          this.emit(path + '.' + i + ':set', target._data[key][i], null, remote);
          this.emit('*:set', path + '.' + i, target._data[key][i], null, remote);
          this.silenceRestore(state);
        }
      }
      if (silent) state = this.silence();
      this.emit(path + ':set', target._data[key], null, remote);
      this.emit('*:set', path, target._data[key], null, remote);
      if (silent) this.silenceRestore(state);
    } else if (type === 'object' && value instanceof Object) {
      if (typeof target._data[key] !== 'object') {
        target._data[key] = {
          _path: path,
          _keys: [],
          _data: {}
        };
      }
      for (i in value) {
        if (typeof value[i] === 'object') {
          this._prepare(target._data[key], i, value[i], true, remote);
        } else {
          state = this.silence();
          target._data[key]._data[i] = value[i];
          target._data[key]._keys.push(i);
          this.emit(path + '.' + i + ':set', value[i], null, remote);
          this.emit('*:set', path + '.' + i, value[i], null, remote);
          this.silenceRestore(state);
        }
      }
      if (silent) state = this.silence();
      this.emit(path + ':set', value, undefined, remote);
      this.emit('*:set', path, value, undefined, remote);
      if (silent) this.silenceRestore(state);
    } else {
      if (silent) state = this.silence();
      target._data[key] = value;
      this.emit(path + ':set', value, undefined, remote);
      this.emit('*:set', path, value, undefined, remote);
      if (silent) this.silenceRestore(state);
    }
    return true;
  }
  set(path, value, silent, remote, force) {
    let i;
    let valueOld;
    let keys = Observer._splitPath(path);
    const length = keys.length;
    const key = keys[length - 1];
    let node = this;
    let nodePath = '';
    let obj = this;
    let state;
    for (i = 0; i < length - 1; i++) {
      if (node instanceof Array) {
        node = node[keys[i]];
        if (node instanceof Observer) {
          path = keys.slice(i + 1).join('.');
          obj = node;
        }
      } else {
        if (i < length && typeof node._data[keys[i]] !== 'object') {
          if (node._data[keys[i]]) obj.unset((node.__path ? node.__path + '.' : '') + keys[i]);
          node._data[keys[i]] = {
            _path: path,
            _keys: [],
            _data: {}
          };
          node._keys.push(keys[i]);
        }
        if (i === length - 1 && node.__path) nodePath = node.__path + '.' + keys[i];
        node = node._data[keys[i]];
      }
    }
    if (node instanceof Array) {
      const ind = parseInt(key, 10);
      if (node[ind] === value && !force) return false;
      valueOld = node[ind];
      if (valueOld instanceof Observer) {
        valueOld = valueOld.json();
      } else {
        valueOld = obj.json(valueOld);
      }
      node[ind] = value;
      if (value instanceof Observer) {
        value._parent = obj;
        value._parentPath = nodePath;
        value._parentField = node;
        value._parentKey = null;
      }
      if (silent) state = obj.silence();
      obj.emit(path + ':set', value, valueOld, remote);
      obj.emit('*:set', path, value, valueOld, remote);
      if (silent) obj.silenceRestore(state);
      return true;
    } else if (node._data && !node._data.hasOwnProperty(key)) {
      if (typeof value === 'object') {
        return obj._prepare(node, key, value, false, remote);
      }
      node._data[key] = value;
      node._keys.push(key);
      if (silent) state = obj.silence();
      obj.emit(path + ':set', value, null, remote);
      obj.emit('*:set', path, value, null, remote);
      if (silent) obj.silenceRestore(state);
      return true;
    }
    if (typeof value === 'object' && value instanceof Array) {
      if (arrayEquals(value, node._data[key]) && !force) return false;
      valueOld = node._data[key];
      if (!(valueOld instanceof Observer)) valueOld = obj.json(valueOld);
      if (node._data[key] && node._data[key].length === value.length) {
        state = obj.silence();
        if (value.length === 0) {
          node._data[key] = value;
        }
        for (i = 0; i < node._data[key].length; i++) {
          if (node._data[key][i] instanceof Observer) {
            node._data[key][i].patch(value[i], true);
          } else if (node._data[key][i] !== value[i]) {
            node._data[key][i] = value[i];
            obj.emit(path + '.' + i + ':set', node._data[key][i], valueOld && valueOld[i] || null, remote);
            obj.emit('*:set', path + '.' + i, node._data[key][i], valueOld && valueOld[i] || null, remote);
          }
        }
        obj.silenceRestore(state);
      } else {
        node._data[key] = [];
        value.forEach(val => {
          this._doInsert(node, key, val, undefined, true);
        });
        state = obj.silence();
        for (i = 0; i < node._data[key].length; i++) {
          obj.emit(path + '.' + i + ':set', node._data[key][i], valueOld && valueOld[i] || null, remote);
          obj.emit('*:set', path + '.' + i, node._data[key][i], valueOld && valueOld[i] || null, remote);
        }
        obj.silenceRestore(state);
      }
      if (silent) state = obj.silence();
      obj.emit(path + ':set', value, valueOld, remote);
      obj.emit('*:set', path, value, valueOld, remote);
      if (silent) obj.silenceRestore(state);
      return true;
    } else if (typeof value === 'object' && value instanceof Object) {
      let changed = false;
      valueOld = node._data[key];
      if (!(valueOld instanceof Observer)) valueOld = obj.json(valueOld);
      keys = Object.keys(value);
      if (!node._data[key] || !node._data[key]._data) {
        if (node._data[key]) {
          obj.unset((node.__path ? node.__path + '.' : '') + key);
        } else {
          changed = true;
        }
        node._data[key] = {
          _path: path,
          _keys: [],
          _data: {}
        };
      }
      let c;
      for (const n in node._data[key]._data) {
        if (!value.hasOwnProperty(n)) {
          c = obj.unset(path + '.' + n, true);
          if (c) changed = true;
        } else if (node._data[key]._data.hasOwnProperty(n)) {
          if (!obj._equals(node._data[key]._data[n], value[n])) {
            c = obj.set(path + '.' + n, value[n], true);
            if (c) changed = true;
          }
        } else {
          c = obj._prepare(node._data[key], n, value[n], true, remote);
          if (c) changed = true;
        }
      }
      for (i = 0; i < keys.length; i++) {
        if (value[keys[i]] === undefined && node._data[key]._data.hasOwnProperty(keys[i])) {
          c = obj.unset(path + '.' + keys[i], true);
          if (c) changed = true;
        } else if (typeof value[keys[i]] === 'object') {
          if (node._data[key]._data.hasOwnProperty(keys[i])) {
            c = obj.set(path + '.' + keys[i], value[keys[i]], true);
            if (c) changed = true;
          } else {
            c = obj._prepare(node._data[key], keys[i], value[keys[i]], true, remote);
            if (c) changed = true;
          }
        } else if (!obj._equals(node._data[key]._data[keys[i]], value[keys[i]])) {
          if (typeof value[keys[i]] === 'object') {
            c = obj.set(node._data[key]._path + '.' + keys[i], value[keys[i]], true);
            if (c) changed = true;
          } else if (node._data[key]._data[keys[i]] !== value[keys[i]]) {
            changed = true;
            if (node._data[key]._keys.indexOf(keys[i]) === -1) node._data[key]._keys.push(keys[i]);
            node._data[key]._data[keys[i]] = value[keys[i]];
            state = obj.silence();
            obj.emit(node._data[key]._path + '.' + keys[i] + ':set', node._data[key]._data[keys[i]], null, remote);
            obj.emit('*:set', node._data[key]._path + '.' + keys[i], node._data[key]._data[keys[i]], null, remote);
            obj.silenceRestore(state);
          }
        }
      }
      if (changed) {
        if (silent) state = obj.silence();
        const val = obj.json(node._data[key]);
        obj.emit(node._data[key]._path + ':set', val, valueOld, remote);
        obj.emit('*:set', node._data[key]._path, val, valueOld, remote);
        if (silent) obj.silenceRestore(state);
        return true;
      }
      return false;
    }
    let data;
    if (!node.hasOwnProperty('_data') && node.hasOwnProperty(key)) {
      data = node;
    } else {
      data = node._data;
    }
    if (data[key] === value && !force) return false;
    if (silent) state = obj.silence();
    valueOld = data[key];
    if (!(valueOld instanceof Observer)) valueOld = obj.json(valueOld);
    data[key] = value;
    obj.emit(path + ':set', value, valueOld, remote);
    obj.emit('*:set', path, value, valueOld, remote);
    if (silent) obj.silenceRestore(state);
    return true;
  }
  has(path) {
    const keys = Observer._splitPath(path);
    let node = this;
    for (let i = 0, len = keys.length; i < len; i++) {
      if (node == undefined) return undefined;
      if (node._data) {
        node = node._data[keys[i]];
      } else {
        node = node[keys[i]];
      }
    }
    return node !== undefined;
  }
  get(path, raw) {
    const keys = Observer._splitPath(path);
    let node = this;
    for (let i = 0; i < keys.length; i++) {
      if (node == undefined) return undefined;
      if (node._data) {
        node = node._data[keys[i]];
      } else {
        node = node[keys[i]];
      }
    }
    if (raw) return node;
    if (node == null) {
      return null;
    }
    return this.json(node);
  }
  getRaw(path) {
    return this.get(path, true);
  }
  _equals(a, b) {
    if (a === b) {
      return true;
    } else if (a instanceof Array && b instanceof Array && arrayEquals(a, b)) {
      return true;
    }
    return false;
  }
  unset(path, silent, remote) {
    let i;
    const keys = Observer._splitPath(path);
    const key = keys[keys.length - 1];
    let node = this;
    let obj = this;
    for (i = 0; i < keys.length - 1; i++) {
      if (node instanceof Array) {
        node = node[keys[i]];
        if (node instanceof Observer) {
          path = keys.slice(i + 1).join('.');
          obj = node;
        }
      } else {
        node = node._data[keys[i]];
      }
    }
    if (!node._data || !node._data.hasOwnProperty(key)) return false;
    let valueOld = node._data[key];
    if (!(valueOld instanceof Observer)) valueOld = obj.json(valueOld);
    if (node._data[key] && node._data[key]._data) {
      for (i = node._data[key]._keys.length - 1; i >= 0; i--) {
        obj.unset(path + '.' + node._data[key]._keys[i], true);
      }
    }
    node._keys.splice(node._keys.indexOf(key), 1);
    delete node._data[key];
    let state;
    if (silent) state = obj.silence();
    obj.emit(path + ':unset', valueOld, remote);
    obj.emit('*:unset', path, valueOld, remote);
    if (silent) obj.silenceRestore(state);
    return true;
  }
  remove(path, ind, silent, remote) {
    const keys = Observer._splitPath(path);
    const key = keys[keys.length - 1];
    let node = this;
    let obj = this;
    for (let i = 0; i < keys.length - 1; i++) {
      if (node instanceof Array) {
        node = node[parseInt(keys[i], 10)];
        if (node instanceof Observer) {
          path = keys.slice(i + 1).join('.');
          obj = node;
        }
      } else if (node._data && node._data.hasOwnProperty(keys[i])) {
        node = node._data[keys[i]];
      } else {
        return false;
      }
    }
    if (!node._data || !node._data.hasOwnProperty(key) || !(node._data[key] instanceof Array)) return false;
    const arr = node._data[key];
    if (arr.length < ind) return false;
    let value = arr[ind];
    if (value instanceof Observer) {
      value._parent = null;
    } else {
      value = obj.json(value);
    }
    arr.splice(ind, 1);
    let state;
    if (silent) state = obj.silence();
    obj.emit(path + ':remove', value, ind, remote);
    obj.emit('*:remove', path, value, ind, remote);
    if (silent) obj.silenceRestore(state);
    return true;
  }
  removeValue(path, value, silent, remote) {
    const keys = Observer._splitPath(path);
    const key = keys[keys.length - 1];
    let node = this;
    let obj = this;
    for (let i = 0; i < keys.length - 1; i++) {
      if (node instanceof Array) {
        node = node[parseInt(keys[i], 10)];
        if (node instanceof Observer) {
          path = keys.slice(i + 1).join('.');
          obj = node;
        }
      } else if (node._data && node._data.hasOwnProperty(keys[i])) {
        node = node._data[keys[i]];
      } else {
        return;
      }
    }
    if (!node._data || !node._data.hasOwnProperty(key) || !(node._data[key] instanceof Array)) return;
    const arr = node._data[key];
    const ind = arr.indexOf(value);
    if (ind === -1) {
      return;
    }
    if (arr.length < ind) return;
    value = arr[ind];
    if (value instanceof Observer) {
      value._parent = null;
    } else {
      value = obj.json(value);
    }
    arr.splice(ind, 1);
    let state;
    if (silent) state = obj.silence();
    obj.emit(path + ':remove', value, ind, remote);
    obj.emit('*:remove', path, value, ind, remote);
    if (silent) obj.silenceRestore(state);
    return true;
  }
  insert(path, value, ind, silent, remote) {
    const keys = Observer._splitPath(path);
    const key = keys[keys.length - 1];
    let node = this;
    let obj = this;
    for (let i = 0; i < keys.length - 1; i++) {
      if (node instanceof Array) {
        node = node[parseInt(keys[i], 10)];
        if (node instanceof Observer) {
          path = keys.slice(i + 1).join('.');
          obj = node;
        }
      } else if (node._data && node._data.hasOwnProperty(keys[i])) {
        node = node._data[keys[i]];
      } else {
        return;
      }
    }
    if (!node._data || !node._data.hasOwnProperty(key) || !(node._data[key] instanceof Array)) return;
    const arr = node._data[key];
    value = obj._doInsert(node, key, value, ind);
    if (ind === undefined) {
      ind = arr.length - 1;
    }
    let state;
    if (silent) state = obj.silence();
    obj.emit(path + ':insert', value, ind, remote);
    obj.emit('*:insert', path, value, ind, remote);
    if (silent) obj.silenceRestore(state);
    return true;
  }
  _doInsert(node, key, value, ind, allowDuplicates) {
    const arr = node._data[key];
    if (typeof value === 'object' && !(value instanceof Observer) && value !== null) {
      if (value instanceof Array) {
        value = value.slice(0);
      } else {
        value = new Observer(value);
      }
    }
    const path = node._path ? `${node._path}.${key}` : key;
    if (value !== null && !allowDuplicates && (!this._pathsWithDuplicates || !this._pathsWithDuplicates[path])) {
      if (arr.indexOf(value) !== -1) {
        return;
      }
    }
    if (ind === undefined) {
      arr.push(value);
    } else {
      arr.splice(ind, 0, value);
    }
    if (value instanceof Observer) {
      value._parent = this;
      value._parentPath = path;
      value._parentField = arr;
      value._parentKey = null;
    } else {
      value = this.json(value);
    }
    return value;
  }
  move(path, indOld, indNew, silent, remote) {
    const keys = Observer._splitPath(path);
    const key = keys[keys.length - 1];
    let node = this;
    let obj = this;
    for (let i = 0; i < keys.length - 1; i++) {
      if (node instanceof Array) {
        node = node[parseInt(keys[i], 10)];
        if (node instanceof Observer) {
          path = keys.slice(i + 1).join('.');
          obj = node;
        }
      } else if (node._data && node._data.hasOwnProperty(keys[i])) {
        node = node._data[keys[i]];
      } else {
        return;
      }
    }
    if (!node._data || !node._data.hasOwnProperty(key) || !(node._data[key] instanceof Array)) return;
    const arr = node._data[key];
    if (arr.length < indOld || arr.length < indNew || indOld === indNew) return;
    let value = arr[indOld];
    arr.splice(indOld, 1);
    if (indNew === -1) indNew = arr.length;
    arr.splice(indNew, 0, value);
    if (!(value instanceof Observer)) value = obj.json(value);
    let state;
    if (silent) state = obj.silence();
    obj.emit(path + ':move', value, indNew, indOld, remote);
    obj.emit('*:move', path, value, indNew, indOld, remote);
    if (silent) obj.silenceRestore(state);
    return true;
  }
  patch(data, removeMissingKeys) {
    if (typeof data !== 'object') return;
    for (const key in data) {
      if (typeof data[key] === 'object' && !this._data.hasOwnProperty(key)) {
        this._prepare(this, key, data[key]);
      } else if (this._data[key] !== data[key]) {
        this.set(key, data[key]);
      }
    }
    if (removeMissingKeys) {
      for (const key in this._data) {
        if (!data.hasOwnProperty(key)) {
          this.unset(key);
        }
      }
    }
  }
  json(target) {
    let key, n;
    let obj = {};
    const node = target === undefined ? this : target;
    let len, nlen;
    if (node instanceof Object && node._keys) {
      len = node._keys.length;
      for (let i = 0; i < len; i++) {
        key = node._keys[i];
        const value = node._data[key];
        const type = typeof value;
        if (type === 'object' && value instanceof Array) {
          obj[key] = value.slice(0);
          nlen = obj[key].length;
          for (n = 0; n < nlen; n++) {
            if (typeof obj[key][n] === 'object') obj[key][n] = this.json(obj[key][n]);
          }
        } else if (type === 'object' && value instanceof Object) {
          obj[key] = this.json(value);
        } else {
          obj[key] = value;
        }
      }
    } else {
      if (node === null) {
        return null;
      } else if (typeof node === 'object' && node instanceof Array) {
        obj = node.slice(0);
        len = obj.length;
        for (n = 0; n < len; n++) {
          obj[n] = this.json(obj[n]);
        }
      } else if (typeof node === 'object') {
        for (key in node) {
          if (node.hasOwnProperty(key)) obj[key] = node[key];
        }
      } else {
        obj = node;
      }
    }
    return obj;
  }
  forEach(fn, target, path = '') {
    const node = target || this;
    for (let i = 0; i < node._keys.length; i++) {
      const key = node._keys[i];
      const value = node._data[key];
      const type = this.schema && this.schema.has(path + key) && this.schema.get(path + key).type.name.toLowerCase() || typeof value;
      if (type === 'object' && value instanceof Array) {
        fn(path + key, 'array', value, key);
      } else if (type === 'object' && value instanceof Object) {
        fn(path + key, 'object', value, key);
        this.forEach(fn, value, path + key + '.');
      } else {
        fn(path + key, type, value, key);
      }
    }
  }
  latest() {
    return this._latestFn ? this._latestFn() : this;
  }
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this.emit('destroy');
    this.unbind();
  }
  set latestFn(value) {
    this._latestFn = value;
  }
  get latestFn() {
    return this._latestFn;
  }
}
Observer._splitPathsCache = {};

class ObserverList extends Events {
  constructor(options = {}) {
    super();
    this.data = [];
    this._indexed = {};
    this.sorted = options.sorted || null;
    this.index = options.index || null;
  }
  get length() {
    return this.data.length;
  }
  get(index) {
    if (this.index) {
      return this._indexed[index] || null;
    }
    return this.data[index] || null;
  }
  set(index, value) {
    if (this.index) {
      this._indexed[index] = value;
    } else {
      this.data[index] = value;
    }
  }
  indexOf(item) {
    if (this.index) {
      const index = item instanceof Observer && item.get(this.index) || item[this.index];
      return this._indexed[index] && index || null;
    }
    const ind = this.data.indexOf(item);
    return ind !== -1 ? ind : null;
  }
  position(b, fn) {
    const l = this.data;
    let min = 0;
    let max = l.length - 1;
    let cur;
    let a, i;
    fn = fn || this.sorted;
    while (min <= max) {
      cur = Math.floor((min + max) / 2);
      a = l[cur];
      i = fn(a, b);
      if (i === 1) {
        max = cur - 1;
      } else if (i === -1) {
        min = cur + 1;
      } else {
        return cur;
      }
    }
    return -1;
  }
  positionNextClosest(b, fn) {
    const l = this.data;
    let min = 0;
    let max = l.length - 1;
    let cur;
    let a, i;
    fn = fn || this.sorted;
    if (l.length === 0) return -1;
    if (fn(l[0], b) === 0) return 0;
    while (min <= max) {
      cur = Math.floor((min + max) / 2);
      a = l[cur];
      i = fn(a, b);
      if (i === 1) {
        max = cur - 1;
      } else if (i === -1) {
        min = cur + 1;
      } else {
        return cur;
      }
    }
    if (fn(a, b) === 1) return cur;
    if (cur + 1 === l.length) return -1;
    return cur + 1;
  }
  has(item) {
    if (this.index) {
      const index = item instanceof Observer && item.get(this.index) || item[this.index];
      return !!this._indexed[index];
    }
    return this.data.indexOf(item) !== -1;
  }
  add(item) {
    if (this.has(item)) return null;
    let index = this.data.length;
    if (this.index) {
      index = item instanceof Observer && item.get(this.index) || item[this.index];
      this._indexed[index] = item;
    }
    let pos = 0;
    if (this.sorted) {
      pos = this.positionNextClosest(item);
      if (pos !== -1) {
        this.data.splice(pos, 0, item);
      } else {
        this.data.push(item);
      }
    } else {
      this.data.push(item);
      pos = this.data.length - 1;
    }
    this.emit('add', item, index, pos);
    if (this.index) {
      const id = item.get(this.index);
      if (id) {
        this.emit(`add[${id}]`, item, index, pos);
      }
    }
    return pos;
  }
  move(item, pos) {
    const ind = this.data.indexOf(item);
    this.data.splice(ind, 1);
    if (pos === -1) {
      this.data.push(item);
    } else {
      this.data.splice(pos, 0, item);
    }
    this.emit('move', item, pos);
  }
  remove(item) {
    if (!this.has(item)) return;
    const ind = this.data.indexOf(item);
    let index = ind;
    if (this.index) {
      index = item instanceof Observer && item.get(this.index) || item[this.index];
      delete this._indexed[index];
    }
    this.data.splice(ind, 1);
    this.emit('remove', item, index);
  }
  removeByKey(index) {
    let item;
    if (this.index) {
      item = this._indexed[index];
      if (!item) return;
      const ind = this.data.indexOf(item);
      this.data.splice(ind, 1);
      delete this._indexed[index];
      this.emit('remove', item, ind);
    } else {
      if (this.data.length < index) return;
      item = this.data[index];
      this.data.splice(index, 1);
      this.emit('remove', item, index);
    }
  }
  removeBy(fn) {
    let i = this.data.length;
    while (i--) {
      if (!fn(this.data[i])) continue;
      if (this.index) {
        delete this._indexed[this.data[i][this.index]];
      }
      this.data.splice(i, 1);
      this.emit('remove', this.data[i], i);
    }
  }
  clear() {
    const items = this.data.slice(0);
    this.data = [];
    this._indexed = {};
    let i = items.length;
    while (i--) {
      this.emit('remove', items[i], i);
    }
  }
  forEach(fn) {
    for (let i = 0; i < this.data.length; i++) {
      fn(this.data[i], this.index && this.data[i][this.index] || i);
    }
  }
  find(fn) {
    const items = [];
    for (let i = 0; i < this.data.length; i++) {
      if (!fn(this.data[i])) continue;
      let index = i;
      if (this.index) index = this.data[i][this.index];
      items.push([index, this.data[i]]);
    }
    return items;
  }
  findOne(fn) {
    for (let i = 0; i < this.data.length; i++) {
      if (!fn(this.data[i])) continue;
      let index = i;
      if (this.index) index = this.data[i][this.index];
      return [index, this.data[i]];
    }
    return null;
  }
  map(fn) {
    return this.data.map(fn);
  }
  sort(fn) {
    this.data.sort(fn);
  }
  array() {
    return this.data.slice(0);
  }
  json() {
    const items = this.array();
    for (let i = 0; i < items.length; i++) {
      if (items[i] instanceof Observer) {
        items[i] = items[i].json();
      }
    }
    return items;
  }
}

class History extends Events {
  constructor() {
    super();
    this._executing = 0;
    this._actions = [];
    this._currentActionIndex = -1;
    this._canUndo = false;
    this._canRedo = false;
  }
  add(action) {
    if (!action.name) {
      console.error('Trying to add history action without name');
      return false;
    }
    if (!action.undo) {
      console.error('Trying to add history action without undo method', action.name);
      return false;
    }
    if (!action.redo) {
      console.error('Trying to add history action without redo method', action.name);
      return false;
    }
    if (this._currentActionIndex !== this._actions.length - 1) {
      this._actions = this._actions.slice(0, this._currentActionIndex + 1);
    }
    if (action.combine && this.currentAction && this.currentAction.name === action.name) {
      this.currentAction.redo = action.redo;
    } else {
      const length = this._actions.push(action);
      this._currentActionIndex = length - 1;
    }
    this.emit('add', action.name);
    this.canUndo = true;
    this.canRedo = false;
    return true;
  }
  async addAndExecute(action) {
    if (this.add(action)) {
      try {
        this.executing++;
        await action.redo();
      } finally {
        this.executing--;
      }
    }
  }
  async undo() {
    if (!this.canUndo) return;
    const name = this.currentAction.name;
    const undo = this.currentAction.undo;
    this._currentActionIndex--;
    this.emit('undo', name);
    if (this._currentActionIndex < 0) {
      this.canUndo = false;
    }
    this.canRedo = true;
    try {
      this.executing++;
      await undo();
    } catch (ex) {
      console.info('%c(pcui.History#undo)', 'color: #f00');
      console.log(ex.stack);
    } finally {
      this.executing--;
    }
  }
  async redo() {
    if (!this.canRedo) return;
    this._currentActionIndex++;
    const redo = this.currentAction.redo;
    this.emit('redo', this.currentAction.name);
    this.canUndo = true;
    if (this._currentActionIndex === this._actions.length - 1) {
      this.canRedo = false;
    }
    try {
      this.executing++;
      await redo();
    } catch (ex) {
      console.info('%c(pcui.History#redo)', 'color: #f00');
      console.log(ex.stack);
    } finally {
      this.executing--;
    }
  }
  clear() {
    if (!this._actions.length) return;
    this._actions.length = 0;
    this._currentActionIndex = -1;
    this.canUndo = false;
    this.canRedo = false;
  }
  get currentAction() {
    return this._actions[this._currentActionIndex] || null;
  }
  get lastAction() {
    return this._actions[this._actions.length - 1] || null;
  }
  set canUndo(value) {
    if (this._canUndo === value) return;
    this._canUndo = value;
    if (!this.executing) {
      this.emit('canUndo', value);
    }
  }
  get canUndo() {
    return this._canUndo && !this.executing;
  }
  set canRedo(value) {
    if (this._canRedo === value) return;
    this._canRedo = value;
    if (!this.executing) {
      this.emit('canRedo', value);
    }
  }
  get canRedo() {
    return this._canRedo && !this.executing;
  }
  set executing(value) {
    if (this._executing === value) return;
    this._executing = value;
    if (this._executing) {
      this.emit('canUndo', false);
      this.emit('canRedo', false);
    } else {
      this.emit('canUndo', this._canUndo);
      this.emit('canRedo', this._canRedo);
    }
  }
  get executing() {
    return this._executing;
  }
}

class ObserverHistory extends Events {
  constructor(args = {}) {
    super();
    this.item = args.item;
    this._history = args.history;
    this._enabled = args.enabled || true;
    this._prefix = args.prefix || '';
    this._combine = args.combine || false;
    this._events = [];
    this._initialize();
  }
  _initialize() {
    this._events.push(this.item.on('*:set', (path, value, valueOld) => {
      if (!this._enabled || !this._history) return;
      if (value instanceof Observer) value = value.json();
      const action = {
        name: this._prefix + path,
        combine: this._combine,
        undo: () => {
          const item = this.item.latest();
          if (!item) return;
          item.history.enabled = false;
          if (valueOld === undefined) {
            item.unset(path);
          } else {
            item.set(path, valueOld);
          }
          item.history.enabled = true;
        },
        redo: () => {
          const item = this.item.latest();
          if (!item) return;
          item.history.enabled = false;
          if (value === undefined) {
            item.unset(path);
          } else {
            item.set(path, value);
          }
          item.history.enabled = true;
        }
      };
      this._history.add(action);
    }));
    this._events.push(this.item.on('*:unset', (path, valueOld) => {
      if (!this._enabled || !this._history) return;
      const action = {
        name: this._prefix + path,
        combine: this._combine,
        undo: () => {
          const item = this.item.latest();
          if (!item) return;
          item.history.enabled = false;
          item.set(path, valueOld);
          item.history.enabled = true;
        },
        redo: () => {
          const item = this.item.latest();
          if (!item) return;
          item.history.enabled = false;
          item.unset(path);
          item.history.enabled = true;
        }
      };
      this._history.add(action);
    }));
    this._events.push(this.item.on('*:insert', (path, value, ind) => {
      if (!this._enabled || !this._history) return;
      const action = {
        name: this._prefix + path,
        combine: this._combine,
        undo: () => {
          const item = this.item.latest();
          if (!item) return;
          item.history.enabled = false;
          item.removeValue(path, value);
          item.history.enabled = true;
        },
        redo: () => {
          const item = this.item.latest();
          if (!item) return;
          item.history.enabled = false;
          item.insert(path, value, ind);
          item.history.enabled = true;
        }
      };
      this._history.add(action);
    }));
    this._events.push(this.item.on('*:remove', (path, value, ind) => {
      if (!this._enabled || !this._history) return;
      const action = {
        name: this._prefix + path,
        combine: this._combine,
        undo: () => {
          const item = this.item.latest();
          if (!item) return;
          item.history.enabled = false;
          item.insert(path, value, ind);
          item.history.enabled = true;
        },
        redo: () => {
          const item = this.item.latest();
          if (!item) return;
          item.history.enabled = false;
          item.removeValue(path, value);
          item.history.enabled = true;
        }
      };
      this._history.add(action);
    }));
    this._events.push(this.item.on('*:move', (path, value, ind, indOld) => {
      if (!this._enabled || !this._history) return;
      const action = {
        name: this._prefix + path,
        combine: this._combine,
        undo: () => {
          const item = this.item.latest();
          if (!item) return;
          item.history.enabled = false;
          item.move(path, ind, indOld);
          item.history.enabled = true;
        },
        redo: () => {
          const item = this.item.latest();
          if (!item) return;
          item.history.enabled = false;
          item.move(path, indOld, ind);
          item.history.enabled = true;
        }
      };
      this._history.add(action);
    }));
  }
  destroy() {
    this._events.forEach(evt => {
      evt.unbind();
    });
    this._events.length = 0;
    this.item = null;
  }
  set enabled(value) {
    this._enabled = !!value;
  }
  get enabled() {
    return this._enabled;
  }
  set prefix(value) {
    this._prefix = value || '';
  }
  get prefix() {
    return this._prefix;
  }
  set combine(value) {
    this._combine = !!value;
  }
  get combine() {
    return this._combine;
  }
}




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/node_modules/playcanvas/build/playcanvas.mjs/core/core.mjs":
/*!**************************************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/node_modules/playcanvas/build/playcanvas.mjs/core/core.mjs ***!
  \**************************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   extend: () => (/* binding */ extend),
/* harmony export */   type: () => (/* binding */ type)
/* harmony export */ });
const typeofs = ['undefined', 'number', 'string', 'boolean'];
const objectTypes = {
	'[object Array]': 'array',
	'[object Object]': 'object',
	'[object Function]': 'function',
	'[object Date]': 'date',
	'[object RegExp]': 'regexp',
	'[object Float32Array]': 'float32array'
};
function type(obj) {
	if (obj === null) {
		return 'null';
	}
	const typeString = typeof obj;
	if (typeofs.includes(typeString)) {
		return typeString;
	}
	return objectTypes[Object.prototype.toString.call(obj)];
}
function extend(target, ex) {
	for (const prop in ex) {
		const copy = ex[prop];
		if (type(copy) === 'object') {
			target[prop] = extend({}, copy);
		} else if (type(copy) === 'array') {
			target[prop] = extend([], copy);
		} else {
			target[prop] = copy;
		}
	}
	return target;
}




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/node_modules/playcanvas/build/playcanvas.mjs/core/math/constants.mjs":
/*!************************************************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/node_modules/playcanvas/build/playcanvas.mjs/core/math/constants.mjs ***!
  \************************************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CURVE_CARDINAL: () => (/* binding */ CURVE_CARDINAL),
/* harmony export */   CURVE_CATMULL: () => (/* binding */ CURVE_CATMULL),
/* harmony export */   CURVE_LINEAR: () => (/* binding */ CURVE_LINEAR),
/* harmony export */   CURVE_SMOOTHSTEP: () => (/* binding */ CURVE_SMOOTHSTEP),
/* harmony export */   CURVE_SPLINE: () => (/* binding */ CURVE_SPLINE),
/* harmony export */   CURVE_STEP: () => (/* binding */ CURVE_STEP)
/* harmony export */ });
const CURVE_LINEAR = 0;
const CURVE_SMOOTHSTEP = 1;
const CURVE_CATMULL = 2;
const CURVE_CARDINAL = 3;
const CURVE_SPLINE = 4;
const CURVE_STEP = 5;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/node_modules/playcanvas/build/playcanvas.mjs/core/math/curve-evaluator.mjs":
/*!******************************************************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/node_modules/playcanvas/build/playcanvas.mjs/core/math/curve-evaluator.mjs ***!
  \******************************************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CurveEvaluator: () => (/* binding */ CurveEvaluator)
/* harmony export */ });
/* harmony import */ var _constants_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants.mjs */ "./node_modules/@playcanvas/pcui/dist/module/node_modules/playcanvas/build/playcanvas.mjs/core/math/constants.mjs");
/* harmony import */ var _math_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./math.mjs */ "./node_modules/@playcanvas/pcui/dist/module/node_modules/playcanvas/build/playcanvas.mjs/core/math/math.mjs");



class CurveEvaluator {
	constructor(curve, time = 0) {
		this._curve = void 0;
		this._left = -Infinity;
		this._right = Infinity;
		this._recip = 0;
		this._p0 = 0;
		this._p1 = 0;
		this._m0 = 0;
		this._m1 = 0;
		this._curve = curve;
		this._reset(time);
	}
	evaluate(time, forceReset = false) {
		if (forceReset || time < this._left || time >= this._right) {
			this._reset(time);
		}
		let result;
		const type = this._curve.type;
		if (type === _constants_mjs__WEBPACK_IMPORTED_MODULE_0__.CURVE_STEP) {
			result = this._p0;
		} else {
			const t = this._recip === 0 ? 0 : (time - this._left) * this._recip;
			if (type === _constants_mjs__WEBPACK_IMPORTED_MODULE_0__.CURVE_LINEAR) {
				result = _math_mjs__WEBPACK_IMPORTED_MODULE_1__.math.lerp(this._p0, this._p1, t);
			} else if (type === _constants_mjs__WEBPACK_IMPORTED_MODULE_0__.CURVE_SMOOTHSTEP) {
				result = _math_mjs__WEBPACK_IMPORTED_MODULE_1__.math.lerp(this._p0, this._p1, t * t * (3 - 2 * t));
			} else {
				result = this._evaluateHermite(this._p0, this._p1, this._m0, this._m1, t);
			}
		}
		return result;
	}
	_reset(time) {
		const keys = this._curve.keys;
		const len = keys.length;
		if (!len) {
			this._left = -Infinity;
			this._right = Infinity;
			this._recip = 0;
			this._p0 = this._p1 = this._m0 = this._m1 = 0;
		} else {
			if (time < keys[0][0]) {
				this._left = -Infinity;
				this._right = keys[0][0];
				this._recip = 0;
				this._p0 = this._p1 = keys[0][1];
				this._m0 = this._m1 = 0;
			} else if (time >= keys[len - 1][0]) {
				this._left = keys[len - 1][0];
				this._right = Infinity;
				this._recip = 0;
				this._p0 = this._p1 = keys[len - 1][1];
				this._m0 = this._m1 = 0;
			} else {
				let index = 0;
				while (time >= keys[index + 1][0]) {
					index++;
				}
				this._left = keys[index][0];
				this._right = keys[index + 1][0];
				const diff = 1.0 / (this._right - this._left);
				this._recip = isFinite(diff) ? diff : 0;
				this._p0 = keys[index][1];
				this._p1 = keys[index + 1][1];
				if (this._isHermite()) {
					this._calcTangents(keys, index);
				}
			}
		}
	}
	_isHermite() {
		return this._curve.type === _constants_mjs__WEBPACK_IMPORTED_MODULE_0__.CURVE_CATMULL || this._curve.type === _constants_mjs__WEBPACK_IMPORTED_MODULE_0__.CURVE_CARDINAL || this._curve.type === _constants_mjs__WEBPACK_IMPORTED_MODULE_0__.CURVE_SPLINE;
	}
	_calcTangents(keys, index) {
		let a;
		const b = keys[index];
		const c = keys[index + 1];
		let d;
		if (index === 0) {
			a = [keys[0][0] + (keys[0][0] - keys[1][0]), keys[0][1] + (keys[0][1] - keys[1][1])];
		} else {
			a = keys[index - 1];
		}
		if (index === keys.length - 2) {
			d = [keys[index + 1][0] + (keys[index + 1][0] - keys[index][0]), keys[index + 1][1] + (keys[index + 1][1] - keys[index][1])];
		} else {
			d = keys[index + 2];
		}
		if (this._curve.type === _constants_mjs__WEBPACK_IMPORTED_MODULE_0__.CURVE_SPLINE) {
			const s1_ = 2 * (c[0] - b[0]) / (c[0] - a[0]);
			const s2_ = 2 * (c[0] - b[0]) / (d[0] - b[0]);
			this._m0 = this._curve.tension * (isFinite(s1_) ? s1_ : 0) * (c[1] - a[1]);
			this._m1 = this._curve.tension * (isFinite(s2_) ? s2_ : 0) * (d[1] - b[1]);
		} else {
			const s1 = (c[0] - b[0]) / (b[0] - a[0]);
			const s2 = (c[0] - b[0]) / (d[0] - c[0]);
			const a_ = b[1] + (a[1] - b[1]) * (isFinite(s1) ? s1 : 0);
			const d_ = c[1] + (d[1] - c[1]) * (isFinite(s2) ? s2 : 0);
			const tension = this._curve.type === _constants_mjs__WEBPACK_IMPORTED_MODULE_0__.CURVE_CATMULL ? 0.5 : this._curve.tension;
			this._m0 = tension * (c[1] - a_);
			this._m1 = tension * (d_ - b[1]);
		}
	}
	_evaluateHermite(p0, p1, m0, m1, t) {
		const t2 = t * t;
		const twot = t + t;
		const omt = 1 - t;
		const omt2 = omt * omt;
		return p0 * ((1 + twot) * omt2) + m0 * (t * omt2) + p1 * (t2 * (3 - twot)) + m1 * (t2 * (t - 1));
	}
}




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/node_modules/playcanvas/build/playcanvas.mjs/core/math/curve-set.mjs":
/*!************************************************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/node_modules/playcanvas/build/playcanvas.mjs/core/math/curve-set.mjs ***!
  \************************************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CurveSet: () => (/* binding */ CurveSet)
/* harmony export */ });
/* harmony import */ var _constants_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants.mjs */ "./node_modules/@playcanvas/pcui/dist/module/node_modules/playcanvas/build/playcanvas.mjs/core/math/constants.mjs");
/* harmony import */ var _curve_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./curve.mjs */ "./node_modules/@playcanvas/pcui/dist/module/node_modules/playcanvas/build/playcanvas.mjs/core/math/curve.mjs");
/* harmony import */ var _curve_evaluator_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./curve-evaluator.mjs */ "./node_modules/@playcanvas/pcui/dist/module/node_modules/playcanvas/build/playcanvas.mjs/core/math/curve-evaluator.mjs");




class CurveSet {
	constructor() {
		this.curves = [];
		this._type = _constants_mjs__WEBPACK_IMPORTED_MODULE_0__.CURVE_SMOOTHSTEP;
		if (arguments.length > 1) {
			for (let i = 0; i < arguments.length; i++) {
				this.curves.push(new _curve_mjs__WEBPACK_IMPORTED_MODULE_1__.Curve(arguments[i]));
			}
		} else {
			if (arguments.length === 0) {
				this.curves.push(new _curve_mjs__WEBPACK_IMPORTED_MODULE_1__.Curve());
			} else {
				const arg = arguments[0];
				if (typeof arg === 'number') {
					for (let i = 0; i < arg; i++) {
						this.curves.push(new _curve_mjs__WEBPACK_IMPORTED_MODULE_1__.Curve());
					}
				} else {
					for (let i = 0; i < arg.length; i++) {
						this.curves.push(new _curve_mjs__WEBPACK_IMPORTED_MODULE_1__.Curve(arg[i]));
					}
				}
			}
		}
	}
	get length() {
		return this.curves.length;
	}
	set type(value) {
		this._type = value;
		for (let i = 0; i < this.curves.length; i++) {
			this.curves[i].type = value;
		}
	}
	get type() {
		return this._type;
	}
	get(index) {
		return this.curves[index];
	}
	value(time, result = []) {
		const length = this.curves.length;
		result.length = length;
		for (let i = 0; i < length; i++) {
			result[i] = this.curves[i].value(time);
		}
		return result;
	}
	clone() {
		const result = new this.constructor();
		result.curves = [];
		for (let i = 0; i < this.curves.length; i++) {
			result.curves.push(this.curves[i].clone());
		}
		result._type = this._type;
		return result;
	}
	quantize(precision) {
		precision = Math.max(precision, 2);
		const numCurves = this.curves.length;
		const values = new Float32Array(precision * numCurves);
		const step = 1.0 / (precision - 1);
		for (let c = 0; c < numCurves; c++) {
			const ev = new _curve_evaluator_mjs__WEBPACK_IMPORTED_MODULE_2__.CurveEvaluator(this.curves[c]);
			for (let i = 0; i < precision; i++) {
				values[i * numCurves + c] = ev.evaluate(step * i);
			}
		}
		return values;
	}
	quantizeClamped(precision, min, max) {
		const result = this.quantize(precision);
		for (let i = 0; i < result.length; ++i) {
			result[i] = Math.min(max, Math.max(min, result[i]));
		}
		return result;
	}
}




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/node_modules/playcanvas/build/playcanvas.mjs/core/math/curve.mjs":
/*!********************************************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/node_modules/playcanvas/build/playcanvas.mjs/core/math/curve.mjs ***!
  \********************************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Curve: () => (/* binding */ Curve)
/* harmony export */ });
/* harmony import */ var _core_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core.mjs */ "./node_modules/@playcanvas/pcui/dist/module/node_modules/playcanvas/build/playcanvas.mjs/core/core.mjs");
/* harmony import */ var _constants_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants.mjs */ "./node_modules/@playcanvas/pcui/dist/module/node_modules/playcanvas/build/playcanvas.mjs/core/math/constants.mjs");
/* harmony import */ var _curve_evaluator_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./curve-evaluator.mjs */ "./node_modules/@playcanvas/pcui/dist/module/node_modules/playcanvas/build/playcanvas.mjs/core/math/curve-evaluator.mjs");




class Curve {
	constructor(data) {
		this.keys = [];
		this.type = _constants_mjs__WEBPACK_IMPORTED_MODULE_1__.CURVE_SMOOTHSTEP;
		this.tension = 0.5;
		this._eval = new _curve_evaluator_mjs__WEBPACK_IMPORTED_MODULE_2__.CurveEvaluator(this);
		if (data) {
			for (let i = 0; i < data.length - 1; i += 2) {
				this.keys.push([data[i], data[i + 1]]);
			}
		}
		this.sort();
	}
	get length() {
		return this.keys.length;
	}
	add(time, value) {
		const keys = this.keys;
		const len = keys.length;
		let i = 0;
		for (; i < len; i++) {
			if (keys[i][0] > time) {
				break;
			}
		}
		const key = [time, value];
		this.keys.splice(i, 0, key);
		return key;
	}
	get(index) {
		return this.keys[index];
	}
	sort() {
		this.keys.sort(function (a, b) {
			return a[0] - b[0];
		});
	}
	value(time) {
		return this._eval.evaluate(time, true);
	}
	closest(time) {
		const keys = this.keys;
		const length = keys.length;
		let min = 2;
		let result = null;
		for (let i = 0; i < length; i++) {
			const diff = Math.abs(time - keys[i][0]);
			if (min >= diff) {
				min = diff;
				result = keys[i];
			} else {
				break;
			}
		}
		return result;
	}
	clone() {
		const result = new this.constructor();
		result.keys = (0,_core_mjs__WEBPACK_IMPORTED_MODULE_0__.extend)(result.keys, this.keys);
		result.type = this.type;
		result.tension = this.tension;
		return result;
	}
	quantize(precision) {
		precision = Math.max(precision, 2);
		const values = new Float32Array(precision);
		const step = 1.0 / (precision - 1);
		values[0] = this._eval.evaluate(0, true);
		for (let i = 1; i < precision; i++) {
			values[i] = this._eval.evaluate(step * i);
		}
		return values;
	}
	quantizeClamped(precision, min, max) {
		const result = this.quantize(precision);
		for (let i = 0; i < result.length; ++i) {
			result[i] = Math.min(max, Math.max(min, result[i]));
		}
		return result;
	}
}




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/node_modules/playcanvas/build/playcanvas.mjs/core/math/math.mjs":
/*!*******************************************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/node_modules/playcanvas/build/playcanvas.mjs/core/math/math.mjs ***!
  \*******************************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   math: () => (/* binding */ math)
/* harmony export */ });
const math = {
	DEG_TO_RAD: Math.PI / 180,
	RAD_TO_DEG: 180 / Math.PI,
	clamp(value, min, max) {
		if (value >= max) return max;
		if (value <= min) return min;
		return value;
	},
	intToBytes24(i) {
		const r = i >> 16 & 0xff;
		const g = i >> 8 & 0xff;
		const b = i & 0xff;
		return [r, g, b];
	},
	intToBytes32(i) {
		const r = i >> 24 & 0xff;
		const g = i >> 16 & 0xff;
		const b = i >> 8 & 0xff;
		const a = i & 0xff;
		return [r, g, b, a];
	},
	bytesToInt24(r, g, b) {
		if (r.length) {
			b = r[2];
			g = r[1];
			r = r[0];
		}
		return r << 16 | g << 8 | b;
	},
	bytesToInt32(r, g, b, a) {
		if (r.length) {
			a = r[3];
			b = r[2];
			g = r[1];
			r = r[0];
		}
		return (r << 24 | g << 16 | b << 8 | a) >>> 0;
	},
	lerp(a, b, alpha) {
		return a + (b - a) * math.clamp(alpha, 0, 1);
	},
	lerpAngle(a, b, alpha) {
		if (b - a > 180) {
			b -= 360;
		}
		if (b - a < -180) {
			b += 360;
		}
		return math.lerp(a, b, math.clamp(alpha, 0, 1));
	},
	powerOfTwo(x) {
		return x !== 0 && !(x & x - 1);
	},
	nextPowerOfTwo(val) {
		val--;
		val |= val >> 1;
		val |= val >> 2;
		val |= val >> 4;
		val |= val >> 8;
		val |= val >> 16;
		val++;
		return val;
	},
	nearestPowerOfTwo(val) {
		return Math.pow(2, Math.round(Math.log(val) / Math.log(2)));
	},
	random(min, max) {
		const diff = max - min;
		return Math.random() * diff + min;
	},
	smoothstep(min, max, x) {
		if (x <= min) return 0;
		if (x >= max) return 1;
		x = (x - min) / (max - min);
		return x * x * (3 - 2 * x);
	},
	smootherstep(min, max, x) {
		if (x <= min) return 0;
		if (x >= max) return 1;
		x = (x - min) / (max - min);
		return x * x * x * (x * (x * 6 - 15) + 10);
	},
	roundUp(numToRound, multiple) {
		if (multiple === 0) return numToRound;
		return Math.ceil(numToRound / multiple) * multiple;
	},
	between(num, a, b, inclusive) {
		const min = Math.min(a, b);
		const max = Math.max(a, b);
		return inclusive ? num >= min && num <= max : num > min && num < max;
	}
};




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/Math/color-value.mjs":
/*!****************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/Math/color-value.mjs ***!
  \****************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _hsv2rgb: () => (/* binding */ _hsv2rgb),
/* harmony export */   _rgb2hsv: () => (/* binding */ _rgb2hsv)
/* harmony export */ });
function _rgb2hsv(rgb) {
    const r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
    let h, s;
    const v = Math.max(r, g, b);
    const diff = v - Math.min(r, g, b);
    const diffc = (c) => (v - c) / 6 / diff + 1 / 2;
    if (diff === 0) {
        h = s = 0;
        return [h, s, v];
    }
    s = diff / v;
    const rr = diffc(r);
    const gg = diffc(g);
    const bb = diffc(b);
    if (r === v) {
        h = bb - gg;
    }
    else if (g === v) {
        h = (1 / 3) + rr - bb;
    }
    else if (b === v) {
        h = (2 / 3) + gg - rr;
    }
    if (h < 0) {
        h += 1;
    }
    else if (h > 1) {
        h -= 1;
    }
    return [h, s, v];
}
function _hsv2rgb(hsv) {
    const h = hsv[0];
    const s = hsv[1];
    const v = hsv[2];
    let r, g, b;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = v;
            b = p;
            break;
        case 2:
            r = p;
            g = v;
            b = t;
            break;
        case 3:
            r = p;
            g = q;
            b = v;
            break;
        case 4:
            r = t;
            g = p;
            b = v;
            break;
        case 5:
            r = v;
            g = p;
            b = q;
            break;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/binding/BindingBase/index.mjs":
/*!*************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/binding/BindingBase/index.mjs ***!
  \*************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BindingBase$1)
/* harmony export */ });
/* harmony import */ var _playcanvas_observer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @playcanvas/observer */ "./node_modules/@playcanvas/observer/dist/index.mjs");


/**
 * Base class for data binding between {@link IBindable} {@link Element}s and Observers.
 */
class BindingBase extends _playcanvas_observer__WEBPACK_IMPORTED_MODULE_0__.Events {
    /**
     * Creates a new binding.
     *
     * @param args - The arguments.
     */
    constructor(args) {
        super();
        this._observers = [];
        this._paths = [];
        this._applyingChange = false;
        this._linked = false;
        this._element = args.element;
        this._history = args.history;
        this._historyPrefix = args.historyPrefix;
        this._historyPostfix = args.historyPostfix;
        this._historyName = args.historyName;
        this._historyCombine = args.historyCombine || false;
    }
    // Returns the path at the specified index
    // or the path at the first index if it doesn't exist.
    _pathAt(paths, index) {
        return paths[index] || paths[0];
    }
    /**
     * Links the specified observers to the specified paths.
     *
     * @param observers - The observer(s).
     * @param paths - The path(s). The behavior of the binding depends on how many paths are passed.
     * If an equal amount of paths and observers are passed then the binding will map each path to each observer at each index.
     * If more observers than paths are passed then the path at index 0 will be used for all observers.
     * If one observer and multiple paths are passed then all of the paths will be used for the observer (e.g. for curves).
     */
    link(observers, paths) {
        if (this._observers) {
            this.unlink();
        }
        this._observers = Array.isArray(observers) ? observers : [observers];
        this._paths = Array.isArray(paths) ? paths : [paths];
        this._linked = true;
    }
    /**
     * Unlinks the observers and paths.
     */
    unlink() {
        this._observers = [];
        this._paths = [];
        this._linked = false;
    }
    /**
     * Clones the binding. To be implemented by derived classes.
     */
    clone() {
        throw new Error('BindingBase#clone: Not implemented');
    }
    /**
     * Sets a value to the linked observers at the linked paths.
     *
     * @param value - The value
     */
    setValue(value) {
    }
    /**
     * Sets an array of values to the linked observers at the linked paths.
     *
     * @param values - The values.
     */
    setValues(values) {
    }
    /**
     * Adds (inserts) a value to the linked observers at the linked paths.
     *
     * @param value - The value.
     */
    addValue(value) {
    }
    /**
     * Adds (inserts) multiple values to the linked observers at the linked paths.
     *
     * @param values - The values.
     */
    addValues(values) {
    }
    /**
     * Removes a value from the linked observers at the linked paths.
     *
     * @param value - The value.
     */
    removeValue(value) {
    }
    /**
     * Removes multiple values from the linked observers from the linked paths.
     *
     * @param values - The values.
     */
    removeValues(values) {
    }
    /**
     * The element
     */
    set element(value) {
        this._element = value;
    }
    get element() {
        return this._element;
    }
    /**
     * Whether the binding is currently applying a change either to the observers or the element.
     */
    set applyingChange(value) {
        if (this._applyingChange === value)
            return;
        this._applyingChange = value;
        this.emit('applyingChange', value);
    }
    get applyingChange() {
        return this._applyingChange;
    }
    /**
     * Whether the binding is linked to observers.
     */
    get linked() {
        return this._linked;
    }
    /**
     * If a history module is used whether to combine history actions when applying changes to observers.
     */
    set historyCombine(value) {
        this._historyCombine = value;
    }
    get historyCombine() {
        return this._historyCombine;
    }
    /**
     * The name of the history action when applying changes to observers.
     */
    set historyName(value) {
        this._historyName = value;
    }
    get historyName() {
        return this._historyName;
    }
    /**
     * A string to prefix the historyName with.
     */
    set historyPrefix(value) {
        this._historyPrefix = value;
    }
    get historyPrefix() {
        return this._historyPrefix;
    }
    /**
     * A string to postfix the historyName with.
     */
    set historyPostfix(value) {
        this._historyPostfix = value;
    }
    get historyPostfix() {
        return this._historyPostfix;
    }
    /**
     * Whether history is enabled for the binding. A valid history object must have been provided first.
     */
    set historyEnabled(value) {
        if (this._history) {
            // @ts-ignore
            this._history.enabled = value;
        }
    }
    get historyEnabled() {
        // @ts-ignore
        return this._history && this._history.enabled;
    }
    /**
     * The linked observers.
     */
    get observers() {
        return this._observers;
    }
    /**
     * The linked paths.
     */
    get paths() {
        return this._paths;
    }
}
var BindingBase$1 = BindingBase;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/binding/BindingElementToObservers/index.mjs":
/*!***************************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/binding/BindingElementToObservers/index.mjs ***!
  \***************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BindingElementToObservers$1)
/* harmony export */ });
/* harmony import */ var _BindingBase_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../BindingBase/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/binding/BindingBase/index.mjs");


/**
 * Provides one way binding between an {@link IBindable} element and Observers. Any changes from
 * the element will be propagated to the observers.
 */
class BindingElementToObservers extends _BindingBase_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"] {
    /**
     * Clone the binding and return a new instance.
     */
    clone() {
        return new BindingElementToObservers({
            history: this._history,
            historyPrefix: this._historyPrefix,
            historyPostfix: this._historyPostfix,
            historyName: this._historyName,
            historyCombine: this._historyCombine
        });
    }
    _getHistoryActionName(paths) {
        return `${this._historyPrefix || ''}${this._historyName || paths[0]}${this._historyPostfix || ''}`;
    }
    // Sets the value (or values of isArrayOfValues is true)
    // to the observers
    _setValue(value, isArrayOfValues) {
        if (this.applyingChange)
            return;
        if (!this._observers.length)
            return;
        this.applyingChange = true;
        // make copy of observers if we are using history
        // so that we can undo on the same observers in the future
        const observers = this._observers.slice();
        const paths = this._paths.slice();
        const context = {
            observers,
            paths
        };
        const execute = () => {
            this._setValueToObservers(observers, paths, value, isArrayOfValues);
            this.emit('history:redo', context);
        };
        if (this._history) {
            let previousValues = [];
            if (observers.length === 1 && paths.length > 1) {
                previousValues = paths.map((path) => {
                    return observers[0].has(path) ? observers[0].get(path) : undefined;
                });
            }
            else {
                previousValues = observers.map((observer, i) => {
                    const path = this._pathAt(paths, i);
                    return observer.has(path) ? observer.get(path) : undefined;
                });
            }
            this.emit('history:init', context);
            this._history.add({
                name: this._getHistoryActionName(paths),
                redo: execute,
                combine: this._historyCombine,
                undo: () => {
                    this._setValueToObservers(observers, paths, previousValues, true);
                    this.emit('history:undo', context);
                }
            });
        }
        execute();
        this.applyingChange = false;
    }
    _setValueToObservers(observers, paths, value, isArrayOfValues) {
        // special case for 1 observer with multiple paths (like curves)
        // in that case set each value for each path
        if (observers.length === 1 && paths.length > 1) {
            for (let i = 0; i < paths.length; i++) {
                const latest = observers[0].latest();
                if (!latest)
                    continue;
                let history = false;
                if (latest.history) {
                    history = latest.history.enabled;
                    latest.history.enabled = false;
                }
                const path = paths[i];
                const val = value[i];
                if (value !== undefined) {
                    this._observerSet(latest, path, val);
                }
                else {
                    latest.unset(path);
                }
                if (history) {
                    latest.history.enabled = true;
                }
            }
            return;
        }
        for (let i = 0; i < observers.length; i++) {
            const latest = observers[i].latest();
            if (!latest)
                continue;
            let history = false;
            if (latest.history) {
                history = latest.history.enabled;
                latest.history.enabled = false;
            }
            const path = this._pathAt(paths, i);
            const val = isArrayOfValues ? value[i] : value;
            if (value !== undefined) {
                this._observerSet(latest, path, val);
            }
            else {
                latest.unset(path);
            }
            if (history) {
                latest.history.enabled = true;
            }
        }
    }
    // Handles setting a value to an observer
    // in case that value is an array
    _observerSet(observer, path, value) {
        // check if the parent of the last field in the path
        // exists in the observer because if it doesn't
        // an error is most likely going to be raised by C3
        const lastIndexDot = path.lastIndexOf('.');
        if (lastIndexDot > 0 && !observer.has(path.substring(0, lastIndexDot))) {
            return;
        }
        const isArray = Array.isArray(value);
        // we need to slice an array value before passing it to the 'set'
        // method otherwise there are cases where the Observer will be modifying
        // the same array instance
        observer.set(path, isArray && value ? value.slice() : value);
    }
    _addValues(values) {
        if (this.applyingChange)
            return;
        if (!this._observers)
            return;
        this.applyingChange = true;
        // make copy of observers if we are using history
        // so that we can undo on the same observers in the future
        const observers = this._observers.slice();
        const paths = this._paths.slice();
        const records = [];
        for (let i = 0; i < observers.length; i++) {
            const path = this._pathAt(paths, i);
            const observer = observers[i];
            values.forEach((value) => {
                if (observer.get(path).indexOf(value) === -1) {
                    records.push({
                        observer: observer,
                        path: path,
                        value: value
                    });
                }
            });
        }
        const execute = () => {
            for (const record of records) {
                const latest = record.observer.latest();
                if (!latest)
                    continue;
                const path = record.path;
                let history = false;
                if (latest.history) {
                    history = latest.history.enabled;
                    latest.history.enabled = false;
                }
                latest.insert(path, record.value);
                if (history) {
                    latest.history.enabled = true;
                }
            }
        };
        if (this._history && records.length) {
            this._history.add({
                name: this._getHistoryActionName(paths),
                redo: execute,
                combine: this._historyCombine,
                undo: () => {
                    for (const record of records) {
                        const latest = record.observer.latest();
                        if (!latest)
                            continue;
                        const path = record.path;
                        let history = false;
                        if (latest.history) {
                            history = latest.history.enabled;
                            latest.history.enabled = false;
                        }
                        latest.removeValue(path, record.value);
                        if (history) {
                            latest.history.enabled = true;
                        }
                    }
                }
            });
        }
        execute();
        this.applyingChange = false;
    }
    _removeValues(values) {
        if (this.applyingChange)
            return;
        if (!this._observers)
            return;
        this.applyingChange = true;
        // make copy of observers if we are using history
        // so that we can undo on the same observers in the future
        const observers = this._observers.slice();
        const paths = this._paths.slice();
        const records = [];
        for (let i = 0; i < observers.length; i++) {
            const path = this._pathAt(paths, i);
            const observer = observers[i];
            values.forEach((value) => {
                const ind = observer.get(path).indexOf(value);
                if (ind !== -1) {
                    records.push({
                        observer: observer,
                        path: path,
                        value: value,
                        index: ind
                    });
                }
            });
        }
        const execute = () => {
            for (const record of records) {
                const latest = record.observer.latest();
                if (!latest)
                    continue;
                const path = record.path;
                let history = false;
                if (latest.history) {
                    history = latest.history.enabled;
                    latest.history.enabled = false;
                }
                latest.removeValue(path, record.value);
                if (history) {
                    latest.history.enabled = true;
                }
            }
        };
        if (this._history && records.length) {
            this._history.add({
                name: this._getHistoryActionName(paths),
                redo: execute,
                combine: this._historyCombine,
                undo: () => {
                    for (const record of records) {
                        const latest = record.observer.latest();
                        if (!latest)
                            continue;
                        const path = record.path;
                        let history = false;
                        if (latest.history) {
                            history = latest.history.enabled;
                            latest.history.enabled = false;
                        }
                        if (latest.get(path).indexOf(record.value) === -1) {
                            latest.insert(path, record.value, record.index);
                        }
                        if (history) {
                            latest.history.enabled = true;
                        }
                    }
                }
            });
        }
        execute();
        this.applyingChange = false;
    }
    setValue(value) {
        this._setValue(value, false);
    }
    setValues(values) {
        // make sure we deep copy arrays because they will not be cloned when set to the observers
        values = values.slice().map(val => (Array.isArray(val) ? val.slice() : val));
        this._setValue(values, true);
    }
    addValue(value) {
        this._addValues([value]);
    }
    addValues(values) {
        this._addValues(values);
    }
    removeValue(value) {
        this._removeValues([value]);
    }
    removeValues(values) {
        this._removeValues(values);
    }
}
var BindingElementToObservers$1 = BindingElementToObservers;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/binding/BindingObserversToElement/index.mjs":
/*!***************************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/binding/BindingObserversToElement/index.mjs ***!
  \***************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BindingObserversToElement$1)
/* harmony export */ });
/* harmony import */ var _BindingBase_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../BindingBase/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/binding/BindingBase/index.mjs");


/**
 * Provides one way binding between Observers and an {@link IBindable} element and Observers. Any
 * changes from the observers will be propagated to the element.
 */
class BindingObserversToElement extends _BindingBase_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"] {
    /**
     * Creates a new BindingObserversToElement instance.
     *
     * @param args - The arguments.
     */
    constructor(args = {}) {
        super(args);
        this._eventHandles = [];
        this._updateTimeout = null;
        this._deferUpdateElement = () => {
            if (this.applyingChange)
                return;
            this.applyingChange = true;
            this._updateTimeout = window.setTimeout(() => {
                this._updateElement();
            });
        };
        this._customUpdate = args.customUpdate;
    }
    _linkObserver(observer, path) {
        this._eventHandles.push(observer.on(path + ':set', this._deferUpdateElement));
        this._eventHandles.push(observer.on(path + ':unset', this._deferUpdateElement));
        this._eventHandles.push(observer.on(path + ':insert', this._deferUpdateElement));
        this._eventHandles.push(observer.on(path + ':remove', this._deferUpdateElement));
    }
    _updateElement() {
        if (this._updateTimeout) {
            window.clearTimeout(this._updateTimeout);
            this._updateTimeout = null;
        }
        this._updateTimeout = null;
        this.applyingChange = true;
        if (!this._element)
            return;
        if (typeof this._customUpdate === 'function') {
            this._customUpdate(this._element, this._observers, this._paths);
        }
        else if (this._observers.length === 1) {
            if (this._paths.length > 1) {
                // if using multiple paths for the single observer (e.g. curves)
                // then return an array of values for each path
                this._element.value = this._paths.map((path) => {
                    return this._observers[0].has(path) ? this._observers[0].get(path) : undefined;
                });
            }
            else {
                this._element.value = (this._observers[0].has(this._paths[0]) ? this._observers[0].get(this._paths[0]) : undefined);
            }
        }
        else {
            this._element.values = this._observers.map((observer, i) => {
                const path = this._pathAt(this._paths, i);
                return observer.has(path) ? observer.get(path) : undefined;
            });
        }
        this.applyingChange = false;
    }
    link(observers, paths) {
        super.link(observers, paths);
        // don't render changes when we link
        if (this._element) {
            const renderChanges = this._element.renderChanges;
            this._element.renderChanges = false;
            this._updateElement();
            this._element.renderChanges = renderChanges;
        }
        if (this._observers.length === 1) {
            if (this._paths.length > 1) {
                for (let i = 0; i < this._paths.length; i++) {
                    this._linkObserver(this._observers[0], this._paths[i]);
                }
                return;
            }
        }
        for (let i = 0; i < this._observers.length; i++) {
            this._linkObserver(this._observers[i], this._pathAt(this._paths, i));
        }
    }
    /**
     * Unlink the binding from its set of observers.
     */
    unlink() {
        for (const event of this._eventHandles) {
            event.unbind();
        }
        this._eventHandles.length = 0;
        if (this._updateTimeout) {
            window.clearTimeout(this._updateTimeout);
            this._updateTimeout = null;
        }
        super.unlink();
    }
    /**
     * Clone the BindingObserversToElement instance.
     */
    clone() {
        return new BindingObserversToElement({
            customUpdate: this._customUpdate
        });
    }
}
var BindingObserversToElement$1 = BindingObserversToElement;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/binding/BindingTwoWay/index.mjs":
/*!***************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/binding/BindingTwoWay/index.mjs ***!
  \***************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BindingTwoWay$1)
/* harmony export */ });
/* harmony import */ var _BindingBase_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../BindingBase/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/binding/BindingBase/index.mjs");
/* harmony import */ var _BindingElementToObservers_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../BindingElementToObservers/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/binding/BindingElementToObservers/index.mjs");
/* harmony import */ var _BindingObserversToElement_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../BindingObserversToElement/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/binding/BindingObserversToElement/index.mjs");




/**
 * Provides two way data binding between Observers and {@link IBindable} elements. This means that
 * when the value of the Observers changes the IBindable will be updated and vice versa.
 */
class BindingTwoWay extends _BindingBase_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"] {
    /**
     * Creates a new BindingTwoWay instance.
     *
     * @param args - The arguments.
     */
    constructor(args = {}) {
        super(args);
        this._bindingElementToObservers = args.bindingElementToObservers || new _BindingElementToObservers_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"](args);
        this._bindingObserversToElement = args.bindingObserversToElement || new _BindingObserversToElement_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"](args);
        this._bindingElementToObservers.on('applyingChange', (value) => {
            this.applyingChange = value;
        });
        this._bindingElementToObservers.on('history:init', (context) => {
            this.emit('history:init', context);
        });
        this._bindingElementToObservers.on('history:undo', (context) => {
            this.emit('history:undo', context);
        });
        this._bindingElementToObservers.on('history:redo', (context) => {
            this.emit('history:redo', context);
        });
        this._bindingObserversToElement.on('applyingChange', (value) => {
            this.applyingChange = value;
        });
    }
    link(observers, paths) {
        super.link(observers, paths);
        this._bindingElementToObservers.link(observers, paths);
        this._bindingObserversToElement.link(observers, paths);
    }
    unlink() {
        this._bindingElementToObservers.unlink();
        this._bindingObserversToElement.unlink();
        super.unlink();
    }
    clone() {
        return new BindingTwoWay({
            bindingElementToObservers: this._bindingElementToObservers.clone(),
            bindingObserversToElement: this._bindingObserversToElement.clone()
        });
    }
    setValue(value) {
        this._bindingElementToObservers.setValue(value);
    }
    setValues(values) {
        this._bindingElementToObservers.setValues(values);
    }
    addValue(value) {
        this._bindingElementToObservers.addValue(value);
    }
    addValues(values) {
        this._bindingElementToObservers.addValues(values);
    }
    removeValue(value) {
        this._bindingElementToObservers.removeValue(value);
    }
    removeValues(values) {
        this._bindingElementToObservers.removeValues(values);
    }
    set element(value) {
        this._element = value;
        this._bindingElementToObservers.element = value;
        this._bindingObserversToElement.element = value;
    }
    get element() {
        return this._element;
    }
    set applyingChange(value) {
        if (super.applyingChange === value)
            return;
        this._bindingElementToObservers.applyingChange = value;
        this._bindingObserversToElement.applyingChange = value;
        super.applyingChange = value;
    }
    get applyingChange() {
        return super.applyingChange;
    }
    set historyCombine(value) {
        this._bindingElementToObservers.historyCombine = value;
    }
    get historyCombine() {
        return this._bindingElementToObservers.historyCombine;
    }
    set historyPrefix(value) {
        this._bindingElementToObservers.historyPrefix = value;
    }
    get historyPrefix() {
        return this._bindingElementToObservers.historyPrefix;
    }
    set historyPostfix(value) {
        this._bindingElementToObservers.historyPostfix = value;
    }
    get historyPostfix() {
        return this._bindingElementToObservers.historyPostfix;
    }
    set historyEnabled(value) {
        this._bindingElementToObservers.historyEnabled = value;
    }
    get historyEnabled() {
        return this._bindingElementToObservers.historyEnabled;
    }
}
var BindingTwoWay$1 = BindingTwoWay;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/class.mjs":
/*!*****************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/class.mjs ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   COLLAPSED: () => (/* binding */ COLLAPSED),
/* harmony export */   COLLAPSIBLE: () => (/* binding */ COLLAPSIBLE),
/* harmony export */   DEFAULT_MOUSEDOWN: () => (/* binding */ DEFAULT_MOUSEDOWN),
/* harmony export */   DISABLED: () => (/* binding */ DISABLED),
/* harmony export */   ERROR: () => (/* binding */ ERROR),
/* harmony export */   FLASH: () => (/* binding */ FLASH),
/* harmony export */   FLEX: () => (/* binding */ FLEX),
/* harmony export */   FOCUS: () => (/* binding */ FOCUS),
/* harmony export */   FONT_BOLD: () => (/* binding */ FONT_BOLD),
/* harmony export */   FONT_REGULAR: () => (/* binding */ FONT_REGULAR),
/* harmony export */   GRID: () => (/* binding */ GRID),
/* harmony export */   HIDDEN: () => (/* binding */ HIDDEN),
/* harmony export */   MULTIPLE_VALUES: () => (/* binding */ MULTIPLE_VALUES),
/* harmony export */   NOT_FLEXIBLE: () => (/* binding */ NOT_FLEXIBLE),
/* harmony export */   READONLY: () => (/* binding */ READONLY),
/* harmony export */   RESIZABLE: () => (/* binding */ RESIZABLE),
/* harmony export */   SCROLLABLE: () => (/* binding */ SCROLLABLE)
/* harmony export */ });
const FLEX = 'pcui-flex';
const GRID = 'pcui-grid';
const HIDDEN = 'pcui-hidden';
const SCROLLABLE = 'pcui-scrollable';
const RESIZABLE = 'pcui-resizable';
const READONLY = 'pcui-readonly';
const DISABLED = 'pcui-disabled';
const COLLAPSIBLE = 'pcui-collapsible';
const COLLAPSED = 'pcui-collapsed';
const FOCUS = 'pcui-focus';
const MULTIPLE_VALUES = 'pcui-multiple-values';
const ERROR = 'pcui-error';
const FLASH = 'flash';
const NOT_FLEXIBLE = 'pcui-not-flexible';
const DEFAULT_MOUSEDOWN = 'pcui-default-mousedown';
const FONT_REGULAR = 'font-regular';
const FONT_BOLD = 'font-bold';




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/ArrayInput/index.mjs":
/*!***************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/ArrayInput/index.mjs ***!
  \***************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ArrayInput$1)
/* harmony export */ });
/* harmony import */ var _helpers_utils_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../helpers/utils.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/helpers/utils.mjs");
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");
/* harmony import */ var _Container_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Container/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Container/index.mjs");
/* harmony import */ var _Panel_index_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Panel/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Panel/index.mjs");
/* harmony import */ var _NumericInput_index_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../NumericInput/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/NumericInput/index.mjs");
/* harmony import */ var _Button_index_mjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../Button/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Button/index.mjs");







const CLASS_ARRAY_INPUT = 'pcui-array-input';
const CLASS_ARRAY_EMPTY = 'pcui-array-empty';
const CLASS_ARRAY_SIZE = CLASS_ARRAY_INPUT + '-size';
const CLASS_ARRAY_CONTAINER = CLASS_ARRAY_INPUT + '-items';
const CLASS_ARRAY_ELEMENT = CLASS_ARRAY_INPUT + '-item';
const CLASS_ARRAY_DELETE = CLASS_ARRAY_ELEMENT + '-delete';
/**
 * Element that allows editing an array of values.
 */
class ArrayInput extends _Element_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"] {
    constructor(args = {}) {
        var _a, _b, _c;
        const container = new _Container_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]({
            dom: args.dom,
            flex: true
        });
        const elementArgs = Object.assign(Object.assign({}, args), { dom: container.dom });
        // remove binding because we want to set it later
        delete elementArgs.binding;
        super(elementArgs);
        this._suspendSizeChangeEvt = false;
        this._suspendArrayElementEvts = false;
        this._arrayElementChangeTimeout = null;
        this._container = container;
        this._container.parent = this;
        this.class.add(CLASS_ARRAY_INPUT, CLASS_ARRAY_EMPTY);
        this._usePanels = (_a = args.usePanels) !== null && _a !== void 0 ? _a : false;
        this._fixedSize = !!args.fixedSize;
        this._inputSize = new _NumericInput_index_mjs__WEBPACK_IMPORTED_MODULE_4__["default"]({
            class: [CLASS_ARRAY_SIZE],
            placeholder: 'Array Size',
            value: 0,
            hideSlider: true,
            step: 1,
            precision: 0,
            min: 0,
            readOnly: this._fixedSize
        });
        this._inputSize.on('change', (value) => {
            this._onSizeChange(value);
        });
        this._inputSize.on('focus', () => {
            this.emit('focus');
        });
        this._inputSize.on('blur', () => {
            this.emit('blur');
        });
        this._container.append(this._inputSize);
        this._containerArray = new _Container_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]({
            class: CLASS_ARRAY_CONTAINER,
            hidden: true
        });
        this._containerArray.on('append', () => {
            this._containerArray.hidden = false;
        });
        this._containerArray.on('remove', () => {
            this._containerArray.hidden = this._arrayElements.length === 0;
        });
        this._container.append(this._containerArray);
        this._getDefaultFn = (_b = args.getDefaultFn) !== null && _b !== void 0 ? _b : null;
        // @ts-ignore
        let valueType = args.elementArgs && args.elementArgs.type || args.type;
        if (!ArrayInput.DEFAULTS.hasOwnProperty(valueType)) {
            valueType = 'string';
        }
        this._valueType = valueType;
        this._elementType = (_c = args.type) !== null && _c !== void 0 ? _c : 'string';
        if (args.elementArgs) {
            this._elementArgs = args.elementArgs;
        }
        else {
            delete elementArgs.dom;
            this._elementArgs = elementArgs;
        }
        this._arrayElements = [];
        // set binding now
        this.binding = args.binding;
        this._values = [];
        if (args.value) {
            this.value = args.value;
        }
        this.renderChanges = args.renderChanges || false;
    }
    destroy() {
        if (this._destroyed)
            return;
        this._arrayElements.length = 0;
        super.destroy();
    }
    _onSizeChange(size) {
        // if size is explicitly 0 then add empty class
        // size can also be null with multi-select so do not
        // check just !size
        if (size === 0) {
            this.class.add(CLASS_ARRAY_EMPTY);
        }
        else {
            this.class.remove(CLASS_ARRAY_EMPTY);
        }
        if (size === null)
            return;
        if (this._suspendSizeChangeEvt)
            return;
        // initialize default value for each new array element
        let defaultValue;
        const initDefaultValue = () => {
            if (this._getDefaultFn) {
                defaultValue = this._getDefaultFn();
            }
            else {
                defaultValue = ArrayInput.DEFAULTS[this._valueType];
                if (this._valueType === 'curveset') {
                    defaultValue = (0,_helpers_utils_mjs__WEBPACK_IMPORTED_MODULE_0__.deepCopy)(defaultValue);
                    if (Array.isArray(this._elementArgs.curves)) {
                        for (let i = 0; i < this._elementArgs.curves.length; i++) {
                            defaultValue.keys.push([0, 0]);
                        }
                    }
                }
                else if (this._valueType === 'gradient') {
                    defaultValue = (0,_helpers_utils_mjs__WEBPACK_IMPORTED_MODULE_0__.deepCopy)(defaultValue);
                    if (this._elementArgs.channels) {
                        for (let i = 0; i < this._elementArgs.channels; i++) {
                            defaultValue.keys.push([0, 1]);
                        }
                    }
                }
            }
        };
        // resize array
        const values = this._values.map((array) => {
            if (!array) {
                array = new Array(size);
                for (let i = 0; i < size; i++) {
                    if (defaultValue === undefined)
                        initDefaultValue();
                    array[i] = (0,_helpers_utils_mjs__WEBPACK_IMPORTED_MODULE_0__.deepCopy)(defaultValue);
                }
            }
            else if (array.length < size) {
                const newArray = new Array(size - array.length);
                for (let i = 0; i < newArray.length; i++) {
                    if (defaultValue === undefined)
                        initDefaultValue();
                    newArray[i] = (0,_helpers_utils_mjs__WEBPACK_IMPORTED_MODULE_0__.deepCopy)(defaultValue);
                }
                array = array.concat(newArray);
            }
            else {
                const newArray = new Array(size);
                for (let i = 0; i < size; i++) {
                    newArray[i] = (0,_helpers_utils_mjs__WEBPACK_IMPORTED_MODULE_0__.deepCopy)(array[i]);
                }
                array = newArray;
            }
            return array;
        });
        if (!values.length) {
            const array = new Array(size);
            for (let i = 0; i < size; i++) {
                if (defaultValue === undefined)
                    initDefaultValue();
                array[i] = (0,_helpers_utils_mjs__WEBPACK_IMPORTED_MODULE_0__.deepCopy)(defaultValue);
            }
            values.push(array);
        }
        this._updateValues(values, true);
    }
    _createArrayElement() {
        const args = Object.assign({}, this._elementArgs);
        if (args.binding) {
            args.binding = args.binding.clone();
        }
        else if (this._binding) {
            args.binding = this._binding.clone();
        }
        // set renderChanges after value is set
        // to prevent flashing on initial value set
        args.renderChanges = false;
        let container;
        if (this._usePanels) {
            container = new _Panel_index_mjs__WEBPACK_IMPORTED_MODULE_3__["default"]({
                headerText: `[${this._arrayElements.length}]`,
                removable: !this._fixedSize,
                collapsible: true,
                class: [CLASS_ARRAY_ELEMENT, CLASS_ARRAY_ELEMENT + '-' + this._elementType]
            });
        }
        else {
            container = new _Container_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]({
                flex: true,
                flexDirection: 'row',
                alignItems: 'center',
                class: [CLASS_ARRAY_ELEMENT, CLASS_ARRAY_ELEMENT + '-' + this._elementType]
            });
        }
        if (this._elementType === 'json' && args.attributes) {
            args.attributes = args.attributes.map((attr) => {
                if (!attr.path)
                    return attr;
                // fix paths to include array element index
                attr = Object.assign({}, attr);
                const parts = attr.path.split('.');
                parts.splice(parts.length - 1, 0, this._arrayElements.length);
                attr.path = parts.join('.');
                return attr;
            });
        }
        const element = _Element_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"].create(this._elementType, args);
        container.append(element);
        element.renderChanges = this.renderChanges;
        const entry = {
            container: container,
            element: element
        };
        this._arrayElements.push(entry);
        if (!this._usePanels) {
            if (!this._fixedSize) {
                const btnDelete = new _Button_index_mjs__WEBPACK_IMPORTED_MODULE_5__["default"]({
                    icon: 'E289',
                    size: 'small',
                    class: CLASS_ARRAY_DELETE,
                    tabIndex: -1 // skip buttons on tab
                });
                btnDelete.on('click', () => {
                    this._removeArrayElement(entry);
                });
                container.append(btnDelete);
            }
        }
        else {
            container.on('click:remove', () => {
                this._removeArrayElement(entry);
            });
        }
        element.on('change', (value) => {
            this._onArrayElementChange(entry, value);
        });
        this._containerArray.append(container);
        return entry;
    }
    _removeArrayElement(entry) {
        const index = this._arrayElements.indexOf(entry);
        if (index === -1)
            return;
        // remove row from every array in values
        const values = this._values.map((array) => {
            if (!array)
                return null;
            array.splice(index, 1);
            return array;
        });
        this._updateValues(values, true);
    }
    _onArrayElementChange(entry, value) {
        if (this._suspendArrayElementEvts)
            return;
        const index = this._arrayElements.indexOf(entry);
        if (index === -1)
            return;
        // Set the value to the same row of every array in values.
        this._values.forEach((array) => {
            if (array && array.length > index) {
                if (this._valueType === 'curveset') {
                    // curveset is passing the value in an array
                    array[index] = Array.isArray(value) ? value[0] : value;
                }
                else {
                    array[index] = value;
                }
            }
        });
        // use a timeout here because when our values change they will
        // first emit change events on each array element. However since the
        // whole array changed we are going to fire a 'change' event later from
        // our '_updateValues' function. We only want to emit a 'change' event
        // here when only the array element changed value and not the whole array so
        // wait a bit and fire the change event later otherwise the _updateValues function
        // will cancel this timeout and fire a change event for the whole array instead
        this._arrayElementChangeTimeout = window.setTimeout(() => {
            this._arrayElementChangeTimeout = null;
            this.emit('change', this.value);
        });
    }
    _linkArrayElement(element, index) {
        const observers = this._binding.observers;
        const paths = this._binding.paths;
        const useSinglePath = paths.length === 1 || observers.length !== paths.length;
        element.unlink();
        element.value = null;
        this.emit('unlinkElement', element, index);
        const path = (useSinglePath ? paths[0] + `.${index}` : paths.map((path) => `${path}.${index}`));
        element.link(observers, path);
        this.emit('linkElement', element, index, path);
    }
    _updateValues(values, applyToBinding) {
        this._values = values || [];
        this._suspendArrayElementEvts = true;
        this._suspendSizeChangeEvt = true;
        // apply values to the binding
        if (applyToBinding && this._binding) {
            this._binding.setValues(values);
        }
        // each row of this array holds
        // all the values for that row
        const valuesPerRow = [];
        // holds the length of each array
        const arrayLengths = [];
        values.forEach((array) => {
            if (!array)
                return;
            arrayLengths.push(array.length);
            array.forEach((item, i) => {
                if (!valuesPerRow[i]) {
                    valuesPerRow[i] = [];
                }
                valuesPerRow[i].push(item);
            });
        });
        let lastElementIndex = -1;
        for (let i = 0; i < valuesPerRow.length; i++) {
            // if the number of values on this row does not match
            // the number of arrays then stop adding rows
            if (valuesPerRow[i].length !== values.length) {
                break;
            }
            // create row if it doesn't exist
            if (!this._arrayElements[i]) {
                this._createArrayElement();
            }
            // bind to observers for that row or just display the values
            if (this._binding && this._binding.observers) {
                this._linkArrayElement(this._arrayElements[i].element, i);
            }
            else {
                if (valuesPerRow[i].length > 1) {
                    this._arrayElements[i].element.values = valuesPerRow[i];
                }
                else {
                    this._arrayElements[i].element.value = valuesPerRow[i][0];
                }
            }
            lastElementIndex = i;
        }
        // destroy elements that are no longer in our values
        for (let i = this._arrayElements.length - 1; i > lastElementIndex; i--) {
            this._arrayElements[i].container.destroy();
            this._arrayElements.splice(i, 1);
        }
        this._inputSize.values = arrayLengths;
        this._suspendSizeChangeEvt = false;
        this._suspendArrayElementEvts = false;
        if (this._arrayElementChangeTimeout) {
            window.clearTimeout(this._arrayElementChangeTimeout);
            this._arrayElementChangeTimeout = null;
        }
        this.emit('change', this.value);
    }
    focus() {
        this._inputSize.focus();
    }
    blur() {
        this._inputSize.blur();
    }
    unlink() {
        super.unlink();
        this._arrayElements.forEach((entry) => {
            entry.element.unlink();
        });
    }
    link(observers, paths) {
        super.link(observers, paths);
        this._arrayElements.forEach((entry, index) => {
            this._linkArrayElement(entry.element, index);
        });
    }
    /**
     * Executes the specified function for each array element.
     *
     * @param fn - The function with signature (element, index) => bool to execute. If the function
     * returns `false` then the iteration will early out.
     */
    forEachArrayElement(fn) {
        this._containerArray.forEachChild((element, i) => {
            return fn(element.dom.firstChild.ui, i);
        });
    }
    // override binding setter to create
    // the same type of binding on each array element too
    set binding(value) {
        super.binding = value;
        this._arrayElements.forEach((entry) => {
            entry.element.binding = value ? value.clone() : null;
        });
    }
    get binding() {
        return super.binding;
    }
    set value(value) {
        if (!Array.isArray(value)) {
            value = [];
        }
        const current = this.value || [];
        if ((0,_helpers_utils_mjs__WEBPACK_IMPORTED_MODULE_0__.arrayEquals)(current, value))
            return;
        // update values and binding
        this._updateValues(new Array(this._values.length || 1).fill(value), true);
    }
    get value() {
        // construct value from values of array elements
        return this._arrayElements.map((entry) => entry.element.value);
    }
    /* eslint accessor-pairs: 0 */
    set values(values) {
        if ((0,_helpers_utils_mjs__WEBPACK_IMPORTED_MODULE_0__.arrayEquals)(this._values, values))
            return;
        // update values but do not update binding
        this._updateValues(values, false);
    }
    set renderChanges(value) {
        this._renderChanges = value;
        this._arrayElements.forEach((entry) => {
            entry.element.renderChanges = value;
        });
    }
    get renderChanges() {
        return this._renderChanges;
    }
}
ArrayInput.DEFAULTS = {
    boolean: false,
    number: 0,
    string: '',
    vec2: [0, 0],
    vec3: [0, 0, 0],
    vec4: [0, 0, 0, 0]
};
for (const type in ArrayInput.DEFAULTS) {
    _Element_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"].register(`array:${type}`, ArrayInput, { type: type, renderChanges: true });
}
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"].register('array:select', ArrayInput, { type: 'select', renderChanges: true });
var ArrayInput$1 = ArrayInput;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/BooleanInput/index.mjs":
/*!*****************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/BooleanInput/index.mjs ***!
  \*****************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BooleanInput$1)
/* harmony export */ });
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");
/* harmony import */ var _class_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../class.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/class.mjs");



const CLASS_BOOLEAN_INPUT = 'pcui-boolean-input';
const CLASS_BOOLEAN_INPUT_TICKED = CLASS_BOOLEAN_INPUT + '-ticked';
const CLASS_BOOLEAN_INPUT_TOGGLE = CLASS_BOOLEAN_INPUT + '-toggle';
/**
 * A checkbox element.
 */
class BooleanInput extends _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(args = {}) {
        var _a;
        super(Object.assign({ tabIndex: 0 }, args));
        this._onKeyDown = (evt) => {
            if (evt.key === 'Escape') {
                this.blur();
                return;
            }
            if (!this.enabled || this.readOnly)
                return;
            if (evt.key === ' ') {
                evt.stopPropagation();
                evt.preventDefault();
                this.value = !this.value;
            }
        };
        this._onFocus = () => {
            this.emit('focus');
        };
        this._onBlur = () => {
            this.emit('blur');
        };
        if (args.type === 'toggle') {
            this.class.add(CLASS_BOOLEAN_INPUT_TOGGLE);
        }
        else {
            this.class.add(CLASS_BOOLEAN_INPUT);
        }
        this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.NOT_FLEXIBLE);
        this.dom.addEventListener('keydown', this._onKeyDown);
        this.dom.addEventListener('focus', this._onFocus);
        this.dom.addEventListener('blur', this._onBlur);
        this._value = null;
        if (args.value !== undefined) {
            this.value = args.value;
        }
        this.renderChanges = (_a = args.renderChanges) !== null && _a !== void 0 ? _a : false;
    }
    destroy() {
        if (this._destroyed)
            return;
        this.dom.removeEventListener('keydown', this._onKeyDown);
        this.dom.removeEventListener('focus', this._onFocus);
        this.dom.removeEventListener('blur', this._onBlur);
        super.destroy();
    }
    _onClick(evt) {
        if (this.enabled) {
            this.focus();
        }
        if (this.enabled && !this.readOnly) {
            this.value = !this.value;
        }
        return super._onClick(evt);
    }
    _updateValue(value) {
        this.class.remove(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.MULTIPLE_VALUES);
        if (value === this.value)
            return false;
        this._value = value;
        if (value) {
            this.class.add(CLASS_BOOLEAN_INPUT_TICKED);
        }
        else {
            this.class.remove(CLASS_BOOLEAN_INPUT_TICKED);
        }
        if (this.renderChanges) {
            this.flash();
        }
        this.emit('change', value);
        return true;
    }
    focus() {
        this.dom.focus();
    }
    blur() {
        this.dom.blur();
    }
    set value(value) {
        const changed = this._updateValue(value);
        if (changed && this._binding) {
            this._binding.setValue(value);
        }
    }
    get value() {
        return this._value;
    }
    /* eslint accessor-pairs: 0 */
    set values(values) {
        const different = values.some(v => v !== values[0]);
        if (different) {
            this._updateValue(null);
            this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.MULTIPLE_VALUES);
        }
        else {
            this._updateValue(values[0]);
        }
    }
    set renderChanges(value) {
        this._renderChanges = value;
    }
    get renderChanges() {
        return this._renderChanges;
    }
}
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"].register('boolean', BooleanInput, { renderChanges: true });
var BooleanInput$1 = BooleanInput;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/Button/index.mjs":
/*!***********************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/Button/index.mjs ***!
  \***********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Button$1)
/* harmony export */ });
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");


const CLASS_BUTTON = 'pcui-button';
/**
 * User input with click interaction.
 */
class Button extends _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(args = {}) {
        super(Object.assign({ dom: 'button' }, args));
        this._onKeyDown = (evt) => {
            if (evt.key === 'Escape') {
                this.blur();
            }
            else if (evt.key === 'Enter') {
                this._onClick(evt);
            }
        };
        this.class.add(CLASS_BUTTON);
        this._unsafe = args.unsafe;
        this.text = args.text;
        this.size = args.size;
        this.icon = args.icon;
        this.dom.addEventListener('keydown', this._onKeyDown);
    }
    destroy() {
        if (this._destroyed)
            return;
        this.dom.removeEventListener('keydown', this._onKeyDown);
        super.destroy();
    }
    _onClick(evt) {
        this.blur();
        if (this.readOnly)
            return;
        super._onClick(evt);
    }
    focus() {
        this.dom.focus();
    }
    blur() {
        this.dom.blur();
    }
    /**
     * Gets / sets the text of the button.
     */
    set text(value) {
        if (this._text === value)
            return;
        this._text = value;
        if (this._unsafe) {
            this.dom.innerHTML = value;
        }
        else {
            this.dom.textContent = value;
        }
    }
    get text() {
        return this._text;
    }
    /**
     * The CSS code for an icon for the button. e.g. 'E401' (notice we omit the '\\' character).
     */
    set icon(value) {
        if (this._icon === value || !value.match(/^E[0-9]{0,4}$/))
            return;
        this._icon = value;
        if (value) {
            // set data-icon attribute but first convert the value to a code point
            this.dom.setAttribute('data-icon', String.fromCodePoint(parseInt(value, 16)));
        }
        else {
            this.dom.removeAttribute('data-icon');
        }
    }
    get icon() {
        return this._icon;
    }
    /**
     * Gets / sets the 'size' type of the button. Can be null or 'small'.
     */
    set size(value) {
        if (this._size === value)
            return;
        if (this._size) {
            this.class.remove('pcui-' + this._size);
            this._size = null;
        }
        this._size = value;
        if (this._size) {
            this.class.add('pcui-' + this._size);
        }
    }
    get size() {
        return this._size;
    }
}
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"].register('button', Button);
var Button$1 = Button;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/Canvas/index.mjs":
/*!***********************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/Canvas/index.mjs ***!
  \***********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Canvas$1)
/* harmony export */ });
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");


const CLASS_ROOT = 'pcui-canvas';
/**
 * Represents a Canvas.
 */
class Canvas extends _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(args = {}) {
        super(Object.assign({ dom: 'canvas' }, args));
        this._width = 300;
        this._height = 150;
        this._ratio = 1;
        this.class.add(CLASS_ROOT);
        const { useDevicePixelRatio = false } = args;
        this._ratio = useDevicePixelRatio ? window.devicePixelRatio : 1;
        // Disable I-bar cursor on click+drag
        this.dom.onselectstart = (evt) => {
            return false;
        };
    }
    /**
     * Resize the canvas using the given width and height parameters.
     *
     * @param width - The new width of the canvas.
     * @param height - The new height of the canvas.
     */
    resize(width, height) {
        if (this._width === width && this._height === height)
            return;
        this._width = width;
        this._height = height;
        const canvas = this._dom;
        canvas.width = this.pixelWidth;
        canvas.height = this.pixelHeight;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        this.emit('resize', width, height);
    }
    /**
     * Gets / sets the width of the canvas.
     */
    set width(value) {
        if (this._width === value)
            return;
        this._width = value;
        const canvas = this._dom;
        canvas.width = this.pixelWidth;
        canvas.style.width = value + 'px';
        this.emit('resize', this._width, this._height);
    }
    get width() {
        return this._width;
    }
    /**
     * Gets / sets the height of the canvas.
     */
    set height(value) {
        if (this._height === value)
            return;
        this._height = value;
        const canvas = this._dom;
        canvas.height = this.pixelHeight;
        canvas.style.height = value + 'px';
        this.emit('resize', this._width, this._height);
    }
    get height() {
        return this._height;
    }
    /**
     * Gets the pixel height of the canvas.
     */
    get pixelWidth() {
        return Math.floor(this._width * this._ratio);
    }
    /**
     * Gets the pixel height of the canvas.
     */
    get pixelHeight() {
        return Math.floor(this._height * this._ratio);
    }
    /**
     * Gets the pixel ratio of the canvas.
     */
    get pixelRatio() {
        return this._ratio;
    }
}
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"].register('canvas', Canvas);
var Canvas$1 = Canvas;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/Code/index.mjs":
/*!*********************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/Code/index.mjs ***!
  \*********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Code$1)
/* harmony export */ });
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");
/* harmony import */ var _Container_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Container/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Container/index.mjs");
/* harmony import */ var _Label_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Label/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Label/index.mjs");




const CLASS_ROOT = 'pcui-code';
const CLASS_INNER = CLASS_ROOT + '-inner';
/**
 * Represents a code block.
 */
class Code extends _Container_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"] {
    constructor(args = {}) {
        super(args);
        this.class.add(CLASS_ROOT);
        this._inner = new _Label_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]({
            class: CLASS_INNER
        });
        this.append(this._inner);
        if (args.text) {
            this.text = args.text;
        }
    }
    /**
     * Gets / sets the text to display in the code block.
     */
    set text(value) {
        this._text = value;
        this._inner.text = value;
    }
    get text() {
        return this._text;
    }
}
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"].register('code', Code);
var Code$1 = Code;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/ColorPicker/index.mjs":
/*!****************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/ColorPicker/index.mjs ***!
  \****************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ColorPicker$1)
/* harmony export */ });
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");
/* harmony import */ var _Overlay_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Overlay/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Overlay/index.mjs");
/* harmony import */ var _NumericInput_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../NumericInput/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/NumericInput/index.mjs");
/* harmony import */ var _TextInput_index_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../TextInput/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/TextInput/index.mjs");
/* harmony import */ var _class_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../class.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/class.mjs");
/* harmony import */ var _Math_color_value_mjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../Math/color-value.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/Math/color-value.mjs");







const CLASS_ROOT = 'pcui-color-input';
/**
 * Represents a color picker.
 */
class ColorPicker extends _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(args = {}) {
        var _a, _b, _c;
        super(args);
        this._historyCombine = false;
        this._historyPostfix = null;
        this._size = 144;
        this._directInput = true;
        this._colorHSV = [0, 0, 0];
        this._pickerChannels = [];
        this._channelsNumber = 4;
        this._changing = false;
        this._dragging = false;
        this._callingCallback = false;
        this._pickRectPointerId = null;
        this._pickHuePointerId = null;
        this._pickOpacityPointerId = null;
        this._evtColorPick = null;
        this._evtColorToPicker = null;
        this._evtColorPickStart = null;
        this._evtColorPickEnd = null;
        this._onKeyDown = (evt) => {
            // escape blurs the field
            if (evt.key === 'Escape') {
                this.blur();
            }
            // enter opens the color picker
            if (evt.key !== 'Enter' || !this.enabled || this.readOnly) {
                return;
            }
            evt.stopPropagation();
            evt.preventDefault();
        };
        this._onFocus = (evt) => {
            this.emit('focus');
        };
        this._onBlur = (evt) => {
            this.emit('blur');
        };
        // rect drag start
        this._pickRectPointerDown = (event) => {
            if (this._pickRectPointerId !== null)
                return;
            this._pickRect.setPointerCapture(event.pointerId);
            this._pickRectPointerId = event.pointerId;
            event.preventDefault();
            event.stopPropagation();
            this.emit('picker:color:start');
            this._pickRectPointerMove(event);
        };
        // rect drag
        this._pickRectPointerMove = (event) => {
            if (this._pickRectPointerId !== event.pointerId)
                return;
            this._changing = true;
            // Get the pointer position relative to the element
            const rect = this._pickRect.getBoundingClientRect();
            const x = Math.max(0, Math.min(this._size, Math.floor(event.clientX - rect.left)));
            const y = Math.max(0, Math.min(this._size, Math.floor(event.clientY - rect.top)));
            this._colorHSV[1] = x / this._size;
            this._colorHSV[2] = 1.0 - (y / this._size);
            this._directInput = false;
            const rgb = (0,_Math_color_value_mjs__WEBPACK_IMPORTED_MODULE_5__._hsv2rgb)(this._colorHSV);
            for (let i = 0; i < 3; i++) {
                this._pickerChannels[i].value = rgb[i];
            }
            this._fieldHex.value = this._getHex();
            this._directInput = true;
            this._pickRectHandle.style.left = Math.max(4, Math.min(this._size - 4, x)) + 'px';
            this._pickRectHandle.style.top = Math.max(4, Math.min(this._size - 4, y)) + 'px';
            this._changing = false;
        };
        // rect drag stop
        this._pickRectPointerUp = (event) => {
            if (this._pickRectPointerId !== event.pointerId)
                return;
            this.emit('picker:color:end');
            // Release the pointer
            this._pickRect.releasePointerCapture(event.pointerId);
            this._pickRectPointerId = null;
        };
        // hue drag start
        this._pickHuePointerDown = (event) => {
            if (this._pickHuePointerId !== null)
                return;
            this._pickHue.setPointerCapture(event.pointerId);
            this._pickHuePointerId = event.pointerId;
            event.preventDefault();
            event.stopPropagation();
            this.emit('picker:color:start');
            this._pickHuePointerMove(event);
        };
        // hue drag
        this._pickHuePointerMove = (event) => {
            if (this._pickHuePointerId !== event.pointerId)
                return;
            this._changing = true;
            const rect = this._pickHue.getBoundingClientRect();
            const y = Math.max(0, Math.min(this._size, Math.floor(event.clientY - rect.top)));
            const h = y / this._size;
            const rgb = (0,_Math_color_value_mjs__WEBPACK_IMPORTED_MODULE_5__._hsv2rgb)([h, this._colorHSV[1], this._colorHSV[2]]);
            this._colorHSV[0] = h;
            this._directInput = false;
            for (let i = 0; i < 3; i++) {
                this._pickerChannels[i].value = rgb[i];
            }
            this._fieldHex.value = this._getHex();
            this._onChangeRgb();
            this._directInput = true;
            this._changing = false;
        };
        // hue drag stop
        this._pickHuePointerUp = (event) => {
            if (this._pickHuePointerId !== event.pointerId)
                return;
            this.emit('picker:color:end');
            // Release the pointer
            this._pickHue.releasePointerCapture(event.pointerId);
            this._pickHuePointerId = null;
        };
        // opacity drag start
        this._pickOpacityPointerDown = (event) => {
            if (this._pickOpacityPointerId !== null)
                return;
            this._pickOpacity.setPointerCapture(event.pointerId);
            this._pickOpacityPointerId = event.pointerId;
            event.preventDefault();
            event.stopPropagation();
            this.emit('picker:color:start');
            this._pickOpacityPointerMove(event);
        };
        // opacity drag
        this._pickOpacityPointerMove = (event) => {
            if (this._pickOpacityPointerId !== event.pointerId)
                return;
            this._changing = true;
            const rect = this._pickOpacity.getBoundingClientRect();
            const y = Math.max(0, Math.min(this._size, Math.floor(event.clientY - rect.top)));
            const o = 1.0 - y / this._size;
            this._directInput = false;
            this._pickerChannels[3].value = Math.max(0, Math.min(255, Math.round(o * 255)));
            this._fieldHex.value = this._getHex();
            this._directInput = true;
            this._changing = false;
        };
        // opacity drag stop
        this._pickOpacityPointerUp = (event) => {
            if (this._pickOpacityPointerId !== event.pointerId)
                return;
            this.emit('picker:color:end');
            // Release the pointer
            this._pickOpacity.releasePointerCapture(event.pointerId);
            this._pickOpacityPointerId = null;
        };
        this.class.add(CLASS_ROOT, _class_mjs__WEBPACK_IMPORTED_MODULE_4__.NOT_FLEXIBLE);
        // this element shows the actual color. The
        // parent element shows the checkerboard pattern
        this._domColor = document.createElement('div');
        this.dom.appendChild(this._domColor);
        this.dom.addEventListener('keydown', this._onKeyDown);
        this.dom.addEventListener('focus', this._onFocus);
        this.dom.addEventListener('blur', this._onBlur);
        this.on('click', () => {
            if (this.enabled && !this.readOnly) {
                this._openColorPicker();
            }
        });
        this._value = (_a = args.value) !== null && _a !== void 0 ? _a : [0, 0, 255, 1];
        this._channels = (_b = args.channels) !== null && _b !== void 0 ? _b : 3;
        this._setValue(this._value);
        this.renderChanges = (_c = args.renderChanges) !== null && _c !== void 0 ? _c : false;
        this.on('change', () => {
            if (this.renderChanges) {
                this.flash();
            }
        });
        // overlay
        this._overlay = new _Overlay_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]({
            class: 'picker-color',
            clickable: true,
            hidden: true,
            transparent: true
        });
        this.dom.appendChild(this._overlay.dom);
        // rectangular picker
        this._pickRect = document.createElement('div');
        this._pickRect.classList.add('pick-rect');
        this._overlay.append(this._pickRect);
        // color drag events
        this._pickRect.addEventListener('pointerdown', this._pickRectPointerDown);
        this._pickRect.addEventListener('pointermove', this._pickRectPointerMove);
        this._pickRect.addEventListener('pointerup', this._pickRectPointerUp);
        // white
        this._pickRectWhite = document.createElement('div');
        this._pickRectWhite.classList.add('white');
        this._pickRect.appendChild(this._pickRectWhite);
        // black
        this._pickRectBlack = document.createElement('div');
        this._pickRectBlack.classList.add('black');
        this._pickRect.appendChild(this._pickRectBlack);
        // handle
        this._pickRectHandle = document.createElement('div');
        this._pickRectHandle.classList.add('handle');
        this._pickRect.appendChild(this._pickRectHandle);
        // hue (rainbow) picker
        this._pickHue = document.createElement('div');
        this._pickHue.classList.add('pick-hue');
        this._overlay.append(this._pickHue);
        // hue drag events
        this._pickHue.addEventListener('pointerdown', this._pickHuePointerDown);
        this._pickHue.addEventListener('pointermove', this._pickHuePointerMove);
        this._pickHue.addEventListener('pointerup', this._pickHuePointerUp);
        // handle
        this._pickHueHandle = document.createElement('div');
        this._pickHueHandle.classList.add('handle');
        this._pickHue.appendChild(this._pickHueHandle);
        // opacity (gradient) picker
        this._pickOpacity = document.createElement('div');
        this._pickOpacity.classList.add('pick-opacity');
        this._overlay.append(this._pickOpacity);
        // opacity drag events
        this._pickOpacity.addEventListener('pointerdown', this._pickOpacityPointerDown);
        this._pickOpacity.addEventListener('pointermove', this._pickOpacityPointerMove);
        this._pickOpacity.addEventListener('pointerup', this._pickOpacityPointerUp);
        // handle
        this._pickOpacityHandle = document.createElement('div');
        this._pickOpacityHandle.classList.add('handle');
        this._pickOpacity.appendChild(this._pickOpacityHandle);
        // fields
        this._panelFields = document.createElement('div');
        this._panelFields.classList.add('fields');
        this._overlay.append(this._panelFields);
        this._overlay.on('hide', () => {
            this._evtColorPick.unbind();
            this._evtColorPick = null;
            this._evtColorToPicker.unbind();
            this._evtColorToPicker = null;
            this._evtColorPickStart.unbind();
            this._evtColorPickStart = null;
            this._evtColorPickEnd.unbind();
            this._evtColorPickEnd = null;
        });
        const createChannelInput = (channel) => {
            return new _NumericInput_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]({
                class: ['field', 'field-' + channel],
                precision: 0,
                step: 1,
                min: 0,
                max: 255,
                placeholder: channel
            });
        };
        // R
        const fieldR = createChannelInput('r');
        fieldR.on('change', () => {
            this._onChangeRgb();
        });
        this._pickerChannels.push(fieldR);
        this._panelFields.appendChild(fieldR.dom);
        // G
        const fieldG = createChannelInput('g');
        fieldG.on('change', () => {
            this._onChangeRgb();
        });
        this._pickerChannels.push(fieldG);
        this._panelFields.appendChild(fieldG.dom);
        // B
        const fieldB = createChannelInput('b');
        fieldB.on('change', () => {
            this._onChangeRgb();
        });
        this._pickerChannels.push(fieldB);
        this._panelFields.appendChild(fieldB.dom);
        // A
        const fieldA = createChannelInput('a');
        fieldA.on('change', (value) => {
            this._onChangeAlpha(value);
        });
        this._pickerChannels.push(fieldA);
        this._panelFields.appendChild(fieldA.dom);
        // HEX
        this._fieldHex = new _TextInput_index_mjs__WEBPACK_IMPORTED_MODULE_3__["default"]({
            class: ['field', 'field-hex'],
            placeholder: '#'
        });
        this._fieldHex.on('change', () => {
            this._onChangeHex();
        });
        this._panelFields.appendChild(this._fieldHex.dom);
    }
    destroy() {
        if (this._destroyed)
            return;
        this.dom.removeEventListener('keydown', this._onKeyDown);
        this.dom.removeEventListener('focus', this._onFocus);
        this.dom.removeEventListener('blur', this._onBlur);
        this._pickRect.removeEventListener('pointerdown', this._pickRectPointerDown);
        this._pickRect.removeEventListener('pointermove', this._pickRectPointerMove);
        this._pickRect.removeEventListener('pointerup', this._pickRectPointerUp);
        this._pickHue.removeEventListener('pointerdown', this._pickHuePointerDown);
        this._pickHue.removeEventListener('pointermove', this._pickHuePointerMove);
        this._pickHue.removeEventListener('pointerup', this._pickHuePointerUp);
        this._pickOpacity.removeEventListener('pointerdown', this._pickOpacityPointerDown);
        this._pickOpacity.removeEventListener('pointermove', this._pickOpacityPointerMove);
        this._pickOpacity.removeEventListener('pointerup', this._pickOpacityPointerUp);
        super.destroy();
    }
    focus() {
        this.dom.focus();
    }
    blur() {
        this.dom.blur();
    }
    _setColorPickerPosition(x, y) {
        this._overlay.position(x, y);
    }
    _setPickerColor(color) {
        if (this._changing || this._dragging)
            return;
        if (this._channelsNumber >= 3) {
            const hsv = (0,_Math_color_value_mjs__WEBPACK_IMPORTED_MODULE_5__._rgb2hsv)(color);
            this._colorHSV[0] = hsv[0];
            this._colorHSV[1] = hsv[1];
            this._colorHSV[2] = hsv[2];
        }
        // set fields
        this._directInput = false;
        for (let i = 0; i < color.length; i++) {
            this._pickerChannels[i].value = color[i];
        }
        this._fieldHex.value = this._getHex();
        this._directInput = true;
    }
    _openColorPicker() {
        // open color picker
        this._callPicker(this.value.map(c => Math.floor(c * 255)));
        // picked color
        this._evtColorPick = this.on('picker:color', (color) => {
            this.value = color.map((c) => c / 255);
        });
        this._evtColorPickStart = this.on('picker:color:start', () => {
            if (this.binding) {
                this._historyCombine = this.binding.historyCombine;
                this._historyPostfix = this.binding.historyPostfix;
                this.binding.historyCombine = true;
                this._binding.historyPostfix = `(${Date.now()})`;
            }
            else {
                this._historyCombine = false;
                this._historyPostfix = null;
            }
        });
        this._evtColorPickEnd = this.on('picker:color:end', () => {
            if (this.binding) {
                this.binding.historyCombine = this._historyCombine;
                this.binding.historyPostfix = this._historyPostfix;
            }
        });
        // position picker
        const rectPicker = this._overlay.dom.getBoundingClientRect();
        const rectElement = this.dom.getBoundingClientRect();
        this._setColorPickerPosition(rectElement.left - rectPicker.width, rectElement.top + 25);
        // color changed, update picker
        this._evtColorToPicker = this.on('change', () => {
            this._setPickerColor(this.value.map(c => Math.floor(c * 255)));
        });
    }
    _callPicker(color) {
        // class for channels
        for (let i = 0; i < 4; i++) {
            if (color.length - 1 < i) {
                this._overlay.class.remove('c-' + (i + 1));
            }
            else {
                this._overlay.class.add('c-' + (i + 1));
            }
        }
        // number of channels
        this._channelsNumber = color.length;
        if (this._channelsNumber >= 3) {
            const hsv = (0,_Math_color_value_mjs__WEBPACK_IMPORTED_MODULE_5__._rgb2hsv)(color);
            this._colorHSV[0] = hsv[0];
            this._colorHSV[1] = hsv[1];
            this._colorHSV[2] = hsv[2];
        }
        // set fields
        this._directInput = false;
        for (let i = 0; i < color.length; i++) {
            this._pickerChannels[i].value = color[i];
        }
        this._fieldHex.value = this._getHex();
        this._directInput = true;
        // show overlay
        this._overlay.hidden = false;
        // focus on hex field
        this._fieldHex.dom.focus();
        window.setTimeout(() => {
            this._fieldHex.dom.focus();
        }, 100);
    }
    _valueToColor(value) {
        value = Math.floor(value * 255);
        return Math.max(0, Math.min(value, 255));
    }
    _setValue(value) {
        const r = this._valueToColor(value[0]);
        const g = this._valueToColor(value[1]);
        const b = this._valueToColor(value[2]);
        const a = value[3];
        if (this._channels === 1) {
            this._domColor.style.backgroundColor = `rgb(${r}, ${r}, ${r})`;
        }
        else if (this._channels === 3) {
            this._domColor.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        }
        else if (this._channels === 4) {
            this._domColor.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
        }
    }
    _updateValue(value) {
        let dirty = false;
        for (let i = 0; i < value.length; i++) {
            if (this._value[i] !== value[i]) {
                dirty = true;
                this._value[i] = value[i];
            }
        }
        this.class.remove(_class_mjs__WEBPACK_IMPORTED_MODULE_4__.MULTIPLE_VALUES);
        if (dirty) {
            this._setValue(value);
            this.emit('change', value);
        }
        return dirty;
    }
    // get hex from channels
    _getHex() {
        let hex = '';
        for (let i = 0; i < this._channelsNumber; i++) {
            hex += ('00' + this._pickerChannels[i].value.toString(16)).slice(-2).toUpperCase();
        }
        return hex;
    }
    _onChangeHex() {
        if (!this._directInput)
            return;
        this._changing = true;
        const hex = this._fieldHex.value.trim().toLowerCase();
        if (/^([0-9a-f]{2}){3,4}$/.test(hex)) {
            for (let i = 0; i < this._channelsNumber; i++) {
                this._pickerChannels[i].value = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
            }
        }
        this._changing = false;
    }
    _onChangeRgb() {
        const color = this._pickerChannels.map(function (channel) {
            return channel.value || 0;
        }).slice(0, this._channelsNumber);
        const hsv = (0,_Math_color_value_mjs__WEBPACK_IMPORTED_MODULE_5__._rgb2hsv)(color);
        if (this._directInput) {
            const sum = color[0] + color[1] + color[2];
            if (sum !== 765 && sum !== 0)
                this._colorHSV[0] = hsv[0];
            this._colorHSV[1] = hsv[1];
            this._colorHSV[2] = hsv[2];
            this._dragging = true;
            this.emit('picker:color:start');
        }
        // hue position
        this._pickHueHandle.style.top = Math.floor(this._size * this._colorHSV[0]) + 'px'; // h
        // rect position
        this._pickRectHandle.style.left = Math.max(4, Math.min(this._size - 4, this._size * this._colorHSV[1])) + 'px'; // s
        this._pickRectHandle.style.top = Math.max(4, Math.min(this._size - 4, this._size * (1.0 - this._colorHSV[2]))) + 'px'; // v
        if (this._channelsNumber >= 3) {
            const plainColor = (0,_Math_color_value_mjs__WEBPACK_IMPORTED_MODULE_5__._hsv2rgb)([this._colorHSV[0], 1, 1]).join(',');
            // rect background color
            this._pickRect.style.backgroundColor = 'rgb(' + plainColor + ')';
            // rect handle color
            this._pickRectHandle.style.backgroundColor = 'rgb(' + color.slice(0, 3).join(',') + ')';
            // hue handle color
            this._pickHueHandle.style.backgroundColor = 'rgb(' + plainColor + ')';
        }
        this.callCallback();
    }
    // update alpha handle
    _onChangeAlpha(value) {
        if (this._channelsNumber !== 4)
            return;
        // position
        this._pickOpacityHandle.style.top = Math.floor(this._size * (1.0 - (Math.max(0, Math.min(255, value)) / 255))) + 'px';
        // color
        this._pickOpacityHandle.style.backgroundColor = `rgb(${value}, ${value}, ${value})`;
        this.callCallback();
    }
    /** @ignore */
    callbackHandle() {
        this._callingCallback = false;
        this.emit('picker:color', this._pickerChannels.map(function (channel) {
            return channel.value || 0;
        }).slice(0, this._channelsNumber));
    }
    /** @ignore */
    callCallback() {
        if (this._callingCallback)
            return;
        this._callingCallback = true;
        window.setTimeout(() => {
            this.callbackHandle();
        }, 1000 / 60);
    }
    set value(value) {
        value = value || [0, 0, 0, 0];
        const changed = this._updateValue(value);
        if (changed && this._binding) {
            this._binding.setValue(value);
        }
    }
    get value() {
        return this._value.slice(0, this._channels);
    }
    /* eslint accessor-pairs: 0 */
    set values(values) {
        let different = false;
        const value = values[0];
        for (let i = 1; i < values.length; i++) {
            if (Array.isArray(value)) {
                // @ts-ignore
                if (!value.equals(values[i])) { // TODO: check if this works
                    different = true;
                    break;
                }
            }
            else {
                if (value !== values[i]) {
                    different = true;
                    break;
                }
            }
        }
        if (different) {
            this.value = null;
            this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_4__.MULTIPLE_VALUES);
        }
        else {
            // @ts-ignore
            this.value = values[0];
        }
    }
    set channels(value) {
        if (this._channels === value)
            return;
        this._channels = Math.max(0, Math.min(value, 4));
        this._setValue(this.value);
    }
    get channels() {
        return this._channels;
    }
    set renderChanges(value) {
        this._renderChanges = value;
    }
    get renderChanges() {
        return this._renderChanges;
    }
}
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"].register('rgb', ColorPicker);
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"].register('rgba', ColorPicker, { channels: 4 });
var ColorPicker$1 = ColorPicker;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/Container/index.mjs":
/*!**************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/Container/index.mjs ***!
  \**************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Container$1)
/* harmony export */ });
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");
/* harmony import */ var _class_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../class.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/class.mjs");



const RESIZE_HANDLE_SIZE = 4;
const VALID_RESIZABLE_VALUES = [
    null,
    'top',
    'right',
    'bottom',
    'left'
];
const CLASS_RESIZING = _class_mjs__WEBPACK_IMPORTED_MODULE_1__.RESIZABLE + '-resizing';
const CLASS_RESIZABLE_HANDLE = 'pcui-resizable-handle';
const CLASS_CONTAINER = 'pcui-container';
const CLASS_DRAGGED = CLASS_CONTAINER + '-dragged';
const CLASS_DRAGGED_CHILD = CLASS_DRAGGED + '-child';
/**
 * A container is the basic building block for {@link Element}s that are grouped together. A
 * container can contain any other element including other containers.
 */
class Container extends _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(args = {}) {
        var _a;
        super(args);
        this._scrollable = false;
        this._flex = false;
        this._grid = false;
        this._domResizeHandle = null;
        this._resizePointerId = null;
        this._resizeData = null;
        this._resizeHorizontally = true;
        this._resizeMin = 100;
        this._resizeMax = 300;
        this._draggedStartIndex = -1;
        this._onScroll = (evt) => {
            this.emit('scroll', evt);
        };
        this._onResizeStart = (evt) => {
            if (this._resizePointerId !== null)
                return;
            evt.preventDefault();
            evt.stopPropagation();
            this._domResizeHandle.setPointerCapture(evt.pointerId);
            this._resizePointerId = evt.pointerId;
            this._resizeStart();
        };
        this._onResizeMove = (evt) => {
            if (this._resizePointerId !== evt.pointerId)
                return;
            evt.preventDefault();
            evt.stopPropagation();
            this._resizeMove(evt.clientX, evt.clientY);
        };
        this._onResizeEnd = (evt) => {
            if (this._resizePointerId !== evt.pointerId)
                return;
            evt.preventDefault();
            evt.stopPropagation();
            this._resizeEnd();
            this._domResizeHandle.releasePointerCapture(evt.pointerId);
            this._resizePointerId = null;
        };
        this.class.add(CLASS_CONTAINER);
        this.domContent = this._dom;
        // scroll
        if (args.scrollable) {
            this.scrollable = true;
        }
        // flex
        this.flex = !!args.flex;
        // grid
        let grid = !!args.grid;
        if (grid) {
            if (this.flex) {
                console.error('Invalid Container arguments: "grid" and "flex" cannot both be true.');
                grid = false;
            }
        }
        this.grid = grid;
        // resize related
        this.resizable = (_a = args.resizable) !== null && _a !== void 0 ? _a : null;
        if (args.resizeMin !== undefined) {
            this.resizeMin = args.resizeMin;
        }
        if (args.resizeMax !== undefined) {
            this.resizeMax = args.resizeMax;
        }
    }
    destroy() {
        if (this._destroyed)
            return;
        this.domContent = null;
        if (this._domResizeHandle) {
            this._domResizeHandle.removeEventListener('pointerdown', this._onResizeStart);
            this._domResizeHandle.removeEventListener('pointermove', this._onResizeMove);
            this._domResizeHandle.removeEventListener('pointerup', this._onResizeEnd);
        }
        super.destroy();
    }
    /**
     * Appends an element to the container.
     *
     * @param {Element} element - The element to append.
     * @fires 'append'
     */
    append(element) {
        const dom = this._getDomFromElement(element);
        this._domContent.appendChild(dom);
        this._onAppendChild(element);
    }
    /**
     * Appends an element to the container before the specified reference element.
     *
     * @param {Element} element - The element to append.
     * @param {Element} referenceElement - The element before which the element will be appended.
     * @fires 'append'
     */
    appendBefore(element, referenceElement) {
        const dom = this._getDomFromElement(element);
        this._domContent.appendChild(dom);
        const referenceDom = referenceElement && this._getDomFromElement(referenceElement);
        this._domContent.insertBefore(dom, referenceDom);
        this._onAppendChild(element);
    }
    /**
     * Appends an element to the container just after the specified reference element.
     *
     * @param {Element} element - The element to append.
     * @param {Element} referenceElement - The element after which the element will be appended.
     * @fires 'append'
     */
    appendAfter(element, referenceElement) {
        const dom = this._getDomFromElement(element);
        const referenceDom = referenceElement && this._getDomFromElement(referenceElement);
        const elementBefore = referenceDom ? referenceDom.nextSibling : null;
        if (elementBefore) {
            this._domContent.insertBefore(dom, elementBefore);
        }
        else {
            this._domContent.appendChild(dom);
        }
        this._onAppendChild(element);
    }
    /**
     * Inserts an element in the beginning of the container.
     *
     * @param {Element} element - The element to prepend.
     * @fires 'append'
     */
    prepend(element) {
        const dom = this._getDomFromElement(element);
        const first = this._domContent.firstChild;
        if (first) {
            this._domContent.insertBefore(dom, first);
        }
        else {
            this._domContent.appendChild(dom);
        }
        this._onAppendChild(element);
    }
    /**
     * Removes the specified child element from the container.
     *
     * @param element - The element to remove.
     * @fires 'remove'
     */
    remove(element) {
        if (element.parent !== this)
            return;
        const dom = this._getDomFromElement(element);
        this._domContent.removeChild(dom);
        this._onRemoveChild(element);
    }
    /**
     * Moves the specified child at the specified index.
     *
     * @param element - The element to move.
     * @param index - The index to move the element to.
     */
    move(element, index) {
        let idx = -1;
        for (let i = 0; i < this.dom.childNodes.length; i++) {
            if (this.dom.childNodes[i].ui === element) {
                idx = i;
                break;
            }
        }
        if (idx === -1) {
            this.appendBefore(element, this.dom.childNodes[index]);
        }
        else if (index !== idx) {
            this.remove(element);
            if (index < idx) {
                this.appendBefore(element, this.dom.childNodes[index]);
            }
            else {
                this.appendAfter(element, this.dom.childNodes[index - 1]);
            }
        }
    }
    /**
     * Clears all children from the container.
     *
     * @fires 'remove' for each child element.
     */
    clear() {
        let i = this._domContent.childNodes.length;
        while (i--) {
            const node = this._domContent.childNodes[i];
            if (node.ui && node.ui !== this) {
                node.ui.destroy();
            }
        }
        if (this._domResizeHandle) {
            this._domResizeHandle.removeEventListener('pointerdown', this._onResizeStart);
            this._domResizeHandle.removeEventListener('pointermove', this._onResizeMove);
            this._domResizeHandle.removeEventListener('pointerup', this._onResizeEnd);
            this._domResizeHandle = null;
        }
        this._domContent.innerHTML = '';
        if (this.resizable) {
            this._createResizeHandle();
            this._dom.appendChild(this._domResizeHandle);
        }
    }
    // Used for backwards compatibility with the legacy ui framework
    _getDomFromElement(element) {
        if (element.dom) {
            return element.dom;
        }
        if (element.element) {
            // console.log('Legacy ui.Element passed to Container', this.class, element.class);
            return element.element;
        }
        return element;
    }
    _onAppendChild(element) {
        element.parent = this;
        this.emit('append', element);
    }
    _onRemoveChild(element) {
        element.parent = null;
        this.emit('remove', element);
    }
    _createResizeHandle() {
        const handle = document.createElement('div');
        handle.classList.add(CLASS_RESIZABLE_HANDLE);
        handle.ui = this;
        handle.addEventListener('pointerdown', this._onResizeStart);
        handle.addEventListener('pointermove', this._onResizeMove);
        handle.addEventListener('pointerup', this._onResizeEnd);
        this._domResizeHandle = handle;
    }
    _resizeStart() {
        this.class.add(CLASS_RESIZING);
    }
    _resizeMove(x, y) {
        // if we haven't initialized resizeData do so now
        if (!this._resizeData) {
            this._resizeData = {
                x: x,
                y: y,
                width: this.dom.clientWidth,
                height: this.dom.clientHeight
            };
            return;
        }
        if (this._resizeHorizontally) {
            // horizontal resizing
            let offsetX = this._resizeData.x - x;
            if (this._resizable === 'right') {
                offsetX = -offsetX;
            }
            this.width = RESIZE_HANDLE_SIZE + Math.max(this._resizeMin, Math.min(this._resizeMax, (this._resizeData.width + offsetX)));
        }
        else {
            // vertical resizing
            let offsetY = this._resizeData.y - y;
            if (this._resizable === 'bottom') {
                offsetY = -offsetY;
            }
            this.height = Math.max(this._resizeMin, Math.min(this._resizeMax, (this._resizeData.height + offsetY)));
        }
        this.emit('resize');
    }
    _resizeEnd() {
        this._resizeData = null;
        this.class.remove(CLASS_RESIZING);
    }
    /**
     * Resize the container.
     *
     * @param x - The number of pixels to resize the width.
     * @param y - The number of pixels to resize the height.
     */
    resize(x, y) {
        x = x || 0;
        y = y || 0;
        this._resizeStart();
        this._resizeMove(0, 0);
        this._resizeMove(-x + RESIZE_HANDLE_SIZE, -y);
        this._resizeEnd();
    }
    _getDraggedChildIndex(draggedChild) {
        for (let i = 0; i < this.dom.childNodes.length; i++) {
            if (this.dom.childNodes[i].ui === draggedChild) {
                return i;
            }
        }
        return -1;
    }
    _onChildDragStart(evt, childPanel) {
        this.class.add(CLASS_DRAGGED_CHILD);
        this._draggedStartIndex = this._getDraggedChildIndex(childPanel);
        childPanel.class.add(CLASS_DRAGGED);
        this.emit('child:dragstart', childPanel, this._draggedStartIndex);
    }
    _onChildDragMove(evt, childPanel) {
        const rect = this.dom.getBoundingClientRect();
        const dragOut = (evt.clientX < rect.left || evt.clientX > rect.right || evt.clientY < rect.top || evt.clientY > rect.bottom);
        const childPanelIndex = this._getDraggedChildIndex(childPanel);
        if (dragOut) {
            childPanel.class.remove(CLASS_DRAGGED);
            if (this._draggedStartIndex !== childPanelIndex) {
                this.remove(childPanel);
                if (this._draggedStartIndex < childPanelIndex) {
                    this.appendBefore(childPanel, this.dom.childNodes[this._draggedStartIndex]);
                }
                else {
                    this.appendAfter(childPanel, this.dom.childNodes[this._draggedStartIndex - 1]);
                }
            }
            return;
        }
        childPanel.class.add(CLASS_DRAGGED);
        const y = evt.clientY - rect.top;
        let ind = null;
        // hovered script
        for (let i = 0; i < this.dom.childNodes.length; i++) {
            const otherPanel = this.dom.childNodes[i].ui;
            const otherTop = otherPanel.dom.offsetTop;
            if (i < childPanelIndex) {
                if (y <= otherTop + otherPanel.header.height) {
                    ind = i;
                    break;
                }
            }
            else if (i > childPanelIndex) {
                if (y + childPanel.height >= otherTop + otherPanel.height) {
                    ind = i;
                    break;
                }
            }
        }
        if (ind !== null && childPanelIndex !== ind) {
            this.remove(childPanel);
            if (ind < childPanelIndex) {
                this.appendBefore(childPanel, this.dom.childNodes[ind]);
            }
            else {
                this.appendAfter(childPanel, this.dom.childNodes[ind - 1]);
            }
        }
    }
    _onChildDragEnd(evt, childPanel) {
        this.class.remove(CLASS_DRAGGED_CHILD);
        childPanel.class.remove(CLASS_DRAGGED);
        const index = this._getDraggedChildIndex(childPanel);
        this.emit('child:dragend', childPanel, index, this._draggedStartIndex);
        this._draggedStartIndex = -1;
    }
    /**
     * Iterate over each child element using the supplied function. To early out of the iteration,
     * return `false` from the function.
     *
     * @param fn - The function to call for each child element.
     */
    forEachChild(fn) {
        for (let i = 0; i < this.dom.childNodes.length; i++) {
            const node = this.dom.childNodes[i].ui;
            if (node) {
                const result = fn(node, i);
                if (result === false) {
                    // early out
                    break;
                }
            }
        }
    }
    /**
     * If the current node contains a root, recursively append its children to this node
     * and return it. Otherwise return the current node. Also add each child to the parent
     * under its keyed name.
     *
     * @param node - The current element in the dom structure which must be recursively
     * traversed and appended to its parent.
     * @param node.root - The root node of the dom structure.
     * @param node.children - The children of the root node.
     * @returns The recursively appended element node.
     *
     */
    _buildDomNode(node) {
        const keys = Object.keys(node);
        let rootNode;
        if (keys.includes('root')) {
            rootNode = this._buildDomNode(node.root);
            node.children.forEach((childNode) => {
                const childNodeElement = this._buildDomNode(childNode);
                if (childNodeElement !== null) {
                    rootNode.append(childNodeElement);
                }
            });
        }
        else {
            rootNode = node[keys[0]];
            // @ts-ignore
            this[`_${keys[0]}`] = rootNode;
        }
        return rootNode;
    }
    /**
     * Takes an array of pcui elements, each of which can contain their own child elements, and
     * appends them to this container. These child elements are traversed recursively using
     * _buildDomNode.
     *
     * @param dom - An array of child pcui elements to append to this container.
     *
     * @example
     * buildDom([
     *     {
     *         child1: pcui.Label()
     *     },
     *     {
     *         root: {
     *             container1: pcui.Container()
     *         },
     *         children: [
     *             {
     *                 child2: pcui.Label()
     *             },
     *             {
     *                 child3: pcui.Label()
     *             }
     *         ]
     *     }
     * ]);
     */
    buildDom(dom) {
        dom.forEach((node) => {
            const builtNode = this._buildDomNode(node);
            this.append(builtNode);
        });
    }
    /**
     * Gets / sets whether the Element supports flex layout.
     */
    set flex(value) {
        if (value === this._flex)
            return;
        this._flex = value;
        if (value) {
            this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.FLEX);
        }
        else {
            this.class.remove(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.FLEX);
        }
    }
    get flex() {
        return this._flex;
    }
    /**
     * Gets / sets whether the Element supports the grid layout.
     */
    set grid(value) {
        if (value === this._grid)
            return;
        this._grid = value;
        if (value) {
            this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.GRID);
        }
        else {
            this.class.remove(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.GRID);
        }
    }
    get grid() {
        return this._grid;
    }
    /**
     * Gets /sets whether the Element should be scrollable.
     */
    set scrollable(value) {
        if (this._scrollable === value)
            return;
        this._scrollable = value;
        if (value) {
            this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.SCROLLABLE);
        }
        else {
            this.class.remove(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.SCROLLABLE);
        }
    }
    get scrollable() {
        return this._scrollable;
    }
    /**
     * Gets / sets whether the Element is resizable and where the resize handle is located. Can
     * be one of 'top', 'bottom', 'right', 'left'. Set to null to disable resizing.
     */
    set resizable(value) {
        if (value === this._resizable)
            return;
        if (VALID_RESIZABLE_VALUES.indexOf(value) === -1) {
            console.error('Invalid resizable value: must be one of ' + VALID_RESIZABLE_VALUES.join(','));
            return;
        }
        // remove old class
        if (this._resizable) {
            this.class.remove(`${_class_mjs__WEBPACK_IMPORTED_MODULE_1__.RESIZABLE}-${this._resizable}`);
        }
        this._resizable = value;
        this._resizeHorizontally = (value === 'right' || value === 'left');
        if (value) {
            // add resize class and create / append resize handle
            this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.RESIZABLE);
            this.class.add(`${_class_mjs__WEBPACK_IMPORTED_MODULE_1__.RESIZABLE}-${value}`);
            if (!this._domResizeHandle) {
                this._createResizeHandle();
            }
            this._dom.appendChild(this._domResizeHandle);
        }
        else {
            // remove resize class and resize handle
            this.class.remove(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.RESIZABLE);
            if (this._domResizeHandle) {
                this._dom.removeChild(this._domResizeHandle);
            }
        }
    }
    get resizable() {
        return this._resizable;
    }
    /**
     * Gets / sets the minimum size the Element can take when resized in pixels.
     */
    set resizeMin(value) {
        this._resizeMin = Math.max(0, Math.min(value, this._resizeMax));
    }
    get resizeMin() {
        return this._resizeMin;
    }
    /**
     * Gets / sets the maximum size the Element can take when resized in pixels.
     */
    set resizeMax(value) {
        this._resizeMax = Math.max(this._resizeMin, value);
    }
    get resizeMax() {
        return this._resizeMax;
    }
    /**
     * The internal DOM element used as a the container of all children.
     * Can be overridden by derived classes.
     */
    set domContent(value) {
        if (this._domContent === value)
            return;
        if (this._domContent) {
            this._domContent.removeEventListener('scroll', this._onScroll);
        }
        this._domContent = value;
        if (this._domContent) {
            this._domContent.addEventListener('scroll', this._onScroll);
        }
    }
    get domContent() {
        return this._domContent;
    }
}
/**
 * Fired when a child Element gets added to the Container.
 *
 * @event
 * @example
 * ```ts
 * const container = new Container();
 * container.on('append', (element: Element) => {
 *     console.log('Element added to container:', element);
 * });
 * ```
 */
Container.EVENT_APPEND = 'append';
/**
 * Fired when a child Element gets removed from the Container.
 *
 * @event
 * @example
 * ```ts
 * const container = new Container();
 * container.on('remove', (element: Element) => {
 *     console.log('Element removed from container:', element);
 * });
 * ```
 */
Container.EVENT_REMOVE = 'remove';
/**
 * Fired when the container is scrolled. The native DOM scroll event is passed to the event handler.
 *
 * @event
 * @example
 * ```ts
 * const container = new Container();
 * container.on('scroll', (event: Event) => {
 *     console.log('Container scrolled:', event);
 * });
 * ```
 */
Container.EVENT_SCROLL = 'scroll';
/**
 * Fired when the container gets resized using the resize handle.
 *
 * @event
 * @example
 * ```ts
 * const container = new Container();
 * container.on('resize', () => {
 *     console.log('Container resized to:', container.width, container.height, 'px');
 * });
 * ```
 */
Container.EVENT_RESIZE = 'resize';
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"].register('container', Container);
var Container$1 = Container;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/Divider/index.mjs":
/*!************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/Divider/index.mjs ***!
  \************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Divider$1)
/* harmony export */ });
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");


const CLASS_ROOT = 'pcui-divider';
/**
 * Represents a vertical division between two elements.
 */
class Divider extends _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(args = {}) {
        super(args);
        this.class.add(CLASS_ROOT);
    }
}
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"].register('divider', Divider);
var Divider$1 = Divider;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs":
/*!************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs ***!
  \************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Element)
/* harmony export */ });
/* harmony import */ var _playcanvas_observer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @playcanvas/observer */ "./node_modules/@playcanvas/observer/dist/index.mjs");
/* harmony import */ var _class_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../class.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/class.mjs");



const CLASS_ELEMENT = 'pcui-element';
// these are properties that are
// available as Element properties and
// can also be set through the Element constructor
const SIMPLE_CSS_PROPERTIES = [
    'flexDirection',
    'flexGrow',
    'flexBasis',
    'flexShrink',
    'flexWrap',
    'alignItems',
    'alignSelf',
    'justifyContent',
    'justifySelf'
];
// Stores Element types by name and default arguments
const elementRegistry = new Map();
/**
 * The base class for all UI elements.
 */
class Element extends _playcanvas_observer__WEBPACK_IMPORTED_MODULE_0__.Events {
    constructor(args = {}) {
        var _a, _b, _c;
        super();
        this._destroyed = false;
        this._parent = null; // eslint-disable-line no-use-before-define
        this._eventsParent = [];
        this._flashTimeout = null;
        this._suppressChange = false;
        this._onMouseOver = (evt) => {
            this.emit('hover', evt);
        };
        this._onMouseOut = (evt) => {
            this.emit('hoverend', evt);
        };
        if (typeof args.dom === 'string') {
            this._dom = document.createElement(args.dom);
        }
        else if (args.dom instanceof Node) {
            this._dom = args.dom;
        }
        else {
            this._dom = document.createElement('div');
        }
        if (args.id !== undefined) {
            this._dom.id = args.id;
        }
        // add ui reference
        this._dom.ui = this;
        this._onClickEvt = this._onClick.bind(this);
        // add event listeners
        this._dom.addEventListener('click', this._onClickEvt);
        this._dom.addEventListener('mouseover', this._onMouseOver);
        this._dom.addEventListener('mouseout', this._onMouseOut);
        // add css classes
        this._dom.classList.add(CLASS_ELEMENT, _class_mjs__WEBPACK_IMPORTED_MODULE_1__.FONT_REGULAR);
        // add user classes
        if (args.class) {
            const classes = Array.isArray(args.class) ? args.class : [args.class];
            for (const cls of classes) {
                this._dom.classList.add(cls);
            }
        }
        this.enabled = args.enabled !== undefined ? args.enabled : true;
        this._hiddenParents = !args.isRoot;
        this.hidden = (_a = args.hidden) !== null && _a !== void 0 ? _a : false;
        this.readOnly = (_b = args.readOnly) !== null && _b !== void 0 ? _b : false;
        this.ignoreParent = (_c = args.ignoreParent) !== null && _c !== void 0 ? _c : false;
        if (args.width !== undefined) {
            this.width = args.width;
        }
        if (args.height !== undefined) {
            this.height = args.height;
        }
        if (args.tabIndex !== undefined) {
            this.tabIndex = args.tabIndex;
        }
        // copy CSS properties from args
        for (const key in args) {
            // @ts-ignore
            if (args[key] === undefined)
                continue;
            if (SIMPLE_CSS_PROPERTIES.indexOf(key) !== -1) {
                // @ts-ignore
                this[key] = args[key];
            }
        }
        // set the binding object
        if (args.binding) {
            this.binding = args.binding;
        }
    }
    /**
     * Destroys the Element and its events.
     */
    destroy() {
        if (this._destroyed)
            return;
        this._destroyed = true;
        if (this.binding) {
            this.binding = null;
        }
        else {
            this.unlink();
        }
        if (this.parent) {
            const parent = this.parent;
            for (const event of this._eventsParent) {
                event.unbind();
            }
            this._eventsParent.length = 0;
            // remove element from parent
            // check if parent has been destroyed already
            // because we do not want to be emitting events
            // on a destroyed parent after it's been destroyed
            // as it is easy to lead to null exceptions
            // @ts-ignore
            if (parent.remove && !parent._destroyed) {
                // @ts-ignore
                parent.remove(this);
            }
            // set parent to null and remove from
            // parent dom just in case parent.remove above
            // didn't work because of an override or other condition
            this._parent = null;
            // Do not manually call removeChild for elements whose parent has already been destroyed.
            // For example when we destroy a TreeViewItem that has many child nodes, that will trigger every child Element to call dom.parentElement.removeChild(dom).
            // But we don't need to remove all these DOM elements from their parents since the root DOM element is destroyed anyway.
            // This has a big impact on destroy speed in certain cases.
            if (!parent._destroyed && this._dom && this._dom.parentElement) {
                this._dom.parentElement.removeChild(this._dom);
            }
        }
        const dom = this._dom;
        if (dom) {
            // remove event listeners
            dom.removeEventListener('click', this._onClickEvt);
            dom.removeEventListener('mouseover', this._onMouseOver);
            dom.removeEventListener('mouseout', this._onMouseOut);
            // remove ui reference
            delete dom.ui;
            this._dom = null;
        }
        if (this._flashTimeout) {
            window.clearTimeout(this._flashTimeout);
        }
        this.emit('destroy', dom, this);
        this.unbind();
    }
    /**
     * Links the specified observers and paths to the Element's data binding.
     *
     * @param observers - An array of observers or a single observer.
     * @param paths - A path for the observer(s) or an array of paths that maps to each separate observer.
     */
    link(observers, paths) {
        if (this._binding) {
            this._binding.link(observers, paths);
        }
    }
    /**
     * Unlinks the Element from its observers.
     */
    unlink() {
        if (this._binding) {
            this._binding.unlink();
        }
    }
    /**
     * Triggers a flash animation on the Element.
     */
    flash() {
        if (this._flashTimeout)
            return;
        this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.FLASH);
        this._flashTimeout = window.setTimeout(() => {
            this._flashTimeout = null;
            this.class.remove(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.FLASH);
        }, 200);
    }
    _onClick(evt) {
        if (this.enabled) {
            this.emit('click', evt);
        }
    }
    _onHiddenToRootChange(hiddenToRoot) {
        this.emit(hiddenToRoot ? 'hideToRoot' : 'showToRoot');
    }
    _onEnabledChange(enabled) {
        if (enabled) {
            this.class.remove(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.DISABLED);
        }
        else {
            this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.DISABLED);
        }
        this.emit(enabled ? 'enable' : 'disable');
    }
    _onParentDestroy() {
        this.destroy();
    }
    _onParentDisable() {
        if (this._ignoreParent)
            return;
        if (this._enabled) {
            this._onEnabledChange(false);
        }
    }
    _onParentEnable() {
        if (this._ignoreParent)
            return;
        if (this._enabled) {
            this._onEnabledChange(true);
        }
    }
    _onParentShowToRoot() {
        const oldHiddenToRoot = this.hiddenToRoot;
        this._hiddenParents = false;
        if (oldHiddenToRoot !== this.hiddenToRoot) {
            this._onHiddenToRootChange(this.hiddenToRoot);
        }
    }
    _onParentHideToRoot() {
        const oldHiddenToRoot = this.hiddenToRoot;
        this._hiddenParents = true;
        if (oldHiddenToRoot !== this.hiddenToRoot) {
            this._onHiddenToRootChange(this.hiddenToRoot);
        }
    }
    _onReadOnlyChange(readOnly) {
        if (readOnly) {
            this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.READONLY);
        }
        else {
            this.class.remove(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.READONLY);
        }
        this.emit('readOnly', readOnly);
    }
    _onParentReadOnlyChange(readOnly) {
        if (this._ignoreParent)
            return;
        if (readOnly) {
            if (!this._readOnly) {
                this._onReadOnlyChange(true);
            }
        }
        else {
            if (!this._readOnly) {
                this._onReadOnlyChange(false);
            }
        }
    }
    unbind(name, fn) {
        return super.unbind(name, fn);
    }
    /**
     * @param type - The type we want to reference this Element by.
     * @param cls - The actual class of the Element.
     * @param defaultArguments - Default arguments when creating this type.
     */
    static register(type, cls, defaultArguments) {
        elementRegistry.set(type, { cls, defaultArguments });
    }
    /**
     * @param type - The type we want to unregister.
     */
    static unregister(type) {
        elementRegistry.delete(type);
    }
    /**
     * Creates a new Element of the desired type.
     *
     * @param type - The type of the Element (registered by Element#register).
     * @param args - Arguments for the Element.
     * @returns The new Element or undefined if type is not found.
     */
    static create(type, args) {
        const entry = elementRegistry.get(type);
        if (!entry) {
            console.error('Invalid type passed to Element.create:', type);
            return undefined;
        }
        const cls = entry.cls;
        const clsArgs = Object.assign(Object.assign({}, entry.defaultArguments), args);
        return new cls(clsArgs);
    }
    /**
     * Gets / sets whether the Element or its parent chain is enabled or not. Defaults to `true`.
     */
    set enabled(value) {
        if (this._enabled === value)
            return;
        // remember if enabled in hierarchy
        const enabled = this.enabled;
        this._enabled = value;
        // only fire event if hierarchy state changed
        if (enabled !== value) {
            this._onEnabledChange(value);
        }
    }
    get enabled() {
        if (this._ignoreParent)
            return this._enabled;
        return this._enabled && (!this._parent || this._parent.enabled);
    }
    /**
     * Gets / sets whether the Element will ignore parent events & variable states.
     */
    set ignoreParent(value) {
        this._ignoreParent = value;
        this._onEnabledChange(this.enabled);
        this._onReadOnlyChange(this.readOnly);
    }
    get ignoreParent() {
        return this._ignoreParent;
    }
    /**
     * Gets the root DOM node for this Element.
     */
    get dom() {
        return this._dom;
    }
    /**
     * Gets / sets the parent Element.
     */
    set parent(value) {
        if (value === this._parent)
            return;
        const oldEnabled = this.enabled;
        const oldReadonly = this.readOnly;
        const oldHiddenToRoot = this.hiddenToRoot;
        if (this._parent) {
            for (let i = 0; i < this._eventsParent.length; i++) {
                this._eventsParent[i].unbind();
            }
            this._eventsParent.length = 0;
        }
        this._parent = value;
        if (this._parent) {
            this._eventsParent.push(this._parent.once('destroy', this._onParentDestroy.bind(this)));
            this._eventsParent.push(this._parent.on('disable', this._onParentDisable.bind(this)));
            this._eventsParent.push(this._parent.on('enable', this._onParentEnable.bind(this)));
            this._eventsParent.push(this._parent.on('readOnly', this._onParentReadOnlyChange.bind(this)));
            this._eventsParent.push(this._parent.on('showToRoot', this._onParentShowToRoot.bind(this)));
            this._eventsParent.push(this._parent.on('hideToRoot', this._onParentHideToRoot.bind(this)));
            this._hiddenParents = this._parent.hiddenToRoot;
        }
        else {
            this._hiddenParents = true;
        }
        this.emit('parent', this._parent);
        const newEnabled = this.enabled;
        if (newEnabled !== oldEnabled) {
            this._onEnabledChange(newEnabled);
        }
        const newReadonly = this.readOnly;
        if (newReadonly !== oldReadonly) {
            this._onReadOnlyChange(newReadonly);
        }
        const hiddenToRoot = this.hiddenToRoot;
        if (hiddenToRoot !== oldHiddenToRoot) {
            this._onHiddenToRootChange(hiddenToRoot);
        }
    }
    get parent() {
        return this._parent;
    }
    /**
     * Gets / sets whether the Element is hidden.
     */
    set hidden(value) {
        if (value === this._hidden)
            return;
        const oldHiddenToRoot = this.hiddenToRoot;
        this._hidden = value;
        if (value) {
            this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.HIDDEN);
        }
        else {
            this.class.remove(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.HIDDEN);
        }
        this.emit(value ? 'hide' : 'show');
        if (this.hiddenToRoot !== oldHiddenToRoot) {
            this._onHiddenToRootChange(this.hiddenToRoot);
        }
    }
    get hidden() {
        return this._hidden;
    }
    /**
     * Gets whether the Element is hidden all the way up to the root. If the Element itself or any of its parents are hidden then this is true.
     */
    get hiddenToRoot() {
        return this._hidden || this._hiddenParents;
    }
    /**
     * Gets / sets whether the Element is read only.
     */
    set readOnly(value) {
        if (this._readOnly === value)
            return;
        this._readOnly = value;
        this._onReadOnlyChange(value);
    }
    get readOnly() {
        if (this._ignoreParent)
            return this._readOnly;
        return this._readOnly || !!(this._parent && this._parent.readOnly);
    }
    /**
     * Gets / sets whether the Element is in an error state.
     */
    set error(value) {
        if (this._hasError === value)
            return;
        this._hasError = value;
        if (value) {
            this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.ERROR);
        }
        else {
            this.class.remove(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.ERROR);
        }
    }
    get error() {
        return this._hasError;
    }
    /**
     * Shortcut to Element.dom.style.
     */
    get style() {
        return this._dom.style;
    }
    /**
     * Get the `DOMTokenList` of the underlying DOM element. This is essentially a shortcut to
     * `element.dom.classList`.
     */
    get class() {
        return this._dom.classList;
    }
    /**
     * Gets / sets the width of the Element in pixels. Can also be an empty string to remove it.
     */
    set width(value) {
        if (typeof value === 'number') {
            value = String(value) + 'px';
        }
        this.style.width = value;
    }
    get width() {
        return this._dom.clientWidth;
    }
    /**
     * Gets / sets the height of the Element in pixels. Can also be an empty string to remove it.
     */
    set height(value) {
        if (typeof value === 'number') {
            value = String(value) + 'px';
        }
        this.style.height = value;
    }
    get height() {
        return this._dom.clientHeight;
    }
    /**
     * Gets / sets the tabIndex of the Element.
     */
    set tabIndex(value) {
        this._dom.tabIndex = value;
    }
    get tabIndex() {
        return this._dom.tabIndex;
    }
    /**
     * Gets / sets the Binding object for the element.
     */
    set binding(value) {
        if (this._binding === value)
            return;
        let prevObservers;
        let prevPaths;
        if (this._binding) {
            prevObservers = this._binding.observers;
            prevPaths = this._binding.paths;
            this.unlink();
            this._binding.element = null;
            this._binding = null;
        }
        this._binding = value;
        if (this._binding) {
            // @ts-ignore
            this._binding.element = this;
            if (prevObservers && prevPaths) {
                this.link(prevObservers, prevPaths);
            }
        }
    }
    get binding() {
        return this._binding;
    }
    get destroyed() {
        return this._destroyed;
    }
    // CSS proxy accessors
    /**
     * Gets / sets the flex-direction CSS property.
     */
    set flexDirection(value) {
        this.style.flexDirection = value;
    }
    get flexDirection() {
        return this.style.flexDirection;
    }
    /**
     * Gets / sets the flex-grow CSS property.
     */
    set flexGrow(value) {
        this.style.flexGrow = value;
    }
    get flexGrow() {
        return this.style.flexGrow;
    }
    /**
     * Gets / sets the flex-basis CSS property.
     */
    set flexBasis(value) {
        this.style.flexBasis = value;
    }
    get flexBasis() {
        return this.style.flexBasis;
    }
    /**
     * Gets / sets the flex-shrink CSS property.
     */
    set flexShrink(value) {
        this.style.flexShrink = value;
    }
    get flexShrink() {
        return this.style.flexShrink;
    }
    /**
     * Gets / sets the flex-wrap CSS property.
     */
    set flexWrap(value) {
        this.style.flexWrap = value;
    }
    get flexWrap() {
        return this.style.flexWrap;
    }
    /**
     * Gets / sets the align-items CSS property.
     */
    set alignItems(value) {
        this.style.alignItems = value;
    }
    get alignItems() {
        return this.style.alignItems;
    }
    /**
     * Gets / sets the align-self CSS property.
     */
    set alignSelf(value) {
        this.style.alignSelf = value;
    }
    get alignSelf() {
        return this.style.alignSelf;
    }
    /**
     * Gets / sets the justify-content CSS property.
     */
    set justifyContent(value) {
        this.style.justifyContent = value;
    }
    get justifyContent() {
        return this.style.justifyContent;
    }
    /**
     * Gets / sets the justify-self CSS property.
     */
    set justifySelf(value) {
        this.style.justifySelf = value;
    }
    get justifySelf() {
        return this.style.justifySelf;
    }
    /*  Backwards Compatibility */
    // we should remove those after we migrate
    /** @ignore */
    set disabled(value) {
        this.enabled = !value;
    }
    /** @ignore */
    get disabled() {
        return !this.enabled;
    }
    /** @ignore */
    set element(value) {
        this._dom = value;
    }
    /** @ignore */
    get element() {
        return this.dom;
    }
    /** @ignore */
    set innerElement(value) {
        this._domContent = value;
    }
    /** @ignore */
    get innerElement() {
        return this._domContent;
    }
}
/**
 * Fired when the Element gets enabled.
 *
 * @event
 * @example
 * ```ts
 * const element = new Element();
 * element.on('enable', () => {
 *     console.log('Element enabled');
 * });
 * ```
 */
Element.EVENT_ENABLE = 'enable';
/**
 * Fired when the Element gets disabled.
 *
 * @event
 * @example
 * ```ts
 * const element = new Element();
 * element.on('disable', () => {
 *     console.log('Element disabled');
 * });
 * ```
 */
Element.EVENT_DISABLE = 'disable';
/**
 * Fired when the Element gets hidden.
 *
 * @event
 * @example
 * ```ts
 * const element = new Element();
 * element.on('hide', () => {
 *     console.log('Element hidden');
 * });
 * ```
 */
Element.EVENT_HIDE = 'hide';
/**
 * Fired when the Element or any of its parent get hidden.
 *
 * @event
 * @example
 * ```ts
 * const element = new Element();
 * element.on('hideToRoot', () => {
 *     console.log('Element or one of its parents hidden');
 * });
 * ```
 */
Element.EVENT_HIDE_TO_ROOT = 'hideToRoot';
/**
 * Fired when the Element stops being hidden.
 *
 * @event
 * @example
 * ```ts
 * const element = new Element();
 * element.on('show', () => {
 *     console.log('Element shown');
 * });
 * ```
 */
Element.EVENT_SHOW = 'show';
/**
 * Fired when the Element and all of its parents become visible.
 *
 * @event
 * @example
 * ```ts
 * const element = new Element();
 * element.on('showToRoot', () => {
 *     console.log('Element and all of its parents shown');
 * });
 * ```
 */
Element.EVENT_SHOW_TO_ROOT = 'showToRoot';
/**
 * Fired when the readOnly property of an Element changes.
 *
 * @event
 * @example
 * ```ts
 * const element = new Element();
 * element.on('readOnly', (readOnly: boolean) => {
 *     console.log(`Element is now ${readOnly ? 'read only' : 'editable'}`);
 * });
 * ```
 */
Element.EVENT_READ_ONLY = 'readOnly';
/**
 * Fired when the Element's parent gets set.
 *
 * @event
 * @example
 * ```ts
 * const element = new Element();
 * element.on('parent', (parent: Element) => {
 *     console.log(`Element's parent is now ${parent}`);
 * });
 * ```
 */
Element.EVENT_PARENT = 'parent';
/**
 * Fired when the mouse is clicked on the Element but only if the Element is enabled. The
 * native DOM MouseEvent is passed as a parameter to the event handler.
 *
 * @event
 * @example
 * ```ts
 * const element = new Element();
 * element.on('click', (evt: MouseEvent) => {
 *     console.log('Element clicked');
 * });
 * ```
 */
Element.EVENT_CLICK = 'click';
/**
 * Fired when the mouse starts hovering on the Element. The native DOM MouseEvent is passed as a
 * parameter to the event handler.
 *
 * @event
 * @example
 * ```ts
 * const element = new Element();
 * element.on('hover', (evt: MouseEvent) => {
 *     console.log('Element hovered');
 * });
 * ```
 */
Element.EVENT_HOVER = 'hover';
/**
 * Fired when the mouse stops hovering on the Element. The native DOM MouseEvent is passed as a
 * parameter to the event handler.
 *
 * @event
 * @example
 * ```ts
 * const element = new Element();
 * element.on('hoverend', (evt: MouseEvent) => {
 *     console.log('Element hover ended');
 * });
 * ```
 */
Element.EVENT_HOVER_END = 'hoverend';
/**
 * Fired after the element has been destroyed. Both the DOM element and the owner Element
 * instance are passed as parameters to the event handler.
 *
 * @event
 * @example
 * ```ts
 * const element = new Element();
 * element.on('destroy', (dom: HTMLElement, element: Element) => {
 *     console.log('Element destroyed');
 * });
 * ```
 */
Element.EVENT_DESTROY = 'destroy';




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/GradientPicker/index.mjs":
/*!*******************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/GradientPicker/index.mjs ***!
  \*******************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ GradientPicker$1)
/* harmony export */ });
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");
/* harmony import */ var _Overlay_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Overlay/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Overlay/index.mjs");
/* harmony import */ var _Button_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Button/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Button/index.mjs");
/* harmony import */ var _SelectInput_index_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../SelectInput/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/SelectInput/index.mjs");
/* harmony import */ var _NumericInput_index_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../NumericInput/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/NumericInput/index.mjs");
/* harmony import */ var _TextInput_index_mjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../TextInput/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/TextInput/index.mjs");
/* harmony import */ var _Panel_index_mjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../Panel/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Panel/index.mjs");
/* harmony import */ var _Canvas_index_mjs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../Canvas/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Canvas/index.mjs");
/* harmony import */ var _Label_index_mjs__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../Label/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Label/index.mjs");
/* harmony import */ var _Math_color_value_mjs__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../Math/color-value.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/Math/color-value.mjs");
/* harmony import */ var _node_modules_playcanvas_build_playcanvas_mjs_core_math_math_mjs__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../../node_modules/playcanvas/build/playcanvas.mjs/core/math/math.mjs */ "./node_modules/@playcanvas/pcui/dist/module/node_modules/playcanvas/build/playcanvas.mjs/core/math/math.mjs");
/* harmony import */ var _node_modules_playcanvas_build_playcanvas_mjs_core_math_curve_set_mjs__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../../node_modules/playcanvas/build/playcanvas.mjs/core/math/curve-set.mjs */ "./node_modules/@playcanvas/pcui/dist/module/node_modules/playcanvas/build/playcanvas.mjs/core/math/curve-set.mjs");
/* harmony import */ var _node_modules_playcanvas_build_playcanvas_mjs_core_math_curve_mjs__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../../node_modules/playcanvas/build/playcanvas.mjs/core/math/curve.mjs */ "./node_modules/@playcanvas/pcui/dist/module/node_modules/playcanvas/build/playcanvas.mjs/core/math/curve.mjs");














const CLASS_MULTIPLE_VALUES = 'pcui-multiple-values';
const CURVE_LINEAR = 0;
const CURVE_SPLINE = 4;
const CURVE_STEP = 5;
const REGEX_KEYS = /keys/;
const REGEX_TYPE = /type/;
const CLASS_GRADIENT = 'pcui-gradient';
/**
 * Represents a gradient picker.
 */
class GradientPicker extends _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"] {
    /**
     * Creates a new GradientPicker.
     *
     * @param args - The arguments. Extends the Element arguments. Any settable property can also
     * be set through the constructor.
     */
    constructor(args = {}) {
        var _a;
        super(args);
        this._onKeyDown = (evt) => {
            // escape blurs the field
            if (evt.key === 'Escape') {
                this.blur();
            }
            // enter opens the gradient picker
            if (evt.key !== 'Enter' || !this.enabled || this.readOnly || this.class.contains(CLASS_MULTIPLE_VALUES)) {
                return;
            }
            evt.stopPropagation();
            evt.preventDefault();
            this._openGradientPicker();
        };
        this._onFocus = (evt) => {
            this.emit('focus');
        };
        this._onBlur = (evt) => {
            this.emit('blur');
        };
        this._onAnchorsMouseDown = (e) => {
            if (this.STATE.hoveredAnchor === -1) {
                // user clicked in empty space, create new anchor and select it
                const coord = this.calcNormalizedCoord(e.clientX, e.clientY, this.getClientRect(this.UI.anchors.dom));
                this.insertAnchor(coord[0], this.evaluateGradient(coord[0]));
                this.STATE.anchors = this.calcAnchorTimes();
                this.selectAnchor(this.STATE.anchors.indexOf(coord[0]));
            }
            else if (this.STATE.hoveredAnchor !== this.STATE.selectedAnchor) {
                // select the hovered anchor
                this.selectAnchor(this.STATE.hoveredAnchor);
            }
            this.UI.anchors.dom.style.cursor = 'grabbing';
            this.UI.anchorAddCrossHair.style.visibility = 'hidden';
            // drag the selected anchor
            this.dragStart();
            this.UI.draggingAnchor = true;
        };
        this._onAnchorsMouseMove = (e) => {
            const coord = this.calcNormalizedCoord(e.clientX, e.clientY, this.getClientRect(this.UI.anchors.dom));
            if (this.UI.draggingAnchor) {
                this.dragUpdate(_node_modules_playcanvas_build_playcanvas_mjs_core_math_math_mjs__WEBPACK_IMPORTED_MODULE_10__.math.clamp(coord[0], 0, 1));
                this.UI.anchorAddCrossHair.style.visibility = 'hidden';
            }
            else if (coord[0] >= 0 &&
                coord[0] <= 1 &&
                coord[1] >= 0 &&
                coord[1] <= 1) {
                let closest = -1;
                let closestDist = 0;
                for (let index = 0; index < this.STATE.anchors.length; ++index) {
                    const dist = Math.abs(this.STATE.anchors[index] - coord[0]);
                    if (closest === -1 || dist < closestDist) {
                        closest = index;
                        closestDist = dist;
                    }
                }
                const hoveredAnchor = (closest !== -1 && closestDist < 0.02) ? closest : -1;
                if (hoveredAnchor !== this.STATE.hoveredAnchor) {
                    this.selectHovered(hoveredAnchor);
                    this.render();
                }
                if (hoveredAnchor === -1) {
                    this.UI.anchorAddCrossHair.style.visibility = 'visible';
                    this.UI.anchors.dom.style.cursor = 'none';
                }
                else {
                    this.UI.anchorAddCrossHair.style.visibility = 'hidden';
                }
                this.UI.showCrosshairPosition.innerText = (Math.round(coord[0] * 100)).toString();
                this.UI.anchorAddCrossHair.style.left = (2.5 + 320 * coord[0]).toString() + "px";
            }
            else if (this.STATE.hoveredAnchor !== -1) {
                this.UI.anchorAddCrossHair.style.visibility = 'hidden';
                this.selectHovered(-1);
                this.render();
            }
            else {
                this.UI.anchorAddCrossHair.style.visibility = 'hidden';
            }
        };
        this._onAnchorsMouseUp = (evt) => {
            if (this.UI.draggingAnchor) {
                this.dragEnd();
                this.UI.draggingAnchor = false;
            }
            this.UI.anchors.dom.style.cursor = 'pointer';
        };
        this.class.add(CLASS_GRADIENT);
        this._canvas = new _Canvas_index_mjs__WEBPACK_IMPORTED_MODULE_7__["default"]({ useDevicePixelRatio: true });
        this.dom.appendChild(this._canvas.dom);
        this._canvas.parent = this;
        this._canvas.on('resize', () => {
            this._renderGradient();
        });
        const canvasElement = this._canvas.dom;
        this._checkerboardPattern = this._createCheckerboardPattern(canvasElement.getContext('2d'));
        // make sure canvas is the same size as the container element
        // 20 times a second
        this._resizeInterval = window.setInterval(() => {
            this._canvas.resize(this.width, this.height);
        }, 1000 / 20);
        this.dom.addEventListener('keydown', this._onKeyDown);
        this.dom.addEventListener('focus', this._onFocus);
        this.dom.addEventListener('blur', this._onBlur);
        this.on('click', () => {
            if (!this.enabled || this.readOnly || this.class.contains(CLASS_MULTIPLE_VALUES))
                return;
            this._openGradientPicker();
        });
        this.renderChanges = (_a = args.renderChanges) !== null && _a !== void 0 ? _a : true;
        this.on('change', () => {
            if (this.renderChanges) {
                this.flash();
            }
        });
        // capture this for the event handler
        function genEvtHandler(self, func) {
            return function (evt) {
                func.apply(self, [evt]);
            };
        }
        this.Helpers = {
            rgbaStr: function (color, scale) {
                if (!scale) {
                    scale = 1;
                }
                let rgba = color.map(function (element, index) {
                    return index < 3 ? Math.round(element * scale) : element;
                }).join(',');
                for (let i = color.length; i < 4; ++i) {
                    rgba += ',' + (i < 3 ? scale : 1);
                }
                return 'rgba(' + rgba + ')';
            },
            hexStr: function (clr) {
                return clr.map(function (v) {
                    return ('00' + v.toString(16)).slice(-2).toUpperCase();
                }).join('');
            },
            // rgb(a) -> hsva
            toHsva: function (rgba) {
                const hsva = (0,_Math_color_value_mjs__WEBPACK_IMPORTED_MODULE_9__._rgb2hsv)(rgba.map(function (v) {
                    return v * 255;
                }));
                hsva.push(rgba.length > 3 ? rgba[3] : 1);
                return hsva;
            },
            // hsv(1) -> rgba
            toRgba: function (hsva) {
                const rgba = (0,_Math_color_value_mjs__WEBPACK_IMPORTED_MODULE_9__._hsv2rgb)(hsva).map(function (v) {
                    return v / 255;
                });
                rgba.push(hsva.length > 3 ? hsva[3] : 1);
                return rgba;
            },
            // calculate the normalized coordinate [x,y] relative to rect
            normalizedCoord: function (canvas, x, y) {
                const rect = canvas.dom.getBoundingClientRect();
                return [
                    (x - rect.left) / rect.width,
                    (y - rect.top) / rect.height
                ];
            }
        };
        this._panel = new _Panel_index_mjs__WEBPACK_IMPORTED_MODULE_6__["default"]();
        this._panel.class.add('color-panel');
        this.dom.appendChild(this._panel.dom);
        this._colorRect = new _Canvas_index_mjs__WEBPACK_IMPORTED_MODULE_7__["default"]({ useDevicePixelRatio: true });
        this._colorRect.class.add('color-rect');
        this._panel.append(this._colorRect.dom);
        this._colorRect.resize(140, 140);
        this._colorHandle = document.createElement('div');
        this._colorHandle.classList.add('color-handle');
        this._panel.append(this._colorHandle);
        this._hueRect = new _Canvas_index_mjs__WEBPACK_IMPORTED_MODULE_7__["default"]({ useDevicePixelRatio: true });
        this._hueRect.class.add('hue-rect');
        this._panel.append(this._hueRect.dom);
        this._hueRect.resize(20, 140);
        this._hueHandle = document.createElement('div');
        this._hueHandle.classList.add('hue-handle');
        this._panel.append(this._hueHandle);
        this._alphaRect = new _Canvas_index_mjs__WEBPACK_IMPORTED_MODULE_7__["default"]({ useDevicePixelRatio: true });
        this._alphaRect.class.add('alpha-rect');
        this._panel.append(this._alphaRect.dom);
        this._alphaRect.resize(20, 140);
        this._alphaHandle = document.createElement('div');
        this._alphaHandle.classList.add('alpha-handle');
        this._panel.append(this._alphaHandle);
        this._fields = document.createElement('div');
        this._fields.classList.add('fields');
        this._panel.append(this._fields);
        this.fieldChangeHandler = genEvtHandler(this, this._onFieldChanged);
        this.hexChangeHandler = genEvtHandler(this, this._onHexChanged);
        this.downHandler = genEvtHandler(this, this._onMouseDown);
        this.moveHandler = genEvtHandler(this, this._onMouseMove);
        this.upHandler = genEvtHandler(this, this._onMouseUp);
        function numberField(label) {
            const field = new _NumericInput_index_mjs__WEBPACK_IMPORTED_MODULE_4__["default"]({
                precision: 1,
                step: 1,
                min: 0,
                max: 255
            });
            field.renderChanges = false;
            field.placeholder = label;
            field.on('change', this.fieldChangeHandler);
            this._fields.appendChild(field.dom);
            return field;
        }
        this._rField = numberField.call(this, 'r');
        this._gField = numberField.call(this, 'g');
        this._bField = numberField.call(this, 'b');
        this._aField = numberField.call(this, 'a');
        this._hexField = new _TextInput_index_mjs__WEBPACK_IMPORTED_MODULE_5__["default"]();
        this._hexField.renderChanges = false;
        this._hexField.placeholder = '#';
        this._hexField.on('change', this.hexChangeHandler);
        this._fields.appendChild(this._hexField.dom);
        // hook up mouse handlers
        this._colorRect.dom.addEventListener('mousedown', this.downHandler);
        this._hueRect.dom.addEventListener('mousedown', this.downHandler);
        this._alphaRect.dom.addEventListener('mousedown', this.downHandler);
        this._generateHue(this._hueRect);
        this._generateAlpha(this._alphaRect);
        this._hsva = [-1, -1, -1, 1];
        this._storeHsva = [0, 0, 0, 1];
        this._dragMode = 0;
        this._changing = false;
        this.CONSTANTS = {
            bg: '#2c393c',
            anchorRadius: 5,
            selectedRadius: 7
        };
        this.UI = {
            root: this.dom,
            overlay: new _Overlay_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"](),
            panel: document.createElement('div'),
            gradient: new _Canvas_index_mjs__WEBPACK_IMPORTED_MODULE_7__["default"]({ useDevicePixelRatio: true }),
            checkerPattern: this.createCheckerPattern(),
            anchors: new _Canvas_index_mjs__WEBPACK_IMPORTED_MODULE_7__["default"]({ useDevicePixelRatio: true }),
            footer: new _Panel_index_mjs__WEBPACK_IMPORTED_MODULE_6__["default"](),
            typeLabel: new _Label_index_mjs__WEBPACK_IMPORTED_MODULE_8__["default"]({ text: 'Type' }),
            typeCombo: new _SelectInput_index_mjs__WEBPACK_IMPORTED_MODULE_3__["default"]({
                options: [{ t: '0', v: 'placeholder' }],
                type: 'number'
            }),
            positionLabel: new _Label_index_mjs__WEBPACK_IMPORTED_MODULE_8__["default"]({ text: 'Position' }),
            positionEdit: new _NumericInput_index_mjs__WEBPACK_IMPORTED_MODULE_4__["default"]({ min: 0, max: 100, step: 1 }),
            copyButton: new _Button_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"](),
            pasteButton: new _Button_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"](),
            deleteButton: new _Button_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"](),
            showSelectedPosition: new _NumericInput_index_mjs__WEBPACK_IMPORTED_MODULE_4__["default"]({ min: 0, max: 100, step: 1, hideSlider: true }),
            showCrosshairPosition: document.createElement('div'),
            anchorAddCrossHair: document.createElement('div'),
            colorPicker: null
        };
        // current state
        this.STATE = {
            curves: [], // holds all the gradient curves (either 3 or 4 of them)
            keystore: [], // holds the curve during edit
            anchors: [], // holds the times of the anchors
            hoveredAnchor: -1, // index of the hovered anchor
            selectedAnchor: -1, // index of selected anchor
            selectedValue: [], // value being dragged
            changing: false, // UI is currently changing
            draggingAnchor: false,
            typeMap: {} // map from curve type dropdown to engine curve enum
        };
        // initialize overlay
        this.UI.root.appendChild(this.UI.overlay.dom);
        this.UI.overlay.class.add('picker-gradient');
        this.UI.overlay.center = false;
        this.UI.overlay.transparent = true;
        this.UI.overlay.hidden = true;
        this.UI.overlay.clickable = true;
        this.UI.overlay.dom.style.position = "fixed";
        this.UI.overlay.on('show', () => {
            this.onOpen();
        });
        this.UI.overlay.on('hide', () => {
            this.onClose();
        });
        // panel
        this.UI.panel.classList.add('picker-gradient-panel');
        this.UI.overlay.append(this.UI.panel);
        // gradient
        this.UI.panel.appendChild(this.UI.gradient.dom);
        this.UI.gradient.class.add('picker-gradient-gradient');
        this.UI.gradient.resize(320, 28);
        // anchors
        this.UI.panel.appendChild(this.UI.anchors.dom);
        this.UI.anchors.class.add('picker-gradient-anchors');
        this.UI.anchors.resize(320, 28);
        // footer
        this.UI.panel.appendChild(this.UI.footer.dom);
        this.UI.footer.append(this.UI.typeLabel);
        this.UI.footer.class.add('picker-gradient-footer');
        this.UI.footer.append(this.UI.typeCombo);
        this.UI.typeCombo.value = -1;
        this.UI.typeCombo.on('change', (value) => {
            this._onTypeChanged(value);
        });
        // this.UI.footer.append(this.UI.positionLabel);
        // this.UI.footer.append(this.UI.positionEdit);
        this.UI.positionEdit.style.width = '40px';
        this.UI.positionEdit.renderChanges = false;
        this.UI.showSelectedPosition.on('change', (value) => {
            if (!this.STATE.changing) {
                this.moveSelectedAnchor(value / 100);
            }
        });
        this.UI.copyButton.on('click', () => {
            this.doCopy();
        });
        this.UI.copyButton.class.add('copy-curve-button');
        this.UI.footer.append(this.UI.copyButton);
        // Tooltip.attach({
        //     target: this.UI.copyButton.dom,
        //     text: 'Copy',
        //     align: 'bottom',
        //     root: this.UI.root
        // });
        this.UI.pasteButton.on('click', () => {
            this.doPaste();
        });
        this.UI.pasteButton.class.add('paste-curve-button');
        this.UI.footer.append(this.UI.pasteButton);
        this.UI.deleteButton.on('click', () => {
            this.doDelete();
        });
        this.UI.deleteButton.class.add('delete-curve-button');
        this.UI.footer.append(this.UI.deleteButton);
        this.UI.panel.appendChild(this._panel.dom);
        this.UI.panel.append(this.UI.showSelectedPosition.dom);
        this.UI.showSelectedPosition.class.add('show-selected-position');
        this.UI.showSelectedPosition._domInput.classList.add('show-selected-position-input');
        const crosshairPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        crosshairPath.setAttribute('fill-rule', 'evenodd');
        crosshairPath.setAttribute('clip-rule', 'evenodd');
        crosshairPath.setAttribute('d', 'M8.5 17C7.35596 17 6.26043 16.7741 5.2134 16.3222C4.16637 15.8703 3.26152 15.2629 2.49882 14.4997C1.73612 13.7366 1.12899 12.8312 0.677391 11.7835C0.225795 10.7359 0 9.6397 0 8.49498C0 7.35026 0.225795 6.25409 0.677391 5.20644C1.12899 4.15879 1.73612 3.25507 2.49882 2.49527C3.26152 1.73548 4.16637 1.12965 5.2134 0.677791C6.26043 0.225928 7.35596 0 8.5 0C9.64404 0 10.7396 0.225928 11.7866 0.677791C12.8336 1.12965 13.7385 1.73548 14.5012 2.49527C15.2639 3.25507 15.871 4.15879 16.3226 5.20644C16.7742 6.25409 17 7.35026 17 8.49498C17 9.6397 16.7742 10.7359 16.3226 11.7835C15.871 12.8312 15.2639 13.7366 14.5012 14.4997C13.7385 15.2629 12.8336 15.8703 11.7866 16.3222C10.7396 16.7741 9.64404 17 8.5 17ZM8.5 2.2593C7.64364 2.2593 6.82576 2.42498 6.04634 2.75635C5.26692 3.08772 4.59622 3.53288 4.03424 4.09185C3.47225 4.65082 3.02568 5.31354 2.69451 6.08004C2.36334 6.84653 2.19776 7.6515 2.19776 8.49498C2.19776 9.6397 2.47875 10.6957 3.04073 11.663C3.60272 12.6303 4.36707 13.3952 5.33383 13.9575C6.30058 14.5198 7.35596 14.8009 8.5 14.8009C9.34298 14.8009 10.1475 14.6353 10.9135 14.3039C11.6796 13.9725 12.3419 13.5257 12.9005 12.9634C13.4592 12.4011 13.9041 11.73 14.2352 10.9501C14.5664 10.1702 14.732 9.35184 14.732 8.49498C14.732 7.6515 14.5664 6.84653 14.2352 6.08004C13.9041 5.31354 13.4592 4.65082 12.9005 4.09185C12.3419 3.53288 11.6796 3.08772 10.9135 2.75635C10.1475 2.42498 9.34298 2.2593 8.5 2.2593ZM9.52361 9.73007V12.9533H7.40614V9.73007H4.11452V7.61134H7.40614V4.31778H9.52361V7.61134H12.745V9.73007H9.52361Z');
        crosshairPath.setAttribute('fill', '#FF6600');
        const crosshairHolder = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const crosshairBar = document.createElement('div');
        crosshairHolder.appendChild(crosshairPath);
        crosshairHolder.setAttribute('width', '17');
        crosshairHolder.setAttribute('height', '17');
        crosshairHolder.setAttribute('viewBox', '0 0 17 17');
        this.UI.showCrosshairPosition.classList.add('show-crosshair-position');
        crosshairBar.classList.add('crosshair-bar');
        this.UI.anchorAddCrossHair.appendChild(crosshairHolder);
        this.UI.anchorAddCrossHair.appendChild(crosshairBar);
        this.UI.anchorAddCrossHair.appendChild(this.UI.showCrosshairPosition);
        this.UI.anchorAddCrossHair.classList.add('anchor-crosshair');
        this.UI.anchorAddCrossHair.style.visibility = 'hidden';
        this.UI.panel.append(this.UI.anchorAddCrossHair);
        // construct the color picker
        /* this.on('change', this.colorSelectedAnchor);*/
        this.on('changing', function (color) {
            this.colorSelectedAnchor(color, true);
        });
        this._copiedData = null;
        this._channels = args.channels || 3;
        this._value = this._getDefaultValue();
        if (args.value) {
            // @ts-ignore
            this.value = args.value;
        }
    }
    destroy() {
        if (this._destroyed)
            return;
        this.dom.removeEventListener('keydown', this._onKeyDown);
        this.dom.removeEventListener('focus', this._onFocus);
        this.dom.removeEventListener('blur', this._onBlur);
        window.clearInterval(this._resizeInterval);
        super.destroy();
    }
    _createCheckerboardPattern(context) {
        // create checkerboard pattern
        const canvas = document.createElement('canvas');
        const size = 24;
        const halfSize = size / 2;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#';
        ctx.fillStyle = "#949a9c";
        ctx.fillRect(0, 0, halfSize, halfSize);
        ctx.fillRect(halfSize, halfSize, halfSize, halfSize);
        ctx.fillStyle = "#657375";
        ctx.fillRect(halfSize, 0, halfSize, halfSize);
        ctx.fillRect(0, halfSize, halfSize, halfSize);
        return context.createPattern(canvas, 'repeat');
    }
    _getDefaultValue() {
        return {
            type: 4,
            keys: (new Array(this._channels)).fill([0, 0]),
            betweenCurves: false
        };
    }
    _openGradientPicker() {
        this.callOpenGradientPicker([this.value || this._getDefaultValue()]);
        // position picker
        const rectPicker = this.getGradientPickerRect();
        const rectField = this.dom.getBoundingClientRect();
        this.positionGradientPicker(rectField.right - rectPicker.width, rectField.bottom);
        // change event from the picker sets the new value
        this._evtPickerChanged = this.on('picker:curve:change', this._onPickerChange.bind(this));
        // refreshing the value resets the picker
        this._evtRefreshPicker = this.on('change', () => this.setGradientPicker([this.value]));
    }
    _onPickerChange(paths, values) {
        const value = this.value || this._getDefaultValue();
        // TODO: this is all kinda hacky. We need to clear up
        // the events raised by the picker
        if (REGEX_KEYS.test(paths[0])) {
            // set new value with new keys but same type
            this.value = {
                type: value.type,
                keys: values,
                betweenCurves: false
            };
        }
        else if (REGEX_TYPE.test(paths[0])) {
            // set new value with new type but same keys
            this.value = {
                type: values[0],
                keys: value.keys,
                betweenCurves: false
            };
        }
    }
    _renderGradient() {
        const canvas = this._canvas.dom;
        const context = canvas.getContext('2d');
        const width = this._canvas.width;
        const height = this._canvas.height;
        const ratio = this._canvas.pixelRatio;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.fillStyle = this._checkerboardPattern;
        context.fillRect(0, 0, width, height);
        if (!this.value || !this.value.keys || !this.value.keys.length) {
            return;
        }
        const rgba = [];
        const curve = this.channels === 1 ? new _node_modules_playcanvas_build_playcanvas_mjs_core_math_curve_set_mjs__WEBPACK_IMPORTED_MODULE_11__.CurveSet([this.value.keys]) : new _node_modules_playcanvas_build_playcanvas_mjs_core_math_curve_set_mjs__WEBPACK_IMPORTED_MODULE_11__.CurveSet(this.value.keys);
        curve.type = this.value.type;
        const precision = 2;
        const gradient = context.createLinearGradient(0, 0, width, 0);
        for (let t = precision; t < width; t += precision) {
            curve.value(t / width, rgba);
            const r = Math.round((rgba[0] || 0) * 255);
            const g = Math.round((rgba[1] || 0) * 255);
            const b = Math.round((rgba[2] || 0) * 255);
            const a = this.channels === 4 ? (rgba[3] || 0) : 1;
            gradient.addColorStop(t / width, `rgba(${r}, ${g}, ${b}, ${a})`);
        }
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
    }
    focus() {
        this.dom.focus();
    }
    blur() {
        this.dom.blur();
    }
    set channels(value) {
        if (this._channels === value)
            return;
        this._channels = Math.max(1, Math.min(value, 4));
        // change default value
        if (this.value) {
            this._renderGradient();
        }
    }
    get channels() {
        return this._channels;
    }
    set value(value) {
        // TODO: maybe we should check for equality
        // but since this value will almost always be set using
        // the picker it's not worth the effort
        this._value = value;
        this.class.remove(CLASS_MULTIPLE_VALUES);
        this._renderGradient();
        this.emit('change', value);
        this.setValue([value]);
    }
    get value() {
        return this._value;
    }
    set values(values) {
        // we do not support multiple values so just
        // add the multiple values class which essentially disables
        // the input
        this.class.add(CLASS_MULTIPLE_VALUES);
        this._renderGradient();
    }
    _generateHue(canvas) {
        const canvasElement = canvas.dom;
        const ctx = canvasElement.getContext('2d');
        const w = canvas.pixelWidth;
        const h = canvas.pixelHeight;
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        for (let t = 0; t <= 6; t += 1) {
            gradient.addColorStop(t / 6, this.Helpers.rgbaStr((0,_Math_color_value_mjs__WEBPACK_IMPORTED_MODULE_9__._hsv2rgb)([t / 6, 1, 1])));
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
    }
    _generateAlpha(canvas) {
        const canvasElement = canvas.dom;
        const ctx = canvasElement.getContext('2d');
        const w = canvas.pixelWidth;
        const h = canvas.pixelHeight;
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, 'rgb(255, 255, 255)');
        gradient.addColorStop(1, 'rgb(0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
    }
    _generateGradient(canvas, clr) {
        const canvasElement = canvas.dom;
        const ctx = canvasElement.getContext('2d');
        const w = canvas.pixelWidth;
        const h = canvas.pixelHeight;
        let gradient = ctx.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, this.Helpers.rgbaStr([255, 255, 255, 255]));
        gradient.addColorStop(1, this.Helpers.rgbaStr([clr[0], clr[1], clr[2], 255]));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 255)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
    }
    _onFieldChanged() {
        if (!this._changing) {
            const rgba = [
                this._rField.value,
                this._gField.value,
                this._bField.value,
                this._aField.value
            ].map(function (v) {
                return v / 255;
            });
            this.hsva = this.Helpers.toHsva(rgba);
            this.colorSelectedAnchor(this.color);
        }
    }
    _onHexChanged() {
        if (!this._changing) {
            const hex = this._hexField.value.trim().toLowerCase();
            if (/^([0-9a-f]{2}){3,4}$/.test(hex)) {
                const rgb = [parseInt(hex.substring(0, 2), 16),
                    parseInt(hex.substring(2, 4), 16),
                    parseInt(hex.substring(4, 6), 16)];
                this.hsva = (0,_Math_color_value_mjs__WEBPACK_IMPORTED_MODULE_9__._rgb2hsv)(rgb).concat([this.hsva[3]]);
                this.colorSelectedAnchor(this.color);
            }
        }
    }
    _onMouseDown(evt) {
        if (evt.currentTarget === this._colorRect.dom) {
            this._dragMode = 1; // drag color
        }
        else if (evt.currentTarget === this._hueRect.dom) {
            this._dragMode = 2; // drag hue
        }
        else {
            this._dragMode = 3; // drag alpha
        }
        this._storeHsva = this._hsva.slice();
        this._onMouseMove(evt);
        // hook up mouse
        window.addEventListener('mousemove', this.moveHandler);
        window.addEventListener('mouseup', this.upHandler);
    }
    _onMouseMove(evt) {
        let newhsva;
        if (this._dragMode === 1) {
            const m = this.Helpers.normalizedCoord(this._colorRect, evt.pageX, evt.pageY);
            const s = _node_modules_playcanvas_build_playcanvas_mjs_core_math_math_mjs__WEBPACK_IMPORTED_MODULE_10__.math.clamp(m[0], 0, 1);
            const v = _node_modules_playcanvas_build_playcanvas_mjs_core_math_math_mjs__WEBPACK_IMPORTED_MODULE_10__.math.clamp(m[1], 0, 1);
            newhsva = [this.hsva[0], s, 1 - v, this._hsva[3]];
        }
        else if (this._dragMode === 2) {
            const m = this.Helpers.normalizedCoord(this._hueRect, evt.pageX, evt.pageY);
            const h = _node_modules_playcanvas_build_playcanvas_mjs_core_math_math_mjs__WEBPACK_IMPORTED_MODULE_10__.math.clamp(m[1], 0, 1);
            newhsva = [h, this.hsva[1], this.hsva[2], this.hsva[3]];
        }
        else {
            const m = this.Helpers.normalizedCoord(this._alphaRect, evt.pageX, evt.pageY);
            const a = _node_modules_playcanvas_build_playcanvas_mjs_core_math_math_mjs__WEBPACK_IMPORTED_MODULE_10__.math.clamp(m[1], 0, 1);
            newhsva = [this.hsva[0], this.hsva[1], this.hsva[2], 1 - a];
        }
        if (newhsva[0] !== this._hsva[0] ||
            newhsva[1] !== this._hsva[1] ||
            newhsva[2] !== this._hsva[2] ||
            newhsva[3] !== this._hsva[3]) {
            this.hsva = newhsva;
            this.emit('changing', this.color);
        }
    }
    _onMouseUp(evt) {
        window.removeEventListener('mousemove', this.moveHandler);
        window.removeEventListener('mouseup', this.upHandler);
        if (this._storeHsva[0] !== this._hsva[0] ||
            this._storeHsva[1] !== this._hsva[1] ||
            this._storeHsva[2] !== this._hsva[2] ||
            this._storeHsva[3] !== this._hsva[3]) {
            this.colorSelectedAnchor(this.color);
        }
    }
    set hsva(hsva) {
        const rgb = (0,_Math_color_value_mjs__WEBPACK_IMPORTED_MODULE_9__._hsv2rgb)(hsva);
        const hueRgb = (0,_Math_color_value_mjs__WEBPACK_IMPORTED_MODULE_9__._hsv2rgb)([hsva[0], 1, 1]);
        // regenerate gradient canvas if hue changes
        if (hsva[0] !== this._hsva[0]) {
            this._generateGradient(this._colorRect, hueRgb);
        }
        const e = this._colorRect.dom;
        const r = e.getBoundingClientRect();
        const w = r.width - 2;
        const h = r.height - 2;
        this._colorHandle.style.backgroundColor = this.Helpers.rgbaStr(rgb);
        this._colorHandle.style.left = e.offsetLeft - 7 + Math.floor(w * hsva[1]) + 'px';
        this._colorHandle.style.top = e.offsetTop - 7 + Math.floor(h * (1 - hsva[2])) + 'px';
        this._hueHandle.style.backgroundColor = this.Helpers.rgbaStr(hueRgb);
        this._hueHandle.style.top = e.offsetTop - 3 + Math.floor(140 * hsva[0]) + 'px';
        this._hueHandle.style.left = '162px';
        this._alphaHandle.style.backgroundColor = this.Helpers.rgbaStr((0,_Math_color_value_mjs__WEBPACK_IMPORTED_MODULE_9__._hsv2rgb)([0, 0, hsva[3]]));
        this._alphaHandle.style.top = e.offsetTop - 3 + Math.floor(140 * (1 - hsva[3])) + 'px';
        this._alphaHandle.style.left = '194px';
        this._changing = true;
        this._rField.value = rgb[0];
        this._gField.value = rgb[1];
        this._bField.value = rgb[2];
        this._aField.value = Math.round(hsva[3] * 255);
        this._hexField.value = this.Helpers.hexStr(rgb);
        this._changing = false;
        this._hsva = hsva;
    }
    get hsva() {
        return this._hsva;
    }
    set color(clr) {
        const hsva = this.Helpers.toHsva(clr);
        if (hsva[0] === 0 && hsva[1] === 0 && this._hsva[0] !== -1) {
            // if the incoming RGB is a shade of grey (without hue),
            // use the current active hue instead.
            hsva[0] = this._hsva[0];
        }
        this.hsva = hsva;
    }
    get color() {
        return this.Helpers.toRgba(this._hsva);
    }
    set editAlpha(editAlpha) {
        if (editAlpha) {
            this._alphaRect.dom.style.display = 'inline';
            this._alphaHandle.style.display = 'block';
            this._aField.dom.style.display = 'inline-block';
        }
        else {
            this._alphaRect.dom.style.display = 'none';
            this._alphaHandle.style.display = 'none';
            this._aField.dom.style.display = 'none';
        }
    }
    get editAlpha() {
        return this.editAlpha;
    }
    // open the picker
    open() {
        this.UI.overlay.hidden = false;
    }
    // close the picker
    close() {
        this.UI.overlay.hidden = true;
    }
    // handle the picker being opened
    onOpen() {
        window.addEventListener('mousemove', this._onAnchorsMouseMove);
        window.addEventListener('mouseup', this._onAnchorsMouseUp);
        this.UI.anchors.dom.addEventListener('mousedown', this._onAnchorsMouseDown);
        // editor.emit('picker:gradient:open');
        // editor.emit('picker:open', 'gradient');
    }
    // handle the picker being closed
    onClose() {
        this.STATE.hoveredAnchor = -1;
        window.removeEventListener('mousemove', this._onAnchorsMouseMove);
        window.removeEventListener('mouseup', this._onAnchorsMouseUp);
        this.UI.anchors.dom.removeEventListener('mousedown', this._onAnchorsMouseDown);
        this._evtRefreshPicker.unbind();
        this._evtRefreshPicker = null;
        this._evtPickerChanged.unbind();
        this._evtPickerChanged = null;
    }
    onDeleteKey() {
        if (!this.UI.overlay.hidden) {
            if (this.STATE.selectedAnchor !== -1) {
                const deleteTime = this.STATE.anchors[this.STATE.selectedAnchor];
                this.STATE.selectedAnchor = -1;
                this.deleteAnchor(deleteTime);
            }
        }
    }
    _onTypeChanged(value) {
        value = this.STATE.typeMap[value];
        const paths = [];
        const values = [];
        for (let i = 0; i < this.STATE.curves.length; ++i) {
            paths.push(i.toString() + '.type');
            values.push(value);
        }
        this.emit('picker:curve:change', paths, values);
    }
    render() {
        this.renderGradient();
        this.renderAnchors();
    }
    renderGradient() {
        const ctx = this.UI.gradient.dom.getContext('2d');
        const w = this.UI.gradient.width;
        const h = this.UI.gradient.height;
        const r = this.UI.gradient.pixelRatio;
        ctx.setTransform(r, 0, 0, r, 0, 0);
        // fill background
        ctx.fillStyle = this.UI.checkerPattern;
        ctx.fillRect(0, 0, w, h);
        // fill gradient
        const gradient = ctx.createLinearGradient(0, 0, w, 0);
        for (let t = 0; t <= w; t += 2) {
            const x = t / w;
            gradient.addColorStop(x, this.Helpers.rgbaStr(this.evaluateGradient(x), 255));
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        // render the tip of the selected anchor
        if (this.STATE.selectedAnchor !== -1) {
            const time = this.STATE.anchors[this.STATE.selectedAnchor];
            const coords = [time * w, h];
            const rectHeight = this.UI.draggingAnchor ? -30 : -6;
            ctx.beginPath();
            ctx.rect(coords[0] - 0.5, coords[1], 1, rectHeight);
            ctx.fillStyle = 'rgb(41, 53, 56)';
            ctx.fill();
        }
    }
    renderAnchors() {
        const ctx = this.UI.anchors.dom.getContext('2d');
        const w = this.UI.anchors.width;
        const h = this.UI.anchors.height;
        const r = this.UI.anchors.pixelRatio;
        ctx.setTransform(r, 0, 0, r, 0, 0);
        ctx.fillStyle = this.CONSTANTS.bg;
        ctx.fillRect(0, 0, w, h);
        // render plain anchors
        for (let index = 0; index < this.STATE.anchors.length; ++index) {
            if (index !== this.STATE.hoveredAnchor &&
                index !== this.STATE.selectedAnchor) {
                this.renderAnchor(ctx, this.STATE.anchors[index]);
            }
        }
        if ((this.STATE.hoveredAnchor !== -1) &&
            (this.STATE.hoveredAnchor !== this.STATE.selectedAnchor)) {
            this.renderAnchor(ctx, this.STATE.anchors[this.STATE.hoveredAnchor], "hovered");
        }
        if (this.STATE.selectedAnchor !== -1) {
            this.renderAnchor(ctx, this.STATE.anchors[this.STATE.selectedAnchor], "selected");
        }
    }
    renderAnchor(ctx, time, type) {
        const coords = [time * this.UI.anchors.width, this.UI.anchors.height / 2];
        const radius = (type === "selected" ? this.CONSTANTS.selectedRadius : this.CONSTANTS.anchorRadius);
        // render selected arrow
        if (type === "selected") {
            ctx.beginPath();
            ctx.rect(coords[0] - 0.5, coords[1], 1, -coords[1]);
            ctx.fillStyle = 'rgb(41, 53, 56)';
            ctx.fill();
        }
        // render selection highlight
        if (type === "selected" || type === "hovered") {
            ctx.beginPath();
            ctx.arc(coords[0], coords[1], (radius + 2), 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(coords[0], coords[1], (radius + 1), 0, 2 * Math.PI, false);
        ctx.fillStyle = this.Helpers.rgbaStr(this.evaluateGradient(time, 1), 255);
        ctx.fill();
    }
    evaluateGradient(time, alphaOverride) {
        const result = [];
        for (let i = 0; i < 3; ++i) {
            result.push(this.STATE.curves[i].value(time));
        }
        if (alphaOverride) {
            result.push(alphaOverride);
        }
        else if (this.STATE.curves.length > 3) {
            result.push(this.STATE.curves[3].value(time));
        }
        else {
            result.push(1);
        }
        return result;
    }
    calcAnchorTimes() {
        // get curve anchor points
        let times = [];
        for (let i = 0; i < this.STATE.curves.length; i++) {
            const curve = this.STATE.curves[i];
            for (let j = 0; j < curve.keys.length; ++j) {
                times.push(curve.keys[j][0]);
            }
        }
        // sort anchors and remove duplicates
        times.sort();
        times = times.filter(function (item, pos, ary) {
            return !pos || item !== ary[pos - 1];
        });
        return times;
    }
    // helper function for calculating the normalized coordinate
    // x,y relative to rect
    calcNormalizedCoord(x, y, rect) {
        return [(x - rect.left) / rect.width,
            (y - rect.top) / rect.height];
    }
    // get the bounding client rect minus padding
    getClientRect(element) {
        const styles = window.getComputedStyle(element);
        const paddingTop = parseFloat(styles.paddingTop);
        const paddingRight = parseFloat(styles.paddingRight);
        const paddingBottom = parseFloat(styles.paddingBottom);
        const paddingLeft = parseFloat(styles.paddingLeft);
        const rect = element.getBoundingClientRect();
        return new DOMRect(rect.x + paddingLeft, rect.y + paddingTop, rect.width - paddingRight - paddingLeft, rect.height - paddingTop - paddingBottom);
    }
    selectHovered(index) {
        this.STATE.hoveredAnchor = index;
        this.UI.anchors.dom.style.cursor = (index === -1 ? '' : 'pointer');
    }
    selectAnchor(index) {
        this.STATE.selectedAnchor = index;
        this.STATE.changing = true;
        if (index === -1) {
            this.UI.positionEdit.value = "";
            this.color = [0, 0, 0];
        }
        else {
            const time = this.STATE.anchors[index];
            this.UI.positionEdit.value = Math.round(time * 100);
            this.STATE.selectedValue = this.evaluateGradient(time);
            this.color = this.STATE.selectedValue;
            this.UI.showSelectedPosition.dom.style.left = (this.STATE.anchors[index] * this.UI.gradient.width - 4).toString() + "px";
            this.UI.showSelectedPosition.value = Math.round(this.STATE.anchors[index] * 100);
        }
        this.STATE.changing = false;
        this.render();
    }
    dragStart() {
        if (this.STATE.selectedAnchor === -1) {
            return;
        }
        const time = this.STATE.anchors[this.STATE.selectedAnchor];
        // make a copy of the curve data before editing starts
        this.STATE.keystore = [];
        for (let i = 0; i < this.STATE.curves.length; ++i) {
            const keys = [];
            this.STATE.curves[i].keys.forEach(function (element) {
                if (element[0] !== time) {
                    keys.push([element[0], element[1]]);
                }
            });
            this.STATE.keystore.push(keys);
        }
    }
    dragUpdate(time) {
        if (this.STATE.selectedAnchor === -1) {
            return;
        }
        for (let i = 0; i < this.STATE.curves.length; ++i) {
            const curve = this.STATE.curves[i];
            const keystore = this.STATE.keystore[i];
            // merge keystore with the drag anchor (ignoring existing anchors at
            // the current anchor location)
            curve.keys = keystore.map(function (element) {
                return [element[0], element[1]];
            })
                .filter(function (element) {
                return element[0] !== time;
            });
            curve.keys.push([time, this.STATE.selectedValue[i]]);
            curve.sort();
        }
        this.STATE.anchors = this.calcAnchorTimes();
        this.selectAnchor(this.STATE.anchors.indexOf(time));
    }
    dragEnd() {
        if (this.STATE.selectedAnchor !== -1) {
            this.emitCurveChange();
        }
    }
    // insert an anchor at the given time with the given color
    insertAnchor(time, color) {
        for (let i = 0; i < this.STATE.curves.length; ++i) {
            const keys = this.STATE.curves[i].keys;
            let j = 0;
            while (j < keys.length) {
                if (keys[j][0] >= time) {
                    break;
                }
                ++j;
            }
            if (j < keys.length && keys[j][0] === time) {
                keys[j][1] = color[i];
            }
            else {
                keys.splice(j, 0, [time, color[i]]);
            }
        }
        this.emitCurveChange();
    }
    // delete the anchor(s) at the given time
    deleteAnchor(time) {
        for (let i = 0; i < this.STATE.curves.length; ++i) {
            const curve = this.STATE.curves[i];
            for (let j = 0; j < curve.keys.length; ++j) {
                if (curve.keys[j][0] === time) {
                    curve.keys.splice(j, 1);
                    break;
                }
            }
        }
        this.selectHovered(-1);
        this.emitCurveChange();
    }
    moveSelectedAnchor(time) {
        if (this.STATE.selectedAnchor !== -1) {
            this.dragStart();
            this.dragUpdate(time);
            this.dragEnd();
        }
    }
    colorSelectedAnchor(clr, dragging) {
        if (this.STATE.selectedAnchor !== -1) {
            const time = this.STATE.anchors[this.STATE.selectedAnchor];
            for (let i = 0; i < this.STATE.curves.length; ++i) {
                const curve = this.STATE.curves[i];
                for (let j = 0; j < curve.keys.length; ++j) {
                    if (curve.keys[j][0] === time) {
                        curve.keys[j][1] = clr[i];
                        break;
                    }
                }
            }
            this.STATE.selectedValue = clr;
            if (dragging) {
                this.render();
            }
            else {
                this.emitCurveChange();
            }
        }
    }
    emitCurveChange() {
        const paths = [];
        const values = [];
        this.STATE.curves.forEach(function (curve, index) {
            paths.push('0.keys.' + index);
            const keys = [];
            curve.keys.forEach(function (key) {
                keys.push(key[0], key[1]);
            });
            values.push(keys);
        });
        this.emit('picker:curve:change', paths, values);
    }
    doCopy() {
        const data = {
            type: this.STATE.curves[0].type,
            keys: this.STATE.curves.map(function (c) {
                return [].concat(...c.keys);
            })
        };
        this._copiedData = data;
    }
    doPaste() {
        const data = this._copiedData;
        if (data !== null) {
            // only paste the number of curves we're currently editing
            const pasteData = {
                type: data.type,
                keys: []
            };
            for (let index = 0; index < this.STATE.curves.length; ++index) {
                if (index < data.keys.length) {
                    pasteData.keys.push(data.keys[index]);
                }
                else {
                    pasteData.keys.push([].concat(...this.STATE.curves[index].keys));
                }
            }
            this.setValue([pasteData]);
            this.emitCurveChange();
        }
    }
    doDelete() {
        const toDelete = this.STATE.selectedAnchor;
        if (toDelete === -1 || this.STATE.curves[0].keys.length === 1) {
            return;
        }
        for (let i = 0; i < this.STATE.curves.length; ++i) {
            const keys = this.STATE.curves[i].keys;
            keys.splice(toDelete, 1);
        }
        this.emitCurveChange();
    }
    createCheckerPattern() {
        const canvas = new _Canvas_index_mjs__WEBPACK_IMPORTED_MODULE_7__["default"]();
        canvas.width = 16;
        canvas.height = 16;
        const canvasElement = canvas.dom;
        const ctx = canvasElement.getContext('2d');
        ctx.fillStyle = "#949a9c";
        ctx.fillRect(0, 0, 8, 8);
        ctx.fillRect(8, 8, 8, 8);
        ctx.fillStyle = "#657375";
        ctx.fillRect(8, 0, 8, 8);
        ctx.fillRect(0, 8, 8, 8);
        return ctx.createPattern(canvasElement, 'repeat');
    }
    setValue(value, args) {
        // sanity checks mostly for script 'curve' attributes
        if (!(value instanceof Array) ||
            value.length !== 1 ||
            value[0].keys === undefined ||
            (value[0].keys.length !== 3 && value[0].keys.length !== 4))
            return;
        this.STATE.typeMap = {
            0: CURVE_STEP,
            1: CURVE_LINEAR,
            2: CURVE_SPLINE
        };
        const indexMap = Object.fromEntries(Object
            .entries(this.STATE.typeMap)
            .map(([key, value]) => [value, key]));
        // check if curve is using a legacy curve type
        if (value[0].type !== CURVE_STEP &&
            value[0].type !== CURVE_LINEAR &&
            value[0].type !== CURVE_SPLINE) {
            this.STATE.typeMap[3] = value[0].type;
        }
        this.UI.typeCombo.options = [{ v: 0, t: 'Step' }, { v: 1, t: 'Linear' }, { v: 2, t: 'Spline' }];
        this.UI.typeCombo.value = this.UI.typeCombo.value === -1 ? indexMap[this.value.type] : this.UI.typeCombo.value;
        // store the curves
        this.STATE.curves = [];
        value[0].keys.forEach((keys) => {
            const curve = new _node_modules_playcanvas_build_playcanvas_mjs_core_math_curve_mjs__WEBPACK_IMPORTED_MODULE_12__.Curve(keys);
            curve.type = value[0].type;
            this.STATE.curves.push(curve);
        });
        // calculate the anchor times
        this.STATE.anchors = this.calcAnchorTimes();
        // select the anchor
        if (this.STATE.anchors.length === 0) {
            this.selectAnchor(-1);
        }
        else {
            this.selectAnchor(_node_modules_playcanvas_build_playcanvas_mjs_core_math_math_mjs__WEBPACK_IMPORTED_MODULE_10__.math.clamp(this.STATE.selectedAnchor, 0, this.STATE.anchors.length - 1));
        }
        this.editAlpha = this.STATE.curves.length > 3;
    }
    callOpenGradientPicker(value, args) {
        this.setValue(value, args);
        this.open();
    }
    getGradientPickerRect() {
        return this.UI.overlay.dom.getBoundingClientRect();
    }
    positionGradientPicker(x, y) {
        if (y + this.UI.panel.clientHeight > window.innerHeight) {
            y = window.innerHeight - this.UI.panel.clientHeight;
        }
        this.UI.overlay.position(x, y);
    }
    setGradientPicker(value, args) {
        this.setValue(value, args);
    }
}
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"].register('div', GradientPicker);
var GradientPicker$1 = GradientPicker;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/GridView/index.mjs":
/*!*************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/GridView/index.mjs ***!
  \*************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ GridView$1)
/* harmony export */ });
/* harmony import */ var _Container_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Container/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Container/index.mjs");
/* harmony import */ var _GridViewItem_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../GridViewItem/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/GridViewItem/index.mjs");



const CLASS_ROOT = 'pcui-gridview';
const CLASS_VERTICAL = CLASS_ROOT + '-vertical';
/**
 * Represents a container that shows a flexible wrappable list of items that looks like a grid.
 * Contains {@link GridViewItem}s.
 */
class GridView extends _Container_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(args = {}) {
        var _a, _b;
        super(args);
        this._filterAnimationFrame = null;
        this._filterCanceled = false;
        this._selected = [];
        this._vertical = !!args.vertical;
        this.class.add(this._vertical ? CLASS_VERTICAL : CLASS_ROOT);
        this.on('append', (element) => {
            this._onAppendGridViewItem(element);
        });
        this.on('remove', (element) => {
            this._onRemoveGridViewItem(element);
        });
        this._filterFn = args.filterFn;
        // Default options for GridView layout
        this._multiSelect = (_a = args.multiSelect) !== null && _a !== void 0 ? _a : true;
        this._allowDeselect = (_b = args.allowDeselect) !== null && _b !== void 0 ? _b : true;
    }
    _onAppendGridViewItem(item) {
        if (!(item instanceof _GridViewItem_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]))
            return;
        let evtClick;
        if (this._clickFn)
            evtClick = item.on('click', evt => this._clickFn(evt, item));
        else
            evtClick = item.on('click', evt => this._onClickItem(evt, item));
        let evtSelect = item.on('select', () => this._onSelectItem(item));
        let evtDeselect;
        if (this._allowDeselect)
            evtDeselect = item.on('deselect', () => this._onDeselectItem(item));
        if (this._filterFn && !this._filterFn(item)) {
            item.hidden = true;
        }
        item.once('griditem:remove', () => {
            evtClick.unbind();
            evtClick = null;
            evtSelect.unbind();
            evtSelect = null;
            if (this._allowDeselect) {
                evtDeselect.unbind();
                evtDeselect = null;
            }
        });
    }
    _onRemoveGridViewItem(item) {
        if (!(item instanceof _GridViewItem_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]))
            return;
        item.selected = false;
        item.emit('griditem:remove');
        item.unbind('griditem:remove');
    }
    _onClickItem(evt, item) {
        if ((evt.ctrlKey || evt.metaKey) && this._multiSelect) {
            item.selected = !item.selected;
        }
        else if (evt.shiftKey && this._multiSelect) {
            const lastSelected = this._selected[this._selected.length - 1];
            if (lastSelected) {
                const comparePosition = lastSelected.dom.compareDocumentPosition(item.dom);
                if (comparePosition & Node.DOCUMENT_POSITION_FOLLOWING) {
                    let sibling = lastSelected.nextSibling;
                    while (sibling) {
                        sibling.selected = true;
                        if (sibling === item)
                            break;
                        sibling = sibling.nextSibling;
                    }
                }
                else {
                    let sibling = lastSelected.previousSibling;
                    while (sibling) {
                        sibling.selected = true;
                        if (sibling === item)
                            break;
                        sibling = sibling.previousSibling;
                    }
                }
            }
            else {
                item.selected = true;
            }
        }
        else {
            let othersSelected = false;
            let i = this._selected.length;
            while (i--) {
                if (this._selected[i] && this._selected[i] !== item) {
                    this._selected[i].selected = false;
                    othersSelected = true;
                }
            }
            if (othersSelected) {
                item.selected = true;
            }
            else {
                item.selected = !item.selected;
            }
        }
    }
    _onSelectItem(item) {
        this._selected.push(item);
        this.emit('select', item);
    }
    _onDeselectItem(item) {
        const index = this._selected.indexOf(item);
        if (index !== -1) {
            this._selected.splice(index, 1);
            this.emit('deselect', item);
        }
    }
    /**
     * Deselects all selected grid view items.
     */
    deselect() {
        let i = this._selected.length;
        while (i--) {
            if (this._selected[i]) {
                this._selected[i].selected = false;
            }
        }
    }
    /**
     * Filters grid view items with the filter function provided in the constructor.
     */
    filter() {
        this.forEachChild((child) => {
            if (child instanceof _GridViewItem_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]) {
                child.hidden = this._filterFn && !this._filterFn(child);
            }
        });
    }
    /**
     * Filters grid view items asynchronously by only allowing up to the specified number of grid
     * view item operations. Fires the following events:
     *
     * - filter:start - When filtering starts.
     * - filter:end - When filtering ends.
     * - filter:delay - When an animation frame is requested to process another batch.
     * - filter:cancel - When filtering is canceled.
     *
     * @param batchLimit - The maximum number of items to show before requesting another animation frame.
     */
    filterAsync(batchLimit = 100) {
        let i = 0;
        const children = this.dom.childNodes;
        const len = children.length;
        this.emit('filter:start');
        this._filterCanceled = false;
        const next = () => {
            this._filterAnimationFrame = null;
            let visible = 0;
            for (; i < len && visible < batchLimit; i++) {
                if (this._filterCanceled) {
                    this._filterCanceled = false;
                    this.emit('filter:cancel');
                    return;
                }
                const child = children[i].ui;
                if (child instanceof _GridViewItem_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]) {
                    if (this._filterFn && !this._filterFn(child)) {
                        child.hidden = true;
                    }
                    else {
                        child.hidden = false;
                        visible++;
                    }
                }
            }
            if (i < len) {
                this.emit('filter:delay');
                this._filterAnimationFrame = requestAnimationFrame(next);
            }
            else {
                this.emit('filter:end');
            }
        };
        next();
    }
    /**
     * Cancels asynchronous filtering.
     */
    filterAsyncCancel() {
        if (this._filterAnimationFrame) {
            cancelAnimationFrame(this._filterAnimationFrame);
            this._filterAnimationFrame = null;
        }
        else {
            this._filterCanceled = true;
        }
    }
    destroy() {
        if (this._destroyed)
            return;
        if (this._filterAnimationFrame) {
            cancelAnimationFrame(this._filterAnimationFrame);
            this._filterAnimationFrame = null;
        }
        super.destroy();
    }
    /**
     * Gets the selected GridViewItems.
     */
    get selected() {
        return this._selected.slice();
    }
    /**
     * Gets whether the grid layout is vertical or not.
     */
    get vertical() {
        return this._vertical;
    }
}
var GridView$1 = GridView;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/GridViewItem/index.mjs":
/*!*****************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/GridViewItem/index.mjs ***!
  \*****************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ GridViewItem$1)
/* harmony export */ });
/* harmony import */ var _Container_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Container/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Container/index.mjs");
/* harmony import */ var _Label_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Label/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Label/index.mjs");
/* harmony import */ var _binding_BindingObserversToElement_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../binding/BindingObserversToElement/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/binding/BindingObserversToElement/index.mjs");
/* harmony import */ var _RadioButton_index_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../RadioButton/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/RadioButton/index.mjs");





const CLASS_ROOT = 'pcui-gridview-item';
const CLASS_ROOT_RADIO = 'pcui-gridview-radio-container';
const CLASS_SELECTED = CLASS_ROOT + '-selected';
const CLASS_TEXT = CLASS_ROOT + '-text';
const CLASS_RADIO_BUTTON = 'pcui-gridview-radiobtn';
/**
 *  Represents a grid view item used in {@link GridView}.
 */
class GridViewItem extends _Container_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(args = {}) {
        var _a, _b, _c;
        super(Object.assign({ tabIndex: 0 }, args));
        this._onRadioButtonClick = () => {
            this._radioButton.value = this.selected;
        };
        this._onFocus = () => {
            this.emit('focus');
        };
        this._onBlur = () => {
            this.emit('blur');
        };
        this.allowSelect = (_a = args.allowSelect) !== null && _a !== void 0 ? _a : true;
        this._type = (_b = args.type) !== null && _b !== void 0 ? _b : null;
        this._selected = false;
        if (args.type === 'radio') {
            this.class.add(CLASS_ROOT_RADIO);
            this._radioButton = new _RadioButton_index_mjs__WEBPACK_IMPORTED_MODULE_3__["default"]({
                class: CLASS_RADIO_BUTTON,
                binding: new _binding_BindingObserversToElement_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]()
            });
            // @ts-ignore Remove radio button click event listener
            this._radioButton.dom.removeEventListener('click', this._radioButton._onClick);
            this._radioButton.dom.addEventListener('click', this._onRadioButtonClick);
            this.append(this._radioButton);
        }
        else {
            this.class.add(CLASS_ROOT);
        }
        this._labelText = new _Label_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]({
            class: CLASS_TEXT,
            binding: new _binding_BindingObserversToElement_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"](),
            text: (_c = args.text) !== null && _c !== void 0 ? _c : ''
        });
        this.append(this._labelText);
        this.dom.addEventListener('focus', this._onFocus);
        this.dom.addEventListener('blur', this._onBlur);
    }
    destroy() {
        if (this._destroyed)
            return;
        this.dom.removeEventListener('focus', this._onFocus);
        this.dom.removeEventListener('blur', this._onBlur);
        super.destroy();
    }
    focus() {
        this.dom.focus();
    }
    blur() {
        this.dom.blur();
    }
    link(observers, paths) {
        this._labelText.link(observers, paths);
    }
    unlink() {
        this._labelText.unlink();
    }
    /**
     * If `true` allow selecting the item. Defaults to `true`.
     */
    set allowSelect(value) {
        this._allowSelect = value;
    }
    get allowSelect() {
        return this._allowSelect;
    }
    /**
     * Whether the item is selected.
     */
    set selected(value) {
        if (value) {
            this.focus();
        }
        if (this._selected === value)
            return;
        this._selected = value;
        if (value) {
            // Update radio button if it exists
            if (this._radioButton)
                this._radioButton.value = value;
            else
                this.class.add(CLASS_SELECTED);
            this.emit('select', this);
        }
        else {
            // Update radio button if it exists
            if (this._radioButton)
                this._radioButton.value = false;
            else
                this.class.remove(CLASS_SELECTED);
            this.emit('deselect', this);
        }
    }
    get selected() {
        return this._selected;
    }
    /**
     * The text of the item.
     */
    set text(value) {
        this._labelText.text = value;
    }
    get text() {
        return this._labelText.text;
    }
    /**
     * Returns the next visible sibling grid view item.
     */
    get nextSibling() {
        let sibling = this.dom.nextSibling;
        while (sibling) {
            if (sibling.ui instanceof GridViewItem && !sibling.ui.hidden) {
                return sibling.ui;
            }
            sibling = sibling.nextSibling;
        }
        return null;
    }
    /**
     * Returns the previous visible sibling grid view item.
     */
    get previousSibling() {
        let sibling = this.dom.previousSibling;
        while (sibling) {
            if (sibling.ui instanceof GridViewItem && !sibling.ui.hidden) {
                return sibling.ui;
            }
            sibling = sibling.previousSibling;
        }
        return null;
    }
}
var GridViewItem$1 = GridViewItem;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/InfoBox/index.mjs":
/*!************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/InfoBox/index.mjs ***!
  \************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ InfoBox$1)
/* harmony export */ });
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");
/* harmony import */ var _Container_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Container/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Container/index.mjs");



const CLASS_INFOBOX = 'pcui-infobox';
/**
 * Represents an information box.
 */
class InfoBox extends _Container_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"] {
    constructor(args = {}) {
        var _a, _b, _c, _d;
        super(args);
        this._titleElement = new _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"]();
        this._textElement = new _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"]();
        this.class.add(CLASS_INFOBOX);
        this.append(this._titleElement);
        this.append(this._textElement);
        this._unsafe = (_a = args.unsafe) !== null && _a !== void 0 ? _a : false;
        this.icon = (_b = args.icon) !== null && _b !== void 0 ? _b : '';
        this.title = (_c = args.title) !== null && _c !== void 0 ? _c : '';
        this.text = (_d = args.text) !== null && _d !== void 0 ? _d : '';
    }
    /**
     * Sets the icon of the info box.
     */
    set icon(value) {
        if (this._icon === value)
            return;
        this._icon = value;
        if (value) {
            // set data-icon attribute but first convert the value to a code point
            this.dom.setAttribute('data-icon', String.fromCodePoint(parseInt(value, 16)));
        }
        else {
            this.dom.removeAttribute('data-icon');
        }
    }
    get icon() {
        return this._icon;
    }
    /**
     * Sets the title of the info box.
     */
    set title(value) {
        if (this._title === value)
            return;
        this._title = value;
        if (this._unsafe) {
            this._titleElement.dom.innerHTML = value;
        }
        else {
            this._titleElement.dom.textContent = value;
        }
    }
    get title() {
        return this._title;
    }
    /**
     * Sets the text of the info box.
     */
    set text(value) {
        if (this._text === value)
            return;
        this._text = value;
        if (this._unsafe) {
            this._textElement.dom.innerHTML = value;
        }
        else {
            this._textElement.dom.textContent = value;
        }
    }
    get text() {
        return this._text;
    }
}
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"].register('infobox', InfoBox);
var InfoBox$1 = InfoBox;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/InputElement/index.mjs":
/*!*****************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/InputElement/index.mjs ***!
  \*****************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ InputElement$1)
/* harmony export */ });
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");
/* harmony import */ var _class_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../class.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/class.mjs");



const CLASS_INPUT_ELEMENT = 'pcui-input-element';
/**
 * The InputElement is an abstract class that manages an input DOM element. It is the superclass of
 * {@link TextInput} and {@link NumericInput}. It is not intended to be used directly.
 */
class InputElement extends _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(args = {}) {
        var _a, _b, _c, _d, _e;
        super(args);
        this._onInputFocus = (evt) => {
            this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.FOCUS);
            this.emit('focus', evt);
            this._prevValue = this._domInput.value;
        };
        this._onInputBlur = (evt) => {
            this.class.remove(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.FOCUS);
            this.emit('blur', evt);
        };
        this._onInputKeyUp = (evt) => {
            if (evt.key !== 'Escape') {
                this._onInputChange(evt);
            }
            this.emit('keyup', evt);
        };
        this._onInputCtxMenu = (evt) => {
            this._domInput.select();
        };
        this._updateInputReadOnly = () => {
            const readOnly = !this.enabled || this.readOnly;
            if (readOnly) {
                this._domInput.setAttribute('readonly', 'true');
            }
            else {
                this._domInput.removeAttribute('readonly');
            }
        };
        this.class.add(CLASS_INPUT_ELEMENT);
        let input = args.input;
        if (!input) {
            input = document.createElement('input');
            input.type = 'text';
        }
        input.ui = this;
        input.tabIndex = 0;
        input.autocomplete = "off";
        this._onInputKeyDownEvt = this._onInputKeyDown.bind(this);
        this._onInputChangeEvt = this._onInputChange.bind(this);
        input.addEventListener('change', this._onInputChangeEvt);
        input.addEventListener('keydown', this._onInputKeyDownEvt);
        input.addEventListener('focus', this._onInputFocus);
        input.addEventListener('blur', this._onInputBlur);
        input.addEventListener('contextmenu', this._onInputCtxMenu, false);
        this.dom.appendChild(input);
        this._domInput = input;
        this._suspendInputChangeEvt = false;
        if (args.value !== undefined) {
            this._domInput.value = args.value;
        }
        this.placeholder = (_a = args.placeholder) !== null && _a !== void 0 ? _a : '';
        this.renderChanges = (_b = args.renderChanges) !== null && _b !== void 0 ? _b : false;
        this.blurOnEnter = (_c = args.blurOnEnter) !== null && _c !== void 0 ? _c : true;
        this.blurOnEscape = (_d = args.blurOnEscape) !== null && _d !== void 0 ? _d : true;
        this.keyChange = (_e = args.keyChange) !== null && _e !== void 0 ? _e : false;
        this._prevValue = null;
        this.on('change', () => {
            if (this.renderChanges) {
                this.flash();
            }
        });
        this.on('disable', this._updateInputReadOnly);
        this.on('enable', this._updateInputReadOnly);
        this.on('readOnly', this._updateInputReadOnly);
        this._updateInputReadOnly();
    }
    destroy() {
        if (this._destroyed)
            return;
        const input = this._domInput;
        input.removeEventListener('change', this._onInputChangeEvt);
        input.removeEventListener('keydown', this._onInputKeyDownEvt);
        input.removeEventListener('focus', this._onInputFocus);
        input.removeEventListener('blur', this._onInputBlur);
        input.removeEventListener('keyup', this._onInputKeyUp);
        input.removeEventListener('contextmenu', this._onInputCtxMenu);
        super.destroy();
    }
    _onInputKeyDown(evt) {
        if (evt.key === 'Enter' && this.blurOnEnter) {
            // do not fire input change event on blur
            // if keyChange is true (because a change event)
            // will have already been fired before for the current
            // value
            this._suspendInputChangeEvt = this.keyChange;
            this._domInput.blur();
            this._suspendInputChangeEvt = false;
        }
        else if (evt.key === 'Escape') {
            this._suspendInputChangeEvt = true;
            const prev = this._domInput.value;
            this._domInput.value = this._prevValue;
            this._suspendInputChangeEvt = false;
            // manually fire change event
            if (this.keyChange && prev !== this._prevValue) {
                this._onInputChange(evt);
            }
            if (this.blurOnEscape) {
                this._domInput.blur();
            }
        }
        this.emit('keydown', evt);
    }
    _onInputChange(evt) { }
    focus(select) {
        this._domInput.focus();
        if (select) {
            this._domInput.select();
        }
    }
    blur() {
        this._domInput.blur();
    }
    set placeholder(value) {
        if (value) {
            this.dom.setAttribute('placeholder', value);
        }
        else {
            this.dom.removeAttribute('placeholder');
        }
    }
    get placeholder() {
        var _a;
        return (_a = this.dom.getAttribute('placeholder')) !== null && _a !== void 0 ? _a : '';
    }
    /**
     * Gets / sets the method to call when keyup is called on the input DOM element.
     */
    set keyChange(value) {
        if (this._keyChange === value)
            return;
        this._keyChange = value;
        if (value) {
            this._domInput.addEventListener('keyup', this._onInputKeyUp);
        }
        else {
            this._domInput.removeEventListener('keyup', this._onInputKeyUp);
        }
    }
    get keyChange() {
        return this._keyChange;
    }
    /**
     * Gets the input DOM element.
     */
    get input() {
        return this._domInput;
    }
    /**
     * Gets / sets whether the input should blur when the enter key is pressed.
     */
    set blurOnEnter(value) {
        this._blurOnEnter = value;
    }
    get blurOnEnter() {
        return this._blurOnEnter;
    }
    /**
     * Gets / sets whether the input should blur when the escape key is pressed.
     */
    set blurOnEscape(value) {
        this._blurOnEscape = value;
    }
    get blurOnEscape() {
        return this._blurOnEscape;
    }
    set renderChanges(value) {
        this._renderChanges = value;
    }
    get renderChanges() {
        return this._renderChanges;
    }
}
var InputElement$1 = InputElement;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/Label/index.mjs":
/*!**********************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/Label/index.mjs ***!
  \**********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Label$1)
/* harmony export */ });
/* harmony import */ var _class_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../class.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/class.mjs");
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");



const CLASS_LABEL = 'pcui-label';
/**
 * The Label is a simple span element that displays some text.
 */
class Label extends _Element_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"] {
    constructor(args = {}) {
        var _a, _b, _c;
        super(Object.assign({ dom: 'span' }, args));
        this.class.add(CLASS_LABEL);
        this._unsafe = (_a = args.unsafe) !== null && _a !== void 0 ? _a : false;
        this.text = (_c = (_b = args.text) !== null && _b !== void 0 ? _b : args.value) !== null && _c !== void 0 ? _c : '';
        if (args.allowTextSelection) {
            this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_MOUSEDOWN);
        }
        if (args.nativeTooltip) {
            this.dom.title = this.text;
        }
        this.placeholder = args.placeholder;
        this.renderChanges = args.renderChanges;
        this.on('change', () => {
            if (this.renderChanges) {
                this.flash();
            }
        });
    }
    _updateText(value) {
        this.class.remove(_class_mjs__WEBPACK_IMPORTED_MODULE_0__.MULTIPLE_VALUES);
        if (this._text === value)
            return false;
        this._text = value;
        if (this._unsafe) {
            this._dom.innerHTML = value;
        }
        else {
            this._dom.textContent = value;
        }
        this.emit('change', value);
        return true;
    }
    /**
     * Gets / sets the text of the Label.
     */
    set text(value) {
        if (value === undefined || value === null) {
            value = '';
        }
        const changed = this._updateText(value);
        if (changed && this._binding) {
            this._binding.setValue(value);
        }
    }
    get text() {
        return this._text;
    }
    set value(value) {
        this.text = value;
    }
    get value() {
        return this.text;
    }
    /* eslint accessor-pairs: 0 */
    set values(values) {
        const different = values.some(v => v !== values[0]);
        if (different) {
            this._updateText('');
            this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_0__.MULTIPLE_VALUES);
        }
        else {
            this._updateText(values[0]);
        }
    }
    set placeholder(value) {
        if (value) {
            this.dom.setAttribute('placeholder', value);
        }
        else {
            this.dom.removeAttribute('placeholder');
        }
    }
    get placeholder() {
        return this.dom.getAttribute('placeholder');
    }
    set renderChanges(value) {
        this._renderChanges = value;
    }
    get renderChanges() {
        return this._renderChanges;
    }
}
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"].register('label', Label);
var Label$1 = Label;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/LabelGroup/index.mjs":
/*!***************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/LabelGroup/index.mjs ***!
  \***************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ LabelGroup$1)
/* harmony export */ });
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");
/* harmony import */ var _Container_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Container/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Container/index.mjs");
/* harmony import */ var _Label_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Label/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Label/index.mjs");




const CLASS_LABEL_GROUP = 'pcui-label-group';
const CLASS_LABEL_TOP = CLASS_LABEL_GROUP + '-align-top';
/**
 * Represents a group of an {@link Element} and a {@link Label}. Useful for rows of labeled fields.
 */
class LabelGroup extends _Container_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"] {
    constructor(args = {}) {
        var _a, _b;
        super(args);
        this.class.add(CLASS_LABEL_GROUP);
        this._label = new _Label_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]({
            text: (_a = args.text) !== null && _a !== void 0 ? _a : 'Label',
            nativeTooltip: args.nativeTooltip
        });
        this.append(this._label);
        this._field = (_b = args.field) !== null && _b !== void 0 ? _b : null;
        if (this._field) {
            this.append(this._field);
        }
        this.labelAlignTop = args.labelAlignTop;
    }
    /**
     * The label element.
     */
    get label() {
        return this._label;
    }
    /**
     * The field element.
     */
    get field() {
        return this._field;
    }
    /**
     * Sets / Gets the text of the label.
     */
    set text(value) {
        this._label.text = value;
    }
    get text() {
        return this._label.text;
    }
    /**
     * Sets / Gets whether to align the label at the top of the group. Defaults to `false` which aligns it at the center.
     */
    set labelAlignTop(value) {
        if (value) {
            this.class.add(CLASS_LABEL_TOP);
        }
        else {
            this.class.remove(CLASS_LABEL_TOP);
        }
    }
    get labelAlignTop() {
        return this.class.contains(CLASS_LABEL_TOP);
    }
}
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"].register('labelgroup', LabelGroup);
var LabelGroup$1 = LabelGroup;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/Menu/index.mjs":
/*!*********************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/Menu/index.mjs ***!
  \*********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Menu$1)
/* harmony export */ });
/* harmony import */ var _Container_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Container/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Container/index.mjs");
/* harmony import */ var _MenuItem_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../MenuItem/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/MenuItem/index.mjs");



const CLASS_MENU = 'pcui-menu';
const CLASS_MENU_ITEMS = CLASS_MENU + '-items';
/**
 * A Menu is a list of {@link MenuItem}s which can contain child MenuItems. Useful to show context
 * menus and nested menus. Note that a Menu must be appended to the root Element and then
 * positioned accordingly.
 */
class Menu extends _Container_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(args = {}) {
        var _a;
        super(Object.assign({ tabIndex: 1 }, args));
        this._onClickMenu = (evt) => {
            if (!this._containerMenuItems.dom.contains(evt.target)) {
                this.hidden = true;
            }
        };
        this._onFocus = (evt) => {
            this.emit('focus');
        };
        this._onBlur = (evt) => {
            this.emit('blur');
        };
        this._onKeyDown = (evt) => {
            if (this.hidden)
                return;
            if (evt.key === 'Escape') {
                this.hidden = true;
            }
        };
        this.hidden = (_a = args.hidden) !== null && _a !== void 0 ? _a : true;
        this.class.add(CLASS_MENU);
        this._containerMenuItems = new _Container_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"]({
            class: CLASS_MENU_ITEMS,
            flex: true,
            flexDirection: 'column'
        });
        this.append(this._containerMenuItems);
        this.domContent = this._containerMenuItems.dom;
        this.on('click', this._onClickMenu);
        this.on('show', () => {
            this._onShowMenu();
        });
        this.dom.addEventListener('contextmenu', this._onClickMenu);
        this.dom.addEventListener('keydown', this._onKeyDown);
        if (args.items) {
            args.items.forEach((item) => {
                const menuItem = new _MenuItem_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"](item);
                this.append(menuItem);
            });
        }
    }
    destroy() {
        if (this.destroyed)
            return;
        this.dom.removeEventListener('keydown', this._onKeyDown);
        this.dom.removeEventListener('contextmenu', this._onClickMenu);
        this.dom.removeEventListener('focus', this._onFocus);
        this.dom.removeEventListener('blur', this._onBlur);
        super.destroy();
    }
    _onAppendChild(element) {
        if (element instanceof _MenuItem_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]) {
            element.menu = this;
        }
    }
    _onRemoveChild(element) {
        if (element instanceof _MenuItem_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]) {
            element.menu = null;
        }
    }
    _filterMenuItems(item) {
        if (!(item instanceof _MenuItem_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]))
            return;
        if (item.onIsEnabled) {
            item.enabled = item.onIsEnabled();
        }
        if (item.onIsVisible) {
            item.hidden = !item.onIsVisible();
        }
        // @ts-ignore
        for (const child of item._containerItems.dom.childNodes) {
            this._filterMenuItems(child.ui);
        }
    }
    _onShowMenu() {
        this.focus();
        // filter child menu items
        for (const child of this._containerMenuItems.dom.childNodes) {
            this._filterMenuItems(child.ui);
        }
    }
    _limitSubmenuAtScreenEdges(item) {
        if (!(item instanceof _MenuItem_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]) || !item.hasChildren)
            return;
        // @ts-ignore
        const containerItems = item._containerItems;
        containerItems.style.top = '';
        containerItems.style.left = '';
        containerItems.style.right = '';
        const rect = containerItems.dom.getBoundingClientRect();
        // limit to bottom / top of screen
        if (rect.bottom > window.innerHeight) {
            containerItems.style.top = -(rect.bottom - window.innerHeight) + 'px';
        }
        if (rect.right > window.innerWidth) {
            containerItems.style.left = 'auto';
            containerItems.style.right = '100%';
        }
        for (const child of containerItems.dom.childNodes) {
            this._limitSubmenuAtScreenEdges(child.ui);
        }
    }
    focus() {
        this.dom.focus();
    }
    blur() {
        this.dom.blur();
    }
    /**
     * Positions the top-left corner of the menu at the specified coordinates.
     *
     * @param x - The x coordinate.
     * @param y - The y coordinate.
     * @example
     * ```ts
     * // open a context menu at the mouse position
     * window.addEventListener('contextmenu', (event) => {
     *     event.stopPropagation();
     *     event.preventDefault();
     *
     *     menu.hidden = false;
     *     menu.position(event.clientX, event.clientY);
     * });
     * ```
     */
    position(x, y) {
        const rect = this._containerMenuItems.dom.getBoundingClientRect();
        let left = (x || 0);
        let top = (y || 0);
        // limit to bottom / top of screen
        if (top + rect.height > window.innerHeight) {
            top = window.innerHeight - rect.height;
        }
        else if (top < 0) {
            top = 0;
        }
        if (left + rect.width > window.innerWidth) {
            left = window.innerWidth - rect.width;
        }
        else if (left < 0) {
            left = 0;
        }
        this._containerMenuItems.style.left = left + 'px';
        this._containerMenuItems.style.top = top + 'px';
        for (const child of this._containerMenuItems.dom.childNodes) {
            this._limitSubmenuAtScreenEdges(child.ui);
        }
    }
    /**
     * Remove all the current menu items from the menu.
     */
    clear() {
        this._containerMenuItems.clear();
    }
}
var Menu$1 = Menu;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/MenuItem/index.mjs":
/*!*************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/MenuItem/index.mjs ***!
  \*************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ MenuItem$1)
/* harmony export */ });
/* harmony import */ var _Container_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Container/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Container/index.mjs");
/* harmony import */ var _Label_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Label/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Label/index.mjs");



const CLASS_MENU_ITEM = 'pcui-menu-item';
const CLASS_MENU_ITEM_CONTENT = CLASS_MENU_ITEM + '-content';
const CLASS_MENU_ITEM_CHILDREN = CLASS_MENU_ITEM + '-children';
const CLASS_MENU_ITEM_HAS_CHILDREN = CLASS_MENU_ITEM + '-has-children';
/**
 * The MenuItem is a selectable option that is appended to a {@link Menu}. A MenuItem can also
 * contain child MenuItems (by appending them to the MenuItem). This can be useful to show nested
 * Menus.
 */
class MenuItem extends _Container_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(args = {}) {
        super(args);
        this._numChildren = 0;
        this._icon = null;
        this._menu = null;
        this._onClickMenuItem = (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            if (this.enabled) {
                if (this._onSelect)
                    this._onSelect(evt);
                this.emit('select');
                if (this.menu) {
                    this.menu.hidden = true;
                }
            }
        };
        this.class.add(CLASS_MENU_ITEM);
        this._containerContent = new _Container_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"]({
            class: CLASS_MENU_ITEM_CONTENT,
            flex: true,
            flexDirection: 'row'
        });
        this.append(this._containerContent);
        this._labelText = new _Label_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]();
        this._containerContent.append(this._labelText);
        this._containerItems = new _Container_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"]({
            class: CLASS_MENU_ITEM_CHILDREN
        });
        this.append(this._containerItems);
        this.domContent = this._containerItems.dom;
        this.text = args.text || 'Untitled';
        this.dom.addEventListener('click', this._onClickMenuItem);
        if (args.value) {
            this.value = args.value;
        }
        if (args.icon) {
            this.icon = args.icon;
        }
        if (args.binding) {
            this.binding = args.binding;
        }
        this.onIsEnabled = args.onIsEnabled;
        this.onSelect = args.onSelect;
        this.onIsVisible = args.onIsVisible;
        if (args.items) {
            args.items.forEach((item) => {
                const menuItem = new MenuItem(item);
                this.append(menuItem);
            });
        }
    }
    destroy() {
        if (this.destroyed)
            return;
        this.dom.removeEventListener('click', this._onClickMenuItem);
        super.destroy();
    }
    _onAppendChild(element) {
        super._onAppendChild(element);
        this._numChildren++;
        if (element instanceof MenuItem) {
            this.class.add(CLASS_MENU_ITEM_HAS_CHILDREN);
            element.menu = this.menu;
        }
    }
    _onRemoveChild(element) {
        if (element instanceof MenuItem) {
            this._numChildren--;
            if (this._numChildren === 0) {
                this.class.remove(CLASS_MENU_ITEM_HAS_CHILDREN);
            }
            element.menu = null;
        }
        super._onRemoveChild(element);
    }
    link(observers, paths) {
        super.link(observers, paths);
        this._labelText.link(observers, paths);
    }
    unlink() {
        super.unlink();
        this._labelText.unlink();
    }
    /**
     * Selects the MenuItem which also happens automatically
     * when the user clicks on the MenuItem.
     */
    select() {
        if (!this.enabled)
            return;
        if (this._onSelect) {
            this._onSelect();
        }
        this.emit('select');
        if (this.menu) {
            this.menu.hidden = true;
        }
    }
    /**
     * Gets / sets the text shown on the MenuItem.
     */
    set text(value) {
        this._labelText.text = value;
    }
    get text() {
        return this._labelText.text;
    }
    set value(value) {
        this.text = value;
    }
    get value() {
        return this.text;
    }
    /* eslint accessor-pairs: 0 */
    set values(values) {
        this._labelText.values = values;
    }
    /**
     * Gets / sets the CSS code for an icon for the MenuItem. e.g. 'E401' (notice we omit the '\\' character).
     */
    set icon(value) {
        if (this._icon === value || !value.match(/^E[0-9]{0,4}$/))
            return;
        this._icon = value;
        if (value) {
            // set data-icon attribute but first convert the value to a code point
            this._labelText.dom.setAttribute('data-icon', String.fromCodePoint(parseInt(value, 16)));
        }
        else {
            this._labelText.dom.removeAttribute('data-icon');
        }
    }
    get icon() {
        return this._icon;
    }
    /**
     * Gets / sets the binding for the MenuItem label.
     */
    set binding(value) {
        this._labelText.binding = value;
    }
    get binding() {
        return this._labelText.binding;
    }
    /**
     * Gets / sets the menu.
     */
    set menu(value) {
        this._menu = value;
        // set menu on child menu items
        if (!this._containerItems.destroyed) {
            for (const child of this._containerItems.dom.childNodes) {
                if (child.ui instanceof MenuItem) {
                    child.ui.menu = value;
                }
            }
        }
    }
    get menu() {
        return this._menu;
    }
    /**
     * Gets / sets the function that is called when the MenuItem is selected.
     */
    set onSelect(value) {
        this._onSelect = value;
    }
    get onSelect() {
        return this._onSelect;
    }
    /**
     * Gets / sets the function that is called when the MenuItem is enabled or disabled.
     */
    set onIsEnabled(value) {
        this._onIsEnabled = value;
    }
    get onIsEnabled() {
        return this._onIsEnabled;
    }
    /**
     * Gets / sets the function that is called when the MenuItem is visible or hidden.
     */
    set onIsVisible(value) {
        this._onIsVisible = value;
    }
    get onIsVisible() {
        return this._onIsVisible;
    }
    /**
     * Returns whether the MenuItem has children.
     */
    get hasChildren() {
        return this._numChildren > 0;
    }
    set renderChanges(value) {
        this._renderChanges = value;
    }
    get renderChanges() {
        return this._renderChanges;
    }
}
var MenuItem$1 = MenuItem;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/NumericInput/index.mjs":
/*!*****************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/NumericInput/index.mjs ***!
  \*****************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ NumericInput$1)
/* harmony export */ });
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");
/* harmony import */ var _InputElement_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../InputElement/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/InputElement/index.mjs");
/* harmony import */ var _class_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../class.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/class.mjs");




const CLASS_NUMERIC_INPUT = 'pcui-numeric-input';
const CLASS_NUMERIC_INPUT_SLIDER_CONTROL = CLASS_NUMERIC_INPUT + '-slider-control';
const CLASS_NUMERIC_INPUT_SLIDER_CONTROL_ACTIVE = CLASS_NUMERIC_INPUT_SLIDER_CONTROL + '-active';
const CLASS_NUMERIC_INPUT_SLIDER_CONTROL_HIDDEN = CLASS_NUMERIC_INPUT_SLIDER_CONTROL + '-hidden';
const REGEX_COMMA = /,/g;
/**
 * The NumericInput represents an input element that holds numbers.
 */
class NumericInput extends _InputElement_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"] {
    constructor(args = {}) {
        var _a, _b, _c, _d;
        const textInputArgs = Object.assign({}, args);
        // delete value because we want to set it after the other arguments
        delete textInputArgs.value;
        delete textInputArgs.renderChanges;
        super(textInputArgs);
        this._sliderUsed = false;
        this._onSliderMouseWheel = (evt) => {
            this._updatePosition(evt.deltaY, evt.shiftKey);
        };
        this._onSliderMouseMove = (evt) => {
            this._updatePosition(evt.movementX, evt.shiftKey);
        };
        this._onSliderMouseDown = () => {
            this._sliderControl.dom.requestPointerLock();
            this._sliderMovement = 0.0;
            this._sliderPrevValue = this.value;
            this._sliderUsed = true;
            if (this.binding) {
                this._historyCombine = this.binding.historyCombine;
                this._historyPostfix = this.binding.historyPostfix;
                this.binding.historyCombine = true;
                this.binding.historyPostfix = `(${Date.now()})`;
            }
        };
        this._onSliderMouseUp = () => {
            document.exitPointerLock();
            if (!this._sliderUsed)
                return;
            this._sliderUsed = false;
            this.value = this._sliderPrevValue + this._sliderMovement;
            if (this.binding) {
                this.binding.historyCombine = this._historyCombine;
                this.binding.historyPostfix = this._historyPostfix;
                this._historyCombine = false;
                this._historyPostfix = null;
            }
            this.focus();
        };
        this._onPointerLockChange = () => {
            if (this._isScrolling()) {
                this._sliderControl.dom.addEventListener("mousemove", this._onSliderMouseMove, false);
                this._sliderControl.dom.addEventListener("wheel", this._onSliderMouseWheel, { passive: true });
                this._sliderControl.class.add(CLASS_NUMERIC_INPUT_SLIDER_CONTROL_ACTIVE);
            }
            else {
                this._sliderControl.dom.removeEventListener("mousemove", this._onSliderMouseMove, false);
                this._sliderControl.dom.removeEventListener("wheel", this._onSliderMouseWheel);
                this._sliderControl.class.remove(CLASS_NUMERIC_INPUT_SLIDER_CONTROL_ACTIVE);
            }
        };
        this.class.add(CLASS_NUMERIC_INPUT);
        this._min = (_a = args.min) !== null && _a !== void 0 ? _a : null;
        this._max = (_b = args.max) !== null && _b !== void 0 ? _b : null;
        this._allowNull = (_c = args.allowNull) !== null && _c !== void 0 ? _c : false;
        this._precision = (_d = args.precision) !== null && _d !== void 0 ? _d : 7;
        if (Number.isFinite(args.step)) {
            this._step = args.step;
        }
        else if (args.precision) {
            this._step = 10 / Math.pow(10, args.precision);
        }
        else {
            this._step = 1;
        }
        if (Number.isFinite(args.stepPrecision)) {
            this._stepPrecision = args.stepPrecision;
        }
        else {
            this._stepPrecision = this._step * 0.1;
        }
        this._oldValue = undefined;
        if (Number.isFinite(args.value)) {
            this.value = args.value;
        }
        else if (!this._allowNull) {
            this.value = 0;
        }
        this._historyCombine = false;
        this._historyPostfix = null;
        this._sliderPrevValue = 0;
        this.renderChanges = args.renderChanges;
        if (!args.hideSlider) {
            this._sliderControl = new _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"]();
            this._sliderControl.class.add(CLASS_NUMERIC_INPUT_SLIDER_CONTROL);
            this.dom.append(this._sliderControl.dom);
            this._sliderControl.dom.addEventListener('mousedown', this._onSliderMouseDown);
            this._sliderControl.dom.addEventListener('mouseup', this._onSliderMouseUp);
            document.addEventListener('pointerlockchange', this._onPointerLockChange, false);
        }
    }
    destroy() {
        if (this.destroyed)
            return;
        if (this._sliderControl) {
            this._sliderControl.dom.removeEventListener('mousedown', this._onSliderMouseDown);
            this._sliderControl.dom.removeEventListener('mouseup', this._onSliderMouseUp);
            this._sliderControl.dom.removeEventListener("mousemove", this._onSliderMouseMove, false);
            this._sliderControl.dom.removeEventListener("wheel", this._onSliderMouseWheel);
            document.removeEventListener('pointerlockchange', this._onPointerLockChange, false);
        }
        super.destroy();
    }
    _updatePosition(movement, shiftKey) {
        // move one step or stepPrecision every 100 pixels
        this._sliderMovement += movement / 100 * (shiftKey ? this._stepPrecision : this._step);
        this.value = this._sliderPrevValue + this._sliderMovement;
    }
    _onInputChange(evt) {
        // get the content of the input, normalize it and set it as the current value
        this.value = this._normalizeValue(this._domInput.value);
    }
    _onInputKeyDown(evt) {
        if (!this.enabled || this.readOnly)
            return;
        // increase / decrease value with arrow keys
        if (evt.key === 'ArrowUp' || evt.key === 'ArrowDown') {
            const inc = evt.key === 'ArrowDown' ? -1 : 1;
            this.value += (evt.shiftKey ? this._stepPrecision : this._step) * inc;
        }
        super._onInputKeyDown(evt);
    }
    _isScrolling() {
        if (!this._sliderControl)
            return false;
        return document.pointerLockElement === this._sliderControl.dom;
    }
    _normalizeValue(value) {
        try {
            if (typeof value === 'string') {
                // check for 0
                if (value === '0')
                    return 0;
                // replace commas with dots (for some international keyboards)
                value = value.replace(REGEX_COMMA, '.');
                // remove spaces
                value = value.replace(/\s/g, '');
                // sanitize input to only allow short mathematical expressions to be evaluated
                value = value.match(/^[*/+\-0-9().]+$/);
                if (value !== null && value[0].length < 20) {
                    let expression = value[0];
                    const operators = ['+', '-', '/', '*'];
                    operators.forEach((operator) => {
                        const expressionArr = expression.split(operator);
                        expressionArr.forEach((_, i) => {
                            expressionArr[i] = expressionArr[i].replace(/^0+/, '');
                        });
                        expression = expressionArr.join(operator);
                    });
                    // eslint-disable-next-line
                    value = Function('"use strict";return (' + expression + ')')();
                }
            }
        }
        catch (error) {
            value = null;
        }
        if (value === null || isNaN(value)) {
            if (this._allowNull) {
                return null;
            }
            value = 0;
        }
        // clamp between min max
        if (this.min !== null && value < this.min) {
            value = this.min;
        }
        if (this.max !== null && value > this.max) {
            value = this.max;
        }
        // fix precision
        if (this.precision !== null) {
            value = parseFloat(Number(value).toFixed(this.precision));
        }
        return value;
    }
    _updateValue(value, force) {
        const different = (value !== this._oldValue || force);
        // always set the value to the input because
        // we always want it to show an actual number or nothing
        this._oldValue = value;
        if (value === null) {
            this._domInput.value = '';
        }
        else {
            this._domInput.value = String(value);
        }
        this.class.remove(_class_mjs__WEBPACK_IMPORTED_MODULE_2__.MULTIPLE_VALUES);
        if (different) {
            this.emit('change', value);
        }
        return different;
    }
    set value(value) {
        value = this._normalizeValue(value);
        const forceUpdate = this.class.contains(_class_mjs__WEBPACK_IMPORTED_MODULE_2__.MULTIPLE_VALUES) && value === null && this._allowNull;
        const changed = this._updateValue(value, forceUpdate);
        if (changed && this.binding) {
            this.binding.setValue(value);
        }
        if (this._sliderControl) {
            this._sliderControl.class.remove(CLASS_NUMERIC_INPUT_SLIDER_CONTROL_HIDDEN);
        }
    }
    get value() {
        const val = this._domInput.value;
        return val !== '' ? parseFloat(val) : null;
    }
    /* eslint accessor-pairs: 0 */
    set values(values) {
        const normalizedValues = values.map(v => this._normalizeValue(v));
        const different = normalizedValues.some(v => v !== normalizedValues[0]);
        if (different) {
            this._updateValue(null);
            this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_2__.MULTIPLE_VALUES);
            if (this._sliderControl) {
                this._sliderControl.class.add(CLASS_NUMERIC_INPUT_SLIDER_CONTROL_HIDDEN);
            }
        }
        else {
            this._updateValue(normalizedValues[0]);
            if (this._sliderControl) {
                this._sliderControl.class.remove(CLASS_NUMERIC_INPUT_SLIDER_CONTROL_HIDDEN);
            }
        }
    }
    /**
     * Gets / sets the minimum value this field can take.
     */
    set min(value) {
        if (this._min === value)
            return;
        this._min = value;
        // reset value
        if (this._min !== null) {
            this.value = this.value; // eslint-disable-line no-self-assign
        }
    }
    get min() {
        return this._min;
    }
    /**
     * Gets / sets the maximum value this field can take.
     */
    set max(value) {
        if (this._max === value)
            return;
        this._max = value;
        // reset value
        if (this._max !== null) {
            this.value = this.value; // eslint-disable-line no-self-assign
        }
    }
    get max() {
        return this._max;
    }
    /**
     * Gets / sets the precision of the input.
     */
    set precision(value) {
        if (this._precision === value)
            return;
        this._precision = value;
        // reset value
        if (this._precision !== null) {
            this.value = this.value; // eslint-disable-line no-self-assign
        }
    }
    get precision() {
        return this._precision;
    }
    /**
     * Gets / sets the amount that the value will be increased or decreased when using the arrow keys and the slider input.
     */
    set step(value) {
        this._step = value;
    }
    get step() {
        return this._step;
    }
}
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"].register('number', NumericInput, { renderChanges: true });
var NumericInput$1 = NumericInput;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/Overlay/index.mjs":
/*!************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/Overlay/index.mjs ***!
  \************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Overlay$1)
/* harmony export */ });
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");
/* harmony import */ var _Container_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Container/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Container/index.mjs");



const CLASS_OVERLAY = 'pcui-overlay';
const CLASS_OVERLAY_INNER = CLASS_OVERLAY + '-inner';
const CLASS_OVERLAY_CLICKABLE = CLASS_OVERLAY + '-clickable';
const CLASS_OVERLAY_TRANSPARENT = CLASS_OVERLAY + '-transparent';
const CLASS_OVERLAY_CONTENT = CLASS_OVERLAY + '-content';
/**
 * An overlay element.
 */
class Overlay extends _Container_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"] {
    constructor(args = {}) {
        super(args);
        this._onMouseDown = (evt) => {
            if (!this.clickable)
                return;
            // some field might be in focus
            document.body.blur();
            // wait till blur is done
            requestAnimationFrame(() => {
                this.hidden = true;
            });
            evt.preventDefault();
        };
        this.class.add(CLASS_OVERLAY);
        this._domClickableOverlay = document.createElement('div');
        this._domClickableOverlay.ui = this;
        this._domClickableOverlay.classList.add(CLASS_OVERLAY_INNER);
        this.dom.appendChild(this._domClickableOverlay);
        this._domClickableOverlay.addEventListener('mousedown', this._onMouseDown);
        this.domContent = document.createElement('div');
        this.domContent.ui = this;
        this.domContent.classList.add(CLASS_OVERLAY_CONTENT);
        this.dom.appendChild(this.domContent);
        this.clickable = args.clickable || false;
        this.transparent = args.transparent || false;
    }
    destroy() {
        if (this._destroyed)
            return;
        this._domClickableOverlay.removeEventListener('mousedown', this._onMouseDown);
        super.destroy();
    }
    /**
     * Position the overlay at specific x, y coordinates.
     *
     * @param x - The x coordinate.
     * @param y - The y coordinate.
     */
    position(x, y) {
        const area = this._domClickableOverlay.getBoundingClientRect();
        const rect = this.domContent.getBoundingClientRect();
        x = Math.max(0, Math.min(area.width - rect.width, x));
        y = Math.max(0, Math.min(area.height - rect.height, y));
        this.domContent.style.position = 'absolute';
        this.domContent.style.left = `${x}px`;
        this.domContent.style.top = `${y}px`;
    }
    /**
     * Whether the overlay can be hidden by clicking on it.
     */
    set clickable(value) {
        if (value) {
            this.class.add(CLASS_OVERLAY_CLICKABLE);
        }
        else {
            this.class.remove(CLASS_OVERLAY_CLICKABLE);
        }
    }
    get clickable() {
        return this.class.contains(CLASS_OVERLAY_CLICKABLE);
    }
    /**
     * Whether the overlay is transparent or not.
     */
    set transparent(value) {
        if (value) {
            this.class.add(CLASS_OVERLAY_TRANSPARENT);
        }
        else {
            this.class.remove(CLASS_OVERLAY_TRANSPARENT);
        }
    }
    get transparent() {
        return this.class.contains(CLASS_OVERLAY_TRANSPARENT);
    }
}
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"].register('overlay', Overlay);
var Overlay$1 = Overlay;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/Panel/index.mjs":
/*!**********************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/Panel/index.mjs ***!
  \**********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Panel$1)
/* harmony export */ });
/* harmony import */ var _class_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../class.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/class.mjs");
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");
/* harmony import */ var _Container_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Container/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Container/index.mjs");
/* harmony import */ var _Label_index_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Label/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Label/index.mjs");
/* harmony import */ var _Button_index_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Button/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Button/index.mjs");






const CLASS_PANEL = 'pcui-panel';
const CLASS_PANEL_HEADER = CLASS_PANEL + '-header';
const CLASS_PANEL_HEADER_TITLE = CLASS_PANEL_HEADER + '-title';
const CLASS_PANEL_CONTENT = CLASS_PANEL + '-content';
const CLASS_PANEL_HORIZONTAL = CLASS_PANEL + '-horizontal';
const CLASS_PANEL_SORTABLE_ICON = CLASS_PANEL + '-sortable-icon';
const CLASS_PANEL_REMOVE = CLASS_PANEL + '-remove';
/**
 * The Panel is a {@link Container} that itself contains a header container and a content
 * container. The respective Container functions work using the content container. One can also
 * append elements to the header of the Panel.
 */
class Panel extends _Container_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"] {
    /**
     * Creates a new Panel.
     *
     * @param args - The arguments. Extends the Container constructor arguments. All settable
     * properties can also be set through the constructor.
     */
    constructor(args = {}) {
        var _a;
        const containerArgs = Object.assign(Object.assign({}, args), { flex: true });
        delete containerArgs.grid;
        delete containerArgs.flexDirection;
        delete containerArgs.scrollable;
        super(containerArgs);
        this._reflowTimeout = null;
        this._widthBeforeCollapse = null;
        this._heightBeforeCollapse = null;
        this._iconSort = null;
        this._btnRemove = null;
        this._onHeaderClick = (evt) => {
            if (!this._collapsible)
                return;
            if (evt.target !== this.header.dom && evt.target !== this._labelTitle.dom)
                return;
            // toggle collapsed
            this.collapsed = !this.collapsed;
        };
        this._onDragStart = (evt) => {
            if (!this.enabled || this.readOnly)
                return;
            evt.stopPropagation();
            evt.preventDefault();
            window.addEventListener('mouseup', this._onDragEndEvt);
            window.addEventListener('mouseleave', this._onDragEndEvt);
            window.addEventListener('mousemove', this._onDragMove);
            this.emit('dragstart');
            // @ts-ignore accessing protected methods
            if (this.parent && this.parent._onChildDragStart) {
                // @ts-ignore accessing protected methods
                this.parent._onChildDragStart(evt, this);
            }
        };
        this._onDragMove = (evt) => {
            this.emit('dragmove');
            // @ts-ignore accessing protected methods
            if (this.parent && this.parent._onChildDragStart) {
                // @ts-ignore accessing protected methods
                this.parent._onChildDragMove(evt, this);
            }
        };
        this.class.add(CLASS_PANEL);
        if (args.panelType) {
            this.class.add(CLASS_PANEL + '-' + args.panelType);
        }
        // do not call reflow on every update while
        // we are initializing
        this._suspendReflow = true;
        // initialize header container
        this._initializeHeader(args);
        // initialize content container
        this._initializeContent(args);
        // header size
        this.headerSize = (_a = args.headerSize) !== null && _a !== void 0 ? _a : 32;
        // collapse related
        this.collapsible = args.collapsible || false;
        this.collapsed = args.collapsed || false;
        this.collapseHorizontally = args.collapseHorizontally || false;
        this.sortable = args.sortable || false;
        this.removable = args.removable || !!args.onRemove || false;
        // Set the contents container to be the content DOM element. From now on, calling append
        // functions on the panel will append the elements to the contents container.
        this.domContent = this._containerContent.dom;
        // execute reflow now after all fields have been initialized
        this._suspendReflow = false;
        this._reflow();
        this._onDragEndEvt = this._onDragEnd.bind(this);
    }
    destroy() {
        if (this._destroyed)
            return;
        if (this._reflowTimeout) {
            cancelAnimationFrame(this._reflowTimeout);
            this._reflowTimeout = null;
        }
        window.removeEventListener('mouseup', this._onDragEndEvt);
        window.removeEventListener('mouseleave', this._onDragEndEvt);
        window.removeEventListener('mousemove', this._onDragMove);
        super.destroy();
    }
    _initializeHeader(args) {
        // header container
        this._containerHeader = new _Container_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]({
            flex: true,
            flexDirection: 'row',
            class: [CLASS_PANEL_HEADER, _class_mjs__WEBPACK_IMPORTED_MODULE_0__.FONT_BOLD]
        });
        // header title
        this._labelTitle = new _Label_index_mjs__WEBPACK_IMPORTED_MODULE_3__["default"]({
            text: args.headerText,
            class: [CLASS_PANEL_HEADER_TITLE, _class_mjs__WEBPACK_IMPORTED_MODULE_0__.FONT_BOLD]
        });
        this._containerHeader.append(this._labelTitle);
        // use native click listener because the Element#click event is only fired if the element
        // is enabled. However we still want to catch header click events in order to collapse them
        this._containerHeader.dom.addEventListener('click', this._onHeaderClick);
        this.append(this._containerHeader);
    }
    _onClickRemove(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        this.emit('click:remove');
    }
    _initializeContent(args) {
        // containers container
        this._containerContent = new _Container_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]({
            class: CLASS_PANEL_CONTENT,
            grid: args.grid,
            flex: args.flex,
            flexDirection: args.flexDirection,
            scrollable: args.scrollable,
            dom: args.content
        });
        this.append(this._containerContent);
    }
    // Collapses or expands the panel as needed
    _reflow() {
        if (this._suspendReflow) {
            return;
        }
        if (this._reflowTimeout) {
            cancelAnimationFrame(this._reflowTimeout);
            this._reflowTimeout = null;
        }
        if (this.hidden || !this.collapsible)
            return;
        if (this.collapsed && this.collapseHorizontally) {
            this._containerHeader.style.top = -this.headerSize + 'px';
        }
        else {
            this._containerHeader.style.top = '';
        }
        // we rely on the content width / height and we have to
        // wait for 1 frame before we can get the final values back
        this._reflowTimeout = requestAnimationFrame(() => {
            this._reflowTimeout = null;
            if (this.collapsed) {
                // remember size before collapse
                if (!this._widthBeforeCollapse) {
                    this._widthBeforeCollapse = this.style.width;
                }
                if (!this._heightBeforeCollapse) {
                    this._heightBeforeCollapse = this.style.height;
                }
                if (this._collapseHorizontally) {
                    this.height = '';
                    this.width = this.headerSize;
                }
                else {
                    this.height = this.headerSize;
                }
                // add collapsed class after getting the width and height
                // because if we add it before then because of overflow:hidden
                // we might get inaccurate width/heights.
                this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_0__.COLLAPSED);
            }
            else {
                // remove collapsed class first and the restore width and height
                // (opposite order of collapsing)
                this.class.remove(_class_mjs__WEBPACK_IMPORTED_MODULE_0__.COLLAPSED);
                if (this._collapseHorizontally) {
                    this.height = '';
                    if (this._widthBeforeCollapse !== null) {
                        this.width = this._widthBeforeCollapse;
                    }
                }
                else {
                    if (this._heightBeforeCollapse !== null) {
                        this.height = this._heightBeforeCollapse;
                    }
                }
                // reset before collapse vars
                this._widthBeforeCollapse = null;
                this._heightBeforeCollapse = null;
            }
        });
    }
    _onDragEnd(evt) {
        window.removeEventListener('mouseup', this._onDragEndEvt);
        window.removeEventListener('mouseleave', this._onDragEndEvt);
        window.removeEventListener('mousemove', this._onDragMove);
        if (this._draggedChild === this) {
            this._draggedChild = null;
        }
        this.emit('dragend');
        // @ts-ignore accessing protected methods
        if (this.parent && this.parent._onChildDragStart) {
            // @ts-ignore accessing protected methods
            this.parent._onChildDragEnd(evt, this);
        }
    }
    /**
     * Gets / sets whether the Element is collapsible.
     */
    set collapsible(value) {
        if (value === this._collapsible)
            return;
        this._collapsible = value;
        if (value) {
            this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_0__.COLLAPSIBLE);
        }
        else {
            this.class.remove(_class_mjs__WEBPACK_IMPORTED_MODULE_0__.COLLAPSIBLE);
        }
        this._reflow();
        if (this.collapsed) {
            this.emit(value ? 'collapse' : 'expand');
        }
    }
    get collapsible() {
        return this._collapsible;
    }
    /**
     * Gets / sets whether the Element should be collapsed.
     */
    set collapsed(value) {
        if (this._collapsed === value)
            return;
        this._collapsed = value;
        this._reflow();
        if (this.collapsible) {
            this.emit(value ? 'collapse' : 'expand');
        }
    }
    get collapsed() {
        return this._collapsed;
    }
    /**
     * Gets / sets whether the panel can be reordered.
     */
    set sortable(value) {
        if (this._sortable === value)
            return;
        this._sortable = value;
        if (value) {
            this._iconSort = new _Label_index_mjs__WEBPACK_IMPORTED_MODULE_3__["default"]({
                class: CLASS_PANEL_SORTABLE_ICON
            });
            this._iconSort.dom.addEventListener('mousedown', this._onDragStart);
            this.header.prepend(this._iconSort);
        }
        else if (this._iconSort) {
            this._iconSort.destroy();
            this._iconSort = null;
        }
    }
    get sortable() {
        return this._sortable;
    }
    /**
     * Gets / sets whether the panel can be removed
     */
    set removable(value) {
        if (this.removable === value)
            return;
        if (value) {
            this._btnRemove = new _Button_index_mjs__WEBPACK_IMPORTED_MODULE_4__["default"]({
                icon: 'E289',
                class: CLASS_PANEL_REMOVE
            });
            this._btnRemove.on('click', this._onClickRemove.bind(this));
            this.header.append(this._btnRemove);
        }
        else {
            this._btnRemove.destroy();
            this._btnRemove = null;
        }
    }
    get removable() {
        return !!this._btnRemove;
    }
    /**
     * Gets / sets whether the panel collapses horizontally - this would be the case for side panels. Defaults to `false`.
     */
    set collapseHorizontally(value) {
        if (this._collapseHorizontally === value)
            return;
        this._collapseHorizontally = value;
        if (value) {
            this.class.add(CLASS_PANEL_HORIZONTAL);
        }
        else {
            this.class.remove(CLASS_PANEL_HORIZONTAL);
        }
        this._reflow();
    }
    get collapseHorizontally() {
        return this._collapseHorizontally;
    }
    /**
     * Gets the content container.
     */
    get content() {
        return this._containerContent;
    }
    /**
     * Gets the header container.
     */
    get header() {
        return this._containerHeader;
    }
    /**
     * The header text of the panel. Defaults to the empty string.
     */
    set headerText(value) {
        this._labelTitle.text = value;
    }
    get headerText() {
        return this._labelTitle.text;
    }
    /**
     * The height of the header in pixels. Defaults to 32.
     */
    set headerSize(value) {
        this._headerSize = value;
        const style = this._containerHeader.dom.style;
        style.height = Math.max(0, value) + 'px';
        style.lineHeight = style.height;
        this._reflow();
    }
    get headerSize() {
        return this._headerSize;
    }
}
/**
 * Fired when the panel gets collapsed.
 *
 * @event
 * @example
 * ```ts
 * const panel = new Panel();
 * panel.on('collapse', () => {
 *     console.log('Panel collapsed');
 * });
 * ```
 */
Panel.EVENT_COLLAPSE = 'collapse';
/**
 * Fired when the panel gets expanded.
 *
 * @event
 * @example
 * ```ts
 * const panel = new Panel();
 * panel.on('expand', () => {
 *     console.log('Panel expanded');
 * });
 * ```
 */
Panel.EVENT_EXPAND = 'expand';
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"].register('panel', Panel);
var Panel$1 = Panel;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/Progress/index.mjs":
/*!*************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/Progress/index.mjs ***!
  \*************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Progress$1)
/* harmony export */ });
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");
/* harmony import */ var _Container_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Container/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Container/index.mjs");



const CLASS_ROOT = 'pcui-progress';
const CLASS_INNER = CLASS_ROOT + '-inner';
/**
 * Represents a bar that can highlight progress of an activity.
 */
class Progress extends _Container_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"] {
    constructor(args = {}) {
        super(args);
        this._inner = new _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"]({
            class: CLASS_INNER
        });
        this.class.add(CLASS_ROOT);
        this.append(this._inner);
        if (args.value !== undefined) {
            this.value = args.value;
        }
    }
    /**
     * Gets / sets the value of the progress bar (between 0 and 100).
     */
    set value(val) {
        if (this._value === val)
            return;
        this._value = val;
        this._inner.width = `${this._value}%`;
        this.emit('change', val);
    }
    get value() {
        return this._value;
    }
}
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"].register('progress', Progress);
var Progress$1 = Progress;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/RadioButton/index.mjs":
/*!****************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/RadioButton/index.mjs ***!
  \****************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ RadioButton$1)
/* harmony export */ });
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");
/* harmony import */ var _class_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../class.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/class.mjs");



const CLASS_RADIO_BUTTON = 'pcui-radio-button';
const CLASS_RADIO_BUTTON_SELECTED = CLASS_RADIO_BUTTON + '-selected';
/**
 * A radio button element.
 */
class RadioButton extends _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(args = {}) {
        super(Object.assign({ tabIndex: 0 }, args));
        this._onKeyDown = (evt) => {
            if (evt.key === 'Escape') {
                this.blur();
                return;
            }
            if (!this.enabled || this.readOnly)
                return;
            if (evt.key === ' ') {
                evt.stopPropagation();
                evt.preventDefault();
                this.value = !this.value;
            }
        };
        this._onFocus = (evt) => {
            this.emit('focus');
        };
        this._onBlur = (evt) => {
            this.emit('blur');
        };
        this.class.add(CLASS_RADIO_BUTTON);
        this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.NOT_FLEXIBLE);
        this.dom.addEventListener('keydown', this._onKeyDown);
        this.dom.addEventListener('focus', this._onFocus);
        this.dom.addEventListener('blur', this._onBlur);
        this.value = args.value;
        this._renderChanges = args.renderChanges;
    }
    destroy() {
        if (this._destroyed)
            return;
        this.dom.removeEventListener('keydown', this._onKeyDown);
        this.dom.removeEventListener('focus', this._onFocus);
        this.dom.removeEventListener('blur', this._onBlur);
        super.destroy();
    }
    _onClick(evt) {
        if (this.enabled) {
            this.focus();
        }
        if (this.enabled && !this.readOnly) {
            this.value = !this.value;
        }
        return super._onClick(evt);
    }
    _updateValue(value) {
        this.class.remove(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.MULTIPLE_VALUES);
        if (value === this.value)
            return false;
        this._value = value;
        if (value) {
            this.class.add(CLASS_RADIO_BUTTON_SELECTED);
        }
        else {
            this.class.remove(CLASS_RADIO_BUTTON_SELECTED);
        }
        if (this.renderChanges) {
            this.flash();
        }
        this.emit('change', value);
        return true;
    }
    focus() {
        this.dom.focus();
    }
    blur() {
        this.dom.blur();
    }
    set value(value) {
        const changed = this._updateValue(value);
        if (changed && this._binding) {
            this._binding.setValue(value);
        }
    }
    get value() {
        return this._value;
    }
    /* eslint accessor-pairs: 0 */
    set values(values) {
        const different = values.some(v => v !== values[0]);
        if (different) {
            this._updateValue(null);
            this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_1__.MULTIPLE_VALUES);
        }
        else {
            this._updateValue(values[0]);
        }
    }
    set renderChanges(renderChanges) {
        this._renderChanges = renderChanges;
    }
    get renderChanges() {
        return this._renderChanges;
    }
}
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"].register('radio', RadioButton, { renderChanges: true });
var RadioButton$1 = RadioButton;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/SelectInput/index.mjs":
/*!****************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/SelectInput/index.mjs ***!
  \****************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SelectInput$1)
/* harmony export */ });
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");
/* harmony import */ var _Container_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Container/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Container/index.mjs");
/* harmony import */ var _TextInput_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../TextInput/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/TextInput/index.mjs");
/* harmony import */ var _Button_index_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Button/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Button/index.mjs");
/* harmony import */ var _Label_index_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Label/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Label/index.mjs");
/* harmony import */ var _class_mjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../class.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/class.mjs");
/* harmony import */ var _helpers_search_mjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../helpers/search.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/helpers/search.mjs");








const CLASS_SELECT_INPUT = 'pcui-select-input';
const CLASS_SELECT_INPUT_CONTAINER_VALUE = CLASS_SELECT_INPUT + '-container-value';
const CLASS_MULTI_SELECT = CLASS_SELECT_INPUT + '-multi';
const CLASS_DISABLED_VALUE = CLASS_SELECT_INPUT + '-disabled-value';
const CLASS_HAS_DISABLED_VALUE = CLASS_SELECT_INPUT + '-has-disabled-value';
const CLASS_ALLOW_INPUT = 'pcui-select-input-allow-input';
const CLASS_VALUE = CLASS_SELECT_INPUT + '-value';
const CLASS_ICON = CLASS_SELECT_INPUT + '-icon';
const CLASS_INPUT = CLASS_SELECT_INPUT + '-textinput';
const CLASS_LIST = CLASS_SELECT_INPUT + '-list';
const CLASS_TAGS = CLASS_SELECT_INPUT + '-tags';
const CLASS_TAGS_EMPTY = CLASS_SELECT_INPUT + '-tags-empty';
const CLASS_TAG = CLASS_SELECT_INPUT + '-tag';
const CLASS_TAG_NOT_EVERYWHERE = CLASS_SELECT_INPUT + '-tag-not-everywhere';
const CLASS_SHADOW = CLASS_SELECT_INPUT + '-shadow';
const CLASS_FIT_HEIGHT = CLASS_SELECT_INPUT + '-fit-height';
const CLASS_SELECTED = 'pcui-selected';
const CLASS_HIGHLIGHTED = CLASS_SELECT_INPUT + '-label-highlighted';
const CLASS_CREATE_NEW = CLASS_SELECT_INPUT + '-create-new';
const CLASS_OPEN = 'pcui-open';
const DEFAULT_BOTTOM_OFFSET = 25;
/**
 * An input that allows selecting from a dropdown or entering tags.
 */
class SelectInput extends _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(args = {}) {
        var _a, _b, _c, _d;
        // main container
        const container = new _Container_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]({
            dom: args.dom
        });
        const elementArgs = Object.assign(Object.assign({}, args), { dom: container.dom });
        super(elementArgs);
        this._timeoutLabelValueTabIndex = null;
        this._valueToText = {};
        this._valueToLabel = {};
        this._labelToValue = new Map();
        this._labelHighlighted = null;
        this._disabledOptions = {};
        this._prefix = '';
        this._onInputChange = (value) => {
            if (this._suspendInputChange)
                return;
            if (this._lastInputValue === value)
                return;
            this.open();
            this._lastInputValue = value;
            this._filterOptions(value);
        };
        this._onInputKeyDown = (evt) => {
            if (evt.key === 'Enter' && this.enabled && !this.readOnly) {
                evt.stopPropagation();
                evt.preventDefault();
                // on enter
                let value;
                if (this._labelHighlighted && this._labelToValue.has(this._labelHighlighted)) {
                    value = this._labelToValue.get(this._labelHighlighted);
                }
                else {
                    value = this._input.value;
                }
                if (value !== undefined) {
                    this.focus();
                    this.close();
                    if (this._valueToText[value]) {
                        this._onSelectValue(value);
                    }
                    else if (this._allowCreate) {
                        if (this._createFn) {
                            this._createFn(value);
                        }
                        else {
                            this._onSelectValue(value);
                        }
                    }
                    return;
                }
            }
            this._onKeyDown(evt);
        };
        this._onWindowMouseDown = (evt) => {
            if (!this.dom.contains(evt.target)) {
                this.close();
            }
        };
        this._onKeyDown = (evt) => {
            // close options on ESC and blur
            if (evt.key === 'Escape') {
                this.close();
                return;
            }
            if (evt.key === 'Tab') {
                this.close();
                return;
            }
            if (!this.enabled || this.readOnly)
                return;
            if (evt.key === 'Enter' && !this._allowInput) {
                if (this._labelHighlighted && this._labelToValue.has(this._labelHighlighted)) {
                    this._onSelectValue(this._labelToValue.get(this._labelHighlighted));
                    this.close();
                }
                return;
            }
            if (evt.key !== 'ArrowUp' && evt.key !== 'ArrowDown') {
                return;
            }
            evt.stopPropagation();
            evt.preventDefault();
            if ((this._allowInput || this.multiSelect) && this._containerOptions.hidden) {
                this.open();
                return;
            }
            if (this._containerOptions.hidden) {
                if (!this._options.length)
                    return;
                let index = -1;
                for (let i = 0; i < this._options.length; i++) {
                    if (this._options[i].v === this.value) {
                        index = i;
                        break;
                    }
                }
                if (evt.key === 'ArrowUp') {
                    index--;
                }
                else if (evt.key === 'ArrowDown') {
                    index++;
                }
                if (index >= 0 && index < this._options.length) {
                    this._onSelectValue(this._options[index].v);
                }
            }
            else {
                if (!this._containerOptions.dom.childNodes.length)
                    return;
                if (!this._labelHighlighted) {
                    this._highlightLabel(this._containerOptions.dom.childNodes[0].ui);
                }
                else {
                    let highlightedLabelDom = this._labelHighlighted.dom;
                    do {
                        if (evt.key === 'ArrowUp') {
                            highlightedLabelDom = highlightedLabelDom.previousSibling;
                        }
                        else if (evt.key === 'ArrowDown') {
                            highlightedLabelDom = highlightedLabelDom.nextSibling;
                        }
                    } while (highlightedLabelDom && highlightedLabelDom.ui.hidden);
                    if (highlightedLabelDom) {
                        this._highlightLabel(highlightedLabelDom.ui);
                    }
                }
            }
        };
        this._onMouseDown = () => {
            if (!this._allowInput) {
                this.focus();
            }
        };
        this._onFocus = () => {
            this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_5__.FOCUS);
            this.emit('focus');
            if (!this._input.hidden) {
                this.open();
            }
        };
        this._onBlur = () => {
            this.class.remove(_class_mjs__WEBPACK_IMPORTED_MODULE_5__.FOCUS);
            this.emit('blur');
        };
        this._onWheel = (evt) => {
            // prevent scrolling on other stuff like the viewport
            // when we are scrolling on the select input
            evt.stopPropagation();
        };
        this._container = container;
        this._container.parent = this;
        this.class.add(CLASS_SELECT_INPUT);
        this._containerValue = new _Container_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]({
            class: CLASS_SELECT_INPUT_CONTAINER_VALUE
        });
        this._container.append(this._containerValue);
        // focus / hover shadow element
        this._domShadow = document.createElement('div');
        this._domShadow.classList.add(CLASS_SHADOW);
        this._containerValue.append(this._domShadow);
        this._allowInput = args.allowInput;
        if (this._allowInput) {
            this.class.add(CLASS_ALLOW_INPUT);
        }
        this._allowCreate = args.allowCreate;
        this._createFn = args.createFn;
        this._createLabelText = args.createLabelText;
        // displays current value
        this._labelValue = new _Label_index_mjs__WEBPACK_IMPORTED_MODULE_4__["default"]({
            class: CLASS_VALUE,
            tabIndex: 0
        });
        this._labelValue.on('click', () => {
            if (this.enabled && !this.readOnly) {
                // toggle dropdown list
                this.toggle();
            }
        });
        this._containerValue.append(this._labelValue);
        // dropdown icon
        this._labelIcon = new _Label_index_mjs__WEBPACK_IMPORTED_MODULE_4__["default"]({
            class: CLASS_ICON,
            hidden: args.allowInput && args.multiSelect
        });
        this._containerValue.append(this._labelIcon);
        // input for searching or adding new entries
        this._input = new _TextInput_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]({
            class: CLASS_INPUT,
            blurOnEnter: false,
            keyChange: true
        });
        this._containerValue.append(this._input);
        this._lastInputValue = '';
        this._suspendInputChange = false;
        this._input.on('change', this._onInputChange);
        this._input.on('keydown', this._onInputKeyDown);
        this._input.on('focus', this._onFocus);
        this._input.on('blur', this._onBlur);
        if (args.placeholder) {
            this.placeholder = args.placeholder;
        }
        // dropdown list
        this._containerOptions = new _Container_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]({
            class: CLASS_LIST,
            hidden: true
        });
        this._containerValue.append(this._containerOptions);
        // tags container
        this._containerTags = new _Container_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]({
            class: CLASS_TAGS,
            flex: true,
            flexDirection: 'row',
            hidden: true
        });
        this._container.append(this._containerTags);
        if (args.multiSelect) {
            this.class.add(CLASS_MULTI_SELECT);
            this._containerTags.hidden = false;
        }
        // events
        this._labelValue.dom.addEventListener('keydown', this._onKeyDown);
        this._labelValue.dom.addEventListener('focus', this._onFocus);
        this._labelValue.dom.addEventListener('blur', this._onBlur);
        this._labelValue.dom.addEventListener('mousedown', this._onMouseDown);
        this._containerOptions.dom.addEventListener('wheel', this._onWheel, { passive: true });
        this.on('hide', () => {
            this.close();
        });
        this._type = (_a = args.type) !== null && _a !== void 0 ? _a : 'string';
        this.invalidOptions = (_b = args.invalidOptions) !== null && _b !== void 0 ? _b : [];
        this.options = (_c = args.options) !== null && _c !== void 0 ? _c : [];
        this._optionsFn = args.optionsFn;
        this._allowNull = args.allowNull;
        this._values = null;
        if (args.value !== undefined) {
            this.value = args.value;
        }
        else if (args.defaultValue) {
            this.value = args.defaultValue;
        }
        else {
            this.value = null;
        }
        this._renderChanges = args.renderChanges;
        this.on('change', () => {
            this._updateInputFieldsVisibility();
            if (this.renderChanges && !this.multiSelect) {
                this._labelValue.flash();
            }
        });
        this._updateInputFieldsVisibility(false);
        this._onSelect = args.onSelect;
        this.fallbackOrder = args.fallbackOrder;
        this.disabledOptions = args.disabledOptions;
        this._prefix = (_d = args.prefix) !== null && _d !== void 0 ? _d : '';
    }
    destroy() {
        if (this._destroyed)
            return;
        this._labelValue.dom.removeEventListener('keydown', this._onKeyDown);
        this._labelValue.dom.removeEventListener('mousedown', this._onMouseDown);
        this._labelValue.dom.removeEventListener('focus', this._onFocus);
        this._labelValue.dom.removeEventListener('blur', this._onBlur);
        this._containerOptions.dom.removeEventListener('wheel', this._onWheel);
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('mousedown', this._onWindowMouseDown);
        if (this._timeoutLabelValueTabIndex) {
            cancelAnimationFrame(this._timeoutLabelValueTabIndex);
            this._timeoutLabelValueTabIndex = null;
        }
        super.destroy();
    }
    _initializeCreateLabel() {
        const container = new _Container_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]({
            class: CLASS_CREATE_NEW,
            flex: true,
            flexDirection: 'row'
        });
        const label = new _Label_index_mjs__WEBPACK_IMPORTED_MODULE_4__["default"]({
            text: this._input.value,
            tabIndex: -1
        });
        container.append(label);
        let evtChange = this._input.on('change', (value) => {
            // check if label is destroyed
            // during change event
            if (label.destroyed)
                return;
            label.text = value;
            if (this.invalidOptions && this.invalidOptions.indexOf(value) !== -1) {
                if (!container.hidden) {
                    container.hidden = true;
                    this._resizeShadow();
                }
            }
            else {
                if (container.hidden) {
                    container.hidden = false;
                    this._resizeShadow();
                }
            }
        });
        container.on('click', (e) => {
            e.stopPropagation();
            const text = label.text;
            this.focus();
            this.close();
            if (this._createFn) {
                this._createFn(text);
            }
            else if (text) {
                this._onSelectValue(text);
            }
        });
        label.on('destroy', () => {
            evtChange.unbind();
            evtChange = null;
        });
        const labelCreateText = new _Label_index_mjs__WEBPACK_IMPORTED_MODULE_4__["default"]({
            text: this._createLabelText
        });
        container.append(labelCreateText);
        this._containerOptions.append(container);
        return container;
    }
    _convertSingleValue(value) {
        if (value === null && this._allowNull)
            return value;
        if (this._type === 'string') {
            if (!value) {
                value = '';
            }
            else {
                value = value.toString();
            }
        }
        else if (this._type === 'number') {
            if (!value) {
                value = 0;
            }
            else {
                value = parseInt(value, 10);
            }
        }
        else if (this._type === 'boolean') {
            return !!value;
        }
        return value;
    }
    _convertValue(value) {
        if (value === null && this._allowNull)
            return value;
        if (this.multiSelect) {
            if (!Array.isArray(value))
                return value;
            return value.map(val => this._convertSingleValue(val));
        }
        return this._convertSingleValue(value);
    }
    // Update our value with the specified selected option
    _onSelectValue(value) {
        value = this._convertSingleValue(value);
        if (!this.multiSelect) {
            this.value = value;
            return;
        }
        if (this._values) {
            let dirty = false;
            this._values.forEach((arr) => {
                if (!arr) {
                    arr = [value];
                    dirty = true;
                }
                else {
                    if (arr.indexOf(value) === -1) {
                        arr.push(value);
                        dirty = true;
                    }
                }
            });
            if (dirty) {
                this._onMultipleValuesChange(this._values);
                this.emit('change', this.value);
                if (this._binding) {
                    this._binding.addValues([value]);
                }
            }
        }
        else {
            if (!this._value || !Array.isArray(this._value)) {
                this.value = [value];
            }
            else {
                if (this._value.indexOf(value) === -1) {
                    this._value.push(value);
                    this._addTag(value);
                    this.emit('change', this.value);
                    if (this._binding) {
                        this._binding.addValues([value]);
                    }
                }
            }
        }
    }
    _highlightLabel(label) {
        if (this._labelHighlighted === label)
            return;
        if (this._labelHighlighted) {
            this._labelHighlighted.class.remove(CLASS_HIGHLIGHTED);
        }
        this._labelHighlighted = label;
        if (this._labelHighlighted) {
            this._labelHighlighted.class.add(CLASS_HIGHLIGHTED);
            // scroll into view if necessary
            const labelTop = this._labelHighlighted.dom.offsetTop;
            const scrollTop = this._containerOptions.dom.scrollTop;
            if (labelTop < scrollTop) {
                this._containerOptions.dom.scrollTop = labelTop;
            }
            else if (labelTop + this._labelHighlighted.height > this._containerOptions.height + scrollTop) {
                this._containerOptions.dom.scrollTop = labelTop + this._labelHighlighted.height - this._containerOptions.height;
            }
        }
    }
    // when the value is changed show the correct title
    _onValueChange(value) {
        if (!this.multiSelect) {
            this._labelValue.value = this._prefix + (this._valueToText[value] || '');
            value = '' + value;
            for (const key in this._valueToLabel) {
                const label = this._valueToLabel[key];
                if (key === value) {
                    label.class.add(CLASS_SELECTED);
                }
                else {
                    label.class.remove(CLASS_SELECTED);
                }
            }
        }
        else {
            this._labelValue.value = '';
            this._containerTags.clear();
            this._containerTags.class.add(CLASS_TAGS_EMPTY);
            if (value && Array.isArray(value)) {
                for (const val of value) {
                    this._addTag(val);
                    const label = this._valueToLabel[val];
                    if (label) {
                        label.class.add(CLASS_SELECTED);
                    }
                }
                for (const key in this._valueToLabel) {
                    const label = this._valueToLabel[key];
                    if (value.indexOf(this._convertSingleValue(key)) !== -1) {
                        label.class.add(CLASS_SELECTED);
                    }
                    else {
                        label.class.remove(CLASS_SELECTED);
                    }
                }
            }
        }
    }
    _onMultipleValuesChange(values) {
        this._labelValue.value = '';
        this._containerTags.clear();
        this._containerTags.class.add(CLASS_TAGS_EMPTY);
        const tags = {};
        const valueCounts = {};
        values.forEach((arr) => {
            if (!arr)
                return;
            arr.forEach((val) => {
                if (!tags[val]) {
                    tags[val] = this._addTag(val);
                    valueCounts[val] = 1;
                }
                else {
                    valueCounts[val]++;
                }
            });
        });
        // add special class to tags that do not exist everywhere
        for (const val in valueCounts) {
            if (valueCounts[val] !== values.length) {
                tags[val].class.add(CLASS_TAG_NOT_EVERYWHERE);
                const label = this._valueToLabel[val];
                if (label) {
                    label.class.remove(CLASS_SELECTED);
                }
            }
        }
    }
    _addTag(value) {
        const container = new _Container_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]({
            flex: true,
            flexDirection: 'row',
            class: CLASS_TAG
        });
        container.append(new _Label_index_mjs__WEBPACK_IMPORTED_MODULE_4__["default"]({
            text: this._valueToText[value] || value
        }));
        const btnRemove = new _Button_index_mjs__WEBPACK_IMPORTED_MODULE_3__["default"]({
            size: 'small',
            icon: 'E132',
            tabIndex: -1
        });
        container.append(btnRemove);
        btnRemove.on('click', () => this._removeTag(container, value));
        this._containerTags.append(container);
        this._containerTags.class.remove(CLASS_TAGS_EMPTY);
        const label = this._valueToLabel[value];
        if (label) {
            label.class.add(CLASS_SELECTED);
        }
        // @ts-ignore
        container.value = value;
        return container;
    }
    _removeTag(tagElement, value) {
        tagElement.destroy();
        const label = this._valueToLabel[value];
        if (label) {
            label.class.remove(CLASS_SELECTED);
        }
        if (this._values) {
            this._values.forEach((arr) => {
                if (!arr)
                    return;
                const idx = arr.indexOf(value);
                if (idx !== -1) {
                    arr.splice(idx, 1);
                }
            });
        }
        else if (this._value && Array.isArray(this._value)) {
            const idx = this._value.indexOf(value);
            if (idx !== -1) {
                this._value.splice(idx, 1);
            }
        }
        this.emit('change', this.value);
        if (this._binding) {
            this._binding.removeValues([value]);
        }
    }
    _filterOptions(filter) {
        // first remove all options
        // then search the options for best matches
        // and add them back in best match order
        const containerDom = this._containerOptions.dom;
        while (containerDom.firstChild) {
            containerDom.removeChild(containerDom.lastChild);
        }
        if (filter) {
            const searchOptions = this.options.map((option) => {
                return [option.t, option.v];
            });
            const searchResults = (0,_helpers_search_mjs__WEBPACK_IMPORTED_MODULE_6__.searchItems)(searchOptions, filter);
            searchResults.forEach((value) => {
                const label = this._valueToLabel[value];
                containerDom.appendChild(label.dom);
            });
        }
        else {
            for (const option of this._options) {
                const label = this._valueToLabel[option.v];
                containerDom.appendChild(label.dom);
            }
        }
        // append create label in the end
        if (this._createLabelContainer) {
            containerDom.appendChild(this._createLabelContainer.dom);
        }
        if (containerDom.firstChild) {
            this._highlightLabel(containerDom.firstChild.ui);
        }
        this._resizeShadow();
    }
    _resizeShadow() {
        this._domShadow.style.height = (this._containerValue.height + this._containerOptions.height) + 'px';
    }
    _updateInputFieldsVisibility(focused) {
        let showInput = false;
        let focusInput = false;
        if (this._allowInput) {
            if (focused) {
                showInput = true;
                focusInput = true;
            }
            else {
                showInput = this.multiSelect || !this._valueToLabel[this.value];
            }
        }
        this._labelValue.hidden = showInput;
        this._labelIcon.hidden = showInput;
        this._input.hidden = !showInput;
        if (focusInput) {
            this._input.focus();
        }
        if (!this._labelValue.hidden) {
            // prevent label from being focused
            // right after input gets unfocused
            this._labelValue.tabIndex = -1;
            if (!this._timeoutLabelValueTabIndex) {
                this._timeoutLabelValueTabIndex = requestAnimationFrame(() => {
                    this._timeoutLabelValueTabIndex = null;
                    this._labelValue.tabIndex = 0;
                });
            }
        }
    }
    focus() {
        if (this._input.hidden) {
            this._labelValue.dom.focus();
        }
        else {
            this._input.focus();
        }
    }
    blur() {
        if (this._allowInput) {
            this._input.blur();
        }
        else {
            this._labelValue.dom.blur();
        }
    }
    /**
     * Opens the dropdown menu.
     */
    open() {
        if (!this._containerOptions.hidden || !this.enabled || this.readOnly)
            return;
        this._updateInputFieldsVisibility(true);
        // auto-update options if necessary
        if (this._optionsFn) {
            this.options = this._optionsFn();
        }
        if (this._containerOptions.dom.childNodes.length === 0)
            return;
        // highlight label that displays current value
        this._containerOptions.forEachChild((label) => {
            label.hidden = false;
            if (this._labelToValue.get(label) === this.value) {
                this._highlightLabel(label);
            }
        });
        if (!this._labelHighlighted) {
            this._highlightLabel(this._containerOptions.dom.childNodes[0].ui);
        }
        // show options
        this._containerOptions.hidden = false;
        this.class.add(CLASS_OPEN);
        // register keydown on entire window
        window.addEventListener('keydown', this._onKeyDown);
        // register mousedown on entire window
        window.addEventListener('mousedown', this._onWindowMouseDown);
        // if the dropdown list goes below the window show it above the field
        const startField = this._allowInput ? this._input.dom : this._labelValue.dom;
        const rect = startField.getBoundingClientRect();
        let fitHeight = (rect.bottom + this._containerOptions.height + DEFAULT_BOTTOM_OFFSET >= window.innerHeight);
        if (fitHeight && rect.top - this._containerOptions.height < 0) {
            // if showing it above the field means that some of it will not be visible
            // then show it below instead and adjust the max height to the maximum available space
            fitHeight = false;
            this._containerOptions.style.maxHeight = (window.innerHeight - rect.bottom - DEFAULT_BOTTOM_OFFSET) + 'px';
        }
        if (fitHeight) {
            this.class.add(CLASS_FIT_HEIGHT);
        }
        else {
            this.class.remove(CLASS_FIT_HEIGHT);
        }
        // resize the outer shadow to fit the element and the dropdown list
        // we need this because the dropdown list is position: absolute
        this._resizeShadow();
    }
    /**
     * Closes the dropdown menu.
     */
    close() {
        // there is a potential bug here if the user has set a max height
        // themselves then this will be overridden
        this._containerOptions.style.maxHeight = '';
        this._highlightLabel(null);
        this._updateInputFieldsVisibility(false);
        this._suspendInputChange = true;
        this._input.value = '';
        if (this._lastInputValue) {
            this._lastInputValue = '';
            this._filterOptions(null);
        }
        this._suspendInputChange = false;
        if (this._containerOptions.hidden)
            return;
        this._containerOptions.hidden = true;
        this._domShadow.style.height = '';
        this.class.remove(CLASS_OPEN);
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('mousedown', this._onWindowMouseDown);
    }
    /**
     * Toggles the dropdown menu.
     */
    toggle() {
        if (this._containerOptions.hidden) {
            this.open();
        }
        else {
            this.close();
        }
    }
    unlink() {
        super.unlink();
        if (!this._containerOptions.hidden) {
            this.close();
        }
    }
    _updateValue(value) {
        if (value === this._value)
            return;
        this._value = value;
        this._onValueChange(value);
        if (!this._suppressChange) {
            this.emit('change', value);
        }
        if (this._binding) {
            this._binding.setValue(value);
        }
    }
    _updateDisabledValue(value) {
        const labels = {};
        this._containerOptions.forEachChild((label) => {
            labels[label.dom.id] = label;
            if (this._disabledOptions[label.dom.id]) {
                label.enabled = false;
                label.text = this._disabledOptions[label.dom.id];
            }
            else {
                label.enabled = true;
                label.text = this._valueToText[label.dom.id];
            }
            label.class.remove(CLASS_DISABLED_VALUE);
        });
        const disabledValue = this._disabledOptions[value] ? value : null;
        let newValue = null;
        if (disabledValue) {
            if (this._fallbackOrder) {
                for (let i = 0; i < this._fallbackOrder.length; i++) {
                    if (this._fallbackOrder[i] === value)
                        continue;
                    newValue = this._fallbackOrder[i];
                    break;
                }
            }
            this.disabledValue = disabledValue;
            labels[disabledValue].class.add(CLASS_DISABLED_VALUE);
        }
        else if (this._disabledValue) {
            newValue = this._disabledValue;
            this.disabledValue = null;
        }
        else {
            newValue = value;
            this.disabledValue = null;
        }
        return newValue;
    }
    set options(value) {
        if (this._options && JSON.stringify(this._options) === JSON.stringify(value))
            return;
        this._containerOptions.clear();
        this._labelHighlighted = null;
        this._valueToText = {};
        this._valueToLabel = {};
        this._options = value;
        // store each option value -> title pair in the optionsIndex
        for (const option of this._options) {
            this._valueToText[option.v] = option.t;
            if (option.v === '')
                return;
            const label = new _Label_index_mjs__WEBPACK_IMPORTED_MODULE_4__["default"]({
                text: option.t,
                tabIndex: -1,
                id: option.v
            });
            this._labelToValue.set(label, option.v);
            // store labels in an index too
            this._valueToLabel[option.v] = label;
            // on clicking an option set it as the value and close the dropdown list
            label.on('click', (e) => {
                e.stopPropagation();
                this._onSelectValue(option.v);
                this.close();
                if (this._onSelect) {
                    this._onSelect(this.value);
                }
            });
            this._containerOptions.append(label);
        }
        this._createLabelContainer = null;
        if (this._createLabelText) {
            this._createLabelContainer = this._initializeCreateLabel();
        }
        if (this.multiSelect && this._values) {
            this._onMultipleValuesChange(this._values);
        }
        else {
            this._onValueChange(this.value);
        }
        if (this._lastInputValue) {
            this._filterOptions(this._lastInputValue);
        }
    }
    get options() {
        return this._options.slice();
    }
    set invalidOptions(value) {
        this._invalidOptions = value || null;
    }
    get invalidOptions() {
        return this._invalidOptions;
    }
    set disabledValue(value) {
        this._disabledValue = value;
        if (this._disabledValue !== null) {
            this.class.add(CLASS_HAS_DISABLED_VALUE);
        }
        else {
            this.class.remove(CLASS_HAS_DISABLED_VALUE);
        }
    }
    set disabledOptions(value) {
        if (JSON.stringify(this._disabledOptions) === JSON.stringify(value))
            return;
        this._disabledOptions = value || {};
        const newValue = this._updateDisabledValue(this._value);
        this._updateValue(newValue);
    }
    set fallbackOrder(value) {
        this._fallbackOrder = value || null;
    }
    get multiSelect() {
        return this.class.contains(CLASS_MULTI_SELECT);
    }
    set value(value) {
        this._values = null;
        this._suspendInputChange = true;
        this._input.value = '';
        if (this._lastInputValue) {
            this._lastInputValue = '';
            this._filterOptions(null);
        }
        this._suspendInputChange = false;
        this.class.remove(_class_mjs__WEBPACK_IMPORTED_MODULE_5__.MULTIPLE_VALUES);
        value = this._convertValue(value);
        if (this._value === value || this.multiSelect && this._value && this._value.equals(value)) {
            // if the value is null because we are showing multiple values
            // but someone wants to actually set the value of all observers to null
            // then make sure we do not return early
            if (value !== null || !this._allowNull || !this.class.contains(_class_mjs__WEBPACK_IMPORTED_MODULE_5__.MULTIPLE_VALUES)) {
                return;
            }
        }
        this.disabledValue = null;
        this._updateValue(value);
    }
    get value() {
        if (!this.multiSelect) {
            return this._value;
        }
        // if multi-select then construct an array
        // value from the tags that are currently visible
        const result = [];
        this._containerTags.dom.childNodes.forEach((dom) => {
            // @ts-ignore
            result.push(dom.ui.value);
        });
        return result;
    }
    /* eslint accessor-pairs: 0 */
    set values(values) {
        values = values.map((value) => {
            return this._convertValue(value);
        });
        let different = false;
        const value = values[0];
        const multiSelect = this.multiSelect;
        this._values = null;
        for (let i = 1; i < values.length; i++) {
            if (values[i] !== value && (!multiSelect || !values[i] || !values[i].equals(value))) {
                different = true;
                break;
            }
        }
        if (different) {
            this._labelValue.values = values;
            // show all different tags
            if (multiSelect) {
                this._values = values;
                this._value = null;
                this._onMultipleValuesChange(this._values);
                this.emit('change', this.value);
            }
            else {
                if (this._value !== null) {
                    this._value = null;
                    this.emit('change', null);
                }
            }
            this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_5__.MULTIPLE_VALUES);
        }
        else {
            this.value = values[0];
        }
    }
    set placeholder(value) {
        this._input.placeholder = value;
    }
    get placeholder() {
        return this._input.placeholder;
    }
    set renderChanges(value) {
        this._renderChanges = value;
    }
    get renderChanges() {
        return this._renderChanges;
    }
}
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"].register('select', SelectInput, { renderChanges: true });
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"].register('multiselect', SelectInput, { multiSelect: true, renderChanges: true });
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"].register('tags', SelectInput, { allowInput: true, allowCreate: true, multiSelect: true, renderChanges: true });
var SelectInput$1 = SelectInput;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/SliderInput/index.mjs":
/*!****************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/SliderInput/index.mjs ***!
  \****************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SliderInput$1)
/* harmony export */ });
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");
/* harmony import */ var _NumericInput_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../NumericInput/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/NumericInput/index.mjs");
/* harmony import */ var _class_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../class.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/class.mjs");




var _a;
const CLASS_SLIDER = 'pcui-slider';
const CLASS_SLIDER_CONTAINER = CLASS_SLIDER + '-container';
const CLASS_SLIDER_BAR = CLASS_SLIDER + '-bar';
const CLASS_SLIDER_HANDLE = CLASS_SLIDER + '-handle';
const CLASS_SLIDER_ACTIVE = CLASS_SLIDER + '-active';
const IS_CHROME = /Chrome\//.test((_a = globalThis.navigator) === null || _a === void 0 ? void 0 : _a.userAgent);
/**
 * The SliderInput shows a NumericInput and a slider widget next to it. It acts as a proxy of the
 * NumericInput.
 */
class SliderInput extends _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"] {
    /**
     * Creates a new SliderInput.
     *
     * @param args - The arguments.
     */
    constructor(args = {}) {
        var _a, _b, _c, _d, _e;
        super(args);
        this._historyCombine = false;
        this._historyPostfix = null;
        this._cursorHandleOffset = 0;
        this._touchId = null;
        this._onMouseDown = (evt) => {
            if (evt.button !== 0 || !this.enabled || this.readOnly)
                return;
            this._onSlideStart(evt.pageX);
        };
        this._onMouseMove = (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
            this._onSlideMove(evt.pageX);
        };
        this._onMouseUp = (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
            this._onSlideEnd(evt.pageX);
        };
        this._onTouchStart = (evt) => {
            if (!this.enabled || this.readOnly)
                return;
            for (let i = 0; i < evt.changedTouches.length; i++) {
                const touch = evt.changedTouches[i];
                const node = touch.target;
                if (!node.ui || node.ui !== this)
                    continue;
                this._touchId = touch.identifier;
                this._onSlideStart(touch.pageX);
                break;
            }
        };
        this._onTouchMove = (evt) => {
            for (let i = 0; i < evt.changedTouches.length; i++) {
                const touch = evt.changedTouches[i];
                if (touch.identifier !== this._touchId)
                    continue;
                evt.stopPropagation();
                evt.preventDefault();
                this._onSlideMove(touch.pageX);
                break;
            }
        };
        this._onTouchEnd = (evt) => {
            for (let i = 0; i < evt.changedTouches.length; i++) {
                const touch = evt.changedTouches[i];
                if (touch.identifier !== this._touchId)
                    continue;
                evt.stopPropagation();
                evt.preventDefault();
                this._onSlideEnd(touch.pageX);
                this._touchId = null;
                break;
            }
        };
        this._onKeyDown = (evt) => {
            if (evt.key === 'Escape') {
                this.blur();
                return;
            }
            if (!this.enabled || this.readOnly)
                return;
            // move slider with left / right arrow keys
            if (evt.key !== 'ArrowLeft' && evt.key !== 'ArrowRight')
                return;
            evt.stopPropagation();
            evt.preventDefault();
            let x = evt.key === 'ArrowLeft' ? -1 : 1;
            if (evt.shiftKey) {
                x *= 10;
            }
            this.value += x * this.step;
        };
        this.class.add(CLASS_SLIDER);
        const numericInput = new _NumericInput_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]({
            allowNull: args.allowNull,
            hideSlider: true,
            min: args.min,
            max: args.max,
            keyChange: args.keyChange,
            placeholder: args.placeholder,
            precision: (_a = args.precision) !== null && _a !== void 0 ? _a : 2,
            renderChanges: args.renderChanges,
            step: args.step
        });
        // propagate change event
        numericInput.on('change', (value) => {
            this._onValueChange(value);
        });
        // propagate focus / blur events
        numericInput.on('focus', () => {
            this.emit('focus');
        });
        numericInput.on('blur', () => {
            this.emit('blur');
        });
        numericInput.parent = this;
        this.dom.appendChild(numericInput.dom);
        this._numericInput = numericInput;
        this._sliderMin = (_c = (_b = args.sliderMin) !== null && _b !== void 0 ? _b : args.min) !== null && _c !== void 0 ? _c : 0;
        this._sliderMax = (_e = (_d = args.sliderMax) !== null && _d !== void 0 ? _d : args.max) !== null && _e !== void 0 ? _e : 1;
        this._domSlider = document.createElement('div');
        this._domSlider.classList.add(CLASS_SLIDER_CONTAINER);
        this.dom.appendChild(this._domSlider);
        this._domBar = document.createElement('div');
        this._domBar.classList.add(CLASS_SLIDER_BAR);
        this._domBar.ui = this;
        this._domSlider.appendChild(this._domBar);
        this._domHandle = document.createElement('div');
        this._domHandle.ui = this;
        this._domHandle.tabIndex = 0;
        this._domHandle.classList.add(CLASS_SLIDER_HANDLE);
        this._domBar.appendChild(this._domHandle);
        this._domSlider.addEventListener('mousedown', this._onMouseDown);
        this._domSlider.addEventListener('touchstart', this._onTouchStart, { passive: true });
        this._domHandle.addEventListener('keydown', this._onKeyDown);
        if (args.value !== undefined) {
            this.value = args.value;
        }
        if (args.values !== undefined) {
            this.values = args.values;
        }
        // update the handle in case a 0 value has been
        // passed through the constructor
        if (this.value === 0) {
            this._updateHandle(0);
        }
    }
    destroy() {
        if (this._destroyed)
            return;
        this._domSlider.removeEventListener('mousedown', this._onMouseDown);
        this._domSlider.removeEventListener('touchstart', this._onTouchStart);
        this._domHandle.removeEventListener('keydown', this._onKeyDown);
        this.dom.removeEventListener('mouseup', this._onMouseUp);
        this.dom.removeEventListener('mousemove', this._onMouseMove);
        this.dom.removeEventListener('touchmove', this._onTouchMove);
        this.dom.removeEventListener('touchend', this._onTouchEnd);
        super.destroy();
    }
    _updateHandle(value) {
        const left = Math.max(0, Math.min(1, ((value || 0) - this._sliderMin) / (this._sliderMax - this._sliderMin))) * 100;
        const handleWidth = this._domHandle.getBoundingClientRect().width;
        this._domHandle.style.left = `calc(${left}% + ${handleWidth / 2}px)`;
    }
    _onValueChange(value) {
        this._updateHandle(value);
        if (!this._suppressChange) {
            this.emit('change', value);
        }
        if (this._binding) {
            this._binding.setValue(value);
        }
    }
    // Calculates the distance in pixels between
    // the cursor x and the middle of the handle.
    // If the cursor is not on the handle sets the offset to 0
    _calculateCursorHandleOffset(pageX) {
        // not sure why but the left side needs a margin of a couple of pixels
        // to properly determine if the cursor is on the handle (in Chrome)
        const margin = IS_CHROME ? 2 : 0;
        const rect = this._domHandle.getBoundingClientRect();
        const left = rect.left - margin;
        const right = rect.right;
        if (pageX >= left && pageX <= right) {
            this._cursorHandleOffset = pageX - (left + (right - left) / 2);
        }
        else {
            this._cursorHandleOffset = 0;
        }
        return this._cursorHandleOffset;
    }
    _onSlideStart(pageX) {
        this._domHandle.focus();
        if (this._touchId === null) {
            window.addEventListener('mousemove', this._onMouseMove);
            window.addEventListener('mouseup', this._onMouseUp);
        }
        else {
            window.addEventListener('touchmove', this._onTouchMove);
            window.addEventListener('touchend', this._onTouchEnd);
        }
        this.class.add(CLASS_SLIDER_ACTIVE);
        // calculate the cursor - handle offset. If there is
        // an offset that means the cursor is on the handle so
        // do not move the handle until the cursor moves.
        if (!this._calculateCursorHandleOffset(pageX)) {
            this._onSlideMove(pageX);
        }
        if (this.binding) {
            this._historyCombine = this.binding.historyCombine;
            this._historyPostfix = this.binding.historyPostfix;
            this.binding.historyCombine = true;
            this.binding.historyPostfix = `(${Date.now()})`;
        }
    }
    _onSlideMove(pageX) {
        const rect = this._domBar.getBoundingClientRect();
        // reduce pageX by the initial cursor - handle offset
        pageX -= this._cursorHandleOffset;
        const x = Math.max(0, Math.min(1, (pageX - rect.left) / rect.width));
        const range = this._sliderMax - this._sliderMin;
        let value = (x * range) + this._sliderMin;
        value = parseFloat(value.toFixed(this.precision));
        this.value = value;
    }
    _onSlideEnd(pageX) {
        // when slide ends only move the handle if the cursor is no longer
        // on the handle
        if (!this._calculateCursorHandleOffset(pageX)) {
            this._onSlideMove(pageX);
        }
        this.class.remove(CLASS_SLIDER_ACTIVE);
        if (this._touchId === null) {
            window.removeEventListener('mousemove', this._onMouseMove);
            window.removeEventListener('mouseup', this._onMouseUp);
        }
        else {
            window.removeEventListener('touchmove', this._onTouchMove);
            window.removeEventListener('touchend', this._onTouchEnd);
        }
        if (this.binding) {
            this.binding.historyCombine = this._historyCombine;
            this.binding.historyPostfix = this._historyPostfix;
            this._historyCombine = false;
            this._historyPostfix = null;
        }
    }
    focus() {
        this._numericInput.focus();
    }
    blur() {
        this._domHandle.blur();
        this._numericInput.blur();
    }
    /**
     * Gets / sets the minimum value that the slider field can take.
     */
    set sliderMin(value) {
        if (this._sliderMin === value)
            return;
        this._sliderMin = value;
        this._updateHandle(this.value);
    }
    get sliderMin() {
        return this._sliderMin;
    }
    /**
     * Gets / sets the maximum value that the slider field can take.
     */
    set sliderMax(value) {
        if (this._sliderMax === value)
            return;
        this._sliderMax = value;
        this._updateHandle(this.value);
    }
    get sliderMax() {
        return this._sliderMax;
    }
    set value(value) {
        this._numericInput.value = value;
        if (this._numericInput.class.contains(_class_mjs__WEBPACK_IMPORTED_MODULE_2__.MULTIPLE_VALUES)) {
            this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_2__.MULTIPLE_VALUES);
        }
        else {
            this.class.remove(_class_mjs__WEBPACK_IMPORTED_MODULE_2__.MULTIPLE_VALUES);
        }
    }
    get value() {
        return this._numericInput.value;
    }
    /* eslint accessor-pairs: 0 */
    set values(values) {
        this._numericInput.values = values;
        if (this._numericInput.class.contains(_class_mjs__WEBPACK_IMPORTED_MODULE_2__.MULTIPLE_VALUES)) {
            this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_2__.MULTIPLE_VALUES);
        }
        else {
            this.class.remove(_class_mjs__WEBPACK_IMPORTED_MODULE_2__.MULTIPLE_VALUES);
        }
    }
    set renderChanges(value) {
        this._numericInput.renderChanges = value;
    }
    get renderChanges() {
        return this._numericInput.renderChanges;
    }
    /**
     * Gets / sets the minimum value that the numeric input field can take.
     */
    set min(value) {
        this._numericInput.min = value;
    }
    get min() {
        return this._numericInput.min;
    }
    /**
     * Gets / sets the maximum value that the numeric input field can take.
     */
    set max(value) {
        this._numericInput.max = value;
    }
    get max() {
        return this._numericInput.max;
    }
    /**
     * Gets / sets the amount that the value will be increased or decreased when using the arrow keys. Holding Shift will use 10x the step.
     */
    set step(value) {
        this._numericInput.step = value;
    }
    get step() {
        return this._numericInput.step;
    }
    /**
     * Gets / sets the maximum number of decimals a value can take.
     */
    set precision(value) {
        this._numericInput.precision = value;
    }
    get precision() {
        return this._numericInput.precision;
    }
    set keyChange(value) {
        this._numericInput.keyChange = value;
    }
    get keyChange() {
        return this._numericInput.keyChange;
    }
    set placeholder(value) {
        this._numericInput.placeholder = value;
    }
    get placeholder() {
        return this._numericInput.placeholder;
    }
}
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"].register('slider', SliderInput, { renderChanges: true });
var SliderInput$1 = SliderInput;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/Spinner/index.mjs":
/*!************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/Spinner/index.mjs ***!
  \************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Spinner$1)
/* harmony export */ });
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");


const CLASS_ROOT = 'pcui-spinner';
function createSmallThick(size, dom) {
    const spinner = dom || document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    spinner.classList.add('spin');
    spinner.setAttribute('width', size);
    spinner.setAttribute('height', size);
    spinner.setAttribute('viewBox', '0 0 14 14');
    spinner.setAttribute('fill', 'none');
    spinner.innerHTML = '<path d="M7 14C3.13871 14 0 10.8613 0 7C0 3.13871 3.13871 0 7 0C10.8613 0 14 3.13871 14 7C14 10.8613 10.8613 14 7 14ZM7 2.25806C4.38064 2.25806 2.25806 4.38064 2.25806 7C2.25806 9.61935 4.38064 11.7419 7 11.7419C9.61935 11.7419 11.7419 9.61935 11.7419 7C11.7419 4.38064 9.61935 2.25806 7 2.25806Z" fill="#773417"/><path class="pcui-spinner-highlight" d="M7 14V11.7419C9.61935 11.7419 11.7419 9.61935 11.7419 7H14C14 10.8613 10.8613 14 7 14Z" fill="#FF6600"/>';
    return spinner;
}
/**
 * Represents a spinning icon.
 */
class Spinner extends _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"] {
    /**
     * Sets the pixel size of the spinner
     *
     * @param args - The arguments.
     */
    constructor(args = {}) {
        var _a, _b;
        if (((_a = args.type) !== null && _a !== void 0 ? _a : 'small-thick') === Spinner.TYPE_SMALL_THICK) {
            const dom = createSmallThick((_b = args.size) !== null && _b !== void 0 ? _b : 12, args.dom);
            args = Object.assign(Object.assign({}, args), { dom });
        }
        super(args);
        this.class.add(CLASS_ROOT);
    }
}
Spinner.TYPE_SMALL_THICK = 'small-thick';
var Spinner$1 = Spinner;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/TextAreaInput/index.mjs":
/*!******************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/TextAreaInput/index.mjs ***!
  \******************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TextAreaInput$1)
/* harmony export */ });
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");
/* harmony import */ var _TextInput_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../TextInput/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/TextInput/index.mjs");



const CLASS_TEXT_AREA_INPUT = 'pcui-text-area-input';
const CLASS_TEXT_AREA_INPUT_RESIZABLE = CLASS_TEXT_AREA_INPUT + '-resizable';
const CLASS_TEXT_AREA_INPUT_RESIZABLE_NONE = CLASS_TEXT_AREA_INPUT_RESIZABLE + '-none';
const CLASS_TEXT_AREA_INPUT_RESIZABLE_BOTH = CLASS_TEXT_AREA_INPUT_RESIZABLE + '-both';
const CLASS_TEXT_AREA_INPUT_RESIZABLE_HORIZONTAL = CLASS_TEXT_AREA_INPUT_RESIZABLE + '-horizontal';
const CLASS_TEXT_AREA_INPUT_RESIZABLE_VERTICAL = CLASS_TEXT_AREA_INPUT_RESIZABLE + '-vertical';
/**
 * The TextAreaInput wraps a textarea element. It has the same interface as {@link TextInput}.
 */
class TextAreaInput extends _TextInput_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"] {
    constructor(args = {}) {
        args = Object.assign({
            input: document.createElement('textarea')
        }, args);
        super(args);
        this.class.add(CLASS_TEXT_AREA_INPUT);
        switch (args.resizable) {
            case 'both':
                this.class.add(CLASS_TEXT_AREA_INPUT_RESIZABLE_BOTH);
                break;
            case 'horizontal':
                this.class.add(CLASS_TEXT_AREA_INPUT_RESIZABLE_HORIZONTAL);
                break;
            case 'vertical':
                this.class.add(CLASS_TEXT_AREA_INPUT_RESIZABLE_VERTICAL);
                break;
            case 'none':
            default:
                this.class.add(CLASS_TEXT_AREA_INPUT_RESIZABLE_NONE);
                break;
        }
    }
    _onInputKeyDown(evt) {
        if ((evt.key === 'Escape' && this.blurOnEscape) || (evt.key === 'Enter' && this.blurOnEnter && !evt.shiftKey)) {
            this._domInput.blur();
        }
        this.emit('keydown', evt);
    }
}
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"].register('text', TextAreaInput, { renderChanges: true });
var TextAreaInput$1 = TextAreaInput;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/TextInput/index.mjs":
/*!**************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/TextInput/index.mjs ***!
  \**************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TextInput$1)
/* harmony export */ });
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");
/* harmony import */ var _InputElement_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../InputElement/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/InputElement/index.mjs");
/* harmony import */ var _class_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../class.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/class.mjs");




const CLASS_TEXT_INPUT = 'pcui-text-input';
/**
 * The TextInput is an input element of type text.
 */
class TextInput extends _InputElement_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"] {
    constructor(args = {}) {
        super(args);
        this.class.add(CLASS_TEXT_INPUT);
        if (args.onValidate) {
            this.onValidate = args.onValidate;
        }
    }
    _onInputChange(evt) {
        if (this._suspendInputChangeEvt)
            return;
        if (this._onValidate) {
            const error = !this._onValidate(this.value);
            this.error = error;
            if (error) {
                return;
            }
        }
        else {
            this.error = false;
        }
        this.emit('change', this.value);
        if (this._binding) {
            this._binding.setValue(this.value);
        }
    }
    _updateValue(value) {
        this.class.remove(_class_mjs__WEBPACK_IMPORTED_MODULE_2__.MULTIPLE_VALUES);
        if (value && typeof (value) === 'object') {
            if (Array.isArray(value)) {
                let isObject = false;
                for (let i = 0; i < value.length; i++) {
                    if (value[i] && typeof value[i] === 'object') {
                        isObject = true;
                        break;
                    }
                }
                value = isObject ? '[Not available]' : value.map((val) => {
                    return val === null ? 'null' : val;
                }).join(',');
            }
            else {
                value = '[Not available]';
            }
        }
        if (value === this.value)
            return false;
        this._suspendInputChangeEvt = true;
        this._domInput.value = (value === null || value === undefined) ? '' : String(value);
        this._suspendInputChangeEvt = false;
        this.emit('change', value);
        return true;
    }
    set value(value) {
        const changed = this._updateValue(value);
        if (changed) {
            // reset error
            this.error = false;
        }
        if (changed && this._binding) {
            this._binding.setValue(value);
        }
    }
    get value() {
        return this._domInput.value;
    }
    /* eslint accessor-pairs: 0 */
    set values(values) {
        const different = values.some(v => v !== values[0]);
        if (different) {
            this._updateValue(null);
            this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_2__.MULTIPLE_VALUES);
        }
        else {
            this._updateValue(values[0]);
        }
    }
    /**
     * Gets / sets the validate method for the input.
     */
    set onValidate(value) {
        this._onValidate = value;
    }
    get onValidate() {
        return this._onValidate;
    }
}
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"].register('string', TextInput, { renderChanges: true });
var TextInput$1 = TextInput;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/TreeView/index.mjs":
/*!*************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/TreeView/index.mjs ***!
  \*************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TreeView$1)
/* harmony export */ });
/* harmony import */ var _Container_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Container/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Container/index.mjs");
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");
/* harmony import */ var _TreeViewItem_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../TreeViewItem/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/TreeViewItem/index.mjs");
/* harmony import */ var _helpers_search_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../helpers/search.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/helpers/search.mjs");





const CLASS_ROOT = 'pcui-treeview';
const CLASS_DRAGGED_ITEM = CLASS_ROOT + '-item-dragged';
const CLASS_DRAGGED_HANDLE = CLASS_ROOT + '-drag-handle';
const CLASS_FILTERING = CLASS_ROOT + '-filtering';
const CLASS_FILTER_RESULT = CLASS_FILTERING + '-result';
const DRAG_AREA_INSIDE = 'inside';
const DRAG_AREA_BEFORE = 'before';
const DRAG_AREA_AFTER = 'after';
/**
 * A container that can show a TreeView like a hierarchy. The TreeView contains
 * {@link TreeViewItem}s.
 */
class TreeView extends _Container_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"] {
    /**
     * Creates a new TreeView.
     *
     * @param args - The arguments.
     */
    constructor(args = {}) {
        var _a, _b, _c;
        super(args);
        this._selectedItems = [];
        this._dragItems = [];
        this._dragging = false;
        this._dragOverItem = null;
        this._dragArea = DRAG_AREA_INSIDE;
        this._dragScroll = 0;
        this._dragScrollInterval = null;
        this._pressedCtrl = false;
        this._pressedShift = false;
        this._filter = null;
        this._filterResults = [];
        this._updateModifierKeys = (evt) => {
            this._pressedCtrl = evt.ctrlKey || evt.metaKey;
            this._pressedShift = evt.shiftKey;
        };
        // Called when the mouse cursor leaves the tree view.
        this._onMouseLeave = (evt) => {
            if (!this._allowDrag || !this._dragging)
                return;
            this._dragOverItem = null;
            this._updateDragHandle();
        };
        // Called when the mouse moves while dragging
        this._onMouseMove = (evt) => {
            if (!this._dragging)
                return;
            // Determine if we need to scroll the treeview if we are dragging towards the edges
            const rect = this.dom.getBoundingClientRect();
            this._dragScroll = 0;
            let top = rect.top;
            let bottom = rect.bottom;
            if (this._dragScrollElement !== this) {
                const dragScrollRect = this._dragScrollElement.dom.getBoundingClientRect();
                top = Math.max(top + this._dragScrollElement.dom.scrollTop, dragScrollRect.top);
                bottom = Math.min(bottom + this._dragScrollElement.dom.scrollTop, dragScrollRect.bottom);
            }
            top = Math.max(0, top);
            bottom = Math.min(bottom, document.body.clientHeight);
            if (evt.pageY < top + 32 && this._dragScrollElement.dom.scrollTop > 0) {
                this._dragScroll = -1;
            }
            else if (evt.pageY > bottom - 32 && this._dragScrollElement.dom.scrollHeight > this._dragScrollElement.height + this._dragScrollElement.dom.scrollTop) {
                this._dragScroll = 1;
            }
        };
        // Called while we drag the drag handle
        this._onDragMove = (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            if (!this._allowDrag || !this._dragOverItem)
                return;
            const rect = this._dragHandle.dom.getBoundingClientRect();
            const area = Math.floor((evt.clientY - rect.top) / rect.height * 5);
            const oldArea = this._dragArea;
            const oldDragOver = this._dragOverItem;
            if (this._dragOverItem.parent === this) {
                let parent = false;
                for (let i = 0; i < this._dragItems.length; i++) {
                    if (this._dragItems[i].parent === this._dragOverItem) {
                        parent = true;
                        this._dragOverItem = null;
                        break;
                    }
                }
                if (!parent) {
                    this._dragArea = DRAG_AREA_INSIDE;
                }
            }
            else {
                // check if we are trying to drag item inside any of its children
                let invalid = false;
                for (let i = 0; i < this._dragItems.length; i++) {
                    if (this._dragItems[i].dom.contains(this._dragOverItem.dom)) {
                        invalid = true;
                        break;
                    }
                }
                if (invalid) {
                    this._dragOverItem = null;
                }
                else if (this._allowReordering && area <= 1 && this._dragItems.indexOf(this._dragOverItem.previousSibling) === -1) {
                    this._dragArea = DRAG_AREA_BEFORE;
                }
                else if (this._allowReordering && area >= 4 && this._dragItems.indexOf(this._dragOverItem.nextSibling) === -1 && (this._dragOverItem.numChildren === 0 || !this._dragOverItem.open)) {
                    this._dragArea = DRAG_AREA_AFTER;
                }
                else {
                    let parent = false;
                    if (this._allowReordering && this._dragOverItem.open) {
                        for (let i = 0; i < this._dragItems.length; i++) {
                            if (this._dragItems[i].parent === this._dragOverItem) {
                                parent = true;
                                this._dragArea = DRAG_AREA_BEFORE;
                                break;
                            }
                        }
                    }
                    if (!parent)
                        this._dragArea = DRAG_AREA_INSIDE;
                }
            }
            if (oldArea !== this._dragArea || oldDragOver !== this._dragOverItem) {
                this._updateDragHandle();
            }
        };
        this.class.add(CLASS_ROOT);
        this._allowDrag = (_a = args.allowDrag) !== null && _a !== void 0 ? _a : true;
        this._allowReordering = (_b = args.allowReordering) !== null && _b !== void 0 ? _b : true;
        this._allowRenaming = (_c = args.allowRenaming) !== null && _c !== void 0 ? _c : false;
        this._dragHandle = new _Element_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]({
            class: CLASS_DRAGGED_HANDLE
        });
        this._dragScrollElement = args.dragScrollElement || this;
        this.append(this._dragHandle);
        this._onContextMenu = args.onContextMenu;
        this._onReparentFn = args.onReparent;
        this._wasDraggingAllowedBeforeFiltering = this._allowDrag;
        window.addEventListener('keydown', this._updateModifierKeys);
        window.addEventListener('keyup', this._updateModifierKeys);
        window.addEventListener('mousedown', this._updateModifierKeys);
        this.dom.addEventListener('mouseleave', this._onMouseLeave);
        this._dragHandle.dom.addEventListener('mousemove', this._onDragMove);
        this._dragHandle.on('destroy', (dom) => {
            dom.removeEventListener('mousemove', this._onDragMove);
        });
    }
    destroy() {
        if (this._destroyed)
            return;
        window.removeEventListener('keydown', this._updateModifierKeys);
        window.removeEventListener('keyup', this._updateModifierKeys);
        window.removeEventListener('mousedown', this._updateModifierKeys);
        window.removeEventListener('mousemove', this._onMouseMove);
        this.dom.removeEventListener('mouseleave', this._onMouseLeave);
        if (this._dragScrollInterval) {
            window.clearInterval(this._dragScrollInterval);
            this._dragScrollInterval = null;
        }
        super.destroy();
    }
    /**
     * Finds the next tree item that is not currently hidden.
     *
     * @param currentItem - The current tree item.
     * @returns The next visible tree item.
     */
    _findNextVisibleTreeItem(currentItem) {
        if (currentItem.numChildren > 0 && currentItem.open) {
            return currentItem.firstChild;
        }
        const sibling = currentItem.nextSibling;
        if (sibling)
            return sibling;
        let parent = currentItem.parent;
        if (!(parent instanceof _TreeViewItem_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]))
            return null;
        let parentSibling = parent.nextSibling;
        while (!parentSibling) {
            parent = parent.parent;
            if (!(parent instanceof _TreeViewItem_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"])) {
                break;
            }
            parentSibling = parent.nextSibling;
        }
        return parentSibling;
    }
    /**
     * Finds the last visible child tree item of the specified tree item.
     *
     * @param currentItem - The current item.
     * @returns The last child item.
     */
    _findLastVisibleChildTreeItem(currentItem) {
        if (!currentItem.numChildren || !currentItem.open)
            return null;
        let lastChild = currentItem.lastChild;
        while (lastChild && lastChild.numChildren && lastChild.open) {
            lastChild = lastChild.lastChild;
        }
        return lastChild;
    }
    /**
     * Finds the previous visible tree item of the specified tree item.
     *
     * @param currentItem - The current tree item.
     * @returns The previous item.
     */
    _findPreviousVisibleTreeItem(currentItem) {
        const sibling = currentItem.previousSibling;
        if (sibling) {
            if (sibling.numChildren > 0 && sibling.open) {
                return this._findLastVisibleChildTreeItem(sibling);
            }
            return sibling;
        }
        const parent = currentItem.parent;
        if (!(parent instanceof _TreeViewItem_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]))
            return null;
        return parent;
    }
    /**
     * Gets the visible tree items between the specified start and end tree items.
     *
     * @param startChild - The start tree item.
     * @param endChild - The end tree item.
     */
    _getChildrenRange(startChild, endChild) {
        const result = [];
        // select search results if we are currently filtering tree view items
        if (this._filterResults.length) {
            const filterResults = this.dom.querySelectorAll(`.${CLASS_ROOT}-item.${CLASS_FILTER_RESULT}`);
            let startIndex = -1;
            let endIndex = -1;
            for (let i = 0; i < filterResults.length; i++) {
                const item = filterResults[i].ui;
                if (item === startChild) {
                    startIndex = i;
                }
                else if (item === endChild) {
                    endIndex = i;
                }
                if (startIndex !== -1 && endIndex !== -1) {
                    const start = (startIndex < endIndex ? startIndex : endIndex);
                    const end = (startIndex < endIndex ? endIndex : startIndex);
                    for (let j = start; j <= end; j++) {
                        result.push(filterResults[j].ui);
                    }
                    break;
                }
            }
        }
        else {
            // if we are not filtering the tree view then find the next visible tree item
            let current = startChild;
            const rectStart = startChild.dom.getBoundingClientRect();
            const rectEnd = endChild.dom.getBoundingClientRect();
            if (rectStart.top < rectEnd.top) {
                while (current && current !== endChild) {
                    current = this._findNextVisibleTreeItem(current);
                    if (current && current !== endChild) {
                        result.push(current);
                    }
                }
            }
            else {
                while (current && current !== endChild) {
                    current = this._findPreviousVisibleTreeItem(current);
                    if (current && current !== endChild) {
                        result.push(current);
                    }
                }
            }
            result.push(endChild);
        }
        return result;
    }
    _onAppendChild(element) {
        super._onAppendChild(element);
        if (element instanceof _TreeViewItem_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]) {
            this._onAppendTreeViewItem(element);
        }
    }
    _onRemoveChild(element) {
        if (element instanceof _TreeViewItem_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]) {
            this._onRemoveTreeViewItem(element);
        }
        super._onRemoveChild(element);
    }
    _onAppendTreeViewItem(item) {
        item.treeView = this;
        if (this._filter) {
            // add new item to filtered results if it
            // satisfies the current filter
            this._searchItems([[item.text, item]], this._filter);
        }
        // do the same for all children of the element
        item.forEachChild((child) => {
            if (child instanceof _TreeViewItem_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]) {
                this._onAppendTreeViewItem(child);
            }
        });
    }
    _onRemoveTreeViewItem(item) {
        item.selected = false;
        // do the same for all children of the element
        item.forEachChild((child) => {
            if (child instanceof _TreeViewItem_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]) {
                this._onRemoveTreeViewItem(child);
            }
        });
    }
    // Called when a key is down on a child TreeViewItem.
    _onChildKeyDown(evt, item) {
        if (['Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(evt.key) === -1)
            return;
        evt.preventDefault();
        evt.stopPropagation();
        if (evt.key === 'ArrowDown') {
            // select next tree item
            if (this._selectedItems.length) {
                const next = this._findNextVisibleTreeItem(item);
                if (next) {
                    if (this._pressedShift || this._pressedCtrl) {
                        next.selected = true;
                    }
                    else {
                        this._selectSingleItem(next);
                    }
                }
            }
        }
        else if (evt.key === 'ArrowUp') {
            // select previous tree item
            if (this._selectedItems.length) {
                const prev = this._findPreviousVisibleTreeItem(item);
                if (prev) {
                    if (this._pressedShift || this._pressedCtrl) {
                        prev.selected = true;
                    }
                    else {
                        this._selectSingleItem(prev);
                    }
                }
            }
        }
        else if (evt.key === 'ArrowLeft') {
            // close selected tree item
            if (item.parent !== this) {
                item.open = false;
            }
        }
        else if (evt.key === 'ArrowRight') {
            // open selected tree item
            item.open = true;
        }
        else ;
    }
    // Called when we click on a child TreeViewItem
    _onChildClick(evt, item) {
        if (evt.button !== 0)
            return;
        if (!item.allowSelect)
            return;
        if (this._pressedCtrl) {
            // toggle selection when Ctrl is pressed
            item.selected = !item.selected;
        }
        else if (this._pressedShift) {
            // on shift add to selection
            if (!this._selectedItems.length || this._selectedItems.length === 1 && this._selectedItems[0] === item) {
                item.selected = true;
                return;
            }
            const selected = this._selectedItems[this._selectedItems.length - 1];
            this._openHierarchy(selected);
            const children = this._getChildrenRange(selected, item);
            children.forEach((child) => {
                if (child.allowSelect) {
                    child.selected = true;
                }
            });
        }
        else {
            // deselect other items
            this._selectSingleItem(item);
        }
    }
    /**
     * Call specified function on every child TreeViewItem by traversing the hierarchy depth first.
     *
     * @param fn - The function to call. The function takes the TreeViewItem as an argument.
     */
    _traverseDepthFirst(fn) {
        function traverse(item) {
            if (!item || !(item instanceof _TreeViewItem_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]))
                return;
            fn(item);
            if (item.numChildren) {
                for (const child of item.dom.childNodes) {
                    traverse(child.ui);
                }
            }
        }
        for (const child of this.dom.childNodes) {
            traverse(child.ui);
        }
    }
    /**
     * Do a depth first traversal of all tree items
     * and assign an order to them so that we know which one
     * is above the other. Performance wise this means it traverses
     * all tree items every time however seems to be pretty fast even with 15 - 20 K entities.
     */
    _getTreeOrder() {
        const treeOrder = new Map();
        let order = 0;
        this._traverseDepthFirst((item) => {
            treeOrder.set(item, order++);
        });
        return treeOrder;
    }
    _getChildIndex(item, parent) {
        return Array.prototype.indexOf.call(parent.dom.childNodes, item.dom) - 1;
    }
    // Called when we start dragging a TreeViewItem.
    _onChildDragStart(evt, item) {
        if (!this.allowDrag || this._dragging)
            return;
        this._dragItems = [];
        if (this._selectedItems.indexOf(item) !== -1) {
            const dragged = [];
            // check that all selected items to be dragged are
            // at the same depth from the root
            let desiredDepth = -1;
            for (let i = 0; i < this._selectedItems.length; i++) {
                let parent = this._selectedItems[i].parent;
                let depth = 0;
                let isChild = false;
                while (parent && parent instanceof _TreeViewItem_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]) {
                    // if parent is already in dragged items then skip
                    // depth calculation for this item
                    if (this._selectedItems.indexOf(parent) !== -1) {
                        isChild = true;
                        break;
                    }
                    depth++;
                    parent = parent.parent;
                }
                if (!isChild) {
                    if (desiredDepth === -1) {
                        desiredDepth = depth;
                    }
                    else if (desiredDepth !== depth) {
                        return;
                    }
                    dragged.push(this._selectedItems[i]);
                }
            }
            // add dragged class to each item
            this._dragItems = dragged;
        }
        else {
            item.class.add(CLASS_DRAGGED_ITEM);
            this._dragItems.push(item);
        }
        if (this._dragItems.length) {
            this._dragItems.forEach((item) => {
                item.class.add(CLASS_DRAGGED_ITEM);
            });
            this.isDragging = true;
            this.emit('dragstart', this._dragItems.slice());
        }
    }
    // Called when we stop dragging a TreeViewItem.
    _onChildDragEnd(evt, item) {
        if (!this.allowDrag || !this._dragging)
            return;
        this._dragItems.forEach(item => item.class.remove(CLASS_DRAGGED_ITEM));
        // if the root is being dragged then
        // do not allow reparenting because we do not
        // want to reparent the root
        let isRootDragged = false;
        for (let i = 0; i < this._dragItems.length; i++) {
            if (this._dragItems[i].parent === this) {
                isRootDragged = true;
                break;
            }
        }
        if (!isRootDragged && this._dragOverItem) {
            if (this._dragItems.length > 1) {
                // sort items based on order in the hierarchy
                const treeOrder = this._getTreeOrder();
                this._dragItems.sort((a, b) => {
                    return treeOrder.get(a) - treeOrder.get(b);
                });
            }
            if (this._dragItems.length) {
                // reparent items
                const reparented = [];
                // if we do not have _onReparentFn then reparent all the dragged items
                // in the DOM
                if (!this._onReparentFn) {
                    // first remove all items from their parent
                    this._dragItems.forEach((item) => {
                        if (item.parent === this._dragOverItem && this._dragArea === DRAG_AREA_INSIDE)
                            return;
                        reparented.push({
                            item: item,
                            oldParent: item.parent
                        });
                        item.parent.remove(item);
                    });
                    // now reparent items
                    reparented.forEach((r, i) => {
                        if (this._dragArea === DRAG_AREA_BEFORE) {
                            // If dragged before a TreeViewItem...
                            r.newParent = this._dragOverItem.parent;
                            r.newParent.appendBefore(r.item, this._dragOverItem);
                            r.newChildIndex = this._getChildIndex(r.item, r.newParent);
                        }
                        else if (this._dragArea === DRAG_AREA_INSIDE) {
                            // If dragged inside a TreeViewItem...
                            r.newParent = this._dragOverItem;
                            r.newParent.append(r.item);
                            r.newParent.open = true;
                            r.newChildIndex = this._getChildIndex(r.item, r.newParent);
                        }
                        else if (this._dragArea === DRAG_AREA_AFTER) {
                            // If dragged after a TreeViewItem...
                            r.newParent = this._dragOverItem.parent;
                            r.newParent.appendAfter(r.item, i > 0 ? reparented[i - 1].item : this._dragOverItem);
                            r.newChildIndex = this._getChildIndex(r.item, r.newParent);
                        }
                    });
                }
                else {
                    // if we have an _onReparentFn then we will not perform the reparenting here
                    // but will instead calculate the new indexes and pass that data to the reparent function
                    // to perform the reparenting
                    const fakeDom = [];
                    const getChildren = (treeviewItem) => {
                        let idx = fakeDom.findIndex(entry => entry.parent === treeviewItem);
                        if (idx === -1) {
                            fakeDom.push({ parent: treeviewItem, children: [...treeviewItem.dom.childNodes] });
                            idx = fakeDom.length - 1;
                        }
                        return fakeDom[idx].children;
                    };
                    this._dragItems.forEach((item) => {
                        if (item.parent === this._dragOverItem && this._dragArea === DRAG_AREA_INSIDE)
                            return;
                        reparented.push({
                            item: item,
                            oldParent: item.parent
                        });
                        // add array of parent's child nodes to fakeDom array
                        const parentChildren = getChildren(item.parent);
                        // remove this item from the children array in fakeDom
                        const childIdx = parentChildren.indexOf(item.dom);
                        parentChildren.splice(childIdx, 1);
                    });
                    // now reparent items
                    reparented.forEach((r, i) => {
                        if (this._dragArea === DRAG_AREA_BEFORE) {
                            // If dragged before a TreeViewItem...
                            r.newParent = this._dragOverItem.parent;
                            const parentChildren = getChildren(this._dragOverItem.parent);
                            const index = parentChildren.indexOf(this._dragOverItem.dom);
                            parentChildren.splice(index, 0, r.item.dom);
                            r.newChildIndex = index;
                        }
                        else if (this._dragArea === DRAG_AREA_INSIDE) {
                            // If dragged inside a TreeViewItem...
                            r.newParent = this._dragOverItem;
                            const parentChildren = getChildren(this._dragOverItem);
                            parentChildren.push(r.item.dom);
                            r.newChildIndex = parentChildren.length - 1;
                        }
                        else if (this._dragArea === DRAG_AREA_AFTER) {
                            // If dragged after a TreeViewItem...
                            r.newParent = this._dragOverItem.parent;
                            const parentChildren = getChildren(this._dragOverItem.parent);
                            const after = i > 0 ? reparented[i - 1].item : this._dragOverItem;
                            const index = parentChildren.indexOf(after.dom);
                            parentChildren.splice(index + 1, 0, r.item.dom);
                            r.newChildIndex = index + 1;
                        }
                        // subtract 1 from new child index to account for the extra node that
                        // each tree view item has inside
                        r.newChildIndex--;
                    });
                }
                if (reparented.length) {
                    if (this._onReparentFn) {
                        this._onReparentFn(reparented);
                    }
                    this.emit('reparent', reparented);
                }
            }
        }
        this._dragItems = [];
        this.isDragging = false;
        this.emit('dragend');
    }
    // Called when we drag over a TreeViewItem.
    _onChildDragOver(evt, item) {
        if (!this._allowDrag || !this._dragging)
            return;
        if (item.allowDrop && this._dragItems.indexOf(item) === -1) {
            this._dragOverItem = item;
        }
        else {
            this._dragOverItem = null;
        }
        this._updateDragHandle();
        this._onDragMove(evt);
    }
    // Scroll treeview if we are dragging towards the edges
    _scrollWhileDragging() {
        if (!this._dragging)
            return;
        if (this._dragScroll === 0)
            return;
        this._dragScrollElement.dom.scrollTop += this._dragScroll * 8;
        this._dragOverItem = null;
        this._updateDragHandle();
    }
    // Updates the drag handle position and size
    _updateDragHandle(dragOverItem, force) {
        if (!force && (!this._allowDrag || !this._dragging))
            return;
        if (!dragOverItem) {
            dragOverItem = this._dragOverItem;
        }
        if (!dragOverItem || dragOverItem.hidden || !dragOverItem.parentsOpen) {
            this._dragHandle.hidden = true;
        }
        else {
            // @ts-ignore
            const rect = dragOverItem._containerContents.dom.getBoundingClientRect();
            this._dragHandle.hidden = false;
            this._dragHandle.class.remove(DRAG_AREA_AFTER, DRAG_AREA_BEFORE, DRAG_AREA_INSIDE);
            this._dragHandle.class.add(this._dragArea);
            const top = rect.top;
            let left = rect.left;
            let width = rect.width;
            if (this.dom.parentElement) {
                const parentRect = this.dom.parentElement.getBoundingClientRect();
                left = Math.max(left, parentRect.left);
                width = Math.min(width, this.dom.parentElement.clientWidth - left + parentRect.left);
            }
            this._dragHandle.style.top = top + 'px';
            this._dragHandle.style.left = left + 'px';
            this._dragHandle.style.width = (width - 7) + 'px';
        }
    }
    /**
     * Opens all the parents of the specified item.
     *
     * @param endItem - The end tree view item.
     */
    _openHierarchy(endItem) {
        endItem.parentsOpen = true;
    }
    /**
     * Selects a tree view item.
     *
     * @param item - The tree view item.
     */
    _selectSingleItem(item) {
        let i = this._selectedItems.length;
        let othersSelected = false;
        while (i--) {
            if (this._selectedItems[i] && this._selectedItems[i] !== item) {
                this._selectedItems[i].selected = false;
                othersSelected = true;
            }
        }
        if (othersSelected) {
            item.selected = true;
        }
        else {
            item.selected = !item.selected;
        }
    }
    /**
     * Called when a child tree view item is selected.
     *
     * @param item - The tree view item.
     */
    _onChildSelected(item) {
        this._selectedItems.push(item);
        this._openHierarchy(item);
        this.emit('select', item);
    }
    /**
     * Called when a child tree view item is deselected.
     *
     * @param item - The tree view item.
     */
    _onChildDeselected(item) {
        const index = this._selectedItems.indexOf(item);
        if (index !== -1) {
            this._selectedItems.splice(index, 1);
            this.emit('deselect', item);
        }
    }
    /**
     * Called when a child tree view item is renamed.
     *
     * @param item - The tree view item.
     * @param newName - The new name.
     */
    _onChildRename(item, newName) {
        if (this._filter) {
            // unfilter this item
            item.class.remove(CLASS_FILTER_RESULT);
            const index = this._filterResults.indexOf(item);
            if (index !== -1) {
                this._filterResults.splice(index, 1);
            }
            // see if we can include it in the current filter
            this._searchItems([[item.text, item]], this._filter);
        }
        this.emit('rename', item, newName);
    }
    _searchItems(searchArr, filter) {
        const results = (0,_helpers_search_mjs__WEBPACK_IMPORTED_MODULE_3__.searchItems)(searchArr, filter);
        if (!results.length)
            return;
        results.forEach((item) => {
            this._filterResults.push(item);
            item.class.add(CLASS_FILTER_RESULT);
        });
    }
    /**
     * Searches the treeview.
     *
     * @param filter - The search filter.
     */
    _applyFilter(filter) {
        this._clearFilter();
        this._wasDraggingAllowedBeforeFiltering = this._allowDrag;
        this._allowDrag = false;
        this.class.add(CLASS_FILTERING);
        const search = [];
        this._traverseDepthFirst((item) => {
            search.push([item.text, item]);
        });
        this._searchItems(search, filter);
    }
    /**
     * Clears search filter.
     */
    _clearFilter() {
        this._filterResults.forEach((item) => {
            if (item.destroyed)
                return;
            item.class.remove(CLASS_FILTER_RESULT);
        });
        this._filterResults.length = 0;
        this.class.remove(CLASS_FILTERING);
        this._allowDrag = this._wasDraggingAllowedBeforeFiltering;
    }
    /**
     * Show the drag handle on the given tree item.
     *
     * @param treeItem - The tree item.
     */
    showDragHandle(treeItem) {
        this._updateDragHandle(treeItem, true);
    }
    /**
     * Deselects all selected tree view items.
     */
    deselect() {
        let i = this._selectedItems.length;
        while (i--) {
            if (this._selectedItems[i]) {
                this._selectedItems[i].selected = false;
            }
        }
    }
    /**
     * Removes all child tree view items.
     */
    clearTreeItems() {
        let i = this.dom.childNodes.length;
        while (i--) {
            const dom = this.dom.childNodes[i];
            if (!dom)
                continue;
            const ui = dom.ui;
            if (ui instanceof _TreeViewItem_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]) {
                ui.destroy();
            }
        }
        this._selectedItems = [];
        this._dragItems = [];
        this._allowDrag = this._wasDraggingAllowedBeforeFiltering;
    }
    /**
     * Whether dragging a TreeViewItem is allowed.
     */
    set allowDrag(value) {
        this._allowDrag = value;
        if (this._filter) {
            this._wasDraggingAllowedBeforeFiltering = value;
        }
    }
    get allowDrag() {
        return this._allowDrag;
    }
    /**
     * Whether reordering TreeViewItems is allowed.
     */
    set allowReordering(value) {
        this._allowReordering = value;
    }
    get allowReordering() {
        return this._allowReordering;
    }
    /**
     * Whether renaming TreeViewItems is allowed by double clicking on them.
     */
    set allowRenaming(value) {
        this._allowRenaming = value;
    }
    get allowRenaming() {
        return this._allowRenaming;
    }
    /**
     * Whether a TreeViewItem is currently being dragged.
     */
    set isDragging(value) {
        if (this._dragging === value)
            return;
        if (value) {
            this._dragging = true;
            this._updateDragHandle();
            // handle mouse move to scroll when dragging if necessary
            if (this.scrollable || this._dragScrollElement !== this) {
                window.removeEventListener('mousemove', this._onMouseMove);
                window.addEventListener('mousemove', this._onMouseMove);
                if (!this._dragScrollInterval) {
                    this._dragScrollInterval = window.setInterval(() => {
                        this._scrollWhileDragging();
                    }, 1000 / 60);
                }
            }
        }
        else {
            this._dragOverItem = null;
            this._updateDragHandle();
            this._dragging = false;
            window.removeEventListener('mousemove', this._onMouseMove);
            if (this._dragScrollInterval) {
                window.clearInterval(this._dragScrollInterval);
                this._dragScrollInterval = null;
            }
        }
    }
    get isDragging() {
        return this._dragging;
    }
    /**
     * Returns all of the currently selected TreeViewItems.
     */
    get selected() {
        return this._selectedItems.slice();
    }
    /**
     * A filter that searches TreeViewItems and only shows the ones that are relevant to the filter.
     */
    set filter(value) {
        if (this._filter === value)
            return;
        this._filter = value;
        if (value) {
            this._applyFilter(value);
        }
        else {
            this._clearFilter();
        }
    }
    get filter() {
        return this._filter;
    }
    /**
     * Whether Ctrl is currently pressed.
     */
    get pressedCtrl() {
        return this._pressedCtrl;
    }
    /**
     * Whether Shift is currently pressed.
     */
    get pressedShift() {
        return this._pressedShift;
    }
}
/**
 * Fired when user starts dragging selected TreeViewItems.
 *
 * @event
 * @example
 * ```ts
 * const treeView = new TreeView({
 *     allowDrag: true // this is the default but we're showing it here for clarity
 * });
 * treeView.on('dragstart', (items) => {
 *     console.log(`Drag started of ${items.length} items');
 * });
 * ```
 */
TreeView.EVENT_DRAGSTART = 'dragstart';
/**
 * Fired when user stops dragging selected TreeViewItems.
 *
 * @event
 * @example
 * ```ts
 * const treeView = new TreeView({
 *     allowDrag: true // this is the default but we're showing it here for clarity
 * });
 * treeView.on('dragend', () => {
 *     console.log('Drag ended');
 * });
 * ```
 */
TreeView.EVENT_DRAGEND = 'dragend';
/**
 * Fired when user reparents TreeViewItems.
 *
 * @event
 * @example
 * ```ts
 * const treeView = new TreeView();
 * treeView.on('reparent', (reparented: { item: TreeViewItem; oldParent: Element; }[]) => {
 *     console.log(`Reparented ${reparented.length} items`);
 * });
 * ```
 */
TreeView.EVENT_REPARENT = 'reparent';
/**
 * Fired when user selects a TreeViewItem.
 *
 * @event
 * @example
 * ```ts
 * const treeView = new TreeView();
 * treeView.on('select', (item: TreeViewItem) => {
 *     console.log(`Selected item ${item.text}`);
 * });
 * ```
 */
TreeView.EVENT_SELECT = 'select';
/**
 * Fired when user deselects a TreeViewItem.
 *
 * @event
 * @example
 * ```ts
 * const treeView = new TreeView();
 * treeView.on('deselect', (item: TreeViewItem) => {
 *     console.log(`Deselected item ${item.text}`);
 * });
 * ```
 */
TreeView.EVENT_DESELECT = 'deselect';
/**
 * Fired when user renames a TreeViewItem.
 *
 * @event
 * @example
 * ```ts
 * const treeView = new TreeView();
 * treeView.on('rename', (item: TreeViewItem, name: string) => {
 *     console.log(`Renamed item to ${name}`);
 * });
 * ```
 */
TreeView.EVENT_RENAME = 'rename';
var TreeView$1 = TreeView;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/TreeViewItem/index.mjs":
/*!*****************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/TreeViewItem/index.mjs ***!
  \*****************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TreeViewItem$1)
/* harmony export */ });
/* harmony import */ var _Label_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Label/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Label/index.mjs");
/* harmony import */ var _Container_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Container/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Container/index.mjs");
/* harmony import */ var _TextInput_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../TextInput/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/TextInput/index.mjs");
/* harmony import */ var _class_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../class.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/class.mjs");





const CLASS_ROOT = 'pcui-treeview-item';
const CLASS_ICON = CLASS_ROOT + '-icon';
const CLASS_TEXT = CLASS_ROOT + '-text';
const CLASS_SELECTED = CLASS_ROOT + '-selected';
const CLASS_OPEN = CLASS_ROOT + '-open';
const CLASS_CONTENTS = CLASS_ROOT + '-contents';
const CLASS_EMPTY = CLASS_ROOT + '-empty';
const CLASS_RENAME = CLASS_ROOT + '-rename';
/**
 * A TreeViewItem is a single node in a hierarchical {@link TreeView} control.
 */
class TreeViewItem extends _Container_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"] {
    /**
     * Creates a new TreeViewItem.
     *
     * @param args - The arguments.
     */
    constructor(args = {}) {
        var _a, _b, _c, _d;
        super(args);
        this._numChildren = 0;
        this._onContentKeyDown = (evt) => {
            const element = evt.target;
            if (element.tagName === 'INPUT')
                return;
            if (!this.allowSelect)
                return;
            if (this._treeView) {
                this._treeView._onChildKeyDown(evt, this);
            }
        };
        this._onContentMouseDown = (evt) => {
            if (!this._treeView || !this._treeView.allowDrag || !this._allowDrag)
                return;
            this._treeView._updateModifierKeys(evt);
            evt.stopPropagation();
        };
        this._onContentMouseUp = (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
            window.removeEventListener('mouseup', this._onContentMouseUp);
            if (this._treeView) {
                this._treeView._onChildDragEnd(evt, this);
            }
        };
        this._onContentMouseOver = (evt) => {
            evt.stopPropagation();
            if (this._treeView) {
                this._treeView._onChildDragOver(evt, this);
            }
            this.emit('hover', evt);
        };
        this._onContentDragStart = (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
            if (!this._treeView || !this._treeView.allowDrag)
                return;
            if (this.class.contains(CLASS_RENAME))
                return;
            this._treeView._onChildDragStart(evt, this);
            window.addEventListener('mouseup', this._onContentMouseUp);
        };
        this._onContentClick = (evt) => {
            if (!this.allowSelect || evt.button !== 0)
                return;
            const element = evt.target;
            if (element.tagName === 'INPUT')
                return;
            evt.stopPropagation();
            const rect = this._containerContents.dom.getBoundingClientRect();
            if (this._numChildren > 0 && evt.clientX - rect.left < 0) {
                this.open = !this.open;
                if (evt.altKey) {
                    // apply to all children as well
                    this._dfs((item) => {
                        item.open = this.open;
                    });
                }
                this.focus();
            }
            else if (this._treeView) {
                this._treeView._onChildClick(evt, this);
            }
        };
        this._onContentDblClick = (evt) => {
            if (!this._treeView || !this._treeView.allowRenaming || evt.button !== 0)
                return;
            const element = evt.target;
            if (element.tagName === 'INPUT')
                return;
            evt.stopPropagation();
            const rect = this._containerContents.dom.getBoundingClientRect();
            if (this.numChildren && evt.clientX - rect.left < 0) {
                return;
            }
            if (this.allowSelect) {
                this._treeView.deselect();
                this._treeView._onChildClick(evt, this);
            }
            this.rename();
        };
        this._onContentContextMenu = (evt) => {
            if (this._treeView && this._treeView._onContextMenu) {
                this._treeView._onContextMenu(evt, this);
            }
        };
        this._onContentFocus = (evt) => {
            this.emit('focus');
        };
        this._onContentBlur = (evt) => {
            this.emit('blur');
        };
        this.class.add(CLASS_ROOT, CLASS_EMPTY);
        this._containerContents = new _Container_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]({
            class: CLASS_CONTENTS,
            flex: true,
            flexDirection: 'row',
            tabIndex: 0
        });
        this.append(this._containerContents);
        this._containerContents.dom.draggable = true;
        this._labelIcon = new _Label_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"]({
            class: CLASS_ICON
        });
        this._containerContents.append(this._labelIcon);
        this.icon = (_a = args.icon) !== null && _a !== void 0 ? _a : 'E360';
        this._labelText = new _Label_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"]({
            class: CLASS_TEXT
        });
        this._containerContents.append(this._labelText);
        this.allowSelect = (_b = args.allowSelect) !== null && _b !== void 0 ? _b : true;
        this.allowDrop = (_c = args.allowDrop) !== null && _c !== void 0 ? _c : true;
        this.allowDrag = (_d = args.allowDrag) !== null && _d !== void 0 ? _d : true;
        if (args.text) {
            this.text = args.text;
        }
        if (args.selected) {
            this.selected = args.selected;
        }
        const dom = this._containerContents.dom;
        dom.addEventListener('focus', this._onContentFocus);
        dom.addEventListener('blur', this._onContentBlur);
        dom.addEventListener('keydown', this._onContentKeyDown);
        dom.addEventListener('dragstart', this._onContentDragStart);
        dom.addEventListener('mousedown', this._onContentMouseDown);
        dom.addEventListener('mouseover', this._onContentMouseOver);
        dom.addEventListener('click', this._onContentClick);
        dom.addEventListener('dblclick', this._onContentDblClick);
        dom.addEventListener('contextmenu', this._onContentContextMenu);
    }
    destroy() {
        if (this._destroyed)
            return;
        const dom = this._containerContents.dom;
        dom.removeEventListener('focus', this._onContentFocus);
        dom.removeEventListener('blur', this._onContentBlur);
        dom.removeEventListener('keydown', this._onContentKeyDown);
        dom.removeEventListener('dragstart', this._onContentDragStart);
        dom.removeEventListener('mousedown', this._onContentMouseDown);
        dom.removeEventListener('mouseover', this._onContentMouseOver);
        dom.removeEventListener('click', this._onContentClick);
        dom.removeEventListener('dblclick', this._onContentDblClick);
        dom.removeEventListener('contextmenu', this._onContentContextMenu);
        window.removeEventListener('mouseup', this._onContentMouseUp);
        super.destroy();
    }
    _onAppendChild(element) {
        super._onAppendChild(element);
        if (element instanceof TreeViewItem) {
            this._numChildren++;
            if (this._parent !== this._treeView) {
                this.class.remove(CLASS_EMPTY);
            }
            if (this._treeView) {
                this._treeView._onAppendTreeViewItem(element);
            }
        }
    }
    _onRemoveChild(element) {
        if (element instanceof TreeViewItem) {
            this._numChildren--;
            if (this._numChildren === 0) {
                this.class.add(CLASS_EMPTY);
            }
            if (this._treeView) {
                this._treeView._onRemoveTreeViewItem(element);
            }
        }
        super._onRemoveChild(element);
    }
    _dfs(fn) {
        fn(this);
        let child = this.firstChild;
        while (child) {
            child._dfs(fn);
            child = child.nextSibling;
        }
    }
    rename() {
        this.class.add(CLASS_RENAME);
        // show text input to enter new text
        const textInput = new _TextInput_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]({
            renderChanges: false,
            value: this.text,
            class: _class_mjs__WEBPACK_IMPORTED_MODULE_3__.FONT_REGULAR
        });
        textInput.on('blur', () => {
            textInput.destroy();
        });
        textInput.on('destroy', () => {
            this.class.remove(CLASS_RENAME);
            this.focus();
        });
        textInput.on('change', (value) => {
            value = value.trim();
            if (value) {
                this.text = value;
                textInput.destroy();
            }
        });
        textInput.on('disable', () => {
            // make sure text input is editable even if this
            // tree item is disabled
            textInput.input.removeAttribute('readonly');
        });
        this._containerContents.append(textInput);
        textInput.focus(true);
    }
    focus() {
        this._containerContents.dom.focus();
    }
    blur() {
        this._containerContents.dom.blur();
    }
    /**
     * Whether the item is selected.
     */
    set selected(value) {
        if (value === this.selected) {
            if (value) {
                this.focus();
            }
            return;
        }
        if (value) {
            this._containerContents.class.add(CLASS_SELECTED);
            this.emit('select', this);
            if (this._treeView) {
                this._treeView._onChildSelected(this);
            }
            this.focus();
        }
        else {
            this._containerContents.class.remove(CLASS_SELECTED);
            this.blur();
            this.emit('deselect', this);
            if (this._treeView) {
                this._treeView._onChildDeselected(this);
            }
        }
    }
    get selected() {
        return this._containerContents.class.contains(CLASS_SELECTED);
    }
    /**
     * The text shown by the TreeViewItem.
     */
    set text(value) {
        if (this._labelText.value !== value) {
            this._labelText.value = value;
            if (this._treeView) {
                this._treeView._onChildRename(this, value);
            }
        }
    }
    get text() {
        return this._labelText.value;
    }
    /**
     * Gets the internal label that shows the text.
     */
    get textLabel() {
        return this._labelText;
    }
    /**
     * Gets the internal label that shows the icon.
     */
    get iconLabel() {
        return this._labelIcon;
    }
    /**
     * Whether the item is open meaning showing its children.
     */
    set open(value) {
        if (this.open === value)
            return;
        if (value) {
            if (!this.numChildren)
                return;
            this.class.add(CLASS_OPEN);
            this.emit('open', this);
        }
        else {
            this.class.remove(CLASS_OPEN);
            this.emit('close', this);
        }
    }
    get open() {
        return this.class.contains(CLASS_OPEN) || this.parent === this._treeView;
    }
    /**
     * Whether the parents of the item are open or closed.
     */
    set parentsOpen(value) {
        let parent = this.parent;
        while (parent && parent instanceof TreeViewItem) {
            parent.open = value;
            parent = parent.parent;
        }
    }
    get parentsOpen() {
        let parent = this.parent;
        while (parent && parent instanceof TreeViewItem) {
            if (!parent.open)
                return false;
            parent = parent.parent;
        }
        return true;
    }
    /**
     * Whether dropping is allowed on the tree item.
     */
    set allowDrop(value) {
        this._allowDrop = value;
    }
    get allowDrop() {
        return this._allowDrop;
    }
    /**
     * Whether this tree item can be dragged. Only considered if the parent treeview has allowDrag true.
     */
    set allowDrag(value) {
        this._allowDrag = value;
    }
    get allowDrag() {
        return this._allowDrag;
    }
    /**
     * Whether the item can be selected.
     */
    set allowSelect(value) {
        this._allowSelect = value;
    }
    get allowSelect() {
        return this._allowSelect;
    }
    /**
     * Gets / sets the parent TreeView.
     */
    set treeView(value) {
        this._treeView = value;
    }
    get treeView() {
        return this._treeView;
    }
    /**
     * The number of direct children.
     */
    get numChildren() {
        return this._numChildren;
    }
    /**
     * Gets the first child item.
     */
    get firstChild() {
        if (this._numChildren) {
            for (const child of this.dom.childNodes) {
                if (child.ui instanceof TreeViewItem) {
                    return child.ui;
                }
            }
        }
        return null;
    }
    /**
     * Gets the last child item.
     */
    get lastChild() {
        if (this._numChildren) {
            for (let i = this.dom.childNodes.length - 1; i >= 0; i--) {
                if (this.dom.childNodes[i].ui instanceof TreeViewItem) {
                    return this.dom.childNodes[i].ui;
                }
            }
        }
        return null;
    }
    /**
     * Gets the first sibling item.
     */
    get nextSibling() {
        let sibling = this.dom.nextSibling;
        while (sibling && !(sibling.ui instanceof TreeViewItem)) {
            sibling = sibling.nextSibling;
        }
        return sibling && sibling.ui;
    }
    /**
     * Gets the last sibling item.
     */
    get previousSibling() {
        let sibling = this.dom.previousSibling;
        while (sibling && !(sibling.ui instanceof TreeViewItem)) {
            sibling = sibling.previousSibling;
        }
        return sibling && sibling.ui;
    }
    /**
     * The icon shown before the text in the TreeViewItem.
     */
    set icon(value) {
        if (this._icon === value || !value.match(/^E[0-9]{0,4}$/))
            return;
        this._icon = value;
        if (value) {
            // set data-icon attribute but first convert the value to a code point
            this._labelIcon.dom.setAttribute('data-icon', String.fromCodePoint(parseInt(value, 16)));
        }
        else {
            this._labelIcon.dom.removeAttribute('data-icon');
        }
    }
    get icon() {
        return this._icon;
    }
}
/**
 * Fired when user selects the TreeViewItem.
 *
 * @event
 * @example
 * ```ts
 * treeViewItem.on('select', (item: TreeViewItem) => {
 *     console.log('TreeViewItem selected', item);
 * });
 * ```
 */
TreeViewItem.EVENT_SELECT = 'select';
/**
 * Fired when user deselects the TreeViewItem.
 *
 * @event
 * @example
 * ```ts
 * treeViewItem.on('deselect', (item: TreeViewItem) => {
 *     console.log('TreeViewItem deselected', item);
 * });
 * ```
 */
TreeViewItem.EVENT_DESELECT = 'deselect';
/**
 * Fired when user opens the TreeViewItem.
 *
 * @event
 * @example
 * ```ts
 * treeViewItem.on('open', (item: TreeViewItem) => {
 *     console.log('TreeViewItem opened', item);
 * });
 * ```
 */
TreeViewItem.EVENT_OPEN = 'open';
/**
 * Fired when user closes the TreeViewItem.
 *
 * @event
 * @example
 * ```ts
 * treeViewItem.on('close', (item: TreeViewItem) => {
 *     console.log('TreeViewItem closed', item);
 * });
 * ```
 */
TreeViewItem.EVENT_CLOSE = 'close';
var TreeViewItem$1 = TreeViewItem;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/components/VectorInput/index.mjs":
/*!****************************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/components/VectorInput/index.mjs ***!
  \****************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ VectorInput$1)
/* harmony export */ });
/* harmony import */ var _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");
/* harmony import */ var _NumericInput_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../NumericInput/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/NumericInput/index.mjs");
/* harmony import */ var _class_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../class.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/class.mjs");




const CLASS_VECTOR_INPUT = 'pcui-vector-input';
/**
 * A vector input. The vector can have 2 to 4 dimensions with each dimension being a {@link NumericInput}.
 */
class VectorInput extends _Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(args = {}) {
        var _a, _b, _c;
        const elementArgs = Object.assign({}, args);
        // set binding after inputs have been created
        delete elementArgs.binding;
        super(elementArgs);
        this._inputs = [];
        this._applyingChange = false;
        this.class.add(CLASS_VECTOR_INPUT);
        const dimensions = Math.max(2, Math.min(4, (_a = args.dimensions) !== null && _a !== void 0 ? _a : 3));
        for (let i = 0; i < dimensions; i++) {
            const input = new _NumericInput_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]({
                min: args.min,
                max: args.max,
                precision: (_b = args.precision) !== null && _b !== void 0 ? _b : 7,
                step: (_c = args.step) !== null && _c !== void 0 ? _c : 1,
                stepPrecision: args.stepPrecision,
                renderChanges: args.renderChanges,
                placeholder: args.placeholder ? (Array.isArray(args.placeholder) ? args.placeholder[i] : args.placeholder) : null
            });
            input.on('change', () => {
                this._onInputChange();
            });
            input.on('focus', () => {
                this.emit('focus');
            });
            input.on('blur', () => {
                this.emit('blur');
            });
            this.dom.appendChild(input.dom);
            input.parent = this;
            this._inputs.push(input);
        }
        // set the binding after the inputs have been created
        // because we rely on them in the overridden setter
        if (args.binding) {
            this.binding = args.binding;
        }
        if (args.value !== undefined) {
            this.value = args.value;
        }
    }
    _onInputChange() {
        if (this._applyingChange)
            return;
        // check if any of our inputs have the MULTIPLE_VALUES class and if so inherit it for us as well
        const multipleValues = this._inputs.some(input => input.class.contains(_class_mjs__WEBPACK_IMPORTED_MODULE_2__.MULTIPLE_VALUES));
        if (multipleValues) {
            this.class.add(_class_mjs__WEBPACK_IMPORTED_MODULE_2__.MULTIPLE_VALUES);
        }
        else {
            this.class.remove(_class_mjs__WEBPACK_IMPORTED_MODULE_2__.MULTIPLE_VALUES);
        }
        this.emit('change', this.value);
    }
    _updateValue(value) {
        this.class.remove(_class_mjs__WEBPACK_IMPORTED_MODULE_2__.MULTIPLE_VALUES);
        if (JSON.stringify(this.value) === JSON.stringify(value))
            return false;
        this._applyingChange = true;
        this._inputs.forEach((input, i) => {
            // disable binding for each individual input when we use
            // the 'value' setter for the whole vector value. That is because
            // we do not want the individual inputs to emit their own binding events
            // since we are setting the whole vector value here
            const binding = input.binding;
            let applyingChange = false;
            if (binding) {
                applyingChange = binding.applyingChange;
                binding.applyingChange = true;
            }
            input.value = (value && value[i] !== undefined ? value[i] : null);
            if (binding) {
                binding.applyingChange = applyingChange;
            }
        });
        this.emit('change', this.value);
        this._applyingChange = false;
        return true;
    }
    link(observers, paths) {
        super.link(observers, paths);
        observers = Array.isArray(observers) ? observers : [observers];
        paths = Array.isArray(paths) ? paths : [paths];
        const useSinglePath = paths.length === 1 || observers.length !== paths.length;
        if (useSinglePath) {
            for (let i = 0; i < this._inputs.length; i++) {
                // link observers to path.i for each dimension
                this._inputs[i].link(observers, paths[0] + `.${i}`);
            }
        }
        else {
            for (let i = 0; i < this._inputs.length; i++) {
                // link observers to paths[i].i for each dimension
                this._inputs[i].link(observers, paths.map(path => `${path}.${i}`));
            }
        }
    }
    unlink() {
        super.unlink();
        for (const input of this._inputs) {
            input.unlink();
        }
    }
    focus() {
        this._inputs[0].focus();
    }
    blur() {
        for (const input of this._inputs) {
            input.blur();
        }
    }
    set value(value) {
        if (typeof value === 'string') {
            try {
                // try to parse the string
                value = JSON.parse(value);
                // if the string could be converted to an array but some of its values aren't numbers
                // then use a default array also
                if (Array.isArray(value) && value.some(i => !Number.isFinite(i))) {
                    throw new Error('VectorInput value set to string which doesn\'t contain an array of numbers');
                }
            }
            catch (e) {
                console.error(e);
                value = [];
            }
        }
        if (!Array.isArray(value)) {
            value = [];
        }
        const changed = this._updateValue(value);
        if (changed && this._binding) {
            this._binding.setValue(value);
        }
    }
    get value() {
        return this._inputs.map(input => input.value);
    }
    /* eslint accessor-pairs: 0 */
    set values(values) {
        // create an array for each dimension (e.g. one array for x one for y one for z)
        values = this._inputs.map((_, i) => values.map((arr) => {
            return arr ? arr[i] : undefined;
        }));
        this._inputs.forEach((input, i) => {
            input.values = values[i];
        });
    }
    // override binding setter to set a binding clone to
    // each input
    set binding(value) {
        super.binding = value;
        for (const input of this._inputs) {
            input.binding = value ? value.clone() : null;
        }
    }
    // we have to override the getter too because
    // we have overridden the setter
    get binding() {
        return super.binding;
    }
    set placeholder(value) {
        for (let i = 0; i < this._inputs.length; i++) {
            this._inputs[i].placeholder = value[i] || value || null;
        }
    }
    get placeholder() {
        return this._inputs.map(input => input.placeholder);
    }
    /**
     * Get the array of number inputs owned by this vector.
     */
    get inputs() {
        return this._inputs.slice();
    }
    set renderChanges(value) {
        for (const input of this._inputs) {
            input.renderChanges = value;
        }
    }
    get renderChanges() {
        return this._inputs[0].renderChanges;
    }
    /**
     * Gets / sets the minimum value accepted by all inputs of the vector.
     */
    set min(value) {
        for (const input of this._inputs) {
            input.min = value;
        }
    }
    get min() {
        return this._inputs[0].min;
    }
    /**
     * Gets / sets the maximum value accepted by all inputs of the vector.
     */
    set max(value) {
        for (const input of this._inputs) {
            input.max = value;
        }
    }
    get max() {
        return this._inputs[0].max;
    }
    /**
     * Gets / sets the maximum number of decimal places supported by all inputs of the vector.
     */
    set precision(value) {
        for (const input of this._inputs) {
            input.precision = value;
        }
    }
    get precision() {
        return this._inputs[0].precision;
    }
    /**
     * Gets / sets the amount that the value will be increased or decreased when using the arrow
     * keys and the slider input for all inputs of the vector.
     */
    set step(value) {
        for (const input of this._inputs) {
            input.step = value;
        }
    }
    get step() {
        return this._inputs[0].step;
    }
}
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"].register('vec2', VectorInput, { dimensions: 2, renderChanges: true });
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"].register('vec3', VectorInput, { dimensions: 3, renderChanges: true });
_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"].register('vec4', VectorInput, { dimensions: 4, renderChanges: true });
var VectorInput$1 = VectorInput;




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/helpers/search.mjs":
/*!**************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/helpers/search.mjs ***!
  \**************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   searchItems: () => (/* binding */ searchItems)
/* harmony export */ });
// calculate, how many string `a`
// requires edits, to become string `b`
const searchStringEditDistance = (a, b) => {
    // Levenshtein distance
    // https://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Levenshtein_distance#JavaScript
    if (a.length === 0)
        return b.length;
    if (b.length === 0)
        return a.length;
    if (a === b)
        return 0;
    const matrix = [];
    for (let i = 0; i <= b.length; i++)
        matrix[i] = [i];
    for (let j = 0; j <= a.length; j++)
        matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            }
            else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
            }
        }
    }
    return matrix[b.length][a.length];
};
// calculate, how many characters string `b`
// contains of a string `a`
const searchCharsContains = (a, b) => {
    if (a === b)
        return a.length;
    let contains = 0;
    const ind = new Set();
    for (let i = 0; i < b.length; i++)
        ind.add(b.charAt(i));
    for (let i = 0; i < a.length; i++) {
        if (ind.has(a.charAt(i)))
            contains++;
    }
    return contains;
};
// tokenize string into array of tokens
const searchStringTokenize = (name) => {
    const tokens = [];
    // camelCase
    // upperCASE123
    const string = name.replace(/([^A-Z])([A-Z][^A-Z])/g, '$1 $2').replace(/([A-Z0-9]{2,})/g, ' $1');
    // space notation
    // dash-notation
    // underscore_notation
    const parts = string.split(/(\s|\-|_)/g);
    // filter valid tokens
    for (let i = 0; i < parts.length; i++) {
        parts[i] = parts[i].toLowerCase().trim();
        if (parts[i] && parts[i] !== '-' && parts[i] !== '_')
            tokens.push(parts[i]);
    }
    return tokens;
};
const _searchItems = (items, search, args) => {
    const results = [];
    for (const item of items) {
        // direct hit
        if (item.subFull !== Infinity) {
            results.push(item);
            if (item.edits === Infinity)
                item.edits = 0;
            if (item.sub === Infinity)
                item.sub = item.subFull;
            continue;
        }
        else if (item.name === search || item.name.indexOf(search) === 0) {
            results.push(item);
            if (item.edits === Infinity)
                item.edits = 0;
            if (item.sub === Infinity)
                item.sub = 0;
            continue;
        }
        // check if name contains enough of search characters
        const contains = searchCharsContains(search, item.name);
        if (contains / search.length < args.containsCharsTolerance)
            continue;
        let editsCandidate = Infinity;
        let subCandidate = Infinity;
        // for each token
        for (let t = 0; t < item.tokens.length; t++) {
            // direct token match
            if (item.tokens[t] === search) {
                editsCandidate = 0;
                subCandidate = t;
                break;
            }
            const edits = searchStringEditDistance(search, item.tokens[t]);
            if ((subCandidate === Infinity || edits < editsCandidate) && item.tokens[t].indexOf(search) !== -1) {
                // search is a substring of a token
                subCandidate = t;
                editsCandidate = edits;
                continue;
            }
            else if (subCandidate === Infinity && edits < editsCandidate) {
                // new edits candidate, not a substring of a token
                if ((edits / Math.max(search.length, item.tokens[t].length)) <= args.editsDistanceTolerance) {
                    // check if edits tolerance is satisfied
                    editsCandidate = edits;
                }
            }
        }
        // no match candidate
        if (editsCandidate === Infinity)
            continue;
        // add new result
        results.push(item);
        item.edits = item.edits === Infinity ? editsCandidate : item.edits + editsCandidate;
        item.sub = item.sub === Infinity ? subCandidate : item.sub + subCandidate;
    }
    return results;
};
/**
 * Perform search through items.
 *
 * @param items - Array of tuples where the first value is a string to be searched by and the
 * second value is an object to be found.
 * @param search - String to search for.
 * @param args - Search arguments.
 * @returns Array of found items.
 * @example
 * const items = [
 *     ['Item 1', { id: 1 }],
 *     ['Item 2', { id: 2 }],
 *     ['Item 3', { id: 3 }],
 * ];
 * const results = searchItems(items, 'item');
 * // results = [{ id: 1 }, { id: 2 }, { id: 3 }]
 */
const searchItems = (items, search = '', args = {}) => {
    search = search.toLowerCase().trim();
    if (!search)
        return [];
    const searchTokens = searchStringTokenize(search);
    if (!searchTokens.length)
        return [];
    args.containsCharsTolerance = args.containsCharsTolerance || 0.5;
    args.editsDistanceTolerance = args.editsDistanceTolerance || 0.5;
    let records = [];
    for (const item of items) {
        const subInd = item[0].toLowerCase().trim().indexOf(search);
        records.push({
            name: item[0],
            item: item[1],
            tokens: searchStringTokenize(item[0]),
            edits: Infinity,
            subFull: (subInd !== -1) ? subInd : Infinity,
            sub: Infinity
        });
    }
    // search each token
    for (let i = 0; i < searchTokens.length; i++)
        records = _searchItems(records, searchTokens[i], args);
    // sort result first by substring? then by edits number
    records.sort((a, b) => {
        if (a.subFull !== b.subFull) {
            return a.subFull - b.subFull;
        }
        else if (a.sub !== b.sub) {
            return a.sub - b.sub;
        }
        else if (a.edits !== b.edits) {
            return a.edits - b.edits;
        }
        return a.name.length - b.name.length;
    });
    // return only items without match information
    let recordItems = records.map((record) => record.item);
    // limit number of results
    if (args.hasOwnProperty('limitResults') && recordItems.length > args.limitResults) {
        recordItems = recordItems.slice(0, args.limitResults);
    }
    return recordItems;
};




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/helpers/utils.mjs":
/*!*************************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/helpers/utils.mjs ***!
  \*************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   arrayEquals: () => (/* binding */ arrayEquals),
/* harmony export */   deepCopy: () => (/* binding */ deepCopy)
/* harmony export */ });
function deepCopy(data) {
    if (data == null || typeof (data) !== 'object')
        return data;
    if (data instanceof Array) {
        const arr = [];
        for (let i = 0; i < data.length; i++) {
            arr[i] = deepCopy(data[i]);
        }
        return arr;
    }
    const obj = {};
    for (const key in data) {
        if (data.hasOwnProperty(key))
            obj[key] = deepCopy(data[key]);
    }
    return obj;
}
function arrayEquals(lhs, rhs) {
    if (!lhs)
        return false;
    if (!rhs)
        return false;
    if (lhs.length !== rhs.length)
        return false;
    for (let i = 0, l = lhs.length; i < l; i++) {
        if (lhs[i] instanceof Array && rhs[i] instanceof Array) {
            if (!lhs[i].equals(rhs[i]))
                return false;
        }
        else if (lhs[i] !== rhs[i]) {
            return false;
        }
    }
    return true;
}




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/dist/module/src/index.mjs":
/*!*****************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/dist/module/src/index.mjs ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ArrayInput: () => (/* reexport safe */ _components_ArrayInput_index_mjs__WEBPACK_IMPORTED_MODULE_5__["default"]),
/* harmony export */   BindingBase: () => (/* reexport safe */ _binding_BindingBase_index_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   BindingElementToObservers: () => (/* reexport safe */ _binding_BindingElementToObservers_index_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]),
/* harmony export */   BindingObserversToElement: () => (/* reexport safe */ _binding_BindingObserversToElement_index_mjs__WEBPACK_IMPORTED_MODULE_3__["default"]),
/* harmony export */   BindingTwoWay: () => (/* reexport safe */ _binding_BindingTwoWay_index_mjs__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   BooleanInput: () => (/* reexport safe */ _components_BooleanInput_index_mjs__WEBPACK_IMPORTED_MODULE_6__["default"]),
/* harmony export */   Button: () => (/* reexport safe */ _components_Button_index_mjs__WEBPACK_IMPORTED_MODULE_7__["default"]),
/* harmony export */   Canvas: () => (/* reexport safe */ _components_Canvas_index_mjs__WEBPACK_IMPORTED_MODULE_8__["default"]),
/* harmony export */   Code: () => (/* reexport safe */ _components_Code_index_mjs__WEBPACK_IMPORTED_MODULE_9__["default"]),
/* harmony export */   ColorPicker: () => (/* reexport safe */ _components_ColorPicker_index_mjs__WEBPACK_IMPORTED_MODULE_10__["default"]),
/* harmony export */   Container: () => (/* reexport safe */ _components_Container_index_mjs__WEBPACK_IMPORTED_MODULE_11__["default"]),
/* harmony export */   Divider: () => (/* reexport safe */ _components_Divider_index_mjs__WEBPACK_IMPORTED_MODULE_12__["default"]),
/* harmony export */   Element: () => (/* reexport safe */ _components_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"]),
/* harmony export */   GradientPicker: () => (/* reexport safe */ _components_GradientPicker_index_mjs__WEBPACK_IMPORTED_MODULE_13__["default"]),
/* harmony export */   GridView: () => (/* reexport safe */ _components_GridView_index_mjs__WEBPACK_IMPORTED_MODULE_14__["default"]),
/* harmony export */   GridViewItem: () => (/* reexport safe */ _components_GridViewItem_index_mjs__WEBPACK_IMPORTED_MODULE_15__["default"]),
/* harmony export */   InfoBox: () => (/* reexport safe */ _components_InfoBox_index_mjs__WEBPACK_IMPORTED_MODULE_16__["default"]),
/* harmony export */   InputElement: () => (/* reexport safe */ _components_InputElement_index_mjs__WEBPACK_IMPORTED_MODULE_17__["default"]),
/* harmony export */   Label: () => (/* reexport safe */ _components_Label_index_mjs__WEBPACK_IMPORTED_MODULE_18__["default"]),
/* harmony export */   LabelGroup: () => (/* reexport safe */ _components_LabelGroup_index_mjs__WEBPACK_IMPORTED_MODULE_19__["default"]),
/* harmony export */   Menu: () => (/* reexport safe */ _components_Menu_index_mjs__WEBPACK_IMPORTED_MODULE_20__["default"]),
/* harmony export */   MenuItem: () => (/* reexport safe */ _components_MenuItem_index_mjs__WEBPACK_IMPORTED_MODULE_21__["default"]),
/* harmony export */   NumericInput: () => (/* reexport safe */ _components_NumericInput_index_mjs__WEBPACK_IMPORTED_MODULE_22__["default"]),
/* harmony export */   Overlay: () => (/* reexport safe */ _components_Overlay_index_mjs__WEBPACK_IMPORTED_MODULE_23__["default"]),
/* harmony export */   Panel: () => (/* reexport safe */ _components_Panel_index_mjs__WEBPACK_IMPORTED_MODULE_24__["default"]),
/* harmony export */   Progress: () => (/* reexport safe */ _components_Progress_index_mjs__WEBPACK_IMPORTED_MODULE_25__["default"]),
/* harmony export */   RadioButton: () => (/* reexport safe */ _components_RadioButton_index_mjs__WEBPACK_IMPORTED_MODULE_26__["default"]),
/* harmony export */   SelectInput: () => (/* reexport safe */ _components_SelectInput_index_mjs__WEBPACK_IMPORTED_MODULE_27__["default"]),
/* harmony export */   SliderInput: () => (/* reexport safe */ _components_SliderInput_index_mjs__WEBPACK_IMPORTED_MODULE_28__["default"]),
/* harmony export */   Spinner: () => (/* reexport safe */ _components_Spinner_index_mjs__WEBPACK_IMPORTED_MODULE_29__["default"]),
/* harmony export */   TextAreaInput: () => (/* reexport safe */ _components_TextAreaInput_index_mjs__WEBPACK_IMPORTED_MODULE_30__["default"]),
/* harmony export */   TextInput: () => (/* reexport safe */ _components_TextInput_index_mjs__WEBPACK_IMPORTED_MODULE_31__["default"]),
/* harmony export */   TreeView: () => (/* reexport safe */ _components_TreeView_index_mjs__WEBPACK_IMPORTED_MODULE_32__["default"]),
/* harmony export */   TreeViewItem: () => (/* reexport safe */ _components_TreeViewItem_index_mjs__WEBPACK_IMPORTED_MODULE_33__["default"]),
/* harmony export */   VectorInput: () => (/* reexport safe */ _components_VectorInput_index_mjs__WEBPACK_IMPORTED_MODULE_34__["default"]),
/* harmony export */   revision: () => (/* binding */ revision),
/* harmony export */   version: () => (/* binding */ version)
/* harmony export */ });
/* harmony import */ var _components_Element_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/Element/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Element/index.mjs");
/* harmony import */ var _binding_BindingBase_index_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./binding/BindingBase/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/binding/BindingBase/index.mjs");
/* harmony import */ var _binding_BindingElementToObservers_index_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./binding/BindingElementToObservers/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/binding/BindingElementToObservers/index.mjs");
/* harmony import */ var _binding_BindingObserversToElement_index_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./binding/BindingObserversToElement/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/binding/BindingObserversToElement/index.mjs");
/* harmony import */ var _binding_BindingTwoWay_index_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./binding/BindingTwoWay/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/binding/BindingTwoWay/index.mjs");
/* harmony import */ var _components_ArrayInput_index_mjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/ArrayInput/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/ArrayInput/index.mjs");
/* harmony import */ var _components_BooleanInput_index_mjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/BooleanInput/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/BooleanInput/index.mjs");
/* harmony import */ var _components_Button_index_mjs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/Button/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Button/index.mjs");
/* harmony import */ var _components_Canvas_index_mjs__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/Canvas/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Canvas/index.mjs");
/* harmony import */ var _components_Code_index_mjs__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./components/Code/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Code/index.mjs");
/* harmony import */ var _components_ColorPicker_index_mjs__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./components/ColorPicker/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/ColorPicker/index.mjs");
/* harmony import */ var _components_Container_index_mjs__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./components/Container/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Container/index.mjs");
/* harmony import */ var _components_Divider_index_mjs__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./components/Divider/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Divider/index.mjs");
/* harmony import */ var _components_GradientPicker_index_mjs__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./components/GradientPicker/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/GradientPicker/index.mjs");
/* harmony import */ var _components_GridView_index_mjs__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./components/GridView/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/GridView/index.mjs");
/* harmony import */ var _components_GridViewItem_index_mjs__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./components/GridViewItem/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/GridViewItem/index.mjs");
/* harmony import */ var _components_InfoBox_index_mjs__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./components/InfoBox/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/InfoBox/index.mjs");
/* harmony import */ var _components_InputElement_index_mjs__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./components/InputElement/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/InputElement/index.mjs");
/* harmony import */ var _components_Label_index_mjs__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./components/Label/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Label/index.mjs");
/* harmony import */ var _components_LabelGroup_index_mjs__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./components/LabelGroup/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/LabelGroup/index.mjs");
/* harmony import */ var _components_Menu_index_mjs__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./components/Menu/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Menu/index.mjs");
/* harmony import */ var _components_MenuItem_index_mjs__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./components/MenuItem/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/MenuItem/index.mjs");
/* harmony import */ var _components_NumericInput_index_mjs__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./components/NumericInput/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/NumericInput/index.mjs");
/* harmony import */ var _components_Overlay_index_mjs__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./components/Overlay/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Overlay/index.mjs");
/* harmony import */ var _components_Panel_index_mjs__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./components/Panel/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Panel/index.mjs");
/* harmony import */ var _components_Progress_index_mjs__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./components/Progress/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Progress/index.mjs");
/* harmony import */ var _components_RadioButton_index_mjs__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./components/RadioButton/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/RadioButton/index.mjs");
/* harmony import */ var _components_SelectInput_index_mjs__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./components/SelectInput/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/SelectInput/index.mjs");
/* harmony import */ var _components_SliderInput_index_mjs__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./components/SliderInput/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/SliderInput/index.mjs");
/* harmony import */ var _components_Spinner_index_mjs__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ./components/Spinner/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/Spinner/index.mjs");
/* harmony import */ var _components_TextAreaInput_index_mjs__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ./components/TextAreaInput/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/TextAreaInput/index.mjs");
/* harmony import */ var _components_TextInput_index_mjs__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./components/TextInput/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/TextInput/index.mjs");
/* harmony import */ var _components_TreeView_index_mjs__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./components/TreeView/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/TreeView/index.mjs");
/* harmony import */ var _components_TreeViewItem_index_mjs__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! ./components/TreeViewItem/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/TreeViewItem/index.mjs");
/* harmony import */ var _components_VectorInput_index_mjs__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! ./components/VectorInput/index.mjs */ "./node_modules/@playcanvas/pcui/dist/module/src/components/VectorInput/index.mjs");




































/**
 * PCUI is a front-end framework designed for creating user interfaces in web applications. It is
 * particularly well-suited for building browser-based tools. It offers a comprehensive set of UI
 * components like buttons, sliders, menus and data inputs.
 *
 * PCUI is written in TypeScript. The API can be used from both TypeScript and JavaScript. A React
 * wrapper is provided for easy integration with React applications.
 *
 * @module PCUI
 */
/**
 * The version of the PCUI library. This is a string in semantic version format of `major.minor.patch`.
 */
const version = '4.2.0';
/**
 * The git revision of the PCUI library. This is a string of the git commit hash.
 */
const revision = '2525375';




/***/ }),

/***/ "./node_modules/@playcanvas/pcui/styles/dist/index.mjs":
/*!*************************************************************!*\
  !*** ./node_modules/@playcanvas/pcui/styles/dist/index.mjs ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
function ___$insertStyle(css) {
    if (!css || typeof window === 'undefined') {
        return;
    }
    const style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.innerHTML = css;
    document.head.appendChild(style);
    return css;
}

___$insertStyle("@charset \"UTF-8\";\n@font-face {\n  font-family: pc-icon;\n  src: url(\"data:application/font-woff;charset=utf-7;base64,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\") format(\"woff\");\n  font-weight: normal;\n  font-style: normal;\n}\n.font-icon, .pcui-menu-item-content > .pcui-label[data-icon]::before, .pcui-menu-item-has-children > .pcui-menu-item-content > .pcui-label::after, .pcui-treeview-item:not(.pcui-treeview-item-empty) > .pcui-treeview-item-contents::before, .pcui-treeview-item-icon::after, .pcui-select-input-create-new > .pcui-label:last-child::before, .pcui-container.pcui-select-input-list .pcui-label.pcui-selected::after, .pcui-label.pcui-select-input-disabled-value::after, .pcui-label.pcui-select-input-icon::after, .pcui-infobox[data-icon]:not(.pcui-hidden)::before, .pcui-panel.pcui-collapsible > .pcui-panel-header::before, .picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .picker-gradient-footer > .pcui-panel-content > .delete-curve-button::after, .picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .picker-gradient-footer > .pcui-panel-content > .paste-curve-button::after, .picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .picker-gradient-footer > .pcui-panel-content > .copy-curve-button::after, .picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .picker-gradient-footer > .pcui-panel-content > .pcui-button, .pcui-button[data-icon]::before, .pcui-boolean-input.pcui-boolean-input-ticked::after {\n  font-family: pc-icon;\n}\n\n.font-thin {\n  font-weight: 100;\n  font-style: normal;\n}\n\n.font-light {\n  font-weight: 200;\n  font-style: normal;\n}\n\n.font-regular, .pcui-element {\n  font-weight: normal;\n  font-style: normal;\n}\n\n.font-bold {\n  font-weight: bold;\n  font-style: normal;\n}\n\n.fixed-font, .pcui-select-input-tag > .pcui-label, .pcui-container.pcui-select-input-list .pcui-label, .pcui-select-input-value, .pcui-label.pcui-multiple-values::before, .pcui-text-area-input > textarea, .pcui-input-element.pcui-multiple-values::before, .pcui-input-element > input {\n  font-family: inconsolatamedium, Monaco, Menlo, \"Ubuntu Mono\", Consolas, source-code-pro, monospace;\n  font-weight: normal;\n  font-size: 12px;\n}\n\n.pcui-no-select, .pcui-treeview, .pcui-overlay-inner, .picker-color > .pcui-overlay-content > .pick-opacity, .picker-color > .pcui-overlay-content > .pick-hue, .picker-color > .pcui-overlay-content > .pick-rect, .pcui-color-input, .pcui-canvas, .pcui-button, .pcui-label.pcui-selectable:hover, .pcui-slider {\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n          user-select: none;\n}\n\n.pcui-flex, .pcui-gridview-radio-container, .pcui-gridview-item, .pcui-gridview-vertical, .pcui-gridview, .pcui-label-group, .pcui-select-input-container-value, .pcui-select-input, .pcui-overlay, .pcui-panel-header > .pcui-panel-sortable-icon, .pcui-vector-input {\n  flex-direction: column;\n}\n.pcui-flex:not(.pcui-hidden), .pcui-gridview-radio-container:not(.pcui-hidden), .pcui-gridview-item:not(.pcui-hidden), .pcui-gridview-vertical:not(.pcui-hidden), .pcui-gridview:not(.pcui-hidden), .pcui-label-group:not(.pcui-hidden), .pcui-select-input-container-value:not(.pcui-hidden), .pcui-select-input:not(.pcui-hidden), .pcui-overlay:not(.pcui-hidden), .pcui-panel-header > .pcui-panel-sortable-icon:not(.pcui-hidden), .pcui-vector-input:not(.pcui-hidden) {\n  display: flex;\n}\n\n.pcui-grid {\n  display: grid;\n}\n\n.pcui-scrollable {\n  overflow: auto;\n}\n\n@keyframes pcui-flash-animation {\n  from {\n    outline-color: #f60;\n  }\n  to {\n    outline-color: rgba(255, 102, 0, 0);\n  }\n}\n.pcui-element {\n  border: 0 solid #232e30;\n}\n.pcui-element.flash {\n  outline: 1px solid #f60;\n  animation: pcui-flash-animation 200ms ease-in-out forwards;\n}\n.pcui-element:focus {\n  outline: none;\n}\n.pcui-element::-moz-focus-inner {\n  border: 0;\n}\n\n.pcui-element.pcui-hidden {\n  display: none;\n}\n\n.pcui-input-element {\n  display: inline-block;\n  border: 1px solid #293538;\n  border-radius: 2px;\n  box-sizing: border-box;\n  margin: 6px;\n  min-height: 24px;\n  height: 24px;\n  background-color: #2c393c;\n  vertical-align: top;\n  transition: color 100ms, background-color 100ms, box-shadow 100ms;\n  position: relative;\n  color: #b1b8ba;\n}\n.pcui-input-element > input {\n  height: 100%;\n  width: calc(100% - 16px);\n  padding: 0 6px;\n  line-height: 1;\n  color: inherit;\n  background: transparent;\n  border: none;\n  outline: none;\n  box-shadow: none;\n}\n.pcui-input-element::before {\n  color: inherit;\n}\n\n.pcui-input-element.pcui-multiple-values::before {\n  position: absolute;\n  padding: 0 8px;\n  content: \"...\";\n  white-space: nowrap;\n  top: 5px;\n  font-size: 12px;\n}\n\n.pcui-input-element:not(.pcui-disabled, .pcui-readonly):hover {\n  background-color: #293538;\n  color: #fff;\n}\n.pcui-input-element:not(.pcui-disabled, .pcui-readonly):not(.pcui-error):hover {\n  box-shadow: 0 0 2px 1px rgba(255, 102, 0, 0.3);\n}\n.pcui-input-element:not(.pcui-disabled, .pcui-readonly).pcui-focus {\n  background-color: #20292b;\n  box-shadow: 0 0 0 1px rgba(255, 102, 0, 0.3);\n}\n\n.pcui-input-element.pcui-focus::after, .pcui-input-element.pcui-focus::before, .pcui-input-element:hover::after, .pcui-input-element:hover::before {\n  display: none;\n}\n\n.pcui-input-element.pcui-readonly {\n  background-color: rgba(44, 57, 60, 0.7);\n  border-color: transparent;\n}\n\n.pcui-input-element.pcui-disabled {\n  color: #5b7073;\n}\n\n.pcui-input-element.pcui-error {\n  color: #b1b8ba;\n  box-shadow: 0 0 0 1px #d34141;\n}\n\n.pcui-input-element[placeholder] {\n  position: relative;\n}\n.pcui-input-element[placeholder]::after {\n  content: attr(placeholder);\n  background-color: #2c393c;\n  position: absolute;\n  top: 0;\n  right: 0;\n  padding: 0 8px;\n  line-height: 22px;\n  font-size: 10px;\n  font-weight: 600;\n  white-space: nowrap;\n  color: #829193;\n  pointer-events: none;\n}\n\n.pcui-text-area-input {\n  min-height: 48px;\n  height: auto;\n}\n.pcui-text-area-input > textarea {\n  resize: none;\n  height: 100%;\n  width: calc(100% - 16px);\n  padding: 0 8px;\n  line-height: 22px;\n  color: inherit;\n  background: transparent;\n  border: none;\n  outline: none;\n  box-shadow: none;\n  min-height: 44px;\n  min-width: 172px;\n}\n\n.pcui-text-area-input.pcui-text-area-input-resizable-none > textarea {\n  resize: none;\n}\n\n.pcui-text-area-input.pcui-text-area-input-resizable-both > textarea {\n  resize: both;\n}\n\n.pcui-text-area-input.pcui-text-area-input-resizable-horizontal > textarea {\n  resize: horizontal;\n}\n\n.pcui-text-area-input.pcui-text-area-input-resizable-vertical > textarea {\n  resize: vertical;\n}\n\n.pcui-numeric-input-slider-control {\n  display: none;\n  position: absolute;\n  width: 10px;\n  height: 10px;\n  right: 3px;\n  border: 2px solid #20292b;\n  background-color: #293538;\n  border-radius: 100px;\n  z-index: 9999;\n  transform: translateY(-50%);\n  top: 50%;\n  cursor: ew-resize;\n}\n\n.pcui-numeric-input-slider-control::after {\n  content: \"\\e408\";\n  font-size: 15px;\n  font-family: pc-icon;\n  position: absolute;\n  left: -5px;\n  top: -5px;\n  transform: rotateZ(90deg);\n}\n\n.pcui-numeric-input-slider-control:hover {\n  opacity: 0.5;\n  color: #b1b8ba;\n}\n\n.pcui-numeric-input-slider-control-active {\n  opacity: 1 !important;\n  color: #7f7 !important;\n}\n\n.pcui-numeric-input-slider-control-hidden {\n  display: none !important;\n}\n\n.pcui-numeric-input:hover .pcui-numeric-input-slider-control {\n  display: block;\n}\n\n.pcui-numeric-input.pcui-disabled:hover .pcui-numeric-input-slider-control {\n  display: none;\n}\n\n.pcui-numeric-input.pcui-disabled .pcui-numeric-input-slider-control,\n.pcui-numeric-input.pcui-readonly .pcui-numeric-input-slider-control {\n  display: none;\n}\n\n.pcui-slider {\n  display: inline-flex;\n  height: 24px;\n  margin: 6px;\n  align-items: center;\n}\n.pcui-slider > .pcui-numeric-input {\n  flex: 1;\n  margin-left: 0;\n}\n\n.pcui-slider-container {\n  flex: 3;\n}\n\n.pcui-slider-bar {\n  position: relative;\n  width: calc(100% - 18px);\n  height: 4px;\n  margin: 9px 8px;\n  background-color: #2c393c;\n  border: 1px solid #293538;\n}\n\n.pcui-slider-handle {\n  position: absolute;\n  top: -7px;\n  left: 0;\n  margin-left: -9px;\n  width: 8px;\n  height: 16px;\n  background-color: #5b7073;\n  border: 1px solid #293538;\n  transition: left 100ms ease;\n}\n.pcui-slider-handle:hover, .pcui-slider-handle:focus {\n  outline: none;\n}\n\n.pcui-slider-active {\n  cursor: ew-resize;\n}\n.pcui-slider-active .pcui-slider-bar {\n  border-color: #20292b;\n  background-color: #20292b;\n}\n.pcui-slider-active .pcui-slider-handle {\n  border-color: #20292b;\n  background-color: #fff;\n  transition: none;\n}\n\n.pcui-slider:not(.pcui-disabled, .pcui-readonly):hover {\n  cursor: pointer;\n}\n.pcui-slider:not(.pcui-disabled, .pcui-readonly) .pcui-slider-handle:focus, .pcui-slider:not(.pcui-disabled, .pcui-readonly) .pcui-slider-handle:hover {\n  cursor: ew-resize;\n  outline: none;\n  border-color: #20292b;\n  background-color: #fff;\n}\n\n.pcui-slider.pcui-readonly .pcui-numeric-input {\n  flex: 1;\n}\n.pcui-slider.pcui-readonly .pcui-slider-bar {\n  display: none;\n}\n\n.pcui-slider.pcui-multiple-values .pcui-slider-handle {\n  display: none;\n}\n\n.pcui-vector-input {\n  flex-direction: row;\n  align-items: center;\n}\n.pcui-vector-input > .pcui-numeric-input {\n  flex: 1;\n  margin: 6px 3px;\n}\n.pcui-vector-input > .pcui-numeric-input:first-child {\n  margin-left: 0;\n}\n.pcui-vector-input > .pcui-numeric-input:last-child {\n  margin-right: 0;\n}\n\n.pcui-boolean-input {\n  display: inline-block;\n  position: relative;\n  box-sizing: border-box;\n  background-color: #2c393c;\n  color: #fff;\n  width: 14px;\n  height: 14px;\n  line-height: 1;\n  overflow: hidden;\n  margin: 6px;\n  transition: opacity 100ms, background-color 100ms, box-shadow 100ms;\n}\n.pcui-boolean-input:focus {\n  outline: none;\n}\n\n.pcui-boolean-input.pcui-boolean-input-ticked {\n  background-color: #b1b8ba;\n}\n.pcui-boolean-input.pcui-boolean-input-ticked::after {\n  content: \"\\e372\";\n  color: #20292b;\n  background-color: inherit;\n  font-size: 19px;\n  display: block;\n  margin-top: -2px;\n  margin-left: -2px;\n}\n\n.pcui-boolean-input:not(.pcui-disabled, .pcui-readonly):hover, .pcui-boolean-input:not(.pcui-disabled, .pcui-readonly):focus {\n  cursor: pointer;\n  background-color: #293538;\n  box-shadow: 0 0 2px 1px rgba(255, 102, 0, 0.3);\n}\n.pcui-boolean-input:not(.pcui-disabled, .pcui-readonly).pcui-boolean-input-ticked:hover, .pcui-boolean-input:not(.pcui-disabled, .pcui-readonly).pcui-boolean-input-ticked:focus {\n  background-color: #b1b8ba;\n}\n\n.pcui-boolean-input.pcui-disabled {\n  opacity: 0.4;\n}\n\n.pcui-boolean-input.pcui-multiple-values::after {\n  position: absolute;\n  font-size: 17px;\n  font-weight: bold;\n  color: #b1b8ba;\n  left: 4px;\n  top: -3px;\n  content: \"-\";\n}\n\n.pcui-boolean-input-toggle {\n  display: inline-block;\n  position: relative;\n  width: 30px;\n  height: 16px;\n  border-radius: 8px;\n  flex-shrink: 0;\n  border: 1px solid #293538;\n  box-sizing: border-box;\n  background-color: #364346;\n  color: #fff;\n  line-height: 1;\n  overflow: hidden;\n  margin: 6px;\n  transition: opacity 100ms, background-color 100ms, box-shadow 100ms;\n}\n.pcui-boolean-input-toggle:focus {\n  outline: none;\n}\n.pcui-boolean-input-toggle::after {\n  content: \" \";\n  position: absolute;\n  top: 1px;\n  left: 1px;\n  width: 12px;\n  height: 12px;\n  border-radius: 6px;\n  background-color: #5b7073;\n  transition: left 100ms ease, background-color 100ms ease;\n}\n\n.pcui-boolean-input-toggle.pcui-boolean-input-ticked {\n  border-color: #293538;\n}\n.pcui-boolean-input-toggle.pcui-boolean-input-ticked::after {\n  left: 15px;\n  background-color: #69b875;\n}\n\n.pcui-boolean-input-toggle:not(.pcui-disabled, .pcui-readonly):hover, .pcui-boolean-input-toggle:not(.pcui-disabled, .pcui-readonly):focus {\n  cursor: pointer;\n  border-color: #20292b;\n  background-color: #20292b;\n  box-shadow: 0 0 2px 1px rgba(255, 102, 0, 0.3);\n}\n.pcui-boolean-input-toggle:not(.pcui-disabled, .pcui-readonly):hover::after, .pcui-boolean-input-toggle:not(.pcui-disabled, .pcui-readonly):focus::after {\n  background-color: #d34141;\n}\n.pcui-boolean-input-toggle:not(.pcui-disabled, .pcui-readonly).pcui-boolean-input-ticked:hover, .pcui-boolean-input-toggle:not(.pcui-disabled, .pcui-readonly).pcui-boolean-input-ticked:focus {\n  border-color: #20292b;\n  background-color: #20292b;\n}\n.pcui-boolean-input-toggle:not(.pcui-disabled, .pcui-readonly).pcui-boolean-input-ticked::after {\n  background-color: #7f7;\n}\n\n.pcui-boolean-input-toggle.pcui-readonly {\n  opacity: 0.7;\n}\n\n.pcui-boolean-input-toggle.pcui-disabled {\n  opacity: 0.4;\n}\n\n.pcui-boolean-input-toggle.pcui-multiple-values::after {\n  left: 8px;\n  background-color: rgba(155, 161, 163, 0.25);\n}\n\n.pcui-label {\n  display: inline-block;\n  box-sizing: border-box;\n  margin: 6px;\n  vertical-align: middle;\n  transition: opacity 100ms;\n  color: #b1b8ba;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  -webkit-user-select: none;\n          user-select: none;\n}\n\n.pcui-label.pcui-default-mousedown {\n  -webkit-user-select: initial;\n          user-select: initial;\n}\n\n.pcui-label.pcui-multiple-values {\n  position: relative;\n  color: transparent;\n}\n.pcui-label.pcui-multiple-values::before {\n  content: \"...\";\n  color: #b1b8ba;\n  white-space: nowrap;\n  font-size: 12px;\n}\n\n.pcui-label.pcui-error {\n  color: #d34141;\n}\n\n.pcui-label.pcui-selectable:hover {\n  color: #f60;\n  text-decoration: underline;\n}\n\n.pcui-label[placeholder] {\n  position: relative;\n}\n.pcui-label[placeholder]::after {\n  content: attr(placeholder);\n  position: absolute;\n  top: 0;\n  right: 0;\n  padding: 0 8px;\n  color: #999;\n  pointer-events: none;\n}\n\n.pcui-button {\n  display: inline-block;\n  border: 1px solid #20292b;\n  border-radius: 2px;\n  box-sizing: border-box;\n  background-color: #2c393c;\n  color: #b1b8ba;\n  padding: 0 8px;\n  margin: 6px;\n  height: 28px;\n  line-height: 28px;\n  max-height: 100%;\n  vertical-align: middle;\n  font-size: 12px;\n  font-weight: 600;\n  text-align: center;\n  white-space: nowrap;\n  cursor: pointer;\n  transition: color 100ms, opacity 100ms, box-shadow 100ms;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.pcui-button[data-icon]::before {\n  content: attr(data-icon);\n  font-weight: 100;\n  font-size: inherit;\n  margin-right: 6px;\n  vertical-align: middle;\n}\n.pcui-button[data-icon]:empty::before {\n  margin-right: 0;\n}\n\n.pcui-button:not(.pcui-disabled, .pcui-readonly):hover, .pcui-button:not(.pcui-disabled, .pcui-readonly):focus {\n  color: #fff;\n  background-color: #2c393c;\n  box-shadow: 0 0 2px 1px rgba(255, 102, 0, 0.3);\n}\n.pcui-button:not(.pcui-disabled, .pcui-readonly):active {\n  background-color: #20292b;\n  box-shadow: none;\n}\n\n.pcui-button.pcui-readonly {\n  opacity: 0.7;\n  cursor: default;\n}\n\n.pcui-button.pcui-disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n\n.pcui-button.pcui-small {\n  height: 24px;\n  line-height: 24px;\n  font-size: 10px;\n}\n\n.pcui-code {\n  background: #20292b;\n  overflow: auto;\n}\n.pcui-code .pcui-code-inner {\n  color: #f60;\n  font-family: inconsolatamedium, Monaco, Menlo, \"Ubuntu Mono\", Consolas, source-code-pro, monospace;\n  font-weight: normal;\n  font-size: 10px;\n  white-space: pre;\n}\n\n.pcui-container {\n  position: relative;\n  min-width: 0;\n  min-height: 0;\n}\n\n.pcui-container.pcui-resizable > .pcui-resizable-handle {\n  position: absolute;\n  z-index: 1;\n  opacity: 0;\n  background-color: transparent;\n  touch-action: none;\n}\n.pcui-container.pcui-resizable > .pcui-resizable-handle:hover {\n  opacity: 1;\n}\n.pcui-container.pcui-resizable.pcui-resizable-resizing > .pcui-resizable-handle {\n  opacity: 1;\n}\n.pcui-container.pcui-resizable.pcui-resizable-left > .pcui-resizable-handle, .pcui-container.pcui-resizable.pcui-resizable-right > .pcui-resizable-handle {\n  top: 0;\n  bottom: 0;\n  width: 1px;\n  height: auto;\n  cursor: ew-resize;\n}\n.pcui-container.pcui-resizable.pcui-resizable-left > .pcui-resizable-handle {\n  left: 0;\n  border-left: 3px solid #20292b;\n}\n.pcui-container.pcui-resizable.pcui-resizable-right > .pcui-resizable-handle {\n  right: 0;\n  border-right: 3px solid #20292b;\n}\n.pcui-container.pcui-resizable.pcui-resizable-top > .pcui-resizable-handle, .pcui-container.pcui-resizable.pcui-resizable-bottom > .pcui-resizable-handle {\n  left: 0;\n  right: 0;\n  width: auto;\n  height: 1px;\n  cursor: ns-resize;\n}\n.pcui-container.pcui-resizable.pcui-resizable-top > .pcui-resizable-handle {\n  top: 0;\n  border-top: 3px solid #20292b;\n}\n.pcui-container.pcui-resizable.pcui-resizable-bottom > .pcui-resizable-handle {\n  bottom: 0;\n  border-bottom: 3px solid #20292b;\n}\n\n.pcui-container-dragged {\n  outline: 2px solid #fff;\n  box-sizing: border-box;\n  opacity: 0.7;\n  z-index: 1;\n}\n\n.pcui-container-dragged-child {\n  outline: 1px dotted #f60;\n  box-sizing: border-box;\n}\n\n.pcui-color-input {\n  position: relative;\n  display: inline-block;\n  box-sizing: border-box;\n  width: 44px;\n  height: 24px;\n  margin: 6px;\n  vertical-align: top;\n  cursor: pointer;\n  transition: opacity 100ms;\n}\n.pcui-color-input > .pcui-overlay-clickable {\n  position: fixed;\n}\n.pcui-color-input > div {\n  position: absolute;\n  inset: 0;\n}\n.pcui-color-input::after {\n  content: \" \";\n  position: absolute;\n  bottom: 0;\n  right: 0;\n  width: 0;\n  height: 0;\n  background-color: transparent;\n  border-bottom: 16px solid #293538;\n  border-left: 16px solid transparent;\n}\n\n.picker-color.c-1 > .pcui-overlay-content > .pick-opacity {\n  display: block;\n}\n.picker-color.c-1 > .pcui-overlay-content > .fields > .field-r {\n  display: block;\n}\n.picker-color.c-2 > .pcui-overlay-content > .fields > .field-hex {\n  display: block;\n}\n.picker-color.c-3 > .pcui-overlay-content {\n  width: 298px;\n}\n.picker-color.c-3 > .pcui-overlay-content > .pick-rect {\n  display: block;\n}\n.picker-color.c-3 > .pcui-overlay-content > .pick-hue {\n  display: block;\n}\n.picker-color.c-3 > .pcui-overlay-content > .pick-opacity {\n  display: none;\n}\n.picker-color.c-3 > .pcui-overlay-content > .fields > .field-g,\n.picker-color.c-3 > .pcui-overlay-content > .fields > .field-b {\n  display: block;\n}\n.picker-color.c-4 > .pcui-overlay-content {\n  width: 320px;\n}\n.picker-color.c-4 > .pcui-overlay-content > .pick-opacity {\n  display: block;\n}\n.picker-color.c-4 > .pcui-overlay-content > .fields > .field-a {\n  display: block;\n}\n.picker-color > .pcui-overlay-content {\n  border: 1px solid #000;\n  width: 320px;\n  height: 162px;\n  white-space: nowrap;\n  transition: none;\n}\n.picker-color > .pcui-overlay-content > .pick-rect {\n  position: relative;\n  display: none;\n  float: left;\n  width: 146px;\n  height: 146px;\n  border: 1px solid #000;\n  box-sizing: border-box;\n  margin: 8px 0 8px 8px;\n  background-color: #f00;\n  touch-action: none;\n  cursor: crosshair;\n}\n.picker-color > .pcui-overlay-content > .pick-rect > .white {\n  position: absolute;\n  width: 144px;\n  height: 144px;\n  top: 0;\n  left: 0;\n  background: linear-gradient(to right, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0.01) 100%);\n}\n.picker-color > .pcui-overlay-content > .pick-rect > .black {\n  position: absolute;\n  width: 144px;\n  height: 144px;\n  top: 0;\n  left: 0;\n  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.01) 0%, rgb(0, 0, 0) 100%);\n}\n.picker-color > .pcui-overlay-content > .pick-rect > .handle {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 12px;\n  height: 12px;\n  margin: -7px 0 0 -7px;\n  border: 1px solid #000;\n  outline: 1px solid #fff;\n}\n.picker-color > .pcui-overlay-content > .pick-hue {\n  position: relative;\n  display: none;\n  float: left;\n  width: 14px;\n  height: 146px;\n  margin: 8px 0 8px 8px;\n  border: 1px solid #000;\n  box-sizing: border-box;\n  touch-action: none;\n  cursor: crosshair;\n  background: #000;\n  background: linear-gradient(to bottom, rgb(255, 0, 0) 0%, rgb(255, 255, 0) 16.67%, rgb(0, 255, 0) 33.33%, rgb(0, 255, 255) 50%, rgb(0, 0, 255) 66.67%, rgb(255, 0, 255) 83.33%, rgb(255, 0, 0) 100%);\n}\n.picker-color > .pcui-overlay-content > .pick-hue > .handle {\n  position: absolute;\n  top: 0;\n  left: -3px;\n  width: 16px;\n  height: 4px;\n  margin: -3px 0 0;\n  border: 1px solid #000;\n  outline: 1px solid #fff;\n}\n.picker-color > .pcui-overlay-content > .pick-opacity {\n  position: relative;\n  display: none;\n  float: left;\n  width: 12px;\n  height: 144px;\n  margin: 8px 0 8px 8px;\n  border: 1px solid #000;\n  touch-action: none;\n  cursor: crosshair;\n  background: #000;\n  background: linear-gradient(to bottom, #fff 0%, #000 100%);\n}\n.picker-color > .pcui-overlay-content > .pick-opacity > .handle {\n  position: absolute;\n  top: 0;\n  left: -3px;\n  width: 16px;\n  height: 4px;\n  margin: -3px 0 0;\n  border: 1px solid #000;\n  outline: 1px solid #fff;\n}\n.picker-color > .pcui-overlay-content > .fields {\n  float: left;\n  width: 106px;\n  height: 154px;\n  margin: 0 0 0 8px;\n  padding: 4px;\n}\n.picker-color > .pcui-overlay-content > .fields > .field {\n  display: none;\n  width: 100px;\n}\n\n.pcui-color-input.pcui-multiple-values > div {\n  display: none;\n}\n\n.pcui-color-input.pcui-readonly {\n  cursor: default;\n}\n.pcui-color-input.pcui-readonly::after {\n  display: none;\n}\n\n.pcui-color-input.pcui-disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n\n.pcui-color-input:not(.pcui-disabled, .pcui-readonly):hover, .pcui-color-input:not(.pcui-disabled, .pcui-readonly):focus {\n  box-shadow: 0 0 2px 1px rgba(255, 102, 0, 0.3);\n}\n.pcui-color-input:not(.pcui-disabled, .pcui-readonly):hover::after, .pcui-color-input:not(.pcui-disabled, .pcui-readonly):focus::after {\n  border-bottom-color: #20292b;\n}\n.pcui-color-input:not(.pcui-disabled, .pcui-readonly):active {\n  box-shadow: 0 0 0 1px rgba(255, 102, 0, 0.3);\n}\n\n.pcui-gradient {\n  display: inline-block;\n  flex: 1;\n  height: 24px;\n  box-sizing: border-box;\n  margin: 6px;\n  transition: opacity 100ms, box-shadow 100ms;\n  border: 1px solid #293538;\n  background-color: #2c393c;\n}\n.pcui-gradient > .pcui-canvas {\n  width: 100%;\n  height: 100%;\n  background-color: transparent;\n}\n\n.pcui-gradient.pcui-disabled,\n.pcui-gradient.pcui-multiple-values {\n  opacity: 0.4;\n}\n\n.pcui-gradient:not(.pcui-disabled, .pcui-readonly, .pcui-multiple-values):hover, .pcui-gradient:not(.pcui-disabled, .pcui-readonly, .pcui-multiple-values):focus {\n  cursor: pointer;\n  box-shadow: 0 0 2px 1px rgba(255, 102, 0, 0.3);\n}\n.pcui-gradient:not(.pcui-disabled, .pcui-readonly, .pcui-multiple-values):active {\n  box-shadow: 0 0 0 1px rgba(255, 102, 0, 0.3);\n}\n\n.picker-gradient > .pcui-overlay-content {\n  width: 343px;\n  height: 262px;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel {\n  height: 100%;\n  font-size: 11px;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .show-selected-position {\n  position: absolute;\n  width: 18px;\n  min-height: 17px !important;\n  height: 17px !important;\n  top: 14px;\n  margin-top: 0;\n  margin-bottom: 0;\n  display: flex;\n  align-items: center;\n  text-align: center;\n  color: #9ba1a3;\n  background-color: #2c393c;\n  border-radius: 2px;\n  justify-content: center;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .show-selected-position > .show-selected-position-input {\n  width: inherit;\n  text-align: center;\n  justify-content: center;\n  font-style: normal;\n  font-weight: 400;\n  font-size: 12px;\n  line-height: 22px;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .anchor-crosshair {\n  position: absolute;\n  top: 41.5px;\n  pointer-events: none;\n  background: none;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .anchor-crosshair > .crosshair-bar {\n  background: #293538;\n  width: 1px;\n  height: 29px;\n  position: absolute;\n  top: -34px;\n  left: 8px;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .anchor-crosshair > .show-crosshair-position {\n  font-style: normal;\n  font-weight: 400;\n  font-size: 12px;\n  font-family: inconsolatamedium, Monaco, Menlo, \"Ubuntu Mono\", Consolas, source-code-pro, monospace;\n  line-height: 22px;\n  position: absolute;\n  width: 18px;\n  min-height: 17px !important;\n  height: 17px !important;\n  top: 14px;\n  margin-top: 0;\n  margin-bottom: 0;\n  display: flex;\n  align-items: center;\n  text-align: center;\n  color: #9ba1a3;\n  background-color: #2c393c;\n  border-radius: 2px;\n  justify-content: center;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .picker-gradient-gradient {\n  width: 321px;\n  height: 28px;\n  display: block;\n  padding: 8px 10px 0 11px;\n  background-color: #2c393c;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .picker-gradient-gradient .crosshair-active {\n  cursor: none;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .picker-gradient-anchors {\n  width: 320px;\n  height: 28px;\n  display: block;\n  padding: 0 10px 0 11px;\n  background-color: #2c393c;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .picker-gradient-footer {\n  padding: 5px;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .picker-gradient-footer > .pcui-panel-header {\n  display: none;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .picker-gradient-footer > .pcui-panel-content {\n  display: flex;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .picker-gradient-footer > .pcui-panel-content > .pcui-label {\n  align-self: center;\n  font-family: inherit;\n  font-style: normal;\n  font-weight: 600;\n  font-size: 12px;\n  line-height: 19px;\n  align-content: center;\n  height: 20px;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .picker-gradient-footer > .pcui-panel-content > .pcui-select-input {\n  align-self: center;\n  width: 162px;\n  height: 22px;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .picker-gradient-footer > .pcui-panel-content > .pcui-numeric-input {\n  align-self: center;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .picker-gradient-footer > .pcui-panel-content > .pcui-button {\n  width: 22px;\n  height: 22px;\n  vertical-align: bottom;\n  margin: 0;\n  margin-right: 8px;\n  margin-top: 6px;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .picker-gradient-footer > .pcui-panel-content > .copy-curve-button {\n  border-color: #2c393c;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .picker-gradient-footer > .pcui-panel-content > .copy-curve-button::after {\n  content: \"\\e351\";\n  position: absolute;\n  top: 4px;\n  left: 218px;\n  font-size: 15px;\n  text-align: center;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .picker-gradient-footer > .pcui-panel-content > .paste-curve-button {\n  border-color: #2c393c;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .picker-gradient-footer > .pcui-panel-content > .paste-curve-button::after {\n  content: \"\\e348\";\n  position: absolute;\n  top: 4px;\n  left: 248px;\n  font-size: 15px;\n  text-align: center;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .picker-gradient-footer > .pcui-panel-content > .delete-curve-button {\n  border-color: #2c393c;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .picker-gradient-footer > .pcui-panel-content > .delete-curve-button::after {\n  content: \"\\e125\";\n  position: absolute;\n  top: 4px;\n  left: 278px;\n  font-size: 15px;\n  text-align: center;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .color-panel {\n  height: 156px;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .color-panel > .pcui-panel-header {\n  display: none;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .color-panel > .pcui-panel-content > .color-rect {\n  margin: 5px 10px 10px;\n  width: 140px;\n  height: 140px;\n  cursor: crosshair;\n  position: relative;\n  float: left;\n  border-width: 1px;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .color-panel > .pcui-panel-content > .color-handle {\n  position: absolute;\n  width: 14px;\n  height: 14px;\n  border: 1px solid #000;\n  outline: 1px solid #fff;\n  pointer-events: none;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .color-panel > .pcui-panel-content > .hue-rect,\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .color-panel > .pcui-panel-content > .alpha-rect {\n  margin: 5px 10px 10px 0;\n  width: 20px;\n  height: 140px;\n  cursor: crosshair;\n  border-width: 1px;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .color-panel > .pcui-panel-content > .hue-handle,\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .color-panel > .pcui-panel-content > .alpha-handle {\n  position: absolute;\n  width: 20px;\n  height: 4px;\n  border: 1px solid rgb(92, 82, 79);\n  outline: 1px solid #fff;\n  pointer-events: none;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .color-panel > .pcui-panel-content > .fields {\n  display: inline-block;\n  margin: 3px 0 0;\n  width: 112px;\n  height: 145px;\n  vertical-align: top;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .color-panel > .pcui-panel-content > .fields > .pcui-numeric-input {\n  margin: 2px 0;\n  width: 108px;\n}\n.picker-gradient > .pcui-overlay-content > .picker-gradient-panel > .color-panel > .pcui-panel-content > .fields > .pcui-text-input {\n  margin: 2px 0;\n  min-height: 22px;\n  min-width: 111px;\n}\n\n.pcui-panel {\n  background-color: #364346;\n}\n\n.pcui-panel-header {\n  background-color: #293538;\n  color: #fff;\n  font-size: 12px;\n  white-space: nowrap;\n  padding-left: 10px;\n  flex-shrink: 0;\n  align-items: center;\n}\n\n.pcui-panel-header-title {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  flex: 1;\n  color: inherit;\n  font-size: inherit;\n  white-space: inherit;\n  margin: 0 auto 0 0;\n}\n\n.pcui-panel-content {\n  flex: 1;\n}\n\n.pcui-panel.pcui-collapsible {\n  transition: height 100ms, width 100ms;\n}\n.pcui-panel.pcui-collapsible > .pcui-panel-header {\n  cursor: pointer;\n}\n.pcui-panel.pcui-collapsible > .pcui-panel-header::before {\n  content: \"\\e179\";\n  font-size: 14px;\n  margin-right: 10px;\n  text-align: center;\n  color: #f60;\n}\n.pcui-panel.pcui-collapsible > .pcui-panel-header:hover {\n  color: #fff;\n}\n.pcui-panel.pcui-collapsible > .pcui-panel-header:hover::before {\n  color: #fff;\n}\n.pcui-panel.pcui-collapsible.pcui-panel-normal > .pcui-panel-header::before {\n  content: \"\\e183\";\n  font-weight: 200;\n}\n.pcui-panel.pcui-collapsible > .pcui-panel-content {\n  transition: visibility 100ms;\n}\n.pcui-panel.pcui-collapsible.pcui-collapsed {\n  overflow: hidden;\n}\n.pcui-panel.pcui-collapsible.pcui-collapsed > .pcui-panel-content {\n  visibility: hidden;\n}\n.pcui-panel.pcui-collapsible.pcui-collapsed > .pcui-panel-header::before {\n  content: \"\\e180\";\n}\n.pcui-panel.pcui-collapsible.pcui-collapsed.pcui-panel-normal > .pcui-panel-header::before {\n  content: \"\\e184\";\n}\n.pcui-panel.pcui-collapsible.pcui-collapsed.pcui-panel-horizontal > .pcui-panel-header {\n  width: 2048px;\n  transform: rotate(90deg);\n  transform-origin: 0% 100%;\n}\n.pcui-panel.pcui-collapsible.pcui-collapsed.pcui-panel-horizontal > .pcui-panel-header::before {\n  content: \"\\e177\";\n}\n.pcui-panel.pcui-collapsible.pcui-collapsed.pcui-panel-horizontal.pcui-panel-normal > .pcui-panel-header::before {\n  content: \"\\e181\";\n}\n.pcui-panel.pcui-collapsible.pcui-collapsed.pcui-panel-horizontal > .pcui-panel-content {\n  transition: none;\n}\n\n.pcui-panel.pcui-resizable.pcui-collapsible.pcui-collapsed > .pcui-resizable-handle {\n  display: none;\n}\n.pcui-panel.pcui-resizable.pcui-resizable-resizing {\n  transition: none;\n}\n.pcui-panel.pcui-resizable.pcui-resizable-resizing > .pcui-panel-content {\n  transition: none;\n}\n\n.pcui-panel-header > .pcui-panel-sortable-icon {\n  color: #5b7073;\n  transition: color 100ms;\n  flex-direction: row;\n  align-items: center;\n  margin: 0 10px 0 0;\n  height: 100%;\n}\n.pcui-panel-header > .pcui-panel-sortable-icon::before {\n  content: \" \";\n  border-left: 1px solid #364346;\n  margin-right: 10px;\n  height: calc(100% - 14px);\n  flex-shrink: 0;\n}\n.pcui-panel-header > .pcui-panel-sortable-icon::after {\n  content: \".. .. ..\";\n  white-space: normal;\n  width: 12px;\n  line-height: 5px;\n  overflow: hidden;\n  height: 24px;\n  font-size: 22px;\n  letter-spacing: 1px;\n  flex-shrink: 0;\n}\n\n.pcui-panel:not(.pcui-disabled, .pcui-readonly) > .pcui-panel-header > .pcui-panel-sortable-icon:hover {\n  color: #fff;\n  cursor: move;\n}\n\n.pcui-panel:not(.pcui-collapsible) > .pcui-panel-header > .pcui-panel-sortable-icon::before {\n  display: none;\n}\n\n.pcui-panel-remove {\n  align-self: flex-end;\n  order: 100;\n}\n.pcui-panel-remove::before {\n  line-height: 30px;\n}\n\n.pcui-panel.pcui-readonly .pcui-panel-remove {\n  display: none;\n}\n\n.pcui-panel-header > .pcui-button {\n  flex-shrink: 0;\n  margin: 1px;\n  background-color: transparent;\n  border: 0;\n}\n\n.pcui-panel.pcui-disabled > .pcui-panel-header {\n  background-color: #303d40;\n  color: #999;\n}\n\n.pcui-subpanel {\n  box-sizing: border-box;\n  margin: 6px;\n  border: 1px solid #293538;\n  border-radius: 2px;\n  background-color: #2c393c;\n  color: #b1b8ba;\n  font-size: 12px;\n}\n.pcui-subpanel .pcui-button {\n  background-color: #364346;\n  border-color: #293538;\n}\n.pcui-subpanel .pcui-button:not(.pcui-disabled, .pcui-readonly):hover, .pcui-subpanel .pcui-button:not(.pcui-disabled, .pcui-readonly):focus {\n  background-color: #364346;\n}\n.pcui-subpanel .pcui-button:not(.pcui-disabled, .pcui-readonly):active {\n  background-color: #2c393c;\n}\n\n.pcui-overlay {\n  width: auto;\n  height: auto;\n  inset: 0;\n  z-index: 101;\n  transition: opacity 100ms, visibility 100ms;\n  justify-content: center;\n  align-items: center;\n  position: absolute;\n}\n\n.pcui-overlay-inner {\n  position: absolute;\n  width: auto;\n  height: auto;\n  inset: 0;\n  background-color: rgba(32, 41, 43, 0.7);\n}\n\n.pcui-overlay-clickable > .pcui-overlay-inner {\n  cursor: pointer;\n}\n\n.pcui-overlay-transparent > .pcui-overlay-inner {\n  background-color: transparent;\n}\n\n.pcui-overlay-content {\n  background-color: #364346;\n  transition: width 100ms, height 100ms, margin-left 100ms, margin-top 100ms;\n  box-shadow: 7px 7px 7px rgba(0, 0, 0, 0.15);\n}\n\n.pcui-divider {\n  height: 1px;\n  background-color: #2c393c;\n  margin: 6px 0;\n}\n\n.pcui-infobox {\n  box-sizing: border-box;\n  margin: 6px;\n  padding: 12px;\n  border: 1px solid #293538;\n  border-radius: 2px;\n  background-color: #2c393c;\n  color: #b1b8ba;\n  font-size: 12px;\n}\n.pcui-infobox :first-child {\n  color: #fff;\n  margin-bottom: 2px;\n}\n.pcui-infobox[data-icon]:not(.pcui-hidden) {\n  display: grid;\n  grid: auto-flow/min-content 1fr;\n}\n.pcui-infobox[data-icon]:not(.pcui-hidden)::before {\n  content: attr(data-icon);\n  font-weight: 100;\n  font-size: 16px;\n  margin-right: 12px;\n  vertical-align: middle;\n  grid-column: 1;\n  grid-row: 1/3;\n}\n\n.pcui-select-input {\n  box-sizing: border-box;\n  margin: 6px;\n  border-radius: 2px;\n  min-width: 0;\n}\n\n.pcui-select-input-container-value {\n  background-color: #2c393c;\n  transition: box-shadow 100ms, opacity 100ms;\n}\n\n.pcui-select-input-shadow {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  transition: box-shadow 100ms;\n  border-radius: 2px;\n  pointer-events: none;\n  z-index: 1;\n}\n\n.pcui-select-input-value {\n  margin: 0;\n  padding: 0 24px 0 8px;\n  height: 24px;\n  line-height: 24px;\n  font-size: 12px;\n  transition: background-color 100ms, color 100ms;\n}\n.pcui-select-input-value:not(.pcui-hidden) {\n  display: block;\n}\n\n.pcui-label.pcui-select-input-value {\n  margin: 0;\n}\n\n.pcui-select-input-textinput {\n  margin: 0;\n}\n\n.pcui-select-input-textinput:not(.pcui-disabled, .pcui-readonly, .pcui-error).pcui-focus, .pcui-select-input-textinput:not(.pcui-disabled, .pcui-readonly, .pcui-error):hover {\n  box-shadow: none;\n}\n\n.pcui-label.pcui-select-input-icon {\n  position: absolute;\n  right: 6px;\n  color: #5b7073;\n  pointer-events: none;\n  transition: color 100ms;\n  margin: 0;\n  height: 24px;\n  line-height: 24px;\n}\n.pcui-label.pcui-select-input-icon::after {\n  content: \"\\e159\";\n  vertical-align: middle;\n}\n\n.pcui-select-input-has-disabled-value .pcui-container.pcui-select-input-list .pcui-label.pcui-selected::after {\n  font-family: inherit;\n  content: \"fallback\";\n  color: #fff;\n  font-size: 10px;\n  position: absolute;\n  right: 6px;\n}\n\n.pcui-label.pcui-select-input-disabled-value::after {\n  content: \"\\e133\" !important;\n  position: absolute;\n  right: 6px;\n}\n\n.pcui-select-input.pcui-open .pcui-select-input-shadow {\n  box-shadow: 0 0 2px 1px rgba(255, 102, 0, 0.3);\n}\n.pcui-select-input.pcui-open .pcui-select-input-value {\n  color: #fff;\n  background-color: #20292b;\n}\n.pcui-select-input.pcui-open .pcui-select-input-icon::after {\n  color: #fff;\n  content: \"\\e157\";\n}\n\n.pcui-container.pcui-select-input-list {\n  position: absolute;\n  z-index: 1;\n  top: 100%;\n  width: 100%;\n  max-height: 200px;\n  overflow-y: auto;\n  background-color: #293538;\n}\n.pcui-container.pcui-select-input-list .pcui-label {\n  font-size: 12px;\n  height: 22px;\n  line-height: 22px;\n  padding: 0 24px 0 6px;\n  margin: 0;\n  transition: background-color 100ms, color 100ms;\n}\n.pcui-container.pcui-select-input-list .pcui-label:not(.pcui-hidden) {\n  display: block;\n}\n.pcui-container.pcui-select-input-list .pcui-label.pcui-selected {\n  color: #fff;\n}\n.pcui-container.pcui-select-input-list .pcui-label.pcui-selected::after {\n  content: \"\\e133\";\n  color: #5b7073;\n  position: absolute;\n  right: 6px;\n}\n\n.pcui-select-input-fit-height .pcui-select-input-list {\n  top: initial;\n  bottom: 100%;\n}\n.pcui-select-input-fit-height .pcui-select-input-shadow {\n  top: initial;\n  bottom: 0;\n}\n\n.pcui-select-input-tags:not(.pcui-select-input-tags-empty) {\n  margin-top: 1px;\n  flex-wrap: wrap;\n}\n\n.pcui-select-input-tag {\n  background-color: #293538;\n  align-items: center;\n  border-radius: 2px;\n  border: 1px solid #232e30;\n  margin-right: 2px;\n  margin-top: 2px;\n  min-width: 0;\n  height: 18px;\n}\n.pcui-select-input-tag > * {\n  margin: 0;\n  background-color: transparent;\n  border: 0;\n}\n.pcui-select-input-tag > .pcui-label {\n  padding: 0 5px 0 8px;\n}\n.pcui-select-input-tag > .pcui-button {\n  padding: 0 5px;\n  height: 18px;\n  line-height: 18px;\n  flex-shrink: 0;\n}\n.pcui-select-input-tag > .pcui-button:not(.pcui-disabled, .pcui-readonly):hover {\n  box-shadow: none;\n  color: #d34141;\n}\n\n.pcui-select-input-tag-not-everywhere > .pcui-label {\n  opacity: 0.5;\n}\n.pcui-select-input-tag-not-everywhere > .pcui-label::before {\n  content: \"*\";\n  margin-right: 5px;\n}\n\n.pcui-select-input:not(.pcui-disabled, .pcui-readonly) .pcui-select-input-container-value:hover .pcui-select-input-shadow {\n  box-shadow: 0 0 2px 1px rgba(255, 102, 0, 0.3);\n}\n.pcui-select-input:not(.pcui-disabled, .pcui-readonly) .pcui-select-input-container-value:hover .pcui-select-input-icon {\n  color: #9ba1a3;\n}\n.pcui-select-input:not(.pcui-disabled, .pcui-readonly).pcui-focus .pcui-select-input-shadow {\n  box-shadow: 0 0 2px 1px rgba(255, 102, 0, 0.3);\n}\n.pcui-select-input:not(.pcui-disabled, .pcui-readonly).pcui-focus .pcui-select-input-icon {\n  color: #9ba1a3;\n}\n.pcui-select-input:not(.pcui-disabled, .pcui-readonly) .pcui-select-input-value:hover {\n  color: #fff;\n  background-color: #20292b;\n  cursor: pointer;\n}\n.pcui-select-input:not(.pcui-disabled, .pcui-readonly) .pcui-select-input-list > *:hover,\n.pcui-select-input:not(.pcui-disabled, .pcui-readonly) .pcui-select-input-list > .pcui-select-input-label-highlighted {\n  background-color: #20292b;\n  color: #fff;\n  cursor: pointer;\n}\n\n.pcui-select-input-create-new > .pcui-label {\n  padding-right: 6px;\n}\n.pcui-select-input-create-new > .pcui-label:last-child {\n  flex-shrink: 0;\n  margin-left: auto;\n}\n.pcui-select-input-create-new > .pcui-label:last-child::before {\n  content: \"\\e120\";\n  margin-right: 6px;\n}\n\n.pcui-select-input.pcui-disabled {\n  opacity: 0.4;\n}\n\n.pcui-select-input .pcui-label.pcui-disabled {\n  opacity: 0.4;\n}\n\n.pcui-select-input.pcui-readonly .pcui-select-input-icon {\n  display: none;\n}\n.pcui-select-input.pcui-readonly.pcui-select-input-multi .pcui-select-input-container-value {\n  display: none;\n}\n.pcui-select-input.pcui-readonly.pcui-select-input-multi .pcui-select-input-tag > .pcui-button {\n  display: none;\n}\n.pcui-select-input.pcui-readonly.pcui-select-input-allow-input:not(.pcui-select-input-multi) {\n  opacity: 0.7;\n}\n.pcui-select-input.pcui-readonly.pcui-select-input-allow-input:not(.pcui-select-input-multi) .pcui-select-input-textinput::after {\n  display: none;\n}\n\n@keyframes animation-spin {\n  from {\n    transform: rotate(0deg);\n  }\n  to {\n    transform: rotate(360deg);\n  }\n}\n.pcui-spinner {\n  display: inline-block;\n  margin: 6px;\n  vertical-align: middle;\n}\n.pcui-spinner > path {\n  animation-name: animation-spin;\n  animation-duration: 750ms;\n  animation-iteration-count: infinite;\n  animation-timing-function: linear;\n  transform-origin: center;\n}\n.pcui-spinner.pcui-error > path {\n  animation: none;\n  fill: #ff2020;\n}\n.pcui-spinner.pcui-error > path.pcui-spinner-highlight {\n  fill: #ff7777;\n}\n\n.pcui-progress {\n  height: 4px;\n  background-color: #20292b;\n  transition: opacity 100ms;\n  width: 100%;\n}\n.pcui-progress .pcui-progress-inner {\n  width: 0%;\n  height: inherit;\n  background: #f60;\n  background: linear-gradient(135deg, #ff6600 0%, #ff6600 25%, #a84300 26%, #a84300 50%, #ff6600 51%, #ff6600 75%, #a84300 76%, #a84300 100%);\n  background-position: 0 0;\n  background-size: 24px 24px;\n  background-repeat: repeat;\n  animation: pcui-progress-background 1000ms linear infinite;\n}\n\n.pcui-progress.pcui-error .pcui-progress-inner {\n  background: #f60;\n  background: linear-gradient(135deg, #ff7777 0%, #ff7777 25%, #ff2020 26%, #ff2020 50%, #ff7777 51%, #ff7777 75%, #ff2020 76%, #ff2020 100%);\n  background-position: 0 0;\n  background-size: 24px 24px;\n  background-repeat: repeat;\n  animation: none;\n}\n\n@keyframes pcui-progress-background {\n  from {\n    background-position: 0 0;\n  }\n  to {\n    background-position: 24px 0;\n  }\n}\n.pcui-treeview {\n  min-width: -webkit-max-content;\n  min-width: max-content;\n}\n\n.pcui-treeview-item {\n  position: relative;\n  padding-left: 24px;\n}\n.pcui-treeview-item::before {\n  content: \" \";\n  position: absolute;\n  background-color: #313e41;\n  width: 2px;\n  left: 14px;\n  top: -12px;\n  bottom: 12px;\n}\n.pcui-treeview-item:last-child::before {\n  height: 25px;\n  bottom: auto;\n}\n\n.pcui-treeview-item.pcui-disabled > .pcui-treeview-item-contents > .pcui-treeview-item-text {\n  opacity: 0.4;\n}\n\n.pcui-treeview-item-contents {\n  position: relative;\n  color: #b1b8ba;\n  margin-left: 3px;\n  border: 1px solid transparent;\n  align-items: center;\n  height: 24px;\n  box-sizing: border-box;\n}\n.pcui-treeview-item-contents:hover {\n  cursor: pointer;\n  color: #fff;\n  background-color: #2c393c;\n}\n.pcui-treeview-item-contents:hover > .pcui-treeview-item-icon {\n  color: #fff;\n}\n\n.pcui-treeview-item-icon {\n  color: #5b7073;\n  margin: 0 2px 0 0;\n  flex-shrink: 0;\n}\n.pcui-treeview-item-icon::before {\n  content: \" \";\n  position: absolute;\n  background-color: #313e41;\n  left: -12px;\n  top: 10px;\n  width: 24px;\n  height: 2px;\n}\n.pcui-treeview-item-icon::after {\n  content: attr(data-icon);\n  display: inline-block;\n  vertical-align: sub;\n  width: 22px;\n  height: 22px;\n  position: relative;\n  z-index: 1;\n  text-align: center;\n}\n\n.pcui-treeview-item-text {\n  margin: 0;\n  flex-shrink: 0;\n  position: relative;\n  z-index: 1;\n  transition: opacity 100ms;\n  padding-right: 8px;\n  color: inherit;\n}\n\n.pcui-treeview-item-contents.pcui-treeview-item-selected {\n  background-color: #20292b;\n  color: #fff;\n}\n.pcui-treeview-item-contents.pcui-treeview-item-selected > .pcui-treeview-item-icon {\n  color: #fff;\n}\n\n.pcui-treeview-item:not(.pcui-treeview-item-empty) > .pcui-treeview-item-contents::before {\n  content: \"\\e120\";\n  position: absolute;\n  font-size: 10px;\n  font-weight: bold;\n  text-align: center;\n  color: #b1b8ba;\n  background-color: #2c393c;\n  top: 0;\n  left: -24px;\n  width: 16px;\n  height: 16px;\n  line-height: 16px;\n  margin: 3px;\n  cursor: pointer;\n  z-index: 1;\n}\n.pcui-treeview-item:not(.pcui-treeview-item-empty).pcui-treeview-item-open > .pcui-treeview-item-contents::before {\n  content: \"\\e121\";\n}\n\n.pcui-treeview > .pcui-treeview-item {\n  padding-left: 0;\n}\n.pcui-treeview > .pcui-treeview-item::before {\n  content: none;\n}\n.pcui-treeview > .pcui-treeview-item > .pcui-treeview-item-contents {\n  margin-left: 0;\n}\n.pcui-treeview > .pcui-treeview-item > .pcui-treeview-item-contents > .pcui-treeview-item-icon::before {\n  content: none;\n}\n.pcui-treeview > .pcui-treeview-item > .pcui-treeview-item-contents > .pcui-treeview-item-icon::after {\n  margin-left: 0;\n}\n.pcui-treeview > .pcui-treeview-item > .pcui-treeview-item {\n  padding-left: 21px;\n}\n.pcui-treeview > .pcui-treeview-item > .pcui-treeview-item::before {\n  left: 11px;\n}\n\n.pcui-treeview:not(.pcui-treeview-filtering) > .pcui-treeview-item .pcui-treeview-item:not(.pcui-treeview-item-open, .pcui-treeview-item-empty) > .pcui-treeview-item {\n  display: none;\n}\n\n.pcui-treeview-item-dragged > .pcui-treeview-item-contents {\n  background-color: rgba(44, 57, 60, 0.5);\n  color: #fff;\n}\n\n.pcui-treeview-drag-handle {\n  position: fixed;\n  width: 32px;\n  height: 20px;\n  top: 0;\n  bottom: 0;\n  z-index: 4;\n  margin-top: -1px;\n  margin-left: -1px;\n}\n.pcui-treeview-drag-handle.before {\n  border-top: 4px solid #f60;\n  padding-right: 8px;\n  height: 24px;\n}\n.pcui-treeview-drag-handle.inside {\n  border: 4px solid #f60;\n}\n.pcui-treeview-drag-handle.after {\n  border-bottom: 4px solid #f60;\n  padding-right: 8px;\n  height: 24px;\n}\n\n.pcui-treeview-item-contents::after {\n  content: \" \";\n  display: block;\n  clear: both;\n}\n\n.pcui-treeview-item.pcui-treeview-item-rename > .pcui-treeview-item-contents > .pcui-treeview-item-text {\n  display: none;\n}\n.pcui-treeview-item.pcui-treeview-item-rename > .pcui-treeview-item-contents > .pcui-text-input {\n  margin: 0;\n  flex-grow: 1;\n  box-shadow: none !important;\n  border: 0;\n  background-color: transparent;\n}\n.pcui-treeview-item.pcui-treeview-item-rename > .pcui-treeview-item-contents > .pcui-text-input > input {\n  font-family: inherit;\n  font-size: 14px;\n  padding: 0;\n}\n\n.pcui-treeview.pcui-treeview-filtering .pcui-treeview-item {\n  padding-left: 0;\n}\n.pcui-treeview.pcui-treeview-filtering .pcui-treeview-item::before {\n  display: none;\n}\n.pcui-treeview.pcui-treeview-filtering .pcui-treeview-item:not(.pcui-treeview-filtering-result) > .pcui-treeview-item-contents {\n  display: none;\n}\n.pcui-treeview.pcui-treeview-filtering .pcui-treeview-item-contents {\n  margin-left: 0;\n}\n\n.pcui-treeview-filtering-result .pcui-treeview-item-contents::before,\n.pcui-treeview-filtering-result .pcui-treeview-item-icon::before {\n  display: none;\n}\n\n.pcui-label-group {\n  align-items: center;\n  flex-flow: row nowrap;\n  margin: 6px;\n}\n.pcui-label-group > .pcui-label:first-child {\n  width: 100px;\n  flex-shrink: 0;\n  margin: 0;\n}\n.pcui-label-group > .pcui-element:not(:first-child) {\n  margin: 0 0 0 6px;\n}\n.pcui-label-group > .pcui-element:nth-child(2):not(.pcui-not-flexible) {\n  flex: 1;\n}\n.pcui-label-group > .pcui-vector-input > .pcui-numeric-input {\n  margin-top: 0;\n  margin-bottom: 0;\n}\n\n.pcui-label-group-align-top > .pcui-label:first-child {\n  align-self: flex-start;\n  margin-top: 4px;\n}\n\n.pcui-label-group.pcui-disabled > .pcui-label:first-child {\n  opacity: 0.4;\n}\n\n.pcui-gridview {\n  flex-flow: row wrap;\n  align-content: flex-start;\n}\n\n.pcui-gridview-vertical {\n  flex-direction: column;\n  align-content: flex-start;\n}\n\n.pcui-gridview-item {\n  box-sizing: border-box;\n  justify-content: center;\n  align-items: center;\n  flex-shrink: 0;\n  width: 104px;\n}\n.pcui-gridview-item:not(.pcui-disabled) {\n  cursor: pointer;\n}\n.pcui-gridview-item:not(.pcui-disabled):not(.pcui-gridview-item-selected, .pcui-gridview-radiobtn, .pcui-gridview-radiobtn-selected):hover {\n  background-color: #293538;\n}\n\n.pcui-gridview-item-selected {\n  background-color: #20292b;\n}\n\n.pcui-gridview-item-text {\n  max-width: 100px;\n  font-size: 12px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  margin: 0;\n  padding: 0 2px;\n}\n\n.pcui-gridview-radio-container {\n  box-sizing: border-box;\n  flex-direction: row;\n  justify-content: center;\n  align-items: center;\n  flex-shrink: 0;\n  width: 104px;\n}\n.pcui-gridview-radio-container :not(.pcui-disabled) {\n  cursor: pointer;\n}\n\n.pcui-menu {\n  position: absolute;\n  z-index: 401;\n  inset: 0;\n  width: auto;\n  height: auto;\n}\n\n.pcui-menu-items {\n  position: fixed;\n  top: 0;\n  left: 0;\n}\n\n.pcui-menu-item {\n  position: relative;\n  background-color: #20292b;\n  width: auto;\n}\n\n.pcui-menu-item-children {\n  box-shadow: 0 0 8px rgba(0, 0, 0, 0.6);\n  position: absolute;\n  z-index: 1;\n  left: 100%;\n  top: 0;\n  opacity: 0;\n  transition: opacity 100ms, visibility 100ms;\n  visibility: hidden;\n}\n\n.pcui-menu-item:hover > .pcui-menu-item-children {\n  opacity: 1;\n  visibility: visible;\n}\n\n.pcui-menu-item-has-children > .pcui-menu-item-content > .pcui-label {\n  padding-right: 32px;\n}\n.pcui-menu-item-has-children > .pcui-menu-item-content > .pcui-label::after {\n  content: \"\\e160\";\n  position: absolute;\n  right: 6px;\n}\n\n.pcui-menu-item-content {\n  min-width: 158px;\n  color: #9ba1a3;\n  border-bottom: 1px solid #263134;\n  cursor: pointer;\n}\n.pcui-menu-item-content:hover {\n  color: #fff;\n  background-color: #5b7073;\n}\n.pcui-menu-item-content > .pcui-label {\n  transition: none;\n}\n\n.pcui-menu-item:last-child > .pcui-menu-item-content {\n  border-bottom: none;\n}\n\n.pcui-menu-item-content > .pcui-label {\n  color: inherit;\n}\n.pcui-menu-item-content > .pcui-label[data-icon]::before {\n  content: attr(data-icon);\n  font-weight: 100;\n  font-size: inherit;\n  margin-right: 6px;\n  vertical-align: middle;\n}\n\n.pcui-menu-item.pcui-disabled .pcui-menu-item-content {\n  cursor: default;\n}\n.pcui-menu-item.pcui-disabled .pcui-menu-item-content:hover {\n  color: #9ba1a3;\n  background-color: transparent;\n}\n.pcui-menu-item.pcui-disabled .pcui-menu-item-content > .pcui-label {\n  cursor: default;\n  opacity: 0.4;\n}\n\n.pcui-radio-button {\n  display: inline-block;\n  position: relative;\n  background-color: #293538;\n  color: #fff;\n  width: 17px;\n  height: 17px;\n  border-radius: 50%;\n  overflow: hidden;\n  margin: 6px;\n  transition: opacity 100ms, background-color 100ms, box-shadow 100ms;\n}\n.pcui-radio-button::before {\n  content: \"\";\n  position: absolute;\n  display: block;\n  left: 50%;\n  top: 50%;\n  width: 16px;\n  min-width: 16px;\n  height: 16px;\n  transform: translate(-50%, -50%);\n  border-radius: 50%;\n  background-color: #293538;\n}\n.pcui-radio-button::after {\n  position: absolute;\n  left: 50%;\n  top: 50%;\n  width: 11px;\n  min-width: 11px;\n  height: 11px;\n  transform: translate(-50%, -50%);\n  border-radius: 50%;\n  background-color: white;\n}\n\n.pcui-radio-button-selected::before {\n  width: 16px;\n  min-width: 16px;\n  height: 16px;\n  box-sizing: border-box;\n  border: 1px solid white;\n}\n.pcui-radio-button-selected::after {\n  content: \"\";\n  display: block;\n}\n\n.pcui-radio-button.pcui-readonly {\n  opacity: 0.7;\n}\n\n.pcui-radio-button.pcui-disabled {\n  opacity: 0.4;\n}\n\n.pcui-radio-button:not(.pcui-disabled, .pcui-readonly):hover {\n  cursor: pointer;\n}\n.pcui-radio-button:not(.pcui-disabled, .pcui-readonly):hover::before {\n  background-color: #20292b;\n}\n\n.pcui-array-input {\n  margin: 6px;\n  min-width: 0;\n}\n.pcui-array-input > .pcui-numeric-input {\n  margin: 0 0 6px 0;\n}\n\n.pcui-array-input.pcui-array-empty > .pcui-numeric-input {\n  margin: 0;\n}\n\n.pcui-array-input-item > * {\n  margin-top: 1px;\n  margin-bottom: 1px;\n}\n.pcui-array-input-item > *:first-child:not(.pcui-not-flexible, .pcui-panel-header) {\n  flex: 1;\n}\n.pcui-array-input-item > .pcui-button {\n  margin-left: -3px;\n  margin-right: 0;\n  background-color: transparent;\n  border: 0;\n}\n\n.pcui-array-input-item-asset > .pcui-button {\n  margin-top: 36px;\n}\n\n.pcui-array-input.pcui-readonly .pcui-array-input-item-delete {\n  display: none;\n}");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HierarchyPanel: () => (/* reexport safe */ _tools_hierarchy_hierarchy_panel__WEBPACK_IMPORTED_MODULE_2__.HierarchyPanel),
/* harmony export */   InspectorPanel: () => (/* reexport safe */ _tools_inspector_inspector_panel__WEBPACK_IMPORTED_MODULE_3__.InspectorPanel),
/* harmony export */   Layout: () => (/* reexport safe */ _tools_layout__WEBPACK_IMPORTED_MODULE_4__.Layout),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _playcanvas_pcui_styles__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @playcanvas/pcui/styles */ "./node_modules/@playcanvas/pcui/styles/dist/index.mjs");
/* harmony import */ var _namespace__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./namespace */ "./src/namespace.ts");
/* harmony import */ var _tools_hierarchy_hierarchy_panel__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./tools/hierarchy/hierarchy-panel */ "./src/tools/hierarchy/hierarchy-panel.ts");
/* harmony import */ var _tools_inspector_inspector_panel__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./tools/inspector/inspector-panel */ "./src/tools/inspector/inspector-panel.ts");
/* harmony import */ var _tools_layout__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./tools/layout */ "./src/tools/layout.ts");





Object.assign(_namespace__WEBPACK_IMPORTED_MODULE_1__["default"], {
    HierarchyPanel: _tools_hierarchy_hierarchy_panel__WEBPACK_IMPORTED_MODULE_2__.HierarchyPanel,
    InspectorPanel: _tools_inspector_inspector_panel__WEBPACK_IMPORTED_MODULE_3__.InspectorPanel,
    Layout: _tools_layout__WEBPACK_IMPORTED_MODULE_4__.Layout,
    layout: window && window.pc ? new _tools_layout__WEBPACK_IMPORTED_MODULE_4__.Layout() : undefined // runtime only
});

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_namespace__WEBPACK_IMPORTED_MODULE_1__["default"]);

})();

/******/ })()
;