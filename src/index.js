import React from "react";
import ReactDOM from "react-dom";
import { YMaps, Map } from "react-yandex-maps";
import "./styles.css";
import RouteMap from "./component/RouteMap";

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <RouteMap />
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
