using UnityEngine;
using UnityEditor;
using UnityEditor.Build.Reporting;

public class BuildScript
{
    [MenuItem("Build/Build APK for Quest")]
    public static void BuildAPK()
    {
        Debug.Log("[BuildScript] Starting Quest APK build...");

        // Get build scenes
        string[] scenes = FindEnabledEditorScenes();
        if (scenes.Length == 0)
        {
            Debug.LogError("[BuildScript] No scenes found in build settings!");
            EditorApplication.Exit(1);
            return;
        }

        // Configure Android build
        EditorUserBuildSettings.androidBuildSubtarget = AndroidBuildSubtarget.Default;
        EditorUserBuildSettings.buildScriptsOnly = false;

        // Set player settings
        PlayerSettings.companyName = "WISE²";
        PlayerSettings.productName = "VR Workspace";
        PlayerSettings.SetApplicationVersion("1.0.0");
        PlayerSettings.Android.bundleVersionCode = 1;
        PlayerSettings.SetScriptingBackend(BuildTargetGroup.Android, ScriptingImplementation.IL2CPP);

        // Graphics settings
        QualitySettings.antiAliasing = 2;
        QualitySettings.shadowResolution = ShadowResolution.Low;
        QualitySettings.shadows = ShadowQuality.HardOnly;

        // XR Settings for VR
        EditorBuildSettings.TryGetConfigObject("com.oculus.build.Settings", out UnityEngine.Object xrSettings);

        // Build options
        BuildOptions options = BuildOptions.None;
        #if DEVELOPMENT_BUILD
        options |= BuildOptions.Development | BuildOptions.ConnectWithProfiler;
        #endif

        // Perform build
        string buildPath = "build/vr-workspace.apk";
        System.IO.Directory.CreateDirectory("build");

        BuildReport report = BuildPipeline.BuildPlayer(
            scenes,
            buildPath,
            BuildTarget.Android,
            options
        );

        // Check result
        BuildSummary summary = report.summary;

        if (summary.result == BuildResult.Succeeded)
        {
            Debug.Log($"[BuildScript] ✅ Build succeeded!");
            Debug.Log($"[BuildScript] APK size: {(summary.totalSize / (1024 * 1024))} MB");
            Debug.Log($"[BuildScript] Build time: {summary.totalTime.TotalSeconds:F1}s");
            Debug.Log($"[BuildScript] Output: {buildPath}");
        }
        else if (summary.result == BuildResult.Failed)
        {
            Debug.LogError($"[BuildScript] ❌ Build failed!");
            Debug.LogError($"[BuildScript] Errors: {summary.totalErrors}");
            foreach (var step in report.steps)
            {
                foreach (var message in step.messages)
                {
                    if (message.type == LogType.Error)
                    {
                        Debug.LogError($"[BuildScript] {message.content}");
                    }
                }
            }
            EditorApplication.Exit(1);
        }
    }

    private static string[] FindEnabledEditorScenes()
    {
        System.Collections.Generic.List<string> editorScenes = new();
        foreach (EditorBuildSettingsScene scene in EditorBuildSettings.scenes)
        {
            if (scene.enabled)
            {
                editorScenes.Add(scene.path);
            }
        }
        return editorScenes.ToArray();
    }
}
