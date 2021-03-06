(function () {
    function getComputedDimensions(node) {
        var c = window.getComputedStyle(node), p = function (v) {
                return parseInt(v.replace('px', ''));
            };
        var width = p(c.width), height = p(c.height), mLeft = p(c.marginLeft), mRight = p(c.marginRight), mTop = p(c.marginTop), mBottom = p(c.marginBottom), pLeft = p(c.paddingLeft), pRight = p(c.paddingRight), pTop = p(c.paddingTop), pBottom = p(c.paddingBottom), bLeft = p(c.borderLeftWidth), bRight = p(c.borderRightWidth), bTop = p(c.borderTopWidth), bBottom = p(c.borderBottomWidth), offsetWidth = width + pLeft + pRight + bLeft + bRight, offsetHeight = height + pTop + pBottom + bTop + bBottom;
        return {
            offsetWidth: offsetWidth,
            offsetHeight: offsetHeight,
            borderLeftWidth: bLeft,
            borderRightWidth: bRight,
            borderTopWidth: bTop,
            borderBottomWidth: bBottom,
            paddingLeft: pLeft,
            paddingRight: pRight,
            paddingTop: pTop,
            paddingBottom: pBottom,
            outerWidth: offsetWidth + mLeft + mRight,
            outerHeight: offsetHeight + mTop + mBottom
        };
    }
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
            target: {
                enumerable: true,
                get: function () {
                    if (!this._target) {
                        this._target = this.hasAttribute('target') ? this.querySelector(this.getAttribute('target')) : this;
                    }
                    return this._target;
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
            contained: {
                enumerable: true,
                get: function () {
                    return this.hasAttribute('containment');
                }
            },
            containment: {
                enumerable: true,
                get: function () {
                    if (!this.contained)
                        return null;
                    var attr = this.getAttribute('containment');
                    return attr === 'parent' ? this.parentElement : this.querySelector(attr);
                }
            },
            createdCallback: {
                enumerable: true,
                value: function () {
                    if (this.contained) {
                        var contain = getComputedDimensions(this.containment), target = getComputedDimensions(this.target);
                        this.constraints = {
                            left: {
                                min: contain.borderLeftWidth + contain.paddingLeft,
                                max: contain.offsetWidth - contain.borderRightWidth - contain.paddingRight - target.outerWidth
                            },
                            top: {
                                min: contain.borderTopWidth + contain.paddingTop,
                                max: contain.offsetHeight - contain.borderBottomWidth - contain.paddingBottom - target.outerHeight
                            }
                        };
                    }
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
                    var targetPositioning = window.getComputedStyle(this.target).position;
                    if (!targetPositioning.match(/^(?:r|a|f)/)) {
                        this.target.style.position = 'relative';
                    }
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
                    var position = window.getComputedStyle(this.target)[side];
                    return position !== 'auto' ? parseInt(position.replace('px', '')) : 0;
                }
            },
            setPosition: {
                enumerable: true,
                value: function (side, value) {
                    this.target.style[side] = value + 'px';
                }
            },
            updatePosition: {
                enumerable: true,
                value: function (side, diff) {
                    var currentPos = this.getPosition(side), newPos = currentPos + diff;
                    if (!this.contained || newPos >= this.constraints[side].min && newPos <= this.constraints[side].max) {
                        this.setPosition(side, currentPos + diff);
                    }
                }
            }
        });
    window.BDraggable = document.registerElement('b-draggable', { prototype: BDraggablePrototype });
}());