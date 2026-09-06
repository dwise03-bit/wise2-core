using System;

namespace WISE2.SoundLabs.Networking
{
    public sealed class WiseApiConfig
    {
        public Uri BaseUrl { get; }

        public WiseApiConfig(string baseUrl, bool production)
        {
            if (!Uri.TryCreate(baseUrl, UriKind.Absolute, out var uri))
                throw new ArgumentException("WISE² API base URL must be absolute.", nameof(baseUrl));
            if (production && uri.Scheme != Uri.UriSchemeHttps)
                throw new ArgumentException("WISE² production API must use HTTPS.", nameof(baseUrl));
            BaseUrl = uri;
        }
    }
}
