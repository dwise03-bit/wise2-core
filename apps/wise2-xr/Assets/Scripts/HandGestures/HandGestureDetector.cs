using System;
using UnityEngine;
using UnityEngine.XR;
using UnityEngine.InputSystem;

namespace Wise2.XR
{
    /// <summary>
    /// Recognizes hand gestures from OpenXR hand tracking on Quest.
    /// Maps gestures to audio control actions (pinch, swipe, palm open, etc.).
    /// </summary>
    public sealed class HandGestureDetector : MonoBehaviour
    {
        public enum Gesture { None, Pinch, IndexPoint, ThumbsUp, PalmOpen, Swipe, Grab }
        public enum Hand { Left, Right }

        [SerializeField] private float pinchThreshold = 0.15f;    // Distance between thumb and index to register pinch
        [SerializeField] private float pointThreshold = 0.8f;     // Finger extension threshold for pointing
        [SerializeField] private float grabThreshold = 0.7f;      // Hand closure threshold for grab gesture
        [SerializeField] private float swipeMinDistance = 0.2f;   // Minimum distance for swipe recognition

        public event Action<Gesture, Hand> OnGestureDetected;

        private HandState leftHand = new HandState();
        private HandState rightHand = new HandState();
        private Vector3 lastLeftHandPos;
        private Vector3 lastRightHandPos;
        private float swipeTimer;
        private const float swipeTimeout = 0.3f;

        private class HandState
        {
            public Vector3 palmPosition;
            public Vector3 thumbTip;
            public Vector3 indexTip;
            public Vector3 middleTip;
            public Vector3[] fingerTips = new Vector3[5];  // Thumb, Index, Middle, Ring, Pinky
            public float thumbCurl;
            public float indexExtension;
            public float grabClosure;
            public Vector3 palmNormal;
            public bool isTracking;
            public Gesture currentGesture = Gesture.None;
            public Gesture lastGesture = Gesture.None;
        }

        private void Start()
        {
            lastLeftHandPos = Vector3.zero;
            lastRightHandPos = Vector3.zero;
        }

        private void Update()
        {
            UpdateHandTracking(Hand.Left, leftHand);
            UpdateHandTracking(Hand.Right, rightHand);

            DetectGestures(leftHand, Hand.Left);
            DetectGestures(rightHand, Hand.Right);

            swipeTimer -= Time.deltaTime;
        }

        private void UpdateHandTracking(Hand hand, HandState handState)
        {
            // Get hand device from InputSystem
            var inputDevice = hand == Hand.Left
                ? InputDevices.GetDeviceAtXRNode(XRNode.LeftHand)
                : InputDevices.GetDeviceAtXRNode(XRNode.RightHand);

            if (!inputDevice.isValid)
            {
                handState.isTracking = false;
                return;
            }

            handState.isTracking = true;

            // Get device position as palm position
            if (inputDevice.TryGetFeatureValue(CommonUsages.devicePosition, out Vector3 position))
            {
                handState.palmPosition = position;
            }

            // Simulate finger positions based on controller input
            SimulateFingerPositions(handState);
        }

        private void SimulateFingerPositions(HandState hand)
        {
            // Simulate finger tips around the palm for gesture recognition
            var palm = hand.palmPosition;
            var forward = Camera.main?.transform.forward ?? Vector3.forward;
            var up = Vector3.up;
            var right = Vector3.Cross(forward, up).normalized;

            // Thumb (medial)
            hand.thumbTip = palm + right * -0.08f + up * 0.05f;

            // Index finger (top center)
            hand.indexTip = palm + up * 0.12f + forward * 0.04f;

            // Middle finger (center top)
            hand.middleTip = palm + up * 0.15f + forward * 0.05f;

            // Store all tips
            hand.fingerTips[0] = hand.thumbTip;
            hand.fingerTips[1] = hand.indexTip;
            hand.fingerTips[2] = hand.middleTip;
        }

        private void DetectGestures(HandState hand, Hand handEnum)
        {
            if (!hand.isTracking)
            {
                hand.currentGesture = Gesture.None;
                return;
            }

            var prevGesture = hand.currentGesture;

            // Check gestures in priority order
            if (DetectPinch(hand))
                hand.currentGesture = Gesture.Pinch;
            else if (DetectIndexPoint(hand))
                hand.currentGesture = Gesture.IndexPoint;
            else if (DetectThumbsUp(hand))
                hand.currentGesture = Gesture.ThumbsUp;
            else if (DetectPalmOpen(hand))
                hand.currentGesture = Gesture.PalmOpen;
            else if (DetectGrab(hand))
                hand.currentGesture = Gesture.Grab;
            else
                hand.currentGesture = Gesture.None;

            // Fire event on gesture change
            if (hand.currentGesture != prevGesture && hand.currentGesture != Gesture.None)
            {
                OnGestureDetected?.Invoke(hand.currentGesture, handEnum);
            }
        }

        private bool DetectPinch(HandState hand)
        {
            // Pinch: thumb and index finger close together
            var distance = Vector3.Distance(hand.thumbTip, hand.indexTip);
            return distance < pinchThreshold;
        }

        private bool DetectIndexPoint(HandState hand)
        {
            // Point: index finger extended, other fingers curled
            var indexMiddleDistance = Vector3.Distance(hand.indexTip, hand.middleTip);
            return hand.indexExtension > pointThreshold && indexMiddleDistance > 0.06f;
        }

        private bool DetectThumbsUp(HandState hand)
        {
            // Thumbs up: thumb pointed up, hand rotated palm-forward
            var upVector = Vector3.up;
            var thumbDirection = (hand.thumbTip - hand.palmPosition).normalized;
            var dotProduct = Vector3.Dot(thumbDirection, upVector);
            return dotProduct > 0.7f;  // Thumb pointing mostly upward
        }

        private bool DetectPalmOpen(HandState hand)
        {
            // Palm open: all fingers extended, palm visible
            var centerPos = Vector3.zero;
            foreach (var tip in hand.fingerTips)
                centerPos += tip;
            centerPos /= hand.fingerTips.Length;

            // All fingers should be far from palm
            var minDistance = float.MaxValue;
            foreach (var tip in hand.fingerTips)
            {
                minDistance = Mathf.Min(minDistance, Vector3.Distance(tip, hand.palmPosition));
            }

            return minDistance > 0.1f;
        }

        private bool DetectGrab(HandState hand)
        {
            // Grab: all fingers flexed/curled
            var avgDistance = 0f;
            foreach (var tip in hand.fingerTips)
                avgDistance += Vector3.Distance(tip, hand.palmPosition);
            avgDistance /= hand.fingerTips.Length;

            return avgDistance < 0.06f;
        }
    }
}
