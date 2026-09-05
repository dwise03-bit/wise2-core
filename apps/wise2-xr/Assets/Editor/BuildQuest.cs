using UnityEditor;

namespace Wise2.XR.Editor
{
    public static class BuildQuest
    {
        public static void PerformBuild()
        {
            BuildPipeline.BuildPlayer(new[] { "Assets/Scenes/XRCommandCenter.unity" }, "Build/WISE2-XR.apk", BuildTarget.Android, BuildOptions.None);
        }
    }
}
