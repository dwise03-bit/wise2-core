using UnityEngine;
using TMPro;
using System.Collections.Generic;

namespace WISE2.VR.UI
{
    /// <summary>
    /// 3D equipment analysis UI for VR workspace
    /// Displays AR overlays, annotations, and diagnostics
    /// </summary>
    public class EquipmentAnalysisDisplay : MonoBehaviour
    {
        [SerializeField] private TextMeshProUGUI equipmentNameText;
        [SerializeField] private TextMeshProUGUI diagnosticsText;
        [SerializeField] private TextMeshProUGUI partsListText;
        [SerializeField] private TextMeshProUGUI severityIndicator;
        [SerializeField] private TextMeshProUGUI estimatedTimeText;

        private Dictionary<string, string> currentAnalysis;
        private Color severityColor;

        void Start()
        {
            currentAnalysis = new Dictionary<string, string>();
            UpdateDisplay();
        }

        public void SetEquipmentAnalysis(string equipmentName, Dictionary<string, string> analysis)
        {
            currentAnalysis = analysis;
            equipmentNameText.text = $"Equipment: {equipmentName}";
            UpdateDisplay();
        }

        private void UpdateDisplay()
        {
            // Equipment diagnostics
            if (currentAnalysis.ContainsKey("diagnosis"))
            {
                diagnosticsText.text = $"Diagnosis:\n{currentAnalysis["diagnosis"]}";
            }

            // Parts list
            if (currentAnalysis.ContainsKey("parts"))
            {
                partsListText.text = $"Parts Needed:\n{currentAnalysis["parts"]}";
            }

            // Severity
            if (currentAnalysis.ContainsKey("severity"))
            {
                string severity = currentAnalysis["severity"];
                severityIndicator.text = $"Severity: {severity}";

                severityColor = severity switch
                {
                    "critical" => Color.red,
                    "warning" => Color.yellow,
                    "info" => Color.green,
                    _ => Color.white
                };
                severityIndicator.color = severityColor;
            }

            // Estimated time
            if (currentAnalysis.ContainsKey("estimatedTime"))
            {
                estimatedTimeText.text = $"Est. Time: {currentAnalysis["estimatedTime"]}";
            }
        }

        public void AddAnnotation(string label, Vector3 worldPosition)
        {
            // Create 3D text annotation at world position
            GameObject annotationGO = new GameObject($"Annotation_{label}");
            annotationGO.transform.position = worldPosition;

            TextMeshPro annotation = annotationGO.AddComponent<TextMeshPro>();
            annotation.text = label;
            annotation.fontSize = 36;
            annotation.alignment = TextAlignmentOptions.Center;

            RectTransform rect = annotationGO.GetComponent<RectTransform>();
            rect.sizeDelta = new Vector2(2, 1);
        }

        public void ShowArrowPointer(Vector3 target)
        {
            // Display arrow pointing to equipment
            GameObject arrowGO = new GameObject("EquipmentArrow");
            LineRenderer line = arrowGO.AddComponent<LineRenderer>();
            line.SetPosition(0, Camera.main.transform.position);
            line.SetPosition(1, target);
            line.material = new Material(Shader.Find("Standard"));
            line.startColor = Color.cyan;
            line.endColor = Color.cyan;
            line.startWidth = 0.05f;
            line.endWidth = 0.05f;
        }
    }
}
