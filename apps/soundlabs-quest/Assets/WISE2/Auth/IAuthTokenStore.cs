using System.Threading.Tasks;

namespace WISE2.SoundLabs.Auth
{
    public interface IAuthTokenStore
    {
        Task<string> GetAccessTokenAsync();
        Task SetAccessTokenAsync(string token);
        Task ClearAsync();
    }
}
