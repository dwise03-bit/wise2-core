# Headless Android build environment for this machine, which has no local Android SDK/emulator
# (see docs/ANDROID_IMPLEMENTATION_AUDIT.md §3). Provides just enough SDK to run
# `./gradlew test` / `assembleDebug` / `assembleRelease` — no emulator, so it cannot replace
# visual/on-device verification.
#
# Build and run this with --platform linux/amd64 even on Apple Silicon: AGP's aapt2 binary is
# x86_64-only, and it fails under Rosetta if the container itself is native arm64 (missing
# /lib64/ld-linux-x86-64.so.2). A full linux/amd64 container avoids the architecture mismatch.
FROM --platform=linux/amd64 eclipse-temurin:17-jdk

ENV ANDROID_SDK_ROOT=/opt/android-sdk \
    ANDROID_HOME=/opt/android-sdk \
    DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends unzip curl && rm -rf /var/lib/apt/lists/*

RUN curl -sSL -o /tmp/gradle.zip https://services.gradle.org/distributions/gradle-8.7-bin.zip \
    && unzip -q /tmp/gradle.zip -d /opt \
    && mv /opt/gradle-8.7 /opt/gradle \
    && rm /tmp/gradle.zip
ENV PATH=${PATH}:/opt/gradle/bin

RUN mkdir -p ${ANDROID_SDK_ROOT}/cmdline-tools \
    && curl -sSL -o /tmp/cmdline-tools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip \
    && unzip -q /tmp/cmdline-tools.zip -d ${ANDROID_SDK_ROOT}/cmdline-tools \
    && mv ${ANDROID_SDK_ROOT}/cmdline-tools/cmdline-tools ${ANDROID_SDK_ROOT}/cmdline-tools/latest \
    && rm /tmp/cmdline-tools.zip

ENV PATH=${PATH}:${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin:${ANDROID_SDK_ROOT}/platform-tools

RUN yes | sdkmanager --licenses >/dev/null \
    && sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

WORKDIR /project
