import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { genre, mood, theme } = await request.json();

    if (!theme?.trim()) {
      return NextResponse.json({ error: 'Theme is required' }, { status: 400 });
    }

    // Use free Hugging Face Inference API (requires no auth for many models)
    // Alternative: Use local generation or Groq free tier
    const prompt = `Write a creative song lyric in ${genre} style with a ${mood} mood about: ${theme}

Format as verse-chorus-verse with multiple lines. Make it original and catchy.`;

    const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY || ''}`,
      },
      method: 'POST',
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      // Fallback: Generate placeholder lyrics with AI structure
      const fallbackLyrics = generateFallbackLyrics(genre, mood, theme);
      return NextResponse.json({ lyrics: fallbackLyrics });
    }

    const result: any = await response.json();
    const generatedText = result[0]?.generated_text || result?.generated_text || '';

    return NextResponse.json({
      lyrics: generatedText || generateFallbackLyrics(genre, mood, theme),
    });
  } catch (error) {
    console.error('Lyrics generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate lyrics' },
      { status: 500 }
    );
  }
}

function generateFallbackLyrics(genre: string, mood: string, theme: string): string {
  const verses = {
    pop: [
      `Waking up to ${theme}`,
      `Lost in the moment, thinking of ${theme}`,
      `Dancing through the night with ${theme}`,
    ],
    'hip-hop': [
      `Yo, let me talk about ${theme}`,
      `It's all about ${theme}, that's the vibe`,
      `Real talk, speaking facts about ${theme}`,
    ],
    rock: [
      `Turn it up loud for ${theme}`,
      `Electric energy, ${theme} running deep`,
      `Breaking free with ${theme}`,
    ],
  };

  const moodAdjectives = {
    upbeat: 'shining bright, electrifying, alive',
    melancholic: 'fading light, aching heart, alone',
    energetic: 'burning fire, wild and free, unstoppable',
    romantic: 'tender touch, whispered words, forever',
    aggressive: 'striking hard, raw power, relentless',
    chill: 'flowing smooth, easy nights, laid back',
  };

  const baseGenre = (genre as keyof typeof verses) in verses ? genre : 'pop';
  const vibe = (mood as keyof typeof moodAdjectives) in moodAdjectives ? mood : 'upbeat';
  const verseOptions = verses[baseGenre as keyof typeof verses] || verses.pop;
  const adjectives = moodAdjectives[vibe as keyof typeof moodAdjectives] || moodAdjectives.upbeat;

  return `[Verse 1]
${verseOptions[0]}
${adjectives}
Writing the story of you and me

[Chorus]
This is about ${theme}
Feel it, it's moving
${adjectives}
Together we're ${theme}

[Verse 2]
${verseOptions[1]}
Every moment feels true
Building something new with you

[Chorus]
This is about ${theme}
Feel it, it's moving
${adjectives}
Together we're ${theme}

[Bridge]
In this moment, we're free
${theme} is all we need
Forever, you and me`;
}
