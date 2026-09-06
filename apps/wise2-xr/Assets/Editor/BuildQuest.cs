using UnityEditor;
using System;
using System.IO;

namespace Wise2.XR.Editor
{
    public static class BuildQuest
    {
        public static void PerformBuild()
        {
            var targetGroup = BuildPipeline.GetBuildTargetGroup(BuildTarget.Android);
            var defines = PlayerSettings.GetScriptingDefineSymbolsForGroup(targetGroup);
            var usbDev = Environment.GetEnvironmentVariable("WISE2_USB_DEV") == "1";
            if (usbDev && !defines.Contains("WISE2_USB_DEV")) defines = string.IsNullOrEmpty(defines) ? "WISE2_USB_DEV" : defines + ";WISE2_USB_DEV";
            if (!usbDev) defines = defines.Replace("WISE2_USB_DEV", string.Empty).Replace(";;", ";").Trim(';');
            PlayerSettings.SetScriptingDefineSymbolsForGroup(targetGroup, defines);
            var outputDirectory = Environment.GetEnvironmentVariable("WISE2_XR_BUILD_DIR");
            if (string.IsNullOrWhiteSpace(outputDirectory)) outputDirectory = "Build";
            Directory.CreateDirectory(outputDirectory);
            BuildPipeline.BuildPlayer(new[] { "Assets/Scenes/XRCommandCenter.unity" }, Path.Combine(outputDirectory, "WISE2-XR.apk"), BuildTarget.Android, BuildOptions.None);
        }
    }
}
