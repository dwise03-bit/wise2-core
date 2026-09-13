# Quest source of truth

The canonical Quest Unity project is:

`/home/dwise/wise2-core/apps/wise2-xr`

Builds must run from that directory and write the APK to:

`/sdb-disk/unity/builds/wise2-xr/WISE2-XR.apk`

Do not build from `/opt/wise2-core` or `/sdb-disk/projects/wise2-xr`; those are
legacy copies and can produce an APK that does not contain the current source.
