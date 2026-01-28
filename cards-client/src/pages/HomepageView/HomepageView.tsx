import React from 'react';
import { Page } from '../../components';
import { GameGrid } from './components';

export const HomepageView: React.FC = () => (
  <Page title="Welcome! Pick a game." titleProps={{ mb: 'lg' }}>
    <GameGrid />
  </Page>
);
