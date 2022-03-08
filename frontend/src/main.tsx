import React from "react";
import ReactDOM from "react-dom";

import * as urql from "urql";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Auth } from "./pages/Auth";
import { Todos } from "./pages/Todos";
import { Cognito } from "@serverless-stack/web";

const cognito = Cognito.create({
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
});

const client = urql.createClient({
  url: import.meta.env.VITE_GRAPHQL_URL,
  fetchOptions: () => {
    const token = cognito.state.session?.getAccessToken().getJwtToken();
    return {
      headers: { authorization: token ? `Bearer ${token}` : "" },
    };
  },
});

ReactDOM.render(
  <React.StrictMode>
    <urql.Provider value={client}>
      <Cognito.Provider value={cognito}>
        <App />
      </Cognito.Provider>
    </urql.Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

function App() {
  console.log("Rendering app");
  const auth = Cognito.use();
  if (auth.state.isInitializing) return <span>Checking auth...</span>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/*" element={<Auth />} />
        <Route path="*" element={<Authenticated />} />
      </Routes>
    </BrowserRouter>
  );
}

function Authenticated() {
  const auth = Cognito.use();
  if (!auth.state.session) return <Navigate to="/auth/login" />;
  return (
    <Routes>
      <Route path="/todos" element={<Todos />} />
    </Routes>
  );
}
