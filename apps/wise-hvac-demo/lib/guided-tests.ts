export type GuidedTestCategory = 'refrigeration' | 'airflow' | 'electrical' | 'controls';
export type GuidedTestResult = 'pass' | 'fail' | 'indeterminate';

export interface GuidedTestDefinition {
  id: string;
  category: GuidedTestCategory;
  name: string;
  test: string;
  why: string;
  tools: string;
  placement: string;
  expected: string;
  safety: string;
  measurementKeys: string[];
}

export interface GuidedTestRecord {
  testId: string;
  actual: string;
  result: GuidedTestResult | '';
  notes: string;
  savedAt: string;
}

export const GUIDED_TESTS: GuidedTestDefinition[] = [
  {
    id: 'tesp',
    category: 'airflow',
    name: 'Total external static pressure',
    test: 'Measure Total External Static Pressure',
    why: 'Temperature and refrigeration readings can look like a charge problem when the coil or filter is restricting airflow.',
    tools: 'Digital manometer',
    placement: 'Return side before the blower and supply side after the coil, as appropriate for the equipment.',
    expected: 'Compare measured TESP against the manufacturer/design limit for this unit. Do not use a generic “normal” number as truth.',
    safety: 'Lock out blower power before drilling or inserting probes. Watch rotating equipment.',
    measurementKeys: ['return_static', 'supply_static', 'tesp'],
  },
  {
    id: 'filter',
    category: 'airflow',
    name: 'Filter restriction',
    test: 'Inspect filter and measure return static drop',
    why: 'A loaded filter raises return static and can collapse evaporator temperatures without a refrigerant fault.',
    tools: 'Manometer, flashlight',
    placement: 'Filter rack / return drop before the blower.',
    expected: 'Filter should be the specified size and not collapsed. Return static should drop after a verified clean filter.',
    safety: 'Stop the blower before pulling a filter on a running system if the OEM requires it.',
    measurementKeys: ['return_static'],
  },
  {
    id: 'sh-sc',
    category: 'refrigeration',
    name: 'Superheat / subcooling',
    test: 'Record superheat and subcooling from stabilized pressures and line temperatures',
    why: 'Charge and restriction conclusions require both pressure and line temperature, plus known refrigerant.',
    tools: 'Low-side and high-side gauges, pipe clamps',
    placement: 'Suction service port + suction line; liquid service port + liquid line leaving the condenser.',
    expected: 'Use the OEM charging method (TXV subcooling, piston superheat, or weigh-in). Do not apply another brand\'s target.',
    safety: 'Wear eye protection. Recover and charge only if licensed and required by regulation.',
    measurementKeys: ['suction_pressure', 'liquid_pressure', 'suction_line_temp', 'liquid_line_temp', 'superheat', 'subcooling'],
  },
  {
    id: 'restriction',
    category: 'refrigeration',
    name: 'Restriction pattern',
    test: 'Compare liquid line temperature drop across drier / metering device',
    why: 'A large liquid-line temperature drop with high head and low subcooling can support a restriction hypothesis.',
    tools: 'Pipe clamps, gauges',
    placement: 'Liquid line before and after the filter drier when accessible.',
    expected: 'A restricted drier often shows a measurable temperature drop and possible frosting. Confirm before opening the sealed system.',
    safety: 'Recover refrigerant before opening the circuit. Do not puncture a pressurized drier.',
    measurementKeys: ['liquid_pressure', 'liquid_line_temp', 'subcooling'],
  },
  {
    id: 'incoming-voltage',
    category: 'electrical',
    name: 'Incoming voltage',
    test: 'Measure line voltage at the unit disconnect and contactor line side',
    why: 'Low or imbalanced voltage can mimic capacitor and compressor faults.',
    tools: 'True-RMS multimeter, rated leads',
    placement: 'Line side of the disconnect, then load side with the unit calling.',
    expected: 'Stay within the equipment nameplate voltage range. Record L1-L2 (and L3 if three-phase).',
    safety: 'Live electrical work. Use PPE and one-hand technique. Software does not replace lockout/tagout.',
    measurementKeys: ['line_voltage', 'load_voltage'],
  },
  {
    id: 'capacitor',
    category: 'electrical',
    name: 'Capacitor',
    test: 'Measure run capacitor microfarads against the nameplate rating',
    why: 'A weak capacitor is a common no-start / hum condition and must be proven before condemning a compressor.',
    tools: 'Capacitance meter or meter with µF function',
    placement: 'Capacitor terminals after power is verified off and the capacitor is discharged.',
    expected: 'Typically within ±6% of the nameplate µF unless the OEM specifies otherwise. Record the actual rating from the part/nameplate.',
    safety: 'Disconnect power, verify zero volts, and discharge the capacitor before removing wires.',
    measurementKeys: ['capacitance'],
  },
  {
    id: 'contactor',
    category: 'electrical',
    name: 'Contactor',
    test: 'Check coil voltage, contact drop, and pitting',
    why: 'Voltage drop across contacts under load overheats compressors and fans.',
    tools: 'Multimeter',
    placement: 'Coil terminals and line-to-load across each pole while the unit is calling.',
    expected: 'Coil should receive rated control voltage. Contact drop should be negligible; pitted contacts fail inspection.',
    safety: 'Covered live parts. Do not bypass safeties to force a call.',
    measurementKeys: ['control_voltage', 'load_voltage'],
  },
  {
    id: 'thermostat',
    category: 'controls',
    name: 'Thermostat call',
    test: 'Confirm thermostat call and 24V at Y/G/W at the equipment',
    why: 'A missing call is not a refrigeration fault.',
    tools: 'Multimeter, thermostat',
    placement: 'Control board thermostat terminals.',
    expected: 'A cooling call should present control voltage on Y (and G as designed) at the indoor board.',
    safety: 'Do not short R to C. Avoid grounding control circuits on gas furnaces.',
    measurementKeys: ['control_voltage'],
  },
];

export function getGuidedTest(id: string): GuidedTestDefinition | undefined {
  return GUIDED_TESTS.find((item) => item.id === id);
}

export function testsForCategory(category: GuidedTestCategory): GuidedTestDefinition[] {
  return GUIDED_TESTS.filter((item) => item.category === category);
}
