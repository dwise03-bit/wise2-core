using System;
using System.Threading.Tasks;

namespace WISE2.SoundLabs.Auth
{
    public sealed class QuestAuthTokenStore : IAuthTokenStore
    {
        public Task<string> GetAccessTokenAsync() => throw new PlatformNotSupportedException("Bind this interface to Android Keystore-backed secure storage in the Quest runtime bootstrap.");
        public Task SetAccessTokenAsync(string token) => throw new PlatformNotSupportedException("Bind this interface to Android Keystore-backed secure storage in the Quest runtime bootstrap.");
        public Task ClearAsync() => throw new PlatformNotSupportedException("Bind this interface to Android Keystore-backed secure storage in the Quest runtime bootstrap.");
    }
}
