(function () {
    var BDraggablePrototype = Object.create(HTMLElement.prototype, {
            axis: {
                enumerable: true,
                get: function () {
                    return this.hasAttribute('axis') ? this.getAttribute('axis') : null;
                }
            },
            handle: {
                enumerable: true,
                get: function () {
                    return this.hasAttribute('handle') ? this.querySelector(this.getAttribute('handle')) : this;
                }
            },
            verticallyConstrained: {
                enumerable: true,
                get: function () {
                    return this.axis === 'x';
                }
            },
            horizontallyConstrained: {
                enumerable: true,
                get: function () {
                    return this.axis === 'y';
                }
            },
            createdCallback: {
                enumerable: true,
                value: function () {
                    this.startListener = this.start.bind(this);
                    this.handle.addEventListener('mousedown', this.startListener, false);
                }
            },
            detachedCallback: {
                enumerable: true,
                value: function () {
                    this.handle.removeEventListener('mousedown', this.startListener, false);
                }
            },
            start: {
                enumerable: true,
                value: function (e) {
                    e.preventDefault();
                    this.refreshPreviousPosition(e);
                    this.moveListener = this.move.bind(this);
                    this.stopListener = this.stop.bind(this);
                    document.addEventListener('mousemove', this.moveListener, false);
                    document.addEventListener('mouseup', this.stopListener, false);
                }
            },
            move: {
                enumerable: true,
                value: function (e) {
                    var diff = this.getPositionDiff(e);
                    if (!this.horizontallyConstrained)
                        this.updatePosition('left', diff.x);
                    if (!this.verticallyConstrained)
                        this.updatePosition('top', diff.y);
                    this.refreshPreviousPosition(e);
                }
            },
            stop: {
                enumerable: true,
                value: function (e) {
                    document.removeEventListener('mousemove', this.moveListener, false);
                    document.removeEventListener('mouseup', this.stopListener, false);
                }
            },
            refreshPreviousPosition: {
                enumerable: true,
                value: function (e) {
                    this.previousPosition = {
                        x: e.pageX,
                        y: e.pageY
                    };
                }
            },
            getPositionDiff: {
                enumerable: true,
                value: function (e) {
                    var x = e.pageX, y = e.pageY, xdiff = x - this.previousPosition.x, ydiff = y - this.previousPosition.y;
                    return {
                        x: xdiff,
                        y: ydiff
                    };
                }
            },
            getPosition: {
                enumerable: true,
                value: function (side) {
                    var position = this.style[side];
                    return position ? parseInt(position.replace('px', '')) : 0;
                }
            },
            setPosition: {
                enumerable: true,
                value: function (side, value) {
                    this.style[side] = value + 'px';
                }
            },
            updatePosition: {
                enumerable: true,
                value: function (side, diff) {
                    var currentPos = this.getPosition(side);
                    this.setPosition(side, currentPos + diff);
                }
            }
        });
    window.BDraggable = document.registerElement('b-draggable', { prototype: BDraggablePrototype });
}());