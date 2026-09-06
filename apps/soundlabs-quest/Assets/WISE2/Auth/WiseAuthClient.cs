using System.Threading.Tasks;

namespace WISE2.SoundLabs.Auth
{
    public sealed class WiseAuthClient
    {
        private readonly IAuthTokenStore tokenStore;

        public WiseAuthClient(IAuthTokenStore tokenStore) => this.tokenStore = tokenStore;

        public async Task<bool> HasSessionAsync()
        {
            var token = await tokenStore.GetAccessTokenAsync();
            return !string.IsNullOrWhiteSpace(token);
        }
    }
}
