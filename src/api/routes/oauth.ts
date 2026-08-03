/**
 * OAuth Integration Routes
 * Handles OAuth2 callbacks for all providers
 */

import { Router, Request, Response } from 'express';
import { getProvider } from '../../config/providers';
import oauthService from '../../services/oauth-service';
import { AuthorizationStatus } from '../../types/integrations';

const router = Router();

/**
 * POST /api/v1/integrations/:provider/connect
 * Initiate OAuth connection
 */
router.post('/:provider/connect', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const { userId, organizationId, capabilities } = req.body;

    if (!userId || !organizationId) {
      return res.status(400).json({ error: 'Missing userId or organizationId' });
    }

    const providerConfig = getProvider(provider);
    if (!providerConfig?.oauth) {
      return res.status(400).json({ error: `Provider ${provider} does not support OAuth` });
    }

    const authUrl = oauthService.getAuthorizationUrl(provider, userId, organizationId, capabilities);

    if (!authUrl) {
      return res.status(500).json({ error: 'Failed to generate authorization URL' });
    }

    res.json({ authUrl });
  } catch (error) {
    console.error('OAuth connect error:', error);
    res.status(500).json({ error: 'Failed to initiate OAuth connection' });
  }
});

/**
 * GET /api/v1/integrations/google/callback
 * Google OAuth callback
 */
router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, error, error_description } = req.query;

    if (error) {
      console.error(`Google OAuth error: ${error} - ${error_description}`);
      return res.redirect(`/settings/integrations?error=google_auth_failed&message=${error_description}`);
    }

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state' });
    }

    // Validate state
    const oauthState = oauthService.validateState(state as string);
    if (!oauthState) {
      return res.status(400).json({ error: 'Invalid or expired state' });
    }

    // Exchange code for tokens
    const tokens = await oauthService.exchangeCode('google', code as string);
    if (!tokens) {
      return res.status(500).json({ error: 'Failed to exchange authorization code' });
    }

    // TODO: Save integration to database
    const integration = {
      userId: oauthState.userId,
      organizationId: oauthState.organizationId,
      providerId: 'google',
      authType: 'OAUTH2',
      status: AuthorizationStatus.CONNECTED,
      externalAccountName: 'user@gmail.com', // Would get from Google API
      oauthScopes: oauthState.capabilities || ['sign_in'],
      encryptedAccessToken: oauthService.encryptToken(tokens.accessToken),
      encryptedRefreshToken: tokens.refreshToken ? oauthService.encryptToken(tokens.refreshToken) : undefined,
      tokenExpiresAt: tokens.expiresIn ? new Date(Date.now() + tokens.expiresIn * 1000) : undefined,
      tokenType: tokens.tokenType,
    };

    // Redirect to success page
    res.redirect(`/settings/integrations?provider=google&status=connected`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`/settings/integrations?error=callback_failed`);
  }
});

/**
 * GET /api/v1/integrations/kick/callback
 * Kick OAuth callback
 */
router.get('/kick/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, error, error_description } = req.query;

    if (error) {
      console.error(`Kick OAuth error: ${error} - ${error_description}`);
      return res.redirect(`/studio/setup?error=kick_auth_failed&message=${error_description}`);
    }

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state' });
    }

    // Validate state
    const oauthState = oauthService.validateState(state as string);
    if (!oauthState) {
      return res.status(400).json({ error: 'Invalid or expired state' });
    }

    // Exchange code for tokens
    const tokens = await oauthService.exchangeCode('kick', code as string);
    if (!tokens) {
      return res.status(500).json({ error: 'Failed to exchange authorization code' });
    }

    // TODO: Save integration to database
    const integration = {
      userId: oauthState.userId,
      organizationId: oauthState.organizationId,
      providerId: 'kick',
      authType: 'OAUTH2',
      status: AuthorizationStatus.CONNECTED,
      encryptedAccessToken: oauthService.encryptToken(tokens.accessToken),
      encryptedRefreshToken: tokens.refreshToken ? oauthService.encryptToken(tokens.refreshToken) : undefined,
      tokenExpiresAt: tokens.expiresIn ? new Date(Date.now() + tokens.expiresIn * 1000) : undefined,
    };

    // Redirect to Live Studio setup
    res.redirect(`/studio/setup?provider=kick&status=connected`);
  } catch (error) {
    console.error('Kick callback error:', error);
    res.redirect(`/studio/setup?error=callback_failed`);
  }
});

/**
 * GET /api/v1/integrations/discord/callback
 * Discord OAuth callback
 */
router.get('/discord/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, error, error_description } = req.query;

    if (error) {
      console.error(`Discord OAuth error: ${error} - ${error_description}`);
      return res.redirect(`/studio/setup?error=discord_auth_failed&message=${error_description}`);
    }

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state' });
    }

    // Validate state
    const oauthState = oauthService.validateState(state as string);
    if (!oauthState) {
      return res.status(400).json({ error: 'Invalid or expired state' });
    }

    // Exchange code for tokens
    const tokens = await oauthService.exchangeCode('discord', code as string);
    if (!tokens) {
      return res.status(500).json({ error: 'Failed to exchange authorization code' });
    }

    // TODO: Save integration to database
    const integration = {
      userId: oauthState.userId,
      organizationId: oauthState.organizationId,
      providerId: 'discord',
      authType: 'OAUTH2',
      status: AuthorizationStatus.CONNECTED,
      encryptedAccessToken: oauthService.encryptToken(tokens.accessToken),
      oauthScopes: tokens.scope?.split(' ') || [],
    };

    // Redirect to Live Studio setup
    res.redirect(`/studio/setup?provider=discord&status=connected`);
  } catch (error) {
    console.error('Discord callback error:', error);
    res.redirect(`/studio/setup?error=callback_failed`);
  }
});

/**
 * POST /api/v1/integrations/:provider/disconnect
 * Disconnect an integration
 */
router.post('/:provider/disconnect', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const { userId, organizationId } = req.body;

    if (!userId || !organizationId) {
      return res.status(400).json({ error: 'Missing userId or organizationId' });
    }

    // TODO: Get integration from database
    // TODO: Revoke token
    // TODO: Delete from database

    res.json({ success: true, message: `${provider} disconnected` });
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect integration' });
  }
});

/**
 * POST /api/v1/integrations/:provider/reauthorize
 * Reauthorize an expired integration
 */
router.post('/:provider/reauthorize', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const { userId, organizationId } = req.body;

    if (!userId || !organizationId) {
      return res.status(400).json({ error: 'Missing userId or organizationId' });
    }

    const authUrl = oauthService.getAuthorizationUrl(provider, userId, organizationId);

    if (!authUrl) {
      return res.status(500).json({ error: 'Failed to generate authorization URL' });
    }

    res.json({ authUrl });
  } catch (error) {
    console.error('Reauthorize error:', error);
    res.status(500).json({ error: 'Failed to reauthorize integration' });
  }
});

/**
 * GET /api/v1/integrations/:provider/status
 * Check integration status
 */
router.get('/:provider/status', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const { userId, organizationId } = req.query;

    if (!userId || !organizationId) {
      return res.status(400).json({ error: 'Missing userId or organizationId' });
    }

    // TODO: Get integration from database
    // TODO: Check if tokens are expired
    // TODO: Return status

    res.json({
      provider,
      status: 'connected', // or 'not_connected', 'authorization_required', 'error'
      connectedAt: new Date(),
      lastSync: new Date(),
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ error: 'Failed to get integration status' });
  }
});

export default router;
