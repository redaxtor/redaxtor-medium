import MediumEditor from 'medium-editor/dist/js/medium-editor.js';
require('./extensions/undoButton');
require('./extensions/saveButton');
require('./extensions/sourceButton');
require('./extensions/imageInsertButton');


MediumEditor.extensions.toolbar.prototype.positionStaticToolbar = function (container) {
    // position the toolbar at left 0, so we can get the real width of the toolbar
    this.getToolbarElement().style.left = '0';

    // document.documentElement for IE 9
    var scrollTop = (this.document.documentElement && this.document.documentElement.scrollTop) || this.document.body.scrollTop,
        windowWidth = this.window.innerWidth,
        toolbarElement = this.getToolbarElement(),
        containerRect = container.getBoundingClientRect(),
        containerTop = containerRect.top + scrollTop,
        containerCenter = (containerRect.left + (containerRect.width / 2)),
        toolbarHeight = toolbarElement.offsetHeight,
        toolbarWidth = toolbarElement.offsetWidth,
        halfOffsetWidth = toolbarWidth / 2,
        targetLeft;

    if (this.sticky) {
        // If it's beyond the height of the editor, position it at the bottom of the editor
        if (scrollTop > (containerTop + container.offsetHeight - toolbarHeight - this.stickyTopOffset)) {
            toolbarElement.style.top = (containerTop + container.offsetHeight - toolbarHeight) > 0 ? (containerTop + container.offsetHeight - toolbarHeight) : scrollTop + 'px';
            toolbarElement.classList.remove('medium-editor-sticky-toolbar');
            // Stick the toolbar to the top of the window
        } else if (scrollTop > (containerTop - toolbarHeight - this.stickyTopOffset)) {
            toolbarElement.classList.add('medium-editor-sticky-toolbar');
            toolbarElement.style.top = this.stickyTopOffset + 'px';
            // Normal static toolbar position
        } else {
            toolbarElement.classList.remove('medium-editor-sticky-toolbar');
            toolbarElement.style.top = containerTop - toolbarHeight + 'px';
        }
    } else {
        toolbarElement.style.top = containerTop - toolbarHeight + 'px';
    }

    switch (this.align) {
        case 'left':
            targetLeft = containerRect.left;
            break;

        case 'right':
            targetLeft = containerRect.right - toolbarWidth;
            break;

        case 'center':
            targetLeft = containerCenter - halfOffsetWidth;
            break;
    }

    if (targetLeft < 0) {
        targetLeft = 0;
    } else if ((targetLeft + toolbarWidth) > windowWidth) {
        targetLeft = (windowWidth - Math.ceil(toolbarWidth) - 1);
    }

    toolbarElement.style.left = targetLeft + 'px';
};

export default MediumEditor