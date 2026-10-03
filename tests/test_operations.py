"""Failure-path regression tests; no daemon, network or scan required."""
import hashlib
import importlib.util
import io
import json
import os
import subprocess
import tarfile
import tempfile
import threading
import unittest
from pathlib import Path
from unittest.mock import patch

from core import backup, runtime, hermes

BASE = Path(__file__).resolve().parents[1]



class RuntimeTests(unittest.TestCase):
    def test_dynamic_touch_is_exact(self):
        with patch.object(runtime, 'run', return_value=runtime.Result(0, 'iptsd@dev-hidraw9.service loaded active running Touch')):
            self.assertEqual(runtime.touch_state(), 'ONLINE')
        with patch.object(runtime, 'run', return_value=runtime.Result(0, 'iptsd@dev-hidraw9.service loaded inactive dead Touch')):
            self.assertEqual(runtime.touch_state(), 'OFFLINE')

    def test_observation_denied_is_not_inactive(self):
        process = subprocess.CompletedProcess([], 1, '', 'Failed to connect to bus: Operation not permitted')
        with patch('subprocess.run', return_value=process):
            self.assertIsNone(runtime.run(['systemctl', 'is-active', 'ssh']).code)
            self.assertEqual(runtime.unit('ssh'), 'UNKNOWN')
            self.assertEqual(runtime.touch_state(), 'UNKNOWN')
            self.assertIsNone(runtime.socket_inventory())

    def test_socket_addresses_ipv4_ipv6(self):
        text = 'LISTEN 0 5 127.0.0.1:3010 0.0.0.0:*\nLISTEN 0 5 [::]:8080 [::]:*'
        with patch.object(runtime, 'run', return_value=runtime.Result(0, text)):
            self.assertEqual(runtime.socket_inventory(), [('127.0.0.1', 3010), ('::', 8080)])

    def test_doctor_unavailable_observations_cannot_pass(self):
        with patch.object(runtime, 'run', return_value=runtime.Result(None, reason='observation denied')), \
             patch.object(runtime, 'socket_inventory', return_value=None), \
             patch.object(runtime, 'gate_check', return_value=runtime.Result(0)), \
             patch.object(hermes, 'probe', return_value={'state': 'NOT CONFIGURED'}), \
             patch.object(backup, 'latest_verification', return_value={'state': 'PASS', 'detail': ''}):
            d = runtime.doctor()
        for c in d['checks']:
            if c['label'].startswith(('Service:', 'TCP exposure', 'Network', 'DNS', 'Tool executes:')):
                self.assertEqual(c['state'], 'WARN', c)
        self.assertNotEqual(d['exit_code'], 0)

    def test_stopped_command_center_is_counted_failure(self):
        states = {k: 'ONLINE' for k in ('ssh','tailscale','docker','touch')}
        states['command_center'] = 'OFFLINE'
        with patch.object(runtime, 'services', return_value=states), \
             patch.object(runtime, 'cc_http', return_value='OFFLINE'), \
             patch.object(runtime, 'run', return_value=runtime.Result(0, 'ok')), \
             patch.object(runtime, 'tailscale', return_value={'state':'ONLINE'}), \
             patch.object(runtime, 'socket_inventory', return_value=[]), \
             patch.object(runtime, 'gate_check', return_value=runtime.Result(0)), \
             patch.object(hermes, 'probe', return_value={'state':'NOT CONFIGURED'}), \
             patch.object(backup, 'latest_verification', return_value={'state':'PASS','detail':''}):
            d = runtime.doctor()
        self.assertEqual(d['exit_code'],1)
        self.assertGreaterEqual(d['counts']['FAIL'], 3)

    def test_shannon_status_never_invokes_npx(self):
        with patch.object(runtime, 'run', side_effect=AssertionError('must not run a launcher')):
            d = runtime.shannon()
        self.assertEqual(d['engagement_state'], 'UNKNOWN')
        self.assertEqual(d['authorization'], 'NOT AUTHORIZED')

    def test_gate_denial_has_no_engagement_side_effect(self):
        with patch.object(runtime, 'ROOT', BASE):
            self.assertTrue(runtime.gate_check().ok)

    def test_remote_registry_has_no_invented_telemetry(self):
        registry={'schema_version':1,'devices':[{'id':'remote','hostname':'remote','display_name':'Remote',
            'registration':'REGISTERED','role':'NODE','os':'WISE² Linux','tailscale_node_id':'node-123'}]}
        with patch.object(runtime, 'read_registry', return_value=registry):
            d = runtime.devices({'state':'UNKNOWN','ip':None,'peers':{}},{})['devices'][0]
            self.assertEqual(d['online_state'],'UNKNOWN')
            self.assertIsNone(d['last_seen']);self.assertIsNone(d['cpu']);self.assertIsNone(d['services'])
            peer={'ID':'node-123','Online':True,'LastSeen':'2026-10-03T00:00:00Z'}
            d=runtime.devices({'state':'ONLINE','ip':None,'peers':{'peer':peer}},{})['devices'][0]
            self.assertEqual(d['online_state'],'ONLINE')
            self.assertIsNone(d['agent_version']);self.assertIsNone(d['cpu'])

    def test_healthy_complete_doctor_returns_zero(self):
        with tempfile.TemporaryDirectory() as name:
            root=Path(name)
            for source in ('context/WISE2.md','scripts/wise2','command-center/server.py','core/runtime.py'):
                path=root/source;path.parent.mkdir(parents=True,exist_ok=True);path.write_text('fixture')
            for directory in ('engagements','targets','configs','reports','evidence','logs'):
                (root/'security'/directory).mkdir(parents=True)
            with patch.object(runtime,'ROOT',root), \
                 patch.object(runtime,'os_release',return_value={'ID':'ubuntu','VERSION_ID':'24.04','NAME':'WISE² Linux'}), \
                 patch.object(runtime,'run',return_value=runtime.Result(0,'functional')), \
                 patch.object(runtime,'services',return_value={k:'ONLINE' for k in ('ssh','tailscale','docker','touch','command_center')}), \
                 patch.object(runtime,'tailscale',return_value={'state':'ONLINE'}), \
                 patch.object(runtime,'socket_inventory',return_value=[('127.0.0.1',3010),('0.0.0.0',22),('127.0.0.53',53)]), \
                 patch.object(runtime,'cc_http',return_value='ONLINE'), \
                 patch.object(runtime,'shannon',return_value={'launcher':True,'cached_version':'fixture'}), \
                 patch.object(runtime,'gate_check',return_value=runtime.Result(0)), \
                 patch.object(runtime,'read_registry',return_value={'schema_version':1,'devices':[]}), \
                 patch.object(runtime,'memory',return_value={'total_gib':16,'avail_gib':8}), \
                 patch.object(runtime,'disk',return_value={'free_gb':200,'used_pct':10}), \
                 patch.object(hermes,'probe',return_value={'state':'NOT CONFIGURED'}), \
                 patch.object(backup,'latest_verification',return_value={'state':'PASS','detail':''}):
                result=runtime.doctor()
            self.assertEqual(result['exit_code'],0)
            self.assertEqual(result['counts']['WARN'],0)
            self.assertEqual(result['counts']['FAIL'],0)



class BackupTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name)
        (self.root/'docs').mkdir();(self.root/'docs/hello.md').write_text('operator documentation')

    def tearDown(self):
        self.temp.cleanup()

    def test_round_trip_excludes_env_evidence_and_credentials(self):
        (self.root/'docs/.env.production').write_text('PASSWORD=sentinel')
        (self.root/'docs/token.json').write_text('sentinel')
        (self.root/'security/evidence').mkdir(parents=True)
        (self.root/'security/evidence/report.md').write_text('sentinel')
        (self.root/'hermes/config').mkdir(parents=True)
        (self.root/'hermes/config/hermes.conf').write_text('SECRET=sentinel')
        out=backup.create(self.root)
        self.assertTrue(backup.verify(out)['valid'])
        self.assertEqual(out.stat().st_mode & 0o777,0o600)
        with tarfile.open(out) as tar:
            self.assertEqual(set(tar.getnames()),{'docs/hello.md','WISE2-BACKUP-MANIFEST.json'})
        self.assertEqual(backup.audit_events(self.root)[0]['action'],'backup_create')

    def test_corruption_fails(self):
        out=backup.create(self.root)
        out.write_bytes(out.read_bytes()[:30])
        self.assertFalse(backup.verify(out)['valid'])
        self.assertEqual(backup.latest_verification(self.root)['state'],'FAIL')

    def test_manifest_checksum_mismatch_fails(self):
        out=self.root/'bad.tar.gz'
        with tarfile.open(out,'w:gz') as tar:
            backup._add(tar,'docs/hello.md',b'changed')
            backup._add(tar,'WISE2-BACKUP-MANIFEST.json',json.dumps({'format':1,'files':{'docs/hello.md':{'sha256':'bad','size':7}}}).encode())
        self.assertFalse(backup.verify(out)['valid'])

    def test_traversal_and_symlink_members_rejected_without_extraction(self):
        for name,kind in (('../outside',tarfile.REGTYPE),('docs/link.md',tarfile.SYMTYPE)):
            out=self.root/'bad.tar.gz'
            with tarfile.open(out,'w:gz') as tar:
                entry=tarfile.TarInfo(name);entry.type=kind;entry.linkname='/etc/passwd'
                tar.addfile(entry)
            self.assertFalse(backup.verify(out)['valid'])
        self.assertFalse((self.root.parent/'outside').exists())

    def test_creation_error_never_publishes_archive(self):
        with patch.object(backup,'payloads',side_effect=OSError('simulated read failure')):
            with self.assertRaises(OSError):backup.create(self.root)
        self.assertEqual(list((self.root/'backups').iterdir()),[])

    def test_symlink_source_is_not_archived(self):
        (self.root/'docs/linked.md').symlink_to('/etc/os-release')
        with self.assertRaises(ValueError):backup.create(self.root)
        self.assertEqual(list((self.root/'backups').iterdir()),[])

    def test_known_private_key_marker_refused(self):
        (self.root/'docs/accidental.md').write_text('-----BEGIN PRIVATE KEY-----\nfixture\n')
        with self.assertRaises(ValueError):backup.create(self.root)

    def test_structured_secret_metadata_is_refused(self):
        (self.root/'docs/settings.json').write_text('{"nested":{"password":"fixture-secret"}}')
        with self.assertRaises(ValueError):backup.create(self.root)
        self.assertEqual(list((self.root/'backups').iterdir()),[])

    def test_legacy_backup_never_passes_manifest_verification(self):
        out=self.root/'legacy.tar.gz'
        with tarfile.open(out,'w:gz') as tar:backup._add(tar,'docs/hello.md',b'hello')
        self.assertFalse(backup.verify(out)['valid'])

    def test_audit_rotation_and_enum_only_logging(self):
        backup.log_event(self.root,'doctor','PASS')
        path=self.root/'logs/operations.jsonl';path.write_text(' ' * (1024*1024))
        backup.log_event(self.root,'backup_verify','FAIL')
        self.assertTrue((self.root/'logs/operations.jsonl.1').exists())
        self.assertEqual(backup.audit_events(self.root)[0]['outcome'],'FAIL')
        with self.assertRaises(ValueError):backup.log_event(self.root,'Authorization: fixture','PASS')


class HermesTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name)
        (self.root/'hermes/config').mkdir(parents=True)
        self.conf=self.root/'hermes/config/hermes.conf'
        self.token=self.root/'device-token';self.token.write_text('fixture-token');self.token.chmod(0o600)
        self.conf.write_text(f'HERMES_ENABLED=true\nHERMES_BASE_URL="http://100.64.0.1"\nHERMES_CREDENTIAL_FILE="{self.token}"\n')

    def tearDown(self):self.temp.cleanup()

    def test_disabled_makes_no_request(self):
        self.conf.write_text('HERMES_ENABLED=false\n')
        with patch.object(hermes,'get',side_effect=AssertionError('disabled client must not call network')):
            self.assertEqual(hermes.probe(self.root)['state'],'NOT CONFIGURED')

    def test_configuration_is_not_executed(self):
        marker=self.root/'executed'
        self.conf.write_text(f'HERMES_ENABLED=$(touch {marker})\n')
        self.assertEqual(hermes.probe(self.root)['state'],'ERROR')
        self.assertFalse(marker.exists())

    def test_credential_never_appears_in_result(self):
        with patch.object(hermes,'get',side_effect=[(200,{'mongo':'connected'}),(200,{'ok':True})]):
            state=hermes.probe(self.root)
        self.assertTrue(state['ready'])
        self.assertNotIn('fixture-token',json.dumps(state))

    def test_html_http_200_is_not_authentication(self):
        with patch.object(hermes,'get',side_effect=[(200,{'mongo':'connected'}),(200,None)]):
            state=hermes.probe(self.root)
        self.assertFalse(state['authenticated']);self.assertFalse(state['memory']);self.assertFalse(state['ready'])

    def test_nonprivate_credential_is_not_used(self):
        self.token.chmod(0o644)
        with patch.object(hermes,'get',side_effect=AssertionError('must not send unsafe credential')):
            self.assertFalse(hermes.probe(self.root)['configured'])

    def test_redirect_cannot_forward_token(self):
        handler=hermes.NoRedirect()
        self.assertIsNone(handler.redirect_request(None,None,302,'redirect',{},'https://outside.invalid'))




if __name__=='__main__':unittest.main()
