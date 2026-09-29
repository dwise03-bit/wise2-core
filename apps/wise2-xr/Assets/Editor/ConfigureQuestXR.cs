using System.Linq;
using UnityEditor;
using UnityEditor.XR.Management;
using UnityEditor.XR.Management.Metadata;
using UnityEngine;
using UnityEngine.XR.Management;
using UnityEngine.XR.OpenXR;
using UnityEngine.XR.OpenXR.Features;
using UnityEngine.XR.OpenXR.Features.Interactions;
using UnityEngine.XR.OpenXR.Features.MetaQuestSupport;

namespace Wise2.XR.Editor
{
    /// <summary>
    /// Idempotent, headless-safe Quest/OpenXR configuration. Invoked by
    /// <see cref="BuildQuest.PerformBuild"/> before every APK build so a clean
    /// checkout always ships with the OpenXR loader baked in and the headset
    /// renders the immersive scene instead of a flat passthrough/black view.
    /// </summary>
    public static class ConfigureQuestXR
    {
        private const string SettingsPath = "Assets/XR/XRGeneralSettingsPerBuildTarget.asset";
        private const string LoaderSettingsKey = "com.unity.xr.management.loader_settings";
        private const string OpenXrLoaderType = "UnityEngine.XR.OpenXR.OpenXRLoader";

        [MenuItem("WISE2/Configure Quest XR")]
        public static void Configure()
        {
            var settings = AssetDatabase.LoadAssetAtPath<XRGeneralSettingsPerBuildTarget>(SettingsPath);
            if (settings == null)
            {
                settings = ScriptableObject.CreateInstance<XRGeneralSettingsPerBuildTarget>();
                AssetDatabase.CreateAsset(settings, SettingsPath);
            }

            // Make sure Unity actually uses this asset as the active XR settings.
            EditorBuildSettings.AddConfigObject(LoaderSettingsKey, settings, true);

            settings.CreateDefaultManagerSettingsForBuildTarget(BuildTargetGroup.Android);
            var general = settings.SettingsForBuildTarget(BuildTargetGroup.Android);
            general.InitManagerOnStart = true;

            if (!XRPackageMetadataStore.AssignLoader(general.Manager, OpenXrLoaderType, BuildTargetGroup.Android))
                throw new System.Exception("Could not assign OpenXR loader for Android.");

            var openXr = OpenXRSettings.GetSettingsForBuildTargetGroup(BuildTargetGroup.Android);
            if (openXr == null)
                throw new System.Exception("OpenXR settings for Android were not found.");

            // Single Pass Instanced is the supported/perf path on Quest.
            openXr.renderMode = OpenXRSettings.RenderMode.SinglePassInstanced;

            EnableFeature<MetaQuestFeature>(openXr, required: true);
            EnableFeature<OculusTouchControllerProfile>(openXr, required: false);

            PlayerSettings.SetApplicationIdentifier(BuildTargetGroup.Android, "com.wise2.xrcommandcenter");
            if (PlayerSettings.Android.minSdkVersion < AndroidSdkVersions.AndroidApiLevel29)
                PlayerSettings.Android.minSdkVersion = AndroidSdkVersions.AndroidApiLevel29;

            EnsureAlwaysIncludedShaders();

            EditorUtility.SetDirty(settings);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("WISE² XR: Android OpenXR loader + Meta Quest feature configured.");
        }

        private static void EnableFeature<T>(OpenXRSettings openXr, bool required) where T : OpenXRFeature
        {
            var feature = openXr.GetFeature<T>();
            if (feature == null)
            {
                var msg = $"WISE² XR: OpenXR feature {typeof(T).Name} not found.";
                if (required) throw new System.Exception(msg);
                Debug.LogWarning(msg + " Skipping.");
                return;
            }

            feature.enabled = true;
            EditorUtility.SetDirty(feature);
        }

        /// <summary>
        /// The runtime scene is built entirely from primitives at play time, so
        /// there is no material asset to keep these shaders out of the stripper's
        /// reach. Force the ones the runtime relies on into every build.
        /// </summary>
        private static void EnsureAlwaysIncludedShaders()
        {
            var wanted = new[]
            {
                "Standard",
                "Unlit/Color",
                "Sprites/Default",
                "UI/Default",
                "Legacy Shaders/Diffuse",
                "GUI/Text Shader",
            };

            var graphicsSettings = AssetDatabase
                .LoadAllAssetsAtPath("ProjectSettings/GraphicsSettings.asset")
                .FirstOrDefault();
            if (graphicsSettings == null)
                return;

            var so = new SerializedObject(graphicsSettings);
            var list = so.FindProperty("m_AlwaysIncludedShaders");
            if (list == null)
                return;

            foreach (var name in wanted)
            {
                var shader = Shader.Find(name);
                if (shader == null)
                    continue;

                var present = Enumerable.Range(0, list.arraySize)
                    .Any(i => list.GetArrayElementAtIndex(i).objectReferenceValue == shader);
                if (present)
                    continue;

                list.arraySize++;
                list.GetArrayElementAtIndex(list.arraySize - 1).objectReferenceValue = shader;
            }

            so.ApplyModifiedProperties();
        }
    }
}
