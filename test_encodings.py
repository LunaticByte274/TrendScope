import pandas as pd

enc_trials = {
    "JP": ["shift_jis", "cp932", "euc_jp", "utf-8", "latin1"],
    "KR": ["cp949", "euc_kr", "utf-8", "latin1"],
    "RU": ["cp1251", "koi8_r", "iso8859_5", "utf-8", "latin1"],
    "MX": ["latin1", "cp1252", "iso8859_1", "utf-8"]
}

for country, encodings in enc_trials.items():
    csv_path = f"/Users/swayampadhi/.gemini/antigravity/scratch/trendscope/BDA PROJECT/data/{country}videos.csv"
    print(f"\n--- Testing encodings for {country} ---")
    for enc in encodings:
        try:
            df = pd.read_csv(csv_path, encoding=enc, nrows=10)
            sample_titles = df["title"].tolist()[:3]
            print(f"  [OK] {enc}: {sample_titles}")
            break
        except Exception as e:
            print(f"  [FAIL] {enc}: {e}")
