#!/usr/bin/env python3

"""
DFRAS Sample Aggregator (Enhanced)

Purpose:
- Provide a lightweight, local CLI to aggregate delivery outcomes from
  third-assignment-sample-data-set and correlate with external factors.
- Support single-query and batch modes (25 preset scenarios) for demo/testing.

Key Features:
- Time and location filters
- Failure reason frequency and success rate
- External factor correlation (weather/traffic)
- Per-condition failure-rate estimates (by weather/traffic)
- Optional JSON export for downstream analysis

Usage (single run):
  python sample_aggregator.py \
    --data-dir /Users/opachoriya/Project/AI_Assignments/Assignment_3/third-assignment-sample-data-set \
    --scope "last month" --location "California" --export-json out.json

Usage (batch 25 scenarios):
  python sample_aggregator.py --data-dir ... --batch-examples --export-json batch_out.json
"""

import argparse
import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Tuple

import pandas as pd


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="DFRAS Sample Aggregator (Enhanced)")
    parser.add_argument(
        "--data-dir",
        default="/Users/opachoriya/Project/AI_Assignments/Assignment_3/third-assignment-sample-data-set",
        help="Path to third-assignment-sample-data-set directory",
    )
    parser.add_argument("--scope", default="all", help="'all' | 'yesterday' | 'last week' | 'last month'")
    parser.add_argument("--location", default="", help="Substring for city/state filter (e.g., 'California')")
    parser.add_argument("--export-json", default="", help="Optional path to export JSON results")
    parser.add_argument("--batch-examples", action="store_true", help="Run 25 preset scenarios")
    return parser.parse_args()


def load_csv(data_dir: str, name: str) -> pd.DataFrame:
    path = os.path.join(data_dir, f"{name}.csv")
    if not os.path.exists(path):
        return pd.DataFrame()
    return pd.read_csv(path)


def apply_time_filter(df: pd.DataFrame, column: str, scope: str) -> pd.DataFrame:
    if df.empty or column not in df.columns:
        return df
    ser = pd.to_datetime(df[column], errors="coerce")
    now = datetime.now()
    if scope.lower() == "yesterday":
        start = (now - timedelta(days=1)).date()
        mask = ser.dt.date == start
    elif scope.lower() == "last week":
        start = now - timedelta(weeks=1)
        mask = ser >= start
    elif scope.lower() == "last month":
        start = now - timedelta(days=30)
        mask = ser >= start
    else:
        return df
    return df[mask]


def filter_location(df: pd.DataFrame, location: str, city_col: str, state_col: str) -> pd.DataFrame:
    if not location or df.empty:
        return df
    mask = False
    if city_col in df.columns:
        mask = df[city_col].astype(str).str.contains(location, case=False, na=False)
    if state_col in df.columns:
        st_mask = df[state_col].astype(str).str.contains(location, case=False, na=False)
        mask = mask | st_mask if isinstance(mask, pd.Series) else st_mask
    return df[mask] if isinstance(mask, pd.Series) else df


def _safe_to_datetime(series: pd.Series) -> pd.Series:
    return pd.to_datetime(series, errors="coerce") if series is not None else series


def compute_condition_failure_rates(orders: pd.DataFrame, external: pd.DataFrame) -> Dict[str, Dict[str, float]]:
    """Estimate failure rate per weather/traffic condition by day-city join."""
    if orders.empty or external.empty:
        return {"weather": {}, "traffic": {}}

    orders = orders.copy()
    external = external.copy()
    if "order_date" in orders.columns:
        orders["_order_day"] = _safe_to_datetime(orders["order_date"]).dt.date
    else:
        return {"weather": {}, "traffic": {}}

    if "recorded_at" in external.columns:
        external["_record_day"] = _safe_to_datetime(external["recorded_at"]).dt.date
    else:
        return {"weather": {}, "traffic": {}}

    join_cols: List[str] = []
    for c in ("city", "state"):
        if c in orders.columns and c in external.columns:
            join_cols.append(c)
    if not join_cols:
        return {"weather": {}, "traffic": {}}

    merged = orders.merge(
        external[[*join_cols, "_record_day", "weather_condition", "traffic_condition"]].copy(),
        left_on=[*join_cols, "_order_day"],
        right_on=[*join_cols, "_record_day"],
        how="left",
    )

    def _rate(group: pd.DataFrame, col: str) -> Dict[str, float]:
        counts = group[col].fillna("Unknown").astype(str).value_counts()
        out: Dict[str, float] = {}
        total = len(group)
        if total == 0:
            return out
        failed = group["status"].astype(str).str.lower().eq("failed") if "status" in group.columns else pd.Series([False] * total, index=group.index)
        # compute failure rate per condition value
        for cond, _ in counts.items():
            cond_mask = group[col].fillna("Unknown").astype(str).eq(cond)
            denom = cond_mask.sum()
            if denom == 0:
                continue
            num = (failed & cond_mask).sum()
            out[str(cond)] = round((num / denom) * 100, 2)
        return out

    weather_rates = _rate(merged, "weather_condition") if "weather_condition" in merged.columns else {}
    traffic_rates = _rate(merged, "traffic_condition") if "traffic_condition" in merged.columns else {}
    return {"weather": weather_rates, "traffic": traffic_rates}


def summarize(data_dir: str, scope: str, location: str) -> Dict[str, Any]:
    orders = load_csv(data_dir, "orders")
    fleet_logs = load_csv(data_dir, "fleet_logs")
    external = load_csv(data_dir, "external_factors")

    # Time filters
    orders = apply_time_filter(orders, "order_date", scope)
    fleet_logs = apply_time_filter(fleet_logs, "departure_time", scope)
    external = apply_time_filter(external, "recorded_at", scope)

    # Location filters
    orders = filter_location(orders, location, "city", "state")
    external = filter_location(external, location, "city", "state")

    total_orders = len(orders)
    failed_orders = 0
    if "status" in orders.columns:
        failed_orders = (orders["status"].astype(str).str.lower() == "failed").sum()

    top_failures: Dict[str, int] = {}
    if "failure_reason" in orders.columns and not orders.empty:
        top_failures = orders["failure_reason"].dropna().astype(str).str.strip().value_counts().head(5).to_dict()

    weather_counts: Dict[str, int] = {}
    if "weather_condition" in external.columns and not external.empty:
        weather_counts = external["weather_condition"].dropna().astype(str).str.strip().value_counts().head(5).to_dict()

    traffic_counts: Dict[str, int] = {}
    if "traffic_condition" in external.columns and not external.empty:
        traffic_counts = external["traffic_condition"].dropna().astype(str).str.strip().value_counts().head(5).to_dict()

    correlation_sample: Optional[List[Dict[str, Any]]] = None
    if not orders.empty and not external.empty and "failure_reason" in orders.columns:
        try:
            merged = orders.merge(
                external[[c for c in ["city", "state", "weather_condition", "traffic_condition", "recorded_at"] if c in external.columns]],
                on=[c for c in ["city", "state"] if c in orders.columns and c in external.columns],
                how="inner",
            )
            failed_subset = merged[merged["status"].astype(str).str.lower() == "failed"] if "status" in merged.columns else merged
            correlation_sample = failed_subset.head(5).to_dict("records")
        except Exception:
            correlation_sample = None

    success_rate = round(((total_orders - failed_orders) / total_orders) * 100, 2) if total_orders else 0.0
    condition_failure_rates = compute_condition_failure_rates(orders, external)

    return {
        "filters": {"scope": scope, "location": location},
        "totals": {"orders": total_orders, "failed": failed_orders, "success_rate_percent": success_rate},
        "top_failure_reasons": top_failures,
        "external_factors": {"weather": weather_counts, "traffic": traffic_counts},
        "condition_failure_rates": condition_failure_rates,
        "correlation_sample": correlation_sample,
    }


def preset_scenarios() -> List[Tuple[str, str]]:
    """Return 25 (scope, location) presets for quick demos - Indian cities/states only."""
    return [
        ("last month", "Maharashtra"),
        ("last month", "Karnataka"),
        ("last month", "Delhi"),
        ("last week", "Mumbai"),
        ("last week", "Bengaluru"),
        ("last week", "Chennai"),
        ("last week", "Pune"),
        ("yesterday", "Ahmedabad"),
        ("yesterday", "Surat"),
        ("yesterday", "Nagpur"),
        ("last month", "Gujarat"),
        ("last month", "Tamil Nadu"),
        ("last week", "Coimbatore"),
        ("last week", "Mysuru"),
        ("last week", "New Delhi"),
        ("last month", "MH"),
        ("last month", "KA"),
        ("last week", "GJ"),
        ("yesterday", "TN"),
        ("last month", "Pune"),
        ("last week", "Ahmedabad"),
        ("last week", "Surat"),
        ("yesterday", "Nagpur"),
        ("yesterday", "Coimbatore"),
        ("all", "Maharashtra"),
    ]


def main() -> None:
    args = parse_args()
    results: Dict[str, Any] = {}

    if args.batch_examples:
        batch_out: List[Dict[str, Any]] = []
        for scope, location in preset_scenarios():
            summary = summarize(args.data_dir, scope, location)
            batch_out.append(summary)
            print(f"=== {scope} | {location} ===")
            print(f"Totals: {summary['totals']}")
            print(f"Top Failure Reasons: {summary['top_failure_reasons']}")
            print(f"Weather: {summary['external_factors']['weather']} | Traffic: {summary['external_factors']['traffic']}")
            print(f"Condition Failure Rates: {summary['condition_failure_rates']}")
            print("---")
        results = {"batch": batch_out}
    else:
        summary = summarize(args.data_dir, args.scope, args.location)
        results = {"single": summary}
        # Pretty print
        pd.set_option("display.max_colwidth", 120)
        print("=== DFRAS Sample Aggregation Summary ===")
        print(f"Filters: {summary['filters']}")
        print(f"Totals:  {summary['totals']}")
        print(f"Top Failure Reasons: {summary['top_failure_reasons']}")
        print(f"External Factors (Weather): {summary['external_factors']['weather']}")
        print(f"External Factors (Traffic): {summary['external_factors']['traffic']}")
        print(f"Condition Failure Rates: {summary['condition_failure_rates']}")
        if summary.get("correlation_sample"):
            print("\nSample Correlated Records (failed orders with external factors):")
            corr_df = pd.DataFrame(summary["correlation_sample"]).head(5)
            print(corr_df)

    if args.export_json:
        with open(args.export_json, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2, default=str)
        print(f"\nExported results to {args.export_json}")


if __name__ == "__main__":
    main()


