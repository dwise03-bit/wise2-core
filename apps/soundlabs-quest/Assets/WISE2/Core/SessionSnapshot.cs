using System;
using System.Collections.Generic;

namespace WISE2.SoundLabs.Core
{
    [Serializable]
    public sealed class SessionSnapshot
    {
        public string SessionId = string.Empty;
        public string ProjectId = string.Empty;
        public string Title = string.Empty;
        public CrowdMode CrowdMode;
        public LiveRole CurrentUserRole;
        public string CurrentTrackId = string.Empty;
        public string CurrentVersionId = string.Empty;
        public string OpenPollId = string.Empty;
        public long ServerUnixTimeMs;
        public List<ParticipantSnapshot> Participants = new();
    }

    [Serializable]
    public sealed class ParticipantSnapshot
    {
        public string UserId = string.Empty;
        public string DisplayName = string.Empty;
        public LiveRole Role;
        public bool Online;
    }
}
