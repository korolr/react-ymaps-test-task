import React from "react";
import { YMaps, Map } from "react-yandex-maps";
import update from "immutability-helper";
import ToDo from "./ToDo";

const mapState = { center: [55.76, 37.64], zoom: 9, controls: [] };

class RouteMap extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      route: [
        { id: 0, type: "wayPoint", point: [55.8, 37.332518], content: "One" }
      ],
      center: mapState.center
    };
  }

  //myMap.getCenter()
  map = null;
  ymaps = null;
  routeRoot = null;
  route = null;

  handleApiAvaliable = ymaps => {
    this.ymaps = ymaps;

    ymaps
      .route(this.state.route)
      .then(route => {
        this.routeRoot = route;
        route.getPaths().options.set({
          balloonContent: "some",
          strokeColor: "0000ffff",
          opacity: 0.9
        });

        route.getWayPoints().options.set({
          draggable: true
        });
        route.events.add("balloonopen", e => {
          var RouteId = e.get("target").properties.get("index");
          e.get("target").properties.set({
            balloonContent: this.state.route[RouteId].content
          });
        });

        route.events.add("dragend", e => {
          var coordRoute = e.get("target").geometry.getCoordinates();
          var indexRoute = e.get("target").properties.get("index");

          this.setState({
            route: update(this.state.route, {
              [indexRoute]: { point: { $set: coordRoute } }
            })
          });

          this.updateRoute();
        });

        this.map.geoObjects.add(route);
      })
      .catch(e => {
        // Для одной точки
        if (this.state.route.length === 1) {
          let oneRoute = new ymaps.GeoObject(
            {
              geometry: {
                type: "Point",
                coordinates: this.state.route[0].point
              },
              properties: {
                balloonContent: this.state.route[0].content
              }
            },
            {
              draggable: true
            }
          );

          oneRoute.events.add("dragend", e => {
            var coordRoute = e.get("target").geometry.getCoordinates();

            this.setState({
              route: update(this.state.route, {
                0: { point: { $set: coordRoute } }
              })
            });
          });
          this.map.geoObjects.add(oneRoute);
        }
      });
  };

  updateRoute = () => {
    this.map.geoObjects.removeAll();
    this.handleApiAvaliable(this.ymaps);
  };

  onBoundsChange = () => {
    this.setState({
      center: this.map.getCenter()
    });
  };

  setItems = item => {
    this.setState({
      route: item
    });

    this.updateRoute();
  };

  newRoute = name => {
    this.setState(
      prevState => ({
        route: [
          ...prevState.route,
          {
            id: prevState.route.length,
            type: "wayPoint",
            point: prevState.center,
            content: name
          }
        ]
      }),
      () => this.updateRoute()
    );
  };

  deleteItem = item => {
    this.setState(
      {
        route: this.state.route.filter(function(route) {
          return route !== item;
        })
      },
      () => this.updateRoute()
    );
  };

  render() {
    return (
      <div className="row center-xs">
        <ToDo
          item={this.state.route}
          setItem={this.setItems}
          addRoute={this.newRoute}
          deleteItem={this.deleteItem}
        />
        <div>
          <YMaps onApiAvaliable={ymaps => this.handleApiAvaliable(ymaps)}>
            <Map
              state={mapState}
              instanceRef={ref => (this.map = ref)}
              onBoundsChange={this.onBoundsChange}
              height="400px"
              width="370px"
            />
          </YMaps>
        </div>
      </div>
    );
  }
}

export default RouteMap;
