package com.wise2.fieldtech.vr

import android.os.Bundle
import android.view.MotionEvent
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

/**
 * VR Activity for Field Service in 3D/VR on Meta Quest
 * Provides immersive job site visualization with hand tracking interactions
 */
class VRActivity : ComponentActivity(), OpenXRSession.FrameCallbackListener {

    private lateinit var vrEnvironment: VREnvironment
    private lateinit var gestureDetector: HandTrackingGestureDetector
    private lateinit var openXRSession: OpenXRSession
    private var vrMode = false
    private var useOpenXR = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize VR components
        vrEnvironment = VREnvironment(this)
        gestureDetector = HandTrackingGestureDetector()
        openXRSession = OpenXRSession(this)

        // Check if running on Meta Quest
        vrMode = isMetaQuestDevice()

        setContent {
            VRFieldServiceUI(
                vrMode = vrMode,
                vrEnvironment = vrEnvironment,
                gestureDetector = gestureDetector,
                onJobInitialize = ::initializeJobSite,
                onCaptureMedia = ::captureMediaAtPoint
            )
        }

        // Start VR services if on device
        if (vrMode) {
            startVRServices()
        }
    }

    private fun isMetaQuestDevice(): Boolean {
        val manufacturer = android.os.Build.MANUFACTURER
        val model = android.os.Build.MODEL
        return manufacturer.contains("Meta") || model.contains("Quest")
    }

    private fun startVRServices() {
        // Try to initialize OpenXR for real hand tracking
        try {
            if (openXRSession.initialize()) {
                useOpenXR = true
                if (openXRSession.beginSession()) {
                    openXRSession.setFrameCallbackListener(this)
                    startOpenXRRenderLoop()
                } else {
                    useOpenXR = false
                    startMockHandTrackingListener()
                }
            } else {
                // Fallback to mock hand tracking
                startMockHandTrackingListener()
            }
        } catch (e: Exception) {
            // OpenXR native library not available - use mock tracking
            android.util.Log.w("VRActivity", "OpenXR unavailable, using mock hand tracking", e)
            startMockHandTrackingListener()
        }

        // Initialize VR rendering loop
        startVRRenderLoop()
    }

    /**
     * OpenXR Frame Callback - Called from OpenXR rendering thread
     */
    override fun onXrFrame(frameTime: Long, handFrames: List<HandTrackingGestureDetector.HandFrame>) {
        for (handFrame in handFrames) {
            val gesture = gestureDetector.updateHandTracking(handFrame)

            gesture?.let {
                val handState = buildHandTrackingState(handFrame, it)
                vrEnvironment.updateHandTracking(handState)
            }
        }
    }

    private fun buildHandTrackingState(
        handFrame: HandTrackingGestureDetector.HandFrame,
        gesture: VREnvironment.HandGesture
    ): VREnvironment.HandTrackingState {
        val palmJoint = handFrame.joints.firstOrNull { it.joint == HandTrackingGestureDetector.HandJoint.PALM }
        val palmPos = palmJoint?.position ?: VREnvironment.Vector3(0f, 0f, 0f)

        return if (handFrame.handedness == "left") {
            VREnvironment.HandTrackingState(
                leftHandPosition = palmPos,
                rightHandPosition = VREnvironment.Vector3(0.3f, 1.2f, -1f),
                leftHandGesture = gesture,
                rightHandGesture = null,
                leftPalmDirection = VREnvironment.Vector3(0f, 0f, 1f),
                rightPalmDirection = VREnvironment.Vector3(0f, 0f, 1f)
            )
        } else {
            VREnvironment.HandTrackingState(
                leftHandPosition = VREnvironment.Vector3(-0.3f, 1.2f, -1f),
                rightHandPosition = palmPos,
                leftHandGesture = null,
                rightHandGesture = gesture,
                leftPalmDirection = VREnvironment.Vector3(0f, 0f, 1f),
                rightPalmDirection = VREnvironment.Vector3(0f, 0f, 1f)
            )
        }
    }

    private fun startOpenXRRenderLoop() {
        // OpenXR frame processing loop
        Thread {
            while (vrMode && useOpenXR) {
                try {
                    openXRSession.processFrame()
                } catch (e: Exception) {
                    e.printStackTrace()
                    break
                }
            }
        }.start()
    }

    private fun startMockHandTrackingListener() {
        // Fallback: Simulate hand tracking updates
        Thread {
            var frameCount = 0
            while (vrMode && frameCount < 1000) {
                try {
                    frameCount++
                    val handFrame = generateMockHandFrame()
                    val gesture = gestureDetector.updateHandTracking(handFrame)

                    gesture?.let {
                        vrEnvironment.updateHandTracking(
                            VREnvironment.HandTrackingState(
                                leftHandPosition = VREnvironment.Vector3(-0.3f, 1.2f, -1f),
                                rightHandPosition = VREnvironment.Vector3(0.3f, 1.2f, -1f),
                                leftHandGesture = null,
                                rightHandGesture = it,
                                leftPalmDirection = VREnvironment.Vector3(0f, 0f, 1f),
                                rightPalmDirection = VREnvironment.Vector3(0f, 0f, 1f)
                            )
                        )
                    }

                    Thread.sleep(16) // ~60fps hand tracking updates
                } catch (e: Exception) {
                    e.printStackTrace()
                    break
                }
            }
        }.start()
    }

    private fun startVRRenderLoop() {
        // VR rendering loop would be driven by OpenXR frame callbacks
        Thread {
            while (vrMode) {
                try {
                    // Render frame
                    // Real implementation would use OpenXR XrWaitFrame / XrBeginFrame / XrEndFrame
                    Thread.sleep(16) // ~60fps rendering
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }.start()
    }

    private fun generateMockHandFrame(): HandTrackingGestureDetector.HandFrame {
        // Generate mock hand tracking data for testing
        val joints = listOf(
            HandTrackingGestureDetector.HandJointPosition(
                HandTrackingGestureDetector.HandJoint.PALM,
                VREnvironment.Vector3(0.3f, 1.2f, -1f),
                1.0f
            ),
            HandTrackingGestureDetector.HandJointPosition(
                HandTrackingGestureDetector.HandJoint.INDEX_TIP,
                VREnvironment.Vector3(0.35f, 1.15f, -0.9f),
                1.0f
            ),
            HandTrackingGestureDetector.HandJointPosition(
                HandTrackingGestureDetector.HandJoint.THUMB_TIP,
                VREnvironment.Vector3(0.32f, 1.15f, -0.95f),
                1.0f
            )
        )

        return HandTrackingGestureDetector.HandFrame(
            handedness = "right",
            joints = joints,
            isTracked = true,
            timestamp = System.currentTimeMillis()
        )
    }

    private fun initializeJobSite(jobName: String) {
        // Create sample job site for testing
        val equipment = listOf(
            VREnvironment.Equipment3D(
                id = "hvac-1",
                name = "HVAC Unit",
                modelPath = "models/hvac.obj",
                position = VREnvironment.Vector3(1f, 0.5f, -3f),
                rotation = VREnvironment.Quaternion(0f, 0f, 0f, 1f),
                status = "needs_service",
                interactable = true
            ),
            VREnvironment.Equipment3D(
                id = "thermostat-1",
                name = "Thermostat",
                modelPath = "models/thermostat.obj",
                position = VREnvironment.Vector3(-1f, 1.5f, -2f),
                rotation = VREnvironment.Quaternion(0f, 0f, 0f, 1f),
                status = "operational",
                interactable = true
            )
        )

        val annotations = listOf(
            VREnvironment.SpatialAnnotation(
                id = "issue-1",
                text = "Refrigerant leak detected",
                position = VREnvironment.Vector3(1.2f, 0.7f, -3f),
                type = VREnvironment.AnnotationType.ISSUE,
                icon = "🔴"
            )
        )

        val jobSite = VREnvironment.JobSite3D(
            id = "job-123",
            name = jobName,
            position = VREnvironment.Vector3(0f, 0f, 0f),
            equipment = equipment,
            annotations = annotations
        )

        vrEnvironment.initializeJobSite(jobSite)
    }

    private fun captureMediaAtPoint(posX: Float, posY: Float, posZ: Float) {
        val position = VREnvironment.Vector3(posX, posY, posZ)
        vrEnvironment.captureMediaAtPoint(position, "photo")
    }

    override fun onPause() {
        super.onPause()
        if (useOpenXR) {
            openXRSession.endSession()
        }
        vrMode = false
    }

    override fun onResume() {
        super.onResume()
        vrMode = true
        if (useOpenXR) {
            openXRSession.beginSession()
        }
    }

    override fun onDestroy() {
        openXRSession.shutdown()
        super.onDestroy()
    }

    override fun onTouchEvent(event: MotionEvent?): Boolean {
        // Handle touch input for fallback (non-hand-tracked) mode
        return super.onTouchEvent(event)
    }
}

/**
 * VR Field Service UI
 * Immersive Compose UI for field service work in VR
 */
@Composable
fun VRFieldServiceUI(
    vrMode: Boolean,
    vrEnvironment: VREnvironment,
    gestureDetector: HandTrackingGestureDetector,
    onJobInitialize: (String) -> Unit,
    onCaptureMedia: (Float, Float, Float) -> Unit
) {
    var selectedJob by remember { mutableStateOf<String?>(null) }
    var jobProgress by remember { mutableFloatStateOf(0f) }
    var currentGesture by remember { mutableStateOf<VREnvironment.HandGesture?>(null) }

    LaunchedEffect(Unit) {
        // Initialize sample job
        onJobInitialize("Johnson HVAC Service")

        // Update progress periodically
        while (true) {
            delay(2000)
            jobProgress = vrEnvironment.getJobProgress()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF1a1a2e))
    ) {
        if (vrMode) {
            // VR Mode: Immersive 3D environment
            VREnvironmentView(vrEnvironment)

            // VR Overlay UI
            VRHUDOverlay(
                jobProgress = jobProgress,
                currentGesture = currentGesture,
                spatialPanels = vrEnvironment.getSpatialPanels()
            )
        } else {
            // Fallback: 2D Compose UI (for non-VR devices)
            Fallback2DUI(
                onJobInitialize = onJobInitialize,
                onCaptureMedia = onCaptureMedia,
                jobProgress = jobProgress
            )
        }
    }
}

@Composable
fun VREnvironmentView(vrEnvironment: VREnvironment) {
    // Would contain OpenGL ES rendering or Unity integration
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "VR 3D Environment\n(OpenXR Rendering)",
            color = Color(0x00ff88),
            fontSize = 24.sp
        )
    }
}

@Composable
fun VRHUDOverlay(
    jobProgress: Float,
    currentGesture: VREnvironment.HandGesture?,
    spatialPanels: List<VREnvironment.VRPanel3D>
) {
    Box(modifier = Modifier.fillMaxSize()) {
        // Progress bar (top)
        Box(
            modifier = Modifier
                .fillMaxSize(0.3f)
                .align(Alignment.TopCenter)
                .background(Color(0xFF00d4ff).copy(alpha = 0.3f))
        ) {
            Text(
                text = "Job Progress: ${"%.0f".format(jobProgress)}%",
                color = Color(0xFF00d4ff),
                fontSize = 16.sp,
                modifier = Modifier.align(Alignment.Center)
            )
        }

        // Gesture indicator (top right)
        currentGesture?.let {
            Box(
                modifier = Modifier
                    .fillMaxSize(0.15f)
                    .align(Alignment.TopEnd)
                    .background(Color(0xFF00ff88).copy(alpha = 0.5f))
            ) {
                Text(
                    text = "Gesture: $it",
                    color = Color(0xFF00ff88),
                    fontSize = 12.sp,
                    modifier = Modifier.align(Alignment.Center)
                )
            }
        }

        // Spatial panels info
        Box(
            modifier = Modifier
                .fillMaxSize(0.25f)
                .align(Alignment.BottomStart)
                .background(Color(0xFFff3366).copy(alpha = 0.2f))
        ) {
            Text(
                text = "Panels: ${spatialPanels.size}",
                color = Color(0xFF00d4ff),
                fontSize = 12.sp,
                modifier = Modifier.align(Alignment.Center)
            )
        }
    }
}

@Composable
fun Fallback2DUI(
    onJobInitialize: (String) -> Unit,
    onCaptureMedia: (Float, Float, Float) -> Unit,
    jobProgress: Float
) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "VR Mode Unavailable\n\nNon-VR Fallback UI\n\nProgress: ${"%.0f".format(jobProgress)}%",
            color = Color(0x00d4ff),
            fontSize = 18.sp
        )
    }
}
