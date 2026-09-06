using NUnit.Framework;
using WISE2.SoundLabs.Core;

namespace WISE2.SoundLabs.Tests.EditMode
{
    public class RoleCapabilitiesTests
    {
        [Test]
        public void ViewerCanVoteButCannotPromote()
        {
            Assert.That(RoleCapabilities.CanVote(LiveRole.Viewer), Is.True);
            Assert.That(RoleCapabilities.CanPromoteVersion(LiveRole.Viewer), Is.False);
        }

        [Test]
        public void ModeratorCanModerateButCannotPromote()
        {
            Assert.That(RoleCapabilities.CanModerate(LiveRole.Moderator), Is.True);
            Assert.That(RoleCapabilities.CanPromoteVersion(LiveRole.Moderator), Is.False);
        }

        [Test]
        public void OwnerCanManageRoomAndCreativeState()
        {
            Assert.That(RoleCapabilities.CanManageRoles(LiveRole.Owner), Is.True);
            Assert.That(RoleCapabilities.CanPromoteVersion(LiveRole.Owner), Is.True);
        }
    }
}
