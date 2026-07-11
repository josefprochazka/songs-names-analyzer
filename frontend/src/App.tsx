import './App.css'

const sparkles = ['✨', '💖', '🌈', '⭐', '💫', '🦄', '💕', '🎀']

function App() {
  return (
    <div className="unicorn-page">
      <div className="sparkle-field">
        {sparkles.map((emoji, i) => (
          <span
            key={i}
            className="sparkle"
            style={{
              left: `${(i * 12.5) % 100}%`,
              animationDelay: `${i * 0.4}s`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      <div className="unicorn-card">
        <div className="unicorn-emoji">🦄</div>
        <h1 className="rainbow-text">Ahoj bejby!</h1>
        <p className="bounce-text">
          Brzy tady uvidíš data všech písní. <span className="blink">Těš se!</span>
        </p>
        <div className="hearts">💖 🌸 💜 🌸 💖</div>
      </div>
    </div>
  )
}

export default App
