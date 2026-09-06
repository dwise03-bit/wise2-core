using UnityEngine;

namespace Wise2.XR
{
    public static class Wise2Config
    {
#if WISE2_USB_DEV
        public const string ApiBaseUrl = "http://127.0.0.1:3010";
#else
        public const string ApiBaseUrl = "https://api.wise2.net";
#endif
        public const string ProductName = "WISE² XR COMMAND CENTER";
    }
}
