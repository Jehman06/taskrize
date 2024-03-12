import './App.css';
import SignupPage from './authentication/Signup';
import LoginPage from './authentication/Login';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>Task-Management App</p>
      </header>
      <SignupPage />
      <LoginPage />
    </div>
  );
}

export default App;
