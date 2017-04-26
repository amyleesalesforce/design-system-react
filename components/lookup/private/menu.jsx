/* Copyright (c) 2015-present, salesforce.com, inc. All rights reserved */
/* Licensed under BSD 3-Clause - see LICENSE.txt or git.io/sfdc-license */


import React from 'react';
import ReactDOM from 'react-dom';
import Item from './item';

const displayName = 'Lookup-Menu';
const propTypes = {
	boldRegex: React.PropTypes.instanceOf(RegExp),
	emptyMessage: React.PropTypes.string,
	filterWith: React.PropTypes.func,
	focusIndex: React.PropTypes.number,
	getListLength: React.PropTypes.func,
	iconCategory: React.PropTypes.string,
	items: React.PropTypes.array,
	label: React.PropTypes.string,
	listLength: React.PropTypes.number,
	searchTerm: React.PropTypes.string,
	setFocus: React.PropTypes.func
};
const defaultProps = {
	emptyMessage: 'No matches found.'
};
class Menu extends React.Component {
	constructor (props) {
		super(props);
		this.state = { filteredItems: this.filteredItems() };
	}

  // Set filtered list length in parent to determine active indexes for aria-activedescendent
	componentDidUpdate (prevProps) {
    // make an array of the children of the list but only count the actual items (but include section dividers)
		const list = [].slice.call(ReactDOM.findDOMNode(this.refs.list).children)
      .filter((child) => (child.className.indexOf('js-slds-lookup__item') > -1 || child.className.indexOf('slds-lookup__divider') > -1))
      .length;
		this.props.getListLength(list);
		if (
        prevProps.items !== this.props.items ||
        prevProps.filter !== this.props.filter ||
        prevProps.searchTerm !== this.props.searchTerm
      ) {
			this.setState({
				filteredItems: this.filteredItems()
			});
		}
	}

	filter (item) {
		return this.props.filterWith(this.props.searchTerm, item);
	}

	filteredItems () {
		return this.filterEmptySections(this.props.items.filter(this.filter, this));
	}

	filterEmptySections (items) {
		const result = [];
		items.forEach((item, index) => {
			if (item && item.data && item.data.type === 'section') {
				if (index + 1 < items.length) {
					const nextItem = items[index + 1];
					if (nextItem.data && nextItem.data.type !== 'section') {
						result.push(item);
					}
				}
			}			else {
				result.push(item);
			}
		});
		return result;
	}

  // Scroll menu up/down when using mouse keys
	handleItemFocus (itemIndex, itemHeight) {
		if (this.refs.list) {
			ReactDOM.findDOMNode(this.refs.list).scrollTop = itemIndex * itemHeight;
		}
	}

	getFilteredItemForIndex (i) {
		if (i > -1 && this.state.filteredItems && i < this.state.filteredItems.length) {
			return this.state.filteredItems[i];
		}
	}

	renderHeader () {
		return this.props.header;
	}

	renderFooter () {
		return this.props.footer;
	}

	renderSectionDivider () {
		return this.props.sectionDivider;
	}

	renderItems () {
		const focusIndex = this.props.focusIndex;
		return this.state.filteredItems.map((c, i) => {
      // isActive means it is aria-activedescendant
			const id = c.id;
			let isActive = false;
			if (this.props.header) {
				isActive = focusIndex === i + 1;
			} else {
				isActive = focusIndex === i;
			}
			if (c.data.type === 'section') {
				if (this.props.sectionDividerRenderer) {
					const SectionDivider = this.props.sectionDividerRenderer;
					return (<SectionDivider
						data={c.data}
						key={`section_header_${i}`}
						{... this.props}
					/>);
				}
			}
			return (<Item
				boldRegex={this.props.boldRegex}
				data={c.data}
				handleItemFocus={this.handleItemFocus.bind(this)}
				iconCategory={this.props.iconCategory}
				iconInverse={this.props.iconInverse}
				iconName={this.props.iconName}
				id={id}
				index={i}
				isActive={isActive}
				key={id}
				listItemLabelRenderer={this.props.listItemLabelRenderer}
				onSelect={this.props.onSelect}
				searchTerm={this.props.searchTerm}
				setFocus={this.props.setFocus}
			>
				{c}
			</Item>);
		});
	}

	renderContent () {
		if (this.state.filteredItems.length === 0) {
			return (
				<li className="slds-lookup__message" aria-live="polite">
					<span className="slds-m-left--x-large slds-p-vertical--medium">{this.props.emptyMessage}</span>
				</li>
			);
		}

		return this.renderItems();
	}

	render () {
		return (
			<section id="menuContainer" className="ignore-react-onclickoutside">
				{this.renderHeader()}
				<ul id="list" className="slds-lookup__list" role="presentation" ref="list">
					{this.renderContent()}
				</ul>
				{this.renderFooter()}
			</section>
		);
	}
}

Menu.displayName = displayName;
Menu.propTypes = propTypes;
Menu.defaultProps = defaultProps;

export default Menu;