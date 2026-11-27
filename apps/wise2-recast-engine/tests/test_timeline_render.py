import unittest, tempfile, shutil, subprocess
from pathlib import Path
from app.timeline import render_edit, normalize

class TimelineRenderTests(unittest.TestCase):
    def test_gain_clamps(self):
        self.assertEqual(normalize({'start':0,'end':2,'audio_gain_db':999})['audio_gain_db'],20)
    @unittest.skipUnless(shutil.which('ffmpeg') and shutil.which('ffprobe'),'FFmpeg required')
    def test_actual_trim_with_captions(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp=Path(tmp);source=tmp/'source.mp4';out=tmp/'edited.mp4'
            subprocess.run(['ffmpeg','-y','-v','error','-f','lavfi','-i','color=c=navy:s=320x240:r=15:d=4',
                '-f','lavfi','-i','sine=frequency=440:duration=4','-shortest','-c:v','libx264','-c:a','aac',str(source)],check=True)
            render_edit(source,out,{'start':1,'end':3,'words':[{'start':0.2,'end':0.8,'text':'Testing'}]},tmp/'work')
            probe=subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(out)],text=True)
            self.assertAlmostEqual(float(probe),2,delta=.25)
            self.assertGreater(out.stat().st_size,1000)
