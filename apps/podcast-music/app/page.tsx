export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>WISE² Podcast Music API</h1>
      <p>AI-powered podcast music generation platform</p>

      <section>
        <h2>API Endpoints</h2>

        <h3>Authentication</h3>
        <ul>
          <li>
            <strong>POST /api/auth/signup</strong> - Register new user
            <pre>{`{
  "email": "user@example.com",
  "name": "User Name",
  "password": "securepassword",
  "confirmPassword": "securepassword"
}`}</pre>
          </li>
          <li>
            <strong>POST /api/auth/login</strong> - Login user
            <pre>{`{
  "email": "user@example.com",
  "password": "securepassword"
}`}</pre>
          </li>
        </ul>

        <h3>Projects</h3>
        <ul>
          <li>
            <strong>GET /api/projects</strong> - List user's podcast projects
          </li>
          <li>
            <strong>POST /api/projects</strong> - Create new podcast project
            <pre>{`{
  "title": "Episode 1 Music",
  "description": "Background music for episode 1",
  "podcastName": "My Podcast",
  "podcastCategory": "Technology",
  "episodeNumber": 1,
  "mood": "upbeat",
  "duration": 300,
  "genre": "electronic"
}`}</pre>
          </li>
          <li>
            <strong>GET /api/projects/[id]</strong> - Get specific project
          </li>
          <li>
            <strong>PUT /api/projects/[id]</strong> - Update project
          </li>
          <li>
            <strong>DELETE /api/projects/[id]</strong> - Delete project
          </li>
        </ul>

        <h3>Audio Generation</h3>
        <ul>
          <li>
            <strong>POST /api/generate</strong> - Start AI audio generation job
            <pre>{`{
  "podcastProjectId": "cid123...",
  "prompt": "Create upbeat electronic music for a tech podcast",
  "aiModel": "default",
  "seed": 42
}`}</pre>
          </li>
          <li>
            <strong>GET /api/generate?jobId=job_123</strong> - Check generation status
          </li>
        </ul>

        <h3>Downloads</h3>
        <ul>
          <li>
            <strong>GET /api/download?audioGenerationId=aid_123</strong> - Download audio file
          </li>
          <li>
            <strong>HEAD /api/download?audioGenerationId=aid_123</strong> - Get file metadata
          </li>
        </ul>

        <h3>Subscription</h3>
        <ul>
          <li>
            <strong>GET /api/subscription</strong> - Get current subscription
          </li>
          <li>
            <strong>POST /api/subscription</strong> - Create subscription
            <pre>{`{
  "paymentMethodId": "pm_...",
  "priceId": "price_..."
}`}</pre>
          </li>
          <li>
            <strong>DELETE /api/subscription</strong> - Cancel subscription
          </li>
        </ul>

        <h3>System</h3>
        <ul>
          <li>
            <strong>GET /api/health</strong> - Health check (no auth required)
          </li>
        </ul>
      </section>

      <section>
        <h2>Authentication</h2>
        <p>
          All endpoints except <code>/api/auth/*</code> and <code>/api/health</code> require
          JWT authentication.
        </p>
        <p>
          Include the token in the Authorization header:
          <pre>Authorization: Bearer {'{token}'}</pre>
        </p>
      </section>

      <section>
        <h2>Pricing</h2>
        <ul>
          <li>
            <strong>Starter Plan:</strong> $0/month (trial) - 10 generations/month
          </li>
          <li>
            <strong>Pro Plan:</strong> $49/month - 100 generations/month
          </li>
          <li>
            <strong>Enterprise:</strong> Custom pricing - Unlimited
          </li>
        </ul>
      </section>

      <section>
        <h2>Rate Limits</h2>
        <p>
          Rate limiting is enforced at the subscription plan level. Requests
          exceeding the monthly generation limit will receive a 429 (Too Many Requests)
          response.
        </p>
      </section>

      <section style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5' }}>
        <h3>Status</h3>
        <p>✓ Backend API running</p>
        <p>✓ Database connected</p>
        <p>✓ Stripe integration ready (test mode)</p>
      </section>
    </main>
  );
}
