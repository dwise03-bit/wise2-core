using UnityEngine;
using TMPro;

namespace WISE2.VR.UI
{
    /// <summary>
    /// Main VR menu system for Meta Quest
    /// Handles dashboard, navigation, and app features
    /// </summary>
    public class VRMainMenu : MonoBehaviour
    {
        [SerializeField] private Canvas mainCanvas;
        [SerializeField] private TextMeshProUGUI titleText;
        [SerializeField] private TextMeshProUGUI statusText;

        private RectTransform canvasRect;
        private CanvasGroup canvasGroup;

        private enum MenuState { MainMenu, EquipmentAnalysis, ServiceReport, Settings }
        private MenuState currentState = MenuState.MainMenu;

        void Start()
        {
            InitializeMenu();
            UpdateStatus("Ready for field service");
        }

        void InitializeMenu()
        {
            canvasRect = mainCanvas.GetComponent<RectTransform>();
            canvasGroup = mainCanvas.GetComponent<CanvasGroup>();

            // Setup main menu layout
            titleText.text = "WISE² Field Service VR";
            statusText.text = "Connected to Ray-Ban network";

            // Position menu in front of user
            mainCanvas.worldCamera = Camera.main;
        }

        public void ShowEquipmentAnalysis()
        {
            currentState = MenuState.EquipmentAnalysis;
            titleText.text = "Equipment Analysis";
            UpdateStatus("Scanning equipment...");
        }

        public void ShowServiceReport()
        {
            currentState = MenuState.ServiceReport;
            titleText.text = "Service Report";
            UpdateStatus("Generating report...");
        }

        public void UpdateStatus(string message)
        {
            statusText.text = message;
        }

        public MenuState GetCurrentState() => currentState;
    }
}
