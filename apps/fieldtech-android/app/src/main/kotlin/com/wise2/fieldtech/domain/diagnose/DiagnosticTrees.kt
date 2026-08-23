package com.wise2.fieldtech.domain.diagnose

import com.wise2.fieldtech.domain.model.DiagnosticCategory
import com.wise2.fieldtech.domain.model.DiagnosticStep
import com.wise2.fieldtech.domain.model.DiagnosticTree

/**
 * Guided troubleshooting trees (spec §11). NO_COOLING is fully modeled after the spec's
 * worked example. Remaining categories ship a real, usable but intentionally shorter
 * generic power → component → analyze flow — extend per-category as field data comes in.
 * These are troubleshooting sequences, not equipment specifications, so no fabricated
 * part numbers or ratings appear here.
 */
object DiagnosticTrees {

    private val noCooling = DiagnosticTree(
        category = DiagnosticCategory.NO_COOLING,
        title = "No Cooling",
        startStepId = "power",
        steps = listOf(
            DiagnosticStep("power", "Power present at the unit disconnect?", "control_voltage", "fail_power"),
            DiagnosticStep("fail_power", "", null, null, isTerminal = true, terminalFinding = "No power at disconnect. Verify breaker, disconnect, and line-side wiring before proceeding."),
            DiagnosticStep("control_voltage", "24 VAC present between R and C at the board?", "cooling_call", "fail_control_voltage"),
            DiagnosticStep("fail_control_voltage", "", null, null, isTerminal = true, terminalFinding = "No 24 VAC R-C. Check transformer, low-voltage fuse, and control wiring."),
            DiagnosticStep("cooling_call", "Cooling call present at the thermostat/controller?", "y_energized", "fail_cooling_call"),
            DiagnosticStep("fail_cooling_call", "", null, null, isTerminal = true, terminalFinding = "No cooling call. Check thermostat setpoint, mode, and control wiring/battery."),
            DiagnosticStep("y_energized", "Y energized at the board when a cooling call is present?", "contactor_energized", "fail_y_energized"),
            DiagnosticStep("fail_y_energized", "", null, null, isTerminal = true, terminalFinding = "Y not energized despite an active cooling call. Likely a control board, safety interlock, or wiring fault between thermostat and board."),
            DiagnosticStep("contactor_energized", "Contactor coil energized when Y is present?", "compressor_running", "fail_contactor"),
            DiagnosticStep("fail_contactor", "", null, null, isTerminal = true, terminalFinding = "Contactor coil not energized. Check contactor coil, low-voltage wiring to the outdoor unit, and any safety switches (pressure switches, float switches) in that circuit."),
            DiagnosticStep("compressor_running", "Compressor running when the contactor is energized?", "analyze_refrigeration", "fail_compressor"),
            DiagnosticStep("fail_compressor", "", null, null, isTerminal = true, terminalFinding = "Contactor energized but compressor not running. Check compressor windings, capacitor, contactor contacts, and line voltage at the compressor."),
            DiagnosticStep("analyze_refrigeration", "", null, null, isTerminal = true, terminalFinding = "Power, controls, and compressor operation confirmed. Analyze the refrigeration circuit using Live Readings (superheat/subcooling) to isolate the fault."),
        ),
    )

    private fun genericTree(category: DiagnosticCategory, title: String): DiagnosticTree = DiagnosticTree(
        category = category,
        title = title,
        startStepId = "power",
        steps = listOf(
            DiagnosticStep("power", "Power present at the unit disconnect?", "component_energized", "fail_power"),
            DiagnosticStep("fail_power", "", null, null, isTerminal = true, terminalFinding = "No power at disconnect. Verify breaker, disconnect, and line-side wiring before proceeding."),
            DiagnosticStep("component_energized", "Relevant component/relay energized when called?", "analyze", "fail_component"),
            DiagnosticStep("fail_component", "", null, null, isTerminal = true, terminalFinding = "Component/relay not energizing on call. Check control wiring, board output, and safety interlocks upstream of the component."),
            DiagnosticStep("analyze", "", null, null, isTerminal = true, terminalFinding = "Power and control circuit confirmed. Use Live Readings and Equipment history to isolate the remaining fault."),
        ),
    )

    val all: Map<DiagnosticCategory, DiagnosticTree> = buildMap {
        put(DiagnosticCategory.NO_COOLING, noCooling)
        put(DiagnosticCategory.NO_HEATING, genericTree(DiagnosticCategory.NO_HEATING, "No Heating"))
        put(DiagnosticCategory.NO_AIRFLOW, genericTree(DiagnosticCategory.NO_AIRFLOW, "No Airflow"))
        put(DiagnosticCategory.COMPRESSOR_NOT_RUNNING, genericTree(DiagnosticCategory.COMPRESSOR_NOT_RUNNING, "Compressor Not Running"))
        put(DiagnosticCategory.INDOOR_FAN_PROBLEM, genericTree(DiagnosticCategory.INDOOR_FAN_PROBLEM, "Indoor Fan Problem"))
        put(DiagnosticCategory.OUTDOOR_FAN_PROBLEM, genericTree(DiagnosticCategory.OUTDOOR_FAN_PROBLEM, "Outdoor Fan Problem"))
        put(DiagnosticCategory.HIGH_HEAD_PRESSURE, genericTree(DiagnosticCategory.HIGH_HEAD_PRESSURE, "High Head Pressure"))
        put(DiagnosticCategory.LOW_SUCTION_PRESSURE, genericTree(DiagnosticCategory.LOW_SUCTION_PRESSURE, "Low Suction Pressure"))
        put(DiagnosticCategory.ELECTRICAL_FAULT, genericTree(DiagnosticCategory.ELECTRICAL_FAULT, "Electrical Fault"))
        put(DiagnosticCategory.CONTROLS_THERMOSTAT, genericTree(DiagnosticCategory.CONTROLS_THERMOSTAT, "Controls / Thermostat"))
        put(DiagnosticCategory.ECONOMIZER, genericTree(DiagnosticCategory.ECONOMIZER, "Economizer"))
        put(DiagnosticCategory.REFRIGERATION, genericTree(DiagnosticCategory.REFRIGERATION, "Refrigeration"))
        put(DiagnosticCategory.HEAT_PUMP, genericTree(DiagnosticCategory.HEAT_PUMP, "Heat Pump"))
        put(DiagnosticCategory.SENSOR_FAULT, genericTree(DiagnosticCategory.SENSOR_FAULT, "Sensor Fault"))
        put(DiagnosticCategory.INTERMITTENT_FAILURE, genericTree(DiagnosticCategory.INTERMITTENT_FAILURE, "Intermittent Failure"))
    }
}
