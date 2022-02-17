import theme from "./theme";

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeScript } from "@chakra-ui/react";

ReactDOM.render(
  <React.StrictMode>
    {/* <MoralisProvider
      serverUrl="https://ggm3aiqacseo.usemoralis.com:2053/server"
      appId="I0EFxtLRi1UUla4kCbaJ5ZsiLgiHFjpfXEvz1H6Y"
    > */}
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <App />
    </ChakraProvider>
    {/* </MoralisProvider> */}
  </React.StrictMode>,
  document.getElementById("root")
);
