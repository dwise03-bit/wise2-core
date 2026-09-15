# WISE² Android Agent Workflow

Android application source is not currently initialized in this repository. The shared tooling intentionally reports this state and does not create placeholder Gradle files.

When an Android project is added, it must include `gradlew` and a committed wrapper. The expected checks are:

```bash
./gradlew test
./gradlew lint
./gradlew connectedAndroidTest
```
