/**
 * WISE² Trading Education Knowledge Base
 * Structured trading concepts and educational resources
 * Integrated with AI Trading Assistant
 */

export interface EducationResource {
  id: string;
  title: string;
  category: 'concept' | 'strategy' | 'risk' | 'psychology' | 'technical' | 'fundamental';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: string;
  keyPoints: string[];
  relatedTopics: string[];
  exampleScenarios: string[];
}

export const tradingEducationBase: EducationResource[] = [
  {
    id: 'liquidity-basics',
    title: 'Understanding Market Liquidity',
    category: 'concept',
    difficulty: 'beginner',
    content: `Liquidity refers to how easily an asset can be bought or sold without significantly affecting its price.
High liquidity markets have many buyers and sellers, allowing for quick execution at minimal slippage.
Low liquidity markets can have wider spreads and more price impact from large trades.`,
    keyPoints: [
      'Bid-ask spread indicates liquidity quality',
      'Higher volume = typically better liquidity',
      'Time of day affects liquidity (market hours vs afterhours)',
      'Different instruments have different liquidity profiles'
    ],
    relatedTopics: ['slippage', 'market-microstructure', 'order-types'],
    exampleScenarios: [
      'Trading major forex pairs vs exotic pairs',
      'Trading stocks during market open vs close',
      'Impact of liquidity on position sizing'
    ]
  },
  {
    id: 'slippage',
    title: 'Slippage and Market Impact',
    category: 'concept',
    difficulty: 'intermediate',
    content: `Slippage is the difference between expected execution price and actual execution price.
Market impact occurs when a large order moves the market price against you. Both reduce profitability and
must be factored into trading decisions.`,
    keyPoints: [
      'Larger orders cause more slippage',
      'Volatile markets increase slippage risk',
      'Limit orders reduce slippage vs market orders',
      'Slippage costs compound on high-frequency trading'
    ],
    relatedTopics: ['liquidity-basics', 'order-types', 'position-sizing'],
    exampleScenarios: [
      'Executing 100k share order in 1000 share chunks',
      'FOMO trading during volatility spikes',
      'Impact of news announcements on slippage'
    ]
  },
  {
    id: 'risk-management-core',
    title: 'Core Risk Management Principles',
    category: 'risk',
    difficulty: 'beginner',
    content: `Risk management is the foundation of profitable trading. Without proper risk controls,
even profitable strategies can blow up accounts. The goal is to lose small on bad trades and win big on good ones.`,
    keyPoints: [
      'Position sizing based on account risk (1-2% per trade)',
      'Stop losses prevent catastrophic losses',
      'Risk-reward ratio should be favorable (1:2 minimum)',
      'Never risk more than you can afford to lose'
    ],
    relatedTopics: ['position-sizing', 'stop-losses', 'take-profit'],
    exampleScenarios: [
      '$10,000 account: risk $100-200 per trade',
      'Setting stops 2x the distance of profit target',
      'Scaling out of winning positions'
    ]
  },
  {
    id: 'position-sizing',
    title: 'Position Sizing Strategy',
    category: 'risk',
    difficulty: 'intermediate',
    content: `Position size determines your profit and loss on each trade. Proper sizing ensures consistent
risk exposure and prevents overleverage. Use fixed fractional or volatility-adjusted sizing for scalability.`,
    keyPoints: [
      'Fixed percentage: risk 1% per trade on account',
      'Volatility adjustment: reduce size in high volatility',
      'Account for slippage when sizing',
      'Scale position size as account grows'
    ],
    relatedTopics: ['risk-management-core', 'leverage', 'kelly-criterion'],
    exampleScenarios: [
      '$50k account × 2% risk = $1000 max loss per trade',
      'Tight stops = larger positions allowed',
      'Wide stops = smaller positions required'
    ]
  },
  {
    id: 'stop-losses',
    title: 'Stop Loss Placement and Strategy',
    category: 'risk',
    difficulty: 'intermediate',
    content: `Stop losses protect against large losses but must be placed strategically to avoid false breakouts.
Placement depends on technical levels, volatility, and your risk tolerance.`,
    keyPoints: [
      'Place below support/above resistance',
      'Account for overnight gaps and volatility',
      'Use trailing stops for momentum trades',
      'Avoid stops at round numbers (obvious to algos)'
    ],
    relatedTopics: ['risk-management-core', 'technical-analysis', 'volatility'],
    exampleScenarios: [
      'Stock 0.5% below support line',
      'Futures trade 1.5× ATR above entry',
      'Forex pair 20 pips below key level'
    ]
  },
  {
    id: 'trading-psychology',
    title: 'Psychology of Profitable Trading',
    category: 'psychology',
    difficulty: 'intermediate',
    content: `The market's biggest adversary is not competition, but your own psychology. Emotional trading
leads to overleverage, revenge trading, and rule violations. Discipline beats emotion every time.`,
    keyPoints: [
      'Fear causes premature exits from winning trades',
      'Greed causes overleverage and oversizing',
      'Revenge trading compounds losses',
      'Stick to your trading plan regardless of emotions'
    ],
    relatedTopics: ['risk-management-core', 'trade-journal', 'loss-acceptance'],
    exampleScenarios: [
      'Exiting winner too early and watching it double',
      'Adding to losing position trying to break even',
      'Trading outside your plan after losing trade',
      'FOMO buying after missing a move'
    ]
  },
  {
    id: 'technical-analysis',
    title: 'Technical Analysis Fundamentals',
    category: 'technical',
    difficulty: 'beginner',
    content: `Technical analysis examines price action, volume, and indicators to identify trends and entry/exit points.
It assumes price movement reflects all available information.`,
    keyPoints: [
      'Trends: up, down, or sideways',
      'Support and resistance levels',
      'Moving averages smooth price action',
      'Volume confirms price movements'
    ],
    relatedTopics: ['candlestick-patterns', 'indicators', 'trend-identification'],
    exampleScenarios: [
      'Price bouncing off support multiple times',
      'Moving average crossovers as trend signals',
      'Breakouts on increased volume'
    ]
  },
  {
    id: 'market-regimes',
    title: 'Trading Different Market Regimes',
    category: 'strategy',
    difficulty: 'advanced',
    content: `Markets shift between trending and ranging environments. Strategies that work in one regime
fail in another. Successful traders adapt to current conditions.`,
    keyPoints: [
      'Trending markets: follow the trend',
      'Ranging markets: trade mean reversion',
      'High volatility: reduce position size',
      'Low volatility: adjust take profit expectations'
    ],
    relatedTopics: ['volatility', 'trend-identification', 'mean-reversion'],
    exampleScenarios: [
      'Trend-following in bull/bear markets',
      'Support/resistance trades in sideways markets',
      'Breakout strategies during consolidation'
    ]
  },
  {
    id: 'trade-journal',
    title: 'Keeping a Trading Journal',
    category: 'psychology',
    difficulty: 'beginner',
    content: `A trading journal is your most important tool. It reveals patterns in your trading, shows what works,
and exposes emotional biases. Review it weekly to improve.`,
    keyPoints: [
      'Record every trade: entry, exit, reasoning',
      'Note emotional state and rule violations',
      'Track win rate and risk-reward ratios',
      'Identify patterns in losses'
    ],
    relatedTopics: ['trading-psychology', 'performance-tracking'],
    exampleScenarios: [
      'Pattern: losing trades when trading tired',
      'Best trades occur with clear setup confluences',
      'Revenge trading kills monthly returns'
    ]
  },
  {
    id: 'paper-trading',
    title: 'Paper Trading and Skill Development',
    category: 'strategy',
    difficulty: 'beginner',
    content: `Paper trading allows risk-free practice with real market conditions. It builds skills without capital risk.
Use it to validate strategies before risking real money.`,
    keyPoints: [
      'Paper trading reveals execution timing issues',
      'It builds discipline without fear',
      'Don\'t use it as an excuse to avoid real trading',
      'Apply same position sizing as real trading'
    ],
    relatedTopics: ['trading-psychology', 'backtesting'],
    exampleScenarios: [
      'Test new strategy for 30 days before live trading',
      'Practice entry and exit timing',
      'Build confidence in your setup identification'
    ]
  }
];

/**
 * Search education base for relevant resources
 */
export function searchEducation(query: string): EducationResource[] {
  const lowerQuery = query.toLowerCase();
  return tradingEducationBase.filter(resource =>
    resource.title.toLowerCase().includes(lowerQuery) ||
    resource.content.toLowerCase().includes(lowerQuery) ||
    resource.keyPoints.some(point => point.toLowerCase().includes(lowerQuery)) ||
    resource.relatedTopics.some(topic => topic.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get resources by category
 */
export function getResourcesByCategory(category: EducationResource['category']): EducationResource[] {
  return tradingEducationBase.filter(r => r.category === category);
}

/**
 * Get resources by difficulty level
 */
export function getResourcesByDifficulty(difficulty: EducationResource['difficulty']): EducationResource[] {
  return tradingEducationBase.filter(r => r.difficulty === difficulty);
}

/**
 * Format education resource for AI context
 */
export function formatEducationContext(resources: EducationResource[]): string {
  if (resources.length === 0) return '';

  return resources
    .map(r => `📚 ${r.title} (${r.difficulty})\n${r.content}\n\nKey Points: ${r.keyPoints.join('; ')}`)
    .join('\n\n---\n\n');
}
