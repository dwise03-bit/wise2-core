using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

namespace Wise2.XR
{
    [Serializable] public sealed class ContractorJob { public string id, title, status, technician, customerName, scheduledAt; }
    [Serializable] internal sealed class ContractorJobList { public ContractorJob[] jobs; }

    public sealed class ContractorOsApiClient
    {
        private readonly string baseUrl;
        private readonly Func<string> tokenProvider;
        public IReadOnlyList<ContractorJob> TodaysJobs { get; private set; } = new List<ContractorJob>();
        public bool IsDemo { get; private set; } = true;
        public string Status { get; private set; } = "OFFLINE DEMO";
        public ContractorOsApiClient(string url, Func<string> token = null) { baseUrl = (url ?? "").TrimEnd('/'); tokenProvider = token ?? (() => Environment.GetEnvironmentVariable("WISE2_XR_TOKEN")); }
        public IEnumerator Refresh()
        {
            if (string.IsNullOrEmpty(baseUrl)) { SetDemo("NO API URL"); yield break; }
            using (var request = UnityWebRequest.Get($"{baseUrl}/revenue-os/service-jobs/today-jobs"))
            {
                request.timeout = 8; var token = tokenProvider?.Invoke();
                if (!string.IsNullOrEmpty(token)) request.SetRequestHeader("Authorization", $"Bearer {token}");
                yield return request.SendWebRequest();
                if (request.result != UnityWebRequest.Result.Success) { SetDemo("AUTH OR NETWORK UNAVAILABLE"); yield break; }
                var text = request.downloadHandler.text.Trim(); if (text.StartsWith("[")) text = $"{{\"jobs\":{text}}}";
                var parsed = JsonUtility.FromJson<ContractorJobList>(text);
                if (parsed?.jobs == null) { SetDemo("INVALID JOB RESPONSE"); yield break; }
                TodaysJobs = parsed.jobs; IsDemo = false; Status = "CONTRACTOR OS LINKED";
            }
        }
        private void SetDemo(string reason) { IsDemo = true; Status = $"OFFLINE DEMO · {reason}"; TodaysJobs = new List<ContractorJob> { new ContractorJob { id = "demo-job-01", title = "HVAC diagnostic call", status = "ON_SITE", customerName = "Demo Customer" } }; }
    }
}
