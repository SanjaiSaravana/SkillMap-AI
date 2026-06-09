def require_fields(data: dict, fields: list[str]):
    missing = [f for f in fields if not (data.get(f) is not None and str(data.get(f)).strip() != "")]
    return missing
