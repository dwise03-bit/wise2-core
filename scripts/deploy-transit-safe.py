#!/usr/bin/env python3
"""Deploy WISE2 Transit image while preserving the current container environment; roll back on failed HTTP checks."""
import json,os,subprocess,tempfile,time,urllib.request
OLD='wise2-website'
NEXT='wise2-website-next'
BACK='wise2-website-rollback-20261010'
IMAGE='wise2-core-website:transit-20261010'
def cmd(*args):
    return subprocess.check_output(['docker',*args],stderr=subprocess.STDOUT,text=True).strip()
def status(url):
    try:
        with urllib.request.urlopen(url,timeout=8) as r:
            return r.status,r.read(150000).decode('utf-8','replace')
    except Exception:
        return 0,''
info=json.loads(cmd('inspect',OLD))[0]
if cmd('ps','--filter','name=^/'+NEXT+'$','--format','{{.Names}}'):
    raise SystemExit('Next container already exists; refusing to overwrite')
if cmd('ps','-a','--filter','name=^/'+BACK+'$','--format','{{.Names}}'):
    raise SystemExit('Rollback container name already exists; refusing to overwrite')
fd,path=tempfile.mkstemp(prefix='wise2-transit-env-',dir='/tmp')
try:
    with os.fdopen(fd,'w') as f:
        for entry in info['Config']['Env']:
            if '\n' in entry: raise ValueError('Multiline environment entry')
            f.write(entry+'\n')
    args=['create','--name',NEXT,'--restart',info['HostConfig']['RestartPolicy']['Name'],'--network','wise2-net','--network-alias','website','--env-file',path]
    for label,value in (info['Config'].get('Labels') or {}).items():
        args+=['--label',label+'='+value]
    for mount in info['Mounts']:
        if mount['Type']=='volume':args+=['-v',mount['Name']+':'+mount['Destination']]
        elif mount['Type']=='bind':args+=['-v',mount['Source']+':'+mount['Destination']+(':ro' if not mount['RW'] else '')]
    args+=['-p','0.0.0.0:3001:3000',IMAGE]
    cmd(*args)
finally:
    os.unlink(path)
print('Prepared replacement; switching port 3001')
cmd('stop',OLD)
cmd('rename',OLD,BACK)
try:
    cmd('rename',NEXT,OLD)
    cmd('start',OLD)
    for attempt in range(18):
        time.sleep(2)
        code,body=status('http://127.0.0.1:3001/transit')
        home,_=status('http://127.0.0.1:3001/')
        if code==200 and home==200 and 'WISE' in body and 'TRANSIT' in body:
            print('DEPLOY_OK /transit=200 /=200; rollback container retained')
            break
    else:raise RuntimeError('HTTP verification failed')
except Exception as error:
    print('Deployment check failed; restoring previous website:',str(error))
    try:cmd('stop',OLD)
    except Exception:pass
    try:cmd('rename',OLD,'wise2-website-failed-transit')
    except Exception:pass
    cmd('rename',BACK,OLD)
    cmd('start',OLD)
    raise
