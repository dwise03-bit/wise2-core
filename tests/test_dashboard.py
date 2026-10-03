import importlib.util
import tempfile
import threading
import unittest
from pathlib import Path
from unittest.mock import patch

BASE = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('cc_server', BASE / 'command-center/server.py')
server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)

class ServerTests(unittest.TestCase):
    def handler(self,path):
        handler=object.__new__(server.Handler);handler.path=path;handler.command='GET'
        self.responses=[]
        handler._send=lambda code,body,ctype:self.responses.append((code,body,ctype))
        return handler

    def test_health_endpoint_does_not_run_collectors(self):
        with patch.object(server.CACHE,'get',side_effect=AssertionError('health must be cheap')):
            self.handler('/healthz').do_GET()
        self.assertEqual(self.responses[0][0],200)

    def test_static_traversal_and_prefix_sibling_blocked(self):
        with tempfile.TemporaryDirectory() as name:
            root=Path(name);public=root/'public';public.mkdir()
            sibling=root/'public-extra';sibling.mkdir();(sibling/'private.txt').write_text('fixture')
            with patch.object(server,'PUBLIC',public):
                for route in ('/../public-extra/private.txt','/%2e%2e/public-extra/private.txt'):
                    self.handler(route).do_GET();self.assertEqual(self.responses[0][0],404)

    def test_cache_coalesces_polls_and_marks_stale(self):
        entered,release=threading.Event(),threading.Event();calls=[]
        def collect():
            calls.append(1);entered.set();release.wait(2);return {'observed_at':'fixture'}
        clock=[0];cache=server.StatusCache(collector=collect,clock=lambda:clock[0])
        self.assertEqual(cache.get()['collection_state'],'COLLECTING');self.assertTrue(entered.wait(1))
        for _ in range(10):cache.get()
        self.assertEqual(len(calls),1)
        release.set()
        # Wait on the same synchronization lock, bounded by a short deadline.
        import time
        deadline=time.monotonic()+2
        while cache.running and time.monotonic()<deadline:time.sleep(.01)
        self.assertEqual(cache.get()['collection_state'],'LIVE')
        clock[0]=40
        cache.running=True  # refresh in progress cannot make old data live
        self.assertEqual(cache.get()['collection_state'],'STALE')
