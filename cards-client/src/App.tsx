import React, { useState } from "react";
import "./App.css";
import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { BrowserRouter } from "react-router-dom";
import { Main } from "./Main";
import { useFontAwesomeIcons } from "./hooks";
import { Api, ApiContext } from "./api";
import { getEnvironment } from "./config";
import { ApiClient } from "./services";

const App = () => {
  useFontAwesomeIcons();
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  const api = new Api(getEnvironment().generateApiRoute(), ApiClient);

  return (
    <ApiContext.Provider value={api}>
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider
          theme={{
            colorScheme: "dark",
            // Override any other properties from default theme
            // fontFamily: "Open Sans, sans serif",
            spacing: {
              xs: 8,
              sm: 12,
              md: 16,
              lg: 24,
              xl: 36,
            },
          }}
          withGlobalStyles
        >
          <BrowserRouter>
            <Main />
          </BrowserRouter>
        </MantineProvider>
      </ColorSchemeProvider>
    </ApiContext.Provider>
  );
};

export default App;
