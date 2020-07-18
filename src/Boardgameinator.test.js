import React from 'react';
import ReactDOM from 'react-dom';
import { Boardgameinator } from './Boardgameinator'

test('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Boardgameinator location={ {search: ""} } />, div);
});