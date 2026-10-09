from decimal import Decimal, ROUND_HALF_UP

CURRENCY_BY_COUNTRY = {
    "India": {"currency": "INR", "symbol": "₹", "rate": Decimal("83.0")},
    "United Kingdom": {"currency": "GBP", "symbol": "£", "rate": Decimal("0.78")},
    "United States": {"currency": "USD", "symbol": "$", "rate": Decimal("1.0")},
    "European Union": {"currency": "EUR", "symbol": "€", "rate": Decimal("0.93")},
    "Australia": {"currency": "AUD", "symbol": "A$", "rate": Decimal("1.51")},
    "Canada": {"currency": "CAD", "symbol": "C$", "rate": Decimal("1.36")},
    "Japan": {"currency": "JPY", "symbol": "¥", "rate": Decimal("157.0")},
}


def get_country_currency(country: str | None):
    normalized = (country or "United States").strip()
    return CURRENCY_BY_COUNTRY.get(normalized, CURRENCY_BY_COUNTRY["United States"])


def convert_to_local_price(base_amount_usd: float | int | Decimal, country: str | None) -> int:
    base = Decimal(str(base_amount_usd))
    config = get_country_currency(country)
    converted = (base * config["rate"]).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
    return int(converted)


def get_local_price_display(base_amount_usd: float | int | Decimal, country: str | None) -> str:
    value = convert_to_local_price(base_amount_usd, country)
    config = get_country_currency(country)
    return f"{config['symbol']}{value:,.0f}"
