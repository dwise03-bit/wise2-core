/**
 * Hermes Image Generation Service
 * Integrates GPU SDXL generation with Hermes intelligence
 */

import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface GenerationRequest {
  campaign: string;
  style?: string;
  count?: number;
  userId: string;
}

interface GenerationResult {
  success: boolean;
  images: string[];
  metadata: {
    model: string;
    timestamp: string;
    userId: string;
    campaign: string;
  };
  hermesInsights?: string;
}

const HERMES_API = 'http://localhost:3012/api';
const COMFYUI_API = 'http://localhost:8188/api';
const GENERATOR_SCRIPT = '/home/dwise/wise2-core/scripts/piff-city-generator.py';

/**
 * Request Hermes to optimize prompts for a campaign
 */
async function askHermesForPrompts(campaign: string, style?: string): Promise<string[]> {
  try {
    const response = await axios.post(`${HERMES_API}/query`, {
      query: `You are an expert AI image prompt engineer. Optimize these PIFF CITY ${campaign} campaign prompts for Stable Diffusion XL:

Campaign: ${campaign}
Style: ${style || 'cinematic luxury luxury tech'}

Provide 5 production-ready SDXL prompts (one per line). Focus on:
- Cinematic lighting and composition
- Brand colors (Purple #9d4edd, Green #39ff14)
- Technical precision for SDXL
- No Midjourney-specific syntax

Return only the 5 prompts, one per line, no numbering.`,
      context: 'piff-city-campaign-generation',
    });

    if (response.data.response) {
      return response.data.response
        .split('\n')
        .filter((line: string) => line.trim().length > 0)
        .slice(0, 5);
    }
  } catch (error) {
    console.error('Hermes prompt optimization failed:', error);
  }

  // Fallback to default prompts if Hermes fails
  return getDefaultPrompts(campaign);
}

/**
 * Ask Hermes for generation recommendations
 */
async function askHermesForRecommendations(campaign: string): Promise<string> {
  try {
    const response = await axios.post(`${HERMES_API}/query`, {
      query: `For the PIFF CITY × WISE² "${campaign}" Instagram campaign:
1. What visual elements should we emphasize?
2. What brand identity points are critical?
3. What variations would resonate with our audience?
4. Any technical considerations for image generation?

Provide concise, actionable recommendations.`,
      context: 'piff-city-campaign-strategy',
    });

    return response.data.response || 'No recommendations available';
  } catch (error) {
    console.error('Hermes recommendations failed:', error);
    return 'Generation proceeding with default strategy';
  }
}

/**
 * Store generation results in Hermes knowledge base
 */
async function storeInHermesKnowledge(
  campaign: string,
  images: string[],
  insights: string
): Promise<void> {
  try {
    await axios.post(`${HERMES_API}/knowledge/store`, {
      topic: `piff-city-${campaign}-generation`,
      content: `
## Generated Campaign: ${campaign}
**Date**: ${new Date().toISOString()}
**Images**: ${images.length} posts generated
**Model**: SDXL 1.0 (local GPU)

### Insights
${insights}

### Files
${images.map((img, i) => `- Post ${i + 1}: ${img}`).join('\n')}
`,
      tags: ['piff-city', 'campaign', 'image-generation', campaign],
    });
  } catch (error) {
    console.error('Failed to store in Hermes:', error);
  }
}

/**
 * Generate images through GPU and report to Hermes
 */
async function generateCampaign(
  request: GenerationRequest
): Promise<GenerationResult> {
  console.log(`🎬 Hermes initiating ${request.campaign} campaign generation...`);

  // Step 1: Ask Hermes for prompt optimization
  console.log('🧠 Consulting Hermes for prompt optimization...');
  const optimizedPrompts = await askHermesForPrompts(
    request.campaign,
    request.style
  );

  // Step 2: Get Hermes recommendations
  console.log('💡 Gathering Hermes recommendations...');
  const recommendations = await askHermesForRecommendations(request.campaign);

  // Step 3: Run generator script
  console.log('⚙️ Starting image generation...');
  const startTime = Date.now();

  try {
    // Execute generator script
    const { stdout, stderr } = await execAsync(
      `cd ~/wise2-core && python scripts/piff-city-generator.py`
    );

    if (stderr) {
      console.error('Generator warning:', stderr);
    }

    // Collect generated images
    const { stdout: fileList } = await execAsync(
      `ls -1 ~/wise2-core/instagram_posts/instagram_*.png 2>/dev/null | head -5`
    );

    const images = fileList
      .split('\n')
      .filter((line: string) => line.trim().length > 0);

    const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);

    const result: GenerationResult = {
      success: true,
      images,
      metadata: {
        model: 'SDXL 1.0',
        timestamp: new Date().toISOString(),
        userId: request.userId,
        campaign: request.campaign,
      },
      hermesInsights: recommendations,
    };

    // Step 4: Store results in Hermes
    console.log('📚 Storing results in Hermes knowledge base...');
    await storeInHermesKnowledge(
      request.campaign,
      images,
      `Generated in ${generationTime}s with ${images.length} images. Recommendations: ${recommendations}`
    );

    console.log(
      `✅ Generation complete! ${images.length} images created in ${generationTime}s`
    );

    return result;
  } catch (error) {
    console.error('Generation failed:', error);

    return {
      success: false,
      images: [],
      metadata: {
        model: 'SDXL 1.0',
        timestamp: new Date().toISOString(),
        userId: request.userId,
        campaign: request.campaign,
      },
      hermesInsights: `Error during generation: ${error}`,
    };
  }
}

/**
 * Get default prompts if Hermes optimization fails
 */
function getDefaultPrompts(campaign: string): string[] {
  const defaultPrompts: Record<string, string[]> = {
    'hero-announcement': [
      'A cinematic luxury composition with neon purple and electric green neon text reading "CULTURE MEETS SYSTEMS" and "PIFF CITY × WISE²"...',
      'Premium luxury tech aesthetic with volumetric purple fog, rim lighting, chrome accents...',
    ],
    'split-identity': [
      'Split-screen luxury composition with royal purple left side and electric green right side...',
      'Left: "PIFF CITY CULTURE PRODUCTION" with crown emoji, Right: "WISE² SYSTEMS" with lightning bolt...',
    ],
    'workforce': [
      'Futuristic command center interior at night with sleek matte black surfaces...',
      'Holographic AI interface displaying "DIGITAL WORKFORCE" with robot icon...',
    ],
  };

  return (
    defaultPrompts[campaign] || [
      'A cinematic luxury composition with PIFF CITY × WISE² branding...',
    ]
  );
}

/**
 * Express endpoint for Discord bot / API integration
 */
export async function handleGenerationRequest(
  req: any,
  res: any
): Promise<void> {
  const { campaign, style, userId } = req.body;

  if (!campaign || !userId) {
    return res.status(400).json({
      error: 'Missing required fields: campaign, userId',
    });
  }

  try {
    const result = await generateCampaign({
      campaign,
      style,
      userId,
      count: 5,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Generation failed',
      details: error,
    });
  }
}

export default {
  generateCampaign,
  askHermesForPrompts,
  askHermesForRecommendations,
  storeInHermesKnowledge,
  handleGenerationRequest,
};
