'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _Items = require('./items/Items');

var _Items2 = _interopRequireDefault(_Items);

var _InfoLabel = require('./layout/InfoLabel');

var _InfoLabel2 = _interopRequireDefault(_InfoLabel);

var _Sidebar = require('./layout/Sidebar');

var _Sidebar2 = _interopRequireDefault(_Sidebar);

var _Header = require('./layout/Header');

var _Header2 = _interopRequireDefault(_Header);

var _Columns = require('./columns/Columns');

var _Columns2 = _interopRequireDefault(_Columns);

var _GroupRows = require('./row/GroupRows');

var _GroupRows2 = _interopRequireDefault(_GroupRows);

var _ScrollElement = require('./scroll/ScrollElement');

var _ScrollElement2 = _interopRequireDefault(_ScrollElement);

var _MarkerCanvas = require('./markers/MarkerCanvas');

var _MarkerCanvas2 = _interopRequireDefault(_MarkerCanvas);

var _window = require('../resize-detector/window');

var _window2 = _interopRequireDefault(_window);

var _calendar = require('./utility/calendar');

var _generic = require('./utility/generic');

var _defaultConfig = require('./default-config');

var _TimelineStateContext = require('./timeline/TimelineStateContext');

var _TimelineMarkersContext = require('./markers/TimelineMarkersContext');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ReactCalendarTimeline = function (_Component) {
  _inherits(ReactCalendarTimeline, _Component);

  _createClass(ReactCalendarTimeline, [{
    key: 'getChildContext',
    value: function getChildContext() {
      var _this2 = this;

      return {
        getTimelineContext: function getTimelineContext() {
          return _this2.getTimelineContext();
        }
      };
    }
  }]);

  function ReactCalendarTimeline(props) {
    _classCallCheck(this, ReactCalendarTimeline);

    var _this = _possibleConstructorReturn(this, (ReactCalendarTimeline.__proto__ || Object.getPrototypeOf(ReactCalendarTimeline)).call(this, props));

    _initialiseProps.call(_this);

    var visibleTimeStart = null;
    var visibleTimeEnd = null;

    if (_this.props.defaultTimeStart && _this.props.defaultTimeEnd) {
      visibleTimeStart = _this.props.defaultTimeStart.valueOf();
      visibleTimeEnd = _this.props.defaultTimeEnd.valueOf();
    } else if (_this.props.visibleTimeStart && _this.props.visibleTimeEnd) {
      visibleTimeStart = _this.props.visibleTimeStart;
      visibleTimeEnd = _this.props.visibleTimeEnd;
    } else {
      //throwing an error because neither default or visible time props provided
      throw new Error('You must provide either "defaultTimeStart" and "defaultTimeEnd" or "visibleTimeStart" and "visibleTimeEnd" to initialize the Timeline');
    }

    _this.state = {
      width: 1000,

      visibleTimeStart: visibleTimeStart,
      visibleTimeEnd: visibleTimeEnd,
      canvasTimeStart: visibleTimeStart - (visibleTimeEnd - visibleTimeStart),

      selectedItem: null,
      dragTime: null,
      dragGroupTitle: null,
      resizeTime: null,
      topOffset: 0,
      resizingItem: null,
      resizingEdge: null
    };

    var _this$stackItems = _this.stackItems(props.items, props.groups, _this.state.canvasTimeStart, _this.state.visibleTimeStart, _this.state.visibleTimeEnd, _this.state.width),
        dimensionItems = _this$stackItems.dimensionItems,
        height = _this$stackItems.height,
        groupHeights = _this$stackItems.groupHeights,
        groupTops = _this$stackItems.groupTops;

    /* eslint-disable react/no-direct-mutation-state */


    _this.state.dimensionItems = dimensionItems;
    _this.state.height = height;
    _this.state.groupHeights = groupHeights;
    _this.state.groupTops = groupTops;

    /* eslint-enable */
    return _this;
  }

  _createClass(ReactCalendarTimeline, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.resize(this.props);

      if (this.props.resizeDetector && this.props.resizeDetector.addListener) {
        this.props.resizeDetector.addListener(this);
      }

      _window2.default.addListener(this);

      this.lastTouchDistance = null;
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this.props.resizeDetector && this.props.resizeDetector.addListener) {
        this.props.resizeDetector.removeListener(this);
      }

      _window2.default.removeListener(this);
    }

    // FIXME: this function calls set state EVERY TIME YOU SCROLL

  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var visibleTimeStart = nextProps.visibleTimeStart,
          visibleTimeEnd = nextProps.visibleTimeEnd,
          items = nextProps.items,
          groups = nextProps.groups,
          sidebarWidth = nextProps.sidebarWidth;


      if (visibleTimeStart && visibleTimeEnd) {
        this.updateScrollCanvas(visibleTimeStart, visibleTimeEnd, items !== this.props.items || groups !== this.props.groups, items, groups);
      } else if (items !== this.props.items || groups !== this.props.groups) {
        this.updateDimensions(items, groups);
      }

      // resize if the sidebar width changed
      if (sidebarWidth !== this.props.sidebarWidth && items && groups) {
        this.resize(nextProps);
      }
    }
  }, {
    key: 'updateDimensions',
    value: function updateDimensions(items, groups) {
      var _state = this.state,
          canvasTimeStart = _state.canvasTimeStart,
          visibleTimeStart = _state.visibleTimeStart,
          visibleTimeEnd = _state.visibleTimeEnd,
          width = _state.width;

      var _stackItems = this.stackItems(items, groups, canvasTimeStart, visibleTimeStart, visibleTimeEnd, width),
          dimensionItems = _stackItems.dimensionItems,
          height = _stackItems.height,
          groupHeights = _stackItems.groupHeights,
          groupTops = _stackItems.groupTops;

      this.setState({ dimensionItems: dimensionItems, height: height, groupHeights: groupHeights, groupTops: groupTops });
    }

    // called when the visible time changes


    // TODO: this is very similar to timeFromItemEvent, aside from which element to get offsets
    // from.  Look to consolidate the logic for determining coordinate to time
    // as well as generalizing how we get time from click on the canvas

  }, {
    key: 'columns',
    value: function columns(canvasTimeStart, canvasTimeEnd, canvasWidth, minUnit, timeSteps, height) {
      return _react2.default.createElement(_Columns2.default, {
        canvasTimeStart: canvasTimeStart,
        canvasTimeEnd: canvasTimeEnd,
        canvasWidth: canvasWidth,
        lineCount: (0, _generic._length)(this.props.groups),
        minUnit: minUnit,
        timeSteps: timeSteps,
        height: height,
        verticalLineClassNamesForTime: this.props.verticalLineClassNamesForTime
      });
    }
  }, {
    key: 'rows',
    value: function rows(canvasWidth, groupHeights, groups) {
      return _react2.default.createElement(_GroupRows2.default, {
        groups: groups,
        canvasWidth: canvasWidth,
        lineCount: (0, _generic._length)(this.props.groups),
        groupHeights: groupHeights,
        clickTolerance: this.props.clickTolerance,
        onRowClick: this.handleRowClick,
        onRowDoubleClick: this.handleRowDoubleClick,
        horizontalLineClassNamesForGroup: this.props.horizontalLineClassNamesForGroup,
        onRowContextClick: this.handleScrollContextMenu
      });
    }
  }, {
    key: 'items',
    value: function items(canvasTimeStart, zoom, canvasTimeEnd, canvasWidth, minUnit, dimensionItems, groupHeights, groupTops) {
      return _react2.default.createElement(_Items2.default, {
        canvasTimeStart: canvasTimeStart,
        canvasTimeEnd: canvasTimeEnd,
        canvasWidth: canvasWidth,
        dimensionItems: dimensionItems,
        groupTops: groupTops,
        items: this.props.items,
        groups: this.props.groups,
        keys: this.props.keys,
        selectedItem: this.state.selectedItem,
        dragSnap: this.props.dragSnap,
        minResizeWidth: this.props.minResizeWidth,
        canChangeGroup: this.props.canChangeGroup,
        canMove: this.props.canMove,
        canResize: this.props.canResize,
        useResizeHandle: this.props.useResizeHandle,
        canSelect: this.props.canSelect,
        moveResizeValidator: this.props.moveResizeValidator,
        topOffset: this.state.topOffset,
        itemSelect: this.selectItem,
        itemDrag: this.dragItem,
        itemDrop: this.dropItem,
        onItemDoubleClick: this.doubleClickItem,
        onItemContextMenu: this.contextMenuClickItem,
        itemResizing: this.resizingItem,
        itemResized: this.resizedItem,
        itemRenderer: this.props.itemRenderer,
        selected: this.props.selected
      });
    }
  }, {
    key: 'infoLabel',
    value: function infoLabel() {
      var label = null;

      if (this.state.dragTime) {
        label = (0, _moment2.default)(this.state.dragTime).format('LLL') + ', ' + this.state.dragGroupTitle;
      } else if (this.state.resizeTime) {
        label = (0, _moment2.default)(this.state.resizeTime).format('LLL');
      }

      return label ? _react2.default.createElement(_InfoLabel2.default, { label: label }) : '';
    }
  }, {
    key: 'header',
    value: function header(canvasTimeStart, canvasTimeEnd, canvasWidth, minUnit, timeSteps, headerLabelGroupHeight, headerLabelHeight) {
      var _props = this.props,
          sidebarWidth = _props.sidebarWidth,
          rightSidebarWidth = _props.rightSidebarWidth;

      var leftSidebar = sidebarWidth != null && sidebarWidth > 0 && _react2.default.createElement(
        'div',
        {
          className: 'rct-sidebar-header',
          style: { width: this.props.sidebarWidth + 'vw' }
        },
        this.props.sidebarContent
      );

      var rightSidebar = rightSidebarWidth != null && rightSidebarWidth > 0 && _react2.default.createElement(
        'div',
        {
          className: 'rct-sidebar-header rct-sidebar-right',
          style: { width: this.props.rightSidebarWidth + 'vw' }
        },
        this.props.rightSidebarContent
      );

      return _react2.default.createElement(_Header2.default, {
        canvasTimeStart: canvasTimeStart,
        hasRightSidebar: this.props.rightSidebarWidth > 0,
        canvasTimeEnd: canvasTimeEnd,
        canvasWidth: canvasWidth,
        minUnit: minUnit,
        timeSteps: timeSteps,
        headerLabelGroupHeight: headerLabelGroupHeight,
        headerLabelHeight: headerLabelHeight,
        width: this.state.width,
        stickyOffset: this.props.stickyOffset,
        stickyHeader: this.props.stickyHeader,
        showPeriod: this.showPeriod,
        headerLabelFormats: this.props.headerLabelFormats,
        subHeaderLabelFormats: this.props.subHeaderLabelFormats,
        registerScroll: this.registerScrollListener,
        leftSidebarHeader: leftSidebar,
        rightSidebarHeader: rightSidebar,
        headerRef: this.props.headerRef,
        timelineWidthVw: this.props.timelineWidthVw
      });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this.headerScrollListener(this.state.currentScrollLeft);
    }
  }, {
    key: 'sidebar',
    value: function sidebar(height, groupHeights) {
      var sidebarWidth = this.props.sidebarWidth;

      return sidebarWidth != null && sidebarWidth > 0 && _react2.default.createElement(_Sidebar2.default, {
        groups: this.props.groups,
        groupRenderer: this.props.groupRenderer,
        keys: this.props.keys,
        width: this.props.sidebarWidth,
        groupHeights: groupHeights,
        height: height
      });
    }
  }, {
    key: 'rightSidebar',
    value: function rightSidebar(height, groupHeights) {
      var rightSidebarWidth = this.props.rightSidebarWidth;


      return rightSidebarWidth != null && rightSidebarWidth > 0 && _react2.default.createElement(_Sidebar2.default, {
        groups: this.props.groups,
        keys: this.props.keys,
        groupRenderer: this.props.groupRenderer,
        isRightSidebar: true,
        width: this.props.rightSidebarWidth,
        groupHeights: groupHeights,
        height: height
      });
    }
  }, {
    key: 'stackItems',
    value: function stackItems(items, groups, canvasTimeStart, visibleTimeStart, visibleTimeEnd, width) {
      // if there are no groups return an empty array of dimensions
      if (groups.length === 0) {
        return {
          dimensionItems: [],
          height: 0,
          groupHeights: [],
          groupTops: []
        };
      }

      var _props2 = this.props,
          keys = _props2.keys,
          lineHeight = _props2.lineHeight,
          stackItems = _props2.stackItems,
          itemHeightRatio = _props2.itemHeightRatio;
      var _state2 = this.state,
          draggingItem = _state2.draggingItem,
          dragTime = _state2.dragTime,
          resizingItem = _state2.resizingItem,
          resizingEdge = _state2.resizingEdge,
          resizeTime = _state2.resizeTime,
          newGroupOrder = _state2.newGroupOrder;

      var zoom = visibleTimeEnd - visibleTimeStart;
      var canvasTimeEnd = canvasTimeStart + zoom * 3;
      var canvasWidth = width * 3;

      var visibleItems = (0, _calendar.getVisibleItems)(items, canvasTimeStart, canvasTimeEnd, keys);
      var groupOrders = (0, _calendar.getGroupOrders)(groups, keys);

      var dimensionItems = visibleItems.reduce(function (memo, item) {
        var itemId = (0, _generic._get)(item, keys.itemIdKey);
        var isDragging = itemId === draggingItem;
        var isResizing = itemId === resizingItem;

        var dimension = (0, _calendar.calculateDimensions)({
          itemTimeStart: (0, _generic._get)(item, keys.itemTimeStartKey),
          itemTimeEnd: (0, _generic._get)(item, keys.itemTimeEndKey),
          isDragging: isDragging,
          isResizing: isResizing,
          canvasTimeStart: canvasTimeStart,
          canvasTimeEnd: canvasTimeEnd,
          canvasWidth: canvasWidth,
          dragTime: dragTime,
          resizingEdge: resizingEdge,
          resizeTime: resizeTime
        });

        if (dimension) {
          dimension.top = null;
          dimension.order = isDragging ? newGroupOrder : groupOrders[(0, _generic._get)(item, keys.itemGroupKey)];
          dimension.stack = !item.isOverlay;
          dimension.height = lineHeight * itemHeightRatio;
          dimension.isDragging = isDragging;

          memo.push({
            id: itemId,
            dimensions: dimension
          });
        }

        return memo;
      }, []);

      var stackingMethod = stackItems ? _calendar.stack : _calendar.nostack;

      var _stackingMethod = stackingMethod(dimensionItems, groupOrders, lineHeight, groups),
          height = _stackingMethod.height,
          groupHeights = _stackingMethod.groupHeights,
          groupTops = _stackingMethod.groupTops;

      return { dimensionItems: dimensionItems, height: height, groupHeights: groupHeights, groupTops: groupTops };
    }
  }, {
    key: 'childrenWithProps',
    value: function childrenWithProps(canvasTimeStart, canvasTimeEnd, canvasWidth, dimensionItems, groupHeights, groupTops, height, headerHeight, visibleTimeStart, visibleTimeEnd, minUnit, timeSteps) {
      if (!this.props.children) {
        return null;
      }

      // convert to an array and remove the nulls
      var childArray = Array.isArray(this.props.children) ? this.props.children.filter(function (c) {
        return c;
      }) : [this.props.children];

      var childProps = {
        canvasTimeStart: canvasTimeStart,
        canvasTimeEnd: canvasTimeEnd,
        canvasWidth: canvasWidth,
        visibleTimeStart: visibleTimeStart,
        visibleTimeEnd: visibleTimeEnd,
        dimensionItems: dimensionItems,
        items: this.props.items,
        groups: this.props.groups,
        keys: this.props.keys,
        groupHeights: groupHeights,
        groupTops: groupTops,
        selected: this.state.selectedItem && !this.props.selected ? [this.state.selectedItem] : this.props.selected || [],
        height: height,
        headerHeight: headerHeight,
        minUnit: minUnit,
        timeSteps: timeSteps
      };

      return _react2.default.Children.map(childArray, function (child) {
        return _react2.default.cloneElement(child, childProps);
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      var _props3 = this.props,
          items = _props3.items,
          groups = _props3.groups,
          headerLabelGroupHeight = _props3.headerLabelGroupHeight,
          headerLabelHeight = _props3.headerLabelHeight,
          sidebarWidth = _props3.sidebarWidth,
          rightSidebarWidth = _props3.rightSidebarWidth,
          timeSteps = _props3.timeSteps,
          traditionalZoom = _props3.traditionalZoom;
      var _state3 = this.state,
          draggingItem = _state3.draggingItem,
          resizingItem = _state3.resizingItem,
          width = _state3.width,
          visibleTimeStart = _state3.visibleTimeStart,
          visibleTimeEnd = _state3.visibleTimeEnd,
          canvasTimeStart = _state3.canvasTimeStart;
      var _state4 = this.state,
          dimensionItems = _state4.dimensionItems,
          height = _state4.height,
          groupHeights = _state4.groupHeights,
          groupTops = _state4.groupTops;


      var zoom = visibleTimeEnd - visibleTimeStart;
      var canvasTimeEnd = canvasTimeStart + zoom * 3;
      var canvasWidth = width * 3;
      var minUnit = (0, _calendar.getMinUnit)(zoom, width, timeSteps);
      var headerHeight = headerLabelGroupHeight + headerLabelHeight;

      var isInteractingWithItem = !!draggingItem || !!resizingItem;

      if (isInteractingWithItem) {
        var stackResults = this.stackItems(items, groups, canvasTimeStart, visibleTimeStart, visibleTimeEnd, width);
        dimensionItems = stackResults.dimensionItems;
        height = stackResults.height;
        groupHeights = stackResults.groupHeights;
        groupTops = stackResults.groupTops;
      }

      var outerComponentStyle = {
        height: height + 'px'
      };

      return _react2.default.createElement(
        _TimelineStateContext.TimelineStateProvider,
        {
          visibleTimeStart: visibleTimeStart,
          visibleTimeEnd: visibleTimeEnd,
          canvasTimeStart: canvasTimeStart,
          canvasTimeEnd: canvasTimeEnd,
          canvasWidth: canvasWidth
        },
        _react2.default.createElement(
          _TimelineMarkersContext.TimelineMarkersProvider,
          null,
          _react2.default.createElement(
            'div',
            {
              style: this.props.style,
              ref: function ref(el) {
                return _this3.container = el;
              },
              className: 'react-calendar-timeline'
            },
            this.header(canvasTimeStart, canvasTimeEnd, canvasWidth, minUnit, timeSteps, headerLabelGroupHeight, headerLabelHeight),
            _react2.default.createElement(
              'div',
              { style: outerComponentStyle, className: 'rct-outer' },
              sidebarWidth > 0 ? this.sidebar(height, groupHeights) : null,
              _react2.default.createElement(
                _ScrollElement2.default,
                {
                  scrollRef: function scrollRef(el) {
                    _this3.props.scrollRef(el);
                    _this3.scrollComponent = el;
                  },
                  width: width,
                  height: height,
                  onZoom: this.changeZoom,
                  onWheelZoom: this.handleWheelZoom,
                  traditionalZoom: traditionalZoom,
                  onScroll: this.onScroll,
                  isInteractingWithItem: isInteractingWithItem
                },
                _react2.default.createElement(
                  _MarkerCanvas2.default,
                  null,
                  this.items(canvasTimeStart, zoom, canvasTimeEnd, canvasWidth, minUnit, dimensionItems, groupHeights, groupTops),
                  this.columns(canvasTimeStart, canvasTimeEnd, canvasWidth, minUnit, timeSteps, height, headerHeight),
                  this.rows(canvasWidth, groupHeights, groups),
                  this.infoLabel(),
                  this.childrenWithProps(canvasTimeStart, canvasTimeEnd, canvasWidth, dimensionItems, groupHeights, groupTops, height, headerHeight, visibleTimeStart, visibleTimeEnd, minUnit, timeSteps)
                )
              ),
              rightSidebarWidth > 0 ? this.rightSidebar(height, groupHeights) : null
            )
          )
        )
      );
    }
  }]);

  return ReactCalendarTimeline;
}(_react.Component);

ReactCalendarTimeline.propTypes = {
  groups: _propTypes2.default.oneOfType([_propTypes2.default.array, _propTypes2.default.object]).isRequired,
  items: _propTypes2.default.oneOfType([_propTypes2.default.array, _propTypes2.default.object]).isRequired,
  sidebarWidth: _propTypes2.default.number,
  sidebarContent: _propTypes2.default.node,
  rightSidebarWidth: _propTypes2.default.number,
  rightSidebarContent: _propTypes2.default.node,
  dragSnap: _propTypes2.default.number,
  minResizeWidth: _propTypes2.default.number,
  stickyOffset: _propTypes2.default.number,
  stickyHeader: _propTypes2.default.bool,
  lineHeight: _propTypes2.default.number,
  headerLabelGroupHeight: _propTypes2.default.number,
  headerLabelHeight: _propTypes2.default.number,
  itemHeightRatio: _propTypes2.default.number,
  timelineWidthVw: _propTypes2.default.number,

  minZoom: _propTypes2.default.number,
  maxZoom: _propTypes2.default.number,

  clickTolerance: _propTypes2.default.number,

  canChangeGroup: _propTypes2.default.bool,
  canMove: _propTypes2.default.bool,
  canResize: _propTypes2.default.oneOf([true, false, 'left', 'right', 'both']),
  useResizeHandle: _propTypes2.default.bool,
  canSelect: _propTypes2.default.bool,

  stackItems: _propTypes2.default.bool,

  traditionalZoom: _propTypes2.default.bool,

  itemTouchSendsClick: _propTypes2.default.bool,

  horizontalLineClassNamesForGroup: _propTypes2.default.func,

  onItemMove: _propTypes2.default.func,
  onItemResize: _propTypes2.default.func,
  onItemClick: _propTypes2.default.func,
  onItemSelect: _propTypes2.default.func,
  onItemDeselect: _propTypes2.default.func,
  onCanvasClick: _propTypes2.default.func,
  onItemDoubleClick: _propTypes2.default.func,
  onItemContextMenu: _propTypes2.default.func,
  onCanvasDoubleClick: _propTypes2.default.func,
  onCanvasContextMenu: _propTypes2.default.func,
  onZoom: _propTypes2.default.func,

  moveResizeValidator: _propTypes2.default.func,

  itemRenderer: _propTypes2.default.func,
  groupRenderer: _propTypes2.default.func,

  style: _propTypes2.default.object,

  keys: _propTypes2.default.shape({
    groupIdKey: _propTypes2.default.string,
    groupTitleKey: _propTypes2.default.string,
    groupRightTitleKey: _propTypes2.default.string,
    itemIdKey: _propTypes2.default.string,
    itemTitleKey: _propTypes2.default.string,
    itemDivTitleKey: _propTypes2.default.string,
    itemGroupKey: _propTypes2.default.string,
    itemTimeStartKey: _propTypes2.default.string,
    itemTimeEndKey: _propTypes2.default.string
  }),
  headerRef: _propTypes2.default.func,
  scrollRef: _propTypes2.default.func,

  timeSteps: _propTypes2.default.shape({
    second: _propTypes2.default.number,
    minute: _propTypes2.default.number,
    hour: _propTypes2.default.number,
    day: _propTypes2.default.number,
    month: _propTypes2.default.number,
    year: _propTypes2.default.number
  }),

  defaultTimeStart: _propTypes2.default.object,
  defaultTimeEnd: _propTypes2.default.object,

  visibleTimeStart: _propTypes2.default.number,
  visibleTimeEnd: _propTypes2.default.number,
  onTimeChange: _propTypes2.default.func,
  onBoundsChange: _propTypes2.default.func,

  selected: _propTypes2.default.array,

  headerLabelFormats: _propTypes2.default.shape({
    yearShort: _propTypes2.default.string,
    yearLong: _propTypes2.default.string,
    monthShort: _propTypes2.default.string,
    monthMedium: _propTypes2.default.string,
    monthMediumLong: _propTypes2.default.string,
    monthLong: _propTypes2.default.string,
    dayShort: _propTypes2.default.string,
    dayLong: _propTypes2.default.string,
    hourShort: _propTypes2.default.string,
    hourMedium: _propTypes2.default.string,
    hourMediumLong: _propTypes2.default.string,
    hourLong: _propTypes2.default.string
  }),

  subHeaderLabelFormats: _propTypes2.default.shape({
    yearShort: _propTypes2.default.string,
    yearLong: _propTypes2.default.string,
    monthShort: _propTypes2.default.string,
    monthMedium: _propTypes2.default.string,
    monthLong: _propTypes2.default.string,
    dayShort: _propTypes2.default.string,
    dayMedium: _propTypes2.default.string,
    dayMediumLong: _propTypes2.default.string,
    dayLong: _propTypes2.default.string,
    hourShort: _propTypes2.default.string,
    hourLong: _propTypes2.default.string,
    minuteShort: _propTypes2.default.string,
    minuteLong: _propTypes2.default.string
  }),

  resizeDetector: _propTypes2.default.shape({
    addListener: _propTypes2.default.func,
    removeListener: _propTypes2.default.func
  }),

  verticalLineClassNamesForTime: _propTypes2.default.func,

  children: _propTypes2.default.node
};
ReactCalendarTimeline.defaultProps = {
  sidebarWidth: 20,
  rightSidebarWidth: 0,
  dragSnap: 1000 * 60 * 15, // 15min
  minResizeWidth: 20,
  stickyOffset: 0,
  stickyHeader: true,
  lineHeight: 30,
  headerLabelGroupHeight: 30,
  headerLabelHeight: 30,
  itemHeightRatio: 0.65,
  timelineWidthVw: 80,

  minZoom: 60 * 60 * 1000, // 1 hour
  maxZoom: 5 * 365.24 * 86400 * 1000, // 5 years

  clickTolerance: 3, // how many pixels can we drag for it to be still considered a click?

  canChangeGroup: true,
  canMove: true,
  canResize: 'right',
  useResizeHandle: false,
  canSelect: true,

  stackItems: false,

  traditionalZoom: false,

  horizontalLineClassNamesForGroup: null,

  onItemMove: null,
  onItemResize: null,
  onItemClick: null,
  onItemSelect: null,
  onItemDeselect: null,
  onCanvasClick: null,
  onItemDoubleClick: null,
  onItemContextMenu: null,
  onZoom: null,

  verticalLineClassNamesForTime: null,

  moveResizeValidator: null,

  dayBackground: null,

  defaultTimeStart: null,
  defaultTimeEnd: null,

  itemTouchSendsClick: false,

  style: {},
  keys: _defaultConfig.defaultKeys,
  timeSteps: _defaultConfig.defaultTimeSteps,
  headerRef: function headerRef() {},
  scrollRef: function scrollRef() {},

  // if you pass in visibleTimeStart and visibleTimeEnd, you must also pass onTimeChange(visibleTimeStart, visibleTimeEnd),
  // which needs to update the props visibleTimeStart and visibleTimeEnd to the ones passed
  visibleTimeStart: null,
  visibleTimeEnd: null,
  onTimeChange: function onTimeChange(visibleTimeStart, visibleTimeEnd, updateScrollCanvas) {
    updateScrollCanvas(visibleTimeStart, visibleTimeEnd);
  },
  // called when the canvas area of the calendar changes
  onBoundsChange: null,
  children: null,

  headerLabelFormats: _defaultConfig.defaultHeaderLabelFormats,
  subHeaderLabelFormats: _defaultConfig.defaultSubHeaderLabelFormats,

  selected: null
};
ReactCalendarTimeline.childContextTypes = {
  getTimelineContext: _propTypes2.default.func
};

var _initialiseProps = function _initialiseProps() {
  var _this4 = this;

  this.getTimelineContext = function () {
    var _state5 = _this4.state,
        width = _state5.width,
        visibleTimeStart = _state5.visibleTimeStart,
        visibleTimeEnd = _state5.visibleTimeEnd,
        canvasTimeStart = _state5.canvasTimeStart;

    var zoom = visibleTimeEnd - visibleTimeStart;
    var canvasTimeEnd = canvasTimeStart + zoom * 3;

    return {
      timelineWidth: width,
      visibleTimeStart: visibleTimeStart,
      visibleTimeEnd: visibleTimeEnd,
      canvasTimeStart: canvasTimeStart,
      canvasTimeEnd: canvasTimeEnd
    };
  };

  this.resize = function () {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this4.props;

    var _container$getBoundin = _this4.container.getBoundingClientRect(),
        containerWidth = _container$getBoundin.width,
        containerTop = _container$getBoundin.top;

    var width = containerWidth - props.sidebarWidth - props.rightSidebarWidth;
    var headerLabelGroupHeight = props.headerLabelGroupHeight,
        headerLabelHeight = props.headerLabelHeight;

    var headerHeight = headerLabelGroupHeight + headerLabelHeight;

    var _stackItems2 = _this4.stackItems(props.items, props.groups, _this4.state.canvasTimeStart, _this4.state.visibleTimeStart, _this4.state.visibleTimeEnd, width),
        dimensionItems = _stackItems2.dimensionItems,
        height = _stackItems2.height,
        groupHeights = _stackItems2.groupHeights,
        groupTops = _stackItems2.groupTops;

    // this is needed by dragItem since it uses pageY from the drag events
    // if this was in the context of the scrollElement, this would not be necessary


    var topOffset = containerTop + window.pageYOffset + headerHeight;

    _this4.setState({
      width: width,
      topOffset: topOffset,
      dimensionItems: dimensionItems,
      height: height,
      groupHeights: groupHeights,
      groupTops: groupTops
    });
    _this4.scrollComponent.scrollLeft = width;
  };

  this.onScroll = function (scrollX) {
    var canvasTimeStart = _this4.state.canvasTimeStart;

    var zoom = _this4.state.visibleTimeEnd - _this4.state.visibleTimeStart;
    var width = _this4.state.width;
    var visibleTimeStart = canvasTimeStart + zoom * scrollX / width;

    if (scrollX < _this4.state.width * 0.5) {
      _this4.setState({
        canvasTimeStart: _this4.state.canvasTimeStart - zoom
      });
    }
    if (scrollX > _this4.state.width * 1.5) {
      _this4.setState({
        canvasTimeStart: _this4.state.canvasTimeStart + zoom
      });
    }

    if (_this4.state.visibleTimeStart !== visibleTimeStart || _this4.state.visibleTimeEnd !== visibleTimeStart + zoom) {
      _this4.props.onTimeChange(visibleTimeStart, visibleTimeStart + zoom, _this4.updateScrollCanvas);
    }

    _this4.setState({
      currentScrollLeft: scrollX
    });
  };

  this.updateScrollCanvas = function (visibleTimeStart, visibleTimeEnd, forceUpdateDimensions, updatedItems, updatedGroups) {
    var oldCanvasTimeStart = _this4.state.canvasTimeStart;
    var oldZoom = _this4.state.visibleTimeEnd - _this4.state.visibleTimeStart;
    var newZoom = visibleTimeEnd - visibleTimeStart;
    var items = updatedItems || _this4.props.items;
    var groups = updatedGroups || _this4.props.groups;

    var newState = {
      visibleTimeStart: visibleTimeStart,
      visibleTimeEnd: visibleTimeEnd
    };

    var resetCanvas = false;

    var canKeepCanvas = visibleTimeStart >= oldCanvasTimeStart + oldZoom * 0.5 && visibleTimeStart <= oldCanvasTimeStart + oldZoom * 1.5 && visibleTimeEnd >= oldCanvasTimeStart + oldZoom * 1.5 && visibleTimeEnd <= oldCanvasTimeStart + oldZoom * 2.5;

    // if new visible time is in the right canvas area
    if (canKeepCanvas) {
      // but we need to update the scroll
      var newScrollLeft = Math.round(_this4.state.width * (visibleTimeStart - oldCanvasTimeStart) / newZoom);
      if (_this4.scrollComponent.scrollLeft !== newScrollLeft) {
        resetCanvas = true;
      }
    } else {
      resetCanvas = true;
    }

    if (resetCanvas) {
      newState.canvasTimeStart = visibleTimeStart - newZoom;
      _this4.scrollComponent.scrollLeft = _this4.state.width;

      if (_this4.props.onBoundsChange) {
        _this4.props.onBoundsChange(newState.canvasTimeStart, newState.canvasTimeStart + newZoom * 3);
      }
    }

    if (resetCanvas || forceUpdateDimensions) {
      var canvasTimeStart = newState.canvasTimeStart ? newState.canvasTimeStart : oldCanvasTimeStart;

      var _stackItems3 = _this4.stackItems(items, groups, canvasTimeStart, visibleTimeStart, visibleTimeEnd, _this4.state.width),
          dimensionItems = _stackItems3.dimensionItems,
          height = _stackItems3.height,
          groupHeights = _stackItems3.groupHeights,
          groupTops = _stackItems3.groupTops;

      newState.dimensionItems = dimensionItems;
      newState.height = height;
      newState.groupHeights = groupHeights;
      newState.groupTops = groupTops;
    }

    _this4.setState(newState, function () {
      // are we changing zoom? Well then let's report it
      // need to wait until state is set so that we get current
      // timeline context
      if (_this4.props.onZoom && oldZoom !== newZoom) {
        _this4.props.onZoom(_this4.getTimelineContext());
      }
    });
  };

  this.handleWheelZoom = function (speed, xPosition, deltaY) {
    _this4.changeZoom(1.0 + speed * deltaY / 500, xPosition / _this4.state.width);
  };

  this.changeZoom = function (scale) {
    var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.5;
    var _props4 = _this4.props,
        minZoom = _props4.minZoom,
        maxZoom = _props4.maxZoom;

    var oldZoom = _this4.state.visibleTimeEnd - _this4.state.visibleTimeStart;
    var newZoom = Math.min(Math.max(Math.round(oldZoom * scale), minZoom), maxZoom); // min 1 min, max 20 years
    var newVisibleTimeStart = Math.round(_this4.state.visibleTimeStart + (oldZoom - newZoom) * offset);

    _this4.props.onTimeChange(newVisibleTimeStart, newVisibleTimeStart + newZoom, _this4.updateScrollCanvas);
  };

  this.showPeriod = function (from, unit, range = 1) {
    var visibleTimeStart = from.valueOf();
    var visibleTimeEnd = (0, _moment2.default)(from).add(range, unit).valueOf();
    var zoom = visibleTimeEnd - visibleTimeStart;

    // can't zoom in more than to show one hour
    if (zoom < 360000) {
      return;
    }

    // clicked on the big header and already focused here, zoom out
    if (unit !== 'year' && _this4.state.visibleTimeStart === visibleTimeStart && _this4.state.visibleTimeEnd === visibleTimeEnd) {
      var nextUnit = (0, _calendar.getNextUnit)(unit);

      visibleTimeStart = from.startOf(nextUnit).valueOf();
      visibleTimeEnd = (0, _moment2.default)(visibleTimeStart).add(1, nextUnit);
      zoom = visibleTimeEnd - visibleTimeStart;
    }

    _this4.props.onTimeChange(visibleTimeStart, visibleTimeStart + zoom, _this4.updateScrollCanvas);
  };

  this.selectItem = function (item, clickType, e) {
    if (_this4.state.selectedItem === item || _this4.props.itemTouchSendsClick && clickType === 'touch') {
      if (item && _this4.props.onItemClick) {
        var time = _this4.timeFromItemEvent(e);
        _this4.props.onItemClick(item, e, time);
      }
    } else {
      _this4.setState({ selectedItem: item });
      if (item && _this4.props.onItemSelect) {
        var _time = _this4.timeFromItemEvent(e);
        _this4.props.onItemSelect(item, e, _time);
      } else if (item === null && _this4.props.onItemDeselect) {
        _this4.props.onItemDeselect(e); // this isnt in the docs. Is this function even used?
      }
    }
  };

  this.doubleClickItem = function (item, e) {
    if (_this4.props.onItemDoubleClick) {
      var time = _this4.timeFromItemEvent(e);
      _this4.props.onItemDoubleClick(item, e, time);
    }
  };

  this.contextMenuClickItem = function (item, e) {
    if (_this4.props.onItemContextMenu) {
      var time = _this4.timeFromItemEvent(e);
      _this4.props.onItemContextMenu(item, e, time);
    }
  };

  this.getTimeFromRowClickEvent = function (e) {
    var dragSnap = _this4.props.dragSnap;
    var _state6 = _this4.state,
        width = _state6.width,
        canvasTimeStart = _state6.canvasTimeStart,
        visibleTimeStart = _state6.visibleTimeStart,
        visibleTimeEnd = _state6.visibleTimeEnd;
    // this gives us distance from left of row element, so event is in
    // context of the row element, not client or page

    var offsetX = e.nativeEvent.offsetX;

    // FIXME: DRY up way to calculate canvasTimeEnd

    var zoom = visibleTimeEnd - visibleTimeStart;
    var canvasTimeEnd = zoom * 3 + canvasTimeStart;

    var time = (0, _calendar.calculateTimeForXPosition)(canvasTimeStart, canvasTimeEnd, width * 3, offsetX);
    time = Math.floor(time / dragSnap) * dragSnap;

    return time;
  };

  this.timeFromItemEvent = function (e) {
    var _state7 = _this4.state,
        width = _state7.width,
        visibleTimeStart = _state7.visibleTimeStart,
        visibleTimeEnd = _state7.visibleTimeEnd;
    var dragSnap = _this4.props.dragSnap;


    var scrollComponent = _this4.scrollComponent;

    var _scrollComponent$getB = scrollComponent.getBoundingClientRect(),
        scrollX = _scrollComponent$getB.left;

    var xRelativeToTimeline = e.clientX - scrollX;

    var relativeItemPosition = xRelativeToTimeline / width;
    var zoom = visibleTimeEnd - visibleTimeStart;
    var timeOffset = relativeItemPosition * zoom;

    var time = Math.round(visibleTimeStart + timeOffset);
    time = Math.floor(time / dragSnap) * dragSnap;

    return time;
  };

  this.dragItem = function (item, dragTime, newGroupOrder) {
    var newGroup = _this4.props.groups[newGroupOrder];
    var keys = _this4.props.keys;

    _this4.setState({
      draggingItem: item,
      dragTime: dragTime,
      newGroupOrder: newGroupOrder,
      dragGroupTitle: newGroup ? (0, _generic._get)(newGroup, keys.groupTitleKey) : ''
    });
  };

  this.dropItem = function (item, dragTime, newGroupOrder) {
    _this4.setState({ draggingItem: null, dragTime: null, dragGroupTitle: null });
    if (_this4.props.onItemMove) {
      _this4.props.onItemMove(item, dragTime, newGroupOrder);
    }
  };

  this.resizingItem = function (item, resizeTime, edge) {
    _this4.setState({
      resizingItem: item,
      resizingEdge: edge,
      resizeTime: resizeTime
    });
  };

  this.resizedItem = function (item, resizeTime, edge, timeDelta) {
    _this4.setState({ resizingItem: null, resizingEdge: null, resizeTime: null });
    if (_this4.props.onItemResize && timeDelta !== 0) {
      _this4.props.onItemResize(item, resizeTime, edge);
    }
  };

  this.handleRowClick = function (e, rowIndex) {
    // shouldnt this be handled by the user, as far as when to deselect an item?
    if (_this4.state.selectedItem) {
      _this4.selectItem(null);
    }

    if (_this4.props.onCanvasClick == null) return;

    var time = _this4.getTimeFromRowClickEvent(e);
    var groupId = (0, _generic._get)(_this4.props.groups[rowIndex], _this4.props.keys.groupIdKey);
    _this4.props.onCanvasClick(groupId, time, e);
  };

  this.handleRowDoubleClick = function (e, rowIndex) {
    if (_this4.props.onCanvasDoubleClick == null) return;

    var time = _this4.getTimeFromRowClickEvent(e);
    var groupId = (0, _generic._get)(_this4.props.groups[rowIndex], _this4.props.keys.groupIdKey);
    _this4.props.onCanvasDoubleClick(groupId, time, e);
  };

  this.handleScrollContextMenu = function (e, rowIndex) {
    if (_this4.props.onCanvasContextMenu == null) return;

    var timePosition = _this4.getTimeFromRowClickEvent(e);

    var groupId = (0, _generic._get)(_this4.props.groups[rowIndex], _this4.props.keys.groupIdKey);

    if (_this4.props.onCanvasContextMenu) {
      e.preventDefault();
      _this4.props.onCanvasContextMenu(groupId, timePosition, e);
    }
  };

  this.registerScrollListener = function (listener) {
    _this4.headerScrollListener = listener;
  };
};

exports.default = ReactCalendarTimeline;
