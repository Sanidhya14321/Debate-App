# ml_api/ml_judge.py
import numpy as np
from transformers import pipeline
from sentence_transformers import SentenceTransformer, util
import math
import threading

class DebateJudge:
    def __init__(self, device=None):
        """
        device: if you pass 'cuda' the sentence-transformers will try to use GPU
        """
        self.device = device
        self._init_lock = threading.Lock()
        self._initialized = False

    def init_models(self):
        with self._init_lock:
            if self._initialized:
                return
            # sentiment (distilbert or roberta) - small and effective
            self.sentiment_analyzer = pipeline("sentiment-analysis")
            # embedder
            self.embedder = SentenceTransformer("all-MiniLM-L6-v2")
            self._initialized = True

    def score_argument(self, text: str) -> dict:
        if not self._initialized:
            self.init_models()
        text = text or ""
        if not text.strip():
            return {"sentiment": 0.0, "clarity": 0.0, "vocab_richness": 0.0, "avg_word_len": 0.0, "length": 0}

        # Sentiment
        try:
            r = self.sentiment_analyzer(text[:512])[0]
            sentiment_score = r["score"] if r["label"] == "POSITIVE" else -r["score"]
        except Exception:
            sentiment_score = 0.0

        # Clarity: filler words + avg words per sentence
        filler = ["um", "uh", "like", "you know", "basically", "so"]
        lower = text.lower()
        filler_count = sum(lower.count(f) for f in filler)
        words = text.split()
        length = len(words)
        sentences = [s for s in text.replace("?", ".").replace("!", ".").split(".") if s.strip()]
        avg_wps = length / max(1, len(sentences))
        clarity = 1.0 - min(1.0, filler_count / max(1, length))
        if avg_wps > 30:
            clarity *= 0.6
        clarity = max(0.0, min(1.0, clarity))

        # vocab richness
        vocab_richness = len(set([w.lower() for w in words])) / max(1, length)

        avg_word_len = float(np.mean([len(w) for w in words])) if words else 0.0

        return {
            "sentiment": round(float(sentiment_score), 3),
            "clarity": round(float(clarity), 3),
            "vocab_richness": round(float(vocab_richness), 3),
            "avg_word_len": round(float(avg_word_len), 3),
            "length": length
        }

    def compare_arguments(self, args_a, args_b) -> float:
        if not self._initialized:
            self.init_models()
        text_a = " ".join(args_a)
        text_b = " ".join(args_b)
        if not text_a.strip() or not text_b.strip():
            return 0.0
        emb_a = self.embedder.encode(text_a, convert_to_tensor=True)
        emb_b = self.embedder.encode(text_b, convert_to_tensor=True)
        sim = util.cos_sim(emb_a, emb_b).item()
        return float(round(sim, 3))

    def evaluate(self, args_a, args_b) -> dict:
        if not self._initialized:
            self.init_models()
        scores_a = [self.score_argument(a) for a in args_a]
        scores_b = [self.score_argument(b) for b in args_b]
        metrics = ["sentiment", "clarity", "vocab_richness", "avg_word_len", "length"]
        avg_a = {k: float(np.mean([s[k] for s in scores_a])) if scores_a else 0.0 for k in metrics}
        avg_b = {k: float(np.mean([s[k] for s in scores_b])) if scores_b else 0.0 for k in metrics}
        coherence = self.compare_arguments(args_a, args_b)

        def total_score(avg):
            return (0.3 * avg["clarity"] +
                    0.3 * avg["sentiment"] +
                    0.2 * avg["vocab_richness"] +
                    0.1 * avg["avg_word_len"] +
                    0.1 * coherence)

        total_a = total_score(avg_a)
        total_b = total_score(avg_b)
        winner = "A" if total_a >= total_b else "B"

        return {
            "scores": {"A": avg_a, "B": avg_b},
            "coherence": round(float(coherence), 3),
            "totals": {"A": round(total_a, 3), "B": round(total_b, 3)},
            "winner": winner
        }
