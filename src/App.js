import './App.css';
import MapView from './map-view'
import logo from './imgs/logo32.png'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="container">
          <h1><img src={logo} style={{marginRight: "6px"}} alt="logo" />Map COVID-19 Japan</h1>
        </div>
      </header>
      <main className="App-main">
        <MapView />
      </main>
      <footer className="App-footer">
        <div className="container">
          &copy; <a href="https://medium.com/kokutele">Kokutele</a>,
          developed as an <a className="App-link" href="https://github.com/kokutele/map-covid-japan">open source project.</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
