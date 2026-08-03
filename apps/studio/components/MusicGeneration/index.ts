// Core Generation Components
export { MusicGenerationPromptBuilder } from './PromptBuilder';
export { default as GenerationLibrary } from './GenerationLibrary';
export { VoiceCloner } from './VoiceCloner';

// Music Generation UI Suite (New Modular Components)
export { GenerationPrompt } from './GenerationPrompt';
export { StyleSelector } from './StyleSelector';
export { MoodSelector } from './MoodSelector';
export { TempoControl } from './TempoControl';
export { DurationSelector } from './DurationSelector';
export { VoiceSelector } from './VoiceSelector';
export { InstrumentPicker } from './InstrumentPicker';
export { KeyScaleControl } from './KeyScaleControl';
export { IntensityControl } from './IntensityControl';
export { GenerationQueue } from './GenerationQueue';
export { GenerationHistory } from './GenerationHistory';

// Advanced Music Generation Features
export { ContinuationPanel } from './Advanced/ContinuationPanel';
export { RemixInterface } from './Advanced/RemixInterface';
export { StyleTransfer } from './Advanced/StyleTransfer';
export { StemSeparation } from './Advanced/StemSeparation';

// Default export
export { default } from './PromptBuilder';
