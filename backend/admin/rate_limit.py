"""In-memory sliding window rate limiter (zero deps).

For production multi-worker, swap the storage with Redis. The interface stays the same.
"""
import os
import threading
import time
from collections import deque
from typing import Tuple

_lock = threading.Lock()
_buckets: dict[str, deque[float]] = {}

_TRUSTED_PROXIES = frozenset(
    p.strip() for p in os.getenv("TRUSTED_PROXIES", "").split(",") if p.strip()
)


def check(key: str, limit: int, window_seconds: int) -> Tuple[bool, int, int]:
    """Check if a request is allowed.

    Returns: (allowed, remaining, retry_after_seconds)
    """
    now = time.time()
    cutoff = now - window_seconds
    with _lock:
        dq = _buckets.setdefault(key, deque())
        while dq and dq[0] < cutoff:
            dq.popleft()
        if len(dq) >= limit:
            retry_after = int(dq[0] + window_seconds - now) + 1
            return False, 0, max(retry_after, 1)
        dq.append(now)
        remaining = limit - len(dq)
        return True, remaining, 0


def _peer_ip(request) -> str:
    remote = getattr(request, "remote_addr", None) or ""
    if not _TRUSTED_PROXIES:
        return remote or "unknown"
    if remote not in _TRUSTED_PROXIES:
        return remote or "unknown"
    xff = request.get_header("X-Forwarded-For", "").split(",")[0].strip()
    return xff or remote or "unknown"


def client_key(request, endpoint: str) -> str:
    return f"{_peer_ip(request)}:{endpoint}"


def client_ip(request) -> str:
    return _peer_ip(request)
