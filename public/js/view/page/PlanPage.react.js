/**
 * 游玩攻略界面
 * 
 * Version: 1.0
 *
 * Created: Kevin.Lai
 * Date: 2015/9/8
 * 
 */

var React = require('react');
var Navigation = require('react-router').Navigation;
var State = require('react-router').State;

var Constants = require('../../constants/AppConstants');

var ListItem = require('../component/ListItem.react');
var ScrollView = require('../component/ScrollView.react');
var Prompt = require('../component/Prompt.react');

var AppHeader = require('../AppHeader.react');
var ProjectList = require('../ProjectList.react');
var ProjectItem = require('../ProjectItem.react');

var FancyModal = require('../FancyModal.react');

var ViewUtil = require('../../utils/HowUIUtil');
var FormatUtil = require('../../utils/FormatUtil');

var QueryAction = require('../../actions/QueryAction');
var ProjectStore = require('../../stores/ProjectStore');
var LocationStore = require('../../stores/LocationStore');

var SearchModal = require('../SearchModal.react');

var TYPE_ARRAY = [
	'全部分类',
	'家庭游',
	'情侣游',
	'亲子游'
];

var KIND_ARRAY = [
	'距离最近',
	'最多好评',
	'排队时间短'
];

var FILTER_TYPE_TYPE = 0;
var FILTER_TYPE_DISTRICT = 1;
var FILTER_TYPE_KIND = 2;

var DISTRICT_ALL = 999;

var _tapValue = DISTRICT_ALL;
var _tapType = FILTER_TYPE_TYPE;

var TYPE_TITLE = '全部分类';
var DISTRICT_TITLE = '全部片区';
var KIND_TITLE = '距离最近';

var SORTING_DISTANCE = 0;
var SORTING_RATING = 1;
var SORTING_QUEUE = 2;

var TYPE_ALL = 0;
var TYPE_FAMILY = 1;
var TYPE_COUPLE = 2;
var TYPE_CHILD = 3;

_sorting = SORTING_DISTANCE;
_type = TYPE_ALL;
_districtId = DISTRICT_ALL;

/**
 * 游玩攻略过滤
 */
var PlanFilter = React.createClass({

	componentDidMount: function() {
		$('#type').bind('tap', this._onTapFilter);
		$('#district').bind('tap', this._onTapFilter);
		$('#kind').bind('tap', this._onTapFilter);

		$('#type').bind('touchmove', this._onTouchFooter);
		$('#district').bind('touchmove', this._onTouchFooter);
		$('#kind').bind('touchmove', this._onTouchFooter);
		$('#filterList').bind('touchmove', this._onTouchFooter);
	},

	_onTouchFooter: function(e) {
		e.preventDefault();
		e.stopPropagation();
		console.log('_onTouchFooter');
	},

	_onTapFilter: function(e) {
		
		var id = e.target.id;
		console.log(e);
		var type = FILTER_TYPE_TYPE;
		if (id.indexOf('district') >= 0) {
			type = FILTER_TYPE_DISTRICT;
			id = 'districtValue';
		}
		else if (id.indexOf('kind') >= 0) {
			type = FILTER_TYPE_KIND;
			id = 'kindValue';
		}
		else {
			id = 'typeValue'
		}

		var value = $('#' + id).text();
		_tapValue = value;
		_tapType = type;

		this.props.onTap();
	},

	render: function() {

		console.log('PlanFilter render time=' + (new Date()).getTime());
		return (
			<section className='back-cover tab-bar'>
				<ul id='filterList' className='grid three-item'>
					<li id='type' className='grid-item'>
						<i id='typeIcon' className='footer-icon'><img id='typeImg' src={Constants.Images.ARROW_UP} /></i>
						<a id='typeA'><span id='typeValue'>{this.props.type}</span></a>
					</li>
					<li id='district' className='grid-item'>
						<i id='districtIcon' className='footer-icon'><img id='districtImg' src={Constants.Images.ARROW_UP} /></i>
						<a id='districtA'><span id='districtValue'>{this.props.district}</span></a>
					</li>
					<li id='kind' className='grid-item'>
						<i id='kindIcon' className='footer-icon'><img id='kindImg' src={Constants.Images.ARROW_UP} /></i>
						<a id='kindA'><span id='kindValue'>{this.props.kind}</span></a>
					</li>
				</ul>
			</section>
		);
	}
});

var FilterItem = React.createClass({

	render: function() {

		if (this.props.selected) {
			return (
				<div className='filter-item'>
					<span>{this.props.children}</span>
					<i><img src={Constants.Images.POST} /></i>
				</div>
			)
		}
		else {
			return (
				<div className='filter-item'>
					<span>{this.props.children}</span>
				</div>
			);
		}
	}
});

/**
 * 选择模态框
 */
var FilterModal = React.createClass({

	bgTapped: false,

	getInitialState: function() {
		return ({
			filter: FILTER_TYPE_TYPE,
			value: '所有'
		});
	},

	setFilter: function() {
		this.setState({
			filter: _tapType,
			value: _tapValue
		});
	},

	show: function() {
		this.refs.modal.slideup();
	},

	hide: function() {
		this.refs.modal.slidedown();
		// HowUI初始化
		ViewUtil.init();
		ViewUtil.hasfixBar();
	},

	_onSelect: function(id) {

		var type = this.state.filter;
		var value = ''
		if (type == FILTER_TYPE_TYPE) {
			id = id.substring(4);
			this.props.onType(id);
		}
		else if (type == FILTER_TYPE_DISTRICT) {
			id = id.substring(8);
			this.props.onDistrict(id);
		}
		else {
			id = id.substring(4);
			this.props.onKind(id);
		}
	},

	// 设定区域列表的高度
	componentDidUpdate: function() {

		var type = this.state.filter;
		if (type == FILTER_TYPE_DISTRICT) {
			var districtGroup = ProjectStore.getDistrictGroup();
			var cnt = 1;
			for (var key in districtGroup) {
				cnt++;
			}

			var itemHeight = $('#list-itemdistrict999').height();
			$(".filter-modal>div").css("height", itemHeight*cnt);
		}
		else if (type == FILTER_TYPE_TYPE) {
			var itemHeight = $('#list-itemdistrict999').height();
			$(".filter-modal>div").css("height", itemHeight*4);
		}
		else if (type == FILTER_TYPE_KIND) {
			var itemHeight = $('#list-itemdistrict999').height();
			$(".filter-modal>div").css("height", itemHeight*3);
		}

		this.refs.scrollView.scrollToTop();
	},

	render: function() {

		var listComps = [];
		var type = this.state.filter;
		var value = this.state.value;

		if (type == FILTER_TYPE_TYPE) {

			for (var i = 0; i < TYPE_ARRAY.length; i++) {
				listComps.push(
					<ListItem key={'type' + i} id={'type' + i}  selected={value == TYPE_ARRAY[i]} onTap={this._onSelect}>
						<FilterItem key={'filter'+i} selected={value == TYPE_ARRAY[i]} >
							<span key={'span'+i}> {TYPE_ARRAY[i]}</span>
						</FilterItem>
					</ListItem>
				);
			}
		}
		else if (type == FILTER_TYPE_DISTRICT) {

			var districtGroup = ProjectStore.getDistrictGroup();

			listComps.push(
				<ListItem key={'district' + DISTRICT_ALL} id={'district' + DISTRICT_ALL} selected={value == '全部片区'} onTap={this._onSelect}>
					<FilterItem key={'filter'+key} selected={value == '全部片区'}>
						<span key={'span'+key}> 全部片区</span>
					</FilterItem>
				</ListItem>
			);
			for (var key in districtGroup) {
				var district = districtGroup[key];
				listComps.push(
					<ListItem key={'district' + key} id={'district' + district._id} selected={value == district.name} onTap={this._onSelect}>
						<FilterItem key={'filter'+key} selected={value == district.name}>
							<span key={'span'+key}> {district.name}</span>
						</FilterItem>
					</ListItem>
				);
			}
		}
		else {

			for (var i = 0; i < KIND_ARRAY.length; i++) {
				listComps.push(
					<ListItem key={'kind' + i} id={'kind' + i} selected={value == KIND_ARRAY[i]} onTap={this._onSelect}>
						<FilterItem key={i} selected={value == KIND_ARRAY[i]} >
							{KIND_ARRAY[i]}
						</FilterItem>
					</ListItem>
				);
			}
		}

		return (
			<FancyModal ref='modal' id='filterModal' modalClass=' filter filter-modal' onSlideDown={this._onSlideDown} onTapBg={this._onTapBg}>
				<ScrollView ref='scrollView' inner>
					{listComps}
				</ScrollView>
			</FancyModal>
		);
	},

	_onSlideDown: function() {
		if (this.props.onSlideDown && !this.bgTapped) {
			this.props.onSlideDown();
		}
		this.bgTapped = false;
	},

	_onTapBg: function() {
		if (this.props.onTapBg) {
			this.bgTapped = true;
			this.props.onTapBg();
		}
	}
});



/**
 * 游玩攻略
 */
var PlanPage = React.createClass({

	mixins: [Navigation, State],

	goToClicked: false,

	filterModalShown: false,

	getInitialState: function() {

		return {
			facilities: [],
			sorting: SORTING_DISTANCE
		};
	},

	componentWillUnmount: function() {
		ProjectStore.removeChangeListener(ProjectStore.QUERY_ALL_FACILITY_EVENT, this._onProjectChange);
	},

	componentDidUpdate: function() {

		// HowUI初始化
		ViewUtil.hasfixBar();

		this.refs.projects.scrollToTop();

		setTimeout(this.refs.prompt.hide, 500);
	},

	componentDidMount: function() {

		// HowUI初始化
		ViewUtil.hasfixBar();

		ProjectStore.addChangeListener(ProjectStore.QUERY_ALL_FACILITY_EVENT, this._onProjectChange);

		// 取得最新的设施详情列表
		QueryAction.queryProjectGroup(Constants.Category.FACILITY);

		// this._promptAndUpdate();
	},

	render: function() {

		console.log('PlanPage render');

		// 生成项目列表
		var projects = this.state.facilities;

		// var typeTitle = TYPE_TITLE;
		// var districtTitle = DISTRICT_TITLE;
		// var sortingTitle = KIND_TITLE;

		// // 类型名称
		// if (_type != TYPE_ALL) {
		// 	typeTitle = TYPE_ARRAY[_type];
		// }

		// // 筛选片区名称
		// if (_districtId != DISTRICT_ALL) {
		// 	var districtGroup = ProjectStore.getDistrictGroup();
		// 	for (var key in districtGroup) {
		// 		if (districtGroup[key]._id == _districtId) {
		// 			districtTitle = districtGroup[key].name;
		// 			break;
		// 		}
		// 	}
		// }

		// // 排序名称
		// if (_sorting != SORTING_DISTANCE) {
		// 	sortingTitle = KIND_ARRAY[_sorting];
		// }

		console.debug('PlanPage render sorting=' + this.state.sorting);

		return (
			<div>
				<div className='cover'>
					<AppHeader title='游玩攻略' backBtn />
					<div className='plan-menu'>
						<div onClick={this._filterByDistance} className={this.state.sorting == SORTING_DISTANCE ? 'checked' : ''}>
							距离最近
						</div>
						<div onClick={this._filterByQueue} className={this.state.sorting == SORTING_QUEUE ? 'checked' : ''}>
							排队人数最少
						</div>
					</div>
				</div>
				<div className='container' id='planContainer'>
					<ProjectList ref='projects' projects={projects} onTapItem={this._onTapItem}/>
				</div>
				<Prompt ref='prompt' />
			</div>
		);

		// return (
		// 	<div>
		// 		<div className='cover'>
		// 			<AppHeader title='游玩攻略' backBtn />
		// 			<PlanFilter onTap={this._onTapFilter} type={typeTitle} district={districtTitle} kind={sortingTitle} />
		// 		</div>
		// 		<div className='container' id='planContainer'>
		// 			<ProjectList ref='projects' projects={projects} onTapItem={this._onTapItem}/>
		// 		</div>
		// 		<FilterModal ref='filterModal' onSlideDown={this._onSlideDown} onTapBg={this._onTapBg} onType={this._onSelectType} onDistrict={this._onSelectDistrict} onKind={this._onSelectKind} />
		// 		<Prompt ref='prompt' />
		// 	</div>
		// );
	},

	/**
	 * 动画结束，开始筛选项目
	 */
	_onSlideDown: function() {
		this._promptAndUpdate();
	},

	/**
	 * 提示即将更新
	 */
	_promptAndUpdate: function() {
		this.refs.prompt.show('载入中，请稍候');
		console.log('prompt show');
		setTimeout(this._filterProjects, 100);
	},

	/**
	 * 点击背景，关闭模态框
	 */
	_onTapBg: function(type) {
		this.refs.filterModal.hide();
		this.filterModalShown = false;
	},

	/**
	 * 选择用类型筛选
	 */
	_onSelectType: function(type) {
		console.log(type);
		this.refs.filterModal.hide();
		this.filterModalShown = false;
		_type = type;
	},

	/**
	 * 选择用区域筛选
	 */
	_onSelectDistrict: function(districtId) {
		console.log('_onSelectDistrict');
		this.refs.filterModal.hide();
		this.filterModalShown = false;
		_districtId = districtId;
	},

	/**
	 * 选择用排序筛选
	 */
	_onSelectKind: function(sorting) {
		this.refs.filterModal.hide();
		this.filterModalShown = false;
		_sorting = sorting;
	},

	/**
	 * 按距离排序
	 */
	_filterByDistance: function() {
		console.debug('PlanPage _filterByDistance');
		this._filterProjects(TYPE_ALL, DISTRICT_ALL, SORTING_DISTANCE);
	},

	/**
	 * 按排队人数排序
	 */
	_filterByQueue: function() {
		console.debug('PlanPage _filterByQueue');
		this._filterProjects(TYPE_ALL, DISTRICT_ALL, SORTING_QUEUE);
	},

	/**
	 * 筛选项目列表
	 */
	_filterProjects: function(type, districtId, sorting) {

		console.debug('PlanPage _filterProjects. type=' + type + ' districtId=' + districtId + ' sorting=' + sorting);

		var facilities = ProjectStore.getFacilityGroup();

		// facilities = this._filterType(facilities, _type);
		// facilities = this._filterDistrict(facilities, _districtId);
		facilities = this._sort(facilities, sorting);

		var tmpFacilities = [];
		for (var i = 0; i < facilities.length; i++) {
			if (i == 5) { break; }
			tmpFacilities.push(facilities[i]);
		}

		console.debug(facilities);

		this.setState({
			facilities: tmpFacilities,
			sorting: sorting,
		});
	},

	/**
	 * 过滤游玩类型（亲子游、情侣游、家庭游）
	 */
	_filterType: function(projects, type) {

		console.debug('PlanPage _filterType type=' + type);
		console.debug(projects);

		var resultList = [];
		for (var key in projects) {
			if (type == TYPE_CHILD && projects[key].type[0].child == '1') {
				resultList.push(projects[key]);
			}
			else if (type == TYPE_COUPLE && projects[key].type[0].couple == '1') {
				resultList.push(projects[key]);
			}
			else if (type == TYPE_FAMILY && projects[key].type[0].family == '1') {
				resultList.push(projects[key]);
			}
			else if (type == TYPE_ALL) {
				resultList.push(projects[key]);
			}
		}

		console.debug(projects);

		return resultList;
	},

	/**
	 * 过滤区域
	 */
	_filterDistrict: function(projects, districtId) {

		console.debug('ProjectList _filterDistrict districtId=' + districtId);
		console.debug(projects);

		if (!districtId || districtId == DISTRICT_ALL) {
			return projects;
		}

		var resultList = [];
		for (var key in projects) {
			if (districtId == projects[key].parent_id) {
				console.debug(projects[key]);
				resultList.push(projects[key]);
			}
		}

		console.debug(resultList);

		return resultList;
	},

	/**
	 * 按评分排序
	 */
	_sortByRating: function(projects) {

		var r5Projects = [];
		var r4Projects = [];
		var r3Projects = [];
		var r2Projects = [];
		var r1Projects = [];

		for (var key in projects) {
			var project = projects[key];

			switch(parseInt(project.rating)) {
			case 5:
				r5Projects.push(project); break;
			case 4:
				r4Projects.push(project); break;
			case 3:
				r3Projects.push(project); break;
			case 2:
				r2Projects.push(project); break;
			default:
				r1Projects.push(project); break;
			}
		}
		return r5Projects.concat(r4Projects).concat(r3Projects).concat(r2Projects).concat(r1Projects);
	},

	_sortQueueTime: function(aProject, bProject) {

		var aTime = aProject.queue.time;
		var bTime = bProject.queue.time;

		if (!aTime || aTime == '') {
			return -1;
		}
		else if (!bTime || bTime == '') {
			return 1;
		}
		else {
			return parseInt(aTime) - parseInt(bTime);
		}
	},

	/**
	 * 按排队时间排序
	 */
	_sortByQueue: function(projects) {

		var queueProjects = [];
		var noQueueProjects = [];

		for (var key in projects) {
			var project = projects[key];

			if (project.queue && project.queue.monitored == '1') {
				queueProjects.push(project);

				console.log(project.name + ' ' + project.queue.time);
			}
			else {
				noQueueProjects.push(project);
			}
		}


		projects = queueProjects.sort(this._sortQueueTime).concat(noQueueProjects);

		return projects;
	},

	/**
	 * 按距离排序
	 */
	_sortByDistance: function(projects) {
		return projects;
	},

	/**
	 * 排序（距离、排队时间、好评度）
	 */
	_sort: function(projects, sorting) {

		console.debug('PlanPage _sort sorting=' + sorting);
		console.debug(projects);

		// 默认，按距离远近排序

		// 按好评度排序
		if (sorting == SORTING_RATING) {
			projects = this._sortByRating(projects);
		}
		// 按排队时间排序
		else if (sorting == SORTING_QUEUE) {
			projects = this._sortByQueue(projects);
		}

		console.debug(projects);

		return projects;
	},

	_onTapFilter: function(type, value) {
		if (this.filterModalShown) {
			this.refs.filterModal.hide();
			this.filterModalShown = false;
		}
		else {
			this.refs.filterModal.setFilter();
			this.refs.filterModal.show();
			this.filterModalShown = true;
		}
	},

	_onGoto: function() {
		this.goToClicked = true;
	},

	_onTapItem: function(projectId) {

		if (this.goToClicked) {
			return;
		}

		// 跳转前，清除回调
		ProjectStore.removeChangeListener(ProjectStore.QUERY_ALL_FACILITY_EVENT, this._onProjectChange);
		this.transitionTo(Constants.Url.FACILITY, {}, {projectId: projectId})
	},

	_onProjectChange: function() {

		var facilities = ProjectStore.getFacilityGroup();
		var tmpFacilities = [];
		for (var i = 0; i < facilities.length; i++) {
			if (i >= 5) break;
			tmpFacilities.push(facilities[i]);
		}

		this.setState({
			facilities: tmpFacilities
		});
	}

});

module.exports = PlanPage;