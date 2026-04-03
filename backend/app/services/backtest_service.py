import pandas as pd

def run_backtest(df, initial_capital=100000):
    df = df.copy()

    close_col = [col for col in df.columns if "Close" in col][0]

    capital = initial_capital
    position = 0
    entry_price = 0

    trades = []
    equity_curve = []
    stop_loss = 0.98   # -2%
    take_profit = 1.04 # +4%    
    for i in range(len(df)):
        signal = df.iloc[i]["Signal"]
        price = df.iloc[i][close_col]

        # if position > 0:
        #     if price <= entry_price * stop_loss:
        #         signal = "SELL"
        #     elif price >= entry_price * take_profit:
        #         signal = "SELL"
        #similar to maybe what hedge funds do, like very quick trade settlements
        
        # BUY
        if signal == "BUY" and position == 0:
            position = capital / price
            entry_price = price
            capital = 0

            trades.append({
                "type": "BUY",
                "price": price,
                "index": i
            })

        # SELL
        elif signal == "SELL" and position > 0:
            capital = position * price
            pnl = capital - (position * entry_price)

            trades.append({
                "type": "SELL",
                "price": price,
                "pnl": pnl,
                "index": i
            })

            position = 0
            entry_price = 0

        if position > 0:
            equity = position * price
        else:
            equity = capital

        equity_curve.append(equity)

    if position > 0:
        final_price = df.iloc[-1][close_col]
        capital = position * final_price

        trades.append({
            "type": "SELL",
            "price": final_price,
            "pnl": capital - (position * entry_price),
            "index": len(df) - 1
        })

        position = 0

    df["Equity"] = equity_curve

    return df, trades

def calculate_advanced_metrics(df):
    returns = df["Equity"].pct_change().dropna()

    # Sharpe Ratio = return I get per unit of risk
    sharpe = (returns.mean() / returns.std()) * (252 ** 0.5) if returns.std() != 0 else 0

    # Drawdown = Risk of Losing Capital
    cumulative = df["Equity"]
    peak = cumulative.cummax()
    drawdown = (cumulative - peak) / peak
    max_drawdown = drawdown.min()

    return {
        "sharpe_ratio": sharpe,
        "max_drawdown": max_drawdown
    }
    
def calculate_metrics(trades, initial_capital=100000):
    profits = [t["pnl"] for t in trades if t["type"] == "SELL"]

    total_profit = sum(profits)
    num_trades = len(profits)

    win_trades = len([p for p in profits if p > 0])
    win_rate = (win_trades / num_trades) * 100 if num_trades > 0 else 0

    return {
        "total_profit": total_profit,
        "num_trades": num_trades,
        "win_rate": win_rate
    }
