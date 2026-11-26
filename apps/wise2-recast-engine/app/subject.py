"""CPU 9:16 subject crop. OpenCV only (Apache-2.0): Haar face, HOG person, contrast blob, motion, then center.

Nothing here imports faster-whisper. OpenCV is imported when a crop is planned.
Manual crop_x_norm / crop_y_norm replaces detection for the whole clip.
"""
from pathlib import Path

TARGET_ASPECT = 9 / 16


def smooth_series(values, alpha=0.45, max_step=0.08):
    if not values:
        return []
    current = min(1.0, max(0.0, float(values[0])))
    out = [current]
    for raw in values[1:]:
        target = alpha * float(raw) + (1.0 - alpha) * current
        delta = min(max_step, max(-max_step, target - current))
        current = min(1.0, max(0.0, current + delta))
        out.append(current)
    return out


def _even(value):
    value = int(value)
    return 2 if value < 2 else value - (value % 2)


def crop_rect(src_w, src_h, x_norm, y_norm):
    x_norm = min(1.0, max(0.0, float(x_norm)))
    y_norm = min(1.0, max(0.0, float(y_norm)))
    if (src_w / src_h) >= TARGET_ASPECT:
        crop_h = _even(src_h)
        crop_w = min(_even(round(crop_h * TARGET_ASPECT)), _even(src_w))
        x = int(round(x_norm * src_w - crop_w / 2))
        x = max(0, min(src_w - crop_w, x))
        y = int(round(y_norm * src_h - crop_h / 2))
        y = max(0, min(src_h - crop_h, y))
    else:
        crop_w = _even(src_w)
        crop_h = min(_even(round(crop_w / TARGET_ASPECT)), _even(src_h))
        y = int(round(y_norm * src_h - crop_h / 2))
        y = max(0, min(src_h - crop_h, y))
        x = int(round(x_norm * src_w - crop_w / 2))
        x = max(0, min(src_w - crop_w, x))
    return x, y, crop_w, crop_h


def plan_crop(video_path, start, end, crop_mode='auto', crop_x_norm=None, crop_y_norm=None, step=0.5):
    span = max(0.0, float(end) - float(start))
    if crop_mode == 'manual':
        x = 0.5 if crop_x_norm is None else min(1.0, max(0.0, float(crop_x_norm)))
        y = 0.5 if crop_y_norm is None else min(1.0, max(0.0, float(crop_y_norm)))
        return [{'t': 0.0, 'x': x, 'y': y, 'source': 'manual'}, {'t': span, 'x': x, 'y': y, 'source': 'manual'}]
    try:
        import cv2
    except ImportError:
        return [{'t': 0.0, 'x': 0.5, 'y': 0.5, 'source': 'center'}, {'t': span, 'x': 0.5, 'y': 0.5, 'source': 'center'}]
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        cap.release()
        return [{'t': 0.0, 'x': 0.5, 'y': 0.5, 'source': 'center'}, {'t': span, 'x': 0.5, 'y': 0.5, 'source': 'center'}]
    raw = []
    previous = None
    try:
        face = cv2.CascadeClassifier(str(Path(cv2.data.haarcascades) / 'haarcascade_frontalface_default.xml'))
        hog = cv2.HOGDescriptor()
        hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
        t = 0.0
        while t <= span + 1e-6:
            cap.set(cv2.CAP_PROP_POS_MSEC, (float(start) + min(t, span)) * 1000.0)
            ok, frame = cap.read()
            stamp = round(min(t, span), 3)
            if not ok or frame is None:
                raw.append({'t': stamp, 'x': 0.5, 'y': 0.5, 'source': 'center'})
                previous = None
            else:
                x, y, source, previous = _locate(cv2, frame, previous, face, hog)
                raw.append({'t': stamp, 'x': x, 'y': y, 'source': source})
            if t >= span:
                break
            t += step
    finally:
        cap.release()
    if not raw:
        return [{'t': 0.0, 'x': 0.5, 'y': 0.5, 'source': 'center'}]
    xs = smooth_series([item['x'] for item in raw])
    ys = smooth_series([item['y'] for item in raw])
    for item, x, y in zip(raw, xs, ys):
        item['x'], item['y'] = x, y
    return raw


def dominant_source(samples):
    if not samples:
        return 'center'
    counts = {}
    for sample in samples:
        counts[sample['source']] = counts.get(sample['source'], 0) + 1
    return sorted(counts, key=lambda name: (name == 'center', -counts[name]))[0]


def write_crop_script(path, samples, src_w, src_h):
    lines = []
    width = height = None
    last = None
    for sample in samples:
        x, y, crop_w, crop_h = crop_rect(src_w, src_h, sample['x'], sample['y'])
        width, height = crop_w, crop_h
        point = (x, y)
        if point == last:
            continue
        last = point
        lines.append(f"{sample['t']:.3f} [enter] crop@wise x {x}, crop@wise y {y};")
    if width is None:
        x, y, width, height = crop_rect(src_w, src_h, 0.5, 0.5)
        lines.append(f'0.000 [enter] crop@wise x {x}, crop@wise y {y};')
    Path(path).write_text('\n'.join(lines) + '\n', encoding='utf-8')
    return width, height


def vertical_filter(video, start, end, out_w, out_h, crop_mode, crop_x_norm, crop_y_norm, work_file):
    """Return an ffmpeg -vf string that crops to 9:16 and scales to out_w x out_h."""
    import json
    import subprocess
    probe = subprocess.run(
        ['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', str(video)],
        capture_output=True, text=True, check=True,
    )
    stream = json.loads(probe.stdout)['streams'][0]
    src_w, src_h = int(stream['width']), int(stream['height'])
    samples = plan_crop(video, start, end, crop_mode, crop_x_norm, crop_y_norm)
    script = Path(str(work_file) + '.crop.cmd')
    crop_w, crop_h = write_crop_script(script, samples, src_w, src_h)
    escaped = str(script.resolve()).replace('\\', '\\\\').replace(':', '\\:').replace("'", "\\'").replace(',', '\\,')
    graph = (
        f"sendcmd=f='{escaped}',crop@wise={crop_w}:{crop_h}:0:0,"
        f"scale={int(out_w)}:{int(out_h)}:flags=bicubic,setsar=1"
    )
    return graph, dominant_source(samples)


def backend_status():
    try:
        import cv2
    except ImportError:
        return {
            'available': False,
            'backend': 'center',
            'haar_cascade': False,
            'hog_people': False,
            'detail': 'opencv-python-headless is not installed; crop uses the frame center',
        }
    haar = Path(cv2.data.haarcascades) / 'haarcascade_frontalface_default.xml'
    return {
        'available': True,
        'backend': 'opencv-haar-face+hog-person+saliency+motion',
        'haar_cascade': haar.is_file(),
        'hog_people': hasattr(cv2, 'HOGDescriptor_getDefaultPeopleDetector'),
        'detail': 'OpenCV Haar face cascade, HOG person detector, then contrast saliency, then motion, then center',
    }


def _locate(cv2, frame, previous, face_cascade, hog):
    height, width = frame.shape[:2]
    scale = 480.0 / width if width > 480 else 1.0
    small = cv2.resize(frame, (int(width * scale), int(height * scale))) if scale != 1 else frame
    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    face = _largest(face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(24, 24)), gray)
    if face:
        return face[0], face[1], 'face', gray
    try:
        rects, _weights = hog.detectMultiScale(gray, winStride=(8, 8), padding=(8, 8), scale=1.05)
    except Exception:
        rects = []
    person = _largest(rects, gray)
    if person:
        return person[0], person[1], 'person', gray
    blob = _blob(cv2, gray)
    if blob:
        return blob[0], blob[1], 'saliency', gray
    if previous is not None:
        motion = _motion(cv2, previous, gray)
        if motion:
            return motion[0], motion[1], 'motion', gray
    return 0.5, 0.5, 'center', gray


def _largest(rects, gray):
    if rects is None or len(rects) == 0:
        return None
    height, width = gray.shape[:2]
    best = None
    best_area = 0
    for rect in rects:
        rx, ry, rw, rh = [int(v) for v in rect]
        area = rw * rh
        if area > best_area:
            best_area = area
            best = ((rx + rw / 2) / width, (ry + rh / 2) / height)
    return best


def _blob(cv2, gray):
    height, width = gray.shape[:2]
    cutoff = max(48, int(float(gray.mean()) + 40))
    _threshold, mask = cv2.threshold(gray, cutoff, 255, cv2.THRESH_BINARY)
    moments = cv2.moments(mask)
    if moments['m00'] < 255 * 80 or moments['m00'] > 255 * 0.45 * width * height:
        return None
    return (moments['m10'] / moments['m00'] / width, moments['m01'] / moments['m00'] / height)


def _motion(cv2, previous, gray):
    diff = cv2.absdiff(previous, gray)
    _threshold, mask = cv2.threshold(diff, 25, 255, cv2.THRESH_BINARY)
    moments = cv2.moments(mask)
    if moments['m00'] < 80:
        return None
    height, width = gray.shape[:2]
    return (moments['m10'] / moments['m00'] / width, moments['m01'] / moments['m00'] / height)
