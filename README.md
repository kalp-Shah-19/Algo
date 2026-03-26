# AI-Based Algo Trading System

An AI-powered algorithmic trading platform with backtesting, ML-based signal filtering, and performance analytics.

---

## Features

* Strategy Backtesting (RSI, EMA Crossover)
* ML-based Trade Filtering (using XGBoost)
* Risk Management (Stop Loss & Take Profit)
* Performance Metrics (Profit, Win Rate, Sharpe Ratio, Max Drawdown)
* Interactive Dashboard (React)
* Equity Curve Visualization with Buy/Sell Markers

---

## Tech Stack

* Backend: FastAPI (Python)
* Frontend: React + TailwindCSS
* ML: Scikit-learn
* Data: Yahoo Finance API

---

## User Interface

<img width="1883" height="907" alt="image" src="https://github.com/user-attachments/assets/04016558-79e2-4079-ad50-6593cf2d426e" />

---

## How to Run

### 1) Clone the repository

```bash
git clone https://github.com/kalp_Shah-19/algo-trading-system.git
cd algo-trading-system
```

---

### 2️) Run Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

 -> Backend runs at: http://127.0.0.1:8000

---

### 3️) Run Frontend (React)

```bash
cd frontend
npm install
npm start
```

-> Frontend runs at: http://localhost:3000


---

## Future Improvements

* Live trading integration (Zerodha API)
* Advanced ML models (XGBoost / LSTM)
* Strategy marketplace
* Portfolio optimization

---

## Author

Kalp Shah

---
