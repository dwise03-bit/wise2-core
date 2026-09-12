using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace Wise2.XR.Editor
{
    public static class BuildWebGL
    {
        private const string ScenePath = "Assets/Scenes/XRCommandCenter.unity";

        public static void PerformBuild()
        {
            var outputDirectory = Environment.GetEnvironmentVariable("WISE2_XR_WEBGL_BUILD_DIR");
            if (string.IsNullOrWhiteSpace(outputDirectory))
                outputDirectory = Path.Combine("Build", "WebGL");

            Directory.CreateDirectory(outputDirectory);
            Debug.Log($"WISE² XR WebGL: building {ScenePath} -> {outputDirectory}");

            var options = new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = outputDirectory,
                target = BuildTarget.WebGL,
                options = BuildOptions.None
            };

            var report = BuildPipeline.BuildPlayer(options);
            var summary = report.summary;
            Debug.Log($"WISE² XR WebGL: build {summary.result} - {summary.totalSize} bytes -> {summary.outputPath}");

            if (summary.result != BuildResult.Succeeded)
                throw new Exception($"WISE² XR WebGL build failed ({summary.result}).");
        }
    }
}
