for code in ["JP", "KR", "RU", "MX"]:
    path = f"/Users/swayampadhi/.gemini/antigravity/scratch/trendscope/BDA PROJECT/data/{code}videos.csv"
    with open(path, "rb") as f:
        data = f.read()
    try:
        data.decode("utf-8")
        print(f"{code}: 100% valid UTF-8 without errors")
    except UnicodeDecodeError as e:
        print(f"{code}: Decode error at pos {e.start} / {len(data)} bytes: {e.reason}")
        # Test utf-8 with errors='replace' vs errors='ignore'
        decoded = data.decode("utf-8", errors="replace")
        replaced_count = decoded.count("\ufffd")
        print(f"  {code} with errors='replace': {replaced_count} replacement characters out of {len(decoded)} total chars ({replaced_count/len(decoded)*100:.4f}%)")
