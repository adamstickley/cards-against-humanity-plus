import React from 'react';
import './App.css';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { BrowserRouter } from 'react-router-dom';
import { Main } from './Main';
import { useFontAwesomeIcons } from './hooks';
import { Api, ApiContext } from './api';
import { getEnvironment } from './config';
import { ApiClient } from './services';

const App = () => {
  useFontAwesomeIcons();

  const api = new Api(getEnvironment().generateApiRoute(), ApiClient);

  return (
    <ApiContext.Provider value={api}>
      <Theme
        appearance="dark"
        accentColor="gray"
        grayColor="slate"
        radius="medium"
      >
        <BrowserRouter>
          <Main />
        </BrowserRouter>
      </Theme>
    </ApiContext.Provider>
  );
};

export default App;
