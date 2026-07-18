import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      title,
      description,
      generationType,
      genre,
      mood,
      tempo,
      energy,
      duration,
      language,
      vocalStyle,
      lyrics,
      negativePrompt,
      brandKeywords,
      referenceNotes,
    } = body;

    // Validate required fields
    if (!title || !generationType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique ID for this generation task
    const generationId = `gen_${Math.random().toString(36).substring(7)}`;

    // Create generation record (status: PENDING)
    const generation = {
      id: generationId,
      projectId,
      title,
      status: 'processing',
      progress: 0,
      createdAt: new Date(),
      prompt: {
        title,
        description,
        generationType,
        genre,
        mood,
        tempo,
        energy,
        duration,
        language,
        vocalStyle,
        lyrics,
        negativePrompt,
        brandKeywords,
        referenceNotes,
      },
    };

    // TODO: Queue to background job processor (Bull/BullMQ)
    // const queue = await getQueue('audio-generation');
    // await queue.add('generate', generation);

    // TODO: Save to database

    return NextResponse.json(
      {
        generationId,
        status: 'processing',
        message: 'Generation started. You will be notified when complete.',
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('Error creating generation:', error);
    return NextResponse.json(
      { error: 'Failed to start generation' },
      { status: 500 }
    );
  }
}
