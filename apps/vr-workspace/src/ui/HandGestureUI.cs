using UnityEngine;
using TMPro;

namespace WISE2.VR.UI
{
    /// <summary>
    /// Hand gesture instructions and feedback UI
    /// Shows available gestures and current hand state
    /// </summary>
    public class HandGestureUI : MonoBehaviour
    {
        [SerializeField] private TextMeshProUGUI leftHandText;
        [SerializeField] private TextMeshProUGUI rightHandText;
        [SerializeField] private TextMeshProUGUI instructionText;
        [SerializeField] private Image gestureIndicator;

        private enum GestureType { None, Pinch, Grab, Point, Palm, Thumbs }
        private GestureType lastGestureL, lastGestureR;

        void Start()
        {
            UpdateInstructions();
        }

        void Update()
        {
            DetectHandGestures();
        }

        private void DetectHandGestures()
        {
            // Detect left hand
            if (Input.GetKey(KeyCode.E))
            {
                lastGestureL = GestureType.Pinch;
                leftHandText.text = "👉 Pinch (Select)";
            }
            else if (Input.GetKey(KeyCode.R))
            {
                lastGestureL = GestureType.Grab;
                leftHandText.text = "✊ Grab (Drag)";
            }
            else if (Input.GetKey(KeyCode.T))
            {
                lastGestureL = GestureType.Point;
                leftHandText.text = "☝️ Point (Aim)";
            }
            else
            {
                lastGestureL = GestureType.None;
                leftHandText.text = "Left Hand Ready";
            }

            // Detect right hand
            if (Input.GetKey(KeyCode.I))
            {
                lastGestureR = GestureType.Palm;
                rightHandText.text = "🖐️ Palm (Menu)";
            }
            else if (Input.GetKey(KeyCode.O))
            {
                lastGestureR = GestureType.Thumbs;
                rightHandText.text = "👍 Thumbs (Confirm)";
            }
            else
            {
                lastGestureR = GestureType.None;
                rightHandText.text = "Right Hand Ready";
            }
        }

        private void UpdateInstructions()
        {
            instructionText.text = @"
HAND GESTURES:
━━━━━━━━━━━━━━━━━━━
👉 Pinch    - Select equipment
✊ Grab     - Move objects
☝️ Point    - Aim/measure
🖐️ Palm     - Open menu
👍 Thumbs   - Confirm action

SHORTCUTS:
E/I - Pinch/Palm
R/O - Grab/Thumbs
T   - Point
            ";
        }

        public void ShowGestureSuccess(string gestureName)
        {
            gestureIndicator.color = Color.green;
            instructionText.text = $"✓ {gestureName} recognized!";
            Invoke("ResetIndicator", 1f);
        }

        private void ResetIndicator()
        {
            gestureIndicator.color = Color.white;
            UpdateInstructions();
        }
    }
}
