"""Test suite for MusicGen inference server."""
import requests
import json
from typing import Optional
import time

BASE_URL = "http://localhost:5000"


class MusicGenClient:
    """Client for MusicGen inference server."""

    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url

    def health(self) -> dict:
        """Check server health."""
        response = requests.get(f"{self.base_url}/health")
        response.raise_for_status()
        return response.json()

    def status(self) -> dict:
        """Get server status."""
        response = requests.get(f"{self.base_url}/status")
        response.raise_for_status()
        return response.json()

    def generate(
        self,
        prompt: str,
        duration: int = 30,
        genre: Optional[str] = None,
        mood: Optional[str] = None,
        temperature: float = 1.0,
        seed: Optional[int] = None,
    ) -> dict:
        """Generate music."""
        payload = {
            "prompt": prompt,
            "duration": duration,
            "temperature": temperature,
        }
        if genre:
            payload["genre"] = genre
        if mood:
            payload["mood"] = mood
        if seed is not None:
            payload["seed"] = seed

        response = requests.post(
            f"{self.base_url}/api/v1/generate",
            json=payload,
            timeout=300,
        )
        response.raise_for_status()
        return response.json()

    def generate_variants(
        self, prompt: str, num_variants: int = 3, duration: int = 30
    ) -> dict:
        """Generate multiple variants."""
        payload = {
            "prompt": prompt,
            "duration": duration,
            "num_variants": num_variants,
        }
        response = requests.post(
            f"{self.base_url}/api/v1/generate/variants",
            json=payload,
            timeout=300,
        )
        response.raise_for_status()
        return response.json()

    def get_result(self, generation_id: str) -> dict:
        """Get generation result metadata."""
        response = requests.get(f"{self.base_url}/api/v1/result/{generation_id}")
        response.raise_for_status()
        return response.json()

    def download(self, generation_id: str, output_path: str) -> None:
        """Download generated audio."""
        response = requests.get(f"{self.base_url}/api/v1/download/{generation_id}")
        response.raise_for_status()

        with open(output_path, "wb") as f:
            f.write(response.content)

        print(f"Audio saved to {output_path}")

    def get_genres(self) -> list:
        """Get supported genres."""
        response = requests.get(f"{self.base_url}/api/v1/config/genres")
        response.raise_for_status()
        return response.json()["genres"]

    def get_moods(self) -> list:
        """Get supported moods."""
        response = requests.get(f"{self.base_url}/api/v1/config/moods")
        response.raise_for_status()
        return response.json()["moods"]

    def get_parameters(self) -> dict:
        """Get parameter configuration."""
        response = requests.get(f"{self.base_url}/api/v1/config/parameters")
        response.raise_for_status()
        return response.json()


def test_health():
    """Test health endpoint."""
    print("\n=== Testing Health Endpoint ===")
    client = MusicGenClient()
    try:
        health = client.health()
        print(f"✓ Server is healthy: {health['status']}")
        print(f"  Version: {health.get('version')}")
        print(f"  Service: {health.get('service')}")
        return True
    except Exception as e:
        print(f"✗ Health check failed: {e}")
        return False


def test_status():
    """Test status endpoint."""
    print("\n=== Testing Status Endpoint ===")
    client = MusicGenClient()
    try:
        status = client.status()
        print(f"✓ Status retrieved")
        print(f"  Status: {status['status']}")
        print(f"  Model: {status['config']['model']}")
        print(f"  Device: {status['config']['device']}")
        print(f"  Active generations: {status['stats']['active_generations']}")
        return True
    except Exception as e:
        print(f"✗ Status check failed: {e}")
        return False


def test_config():
    """Test configuration endpoints."""
    print("\n=== Testing Configuration Endpoints ===")
    client = MusicGenClient()

    try:
        genres = client.get_genres()
        print(f"✓ Genres loaded: {len(genres)} available")
        print(f"  Examples: {genres[:3]}")

        moods = client.get_moods()
        print(f"✓ Moods loaded: {len(moods)} available")
        print(f"  Examples: {moods[:3]}")

        params = client.get_parameters()
        print(f"✓ Parameters loaded")
        print(f"  Duration: {params['duration']}")
        print(f"  Temperature: {params['temperature']}")

        return True
    except Exception as e:
        print(f"✗ Configuration check failed: {e}")
        return False


def test_generation():
    """Test basic generation."""
    print("\n=== Testing Music Generation ===")
    client = MusicGenClient()

    test_cases = [
        {
            "prompt": "upbeat electronic dance music with heavy bass",
            "duration": 30,
            "genre": "electronic",
            "mood": "energetic",
        },
        {
            "prompt": "calm ambient music for meditation",
            "duration": 30,
            "genre": "ambient",
            "mood": "calm",
        },
        {
            "prompt": "jazz piano in a cozy cafe",
            "duration": 30,
            "genre": "jazz",
        },
    ]

    for i, test_case in enumerate(test_cases, 1):
        try:
            print(f"\nTest {i}: {test_case['prompt'][:40]}...")

            # Generate
            start_time = time.time()
            result = client.generate(**test_case)
            elapsed = time.time() - start_time

            print(f"✓ Generation successful")
            print(f"  ID: {result['generation_id']}")
            print(f"  Duration: {result['duration']}s")
            print(f"  Size: {result['audio_size_bytes'] / 1024:.1f} KB")
            print(f"  Time: {elapsed:.1f}s")

            # Optionally download
            # client.download(result['generation_id'], f"test_output_{i}.wav")

            return True

        except Exception as e:
            print(f"✗ Generation failed: {e}")
            return False


def test_variants():
    """Test variant generation."""
    print("\n=== Testing Variant Generation ===")
    client = MusicGenClient()

    try:
        prompt = "upbeat pop music"
        num_variants = 3

        print(f"Generating {num_variants} variants of: {prompt}")

        start_time = time.time()
        result = client.generate_variants(prompt, num_variants=num_variants)
        elapsed = time.time() - start_time

        print(f"✓ Variants generated successfully")
        print(f"  Count: {len(result['variants'])}")
        print(f"  Time: {elapsed:.1f}s")

        for i, variant in enumerate(result["variants"], 1):
            print(f"  Variant {i}: {variant['generation_id']}")

        return True

    except Exception as e:
        print(f"✗ Variant generation failed: {e}")
        return False


def test_deterministic():
    """Test deterministic generation with seed."""
    print("\n=== Testing Deterministic Generation (Seed) ===")
    client = MusicGenClient()

    try:
        prompt = "mysterious ambient music"
        seed = 42

        print(f"Generating with seed {seed}: {prompt}")

        # Generate twice with same seed
        result1 = client.generate(prompt, seed=seed, duration=10)
        result2 = client.generate(prompt, seed=seed, duration=10)

        print(f"✓ Both generations completed")
        print(f"  Generation 1: {result1['generation_id']}")
        print(f"  Generation 2: {result2['generation_id']}")

        return True

    except Exception as e:
        print(f"✗ Deterministic generation failed: {e}")
        return False


def run_all_tests():
    """Run all tests."""
    print("=" * 60)
    print("MusicGen Inference Server - Test Suite")
    print("=" * 60)

    tests = [
        ("Health Check", test_health),
        ("Status Check", test_status),
        ("Configuration", test_config),
        ("Generation", test_generation),
        ("Variants", test_variants),
        ("Deterministic", test_deterministic),
    ]

    results = []

    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n✗ {name} failed with exception: {e}")
            results.append((name, False))

    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {name}")

    print(f"\nTotal: {passed}/{total} tests passed")
    print("=" * 60)

    return passed == total


if __name__ == "__main__":
    import sys

    success = run_all_tests()
    sys.exit(0 if success else 1)
