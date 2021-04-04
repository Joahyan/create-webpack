'use strict';

// import React from 'react';
// import ReactDOM from 'react-dom';
// import '../../common';
// import logo from './images/logo.jpg';
// import './search.less';
const React = require('react');
const logo = require('./images/logo.png');
require('./search.less');


class Search extends React.Component {

    constructor() {
        super(...arguments);

        this.state = {
            Text: null
        };
    }

    loadComponent() {
        import('./text.js').then((Text) => {
            this.setState({
                Text: Text.default
            });
        });
    }

    render () {
        const { Text } = this.state
        return <div className="search-text">
                    {
                        Text ? <Text /> : null
                    }
                    Search Text
                    <img src={logo} onClick={ this.loadComponent.bind(this) } />
                </div>;
    }
}


module.exports = <Search />;