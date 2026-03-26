from fastapi import APIRouter
from app.services.data_service import get_historical_data
from app.services.indicator_service import add_indicators
from app.services.strategy_service import apply_strategy
from app.services.backtest_service import run_backtest, calculate_metrics
from app.services.ml_service import train_ml_model
from app.services.feature_service import add_ml_features
from app.services.backtest_service import calculate_advanced_metrics
router = APIRouter()

@router.get("/backtest/{symbol}")
def backtest(symbol: str, strategy: str = "rsi", use_ml: bool = False):
    df = get_historical_data(symbol)

    df = add_indicators(df)
    df = add_ml_features(df)

    model = None
    if use_ml:
        model = train_ml_model(df)

    df = apply_strategy(df, strategy=strategy, use_ml=use_ml, model=model)

    df, trades = run_backtest(df)
    metrics = calculate_metrics(trades)

    # ✅ ONLY RETURN COMPLETED TRADES (SELL)
    completed_trades = [t for t in trades if t["type"] == "SELL"]
    buy_trades = [t for t in trades if t["type"] == "BUY"]
    advanced = calculate_advanced_metrics(df)

    return {
        "metrics": metrics,
        "advanced": advanced,
        "trades": completed_trades[-5:],     # for metrics
        "all_trades": trades[-10:],          # for UI display
        "equity_curve": df["Equity"].tail(50).astype(str).tolist(),
        "open_position": len(trades) > len(completed_trades)
    }
 
@router.get("/strategy/{symbol}")
def run_strategy(symbol:str):
    df = get_historical_data(symbol)
    df = add_indicators(df)
    df = apply_strategy(df)
    
    df=df.head(20)
    return df.astype(str).to_dict(orient="records")
    
@router.get("/data/{symbol}")
def fetch_data(symbol: str):
    df = get_historical_data(symbol)

    df = df.tail(10)

    # Convert everything to safe JSON
    df = df.astype(str)

    return df.to_dict(orient="records")
