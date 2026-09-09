using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;
using System;
using System.IO;

namespace Wise2.XR.Editor
{
    public static class BuildQuest
    {
        private const string ScenePath = "Assets/Scenes/XRCommandCenter.unity";

        public static void PerformBuild()
        {
            // Always bake the OpenXR loader + Quest feature into the build first.
            // Without this the headset renders a flat surface (passthrough/black).
            ConfigureQuestXR.Configure();

            var icon = AssetDatabase.LoadAssetAtPath<Texture2D>("Assets/Branding/Wise2XRIcon.jpg");
            if (icon != null)
                PlayerSettings.SetIconsForTargetGroup(BuildTargetGroup.Android, new[] { icon }, IconKind.Application);

            var targetGroup = BuildPipeline.GetBuildTargetGroup(BuildTarget.Android);
            var defines = PlayerSettings.GetScriptingDefineSymbolsForGroup(targetGroup);
            var usbDev = Environment.GetEnvironmentVariable("WISE2_USB_DEV") == "1";
            if (usbDev && !defines.Contains("WISE2_USB_DEV")) defines = string.IsNullOrEmpty(defines) ? "WISE2_USB_DEV" : defines + ";WISE2_USB_DEV";
            if (!usbDev) defines = defines.Replace("WISE2_USB_DEV", string.Empty).Replace(";;", ";").Trim(';');
            PlayerSettings.SetScriptingDefineSymbolsForGroup(targetGroup, defines);

            // Unity 6 + OpenXR/Quest requires the GameActivity application entry
            // point. The legacy UnityPlayerActivity makes Horizon OS treat the app
            // as a 2D window (passthrough / black view in the headset).
            PlayerSettings.Android.applicationEntry = AndroidApplicationEntry.GameActivity;

            var outputDirectory = Environment.GetEnvironmentVariable("WISE2_XR_BUILD_DIR");
            if (string.IsNullOrWhiteSpace(outputDirectory)) outputDirectory = "Build";
            Directory.CreateDirectory(outputDirectory);

            var apkPath = Path.Combine(outputDirectory, "WISE2-XR.apk");
            var report = BuildPipeline.BuildPlayer(
                new[] { ScenePath }, apkPath, BuildTarget.Android, BuildOptions.None);

            var summary = report.summary;
            Debug.Log($"WISE² XR: build {summary.result} - {summary.totalSize} bytes -> {summary.outputPath}");
            if (summary.result != BuildResult.Succeeded)
                throw new Exception($"WISE² XR: APK build failed ({summary.result}).");
        }
    }
}
