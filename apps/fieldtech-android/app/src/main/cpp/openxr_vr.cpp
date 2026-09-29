#include <jni.h>
#include <android/log.h>
#include <openxr/openxr.h>
#include <openxr/openxr_platform.h>
#include <vector>
#include <cmath>

#define LOG_TAG "OpenXR_VR"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

// Global OpenXR state
struct OpenXRState {
    XrInstance instance = XR_NULL_HANDLE;
    XrSession session = XR_NULL_HANDLE;
    XrSpace space = XR_NULL_HANDLE;
    XrHandTrackerEXT leftHandTracker = XR_NULL_HANDLE;
    XrHandTrackerEXT rightHandTracker = XR_NULL_HANDLE;
    XrSessionState sessionState = XR_SESSION_STATE_UNKNOWN;
    bool sessionRunning = false;
};

static OpenXRState g_xrState;

extern "C" {

JNIEXPORT jlong JNICALL Java_com_wise2_fieldtech_vr_OpenXRSession_createXrInstance(
    JNIEnv *env, jobject thiz) {

    LOGI("Creating XR instance");

    // Create instance
    XrInstanceCreateInfo createInfo{};
    createInfo.type = XR_TYPE_INSTANCE_CREATE_INFO;
    createInfo.applicationInfo.apiVersion = XR_VERSION_1_0;
    strcpy(createInfo.applicationInfo.applicationName, "FieldTech VR");
    createInfo.applicationInfo.applicationVersion = 1;
    strcpy(createInfo.applicationInfo.engineName, "Android");
    createInfo.applicationInfo.engineVersion = 1;

    // Enable hand tracking extension
    const char* enabledExtensions[] = {
        XR_EXT_HAND_TRACKING_EXTENSION_NAME,
        XR_KHR_ANDROID_THREAD_SETTINGS_EXTENSION_NAME,
        XR_KHR_ANDROID_CREATE_INSTANCE_EXTENSION_NAME
    };
    createInfo.enabledExtensionCount = 3;
    createInfo.enabledExtensionNames = enabledExtensions;

    // Android create info
    XrInstanceCreateInfoAndroidKHR androidCreateInfo{};
    androidCreateInfo.type = XR_TYPE_INSTANCE_CREATE_INFO_ANDROID_KHR;
    androidCreateInfo.applicationVM = nullptr; // Can be set if needed
    androidCreateInfo.applicationActivity = nullptr; // Can be set if needed
    createInfo.next = &androidCreateInfo;

    XrResult result = xrCreateInstance(&createInfo, &g_xrState.instance);
    if (result != XR_SUCCESS) {
        LOGE("Failed to create XR instance: %d", result);
        return 0;
    }

    LOGI("XR instance created successfully");
    return reinterpret_cast<jlong>(g_xrState.instance);
}

JNIEXPORT jlong JNICALL Java_com_wise2_fieldtech_vr_OpenXRSession_getSystemId(
    JNIEnv *env, jobject thiz, jlong instance) {

    if (instance == 0) return 0;

    XrInstance xrInstance = reinterpret_cast<XrInstance>(instance);
    XrSystemId systemId;

    XrSystemGetInfo getInfo{};
    getInfo.type = XR_TYPE_SYSTEM_GET_INFO;
    getInfo.formFactor = XR_FORM_FACTOR_HEAD_MOUNTED_DISPLAY;

    XrResult result = xrGetSystem(xrInstance, &getInfo, &systemId);
    if (result != XR_SUCCESS) {
        LOGE("Failed to get system: %d", result);
        return 0;
    }

    LOGI("Got system ID: %llu", (unsigned long long)systemId);
    return systemId;
}

JNIEXPORT jlong JNICALL Java_com_wise2_fieldtech_vr_OpenXRSession_createXrSession(
    JNIEnv *env, jobject thiz, jlong instance, jlong systemId) {

    if (instance == 0 || systemId == 0) return 0;

    XrInstance xrInstance = reinterpret_cast<XrInstance>(instance);

    XrSessionCreateInfo createInfo{};
    createInfo.type = XR_TYPE_SESSION_CREATE_INFO;
    createInfo.systemId = systemId;
    createInfo.createFlags = 0;

    XrResult result = xrCreateSession(xrInstance, &createInfo, &g_xrState.session);
    if (result != XR_SUCCESS) {
        LOGE("Failed to create session: %d", result);
        return 0;
    }

    LOGI("XR session created successfully");
    return reinterpret_cast<jlong>(g_xrState.session);
}

JNIEXPORT jlong JNICALL Java_com_wise2_fieldtech_vr_OpenXRSession_createReferenceSpace(
    JNIEnv *env, jobject thiz, jlong session) {

    if (session == 0) return 0;

    XrSession xrSession = reinterpret_cast<XrSession>(session);

    XrReferenceSpaceCreateInfo createInfo{};
    createInfo.type = XR_TYPE_REFERENCE_SPACE_CREATE_INFO;
    createInfo.referenceSpaceType = XR_REFERENCE_SPACE_TYPE_STAGE;
    createInfo.poseInReferenceSpace = {
        {0, 0, 0, 1}, // identity quaternion
        {0, 0, 0} // zero position
    };

    XrResult result = xrCreateReferenceSpace(xrSession, &createInfo, &g_xrState.space);
    if (result != XR_SUCCESS) {
        LOGE("Failed to create reference space: %d", result);
        return 0;
    }

    LOGI("Reference space created");
    return reinterpret_cast<jlong>(g_xrState.space);
}

JNIEXPORT jlong JNICALL Java_com_wise2_fieldtech_vr_OpenXRSession_createHandTracker(
    JNIEnv *env, jobject thiz, jlong session, jint hand) {

    if (session == 0) return 0;

    XrSession xrSession = reinterpret_cast<XrSession>(session);

    // Get function pointer for xrCreateHandTrackerEXT
    PFN_xrCreateHandTrackerEXT xrCreateHandTrackerEXT = nullptr;
    XrResult result = xrGetInstanceProcAddr(
        g_xrState.instance,
        "xrCreateHandTrackerEXT",
        (PFN_xrVoidFunction*)&xrCreateHandTrackerEXT
    );

    if (result != XR_SUCCESS || xrCreateHandTrackerEXT == nullptr) {
        LOGE("Hand tracking extension not available");
        return 0;
    }

    XrHandTrackerCreateInfoEXT createInfo{};
    createInfo.type = XR_TYPE_HAND_TRACKER_CREATE_INFO_EXT;
    createInfo.hand = (hand == 0) ? XR_HAND_LEFT_EXT : XR_HAND_RIGHT_EXT;

    XrHandTrackerEXT handTracker;
    result = xrCreateHandTrackerEXT(xrSession, &createInfo, &handTracker);

    if (result != XR_SUCCESS) {
        LOGE("Failed to create hand tracker for hand %d: %d", hand, result);
        return 0;
    }

    if (hand == 0) {
        g_xrState.leftHandTracker = handTracker;
    } else {
        g_xrState.rightHandTracker = handTracker;
    }

    LOGI("Hand tracker created for hand %d", hand);
    return reinterpret_cast<jlong>(handTracker);
}

JNIEXPORT void JNICALL Java_com_wise2_fieldtech_vr_OpenXRSession_beginXrSession(
    JNIEnv *env, jobject thiz, jlong session) {

    if (session == 0) return;

    XrSession xrSession = reinterpret_cast<XrSession>(session);

    XrSessionBeginInfo beginInfo{};
    beginInfo.type = XR_TYPE_SESSION_BEGIN_INFO;
    beginInfo.primaryViewConfigurationType = XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO;

    XrResult result = xrBeginSession(xrSession, &beginInfo);
    if (result == XR_SUCCESS) {
        g_xrState.sessionRunning = true;
        LOGI("Session began");
    } else {
        LOGE("Failed to begin session: %d", result);
    }
}

JNIEXPORT jlong JNICALL Java_com_wise2_fieldtech_vr_OpenXRSession_waitXrFrame(
    JNIEnv *env, jobject thiz, jlong session) {

    if (session == 0) return 0;

    XrSession xrSession = reinterpret_cast<XrSession>(session);

    XrFrameWaitInfo waitInfo{};
    waitInfo.type = XR_TYPE_FRAME_WAIT_INFO;

    XrFrameState frameState{};
    frameState.type = XR_TYPE_FRAME_STATE;

    XrResult result = xrWaitFrame(xrSession, &waitInfo, &frameState);
    if (result != XR_SUCCESS) {
        LOGE("Failed to wait frame: %d", result);
        return 0;
    }

    return frameState.predictedDisplayTime;
}

JNIEXPORT void JNICALL Java_com_wise2_fieldtech_vr_OpenXRSession_beginXrFrame(
    JNIEnv *env, jobject thiz, jlong session) {

    if (session == 0) return;

    XrSession xrSession = reinterpret_cast<XrSession>(session);

    XrFrameBeginInfo beginInfo{};
    beginInfo.type = XR_TYPE_FRAME_BEGIN_INFO;

    XrResult result = xrBeginFrame(xrSession, &beginInfo);
    if (result != XR_SUCCESS) {
        LOGE("Failed to begin frame: %d", result);
    }
}

JNIEXPORT void JNICALL Java_com_wise2_fieldtech_vr_OpenXRSession_endXrFrame(
    JNIEnv *env, jobject thiz, jlong session) {

    if (session == 0) return;

    XrSession xrSession = reinterpret_cast<XrSession>(session);

    XrFrameEndInfo endInfo{};
    endInfo.type = XR_TYPE_FRAME_END_INFO;
    endInfo.displayTime = 0;
    endInfo.environmentBlendMode = XR_ENVIRONMENT_BLEND_MODE_OPAQUE;
    endInfo.layerCount = 0;
    endInfo.layers = nullptr;

    XrResult result = xrEndFrame(xrSession, &endInfo);
    if (result != XR_SUCCESS) {
        LOGE("Failed to end frame: %d", result);
    }
}

JNIEXPORT void JNICALL Java_com_wise2_fieldtech_vr_OpenXRSession_endXrSession(
    JNIEnv *env, jobject thiz, jlong session) {

    if (session == 0) return;

    XrSession xrSession = reinterpret_cast<XrSession>(session);

    xrEndSession(xrSession);
    g_xrState.sessionRunning = false;
    LOGI("Session ended");
}

JNIEXPORT void JNICALL Java_com_wise2_fieldtech_vr_OpenXRSession_destroyReferenceSpace(
    JNIEnv *env, jobject thiz, jlong space) {

    if (space == 0) return;
    xrDestroySpace(reinterpret_cast<XrSpace>(space));
}

JNIEXPORT void JNICALL Java_com_wise2_fieldtech_vr_OpenXRSession_destroyXrSession(
    JNIEnv *env, jobject thiz, jlong session) {

    if (session == 0) return;
    xrDestroySession(reinterpret_cast<XrSession>(session));
}

JNIEXPORT void JNICALL Java_com_wise2_fieldtech_vr_OpenXRSession_destroyXrInstance(
    JNIEnv *env, jobject thiz, jlong instance) {

    if (instance == 0) return;
    xrDestroyInstance(reinterpret_cast<XrInstance>(instance));
}

JNIEXPORT jobject JNICALL Java_com_wise2_fieldtech_vr_OpenXRSession_getHandTrackingFrame(
    JNIEnv *env, jobject thiz, jlong session, jlong handTracker,
    jstring handedness, jlong frameTime) {

    if (session == 0 || handTracker == 0) return nullptr;

    // Get function pointer for xrLocateHandJointsEXT
    PFN_xrLocateHandJointsEXT xrLocateHandJointsEXT = nullptr;
    XrResult result = xrGetInstanceProcAddr(
        g_xrState.instance,
        "xrLocateHandJointsEXT",
        (PFN_xrVoidFunction*)&xrLocateHandJointsEXT
    );

    if (result != XR_SUCCESS || xrLocateHandJointsEXT == nullptr) {
        LOGE("Hand joint location function not available");
        return nullptr;
    }

    // Locate hand joints
    XrHandJointLocationEXT jointLocations[XR_HAND_JOINT_COUNT_EXT];
    XrHandJointLocationsEXT locations{};
    locations.type = XR_TYPE_HAND_JOINT_LOCATIONS_EXT;
    locations.jointCount = XR_HAND_JOINT_COUNT_EXT;
    locations.joints = jointLocations;

    XrHandJointsLocateInfoEXT locateInfo{};
    locateInfo.type = XR_TYPE_HAND_JOINTS_LOCATE_INFO_EXT;
    locateInfo.baseSpace = g_xrState.space;
    locateInfo.time = frameTime;

    result = xrLocateHandJointsEXT(
        reinterpret_cast<XrHandTrackerEXT>(handTracker),
        &locateInfo,
        &locations
    );

    if (result != XR_SUCCESS) {
        LOGE("Failed to locate hand joints: %d", result);
        return nullptr;
    }

    // Convert to Java HandFrame object
    // This would require creating a HandFrame via JNI
    // For now, returning nullptr as placeholder
    return nullptr;
}

} // extern "C"
