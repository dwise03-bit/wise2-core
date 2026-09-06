namespace WISE2.SoundLabs.Core
{
    public static class RoleCapabilities
    {
        public static bool CanVote(LiveRole role) => true;
        public static bool CanChat(LiveRole role) => true;
        public static bool CanCreateVersion(LiveRole role) => role is LiveRole.Owner or LiveRole.CoArtist or LiveRole.Producer;
        public static bool CanPromoteVersion(LiveRole role) => role is LiveRole.Owner or LiveRole.CoArtist;
        public static bool CanModerate(LiveRole role) => role is LiveRole.Owner or LiveRole.Moderator;
        public static bool CanManageRoles(LiveRole role) => role == LiveRole.Owner;
    }
}
