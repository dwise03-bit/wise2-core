package com.wise2.fieldtech.ui.screens.diagnose

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.wise2.fieldtech.domain.model.TestResult
import com.wise2.fieldtech.ui.theme.ElectricBlue
import com.wise2.fieldtech.ui.theme.StatusGreen
import com.wise2.fieldtech.ui.theme.StatusRed

private val Cockpit = Color(0xFF05090D)
private val Panel = Color(0xFF0A1118)
private val Orange = Color(0xFFFFA000)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DiagnoseScreen(viewModel: DiagnoseViewModel, onBack: () -> Unit, onFinished: () -> Unit) {
    val session by viewModel.session.collectAsState()
    var note by remember { mutableStateOf("") }
    val current = session

    Scaffold(containerColor = Cockpit, topBar = {
        TopAppBar(
            colors = TopAppBarDefaults.topAppBarColors(containerColor = Cockpit, titleContentColor = Color.White),
            title = { Column { Text("WISE² DIAGNOSTICS", fontWeight = FontWeight.Bold); Text("REAL DATA → DIAGNOSIS → ACTION", style = MaterialTheme.typography.labelSmall, color = ElectricBlue) } },
            navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = Color.White) } },
        )
    }) { padding ->
        LazyColumn(Modifier.padding(padding).fillMaxSize().background(Cockpit), contentPadding = PaddingValues(12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            item { StatusHeader() }
            item { LiveSystemPanel() }
            item { ImpPanel() }

            if (current == null) {
                item { SectionTitle("GUIDED DIAG") }
                items(viewModel.categories.size) { index ->
                    val category = viewModel.categories[index]
                    CockpitCard {
                        Text(category.name.replace('_', ' '), color = Color.White, fontWeight = FontWeight.Bold)
                        Spacer(Modifier.height(8.dp))
                        Button(onClick = { viewModel.startCategory(category) }, modifier = Modifier.fillMaxWidth()) { Text("START TEST") }
                    }
                }
            } else if (current.isComplete) {
                item {
                    CockpitCard {
                        SectionTitle("DIAGNOSTIC FINDING")
                        Text(current.finalFinding ?: "No finding recorded", color = Color.White)
                        Spacer(Modifier.height(8.dp))
                        Text("Decision support only until confirmed by direct measurement.", color = Orange)
                        Spacer(Modifier.height(12.dp))
                        Button(onClick = onFinished, modifier = Modifier.fillMaxWidth()) { Text("CONTINUE TO SERVICE NOTE") }
                    }
                }
            } else {
                val step = viewModel.currentStep(current)
                item {
                    CockpitCard {
                        SectionTitle("NEXT BEST TEST • STEP ${current.results.size + 1}")
                        Text(step.prompt, color = Color.White, style = MaterialTheme.typography.titleLarge)
                        Spacer(Modifier.height(10.dp))
                        OutlinedTextField(value = note, onValueChange = { note = it }, label = { Text("Technician observation") }, modifier = Modifier.fillMaxWidth())
                        Spacer(Modifier.height(10.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(onClick = { viewModel.record(current, TestResult.PASS, note); note = "" }, colors = ButtonDefaults.buttonColors(containerColor = StatusGreen), modifier = Modifier.weight(1f)) { Text("PASS") }
                            Button(onClick = { viewModel.record(current, TestResult.FAIL, note); note = "" }, colors = ButtonDefaults.buttonColors(containerColor = StatusRed), modifier = Modifier.weight(1f)) { Text("FAIL") }
                        }
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedButton(onClick = { viewModel.record(current, TestResult.SKIPPED, note); note = "" }, modifier = Modifier.weight(1f)) { Text("SKIP") }
                            OutlinedButton(onClick = { viewModel.record(current, TestResult.NOT_APPLICABLE, note); note = "" }, modifier = Modifier.weight(1f)) { Text("N/A") }
                        }
                    }
                }
            }
            item { Text("Measured • Derived • AI inference are kept separate. Missing sensor data stays MISSING.", color = Color.Gray, style = MaterialTheme.typography.labelMedium) }
        }
    }
}

@Composable private fun StatusHeader() = CockpitCard {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
        Column { Text("FIELD DIAGNOSTIC", color = Color.White, fontWeight = FontWeight.Bold); Text("LIVE SYSTEM", color = ElectricBlue) }
        Surface(color = Color(0xFF102414), shape = RoundedCornerShape(8.dp)) { Text("● READINGS STABLE", color = StatusGreen, modifier = Modifier.padding(8.dp), style = MaterialTheme.typography.labelMedium) }
    }
}

@Composable private fun LiveSystemPanel() = CockpitCard {
    SectionTitle("LIVE SYSTEM")
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Meter("SUCTION", "LIVE", "PSI", ElectricBlue, Modifier.weight(1f))
        Meter("LIQUID", "LIVE", "PSI", StatusRed, Modifier.weight(1f))
    }
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Meter("SUPERHEAT", "DERIVED", "°F", Orange, Modifier.weight(1f))
        Meter("SUBCOOLING", "DERIVED", "°F", ElectricBlue, Modifier.weight(1f))
    }
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Meter("DELTA-T", "MISSING", "°F", StatusGreen, Modifier.weight(1f))
        Meter("TOTAL STATIC", "MISSING", "inWC", Orange, Modifier.weight(1f))
    }
}

@Composable private fun ImpPanel() = CockpitCard {
    SectionTitle("WISE² IMP")
    Text("SYSTEM ASSESSMENT", color = ElectricBlue, style = MaterialTheme.typography.labelMedium)
    Text("Waiting for sufficient measured evidence", color = Orange, fontWeight = FontWeight.Bold)
    Spacer(Modifier.height(8.dp))
    Text("EVIDENCE STRENGTH", color = ElectricBlue, style = MaterialTheme.typography.labelSmall)
    Text("MISSING — connect tools or complete guided tests", color = Color.White)
    Spacer(Modifier.height(10.dp))
    SectionTitle("NEXT BEST TEST")
    Text("WISE² will prioritize the next measurement after evidence is available.", color = Color.LightGray)
}

@Composable private fun Meter(label: String, value: String, unit: String, accent: Color, modifier: Modifier = Modifier) {
    Surface(modifier = modifier, color = Color(0xFF070C11), shape = RoundedCornerShape(8.dp), border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF20303D))) {
        Column(Modifier.padding(10.dp)) { Text(label, color = accent, style = MaterialTheme.typography.labelMedium); Text(value, color = Color.White, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Light); Text(unit, color = Color.Gray, style = MaterialTheme.typography.labelSmall) }
    }
}

@Composable private fun CockpitCard(content: @Composable ColumnScope.() -> Unit) {
    Surface(color = Panel, shape = RoundedCornerShape(10.dp), border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1B2B38))) { Column(Modifier.fillMaxWidth().padding(12.dp), content = content) }
}

@Composable private fun SectionTitle(text: String) { Text(text, color = ElectricBlue, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleMedium) }
