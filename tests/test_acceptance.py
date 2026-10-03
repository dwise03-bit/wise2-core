import contextlib
import importlib.util
import io
import unittest
from importlib.machinery import SourceFileLoader
from pathlib import Path
from unittest.mock import patch
from core.runtime import Result

source=Path(__file__).resolve().parents[1]/'scripts/wise2-acceptance'
spec=importlib.util.spec_from_loader('acceptance',SourceFileLoader('acceptance',str(source)))
acceptance=importlib.util.module_from_spec(spec);spec.loader.exec_module(acceptance)


class RecoveryTests(unittest.TestCase):
    def test_validated_automatic_restart(self):
        responses=[Result(0,'on-failure'),Result(0,'4'),Result(0),Result(0,'5')]
        with contextlib.redirect_stdout(io.StringIO()), \
             patch.object(acceptance.runtime,'run',side_effect=responses), \
             patch.object(acceptance,'wait_healthy',return_value=True), \
             patch.object(acceptance.backup,'log_event') as audit:
            self.assertTrue(acceptance.recovery())
        self.assertEqual(audit.call_args.args[-1],'PASS')

    def test_manual_start_never_hides_failed_automatic_recovery(self):
        responses=[Result(0,'on-failure'),Result(0,'4'),Result(0),Result(0,'4'),Result(0)]
        with contextlib.redirect_stdout(io.StringIO()), \
             patch.object(acceptance.runtime,'run',side_effect=responses), \
             patch.object(acceptance,'wait_healthy',return_value=True), \
             patch.object(acceptance.backup,'log_event') as audit:
            self.assertFalse(acceptance.recovery())
        self.assertEqual(audit.call_args.args[-1],'FAIL')

    def test_unavailable_preconditions_do_not_kill(self):
        with contextlib.redirect_stdout(io.StringIO()), \
             patch.object(acceptance.runtime,'run',return_value=Result(None,reason='observation denied')) as calls:
            self.assertFalse(acceptance.recovery())
        self.assertFalse(any('kill' in call.args[0] for call in calls.call_args_list))
